"use strict";
// Starter-carrier placement is catalog guidance, separate from allocation and route gates.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createTwoFiveCeioModelContext}=require('./fixtures/two-five-ceio-model-context.cjs');
const {createCarrierGuidanceHistoricalProjection}=require('./fixtures/carrier-guidance-source-layer.cjs');
const {createSurfaceNightPlacementHistoricalProjection}=require('./fixtures/surface-night-placement-source-layer.cjs');
const ROOT=path.resolve(__dirname,'..'),host=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const DD=['夕立改二','時雨改二','綾波改二','島風改'];
// Identical input names, IDs, empty inventory and fleet order to the four retained
// source-88 negative controls. This suite executes only the current positive producer.
const CASES=[
 ['1-3','normal',['飛鷹改','夕張改二特',...DD],['飛鷹改']],
 ['1-3','cfj',['飛鷹改','夕張改二特',...DD],['飛鷹改']],
 ['1-4','normal',['飛鷹改','隼鷹改',...DD],['飛鷹改','隼鷹改']],
 ['1-4','j-avoid',['飛鷹改','大鯨',...DD],['飛鷹改']]
];
function context(options={}){return createTwoFiveCeioModelContext({root:ROOT,...options})}
function input(h,map,routeGoal,names){
 const {c}=h,rows=names.map((name,i)=>{const db=c.hdFEFindShip(name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);assert.ok(master&&profile,name+' actual master');return {id:'carrier-probe-'+i,name,masterId:master.id,gameShipId:427000+i,level:90,gameSlotEx:0,gameLos:100,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:''}});
 h.seed('harbordesk-ship-roster-v1',rows);h.seed('harbordesk-equipment-v1',[]);h.seed('harbordesk-kancolle-sync-v1',{admiralLevel:120});h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(x=>({gameShipId:x.gameShipId,gearKnown:true}))}]);
 const preset=h.value('MAP_PLANS['+JSON.stringify(map)+'].presets[0]'),fleet={id:'carrier-probe',routePreset:preset,routeGoal,openingAswCount:0,ships:rows.map(x=>({ship:x.name,masterId:x.masterId,gameShipId:x.gameShipId,rosterId:x.id,gear:x.gameGearSlots.join(' / ')}))};return {map,index:0,preset,fleet};
}
function plan(h,map='1-3',routeGoal='normal',names=['飛鷹改']){
 const preset=h.value('MAP_PLANS['+JSON.stringify(map)+'].presets[0]'),fleet={id:'carrier-unit',routePreset:preset,routeGoal,memo:'retained note',metadata:{keep:true},ships:names.map((ship,i)=>({ship,gear:'',metadata:{index:i}}))},p=h.c.hdFEPlanFromSavedFleet(map,fleet);p.routeIndex=0;p.openingAswCount=0;return p;
}
const recommendation=()=>({kind:'cap-carrier-attack',label:'空母の攻撃機配備',minCount:1,count:0,generatedFromMap:true,purpose:'recommendation'});
function targets(h,p,g=recommendation()){const before=JSON.stringify({plan:p,goal:g}),result=h.c.hdOCThreeThreeCarrierTargets(p,g);assert.equal(JSON.stringify({plan:p,goal:g}),before,'inspection preserves full plan and goal inputs');return result}
function synthetic(h,{name='Synthetic Carrier',slots=[8,8],rules={'7':null,'8':null},profile=true}={}){
 // Synthetic table data exercises the actual resolver/profile/master/slot logic.
 // No product function is replaced or copied into the test.
 h.value('HD_SHIP_DATABASE.push('+JSON.stringify({base:name,final:name,type:'軽空母',speed:'低速',roles:[]})+')');
 if(profile)h.value('HD_SHIP_SLOT_PROFILES['+JSON.stringify(name)+']='+JSON.stringify({id:990001,ctype:990,stype:7,slots,equipRules:rules,flags:[]}));
 return plan(h,'1-3','normal',[name]);
}
function onlyCatalog(h,names){h.c.HD_EQUIPMENT_CATALOG=names.map(name=>{const item=h.c.hdFEFind(name);assert.ok(item,name+' real catalog item');return item});assert.equal(h.c.hdFLCatalog(),h.c.HD_EQUIPMENT_CATALOG,'actual catalog honors the existing window override')}
function row(h,p){const rows=targets(h,p);assert.equal(rows.length,1);return rows[0]}
function assertReason(result,status,reason){assert.equal(result.status,status);assert.equal(result.reason,reason);assert.equal(result.placementScope,'starter-carrier');assert.equal(result.normalOnly,true);assert.equal(result.count,1)}

