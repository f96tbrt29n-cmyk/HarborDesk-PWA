const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../update-manager.js'),'utf8').split('function hdBuildAssetUrl')[0];
for(const scenario of ['normal','external-204-no-cors','external-204-cors','external-503','local-503','both-503','navigation-cancel','external-wrong-cors','both-aborted'])test(scenario,async({page},info)=>{
 const errors=[],requests=[],responses=[];page.on('response',r=>{if(new URL(r.url()).pathname.endsWith('app-version.json'))responses.push({url:new URL(r.url()).origin+new URL(r.url()).pathname,status:r.status(),cors:r.headers()['access-control-allow-origin']||'absent'})});page.on('pageerror',e=>errors.push({message:e.message,stack:e.stack}));
 let release;const gate=new Promise(r=>release=r);let count=0,arrived;const pending=new Promise(r=>arrived=r);
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(!u.pathname.endsWith('app-version.json'))return route.fulfill({contentType:'text/html',body:'<!doctype html><title>isolated version response</title>'});
  const external=u.hostname==='raw.githubusercontent.com';if(scenario==='both-aborted')return route.abort('failed');const failed=scenario==='both-503'||scenario==='external-503'&&external||scenario==='local-503'&&!external;
  const empty=external&&scenario.startsWith('external-204');const headers=external&&scenario==='external-204-no-cors'?{}:{'access-control-allow-origin':external&&scenario==='external-wrong-cors'?'https://invalid.test':'*'};
  requests.push({external,status:empty?204:failed?503:200,cors:headers['access-control-allow-origin']||'absent'});
  if(scenario==='navigation-cancel'){if(++count===2)arrived();await gate;}
  await route.fulfill({status:empty?204:failed?503:200,headers,contentType:'application/json',body:empty?'':JSON.stringify({version:'1.0.580',build:580})}).catch(e=>{if(scenario!=='navigation-cancel')throw e;requests.push({cleanupFailure:e.name});});
 });
 try{
 await page.goto('http://127.0.0.1:4173/__version_control__',{waitUntil:'domcontentloaded'});await page.addScriptTag({content:source});
 let result;
 if(scenario==='navigation-cancel'){
  await page.evaluate(()=>{window.pendingVersion=hdFetchLatestVersion().then(v=>({ok:true,v}),e=>({ok:false,name:e.name}));});await pending;
  await page.reload({waitUntil:'domcontentloaded'});release();result={navigationCompleted:true};
 }else result=await page.evaluate(async()=>{try{return{ok:true,value:await hdFetchLatestVersion()}}catch(e){return{ok:false,name:e.name,message:e.message}}});
 await info.attach('response-control',{body:Buffer.from(JSON.stringify({scenario,requests,responses,errors,result})),contentType:'application/json'});
 if(!scenario.includes('cors')&&scenario!=='navigation-cancel'&&scenario!=='both-aborted')expect(errors).toEqual([]);
 if(['both-503','both-aborted'].includes(scenario))expect(result.ok).toBe(false);else if(scenario!=='navigation-cancel')expect(result.ok).toBe(true);
 }finally{release()}
});
