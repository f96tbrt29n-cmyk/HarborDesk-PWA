'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
// Isolate the route-scoped presentation with controlled catalog/slot inputs.
// Existing three-three-placement tests cover the unchanged real compatibility
// helpers; the browser case uses the registered six-ship fleet.
function context(){
 const hulls={'赤城改':'正規空母','加賀改':'正規空母','隼鷹改二':'軽空母','秋月改':'駆逐艦'},items=[{name:'流星',category:'艦上攻撃機'},{name:'彗星',category:'艦上爆撃機'}];
 const c={hdFEEsc:String,HD_SE_PARTS:{carrierAttackPlane:{examples:['流星','彗星']}},hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>part==='carrierAttackPlane'&&items.includes(item),hdFEFindShip:name=>hulls[name]?{type:hulls[name]}:null,hdShipDbSlotProfile:()=>({count:3,slots:[18,0,6]}),hdSECapabilityMeasure:p=>({count:p.ships.some(s=>s.items?.some(x=>x.name==='流星'))?1:0}),hdOCCompatible:(slot,candidate)=>slot.capacity>0&&items.includes(candidate.item),hdFERouteRequirementData:p=>({path:p.path||({'3-3':'ACGM','3-4':'ACEGJP'}[p.map])})};
 load('owned-equipment-planner.js','hdOCThreeThreeCarrierTargets',c);load('owned-equipment-planner.js','hdOCCapabilityStockHtml',c);return c;
}
const goal={kind:'cap-carrier-attack',minCount:3,generatedFromMap:true,purpose:'recommendation'},fleet=()=>({map:'3-4',ships:['赤城改','加賀改','隼鷹改二','秋月改'].map(ship=>({ship,items:[]}))});
test('3-4 optional attack-plane shortage names each of three carriers and one plane in a known ordinary slot',()=>{
 const c=context(),p=fleet(),before=JSON.stringify(p),targets=c.hdOCThreeThreeCarrierTargets(p,goal);
 assert.ok(targets,'the selected ACEGJP recommendation is connected');
 assert.deepEqual(Array.from(targets,t=>[t.ship,t.count,t.status,Array.from(t.slots,s=>s.index)]),[['赤城改',1,'candidate',[0,2]],['加賀改',1,'candidate',[0,2]],['隼鷹改二',1,'candidate',[0,2]]]);
 const html=c.hdOCCapabilityStockHtml({capability:true,carrierTargets:targets,stock:{recipe:{name:'空母：搭載枠に攻撃機'},parts:[{part:'carrierAttackPlane',label:'艦上攻撃機・艦上爆撃機',need:3,have:0,items:[]}]}});
 for(const name of ['赤城改','加賀改','隼鷹改二'])assert.match(html,new RegExp(name+'：艦上攻撃機・艦上爆撃機1個'));
 for(const text of ['所持0 / この装備例に必要3','第1枠','第3枠','戦闘上の推奨','経路の必須条件ではありません','他の目標と共用','未所持品を含む','購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.equal(JSON.stringify(p),before);
});
test('3-4 named targets exclude fulfilled hulls and do not leak into another route or an explicit goal',()=>{
 const c=context(),p=fleet();p.ships[0].items=[{name:'流星'}];const rows=c.hdOCThreeThreeCarrierTargets(p,goal);
 assert.ok(rows);assert.deepEqual(Array.from(rows,t=>t.ship),['加賀改','隼鷹改二']);
 for(const [plan,g]of [[{...p,map:'4-1'},goal],[{...p,path:'other'},goal],[p,{...goal,generatedFromMap:false}],[p,{...goal,purpose:'strategy'}],[p,{...goal,kind:'制空'}]])assert.equal(c.hdOCThreeThreeCarrierTargets(plan,g),null);
 const legacy=c.hdOCThreeThreeCarrierTargets({...p,map:'3-3'},goal);assert.deepEqual(Array.from(legacy,t=>t.ship),['加賀改','隼鷹改二']);
});
