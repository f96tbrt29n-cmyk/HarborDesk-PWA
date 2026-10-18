const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { reloadNativeProbe } = require('./reload-native-probe.cjs');

test('passive native probe leaves registration untouched and records loading state without extra fetch', async () => {
  const listeners = new Map(), records = [], cleared = [];
  const target = prefix => ({ addEventListener: (name, fn) => listeners.set(prefix + name, fn) });
  const active = { ...target('worker:'), scriptURL: 'http://localhost/sw.js?v=580', state: 'activated' };
  const reg = { ...target('reg:'), scope: 'http://localhost/', active, waiting: null, installing: null };
  const originalPromise = Promise.resolve(reg), calls = [];
  const sw = { ...target('sw:'), controller: active, getRegistration: () => Promise.resolve(reg), register: function(...args) { calls.push({ receiver: this, args }); return originalPromise; } };
  const document = { ...target('document:'), readyState: 'loading' };
  const nativeRegister = sw.register;
  let watchdog;
  vm.runInNewContext('(' + reloadNativeProbe.toString() + ')({instrumentSW:false})', {
    URL, location: { href: 'http://localhost/' }, performance: { timeOrigin: 1000, now: () => 1 },
    navigator: { serviceWorker: sw }, document, window: target('window:'),
    console: { debug: text => records.push(JSON.parse(text.slice('__HD_RELOAD_NATIVE__'.length))) },
    setTimeout: (fn, ms) => { assert.equal(ms, 30000); watchdog = fn; return 1; }, clearTimeout: id => cleared.push(id),
    fetch: () => { throw new Error('probe must not fetch'); },
  });
  assert.equal(sw.register, nativeRegister);
  assert.equal(sw.register('./sw.js'), originalPromise);
  assert.equal(calls[0].receiver, sw); assert.deepEqual(calls[0].args, ['./sw.js']);
  await new Promise(resolve => setImmediate(resolve));
  listeners.get('document:load')({ target: { tagName: 'SCRIPT', src: 'http://localhost/training-planner.js?v=580' } });
  assert.equal(records.at(-1).stage, 'script-load');
  assert.equal(records.at(-1).readyState, 'loading');
  watchdog(); await new Promise(resolve => setImmediate(resolve));
  assert.ok(records.some(x => x.stage === 'registration-stalled' && x.registration.active.state === 'activated'));
  document.readyState = 'interactive'; listeners.get('document:DOMContentLoaded')();
  assert.deepEqual(cleared, [1]); assert.equal(records.at(-1).stage, 'native-dcl');
  const count = records.length; watchdog(); assert.equal(records.length, count);
});

test('resource completion is bounded and redacted, separate from script load and DCL', () => {
 const listeners=new Map(),records=[];let callback,queued=[],options,bufferMutations=0;
 const target=p=>({addEventListener:(name,fn)=>listeners.set(p+name,fn)});
 class Observer {
  constructor(fn){callback=fn}
  observe(value){options=value}
  takeRecords(){const value=queued;queued=[];return value}
 }
 const document={...target('document:'),readyState:'loading'};
 vm.runInNewContext('('+reloadNativeProbe.toString()+')()',{
  URL,location:{href:'http://localhost/'},navigator:{},document,window:target('window:'),PerformanceObserver:Observer,
  performance:{...target('performance:'),timeOrigin:1000,now:()=>30,setResourceTimingBufferSize:()=>bufferMutations++,clearResourceTimings:()=>bufferMutations++},
  console:{debug:text=>records.push(JSON.parse(text.slice('__HD_RELOAD_NATIVE__'.length)))},setTimeout:()=>1,clearTimeout:()=>{},
  fetch:()=>{throw Error('no network')},
 });
 assert.equal(options.type,'resource');assert.equal(options.buffered,true);
 const entry={name:'http://user:password@localhost/map-strategy-navigator.js?v=580&token=secret',entryType:'resource',initiatorType:'script',responseEnd:25,responseStart:10,transferSize:0,decodedBodySize:100};
 callback({getEntries:()=>[entry,{...entry,name:'https://other.test/secret.js'},{...entry,name:'http://localhost/private.json'}]});
 const completed=records.filter(x=>x.stage==='resource-complete');assert.equal(completed.length,1);assert.equal(completed[0].url,'http://localhost/map-strategy-navigator.js?v=580');assert.equal(completed[0].timing.responseEnd,25);assert.equal(completed[0].timing.transferSize,0);
 assert.ok(!records.some(x=>['script-load','native-dcl','script-error'].includes(x.stage)));
 // Buffered completion is drained without waiting for or inventing an unfinished entry.
 queued=[{...entry,name:'http://localhost/strategy-goals.js?v=580'}];document.readyState='interactive';listeners.get('document:DOMContentLoaded')();
 assert.equal(records.filter(x=>x.stage==='resource-complete').length,2);assert.equal(records.at(-1).stage,'native-dcl');
 callback({getEntries:()=>Array.from({length:130},(_,i)=>({...entry,name:'http://localhost/script'+i+'.js'}))});
 listeners.get('performance:resourcetimingbufferfull')();listeners.get('document:DOMContentLoaded')();
 assert.equal(records.filter(x=>x.stage==='resource-complete').length,128);const last=records.filter(x=>x.stage==='resource-summary').at(-1);assert.equal(last.resourceDropped,4);assert.equal(last.resourceBufferFull,1);
 assert.equal(bufferMutations,0);assert.ok(!JSON.stringify(records).includes('password'));assert.ok(!JSON.stringify(records).includes('secret'));
});
