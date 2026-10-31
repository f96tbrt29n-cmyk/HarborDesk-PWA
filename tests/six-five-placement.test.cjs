'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),legacyCapabilityRenderer=require('./fixtures/six-five-legacy-capability-renderer.cjs');
function load(file,name,c){if(file==='owned-equipment-planner.js'&&name==='hdOCFourOneAswTargets'&&!c.hdOCAswSetUserGoal)load(file,'hdOCAswSetUserGoal',c);const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'},{name:'零式水上観測機',category:'水上偵察機'}];
 const hulls={赤城改:{type:'正規空母',profile:{id:1,count:3,slots:[20,0,10],flags:[]}},加賀改:{type:'正規空母',profile:{id:2,count:3,slots:[20,0,12],flags:[]}},鳥海改二:{type:'重巡洋艦',profile:{id:3,count:4,slots:[3,3,3,3],flags:[]}},長門改二:{type:'戦艦',profile:{id:4,count:4,slots:[3,3,6,3],flags:[]}},空母枠不明:{type:'正規空母'},空母搭載不明:{type:'正規空母',profile:{id:5,count:2,slots:[null,NaN],flags:[]}},空母搭載零:{type:'正規空母',profile:{id:6,count:2,slots:[0,0],flags:[]}},空母制限枠:{type:'正規空母',profile:{id:7,count:2,slots:[10,10],flags:[]}}};
 const c={hdFEEsc:String,HD_SE_PARTS:{carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機','水上偵察機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>part==='carrierAttackPlane'&&['艦上攻撃機','艦上爆撃機'].includes(item.category),hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[7],slot:0,allowOnly:[9]},{shipIds:[7],slot:1,allowOnly:[9]}],hdShipDbPickerTypeId:item=>({'艦上攻撃機':8,'艦上爆撃機':7,'水上偵察機':10})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'6-5':'ACDGM','6-2':'CEJK','5-5':'BKPS','5-2':'BCEFO','5-1':'BCFJ','4-5':'ADHKT / CDHKT','3-3':'ACGM'}[p.map])}),hdSECapabilityMeasure:p=>({count:p.ships.filter(s=>s.items?.some(i=>['流星','彗星'].includes(i.name))).length})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const attack={kind:'cap-carrier-attack',minCount:1,generatedFromMap:true,purpose:'recommendation'};
