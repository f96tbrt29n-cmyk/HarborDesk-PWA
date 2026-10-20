const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../fleet-calculator.js'),'utf8').split('\n');
function setup(initialOverride){
 const key='harbordesk-fleet-calculator-v1',initial=initialOverride??JSON.stringify({'2-5:saved':{hqLevel:120,gear:[{name:'零式水上観測機',star:4,slot:9}]}});
 let raw=initial,fault=false,writes=0;
 const error=new Error('isolated storage read unavailable');
 const context=vm.createContext({HD_FC_READ_FAILURES:new WeakSet(),HD_FC_KEY:key,localStorage:{getItem(){if(fault)throw error;return raw},setItem(k,v){assert.equal(k,key);writes++;raw=v}},hdFCDefaultState:()=>({hqLevel:120,gear:[]})});
 for(const name of ['hdFCLoadAll','hdFCSaveAll','hdFCMapKey','hdFCState','hdFCSaveState','hdFCReset'])vm.runInContext(source.find(line=>line.startsWith('function '+name+'(')),context);
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
for(const action of ['hdFCState("1-1","manual")','hdFCSaveState("1-1","manual",{gear:[]})','hdFCReset("2-5","saved")'])test('malformed planner JSON is never overwritten: '+action,()=>{
 const f=setup('{"2-5:saved":');assert.throws(()=>vm.runInContext(action,f.context),e=>e.name==='SyntaxError');assert.equal(f.writes,0);assert.equal(f.raw,f.initial);
});

test('UI handles only classified strict-read errors and never suppresses unrelated defects',()=>{
 const f=setup(),notices=[];Object.assign(f.context,{HD_FC_READ_MESSAGE:'read unavailable',hdToast:(...args)=>notices.push(args)});
 vm.runInContext(source.find(line=>line.startsWith('function hdFCUI(')),f.context);
 f.fault=true;assert.equal(vm.runInContext('hdFCUI(()=>hdFCState("1-1","manual"))',f.context),null);assert.equal(f.raw,f.initial);assert.equal(f.writes,0);assert.equal(notices.length,1);assert.equal(notices[0][1],'warn');
 const error=new Error('unrelated defect');f.context.otherError=error;assert.throws(()=>vm.runInContext('hdFCUI(()=>{throw otherError})',f.context),e=>e===error);assert.equal(notices.length,1);
});
test('read-only diagnostics mark inaccessible storage unknown without saving empty data',()=>{
 const dx=fs.readFileSync(require.resolve('../diagnostics-center.js'),'utf8'),part=dx.slice(dx.indexOf('function hdDXLocalHealth(){'),dx.indexOf('function hdDXReadLocalHealth(){'));
 const c=vm.createContext({hdDXReadLocalHealth(){throw new Error('isolated storage unavailable')}});vm.runInContext(part,c);
 assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('hdDXLocalHealth()',c))),{unavailable:true,keys:null,bytes:null,invalid:null});
 c.hdDXReadLocalHealth=()=>({keys:6,bytes:600,invalid:0});assert.equal(vm.runInContext('hdDXLocalHealth().keys',c),6);
});

test('home health reports inaccessible storage without converting snapshot input into empty data',()=>{
 const home=fs.readFileSync(require.resolve('../personal-home.js'),'utf8'),health=home.split('\n').find(l=>l.startsWith('function hdPHHealth(')),error=new Error('isolated storage read failed');
 const c=vm.createContext({hdPHHarborData(){throw error}});vm.runInContext(health,c);assert.equal(vm.runInContext('hdPHHealth().unavailable',c),true);
 const collector=home.split('\n').find(l=>l.startsWith('function hdPHHarborData('));vm.runInContext(collector,c);c.localStorage={length:1,key:()=> 'harbordesk-fleet-calculator-v1',getItem(){throw error}};assert.throws(()=>vm.runInContext('hdPHHarborData()',c),e=>e===error);
});

test('load-time snapshot rejection is reported rather than left unhandled',async()=>{
 const home=fs.readFileSync(require.resolve('../personal-home.js'),'utf8'),line=home.split('\n').find(l=>l.startsWith("window.addEventListener('load',")&&l.includes('hdPHAutoSnapshot'));
 let onLoad;const error=new Error('isolated snapshot read failure'),reported=[];
 const c=vm.createContext({window:{addEventListener(name,callback){onLoad=callback}},setTimeout:fn=>fn(),hdPHEnsure(){},hdPHInstallBackupHooks(){},hdPHAutoSnapshot:()=>Promise.reject(error),hdPHReportSnapshotFailure:e=>reported.push(e)});
 vm.runInContext(line,c);onLoad();await Promise.resolve();await Promise.resolve();assert.deepEqual(reported,[error]);
});
