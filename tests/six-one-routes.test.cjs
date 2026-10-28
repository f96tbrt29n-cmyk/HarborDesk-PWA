'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c)}
// Literal destinations were recorded from the ordered registered/linked sources
// before product execution. Non-selected AS0 branches below are rejection guards,
// not tests of their distinct H36 outgoing branch.
const sourceCases=[{"id":"START-as1ss3","node":"START","types":["AS","SS","SS","SS"],"expected":"A"},{"id":"START-as1ss4","node":"START","types":["AS","SS","SS","SS","SS"],"expected":"A"},{"id":"START-as1ss5","node":"START","types":["AS","SS","SS","SS","SS","SS"],"expected":"A"},{"id":"START-as1ss3dd2","node":"START","types":["AS","SS","SS","SS","DD","DD"],"expected":"A"},{"id":"START-as1ss4cl1","node":"START","types":["AS","SS","SS","SS","SS","CL"],"expected":"A"},{"id":"START-as1ss4dd1","node":"START","types":["AS","SS","SS","SS","SS","DD"],"expected":"A"},{"id":"START-mixedssv","node":"START","types":["AS","SS","SSV","SS","SSV","CL"],"expected":"A"},{"id":"START-allssv","node":"START","types":["AS","SSV","SSV","SSV","SSV","CL"],"expected":"A"},{"id":"START-ssvdd2","node":"START","types":["AS","SSV","SSV","SSV","DD","DD"],"expected":"A"},{"id":"START-ss3-only","node":"START","types":["SS","SS","SS"],"expected":"A","note":"AS0 makes A->D, not selectedAFGHK"},{"id":"START-ss6-only","node":"START","types":["SS","SS","SS","SS","SS","SS"],"expected":"A","note":"AS0 makes A->D"},{"id":"START-as1ss3cl2","node":"START","types":["AS","SS","SS","SS","CL","CL"],"expected":"C"},{"id":"START-as1ss3clcv","node":"START","types":["AS","SS","SS","SS","CL","CV"],"expected":"C"},{"id":"START-as1ss3clcav","node":"START","types":["AS","SS","SS","SS","CL","CAV"],"expected":"C"},{"id":"START-as1ss3ddde","node":"START","types":["AS","SS","SS","SS","DD","DE"],"expected":"C"},{"id":"START-as1ss4ct","node":"START","types":["AS","SS","SS","SS","SS","CT"],"expected":"B"},{"id":"START-as1ss4clt","node":"START","types":["AS","SS","SS","SS","SS","CLT"],"expected":"B"},{"id":"START-as2ss3cl","node":"START","types":["AS","AS","SS","SS","SS","CL"],"expected":"C"},{"id":"START-heavy-conflict","node":"START","types":["AS","SS","SS","CV","CA","CL"],"expected":{"article":"B","reference":"C","selectedAFGHK":"not fixed"},"note":"different source first priority threshold, but neither reaches selectedA"},{"id":"A-AS1","node":"A","types":["AS","SS","SS","SS","DD","DD"],"expected":"F"},{"id":"A-AS0","node":"A","types":["SS","SS","SS","SS","SS","SS"],"expected":"D"},{"id":"A-SSV-is-not-AS","node":"A","types":["SSV","SSV","SSV","SSV","SSV","SSV"],"expected":"D"},{"id":"G-ss2","node":"G","types":["AS","SS","SS","CL","DD","DD"],"expected":"I","score":30},{"id":"G-heavy2","node":"G","types":["AS","SS","SS","SS","BB","CV"],"expected":"I","score":30},{"id":"G-as0","node":"G","types":["SS","SS","SS","CL","CLT","CV"],"expected":"H/I random; 15percent I before LOS","score":30},{"id":"G-score11_99","node":"G","types":["AS","SS","SS","SS","DD","DD"],"expected":"I","score":11.99},{"id":"G-score12","node":"G","types":["AS","SS","SS","SS","DD","DD"],"expected":{"article":"overlapping I/random","reference":"H/I random"},"score":12},{"id":"G-score15_99","node":"G","types":["AS","SS","SS","SS","DD","DD"],"expected":"H/I random","score":15.99},{"id":"G-score16","node":"G","types":["AS","SS","SS","SS","DD","DD"],"expected":"H","score":16},{"id":"H-AS1-19.99","node":"H","types":["AS","SS","SS","SS","DD","DD"],"expected":"E","score":19.99},{"id":"H-AS1-20","node":"H","types":["AS","SS","SS","SS","DD","DD"],"expected":"E/K random","score":20},{"id":"H-AS1-24.99","node":"H","types":["AS","SS","SS","SS","DD","DD"],"expected":"E/K random","score":24.99},{"id":"H-AS1-25","node":"H","types":["AS","SS","SS","SS","DD","DD"],"expected":"K","score":25},{"id":"H-AS0-19.99","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"E","score":19.99},{"id":"H-AS0-20","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"E/J/K random","score":20},{"id":"H-AS0-24.99","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"E/J/K random","score":24.99},{"id":"H-AS0-25","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"J/K random","score":25},{"id":"H-AS0-35.99","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"J/K random","score":35.99},{"id":"H-AS0-36","node":"H","types":["SS","SS","SS","CL","CLT","CV"],"expected":"K","score":36},{"id":"FULL-canonical","node":"FULL","types":["AS","SS","SS","SS","SS","CL"],"expected":"AFGHK fixed","score":25},{"id":"FULL-dd2alternative","node":"FULL","types":["AS","SS","SS","SS","DD","DD"],"expected":"AFGHK fixed","score":25},{"id":"FULL-as-ss-only4","node":"FULL","types":["AS","SS","SS","SS"],"expected":"AFGHK fixed","score":25},{"id":"FULL-as-ss-only5","node":"FULL","types":["AS","SS","SS","SS","SS"],"expected":"AFGHK fixed","score":25},{"id":"FULL-as-ss-only6","node":"FULL","types":["AS","SS","SS","SS","SS","SS"],"expected":"AFGHK fixed","score":25},{"id":"FULL-canonical24_99","node":"FULL","types":["AS","SS","SS","SS","SS","CL"],"expected":"not fixed; E/K random, not impossible","score":24.99},{"id":"FULL-knownCV-with-unknown","node":"FULL","types":["AS","SS","SS","SS","CV","?"],"expected":"not selectedAFGHK regardless unknown","score":25},{"id":"FULL-possibleSS-with-unknown","node":"FULL","types":["AS","SS","SS","DD","DD","?"],"expected":"unknown","score":25},{"id":"FULL-missingScouting","node":"FULL","types":["AS","SS","SS","SS","DD","DD"],"expected":"unknown","note":"missing score/HQ is not0 and not satisfied"}];
function sourceContract(){
 // Registered ordered START/A/G/H table and definitions, independent of product
 // output: numbers without "以上" are exact; SS includes SSV but excludes AS.
 const types={SS:['潜水艦','潜水空母'],AS:['潜水母艦'],CL:['軽巡洋艦'],DD:['駆逐艦']};
 const count=(keys,min,max=7)=>({kind:'typeCount',types:keys.flatMap(k=>types[k]),matchPolicy:'exact',min,max});
 const size=n=>({kind:'fleetCount',min:n,max:n});
 const family=(n,ss,extra=[],extraCount=0)=>({all:[size(n),count(['AS'],1,1),count(['SS'],ss,ss),count(['AS','SS',...extra],n,n),...(extraCount?[count(extra,extraCount,extraCount)]:[])]});
 const start={any:[...[3,4,5,6].map(n=>({all:[size(n),count(['SS'],n,n)]})),family(4,3),family(5,4),family(6,5),family(6,3,['DD'],2),family(6,4,['CL','DD'],1)]};
 return {conditions:[
  {kind:'fleetCount',min:4,max:6},
  {...start,reason:'始点→A：潜水母艦1＋潜水3〜5のみの4〜6隻、同1＋潜水3＋駆逐2、同1＋潜水4＋軽巡/駆逐1。潜水のみのAは次でDへ進む別経路。編成不一致は装備購入ではなく艦種・隻数を見直す'},
  {...count(['AS'],1),reason:'A→F：潜水母艦1隻以上でF。潜水艦・潜水空母は潜水母艦へ数えず、潜水母艦なしはD経由の別経路'},
  {...count(['SS'],3),reason:'G→H：潜水艦・潜水空母3隻以上。選択した始点Aの潜水母艦入り固定群は重量艦0・潜水母艦ありで、先行する潜水2以下/重量艦過多/潜水母艦なしの逸れを避ける'},
  {kind:'scoutingValue',min:16,coef:4,reason:'G→H：先行する編成条件を満たした後の33式係数4で16以上。12付近の詳細な逸れ先は出典差を留保し、16未満を到達不可能とはしない'}
 ],scouting:{kind:'required',coef:4,checks:[{label:'選択経路の索敵分岐',safe:25,failBelow:20}],marginNote:'司令部Lv120未満では出典が+1以上の余裕を推奨。閾値と余裕は区別して確認。'}};
}
const TYPES={AS:'潜水母艦',SS:'潜水艦',SSV:'潜水空母',CL:'軽巡洋艦',CLT:'重雷装巡洋艦',CT:'練習巡洋艦',DD:'駆逐艦',DE:'海防艦',CV:'正規空母',CVL:'軽空母',CVB:'装甲空母',BB:'戦艦',CA:'重巡洋艦',CAV:'航空巡洋艦',AO:'補給艦',AV:'水上機母艦',LHA:'揚陸艦','?':'?'};
function context(){
 const c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);
 c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['6-1'][0]",c);c.hdFERouteRequirementData=()=>c.data;
 c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:s.type!=='?',speedInfo:{known:true,rank:5,invalid:[]}}));
 c.hdFEAssigned=()=>[];c.hdFEGameMatch=()=>({status:'ready'});
 c.hdFEScouting=p=>p.score==null?{available:false,status:'manual',score:null,detail:'synthetic numeric/HQ input missing'}:{available:true,status:'ready',score:p.score,coef:p.coef??4};
 for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract'])load('fleet-readiness-evaluator.js',n,c);
 const make=(types,score=25,coef=4)=>({map:'6-1',routeIndex:0,score,coef,ships:types.map((k,i)=>({ship:'source-'+k+'-'+i,type:TYPES[k],items:[]}))});
 const branch=(index,p)=>c.hdFEBranchPredicate(c.data.conditions[index],c.hdFERouteShips(p),p);
 return {c,make,branch};
}
test('6-1 independent START and A literals retain exact families and distinguish SS/SSV from AS',()=>{
 const {c,make,branch}=context(),rows=sourceCases.filter(r=>r.node==='START'||r.node==='A');assert.equal(rows.length,22);
 for(const r of rows){const p=make(r.types),expected=r.node==='START'?(r.expected==='A'?'ready':'missing'):(r.expected==='F'?'ready':'missing');assert.equal(branch(r.node==='START'?1:2,p).status,expected,r.id);}
 assert.equal(c.data.useExampleScope,false);assert.equal(c.data.minimumSpeed,undefined);
});
test('6-1 G fixed-H score boundary does not resolve the disputed12 outgoing branch or conceal known H failure',()=>{
 const {c,make,branch}=context(),rows=sourceCases.filter(r=>r.node==='G');assert.equal(rows.length,7);
 for(const r of rows){const p=make(r.types,r.score);
  if(r.id.startsWith('G-score')){assert.equal(branch(4,p).status,r.score>=16?'ready':'missing',r.id);if(r.score<20)assert.equal(c.hdFERouteContract(p).status,'missing','known H<20 remains despite G12 ambiguity');}
  else assert.equal(c.hdFERouteContract(p).status,'missing',r.id+' outside selected AS/family; exact outgoing branch not inferred');
 }
 assert.match(c.data.notes.join(' '),/ちょうど12.*留保/);
});
test('6-1 full source literals allow4/5/6-ship AS fleets without accepting another route or laundering unknowns',()=>{
 const {c,make}=context(),rows=sourceCases.filter(r=>r.node==='FULL');assert.equal(rows.length,9);
 for(const r of rows){const score=Object.prototype.hasOwnProperty.call(r,'score')?r.score:null,p=make(r.types,score),expected=r.expected==='AFGHK fixed'?'ready':r.expected==='unknown'?'manual':'missing';assert.equal(c.hdFERouteContract(p).status,expected,r.id);}
 for(const badType of ['CV','CVL','CVB','CA','CAV','BB','AO','AV','LHA','CT','CLT','DE'])assert.equal(c.hdFERouteContract(make(['AS','SS','SS','SS',badType,'?'],null)).status,'missing',badType+' known nonfamily survives unknown hull and numeric input');
 for(const types of [['AS','AS','SS','SS','SS','?'],['AS','SS','DD','DD','DD','?'],['AS','SS','SS']])assert.equal(c.hdFERouteContract(make(types,null)).status,'missing','known AS/sub/fleet bound survives missing LOS');
 const p=make(['AS','SSV','SSV','SSV','DD','DD']),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,'ready');assert.equal(JSON.stringify(p),before);
});
test('6-1 H real scouting distinguishes20 random from25 safe, with missing HQ or hull value still null',()=>{
 const {c,make}=context();let hq=120,hullLos=0;c.localStorage={getItem:()=>JSON.stringify({admiralLevel:hq})};c.hdFCProposalShipLos=()=>hullLos;c.hdFEImproveCoef=()=>0;c.hdFEEquipCoef=()=>1;
 load('fleet-readiness-evaluator.js','hdFEScoutingExemption',c);load('fleet-readiness-evaluator.js','hdFEScouting',c);
 const rows=sourceCases.filter(r=>r.node==='H');assert.equal(rows.length,10);
 for(const r of rows){const p=make(r.types,r.score);
  if(r.id.startsWith('H-AS1')){const items=[{meta:{stats:{索敵:(r.score+48)/4}}}],result=c.hdFEScouting(p,items),expected=r.expected==='K'?'ready':r.expected==='E'?'missing':'partial';assert.equal(result.status,expected,r.id);assert.ok(Math.abs(result.score-r.score)<1e-10);assert.equal(result.coef,4);assert.equal(result.notRequired,undefined);}
  else assert.equal(c.hdFEBranchPredicate(c.data.conditions[2],c.hdFERouteShips(p),p).status,'missing',r.id+' AS0 H36 is a different route, not checked with25');
 }
 const p=make(['AS','SS','SS','SS','DD','DD']),items=[{meta:{stats:{索敵:20}}}];hq=0;let result=c.hdFEScouting(p,items);assert.equal(result.reason,'sync');assert.equal(result.available,false);assert.equal(result.score,null);
 hq=120;hullLos=null;result=c.hdFEScouting(p,items);assert.equal(result.reason,'sync');assert.equal(result.score,null);
});
test('6-1 numerical coefficient and bonus evidence remain required without adding speed or equipment counts',()=>{
 const {c,make}=context(),p=make(['AS','SS','SS','SS','DD','DD'],25,3);assert.equal(c.hdFERouteContract(p).status,'manual');
 p.coef=4;c.hdFEGameMatch=()=>({status:'partial'});assert.equal(c.hdFERouteContract(p).status,'manual');
 const numeric=c.data.conditions.filter(x=>x.kind==='scoutingValue');assert.equal(numeric.length,1);assert.equal(numeric[0].min,16);assert.equal(numeric[0].coef,4);
 assert.equal(c.data.conditions.some(x=>['minSpeed','speedCount','equipmentShips'].includes(x.kind)),false);assert.equal(c.data.los.exemptWhen,undefined);
 for(const text of ['AFGHK','CFGHK','潜水母艦','潜水空母','編成','25以上','20以上25未満','16以上','0.35','情報不足','探索未完了'])assert.ok(c.data.notes.join(' ').includes(text)||c.data.conditions.some(x=>x.reason?.includes(text)),text);
});
test('6-1 audit expectation retains independently sourced exact families and H20/25 instead of copying an example',()=>{
 const {c}=context(),audit=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8')),rows=audit.rows.filter(r=>r.id==='6-1/0/default');assert.equal(audit.rows.length,59);assert.equal(rows.length,1);
 const row=rows[0],expected=sourceContract();assert.equal(row.path,'AFGHK');assert.deepEqual(row.conditions,expected.conditions);assert.deepEqual(row.scouting,expected.scouting);assert.deepEqual(JSON.parse(JSON.stringify(c.data.conditions)),expected.conditions);assert.deepEqual(JSON.parse(JSON.stringify(c.data.los)),expected.scouting);
 assert.match(row.guidanceAudit['索敵'].detail,/G16.*H25.*20/);assert.match(row.guidanceAudit['推奨セット'].detail,/経路必須数ではない/);assert.equal(row.verification,'partial');
});
