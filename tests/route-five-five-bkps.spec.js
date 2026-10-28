'use strict';
const {test,expect}=require('@playwright/test');
const versionFixture=require('../app-version.json');
const {install:installNavigation,snapshot:snapshotNavigation}=require('./route-navigation-observer.cjs');
test.use({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});

// A finite synthetic synchronized fixture, not real-game level/stat/bonus proof.
// The existing north numeric fixture's bare LOS41 gives the independent score:
// 6*sqrt(41)+2*(6*6*1.2+2*1*.8+4*.6)-ceil(120*.4)=84.81874542459707.
// Two omitted saved recon planes make its reference score56.01874542459707;
// a changed-loadout bonus is manual until the same synchronized fit is restored.
// Exempt adds a distinct all-base10/engine-pair case; it does not repeat a
// normal case. Its 21-radar is an optional AA component; LOS stays non-applicable.
const readyScore=6*Math.sqrt(41)+2*(6*6*1.2+2*1*.8+4*.6)-48,stockScore=6*Math.sqrt(41)-48;
for(const state of ['ready','stock','unknown','exempt'])test(`5-5 BKPS ${state} keeps prior branches and scouting distinctions through save and load`,async({page},info)=>{
 const index=0;
 const evidence={state,index,scope:'5-5/index0/BKPS; synthetic synchronized bareLOS41, normal finite12 loadout or legal fast-plus finite18 loadout; radar retained for optional AA, not a no-scouting-equipment claim; not native-game stats, arrival, optimality or victory proof',samples:[],navigation:[],navigationCollectionFailures:0,navigationObservation:'bounded existing test-only workspace entry wrappers add stack-capture overhead; no new wait, timer, pin or forced click'},errors=[];
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
   const names=state==='exempt'?['金剛改二','榛名改二','翔鶴改二甲','瑞鶴改二甲','鳥海改二','羽黒改二']:['長門改二','陸奥改二','赤城改','加賀改','鳥海改二',state==='unknown'?'合成・5-5艦情報未登録':'羽黒改二'];
   const recon='零式水上観測機',attack='流星',torpedo='61cm四連装(酸素)魚雷';
   if(hdFEFind(recon)?.stats?.索敵!==6||hdFEFind(attack)?.stats?.索敵!==1||hdFEFind('21号対空電探')?.stats?.索敵!==4)throw Error('fixture requires documented recon6, attack1 and radar4 scouting stats');
   const equipped=names.map((_,i)=>state==='exempt'?['改良型艦本式タービン','新型高温高圧缶',...(i<2?[]:i<4?[attack]:i===4?[torpedo,torpedo]:['90mm単装高角砲','21号対空電探'])]:i<2?[recon,recon,recon]:i<4?[attack]:i===4?[torpedo,torpedo]:['90mm単装高角砲','21号対空電探']);
   const rows=names.map((name,i)=>{
    const db=hdFEFindShip(name),master=db&&hdShipDbMasterRowFor(db),profile=db&&hdShipDbSlotProfile(db),labels=Array.from({length:profile?.count||0},(_,j)=>['ready','exempt'].includes(state)?(equipped[i][j]||''):'');
    return {id:'five-five-'+i,name,masterId:master?.id||0,gameShipId:18800+i,level:99,gameLos:41+labels.reduce((n,label)=>n+(Number(hdFEFind(label)?.stats?.索敵)||0),0),gameSlotEx:0,gameAswGearKnown:true,gameGearSlots:labels,gameGearExpansion:'',metadata:{keep:i}};
   });
   const counts=new Map();if(['ready','exempt'].includes(state))for(const row of rows)for(const label of row.gameGearSlots)if(label)counts.set(label,(counts.get(label)||0)+1);
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));
   localStorage.setItem(HD_FL_KEY,JSON.stringify([...counts].map(([name,count])=>({name,count,star:0}))));
   localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));
   localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));
   localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()));
   saveCustomFleets({'5-5':[{id:'five-five',name:state==='exempt'?'合成：高速＋BKPSの索敵非適用':'合成：通常BKPSの索敵80',memo:'keep memo',openingAswCount:0,routePreset:{...MAP_PLANS['5-5'].presets[index]},metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,rosterId:r.id,masterId:r.masterId,gameShipId:r.gameShipId,gear:state==='unknown'&&i===5?'合成・5-5性能未登録装備':r.gameGearSlots.map((s,j)=>(state==='ready'&&i<2&&j===0||state==='exempt'&&i===2&&j===2)?'':s).join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   // An unrelated sentinel, not proof that a new procurement plan is durable.
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));
   localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));
   hdMapRouteSet('5-5',index);hdMSNOpen('1-1');
   const all=loadCustomFleets();return {shipNames:names,custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['5-5'][1]),otherMap:JSON.stringify(all['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated']),identities:JSON.stringify(all['5-5'][0].ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))};
  },{state,index,installSource:installNavigation.toString()});
  await page.locator('#hdMapStrategyMap').selectOption('5-5');
  await page.locator('#hdMapStrategyRoute').selectOption(String(index));
  await page.locator('#hdMapStrategyFleet').selectOption('five-five');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');
  evidence.preflight=await page.evaluate(index=>{
   const built=hdOCBuild(hdOCContext('5-5','five-five',index)),holder=document.createElement('div'),paths=[['START','B','K','P','S']];
   holder.innerHTML=hdMapSvg('5-5',MAP_DETAILS['5-5']);
   const diagram={scope:'real hdMapSvg result parsed without opening an extra map dialog',bossId:holder.querySelector('.hd-map-node.boss')?.getAttribute('data-hd-node-id'),nodes:[...holder.querySelectorAll('.hd-map-node')].map(n=>n.getAttribute('data-hd-node-id')),orderedPathsExist:paths.every(path=>path.slice(1).every((node,i)=>HD_MAP_GRAPHS['5-5'].edges.some(([a,b])=>a===path[i]&&b===node)))};
   return {route:hdFERoute(built.plan),speeds:built.plan.ships.map(hdFEShipSpeed),carrierMeasure:hdSECapabilityMeasure(built.plan,'cap-carrier-attack'),measure:hdOCMeasure(built.plan,hdSEChecks('5-5').rows,built.unknown),recon:built.plan.ships.flatMap(s=>s.items).filter(x=>x.name==='零式水上観測機').length,gameMatch:hdFEGameMatch(built.plan),scouting:hdFEPlanScouting(built.plan,hdOCAssigned(built.plan)),referenceScouting:hdFEScouting(built.plan,hdOCAssigned(built.plan)),preservationIssues:built.plan.preservationIssues||[],diagram};
  },index);
  expect(evidence.preflight.diagram).toMatchObject({bossId:'S',orderedPathsExist:true});
  for(const node of ['START','B','K','P','S'])expect(evidence.preflight.diagram.nodes).toContain(node);
  if(state==='ready'){
   expect(evidence.preflight.recon).toBe(4);expect(evidence.preflight.gameMatch.status).toBe('partial');
   expect(evidence.preflight.referenceScouting.score).toBeCloseTo(readyScore-28.8,8);
   expect(evidence.preflight.scouting).toMatchObject({status:'manual',available:false,reason:'bonus',score:null});
   expect(evidence.preflight.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:false,unresolved:true,minCount:80});
  }
  if(state==='exempt'){
   expect(evidence.preflight.speeds.every(s=>s.known&&s.rank>=15&&!s.invalid.length&&!s.expansionUnconfirmed)).toBe(true);
   expect(evidence.preflight.speeds.some(s=>s.rank<20)).toBe(true);
   expect(evidence.preflight.route.status).toBe('ready');expect(evidence.preflight.gameMatch.status).toBe('partial');
   expect(evidence.preflight.carrierMeasure.count).toBe(1);
   expect(evidence.preflight.scouting).toMatchObject({status:'ready',available:false,notRequired:true,reason:'exempt',score:null});
   expect(evidence.preflight.measure.scoutingExempt).toBe(true);
   expect(evidence.preflight.measure.goals.some(g=>['los-value','索敵'].includes(g.kind))).toBe(false);
  }
  if(state==='stock'){
   evidence.knownMismatch=await page.evaluate(index=>{
    const c=hdOCContext('5-5','five-five',index),make=names=>hdFEPlanFromSavedFleet('5-5',{...c.fleet,ships:names.map(ship=>({ship,gear:''}))}),other=make(['赤城改','加賀改','鳥海改二','羽黒改二','秋月改','夕立改二']),mixed=make(['長門改二','赤城改','加賀改','伊58改','鳥海改二','合成・別の未登録艦']),m=hdOCMeasure(other,hdSEChecks('5-5').rows);
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
    const r=HD_OC_CACHE.get('5-5:five-five:'+index);
    return {route:hdFERoute(r.plan),speeds:r.plan.ships.map(hdFEShipSpeed),search:r.search,measure:r.measure,readiness:r.readiness,master:hdFEMasterValidation(r.plan),scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),gameMatch:hdFEGameMatch(r.plan),names:r.plan.ships.map(s=>s.ship),gear:r.plan.ships.map(s=>s.items),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),shortages:r.shortages.map(g=>({kind:g.goalKind||g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g),stock:g.stock,owned:g.owned,blocked:g.blocked,placement:g.placement,carrierTargets:g.carrierTargets?.map(t=>({...t,slots:t.slots.map(slot=>({...slot,capacity:hdShipDbSlotProfile(hdFEFindShip(t.ship)).slots[slot.index]}))}))})),preservationIssues:r.plan.preservationIssues||[]};
   },index);
   evidence.samples.push(sample);
   expect(sample.names).toEqual(ref.shipNames);
   expect(sample.search).toMatchObject({maxExamined:10000,maxDepth:24,status:'incomplete',exhaustive:false});
   expect(sample.measure.speedTarget).toBe(0);expect(sample.search.portSeed.maxOperations).toBe(800);
   expect(sample.measure.goals.some(g=>['speed-ship','low-speed-ships','radar-ships','drum-ships','cap-asw'].includes(g.kind))).toBe(false);
   for(const [key,n]of Object.entries(sample.usage))expect(n).toBeLessThanOrEqual(sample.stock[key]||0);
   await panel.locator('[data-hd-required-route] summary').click();
   const checks=panel.locator('[data-hd-required-route]');
   // K→P is the fixed graph edge already verified by orderedPathsExist; it is not an extra fleet predicate.
   for(const node of ['B→K','P→S'])await expect(checks).toContainText(node);
   const routeNotes=page.locator(`#mapStrategyNavigator [data-hd-route-requirements="5-5:${index}"]`);
   await expect(routeNotes).toHaveCount(1);await expect(routeNotes).toContainText('BKPS');await expect(routeNotes).toContainText('80');
   await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('手持ち装備の不足を証明するものではありません');
   if(state==='ready'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.gear.flat().filter(x=>x.name==='零式水上観測機')).toHaveLength(6);
    expect(sample.usage['零式水上観測機@@0']).toBe(6);expect(sample.stock['零式水上観測機@@0']).toBe(6);
    expect(sample.scouting).toMatchObject({status:'ready',available:true,coef:2});expect(sample.scouting.score).toBeCloseTo(readyScore,8);
    expect(sample.measure.goals.find(g=>g.kind==='los-value')).toMatchObject({ok:true,minCount:80});
    expect(sample.measure.goals.find(g=>g.kind==='cap-carrier-attack')).toMatchObject({ok:true,count:2,minCount:2,purpose:'recommendation'});
    expect(sample.measure.goals.find(g=>g.kind==='cap-night-auto')).toMatchObject({ok:true,count:1,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');expect(sample.readiness.registeredReady).toBe(false);
   }else if(state==='exempt'){
    expect(sample.route.status).toBe('ready');expect(sample.measure.requiredChecks.every(c=>c.ok)).toBe(true);
    expect(sample.speeds.every(s=>s.known&&s.rank>=15&&!s.invalid.length&&!s.expansionUnconfirmed)).toBe(true);expect(sample.speeds.some(s=>s.rank<20)).toBe(true);
    expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');
    expect(sample.usage['改良型艦本式タービン@@0']).toBe(6);expect(sample.usage['新型高温高圧缶@@0']).toBe(6);
    expect(sample.usage['流星@@0']).toBe(2);expect(sample.stock['流星@@0']).toBe(2);
    expect(sample.gear[2].filter(x=>x.name==='流星')).toHaveLength(1);expect(sample.gear[3].filter(x=>x.name==='流星')).toHaveLength(1);
    expect(sample.scouting).toMatchObject({status:'ready',available:false,notRequired:true,reason:'exempt',score:null});expect(sample.scouting.detail).toContain('P→S');
    expect(sample.measure.scoutingExempt).toBe(true);expect(sample.measure.goals.some(g=>['los-value','索敵'].includes(g.kind))).toBe(false);
    expect(sample.shortages.some(g=>['los-value','索敵'].includes(g.kind))).toBe(false);
    expect(sample.measure.goals.find(g=>g.kind==='cap-carrier-attack')).toMatchObject({ok:true,count:2,minCount:2,purpose:'recommendation'});
    expect(sample.measure.goals.filter(g=>g.kind!=='air-value').every(g=>g.ok)).toBe(true);
    expect(sample.shortages).toEqual([]);expect(sample.search.reasons).toContain('air-target-unselected');expect(sample.readiness.registeredReady).toBe(false);
    await expect(checks).toContainText('索敵条件は非適用');await expect(checks).not.toContainText('M→P');
    await expect(panel.locator('[data-hd-oc-acquire="索敵"]')).toHaveCount(0);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'索敵分岐の安全域'})).toHaveCount(0);
   }else if(state==='stock'){
    expect(sample.route.status).toBe('missing');expect(sample.master.valid).toBe(true);expect(sample.gameMatch.status).toBe('ready');expect(sample.usage).toEqual({});
    expect(sample.scouting).toMatchObject({available:true,coef:2});expect(sample.scouting.score).toBeCloseTo(stockScore,8);
    const los=sample.measure.goals.find(g=>g.kind==='los-value');expect(los).toMatchObject({ok:false,minCount:80});expect(!!los.unresolved).toBe(false);expect(los.count).toBeCloseTo(stockScore,8);
    expect(sample.shortages.find(g=>g.kind==='los-value').shortfall).toBeCloseTo(80-stockScore,8);
    expect(sample.readiness.registeredReady).toBe(false);
    await expect(panel.locator('.hd-oc-goal').filter({hasText:'索敵分岐の安全域'})).toContainText('33式 -9.58 / 安全域 80');
    const losCard=panel.locator('.hd-oc-shortage').filter({hasText:'索敵分岐の安全域に必要なもの'});
    await expect(losCard).toContainText('33式 -9.58 / 安全域 80（あと 89.58）');
    for(const text of ['性能・搭載枠を増やす必要あり','装備候補：','装備可能な枠は最大','他の条件と共用'])await expect(losCard).toContainText(text);
    // Scouting-score points do not establish an equipment purchase count.
    await expect(losCard.locator('[data-hd-oc-procure]')).toHaveCount(0);
    await expect(losCard).not.toContainText(/89\.58\s*個|配備不足\s*90個|必要な\s*80個/);
    expect(sample.shortages.find(g=>g.kind==='los-value').stockGap).toBe(0);
    const attacks=sample.shortages.find(g=>g.kind==='cap-carrier-attack');
    expect(attacks).toMatchObject({shortfall:2,stock:{complete:false,parts:[{part:'carrierAttackPlane',have:0,need:2}]}});
    expect(attacks.carrierTargets.map(t=>({ship:t.ship,count:t.count,status:t.status,unknownSlots:t.unknownSlots}))).toEqual(['赤城改','加賀改'].map(ship=>({ship,count:1,status:'candidate',unknownSlots:false})));
    for(const target of attacks.carrierTargets){expect(target.slots.length).toBeGreaterThan(0);for(const slot of target.slots){expect(slot.capacity).toBeGreaterThan(0);expect(slot.candidates.length).toBeGreaterThan(0)}}
    const attackCard=panel.locator('.hd-oc-shortage').filter({hasText:'空母の攻撃機配備に必要なもの'});
    await expect(attackCard).toContainText('艦上攻撃機・艦上爆撃機：所持0 / この装備例に必要2・あと2個');
    const targets=attackCard.locator('[data-hd-oc-carrier-targets]');
    for(const ship of ['赤城改','加賀改'])await expect(targets).toContainText(ship+'：艦上攻撃機・艦上爆撃機1個');
    for(const text of ['第1枠','流星','天山','戦闘上の推奨で、経路の必須条件ではありません','未所持品を含む','他の目標と共用','同時配備の成立や購入数量を保証しません'])await expect(targets).toContainText(text);
    await expect(targets).not.toContainText('長門改二：');await expect(targets).not.toContainText('鳥海改二：');
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
   await page.locator('#customFleetPanel [data-cf-id="five-five"] [data-cf-edit]').click();
   await page.locator('#customFleetMemo').fill('keep memo / edited');
   await page.locator('#customFleetDialog button[value="default"]').click();
  }
  evidence.saved=await page.evaluate(ref=>{
   const all=loadCustomFleets(),f=all['5-5'][0];
   return {sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(all['5-5'][1])===ref.other,otherMap:JSON.stringify(all['1-1'])===ref.otherMap,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,identitiesExact:JSON.stringify(f.ships.map(({ship,rosterId,gameShipId,masterId,metadata})=>({ship,rosterId,gameShipId,masterId,metadata})))===ref.identities,metadata:f.metadata,memo:f.memo,routeAssessment:f.routeAssessment?.status,searchAssessment:f.searchAssessment,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom};
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
  const doc=await page.evaluate(installSource=>{(0,eval)('('+installSource+')')();return performance.timeOrigin},installNavigation.toString());await page.evaluate(()=>hdMSNOpen('5-5'));
  await expect(page.locator('#hdMapStrategyRoute')).toHaveValue(String(index));
  evidence.stage='after-load-search';await search();
  evidence.load=await page.evaluate(({ref,saved,doc})=>{
   const f=loadCustomFleets()['5-5'][0];
   return {sameDocument:performance.timeOrigin===doc,readyState:document.readyState,customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===saved,sourcesExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner,procurement:localStorage.getItem(HD_PROCUREMENT_KEY)===ref.procurement,route:hdFERoute(hdFEPlanFromSavedFleet('5-5',f)).status,searchAssessment:f.searchAssessment};
  },{ref,saved,doc});
  expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',customExact:true,sourcesExact:true,otherPlanner:true,procurement:true,route:state==='unknown'?'manual':state==='stock'?'missing':'ready'});
  if(state!=='unknown')expect(evidence.load.searchAssessment).toEqual(evidence.saved.searchAssessment);
  expect(errors).toEqual([]);evidence.stage='completed';
 }finally{
  try{evidence.navigation.push(await page.evaluate(snapshotNavigation))}catch{evidence.navigationCollectionFailures++}
  evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'});
 }
});
