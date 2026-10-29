'use strict';
require('./seven-three-gij.test.cjs');
require('./five-four-battleship.test.cjs');
require('./five-four-scouting-exemption.test.cjs');
require('./five-four-fixed-input.test.cjs');
require('./two-five-north-f.test.cjs');
require('./three-three-acgm.test.cjs');
require('./three-three-placement.test.cjs');
require('./three-four-acegjp.test.cjs');
require('./three-four-graph.test.cjs');
require('./three-four-placement.test.cjs');
require('./route-navigation-observer.test.cjs');
require('./four-one-routes.test.cjs');
require('./four-one-graph.test.cjs');
require('./four-one-placement.test.cjs');
require('./four-two-routes.test.cjs');
require('./four-two-graph.test.cjs');
require('./four-two-placement.test.cjs');
require('./four-four-routes.test.cjs');
require('./four-four-graph.test.cjs');
require('./four-four-placement.test.cjs');
require('./four-five-central-routes.test.cjs');
require('./four-five-central-graph.test.cjs');
require('./four-five-central-placement.test.cjs');
require('./five-one-routes.test.cjs');
require('./five-one-graph.test.cjs');
require('./five-one-placement.test.cjs');
require('./five-two-routes.test.cjs');
require('./five-two-graph.test.cjs');
require('./five-two-placement.test.cjs');
require('./five-five-routes.test.cjs');
require('./five-five-graph.test.cjs');
require('./five-five-placement.test.cjs');
require('./six-one-routes.test.cjs');
require('./six-one-graph.test.cjs');
require('./six-one-placement.test.cjs');
require('./six-two-routes.test.cjs');
require('./six-two-graph.test.cjs');
require('./six-two-placement.test.cjs');
require('./six-three-routes.test.cjs');
require('./six-three-graph.test.cjs');
require('./six-three-placement.test.cjs');
require('./six-four-routes.test.cjs');
require('./six-four-graph.test.cjs');
require('./six-four-placement.test.cjs');
require('./six-five-routes.test.cjs');
require('./six-five-graph.test.cjs');
require('./six-five-placement.test.cjs');
require('./seven-one-routes.test.cjs');
require('./seven-one-graph.test.cjs');
require('./seven-one-placement.test.cjs');
require('./seven-one-identity-preservation.test.cjs');
require('./seven-two-routes.test.cjs');
require('./seven-two-graph.test.cjs');
require('./seven-two-placement.test.cjs');
require('./seven-two-sortie-compatibility.test.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function load(file,name,c){const s=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),start=s.indexOf('function '+name+'('),end=s.indexOf('\nfunction ',start+1);assert.ok(start>=0);vm.runInNewContext(s.slice(start,end<0?undefined:end),c);return c[name]}
function routes(){const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../map-plans.js'),'utf8'),c);return vm.runInContext('({maps:MAP_PLANS,rules:HD_MAP_ROUTE_REQUIREMENTS})',c)}
function predicate(){const raw=fs.readFileSync(path.join(__dirname,'../ship-master-snapshot.js'),'utf8'),snap=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,'')),rows=Object.values(snap.allShips),c={HD_FS_TYPE_ALIASES:{},hdShipDbMasterRowFor:input=>rows.find(r=>r.name===input.name&&(input.masterId==null||input.masterId===r.id))};load('fleet-readiness-evaluator.js','hdFESpeedLabel',c);return load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c)}
test('7-3 route speed never counts invalid speed equipment as a confirmed fast hull',()=>{
 const {rules}=routes(),rule=rules['7-3'][1].conditions.find(x=>x.kind==='minSpeed'),run=predicate();assert.equal(rule.rank,10);
 const row={ship:{ship:'羽黒改二',items:[]},speedInfo:{known:true,rank:10,invalid:['改良型艦本式タービン（装備位置・装備可否が未充足）']}};
 const input=JSON.stringify(row),r=run(rule,[row]);assert.equal(r.status,'manual');assert.equal(r.count,0);assert.equal(r.ratio,0);assert.match(r.detail,/速力未判定.*羽黒/);assert.equal(JSON.stringify(row),input);
});
test('minimum speed keeps confirmed shortage separate from invalid or unknown input',()=>{
 const run=predicate(),row=(rank,invalid=[])=>({ship:{ship:'合成',items:[]},speedInfo:{known:true,rank,invalid}});
 for(const rank of [10,15,20]){assert.equal(run({kind:'minSpeed',rank},[row(rank)]).status,'ready');assert.equal(run({kind:'minSpeed',rank},[row(5)]).status,'missing');assert.equal(run({kind:'minSpeed',rank},[row(5,['invalid speed slot'])]).status,'manual');assert.equal(run({kind:'minSpeed',rank},[row(5),row(rank,['invalid speed slot'])]).status,'missing');}
});
const hull=(type,rank=10,name=type==='戦艦'?'長門改二':type==='高速戦艦'?'金剛改二':type)=>({type:type==='高速戦艦'?'戦艦':type,typeKnown:true,speedInfo:{rank,base:type==='戦艦'?5:10,known:true,invalid:[]},ship:{ship:name,items:[]}});
test('G original battleship class cap is independent of equipment-adjusted current speed',()=>{
 const {rules}=routes(),rule=rules['5-3'][0].conditions.find(x=>x.kind==='slowBattleshipCount'),run=predicate();assert.ok(rule);assert.equal(rule.kind,'slowBattleshipCount');assert.equal(rule.max,1);
 assert.equal(run(rule,[hull('戦艦',10),hull('戦艦',10,'陸奥改二')]).status,'missing');assert.equal(run(rule,[hull('戦艦',10),hull('高速戦艦',10)]).status,'ready');assert.equal(run(rule,[hull('高速戦艦',10),hull('高速戦艦',10)]).status,'ready');assert.equal(run(rule,[hull('戦艦',10),{...hull(''),typeKnown:false}]).status,'manual');assert.equal(run(rule,[hull('戦艦',10),{...hull(''),typeKnown:false}]).ratio,0);const bad=run(rule,[hull('戦艦',10),hull('戦艦',10,'陸奥改二')]);assert.ok(bad.ratio<1);assert.match(bad.detail,/上限1隻（1隻超過）/);
});
test('one slow battleship remains exempt but two battleships still need current fleet speed',()=>{
 const {rules}=routes(),rule=rules['5-3'][0].conditions.find(x=>x.any),run=predicate();assert.ok(rule);
 assert.equal(run(rule,[hull('戦艦',5),hull('重巡洋艦')]).status,'ready');assert.equal(run(rule,[hull('戦艦',5),hull('高速戦艦')]).status,'missing');assert.equal(run(rule,[hull('戦艦',10),hull('高速戦艦')]).status,'ready');
});
test('unselected air may stop enumeration but stays unresolved and cannot hide another active objective',()=>{
 const c={},pending=load('owned-equipment-planner.js','hdOCSearchPendingGoals',c),air={kind:'air-value',ok:false,unresolved:true,ratio:0,count:10},speed={kind:'speed-ship',ok:false},night={kind:'cap-night-auto',ok:true},goals=[air,speed,night],before=JSON.stringify(goals);
 assert.deepEqual(Array.from(pending(goals,true),x=>x.kind),['speed-ship','cap-night-auto']);assert.equal(pending(goals,true).every(x=>x.ok),false);assert.equal(pending([air,night],true).every(x=>x.ok),true);assert.equal(pending([air,night],false).every(x=>x.ok),false);assert.equal(pending([{...air,unresolved:false},night],true).every(x=>x.ok),false);assert.equal(JSON.stringify(goals),before);assert.equal(air.ratio,0);assert.equal(air.ok,false);
});
test('saved incomplete search explicitly identifies air input waiting, without a ready or purchase claim',()=>{
 const c={hdFEEsc:String},render=load('owned-equipment-planner.js','hdOCSearchStatusHtml',c),html=render({measure:{complete:false},search:{exhaustive:false,examined:0,maxExamined:10000,reasons:['air-target-unselected']}});assert.match(html,/入力待ち/);assert.match(html,/未判定/);assert.match(html,/不足を証明するものではありません/);assert.doesNotMatch(html,/(?:条件を充足|充足しました|購入必須)/);
});
test('route guidance update invalidates old 5-3 proposal signatures through the existing canonical preset',()=>{
 const {maps}=routes(),c={MAP_PLANS:maps,hdOCRouteGoal:()=>'',hdOCOaswTarget:()=>0,hdFEAswConfirmed:()=>({}),hdSENightPolicy:()=>'',hdFLRows:()=>[],hdFERoster:()=>[],localStorage:{getItem:()=>null}},signature=load('owned-equipment-planner.js','hdOCSignature',c),preset=JSON.parse(JSON.stringify(maps['5-3'].presets[0]));assert.match(preset.gear,/G→I/);assert.doesNotMatch(preset.gear,/undefined/);const legacy={...preset,gear:preset.gear.split(' G→I')[0]},fleet={id:'same'};assert.notEqual(signature({map:'5-3',fleet,preset}),signature({map:'5-3',fleet,preset:legacy}));const other={map:'1-2',fleet,preset:maps['1-2'].presets[0]};assert.equal(signature(other),signature(other));
});

test('air input stop requires actual selectable map data, never a fallback capacity problem',()=>{
 const c={hdMapAirData:map=>map==='5-3'?{nodes:{Q:{}}}:null,hdMapAirTarget:()=>({selected:false})},check=load('owned-equipment-planner.js','hdOCUnselectedAir',c);assert.equal(check('5-3'),true);assert.equal(check('fallback-only'),false);c.hdMapAirTarget=()=>({selected:true});assert.equal(check('5-3'),false);c.hdMapAirTarget=()=>null;assert.equal(check('5-3'),false);
});
