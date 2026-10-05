/* Search the registered inventory against the selected fleet's equipment targets. */
const HD_OC_CACHE=new Map();
const HD_OC_PENDING=new Map();
function hdOCContext(map,fleetId='',route=''){
 const fleets=typeof hdSPSFleets==='function'?hdSPSFleets(map):[],fleet=fleetId?fleets.find(x=>String(x.id)===String(fleetId)):(typeof hdSPSFleet==='function'?hdSPSFleet(map):null);
 const presets=typeof hdMSNPresets==='function'?hdMSNPresets(map):[],index=route===''?(typeof hdMSNRouteIndex==='function'?hdMSNRouteIndex(map,presets):0):Number(route);
 return {map,fleet,preset:presets[index]||null,index};
}
function hdOCSignature(c){return JSON.stringify([c.map,c.fleet,c.preset,hdFLRows(),hdFERoster(),localStorage.getItem('harbordesk-kancolle-sync-v1')])}
function hdOCCompatible(slot,candidate){
 const meta=candidate.item,db=slot.db;if(!db||!meta)return false;
 if(slot.expansion)return hdShipDbExpansionInfo(meta,db,candidate.star).allowed;
 return hdShipDbEquipCompatible(meta,db)&&!hdShipDbSlotRejects(slot.profile,slot.index,meta)&&(!HD_FE_AIR_CATS.has(meta.category)||Number(slot.capacity)>0);
}
function hdOCEquipment(candidate,slot){return {name:candidate.name,star:candidate.star,stackKey:candidate.key,category:candidate.item.category,slotIndex:slot.index,capacity:slot.capacity}}
function hdOCBuild(c){
 const plan=hdFEPlanFromSavedFleet(c.map,c.fleet);plan.preset=c.preset;plan.routeInfo=c.preset?hdFSPresetInfo(c.preset):null;
 const inventory=[...hdFLInventory().values()],counts=new Map(inventory.map(x=>[x.key,x.count])),slots=[],unknown=[];
 for(let si=0;si<plan.ships.length;si++){
  const ship=plan.ships[si],db=hdFEFindShip(ship.ship),profile=db&&hdShipDbSlotProfile(db),live=hdFERosterForShip(ship);
  if(!profile){unknown.push(`${ship.ship}：艦娘のスロット情報が未登録`);ship.items=[];ship.expansion=null;continue}
  const original=ship.items;ship.items=Array.from({length:profile.count},(_,index)=>({name:'',slotIndex:index,capacity:profile.slots[index]}));
  const add=(index,expansion=false)=>{
   const slot={si,index,expansion,db,profile,capacity:expansion?null:profile.slots[index]},old=expansion?ship.expansion:original.find(x=>x.slotIndex===index),key=old?hdFLInventoryStackKey(old.name,old.star):'',candidate=inventory.find(x=>x.key===key);
   const value=candidate&&counts.get(key)>0&&hdOCCompatible(slot,candidate)?hdOCEquipment(candidate,slot):null;
   if(value)counts.set(key,counts.get(key)-1);
   if(expansion)ship.expansion=value;else if(value)ship.items[index]=value;
   slots.push(slot);
  };
  for(let i=0;i<profile.count;i++)add(i);
  const expanded=!!ship.expansion||live&&Number.isFinite(Number(live.gameSlotEx))&&Number(live.gameSlotEx)>=0;
  if(expanded)add(0,true);else ship.expansion=null;
 }
 return {plan,inventory,slots,unknown};
}
function hdOCAssigned(plan){return hdFEAssigned(plan).filter(x=>x.name)}
function hdOCSpeedPart(item){
 const meta=hdFOItemMeta(item),name=item?.name||meta.name,turbine=/タービン/.test(name)||(meta.tags||[]).some(x=>String(x).includes('タービン'));
 return turbine?'turbine':hdFOItemMatches('高速化',item)?'boiler':'';
}
function hdOCItemMatches(kind,item){return kind==='speed-turbine'?hdOCSpeedPart(item)==='turbine':kind==='speed-boiler'?hdOCSpeedPart(item)==='boiler':hdFOItemMatches(kind,item)}
function hdOCMeasure(plan,requirements,unknown=[]){
 const items=hdOCAssigned(plan),air=hdFEAirCheck(plan.map,hdFEAir(items)),scouting=hdFEScouting(plan,items);
 const goals=requirements.map(r=>{const m=hdFEKindCount(r.kind,items),count=r.kind==='高速化'?plan.ships.reduce((n,ship)=>n+Number(hdFEKindCount('高速化',hdOCAssigned({ships:[ship]})).count>0),0):Number(m.count)||0;return {...r,count,ok:count>=r.minCount,detail:r.kind==='高速化'?`同じ艦の標準セット ${count} / 目安 ${r.minCount}組`:`配備 ${count} / 目安 ${r.minCount}`,ratio:Math.min(1,count/r.minCount)}});
 if(air.enemy)goals.push({kind:'air-value',label:'制空優勢の目安',count:air.ours,minCount:Math.ceil(air.enemy*1.5),ok:air.status==='ready',ratio:Math.min(1,air.ours/Math.ceil(air.enemy*1.5)),detail:`基礎制空 ${air.ours} / 目安 ${Math.ceil(air.enemy*1.5)}（あと ${Math.max(0,Math.ceil(air.enemy*1.5)-air.ours)}）`});
 if(scouting.available){const target=Math.max(...scouting.checks.map(x=>Number(x.safe)||0));goals.push({kind:'los-value',label:'索敵分岐の安全域',count:scouting.score,minCount:target,ok:scouting.status==='ready',ratio:Math.max(0,Math.min(1,scouting.score/Math.max(1,target))),detail:`33式 ${scouting.score.toFixed(2)} / 安全域 ${target}（あと ${Math.max(0,target-scouting.score).toFixed(2)}）`})}
 // A global turbine/can total does not prove that a low-speed ship is sped up.
 const route=hdFERoute(plan),speedRequired=plan.routeInfo?.speedRequired;
 if(speedRequired)for(const row of hdFERouteShips(plan).filter(x=>x.speed==='低速')){
  const own=hdOCAssigned({ships:[row.ship]}),t=own.some(x=>hdOCSpeedPart(x)==='turbine'),b=own.some(x=>hdOCSpeedPart(x)==='boiler');
  goals.push({kind:'speed-ship',label:`${row.ship.ship} の高速化セット`,count:Number(t)+Number(b),minCount:2,ok:t&&b,ratio:(Number(t)+Number(b))/2,detail:'同じ艦にタービンと缶が必要。特殊な高速化条件はルートで確認'});
 }
 const speedSets=Math.max(0,...requirements.filter(x=>x.kind==='高速化').map(x=>Number(x.minCount)||0),speedRequired?hdFERouteShips(plan).filter(x=>x.speed==='低速').length:0);
 if(speedSets)for(const [part,label] of [['turbine','高速化用タービン'],['boiler','高速化用の缶']]){
  const count=items.filter(x=>hdOCSpeedPart(x)===part).length;
  goals.push({kind:'speed-'+part,label,count,minCount:speedSets,ok:count>=speedSets,ratio:Math.min(1,count/speedSets),detail:`配備 ${count} / 標準セットの目安 ${speedSets}個。同じ艦でタービンと缶を組み合わせてね`});
 }
 const manual=[...unknown];for(const row of hdFLRows())if(Number(row.count)>0&&!hdFEFind(row.name))manual.push(`装備性能が未登録：${row.name}。台帳の装備名を確認`);
 if(speedRequired)manual.push('高速化・高速+などの実際の速力と必要な缶の種類・改修値は艦ごとに確認');
 if(air.status==='manual')manual.push(`制空：${air.detail}`);
 if(!scouting.available)manual.push(`索敵：${scouting.detail}`);
 if(route.requirements?.some(x=>!x.ok))manual.push(`艦種の変更が必要：${route.detail}`);
 if(route.status==='manual')manual.push(`ルート：${route.detail}`);
 if(hdSEChecks(plan.map).adv?.base?.available)manual.push('基地航空隊の機体・行動半径は基地航空隊プランナーで確認');
 const score=goals.reduce((s,g)=>s+g.ratio*100+(g.ok?25:0),0);
 return {goals,manual,score,complete:goals.length>0&&goals.every(x=>x.ok)&&!unknown.length};
}
function hdOCKey(plan){return JSON.stringify(plan.ships.map(s=>[(s.items||[]).map(x=>hdFOStackKey(x)),hdFOStackKey(s.expansion)]))}
function hdOCScore(kind,row){const item=row.item||row,s=item.stats||{};if(kind==='制空')return Number(s.対空)||0;if(kind==='索敵')return ((Number(s.索敵)||0)+hdFEImproveCoef(item)*Math.sqrt(Number(row.star)||0))*hdFEEquipCoef(item);return hdFLScoreBase(item,row)}
function* hdOCSearchSteps(c){
 const signature=hdOCSignature(c);
 const {plan,inventory,slots,unknown}=hdOCBuild(c),requirements=hdSEChecks(c.map).rows.filter(x=>x.kind!=='基地航空隊').map(x=>({...x,minCount:Math.max(1,Number(x.minCount)||1)}));
 const relevant=inventory.filter(x=>requirements.some(r=>hdFOItemMatches(r.kind,x))||hdFOItemMatches('制空',x)||hdFOItemMatches('索敵',x)||hdFOItemMatches('高速化',x));
 // Keep the strongest candidates for each compatible slot and each distinct target.
 const choices=slots.map(slot=>{const compatible=relevant.filter(x=>hdOCCompatible(slot,x)),picked=new Map();for(const kind of new Set([...requirements.map(x=>x.kind),'制空','索敵','高速化'])){
  const sorted=compatible.filter(x=>hdFOItemMatches(kind,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
  for(const x of sorted.slice(0,5))picked.set(x.key,x);if(kind==='高速化')for(const turbine of [true,false])for(const x of sorted.filter(x=>/タービン/.test(x.name)===turbine).slice(0,3))picked.set(x.key,x);
 }return [...picked.values()]});
 const initial={plan,measure:hdOCMeasure(plan,requirements,unknown)},seen=new Set([hdOCKey(plan)]);let beam=[initial],best=initial,examined=0;
 for(let depth=0;depth<Math.min(slots.length,24)&&!best.measure.goals.every(x=>x.ok)&&examined<10000;depth++){
  const next=[];
  for(const state of beam){const used=hdFOAssignedUsage(state.plan);
   for(let i=0;i<slots.length;i++){const slot=slots[i],old=slot.expansion?state.plan.ships[slot.si].expansion:state.plan.ships[slot.si].items[slot.index];
    for(const candidate of choices[i]){
     if(hdFOStackKey(old)===candidate.key)continue;
     let donor=null;if((used[candidate.key]||0)>=candidate.count){donor=slots.find(other=>{if(other.si===slot.si&&other.index===slot.index&&other.expansion===slot.expansion)return false;const item=other.expansion?state.plan.ships[other.si].expansion:state.plan.ships[other.si].items[other.index];return hdFOStackKey(item)===candidate.key});if(!donor)continue;}
     const trial=hdFOClone(state.plan),value=hdOCEquipment(candidate,slot);if(slot.expansion)trial.ships[slot.si].expansion=value;else trial.ships[slot.si].items[slot.index]=value;
     if(donor){const replacement=old?.name?inventory.find(x=>x.key===hdFOStackKey(old)):null,newItem=replacement&&hdOCCompatible(donor,replacement)?hdOCEquipment(replacement,donor):null;if(donor.expansion)trial.ships[donor.si].expansion=newItem;else trial.ships[donor.si].items[donor.index]=newItem||{name:'',slotIndex:donor.index,capacity:donor.capacity};}
     const key=hdOCKey(trial);if(seen.has(key))continue;seen.add(key);examined++;if(examined>10000)break;
     const measure=hdOCMeasure(trial,requirements,unknown),row={plan:trial,measure};
     if(measure.score>best.measure.score)best=row;
     next.push(row);
     if(examined%50===0)yield examined;
    }
   }
  }
  next.sort((a,b)=>b.measure.score-a.measure.score);beam=next.slice(0,5);if(!beam.length)break;
 }
 // Fill remaining ordinary slots with owned basic weapons after satisfying the targets.
 const usage=hdFOAssignedUsage(best.plan);
 for(const slot of slots.filter(x=>!x.expansion)){
  const ship=best.plan.ships[slot.si];if(ship.items[slot.index]?.name)continue;
  const kind=hdFLSlotKind({profile:{type:ship.type,row:{name:ship.ship}}},slot.index);
  const candidates=inventory.filter(x=>(usage[x.key]||0)<x.count&&hdOCCompatible(slot,x)&&hdFLKindMatch(x.item,kind)).sort((a,b)=>hdFLScoreBase(b.item,b)-hdFLScoreBase(a.item,a));
  if(candidates[0]){ship.items[slot.index]=hdOCEquipment(candidates[0],slot);usage[candidates[0].key]=(usage[candidates[0].key]||0)+1;}
 }
 best.measure=hdOCMeasure(best.plan,requirements,unknown);
 const speedNeed=best.measure.goals.find(x=>x.kind==='speed-turbine')?.minCount||0;
 const shortages=best.measure.goals.filter(x=>!x.ok).map(goal=>{
  const kind=goal.kind==='air-value'?'制空':goal.kind==='los-value'?'索敵':goal.kind==='speed-ship'?'高速化':goal.kind;
  const compatible=hdFLCatalog().filter(x=>hdOCItemMatches(kind,x)&&slots.some(slot=>hdOCCompatible(slot,{item:x,star:0}))).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
  const candidates=(kind==='高速化'?['turbine','boiler'].flatMap(part=>compatible.filter(x=>hdOCSpeedPart(x)===part).slice(0,1)):compatible.slice(0,3)).map(x=>x.name);
  const ownedCount=part=>inventory.filter(x=>hdOCSpeedPart(x)===part).reduce((n,x)=>n+x.count,0);
  const owned=kind==='高速化'?Math.min(ownedCount('turbine'),ownedCount('boiler')):inventory.filter(x=>hdOCItemMatches(kind,x)).reduce((n,x)=>n+x.count,0);
  const placementInfo=kind==='高速化'?{}:hdOCPlacementInfo(kind,inventory,slots,hdFLCatalog());
  return {...goal,...placementInfo,goalKind:goal.kind,kind,owned,placement:(placementInfo.usableOwned??owned)>=(kind==='高速化'?Math.max(1,speedNeed):goal.minCount)&&!['air-value','los-value'].includes(goal.kind),shortfall:Math.max(0,goal.minCount-goal.count),candidates};
 });
 best.plan.ships.forEach(s=>{s.items=s.items.filter(x=>x.name)});
 return {...best,shortages,examined,signature,fleetId:c.fleet.id};
}
function hdOCSearch(c){const steps=hdOCSearchSteps(c);let step;do{step=steps.next()}while(!step.done);return step.value}
async function hdOCSearchAsync(c){
 const signature=hdOCSignature(c),steps=hdOCSearchSteps(c);
 // Give the loading state a paint opportunity before evaluating combinations.
 await new Promise(resolve=>setTimeout(resolve,25));
 while(true){
  const current=hdOCContext(c.map,c.fleet.id,c.index);
  if(hdOCSignature(current)!==signature){steps.return();const error=new Error('Owned search data changed');error.code='HD_OC_STALE';throw error}
  const step=steps.next();if(step.done)return step.value;
  await new Promise(resolve=>setTimeout(resolve,0));
 }
}
function hdOCPlacementInfo(kind,inventory,slots,catalog){
 const owned=inventory.filter(x=>hdOCItemMatches(kind,x)),usable=owned.filter(x=>slots.some(slot=>hdOCCompatible(slot,x)));
 const blocked=owned.filter(x=>!usable.includes(x)).map(x=>({name:x.name,star:x.star,count:x.count}));
 // This is an upper bound: different targets may compete for the same slot.
 const compatibleSlots=slots.filter(slot=>catalog.some(item=>hdOCItemMatches(kind,item)&&hdOCCompatible(slot,{item,star:0}))||usable.some(x=>hdOCCompatible(slot,x))).length;
 return {usableOwned:usable.reduce((n,x)=>n+x.count,0),compatibleSlots,blocked};
}
function hdOCPlacementHtml(goal){
 if(!goal.blocked)return '';
 const esc=hdFEEsc,numeric=['air-value','los-value'].includes(goal.goalKind||goal.kind);
 const lines=[`この編成に装備できる手持ち ${goal.usableOwned}個 / 装備可能な枠は最大 ${goal.compatibleSlots}枠（他の条件と共用）`];
 if(goal.blocked.length)lines.push('この編成の確認済み枠に載せられない手持ち：'+goal.blocked.map(x=>`${x.name}${x.star?' ★'+x.star:''} ×${x.count}`).join('、')+'。艦種・スロット制限・搭載数・増設の条件を確認してね');
 if(!numeric&&goal.compatibleSlots<goal.minCount)lines.push(`必要な ${goal.minCount}個に対して枠が不足。装備を増やすだけでは解消できないので、編成や確認済みの増設枠を見直してね`);
 else if(goal.usableOwned>=goal.minCount&&!numeric)lines.push('装備できる所持数は足りています。他の条件との両立や配置を見直してね。探索で組み合わせを見つけられない場合もあります');
 else if(!numeric&&goal.compatibleSlots)lines.push(`装備できる同種の手持ちがあと ${Math.max(0,goal.minCount-goal.usableOwned)}個必要。候補の入手後も配備を再確認してね`);
 return `<div class="hd-oc-placement">${lines.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
}
function hdOCStockGap(goal){return !goal||goal.placement||(goal.kind==='高速化'||['air-value','los-value','speed-ship'].includes(goal.goalKind||goal.kind))?0:Math.max(0,Math.ceil(goal.minCount-(goal.usableOwned??goal.owned)))}
function hdOCProcurementHtml(goal,index,attrs){
 const gap=hdOCStockGap(goal);if(!gap||!goal.candidates.length||typeof hdPLSave!=='function')return '';
 return `<div class="hd-oc-procurement"><label>所持不足を補う候補 <select data-hd-oc-target>${goal.candidates.map(name=>`<option value="${hdFEEsc(name)}">${hdFEEsc(name)}</option>`).join('')}</select></label><button type="button" class="ghost small" data-hd-oc-procure="${index}" ${attrs}>候補をあと${gap}個、調達リストへ</button><small>候補の入手計画です。入手後に配備を再確認してね。</small></div>`;
}
function hdOCAddProcurement(c,result,index,target){
 const goal=result.shortages[index],gap=hdOCStockGap(goal);if(!gap||!goal.candidates.includes(target)||typeof hdPLSave!=='function')return false;
 const item=hdPLResolveWanted(target).item;if(!item||item.name!==target)return false;
 const source=JSON.stringify([c.fleet.id,goal.kind,goal.label]),method=hdPLMethodMeta(item),now=Date.now(),list=hdPLLoad(),old=list.find(x=>x.map===c.map);
 const added={map:c.map,ship:c.fleet.name||'保存編成',loadout:'手持ち配備の不足：'+goal.label,wanted:target,target,kind:goal.kind,exact:true,methodKey:method.key,methodLabel:method.label,rank:method.rank,needed:hdPLOwnedCount(target)+gap,ownedPlanSource:source,ownedPlanRoute:c.index,sources:[c.fleet.name||'保存編成'],createdAt:now};
 const next={...old,id:old?.id||`pl-${now}-${Math.random().toString(16).slice(2)}`,map:c.map,kinds:old?.kinds||[],gearItems:[...(old?.gearItems||[]).filter(x=>!(x.ownedPlanSource===source&&(x.ownedPlanRoute==null||Number(x.ownedPlanRoute)===c.index))),added],createdAt:old?.createdAt||now,updatedAt:now};
 hdPLSave(old?list.map(x=>x.map===c.map?next:x):[next,...list]);return true;
}
function hdOCSavedGoal(c,result,item){
 if(!item.ownedPlanSource||(item.ownedPlanRoute!=null&&Number(item.ownedPlanRoute)!==c.index))return null;
 try{const source=JSON.parse(item.ownedPlanSource);if(!Array.isArray(source)||String(source[0])!==String(c.fleet.id))return null;return result.measure.goals.find(g=>g.kind===source[1]&&g.label===source[2])||null}catch{return null}
}
function hdOCProcurementUpdateHtml(c,result,attrs){
 if(typeof hdPLLoad!=='function')return '';
 const row=hdPLLoad().find(x=>x.map===c.map);if(!(row?.gearItems||[]).some(x=>hdOCSavedGoal(c,result,x)))return '';
 return `<div class="hd-oc-procurement"><button type="button" class="ghost small" data-hd-oc-procurement-update ${attrs}>現在の条件で調達計画を更新</button><small>この編成・ルートの保存済み候補を再確認します。同じ編成・条件の旧計画も更新します。所持不足が解消した計画は整理し、配備条件は上の結果で確認してね。</small></div>`;
}
function hdOCUpdateProcurement(c,result){
 if(result.signature!==hdOCSignature(c))return false;
 const list=hdPLLoad(),old=list.find(x=>x.map===c.map);if(!old)return {removed:0,updated:0};
 let removed=0,updated=0;
 const items=(old.gearItems||[]).flatMap(item=>{
  const goal=hdOCSavedGoal(c,result,item);if(!goal)return [item];
  const shortage=result.shortages.find(g=>(g.goalKind||g.kind)===goal.kind&&g.label===goal.label);
  if(goal.ok||shortage&&hdOCStockGap(shortage)===0){removed++;return []}
  const gap=hdOCStockGap(shortage);if(!gap)return [item];
  // Keep a previously chosen candidate even when its score drops outside the top three.
  const meta=hdFLCatalog().find(x=>x.name===item.target),slots=hdOCBuild(c).slots;
  if(!meta||!hdOCItemMatches(goal.kind,meta)||!slots.some(slot=>hdOCCompatible(slot,{item:meta,star:0})))return [item];
  const needed=hdPLOwnedCount(item.target)+gap;
  if(item.needed===needed&&item.ownedPlanRoute===c.index)return [item];
  updated++;return [{...item,needed,ownedPlanRoute:c.index}];
 });
 if(removed||updated){const next={...old,gearItems:items,updatedAt:Date.now()};hdPLSave(!items.length&&!(old.kinds||[]).length?list.filter(x=>x.map!==c.map):list.map(x=>x.map===c.map?next:x))}
 return {removed,updated};
}
function hdOCPanel(map,fleetId='',route=''){
 if(typeof hdFLInventory!=='function')return '';
 const c=hdOCContext(map,fleetId,route),key=`${map}:${c.fleet?.id||''}:${c.index}`,signature=hdOCSignature(c),cached=HD_OC_CACHE.get(key),result=cached&&cached.signature===signature?cached:null,searching=HD_OC_PENDING.get(key)?.signature===signature,esc=hdFEEsc;
 const attrs=`data-hd-oc-map="${esc(map)}" data-hd-oc-fleet="${esc(c.fleet?.id||'')}" data-hd-oc-route="${c.index}"`;
 return `<section class="hd-oc-panel"><strong>手持ち装備で攻略条件を満たす</strong><p>${c.fleet?`対象：${esc(c.fleet.name||'保存編成')}。所持数・改修値・装備可否・空きスロットから配備案を探します。他の艦の装備も移し替える前提です。`:'先に自分用編成を保存・選択すると、艦ごとに手持ち装備を配備できます。'}</p><button type="button" class="primary small" data-hd-oc-search ${attrs} ${c.fleet&&!searching?'':'disabled'}>${searching?'手持ち装備を確認中…':'手持ちで条件を満たす配備を探す'}</button><button type="button" class="ghost small" data-hd-oc-select-fleet ${attrs}>艦隊を選ぶ・保存する</button>${result?`<div class="hd-oc-result"><b>${!result.measure.goals.length?'この海域は装備条件を自動判定できません':result.measure.complete?(result.measure.manual.length?'登録済み装備目安は充足・確認項目あり':'登録済みの装備条件を充足'):'配備案に未充足の条件あり'}</b>${result.measure.goals.map(g=>`<div class="hd-oc-goal ${g.ok?'ready':'missing'}"><strong>${esc(g.label)}：${g.ok?'充足':'不足'}</strong><span>${esc(g.detail)}</span></div>`).join('')}${result.shortages.map((g,index)=>`<div class="hd-oc-shortage"><b>${esc(g.label)}に必要なもの</b><p>${esc(g.detail)}。${g.kind==='高速化'?(g.goalKind==='speed-ship'?'この艦へのタービン・缶の配備を確認':`同じ艦のセットがあと ${Math.ceil(g.shortfall)}組。タービン・缶の内訳を確認してね`):['制空','索敵'].includes(g.kind)&&['air-value','los-value'].includes(g.goalKind||g.kind)?'性能・搭載枠を増やす必要あり':`配備不足 ${Math.ceil(g.shortfall)}個 / 同種の所持 ${g.owned}個`}。${g.placement&&!g.blocked?'所持数は足りています。装備可否・配備枠・他の条件との両立を見直してね。':''}${g.candidates.length?'装備候補：'+esc(g.candidates.join('、')):'この編成に載せられる候補なし。艦種や装備枠を見直してね。'}</p><button type="button" class="ghost small" data-hd-oc-acquire="${esc(g.kind.startsWith('speed-')?'高速化':g.kind)}" ${attrs}>入手方法を見る</button>${hdOCPlacementHtml(g)}${hdOCProcurementHtml(g,index,attrs)}</div>`).join('')}<div class="hd-oc-ships">${result.plan.ships.map(s=>`<p><b>${esc(s.ship)}</b><span>${esc([...s.items.map(x=>`第${x.slotIndex+1}：${x.name}${x.star?' ★'+x.star:''}`),...(s.expansion?[`増設：${s.expansion.name}${s.expansion.star?' ★'+s.expansion.star:''}`]:[])].join(' / ')||'配備なし')}</span></p>`).join('')}</div>${result.measure.manual.length?`<div class="hd-oc-manual"><b>別途確認が必要</b>${result.measure.manual.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${hdOCProcurementUpdateHtml(c,result,attrs)}<button type="button" class="ghost small" data-hd-oc-apply ${attrs}>${result.measure.complete?'この配備を保存編成に反映':'不足を残した配備案を保存'}</button><small>登録済み目安・制空は熟練度なしの推定。探索で見つからない組み合わせもあります。保存後はゲーム側の装備を変更し、基地航空隊・ルート条件も確認してね。</small></div>`:''}</section>`;
}
function hdOCInlineResult(map,fleetId){
 const c=hdOCContext(map,fleetId),result=HD_OC_CACHE.get(`${map}:${fleetId}:${c.index}`);
 return result&&result.signature===hdOCSignature(c)?result:null;
}
function hdOCInlineShipHtml(result,index){
 if(!result)return '';
 const ship=result.plan.ships[index];if(!ship)return '';
 const slots=[...ship.items.map(x=>`第${x.slotIndex+1}：${x.name}${x.star?' ★'+x.star:''}`),...(ship.expansion?[`増設：${ship.expansion.name}${ship.expansion.star?' ★'+ship.expansion.star:''}`]:[])];
 return `<div class="hd-oc-inline-ship"><b>手持ちの攻略配備案</b><span>${hdFEEsc(slots.join(' / ')||'配備できる手持ち装備なし')}</span><small>${result.measure.complete?'編成全体の登録済み装備目安は充足。確認項目も見てね':'編成全体に不足・未判定の条件あり。下の内訳を確認してね'}</small></div>`;
}
function hdOCInlinePanel(map,fleetId){
 const c=hdOCContext(map,fleetId),presets=typeof hdMSNPresets==='function'?hdMSNPresets(map):[];
 const choices=presets.length?`<label class="hd-oc-inline-route">攻略する編成例 <select data-hd-oc-inline-route data-hd-oc-map="${hdFEEsc(map)}">${presets.map((p,i)=>`<option value="${i}" ${i===c.index?'selected':''}>${hdFEEsc(p.name||`候補${i+1}`)}</option>`).join('')}</select></label>`:'<p>編成例のルート条件は別途確認してね。</p>';
 return `<div class="hd-oc-inline">${choices}${hdOCPanel(map,fleetId,c.index)}</div>`;
}
function hdOCInlineRefresh(){if(typeof renderCustomFleets==='function'&&typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap)}
document.addEventListener('change',e=>{if(e.target.id==='hdMapStrategyRoute'){setTimeout(hdOCInlineRefresh,0);return}if(!e.target.matches?.('[data-hd-oc-inline-route]'))return;const map=e.target.dataset.hdOcMap;if(typeof hdMSNRouteByMap!=='undefined')hdMSNRouteByMap[map]=Number(e.target.value)||0;hdOCRefresh()});
['hd:equipment-changed','hd:kancolle-sync','hd:custom-fleets-changed','hd:ship-identity-changed','hd:workspace-refresh'].forEach(event=>window.addEventListener(event,hdOCInlineRefresh));
window.addEventListener('storage',e=>{if(e.key===null||['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-kancolle-sync-v1'].includes(e.key))hdOCInlineRefresh()});
function hdOCRefresh(){hdOCInlineRefresh();if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();if(typeof hdMSNRender==='function')hdMSNRender()}
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-hd-oc-search],[data-hd-oc-apply],[data-hd-oc-acquire],[data-hd-oc-select-fleet],[data-hd-oc-procure],[data-hd-oc-procurement-update]');if(!button)return;
 if(button.hasAttribute('data-hd-oc-select-fleet')){hdMSNOpen(button.dataset.hdOcMap);return}
 const c=hdOCContext(button.dataset.hdOcMap,button.dataset.hdOcFleet,button.dataset.hdOcRoute);if(!c.fleet)return;
 const key=`${c.map}:${c.fleet.id}:${c.index}`;
 if(button.hasAttribute('data-hd-oc-acquire')){if(typeof hdAGOpen==='function')hdAGOpen(button.dataset.hdOcAcquire,c.map);return}
 if(button.hasAttribute('data-hd-oc-search')){
  const signature=hdOCSignature(c);if(HD_OC_PENDING.get(key)?.signature===signature)return;
  const pending={signature};HD_OC_PENDING.set(key,pending);button.disabled=true;button.textContent='手持ち装備を確認中…';
  const finish=()=>{if(HD_OC_PENDING.get(key)===pending)HD_OC_PENDING.delete(key)};
  hdOCSearchAsync(c).then(result=>{finish();HD_OC_CACHE.set(key,result);hdOCRefresh()}).catch(err=>{
   finish();button.disabled=false;button.textContent='手持ちで条件を満たす配備を探す';hdOCRefresh();
   hdToast(err.code==='HD_OC_STALE'?'編成や台帳が更新されたので、もう一度配備を探してね':'配備案を作れなかったよ。編成と台帳を確認してね','warn');
  });return;
 }
 const result=HD_OC_CACHE.get(key);if(!result||result.signature!==hdOCSignature(c)){hdToast('編成や台帳が変わったので、もう一度配備を探してね','warn');hdOCRefresh();return}
 if(button.hasAttribute('data-hd-oc-procurement-update')){
  try{const change=hdOCUpdateProcurement(c,result);if(change){hdToast(change.removed||change.updated?`調達計画を更新したよ。所持不足解消 ${change.removed}件・必要数更新 ${change.updated}件`:'保存済みの調達計画は現在の必要数と一致しているよ','success');hdOCRefresh()}}
  catch{hdToast('調達計画を保存できなかったよ。計画は残しているので再試行してね','warn')}return;
 }
 if(button.hasAttribute('data-hd-oc-procure')){
  const target=button.closest('.hd-oc-shortage')?.querySelector('[data-hd-oc-target]')?.value;
  try{if(hdOCAddProcurement(c,result,Number(button.dataset.hdOcProcure),target)){hdToast('不足候補を調達リストに保存したよ。入手後に配備を再確認してね','success');if(typeof hdPLOpenList==='function')hdPLOpenList()}}
  catch{hdToast('調達リストを保存できなかったよ。もう一度試してね','warn')}return;
 }
 const all=loadCustomFleets(),fleet=(all[c.map]||[]).find(x=>String(x.id)===String(c.fleet.id));if(!fleet){hdToast('自分用編成に保存してから反映してね','warn');return}
 let si=0;for(const ship of fleet.ships||[]){if(!String(ship.ship||'').trim()&&!String(ship.gear||'').trim())continue;const row=result.plan.ships[si++];if(!row)continue;const normal=Array.from({length:Math.max(0,...row.items.map(x=>x.slotIndex+1))},(_,i)=>{const item=row.items.find(x=>x.slotIndex===i);return item?item.name+(item.star?' ★'+item.star:''):''});ship.gear=[...normal,...(row.expansion?[`[増設] ${row.expansion.name}${row.expansion.star?' ★'+row.expansion.star:''}`]:[])].join(' / ')}
 try{saveCustomFleets(all)}catch{hdToast('保存できなかったよ。配備案は残しているので再試行してね','warn');return}
 HD_OC_CACHE.delete(key);hdToast('配備案を保存したよ。ゲーム側でも装備を変更してね','success');hdOCRefresh();
});
const hdOCPrev=hdSortieEquipmentCheckHtml;hdSortieEquipmentCheckHtml=function(map){return hdOCPrev(map)+hdOCPanel(map)};
hdOCRefresh();
