const {test}=require('node:test');
const assert=require('node:assert/strict');
const {positions,northDrumPlacements}=require('./north-drum-oracle.cjs');
test('two indistinguishable drums enumerate every unordered pair of ten distinct positions once',()=>{
 const rows=northDrumPlacements();assert.equal(rows.length,10*9/2);assert.equal(new Set(rows.map(r=>r.id)).size,45);
 assert.equal(new Set(positions.map(p=>[p.shipIndex,p.expansion?'ex':'normal',p.index].join(':'))).size,10);
 for(const r of rows){assert.equal(r.slots.length,2);assert.notEqual(r.slots[0],r.slots[1])}
});
test('closed expansion wrong hull and out of range never count as valid drum hulls',()=>{
 const rows=northDrumPlacements();
 for(const id of ['4-5','6-7','8-9'])assert.equal(rows.find(r=>r.id===id).drumHulls,0);
 assert.equal(rows.find(r=>r.id==='0-1').drumHulls,1);assert.equal(rows.find(r=>r.id==='2-3').drumHulls,1);
 assert.equal(rows.find(r=>r.id==='0-2').drumHulls,2);
});
test('finite partitions distinguish legality distinct hulls and the original synchronized allocation',()=>{
 const rows=northDrumPlacements();assert.equal(rows.filter(r=>r.legal).length,6);assert.equal(rows.filter(r=>r.drumsReady).length,4);
 assert.deepEqual([0,1,2].map(n=>rows.filter(r=>r.drumHulls===n).length),[15,26,4]);
 assert.deepEqual(rows.filter(r=>r.synchronized).map(r=>r.id),['1-3']);
});
