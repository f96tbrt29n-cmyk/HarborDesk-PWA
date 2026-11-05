'use strict';
// Source-derived E priorities use literal hull matrices. The shared pure VM
// loads actual model helpers; no semantic product helper is replaced.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createTwoFiveCeioModelContext}=require('./fixtures/two-five-ceio-model-context.cjs');
const {createTwoFiveCeioEHistoricalProjection}=require('./fixtures/two-five-ceio-e-source-layer.cjs');
const ROOT=path.resolve(__dirname,'..'),host=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const DD4=['翔鶴改二','夕張改二特','島風改','夕立改二','時雨改二','雪風改'],DD3=['翔鶴改二','瑞鳳改二','夕張改二特','島風改','夕立改二','時雨改二'];
const TURBINE='改良型艦本式タービン',BOILER='新型高温高圧缶',GUN='12.7cm連装砲';
const observations={schemaVersion:1,scope:'synthetic E-priority and real material boundary observations, no browser execution',fullGeneratorCalls:0,preceding:[],current:[]};
if(process.env.HD25_CEIO_E_PRIVATE_OBSERVATIONS)process.on('exit',()=>fs.writeFileSync(process.env.HD25_CEIO_E_PRIVATE_OBSERVATIONS,JSON.stringify(observations,null,2)+'\n'));
function prepare(options={}){
 const h=options.context||createTwoFiveCeioModelContext(),{c,store}=h;store.clear();const names=options.names||DD4,score=options.score??35,hq=Object.hasOwn(options,'hq')?options.hq:120;
 const rows=names.map((name,i)=>{const db=c.hdFEFindShip(name),master=db&&c.hdShipDbMasterRowFor(db),profile=db&&c.hdShipDbSlotProfile(db),slots=Array(profile?.count||3).fill('');for(const item of options.items?.[i]||[])slots[item.slotIndex]=item.name+(item.star?' ★'+item.star:'');return {id:'e-unit-'+i,name,masterId:master?.id||0,gameShipId:252100+i,level:90,gameSlotEx:0,gameLos:i?225:Math.pow(score+48-75,2),gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
 h.seed('harbordesk-ship-roster-v1',rows);h.seed('harbordesk-equipment-v1',options.inventory||[]);h.seed('harbordesk-kancolle-sync-v1',hq===null?{metadata:{keep:true}}:{admiralLevel:hq,metadata:{keep:true}});h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]);
 const preset=host(h.value("MAP_PLANS['2-5'].presets[1]")),fleet={id:'e-unit',routePreset:preset,openingAswCount:0,memo:'retain memo',metadata:{keep:true},ships:rows.map(row=>({ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,rosterId:row.id,gear:row.gameGearSlots.join(' / '),metadata:host(row.metadata)}))},plan=c.hdFEPlanFromSavedFleet('2-5',fleet);plan.routeIndex=1;plan.openingAswCount=0;
 return {...h,rows,preset,fleet,plan,storeBefore:JSON.stringify([...store]),fleetBefore:JSON.stringify(fleet)};
}
function before(){return createTwoFiveCeioModelContext({project:createTwoFiveCeioEHistoricalProjection(ROOT)})}
function inspect(h,requirements=[]){const {c,plan}=h,contract=c.hdFERouteContract(plan),route=c.hdFERoute(plan),measure=c.hdOCMeasure(plan,requirements),scouting=c.hdFEPlanScouting(plan,c.hdOCAssigned(plan));return {contract,route,measure,scouting,e:contract.checks[1],i:measure.requiredChecks.find(row=>row.condition.kind==='scoutingValue'),speed:c.hdFEPlanSpeedTarget(plan),scope:c.hdFETwoFiveSouthDD4Scope?.(plan)||false}}
function unchanged(h){assert.equal(JSON.stringify([...h.store]),h.storeBefore,'all seeded strings exact; bodies omitted');assert.equal(JSON.stringify(h.fleet),h.fleetBefore,'original synthetic fleet exact');assert.equal(h.writes.length,0)}
function projected(x){return {e:x.e.status,i:x.i.status,route:x.route.status,speedTarget:x.speed,scope:x.scope,speedGoalKinds:x.measure.goals.filter(g=>g.kind.startsWith('speed-')).map(g=>g.kind)}}

// Full inverse endpoints are independently pinned, never generated from observed results.
test('CEIO E approved inverse restores and replays the exact f37 product source',()=>{
 const project=createTwoFiveCeioEHistoricalProjection(ROOT),approved=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/two-five-ceio-e-approved-source-inverses.json'),'utf8'));
 for(const [file,row]of Object.entries(approved.files)){const current=fs.readFileSync(path.join(ROOT,file),'utf8'),old=project(file,current);assert.equal(hash(current),row.approvedAfterSHA256);assert.equal(hash(old),row.beforeSHA256);assert.notEqual(current,old);assert.throws(()=>project(file,current+'\n'),/exact approved CEIO E current source/);assert.throws(()=>project(file,old),/exact approved CEIO E current source/)}assert.equal(project('unrelated-source.js','unchanged'),'unchanged');
});

test('same actual low CL DD4 input no longer inherits the DD3 fast example or its turbine goal',()=>{
 const old=prepare({context:before()}),current=prepare(),a=inspect(old),b=inspect(current);assert.equal(old.c.hdFEShipSpeed(old.plan.ships[1]).base,5);assert.equal(a.e.status,'missing');assert.equal(a.route.status,'missing');assert.equal(a.speed,10);assert.ok(a.measure.goals.some(g=>g.kind==='speed-ship'&&!g.ok));assert.equal(b.e.status,'ready');assert.equal(b.i.status,'ready');assert.equal(b.route.status,'ready');assert.equal(b.scope,true);assert.equal(b.speed,0);assert.equal(b.measure.goals.some(g=>g.kind.startsWith('speed-')),false);observations.preceding.push(projected(a));observations.current.push(projected(b));unchanged(old);unchanged(current);
});

test('canonical known6 CV or CVB CL1 DD4 source scope is independent of hull order and native speed',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const names of [DD4,['翔鶴改二甲',...DD4.slice(1)],[...DD4.slice(1),DD4[0]]]){const h=prepare({context,names}),x=inspect(h);assert.equal(x.scope,true);assert.equal(x.e.status,'ready');assert.equal(x.speed,0);assert.equal(x.route.status,'ready');unchanged(h)}
});

