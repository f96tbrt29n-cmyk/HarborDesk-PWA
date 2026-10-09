/* Search the registered inventory against the selected fleet's equipment targets. */
const HD_OC_CACHE=new Map();
const HD_OC_PENDING=new Map();
function hdOCContext(map,fleetId='',route=''){
 const fleets=typeof hdSPSFleets==='function'?hdSPSFleets(map):[],fleet=fleetId?fleets.find(x=>String(x.id)===String(fleetId)):(typeof hdSPSFleet==='function'?hdSPSFleet(map):null);
 const presets=typeof hdMSNPresets==='function'?hdMSNPresets(map):[],index=route===''?(typeof hdMSNRouteIndex==='function'?hdMSNRouteIndex(map,presets):0):Number(route);
 return {map,fleet,preset:presets[index]||null,index};
}
function hdOCSignature(c){return JSON.stringify([c.map,c.fleet,c.preset,hdFLRows(),hdFERoster(),localStorage.getItem('harbordesk-kancolle-sync-v1'),typeof hdMapAirSelection==='function'?hdMapAirSelection(c.map):null])}
function hdOCUseFleet(map,id){
 if(!hdSPSFleets(map).some(f=>String(f.id)===String(id)))return false;
 if(typeof hdMSNFleetByMap!=='undefined')hdMSNFleetByMap[map]=id;
 if(typeof hdSortieSetSelection==='function')hdSortieSetSelection(map,id);
 hdMSNOpen(map);return true;
}
function hdOCOpenFleetPicker(map,fleetId=''){
 let dialog=document.getElementById('hdOCFleetPicker');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='hdOCFleetPicker';document.body.appendChild(dialog)}
 const fleets=hdSPSFleets(map),selected=fleets.find(f=>String(f.id)===String(fleetId))?.id||fleets[0]?.id||'';
 dialog.innerHTML=`<form method="dialog"><h3>${hdFEEsc(map)} の艦隊を選ぶ・保存する</h3>${fleets.length?`<label>保存済みの艦隊<select data-hd-oc-fleet-picker>${fleets.map(f=>`<option value="${hdFEEsc(f.id)}" ${String(f.id)===String(selected)?'selected':''}>${hdFEEsc(f.name||'名称なし')}</option>`).join('')}</select></label>`:'<p>この海域の保存編成はまだありません。新しい編成を保存してね。</p>'}<div class="dialog-actions"><button type="button" class="primary" data-hd-oc-fleet-use ${fleets.length?'':'disabled'}>この艦隊を使う</button><button type="button" class="ghost" data-hd-oc-fleet-new>新しい編成を保存</button><button value="cancel" class="ghost">閉じる</button></div></form>`;
 dialog.querySelector('[data-hd-oc-fleet-use]').onclick=()=>{
  const id=dialog.querySelector('[data-hd-oc-fleet-picker]')?.value;
  if(!hdSPSFleets(map).some(f=>String(f.id)===String(id))){hdToast('編成が更新されたので、もう一度選んでね','warn');hdOCOpenFleetPicker(map,id);return}
  dialog.close();hdOCUseFleet(map,id);
 };
 dialog.querySelector('[data-hd-oc-fleet-new]').onclick=()=>{
  if(typeof openCustomFleetDialog!=='function'){hdToast('編成の保存画面を読み込めなかったよ','warn');return}
  const ids=new Set(hdSPSFleets(map).map(f=>String(f.id)));
  dialog.close();hdSelectGuideMap(map);openCustomFleetDialog();
  const editor=document.getElementById('customFleetDialog');editor.returnValue='';
  editor.addEventListener('close',()=>{
   if(editor.returnValue!=='default')return;
   const created=hdSPSFleets(map).find(f=>!ids.has(String(f.id)));
   if(created)hdOCUseFleet(map,created.id);
  },{once:true});
 };
 if(!dialog.open)dialog.showModal();
}
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
function hdOCItemMatches(kind,item){if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[kind])return HD_SE_RECIPES[kind].some(r=>r.parts.some(part=>hdSEPartMatches(part,item)));return kind==='speed-turbine'?hdOCSpeedPart(item)==='turbine':kind==='speed-boiler'?hdOCSpeedPart(item)==='boiler':hdFOItemMatches(kind,item)}
function hdOCMeasure(plan,requirements,unknown=[]){
 const items=hdOCAssigned(plan),air=hdFEAirCheck(plan.map,hdFEAir(items)),scouting=hdFEScouting(plan,items),speedTarget=hdFESpeedTarget(plan.routeInfo),speedGoals=speedTarget?(plan.ships||[]).filter(s=>s.ship).map(s=>hdFESpeedGoal(s,speedTarget)):[];
 const goals=requirements.filter(r=>!speedTarget||r.kind!=='高速化').map(r=>{const cap=typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[r.kind]?hdSECapabilityMeasure(plan,r.kind):null,m=cap||hdFEKindCount(r.kind,items),count=r.kind==='高速化'?plan.ships.reduce((n,ship)=>n+Number(hdFEKindCount('高速化',hdOCAssigned({ships:[ship]})).count>0),0):Number(m.count)||0;return {...r,count,ok:count>=r.minCount,detail:cap?`同じ艦の推奨セット ${count} / 目安 ${r.minCount}組` :r.kind==='高速化'?`同じ艦の標準セット ${count} / 目安 ${r.minCount}組`:`配備 ${count} / 目安 ${r.minCount}`,ratio:cap?cap.ratio:Math.min(1,count/r.minCount)}});
 if(air.enemy&&!(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map)))goals.push({kind:'air-value',label:air.goal==='superiority'?'制空優勢の目安':`制空${HD_MAP_AIR_GOALS[air.goal]}の目安`,count:air.ours,minCount:air.required,ok:air.status==='ready',unresolved:air.reason==='anti-air',ratio:Math.min(1,air.ours/Math.max(1,air.required),air.routeLoss?.known?air.routeLoss.minimumRatio:1),detail:`基礎制空 ${air.ours} / 目安 ${air.required}（あと ${Math.max(0,air.required-air.ours)}）${air.reason==='route'?'。通るマス未選択のため参考値・未充足扱い':air.reason==='anti-air'?'。敵防空データ不足のため未判定。装備不足とは限りません':''}${air.routeLoss?.firstGap?`。連戦モデル ${air.routeLoss.firstGap.id}・${air.routeLoss.firstGap.round}回目であと${air.routeLoss.firstGap.gap}不足`:''}`});
 if(scouting.available){const target=Math.max(...scouting.checks.map(x=>Number(x.safe)||0));goals.push({kind:'los-value',label:'索敵分岐の安全域',count:scouting.score,minCount:target,ok:scouting.status==='ready',ratio:Math.max(0,Math.min(1,scouting.score/Math.max(1,target))),detail:`33式 ${scouting.score.toFixed(2)} / 安全域 ${target}（あと ${Math.max(0,target-scouting.score).toFixed(2)}）`})}
 // A global turbine/can total does not prove that a low-speed ship is sped up.
 const route=hdFERoute(plan),speedRequired=!!speedTarget;
 goals.push(...speedGoals);
 const speedSets=speedTarget?0:Math.max(0,...requirements.filter(x=>x.kind==='高速化').map(x=>Number(x.minCount)||0));
 const speedMinimum=part=>speedGoals.reduce((n,g)=>{const recipes=hdFESpeedRecipes(g.speed.group,speedTarget,g.speed.base);return n+(recipes.length?Math.min(...recipes.map(r=>part==='turbine'?(r.t||0):Math.max(r.n||0,r.c||0))):0)},0);
 for(const [part,label] of [['turbine','高速化用タービン'],['boiler','高速化用の缶']]){const required=Math.max(speedSets,speedMinimum(part));if(!required)continue;
  const count=items.filter(x=>hdOCSpeedPart(x)===part).length;
  goals.push({kind:'speed-'+part,label,count,minCount:required,ok:count>=required,ratio:Math.min(1,count/required),detail:`配備 ${count} / ${speedTarget?'速力条件の最低必要数':'標準セットの目安'} ${required}個。各艦の必要な組み合わせ・改修値も確認してね`});
 }
 const manual=[...unknown];for(const row of hdFLRows())if(Number(row.count)>0&&!hdFEFind(row.name))manual.push(`装備性能が未登録：${row.name}。台帳の装備名を確認`);
 if(speedGoals.some(g=>g.unresolved))manual.push('艦娘の速力区分が未登録のため未判定：'+speedGoals.filter(g=>g.unresolved).map(g=>g.label).join('、'));
 if(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map))manual.push('1-6下ルート：制空優勢は必須ではありません。対空CI・対潜装備を優先し、水戦や水爆は搭載できる軽巡での選択肢');
 else if(air.status==='manual')manual.push(`制空：${air.detail}`);
 if(!scouting.available)manual.push(`索敵：${scouting.detail}`);
 if(route.requirements?.some(x=>!x.ok))manual.push(`艦種の変更が必要：${route.detail}`);
 if(route.status==='manual')manual.push(`ルート：${route.detail}`);
 if(hdSEChecks(plan.map).adv?.base?.available)manual.push('基地航空隊の機体・行動半径は基地航空隊プランナーで確認');
 const score=goals.reduce((s,g)=>s+g.ratio*100+(g.ok?25:0),0);
 return {goals,manual,score,complete:goals.length>0&&goals.every(x=>x.ok)&&!unknown.length&&air.reason!=='anti-air'};
}
function hdOCKey(plan){return JSON.stringify(plan.ships.map(s=>[(s.items||[]).map(x=>hdFOStackKey(x)),hdFOStackKey(s.expansion)]))}
function hdOCScore(kind,row){const item=row.item||row,s=item.stats||{};if(kind==='制空')return Number(s.対空)||0;if(kind==='索敵')return ((Number(s.索敵)||0)+hdFEImproveCoef(item)*Math.sqrt(Number(row.star)||0))*hdFEEquipCoef(item);return hdFLScoreBase(item,row)}
function* hdOCSearchSteps(c){
 const signature=hdOCSignature(c);
 const {plan,inventory,slots,unknown}=hdOCBuild(c),requirements=hdSEChecks(c.map).rows.filter(x=>x.kind!=='基地航空隊').map(x=>({...x,minCount:Math.max(1,Number(x.minCount)||1)}));
 const relevant=inventory.filter(x=>requirements.some(r=>hdOCItemMatches(r.kind,x))||hdFOItemMatches('制空',x)||hdFOItemMatches('索敵',x)||hdFOItemMatches('高速化',x));
 // Keep the strongest candidates for each compatible slot and each distinct target.
 const choices=slots.map(slot=>{const compatible=relevant.filter(x=>hdOCCompatible(slot,x)),picked=new Map();for(const kind of new Set([...requirements.map(x=>x.kind),'制空','索敵','高速化'])){
  if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[kind])for(const part of new Set(HD_SE_RECIPES[kind].flatMap(r=>r.parts))){for(const x of compatible.filter(x=>hdSEPartMatches(part,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a)).slice(0,3))picked.set(x.key,x)}
  const sorted=compatible.filter(x=>hdOCItemMatches(kind,x)).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
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
 const shortages=best.measure.goals.filter(x=>!x.ok&&!(x.kind==='air-value'&&x.unresolved)).map(goal=>{
  if(typeof HD_SE_RECIPES!=='undefined'&&HD_SE_RECIPES[goal.kind]){const profile=hdSEProfiles(c.map).find(x=>x.kind===goal.kind),stock=hdSECapabilityStock(best.plan,goal.kind);return {...goal,kind:profile?.baseKind||goal.kind,goalKind:goal.kind,capability:true,stock,owned:Number(!!stock?.complete),placement:true,shortfall:1,candidates:stock?.parts.filter(x=>x.have<x.need).flatMap(x=>HD_SE_PARTS[x.part].examples)||[]}}
  const kind=goal.kind==='air-value'?'制空':goal.kind==='los-value'?'索敵':goal.kind==='speed-ship'?'高速化':goal.kind;
  const compatible=hdFLCatalog().filter(x=>hdOCItemMatches(kind,x)&&slots.some(slot=>hdOCCompatible(slot,{item:x,star:0}))).sort((a,b)=>hdOCScore(kind,b)-hdOCScore(kind,a));
  const candidates=(kind==='高速化'?['turbine','boiler'].flatMap(part=>compatible.filter(x=>hdOCSpeedPart(x)===part).slice(0,1)):compatible.slice(0,3)).map(x=>x.name);
  const ownedCount=part=>inventory.filter(x=>hdOCSpeedPart(x)===part).reduce((n,x)=>n+x.count,0);
  const owned=kind==='高速化'?Math.min(ownedCount('turbine'),ownedCount('boiler')):inventory.filter(x=>hdOCItemMatches(kind,x)).reduce((n,x)=>n+x.count,0);
  const placementInfo=kind==='高速化'?{}:hdOCPlacementInfo(kind,inventory,slots,hdFLCatalog());
  return {...goal,...placementInfo,goalKind:goal.kind,kind,owned,placement:!goal.speedActual&&(placementInfo.usableOwned??owned)>=(kind==='高速化'?Math.max(1,speedNeed):goal.minCount)&&!['air-value','los-value'].includes(goal.kind),shortfall:Math.max(0,goal.minCount-goal.count),candidates};
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
function hdOCReview(plan,measure){
 const rows=[],add=(id,kind,title,reason,next,action='',source='')=>rows.push({id,kind,title,reason,next,action,source}),items=hdOCAssigned(plan),air=hdFEAirCheck(plan.map,hdFEAir(items)),scouting=hdFEScouting(plan,items),route=hdFERoute(plan),needs=hdSEChecks(plan.map).rows;
 for(const ship of plan.ships||[])if(!hdFEFindShip(ship.ship))add('ship:'+ship.ship,'data','艦娘情報が未登録',ship.ship+' のスロット・装備可否を確認できません。','艦娘名と改造段階を艦娘データベースで確認してね。','ships');
 const unknown=hdFLRows().filter(x=>Number(x.count)>0&&!hdFEFind(x.name));
 if(unknown.length){const used=new Set(items.map(x=>x.name)),required=unknown.filter(x=>used.has(x.name)),unused=unknown.filter(x=>!used.has(x.name));
  if(required.length)add('equipment-used','data','配備装備の性能が未登録',required.map(x=>x.name).join('、'),'装備台帳の名前を確認してから、もう一度配備を探してね。','equipment');
  if(unused.length)add('equipment-unused','info','未登録の所持装備',unused.map(x=>x.name).join('、')+'。この配備案には載せていません。','使いたい装備なら台帳の名前・性能データを確認してね。','equipment');
 }
 if(typeof hdSEAirOptional==='function'&&hdSEAirOptional(plan.map))add('air-optional','info','1-6下ルートの装備方針','制空優勢は必須ではありません。対空CI・対潜装備を優先する方針です。','水戦・水爆を使う場合は、搭載できる軽巡を選んでね。');
 else if(air.status==='manual'&&(air.enemy||needs.some(x=>x.kind==='制空')))add('air',air.reason==='route'?'manual':air.enemy?'data':'manual','制空値を判定できない',air.detail,air.reason==='anti-air'?'敵防空の不足情報を制空計算画面で確認してね。未計算箇所を含むため、充足とは判定しません。':air.reason==='route'?'制空計算画面で通る戦闘マスと目標を選んで、再探索してね。':air.enemy?'艦娘の搭載情報を同期してから再探索してね。':'制空計算画面で、進むルートの敵編成と目標制空値を確認してね。',['route','anti-air'].includes(air.reason)?'calculator':air.enemy?'sync':'calculator');
 if(air.routeLoss?.known){const chain=air.routeLoss;add('air-route-loss',chain.maxGap?'missing':'manual',chain.stage2Complete?'本隊の連戦制空（対空砲火モデル込み）':'本隊の連戦制空（部分計算）',`合計 ${chain.minLost}〜${chain.maxLost}機減少 / 最終基礎制空 ${chain.lower}〜${chain.upper}${chain.firstGap?` / 最初の不足 ${chain.firstGap.id}・${chain.firstGap.round}回目（大損耗側であと${chain.firstGap.gap}）`:''}。`,'確認したマス順の通常敵対空砲火モデル。登録射撃回避補正を反映・未登録機は回避なし・敵全艦生存・同名候補の最大を仮定。未登録敵・敵対空CI・敵連合・噴式機の対空砲火、熟練度低下・敵機削り・全滅確率は未計算。各マスの戦闘前制空を計算画面で確認してね。','calculator','https://wikiwiki.jp/kancolle/対空砲火#enemy_AAfire');if(!chain.stage2Complete)add('air-route-data','data','敵防空の計算情報が不足',chain.stage2Missing.join(' / '),'部分計算の残機だけでは充足としません。敵の形態・装備・陣形と特殊処理の登録が必要です。','calculator');}
 else if(air.routeLoss&&!air.routeLoss.known)add('air-route-order','manual','連戦制空の順番を確認してね',air.routeLoss.reason,'通るマスをルート順に並べ、「この順で進む」で確認してね。','calculator');
 if(!air.routeLoss?.known&&air.loss?.active)add('air-loss','manual','本隊の制空戦損耗（1回の範囲）',`${air.loss.minLost}〜${air.loss.maxLost}機減少 / 迎撃後の基礎制空 ${air.loss.lower}〜${air.loss.upper} / 目標 ${air.required}（厳しい側ではあと ${Math.max(0,air.required-air.loss.lower)}不足）。`,'制空戦だけの範囲。対空砲火・複数マスの累積・熟練度低下・敵機削りは含まず、全滅確率や到達時の保証ではありません。','calculator','https://wikiwiki.jp/kancolle/航空戦');
 if(!scouting.available){
  if(scouting.reason==='sync'){const missing=[...(scouting.missing?.hq?['司令部Lv']:[]),...(scouting.missing?.ships||[]).map(x=>x+' の索敵値')];add('scouting','data','索敵計算に必要な情報が不足',missing.join('、'), 'ゲーム連携で母港・艦隊情報を同期し、配備を再探索すると自動計算できるよ。','sync');}
  else if(needs.some(x=>x.kind==='索敵')&&plan.map!=='1-6')add('scouting','manual','索敵の判定基準が未登録',scouting.detail,'索敵計算画面で、進むルートの係数・必要スコアを確認してね。','calculator');
 }
 if(route.status==='missing')add('route','missing','編成条件を満たしていない',route.detail,'攻略する編成例に合わせて艦種・隻数・速力を見直してね。','route');
 else if(route.status==='manual')add('route','manual','進むルートの条件を要確認',route.detail,'編成例を選び、攻略するルートの艦種・隻数条件を確認してね。','route');
 const target=hdFESpeedTarget(plan.routeInfo);
 if(target){const checks=(plan.ships||[]).filter(s=>s.ship).map(s=>hdFESpeedGoal(s,target)),unknown=checks.filter(g=>g.unresolved),missing=checks.filter(g=>!g.ok&&!g.unresolved);
  if(unknown.length)add('speed-data','data','速力の判定データが不足',unknown.map(g=>g.detail).join('。'),'艦娘名・改造段階を確認し、未登録の区分はゲーム側の速力で確認してね。','ships',HD_FE_SPEED_SOURCE);
  if(missing.length)add('speed','missing',hdFESpeedLabel(target)+'条件を満たしていない',missing.map(g=>g.detail).join('。'),'必要な缶の種類・改修値・配備枠を確認して再探索してね。到達不可の艦は入れ替えてね。','equipment',HD_FE_SPEED_SOURCE);
  if(!unknown.length&&!missing.length)add('speed','info','配備案の速力条件は確認済み',checks.map(g=>g.speed.detail).join(' / '),'保存後は、ゲーム側にも同じ装備・改修値を配備してね。','',HD_FE_SPEED_SOURCE);
 }
 const base=hdSEChecks(plan.map).adv?.base;
 if(base?.available){
  const state=typeof hdLBLoad==='function'?hdLBLoad()[plan.map]:null,corps=Array.isArray(state?.corps)?state.corps:[],sorties=corps.filter(x=>x.mode==='sortie'),problems=[],unconfirmed=[];
  if(!sorties.length)problems.push('出撃部隊が未設定');
  if(sorties.length>(Number(base.sorties)||1))problems.push(`出撃 ${sorties.length}部隊 / 海域上限 ${Number(base.sorties)||1}部隊`);
  const usage={...hdFOAssignedUsage(plan)},inventory=hdFLInventory();
  for(const [i,c] of corps.entries())for(const s of c.squads||[])if(s.name&&Number(s.slot)>0){const key=hdFLInventoryStackKey(s.name,s.star),count=(usage[key]||0)+1;usage[key]=count;}
  for(const [key,count] of Object.entries(usage)){if(count>(inventory.get(key)?.count||0)&&corps.some(c=>(c.squads||[]).some(s=>s.name&&Number(s.slot)>0&&hdFLInventoryStackKey(s.name,s.star)===key)))problems.push(`${key.split('@@')[0]}：艦隊・基地で計${count}個 / 所持${inventory.get(key)?.count||0}個`);}
  for(const c of sorties){const i=corps.indexOf(c)+1,squads=c.squads||[];
   const filled=squads.slice(0,4).filter(s=>{const item=typeof hdLBFind==='function'&&hdLBFind(s.name),slot=Number(s.slot);return item&&Number.isInteger(slot)&&slot>0&&slot<=hdLBDefaultSlot(item)});
   if(filled.length!==4||squads.length!==4)problems.push(`第${i}航空隊：機体・機数を確認できる中隊 ${filled.length}/4`);
   const radius=typeof hdLBActionRadius==='function'?hdLBActionRadius(c).radius:null,target=Number(base.bossRadius)||0;
   if(!target||radius==null)unconfirmed.push(`第${i}航空隊：${!target?'海域の必要半径':'機体の行動半径'}が未判定`);
   else if(radius<target)problems.push(`第${i}航空隊：行動半径 ${radius} / ボス必要半径 ${target}（あと${target-radius}）`);
  }
  if(problems.length||unconfirmed.length)add('base',!sorties.length?'data':problems.length?'missing':'manual','基地航空隊の計画を確認',[...problems,...unconfirmed].join('。'),'基地航空隊プランナーで機体・機数・出撃設定を直してね。半径は海域のボス必要半径で確認するよ。','base');
  else add('base','info','基地計画の基本条件は確認済み',`保存計画の出撃${sorties.length}部隊について、機体・機数・所持数・ボスへの行動半径を確認しました。`,'ゲーム側の配備と出撃先を合わせてね。敵編成と残機数のチェックは下の項目に表示します。','base');
  if(state?.defenseCheck?.enemyId&&typeof hdLBDefenseAssessment==='function'){const a=hdLBDefenseAssessment(plan.map,state);add('base-defense',a.status,'基地防空の合計制空目安',a.invalid?'防空部隊の機体・機数・★が未判定です。':a.enemy===null?'基地空襲の敵制空値が未入力です。':`${a.label}：防空${a.count}部隊の合計 ${a.ours} / 敵 ${a.enemy} / ${HD_LB_AIR_GOALS[a.goal]} ${a.required}${a.shortage?`、あと ${a.shortage}不足`:'、目安を充足'}。`,'基地計画で防空札・敵空襲編成・機数を確認してね。高高度・重爆補正には未対応です。','base',a.source);}
  if(typeof hdLBAirAssessment==='function')for(const [i,c] of corps.entries())if(c.mode==='sortie'){
   const a=hdLBAirAssessment(plan.map,c),name=`第${i+1}航空隊`;
   if(a.invalid.length)add('base-air:'+i,'data',name+'の制空は未判定',a.invalid.join('、'),'基地計画の機体・機数・★を直してね。','base');
   else if(a.enemy===null)add('base-air:'+i,'data',name+'の敵編成が未設定','基地用の敵制空値がないため、目標までの不足値を計算できません。','基地計画で敵編成を選ぶか、敵偵察機込みの基地用制空値を入力してね。','base');
   else add('base-air:'+i,a.status,name+'の基地制空目安',`${a.label}：敵 ${a.enemy} / 基地 ${a.ours}（${a.state}）。${HD_LB_AIR_GOALS[a.goal]}には ${a.required}${a.shortage?`、あと ${a.shortage}不足`:'、目安を充足'}。`,a.shortage?(a.fullPower>=a.required?'機数を補充すると目安を満たします。':'戦闘機・改修・熟練度・目標を見直してね。後続部隊は敵機削りを含まない保守的な比較です。'):'登録機数での簡易目安です。ゲーム側の敵編成・配備を合わせてね。','base',a.source);
   if(!a.invalid.length&&a.missing)add('base-loss:'+i,'missing',name+'の機数が満載未満',`補充 ${a.missing}機 / 燃料 ${a.fuel} / ボーキ ${a.bauxite}。制空 ${a.ours} → 満載目安 ${a.fullPower}。`,'出撃前に基地を補充してね。計画の機数を更新すると再計算します。','base');
   if(!a.invalid.length&&a.loss>0)add('base-scenario:'+i,a.scenarioShortage?'manual':'info',name+'の損耗を仮定した比較',`各中隊の機数を仮に${a.loss}%減らすと制空 ${a.scenarioPower}${a.enemy===null?' / 敵編成未設定':a.scenarioShortage?` / 目標まであと ${a.scenarioShortage}`:' / 目標維持'}。`,'実際の撃墜率・全滅確率ではありません。熟練度は維持、敵機削りは含まない仮定です。集中時の2回目へ損耗をそのまま持ち越す計算はしていません。','base');
  }
 }
 return rows;
}
function hdOCReviewHeadline(measure,rows){
 if(!measure.goals.length)return 'この海域は装備条件を自動判定できません';
 if(!measure.complete)return '配備案に未充足・未判定の装備条件あり';
 if(rows.some(x=>x.kind==='missing'))return '登録済み装備目安は充足・編成や基地計画に未充足あり';
 if(rows.some(x=>x.kind==='data'))return '登録済み装備目安は充足・情報不足で未判定の項目あり';
 if(rows.some(x=>x.kind==='manual'))return '登録済み装備目安は充足・自動判定できない項目あり';
 return '登録済み装備目安は充足';
}
function hdOCReviewHtml(rows,attrs){
 const groups=[['missing','条件を満たしていない'],['data','情報不足で未判定'],['manual','自動判定できない項目'],['info','攻略の参考情報']],labels={sync:'ゲーム連携を開く',equipment:'装備台帳を開く',ships:'艦娘データベースを開く',route:'編成例を選ぶ',calculator:'制空・索敵計算を開く',base:'基地航空隊の計画を開く'},esc=hdFEEsc;
 return `<div data-hd-oc-reviews>${groups.map(([kind,label])=>{const items=rows.filter(x=>x.kind===kind);if(!items.length)return '';return `<div class="hd-oc-review-group ${kind}" data-hd-oc-review-kind="${kind}"><b>${label} ${items.length}件</b>${items.map(x=>`<article data-hd-oc-review-id="${esc(x.id)}"><strong>${esc(x.title)}</strong><p>${esc(x.reason)}</p><p><b>次にすること：</b>${esc(x.next)}</p>${x.action?`<button type="button" class="ghost small" data-hd-oc-review="${x.action}" ${attrs}>${labels[x.action]}</button>`:''}${x.source?`<a class="guide-link" href="${esc(x.source)}" target="_blank" rel="noopener">条件の判定元 ↗</a>`:''}</article>`).join('')}</div>`}).join('')}</div>`;
}
function hdOCReviewRefresh(){
 for(const panel of document.querySelectorAll('.hd-oc-panel[data-hd-oc-map]')){const c=hdOCContext(panel.dataset.hdOcMap,panel.dataset.hdOcFleet,panel.dataset.hdOcRoute),result=HD_OC_CACHE.get(`${c.map}:${c.fleet?.id||''}:${c.index}`);if(!result||result.signature!==hdOCSignature(c))continue;
  const rows=hdOCReview(result.plan,result.measure),host=panel.querySelector('[data-hd-oc-reviews]'),headline=panel.querySelector('[data-hd-oc-headline]');if(host)host.outerHTML=hdOCReviewHtml(rows,`data-hd-oc-map="${hdFEEsc(c.map)}" data-hd-oc-fleet="${hdFEEsc(c.fleet.id)}" data-hd-oc-route="${c.index}"`);if(headline)headline.textContent=hdOCReviewHeadline(result.measure,rows);
 }
}
window.addEventListener('hd:land-base-changed',hdOCReviewRefresh);

function hdOCPanel(map,fleetId='',route=''){
 if(typeof hdFLInventory!=='function')return '';
 const c=hdOCContext(map,fleetId,route),key=`${map}:${c.fleet?.id||''}:${c.index}`,signature=hdOCSignature(c),cached=HD_OC_CACHE.get(key),result=cached&&cached.signature===signature?cached:null,searching=HD_OC_PENDING.get(key)?.signature===signature,esc=hdFEEsc;
 const attrs=`data-hd-oc-map="${esc(map)}" data-hd-oc-fleet="${esc(c.fleet?.id||'')}" data-hd-oc-route="${c.index}"`;
 const reviews=result?hdOCReview(result.plan,result.measure):[];
 return `<section class="hd-oc-panel" ${attrs}>${typeof hdSECapabilityHtml==='function'?hdSECapabilityHtml(map,c.fleet?.id||''):''}<strong>手持ち装備で攻略条件を満たす</strong><p>${c.fleet?`対象：${esc(c.fleet.name||'保存編成')}。所持数・改修値・装備可否・空きスロットから配備案を探します。他の艦の装備も移し替える前提です。`:'先に自分用編成を保存・選択すると、艦ごとに手持ち装備を配備できます。'}</p><button type="button" class="primary small" data-hd-oc-search ${attrs} ${c.fleet&&!searching?'':'disabled'}>${searching?'手持ち装備を確認中…':'手持ちで条件を満たす配備を探す'}</button><button type="button" class="ghost small" data-hd-oc-select-fleet ${attrs}>艦隊を選ぶ・保存する</button>${result?`<div class="hd-oc-result"><b data-hd-oc-headline>${hdOCReviewHeadline(result.measure,reviews)}</b>${result.measure.goals.map(g=>`<div class="hd-oc-goal ${g.ok?'ready':'missing'}"><strong>${esc(g.label)}：${g.ok?'充足':g.unresolved?'未判定':'不足'}</strong><span>${esc(g.detail)}</span></div>`).join('')}${result.shortages.map((g,index)=>`<div class="hd-oc-shortage"><b>${esc(g.label)}に必要なもの</b><p>${esc(g.detail)}。${g.capability?'同じ艦の推奨セットが未完成。下の装備別不足・配備可否を確認してね':g.kind==='高速化'?(g.goalKind==='speed-ship'?'缶の種類・改修値・同じ艦への配備、到達可能な速力を確認':`同じ艦のセットがあと ${Math.ceil(g.shortfall)}組。タービン・缶の内訳を確認してね`):['制空','索敵'].includes(g.kind)&&['air-value','los-value'].includes(g.goalKind||g.kind)?'性能・搭載枠を増やす必要あり':`配備不足 ${Math.ceil(g.shortfall)}個 / 同種の所持 ${g.owned}個`}。${g.placement&&!g.blocked&&!g.capability?'所持数は足りています。装備可否・配備枠・他の条件との両立を見直してね。':''}${g.candidates.length?'装備候補：'+esc(g.candidates.join('、')):'この編成に載せられる候補なし。艦種や装備枠を見直してね。'}</p><button type="button" class="ghost small" data-hd-oc-acquire="${esc(g.kind.startsWith('speed-')?'高速化':g.kind)}" ${attrs}>入手方法を見る</button>${hdOCPlacementHtml(g)}${hdOCProcurementHtml(g,index,attrs)}</div>`).join('')}<div class="hd-oc-ships">${result.plan.ships.map(s=>`<p><b>${esc(s.ship)}</b><span>${esc([...s.items.map(x=>`第${x.slotIndex+1}：${x.name}${x.star?' ★'+x.star:''}`),...(s.expansion?[`増設：${s.expansion.name}${s.expansion.star?' ★'+s.expansion.star:''}`]:[])].join(' / ')||'配備なし')}</span></p>`).join('')}</div>${hdOCReviewHtml(reviews,attrs)}${hdOCProcurementUpdateHtml(c,result,attrs)}<button type="button" class="primary small" data-hd-oc-calculator ${attrs}>この配備で制空・索敵を確認</button><small>探索した配備案を制空・索敵プランナーへ反映済み。司令部Lvは同期値を使用します。</small><button type="button" class="ghost small" data-hd-oc-apply ${attrs}>${result.measure.complete?'この配備を保存編成に反映':'不足を残した配備案を保存'}</button><small>登録済み目安・制空は熟練度なしの推定。探索で見つからない組み合わせもあります。保存後はゲーム側の装備を変更し、基地航空隊・ルート条件も確認してね。</small></div>`:''}</section>`;
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
 const choices=presets.length?`<label class="hd-oc-inline-route">攻略する編成例 <select data-hd-oc-inline-route data-hd-oc-map="${hdFEEsc(map)}">${presets.map((p,i)=>`<option value="${i}" ${i===c.index?'selected':''}>${hdFEEsc((p.name||`候補${i+1}`)+(p.use?' ｜ '+p.use:''))}</option>`).join('')}</select></label>`:'<p>編成例のルート条件は別途確認してね。</p>';
 return `<div class="hd-oc-inline">${choices}${hdOCPanel(map,fleetId,c.index)}</div>`;
}
function hdOCInlineRefresh(){if(typeof renderCustomFleets==='function'&&typeof selectedMap!=='undefined'&&selectedMap)renderCustomFleets(selectedMap)}
document.addEventListener('change',e=>{if(e.target.id==='hdMapStrategyRoute'){setTimeout(hdOCInlineRefresh,0);return}if(!e.target.matches?.('[data-hd-oc-inline-route]'))return;const map=e.target.dataset.hdOcMap,index=Number(e.target.value);if(typeof hdMapRouteSet==='function'){if(!hdMapRouteSet(map,index))hdOCRefresh();return}if(typeof hdMSNRouteByMap!=='undefined')hdMSNRouteByMap[map]=index;hdOCRefresh()});
window.addEventListener('hd:map-route-changed',hdOCRefresh);
['hd:equipment-changed','hd:kancolle-sync','hd:custom-fleets-changed','hd:ship-identity-changed','hd:workspace-refresh'].forEach(event=>window.addEventListener(event,hdOCInlineRefresh));
window.addEventListener('storage',e=>{if(e.key==='harbordesk-map-routes-v1'){hdOCRefresh();return}if(e.key===null||['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-kancolle-sync-v1'].includes(e.key))hdOCInlineRefresh()});
window.addEventListener('hd:map-air-changed',()=>hdOCRefresh());
function hdOCRefresh(){hdOCInlineRefresh();if(typeof hdRenderMapEquipmentRecommendations==='function')hdRenderMapEquipmentRecommendations();if(typeof hdMSNRender==='function')hdMSNRender()}
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-hd-oc-search],[data-hd-oc-calculator],[data-hd-oc-apply],[data-hd-oc-acquire],[data-hd-oc-select-fleet],[data-hd-oc-procure],[data-hd-oc-procurement-update],[data-hd-oc-review]');if(!button)return;
 if(button.hasAttribute('data-hd-oc-review')){
  const action=button.dataset.hdOcReview,map=button.dataset.hdOcMap;
  if(action==='route'){hdMSNOpen(map);return}
  if(action==='calculator'||action==='base'){
   if(action==='calculator'){
    const c=hdOCContext(map,button.dataset.hdOcFleet,button.dataset.hdOcRoute),result=HD_OC_CACHE.get(`${c.map}:${c.fleet?.id}:${c.index}`);
    if(!result||typeof hdFCImportOwnedPlan==='function'&&!hdFCImportOwnedPlan(c,result)){hdToast('最新の条件で配備を探してから計算してね','warn');return}
   }
   if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(map);
   if(typeof hdFEOpenCalculator==='function')hdFEOpenCalculator();
   if(action==='base'&&typeof hdFEDeferNavigation==='function')hdFEDeferNavigation(()=>document.getElementById('hdLandBasePlanner')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
   return;
  }
  const target={sync:'kancolleImport',equipment:'equipmentBook',ships:'shipDatabase'}[action];if(target&&typeof hdQNJump==='function')hdQNJump(target);else if(target&&typeof hdWSShowElement==='function')hdWSShowElement(target,true);return;
 }
 if(button.hasAttribute('data-hd-oc-select-fleet')){hdOCOpenFleetPicker(button.dataset.hdOcMap,button.dataset.hdOcFleet);return}
 const c=hdOCContext(button.dataset.hdOcMap,button.dataset.hdOcFleet,button.dataset.hdOcRoute);if(!c.fleet)return;
 const key=`${c.map}:${c.fleet.id}:${c.index}`;
 if(button.hasAttribute('data-hd-oc-acquire')){if(typeof hdAGOpen==='function')hdAGOpen(button.dataset.hdOcAcquire,c.map);return}
 if(button.hasAttribute('data-hd-oc-search')){
  const signature=hdOCSignature(c);if(HD_OC_PENDING.get(key)?.signature===signature)return;
  const pending={signature};HD_OC_PENDING.set(key,pending);button.disabled=true;button.textContent='手持ち装備を確認中…';
  const finish=()=>{if(HD_OC_PENDING.get(key)===pending)HD_OC_PENDING.delete(key)};
  hdOCSearchAsync(c).then(result=>{finish();HD_OC_CACHE.set(key,result);if(typeof hdFCImportOwnedPlan==='function')hdFCImportOwnedPlan(c,result);hdOCRefresh()}).catch(err=>{
   finish();button.disabled=false;button.textContent='手持ちで条件を満たす配備を探す';hdOCRefresh();
   hdToast(err.code==='HD_OC_STALE'?'編成や台帳が更新されたので、もう一度配備を探してね':'配備案を作れなかったよ。編成と台帳を確認してね','warn');
  });return;
 }
 const result=HD_OC_CACHE.get(key);if(!result||result.signature!==hdOCSignature(c)){hdToast('編成や台帳が変わったので、もう一度配備を探してね','warn');hdOCRefresh();return}
 if(button.hasAttribute('data-hd-oc-calculator')){
  if(typeof hdFCImportOwnedPlan==='function'&&!hdFCImportOwnedPlan(c,result))return;
  if(typeof hdSelectGuideMap==='function')hdSelectGuideMap(c.map);
  if(typeof hdFEOpenCalculator==='function')hdFEOpenCalculator();return;
 }
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
 if(c.preset)fleet.routePreset={...c.preset};
 try{saveCustomFleets(all)}catch{hdToast('保存できなかったよ。配備案は残しているので再試行してね','warn');return}
 HD_OC_CACHE.delete(key);hdToast('配備案を保存したよ。ゲーム側でも装備を変更してね','success');hdOCRefresh();
});
const hdOCPrev=hdSortieEquipmentCheckHtml;hdSortieEquipmentCheckHtml=function(map){return hdOCPrev(map)+hdOCPanel(map)};
hdOCRefresh();
