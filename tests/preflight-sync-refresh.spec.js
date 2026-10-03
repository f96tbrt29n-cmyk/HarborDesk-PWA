const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)?route.continue():route.fulfill({status:204,body:''})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFEEvaluate==='function');
 await page.evaluate(()=>{
  saveCustomFleets({'3-2':[{id:'first',name:'編成1',ships:[{ship:'吹雪',masterId:1,gameShipId:11,gear:''}]},{id:'second',name:'編成2',ships:[{ship:'吹雪',masterId:1,gameShipId:11,gear:''}]}]});
  hdMSNOpen('3-2');
 });
 await page.locator('#hdMapStrategyRoute').selectOption('1');
 await page.locator('#hdMapStrategyFleet').selectOption('second');
}
test('navigator refreshes live condition after sync and roster changes while keeping all selections',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 const health=page.locator('.hd-msn-check').filter({has:page.locator('b',{hasText:'艦状態'})});
 await expect(health).toContainText('同期状態不明');
 await page.evaluate(()=>rosterSave([{id:'manual',name:'吹雪',masterId:1,level:25}]));
 await expect(health).toHaveClass(/manual/);
 await expect(health).toContainText('同期状態不明');
 await page.evaluate(()=>hdKcHandleBridgeImport(JSON.stringify({format:'harbordesk-kancolle-import',version:2,captureId:'preflight',records:[{endpoint:'/kcsapi/api_port/port',at:Date.now(),payload:{api_result:1,api_data:{api_ship:[{api_id:11,api_ship_id:1,api_lv:25,api_nowhp:1,api_maxhp:15,api_cond:49,api_slot:[],api_fuel:15,api_bull:20}],api_deck_port:[],api_material:[]}}}]})));
 await expect(health).toHaveClass(/missing/);
 await expect(health).toContainText('大破');
 await page.evaluate(()=>{const rows=rosterLoad();rows[0].gameHp=15;rosterSave(rows)});
 await expect(health).toHaveClass(/ready/);
 await expect(health).toContainText('艦状態OK');
 await expect(page.locator('#hdMapStrategyMap')).toHaveValue('3-2');
 await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('1');
 await expect(page.locator('#hdMapStrategyFleet')).toHaveValue('second');
 const other=await page.context().newPage();await other.goto('http://127.0.0.1:4173/app-version.json');
 await other.evaluate(()=>{const rows=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));rows[0].gameHp=1;localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows))});
 await expect(health).toHaveClass(/missing/);
 await expect(page.locator('#hdMapStrategyFleet')).toHaveValue('second');
 await other.close();expect(errors).toEqual([]);
});
test('registered ships with incomplete condition stay unverified, and known damage still blocks',async({page})=>{
 await boot(page);
 const states=await page.evaluate(()=>{
  const condition=row=>{
   localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'manual',name:'吹雪',masterId:1,...row}]));
   return hdFEEvaluate({map:'3-2',ships:[{ship:'吹雪',masterId:1,items:[]}]}).auto.checks.find(x=>x.id==='health');
  };
  return [condition({}),condition({gameHp:15,gameMaxHp:15}),condition({gameHp:0,gameMaxHp:15}),condition({gameHp:15,gameMaxHp:15,gameCond:49})];
 });
 expect(states.map(x=>x.status)).toEqual(['manual','manual','missing','ready']);
 expect(states[0].detail).toContain('同期状態不明');expect(states[1].detail).toContain('同期状態不明');
 expect(states[2].detail).toContain('大破');
});
test('changing a roster immediately updates the sortie checklist registration count',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{hdSelectGuideMap('3-2');hdWSShowElement('guide',false);hdSortieOpenTab('mine')});
 const check=page.locator('#hdSortieReadiness');await expect(check).toContainText('0/1隻を台帳で確認');
 await page.evaluate(()=>rosterSave([{id:'manual',name:'吹雪',masterId:1,level:25}]));
 await expect(check).toContainText('1/1隻を台帳で確認');
 await page.evaluate(()=>rosterSave([]));
 await expect(check).toContainText('0/1隻を台帳で確認');
});
test('navigator preparation opens the selected map and saved fleet rather than the guide defaults',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{hdSelectGuideMap('1-1');hdMSNOpen('3-2')});
 await page.locator('[data-hd-msn-action="preparation"]').click();
 await expect(page.locator('#hdSortiePreparation')).toBeVisible();
 await expect(page.locator('#hdSortiePreparationBody')).toContainText('編成2');
 expect(await page.evaluate(()=>({map:selectedMap,fleet:hdSPSFleet(selectedMap)?.id}))).toEqual({map:'3-2',fleet:'second'});
});
test('navigator issue buttons open the matching tool with the current fleet evaluation',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{hdSelectGuideMap('1-1');hdMSNOpen('3-2');window.__hdFELastAuto={checks:[{id:'health',status:'ready',detail:'other fleet'}]}});
 const health=page.locator('.hd-msn-check').filter({has:page.locator('[data-hd-msn-fix="health"]')});
 await expect(health).toContainText('同期状態不明');
 expect(await health.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.locator('[data-hd-msn-fix="health"]').click();
 await expect(page.locator('#kancolleImport')).toBeVisible();
 expect(await page.evaluate(()=>({map:selectedMap,fleet:hdSortieSelection(selectedMap),flow:hdFEFixFlowLoad()}))).toMatchObject({map:'3-2',fleet:'second',flow:{id:'health',map:'3-2',beforeStatus:'manual'}});
 await page.evaluate(()=>hdMSNOpen('3-2'));
 await page.locator('[data-hd-msn-fix="air"]').click();
 expect(await page.evaluate(()=>hdFEFixFlowLoad())).toMatchObject({id:'air',map:'3-2'});
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
 await expect(page.locator('#hdFCFleetSelect')).toHaveValue('second');
});
test('returning to navigator immediately cancels delayed navigation from the previous fix',async({page})=>{
 await boot(page);
 for(const id of ['health','master','route','air']){
  await page.evaluate(async id=>{
   hdFEOpenFix(id,{checks:[{id,status:'manual',detail:'未確認'}]});
   hdMSNOpen('3-2');
   await new Promise(resolve=>setTimeout(resolve,250));
  },id);
  await expect(page.locator('#mapStrategyNavigator')).toBeVisible();
  expect(await page.evaluate(()=>hdWSCurrentLocation())).toMatchObject({group:'guide',section:'mapStrategyNavigator'});
 }
});

