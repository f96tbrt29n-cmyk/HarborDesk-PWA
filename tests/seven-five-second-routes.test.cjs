'use strict';
// Independent second-target source/model proposals; no browser or arrival claim.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),fixtures=path.join(__dirname,'fixtures');
const source=require('./fixtures/seven-five-second-source-cases.json'),actual=require('./fixtures/seven-five-second-actual-masters.json'),scope=require('./fixtures/seven-five-second-scope-expectations.json'),baseline=require('./fixtures/seven-five-second-before-baseline.json');
const plain=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const STYPES={BB:9,FBB:8,BBV:10,CL:3,CLT:4,CT:21,CA:5,CAV:6,CV:11,CVB:18,CVL:7,DD:2,DE:1,CD:12,AV:16,SS:13,SSV:14,AS:20,AO:22,LHA:17,AR:19};
const original=['BBV','CAV','CL','DD','DD','DD'];
function historicalThreeOneSource(file,body){
 // This legacy comparison owns the pre-3-1 projection. Actual CFG semantics
 // remain covered by the independent three-one-cfg suite in the same wrapper.
 const bytes=fs.readFileSync(path.join(fixtures,'three-one-approved-source-inverses.json'));
 assert.equal(sha(bytes),'9fe3a72b32982c108ca62ffbfae8468290278d36f3857f906219e4680246179e');
 const approved=JSON.parse(bytes),changes=approved.changes.filter(row=>row.file===file);
 assert.equal(changes.length,file==='map-plans.js'?1:4);assert.equal(sha(body),approved.files[file].approvedAfterSHA256);
 for(const row of changes.reverse()){assert.equal(body.split(row.after).length,2,file+' approved anchor is unique');body=body.replace(row.after,row.before)}
 assert.equal(sha(body),approved.files[file].beforeSHA256,file+' exact historical source');return body;
}
function fn(text,name){const a=text.indexOf('function '+name+'('),b=text.indexOf('\nfunction ',a+1);assert.ok(a>=0,name+' exists');return text.slice(a,b<0?undefined:b)}
function load(text,name,c){vm.runInContext(fn(text,name),c)}
function context(old=false,historicalThreeOne=false){
 assert.ok(!old||!historicalThreeOne);
 let evaluator=fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8'),plans=old?baseline.mapPlanSource:fs.readFileSync(path.join(root,'map-plans.js'),'utf8');
 if(historicalThreeOne){evaluator=historicalThreeOneSource('fleet-readiness-evaluator.js',evaluator);plans=historicalThreeOneSource('map-plans.js',plans)}
 const masters=new Map(),ids=new Map();
 const c=vm.createContext({window:{},localStorage:{getItem:()=>null},hdFEFind:()=>({}),hdFEFindShip:name=>masters.get(name)||null,hdShipDbMasterRowFor:x=>ids.get(Number(x?.masterId))||masters.get(typeof x==='string'?x:x?.name||x?.final)||null,hdShipDbSlotProfile:()=>null,hdFEExpansionAvailability:()=>({allowed:false,status:'manual'})});
 vm.runInContext(plans,c);const all=vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS',c),maps=vm.runInContext('MAP_PLANS',c);
 const fleet=fs.readFileSync(path.join(root,'fleet-suggester.js'),'utf8'),a=fleet.indexOf('const HD_FS_TYPE_ALIASES='),b=fleet.indexOf('\n};',a)+3;vm.runInContext(old?baseline.fleetTypeAliasesSource:fleet.slice(a,b),c);
 for(const name of ['hdFSTypeMatches','hdFSRequirementPatterns','hdFSPresetInfo'])vm.runInContext(old?baseline.fleetFunctions[name]:fn(fleet,name),c);
 for(const name of ['hdFESpeedLabel','hdFESpeedTarget','hdFEBranchPredicate','hdFEBranchGoal','hdFEGraphRoute','hdFEBranchRoute','hdFERouteContract','hdFEPlanSpeedTarget','hdFERouteFlagshipOk','hdFEPresetRouteMatch','hdFEInferRoute','hdFERouteRequirementData','hdFERouteBasic','hdFERoute'])vm.runInContext(old?baseline.functions[name]:fn(evaluator,name),c);
 c.hdFEAssigned=()=>[];c.hdFEGameMatch=()=>({status:'ready'});
 // Only unrelated-route reverse comparisons use this controlled numeric layer.
 // The selected Q target has los:none and must not consume an invented score.
 c.hdFEScouting=p=>({available:true,status:'ready',coef:4,score:p.score??100,detail:'controlled reverse-comparison input, not a real scouting-model assertion'});
 c.hdFERouteShips=p=>p.ships.filter(s=>s.ship).map((s,i)=>{const db=masters.get(s.ship),given=p.perShipSpeeds?.[i],rank=given?given.rank:p.rank,known=given?given.known:rank!==null;return {ship:s,type:s.type,typeKnown:!!db&&s.type!=='海防戦艦',speedInfo:{known,rank:known?rank:0,base:given?.base??(known?rank:0),group:known?'independent-source':'',invalid:[],expansionUnconfirmed:false}}});
 const register=row=>{masters.set(row.name,{...row,final:row.name,base:row.name});ids.set(row.id,masters.get(row.name))};
 const selected=ships=>{const preset=maps['7-5'].presets[1];return {map:'7-5',routeIndex:1,preset,routeInfo:plain(c.hdFSPresetInfo(preset)),ships}};
 const make=(hulls,rank=5,extra={})=>{const ships=hulls.map((kind,i)=>{const ship='second-'+kind+'-'+i,type=source.definitions[kind],id=20000+i;if(kind!=='UNKNOWN')register({id,name:ship,type,stype:STYPES[kind]});return {ship,masterId:kind==='UNKNOWN'?0:id,type,items:[]}});return {...selected(ships),rank,...extra}};
 const makeActual=literal=>{const ships=literal.ships.map(row=>{register({id:row.masterId,name:row.name,type:row.curatedType,stype:row.stype,speed:row.baseSpeed});return {ship:row.name,masterId:row.masterId,type:row.curatedType,items:[]}});return {...selected(ships),rank:literal.nativeFleetRank,perShipSpeeds:literal.ships.map(row=>({known:true,rank:row.baseSpeed,base:row.baseSpeed}))}};
 return {c,all,maps,masters,ids,make,makeActual,evaluator};
}
function nativeSpeedModel(h){
 const {c}=h;vm.runInContext(fs.readFileSync(path.join(root,'ship-master-snapshot.js'),'utf8'),c);const snap=c.window.HD_KANCOLLE_MASTER_SNAPSHOT;
 c.HD_SHIP_SLOT_PROFILES=snap.ships;c.HD_EQUIPMENT_MASTER_META_BY_NAME=snap.equipment;c.HD_PICKER_TYPE_OVERRIDES=snap.clientRules.pickerTypeOverrides;c.HD_PICKER_TYPE_SP_OVERRIDES=snap.clientRules.equipTypeSpOverrides;c.HD_EQUIPMENT_CATEGORY_MASTER_TYPE_IDS={};c.HD_SLOT_EXCLUSION_RULES=snap.clientRules.slotExclusions;c.HD_SHIP_MASTER_NAME_CACHE=new Map();c.hdShipDbMetaAliases=null;
 const database=fs.readFileSync(path.join(root,'ship-database.js'),'utf8');
 for(const name of ['hdShipDbMasterSnapshot','hdShipDbMasterRows','hdShipDbMasterRowFor','hdShipDbMasterSpeed','hdShipDbMasterTypeMap','hdShipDbMasterAllowedTypes','hdShipDbMasterRoles','hdShipDbMasterAdapter','hdShipDbEquipNorm','hdShipDbMasterMeta','hdShipDbPickerTypeId','hdShipDbMasterTypeIdsForItem','hdShipDbMasterCompatible','hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbSlotProfile','hdShipDbEquipCompatible'])load(database,name,c);
 c.hdShipDbSlotAllowedTypes=(snapshot,rules)=>Object.keys(rules).map(id=>c.hdShipDbMasterTypeMap().get(String(id))||'').filter(Boolean);
 c.hdFEFindShip=name=>c.hdShipDbMasterAdapter({name});c.hdFEFind=name=>snap.equipment[name]?{name,...snap.equipment[name],category:snap.equipment[name].typeName}:null;
 vm.runInContext('const HD_FE_SPEED_MEMO=new WeakMap();',c);for(const name of ['hdFESpeedGroup','hdFESpeedRecipes','hdFEShipSpeed'])load(h.evaluator,name,c);return snap;
}
test('7-5 second freezes its independent31 source values, six master proposals and separate domain adjustments',()=>{
 assert.equal(sha(fs.readFileSync(path.join(fixtures,'seven-five-second-source-cases.json'))),'4cb6a7008cff86db17af413c7d3dd40b6d0579c029ccfc8bca438fff2fcf5551');
 assert.equal(sha(fs.readFileSync(path.join(fixtures,'seven-five-second-actual-masters.json'))),'ad278802d801ab37a3ab7941480b9f9057854991c8282391eb4eefb49aa9f63d');
 assert.equal(sha(fs.readFileSync(path.join(fixtures,'seven-five-second-before-baseline.json'))),'1246b518ef689bd958ef0f6e9df8b5b231978ed3de9fab21d509230bf6e98a42');
 assert.equal(source.cases.length,31);assert.equal(new Set(source.cases.map(x=>x.id)).size,31);assert.equal(actual.cases.length,6);assert.deepEqual(source.sourceStatusCounts,{ready:17,missing:9,manual:5});assert.deepEqual(scope.expectedCounts,{ready:16,missing:9,manual:6});assert.deepEqual(scope.cases.map(x=>x.id),source.cases.map(x=>x.id));
 assert.deepEqual(Object.keys(scope.adjustments),['second-smaller-table-deduction','second-cd-normalization-gap','second-lha-carrier-equivalence-gap','second-d15-source-order-gap']);
 for(const row of source.cases){const adjusted=scope.adjustments[row.id];assert.equal(scope.cases.find(x=>x.id===row.id).expectedRuntimeStatus,adjusted?adjusted.expectedRuntimeStatus:row.sourceAgreementStatus,row.id+' source is not rewritten for product scope');}
 assert.equal(source.cases.find(x=>x.id==='second-cd-normalization-gap').expectedBySource.KC.conditionalSelectedPath,'ready');assert.equal(source.cases.find(x=>x.id==='second-lha-carrier-equivalence-gap').rawTableSourceAgreementStatus,'ready');
 assert.equal(baseline.base,'0cb16ded18d52e95151a783459660c5526a7e4ce');assert.equal(sha(baseline.mapPlanSource),baseline.mapPlanSHA256);for(const [name,text]of Object.entries(baseline.functions))assert.equal(sha(text),baseline.functionSHA256[name],name+' frozen before function');
 assert.deepEqual(source.unavailable,[{url:'https://wikiwiki.jp/kancolle/南西海域/7-5',status:403}]);assert.equal(source.policy.FChoice,'J');assert.equal(source.policy.OChoice,'Q');assert.equal(source.policy.sixHullScopeIsGameMinimum,false);assert.equal(source.policy.defaultNightCIAdded,false);
});
test('7-5 second applies all31 independent expectations without mutating source plans',()=>{
 const {c,make}=context(),counts={ready:0,missing:0,manual:0};
 for(const literal of source.cases){const p=make(literal.hulls,literal.speedRank),before=JSON.stringify(p),expected=scope.cases.find(x=>x.id===literal.id).expectedRuntimeStatus;assert.equal(c.hdFERouteContract(p).status,expected,literal.id+' contract');assert.equal(c.hdFERoute(p).status,expected,literal.id+' full selected route');assert.equal(JSON.stringify(p),before,literal.id+' input unchanged');counts[expected]++;}
 assert.deepEqual(counts,scope.expectedCounts);
});
test('7-5 second keeps J priority, D disagreement and disjoint unknown roles distinct',()=>{
 const {c,make}=context();
 for(const [hulls,rank,expected]of [[['CVL','CAV','CAV','CL','DD','DD'],5,'ready'],[['CVL','CAV','AV','CL','DD','DD'],5,'missing'],[['CVL','CAV','AV','CL','DD','DD'],10,'ready'],[['CV','CVL','CL','DD','DD','DD'],10,'missing'],[['CV','CVL','CL','DD','DD','DD'],15,'ready'],[['CV','CV','CL','DD','DD','DD'],15,'missing'],[['CV','FBB','CAV','CL','DD','DD'],15,'manual'],[['CV','FBB','CAV','CL','DD','DD'],20,'ready']])assert.equal(c.hdFERoute(make(hulls,rank)).status,expected,hulls.join('/')+'/'+rank);
 assert.equal(c.hdFERoute(make(['CVL','CAV','CL','DD','AV','UNKNOWN'],5)).status,'missing','one unknown cannot fill both the second CA and second escort while knownAV is outside the exact six-role family');
 assert.equal(c.hdFERoute(make(['CVL','CAV','CAV','CL','DD','UNKNOWN'],5)).status,'manual','one unknown may be the one missing escort; no unsupported ready or missing');
 assert.equal(c.hdFERoute(make(['CV','CVL','CL','DD','DD','DD'],null)).status,'manual','possible earlier high-plus J rescue remains unknown');
 const heavy=make(['BB','CAV','CAV','CL','DD','DD'],null);assert.equal(c.hdFERoute(heavy).status,'manual');heavy.perShipSpeeds=heavy.ships.map((s,i)=>({known:i===0,rank:i===0?5:0}));assert.equal(c.hdFERoute(heavy).status,'missing','one known slow hull defeats the earlier uniform speed rescue despite other missing speeds');
 assert.equal(c.hdFERoute(make(['CL','DD','DD','DD','AV'],5)).status,'manual','finite six-hull domain does not turn a smaller table deduction into game impossibility');
});
test('actual native CVL2 and DD2 DE1 contrasts expose the old flat upper and escort limits',()=>{
 for(const [id,expectedTypes]of [['actual-cvl2-native',['軽空母']],['actual-de-replacement-native',['駆逐艦']],['actual-fbb2-native',['戦艦','高速戦艦','航空戦艦']]]){
  const literal=actual.cases.find(x=>x.id===id),now=context(),old=context(true),p=now.makeActual(literal),previous=old.c.hdFERouteContract(old.makeActual(literal)),missing=previous.checks.filter(x=>x.status==='missing');assert.equal(previous.status,'missing',id+' previous contract');assert.equal(missing.length,1,id+' only one raw flat condition blocks');assert.deepEqual(plain(missing[0].condition.types),expectedTypes,id+' independent old restriction');assert.equal(now.c.hdFERouteContract(p).status,'ready',id+' new contract');assert.equal(now.c.hdFERoute(p).status,'ready',id+' canonical example requirements are not additional source constraints');assert.deepEqual(plain(now.c.hdFERoute(p).requirements),[]);
 }
});
test('all six native master proposals match saved identity, slot and speed data without speed equipment',()=>{
 const h=context(),snap=nativeSpeedModel(h),{c}=h;
 for(const literal of actual.cases){const p=h.makeActual(literal),ranks=[];
  for(const [i,row]of literal.ships.entries()){const master=snap.allShips[String(row.masterId)];assert.equal(master.name,row.name);assert.equal(master.stype,row.stype);assert.equal(master.type,row.masterType);assert.equal(master.speed,row.baseSpeed);assert.deepEqual(plain(master.slots),row.normalSlots);const db=c.hdShipDbMasterAdapter({masterId:row.masterId}),profile=c.hdShipDbSlotProfile(db),speed=c.hdFEShipSpeed(p.ships[i]);assert.equal(profile.count,row.normalSlots.length);assert.equal(speed.known,true);assert.equal(speed.base,row.baseSpeed);assert.equal(speed.rank,row.baseSpeed);assert.deepEqual(plain(speed.invalid),[]);assert.equal(speed.expansionUnconfirmed,false);assert.deepEqual(p.ships[i].items,[]);ranks.push(speed.rank);}
  assert.equal(Math.min(...ranks),literal.nativeFleetRank);assert.equal(literal.ships.reduce((n,r)=>n+r.normalSlots.length,0),literal.normalSlotCount);assert.equal(c.hdFERoute(p).status,literal.sourceConditionalExpectation,literal.id+' independent J outcome');
 }
 // Static master/speed compatibility does not demonstrate owned inventory,
 // combat sufficiency, live gauge availability, save/load or actual arrival.
});
test('chosen second requirements, flagship and both explicit speed inputs remain effective',()=>{
 const {c,make}=context();
 for(const location of ['routeInfo','suggestion'])for(const field of ['requirements','conditionManual','flagship']){
  const p=make(original,5),info=plain(p.routeInfo);if(field==='requirements')info.requirements.push({token:'空母',count:1});if(field==='conditionManual')info.conditionManual=true;if(field==='flagship')info.flagship='駆逐';if(location==='routeInfo')p.routeInfo=info;else p.suggestion={preset:p.preset,info};const r=c.hdFERoute(p),expected=field==='flagship'||location==='routeInfo'&&field==='requirements'?'missing':'manual';assert.equal(r.status,expected,location+'/'+field);assert.equal(r.requirements.length,info.requirements.length);assert.match(r.detail,/ABDFJOQ/);if(field==='requirements'){assert.deepEqual(plain(r.requirements.find(x=>x.token==='空母')),{token:'空母',need:1,got:0,ok:false});assert.match(r.detail,/空母 0\/1/)}if(field==='conditionManual')assert.match(r.detail,/艦種・隻数の条件を手動確認/);if(field==='flagship')assert.match(r.detail,/旗艦条件未充足/);
 }
 for(const location of ['routeInfo','suggestion'])for(const rank of [10,15,20]){const p=make(original,5),info={...plain(p.routeInfo),text:rank===20?'最速統一':rank===15?'高速+統一':'高速統一',speedRequired:true};if(location==='routeInfo')p.routeInfo=info;else p.suggestion={preset:p.preset,info};assert.equal(c.hdFEPlanSpeedTarget(p),rank,location+'/'+rank);assert.equal(c.hdFERoute(p).status,'missing');p.rank=null;assert.equal(c.hdFERoute(p).status,'manual');}
 const both=make(original,15);both.routeInfo={...both.routeInfo,text:'利用者 最速統一',speedRequired:true};both.suggestion={preset:both.preset,info:{...plain(both.routeInfo),text:'利用者 高速+統一'}};assert.equal(c.hdFEPlanSpeedTarget(both),20);assert.equal(c.hdFERoute(both).status,'missing');assert.equal(c.hdFEPlanSpeedTarget(make(original,5)),0,'conditional route rescues do not create a universal speed-equipment target');
});
test('selected second Q keeps canonical nonapplicable LOS and the unchanged optional PT descriptor',()=>{
 const h=context(),{c,make}=h;for(const name of ['hdFEScoutingExemption','hdFEScouting','hdFEPlanScouting'])load(h.evaluator,name,c);
 for(const score of [null,-100,0,100,10000]){const p=make(original,5);p.score=score;p.sourceScore=score;for(const r of [c.hdFEScouting(p,[]),c.hdFEPlanScouting(p,[])]){assert.equal(r.notRequired,true);assert.equal(r.score,null);assert.equal(r.reason,'not-required')}assert.equal(c.hdFERoute(p).status,'ready');}
 const d=h.all['7-5'][1];assert.deepEqual(plain(d.los),{kind:'none',note:'この登録経路に数値索敵の条件は掲載されていません。'});assert.equal(d.minimumSpeed,undefined);assert.equal(d.openingAsw,undefined);assert.deepEqual(plain(d.equipmentKinds),['制空','防空','対潜','対地','PT対策']);assert.deepEqual(plain(d.equipmentTargets),[{kind:'cap-pt',baseKind:'PT対策',label:'PT小鬼群対策セット',minCount:1,source:'https://zekamashi.net/kancolle-kouryaku/ptboat-taisaku/'}]);assert.equal(Object.hasOwn(d.equipmentTargets[0],'generatedFromMap'),false,'PT origin/merge correction is a separate unimplemented phase');assert.equal(d.equipmentKinds.includes('夜戦'),false);assert.equal(d.base,undefined);assert.deepEqual(plain(d.sourceUnavailable),source.unavailable);
 const notes=d.notes.join(' ');for(const phrase of ['FでJ','OでQ','MギミックとQは順不同','軽空2','駆逐2＋海防1','Jは軽空ちょうど1','その他N','PTを無理に撃破せず','任意の比較目標','購入数量','基地航空隊は使用できず','第1の夜戦CIを追加せず','旧図'])assert.ok(notes.includes(phrase),phrase);
});
test('historical source projection preserves full outputs for other52 presets while current CFG has its own oracle',()=>{
 const now=context(false,true),old=context(true);let presets=0,comparisons=0;
 for(const [map,data]of Object.entries(now.maps))for(const [index,preset]of data.presets.entries()){
  if(map==='7-5'&&index===1)continue;presets++;assert.deepEqual(plain(now.all[map][index]),plain(old.all[map][index]),map+'/'+index+' complete data unchanged');
  for(const mode of ['canonical','chosen-manual','explicit-speed','unknown']){const make=h=>{const p=h.make(['CL','DD','DD','DD','DD','DD'],mode==='unknown'?null:10);p.map=map;p.routeIndex=index;p.preset=h.maps[map].presets[index];p.routeInfo=plain(h.c.hdFSPresetInfo(p.preset));p.score=100;if(mode==='chosen-manual')p.suggestion={preset:p.preset,info:{...plain(p.routeInfo),conditionManual:true}};if(mode==='explicit-speed')p.routeInfo={...p.routeInfo,text:'利用者指定 高速+統一',speedRequired:true};return p},a=make(now),b=make(old);assert.deepEqual(plain(now.c.hdFERoute(a)),plain(old.c.hdFERoute(b)),map+'/'+index+'/'+mode+' full route');assert.equal(now.c.hdFEPlanSpeedTarget(a),old.c.hdFEPlanSpeedTarget(b),map+'/'+index+'/'+mode+' speed target');comparisons++;}
 }
 assert.equal(presets,52);assert.equal(comparisons,208);
});
test('second keeps its canonical key and ships while first full data and third declaration remain unchanged',()=>{
 const now=context(),old=context(true),preset=now.maps['7-5'].presets[1],s=fs.readFileSync(path.join(root,'map-plans.js'),'utf8');assert.equal(preset.name,old.maps['7-5'].presets[1].name);assert.equal(preset.ships,old.maps['7-5'].presets[1].ships);assert.equal(now.all['7-5'][1].useExampleScope,false);assert.deepEqual(plain(now.all['7-5'][0]),plain(old.all['7-5'][0]));assert.deepEqual(plain(now.maps['7-5'].presets[0]),plain(old.maps['7-5'].presets[0]));assert.deepEqual(plain(now.all['7-5'][2]),plain(old.all['7-5'][2]));const start=s.indexOf(" add('7-5',2,");assert.ok(start>=0);assert.equal(s.slice(start,s.indexOf('\n',start)),baseline.unchangedThirdDeclaration);assert.equal((s.match(/MAP_PLANS\['7-5'\]\.presets\[1\]\.gear=/g)||[]).length,1);for(const phrase of ['第2目標Q','F→J','O→Q','任意','数値索敵'])assert.ok(preset.gear.includes(phrase),phrase);
 assert.equal(sha(fs.readFileSync(path.join(fixtures,'seven-five-first-source-proposals.json'))),'3a638a06d280dc5121dfdeae45692cfb05af1dac101079f48f7755618a50aff4');assert.equal(sha(fs.readFileSync(path.join(fixtures,'seven-five-first-concrete-proposals.json'))),'0f76fb1c1585cf94b251c8aa62d227e3e211dc428308be8a1bc0a142248e1ad6');
});
