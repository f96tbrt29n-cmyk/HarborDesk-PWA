
const HD_FO_PRIORITY=['高速化','対潜','対地','制空','防空','索敵','電探','夜戦','煙幕','輸送'];

function hdFOEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hdFOClone(v){return JSON.parse(JSON.stringify(v))}
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
function hdFOReqScore(e){
 if(!e)return -9999;
 let score=0;
 for(const r of e.requirements||[]){
  const min=Math.max(1,Number(r.minCount)||1),ratio=Math.min(1,(Number(r.count)||0)/min);
  score+=ratio*100;
  if(r.status==='ready')score+=30;else if(r.status==='partial')score+=10;else score-=10;
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
function hdFOCandidateRows(kind){
 const inv=typeof hdFLInventory==='function'?hdFLInventory():new Map();
 return [...inv.values()].filter(function(x){return x.count>0&&hdFOItemMatches(kind,{name:x.name,category:x.item&&x.item.category||''})}).sort(function(a,b){
  const as=typeof hdFLScoreBase==='function'?hdFLScoreBase(a.item,a):0,bs=typeof hdFLScoreBase==='function'?hdFLScoreBase(b.item,b):0;
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
function hdFOBestSwap(plan,focusKind){
 const before=hdFOCoverage(plan),baseScore=hdFOReqScore(before.evaluation),candidates=hdFOCandidateRows(focusKind);let best=null;
 for(const cand of candidates){
  for(let si=0;si<(plan.ships||[]).length;si++){
   const ship=plan.ships[si];if(!ship||!ship.ship||!hdFOCompatible(plan,cand,si))continue;
   for(let ii=0;ii<(ship.items||[]).length;ii++){
    const old=ship.items[ii];if(old&&old.name===cand.name||!hdFOCanUse(plan,cand,si,ii))continue;
    const trial=hdFOClone(plan);
    trial.ships[si].items[ii]={name:cand.name,star:cand.maxStar||0,category:cand.item&&cand.item.category||'',kind:old&&old.kind||'utility'};
    hdFORefreshUsage(trial);
    const after=hdFOCoverage(trial),afterScore=hdFOReqScore(after.evaluation),focusBefore=before.map[focusKind],focusAfter=after.map[focusKind];
    if(!focusBefore||!focusAfter)continue;
    const focusDelta=(Number(focusAfter.count)||0)-(Number(focusBefore.count)||0);
    const statusGain=(focusAfter.status==='ready'?2:focusAfter.status==='partial'?1:0)-(focusBefore.status==='ready'?2:focusBefore.status==='partial'?1:0);
    if(focusDelta<=0&&statusGain<=0)continue;
    const net=afterScore-baseScore-hdFOProtectedPenalty(old)*.12;
    if(net<=0)continue;
    const row={trial:trial,net:net,focusDelta:focusDelta,statusGain:statusGain,shipIndex:si,itemIndex:ii,ship:ship.ship,old:old&&old.name||'',next:cand.name,kind:focusKind,before:focusBefore,after:focusAfter};
    if(!best||row.net>best.net||(row.net===best.net&&row.statusGain>best.statusGain))best=row;
   }
  }
 }
 return best;
}
function hdFOOptimize(plan,maxChanges){
 maxChanges=maxChanges||8;
 const out=hdFOClone(plan);hdFORefreshUsage(out);
 const before=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null,changes=[];
 for(let pass=0;pass<maxChanges;pass++){
  const current=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null;
  const needs=(current&&current.requirements||[]).filter(function(r){return r.status!=='ready'}).sort(function(a,b){
   const ai=HD_FO_PRIORITY.indexOf(a.kind),bi=HD_FO_PRIORITY.indexOf(b.kind);
   return (ai<0?99:ai)-(bi<0?99:bi)||(a.status==='missing'?-1:1);
  });
  if(!needs.length)break;
  let chosen=null;
  for(const req of needs){const swap=hdFOBestSwap(out,req.kind);if(swap){chosen=swap;break}}
  if(!chosen)break;
  out.ships=chosen.trial.ships;hdFORefreshUsage(out);
  changes.push({ship:chosen.ship,from:chosen.old,to:chosen.next,kind:chosen.kind,before:chosen.before.count,after:chosen.after.count,statusBefore:chosen.before.status,statusAfter:chosen.after.status});
 }
 const after=typeof hdFEEvaluate==='function'?hdFEEvaluate(out):null;
 out.optimization={before:before,after:after,changes:changes,unresolved:(after&&after.requirements||[]).filter(function(r){return r.status!=='ready'}).map(function(r){return {kind:r.kind,label:r.label,status:r.status,count:r.count,minCount:r.minCount}})};
 out.optimizedAt=Date.now();return out;
}
function hdFOStatusText(e){return e?'配置あり '+e.ready+'/'+e.requirements.length+'｜一部 '+e.partial+'｜未配置 '+e.missing:'評価なし'}
function hdFOResultHtml(plan){
 const o=plan.optimization;if(!o)return '';
 const improved=(o.after&&o.after.ready||0)>(o.before&&o.before.ready||0)||(o.after&&o.after.missing||0)<(o.before&&o.before.missing||0);
 let changes='';
 if(o.changes.length)changes='<div class="hd-fo-changes">'+o.changes.map(function(x){return '<div><span>'+hdFOEsc(x.ship)+'</span><strong>'+hdFOEsc(x.from)+' → '+hdFOEsc(x.to)+'</strong><small>'+hdFOEsc(x.kind)+' '+x.before+'→'+x.after+'</small></div>'}).join('')+'</div>';
 let unresolved=o.unresolved.length?'<div class="hd-fo-unresolved"><b>まだ要確認</b><span>'+o.unresolved.map(function(x){return hdFOEsc(x.label)+' '+x.count+'/'+x.minCount}).join('、')+'</span></div>':'<div class="hd-fo-complete">主要な装備要求は配備上の目安を満たしたよ。</div>';
 return '<div class="hd-fo-result '+(improved?'improved':'steady')+'"><div class="hd-fo-head"><div><strong>海域条件へ自動最適化</strong><span>'+hdFOEsc(hdFOStatusText(o.before))+' → '+hdFOEsc(hdFOStatusText(o.after))+'</span></div><b>'+(o.changes.length?o.changes.length+'件交換':'交換候補なし')+'</b></div>'+changes+unresolved+'</div>';
}
function hdFOInstall(){
 if(window.__hdFleetOptimizerInstalled||typeof hdFEHtml!=='function')return false;
 window.__hdFleetOptimizerInstalled=true;
 const prev=hdFEHtml;
 hdFEHtml=function(plan){
  let html=prev(plan);
  const controls='<div class="hd-fo-controls"><button type="button" class="primary small" data-hd-fo-optimize="'+plan.index+'">海域条件へ装備を最適化</button>'+(plan.optimization?'<button type="button" class="ghost small" data-hd-fo-reset="'+plan.index+'">標準配備に戻す</button>':'')+'</div>';
  return html.replace('<div class="hd-fe-actions">',hdFOResultHtml(plan)+controls+'<div class="hd-fe-actions">');
 };
 return true;
}
function hdFOApply(index,card){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index,base=(typeof HD_FL_CACHE!=='undefined'&&HD_FL_CACHE[key])||hdFLGenerate(index);if(!base||!card)return;
 const optimized=hdFOOptimize(base);if(typeof HD_FL_CACHE!=='undefined')HD_FL_CACHE[key]=optimized;
 const host=card.querySelector('.hd-fl-host');if(host)host.innerHTML=hdFLPlanHtml(optimized);
}
function hdFOReset(index,card){
 const map=typeof hdFSMap==='function'?hdFSMap():'',key=map+':'+index;if(typeof HD_FL_CACHE!=='undefined')delete HD_FL_CACHE[key];
 if(typeof hdFLRender==='function')hdFLRender(index,card);
}
document.addEventListener('click',function(e){
 const opt=e.target.closest&&e.target.closest('[data-hd-fo-optimize]');if(opt){hdFOApply(opt.dataset.hdFoOptimize,opt.closest('.hd-fs-card'));return}
 const reset=e.target.closest&&e.target.closest('[data-hd-fo-reset]');if(reset){hdFOReset(reset.dataset.hdFoReset,reset.closest('.hd-fs-card'));return}
});
window.addEventListener('load',function(){setTimeout(function(){if(!hdFOInstall())setTimeout(hdFOInstall,500)},780)});
hdFOInstall();
