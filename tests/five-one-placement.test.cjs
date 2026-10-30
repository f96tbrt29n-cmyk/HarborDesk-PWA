'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'61cm四連装(酸素)魚雷',category:'魚雷'},{name:'潜水艦専用魚雷',category:'潜水艦魚雷'},{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'}];
 const hulls={羽黒改二:{type:'重巡洋艦',profile:{id:7,count:4,slots:[0,0,0,0],flags:[]}},時雨改二:{type:'駆逐艦',profile:{id:8,count:3,slots:[0,0,0],flags:[]}},占守改:{type:'海防艦',profile:{id:9,count:3,slots:[0,0,0],flags:[]}},夕立改二:{type:'駆逐艦',profile:{id:1,count:3,slots:[0,0,0],flags:[]}},鳥海改二:{type:'重巡洋艦',profile:{id:2,count:4,slots:[0,0,0,0],flags:[]}},飛鷹改:{type:'軽空母',profile:{id:3,count:3,slots:[18,0,6],flags:[]}},長門改二:{type:'戦艦',profile:{id:4,count:4,slots:[0,0,0,0],flags:[]}},一枠艦:{type:'駆逐艦',profile:{id:5,count:1,slots:[0],flags:[]}},制限枠:{type:'駆逐艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},未登録枠:{type:'駆逐艦'}};
 const c={hdFEEsc:String,HD_SE_PARTS:{nightTorpedo:{label:'魚雷',examples:['61cm四連装(酸素)魚雷']},carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>({'魚雷':'nightTorpedo','潜水艦魚雷':'nightTorpedo','艦上攻撃機':'carrierAttackPlane','艦上爆撃機':'carrierAttackPlane'})[item.category]===part,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:item=>item.category==='潜水艦魚雷'?false:null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[6],slot:0,allowOnly:[5]},{shipIds:[6],slot:1,allowOnly:[1]}],hdShipDbPickerTypeId:item=>({'魚雷':5,'潜水艦魚雷':32,'艦上攻撃機':8,'艦上爆撃機':7})[item.category],hdFERouteRequirementData:p=>({map:p.map,index:p.routeIndex??0,path:p.path||({'5-1':'BCFJ','4-5':'ADHKT / CDHKT','7-3':'ACE'}[p.map])}),hdSECapabilityMeasure:p=>({count:p.ships.some(s=>s.items?.some(i=>i.name==='流星'))?1:0}),hdSERecipeAllows:(_r,s)=>['駆逐艦','重巡洋艦','戦艦'].includes(hulls[s.ship]?.type),hdSENightRecipeReady:s=>(s.items||[]).filter(i=>i.name==='61cm四連装(酸素)魚雷').length>=2};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCFiveOneNightTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const night={kind:'cap-night-auto',minCount:1,generatedFromMap:true,purpose:'recommendation'},attack={kind:'cap-carrier-attack',minCount:1,generatedFromMap:true,purpose:'recommendation'},stock={recipe:{id:'night-torpedo',name:'魚雷CI：魚雷2',parts:['nightTorpedo','nightTorpedo'],ship:'night-surface',attack:'torpedo'},parts:[{part:'nightTorpedo',label:'魚雷',need:2,have:0,items:[]}]};
const fleet=()=>({map:'5-1',ships:['長門改二','飛鷹改','鳥海改二','夕立改二'].map(ship=>({ship,items:[]}))});
test('5-1 selected night-torpedo recipe names legal hulls and two distinct normal slots as alternatives for one set',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,night,stock]),rows=c.hdOCFiveOneNightTargets(p,night,stock);assert.deepEqual(Array.from(rows,r=>[r.ship,r.count,r.status]),[['鳥海改二',2,'candidate'],['夕立改二',2,'candidate']]);
 for(const row of rows){assert.ok(row.slots.length>=2);assert.ok(row.slots.every(s=>s.candidates.includes('61cm四連装(酸素)魚雷')));assert.ok(row.slots.every(s=>!s.candidates.includes('潜水艦専用魚雷')));}
 const html=c.hdOCCapabilityStockHtml({capability:true,nightTargets:rows,stock});for(const text of ['鳥海改二','夕立改二','魚雷2個','別々の通常枠','通常第1枠','全候補艦への配備を求めるものではありません','必要組数は目標欄','発動率','未所持品','購入数量を保証しません','所持0 / この装備例に必要2・あと2個'])assert.ok(html.includes(text),text);assert.equal(JSON.stringify([p,night,stock]),before);
});
test('5-1 night candidates preserve unknown slots, exclude impossible distinct placement and leave other policies/routes alone',()=>{
 const c=context(),p={map:'5-1',ships:['一枠艦','制限枠','未登録枠','未知艦'].map(ship=>({ship,items:[]}))};assert.deepEqual(Array.from(c.hdOCFiveOneNightTargets(p,night,stock),r=>[r.ship,r.status]),[['未登録枠','manual'],['未知艦','manual']]);
 const done=fleet();done.ships[3].items=[{name:'61cm四連装(酸素)魚雷'},{name:'61cm四連装(酸素)魚雷'}];assert.deepEqual(Array.from(c.hdOCFiveOneNightTargets(done,night,stock),r=>r.ship),['鳥海改二']);
 for(const [p,g,s]of [[{...fleet(),map:'4-5'},night,stock],[{...fleet(),path:'BCFGJ'},night,stock],[fleet(),{...night,purpose:'strategy'},stock],[fleet(),{...night,generatedFromMap:false},stock],[fleet(),{...night,kind:'cap-night-dd'},stock],[fleet(),night,{...stock,recipe:{id:'night-main'}}]])assert.equal(c.hdOCFiveOneNightTargets(p,g,s),null);
});
test('5-1 carrier shortage names the CVL and legal positive-capacity slots without introducing an ASW target',()=>{
 const c=context(),p=fleet(),rows=c.hdOCThreeThreeCarrierTargets(p,attack);assert.deepEqual(Array.from(rows,r=>[r.ship,r.count,Array.from(r.slots,s=>s.index)]),[['飛鷹改',1,[0,2]]]);p.ships[1].items=[{name:'流星'}];assert.equal(c.hdOCThreeThreeCarrierTargets(p,attack).length,0);
 for(const path of ['BCFGJ','BEGJ','other'])assert.equal(c.hdOCThreeThreeCarrierTargets({...fleet(),path},attack),null);
 assert.ok(c.hdOCThreeThreeCarrierTargets({...fleet(),map:'4-5'},attack),'previous central carrier guide remains connected');
});

