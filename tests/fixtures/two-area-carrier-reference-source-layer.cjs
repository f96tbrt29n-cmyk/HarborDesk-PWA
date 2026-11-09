/* Historical source projection only: two-area carrier reference -> exact1394b31a.
 * Real browser/product code is never intercepted. Unknown or doubled inputs fail.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='5141145aa7388f26e000c14b0fe7f3f2290c27f1ed25324cbd4f230a2355d786',FILE='owned-equipment-planner.js',BEFORE_SHA256='30631723f13a266e15d8c0df8e39192523c6b4c09e9e9191c2aeaa87a15919ec';
function createTwoAreaCarrierHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/two-area-carrier-reference-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'two-area carrier approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'1394b31afcd0414999cfa98a4430db8b12747abc');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,3);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved two-area carrier current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique two-area carrier inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique two-area carrier replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' two-area carrier whole source inverse/replay exact');return restored;
 };
}
module.exports={createTwoAreaCarrierHistoricalProjection};
