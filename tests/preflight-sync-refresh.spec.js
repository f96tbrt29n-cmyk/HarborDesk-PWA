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