test('starter-carrier approved inverse restores exact preceding source and rejects unapproved or double projection',()=>{
 const approved=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/carrier-guidance-approved-source-inverses.json'),'utf8')),project=createCarrierGuidanceHistoricalProjection(ROOT),projectSurfaceNight=createSurfaceNightPlacementHistoricalProjection(ROOT);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'76357fe00d44ed3a2ef2e22fbbb4f111e12380b3');assert.deepEqual(Object.keys(approved.files),['owned-equipment-planner.js']);
 const file='owned-equipment-planner.js',raw=fs.readFileSync(path.join(ROOT,file),'utf8'),current=projectSurfaceNight(file,raw),before=project(file,raw);assert.equal(hash(before),'09559c3b7365b84141b65f3f58b3d9f91bb93c971ecccf20378086348597fbdd');assert.equal(hash(current),approved.files[file].approvedAfterSHA256);assert.notEqual(before,current);assert.throws(()=>project(file,raw+'\n'));assert.throws(()=>project(file,before));assert.equal(project('unrelated.js','unchanged'),'unchanged');
});

for(const [map,routeGoal,names,carriers]of CASES)test(map+' '+routeGoal+' actual shortage producer identifies each unequipped carrier and its four normal slots',()=>{
 const h=context(),{c}=h,ctx=input(h,map,routeGoal,names),original=JSON.stringify(ctx),stored=JSON.stringify([...h.store]),steps=c.hdOCSearchSteps(ctx);let step;do{step=c.hdFEWithShipLookup(()=>steps.next())}while(!step.done);const result=step.value,goal=result.measure.goals.find(x=>x.kind==='cap-carrier-attack'),shortage=result.shortages.find(x=>x.goalKind==='cap-carrier-attack');
 assert.ok(goal&&shortage);assert.equal(goal.minCount,carriers.length);assert.equal(goal.count,0);assert.equal(goal.ok,false);assert.equal(goal.purpose,'recommendation');assert.equal(goal.generatedFromMap,true);assert.equal(result.plan.routeGoal,routeGoal);assert.equal(c.hdFEBranchRoute(result.plan).status,'ready');
 assert.deepEqual(host(shortage.carrierTargets.map(x=>x.ship)),carriers);assert.deepEqual(host(shortage.carrierTargets.map(x=>x.slots.map(y=>y.index))),carriers.map(()=>[0,1,2,3]));for(const target of shortage.carrierTargets){assertReason(target,'candidate','candidate');assert.equal(target.unknownSlots,false);for(const slot of target.slots){assert.ok(slot.candidates.length>0&&slot.candidates.length<=3);for(const name of slot.candidates)assert.ok(['艦上攻撃機','艦上爆撃機','噴式戦闘爆撃機'].includes(c.hdFEFind(name)?.category))}}
 const html=c.hdOCCapabilityStockHtml(shortage);assert.equal((html.match(/data-hd-oc-carrier-target-row=/g)||[]).length,carriers.length);assert.match(html,/data-hd-oc-carrier-scope-note/);assert.match(html,/通常枠/);assert.match(html,/購入数量ではありません/);assert.equal(shortage.stock.parts[0].have,0);assert.equal(shortage.stock.parts[0].need,carriers.length);assert.equal(result.search.maxExamined,10000);assert.equal(result.search.maxDepth,24);assert.equal(result.search.exhaustive,false);assert.equal(result.examined,0);assert.equal(result.search.status,'incomplete');assert.equal(JSON.stringify(ctx),original);assert.equal(JSON.stringify([...h.store]),stored);assert.equal(h.writes.length,0);
 // Existing controls were already executed. Compare only actual model/route/build
 // projections here; do not execute the old generator for a fifth baseline trial.
 const before=context({project:createCarrierGuidanceHistoricalProjection(ROOT)}),beforeCtx=input(before,map,routeGoal,names),built=before.c.hdOCBuild(beforeCtx),requirements=before.c.hdFEEquipmentRequirements(built.plan,before.c.hdSEChecks(map).rows);assert.deepEqual(host(c.hdFERouteRequirementData(result.plan)),host(before.c.hdFERouteRequirementData(built.plan)));assert.deepEqual(host(c.hdFERoute(result.plan)),host(before.c.hdFERoute(built.plan)));assert.deepEqual(host(result.measure),host(before.c.hdOCMeasure(built.plan,requirements,built.unknown)));assert.equal(JSON.stringify(result.plan.sourceFleet),JSON.stringify(built.plan.sourceFleet));assert.equal(JSON.stringify(result.plan.preset),JSON.stringify(built.plan.preset));assert.equal(result.plan.routeGoal,built.plan.routeGoal);
});

