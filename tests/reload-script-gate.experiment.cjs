// Controlled body gate, not a reproduction of the natural 45-second failure.
const { test, expect } = require('@playwright/test');
const { observeReload } = require('./reload-evidence.cjs');
test.use({serviceWorkers:'block',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('one withheld synchronous body separates preload transfer from parser completion',async({page,request},info)=>{
 const retain=observeReload(page,info),base='http://127.0.0.1:4173',target=base+'/equipment-catalog-extra4.js?v=580',next=base+'/equipment-catalog-ui-patch.js?v=580';
 const has=(kind,url)=>retain.timeline().some(e=>e.kind===kind&&e.url===url);
 const loaded=url=>retain.nativeTimeline().some(e=>e.stage==='script-load'&&e.url===url);
 try {
  await retain.installNativeEvents();await request.post(base+'/__hd_probe_gate/arm');
  retain.mark('controlled-navigation-start');await page.goto(base,{waitUntil:'commit'});
  await expect.poll(async()=> (await request.get(base+'/__hd_probe_gate/state')).json()).toEqual({headerFlushed:true,partialBytes:1024});
  await expect.poll(()=>has('requestfinished',next)).toBe(true);
  await expect.poll(()=>loaded(base+'/equipment-catalog-extra3.js?v=580')).toBe(true);
  expect(has('requestfinished',target)).toBe(false);
  expect(loaded(target)).toBe(false);expect(loaded(next)).toBe(false);
  expect(retain.nativeSummary().at(-1).readyState).toBe('loading');
  await info.attach('controlled-body-state',{body:Buffer.from(JSON.stringify({serverHeaderFlushed:true,partialBytes:1024,browserResponseObserved:has('response',target),nextTransferFinished:has('requestfinished',next),native:retain.nativeSummary()})),contentType:'application/json'});
  retain.mark('body-withheld-server-flush-and-next-transfer-observed');
  await request.post(base+'/__hd_probe_gate/release');await page.waitForLoadState('domcontentloaded');
  retain.mark('controlled-domcontentloaded');
  await expect.poll(()=>has('response',target)&&has('requestfinished',target)&&loaded(target)&&loaded(next)).toBe(true);
 } catch(error) { retain.failure();throw error; }
 finally { try { await retain(); } finally { await request.post(base+'/__hd_probe_gate/release'); } }
});

test.describe('instrumented SW stalled-body control',()=>{
 test.use({serviceWorkers:'allow'});
 test('stalled body reports native loading and SW handoff before cache-body completion',async({page,request},info)=>{
  const retain=observeReload(page,info),base='http://127.0.0.1:4173',target=base+'/equipment-catalog-extra4.js?v=580';
  const stages=()=>retain.nativeTimeline().filter(x=>x.stage==='sw-stage'&&x.sw.url===target).map(x=>x.sw.stage);
  try{
   await request.post(base+'/__hd_probe_gate/release');await retain.installNativeEvents({instrumentSW:true});
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await expect.poll(()=>{const w=retain.nativeSummary().at(-1)?.controller;return w?.state==='activated'&&w.url.endsWith('/sw.js?v=580')}).toBe(true);
   await request.post(base+'/__hd_probe_gate/arm');
   const stopped=page.waitForEvent('console',{predicate:m=>m.text().startsWith('__HD_RELOAD_NATIVE__')&&m.text().includes('"stage":"stall-loading"')});
   retain.mark('controlled-navigation-start');await page.reload({waitUntil:'commit'});await stopped;
   expect(retain.nativeSummary().at(-1).readyState).toBe('loading');
   expect(retain.timeline().some(x=>x.kind==='requestfinished'&&x.url===target&&x.ms>retain.timeline().findLast(x=>x.phase==='controlled-navigation-start').ms)).toBe(false);
   for(const stage of ['fetch-event','network-start','network-headers','cache-put-start','handoff-response'])expect(stages()).toContain(stage);
   expect(stages()).not.toContain('cache-put-complete');
   await request.post(base+'/__hd_probe_gate/release');await page.waitForLoadState('domcontentloaded');retain.mark('controlled-domcontentloaded');
   await expect.poll(()=>stages().includes('cache-put-complete')).toBe(true);
  }catch(error){retain.failure();throw error}
  finally{try{await retain()}finally{await request.post(base+'/__hd_probe_gate/release')}}
 });
});
