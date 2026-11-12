'use strict';
// The entire finite input is one count-based stock row and four normal frames.
// No fixed-frame flag or game equipment-instance identity is part of this input.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createTwoFiveCeioModelContext}=require('./fixtures/two-five-ceio-model-context.cjs');
const ROOT=path.resolve(__dirname,'..'),ATTACK='九七式艦攻',KEY=ATTACK+'@@0',DD=['夕立改二','時雨改二','綾波改二','島風改'];
const CASES=[
 {map:'1-3',goal:'normal',path:'CFJ / A(DB)EFJ',contractPath:'CFJ / A(DB)EFJ',names:['飛鷹改','夕張改二特',...DD]},
 {map:'1-3',goal:'cfj',path:'CFJ',contractPath:'CFJ / A(DB)EFJ',names:['飛鷹改','夕張改二特',...DD]},
 {map:'1-4',goal:'j-avoid',path:'BCFEHL / ADEHL',contractPath:'BCF(E)HL / AD(EH/GJ)L',names:['飛鷹改','大鯨',...DD]}
];
const MASTER_IDS={'飛鷹改':283,'夕張改二特':623,'大鯨':184,'夕立改二':144,'時雨改二':145,'綾波改二':195,'島風改':229};
const raw=fs.readFileSync(path.join(ROOT,'ship-master-snapshot.js'),'utf8'),prefix='window.HD_KANCOLLE_MASTER_SNAPSHOT=';
assert.equal(raw.split(prefix).length,2);
const SNAPSHOT=JSON.parse(raw.split(prefix)[1].trim().replace(/;$/,''));
const host=value=>JSON.parse(JSON.stringify(value));

function independentUniverse(spec){
 // Plain master data, not resolver/compatibility/search results, defines this
 // small candidate set. Equipment type8, id16 has no special picker override.
 assert.equal(SNAPSHOT.equipment[ATTACK].id,16);
 assert.equal(SNAPSHOT.equipment[ATTACK].typeId,8);
 assert.equal(SNAPSHOT.equipment[ATTACK].stats.対空,0);
 for(const field of ['pickerTypeOverrides','equipTypeSpOverrides'])assert.equal(Object.hasOwn(SNAPSHOT.clientRules[field],'16'),false);
 const frames=[];
 for(const name of spec.names){
  const matches=Object.values(SNAPSHOT.allShips).filter(row=>row.name===name);
  assert.equal(matches.length,1,name+' has one independent master row');
  const row=matches[0],profile=SNAPSHOT.ships[name]||{...row,equipRules:SNAPSHOT.shipEquipOverrides[String(row.id)]||SNAPSHOT.stypeEquipRules[String(row.stype)]},rules=profile.equipRules;
  assert.equal(row.id,MASTER_IDS[name]);
  const permitted=Object.hasOwn(rules,'8')&&(rules['8']===null||rules['8'].includes(16));
  assert.equal(permitted,name==='飛鷹改',name+' type8 permission comes from independent source data');
  if(!permitted)continue;
  assert.equal(row.stype,7);
  assert.equal(Object.hasOwn(SNAPSHOT.ships,name),false);
  assert.equal(Object.hasOwn(SNAPSHOT.shipEquipOverrides,String(row.id)),false);
  assert.deepEqual(row.slots,[18,18,18,12]);
  assert.equal(rules['8'],null);
  row.slots.forEach((capacity,index)=>{
   assert.ok(capacity>0);
   for(const restriction of SNAPSHOT.clientRules.slotExclusions){
    if(!restriction.shipIds.includes(row.id)||!(restriction.fromSlot?index>=restriction.slot:index===restriction.slot))continue;
    assert.equal(Object.hasOwn(restriction,'allowOnly')&&!restriction.allowOnly.includes(8),false);
    assert.equal((restriction.exclude||[]).includes(8),false);
   }
   frames.push({ship:name,shipIndex:0,masterId:row.id,index,capacity});
  });
 }
 assert.equal(frames.length,4);
 // The sole symbolic occurrence is either unassigned or in exactly one of
 // these four frames. This is not a claim about real game instance IDs.
 const states=[[],...frames.map(frame=>[{...frame,symbolicOccurrence:'attack-0'}])];
 assert.equal(states.length,5);
 assert.equal(states.filter(state=>state.length===1).length,4);
 assert.equal(Math.max(...states.map(state=>new Set(state.map(row=>row.ship)).size)),1);
 return {frames,states};
}

