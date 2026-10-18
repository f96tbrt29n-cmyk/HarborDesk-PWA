const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { observeReload } = require('./reload-evidence.cjs');
test('reload evidence survives navigation and retains failure without evaluating a blocked page', async () => {
  const context = new EventEmitter(), page = new EventEmitter(), frame = { url: () => 'http://localhost/#home' }, attachments = [];
  page.mainFrame = () => frame;
  page.context = () => context;
  page.evaluate = () => { throw new Error('must not evaluate'); };
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'reload-evidence-'));
  const retain = observeReload(page, { title: 'first attempt', outputPath: name => path.join(dir, name), attach: async (name, data) => attachments.push({ name, ...data }) });
  retain.mark('reload-start');
  page.emit('framenavigated', frame);
  page.emit('response', { url: () => 'http://localhost/index.html', status: () => 200, fromServiceWorker: () => true });
  page.emit('requestfailed', { url: () => 'http://localhost/module.js', failure: () => ({ errorText: 'cancelled' }) });
  page.emit('pageerror', new Error('duplicate declaration'));
  context.emit('request', { url: () => 'https://api.github.com/repos/Tibowl/api_start2/commits/master', resourceType: () => 'fetch' });
  context.emit('response', { url: () => 'https://api.github.com/repos/Tibowl/api_start2/commits/master', status: () => 503, fromServiceWorker: () => false, headers: () => ({ 'access-control-allow-origin': '*' }) });
  context.emit('request', { url: () => 'https://unrelated.test/', resourceType: () => 'fetch' });
  await retain();
  const evidence = JSON.parse(await fs.readFile(attachments[0].path, 'utf8'));
  assert.equal(evidence.test, 'first attempt');
  assert.deepEqual(evidence.events.map(x => x.kind), ['phase', 'navigation', 'response', 'requestfailed', 'pageerror', 'context-request', 'context-response', 'capture-end']);
  assert.equal(evidence.events[2].fromServiceWorker, true);
  assert.equal(evidence.events[3].failure.errorText, 'cancelled');
  assert.equal(evidence.events[4].message, 'duplicate declaration');
  assert.equal(evidence.events[0].phase, 'reload-start');
  assert.match(evidence.events[4].stack, /duplicate declaration/);
  assert.equal(retain.errors().length, 1);
  assert.equal(evidence.events[6].allowOrigin, '*');
  assert.equal(evidence.events[6].status, 503);
  assert.equal(page.eventNames().length, 0);
  assert.equal(context.eventNames().length, 0);
  await fs.rm(dir, { recursive: true });
});

test('finished requests retain identity, timing and sizes without retaining URL credentials', async () => {
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'reload-finished-'));
 page.context=()=>context;page.mainFrame=()=>null;
 const retain=observeReload(page,{title:'body completion',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 const request={url:()=> 'http://user:password@localhost/training-planner.js?v=580&token=secret',resourceType:()=> 'script',isNavigationRequest:()=>false,frame:()=>({}),serviceWorker:()=>null,timing:()=>({responseEnd:12}),sizes:async()=>({responseBodySize:321,responseHeadersSize:100,requestBodySize:0,requestHeadersSize:50})};
 retain.mark('reload-start');page.emit('request',request);context.emit('request',request);
 page.emit('response',{request:()=>request,url:request.url,status:()=>200,fromServiceWorker:()=>true,headers:()=>({'content-length':'321'})});
 page.emit('requestfinished',request);context.emit('requestfinished',request);
 await new Promise(resolve=>setImmediate(resolve));await retain();
 const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));
 assert.equal(new Set(d.events.filter(x=>x.id).map(x=>x.id)).size,1);
 assert.equal(d.events.find(x=>x.kind==='requestfinished').timing.responseEnd,12);
 assert.equal(d.events.find(x=>x.kind==='requestfinished-sizes').sizes.responseBodySize,321);
 assert.equal(d.events.find(x=>x.kind==='response').contentLength,'321');
 assert.equal(d.events.find(x=>x.kind==='request').url,'http://localhost/training-planner.js?v=580');
 assert.ok(!JSON.stringify(d).includes('password'));assert.ok(!JSON.stringify(d).includes('secret'));
 await fs.rm(dir,{recursive:true});
});

test('artifact retention does not await unfinished size collection',async()=>{
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'reload-pending-'));
 page.context=()=>context;
 const retain=observeReload(page,{title:'pending body',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 const r={url:()=> 'http://localhost/training-planner.js',timing:()=>({responseEnd:-1}),sizes:()=>new Promise(()=>{})};
 retain.mark('reload-start');page.emit('requestfinished',r);await retain();
 const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));
 assert.ok(d.events.some(x=>x.kind==='requestfinished'));assert.equal(typeof d.startedAt,'number');
 await fs.rm(dir,{recursive:true});
});

test('native loading and SW detail is retained on a stopped reload, with a bounded buffer',async()=>{
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'reload-native-'));
 page.context=()=>context;
 const retain=observeReload(page,{title:'stopped native document',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 retain.mark('reload-start');
 for(let i=0;i<1100;i++)page.emit('console',{text:()=> '__HD_RELOAD_NATIVE__'+JSON.stringify({stage:'script-load',doc:1000,at:i,readyState:'loading',lastScript:'http://localhost/training-planner.js?v=580&secret=private',controller:{url:'http://localhost/sw.js?v=580',state:'activated'},authorization:'never retain'})});
 retain.failure();await retain();const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));
 assert.equal(d.nativeDetailsReason,'reload-wait-failure');assert.equal(d.nativeSummary[0].readyState,'loading');assert.equal(d.nativeSummary[0].scriptLoads,1100);
 assert.equal(d.nativeEvents.length,1024);assert.equal(d.nativeDropped,76);assert.ok(!JSON.stringify(d).includes('private'));assert.ok(!JSON.stringify(d).includes('never retain'));
 assert.equal(d.events.at(-1).kind,'capture-end');await fs.rm(dir,{recursive:true});
});
test('a failure after DCL keeps native summary and does not expose stopped-SW detail',async()=>{
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'reload-native-ready-'));
 page.context=()=>context;const retain=observeReload(page,{title:'communication after restoration',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 retain.mark('reload-start');page.emit('console',{text:()=> '__HD_RELOAD_NATIVE__'+JSON.stringify({stage:'native-dcl',doc:1,at:5,readyState:'interactive'})});retain.mark('reload-domcontentloaded');retain.failure();await retain();
 const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));assert.equal(d.nativeSummary[0].dclAt,5);assert.equal(d.nativeDetailsReason,'summary-only');assert.deepEqual(d.nativeEvents,[]);await fs.rm(dir,{recursive:true});
});

test('native DCL can be distinguished from a still-pending Playwright reload waiter',async()=>{
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'reload-native-dcl-'));
 page.context=()=>context;const retain=observeReload(page,{title:'native DCL before waiter failure',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 retain.mark('reload-start');page.emit('console',{text:()=> '__HD_RELOAD_NATIVE__'+JSON.stringify({stage:'native-dcl',doc:1,at:5,readyState:'interactive'})});retain.failure();await retain();
 const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));assert.equal(d.nativeDetailsReason,'reload-wait-failure');assert.equal(d.nativeSummary[0].readyState,'interactive');assert.equal(d.nativeEvents[0].stage,'native-dcl');await fs.rm(dir,{recursive:true});
});
