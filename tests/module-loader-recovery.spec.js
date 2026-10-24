const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

test.use({ serviceWorkers:'block',...(process.env.CI?{trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}}:{})});
const moduleName = 'quest-progress-extension.js';
const prefix = 'HD_LOADER_TEST ';

// Only the isolated module response gains evaluation markers. The real loader
// prefix is served verbatim; the test never inserts the target module script.
const harness = `<!doctype html><meta charset="utf-8"><body>
<div id="questDatabase"><div id="hdQuestDbList"></div></div>
<script>
window.HD_QUESTS=[{id:'test-progress',cycle:'daily',type:'出撃',name:'test',condition:'test',reward:'test',progress:[['test',5]]}];
window.hdQuestCycle='daily';window.hdQuestType='すべて';window.HD_QUEST_CYCLE_LABEL={};
window.hdQuestEsc=x=>String(x);window.hdQuestResetText=()=>'';
window.hdQuestInChecklist=()=>false;window.hdQuestChecklistButtonText=()=>'';
window.hdRenderQuestDb=()=>{};
window.__moduleStarts=0;window.__moduleEnds=0;
const record=(kind,data={})=>console.info(${JSON.stringify(prefix)}+JSON.stringify({kind,at:performance.now(),...data}));
new MutationObserver(changes=>{for(const change of changes){for(const node of change.addedNodes){
 if(node.tagName==='SCRIPT'&&node.src.includes('${moduleName}')){
  record('script-added',{attempt:node.dataset.hdAttempt,connected:node.isConnected});
  for(const type of ['load','error'])node.addEventListener(type,()=>record('script-'+type,{attempt:node.dataset.hdAttempt,connected:node.isConnected}));
 }
}for(const node of change.removedNodes)if(node.tagName==='SCRIPT'&&node.src.includes('${moduleName}'))record('script-removed',{attempt:node.dataset.hdAttempt,connected:node.isConnected});}}).observe(document.body,{childList:true});
</script><script src="/loader-runtime.js"></script>`;