test('calculator activation survives a repeat guide reveal without waiting for deferred navigation',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{hdSelectGuideMap('3-2');hdFEOpenCalculator();hdWSShowElement('guide',false)});
 await expect(page.locator('[data-map-pane="gear"]')).toHaveClass(/active/);
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
});

test('navigator calculator link carries the chosen fleet and keeps its saved inputs',async({page})=>{
 await boot(page);
 await page.evaluate(()=>hdFCMutate('3-2','second',state=>state.hqLevel=88));
 await page.locator('[data-hd-msn-action="calculator"]').click();
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
 await expect(page.locator('#hdFCFleetSelect')).toHaveValue('second');
 await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('88');
});

test('a sync refresh between pressing and releasing a navigator button keeps the tap',async({page})=>{
 await boot(page);
 const button=page.locator('[data-hd-msn-fix="air"]');
 await button.scrollIntoViewIfNeeded();
 const box=await button.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();
 await page.evaluate(async()=>{
  rosterSave([{id:'manual',name:'吹雪',masterId:1,gameHp:15,gameMaxHp:15,gameCond:49}]);
  await new Promise(resolve=>setTimeout(resolve,120));
 });
 await page.mouse.up();
 await expect(page.locator('.hd-msn-check').filter({has:page.locator('b',{hasText:'艦状態'})})).toContainText('艦状態OK');
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
 expect(await page.evaluate(()=>hdFEFixFlowLoad()?.id)).toBe('air');
});


test('unchanged navigator refresh keeps a focused button usable from the keyboard',async({page})=>{
 await boot(page);
 const button=page.locator('[data-hd-msn-fix="air"]');
 await button.focus();
 await page.evaluate(()=>hdMSNRender());
 await expect(button).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
 await expect(page.locator('#hdFCFleetSelect')).toHaveValue('second');
});

test('returning from sync to navigator finishes scrolling before the next tool tap',async({page})=>{
 await boot(page);
 await page.locator('[data-hd-msn-fix="health"]').click();
 await expect(page.locator('#kancolleImport')).toBeVisible();
 const position=await page.evaluate(async()=>{
  hdMSNOpen('3-2');
  const section=document.getElementById('mapStrategyNavigator');
  const start=section.getBoundingClientRect().top;
  await new Promise(resolve=>setTimeout(resolve,200));
  return {start,end:section.getBoundingClientRect().top};
 });
 expect(Math.abs(position.end-position.start)).toBeLessThan(1);
 await page.locator('[data-hd-msn-fix="air"]').click();
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();
 await expect(page.locator('#hdFCFleetSelect')).toHaveValue('second');
});
