'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(file,name,c){const s=fs.readFileSync(path.join(root,file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);assert.ok(a>=0);vm.runInContext(s.slice(a,b<0?undefined:b),c);return c[name]}
function context(){const raw=fs.readFileSync(path.join(root,'ship-master-snapshot.js'),'utf8'),snapshot=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,'')),masters=Object.values(snapshot.allShips),c=vm.createContext({window:{},HD_FS_TYPE_ALIASES:{},hdFEFind:()=>({}),hdShipDbMasterRowFor:row=>masters.find(m=>m.name===row.name&&(row.masterId==null||m.id===row.masterId)),hdFESpeedLabel:()=> '高速'});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);c.data=vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['5-4'][0]",c);c.hdFERouteRequirementData=()=>c.data;c.hdFERouteShips=p=>p.ships;c.hdFEGameMatch=()=>({status:'ready'});c.hdFEScouting=()=>({available:true,coef:2,score:45,status:'ready'});c.hdFEAssigned=()=>[];load('fleet-readiness-evaluator.js','hdFEBranchPredicate',c);load('fleet-readiness-evaluator.js','hdFERouteContract',c);load('owned-equipment-planner.js','hdOCShortageGoals',c);return c}
const hull=(ship,type='戦艦',rank=5)=>({ship:{ship,items:[]},type,typeKnown:true,speedInfo:{known:true,rank,base:rank,invalid:[]}});
const fleet=(first,second)=>[first,second,hull('鈴谷改二','航空巡洋艦',10),hull('熊野改二','航空巡洋艦',10),hull('時雨改二','駆逐艦',10),hull('雪風改','駆逐艦',10)];
test('5-4 central D-to-E exposes the original low battleship cap and keeps the existing route inputs',()=>{
 const c=context(),d=c.data,rule=d.conditions.find(x=>x.kind==='slowBattleshipCount');assert.ok(rule);assert.equal(rule.min,0);assert.equal(rule.max,1);assert.match(rule.reason,/D→E/);assert.equal(d.path,'ADEHIJMP');assert.equal(d.los.coef,2);assert.equal(d.los.checks[0].safe,45);assert.equal(d.conditions.find(x=>x.kind==='fleetCount').min,6);assert.equal(d.conditions.find(x=>x.kind==='typeCount'&&x.types.includes('駆逐艦')).min,2);
});
test('source-independent original hull categories count 0, 1 and 2 low battleships',()=>{
 const c=context(),rule={kind:'slowBattleshipCount',min:0,max:1};
 // Literal expectations from the D branch and source hull definitions. Speed
 // rank is deliberately varied independently from the original master stype.
 for(const [names,count] of [[['金剛改二','榛名改二'],0],[['長門改二','金剛改二'],1],[['長門改二','陸奥改二'],2],[['長門改二','伊勢改二'],1],[['Гангут','金剛改二'],0]]){
  for(const rank of [5,10,15,20]){const r=c.hdFEBranchPredicate(rule,names.map(n=>hull(n,'戦艦',rank)));assert.equal(r.count,count);assert.equal(r.status,count<=1?'ready':'missing');}
 }
});
test('two original low battleships cannot satisfy the selected D-to-E condition after speeding up',()=>{
 const c=context();for(const rank of [5,10,15,20]){const r=c.hdFERouteContract({ships:fleet(hull('長門改二','戦艦',rank),hull('陸奥改二','戦艦',rank))});assert.equal(r.status,'missing');const check=r.checks.find(x=>x.condition.kind==='slowBattleshipCount');assert.equal(check.count,2);assert.match(check.detail,/上限1隻/);assert.match(check.detail,/1隻超過/);}
});
test('known mismatch, possible excess and harmless unknown remain distinct',()=>{
 const c=context(),rule={kind:'slowBattleshipCount',min:0,max:1},unknown={...hull('元艦種未登録'),typeKnown:false};assert.equal(c.hdFEBranchPredicate(rule,[hull('長門改二'),unknown]).status,'manual');assert.equal(c.hdFEBranchPredicate(rule,[hull('長門改二'),hull('陸奥改二'),unknown]).status,'missing');assert.equal(c.hdFEBranchPredicate(rule,[unknown]).status,'ready');
 const r=c.hdFERouteContract({ships:fleet(hull('長門改二'),unknown)});assert.equal(r.checks.find(x=>x.condition.kind==='slowBattleshipCount').status,'manual');
});
test('route mismatch is not converted into purchasable equipment',()=>{
 const c=context();assert.equal(c.hdOCShortageGoals({goals:[{kind:'route-requirements',ok:false,unresolved:false}]}).length,0);assert.match(c.data.notes.join(' '),/高速化.*艦種/);assert.match(c.data.notes.join(' '),/装備購入/);
});

