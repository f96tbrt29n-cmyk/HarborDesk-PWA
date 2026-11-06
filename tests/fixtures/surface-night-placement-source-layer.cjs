/* Historical source projection only: surface-night guidance -> exact 7c9e4acc/c41a01cb.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='e16b7c982c268546c6108d5583c1dc9cdf3b7a5cc6c028a0bd0fc104ec916900';
const FILE='owned-equipment-planner.js',BEFORE_SHA256='11b7ddbf74b6ed585a9c4f64d382b41d2d2cac7680284ef3e8e7a510069a2e7b';
function createSurfaceNightPlacementHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/surface-night-placement-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'surface-night approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'7c9e4accef6115b22b74aaccde15fe4a57dd6c02');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,3);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved surface-night current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique surface-night inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact 7c source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique surface-night replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' surface-night whole source inverse/replay exact');return restored;
 };
}
module.exports={createSurfaceNightPlacementHistoricalProjection};
