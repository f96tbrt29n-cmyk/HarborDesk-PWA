'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function load(file,name,context){
 const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);
 if(name==='hdOCMeasure'&&!context.hdOCPortMeasure)context.hdOCPortMeasure=()=>[];vm.runInNewContext(source.slice(start,end<0?undefined:end),context);return context[name];
}
function portContext(){
 const c={hdFEFindShip:()=>({type:'重巡洋艦'}),hdOCShipOwnership:p=>p.ships.map(()=>({status:'ready'})),hdFEFind:n=>({name:n,category:n==='gun'?'中口径主砲':n==='recon'?'水上偵察機':'対地装備'}),hdShipDbSlotProfile:()=>({count:4,slots:[2,2,2,2]}),hdFEExpansionAvailability:()=>({allowed:false}),hdOCCompatible:()=>true,hdSEPartMatches:(part,r)=>r.name==='shell'};
 for(const name of ['hdOCPortScope','hdOCPortRef','hdOCPortSame','hdOCPortEligible','hdOCPortTargets','hdOCPortPart','hdOCPortSlots','hdOCPortFits','hdOCPortMeasure','hdOCPortReadFleets','hdOCPortSave'])load('owned-equipment-planner.js',name,c);
 return c;
}
test('central port assignment is exact per individual, remodel and route; unknown references do not become achieved',()=>{
 const c=portContext(),ship={ship:'A',gameShipId:1,masterId:2,items:['gun','gun','recon','shell'].map((name,slotIndex)=>({name,slotIndex}))},p={map:'4-5',routeIndex:1,ships:[ship],sourceFleet:{portAttackersByRoute:{'4-5:1':[{ship:'A',gameShipId:1,masterId:2,rosterId:''}]}}};
 assert.equal(c.hdOCPortMeasure(p)[0].ok,true);ship.items[3].name='gun';assert.equal(c.hdOCPortMeasure(p)[0].ok,false);ship.masterId=3;assert.equal(c.hdOCPortMeasure(p)[0].unresolved,true);p.routeIndex=0;assert.equal(c.hdOCPortMeasure(p).length,0);
});
test('central port types never count a water fighter, bomber or zero-capacity recon as the requested recon',()=>{
 const c=portContext();for(const category of ['水上戦闘機','水上爆撃機','艦上偵察機'])assert.equal(c.hdOCPortPart('recon',{item:{category}}),false);
 assert.equal(c.hdOCPortFits('recon',{capacity:0},{item:{category:'水上偵察機'}}),false);assert.equal(c.hdOCPortFits('recon',{capacity:2,expansion:true},{item:{category:'水上偵察機'}}),false);assert.equal(c.hdOCPortFits('recon',{capacity:2},{item:{category:'水上偵察機'}}),true);
});
test('central port setting writer preserves metadata and refuses null-present, exception and invalid JSON reads',()=>{
 const c=portContext();let raw=JSON.stringify({'4-5':[{id:'one',ships:[],metadata:{keep:true}}],'elsewhere':[1]}),fault='',writes=0;c.CUSTOM_FLEET_KEY='fleets';c.localStorage={fleets:true,getItem:()=>{if(fault==='throw')throw Error('fault');return fault==='null'?null:fault==='json'?'{':raw}};c.hdFEPlanFromSavedFleet=()=>({ships:[{ship:'A',masterId:2,gameShipId:1}]});c.saveCustomFleets=all=>{writes++;raw=JSON.stringify(all)};
 const ctx={map:'4-5',index:1,fleet:{id:'one'}};for(fault of ['null','throw','json'])assert.throws(()=>c.hdOCPortSave(ctx,0,true));assert.equal(writes,0);fault='';c.hdOCPortSave(ctx,0,true);assert.equal(writes,1);assert.deepEqual(JSON.parse(raw)['4-5'][0].metadata,{keep:true});assert.deepEqual(JSON.parse(raw).elsewhere,[1]);c.hdOCPortSave(ctx,-1,false);assert.equal(JSON.parse(raw)['4-5'][0].portAttackersByRoute['4-5:1'].length,0);
});
function aswTargetContext(){
 const types={'夕立改二':'駆逐艦','時雨改二':'駆逐艦','綾波改二':'駆逐艦','島風改':'駆逐艦','占守改':'海防艦','扶桑改':'航空戦艦','阿武隈改二':'軽巡洋艦'},stored={};
 const c={window:{},HD_OC_ASW_TARGET_KEY:'harbordesk-opening-asw-targets-v1',localStorage:{getItem:key=>key==='harbordesk-opening-asw-targets-v1'?JSON.stringify(stored):null},hdSEChecks:()=>({rows:[{kind:'cap-asw'}]}),hdFEFindShip:name=>types[name]?{type:types[name]}:null,HD_MAP_ADVANCED_DATA:{'7-1':{openingAsw:{recommended:4,upper:5,source:'https://zekamashi.net/kancolle-kouryaku/7-1/'}}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../map-plans.js'),'utf8')+';this.plans=MAP_PLANS',c);
 for(const name of ['hdOCOaswTargets','hdOCOaswKey','hdOCOaswFleetGoal','hdOCOaswChoice','hdOCOaswRecommendation','hdOCOaswTarget'])if(fs.readFileSync(path.join(__dirname,'../owned-equipment-planner.js'),'utf8').includes('function '+name+'('))load('owned-equipment-planner.js',name,c);
 const context=(map,index,names)=>({map,index,preset:c.plans[map].presets[index],fleet:{id:'target-fixture',ships:names.map(ship=>({ship}))}});
 return {c,stored,context};
}

test('remaining registered ASW routes choose a target instead of an unsupported default one',()=>{
 const {c,context}=aswTargetContext(),routes=[["1-6", 0], ["4-1", 0], ["4-2", 0], ["4-2", 1], ["4-3", 0], ["4-4", 0], ["4-5", 0], ["4-5", 1], ["4-5", 2], ["5-5", 1], ["5-6", 0], ["5-6", 1], ["5-6", 2], ["6-3", 0], ["7-2", 1], ["7-4", 0], ["7-5", 0], ["7-5", 1], ["7-5", 2]];
 assert.equal(routes.length,19);
 for(const [map,index] of routes){const x=context(map,index,[]);assert.equal(c.hdOCOaswTarget(x),undefined,map+':'+index);assert.equal(c.hdOCOaswRecommendation(x).choose,true);assert.equal(c.hdOCOaswRecommendation(x).recommended,undefined);}
});
test('saved ASW counts belong to their documented route while user choices and unscoped legacy values are preserved',()=>{
 const {c,stored,context}=aswTargetContext(),x=context('4-2',0,[]);x.fleet.routePreset=c.plans['4-2'].presets[0];x.fleet.openingAswCount=2;
 const before=JSON.stringify(x.fleet);assert.equal(c.hdOCOaswTarget(x),2);
 x.index=1;x.preset=c.plans['4-2'].presets[1];assert.equal(c.hdOCOaswTarget(x),undefined);assert.equal(JSON.stringify(x.fleet),before);
 stored['4-2:target-fixture:1']=3;assert.equal(c.hdOCOaswTarget(x),3);stored['4-2:target-fixture:1']=0;assert.equal(c.hdOCOaswTarget(x),0);
 x.index=0;x.preset=c.plans['4-2'].presets[0];assert.equal(c.hdOCOaswTarget(x),2);
 const other=context('1-6',0,[]);assert.equal(c.hdOCOaswTarget(other),undefined);
 delete x.fleet.routePreset;assert.equal(c.hdOCOaswTarget(x),2);assert.equal(c.hdOCOaswChoice(x).kind,'legacy');
});
test('saving a different route preserves its scoped legacy goal without overwriting choices or reconstructing unreadable data',()=>{
 const {c,context}=aswTargetContext(),x=context('4-2',1,[]);x.fleet.routePreset=c.plans['4-2'].presets[0];x.fleet.openingAswCount=2;
 let raw=JSON.stringify({'elsewhere:other:0':7,'4-2:target-fixture:1':3}),fault='',writes=[];
 c.localStorage={getItem:()=>{if(fault==='throw')throw Error('read fault');return fault==='null'?null:fault==='json'?'{':raw},setItem:(key,value)=>{if(fault==='write')throw Error('write fault');writes.push({key,value});raw=value}};
 const preserve=load('owned-equipment-planner.js','hdOCOaswPreserveFleetGoal',c),originalFleet=JSON.stringify(x.fleet);
 preserve(x);assert.equal(writes.length,1);assert.deepEqual(JSON.parse(raw),{'elsewhere:other:0':7,'4-2:target-fixture:1':3,'4-2:target-fixture:0':2});assert.equal(JSON.stringify(x.fleet),originalFleet);
 preserve(x);assert.equal(writes.length,1);raw=JSON.stringify({'4-2:target-fixture:0':0});preserve(x);assert.equal(writes.length,1);
 Object.defineProperty(c.localStorage,c.HD_OC_ASW_TARGET_KEY,{value:'existence only',configurable:true});
 for(const mode of ['throw','null','json','write']){raw='{}';fault=mode;const n=writes.length;assert.throws(()=>preserve(x));assert.equal(writes.length,n);assert.equal(raw,'{}');assert.equal(JSON.stringify(x.fleet),originalFleet);}
});
test('source-scoped ASW defaults use four destroyers without borrowing a count from another fleet or gauge',()=>{
 const {c,context}=aswTargetContext(),dd=['夕立改二','時雨改二','綾波改二','島風改'];
 assert.equal(c.hdOCOaswTarget(context('1-5',2,dd)),4);
 assert.equal(c.hdOCOaswTarget(context('7-1',0,['阿武隈改二',...dd])),4);
 for(const x of [context('1-5',0,Array(4).fill('占守改')),context('1-5',1,['扶桑改',...dd.slice(0,3)]),context('7-2',0,['阿武隈改二',...dd.slice(0,3)]),context('1-5',2,['阿武隈改二',...dd.slice(0,3)])])assert.equal(c.hdOCOaswTarget(x),undefined);
});
test('explicit ASW goals including zero survive recommendation changes and unspecified goals stay omitted on save',()=>{
 const {c,stored,context}=aswTargetContext(),x=context('1-5',2,['夕立改二','時雨改二','綾波改二','島風改']);
 x.preset={...x.preset,openingAswCount:4};x.fleet.openingAswCount=2;assert.equal(c.hdOCOaswTarget(x),2);
 stored['1-5:target-fixture:2']=3;assert.equal(c.hdOCOaswTarget(x),3);
 stored['1-5:target-fixture:2']=0;assert.equal(c.hdOCOaswTarget(x),0);
 const choice=context('7-2',0,['阿武隈改二','夕立改二','時雨改二','綾波改二']);assert.equal(JSON.stringify({openingAswCount:c.hdOCOaswTarget(choice)}),'{}');
});
test('ASW aggregate keeps ready missing and unknown ships distinct and separates unselected from explicit zero',()=>{
 const states=[{status:'ready'},{status:'ready'},{status:'missing',value:99,threshold:100},{status:'manual',threshold:100}],c={hdOCOaswTarget:()=>4,hdOCOaswScope:(_,i)=>String(i),hdFEOpeningAsw:(_,scope)=>states[Number(scope)]};
 const measure=load('owned-equipment-planner.js','hdOCOaswMeasure',c),plan={map:'fixture',openingAswCount:4,ships:states.map((_,i)=>({ship:'ship'+i}))},m=measure(plan);
 assert.equal(m.count,2);assert.equal(m.missingCount,1);assert.equal(m.manualCount,1);assert.equal(m.ok,false);assert.equal(m.unresolved,true);
 c.hdOCOaswTarget=()=>undefined;const unknown=measure({map:'fixture',ships:[]});assert.equal(unknown.unresolved,true);assert.equal(unknown.count,null);assert.equal(unknown.minCount,null);
 assert.equal(measure({map:'fixture',openingAswCount:0,ships:[]}).ok,true);
});
test('unconfirmed air targets carry no numeric achievement or equipment deficit; known boundaries remain numeric',()=>{
 let target={selected:false,known:false,detail:'通るマス未選択'},capacityKnown=1,antiAirKnown=true;
 const c={
  hdFEEquipmentRequirements:()=>[],hdFERouteRequirementData:()=>null,hdOCAssigned:()=>[],hdFEAir:()=>({basePower:44,count:1,capacityKnown,rows:[]}),
  hdMapAirTarget:()=>target,hdMapAirData:()=>({nodes:{}}),hdFEEnemyAirCandidates:()=>[30],
  hdMapAirThreshold:n=>Math.ceil(n*1.5),hdMapAirRouteLoss:()=>({known:true,stage2Complete:antiAirKnown,stage2Missing:[],minimumRatio:1}),
  hdMapAirLossBounds:()=>null,HD_MAP_AIR_GOALS:{superiority:'優勢'},
  hdFEPlanScouting:()=>({available:false,notRequired:true}),hdFEPlanSpeedTarget:()=>0,
  hdOCOaswMeasure:()=>({minCount:0}),hdFERoute:()=>({status:'ready'}),hdOCRequiredChecks:()=>[],hdFLRows:()=>[],hdSEChecks:()=>({adv:{}})
 };
 load('fleet-readiness-evaluator.js','hdFEAirCheck',c);load('owned-equipment-planner.js','hdOCShortageGoals',c);
 const measure=load('owned-equipment-planner.js','hdOCMeasure',c),sample=()=>measure({map:'numeric-fixture',ships:[]},[]);
 for(const reason of ['route','capacity','anti-air']){
  target=reason==='route'?{selected:false,known:false,detail:'通るマス未選択'}:{selected:true,known:true,enemy:30,hasAir:true,goal:'superiority',detail:'合成数値層'};
  capacityKnown=reason==='capacity'?0:1;antiAirKnown=reason!=='anti-air';
  const m=sample(),g=m.goals.find(x=>x.kind==='air-value');
  assert.equal(g.unresolved,true,reason);assert.equal(g.ok,false,reason);assert.equal(g.ratio,0,reason);
  assert.equal(m.score,0,reason);assert.equal(m.complete,false,reason);assert.equal(c.hdOCShortageGoals(m).length,0,reason);
 }
 capacityKnown=1;antiAirKnown=true;
 for(const [enemy,ready,required] of [[29,true,44],[30,false,45]]){
  target={selected:true,known:true,enemy,hasAir:true,goal:'superiority',detail:'合成数値層'};
  const m=sample(),g=m.goals.find(x=>x.kind==='air-value');
  assert.equal(g.unresolved,false);assert.equal(g.count,44);assert.equal(g.minCount,required);assert.equal(g.ok,ready);
  assert.equal(c.hdOCShortageGoals(m).length,ready?0:1);
 }
});
// Same six hulls, four slots and observed loadout as route-completion-2-5.
// No LOS formula or search is used here; one of the existing four open slots is empty.
function observedFixture(){
 const names=['扶桑改二','鈴谷改二','熊野改二','妙高改二','羽黒改二','那智改二'],masters=[411,503,504,319,194,192];
 const rows=names.map((name,i)=>({name,masterId:masters[i],gameShipId:9600+i,gameAswGearKnown:true,gameGearExpansion:'',gameGearSlots:i===0?['35.6cm連装砲','35.6cm連装砲','零式水上観測機 ★4','強風改二']:i<3?['20.3cm連装砲','20.3cm連装砲','ドラム缶(輸送用)','強風改二']:['20.3cm連装砲','20.3cm連装砲',i===5?'零式水上観測機':'零式水上観測機 ★4','32号対水上電探']}));
 const plan={map:'2-5',ships:rows.map(r=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,items:r.gameGearSlots.map((label,slotIndex)=>({name:label.replace(/ ★\d+$/,''),star:Number(/ ★(\d+)$/.exec(label)?.[1]||0),slotIndex})),expansion:null}))};
 plan.ships[0].items[2]={name:'',star:0,slotIndex:2};
 const fleets=[{deckId:1,name:'observed',ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}],c={rosterLoad:()=>rows,localStorage:{getItem:key=>key==='harbordesk-kancolle-fleets-v1'?JSON.stringify(fleets):null}};
 for(const name of ['hdFERoster','hdFERosterForShip','hdFENormGearLabel','hdFEPlannedGearLabel','hdFEGameMatch'])load('fleet-readiness-evaluator.js',name,c);
 return {rows,plan,fleets,c};
}
function beamComparator(initial){
 const c={initial};for(const name of ['hdOCGoalIdentity','hdOCGoalRegressions'])load('owned-equipment-planner.js',name,c);
 const s=fs.readFileSync(path.join(__dirname,'..','owned-equipment-planner.js'),'utf8'),a=s.indexOf('next.sort(')+'next.sort('.length,b=s.indexOf(');beamPruned',a);
 if(s.includes('function hdOCScoutingOrder('))load('owned-equipment-planner.js','hdOCScoutingOrder',c);
 assert.ok(a>='next.sort('.length&&b>a);return vm.runInNewContext('('+s.slice(a,b)+')',c);
}
test('candidate scouting with unknown bonus carries no numeric result or ready checks; known arithmetic is unchanged',()=>{
 const raw={status:'ready',available:true,score:49.458745,coef:1,checks:[{safe:49,status:'ready',score:49.458745}]};
 let match='manual';const c={hdFEScouting:()=>raw,hdFEGameMatch:()=>({status:match}),hdFERouteContract:()=>({checks:[{condition:{kind:'scoutingValue'}}]}),hdFEBranchRoute:()=>({checks:[]})},verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',c);
 const unknown=verify({},[]);assert.equal(unknown.status,'manual');assert.equal(unknown.score,null);assert.equal(unknown.available,false);assert.equal(unknown.checks[0].score,undefined);assert.equal(unknown.checks[0].status,undefined);assert.equal(unknown.checks[0].safe,49);
 assert.equal(raw.score,49.458745);assert.equal(raw.checks[0].status,'ready');match='ready';assert.equal(verify({},[]),raw);
});
test('unregistered numerical reference tools keep their arithmetic and do not invent a verified route verdict',()=>{
 const raw={available:true,score:17,status:'missing'},verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',{hdFEScouting:()=>raw,hdFERouteContract:()=>null,hdFEBranchRoute:()=>({checks:[]}),hdFEGameMatch:()=>{throw Error('no registered scouting predicate')}});assert.equal(verify({},[]),raw);
});
test('missing synchronized inputs and routes without a scouting condition retain their original unknown/not-required result',()=>{
 for(const raw of [{status:'manual',available:false,score:null,reason:'sync'},{status:'ready',available:false,notRequired:true,score:null}]){
  const verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',{hdFEScouting:()=>raw,hdFEGameMatch:()=>{throw Error('not needed')}});assert.equal(verify({},[]),raw);
 }
});
test('unknown numeric goals are not converted to equipment deficits; measured deficits remain actionable',()=>{
 const select=load('owned-equipment-planner.js','hdOCShortageGoals',{}),unknown={kind:'los-value',count:null,minCount:49,ok:false,unresolved:true},missing={kind:'los-value',count:48,minCount:49,ok:false},ready={kind:'los-value',count:50,minCount:49,ok:true};
 const rows=Array.from(select({goals:[unknown,missing,ready,{kind:'air-value',ok:false,unresolved:true},{kind:'drum-ships',ok:false}]}));assert.equal(rows.length,2);assert.equal(rows[0],missing);assert.equal(rows[1].kind,'drum-ships');assert.equal(unknown.count,null);
});
test('unresolved ASW speed and capability goals cannot become confirmed shortages or procurement quantities',()=>{
 const select=load('owned-equipment-planner.js','hdOCShortageGoals',{}),gap=load('owned-equipment-planner.js','hdOCStockGap',{});
 const unknown=['opening-asw','speed-ship','drum-ships','radar-ships','cap-night-auto'].map(kind=>({kind,goalKind:kind,minCount:4,count:0,owned:0,usableOwned:0,ok:false,unresolved:true}));
 assert.equal(select({goals:unknown}).length,0);
 for(const g of unknown)assert.equal(gap(g),0,g.kind);
 const known={kind:'drum-ships',minCount:2,count:1,owned:1,usableOwned:1,ok:false};
 assert.equal(select({goals:[known]})[0],known);assert.equal(gap(known),1);
 assert.equal(gap({...known,placement:true}),0);
});
test('calculator inherits the manual route check until explicit editing; edited arithmetic remains a reference, not a route verdict',()=>{
 const issue=load('fleet-calculator.js','hdFCProposalScoutingIssue',{}),s={proposal:{routeAssessment:{contract:{checks:[{condition:{kind:'scoutingValue'},status:'manual',detail:'bonus unknown'}]}}}};
 assert.equal(issue(s),'bonus unknown');s.proposal.edited=true;assert.equal(issue(s),'');assert.equal(s.proposal.routeAssessment.contract.checks[0].status,'manual');
 s.proposal.edited=false;s.proposal.routeAssessment.contract.checks[0].status='missing';assert.equal(issue(s),'');assert.equal(issue({}), '');
});

