const { test, expect } = require('@playwright/test');
const APP_BUILD = require('../app-version.json').build;

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  serviceWorkers: 'block'
});

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  await page.context().route('**/*', async route => {
    const req = route.request();
    let url;
    try { url = new URL(req.url()); } catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'blob:' || url.protocol === 'data:') {
      return route.continue();
    }
    if (req.resourceType() === 'image') {
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
    }
    return route.fulfill({ status: 204, body: '' });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#shipDatabase')).toHaveCount(1, { timeout: 30000 });
  await page.waitForFunction(() =>
    typeof window.hdWSApply === 'function' &&
    typeof window.hdPHRender === 'function' &&
    typeof window.hdQNCategoryRows === 'function' &&
    typeof window.hdKcCurrentFleets === 'function',
    null,
    { timeout: 30000 }
  );
}




async function prepare(page, inventory, requirements) {
  await boot(page);await page.waitForFunction(()=>typeof hdOCSearch==='function');
  await page.evaluate(({inventory,requirements})=>{
    localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));
    window.ocOriginalChecks=hdSEChecks;hdSEChecks=()=>({rows:requirements,adv:{}});hdFEEnemyAirCandidates=()=>[];
    const all=loadCustomFleets();all['1-1']=[{id:'oc-test',name:'手持ち条件テスト',ships:[{ship:'夕立改二',gear:''},{ship:'時雨改二',gear:''}]}];saveCustomFleets(all);
    hdMSNOpen('1-1');
  },{inventory,requirements});
}

test('owned equipment search fills empty real slots and respects star stacks and total counts',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0},{name:'33号水上電探',count:1,star:6},{name:'発煙装置(煙幕)',count:2,star:0}],[{kind:'電探',label:'電探',minCount:2},{kind:'煙幕',label:'煙幕',minCount:2}]);
 const result=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0),r=hdOCSearch(c);return {measure:r.measure,plan:r.plan,usage:hdFOAssignedUsage(r.plan),inventory:[...hdFLInventory().values()],validation:hdFEMasterValidation(r.plan)}});
 expect(result.measure.complete).toBeTruthy();expect(result.validation.invalid).toEqual([]);
 for(const x of result.inventory)expect(result.usage[x.key]||0).toBeLessThanOrEqual(x.count);
 expect(result.plan.ships.flatMap(x=>x.items).filter(x=>x.name==='33号水上電探').map(x=>x.star).sort()).toEqual([0,6]);
});

test('owned equipment search can build a turbine and boiler combination and reports missing stock',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:1,star:0},{name:'新型高温高圧缶',count:1,star:0}],[{kind:'高速化',label:'高速化セット',minCount:1}]);
 const result=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0)));expect(result.measure.complete).toBeTruthy();expect(result.plan.ships.some(s=>s.items.some(x=>/タービン/.test(x.name))&&s.items.some(x=>/缶$/.test(x.name)))).toBeTruthy();
 await page.evaluate(()=>localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:1,star:0}])));
 const missing=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0)));expect(missing.measure.complete).toBeFalsy();expect(missing.shortages[0].shortfall).toBe(1);expect(missing.shortages[0].candidates.length).toBeGreaterThan(0);
});

test('owned equipment search reports quantitative air shortfall and missing scouting data separately',async({page})=>{
 await prepare(page,[{name:'試製烈風 後期型',count:1,star:0}],[{kind:'制空',label:'制空装備',minCount:1}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'赤城改',gear:''}];saveCustomFleets(all);hdFEEnemyAirCandidates=()=>[100];return hdOCSearch(hdOCContext('1-1','oc-test',0))});
 expect(r.measure.complete).toBeFalsy();const air=r.shortages.find(x=>x.kind==='制空'&&x.label==='制空優勢の目安');expect(air.minCount).toBe(150);expect(air.count).toBeGreaterThan(0);expect(air.shortfall).toBe(150-air.count);expect(await page.evaluate(goal=>hdOCStockGap(goal),air)).toBe(0);expect(r.measure.manual.some(x=>x.startsWith('索敵：'))).toBeTruthy();
});

