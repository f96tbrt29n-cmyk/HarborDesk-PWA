const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
async function boot(page){await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEGraphRoute==='function')}
// Full UI coverage for the distinct H-avoidance goal, without replacing checks.
 for(const state of ['ready','stock','unknown'])test(`H avoidance ${state} preserves route reasons through save and load`,async({page},info)=>{
  const evidence={state},errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await boot(page);
   const prepared=await page.evaluate(state=>{
    const names=['矢矧改二','島風改','夕立改二','時雨改二','綾波改二',state==='unknown'?'合成・未登録の駆逐艦':'雪風改'];
    const gear=names.map((_,i)=>i===5&&state==='unknown'?[]:i===0?['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷','強化型艦本式缶','改良型艦本式タービン']:[i===5&&state==='ready'?'':'改良型艦本式タービン','強化型艦本式缶',...(i===1&&state!=='stock'?['13号対空電探']:[])]);
    const rows=names.map((name,i)=>({id:'h-avoid-'+i,name,masterId:hdShipDbMasterRowFor(name)?.id||0,gameShipId:10300+i,level:90,gameSlotEx:0,gameGearSlots:gear[i],gameGearExpansion:'',metadata:{keep:i}}));
    const inventory=[{name:'改良型艦本式タービン',count:6,star:0},{name:'強化型艦本式缶',count:6,star:0},{name:'61cm四連装(酸素)魚雷',count:2,star:0},...(state==='stock'?[]:[{name:'13号対空電探',count:1,star:0}])];
    localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
    saveCustomFleets({'3-2':[{id:'h-avoid',name:'合成：H回避の判断',routePreset:MAP_PLANS['3-2'].presets[0],routeGoal:'normal',openingAswCount:0,metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:gear[i].join(' / '),metadata:{keep:i}}))},{id:'other',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});hdMapRouteSet('3-2',0);hdMSNOpen('1-1');
    const all=loadCustomFleets();return {meta:{names,inventory},reference:{custom:localStorage.getItem(CUSTOM_FLEET_KEY),keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(all['3-2'][1]),otherMap:JSON.stringify(all['1-1'])}};
   },state);evidence.setup=prepared.meta;
   await page.locator('#hdMapStrategyMap').selectOption('3-2');await page.locator('#hdMapStrategyRoute').selectOption('0');await page.locator('#hdMapStrategyFleet').selectOption('h-avoid');
   const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-route-goal]').selectOption('fastPlus');
   evidence.preflight=await page.evaluate(()=>{const c=hdOCContext('3-2','h-avoid',0),b=hdOCBuild(c);return hdOCMeasure(b.plan,hdSEChecks('3-2').rows,b.unknown)});
   async function searchAndCheck(){
    await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
    await expect(panel.locator('[data-hd-oc-route-air]')).toContainText('この選択経路に数値制空目標はありません');
    const r=await page.evaluate(()=>{const c=hdOCContext('3-2','h-avoid',0),r=HD_OC_CACHE.get('3-2:h-avoid:0');return {branch:hdFEBranchRoute(r.plan),goals:r.measure.goals,readiness:r.readiness,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),master:hdFEMasterValidation(r.plan),regressions:hdOCGoalRegressions(hdOCMeasure(hdOCBuild(c).plan,hdSEChecks('3-2').rows),r.measure),shortages:r.shortages.map(g=>({goalKind:g.goalKind,kind:g.kind,shortfall:g.shortfall,stockGap:hdOCStockGap(g)}))}});
    (evidence.receivedSamples??=[]).push(r);
    expect(r.goals.filter(g=>g.kind==='los-value')).toEqual([]);expect(r.readiness.registeredReady).toBe(state==='ready');expect(r.regressions).toEqual([]);for(const [k,n] of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);
    const radar=panel.locator('.hd-oc-goal').filter({has:page.locator('strong').filter({hasText:'ルート用電探装備艦'})});
    await panel.locator('[data-hd-required-route] summary').click();
    await expect(panel.locator('[data-hd-required-route]')).toContainText('電探を各1個以上');await expect(panel.locator('[data-hd-required-route]')).not.toContainText('ドラム缶');
    if(state==='ready'){
     expect(r.branch).toMatchObject({status:'ready',arrivalGuaranteed:true,fixedPath:false});expect(r.branch.graph.paths.map(p=>p.slice(1).join('')).sort()).toEqual(['CEFL','CGFL']);expect(r.master.valid).toBe(true);expect(r.goals.filter(g=>g.kind==='speed-ship').every(g=>g.ok)).toBe(true);
     await expect(radar).toContainText('電探装備艦 1/1隻');await expect(panel.locator('[data-hd-required-route]')).toContainText('高速+統一 6/6隻');
    }else if(state==='stock'){
     expect(r.search).toMatchObject({examined:0,maxExamined:10000,status:'incomplete'});expect(r.search.reasons).toContain('route-radar-stock');await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('電探在庫0');
     expect(r.branch.status).toBe('missing');expect(r.goals.filter(g=>g.kind==='speed-ship').every(g=>g.ok)).toBe(true);expect(r.shortages.find(g=>g.goalKind==='radar-ships')).toMatchObject({shortfall:1,stockGap:1});
     await expect(radar).toContainText('電探装備艦 0/1隻（あと1隻）');await expect(panel.locator('.hd-oc-shortage').filter({hasText:'ルート用電探装備艦に必要なもの'})).toContainText('同じ艦の複数装備では増えません');
    }else{
     expect(r.search).toMatchObject({examined:0,maxExamined:10000,status:'incomplete'});expect(r.search.reasons).toContain('route-ship-data');await expect(panel.locator('[data-hd-oc-search-status]')).toContainText('未登録艦の情報不足');
     expect(r.branch.status).toBe('manual');expect(r.goals.find(g=>g.kind==='speed-ship'&&g.unresolved)).toMatchObject({ok:false});expect(r.shortages.some(g=>g.goalKind==='speed-ship')).toBe(false);
     await expect(panel.locator('.hd-oc-goal.manual').filter({has:page.locator('strong').filter({hasText:'合成・未登録の駆逐艦 の高速+条件'})})).toContainText('未判定');await expect(panel.locator('[data-hd-required-route]')).toContainText('速力未判定');
    }
    return r;
   }
   evidence.first=await searchAndCheck();await panel.locator('[data-hd-oc-apply]').click();
   if(state==='unknown')await expect(page.getByText(/元の保存編成は上書きしません/)).toBeVisible();
   evidence.saved=await page.evaluate(ref=>{const f=loadCustomFleets(),saved=f['3-2'][0];return {routeGoal:saved.routeGoal,assessment:saved.routeAssessment,metadata:saved.metadata,shipMetadata:saved.ships.map(s=>s.metadata),sourceUnchanged:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom,other:JSON.stringify(f['3-2'][1])===ref.other,otherMap:JSON.stringify(f['1-1'])===ref.otherMap,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v)}},prepared.reference);
   expect(evidence.saved).toMatchObject({metadata:{keep:true},other:true,otherMap:true,exact:true});expect(evidence.saved.shipMetadata).toEqual(Array.from({length:6},(_,keep)=>({keep})));
   if(state==='unknown')expect(evidence.saved.sourceUnchanged).toBe(true);else{expect(evidence.saved.routeGoal).toBe('fastPlus');expect(evidence.saved.assessment.status).toBe(state==='ready'?'ready':'missing')}
   await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');await page.evaluate(()=>hdMSNOpen('3-2'));
   await expect(panel.locator('[data-hd-oc-route-goal]')).toHaveValue('fastPlus');evidence.after=await searchAndCheck();evidence.load=await page.evaluate(ref=>({readyState:document.readyState,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(loadCustomFleets()['3-2'][1])===ref.other,otherMap:JSON.stringify(loadCustomFleets()['1-1'])===ref.otherMap}),prepared.reference);expect(evidence.load).toEqual({readyState:'complete',exact:true,other:true,otherMap:true});expect(errors).toEqual([]);
  }finally{evidence.pageerrors=errors;const file=info.outputPath('route-guidance-evidence.json');await require('node:fs').promises.writeFile(file,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:file,contentType:'application/json'})}
 });