test('5-4 submarine exclusion is connected before the original battleship cap',()=>{
 const c=context(),d=c.data,at=d.conditions.findIndex(x=>x.kind==='typeCount'&&x.types.includes('潜水艦'));
 assert.ok(at>=0);assert.deepEqual(Array.from(d.conditions[at].types),['潜水艦','潜水空母']);assert.equal(d.conditions[at].matchPolicy,'exact');assert.equal(d.conditions[at].min,0);assert.equal(d.conditions[at].max,0);
 assert.ok(at<d.conditions.findIndex(x=>x.kind==='slowBattleshipCount'));assert.match(d.conditions[at].reason,/D→E/);assert.match(d.conditions[at].reason,/潜水母艦.*含めない/);
 assert.equal(d.path,'ADEHIJMP');assert.equal(d.conditions.find(x=>x.kind==='slowBattleshipCount').max,1);assert.equal(d.los.coef,2);assert.equal(d.los.checks[0].safe,45);
});
test('5-4 submarine independent hull examples distinguish SS, SSV and tender',()=>{
 const c=context(),rule={kind:'typeCount',types:['潜水艦','潜水空母'],matchPolicy:'exact',min:0,max:0};
 // Literal expectations from the sources' hull definitions, not generated from
 // the route condition. The real master snapshot independently identifies hulls.
 for(const [name,type,stype,count,status] of [['伊168','潜水艦',13,1,'missing'],['伊58改','潜水空母',14,1,'missing'],['大鯨','潜水母艦',20,0,'ready'],['千歳甲','水上機母艦',16,0,'ready'],['鈴谷改二','航空巡洋艦',6,0,'ready']]){
  assert.equal(c.hdShipDbMasterRowFor({name}).stype,stype);const row=hull(name,type),before=JSON.stringify(row),r=c.hdFEBranchPredicate(rule,[row]);assert.equal(r.count,count);assert.equal(r.status,status);assert.equal(JSON.stringify(row),before);
 }
 assert.equal(c.hdFEBranchPredicate(rule,[]).status,'ready');
});
test('5-4 submarine unknown cannot erase a known route mismatch',()=>{
 const c=context(),unknown={...hull('合成・艦情報未登録',''),typeKnown:false},ss=hull('伊168','潜水艦'),normal=fleet(hull('金剛改二'),hull('榛名改二'));
 const check=rows=>c.hdFERouteContract({ships:rows});
 normal[2]=unknown;assert.equal(check(normal).status,'manual');
 normal[3]=ss;const mixed=check(normal),rule=mixed.checks.find(x=>x.condition.kind==='typeCount'&&x.condition.types.includes('潜水艦'));assert.equal(mixed.status,'missing');assert.ok(rule);assert.equal(rule.status,'missing');assert.equal(rule.count,1);assert.equal(rule.excess,1);assert.match(rule.detail,/未判定/);
});
test('5-4 submarine guidance requests fleet review instead of purchasable equipment',()=>{
 const c=context(),text=c.data.notes.join(' ');assert.match(text,/潜水艦.*潜水空母/);assert.match(text,/潜水母艦/);assert.match(text,/装備購入ではなく編成/);assert.match(text,/先にF/);
 const r=c.hdFERouteContract({ships:fleet(hull('金剛改二'),hull('榛名改二'))});assert.equal(r.status,'ready');
 assert.equal(c.hdOCShortageGoals({goals:[{kind:'route-requirements',ok:false,unresolved:false}]}).length,0);
 const preset=vm.runInContext("MAP_PLANS['5-4'].presets[0]",c);assert.match(preset.gear,/潜水艦.*潜水空母/);
});
