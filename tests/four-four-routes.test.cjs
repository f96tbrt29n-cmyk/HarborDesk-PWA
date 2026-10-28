'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-4'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:[]}}));load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);return c;}
const T={V:'正規空母',X:'装甲空母',v:'軽空母',B:'戦艦',b:'高速戦艦',H:'航空戦艦',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',W:'水上機母艦',O:'補給艦',U:'揚陸艦',r:'工作艦','?':'?'};
const plan=letters=>({map:'4-4',routeIndex:0,ships:[...letters].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:10}))});
// These literal expectations were fixed from the ordered source tables. The
// three I→K alternatives are independent, and “two heavy cruisers” is exact.
const ready=['BVXCDD','BVXCDE','VXCCDD','vVXCDD','vvvLDD','BCCLDD','VCCLDD','CCCLDD','CCTTDD','CCRRDD','CCDDSs','CCDDPP','LDDPPP','BCLDDE','VVCDEE','VVCLDE','LDDDrr'];
const missing=['BBVCDD','BBVVDD','VVCCCD','BVCLDD','vvCTDD','vvCRDD','BBVVDE','BVCDEE','RRDDDD','CCCCDD'];
test('4-4 admits each independently documented I-to-K alternative without requiring two regular carriers',()=>{
 const c=context();for(const [cases,status]of [[ready,'ready'],[missing,'missing']])for(const letters of cases){const p=plan(letters),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,status,letters);assert.equal(JSON.stringify(p),before);}
});
test('E preserves source disagreement on DE priority rather than inventing either I or C',()=>{
 const c=context();for(const letters of ['CCEEEE','LCDEEE','CCDEEP','LLDEEO','VVCEEP'])assert.equal(c.hdFERouteContract(plan(letters)).status,'manual',letters+' disputed earlier DE condition');
 for(const letters of ['BVXCDE','VVCDEE','VVCLDE'])assert.equal(c.hdFERouteContract(plan(letters)).status,'ready',letters+' outside disputed scope');
 assert.equal(c.hdFERouteContract(plan('VCDEEP')).status,'missing','known I counterexample wins the DE manual guard');
 const notes=c.data.notes.join(' / ');for(const text of ['出典','海防','優先','未判定'])assert.ok(notes.includes(text),text);
});
test('SS/SSV are not a blanket exclusion, while type-specific uncertain carrier treatment stays manual only when consequential',()=>{
 const c=context();assert.equal(c.hdFERouteContract(plan('CCDDSs')).status,'ready','two CA/CAV and two escorts decide the earlier branches');
 for(const letters of ['BBDDLU','VVLDDU','CLDDUr','BVLDDU','BCDDUU'])assert.equal(c.hdFERouteContract(plan(letters)).status,'manual',letters+' uncited LHA carrier classification could change I');
 assert.equal(c.hdFERouteContract(plan('BBCDDU')).status,'missing','one LHA cannot supply the two regular carriers when CL is absent');
 for(const letters of ['CCDDUU','CCDEUU','CCDDUr'])assert.equal(c.hdFERouteContract(plan(letters)).status,'ready',letters+' CA2 decides I and remaining two hulls cannot exceed E cap');
});
test('unknown hulls remain manual without hiding already known S, E or I mismatches',()=>{
 const c=context();for(const letters of ['BVXCD?','VCCDD?','BVVDD?','VVCCD?'])assert.equal(c.hdFERouteContract(plan(letters)).status,'manual',letters);
 for(const letters of ['BBBBD?','BBVVD?','VVVDD?','VVVCC?'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing',letters+' known route failure survives unknown');
});
test('AEIK has no mandatory speed or numeric scouting or equipment threshold and retains explicit user fleet constraints',()=>{
 const c=context();assert.equal(c.data.path,'AEIK');assert.equal(c.data.useExampleScope,false);assert.equal(c.data.los.kind,'none');
 for(const rank of [5,10,15,20,null]){const p=plan('BCCLDD');p.ships.forEach(s=>s.rank=rank);assert.equal(c.hdFERouteContract(p).status,'ready','speed '+rank);}
 const kinds=JSON.stringify(c.data.conditions);for(const kind of ['minSpeed','speedCount','equipmentShips','scoutingValue','airValue'])assert.equal(kinds.includes('"kind":"'+kind+'"'),false,kind);
 const canonical={requirements:[{token:'正規空母',count:2}],total:6,conditionManual:false,speedRequired:0,flagship:''};c.hdFERouteBasic=()=>({status:'missing',detail:'canonical carrier example differs',requirements:canonical.requirements});c.hdFEBranchRoute=()=>({available:false});c.hdFERouteFlagshipOk=(_ships,info)=>!info?.flagship;c.hdFSPresetInfo=()=>canonical;load('fleet-readiness-evaluator.js','hdFERoute',c);
 const p=plan('BCCLDD');assert.equal(c.hdFERoute(p).status,'ready');assert.deepEqual(Array.from(c.hdFERoute(p).requirements),[]);p.routeInfo={...canonical,requirements:[{token:'戦艦',count:3}]};assert.equal(c.hdFERoute(p).status,'missing');p.routeInfo={...canonical,flagship:'利用者指定の旗艦'};assert.equal(c.hdFERoute(p).status,'missing');
});