test('starter scope accepts only the documented generated recommendation and recognized canonical selections',()=>{
 const h=context();for(const [map,id]of [['1-3','normal'],['1-3','cfj'],['1-4','normal'],['1-4','j-avoid']])assert.equal(h.c.hdOCStarterCarrierScope(plan(h,map,id),recommendation()),true);
 const p=plan(h),g=recommendation();for(const emptyPlan of [null,{}]){assert.equal(h.c.hdOCStarterCarrierScope(emptyPlan,g),false);assert.equal(targets(h,emptyPlan,g),null)}for(const defaultGoal of [undefined,null,''])assert.equal(h.c.hdOCStarterCarrierScope({...p,routeGoal:defaultGoal},g),true);for(const invalid of [null,{}, {...g,kind:'cap-water-attack'},{...g,generatedFromMap:false},{...g,generatedFromMap:1},{...g,purpose:'strategy'},{...g,purpose:undefined}]){assert.equal(h.c.hdOCStarterCarrierScope(p,invalid),false);assert.equal(targets(h,p,invalid),null)}
 for(const routeGoal of ['unknown','constructor','__proto__',0,{},[]]){const changed={...p,routeGoal};assert.equal(h.c.hdOCStarterCarrierScope(changed,g),false);assert.equal(targets(h,changed,g),null)}
 for(const index of [1,-1,'0'])assert.equal(h.c.hdOCStarterCarrierScope({...p,routeIndex:index},g),false);assert.equal(h.c.hdOCStarterCarrierScope({...p,preset:{name:'unregistered',ships:'unknown'}},g),false);assert.equal(h.c.hdOCStarterCarrierScope({...p,map:'unknown'},g),false);
});

test('mismatched contract path target flag index or branch source remains outside the new scope',()=>{
 for(const change of ["HD_MAP_ROUTE_REQUIREMENTS['1-3'][0].map='1-4'","HD_MAP_ROUTE_REQUIREMENTS['1-3'][0].path='unknown'","HD_MAP_ROUTE_REQUIREMENTS['1-3'][0].carrierAttackTarget=false","HD_MAP_ROUTE_REQUIREMENTS['1-3'][0].index=1","MAP_PLANS['1-3'].routeBranches.path='unknown'"]){const h=context(),p=plan(h);h.value(change);assert.equal(h.c.hdOCStarterCarrierScope(p,recommendation()),false);assert.equal(targets(h,p),null)}
});

test('explicit user carrier quantities remain strategy goals and do not receive the generated starter decoration',()=>{
 const h=context(),p=plan(h),user={kind:'cap-carrier-attack',minCount:3,generatedFromMap:false,purpose:'strategy'},requirements=h.c.hdFEEquipmentRequirements(p,[user]),measure=h.c.hdOCMeasure(p,requirements),goal=measure.goals.find(x=>x.kind==='cap-carrier-attack');assert.equal(goal.minCount,3);assert.equal(goal.generatedFromMap,false);assert.equal(goal.purpose,'strategy');assert.equal(targets(h,p,goal),null);assert.equal(h.writes.length,0);
});

