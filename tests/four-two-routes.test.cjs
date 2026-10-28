'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(index=0){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-2']["+index+"]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:[]}}));load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);return c;}
const T={V:'正規空母',X:'装甲空母',v:'軽空母',B:'戦艦',b:'高速戦艦',H:'航空戦艦',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',W:'水上機母艦',O:'補給艦',U:'揚陸艦',r:'工作艦','?':'?'};
const plan=(letters,index=0)=>({map:'4-2',routeIndex:index,ships:[...letters].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:10}))});
// Literal expectations come from A/C/D priority tables and the two registered
// six-ship scopes, not from the product predicate. A/B itself remains random.
const cases0=[['VVLDDD','ready'],['VvLDEE','ready'],['VVDDDD','ready'],['VVDEEE','ready'],['CCLDDD','ready'],['LTTDDD','ready'],['LPRDDD','ready'],['LWWDDD','ready'],['BBDEEE','ready'],['PLDDDV','ready'],['ULDDDV','ready'],['rLDDDV','ready'],['VLDDDS','missing'],['VLDDDs','missing'],['VDDDDS','missing'],['VDDDDs','missing'],['VVRDDD','missing'],['VVTDDD','missing'],['VVCLDD','missing'],['VVCDDD','missing'],['VVLDD','missing'],['VVLDDDD','missing']];
const cases1=[['VVDDDD','ready'],['vXDEEE','ready'],['BBDDDD','ready'],['PPDDDD','ready'],['LDDDDD','ready'],['CDDDDE','ready'],['VPDDDD','ready'],['UDDDDV','ready'],['rDDDDV','ready'],['VVLDDD','missing'],['CCLDDD','missing'],['VDDDDS','missing'],['VDDDDs','missing'],['VVDDD','missing'],['VVDDDDD','missing']];
test('4-2 registered scopes preserve both random-start routes and admit DD/DE, noncarrier and non-CL alternatives only where sourced',()=>{
 for(const [index,cases]of [[0,cases0],[1,cases1]]){const c=context(index);for(const [letters,status]of cases){const p=plan(letters,index),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,status,index+':'+letters);assert.equal(JSON.stringify(p),before);}}
});
test('A submarine priority precedes the escort fixed-C conditions and never treats a submarine tender as SS/SSV',()=>{
 for(const index of [0,1]){const c=context(index),rule=c.data.conditions.find(x=>x.reason?.startsWith('A→C：潜水'));assert.ok(rule,'earlier source condition is connected');
  for(const letters of ['VDDDDS','VDDDDs']){const p=plan(letters,index),check=c.hdFEBranchPredicate(rule,c.hdFERouteShips(p),p);assert.equal(check.status,'missing',letters+' reaches C/E random before escorts');}
  assert.equal(c.hdFERouteContract(plan('VPDDDD',index)).status,'ready','AS is a different class');
  assert.match(rule.reason,/固定Cより先にC\/Eランダム/);assert.match(c.data.conditions[2].reason,/編成見直し/);
 }
 const c=context();for(const letters of ['VLDDDS','VLDDDs'])assert.equal(c.hdFERouteContract(plan(letters)).status,'missing','CL plus three escorts does not override earlier SS: '+letters);
});
test('unknown input stays manual, while known submarine and impossible escort bounds still determine mismatch',()=>{
 for(const index of [0,1]){const c=context(index);assert.equal(c.hdFERouteContract(plan('VDDDD?',index)).status,'manual');assert.equal(c.hdFERouteContract(plan('SDDDD?',index)).status,'missing');assert.equal(c.hdFERouteContract(plan('VVCTD?',index)).status,'missing');}
 assert.equal(context().hdFERouteContract(plan('VLDDD?')).status,'manual');
});
test('speed, scouting and equipment do not replace the sourced formation requirements or random start',()=>{
 for(const index of [0,1]){const c=context(index);assert.equal(c.data.path,'ACL / BDCL');assert.equal(c.data.routing,'multiple');assert.equal(c.data.useExampleScope,false);assert.equal(c.data.los.kind,'none');
  for(const rank of [5,10,15,20,null]){const p=plan('VVDDDD',index);p.ships.forEach(x=>x.rank=rank);assert.equal(c.hdFERouteContract(p).status,'ready','speed is not mandatory: '+rank);}
  const kinds=JSON.stringify(c.data.conditions);for(const kind of ['minSpeed','speedCount','equipmentShips','scoutingValue','airValue'])assert.equal(kinds.includes('"kind":"'+kind+'"'),false);
  const notes=c.data.notes.join(' / ');for(const text of ['始点A/Bはランダム','A→C→L','B→D→C→L','B→D','通常戦闘扱い','先制対潜','利用者','購入必須'])assert.ok(notes.includes(text),text);
  assert.deepEqual(Array.from(c.data.equipmentKinds),['対潜','制空','防空','夜戦']);
 }
});
test('a noncarrier route-valid alternative bypasses only canonical-example counts and preserves explicit user and flagship constraints',()=>{
 const c=context(),canonical={requirements:[{token:'正規空母',count:2}],total:6,conditionManual:false,speedRequired:0,flagship:''};
 c.hdFERouteBasic=()=>({status:'missing',detail:'canonical carrier example differs',requirements:canonical.requirements});c.hdFEBranchRoute=()=>({available:false});c.hdFERouteFlagshipOk=(_ships,info)=>!info?.flagship;c.hdFSPresetInfo=()=>canonical;load('fleet-readiness-evaluator.js','hdFERoute',c);
 const p=plan('CCLDDD');assert.equal(c.hdFERoute(p).status,'ready');assert.deepEqual(Array.from(c.hdFERoute(p).requirements),[]);
 p.routeInfo={...canonical,requirements:[{token:'戦艦',count:3}]};assert.equal(c.hdFERoute(p).status,'missing','explicit user fleet requirement is retained');
 p.routeInfo={...canonical,flagship:'利用者の旗艦条件'};assert.equal(c.hdFERoute(p).status,'missing','flagship constraint is retained');
});
