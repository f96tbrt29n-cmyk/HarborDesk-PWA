'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){if(file==='owned-equipment-planner.js'&&name==='hdOCFourOneAswTargets'&&!c.hdOCAswSetUserGoal)load(file,'hdOCAswSetUserGoal',c);const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'三式水中探信儀',category:'小型ソナー'},{name:'三式爆雷投射機',category:'爆雷投射機'}];
 const hulls={軽巡候補:{type:'軽巡洋艦',profile:{id:1,count:3,slots:[0,0,0],flags:[]}},駆逐候補:{type:'駆逐艦',profile:{id:2,count:3,slots:[0,0,0],flags:[]}},海防候補:{type:'海防艦',profile:{id:3,count:2,slots:[0,0],flags:[]}},一枠艦:{type:'駆逐艦',profile:{id:4,count:1,slots:[0],flags:[]}},同一枠のみ:{type:'駆逐艦',profile:{id:5,count:2,slots:[0,0],flags:[]}},分離枠:{type:'駆逐艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},未登録枠:{type:'海防艦'}};
 let inventory=new Map(items.map(item=>[item.name,{key:item.name+'@@0',name:item.name,item,star:0,count:4}]));
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{sonar:{label:'ソナー',examples:['三式水中探信儀']},projector:{label:'爆雷投射機',examples:['三式爆雷投射機']}},HD_SE_RECIPES:{'cap-asw':[{id:'sonar-projector',name:'ソナー＋爆雷投射機',parts:['sonar','projector']}]},HD_FE_AIR_CATS:new Set(),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>({'小型ソナー':'sonar','爆雷投射機':'projector'})[(item.item||item).category]===part,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[5],slot:1,allowOnly:[6]},{shipIds:[6],slot:0,allowOnly:[14,15]},{shipIds:[6],slot:1,allowOnly:[14]}],hdShipDbPickerTypeId:item=>({'小型ソナー':14,'爆雷投射機':15})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'7-1':'DEGHK','6-5':'BFIJM','4-1':'CFDGJ / ABDGJ'}[p.map])}),hdFLInventory:()=>inventory,hdFERosterForShip:()=>null,hdFLHasExpansion:()=>false};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdSERecipeAllows','hdSERecipeParts','hdSECapabilityStock'])load('sortie-equipment-check.js',name,c);
 for(const name of ['hdOCCompatible','hdOCFourOneAswTargets','hdOCCapabilityStockHtml','hdOCStockGap','hdOCProcurementHtml'])load('owned-equipment-planner.js',name,c);
 return {c,emptyInventory(){inventory=new Map()}};
}
const goal={kind:'cap-asw',minCount:4,generatedFromMap:true,purpose:'recommendation'};
const plan=()=>({map:'7-1',ships:['軽巡候補','駆逐候補','海防候補'].map(ship=>({ship,items:[]}))});
test('7-1 four existing ASW example targets retain aggregate stock4 while each hull example uses one legal distinct-slot pair',()=>{
 const {c}=context(),p=plan(),stock=c.hdSECapabilityStock(p,goal.kind,goal.minCount),before=JSON.stringify([p,goal,stock]),rows=c.hdOCFourOneAswTargets(p,goal,stock);
 assert.deepEqual(Array.from(stock.parts,x=>[x.part,x.need,x.have]),[['sonar',4,4],['projector',4,4]]);assert.equal(stock.complete,true);assert.deepEqual(Array.from(stock.recipe.parts),['sonar','projector']);assert.equal(stock.usable.total,2,'usable describes one two-part example, not a simultaneous four-hull allocation');
 assert.deepEqual(Array.from(rows,x=>[x.ship,x.status]),[['軽巡候補','candidate'],['駆逐候補','candidate'],['海防候補','candidate']]);
 for(const row of rows){assert.deepEqual(Array.from(row.parts,x=>[x.part,x.count]),[['sonar',1],['projector',1]]);assert.ok(row.parts[0].slots.some(a=>row.parts[1].slots.some(b=>a.index!==b.index)));assert.ok(row.parts.every(x=>x.slots.every(s=>s.candidates.length===1)))}
 assert.equal(JSON.stringify([p,goal,stock]),before);
});
test('7-1 ASW targets keep one-slot conflicts and missing hull or profile knowledge distinct',()=>{
 const {c,emptyInventory}=context();emptyInventory();const p={map:'7-1',ships:['一枠艦','同一枠のみ','分離枠','未登録枠','艦名不明'].map(ship=>({ship,items:[]}))},stock=c.hdSECapabilityStock(p,goal.kind,4),rows=c.hdOCFourOneAswTargets(p,goal,stock);
 assert.deepEqual(Array.from(rows,x=>[x.ship,x.status]),[['分離枠','candidate'],['未登録枠','manual'],['艦名不明','manual']]);assert.deepEqual(Array.from(rows[0].parts,p=>[p.part,Array.from(p.slots,s=>s.index)]),[['sonar',[1]],['projector',[0]]]);
 assert.deepEqual(Array.from(stock.parts,x=>[x.need,x.have]),[[4,0],[4,0]]);assert.equal(stock.complete,false);
});
test('7-1 four-set shortage guidance names a one-pair candidate without OASW or joint-purchase claims',()=>{
 const {c,emptyInventory}=context();emptyInventory();const p=plan(),stock=c.hdSECapabilityStock(p,goal.kind,4),rows=c.hdOCFourOneAswTargets(p,goal,stock),g={...goal,kind:'対潜',goalKind:'cap-asw',capability:true,placement:true,stock,aswTargets:rows,candidates:['三式水中探信儀']},html=c.hdOCCapabilityStockHtml(g);
 for(const text of ['この装備例に必要4・あと4個','軽巡候補','海防候補','ソナー1個','爆雷投射機1個','通常第1枠','同じ艦の別々の通常枠','以下は1組の搭載先の候補','必要組数は目標欄','全候補艦への配備を求めるものではありません','経路の必須条件や先制対潜の成立人数ではありません','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);
 c.hdPLSave=()=>{throw Error('display must not create a procurement plan')};assert.equal(c.hdOCStockGap(g),0);assert.equal(c.hdOCProcurementHtml(g,0,''),'');
});
test('7-1 ASW candidates are limited to selected DEGHK generated recommendations and retain earlier map scopes',()=>{
 const {c}=context(),p=plan(),stock=c.hdSECapabilityStock(p,goal.kind,4);
 for(const [q,g,s]of [[{...p,path:'FGHK'},goal,stock],[{...p,path:'other'},goal,stock],[{...p,map:'7-2'},goal,stock],[p,{...goal,purpose:'strategy'},stock],[p,{...goal,generatedFromMap:false},stock],[p,{...goal,kind:'opening-asw'},stock],[p,goal,{...stock,recipe:{id:'other'}}]])assert.equal(c.hdOCFourOneAswTargets(q,g,s),null);
 assert.equal(c.hdOCFourOneAswTargets({...p,map:'6-5'},goal,stock).length,3);assert.equal(c.hdOCFourOneAswTargets({...p,map:'4-1'},goal,stock).length,3);
 const unknown=context();unknown.c.hdFERouteRequirementData=()=>({path:undefined});assert.equal(unknown.c.hdOCFourOneAswTargets(p,goal,stock),null);
});
