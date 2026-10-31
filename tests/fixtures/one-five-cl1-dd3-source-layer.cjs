/* Historical source layer only: reviewed current CL1DD3 quantity/route source
 * -> preceding four-cohort source. No current product operation is intercepted. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256="c876767f33bec6aecd878b77ba206a8dd43bacbb5ec01256f908cf3f16a71626";
const BEFORE_SHA256={
 "fleet-readiness-evaluator.js": "c85dd3fa43533a8a94b17200501b51d49643c7ada12595ad4281db562a55b25d",
 "sortie-equipment-check.js": "b96625d192be960b23ff7aa4d21be7ee1022558e7c47e0e12b5345f9c88b2c0b",
 "map-plans.js": "aa312e59cf5533ac32dcff9036d57e8b6c049d7de8660d69020140ddafa9af7a",
 "owned-equipment-planner.js": "c458417d7140978b0a24f1d048804c198535ce288e0f6a236be02d30be13baf9"
};
function createOneFiveCl1Dd3HistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/one-five-cl1-dd3-approved-source-inverses.json'));
 assert.equal(hash(bytes),FIXTURE_SHA256,'CL1DD3 inverse fixture independently pinned');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);
 assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());
 assert.ok(Array.isArray(approved.changes));assert.equal(approved.changes.length,40);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){
  const entry=approved.files[file];assert.equal(entry.beforeSHA256,before,file+' exact preceding reviewed source baseline');
  assert.match(entry.approvedAfterSHA256,/^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
  assert.ok(approved.changes.some(row=>row.file===file));
 }
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved current CL1DD3 source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique CL1DD3 inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact preceding four-cohort source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique CL1DD3 replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' CL1DD3 inverse/replay whole exact');return restored;
 };
}
module.exports={createOneFiveCl1Dd3HistoricalProjection};
