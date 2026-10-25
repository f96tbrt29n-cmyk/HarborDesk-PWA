// One child process per contract: observe real unhandled Promise rejections.
// No catch/then is attached to detached cache updates by this fixture.
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const [sourcePath,route,scenario] = process.argv.slice(2);
const source = fs.readFileSync(sourcePath,'utf8');
const unhandled = [], handledLater = [], warnings = [], calls = [], lifetimes = [];
process.on('unhandledRejection',reason=>unhandled.push({name:reason?.name||'Error',message:String(reason?.message||'')}));
process.on('rejectionHandled',()=>handledLater.push(true));
const tick = () => new Promise(resolve=>setImmediate(resolve));
const failure = label => Object.assign(new Error('controlled '+label),{name:'ControlledCacheError'});
const listeners = new Map(), network = new Response('network-fixture'), cached = new Response('cached-fixture');
let releasePut, stored = false, storedBody, delivered, clones = 0, output, dispatching = true;
const clone = network.clone.bind(network);network.clone=()=>{clones++;return clone()};
const request = {url:'https://isolated.invalid/'+(route==='navigation'?'deep/':'first.js?v=580'),method:scenario==='post'?'POST':'GET',mode:route==='navigation'?'navigate':'cors'};
const cache = {put(key,response) {
  calls.push({stage:'put',key:key===request?'original-request':key,clone:response!==network});
  if(scenario==='put-reject')return Promise.reject(failure('put'));
  return new Promise((resolve,reject)=>{releasePut=()=>response.text().then(body=>{storedBody=body;stored=true;resolve()},reject)});
}};
const caches = {
  open(name) { calls.push({stage:'open',name});return scenario==='open-reject'?Promise.reject(failure('open')):Promise.resolve(cache); },
  match(key,options) {
    calls.push({stage:'match',key:key===request?'original-request':key,options});
    if(scenario==='fallback-reject')return Promise.reject(failure('fallback'));
    if(scenario==='fallback-miss')return Promise.resolve(undefined);
    if(scenario==='root-fallback'&&key==='./index.html')return Promise.resolve(undefined);
    return Promise.resolve(cached);
  }
};
vm.runInNewContext(source,{URL,Promise,self:{addEventListener:(name,fn)=>listeners.set(name,fn)},caches,
  fetch(req,options) { calls.push({stage:'fetch',sameRequest:req===request,options});return scenario.startsWith('network-')||scenario.startsWith('fallback-')||scenario==='root-fallback'?Promise.reject(failure('network')):Promise.resolve(network); },
  console:{warn:(...args)=>warnings.push(args.map(String))}
},{filename:'real-sw.js'});
(async()=>{
  listeners.get('fetch')({request,respondWith:p=>{delivered=p},waitUntil:p=>{calls.push({stage:'waitUntil',duringDispatch:dispatching});lifetimes.push(p)}});
  dispatching = false;
  let response, responseError;
  // This is the simulated browser response consumer, not the cache-update branch.
  try { response=await delivered; } catch(error) { responseError={name:error.name,message:error.message}; }
  const body=response?await response.text():null; // Consume the original promptly.
  await tick();await tick(); // Let genuinely unhandled rejections be reported first.
  let lifetimeSettledBeforeRelease;
  if(scenario==='normal'){
    let settled=false;for(const promise of lifetimes)promise.then(()=>{settled=true});
    await tick();lifetimeSettledBeforeRelease=settled;
  }
  const before={stored,unhandled:[...unhandled],lifetimeCount:lifetimes.length,lifetimeSettledBeforeRelease};
  if(releasePut)releasePut();
  // No rejected background branch is observed early by the fixture.
  const lifetimeResults=await Promise.allSettled(lifetimes);
  await tick();
  output={route,scenario,sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),
    response:response===network?'network':response===cached?'cache':response===undefined?'missing':'other',responseError,
    body,clones,before,stored,storedBody,calls,warnings,unhandled,handledLater,
    lifetimeResults:lifetimeResults.map(x=>x.status)};
  process.stdout.write(JSON.stringify(output)+'\n');
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1});
