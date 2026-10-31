'use strict';
// Actual source modules in a pure Node VM. Fixed clocks here are unit-test inputs;
// the browser clock, waits, search caps and product source are never wrapped.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(process.env.HD15CL1DD3_SOURCE_ROOT||path.join(__dirname,'..')),INVERSE=path.join(ROOT,'tests/fixtures/one-five-cl1-dd3-approved-source-inverses.json'),INPUT=path.resolve(process.env.HD15CL1DD3_INPUT_FIXTURE||path.join(ROOT,'tests/fixtures/one-five-cl1-dd3-browser-inputs.json'));
const APPROVED_INVERSE_SHA256='c876767f33bec6aecd878b77ba206a8dd43bacbb5ec01256f908cf3f16a71626';
const input=JSON.parse(fs.readFileSync(INPUT,'utf8')),canonicalInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-middle-browser-inputs.json'),'utf8')),priorInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-bbv-cl-browser-inputs.json'),'utf8')),priorCl2Input=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-bbv-cl2-browser-inputs.json'),'utf8')),priorLightInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/one-five-cl2-dd2-browser-inputs.json'),'utf8')),approvedBytes=fs.readFileSync(INVERSE),approved=JSON.parse(approvedBytes),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),host=x=>JSON.parse(JSON.stringify(x)),exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
assert.equal(hash(approvedBytes),APPROVED_INVERSE_SHA256);assert.equal(approved.schemaVersion,1);
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
const sourceCache=new Map(),observations={schemaVersion:1,unit:'one-five-cl1-dd3',privateNodeModelOnly:true,browserExecuted:false,sourceHashes:{},initialCounterexample:null,precedingCohortParity:[],modelCases:[],generatorInvocations:[]};let unsafeMutation=false;
if(process.env.HD15_CL1_DD3_PRIVATE_OBSERVATIONS)process.on('exit',()=>fs.writeFileSync(process.env.HD15_CL1_DD3_PRIVATE_OBSERVATIONS,JSON.stringify(observations,null,2)+'\n'));
function source(file,role){const key=role+':'+file;if(sourceCache.has(key))return sourceCache.get(key);let value=fs.readFileSync(path.join(ROOT,file),'utf8');const rule=approved.files[file];if(rule){assert.equal(hash(value),rule.approvedAfterSHA256,file+' approved current bytes');if(role==='before'){for(const change of approved.changes.filter(x=>x.file===file).reverse()){assert.equal(value.split(change.after).length,2,file+' inverse unique');value=value.replace(change.after,change.before)}assert.equal(hash(value),rule.beforeSHA256,file+' exact preceding BBV three-cohort bytes restored')}}sourceCache.set(key,value);(observations.sourceHashes[role]??={})[file]=hash(value);return value}
function slice(text,selector){const locate=anchor=>{assert.equal(text.split(anchor).length,2,'module boundary unique');return text.indexOf(anchor)},a=selector.from===null?0:locate(selector.from),b=selector.to===null?text.length:locate(selector.to);assert.ok(b>a);return text.slice(a,b)}
function context(role='after'){
 assert.ok(['before','after'].includes(role));const store=new Map(),writes=[],reads=[];
 const storage={getItem:key=>{key=String(key);reads.push(key);return store.has(key)?store.get(key):null},setItem(key){writes.push(String(key));unsafeMutation=true;throw Error('model must not write Storage')},removeItem(){unsafeMutation=true;throw Error('model must not remove Storage')},clear(){unsafeMutation=true;throw Error('model must not clear Storage')}};
 class UnitDate extends Date{constructor(...args){super(...(args.length?args:[1700000000000]))}static now(){return 1700000000000}}
 const c={localStorage:storage,MAP_DETAILS:{},HD_NODE_DETAIL_OVERRIDES:{},console,URL,Date:UnitDate,Math,Map,Set,WeakMap,WeakSet,performance:{timeOrigin:1700000000000,now:()=>0},setTimeout(){throw Error('unexpected unit timer')},setInterval(){throw Error('unexpected unit interval')},document:new Proxy({},{get(_target,key){throw Error('unexpected model DOM access '+String(key))}})};c.window=c;c.addEventListener=()=>{throw Error('unexpected UI listener initialization')};c.dispatchEvent=()=>{throw Error('unexpected UI dispatch')};vm.createContext(c);
 for(const module of SELECTORS){const text=source(module.file,role),code=module.parts.map(s=>slice(text,s)).join('');vm.runInContext(code,c,{filename:role+':'+module.file+'#actual-model'})}
 for(const name of ['hdOCBuild','hdOCMeasure','hdOCSearchSteps','hdFERoute','hdFEEquipmentRequirements','hdSECapabilityMeasure','hdSECapabilityStock','hdShipDbSlotProfile','hdShipDbEquipCompatible'])assert.equal(typeof c[name],'function',name+' actual source loaded');if(role==='after')for(const name of ['hdFEOneFiveAlternateExample','hdFEOneFiveLightExample','hdFEOneFiveAswScope','hdFEOneFiveAswSelection'])assert.equal(typeof c[name],'function',name+' current product function loaded')
 return {role,c,store,writes,reads,value:expr=>vm.runInContext(expr,c)};
}
function prepare(role='after',fixture=input,state='known',choice=fixture.unit==='one-five-cl1-dd3'?fixture.aswSetSelection:undefined){
 assert.equal(unsafeMutation,false,'no further generator/model work after a detected input mutation');const h=context(role),{c,store}=h,config=fixture[state],unknown=state==='unknown',id='node-one-five-cl1-dd3-'+state;
 const rows=fixture.ships.map((expected,i)=>{const missing=unknown&&i===fixture.unknown.replaceShipIndex,name=missing?fixture.unknown.name:expected.name,db=c.hdFEFindShip(name),master=db&&c.hdShipDbMasterRowFor(db),profile=db&&c.hdShipDbSlotProfile(db);if(missing){assert.equal(db,null);assert.equal(profile,null)}else{assert.equal(master.id,expected.masterId);assert.equal(master.stype,expected.stype);assert.equal(master.type,expected.type);assert.equal(master.speed,expected.baseSpeed);assert.equal(exact(host(profile.slots),expected.normalSlots),true,'declared normal slots exact')}
  return {id:id+'-'+i,name,masterId:master?.id||0,gameShipId:150100+i,level:fixture.level,gameSlotEx:0,gameGearSlots:missing?[fixture.unknown.gear]:Array.from({length:profile.count},()=>''),gameGearExpansion:'',metadata:{keep:i,nested:{keep:['first','second']}}};});
 const preset=host(h.value("MAP_PLANS['1-5'].presets[1]")),fleet={id,name:'synthetic one-five '+state,memo:'keep memo',openingAswCount:0,routePreset:preset,metadata:{keep:true,nested:{order:['first','second']}},ships:rows.map((row,i)=>({ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,rosterId:row.id,gear:unknown&&i===fixture.unknown.replaceShipIndex?fixture.unknown.gear:'',metadata:{keep:i,nested:{keep:['first','second']}}}))};
 const seed=(key,value)=>store.set(key,JSON.stringify(value));seed('harbordesk-ship-roster-v1',rows);seed('harbordesk-equipment-v1',config.finiteInventory);seed('harbordesk-kancolle-sync-v1',{admiralLevel:fixture.hq,metadata:{keep:true}});seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(x=>({gameShipId:x.gameShipId,gearKnown:true}))}]);seed('harbordesk-opening-asw-targets-v1',{'1-1:unrelated:0':6});seed('harbordesk-night-ci-policy-v1',{'1-5':'auto'});seed('harbordesk-custom-fleets-v1',{'1-5':[fleet,{id:'other-same-map',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
 if(choice!==undefined)seed('harbordesk-asw-set-choices-v1',{'1-1:unrelated:0':{state:'count',count:2,metadata:{keep:true}},['1-5:'+id+':1']:host(choice)});
  const ctx={map:'1-5',index:1,preset,fleet},storeBefore=JSON.stringify([...store]),fleetBefore=JSON.stringify(fleet),built=c.hdOCBuild(ctx);assert.equal(built.plan.openingAswCount,0);return {...h,fixture,state,ctx,fleet,built,storeBefore,fleetBefore};
}
function unchanged(h){const sameStore=JSON.stringify([...h.store])===h.storeBefore,sameFleet=JSON.stringify(h.fleet)===h.fleetBefore;if(!sameStore||!sameFleet||h.writes.length)unsafeMutation=true;assert.equal(sameStore,true,'all backing source strings retained exactly (body omitted)');assert.equal(sameFleet,true,'original synthetic fleet retained exactly (body omitted)');assert.equal(h.writes.length,0)}
const goalProjection=sample=>sample.measure.goals.map(g=>({kind:g.kind,count:g.count??null,minCount:g.minCount??null,ok:g.ok??null,unresolved:!!g.unresolved,purpose:g.purpose??null}));
function initial(h){const rows=h.c.hdSEChecks('1-5').rows,requirements=h.c.hdFEEquipmentRequirements(h.built.plan,rows),measure=h.c.hdOCMeasure(h.built.plan,rows,h.built.unknown),reviews=h.c.hdOCReview(h.built.plan,measure),readiness=h.c.hdOCReadiness(h.built.plan,measure,reviews);unchanged(h);return {rows,requirements,measure,readiness,route:h.c.hdFERoute(h.built.plan)}}
function permutation(values){if(!values.length)return [[]];return values.flatMap((x,i)=>permutation(values.filter((_,j)=>i!==j)).map(rest=>[x,...rest]))}
const TYPES={BBV:'航空戦艦',CL:'軽巡洋艦',DD:'駆逐艦',DE:'海防艦',BB:'戦艦',FBB:'戦艦',CV:'正規空母',CVB:'装甲空母',SS:'潜水艦',SSV:'潜水空母',AS:'潜水母艦',AO:'補給艦',CVL:'軽空母',CT:'練習巡洋艦',CLT:'重雷装巡洋艦',CAV:'航空巡洋艦'};
function withNormalizedFleet(h,codes,fn){const c=h.c,oldFind=c.hdFEFindShip,oldShips=c.hdFERouteShips,base=host(h.built.plan),dictionary={};base.ships=codes.map((code,i)=>({ship:'literal-'+code+'-'+i,items:[],metadata:{keep:i}}));const rows=base.ships.map((ship,i)=>{const code=codes[i],type=TYPES[code]||'';if(type)dictionary[ship.ship]={name:ship.ship,type};return {ship,type,typeKnown:!!type,speedInfo:{known:!!type,rank:code==='BB'||code==='BBV'?5:10,base:code==='BB'||code==='BBV'?5:10,group:type?'literal-known':''}}});
 c.hdFEFindShip=name=>dictionary[name]||null;c.hdFERouteShips=()=>rows;try{return fn(base,rows)}finally{c.hdFEFindShip=oldFind;c.hdFERouteShips=oldShips}}


// Literal expectations are derived from the cached source branch order. They
// are independent of product decisions and do not imply a victory guarantee.
test('1-5 CL1DD3 approved source inverse restores and replays the exact preceding four-cohort source',()=>{
 for(const [file,rule]of Object.entries(approved.files)){const after=source(file,'after'),before=source(file,'before');assert.equal(hash(after),rule.approvedAfterSHA256);assert.equal(hash(before),rule.beforeSHA256);let replay=before;for(const row of approved.changes.filter(x=>x.file===file)){assert.equal(replay.split(row.before).length,2,file+' unique replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay,after,file+' whole source inverse/replay')}
});

test('1-5 four-hull source matrix keeps D submarine priority AO exclusion F blockers and G four-hull scope distinct',()=>{
 const h=prepare(),before=prepare('before'),cases=[
  {codes:['CL','DD','DD','DD'],route:'ready',family:true},{codes:['BBV','DD','DD','DD'],route:'ready',legacy:true},{codes:['BBV','CL','DD','DD'],route:'ready',legacy:true},{codes:['BBV','CL','CL','DD'],route:'ready',legacy:true},{codes:['CL','CL','DD','DD'],route:'ready',legacy:true},
  {codes:['AO','DD','DD','DD'],route:'missing'},{codes:['AO','SS','DD','DD'],route:'missing'},{codes:['AO','SSV','DD','DD'],route:'missing'},{codes:['AO','DD','DD','UNKNOWN'],route:'missing'},
  {codes:['SS','DD','DD','DD'],route:'missing'},{codes:['SSV','DD','DD','DD'],route:'missing'},{codes:['BB','DD','DD','DD'],route:'missing'},{codes:['FBB','DD','DD','DD'],route:'missing'},{codes:['CV','DD','DD','DD'],route:'missing'},{codes:['CVB','DD','DD','DD'],route:'missing'},
  {codes:['CVL','CVL','DD','DD'],route:'missing'},{codes:['CL','CL','CL','DD'],route:'missing'},{codes:['DE','DE','DE','DE'],route:'missing'},{codes:['BB','CL','DD','UNKNOWN'],route:'missing'},
  {codes:['CL','DD','DD','UNKNOWN'],route:'manual'},{codes:['DD','DD','DD','DD'],route:'ready'},{codes:['CVL','DD','DD','DD'],route:'ready'},{codes:['DE','DE','DD','DD'],route:'ready'},{codes:['CL','DE','DD','DD'],route:'ready'},{codes:['CT','DD','DD','DD'],route:'manual'},{codes:['CLT','DD','DD','DD'],route:'manual'},{codes:['CAV','DD','DD','DD'],route:'manual'},{codes:['AS','DD','DD','DD'],route:'manual'},
  {codes:['CL','DD','DD'],notReady:true},{codes:['CL','DD','DD','DD','DD'],route:'missing'}];
 for(const row of cases)withNormalizedFleet(h,row.codes,plan=>{const r=h.c.hdFERoute(plan),scope=host(h.c.hdFEOneFiveAswScope(plan));if(row.notReady)assert.notEqual(r.status,'ready');else assert.equal(r.status,row.route,row.codes.join('/'));if(row.family){assert.equal(scope.applicable,true);assert.equal(scope.known,true);assert.equal(scope.legacyAllowed,false);withNormalizedFleet(before,row.codes,p=>assert.equal(before.c.hdFERoute(p).status,'manual','same-input preceding route counterexample'))}if(row.legacy){assert.equal(scope.known,true);assert.equal(scope.materialKnown,false,'literal type-only fixture has no registered slot material');assert.equal(scope.legacyAllowed,false,'type shape alone cannot enable a legacy quantity')}});
 unchanged(h);unchanged(before);
});

test('1-5 CL1DD3 all 24 real-hull orders retain route scope without a flagship speed or equipment invention',()=>{
 const h=prepare(),names=input.ships.map(x=>x.name);for(const order of permutation(names)){const p=host(h.built.plan);p.ships=order.map(name=>host(h.built.plan.ships.find(s=>s.ship===name)));const route=h.c.hdFERoute(p),scope=h.c.hdFEOneFiveAswScope(p);assert.equal(route.status,'ready');assert.equal(scope.known,true);assert.equal(scope.legacyAllowed,false);assert.equal(h.c.hdFEPlanScouting(p,[]).notRequired,true);assert.equal(route.contract.data.conditions.length,6)}unchanged(h);
});

test('1-5 explicit six-key route definitions and absent info do not bypass user fleet flagship or speed constraints',()=>{
 const h=prepare(),b=prepare('before'),keys=['text','requirements','total','conditionManual','speedRequired','flagship'];
 for(const where of ['routeInfo','suggestion'])for(const key of keys){const run=x=>{const p=host(x.built.plan),info=host(x.value("hdFSPresetInfo(MAP_PLANS['1-5'].presets[1])"));if(key==='text')info.text+=' / explicit user';if(key==='requirements')info.requirements=[{token:'駆逐艦',count:4}];if(key==='total')info.total=5;if(key==='conditionManual')info.conditionManual=true;if(key==='speedRequired')info.speedRequired=15;if(key==='flagship')info.flagship='航空戦艦';if(where==='routeInfo')p.routeInfo=info;else p.suggestion={...(p.suggestion||{}),info};const str=JSON.stringify(p),r=host(x.c.hdFERoute(p));assert.equal(JSON.stringify(p),str);return {route:r,basic:host(x.c.hdFERouteBasic(p))}};const old=run(b),now=run(h);assert.notEqual(now.route.status,'ready',where+'/'+key+' explicit user route constraint');assert.equal(now.basic.status,old.basic.status,where+'/'+key+' basic definition not bypassed')}
 const p=host(h.built.plan);delete p.routeInfo;if(p.suggestion)delete p.suggestion.info;assert.notEqual(h.c.hdFERoute(p).status,'ready','absence does not invent canonical user intent');unchanged(h);unchanged(b);
});

test('1-5 ASW quantity domain keeps unset off count1 through4 legacy5 invalid and unknown separate without mutation',()=>{
 const h=prepare(),plan=host(h.built.plan),check=(choice,expected,count=null)=>{const p=host(plan);if(choice===undefined)delete p.aswSetSelection;else p.aswSetSelection=host(choice);const prior=JSON.stringify(p),s=host(h.c.hdFEOneFiveAswSelection(p));assert.equal(s.state,expected);assert.equal(s.count??null,count);assert.equal(JSON.stringify(p),prior,'selection is pure');return p};
 for(const index of [0,2]){const p={...host(plan),routeIndex:index,preset:host(h.value("MAP_PLANS['1-5'].presets["+index+"]"))};p.routeInfo=h.c.hdFSPresetInfo(p.preset);assert.equal(h.c.hdFEOneFiveAswSelection(p).applicable,false);assert.equal(h.c.hdOCAswSetKey({...h.ctx,index}),null)}assert.equal(h.c.hdFEOneFiveAswSelection({...host(plan),map:'1-1'}).applicable,false);
 check(undefined,'unselected');check({state:'unselected'},'unselected');check({state:'off'},'off');for(const count of [1,2,3,4]){const p=check({state:'count',count},'count',count),rows=host(h.c.hdFEEquipmentRequirements(p,h.c.hdSEChecks('1-5').rows)),g=rows.find(x=>x.kind==='cap-asw');assert.ok(g);assert.equal(g.minCount,count);assert.equal(g.purpose,'strategy');assert.equal(g.generatedFromMap,false)}
 for(const bad of [null,{},[],{state:'count',count:0},{state:'count',count:5},{state:'count',count:1.5},{state:'count',count:'3'},{state:'other'}])check(bad,'invalid');
 // Material-positive legacy3 cases use the four actual registered cohort fixtures
 // in the old-known/stock parity test; type-only literals cannot prove slots.
 withNormalizedFleet(h,['CL','DD','DD','UNKNOWN'],p=>{delete p.aswSetSelection;const s=h.c.hdFEOneFiveAswSelection(p);assert.equal(s.state,'unselected');assert.equal(s.count,null)});
 const explicit=[{kind:'cap-asw',baseKind:'対潜',minCount:5,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-legacy-five'}}],noChoice=host(plan);delete noChoice.aswSetSelection;const before=JSON.stringify(explicit),selection=h.c.hdFEOneFiveAswSelection(noChoice,explicit),rows=host(h.c.hdFEEquipmentRequirements(noChoice,explicit));assert.equal(selection.count,5);assert.equal(rows.find(x=>x.kind==='cap-asw').minCount,5);assert.equal(rows.find(x=>x.kind==='cap-asw').purpose,'strategy');assert.deepEqual(rows,[{...explicit[0],label:'対潜シナジー'}],'every explicit legacy field retained with existing canonical default label only');assert.equal(rows[0].generatedFromMap,false);assert.equal(JSON.stringify(explicit),before);
 // A strategy-purpose row remains explicit even when an older caller supplied
 // generatedFromMap:true. Normalize the conflicting origin only in this scope.
 for(const count of [1,2,5]){const mixed=[{kind:'cap-asw',baseKind:'対潜',minCount:count,purpose:'strategy',generatedFromMap:true,metadata:{keep:'mixed-origin-'+count}}],raw=JSON.stringify(mixed),normalized=host(h.c.hdFEEquipmentRequirements(noChoice,mixed)),measured=h.c.hdOCMeasure(noChoice,mixed,h.built.unknown);assert.deepEqual(normalized,[{...mixed[0],label:'対潜シナジー',generatedFromMap:false}]);const goal=measured.goals.find(g=>g.kind==='cap-asw');assert.equal(goal.minCount,count);assert.equal(goal.purpose,'strategy');assert.equal(goal.generatedFromMap,false);assert.deepEqual(host(goal.metadata),mixed[0].metadata);assert.equal(JSON.stringify(mixed),raw)}
 // A pure editor blank is discarded by the saved-plan parser. A nameless
 // equipment-bearing row is material uncertainty, never a license for legacy3.
 const material=prepare('after',canonicalInput,'known');
 for(const [kind,extra,expected]of [['pure-blank',[{ship:'',gear:''},{ship:'',gear:''}],'legacy-default'],['nameless-equipment',[{ship:'',gear:'三式水中探信儀'}],'unselected'],['nameless-delimiter-only',[{ship:'',gear:' / '}],'unselected']]){const ctx={...material.ctx,fleet:{...host(material.fleet),ships:[...host(material.fleet.ships),...extra]}},capture=material.c.hdOCAswSetCapture(ctx),built=material.c.hdOCBuild(ctx,capture),selection=material.c.hdFEOneFiveAswSelection(built.plan);assert.equal(capture.selection.state,expected,kind+' captured selection');assert.equal(selection.state,expected,kind+' built selection');assert.equal(capture.scope.materialKnown,kind==='pure-blank');assert.equal(capture.scope.legacyAllowed,kind==='pure-blank');assert.equal(material.c.hdOCAswSetCanSearch(capture,ctx),kind==='pure-blank');if(kind!=='pure-blank'){assert.equal(selection.count,null);assert.ok(built.plan.preservationIssues.length);assert.equal(material.c.hdFEEquipmentRequirements(built.plan,material.c.hdSEChecks('1-5').rows).some(g=>g.kind==='cap-asw'),false)}else{assert.equal(selection.count,3);assert.equal(built.plan.ships.length,4)}}unchanged(material);
 const previous=prepare('before'),outside={...host(plan),map:'1-1',routeIndex:0,preset:host(h.value("MAP_PLANS['1-1'].presets[0]"))};delete outside.aswSetSelection;outside.routeInfo=h.c.hdFSPresetInfo(outside.preset);const outsideRows=[{kind:'cap-asw',baseKind:'対潜',minCount:2,purpose:'strategy',generatedFromMap:true,metadata:{keep:'other-map'}}];assert.equal(exact(host(h.c.hdFEEquipmentRequirements(outside,host(outsideRows))),host(previous.c.hdFEEquipmentRequirements(host(outside),host(outsideRows)))),true,'other-map whole requirements retain previous origin policy');unchanged(previous);unchanged(h);
});

test('1-5 independent ASW count1 and2 do not rise to3 and OASW2 water strategy metadata remain separate',()=>{
 const h=prepare(),plan=host(h.built.plan),extra={kind:'cap-water-attack',baseKind:'航空攻撃',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'explicit-water'}};
 for(const count of [1,2,3,4]){const p={...host(plan),aswSetSelection:{state:'count',count},openingAswCount:2},rows=host(h.c.hdFEEquipmentRequirements(p,[host(extra)])),measure=h.c.hdOCMeasure(p,[host(extra)],h.built.unknown);assert.equal(rows.find(x=>x.kind==='cap-asw').minCount,count);assert.deepEqual(rows.find(x=>x.kind==='cap-water-attack'),extra);const asw=measure.goals.find(g=>g.kind==='cap-asw'),oasw=measure.goals.find(g=>g.kind==='opening-asw'),water=measure.goals.find(g=>g.kind==='cap-water-attack');assert.equal(asw.minCount,count);assert.equal(asw.purpose,'strategy');assert.equal(oasw.minCount,2);assert.equal(water.minCount,2);assert.equal(water.purpose,'strategy');assert.deepEqual(p.aswSetSelection,{state:'count',count})}unchanged(h);
});

test('1-5 CL1DD3 actual four masters permit sonar projector on distinct normal slots and exclude owned water aircraft',()=>{
 const h=prepare(),{c}=h,sonar=c.hdFEFind('三式水中探信儀'),projector=c.hdFEFind('三式爆雷投射機'),water=c.hdFEFind('瑞雲');assert.deepEqual(input.ships.map(x=>x.masterId),[159,330,229,144]);assert.deepEqual(input.ships.map(x=>x.stype),[3,2,2,2]);for(const row of input.ships){const db=c.hdFEFindShip(row.name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);assert.equal(master.id,row.masterId);assert.equal(master.stype,row.stype);assert.equal(master.speed,10);assert.deepEqual(host(profile.slots),row.normalSlots);assert.equal(profile.count,3);for(const item of [sonar,projector])for(const index of [0,1,2])assert.equal(c.hdOCCompatible({si:0,index,db,profile,capacity:profile.slots[index]},{item,star:0}),true);assert.equal(c.hdShipDbEquipCompatible(water,db),false)}assert.equal(c.hdFLInventory().get(c.hdFLInventoryStackKey('瑞雲',0)).count,1);unchanged(h);
});

test('1-5 unset and off remove only ASW quantity evaluation and procurement without zero-fulfilled claims',()=>{
 const h=prepare();for(const state of ['unselected','off']){const plan={...host(h.built.plan),aswSetSelection:{state}},x={...h,built:{...h.built,plan}},sample=initial(x),html=h.c.hdSECapabilityHtml('1-5',h.fleet.id,plan,h.ctx.preset);assert.equal(sample.requirements.some(g=>g.kind==='cap-asw'),false);assert.equal(sample.measure.goals.some(g=>g.kind==='cap-asw'),false);assert.equal(sample.measure.goals.some(g=>g.kind==='cap-water-attack'),false);assert.doesNotMatch(html,/<article[^>]*data-hd-se-capability="cap-asw"[^>]*data-hd-se-target-count="0"/);assert.equal(h.c.hdFERoute(plan).status,'ready');const routeNote=h.c.hdMapRequirementsHtml('1-5',h.ctx.preset);assert.match(routeNote,/組数は編成ごとの選択/);assert.match(routeNote,/未選択のときは必要数・不足数を出さず/);assert.doesNotMatch(routeNote,/装備の推奨目標：対潜シナジー 3組/)}
 const unknown=prepare('after',input,'unknown',{state:'count',count:3}),sample=initial(unknown),html=unknown.c.hdSECapabilityHtml('1-5',unknown.fleet.id,unknown.built.plan,unknown.ctx.preset),water=html.match(/<article[^>]*data-hd-se-capability="cap-water-attack"[\s\S]*?<\/article>/)?.[0]||'';assert.ok(water);assert.match(water,/manual/);assert.doesNotMatch(water,/data-hd-se-target-count=/);assert.match(water,/数量は未判定/);assert.equal(sample.requirements.some(g=>g.kind==='cap-water-attack'),false);unchanged(h);unchanged(unknown);
});

function normalizedApprovedMeasure(measure,unknown=false){const m=host(measure),route=m.goals.find(x=>x.kind==='route-requirements');if(route){route.minCount-=1;if(!unknown)route.count-=1}if(m.requiredChecks)m.requiredChecks.splice(2,1);return m}
const OLD_COHORTS=[['canonical',canonicalInput],['BBVCL1',priorInput],['BBVCL2',priorCl2Input],['CL2DD2',priorLightInput]];
test('1-5 old four known and stock families keep requirements legality and approved AO-only measure semantics without old searches',()=>{
 for(const [cohort,fixture]of OLD_COHORTS)for(const state of ['known','stock']){const before=prepare('before',fixture,state),after=prepare('after',fixture,state),b=initial(before),a=initial(after);assert.equal(exact(host(after.built.plan.ships),host(before.built.plan.ships)),true,cohort+'/'+state+' initial deployment whole exact');assert.equal(exact(host(a.requirements),host(b.requirements)),true,cohort+'/'+state+' legacy recommendation/water requirements whole exact');assert.equal(a.route.status,b.route.status);assert.equal(a.route.contract.data.conditions.length,b.route.contract.data.conditions.length+1);assert.equal(exact(host(a.measure.goals.filter(g=>g.kind!=='route-requirements')),host(b.measure.goals.filter(g=>g.kind!=='route-requirements'))),true,cohort+'/'+state+' all equipment goal fields exact');const oldRoute=b.measure.goals.find(g=>g.kind==='route-requirements'),newRoute=a.measure.goals.find(g=>g.kind==='route-requirements');assert.deepEqual(host({count:newRoute.count,minCount:newRoute.minCount,ok:newRoute.ok,unresolved:!!newRoute.unresolved,purpose:newRoute.purpose,ratio:newRoute.ratio}),host({count:oldRoute.count+1,minCount:oldRoute.minCount+1,ok:oldRoute.ok,unresolved:!!oldRoute.unresolved,purpose:oldRoute.purpose,ratio:oldRoute.ratio}));const checks=host(a.measure.requiredChecks);const added=checks.splice(2,1)[0];assert.equal(added.status,'ready');assert.equal(added.ok,true);assert.equal(exact(checks,host(b.measure.requiredChecks)),true,'only one AO required check added');assert.equal(a.measure.score,b.measure.score+10000,'exact one extra ready required-check contribution');for(const key of ['manual','speedTarget','routeStatus','complete','scoutingExempt'])assert.equal(exact(host(a.measure[key]),host(b.measure[key])),true,key+' unchanged');assert.equal(a.readiness.status,b.readiness.status);assert.equal(a.readiness.registeredReady,b.readiness.registeredReady);assert.equal(after.c.hdFEOneFiveAswSelection(after.built.plan).state,'legacy-default');assert.equal(after.c.hdFEOneFiveAswSelection(after.built.plan).count,3);observations.precedingCohortParity.push({cohort,state,initialDeploymentWholeDirectExact:true,requirementsWholeDirectExact:true,approvedAOOnlyMeasureDelta:true,generatorInvocations:0});unchanged(before);unchanged(after)}
});

test('1-5 selected ASW stock shortage uses four legal candidate hulls and keeps slot conflict or unknown profiles unresolved',()=>{
 const h=prepare('after',input,'stock'),{c}=h,plan=h.built.plan,goal={kind:'cap-asw',minCount:3,generatedFromMap:false,purpose:'strategy'},stock=c.hdSECapabilityStock(plan,'cap-asw',3),targets=host(c.hdOCFourOneAswTargets(plan,goal,stock));assert.deepEqual(host(stock.parts.map(x=>({part:x.part,need:x.need,have:x.have}))),[{part:'sonar',need:3,have:3},{part:'projector',need:3,have:2}]);assert.deepEqual(targets.map(x=>x.ship),input.ships.map(x=>x.name));for(const target of targets){assert.equal(target.status,'candidate');assert.deepEqual(target.parts.map(x=>({part:x.part,count:x.count,slots:x.slots.map(s=>s.index)})),[{part:'sonar',count:1,slots:[0,1,2]},{part:'projector',count:1,slots:[0,1,2]}]);assert.equal(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index)),true)}const original=c.hdShipDbSlotProfile,name=input.ships[1].name;try{c.hdShipDbSlotProfile=db=>db?.name===name||db?.final===name?{...original(db),count:1,slots:[0]}:original(db);assert.equal(host(c.hdOCFourOneAswTargets(plan,goal,stock)).some(x=>x.ship===name),false);c.hdShipDbSlotProfile=db=>db?.name===name||db?.final===name?null:original(db);assert.deepEqual(host(c.hdOCFourOneAswTargets(plan,goal,stock)).find(x=>x.ship===name),{ship:name,shipIndex:1,status:'manual',parts:[]})}finally{c.hdShipDbSlotProfile=original}unchanged(h);
});

// OP storage, signature and entry-eligibility boundary tests are appended after
// the actual owner API is frozen. No guessed UI/storage setter is invoked.


test('1-5 actual ASW-choice reader and writer preserve unrelated roots metadata and invalid opaque input',()=>{
 const h=prepare(),{c}=h,key='harbordesk-asw-set-choices-v1',scope='1-5:'+h.fleet.id+':1',originalStore=host([...h.store]),set=c.localStorage.setItem,writes=[];
 c.localStorage.setItem=(k,v)=>{assert.equal(k,key);assert.equal(typeof v,'string');writes.push(k);h.store.set(k,v)};
 try{
  const root={'1-1:unrelated:0':{state:'count',count:2,metadata:{keep:true}},[scope]:{state:'count',count:3,metadata:{keep:['source','order']},opaque:{keep:['extra','body']}}};h.store.set(key,JSON.stringify(root));
  for(const [value,state,count]of [['1','count',1],['2','count',2],['off','off',null],['unselected','unselected',null],['3','count',3]]){assert.equal(c.hdOCAswSetSave(h.ctx,value),true);const read=host(c.hdOCAswSetRead(h.ctx)),captured=host(c.hdOCAswSetCapture(h.ctx));assert.equal(read.error,null);assert.deepEqual(read.root['1-1:unrelated:0'],root['1-1:unrelated:0']);assert.deepEqual(read.active.metadata,root[scope].metadata);assert.deepEqual(read.active.opaque,root[scope].opaque);if(state!=='count')assert.equal(Object.hasOwn(read.active,'count'),false);assert.equal(captured.selection.state,state);assert.equal(captured.selection.count,count);assert.equal(c.hdOCSignature(h.ctx),c.hdOCSignature(h.ctx,c.hdOCAswSetInput(h.ctx)))}
  const beforeLegacy=h.store.get(key);assert.throws(()=>c.hdOCAswSetSave(h.ctx,'legacy'));assert.equal(h.store.get(key)===beforeLegacy,true,'legacy action never discards active metadata or opaque fields');assert.equal(writes.length,5);
  for(const raw of ['not-json','null','[]',JSON.stringify({[scope]:null}),JSON.stringify({[scope]:{state:'unknown',count:3,opaque:{keep:true}}})]){h.store.set(key,raw);const count=writes.length;assert.equal(c.hdOCAswSetCapture(h.ctx).selection.state,'invalid');assert.throws(()=>c.hdOCAswSetSave(h.ctx,'2'));assert.equal(h.store.get(key)===raw,true,'opaque/invalid backing value remains exact (body omitted)');assert.equal(writes.length,count,'no overwrite after invalid input')}
  const get=c.localStorage.getItem,readCount=writes.length;try{c.localStorage.getItem=k=>{if(k===key)throw Error('synthetic read unavailable');return get(k)};assert.equal(c.hdOCAswSetCapture(h.ctx).selection.state,'invalid');assert.throws(()=>c.hdOCAswSetSave(h.ctx,'2'));assert.equal(writes.length,readCount)}finally{c.localStorage.getItem=get}
 }finally{c.localStorage.setItem=set;h.store.clear();for(const [k,v]of originalStore)h.store.set(k,v)}unchanged(h);
});

test('1-5 direct search guard stops invalid or empty-only unset but preserves OASW and other explicit goals',()=>{
 const h=prepare(),{c}=h,plan=host(h.built.plan),base={...host(c.hdOCAswSetCapture(h.ctx)),plan:{...host(plan),aswSetSelection:{state:'unselected'}},selection:{applicable:true,state:'unselected',count:null},scope:{applicable:true}},rows=host(c.hdSEChecks('1-5').rows);
 assert.equal(c.hdOCAswSetCanSearch(base,null,[],base.plan),false);assert.throws(()=>c.hdOCAswSetRequire(base,null,[],base.plan),e=>e.code==='HD_OC_ASW_SET_UNSELECTED');
 const oasw={...host(base.plan),openingAswCount:2},oaswReq=c.hdFEEquipmentRequirements(oasw,rows),oaswMeasure=c.hdOCMeasure(oasw,rows);assert.equal(c.hdOCAswSetCanSearch(base,null,oaswReq,oasw),true);assert.equal(oaswMeasure.goals.some(g=>g.kind==='cap-asw'),false);assert.equal(oaswMeasure.goals.find(g=>g.kind==='opening-asw').minCount,2);
 const other=[{kind:'cap-water-attack',minCount:2,purpose:'strategy',generatedFromMap:false,metadata:{keep:'other'}}],otherReq=c.hdFEEquipmentRequirements(base.plan,other);assert.equal(c.hdOCAswSetCanSearch(base,null,otherReq,base.plan),true);assert.equal(otherReq.some(g=>g.kind==='cap-asw'),false);assert.deepEqual(host(otherReq.find(g=>g.kind==='cap-water-attack')),other[0]);
 const invalid={...host(base),selection:{state:'invalid',count:null}};for(const [p,r]of [[oasw,oaswReq],[base.plan,otherReq]]){assert.equal(c.hdOCAswSetCanSearch(invalid,null,r,p),false);assert.throws(()=>c.hdOCAswSetRequire(invalid,null,r,p),e=>e.code==='HD_OC_ASW_SET_INVALID')}
 const key='harbordesk-asw-set-choices-v1',raw=h.store.get(key),scope='1-5:'+h.fleet.id+':1';try{h.store.set(key,JSON.stringify({[scope]:null}));const it=c.hdOCSearchSteps(h.ctx);assert.throws(()=>it.next(),e=>e.code==='HD_OC_ASW_SET_INVALID');h.store.set(key,JSON.stringify({[scope]:{state:'unselected'}}));const empty=c.hdOCSearchSteps(h.ctx);assert.throws(()=>empty.next(),e=>e.code==='HD_OC_ASW_SET_UNSELECTED')}finally{h.store.set(key,raw)}unchanged(h);
});

test('1-5 count snapshots bind signature and build while alternative eligibility uses the same quantity rule',()=>{
 const h=prepare(),{c}=h,key='harbordesk-asw-set-choices-v1',raw=h.store.get(key),scope='1-5:'+h.fleet.id+':1';try{
  const signatures=[];let capturedOne;for(const choice of [{state:'count',count:1},{state:'count',count:2},{state:'off'},{state:'unselected'}]){h.store.set(key,JSON.stringify({[scope]:choice}));const capture=c.hdOCAswSetCapture(h.ctx);signatures.push(c.hdOCSignature(h.ctx,capture));const built=c.hdOCBuild(h.ctx,capture);assert.deepEqual(host(built.plan.aswSetSelection),choice);assert.equal(c.hdFEOneFiveAswSelection(built.plan).state,choice.state);if(choice.count===1)capturedOne=capture;assert.equal(c.hdOCAswSetCanSearch(capture,h.ctx),choice.state!=='unselected')}
  assert.equal(new Set(signatures).size,4,'count1/count2/off/unselected cache signatures distinct');assert.notEqual(c.hdOCSignature(h.ctx,capturedOne),c.hdOCSignature(h.ctx));assert.deepEqual(host(c.hdOCBuild(h.ctx,capturedOne).plan.aswSetSelection),{state:'count',count:1},'captured build never rereads later quantity');
  const alternativeSource=c.hdOCFindAlternatives.toString();assert.match(alternativeSource,/hdOCAswSetCapture\(candidateContext\)/);assert.match(alternativeSource,/if\(!hdOCAswSetCanSearch\(aswChoice,candidateContext\)\)/);assert.match(alternativeSource,/asw-set-target-unselected/);assert.match(alternativeSource,/hdOCSearchSteps\(candidateContext/);
 }finally{h.store.set(key,raw)}unchanged(h);
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
function search(h){assert.equal(unsafeMutation,false);observations.generatorInvocations.push({role:h.role,cohort:h.cohort||'new-CL1DD3',state:h.state});const iterator=h.c.hdOCSearchSteps(h.ctx);let yields=0,result;for(;;){const step=h.c.hdFEWithShipLookup(()=>iterator.next());if(step.done){result=step.value;break}yields++}unchanged(h);return {result,yields,allocation:classify(h,result.plan)}}



const {currentOneFiveBrowserInputs}=require(path.join(ROOT,'tests/fixtures/one-five-current-browser-expectations.cjs'));
const CURRENT_MODELS=[...['known','stock','unknown'].map(state=>({cohort:'new-CL1DD3',fixture:input,state,selected:true})),...OLD_COHORTS.map(([cohort,historical])=>({cohort,fixture:currentOneFiveBrowserInputs(historical),state:'unknown',selected:true,historicalCurrentDelta:true}))];
for(const row of CURRENT_MODELS)test('1-5 current '+row.cohort+' '+row.state+' model retains legal user quantity and explicit termination',()=>{
 const h=prepare('after',row.fixture,row.state,{state:'count',count:3});h.cohort=row.cohort;const x=initial(h),run=search(h),r=run.result,route=h.c.hdFERoute(r.plan),projection={goals:host(goalProjection({route,measure:r.measure})),route:route.status,readiness:r.readiness.status,measureComplete:r.measure.complete,registeredReady:r.readiness.registeredReady,searchStatus:r.search.status,requiredChecks:host(r.measure.requiredChecks.map(y=>({status:y.status??null,ok:y.ok??null,unresolved:!!y.unresolved}))),assignedRegistered:run.allocation.registered,assignedUnregistered:run.allocation.unregistered,sourceIssueCount:(r.plan.preservationIssues||[]).length};
 observations.modelCases.push({cohort:row.cohort,state:row.state,userSelection:{state:'count',count:3},initial:{route:host(x.route),requirements:host(x.requirements),measure:host(x.measure),readiness:host(x.readiness)},searched:{result:host(r),yields:run.yields,allocation:run.allocation},searchedProjection:projection,sourceStringsDirectExact:true,modelStorageWrites:0,historicalCurrentDelta:!!row.historicalCurrentDelta});
 const expected=row.fixture.modelExpectation[row.state].initial;assert.deepEqual(host(goalProjection(x)),expected.goals);assert.equal(x.route.status,expected.route);assert.equal(x.measure.complete,expected.measureComplete);assert.deepEqual(host(x.requirements.map(g=>({kind:g.kind,minCount:g.minCount??null,generatedFromMap:g.generatedFromMap===true}))),expected.requirements);
 if(row.historicalCurrentDelta){const old=row.fixture.modelExpectation[row.state].searched;assert.deepEqual(projection,old,'only source-independent approved current deltas; no new measured numbers substituted')}else if(input.preparationState==='model-observation-frozen'){assert.ok(input.modelExpectation[row.state].searched);assert.deepEqual(projection,input.modelExpectation[row.state].searched,'frozen actual new-cohort searched projection exact')}else{assert.equal(input.preparationState,'source-expected');assert.equal(input.modelExpectation[row.state].searched,null,'no unobserved searched numbers')}
 assert.equal(r.search.maxExamined,10000);assert.equal(r.search.maxDepth,24);assert.equal(r.search.exhaustive,false);assert.equal(r.search.portSeed.maxOperations,800);assert.ok(r.search.reasons.length>0);assert.equal(r.plan.openingAswCount,0);assert.deepEqual(host(r.plan.aswSetSelection),{state:'count',count:3});const asw=r.measure.goals.find(g=>g.kind==='cap-asw');assert.equal(asw.minCount,3);assert.equal(asw.purpose,'strategy');assert.equal(asw.generatedFromMap,false);assert.ok(Number.isInteger(asw.count)&&asw.count>=0&&asw.count<=3);assert.equal(route.status,row.state==='unknown'?'manual':'ready');
 if(row.cohort==='new-CL1DD3'){assert.equal(r.measure.goals.some(g=>g.kind==='opening-asw'||g.kind==='cap-water-attack'),false);assert.equal(r.plan.ships.flatMap(s=>s.items).some(item=>item.name==='瑞雲'),false,'owned water aircraft unused without default goal');if(row.state==='known'){assert.equal(asw.count,3);assert.equal(r.measure.complete,true);assert.equal(run.allocation.registered,6);assert.equal(run.allocation.unregistered,0);const receivers=r.plan.ships.filter(s=>s.items.some(i=>i.name==='三式水中探信儀')&&s.items.some(i=>i.name==='三式爆雷投射機'));assert.equal(receivers.length,3);for(const ship of receivers)assert.notEqual(ship.items.find(i=>i.name==='三式水中探信儀').slotIndex,ship.items.find(i=>i.name==='三式爆雷投射機').slotIndex)}if(row.state==='stock'){assert.ok(asw.count<=2,'two owned projectors cannot form three sets');assert.equal(r.measure.complete,false)}}
 if(row.state==='unknown'){assert.ok(r.plan.preservationIssues.length);assert.equal(r.readiness.registeredReady,false);assert.equal(r.measure.complete,false)}unchanged(h);
});
