const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const keys=['harbordesk-custom-fleets-v1','harbordesk-equipment-v1','harbordesk-ship-roster-v1','harbordesk-fleet-calculator-v1','harbordesk-kancolle-sync-v1'];
const advanced=fs.readFileSync(require.resolve('../advanced-tools.js'),'utf8');
const home=fs.readFileSync(require.resolve('../personal-home.js'),'utf8');
function extract(source,name){let start=source.indexOf('function '+name+'(');assert.ok(start>=0);if(source.slice(start-6,start)==='async ')start-=6;const line=source.slice(start,source.indexOf('\n',start));if(line.endsWith('}'))return line;const end=source.indexOf('\n}',start);assert.ok(end>start);return source.slice(start,end+2)}
function setup(kind,empty=false){
 const raw=new Map(empty?[]:keys.map((key,i)=>[key,JSON.stringify({fixture:i,kept:true})]));
 const initial=new Map(raw);let fault=null,writes=0,applied=false;
 const storage={get length(){return raw.size},key(i){return [...raw.keys()][i]??null},getItem(k){return k===fault?null:raw.get(k)??null},setItem(k,v){writes++;raw.set(k,String(v))},removeItem(k){writes++;raw.delete(k)}};
 const c=vm.createContext({localStorage:storage});
 const names=kind==='backup'?['hdCaptureHarborLocalStorage','hdValidateBackupApplied','hdApplyBackupLocalStorage','hdRestoreCapturedLocalStorage','hdApplyBackupTransaction']:['hdPHHarborData','hdPHValidateHarborData','hdPHApplyHarborData','hdPHRestoreTransaction'];
 for(const name of names)vm.runInContext(extract(kind==='backup'?advanced:home,name),c);
 return {c,raw,initial,set fault(k){fault=k},get writes(){return writes},get applied(){return applied},run(){c.apply=()=>{applied=true;throw Error('isolated apply failure before any write')};return vm.runInContext(kind==='backup'?'hdApplyBackupTransaction({},undefined,apply)':'hdPHRestoreTransaction({},undefined,apply)',c)}};
}
for(const kind of ['backup','snapshot'])for(const key of keys)test(`${kind} refuses enumerated null ${key} before rollback can remove original data`,()=>{
 const f=setup(kind);f.fault=key;let code=null;
 try{f.run()}catch(error){code=error.code??null}
 const result={kind,key,blocked:code==='HD_STORAGE_NULL_READ',applied:f.applied,writes:f.writes,allOriginalStrings:[...f.initial].every(([k,v])=>f.raw.get(k)===v)};
 if(process.env.HD_NULL_EVIDENCE_DIR){fs.mkdirSync(process.env.HD_NULL_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.HD_NULL_EVIDENCE_DIR,kind+'-'+key+'.json'),JSON.stringify(result,null,2)+'\n')}
 assert.equal(result.allOriginalStrings,true);assert.equal(result.blocked,true);assert.equal(result.applied,false);assert.equal(result.writes,0);
 f.fault=null;const collect=kind==='backup'?'hdCaptureHarborLocalStorage()':'hdPHHarborData()';
 assert.equal(JSON.stringify(vm.runInContext(collect,f.c)),JSON.stringify(Object.fromEntries(f.initial)));
});
for(const kind of ['backup','snapshot'])test(`${kind} accepts a genuinely empty store and normal string capture`,()=>{
 const empty=setup(kind,true),collect=kind==='backup'?'hdCaptureHarborLocalStorage()':'hdPHHarborData()';
 assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext(collect,empty.c))),{});assert.equal(empty.writes,0);
 const full=setup(kind);assert.equal(JSON.stringify(vm.runInContext(collect,full.c)),JSON.stringify(Object.fromEntries(full.initial)));assert.equal(full.writes,0);
});
test('snapshot capture failure is reported before opening IndexedDB or pruning good snapshots',async()=>{
 const f=setup('snapshot');f.fault=keys[0];let opens=0,reports=0;
 Object.assign(f.c,{hdPHOpenDb(){opens++;throw Error('must not open database')},hdPHReportSnapshotFailure(){reports++}});
 vm.runInContext(extract(home,'hdPHCreateSnapshot'),f.c);
 assert.equal(await vm.runInContext('hdPHCreateSnapshot("isolated")',f.c),false);assert.equal(opens,0);assert.equal(reports,1);assert.equal(f.writes,0);
 const other=Error('unrelated read error');f.c.localStorage.getItem=()=>{throw other};
 await assert.rejects(vm.runInContext('hdPHCreateSnapshot("isolated")',f.c),e=>e===other);assert.equal(reports,1);
});
test('backup null warning does not suppress unrelated errors',()=>{
 const notices=[],c=vm.createContext({window:{hdToast:(...args)=>notices.push(args)}});vm.runInContext(extract(advanced,'hdBackupReadFailure'),c);
 const error=Error('unrelated defect');c.error=error;assert.throws(()=>vm.runInContext('hdBackupReadFailure(error)',c),e=>e===error);
 assert.equal(vm.runInContext('hdBackupReadFailure({code:"HD_STORAGE_NULL_READ"})',c),false);assert.equal(notices.length,1);assert.equal(notices[0][1],'warn');
});
