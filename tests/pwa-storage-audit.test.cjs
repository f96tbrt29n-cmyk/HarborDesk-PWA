const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { storageProbe, observeStorage, KEYS } = require('./pwa-storage-audit.cjs');
const { EventEmitter } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
function fixture(debugFailure = false) {
  const records = [], listeners = new Map();
  const data = new WeakMap();
  class Storage {
    constructor() { data.set(this, new Map()); }
    getItem(key) { if (!data.has(this)) throw new TypeError('receiver'); return data.get(this).get(String(key)) ?? null; }
    setItem(key,value) { if (!data.has(this)) throw new TypeError('receiver'); data.get(this).set(String(key),String(value)); }
    removeItem(key) { if (!data.has(this)) throw new TypeError('receiver'); data.get(this).delete(String(key)); }
    clear() { if (!data.has(this)) throw new TypeError('receiver'); data.get(this).clear(); }
  }
  const localStorage = new Storage(), sessionStorage = new Storage();
  const originalGet = Storage.prototype.getItem;
  const window = { localStorage, sessionStorage, addEventListener: (name,fn) => listeners.set(name,fn) }; window.top = window;
  const document = { readyState:'loading', addEventListener:(name,fn)=>listeners.set(name,fn) };
  vm.runInNewContext('('+storageProbe.toString()+')(args)', {
    args:{keys:KEYS,contextId:'fixture-context',pageId:'fixture-page'}, window, Storage, document, navigator:{},
    URL, location:{href:'http://localhost:4173/?token=secret#private',origin:'http://localhost:4173'},
    performance:{timeOrigin:100,now:()=>1},console:{debug:text=>{ if(debugFailure)throw Error('diagnostic failure');records.push(JSON.parse(text.slice('__HD_STORAGE_AUDIT__'.length))); }}
  });
  return { localStorage,sessionStorage,Storage,originalGet,records,window,listeners };
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
test('failure retention uses emitted history without evaluating a blocked page or reading storageState',async(t)=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'hd-storage-audit-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));
  const browser=new EventEmitter(),context=new EventEmitter(),page=new EventEmitter();let attached;
  context.browser=()=>browser;context.pages=()=>[page];page.context=()=>context;
  page.addInitScript=async()=>{};page.evaluate=()=>{throw Error('must not evaluate on failure')};
  context.storageState=()=>{throw Error('must not serialize values')};
  const audit=await observeStorage(page,{project:{},outputPath:name=>path.join(folder,name),attach:async(name,data)=>{attached=JSON.parse(await fs.readFile(data.path,'utf8'))}});
  page.emit('console',{text:()=> '__HD_STORAGE_AUDIT__'+JSON.stringify({stage:'pagehide',values:[{key:KEYS[0],present:true,length:8}]})});
  page.emit('crash');browser.emit('disconnected');await audit.finish();
  assert.deepEqual(attached.events.map(e=>e.kind),['install','storage','page-crash','browser-disconnected']);
  assert.equal(page.listenerCount('console'),0);assert.equal(browser.listenerCount('disconnected'),0);
});
