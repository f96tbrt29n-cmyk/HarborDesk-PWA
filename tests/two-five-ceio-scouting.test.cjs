'use strict';
// Independent literal routing expectations; synthetic synchronized displayed LOS
// values exercise the real 33-formula and actual product helpers. These numbers
// are not verified game stats at the stated Lv, nor sortie probabilities.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createTwoFiveCeioModelContext}=require('./fixtures/two-five-ceio-model-context.cjs');
const {createTwoFiveCeioHistoricalProjection}=require('./fixtures/two-five-ceio-source-layer.cjs');
const {createTwoFiveCeioEHistoricalProjection}=require('./fixtures/two-five-ceio-e-source-layer.cjs');
const ROOT=path.resolve(__dirname,'..'),host=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const observations={schemaVersion:1,scope:'synthetic Node source-counterexample and literal routing boundaries only',fullGeneratorCalls:0,browserExecuted:false,boundaries:[],precedingSource:[]};
if(process.env.HD25_CEIO_PRIVATE_OBSERVATIONS)process.on('exit',()=>fs.writeFileSync(process.env.HD25_CEIO_PRIVATE_OBSERVATIONS,JSON.stringify(observations,null,2)+'\n'));
const NAMES=['赤城改','千歳航改二','阿武隈改二','夕立改二','時雨改二','綾波改二'];
function prepare(score=32,options={}){
 const h=options.context||createTwoFiveCeioModelContext(),{c,store}=h;store.clear();
 const names=options.names||NAMES,hq=Object.hasOwn(options,'hq')?options.hq:120;
 // At HQ120, sqrt(first)+5*15-ceil(120*.4)=score. At the exact
 // boundaries the first square is 16 or49, so 31 and34 are exact doubles.
 const first=Math.pow(score+48-75,2),rows=names.map((name,i)=>{
  const db=c.hdFEFindShip(name),master=db&&c.hdShipDbMasterRowFor(db),profile=db&&c.hdShipDbSlotProfile(db);
  return {id:'ceio-unit-'+i,name,masterId:master?.id||0,gameShipId:250500+i,level:90,gameSlotEx:0,gameLos:i?225:first,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile?.count||3},()=>''),gameGearExpansion:'',metadata:{keep:i}};
 });
 if(options.unknownLos)delete rows[options.unknownLosIndex??0].gameLos;
 h.seed('harbordesk-ship-roster-v1',rows);h.seed('harbordesk-equipment-v1',[]);h.seed('harbordesk-kancolle-sync-v1',hq===null?{metadata:{keep:true}}:{admiralLevel:hq,metadata:{keep:true}});
 h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]);
 const preset=host(h.value("MAP_PLANS['2-5'].presets[1]")),fleet={id:'ceio-unit',routePreset:preset,openingAswCount:0,metadata:{keep:true},ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:'',metadata:host(r.metadata)}))};
 const plan=c.hdFEPlanFromSavedFleet('2-5',fleet);plan.routeIndex=1;plan.openingAswCount=0;
 return {...h,rows,preset,fleet,plan,score,storeBefore:JSON.stringify([...store]),fleetBefore:JSON.stringify(fleet)};
}
function numeric(checks){return checks.find(x=>x.condition?.kind==='scoutingValue')}
function inspect(h,requirements=[]){const {c,plan}=h,items=c.hdOCAssigned(plan),scouting=c.hdFEPlanScouting(plan,items),contract=c.hdFERouteContract(plan),route=c.hdFERoute(plan),measure=c.hdOCMeasure(plan,requirements),readiness=c.hdOCReadiness(plan,measure,[]);return {scouting,contract,route,measure,readiness,required:numeric(measure.requiredChecks),goal:measure.goals.find(x=>x.kind==='los-value')}}
function unchanged(h){assert.equal(JSON.stringify([...h.store]),h.storeBefore,'synthetic source strings retained; values not emitted');assert.equal(JSON.stringify(h.fleet),h.fleetBefore,'synthetic fleet retained');assert.equal(h.writes.length,0)}
function beforeContext(){return createTwoFiveCeioModelContext({project:createTwoFiveCeioHistoricalProjection(ROOT)})}

