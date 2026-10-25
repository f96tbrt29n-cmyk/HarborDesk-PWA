const fs=require('node:fs/promises');
const path=require('node:path');
const meta=require('../app-version.json');
async function syncVersionFixture(page,scenario='normal'){
 const allowed=['normal','external-failure','local-failure','both-failure'];if(!allowed.includes(scenario))throw Error('unknown fixture scenario');
 const events=[],ids=new WeakMap();let next=0;
 const record=(kind,r,extra={})=>{
  const u=new URL(r.url());if(!u.pathname.endsWith('/app-version.json'))return;
  if(!ids.has(r))ids.set(r,++next);
  events.push({kind,id:ids.get(r),at:Date.now(),url:u.origin+u.pathname,...extra});
 };
 const handlers={request:r=>record('request',r),requestfinished:r=>record('finished',r),requestfailed:r=>record('failed',r,{error:r.failure()?.errorText}),response:r=>record('response',r.request(),{status:r.status(),cors:r.headers()['access-control-allow-origin']||'absent',contentType:r.headers()['content-type']||''})};
 for(const [name,fn]of Object.entries(handlers))page.on(name,fn);
 await page.route('**/*',route=>{
  const u=new URL(route.request().url()),local=['127.0.0.1','localhost'].includes(u.hostname);
  if(u.pathname.endsWith('/app-version.json')){
   const failed=scenario==='both-failure'||scenario==='local-failure'&&local||scenario==='external-failure'&&!local;
   return route.fulfill({status:failed?503:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(failed?{error:'isolated fixture unavailable'}:meta)});
  }
  return local?route.continue():route.fulfill({status:204,body:''});
 });
 return async info=>{
  for(const [name,fn]of Object.entries(handlers))page.off(name,fn);
  const target=info.outputPath('sync-version-response.json');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify({scenario,events}));await info.attach('sync-version-response',{path:target,contentType:'application/json'});
 };
}
module.exports={syncVersionFixture};
