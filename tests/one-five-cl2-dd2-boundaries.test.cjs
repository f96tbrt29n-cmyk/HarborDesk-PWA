'use strict';
// Actual source modules in a pure Node VM. Fixed clocks here are unit-test inputs;
// the browser clock, waits, search caps and product source are never wrapped.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(process.env.HD15CL2DD2_SOURCE_ROOT||path.join(__dirname,'..')),INVERSE=path.join(ROOT,'tests/fixtures/one-five-cl2-dd2-approved-source-inverses.json'),INPUT=path.resolve(process.env.HD15CL2DD2_INPUT_FIXTURE||path.join(ROOT,'tests/fixtures/one-five-cl2-dd2-browser-inputs.json'));
const input=JSON.parse(fs.readFileSync(INPUT,'utf8')),canonicalInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-middle-browser-inputs.json'),'utf8')),priorInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-bbv-cl-browser-inputs.json'),'utf8')),priorCl2Input=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-bbv-cl2-browser-inputs.json'),'utf8')),approvedBytes=fs.readFileSync(INVERSE),approved=JSON.parse(approvedBytes),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),host=x=>JSON.parse(JSON.stringify(x)),exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
assert.equal(hash(approvedBytes),'2b76f08019873f5a5d4f201ccac93dbcfb697991839cb4ea4586923cd6f61a6f');assert.equal(approved.schemaVersion,1);assert.equal(approved.files['fleet-readiness-evaluator.js'].beforeSHA256,'d131894743074264faf9e083ee432123aa6a9959a7c5484d9f1d8a6d247a224b');assert.equal(approved.files['sortie-equipment-check.js'].beforeSHA256,'9eb644b4d5ba6efbeb23dcdb9e6ebe43e12563a09a105ec69b88c24bf3529b79');assert.equal(approved.changes.length,4);
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
    "to": "function hdFEOpeningAswHtml(ship,scope='',attrs='',remedies=''){"
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
const sourceCache=new Map(),observations={schemaVersion:1,unit:'one-five-cl2-dd2',privateNodeModelOnly:true,browserExecuted:false,sourceHashes:{},initialCounterexample:null,precedingCohortParity:[],modelCases:[],generatorInvocations:[]};let unsafeMutation=false;
if(process.env.HD15_CL2_DD2_PRIVATE_OBSERVATIONS)process.on('exit',()=>fs.writeFileSync(process.env.HD15_CL2_DD2_PRIVATE_OBSERVATIONS,JSON.stringify(observations,null,2)+'\n'));
function source(file,role){const key=role+':'+file;if(sourceCache.has(key))return sourceCache.get(key);let value=fs.readFileSync(path.join(ROOT,file),'utf8');const rule=approved.files[file];if(rule){assert.equal(hash(value),rule.approvedAfterSHA256,file+' approved current bytes');if(role==='before'){for(const change of approved.changes.filter(x=>x.file===file).reverse()){assert.equal(value.split(change.after).length,2,file+' inverse unique');value=value.replace(change.after,change.before)}assert.equal(hash(value),rule.beforeSHA256,file+' exact preceding BBV three-cohort bytes restored')}}sourceCache.set(key,value);(observations.sourceHashes[role]??={})[file]=hash(value);return value}
function slice(text,selector){const locate=anchor=>{assert.equal(text.split(anchor).length,2,'module boundary unique');return text.indexOf(anchor)},a=selector.from===null?0:locate(selector.from),b=selector.to===null?text.length:locate(selector.to);assert.ok(b>a);return text.slice(a,b)}
function context(role='after'){
 assert.ok(['before','after'].includes(role));const store=new Map(),writes=[],reads=[];
 const storage={getItem:key=>{key=String(key);reads.push(key);return store.has(key)?store.get(key):null},setItem(key){writes.push(String(key));unsafeMutation=true;throw Error('model must not write Storage')},removeItem(){unsafeMutation=true;throw Error('model must not remove Storage')},clear(){unsafeMutation=true;throw Error('model must not clear Storage')}};
 class UnitDate extends Date{constructor(...args){super(...(args.length?args:[1700000000000]))}static now(){return 1700000000000}}
 const c={localStorage:storage,MAP_DETAILS:{},HD_NODE_DETAIL_OVERRIDES:{},console,URL,Date:UnitDate,Math,Map,Set,WeakMap,WeakSet,performance:{timeOrigin:1700000000000,now:()=>0},setTimeout(){throw Error('unexpected unit timer')},setInterval(){throw Error('unexpected unit interval')},document:new Proxy({},{get(_target,key){throw Error('unexpected model DOM access '+String(key))}})};c.window=c;c.addEventListener=()=>{throw Error('unexpected UI listener initialization')};c.dispatchEvent=()=>{throw Error('unexpected UI dispatch')};vm.createContext(c);
 for(const module of SELECTORS){const text=source(module.file,role),code=module.parts.map(s=>slice(text,s)).join('');vm.runInContext(code,c,{filename:role+':'+module.file+'#actual-model'})}
 for(const name of ['hdOCBuild','hdOCMeasure','hdOCSearchSteps','hdFERoute','hdFEEquipmentRequirements','hdSECapabilityMeasure','hdSECapabilityStock','hdShipDbSlotProfile','hdShipDbEquipCompatible'])assert.equal(typeof c[name],'function',name+' actual source loaded');if(role==='after'){assert.equal(typeof c.hdFEOneFiveAlternateExample,'function');assert.equal(typeof c.hdFEOneFiveLightExample,'function')}
 return {role,c,store,writes,reads,value:expr=>vm.runInContext(expr,c)};
}
function prepare(role='after',fixture=input,state='known'){
 assert.equal(unsafeMutation,false,'no further generator/model work after a detected input mutation');const h=context(role),{c,store}=h,config=fixture[state],unknown=state==='unknown',id='node-one-five-cl2-dd2-'+state;
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

test('1-5 CL2DD2 approved source restores and replays exact preceding BBV scope with four unique anchors',()=>{
 assert.equal(approved.changes.length,4);for(const [file,rule]of Object.entries(approved.files)){const after=source(file,'after'),before=source(file,'before');assert.equal(hash(after),rule.approvedAfterSHA256);assert.equal(hash(before),rule.beforeSHA256);let replay=before;for(const row of approved.changes.filter(x=>x.file===file)){assert.equal(replay.split(row.before).length,2,file+' unique replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay,after,file+' full exact replay')}
});

test('1-5 CL2DD2 pure light helper accepts exact four known CL2DD2 permutations without broadening other families',()=>{
 const h=prepare(),{c}=h,data=host(c.hdFERouteRequirementData(h.built.plan)),readCount=h.reads.length;let calls=0;
 withNormalizedFleet(h,['CL','CL','DD','DD'],plan=>{const before=JSON.stringify([plan,data]);for(const order of permutation([0,1,2,3])){assert.equal(c.hdFEOneFiveLightExample({...plan,ships:order.map(i=>plan.ships[i])},data),true);calls++}assert.equal(JSON.stringify([plan,data]),before);assert.equal(c.hdFEOneFiveLightExample({...plan,ships:[...plan.ships,{ship:'',masterId:0,gear:''},{ship:'',masterId:0,gear:''}]},data),true);for(const d of [{...data,map:'1-6'},{...data,index:0},{...data,index:'1'},{...data,path:'ADEJ'}])assert.equal(c.hdFEOneFiveLightExample(plan,d),false);assert.equal(c.hdFEOneFiveLightExample({...plan,map:'1-6'},data),false);assert.equal(c.hdFEOneFiveLightExample({...plan,preservationIssues:[{kind:'source-unknown'}]},data),false)});
 for(const codes of [['BBV','DD','DD','DD'],['BBV','CL','DD','DD'],['BBV','CL','CL','DD'],['CL','DD','DD','DD'],['DD','DD','DD','DD'],['CL','CL','CL','DD'],['CL','CL','DD'],['CL','CL','DD','DD','DD'],['CL','CL','DD','UNKNOWN'],['CT','CL','DD','DD'],['CLT','CL','DD','DD'],['CAV','CL','DD','DD'],['AS','CL','DD','DD'],['SSV','CL','DD','DD']])withNormalizedFleet(h,codes,plan=>assert.equal(c.hdFEOneFiveLightExample(plan,data),false));
 assert.equal(calls,24);assert.equal(h.reads.length,readCount,'pure helper adds no Storage read');unchanged(h);
});

test('1-5 CL2DD2 literal routing boundaries preserve D F G priority and known blockers without generalizing source-valid families',()=>{
 const before=prepare('before'),after=prepare('after'),cases=[
  {codes:['CL','CL','DD','DD'],expected:'ready',changed:true},{codes:['DD','CL','DD','CL'],expected:'ready',changed:true},
  {codes:['BBV','DD','DD','DD'],expected:'ready'},{codes:['BBV','CL','DD','DD'],expected:'ready'},{codes:['BBV','CL','CL','DD'],expected:'ready'},
  {codes:['BB','CL','DD','DD'],expected:'missing'},{codes:['FBB','CL','DD','DD'],expected:'missing'},{codes:['CV','CL','DD','DD'],expected:'missing'},{codes:['CVB','CL','DD','DD'],expected:'missing'},
  {codes:['SS','CL','DD','DD'],expected:'missing'},{codes:['SSV','CL','DD','DD'],expected:'missing'},{codes:['CL','CL','DD','UNKNOWN'],expected:'manual'},{codes:['BB','CL','DD','UNKNOWN'],expected:'missing'},
  {codes:['AO','DD','DD','DD'],notReady:true},{codes:['AO','SS','DD','DD'],expected:'missing'},{codes:['DE','DE','DE','DE'],expected:'missing'},{codes:['CVL','CVL','DD','DD'],expected:'missing'},
  {codes:['CL','CL','CL','DD'],expected:'missing'},{codes:['CL','DD','DD','DD'],expected:'manual'},{codes:['DD','DD','DD','DD'],expected:'manual'},
  {codes:['AS','CL','DD','DD'],expected:'manual'},{codes:['CT','CL','DD','DD'],expected:'manual'},{codes:['CLT','CL','DD','DD'],expected:'manual'},{codes:['CAV','CL','DD','DD'],expected:'manual'},
  {codes:['CL','CL','DD','DD','DD'],expected:'missing'}];
 for(const row of cases){const a=withNormalizedFleet(after,row.codes,p=>host(after.c.hdFERoute(p))),b=withNormalizedFleet(before,row.codes,p=>host(before.c.hdFERoute(p)));if(row.notReady)assert.ok(!['ready','partial'].includes(a.status));else assert.equal(a.status,row.expected,JSON.stringify(row.codes));if(row.changed){assert.equal(b.status,'manual');assert.equal(a.contract.status,'ready')}else assert.equal(exact(a,b),true,'unchanged whole route output for '+row.codes.join('/'))}unchanged(before);unchanged(after);
});

test('1-5 explicit route info boundaries and absent info retain previous constraints without inferred intent',()=>{
 const before=prepare('before'),after=prepare('after'),keys=['text','requirements','total','conditionManual','speedRequired','flagship'];
 for(const where of ['routeInfo','suggestion'])for(const key of keys){const run=h=>{const p=host(h.built.plan),info=host(h.value("hdFSPresetInfo(MAP_PLANS['1-5'].presets[1])"));if(key==='text')info.text+=' / explicit user';if(key==='requirements')info.requirements=[{token:'駆逐艦',count:4}];if(key==='total')info.total=5;if(key==='conditionManual')info.conditionManual=true;if(key==='speedRequired')info.speedRequired=10;if(key==='flagship')info.flagship='駆逐艦';if(where==='routeInfo')p.routeInfo=info;else p.suggestion={...(p.suggestion||{}),info};const inputBefore=JSON.stringify(p),r=host(h.c.hdFERoute(p));assert.equal(JSON.stringify(p),inputBefore,'custom definition is read-only');return r};const b=run(before),a=run(after);assert.equal(exact(a,b),true,where+'/'+key+' legacy whole output');assert.notEqual(a.status,'ready',where+'/'+key+' not bypassed')}
 const runAbsent=h=>{const p=host(h.built.plan);delete p.routeInfo;if(p.suggestion)delete p.suggestion.info;return host(h.c.hdFERoute(p))};assert.equal(exact(runAbsent(before),runAbsent(after)),true,'both absent info projections keep old output');unchanged(before);unchanged(after);
});

test('1-5 CL2DD2 explicit ASW water and separate OASW quantities origin purpose and metadata retain existing normalization',()=>{
 const b=prepare('before'),h=prepare('after'),rows=[{kind:'cap-asw',baseKind:'対潜',minCount:5,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-asw'}},{kind:'cap-water-attack',baseKind:'航空攻撃',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-water'}}],inputBefore=JSON.stringify(rows),prior=host(b.c.hdFEEquipmentRequirements(b.built.plan,host(rows))),requirements=host(h.c.hdFEEquipmentRequirements(h.built.plan,rows));
 assert.equal(h.c.hdFEEquipmentRequirements.toString(),b.c.hdFEEquipmentRequirements.toString());assert.equal(exact(requirements,prior),true);assert.equal(JSON.stringify(rows),inputBefore);assert.deepEqual(requirements,[{...rows[0],label:'対潜シナジー'},rows[1]]);
 for(const target of [0,2]){const oldPlan={...host(b.built.plan),openingAswCount:target},plan={...host(h.built.plan),openingAswCount:target},oldMeasure=b.c.hdOCMeasure(oldPlan,host(rows),b.built.unknown),measure=h.c.hdOCMeasure(plan,rows,h.built.unknown);for(const [kind,n]of [['cap-asw',5],['cap-water-attack',2]])assert.deepEqual(host(measure.goals.filter(x=>x.kind===kind).map(x=>({kind:x.kind,minCount:x.minCount,purpose:x.purpose}))),[{kind,minCount:n,purpose:'strategy'}]);const project=m=>host(m.goals.filter(x=>x.kind==='opening-asw'));assert.equal(exact(project(measure),project(oldMeasure)),true,'user OASW goal exact across source');if(target)assert.equal(project(measure)[0].minCount,2);else assert.deepEqual(project(measure),[]);assert.equal(plan.openingAswCount,target);assert.equal(h.c.hdFERoute(plan).status,'ready')}
 const explicitWater=h.c.hdOCMeasure(h.built.plan,rows,h.built.unknown).goals.find(x=>x.kind==='cap-water-attack');assert.equal(explicitWater.count,0);assert.equal(explicitWater.minCount,2);assert.equal(explicitWater.ok,false);assert.equal(explicitWater.purpose,'strategy');assert.equal(h.c.hdOCSixThreeWaterTargets(h.built.plan,rows[1]),null,'explicit strategy is outside this map-generated recommendation helper; compatibility checked separately');unchanged(b);unchanged(h);
});

test('1-5 CL2DD2 actual four masters allow separate sonar projector frames and exclude owned water aircraft',()=>{
 const h=prepare(),{c}=h,sonar=c.hdFEFind('三式水中探信儀'),projector=c.hdFEFind('三式爆雷投射機'),water=c.hdFEFind('瑞雲');for(const [si,row]of input.ships.entries()){const db=c.hdFEFindShip(row.name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);assert.equal(master.id,row.masterId);assert.equal(master.stype,row.stype);assert.equal(master.type,row.type);assert.equal(master.speed,10);assert.deepEqual(host(profile.slots),row.normalSlots);assert.equal(profile.count,3);for(const item of [sonar,projector]){assert.equal(c.hdShipDbEquipCompatible(item,db),true);for(const index of [0,1,2])assert.equal(c.hdOCCompatible({si,index,db,profile,capacity:profile.slots[index]},{item,star:0}),true)}assert.equal(c.hdShipDbEquipCompatible(water,db),false)}assert.equal(input.normalSlotCount,12);assert.equal(c.hdOCSixThreeWaterTargets(h.built.plan,{kind:'cap-water-attack',generatedFromMap:false,purpose:'strategy'}),null);unchanged(h);
});

test('1-5 CL2DD2 same-input preceding manual route becomes ready without a default water goal card or quantity',()=>{
 const b=prepare('before'),a=prepare('after'),x=initial(b),y=initial(a),oldHTML=b.c.hdSECapabilityHtml('1-5',b.fleet.id,b.built.plan,b.ctx.preset),html=a.c.hdSECapabilityHtml('1-5',a.fleet.id,a.built.plan,a.ctx.preset);assert.equal(x.route.status,'manual');assert.equal(y.route.status,'ready');assert.equal(exact(host(x.requirements),host(y.requirements)),true);assert.deepEqual(host(y.requirements.map(g=>[g.kind,g.minCount])),[['cap-asw',3]]);for(const sample of [x,y]){assert.equal(sample.measure.goals.some(g=>g.kind==='cap-water-attack'||g.kind==='opening-asw'),false);assert.equal(sample.measure.goals.find(g=>g.kind==='cap-asw').purpose,'recommendation')}assert.doesNotMatch(oldHTML,/data-hd-se-capability="cap-water-attack"/);assert.doesNotMatch(html,/data-hd-se-capability="cap-water-attack"/);assert.match(html,/軽巡2＋駆逐2/);assert.match(html,/必要十分な組数と確認した値ではありません/);assert.match(html,/通行必須・先制対潜人数・購入数量ではありません/);assert.match(html,/航空戦艦による砲撃二巡は成立扱いしません/);assert.match(html,/既定の水爆目標や不足数を追加しません/);observations.initialCounterexample={beforeRoute:x.route.status,afterRoute:y.route.status,defaultWaterBeforeAfterAbsent:true,requirementsWholeDirectExact:true,ownedWaterInventory:1,sourceStringsExact:true};unchanged(b);unchanged(a);
});

test('1-5 all three preceding BBV cohorts retain whole build measure route known card and explicit goal normalization',()=>{
 const explicit=[{kind:'cap-asw',baseKind:'対潜',minCount:5,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-asw'}},{kind:'cap-water-attack',baseKind:'航空攻撃',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-water'}}];
 for(const [cohort,fixture]of [['canonical',canonicalInput],['preceding-CL1DD2',priorInput],['preceding-CL2DD1',priorCl2Input]])for(const state of ['known','stock','unknown']){const b=prepare('before',fixture,state),a=prepare('after',fixture,state),x=initial(b),y=initial(a);assert.equal(exact(host(b.built),host(a.built)),true,cohort+'/'+state+' build whole object exact');assert.equal(exact(host(x),host(y)),true,cohort+'/'+state+' measure/readiness/route whole object exact');if(state!=='unknown')assert.equal(a.c.hdSECapabilityHtml('1-5',a.fleet.id,a.built.plan,a.ctx.preset),b.c.hdSECapabilityHtml('1-5',b.fleet.id,b.built.plan,b.ctx.preset),cohort+'/'+state+' known card exact');
  const oldRequirements=host(b.c.hdFEEquipmentRequirements(b.built.plan,host(explicit))),newRequirements=host(a.c.hdFEEquipmentRequirements(a.built.plan,host(explicit)));assert.equal(exact(oldRequirements,newRequirements),true,cohort+'/'+state+' explicit normalization whole exact');assert.deepEqual(newRequirements,[{...explicit[0],label:'対潜シナジー'},explicit[1]]);for(const name of ['hdOCBuild','hdOCMeasure','hdOCSearchSteps','hdFEEquipmentRequirements','hdFEOneFiveAlternateExample'])assert.equal(a.c[name].toString(),b.c[name].toString(),name+' implementation unchanged');
  observations.precedingCohortParity.push({cohort,state,buildWholeDirectExact:true,measureReadinessRouteWholeDirectExact:true,knownCardExact:state==='unknown'?null:true,explicitNormalizedRequirementsWholeDirectExact:true,searchImplementationExact:true,generatorInvocations:0});unchanged(b);unchanged(a)}
});

test('1-5 CL2DD2 independent six-item layout establishes optional ASW3 among four legal hulls with owned water unused',()=>{
 const h=prepare(),{c}=h,plan=host(h.built.plan);plan.ships=plan.ships.map((ship,i)=>({...ship,items:i<3?[{name:'三式水中探信儀',slotIndex:0,star:0,capacity:input.ships[i].normalSlots[0]},{name:'三式爆雷投射機',slotIndex:1,star:0,capacity:input.ships[i].normalSlots[1]}]:[]}));let count=0;for(const ship of plan.ships){const db=c.hdFEFindShip(ship.ship),profile=c.hdShipDbSlotProfile(db),used=new Set();for(const item of ship.items){assert.equal(used.has(item.slotIndex),false);used.add(item.slotIndex);assert.equal(c.hdShipDbEquipCompatible(c.hdFEFind(item.name),db),true);assert.equal(c.hdShipDbSlotRejects(profile,item.slotIndex,c.hdFEFind(item.name)),false);count++}}assert.equal(count,6);assert.equal(c.hdSECapabilityMeasure(plan,'cap-asw').count,3);assert.equal(c.hdSECapabilityMeasure(plan,'cap-water-attack').count,0);assert.equal(c.hdFLInventory().get(c.hdFLInventoryStackKey('瑞雲',0))?.count,1);const measure=c.hdOCMeasure(plan,c.hdSEChecks('1-5').rows);assert.equal(measure.goals.find(g=>g.kind==='cap-asw').purpose,'recommendation');assert.equal(measure.goals.some(g=>g.kind==='cap-water-attack'||g.kind==='opening-asw'),false);assert.equal(c.hdFERoute(plan).status,'ready');assert.equal(measure.complete,true);unchanged(h);
});


test('1-5 CL2DD2 shortage guidance separates stock from four legal hulls slot conflicts unknown profiles and inapplicable default water',()=>{
 const h=prepare('after',input,'stock'),{c}=h,plan=h.built.plan,goal={kind:'cap-asw',generatedFromMap:true,purpose:'recommendation'},stock=c.hdSECapabilityStock(plan,'cap-asw',3),targets=host(c.hdOCFourOneAswTargets(plan,goal,stock));assert.deepEqual(host(stock.parts.map(x=>({part:x.part,need:x.need,have:x.have}))),[{part:'sonar',need:3,have:3},{part:'projector',need:3,have:2}]);assert.deepEqual(targets.map(x=>x.ship),input.ships.map(x=>x.name));const original=c.hdShipDbSlotProfile;
 for(const [si,row]of input.ships.entries()){const target=targets[si];assert.equal(target.status,'candidate');assert.deepEqual(target.parts.map(p=>({part:p.part,count:p.count,slots:p.slots.map(s=>s.index)})),[{part:'sonar',count:1,slots:[0,1,2]},{part:'projector',count:1,slots:[0,1,2]}]);assert.equal(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index)),true);for(const part of target.parts)for(const slot of part.slots)for(const name of slot.candidates)assert.equal(c.hdOCCompatible({si,index:slot.index,db:c.hdFEFindShip(row.name),profile:original(c.hdFEFindShip(row.name)),capacity:row.normalSlots[slot.index]},{item:c.hdFEFind(name),star:0}),true)}
 try{c.hdShipDbSlotProfile=db=>{const p=original(db);return db?.name==='那珂改二'||db?.final==='那珂改二'?{...p,count:1,slots:[1]}:p};assert.equal(host(c.hdOCFourOneAswTargets(plan,goal,stock)).some(x=>x.ship==='那珂改二'),false);c.hdShipDbSlotProfile=db=>db?.name==='那珂改二'||db?.final==='那珂改二'?null:original(db);assert.deepEqual(host(c.hdOCFourOneAswTargets(plan,goal,stock)).find(x=>x.ship==='那珂改二'),{ship:'那珂改二',shipIndex:1,status:'manual',parts:[]})}finally{c.hdShipDbSlotProfile=original}
 const requirements=c.hdFEEquipmentRequirements(plan,c.hdSEChecks('1-5').rows);assert.equal(requirements.some(x=>x.kind==='cap-water-attack'),false);const html=c.hdSECapabilityHtml('1-5',h.fleet.id,plan,h.ctx.preset);assert.doesNotMatch(html,/data-hd-se-capability="cap-water-attack"/);assert.equal(c.hdOCSixThreeWaterTargets(plan,{kind:'cap-water-attack',generatedFromMap:false,purpose:'strategy'}),null);unchanged(h);
 const u=prepare('after',input,'unknown'),ui=initial(u),unknownHTML=u.c.hdSECapabilityHtml('1-5',u.fleet.id,u.built.plan,u.ctx.preset),waterCard=unknownHTML.match(/<article[^>]*data-hd-se-capability="cap-water-attack"[\s\S]*?<\/article>/)?.[0]||'';assert.ok(waterCard);assert.match(waterCard,/manual/);assert.doesNotMatch(waterCard,/data-hd-se-target-count=/);assert.match(waterCard,/数量は未判定/);assert.equal(ui.requirements.some(g=>g.kind==='cap-water-attack'),false);assert.equal(ui.measure.goals.some(g=>g.kind==='cap-water-attack'),false);unchanged(u);
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
function search(h){assert.equal(unsafeMutation,false);observations.generatorInvocations.push(h.role+'/new-CL2DD2/'+h.state);const iterator=h.c.hdOCSearchSteps(h.ctx);let yields=0,result;for(;;){const step=h.c.hdFEWithShipLookup(()=>iterator.next());if(step.done){result=step.value;break}yields++}unchanged(h);return {result,yields,allocation:classify(h,result.plan)}}


for(const state of ['known','stock','unknown'])test('1-5 CL2DD2 actual '+state+' model retains finite legality optional goals and explicit termination',()=>{
 const h=prepare('after',input,state),x=initial(h),run=search(h),r=run.result,route=h.c.hdFERoute(r.plan),projection={goals:host(goalProjection({route,measure:r.measure})),route:route.status,readiness:r.readiness.status,measureComplete:r.measure.complete,registeredReady:r.readiness.registeredReady,searchStatus:r.search.status,requiredChecks:host(r.measure.requiredChecks.map(y=>({status:y.status??null,ok:y.ok??null,unresolved:!!y.unresolved}))),assignedRegistered:run.allocation.registered,assignedUnregistered:run.allocation.unregistered,sourceIssueCount:(r.plan.preservationIssues||[]).length};
 observations.modelCases.push({state,initial:{route:host(x.route),requirements:host(x.requirements),measure:host(x.measure),readiness:host(x.readiness)},searched:{result:host(r),yields:run.yields,allocation:run.allocation},searchedProjection:projection,sourceStringsDirectExact:true,modelStorageWrites:0});
 const expected=input.modelExpectation[state].initial;assert.deepEqual(host(goalProjection(x)),expected.goals);assert.equal(x.route.status,expected.route);assert.equal(x.measure.complete,expected.measureComplete);assert.deepEqual(host(x.requirements.map(g=>({kind:g.kind,minCount:g.minCount??null,generatedFromMap:g.generatedFromMap===true}))),expected.requirements);
 if(input.preparationState==='model-observation-frozen'){assert.ok(input.modelExpectation[state].searched);assert.deepEqual(projection,input.modelExpectation[state].searched,'frozen actual new-cohort searched projection exact')}else{assert.equal(input.preparationState,'source-expected');assert.equal(input.modelExpectation[state].searched,null,'no copied searched numbers before the first actual observation')}
 assert.equal(r.search.maxExamined,10000);assert.equal(r.search.maxDepth,24);assert.equal(r.search.exhaustive,false);assert.equal(r.search.portSeed.maxOperations,800);assert.ok(r.search.reasons.length>0);assert.equal(r.plan.openingAswCount,0);assert.equal(r.measure.goals.some(g=>g.kind==='opening-asw'||g.kind==='cap-water-attack'),false);const asw=r.measure.goals.find(g=>g.kind==='cap-asw');assert.equal(asw.minCount,3);assert.equal(asw.purpose,'recommendation');assert.ok(Number.isInteger(asw.count)&&asw.count>=0&&asw.count<=3);assert.equal(r.plan.ships.flatMap(s=>s.items).some(item=>item.name==='瑞雲'),false,'owned water aircraft remains undeployed and outside default goals');assert.equal(h.c.hdFERoute(r.plan).status,state==='unknown'?'manual':'ready');
 if(state==='known'){assert.equal(asw.count,3);assert.equal(r.measure.complete,true);assert.equal(run.allocation.registered,6);assert.equal(run.allocation.unregistered,0);const receivers=r.plan.ships.filter(s=>s.items.some(i=>i.name==='三式水中探信儀')&&s.items.some(i=>i.name==='三式爆雷投射機'));assert.equal(receivers.length,3);for(const s of receivers){const sonar=s.items.find(i=>i.name==='三式水中探信儀'),projector=s.items.find(i=>i.name==='三式爆雷投射機');assert.notEqual(sonar.slotIndex,projector.slotIndex)}}
 if(state==='stock'){assert.ok(asw.count<=2,'two projectors cannot form three complete sets');assert.equal(r.measure.complete,false);assert.equal(run.allocation.unregistered,0)}
 if(state==='unknown'){assert.ok(r.plan.preservationIssues.length);assert.equal(r.readiness.registeredReady,false);assert.equal(r.measure.complete,false)}unchanged(h);
});
