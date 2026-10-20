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
  const document = { ...target('document:'), readyState: 'loading', get scripts() { throw Error('default probe must not inspect parser DOM'); } };
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


test('opt-in parser boundary distinguishes DOM insertion, load and DCL without probing execution', () => {
 const listeners=new Map(),records=[],timers=[];let now=1;
 const target=p=>({addEventListener:(n,f)=>listeners.set(p+n,f)});
 const node=name=>({tagName:'SCRIPT',src:'http://localhost/'+name+'?v=580&token=secret',isConnected:true,async:false,defer:false,type:''});
 const first=node('quest-database.js'),next=node('expedition-database.js');
 const document={...target('document:'),readyState:'loading',scripts:[first]};
 vm.runInNewContext('('+reloadNativeProbe.toString()+')({parserBoundary:true})',{
  URL,location:{href:'http://localhost/',origin:'http://localhost'},performance:{timeOrigin:1000,now:()=>now++},navigator:{},document,window:target('window:'),
  console:{debug:s=>records.push(JSON.parse(s.slice('__HD_RELOAD_NATIVE__'.length)))},setTimeout:(f,ms)=>{timers.push({f,ms});return 1},clearTimeout:()=>{},
  fetch:()=>{throw Error('no fetch')},MutationObserver:class{constructor(){throw Error('no new observer')}}
 });
 listeners.get('document:load')({target:first});
 const initial=records.find(x=>x.stage==='parser-boundary');
 assert.equal(initial.reason,'script-40-load');assert.equal(initial.scripts[0].loadObserved,true);assert.equal(initial.scripts[1].present,false);
 document.scripts.push(next);timers[0].f();
 const stalled=records.filter(x=>x.stage==='parser-boundary').at(-1);
 assert.equal(stalled.reason,'loading-watchdog');assert.equal(stalled.scripts[1].present,true);assert.equal(stalled.scripts[1].loadObserved,false);
 assert.equal(stalled.scripts[1].ordinal,2);assert.equal(timers.length,1);assert.equal(timers[0].ms,30000);
 listeners.get('document:error')({target:next});document.readyState='interactive';listeners.get('document:DOMContentLoaded')();
 const dcl=records.filter(x=>x.stage==='parser-boundary').at(-1);assert.equal(dcl.reason,'dcl');assert.equal(dcl.scripts[1].errorObserved,true);
 assert.equal(dcl.scripts[1].loadObserved,false);assert.ok(!JSON.stringify(records).includes('secret'));
 assert.ok(!('evaluated' in dcl.scripts[1]));
});

