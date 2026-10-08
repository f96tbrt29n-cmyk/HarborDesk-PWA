const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
async function boot(page,synced=true){
 await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdOCSearch==='function');
 await page.evaluate(synced=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'試製烈風 後期型',count:1,star:6},{name:'彩雲',count:1,star:0}]));
  saveCustomFleets({'1-1':[{id:'proposal-fleet',name:'配備候補テスト',ships:[{ship:'赤城改',gameShipId:11,gear:'33号水上電探'}]}]});
  if(synced){localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:88}));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'赤城改',gameShipId:11,gameLos:80,gameGearSlots:['33号水上電探'],gameOnslot:[0,0,0,0]}]))}
  hdSEChecks=()=>({rows:[{kind:'制空',label:'艦戦',minCount:1},{kind:'索敵',label:'索敵装備',minCount:1}],adv:{}});hdFEEnemyAirCandidates=()=>[];
  hdFCMutate('1-1','manual',s=>s.hqLevel=77);hdMSNOpen('1-1');
 },synced);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('[data-hd-oc-calculator]')).toBeVisible();return panel;
}
test('owned search automatically reflects its exact proposal, not the saved or current game equipment',async({page})=>{
 const panel=await boot(page);
 const result=await page.evaluate(()=>{const c=hdOCContext('1-1','proposal-fleet',0),r=HD_OC_CACHE.get('1-1:proposal-fleet:0'),s=hdFCState('1-1',hdFCSelection('1-1'));return {plan:r.plan,state:s,manual:hdFCState('1-1','manual'),radarLos:Number(hdFCFind('33号水上電探').stats.索敵)}});
 expect(result.state.hqLevel).toBe(88);expect(result.state.ships[0].los).toBe(80-result.radarLos);expect(result.manual.hqLevel).toBe(77);
 expect(result.state.gear.map(x=>({name:x.name,star:x.star,slotIndex:x.slotIndex}))).toEqual(result.plan.ships.flatMap(s=>s.items).filter(x=>x.name).map(x=>({name:x.name,star:x.star,slotIndex:x.slotIndex})));
 expect(result.state.gear.some(x=>x.name==='33号水上電探')).toBe(false);expect(result.state.gear.find(x=>x.name==='試製烈風 後期型').slot).toBeGreaterThan(0);
 await panel.locator('[data-hd-oc-calculator]').click();
 await expect(page.locator('#hdFleetCalculator')).toBeVisible();await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('88');
 await expect(page.locator('[data-hd-fc-proposal]')).toContainText('提案された艦娘・装備・★・スロット位置を反映済み');
 await expect(page.locator('[data-hd-fc-gear]')).toHaveCount(result.state.gear.length);
 await page.reload();await page.waitForFunction(()=>document.body.dataset.hdReady==='1');await page.evaluate(()=>{hdSelectGuideMap('1-1');hdFEOpenCalculator()});
 await expect(page.locator('#hdFCFleetSelect')).toHaveValue('owned:proposal-fleet:0');await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('88');
});
test('headquarters sync updates the proposal without replacing manually adjusted proposed gear',async({page})=>{
 const panel=await boot(page);await panel.locator('[data-hd-oc-calculator]').click();
 await page.locator('[data-hd-fc-star="0"]').fill('9');await page.locator('[data-hd-fc-star="0"]').press('Tab');
 await expect.poll(()=>page.evaluate(()=>hdFCState('1-1',hdFCSelection('1-1')).gear[0].star)).toBe(9);
 await page.evaluate(()=>{localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:99}));window.dispatchEvent(new Event('hd:kancolle-sync'))});
 await expect(page.locator('[data-hd-fc-hq]')).toHaveValue('99');await expect(page.locator('[data-hd-fc-star="0"]')).toHaveValue('9');
 await expect(page.locator('[data-hd-fc-proposal]')).toContainText('手動調整あり');
});
test('missing synced scouting stays unverified and stale proposals cannot overwrite the calculator',async({page})=>{
 const panel=await boot(page,false);await panel.locator('[data-hd-oc-calculator]').click();
 await expect(page.locator('[data-hd-fc-ship-los="0"]')).toHaveValue('');await expect(page.locator('[data-hd-fc-proposal]')).toContainText('未判定：司令部Lvの同期、赤城改の素索敵');
 const check=await page.evaluate(()=>{const c=hdOCContext('1-1','proposal-fleet',0),r=HD_OC_CACHE.get('1-1:proposal-fleet:0'),before=localStorage.getItem(HD_FC_KEY);localStorage.setItem('harbordesk-equipment-v1','[]');return {accepted:hdFCImportOwnedPlan(c,r),unchanged:localStorage.getItem(HD_FC_KEY)===before}});
 expect(check).toEqual({accepted:false,unchanged:true});
});
test('proposal import preserves sparse slots and expansion equipment and never assigns maximum proficiency',async({page})=>{
 await boot(page);
 const s=await page.evaluate(()=>{const c=hdOCContext('1-1','proposal-fleet',0),r=HD_OC_CACHE.get('1-1:proposal-fleet:0');r.plan.ships[0].items=[{name:'彩雲',star:2,slotIndex:3,capacity:10}];r.plan.ships[0].expansion={name:'33号水上電探',star:4};hdFCImportOwnedPlan(c,r);return hdFCState('1-1',hdFCSelection('1-1'))});
 expect(s.gear).toMatchObject([{name:'彩雲',star:2,slotIndex:3,slot:10,maxProf:false},{name:'33号水上電探',star:4,slotIndex:null,slot:0,maxProf:false}]);
});
test.describe('mobile fleet picker',()=>{
test.use({hasTouch:true,isMobile:true});
test('fleet picker selects another saved fleet as the actual owned search target',async({page})=>{
 const panel=await boot(page);
 await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'].push({id:'second',name:'別の艦隊',ships:[{ship:'睦月改'}]});saveCustomFleets(all);hdMSNFleetByMap['1-1']='proposal-fleet';hdMSNRender()});
 await panel.locator('[data-hd-oc-select-fleet]').click();
 const picker=page.locator('#hdOCFleetPicker');await expect(picker).toBeVisible();
 await picker.locator('select').selectOption('second');await picker.locator('[data-hd-oc-fleet-use]').click();
 await expect(picker).not.toBeVisible();await expect(page.locator('#hdMapStrategyFleet')).toHaveValue('second');
 await expect(panel).toContainText('対象：別の艦隊');
 expect(await page.evaluate(()=>hdOCContext('1-1').fleet.id)).toBe('second');
});
test('fleet picker creates and selects a fleet for its own map when no fleet is saved',async({page})=>{
 const panel=await boot(page);
 await page.evaluate(()=>{saveCustomFleets({});hdMSNRender()});
 await panel.locator('[data-hd-oc-select-fleet]').click();
 const picker=page.locator('#hdOCFleetPicker');await expect(picker).toContainText('保存編成はまだありません');
 await expect(picker.locator('[data-hd-oc-fleet-use]')).toBeDisabled();await page.evaluate(()=>hdSelectGuideMap('1-6'));await picker.locator('[data-hd-oc-fleet-new]').click();
 const form=page.locator('#customFleetDialog');await expect(form).toBeVisible();
 await form.locator('#customFleetName').fill('新しい攻略艦隊');await form.locator('#cfShip0').fill('睦月改');await form.locator('button[value="default"]').click();
 await expect(form).not.toBeVisible();await expect(panel).toContainText('対象：新しい攻略艦隊');
 const state=await page.evaluate(()=>({fleets:loadCustomFleets(),selected:hdOCContext('1-1').fleet?.name}));
 expect(state.selected).toBe('新しい攻略艦隊');expect(state.fleets['1-1'][0].ships[0].ship).toBe('睦月改');expect(state.fleets['1-6']).toBeUndefined();
 await expect(panel.locator('[data-hd-oc-search]')).toBeEnabled();
});
test('cancelling new fleet creation keeps the existing search selection',async({page})=>{
 const panel=await boot(page);await panel.locator('[data-hd-oc-select-fleet]').click();
 await page.locator('[data-hd-oc-fleet-new]').click();await page.locator('#customFleetDialog button[value="cancel"]').click();
 await expect(page.locator('#customFleetDialog')).not.toBeVisible();
 expect(await page.evaluate(()=>hdOCContext('1-1').fleet.id)).toBe('proposal-fleet');
 expect(await page.evaluate(()=>hdSPSFleets('1-1').length)).toBe(1);
});
});
