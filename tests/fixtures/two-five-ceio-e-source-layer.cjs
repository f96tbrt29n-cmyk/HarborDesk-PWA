/* Historical source projection only. Optional-AA -> approved CEIO E -> exact f37b7e20.
 * Product code is never intercepted. Both endpoints and fixture are pinned;
 * unknown bytes and accidental duplicate projection fail.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const {createOptionalAntiAirHistoricalProjection}=require('./optional-anti-air-source-layer.cjs');
const FIXTURE_SHA256='cb3dc3c53a9a005893787e7b8ca82fb594068519b3d11863908f7acef4014df6';
const BEFORE_SHA256={
 "map-plans.js": "0e475dcb0952da28d8371f59b5c3205671f883fea09e23dd80d5a7345a55f18a",
 "fleet-readiness-evaluator.js": "c82d4dc820990aa1b78d4324521e1385039b56dc98ccca2752953c800c7c7154"
};
function createTwoFiveCeioEHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const projectOptional=createOptionalAntiAirHistoricalProjection(root);
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/two-five-ceio-e-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'CEIO E approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'f37b7e2009fa2090059c4569efb066a477714519');assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());assert.equal(approved.changes.length,8);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){const entry=approved.files[file];assert.equal(entry.beforeSHA256,before);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(entry.beforeBytes>0&&entry.afterBytes>0);assert.ok(approved.changes.some(row=>row.file===file))}
 return function project(file,current){
  assert.equal(typeof current,'string');current=projectOptional(file,current);const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved CEIO E current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique CEIO E inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact f37 source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique CEIO E replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' CEIO E whole source inverse/replay exact');return restored;
 };
}
module.exports={createTwoFiveCeioEHistoricalProjection};
