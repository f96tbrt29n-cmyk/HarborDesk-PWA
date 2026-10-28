'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-1'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:[]}}));load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);return c;}
const T={V:'正規空母',X:'装甲空母',v:'軽空母',B:'戦艦',b:'高速戦艦',H:'航空戦艦',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',W:'水上機母艦',O:'補給艦',U:'揚陸艦',r:'工作艦','?':'?'};
const plan=letters=>({map:'4-1',routeIndex:0,ships:[...letters].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:10}))});
function check(c,p,prefix){const r=c.hdFERouteContract(p).checks.find(x=>x.condition.reason?.startsWith(prefix));assert.ok(r,prefix+' connected');return r;}
// Literal expectations were transcribed from the ordered source tables before
// evaluating product predicates. Both start outcomes must remain within this
// registered union; a different route is not impossible boss arrival.
const cases=[
 ['VVCCCD','ready'],['XvCCCD','ready'],['BHCCCD','ready'],
 ['VVCCDD','ready'],['VVCCDE','ready'],['VVCCEE','ready'],
 ['VVCDDD','ready'],['VCLDDD','ready'],['vLRDDD','ready'],
 ['CCCLTT','ready'],['CCCLTD','ready'],['CCCLTE','ready'],
 ['VVCCDP','ready'],['VVCCDW','ready'],['VVCCDO','ready'],['VVCCTP','ready'],
 ['VVCTDD','ready'],['VVCRDD','ready'],
 ['VVCLDD','missing'],['VCCLDD','missing'],['VVCLDE','missing'],
 ['VLDDDD','missing'],['VDDDDD','missing'],['CCCLDD','missing'],['LDDDDD','missing'],
 ['BBVCCD','missing'],['BBVVCD','missing'],['BBBBVD','missing'],
 ['VVCCDS','missing'],['VVCCDs','missing'],['VVCCD','missing'],['VVCCCDD','missing']
];
test('4-1 combined routes admit the documented zero, two and three escort alternatives without relaxing C or submarine bounds',()=>{
 const c=context();for(const [letters,status]of cases){const p=plan(letters),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,status,letters);assert.equal(JSON.stringify(p),before);}
});
test('C and D use source priority and distinguish a fixed route group from a random or different branch',()=>{
 const c=context();assert.equal(c.data.path,'CFDGJ / ABDGJ');assert.equal(c.data.routing,'multiple');
 for(const letters of ['BBVCCD','BBVVCD','BBBBVD'])assert.equal(check(c,plan(letters),'C→F').status,'missing',letters+' earlier E or random E/F');
 for(const letters of ['VVCCDD','VVCCDE','VVCCEE','VVCDDD','VCLDDD','CCCLTD'])assert.equal(check(c,plan(letters),'D→G：この').status,'ready',letters);
 for(const letters of ['VLDDDD','VCCLDD','VVCLDD','CCCLDD'])assert.equal(check(c,plan(letters),'D→G：この').status,'missing',letters+' H or random G/H');
 assert.equal(check(c,plan('VVCTDD'),'D→G：この').status,'ready','CLT is not CL');
 assert.equal(check(c,plan('VVCRDD'),'D→G：この').status,'ready','CT is not CL');
 assert.match(check(c,plan('VCCLDD'),'D→G：この').detail,/重巡級.*HまたはG\/Hランダム/);
 for(const letters of ['VVCCDS','VVCCDs'])assert.equal(check(c,plan(letters),'D→G：潜水').status,'missing',letters+' prior submarine random');
 assert.equal(check(c,plan('VVCCDP'),'D→G：潜水').status,'ready','AS does not count as SS/SSV');
});
test('4-1 unknown hulls and uncited special classes stay manual without erasing a known failure',()=>{
 const c=context();for(const letters of ['VVCCC?','VVCC?D','VVCDDU','VVCDDr'])assert.equal(c.hdFERouteContract(plan(letters)).status,'manual',letters);
 for(const letters of ['BVVCD?','VDDDD?','VVCDS?'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing',letters+' known mismatch survives unknown');
});
test('the two registered routes share D and have no speed, scouting or equipment passage threshold',()=>{
 const c=context();assert.equal(c.data.useExampleScope,false);assert.equal(c.data.los.kind,'none');assert.equal(c.data.minimumSpeed,undefined);
 for(const rank of [5,10,15,20,null]){const p=plan('VVCCDD');p.ships.forEach(x=>x.rank=rank);assert.equal(c.hdFERouteContract(p).status,'ready','speed '+rank);}
 const conditions=JSON.stringify(c.data.conditions);for(const kind of ['minSpeed','speedCount','equipmentShips','scoutingValue','airValue'])assert.equal(conditions.includes('"kind":"'+kind+'"'),false,kind);
 const notes=c.data.notes.join(' / ');for(const text of ['始点A/Cはランダム','A→B→D','C→F→D','G→J','F→D','同0隻','先制対潜','利用者','購入必須'])assert.ok(notes.includes(text),text);
 assert.deepEqual(Array.from(c.data.equipmentKinds),['対潜','制空','防空','夜戦']);
});