function parserHarness(options, scripts){
 const listeners=new Map(),records=[],timers=[];
 const target=p=>({addEventListener:(n,f)=>listeners.set(p+n,f)});
 const document={...target('document:'),readyState:'loading',scripts};
 vm.runInNewContext('('+reloadNativeProbe.toString()+')('+JSON.stringify(options)+')',{
  URL,location:{href:'http://localhost/',origin:'http://localhost'},performance:{timeOrigin:1000,now:()=>1},navigator:{},document,window:target('window:'),
  console:{debug:s=>records.push(JSON.parse(s.slice('__HD_RELOAD_NATIVE__'.length)))},setTimeout:(f,ms)=>{timers.push({f,ms});return 1},clearTimeout:()=>{},
  fetch:()=>{throw Error('no fetch')},MutationObserver:class{constructor(){throw Error('no observer')}}
 });
 return {document,listeners,records,timers,boundaries:()=>records.filter(r=>r.stage==='parser-boundary')};
}
const parserNode=name=>({tagName:'SCRIPT',src:'http://localhost/'+name+'?v=580&token=secret',isConnected:true,async:false,defer:false,type:''});
test('sole node identity is opt-in and only sampled at the existing loading watchdog',()=>{
 const n=parserNode('different-from-app.js');n.src='http://user:password@localhost/different-from-app.js?v=580&token=secret#private';
 const h=parserHarness({parserBoundary:true,parserSingleScript:true},[n]);
 h.listeners.get('document:load')({target:n});h.timers[0].f();
 const b=h.boundaries()[0];assert.equal(b.reason,'loading-watchdog');assert.equal(b.scriptCount,1);assert.equal(b.truncated,false);
 assert.deepEqual(b.singleScript,{url:'http://localhost/different-from-app.js?v=580',type:'',async:false,defer:false,connected:true,loadObserved:true,errorObserved:false});
 h.document.readyState='interactive';h.listeners.get('document:DOMContentLoaded')();
 assert.equal(h.boundaries()[1].singleScript,undefined);assert.equal(h.timers.length,1);assert.equal(h.timers[0].ms,30000);
 assert.ok(!JSON.stringify(b).includes('secret'));assert.ok(!JSON.stringify(b).includes('password'));
});
test('sole-node metadata does not alter PWA/default, empty or multiple-node snapshots',()=>{
 for(const [options,nodes] of [[{parserBoundary:true},[parserNode('app.js')]],[{parserSingleScript:true},[parserNode('app.js')]],[{parserBoundary:true,parserSingleScript:true},[]],[{parserBoundary:true,parserSingleScript:true},[parserNode('app.js'),parserNode('other.js')]]]){
  const h=parserHarness(options,nodes);h.timers[0].f();assert.ok(h.boundaries().every(b=>!('singleScript' in b)));assert.equal(h.timers.length,1);
 }
 for(const src of ['', 'data:text/javascript,private-body']){
  const n={...parserNode('app.js'),src};const h=parserHarness({parserBoundary:true,parserSingleScript:true},[n]);if(!src)h.listeners.get('document:error')({target:n});h.timers[0].f();
  assert.equal(h.boundaries()[0].singleScript.url,'');assert.equal(h.boundaries()[0].singleScript.errorObserved,!src);assert.ok(!JSON.stringify(h.boundaries()).includes('private-body'));
 }
});
test('carrier boundary selects only 42 and reserves load/watchdog/DCL despite repeated loads',()=>{
 const n40=parserNode('quest-database.js'),n42=parserNode('home-dashboard.js'),n43=parserNode('update-manager.js');
 const h=parserHarness({parserBoundary:true,parserLoadBoundary:42},[n40,n42]);
 h.listeners.get('document:load')({target:n40});assert.equal(h.boundaries().length,0);
 h.listeners.get('document:load')({target:n42});h.listeners.get('document:load')({target:n42});
 assert.equal(h.boundaries().length,1);assert.equal(h.boundaries()[0].reason,'script-42-load');assert.equal(h.boundaries()[0].scripts[3].present,false);
 h.document.scripts.push(n43);h.timers[0].f();h.timers[0].f();
 assert.equal(h.boundaries().length,2);assert.equal(h.boundaries()[1].scripts[3].present,true);assert.equal(h.boundaries()[1].scripts[3].loadObserved,false);
 h.listeners.get('document:error')({target:n43});h.document.readyState='interactive';h.listeners.get('document:DOMContentLoaded')();
 assert.deepEqual(h.boundaries().map(x=>x.reason),['script-42-load','loading-watchdog','dcl']);assert.equal(h.boundaries()[2].scripts[3].errorObserved,true);
 assert.equal(h.timers.length,1);assert.equal(h.timers[0].ms,30000);
});
test('scan and duplicate-position limits preserve unknown rather than absence beyond 128',()=>{
 const nodes=Array.from({length:129},()=>parserNode('unrelated.js'));
 for(let i=0;i<5;i++)nodes[i]=parserNode('quest-database.js');
 const n42=nodes[5]=parserNode('home-dashboard.js');let pastLimitReads=0;
 Object.defineProperty(nodes,128,{get(){pastLimitReads++;return parserNode('update-manager.js')}});
 const h=parserHarness({parserBoundary:true,parserLoadBoundary:42},nodes);h.listeners.get('document:load')({target:n42});
 const b=h.boundaries()[0];assert.equal(b.truncated,true);assert.equal(b.scriptCount,128);assert.equal(pastLimitReads,0);
 assert.equal(b.scripts[3].present,null);assert.equal(b.scripts[3].matchCount,0);
 assert.equal(b.scripts[0].matchCount,5);assert.deepEqual(b.scripts[0].ordinals,[1,2,3,4]);assert.equal(b.scripts[0].matchesTruncated,true);assert.equal(b.scripts[0].ordinal,1);
 assert.ok(!JSON.stringify(b).includes('secret'));assert.ok(!('staticNode' in b.scripts[0]));
});
