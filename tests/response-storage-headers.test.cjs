const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {EventEmitter}=require('node:events');
const {observeStorageHeaders,LIMIT}=require('./response-storage-headers.cjs');
const {observeReload}=require('./reload-evidence.cjs');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const info=id=>({id,url:'http://user:password@localhost:4173/module.js?token=secret#private',status:200,fromServiceWorker:true});
const clock=()=>{let n=0;return()=>++n;};
const response=value=>({headerValue(name){assert.equal(name,'clear-site-data');return Promise.resolve(value);},
  body(){throw Error('must not read body')},allHeaders(){throw Error('must not collect other headers')}});

test('selected header presence/absence, deduplication, safe origin and distinct lookup times',async()=>{
 const o=observeStorageHeaders({now:clock()});let reads=0;
 const r=response('"storage", "cache", "cookies", "private-secret"');
 const counted={...r,headerValue(name){reads++;return r.headerValue(name)}};
 o.read(counted,'context',info(1));o.read(counted,'page',info(1));o.read(response(null),'page',info(2));
 await flush();const d=o.finish([]),a=d.records[0],b=d.records[1];
 assert.equal(reads,1);assert.deepEqual(a.sources,['context','page']);assert.equal(a.header.presence,'present');
 assert.deepEqual(a.header.directives,['storage','cache','cookies']);assert.equal(a.header.unrecognized,1);
 assert.equal(a.url,'http://localhost:4173/module.js');assert.equal(a.origin,'http://localhost:4173');
 assert.ok(a.responseAt<a.lookupStartedAt&&a.lookupStartedAt<a.lookupCompletedAt);
 assert.equal(b.header.presence,'absent');assert.equal(b.outcome,'obtained');assert.equal(d.limit,512);assert.equal(LIMIT,512);
 for(const value of ['password','token','secret','private'])assert.ok(!JSON.stringify(d).includes(value));
});
test('sync throw and asynchronous rejection are failed retrievals, not absent headers',async()=>{
 const o=observeStorageHeaders({now:clock()});
 assert.doesNotThrow(()=>o.read({headerValue(){throw Object.assign(Error('credentials-secret'),{name:'SecurityError'})}},'page',info(1)));
 o.read({headerValue(){return Promise.reject(Error('credentials-secret'))}},'page',info(2));
 await flush();const d=o.finish([]);assert.deepEqual(d.records.map(r=>r.outcome),['failed','failed']);
 assert.deepEqual(d.records.map(r=>r.errorName),['SecurityError','Error']);assert.ok(d.records.every(r=>r.header===null));
 assert.ok(!JSON.stringify(d).includes('credentials-secret'));assert.equal(d.observerErrors,0);
});
test('unfinished lookup is retained immediately and late settlement cannot rewrite captured history',async()=>{
 const o=observeStorageHeaders({now:clock()});let resolve,reject;
 o.read({headerValue(){return new Promise(r=>{resolve=r})}},'page',info(1));
 o.read({headerValue(){return new Promise((_,r)=>{reject=r})}},'page',info(2));
 const d=o.finish([]),before=JSON.stringify(d);
 assert.ok(d.records.every(r=>r.outcome==='pending-at-capture-end'&&r.lookupCompletedAt===null));
 resolve('"storage"');reject(Error('late rejection'));await flush();assert.equal(JSON.stringify(d),before);
});
test('record limit differs from no response, and absent-response inventory is bounded',async()=>{
 const o=observeStorageHeaders({now:clock(),limit:2});let reads=0;
 const r={headerValue(){reads++;return Promise.resolve(null)}};
 for(let id=1;id<=4;id++)o.read(r,'page',info(id));
 const events=[];
 for(let id=1;id<=140;id++)events.push({kind:'request',id,ms:id,...info(id)});
 for(let id=1;id<=4;id++)events.push({kind:'response',...info(id)});
 events.push({kind:'requestfailed',id:5,ms:141},{kind:'requestfinished',id:6,ms:142});
 await flush();const d=o.finish(events);
 assert.equal(reads,2);assert.equal(d.recorded,2);assert.equal(d.limitedResponseEvents,2);assert.equal(d.responseNotCollectedCount,2);
 assert.equal(d.responseNotObservedCount,136);assert.equal(d.responseNotObserved.length,128);assert.equal(d.responseNotObservedDropped,8);
 assert.deepEqual(d.responseNotObserved.slice(0,3).map(r=>r.requestOutcome),['failed','finished','unfinished-at-capture-end']);
 assert.ok(!JSON.stringify(d).includes('password'));assert.ok(!JSON.stringify(d).includes('secret'));
});
test('malformed/oversized selected values are bounded and never leak arbitrary content',async()=>{
 const o=observeStorageHeaders({now:clock()});
 o.read(response('"storage", "'+ 'private-secret'.repeat(100)+'"'),'page',info(1));
 o.read(response(''),'page',info(2));o.read(response(undefined),'page',info(3));
 await flush();const d=o.finish([]);
 assert.equal(d.records[0].header.truncated,true);assert.deepEqual(d.records[0].header.directives,['storage']);
 assert.ok(d.records[0].header.unrecognized>0);assert.equal(d.records[1].header.presence,'present');
 assert.equal(d.records[2].outcome,'failed');assert.ok(!JSON.stringify(d).includes('private-secret'));
});
function fixture(dir,options={}) {
 const context=new EventEmitter(),page=new EventEmitter(),attachments=[];
 page.context=()=>context;page.mainFrame=()=>null;page.evaluate=()=>{throw Error('no failure-time evaluation')};
 const retain=observeReload(page,{title:'headers failure',outputPath:n=>path.join(dir,n),attach:async(name,value)=>attachments.push({name,value})},options);
 const emit=(id,headerValue)=>{
  const request={url:()=>info(id).url,resourceType:()=> 'script',isNavigationRequest:()=>false,frame:()=>({}),serviceWorker:()=>null};
  page.emit('request',request);
  const r={request:()=>request,url:request.url,status:()=>200,fromServiceWorker:()=>false,headers:()=>({'content-length':'1'}),headerValue};
  context.emit('response',r);page.emit('response',r);
 };
 return {page,context,retain,attachments,emit};
}
test('opt-in failure JSON/attachment retains completed/failed/pending headers without waiting or masking pageerrors',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'storage-headers-'));
 try {
  const {page,context,retain,attachments,emit}=fixture(dir,{storageHeaders:true});
  emit(1,async()=>null);emit(2,async()=>{throw Error('secret failure')});emit(3,()=>new Promise(()=>{}));
  await flush();const original=new Error('original app pageerror');page.emit('pageerror',original);
  retain.failure();await retain();
  const file=path.join(dir,'reload-navigation-evidence.json'),d=JSON.parse(await fs.readFile(file,'utf8'));
  assert.deepEqual(d.storageHeaders.records.map(r=>r.outcome),['obtained','failed','pending-at-capture-end']);
  assert.equal(d.events.filter(e=>e.kind==='pageerror')[0].message,original.message);assert.equal(retain.errors().length,1);
  assert.equal(new Set(d.storageHeaders.records.map(r=>r.id)).size,3);assert.equal(d.storageHeaders.observerErrors,0);
  assert.ok(attachments.some(x=>x.value.path===file));assert.equal(page.eventNames().length,0);assert.equal(context.eventNames().length,0);
  assert.ok(!JSON.stringify(d.storageHeaders).includes('secret'));
 } finally {await fs.rm(dir,{recursive:true});}
});
test('default OFF never starts header retrieval and does not change existing record shape',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'storage-headers-off-'));
 try {
  const {retain,emit}=fixture(dir);emit(1,()=>{throw Error('must stay off')});await retain();
  const d=JSON.parse(await fs.readFile(path.join(dir,'reload-navigation-evidence.json'),'utf8'));
  assert.equal(d.storageHeaders,undefined);assert.equal(d.events.filter(e=>e.kind==='response').length,1);
 }finally{await fs.rm(dir,{recursive:true});}
});
test('only the existing PWA and carrier-night cases opt in, retaining original fixtures and assertions',async()=>{
 const pwa=await fs.readFile(path.join(__dirname,'pwa-cached-reload.spec.js'),'utf8'),night=await fs.readFile(path.join(__dirname,'night-policy-reload.spec.js'),'utf8');
 assert.equal((pwa.match(/storageHeaders:true/g)||[]).length,1);assert.equal((night.match(/storageHeaders:true/g)||[]).length,1);
 assert.match(night,/carrier night CI policy persists[\s\S]*?observeReload\(page,testInfo,\{storageHeaders:true\}\)/);
 assert.match(pwa,/expect\(afterLoad.values\).toEqual\(snapshot.values\)/);assert.match(night,/expect\(afterLoad.values\).toEqual\(saved.values\)/);
 assert.match(night,/expect\(retainReloadEvidence.errors\(\)\).toEqual\(\[\]\)/);
});
