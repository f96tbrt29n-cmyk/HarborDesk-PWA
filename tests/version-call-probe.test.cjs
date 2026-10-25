'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {EventEmitter}=require('node:events');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {versionCallProbe}=require('./version-call-probe.cjs');
const {observeReload}=require('./reload-evidence.cjs');
function realm({complete=false,functions={},throwLog=false}={}){
 const events=[],listeners={},windowListeners={};let tick=0;
 const scope={...functions,performance:{timeOrigin:1000,now:()=>++tick},location:{href:'http://localhost/'},URL,
  document:{readyState:complete?'complete':'loading',addEventListener:(n,f)=>(listeners[n]||=[]).push(f)},
  addEventListener:(n,f)=>(windowListeners[n]||=[]).push(f),console:{debug:text=>{if(throwLog)throw Error('diagnostic delivery failed');events.push(JSON.parse(text.slice('__HD_VERSION_CALL__'.length)))}}};
 scope.window=scope;scope.top=scope;const context=vm.createContext(scope);
 vm.runInContext('('+versionCallProbe.toString()+')('+JSON.stringify({automaticLine:484,explicitLines:[356],externalLine:31,localLine:32})+')',context);
 return {scope,context,events,load:()=>{for(const f of listeners.load||[])f({target:{tagName:'SCRIPT',src:'http://localhost/update-manager.js?v=580&secret=never'}})}};
}
test('all three entry wrappers preserve receiver, arguments and exact return without coercion or then access',()=>{
 for(const api of ['hdCheckForUpdate','hdFetchLatestVersion','hdFetchVersionMeta']){
  let reads=0,calls=0,seen;
  const argument={toString(){reads++;return 'argument'}},returned={get then(){throw Error('must not observe then')}};
  const r=realm({functions:{[api]:function(){calls++;seen={receiver:this,args:[...arguments]};assert.equal(reads,0);return returned}}});
  assert.equal(Reflect.apply(r.scope[api],null,[argument,undefined]),returned);
  assert.equal(seen.receiver,null);assert.equal(seen.args[0],argument);assert.equal(seen.args.length,2);assert.equal(reads,0);assert.equal(calls,1);
  assert.equal(r.events.filter(x=>x.stage==='call').length,1);
 }
});
test('synchronous throw and rejected Promise identity are unchanged, without settlement records',async()=>{
 const error=Error('original throw'),r=realm({functions:{hdCheckForUpdate(){throw error}}});
 assert.throws(()=>r.scope.hdCheckForUpdate(),e=>e===error);
 const promise=Promise.reject(error);r.scope.hdCheckForUpdate=()=>promise;r.load();
 const returned=r.scope.hdCheckForUpdate();assert.equal(returned,promise);await assert.rejects(returned,e=>e===error);
 const calls=r.events.filter(x=>x.stage==='call');assert.deepEqual(calls.map(x=>x.parentId),[0,0]);
 assert.ok(!r.events.some(x=>/resolve|reject|settle/.test(x.stage)));
});
test('source callsites identify automatic and explicit entry and nested external/local calls without argument logging',()=>{
 const r=realm();
 vm.runInContext("function hdFetchVersionMeta(x){return x}\nfunction hdFetchLatestVersion(){return [hdFetchVersionMeta('SECRET-EXTERNAL'),hdFetchVersionMeta('SECRET-LOCAL')]}\nfunction hdCheckForUpdate(){return hdFetchLatestVersion()}",r.context,{filename:'fixture-definitions.js'});
 r.load();
 vm.runInContext('hdCheckForUpdate(false)',r.context,{filename:'http://localhost/update-manager.js?token=never',lineOffset:483});
 vm.runInContext('hdCheckForUpdate(true)',r.context,{filename:'http://localhost/update-manager.js?token=never',lineOffset:355});
 const calls=r.events.filter(e=>e.stage==='call');
 assert.equal(calls.length,8);assert.deepEqual(calls.slice(0,4).map(c=>c.origin),Array(4).fill('automatic-load-timer'));
 assert.deepEqual(calls.slice(4).map(c=>c.origin),Array(4).fill('explicit-update-check'));
 assert.deepEqual(calls.slice(0,4).map(c=>c.parentId),[0,1,2,2]);
 assert.ok(!JSON.stringify(r.events).includes('SECRET'));assert.ok(!JSON.stringify(r.events).includes('never'));
 const role=realm();
 vm.runInContext('function hdFetchVersionMeta(){return 1}',role.context);role.load();
 vm.runInContext('hdFetchVersionMeta({})',role.context,{filename:'http://localhost/update-manager.js',lineOffset:30});
 vm.runInContext('hdFetchVersionMeta({})',role.context,{filename:'http://localhost/update-manager.js',lineOffset:31});
 assert.deepEqual(role.events.filter(e=>e.stage==='call').map(c=>c.role),['external-callsite','local-callsite']);
});
test('new documents and late/missing installation remain distinguishable, and duplicate loads do not stack wrappers',()=>{
 const missing=realm();assert.deepEqual(missing.events.map(e=>e.stage),['init']);
 const late=realm({complete:true,functions:{hdCheckForUpdate:()=>1}});assert.equal(late.events[1].afterWindowLoadOrComplete,true);
 const wrapper=late.scope.hdCheckForUpdate;late.load();assert.equal(late.scope.hdCheckForUpdate,wrapper);
 late.scope.hdCheckForUpdate();assert.equal(late.events.filter(e=>e.stage==='call').length,1);
 assert.equal(late.events[0].doc,1000);assert.equal(late.events[0].timeOrigin,1000);
});
test('diagnostic console failure does not replace the application return or original throw',()=>{
 const error=Error('application'),r=realm({throwLog:true,functions:{hdCheckForUpdate:()=>7,hdFetchLatestVersion(){throw error}}});
 assert.equal(r.scope.hdCheckForUpdate(),7);assert.throws(()=>r.scope.hdFetchLatestVersion(),e=>e===error);
});
test('receiver retains entry records after DCL, exposes per-document drops, and excludes unapproved fields',async()=>{
 const context=new EventEmitter(),page=new EventEmitter(),dir=await fs.mkdtemp(path.join(os.tmpdir(),'version-entry-'));
 page.context=()=>context;page.addInitScript=async()=>{};
 const retain=observeReload(page,{title:'version entries',outputPath:n=>path.join(dir,n),attach:async()=>{}});
 await retain.installVersionCalls();retain.mark('reload-start');retain.mark('reload-domcontentloaded');
 for(let i=0;i<26;i++)page.emit('console',{text:()=> '__HD_VERSION_CALL__'+JSON.stringify({stage:'call',doc:123,timeOrigin:123,at:i,api:'hdFetchVersionMeta',id:i+1,parentId:0,origin:'automatic-load-timer',role:'external-callsite',caller:[{line:31,column:3,secret:'never'}],argument:'never',authorization:'never'})});
 await retain();const data=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));
 assert.equal(data.events.filter(e=>e.kind==='version-entry').length,24);assert.equal(data.versionCalls.dropped,2);
 assert.equal(data.versionCalls.sites.automaticLine,484);assert.ok(!JSON.stringify(data).includes('never'));
 await fs.rm(dir,{recursive:true});
});