test('equal-score scouting guidance uses known synchronized gear distance without inventing a LOS result',()=>{
 let match={fleetMatch:true,unknown:0,gearMismatch:3};const f=observedFixture(),plan=f.plan,distance=load('owned-equipment-planner.js','hdOCScoutingDistance',{hdFERoster:()=>f.rows,hdFEGameMatch:()=>match}),measure={goals:[{kind:'los-value',count:null,unresolved:true}]};
 assert.equal(distance(plan,measure),3);match.gearMismatch=1;assert.equal(distance(plan,measure),1);assert.equal(measure.goals[0].count,null);
 match.unknown=1;assert.equal(distance(plan,measure),null);match.unknown=0;match.fleetMatch=false;assert.equal(distance(plan,measure),null);assert.equal(distance(plan,{goals:[{kind:'los-value',count:49,ok:true}]}),null);
});

test('distance requires this individual and remodel plus complete observed slots even when the general matcher falls back',()=>{
 const mutations={known:()=>{},unrelatedNull:f=>f.rows.push(null),noFleet:f=>f.fleets.splice(0),missingRow:f=>f.rows.splice(0,1),otherIndividual:f=>f.plan.ships[0].gameShipId=19600,otherForm:f=>{f.plan.ships[0].ship='扶桑改';f.plan.ships[0].masterId=77;},partialSlots:f=>f.rows[0].gameGearSlots.splice(2),missingExpansion:f=>delete f.rows[0].gameGearExpansion,duplicateRoster:f=>f.rows.push({...f.rows[0]}),duplicateIndividual:f=>f.plan.ships[1].gameShipId=f.plan.ships[0].gameShipId};
 for(const [name,mutate] of Object.entries(mutations)){
  const f=observedFixture();mutate(f);const measure={goals:[{kind:'los-value',count:null,ok:false,unresolved:true}],requiredChecks:[{status:'manual',ok:false}],score:0};
  const before=JSON.stringify({plan:f.plan,rows:f.rows,fleets:f.fleets,measure}),distance=load('owned-equipment-planner.js','hdOCScoutingDistance',f.c),match=f.c.hdFEGameMatch(f.plan);
  assert.notEqual(match.status,'ready');assert.equal(distance(f.plan,measure),['known','unrelatedNull'].includes(name)?1:null,name);
  assert.equal(JSON.stringify({plan:f.plan,rows:f.rows,fleets:f.fleets,measure}),before,name);
 }
});
test('beam distance cannot reverse different scores or the confirmed-condition regression priority',()=>{
 // Scores below are comparator tokens, not LOS values. This executes the actual sort expression.
 const drum={kind:'drum-ships',label:'two hulls',purpose:'route',ok:true},los={kind:'los-value',count:null,ok:false,unresolved:true},compare=beamComparator({measure:{goals:[drum],requiredChecks:[]}});
 const row=(score,distance,ok=true)=>({measure:{goals:[{...drum,ok},{...los}],requiredChecks:[],score},scoutingDistance:distance});
 const better=row(1.0000000001,5),closer=row(1,0),snapshot=JSON.stringify([better,closer]);
 assert.ok(compare(better,closer)<0);assert.ok(compare(closer,better)>0);assert.equal(JSON.stringify([better,closer]),snapshot);
 assert.ok(compare(row(999,0,false),row(1,5))>0);assert.ok(compare(row(2,null),row(1,0))<0);assert.ok(compare(row(999,0,false),row(1,null))>0);
 assert.ok(compare(row(1,3),row(1,1))>0);assert.ok(compare(row(1,null),row(1,3))>0);assert.ok(compare(row(1,3),row(1,null))<0);
});

