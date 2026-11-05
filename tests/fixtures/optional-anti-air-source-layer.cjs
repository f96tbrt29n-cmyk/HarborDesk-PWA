/* Historical source projection only: optional-AA display source -> exact ba762601.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256="17875654d134b9944db4854e3bf48ff3845dec30cc134dd4c063f5ac41cd87fd";
const BEFORE_SHA256={
 "sortie-equipment-check.js": "3930c870e2dd4c1b6b3f361cd5c115cc5f690dd250135852e99d162d650d48ff",
 "owned-equipment-planner.js": "a486c471f2f93593c9ec46a6ccdd3c780e55800aefb462a3b2992b3a2421bf6d"
};
function createOptionalAntiAirHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/optional-anti-air-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'optional-AA approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'ba762601583d06a777420dc2f033180c6b3abb25');assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());assert.equal(approved.changes.length,3);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){const entry=approved.files[file];assert.equal(entry.beforeSHA256,before);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);assert.ok(approved.changes.some(row=>row.file===file))}
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved optional-AA current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique optional-AA inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact ba source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique optional-AA replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' optional-AA whole source inverse/replay exact');return restored;
 };
}
module.exports={createOptionalAntiAirHistoricalProjection};
