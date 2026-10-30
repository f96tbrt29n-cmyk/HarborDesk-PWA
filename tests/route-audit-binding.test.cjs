'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {routeAuditNumericCondition}=require('./fixtures/route-audit-numeric-condition.cjs'),root=path.join(__dirname,'..');
const plain=x=>JSON.parse(JSON.stringify(x));
const canonicalLos={kind:'required',coef:4,checks:[{label:'選択経路の索敵分岐',safe:37,failBelow:33}],marginNote:'司令部Lv120未満では出典が+1以上の余裕を推奨。閾値と余裕は区別して確認。',preserveRandomBand:true,numericModelUnverified:'Jのraw係数4閾値33/37は一致するが、KCの司令部補正0.35と既存計算0.4の適用は未照合。式を推測変更せず数値経路は未判定。'};
const independentProse={marginNote:'司令部Lv120未満の+1以上という出典の余裕推奨と固定閾値を区別する。',numericModelUnverified:'raw係数4の33/37表と、HQ補正式0.35/0.4の適用確認は別。実計算式未照合のためmanualを保持する。'};
function auditRows(){
 const guidance=JSON.parse(fs.readFileSync(path.join(root,'docs/route-goal-guidance-audit.json'),'utf8')),scope=JSON.parse(fs.readFileSync(path.join(root,'docs/route-requirement-validation-scope.json'),'utf8'));
 assert.equal(guidance.rows.length,59);assert.equal(scope.examples.length,53);
 const g=guidance.rows.filter(x=>x.map==='7-4'&&x.index===0),s=scope.examples.filter(x=>x.map==='7-4'&&x.index===0);assert.equal(g.length,1);assert.equal(s.length,1);return {guidance:guidance.rows,selected:[g[0],s[0]]};
}
function registryContext(){
 const c=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(root,'map-plans.js'),'utf8'),c);return {c,data:vm.runInContext('HD_MAP_ROUTE_REQUIREMENTS["7-4"][0]',c),preset:vm.runInContext('MAP_PLANS["7-4"].presets[0]',c)};
}
function loadFunction(name,c){
 const source=fs.readFileSync(path.join(root,'fleet-readiness-evaluator.js'),'utf8'),start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0,name);vm.runInContext(source.slice(start,end<0?undefined:end)+'\n',c);
}
test('route audit snapshots bind canonical 7-4 LOS and retain independent source explanations',()=>{
 const {selected}=auditRows(),{data}=registryContext();assert.deepEqual(plain(data.los),canonicalLos);
 for(const row of selected){assert.deepEqual(row.scouting,canonicalLos);assert.deepEqual(row.scouting,plain(data.los));assert.deepEqual(row.sourceScopeAudit.independentScoutingExplanation,independentProse);assert.match(row.sourceScopeAudit.canonicalScoutingBinding,/unchanged product contract/);assert.equal(row.sourceScopeAudit.sourceLiteralProposals,57);assert.equal(row.sourceScopeAudit.policyLiteralProposals,6);assert.equal(row.sourceScopeAudit.scopeAdjustmentIds.length,8);assert.deepEqual(row.sourceScopeAudit.scopedRawExpectedCounts,{ready:18,missing:16,manual:21,partial:2});}
});
test('route audit numeric expectation preserves old 58 outputs and matches the actual 7-4 FE contract',()=>{
 const {guidance}=auditRows(),others=guidance.filter(x=>!(x.map==='7-4'&&x.index===0));assert.equal(others.length,58);
 // Freeze the previous inline factory as a compatibility oracle for old rows.
 const oldCondition=los=>{const numeric={kind:'scoutingValue',min:los.checks[0].safe,coef:los.coef};return los.exemptWhen?{any:[los.exemptWhen,numeric],reason:los.exemptNote}:numeric;};
 for(const row of others){const before=JSON.stringify(row.scouting);assert.notEqual(row.scouting.preserveRandomBand,true);if(row.scouting.kind==='required')assert.deepEqual(routeAuditNumericCondition(row.scouting),oldCondition(row.scouting),row.id);assert.equal(JSON.stringify(row.scouting),before,row.id+' input unchanged');}
 const numeric={kind:'scoutingValue',min:37,coef:4,failBelow:33},before=JSON.stringify(canonicalLos);assert.deepEqual(routeAuditNumericCondition(canonicalLos),numeric);assert.equal(JSON.stringify(canonicalLos),before);
 for(const flag of [undefined,false,1,'true']){const los={...canonicalLos,preserveRandomBand:flag},snapshot=JSON.stringify(los);assert.deepEqual(routeAuditNumericCondition(los),{kind:'scoutingValue',min:37,coef:4});assert.equal(JSON.stringify(los),snapshot);}
 const exemption={kind:'minSpeed',rank:15},conditional={...canonicalLos,exemptWhen:exemption,exemptNote:'source-scoped exemption'},snapshot=JSON.stringify(conditional);assert.deepEqual(routeAuditNumericCondition(conditional),{any:[exemption,numeric],reason:'source-scoped exemption'});assert.equal(JSON.stringify(conditional),snapshot);
 const {c,data,preset}=registryContext();c.hdFERouteRequirementData=()=>data;c.hdFERouteShips=()=>[];c.hdFEGameMatch=()=>({status:'ready'});c.hdFEAssigned=()=>[];c.localStorage={getItem:()=>null};
 for(const name of ['hdFEBranchPredicate','hdFEScoutingExemption','hdFEScouting','hdFEPlanScouting','hdFERouteContract'])loadFunction(name,c);
 const plan={map:'7-4',preset,ships:[],score:100,sourceScore:100},input=JSON.stringify(plan),contract=c.hdFERouteContract(plan),check=contract.checks.find(x=>x.condition.kind==='scoutingValue');assert.ok(check);assert.deepEqual(plain(check.condition),numeric);assert.deepEqual(plain(check.condition),routeAuditNumericCondition(canonicalLos));assert.equal(check.status,'manual');
 for(const result of [c.hdFEScouting(plan,[]),c.hdFEPlanScouting(plan,[])]){assert.equal(result.status,'manual');assert.equal(result.available,false);assert.equal(result.reason,'formula');assert.equal(result.score,null);assert.equal(result.coef,4);}assert.equal(JSON.stringify(plan),input);
});
