const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFSOpen==='function');
 await page.evaluate(()=>localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'test',name:'睦月改',type:'駆逐艦',level:50,tags:[]}])));
}
test('all normal maps open owned fleet candidates from the fleet tab',async({page})=>{
 test.setTimeout(180000);
 await boot(page);
 const maps=await page.evaluate(()=>Object.values(MAPS).flat());
 for(const map of maps){
  await test.step(map,async()=>{
   await page.evaluate(map=>{window.hdWSMarkUserNavigation?.();hdWSShowElement('guide',false);hdSelectGuideMap(map);hdMapActivateTab('fleet')},map);
   const button=page.locator('[data-map-pane="fleet"] [data-hd-map-tool="suggest"]');
   await expect(button).toBeVisible();await button.click();
   await expect(page.locator('#hdFleetSuggester')).toBeVisible();
   await expect(page.locator('#hdFleetSuggesterMap')).toHaveText(map);
   await expect(page.locator('#hdFleetSuggester .hd-fs-card').first()).toBeVisible();
  });
 }
});
test('late initialization and fallback map headers retain the fleet candidate entry',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{
  window.hdWSMarkUserNavigation?.();hdWSShowElement('guide',false);hdSelectGuideMap('5-6');document.getElementById('hdFleetSuggester')?.remove();
  hdMapRenderFallback();hdFSInstall();
 });
 await expect(page.locator('#selectedMapCard [data-hd-fs-open]')).toBeVisible();
 await page.locator('#selectedMapCard [data-hd-fs-open]').click();
 await expect(page.locator('#hdFleetSuggester')).toBeVisible();
 await expect(page.locator('#hdFleetSuggesterMap')).toHaveText('5-6');
});
