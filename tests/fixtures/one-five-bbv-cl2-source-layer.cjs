/* Historical source layer only: current BBV1CL2DD1 source -> reviewed BBV1CL1DD2 source. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='3ec5bd198c5972a5b5a88cea3d2b9bf466dd2b212305c7771a11b563851b5cf3';
const BEFORE_SHA256={
 'fleet-readiness-evaluator.js':'b737cba126d29936b797e00593a32aa3513c11003a1409005b8478e08354fdc3',
 'sortie-equipment-check.js':'1600e3bf8efddc226b8e86b99a2053e0b32989acd55bd8d128ad8ff44514af19'
};
function createOneFiveBbvCl2HistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/one-five-bbv-cl2-approved-source-inverses.json'));
 assert.equal(hash(bytes),FIXTURE_SHA256,'CL2 inverse fixture is independently pinned');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);
 assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());
 assert.ok(Array.isArray(approved.changes));assert.equal(approved.changes.length,4);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){
  const entry=approved.files[file];assert.equal(entry.beforeSHA256,before,file+' reviewed 6c08381f source baseline');
  assert.match(entry.approvedAfterSHA256,/^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
  assert.ok(approved.changes.some(row=>row.file===file));
 }
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved CL2 source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique CL2 inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact reviewed BBV+CL source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;
  for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique CL2 replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' CL2 layer reverses and replays byte-exactly');return restored;
 };
}
module.exports={createOneFiveBbvCl2HistoricalProjection};
