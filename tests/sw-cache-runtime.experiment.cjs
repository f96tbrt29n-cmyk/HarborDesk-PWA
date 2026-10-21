// Real worker + Cache API, isolated origin and synthetic shell. Not user storage.
const { test, expect } = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
test.use({serviceWorkers:'allow',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
test('real SW keeps online responses and cached GET/navigation fallback through an origin outage',async({page},info)=>{
  const root=path.resolve(__dirname,'..'),source=await fs.readFile(info.project.metadata?.swSource || path.join(root,'sw.js'));
  const cacheName=/const CACHE='([^']+)'/.exec(source.toString())[1];
  const shell='<!doctype html><title>Isolated SW contract</title><main id="contract">network shell</main>';
  const body='network-script-fixture',requests=[],errors=[];let outage=false;
  page.on('pageerror',error=>errors.push(error.message));
  const server=http.createServer(async(req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    requests.push({path:pathname,outage});
    if(outage){res.destroy();return;}
    if(pathname==='/'||pathname==='/index.html'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'}).end(shell);return;}
    if(pathname==='/first.js'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'}).end(body);return;}
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    try {
      const data=pathname==='/sw.js'?source:await fs.readFile(file);
      const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json'};
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const cached=key=>page.evaluate(async({cacheName,key})=>{const r=await (await caches.open(cacheName)).match(key);return r?await r.text():null},{cacheName,key});
  const result={sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),cacheName,origin};
  try {
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready});
    await expect.poll(()=>page.evaluate(()=>navigator.serviceWorker.controller?.state)).toBe('activated');
    // Seed only this private cache so network-first success cannot pass by stale fallback.
    await page.evaluate(async cacheName=>(await caches.open(cacheName)).put('./index.html',new Response('stale-shell')) ,cacheName);
    await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#contract')).toHaveText('network shell');
    await expect.poll(()=>cached('./index.html')).toBe(shell);
    const online=await page.evaluate(async()=>{const r=await fetch('/first.js?v=1');return {status:r.status,text:await r.text()}});
    expect(online).toEqual({status:200,text:body});await expect.poll(()=>cached('/first.js?v=1')).toBe(body);
    result.online=online;outage=true;
    const fallback=await page.evaluate(async()=>{const r=await fetch('/first.js?v=2');return {status:r.status,text:await r.text()}});
    expect(fallback).toEqual(online);result.fallback=fallback;
    await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#contract')).toHaveText('network shell');
    expect(await page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    result.navigationFallback=true;result.browserOnline=await page.evaluate(()=>navigator.onLine);
    expect(requests.some(r=>r.outage&&r.path==='/first.js')).toBe(true);
    expect(requests.some(r=>r.outage&&r.path==='/')).toBe(true);expect(errors).toEqual([]);
  } finally {
    const file=info.outputPath('sw-cache-runtime-result.json');await fs.writeFile(file,JSON.stringify({...result,requests,errors},null,2));
    await info.attach('sw-cache-runtime-result',{path:file,contentType:'application/json'});
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  }
});