function orderRows(distances){return distances.map((d,i)=>({id:'row-'+i,scoutingDistance:d,measure:{score:0,complete:false,goals:[{kind:'los-value',count:null,ok:false,unresolved:true}],requiredChecks:[]}}))}
function permutations(xs){return xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]]}
function assertPreorder(compare,rows){
 const sign=n=>n<0?-1:n>0?1:0;
 for(const a of rows){assert.equal(compare(a,a),0);for(const b of rows){
  assert.ok(Number.isFinite(compare(a,b)));assert.equal(sign(compare(a,b))+sign(compare(b,a)),0,'sign antisymmetry');
  for(const c of rows){const ab=compare(a,b),bc=compare(b,c),ac=compare(a,c);
   if(ab<=0&&bc<=0)assert.ok(ac<=0,'non-strict transitivity');
   if(ab<0&&bc<0)assert.ok(ac<0,'strict transitivity');
   if(ab===0&&bc===0)assert.equal(ac,0,'equal-rank transitivity');
  }
 }}
}
function assertSorted(compare,rows){for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)assert.ok(compare(rows[i],rows[j])<=0,'all earlier/later pairs respect the comparator')}
test('beam mixed distances have consistent transitive ties across all three-row permutations',()=>{
 const compare=beamComparator({measure:{goals:[],requiredChecks:[]}}),rows=orderRows([1,null,2]),before=JSON.stringify(rows);
 assertPreorder(compare,rows);
 for(const input of permutations(rows)){
  const sorted=input.slice().sort(compare);assertSorted(compare,sorted);assert.deepEqual(sorted.map(x=>x.scoutingDistance),[1,2,null]);
 }
 assert.equal(JSON.stringify(rows),before);assert.equal(rows[1].measure.goals[0].count,null);assert.equal(rows[1].measure.complete,false);
});
test('beam all numeric and all unknown distances preserve coherent ordering without assigning a candidate identity order',()=>{
 const compare=beamComparator({measure:{goals:[],requiredChecks:[]}});
 for(const distances of [[3,1,0,2,1],[null,null,null]]){
  const rows=orderRows(distances),before=JSON.stringify(rows);assertPreorder(compare,rows);
  for(const input of permutations(rows)){const sorted=input.slice().sort(compare);assertSorted(compare,sorted);assert.equal(new Set(sorted).size,rows.length);if(distances[0]!==null)assert.deepEqual(sorted.map(x=>x.scoutingDistance),[0,1,1,2,3]);}
  assert.equal(JSON.stringify(rows),before);
 }
});
test('beam five-row cutoff follows the declared distance-availability policy without changing manual candidates',()=>{
 // Same distance classes as the six recorded intermediate states, not new fleet solutions.
 const compare=beamComparator({measure:{goals:[],requiredChecks:[]}}),rows=orderRows([2,2,3,3,null,1]),before=JSON.stringify(rows);
 assertPreorder(compare,rows);
 for(const input of permutations(rows)){
  const sorted=input.slice().sort(compare),kept=sorted.slice(0,5);assertSorted(compare,sorted);
  assert.equal(new Set(sorted).size,6);assert.ok(sorted.includes(rows[4]));
  assert.ok(kept.every(x=>x.scoutingDistance!==null));assert.ok(kept.some(x=>x.scoutingDistance===1));
  assert.ok(sorted.every(x=>!x.measure.complete&&x.measure.goals[0].count===null&&x.measure.goals[0].unresolved));
 }
 assert.equal(JSON.stringify(rows),before);
});