function setup(spec){
 const h=createTwoFiveCeioModelContext({root:ROOT}),{c}=h;
 const rows=spec.names.map((name,i)=>{
  const db=c.hdFEFindShip(name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);
  assert.equal(master.id,MASTER_IDS[name]);
  return {id:'one-area-finite-carrier-'+i,name,masterId:master.id,gameShipId:731000+i,level:90,gameLos:100,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',metadata:{keep:i}};
 });
 h.seed('harbordesk-ship-roster-v1',rows);
 h.seed('harbordesk-equipment-v1',[{name:ATTACK,count:1,star:0}]);
 h.seed('harbordesk-kancolle-sync-v1',{admiralLevel:120,metadata:{keep:true}});
 h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]);
 const preset=h.value('MAP_PLANS['+JSON.stringify(spec.map)+'].presets[0]');
 const fleet={id:spec.map==='1-3'?'starter-finite-13':'starter-finite-14',name:'synthetic finite carrier',routePreset:preset,routeGoal:spec.goal,openingAswCount:0,memo:'keep memo',metadata:{keep:true},ships:rows.map(row=>({ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,rosterId:row.id,gear:row.gameGearSlots.join(' / '),metadata:row.metadata}))};
 h.seed('harbordesk-custom-fleets-v1',{[spec.map]:[fleet,{id:'other-fleet',ships:[],metadata:{keep:true}}],'1-1':[{id:'other-map',ships:[],metadata:{keep:true}}]});
 return {h,c,spec,ctx:{map:spec.map,index:0,preset,fleet},attack:c.hdFEFind(ATTACK)};
}
function measured(u){
 const built=u.c.hdOCBuild(u.ctx),requirements=u.c.hdFEEquipmentRequirements(built.plan,u.c.hdSEChecks(u.spec.map).rows);
 return {built,requirements,measure:u.c.hdOCMeasure(built.plan,requirements,built.unknown)};
}
function unchanged(u,action){
 const before=JSON.stringify(u.ctx),stored=JSON.stringify([...u.h.store]),result=action();
 assert.equal(JSON.stringify(u.ctx),before,'search/measurement preserves the complete source fleet and selection');
 assert.equal(JSON.stringify([...u.h.store]),stored,'no synthetic saved key changes');
 assert.equal(u.h.writes.length,0);
 return result;
}
function search(u){return unchanged(u,()=>{const steps=u.c.hdOCSearchSteps(u.ctx);let step;do{step=u.c.hdFEWithShipLookup(()=>steps.next());}while(!step.done);return step.value;});}
function assignments(plan){
 return plan.ships.flatMap((ship,shipIndex)=>[...(ship.items||[]).filter(item=>item.name===ATTACK).map(item=>({ship:ship.ship,shipIndex,gameShipId:ship.gameShipId,rosterId:ship.rosterId,masterId:ship.masterId,item,expansion:false})),...(ship.expansion?.name===ATTACK?[{ship:ship.ship,shipIndex,item:ship.expansion,expansion:true}]:[])]);
}
function assertPreservedRoute(u,plan,initial){
 const {c,spec}=u,contract=c.hdFERouteRequirementData(plan),branch=c.hdFEBranchRoute(plan);
 assert.equal(plan.routeGoal,spec.goal);
 assert.equal(contract.index,0);
 assert.equal(contract.path,spec.contractPath);
 assert.equal(branch.path,spec.path);
 assert.equal(branch.status,'ready');
 assert.deepEqual(host(c.hdFERoute(plan)),host(c.hdFERoute(initial.built.plan)));
 assert.deepEqual(host(c.hdFEEquipmentRequirements(plan,c.hdSEChecks(spec.map).rows)),host(initial.requirements));
 assert.equal(c.hdOCGoalRegressions(initial.measure,c.hdOCMeasure(plan,initial.requirements,initial.built.unknown)).length,0);
 assert.equal(plan.openingAswCount,0);
 assert.equal(c.hdFEPlanSpeedTarget(plan),0,'selected low-speed-compatible routes add no speed target');
}
function assertGoalSeparation(u,plan,measure,expectedCoverage){
 const {c}=u,carrier=measure.goals.find(goal=>goal.kind==='cap-carrier-attack');
 assert.ok(carrier);
 assert.equal(carrier.minCount,1);
 assert.equal(carrier.generatedFromMap,true);
 assert.equal(carrier.purpose,'recommendation');
 assert.equal(c.hdOCItemMatches('制空',u.attack),false,'AA0 attack is not a generic air-count item');
 assert.equal(carrier.count,expectedCoverage);
 assert.equal(carrier.ok,expectedCoverage===1);
 // equipmentKinds is an allow-list, not a list of active goals. Neither
 // registered map text/graph calls for night equipment under the auto policy.
 // Do not transplant a remaining night objective from the two-area fixture.
 assert.equal(measure.goals.some(goal=>goal.kind.startsWith('cap-night-')),false);
 assert.equal(measure.routeStatus,'ready');
 for(const goal of measure.goals.filter(goal=>goal.unresolved)){
  assert.equal(c.hdOCStockGap(goal),0,'information gaps do not become confirmed purchase quantities');
  assert.equal(c.hdOCShortageGoals(measure).includes(goal),false);
 }
 const air=measure.goals.find(goal=>goal.kind==='制空');
 if(u.spec.map==='1-3'){
  assert.equal(air,undefined);
  assert.equal(measure.goals.some(goal=>goal.kind==='air-value'),false,'no numeric air gate is added to this registered route');
  assert.equal(measure.complete,expectedCoverage===1,'only this registered goal set is met; combat success remains separate');
 }else{
  assert.ok(air);
  assert.equal(air.count,0);
  assert.equal(air.minCount,2);
  assert.equal(air.ok,false);
  const aa=measure.goals.find(goal=>goal.kind==='cap-aa');
  assert.ok(aa);
  assert.equal(aa.count,0);
  assert.equal(aa.minCount,1);
  assert.equal(aa.ok,false);
  assert.equal(measure.complete,false,'AA0 attack coverage does not satisfy the separate air-count and anti-air recommendations');
 }
 return carrier;
}

