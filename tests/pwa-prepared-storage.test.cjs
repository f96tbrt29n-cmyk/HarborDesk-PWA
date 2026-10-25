'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {KEYS,comparePreparedStorage}=require('./pwa-prepared-storage.cjs');
const document={timeOrigin:123,url:'http://127.0.0.1:4173/'};
const snapshot=()=>({document:{...document},readyState:'complete',at:42,values:KEYS.map((_,i)=>JSON.stringify({row:i}))});
test('offline comparison requires every complete string, not just non-null or a digest',()=>{
 const before=snapshot(),after=snapshot();after.values[1]='{"row":1 }';
 assert.throws(()=>comparePreparedStorage(before,after,document),/stored strings/);
 after.values[1]=before.values[1];
 const result=comparePreparedStorage(before,after,document);
 assert.equal(result.keys.length,6);assert.ok(result.keys.every(k=>k.present&&k.exactMatch));
 assert.ok(!JSON.stringify(result).includes('"row"'));
});
test('six non-null baseline and restored keys are both mandatory, even for matching nulls',()=>{
 for(const side of ['reference','actual','both']){
  const a=snapshot(),b=snapshot();if(side!=='actual')a.values[2]=null;if(side!=='reference')b.values[2]=null;
  assert.throws(()=>comparePreparedStorage(a,b,document),/non-null/);
 }
});
test('load completion and final reload document identity are separate prerequisites',()=>{
 const a=snapshot(),b=snapshot();b.readyState='interactive';assert.throws(()=>comparePreparedStorage(a,b,document),/load/);
 b.readyState='complete';b.document.timeOrigin++;assert.throws(()=>comparePreparedStorage(a,b,document),/same final reload document/);
});
test('normalized online strings are authoritative, not an assertion that raw seed strings survived',()=>{
 const normalized=snapshot(),restored=snapshot();normalized.values[0]=restored.values[0]='{"normalized":true}';
 assert.ok(comparePreparedStorage(normalized,restored,document).keys[0].exactMatch);
});