test('unknown hulls tenders waterplane carriers and already equipped carriers do not become missing carrier targets',()=>{
 const h=context(),p=plan(h,'1-3','normal',['大鯨','日進甲','伊勢改二','unregistered ship']);assert.deepEqual(host(targets(h,p)),[]);
 const mixed=plan(h,'1-3','normal',['飛鷹改','unregistered ship','大鯨']);assert.deepEqual(host(targets(h,mixed).map(x=>x.ship)),['飛鷹改']);const requirements=h.c.hdFEEquipmentRequirements(mixed,h.c.hdSEChecks('1-3').rows);assert.equal(requirements.find(x=>x.kind==='cap-carrier-attack').minCount,1,'only the actual known carrier contributes');
 mixed.ships[0].items=[{name:'流星',star:0,slotIndex:0,capacity:18}];assert.equal(h.c.hdSECapabilityMeasure({ships:[mixed.ships[0]]},'cap-carrier-attack').count,1);assert.deepEqual(host(targets(h,mixed)),[]);
});

test('catalog placement stays separate from finite stock and from occupied or currently equipped slots',()=>{
 const h=context(),p=plan(h);h.seed('harbordesk-equipment-v1',[]);const empty=host(targets(h,p));h.seed('harbordesk-equipment-v1',[{name:'流星',count:1,star:0}]);assert.deepEqual(host(targets(h,p)),empty,'catalog candidates are not an inventory allocation');assert.equal(h.c.hdFLInventory().get(h.c.hdFLInventoryStackKey('流星',0)).count,1);
 p.ships[0].items=[{name:'零式艦戦52型',star:0,slotIndex:0,capacity:18}];p.ships[0].missing=[{kind:'retain-marker'}];const snapshot=JSON.stringify(p);assert.deepEqual(host(targets(h,p)),empty,'an occupied normal slot can be an exchange candidate without changing gear');assert.equal(JSON.stringify(p),snapshot);
});

test('normal carrier candidates do not borrow the current aircraft-ineligible expansion permission',()=>{
 const h=context(),p=plan(h),db=h.c.hdFEFindShip('飛鷹改'),profile=h.c.hdShipDbSlotProfile(db),item=h.c.hdFEFind('流星');assert.equal(h.c.hdOCCompatible({db,profile,index:0,capacity:18,expansion:false},{item,star:0}),true);assert.equal(h.c.hdOCCompatible({db,profile,index:0,capacity:null,expansion:true},{item,star:0}),false);
 p.ships[0].expansion={name:'流星',star:0};const target=row(h,p);assertReason(target,'candidate','candidate');assert.deepEqual(host(target.slots.map(x=>x.index)),[0,1,2,3]);assert.equal(h.c.hdSECapabilityMeasure(p,'cap-carrier-attack').count,0,'this aircraft and hull do not gain a valid equipped example through expansion');
});

test('actual hull permission distinguishes forbidden torpedo bombers from legal dive bombers and zero-capacity slots',()=>{
 const h=context(),p=plan(h,'1-3','normal',['鳳翔改二戦']),db=h.c.hdFEFindShip('鳳翔改二戦');assert.equal(h.c.hdShipDbMasterCompatible(h.c.hdFEFind('流星'),db),false);onlyCatalog(h,['流星']);assertReason(row(h,p),'blocked','hull-incompatible');
 // Use an independent real catalog category, not a patched compatibility helper.
 const dive=context(),divePlan=plan(dive,'1-3','normal',['鳳翔改二戦']);onlyCatalog(dive,['彗星']);const target=row(dive,divePlan);assertReason(target,'candidate','candidate');assert.deepEqual(host(target.slots.map(x=>x.index)),[0,1,2]);assert.equal(target.slots.some(x=>x.index===3),false);
});

test('actual slot restrictions exclude restricted normal slots and preserve the full original equipment data',()=>{
 const h=context(),p=synthetic(h);onlyCatalog(h,['流星']);h.value('HD_SLOT_EXCLUSION_RULES.push({shipIds:[990001],slot:0,allowOnly:[6]})');p.ships[0].items=[{name:'零式艦戦52型',star:7,slotIndex:0,capacity:8}];p.sourceFleet.metadata.extra='keep';const snapshot=JSON.stringify(p),target=row(h,p);assertReason(target,'candidate','candidate');assert.deepEqual(host(target.slots.map(x=>x.index)),[1]);assert.equal(JSON.stringify(p),snapshot);
 h.value('HD_SLOT_EXCLUSION_RULES.push({shipIds:[990001],slot:1,allowOnly:[6]})');assertReason(row(h,p),'blocked','slot-restricted');
});

