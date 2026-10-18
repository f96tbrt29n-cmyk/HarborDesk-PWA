// Artificial single-body hold. This is not the natural CI failure.
const {test,expect}=require('@playwright/test');
const {observeReload}=require('./reload-evidence.cjs');
test.use({trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('withholding script 44 body delays execution of transferred 45 and native DCL',async({page,request},info)=>{
 const retain=observeReload(page,info),base='http://127.0.0.1:4173',target=base+'/map-strategy-navigator.js?v=580',next=base+'/strategy-goals.js?v=580';
 let mark=Infinity,doc;const probe=!!info.project.metadata.swProbe;
 const has=(kind,url)=>retain.timeline().some(e=>e.ms>=mark&&e.kind===kind&&e.url===url);
 const loaded=url=>retain.nativeTimeline().some(e=>e.doc===doc&&e.stage==='script-load'&&e.url===url);
 let wall=0;const stages=()=>retain.nativeTimeline().filter(e=>e.stage==='sw-stage'&&e.sw.url===target&&e.sw.at>=wall).map(e=>e.sw.stage);
 const resources=()=>retain.nativeSummary().find(d=>d.doc===doc)?.resources||[];
 const transfers=async()=>(await request.get(base+'/__hd_probe_gate/transfers')).json();
 try{
  await request.post(base+'/__hd_probe_drop/release');await retain.installNativeEvents({instrumentSW:probe});
  if(probe){await page.goto(base,{waitUntil:'domcontentloaded'});await expect.poll(()=>page.evaluate(()=>navigator.serviceWorker.controller?.state==='activated'&&navigator.serviceWorker.controller.scriptURL.includes('v=580'))).toBe(true)}
  const previousDoc=retain.nativeSummary().at(-1)?.doc,previousTransfer=Math.max(0,...(await transfers()).map(e=>e.id));await request.post(base+'/__hd_probe_gate/arm');
  wall=Date.now();retain.mark('controlled-navigation-start');mark=retain.timeline().at(-1).ms;await page.goto(base,{waitUntil:'commit'});
  await expect.poll(()=>{const d=retain.nativeSummary().at(-1)?.doc;return typeof d==='number'&&d!==previousDoc}).toBe(true);doc=retain.nativeSummary().at(-1).doc;
  await expect.poll(async()=>(await request.get(base+'/__hd_probe_gate/state')).json()).toEqual({headerFlushed:true,partialBytes:1024});
  await expect.poll(()=>has('requestfinished',next)).toBe(true);await expect.poll(()=>loaded(base+'/update-manager.js?v=580')).toBe(true);
  expect(has('requestfinished',target)).toBe(false);expect(loaded(target)).toBe(false);expect(loaded(next)).toBe(false);
  expect(retain.nativeSummary().at(-1).readyState).toBe('loading');expect(retain.nativeSummary().at(-1).dclAt).toBeUndefined();
  expect(retain.nativeSummary().at(-1).resourceObserver).toBe('observing');
  const heldTransfers=(await transfers()).filter(e=>e.id>previousTransfer),heldId=heldTransfers.find(e=>e.stage==='prefix-flushed')?.id;
  expect(heldId).toBeGreaterThan(previousTransfer);expect(heldTransfers.some(e=>e.id===heldId&&e.stage==='copy-returned')).toBe(false);
  if(probe){await expect.poll(()=>['network-headers','handoff-response','cache-put-start'].every(s=>stages().includes(s))).toBe(true);expect(stages()).not.toContain('cache-put-complete')}
  await info.attach('held-44-transferred-45',{body:Buffer.from(JSON.stringify({serverHeaderFlushed:true,partialBytes:1024,browser44Response:has('response',target),request45Finished:has('requestfinished',next),native:retain.nativeSummary(),swStages:stages(),serverTransfers:heldTransfers})),contentType:'application/json'});
  await request.post(base+'/__hd_probe_gate/release');await page.waitForLoadState('domcontentloaded');retain.mark('controlled-domcontentloaded');
  await expect.poll(()=>has('requestfinished',target)&&loaded(target)&&loaded(next)).toBe(true);if(probe)await expect.poll(()=>stages().includes('cache-put-complete')).toBe(true);expect(retain.errors()).toEqual([]);
  await expect.poll(()=>resources().some(e=>e.url===target)).toBe(true);
  await expect.poll(async()=>(await transfers()).some(e=>e.id===heldId&&e.stage==='flush-returned')).toBe(true);
  await info.attach('released-resource-stages',{body:Buffer.from(JSON.stringify({native:retain.nativeSummary(),serverTransfers:(await transfers()).filter(e=>e.id>previousTransfer),swStages:stages()})),contentType:'application/json'});
 }catch(e){retain.failure();throw e}finally{try{await retain()}finally{await request.post(base+'/__hd_probe_gate/release')}}
});
