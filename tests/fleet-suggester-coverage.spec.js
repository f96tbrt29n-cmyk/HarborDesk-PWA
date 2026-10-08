const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFSOpen==='function');
 await page.evaluate(()=>{
  const types=['駆逐艦','軽巡洋艦','重巡洋艦','航空巡洋艦','重雷装巡洋艦','高速戦艦','航空戦艦','正規空母','軽空母','水上機母艦','潜水艦','潜水母艦','海防艦'];
  const rows=types.flatMap(type=>Array.from({length:6},(_,i)=>({id:type+i,name:'回帰テスト'+type+i,type,level:90,tags:[]})));
  rows.push({id:'haguro',name:'羽黒改二',type:'重巡洋艦',level:90,tags:[]},{id:'ashigara',name:'足柄改二',type:'重巡洋艦',level:90,tags:[]});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
 });
}
test('all normal maps open owned fleet candidates from the fleet tab',async({page})=>{
 test.setTimeout(300000);
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
   const candidate=page.locator('#hdFleetSuggester .hd-fs-card').first();
   await expect(candidate.locator('.hd-fs-ship.missing')).toHaveCount(0);
   await expect(candidate).not.toContainText('編成条件が未確認');
   const selected=await page.evaluate(map=>hdFSPlans(map)[0].slots.map(s=>s.profile?.row?.id),map);
   expect(selected.length).toBeGreaterThan(0);
   expect(new Set(selected).size).toBe(selected.length);
   if(map==='6-4')await expect(candidate.locator('.hd-fs-ship').first()).toContainText('軽巡');
   if(map==='7-3')await expect(candidate).toContainText('羽黒改二');
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
test('concrete examples fill every stage and preserve scarce and required ships',async({page})=>{
 await boot(page);
 const plans=await page.evaluate(()=>Object.entries(HD_MAP_FLEET_EXAMPLES).flatMap(([map])=>hdFSPlans(map).map(plan=>({map,name:plan.preset.name,filled:plan.filled,total:plan.info.total,manual:plan.info.conditionManual,missing:plan.missing}))));
 for(const plan of plans){expect(plan.manual,plan.map+' '+plan.name).toBe(false);expect(plan.filled,plan.map+' '+plan.name).toBe(plan.total);expect(plan.missing).toEqual([])}
 const scarce=await page.evaluate(()=>{
  const types=['正規空母','軽空母','重巡洋艦','重巡洋艦','軽巡洋艦','軽巡洋艦'];
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(types.map((type,i)=>({id:'scarce'+i,name:'テスト艦'+i,type,level:90,tags:[]}))));
  return hdFSPlans('2-1')[0].filled;
 });
 expect(scarce).toBe(6);
 const named=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(Array.from({length:6},(_,i)=>({id:'dd'+i,name:'テスト駆逐'+i,type:'駆逐艦',level:90,tags:[]}))));
  const plan=hdFSPlans('7-3')[0];return {filled:plan.filled,missing:plan.missing};
 });
 expect(named.filled).toBe(3);expect(named.missing).toEqual(['羽黒']);
});
