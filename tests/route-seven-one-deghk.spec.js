'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {hd71CompareEditorIdentities}=require('./fixtures/seven-one-identity-preservation.cjs');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Source-explicit CL1/DD1/DE3 alternative; finite synthetic synchronized input.
// Four ASW pairs and one optional night example serve existing combat targets.
// Explicit opening-ASW0 is a user choice, separate from four equipment sets.
// BareLOS41/ASW90 are synthetic inputs, not native stats, OASW or victory proof.
function hd71Fixture(state){
 const id='seven-one',names=['矢矧改二乙','夕立改二','占守改','国後改',state==='unknown'?'合成・7-1艦情報未登録':'択捉改'];
 const sonar='三式水中探信儀',projector='三式爆雷投射機',torpedo='61cm四連装(酸素)魚雷';
 for(const name of [sonar,projector,torpedo])if(!hdFEFind(name))throw Error('fixture item missing: '+name);
 const gear=names.map((_,i)=>i===1?[torpedo,torpedo]:[sonar,projector]);
 const rows=names.map((name,i)=>{const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),slots=Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(gear[i][j]||''):'');return {id:id+'-'+i,name,masterId:master?.id||0,gameShipId:19710+i,level:99,gameLos:41+slots.reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.索敵)||0),0),gameAsw:90+slots.reduce((n,x)=>n+(Number(hdFEFind(x)?.stats?.対潜)||0),0),gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:slots,gameGearExpansion:'',metadata:{keep:i}}});
 const counts=new Map();if(state==='ready')for(const row of rows)for(const name of row.gameGearSlots)if(name)counts.set(name,(counts.get(name)||0)+1);
 localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
 localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
 localStorage.setItem(HD_OC_ASW_TARGET_KEY,JSON.stringify({'1-1:unrelated:0':6}));
 const fleet={id,memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['7-1'].presets[0]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:state==='unknown'&&i===4?'合成・7-1性能未登録装備':r.gameGearSlots.map((x,j)=>state==='ready'&&(i===0&&j===0||i===1&&j===1||i===4&&j===1)?'':x).join(' / '),metadata:{keep:i}}))};
 const fullFleet={...fleet,ships:fleet.ships.map((s,i)=>({...s,gear:state==='unknown'&&i===4?s.gear:rows[i].gameGearSlots.join(' / ')}))};
 return {state,id,names,rows,counts:[...counts],fleet,fullFleet};
}

