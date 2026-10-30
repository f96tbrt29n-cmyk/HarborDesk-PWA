'use strict';
// Independent source/model proposals; finite Node evidence is recorded separately from browser arrival.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),fixtureRoot=path.join(__dirname,'fixtures');
const source=require('./fixtures/seven-five-first-source-proposals.json'),concrete=require('./fixtures/seven-five-first-concrete-proposals.json'),scope=require('./fixtures/seven-five-first-scope-expectations.json'),baseline=require('./fixtures/seven-five-first-baseline.json'),additional=require('./fixtures/seven-five-first-additional-source-literals.json');
const TYPES={CA:'重巡洋艦',CAV:'航空巡洋艦',CL:'軽巡洋艦',CLT:'重雷装巡洋艦',CT:'練習巡洋艦',DD:'駆逐艦',DE:'海防艦',CD:'海防戦艦',BB:'戦艦',FBB:'高速戦艦',BBV:'航空戦艦',CV:'正規空母',CVB:'装甲空母',CVL:'軽空母',AV:'水上機母艦',AO:'補給艦',AS:'潜水母艦',SS:'潜水艦',SSV:'潜水空母',LHA:'揚陸艦',AR:'工作艦',UNKNOWN:'?'};
const STYPES={BB:9,FBB:8,BBV:10,CL:3,CLT:4,CT:21,CA:5,CAV:6,CV:11,CVB:18,CVL:7,DD:2,DE:1,CD:12,AV:16,SS:13,SSV:14,AS:20,AO:22,LHA:17,AR:19};
const original=['CAV','CLT','CL','DD','DD','AV'],plain=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function fn(sourceText,name){const a=sourceText.indexOf('function '+name+'('),b=sourceText.indexOf('\nfunction ',a+1);assert.ok(a>=0,name+' exists');return sourceText.slice(a,b<0?undefined:b)}
function load(sourceText,name,c){vm.runInContext(fn(sourceText,name),c)}
function context(old=false){
 const evaluator=old?baseline.evaluatorSource:fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8'),plans=old?baseline.mapPlanSource:fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),masters=new Map(),ids=new Map();
 const c=vm.createContext({window:{},localStorage:{getItem:()=>null},hdFEFind:()=>({}),hdFEFindShip:name=>masters.get(name)||null,hdShipDbMasterRowFor:x=>ids.get(Number(x?.masterId))||masters.get(typeof x==='string'?x:x?.name||x?.final)||null,hdShipDbSlotProfile:()=>null,hdFEExpansionAvailability:()=>({allowed:false,status:'manual'})});
 vm.runInContext(plans,c);const all=vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS',c),maps=vm.runInContext('MAP_PLANS',c);
 const fleetSource=fs.readFileSync(path.join(root,'fleet-suggester.js'),'utf8'),a=fleetSource.indexOf('const HD_FS_TYPE_ALIASES='),b=fleetSource.indexOf('\n};',a)+3;vm.runInContext(old?baseline.fleetTypeAliasesSource:fleetSource.slice(a,b),c);
 for(const name of ['hdFSTypeMatches','hdFSRequirementPatterns','hdFSPresetInfo'])vm.runInContext(old?baseline.fleetFunctions[name]:fn(fleetSource,name),c);
 for(const name of ['hdFESpeedLabel','hdFESpeedTarget','hdFEBranchPredicate','hdFEBranchGoal','hdFEGraphRoute','hdFEBranchRoute','hdFERouteContract','hdFEPlanSpeedTarget','hdFERouteFlagshipOk','hdFEPresetRouteMatch','hdFEInferRoute','hdFERouteRequirementData','hdFERouteBasic','hdFERoute'])load(evaluator,name,c);
 c.hdFEAssigned=()=>[];c.hdFEGameMatch=()=>({status:'ready'});
 // Controlled numeric context for unrelated routes in the reverse comparison;
 // selected K has los:none and must never need this raw score.
 c.hdFEScouting=p=>({available:true,status:'ready',coef:4,score:p.score??100,detail:'independent comparison input; not a real numeric-model assertion'});
 c.hdFERouteShips=p=>p.ships.filter(s=>s.ship).map((s,i)=>{const db=masters.get(s.ship),known=!!db&&s.type!=='海防戦艦',given=p.perShipSpeeds?.[i],rank=given?given.rank:p.rank,speedKnown=given?given.known:rank!==null;return {ship:s,type:s.type,typeKnown:known,speedInfo:{known:speedKnown,rank:speedKnown?rank:0,base:given?.base??(speedKnown?rank:0),group:speedKnown?'independent-source':'',invalid:[],expansionUnconfirmed:false}}});
 const register=row=>{masters.set(row.name,{...row,final:row.name,base:row.name});ids.set(row.id,masters.get(row.name))};
 const make=(hulls,rank=5,extra={})=>{
  const ships=hulls.map((kind,i)=>{const ship='source-'+kind+'-'+i,type=TYPES[kind],id=10000+i;if(kind!=='UNKNOWN')register({id,name:ship,type,stype:STYPES[kind]});return {ship,masterId:kind==='UNKNOWN'?0:id,type,items:[]}}),preset=maps['7-5'].presets[0],p={map:'7-5',routeIndex:0,preset,routeInfo:plain(c.hdFSPresetInfo(preset)),ships,rank,...extra};
  if(extra.speedEvidence?.oneKnownRank5)p.perShipSpeeds=ships.map((s,i)=>({known:i===0,rank:i===0?5:0}));
  return p;
 };
 const makeActual=(literal,tableRank)=>{
  const ships=literal.ships.map(row=>{register({id:row.masterId,name:row.name,type:row.curatedType||row.masterType,stype:row.stype,speed:row.baseSpeed});return {ship:row.name,masterId:row.masterId,type:row.curatedType||row.masterType,items:plain(row.items||[])}}),preset=maps['7-5'].presets[0];
  return {map:'7-5',routeIndex:0,preset,routeInfo:plain(c.hdFSPresetInfo(preset)),ships,rank:tableRank??literal.nativeFleetRank,perShipSpeeds:literal.ships.map(row=>({known:true,rank:tableRank??row.baseSpeed,base:row.baseSpeed}))};
 };
 return {c,all,maps,masters,ids,make,makeActual,evaluator};
}
function withRealSpeedModel(h){
 const {c}=h;vm.runInContext(fs.readFileSync(path.join(root,'ship-master-snapshot.js'),'utf8'),c);const snap=c.window.HD_KANCOLLE_MASTER_SNAPSHOT;
 c.HD_SHIP_SLOT_PROFILES=snap.ships;c.HD_EQUIPMENT_MASTER_META_BY_NAME=snap.equipment;c.HD_PICKER_TYPE_OVERRIDES=snap.clientRules.pickerTypeOverrides;c.HD_PICKER_TYPE_SP_OVERRIDES=snap.clientRules.equipTypeSpOverrides;c.HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS={};c.HD_SLOT_EXCLUSION_RULES=snap.clientRules.slotExclusions;c.HD_SHIP_MASTER_NAME_CACHE=new Map();c.hdShipDbMetaAliases=null;
 const database=fs.readFileSync(path.join(root,'ship-database.js'),'utf8');
 for(const name of ['hdShipDbMasterSnapshot','hdShipDbMasterRows','hdShipDbMasterRowFor','hdShipDbMasterSpeed','hdShipDbMasterTypeMap','hdShipDbMasterAllowedTypes','hdShipDbMasterRoles','hdShipDbMasterAdapter','hdShipDbEquipNorm','hdShipDbMasterMeta','hdShipDbPickerTypeId','hdShipDbMasterTypeIdsForItem','hdShipDbMasterCompatible','hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbSlotProfile','hdShipDbEquipCompatible'])load(database,name,c);
 c.hdShipDbSlotAllowedTypes=(snapshot,rules)=>Object.keys(rules).map(id=>c.hdShipDbMasterTypeMap().get(String(id))||'').filter(Boolean);
 c.hdFEFindShip=name=>c.hdShipDbMasterAdapter({name});c.hdFEFind=name=>snap.equipment[name]?{name,...snap.equipment[name],category:snap.equipment[name].typeName}:null;
 vm.runInContext('const HD_FE_SPEED_MEMO=new WeakMap();',c);
 for(const name of ['hdFESpeedGroup','hdFESpeedRecipes','hdFEShipSpeed'])load(h.evaluator,name,c);
 return snap;
}
test('7-5 first keeps the original52, actual3 and policy8 as separate frozen evidence',()=>{
 assert.equal(sha(fs.readFileSync(path.join(fixtureRoot,'seven-five-first-source-proposals.json'))),'3a638a06d280dc5121dfdeae45692cfb05af1dac101079f48f7755618a50aff4');
 assert.equal(sha(fs.readFileSync(path.join(fixtureRoot,'seven-five-first-concrete-proposals.json'))),'0f76fb1c1585cf94b251c8aa62d227e3e211dc428308be8a1bc0a142248e1ad6');
 assert.equal(source.cases.length,52);assert.equal(source.policyExpectations.length,8);assert.equal(concrete.cases.length,3);assert.equal(scope.cases.length,52);assert.deepEqual(scope.cases.map(x=>x.id),source.cases.map(x=>x.id));
 assert.deepEqual(Object.keys(scope.adjustments),['cd-model-gap','known-heavy3-plus-unknown-speed20','five-table-deduction','three-cl-dd-de','two-cl-dd-speed15']);
 assert.equal(sha(fs.readFileSync(path.join(fixtureRoot,'seven-five-first-additional-source-literals.json'))),'34c2bd25808ec0ff99198079195de1b04d3a443a130479c36581e64297199673');
 for(const row of source.cases){const adjusted=scope.adjustments[row.id],mapped=scope.cases.find(x=>x.id===row.id);if(adjusted)assert.equal(adjusted.expectedRuntimeStatus,'manual');assert.equal(mapped.expectedRuntimeStatus,adjusted?adjusted.expectedRuntimeStatus:row.twoAccessibleSourceSelectedPathStatus,row.id+' only explicit scope adjustments may alter the frozen source expectation');}
 for(const row of source.cases)assert.equal(row.JP,'unavailable HTTP403',row.id);assert.equal(baseline.base,'7fd5298e7248ebeb6b71c67dae7c0a579e0b7991');
 for(const [name,text]of Object.entries(baseline.functions))assert.equal(text,fn(baseline.evaluatorSource,name),name+' baseline function is frozen unchanged');
 assert.equal(sha(baseline.mapPlanSource),'c97d05ae6960eb7018825f22cf225aa37c777a9b7472240d40b370a540c5e944');assert.equal(sha(baseline.evaluatorSource),'b99fd383a304849d438cb656df9006cd7856d18586d03a0d68426a61b78ae2a8');
});
test('7-5 first applies independent source52 expectations with explicit six-hull/model adjustments',()=>{
 const {c,make}=context(),counts={ready:0,missing:0,manual:0};
 for(const literal of source.cases){const expected=scope.cases.find(x=>x.id===literal.id).expectedRuntimeStatus,p=make(literal.hulls,literal.speedRank,literal.speedEvidence?{speedEvidence:literal.speedEvidence}:{}),before=JSON.stringify(p),r=c.hdFERouteContract(p);assert.equal(r.status,expected,literal.id+' contract');assert.equal(c.hdFERoute(p).status,expected,literal.id+' selected route');assert.equal(JSON.stringify(p),before,literal.id+' input unchanged');counts[expected]++;}
 assert.deepEqual(counts,scope.expectedCounts);
});
test('7-5 first keeps source order differences, disjoint unknown roles and known speed evidence',()=>{
 const {c,make}=context();
 for(const rank of [15,20])assert.equal(c.hdFERoute(make(['CV','BBV','CA','CL','DD','DD'],rank)).status,rank===15?'manual':'ready','abstract source priority input; not BBV speed legality evidence');
 assert.equal(c.hdFERoute(make(['CV','CV','CL','DD','DD','DD'],15)).status,'missing','B speed15 does not bypass D early CV2 E');
 assert.equal(c.hdFERoute(make(['BBV','BBV','BBV','DD','DD','UNKNOWN'],5)).status,'missing','known low speed and knownheavy3 survive another missing type');
 assert.equal(c.hdFERoute(make(['BBV','BBV','BBV','CL','DD','DD'],null)).status,'manual','possible preceding speed20 rescue cannot be discarded');
 const oneSlow=source.cases.find(x=>x.id==='known-heavy3-one-known-slow-others-unknown'),p=make(oneSlow.hulls,oneSlow.speedRank,{speedEvidence:oneSlow.speedEvidence});assert.equal(c.hdFERoute(p).status,'missing','one knownrank5 defeats uniform15/20 despite other unknown speeds');
 assert.equal(additional.cases.length,1);for(const literal of additional.cases){const p=make(literal.hulls,literal.speedRank);assert.equal(c.hdFERouteContract(p).status,literal.expectedSelectedPathStatus,literal.id);assert.equal(c.hdFERoute(p).status,literal.expectedSelectedPathStatus,literal.id+' final');}
});
test('actual native six-hull primary contrast isolates the old DD-only restriction',()=>{
 const literal=concrete.cases.find(x=>x.id==='actual-native-dd1-de1-primary'),now=context(),old=context(true),p=now.makeActual(literal),before=old.makeActual(literal);
 assert.equal(Math.min(...p.perShipSpeeds.map(x=>x.rank)),5);assert.deepEqual(p.ships.map(x=>x.masterId),[506,119,668,144,376,106]);assert.deepEqual(p.ships.map(x=>x.type),['航空巡洋艦','重雷装巡洋艦','軽巡洋艦','駆逐艦','海防艦','水上機母艦']);
 const previous=old.c.hdFERouteContract(before),missing=previous.checks.filter(x=>x.status!=='ready');assert.equal(previous.status,'missing');assert.equal(missing.length,1);assert.deepEqual(plain(missing[0].condition.types),['駆逐艦']);assert.equal(missing[0].min,2);assert.equal(missing[0].count,1);
 assert.equal(now.c.hdFERouteContract(p).status,'ready');assert.equal(now.c.hdFERoute(p).status,'ready');assert.deepEqual(plain(now.c.hdFERoute(p).requirements),[],'canonical source example is not an extra DD2 route requirement');
 assert.equal(literal.sourceArticle.B,'D');assert.equal(literal.sourceArticle.D,'F');assert.deepEqual(literal.sourceArticle,literal.sourceKC);assert.deepEqual(literal.chosenEdges,['F->G','H->K']);
});
test('actual speed20 secondary route inputs stay distinct from real speed-model evidence',()=>{
 const now=context(),old=context(true);
 for(const literal of concrete.cases.filter(x=>x.id!=='actual-native-dd1-de1-primary')){const p=now.makeActual(literal,20),previous=old.makeActual(literal,20);assert.equal(now.c.hdFERouteContract(p).status,'ready',literal.id);assert.equal(now.c.hdFERoute(p).status,'ready',literal.id+' selected');assert.equal(old.c.hdFERouteContract(previous).status,'missing',literal.id+' old flat cap');assert.deepEqual(literal.sourceArticle,{B:'D',D:'F'});assert.deepEqual(literal.sourceKC,{B:'D',D:'F'});}
});
test('real speed arithmetic and master normal-slot legality are independently checked for actual3 proposals',()=>{
 const h=context(),snap=withRealSpeedModel(h),{c}=h;
 for(const literal of concrete.cases){const p=h.makeActual(literal,literal.nativeFleetRank??20),ranks=[];
  for(const [i,row]of literal.ships.entries()){
   const master=snap.allShips[String(row.masterId)];assert.equal(master.name,row.name);assert.equal(master.stype,row.stype);assert.equal(master.type,row.masterType);assert.equal(master.speed,row.baseSpeed);assert.equal(master.slots.length,row.slots);
   const ship=p.ships[i],profile=c.hdShipDbSlotProfile(c.hdShipDbMasterAdapter({masterId:row.masterId}));assert.equal(profile.count,row.slots);assert.equal(new Set(ship.items.map(x=>x.slotIndex)).size,ship.items.length);
   for(const item of ship.items){const meta=c.hdFEFind(item.name);assert.equal(meta.id,item.masterId);assert.equal(meta.typeId,17);assert.ok(item.slotIndex>=0&&item.slotIndex<profile.count);assert.equal(c.hdShipDbEquipCompatible(meta,c.hdShipDbMasterAdapter({masterId:row.masterId})),true,row.name+'/'+item.name);assert.equal(c.hdShipDbSlotRejects(profile,item.slotIndex,meta),false);}
   const speed=c.hdFEShipSpeed(ship);assert.equal(speed.known,true);assert.deepEqual(plain(speed.invalid),[]);assert.equal(speed.expansionUnconfirmed,false);assert.equal(speed.base,row.baseSpeed);assert.equal(speed.rank,literal.nativeFleetRank!=null?row.baseSpeed:20,row.name+' real speed');if(row.group)assert.equal(speed.group,row.group);ranks.push(speed.rank);
   if([376,106].includes(row.masterId))assert.equal(profile.masterOnly,true,'exact master fallback preserves '+row.name);
  }
  assert.equal(Math.min(...ranks),literal.nativeFleetRank??20,literal.id+' real fleet rank');
 }
 // Passing the arithmetic/slot model does not demonstrate owned inventory,
 // viable combat sets, user goals, live gauge state or physical arrival.
});
test('selected first K has no LOS calculation even when plans carry invented numerical scores',()=>{
 const h=context(),{c,make}=h;for(const name of ['hdFEScoutingExemption','hdFEScouting','hdFEPlanScouting'])load(h.evaluator,name,c);
 for(const score of [null,-100,0,100,10000]){const p=make(original,5);p.score=score;p.sourceScore=score;for(const result of [c.hdFEScouting(p,[]),c.hdFEPlanScouting(p,[])]){assert.equal(result.status,'ready');assert.equal(result.notRequired,true);assert.equal(result.score,null);assert.equal(result.reason,'not-required')}assert.equal(c.hdFERouteContract(p).status,'ready');assert.equal(c.hdFERoute(p).status,'ready');}
 const d=h.all['7-5'][0];assert.equal(d.los.kind,'none');assert.equal(d.minimumSpeed,undefined);assert.equal(d.equipmentTargets,undefined);assert.deepEqual(plain(d.sources),['https://zekamashi.net/kancolle-kouryaku/7-5/','https://zh.kcwiki.cn/wiki/南西海域/7-5']);assert.deepEqual(plain(d.sourceUnavailable),[{url:'https://wikiwiki.jp/kancolle/南西海域/7-5',status:403}]);
});
test('chosen requirements, complete details, flagship and each explicit speed input remain effective',()=>{
 const {c,make}=context(),expected=[{token:'航巡',need:1,got:1,ok:true},{token:'雷巡',need:1,got:1,ok:true},{token:'軽巡',need:1,got:1,ok:true},{token:'駆逐',need:2,got:2,ok:true},{token:'水母',need:1,got:1,ok:true}];
 for(const location of ['routeInfo','suggestion'])for(const field of ['requirements','conditionManual','flagship']){
  const p=make(original,5),info=plain(p.routeInfo);if(field==='requirements')info.requirements.push({token:'空母',count:1});if(field==='conditionManual')info.conditionManual=true;if(field==='flagship')info.flagship='駆逐';if(location==='routeInfo')p.routeInfo=info;else p.suggestion={preset:p.preset,info};const r=c.hdFERoute(p),want=field==='flagship'||location==='routeInfo'&&field==='requirements'?'missing':'manual';assert.equal(r.status,want,location+'/'+field);assert.deepEqual(plain(r.requirements),[...expected,...(field==='requirements'?[{token:'空母',need:1,got:0,ok:false}]:[])]);assert.match(r.detail,/ABDFGHK/);if(field==='requirements')assert.match(r.detail,/空母 0\/1/);if(field==='conditionManual')assert.match(r.detail,/艦種・隻数の条件を手動確認/);if(field==='flagship')assert.match(r.detail,/旗艦条件未充足/);
 }
 for(const location of ['routeInfo','suggestion'])for(const rank of [10,15,20]){const p=make(original,5),info={...plain(p.routeInfo),text:rank===20?'最速統一':rank===15?'高速+統一':'高速統一',speedRequired:true};if(location==='routeInfo')p.routeInfo=info;else p.suggestion={preset:p.preset,info};assert.equal(c.hdFEPlanSpeedTarget(p),rank,location+'/'+rank);assert.equal(c.hdFERoute(p).status,'missing');p.rank=null;assert.equal(c.hdFERoute(p).status,'manual');}
 const both=make(original,15);both.routeInfo={...both.routeInfo,text:'利用者 高速+統一',speedRequired:true};both.suggestion={preset:both.preset,info:{...plain(both.routeInfo),text:'利用者 最速統一'}};assert.equal(c.hdFEPlanSpeedTarget(both),20);assert.equal(c.hdFERoute(both).status,'missing','both selected inputs remain in force');
 const native=concrete.cases[0],p=context().makeActual(native);p.routeInfo={...p.routeInfo,text:'航巡1雷巡1軽巡1駆逐1海防1水母1',requirements:[{token:'航巡',count:1},{token:'雷巡',count:1},{token:'軽巡',count:1},{token:'駆逐',count:1},{token:'海防艦',count:1},{token:'水母',count:1}],total:6};
 const explicit=context(),selected=explicit.makeActual(native);selected.routeInfo=plain(p.routeInfo);assert.equal(explicit.c.hdFERoute(selected).status,'ready');assert.deepEqual(plain(explicit.c.hdFERoute(selected).requirements),selected.routeInfo.requirements.map(x=>({token:x.token,need:x.count,got:x.count,ok:true})));
});
// The independent second-gauge oracle in seven-five-second-routes.test.cjs owns changed7-5/1.
// Exact3-1/index0 intentionally uses the independent three-one-cfg oracle; other rows keep this legacy reverse comparison.
test('before/new isolated implementations preserve full outputs for the other50 presets and4 modes; 3-1/0 has its dedicated oracle',()=>{
 const now=context(),old=context(true);let presets=0,comparisons=0;
 for(const [map,data]of Object.entries(now.maps))for(const [index,preset]of data.presets.entries()){
  if(map==='3-1'&&index===0||map==='7-5'&&(index===0||index===1))continue;presets++;
  assert.deepEqual(plain(now.all[map][index]),plain(old.all[map][index]),map+'/'+index+' unchanged route data');
  for(const mode of ['canonical','chosen-manual','explicit-speed','unknown']){
   const make=h=>{const p=h.make(['CL','DD','DD','DD','DD','DD'],mode==='unknown'?null:10);p.map=map;p.routeIndex=index;p.preset=h.maps[map].presets[index];p.routeInfo=plain(h.c.hdFSPresetInfo(p.preset));p.score=100;if(mode==='chosen-manual')p.suggestion={preset:p.preset,info:{...plain(p.routeInfo),conditionManual:true}};if(mode==='explicit-speed')p.routeInfo={...p.routeInfo,text:'利用者指定 高速+統一',speedRequired:true};return p},a=make(now),b=make(old);
   assert.deepEqual(plain(now.c.hdFERoute(a)),plain(old.c.hdFERoute(b)),map+'/'+index+'/'+mode+' full route output');assert.equal(now.c.hdFEPlanSpeedTarget(a),old.c.hdFEPlanSpeedTarget(b),map+'/'+index+'/'+mode+' speed target');comparisons++;
  }
 }
 assert.equal(presets,50);assert.equal(comparisons,200);
});
test('canonical key and third gauge declaration stay unchanged; second uses its dedicated oracle and first guidance preserves policy limits',()=>{
 const {all,maps}=context(),preset=maps['7-5'].presets[0],d=all['7-5'][0],s=fs.readFileSync(path.join(root,'map-plans.js'),'utf8');assert.equal(preset.name,'第1ゲージ 1');assert.equal(preset.ships,'航巡1＋雷巡1＋軽巡1＋駆逐2＋水母1');assert.equal(d.useExampleScope,false);assert.deepEqual(plain(d.equipmentKinds),['制空','防空','対潜','夜戦']);
 // The frozen index1 literal is historical; seven-five-second-routes.test.cjs owns its intentional new declaration.
 for(const [index,declaration]of Object.entries(baseline.unchangedSecondAndThirdDeclarations)){if(index==='1')continue;const a=s.indexOf(" add('7-5',"+index+",");assert.ok(a>=0);assert.equal(s.slice(a,s.indexOf('\n',a)),declaration,'index'+index+' declaration remains byte-identical');}
 const notes=d.notes.join(' ');for(const phrase of ['FでG','HでK','ゲージ開放','二資料','未取得','軽巡洋艦のみ','駆逐＋海防','CD/海防戦艦','数値索敵','基地航空隊は使用できず','明示0','必要十分数','購入必須','旧図'])assert.ok(notes.includes(phrase),phrase);
 for(const phrase of ['第1目標K','F→G','H→K','駆逐1＋海防1','二資料','任意'])assert.ok(preset.gear.includes(phrase),'effective guidance retains '+phrase);
 assert.equal((s.match(/MAP_PLANS\['7-5'\]\.presets\[0\]\.gear=/g)||[]).length,1,'first guidance is assigned once and cannot be overwritten by a late legacy value');
 // Policy8 are the frozen independent expectations, not proof that every
 // stock/search/save/load or combat-person target workflow was exercised.
 assert.equal(source.policyExpectations.length,8);assert.equal(d.airNotRequired,undefined,'A air raid remains a user combat goal');
});
test('7-5 first audit and validation bind independent source52 without changing LOS or verification scope',()=>{
 const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8')),validation=JSON.parse(fs.readFileSync(path.join(root,'docs/route-requirement-validation-scope.json'),'utf8'));
 assert.equal(audit.rows.length,59);assert.equal(validation.examples.length,53);
 const rows=audit.rows.filter(x=>x.id==='7-5/0/default'),examples=validation.examples.filter(x=>x.map==='7-5'&&x.index===0);assert.equal(rows.length,1);assert.equal(examples.length,1);
 assert.equal(rows[0].verification,'partial');assert.equal(examples[0].verification.perExampleAllRequirementsPositiveNegative,false);assert.equal(examples[0].verification.representativeAllRequirementsStages,false);assert.equal(examples[0].verification.physicalIPhone,false);
 for(const [label,snapshot]of [['audit',rows[0]],['validation',examples[0]]]){
  const h=context(),data=h.all['7-5'][0];assert.equal(snapshot.path,'ABDFGHK');assert.equal(snapshot.useExampleScope,false);assert.deepEqual(snapshot.scouting,plain(data.los));assert.equal(snapshot.scouting.kind,'none');assert.equal(snapshot.scouting.score,undefined);
  assert.deepEqual(snapshot.conditions,plain(data.conditions));assert.equal(snapshot.sourceScopeAudit.independentEvidence.sourceCount,52);assert.equal(snapshot.sourceScopeAudit.independentEvidence.policyCount,8);assert.equal(snapshot.sourceScopeAudit.independentEvidence.actualMasterCount,3);assert.equal(snapshot.sourceScopeAudit.independentEvidence.jointUnknownCount,1);assert.deepEqual(snapshot.sourceScopeAudit.unavailable,[{url:'https://wikiwiki.jp/kancolle/南西海域/7-5',status:403}]);
  const notes=snapshot.notes||snapshot.special.notes;assert.deepEqual(notes,plain(data.notes));assert.match(snapshot.sourceScopeAudit.combatPolicy,/raw night-support1 item/);assert.match(snapshot.sourceScopeAudit.priorityDisagreement,/remains manual/);
  data.conditions=plain(snapshot.conditions);
  for(const literal of source.cases){const expected=scope.cases.find(x=>x.id===literal.id).expectedRuntimeStatus,p=h.make(literal.hulls,literal.speedRank,literal.speedEvidence?{speedEvidence:literal.speedEvidence}:{});assert.equal(h.c.hdFERouteContract(p).status,expected,label+'/'+literal.id);}
 }
});
