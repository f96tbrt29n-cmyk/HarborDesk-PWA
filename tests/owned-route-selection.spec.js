const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
async function openApp(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
}
test('owned equipment route selection overrides an earlier choice and saves the explored route',async({page})=>{
 test.setTimeout(120000);
 await openApp(page);
 await page.evaluate(()=>{
  const ships=['阿武隈改二','夕立改二','時雨改二','綾波改二','雪風改','島風改'].map(ship=>({ship,gear:''}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(ships.map((s,i)=>({id:'route'+i,name:s.ship,level:90,type:i?'駆逐艦':'軽巡洋艦'}))));
  const all=loadCustomFleets();all['3-5']=[{id:'route-owned',name:'名前を変更した編成',ships,routePreset:{...MAP_PLANS['3-5'].presets[1]}}];saveCustomFleets(all);
  localStorage.setItem('harbordesk-equipment-v1','[]');
  hdMapRouteSet('3-5',1);hdSelectGuideMap('3-5');window.hdWSMarkUserNavigation?.();hdWSShowElement('guide',true);hdMapActivateTab('mine');
 });
 const card=page.locator('#customFleetPanel [data-cf-id="route-owned"]');
 const route=card.locator('[data-hd-oc-inline-route]');
 await expect(route).toHaveValue('1');
 await route.selectOption('0');
 await expect(route).toHaveValue('0');
 expect(await page.evaluate(()=>hdMapRouteStored('3-5'))).toBe(0);
 await expect(card.locator('[data-hd-oc-search]')).toHaveAttribute('data-hd-oc-route','0');
 await page.evaluate(()=>hdMSNOpen('3-5'));
 await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('0');
 await page.evaluate(()=>{hdFSOpen()});
 await expect(page.locator('[data-hd-fs-route]')).toHaveValue('0');
 await page.evaluate(()=>{window.hdWSMarkUserNavigation?.();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 await card.locator('[data-hd-oc-search]').click();
 await expect(card.locator('[data-hd-oc-apply]')).toBeVisible();
 expect(await page.evaluate(()=>hdOCInlineResult('3-5','route-owned').plan.preset.use)).toContain('下ルート');
 await card.locator('[data-hd-oc-apply]').click();
 expect(await page.evaluate(()=>{
  const fleet=loadCustomFleets()['3-5'][0];return [fleet.routePreset.use,hdFEPlanFromSavedFleet('3-5',fleet).preset.use];
 })).toEqual(['下ルート・FGK','下ルート・FGK']);
 await page.evaluate(()=>hdMapRouteSet('3-5',1));
 await expect(route).toHaveValue('1');
 await expect(card.locator('[data-hd-oc-apply]')).toHaveCount(0);
 await page.evaluate(()=>{
  const p=MAP_PLANS['3-5'].presets[0],saved=JSON.parse(localStorage.getItem(HD_MAP_ROUTE_STORAGE));
  saved['3-5']={name:p.name,ships:p.ships};localStorage.setItem(HD_MAP_ROUTE_STORAGE,JSON.stringify(saved));
  window.dispatchEvent(new StorageEvent('storage',{key:HD_MAP_ROUTE_STORAGE}));
 });
 await expect(route).toHaveValue('0');
 await expect(card.locator('[data-hd-oc-search]')).toHaveAttribute('data-hd-oc-route','0');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCContext==='function');
 await page.evaluate(()=>{hdSelectGuideMap('3-5');window.hdWSMarkUserNavigation?.();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 await expect(route).toHaveValue('0');
 expect(await page.evaluate(()=>hdOCContext('3-5','route-owned').preset.use)).toContain('下ルート');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});
