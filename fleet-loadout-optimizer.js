
const HD_FO_PRIORITY=['高速化','対潜','対地','制空','防空','索敵','電探','夜戦','煙幕','輸送'];
const HD_FO_MODE_KEY='harbordesk-fleet-optimizer-mode-v1';
const HD_FO_MODES={
 stable:{id:'stable',label:'安定重視',note:'海域条件の充足を最優先',priority:['高速化','対潜','防空','制空','索敵','電探','煙幕','対地','夜戦','輸送'],conditionWeight:1.15,offenseWeight:.12,protectWeight:.12,rareWeight:.03,maxChanges:8,minNet:0},
 firepower:{id:'firepower',label:'火力重視',note:'主砲・魚雷・攻撃力をなるべく維持',priority:['対地','夜戦','制空','索敵','電探','高速化','対潜','防空','煙幕','輸送'],conditionWeight:.88,offenseWeight:.9,protectWeight:.34,rareWeight:.03,maxChanges:6,minNet:0},
 route:{id:'route',label:'道中突破重視',note:'高速化・対潜・防空・煙幕を優先',priority:['高速化','対潜','防空','煙幕','電探','索敵','制空','夜戦','対地','輸送'],conditionWeight:1.2,offenseWeight:.08,protectWeight:.08,rareWeight:.03,maxChanges:8,minNet:0},
 boss:{id:'boss',label:'ボス重視',note:'対地・夜戦・制空を優先',priority:['対地','夜戦','制空','索敵','電探','高速化','防空','対潜','煙幕','輸送'],conditionWeight:1.02,offenseWeight:.48,protectWeight:.14,rareWeight:.03,maxChanges:8,minNet:0},
 reserve:{id:'reserve',label:'装備温存',note:'交換回数と高改修・希少装備の使用を抑える',priority:['高速化','索敵','電探','対潜','防空','制空','対地','夜戦','煙幕','輸送'],conditionWeight:.92,offenseWeight:.22,protectWeight:.22,rareWeight:.75,maxChanges:3,minNet:6}
};

function hdFOEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdFOClone(v){return JSON.parse(JSON.stringify(v))}
function hdFOMode(id){return HD_FO_MODES[id]||HD_FO_MODES.stable}
function hdFOStoredMode(){try{return localStorage.getItem(HD_FO_MODE_KEY)||'stable'}catch{return 'stable'}}
function hdFOSetStoredMode(id){try{localStorage.setItem(HD_FO_MODE_KEY,hdFOMode(id).id)}catch{}}
function hdFOCombatScore(e){
 const s=e&&e.stats||{};
 return (Number(s.火力)||0)*1.2+(Number(s.雷装)||0)*1.1+(Number(s.爆装)||0)+(Number(s.対空)||0)*.18+(Number(s.命中)||0)*.25;
}
function hdFORarePenalty(candidate){
 if(!candidate)return 0;
 const count=Math.max(1,Number(candidate.count)||1),star=Math.max(0,Number(candidate.maxStar)||0);
 return star*2+(count===1?22:count===2?10:count===3?4:0);
}
function hdFOItemMeta(item){
 const meta=typeof hdFEFind==='function'?hdFEFind(item&&item.name):null;
 return meta||{name:item&&item.name||'',category:item&&item.category||'',stats:{},tags:[]};
}
function hdFOAssignedUsage(plan){
 const used={};for(const s of plan&&plan.ships||[])for(const x of s.items||[])used[x.name]=(used[x.name]||0)+1;return used;
}
function hdFORefreshUsage(plan){
 const inv=typeof hdFLInventory==='function'?hdFLInventory():new Map(),used=hdFOAssignedUsage(plan),owned={};
 for(const x of inv.values())owned[x.name]=x.count;
 plan.used=used;plan.owned=owned;return plan;
}
function hdFOReqScore(e,mode){
 if(!e)return -9999;
 const cfg=hdFOMode(mode),priority=cfg.priority||HD_FO_PRIORITY;let score=0;
 for(const r of e.requirements||[]){
  const min=Math.max(1,Number(r.minCount)||1),ratio=Math.min(1,(Number(r.count)||0)/min);
  const pos=priority.indexOf(r.kind),weight=pos<0?1:Math.max(.72,1.22-pos*.045);
  score+=ratio*100*weight;
  if(r.status==='ready')score+=30*weight;else if(r.status==='partial')score+=10*weight;else score-=10*weight;
 }
 return score;
}
function hdFOItemMatches(kind,item){
 const meta=hdFOItemMeta(item),name=item&&item.name||meta.name,tags=meta.tags||[],cat=meta.category||'';
 if(kind==='高速化'){const turbine=/タービン/.test(name)||tags.some(function(t){return String(t).includes('タービン')});const can=!turbine&&(/缶$/.test(name)||tags.some(function(t){return String(t).includes('缶')}));return turbine||can}
 if(kind==='対潜')return (Number(meta.stats&&meta.stats.対潜)||0)>0||tags.some(function(t){return /対潜|ソナー|爆雷/.test(String(t))})||/ソナー|爆雷/.test(cat);
 if(kind==='制空')return typeof HD_FE_AIR_CATS!=='undefined'&&HD_FE_AIR_CATS.has(cat)&&((Number(meta.stats&&meta.stats.対空)||0)>0||tags.some(function(t){return /制空|艦戦|水戦/.test(String(t))}));
 if(kind==='防空')return tags.some(function(t){return /防空|対空CI|高角砲|噴進/.test(String(t))})||/高角砲|対空電探|対空機銃/.test(cat);
 if(kind==='対地')return tags.some(function(t){return /対地|集積地|上陸/.test(String(t))})||/上陸用舟艇|特型内火艇|対地装備|対空強化弾/.test(cat);
 if(kind==='索敵')return (Number(meta.stats&&meta.stats.索敵)||0)>0||tags.some(function(t){return /索敵|電探|水偵|艦偵/.test(String(t))});
 if(kind==='夜戦')return tags.some(function(t){return /夜戦|魚雷CI|夜偵/.test(String(t))})||/探照灯|照明弾|水上艦要員/.test(cat);
 if(kind==='輸送')return tags.some(function(t){return /輸送/.test(String(t))})||/上陸用舟艇|特型内火艇/.test(cat);
 if(kind==='電探')return /電探/.test(cat)||tags.some(function(t){return /電探/.test(String(t))});
 if(kind==='煙幕')return /煙幕/.test(name)||tags.some(function(t){return /煙幕/.test(String(t))});
 return false;
}
function hdFOCandidateRows(kind,mode){
 const inv=typeof hdFLInventory==='function'?hdFLInventory():new Map();
 const cfg=hdFOMode(mode);
 return [...inv.values()].filter(function(x){return x.count>0&&hdFOItemMatches(kind,{name:x.name,category:x.item&&x.item.category||''})}).sort(function(a,b){
  const as=typeof hdFLScoreBase==='function'?hdFLScoreBase(a.item,a):0,bs=typeof hdFLScoreBase==='function'?hdFLScoreBase(b.item,b):0;
  if(cfg.id==='reserve')return (a.maxStar-b.maxStar)||(b.count-a.count)||(as-bs)||a.name.localeCompare(b.name,'ja');
  return bs-as||b.maxStar-a.maxStar||a.name.localeCompare(b.name,'ja');
 });
}
function hdFOCanUse(plan,candidate,shipIndex,itemIndex){
 const usage=hdFOAssignedUsage(plan),removed=plan.ships&&plan.ships[shipIndex]&&plan.ships[shipIndex].items&&plan.ships[shipIndex].items[itemIndex];
 const used=usage[candidate.name]||0,returned=removed&&removed.name===candidate.name?1:0;
 return used-returned<candidate.count;
}
function hdFOCompatible(plan,candidate,shipIndex){
 const slot=plan.suggestion&&plan.suggestion.slots&&plan.suggestion.slots[shipIndex],meta=candidate.item||candidate;
 return !slot||typeof hdFLCompatible!=='function'||hdFLCompatible(meta,slot);
}
function hdFOProtectedPenalty(item){
 const kind=item&&item.kind||'',meta=hdFOItemMeta(item);let p=0;
 if(['smallGun','mediumGun','smallMediumGun','largeGun','airAttack'].includes(kind))p+=12;
 if(['fighter','recon','ap'].includes(kind))p+=7;
 if((Number(meta.stats&&meta.stats.火力)||0)+(Number(meta.stats&&meta.stats.雷装)||0)+(Number(meta.stats&&meta.stats.爆装)||0)>8)p+=5;
 return p;
}
function hdFOCoverage(plan){
 const e=typeof hdFEEvaluate==='function'?hdFEEvaluate(plan):null,map={};
 for(const r of e&&e.requirements||[])map[r.kind]=Object.assign({},r);
 return {evaluation:e,map:map};
}
function hdFOBestSwap(plan,focusKind,mode){
 const cfg=hdFOMode(mode),before=hdFOCoverage(plan),baseScore=hdFOReqScore(before.evaluation,cfg.id),baseCombat=hdFOCombatScore(before.evaluation),candidates=hdFOCandidateRows(focusKind,cfg.id);let best=null;
 for(const cand of candidates){
  for(let si=0;si<(plan.ships||[]).length;si++){
   const ship=plan.ships[si];if(!ship||!ship.ship||!hdFOCompatible(plan,cand,si))continue;
   for(let ii=0;ii<(ship.items||[]).length;ii++){
    const old=ship.items[ii];if(old&&old.name===cand.name||!hdFOCanUse(plan,cand,si,ii))continue;
    const trial=hdFOClone(plan);
    trial.ships[si].items[ii]={name:cand.name,star:cand.maxStar||0,category:cand.item&&cand.item.category||'',kind:old&&old.kind||'utility'};
    hdFORefreshUsage(trial);
    const after=hdFOCoverage(trial),afterScore=hdFOReqScore(after.evaluation,cfg.id),afterCombat=hdFOCombatScore(after.evaluation),focusBefore=before.map[focusKind],focusAfter=after.map[focusKind];
    if(!focusBefore||!focusAfter)continue;
    const focusDelta=(Number(focusAfter.count)||0)-(Number(focusBefore.count)||0);
    const statusGain=(focusAfter.status==='ready'?2:focusAfter.status==='partial'?1:0)-(focusBefore.status==='ready'?2:focusBefore.status==='partial'?1:0);
    if(focusDelta<=0&&statusGain<=0)continue;
    const conditionGain=(afterScore-baseScore)*cfg.conditionWeight,combatGain=(afterCombat-baseCombat)*cfg.offenseWeight;
    const net=conditionGain+combatGain-hdFOProtectedPenalty(old)*cfg.protectWeight-hdFORarePenalty(cand)*cfg.rareWeight;
    if(net<=cfg.minNet)continue;
    const row={trial:trial,net:net,focusDelta:focusDelta,statusGain:statusGain,shipIndex:si,itemIndex:ii,ship:ship.ship,old:old&&old.name||'',next:cand.name,kind:focusKind,before:focusBefore,after:focusAfter};
    if(!best||row.net>best.net||(row.net===best.net&&row.statusGain>best.statusGain))best=row;
   }
  }
 }
 return best;
}
function hdFOOptimize(plan,mode,maxChanges){
 if(typeof mode==='number'){maxChanges=mode;mode='stable'}
 const cfg=hdFOMode(mode||'stable');maxChanges=maxChanges||cfg.maxChanges||8;
 const out=hdFOClone(plan);hdFORefreshUsage(out);
 const before=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null,changes=[];
 for(let pass=0;pass<maxChanges;pass++){
  const current=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null;
  const needs=(current&&current.requirements||[]).filter(function(r){return r.status!=='ready'}).sort(function(a,b){
   const ai=cfg.priority.indexOf(a.kind),bi=cfg.priority.indexOf(b.kind);
   return (ai<0?99:ai)-(bi<0?99:bi)||(a.status==='missing'?-1:1);
  });
  if(!needs.length)break;
  let chosen=null;
  for(const req of needs){const swap=hdFOBestSwap(out,req.kind,cfg.id);if(swap){chosen=swap;break}}
  if(!chosen)break;
  out.ships=chosen.trial.ships;hdFORefreshUsage(out);
  changes.push({ship:chosen.ship,from:chosen.old,to:chosen.next,kind:chosen.kind,before:chosen.before.count,after:chosen.after.count,statusBefore:chosen.before.status,statusAfter:chosen.after.status});
 }
 const after=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null;
 out.optimization={strategy:cfg.id,strategyLabel:cfg.label,before:before,after:after,changes:changes,unresolved:(after&&after.requirements||[]).filter(function(r){return r.status!=='ready'}).map(function(r){return {kind:r.kind,label:r.label,status:r.status,count:r.count,minCount:r.minCount}})};
 out.optimizedAt=Date.now();return out;
}
function hdFOStatusText(e){return e?'配置あり '+e.ready+'/'+e.requirements.length+'｜一部 '+e.partial+'｜未配置 '+e.missing:'評価なし'}
function hdFOStandardPlan(index){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index,current=(typeof HD_FL_CACHE!=='undefined'&&HD_FL_CACHE[key])||null;
 const fresh=typeof hdFLGenerate==='function'?hdFLGenerate(index):null;if(!fresh)return null;
 const base=hdFOClone(fresh);
 if(typeof HD_FL_CACHE!=='undefined'){if(current)HD_FL_CACHE[key]=current;else delete HD_FL_CACHE[key]}
 return base;
}
function hdFORareUsage(plan){
 const inv=typeof hdFLInventory==='function'?hdFLInventory():new Map();let slots=0;const names=new Set();
 for(const ship of plan&&plan.ships||[])for(const item of ship.items||[]){
  const key=typeof hdFLNorm==='function'?hdFLNorm(item.name):String(item.name||''),own=inv.get(key);
  if(!own)continue;
  if((Number(own.count)||0)<=2||(Number(item.star)||0)>=6){slots++;names.add(item.name)}
 }
 return {slots:slots,names:[...names]};
}
function hdFOCompare(index){
 const base=hdFOStandardPlan(index);if(!base)return [];
 return Object.keys(HD_FO_MODES).map(function(id){
  const plan=hdFOOptimize(base,id),e=plan.optimization&&plan.optimization.after||hdFEEvaluate(plan),rare=hdFORareUsage(plan);
  return {mode:id,label:hdFOMode(id).label,note:hdFOMode(id).note,plan:plan,ready:e&&e.ready||0,total:e&&e.requirements&&e.requirements.length||0,partial:e&&e.partial||0,missing:e&&e.missing||0,changes:plan.optimization&&plan.optimization.changes.length||0,equipAttack:e&&e.night&&e.night.equipmentAttack||0,rareSlots:rare.slots,rareNames:rare.names,unresolved:plan.optimization&&plan.optimization.unresolved||[]};
 });
}
function hdFOCompareHtml(index,rows){
 return '<div class="hd-fo-compare"><div class="hd-fo-compare-head"><div><strong>5モード比較</strong><span>同じ標準配備から各方針を個別計算</span></div><button type="button" class="ghost small" data-hd-fo-close-compare>閉じる</button></div><div class="hd-fo-compare-grid">'+rows.map(function(x){
  const unresolved=x.unresolved.length?x.unresolved.map(function(r){return hdFOEsc(r.label)+' '+r.count+'/'+r.minCount}).join('、'):'主要要求は配備目安内';
  return '<article class="hd-fo-compare-card" data-hd-fo-compare-card="'+x.mode+'"><div class="hd-fo-compare-card-head"><div><strong>'+hdFOEsc(x.label)+'</strong><small>'+hdFOEsc(x.note)+'</small></div><b>'+x.ready+'/'+x.total+'</b></div><div class="hd-fo-compare-metrics"><span>条件充足 <b>'+x.ready+'/'+x.total+'</b></span><span>未配置 <b>'+x.missing+'</b></span><span>交換 <b>'+x.changes+'</b></span><span>装備 火力+雷装 <b>'+x.equipAttack+'</b></span><span>希少・高改修 <b>'+x.rareSlots+'枠</b></span></div><p>'+unresolved+'</p><button type="button" class="primary small" data-hd-fo-adopt="'+x.mode+'" data-hd-fo-index="'+index+'">この案を採用</button></article>';
 }).join('')+'</div><p class="hd-fo-compare-note">※数値は装備台帳とアプリ内評価式による比較。最終制空値・最終33式・個艦固有の搭載可否などは別途確認してね。</p></div>';
}
function hdFOResultHtml(plan){
 const o=plan.optimization;if(!o)return '';
 const improved=(o.after&&o.after.ready||0)>(o.before&&o.before.ready||0)||(o.after&&o.after.missing||0)<(o.before&&o.before.missing||0);
 let changes='';
 if(o.changes.length)changes='<div class="hd-fo-changes">'+o.changes.map(function(x){return '<div><span>'+hdFOEsc(x.ship)+'</span><strong>'+hdFOEsc(x.from)+' → '+hdFOEsc(x.to)+'</strong><small>'+hdFOEsc(x.kind)+' '+x.before+'→'+x.after+'</small></div>'}).join('')+'</div>';
 let unresolved=o.unresolved.length?'<div class="hd-fo-unresolved"><b>まだ要確認</b><span>'+o.unresolved.map(function(x){return hdFOEsc(x.label)+' '+x.count+'/'+x.minCount}).join('、')+'</span></div>':'<div class="hd-fo-complete">主要な装備要求は配備上の目安を満たしたよ。</div>';
 return '<div class="hd-fo-result '+(improved?'improved':'steady')+'"><div class="hd-fo-head"><div><strong>'+hdFOEsc(o.strategyLabel||'安定重視')+'で自動最適化</strong><span>'+hdFOEsc(hdFOStatusText(o.before))+' → '+hdFOEsc(hdFOStatusText(o.after))+'</span></div><b>'+(o.changes.length?o.changes.length+'件交換':'交換候補なし')+'</b></div>'+changes+unresolved+'</div>';
}
function hdFOInstall(){
 if(window.__hdFleetOptimizerInstalled||typeof hdFEHtml!=='function')return false;
 window.__hdFleetOptimizerInstalled=true;
 const prev=hdFEHtml;
 hdFEHtml=function(plan){
  let html=prev(plan);
  const current=plan.optimization&&plan.optimization.strategy||hdFOStoredMode(),modeOptions=Object.values(HD_FO_MODES).map(function(m){return '<option value="'+m.id+'" '+(m.id===current?'selected':'')+'>'+m.label+'</option>'}).join('');
  const controls='<div class="hd-fo-controls"><label class="hd-fo-mode"><span>最適化方針</span><select data-hd-fo-mode="'+plan.index+'">'+modeOptions+'</select><small>'+hdFOEsc(hdFOMode(current).note)+'</small></label><button type="button" class="primary small" data-hd-fo-optimize="'+plan.index+'">この方針で最適化</button><button type="button" class="ghost small" data-hd-fo-compare="'+plan.index+'">5モードを比較</button>'+(plan.optimization?'<button type="button" class="ghost small" data-hd-fo-reset="'+plan.index+'">標準配備に戻す</button>':'')+'</div><div class="hd-fo-compare-host"></div>';
  return html.replace('<div class="hd-fe-actions">',hdFOResultHtml(plan)+controls+'<div class="hd-fe-actions">');
 };
 return true;
}
function hdFOApply(index,card,mode){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index,cached=(typeof HD_FL_CACHE!=='undefined'&&HD_FL_CACHE[key])||null,base=(cached&&!cached.optimization?cached:hdFLGenerate(index));if(!base||!card)return;
 const selected=hdFOMode(mode||hdFOStoredMode()).id;hdFOSetStoredMode(selected);
 const optimized=hdFOOptimize(base,selected);if(typeof HD_FL_CACHE!=='undefined')HD_FL_CACHE[key]=optimized;
 const host=card.querySelector('.hd-fl-host');if(host)host.innerHTML=hdFLPlanHtml(optimized);
}
function hdFOShowCompare(index,card){
 if(!card)return;const rows=hdFOCompare(index),host=card.querySelector('.hd-fo-compare-host');if(!host)return;
 host.innerHTML=hdFOCompareHtml(index,rows);host.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function hdFOAdopt(index,mode,card){
 const base=hdFOStandardPlan(index);if(!base||!card)return;
 const selected=hdFOMode(mode).id,plan=hdFOOptimize(base,selected),map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index;
 hdFOSetStoredMode(selected);if(typeof HD_FL_CACHE!=='undefined')HD_FL_CACHE[key]=plan;
 const host=card.querySelector('.hd-fl-host');if(host)host.innerHTML=hdFLPlanHtml(plan);
}
function hdFOReset(index,card){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index;if(typeof HD_FL_CACHE!=='undefined')delete HD_FL_CACHE[key];
 if(typeof hdFLRender==='function')hdFLRender(index,card);
}
document.addEventListener('click',function(e){
 const opt=e.target.closest&&e.target.closest('[data-hd-fo-optimize]');if(opt){const card=opt.closest('.hd-fs-card'),sel=card&&card.querySelector('[data-hd-fo-mode="'+opt.dataset.hdFoOptimize+'"]');hdFOApply(opt.dataset.hdFoOptimize,card,sel&&sel.value);return}
 const compare=e.target.closest&&e.target.closest('[data-hd-fo-compare]');if(compare){hdFOShowCompare(compare.dataset.hdFoCompare,compare.closest('.hd-fs-card'));return}
 const adopt=e.target.closest&&e.target.closest('[data-hd-fo-adopt]');if(adopt){hdFOAdopt(adopt.dataset.hdFoIndex,adopt.dataset.hdFoAdopt,adopt.closest('.hd-fs-card'));return}
 if(e.target.closest&&e.target.closest('[data-hd-fo-close-compare]')){const host=e.target.closest('.hd-fo-compare-host');if(host)host.innerHTML='';return}
 const mode=e.target.closest&&e.target.closest('[data-hd-fo-mode]');if(mode){hdFOSetStoredMode(mode.value);const note=mode.parentElement&&mode.parentElement.querySelector('small');if(note)note.textContent=hdFOMode(mode.value).note;return}
 const reset=e.target.closest&&e.target.closest('[data-hd-fo-reset]');if(reset){hdFOReset(reset.dataset.hdFoReset,reset.closest('.hd-fs-card'));return}
});
document.addEventListener('change',function(e){
 const mode=e.target.closest&&e.target.closest('[data-hd-fo-mode]');
 if(!mode)return;
 hdFOSetStoredMode(mode.value);
 const note=mode.parentElement&&mode.parentElement.querySelector('small');if(note)note.textContent=hdFOMode(mode.value).note;
});
window.addEventListener('load',function(){setTimeout(function(){if(!hdFOInstall())setTimeout(hdFOInstall,500)},780)});
hdFOInstall();
