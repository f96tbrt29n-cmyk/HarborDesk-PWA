'use strict';
const {test,expect:baseExpect}=require('@playwright/test');
const expect=baseExpect.configure({timeout:12000}),versionFixture=require('../app-version.json'),fixture=require('./fixtures/two-five-ceio-browser-inputs.json');
const {hd71CompareEditorIdentities}=require('./fixtures/seven-one-identity-preservation.cjs');
test.setTimeout(45000);
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Literal source-derived gate expectations are separate from these deliberately
// synthetic synchronized observations. Allocation may restore the exact observed
// gun placement. The HQ-unknown case has a finite optional radar candidate;
// its allocation is permitted, but a changed loadout is never certified by the
// bare inputs. Numeric-band fixtures deliberately have no radar inventory.
function prepareCEIO(state,data){
 const config=data[state],id='two-five-ceio-'+state,gun=hdFEFind(data.gun),radar=hdFEFind(data.radar);
 if(!gun||Number(gun.stats?.索敵||0)!==0||!radar||radar.stats?.索敵!==7)throw Error('fixed synthetic equipment material unavailable');
 const rows=data.ships.map((expected,i)=>{
  const db=hdFEFindShip(expected.name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);
  if(!master||db.type!==expected.type||master.speed<10||!Number.isInteger(profile?.count)||profile.count<3)throw Error('fixed canonical six-hull fixture unavailable');
  const slots=Array(profile.count).fill('');if(i===2){if(!hdShipDbEquipCompatible(gun,db)||hdShipDbSlotRejects(profile,0,gun))throw Error('synthetic CL gun slot incompatible');slots[0]=data.gun;}
  return {id:id+'-'+i,name:expected.name,masterId:master.id,gameShipId:251100+i,level:data.level,gameSlotEx:0,gameLos:config.bareLos[i],gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i,nested:{order:['first','second']}}};
 });
 const inventory=[{name:data.gun,count:1,star:0},...(config.radarStock?[{name:data.radar,count:config.radarStock,star:0}]:[])];
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));
 localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(config.hq===null?{metadata:{keep:true}}:{admiralLevel:config.hq,metadata:{keep:true}}));
 localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(row=>({gameShipId:row.gameShipId,gearKnown:true}))}]));
 localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
 saveCustomFleets({'2-5':[{id,name:'合成：CEIO索敵区分',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['2-5'].presets[1]},metadata:{keep:true,nested:{order:['first','second']}},ships:rows.map((row,i)=>({ship:row.name,rosterId:row.id,gameShipId:row.gameShipId,masterId:row.masterId,gear:row.gameGearSlots.map((name,j)=>config.recoverObservedGun&&i===2&&j===0?'':name).join(' / '),metadata:row.metadata}))},{id:'other-same-map',routePreset:{...MAP_PLANS['2-5'].presets[0]},metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
 localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
 localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
 hdMapRouteSet('2-5',1);hdMSNOpen('1-1');const all=loadCustomFleets();
 return {id,keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(key=>[key,localStorage.getItem(key)]),other:JSON.stringify(all['2-5'].slice(1)),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['2-5'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
}

// Explicit allowlist: no stored bodies, gear arrays, exception text, trace or
// video is copied into this new shared candidate. Missing observations stay null.
function summary(evidence,project){
 const bool=x=>typeof x==='boolean'?x:null,count=x=>Number.isSafeInteger(x)&&x>=0?x:null;
 const marker=process.env.HD25_LOCAL_TRIAL_ONLY_NOT_CI_BINDING,hash=process.env.HD25_LOCAL_RUNTIME_MANIFEST_SHA256;
 const check=value=>value?Object.fromEntries(['sameDocument','customExact','sourcesExact','other','otherMap','procurement','otherPlanner','metadataExact','identityExact','gearMatchesProposal','assessmentExact','gateMatchesExpected','routeMatchesExpected'].map(k=>[k,bool(value[k])])):null;
 const identity=value=>value?{collectionFailures:count(value.collectionFailures),originalRows:count(value.beforeArrayLength),actualRows:count(value.afterArrayLength),originalsExact:bool(value.allOriginalFieldsExact),orderedAnchorsExact:bool(value.anchorOrderExact),extraRows:count(value.extraRowsCount),onlyBlankExtras:bool(value.allExtraRowsPureBlank),noIdentityAnomalyObserved:bool(value.noIdentityAnomalyObserved),exactIdentityFieldCount:Array.isArray(value.perOriginal)?value.perOriginal.reduce((n,row)=>n+['ship','rosterId','gameShipId','masterId','metadata'].filter(k=>row.fields?.[k]?.presentBefore===true&&row.fields[k].presentAfter===true&&row.fields[k].exact===true&&row.fields[k].typeBefore===row.fields[k].typeAfter).length,0):null}:null;
 return {schemaVersion:1,unit:'two-five-ceio-scouting',state:['random','guaranteed','unknown'].includes(evidence.state)?evidence.state:null,project:['chromium','webkit'].includes(project)?project:null,version:versionFixture.version,browserVersion:typeof evidence.browserVersion==='string'&&/^\d+(?:\.\d+){1,3}$/.test(evidence.browserVersion)?evidence.browserVersion:null,localTrialOnlyNotCIBinding:marker===undefined&&hash===undefined?false:marker==='true'?true:marker==='false'?false:null,localRuntimeManifestSHA256:typeof hash==='string'&&/^[a-f0-9]{64}$/.test(hash)?hash:null,stage:['boot','select-route','preflight','first-search','apply','memo-edit','saved-read','reload','after-load-search','load-read','completed'].includes(evidence.stage)?evidence.stage:null,pageerrorCount:Array.isArray(evidence.pageerrors)?evidence.pageerrors.length:null,searchSampleCount:Array.isArray(evidence.samples)?evidence.samples.length:null,samples:(evidence.samples||[]).map(x=>({examined:count(x.search?.examined),maxExamined:count(x.search?.maxExamined),depth:count(x.search?.depth),maxDepth:count(x.search?.maxDepth),gateMatchesExpected:bool(x.gateMatchesExpected),routeMatchesExpected:bool(x.routeMatchesExpected)})),saved:evidence.saved?{...check(evidence.saved),identity:identity(evidence.saved.identityComparison)}:null,load:evidence.load?{...check(evidence.load),identity:identity(evidence.load.identityComparison)}:null};
}

for(const state of ['random','guaranteed','unknown'])test(`2-5 CEIO scouting ${state} keeps gate classification through owned save edit and load`,async({page,browser},info)=>{
 const expected=fixture[state],evidence={state,scope:fixture.scope,browserVersion:browser.version(),stage:'boot',samples:[]},errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.route('**/*',r=>{
   const u=new URL(r.request().url()),version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
   if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
   return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
  });
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(({state,source,data})=>(0,eval)('('+source+')')(state,data),{state,source:prepareCEIO.toString(),data:fixture});
  evidence.stage='select-route';await page.locator('#hdMapStrategyMap').selectOption('2-5');await page.locator('#hdMapStrategyRoute').selectOption('1');await page.locator('#hdMapStrategyFleet').selectOption(ref.id);
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.stage='preflight';evidence.preflight=await page.evaluate(id=>{const b=hdOCBuild(hdOCContext('2-5',id,1));return {scouting:hdFEPlanScouting(b.plan,hdOCAssigned(b.plan)),gameMatch:hdFEGameMatch(b.plan),preservationIssues:b.plan.preservationIssues||[]}},ref.id);
  expect(evidence.preflight.preservationIssues).toEqual([]);
  if(expected.recoverObservedGun)expect(evidence.preflight.scouting.reason).toBe('bonus');else expect(evidence.preflight.scouting).toMatchObject({available:false,reason:'sync',missing:{hq:true}});
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(id=>{const r=HD_OC_CACHE.get('2-5:'+id+':1'),route=hdFERoute(r.plan),gate=r.measure.requiredChecks.find(c=>c.condition.kind==='scoutingValue');return {route,gate,scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),gameMatch:hdFEGameMatch(r.plan),measure:r.measure,readiness:r.readiness,search:r.search,master:hdFEMasterValidation(r.plan),gear:r.plan.ships.map(s=>s.items.map(x=>({name:x.name,star:x.star||0,slotIndex:x.slotIndex}))),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,stockGap:hdOCStockGap(g),purpose:g.purpose,shortfall:g.shortfall})),reviews:hdOCReview(r.plan,r.measure)}},ref.id);
   sample.gateMatchesExpected=sample.gate.status===expected.expectedGate;sample.routeMatchesExpected=sample.route.status===expected.expectedRoute;evidence.samples.push(sample);
   expect(sample.gate).toMatchObject({status:expected.expectedGate,ok:expected.expectedGate==='ready',condition:{kind:'scoutingValue',coef:1,min:34,failBelow:31}});expect(sample.route.status).toBe(expected.expectedRoute);
   expect(sample.master.valid).toBe(true);expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,exhaustive:false});for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   expect(sample.measure.requiredChecks.filter(c=>c.condition.kind!=='scoutingValue').every(c=>c.ok)).toBe(true);
   if(state==='unknown'){expect(sample.scouting).toMatchObject({available:false,status:'manual',reason:'sync',missing:{hq:true}});expect(sample.shortages.some(g=>g.kind==='los-value')).toBe(false);expect(['ready','partial']).toContain(sample.gameMatch.status);expect(sample.gate.detail).toContain(sample.gameMatch.status==='ready'?'司令部Lv':'ボーナス');}
   else{expect(sample.gameMatch.status).toBe('ready');expect(sample.scouting).toMatchObject({available:true,status:expected.expectedGate,score:expected.expectedScore,coef:1,hq:120});expect(sample.gear[2].find(x=>x.slotIndex===0)?.name).toBe(fixture.gun);expect(sample.gear.flat().some(x=>x.name===fixture.radar)).toBe(false);}
   // This is I's gate and the canonical registered scope, not a complete battle
   // preparation or a guarantee of arrival/victory. Independent optional goals
   // and the unselected air target remain visible.
   if(state!=='guaranteed')expect(sample.readiness.registeredReady).toBe(false);
   await panel.locator('[data-hd-required-route] summary').click();const required=panel.locator('[data-hd-required-route]');await expect(required).toContainText('係数1');
   if(state==='random'){expect(sample.gate.knownRandom).toBe(true);await expect(required).toContainText('ランダム');await expect(required).not.toContainText('33式索敵（分岐点係数1）34以上：不成立');expect(sample.shortages.some(g=>g.kind==='los-value')).toBe(false);}
   if(state==='unknown')await expect(required).toContainText(sample.gameMatch.status==='ready'?'司令部Lv':'ボーナス');
   if(expected.radarStock){const assigned=sample.gear.flat().filter(item=>item.name===fixture.radar).length;expect(assigned).toBeLessThanOrEqual(1);const options=panel.locator('[data-hd-oc-scouting-options]');await expect(options).toContainText(fixture.radar);await expect(options).toContainText(`登録1個 / 現在案${assigned}個 / 未使用${1-assigned}個`);await expect(options).toContainText('通常');await expect(options).toContainText('交換後の索敵値は未計算');await expect(options).toContainText('ボーナス差分');}
   evidence.ui={required:await required.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),options:await panel.locator('[data-hd-oc-scouting-options]').allInnerTexts()};return sample;
  }
  evidence.stage='first-search';const first=await search();const proposal=first.gear.map(items=>items.filter(x=>x.name).map(x=>({label:x.name+(x.star?' ★'+x.star:''),slotIndex:x.slotIndex})).sort((a,b)=>a.slotIndex-b.slotIndex));
  evidence.stage='apply';await panel.locator('[data-hd-oc-apply]').click();
  evidence.stage='memo-edit';await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator(`#customFleetPanel [data-cf-id="${ref.id}"] [data-cf-edit]`).click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click();
  evidence.stage='saved-read';const saved=await page.evaluate(({ref,proposal,compareSource})=>{const all=loadCustomFleets(),f=all['2-5'][0],identityComparison=(0,eval)('('+compareSource+')')(ref.identities,f.ships,6,0),plan=hdFEPlanFromSavedFleet('2-5',f),gate=hdOCRequiredChecks(plan).find(c=>c.condition.kind==='scoutingValue');return {raw:localStorage.getItem(CUSTOM_FLEET_KEY),assessment:f.routeAssessment,searchAssessment:f.searchAssessment,identityComparison,sourcesExact:ref.keys.every(([key,value])=>localStorage.getItem(key)===value),other:JSON.stringify(all['2-5'].slice(1))===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,metadataExact:JSON.stringify(f.metadata)===JSON.stringify({keep:true,nested:{order:['first','second']}}),identityExact:identityComparison.editorContractRetained,gearMatchesProposal:JSON.stringify(f.ships.map(s=>hdFEGearTokens(s.gear).map((label,slotIndex)=>({label,slotIndex})).filter(x=>x.label)))===JSON.stringify(proposal),memo:f.memo,gateStatus:gate.status,routeStatus:hdFERoute(plan).status}},{ref,proposal,compareSource:hd71CompareEditorIdentities.toString()});
  const savedRaw=saved.raw;delete saved.raw;evidence.saved=saved;saved.gateMatchesExpected=saved.gateStatus===expected.expectedGate;saved.routeMatchesExpected=saved.routeStatus===expected.expectedRoute;
  expect(saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,metadataExact:true,identityExact:true,gearMatchesProposal:true,memo:'keep memo / edited',gateMatchesExpected:true,routeMatchesExpected:true,assessment:{status:expected.expectedRoute}});assertIdentity(saved.identityComparison);
  const savedGate=saved.assessment.contract.checks.find(c=>c.condition.kind==='scoutingValue');expect(savedGate.status).toBe(expected.expectedGate);expect(savedGate.detail).toBe(first.gate.detail);expect(saved.searchAssessment.status).toBe(first.search.status);expect(saved.searchAssessment.reasons).toEqual(first.search.reasons);
  evidence.stage='reload';await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>hdMSNOpen('2-5'));await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('1');
  evidence.stage='after-load-search';await search();
  evidence.stage='load-read';evidence.load=await page.evaluate(({ref,savedRaw,doc,assessment,searchAssessment,compareSource})=>{const all=loadCustomFleets(),f=all['2-5'][0],plan=hdFEPlanFromSavedFleet('2-5',f),gate=hdOCRequiredChecks(plan).find(c=>c.condition.kind==='scoutingValue'),identityComparison=(0,eval)('('+compareSource+')')(ref.identities,f.ships,6,0);return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===savedRaw,sourcesExact:ref.keys.every(([key,value])=>localStorage.getItem(key)===value),other:JSON.stringify(all['2-5'].slice(1))===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,metadataExact:JSON.stringify(f.metadata)===JSON.stringify({keep:true,nested:{order:['first','second']}}),identityExact:identityComparison.editorContractRetained,identityComparison,assessmentExact:JSON.stringify(f.routeAssessment)===JSON.stringify(assessment)&&JSON.stringify(f.searchAssessment)===JSON.stringify(searchAssessment),gateStatus:gate.status,routeStatus:hdFERoute(plan).status}},{ref,savedRaw,doc,assessment:saved.assessment,searchAssessment:saved.searchAssessment,compareSource:hd71CompareEditorIdentities.toString()});
  evidence.load.gateMatchesExpected=evidence.load.gateStatus===expected.expectedGate;evidence.load.routeMatchesExpected=evidence.load.routeStatus===expected.expectedRoute;
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,metadataExact:true,identityExact:true,assessmentExact:true,gateMatchesExpected:true,routeMatchesExpected:true});assertIdentity(evidence.load.identityComparison);expect(evidence.samples).toHaveLength(2);expect(errors).toEqual([]);evidence.stage='completed';
 }finally{evidence.pageerrors=errors;const fs=require('node:fs/promises'),raw=info.outputPath('route-guidance-evidence.json'),safe=info.outputPath('route-guidance-summary.json');await fs.writeFile(raw,JSON.stringify(evidence,null,2)+'\n');await fs.writeFile(safe,JSON.stringify(summary(evidence,info.project.name),null,2)+'\n');await info.attach('route-guidance-evidence',{path:raw,contentType:'application/json'});await info.attach('route-guidance-summary',{path:safe,contentType:'application/json'});}
});

