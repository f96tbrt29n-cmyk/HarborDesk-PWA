'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['3-3'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:[]}}));load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);return c;}
const T={V:'正規空母',X:'装甲空母',v:'軽空母',B:'戦艦',b:'高速戦艦',H:'航空戦艦',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',U:'揚陸艦',R:'練習巡洋艦',W:'水上機母艦',O:'補給艦',r:'工作艦','?':'?'};
const plan=letters=>({map:'3-3',routeIndex:0,ships:[...letters].map((x,i)=>({ship:'source-partition-'+i,type:T[x],items:[],rank:10}))});
function check(c,p,prefix){const r=c.hdFERouteContract(p).checks.find(x=>x.condition.reason?.startsWith(prefix));assert.ok(r,prefix+' connected');return r;}
// Expected values are fixed from the ordered A/C/G tables, not generated from
// HD_MAP_ROUTE_REQUIREMENTS. See docs/pr152-three-three-acgm-ja.md for sources.
test('3-3 documented normal fleets distinguish both A-to-C alternatives and C-to-G boundaries',()=>{
 const c=context(),cases=[
  ['VvCCDD','ready'],['VBCCDD','ready'],['VbCCDD','ready'],['VHCCDD','ready'],['XvATDD','ready'],
  ['VvCCDE','ready'],['VvCCEE','ready'],['BLDDDD','ready'],['vLDDDD','ready'],['VLDDDD','ready'],
  ['vCCLDD','missing'],['BCCLDD','missing'],['VCCLDD','missing'],['CCCLDD','missing'],
  ['BTDDDD','missing'],['BRDDDD','missing'],['BLDDDE','missing'],['VvCCCD','missing'],
  ['VVCCDD','missing'],['XXCCDD','missing'],['VvvCDD','missing'],['VBBCDD','missing'],
  ['VvCCD','missing'],['VvCCDDD','missing']
 ];
 for(const [letters,status]of cases){const p=plan(letters),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,status,letters);assert.equal(JSON.stringify(p),before);}
});
test('A, C and G retain ordered explanations rather than treating every route mismatch as impossible',()=>{
 const c=context();assert.equal(c.data.path,'ACGM');
 assert.equal(check(c,plan('BCCLDD'),'A→C').status,'missing');
 assert.equal(check(c,plan('VCCLDD'),'A→C').status,'ready');assert.equal(check(c,plan('VCCLDD'),'C→G').status,'missing');
 assert.equal(check(c,plan('VVCCDD'),'A→C').status,'ready');assert.equal(check(c,plan('VVCCDD'),'C→G').status,'missing');
 assert.equal(check(c,plan('VvCCCD'),'C→G').status,'missing');
 for(const letters of ['VvSDDD','VvsDDD']){const r=check(c,plan(letters),'G→M');assert.equal(r.status,'missing');assert.match(r.detail,/ランダム/);assert.doesNotMatch(r.detail,/購入必須|到達不可能|手持ちでは不可能/);}
});
test('submarine types and unverified special hulls do not silently guarantee G-to-M',()=>{
 const c=context();for(const letters of ['VvSDDD','VvsDDD'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing',letters);
 for(const special of ['P','U','R','W','O','r']){const p=plan('VvC'+special+'DD');assert.equal(check(c,p,'G→M').status,'ready',special+' is not SS/SSV');assert.equal(c.hdFERouteContract(p).status,'manual',special+' map-specific free-hull coverage unconfirmed');}
 assert.equal(c.hdFERouteContract(plan('VVUDDD')).status,'missing','known C failure survives unverified special hull');
});
test('unknown hulls remain manual without erasing a known route mismatch',()=>{
 const c=context();assert.equal(c.hdFERouteContract(plan('VvC?DD')).status,'manual');
 for(const letters of ['VV?DDD','VvS?DD','VvCC?D'])assert.equal(c.hdFERouteContract(plan(letters)).status,letters==='VvCC?D'?'manual':'missing',letters);
 const p=plan('VvC?DD'),before=JSON.stringify(p);c.hdFERouteContract(p);assert.equal(JSON.stringify(p),before);
});
test('speed, radar, scouting and combat recommendations are not ACGM route requirements',()=>{
 const c=context();assert.equal(c.data.los.kind,'none');assert.equal(c.data.minimumSpeed,undefined);assert.equal(c.data.useExampleScope,false);
 for(const rank of [5,10,15,20,null]){const p=plan('VvCCDD');p.ships.forEach(x=>x.rank=rank);assert.equal(c.hdFERouteContract(p).status,'ready','speed '+rank);}
 const allConditions=JSON.stringify(c.data.conditions);for(const kind of ['minSpeed','speedCount','equipmentShips','scoutingValue','airValue'])assert.equal(allConditions.includes('"kind":"'+kind+'"'),false,kind);
 assert.ok(c.data.equipmentKinds.includes('電探'));assert.ok(c.data.equipmentKinds.includes('制空'));
 assert.match(c.data.notes.join(' / '),/電探.*(?:推奨|必須では)/);
 assert.match(c.data.notes.join(' / '),/(?:勝利|勝てる).*(?:保証|別)|(?:保証|別).*勝利/);
});