for(const state of ['ready','stock','unknown'])test(`7-1 DEGHK ${state} keeps the source-backed DE alternative and optional ASW distinctions through save and load`,async({page},info)=>{
 const index=0;
 const evidence={state,index,path:'DEGHK',scope:'7-1 CL1/DD1/DE3, finite10 owned items in ready, explicit OASW0; synthetic synchronized bareLOS41/ASW90, not native stats, OASW, arrival, optimality or victory proof',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'existing bounded test-only workspace entry wrappers capture stacks; no new timer, wait, pin or forced click'},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{
   const u=new URL(r.request().url()),version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
   if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
   return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
  });
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(({state,fixtureSource,installSource})=>{
   (0,eval)('('+installSource+')')();const f=(0,eval)('('+fixtureSource+')')(state);
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));localStorage.setItem('harbordesk-land-base-v1',JSON.stringify({'7-1':{metadata:{keep:true},corps:[]},'1-1':{metadata:{keep:true},corps:[]}}));
   saveCustomFleets({'7-1':[{...f.fleet,name:'合成：軽巡1駆逐1海防3のDEGHK'},{id:'other',metadata:{keep:true},routeAssessment:{status:'manual',metadata:{keep:true}},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   // Unrelated sentinel only, not proof of a newly created procurement plan's durability.
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('7-1',0);hdMSNOpen('1-1');const all=loadCustomFleets();
   return {id:f.id,shipNames:f.names,custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1','harbordesk-land-base-v1',HD_OC_ASW_TARGET_KEY].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['7-1'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['7-1'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,fixtureSource:hd71Fixture.toString(),installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('7-1');await page.locator('#hdMapStrategyRoute').selectOption(String(index));await page.locator('#hdMapStrategyFleet').selectOption(ref.id);
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  await expect(panel.locator('[data-hd-oc-asw-target]')).toHaveValue('0');await expect(panel.locator('[data-hd-oc-asw-source]')).toContainText('明示0');
  evidence.preflight=await page.evaluate(id=>{
   const b=hdOCBuild(hdOCContext('7-1',id,0)),holder=document.createElement('div'),path=['S','D','E','G','H','K'];holder.innerHTML=hdMapSvg('7-1',MAP_DETAILS['7-1']);
   return {route:hdFERoute(b.plan),measure:hdOCMeasure(b.plan,hdSEChecks('7-1').rows,b.unknown),scouting:hdFEPlanScouting(b.plan,hdOCAssigned(b.plan)),gameMatch:hdFEGameMatch(b.plan),master:hdFEMasterValidation(b.plan),namedMaster:hdFEMasterValidation({...b.plan,ships:b.plan.ships.map(s=>({...s,items:s.items.filter(x=>x.name)}))}),preservationIssues:b.plan.preservationIssues||[],diagram:{bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),orderedPathsExist:path.slice(1).every((n,i)=>HD_MAP_GRAPHS['7-1'].edges.some(([a,b])=>a===path[i]&&b===n))}};
  },ref.id);
  expect(evidence.preflight.diagram).toMatchObject({bossId:'K',orderedPathsExist:true});for(const n of ['S','D','E','G','H','K'])expect(evidence.preflight.diagram.nodes).toContain(n);
  expect(evidence.preflight.scouting).toMatchObject({notRequired:true,available:false,score:null,reason:'not-required'});
  if(state==='ready'){
   expect(evidence.preflight.gameMatch.status).toBe('partial');expect(evidence.preflight.master).toMatchObject({valid:false,shipsChecked:5,invalid:[]});expect(evidence.preflight.master.unresolved.length).toBeGreaterThan(0);expect(evidence.preflight.master.unresolved.every(x=>x.name==='')).toBe(true);expect(evidence.preflight.namedMaster.valid).toBe(true);
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({minCount:4,count:2,ok:false,purpose:'recommendation'});
  }
  if(state==='stock'){
   evidence.knownMismatch=await page.evaluate(id=>{
    const c=hdOCContext('7-1',id,0),make=names=>hdFEPlanFromSavedFleet('7-1',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),bad=['長門改二','夕立改二','占守改','国後改','択捉改'],p=make(bad),mixed=make([...bad.slice(0,4),'合成・別の未登録艦']),m=hdOCMeasure(p,hdSEChecks('7-1').rows);return {route:hdFERoute(p),knownAndUnknown:hdFERoute(mixed),reviews:hdOCReview(p,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   },ref.id);
   expect(evidence.knownMismatch.route.status).toBe('missing');expect(evidence.knownMismatch.knownAndUnknown.status).toBe('missing');expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});expect(evidence.knownMismatch.reviews.find(x=>x.id==='route').next).toContain('艦種・隻数');expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(id=>{
    const r=HD_OC_CACHE.get('7-1:'+id+':0');return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),air:hdFEAirCheck('7-1',hdFEAir(hdOCAssigned(r.plan)),r.plan),reviews:hdOCReview(r.plan,r.measure),gameMatch:hdFEGameMatch(r.plan),names:r.plan.ships.map(s=>s.ship),openingAswCount:r.plan.openingAswCount,otherTarget:hdOCOaswTargets()['1-1:unrelated:0'],usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,aswTargets:g.aswTargets})),preservationIssues:r.plan.preservationIssues||[]};
   },ref.id);evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,exhaustive:false});expect(sample.search.portSeed.maxOperations).toBe(800);expect(sample.search.reasons.length).toBeGreaterThan(0);expect(sample.measure.speedTarget).toBe(0);expect(sample.openingAswCount).toBe(0);expect(sample.otherTarget).toBe(6);
   for(const [k,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[k]||0);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','radar-ships','drum-ships','port-attacker-set','los-value','air-value','制空','opening-asw'].includes(g.kind))).toBe(false);
   expect(sample.scouting).toMatchObject({notRequired:true,available:false,score:null,reason:'not-required'});expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({minCount:4,purpose:'recommendation'});expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({minCount:1,purpose:'recommendation'});
   await panel.locator('[data-hd-required-route] summary').click();const checks=panel.locator('[data-hd-required-route]'),notes=page.locator('#mapStrategyNavigator [data-hd-route-requirements="7-1:0"]');
   for(const text of ['DEGHK','海防','先制対潜','戦闘'])await expect(notes).toContainText(text);await expect(panel.locator('[data-hd-se-capability="cap-asw"]')).toHaveCount(1);await expect(panel.locator('[data-hd-oc-asw-target]')).toHaveValue('0');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    for(const [name,count]of [['三式水中探信儀',4],['三式爆雷投射機',4],['61cm四連装(酸素)魚雷',2]]){expect(sample.usage[name+'@@0']).toBe(count);expect(sample.stock[name+'@@0']).toBe(count)}
    expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:4,minCount:4});expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:true,count:1,minCount:1});expect(sample.measure.goals.every(g=>g.ok)).toBe(true);expect(sample.shortages).toEqual([]);expect(sample.search.status).toBe('targets-met');expect(sample.readiness.registeredReady).toBe(true);
   }else{
    expect(sample.search.status).toBe('incomplete');expect(sample.readiness.registeredReady).toBe(false);await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
    if(state==='stock'){
     expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});
     const asw=sample.shortages.find(g=>g.kind==='cap-asw');expect(asw).toMatchObject({shortfall:4,stock:{complete:false,recipe:{id:'sonar-projector'},parts:[{part:'sonar',have:0,need:4},{part:'projector',have:0,need:4}]}});expect(asw.aswTargets.filter(t=>t.status==='candidate').map(t=>t.ship)).toEqual(ref.shipNames);
     for(const t of asw.aswTargets){expect(t.parts.map(p=>({part:p.part,count:p.count}))).toEqual([{part:'sonar',count:1},{part:'projector',count:1}]);expect(t.parts[0].slots.some(a=>t.parts[1].slots.some(b=>a.index!==b.index))).toBe(true)}
     const card=panel.locator('.hd-oc-shortage').filter({hasText:'対潜シナジーに必要なもの'});for(const text of ['この装備例に必要4・あと4個','矢矧改二乙','占守改','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','同じ艦の別々の通常枠','以下は1組の搭載先の候補','全候補艦への配備を求めるものではありません','先制対潜の成立人数ではありません','他の目標と枠を共用','購入数量を保証しません'])await expect(card).toContainText(text);await expect(card.locator('[data-hd-oc-procure]')).toHaveCount(0);
    }else{
     expect(sample.route.status).toBe('manual');expect(sample.preservationIssues.length).toBeGreaterThan(0);await expect(checks).toContainText('未確認');await expect(panel.locator('[data-hd-oc-reviews]')).toContainText('艦娘情報が未登録');
    }
   }
   evidence.ui={checks:await checks.innerText(),notes:await notes.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};return sample;
  }
  evidence.stage='first-search';await search();await panel.locator('[data-hd-oc-apply]').click();
  if(state==='unknown'){await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom)}
  else{await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();await page.locator(`#customFleetPanel [data-cf-id="${ref.id}"] [data-cf-edit]`).click();await page.locator('#customFleetMemo').fill('keep memo / edited');await page.locator('#customFleetDialog button[value="default"]').click()}
  evidence.saved=await page.evaluate(({ref,identityCompareSource,expectedExtraBlankRows})=>{const all=loadCustomFleets(),f=all['7-1'][0];const identityComparison=(0,eval)('('+identityCompareSource+')')(ref.identities,f.ships,5,expectedExtraBlankRows);return {identityComparison,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['7-1'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,openingAswCount:f.openingAswCount,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom}},{ref,identityCompareSource:hd71CompareEditorIdentities.toString(),expectedExtraBlankRows:state==='unknown'?0:1});
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:state==='unknown',metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited',openingAswCount:0});if(state==='unknown')expect(evidence.saved.customExact).toBe(true);else{expect(evidence.saved.routeAssessment).toBe('ready');expect(evidence.saved.searchAssessment).toMatchObject({status:state==='ready'?'targets-met':'incomplete',exhaustive:false});expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0)}

  function assertIdentityRetention(comparison){
   const extra=state==='unknown'?0:1;
   expect(comparison).toMatchObject({status:'ok',collectionFailures:0,editorContractScopeValid:true,editorContractRetained:true,expectedOriginalRows:5,expectedExtraBlankRows:extra,beforeLabel:'initial-before-apply-and-edit',beforeArrayLength:5,afterArrayLength:5+extra,initialRealRows:5,actualRealRows:5,allOriginalFieldsExact:true,anchorOrderExact:true,extraRowsCount:extra,allExtraRowsPureBlank:true,onlyPureBlankAppend:extra===1,missingPositionCount:0,unmatchedOriginalByRecordedAnchorsCount:0,unresolvedOriginalByRecordedAnchorsCount:0,duplicateGameIdCount:0,duplicateRosterIdCount:0,unexpectedRecordedIndividualsCount:0,missingOriginalStatus:'not-observed',replacementStatus:'not-observed',duplicateStatus:'not-observed',noIdentityAnomalyObserved:true});
   expect(comparison.perOriginal).toHaveLength(5);
   for(const [index,row]of comparison.perOriginal.entries()){
    expect(row).toMatchObject({index,rowPresent:true,allFieldsExact:true,recordedAnchorStatus:'unique',matchedActualIndex:index,exactAnchorMatchCount:1,partialAnchorMatchCount:1});
    for(const field of ['ship','rosterId','gameShipId','masterId','metadata']){expect(row.fields[field]).toMatchObject({presentBefore:true,presentAfter:true,exact:true});expect(row.fields[field].typeAfter).toBe(row.fields[field].typeBefore)}
   }
   expect(comparison.extraRows).toEqual(extra?[{index:5,pureBlank:true,kind:'pure-blank'}]:[]);
  }
  assertIdentityRetention(evidence.saved.identityComparison);
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('7-1'));await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('0');
  evidence.stage='after-load-search';await search();evidence.load=await page.evaluate(({ref,saved,doc,identityCompareSource,expectedExtraBlankRows})=>{const f=loadCustomFleets()['7-1'][0];const identityComparison=(0,eval)('('+identityCompareSource+')')(ref.identities,f.ships,5,expectedExtraBlankRows);return {identityComparison,sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('7-1',f)).status,searchAssessment:f.searchAssessment,openingAswCount:f.openingAswCount}},{ref,saved,doc,identityCompareSource:hd71CompareEditorIdentities.toString(),expectedExtraBlankRows:state==='unknown'?0:1});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':'ready',openingAswCount:0});if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);assertIdentityRetention(evidence.load.identityComparison);expect(errors).toEqual([]);evidence.stage='completed';
 }finally{try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
});
