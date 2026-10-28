'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// A finite synthetic synchronized AS1+SS/SSV5 alternative, not real-game stats.
// Bare LOS41/HQ120 and two unstarred recon6 yield independently:
// 6*sqrt(41)+4*(2*6*1.2)-ceil(120*.4)=48.018745424597086.
// One omitted saved recon gives19.21874542459709; changed-fit bonus stays
// manual until the same synchronized gear is restored. Stock contains4 pieces.
const readyScore=6*Math.sqrt(41)+4*(2*6*1.2)-48,stockScore=6*Math.sqrt(41)-48;
for(const state of ['ready','stock','unknown'])test(`6-1 AFGHK ${state} keeps prior branches and scouting distinctions through save and load`,async({page},info)=>{
 const index=0;
 const evidence={state,index,scope:'6-1/index0/AFGHK; source-backed AS1+SS/SSV5 alternative, synthetic bareLOS41/HQ120, finite4 equipment pieces; not native-game stats, arrival, optimality or victory proof',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded existing test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>{
   const u=new URL(r.request().url());
   const version=(u.origin==='https://raw.githubusercontent.com'&&u.pathname==='/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json')||(u.origin==='http://127.0.0.1:4173'&&u.pathname==='/app-version.json');
   if(r.request().method()==='GET'&&version)return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:versionFixture.version,build:versionFixture.build})});
   return ['localhost','127.0.0.1'].includes(u.hostname)?r.continue():r.fulfill({status:204,body:''});
  });
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const ref=await page.evaluate(({state,index,installSource})=>{
   (0,eval)('('+installSource+')')();
   const names=['大鯨','伊58改','伊19改','伊8改','伊26改',state==='unknown'?'合成・6-1艦情報未登録':'伊47改'];
   const recon='零式水上観測機',torpedo='61cm四連装(酸素)魚雷';
   if(hdFEFind(recon)?.stats?.索敵!==6)throw Error('fixture requires documented recon6 scouting stat');
   const equipped=names.map((_,i)=>i===0?[recon,recon]:i===1?[torpedo,torpedo]:[]);
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),labels=Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(equipped[i][j]||''):'');
    return {id:'six-one-'+i,name,masterId:master?.id||0,gameShipId:19100+i,level:99,gameLos:41+labels.reduce((n,label)=>n+(Number(hdFEFind(label)?.stats?.索敵)||0),0),gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:labels,gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(state==='ready')for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'6-1':[{id:'six-one',name:'合成：AS1潜水5のAFGHK索敵25',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['6-1'].presets[index]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===5?'合成・6-1性能未登録装備':r.gameGearSlots.map((s,j)=>(state==='ready'&&i===0&&j===0)?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   // An unrelated sentinel, not proof that a new procurement plan is durable.
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('6-1',index);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {shipNames:names,custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['6-1'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['6-1'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('6-1');
  await page.locator('#hdMapStrategyRoute').selectOption(String(index));
  await page.locator('#hdMapStrategyFleet').selectOption('six-one');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(index=>{
   const built=hdOCBuild(hdOCContext('6-1','six-one',index)),holder=document.createElement('div'),paths=[['START','A','F','G','H','K']];
   holder.innerHTML=hdMapSvg('6-1',MAP_DETAILS['6-1']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['6-1'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),speeds:built.plan.ships.map(hdFEShipSpeed),measure:hdOCMeasure(built.plan,hdSEChecks('6-1').rows,built.unknown),recon:built.plan.ships.flatMap(s=>s.items).filter(x=>x.name==='零式水上観測機').length,gameMatch:hdFEGameMatch(built.plan),scouting:hdFEPlanScouting(built.plan,hdOCAssigned(built.plan)),referenceScouting:hdFEScouting(built.plan,hdOCAssigned(built.plan)),preservationIssues:built.plan.preservationIssues||[],diagram};
  },index);
  expect(evidence.preflight.diagram).toMatchObject({bossId:'K',orderedPathsExist:true});
  for(const node of ['START','A','F','G','H','K'])expect(evidence.preflight.diagram.nodes).toContain(node);
  if(state==='ready'){
   expect(evidence.preflight.recon).toBe(1);expect(evidence.preflight.gameMatch.status).toBe('partial');
   expect(evidence.preflight.referenceScouting.score).toBeCloseTo(readyScore-28.8,8);
   expect(evidence.preflight.scouting).toMatchObject({status:'manual',available:false,reason:'bonus',score:null});
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:false,unresolved:true,minCount:25});
  }
  if(state==='stock'){
   evidence.knownMismatch=await page.evaluate(index=>{
    const c=hdOCContext('6-1','six-one',index),make=names=>hdFEPlanFromSavedFleet('6-1',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),other=make(['阿武隈改二','伊58改','伊19改','伊8改','伊26改','伊47改']),mixed=make(['赤城改','加賀改','翔鶴改二','伊58改','伊19改','合成・別の未登録艦']),m=hdOCMeasure(other,hdSEChecks('6-1').rows);
    return {route:hdFERoute(other),knownAndUnknown:hdFERoute(mixed),reviews:hdOCReview(other,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   },index);
   expect(evidence.knownMismatch.route.status).toBe('missing');expect(evidence.knownMismatch.knownAndUnknown.status).toBe('missing');
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route').next).toContain('艦種・隻数');
   expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();
   await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(index=>{
    const r=HD_OC_CACHE.get('6-1:six-one:'+index);
    return {route:hdFERoute(r.plan),speeds:r.plan.ships.map(hdFEShipSpeed),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),gameMatch:hdFEGameMatch(r.plan),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,subNightTargets:g.subNightTargets})),preservationIssues:r.plan.preservationIssues||[]};
   },index);
   evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,status:'incomplete',exhaustive:false});
   expect(sample.measure.speedTarget).toBe(0);expect(sample.search.portSeed.maxOperations).toBe(800);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','radar-ships','drum-ships','cap-asw'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   // F→G is fixed in the diagram; H→K remains conditional on the coefficient4/25 scouting check.
   for(const text of ['始点→A','A→F','G→H'])await expect(checks).toContainText(text);
   await expect(checks).toContainText('33式索敵（分岐点係数4）25以上');
   const routeNotes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="6-1:${index}"]`);
   await expect(routeNotes).toHaveCount(1);await expect(routeNotes).toContainText('AFGHK');await expect(routeNotes).toContainText('25');
   await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.gear.flat().filter(x=>x.name==='零式水上観測機')).toHaveLength(2);
    expect(sample.usage['零式水上観測機@@0']).toBe(2);expect(sample.stock['零式水上観測機@@0']).toBe(2);
    expect(sample.scouting).toMatchObject({status:'ready',available:true,coef:4});expect(sample.scouting.score).toBeCloseTo(readyScore,8);
    expect(sample.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:true,minCount:25});
    expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:true,count:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');expect(sample.readiness.registeredReady).toBe(false);
   }else if(state==='stock'){
    expect(sample.route.status).toBe('missing');expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});
    expect(sample.scouting).toMatchObject({available:true,coef:4});expect(sample.scouting.score).toBeCloseTo(stockScore,8);
    const los=sample.measure.goals.find(g=>g.kind==='los-value');expect(los).toMatchObject({ok:false,minCount:25});expect(!!los.unresolved).toBe(false);expect(los.count).toBeCloseTo(stockScore,8);
    expect(sample.shortages.find(g=>g.kind==='los-value').shortfall).toBeCloseTo(25-stockScore,8);
    expect(sample.readiness.registeredReady).toBe(false);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'索敵分岐の安全域'})).toContainText('33式 -9.58 / 安全域 25');
    const losCard=panel.locator('.hd-oc-shortage').filter({hasText:'索敵分岐の安全域に必要なもの'});
    await expect(losCard).toContainText('33式 -9.58 / 安全域 25（あと 34.58）');
    for(const text of ['性能・搭載枠を増やす必要あり','装備候補：','装備可能な枠は最大','他の条件と共用'])await expect(losCard).toContainText(text);
    // Scouting-score points do not establish an equipment purchase count.
    await expect(losCard.locator('[data-hd-oc-procure]')).toHaveCount(0);
    await expect(losCard).not.toContainText(/34\.58\s*個|配備不足\s*35個|必要な\s*25個/);
    expect(sample.shortages.find(g=>g.kind==='los-value').stockGap).toBe(0);
    const night=sample.shortages.find(g=>g.kind==='cap-night-auto');
    expect(night).toMatchObject({shortfall:1,stock:{complete:false,recipe:{id:'sub-radar'},parts:[{part:'nightSubLate',have:0,need:1},{part:'nightSubRadar',have:0,need:1}]}});
    const targets=night.subNightTargets.filter(t=>t.status==='candidate');
    expect(targets.map(t=>t.ship)).toEqual(ref.shipNames.slice(1));
    for(const target of targets){expect(target.parts).toHaveLength(2);expect(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index))).toBe(true);for(const part of target.parts)expect(part.slots.every(slot=>slot.candidates.length>0)).toBe(true)}
    const nightCard=panel.locator('.hd-oc-shortage').filter({hasText:'夜戦CI（自動・艦種別）に必要なもの'});
    await expect(nightCard).toContainText('専用CI対応の後期型潜水艦魚雷：所持0 / この装備例に必要1・あと1個');
    await expect(nightCard).toContainText('潜水艦用電探（マスター装備種51）：所持0 / この装備例に必要1・あと1個');
    const destinations=nightCard.locator('[data-hd-oc-sub-night-targets]');
    for(const ship of ref.shipNames.slice(1))await expect(destinations).toContainText(ship+'：');
    for(const text of ['通常第1枠','通常第2枠','同じ潜水艦の別々の通常枠','1組の代替候補','経路必須ではありません','未所持品・現在装備との交換','全目標の同時配備や購入数量を保証しません'])await expect(destinations).toContainText(text);
    await expect(destinations).not.toContainText('大鯨：');
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'索敵装備：不足'})).toContainText('戦闘推奨');
   }else{
    expect(sample.route.status).toBe('manual');expect(sample.readiness.registeredReady).toBe(false);
    expect(sample.scouting).toMatchObject({status:'manual',available:false,reason:'sync',score:null});
    expect(sample.shortages.some(g=>g.kind==='los-value')).toBe(false);expect(sample.preservationIssues.length).toBeGreaterThan(0);
    await expect(checks).toContainText('未確認');await expect(panel.locator('[data-hd-oc-reviews]')).toContainText('艦娘情報が未登録');
   }
   evidence.ui={checks:await checks.innerText(),notes:await routeNotes.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};return sample;
  }
  evidence.stage='first-search';await search();
  await panel.locator('[data-hd-oc-apply]').click();
  if(state==='unknown'){
   await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();
   expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom);
  }else{
   await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();
   await page.locator('#customFleetPanel [data-cf-id="six-one"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['6-1'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['6-1'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
  },ref);
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
  if(state==='unknown')expect(evidence.saved.customExact).toBe(true);
  else{
   expect(evidence.saved.routeAssessment).toBe(state==='stock'?'missing':'ready');
   expect(evidence.saved.searchAssessment).toMatchObject({status:'incomplete',exhaustive:false});expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0);
  }
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());
  const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('6-1'));
  await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['6-1'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('6-1',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':state==='stock'?'missing':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