test('three selected starter-route searches match the independent one-copy/four-frame finite oracle',()=>{
 // Collect every actual result before assessing the batch. No altered limits,
 // product helper stubs, historical projection, timer or browser is used.
 const cases=CASES.map(spec=>{const oracle=independentUniverse(spec),u=setup(spec),initial=unchanged(u,()=>measured(u)),result=search(u);return {oracle,u,initial,result};});
 for(const {oracle,u,initial,result}of cases){
  const {c}=u,placed=assignments(result.plan),carrier=assertGoalSeparation(u,result.plan,result.measure,1);
  assert.deepEqual(host(initial.requirements.map(row=>row.kind)),u.spec.map==='1-3'?['cap-carrier-attack']:['制空','cap-aa','cap-carrier-attack'],'actual needs are filtered by the selected registered route; the allow-list creates no extra goal');
  assert.equal(initial.built.inventory.length,1);
  assert.equal(initial.built.inventory[0].key,KEY);
  assert.equal(initial.built.inventory[0].count,1);
  assert.equal(u.ctx.fleet.ships.every(ship=>ship.gear.split(' / ').every(label=>label==='')),true,'input has no currently equipped or fixed frames');
  assert.equal(initial.built.slots.some(slot=>slot.expansion),false);
  assert.equal(placed.length,1);
  assert.equal(carrier.count,1);
  assert.equal(carrier.ok,true);
  const row=placed[0],frame=oracle.frames.find(frame=>frame.ship===row.ship&&frame.index===row.item.slotIndex);
  assert.ok(frame,'returned placement belongs to the independent universe');
  assert.equal(row.expansion,false);
  assert.equal(row.shipIndex,0);
  assert.equal(row.masterId,283);
  assert.equal(row.gameShipId,731000);
  assert.equal(row.rosterId,'one-area-finite-carrier-0');
  assert.equal(row.item.capacity,frame.capacity);
  assert.equal(row.item.stackKey,KEY);
  assert.equal(Number(row.item.star||0),0);
  assert.equal(c.hdShipDbMasterCompatible(u.attack,c.hdFEFindShip(row.ship)),true);
  for(const slot of initial.built.slots)assert.equal(c.hdOCCompatible(slot,initial.built.inventory[0]),slot.si===0,'only the four known carrier normal frames accept this stock');
  const used=c.hdFOAssignedUsage(result.plan);
  assert.deepEqual(host(used),{[KEY]:1},'count-based occurrence usage is finite; no real item-ID claim');
  assert.equal(result.shortages.some(goal=>goal.goalKind==='cap-carrier-attack'),false);
  assertPreservedRoute(u,result.plan,initial);
  assert.equal(result.search.status,u.spec.map==='1-3'?'targets-met':'incomplete');
  assert.equal(result.search.exhaustive,false);
  assert.equal(result.search.maxExamined,10000);
  assert.equal(result.search.maxDepth,24);
  assert.equal(result.examined,oracle.states.length-1,'the source evaluates all four nonempty states before its next-depth target check');
  assert.deepEqual(host(result.search.reasons),['bounded-search']);
  assert.equal(result.plan.search,result.search);
  const notice=unchanged(u,()=>c.hdOCSearchStatusHtml(result));
  if(u.spec.map==='1-3')assert.equal(notice,'','met registered goals have no incomplete-search notice');
  else{
   assert.match(notice,/探索未完了/);
   assert.match(notice,/未充足は、手持ち装備の不足を証明するものではありません/);
   assert.match(notice,/網羅性・最適性は保証しません/);
  }
 }
});

