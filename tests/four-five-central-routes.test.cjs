'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
const T={B:'戦艦',b:'高速戦艦',H:'航空戦艦',V:'正規空母',X:'装甲空母',v:'軽空母',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',O:'補給艦',U:'揚陸艦',r:'工作艦','?':'?'};
function context(){const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-5'][1]",c);c.hdFERouteRequirementData=p=>vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['4-5']["+(p?.routeIndex??1)+"]",c);c.hdFERouteShips=p=>p.ships.map(s=>({type:s.type,typeKnown:s.type!=='?',ship:s,speedInfo:{rank:s.rank,known:s.rank!=null,invalid:s.invalid?['invalid speed fitting']:[],expansionUnconfirmed:!!s.expansionUnknown}}));c.hdFEGameMatch=()=>({status:'ready'});c.hdFEAssigned=()=>[];c.hdFEScouting=p=>({available:p.los!==null,status:p.los===null?'manual':'ready',score:p.los,coef:2});for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract','hdFESpeedTarget','hdFEBranchGoal','hdFEPlanSpeedTarget'])load('fleet-readiness-evaluator.js',n,c);return c;}
function plan(fleet,rank=10){return {map:'4-5',routeIndex:1,los:71,ships:[...fleet].map((x,i)=>({ship:'independent-source-'+i,type:T[x],items:[],rank:Array.isArray(rank)?rank[i]:rank}))};}
// Literal expectations were transcribed from the ordered H/K source tables,
// before running these predicates. D→H has neither F-entry nor E-entry history.
test('4-5 central admits the selected D-H-K route, including noncanonical six-hull alternatives',()=>{
 const c=context();for(const fleet of ['BBCCVv','BVCCLP','BVCCLO','VvTDDD','VvRDDD','VVLDDP','CCLLDD','BVVCDD','CCCLDD','VVCCrL']){const p=plan(fleet),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,'ready',fleet);assert.equal(JSON.stringify(p),before);}
 assert.equal(c.data.useExampleScope,false);assert.equal(c.data.path,'ADHKT / CDHKT');
});
test('H shortcuts to T do not count as fulfilling the selected K path',()=>{
 const c=context();for(const rank of [15,20])assert.equal(c.hdFERouteContract(plan('BBCCVv',rank)).status,'missing','uniform speed '+rank);
 for(const fleet of ['VvLDDD','VvLEEE'])for(const rank of [10,null])assert.equal(c.hdFERouteContract(plan(fleet,rank)).status,'missing',fleet+' independent light shortcut '+rank);
 assert.equal(c.hdFERouteContract(plan('VVLDDP')).status,'ready','CL1+escort2 shortcut belongs to F entry, not D entry');
});
test('the H fastplus component retains its own heavy cap rather than borrowing the later K cap',()=>{
 const c=context(),h=c.data.conditions.find(x=>x.not?.all?.some(y=>y.kind==='minSpeed'));
 assert.ok(h,'independently displayed H fastplus check');
 for(const rank of [15,null]){const p=plan('BBVvvD',rank),check=c.hdFEBranchPredicate(h,c.hdFERouteShips(p),p);assert.equal(check.status,'ready','five heavy hulls exclude the H shortcut, speed '+rank);assert.equal(c.hdFERouteContract(p).status,'missing','K heavy cap still fails');}
 const p=plan('BBCCVv',15);assert.equal(c.hdFEBranchPredicate(h,c.hdFERouteShips(p),p).status,'missing','four heavy hulls at valid fastplus take H-T');p.ships.forEach(s=>s.rank=null);assert.equal(c.hdFEBranchPredicate(h,c.hdFERouteShips(p),p).status,'manual','four heavy hulls with unknown speed do not decide the H shortcut');
});
test('confirmed non-fastplus speed and unresolved speed remain distinct',()=>{
 const c=context();for(const ranks of [[5,10,10,10,10,10],[15,15,15,15,15,10],[10,15,15,15,15,null]])assert.equal(c.hdFERouteContract(plan('BBCCVv',ranks)).status,'ready',JSON.stringify(ranks));
 assert.equal(c.hdFERouteContract(plan('BBCCVv',[15,15,15,15,15,null])).status,'manual');
 const invalid=plan('BBCCVv',[15,15,15,15,15,10]);invalid.ships[5].invalid=true;assert.equal(c.hdFERouteContract(invalid).status,'manual','invalid low speed is not proof against the shortcut');
 invalid.ships[0].rank=10;assert.equal(c.hdFERouteContract(invalid).status,'ready','another valid low speed is decisive');
 invalid.ships[0].expansionUnknown=true;assert.equal(c.hdFERouteContract(invalid).status,'manual','unconfirmed expansion speed cannot prove a low rank');
});
test('K submarine randomness is prior to LOS and excludes SS/SSV without confusing AS',()=>{
 const c=context();for(const fleet of ['BVCCLS','BVCCLs','BVCLS?'])for(const los of [71,100,null]){const p=plan(fleet);p.los=los;assert.equal(c.hdFERouteContract(p).status,'missing',fleet+' LOS '+los);}
 assert.equal(c.hdFERouteContract(plan('BVCCLP')).status,'ready','潜水母艦 is not 潜水艦/潜水空母');
 const p=plan('BVCCLS',[15,15,15,15,15,null]);assert.equal(c.hdFERouteContract(p).status,'missing','known SS result survives unknown H speed');
});
test('K heavy caps and six-hull scope survive other unknown information',()=>{
 const c=context();for(const fleet of ['BBVVDD','BBVvvD','BBVVvD','BBBBCL','BBCCV','BBCCVvD'])assert.equal(c.hdFERouteContract(plan(fleet)).status,'missing',fleet);
 assert.equal(c.hdFERouteContract(plan('BBVvvD',15)).status,'missing','five heavy hulls miss K even though H fastplus shortcut cap fails');
 assert.equal(c.hdFERouteContract(plan('BBBBCL',null)).status,'missing','known cap failure survives unknown speed');
 assert.equal(c.hdFERouteContract(plan('BVCCL?')).status,'manual','unknown hull remains unresolved');
});
test('central retains the registered LOS71 margin rather than changing the documented game threshold',()=>{
 const c=context();assert.equal(c.data.los.coef,2);assert.equal(c.data.los.checks[0].safe,71);for(const [los,status]of [[71,'ready'],[70.999,'missing'],[70,'missing'],[null,'manual']]){const p=plan('BBCCVv');p.los=los;assert.equal(c.hdFERouteContract(p).status,status,String(los));}
 // Below 71 means below this registered safety target, not proof of impossibility.
 assert.ok(c.data.notes.some(n=>n.includes('70')&&n.includes('71')));
});
test('a negative fastplus condition does not create a positive automatic speed target',()=>{
 const c=context();for(const rank of [5,10,15,20,null])assert.equal(c.hdFEPlanSpeedTarget(plan('BBCCVv',rank)),0,'central speed '+rank);
 const user=plan('BBCCVv');user.routeInfo={text:'利用者指定の高速+統一'};assert.equal(c.hdFEPlanSpeedTarget(user),15,'explicit user target remains');
 const fast=plan('BVvCAA',15);fast.routeIndex=0;assert.equal(c.hdFEPlanSpeedTarget(fast),15,'existing shortest index0 stays fastplus');
 for(const index of [0,2]){const p=plan(index===0?'VVvAAS':'VLDDDS',index===0?15:10);p.routeIndex=index;assert.equal(c.hdFERouteContract(p).status,'ready','K-only SS condition stays out of index '+index);assert.equal(c.hdFERouteRequirementData(p).los.kind,'none');}
});
test('verified alternatives bypass only the canonical example, preserving explicit fleet and flagship constraints',()=>{
 const c=context(),canonical={requirements:[{token:'戦艦級',count:2},{token:'重巡',count:2},{token:'正規空母',count:1},{token:'軽空母',count:1}],total:6,conditionManual:false,speedRequired:0,flagship:''};
 c.hdFERouteBasic=()=>({status:'missing',detail:'canonical example differs',requirements:canonical.requirements});c.hdFEBranchRoute=()=>({available:false});c.hdFERouteFlagshipOk=(_s,info)=>!info?.flagship;c.hdFSPresetInfo=()=>canonical;load('fleet-readiness-evaluator.js','hdFERoute',c);
 const p=plan('VVLDDP');assert.equal(c.hdFERoute(p).status,'ready');assert.deepEqual(Array.from(c.hdFERoute(p).requirements),[]);p.routeInfo={...canonical,requirements:[{token:'戦艦級',count:3}]};assert.equal(c.hdFERoute(p).status,'missing');p.routeInfo={...canonical,flagship:'利用者指定の旗艦'};assert.equal(c.hdFERoute(p).status,'missing');
});
