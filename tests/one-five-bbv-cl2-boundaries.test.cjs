'use strict';
// Actual source modules in a pure Node VM. Fixed clocks here are unit-test inputs;
// the browser clock, waits, search caps and product source are never wrapped.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(process.env.HD15CL2_SOURCE_ROOT||path.join(__dirname,'..')),INVERSE=path.join(ROOT,'tests/fixtures/one-five-bbv-cl2-approved-source-inverses.json'),INPUT=path.resolve(process.env.HD15CL2_INPUT_FIXTURE||path.join(ROOT,'tests/fixtures/one-five-bbv-cl2-browser-inputs.json'));
const input=JSON.parse(fs.readFileSync(INPUT,'utf8')),canonicalInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-middle-browser-inputs.json'),'utf8')),priorInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-bbv-cl-browser-inputs.json'),'utf8')),approvedBytes=fs.readFileSync(INVERSE),approved=JSON.parse(approvedBytes),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),host=x=>JSON.parse(JSON.stringify(x)),exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
assert.equal(hash(approvedBytes),'3ec5bd198c5972a5b5a88cea3d2b9bf466dd2b212305c7771a11b563851b5cf3');assert.equal(approved.schemaVersion,1);assert.equal(approved.files['fleet-readiness-evaluator.js'].beforeSHA256,'b737cba126d29936b797e00593a32aa3513c11003a1409005b8478e08354fdc3');assert.equal(approved.files['sortie-equipment-check.js'].beforeSHA256,'1600e3bf8efddc226b8e86b99a2053e0b32989acd55bd8d128ad8ff44514af19');assert.equal(approved.changes.length,4);
const SELECTORS=[
 {
  "file": "ship-master-snapshot.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog.js",
  "parts": [
   {
    "from": null,
    "to": "const HD_EQUIP_CATALOG_VIEW_KEY='harbordesk-session-equip-catalog-view-v1';\nfunction hdEquipCatalogV"
   }
  ]
 },
 {
  "file": "equipment-catalog-extra.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog-extra2.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "equipment-catalog-extra3.js",
  "parts": [
   {
    "from": null,
    "to": "hdEquipStatText=function(item){\n const parts=Object.entries(item.stats||{}).map(([k,v])=>`${k}${Numb"
   }
  ]
 },
 {
  "file": "equipment-catalog-extra4.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "ship-database.js",
  "parts": [
   {
    "from": null,
    "to": "window.HD_SHIP_MASTER_AUDIT=hdShipDbMasterAudit();\nfunction hdShipDbMapCandidates(detail){\n const te"
   },
   {
    "from": "function hdShipDbMapCandidates(detail){\n const text=[detail?.name,detail?.overview,detail?.fleet,det",
    "to": "const HD_SHIP_DB_VIEW_KEY='harbordesk-session-shipdb-view-v1';\nfunction hdShipDbViewLoad(){try{retur"
   }
  ]
 },
 {
  "file": "map-details.js",
  "parts": [
   {
    "from": null,
    "to": "\nconst HD_MAP_LEVEL_GUIDE={\n '1-1':{min:'Lv1〜',recommended:'平均Lv5〜10',note:'未改造でも攻略可能。まず操作と編成に慣れる海域。"
   }
  ]
 },
 {
  "file": "map-node-data-1.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-details-34.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-node-data-2-7.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-advanced-data.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-images.js",
  "parts": [
   {
    "from": null,
    "to": "function hdMapEsc2(s){return typeof esc==='function'?esc(s):String(s??'')}\nfunction hdMapStartLabels"
   }
  ]
 },
 {
  "file": "map-plans.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "fleet-suggester.js",
  "parts": [
   {
    "from": null,
    "to": "let hdFSPressedPointer=null,hdFSRenderPending=false,hdFSPendingPreserveLoadouts=true;\nfunction hdFSF"
   }
  ]
 },
 {
  "file": "fleet-readiness-evaluator.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',e=>{\n const fix=e.target.closest?.('[data-hd-fe-fix]');if(fix){hdF"
   }
  ]
 },
 {
  "file": "fleet-readiness-evaluator.js",
  "parts": [
   {
    "from": "const HD_FE_OASW_CONFIRM_KEY='harbordesk-oasw-confirmed-v1';\nfunction hdFEAswRoster(ship){\n const ro",
    "to": "function hdFEAswRoster(ship){\n const rows=hdFERoster(),id=Number(ship.gameShipId)||0,master=Number(s"
   },
   {
    "from": "function hdFEAswConfirmed(){try{const x=JSON.parse(localStorage.getItem(HD_FE_OASW_CONFIRM_KEY)||'{}",
    "to": "\nfunction hdFEAswNumber(value){if(value==null||String(value).trim()==='')return null;const n=Number("
   }
  ]
 },
 {
  "file": "fleet-calculator.js",
  "parts": [
   {
    "from": null,
    "to": "let hdFCRenderTimer=0;\nfunction hdFCScheduleRender(){clearTimeout(hdFCRenderTimer);hdFCRenderTimer=s"
   }
  ]
 },
 {
  "file": "fleet-loadout-planner.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',e=>{\n const gen=e.target.closest?.('[data-hd-fl-generate]'),regen="
   }
  ]
 },
 {
  "file": "fleet-loadout-optimizer.js",
  "parts": [
   {
    "from": null,
    "to": "document.addEventListener('click',function(e){\n const opt=e.target.closest&&e.target.closest('[data-"
   }
  ]
 },
 {
  "file": "map-air-data.js",
  "parts": [
   {
    "from": null,
    "to": null
   }
  ]
 },
 {
  "file": "map-air-check.js",
  "parts": [
   {
    "from": null,
    "to": "function hdMapAirSave(map,id,checked,goal){\n let all={};try{all=JSON.parse(localStorage.getItem(HD_M"
   }
  ]
 },
 {
  "file": "map-equipment-recommend.js",
  "parts": [
   {
    "from": null,
    "to": "let hdMapEquipPressedPointer=null;\nconst hdMapEquipPendingRenders=new Map();\nfunction hdMapEquipFini"
   }
  ]
 },
 {
  "file": "sortie-equipment-check.js",
  "parts": [
   {
    "from": null,
    "to": "\ndocument.addEventListener('click',e=>{\n if(e.target.closest?.('[data-hd-se-refresh]')){if(typeof hd"
   }
  ]
 },
 {
  "file": "owned-equipment-planner.js",
  "parts": [
   {
    "from": null,
    "to": "\nwindow.addEventListener('hd:land-base-changed',hdOCReviewRefresh);\n\nfunction hdOCPanel(map,fleetId="
   }
  ]
 }
];
const sourceCache=new Map(),observations={schemaVersion:1,unit:'one-five-bbv-cl2',privateNodeModelOnly:true,browserExecuted:false,sourceHashes:{},initialCounterexample:null,precedingCohortParity:[],modelCases:[],generatorInvocations:[]};let unsafeMutation=false;
if(process.env.HD15_BBV_CL2_PRIVATE_OBSERVATIONS)process.on('exit',()=>fs.writeFileSync(process.env.HD15_BBV_CL2_PRIVATE_OBSERVATIONS,JSON.stringify(observations,null,2)+'\n'));
function source(file,role){const key=role+':'+file;if(sourceCache.has(key))return sourceCache.get(key);let value=fs.readFileSync(path.join(ROOT,file),'utf8');const rule=approved.files[file];if(rule){assert.equal(hash(value),rule.approvedAfterSHA256,file+' approved current bytes');if(role==='before'){for(const change of approved.changes.filter(x=>x.file===file).reverse()){assert.equal(value.split(change.after).length,2,file+' inverse unique');value=value.replace(change.after,change.before)}assert.equal(hash(value),rule.beforeSHA256,file+' exact preceding CL1DD2 bytes restored')}}sourceCache.set(key,value);(observations.sourceHashes[role]??={})[file]=hash(value);return value}
function slice(text,selector){const locate=anchor=>{assert.equal(text.split(anchor).length,2,'module boundary unique');return text.indexOf(anchor)},a=selector.from===null?0:locate(selector.from),b=selector.to===null?text.length:locate(selector.to);assert.ok(b>a);return text.slice(a,b)}
function context(role='after'){
 assert.ok(['before','after'].includes(role));const store=new Map(),writes=[],reads=[];
 const storage={getItem:key=>{key=String(key);reads.push(key);return store.has(key)?store.get(key):null},setItem(key){writes.push(String(key));unsafeMutation=true;throw Error('model must not write Storage')},removeItem(){unsafeMutation=true;throw Error('model must not remove Storage')},clear(){unsafeMutation=true;throw Error('model must not clear Storage')}};
 class UnitDate extends Date{constructor(...args){super(...(args.length?args:[1700000000000]))}static now(){return 1700000000000}}
 const c={localStorage:storage,MAP_DETAILS:{},HD_NODE_DETAIL_OVERRIDES:{},console,URL,Date:UnitDate,Math,Map,Set,WeakMap,WeakSet,performance:{timeOrigin:1700000000000,now:()=>0},setTimeout(){throw Error('unexpected unit timer')},setInterval(){throw Error('unexpected unit interval')},document:new Proxy({},{get(_target,key){throw Error('unexpected model DOM access '+String(key))}})};c.window=c;c.addEventListener=()=>{throw Error('unexpected UI listener initialization')};c.dispatchEvent=()=>{throw Error('unexpected UI dispatch')};vm.createContext(c);
 for(const module of SELECTORS){const text=source(module.file,role),code=module.parts.map(s=>slice(text,s)).join('');vm.runInContext(code,c,{filename:role+':'+module.file+'#actual-model'})}
 for(const name of ['hdOCBuild','hdOCMeasure','hdOCSearchSteps','hdFERoute','hdFEEquipmentRequirements','hdSECapabilityMeasure','hdSECapabilityStock','hdShipDbSlotProfile','hdShipDbEquipCompatible'])assert.equal(typeof c[name],'function',name+' actual source loaded');if(role==='after')assert.equal(typeof c.hdFEOneFiveAlternateExample,'function');
 return {role,c,store,writes,reads,value:expr=>vm.runInContext(expr,c)};
}
function prepare(role='after',fixture=input,state='known'){
 assert.equal(unsafeMutation,false,'no further generator/model work after a detected input mutation');const h=context(role),{c,store}=h,config=fixture[state],unknown=state==='unknown',id='node-one-five-bbv-cl2-'+state;
 const rows=fixture.ships.map((expected,i)=>{const missing=unknown&&i===fixture.unknown.replaceShipIndex,name=missing?fixture.unknown.name:expected.name,db=c.hdFEFindShip(name),master=db&&c.hdShipDbMasterRowFor(db),profile=db&&c.hdShipDbSlotProfile(db);if(missing){assert.equal(db,null);assert.equal(profile,null)}else{assert.equal(master.id,expected.masterId);assert.equal(master.stype,expected.stype);assert.equal(master.type,expected.type);assert.equal(master.speed,expected.baseSpeed);assert.equal(exact(host(profile.slots),expected.normalSlots),true,'declared normal slots exact')}
  return {id:id+'-'+i,name,masterId:master?.id||0,gameShipId:150100+i,level:fixture.level,gameSlotEx:0,gameGearSlots:missing?[fixture.unknown.gear]:Array.from({length:profile.count},()=>''),gameGearExpansion:'',metadata:{keep:i,nested:{keep:['first','second']}}};});
 const preset=host(h.value("MAP_PLANS['1-5'].presets[1]")),fleet={id,name:'synthetic one-five '+state,memo:'keep memo',openingAswCount:0,routePreset:preset,metadata:{keep:true,nested:{order:['first','second']}},ships:rows.map((row,i)=>({ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,rosterId:row.id,gear:unknown&&i===fixture.unknown.replaceShipIndex?fixture.unknown.gear:'',metadata:{keep:i,nested:{keep:['first','second']}}}))};
 const seed=(key,value)=>store.set(key,JSON.stringify(value));seed('harbordesk-ship-roster-v1',rows);seed('harbordesk-equipment-v1',config.finiteInventory);seed('harbordesk-kancolle-sync-v1',{admiralLevel:fixture.hq,metadata:{keep:true}});seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(x=>({gameShipId:x.gameShipId,gearKnown:true}))}]);seed('harbordesk-opening-asw-targets-v1',{'1-1:unrelated:0':6});seed('harbordesk-night-ci-policy-v1',{'1-5':'auto'});seed('harbordesk-custom-fleets-v1',{'1-5':[fleet,{id:'other-same-map',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
 const ctx={map:'1-5',index:1,preset,fleet},storeBefore=JSON.stringify([...store]),fleetBefore=JSON.stringify(fleet),built=c.hdOCBuild(ctx);assert.equal(built.plan.openingAswCount,0);return {...h,fixture,state,ctx,fleet,built,storeBefore,fleetBefore};
}
function unchanged(h){const sameStore=JSON.stringify([...h.store])===h.storeBefore,sameFleet=JSON.stringify(h.fleet)===h.fleetBefore;if(!sameStore||!sameFleet||h.writes.length)unsafeMutation=true;assert.equal(sameStore,true,'all backing source strings retained exactly (body omitted)');assert.equal(sameFleet,true,'original synthetic fleet retained exactly (body omitted)');assert.equal(h.writes.length,0)}
const goalProjection=sample=>sample.measure.goals.map(g=>({kind:g.kind,count:g.count??null,minCount:g.minCount??null,ok:g.ok??null,unresolved:!!g.unresolved,purpose:g.purpose??null}));
function initial(h){const rows=h.c.hdSEChecks('1-5').rows,requirements=h.c.hdFEEquipmentRequirements(h.built.plan,rows),measure=h.c.hdOCMeasure(h.built.plan,rows,h.built.unknown),reviews=h.c.hdOCReview(h.built.plan,measure),readiness=h.c.hdOCReadiness(h.built.plan,measure,reviews);unchanged(h);return {rows,requirements,measure,readiness,route:h.c.hdFERoute(h.built.plan)}}
function permutation(values){if(!values.length)return [[]];return values.flatMap((x,i)=>permutation(values.filter((_,j)=>i!==j)).map(rest=>[x,...rest]))}
const TYPES={BBV:'航空戦艦',CL:'軽巡洋艦',DD:'駆逐艦',DE:'海防艦',BB:'戦艦',FBB:'戦艦',CV:'正規空母',CVB:'装甲空母',SS:'潜水艦',SSV:'潜水空母',AS:'潜水母艦',AO:'補給艦',CVL:'軽空母',CT:'練習巡洋艦',CLT:'重雷装巡洋艦',CAV:'航空巡洋艦'};
function withNormalizedFleet(h,codes,fn){const c=h.c,oldFind=c.hdFEFindShip,oldShips=c.hdFERouteShips,base=host(h.built.plan),dictionary={};base.ships=codes.map((code,i)=>({ship:'literal-'+code+'-'+i,items:[],metadata:{keep:i}}));const rows=base.ships.map((ship,i)=>{const code=codes[i],type=TYPES[code]||'';if(type)dictionary[ship.ship]={name:ship.ship,type};return {ship,type,typeKnown:!!type,speedInfo:{known:!!type,rank:code==='BB'||code==='BBV'?5:10,base:code==='BB'||code==='BBV'?5:10,group:type?'literal-known':''}}});
 c.hdFEFindShip=name=>dictionary[name]||null;c.hdFERouteShips=()=>rows;try{return fn(base,rows)}finally{c.hdFEFindShip=oldFind;c.hdFERouteShips=oldShips}}

test('1-5 CL2 approved source restores and replays exact preceding reviewed bytes with four unique anchors',()=>{
 assert.equal(approved.changes.length,4);for(const [file,rule]of Object.entries(approved.files)){const after=source(file,'after'),before=source(file,'before');assert.equal(hash(after),rule.approvedAfterSHA256);assert.equal(hash(before),rule.beforeSHA256);let replay=before;for(const row of approved.changes.filter(x=>x.file===file)){assert.equal(replay.split(row.before).length,2,file+' unique replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay,after,file+' full exact replay')}
});

test('1-5 CL2 pure helper accepts exact four known BBV1CL2DD1 permutations and retains preceding CL1DD2 only',()=>{
 const h=prepare(),{c}=h,data=host(c.hdFERouteRequirementData(h.built.plan)),readCount=h.reads.length;let calls=0;
 withNormalizedFleet(h,['BBV','CL','CL','DD'],plan=>{const before=JSON.stringify([plan,data]);for(const order of permutation([0,1,2,3])){const p={...plan,ships:order.map(i=>plan.ships[i])};assert.equal(c.hdFEOneFiveAlternateExample(p,data),true);calls++}assert.equal(JSON.stringify([plan,data]),before);const blanks={...plan,ships:[...plan.ships,{ship:'',masterId:0,gear:''},{ship:'',masterId:0,gear:''}]};assert.equal(c.hdFEOneFiveAlternateExample(blanks,data),true,'editor pure blanks do not add real hulls');for(const d of [{...data,map:'1-6'},{...data,index:0},{...data,index:'1'},{...data,path:'ADEJ'}])assert.equal(c.hdFEOneFiveAlternateExample(plan,d),false);assert.equal(c.hdFEOneFiveAlternateExample({...plan,map:'1-6'},data),false);assert.equal(c.hdFEOneFiveAlternateExample({...plan,preservationIssues:[{kind:'source-unknown'}]},data),false)});
 withNormalizedFleet(h,['BBV','CL','DD','DD'],plan=>assert.equal(c.hdFEOneFiveAlternateExample(plan,data),true,'preceding known CL1DD2 remains supported'));
 for(const codes of [['BBV','DD','DD','DD'],['CL','CL','DD','DD'],['BBV','CT','CL','DD'],['BBV','CLT','CL','DD'],['BBV','CAV','CL','DD'],['BBV','CL','CL'],['BBV','CL','CL','DD','DD'],['BBV','CL','CL','UNKNOWN'],['BBV','CL','CL','CL'],['AS','CL','CL','DD'],['SSV','CL','CL','DD']])withNormalizedFleet(h,codes,plan=>assert.equal(c.hdFEOneFiveAlternateExample(plan,data),false));
 assert.equal(calls,24);assert.equal(h.reads.length,readCount,'pure helper adds no Storage read');unchanged(h);
});

test('1-5 CL2 literal routing boundaries preserve D F G priority and known blockers without broadening other families',()=>{
 const before=prepare('before'),after=prepare('after'),cases=[
  {codes:['BBV','DD','DD','DD'],expected:'ready'},
  {codes:['BBV','CL','DD','DD'],expected:'ready'},
  {codes:['BBV','CL','CL','DD'],expected:'ready',changed:true},
  {codes:['CL','DD','BBV','CL'],expected:'ready',changed:true},
  {codes:['BB','CL','CL','DD'],expected:'missing'},{codes:['FBB','CL','CL','DD'],expected:'missing'},
  {codes:['CV','CL','CL','DD'],expected:'missing'},{codes:['CVB','CL','CL','DD'],expected:'missing'},
  {codes:['SS','CL','CL','DD'],expected:'missing'},{codes:['SSV','CL','CL','DD'],expected:'missing'},
  {codes:['BBV','CL','CL','UNKNOWN'],expected:'manual'},{codes:['BB','CL','DD','UNKNOWN'],expected:'missing'},
  {codes:['AO','DD','DD','DD'],notReady:true},{codes:['AO','SS','DD','DD'],expected:'missing'},
  {codes:['DE','DE','DE','DE'],expected:'missing'},{codes:['CVL','CVL','DD','DD'],expected:'missing'},
  {codes:['BBV','CL','CL','CL'],expected:'missing'},
  {codes:['CL','CL','DD','DD'],expected:'manual'},{codes:['AS','CL','CL','DD'],expected:'manual'},
  {codes:['BBV','CT','CL','DD'],expected:'manual'},{codes:['BBV','CLT','CL','DD'],expected:'manual'},{codes:['BBV','CAV','CL','DD'],expected:'manual'},
  {codes:['BBV','CL','CL','DD','DD'],expected:'missing'}];
 for(const row of cases){const a=withNormalizedFleet(after,row.codes,p=>host(after.c.hdFERoute(p))),b=withNormalizedFleet(before,row.codes,p=>host(before.c.hdFERoute(p)));if(row.notReady)assert.ok(!['ready','partial'].includes(a.status));else assert.equal(a.status,row.expected,JSON.stringify(row.codes));if(row.changed){assert.equal(b.status,'manual');assert.equal(a.contract.status,'ready')}else assert.equal(exact(a,b),true,'unchanged whole route output for '+row.codes.join('/'))}
 unchanged(before);unchanged(after);
});

test('1-5 explicit route info boundaries and absent info retain previous constraints without inferred intent',()=>{
 const before=prepare('before'),after=prepare('after'),keys=['text','requirements','total','conditionManual','speedRequired','flagship'];
 for(const where of ['routeInfo','suggestion'])for(const key of keys){const run=h=>{const p=host(h.built.plan),info=host(h.value("hdFSPresetInfo(MAP_PLANS['1-5'].presets[1])"));if(key==='text')info.text+=' / explicit user';if(key==='requirements')info.requirements=[{token:'駆逐艦',count:4}];if(key==='total')info.total=5;if(key==='conditionManual')info.conditionManual=true;if(key==='speedRequired')info.speedRequired=10;if(key==='flagship')info.flagship='駆逐艦';if(where==='routeInfo')p.routeInfo=info;else p.suggestion={...(p.suggestion||{}),info};const inputBefore=JSON.stringify(p),r=host(h.c.hdFERoute(p));assert.equal(JSON.stringify(p),inputBefore,'custom definition is read-only');return r};const b=run(before),a=run(after);assert.equal(exact(a,b),true,where+'/'+key+' legacy whole output');assert.notEqual(a.status,'ready',where+'/'+key+' not bypassed')}
 const runAbsent=h=>{const p=host(h.built.plan);delete p.routeInfo;if(p.suggestion)delete p.suggestion.info;return host(h.c.hdFERoute(p))};assert.equal(exact(runAbsent(before),runAbsent(after)),true,'both absent info projections keep old output');unchanged(before);unchanged(after);
});

test('1-5 explicit combat goal quantities origin purpose and metadata remain user strategy inputs',()=>{
 const b=prepare('before'),h=prepare('after'),rows=[{kind:'cap-asw',baseKind:'対潜',minCount:5,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-asw'}},{kind:'cap-water-attack',baseKind:'航空攻撃',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-water'}}],inputBefore=JSON.stringify(rows),prior=b.c.hdFEEquipmentRequirements(b.built.plan,host(rows)),requirements=h.c.hdFEEquipmentRequirements(h.built.plan,rows);
 assert.equal(h.c.hdFEEquipmentRequirements.toString(),b.c.hdFEEquipmentRequirements.toString(),'the existing normalization function source is unchanged');assert.equal(exact(host(requirements),host(prior)),true,'whole old/current normalized requirements stay exact');assert.equal(JSON.stringify(rows),inputBefore,'explicit input objects remain exact');
 for(const row of rows){const actual=requirements.find(x=>x.kind===row.kind);assert.ok(actual);for(const key of Object.keys(row)){assert.equal(Object.hasOwn(actual,key),true,'all explicit property presence retained');assert.equal(exact(host(actual[key]),row[key]),true,'every explicit value retained including quantity origin purpose metadata')}}
 const asw=host(requirements.find(x=>x.kind==='cap-asw')),water=host(requirements.find(x=>x.kind==='cap-water-attack'));assert.deepEqual(asw,{...rows[0],label:'対潜シナジー'},'unchanged registered ASW descriptor supplies its exact default label');assert.deepEqual(water,rows[1],'explicit water descriptor has no new normalization');assert.equal(Object.hasOwn(rows[0],'label'),false,'input did not already supply the default label');
 const measure=h.c.hdOCMeasure(h.built.plan,rows,h.built.unknown);for(const [kind,n]of [['cap-asw',5],['cap-water-attack',2]])assert.deepEqual(host(measure.goals.filter(x=>x.kind===kind).map(x=>({kind:x.kind,minCount:x.minCount,purpose:x.purpose}))),[{kind,minCount:n,purpose:'strategy'}]);assert.equal(h.c.hdFERoute(h.built.plan).status,'ready');unchanged(b);unchanged(h);
});

test('1-5 actual CL159 and CL160 normal slots permit separate sonar projector frames but never borrow water aircraft',()=>{
 const h=prepare(),{c}=h,sonar=c.hdFEFind('三式水中探信儀'),projector=c.hdFEFind('三式爆雷投射機'),water=c.hdFEFind('瑞雲');
 for(const [si,name,id]of [[1,'神通改二',159],[2,'那珂改二',160]]){const db=c.hdFEFindShip(name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);assert.equal(master.id,id);assert.equal(master.stype,3);assert.equal(master.type,'軽巡洋艦');assert.equal(master.speed,10);assert.deepEqual(host(profile.slots),[1,1,1]);assert.equal(profile.count,3);for(const item of [sonar,projector]){assert.equal(c.hdShipDbEquipCompatible(item,db),true);for(const index of [0,1,2])assert.equal(c.hdOCCompatible({si,index,db,profile,capacity:profile.slots[index]},{item,star:0}),true)}assert.equal(c.hdShipDbEquipCompatible(water,db),false)}
 const waterTargets=host(c.hdOCSixThreeWaterTargets(h.built.plan,{kind:'cap-water-attack',generatedFromMap:true,purpose:'recommendation'}));assert.deepEqual(waterTargets.map(x=>({ship:x.ship,count:x.count,status:x.status,slots:x.slots.map(s=>s.index)})),[{ship:'扶桑改二',count:1,status:'candidate',slots:[0,1,2,3]}]);unchanged(h);
});

test('1-5 alternate same-input preceding route and water-card manual become current ready and optional target one',()=>{
 const b=prepare('before'),a=prepare('after'),x=initial(b),y=initial(a),oldHTML=b.c.hdSECapabilityHtml('1-5',b.fleet.id,b.built.plan,b.ctx.preset),html=a.c.hdSECapabilityHtml('1-5',a.fleet.id,a.built.plan,a.ctx.preset);assert.equal(x.route.status,'manual');assert.equal(y.route.status,'ready');const card=text=>text.match(/<article[^>]*data-hd-se-capability="cap-water-attack"[\s\S]*?<\/article>/)?.[0]||'';assert.ok(card(oldHTML));assert.match(card(oldHTML),/manual/);assert.doesNotMatch(card(oldHTML),/data-hd-se-target-count=/);assert.match(card(html),/data-hd-se-target-count="1"/);assert.match(html,/航空戦艦1＋軽巡2＋駆逐1/);assert.match(html,/通行必須・先制対潜人数/);assert.equal(exact(x.requirements,y.requirements),true,'existing optional requirement objects unchanged');assert.deepEqual(host(y.requirements.filter(g=>['cap-asw','cap-water-attack'].includes(g.kind)).map(g=>[g.kind,g.minCount])),[['cap-asw',3],['cap-water-attack',1]]);assert.equal(y.measure.goals.some(g=>g.kind==='opening-asw'),false);observations.initialCounterexample={before:{route:x.route.status,waterTarget:null},after:{route:y.route.status,waterTarget:1},requirementsDirectEqual:true,sourceStringsExact:true};unchanged(b);unchanged(a);
});

test('1-5 both preceding canonical and CL1DD2 cohorts retain whole build measure route known card and explicit goal normalization',()=>{
 const explicit=[{kind:'cap-asw',baseKind:'対潜',minCount:5,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-asw'}},{kind:'cap-water-attack',baseKind:'航空攻撃',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-water'}}];
 for(const [cohort,fixture]of [['canonical',canonicalInput],['preceding-CL1DD2',priorInput]])for(const state of ['known','stock','unknown']){const b=prepare('before',fixture,state),a=prepare('after',fixture,state),x=initial(b),y=initial(a);assert.equal(exact(host(b.built),host(a.built)),true,cohort+'/'+state+' build whole object exact');assert.equal(exact(host(x),host(y)),true,cohort+'/'+state+' measure/readiness/route whole object exact');if(state!=='unknown')assert.equal(a.c.hdSECapabilityHtml('1-5',a.fleet.id,a.built.plan,a.ctx.preset),b.c.hdSECapabilityHtml('1-5',b.fleet.id,b.built.plan,b.ctx.preset),cohort+'/'+state+' known card exact');
  const oldRequirements=host(b.c.hdFEEquipmentRequirements(b.built.plan,host(explicit))),newRequirements=host(a.c.hdFEEquipmentRequirements(a.built.plan,host(explicit)));assert.equal(exact(oldRequirements,newRequirements),true,cohort+'/'+state+' explicit normalization whole exact');assert.deepEqual(newRequirements,[{...explicit[0],label:'対潜シナジー'},explicit[1]]);for(const name of ['hdOCBuild','hdOCMeasure','hdOCSearchSteps','hdFEEquipmentRequirements'])assert.equal(a.c[name].toString(),b.c[name].toString(),name+' implementation unchanged');
  observations.precedingCohortParity.push({cohort,state,buildWholeDirectExact:true,measureReadinessRouteWholeDirectExact:true,knownCardExact:state==='unknown'?null:true,explicitNormalizedRequirementsWholeDirectExact:true,searchImplementationExact:true,generatorInvocations:0});unchanged(b);unchanged(a)}
});

test('1-5 independent seven-item normal-slot layout establishes existing optional model feasibility without enumeration',()=>{
 const h=prepare(),{c}=h,p=host(h.built.plan);p.ships=p.ships.map((ship,i)=>({...ship,items:i===0?[{name:'瑞雲',slotIndex:3,star:0,capacity:23}]:[{name:'三式水中探信儀',slotIndex:0,star:0,capacity:h.fixture.ships[i].normalSlots[0]},{name:'三式爆雷投射機',slotIndex:1,star:0,capacity:h.fixture.ships[i].normalSlots[1]}]}));let count=0;for(const ship of p.ships){const db=c.hdFEFindShip(ship.ship),profile=c.hdShipDbSlotProfile(db);const used=new Set();for(const item of ship.items){assert.equal(used.has(item.slotIndex),false);used.add(item.slotIndex);assert.equal(c.hdShipDbEquipCompatible(c.hdFEFind(item.name),db),true);assert.equal(c.hdShipDbSlotRejects(profile,item.slotIndex,c.hdFEFind(item.name)),false);count++}}assert.equal(count,7);assert.equal(c.hdSECapabilityMeasure(p,'cap-asw').count,3);assert.equal(c.hdSECapabilityMeasure(p,'cap-water-attack').count,1);const measure=c.hdOCMeasure(p,c.hdSEChecks('1-5').rows);assert.equal(c.hdFERoute(p).status,'ready');for(const g of measure.goals.filter(g=>['cap-asw','cap-water-attack'].includes(g.kind)))assert.equal(g.purpose,'recommendation');assert.equal(measure.complete,true);unchanged(h);
});


test('1-5 CL2 shortage guidance separates finite stock legal two-CL frames slot competition and unknown profiles',()=>{
 const h=prepare('after',input,'stock'),{c}=h,plan=h.built.plan,goal={kind:'cap-asw',generatedFromMap:true,purpose:'recommendation'},stock=c.hdSECapabilityStock(plan,'cap-asw',3),targets=host(c.hdOCFourOneAswTargets(plan,goal,stock));assert.deepEqual(host(stock.parts.map(x=>({part:x.part,need:x.need,have:x.have}))),[{part:'sonar',need:3,have:3},{part:'projector',need:3,have:2}]);assert.deepEqual(targets.map(x=>x.ship),input.ships.map(x=>x.name));
 const originalProfile=c.hdShipDbSlotProfile;
 for(const [si,name]of [[1,'神通改二'],[2,'那珂改二']]){const cl=targets[si];assert.equal(cl.ship,name);assert.equal(cl.status,'candidate');assert.deepEqual(cl.parts.map(x=>({part:x.part,count:x.count,slots:x.slots.map(s=>s.index)})),[{part:'sonar',count:1,slots:[0,1,2]},{part:'projector',count:1,slots:[0,1,2]}]);for(const part of cl.parts)for(const slot of part.slots)for(const itemName of slot.candidates)assert.equal(c.hdOCCompatible({si,index:slot.index,db:c.hdFEFindShip(name),profile:originalProfile(c.hdFEFindShip(name)),capacity:input.ships[si].normalSlots[slot.index]},{item:c.hdFEFind(itemName),star:0}),true);assert.equal(cl.parts[0].slots.some(a=>cl.parts[1].slots.some(b=>a.index!==b.index)),true);
  try{c.hdShipDbSlotProfile=db=>{const p=originalProfile(db);return db?.name===name||db?.final===name?{...p,count:1,slots:[1]}:p};assert.equal(host(c.hdOCFourOneAswTargets(plan,goal,stock)).some(x=>x.ship===name),false,'two parts cannot share one normal frame');c.hdShipDbSlotProfile=db=>db?.name===name||db?.final===name?null:originalProfile(db);assert.deepEqual(host(c.hdOCFourOneAswTargets(plan,goal,stock)).find(x=>x.ship===name),{ship:name,shipIndex:si,status:'manual',parts:[]})}finally{c.hdShipDbSlotProfile=originalProfile}
 }
 try{c.hdShipDbSlotProfile=db=>{const p=originalProfile(db);return db?.name==='扶桑改二'||db?.final==='扶桑改二'?{...p,count:4,slots:[NaN,0,0,0]}:p};const html=c.hdSECapabilityHtml('1-5',h.fleet.id,plan,h.ctx.preset),at=html.indexOf('data-hd-se-capability="cap-water-attack"'),start=html.lastIndexOf('<article',at),end=html.indexOf('</article>',at);assert.ok(at>=0&&start>=0&&end>at);const card=html.slice(start,end+10);assert.match(card,/manual/);assert.doesNotMatch(card,/data-hd-se-target-count=/);assert.match(card,/対応済みの四隻例/);assert.match(card,/航空戦艦1＋軽巡2＋駆逐1/);assert.match(card,/数量は未判定/);assert.doesNotMatch(card,/元の航空戦艦1＋駆逐3の範囲/);const waterTargets=host(c.hdOCSixThreeWaterTargets(plan,{kind:'cap-water-attack',generatedFromMap:true,purpose:'recommendation'}));assert.deepEqual(waterTargets.map(x=>({ship:x.ship,status:x.status,unknownSlots:x.unknownSlots,slots:x.slots})),[{ship:'扶桑改二',status:'manual',unknownSlots:true,slots:[]}])}finally{c.hdShipDbSlotProfile=originalProfile}unchanged(h);
});

function classify(h,plan){
 const {c}=h,occupied=new Set(),unregisteredRows=[];let registered=0,unregistered=0;
 for(const [shipIndex,ship]of plan.ships.entries()){
  const db=c.hdFEFindShip(ship.ship),profile=db&&c.hdShipDbSlotProfile(db);
  if(!profile){assert.equal(ship.ship,h.fixture.unknown.name);assert.equal((ship.items||[]).filter(item=>item.name).length,0,'an unknown hull receives no assumed legal normal frame');continue}
  assert.equal(Number.isInteger(profile.count)&&profile.count>=0,true);
  for(const item of ship.items||[]){if(!item.name)continue;const slotKey=shipIndex+':'+item.slotIndex;assert.equal(occupied.has(slotKey),false);occupied.add(slotKey);assert.ok(item.slotIndex>=0&&item.slotIndex<profile.count);const meta=c.hdFEFind(item.name);
   if(!meta){assert.equal(item.name,h.fixture.unknown.gear);assert.equal(Number(item.star)||0,0);assert.equal(c.hdFLCatalog().some(row=>row.name===item.name),false);unregistered++;unregisteredRows.push({ship:ship.ship,name:item.name});continue}
   assert.equal(c.hdShipDbEquipCompatible(meta,db),true);assert.equal(c.hdShipDbSlotRejects(profile,item.slotIndex,meta),false);assert.equal(c.hdOCCompatible({si:shipIndex,index:item.slotIndex,db,profile,capacity:profile.slots[item.slotIndex]},{item:meta,star:0}),true);if(h.value('HD_FE_AIR_CATS').has(meta.category))assert.ok(profile.slots[item.slotIndex]>0);registered++;
  }
 }
 const usage=c.hdFOAssignedUsage(plan),inv=c.hdFLInventory();for(const [key,value]of Object.entries(usage))assert.ok(value<=(inv.get(key)?.count||0));assert.equal(Object.values(usage).reduce((n,value)=>n+value,0),registered+unregistered,'all actual assignments accounted for');assert.ok(unregistered<=1);
 const master=c.hdFEMasterValidation(plan);assert.deepEqual(host(master.invalid),[],'registered assignments remain legal');for(const row of unregisteredRows)assert.ok(master.unresolved.some(issue=>issue.ship===row.ship&&issue.name===row.name),'each unregistered item remains unresolved on its actual ship');
 return {registered,unregistered,usage:host(usage)};
}
function search(h){assert.equal(unsafeMutation,false);observations.generatorInvocations.push(h.role+'/new-CL2DD1/'+h.state);const iterator=h.c.hdOCSearchSteps(h.ctx);let yields=0,result;for(;;){const step=h.c.hdFEWithShipLookup(()=>iterator.next());if(step.done){result=step.value;break}yields++}unchanged(h);return {result,yields,allocation:classify(h,result.plan)}}

for(const state of ['known','stock','unknown'])test('1-5 alternate actual '+state+' model retains finite legality expected goals and explicit termination',()=>{
 const h=prepare('after',input,state),x=initial(h),run=search(h),r=run.result;observations.modelCases.push({state,initial:{route:host(x.route),requirements:host(x.requirements),measure:host(x.measure),readiness:host(x.readiness)},searched:{result:host(r),yields:run.yields,allocation:run.allocation},sourceStringsDirectExact:true,modelStorageWrites:0});
 for(const [phase,sample]of [['initial',x],['searched',{route:h.c.hdFERoute(r.plan),measure:r.measure}]]){const expected=input.modelExpectation[state][phase];assert.deepEqual(host(goalProjection(sample)),expected.goals,state+'/'+phase+' independent model goal expectation');assert.equal(sample.route.status,expected.route);assert.equal(sample.measure.complete,expected.measureComplete)}
 assert.deepEqual(host(x.requirements.map(g=>({kind:g.kind,minCount:g.minCount??null,generatedFromMap:g.generatedFromMap===true}))),input.modelExpectation[state].initial.requirements);assert.equal(r.readiness.status,input.modelExpectation[state].searched.readiness);assert.equal(r.readiness.registeredReady,input.modelExpectation[state].searched.registeredReady);assert.equal(r.search.status,input.modelExpectation[state].searched.searchStatus);assert.equal(r.search.maxExamined,10000);assert.equal(r.search.maxDepth,24);assert.equal(r.search.exhaustive,false);assert.equal(r.search.portSeed.maxOperations,800);assert.ok(r.search.reasons.length>0);assert.equal(r.plan.openingAswCount,0);assert.equal(r.measure.goals.some(g=>g.kind==='opening-asw'),false);assert.equal(h.c.hdFERoute(r.plan).status,state==='unknown'?'manual':'ready');assert.equal(run.allocation.registered,input.modelExpectation[state].searched.assignedRegistered);assert.equal(run.allocation.unregistered,input.modelExpectation[state].searched.assignedUnregistered);if(state==='known'){for(const [si,name]of [[1,'神通改二'],[2,'那珂改二'],[3,'夕立改二']]){assert.equal(r.plan.ships[si].ship,name);assert.deepEqual(host(r.plan.ships[si].items.filter(x=>x.name).map(x=>x.name).sort()),['三式水中探信儀','三式爆雷投射機'].sort())}}if(state==='unknown'){assert.ok(r.plan.preservationIssues.length);assert.equal(r.readiness.registeredReady,false)}unchanged(h);
});
