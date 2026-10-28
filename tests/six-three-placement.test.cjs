'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'瑞雲',category:'水上爆撃機'},{name:'試製晴嵐',category:'水上爆撃機'},{name:'零式水上観測機',category:'水上偵察機'},{name:'カ号観測機',category:'回転翼機'}];
 const hulls={日進甲:{type:'水上機母艦',profile:{id:1,count:4,slots:[8,0,12,4],flags:[]}},千歳甲:{type:'水上機母艦',profile:{id:2,count:2,slots:[6,6],flags:[]}},矢矧改二:{type:'軽巡洋艦',profile:{id:3,count:4,slots:[1,1,4,2],flags:[]}},伊勢改二:{type:'航空戦艦',profile:{id:4,count:4,slots:[2,2,22,22],flags:[]}},水母枠不明:{type:'水上機母艦'},水母搭載不明:{type:'水上機母艦',profile:{id:5,count:2,slots:[null,NaN],flags:[]}},水母搭載零:{type:'水上機母艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},水母制限枠:{type:'水上機母艦',profile:{id:7,count:2,slots:[10,10],flags:[]}}};
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{waterAttackPlane:{examples:['瑞雲']}},HD_FE_AIR_CATS:new Set(['水上爆撃機','水上偵察機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>part==='waterAttackPlane'&&item.category==='水上爆撃機',hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[7],slot:0,allowOnly:[10]},{shipIds:[7],slot:1,allowOnly:[10]}],hdShipDbPickerTypeId:item=>({'水上爆撃機':11,'水上偵察機':10,'回転翼機':25})[item.category],hdFERouteRequirementData:p=>({path:p.path||'ACEGHJ'}),hdSECapabilityMeasure:p=>({count:p.ships.filter(s=>s.items?.some(i=>['瑞雲','試製晴嵐'].includes(i.name)&&Number(i.capacity)>0)).length})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCSixThreeWaterTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const water={kind:'cap-water-attack',minCount:1,generatedFromMap:true,purpose:'recommendation'};
const fleet=()=>({map:'6-3',ships:['日進甲','矢矧改二','伊勢改二'].map(ship=>({ship,items:[]}))});
test('6-3 water-bomber guidance identifies only unarmed AVs and positive legal normal slots',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,water]),rows=c.hdOCSixThreeWaterTargets(p,water);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.shipIndex,r.count,r.status,Array.from(r.slots,s=>s.index)]),[['日進甲',0,1,'candidate',[0,2,3]]]);
 for(const row of rows)for(const slot of row.slots)assert.deepEqual(Array.from(slot.candidates),['瑞雲','試製晴嵐']);
 assert.equal(JSON.stringify([p,water]),before);
 p.ships[0].items=[{name:'瑞雲',slotIndex:0,capacity:8}];assert.equal(c.hdOCSixThreeWaterTargets(p,water).length,0);
 p.ships[0].items=[{name:'零式水上観測機',slotIndex:0,capacity:8}];assert.equal(c.hdOCSixThreeWaterTargets(p,water).length,1,'a recon plane is not the water-bomber combat example');
});
test('6-3 water guidance distinguishes unknown slot information from zero or prohibited aircraft slots',()=>{
 const c=context(),p={map:'6-3',ships:['水母枠不明','水母搭載不明','水母搭載零','水母制限枠'].map(ship=>({ship,items:[]}))},before=JSON.stringify(p),rows=c.hdOCSixThreeWaterTargets(p,water);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,r.unknownSlots,r.slots.length]),[['水母枠不明','manual',true,0],['水母搭載不明','manual',true,0],['水母搭載零','blocked',false,0],['水母制限枠','blocked',false,0]]);
 assert.equal(JSON.stringify(p),before);
 const duplicate={map:'6-3',ships:[{ship:'日進甲',items:[{name:'瑞雲',slotIndex:0,capacity:8}]},{ship:'日進甲',items:[]}]};
 assert.deepEqual(Array.from(c.hdOCSixThreeWaterTargets(duplicate,water),r=>r.shipIndex),[1]);
});
test('6-3 named water-bomber guidance preserves optional, source and joint-placement limits without mutating input',()=>{
 const c=context(),p=fleet(),stock={recipe:{id:'water-attack',name:'水母・航戦：搭載枠に水上爆撃機'},parts:[{part:'waterAttackPlane',label:'水上爆撃機',need:1,have:0,items:[]}]},goal={capability:true,stock,waterTargets:c.hdOCSixThreeWaterTargets(p,water)},before=JSON.stringify(goal),html=c.hdOCCapabilityStockHtml(goal);
 for(const text of ['日進甲：水上爆撃機1個','この装備例に必要1・あと1個','通常第1枠','瑞雲','試製晴嵐','戦闘上の推奨装備例','経路の必須条件ではありません','Hの33式索敵条件','G/Hの航空偵察成功','未所持品を含み','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('矢矧改二：水上爆撃機'));assert.ok(!html.includes('伊勢改二：水上爆撃機'));assert.equal(JSON.stringify(goal),before);
 const escaped=c.hdOCCapabilityStockHtml({...goal,waterTargets:[{...goal.waterTargets[0],ship:'<水母>',slots:[{index:0,candidates:['<水爆>']}]}]});assert.ok(escaped.includes('&lt;水母&gt;')&&escaped.includes('&lt;水爆&gt;'));assert.ok(!escaped.includes('<水母>'));
 const legacy=c.hdOCCapabilityStockHtml({capability:true,stock});assert.ok(!legacy.includes('data-hd-oc-water-targets'));
});
test('6-3 water targets stay off other paths and explicit or numeric goals with legacy helpers unchanged',()=>{
 const c=context(),p=fleet();
 for(const map of ['6-1','6-2','5-5','3-3'])assert.equal(c.hdOCSixThreeWaterTargets({...p,map},water),null);
 for(const path of ['ACEFHJ','ABDEGHJ','other'])assert.equal(c.hdOCSixThreeWaterTargets({...p,path},water),null);
 for(const g of [{...water,purpose:'strategy'},{...water,generatedFromMap:false},{...water,kind:'los-value'},{...water,kind:'cap-carrier-attack'}])assert.equal(c.hdOCSixThreeWaterTargets(p,g),null);
 const missing=context();missing.hdFERouteRequirementData=()=>({path:undefined});assert.equal(missing.hdOCSixThreeWaterTargets(p,water),null);
});