test('DD3 still needs all-fast and a lone boiler never substitutes for the LS turbine',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const [names,items,status]of [[DD3,{},'missing'],[['翔鶴改二','瑞鳳改二','矢矧改二',...DD3.slice(3)],{},'ready'],[DD3,{2:[{name:BOILER,slotIndex:1}]},'missing']]){const h=prepare({context,names,items}),x=inspect(h);assert.equal(x.scope,false);assert.equal(x.speed,10);assert.equal(x.e.status,status);assert.equal(x.route.status,status);assert.equal(x.i.status,'ready');if(items[2])assert.equal(h.c.hdFEShipSpeed(h.plan.ships[2]).rank,5);unchanged(h)}
});

test('earlier BB G and regular-carrier plus heavy-cruiser G do not become gear procurement problems',()=>{
 const context=createTwoFiveCeioModelContext(),cases=[['長門改二','夕張改二特','島風改','夕立改二','時雨改二','雪風改'],['翔鶴改二','妙高改二','矢矧改二','島風改','夕立改二','時雨改二'],['翔鶴改二','鈴谷改二','矢矧改二','島風改','夕立改二','時雨改二'],['翔鶴改二','伊58改','矢矧改二','島風改','夕立改二','時雨改二']];
 for(const names of cases){const h=prepare({context,names}),x=inspect(h);assert.equal(x.scope,false);assert.equal(x.contract.status,'missing');assert.equal(x.route.status,'missing');assert.ok(x.contract.checks.some(row=>row.condition.kind==='typeCount'&&row.status==='missing'));assert.equal(h.c.hdOCRequiredChecks(h.plan).filter(row=>row.condition.kind==='typeCount'&&row.status==='missing').every(row=>row.mandatory&&row.ok===false),true);unchanged(h)}
 // Seven-hull arithmetic can illustrate source branch priority, but is not a
 // valid normal fleet: the product must keep its independent six-hull guard.
 const seven=prepare({context,names:['翔鶴改二','妙高改二','矢矧改二','島風改','夕立改二','時雨改二','雪風改']}),x=inspect(seven);assert.equal(x.scope,false);assert.equal(x.contract.checks[0].status,'missing');assert.equal(x.route.status,'missing');unchanged(seven);
});

