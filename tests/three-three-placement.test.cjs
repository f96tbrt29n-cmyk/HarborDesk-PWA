'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const text=fs.readFileSync(path.join(root,file),'utf8'),a=text.indexOf('function '+name+'('),b=text.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(text.slice(a,b<0?undefined:b),c);return c[name]}
const targets=[{ship:'赤城改',shipIndex:0,count:1,status:'candidate',slots:[{index:0,candidates:['流星','彗星']}],unknownSlots:false},{ship:'隼鷹改二',shipIndex:1,count:1,status:'candidate',slots:[{index:2,candidates:['流星']}],unknownSlots:false}];
const stock={recipe:{name:'空母：搭載枠に攻撃機'},parts:[{part:'carrierAttackPlane',label:'艦上攻撃機・艦上爆撃機',need:2,have:0,items:[]}]};
test('3-3 carrier shortage identifies both unmet hulls, one attack plane each and usable normal slots',()=>{
 const c={hdFEEsc:String,HD_SE_PARTS:{carrierAttackPlane:{examples:['流星','彗星']}}},render=load('owned-equipment-planner.js','hdOCCapabilityStockHtml',c);
 const goal={capability:true,stock,carrierTargets:targets},before=JSON.stringify(goal),html=render(goal);
 assert.match(html,/赤城改.*1個/);assert.match(html,/隼鷹改二.*1個/);assert.match(html,/第1枠/);assert.match(html,/第3枠/);
 assert.match(html,/戦闘上の推奨/);assert.match(html,/経路の必須条件ではありません/);assert.match(html,/他の目標と共用/);assert.match(html,/未所持品を含む/);
 assert.equal(JSON.stringify(goal),before);
 const legacy=render({capability:true,stock});assert.doesNotMatch(legacy,/data-hd-oc-carrier-targets/);
});

function placement(){
 const items=[{name:'流星',category:'艦上攻撃機',stats:{}},{name:'彗星',category:'艦上爆撃機',stats:{}},{name:'噴式景雲改',category:'噴式戦闘爆撃機',stats:{}},{name:'零式艦戦',category:'艦上戦闘機',stats:{対空:5}},{name:'22号対水上電探',category:'小型電探',stats:{}}];
 const rows={赤城改:{type:'正規空母',profile:{id:1,count:4,slots:[18,18,0,6],flags:[]}},隼鷹改二:{type:'軽空母',profile:{id:2,count:3,slots:[12,0,12],flags:[]}},零搭載:{type:'軽空母',profile:{id:3,count:2,slots:[0,0],flags:[]}},未確認枠:{type:'正規空母',profile:{id:4,count:2,slots:[undefined,-1],flags:[]}},未登録枠:{type:'正規空母'},制限枠:{type:'正規空母',profile:{id:5,count:1,slots:[18],flags:[]}}};
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{carrierAttackPlane:{examples:['流星','彗星']}},HD_SE_RECIPES:{'cap-carrier-attack':[{parts:['carrierAttackPlane'],ship:'carrier-attack'}]},HD_FE_AIR_CATS:new Set(['艦上戦闘機','艦上攻撃機','艦上爆撃機','噴式戦闘爆撃機']),hdFLCatalog:()=>items,hdFEFind:n=>items.find(i=>i.name===n),hdFEFindShip:n=>rows[n],hdShipDbSlotProfile:db=>db?.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[1],slot:1,allowOnly:[6]},{shipIds:[5],slot:0,allowOnly:[6]}],hdShipDbPickerTypeId:item=>({'艦上戦闘機':6,'艦上攻撃機':8,'艦上爆撃機':7,'噴式戦闘爆撃機':57})[item.category],hdFERouteRequirementData:()=>({path:'ACGM'})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdSEPartMatches','hdSERecipeAllows','hdSEPool','hdSERecipeParts','hdSEShipPool','hdSECapabilityMeasure'])load('sortie-equipment-check.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);
 return c;
}
const generated={kind:'cap-carrier-attack',minCount:2,generatedFromMap:true,purpose:'recommendation'};
test('carrier target slots respect real part, equipment and slot checks, zero capacity and scoped goals',()=>{
 const c=placement(),p={map:'3-3',ships:[{ship:'赤城改',items:[]},{ship:'隼鷹改二',items:[]}]},before=JSON.stringify(p),targets=c.hdOCThreeThreeCarrierTargets(p,generated);
 assert.deepEqual(Array.from(targets,t=>[t.ship,t.count,t.status,Array.from(t.slots,s=>s.index)]),[['赤城改',1,'candidate',[0,3]],['隼鷹改二',1,'candidate',[0,2]]]);
 for(const t of targets)for(const slot of t.slots)assert.deepEqual(Array.from(slot.candidates),['流星','彗星']);
 assert.equal(JSON.stringify(p),before);
 for(const [plan,goal]of [[{...p,map:'2-5'},generated],[p,{...generated,generatedFromMap:false}],[p,{...generated,purpose:'strategy'}],[p,{...generated,kind:'制空'}]])assert.equal(c.hdOCThreeThreeCarrierTargets(plan,goal),null);
});
test('duplicate carrier names are judged per hull and unknown slots remain manual instead of usable',()=>{
 const c=placement(),p={map:'3-3',ships:[{ship:'赤城改',items:[{name:'流星',slotIndex:0,capacity:18}]},{ship:'赤城改',items:[]},{ship:'零搭載',items:[]},{ship:'未確認枠',items:[]},{ship:'未登録枠',items:[]},{ship:'制限枠',items:[]}]};
 const rows=c.hdOCThreeThreeCarrierTargets(p,generated);
 assert.deepEqual(Array.from(rows,r=>[r.shipIndex,r.status,r.count]),[[1,'candidate',1],[2,'blocked',1],[3,'manual',1],[4,'manual',1],[5,'blocked',1]]);
 assert.deepEqual(Array.from(rows.filter(r=>r.status!=='candidate'),r=>r.slots.length),[0,0,0,0]);
 const html=c.hdOCCapabilityStockHtml({capability:true,stock,carrierTargets:rows});assert.match(html,/スロット情報が未判定/);assert.match(html,/搭載できる通常枠がありません/);
});
test('named carrier candidates escape displayed hull and catalog text without changing optional stock semantics',()=>{
 const c=placement(),render=c.hdOCCapabilityStockHtml,rows=[{...targets[0],ship:'<hull>',slots:[{index:0,candidates:['<plane>']}]}],html=render({capability:true,stock,carrierTargets:rows});
 assert.match(html,/&lt;hull&gt;/);assert.match(html,/&lt;plane&gt;/);assert.doesNotMatch(html,/<hull>|<plane>/);
 const gap=load('owned-equipment-planner.js','hdOCStockGap',{});assert.equal(gap({kind:'航空攻撃',minCount:2,owned:0,placement:true}),0);assert.equal(gap({kind:'制空',goalKind:'air-value',minCount:200,owned:0}),0);
});
test('owned counts and compatible slot upper bounds do not establish simultaneous radar and fighter allocation',()=>{
 const c=placement();for(const name of ['hdFOItemMeta','hdFOItemMatches'])load('fleet-loadout-optimizer.js',name,c);
 for(const name of ['hdOCItemMatches','hdOCPlacementInfo','hdOCSouthScouting','hdOCScoutingOptional','hdOCPlacementHtml','hdOCStockGap'])load('owned-equipment-planner.js',name,c);
 const db={type:'正規空母',profile:{id:7,count:1,slots:[18],flags:[]}},slots=[{db,profile:db.profile,index:0,capacity:18}];
 const inventory=['零式艦戦','22号対水上電探'].map(name=>({name,key:name,star:0,count:1,item:c.hdFEFind(name)})),before=JSON.stringify(inventory);
 for(const kind of ['制空','電探']){
  const info=c.hdOCPlacementInfo(kind,inventory,slots,c.hdFLCatalog());assert.equal(info.usableOwned,1);assert.equal(info.compatibleSlots,1);assert.equal(info.blocked.length,0);
  const goal={kind,goalKind:kind,minCount:1,owned:1,placement:true,...info};assert.equal(c.hdOCStockGap(goal),0);assert.match(c.hdOCPlacementHtml(goal,{map:'3-3',index:0}),/他の条件と共用/);
 }
 assert.equal(JSON.stringify(inventory),before);
});
