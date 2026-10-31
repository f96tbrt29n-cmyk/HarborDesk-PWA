/* Historical source projection only; current BBV+CL semantics have separate literal/model tests. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='96a45cfa2d5754962619e11645c2613d6f3175b5832c6ddbc161dc4bda409cfd';
const BEFORE_SHA256={
 'fleet-readiness-evaluator.js':'bc7ffb6aa9efa012ee7baab4540fa8961190d9e9a39cdf2342ae42aba34bb409',
 'sortie-equipment-check.js':'d26fa06d8d1fb47898121fbc70f23935cb2f29ca29ba62b5e3e96e1766b405d2'
};
function createOneFiveBbvClHistoricalProjection(root=path.resolve(__dirname,'../..')){
 assert.match(FIXTURE_SHA256,/^[0-9a-f]{64}$/,'bind the new reviewed fixture before using this projection');
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/one-five-bbv-cl-approved-source-inverses.json'));
 assert.equal(hash(bytes),FIXTURE_SHA256,'new BBV+CL inverse fixture remains independently pinned');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);
 assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());
 assert.ok(Array.isArray(approved.changes)&&approved.changes.length>0);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){
  assert.equal(approved.files[file].beforeSHA256,before,file+' d621 whole-source baseline');
  assert.match(approved.files[file].approvedAfterSHA256,/^[0-9a-f]{64}$/);
  assert.ok(approved.changes.some(row=>row.file===file));
 }
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved BBV+CL source');
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique new inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact d621 source restored');
  let replay=restored;
  for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' new source reverses and replays byte-exactly');return restored;
 };
}
module.exports={createOneFiveBbvClHistoricalProjection};