test('known zero capacities remain blocked while absent or unknown slot information stays manual',()=>{
 const zero=context(),zp=synthetic(zero,{slots:[0,0]});onlyCatalog(zero,[]);assertReason(row(zero,zp),'blocked','no-positive-capacity');
 const absent=context(),ap=synthetic(absent,{profile:false});assertReason(row(absent,ap),'manual','profile-unknown');
 const unknown=context(),up=synthetic(unknown,{slots:[null,null]});assertReason(row(unknown,up),'manual','slot-info-unknown');
 const partly=context(),pp=synthetic(partly,{slots:[8,null]});onlyCatalog(partly,['流星']);const target=row(partly,pp);assertReason(target,'candidate','candidate');assert.equal(target.unknownSlots,true);assert.deepEqual(host(target.slots.map(x=>x.index)),[0]);
});

test('missing catalogue and unknown compatibility are not rewritten as inventory shortages or confirmed incompatibility',()=>{
 const h=context(),p=synthetic(h);onlyCatalog(h,[]);const missing=row(h,p);assertReason(missing,'manual','catalogue-unknown');assert.deepEqual(host(missing.slots),[]);
 const unknown=context(),up=synthetic(unknown);unknown.value("HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS['噴式戦闘爆撃機']=[]");unknown.c.HD_EQUIPMENT_CATALOG=[{name:'unknown jet fixture',category:'噴式戦闘爆撃機',stats:{},tags:[]}];assert.equal(unknown.c.hdFLCatalog(),unknown.c.HD_EQUIPMENT_CATALOG);assert.equal(unknown.c.hdShipDbMasterCompatible(unknown.c.HD_EQUIPMENT_CATALOG[0],unknown.c.hdFEFindShip(up.ships[0].ship)),null);assertReason(row(unknown,up),'manual','compatibility-unknown');
});

test('carrier inspection has no Storage or inventory reads writes timers or DOM access and returns fresh candidate lists',()=>{
 const h=context(),p=plan(h),goal=recommendation(),reads=h.reads.length,stored=JSON.stringify([...h.store]);assert.equal(h.c.hdOCStarterCarrierScope(p,goal),true);const first=targets(h,p,goal),expected=host(first);assert.equal(h.reads.length,reads);assert.equal(h.writes.length,0);assert.equal(JSON.stringify([...h.store]),stored);first[0].slots[0].candidates.push('outside mutation');first[0].slots.push({index:99,candidates:[]});assert.deepEqual(host(targets(h,p,goal)),expected);
});

test('unmodified legacy carrier target rows and HTML remain byte-equivalent for the existing 3-3 route',()=>{
 const h=context(),before=context({project:createCarrierGuidanceHistoricalProjection(ROOT)}),p=plan(h,'3-3','', ['飛鷹改']),old=host(p),g=recommendation(),current=targets(h,p,g),previous=before.c.hdOCThreeThreeCarrierTargets(old,g);assert.deepEqual(host(current),host(previous));assert.equal(Object.hasOwn(current[0],'placementScope'),false);const stock=h.c.hdSECapabilityStock(p,g.kind,1),goal={...g,goalKind:g.kind,capability:true,stock,carrierTargets:current};assert.equal(h.c.hdOCCapabilityStockHtml(goal),before.c.hdOCCapabilityStockHtml({...goal,carrierTargets:previous}));
});


