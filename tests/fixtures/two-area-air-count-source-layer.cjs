/* Historical source projection only: two-area optional air-count -> exact90eb4a87.
 * Browser/product code is not intercepted. Older goldens remain unchanged.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const {decomposeThreeTwoRadarSource}=require('./three-two-radar-source-layer.cjs');
const FIXTURE_SHA256="f79c8eeb8e43d1a6f70ed8afc13950b63e9a2926bcf8382bbd2ad0d4574fa425",FILES={"map-equipment-recommend.js":{"beforeBytes":13252,"beforeSHA256":"3f4e116ee928dba8a9546c6264b3a662f2feec4cfc72a70c965438dc62fab100","afterBytes":13751,"approvedAfterSHA256":"c7084b42e47a9e73e5c8607660ca2e692367ebd4d5510f4769ffefff266925c2"},"owned-equipment-planner.js":{"beforeBytes":232360,"beforeSHA256":"c017aa0772792c1a5e52739594e9dedff5d4199ae914c9be893d3631325698c1","afterBytes":232009,"approvedAfterSHA256":"507c34c3c7c168d14ffbaeafa5162e374b4576de3beb4e60500530b8b35ec7fe"}};
function createTwoAreaAirCountHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const radarEndpoint=decomposeThreeTwoRadarSource(root);
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/two-area-air-count-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'two-area air-count approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'90eb4a8743c854c8d20a98b0901b0fca63414f90');assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(FILES).sort());assert.equal(approved.changes.length,11);
 for(const [name,entry]of Object.entries(FILES)){assert.deepEqual(approved.files[name],entry);const rows=approved.changes.filter(row=>row.file===name);assert.ok(rows.length);for(const row of rows){assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}}
 return function project(file,current){
  assert.equal(typeof current,'string');current=radarEndpoint(file,current);if(!Object.hasOwn(approved.files,file))return current;
  const entry=FILES[file];assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved two-area air-count source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique air-count inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),entry.beforeSHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique air-count replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay,current,file+' air-count whole source inverse/replay exact');return restored;
 };
}
module.exports={createTwoAreaAirCountHistoricalProjection};
