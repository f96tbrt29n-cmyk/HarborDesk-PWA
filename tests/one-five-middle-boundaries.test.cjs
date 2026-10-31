'use strict';
// Reviewed source-inverse regression; before mode is an explicit counterexample control.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(process.env.HD15_SOURCE_ROOT||path.join(__dirname,'..')),INVERSE=path.resolve(process.env.HD15_APPROVED_INVERSES||path.join(ROOT,'tests/fixtures/one-five-middle-approved-source-inverses.json')),MODE=process.env.HD15_BOUNDARY_MODE||'after';
assert.ok(['before','after'].includes(MODE));
const HASH={before:{'owned-equipment-planner.js':'ea8f63e332cf20ec5a289a806cbc2e6e7c92f4b94d0b69f116a0fe7c324b5088','sortie-equipment-check.js':'47d0ec7a694d715ce042c425134c15f73db748b70c67406c4b4725e5259fa0f3'},after:{'owned-equipment-planner.js':'c458417d7140978b0a24f1d048804c198535ce288e0f6a236be02d30be13baf9','sortie-equipment-check.js':'d26fa06d8d1fb47898121fbc70f23935cb2f29ca29ba62b5e3e96e1766b405d2'}};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),clone=x=>structuredClone(x),plain=x=>JSON.parse(JSON.stringify(x));
const approvedBytes=fs.readFileSync(INVERSE);assert.equal(hash(approvedBytes),'917765fe143f9bd5f6d9aa04b757ad979873138899a305ab6b5148ba8854423f');const approved=JSON.parse(approvedBytes);
assert.equal(approved.schemaVersion,1);assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(HASH.after).sort());assert.equal(approved.changes.length,29);
for(const file of Object.keys(HASH.after)){assert.equal(approved.files[file].beforeSHA256,HASH.before[file]);assert.equal(approved.files[file].approvedAfterSHA256,HASH.after[file])}
function sources(mode){return Object.fromEntries(Object.keys(HASH[mode]).map(file=>{const bytes=fs.readFileSync(path.join(ROOT,file));assert.equal(hash(bytes),HASH.after[file],file+' approved whole current source');let text=bytes.toString('utf8');if(mode==='before')for(const change of approved.changes.filter(row=>row.file===file).reverse()){assert.equal(text.split(change.after).length,2,file+' unique inverse');text=text.replace(change.after,change.before)}assert.equal(hash(Buffer.from(text)),HASH[mode][file],file+' frozen '+mode+' whole source');return [file,text]}))}
const source=sources(MODE),oldSource=sources('before'),MAP=fs.readFileSync(path.join(ROOT,'map-plans.js'),'utf8');
function span(text,name){const needle='function '+name+'(',start=text.indexOf(needle);assert.ok(start>=0,name);assert.equal(text.indexOf(needle,start+needle.length),-1,name+' unique definition');const end=text.indexOf('\nfunction ',start+needle.length);return text.slice(start,end<0?undefined:end)}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const ASW='cap-asw',WATER='cap-water-attack',SONAR='三式水中探信儀',PROJECTOR='三式爆雷投射機',PLANE='瑞雲';
const CATALOG=[{name:SONAR,part:'sonar',category:'ソナー'},{name:PROJECTOR,part:'projector',category:'爆雷投射機'},{name:PLANE,part:'waterAttackPlane',category:'水上爆撃機'}];
function seed(){
 const types={'unit-BBV':'航空戦艦','unit-DD1':'駆逐艦','unit-DD2':'駆逐艦','unit-DD3':'駆逐艦','unit-AV':'水上機母艦','unit-CA':'重巡洋艦'};
 const profiles=Object.fromEntries(Object.keys(types).map(name=>[name,{count:name==='unit-BBV'?4:3,slots:name==='unit-BBV'?[4,4,9,23]:name==='unit-AV'?[1,1,1]:[0,0,0]}]));
 return {types,profiles,plan:{map:'1-5',ships:['unit-BBV','unit-DD1','unit-DD2','unit-DD3'].map(ship=>({ship,items:[],metadata:{keep:ship}})),metadata:{keep:true}},inventory:{sonar:3,projector:3,waterAttackPlane:1},policy:'auto',rawMeasure:{}};
}
function context(mode,state=seed()){
 const s=state,stockCalls=[],panelCalls=[];
 const c={console,Map,Set,Math,JSON,Number,Object,Array,String,localStorage:new Proxy({},{get(){throw Error('unexpected Storage access in isolated display test')}})};
 c.window=c;vm.createContext(c);vm.runInContext(MAP,c,{filename:'map-plans.js#actual-declarations'});
 const db=name=>s.types[name]?{name,type:s.types[name]}:null,meta=name=>CATALOG.find(x=>x.name===name)||null;
 const profile=row=>row?s.profiles[row.name]||null:null;
 const compatible=(slot,item)=>{
  if(!slot.db||!slot.profile||!Number.isInteger(slot.index)||slot.index<0||slot.index>=slot.profile.count)return false;
  const allowed=slot.profile.allowedByPart?.[item.part];if(allowed&&!allowed.includes(slot.index))return false;
  if(item.part==='waterAttackPlane')return ['航空戦艦','水上機母艦'].includes(slot.db.type)&&Number.isFinite(slot.profile.slots[slot.index])&&slot.profile.slots[slot.index]>0;
  return slot.db.type==='駆逐艦'&&['sonar','projector'].includes(item.part);
 };
 const recipe=kind=>kind===ASW?{id:'sonar-projector',name:'ソナー＋投射機',parts:['sonar','projector']}:kind===WATER?{id:'water-attack',name:'水母・航戦：搭載枠に水上爆撃機',parts:['waterAttackPlane']}: {id:'night-unit',name:'night-unit',parts:[]};
 const measure=(plan,kind)=>{
  if(s.rawMeasure[kind])return clone(s.rawMeasure[kind]);
  const ships=(plan?.ships||[]).filter(row=>{
   const type=db(row.ship)?.type,names=(row.items||[]).map(x=>x.name);
   return kind===ASW?type==='駆逐艦'&&names.includes(SONAR)&&names.includes(PROJECTOR):kind===WATER?['航空戦艦','水上機母艦'].includes(type)&&names.includes(PLANE):false;
  }).map(x=>x.ship);
  return {count:ships.length,ships,ratio:ships.length?1:0};
 };
 const stock=(plan,kind,target=1)=>{
  stockCalls.push({kind,target,ships:(plan?.ships||[]).map(x=>x.ship)});
  const r=recipe(kind),parts=r.parts.map(part=>({part,label:{sonar:'ソナー',projector:'爆雷投射機',waterAttackPlane:'水上爆撃機'}[part],need:target,have:Math.min(target,s.inventory[part]||0),items:(s.inventory[part]||0)?[CATALOG.find(x=>x.part===part).name]:[]}));
  let usable=null;const complete=parts.every(p=>p.have>=p.need);
  if(complete)for(const ship of plan?.ships||[]){
   const row=db(ship.ship),p=profile(row);if(!row||!p)continue;
   const choices=r.parts.map(part=>Array.from({length:p.count},(_,index)=>({index,part})).filter(x=>compatible({db:row,profile:p,index:x.index},CATALOG.find(a=>a.part===part))));
   if(choices.length===1&&choices[0].length||choices.length===2&&choices[0].some(a=>choices[1].some(b=>a.index!==b.index))){usable={ship:ship.ship,complete:true};break}
  }
  return {recipe:r,parts,complete,matched:parts.filter(p=>p.have>=p.need).length,usable};
 };
 Object.assign(c,{
  hdSEEsc:esc,hdFEEsc:esc,hdFEFindShip:db,hdFEFind:meta,hdShipDbSlotProfile:profile,
  hdFLCatalog:()=>CATALOG.map(x=>({...x})),hdSEPartMatches:(part,row)=>(row.item||row.meta||row).part===part,
  hdOCCompatible:(slot,row)=>compatible(slot,row.item),hdSECapabilityMeasure:measure,hdSECapabilityStock:stock,
  hdSENightPolicy:()=>s.policy,hdSENightPolicyHtml:()=>'<div data-night-policy>'+esc(s.policy)+'</div>',
  hdSEProfiles:()=>[{kind:ASW,baseKind:'対潜',label:'対潜シナジー',importance:'任意',reason:'同艦のソナー＋投射機',note:'先制対潜人数とは別',source:'https://example.invalid/model'}].concat(s.policy==='auto'?[]:[{kind:'cap-night-dd',baseKind:'夜戦',label:'explicit-night',importance:'user',reason:'user',note:'user',source:'https://example.invalid/user'}]),
  hdSPSFleets:()=>[],hdSPSFleet:()=>null,
  HD_SE_PARTS:{sonar:{label:'ソナー',examples:[SONAR]},projector:{label:'爆雷投射機',examples:[PROJECTOR]},waterAttackPlane:{label:'水上爆撃機',examples:[PLANE]}},
  HD_SE_RECIPES:{[ASW]:[recipe(ASW)],[WATER]:[recipe(WATER)],'cap-night-dd':[recipe('cap-night-dd')]}
 });
 const text=mode==='before'?oldSource:source;
 for(const [file,name] of [['sortie-equipment-check.js','hdSECapabilityHtml'],['owned-equipment-planner.js','hdOCFourOneAswTargets'],['owned-equipment-planner.js','hdOCSixThreeWaterTargets'],['owned-equipment-planner.js','hdOCCapabilityStockHtml']])vm.runInContext(span(text[file],name),c,{filename:file+'#'+name});
 const preset=index=>vm.runInContext('MAP_PLANS["1-5"].presets['+index+']',c);
 const contract=(map,index)=>vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS['+JSON.stringify(map)+']['+index+']',c);
 c.hdFERouteRequirementData=plan=>contract(plan.map,1);
 return {c,s,stockCalls,panelCalls,preset,contract,render:(plan=s.plan,index=1)=>c.hdSECapabilityHtml('1-5','unit-fleet',plan,preset(index)),
  contextText:text,loadPanel(map,index){
   Object.assign(c,{hdFLInventory:()=>new Map(),HD_OC_CACHE:new Map(),HD_OC_PENDING:new Map(),hdOCContext:()=>({map,index,preset:vm.runInContext('MAP_PLANS['+JSON.stringify(map)+'].presets['+index+']',c),fleet:{id:'unit-fleet',name:'unit'}}),hdOCSignature:()=> 'unit-signature',hdMapRequirementsHtml:()=>'',hdOCRouteGoalHtml:()=>'',hdOCOaswTargetHtml:()=>'',hdOCPortHtml:()=>'',hdOCSavedSearchHtml:()=>'',hdSECapabilityHtml:function(...args){panelCalls.push(args);return '<div></div>'}});
   vm.runInContext(span(text['owned-equipment-planner.js'],'hdOCPanel'),c,{filename:'owned-equipment-planner.js#hdOCPanel'});return c.hdOCPanel(map,'unit-fleet',index);
  }};
}
function article(html,kind){const m=html.match(new RegExp('<article[^>]*data-hd-se-capability="'+kind+'"[\\s\\S]*?</article>'));return m?m[0]:null}
function goal(kind=ASW,extra={}){return {kind,generatedFromMap:true,purpose:'recommendation',minCount:kind===ASW?3:1,...extra}}
function untouched(state,operation){const before=clone(state);const value=operation();assert.deepEqual(state,before,'all supplied input/model metadata retained');return value}

