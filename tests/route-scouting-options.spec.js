const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',trace:{mode:'on',snapshots:false,screenshots:true,sources:true},video:'on'});
// Reuses the prior synthetic FGK arithmetic fixture, never user backup data.
// sqrt9+5*sqrt25 + 4*(5*.6)*4 - ceil(120*.4)=28.
// Replacing one LOS5 radar by LOS7 gives reference32.8 ONLY with unchanged
// effective bare inputs. Actual changed ship bonuses are NOT established.
async function prepare(page,state){
  await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
  const reference=await page.evaluate(state=>{
   const radar='22号対水上電探改四',fish='61cm四連装(酸素)魚雷',names=['矢矧改二','島風改','夕立改二','時雨改二','綾波改二','雪風改'],base=[9,25,25,25,25,25];
   if(hdFEFind(radar)?.stats?.索敵!==5)throw Error('fixture requires the documented radar LOS5');
   const live=names.map((name,i)=>Array.from({length:hdShipDbSlotProfile(hdFEFindShip(name)).count},(_,j)=>state==='missing'?'':i===0?(j<2?fish:j===2?radar:''):i<4&&j===0?radar:''));
   const rows=names.map((name,i)=>({id:'south-'+i,name,masterId:hdShipDbMasterRowFor(name).id,gameShipId:11000+i,level:90,gameSlotEx:0,gameLos:base[i]+(state==='missing'?0:i<4?5:0),gameAswGearKnown:true,gameGearSlots:live[i],gameGearExpansion:'',metadata:{keep:i}}));
   const inventory=state==='missing'?[]:[{name:radar,count:4,star:0},{name:fish,count:2,star:0},{name:'33号水上電探',count:1,star:0}];localStorage.setItem(SHIP_ROSTER_KEY,JSON.stringify(rows));localStorage.setItem(HD_FL_KEY,JSON.stringify(inventory));localStorage.setItem('harbordesk-kancolle-fleets-v1',JSON.stringify([{deckId:1,name:'合成FGK',ships:rows.map(r=>({gameShipId:r.gameShipId,gearKnown:true}))}]));localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify(state==='unknown'?{metadata:{keep:true}}:{admiralLevel:120,metadata:{keep:true}}));
   saveCustomFleets({'3-5':[{id:'south',name:'合成：下ルート索敵',routePreset:MAP_PLANS['3-5'].presets[0],openingAswCount:0,metadata:{keep:true},ships:rows.map((r,i)=>({ship:r.name,masterId:r.masterId,gameShipId:r.gameShipId,rosterId:r.id,gear:live[i].join(' / '),metadata:{keep:i}}))},{id:'other',routePreset:MAP_PLANS['3-5'].presets[1],metadata:{keep:true},ships:[]}],'1-1':[{id:'other-map',metadata:{keep:true},ships:[]}]});
   localStorage.setItem(HD_PROCUREMENT_KEY,JSON.stringify([{id:'untouched',map:'1-1',metadata:{keep:true},gearItems:[]}]));localStorage.setItem(HD_FC_KEY,JSON.stringify({'1-1:unrelated':{metadata:{keep:true}}}));hdMapRouteSet('3-5',0);hdMSNOpen('1-1');const f=loadCustomFleets();return {keys:[SHIP_ROSTER_KEY,HD_FL_KEY,'harbordesk-kancolle-sync-v1','harbordesk-kancolle-fleets-v1','harbordesk-pwa-v1'].map(k=>[k,localStorage.getItem(k)]),other:JSON.stringify(f['3-5'][1]),otherMap:JSON.stringify(f['1-1']),procurement:localStorage.getItem(HD_PROCUREMENT_KEY),custom:localStorage.getItem(CUSTOM_FLEET_KEY),otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])};
  },state);
  await page.locator('#hdMapStrategyMap').selectOption('3-5');await page.locator('#hdMapStrategyRoute').selectOption('0');await page.locator('#hdMapStrategyFleet').selectOption('south');const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');

 await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toBeVisible();
 return {panel,reference};
}
async function retained(page,reference){return page.evaluate(ref=>({sourceExact:ref.keys.every(([k,v])=>localStorage.getItem(k)===v),customExact:localStorage.getItem(CUSTOM_FLEET_KEY)===ref.custom,otherPlanner:JSON.stringify(JSON.parse(localStorage.getItem(HD_FC_KEY))['1-1:unrelated'])===ref.otherPlanner}),reference)}
async function evidenceFile(info,evidence){const p=info.outputPath('scouting-actions.json');await require('node:fs/promises').writeFile(p,JSON.stringify(evidence,null,2));await info.attach('scouting-actions',{path:p,contentType:'application/json'})}
test('south scouting optional equipment quantity is not a route procurement requirement',async({page},info)=>{
 const evidence={},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const {panel,reference}=await prepare(page,'missing');const shortage=panel.locator('.hd-oc-shortage').filter({has:page.locator('[data-hd-oc-acquire="索敵"]')}).filter({has:page.locator('[data-hd-oc-procure]')});
  evidence.beforeAction=await shortage.innerText();evidence.numeric=await page.evaluate(()=>HD_OC_CACHE.get('3-5:south:0').shortages.map(g=>({kind:g.goalKind||g.kind,min:g.minCount,shortfall:g.shortfall,stockGap:hdOCStockGap(g)})));
  await expect(shortage).toContainText('任意目安');await expect(shortage).toContainText('経路に必要な個数や確定調達数ではありません');
  await expect(panel.locator('[data-hd-oc-scouting-options]')).toContainText('登録台帳から表示できる交換候補はありません');
  expect(evidence.numeric.find(x=>x.kind==='los-value')).toMatchObject({shortfall:48,stockGap:0});
  await shortage.locator('[data-hd-oc-procure]').click();evidence.plan=await page.evaluate(()=>hdPLLoad());const item=evidence.plan.find(x=>x.map==='3-5').gearItems[0];expect(item.loadout).toContain('任意目安');expect(item.loadout).toContain('経路必要個数は未確定');expect(item.needed).toBe(2);expect(evidence.plan.find(x=>x.map==='1-1')).toEqual(JSON.parse(reference.procurement)[0]);
  const raw=await page.evaluate(()=>localStorage.getItem(HD_PROCUREMENT_KEY));await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');const doc=await page.evaluate(()=>performance.timeOrigin);
  evidence.load=await page.evaluate(({raw,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,planExact:localStorage.getItem(HD_PROCUREMENT_KEY)===raw,html:hdPLGearItemHtml('3-5',hdPLLoad().find(x=>x.map==='3-5').gearItems[0])}),{raw,doc});expect(evidence.load).toMatchObject({sameDocument:true,readyState:'complete',planExact:true});expect(evidence.load.html).toContain('任意目安');evidence.retained=await retained(page,reference);expect(evidence.retained).toEqual({sourceExact:true,customExact:true,otherPlanner:true});expect(errors).toEqual([]);
 }finally{evidence.pageerrors=errors;await evidenceFile(info,evidence)}
});
test('south scouting owned swap remains a manual reference through edit and load',async({page},info)=>{
 const evidence={},errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const {panel,reference}=await prepare(page,'ready');const options=panel.locator('[data-hd-oc-scouting-options]');await expect(options).toContainText('33号水上電探');await expect(options).toContainText('登録1個 / 現在案0個 / 未使用1個');await expect(options).toContainText('交換後の索敵値は未計算');await expect(options).toContainText('ボーナス差分');evidence.options=await options.innerText();
  evidence.initial=await page.evaluate(()=>{const r=HD_OC_CACHE.get('3-5:south:0');return {scouting:hdFEPlanScouting(r.plan,hdOCAssigned(r.plan)),usage:hdFOAssignedUsage(r.plan),stock:Object.fromEntries([...hdFLInventory().values()].map(x=>[x.key,x.count])),validation:hdFEMasterValidation(r.plan)}});expect(evidence.initial.scouting.score).toBe(28);expect(evidence.initial.validation.valid).toBe(true);for(const [k,n] of Object.entries(evidence.initial.usage))expect(n).toBeLessThanOrEqual(evidence.initial.stock[k]);
  await panel.locator('[data-hd-oc-calculator]').click();const calculator=page.locator('#hdFleetCalculator');await expect(calculator).toBeVisible();await calculator.locator('[data-hd-fc-gear="2"]').selectOption('33号水上電探');
  const result=calculator.locator('.hd-fc-results>div').filter({hasText:'33式索敵'});await expect(result).toContainText('32.80');await expect(result).toContainText('手入力の参考値');await expect(calculator.locator('[data-hd-fc-assessment]')).toContainText('攻略条件は未判定');await expect(calculator.locator('[data-hd-fc-proposal]')).toContainText('艦固有ボーナスを確認済みの値ではありません');
  evidence.edited={result:await result.innerText(),assessment:await calculator.locator('[data-hd-fc-assessment]').innerText(),proposal:await calculator.locator('[data-hd-fc-proposal]').innerText()};
  const raw=await page.evaluate(()=>localStorage.getItem(HD_FC_KEY));await page.reload({waitUntil:'load'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEOpenCalculator==='function');const doc=await page.evaluate(()=>performance.timeOrigin);await page.evaluate(()=>{hdSelectGuideMap('3-5');hdFEOpenCalculator()});
  await expect(result).toContainText('32.80');await expect(result).toContainText('手入力の参考値');await expect(calculator.locator('[data-hd-fc-assessment]')).toContainText('攻略条件は未判定');await expect(calculator.locator('[data-hd-fc-gear="2"]')).toHaveValue('33号水上電探');
  evidence.load=await page.evaluate(({raw,doc})=>({sameDocument:performance.timeOrigin===doc,readyState:document.readyState,plannerExact:localStorage.getItem(HD_FC_KEY)===raw}),{raw,doc});expect(evidence.load).toEqual({sameDocument:true,readyState:'complete',plannerExact:true});
  await calculator.locator('[data-hd-fc-gear="2"]').selectOption('22号対水上電探改四');await expect(result).toContainText('28.00');await expect(calculator.locator('[data-hd-fc-assessment]')).toContainText('攻略条件は未判定');evidence.retained=await retained(page,reference);expect(evidence.retained).toEqual({sourceExact:true,customExact:true,otherPlanner:true});expect(errors).toEqual([]);
 }finally{evidence.pageerrors=errors;await evidenceFile(info,evidence)}
});