test('CEIO approved inverse restores and replays exact preceding product files',()=>{
 const project=createTwoFiveCeioHistoricalProjection(ROOT),projectE=createTwoFiveCeioEHistoricalProjection(ROOT),approved=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/two-five-ceio-approved-source-inverses.json'),'utf8'));
 // Current I semantics are tested below against raw current modules. This exact
 // historical endpoint check restores E once on each independent raw input.
 for(const [file,row]of Object.entries(approved.files)){const raw=fs.readFileSync(path.join(ROOT,file),'utf8'),current=projectE(file,raw),previous=project(file,raw);assert.equal(hash(current),row.approvedAfterSHA256);assert.equal(hash(previous),row.beforeSHA256);assert.notEqual(current,previous)}
});

test('CEIO I coefficient1 HQ120 literal 31 and34 adjacent boundaries remain distinct through actual final route',()=>{
 const h=createTwoFiveCeioModelContext();
 for(const [score,status]of [[30.999,'missing'],[31,'partial'],[31.001,'partial'],[33.999,'partial'],[34,'ready'],[34.001,'ready']]){
  const f=prepare(score,{context:h}),x=inspect(f);assert.equal(x.scouting.available,true);assert.equal(x.scouting.coef,1);assert.equal(x.scouting.hq,120);assert.ok(Math.abs(x.scouting.score-score)<1e-10);
  assert.equal(x.scouting.status,status,score+' scouting');assert.equal(numeric(x.contract.checks).status,status,score+' mandatory numeric');assert.equal(x.contract.status,status,score+' contract');assert.equal(x.route.status,status,score+' final route');assert.equal(x.required.status,status,score+' flattened check');assert.equal(x.required.ok,status==='ready');assert.equal(x.required.unresolved,false);assert.equal(x.goal.ok,status==='ready');assert.equal(x.goal.count,x.scouting.score);assert.equal(x.goal.minCount,34);
  observations.boundaries.push({expectedScore:score,actualScore:x.scouting.score,scouting:x.scouting.status,contract:x.contract.status,route:x.route.status,required:x.required.status,requiredOK:x.required.ok,registeredReady:x.readiness.registeredReady});
  if(status==='partial'){assert.equal(x.goal.knownRandom,true);assert.equal(x.goal.routeAim,'fixed-O');assert.equal(h.c.hdOCShortageGoals(x.measure).some(g=>g.kind==='los-value'),false);assert.equal(x.required.knownRandom,true);assert.equal(x.readiness.registeredReady,false);assert.equal(x.readiness.checks.find(y=>y.id==='route').status,'partial');assert.match(x.route.detail,/ランダム/);assert.doesNotMatch(x.route.detail,/確定調達数|購入必須です|必ず購入/);}
  unchanged(f);
 }
});

test('same-input preceding source turns a known random band into numeric missing',()=>{
 const old=createTwoFiveCeioModelContext({project:createTwoFiveCeioHistoricalProjection(ROOT)}),current=createTwoFiveCeioModelContext();
 for(const score of [31,32,33.999]){const b=prepare(score,{context:old}),a=prepare(score,{context:current}),prior=inspect(b),after=inspect(a);assert.equal(prior.scouting.status,'partial');assert.equal(numeric(prior.contract.checks).status,'missing');assert.equal(prior.route.status,'missing');assert.equal(after.route.status,'partial');observations.precedingSource.push({score,scouting:prior.scouting.status,mandatory:numeric(prior.contract.checks).status,route:prior.route.status,afterScouting:after.scouting.status,afterMandatory:numeric(after.contract.checks).status,afterRoute:after.route.status});unchanged(b);unchanged(a)}
});

