const {test,expect}=require('@playwright/test');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
test.use({serviceWorkers:'block',...(process.env.CI?{trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}}:{})});

for(const moduleName of ['quest-progress-extension.js','fleet-calculator.js']){
test(`late ${moduleName} resumes real application dependants and survives reload once`,async({page,context},info)=>{
  const attr=moduleName==='quest-progress-extension.js'?'data-hd-quest-progress':'data-hd-fleet-calc';
  const root=path.resolve(__dirname,'..'),events=[],errors=[],served=new Map();
  const start=process.hrtime.bigint(),mark=(kind,data={})=>events.push({kind,at:Number(process.hrtime.bigint()-start)/1e6,...data});
  page.on('pageerror',error=>{errors.push(error.message);mark('pageerror',{message:error.message});});
  let moduleRequests=0,patchRequests=0,timer,requestArrived,bodyReleased;
  const requestGate=new Promise(resolve=>{requestArrived=resolve;});
  const bodyGate=new Promise(resolve=>{bodyReleased=resolve;});
  await page.addInitScript(()=>{window.__baseStarts=0;window.__baseEnds=0;});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='127.0.0.1')return route.continue();
    if(route.request().resourceType()==='image')return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});
    return route.fulfill({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},json:{version:'1.0.580',build:580,sha:'0000000000000000000000000000000000000000',tree:[],commit:{committer:{date:'2026-10-22T00:00:00Z'}}}});
  });
  const server=http.createServer(async(req,res)=>{
    const name=new URL(req.url,'http://localhost').pathname;
    const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    try{
      let body=await fs.readFile(file);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json'};
      res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
      if(name==='/fleet-calculator-fix.js')mark('dependant-request',{request:++patchRequests});
      if(name==='/'+moduleName){
        const request=++moduleRequests;mark('module-request',{request});
        res.once('finish',()=>mark('module-response-finished',{request}));
        res.once('close',()=>mark('module-response-closed',{request,writableFinished:res.writableFinished}));
        body=Buffer.from('window.__baseStarts++;\n'+body.toString()+'\nwindow.__baseEnds++;');
        served.set(moduleName,body);
        if(request===1){
          res.writeHead(200);res.write(body.subarray(0,1));
          requestArrived();
          timer=setTimeout(()=>{mark('module-body-release',{request});res.end(body.subarray(1));bodyReleased();},13000);
          return;
        }
      }
      if(['index.html','update-manager.js','fleet-calculator-fix.js'].includes(path.basename(file)))served.set(path.basename(file),body);
      res.end(body);
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/';
  async function check(stage){
    await expect.poll(()=>page.evaluate(()=>Object.values(HD_MODULE_STATUS).filter(v=>v!=='ok').length)).toBe(0);
    await expect(page.locator('#hdWorkspaceNav')).toBeVisible();
    const later=await page.evaluate(({attr,moduleName})=>hdLoadScript(attr,'./'+moduleName),{attr,moduleName});
    expect(later).toBe(true);
    const before=await page.evaluate(()=>{
      window.hdWSShowElement('questDatabase',false);
      hdQuestCycle='daily';hdQuestType='すべて';hdRenderQuestDb();
      return hdQPEntry(HD_QUESTS.find(q=>q.id==='Bd3')).values[0];
    });
    // Use the real visible button and its installed event listener, not hdQPSet.
    await page.locator('#questDatabase [data-hd-qp-plus="Bd3"]').click();
    const result=await page.evaluate(before=>({starts:window.__baseStarts,ends:window.__baseEnds,
        delta:hdQPEntry(HD_QUESTS.find(q=>q.id==='Bd3')).values[0]-before,
        warningVisible:!!document.getElementById('hdModuleLoadWarning')&&!document.getElementById('hdModuleLoadWarning').hidden,
        timeOrigin:performance.timeOrigin,modules:Object.keys(HD_MODULE_STATUS).length}),before);
    mark(stage,result);expect(result.starts).toBe(1);expect(result.ends).toBe(1);expect(result.delta).toBe(1);
    expect(result.warningVisible).toBe(false);expect(errors).toEqual([]);
    if(moduleName==='fleet-calculator.js'){
      await page.evaluate(()=>{hdSelectGuideMap('1-1');hdFEOpenCalculator();});
      await expect(page.locator('#hdFleetCalculator')).toBeVisible();
      const count=await page.evaluate(()=>hdFCState('1-1',hdFCSelection('1-1')).gear.length);
      await page.locator('#hdFleetCalculator [data-hd-fc-add]').click();
      await expect.poll(()=>page.evaluate(()=>hdFCState('1-1',hdFCSelection('1-1')).gear.length)).toBe(count+1);
      mark('calculator-control-used',{stage,gearAdded:1,patchRequests});
      expect(patchRequests).toBe(stage==='recovered'?1:2);
      expect(errors).toEqual([]);
    }
  }
  try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await requestGate;
    const caller=await page.evaluate(async({attr,moduleName})=>{
      const first=hdLoadScript(attr,'./'+moduleName),second=hdLoadScript(attr,'./'+moduleName);
      const ok=await first;
      return {ok,same:first===second,retained:first===hdLoadScript(attr,'./'+moduleName),
        status:HD_MODULE_STATUS['./'+moduleName],
        warningVisible:!!document.getElementById('hdModuleLoadWarning')&&!document.getElementById('hdModuleLoadWarning').hidden};
    },{attr,moduleName});
    mark('bounded-caller-result',caller);
    expect(caller).toEqual({ok:false,same:true,retained:true,status:'error',warningVisible:true});
    if(moduleName==='fleet-calculator.js')expect(patchRequests).toBe(0);
    // Wait for this fixture's predetermined HTTP body release, not a larger
    // product timeout or a fixed test sleep. The total test remains 45 seconds.
    await bodyGate;
    await check('recovered');expect(moduleRequests).toBe(1);
    mark('reload-request');await page.reload({waitUntil:'domcontentloaded'});
    await check('reloaded');expect(moduleRequests).toBe(2);
  }finally{
    if(timer)clearTimeout(timer);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    const file=info.outputPath('real-app-loader.json');await fs.mkdir(path.dirname(file),{recursive:true});
    const sources=[];const sourceDir=info.outputPath('served-source');await fs.mkdir(sourceDir,{recursive:true});
    for(const [name,body] of served){await fs.writeFile(path.join(sourceDir,name),body);sources.push({name,sha256:createHash('sha256').update(body).digest('hex')});}
    await fs.writeFile(file,JSON.stringify({moduleName,events,errors,moduleRequests,patchRequests,sources,retry:info.retry,note:'Raw real HTML/assets/loader; isolated base module body markers and external JSON fixture. No SW or user profile.'},null,2)+'\n');
    await info.attach('real-app-loader',{path:file,contentType:'application/json'});
  }
});
}
