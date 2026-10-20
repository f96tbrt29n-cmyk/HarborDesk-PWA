const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../fleet-calculator.js'),'utf8').split('\n');
function setup(initialOverride){
 const key='harbordesk-fleet-calculator-v1',initial=initialOverride??JSON.stringify({'2-5:saved':{hqLevel:120,gear:[{name:'零式水上観測機',star:4,slot:9}]}});
 let raw=initial,fault=false,writes=0;
 const error=new Error('isolated storage read unavailable');
 const context=vm.createContext({HD_FC_KEY:key,localStorage:{getItem(){if(fault)throw error;return raw},setItem(k,v){assert.equal(k,key);writes++;raw=v}},hdFCDefaultState:()=>({hqLevel:120,gear:[]})});
 for(const name of ['hdFCLoadAll','hdFCSaveAll','hdFCMapKey','hdFCState','hdFCSaveState'])vm.runInContext(source.find(line=>line.startsWith('function '+name+'(')),context);
 return {context,error,initial,get raw(){return raw},get writes(){return writes},set fault(v){fault=v}};
}
for(const action of ['hdFCState("1-1","manual")','hdFCSaveState("1-1","manual",{gear:[]})'])test('failed read refuses destructive planner write: '+action,()=>{
 const f=setup();f.fault=true;
 assert.throws(()=>vm.runInContext(action,f.context),e=>e===f.error);
 assert.equal(f.raw,f.initial);assert.equal(f.writes,0);
 f.fault=false;assert.equal(vm.runInContext('hdFCLoadAll()["2-5:saved"].gear[0].star',f.context),4);
});
test('successful read-modify-save retains unrelated plans and first-use initialization',()=>{
 const f=setup();vm.runInContext('hdFCState("1-1","manual")',f.context);
 assert.equal(JSON.parse(f.raw)['2-5:saved'].gear[0].star,4);assert.ok(JSON.parse(f.raw)['1-1:manual']);
 vm.runInContext('hdFCSaveState("1-1","manual",{gear:[{name:"test"}]})',f.context);
 assert.equal(JSON.parse(f.raw)['2-5:saved'].hqLevel,120);assert.equal(JSON.parse(f.raw)['1-1:manual'].gear[0].name,'test');
});
test('read-only listing retains its existing fallback without writing on read failure',()=>{
 const f=setup();f.fault=true;assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('hdFCLoadAll()',f.context))),{});
 assert.equal(f.writes,0);assert.equal(f.raw,f.initial);
});
test('malformed planner JSON is never overwritten by write initialization',()=>{
 const f=setup('{"2-5:saved":');assert.throws(()=>vm.runInContext('hdFCState("1-1","manual")',f.context),e=>e.name==='SyntaxError');assert.equal(f.writes,0);assert.equal(f.raw,f.initial);
});