async function run({ page }, info, scenario) {
  const events = [], errors = [], started = process.hrtime.bigint();
  const mark = (kind, detail = {}) => events.push({ kind, nodeAt:Number(process.hrtime.bigint()-started)/1e6, ...detail });
  page.on('pageerror', error => { errors.push(error.message); mark('pageerror',{name:error.name,message:error.message,stack:error.stack}); });
  page.on('console', message => {
    if(message.text().startsWith(prefix))mark('browser',JSON.parse(message.text().slice(prefix.length)));
    else if(message.type()==='warning')mark('warning',{message:message.text()});
  });
  const source = await fs.readFile(path.join(__dirname,'../update-manager.js'),'utf8');
  const loader = source.slice(0,source.indexOf('function hdInitLoadedModules('));
  const original = await fs.readFile(path.join(__dirname,'../',moduleName),'utf8');
  const moduleSource = `window.__moduleStarts++;console.info(${JSON.stringify(prefix)}+JSON.stringify({kind:'evaluation-start',at:performance.now(),attempt:new URL(document.currentScript.src).searchParams.get('retry')||'0'}));\n`
    + original + `\nwindow.__moduleEnds++;console.info(${JSON.stringify(prefix)}+JSON.stringify({kind:'evaluation-end',at:performance.now()}));`;
  let requests = 0, release = null, releaseTimer = null, released = false;
  const waiting = [];
  const send = (res,body,kind,attempt) => {
    mark(kind,{attempt});res.end(body);
  };
  const server = http.createServer((req,res) => {
    const url = new URL(req.url,'http://localhost');
    if(url.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(harness);}
    res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','no-store');
    if(url.pathname==='/loader-runtime.js')return res.end(loader);
    if(url.pathname!=='/'+moduleName){res.statusCode=404;return res.end();}
    const attempt=Number(url.searchParams.get('retry')||0);requests++;
    mark('request',{attempt});
    res.once('finish',()=>mark('response-finish',{attempt,status:res.statusCode}));
    res.once('close',()=>mark('response-close',{attempt,writableFinished:res.writableFinished}));
    if(scenario==='error-retry'&&attempt===0){res.statusCode=503;return send(res,'','error-response',attempt);}
    if(scenario==='slow'){
      // Fixed artificial release, not a test wait or a product timeout change.
      // Both versions keep the 12s loader timer. First body is sent before retry.
      if(attempt===0){
        res.writeHead(200);res.write(moduleSource.slice(0,1));
        release=()=>{
          released=true;send(res,moduleSource.slice(1),'first-body-release',0);
          for(const pending of waiting)send(pending,moduleSource,'retry-body-release',1);
        };
        releaseTimer=setTimeout(release,13000);
      }else if(released)send(res,moduleSource,'retry-body-release',attempt);
      else waiting.push(res);
      return;
    }
    send(res,moduleSource,'body-send',attempt);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  try{
    await page.goto(origin,{waitUntil:'load'});
    const result=await page.evaluate(async ({moduleName,concurrent})=>{
      const first=hdLoadScript('data-test-quest-module','./'+moduleName);
      const second=concurrent?hdLoadScript('data-test-quest-module','./'+moduleName):first;
      const ok=await first;
      return {samePromise:first===second,ok,
        warningVisible:!!document.getElementById('hdModuleLoadWarning')&&!document.getElementById('hdModuleLoadWarning').hidden,
        samePendingAfterTimeout:ok?null:hdLoadScript('data-test-quest-module','./'+moduleName)===first};
    },{moduleName,concurrent:scenario==='concurrent'});
    mark('public-load-returned',result);
    await expect(page.locator('[data-hd-qp-plus="test-progress"]')).toBeVisible();
    await page.locator('[data-hd-qp-plus="test-progress"]').click();
    const state=await page.evaluate(()=>({starts:window.__moduleStarts,ends:window.__moduleEnds,
      progress:hdQPEntry(HD_QUESTS.find(q=>q.id==='test-progress')).values[0],
      status:HD_MODULE_STATUS['./quest-progress-extension.js'],quests:HD_QUESTS.length}));
    mark('function-state',state);
    expect(state.starts).toBe(1);expect(state.ends).toBe(1);expect(state.progress).toBe(1);
    expect(state.status).toBe('ok');expect(state.quests).toBe(14);expect(result.samePromise).toBe(true);
    expect(errors).toEqual([]);
    expect(result.ok).toBe(scenario!=='slow');
    if(scenario==='slow'){
      expect(result.warningVisible).toBe(true);
      expect(result.samePendingAfterTimeout).toBe(true);
      await expect(page.locator('#hdModuleLoadWarning')).toBeHidden();
    }
    expect(requests).toBe(scenario==='error-retry'?2:1);
  }finally{
    if(releaseTimer)clearTimeout(releaseTimer);
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    const dir=info.outputPath('source');await fs.mkdir(dir,{recursive:true});
    for(const [name,data] of [['update-manager.js',source],['loader-runtime.js',loader],['module-original.js',original],['module-delivered.js',moduleSource],['fixture.html',harness]])await fs.writeFile(path.join(dir,name),data);
    const data={scenario,retry:info.retry,timeout:45000,loaderTimeout:12000,releaseMs:scenario==='slow'?13000:null,
      productLoaderSha256:createHash('sha256').update(loader).digest('hex'),originalModuleSha256:createHash('sha256').update(original).digest('hex'),
      requests,errors,events,note:'Isolated HTTP; real global-const module with prefix/suffix markers and minimal quest dependencies. MutationObserver/listeners observe only this fixture. No post-failure evaluate.'};
    const file=info.outputPath('module-loader-evidence.json');await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
    await info.attach('module-loader-evidence',{path:file,contentType:'application/json'});
  }
}

for(const scenario of ['normal','slow','error-retry','concurrent']){
  test(`real module loader ${scenario}`,async({page},info)=>run({page},info,scenario));
}
