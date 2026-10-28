'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'三式水中探信儀',category:'小型ソナー'},{name:'三式爆雷投射機',category:'爆雷投射機'},{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'}];
 const hulls={秋月改:{type:'駆逐艦',profile:{id:1,count:3,slots:[0,0,0],flags:[]}},赤城改:{type:'正規空母',profile:{id:2,count:3,slots:[18,0,6],flags:[]}},鳥海改二:{type:'重巡洋艦',profile:{id:3,count:4,slots:[2,2,4,4],flags:[]}},一枠艦:{type:'駆逐艦',profile:{id:4,count:1,slots:[0],flags:[]}},同一枠のみ:{type:'駆逐艦',profile:{id:5,count:2,slots:[0,0],flags:[]}},分離枠:{type:'駆逐艦',profile:{id:6,count:2,slots:[0,0],flags:[]}},未登録枠:{type:'駆逐艦'}};
 const c={hdFEEsc:x=>String(x).replaceAll('<','&lt;').replaceAll('>','&gt;'),HD_SE_PARTS:{sonar:{label:'ソナー',examples:['三式水中探信儀']},projector:{label:'爆雷投射機',examples:['三式爆雷投射機']},carrierAttackPlane:{examples:['流星','彗星']}},HD_FE_AIR_CATS:new Set(['艦上攻撃機','艦上爆撃機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>({'小型ソナー':'sonar','爆雷投射機':'projector','艦上攻撃機':'carrierAttackPlane','艦上爆撃機':'carrierAttackPlane'})[item.category]===part,hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbMasterCompatible:()=>null,HD_SLOT_EXCLUSION_RULES:[{shipIds:[5],slot:1,allowOnly:[6]},{shipIds:[6],slot:0,allowOnly:[14,15]},{shipIds:[6],slot:1,allowOnly:[14]}],hdShipDbPickerTypeId:item=>({'小型ソナー':14,'爆雷投射機':15,'艦上攻撃機':8,'艦上爆撃機':7})[item.category],hdFERouteRequirementData:p=>({path:p.path||({'4-1':'CFDGJ / ABDGJ','3-4':'ACEGJP','3-3':'ACGM'}[p.map])}),hdSECapabilityMeasure:()=>({count:0})};
 for(const name of ['hdShipDbSlotRules','hdShipDbSlotRejects','hdShipDbEquipCompatible'])load('ship-database.js',name,c);
 for(const name of ['hdOCCompatible','hdOCThreeThreeCarrierTargets','hdOCFourOneAswTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const goal={kind:'cap-asw',minCount:1,generatedFromMap:true,purpose:'recommendation'},stock={recipe:{id:'sonar-projector',name:'ソナー＋爆雷投射機'},parts:[{part:'sonar',label:'ソナー',need:1,have:0,items:[]},{part:'projector',label:'爆雷投射機',need:1,have:0,items:[]}]};
const fleet=()=>({map:'4-1',ships:['赤城改','鳥海改二','秋月改'].map(ship=>({ship,items:[]}))});
test('4-1 ASW recipe names actual eligible hull, one sonar and projector, and legal distinct normal slots',()=>{
 const c=context(),p=fleet(),before=JSON.stringify([p,goal,stock]),targets=c.hdOCFourOneAswTargets(p,goal,stock);
 assert.deepEqual(Array.from(targets,t=>[t.ship,t.status]),[['秋月改','candidate']]);
 for(const part of targets[0].parts){assert.equal(part.count,1);assert.deepEqual(Array.from(part.slots,s=>s.index),[0,1,2]);assert.ok(part.slots.every(s=>s.candidates.length===1));}
 const html=c.hdOCCapabilityStockHtml({capability:true,aswTargets:targets,stock});
 for(const text of ['秋月改','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','別々の通常枠','所持0 / この装備例に必要1・あと1個','先制対潜の成立人数ではありません','増設枠は含めません','他の目標と枠を共用','購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.equal(JSON.stringify([p,goal,stock]),before);
});
test('ASW candidate pairs reject one or shared-only slot and preserve unknown profiles as manual',()=>{
 const c=context(),p={map:'4-1',ships:['一枠艦','同一枠のみ','分離枠','未登録枠','艦名不明'].map(ship=>({ship,items:[]}))},rows=c.hdOCFourOneAswTargets(p,goal,stock);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status]),[['分離枠','candidate'],['未登録枠','manual'],['艦名不明','manual']]);
 assert.deepEqual(Array.from(rows[0].parts,p=>[p.part,Array.from(p.slots,s=>s.index)]),[['sonar',[1]],['projector',[0]]]);
 const html=c.hdOCCapabilityStockHtml({capability:true,aswTargets:rows,stock});assert.match(html,/艦・通常スロット情報が未判定/);
 const empty=c.hdOCCapabilityStockHtml({capability:true,aswTargets:[],stock});assert.match(empty,/手持ちでは不可能という判定ではありません/);
});
test('4-1 named guides are scoped to this generated recommendation and never alter another route or explicit goal',()=>{
 const c=context(),p=fleet();
 for(const [plan,g,s]of [[{...p,map:'4-2'},goal,stock],[{...p,path:'other'},goal,stock],[p,{...goal,purpose:'strategy'},stock],[p,{...goal,generatedFromMap:false},stock],[p,{...goal,kind:'cap-aa'},stock],[p,goal,{...stock,recipe:{id:'other'}}]])assert.equal(c.hdOCFourOneAswTargets(plan,g,s),null);
 const attack={kind:'cap-carrier-attack',generatedFromMap:true,purpose:'recommendation'},rows=c.hdOCThreeThreeCarrierTargets(p,attack);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.count,Array.from(r.slots,s=>s.index)]),[['赤城改',1,[0,2]]]);
 for(const path of ['other','CFDGJ','ABDGJ'])assert.equal(c.hdOCThreeThreeCarrierTargets({...p,path},attack),null);
});