test('1-5 selected index1 card aligns with the existing three-set and BBV example',()=>{
 const x=context(MODE),html=untouched(x.s,()=>x.render()),asw=article(html,ASW),water=article(html,WATER);
 assert.ok(asw);assert.match(asw,/data-hd-se-target-count="3"/);assert.match(asw,/目標3組/);
 assert.ok(water);assert.match(water,/data-hd-se-target-count="1"/);assert.match(water,/航空戦艦/);
 assert.match(html,/先制対潜人数/);assert.match(html,/購入数量/);
 assert.ok(x.stockCalls.some(row=>row.kind===ASW&&row.target===3));
 assert.ok(x.stockCalls.filter(row=>row.kind===WATER).every(row=>row.ships.length===1&&row.ships[0]==='unit-BBV'));
});

test('1-5 selected propagation and all unchanged preset display outputs retain their old boundaries',t=>{
 const rows=vm.runInContext('Object.entries(MAP_PLANS).flatMap(([map,value])=>(value.presets||[]).map((preset,index)=>({map,index})))',context('before').c);
 let compared=0;
 for(const row of rows){
  const before=context('before'),after=context('after'),plan=seed().plan;plan.map=row.map;
  if(!(row.map==='1-5'&&row.index===1))for(const count of [3,4]){
   const pre=vm.runInContext('MAP_PLANS['+JSON.stringify(row.map)+'].presets['+row.index+']',before.c),post=vm.runInContext('MAP_PLANS['+JSON.stringify(row.map)+'].presets['+row.index+']',after.c);
   const a=count===4?before.c.hdSECapabilityHtml(row.map,'unit',clone(plan),pre):before.c.hdSECapabilityHtml(row.map,'unit',clone(plan));
   const b=count===4?after.c.hdSECapabilityHtml(row.map,'unit',clone(plan),post):after.c.hdSECapabilityHtml(row.map,'unit',clone(plan));
   assert.equal(b,a,row.map+'/'+row.index+' old '+count+'arg display');compared++;
  }
 }
 for(const index of [0,1,2]){
  const x=context('after');x.loadPanel('1-5',index);assert.equal(x.panelCalls.length,1);assert.equal(x.panelCalls[0].length,index===1?4:2);
 }
 for(const [map,index]of [['3-1',0],['6-3',0],['6-5',0],['7-2',0],['7-3',0],['7-5',2]]){
  const a=context('before'),b=context('after');a.loadPanel(map,index);b.loadPanel(map,index);assert.equal(b.panelCalls[0].length,a.panelCalls[0].length,map+' old caller arity');
 }
 t.diagnostic(JSON.stringify({finiteSyntheticPresetDisplayComparisons:compared,notAllRouteLegalityOrBrowserProof:true}));
});