test('stored starter-route choices keep per-fleet precedence without leaving prior goals',()=>{
 // Read the actual synthetic Storage value through the product getter. These
 // are build/measure checks only: none of the four retained searches is rerun.
 for(const [map,alternate,names,paths] of [
  ['1-3','cfj',CASES[0][2],{normal:'CFJ / A(DB)EFJ',cfj:'CFJ'}],
  ['1-4','j-avoid',CASES[3][2],{normal:'BCF(E)HL / AD(EH/GJ)L','j-avoid':'BCFEHL / ADEHL'}]
 ]){
  const h=context(),{c}=h,ctx=input(h,map,alternate,names),key=h.value('HD_OC_ROUTE_GOAL_KEY'),entry=map+':'+ctx.fleet.id;
  const outside=JSON.stringify([...h.store]),user={kind:'cap-carrier-attack',label:'explicit carrier quantity',minCount:3,generatedFromMap:false,purpose:'strategy'},userBefore=JSON.stringify(user);
  const build=(entries,saved=alternate)=>{
   ctx.fleet.routeGoal=saved;h.seed(key,entries);const before=JSON.stringify(ctx),stored=JSON.stringify([...h.store]),selected=c.hdOCRouteGoal(ctx),built=c.hdOCBuild(ctx);
   assert.equal(JSON.stringify(built.plan.routeGoal)===JSON.stringify(selected),true,'the actual build consumes the selected value');
   assert.equal(JSON.stringify(ctx)===before,true,'selection and build preserve the saved fleet');assert.equal(JSON.stringify([...h.store])===stored,true,'selection and build do not write Storage');
   assert.equal(JSON.stringify([...h.store].filter(([k])=>k!==key))===outside,true,'all unrelated synthetic keys remain exact');assert.equal(h.writes.length,0);
   return {...built,selected,branch:c.hdFEBranchRoute(built.plan)};
  };
  for(const [entries,saved,expected] of [
   [{},alternate,alternate],
   [{[entry]:'normal'},alternate,'normal'],
   [{[entry]:alternate},'normal',alternate],
   [{[map+':another-fleet']:'normal',['another-map:'+ctx.fleet.id]:'normal'},alternate,alternate],
   [{[entry]:null},alternate,alternate],
   [{[entry]:''},alternate,'normal'],
   [{},null,'normal'],
   [{},'','normal']
  ]){const result=build(entries,saved);assert.equal(result.selected,expected);assert.equal(result.branch.goal,expected);assert.equal(result.branch.path,paths[expected]);}
  const seen=new Map(),signatures=new Map();for(const selected of ['normal',alternate,'normal']){
   const result=build({[entry]:selected}),measure=c.hdOCMeasure(result.plan,c.hdSEChecks(map).rows,result.unknown),route=measure.goals.filter(g=>g.kind==='route-branches'),carrier=measure.goals.filter(g=>g.kind==='cap-carrier-attack');
   assert.equal(result.branch.goal,selected);assert.equal(result.branch.path,paths[selected]);assert.equal(result.branch.status,'ready');
   assert.equal(route.length,1);assert.equal(route[0].label,paths[selected]+'の分岐条件','only the current branch selection is displayed');
   assert.equal(carrier.length,1);assert.equal(carrier[0].minCount,1);assert.equal(carrier[0].count,0);assert.equal(carrier[0].purpose,'recommendation');assert.equal(carrier[0].generatedFromMap,true);
   const explicit=c.hdOCMeasure(result.plan,[user],result.unknown).goals.find(g=>g.kind===user.kind);assert.equal(explicit.minCount,3);assert.equal(explicit.purpose,'strategy');assert.equal(explicit.generatedFromMap,false);assert.equal(c.hdOCThreeThreeCarrierTargets(result.plan,explicit)===null,true);assert.equal(JSON.stringify(user)===userBefore,true,'selection does not rewrite the existing explicit goal');
   const signature=c.hdOCSignature(ctx),snapshot=JSON.stringify({measure,signature});signatures.set(selected,signature);if(seen.has(selected))assert.equal(snapshot===seen.get(selected),true,'returning to a selection yields the same fresh model and signature');else seen.set(selected,snapshot);
  }
  assert.equal(signatures.get('normal')!==signatures.get(alternate),true,'different selected goals cannot share a result signature');
  for(const unknown of ['unknown','constructor','__proto__',0]){const result=build({[entry]:unknown});assert.equal(result.selected,unknown);assert.equal(result.branch.status,'manual');assert.equal(result.branch.goal,unknown);assert.equal(c.hdOCStarterCarrierScope(result.plan,recommendation()),false);assert.equal(c.hdOCThreeThreeCarrierTargets(result.plan,recommendation())===null,true);assert.match(c.hdOCRouteGoalHtml(ctx,''),/未登録の目標・選び直してください/);}
  h.store.set(key,'{');assert.equal(c.hdOCRouteGoal(ctx),alternate,'malformed stored JSON falls back to the saved fleet, not an arbitrary normal goal');assert.equal(h.writes.length,0);
 }
});