function assertIdentity(value){
 expect(value).toMatchObject({status:'ok',collectionFailures:0,editorContractScopeValid:true,editorContractRetained:true,expectedOriginalRows:6,expectedExtraBlankRows:0,beforeArrayLength:6,afterArrayLength:6,allOriginalFieldsExact:true,anchorOrderExact:true,extraRowsCount:0,allExtraRowsPureBlank:true,missingPositionCount:0,unmatchedOriginalByRecordedAnchorsCount:0,unresolvedOriginalByRecordedAnchorsCount:0,duplicateGameIdCount:0,duplicateRosterIdCount:0,unexpectedRecordedIndividualsCount:0,noIdentityAnomalyObserved:true});expect(value.perOriginal).toHaveLength(6);
 for(const [i,row]of value.perOriginal.entries()){expect(row).toMatchObject({index:i,rowPresent:true,recordedAnchorStatus:'unique',matchedActualIndex:i,exactAnchorMatchCount:1,partialAnchorMatchCount:1});for(const key of ['ship','rosterId','gameShipId','masterId','metadata']){expect(row.fields[key]).toMatchObject({presentBefore:true,presentAfter:true,exact:true});expect(row.fields[key].typeAfter).toBe(row.fields[key].typeBefore);}}
 expect(value.extraRows).toEqual([]);
}
