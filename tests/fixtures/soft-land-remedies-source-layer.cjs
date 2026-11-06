/* Historical source projection only: owned soft-land remedies -> exact a4bb8857/2f35b952.
 * Product code is not intercepted. Prior fixture/hash expectations stay intact.
 * Unknown bytes and double projection fail before any inverse replacement.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='9d38ea80a72948769a22c26bc5c7d41922909cb6e840a5d901800746bc674d72';
const BEFORE_SHA256={'fleet-loadout-planner.js':'bd76762a4b6c6d4b2c77965612eb4e0fcfcd96706036f9557784190d5c17016f','owned-equipment-planner.js':'c591e8e568469e0efa03efb81fe9e14eb66eb2c30c5ec6823b30ec03c48d91d9'};
function createSoftLandRemediesHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/soft-land-remedies-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'soft-land remedies approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'a4bb8857e73abe51ca2a62bd66e0dc3f6ccf75c7');assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());assert.equal(approved.changes.length,9);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){const entry=approved.files[file];assert.equal(entry.beforeSHA256,before);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(Number.isInteger(entry.beforeBytes)&&entry.beforeBytes>0&&Number.isInteger(entry.afterBytes)&&entry.afterBytes>0);assert.ok(approved.changes.some(row=>row.file===file))}
 for(const row of approved.changes){assert.ok(Object.hasOwn(BEFORE_SHA256,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');const entry=Object.hasOwn(approved.files,file)?approved.files[file]:null;if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved soft-land remedies current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique soft-land remedies inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact a4 source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique soft-land remedies replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' soft-land remedies whole source inverse/replay exact');return restored;
 };
}
module.exports={createSoftLandRemediesHistoricalProjection};
