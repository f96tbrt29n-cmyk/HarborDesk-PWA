// Controlled activated SW, exact cache seed and network rejection in a fresh profile.
const {test,expect}=require('@playwright/test');
const {observeReload}=require('./reload-evidence.cjs');
test.use({trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('scripts 44 and 45 distinguish network-first bodies from cached fallback responses',async({page,request},info)=>{
 const retain=observeReload(page,info),base='http://127.0.0.1:4173',paths=['map-strategy-navigator.js?v=580','strategy-goals.js?v=580'];
 const keys=['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1','harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
 const active=()=>page.evaluate(()=>navigator.serviceWorker.controller?.state==='activated'&&navigator.serviceWorker.controller.scriptURL.includes('v=580'));
 try{
  await request.post(base+'/__hd_probe_gate/release');await request.post(base+'/__hd_probe_drop/release');await retain.installNativeEvents({instrumentSW:!!info.project.metadata.swProbe});
  await page.goto(base,{waitUntil:'domcontentloaded'});await expect.poll(active).toBe(true);
  // Only this fresh test profile is seeded. Production SW/cache logic is unchanged.
  await page.evaluate(async paths=>{const c=await caches.open('harbordesk-pwa-v580');await c.addAll(paths);},paths);
  const results=[];
  for(const source of ['network','cache']){
   await expect.poll(active).toBe(true);
   const saved=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys),wall=Date.now();
   await request.post(base+'/__hd_probe_drop/'+(source==='cache'?'arm':'release'));
   retain.mark('controlled-navigation-start');const mark=retain.timeline().at(-1).ms;
   await page.reload({waitUntil:'domcontentloaded'});retain.mark('controlled-domcontentloaded');
   const doc=retain.nativeSummary().at(-1).doc;
   for(const path of paths){
    const url=base+'/'+path;
    await expect.poll(()=>retain.timeline().some(e=>e.ms>=mark&&e.kind==='requestfinished'&&e.url===url)).toBe(true);
    await expect.poll(()=>retain.nativeTimeline().some(e=>e.doc===doc&&e.stage==='script-load'&&e.url===url)).toBe(true);
    if(info.project.metadata.swProbe){
     const stages=()=>retain.nativeTimeline().filter(e=>e.stage==='sw-stage'&&e.sw.url===url&&e.sw.at>=wall);
     await expect.poll(()=>stages().some(e=>e.sw.stage==='handoff-response'&&e.sw.source===source)).toBe(true);
     if(source==='network')await expect.poll(()=>stages().some(e=>e.sw.stage==='cache-put-complete')).toBe(true);
     else{expect(stages().some(e=>e.sw.stage==='network-failed')).toBe(true);expect(stages().some(e=>e.sw.stage==='cache-match-end'&&e.sw.hit)).toBe(true)}
     results.push({source,path,stages:stages()});
    }
   }
   expect(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys)).toEqual(saved);
   results.push({source,native:retain.nativeSummary().at(-1)});
  }
  await info.attach('source-comparison',{body:Buffer.from(JSON.stringify(results,null,2)),contentType:'application/json'});expect(retain.errors()).toEqual([]);
 }catch(e){retain.failure();throw e}finally{try{await retain()}finally{await request.post(base+'/__hd_probe_drop/release')}}
});