test('1-5 recommendation hints require exact route and strict origin while other scopes stay unchanged',()=>{
 for(const kind of [ASW,WATER])for(const generatedFromMap of [true,false,1,undefined])for(const purpose of ['recommendation','strategy']){
  const x=context('after'),g=goal(kind,{generatedFromMap,purpose}),stock=x.c.hdSECapabilityStock(x.s.plan,kind,g.minCount);
  const value=kind===ASW?x.c.hdOCFourOneAswTargets(x.s.plan,g,stock):x.c.hdOCSixThreeWaterTargets(x.s.plan,g);
  if(generatedFromMap===true&&purpose==='recommendation')assert.notEqual(value,null);else assert.equal(value,null);
 }
 for(const patch of [{index:0},{index:2},{map:'6-3'},{path:'other'}]){
  const x=context('after'),original=x.contract('1-5',1);x.c.hdFERouteRequirementData=()=>({...original,...patch});
  assert.equal(x.c.hdOCFourOneAswTargets(x.s.plan,goal(),x.c.hdSECapabilityStock(x.s.plan,ASW,3)),null);
  assert.equal(x.c.hdOCSixThreeWaterTargets(x.s.plan,goal(WATER)),null);
 }
 const malformed=context('after');malformed.c.hdMapPresetRequirements=()=>null;const h=malformed.render();assert.match(h,/data-hd-se-route-scope="manual"/);assert.doesNotMatch(h,/あと[0-9]/);
 // Descriptor integrity is independent of the supplied fleet and never invents
 // a one-set fallback. Count2 is a valid integer but not this frozen target3.
 for(const minCount of [null,0,1,2,4,7,8,-1,'3',NaN,undefined]){
  const x=context('after'),route=x.contract('1-5',1),equipmentTargets=plain(route.equipmentTargets).map(t=>t.kind===ASW?{...t,minCount}:t);
  x.c.hdMapPresetRequirements=()=>({...route,equipmentTargets});
  const html=untouched(x.s,()=>x.render());assert.match(html,/data-hd-se-route-scope="manual"/);assert.doesNotMatch(html,/data-hd-se-target-count|あと[0-9]/);assert.equal(x.stockCalls.length,0,'invalid count does not request stock');
 }
 for(const mode of ['missing-count','missing-asw','duplicate2-3','duplicate3-2','duplicate1-3','duplicate3-1','duplicate3-3']){
  const x=context('after'),route=x.contract('1-5',1);let equipmentTargets=plain(route.equipmentTargets);
  if(mode==='missing-count')equipmentTargets=equipmentTargets.map(t=>{if(t.kind!==ASW)return t;const copy={...t};delete copy.minCount;return copy});
  else if(mode==='missing-asw')equipmentTargets=equipmentTargets.filter(t=>t.kind!==ASW);
  else equipmentTargets=equipmentTargets.filter(t=>t.kind!==ASW).concat((mode==='duplicate2-3'?[2,3]:mode==='duplicate3-2'?[3,2]:mode==='duplicate1-3'?[1,3]:mode==='duplicate3-1'?[3,1]:[3,3]).map(minCount=>({kind:ASW,minCount})));
  x.c.hdMapPresetRequirements=()=>({...route,equipmentTargets});
  const html=untouched(x.s,()=>x.render());assert.match(html,/data-hd-se-route-scope="manual"/,mode);assert.doesNotMatch(html,/data-hd-se-target-count|あと[0-9]/,mode);assert.equal(x.stockCalls.length,0,mode+' does not request stock');
 }

});

