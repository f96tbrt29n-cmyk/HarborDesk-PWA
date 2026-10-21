// Isolated mechanism comparison, deliberately outside the normal browser list.
const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { initialUpdateFixture } = require('./initial-update-fixture.cjs');
const { observeRegistrationContinuation } = require('./pwa-registration-continuation.cjs');
const { initialUpdateBoundary, openFollowingPage, scopedInfo, retainInitialDocumentResult } = require('./initial-document-fixture.cjs');
test.use({ viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'allow' });

for (const [disposition,suppressInitialUpdate] of [['keep',false],['close',false],['close',true]]) test('B initial document '+disposition+(suppressInitialUpdate?' with initial update suppressed':''), async ({ page, browser }, info) => {
  const root = path.resolve(__dirname,'..'), source = await fs.readFile(path.join(root,'update-manager.js'),'utf8');
  const fixture = initialUpdateFixture(source, suppressInitialUpdate), context = page.context(), contextId = randomUUID();
  const report = { disposition, suppressInitialUpdate, contextId, browser:browser.version(), sources:fixture.sources,
    swSHA256:createHash('sha256').update(await fs.readFile(path.join(root,'sw.js'))).digest('hex'),
    events:[],samples:[],entryResponses:[],droppedEvents:0,droppedSamples:0,droppedEntryResponses:0,
    stage:'initial-preparation',validComparison:false };
  const append = (list,value,drop) => { if (list.length === 64) { list.shift();report[drop]++; } list.push(value); };
  const event = (kind, data={}) => append(report.events,{kind,nodePerformanceMs:performance.now(),...data},'droppedEvents');
  const probes = [], errors = [];
  function observe(target,label) {
    const probe = observeRegistrationContinuation(target,scopedInfo(info,label),{context:contextId,page:label});probes.push(probe);
    target.on('pageerror',error => { errors.push({page:label,name:error.name,message:error.message});event('pageerror',{page:label,name:error.name}); });
    for (const name of ['domcontentloaded','load','close','crash']) target.on(name,()=>event(name,{page:label}));
    target.on('console',message => { if(message.type()==='warning'&&/registration failed/.test(message.text()))event('registration-warning',{page:label}); });
    return probe;
  }
  const initial = observe(page,'initial');
  let phase = 'initial';
  const server = http.createServer(async (req,res) => {
    const requestPhase = phase;initial.serverRequest(req,res);
    const pathname = new URL(req.url,'http://localhost').pathname;
    const file = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    try {
      const synthetic = pathname==='/'||pathname==='/index.html'?fixture.html:pathname==='/route-app-entry.js'?fixture.bare:pathname==='/route-update-entry.js'?(requestPhase==='initial'?fixture.versioned:fixture.reloadedVersioned):null;
      const body = synthetic===null?await fs.readFile(file):Buffer.from(synthetic);
      if(pathname==='/route-update-entry.js')append(report.entryResponses,{nodePerformanceMs:performance.now(),phase:requestPhase,sha256:createHash('sha256').update(body).digest('hex'),stage:'body-prepared'},'droppedEntryResponses');
      const types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.html':'text/html'};
      res.writeHead(200,{'Content-Type':pathname==='/'?'text/html':types[path.extname(pathname)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
    }catch{res.writeHead(404).end();}
  });
  try {
    const port = info.project.metadata?.initialDocumentPort;
    if(!Number.isInteger(port)||port<1024||port>65535)throw Error('isolated fixed origin port required');
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
    report.origin='http://127.0.0.1:'+port;
    event('initial-navigation-request');await page.goto(report.origin,{waitUntil:'domcontentloaded'});
    await expect(page.locator('#registration-fixture')).toBeVisible();
    // Read only the original recorder's Node history, not the native Promise.
    await expect.poll(()=>!!initialUpdateBoundary(initial.timeline(),suppressInitialUpdate),{timeout:12000,message:suppressInitialUpdate?'initial document must reach its explicit update suppression site':'initial document must reach its existing explicit update expression'}).toBe(true);
    report.initialBoundary=initialUpdateBoundary(initial.timeline(),suppressInitialUpdate);event('initial-update-gate');
    phase='reloaded';event('following-source-phase-selected');
    const following=await openFollowingPage(page,disposition,event);
    expect(following.context()).toBe(context);expect(page.isClosed()).toBe(disposition==='close');
    const followingProbe=observe(following,'following');
    report.stage='following-navigation';event('following-navigation-request');
    await following.goto(report.origin,{waitUntil:'domcontentloaded'});
    await expect(following.locator('#registration-fixture')).toBeVisible();
    report.stage='following-registration-wait';
    await expect.poll(async()=>{
      const pending={nodePerformanceMs:performance.now(),outcome:'pending'};append(report.samples,pending,'droppedSamples');
      try {
        const sample=await following.evaluate(()=>({versioned:window.HD_SERVICE_WORKER_STATUS,
          updateControl:typeof __hdUpdateDocumentPhase==='undefined'?null:{phase:__hdUpdateDocumentPhase,suppress:__hdSuppressExplicitUpdate},
          document:{timeOrigin:performance.timeOrigin,at:performance.now(),readyState:document.readyState,url:location.origin+location.pathname}}));
        Object.assign(pending,sample,{receivedNodePerformanceMs:performance.now(),outcome:'value'});
        if(sample.updateControl && (sample.updateControl.phase!=='reloaded'||sample.updateControl.suppress!==false))throw Error('following document executed an unexpected source phase');
        if(sample.document.timeOrigin===report.initialBoundary.document.timeOrigin)throw Error('following document identity is not distinct');
        report.validComparison=sample.updateControl?.phase==='reloaded'&&sample.updateControl.suppress===false;
        return report.validComparison&&['registered','ready'].includes(sample.versioned);
      }catch(error){pending.outcome='evaluate-or-validity-error';throw error;}
    },{timeout:12000,message:'versioned register await must complete in the following new page'}).toBe(true);
    report.stage='following-registered';
    expect(errors).toEqual([]);report.stage='passed';
    report.followingBoundaryCount=followingProbe.timeline().length;
  }catch(error){report.failureStage=report.stage;throw error;}
  finally {
    report.errors=errors;
    // Files/received history only. Never evaluate/storageState after failure.
    try { for(const probe of probes)probe.beginCleanup();server.closeAllConnections();if(server.listening)await new Promise(resolve=>server.close(resolve)); }
    finally { try { await Promise.all(probes.map(probe=>probe.finish())); } finally { await retainInitialDocumentResult(info,report); } }
  }
});
