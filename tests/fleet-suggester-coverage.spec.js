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
 const readiness=await page.evaluate(()=>{
  const ships=[{ship:'羽黒改二',type:'重巡洋艦'},...Array.from({length:3},(_,i)=>({ship:'テスト駆逐'+i,type:'駆逐艦'}))];
  const routeInfo=hdFSPresetInfo(MAP_PLANS['7-3'].presets[0]);
  return {match:hdFERoute({map:'7-3',ships,routeInfo}).status,wrong:hdFERoute({map:'7-3',ships:[{ship:'妙高改二',type:'重巡洋艦'},...ships.slice(1)],routeInfo}).status};
 });
 expect(readiness).toEqual({match:'ready',wrong:'missing'});
 const flagship=await page.evaluate(()=>{
  const ships=['阿武隈改二','金剛改二','最上改二','睦月改二','夕立改二','時雨改二'].map(ship=>({ship}));
  const routeInfo=hdFSPresetInfo(MAP_PLANS['6-4'].presets[0]);
  return {good:hdFERoute({map:'6-4',ships,routeInfo}),wrong:hdFERoute({map:'6-4',ships:[ships[1],ships[0],...ships.slice(2)],routeInfo}).detail};
 });
 expect(flagship.good).toMatchObject({status:'ready'});expect(flagship.wrong).toContain('旗艦条件未充足');
 const named=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(Array.from({length:6},(_,i)=>({id:'dd'+i,name:'テスト駆逐'+i,type:'駆逐艦',level:90,tags:[]}))));
  const plan=hdFSPlans('7-3')[0];return {filled:plan.filled,missing:plan.missing};
 });
 expect(named.filled).toBe(3);expect(named.missing).toEqual(['羽黒']);
});

test('route choices coordinate the navigator, survive reloads and stay attached to saved fleets',async({page})=>{
 test.setTimeout(120000);
 await boot(page);
 await page.evaluate(()=>{hdSelectGuideMap('3-5');hdFSOpen()});
 const chooser=page.locator('[data-hd-fs-route]');
 await expect(chooser).toHaveValue('all');
 await expect(page.locator('#hdFleetSuggester .hd-fs-card')).toHaveCount(2);
 await chooser.selectOption('1');
 const card=page.locator('#hdFleetSuggester .hd-fs-card');
 await expect(card).toHaveCount(1);await expect(card).toContainText('上ルート');
 expect(await page.evaluate(()=>hdFSPlans('3-5')[1].slots.filter(x=>x.required==='正規空母').length)).toBe(3);
 await card.locator('[data-hd-fs-save]').click();
 const saved=await page.evaluate(()=>{
  const fleet=loadCustomFleets()['3-5'][0];fleet.name='名前を変更した編成';
  return {route:fleet.routePreset,use:hdFEPlanFromSavedFleet('3-5',fleet).preset.use,html:hdSPSFleetHtml('3-5',{fleet,ships:fleet.ships,registered:6})};
 });
 expect(saved.route.use).toContain('上ルート');expect(saved.use).toContain('上ルート');expect(saved.html).toContain('保存した攻略ルート');
 const equipped=await page.evaluate(()=>{const plan=hdFLGenerate(1),fleet=hdFLSave(1);return {route:plan.suggestion.preset.use,saved:fleet.routePreset.use}});
 expect(equipped.route).toContain('上ルート');expect(equipped.saved).toContain('上ルート');
 await page.evaluate(()=>hdMSNOpen('3-5'));
 await expect(page.locator('#hdMapStrategyRoute')).toHaveValue('1');
 await page.locator('#hdMapStrategyRoute').selectOption('0');
 await page.evaluate(()=>hdFSOpen());
 await expect(chooser).toHaveValue('0');await expect(card).toContainText('下ルート');
 await chooser.selectOption('1');
 await page.evaluate(()=>{hdSelectGuideMap('7-5');hdFSOpen()});
 await expect(chooser).toHaveValue('all');await expect(card).toHaveCount(3);
 await chooser.selectOption('2');await expect(card).toHaveCount(1);await expect(card).toContainText('第3ゲージ');
 await page.evaluate(()=>{hdSelectGuideMap('3-5');hdFSOpen();window.dispatchEvent(new Event('hd:workspace-refresh'))});
 await expect(chooser).toHaveValue('1');await expect(card).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdFSOpen==='function');
 await page.evaluate(()=>{hdSelectGuideMap('3-5');hdFSOpen()});
 await expect(chooser).toHaveValue('1');await expect(card).toContainText('上ルート');
 await chooser.selectOption('all');await expect(card).toHaveCount(2);
 expect(await page.evaluate(()=>hdMapRouteStored('3-5'))).toBe(null);
 expect(await page.evaluate(()=>hdMapRouteStored('7-5'))).toBe(2);
});