test('1-5 ASW quantity and distinct normal-slot candidates separate stock, slot conflicts and unknown profiles',()=>{
 const x=context('after');x.s.inventory.projector=2;const html=untouched(x.s,()=>x.render()),asw=article(html,ASW);
 assert.match(asw,/目標3組/);assert.match(asw,/爆雷投射機：2\/3・あと1個/);
 const rows=plain(x.c.hdOCFourOneAswTargets(x.s.plan,goal(),x.c.hdSECapabilityStock(x.s.plan,ASW,3)));
 assert.deepEqual(rows.map(r=>r.ship),['unit-DD1','unit-DD2','unit-DD3']);
 for(const row of rows){assert.equal(row.status,'candidate');assert.ok(row.parts[0].slots.every(a=>row.parts[1].slots.some(b=>a.index!==b.index)));assert.ok(row.parts[1].slots.every(a=>row.parts[0].slots.some(b=>a.index!==b.index)))}
 const conflict=context('after');conflict.s.plan.ships=[conflict.s.plan.ships[1]];conflict.s.profiles['unit-DD1'].allowedByPart={sonar:[0],projector:[0]};
 assert.deepEqual(plain(conflict.c.hdOCFourOneAswTargets(conflict.s.plan,goal(),conflict.c.hdSECapabilityStock(conflict.s.plan,ASW,3))),[]);
 const unknown=context('after');delete unknown.s.profiles['unit-DD2'];const u=plain(unknown.c.hdOCFourOneAswTargets(unknown.s.plan,goal(),unknown.c.hdSECapabilityStock(unknown.s.plan,ASW,3)));assert.ok(u.some(r=>r.ship==='unit-DD2'&&r.status==='manual'));
 const wrongRecipe=context('after');assert.equal(wrongRecipe.c.hdOCFourOneAswTargets(wrongRecipe.s.plan,goal(),{recipe:{id:'sonar-projector',parts:['sonar','sonar']}}),null);
});

