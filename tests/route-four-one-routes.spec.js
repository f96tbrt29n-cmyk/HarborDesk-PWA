'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Both registered paths share D→G→J; the game start A/C is random.
// The ready two-DD/no-CL variant exercises the sourced alternative to the example.
// Battle equipment goals never make a random start deterministic.
// Synchronized equipment is a finite candidate seed, never extra inventory.
for(const state of ['ready','stock','unknown'])test(`4-1 CFDGJ / ABDGJ ${state} keeps branch and equipment distinctions through save and load`,async({page},info)=>{
 const evidence={state,scope:'4-1/index0/CFDGJ / ABDGJ random-start route group; synthetic owned fleet, not a forced game path or victory guarantee',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
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
  const ref=await page.evaluate(({state,installSource})=>{
   (0,eval)('('+installSource+')')();
   const names=['赤城改','加賀改',state==='unknown'?'合成・4-1艦情報未登録':'鳥海改二','妙高改二','秋月改',state==='ready'?'夕立改二':'羽黒改二'];
   // The seeded Akizuki equipment is preserved input, not an asserted AA goal.
   const equipped=[['試製烈風 後期型','流星'],['試製烈風 後期型','流星'],['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷'],[],['10cm連装高角砲','10cm連装高角砲','13号対空電探改'],['三式水中探信儀','三式爆雷投射機']];
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);
    return {id:'four-one-'+i,name,masterId:master?.id||0,gameShipId:18100+i,level:90,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(equipped[i][j]||''):''),gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(state==='ready')for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'4-1':[{id:'four-one',name:'合成：CFDGJ / ABDGJの手持ち配備',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['4-1'].presets[0]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===2?'合成・4-1性能未登録装備':r.gameGearSlots.map((s,j)=>state==='ready'&&i===5&&j===0?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('4-1',0);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['4-1'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['4-1'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('4-1');
  await page.locator('#hdMapStrategyRoute').selectOption('0');
  await page.locator('#hdMapStrategyFleet').selectOption('four-one');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(()=>{
   const built=hdOCBuild(hdOCContext('4-1','four-one',0)),holder=document.createElement('div'),paths=[['S','C','F','D','G','J'],['S','A','B','D','G','J']];
   holder.innerHTML=hdMapSvg('4-1',MAP_DETAILS['4-1']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),routePaths:holder.querySelectorAll('.hd-map-route').length,orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['4-1'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),measure:hdOCMeasure(built.plan,hdSEChecks('4-1').rows,built.unknown),sonars:built.plan.ships[5].items.filter(x=>x.name==='三式水中探信儀').length,preservationIssues:built.plan.preservationIssues||[],diagram};
  });
  expect(evidence.preflight.diagram).toMatchObject({bossId:'J',orderedPathsExist:true});
  for(const node of ['S','A','B','C','F','D','G','J'])expect(evidence.preflight.diagram.nodes).toContain(node);
  if(state==='ready'){
   expect(evidence.preflight.sonars).toBe(0);
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:false,count:0});
  }
  if(state==='stock'){
   // Four escorts with a CL take the earlier D→H branch. An unrelated
   // unknown hull does not erase a known SS/SSV exclusion.
   evidence.knownMismatch=await page.evaluate(()=>{
    const c=hdOCContext('4-1','four-one',0),make=names=>hdFEPlanFromSavedFleet('4-1',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),p=make(['赤城改','阿武隈改二','秋月改','夕立改二','時雨改二','綾波改二']),m=hdOCMeasure(p,hdSEChecks('4-1').rows),mixed=make(['赤城改','加賀改','鳥海改二','秋月改','伊401改','合成・別の未登録艦']);
    return {route:hdFERoute(p),knownAndUnknown:hdFERoute(mixed),reviews:hdOCReview(p,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   });
   expect(evidence.knownMismatch.route.status).toBe('missing');
   expect(evidence.knownMismatch.route.contract.checks.some(c=>c.status==='missing'&&c.condition.reason?.startsWith('D→G'))).toBe(true);
   expect(evidence.knownMismatch.knownAndUnknown.status).toBe('missing');
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route').next).toContain('艦種・隻数');
   expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();
   await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(()=>{
    const r=HD_OC_CACHE.get('4-1:four-one:0');
    return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,aswTargets:g.aswTargets,carrierTargets:g.carrierTargets?.map(t=>({...t,slots:t.slots.map(slot=>({...slot,capacity:hdShipDbSlotProfile(hdFEFindShip(t.ship)).slots[slot.index]}))}))})),preservationIssues:r.plan.preservationIssues||[]};
   });
   evidence.samples.push(sample);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,status:'incomplete',exhaustive:false});
   expect(sample.measure.speedTarget).toBe(0);
   expect(sample.scouting.notRequired).toBe(true);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','los-value','radar-ships','drum-ships'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   for(const node of ['C→F','D→G'])await expect(checks).toContainText(node);
   const routeNotes=page.locator('#mapStrategyNavigator [data-hd-route-requirements="4-1:0"]');
   await expect(routeNotes).toHaveCount(1);
   for(const path of ['CFDGJ','ABDGJ'])await expect(routeNotes).toContainText(path);
   await expect(routeNotes).toContainText('ランダム');
   await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);
    expect(sample.gear[5].filter(x=>x.name==='三式水中探信儀')).toHaveLength(1);
    expect(sample.gear[5].filter(x=>x.name==='三式爆雷投射機')).toHaveLength(1);
    expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');
    expect(sample.readiness.registeredReady).toBe(false);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'空母の攻撃機配備'})).toContainText('戦闘推奨');
   }else if(state==='stock'){
    expect(sample.route.status).toBe('ready');expect(sample.master.valid).toBe(true);expect(sample.usage).toEqual({});
    expect(sample.readiness.registeredReady).toBe(false);
    const attacks=sample.shortages.find(g=>g.kind==='cap-carrier-attack');
    expect(attacks).toMatchObject({shortfall:2,stock:{complete:false,parts:[{part:'carrierAttackPlane',have:0,need:2}]}});
    expect(attacks.carrierTargets.map(t=>({ship:t.ship,count:t.count,status:t.status,unknownSlots:t.unknownSlots}))).toEqual([{ship:'赤城改',count:1,status:'candidate',unknownSlots:false},{ship:'加賀改',count:1,status:'candidate',unknownSlots:false}]);
    for(const target of attacks.carrierTargets){expect(target.slots.length).toBeGreaterThan(0);for(const slot of target.slots){expect(Number.isInteger(slot.index)).toBe(true);expect(slot.capacity).toBeGreaterThan(0);expect(slot.candidates.length).toBeGreaterThan(0)}}
    const asw=sample.shortages.find(g=>g.kind==='cap-asw');
    expect(asw).toMatchObject({shortfall:1,stock:{complete:false,recipe:{id:'sonar-projector'},parts:[{part:'sonar',have:0,need:1},{part:'projector',have:0,need:1}]}});
    expect(asw.aswTargets.map(t=>({ship:t.ship,status:t.status,parts:t.parts.map(p=>({part:p.part,count:p.count}))}))).toEqual([{ship:'秋月改',status:'candidate',parts:[{part:'sonar',count:1},{part:'projector',count:1}]}]);
    for(const target of asw.aswTargets){
     for(const part of target.parts){expect(part.slots.length).toBeGreaterThan(0);for(const slot of part.slots){expect(Number.isInteger(slot.index)).toBe(true);expect(slot.index).toBeGreaterThanOrEqual(0);expect(slot.candidates.length).toBeGreaterThan(0)}}
     expect(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index))).toBe(true);
    }
    const attackCard=panel.locator('.hd-oc-shortage').filter({hasText:'空母の攻撃機配備に必要なもの'});
    await expect(attackCard).toContainText('艦上攻撃機・艦上爆撃機：所持0 / この装備例に必要2・あと2個');
    await expect(attackCard).toContainText('流星');await expect(attackCard).toContainText('彗星');
    const targets=attackCard.locator('[data-hd-oc-carrier-targets]');
    for(const ship of ['赤城改','加賀改'])await expect(targets).toContainText(ship+'：艦上攻撃機・艦上爆撃機1個');
    await expect(targets).toContainText('第1枠');await expect(targets).toContainText('戦闘上の推奨で、経路の必須条件ではありません');
    await expect(targets).toContainText('未所持品を含む');await expect(targets).toContainText('他の目標と共用');await expect(targets).toContainText('同時配備の成立や購入数量を保証しません');
    const aswCard=panel.locator('.hd-oc-shortage').filter({hasText:'対潜シナジーに必要なもの'});
    await expect(aswCard).toContainText('ソナー：所持0 / この装備例に必要1・あと1個');
    await expect(aswCard).toContainText('爆雷投射機：所持0 / この装備例に必要1・あと1個');
    const aswTargets=aswCard.locator('[data-hd-oc-asw-targets]');
    for(const text of ['秋月改','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','経路の必須条件や先制対潜の成立人数ではありません','増設枠は含めません','他の目標と枠を共用','購入数量を保証しません'])await expect(aswTargets).toContainText(text);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'対潜シナジー'})).toContainText('戦闘推奨');
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
   await page.locator('#customFleetPanel [data-cf-id="four-one"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['4-1'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['4-1'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
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
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('4-1'));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['4-1'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('4-1',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
