const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { storageProbe, observeStorage, KEYS } = require('./pwa-storage-audit.cjs');
const { EventEmitter } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
function fixture(debugFailure = false, unavailable = false, scriptErrorBoundary = false, doc = 100, options = {}) {
  const records = [], listeners = new Map();
  let getReads = 0, writes = 0, lengthReads = 0, clock = 0;
  const data = new WeakMap();
  class Storage {
    constructor() { data.set(this, new Map()); }
    getItem(key) { if (!data.has(this)) throw new TypeError('receiver'); getReads++; return options.nullKey===key ? null : data.get(this).get(String(key)) ?? null; }
    key(index) { if(options.keyError)throw new TypeError('PRIVATE_KEY_ERROR');return options.keyNullAt===index?null:[...data.get(this).keys()][index]??null; }
    get length() { lengthReads++;if(options.lengthError)throw new Error('PRIVATE_LENGTH_ERROR');return data.get(this).size+(options.lengthChanged&&lengthReads%2===0?1:0); }
    setItem(key,value) { if (!data.has(this)) throw new TypeError('receiver');key=String(key);value=String(value);writes++;data.get(this).set(key,value);Object.defineProperty(this,key,{value,enumerable:true,configurable:true,writable:true}); }
    removeItem(key) { if (!data.has(this)) throw new TypeError('receiver');writes++;data.get(this).delete(String(key));delete this[String(key)]; }
    clear() { if (!data.has(this)) throw new TypeError('receiver');writes++;for(const key of data.get(this).keys())delete this[key];data.get(this).clear(); }
  }
  const localStorage = new Storage(), sessionStorage = new Storage();
  for(const [key,value] of options.seed||[])localStorage.setItem(key,value);
  writes=0;
  const originalGet = Storage.prototype.getItem;
  const window = { localStorage, sessionStorage, addEventListener: (name,fn) => listeners.set(name,fn) }; window.top = window;
  if(unavailable)Object.defineProperty(window,'localStorage',{get(){const error=new Error('private');error.name='SecurityError';throw error}});
  const document = { readyState:'loading', addEventListener:(name,fn)=>listeners.set(name,fn) };
  vm.runInNewContext('('+storageProbe.toString()+')(args)', {
    args:{keys:KEYS,contextId:'fixture-context',pageId:'fixture-page',scriptErrorBoundary,keyPresence:options.keyPresence===true}, window, Storage, document, navigator:{},
    URL, location:{href:'http://localhost:4173/?token=secret#private',origin:'http://localhost:4173'},
    Object:{prototype:{hasOwnProperty:function(key){if(options.ownErrorKey===key)throw new TypeError('PRIVATE_OWN_ERROR');return Object.prototype.hasOwnProperty.call(this,key)}},getOwnPropertyDescriptor:Object.getOwnPropertyDescriptor,defineProperty:Object.defineProperty},
    performance:{timeOrigin:doc,now:()=>options.monotonicClock?++clock:1},console:{debug:text=>{ if(debugFailure)throw Error('diagnostic failure');records.push(JSON.parse(text.slice('__HD_STORAGE_AUDIT__'.length))); }}
  });
  return { localStorage,sessionStorage,Storage,originalGet,records,window,listeners,getReads:()=>getReads,writes:()=>writes,stored:key=>data.get(localStorage).get(key) };
}
test('audit preserves native Storage semantics and never initializes or exposes fixture values', () => {
  const f=fixture(); assert.equal(f.Storage.prototype.getItem,f.originalGet);
  assert.ok(f.records[0].values.every(x=>!x.present));
  assert.equal(f.localStorage.setItem(KEYS[0],'PRIVATE_VALUE'),undefined);
  assert.equal(f.localStorage.getItem(KEYS[0]),'PRIVATE_VALUE');
  const row=f.records.at(-1);assert.equal(row.mutation.method,'setItem');assert.equal(row.values[0].length,13);
  assert.equal(row.url,'http://localhost:4173/');assert.equal(row.contextId,'fixture-context');
  assert.ok(!JSON.stringify(f.records).includes('PRIVATE_VALUE'));assert.ok(!JSON.stringify(f.records).includes('token='));
  const before=f.records.length;f.sessionStorage.setItem(KEYS[0],'session');assert.equal(f.records.length,before);
  assert.throws(()=>f.Storage.prototype.setItem.call({},KEYS[0],'x'),/receiver/);
  let coerced=0;f.localStorage.setItem(KEYS[1],{toString(){coerced++;return 'x'}});assert.equal(coerced,1);
  f.localStorage.removeItem(KEYS[0]);assert.equal(f.localStorage.getItem(KEYS[0]),null);
  f.localStorage.clear();assert.ok(f.records.at(-1).values.every(x=>!x.present));
});
test('snapshot records lifecycle without writes, caps records and bounds comparison hashing', () => {
  const f=fixture();f.localStorage.setItem(KEYS[0],'x'.repeat(70000));
  assert.equal(f.records.at(-1).values[0].truncated,true);
  f.listeners.get('pagehide')();assert.equal(f.records.at(-1).stage,'pagehide');
  for(let i=0;i<300;i++)f.window.__hdStorageAuditSnapshot('test');
  assert.equal(f.records.length,256);assert.equal(f.localStorage.getItem(KEYS[0]).length,70000);
});
test('observer errors do not change successful writes or reads',()=>{
  const f=fixture(true);assert.equal(f.localStorage.setItem(KEYS[0],'kept'),undefined);
  assert.equal(f.localStorage.getItem(KEYS[0]),'kept');
});
test('paired mutation records locate explicit deletion and distinguish native failure from null',()=>{
  const f=fixture();f.window.__hdStorageAuditSnapshot('fixture-start');f.localStorage.setItem(KEYS[0],'kept');
  f.localStorage.removeItem(KEYS[0]);
  const pair=f.records.filter(e=>e.mutation?.method==='removeItem');assert.equal(pair.length,2);
  assert.equal(pair[0].stage,'mutation-before');assert.equal(pair[1].stage,'mutation');assert.equal(pair[0].mutation.id,pair[1].mutation.id);
  assert.equal(pair[0].values[0].present,true);assert.equal(pair[1].values[0].present,false);assert.equal(pair[0].scope,'fixture');
  const error=new Error('PRIVATE_THROW');assert.throws(()=>f.localStorage.setItem(KEYS[0],{toString(){throw error}}),e=>e===error);
  assert.equal(f.records.at(-1).stage,'mutation-failed');assert.equal(f.records.at(-1).mutation.error,'Error');
  assert.ok(!JSON.stringify(f.records).includes('PRIVATE_THROW'));
});
test('earliest storage access exception is recorded without inventing null values or DCL',()=>{
  const f=fixture(false,true);assert.equal(f.records[0].stage,'init');assert.equal(f.records[0].readyState,'loading');
  assert.ok(f.records[0].values.every(x=>x.error==='SecurityError'&&!('present'in x)));assert.equal(f.records[0].currentStorageError,'SecurityError');
});
test('new Storage object and app script load have separate evidence without overwriting either object',()=>{
  const f=fixture();f.localStorage.setItem(KEYS[0],'held');f.window.localStorage=new f.Storage();
  f.listeners.get('load')({target:{tagName:'SCRIPT',src:'http://localhost:4173/app.js?v=580'}});
  const row=f.records.at(-1);assert.equal(row.stage,'app-script-loaded');assert.equal(row.storageIdentitySame,false);
  assert.equal(row.values[0].present,true);assert.equal(row.currentValues[0].present,false);assert.equal(f.localStorage.getItem(KEYS[0]),'held');
});
test('failure retention uses emitted history without evaluating a blocked page or reading storageState',async(t)=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'hd-storage-audit-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));
  const browser=new EventEmitter(),context=new EventEmitter(),page=new EventEmitter();let attached,initArgs;
  context.browser=()=>browser;context.pages=()=>[page];page.context=()=>context;
  page.addInitScript=async(fn,args)=>{initArgs=args};page.evaluate=()=>{throw Error('must not evaluate on failure')};
  context.storageState=()=>{throw Error('must not serialize values')};
  const audit=await observeStorage(page,{project:{},outputPath:name=>path.join(folder,name),attach:async(name,data)=>{attached=JSON.parse(await fs.readFile(data.path,'utf8'))}},{scriptErrorBoundary:true,keyPresence:true});
  page.emit('console',{text:()=> '__HD_STORAGE_AUDIT__'+JSON.stringify({stage:'pagehide',values:[{key:KEYS[0],present:true,length:8,ownProperty:true,enumerated:null}],enumeration:{complete:false,truncated:true}})});
  const storageEvent={keyKind:'target',key:KEYS[0],oldValueIsNull:false,newValueIsNull:true,storageAreaSame:true,url:'http://localhost:4173/'};
  page.emit('console',{text:()=> '__HD_STORAGE_AUDIT__'+JSON.stringify({stage:'storage',storageEvent})});
  page.emit('crash');browser.emit('disconnected');await audit.finish();
  assert.deepEqual(attached.events.map(e=>e.kind),['install','storage','storage','page-crash','browser-disconnected']);
  assert.deepEqual(attached.events[2].storageEvent,storageEvent);
  assert.equal(initArgs.scriptErrorBoundary,true);assert.equal(attached.events[0].scriptErrorBoundary,true);
  assert.equal(initArgs.keyPresence,true);assert.equal(attached.presence.enabled,true);
  assert.equal(attached.events[1].values[0].enumerated,null);assert.equal(attached.events[1].enumeration.truncated,true);
  assert.equal(page.listenerCount('console'),0);assert.equal(browser.listenerCount('disconnected'),0);
});
test('opt-in first script error boundary is read-only, once per document, and distinguishes nonnull from null',()=>{
  assert.equal(fixture().listeners.has('error'),false);
  const f=fixture(false,false,true),error=f.listeners.get('error');
  f.localStorage.setItem(KEYS[0],'PRIVATE_VALUE');
  const before=f.records.length;
  error({target:{tagName:'IMG'}});assert.equal(f.records.length,before);
  const event={target:{tagName:'SCRIPT'},preventDefault(){throw Error('must not cancel')}};
  error(event);const boundary=f.records.at(-1);
  assert.equal(boundary.stage,'first-script-error');assert.equal(boundary.values[0].present,true);
  assert.equal(boundary.values[1].present,false);assert.equal(f.localStorage.getItem(KEYS[0]),'PRIVATE_VALUE');
  assert.equal(f.Storage.prototype.getItem,f.originalGet);assert.equal(boundary.mutation,undefined);
  error(event);assert.equal(f.records.length,before+1);
  assert.ok(!JSON.stringify(boundary).includes('PRIVATE_VALUE'));
  const unavailable=fixture(false,true,true);unavailable.listeners.get('error')(event);
  assert.ok(unavailable.records.at(-1).values.every(x=>x.error==='SecurityError'&&!('present'in x)));
  const failedDelivery=fixture(true,false,true);
  assert.doesNotThrow(()=>failedDelivery.listeners.get('error')(event));
  const newDocument=fixture(false,false,true,101);
  newDocument.listeners.get('error')(event);newDocument.listeners.get('error')(event);
  assert.equal(newDocument.records.filter(x=>x.stage==='first-script-error').length,1);
  assert.equal(newDocument.records.at(-1).doc,101);assert.equal(boundary.doc,100);
});
test('storage event metadata excludes values and outside keys, preserves null distinctions, and adds no Storage reads',()=>{
  const f=fixture(),handler=f.listeners.get('storage');
  const base={key:KEYS[0],oldValue:'PRIVATE_OLD',newValue:null,storageArea:f.localStorage,url:'https://user:password@localhost:4173/from?secret=token#private'};
  const reads=f.getReads(),rows=f.records.length;handler(base);
  assert.equal(f.records.length,rows+1);assert.equal(f.getReads()-reads,KEYS.length);
  let row=f.records.at(-1);assert.equal(row.stage,'storage');assert.equal(row.doc,100);
  assert.deepEqual(row.storageEvent,{observedAt:1,keyKind:'target',key:KEYS[0],oldValueIsNull:false,newValueIsNull:true,storageAreaSame:true,url:'https://localhost:4173/from'});
  handler({...base,key:'PRIVATE_OUTSIDE',oldValue:null,newValue:'PRIVATE_NEW',storageArea:f.sessionStorage});
  row=f.records.at(-1);assert.equal(row.storageEvent.keyKind,'other');assert.equal(row.storageEvent.key,undefined);
  assert.equal(row.storageEvent.oldValueIsNull,true);assert.equal(row.storageEvent.newValueIsNull,false);assert.equal(row.storageEvent.storageAreaSame,false);
  handler({...base,key:null,oldValue:null,newValue:null});row=f.records.at(-1);
  assert.equal(row.storageEvent.keyKind,'null');assert.equal(row.storageEvent.key,undefined);
  assert.equal(row.storageEvent.oldValueIsNull,true);assert.equal(row.storageEvent.newValueIsNull,true);
  assert.ok(!JSON.stringify(f.records).includes('PRIVATE'));assert.ok(!JSON.stringify(f.records).includes('password'));
  assert.ok(!JSON.stringify(f.records).includes('secret='));assert.equal(f.Storage.prototype.getItem,f.originalGet);
  assert.ok(f.records.every(x=>!x.mutation));
  handler({...base,get oldValue(){throw new Error('PRIVATE_EVENT_ERROR')}});
  assert.equal(f.records.at(-1).storageEvent.error,'Error');assert.ok(!JSON.stringify(f.records).includes('PRIVATE_EVENT_ERROR'));
});
test('only PWA cached restart and carrier night reload opt into the single script-error boundary',async()=>{
  const [pwa,night,boundary]=await Promise.all(['pwa-cached-reload.spec.js','night-policy-reload.spec.js','pwa-storage-boundary.spec.js'].map(file=>fs.readFile(path.join(__dirname,file),'utf8')));
  assert.equal((pwa.match(/scriptErrorBoundary:true/g)||[]).length,1);
  assert.equal((night.match(/scriptErrorBoundary:true/g)||[]).length,1);
  assert.match(night,/test\('carrier night CI policy persists and regenerates the mobile loadout',[\s\S]*?observeStorage\(page,testInfo,\{scriptErrorBoundary:true,keyPresence:true\}\)/);
  assert.equal((pwa.match(/keyPresence:true/g)||[]).length,1);assert.equal((night.match(/keyPresence:true/g)||[]).length,1);
  assert.ok(!boundary.includes('scriptErrorBoundary:true'));
});
test('presence metadata distinguishes normal stored and genuinely absent keys without extra value reads or writes',()=>{
  const f=fixture(false,false,false,100,{keyPresence:true,monotonicClock:true,seed:[[KEYS[0],'PRIVATE_STORED'],['PRIVATE_OTHER_KEY','PRIVATE_OTHER_VALUE']]});
  const row=f.records[0],a=row.values[0],b=row.values[1];
  assert.equal(a.present,true);assert.equal(a.ownProperty,true);assert.equal(a.enumerated,true);
  assert.equal(b.present,false);assert.equal(b.ownProperty,false);assert.equal(b.enumerated,false);
  assert.equal(row.enumeration.lengthBefore,2);assert.equal(row.enumeration.lengthAfter,2);assert.equal(row.enumeration.scanned,2);assert.equal(row.enumeration.complete,true);
  assert.equal(f.getReads(),KEYS.length);assert.equal(f.writes(),0);assert.equal(f.stored(KEYS[0]),'PRIVATE_STORED');
  assert.ok(a.readStartedAt<a.readAt&&a.readAt<a.ownStartedAt&&a.ownStartedAt<a.ownReadAt&&a.ownReadAt<row.enumeration.startedAt);
  assert.ok(row.enumeration.lengthBeforeAt<=a.enumerationMatch.at&&a.enumerationMatch.at<=row.enumeration.lengthAfterAt);
  assert.ok(!JSON.stringify(row).includes('PRIVATE'));assert.equal(f.Storage.prototype.getItem,f.originalGet);
  const off=fixture();assert.equal(off.records[0].enumeration,undefined);assert.equal(off.records[0].values[0].ownProperty,undefined);
});
test('own-property exception and a disappearing enumerated index preserve unknown evidence and the original values',()=>{
  const f=fixture(false,false,false,100,{keyPresence:true,ownErrorKey:KEYS[0],keyNullAt:0,seed:[[KEYS[0],'PRIVATE_KEPT']]});
  const row=f.records[0];assert.equal(row.values[0].ownProperty,null);assert.equal(row.values[0].ownError,'TypeError');
  assert.equal(row.values[0].present,true);assert.equal(row.enumeration.changed,true);assert.equal(row.enumeration.complete,false);
  assert.ok(row.values.every(v=>v.enumerated===null));assert.equal(f.stored(KEYS[0]),'PRIVATE_KEPT');assert.equal(f.writes(),0);
  assert.ok(!JSON.stringify(row).includes('PRIVATE'));
});
test('read-only actual-null injection retains own key and enumeration evidence without initializing or restoring',()=>{
  const f=fixture(false,false,false,100,{keyPresence:true,nullKey:KEYS[0],seed:[[KEYS[0],'PRIVATE_KEPT']]});
  const a=f.records[0].values[0];assert.equal(a.present,false);assert.equal(a.ownProperty,true);assert.equal(a.enumerated,true);
  assert.equal(f.stored(KEYS[0]),'PRIVATE_KEPT');assert.equal(f.getReads(),KEYS.length);assert.equal(f.writes(),0);
});
test('enumeration error, scan limit and observed length change are unknown rather than absence',()=>{
  for(const mode of ['keyError','lengthError','lengthChanged','limit']){
    const options={keyPresence:true,seed:[[KEYS[0],'PRIVATE_VALUE']]};
    if(mode==='limit')options.seed.push(...Array.from({length:128},(_,i)=>['PRIVATE_OUTSIDE_'+i,'x']));else options[mode]=true;
    const f=fixture(false,false,false,100,options),row=f.records[0];
    assert.equal(row.enumeration.complete,false);assert.ok(row.values.every(x=>x.enumerated===null));
    assert.equal(row.values[0].ownProperty,true);assert.equal(f.writes(),0);assert.equal(f.getReads(),KEYS.length);
    assert.ok(!JSON.stringify(row).includes('PRIVATE'));
    if(mode==='limit'){assert.equal(row.enumeration.scanned,128);assert.equal(row.enumeration.truncated,true);assert.ok(row.values[0].enumerationMatch);}
    if(mode==='lengthChanged')assert.equal(row.enumeration.changed,true);
    if(mode==='keyError'||mode==='lengthError')assert.ok(row.enumeration.errors.length>0);
  }
});
test('failed presence observation/delivery does not alter native operation results or exceptions',()=>{
  const options={keyPresence:true,keyError:true,seed:[[KEYS[0],'kept']]},f=fixture(false,false,false,100,options);
  assert.equal(f.localStorage.setItem(KEYS[0],'updated'),undefined);assert.equal(f.localStorage.getItem(KEYS[0]),'updated');
  const error=new Error('PRIVATE_NATIVE');assert.throws(()=>f.localStorage.setItem(KEYS[0],{toString(){throw error}}),x=>x===error);
  assert.equal(f.stored(KEYS[0]),'updated');assert.ok(f.records.some(r=>r.stage==='mutation-failed'));
  const bad=fixture(true,false,false,100,{keyPresence:true});assert.doesNotThrow(()=>bad.localStorage.setItem(KEYS[0],'kept'));
  assert.equal(bad.localStorage.getItem(KEYS[0]),'kept');
});
