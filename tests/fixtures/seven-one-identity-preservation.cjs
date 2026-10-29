'use strict';
function hd71CompareEditorIdentities(initialProjectionText, actualShips, expectedOriginalRows, expectedExtraBlankRows) {
 const fields=['ship','rosterId','gameShipId','masterId','metadata'];
 let phase='parse',beforeLength=null,afterLength=Array.isArray(actualShips)?actualShips.length:null;
 try {
  const initial=JSON.parse(initialProjectionText);
  beforeLength=Array.isArray(initial)?initial.length:null;
  phase='shape';
  if(!Array.isArray(initial)||!Array.isArray(actualShips)||initial.length>128||actualShips.length>128)throw Error('shape');
  const own=(o,k)=>o!==null&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,k);
  const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
  const type=v=>v===null?'null':Array.isArray(v)?'array':typeof v;
  let visits=0;
  function exact(a,b){
   if(++visits>10000)throw Error('budget');
   if(Object.is(a,b))return true;
   if(type(a)!==type(b)||a===null||b===null||typeof a!=='object')return false;
   const ak=Object.keys(a),bk=Object.keys(b);
   if(ak.length!==bk.length||ak.some((k,i)=>k!==bk[i]))return false;
   return ak.every(k=>exact(a[k],b[k]));
  }
  const pureBlank=o=>record(o)&&Object.keys(o).length===3&&Object.keys(o).every(k=>['ship','masterId','gear'].includes(k))&&own(o,'ship')&&o.ship===''&&own(o,'masterId')&&typeof o.masterId==='number'&&Object.is(o.masterId,0)&&own(o,'gear')&&o.gear==='';
  const real=o=>record(o)&&typeof o.ship==='string'&&o.ship.length>0;
  const game=o=>record(o)&&typeof o.gameShipId==='number'&&Number.isSafeInteger(o.gameShipId)&&o.gameShipId>0;
  const roster=o=>record(o)&&typeof o.rosterId==='string'&&o.rosterId.length>0;
  const anchor=(a,b)=>(game(a)||roster(a))&&(!game(a)||game(b)&&a.gameShipId===b.gameShipId)&&(!roster(a)||roster(b)&&a.rosterId===b.rosterId);
  function duplicates(rows,key,present){
   const seen=new Map();for(const row of rows)if(present(row))seen.set(row[key],(seen.get(row[key])||0)+1);
   return [...seen.values()].reduce((n,c)=>n+Math.max(0,c-1),0);
  }
  phase='compare';
  const perOriginal=initial.map((before,index)=>{
   const after=actualShips[index],fieldComparison={};
   for(const field of fields){const bp=own(before,field),ap=own(after,field);fieldComparison[field]={presentBefore:bp,presentAfter:ap,typeBefore:bp?type(before[field]):'missing',typeAfter:ap?type(after[field]):'missing',exact:bp===ap&&(!bp||exact(before[field],after[field]))};}
   const exactAnchorMatches=actualShips.flatMap((row,i)=>anchor(before,row)?[i]:[]);
   const partialAnchorMatches=actualShips.flatMap((row,i)=>(game(before)&&game(row)&&before.gameShipId===row.gameShipId||roster(before)&&roster(row)&&before.rosterId===row.rosterId)?[i]:[]);
   const hasAnchor=game(before)||roster(before);
   return {index,rowPresent:record(after),fields:fieldComparison,allFieldsExact:fields.every(k=>fieldComparison[k].exact),recordedAnchorStatus:!hasAnchor?'unavailable':exactAnchorMatches.length===1?'unique':exactAnchorMatches.length>1?'duplicate':partialAnchorMatches.length?'partial':'not-found',matchedActualIndex:exactAnchorMatches.length===1?exactAnchorMatches[0]:null,exactAnchorMatchCount:exactAnchorMatches.length,partialAnchorMatchCount:partialAnchorMatches.length};
  });
  const extras=actualShips.slice(initial.length).map((row,i)=>({index:initial.length+i,pureBlank:pureBlank(row),kind:pureBlank(row)?'pure-blank':real(row)?'real-ship':'other-or-unresolved'}));
  const duplicateGameIds=duplicates(actualShips,'gameShipId',game),duplicateRosterIds=duplicates(actualShips,'rosterId',roster);
  const allOriginalFieldsExact=actualShips.length>=initial.length&&perOriginal.every(r=>r.allFieldsExact);
  const allExtraRowsPureBlank=extras.every(r=>r.pureBlank);
  const allAnchorsUnique=perOriginal.every(r=>r.recordedAnchorStatus==='unique');
  const anchorOrderExact=allAnchorsUnique?perOriginal.every(r=>r.matchedActualIndex===r.index):null;
  const unmatchedOriginalCount=perOriginal.filter(r=>r.recordedAnchorStatus==='not-found').length;
  const partialOriginalCount=perOriginal.filter(r=>r.recordedAnchorStatus==='partial'||r.recordedAnchorStatus==='unavailable').length;
  const unexpectedRecordedIndividualsCount=actualShips.filter(row=>real(row)&&(game(row)||roster(row))&&!initial.some(before=>anchor(before,row))).length;
  const noIdentityAnomalyObserved=allOriginalFieldsExact&&allExtraRowsPureBlank&&allAnchorsUnique&&anchorOrderExact&&duplicateGameIds===0&&duplicateRosterIds===0&&unexpectedRecordedIndividualsCount===0;
  const editorContractScopeValid=Number.isInteger(expectedOriginalRows)&&expectedOriginalRows>=1&&expectedOriginalRows<=7&&(expectedExtraBlankRows===0||expectedExtraBlankRows===1);
  const editorContractRetained=editorContractScopeValid&&beforeLength===expectedOriginalRows&&afterLength===expectedOriginalRows+expectedExtraBlankRows&&extras.length===expectedExtraBlankRows&&noIdentityAnomalyObserved;
  return {status:'ok',collectionFailures:0,editorContractScopeValid,editorContractRetained,expectedOriginalRows,expectedExtraBlankRows,beforeLabel:'initial-before-apply-and-edit',beforeArrayLength:beforeLength,afterArrayLength:afterLength,initialRealRows:initial.filter(real).length,actualRealRows:actualShips.filter(real).length,perOriginal,allOriginalFieldsExact,anchorOrderExact,extraRows:extras,extraRowsCount:extras.length,allExtraRowsPureBlank,onlyPureBlankAppend:allOriginalFieldsExact&&actualShips.length>initial.length&&allExtraRowsPureBlank,missingPositionCount:perOriginal.filter(r=>!r.rowPresent).length,unmatchedOriginalByRecordedAnchorsCount:unmatchedOriginalCount,unresolvedOriginalByRecordedAnchorsCount:partialOriginalCount,duplicateGameIdCount:duplicateGameIds,duplicateRosterIdCount:duplicateRosterIds,unexpectedRecordedIndividualsCount,missingOriginalStatus:allAnchorsUnique?'not-observed':'unresolved-or-missing-recorded-identity',replacementStatus:noIdentityAnomalyObserved?'not-observed':'identity-difference-or-order-change-needs-classification',duplicateStatus:duplicateGameIds||duplicateRosterIds?'recorded-duplicate':actualShips.some(row=>real(row)&&!game(row)&&!roster(row))?'unresolved':'not-observed',noIdentityAnomalyObserved,timingInfluence:'extra synchronous local comparisons and metadata serialization; no added clock/timer/wait/read/API operation'};
 } catch {
  return {status:'collection-failed',collectionFailures:1,editorContractRetained:false,phase,beforeLabel:'initial-before-apply-and-edit',beforeArrayLength:beforeLength,afterArrayLength:afterLength};
 }
}
module.exports={hd71CompareEditorIdentities};
