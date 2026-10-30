'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),{prepared43,additionalCases}=require('./fixtures/seven-three-first-source-cases.cjs');
const TYPES={CA:'重巡洋艦',CAV:'航空巡洋艦',CL:'軽巡洋艦',CLT:'重雷装巡洋艦',CT:'練習巡洋艦',DD:'駆逐艦',DE:'海防艦',CD:'海防戦艦',BB:'戦艦',FBB:'高速戦艦',BBV:'航空戦艦',CV:'正規空母',CVB:'装甲空母',CVL:'軽空母',AV:'水上機母艦',AO:'補給艦',AS:'潜水母艦',SS:'潜水艦',SSV:'潜水空母',LHA:'揚陸艦',AR:'工作艦',UNKNOWN:'?'};
const NAMES={Haguro:'羽黒改二',Kamikaze:'神風改',Ashigara:'足柄改二',Myoko:'妙高改二'};
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);}
function context(){
 const masters=new Map(),c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>({}),hdFEFindShip:name=>masters.get(name)||null,hdShipDbMasterRowFor:x=>masters.get(x.name)||null,hdShipDbSlotProfile:()=>null,hdFEExpansionAvailability:()=>({allowed:false,status:'manual'})});
 vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);const all=vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS',c),maps=vm.runInContext('MAP_PLANS',c);
 c.hdFERouteRequirementData=p=>all[p.map]?.[p.routeIndex??0];
 c.hdFERouteShips=p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:!['?','海防戦艦'].includes(s.type),speedInfo:{known:p.rank!==null,rank:p.rank,base:p.rank,group:'independent-source',invalid:[]}}));
 c.hdFEAssigned=()=>[];c.hdFEGameMatch=()=>({status:'ready'});c.hdFEScouting=()=>({available:false,status:'manual',score:null,detail:'no numeric source condition'});
 for(const n of ['hdFESpeedLabel','hdFEBranchPredicate','hdFERouteContract'])load('fleet-readiness-evaluator.js',n,c);
 const source=fs.readFileSync(path.join(root,'fleet-suggester.js'),'utf8'),a=source.indexOf('const HD_FS_TYPE_ALIASES='),b=source.indexOf('\n};',a)+3;vm.runInContext(source.slice(a,b),c);
 for(const n of ['hdFSTypeMatches','hdFSRequirementPatterns','hdFSPresetInfo'])load('fleet-suggester.js',n,c);
 c.hdFEInferRoute=()=>({status:'manual'});c.hdFEBranchRoute=()=>({available:false});
 for(const n of ['hdFESpeedTarget','hdFEBranchGoal','hdFEPlanSpeedTarget','hdFERouteFlagshipOk','hdFERouteBasic','hdFERoute'])load('fleet-readiness-evaluator.js',n,c);
 const make=(hulls,rank=5)=>{
  const ships=hulls.map((input,index)=>{const [named,kind]=input.includes(':')?input.split(':'):[null,input],ship=named?NAMES[named]:'source-'+input+'-'+index,type=TYPES[kind];if(!['?','海防戦艦'].includes(type))masters.set(ship,{name:ship,type});return {ship,type,items:[]}}),preset=maps['7-3'].presets[0];
  return {map:'7-3',routeIndex:0,preset,routeInfo:JSON.parse(JSON.stringify(c.hdFSPresetInfo(preset))),rank,ships};
 };
 return {c,all,maps,masters,make};
}
test('7-3 first ACE keeps the prepared independent literals and applies only their P-not-opened scope',()=>{
 assert.equal(prepared43.length,43);assert.equal(additionalCases.length,8);const {c,make}=context(),rows=prepared43.filter(x=>x.gauge===1);assert.equal(rows.length,42);
 for(const row of rows){const p=make(row.hulls,row.speedRank),before=JSON.stringify(p),expected=row.selectedACE==='source-ready/runtime-model-unknown'?'manual':row.selectedACE;assert.equal(c.hdFERouteContract(p).status,expected,row.id);assert.equal(c.hdFERoute(p).status,expected,row.id+' selected route');assert.equal(JSON.stringify(p),before,row.id+' input unchanged');}
 const second=prepared43.find(x=>x.gauge===2);assert.equal(second.id,'second-fastest-same-input');assert.equal(second.C,'I','source-only stage control; do not pretend the index0 product infers game unlock state');
});
test('7-3 historical-pair priorities stay source-specific and known C-D failures survive an unknown hull',()=>{
 const {c,make}=context();for(const row of additionalCases)assert.equal(c.hdFERouteContract(make(row.hulls,row.speedRank)).status,row.selectedACE,row.id);
 for(const row of additionalCases.filter(x=>x.selectedACE==='manual')){const r=c.hdFERouteContract(make(row.hulls,row.speedRank));assert.match(r.detail,/出典別候補|出典.*一致しない/);}
});
test('7-3 canonical example does not become a mandatory four-hull or speed-equipment purchase constraint',()=>{
 const {c,all,maps,make}=context(),d=all['7-3'][0];assert.equal(d.useExampleScope,false);assert.equal(d.los.kind,'none');assert.equal(d.minimumSpeed,undefined);assert.equal(d.equipmentTargets,undefined);assert.equal(d.airNotRequired,true);assert.deepEqual(JSON.parse(JSON.stringify(d.equipmentKinds)),['夜戦']);
 assert.equal(maps['7-3'].presets[0].name,'第1ゲージ 1');assert.equal(maps['7-3'].presets[0].ships,'羽黒1＋駆逐3');
 for(const rank of [null,5,10,15,20])assert.equal(c.hdFERoute(make(['Haguro:CA','DD','DE','DE'],rank)).status,'ready');
 for(const phrase of ['P開放前','戦闘上の推奨','購入必須','手持ちでは不可能','旧出撃目標','海防戦艦'])assert.ok(d.notes.join(' ').includes(phrase),phrase);
});
test('7-3 general ACE retains explicit requirements, manual states, flagship and both selected speed inputs',()=>{
 const {c,make}=context();
 for(const field of ['requirements','conditionManual','flagship']){
  const p=make(['Haguro:CA','DD','DD','DD']),info=JSON.parse(JSON.stringify(p.routeInfo));if(field==='requirements')info.requirements.push({token:'空母',count:1});if(field==='conditionManual')info.conditionManual=true;if(field==='flagship')info.flagship='駆逐';p.suggestion={info};const r=c.hdFERoute(p);assert.equal(r.status,field==='flagship'?'missing':'manual',field);
  const expected=[{token:'羽黒',need:1,got:1,ok:true},{token:'駆逐',need:3,got:3,ok:true},...(field==='requirements'?[{token:'空母',need:1,got:0,ok:false}]:[])];assert.deepEqual(JSON.parse(JSON.stringify(r.requirements)),expected,'every chosen requirement and its count remains present');assert.match(r.detail,/ACE/,'original route detail remains');
  if(field==='requirements')assert.match(r.detail,/空母 0\/1/);if(field==='conditionManual')assert.match(r.detail,/艦種・隻数の条件を手動確認/);if(field==='flagship')assert.match(r.detail,/旗艦条件未充足/);
 }
 const custom=make(['Haguro:CA','DD','DD','DD']);custom.routeInfo.requirements.push({token:'空母',count:1});assert.equal(c.hdFERoute(custom).status,'missing');
 const manual=make(['CA','DD','DD']);manual.routeInfo.requirements=[];manual.routeInfo.conditionManual=true;assert.equal(c.hdFERoute(manual).status,'manual');
 for(const location of ['routeInfo','suggestion'])for(const rank of [10,15,20]){
  const p=make(['Haguro:CA','DD','DD','DD'],5),info={...JSON.parse(JSON.stringify(p.routeInfo)),text:rank===20?'最速統一':rank===15?'高速+統一':'高速統一',speedRequired:true};if(location==='routeInfo')p.routeInfo=info;else p.suggestion={info};assert.equal(c.hdFEPlanSpeedTarget(p),rank,location+'/'+rank);assert.equal(c.hdFERoute(p).status,'missing');p.rank=null;assert.equal(c.hdFERoute(p).status,'manual');
 }
 const bad=make(['Haguro:CA','Kamikaze:DD','BB','UNKNOWN'],null);bad.suggestion={info:{...JSON.parse(JSON.stringify(bad.routeInfo)),conditionManual:true}};assert.equal(c.hdFERoute(bad).status,'missing');
});
test('7-3 source disagreement is not a random route or an equipment stock shortage',()=>{
 const {c,make}=context();for(const row of [...prepared43,...additionalCases].filter(x=>x.gauge===1&&x.selectedACE==='manual')){const r=c.hdFERouteContract(make(row.hulls,row.speedRank));assert.equal(r.status,'manual',row.id);assert.equal(r.checks.some(x=>x.condition.kind==='equipmentShips'),false);assert.equal(r.data.los.kind,'none');}
});
// The seven-five-first and seven-five-second suites independently cover changed7-5/0 and7-5/1;
// only those changed scopes are excluded here; every remaining complete output stays compared.
test('7-3 first opt-in preserves complete route outputs and speed targets of all other 49 unaffected presets',()=>{
 const {c,maps}=context(),legacy=require('./fixtures/seven-three-first-legacy-route-speed.cjs');vm.runInContext(legacy.routeSource.replace('function hdFERoute(','function hdFERouteLegacy('),c);vm.runInContext(legacy.speedSource.replace('function hdFEPlanSpeedTarget(','function hdFEPlanSpeedTargetLegacy('),c);let presets=0,comparisons=0;
 for(const [map,data]of Object.entries(maps))for(const [index,preset]of data.presets.entries()){
  if((map==='7-3'||map==='7-4'||map==='7-5')&&index===0||map==='7-5'&&index===1)continue;presets++;
  for(const mode of ['canonical','chosen-manual','explicit-speed','unknown']){
   const p={map,routeIndex:index,preset,routeInfo:JSON.parse(JSON.stringify(c.hdFSPresetInfo(preset))),rank:mode==='unknown'?null:10,score:100,ships:['CL','DD','DD','DD','DD','DD'].map((k,i)=>({ship:'legacy-'+i,type:TYPES[k],items:[]}))};if(mode==='chosen-manual')p.suggestion={info:{...JSON.parse(JSON.stringify(p.routeInfo)),conditionManual:true}};if(mode==='explicit-speed')p.routeInfo={...p.routeInfo,text:'利用者指定 高速+統一',speedRequired:true};
   assert.deepEqual(JSON.parse(JSON.stringify(c.hdFERoute(p))),JSON.parse(JSON.stringify(c.hdFERouteLegacy(p))),map+'/'+index+'/'+mode);assert.equal(c.hdFEPlanSpeedTarget(p),c.hdFEPlanSpeedTargetLegacy(p),map+'/'+index+'/'+mode);comparisons++;
  }
 }
 assert.equal(presets,49);assert.equal(comparisons,196);
 assert.ok(fs.readFileSync(path.join(root,'map-plans.js'),'utf8').includes(legacy.secondGaugeDeclaration),'second-gauge G uncertainty declaration remains byte-identical');
});
test('7-3 first audit and validation snapshots satisfy independent P-not-opened ACE literals without upgrading scope',()=>{
 const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8')),scope=JSON.parse(fs.readFileSync(path.join(root,'docs/route-requirement-validation-scope.json'),'utf8'));
 assert.equal(audit.rows.length,59);assert.equal(scope.examples.length,53);const rows=audit.rows.filter(x=>x.id==='7-3/0/default'),examples=scope.examples.filter(x=>x.map==='7-3'&&x.index===0);assert.equal(rows.length,1);assert.equal(examples.length,1);const row=rows[0],example=examples[0];
 assert.equal(row.verification,'partial');assert.equal(row.path,'ACE');assert.equal(example.path,'ACE');assert.equal(example.engine,'contract');assert.equal(example.special.graph,null);assert.equal(example.verification.perExampleAllRequirementsPositiveNegative,false);assert.equal(example.verification.representativeAllRequirementsStages,false);assert.equal(example.verification.physicalIPhone,false);
 for(const snapshot of [row,example]){assert.equal(snapshot.scouting.kind,'none');assert.match(snapshot.notes?.join(' ')||snapshot.special.notes.join(' '),/P開放前/);}
 assert.equal(example.speed.minimum,null);assert.equal(example.speed.conditional,null);assert.equal(example.speed.fallback,null);assert.deepEqual(example.mandatoryEquipmentShips,[]);assert.deepEqual(example.strategyEquipmentTargets,[]);assert.deepEqual(row.equipmentKinds,['夜戦']);assert.match(row.guidanceAudit['速力'].detail,/一律必須指定なし/);assert.match(row.guidanceAudit['推奨セット'].limit,/戦闘推奨.*経路必須/);assert.match(row.guidanceAudit['推奨セット'].limit,/十分.*根拠|必要十分|購入数量|購入必須/);
 const literals=[...prepared43.filter(x=>x.gauge===1),...additionalCases];assert.equal(literals.length,50);
 for(const [label,snapshot]of [['audit',row],['validation',example]]){
  const {c,all,make}=context();all['7-3'][0]={...all['7-3'][0],conditions:snapshot.conditions,los:snapshot.scouting};
  for(const literal of literals){const expected=literal.selectedACE==='source-ready/runtime-model-unknown'?'manual':literal.selectedACE;assert.equal(c.hdFERouteContract(make(literal.hulls,literal.speedRank)).status,expected,label+'/'+literal.id);}
 }
});