const fleet=()=>({map:'6-5',ships:['長門改二','赤城改','鳥海改二'].map(ship=>({ship,items:[]}))});
test('6-5 carrier recommendation names each unarmed carrier once and only positive legal normal slots',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,attack]),rows=c.hdOCThreeThreeCarrierTargets(p,attack);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.shipIndex,r.count,r.status,Array.from(r.slots,s=>s.index)]),[['赤城改',1,1,'candidate',[0,2]]]);
 assert.ok(rows.every(r=>r.slots.every(s=>s.candidates.includes('流星')&&s.candidates.includes('彗星')&&!s.candidates.includes('零式水上観測機'))));
 assert.equal(JSON.stringify([p,attack]),before);
 p.ships[1].items=[{name:'流星',slotIndex:0}];assert.deepEqual(Array.from(c.hdOCThreeThreeCarrierTargets(p,attack),r=>r.ship),[]);
 const noCarrier={map:'6-5',ships:['長門改二','鳥海改二'].map(ship=>({ship,items:[]}))};assert.deepEqual(Array.from(c.hdOCThreeThreeCarrierTargets(noCarrier,attack)),[],'CV0 upper composition never creates a carrier placement target');
});
test('6-5 distinguishes missing slot knowledge and impossible placement from unknown equipment and inventory claims',()=>{
 const c=context(),p={map:'6-5',ships:['空母枠不明','空母搭載不明','空母搭載零','空母制限枠'].map(ship=>({ship,items:[{name:'合成・性能未登録装備'}]}))},before=JSON.stringify(p),rows=c.hdOCThreeThreeCarrierTargets(p,attack);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,r.unknownSlots,r.slots.length]),[['空母枠不明','manual',true,0],['空母搭載不明','manual',true,0],['空母搭載零','blocked',false,0],['空母制限枠','blocked',false,0]]);
 assert.equal(JSON.stringify(p),before);
 const known=fleet();known.ships[1].items=[{name:'合成・性能未登録装備'}];assert.equal(c.hdOCThreeThreeCarrierTargets(known,attack).length,1,'unknown existing item is not a proven attack-plane loadout');
});
test('6-5 optional one-plane guidance retains per-hull targets and purchase/route distinctions',()=>{
 const c=context(),rows=c.hdOCThreeThreeCarrierTargets(fleet(),attack),html=c.hdOCCapabilityStockHtml({capability:true,carrierTargets:rows,stock:{recipe:{id:'carrier-attack',name:'空母の攻撃機'},parts:[{part:'carrierAttackPlane',label:'艦上攻撃機・艦上爆撃機',need:1,have:0,items:[]}]}});
 for(const text of ['赤城改：艦上攻撃機・艦上爆撃機1個','この装備例に必要1・あと1個','第1枠','流星','彗星','戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','同時配備の成立や購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('長門改二：艦上攻撃機'));assert.ok(!html.includes('鳥海改二：艦上攻撃機'));
});
test('6-5 upper guidance stays off lower and other paths and explicit goals while prior scopes remain connected',()=>{
 const c=context(),p=fleet();
 for(const path of ['BFIJM','ACEHGM','other'])assert.equal(c.hdOCThreeThreeCarrierTargets({...p,path},attack),null);
 for(const g of [{...attack,purpose:'strategy'},{...attack,generatedFromMap:false},{...attack,kind:'los-value'},{...attack,kind:'cap-asw'}])assert.equal(c.hdOCThreeThreeCarrierTargets(p,g),null);
 assert.equal(c.hdOCThreeThreeCarrierTargets({...p,map:'6-1'},attack),null);const missingPath=context();missingPath.hdFERouteRequirementData=()=>({path:undefined});assert.equal(missingPath.hdOCThreeThreeCarrierTargets(p,attack),null,'existing6-5 path-unknown negative remains valid');
 for(const map of ['6-2','5-2','5-1','4-5','3-3'])assert.equal(c.hdOCThreeThreeCarrierTargets({...p,map},attack).length,1,map);
});

function aswContext(){
 const items=[{name:'三式水中探信儀',category:'小型ソナー'},{name:'三式爆雷投射機',category:'爆雷投射機'},{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'}];
 const hulls={秋月改:{type:'駆逐艦',profile:{id:1,count:3,slots:[0,0,0],flags:[]}},赤城改:{type:'正規空母',profile:{id:2,count:3,slots:[18,0,6],flags:[]}},鳥海改二:{type:'重巡洋艦',profile:{id:3,count:4,slots:[2,2,4,4],flags:[]}},一枠艦:{type:'駆逐艦',profile:{id:4,count:1,slots:[0],flags:[]}},同一枠のみ:{type:'駆逐艦',profile:{id:5,count:2,slots:[0,0],flags:[]}},分離枠:{type:'駆逐艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},未登録枠:{type:'駆逐艦'}};
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{sonar:{label:'ソナー',examples:['三式水中探信儀']},projector:{label:'爆雷投射機',examples:['三式爆雷投射機']},carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>({'小型ソナー':'sonar','爆雷投射機':'projector','艦上攻撃機':'carrierAttackPlane','艦上爆撃機':'carrierAttackPlane'})[item.category]===part,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[5],slot:1,allowOnly:[6]},{shipIds:[6],slot:0,allowOnly:[14,15]},{shipIds:[6],slot:1,allowOnly:[14]}],hdShipDbPickerTypeId:item=>({'小型ソナー':14,'爆雷投射機':15,'艦上攻撃機':8,'艦上爆撃機':7})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'6-5':'BFIJM','4-1':'CFDGJ / ABDGJ','3-4':'ACEGJP','3-3':'ACGM'}[p.map])}),hdSECapabilityMeasure:()=>({count:0})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCFourOneAswTargets','hdOCCapabilityStockHtml','hdOCStockGap','hdOCProcurementHtml'])load('owned-equipment-planner.js',name,c);return c;
}

const aswGoal={kind:'cap-asw',minCount:1,generatedFromMap:true,purpose:'recommendation'},aswStock={recipe:{id:'sonar-projector',name:'ソナー＋爆雷投射機'},parts:[{part:'sonar',label:'ソナー',need:1,have:0,items:[]},{part:'projector',label:'爆雷投射機',need:1,have:0,items:[]}]};
test('6-5 lower ASW example names the actual hull and distinct normal slots without a purchase count',()=>{
 const c=aswContext(),p={map:'6-5',ships:['赤城改','鳥海改二','秋月改'].map(ship=>({ship,items:[]}))},before=JSON.stringify([p,aswGoal,aswStock]),rows=c.hdOCFourOneAswTargets(p,aswGoal,aswStock);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status]),[['秋月改','candidate']]);for(const part of rows[0].parts){assert.equal(part.count,1);assert.deepEqual(Array.from(part.slots,s=>s.index),[0,1,2]);assert.ok(part.slots.every(s=>s.candidates.length===1))}
 const goal={...aswGoal,kind:'対潜',goalKind:'cap-asw',capability:true,aswTargets:rows,stock:aswStock,placement:true,candidates:['三式水中探信儀']},html=c.hdOCCapabilityStockHtml(goal);
 for(const text of ['秋月改','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','別々の通常枠','この装備例に必要1・あと1個','先制対潜の成立人数ではありません','増設枠は含めません','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);
 c.hdPLSave=()=>{throw Error('display must not save a procurement plan')};assert.equal(c.hdOCStockGap(goal),0);assert.equal(c.hdOCProcurementHtml(goal,0,''),'');assert.equal(JSON.stringify([p,aswGoal,aswStock]),before);
});
test('6-5 lower ASW keeps slot conflict, unknown data and explicit route or goal guards separate',()=>{
 const c=aswContext(),p={map:'6-5',ships:['一枠艦','同一枠のみ','分離枠','未登録枠','艦名不明'].map(ship=>({ship,items:[]}))},rows=c.hdOCFourOneAswTargets(p,aswGoal,aswStock);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status]),[['分離枠','candidate'],['未登録枠','manual'],['艦名不明','manual']]);assert.deepEqual(Array.from(rows[0].parts,p=>[p.part,Array.from(p.slots,s=>s.index)]),[['sonar',[1]],['projector',[0]]]);
 for(const [plan,g,stock]of [[{...p,path:'ACDGM'},aswGoal,aswStock],[{...p,path:'other'},aswGoal,aswStock],[{...p,map:'6-4'},aswGoal,aswStock],[p,{...aswGoal,purpose:'strategy'},aswStock],[p,{...aswGoal,generatedFromMap:false},aswStock],[p,{...aswGoal,kind:'cap-night-auto'},aswStock],[p,aswGoal,{...aswStock,recipe:{id:'other'}}]])assert.equal(c.hdOCFourOneAswTargets(plan,g,stock),null);
 assert.ok(c.hdOCCapabilityStockHtml({capability:true,aswTargets:[],stock:aswStock}).includes('手持ちでは不可能という判定ではありません'));assert.equal(c.hdOCFourOneAswTargets({...p,map:'4-1'},aswGoal,aswStock).length,3,'prior4-1 path stays connected');
});
function capabilityContext(){
 const profiles=[{kind:'cap-aa',baseKind:'防空',label:'AA',importance:'任意例',reason:'防空',note:'任意例',source:'#'},{kind:'cap-asw',baseKind:'対潜',label:'ASW',importance:'任意例',reason:'対潜',note:'人数は別条件',source:'#'},{kind:'cap-night-auto',baseKind:'夜戦',label:'Night',importance:'任意例',reason:'夜戦',note:'任意例',source:'#'}],upper={id:'upper'},lower={id:'lower'},counts={profiles:0,fleets:0,lookups:0,stock:0,builds:0},kinds={upper:['制空','防空','夜戦','索敵'],lower:['制空','防空','夜戦','索敵','対潜']};
 const c={hdSEProfiles:()=>{counts.profiles++;return profiles},hdSENightPolicyHtml:()=>'<policy/>',hdMapPresetRequirements:(map,preset)=>{counts.lookups++;return preset===upper?{path:'ACDGM',equipmentKinds:kinds.upper}:preset===lower?{path:'BFIJM',equipmentKinds:kinds.lower}:null},hdSPSFleets:()=>{counts.fleets++;return [{id:'saved',routePreset:lower,ships:[]}]},hdFEPlanFromSavedFleet:(map,fleet)=>{counts.builds++;return {map,ships:[],sourceFleet:fleet}},hdSEEsc:String,hdSECapabilityStock:()=>{counts.stock++;return {recipe:{name:'任意の装備例'},parts:[{part:'one',label:'装備例',have:0,need:1,items:[]}] }},hdSECapabilityMeasure:()=>({count:0,ships:[]}),HD_SE_PARTS:{one:{examples:['例']}},HD_SE_RECIPES:Object.fromEntries(profiles.map(p=>[p.kind,[{name:'任意例'}]])),localStorage:new Proxy({},{get(){throw Error('new renderer must not read storage directly')}}),hdOCBuild:()=>{throw Error('renderer must not rebuild search inputs')}};
 const legacy=vm.runInNewContext('('+legacyCapabilityRenderer.toString()+')',c);load('sortie-equipment-check.js','hdSECapabilityHtml',c);return {c,legacy,current:c.hdSECapabilityHtml,upper,lower,counts,profiles,kinds};
}
test('6-5 selected capability cards follow the chosen route rather than the opposite saved fleet',()=>{
 const {c,legacy,current,upper,lower,counts,profiles,kinds}=capabilityContext(),before=JSON.stringify([upper,lower,profiles,kinds]);
 const u=current('6-5','saved',null,upper),l=current('6-5','saved',null,lower);assert.ok(!u.includes('data-hd-se-capability="cap-asw"'));assert.ok(l.includes('data-hd-se-capability="cap-asw"'));for(const html of [u,l])for(const text of ['任意装備例','通行の必須条件','先制対潜人数','購入数量'])assert.ok(html.includes(text),text);
 const baseline=current('6-5','saved'),cards=html=>Array.from(html.matchAll(/data-hd-se-capability="([^"]+)"/g),x=>x[1]);
 for(const args of [['6-5','saved'],['6-5','saved',{ships:[]}],['6-4','saved'],['4-2','saved',{ships:[]}],['7-1','saved']]){Object.keys(counts).forEach(k=>counts[k]=0);const expected=legacy(...args),oldCounts={...counts};Object.keys(counts).forEach(k=>counts[k]=0);const html=current(...args);assert.equal(html,expected,'legacy2/3 argument byte output remains exact');assert.deepEqual(cards(html),['cap-aa','cap-asw','cap-night-auto']);assert.deepEqual(counts,oldCounts);assert.deepEqual(counts,{profiles:1,fleets:1,lookups:0,stock:3,builds:args[2]?0:1},'legacy calls do not add selected-route lookup/build/storage operations')}
 for(const map of ['6-4','4-2','7-1'])assert.equal(current(map,'saved',null,{id:'unknown'}),legacy(map,'saved',null),'other maps ignore the optional selected-route argument');assert.equal(JSON.stringify([upper,lower,profiles,kinds]),before);
});
test('6-5 unknown selected capability scope stays unassessed without shortage cards or implicit stored-route fallback',()=>{
 const {c,current,upper,counts}=capabilityContext(),baseline=current('6-5','saved');for(const p of [undefined,null,{},'unknown']){Object.keys(counts).forEach(k=>counts[k]=0);const html=current('6-5','saved',null,p);assert.ok(html.includes('data-hd-se-route-scope="manual"'));assert.ok(html.includes('未判定'));assert.ok(!html.includes('data-hd-se-capability='));assert.ok(!html.includes('所持不足'));assert.equal(counts.profiles,0);assert.equal(counts.stock,0);assert.equal(counts.fleets,0);assert.equal(counts.builds,0)}
 c.hdMapPresetRequirements=()=>({path:'ACDGM',equipmentKinds:'対潜'});assert.ok(current('6-5','saved',null,upper).includes('data-hd-se-route-scope="manual"'));
 const sentinel={};c.hdMapPresetRequirements=()=>{throw sentinel};assert.throws(()=>current('6-5','saved',null,upper),e=>e===sentinel);assert.equal(current('6-5','saved'),baseline,'legacy calls do not consult a new selected-route lookup');
});
