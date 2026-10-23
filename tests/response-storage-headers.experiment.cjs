// Isolated API wiring check only. No app/SW/Storage writes or deletion directive.
const {test,expect}=require('@playwright/test');
const http=require('node:http');
const fs=require('node:fs/promises');
const {observeReload}=require('./reload-evidence.cjs');
test('WebKit retains a known no-op Clear-Site-Data response header',async({page},testInfo)=>{
 const requests=[];
 const server=http.createServer((req,res)=>{
  requests.push({url:new URL(req.url,'http://localhost').pathname,at:Date.now()});
  // Unknown directive is deliberately harmless; never send storage/cache/cookies/*.
  res.writeHead(200,{'Content-Type':'text/html','Clear-Site-Data':'"hd-diagnostic-noop"'});
  res.end('<!doctype html><title>header-only fixture</title><p>header-only fixture</p>');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const retain=observeReload(page,testInfo,{storageHeaders:true});
 try {
  await page.goto(`http://127.0.0.1:${server.address().port}/?redacted=query`,{waitUntil:'load'});
  await expect(page.locator('p')).toHaveText('header-only fixture');
  expect(retain.errors()).toEqual([]);
 }catch(error){retain.failure();throw error;}
 finally{try{await retain()}finally{await new Promise(resolve=>server.close(resolve))}}
 const d=JSON.parse(await fs.readFile(testInfo.outputPath('reload-navigation-evidence.json'),'utf8'));
 const row=d.storageHeaders.records.find(r=>r.url.endsWith('/'));
 expect(row.outcome).toBe('obtained');expect(row.header.presence).toBe('present');
 expect(row.header.directives).toEqual([]);expect(row.header.unrecognized).toBe(1);
 expect(d.storageHeaders.observerErrors).toBe(0);
 await fs.writeFile(testInfo.outputPath('header-fixture-result.json'),JSON.stringify({environment:{node:process.version,playwright:require('@playwright/test/package.json').version,browser:page.context().browser().version()},requests,storageHeaders:d.storageHeaders},null,2));
});
