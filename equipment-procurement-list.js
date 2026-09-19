const HD_PROCUREMENT_KEY='harbordesk-equipment-procurement-v1';

function hdPLLoad(){try{const v=JSON.parse(localStorage.getItem(HD_PROCUREMENT_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function hdPLSave(v){localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify(v));hdPLRender()}
const HD_PL_METHOD_ORDER={develop:1,improve:2,quest:3,other:4,limited:5};
function hdPLMethodMeta(item){
 const m=item&&typeof hdAGMethod==='function'?hdAGMethod(item):{key:'other',label:'入手情報'};
 return {...m,rank:HD_PL_METHOD_ORDER[m.key]||4};
}
function hdPLWantedKind(wanted){
 return typeof hdShipDbAcquisitionKind==='function'?hdShipDbAcquisitionKind(wanted):
  (/艦戦|制空/.test(wanted)?'制空':/艦攻|艦爆/.test(wanted)?'航空火力':/対潜|ソナー|爆雷/.test(wanted)?'対潜':/電探/.test(wanted)?'電探':/魚雷/.test(wanted)?'魚雷':/主砲|砲/.test(wanted)?'主砲':/内火艇|大発|対地|三式弾/.test(wanted)?'対地':'');
}
function hdPLResolveWanted(wanted){
 const cat=typeof hdAGCatalog==='function'?hdAGCatalog():[],norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・'),key=norm(wanted);
 const exact=cat.find(x=>norm(x.name)===key);
 if(exact)return {item:exact,kind:hdPLWantedKind(wanted),exact:true};
 const kind=hdPLWantedKind(wanted),candidates=kind&&typeof hdAGCandidates==='function'?hdAGCandidates(kind):[];
 const missing=candidates.find(x=>(typeof hdAGOwned==='function'?hdAGOwned(x.name).count:0)<=0)||candidates[0]||null;
 return {item:missing,kind,exact:false};
}
function hdPLMergeGearItems(items=[]){
 const m=new Map();
 for(const x of items){
  const key=[x.map,x.target||x.wanted,x.methodKey||'',x.ship||''].join('|'),cur=m.get(key);
  if(cur){cur.needed=(cur.needed||1)+(x.needed||1);cur.requiredTotal=Math.max(Number(cur.requiredTotal)||0,Number(x.requiredTotal)||0);cur.sources=[...new Set([...(cur.sources||[]),...(x.sources||[])])];}
  else m.set(key,{...x,needed:x.needed||1,requiredTotal:Number(x.requiredTotal)||0,sources:[...new Set(x.sources||[])]});
 }
 return [...m.values()].sort((a,b)=>(a.rank||9)-(b.rank||9)||(a.target||a.wanted).localeCompare(b.target||b.wanted,'ja'));
}
function hdPLOwnedCount(name){
 if(!name)return 0;
 if(typeof hdAGOwned==='function')return Math.max(0,Number(hdAGOwned(name)?.count)||0);
 try{
  const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・'),key=norm(name);
  const rows=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');
  return (Array.isArray(rows)?rows:[]).filter(x=>norm(x.name)===key).reduce((s,x)=>s+Math.max(0,Number(x.count)||0),0);
 }catch{return 0}
}
function hdPLDemandRows(items=[]){
 const m=new Map();
 for(const x of items){
  const target=x.target||x.wanted||'',key=[x.map||'',target,x.methodKey||'',x.kind||''].join('|');
  const cur=m.get(key)||{...x,target,needed:0,ships:[],loadouts:[],sources:[]};
  cur.needed+=Math.max(Number(x.needed)||1,Number(x.requiredTotal)||0);
  cur.ships=[...new Set([...cur.ships,x.ship].filter(Boolean))];
  cur.loadouts=[...new Set([...cur.loadouts,x.loadout].filter(Boolean))];
  cur.sources=[...new Set([...(cur.sources||[]),...(x.sources||[])])];
  m.set(key,cur);
 }
 return [...m.values()].map(x=>{
  const needed=Math.max(0,Number(x.needed)||0),owned=x.target?hdPLOwnedCount(x.target):0,shortfall=Math.max(0,needed-owned);
  return {...x,needed,owned,shortfall,status:shortfall===0?'ready':owned>0?'partial':'missing'};
 }).sort((a,b)=>{
  if((a.shortfall===0)!==(b.shortfall===0))return a.shortfall===0?1:-1;
  return (a.rank||9)-(b.rank||9)||(b.shortfall||0)-(a.shortfall||0)||(a.target||a.wanted).localeCompare(b.target||b.wanted,'ja');
 });
}
function hdPLApplyRequiredTotals(added,filledSlots=[]){
 const norm=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/･/g,'・');
 const found=new Map(),missing=new Map();
 for(const slot of filledSlots||[]){if(slot?.found&&slot.name){const k=norm(slot.name);found.set(k,(found.get(k)||0)+1)}}
 for(const x of added||[]){const k=norm(x.target||'');if(k)missing.set(k,(missing.get(k)||0)+(x.needed||1))}
 return (added||[]).map(x=>{const k=norm(x.target||'');return {...x,requiredTotal:k?(found.get(k)||0)+(missing.get(k)||0):0}});
}
function hdPLAddShipLoadout(map,shipName,loadoutName){
 if(!map||typeof HD_SHIP_DATABASE==='undefined'||typeof HD_SHIP_LOADOUTS==='undefined'||typeof hdShipDbResolveOwnedLoadout!=='function')return false;
 const ship=HD_SHIP_DATABASE.find(x=>x.final===shipName||x.base===shipName);if(!ship)return false;
 const sets=HD_SHIP_LOADOUTS[ship.final]||[],set=sets.find(x=>x.name===loadoutName)||sets[0];if(!set)return false;
 const plan=hdShipDbResolveOwnedLoadout(ship,set),missing=plan.slots.filter(x=>!x.found);
 if(!missing.length){alert?.(`${ship.final} の「${set.name}」は手持ち装備で埋められるよ`);return false}
 let added=missing.map(slot=>{
  const r=hdPLResolveWanted(slot.wanted),method=hdPLMethodMeta(r.item);
  return {map,ship:ship.final,loadout:set.name,wanted:slot.wanted,target:r.item?.name||'',kind:r.kind||'',exact:r.exact,methodKey:method.key,methodLabel:method.label,rank:method.rank,needed:1,sources:[ship.final],createdAt:Date.now()};
 });
 added=hdPLApplyRequiredTotals(added,plan.slots);
 const list=hdPLLoad(),old=list.find(x=>x.map===map),base=(old?.gearItems||[]).filter(x=>!(x.ship===ship.final&&x.loadout===set.name)),next={id:old?.id||`pl-${Date.now()}-${Math.random().toString(16).slice(2)}`,map,kinds:old?.kinds||[],gearItems:hdPLMergeGearItems([...base,...added]),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 hdPLSave(old?list.map(x=>x.map===map?next:x):[next,...list]);return true;
}
function hdPLResolveMasterWanted(shipId,wanted){
 const candidates=typeof hdAGMasterCandidates==='function'?hdAGMasterCandidates(shipId,wanted):[],item=candidates[0]||null,kind=hdPLWantedKind(wanted),method=hdPLMethodMeta(item);
 return {item,kind,method};
}
function hdPLAddMasterLoadout(shipId,loadoutName,map=''){
 const row=window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips?.[String(shipId)];if(!row||typeof hdShipDbMasterSuggestedLoadouts!=='function'||typeof hdShipDbMasterResolveOwnedPlan!=='function')return false;
 const set=hdShipDbMasterSuggestedLoadouts(row).find(x=>x.name===loadoutName)||hdShipDbMasterSuggestedLoadouts(row)[0];if(!set)return false;
 const plan=hdShipDbMasterResolveOwnedPlan(row,set),missing=plan.slots.filter(x=>!x.found);
 if(!missing.length){alert?.(`${row.name} の「${set.name}」は手持ち装備で埋められるよ`);return false}
 const sourceMap=map||(typeof selectedMap!=='undefined'&&selectedMap?selectedMap:'艦娘DB');
 let added=missing.map(slot=>{
  const r=hdPLResolveMasterWanted(row.id,slot.wanted),item=r.item,method=r.method;
  return {map:sourceMap,ship:row.name,loadout:set.name,wanted:slot.wanted,target:item?.name||'',kind:r.kind||'',exact:false,methodKey:method.key,methodLabel:method.label,rank:method.rank,needed:1,sources:[row.name],createdAt:Date.now()};
 });
 added=hdPLApplyRequiredTotals(added,plan.slots);
 const list=hdPLLoad(),old=list.find(x=>x.map===sourceMap),base=(old?.gearItems||[]).filter(x=>!(x.ship===row.name&&x.loadout===set.name)),next={id:old?.id||`pl-${Date.now()}-${Math.random().toString(16).slice(2)}`,map:sourceMap,kinds:old?.kinds||[],gearItems:hdPLMergeGearItems([...base,...added]),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 hdPLSave(old?list.map(x=>x.map===sourceMap?next:x):[next,...list]);return true;
}

function hdPLEsc(s){return typeof hdEsc==='function'?hdEsc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function hdPLLabel(kind){return typeof hdAGKindLabel==='function'?hdAGKindLabel(kind):kind}
function hdPLCurrentCheck(map,kind){
 const rows=typeof hdSEChecks==='function'?hdSEChecks(map).rows||[]:[];
 return rows.find(x=>x.kind===kind)||{kind,label:hdPLLabel(kind),status:'missing',count:0,minCount:1,detail:'要確認',hint:''};
}
function hdPLRecommendation(kind){
 const rows=typeof hdAGCandidates==='function'?hdAGCandidates(kind):[];
 const missing=rows.find(x=>(typeof hdAGOwned==='function'?hdAGOwned(x.name).count:0)<=0);
 return missing||rows[0]||null;
}
function hdPLAddMap(map){
 if(!map||typeof hdSEChecks!=='function')return false;
 const checks=(hdSEChecks(map).rows||[]).filter(x=>x.status!=='ready');
 if(!checks.length){alert?.(`${map} は現在の装備台帳では主要装備が準備済みだよ`);return false}
 const list=hdPLLoad(),old=list.find(x=>x.map===map);
 const kinds=[...new Set([...(old?.kinds||[]),...checks.map(x=>x.kind)])];
 const next={id:old?.id||`pl-${Date.now()}-${Math.random().toString(16).slice(2)}`,map,kinds,gearItems:old?.gearItems||[],createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
 const out=old?list.map(x=>x.map===map?next:x):[next,...list];
 hdPLSave(out);return true;
}
function hdPLRemove(map){hdPLSave(hdPLLoad().filter(x=>x.map!==map))}
function hdPLPruneReady(map){
 const list=hdPLLoad(),row=list.find(x=>x.map===map);if(!row)return;
 const kinds=(row.kinds||[]).filter(k=>hdPLCurrentCheck(map,k).status!=='ready');
 const demand=hdPLDemandRows(row.gearItems||[]),openKeys=new Set(demand.filter(x=>x.shortfall>0).map(x=>[x.map||map,x.target||x.wanted,x.methodKey||'',x.kind||''].join('|')));
 const gearItems=(row.gearItems||[]).filter(x=>openKeys.has([x.map||map,x.target||x.wanted,x.methodKey||'',x.kind||''].join('|')));
 if(!kinds.length&&!gearItems.length){hdPLRemove(map);return}
 row.kinds=kinds;row.gearItems=gearItems;row.updatedAt=Date.now();hdPLSave(list);
}
function hdPLNumFirst(v){
 const m=String(v??'').match(/\d+/);return m?Number(m[0]):0;
}
function hdPLDevRecipeFor(target){
 if(!target||typeof HD_DEV_RECIPES==='undefined')return null;
 const aliases=typeof hdAGNames==='function'?hdAGNames(target):[target];
 return HD_DEV_RECIPES.find(r=>(r.targets||[]).some(t=>aliases.includes(t)))||null;
}
function hdPLDevRate(recipe,target){
 if(!recipe)return 0;
 const text=String(recipe.rates||''),parts=text.split('/').map(x=>x.trim()),norm=s=>String(s||'').normalize('NFKC').replace(/[\s()（）・･]/g,'');
 const key=norm(target),short=key.replace(/改二|改|型|式/g,'').slice(0,6);
 let seg=parts.find(x=>{const n=norm(x);return (key&&n.includes(key))||(short.length>=2&&n.includes(short))});
 if(!seg&&parts.length===1)seg=parts[0];
 if(!seg)return 0;
 const m=seg.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);return m?Number(m[1])/100:0;
}
function hdPLDevEstimate(row){
 const target=row.target||'',recipe=hdPLDevRecipeFor(target);if(!recipe)return null;
 const need=Math.max(1,Number(row.shortfall)||Number(row.needed)||1),rate=hdPLDevRate(recipe,target);
 const attempts=rate>0?Math.max(1,Math.ceil(need/rate)):null;
 const one={fuel:Number(recipe.fuel)||0,ammo:Number(recipe.ammo)||0,steel:Number(recipe.steel)||0,bauxite:Number(recipe.bauxite)||0};
 const total=attempts?{fuel:one.fuel*attempts,ammo:one.ammo*attempts,steel:one.steel*attempts,bauxite:one.bauxite*attempts}:null;
 return {recipe,rate,attempts,one,total};
}
function hdPLImproveSourceFor(target){
 if(!target||typeof HD_IMPROVEMENTS==='undefined')return null;
 return HD_IMPROVEMENTS.find(x=>String(x.update||'').includes(target))||null;
}
function hdPLImproveEstimate(row){
 const target=row.target||'',src=hdPLImproveSourceFor(target);if(!src)return null;
 let dev=0,screw=0,attempts=0,consumes=[];
 for(const stage of (src.stages||[])){
  const label=String(stage[0]||''),devCost=hdPLNumFirst(stage[1]),screwCost=hdPLNumFirst(stage[2]),consume=String(stage[3]||'');
  let n=0;if(/0.?5/.test(label))n=6;else if(/6.?9/.test(label))n=4;else if(/max/i.test(label))n=1;
  dev+=devCost*n;screw+=screwCost*n;attempts+=n;if(consume&&consume!=='なし'&&consume!=='更新なし'&&consume!=='更新不可')consumes.push(`${label}: ${consume}`);
 }
 const r=src.resource||[0,0,0,0],need=Math.max(1,Number(row.shortfall)||Number(row.needed)||1);
 return {source:src,need,attempts,dev:dev*need,screw:screw*need,resource:{fuel:(Number(r[0])||0)*attempts*need,ammo:(Number(r[1])||0)*attempts*need,steel:(Number(r[2])||0)*attempts*need,bauxite:(Number(r[3])||0)*attempts*need},consumes:[...new Set(consumes)]};
}
function hdPLCostHtml(row){
 if((row.shortfall||0)<=0)return '';
 if(row.methodKey==='develop'){
  const e=hdPLDevEstimate(row);if(!e)return '';
  return `<div class="hd-pl-cost"><div><span>開発レシピ</span><b>${hdPLEsc(e.recipe.title)}</b></div><div><span>1回</span><b>燃${e.one.fuel} / 弾${e.one.ammo} / 鋼${e.one.steel} / ボ${e.one.bauxite}</b></div>${e.attempts?`<div><span>期待試行目安</span><b>約${e.attempts}回${e.rate?`（${(e.rate*100).toFixed(1)}%基準）`:''}</b></div><div class="total"><span>期待資源目安</span><b>燃${e.total.fuel} / 弾${e.total.ammo} / 鋼${e.total.steel} / ボ${e.total.bauxite}</b></div>`:'<div><span>試行目安</span><b>成功率データなし</b></div>'}<small>確率からの単純期待値。実際の入手回数は上下するよ。</small></div>`;
 }
 if(row.methodKey==='improve'){
  const e=hdPLImproveEstimate(row);if(!e)return '';
  return `<div class="hd-pl-cost"><div><span>更新元</span><b>${hdPLEsc(e.source.name)} → ${hdPLEsc(row.target||row.wanted)}</b></div><div><span>最低目安</span><b>ネジ ${e.screw} / 開発資材 ${e.dev}</b></div><div class="total"><span>改修資源目安</span><b>燃${e.resource.fuel} / 弾${e.resource.ammo} / 鋼${e.resource.steel} / ボ${e.resource.bauxite}</b></div>${e.consumes.length?`<small>消費装備等: ${e.consumes.map(hdPLEsc).join(' / ')}</small>`:''}<small>通常改修の必要数を使った最低目安。失敗・確実化・曜日/二番艦条件で増える場合があるよ。</small></div>`;
 }
 return '';
}
function hdPLGlobalDemandRows(rows=hdPLLoad()){
 const m=new Map();
 for(const mapRow of rows){
  for(const x of hdPLDemandRows(mapRow.gearItems||[])){
   const target=x.target||x.wanted||'',key=[target,x.methodKey||'',x.kind||''].join('|');
   const cur=m.get(key)||{...x,target,needed:0,maps:[],ships:[],loadouts:[]};
   cur.needed=Math.max(cur.needed||0,x.needed||0);
   cur.maps=[...new Set([...cur.maps,mapRow.map].filter(Boolean))];
   cur.ships=[...new Set([...cur.ships,...(x.ships||[]),x.ship].filter(Boolean))];
   cur.loadouts=[...new Set([...cur.loadouts,...(x.loadouts||[]),x.loadout].filter(Boolean))];
   m.set(key,cur);
  }
 }
 return [...m.values()].map(x=>{
  const owned=x.target?hdPLOwnedCount(x.target):0,shortfall=Math.max(0,(x.needed||0)-owned);
  return {...x,owned,shortfall,status:shortfall===0?'ready':owned>0?'partial':'missing'};
 }).sort((a,b)=>{
  if((a.shortfall===0)!==(b.shortfall===0))return a.shortfall===0?1:-1;
  return (a.rank||9)-(b.rank||9)||(b.shortfall||0)-(a.shortfall||0)||(a.target||a.wanted).localeCompare(b.target||b.wanted,'ja');
 });
}
function hdPLPriorityMeta(row){
 const maps=(row.maps||[]).length,ships=(row.ships||[]).length,loadouts=(row.loadouts||[]).length,owned=Math.max(0,Number(row.owned)||0),shortfall=Math.max(0,Number(row.shortfall)||0);
 const methodBonus={develop:24,improve:18,quest:13,other:7,limited:2}[row.methodKey||'other']||7;
 const impact=maps*10+ships*14+loadouts*5;
 const progress=owned>0?Math.min(16,8+owned*2):0;
 const effortPenalty=Math.max(0,shortfall-1)*3;
 const score=impact+methodBonus+progress-effortPenalty;
 const label=score>=58?'最優先':score>=42?'優先':score>=28?'次点':'低め';
 const reasons=[];
 if(ships>1)reasons.push(`${ships}隻で使用`);
 else if(ships===1)reasons.push('1隻で使用');
 if(maps>1)reasons.push(`${maps}計画で共用`);
 if(owned>0&&shortfall>0)reasons.push(`あと${shortfall}個`);
 else if(shortfall>0)reasons.push(`不足${shortfall}個`);
 if(row.methodLabel)reasons.push(row.methodLabel);
 return {score,label,reasons,impact,methodBonus,progress,effortPenalty};
}
function hdPLPriorityRows(rows=hdPLLoad(),limit=6){
 return hdPLGlobalDemandRows(rows).filter(x=>x.shortfall>0).map(x=>({...x,priority:hdPLPriorityMeta(x)})).sort((a,b)=>b.priority.score-a.priority.score||(a.rank||9)-(b.rank||9)||(a.shortfall||0)-(b.shortfall||0)||(a.target||a.wanted).localeCompare(b.target||b.wanted,'ja')).slice(0,limit);
}
function hdPLNextActionMeta(row){
 if(!row||!(Number(row.shortfall)>0))return null;
 const target=row.target||row.wanted||'';
 if(row.methodKey==='develop'){
  const e=hdPLDevEstimate(row);
  return {kind:'develop',label:'開発で狙う',title:target,detail:e?.recipe?.title||'開発レシピを確認',sub:e?.attempts?`期待 約${e.attempts}回｜燃${e.total?.fuel||0} 弾${e.total?.ammo||0} 鋼${e.total?.steel||0} ボ${e.total?.bauxite||0}`:'成功率データを確認',action:'開発レシピへ'};
 }
 if(row.methodKey==='improve'){
  const e=hdPLImproveEstimate(row);
  return {kind:'improve',label:'改修・更新で作る',title:target,sourceName:e?.source?.name||target,detail:e?.source?.name?`${e.source.name} → ${target}`:'更新元を確認',sub:e?`ネジ ${e.screw} / 開発資材 ${e.dev}`:'必要素材を確認',action:'改修工廠へ'};
 }
 if(row.methodKey==='quest')return {kind:'quest',label:'任務・初期装備を確認',title:target,detail:'常設任務や初期装備の入手ルートを確認',sub:`不足 ${row.shortfall||0}個`,action:'入手ルートへ'};
 if(row.methodKey==='limited')return {kind:'limited',label:'限定入手を確認',title:target,detail:'イベント・期間限定などの入手条件を確認',sub:`不足 ${row.shortfall||0}個`,action:'入手情報へ'};
 return {kind:'other',label:'入手方法を確認',title:target,detail:'図鑑・入手ガイドから候補を確認',sub:`不足 ${row.shortfall||0}個`,action:'入手情報へ'};
}
function hdPLNextActionHtml(rows=hdPLLoad()){
 const row=hdPLPriorityRows(rows,1)[0];if(!row)return '';
 const a=hdPLNextActionMeta(row);if(!a)return '';
 const map=(row.maps||[])[0]||'';
 const action=a.kind==='develop'
  ?`<button type="button" class="primary small" data-hd-ag-development="${hdPLEsc(row.target||row.wanted)}">${hdPLEsc(a.action)}</button>`
  :a.kind==='improve'
   ?`<button type="button" class="primary small" data-hd-ag-improvement="${hdPLEsc(a.sourceName||row.target||row.wanted)}">${hdPLEsc(a.action)}</button>`
   :`<button type="button" class="primary small" data-hd-pl-item-guide="${hdPLEsc(row.target||row.wanted)}" data-hd-pl-map="${hdPLEsc(map)}">${hdPLEsc(a.action)}</button>`;
 return `<section class="hd-pl-next-action method-${hdPLEsc(a.kind)}"><div class="hd-pl-next-kicker"><span>NEXT ACTION</span><b>${hdPLEsc(row.priority?.label||'優先')}</b></div><div class="hd-pl-next-main"><div><small>${hdPLEsc(a.label)}</small><strong>${hdPLEsc(a.title)}</strong><p>${hdPLEsc(a.detail)}</p><span>${hdPLEsc(a.sub)}</span></div><div class="hd-pl-next-buttons">${action}<button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(row.target||row.wanted)}">図鑑</button></div></div><div class="hd-pl-next-why"><b>優先理由</b><span>${(row.priority?.reasons||[]).map(hdPLEsc).join('・')}</span></div></section>`;
}
function hdPLPriorityQueueHtml(rows=hdPLLoad()){
 const items=hdPLPriorityRows(rows,6);if(!items.length)return '';
 return `<section class="hd-pl-priority"><div class="hd-pl-priority-head"><div><div class="eyebrow">NEXT PROCUREMENT</div><strong>先に揃える候補</strong><small>使用艦数・共用範囲・所持状況・入手しやすさから自動整理</small></div><span>${items.length}件</span></div><div class="hd-pl-priority-list">${items.map((x,i)=>`<article><div class="hd-pl-priority-rank"><b>#${i+1}</b><span>${hdPLEsc(x.priority.label)}</span></div><div class="hd-pl-priority-main"><strong>${hdPLEsc(x.target||x.wanted)}</strong><small>${x.priority.reasons.map(hdPLEsc).join('・')}</small><div><span>必要 <b>${x.needed||0}</b></span><span>所持 <b>${x.owned||0}</b></span><span>あと <b>${x.shortfall||0}</b></span></div></div><div class="hd-pl-priority-actions">${x.target?`<button type="button" class="ghost small" data-hd-pl-item-guide="${hdPLEsc(x.target)}" data-hd-pl-map="${hdPLEsc((x.maps||[])[0]||'')}">入手方法</button><button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(x.target)}">図鑑</button>`:''}</div></article>`).join('')}</div><p>同じ装備を複数海域で使い回せる場合、海域間では最大同時必要数を基準にしているよ。限定装備は入手性を低めに評価。</p></section>`;
}
function hdPLOverallBudget(rows=hdPLLoad()){
 const items=hdPLGlobalDemandRows(rows),open=items.filter(x=>x.shortfall>0);
 const dev={attempts:0,fuel:0,ammo:0,steel:0,bauxite:0,items:0,unknown:0};
 const imp={screw:0,devmat:0,fuel:0,ammo:0,steel:0,bauxite:0,items:0,unknown:0};
 const other={quest:0,limited:0,other:0};
 for(const x of open){
  if(x.methodKey==='develop'){
   const e=hdPLDevEstimate(x);dev.items+=x.shortfall||0;
   if(e?.total){dev.attempts+=e.attempts||0;dev.fuel+=e.total.fuel||0;dev.ammo+=e.total.ammo||0;dev.steel+=e.total.steel||0;dev.bauxite+=e.total.bauxite||0}
   else dev.unknown+=x.shortfall||0;
  }else if(x.methodKey==='improve'){
   const e=hdPLImproveEstimate(x);imp.items+=x.shortfall||0;
   if(e){imp.screw+=e.screw||0;imp.devmat+=e.dev||0;imp.fuel+=e.resource?.fuel||0;imp.ammo+=e.resource?.ammo||0;imp.steel+=e.resource?.steel||0;imp.bauxite+=e.resource?.bauxite||0}
   else imp.unknown+=x.shortfall||0;
  }else if(x.methodKey==='quest')other.quest+=x.shortfall||0;
  else if(x.methodKey==='limited')other.limited+=x.shortfall||0;
  else other.other+=x.shortfall||0;
 }
 return {items,open,dev,imp,other,totalShortfall:open.reduce((s,x)=>s+(x.shortfall||0),0)};
}
function hdPLOverallBudgetHtml(rows=hdPLLoad()){
 if(!rows.length)return '';
 const b=hdPLOverallBudget(rows),ready=b.items.filter(x=>x.shortfall===0).length;
 if(!b.items.length)return '<section class="hd-pl-overall"><div><div class="eyebrow">TOTAL PROCUREMENT BUDGET</div><strong>全海域の調達総予算</strong></div><p>個艦装備の調達項目を追加すると、ここに全体予算が出るよ。</p></section>';
 return `<section class="hd-pl-overall"><div class="hd-pl-overall-head"><div><div class="eyebrow">TOTAL PROCUREMENT BUDGET</div><strong>全海域の調達総予算</strong><small>同じ装備は海域間で使い回す前提。各装備の最大同時必要数で計算。</small></div><span>不足 ${b.totalShortfall}個 / 準備済み ${ready}種</span></div><div class="hd-pl-overall-grid"><article><b>開発</b><strong>${b.dev.items}個</strong><span>${b.dev.attempts?`期待 約${b.dev.attempts}回`:'成功率データ不足'}</span><small>燃${b.dev.fuel} / 弾${b.dev.ammo} / 鋼${b.dev.steel} / ボ${b.dev.bauxite}${b.dev.unknown?`＋見積不可${b.dev.unknown}個`:''}</small></article><article><b>改修・更新</b><strong>${b.imp.items}個</strong><span>ネジ ${b.imp.screw} / 開発資材 ${b.imp.devmat}</span><small>燃${b.imp.fuel} / 弾${b.imp.ammo} / 鋼${b.imp.steel} / ボ${b.imp.bauxite}${b.imp.unknown?`＋見積不可${b.imp.unknown}個`:''}</small></article><article><b>任務など</b><strong>${b.other.quest+b.other.other+b.other.limited}個</strong><span>任務 ${b.other.quest} / その他 ${b.other.other}</span><small>限定入手 ${b.other.limited}</small></article></div><p class="hd-pl-overall-note">開発は登録成功率からの期待値、改修は通常改修を前提にした最低目安。乱数・確実化・素材不足・曜日条件で実際の消費は増減するよ。</p></section>`;
}
function hdPLGearItemHtml(map,row){
 const target=row.target||'',method=row.methodLabel||'入手情報',rank=row.rank||4,label=rank===1?'優先1':rank===2?'優先2':rank===3?'優先3':rank===5?'優先5':'優先4';
 const need=Math.max(0,Number(row.needed)||0),owned=Math.max(0,Number(row.owned)||0),left=Math.max(0,Number(row.shortfall)||0);
 const status=left===0?'準備済み':owned>0?'あと少し':'不足';
 const shipText=(row.ships||[]).join('・')||row.ship||'',loadoutText=(row.loadouts||[]).join('・')||row.loadout||'';
 return `<article class="hd-pl-gear-item method-${hdPLEsc(row.methodKey||'other')} ${row.status||''}"><div class="hd-pl-gear-head"><div><strong>${hdPLEsc(target||row.wanted)}</strong><span>${hdPLEsc(shipText)}${loadoutText?`｜${hdPLEsc(loadoutText)}`:''}</span></div><div><b>${left?label:'完了'}</b><em>${hdPLEsc(method)}</em></div></div><div class="hd-pl-gear-counts"><span>必要 <b>${need}</b></span><span>所持 <b>${owned}</b></span><span class="${left?'short':'done'}">あと <b>${left}</b></span></div><div class="hd-pl-gear-meta">${target&&target!==row.wanted?`<span>元の希望 <b>${hdPLEsc(row.wanted)}</b></span>`:''}<span>状態 <b>${status}</b></span></div>${hdPLCostHtml(row)}<div class="hd-pl-actions">${left>0?(target?`<button type="button" class="ghost small" data-hd-pl-item-guide="${hdPLEsc(target)}" data-hd-pl-map="${hdPLEsc(map)}">この装備の入手方法</button><button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(target)}">図鑑</button>`:(row.kind?`<button type="button" class="ghost small" data-hd-pl-guide="${hdPLEsc(row.kind)}" data-hd-pl-map="${hdPLEsc(map)}">代替候補を見る</button>`:'')):(target?`<button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(target)}">所持装備を確認</button>`:'')}</div></article>`;
}
function hdPLGearPlanHtml(row){
 const items=hdPLDemandRows(row.gearItems||[]);if(!items.length)return '';
 const open=items.filter(x=>x.shortfall>0),ready=items.length-open.length;
 const counts={develop:0,improve:0,quest:0,other:0,limited:0};open.forEach(x=>counts[x.methodKey||'other']=(counts[x.methodKey||'other']||0)+(x.shortfall||0));
 const totalNeed=items.reduce((s,x)=>s+(x.needed||0),0),totalOwnedApplied=items.reduce((s,x)=>s+Math.min(x.needed||0,x.owned||0),0),totalLeft=items.reduce((s,x)=>s+(x.shortfall||0),0);
 return `<section class="hd-pl-gear-plan"><div class="hd-pl-gear-summary"><div><div class="eyebrow">SHIP LOADOUT PROCUREMENT</div><strong>個艦の不足装備</strong></div><span>必要 ${totalNeed} / 所持充当 ${totalOwnedApplied} / あと ${totalLeft}</span></div><div class="hd-pl-gear-progress"><span style="width:${totalNeed?Math.min(100,Math.round(totalOwnedApplied/totalNeed*100)):100}%"></span></div><p class="hd-pl-gear-method-summary">未調達: 開発 ${counts.develop} / 改修 ${counts.improve} / 任務 ${counts.quest} / その他 ${counts.other} / 限定 ${counts.limited}｜準備済み ${ready}種</p><div class="hd-pl-gear-list">${items.map(x=>hdPLGearItemHtml(row.map,x)).join('')}</div></section>`;
}
function hdPLRequirementHtml(map,kind){
 const check=hdPLCurrentCheck(map,kind),rec=hdPLRecommendation(kind),ready=check.status==='ready';
 return `<article class="hd-pl-req ${check.status}">
   <div class="hd-pl-req-head"><div><strong>${hdPLEsc(hdPLLabel(kind))}</strong><span>${hdPLEsc(check.detail||'')}</span></div><b>${ready?'準備完了':check.status==='partial'?'あと少し':'不足'}</b></div>
   <p>${hdPLEsc(check.hint||'')}</p>
   ${rec&&!ready?`<div class="hd-pl-rec"><span>次の候補</span><strong>${hdPLEsc(rec.name)}</strong><small>${hdPLEsc(rec.obtain||'')}</small></div>`:''}
   <div class="hd-pl-actions">${!ready?`<button type="button" class="ghost small" data-hd-pl-guide="${hdPLEsc(kind)}" data-hd-pl-map="${hdPLEsc(map)}">入手ルート</button>`:''}${rec&&!ready?`<button type="button" class="ghost small" data-hd-pl-catalog="${hdPLEsc(rec.name)}">図鑑</button>`:''}</div>
  </article>`;
}
function hdPLMapHtml(row){
 const states=(row.kinds||[]).map(k=>hdPLCurrentCheck(row.map,k)),done=states.filter(x=>x.status==='ready').length,total=states.length;
 return `<article class="hd-pl-map-card"><div class="hd-pl-map-head"><div><div class="eyebrow">MAP PROCUREMENT</div><strong>${hdPLEsc(row.map)} 調達リスト</strong><span>${done}/${total} カテゴリ準備完了</span></div><div class="hd-pl-map-actions"><button type="button" class="ghost small" data-hd-pl-prune="${hdPLEsc(row.map)}">完了を整理</button><button type="button" class="ghost small" data-hd-pl-remove="${hdPLEsc(row.map)}">削除</button></div></div>${hdPLGearPlanHtml(row)}<div class="hd-pl-req-grid">${(row.kinds||[]).map(k=>hdPLRequirementHtml(row.map,k)).join('')}</div></article>`;
}
function hdPLRender(){
 const host=document.getElementById('hdProcurementList');if(!host)return;
 const rows=hdPLLoad(),next=document.getElementById('hdProcurementNextAction'),budget=document.getElementById('hdProcurementBudget'),priority=document.getElementById('hdProcurementPriority');if(next)next.innerHTML=hdPLNextActionHtml(rows);if(budget)budget.innerHTML=hdPLOverallBudgetHtml(rows);if(priority)priority.innerHTML=hdPLPriorityQueueHtml(rows);
 host.innerHTML=rows.map(hdPLMapHtml).join('')||'<div class="empty">調達リストはまだないよ。海域の装備タブや艦娘DBのおすすめ装備から不足分を追加できる。</div>';
 const count=document.getElementById('hdProcurementCount');if(count)count.textContent=`${rows.length}件`;
 const add=document.getElementById('hdProcurementAddCurrent');if(add){const map=typeof selectedMap!=='undefined'?selectedMap:'';add.disabled=!map;add.textContent=map?`${map} の不足を追加`:'海域を選んでね'}
}
function hdPLEnsure(){
 if(document.getElementById('hdEquipmentProcurement'))return;
 const anchor=document.getElementById('hdEquipAnalyzer')||document.getElementById('equipmentBook');if(!anchor)return;
 const sec=document.createElement('section');sec.id='hdEquipmentProcurement';sec.className='advanced-section hd-pl-section';
 sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">PROCUREMENT LIST</div><h2>装備調達リスト</h2></div><span id="hdProcurementCount" class="muted"></span></div><div class="hd-pl-toolbar"><p>攻略予定の海域や艦娘ごとのおすすめ構成で足りない装備を保存。装備台帳を更新すると準備状況も自動で変わるよ。</p><button id="hdProcurementAddCurrent" type="button" class="primary small">海域を選んでね</button></div><div id="hdProcurementNextAction"></div><div id="hdProcurementPriority"></div><div id="hdProcurementBudget"></div><div id="hdProcurementList" class="hd-pl-list"></div>`;
 anchor.insertAdjacentElement('afterend',sec);document.getElementById('hdProcurementAddCurrent')?.addEventListener('click',()=>{if(typeof selectedMap!=='undefined'&&selectedMap)hdPLAddMap(selectedMap)});hdPLRender();
}
function hdPLInstallSortieButton(){
 if(window.__hdProcurementSortiePatched||typeof hdSortieEquipmentCheckHtml!=='function')return false;
 window.__hdProcurementSortiePatched=true;const prev=hdSortieEquipmentCheckHtml;
 hdSortieEquipmentCheckHtml=function(map){
  let html=prev(map);
  if(!html.includes('data-hd-pl-add-current')){
   html=html.replace('<div class="hd-se-footer">',`<div class="hd-se-footer"><button type="button" class="primary small" data-hd-pl-add-current="${hdPLEsc(map)}">不足分を調達リストへ</button>`);
  }
  return html;
 };
 if(typeof hdRenderMapEquipmentRecommendations==='function')setTimeout(hdRenderMapEquipmentRecommendations,0);return true;
}
function hdPLOpenList(){
 hdPLEnsure();const target=document.getElementById('hdEquipmentProcurement');if(!target)return;
 if(typeof hdWSShowElement==='function')hdWSShowElement('hdEquipmentProcurement',true);else target.scrollIntoView({behavior:'smooth',block:'start'});
}
document.addEventListener('click',e=>{
 const add=e.target.closest?.('[data-hd-pl-add-current]');if(add){if(hdPLAddMap(add.dataset.hdPlAddCurrent))hdPLOpenList();return}
 const master=e.target.closest?.('[data-hd-master-procure]');if(master){if(hdPLAddMasterLoadout(master.dataset.hdMasterProcure,master.dataset.hdMasterPlan||'',master.dataset.hdMasterMap||''))hdPLOpenList();return}
 const guide=e.target.closest?.('[data-hd-pl-guide]');if(guide){if(typeof hdAGOpen==='function')hdAGOpen(guide.dataset.hdPlGuide,guide.dataset.hdPlMap||'');return}
 const itemGuide=e.target.closest?.('[data-hd-pl-item-guide]');if(itemGuide){if(typeof hdAGOpenItem==='function')hdAGOpenItem(itemGuide.dataset.hdPlItemGuide,itemGuide.dataset.hdPlMap||'');return}
 const cat=e.target.closest?.('[data-hd-pl-catalog]');if(cat){if(typeof hdAGOpenCatalog==='function')hdAGOpenCatalog(cat.dataset.hdPlCatalog);return}
 const remove=e.target.closest?.('[data-hd-pl-remove]');if(remove){hdPLRemove(remove.dataset.hdPlRemove);return}
 const prune=e.target.closest?.('[data-hd-pl-prune]');if(prune){hdPLPruneReady(prune.dataset.hdPlPrune);return}
});
window.addEventListener('storage',e=>{if(e.key===HD_PROCUREMENT_KEY||e.key==='harbordesk-equipment-v1')hdPLRender()});
window.addEventListener('hd:workspace-refresh',hdPLRender);
window.addEventListener('hd:map-rendered',hdPLRender);
window.addEventListener('load',()=>setTimeout(()=>{hdPLEnsure();if(!hdPLInstallSortieButton())setTimeout(hdPLInstallSortieButton,500)},380));
hdPLInstallSortieButton();
