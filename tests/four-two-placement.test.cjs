'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'三式水中探信儀',category:'小型ソナー'},{name:'三式爆雷投射機',category:'爆雷投射機'},{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'}];
 const hulls={阿武隈改二:{type:'軽巡洋艦',profile:{id:1,count:3,slots:[0,0,0],flags:[]}},秋月改:{type:'駆逐艦',profile:{id:2,count:3,slots:[0,0,0],flags:[]}},赤城改:{type:'正規空母',profile:{id:3,count:3,slots:[18,0,6],flags:[]}},加賀改:{type:'正規空母',profile:{id:4,count:3,slots:[18,0,6],flags:[]}},一枠艦:{type:'駆逐艦',profile:{id:5,count:1,slots:[0],flags:[]}},分離枠:{type:'駆逐艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},未登録枠:{type:'駆逐艦'}};
 const c={hdFEEsc:String,HD_SE_PARTS:{sonar:{label:'ソナー',examples:['三式水中探信儀']},projector:{label:'爆雷投射機',examples:['三式爆雷投射機']},carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>({'小型ソナー':'sonar','爆雷投射機':'projector','艦上攻撃機':'carrierAttackPlane','艦上爆撃機':'carrierAttackPlane'})[item.category]===part,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[6],slot:0,allowOnly:[14,15]},{shipIds:[6],slot:1,allowOnly:[14]}],hdShipDbPickerTypeId:item=>({'小型ソナー':14,'爆雷投射機':15,'艦上攻撃機':8,'艦上爆撃機':7})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'4-2':'ACL / BDCL','4-1':'CFDGJ / ABDGJ','3-4':'ACEGJP','3-3':'ACGM'}[p.map])}),hdSECapabilityMeasure:p=>({count:p.ships.some(s=>s.items?.some(i=>i.name==='流星'))?1:0})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCFourOneAswTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const asw={kind:'cap-asw',minCount:1,generatedFromMap:true,purpose:'recommendation'},attack={kind:'cap-carrier-attack',minCount:2,generatedFromMap:true,purpose:'recommendation'},stock={recipe:{id:'sonar-projector',name:'ソナー＋爆雷投射機'},parts:[{part:'sonar',label:'ソナー',need:1,have:0,items:[]},{part:'projector',label:'爆雷投射機',need:1,have:0,items:[]}]};
const fleet=()=>({map:'4-2',ships:['赤城改','加賀改','阿武隈改二','秋月改'].map(ship=>({ship,items:[]}))});
test('4-2 selected recipe names each eligible hull and legal distinct normal slots without multiplying the recommended set count',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,asw,stock]),rows=c.hdOCFourOneAswTargets(p,asw,stock);assert.deepEqual(Array.from(rows,r=>[r.ship,r.status]),[['阿武隈改二','candidate'],['秋月改','candidate']]);
 for(const row of rows)for(const part of row.parts){assert.equal(part.count,1);assert.deepEqual(Array.from(part.slots,s=>s.index),[0,1,2]);}
 const html=c.hdOCCapabilityStockHtml({capability:true,aswTargets:rows,stock});for(const text of ['阿武隈改二','秋月改','ソナー1個','爆雷投射機1個','別々の通常枠','通常第1枠','所持0 / この装備例に必要1・あと1個','全候補艦への配備を求めるものではありません','必要組数は目標欄','経路の必須条件や先制対潜の成立人数ではありません','未所持品を含み','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);assert.equal(JSON.stringify([p,asw,stock]),before);
});
test('4-2 optional carrier targets exclude fulfilled hulls and zero-capacity slots and do not claim simultaneous allocation',()=>{
 const c=context(),p=fleet(),rows=c.hdOCThreeThreeCarrierTargets(p,attack);assert.deepEqual(Array.from(rows,r=>[r.ship,r.count,Array.from(r.slots,s=>s.index)]),[['赤城改',1,[0,2]],['加賀改',1,[0,2]]]);p.ships[0].items=[{name:'流星'}];assert.deepEqual(Array.from(c.hdOCThreeThreeCarrierTargets(p,attack),r=>r.ship),['加賀改']);
});
test('4-2 named targets retain unknown/slot restrictions and stay out of other routes and explicit user goals',()=>{
 const c=context(),p={map:'4-2',ships:['一枠艦','分離枠','未登録枠','未知艦'].map(ship=>({ship,items:[]}))},rows=c.hdOCFourOneAswTargets(p,asw,stock);assert.deepEqual(Array.from(rows,r=>[r.ship,r.status]),[['分離枠','candidate'],['未登録枠','manual'],['未知艦','manual']]);assert.deepEqual(Array.from(rows[0].parts,p=>[p.part,Array.from(p.slots,s=>s.index)]),[['sonar',[1]],['projector',[0]]]);
 for(const [plan,g,s]of [[{...p,map:'4-3'},asw,stock],[{...p,path:'other'},asw,stock],[p,{...asw,purpose:'strategy'},stock],[p,{...asw,generatedFromMap:false},stock],[p,asw,{...stock,recipe:{id:'other'}}]])assert.equal(c.hdOCFourOneAswTargets(plan,g,s),null);
 for(const path of ['other','ACL','BDCL'])assert.equal(c.hdOCThreeThreeCarrierTargets({...fleet(),path},attack),null);
 assert.ok(c.hdOCFourOneAswTargets({...fleet(),map:'4-1'},asw,stock),'previous4-1 scope retained');
});
