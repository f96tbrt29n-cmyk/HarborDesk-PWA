/* Test-only strict inverse for 3-2 radar advice. Old golden files stay intact. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const FILE='owned-equipment-planner.js',FIXTURE_SHA256='a840276a1770461e196805e8e5728db69c1463e2c9fc2dc3abfd21e4a1430297',ENTRY={"beforeBytes":232009,"beforeSHA256":"507c34c3c7c168d14ffbaeafa5162e374b4576de3beb4e60500530b8b35ec7fe","afterBytes":247201,"approvedAfterSHA256":"03c034c48e35c6e9013cfa46dff1eebb2daeae58c56aa3846d35444e8d709715"};
function createThreeTwoRadarHistoricalProjection(root=path.resolve(__dirname,'../..')){
 const bytes=fs.readFileSync(path.join(root,'tests/fixtures/three-two-radar-approved-source-inverses.json'));assert.equal(hash(bytes),FIXTURE_SHA256,'approved radar inverse fixture');const fixture=JSON.parse(bytes);assert.equal(fixture.schemaVersion,1);assert.equal(fixture.beforeSourceHEAD,'1b5165d11f93801b4609ac7278838177c8cfb3ae');assert.deepEqual(Object.keys(fixture.files),[FILE]);assert.deepEqual(fixture.files[FILE],ENTRY);assert.equal(fixture.changes.length,18);
 for(const row of fixture.changes){assert.equal(row.file,FILE);assert.equal(typeof row.before,'string');assert.equal(typeof row.after,'string');assert.ok(row.before&&row.after&&row.before!==row.after)}
 return function project(file,current){assert.equal(typeof current,'string');if(file!==FILE)return current;assert.equal(hash(current),ENTRY.approvedAfterSHA256,'exact approved current radar source');assert.equal(Buffer.byteLength(current),ENTRY.afterBytes);let restored=current;for(const row of fixture.changes.slice().reverse()){assert.equal(restored.split(row.after).length,2,'unique radar inverse anchor');restored=restored.replace(row.after,row.before)}assert.equal(hash(restored),ENTRY.beforeSHA256);assert.equal(Buffer.byteLength(restored),ENTRY.beforeBytes);let replay=restored;for(const row of fixture.changes){assert.equal(replay.split(row.before).length,2,'unique radar replay anchor');replay=replay.replace(row.before,row.after)}assert.equal(replay===current,true,'whole source inverse/replay exact');return restored;};
}
// An older layer may receive its exact preceding endpoint from its own direct
// decomposition assertion. Only that one pinned endpoint may pass unchanged;
// the strict inverse above still rejects double projection and unknown bytes.
function decomposeThreeTwoRadarSource(root=path.resolve(__dirname,'../..')){const project=createThreeTwoRadarHistoricalProjection(root);return function(file,current){assert.equal(typeof current,'string');if(file===FILE&&hash(current)===ENTRY.beforeSHA256){assert.equal(Buffer.byteLength(current),ENTRY.beforeBytes);return current}return project(file,current)};}
module.exports={createThreeTwoRadarHistoricalProjection,decomposeThreeTwoRadarSource};
