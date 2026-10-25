// Artificial header holds, one run per condition. Not the original natural stop.
const { test, expect } = require('@playwright/test');
const { observeReload } = require('./reload-evidence.cjs');
const { createControlServer } = require('./css-script-control.cjs');
test.use({serviceWorkers:'block',trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
for (const condition of ['css','script']) test('preceding '+condition+' response hold separates transfer from execution',async({page},info)=>{
  const retain = observeReload(page,info), execution = []; let server;
  const onConsole = message => { const text=message.text();if(text.startsWith('__HD_CONTROL_EXEC__'))execution.push(JSON.parse(text.slice('__HD_CONTROL_EXEC__'.length))); };
  page.on('console',onConsole);
  const snapshot = () => JSON.parse(JSON.stringify({native:retain.nativeSummary(),execution,server:server.events,browser:retain.timeline()}));
  const attach = async(name,body)=>info.attach(name,{body:Buffer.from(JSON.stringify(body,null,2)),contentType:'application/json'});
  try {
    server = await createControlServer(condition,e=>retain.mark('fixture:'+e.phase+':'+(e.path||'')));
    await retain.installNativeEvents({parserBoundary:true,parserLoadBoundary:42,parserSingleScript:true});
    const stalled = page.waitForEvent('console',{predicate:m=>m.text().startsWith('__HD_RELOAD_NATIVE__')&&m.text().includes('"stage":"stall-loading"')});
    retain.mark('controlled-navigation-start');await page.goto(server.origin,{waitUntil:'commit'});
    // The existing 30s watchdog is the predeclared release boundary. No new timer.
    await stalled;const held=snapshot();await attach('held-css-script-control',{condition,heldPath:server.heldPath,...held});
    const doc=held.native.at(-1),b=doc.parserBoundaries.find(x=>x.reason==='loading-watchdog');
    expect(doc.readyState).toBe('loading');expect(doc.dclAt).toBeUndefined();expect(execution).toEqual([]);
    expect(b.scriptCount).toBe(1);expect(b.truncated).toBe(false);expect(b.singleScript).toEqual({url:server.origin+'/first.js',type:'',async:false,defer:false,connected:true,loadObserved:false,errorObserved:false});
    expect(held.server.some(e=>e.path===server.heldPath&&e.phase==='response-held')).toBe(true);
    expect(held.server.some(e=>e.path===server.heldPath&&e.phase==='headers-written')).toBe(false);
    retain.mark('controlled-release');server.release();await page.waitForLoadState('domcontentloaded');retain.mark('controlled-domcontentloaded');
    await expect.poll(()=>execution.map(e=>e.script+':'+e.phase)).toEqual(['first:start','first:end','following:start','following:end']);
    await expect.poll(()=>retain.nativeSummary().at(-1).dclAt).toBeGreaterThan(0);
    for(const path of ['/preceding.css','/first.js','/following.js'])await expect.poll(()=>retain.timeline().some(e=>e.kind==='requestfinished'&&e.url===server.origin+path)).toBe(true);
    await expect.poll(()=>retain.nativeSummary().at(-1).resources?.some(e=>e.url===server.origin+'/first.js')).toBe(true);
    expect(retain.errors()).toEqual([]);await attach('released-css-script-control',{condition,...snapshot()});
  } catch(error) { retain.failure();throw error; }
  finally { if(server)server.release();page.off('console',onConsole);try{await retain()}finally{if(server)await server.close()} }
});