test('1-5 water hints use known positive legal BBV normal slots without borrowing an AV',()=>{
 const x=context('after'),g=goal(WATER),before=clone(x.s),rows=plain(x.c.hdOCSixThreeWaterTargets(x.s.plan,g));assert.deepEqual(x.s,before);
 assert.deepEqual(rows.map(r=>r.ship),['unit-BBV']);assert.equal(rows[0].status,'candidate');assert.deepEqual(rows[0].slots.map(r=>r.index),[0,1,2,3]);
 const zero=context('after');zero.s.profiles['unit-BBV'].slots=[0,0,0,0];const z=plain(zero.c.hdOCSixThreeWaterTargets(zero.s.plan,g));assert.equal(z[0].status,'blocked');assert.deepEqual(z[0].slots,[]);
 const card=article(zero.render(),WATER);assert.ok(card);assert.doesNotMatch(card,/手持ちで配備可能/);assert.ok(zero.stockCalls.filter(r=>r.kind===WATER).every(r=>r.ships.join(',')==='unit-BBV'));
 const av=context('after');av.s.profiles['unit-BBV'].slots=[0,0,0,0];av.s.plan.ships[3]={ship:'unit-AV',items:[{name:PLANE,slotIndex:0}],metadata:{keep:true}};av.s.rawMeasure[WATER]={count:1,ships:['unit-AV'],ratio:1};
 const h=article(av.render(),WATER);assert.ok(h);assert.doesNotMatch(h,/data-hd-se-target-count/);assert.match(h,/未判定/);assert.doesNotMatch(h,/条件を満たす配備：|手持ちで配備可能/);
 assert.equal(av.stockCalls.some(r=>r.kind===WATER),false,'noncanonical water card does not request stock or an AV usability verdict');
});

