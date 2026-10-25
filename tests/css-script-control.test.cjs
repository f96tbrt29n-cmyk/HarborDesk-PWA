const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createControlServer, html } = require('./css-script-control.cjs');
for (const condition of ['css','script']) test('isolated '+condition+' gate holds headers until explicit release',async()=>{
  let accepted; const held = new Promise(resolve=>{accepted=resolve});
  const server = await createControlServer(condition,e=>{if(e.phase==='response-held')accepted()});
  let headers = false;
  const get = (path,track=false) => new Promise((resolve,reject)=>{http.get(server.origin+path,res=>{
    if(track)headers=true;let bytes=0;res.on('data',b=>{bytes+=b.length});res.on('end',()=>resolve({status:res.statusCode,type:res.headers['content-type'],bytes}));res.on('error',reject);
  }).on('error',reject)});
  try {
    const pending=get(server.heldPath,true);await held;
    const normal=await get(condition==='css'?'/first.js':'/preceding.css');
    assert.equal(headers,false);assert.equal(normal.status,200);assert.ok(normal.bytes>0);
    assert.ok(!server.events.some(e=>e.path===server.heldPath&&e.phase==='headers-written'));
    server.release();const result=await pending;assert.equal(headers,true);assert.equal(result.status,200);assert.ok(result.bytes>0);
    assert.ok(html.indexOf('<link rel="stylesheet"')<html.indexOf('<script src="/first.js"'));
    assert.ok(!/async|defer|serviceWorker|localStorage|document\.(write|open)/.test(html));
    const phases=server.events.filter(e=>e.path===server.heldPath).map(e=>e.phase);assert.ok(phases.indexOf('release')<phases.indexOf('headers-written'));
  } finally { await server.close(); }
});