test('CLT CT and DE names never stand in for the required CL or fourth DD',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const names of [[DD4[0],'北上改二',...DD4.slice(2)],[DD4[0],'香取改',...DD4.slice(2)],[...DD4.slice(0,5),'占守改']]){const h=prepare({context,names}),x=inspect(h);assert.equal(x.scope,false);assert.equal(x.speed,10);assert.equal(x.contract.status,'missing');assert.notEqual(x.route.status,'ready');unchanged(h)}
});

test('known higher-priority mismatch survives an unknown hull and unknown scouting',()=>{
 const h=prepare({names:['長門改二','翔鶴改二','矢矧改二','島風改','夕立改二','未登録の合成艦'],hq:null}),x=inspect(h);assert.equal(x.scope,false);assert.equal(x.contract.status,'missing');assert.equal(x.route.status,'missing');assert.equal(x.scouting.status,'manual');assert.ok(x.contract.checks.some(row=>row.condition.kind==='typeCount'&&row.condition.types.includes('戦艦')&&row.status==='missing'));unchanged(h);
 const unknown=prepare({names:[...DD4.slice(0,5),'未登録の合成艦']}),u=inspect(unknown);assert.equal(u.scope,false);assert.equal(u.route.status,'manual');unchanged(unknown);
});

test('real normalized predicate input confirms DD4 without borrowing an unknown speed fact',()=>{
 const h=prepare(),{c,plan}=h,data=c.hdFERouteRequirementData(plan),rows=host(c.hdFERouteShips(plan));rows[1].speedInfo={...rows[1].speedInfo,known:false,rank:0,base:0,group:''};assert.equal(rows.every(row=>row.typeKnown),true);assert.equal(c.hdFEBranchPredicate(data.conditions[1],rows,plan).status,'ready');assert.equal(c.hdFEBranchPredicate({kind:'minSpeed',rank:10},rows,plan).status,'manual');
 rows[5].typeKnown=false;rows[5].type='';assert.equal(c.hdFEBranchPredicate(data.conditions[1],rows,plan).status,'manual');unchanged(h);
 const dd3=prepare({names:DD3}),r=host(dd3.c.hdFERouteShips(dd3.plan));r[2].speedInfo={...r[2].speedInfo,known:false,rank:0,base:0,group:''};assert.equal(dd3.c.hdFEBranchPredicate(dd3.c.hdFERouteRequirementData(dd3.plan).conditions[1],r,dd3.plan).status,'manual');unchanged(dd3);
});

