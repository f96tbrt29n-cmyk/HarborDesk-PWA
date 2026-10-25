const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const source = process.env.HD_SW_CACHE_SOURCE || path.join(__dirname,'../sw.js');
function run(route,scenario) {
  const value=JSON.parse(execFileSync(process.execPath,[path.join(__dirname,'sw-cache-case.cjs'),source,route,scenario],{encoding:'utf8',timeout:10000}));
  if(process.env.HD_SW_CACHE_EVIDENCE_DIR){fs.mkdirSync(process.env.HD_SW_CACHE_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.HD_SW_CACHE_EVIDENCE_DIR,route+'-'+scenario+'.json'),JSON.stringify(value,null,2));}
  return value;
}
for(const route of ['navigation','get']){
  for(const scenario of ['open-reject','put-reject','normal','network-hit','fallback-miss','fallback-reject'])test(route+' '+scenario+' keeps response and explicitly settles cache lifetime',()=>{
    const r=run(route,scenario),isNetworkFailure=scenario.startsWith('network-')||scenario.startsWith('fallback-');
    assert.equal(r.calls.filter(c=>c.stage==='fetch').length,1);
    assert.equal(r.calls.find(c=>c.stage==='fetch').sameRequest,true);assert.deepEqual(r.calls.find(c=>c.stage==='fetch').options,{cache:'no-store'});
    assert.equal(r.response,isNetworkFailure?scenario==='network-hit'?'cache':'missing':'network');
    assert.equal(r.body,isNetworkFailure?scenario==='network-hit'?'cached-fixture':null:'network-fixture');
    assert.deepEqual(r.unhandled,[],'cache failures must not leak an unhandled rejection');assert.deepEqual(r.handledLater,[]);
    if(!isNetworkFailure){assert.equal(r.before.lifetimeCount,1,'register cache lifetime during fetch dispatch');assert.equal(r.calls.find(c=>c.stage==='waitUntil').duringDispatch,true);assert.ok(!r.calls.some(c=>c.stage==='match'));}
    assert.ok(r.lifetimeResults.every(status=>status==='fulfilled'));
    assert.equal(r.clones,isNetworkFailure?0:1);
    assert.equal(r.warnings.length,scenario.endsWith('-reject')&&!isNetworkFailure?1:0);
    if(r.warnings.length){assert.match(r.warnings[0].join(' '),/Cache update failed/);assert.ok(r.warnings[0].join(' ').includes('ControlledCacheError'));}
    if(scenario==='normal'){assert.equal(r.before.stored,false,'response arrives before deferred put completes');assert.equal(r.before.lifetimeSettledBeforeRelease,false,'lifetime must still wait for deferred put');assert.equal(r.stored,true);assert.equal(r.storedBody,'network-fixture');}
    else assert.equal(r.stored,false);
    if(isNetworkFailure){assert.ok(!r.calls.some(c=>c.stage==='open'||c.stage==='put'));const match=r.calls.find(c=>c.stage==='match');assert.equal(match.key,route==='navigation'?'./index.html':'original-request');if(route==='get')assert.deepEqual(match.options,{ignoreSearch:true});}
    if(scenario==='fallback-reject')assert.equal(r.responseError.message,'controlled fallback');else assert.equal(r.responseError,undefined);
    const put=r.calls.find(c=>c.stage==='put');if(put){assert.equal(put.clone,true);assert.equal(put.key,route==='navigation'?'./index.html':'original-request');}
  });
}
test('navigation keeps secondary root fallback',()=>{const r=run('navigation','root-fallback');assert.equal(r.response,'cache');assert.deepEqual(r.calls.filter(c=>c.stage==='match').map(c=>c.key),['./index.html','./']);assert.deepEqual(r.unhandled,[]);});
test('non-GET stays untouched',()=>{const r=run('get','post');assert.equal(r.response,'missing');assert.deepEqual(r.calls,[]);assert.equal(r.before.lifetimeCount,0);assert.deepEqual(r.unhandled,[]);});
