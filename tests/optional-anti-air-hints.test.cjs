'use strict';
// Display-only recommendations are separate from inventory goals and route gates.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createTwoFiveCeioModelContext}=require('./fixtures/two-five-ceio-model-context.cjs');
const {createOptionalAntiAirHistoricalProjection}=require('./fixtures/optional-anti-air-source-layer.cjs');
const ROOT=path.resolve(__dirname,'..'),host=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function context(options={}){return createTwoFiveCeioModelContext(options)}
function selected(h,map,index){return {index,preset:host(h.value(`MAP_PLANS[${JSON.stringify(map)}].presets[${index}]`))}}
function actualFunction(h,file,name,project=null){
 let source=fs.readFileSync(path.join(ROOT,file),'utf8');if(project)source=project(file,source);
 const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0,name+' actual function');assert.equal(source.split('function '+name+'(').length,2,name+' unique declaration');vm.runInContext(source.slice(start,end<0?undefined:end),h.c,{filename:file+'#actual-'+name});return h.c[name];
}
function installedMapHtml(h,map){assert.equal(h.c.hdSEInstall(),true);const first=h.c.hdMapEquipRecommendationsHtml(map);assert.equal(h.c.hdSEInstall(),false);assert.equal(h.c.hdMapEquipRecommendationsHtml(map),first,'repeat installation does not duplicate the optional channel');return first}
const marker=html=>(html.match(/data-hd-optional-aa=/g)||[]).length;
const SHIP_CONDITIONS={'akizuki-radar':'akizuki','generic-two':'not-akizuki','generic-one':'not-akizuki','akizuki-two':'akizuki','director-radar':'not-akizuki','director-two':null};
const QUANTITIES={
 'akizuki-radar':[['ha',2],['radar',1]],
 'generic-two':[['specialHa',2],['aaRadar',1]],
 'generic-one':[['specialHa',1],['aaRadar',1]],
 'akizuki-two':[['ha',2]],
 'director-radar':[['ha',1],['director',1],['aaRadar',1]],
 'director-two':[['ha',1],['director',1]]
};
function material(map,index){
 const h=context(),{c}=h,names=index===1&&map==='4-2'?['翔鶴改二','瑞鳳改二','島風改','夕立改二','時雨改二','雪風改']:['翔鶴改二','瑞鳳改二','矢矧改二','島風改','夕立改二','時雨改二'];
 const rows=names.map((name,i)=>{const db=c.hdFEFindShip(name),master=c.hdShipDbMasterRowFor(db),profile=c.hdShipDbSlotProfile(db);return {id:'optional-aa-'+i,name,masterId:master.id,gameShipId:426100+i,level:90,gameSlotEx:0,gameLos:100,gameAswGearKnown:true,gameGearSlots:Array(profile.count).fill(''),gameGearExpansion:'',metadata:{keep:i}}});
 h.seed('harbordesk-ship-roster-v1',rows);h.seed('harbordesk-equipment-v1',[{name:'10cm連装高角砲＋高射装置',count:2,star:0},{name:'13号対空電探改',count:1,star:0}]);h.seed('harbordesk-kancolle-sync-v1',{admiralLevel:120});h.seed('harbordesk-kancolle-fleets-v1',[{deckId:1,ships:rows.map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]);
 const choice=selected(h,map,index),fleet={id:'optional-aa-synthetic',routePreset:choice.preset,memo:'retain memo',metadata:{keep:true},ships:rows.map(row=>({ship:row.name,rosterId:row.id,masterId:row.masterId,gameShipId:row.gameShipId,gear:row.gameGearSlots.join(' / '),metadata:row.metadata}))},plan=c.hdFEPlanFromSavedFleet(map,fleet);plan.routeIndex=index;plan.openingAswCount=0;
 return {...h,map,index,choice,fleet,plan};
}
function actualGoals(h){const {c,plan}=h,se=c.hdSEChecks(h.map).rows,fe=c.hdFEEquipmentRequirements(plan,se),fl=c.hdFLRequirements(plan),measure=c.hdOCMeasure(plan,fl);return host({profiles:c.hdSEProfiles(h.map),se,fe,fl,goals:measure.goals,requiredChecks:measure.requiredChecks})}

test('optional AA approved inverse restores and replays the exact preceding UI sources',()=>{
 const project=createOptionalAntiAirHistoricalProjection(ROOT),approved=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/optional-anti-air-approved-source-inverses.json'),'utf8'));
 assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'ba762601583d06a777420dc2f033180c6b3abb25');assert.deepEqual(Object.keys(approved.files).sort(),['owned-equipment-planner.js','sortie-equipment-check.js']);
 for(const [file,row]of Object.entries(approved.files)){const current=fs.readFileSync(path.join(ROOT,file),'utf8'),previous=project(file,current);assert.equal(hash(current),row.approvedAfterSHA256);assert.equal(hash(previous),row.beforeSHA256);assert.notEqual(previous,current);assert.throws(()=>project(file,current+'\n'));assert.throws(()=>project(file,previous))}assert.equal(project('unrelated-source.js','unchanged'),'unchanged');
});

