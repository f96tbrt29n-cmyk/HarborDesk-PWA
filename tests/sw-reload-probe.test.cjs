const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'sw-reload-probe.js'),'utf8');
for(const cached of [false,true])test('private SW probe preserves response and request identity for '+(cached?'cache fallback':'network handoff before cache completion'),async()=>{
 const listeners=new Map(),messages=[];let fetchCalls=0,putDone,clones=0,reads=0;
 const response={status:200,headers:{get:()=> '128'},clone(){clones++;return {...this}},arrayBuffer(){reads++;throw Error('extra body reader')}};
 class Cache {put(){return new Promise(r=>{putDone=r})}}
 const cache=new Cache(),req={url:'http://localhost/map-strategy-navigator.js?v=580&secret=not-retained'};
 const self={location:{origin:'http://localhost'},addEventListener:(type,handler)=>listeners.set(type,handler),fetch:async()=>{fetchCalls++;if(cached)throw Error('controlled rejection');return response},caches:{match:async()=>response}};
 vm.runInNewContext(source,{self,Cache,URL,Date,WeakMap,Promise});
 listeners.get('message')({data:{tag:'hd-reload-buffer',action:'subscribe'},ports:[{postMessage:d=>messages.push(d)}]});
 // Historical minimal composition for observer identity only. Full current SW
 // response/lifetime/rejection contracts live in sw-cache-lifetime.test.cjs.
 self.addEventListener('fetch',e=>e.respondWith(self.fetch(e.request).then(r=>{cache.put(e.request,r.clone());return r}).catch(()=>self.caches.match(e.request))));
 let delivered;listeners.get('fetch')({request:req,respondWith:p=>{delivered=p}});
 assert.equal(await delivered,response);assert.equal(fetchCalls,1);assert.equal(reads,0);assert.equal(clones,cached?0:1);
 const handoff=messages.find(x=>x.stage==='handoff-response');assert.equal(handoff.source,cached?'cache':'network');assert.equal(new Set(messages.map(x=>x.id)).size,1);
 assert.ok(!JSON.stringify(messages).includes('not-retained'));
 if(cached){assert.ok(messages.some(x=>x.stage==='network-failed'));assert.ok(messages.some(x=>x.stage==='cache-match-end'&&x.hit));assert.ok(!messages.some(x=>x.stage==='cache-put-start'))}
 else{assert.ok(!messages.some(x=>x.stage==='cache-put-complete'));putDone();await new Promise(r=>setImmediate(r));assert.ok(messages.some(x=>x.stage==='cache-put-complete'))}
});
