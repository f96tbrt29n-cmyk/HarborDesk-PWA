/* Current 1-5 expectations layered over immutable historical browser inputs.
 * Source-independent approved deltas only: D→F requires AO0, and an unknown
 * family has no implicit ASW quantity; its test selects count3 in the real UI.
 * No generator result or arbitrary actual value is used to create expectations.
 */
'use strict';
const assert=require('node:assert/strict');
const LEGACY_UNITS=new Set(['one-five-middle','one-five-bbv-cl','one-five-bbv-cl2','one-five-cl2-dd2']);
const clone=value=>JSON.parse(JSON.stringify(value));
function currentOneFiveBrowserInputs(historical){
 assert.equal(LEGACY_UNITS.has(historical?.unit),true,'only four explicit historical cohorts');
 assert.equal(historical.preparationState,'model-observation-frozen','historical observation remains separately identified');
 const current=clone(historical);current.preparationState='historical-observation-with-explicit-current-deltas';
 current.currentExpectationBasis={historicalPreparationState:historical.preparationState,newAOZeroCondition:true,unknownCount3SelectedByActualUI:true,unknownRecommendationToStrategyIntentional:true,searchedValuesNewlyObserved:false};
 for(const state of ['known','stock','unknown'])for(const phase of ['initial','searched']){
  const expected=current.modelExpectation[state][phase];assert.ok(expected,'historical phase present');
  const route=expected.goals.find(g=>g.kind==='route-requirements');assert.ok(route);route.minCount+=1;if(state!=='unknown')route.count+=1;
  if(expected.requiredChecks){assert.equal(expected.requiredChecks.length,state==='unknown'?6:5);expected.requiredChecks.splice(2,0,state==='unknown'?{status:'manual',ok:false,unresolved:true}:{status:'ready',ok:true,unresolved:false})}
  if(state==='unknown'){
   const asw=expected.goals.find(g=>g.kind==='cap-asw');assert.ok(asw);assert.equal(asw.minCount,3);assert.equal(asw.purpose,'recommendation');asw.purpose='strategy';
   if(expected.requirements){const row=expected.requirements.find(g=>g.kind==='cap-asw');assert.ok(row);assert.equal(row.generatedFromMap,true);row.generatedFromMap=false}
  }
 }
 return current;
}
module.exports={currentOneFiveBrowserInputs};
