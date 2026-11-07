/* Historical source projection only: optional ASW guidance -> exact 3217e5ab/e625d5d8.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='9d816706ac112c2c026a11b9cbd2558b4e1f7a2b39551a5c532f407569234b88',FILE='owned-equipment-planner.js',BEFORE_SHA256='1470d556098809aa0a4b6978de95545ececdbf57935828ab5dafbed71b1ff284';
function createOptionalAswGuidanceHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/optional-asw-guidance-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'optional ASW approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'3217e5aba223cac52526e132a22a3f8ac8ff516f');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,4);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved optional ASW current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique optional ASW inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique optional ASW replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' optional ASW whole source inverse/replay exact');return restored;
 };
}
module.exports={createOptionalAswGuidanceHistoricalProjection};
