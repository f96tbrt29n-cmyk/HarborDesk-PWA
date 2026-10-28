'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);}
const TYPES={B:'戦艦',b:'高速戦艦',H:'航空戦艦',V:'正規空母',X:'装甲空母',v:'軽空母',C:'重巡洋艦',A:'航空巡洋艦',L:'軽巡洋艦',T:'重雷装巡洋艦',R:'練習巡洋艦',D:'駆逐艦',E:'海防艦',S:'潜水艦',s:'潜水空母',P:'潜水母艦',O:'補給艦',W:'水上機母艦',U:'揚陸艦',r:'工作艦',Q:'正規空母',Z:'正規空母',Y:'軽巡洋艦',N:'軽空母','?':'?'};
const NAMES={Q:'翔鶴',Z:'瑞鶴',Y:'夕張',N:'祥鳳'};
function context(){
 const known=new Map(),c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>null});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);
 c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-2'][0]",c);c.hdFERouteRequirementData=()=>c.data;
 c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:s.type!=='?',speedInfo:{rank:s.rank,known:s.rank!=null,invalid:s.invalid?['invalid fitting']:[],expansionUnconfirmed:!!s.expansionUnknown}}));
 c.hdFEFindShip=name=>known.has(name)?{name,type:known.get(name).type}:null;
 c.hdShipDbMasterRowFor=input=>known.get(typeof input==='string'?input:input.name)||null;
 c.hdFEAssigned=()=>[];
 // These isolated boundary fixtures supply a score, not a scouting calculator
 // or equipment-search result. Separate actual-function evidence tests sync.
 c.hdFEGameMatch=()=>({status:'ready'});
 c.hdFEScouting=p=>p.score==null?{available:false,status:'manual',detail:'synthetic input missing'}:{available:true,status:'ready',score:p.score,coef:p.coef??2};
 for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract'])load('fleet-readiness-evaluator.js',n,c);
 function make(fleet,rank=10,score=70){
  const ships=[...fleet].map((k,i)=>{const name=NAMES[k]||'source-'+k+'-'+i,row={ship:name,type:TYPES[k],items:[],rank:Array.isArray(rank)?rank[i]:rank};if(k!=='?')known.set(name,{name,type:TYPES[k],id:100+i});return row;});
  return {map:'5-2',routeIndex:0,ships,score};
 }
 return {c,make,branch:(reason,p)=>{const condition=c.data.conditions.find(x=>x.reason?.startsWith(reason));assert.ok(condition,reason);return c.hdFEBranchPredicate(condition,c.hdFERouteShips(p),p);}};
}