test('owned equipment UI shows shortages and saves only a current proposal while keeping slot positions',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-shortage')).toContainText('配備不足 1個');await expect(panel.locator('[data-hd-oc-acquire]')).toBeVisible();
 await page.evaluate(()=>{const set=Storage.prototype.setItem;window.ocRestore=()=>Storage.prototype.setItem=set;Storage.prototype.setItem=function(k,v){if(k===CUSTOM_FLEET_KEY)throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v)}});
 await panel.locator('[data-hd-oc-apply]').click();expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships[0].gear)).toBe('');await page.evaluate(()=>window.ocRestore());await panel.locator('[data-hd-oc-apply]').click();
 expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships.some(x=>x.gear.includes('33号水上電探')))).toBeTruthy();
 const position=await page.evaluate(()=>hdFEPlanFromSavedFleet('1-1',{ships:[{ship:'夕立改二',gear:' / 33号水上電探 / [増設] 改良型艦本式タービン'}]}));expect(position.ships[0].items[0].slotIndex).toBe(1);expect(position.ships[0].expansion.name).toBe('改良型艦本式タービン');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});


test('owned equipment search reaches a numeric scouting threshold rather than just filling a radar slot',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:2,star:0}],[]);
 const r=await page.evaluate(()=>{HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{label:'分岐安全域',safe:32,failBelow:25}]}};localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:20}));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameLos:36},{name:'時雨改二',gameLos:36}]));return hdOCSearch(hdOCContext('1-1','oc-test',0))});
 expect(r.measure.complete).toBeTruthy();expect(r.measure.goals.find(x=>x.kind==='los-value').count).toBeGreaterThanOrEqual(32);expect(r.plan.ships.flatMap(x=>x.items).length).toBe(2);
});

test('owned equipment search distinguishes slot shortages and refuses a proposal after inventory changes',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:8,star:0}],[{kind:'電探',label:'電探',minCount:8}]);
 const r=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0)));expect(r.measure.complete).toBeFalsy();expect(r.shortages[0].placement).toBeTruthy();expect(r.shortages[0].count).toBe(6);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('[data-hd-oc-apply]')).toBeVisible();
 await page.evaluate(()=>localStorage.setItem('harbordesk-equipment-v1','[]'));await panel.locator('[data-hd-oc-apply]').click();expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships.every(x=>!x.gear))).toBeTruthy();await expect(panel.locator('[data-hd-oc-apply]')).toHaveCount(0);
});


test('owned equipment rejects aircraft on destroyers and does not call unknown ship data sufficient',async({page})=>{
 await prepare(page,[{name:'試製烈風 後期型',count:4,star:0}],[{kind:'制空',label:'制空装備',minCount:2}]);
 const r=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0)));expect(r.measure.complete).toBeFalsy();expect(r.plan.ships.flatMap(x=>x.items)).toEqual([]);expect(r.shortages[0].count).toBe(0);
 const unknown=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'未登録の艦娘',gear:'試製烈風 後期型'}];saveCustomFleets(all);return hdOCSearch(hdOCContext('1-1','oc-test',0))});expect(unknown.measure.complete).toBeFalsy();expect(unknown.measure.manual.some(x=>x.includes('スロット情報が未登録'))).toBeTruthy();
});