test('all five independent states distinguish unassigned stock from optional carrier coverage and other goals',()=>{
 for(const spec of CASES){
  const oracle=independentUniverse(spec),u=setup(spec),initial=unchanged(u,()=>measured(u));
  for(const state of oracle.states){
   const plan=host(initial.built.plan);
   for(const placement of state)plan.ships[placement.shipIndex].items[placement.index]={name:ATTACK,star:0,stackKey:KEY,category:'艦上攻撃機',slotIndex:placement.index,capacity:placement.capacity};
   const before=JSON.stringify(plan),measure=unchanged(u,()=>u.c.hdOCMeasure(plan,initial.requirements,initial.built.unknown)),goal=assertGoalSeparation(u,plan,measure,state.length);
   assert.equal(JSON.stringify(plan),before,'candidate assessment is read-only');
   assert.equal(assignments(plan).length,state.length);
   assert.equal(goal.count,state.length);
   assert.equal(goal.ok,state.length===1);
   const stock=unchanged(u,()=>u.c.hdSECapabilityStock(plan,'cap-carrier-attack',1));
   assert.equal(stock.complete,true,'registered count is present even when unassigned');
   assert.equal(stock.usable.complete,true,'the four independently legal frames permit the one-item recipe');
   assert.equal(stock.parts[0].have,1);
   assert.equal(stock.parts[0].need,1);
   assert.equal(u.c.hdFOAssignedUsage(plan)[KEY]||0,state.length);
   assertPreservedRoute(u,plan,initial);
   assert.equal(u.c.hdOCShortageGoals(measure).some(row=>row.kind==='cap-carrier-attack'),state.length===0,'allocation absence is distinct from inventory absence and from unrelated missing goals');
  }
 }
});
