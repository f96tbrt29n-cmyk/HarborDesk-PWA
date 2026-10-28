'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0,name);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function fixture(unknown=false){
 // Literal route inputs and expected boundaries are independent of map-plans.
 const count=(types,min,max)=>({kind:'typeCount',types,matchPolicy:'exact',min,max}),data={index:0,path:'ADEHIJMP',conditions:[{kind:'fleetCount',min:6,max:6},count(['正規空母','軽空母','装甲空母'],0,0),count(['潜水艦','潜水空母'],0,0),count(['戦艦','航空戦艦'],2,2),count(['駆逐艦'],2,7),{kind:'slowBattleshipCount',min:0,max:1}],los:{kind:'required',coef:2,checks:[{safe:45}],exemptWhen:{all:[count(['潜水艦','潜水空母'],0,0),{kind:'minSpeed',rank:15}]}}};
 const types=['戦艦','戦艦','航空巡洋艦','航空巡洋艦','駆逐艦','駆逐艦'],ships=types.map((type,i)=>({ship:'hull'+i,type,bareLos:16,items:[],expansion:null,speedInfo:{known:true,rank:15,invalid:[]}})),db=Object.fromEntries(ships.map(s=>[s.ship,{name:s.ship,type:s.type}]));
 if(unknown){delete db.hull5;ships[5].type='';ships[5].speedInfo.known=false;}
 const items={gun:{name:'gun',category:'小口径主砲',stats:{火力:2},tags:[]}},inventory=[{name:'gun',star:0,count:2,item:items.gun}],plan={map:'5-4',routeIndex:0,ships};
 const c=vm.createContext({data,db,items,inventory,plan,hq:120,HD_FS_TYPE_ALIASES:{},hdFEEsc:String,hdFLScoreBase:()=>0,hdFESpeedLabel:()=> '高速＋',hdFLRows:()=>c.inventory,hdFEFind:n=>c.items[n]||null,hdFEFindShip:n=>c.db[n]||null,hdFERouteRequirementData:()=>c.data,hdShipDbMasterRowFor:r=>c.db[r.name]?{name:r.name,stype:8}:null,hdFERouteShips:p=>p.ships.map(s=>({ship:s,type:s.type,typeKnown:!!c.db[s.ship],speedInfo:s.speedInfo})),hdFCSyncedHq:()=>c.hq,hdFCProposalShipLos:s=>s.bareLos,hdFEGameMatch:()=>({status:'ready'}),hdFEAssigned:()=>[]});
 for(const name of ['hdFEHasTag','hdFEKindCount','hdFEEquipCoef','hdFEImproveCoef','hdFEBranchPredicate','hdFERouteContract'])load('fleet-readiness-evaluator.js',name,c);
 for(const name of ['hdFOItemMeta','hdFOItemMatches'])load('fleet-loadout-optimizer.js',name,c);
 for(const name of ['hdOCItemMatches','hdOCScore','hdOCSearchPendingGoals','hdOCFiveFourFixedInputStop','hdOCSearchStatusHtml'])load('owned-equipment-planner.js',name,c);
 c.hdFEScouting=()=>({available:true,coef:2,score:ships.reduce((n,s)=>n+Math.sqrt(s.bareLos),0)-Math.ceil(c.hq*.4),status:'missing'});
 function measure(){const contract=c.hdFERouteContract(plan),checks=contract.checks.map(r=>({...r,ok:r.status==='ready',unresolved:r.status==='manual'}));return {scoutingExempt:!unknown,routeStatus:contract.status,requiredChecks:checks,goals:[...(!unknown?[]:[{kind:'索敵',count:0,minCount:2,ratio:0,ok:false,generatedFromMap:true,purpose:'recommendation'}]),{kind:'電探',count:0,minCount:1,ratio:0,ok:false,generatedFromMap:true,purpose:'recommendation'},{kind:'cap-night-auto',count:1,minCount:1,ratio:1,ok:true,purpose:'recommendation',generatedFromMap:true},{kind:'air-value',count:0,minCount:309,ratio:0,ok:false,unresolved:true},{kind:'route-requirements',ratio:0,ok:false,unresolved:unknown}]}}
 c.measure=measure();return {c,plan,inventory,measure:c.measure,rebuild:()=>c.measure=measure(),stop:()=>c.hdOCFiveFourFixedInputStop(plan,c.measure,inventory,true)};
}
test('5-4 stops only after mutable night targets reach their maximum; result inputs remain unchanged',()=>{
 const f=fixture(),night=f.measure.goals.find(g=>g.kind==='cap-night-auto');night.ok=false;night.ratio=2/3;night.count=2;night.minCount=3;
 assert.equal(f.stop(),'');night.ok=true;night.ratio=1;night.count=night.minCount=1;
 const before=JSON.stringify([f.plan,f.measure,f.inventory]);assert.equal(f.stop(),'five-four-fixed-stock');assert.equal(JSON.stringify([f.plan,f.measure,f.inventory]),before);
 assert.equal(f.c.hdOCFiveFourFixedInputStop(f.plan,f.measure,f.inventory,false),'');
});
test('unknown hull without a profile is an input wait, never a completed route',()=>{
 const f=fixture(true),before=JSON.stringify([f.plan,f.measure,f.inventory]);assert.equal(f.measure.routeStatus,'manual');assert.equal(f.stop(),'five-four-fixed-data');assert.equal(JSON.stringify([f.plan,f.measure,f.inventory]),before);
 assert.equal(f.measure.requiredChecks.find(r=>r.condition.any).ok,false);assert.equal(f.measure.goals.find(g=>g.kind==='索敵').ok,false);
});
test('registered radar, scouting or improvement contribution prevents the fixed-stock stop',()=>{
 for(const item of [{name:'radar',category:'小型電探',stats:{},tags:[]},{name:'scout',category:'主砲',stats:{索敵:1},tags:[]},{name:'improved',category:'水上偵察機',stats:{},tags:[]}]){
  for(const unknown of [false,true]){const f=fixture(unknown);f.c.items[item.name]=item;f.inventory.push({name:item.name,count:1,star:10,item});assert.equal(f.stop(),'',item.name);}
 }
 // The evaluator and search matcher must both be zero, even if they disagree.
 for(const counter of ['matcher','counter']){const f=fixture();if(counter==='matcher')f.c.hdOCItemMatches=()=>true;else f.c.hdFEKindCount=()=>({count:1});assert.equal(f.stop(),'');}
 const f=fixture();f.c.hdOCScore=()=>.1;assert.equal(f.stop(),'');
});
test('explicit or unfinished objectives and unknown item performance retain ordinary search',()=>{
 for(const change of [g=>g.generatedFromMap=false,g=>g.purpose='strategy',g=>g.count=1,g=>g.ratio=.5,g=>g.unresolved=true]){const f=fixture();change(f.measure.goals.find(g=>g.kind==='電探'));assert.equal(f.stop(),'');}
 for(const unknown of [false,true]){const f=fixture(unknown);f.measure.goals.push({kind:'cap-night-auto',ok:false,ratio:.5});assert.equal(f.stop(),'');}
 const f=fixture();f.inventory.push({name:'unregistered',count:1,star:0,item:{stats:{}}});assert.equal(f.stop(),'');
 const omitted=fixture();omitted.c.hdFLRows=()=>[{name:'unregistered',count:1}];assert.equal(omitted.stop(),'');
});
test('an exempt plan cannot stop if losing exemption could add a satisfied numeric LOS goal',()=>{
 const f=fixture();f.plan.ships.forEach(s=>s.bareLos=256);assert.equal(f.stop(),'');
 f.plan.ships[0].bareLos=null;assert.equal(f.stop(),'five-four-fixed-stock');f.c.hq=null;assert.equal(f.stop(),'five-four-fixed-stock');
});
test('unknown input stop requires fixed empty unknown hulls and confirmed fast known hulls',()=>{
 for(const mutate of [f=>f.plan.ships[5].items.push({name:'gun'}),f=>f.plan.ships[5].expansion={name:'gun'},f=>f.c.db.hull5={type:'駆逐艦'},f=>f.plan.ships[0].speedInfo.rank=10,f=>f.plan.ships[0].speedInfo.invalid.push('invalid'),f=>f.plan.ships[0].speedInfo.expansionUnconfirmed=true,f=>f.plan.ships[0].items.push({name:'unregistered'})]){const f=fixture(true);mutate(f);assert.equal(f.stop(),'');}
 for(const raw of [{available:false},{available:true,coef:1,score:-24},{available:true,coef:2,score:1},{available:true,coef:2,score:45},{available:true,coef:2,score:NaN}]){const f=fixture(true);f.c.hdFEScouting=()=>raw;assert.equal(f.stop(),'');}
 const progress=fixture(true);progress.c.hdFEScouting=()=>({available:true,coef:2,score:40});assert.equal(progress.stop(),'');
});
test('other routes and new mutable mandatory checks are outside this narrow stop',()=>{
 for(const mutate of [f=>f.plan.map='5-3',f=>f.plan.routeIndex=1,f=>f.c.data.path='BEHIJMP',f=>f.c.data.los.coef=3,f=>f.c.data.los.exemptWhen.all[1].rank=20]){const f=fixture();mutate(f);assert.equal(f.stop(),'');}
 const f=fixture(true);f.measure.requiredChecks.push({condition:{kind:'equipmentShips',match:'radar',min:1},ok:false,unresolved:false,ratio:0});assert.equal(f.stop(),'');
 const missing=fixture();missing.measure.requiredChecks.pop();assert.equal(missing.stop(),'');
});
test('saved fixed-input reasons explicitly preserve incomplete status without a purchase verdict',()=>{
 for(const reason of ['five-four-fixed-stock','five-four-fixed-data']){const f=fixture(),html=f.c.hdOCSearchStatusHtml({measure:{complete:false},search:{status:'incomplete',exhaustive:false,examined:50,maxExamined:10000,reasons:[reason]}});assert.match(html,/探索未完了/);assert.match(html,/登録台帳にない推奨装備目標/);assert.match(html,/未充足・未判定を残したまま/);assert.match(html,/購入必須と断定した結果ではありません/);assert.match(html,/網羅性・最適性は保証しません/);}
});
