'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const current=fs.readFileSync(path.join(root,'ship-database.js'),'utf8');
// Compare against the original uncached lookup without historical Git objects:
// Actions uses shallow checkouts, and the contract concerns only this memo.
const cached=' const allowedTypes=hdShipDbSlotAllowedTypes(snap,equipRules);';
assert.equal(current.split(cached).length,2);
const baseline=current.replace(cached," const names=typeof hdShipDbMasterTypeMap==='function'?hdShipDbMasterTypeMap():new Map(),allowedTypes=Object.keys(equipRules).map(id=>names.get(String(id))||'').filter(Boolean);");
const evaluator=fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8');
function fixture(){return {equipment:{a:{typeId:1,typeName:'gun'},duplicate:{typeId:1,typeName:'ignored'},b:{typeId:2,typeName:'torpedo'},zero:{typeId:0,typeName:'ignored'},empty:{typeId:3,typeName:''}},allShips:{1:{id:1,name:'A',ctype:1,stype:1,slots:[1,2]},2:{id:2,name:'B',ctype:2,stype:2,slots:[3]}},shipEquipOverrides:{1:{1:null,2:[7]}},stypeEquipRules:{2:{2:null}}}}
function app(source,withScope=true){
 const c=vm.createContext({window:{HD_KANCOLLE_MASTER_SNAPSHOT:fixture()},HD_SHIP_SLOT_PROFILES:{Legacy:{slots:[5],flags:['legacy']}},__builds:0});
 const start=source.includes('const hdShipDbSlotAllowedTypes=')?source.indexOf('const hdShipDbSlotAllowedTypes='):source.indexOf('function hdShipDbSlotProfile(');
 const profile=source.slice(start,source.indexOf('let hdShipDbMetaAliases=',start));
 const map=source.slice(source.indexOf('function hdShipDbMasterTypeMap('),source.indexOf('function hdShipDbMasterAllowedTypes(')).replace(' const m=new Map();',' __builds++;const m=new Map();');
 const rows=source.slice(source.indexOf('function hdShipDbMasterSnapshot('),source.indexOf('function hdShipDbMasterRoles('));
 const scope=withScope?evaluator.slice(evaluator.indexOf('let hdFEActiveShipLookup='),evaluator.indexOf('function hdFEFindShip(')):'';
 vm.runInContext(scope+profile+rows+map,c);
 return {c,run:code=>vm.runInContext(code,c),value:code=>JSON.parse(JSON.stringify(vm.runInContext(code,c)))};
}
function equalScenario(code){const a=app(baseline),b=app(current);assert.deepEqual(b.value(code),a.value(code));return b}
test('public results match baseline across IDs, unknowns, legacy and mutable fresh profile fields',()=>{
 equalScenario(`hdFEWithShipLookup(()=>[hdShipDbSlotProfile('Legacy'),hdShipDbSlotProfile({masterId:1}),hdShipDbSlotProfile({masterId:2}),hdShipDbSlotProfile({masterId:999})])`);
 const a=app(current);
 assert.equal(a.run(`hdFEWithShipLookup(()=>{const x=hdShipDbSlotProfile({masterId:1}),y=hdShipDbSlotProfile({masterId:1});x.slots.push(99);x.allowedTypes.push('private');x.flags.push('x');return x!==y&&x.slots!==y.slots&&x.allowedTypes!==y.allowedTypes&&y.slots.length===2&&y.allowedTypes.length===2&&y.flags.length===0&&x.equipRules===y.equipRules})`),true);
 assert.equal(a.run('__builds'),1);
});
test('only read-only search steps reuse; outside calls and public Maps stay fresh/mutable',()=>{
 const a=app(current);
 assert.equal(a.run(`hdFEWithShipLookup(()=>{hdShipDbSlotProfile({masterId:1});hdShipDbSlotProfile({masterId:2});return __builds})`),1);
 a.run(`hdShipDbSlotProfile({masterId:1});hdShipDbSlotProfile({masterId:1})`);assert.equal(a.run('__builds'),3);
 assert.equal(a.run(`(()=>{const x=hdShipDbMasterTypeMap(),y=hdShipDbMasterTypeMap();x.clear();return x!==y&&y.get('1')==='gun'&&hdShipDbSlotProfile({masterId:1}).allowedTypes[0]==='gun'})()`),true);
 const withoutEvaluator=app(current,false);assert.equal(withoutEvaluator.run(`hdShipDbSlotProfile({masterId:1}).allowedTypes[0]`),'gun');
});
test('in-place equipment edits, additions, removals and duplicate order are observed on the next step',()=>{
 equalScenario(`(()=>{const values=[];const take=()=>values.push(hdFEWithShipLookup(()=>hdShipDbSlotProfile({masterId:1})));take();window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment.a.typeName='new';take();delete window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment.a;take();window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment.b.typeId=1;take();window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment.first={typeId:2,typeName:'new-two'};take();return values})()`);
});
test('snapshot/equipment identity replacements invalidate even inside a scope',()=>{
 const a=equalScenario(`hdFEWithShipLookup(()=>{const out=[hdShipDbSlotProfile({masterId:1})];const s=window.HD_KANCOLLE_MASTER_SNAPSHOT;s.equipment={x:{typeId:1,typeName:'replaced'}};out.push(hdShipDbSlotProfile({masterId:1}));window.HD_KANCOLLE_MASTER_SNAPSHOT={...s,equipment:{x:{typeId:2,typeName:'snapshot'}}};out.push(hdShipDbSlotProfile({masterId:1}));return out})`);
 assert.equal(a.run('__builds'),3);
});
test('ship rules, rows and explicit DB profile changes are never cached as per-ship results',()=>{
 equalScenario(`hdFEWithShipLookup(()=>{const s=window.HD_KANCOLLE_MASTER_SNAPSHOT,out=[hdShipDbSlotProfile({masterId:1})];s.shipEquipOverrides[1]={2:null};s.allShips[1].slots=[9];out.push(hdShipDbSlotProfile({masterId:1}));HD_SHIP_SLOT_PROFILES.A={slots:[8],flags:['changed']};out.push(hdShipDbSlotProfile('A'));return out})`);
});
test('nesting, throws and Promise return restore the original scope without carrying memo across yields',()=>{
 const a=app(current);
 assert.equal(a.run(`(()=>{const error={};let same=false;try{hdFEWithShipLookup(()=>{hdShipDbSlotProfile({masterId:1});hdFEWithShipLookup(()=>hdShipDbSlotProfile({masterId:2}));throw error})}catch(e){same=e===error}const restored=hdFEActiveShipLookup===null;hdFEWithShipLookup(()=>hdShipDbSlotProfile({masterId:1}));const p=Promise.resolve(1),q=hdFEWithShipLookup(()=>p);return same&&restored&&hdFEActiveShipLookup===null&&p===q&&__builds===3})()`),true);
});
test('substituted type-map factories bypass and invalidate internal memo',()=>{
 equalScenario(`hdFEWithShipLookup(()=>{const s=window.HD_KANCOLLE_MASTER_SNAPSHOT,original=hdShipDbMasterTypeMap,out=[hdShipDbSlotProfile({masterId:1})];let n=0;hdShipDbMasterTypeMap=()=>new Map([['1','custom'+(++n)]]);out.push(hdShipDbSlotProfile({masterId:1}),hdShipDbSlotProfile({masterId:1}));s.equipment.a.typeName='after-custom';hdShipDbMasterTypeMap=original;out.push(hdShipDbSlotProfile({masterId:1}));return out})`);
});
