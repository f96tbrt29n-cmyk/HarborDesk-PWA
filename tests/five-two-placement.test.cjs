'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'},{name:'零式水上観測機',category:'水上偵察機'}];
 const hulls={赤城改:{type:'正規空母',profile:{id:1,count:3,slots:[20,0,10],flags:[]}},加賀改:{type:'正規空母',profile:{id:2,count:3,slots:[20,0,12],flags:[]}},鳥海改二:{type:'重巡洋艦',profile:{id:3,count:4,slots:[3,3,3,3],flags:[]}},長門改二:{type:'戦艦',profile:{id:4,count:4,slots:[3,3,6,3],flags:[]}},空母枠不明:{type:'正規空母'},空母搭載不明:{type:'正規空母',profile:{id:5,count:2,slots:[null,NaN],flags:[]}},空母搭載零:{type:'正規空母',profile:{id:6,count:2,slots:[0,0],flags:[]}},空母制限枠:{type:'正規空母',profile:{id:7,count:2,slots:[10,10],flags:[]}}};
 const c={hdFEEsc:String,HD_SE_PARTS:{carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機','水上偵察機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>part==='carrierAttackPlane'&&['艦上攻撃機','艦上爆撃機'].includes(item.category),hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[7],slot:0,allowOnly:[9]},{shipIds:[7],slot:1,allowOnly:[9]}],hdShipDbPickerTypeId:item=>({'艦上攻撃機':8,'艦上爆撃機':7,'水上偵察機':10})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'5-2':'BCEFO','5-1':'BCFJ','4-5':'ADHKT / CDHKT','3-3':'ACGM'}[p.map])}),hdSECapabilityMeasure:p=>({count:p.ships.filter(s=>s.items?.some(i=>['流星','彗星'].includes(i.name))).length})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const attack={kind:'cap-carrier-attack',minCount:2,generatedFromMap:true,purpose:'recommendation'};
const fleet=()=>({map:'5-2',ships:['長門改二','赤城改','加賀改','鳥海改二'].map(ship=>({ship,items:[]}))});
test('5-2 carrier recommendation names each unarmed carrier once and only positive legal normal slots',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,attack]),rows=c.hdOCThreeThreeCarrierTargets(p,attack);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.shipIndex,r.count,r.status,Array.from(r.slots,s=>s.index)]),[['赤城改',1,1,'candidate',[0,2]],['加賀改',2,1,'candidate',[0,2]]]);
 assert.ok(rows.every(r=>r.slots.every(s=>s.candidates.includes('流星')&&s.candidates.includes('彗星')&&!s.candidates.includes('零式水上観測機'))));
 assert.equal(JSON.stringify([p,attack]),before);
 p.ships[1].items=[{name:'流星',slotIndex:0}];assert.deepEqual(Array.from(c.hdOCThreeThreeCarrierTargets(p,attack),r=>r.ship),['加賀改']);
});
test('5-2 distinguishes missing slot knowledge and impossible placement from unknown equipment and inventory claims',()=>{
 const c=context(),p={map:'5-2',ships:['空母枠不明','空母搭載不明','空母搭載零','空母制限枠'].map(ship=>({ship,items:[{name:'合成・性能未登録装備'}]}))},before=JSON.stringify(p),rows=c.hdOCThreeThreeCarrierTargets(p,attack);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,r.unknownSlots,r.slots.length]),[['空母枠不明','manual',true,0],['空母搭載不明','manual',true,0],['空母搭載零','blocked',false,0],['空母制限枠','blocked',false,0]]);
 assert.equal(JSON.stringify(p),before);
 const known=fleet();known.ships[1].items=[{name:'合成・性能未登録装備'}];assert.equal(c.hdOCThreeThreeCarrierTargets(known,attack).length,2,'unknown existing item is not a proven attack-plane loadout');
});
test('5-2 optional two-plane guidance retains per-hull targets and purchase/route distinctions',()=>{
 const c=context(),rows=c.hdOCThreeThreeCarrierTargets(fleet(),attack),html=c.hdOCCapabilityStockHtml({capability:true,carrierTargets:rows,stock:{recipe:{id:'carrier-attack',name:'空母の攻撃機'},parts:[{part:'carrierAttackPlane',label:'艦上攻撃機・艦上爆撃機',need:2,have:0,items:[]}]}});
 for(const text of ['赤城改：艦上攻撃機・艦上爆撃機1個','加賀改：艦上攻撃機・艦上爆撃機1個','この装備例に必要2・あと2個','第1枠','流星','彗星','戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','同時配備の成立や購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('長門改二：艦上攻撃機'));assert.ok(!html.includes('鳥海改二：艦上攻撃機'));
});
test('5-2 named guidance stays off other paths and numeric/explicit user goals while prior scopes remain connected',()=>{
 const c=context(),p=fleet();
 for(const path of ['BCDFO','BCDGLO','other'])assert.equal(c.hdOCThreeThreeCarrierTargets({...p,path},attack),null);
 for(const g of [{...attack,purpose:'strategy'},{...attack,generatedFromMap:false},{...attack,kind:'los-value'},{...attack,kind:'cap-asw'}])assert.equal(c.hdOCThreeThreeCarrierTargets(p,g),null);
 assert.equal(c.hdOCThreeThreeCarrierTargets({...p,map:'6-2'},attack),null);
 for(const map of ['5-1','4-5','3-3'])assert.equal(c.hdOCThreeThreeCarrierTargets({...p,map},attack).length,2,map);
});
