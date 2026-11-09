/* Historical source projection only: optional air-count guidance -> exact 1b8082f7/c71d3896.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='fc4f75d5d6966547419d3981353195244ef3e5b7a3e249887cec8142c52357cb',FILE='owned-equipment-planner.js',BEFORE_SHA256='f4abc1ca94c9a24092121277d006f40d607e50dd2d0ee136493b681c9a770ffd';
function createAirCountOptionalHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/air-count-optional-guidance-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'optional air-count approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'1b8082f7700ef2717ead21735ffb4b540f26d325');assert.deepEqual(Object.keys(approved.files),[FILE]);assert.equal(approved.changes.length,6);
 const entry=approved.files[FILE];assert.equal(entry.beforeSHA256,BEFORE_SHA256);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);
 for(const row of approved.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(file!==FILE)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved optional air-count current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  let restored=current;for(const row of approved.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique optional air-count inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of approved.changes){assert.equal(replay.split(row.before).length,2,file+' unique optional air-count replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' optional air-count whole source inverse/replay exact');return restored;
 };
}
module.exports={createAirCountOptionalHistoricalProjection};