test('the old map-wide negative omits AA examples while the new independent display channel leaves old needs untouched',()=>{
 const project=createOptionalAntiAirHistoricalProjection(ROOT),old=context({project}),current=context();
 for(const map of ['4-2','2-4']){const previous=host(old.c.hdMapEquipNeeds(map));assert.equal(previous.needs.some(x=>x.id==='防空'),false,map+' previous omission');assert.deepEqual(host(current.c.hdMapEquipNeeds(map)),previous,'display fix must not create a generic equipment goal');assert.equal(old.c.hdSEProfiles(map).some(x=>x.kind==='cap-aa'),false);assert.equal(current.c.hdSEProfiles(map).some(x=>x.kind==='cap-aa'),false);assert.equal(old.c.hdSEOptionalAaAdvice,undefined);assert.equal(marker(old.c.hdMapEquipRecommendationsHtml(map)),0);assert.equal(current.c.hdSEOptionalAaAdvice(map).status,'ready')}
 const oldNormal=host(old.c.hdSEProfiles('5-2'));assert.equal(oldNormal.some(x=>x.kind==='cap-aa'),true,'already graph-air-positive route is an independent control');assert.deepEqual(host(current.c.hdSEProfiles('5-2')),oldNormal);
});

test('4-2 map and both registered selected scopes share only conditional battle examples without asserting a fixed start',()=>{
 const h=context(),{c}=h;
 for(const choice of [undefined,selected(h,'4-2',0),selected(h,'4-2',1)]){const advice=choice===undefined?c.hdSEOptionalAaAdvice('4-2'):c.hdSEOptionalAaAdvice('4-2',choice);assert.equal(advice.status,'ready');assert.equal(advice.scope,choice===undefined?'map':'selected');assert.equal(advice.map,'4-2');assert.deepEqual(host(advice.nodes),['C','D','L']);assert.equal(advice.conditional,false,'the bool denotes routing:random, not air-pattern probability');if(choice)assert.equal(advice.path,'ACL / BDCL');assert.match(advice.note,/ACL/);assert.match(advice.note,/BDCL/);assert.match(advice.note,/C/);assert.match(advice.note,/D/);for(const key of ['minCount','owned','shortfall','probability','arrivalGuaranteed'])assert.equal(Object.hasOwn(advice,key),false,key+' is not a recommendation field')}
});

test('2-4 random route examples remain conditional on visiting the named battle nodes',()=>{
 const h=context(),{c}=h;
 for(const advice of [c.hdSEOptionalAaAdvice('2-4'),c.hdSEOptionalAaAdvice('2-4',selected(h,'2-4',0))]){assert.equal(advice.status,'ready');assert.deepEqual(host(advice.nodes),['L','M']);assert.equal(advice.conditional,true);assert.match(advice.note,/進む|通る|経由/);assert.match(advice.note,/ランダム/);assert.equal(Object.hasOwn(advice,'probability'),false);assert.equal(Object.hasOwn(advice,'minCount'),false)}
});

test('absent selection is map scope but explicit invalid or noncanonical selection stays manual with no recipe quantities',()=>{
 const h=context(),{c}=h,good=selected(h,'4-2',0),changed=host(good);changed.preset.ships+='（利用者指定）';const inherited=Object.create(good),accessor={preset:good.preset};Object.defineProperty(accessor,'index',{get(){throw Error('selection accessor must not be consumed')}});
 assert.equal(c.hdSEOptionalAaAdvice('4-2').scope,'map');
 for(const choice of [undefined,null,{},[],{index:'0',preset:good.preset},{index:-1,preset:good.preset},{index:2,preset:good.preset},{index:0,preset:null},changed,inherited,accessor]){const advice=c.hdSEOptionalAaAdvice('4-2',choice);assert.equal(advice.status,'manual');assert.equal(advice.scope,'selected');assert.deepEqual(host(advice.nodes),[]);assert.deepEqual(host(advice.recipes),[]);assert.equal(advice.conditional,null);assert.equal(advice.path,'');const html=c.hdSEOptionalAaAdviceHtml('4-2',choice);assert.match(html,/data-hd-optional-aa-status="manual"/);assert.doesNotMatch(html,/data-hd-optional-aa-count=/)}
 assert.equal(c.hdSEOptionalAaAdvice('2-4',{index:1,preset:good.preset}).status,'manual');
});

