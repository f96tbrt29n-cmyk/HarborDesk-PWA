/* Test-only strict inverse of the selected7-5 third fixed-input change.
 * Historical source audits only; current runtime and behavior tests stay raw.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FIXTURE_SHA256='da526e34e5178311b22d033ed878c58f2fd0483c724d0d9c7a8ee88e9e767868',FILES={"fleet-loadout-planner.js":{"beforeBytes":69164,"beforeSHA256":"6cd45a50a8aecd62c26efd24e525e5d2a77b1d0da43ed21bb6e100764ccbfcf1","afterBytes":69163,"approvedAfterSHA256":"e632d5bbd3a446138216db9cff0d3cc3cd1a816356f0bf27f341ac64a95698a3"},"owned-equipment-planner.js":{"beforeBytes":254453,"beforeSHA256":"bec15796c1ba489588c8ea8fe88ab2c044a7c862de8b48f099b573e413474b19","afterBytes":258945,"approvedAfterSHA256":"09c05f3c184ced94ac7db860bc8f6b9ab09ba1f2ec9edcec9afe43b3b991bdfd"}};
function createSevenFiveThirdFixedInputHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/seven-five-third-fixed-input-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'approved seven-five-third fixed-input inverse fixture');const fixture=JSON.parse(bytes);assert.equal(fixture.schemaVersion,1);assert.equal(fixture.beforeSourceHEAD,'72806e4ded6188e65691b08c6b9caf30df66ff70');assert.deepEqual(fixture.files,FILES);assert.equal(fixture.changes.length,7);
 for(const row of fixture.changes){assert.ok(Object.hasOwn(FILES,row.file));assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){
  assert.equal(typeof current,'string');if(!Object.hasOwn(FILES,file))return current;const entry=FILES[file];assert.equal(hash(current),entry.approvedAfterSHA256,file+' exact approved fixed-input source');assert.equal(Buffer.byteLength(current),entry.afterBytes);const rows=fixture.changes.filter(row=>row.file===file);assert.ok(rows.length);let restored=current;
  for(const row of rows.slice().reverse()){assert.equal(restored.split(row.after).length,2,file+' unique fixed-input inverse anchor');restored=restored.replace(row.after,row.before)}assert.equal(hash(restored),entry.beforeSHA256,file+' exact preceding source restored');assert.equal(Buffer.byteLength(restored),entry.beforeBytes);let replay=restored;
  for(const row of rows){assert.equal(replay.split(row.before).length,2,file+' unique fixed-input replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay,current,file+' whole source inverse/replay exact');return restored;
 };
}
// Older chains may receive only these exact already-decomposed endpoints.
// The strict projector still rejects preceding, repeated and unknown input.
function decomposeSevenFiveThirdFixedInputSource(root=path.resolve(__dirname,'../..')){const project=createSevenFiveThirdFixedInputHistoricalProjection(root);return function(file,current){assert.equal(typeof current,'string');const entry=FILES[file];if(entry&&hash(current)===entry.beforeSHA256){assert.equal(Buffer.byteLength(current),entry.beforeBytes);return current}return project(file,current)};}
module.exports={createSevenFiveThirdFixedInputHistoricalProjection,decomposeSevenFiveThirdFixedInputSource};