test('owned equipment procurement saves a chosen stock gap without duplicates and tracks acquisition',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();
 const add=panel.locator('[data-hd-oc-procure]').first();await expect(add).toHaveText('候補をあと1個、調達リストへ');
 const target=await panel.locator('[data-hd-oc-target]').first().inputValue();
 await page.evaluate(()=>{const set=Storage.prototype.setItem;window.ocRestore=()=>Storage.prototype.setItem=set;Storage.prototype.setItem=function(k,v){if(k===HD_PROCUREMENT_KEY)throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v)}});
 await add.click();expect(await page.evaluate(()=>hdPLLoad().length)).toBe(0);await page.evaluate(()=>window.ocRestore());
 await add.click();await expect(page.locator('#hdEquipmentProcurement')).toBeVisible();
 let saved=await page.evaluate(()=>hdPLLoad());expect(saved[0].gearItems.length).toBe(1);expect(saved[0].gearItems[0].target).toBe(target);
 expect(await page.evaluate(()=>hdPLDemandRows(hdPLLoad()[0].gearItems)[0].shortfall)).toBe(1);
 await page.evaluate(()=>hdMSNOpen('1-1'));await add.click();expect(await page.evaluate(()=>hdPLLoad()[0].gearItems.length)).toBe(1);
 await page.evaluate(()=>hdMSNOpen('1-1'));const second=await panel.locator('[data-hd-oc-target] option').nth(1).getAttribute('value');await panel.locator('[data-hd-oc-target]').selectOption(second);await add.click();expect(await page.evaluate(()=>hdPLLoad()[0].gearItems.map(x=>x.target))).toEqual([second]);
 await page.evaluate(()=>hdMSNOpen('1-1'));await panel.locator('[data-hd-oc-target]').selectOption(target);await add.click();
 await page.evaluate(target=>{const rows=JSON.parse(localStorage.getItem('harbordesk-equipment-v1'));rows.push({name:target,count:1,star:0});localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(rows));window.dispatchEvent(new Event('hd:equipment-changed'))},target);
 expect(await page.evaluate(()=>hdPLDemandRows(hdPLLoad()[0].gearItems)[0].shortfall)).toBe(0);
 await page.reload();await page.waitForFunction(()=>typeof hdPLLoad==='function');expect(await page.evaluate(()=>hdPLLoad()[0].gearItems.length)).toBe(1);
 await page.evaluate(()=>hdPLPruneReady('1-1'));expect(await page.evaluate(()=>hdPLLoad().length)).toBe(0);
});

test('owned equipment procurement refuses stale plans and quantity conversion of numeric or placement deficits',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:8,star:0}],[{kind:'電探',label:'電探',minCount:8}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-shortage')).toBeVisible();await expect(panel.locator('[data-hd-oc-procure]')).toHaveCount(0);
 const gaps=await page.evaluate(()=>[hdOCStockGap({kind:'制空',goalKind:'air-value',minCount:150,owned:1}),hdOCStockGap({kind:'索敵',goalKind:'los-value',minCount:32,owned:0}),hdOCStockGap({kind:'高速化',minCount:1,owned:0})]);expect(gaps).toEqual([0,0,0]);
 await page.evaluate(()=>{hdSEChecks=()=>({rows:[{kind:'電探',label:'電探',minCount:2}],adv:{}});localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:1,star:0}]));hdMSNRender()});
 await panel.locator('[data-hd-oc-search]').click();const add=panel.locator('[data-hd-oc-procure]');await expect(add).toBeVisible();
 await page.evaluate(()=>localStorage.setItem('harbordesk-equipment-v1','[]'));await add.click();expect(await page.evaluate(()=>hdPLLoad().length)).toBe(0);await expect(add).toHaveCount(0);
});

test('owned equipment procurement preserves independent goals and avoids summing alternative fleet targets',async({page})=>{
 await prepare(page,[],[{kind:'電探',label:'電探',minCount:2}]);
 const counts=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0),r=hdOCSearch(c),target=r.shortages[0].candidates[0];hdOCAddProcurement(c,r,0,target);hdOCAddProcurement({...c,fleet:{...c.fleet,id:'oc-other',name:'別編成'}},r,0,target);let rows=hdPLLoad(),items=rows[0].gearItems;items.push({...items[0],ownedPlanSource:undefined,ship:'夕立改二',loadout:'別の希望',needed:1});hdPLSave(rows);return {items:items.length,needed:hdPLDemandRows(items)[0].needed,other:items.find(x=>x.loadout==='別の希望').needed}});
 expect(counts).toEqual({items:3,needed:2,other:1});
});
