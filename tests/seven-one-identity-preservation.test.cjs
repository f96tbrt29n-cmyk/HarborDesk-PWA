'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {hd71CompareEditorIdentities:compare}=require('./fixtures/seven-one-identity-preservation.cjs');
const rows=(count=5)=>Array.from({length:count},(_,i)=>({ship:'identity-contract-ship-'+i,rosterId:'identity-contract-roster-'+i,gameShipId:101+i,masterId:1001+i,metadata:{privateMarker:'not-for-output',keep:i},gear:'equipment-'+i}));
const project=x=>JSON.stringify(x.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})));
const blank=()=>({ship:'',masterId:0,gear:''});
function mergeEditor(previous,incoming){
 const source=fs.readFileSync(path.join(__dirname,'../custom-fleets.js'),'utf8'),start=source.indexOf('function cfMergeEditedShips('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0&&end>start);
 const context=vm.createContext({});vm.runInContext(source.slice(start,end)+'\nthis.merge=cfMergeEditedShips;',context);
 return context.merge(previous,incoming);
}
test('memo-only editor normalization adds exactly one pure empty sixth row and preserves all five recorded individuals',()=>{
 const before=rows(),incoming=before.map(({ship,masterId,gear})=>({ship,masterId,gear})),merged=mergeEditor(before,incoming),stored=JSON.parse(JSON.stringify(merged.ships)),r=compare(project(before),stored,5,1);
 assert.equal(merged.changed,false);assert.equal(stored.length,6);assert.equal(r.editorContractRetained,true);assert.equal(r.onlyPureBlankAppend,true);assert.equal(r.actualRealRows,5);assert.equal(r.anchorOrderExact,true);assert.equal(r.duplicateStatus,'not-observed');assert.notEqual(project(stored),project(before));
 assert.equal(r.perOriginal.flatMap(x=>Object.values(x.fields)).filter(x=>x.exact&&x.presentBefore&&x.presentAfter).length,25);assert.deepEqual(r.extraRows,[{index:5,pureBlank:true,kind:'pure-blank'}]);
});
test('unchanged six-row editor and unedited five-row safe-abort have separate exact schemas',()=>{
 const six=rows(6),merged=mergeEditor(six,six.map(({ship,masterId,gear})=>({ship,masterId,gear})));assert.equal(compare(project(six),JSON.parse(JSON.stringify(merged.ships)),6,0).editorContractRetained,true);
 const five=rows();assert.equal(compare(project(five),structuredClone(five),5,0).editorContractRetained,true);assert.equal(compare(project(five),[...five,blank()],5,0).editorContractRetained,false);assert.equal(compare(project(five),five,5,1).editorContractRetained,false);assert.equal(compare(project(five),[...five,blank(),blank()],5,1).editorContractRetained,false);
});
test('four recorded ships gain exactly two strict blank editor rows while an unedited safe-abort stays four rows',()=>{
 const before=rows(4),incoming=before.map(({ship,masterId,gear})=>({ship,masterId,gear})),merged=mergeEditor(before,incoming),stored=JSON.parse(JSON.stringify(merged.ships)),r=compare(project(before),stored,4,2);
 assert.equal(merged.changed,false);assert.equal(r.editorContractScopeValid,true);assert.equal(r.editorContractRetained,true);assert.equal(r.beforeArrayLength,4);assert.equal(r.afterArrayLength,6);assert.equal(r.initialRealRows,4);assert.equal(r.actualRealRows,4);assert.equal(r.onlyPureBlankAppend,true);assert.equal(r.anchorOrderExact,true);assert.equal(r.noIdentityAnomalyObserved,true);
 assert.equal(r.perOriginal.length,4);assert.equal(r.perOriginal.flatMap(x=>Object.values(x.fields)).filter(x=>x.exact&&x.presentBefore&&x.presentAfter&&x.typeBefore===x.typeAfter).length,20);
 for(const [index,row]of r.perOriginal.entries()){assert.equal(row.index,index);assert.equal(row.recordedAnchorStatus,'unique');assert.equal(row.matchedActualIndex,index);assert.equal(row.exactAnchorMatchCount,1);assert.equal(row.partialAnchorMatchCount,1)}
 assert.deepEqual(r.extraRows,[{index:4,pureBlank:true,kind:'pure-blank'},{index:5,pureBlank:true,kind:'pure-blank'}]);
 assert.equal(compare(project(before),structuredClone(before),4,0).editorContractRetained,true);
 for(const actual of [[...before,blank()],[...before,blank(),blank(),blank()]])assert.equal(compare(project(before),actual,4,2).editorContractRetained,false);
 for(const originalRows of [1,2,3,5,6,7]){const initial=rows(originalRows),actual=[...initial,blank(),blank()],bad=compare(project(initial),actual,originalRows,2);assert.equal(bad.editorContractScopeValid,false);assert.equal(bad.editorContractRetained,false)}
 const notFourReal=rows(4);notFourReal[3].ship='';assert.equal(compare(project(notFourReal),[...notFourReal,blank(),blank()],4,2).editorContractRetained,false);
});
test('four-plus-two compares every original field at every position, including metadata structure and recorded anchor order',()=>{
 const before=rows(4),fields=['ship','rosterId','gameShipId','masterId','metadata'];
 for(let index=0;index<4;index++)for(const field of fields)for(const change of ['missing','type','value']){
  const actual=[...structuredClone(before),blank(),blank()];
  if(change==='missing')delete actual[index][field];
  else if(change==='type')actual[index][field]=typeof actual[index][field]==='number'?String(actual[index][field]):typeof actual[index][field]==='string'?901:null;
  else actual[index][field]=field==='metadata'?{privateMarker:'not-for-output',keep:999}:typeof actual[index][field]==='number'?actual[index][field]+1000:actual[index][field]+'-changed';
  const r=compare(project(before),actual,4,2);assert.equal(r.perOriginal[index].fields[field].exact,false);assert.equal(r.editorContractRetained,false);
 }
 for(let index=0;index<4;index++){
  const metadata=[...structuredClone(before),blank(),blank()];metadata[index].metadata={keep:index,privateMarker:'not-for-output'};assert.equal(compare(project(before),metadata,4,2).editorContractRetained,false);
  const missing=[...structuredClone(before),blank(),blank()];delete missing[index];assert.equal(compare(project(before),missing,4,2).editorContractRetained,false);
  const duplicate=[...structuredClone(before),blank(),blank()];duplicate[index]=structuredClone(duplicate[(index+1)%4]);const d=compare(project(before),duplicate,4,2);assert.equal(d.editorContractRetained,false);assert.equal(d.duplicateGameIdCount,1);assert.equal(d.duplicateRosterIdCount,1);
  const replacement=[...structuredClone(before),blank(),blank()];replacement[index]={...replacement[index],ship:'replacement-individual',rosterId:'replacement-roster',gameShipId:901,masterId:1901};const r=compare(project(before),replacement,4,2);assert.equal(r.editorContractRetained,false);assert.equal(r.unmatchedOriginalByRecordedAnchorsCount,1);assert.equal(r.unexpectedRecordedIndividualsCount,1);
 }
 const reordered=[...structuredClone(before).reverse(),blank(),blank()],r=compare(project(before),reordered,4,2);assert.equal(r.allOriginalFieldsExact,false);assert.equal(r.anchorOrderExact,false);assert.equal(r.editorContractRetained,false);
});
test('both four-plus-two tail positions reject nonblank schemas, null, undefined and sparse holes independently',()=>{
 const before=rows(4),bad=[{ship:' ',masterId:0,gear:''},{ship:'',masterId:'0',gear:''},{ship:'',masterId:-0,gear:''},{ship:'',masterId:0,gear:'nonempty'},{ship:'',masterId:0,gear:'',metadata:null},{ship:'',masterId:0,gear:'',gameShipId:0},{ship:'new-real-ship',masterId:1900,gear:''},null,undefined];
 for(const index of [4,5])for(const extra of [...bad,'hole']){
  const actual=[...structuredClone(before),blank(),blank()];if(extra==='hole')delete actual[index];else actual[index]=extra;
  const r=compare(project(before),actual,4,2);assert.equal(r.extraRows.length,2);assert.equal(r.extraRows[index-4].index,index);assert.equal(r.extraRows[index-4].pureBlank,false);assert.equal(r.allExtraRowsPureBlank,false);assert.equal(r.editorContractRetained,false);
 }
 const bothHoles=[...structuredClone(before)];bothHoles.length=6;const r=compare(project(before),bothHoles,4,2);assert.deepEqual(r.extraRows,[{index:4,pureBlank:false,kind:'other-or-unresolved'},{index:5,pureBlank:false,kind:'other-or-unresolved'}]);assert.equal(r.editorContractRetained,false);
 const snapshot=structuredClone(before),text=project(before),output=JSON.stringify(compare(text,[...before,blank(),blank()],4,2));assert.deepEqual(before,snapshot);assert.equal(project(before),text);for(const secret of ['identity-contract-ship-','identity-contract-roster-','not-for-output','equipment-','1001','101'])assert.equal(output.includes(secret),false);
});
test('recorded ID normalization is not silently accepted by the retention contract',()=>{
 const before=rows(),incoming=before.map(({ship,masterId,gear})=>({ship,masterId,gear}));incoming[1].masterId+=100;const merged=mergeEditor(before,incoming),stored=JSON.parse(JSON.stringify(merged.ships)),r=compare(project(before),stored,5,1);
 assert.equal(stored[1].gameShipId,before[1].gameShipId);assert.equal(stored[1].rosterId,before[1].rosterId);assert.deepEqual(stored[1].metadata,before[1].metadata);assert.equal(stored[1].masterId,incoming[1].masterId);assert.equal(r.perOriginal[1].fields.masterId.exact,false);assert.equal(r.editorContractRetained,false);
 incoming[1].masterId=0;const fallback=JSON.parse(JSON.stringify(mergeEditor(before,incoming).ships));assert.equal(compare(project(before),fallback,5,1).editorContractRetained,true);
 for(const field of ['gameShipId','rosterId','masterId']){const actual=[...structuredClone(before),blank()];actual[2][field]=field==='rosterId'?'wrong-individual':String(actual[2][field]);assert.equal(compare(project(before),actual,5,1).editorContractRetained,false)}
});
test('missing, duplicate, reordered and replaced original individuals are all rejected',()=>{
 const before=rows(),variants=[];
 variants.push([...structuredClone(before).slice(0,4),blank()]);
 const duplicate=[...structuredClone(before),blank()];duplicate[2]=structuredClone(duplicate[1]);variants.push(duplicate);
 variants.push([...structuredClone(before).reverse(),blank()]);
 const replacement=[...structuredClone(before),blank()];replacement[2]={...replacement[2],ship:'replacement-individual',gameShipId:901,rosterId:'replacement-roster',masterId:1901};variants.push(replacement);
 for(const actual of variants)assert.equal(compare(project(before),actual,5,1).editorContractRetained,false);
 const changedIncoming=before.map(({ship,masterId,gear})=>({ship,masterId,gear}));changedIncoming[2]={ship:'intentional-new-ship',masterId:1902,gear:''};const merged=mergeEditor(before,changedIncoming);assert.equal(merged.changed,true);assert.equal(compare(project(before),JSON.parse(JSON.stringify(merged.ships)),5,1).editorContractRetained,false);
});
test('all five identity fields include property presence, exact types and nested metadata',()=>{
 const before=rows();for(const field of ['ship','rosterId','gameShipId','masterId','metadata']){
  const missing=[...structuredClone(before),blank()];delete missing[3][field];const r=compare(project(before),missing,5,1);assert.equal(r.perOriginal[3].fields[field].presentAfter,false);assert.equal(r.editorContractRetained,false);
 }
 for(const metadata of [null,{privateMarker:'not-for-output',keep:999},{keep:3,privateMarker:'not-for-output'}]){const actual=[...structuredClone(before),blank()];actual[3].metadata=metadata;assert.equal(compare(project(before),actual,5,1).editorContractRetained,false)}
});
test('the extra row must be the exact empty editor schema, never an unconditionally ignored sixth row',()=>{
 const before=rows();const bad=[{ship:' ',masterId:0,gear:''},{ship:'',masterId:'0',gear:''},{ship:'',masterId:0,gear:'nonempty'},{ship:'',masterId:0,gear:'',metadata:null},{ship:'',masterId:0,gear:'',gameShipId:0},{ship:'new-real-ship',masterId:1900,gear:''}];
 for(const extra of bad){const r=compare(project(before),[...structuredClone(before),extra],5,1);assert.equal(r.allExtraRowsPureBlank,false);assert.equal(r.editorContractRetained,false)}
});
test('collection failures and metadata output preserve source values without exposing them',()=>{
 const before=rows(),snapshot=structuredClone(before),text=project(before);assert.equal(compare('not JSON',before,5,1).status,'collection-failed');assert.equal(compare(text,null,5,1).editorContractRetained,false);assert.equal(compare(text,[...before,blank()],5,2).editorContractRetained,false);
 const r=compare(text,[...before,blank()],5,1);assert.deepEqual(before,snapshot);assert.equal(project(before),text);const output=JSON.stringify(r);for(const secret of ['identity-contract-ship-','identity-contract-roster-','not-for-output','equipment-','1001','101'])assert.equal(output.includes(secret),false);
});
test('normal save and same-document load both enforce the strict comparison while retaining the raw identity expression',()=>{
 const normal=fs.readFileSync(path.join(__dirname,'route-seven-one-deghk.spec.js'),'utf8');new vm.Script(normal);
 assert.equal((normal.match(/assertIdentityRetention\(evidence\.(saved|load)\.identityComparison\)/g)||[]).length,2);
 assert.ok(normal.includes("identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities"));assert.ok(normal.includes("identitiesExact:state==='unknown'"));assert.ok(normal.includes('editorContractRetained:true'));assert.ok(normal.includes('missingPositionCount:0'));assert.ok(normal.includes('duplicateGameIdCount:0'));assert.ok(normal.includes('duplicateRosterIdCount:0'));assert.ok(normal.includes('unexpectedRecordedIndividualsCount:0'));assert.ok(!normal.includes('/workspace/'));
 const first=fs.readFileSync(path.join(__dirname,'route-seven-three-first.spec.js'),'utf8');new vm.Script(first);assert.equal((first.match(/assertIdentityRetention\(evidence\.(saved|load)\.identityComparison\)/g)||[]).length,2);assert.ok(first.includes("identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities"));assert.ok(first.includes("identitiesExact:state==='unknown'"));assert.ok(first.includes('expectedOriginalRows:4'));assert.ok(first.includes('expect(comparison.perOriginal).toHaveLength(4)'));assert.ok(first.includes("[{index:4,pureBlank:true,kind:'pure-blank'},{index:5,pureBlank:true,kind:'pure-blank'}]"));assert.ok(first.includes("customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved"));assert.ok(!first.includes('/workspace/'));
});
test('first ACE capability scope filters second-gauge ASW guidance and leaves the legacy second and map-wide render unchanged',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../sortie-equipment-check.js'),'utf8'),start=source.indexOf('function hdSECapabilityHtml('),end=source.indexOf('\nfunction ',start+1);assert.ok(start>=0&&end>start);
 const profiles=[{kind:'cap-asw',baseKind:'対潜',label:'asw-second-only',reason:'asw reason'},{kind:'cap-night-auto',baseKind:'夜戦',label:'night-optional',reason:'night reason'}],routes=[{map:'7-3',index:0,path:'ACE',equipmentKinds:['夜戦']},{map:'7-3',index:1,path:'ACDGJP / ACDGIJP（G分岐未確認）',equipmentKinds:['対潜','夜戦','煙幕']}];
 const c=vm.createContext({hdMapPresetRequirements:(map,preset)=>routes[preset?.index],hdSEProfiles:()=>profiles,hdSPSFleets:()=>[],hdSEEsc:x=>String(x??''),hdSENightPolicyHtml:()=>'<i>night-policy</i>',hdSECapabilityStock:()=>null,hdSECapabilityMeasure:()=>({count:0}),HD_SE_RECIPES:{}});vm.runInContext(source.slice(start,end)+'\nthis.render=hdSECapabilityHtml;',c);
 const first=c.render('7-3','',null,{index:0}),second=c.render('7-3','',null,{index:1}),legacy=c.render('7-3','');assert.match(first,/data-hd-se-route-scope="ACE"/);assert.match(first,/P開放前/);assert.match(first,/夜戦1組/);assert.match(first,/通行の必須条件・全編成への必要十分数・購入数量を表しません/);assert.match(first,/night-optional/);assert.doesNotMatch(first,/asw-second-only/);assert.equal(second,legacy);assert.match(second,/asw-second-only/);assert.doesNotMatch(second,/data-hd-se-route-scope=/);
 const caller=fs.readFileSync(path.join(__dirname,'../owned-equipment-planner.js'),'utf8');assert.ok(caller.includes("['6-5','7-2'].includes(map)||map==='7-3'&&c.index===0"),'the owned panel must pass the selected preset only for the first 7-3 scope');
});
