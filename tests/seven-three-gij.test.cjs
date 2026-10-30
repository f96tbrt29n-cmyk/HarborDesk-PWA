'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>({}),hdFEFindShip:name=>({name}),hdShipDbMasterRowFor:row=>({name:row.name}),hdFESpeedLabel:()=> '高速'});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['7-3'][1]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships;load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);load('owned-equipment-planner.js','hdOCShortageGoals',c);return c}
const hull=(type,name=type)=>({type,typeKnown:!!type,ship:{ship:name,items:[]},speedInfo:{known:true,rank:10,invalid:[]}});
const registered=()=>[hull('重巡洋艦','羽黒改二'),hull('重巡洋艦','足柄改二'),hull('航空巡洋艦','最上改二特'),...['時雨改二','雪風改','Samuel B.Roberts改'].map(n=>hull('駆逐艦',n))];
test('7-3 index1 is P-open second gauge and source disagreement cannot become fixed or random',()=>{
 const c=context(),d=c.data;assert.equal(d.index,1);assert.equal(d.minimumSpeed,10);assert.equal(d.los.kind,'none');assert.equal(d.scopeIncomplete,true);assert.notEqual(d.routing,'random');assert.match(d.path,/ACDGJP/);assert.match(d.path,/ACDGIJP/);assert.match(d.scopeIncompleteReason,/G.*重巡.*重巡級.*未確認/);assert.match(d.notes.join(' '),/J.*優先/);
 const r=c.hdFERouteContract({ships:registered()});assert.equal(r.status,'manual');assert.ok(r.checks.filter(x=>x.condition.kind!=='unverified').every(x=>x.status==='ready'));assert.ok(r.checks.some(x=>x.condition.kind==='unverified'&&x.status==='manual'));
});
test('source-independent CA and CA-class membership has explicit positive, negative and count boundaries',()=>{
 const c=context(),ca={kind:'typeCount',types:['重巡洋艦'],matchPolicy:'exact',min:3,max:7},group={...ca,types:['重巡洋艦','航空巡洋艦']};
 // Literal expectations from the source definitions, never from product aliases.
 for(const [types,caCount,classCount] of [[[],0,0],[['重巡洋艦','重巡洋艦'],2,2],[['重巡洋艦','重巡洋艦','航空巡洋艦'],2,3],[['重巡洋艦','重巡洋艦','重巡洋艦'],3,3],[['航空巡洋艦','航空巡洋艦','航空巡洋艦','航空巡洋艦'],0,4],[['軽巡洋艦','重雷装巡洋艦','水上機母艦','海防艦','潜水空母'],0,0]]){
  const rows=types.map(t=>hull(t));for(const [condition,count] of [[ca,caCount],[group,classCount]]){const r=c.hdFEBranchPredicate(condition,rows);assert.equal(r.count,count);assert.equal(r.status,count>=3?'ready':'missing');}
 }
});
test('I-to-J CA-class requirement rejects two CAs plus a CL but accepts a CAV as the third',()=>{
 const c=context(),rule=c.data.conditions.find(x=>x.reason?.startsWith('I→J'));assert.ok(rule);assert.deepEqual(Array.from(rule.types),['重巡洋艦','航空巡洋艦']);assert.equal(rule.matchPolicy,'exact');assert.equal(rule.min,3);
 for(const [third,expected] of [['航空巡洋艦','ready'],['重巡洋艦','ready'],['軽巡洋艦','missing'],['重雷装巡洋艦','missing'],['水上機母艦','missing'],['','manual']]){const rows=registered();rows[2]=hull(third);const r=c.hdFEBranchPredicate(rule,rows);assert.equal(r.status,expected);assert.equal(r.count,third==='航空巡洋艦'||third==='重巡洋艦'?3:2);}
});
test('registered named pair is not excluded by the later J CA-class alternative',()=>{
 const c=context(),rows=registered(),checks=c.hdFERouteContract({ships:rows}).checks;assert.ok(checks.filter(x=>x.condition.kind!=='unverified').every(x=>x.status==='ready'));assert.ok(checks.filter(x=>x.condition.kind==='namedCount').length===2);assert.equal(checks.find(x=>x.condition.kind==='minSpeed').status,'ready');
});
test('known hull mismatch and missing hull information remain distinct and never become equipment purchases',()=>{
 const c=context(),bad=registered();bad[2]=hull('軽巡洋艦','阿武隈改二');const missing=c.hdFERouteContract({ships:bad});assert.equal(missing.status,'missing');assert.ok(missing.checks.some(x=>x.condition.reason?.startsWith('I→J')&&x.status==='missing'));
 const unknown=registered();unknown[2]=hull('','艦情報未登録');assert.equal(c.hdFERouteContract({ships:unknown}).status,'manual');
 assert.equal(c.hdOCShortageGoals({goals:[{kind:'route-requirements',ok:false,unresolved:false},{kind:'route-requirements',ok:false,unresolved:true}]}).length,0);
});
test('an unknown cruiser stays manual while a different known slow hull makes the aggregate missing',()=>{
 const c=context(),rows=registered();rows[2]=hull('','艦情報未登録');rows[2].speedInfo.known=false;rows[3].speedInfo.rank=5;
 const r=c.hdFERouteContract({ships:rows});assert.equal(r.status,'missing');assert.equal(r.checks.find(x=>x.condition.reason?.startsWith('I→J')).status,'manual');assert.equal(r.checks.find(x=>x.condition.kind==='minSpeed').status,'missing');
});
// The independently sourced first-gauge A/C scope is covered by
// seven-three-first-routes.test.cjs; keep this second-gauge guard intact.
test('second gauge keeps its existing speed and historical hull requirements',()=>{
 const c=context();
 assert.equal(c.data.conditions.find(x=>x.kind==='minSpeed').rank,10);assert.deepEqual(Array.from(c.data.conditions.filter(x=>x.kind==='namedCount').flatMap(x=>Array.from(x.names))),['羽黒','足柄']);
});
