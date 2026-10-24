'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function load(file,name,context){
 const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);
 vm.runInNewContext(source.slice(start,end<0?undefined:end),context);return context[name];
}
test('candidate scouting with unknown bonus carries no numeric result or ready checks; known arithmetic is unchanged',()=>{
 const raw={status:'ready',available:true,score:49.458745,coef:1,checks:[{safe:49,status:'ready',score:49.458745}]};
 let match='manual';const c={hdFEScouting:()=>raw,hdFEGameMatch:()=>({status:match}),hdFERouteContract:()=>({checks:[{condition:{kind:'scoutingValue'}}]}),hdFEBranchRoute:()=>({checks:[]})},verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',c);
 const unknown=verify({},[]);assert.equal(unknown.status,'manual');assert.equal(unknown.score,null);assert.equal(unknown.available,false);assert.equal(unknown.checks[0].score,undefined);assert.equal(unknown.checks[0].status,undefined);assert.equal(unknown.checks[0].safe,49);
 assert.equal(raw.score,49.458745);assert.equal(raw.checks[0].status,'ready');match='ready';assert.equal(verify({},[]),raw);
});
test('unregistered numerical reference tools keep their arithmetic and do not invent a verified route verdict',()=>{
 const raw={available:true,score:17,status:'missing'},verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',{hdFEScouting:()=>raw,hdFERouteContract:()=>null,hdFEBranchRoute:()=>({checks:[]}),hdFEGameMatch:()=>{throw Error('no registered scouting predicate')}});assert.equal(verify({},[]),raw);
});
test('missing synchronized inputs and routes without a scouting condition retain their original unknown/not-required result',()=>{
 for(const raw of [{status:'manual',available:false,score:null,reason:'sync'},{status:'ready',available:false,notRequired:true,score:null}]){
  const verify=load('fleet-readiness-evaluator.js','hdFEPlanScouting',{hdFEScouting:()=>raw,hdFEGameMatch:()=>{throw Error('not needed')}});assert.equal(verify({},[]),raw);
 }
});
test('unknown numeric goals are not converted to equipment deficits; measured deficits remain actionable',()=>{
 const select=load('owned-equipment-planner.js','hdOCShortageGoals',{}),unknown={kind:'los-value',count:null,minCount:49,ok:false,unresolved:true},missing={kind:'los-value',count:48,minCount:49,ok:false},ready={kind:'los-value',count:50,minCount:49,ok:true};
 const rows=Array.from(select({goals:[unknown,missing,ready,{kind:'air-value',ok:false,unresolved:true},{kind:'drum-ships',ok:false}]}));assert.equal(rows.length,2);assert.equal(rows[0],missing);assert.equal(rows[1].kind,'drum-ships');assert.equal(unknown.count,null);
});
test('calculator inherits the manual route check until explicit editing; edited arithmetic remains a reference, not a route verdict',()=>{
 const issue=load('fleet-calculator.js','hdFCProposalScoutingIssue',{}),s={proposal:{routeAssessment:{contract:{checks:[{condition:{kind:'scoutingValue'},status:'manual',detail:'bonus unknown'}]}}}};
 assert.equal(issue(s),'bonus unknown');s.proposal.edited=true;assert.equal(issue(s),'');assert.equal(s.proposal.routeAssessment.contract.checks[0].status,'manual');
 s.proposal.edited=false;s.proposal.routeAssessment.contract.checks[0].status='missing';assert.equal(issue(s),'');assert.equal(issue({}), '');
});

test('equal-score scouting guidance uses known synchronized gear distance without inventing a LOS result',()=>{
 let match={fleetMatch:true,unknown:0,gearMismatch:3};const distance=load('owned-equipment-planner.js','hdOCScoutingDistance',{hdFEGameMatch:()=>match}),measure={goals:[{kind:'los-value',count:null,unresolved:true}]};
 assert.equal(distance({},measure),3);match.gearMismatch=1;assert.equal(distance({},measure),1);assert.equal(measure.goals[0].count,null);
 match.unknown=1;assert.equal(distance({},measure),null);match.unknown=0;match.fleetMatch=false;assert.equal(distance({},measure),null);assert.equal(distance({},{goals:[{kind:'los-value',count:49,ok:true}]}),null);
});
