/* Historical source projection only: optional scouting guidance -> exact 48f6ebc8/c0402597.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const {createOptionalAswGuidanceHistoricalProjection}=require('./optional-asw-guidance-source-layer.cjs');
const FIXTURE_SHA256='3a4a2ab5176bf707846a5fdd1877eb14fda4c81efbc9aac58b6ea97ec6f3b4ee',FILE='owned-equipment-planner.js',BEFORE_SHA256='67aec284a14dfa667de52d92cc6c1f806b0f02f0b11c615ddb0326c19ecd2737';
function createScoutingOptionalHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const projectOptionalAsw=createOptionalAswGuidanceHistoricalProjection(root);
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/scouting-optional-guidance-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'optional scouting approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'48f6ebc89b24ca6d20991314551d8377bc98b6b6');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,4);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');current=projectOptionalAsw(file,current);if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved optional scouting current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique optional scouting inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique optional scouting replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' optional scouting whole source inverse/replay exact');return restored;
 };
}
module.exports={createScoutingOptionalHistoricalProjection};