test('1-5 unknown equipment and water capacities stay local manual without a numeric goal or verified-name claim',()=>{
 const cap=context('after');cap.s.profiles['unit-BBV'].slots=[NaN,4,9,23];cap.s.plan.ships[0].items=[{name:PLANE,slotIndex:0}];cap.s.rawMeasure[WATER]={count:1,ships:['unit-BBV'],ratio:1};
 const a=article(untouched(cap.s,()=>cap.render()),WATER);assert.ok(a);assert.match(a,/未判定/);assert.doesNotMatch(a,/data-hd-se-target-count|条件を満たす配備：|あと[0-9]/);
 assert.equal(cap.stockCalls.some(r=>r.kind===WATER),false);
 const already=untouched(cap.s,()=>plain(cap.c.hdOCSixThreeWaterTargets(cap.s.plan,goal(WATER))));assert.deepEqual(already,[],'an already populated one-plane comparison has no missing-water target; the card remains manual for its unknown capacity');
 const blank=context('after');blank.s.profiles['unit-BBV'].slots=[NaN,4,9,23];assert.deepEqual(blank.s.plan.ships[0].items,[]);assert.equal(blank.s.rawMeasure[WATER],undefined);
 const partial=untouched(blank.s,()=>plain(blank.c.hdOCSixThreeWaterTargets(blank.s.plan,goal(WATER))));assert.equal(partial.length,1);assert.equal(partial[0].status,'candidate');assert.equal(partial[0].unknownSlots,true);assert.deepEqual(partial[0].slots.map(r=>r.index),[1,2,3]);
 for(const kind of ['gear','expansion','preservation','hull','profile']){
  const x=context('after');
  if(kind==='gear')x.s.plan.ships[0].items=[{name:'unit-unregistered-gear',slotIndex:0}];
  if(kind==='expansion')x.s.plan.ships[0].expansion={name:'unit-unregistered-expansion'};
  if(kind==='preservation')x.s.plan.preservationIssues=['unit-unknown-source'];
  if(kind==='hull')x.s.plan.ships[3].ship='unit-unregistered-hull';
  if(kind==='profile')delete x.s.profiles['unit-DD3'];
  const html=untouched(x.s,()=>x.render()),water=article(html,WATER);assert.ok(water,kind);assert.match(water,/未判定/);assert.doesNotMatch(water,/data-hd-se-target-count|条件を満たす配備：|あと[0-9]/);assert.equal(x.stockCalls.length,0,kind+' does not request a purchase quantity');
 }
 const noFleet=context('after'),n=article(noFleet.render(null),WATER);assert.match(n,/未判定/);assert.doesNotMatch(n,/data-hd-se-target-count|あと[0-9]/);
 const noBBV=context('after');noBBV.s.plan.ships[0]={ship:'unit-DD1',items:[]};assert.equal(article(noBBV.render(),WATER),null,'known no-BBV means no water card, never satisfied0');
});

