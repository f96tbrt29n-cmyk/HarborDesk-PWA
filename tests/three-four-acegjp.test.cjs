'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['3-4'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:[]}}));load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);return c;}
const T={V:'正規空母',X:'装甲空母',v:'軽空母',B:'戦艦',b:'高速戦艦',H:'航空戦艦',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',U:'揚陸艦',R:'練習巡洋艦',W:'水上機母艦',O:'補給艦',r:'工作艦','?':'?'};
const plan=letters=>({map:'3-4',routeIndex:0,ships:[...letters].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:10}))});
function check(c,p,prefix){const r=c.hdFERouteContract(p).checks.find(x=>x.condition.reason?.startsWith(prefix));assert.ok(r,prefix+' connected');return r;}
// Literal expectations follow the ordered 3-4 tables, not product predicates.
// ACEGJP fixed-path failure is not a proof of impossible boss arrival.
const cases=[
 ['BVVvLW','ready'],['BBVVLW','ready'],['VVvvLW','ready'],['BBVvLW','ready'],['BBBBLW','ready'],['bVXvLW','ready'],['HVXvLW','ready'],
 ['BVVLDW','ready'],['BVVLSW','ready'],['BVVLsW','ready'],['BVVLPW','ready'],['BVVLOW','ready'],
 ['BBVvDW','ready'],['BBVvEW','ready'],['BBVvLO','ready'],['BBVvDO','ready'],['BBVvEO','ready'],
 ['BBVvDP','missing'],['BBVvLP','missing'],['BBVvDS','missing'],['BBVvDs','missing'],['BBVVLT','missing'],
 ['BBVvTW','missing'],['BBVvRW','missing'],['BBVvCW','missing'],['VVVvLW','missing'],['BBBBvL','missing'],
 ['BVCLCW','missing'],['VWLDDD','missing'],['WLDDDD','missing'],['BVVvL','missing'],['BVVvLWD','missing']
];
test('3-4 full fixed route accepts documented destroyer and escort alternatives without relaxing capital or C bounds',()=>{
 const c=context();for(const [letters,status]of cases){const p=plan(letters),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,status,letters);assert.equal(JSON.stringify(p),before);}
});
test('start and C priority checks identify the actual branch rather than a simplified fleet example',()=>{
 const c=context();assert.equal(c.data.path,'ACEGJP');
 assert.equal(check(c,plan('CWSTPA'),'始点→A').status,'ready','escort0 masks submarine random');
 assert.equal(check(c,plan('BVVLSW'),'始点→A').status,'ready','capital3 masks submarine random');
 assert.equal(check(c,plan('BVCLCW'),'始点→A').status,'missing','capital2 only gives A/B random');
 assert.equal(check(c,plan('VWLDDD'),'始点→A').status,'missing','capital1 goes B');
 assert.equal(check(c,plan('VWLDDD'),'C→E').status,'ready','C water condition is independent of start B');
 assert.equal(check(c,plan('WLDDDD'),'始点→A').status,'missing','zero-capital DD4 starts D, not A');assert.match(check(c,plan('WLDDDD'),'始点→A').detail,/駆逐3隻以上.*D/);assert.match(check(c,plan('WLDDDD'),'始点→A').detail,/B\/Dランダム/);
 assert.equal(check(c,plan('BBVvTW'),'始点→A').status,'ready');assert.equal(check(c,plan('BBVvTW'),'C→E').status,'missing','CLT is not CL/DD/DE');
 for(const letters of ['VVVvLW','BBBBvL','BVCLCW'])assert.equal(check(c,plan(letters),'C→E').status,'missing',letters+' earlier C condition');
});
test('submarine tender random is distinct from a supply ship and cannot override a known water tender',()=>{
 const c=context();for(const letters of ['BVVLPW','BVVLSW','BVVLsW'])assert.equal(check(c,plan(letters),'C→E').status,'ready',letters);
 for(const letters of ['BBVvLP','BBVvDP']){const r=check(c,plan(letters),'C→E');assert.equal(r.status,'missing');assert.match(r.detail,/ランダム/);}
 for(const letters of ['BBVvLO','BBVvDO','BBVvEO'])assert.equal(c.hdFERouteContract(plan(letters)).status,'ready',letters);
 for(const letters of ['BBVvDS','BBVvDs'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing','SS/SSV is not AV/AO/AS');
});
test('unknown hulls and uncertain special types never silently fix ACEGJP or erase a known mismatch',()=>{
 const c=context();for(const letters of ['BVVvL?','BVVv?W','BVV?LW','BVVLP?'])assert.equal(c.hdFERouteContract(plan(letters)).status,'manual',letters);
 for(const letters of ['VVV?LW','VVV?SW'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing',letters+' CVn3 is already known');
 for(const special of ['U','R','r'])assert.equal(c.hdFERouteContract(plan('BVVLW'+special)).status,'manual','uncited special free hull '+special);
 assert.equal(c.hdFERouteContract(plan('BVVLTW')).status,'ready','ordinary CLT can be a free hull with an actual CL present');
});
test('ACEGJP passage does not require fast-plus, scouting, radar or resource bonus equipment',()=>{
 const c=context();assert.equal(c.data.useExampleScope,false);assert.equal(c.data.los.kind,'none');assert.equal(c.data.minimumSpeed,undefined);
 for(const rank of [5,10,15,20,null]){const p=plan('BVVvLW');p.ships.forEach(x=>x.rank=rank);assert.equal(c.hdFERouteContract(p).status,'ready','speed '+rank);}
 const text=JSON.stringify(c.data.conditions);for(const kind of ['minSpeed','speedCount','equipmentShips','scoutingValue','airValue'])assert.equal(text.includes('"kind":"'+kind+'"'),false,kind);
 assert.match(c.data.notes.join(' / '),/ドラム缶|大発/);assert.match(c.data.notes.join(' / '),/推奨/);
 assert.match(c.data.notes.join(' / '),/G→J/);assert.match(c.data.notes.join(' / '),/J→P/);
});
