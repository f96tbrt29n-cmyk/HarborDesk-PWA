'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){if(file==='fleet-readiness-evaluator.js'&&name==='hdFEEquipmentRequirements'&&!c.hdFEOneFiveAswSelection)load(file,'hdFEOneFiveAswSelection',c);const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const raw=fs.readFileSync(path.join(root,'ship-master-snapshot.js'),'utf8'),masters=Object.values(JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,'')).allShips);
 const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>({}),hdShipDbMasterRowFor:r=>masters.find(m=>m.name===r.name),hdFEGameMatch:()=>({status:'ready'}),hdFEAssigned:()=>[],localStorage:{getItem:()=>'{"admiralLevel":120}'},hdFCProposalShipLos:s=>s.bareLos,hdFEAir:()=>({}),hdFEAirCheck:()=>({status:'ready',enemy:0}),hdFEPlanSpeedTarget:()=>0,hdOCPortMeasure:()=>[],hdOCOaswMeasure:()=>({minCount:0}),hdFLRows:()=>[],hdSEChecks:()=>({rows:[],adv:{}}),hdFEKindCount:()=>({count:0})});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);
 c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-4'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships;c.hdOCAssigned=()=>[];
 for(const name of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract','hdFEScouting','hdFEPlanScouting','hdFEEquipmentRequirements'])load('fleet-readiness-evaluator.js',name,c);
 if(fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8').includes('function hdFEScoutingExemption('))load('fleet-readiness-evaluator.js','hdFEScoutingExemption',c);
 c.hdFEBranchRoute=()=>({checks:[]});c.hdFERoute=p=>{const contract=c.hdFERouteContract(p);return {...contract,contract,branch:{available:false}}};
 for(const name of ['hdOCRequiredChecks','hdOCMeasure','hdOCGoalIdentity','hdOCGoalRegressions'])load('owned-equipment-planner.js',name,c);
 return c;
}
function fleet(rank=15,bareLos=16){return ['金剛改二','榛名改二','鈴谷改二','熊野改二','時雨改二','雪風改'].map((ship,i)=>({ship:{ship,items:[]},type:i<2?'戦艦':i<4?'航空巡洋艦':'駆逐艦',typeKnown:true,items:[],bareLos,speedInfo:{known:true,rank,invalid:[]}}))}
const plan=ships=>({map:'5-4',ships});
test('5-4 M-to-P source-independent exempt and nonexempt speed boundaries',()=>{
 const c=context();
 // Literal source expectations: all ranks >=15 bypass LOS; a known 10/5 does
 // not. No expected result is generated from the registered exemption rule.
 for(const [ranks,expected] of [[[15,15,15,15,15,15],true],[[20,15,20,15,20,15],true],[[20,20,20,20,20,20],true],[[15,15,15,15,15,10],false],[[15,15,15,15,15,5],false]]){
  const rows=fleet();rows.forEach((r,i)=>r.speedInfo.rank=ranks[i]);const p=plan(rows),before=JSON.stringify(p),s=c.hdFEPlanScouting(p,[]);
  assert.equal(s.notRequired===true,expected);if(expected){assert.equal(s.score,null);assert.equal(s.available,false);assert.equal(s.reason,'exempt');assert.match(s.detail,/M→P.*非適用/);assert.equal(c.hdFERouteContract(p).status,'ready');}else assert.equal(c.hdFERouteContract(p).status,'missing');
  assert.equal(JSON.stringify(p),before);
 }
});
test('exempt route detail omits the inactive numeric branch sync warning',()=>{const c=context(),p=plan(fleet());c.hdFEGameMatch=()=>({status:'manual'});const r=c.hdFERouteContract(p);assert.equal(r.status,'ready');assert.match(r.detail,/索敵条件は非適用/);assert.doesNotMatch(r.detail,/ボーナス.*未確認/);});
test('exemption needs confirmed valid speed and never ignores a known nonexempt hull',()=>{
 const c=context();for(const fault of ['unknown','invalid','expansion','item']){const rows=fleet(),r=rows[0];if(fault==='unknown')r.speedInfo.known=false;if(fault==='invalid')r.speedInfo.invalid=['invalid slot'];if(fault==='expansion')r.speedInfo.expansionUnconfirmed=true;if(fault==='item'){r.ship.items=[{name:'unregistered'}];c.hdFEFind=n=>n==='unregistered'?null:{};}const s=c.hdFEPlanScouting(plan(rows),[]);assert.equal(s.notRequired===true,false);assert.equal(s.status,'manual');assert.equal(c.hdFERouteContract(plan(rows)).status,'manual');}
 const mixed=fleet();mixed[0].speedInfo.known=false;mixed[1].speedInfo.rank=10;assert.equal(c.hdFERouteContract(plan(mixed)).status,'missing');
});
test('unknown speed preserves a sufficient numeric result, or remains unknown when LOS fails or is absent',()=>{
 const c=context(),rows=fleet(15,256);rows[0].speedInfo.known=false;assert.equal(c.hdFERouteContract(plan(rows)).status,'ready');assert.equal(c.hdFEPlanScouting(plan(rows),[]).score,48);assert.notEqual(c.hdFEPlanScouting(plan(rows),[]).notRequired,true);
 rows.forEach(r=>r.bareLos=16);assert.equal(c.hdFERouteContract(plan(rows)).status,'manual');const below=c.hdFEPlanScouting(plan(rows),[]);assert.equal(below.status,'manual');assert.equal(below.available,false);assert.equal(below.score,null);
 rows[0].bareLos=null;assert.equal(c.hdFERouteContract(plan(rows)).status,'manual');
});
test('nonexempt coefficient2 threshold45 stays exact and missing sync never becomes ready',()=>{
 const c=context(),rows=fleet(10);for(const [score,status]of [[44.99,'missing'],[45,'ready'],[45.01,'ready']]){rows.forEach(r=>r.bareLos=((score+48)/6)**2);assert.equal(c.hdFERouteContract(plan(rows)).status,status);}
 rows[0].bareLos=null;assert.equal(c.hdFERouteContract(plan(rows)).status,'manual');
});
test('D-to-E submarine and original battleship failures survive an exempt M branch and unknown speed',()=>{
 const c=context(),rows=fleet();rows[2].ship.ship='伊58改';rows[2].type='潜水空母';assert.equal(c.hdFERouteContract(plan(rows)).status,'missing');assert.notEqual(c.hdFEPlanScouting(plan(rows),[]).notRequired,true);
 const low=fleet();low[0].ship.ship='長門改二';low[1].ship.ship='陸奥改二';low[2].speedInfo.known=false;assert.equal(c.hdFERouteContract(plan(low)).status,'missing');assert.equal(c.hdFERouteContract(plan(low)).checks.find(x=>x.condition.kind==='slowBattleshipCount').status,'missing');
});
test('exempt scoring and procurement omit generated scouting but retain explicitly selected objectives',()=>{
 const c=context(),p=plan(fleet()),rows=[{kind:'索敵',minCount:2,generatedFromMap:true},{kind:'電探',minCount:1,generatedFromMap:true}];
 assert.deepEqual(Array.from(c.hdFEEquipmentRequirements(p,rows),x=>x.kind),['電探']);
 assert.equal(c.hdFEEquipmentRequirements(p,[{kind:'索敵',minCount:3}])[0].minCount,3);
 const exempt=c.hdOCMeasure(p,rows.filter(x=>x.kind==='索敵'));assert.equal(exempt.goals.some(x=>['索敵','los-value'].includes(x.kind)),false);assert.equal(exempt.scoutingExempt,true);
 p.ships[0].speedInfo.rank=10;const required=c.hdOCMeasure(p,rows.filter(x=>x.kind==='索敵'));assert.equal(required.goals.some(x=>x.kind==='索敵'),true);assert.equal(required.goals.find(x=>x.kind==='los-value').ok,false);
 p.ships[0].speedInfo.rank=15;assert.equal(c.hdOCMeasure(p,rows).goals.some(x=>x.kind==='索敵'),false);
});
test('an exempt LOS goal is nonapplicable rather than regressed, while other goals remain protected',()=>{
 const c=context(),before={goals:[{kind:'los-value',ok:true},{kind:'索敵',generatedFromMap:true,ok:true},{kind:'電探',ok:true}],requiredChecks:[]},after={scoutingExempt:true,goals:[],requiredChecks:[]};
 assert.deepEqual(Array.from(c.hdOCGoalRegressions(before,after),x=>x.kind),['電探']);after.scoutingExempt=false;assert.equal(c.hdOCGoalRegressions(before,after).length,3);
});
test('conditional LOS is confined to 5-4 central and 5-5 BKPS while the existing 5-4 alternatives stay explicit',()=>{
 const c=context(),rules=vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS',c);assert.ok(c.data.los.exemptWhen);assert.equal(c.data.los.coef,2);assert.equal(c.data.los.checks[0].safe,45);
 assert.deepEqual(Object.entries(rules).flatMap(([map,rows])=>Array.from(rows,(r,index)=>r.los.exemptWhen?map+'/'+index:null).filter(Boolean)).sort(),['5-4/0','5-5/0']);const html=c.hdMapRequirementsHtml('5-4',vm.runInContext("MAP_PLANS['5-4'].presets[0]",c));assert.match(html,/M→P.*高速[＋+].*非適用/);assert.match(html,/係数2/);assert.match(html,/45/);
 c.data=rules['4-5'][1];assert.equal(c.hdFEPlanScouting(plan(fleet()),[]).notRequired===true,false);assert.equal(c.hdFERouteContract(plan(fleet())).checks.some(x=>x.condition.kind==='scoutingValue'&&x.condition.min===71),true);
});
