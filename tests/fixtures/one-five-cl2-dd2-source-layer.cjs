/* Historical source layer only: current CL2DD2 source -> reviewed BBV three-cohort source. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const {createOneFiveCl1Dd3HistoricalProjection}=require('./one-five-cl1-dd3-source-layer.cjs');
const FIXTURE_SHA256='2b76f08019873f5a5d4f201ccac93dbcfb697991839cb4ea4586923cd6f61a6f';
const BEFORE_SHA256={
 'fleet-readiness-evaluator.js':'d131894743074264faf9e083ee432123aa6a9959a7c5484d9f1d8a6d247a224b',
 'sortie-equipment-check.js':'9eb644b4d5ba6efbeb23dcdb9e6ebe43e12563a09a105ec69b88c24bf3529b79'
};
function createOneFiveCl2Dd2HistoricalProjection(root=path.resolve(__dirname,'../..')){
 const projectCurrentCl1Dd3=createOneFiveCl1Dd3HistoricalProjection(root);
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/one-five-cl2-dd2-approved-source-inverses.json'));
 assert.equal(hash(bytes),FIXTURE_SHA256,'CL2DD2 inverse fixture is independently pinned');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);
 assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());
 assert.ok(Array.isArray(approved.changes));assert.equal(approved.changes.length,4);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){
  const entry=approved.files[file];assert.equal(entry.beforeSHA256,before,file+' reviewed ad793f1a product source baseline');
  assert.match(entry.approvedAfterSHA256,/^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
  assert.ok(approved.changes.some(row=>row.file===file));
 }
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');current=projectCurrentCl1Dd3(file,current);const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved CL2DD2 source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique CL2DD2 inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact reviewed BBV+CL source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;
  for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique CL2DD2 replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' CL2DD2 layer reverses and replays byte-exactly');return restored;
 };
}
module.exports={createOneFiveCl2Dd2HistoricalProjection};
