'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// A finite synthetic synchronized fixture, not actual-game stats or victory proof.
// CL flagship + second CL + fast BB + three DD is a source-backed BDCFN alternative.
// Two water fighters, one existing tank/amphibious example and one AA example
// are combat recommendations. Numeric fleet-air nodes/goal and base plan remain
// unselected and visibly unresolved; no zero-air fixture or mandatory four-plane
// base count is invented. BDCFN has no published numeric scouting requirement.
for(const state of ['ready','stock','unknown'])test(`6-4 BDCFN ${state} keeps branch and optional combat distinctions through save and load`,async({page},info)=>{
 const index=0;
 const evidence={state,index,scope:'6-4/index0/BDCFN; synthetic CLflagship+CL+BB+DD3 synchronized bareLOS41, finite7 owned items; fleet air target/base plan unselected; no native ship-stat or bonus proof; not native-game stats, arrival, optimality or victory proof',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded existing test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
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
   const names=['矢矧改二乙','能代改二','金剛改二','大潮改二','秋月改',state==='unknown'?'合成・6-4艦情報未登録':'霞改二'];
   const fighter='二式水戦改',tank='大発動艇(八九式中戦車＆陸戦隊)',amphibious='特二式内火艇';
   for(const name of [fighter,tank,amphibious,'10cm高角砲＋高射装置','13号対空電探改'])if(!hdFEFind(name))throw Error('fixture equipment must exist: '+name);
   const equipped=names.map((_,i)=>i===0?[fighter,fighter]:i===3?[tank,amphibious]:i===4?['10cm高角砲＋高射装置','10cm高角砲＋高射装置','13号対空電探改']:[]);
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),labels=Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(equipped[i][j]||''):'');
    return {id:'six-four-'+i,name,masterId:master?.id||0,gameShipId:19400+i,level:99,gameLos:41+labels.reduce((n,label)=>n+(Number(hdFEFind(label)?.stats?.索敵)||0),0),gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:labels,gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(state==='ready')for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   // Existing map entries avoid counting normal missing-key UI initialization as a preservation mismatch.
   // Empty corps leaves base strategy unconfigured; it is not a four-aircraft route requirement.
   localStorage.setItem('harbordesk-land-base-v1',JSON.stringify({'6-4':{metadata:{keep:true},corps:[]},'1-1':{metadata:{keep:true},corps:[]}}));
   saveCustomFleets({'6-4':[{id:'six-four',name:'合成：軽巡2隻のBDCFN代替',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['6-4'].presets[index]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===5?'合成・6-4性能未登録装備':r.gameGearSlots.map((s,j)=>state==='ready'&&(i===0&&j===0||i===3&&j===1)?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   // An unrelated sentinel, not proof that a new procurement plan is durable.
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('6-4',index);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {shipNames:names,custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1','harbordesk-land-base-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['6-4'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['6-4'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('6-4');
  await page.locator('#hdMapStrategyRoute').selectOption(String(index));
  await page.locator('#hdMapStrategyFleet').selectOption('six-four');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(index=>{
   const built=hdOCBuild(hdOCContext('6-4','six-four',index)),holder=document.createElement('div'),paths=[['S1','B','D','C','F','N']];
   holder.innerHTML=hdMapSvg('6-4',MAP_DETAILS['6-4']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['6-4'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),measure:hdOCMeasure(built.plan,hdSEChecks('6-4').rows,built.unknown),land:hdSECapabilityMeasure(built.plan,'cap-land-mixed'),air:hdFEAirCheck('6-4',hdFEAir(hdOCAssigned(built.plan)),built.plan),gameMatch:hdFEGameMatch(built.plan),scouting:hdFEPlanScouting(built.plan,hdOCAssigned(built.plan)),referenceScouting:hdFEScouting(built.plan,hdOCAssigned(built.plan)),preservationIssues:built.plan.preservationIssues||[],diagram};
  },index);
  expect(evidence.preflight.diagram).toMatchObject({bossId:'N',orderedPathsExist:true});
  for(const node of ['S1','B','D','C','F','N'])expect(evidence.preflight.diagram.nodes).toContain(node);
  expect(evidence.preflight.scouting).toMatchObject({notRequired:true,available:false,reason:'not-required',score:null});
  expect(evidence.preflight.air).toMatchObject({status:'manual',reason:'route'});
  if(state==='ready'){
   expect(evidence.preflight.gameMatch.status).toBe('partial');expect(evidence.preflight.land.count).toBe(0);
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='air-value')).toMatchObject({ok:false,unresolved:true});
  }
  if(state==='stock'){
   evidence.knownMismatch=await page.evaluate(index=>{
    const c=hdOCContext('6-4','six-four',index),make=names=>hdFEPlanFromSavedFleet('6-4',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),other=make(['矢矧改二乙','能代改二','赤城改','大潮改二','秋月改','霞改二']),mixed=make(['矢矧改二乙','能代改二','赤城改','大潮改二','秋月改','合成・別の未登録艦']),m=hdOCMeasure(other,hdSEChecks('6-4').rows);
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
    const r=HD_OC_CACHE.get('6-4:six-four:'+index);
    return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),air:hdFEAirCheck('6-4',hdFEAir(hdOCAssigned(r.plan)),r.plan),reviews:hdOCReview(r.plan,r.measure),gameMatch:hdFEGameMatch(r.plan),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,landTargets:g.landTargets})),preservationIssues:r.plan.preservationIssues||[]};
   },index);
   evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,exhaustive:false});
   expect(sample.measure.speedTarget).toBe(10);expect(sample.search.portSeed.maxOperations).toBe(800);await expect(panel.locator('[data-hd-oc-port]')).toHaveCount(0);
   expect(sample.measure.goals.some(g=>['low-speed-ships','radar-ships','drum-ships','los-value','cap-carrier-attack','cap-water-attack','cap-asw','cap-night-auto','port-attacker-set','索敵'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   // B→D→C→F→N are fixed diagram edges, not extra equipment predicates.
   await expect(checks).toContainText('高速');await expect(checks).toContainText('駆逐');
   const routeNotes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="6-4:${index}"]`);
   await expect(routeNotes).toHaveCount(1);await expect(routeNotes).toContainText('BDCFN');await expect(routeNotes).toContainText('高速');
   expect(sample.search.status).toBe('incomplete');await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   expect(sample.scouting).toMatchObject({notRequired:true,available:false,reason:'not-required',score:null});
   expect(sample.air).toMatchObject({status:'manual',reason:'route'});
   expect(sample.measure.goals.find(g=>g.kind==='air-value')).toMatchObject({ok:false,unresolved:true});
   expect(sample.reviews.find(r=>r.id==='air')).toMatchObject({kind:'manual'});
   expect(sample.reviews.find(r=>r.id==='base')).toMatchObject({kind:'data'});
   await expect(panel.locator('[data-hd-oc-review-id="base"]')).toContainText('出撃部隊が未設定');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.usage['二式水戦改@@0']).toBe(2);expect(sample.stock['二式水戦改@@0']).toBe(2);
    expect(sample.usage['大発動艇(八九式中戦車&陸戦隊)@@0']).toBe(1);expect(sample.stock['大発動艇(八九式中戦車&陸戦隊)@@0']).toBe(1);
    expect(sample.usage['特二式内火艇@@0']).toBe(1);expect(sample.stock['特二式内火艇@@0']).toBe(1);
    for(const kind of ['cap-aa','cap-land-mixed'])expect(sample.measure.goals.find(g=>g.kind===kind)).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');expect(sample.readiness.registeredReady).toBe(false);
   }else if(state==='stock'){
    // Bare known fast hulls still satisfy the route; combat recommendations do not.
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});
    expect(sample.readiness.registeredReady).toBe(false);expect(sample.shortages.some(g=>['route-requirements','air-value','los-value'].includes(g.kind))).toBe(false);
    const land=sample.shortages.find(g=>g.kind==='cap-land-mixed');
    expect(land).toMatchObject({shortfall:1,stock:{recipe:{id:'tank-amphibious'},complete:false,parts:[{part:'tank',have:0,need:1},{part:'amphibious',have:0,need:1}]}});
    const target=land.landTargets.find(t=>t.ship==='大潮改二');expect(target).toMatchObject({status:'candidate'});
    expect(target.parts.map(p=>({part:p.part,count:p.count}))).toEqual([{part:'tank',count:1},{part:'amphibious',count:1}]);
    expect(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index))).toBe(true);
    const card=panel.locator('.hd-oc-shortage').filter({hasText:'対地装備の組み合わせに必要なもの'});
    for(const text of ['陸戦隊系：所持0 / この装備例に必要1・あと1個','内火艇系：所持0 / この装備例に必要1・あと1個'])await expect(card).toContainText(text);
    const targets=card.locator('[data-hd-oc-land-targets]');
    for(const text of ['大潮改二','陸戦隊系1個','内火艇系1個','通常第1枠','大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇','1組の代替候補','全候補艦への配備を求めるものではありません','戦闘上の推奨装備例','経路の必須条件','他の目標と枠を共用','購入数量を保証しません'])await expect(targets).toContainText(text);
    await expect(card.locator('[data-hd-oc-procure]')).toHaveCount(0);
   }else{
    expect(sample.route.status).toBe('manual');expect(sample.readiness.registeredReady).toBe(false);
    expect(sample.measure.goals.some(g=>g.kind==='speed-ship'&&g.unresolved)).toBe(true);
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
   await page.locator('#customFleetPanel [data-cf-id="six-four"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['6-4'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['6-4'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
  },ref);
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
  if(state==='unknown')expect(evidence.saved.customExact).toBe(true);
  else{
   expect(evidence.saved.routeAssessment).toBe('ready');
   expect(evidence.saved.searchAssessment).toMatchObject({status:'incomplete',exhaustive:false});expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0);
  }
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());
  const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('6-4'));
  await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['6-4'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('6-4',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