test('every present route-info location must be canonical before its example speed is removed',()=>{
 const h=prepare(),{c,plan}=h,info=host(plan.routeInfo);plan.suggestion={info:host(info)};assert.equal(c.hdFETwoFiveSouthDD4Scope(plan),true);assert.equal(c.hdFEPlanSpeedTarget(plan),0);delete plan.routeInfo;assert.equal(c.hdFETwoFiveSouthDD4Scope(plan),true);assert.equal(c.hdFEPlanSpeedTarget(plan),0);
 plan.routeInfo=host(info);plan.suggestion.info={...info,text:'利用者指定：高速＋統一',speedRequired:true};assert.equal(c.hdFETwoFiveSouthDD4Scope(plan),false);
 // Existing routeInfo || suggestion.info precedence is retained; this test
 // does not claim that an overridden secondary suggestion controls the target.
 assert.equal(c.hdFEPlanSpeedTarget(plan),10);plan.routeInfo={...info,text:'利用者指定：高速＋統一',speedRequired:true};plan.suggestion.info=host(info);assert.equal(c.hdFETwoFiveSouthDD4Scope(plan),false);assert.equal(c.hdFEPlanSpeedTarget(plan),15);unchanged(h);
});

test('custom speed and flagship conditions are outside automatic example-speed removal',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const [text,rank]of [['利用者指定：高速統一',10],['利用者指定：高速＋統一',15],['利用者指定：最速統一',20]]){const h=prepare({context});h.plan.routeInfo={...h.plan.routeInfo,text,speedRequired:true};const x=inspect(h);assert.equal(x.scope,false);assert.equal(x.speed,rank);assert.ok(x.measure.goals.some(g=>g.kind==='speed-ship'&&g.targetRank===rank));assert.notEqual(x.route.status,'ready');unchanged(h)}
 const flagship=prepare({context});flagship.plan.routeInfo={...flagship.plan.routeInfo,flagship:'駆逐'};assert.equal(flagship.c.hdFETwoFiveSouthDD4Scope(flagship.plan),false);assert.equal(flagship.c.hdFERoute(flagship.plan).status,'missing');unchanged(flagship);
});

test('only generated route speed goals disappear while explicit equipment quantities remain',()=>{
 const h=prepare(),rows=[{kind:'高速化',minCount:1,generatedFromMap:true},{kind:'電探',minCount:2,generatedFromMap:false}],x=inspect(h,rows),requirements=h.c.hdFEEquipmentRequirements(h.plan,rows);assert.equal(x.speed,0);assert.equal(requirements.some(row=>row.kind==='高速化'),false);assert.equal(x.measure.goals.some(row=>row.kind.startsWith('speed-')),false);assert.equal(x.measure.goals.find(row=>row.kind==='電探').minCount,2);assert.equal(x.measure.goals.find(row=>row.kind==='電探').purpose,'strategy');
 const explicit=h.c.hdFEEquipmentRequirements(h.plan,[{kind:'高速化',minCount:2,generatedFromMap:false}]);assert.equal(explicit.find(row=>row.kind==='高速化').minCount,2);assert.equal(explicit.find(row=>row.kind==='高速化').generatedFromMap,false);unchanged(h);
});

