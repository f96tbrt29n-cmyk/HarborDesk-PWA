'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),baseline=require('./fixtures/seven-five-second-audit-baseline.json');
const plain=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('7-5 second audit snapshots bind the selected conditional route without changing other canonical rows',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);const data=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['7-5'][1]",c));
 assert.equal(data.path,'ABDFJOQ');assert.equal(data.useExampleScope,false);assert.equal(data.los.kind,'none');
 for(const [file,key]of [['route-goal-guidance-audit.json','rows'],['route-requirement-validation-scope.json','examples']]){
  const rows=JSON.parse(fs.readFileSync(path.join(root,'docs',file),'utf8'))[key],selected=rows.filter(x=>x.map==='7-5'&&x.index===1);assert.equal(selected.length,1);const row=selected[0];
  assert.deepEqual(row.conditions,data.conditions);assert.deepEqual(row.scouting,data.los);assert.equal(row.useExampleScope,false);
  assert.equal(row.sourceScopeAudit.independentEvidence.sourceCasesCount,31);assert.equal(row.sourceScopeAudit.independentEvidence.actualMasterProposals,6);assert.deepEqual(row.sourceScopeAudit.independentEvidence.scopeExpectedCounts,{ready:16,missing:9,manual:6});
  const others=rows.filter(x=>x!==row).map(x=>Object.fromEntries(baseline.canonicalKeys.filter(k=>Object.hasOwn(x,k)).map(k=>[k,x[k]])));assert.equal(others.length,baseline.unaffected[file].rows);assert.equal(hash(others),baseline.unaffected[file].sha256,file+' unchanged canonical rows');
  if(key==='examples')assert.deepEqual(row.strategyEquipmentTargets,data.equipmentTargets);else assert.deepEqual(row.equipmentKinds,data.equipmentKinds);
 }
});