test('1-5 dedicated text keeps explicit night policy and preserves the old 6-3 water presentation',()=>{
 const x=context('after');x.s.policy='dd';const html=x.render();assert.ok(article(html,'cap-night-dd'));assert.match(html,/航空戦艦/);
 const targets=plain(x.c.hdOCSixThreeWaterTargets(x.s.plan,goal(WATER))),stock=x.c.hdSECapabilityStock(x.s.plan,WATER,1),g={...goal(WATER),goalKind:WATER,capability:true,stock,waterTargets:targets,waterScope:'one-five-bbv'};
 const h=x.c.hdOCCapabilityStockHtml(g);assert.match(h,/未配備の航空戦艦/);assert.doesNotMatch(h,/未配備の水母|Hの33式|G\/Hの航空偵察/);assert.match(h,/購入数量/);
 const legacyGoal={...goal(WATER),capability:true,stock,waterTargets:[{ship:'unit-AV',count:1,status:'candidate',slots:[{index:0,candidates:[PLANE]}],unknownSlots:false}]};
 const old=context('before'),now=context('after');assert.equal(now.c.hdOCCapabilityStockHtml(clone(legacyGoal)),old.c.hdOCCapabilityStockHtml(clone(legacyGoal)));
});

test('1-5 changes remain display-only source edits and all recorded inverse anchors restore whole sources',()=>{
 const edits=approved.changes;assert.equal(edits.length,29);
 for(const file of Object.keys(HASH.after)){
  let undo=fs.readFileSync(path.join(ROOT,file),'utf8');for(const e of edits.filter(e=>e.file===file).reverse()){assert.equal(undo.split(e.after).length,2);undo=undo.replace(e.after,e.before)}assert.equal(undo,oldSource[file]);
 }
 const a=oldSource['owned-equipment-planner.js'],b=fs.readFileSync(path.join(ROOT,'owned-equipment-planner.js'),'utf8'),start='function* hdOCSearchSteps(',end='const shortages=hdOCShortageGoals(';
 assert.equal(a.slice(a.indexOf(start),a.indexOf(end,a.indexOf(start))),b.slice(b.indexOf(start),b.indexOf(end,b.indexOf(start))));
 const before=oldSource['sortie-equipment-check.js'],after=fs.readFileSync(path.join(ROOT,'sortie-equipment-check.js'),'utf8'),s='function hdSECapabilityHtml(',e='\nfunction hdSEAirOptional(';
 assert.equal(before.slice(0,before.indexOf(s)),after.slice(0,after.indexOf(s)));assert.equal(before.slice(before.indexOf(e)),after.slice(after.indexOf(e)));
 assert.equal(hash(fs.readFileSync(path.join(ROOT,'fleet-readiness-evaluator.js'))),'bc7ffb6aa9efa012ee7baab4540fa8961190d9e9a39cdf2342ae42aba34bb409');
 assert.equal(hash(Buffer.from(MAP)),'aa312e59cf5533ac32dcff9036d57e8b6c049d7de8660d69020140ddafa9af7a');
});
