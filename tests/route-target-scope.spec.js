const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
for(const state of ['ready','stock','unknown'])test(`fixed CEFL ${state} keeps selected route targets through save and load`,async({page},info)=>{
 const evidence={state},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const reference=await page.evaluate(state=>{
   const rows=Array.from({length:6},(_,i)=>({id:'scope-'+i,name:'島風改',masterId:hdShipDbMasterRowFor('島風改').id,gameShipId:10800+i,level:90,gameSlotEx:i===5?1:0,metadata:{keep:i}}));
   const gear=rows.map((_,i)=>i<4?['改良型艦本式タービン','新型高温高圧缶','13号対空電探']:i===4?[state==='ready'?'':'改良型艦本式タービン','新型高温高圧缶']:['新型高温高圧缶','61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷']);
   const inventory=state==='stock'?[]:[{name:'改良型艦本式タービン',count:6,star:0},{name:'新型高温高圧缶',count:6,star:0},{name:'13号対空電探',count:4,star:0},{name:'61cm四連装(酸素)魚雷',count:2,star:0}];
   localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows.filter((_,i)=>state!=='unknown'||i!==0).map((r,i)=>({...r,gameGearSlots:gear[state==='unknown'?i+1:i],gameGearExpansion:r.gameSlotEx?'改良型艦本式タービン':''}))));
   localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:120,metadata:{keep:true}}));
   saveCustomFleets({'3-2':[{id:'scope',name:'合成：最速CEFL',routePreset:MAP_PLANS['3-2'].presets[1],routeGoal:'normal',openingAswCount:0,metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:gear[i].join(' / ')+(i===5?' / [増設] 改良型艦本式タービン':''),metadata:{keep:i}}))},{id:'other',routePreset:MAP_PLANS['3-2'].presets[0],routeGoal:'fastPlus',metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   hdMapRouteSet('3-2',1);hdMSNOpen('1-1');const f=loadCustomFleets();return {keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(f['3-2'][1]),otherMap:JSON.stringify(f['1-1'])};
  },state);
  await page.locator('#hdMapStrategyMap').selectOption('3-2');await page.locator('#hdMapStrategyRoute').selectOption('1');await page.locator('#hdMapStrategyFleet').selectOption('scope');
  const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-route-goal]').selectOption('fastest');
  evidence.preflight=await page.evaluate(()=>{const c=hdOCContext('3-2','scope',1),b=hdOCBuild(c);return {air:hdFEAirCheck(c.map,hdFEAir(hdOCAssigned(b.plan)),b.plan),measure:hdOCMeasure(b.plan,hdSEChecks(c.map).rows,b.unknown),ownership:hdOCShipOwnership(b.plan)}});
  // This assertion is also the matching before-fix control: no search or timeout change hides the wrong target.
  await expect(panel.locator('[data-hd-oc-route-air]')).toContainText('この選択経路に数値制空目標はありません');
  async function search(){
   await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
   const r=await page.evaluate(()=>{const r=HD_OC_CACHE.get('3-2:scope:1');return {branch:hdFEBranchRoute(r.plan),measure:r.measure,readiness:r.readiness,search:r.search,usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),master:hdFEMasterValidation(r.plan),ownership:hdOCShipOwnership(r.plan),plan:r.plan}});(evidence.samples??=[]).push(r);
   expect(r.measure.goals.some(g=>['air-value','los-value'].includes(g.kind))).toBe(false);expect(r.search.maxExamined).toBe(10000);expect(r.search.reasons).not.toContain('route-radar-stock');expect(r.search.reasons).not.toContain('route-ship-data');for(const [k,n] of Object.entries(r.usage))expect(n).toBeLessThanOrEqual(r.stock[k]);
   await panel.locator('[data-hd-required-route] summary').click();await expect(panel.locator('[data-hd-required-route]')).toContainText('最速統一');await expect(panel.locator('[data-hd-required-route]')).toContainText('別々の4隻に電探を各1個以上');
   if(state==='stock'){
    expect(r.branch.status).toBe('missing');expect(r.readiness.status).toBe('missing');await expect(panel.locator('[data-hd-required-route]')).toContainText('電探装備艦 0/4隻');await expect(panel.locator('.hd-oc-shortage').filter({hasText:'ルート用電探装備艦に必要なもの'})).toContainText('あと4隻必要');expect(r.usage).toEqual({});
   }else{
    expect(r.branch).toMatchObject({status:'ready',fixedPath:true});expect(r.branch.graph.paths.map(p=>p.slice(1).join(''))).toEqual(['CEFL']);expect(r.master.valid).toBe(true);await expect(panel.locator('[data-hd-required-route]')).toContainText('最速統一 6/6隻');await expect(panel.locator('[data-hd-required-route]')).toContainText('電探装備艦 4/4隻');
    if(state==='unknown'){expect(r.ownership[0].status).toBe('data');expect(r.readiness.status).toBe('manual');await expect(panel.locator('.hd-oc-result')).toContainText('保存編成が指定する個体を台帳で確認できません');}else expect(r.readiness.registeredReady).toBe(true);
   }
   return r;
  }
  evidence.first=await search();await panel.locator('[data-hd-oc-apply]').click();
  evidence.saved=await page.evaluate(ref=>{const f=loadCustomFleets(),s=f['3-2'][0];return {goal:s.routeGoal,assessment:s.routeAssessment,metadata:s.metadata,shipMetadata:s.ships.map(x=>x.metadata),ids:s.ships.map(x=>x.gameShipId),other:JSON.stringify(f['3-2'][1])===ref.other,otherMap:JSON.stringify(f['1-1'])===ref.otherMap,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v)}} ,reference);
  expect(evidence.saved).toMatchObject({goal:'fastest',metadata:{keep:true},other:true,otherMap:true,exact:true});expect(evidence.saved.ids).toEqual(Array.from({length:6},(_,i)=>10800+i));expect(evidence.saved.shipMetadata).toEqual(Array.from({length:6},(_,keep)=>({keep})));expect(evidence.saved.assessment.status).toBe(state==='stock'?'missing':'ready');
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdMSNOpen==='function');await page.evaluate(()=>hdMSNOpen('3-2'));await expect(panel.locator('[data-hd-oc-route-goal]')).toHaveValue('fastest');evidence.after=await search();
  evidence.load=await page.evaluate(ref=>({readyState:document.readyState,exact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),other:JSON.stringify(loadCustomFleets()['3-2'][1])===ref.other,otherMap:JSON.stringify(loadCustomFleets()['1-1'])===ref.otherMap}),reference);expect(evidence.load).toEqual({readyState:'complete',exact:true,other:true,otherMap:true});expect(errors).toEqual([]);
 }finally{evidence.pageerrors=errors;const p=info.outputPath('route-guidance-evidence.json');await require('node:fs').promises.writeFile(p,JSON.stringify(evidence,null,2));await info.attach('route-guidance-evidence',{path:p,contentType:'application/json'})}
});