// The source-derived de1 ACE alternative has the same selected combat target;
// its successful route does not assert that every hull needs a night set.
const firstAce=()=>({map:'7-3',routeIndex:0,ships:['羽黒改二','夕立改二','時雨改二','占守改'].map(ship=>({ship,items:[]}))});
test('7-3 first ACE selected night example names legal alternatives and zero-stock count without making every hull mandatory',()=>{
 const c=context(),p=firstAce(),before=JSON.stringify([p,night,stock]),rows=c.hdOCFiveOneNightTargets(p,night,stock);assert.ok(Array.isArray(rows),'selected 7-3 first ACE night example must expose its legal placement alternatives');assert.deepEqual(Array.from(rows,r=>[r.ship,r.count,r.status]),[['羽黒改二',2,'candidate'],['夕立改二',2,'candidate'],['時雨改二',2,'candidate']]);
 for(const row of rows){assert.ok(row.slots.length>=2);assert.ok(row.slots.every(s=>s.candidates.includes('61cm四連装(酸素)魚雷')));assert.ok(row.slots.every(s=>!s.candidates.includes('潜水艦専用魚雷')));assert.ok(row.slots.some(a=>row.slots.some(b=>a.index!==b.index)));}
 const html=c.hdOCCapabilityStockHtml({capability:true,nightTargets:rows,stock});for(const text of ['羽黒改二','夕立改二','時雨改二','魚雷2個','別々の通常枠','通常第1枠','全候補艦への配備を求めるものではありません','必要組数は目標欄','戦闘上の推奨','経路必須','購入数量を保証しません','所持0 / この装備例に必要2・あと2個'])assert.ok(html.includes(text),text);assert.equal(JSON.stringify([p,night,stock]),before);
 const unknown=firstAce();unknown.ships[3]={ship:'未知艦',items:[]};assert.equal(c.hdOCFiveOneNightTargets(unknown,night,stock).find(r=>r.ship==='未知艦').status,'manual');
});
test('7-3 night candidate opt-in stays limited to first ACE and generated auto-night torpedo example',()=>{
 const c=context();for(const [p,g,s]of [[{...firstAce(),routeIndex:1},night,stock],[{...firstAce(),path:'ACDGJP'},night,stock],[{...firstAce(),map:'7-4'},night,stock],[firstAce(),{...night,purpose:'strategy'},stock],[firstAce(),{...night,generatedFromMap:false},stock],[firstAce(),{...night,kind:'cap-night-dd'},stock],[firstAce(),night,{...stock,recipe:{id:'night-main'}}]])assert.equal(c.hdOCFiveOneNightTargets(p,g,s),null);
 const done=firstAce();done.ships[1].items=[{name:'61cm四連装(酸素)魚雷'},{name:'61cm四連装(酸素)魚雷'}];assert.deepEqual(Array.from(c.hdOCFiveOneNightTargets(done,night,stock),r=>r.ship),['羽黒改二','時雨改二']);
});
