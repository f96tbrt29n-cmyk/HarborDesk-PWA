'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Sourced BB1+CA1+DD4 and the CL1+DD2 alternative are route conditions.
// A finite owned synchronized torpedo repairs one missing saved item.
// Night-CI equipment readiness does not guarantee activation or combat victory.
for(const state of ['ready','stock','unknown'])test(`5-1 BCFJ ${state} keeps branch and equipment distinctions through save and load`,async({page},info)=>{
 const index=0;
 const evidence={state,index,scope:'5-1/index0/BCFJ; synthetic BB1+CA1+DD4 repair or canonical BB1+CVL1+CA1+CL1+DD2 stock/unknown input, not a game arrival or CI activation/victory guarantee',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
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
   const names=state==='ready'?['長門改二','鳥海改二','秋月改','夕立改二','綾波改二','時雨改二']:['長門改二','飛鷹改',state==='unknown'?'合成・5-1艦情報未登録':'鳥海改二','阿武隈改二','秋月改','夕立改二'];
   const repairShip='夕立改二';
   // One of the two finite owned torpedoes is initially missing from the saved
   // loadout; the synchronized candidate has both on the same legal hull.
   const equipped=names.map(name=>name===repairShip?['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷']:[]);
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);
    return {id:'five-one-'+i,name,masterId:master?.id||0,gameShipId:18600+i,level:90,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(equipped[i][j]||''):''),gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(state==='ready')for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'5-1':[{id:'five-one',name:'合成：BCFJの手持ち配備',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['5-1'].presets[index]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===2?'合成・5-1性能未登録装備':r.gameGearSlots.map((s,j)=>state==='ready'&&r.name===repairShip&&j===0?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('5-1',index);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {shipNames:names,repairIndex:names.indexOf(repairShip),custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['5-1'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['5-1'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('5-1');
  await page.locator('#hdMapStrategyRoute').selectOption(String(index));
  await page.locator('#hdMapStrategyFleet').selectOption('five-one');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(({index,repairIndex})=>{
   const built=hdOCBuild(hdOCContext('5-1','five-one',index)),holder=document.createElement('div'),paths=[['S','B','C','F','J']];
   holder.innerHTML=hdMapSvg('5-1',MAP_DETAILS['5-1']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),routePaths:holder.querySelectorAll('.hd-map-route').length,orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['5-1'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),measure:hdOCMeasure(built.plan,hdSEChecks('5-1').rows,built.unknown),torpedoes:built.plan.ships[repairIndex].items.filter(x=>x.name==='61cm四連装(酸素)魚雷').length,nightPolicy:hdSENightPolicy('5-1'),night:hdFENightCI(built.plan.ships[repairIndex]),gameMatch:hdFEGameMatch(built.plan),preservationIssues:built.plan.preservationIssues||[],diagram};
  },{index,repairIndex:ref.repairIndex});
  expect(evidence.preflight.diagram).toMatchObject({bossId:'J',orderedPathsExist:true});
  for(const node of ['S','B','C','F','J'])expect(evidence.preflight.diagram.nodes).toContain(node);
  if(state==='ready'){
   expect(evidence.preflight.torpedoes).toBe(1);expect(evidence.preflight.nightPolicy).toBe('auto');expect(evidence.preflight.gameMatch.status).toBe('partial');
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:false,count:0});
  }
  if(state==='stock'){
   // Independent known composition failures stay failures even with a separate
   // unknown hull. They are fleet changes, never equipment-purchase deficits.
   evidence.knownMismatch=await page.evaluate(index=>{
    const c=hdOCContext('5-1','five-one',index),make=names=>hdFEPlanFromSavedFleet('5-1',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),p=make(['赤城改','飛鷹改','鳥海改二','阿武隈改二','秋月改','夕立改二']),mixed=make(['長門改二','陸奥改二','伊勢改二','阿武隈改二','夕立改二','合成・別の未登録艦']),m=hdOCMeasure(p,hdSEChecks('5-1').rows);
    return {route:hdFERoute(p),knownAndUnknown:hdFERoute(mixed),reviews:hdOCReview(p,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   },index);
   expect(evidence.knownMismatch.route.status).toBe('missing');
   expect(evidence.knownMismatch.knownAndUnknown.status).toBe('missing');
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route').next).toContain('艦種・隻数');
   expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();
   await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(index=>{
    const r=HD_OC_CACHE.get('5-1:five-one:'+index);
    return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),gameMatch:hdFEGameMatch(r.plan),nightPolicy:hdSENightPolicy('5-1'),night:r.plan.ships.map(s=>({ship:s.ship,result:hdFENightCI(s)})),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,nightTargets:g.nightTargets,carrierTargets:g.carrierTargets?.map(t=>({...t,slots:t.slots.map(slot=>({...slot,capacity:hdShipDbSlotProfile(hdFEFindShip(t.ship)).slots[slot.index]}))}))})),preservationIssues:r.plan.preservationIssues||[]};
   },index);
   evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,status:'incomplete',exhaustive:false});
   expect(sample.measure.speedTarget).toBe(0);expect(sample.nightPolicy).toBe('auto');expect(sample.search.portSeed.maxOperations).toBe(800);
   expect(sample.scouting.notRequired).toBe(true);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','los-value','radar-ships','drum-ships','cap-asw','cap-aa','制空','索敵'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   for(const node of ['B→C','F→J'])await expect(checks).toContainText(node);
   const routeNotes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="5-1:${index}"]`);
   await expect(routeNotes).toHaveCount(1);
   await expect(routeNotes).toContainText('BCFJ');
   await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.gear[ref.repairIndex].filter(x=>x.name==='61cm四連装(酸素)魚雷')).toHaveLength(2);
    expect(sample.usage['61cm四連装(酸素)魚雷@@0']).toBe(2);expect(sample.stock['61cm四連装(酸素)魚雷@@0']).toBe(2);
    expect(sample.night.find(x=>x.ship==='夕立改二').result).toMatchObject({status:'ready',attack:'torpedo',torpedo:2});
    expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');
    expect(sample.readiness.registeredReady).toBe(false);
    expect(sample.measure.goals.some(g=>g.kind==='cap-carrier-attack')).toBe(false);
   }else if(state==='stock'){
    expect(sample.route.status).toBe('ready');expect(sample.master.valid).toBe(true);expect(sample.usage).toEqual({});
    expect(sample.readiness.registeredReady).toBe(false);
    const attacks=sample.shortages.find(g=>g.kind==='cap-carrier-attack');
    expect(attacks).toMatchObject({shortfall:1,stock:{complete:false,parts:[{part:'carrierAttackPlane',have:0,need:1}]}});
    expect(attacks.carrierTargets.map(t=>({ship:t.ship,count:t.count,status:t.status,unknownSlots:t.unknownSlots}))).toEqual([{ship:'飛鷹改',count:1,status:'candidate',unknownSlots:false}]);
    for(const target of attacks.carrierTargets){expect(target.slots.length).toBeGreaterThan(0);for(const slot of target.slots){expect(Number.isInteger(slot.index)).toBe(true);expect(slot.capacity).toBeGreaterThan(0);expect(slot.candidates.length).toBeGreaterThan(0)}}
    const night=sample.shortages.find(g=>g.kind==='cap-night-auto');
    expect(night).toMatchObject({shortfall:1,stock:{complete:false,recipe:{id:'night-torpedo'},parts:[{part:'nightTorpedo',have:0,need:2}]}});
    const nightCard=panel.locator('.hd-oc-shortage').filter({hasText:'夜戦CI（自動・艦種別）に必要なもの'});
    await expect(nightCard).toContainText('魚雷（甲標的を除く）：所持0 / この装備例に必要2・あと2個');
    for(const text of ['61cm四連装(酸素)魚雷','61cm五連装(酸素)魚雷','全目標を同時に満たす配備の保証ではありません'])await expect(nightCard).toContainText(text);
    expect(night.nightTargets.map(t=>({ship:t.ship,status:t.status,count:t.count}))).toEqual(['鳥海改二','阿武隈改二','秋月改','夕立改二'].map(ship=>({ship,status:'candidate',count:2})));
    for(const target of night.nightTargets){expect(new Set(target.slots.map(s=>s.index)).size).toBeGreaterThanOrEqual(2);for(const slot of target.slots){expect(Number.isInteger(slot.index)).toBe(true);expect(slot.candidates.length).toBeGreaterThan(0)}}
    const nightTargets=nightCard.locator('[data-hd-oc-night-targets]');
    for(const ship of ['鳥海改二','阿武隈改二','秋月改','夕立改二'])await expect(nightTargets).toContainText(ship+'：魚雷2個を同じ艦の別々の通常枠へ配備');
    for(const text of ['通常第1枠','通常第2枠','61cm五連装(酸素)魚雷','全候補艦への配備を求めるものではありません','必要組数は目標欄','戦闘上の推奨装備例','経路必須やCIの発動率・命中・撃破は保証しません','全装備の優先判定は配備後に再確認','増設枠は含めず','未所持品','他の目標と枠を共用','購入数量を保証しません'])await expect(nightTargets).toContainText(text);
    await expect(nightTargets).not.toContainText('長門改二');await expect(nightTargets).not.toContainText('飛鷹改');
    const attackCard=panel.locator('.hd-oc-shortage').filter({hasText:'空母の攻撃機配備に必要なもの'});
    await expect(attackCard).toContainText('艦上攻撃機・艦上爆撃機：所持0 / この装備例に必要1・あと1個');
    for(const name of ['流星','彗星'])await expect(attackCard).toContainText(name);
    const targets=attackCard.locator('[data-hd-oc-carrier-targets]');
    await expect(targets).toContainText('飛鷹改：艦上攻撃機・艦上爆撃機1個');await expect(targets).toContainText('第1枠');
    for(const text of ['戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','同時配備の成立や購入数量を保証しません'])await expect(targets).toContainText(text);
    await expect(checks).toContainText('成立');
   }else{
    expect(sample.route.status).toBe('manual');expect(sample.readiness.registeredReady).toBe(false);
    expect(sample.preservationIssues.length).toBeGreaterThan(0);
    await expect(checks).toContainText('未確認');
    await expect(panel.locator('[data-hd-oc-reviews]')).toContainText('艦娘情報が未登録');
   }
   evidence.ui={checks:await checks.innerText(),notes:await routeNotes.innerText(),goals:await panel.locator('.hd-oc-goal').allInnerTexts(),shortages:await panel.locator('.hd-oc-shortage').allInnerTexts()};
   return sample;
  }
  evidence.stage='first-search';await search();
  await panel.locator('[data-hd-oc-apply]').click();
  if(state==='unknown'){
   await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();
   expect(await page.evaluate(()=>localStorage.getItem(CUSTOM_FLEET_KEY))).toBe(ref.custom);
  }else{
   await page.locator('#mapStrategyNavigator [data-hd-msn-action="fleet"]').click();
   await page.locator('#customFleetPanel [data-cf-id="five-one"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['5-1'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['5-1'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
  },ref);
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
  if(state==='unknown')expect(evidence.saved.customExact).toBe(true);
  else{
   expect(evidence.saved.routeAssessment).toBe('ready');
   expect(evidence.saved.searchAssessment).toMatchObject({status:'incomplete',exhaustive:false});
   expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0);
  }
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());
  const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('5-1'));
  await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['5-1'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('5-1',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