test('actual LS turbine material distinguishes legal stock shortage blocked slot and slot collision',()=>{
 const noStock=prepare({names:DD3}),{c}=noStock,cl=noStock.plan.ships[2],db=c.hdFEFindShip(cl.ship),profile=c.hdShipDbSlotProfile(db),item=c.hdFEFind(TURBINE);assert.equal(c.hdFEShipSpeed(cl).group,'LS');assert.equal(profile.count,5);assert.equal(c.hdShipDbEquipCompatible(item,db),true);assert.equal(c.hdShipDbSlotRejects(profile,0,item),false);assert.equal(c.hdShipDbSlotRejects(profile,4,item),true);assert.equal(c.hdOCCompatible({si:2,index:0,db,profile,capacity:profile.slots[0]},{name:TURBINE,item,star:0}),true);assert.equal(c.hdOCCompatible({si:2,index:4,db,profile,capacity:profile.slots[4]},{name:TURBINE,item,star:0}),false);
 assert.equal([...c.hdFLInventory().values()].filter(row=>row.name===TURBINE).length,0);const m=inspect(noStock).measure;assert.equal(m.goals.find(g=>g.kind==='speed-turbine').minCount,1);assert.equal(m.goals.some(g=>g.kind==='speed-boiler'),false);unchanged(noStock);
 const legal=prepare({names:DD3,items:{2:[{name:TURBINE,slotIndex:0}]},inventory:[{name:TURBINE,count:1,star:0}]}),l=inspect(legal);assert.equal(legal.c.hdFEShipSpeed(legal.plan.ships[2]).rank,10);assert.equal(l.e.status,'ready');assert.equal(l.route.status,'ready');assert.equal(l.measure.goals.find(g=>g.kind==='speed-turbine').ok,true);assert.equal(legal.c.hdFEMasterValidation(legal.plan).valid,true);assert.deepEqual(host(legal.c.hdFOAssignedUsage(legal.plan)),{[TURBINE+'@@0']:1});unchanged(legal);
 for(const fault of ['blocked','collision']){const h=prepare({names:DD3});h.plan.ships[2].items=fault==='blocked'?[{name:TURBINE,slotIndex:4,star:0}]:[{name:TURBINE,slotIndex:0,star:0},{name:GUN,slotIndex:0,star:0}];const speed=h.c.hdFEShipSpeed(h.plan.ships[2]);assert.equal(speed.rank,5);assert.ok(speed.invalid.length>0);assert.equal(h.c.hdFEBranchPredicate({kind:'minSpeed',rank:10},h.c.hdFERouteShips(h.plan),h.plan).status,'manual');assert.equal(h.c.hdFEMasterValidation(h.plan).valid,false);unchanged(h)}
 const de=c.hdFEFindShip('占守改');assert.equal(c.hdShipDbEquipCompatible(item,de),false);
});

test('E DD4 speed exemption never grants I certainty when scouting is random or missing',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const [score,hq,i,route]of [[35,120,'ready','ready'],[32,120,'partial','partial'],[30,120,'missing','missing'],[35,null,'manual','manual']]){const h=prepare({context,score,hq}),x=inspect(h);assert.equal(x.scope,true);assert.equal(x.e.status,'ready');assert.equal(x.speed,0);assert.equal(x.i.status,i);assert.equal(x.route.status,route);assert.equal(x.measure.goals.some(g=>g.kind.startsWith('speed-')),false);unchanged(h)}
});

test('the I numeric model and northern BFJO source contract are unchanged by E scope',()=>{
 const project=createTwoFiveCeioEHistoricalProjection(ROOT),current=createTwoFiveCeioModelContext(),old=before();assert.deepEqual(host(current.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][0]")),host(old.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][0]")));assert.deepEqual(host(current.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][1].los")),host(old.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][1].los")));
 const now=fs.readFileSync(path.join(ROOT,'fleet-readiness-evaluator.js'),'utf8'),prior=project('fleet-readiness-evaluator.js',now);for(const name of ['hdFEScouting','hdFEPlanScouting']){const extract=s=>{const a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0&&b>a);return s.slice(a,b)};assert.equal(extract(now),extract(prior),name+' whole source exact; prior successful numeric boundaries are reusable')}
});

