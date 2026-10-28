'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// Dedicated synthetic API-observation fixture, not real-game Lv/stat/bonus
// evidence. The displayed gameLos100 input reuses the existing central-port
// fixture. Same synchronized gear is essential for a numeric scouting verdict.
// Independent33 arithmetic: 2*sqrt(82)+sqrt(99)+3*sqrt(100)
// +2*(6*6*1.2+1*.8)-ceil(120*.4) =98.06064464734104; empty gear =12.
for(const state of ['ready','stock','unknown'])test(`4-5 central K ${state} keeps route and scouting distinctions through save and load`,async({page},info)=>{
 const index=1;
 const evidence={state,index,scope:'4-5/index1/ADHKT or CDHKT after choosing D; synthetic synchronized displayed gameLos100, not verified game stats/bonus or a victory guarantee',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
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
   const names=['長門改二','赤城改',state==='unknown'?'合成・4-5艦情報未登録':'鈴谷改二','阿武隈改二','秋月改','夕立改二'];
   const recon='零式水上観測機',attack='流星';
   if(hdFEFind(recon)?.stats?.索敵!==6||hdFEFind(attack)?.stats?.索敵!==1)throw Error('fixture requires the documented recon6 and attack1 scouting stats');
   const equipped=names.map(name=>name==='長門改二'?[recon,recon,recon,'三式弾']:name==='鈴谷改二'?[recon,recon,recon]:name==='赤城改'?['試製烈風 後期型','試製烈風 後期型',attack]:name==='阿武隈改二'?['三式水中探信儀','三式爆雷投射機']:[]);
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db);
    return {id:'four-five-'+i,name,masterId:master?.id||0,gameShipId:18500+i,level:99,gameLos:100,gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile?.count||0},(_,j)=>state==='ready'?(equipped[i][j]||''):''),gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(state==='ready')for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'4-5':[{id:'four-five',name:'合成：K経由の保存後再確認',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['4-5'].presets[index]},metadata:{keep:true},portAttackersByRoute:{'4-3:0':[{rosterId:'other-route-port',gameShipId:99999,masterId:99999,ship:'対象外の担当艦情報'}]},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===2?'合成・4-5性能未登録装備':r.gameGearSlots.join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('4-5',index);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {shipNames:names,otherRoutePort:JSON.stringify(all['4-5'][0].portAttackersByRoute),custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['4-5'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['4-5'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('4-5');
  await page.locator('#hdMapStrategyRoute').selectOption(String(index));
  await page.locator('#hdMapStrategyFleet').selectOption('four-five');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(index=>{
   const built=hdOCBuild(hdOCContext('4-5','four-five',index)),holder=document.createElement('div'),paths=[['START','A','D','H','K','T'],['START','C','D','H','K','T']],normalGear=p=>p.ships.map(s=>({items:s.items.filter(x=>x.name).map(x=>({name:x.name,star:x.star,slotIndex:x.slotIndex})),expansion:s.expansion||null}));
   holder.innerHTML=hdMapSvg('4-5',MAP_DETAILS['4-5']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),routePaths:holder.querySelectorAll('.hd-map-route').length,orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['4-5'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),measure:hdOCMeasure(built.plan,hdSEChecks('4-5').rows,built.unknown),gameMatch:hdFEGameMatch(built.plan),scouting:hdFEPlanScouting(built.plan,hdOCAssigned(built.plan)),speeds:built.plan.ships.map(hdFEShipSpeed),normalGear:normalGear(built.plan),portTargets:hdOCPortTargets(built.plan),preservationIssues:built.plan.preservationIssues||[],diagram};
  },index);
  expect(evidence.preflight.diagram).toMatchObject({bossId:'T',orderedPathsExist:true});
  for(const node of ['START','S','A','C','D','H','K','T'])expect(evidence.preflight.diagram.nodes).toContain(node);
  expect(evidence.preflight.speeds[0]).toMatchObject({known:true,rank:5,invalid:[]});
  expect(evidence.preflight.portTargets).toEqual([]);
  if(state==='ready'){
   expect(evidence.preflight.route.status).toBe('ready');
   expect(evidence.preflight.gameMatch.status).toBe('ready');
   expect(evidence.preflight.scouting).toMatchObject({status:'ready',available:true,coef:2});
   expect(evidence.preflight.scouting.score).toBeCloseTo(2*Math.sqrt(82)+Math.sqrt(99)+30+88-48,8);
  }
  if(state==='stock'){
   // Source controls use real ship/speed functions. Numeric information may be
   // manual in these unsynchronized controls; a known prior mismatch survives.
   evidence.knownMismatch=await page.evaluate(index=>{
    const c=hdOCContext('4-5','four-five',index),make=(names,gear='')=>hdFEPlanFromSavedFleet('4-5',{...c.fleet,ships:names.map(ship=>({ship,gear}))}),fast=make(['金剛改二','榛名改二','鈴谷改二','熊野改二','矢矧改二','時雨改二'],'改良型艦本式タービン / 新型高温高圧缶'),sub=make(['長門改二','赤城改','鈴谷改二','伊401改','秋月改','合成・別の未登録艦']),m=hdOCMeasure(sub,hdSEChecks('4-5').rows);
    return {fast:{route:hdFERoute(fast),speeds:fast.ships.map(hdFEShipSpeed)},submarineAndUnknown:hdFERoute(sub),reviews:hdOCReview(sub,m),shortageGoals:hdOCShortageGoals(m).map(g=>g.kind)};
   },index);
   expect(evidence.knownMismatch.fast.speeds.every(s=>s.known&&s.rank>=15&&!s.invalid.length)).toBe(true);
   expect(evidence.knownMismatch.fast.route.status).toBe('missing');
   expect(evidence.knownMismatch.submarineAndUnknown.status).toBe('missing');
   expect(evidence.knownMismatch.reviews.find(x=>x.id==='route')).toMatchObject({kind:'missing',action:'route'});
   expect(evidence.knownMismatch.shortageGoals).not.toContain('route-requirements');
  }
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();
   await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const sample=await page.evaluate(index=>{
    const r=HD_OC_CACHE.get('4-5:four-five:'+index);
    return {route:hdFERoute(r.plan),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),gameMatch:hdFEGameMatch(r.plan),normalGear:r.plan.ships.map(s=>({items:s.items.filter(x=>x.name).map(x=>({name:x.name,star:x.star,slotIndex:x.slotIndex})),expansion:s.expansion||null})),portTargets:hdOCPortTargets(r.plan),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,minCount:g.minCount,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,aswTargets:g.aswTargets,carrierTargets:g.carrierTargets?.map(t=>({...t,slots:t.slots.map(slot=>({...slot,capacity:hdShipDbSlotProfile(hdFEFindShip(t.ship)).slots[slot.index]}))}))})),preservationIssues:r.plan.preservationIssues||[]};
   },index);
   evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,status:'incomplete',exhaustive:false});
   expect(sample.measure.speedTarget).toBe(0);
   expect(sample.portTargets).toEqual([]);expect(sample.search.portSeed).toMatchObject({maxOperations:800});
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','radar-ships','drum-ships'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   for(const node of ['H→K','K→T'])await expect(checks).toContainText(node);
   const routeNotes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="4-5:${index}"]`);
   await expect(routeNotes).toHaveCount(1);
   for(const path of ['ADHKT','CDHKT'])await expect(routeNotes).toContainText(path);
   await expect(routeNotes).toContainText('71');
   await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.normalGear).toEqual(evidence.preflight.normalGear);
    expect(sample.search.examined).toBe(0);
    expect(sample.scouting).toMatchObject({status:'ready',available:true,coef:2});
    expect(sample.scouting.score).toBeCloseTo(2*Math.sqrt(82)+Math.sqrt(99)+30+88-48,8);
    expect(sample.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:true,minCount:71});
    expect(sample.measure.goals.find(g=>g.kind==='cap-asw')).toMatchObject({ok:true,count:1,purpose:'recommendation'});
    expect(sample.measure.goals.find(g=>g.kind==='cap-land-soft')).toMatchObject({ok:true,count:1,purpose:'recommendation'});
    expect(sample.measure.goals.find(g=>g.kind==='cap-carrier-attack')).toMatchObject({ok:true,count:1,minCount:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');
    expect(sample.readiness.registeredReady).toBe(false);
   }else if(state==='stock'){
    expect(sample.route.status).toBe('missing');expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});
    expect(sample.scouting).toMatchObject({status:'partial',available:true,score:12,coef:2});
    const los=sample.measure.goals.find(g=>g.kind==='los-value');
    expect(los).toMatchObject({ok:false,count:12,minCount:71});expect(!!los.unresolved).toBe(false);
    expect(sample.shortages.find(g=>g.kind==='los-value')).toMatchObject({shortfall:59,stockGap:0});
    expect(sample.readiness.registeredReady).toBe(false);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'索敵分岐の安全域'})).toContainText('33式 12.00 / 安全域 71');
    await expect(checks).toContainText('索敵');
    const attacks=sample.shortages.find(g=>g.kind==='cap-carrier-attack');
    expect(attacks).toMatchObject({shortfall:1,stock:{complete:false,parts:[{part:'carrierAttackPlane',have:0,need:1}]}});
    const asw=sample.shortages.find(g=>g.kind==='cap-asw');
    expect(asw).toMatchObject({shortfall:1,stock:{complete:false,recipe:{id:'sonar-projector'},parts:[{part:'sonar',have:0,need:1},{part:'projector',have:0,need:1}]}});
    expect(attacks.carrierTargets.map(t=>({ship:t.ship,count:t.count,status:t.status,unknownSlots:t.unknownSlots}))).toEqual([{ship:'赤城改',count:1,status:'candidate',unknownSlots:false}]);
    for(const target of attacks.carrierTargets)for(const slot of target.slots){expect(slot.capacity).toBeGreaterThan(0);expect(slot.candidates.length).toBeGreaterThan(0)}
    expect(asw.aswTargets.map(t=>({ship:t.ship,status:t.status,parts:t.parts.map(p=>({part:p.part,count:p.count}))}))).toEqual(['阿武隈改二','秋月改','夕立改二'].map(ship=>({ship,status:'candidate',parts:[{part:'sonar',count:1},{part:'projector',count:1}]})));
    for(const target of asw.aswTargets){for(const part of target.parts){expect(part.slots.length).toBeGreaterThan(0);for(const slot of part.slots)expect(slot.candidates.length).toBeGreaterThan(0)}expect(target.parts[0].slots.some(a=>target.parts[1].slots.some(b=>a.index!==b.index))).toBe(true)}
    const attackCard=panel.locator('.hd-oc-shortage').filter({hasText:'空母の攻撃機配備に必要なもの'});
    await expect(attackCard).toContainText('艦上攻撃機・艦上爆撃機：所持0 / この装備例に必要1・あと1個');
    const targets=attackCard.locator('[data-hd-oc-carrier-targets]');
    for(const text of ['赤城改：艦上攻撃機・艦上爆撃機1個','第1枠','流星','天山','戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','同時配備の成立や購入数量を保証しません'])await expect(targets).toContainText(text);
    const aswCard=panel.locator('.hd-oc-shortage').filter({hasText:'対潜シナジーに必要なもの'});
    await expect(aswCard).toContainText('ソナー：所持0 / この装備例に必要1・あと1個');await expect(aswCard).toContainText('爆雷投射機：所持0 / この装備例に必要1・あと1個');
    const aswTargets=aswCard.locator('[data-hd-oc-asw-targets]');
    for(const text of ['阿武隈改二','秋月改','夕立改二','ソナー1個','爆雷投射機1個','三式水中探信儀','三式爆雷投射機','通常第1枠','全候補艦への配備を求めるものではありません','経路の必須条件や先制対潜の成立人数ではありません','増設枠は含めません','他の目標と枠を共用','購入数量を保証しません'])await expect(aswTargets).toContainText(text);
   }else{
    expect(sample.route.status).toBe('manual');expect(sample.readiness.registeredReady).toBe(false);
    expect(sample.scouting).toMatchObject({status:'manual',available:false,reason:'sync',score:null});
    expect(sample.shortages.some(g=>g.kind==='los-value')).toBe(false);
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
   await page.locator('#customFleetPanel [data-cf-id="four-five"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['4-5'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['4-5'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,otherRoutePortExact:JSON.stringify(f.portAttackersByRoute)===ref.otherRoutePort,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
  },ref);
  expect(evidence.saved).toMatchObject({sourcesExact:true,other:true,otherMap:true,procurement:true,otherPlanner:true,identitiesExact:true,otherRoutePortExact:true,metadata:{keep:true},memo:state==='unknown'?'keep memo':'keep memo / edited'});
  if(state==='unknown')expect(evidence.saved.customExact).toBe(true);
  else{
   expect(evidence.saved.routeAssessment).toBe(state==='stock'?'missing':'ready');
   expect(evidence.saved.searchAssessment).toMatchObject({status:'incomplete',exhaustive:false});
   expect(evidence.saved.searchAssessment.reasons.length).toBeGreaterThan(0);
  }
  const beforeReload=await page.evaluate(snapshotSource=>({saved:localStorage.getItem(CUSTOM_FLEET_KEY),navigation:(0,eval)('('+snapshotSource+')')()}),snapshotNavigation.toString());
  const saved=beforeReload.saved;evidence.navigation.push(beforeReload.navigation);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('4-5'));
  await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['4-5'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherRoutePortExact:JSON.stringify(f.portAttackersByRoute)===ref.otherRoutePort,route:hdFERoute(hdFEPlanFromSavedFleet('4-5',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,otherRoutePortExact:true,route:state==='unknown'?'manual':state==='stock'?'missing':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