test('a flag-only simulated control exposes the old partial-to-ready final-route fallback',()=>{
 const h=prepare(32,{context:beforeContext()}),data=h.c.hdFERouteRequirementData(h.plan);data.los.preserveRandomBand=true;
 const x=inspect(h);assert.equal(x.scouting.status,'partial');assert.equal(x.contract.status,'partial');assert.equal(x.required.status,'partial');assert.equal(x.required.ok,false);assert.equal(x.route.status,'ready','isolated incomplete-fix control, not a historical deployed source');unchanged(h);
});

test('source registration keeps lower inclusive31 and upper inclusive34 without displaying invented probabilities',()=>{
 const h=prepare(),{c}=h,d=c.hdFERouteRequirementData(h.plan);assert.equal(d.path,'CEIO');assert.equal(d.index,1);assert.equal(d.los.coef,1);assert.equal(d.los.checks[0].failBelow,31);assert.equal(d.los.checks[0].safe,34);assert.equal(d.los.preserveRandomBand,true);assert.match(d.source,/zekamashi\.net\/kancolle-kouryaku\/2-5\//);
 const html=c.hdMapRequirementsHtml('2-5',h.preset),x=inspect(h),required=c.hdOCRequiredChecksHtml(h.plan,x.measure);assert.match(html+required,/31/);assert.match(html+required,/34/);assert.match(required,/ランダム/);assert.doesNotMatch(html+required,/35%|65%|35％|65％|購入必須です|必ず購入/);unchanged(h);
});

test('HQ or displayed ship LOS missing remains informational uncertainty rather than numeric shortage',()=>{
 const context=createTwoFiveCeioModelContext();
 for(const options of [{hq:null},{unknownLos:true}]){const h=prepare(32,{...options,context}),x=inspect(h);assert.equal(x.scouting.available,false);assert.equal(x.scouting.score,null);assert.equal(x.scouting.reason,'sync');assert.equal(x.required.status,'manual');assert.equal(x.required.unresolved,true);assert.equal(x.route.status,'manual');assert.equal(x.measure.complete,false);assert.equal(x.readiness.registeredReady,false);assert.equal(h.c.hdOCShortageGoals(x.measure).some(g=>g.kind==='los-value'),false);unchanged(h)}
});

test('changed equipment preserves unknown bonus and never certifies its reference arithmetic as achieved LOS',()=>{
 const h=prepare(32),{c,plan}=h;plan.ships[3].items=[{name:'22号対水上電探改四',star:0,slotIndex:0}];
 const reference=c.hdFEScouting(plan,c.hdOCAssigned(plan)),x=inspect(h);assert.equal(reference.available,true);assert.ok(reference.score>32);assert.equal(c.hdFEGameMatch(plan).status,'partial');assert.equal(x.scouting.available,false);assert.equal(x.scouting.score,null);assert.equal(x.scouting.reason,'bonus');assert.equal(x.scouting.referenceScore,reference.score);assert.match(x.scouting.detail,/ボーナス.*未確認/);assert.equal(x.required.status,'manual');assert.equal(x.route.status,'manual');assert.equal(x.goal.unresolved,true);assert.equal(x.goal.count,null);assert.equal(c.hdOCShortageGoals(x.measure).some(g=>g.kind==='los-value'),false);unchanged(h);
});

test('HQ below120 keeps a reference and source margin but never rewrites31/34 or certifies the gate',()=>{
 const h=prepare(34,{hq:119}),x=inspect(h),d=h.c.hdFERouteRequirementData(h.plan);assert.equal(x.scouting.available,false);assert.equal(x.scouting.score,null);assert.equal(x.scouting.reason,'hq-scope');assert.ok(Number.isFinite(x.scouting.referenceScore));assert.equal(x.route.status,'manual');assert.equal(x.required.unresolved,true);assert.equal(h.c.hdOCShortageGoals(x.measure).some(g=>g.kind==='los-value'),false);assert.equal(d.los.checks[0].safe,34);assert.equal(d.los.checks[0].failBelow,31);assert.match(d.los.marginNote,/120未満/);assert.match(d.los.marginNote,/\+1/);assert.match(d.los.marginNote,/推奨/);unchanged(h);
});

test('known earlier composition mismatch survives missing ship or LOS information',()=>{
 const h=prepare(32,{names:['長門改二','千歳航改二','阿武隈改二','夕立改二','時雨改二','未知の合成艦'],hq:null}),x=inspect(h);assert.equal(x.contract.status,'missing');assert.equal(x.route.status,'missing');assert.equal(x.scouting.status,'manual');assert.ok(x.contract.checks.some(row=>row.condition.kind==='typeCount'&&row.condition.types.includes('戦艦')&&row.status==='missing'));assert.equal(x.readiness.registeredReady,false);unchanged(h);
});

test('user equipment quantity stays strategy and numeric LOS gap cannot become equipment purchase count',()=>{
 const h=prepare(32),requirements=[{kind:'電探',label:'利用者の電探目標',minCount:2,generatedFromMap:false}],x=inspect(h,requirements),user=x.measure.goals.find(g=>g.kind==='電探');assert.equal(user.minCount,2);assert.equal(user.purpose,'strategy');assert.equal(user.generatedFromMap,false);assert.equal(x.goal.minCount,34);assert.equal(x.goal.count,32);assert.equal(h.c.hdOCStockGap({...x.goal,goalKind:'los-value',shortfall:2}),0);assert.equal(h.c.hdOCProcurementHtml({...x.goal,goalKind:'los-value',shortfall:2},0,'',{map:'2-5',index:1}),'');unchanged(h);
});

test('CEIO changes leave northern BFJO registration and actual north results exactly unchanged',()=>{
 const previous=beforeContext(),current=createTwoFiveCeioModelContext();
 const fields=h=>host(h.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][0]"));assert.deepEqual(fields(current),fields(previous));const north=fields(current);assert.equal(north.path,'BFJO');assert.equal(north.los.coef,1);assert.equal(north.los.checks[0].safe,49);assert.equal(north.los.checks[0].failBelow,42);assert.equal(north.los.preserveRandomBand,undefined);
 function northSample(context){const h=prepare(52,{context,names:['扶桑改二','鈴谷改二','熊野改二','妙高改二','羽黒改二','那智改二']}),{c,plan}=h;const preset=host(h.value("MAP_PLANS['2-5'].presets[0]"));plan.routeIndex=0;plan.preset=preset;plan.routeInfo=c.hdFSPresetInfo(preset);plan.ships[1].items=[{name:'ドラム缶(輸送用)',star:0,slotIndex:0}];plan.ships[2].items=[{name:'ドラム缶(輸送用)',star:0,slotIndex:0}];for(const i of [1,2])h.rows[i].gameGearSlots[0]='ドラム缶(輸送用)';h.seed('harbordesk-ship-roster-v1',h.rows);h.seed('harbordesk-equipment-v1',[{name:'ドラム缶(輸送用)',star:0,count:2}]);h.storeBefore=JSON.stringify([...h.store]);const x=inspect(h);unchanged(h);return host({scouting:x.scouting,route:x.route,measure:x.measure,readiness:x.readiness})}
 assert.deepEqual(northSample(current),northSample(previous));
});

test('actual saved-proposal calculator heading distinguishes CEIO fixed-O aim and leaves north text unchanged',()=>{
 const old=prepare(32,{context:beforeContext()}),current=prepare(32);
 function render(h,index=1){const x=inspect(h),data=index===1?h.c.hdFERouteRequirementData(h.plan):host(h.value("HD_MAP_ROUTE_REQUIREMENTS['2-5'][0]"));return h.c.hdFCProposalHtml({ships:[],gear:[],proposal:{map:'2-5',route:index,fleetId:'ceio-unit',name:'synthetic unit proposal',at:1700000000000,signature:'unit',routeRequirements:data,assessment:x.readiness,routeAssessment:{contract:x.contract}}})}
 const html=render(current);assert.match(html,/I→O.*31以上34未満.*ランダム域/);assert.match(html,/追加索敵は固定Oを目指す目的/);assert.doesNotMatch(html,/必要索敵値34/);assert.match(render(old),/必要索敵値34以上/);assert.equal(render(current,0),render(old,0));unchanged(old);unchanged(current);
});

test('browser fixture material and initial reasons are checked by actual modules without generator execution',()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/two-five-ceio-browser-inputs.json'),'utf8')),h=createTwoFiveCeioModelContext(),{c}=h;
 assert.deepEqual(fixture.route,{map:'2-5',index:1,path:'CEIO',coefficient:1});assert.equal(fixture.gun,'12.7cm連装砲');assert.equal(fixture.radar,'33号水上電探');assert.equal(c.hdFEFind(fixture.gun).stats.索敵||0,0);assert.equal(c.hdFEFind(fixture.radar).stats.索敵,7);
 for(const state of ['random','guaranteed','unknown']){
  const config=fixture[state];h.store.clear();const rows=fixture.ships.map((expected,i)=>{const db=c.hdFEFindShip(expected.name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);assert.equal(db.type,expected.type);assert.ok(master.speed>=10);assert.ok(profile.count>=3);const slots=Array(profile.count).fill('');if(i===2){assert.equal(c.hdShipDbEquipCompatible(c.hdFEFind(fixture.gun),db),true);assert.equal(c.hdShipDbSlotRejects(profile,0,c.hdFEFind(fixture.gun)),false);slots[0]=fixture.gun;}return {id:'browser-preflight-'+i,name:expected.name,masterId:master.id,gameShipId:251100+i,level:fixture.level,gameSlotEx:0,gameLos:config.bareLos[i],gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
  h.seed('harbordesk-ship-roster-v1',rows);h.seed('harbordesk-equipment-v1',[{name:fixture.gun,count:1,star:0},...(config.radarStock?[{name:fixture.radar,count:config.radarStock,star:0}]:[])]);h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]);h.seed('harbordesk-kancolle-sync-v1',config.hq===null?{metadata:{keep:true}}:{admiralLevel:config.hq,metadata:{keep:true}});
  const preset=host(h.value("MAP_PLANS['2-5'].presets[1]")),fleet={id:'browser-preflight',openingAswCount:0,routePreset:preset,ships:rows.map((row,i)=>({ship:row.name,rosterId:row.id,gameShipId:row.gameShipId,masterId:row.masterId,gear:row.gameGearSlots.map((name,j)=>config.recoverObservedGun&&i===2&&j===0?'':name).join(' / '),metadata:row.metadata}))},before=JSON.stringify([...h.store]),built=c.hdOCBuild({map:'2-5',index:1,preset,fleet}),scouting=c.hdFEPlanScouting(built.plan,c.hdOCAssigned(built.plan)),contract=c.hdFERouteContract(built.plan);
  assert.deepEqual(host(built.plan.preservationIssues||[]),[]);assert.equal(scouting.available,false);assert.equal(scouting.reason,config.recoverObservedGun?'bonus':'sync');assert.equal(contract.checks.filter(row=>row.condition.kind!=='scoutingValue').every(row=>row.status==='ready'),true);assert.equal(built.inventory.find(row=>row.name===fixture.gun).count,1);assert.equal(built.inventory.find(row=>row.name===fixture.radar)?.count||0,config.radarStock);
  if(state!=='unknown'){const reference=c.hdFEScouting(built.plan,c.hdOCAssigned(built.plan));assert.equal(reference.score,state==='random'?32:35);assert.equal(scouting.referenceScore,reference.score)}
  assert.equal(JSON.stringify([...h.store]),before);assert.equal(h.writes.length,0);
 }
});

test('explicit custom fleet conditions and unrelated goals remain independent of I random status',()=>{
 const h=prepare(32),{c,plan}=h;plan.routeInfo={...plan.routeInfo,total:5};const x=inspect(h,[{kind:'電探',minCount:1,generatedFromMap:false}]);assert.equal(x.contract.status,'partial');assert.equal(x.route.status,'missing');assert.equal(x.measure.goals.find(g=>g.kind==='電探').minCount,1);assert.equal(x.measure.goals.find(g=>g.kind==='電探').purpose,'strategy');assert.equal(x.readiness.registeredReady,false);unchanged(h);
});
