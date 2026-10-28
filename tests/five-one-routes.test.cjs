'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
const T={B:'戦艦',b:'高速戦艦',H:'航空戦艦',V:'正規空母',X:'装甲空母',v:'軽空母',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',O:'補給艦',W:'水上機母艦',U:'揚陸艦',r:'工作艦','?':'?'};
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-1'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:s.invalid?['invalid speed fitting']:[],expansionUnconfirmed:!!s.expansionUnknown}}));for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract','hdFESpeedTarget','hdFEBranchGoal','hdFEPlanSpeedTarget'])load('fleet-readiness-evaluator.js',n,c);return c;}
const plan=(fleet,rank=10)=>({map:'5-1',routeIndex:0,ships:[...fleet].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:Array.isArray(rank)?rank[i]:rank}))});
// The literal boundaries come from the ordered source tables, not from product
// predicates. DD is destroyer only; plain CL excludes CLT and CT.
test('5-1 allows the independent DD4 alternative without making CL a universal requirement',()=>{
 const c=context();for(const fleet of ['BCDDDD','B ADDDD'.replace(' ',''),'CADDDD','CTDDDD','CRDDDD','SsDDDD','PODDDD','vCDDDD','BvCLDD','HvALDD','BbCLDD','CALLDD','WOLLDD','DDDDDD','LDDDDD','vDDDDD']){const p=plan(fleet),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,'ready',fleet);assert.equal(JSON.stringify(p),before);}
 assert.equal(c.data.path,'BCFJ');assert.equal(c.data.useExampleScope,false);
});
test('ordinary light fixed routes do not require speed information or a speed upgrade',()=>{
 const c=context();for(const fleet of ['BCDDDD','BvCLDD'])for(const rank of [5,10,15,20,null]){const p=plan(fleet,rank);assert.equal(c.hdFERouteContract(p).status,'ready',fleet+' '+rank);assert.equal(c.hdFEPlanSpeedTarget(p),0);}
 assert.equal(c.data.los.kind,'none');assert.equal(c.data.minimumSpeed,undefined);assert.equal(JSON.stringify(c.data.conditions).includes('equipmentShips'),false);
});
test('known earlier carrier and start mismatches survive unknown hulls or speed',()=>{
 const c=context();for(const fleet of ['VCDDDD','XADDDD','vvDDDD','VVCDDD','BBBBBL','BBBvDD','VC DDD?'.replace(' ',''),'vvDDD?','BBBBB?','VCDDDU'])for(const rank of [10,20,null])assert.equal(c.hdFERouteContract(plan(fleet,rank)).status,'missing',fleet+' '+rank);
});
test('DD3, CA2+DD2 and CLT retain ordinary F randomness rather than buying a fourth destroyer as gear',()=>{
 const c=context();for(const fleet of ['BCDDDE','BCDDDP','BCDDDs','CAD DOP'.replace(' ',''),'CATDDO','BvCCLD','BBvCCL','CCCCLL'])for(const rank of [10,15])assert.equal(c.hdFERouteContract(plan(fleet,rank)).status,'missing',fleet+' '+rank);
 const text=c.data.notes.join(' / ')+c.data.conditions.map(x=>x.reason||'').join(' / ');for(const part of ['ランダム','編成','装備購入','BCFGJ'])assert.ok(text.includes(part),part);
});
test('fastest-dependent alternatives stay source-wait only where ordinary routing cannot decide',()=>{
 const c=context();for(const fleet of ['BBvCAL','BvCALD','CADDOP','CCCCLL'])for(const rank of [20,null])assert.equal(c.hdFERouteContract(plan(fleet,rank)).status,'manual',fleet+' '+rank);
 for(const fleet of ['BBvCAL','BvCALD','CADDOP']){const p=plan(fleet,20);p.ships[0].rank=15;assert.equal(c.hdFERouteContract(p).status,'missing',fleet+' known non-fastest');p.ships[0].invalid=true;assert.equal(c.hdFERouteContract(p).status,'manual',fleet+' invalid low speed is not proof');p.ships[1].rank=10;assert.equal(c.hdFERouteContract(p).status,'missing',fleet+' another valid low speed');}
 assert.equal(c.hdFERouteContract(plan('BBB CAL'.replace(' ',''),20)).status,'missing','known B-E precedes F fastest uncertainty');
});
test('S and B component checks retain their own priorities rather than borrowing a later mismatch',()=>{
 const c=context(),s=c.data.conditions.find(x=>x.reason?.startsWith('S→B')),b=c.data.conditions.find(x=>x.reason?.startsWith('B→C：戦艦'));
 assert.ok(s);assert.ok(b);for(const fleet of ['BBvCAL','BvCALD','CCCCLL'])assert.equal(c.hdFEBranchPredicate(s,c.hdFERouteShips(plan(fleet)),plan(fleet)).status,'ready',fleet+' start B');
 const known=plan('BBBBBL');assert.equal(c.hdFEBranchPredicate(s,c.hdFERouteShips(known),known).status,'missing','heavy5 selects A first');
 for(const [fleet,status]of [['BBvCAL','ready'],['BBBCAL','missing'],['BBBDDD','ready']]){const p=plan(fleet);assert.equal(c.hdFEBranchPredicate(b,c.hdFERouteShips(p),p).status,status,fleet+' B component');}
});
test('unknown types and special-hull source scope remain manual without hiding a known failure',()=>{
 const c=context();for(const fleet of ['BCDDD?','BCLDD?','UCDDDD','UvLCDD'])assert.equal(c.hdFERouteContract(plan(fleet)).status,'manual',fleet);
 assert.equal(c.hdFERouteContract(plan('VCDDDU')).status,'missing','known CVn exclusion dominates LHA uncertainty');
 assert.equal(c.hdFERouteContract(plan('SSssss')).status,'missing','all-sub fleet does not inherit the mixed DD4 alternative');
 assert.equal(c.hdFERouteContract(plan('SsDDDD')).status,'ready','mixed SS and SSV are not a blanket exclusion');
});
test('CT substitution stays unconfirmed only when it can change a sourced branch result',()=>{
 const c=context();assert.equal(c.hdFERouteContract(plan('CARDDO')).status,'manual','plain taxonomy does not prove that CT can or cannot substitute at F');
 for(const fleet of ['CRDDDD','BCLDDR'])assert.equal(c.hdFERouteContract(plan(fleet)).status,'ready',fleet+' independent DD4 or known CL condition');
 const s=c.data.conditions.find(x=>x.reason?.startsWith('S→B')),b=c.data.conditions.find(x=>x.reason?.startsWith('B→C：戦艦'));
 for(const rank of [20,null]){const p=plan('CCCCRD',rank);assert.equal(c.hdFEBranchPredicate(s,c.hdFERouteShips(p),p).status,'manual','CT could decide S CA4+CL condition');assert.equal(c.hdFERouteContract(p).status,'manual','S and fastest F are both unconfirmed');}
 assert.equal(c.hdFERouteContract(plan('CCCCRD',10)).status,'missing','known non-fastest F failure is not hidden by CT uncertainty');
 const p=plan('BBBDDR');assert.equal(c.hdFEBranchPredicate(b,c.hdFERouteShips(p),p).status,'manual','CT changes B CLexact1 priority');assert.equal(c.hdFERouteContract(p).status,'missing','known start random still defeats selected fixed route');
 assert.equal(c.hdFERouteContract(plan('BBBCCR',20)).status,'missing','a single consistent CT interpretation cannot fix both S and B for BB3');
 assert.equal(c.hdFERouteContract(plan('VCRDDD')).status,'missing','known CVn exclusion survives CT uncertainty');
});
test('registered scope is six ships and custom quest/flagship requirements remain in force',()=>{
 const c=context();for(const fleet of ['BCDDD','BCDDDDD'])assert.equal(c.hdFERouteContract(plan(fleet)).status,'missing',fleet);
 const canonical={requirements:[{token:'戦艦級',count:1},{token:'軽空母',count:1},{token:'重巡',count:1},{token:'軽巡',count:1},{token:'駆逐',count:2}],total:6,conditionManual:false,speedRequired:0,flagship:''};c.hdFERouteBasic=()=>({status:'missing',detail:'canonical example differs',requirements:canonical.requirements});c.hdFEBranchRoute=()=>({available:false});c.hdFERouteFlagshipOk=(_s,info)=>!info?.flagship;c.hdFSPresetInfo=()=>canonical;load('fleet-readiness-evaluator.js','hdFERoute',c);
 const p=plan('BCDDDD');assert.equal(c.hdFERoute(p).status,'ready');assert.deepEqual(Array.from(c.hdFERoute(p).requirements),[]);p.routeInfo={...canonical,requirements:[{token:'軽巡',count:2}]};assert.equal(c.hdFERoute(p).status,'missing');p.routeInfo={...canonical,flagship:'利用者指定の旗艦'};assert.equal(c.hdFERoute(p).status,'missing');
});
