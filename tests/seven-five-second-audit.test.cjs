'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),baseline=require('./fixtures/seven-five-second-audit-baseline.json');
const {createOneFiveCl1Dd3HistoricalProjection}=require('./fixtures/one-five-cl1-dd3-source-layer.cjs'),projectOneFiveQuantity=createOneFiveCl1Dd3HistoricalProjection(root);
const {createTwoFiveCeioHistoricalProjection}=require('./fixtures/two-five-ceio-source-layer.cjs'),projectCEIO=createTwoFiveCeioHistoricalProjection(root);
const plain=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('7-5 second audit snapshots bind current CFG 1-5 AO0 and CEIO rows while retaining historical canonical hashes',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);const data=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['7-5'][1]",c));
 const cfg=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['3-1'][0]",c)),oneFive=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['1-5'][1]",c)),before=vm.createContext({window:{}}),oldOneFiveContext=vm.createContext({window:{}});vm.runInContext(projectOneFiveQuantity('map-plans.js',fs.readFileSync(path.join(root,'map-plans.js'),'utf8')),oldOneFiveContext);const oldOneFiveConditions=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['1-5'][1].conditions",oldOneFiveContext));assert.equal(oneFive.conditions.length,oldOneFiveConditions.length+1);const currentWithoutAO=plain(oneFive.conditions),ao=currentWithoutAO.splice(2,1)[0];assert.deepEqual({...ao,reason:undefined},{kind:'typeCount',types:['補給艦'],matchPolicy:'exact',min:0,max:0,reason:undefined});assert.match(ao.reason,/補給艦1以上はE/);assert.match(ao.reason,/潜水を含む場合もF→I/);assert.deepEqual(currentWithoutAO,oldOneFiveConditions,'only independently source-reviewed AO0 condition differs');
 const ceio=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['2-5'][1].los",c)),oldCEIOContext=vm.createContext({window:{}});vm.runInContext(projectCEIO('map-plans.js',fs.readFileSync(path.join(root,'map-plans.js'),'utf8')),oldCEIOContext);const oldCEIOLos=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['2-5'][1].los",oldCEIOContext));
 const oldPlans=require('./fixtures/three-one-cfg-before.json').mapPlanSource;
 assert.equal(crypto.createHash('sha256').update(oldPlans).digest('hex'),'3d4252db31ad6b7fd0e865526863a96747154dd87c9d708a02b6e3e854f3b219');
 vm.runInContext(oldPlans,before);const oldCFGConditions=plain(vm.runInContext("HD_MAP_ROUTE_REQUIREMENTS['3-1'][0].conditions",before));
 assert.equal(data.path,'ABDFJOQ');assert.equal(data.useExampleScope,false);assert.equal(data.los.kind,'none');
 for(const [file,key]of [['route-goal-guidance-audit.json','rows'],['route-requirement-validation-scope.json','examples']]){
  const rows=JSON.parse(fs.readFileSync(path.join(root,'docs',file),'utf8'))[key],selected=rows.filter(x=>x.map==='7-5'&&x.index===1);assert.equal(selected.length,1);const row=selected[0];
  assert.deepEqual(row.conditions,data.conditions);assert.deepEqual(row.scouting,data.los);assert.equal(row.useExampleScope,false);
  assert.equal(row.sourceScopeAudit.independentEvidence.sourceCasesCount,31);assert.equal(row.sourceScopeAudit.independentEvidence.actualMasterProposals,6);assert.deepEqual(row.sourceScopeAudit.independentEvidence.scopeExpectedCounts,{ready:16,missing:9,manual:6});
  const cfgRows=rows.filter(x=>x.map==='3-1'&&x.index===0);assert.equal(cfgRows.length,1);
  assert.deepEqual(cfgRows[0].conditions,cfg.conditions);assert.deepEqual(cfgRows[0].scouting,cfg.los);
  assert.equal(cfg.useExampleScope,false);assert.equal(cfgRows[0].sourceScopeAudit.useExampleScope,false);assert.equal(cfgRows[0].sourceScopeAudit.knownSixOnly,true);
  // Bind current CEIO first, then normalize only its reviewed LOS object along
  // with CFG and the one added 1-5 AO0 condition. Every old group/hash stays exact.
  const ceioRows=rows.filter(x=>x.map==='2-5'&&x.index===1);assert.equal(ceioRows.length,1);assert.deepEqual(ceioRows[0].scouting,ceio,'current CEIO audit remains bound before its approved historical LOS projection');
  const oneFiveRows=rows.filter(x=>x.map==='1-5'&&x.index===1);assert.equal(oneFiveRows.length,1);assert.deepEqual(oneFiveRows[0].conditions,oneFive.conditions,'current1-5 docs bind the AO0 product condition before historical normalization');
  const others=rows.filter(x=>x!==row).map(x=>Object.fromEntries(baseline.canonicalKeys.filter(k=>Object.hasOwn(x,k)).map(k=>[k,x[k]]))).map(x=>x.map==='3-1'&&x.index===0?{...x,conditions:oldCFGConditions}:x.map==='1-5'&&x.index===1?{...x,conditions:oldOneFiveConditions}:x.map==='2-5'&&x.index===1?{...x,scouting:oldCEIOLos}:x);assert.equal(others.length,baseline.unaffected[file].rows);assert.equal(hash(others),baseline.unaffected[file].sha256,file+' historical canonical rows with only approved CFG AO0 and CEIO LOS restored');
  if(key==='examples')assert.deepEqual(row.strategyEquipmentTargets,data.equipmentTargets);else assert.deepEqual(row.equipmentKinds,data.equipmentKinds);
 }
});
