/* Historical source projection only: carrier guidance -> exact 76357fe0/88a3c0a4.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='bf833b6979363fa663fa09eaad0d39801d52f1d2726058fd023611ca830e62b3';
const FILE='owned-equipment-planner.js',BEFORE_SHA256='09559c3b7365b84141b65f3f58b3d9f91bb93c971ecccf20378086348597fbdd';
function createCarrierGuidanceHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/carrier-guidance-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'carrier guidance approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'76357fe00d44ed3a2ef2e22fbbb4f111e12380b3');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,4);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved carrier guidance current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique carrier guidance inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact 763 source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique carrier guidance replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' carrier guidance whole source inverse/replay exact');return restored;
 };
}
module.exports={createCarrierGuidanceHistoricalProjection};