test('E browser fixture material and initial reasons are checked without repeating the generator',()=>{
 const f=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/two-five-ceio-e-browser-inputs.json'),'utf8')),prior=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/two-five-ceio-browser-inputs.json'),'utf8')),context=createTwoFiveCeioModelContext();
 const browser=fs.readFileSync(path.join(ROOT,'tests/route-two-five-ceio-e.spec.js'),'utf8'),start='function prepareE(state,data){',end=' localStorage.setItem(SHIP_ROSTER_KEY';assert.equal(browser.split(start).length,2);assert.equal(browser.split(end).length,2);const body=browser.slice(browser.indexOf(start)+start.length,browser.indexOf(end)),merged={...f,gun:prior.gun,level:prior.level,bareLos:prior.guaranteed.bareLos};
 const planner=fs.readFileSync(path.join(ROOT,'owned-equipment-planner.js'),'utf8'),shortageStart=' const speedNeed=best.measure.goals.find(',shortageEnd=' best.plan.ships.forEach(s=>{s.items=s.items.filter(x=>x.name)});';assert.equal(planner.split(shortageStart).length,2);assert.equal(planner.split(shortageEnd).length,2);const shortageBody=planner.slice(planner.indexOf(shortageStart),planner.indexOf(shortageEnd));
 assert.equal(prior.gun,GUN);assert.equal(f.turbine,TURBINE);assert.equal(f.slowCL.masterId,623);assert.equal(f.slowCL.nativeSpeed,5);assert.equal(f.slowCL.group,'LS');
 for(const state of ['known','missing','unknown']){const config=f[state],names=f[config.fleet].names,ci=config.clIndex,items={[ci]:[{name:prior.gun,slotIndex:0},...(config.boilerStock?[{name:f.boiler,slotIndex:1}]:[])]},inventory=[{name:prior.gun,count:1,star:0},...(config.boilerStock?[{name:f.boiler,count:config.boilerStock,star:0}]:[])],h=prepare({context,names,hq:config.hq,items,inventory}),{c}=h;assert.deepEqual(h.rows.map(row=>c.hdFEFindShip(row.name).type),f[config.fleet].types);assert.equal(c.hdShipDbMasterRowFor(names[ci]).id,623);assert.equal(c.hdFEShipSpeed(h.plan.ships[ci]).base,5);assert.equal(c.hdFEShipSpeed(h.plan.ships[ci]).group,'LS');assert.equal(c.hdFEMasterValidation(h.plan).valid,true);
  // Execute only the exact browser fixture's row-building prefix against the
  // actual model. The first Storage write is the explicit cut boundary.
  const built=host(h.value('(()=>{const state='+JSON.stringify(state)+',data='+JSON.stringify(merged)+';'+body+'return rows;})()'));assert.deepEqual(built.map(row=>({name:row.name,masterId:row.masterId,gameShipId:row.gameShipId,gameGearSlots:row.gameGearSlots,gameLos:row.gameLos})),h.rows.map(row=>({name:row.name,masterId:row.masterId,gameShipId:row.gameShipId,gameGearSlots:row.gameGearSlots,gameLos:row.gameLos})));
  if(config.recoverObservedGun)h.plan.ships[ci].items=h.plan.ships[ci].items.filter(item=>item.slotIndex!==0);
  const x=inspect(h);assert.equal(x.scope,config.expectedScope);assert.equal(x.e.status,config.expectedE);assert.equal(x.speed,config.expectedSpeedTarget);assert.equal(x.scouting.available,false);assert.equal(x.scouting.reason,config.recoverObservedGun?'bonus':'sync');assert.equal([...c.hdFLInventory().values()].some(row=>row.name===TURBINE),false);if(config.hq!==null)assert.equal(x.scouting.referenceScore,35);unchanged(h);
  if(state==='missing'){
   // Exact pure shortage-map block only: no generator, candidate iteration,
   // search result or proof of joint allocation is manufactured here.
   const built=c.hdOCBuild({map:'2-5',fleet:h.fleet,preset:h.preset,index:1}),buildShortages=h.value('((c,best,inventory,slots)=>{'+shortageBody+'return shortages;})'),shortages=buildShortages({map:'2-5'},{plan:h.plan,measure:x.measure},built.inventory,built.slots),g=shortages.find(row=>row.goalKind==='speed-turbine');assert.ok(g);assert.deepEqual(host({kind:g.kind,count:g.count,minCount:g.minCount,owned:g.owned,shortfall:g.shortfall,placement:g.placement,stockGap:c.hdOCStockGap(g)}),{kind:'speed-turbine',count:0,minCount:1,owned:0,shortfall:1,placement:false,stockGap:1});assert.ok(g.candidates.includes(TURBINE));unchanged(h);
  }
 }
});
