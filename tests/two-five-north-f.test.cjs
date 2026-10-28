'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
const hull=(type,rank=10,extra={})=>({ship:type,items:[],type,rank,...extra});
const fleet=types=>types.map(t=>hull(t));
function context(){
 const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEEsc:String,hdFEFind:()=>({name:'ドラム缶(輸送用)',category:'輸送用装備',stats:{}}),hdFEFindShip:()=>({}),hdFESpeedLabel:r=>r===5?'低速':'高速',hdFEGameMatch:()=>({status:'ready'}),hdFEScouting:()=>({available:true,status:'ready',coef:1,score:49,checks:[{safe:49}]}),hdShipDbSlotProfile:()=>({count:4}),hdShipDbEquipCompatible:()=>true,hdShipDbSlotRejects:()=>false,hdFEPlanSpeedTarget:()=>0,hdFEEquipmentRequirements:(p,r)=>r,hdOCPortMeasure:()=>[],hdOCOaswMeasure:()=>({minCount:0}),hdFLRows:()=>[],hdSEChecks:()=>({rows:[],adv:{}}),hdFEAir:()=>({}),hdFEAirCheck:()=>({status:'ready',enemy:0})});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['2-5'][0]",c);
 c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:!s.unknownType,speedInfo:{known:!s.unknownSpeed,rank:s.rank,invalid:s.invalid||[],expansionUnconfirmed:s.expansionUnconfirmed}}));
 c.hdFEAssigned=p=>p.ships.flatMap(s=>(s.items||[]).map(x=>({...x,meta:c.hdFEFind(x.name)})));c.hdOCAssigned=c.hdFEAssigned;c.hdFEPlanScouting=c.hdFEScouting;
 for(const name of ['hdFEBranchPredicate','hdFERouteContract'])load('fleet-readiness-evaluator.js',name,c);
 c.hdFERoute=p=>{const contract=c.hdFERouteContract(p);return {...contract,contract,branch:{available:false,checks:[]}}};
 for(const name of ['hdOCRequiredChecks','hdOCMeasure','hdOCGoalIdentity','hdOCGoalRegressions','hdOCShortageGoals'])load('owned-equipment-planner.js',name,c);
 return c;
}
function plan(ships){ships.forEach((s,i)=>{s.ship+='-'+i});ships[3].items=[{name:'ドラム缶(輸送用)',slotIndex:0}];ships[4].items=[{name:'ドラム缶(輸送用)',slotIndex:0}];return {map:'2-5',routeIndex:0,ships}}
function fCheck(c,p){return c.hdFERouteContract(p).checks.find(r=>r.condition.kind==='speedCount'||r.condition.any?.some(x=>x.kind==='speedCount'))}
const ordinary=['戦艦','航空巡洋艦','航空巡洋艦','重巡洋艦','重巡洋艦','重巡洋艦'],three=['戦艦','戦艦','航空戦艦','航空巡洋艦','航空巡洋艦','重巡洋艦'];
test('2-5 F source priorities independently distinguish low, three battleships, E and random',()=>{
 const c=context(),cases=[
  [ordinary,5,'ready'],[three,10,'ready'],[['戦艦','戦艦','航空巡洋艦','航空巡洋艦','重巡洋艦','重巡洋艦'],10,'missing'],
  [['戦艦','戦艦','戦艦','駆逐艦','駆逐艦','駆逐艦'],10,'missing'],[['戦艦','戦艦','戦艦','軽巡洋艦','駆逐艦','駆逐艦'],10,'missing'],
  [['戦艦','戦艦','戦艦','重雷装巡洋艦','駆逐艦','駆逐艦'],10,'ready'],[['戦艦','戦艦','戦艦','軽巡洋艦','駆逐艦','重巡洋艦'],10,'ready'],
  [['戦艦','戦艦','戦艦','駆逐艦','駆逐艦','駆逐艦'],5,'ready'],[['戦艦','戦艦','戦艦','軽巡洋艦','駆逐艦','駆逐艦'],5,'ready']
 ];
 for(const [types,rank,status]of cases){const rows=fleet(types);rows[0].rank=rank;const p=plan(rows),before=JSON.stringify(p);assert.equal(fCheck(c,p).status,status,types.join('/')+' rank'+rank);assert.equal(JSON.stringify(p),before);}
});
test('2-5 F uncertainty never erases an independent known result or treats unknown hulls as absent',()=>{
 const c=context(),fast=plan(fleet(three));fast.ships[0].unknownSpeed=true;assert.equal(fCheck(c,fast).status,'ready');
 const ordinaryUnknown=plan(fleet(ordinary));ordinaryUnknown.ships[0].unknownSpeed=true;assert.equal(fCheck(c,ordinaryUnknown).status,'manual');
 const knownLow=plan(fleet(ordinary));knownLow.ships[0].rank=5;knownLow.ships[1].unknownSpeed=true;assert.equal(fCheck(c,knownLow).status,'ready');
 const higher=plan(fleet(['戦艦','戦艦','戦艦','軽巡洋艦','駆逐艦','駆逐艦']));higher.ships[0].unknownSpeed=true;assert.equal(fCheck(c,higher).status,'manual');
 const unknownType=plan(fleet(three));unknownType.ships[5].unknownType=true;assert.equal(fCheck(c,unknownType).status,'manual');
 const forbidden=plan(fleet(['戦艦','戦艦','戦艦','正規空母','航空巡洋艦','重巡洋艦']));forbidden.ships[5].unknownType=true;assert.equal(c.hdFERouteContract(forbidden).status,'missing');
});
test('fast exception removes only the conditional low goal while preserving mandatory OR protection',()=>{
 const c=context(),low=plan(fleet(ordinary));low.ships[0].rank=5;
 const before=c.hdOCMeasure(low,[]);assert.equal(before.goals.find(g=>g.kind==='low-speed-ships').ok,true);
 low.ships[0].rank=10;const accelerated=c.hdOCMeasure(low,[]);assert.equal(accelerated.goals.find(g=>g.kind==='low-speed-ships').ok,false);assert.ok(c.hdOCGoalRegressions(before,accelerated).some(g=>g.kind==='low-speed-ships'));
 const fast=c.hdOCMeasure(plan(fleet(three)),[]);assert.equal(fast.goals.some(g=>g.kind==='low-speed-ships'),false);assert.equal(c.hdOCShortageGoals(fast).some(g=>g.kind==='low-speed-ships'),false);
 assert.equal(c.hdOCGoalRegressions(before,fast).some(g=>g.kind==='low-speed-ships'),false);
 const fewer=c.hdOCMeasure(plan(fleet(['戦艦','戦艦','航空巡洋艦','航空巡洋艦','重巡洋艦','重巡洋艦'])),[]);fewer.lowSpeedAlternative=true;
 assert.ok(c.hdOCGoalRegressions(fast,fewer).some(g=>g.mandatory&&g.condition.any));
 assert.ok(c.hdOCGoalRegressions({goals:[{kind:'low-speed-ships',ok:true}],requiredChecks:[]},{goals:[],requiredChecks:[],lowSpeedAlternative:true}).some(g=>g.kind==='low-speed-ships'));
});
test('uncertain alternative leaves the F OR manual without claiming a required low-speed purchase',()=>{
 const c=context(),p=plan(fleet(three));p.ships[5].unknownType=true;const m=c.hdOCMeasure(p,[]);assert.equal(fCheck(c,p).status,'manual');assert.equal(m.goals.some(g=>g.kind==='low-speed-ships'),false);assert.equal(m.complete,false);
});
function selection(types,withLow=true){
 const c=context(),names=[...types.map((t,i)=>({id:'pick'+i,name:'pick'+i,type:t,speed:'高速'})),...(withLow?[{id:'low',name:'low',type:'戦艦',speed:'低速'}]:[])];
 c.hdFSRoster=()=>names;c.hdFSProfile=r=>({row:r,type:r.type,speed:r.speed,level:99,operational:{available:true}});c.hdFSNeeds=()=>[];c.hdFSLiveState=()=>({});c.hdFSLevelTarget=()=>({});c.hdFSOperationalSummary=()=>({});c.hdFSPresetInfo=()=>({requirements:[{token:'戦艦級',count:types.filter(t=>t==='戦艦').length},{token:'other',count:types.filter(t=>t!=='戦艦').length}],total:6,preferred:[],text:'独立選艦対照'});c.hdFSTypeMatches=(p,t)=>t==='戦艦級'?p.type==='戦艦':p.type!=='戦艦';c.hdFSPickBest=(pool,used,predicate)=>pool.find(p=>!used.has(p.row.id)&&predicate(p));c.hdFSRepairVerifiedSlots=(m,p,i,info,slots)=>({slots,ready:false});
 c.hdFEFindShip=n=>({type:names.find(r=>r.name===n)?.type});c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:names.find(r=>r.name===s.ship)?.type,typeKnown:names.find(r=>r.name===s.ship)?.type!=='unknown',speedInfo:{known:true,rank:10,invalid:[]}}));
 load('fleet-suggester.js','hdFSGenerate',c);const preset=vm.runInContext("MAP_PLANS['2-5'].presets[0]",c);return c.hdFSGenerate('2-5',preset,0);
}
test('automatic selection only skips forced low speed for a confirmed exception',()=>{
 const fast=selection(['戦艦','戦艦','戦艦','重巡洋艦','重巡洋艦','重巡洋艦']);assert.equal(fast.slots.some(s=>s.profile?.speed==='低速'),false);assert.equal(fast.missing.length,0);
 const low=selection(['戦艦','重巡洋艦','重巡洋艦','重巡洋艦','重巡洋艦','重巡洋艦']);assert.equal(low.slots.some(s=>s.profile?.speed==='低速'),true);
 const uncertain=selection(['戦艦','戦艦','戦艦','重巡洋艦','重巡洋艦','unknown'],false);assert.match(uncertain.missing.join(' / '),/F→J.*未確認/);assert.doesNotMatch(uncertain.missing.join(' / '),/低速艦（高速化せず維持）/);
 const unfilled=selection(['戦艦','戦艦','戦艦','重巡洋艦'],false);assert.match(unfilled.missing.join(' / '),/F→J.*未確認/);
});
test('north remaining hull, drum and scouting contracts stay unchanged',()=>{
 const c=context(),d=c.data;assert.equal(d.path,'BFJO');assert.equal(d.los.coef,1);assert.equal(d.los.checks[0].safe,49);assert.equal(d.los.checks[0].failBelow,42);
 assert.equal(d.conditions.find(x=>x.kind==='equipmentShips'&&x.match==='drum').min,2);assert.equal(d.conditions.find(x=>x.kind==='typeCount'&&x.types.includes('戦艦')).max,3);
 assert.equal(d.conditions.find(x=>x.kind==='typeCount'&&x.types.includes('海防艦')).max,2);assert.equal(d.conditions.find(x=>x.kind==='typeCount'&&x.types.includes('水上機母艦')).max,1);
 for(const type of ['正規空母','潜水艦','潜水空母','揚陸艦'])assert.equal(d.conditions.find(x=>x.kind==='typeCount'&&x.types.includes(type)).max,0);
 for(const types of [['戦艦','戦艦','戦艦','航空戦艦','航空巡洋艦','重巡洋艦'],['戦艦','潜水空母','航空巡洋艦','航空巡洋艦','重巡洋艦','重巡洋艦'],['戦艦','揚陸艦','航空巡洋艦','航空巡洋艦','重巡洋艦','重巡洋艦'],['戦艦','水上機母艦','水上機母艦','航空巡洋艦','重巡洋艦','重巡洋艦'],['戦艦','海防艦','海防艦','海防艦','重巡洋艦','重巡洋艦']]){const p=plan(fleet(types));p.ships[5].unknownType=true;assert.equal(c.hdFERouteContract(p).status,'missing',types.join('/'));}
 assert.equal(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['2-5'][1].keepLowUnless",c),undefined);
});
