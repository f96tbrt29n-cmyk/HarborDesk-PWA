'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'大発動艇(八九式中戦車＆陸戦隊)',category:'上陸用舟艇'},{name:'特二式内火艇',category:'特型内火艇'},{name:'WG42 (Wurfgerät 42)',category:'対地装備'},{name:'三式弾',category:'対空強化弾'},{name:'零式水上観測機',category:'水上偵察機'}];
 const allowed=['上陸用舟艇','特型内火艇','対地装備'];
 const hulls={大潮改二:{type:'駆逐艦',allowed,profile:{id:1,count:3,slots:[0,0,0],flags:[]}},矢矧改二乙:{type:'軽巡洋艦',allowed,profile:{id:2,count:4,slots:[1,1,2,2],flags:[]}},金剛改二:{type:'戦艦',allowed:[],profile:{id:3,count:4,slots:[3,3,3,3],flags:[]}},同枠制限:{type:'駆逐艦',allowed,profile:{id:7,count:2,slots:[0,0],flags:[]}},一枠のみ:{type:'駆逐艦',allowed,profile:{id:8,count:1,slots:[0],flags:[]}},枠不明:{type:'駆逐艦',allowed},内火艇不可:{type:'駆逐艦',allowed:['上陸用舟艇','対地装備'],profile:{id:9,count:3,slots:[0,0,0],flags:[]}}};
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{tank:{label:'陸戦隊系',examples:[items[0].name]},amphibious:{label:'内火艇系',examples:[items[1].name]},rocket:{label:'対地ロケット',examples:[items[2].name]}},HD_FE_AIR_CATS:new Set(['水上偵察機']),hdFLCatalog:()=>items,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:(item,db)=>db.allowed.includes(item.category),HD_SLOT_EXCLUSION_RULES:[{shipIds:[7],slot:1,allowOnly:[10]}],hdShipDbPickerTypeId:item=>({'上陸用舟艇':24,'特型内火艇':46,'対地装備':37,'対空強化弾':18,'水上偵察機':10})[item.category],hdFERouteRequirementData:p=>({path:p.path||'BDCFN'})};
 c.window=c;c.hdFECatalog=c.hdFLCatalog;vm.runInNewContext('let hdFEEquipmentIndex=null;',c);load('fleet-readiness-evaluator.js','hdFEFind',c);
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 load('sortie-equipment-check.js','hdSEPartMatches',c);
 for(const name of ['hdOCCompatible','hdOCSixFourLandTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const goal={kind:'cap-land-mixed',minCount:1,generatedFromMap:true,purpose:'recommendation'};
const stock=id=>({recipe:{id,name:id==='tank-amphibious'?'陸戦隊系＋内火艇系':'陸戦隊系＋対地ロケット',parts:['tank',id==='tank-amphibious'?'amphibious':'rocket']},parts:[{part:'tank',label:'陸戦隊系',need:1,have:0,items:[]},{part:id==='tank-amphibious'?'amphibious':'rocket',label:id==='tank-amphibious'?'内火艇系':'対地ロケット',need:1,have:0,items:[]}]});
test('6-4 mixed-installation examples name one hull and distinct legal normal slots without aircraft-capacity requirements',()=>{
 const c=context(),p={map:'6-4',ships:['大潮改二','矢矧改二乙','金剛改二'].map(ship=>({ship,items:[]}))},s=stock('tank-amphibious'),before=JSON.stringify([p,goal,s]),rows=c.hdOCSixFourLandTargets(p,goal,s);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,Array.from(r.parts,x=>x.count)]),[['大潮改二','candidate',[1,1]],['矢矧改二乙','candidate',[1,1]]]);
 const dd=rows[0];for(const part of dd.parts)assert.deepEqual(Array.from(part.slots,s=>s.index),[0,1,2]);
 assert.ok(dd.parts[0].slots.some(a=>dd.parts[1].slots.some(b=>a.index!==b.index)));assert.equal(JSON.stringify([p,goal,s]),before);
 const rocket=c.hdOCSixFourLandTargets(p,goal,stock('tank-rocket'));assert.ok(rocket.every(r=>r.parts[1].part==='rocket'&&r.parts[1].slots.every(s=>s.candidates.includes('WG42 (Wurfgerät 42)'))));
 const canonical=c.hdFLCatalog()[0];canonical.name='大発動艇(八九式中戦車&陸戦隊)';c.hdFLCatalog().push({name:'特四式内火艇',category:'特型内火艇'});assert.equal(c.hdSEPartMatches('amphibious',c.hdFLCatalog().at(-1)),true,'legacy broad capability match remains available');const bounded=c.hdOCSixFourLandTargets(p,goal,s);assert.ok(bounded[0].parts[0].slots.every(slot=>slot.candidates.includes(canonical.name)),'explicit example resolves catalog NFKC ampersand spelling');assert.ok(bounded.every(row=>row.parts.every(part=>part.slots.every(slot=>!slot.candidates.includes('特四式内火艇')))),'non-example catalog item is outside this displayed recipe, not declared globally unusable');
});
test('6-4 unknown normal-slot information and known same-slot or hull restrictions stay separate',()=>{
 const c=context(),p={map:'6-4',ships:['枠不明','未登録艦','同枠制限','一枠のみ','内火艇不可'].map(ship=>({ship,items:[]}))},before=JSON.stringify(p),rows=c.hdOCSixFourLandTargets(p,goal,stock('tank-amphibious'));
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,r.parts.length]),[['枠不明','manual',0],['未登録艦','manual',0],['同枠制限','blocked',0],['一枠のみ','blocked',0],['内火艇不可','blocked',0]]);
 assert.equal(JSON.stringify(p),before);const text=c.hdOCCapabilityStockHtml({capability:true,stock:stock('tank-amphibious'),landTargets:rows});assert.ok(text.includes('情報が未判定')&&text.includes('別々の通常枠へ載せられる候補がありません'));
});
test('6-4 named land guidance keeps one optional alternative and purchase, inventory and victory limits',()=>{
 const c=context(),p={map:'6-4',ships:[{ship:'大潮改二',items:[]}]},s=stock('tank-amphibious'),g={capability:true,stock:s,landTargets:c.hdOCSixFourLandTargets(p,goal,s)},before=JSON.stringify(g),html=c.hdOCCapabilityStockHtml(g);
 for(const text of ['大潮改二','陸戦隊系1個','内火艇系1個','通常第1枠','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','1組の代替候補','候補名はここで示す装備例に限定します','全候補艦への配備を求めるものではありません','戦闘上の推奨装備例','経路の必須条件','未所持品','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.equal(JSON.stringify(g),before);const empty=c.hdOCCapabilityStockHtml({...g,landTargets:[]});assert.ok(empty.includes('手持ちでは不可能という判定ではありません'));
 const escaped=c.hdOCCapabilityStockHtml({...g,landTargets:[{...g.landTargets[0],ship:'<艦>',parts:[{part:'tank',label:'<部品>',count:1,slots:[{index:0,candidates:['<装備>']}]}]}]});for(const text of ['&lt;艦&gt;','&lt;部品&gt;','&lt;装備&gt;'])assert.ok(escaped.includes(text));assert.ok(!escaped.includes('<艦>'));
 const legacy=c.hdOCCapabilityStockHtml({capability:true,stock:s});assert.ok(!legacy.includes('data-hd-oc-land-targets'));
});
test('6-4 land targets stay off other paths, user or numeric goals and changed recipe shapes',()=>{
 const c=context(),p={map:'6-4',ships:[{ship:'大潮改二',items:[]}]},s=stock('tank-amphibious');
 for(const map of ['4-3','4-5','6-3','7-5'])assert.equal(c.hdOCSixFourLandTargets({...p,map},goal,s),null);
 for(const path of ['ADCFN','MKJIN','other'])assert.equal(c.hdOCSixFourLandTargets({...p,path},goal,s),null);
 for(const g of [{...goal,purpose:'strategy'},{...goal,generatedFromMap:false},{...goal,kind:'cap-land-soft'},{...goal,kind:'los-value'}])assert.equal(c.hdOCSixFourLandTargets(p,g,s),null);
 for(const recipe of [{id:'type3',parts:['type3']},{id:'tank-amphibious',parts:['tank','rocket']},{id:'tank-rocket',parts:['tank','rocket','rocket']}])assert.equal(c.hdOCSixFourLandTargets(p,goal,{...s,recipe}),null);
 const missing=context();missing.hdFERouteRequirementData=()=>({path:undefined});assert.equal(missing.hdOCSixFourLandTargets(p,goal,s),null);
});