test('unsupported maps do not borrow this batch proof including a mixed-pattern 3-1 and the nonair selected 7-1 path',()=>{
 const h=context(),{c}=h;
 for(const map of ['1-5','3-1','5-2','7-1','7-4','unknown','__proto__','']){assert.equal(c.hdSEOptionalAaAdvice(map),null);assert.equal(c.hdSEOptionalAaAdviceHtml(map),'')}
 const mixed=h.value("HD_MAP_AIR_DATA['3-1'].nodes.G.patterns");assert.equal(mixed.some(x=>x.air>0),true);assert.equal(mixed.some(x=>x.air===0),true,'3-1 is not a blanket no-air oracle');
 assert.equal(c.hdSEOptionalAaAdvice({toString(){throw Error('map coercion')}}),null);
});

test('same-hull recipe parts retain their independent literal quantities and are never a target set count',()=>{
 const h=context(),advice=h.c.hdSEOptionalAaAdvice('4-2');assert.deepEqual(host(advice.recipes.map(x=>x.id)),Object.keys(QUANTITIES));
 for(const recipe of advice.recipes){assert.equal(recipe.shipCondition,SHIP_CONDITIONS[recipe.id]);assert.deepEqual(host(recipe.parts.map(x=>[x.kind,x.count])),QUANTITIES[recipe.id]);for(const part of recipe.parts){assert.equal(Number.isSafeInteger(part.count)&&part.count>0,true);assert.equal(typeof part.label,'string');assert.ok(part.examples.length);assert.equal(part.examples.every(x=>typeof x==='string'),true);for(const key of ['owned','need','shortfall','minCount'])assert.equal(Object.hasOwn(part,key),false,key+' not invented')}assert.equal(Object.hasOwn(recipe,'minCount'),false)}
 const html=h.c.hdSEOptionalAaAdviceHtml('4-2');assert.match(html,/同じ艦/);assert.match(html,/艦隊に必要な組数を示すものではありません/);assert.doesNotMatch(html,/目標組数は未指定/);assert.match(html,/対象：秋月型/);assert.match(html,/対象：秋月型以外/);assert.match(html,/搭載可否・艦固有条件は別途確認/);assert.match(html,/任意/);assert.doesNotMatch(html,/(?:あと|必要数|不足数)\s*[:：]?\s*\d|data-hd-oc-acquire|class="hd-oc-goal/);
});

test('advice returns fresh recipe part and example values without exposing shared mutable tables',()=>{
 const h=context(),{c}=h,source=h.value('JSON.stringify({recipes:HD_SE_RECIPES["cap-aa"],parts:HD_SE_PARTS})'),first=c.hdSEOptionalAaAdvice('4-2'),expected=host(first);first.recipes[0].parts[0].count=99;first.recipes[0].parts[0].examples.push('mutated outside');first.nodes.push('Z');assert.deepEqual(host(c.hdSEOptionalAaAdvice('4-2')),expected);assert.equal(h.value('JSON.stringify({recipes:HD_SE_RECIPES["cap-aa"],parts:HD_SE_PARTS})'),source);
});

test('the pure advice and HTML functions add no Storage inventory capability timer or DOM access',()=>{
 const h=material('4-2',0),{c}=h,reads=h.reads.length,writes=h.writes.length,store=JSON.stringify([...h.store]),fleet=JSON.stringify(h.fleet),calls={},restore=[];
 for(const name of ['hdFLInventory','hdSEOwned','hdSECapabilityStock','hdSEProfiles','hdSEChecks']){const fn=c[name];assert.equal(typeof fn,'function',name+' real dependency');calls[name]=0;c[name]=function(...args){calls[name]++;return Reflect.apply(fn,this,args)};restore.push([name,fn])}
 try{c.hdSEOptionalAaAdvice('4-2');c.hdSEOptionalAaAdvice('4-2',h.choice);c.hdSEOptionalAaAdviceHtml('4-2');c.hdSEOptionalAaAdviceHtml('4-2',h.choice)}finally{for(const [name,fn]of restore)c[name]=fn}
 assert.equal(h.reads.length,reads);assert.equal(h.writes.length,writes);assert.equal(JSON.stringify([...h.store]),store);assert.equal(JSON.stringify(h.fleet),fleet);assert.deepEqual(Object.values(calls),Array(Object.keys(calls).length).fill(0));
});

test('optional display cannot add or rewrite SE FE FL OC goals or explicit user quantities in the three supported scopes',()=>{
 for(const [map,index]of [['4-2',0],['4-2',1],['2-4',0]]){const h=material(map,index),before=actualGoals(h),store=JSON.stringify([...h.store]),fleet=JSON.stringify(h.fleet),explicit=h.c.hdFEEquipmentRequirements(h.plan,[{kind:'cap-aa',label:'user selected AA',minCount:2,generatedFromMap:false,purpose:'strategy'}]),ownGoalsBefore=host(h.c.hdOCMeasure(h.plan,explicit).goals);h.c.hdSEOptionalAaAdviceHtml(map,h.choice);assert.deepEqual(actualGoals(h),before,map+':'+index+' complete model vectors unchanged');for(const rows of [before.se,before.fe,before.fl,before.goals])assert.equal(rows.some(x=>x.kind==='cap-aa'||x.id==='防空'),false,'no automatic AA1 goal');assert.equal(explicit.find(x=>x.kind==='cap-aa').minCount,2);assert.equal(explicit.find(x=>x.kind==='cap-aa').generatedFromMap,false);const ownGoalsAfter=host(h.c.hdOCMeasure(h.plan,explicit).goals);assert.deepEqual(ownGoalsAfter,ownGoalsBefore);assert.equal(ownGoalsAfter.find(x=>x.kind==='cap-aa').minCount,2);assert.equal(ownGoalsAfter.find(x=>x.kind==='cap-aa').purpose,'strategy');const ownGoalHtml=h.c.hdSEOptionalAaAdviceHtml(map,h.choice);assert.match(ownGoalHtml,/艦隊に必要な組数を示すものではありません/);assert.doesNotMatch(ownGoalHtml,/目標組数は未指定/);assert.equal(JSON.stringify([...h.store]),store);assert.equal(JSON.stringify(h.fleet),fleet);assert.equal(h.writes.length,0)}
});

test('missing or malformed recommendation data stays manual instead of inventing part labels or counts',()=>{
 for(const change of ["HD_SE_RECIPES['cap-aa']=[]","HD_SE_RECIPES['cap-aa'][0].parts=[]","HD_SE_RECIPES['cap-aa'][0].parts=['ha','unknown-part']","delete HD_SE_PARTS.ha","HD_SE_RECIPES['cap-aa'][0].ship='unknown-family'","HD_SE_RECIPES['cap-aa'][0].ship=null"]){const h=context();h.value(change);const advice=h.c.hdSEOptionalAaAdvice('4-2');assert.equal(advice.status,'manual');assert.deepEqual(host(advice.recipes),[]);assert.doesNotMatch(h.c.hdSEOptionalAaAdviceHtml('4-2'),/data-hd-optional-aa-count=/)}
 const h=context();h.value("HD_MAP_ROUTE_REQUIREMENTS['4-2'][0].path='unknown route'");assert.equal(h.c.hdSEOptionalAaAdvice('4-2',selected(h,'4-2',0)).status,'manual');
 const separate=context();separate.value("HD_MAP_ROUTE_REQUIREMENTS['4-2'][1].path='unknown route'");assert.equal(separate.c.hdSEOptionalAaAdvice('4-2').status,'manual');assert.equal(separate.c.hdSEOptionalAaAdvice('4-2',selected(separate,'4-2',0)).status,'ready','an unrelated invalid scope does not erase the selected known scope');assert.equal(separate.c.hdSEOptionalAaAdvice('4-2',selected(separate,'4-2',1)).status,'manual');
});

test('escaped optional markup stays separate from requirement cards and from the legacy capability panel class',()=>{
 const h=context();h.value("HD_SE_PARTS.ha.label='<script>label</script>';HD_SE_PARTS.ha.examples=['<img src=x onerror=alert(1)>']");const html=h.c.hdSEOptionalAaAdviceHtml('4-2');assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<script>|<img/);assert.equal(marker(html),1);assert.match(html,/hd-se-optional-aa/);assert.doesNotMatch(html,/class="hd-se-capabilities|class="hd-se-check|data-hd-optional-aa-selected|data-hd-oc-acquire/);
});

test('actual map gear installation and OC panel include the same optional channel once with distinct scopes',()=>{
 const h=context(),html=installedMapHtml(h,'4-2');assert.equal(marker(html),1);assert.match(html,/data-hd-optional-aa-scope="map"/);assert.equal(marker(h.c.hdMapEquipRecommendationsHtml('2-4')),1);assert.equal(marker(h.c.hdMapEquipRecommendationsHtml('5-2')),0);
 actualFunction(h,'map-strategy-navigator.js','hdMSNPresets');actualFunction(h,'owned-equipment-planner.js','hdOCPanel');
 for(const index of [0,1]){const panel=h.c.hdOCPanel('4-2','',String(index));assert.equal(marker(panel),1);assert.match(panel,/data-hd-optional-aa-scope="selected"/);assert.match(panel,/data-hd-optional-aa-status="ready"/);assert.match(panel,/data-hd-oc-search/)}
});
