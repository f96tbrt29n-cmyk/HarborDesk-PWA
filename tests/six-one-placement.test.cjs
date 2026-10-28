'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInNewContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){
 const items=[{name:'通常魚雷',category:'魚雷',parts:['nightTorpedo','nightSubNormal']},{name:'後期型魚雷',category:'潜水艦魚雷',parts:['nightSubLate','nightTorpedo']},{name:'潜水艦用電探',category:'潜水艦装備',parts:['nightSubRadar']},{name:'水上偵察機',category:'水上偵察機',parts:[]}];
 const hulls={SS:{type:'潜水艦',profile:{id:1,count:2,slots:[0,0]}},SSV:{type:'潜水空母',profile:{id:2,count:2,slots:[1,1]}},AS:{type:'潜水母艦',profile:{id:3,count:3,slots:[2,3,3]}},single:{type:'潜水艦',profile:{id:4,count:1,slots:[0]}},locked:{type:'潜水艦',profile:{id:5,count:2,slots:[0,0]}},profileUnknown:{type:'潜水艦'}};
 const c={hdFEEsc:String,HD_SE_PARTS:{nightSubLate:{label:'後期型魚雷'},nightSubRadar:{label:'潜水艦用電探'},nightSubNormal:{label:'通常魚雷'},nightTorpedo:{label:'魚雷'}},HD_FE_AIR_CATS:new Set(['水上偵察機']),hdFLCatalog:()=>items,hdSEPartMatches:(part,item)=>item.parts.includes(part),hdFEFindShip:name=>hulls[name],hdShipDbSlotProfile:db=>db.profile||null,hdShipDbEquipCompatible:(item,db)=>['潜水艦','潜水空母'].includes(db.type)&&item.category!=='水上偵察機',hdShipDbSlotRejects:(profile,index)=>profile.id===5&&index!==0,hdShipDbExpansionInfo:()=>({allowed:false}),hdFERouteRequirementData:p=>({path:p.path||'AFGHK'}),hdSERecipeAllows:(recipe,ship)=>!ship.identityUnknown,hdSENightRecipeReady:ship=>!!ship.complete};
 for(const name of ['hdOCCompatible','hdOCSixOneNightTargets','hdOCCapabilityStockHtml'])load('owned-equipment-planner.js',name,c);return c;
}
const goal={kind:'cap-night-auto',minCount:1,generatedFromMap:true,purpose:'recommendation'};
const recipe=id=>({recipe:{id,ship:'night-sub',parts:({'sub-radar':['nightSubLate','nightSubRadar'],'sub-late':['nightSubLate','nightSubLate'],'sub-torpedo':['nightSubNormal','nightTorpedo']})[id]}});
const fleet=()=>({map:'6-1',ships:['AS','SS','SSV'].map(ship=>({ship,items:[]}))});
test('6-1 submarine CI example names eligible hulls and distinct legal normal slots including zero capacity',()=>{
 const c=context(),p=fleet(),stock=recipe('sub-radar'),before=JSON.stringify([p,goal,stock]),rows=c.hdOCSixOneNightTargets(p,goal,stock);
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,Array.from(r.parts,x=>[x.part,x.count,Array.from(x.slots,s=>s.index)])]),[['SS','candidate',[['nightSubLate',1,[0,1]],['nightSubRadar',1,[0,1]]]],['SSV','candidate',[['nightSubLate',1,[0,1]],['nightSubRadar',1,[0,1]]]]]);
 assert.equal(JSON.stringify([p,goal,stock]),before);assert.ok(rows.every(r=>r.parts.every(part=>part.slots.every(slot=>!slot.candidates.includes('水上偵察機')))));
 const repeated=c.hdOCSixOneNightTargets(p,goal,recipe('sub-late'));assert.ok(repeated.every(r=>r.parts.length===1&&r.parts[0].count===2));
 p.ships[1].complete=true;assert.deepEqual(Array.from(c.hdOCSixOneNightTargets(p,goal,stock),r=>r.ship),['SSV']);
});
test('6-1 placements keep unknown identity separate from no distinct slots and do not invent expansion slots',()=>{
 const c=context(),p={map:'6-1',ships:['single','locked','profileUnknown','unregistered'].map(ship=>({ship,items:[]}))},before=JSON.stringify(p),rows=c.hdOCSixOneNightTargets(p,goal,recipe('sub-radar'));
 assert.deepEqual(Array.from(rows,r=>[r.ship,r.status,r.parts.length]),[['profileUnknown','manual',0],['unregistered','manual',0]]);assert.equal(JSON.stringify(p),before);
 const unknown=fleet();unknown.ships[1].identityUnknown=true;assert.equal(c.hdOCSixOneNightTargets(unknown,goal,recipe('sub-radar')).find(x=>x.ship==='SS').status,'manual');
});
test('6-1 part quantities and destinations describe one optional example without a purchase or route guarantee',()=>{
 const c=context(),stock={...recipe('sub-radar'),parts:[{part:'nightSubLate',label:'後期型魚雷',need:1,have:0,items:[]},{part:'nightSubRadar',label:'潜水艦用電探',need:1,have:0,items:[]}]};stock.recipe.name='後期型魚雷＋潜水艦用電探CI';
 const html=c.hdOCCapabilityStockHtml({capability:true,stock,subNightTargets:c.hdOCSixOneNightTargets(fleet(),goal,stock)});
 for(const text of ['後期型魚雷：所持0 / この装備例に必要1・あと1個','潜水艦用電探：所持0 / この装備例に必要1・あと1個','SS：','SSV：','通常第1枠','通常第2枠','同じ潜水艦の別々の通常枠','1組の代替候補','全候補艦への配備を求めるものではありません','戦闘上の推奨装備例で、経路必須ではありません','未所持品・現在装備との交換','全目標の同時配備や購入数量を保証しません'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('AS：'));const blocked=c.hdOCCapabilityStockHtml({capability:true,stock,subNightTargets:[]});assert.ok(blocked.includes('手持ちでは不可能という判定ではありません'));
});
test('6-1 submarine guidance stays off other routes, explicit strategies, non-submarine or malformed examples',()=>{
 const c=context(),p=fleet(),stock=recipe('sub-radar');
 for(const map of ['5-1','5-5','6-2'])assert.equal(c.hdOCSixOneNightTargets({...p,map},goal,stock),null);
 assert.equal(c.hdOCSixOneNightTargets({...p,path:'CFGHK'},goal,stock),null);
 for(const changed of [{...goal,purpose:'strategy'},{...goal,generatedFromMap:false},{...goal,kind:'cap-night-sub-torpedo'},{...goal,kind:'los-value'}])assert.equal(c.hdOCSixOneNightTargets(p,changed,stock),null);
 for(const bad of [{recipe:{id:'night-torpedo',ship:'night-surface',parts:['nightTorpedo','nightTorpedo']}},{recipe:{id:'sub-radar',ship:'night-sub',parts:['nightTorpedo','nightTorpedo']}},{recipe:{id:'sub-radar',ship:'night-sub',parts:[]}}])assert.equal(c.hdOCSixOneNightTargets(p,goal,bad),null);
});