// Expected destinations below were written from the source's ordered table,
// independently of product output. C denotes CA and A denotes CAV; Q and Z
// are one actual named family each, not two arbitrary carrier slots.
test('5-2 start excludes SS and SSV, not AS, and known exclusions survive an unknown hull',()=>{
 const {c,make}=context();
 for(const fleet of ['BBVVAs','BBVVAS','SSrrrr','BBVVs?'])assert.equal(c.hdFERouteContract(make(fleet)).status,'missing',fleet);
 for(const fleet of ['BBVVPW','BBVVCC','BBXVAC','HHvvCA','BBVVAD'])assert.equal(c.hdFERouteContract(make(fleet,5)).status,'ready',fleet+' low speed is allowed');
 assert.equal(c.hdFERouteContract(make('BBVVC?',10)).status,'manual');
});
test('5-2 independent S boundaries retain ordered random A candidates without inventing total probabilities',()=>{
 const {make,branch}=context();
 for(const fleet of ['BBBVVD','BBVVVD','BBBBWD','BBBBVV']){
  const p=make(fleet);const checks=['S→B：戦艦級＋空母系','S→B：正規空母','S→B：戦艦級は'].map(r=>branch(r,p).status);
  assert.ok(checks.includes('missing'),fleet);
 }
 assert.equal(branch('S→B：潜水',make('BBVVPW')).status,'ready');
 assert.equal(branch('S→B：潜水',make('BBVVs?')).status,'missing');
});
test('5-2 named pair C priority is before BB, requires one of each, and DD1 E precedes speed',()=>{
 const {make,branch}=context();
 const cases=[['QZBDDL',10,'missing'],['QZBDDL',5,'ready'],['QZBCAD',10,'ready'],['QZBCAD',null,'ready'],['QZCCDD',5,'missing'],['QQBDDL',10,'ready'],['ZZBDDL',10,'ready']];
 for(const [fleet,speed,status]of cases)assert.equal(branch('C→E',make(fleet,speed)).status,status,fleet+' '+speed);
 assert.equal(branch('C→E',make('QZBDDL',null)).status,'manual','pair speed determines E or D');
});
test('5-2 CA versus CA-family disagreement stays source-wait only when it changes C',()=>{
 const {make,branch}=context();
 for(const fleet of ['QZCADD','QZAADD'])assert.equal(branch('C→E',make(fleet,5)).status,'manual',fleet+' low source ambiguity');
 for(const fleet of ['QZCADD','QZAADD'])assert.equal(branch('C→E',make(fleet,10)).status,'missing',fleet+' high speed independently D');
 assert.equal(branch('C→E',make('vADDLL',10)).status,'manual','CVL1 CAV1 DD2: lower fast row CA or CA-family differs');
 assert.equal(branch('C→E',make('vCDDLL',10)).status,'missing','ordinary CA1 fast row agrees');
 assert.equal(branch('C→E',make('vADDLL',5)).status,'ready','known slow removes both fast interpretations');
});
test('5-2 ordinary C rows preserve BB and CLT, carrier zero, CA2, CVn and CVL priority',()=>{
 const {make,branch}=context();
 const cases=[
  ['BVCADD',10,'ready'],['TVCLDD',10,'ready'],
  ['VVCCDD',10,'missing'],['VVCADD',10,'missing'],
  ['VVCCDE',10,'ready'],['CCDDLL',10,'ready'],
  ['vvCDDO',10,'missing'],['vvCDDO',5,'ready'],
  ['vvDDLL',10,'missing'],['vvDDLL',5,'ready'],
  ['vvvCDD',10,'ready'],['VCDDLL',10,'ready']
 ];
 for(const [fleet,rank,status]of cases)assert.equal(branch('C→E',make(fleet,rank)).status,status,fleet+' '+rank);
});
test('5-2 late named C sums are exact five and do not substitute CLT or AS',()=>{
 const {make,branch}=context();
 for(const fleet of ['YvvCCC','NCCCLD','NCCCRD'])assert.equal(branch('C→E',make(fleet)).status,'missing',fleet+' exact five named alternate goes D');
 for(const fleet of ['NCCCTD','NCCCPD','YvvCCP','NCCCLP'])assert.equal(branch('C→E',make(fleet,5)).status,'ready',fleet+' earlier CLT E or sum not five');
});
test('5-2 LHA carrier scope is unconfirmed only if its interpretations change the selected route',()=>{
 const {c,make,branch}=context();
 assert.equal(branch('C→E',make('vADDLU',10)).status,'manual');
 assert.equal(c.hdFERouteContract(make('BBVVAU')).status,'manual','LHA as third carrier may change S and F');
 assert.equal(c.hdFERouteContract(make('BDDDDU',5)).status,'ready','BB independently C-E, any LHA reading remains below S/F caps');
 assert.equal(c.hdFERouteContract(make('BBVVsU')).status,'missing','known SSV mismatch is not hidden by LHA source scope');
});
test('5-2 F numeric boundary remains coefficient2 and70; missing input is not zero or satisfied',()=>{
 const {c,make}=context();assert.equal(c.data.los.coef,2);assert.equal(c.data.los.checks[0].safe,70);assert.equal(c.data.los.checks[0].failBelow,63);
 for(const score of [62.99,63,69.99])assert.equal(c.hdFERouteContract(make('BBVVCC',5,score)).status,'missing','F cannot fix O at '+score);
 assert.equal(c.hdFERouteContract(make('BBVVCC',5,70)).status,'ready');
 assert.equal(c.hdFERouteContract(make('BBVVCC',5,null)).status,'manual');
 const mismatch=make('BBVVCC');mismatch.coef=1;assert.equal(c.hdFERouteContract(mismatch).status,'manual');
 for(const [fleet,score]of [['BBBVVD',70],['BBvvvC',70],['BBVVs?',null]])assert.equal(c.hdFERouteContract(make(fleet,10,score)).status,'missing',fleet+' known mismatch survives missing numeric input');
});
test('5-2 F source boundaries distinguish certain H, random H and the safe O scouting range',()=>{
 // Registered source F table: coefficient2, <63 H, [63,70) random H,
 // then (or after avoiding H) CV<=2 and BB<=2 O. Synthetic arithmetic
 // reaches these literal score boundaries; it is not real-game input proof.
 const {c,make}=context();let hq=120,shipLos=0;
 c.localStorage={getItem:()=>JSON.stringify({admiralLevel:hq})};
 c.hdFCProposalShipLos=()=>shipLos;c.hdFEImproveCoef=()=>0;c.hdFEEquipCoef=()=>1;
 load('fleet-readiness-evaluator.js','hdFEScoutingExemption',c);
 load('fleet-readiness-evaluator.js','hdFEScouting',c);
 for(const [score,status]of [[62.99,'missing'],[63,'partial'],[69.99,'partial'],[70,'ready']]){
  const items=[{meta:{stats:{索敵:(score+48)/2}}}];
  for(const speed of [5,10,null]){
   const result=c.hdFEScouting(make('BBVVCC',speed),items);
   assert.equal(result.available,true);assert.equal(result.status,status,String(score)+' speed '+speed);
   assert.equal(result.checks[0].status,status);assert.ok(Math.abs(result.score-score)<1e-10);
   assert.equal(result.notRequired,undefined,'5-2 has no fast-fleet scouting exemption');
  }
 }
 const items=[{meta:{stats:{索敵:59}}}];
 hq=100;assert.equal(c.hdFEScouting(make('BBVVCC'),items).score,78,'HQ subtraction is applied by the formula, not by changing 63/70 thresholds');
 hq=0;let result=c.hdFEScouting(make('BBVVCC'),items);assert.equal(result.available,false);assert.equal(result.reason,'sync');assert.equal(result.score,null);
 hq=120;shipLos=null;result=c.hdFEScouting(make('BBVVCC'),items);assert.equal(result.available,false);assert.equal(result.reason,'sync');assert.equal(result.score,null);
});
test('5-2 audit scouting expectation records the independently sourced F boundaries',()=>{
 const {c}=context(),audit=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8'));
 const rows=audit.rows.filter(x=>x.id==='5-2/0/default');assert.equal(rows.length,1);
 // These constants come from the registered ordered F table, not a copy of
 // product output. The reference's overlapping 63 wording and prose71/
 // coefficient0.35 value76 do not replace this coefficient2 table contract.
 const expected={kind:'required',coef:2,checks:[{label:'選択経路の索敵分岐',safe:70,failBelow:63}],marginNote:'司令部Lv120未満では出典が+1以上の余裕を推奨。閾値と余裕は区別して確認。'};
 assert.deepEqual(rows[0].scouting,expected);
 assert.deepEqual(JSON.parse(JSON.stringify(c.data.los)),expected);
 assert.equal(c.data.path,'BCEFO');assert.equal(c.data.minimumSpeed,undefined);assert.equal(c.data.los.exemptWhen,undefined);
});
test('5-2 route example is not a CAV requirement or global speed/equipment count mandate',()=>{
 const {c,make}=context();const p=make('BBVVCC',null),before=JSON.stringify(p);assert.equal(c.hdFERouteContract(p).status,'ready');assert.equal(JSON.stringify(p),before);
 assert.equal(c.data.useExampleScope,false);assert.equal(c.data.minimumSpeed,undefined);assert.equal(c.data.path,'BCEFO');
 assert.equal(JSON.stringify(c.data.conditions).includes('equipmentShips'),false);
 for(const text of ['編成を見直す','BCDFO','未確認','70以上','63未満','最適','戦闘推奨','E→F'])assert.ok(c.data.notes.join(' / ').includes(text)||c.data.conditions.some(x=>x.reason?.includes(text)),text);
 assert.equal(c.hdFERouteContract(make('BBVVC')).status,'missing');assert.equal(c.hdFERouteContract(make('BBVVCCD')).status,'missing');
});
test('5-2 opt-in identity requires the actual master name, validates remodel families, and preserves legacy named matching',()=>{
 const c=vm.createContext({window:{addEventListener(){}},document:{addEventListener(){},getElementById(){return null}},localStorage:{getItem(){return null}},setTimeout(){return 0}});
 for(const f of ['ship-master-snapshot.js','ship-database.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
 const fe=fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8');vm.runInContext(fe.slice(0,fe.indexOf('function hdFEInstall(')),c);
 const normal={kind:'namedCount',names:['翔鶴'],min:1,max:7},strict={...normal,matchPolicy:'masterName'},master=c.hdShipDbMasterRowFor('翔鶴');assert.ok(master);
 const row=(name,masterId)=>({ship:{ship:name,masterId,items:[]},type:'正規空母',typeKnown:true,speedInfo:{rank:10,known:true,invalid:[]}});
 const malformed=[row('赤城改',master.id)];
 assert.equal(c.hdFEBranchPredicate(normal,malformed).status,'ready','legacy default remains unchanged');
 assert.equal(c.hdFEBranchPredicate(strict,malformed).status,'manual','5-2 cannot borrow another ship identity');
 for(const matchPolicy of ['unsupported','',null,false,0])assert.equal(c.hdFEBranchPredicate({...strict,matchPolicy},[row('翔鶴',master.id)]).status,'manual');
 assert.equal(c.hdFEBranchPredicate(strict,[row('翔鶴ふうの未登録艦',master.id)]).status,'manual','a family-prefix fallback is not a real master-name match');
 for(const [family,names]of [['翔鶴',['翔鶴','翔鶴改','翔鶴改二','翔鶴改二甲']],['瑞鶴',['瑞鶴','瑞鶴改','瑞鶴改二','瑞鶴改二甲']],['夕張',['夕張','夕張改','夕張改二','夕張改二特','夕張改二丁']],['祥鳳',['祥鳳','祥鳳改']]]){
  const lineage=new Set();let member=c.hdShipDbMasterRowFor(family);while(member&&!lineage.has(member.id)){lineage.add(member.id);member=c.window.HD_KANCOLLE_MASTER_SNAPSHOT.allShips[String(member.afterId)];}
  for(const name of names){const db=c.hdFEFindShip(name),m=db&&c.hdShipDbMasterRowFor({name});assert.ok(m,name+' exact master');assert.equal(m.name,name);assert.ok(lineage.has(m.id),name+' actual master afterId lineage');assert.equal(c.hdFEBranchPredicate({...strict,names:[family]},[row(name,m.id)]).status,'ready',name);}
 }
 const {c:synthetic,make}=context(),p=make('BBVVs?');assert.equal(synthetic.hdFERouteContract(p).status,'missing','identity uncertainty never hides known SS mismatch');
});
