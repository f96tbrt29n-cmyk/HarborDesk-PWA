/* Historical source projection only. Approved CEIO source -> exact dffa4436.
 * Product code is never intercepted. Current/base endpoints and fixture are
 * pinned; unknown bytes and accidental duplicate projection fail.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const {createTwoFiveCeioEHistoricalProjection}=require('./two-five-ceio-e-source-layer.cjs');
const FIXTURE_SHA256='d6965ae2eb23806a87a7a8942ccdfee1aecddbfb68bda6385501ee5f21a30e97';
const BEFORE_SHA256={
 'map-plans.js':'d95ee0297842fe4a92c854911db495cc86dbb7611fb124aec4a0242849b360a8',
 'fleet-readiness-evaluator.js':'21d3d329bd71f3ddf4c6fef71b71db83093deb3d89838c5010f4cc311f6103ba',
 'owned-equipment-planner.js':'39d9e276a20e6166708f76217ecd27c293fc5ba136f9e2413bff877ed6a9eebd',
 'fleet-calculator.js':'983db383d21bd8ed6fbd6a0e58329a24f68da251ab3fe0d51827bc39bd780635'
};
function createTwoFiveCeioHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const projectE=createTwoFiveCeioEHistoricalProjection(root);
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/two-five-ceio-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'CEIO independent approved inverse fixture');
 const approved=JSON.parse(bytes);assert.equal(approved.schemaVersion,1);assert.equal(approved.beforeSourceHEAD,'dffa443645383b0df51ba5190b130f161edda031');assert.deepEqual(Object.keys(approved.files).sort(),Object.keys(BEFORE_SHA256).sort());assert.equal(approved.changes.length,24);
 for(const [file,before]of Object.entries(BEFORE_SHA256)){const entry=approved.files[file];assert.equal(entry.beforeSHA256,before);assert.match(entry.approvedAfterSHA256,/^[a-f0-9]{64}$/);assert.ok(entry.beforeBytes>0&&entry.afterBytes>0);assert.ok(approved.changes.some(row=>row.file===file))}
 return function project(file,current){
  assert.equal(typeof current,'string');current=projectE(file,current);const entry=approved.files[file];if(!entry)return current;
  assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved CEIO current source');assert.equal(Buffer.byteLength(current),entry.afterBytes);
  const rows=approved.changes.filter(row=>row.file===file);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique CEIO inverse anchor');restored=restored.replace(row.after,row.before)}
  assert.equal(hash(restored),BEFORE_SHA256[file],file+' exact dffa source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);
  let replay=restored;for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique CEIO replay anchor');replay=replay.replace(row.before,row.after)}
  assert.equal(replay,current,file+' CEIO whole source inverse/replay exact');return restored;
 };
}
module.exports={createTwoFiveCeioHistoricalProjection};
