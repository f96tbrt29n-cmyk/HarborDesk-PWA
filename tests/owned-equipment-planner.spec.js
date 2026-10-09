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

test('owned equipment plan update lowers a stock gap and retires a candidate when alternatives satisfy the goal',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:4}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await panel.locator('[data-hd-oc-procure]').click();
 const initial=await page.evaluate(()=>hdPLLoad()[0].gearItems[0]);expect(initial.needed).toBe(3);
 await page.evaluate(()=>{const rows=hdPLLoad();rows[0].gearItems.push({map:'1-1',ship:'別の希望',target:'12.7cm連装砲',wanted:'12.7cm連装砲',kind:'主砲',needed:1});hdPLSave(rows);localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:2,star:0}]));hdMSNOpen('1-1')});
 await panel.locator('[data-hd-oc-search]').click();await panel.locator('[data-hd-oc-procurement-update]').click();
 expect(await page.evaluate(()=>hdPLLoad()[0].gearItems.find(x=>x.ownedPlanSource).needed)).toBe(2);
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:4,star:0}]));hdMSNRender()});
 await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('.hd-oc-result')).toContainText('登録済み装備目安は充足');await panel.locator('[data-hd-oc-procurement-update]').click();
 const left=await page.evaluate(()=>hdPLLoad()[0].gearItems);expect(left).toEqual([{map:'1-1',ship:'別の希望',target:'12.7cm連装砲',wanted:'12.7cm連装砲',kind:'主砲',needed:1}]);await expect(panel.locator('[data-hd-oc-procurement-update]')).toHaveCount(0);
});

test('owned equipment plan update preserves other routes fleets and unknown conditions while migrating a legacy plan',async({page})=>{
 await prepare(page,[],[{kind:'電探',label:'電探',minCount:2}]);
 const result=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0),r=hdOCSearch(c),target=r.shortages[0].candidates[0];hdOCAddProcurement(c,r,0,target);hdOCAddProcurement({...c,index:1},r,0,target);let rows=hdPLLoad(),entry=rows[0].gearItems[0];delete entry.ownedPlanRoute;rows[0].gearItems.push({...entry,ownedPlanSource:JSON.stringify(['other','電探','電探'])},{...entry,ownedPlanSource:JSON.stringify(['oc-test','電探','別条件'])});hdPLSave(rows);const before=JSON.stringify(rows[0].gearItems.slice(1));const change=hdOCUpdateProcurement(c,r);return {change,route:hdPLLoad()[0].gearItems[0].ownedPlanRoute,untouched:JSON.stringify(hdPLLoad()[0].gearItems.slice(1))===before}});
 expect(result).toEqual({change:{removed:0,updated:1},route:0,untouched:true});
 const cleanup=await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:2,star:0}]));const c=hdOCContext('1-1','oc-test',0),r=hdOCSearch(c);return {change:hdOCUpdateProcurement(c,r),rows:hdPLLoad()[0].gearItems}});
 expect(cleanup.change).toEqual({removed:1,updated:0});expect(cleanup.rows.length).toBe(3);expect(cleanup.rows[0].ownedPlanRoute).toBe(1);
});

test('owned equipment plan update retains the saved plan on storage failure and rejects stale results',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await panel.locator('[data-hd-oc-procure]').click();
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1','[]');hdMSNOpen('1-1')});await panel.locator('[data-hd-oc-search]').click();
 const before=await page.evaluate(()=>localStorage.getItem(HD_PROCUREMENT_KEY));
 await page.evaluate(()=>{const set=Storage.prototype.setItem;window.ocRestore=()=>Storage.prototype.setItem=set;Storage.prototype.setItem=function(k,v){if(k===HD_PROCUREMENT_KEY)throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v)}});
 await panel.locator('[data-hd-oc-procurement-update]').click();expect(await page.evaluate(()=>localStorage.getItem(HD_PROCUREMENT_KEY))).toBe(before);
 await page.evaluate(()=>window.ocRestore());await panel.locator('[data-hd-oc-procurement-update]').click();expect(await page.evaluate(()=>hdPLLoad()[0].gearItems[0].needed)).toBe(2);
 await page.evaluate(()=>localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:2,star:0}])));await panel.locator('[data-hd-oc-procurement-update]').click();expect(await page.evaluate(()=>hdPLLoad()[0].gearItems[0].needed)).toBe(2);await expect(panel.locator('[data-hd-oc-procurement-update]')).toHaveCount(0);
 await panel.locator('[data-hd-oc-search]').click();await panel.locator('[data-hd-oc-procurement-update]').click();expect(await page.evaluate(()=>hdPLLoad())).toEqual([]);
});

test('owned equipment speed shortages identify the missing boiler and track only that component',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:1,star:0}],[{kind:'高速化',label:'高速化セット',minCount:1}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();
 const turbine=panel.locator('.hd-oc-goal').filter({hasText:'高速化用タービン'}),boiler=panel.locator('.hd-oc-shortage').filter({hasText:'高速化用の缶に必要なもの'});
 await expect(turbine).toContainText('充足');await expect(boiler).toContainText('配備不足 1個');await expect(panel.locator('[data-hd-oc-procure]')).toHaveCount(1);
 expect(await boiler.locator('[data-hd-oc-acquire]').getAttribute('data-hd-oc-acquire')).toBe('高速化');
 const names=await boiler.locator('[data-hd-oc-target] option').allTextContents();expect(names.every(x=>/缶$/.test(x)&&!/タービン/.test(x))).toBeTruthy();await boiler.locator('[data-hd-oc-procure]').click();
 const saved=await page.evaluate(()=>hdPLLoad()[0].gearItems[0]);expect(saved.kind).toBe('speed-boiler');expect(saved.needed).toBe(1);expect(saved.target).toMatch(/缶$/);
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:1,star:0},{name:'新型高温高圧缶',count:1,star:0}]));hdMSNOpen('1-1')});await panel.locator('[data-hd-oc-search]').click();
 await expect(panel.locator('.hd-oc-shortage')).toHaveCount(0);await panel.locator('[data-hd-oc-procurement-update]').click();expect(await page.evaluate(()=>hdPLLoad())).toEqual([]);
});

test('owned equipment speed shortages distinguish a missing turbine from plentiful boilers',async({page})=>{
 await prepare(page,[{name:'新型高温高圧缶',count:3,star:0}],[{kind:'高速化',label:'高速化セット',minCount:1}]);
 const r=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0)));
 const missing=r.shortages.find(x=>x.kind==='speed-turbine');expect(missing.owned).toBe(0);expect(missing.minCount).toBe(1);expect(missing.candidates.every(x=>/タービン/.test(x))).toBeTruthy();expect(r.shortages.some(x=>x.kind==='speed-boiler')).toBeFalsy();expect(r.shortages.find(x=>x.kind==='高速化').placement).toBeFalsy();
});

test('owned equipment counts speed sets per ship including duplicate names and never counts two sets on one ship',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:2,star:0},{name:'新型高温高圧缶',count:2,star:0}],[{kind:'高速化',label:'高速化セット',minCount:2}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'夕立改二',gear:''},{ship:'夕立改二',gear:''}];saveCustomFleets(all);return hdOCSearch(hdOCContext('1-1','oc-test',0))});
 expect(r.measure.complete).toBeTruthy();expect(r.plan.ships.every(s=>s.items.some(x=>/タービン/.test(x.name))&&s.items.some(x=>/缶$/.test(x.name)))).toBeTruthy();
 const packed=await page.evaluate(()=>{const plan={map:'1-1',ships:[{ship:'長門改',items:[{name:'改良型艦本式タービン'},{name:'改良型艦本式タービン'},{name:'新型高温高圧缶'},{name:'新型高温高圧缶'}]}]};return hdOCMeasure(plan,[{kind:'高速化',label:'高速化セット',minCount:2}])});expect(packed.goals.find(x=>x.kind==='高速化').count).toBe(1);expect(packed.complete).toBeFalsy();
});

test('owned equipment route speed components use all low speed ships rather than adding overlapping set targets',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:1,star:0},{name:'新型高温高圧缶',count:1,star:0}],[{kind:'高速化',label:'高速化セット',minCount:1}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'長門改',gear:''},{ship:'陸奥改',gear:''}];saveCustomFleets(all);const c=hdOCContext('1-1','oc-test',0);c.preset={name:'高速統一の確認',ships:'戦艦2 高速統一'};return hdOCSearch(c)});
 expect(r.measure.complete).toBeFalsy();const parts=r.measure.goals.filter(x=>['speed-turbine','speed-boiler'].includes(x.kind));expect(parts.map(x=>x.minCount)).toEqual([2,2]);
 for(const kind of ['speed-turbine','speed-boiler']){const goal=r.shortages.find(x=>x.kind===kind);expect(goal.owned).toBe(1);expect(goal.minCount).toBe(2);expect(await page.evaluate(g=>hdOCStockGap(g),goal)).toBe(1)}
 expect(r.measure.manual.some(x=>x.includes('実際の速力'))).toBeFalsy();expect(r.measure.goals.filter(x=>x.kind==='speed-ship').every(x=>!x.unresolved)).toBe(true);
});

test('owned equipment placement explains unusable owned gear and procures a compatible alternative',async({page})=>{
 await prepare(page,[{name:'試製烈風 後期型',count:3,star:6}],[{kind:'制空',label:'制空装備',minCount:2}]);
 await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'最上改',gear:''}];saveCustomFleets(all);hdMSNRender()});
 const r=await page.evaluate(()=>hdOCSearch(hdOCContext('1-1','oc-test',0))),g=r.shortages[0];
 expect(g.owned).toBe(3);expect(g.usableOwned).toBe(0);expect(g.placement).toBeFalsy();expect(g.compatibleSlots).toBe(4);expect(g.blocked).toEqual([{name:'試製烈風 後期型',star:6,count:3}]);
 expect(await page.evaluate(g=>hdOCStockGap(g),g)).toBe(2);expect(g.candidates).not.toContain('試製烈風 後期型');
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();
 await expect(panel.locator('.hd-oc-placement')).toContainText('試製烈風 後期型 ★6 ×3');await expect(panel.locator('[data-hd-oc-procure]')).toHaveText('候補をあと2個、調達リストへ');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await panel.locator('[data-hd-oc-procure]').click();expect(await page.evaluate(()=>hdPLLoad()[0].gearItems[0].needed)).toBe(2);
});

test('owned equipment placement distinguishes total slots from competition for compatible slots',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:8,star:0}],[{kind:'電探',label:'電探',minCount:8}]);
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();
 await expect(panel.locator('.hd-oc-placement')).toContainText('最大 6枠');await expect(panel.locator('.hd-oc-placement')).toContainText('装備を増やすだけでは解消できない');await expect(panel.locator('[data-hd-oc-procure]')).toHaveCount(0);
 const info=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0),build=hdOCBuild(c);return hdOCPlacementInfo('電探',build.inventory,build.slots,hdFLCatalog())});expect(info.usableOwned).toBe(8);expect(info.blocked).toEqual([]);
});

test('owned equipment proposal appears beside each ship inside its saved fleet and shows fleet shortages',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:6}],[{kind:'電探',label:'電探',minCount:2}]);
 await page.evaluate(()=>{selectedMap='1-1';renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 const card=page.locator('#customFleetPanel [data-cf-id="oc-test"]');await expect(card).toBeVisible();
 await card.locator('[data-hd-oc-search]').click();await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(2);
 await expect(card.locator('.custom-fleet-saved-list')).toContainText('33号水上電探 ★6');await expect(card.locator('.hd-oc-inline-ship').first()).toContainText('編成全体に不足');
 await expect(card.locator('.hd-oc-shortage')).toContainText('配備不足 1個');await expect(card.locator('[data-hd-oc-procure]')).toBeVisible();
 expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships.every(s=>s.gear===''))).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await card.locator('[data-hd-oc-apply]').click();expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships.some(s=>s.gear.includes('33号水上電探 ★6')))).toBeTruthy();
 await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(0);
});

test('owned equipment inline fleet selection keeps proposals separate and invalidates changed inventory and route',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:2,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'].push({id:'oc-second',name:'別の艦隊',ships:[{ship:'夕立改二',gear:''}]});saveCustomFleets(all);selectedMap='1-1';renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 const card=page.locator('#customFleetPanel [data-cf-id="oc-test"]'),second=page.locator('#customFleetPanel [data-cf-id="oc-second"]');
 await card.locator('[data-hd-oc-search]').click();await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(2);await expect(second.locator('.hd-oc-inline-ship')).toHaveCount(0);await expect(card.locator('.hd-oc-result')).toContainText('装備目安は充足');
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1','[]');window.dispatchEvent(new Event('hd:equipment-changed'))});await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(0);await expect(card.locator('[data-hd-oc-apply]')).toHaveCount(0);
 await card.locator('[data-hd-oc-search]').click();await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(2);
 await page.evaluate(()=>{MAP_PLANS['1-1']={presets:[{name:'通常',ships:'駆逐2'},{name:'別条件',ships:'駆逐2 高速統一'}]};renderCustomFleets('1-1')});
 await card.locator('[data-hd-oc-inline-route]').selectOption('1');await expect(card.locator('.hd-oc-inline-ship')).toHaveCount(0);await expect(second.locator('[data-hd-oc-inline-route]')).toHaveValue('1');
});


test('route fleet conditions: 1-6 uses one light cruiser and five destroyers and keeps missing slots',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSPlans==='function');
 const r=await page.evaluate(()=>{
  const roster=[{id:'cl',name:'条件テスト軽巡',type:'軽巡洋艦',level:30},...Array.from({length:5},(_,i)=>({id:'dd'+i,name:'条件テスト駆逐'+i,type:'駆逐艦',level:30})),{id:'bb',name:'条件テスト戦艦',type:'戦艦',level:30},{id:'cv',name:'条件テスト空母',type:'正規空母',level:30},{id:'clt',name:'条件テスト雷巡',type:'重雷装巡洋艦',level:30}];
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster));const full=hdFSPlans('1-6')[0];
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster.filter(x=>x.id!=='dd4')));const partial=hdFSPlans('1-6')[0];
  const forbidden=hdFSGenerate('1-6',{ships:'戦艦1＋正規空母1＋雷巡1'},0);
  return {types:full.slots.map(x=>x.profile?.type),complete:full.filled,manual:full.info.conditionManual,partial:partial.slots.map(x=>x.profile?.type||null),missing:partial.missing,html:hdFSSuggestionHtml(partial),forbidden:forbidden.filled};
 });
 expect(r.types.filter(x=>x==='軽巡洋艦')).toHaveLength(1);expect(r.types.filter(x=>x==='駆逐艦')).toHaveLength(5);expect(r.complete).toBe(6);expect(r.manual).toBe(false);expect(r.partial.filter(Boolean)).toHaveLength(5);expect(r.missing).toEqual(['駆逐']);expect(r.html).toContain('駆逐 が不足');expect(r.forbidden).toBe(0);
});

test('route fleet conditions: master ship type overrides an incorrect roster type',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSPlans==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'wrong',name:'北上改二',type:'軽巡洋艦',level:30},{id:'real',name:'条件テスト軽巡',type:'軽巡洋艦',level:30},...Array.from({length:5},(_,i)=>({id:'dd'+i,name:'条件テスト駆逐'+i,type:'駆逐艦',level:30}))]));
  const s=hdFSPlans('1-6')[0];return {type:hdFSType({name:'北上改二',type:'軽巡洋艦'}),ids:s.slots.map(x=>x.profile?.row.id)};
 });expect(r.type).toBe('重雷装巡洋艦');expect(r.ids).not.toContain('wrong');expect(r.ids).toContain('real');
});

test('route fleet conditions: formal type names and alternative slots parse without overlap',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSPresetInfo==='function');
 const r=await page.evaluate(()=>({formal:hdFSPresetInfo({ships:'軽巡洋艦1＋駆逐艦5'}),mixed:hdFSPresetInfo({ships:'戦艦1＋正規空母1＋軽空母1＋重巡/雷巡2＋駆逐1'}),aviation:hdFSPresetInfo({ships:'航空戦艦1＋装甲空母1＋高速戦艦1＋水上機母艦1＋重雷装巡洋艦1＋駆逐艦1'})}));
 expect(r.formal.requirements).toEqual([{token:'軽巡',count:1},{token:'駆逐',count:5}]);expect(r.mixed.total).toBe(6);expect(r.mixed.requirements.reduce((n,x)=>n+x.count,0)).toBe(6);expect(r.mixed.requirements).toContainEqual({token:'重巡/雷巡',count:2});expect(r.aviation.requirements.reduce((n,x)=>n+x.count,0)).toBe(6);expect(r.aviation.requirements).not.toContainEqual({token:'戦艦',count:1});
});

test('route fleet conditions: uncertain descriptions never fill unrelated ships or save empty fleets',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSGenerate==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'bb',name:'条件テスト戦艦',type:'戦艦',level:30}]));
  const unknown=hdFSGenerate('1-3',{ships:'軽巡・駆逐を中心に6隻'},0),range=hdFSGenerate('2-2',{ships:'戦艦級0・空母3以上'},0),over=hdFSGenerate('1-3',{ships:'軽巡1＋駆逐7'},0);selectedMap='1-3';hdFSSave(0);
  return {filled:unknown.filled,html:hdFSSuggestionHtml(unknown),range:range.filled,over:over.slots.length,saved:(loadCustomFleets()['1-3']||[]).length};
 });expect(r.filled).toBe(0);expect(r.html).toContain('編成条件の確認が必要');expect(r.html).toContain('編成条件が未確認');expect(r.html).toContain('disabled');expect(r.range).toBe(0);expect(r.over).toBe(6);expect(r.saved).toBe(0);
});


test('route fleet conditions: readiness rejects ambiguous presets and incorrect ship counts',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFERoute==='function');
 const r=await page.evaluate(()=>{
  const fleet={map:'1-6',ships:[{ship:'条件テスト軽巡',type:'軽巡洋艦'},...Array.from({length:5},(_,i)=>({ship:'条件テスト駆逐'+i,type:'駆逐艦'}))],routeInfo:hdFSPresetInfo({ships:'軽巡1＋駆逐5'})};
  const good=hdFERoute(fleet);const tooMany=hdFERoute({...fleet,ships:[...fleet.ships,{ship:'余剰艦',type:'駆逐艦'}]});
  const unclear=hdFERoute({...fleet,routeInfo:hdFSPresetInfo({ships:'軽巡・駆逐中心'})});
  const zero=hdFERoute({map:'1-1',ships:[{ship:'条件テスト戦艦',type:'戦艦'},{ship:'条件テスト駆逐',type:'駆逐艦'}],routeInfo:hdFSPresetInfo({ships:'戦艦0＋駆逐2'})});
  return {good:good.status,tooMany:tooMany.status,unclear:unclear.status,zero:zero.status};
 });expect(r).toEqual({good:'ready',tooMany:'missing',unclear:'manual',zero:'missing'});
});

test('verified route presets generate the required counts without adding unrelated ships',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSPlans==='function');
 const rows=await page.evaluate(()=>{
  const roster=[];for(const [type,count] of [['軽巡洋艦',4],['駆逐艦',6],['海防艦',4],['軽空母',2],['正規空母',2],['戦艦',2],['航空戦艦',1],['航空巡洋艦',2],['重巡洋艦',3],['重雷装巡洋艦',2]])for(let i=0;i<count;i++)roster.push({id:type+i,name:'条件テスト'+type+i,type,level:80});
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster));return ['1-2','1-3','1-4','1-5','2-5','6-5'].flatMap(map=>hdFSPlans(map).filter(s=>!s.info.conditionManual).map(s=>({map,name:s.preset.name,total:s.info.total,filled:s.filled,requirements:s.info.requirements,types:s.slots.map(x=>x.profile?.type),source:hdPlanSourceHtml(s.preset)})));
 });
 expect(rows.filter(x=>x.map==='1-2')).toHaveLength(1);expect(rows.find(x=>x.map==='1-2').types).toHaveLength(5);
 expect(rows.find(x=>x.map==='1-3').types.filter(x=>x==='軽空母')).toHaveLength(2);
 expect(rows.find(x=>x.map==='1-4').types.filter(x=>x==='駆逐艦')).toHaveLength(4);
 for(const row of rows){expect(row.filled).toBe(row.total);expect(row.types.filter(Boolean)).toHaveLength(row.total);expect(row.source).toContain('https://zekamashi.net/');expect(row.source).toContain('noopener noreferrer')}
 const antiSub=rows.filter(x=>x.map==='1-5');expect(antiSub).toHaveLength(3);for(const row of antiSub){expect(row.total).toBe(4);expect(row.types.filter(x=>x==='軽巡洋艦').length).toBeLessThanOrEqual(2)}
 const lower=rows.find(x=>x.map==='6-5'&&x.name==='下ルート型');expect(lower.types.filter(x=>x==='駆逐艦')).toHaveLength(2);expect(lower.types).not.toContain('重雷装巡洋艦');expect(lower.types).not.toContain('正規空母');expect(lower.types).not.toContain('軽空母');
});

test('verified route presets preserve missing ship slots and prefer fast ships for 2-5 south',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFSPlans==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'cl',name:'条件テスト軽巡',type:'軽巡洋艦',level:50},{id:'dd',name:'条件テスト駆逐',type:'駆逐艦',level:50},{id:'bb',name:'条件テスト戦艦',type:'戦艦',level:50}]));const short=hdFSPlans('1-2')[0];const asw=hdFSPlans('1-5')[1];
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'slow',name:'龍鳳',type:'軽空母',level:50},{id:'fast',name:'瑞鳳',type:'軽空母',level:99}]));const south=hdFSPlans('2-5').find(s=>s.preset.name==='南ルート型');
  return {shortFilled:short.filled,shortMissing:short.missing,shortIds:short.slots.map(x=>x.profile?.row.id),aswFilled:asw.filled,speedRequired:south.info.speedRequired,cvl:south.slots.find(x=>x.required==='軽空母')?.profile?.row.id,slowType:hdFSProfile({name:'龍鳳',type:'軽空母'}).speed,html:hdFSSuggestionHtml(south)};
 });expect(r.shortFilled).toBe(2);expect(r.shortMissing).toEqual(['駆逐','駆逐','駆逐']);expect(r.shortIds).not.toContain('bb');expect(r.aswFilled).toBe(1);expect(r.speedRequired).toBe(true);expect(r.slowType).toBe('低速');expect(r.cvl).toBe('fast');expect(r.html).toContain('編成条件の出典');
});

test('verified route source links reject executable URLs and appear in the fleet tab',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdPlanSourceHtml==='function'&&typeof hdFleetHtml==='function');
 const r=await page.evaluate(()=>{selectedWorld='1';selectedMap='1-2';hdMapTabSave('1-2','fleet');renderMapPicker();return {bad:hdPlanSourceHtml({source:'javascript:alert(1)'}),none:hdPlanSourceHtml({}),source:document.querySelector('#selectedMapCard a[href*="zekamashi"]')?.getAttribute('href')}});expect(r.bad).toBe('');expect(r.none).toBe('');expect(r.source).toBe('https://zekamashi.net/kancolle-kouryaku/1-2/');
});

test('owned equipment search survives a fleet refresh between press and release',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 await page.evaluate(()=>{selectedMap='1-1';renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 const card=page.locator('#customFleetPanel [data-cf-id="oc-test"]'),button=card.locator('[data-hd-oc-search]');
 await button.scrollIntoViewIfNeeded();await expect(button).toBeVisible();
 const box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.evaluate(()=>{window.dispatchEvent(new Event('hd:equipment-changed'));window.dispatchEvent(new Event('hd:ship-images-ready'))});
 await page.mouse.up();await expect(card.locator('.hd-oc-result')).toBeVisible();await expect(card.locator('.hd-oc-shortage')).toContainText('配備不足 1個');
});

for(const surface of ['gear','navigator'])test(`owned equipment search accepts a mobile tap during inventory refresh in ${surface}`,async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 await page.evaluate(surface=>{
  if(surface==='gear'){selectedMap='1-1';renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('gear');hdRenderMapEquipmentRecommendations()}
 },surface);
 const panel=page.locator(surface==='gear'?'#hdMapEquipRecommend .hd-oc-panel':'#mapStrategyNavigator .hd-oc-panel');
 await expect(panel).toBeVisible();
 await page.evaluate(()=>{
  document.addEventListener('pointerdown',function refresh(e){
   if(!e.target.closest('[data-hd-oc-search]'))return;
   document.removeEventListener('pointerdown',refresh);
   localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:2,star:0}]));
   window.dispatchEvent(new Event('hd:equipment-changed'));
  });
 });
 await panel.locator('[data-hd-oc-search]').tap();
 await expect(panel.locator('.hd-oc-result')).toContainText('装備目安は充足');await expect(panel.locator('.hd-oc-shortage')).toHaveCount(0);
 await panel.locator('[data-hd-oc-apply]').tap();
 expect(await page.evaluate(()=>loadCustomFleets()['1-1'][0].ships.flatMap(s=>s.gear.split(' / ')).filter(x=>x==='33号水上電探').length)).toBe(2);
});

test('cancelled fleet press flushes a pending inventory refresh and leaves search usable',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:2}]);
 await page.evaluate(()=>{selectedMap='1-1';renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('mine')});
 const card=page.locator('#customFleetPanel [data-cf-id="oc-test"]');
 await page.evaluate(()=>{
  const button=document.querySelector('#customFleetPanel [data-hd-oc-search]');
  button.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:99,button:0,isPrimary:true}));
  localStorage.setItem('harbordesk-equipment-v1','[]');window.dispatchEvent(new Event('hd:equipment-changed'));
  window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:99}));
 });
 await expect.poll(()=>page.evaluate(()=>cfPressedPointer===null&&!cfRenderPending)).toBe(true);
 await card.locator('[data-hd-oc-search]').tap();await expect(card.locator('.hd-oc-shortage')).toContainText('配備不足 2個');
});

test('owned equipment asynchronous search lets the page respond while retaining its result',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:8,star:0},{name:'発煙装置(煙幕)',count:8,star:0}],[{kind:'電探',label:'電探',minCount:8},{kind:'煙幕',label:'煙幕',minCount:8}]);
 const r=await page.evaluate(async()=>{
  const c=hdOCContext('1-1','oc-test',0),expected=hdOCSearch(c);let ticks=0;
  const timer=setInterval(()=>ticks++,0);try{const result=await hdOCSearchAsync(c);return {ticks,examined:result.examined,usage:hdFOAssignedUsage(result.plan),expected:hdFOAssignedUsage(expected.plan),goals:result.measure.goals,expectedGoals:expected.measure.goals}}finally{clearInterval(timer)}
 });
 expect(r.examined).toBeGreaterThan(50);expect(r.ticks).toBeGreaterThan(1);expect(r.usage).toEqual(r.expected);expect(r.goals).toEqual(r.expectedGoals);
});

test('owned equipment asynchronous search rejects a changed inventory before caching an obsolete proposal',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:8,star:0}],[{kind:'電探',label:'電探',minCount:8}]);
 const r=await page.evaluate(async()=>{
  const promise=hdOCSearchAsync(hdOCContext('1-1','oc-test',0));setTimeout(()=>localStorage.setItem('harbordesk-equipment-v1','[]'),0);
  try{await promise;return 'accepted'}catch(e){return e.code}
 });expect(r).toBe('HD_OC_STALE');
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').tap();
 await expect(panel.locator('.hd-oc-shortage')).toContainText('配備不足 8個');
});

async function prepareCapability(page,map,inventory,ships){
 await boot(page);await page.waitForFunction(()=>typeof hdSECapabilityHtml==='function'&&typeof hdOCSearch==='function');
 await page.evaluate(({map,inventory,ships})=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));
  const all=loadCustomFleets();all[map]=[{id:'cap-test',name:'装備条件の確認',ships:ships.map(s=>typeof s==='string'?{ship:s,gear:''}:s)}];saveCustomFleets(all);
  selectedMap=map;renderMapPicker();hdWSShowElement('guide',true);hdMapActivateTab('mine');
 },{map,inventory,ships});
}

test('map equipment capabilities: 1-6 shows a missing cutin component and does not demand air superiority',async({page})=>{
 await prepareCapability(page,'1-6',[{name:'10cm高角砲＋高射装置',count:1,star:0}],['阿武隈改二','夕立改二','時雨改二','秋月改','雪風改','暁改二']);
 const r=await page.evaluate(()=>{const c=hdOCContext('1-6','cap-test',0),rows=hdSEChecks('1-6').rows,result=hdOCSearch(c);return {rows:rows.map(x=>x.kind),goals:result.measure.goals.map(x=>x.kind),stock:hdSECapabilityStock(hdFEPlanFromSavedFleet(c.map,c.fleet),'cap-aa')}});
 expect(r.rows).toContain('cap-aa');expect(r.rows).not.toContain('制空');expect(r.goals).not.toContain('air-value');
 const panel=page.locator('#customFleetPanel [data-cf-id="cap-test"]'),aa=panel.locator('[data-hd-se-capability="cap-aa"]');
 await expect(aa).toContainText('安定化の推奨');await expect(aa).toContainText('対空電探');await expect(aa).toContainText('あと1個');await expect(aa).toContainText('所持不足');await expect(aa.locator('a')).toHaveAttribute('href',/対空カットイン/);
 expect(await page.evaluate(()=>hdSECapabilityMeasure({ships:[{ship:'夕立改二',items:[{name:'Bofors 40mm四連装機関砲',slotIndex:0}]}]},'cap-aa').count)).toBe(0);
 expect(await page.evaluate(()=>hdSEPartMatches('director',hdFEFind('10cm高角砲＋高射装置')))).toBe(false);
});

test('map equipment capabilities: a generic cutin must be together on a compatible ship',async({page})=>{
 await prepareCapability(page,'1-4',[{name:'10cm高角砲＋高射装置',count:1,star:0},{name:'13号対空電探改',count:1,star:0}],['夕立改二','時雨改二']);
 const r=await page.evaluate(()=>{
  const split={map:'1-4',ships:[{ship:'夕立改二',items:[{name:'10cm高角砲＋高射装置',slotIndex:0}]},{ship:'時雨改二',items:[{name:'13号対空電探改',slotIndex:0}]}]};
  const together={map:'1-4',ships:[{ship:'夕立改二',items:[{name:'10cm高角砲＋高射装置',slotIndex:0},{name:'13号対空電探改',slotIndex:1}]}]};
  const search=hdOCSearch(hdOCContext('1-4','cap-test',0));return {split:hdSECapabilityMeasure(split,'cap-aa'),together:hdSECapabilityMeasure(together,'cap-aa'),search:search.measure.goals.find(x=>x.kind==='cap-aa'),invalid:hdFEMasterValidation(search.plan).invalid};
 });expect(r.split.count).toBe(0);expect(r.together.count).toBe(1);expect(r.search.ok).toBe(true);expect(r.invalid).toEqual([]);
 await expect(page.locator('#customFleetPanel [data-hd-se-capability="cap-aa"]')).toContainText('手持ちで配備可能');
 expect(await page.evaluate(()=>[0,3].map(index=>hdSECapabilityMeasure({ships:[{ship:'夕立改二',items:[{name:'10cm高角砲＋高射装置',slotIndex:0},{name:'13号対空電探改',slotIndex:index}]}]},'cap-aa').count))).toEqual([0,0]);
});

test('map equipment capabilities: Akizuki class uses its own high angle gun recipe and stock quantities',async({page})=>{
 await prepareCapability(page,'1-6',[{name:'10cm連装高角砲',count:1,star:0}],['秋月改']);
 const r=await page.evaluate(()=>{
  const one=hdSECapabilityMeasure({ships:[{ship:'秋月改',items:[{name:'10cm連装高角砲',slotIndex:0}]}]},'cap-aa');
  const two=hdSECapabilityMeasure({ships:[{ship:'秋月改',items:[{name:'10cm連装高角砲',slotIndex:0},{name:'10cm連装高角砲',slotIndex:1}]}]},'cap-aa');
  return {one,two,stock:hdSECapabilityStock(hdFEPlanFromSavedFleet('1-6',loadCustomFleets()['1-6'][0]),'cap-aa')};
 });expect(r.one.count).toBe(0);expect(r.two.count).toBe(1);expect(r.stock.parts.find(x=>x.part==='ha')).toMatchObject({need:2,have:1});
 await expect(page.locator('#customFleetPanel [data-hd-se-capability="cap-aa"]')).toContainText('高角砲：1/2・あと1個');
});

test('map equipment capabilities: full stock on a submarine does not become a deployable cutin',async({page})=>{
 await prepareCapability(page,'1-4',[{name:'10cm高角砲＋高射装置',count:2,star:0},{name:'13号対空電探改',count:1,star:0}],['伊58改']);
 const panel=page.locator('#customFleetPanel [data-hd-se-capability="cap-aa"]');await expect(panel).toContainText('艦種・装備枠の確認が必要');await expect(panel).not.toContainText('手持ちで配備可能');
 expect(await page.evaluate(()=>hdSECapabilityMeasure({ships:[{ship:'伊58改',items:[{name:'10cm高角砲＋高射装置',slotIndex:0},{name:'13号対空電探改',slotIndex:1}]}]},'cap-aa').count)).toBe(0);
});

test('map equipment capabilities: sonar duplicates do not satisfy an ASW synergy set',async({page})=>{
 await prepareCapability(page,'1-5',[{name:'三式水中探信儀',count:2,star:0}],['夕立改二']);
 const card=page.locator('#customFleetPanel [data-hd-se-capability="cap-asw"]');await expect(card).toContainText('爆雷投射機：0/1・あと1個');await expect(card).toContainText('先制対潜は別条件');
 const r=await page.evaluate(()=>({duplicate:hdSECapabilityMeasure({ships:[{ship:'夕立改二',items:[{name:'三式水中探信儀',slotIndex:0},{name:'三式水中探信儀',slotIndex:1}]}]},'cap-asw'),combo:hdSECapabilityMeasure({ships:[{ship:'夕立改二',items:[{name:'三式水中探信儀',slotIndex:0},{name:'三式爆雷投射機',slotIndex:1}]}]},'cap-asw')}));expect(r.duplicate.count).toBe(0);expect(r.combo.count).toBe(1);
});

test('map equipment capabilities: land attack examples differ between soft skin and mixed installations',async({page})=>{
 await prepareCapability(page,'6-4',[{name:'大発動艇(八九式中戦車＆陸戦隊)',count:1,star:0}],['大潮改二']);
 const card=page.locator('#customFleetPanel [data-hd-se-capability="cap-land-mixed"]');await expect(card).toContainText('内火艇系：0/1・あと1個');await expect(card).toContainText('敵の種類');
 const r=await page.evaluate(()=>({maps:['1-5','7-1','7-4','6-4','4-5','6-5'].map(map=>({map,profiles:hdSEProfiles(map).map(x=>x.kind)})),wrong:hdSECapabilityMeasure({ships:[{ship:'大潮改二',items:[{name:'三式弾',slotIndex:0}]}]},'cap-land-mixed').count,combo:hdSECapabilityMeasure({ships:[{ship:'大潮改二',items:[{name:'大発動艇(八九式中戦車＆陸戦隊)',slotIndex:0},{name:'特二式内火艇',slotIndex:1}]}]},'cap-land-mixed').count}));
 expect(r.maps.find(x=>x.map==='4-5').profiles).toContain('cap-land-soft');expect(r.maps.find(x=>x.map==='7-1').profiles).toContain('cap-asw');expect(r.maps.find(x=>x.map==='6-5').profiles).toContain('cap-aa');expect(r.wrong).toBe(0);expect(r.combo).toBe(1);
});

test('map equipment capabilities: owned search completes and saves the 1-6 recommended same ship sets',async({page})=>{
 await prepareCapability(page,'1-6',[{name:'10cm高角砲＋高射装置',count:1,star:0},{name:'13号対空電探改',count:1,star:0},{name:'三式水中探信儀',count:1,star:0},{name:'三式爆雷投射機',count:1,star:0}],['阿武隈改二','夕立改二','時雨改二','秋月改','雪風改','暁改二']);
 const card=page.locator('#customFleetPanel [data-cf-id="cap-test"]');await card.locator('[data-hd-oc-search]').tap();await expect(card.locator('.hd-oc-result')).toContainText('装備目安は充足');await expect(card.locator('.hd-oc-shortage')).toHaveCount(0);
 await card.locator('[data-hd-oc-apply]').tap();await expect(card.locator('[data-hd-se-capability="cap-aa"]')).toContainText('配備済み');await expect(card.locator('[data-hd-se-capability="cap-asw"]')).toContainText('配備済み');
 const r=await page.evaluate(()=>hdFEMasterValidation(hdFEPlanFromSavedFleet('1-6',loadCustomFleets()['1-6'][0])));expect(r.invalid).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('map equipment capabilities: stock refresh clears a resolved component shortage',async({page})=>{
 await prepareCapability(page,'1-5',[{name:'三式水中探信儀',count:1,star:0}],['夕立改二']);
 const card=page.locator('#customFleetPanel [data-hd-se-capability="cap-asw"]');await expect(card).toContainText('所持不足');
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1,star:0},{name:'三式爆雷投射機',count:1,star:0}]));window.dispatchEvent(new Event('hd:equipment-changed'))});await expect(card).toContainText('手持ちで配備可能');await expect(card).not.toContainText('あと1個');
});

test('equipment reviews distinguish missing synced scouting fields and resolve after syncing',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:1}]);
 await page.evaluate(()=>{HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{safe:1,failBelow:0}]}};localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameLos:36}]));});
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();
 const warning=panel.locator('[data-hd-oc-review-id="scouting"]');await expect(warning).toContainText('司令部Lv、時雨改二 の索敵値');await expect(warning).not.toContainText('夕立改二 の索敵値');await expect(panel.locator('[data-hd-oc-review-kind="data"]')).toBeVisible();
 await warning.locator('button').click();await expect(page.locator('#kancolleImport')).toBeVisible();
 const resolved=await page.evaluate(()=>{localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:20}));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameLos:36},{name:'時雨改二',gameLos:36}]));const r=hdOCSearch(hdOCContext('1-1','oc-test',0));return {available:hdFEScouting(r.plan,hdOCAssigned(r.plan)).available,rows:hdOCReview(r.plan,r.measure)};});
 expect(resolved.available).toBe(true);expect(resolved.rows.some(x=>x.id==='scouting')).toBe(false);
});

test('equipment reviews keep optional 1-6 air guidance out of warnings',async({page})=>{
 await prepareCapability(page,'1-6',[{name:'10cm高角砲＋高射装置',count:1,star:0},{name:'13号対空電探改',count:1,star:0},{name:'三式水中探信儀',count:1,star:0},{name:'三式爆雷投射機',count:1,star:0}],['阿武隈改二','夕立改二','時雨改二','秋月改','雪風改','暁改二']);
 const card=page.locator('#customFleetPanel [data-cf-id="cap-test"]');await card.locator('[data-hd-oc-search]').tap();await expect(card.locator('[data-hd-oc-review-kind="info"]')).toContainText('制空優勢は必須ではありません');await expect(card.locator('[data-hd-oc-review-kind="data"],[data-hd-oc-review-kind="missing"],[data-hd-oc-review-kind="manual"]')).toHaveCount(0);await expect(card).not.toContainText('別途確認が必要');
});

async function baseReviewFixture(page){
 await prepare(page,[{name:'一式陸攻',count:4,star:0}],[{kind:'電探',label:'電探',minCount:0}]);
 await page.evaluate(()=>{hdSEChecks=()=>({rows:[],adv:{base:{available:true,sorties:1,bossRadius:8}}});window.reviewPlan={map:'6-4',ships:[]};window.reviewMeasure={complete:true,goals:[{ok:true}]};});
}

test('equipment reviews identify absent base plans then accept complete owned aircraft plans',async({page})=>{
 await baseReviewFixture(page);
 expect(await page.evaluate(()=>hdOCReview(reviewPlan,reviewMeasure).find(x=>x.id==='base'))).toMatchObject({kind:'data',action:'base'});
 const row=await page.evaluate(()=>{hdLBSave({'6-4':{corps:[{mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))}]}});return hdOCReview(reviewPlan,reviewMeasure).find(x=>x.id==='base');});expect(row).toMatchObject({kind:'info'});expect(row.title).toContain('確認済み');
});

test('equipment reviews check actual map radius and aircraft counts instead of overridden targets',async({page})=>{
 await baseReviewFixture(page);
 const row=await page.evaluate(()=>{hdSEChecks=()=>({rows:[],adv:{base:{available:true,sorties:1,bossRadius:10}}});hdLBSave({'6-4':{corps:[{mode:'sortie',targetRadius:1,squads:Array.from({length:4},()=>({name:'一式陸攻',slot:99,star:0}))}]}});return hdOCReview(reviewPlan,reviewMeasure).find(x=>x.id==='base');});expect(row.kind).toBe('missing');expect(row.reason).toContain('中隊 0/4');expect(row.reason).toContain('ボス必要半径 10');
});

test('equipment reviews count fleet and base aircraft together and enforce sortie limits',async({page})=>{
 await baseReviewFixture(page);
 const row=await page.evaluate(()=>{reviewPlan.ships=[{ship:'赤城改',items:[{name:'一式陸攻',star:0,slotIndex:0}]}];hdLBSave({'6-4':{corps:Array.from({length:2},()=>({mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))}))}});return hdOCReview(reviewPlan,reviewMeasure).find(x=>x.id==='base');});expect(row.kind).toBe('missing');expect(row.reason).toContain('出撃 2部隊 / 海域上限 1部隊');expect(row.reason).toContain('計9個 / 所持4個');
});

test('equipment reviews refresh cached base diagnostics without replacing active inputs',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0},{name:'一式陸攻',count:4,star:0}],[{kind:'電探',label:'電探',minCount:1}]);
 await page.evaluate(()=>{hdSEChecks=()=>({rows:[{kind:'電探',label:'電探',minCount:1}],adv:{base:{available:true,sorties:1,bossRadius:8}}});});
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('[data-hd-oc-review-id="base"]')).toContainText('出撃部隊が未設定');
 const preserved=await page.evaluate(()=>{const el=document.createElement('input');el.id='review-focus-test';document.body.append(el);el.focus();hdLBSave({'1-1':{corps:[{mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))}]}});return document.activeElement===el;});expect(preserved).toBe(true);await expect(panel.locator('[data-hd-oc-review-id="base"]')).toContainText('基本条件は確認済み');
});

test('equipment review base action opens the planner for the proposal map',async({page})=>{
 await prepareCapability(page,'6-4',[],['大潮改二']);const card=page.locator('#customFleetPanel [data-cf-id="cap-test"]');await card.locator('[data-hd-oc-search]').click();await card.locator('[data-hd-oc-review-id="base"] [data-hd-oc-review="base"]').click();await expect(page.locator('#hdLandBasePlanner')).toBeVisible();await expect(page.locator('#hdLandBasePlanner')).toContainText('6-4');
});

test('equipment review reports fleet count failures as unmet conditions even when equipment is complete',async({page})=>{
 await prepare(page,[{name:'33号水上電探',count:1,star:0}],[{kind:'電探',label:'電探',minCount:1}]);
 const r=await page.evaluate(()=>{const result=hdOCSearch(hdOCContext('1-1','oc-test',0));result.plan.routeInfo={total:6,conditionManual:false,requirements:[]};const rows=hdOCReview(result.plan,result.measure);return {route:rows.find(x=>x.id==='route'),headline:hdOCReviewHeadline(result.measure,rows)};});expect(r.route).toMatchObject({kind:'missing',action:'route'});expect(r.route.reason).toContain('編成隻数 2/6');expect(r.headline).toContain('編成や基地計画に未充足');
});

test('speed targets distinguish fast, fast plus, fullwidth plus and fastest without confusing battlecruiser type',async({page})=>{
 await prepare(page,[],[]);const values=await page.evaluate(()=>['駆逐2 高速統一','駆逐2 高速+統一','駆逐2 高速＋統一','駆逐2 最速統一','高速戦艦2'].map(ships=>hdFESpeedTarget(hdFSPresetInfo({ships}))));expect(values).toEqual([10,15,15,20,0]);
});

test('speed checks use improved boiler counts and different groups for each remodel',async({page})=>{
 await prepare(page,[],[]);const rows=await page.evaluate(()=>{
  const t={name:'改良型艦本式タービン'},n=star=>({name:'新型高温高圧缶',star});
  const cases=[['翔鶴改二甲',[n(7)],15],['翔鶴改二甲',[n(7),n(7)],20],['金剛改二丙',[n(7)],10],['大和改二重',[t,n(6)],10],['大和改二重',[t,n(7)],15],['大和改二重',[t,n(7),n(7)],20],['大和改二',[n(7)],10],['長門改',[t,n(7)],10],['長門改二',[t,n(7)],15],['伊勢改二',[t,n(0),n(0)],15],['伊58改',[t,n(7),n(7)],10]];
  return cases.map(([ship,items,expected])=>({ship,expected,result:hdFEShipSpeed({ship,items})}));
 });for(const row of rows)expect(row.result.rank,JSON.stringify(row)).toBe(row.expected);
});

test('speed checks support single engine exceptions and preserve speed ceilings',async({page})=>{
 await prepare(page,[],[]);const rows=await page.evaluate(()=>{
  const turbine={name:'改良型艦本式タービン'},boiler={name:'新型高温高圧缶'};
  return [hdFEShipSpeed({ship:'夕張改二特',items:[],expansion:turbine}),hdFEShipSpeed({ship:'Samuel B.Roberts改',items:[turbine]}),hdFEShipSpeed({ship:'伊201改',items:[boiler]}),hdFEShipSpeed({ship:'鳳翔改二',items:[turbine,boiler,boiler]}),hdFESpeedGoal({ship:'伊58改',items:[turbine,boiler]},15)];
 });expect(rows.slice(0,4).map(x=>x.rank)).toEqual([10,10,10,20]);expect(rows[0].base).toBe(5);expect(rows[4]).toMatchObject({ok:false,unresolved:false});expect(rows[4].detail).toContain('到達できません');
});

test('speed checks reject unavailable slots and invalid expansion gear and invalidate memo after star changes',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{
  const t={name:'改良型艦本式タービン'},n={name:'新型高温高圧缶',star:6},ship={ship:'長門改二',items:[t,n]};const before=hdFEShipSpeed(ship).rank;n.star=7;const after=hdFEShipSpeed(ship).rank;
  return {before,after,outside:hdFEShipSpeed({ship:'長門改二',items:[{...t,slotIndex:99},n]}),duplicate:hdFEShipSpeed({ship:'長門改二',items:[{...t,slotIndex:0},{...n,slotIndex:0}]}),blocked:hdFEShipSpeed({ship:'夕立改二',items:[t],expansion:{name:'強化型艦本式缶'}}),unknown:hdFESpeedGoal({ship:'未知の艦娘',items:[t,n]},15)};
 });expect([r.before,r.after]).toEqual([10,15]);expect(r.outside.rank).toBe(5);expect(r.outside.invalid.length).toBe(1);expect(r.duplicate.rank).toBe(5);expect(r.blocked.rank).toBe(10);expect(r.blocked.invalid.length).toBe(1);expect(r.unknown.unresolved).toBe(true);
});

test('route checks use proposed speed and do not change the original ship type',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{
  const ship={ship:'長門改二',items:[{name:'改良型艦本式タービン'},{name:'新型高温高圧缶',star:7}]},plan={map:'1-1',ships:[ship],routeInfo:{total:1,conditionManual:false,requirements:[],text:'高速+統一',speedRequired:true}};
  const plus=hdFERoute(plan);ship.items[1].star=6;const short=hdFERoute(plan);plan.routeInfo.text='高速統一';const fast=hdFERoute(plan);plan.routeInfo.requirements=[{token:'高速戦艦',count:1}];const type=hdFERoute(plan);return {plus,short,fast,type};
 });expect(r.plus.status).toBe('ready');expect(r.short.status).toBe('missing');expect(r.short.detail).toContain('高速+条件未充足');expect(r.fast.status).toBe('ready');expect(r.type.status).toBe('missing');
});

test('owned speed search can satisfy fast plus with a single improved boiler and clears manual warning',async({page})=>{
 await prepare(page,[{name:'新型高温高圧缶',count:2,star:7}],[{kind:'高速化',label:'高速化',minCount:2}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'翔鶴改二甲',gear:''},{ship:'瑞鶴改二甲',gear:''}];saveCustomFleets(all);const c=hdOCContext('1-1','oc-test',0);c.preset={name:'高速+統一',ships:'装甲空母2 高速+統一'};const result=hdOCSearch(c);return {result,route:hdFERoute(result.plan),reviews:hdOCReview(result.plan,result.measure)};});
 expect(r.result.measure.complete).toBe(true);expect(r.result.shortages).toEqual([]);expect(r.route.status).toBe('ready');expect(r.reviews.find(x=>x.id==='speed')).toMatchObject({kind:'info'});expect(r.result.plan.ships.every(s=>s.items.some(x=>x.name==='新型高温高圧缶'&&x.star===7))).toBe(true);
});

test('owned speed search does not declare an ordinary fast boiler set sufficient for a low speed fast plus route',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:2,star:0},{name:'強化型艦本式缶',count:2,star:0}],[{kind:'高速化',label:'高速化',minCount:2}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'長門改二',gear:''},{ship:'陸奥改二',gear:''}];saveCustomFleets(all);const c=hdOCContext('1-1','oc-test',0);c.preset={name:'高速+統一',ships:'戦艦2 高速+統一'};const result=hdOCSearch(c);return {result,reviews:hdOCReview(result.plan,result.measure)};});expect(r.result.measure.complete).toBe(false);expect(r.reviews.find(x=>x.id==='speed')).toMatchObject({kind:'missing'});expect(r.reviews.find(x=>x.id==='speed').reason).toContain('★7以上');
});

test('owned speed search uses turbine only for Yubari special remodel without requesting unnecessary boilers',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:1,star:0}],[{kind:'高速化',label:'高速化',minCount:1}]);
 const r=await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'夕張改二特',gear:''}];saveCustomFleets(all);const c=hdOCContext('1-1','oc-test',0);c.preset={name:'高速統一',ships:'軽巡1 高速統一'};return hdOCSearch(c)});expect(r.measure.complete).toBe(true);expect(r.shortages).toEqual([]);expect(r.measure.goals.some(g=>g.kind==='speed-boiler')).toBe(false);
});

test('speed UI shows the required grade and resolves an improved boiler shortage after re-search',async({page})=>{
 await prepare(page,[{name:'改良型艦本式タービン',count:1,star:0},{name:'新型高温高圧缶',count:1,star:6}],[{kind:'高速化',label:'高速化',minCount:1}]);
 await page.evaluate(()=>{const all=loadCustomFleets();all['1-1'][0].ships=[{ship:'長門改二',gear:''}];saveCustomFleets(all);MAP_PLANS['1-1']={presets:[{name:'高速+統一',ships:'戦艦1 高速+統一'}]};hdMSNOpen('1-1');});
 const panel=page.locator('#mapStrategyNavigator .hd-oc-panel');await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('[data-hd-oc-review-id="speed"]')).toContainText('低速 → 高速');await expect(panel.locator('[data-hd-oc-review-id="speed"]')).toContainText('★7以上');await expect(panel.locator('[data-hd-oc-review-kind="missing"]')).toContainText('高速+条件');await expect(panel.locator('.hd-oc-shortage')).not.toContainText('所持数は足りています');
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'改良型艦本式タービン',count:1,star:0},{name:'新型高温高圧缶',count:1,star:7}]));hdOCRefresh();});await panel.locator('[data-hd-oc-search]').click();await expect(panel.locator('[data-hd-oc-review-id="speed"]')).toContainText('低速 → 高速+');await expect(panel.locator('[data-hd-oc-review-kind="missing"]')).toHaveCount(0);await expect(panel.locator('[data-hd-oc-review-kind="info"]')).toContainText('速力条件は確認済み');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('fleet suggestions use each exact remodel master speed instead of the final remodel database shortcut',async({page})=>{
 await prepare(page,[],[]);const speeds=await page.evaluate(()=>['夕張','夕張改二','夕張改二特','大和改','大和改二','大和改二重'].map(name=>hdFSProfile({name}).speed));expect(speeds).toEqual(['高速','高速','低速','低速','高速','低速']);
});
test('base air checks use strict disadvantage and parity boundaries and explicit enemy zero',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>({thresholds:['disadvantage','parity','superiority','supremacy'].map(g=>hdLBAirThreshold(318,g)),states:[106,107,212,213,476,477,953,954].map(n=>hdLBAirState(n,318)),zero:hdLBAirThreshold(0,'superiority'),noAir:hdLBAirState(0,0)}));
 expect(r.thresholds).toEqual([107,213,477,954]);expect(r.states).toEqual(['喪失','劣勢','劣勢','均衡','均衡','優勢','優勢','確保']);expect(r.zero).toBe(0);expect(r.noAir).toBe('航空戦なし');
});

test('base air checks distinguish base enemy presets and never reuse stale map or mode presets',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0})),airCheck:{enemyId:'m1'}};return {normal:hdLBAirAssessment('6-5',c),final:hdLBAirAssessment('6-5',{...c,airCheck:{enemyId:'m3'}}),other:hdLBAirAssessment('6-4',c),defense:hdLBAirAssessment('6-5',{...c,mode:'defense'}),empty:hdLBAirAssessment('6-5',{...c,airCheck:{enemyId:'custom',enemyAir:''}}),zero:hdLBAirAssessment('6-5',{...c,airCheck:{enemyId:'custom',enemyAir:'0'}})};});
 expect(r.normal.enemy).toBe(215);expect(r.final.enemy).toBe(318);expect(r.other.enemy).toBeNull();expect(r.defense.enemy).toBeNull();expect(r.empty.status).toBe('data');expect(r.zero.enemy).toBe(0);expect(r.zero.shortage).toBe(0);
});

test('base boss presets include enemy reconnaissance for 6-4 and 7-4',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))},get=(map,id)=>hdLBAirAssessment(map,{...c,airCheck:{enemyId:id}});return {n:[1,2,3,4,5,6].map(i=>get('6-4',`n${i}`).enemy),p:[1,2,3,4,5,6].map(i=>get('7-4',`p${i}`).enemy),finalN:get('6-4','n6'),finalP:get('7-4','p6'),wrong:get('6-4','p6')};});
 expect(r.n).toEqual([78,34,112,48,48,49]);expect(r.p).toEqual([93,97,94,98,155,158]);expect(r.finalN.required).toBe(17);expect(r.finalP.required).toBe(53);expect(r.finalP.source).toContain('/南西海域/7-4');expect(r.finalN.source).toContain('/中部海域/6-4');expect(r.wrong.enemy).toBeNull();
});

test('base phase presets use maximum enemy air rather than one random composition',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))};return ['6-4','6-5','7-4'].map(map=>['boss-all','boss-normal','boss-final'].map(enemyId=>hdLBAirAssessment(map,{...c,airCheck:{enemyId}}).enemy));});
 expect(r).toEqual([[112,112,49],[318,318,318],[158,98,158]]);
});

test('base phase choice updates shortages and preparation without manual enemy input',async({page})=>{
 await baseReviewFixture(page);await page.waitForFunction(()=>typeof hdSPSBaseInfo==='function');
 const r=await page.evaluate(()=>{const c={mode:'sortie',targetRadius:2,squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0,maxProf:true})),airCheck:{enemyId:'boss-normal'}},state={corps:[c]};hdLBSave({'7-4':state});const normal=hdSPSBaseInfo('7-4');c.airCheck.enemyId='boss-final';hdLBSave({'7-4':state});const final=hdSPSBaseInfo('7-4');const plan={...reviewPlan,map:'7-4'};return {normal:normal.sortieReady,final:final.sortieReady,normalAir:normal.corps[0].airCheck,finalAir:final.corps[0].airCheck,review:hdOCReview(plan,reviewMeasure),html:hdSPSBaseHtml('7-4')};});
 expect(r.normal).toBe(true);expect(r.final).toBe(false);expect(r.normalAir.enemy).toBe(98);expect(r.finalAir.enemy).toBe(158);expect(r.finalAir.shortage).toBeGreaterThan(0);expect(r.review.find(x=>x.id==='base-air:0').kind).toBe('missing');expect(r.html).toContain('158');
});

test('base boss phase selection persists on mobile with matching map source and no raid note',async({page})=>{
 await baseReviewFixture(page);
 await page.evaluate(()=>{selectedMap='7-4';selectedWorld='7';renderMapPicker();hdFEOpenCalculator();hdRenderLandBasePlanner();});
 const planner=page.locator('#hdLandBasePlanner');await planner.locator('[data-hd-lb-air="0"][data-field="enemyId"]').selectOption('boss-final');await expect(planner.locator('[data-hd-lb-air="0"][data-field="enemyId"]')).toHaveValue('boss-final');await expect(planner.locator('[data-hd-lb-air-result="0"] a')).toHaveAttribute('href','https://wikiwiki.jp/kancolle/南西海域/7-4');await expect(planner.locator('[data-hd-lb-defense-result]')).toContainText('基地空襲はありません');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await page.reload();await page.waitForFunction(()=>typeof hdLBLoad==='function');expect(await page.evaluate(()=>hdLBLoad()['7-4'].corps[0].airCheck.enemyId)).toBe('boss-final');
});

test('base air checks calculate residual supply and loss scenarios without mutating saved squads',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'sortie',squads:[{name:'二式陸上偵察機',slot:2,star:0,maxProf:false},...Array.from({length:3},()=>({name:'一式陸攻',slot:14,star:0,maxProf:false}))],airCheck:{enemyId:'custom',enemyAir:318,lossPercent:100}},before=JSON.stringify(c),a=hdLBAirAssessment('6-5',c);return {a,unchanged:before===JSON.stringify(c),noLoss:hdLBAirAssessment('6-5',{...c,airCheck:{enemyId:'custom',enemyAir:318,lossPercent:0}})};});
 expect(r.a.missing).toBe(14);expect(r.a.fuel).toBe(42);expect(r.a.bauxite).toBe(70);expect(r.a.scenarioPower).toBe(0);expect(r.a.scenarioShortage).toBe(107);expect(r.a.fullPower).toBeGreaterThan(r.a.ours);expect(r.unchanged).toBe(true);expect(r.noLoss.scenarioPower).toBe(r.noLoss.ours);
});

test('base air checks reject invalid aircraft counts stars enemies and loss inputs',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0})),airCheck:{enemyId:'custom',enemyAir:100}};return {invalid:[-1,19,2.5].map(slot=>hdLBAirAssessment('6-4',{...c,squads:c.squads.map(s=>({...s,slot}))}).status),star:hdLBAirAssessment('6-4',{...c,squads:c.squads.map(s=>({...s,star:11}))}).status,enemy:[-1,1.5,'',10001].map(enemyAir=>hdLBAirAssessment('6-4',{...c,airCheck:{enemyId:'custom',enemyAir}}).enemy),loss:hdLBAirAssessment('6-4',{...c,airCheck:{lossPercent:101}}).loss};});
 expect(r.invalid).toEqual(['data','data','data']);expect(r.star).toBe('data');expect(r.enemy).toEqual([null,null,null,null]);expect(r.loss).toBeNull();
});

test('base defense check sums only defense corps and supports strongest raid preset',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const c={mode:'defense',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))},state={defenseCheck:{enemyId:'raid3'},corps:[c,c,{...c,mode:'sortie'},{...c,mode:'standby'}]},a=hdLBDefenseAssessment('6-5',state);return {a,one:hdLBCorpsPower(c,'defense').total,none:hdLBDefenseAssessment('6-5',{...state,corps:[]})};});
 expect(r.a.count).toBe(2);expect(r.a.ours).toBe(2*r.one);expect(r.a.enemy).toBe(313);expect(r.a.required).toBe(470);expect(r.none.status).toBe('missing');expect(r.none.shortage).toBe(470);
});

test('base air equipment review transitions from no enemy to shortage then met estimate',async({page})=>{
 await baseReviewFixture(page);
 const r=await page.evaluate(()=>{const state={corps:[{mode:'sortie',squads:Array.from({length:4},()=>({name:'一式陸攻',slot:14,star:0}))}]};hdLBSave({'6-4':state});const get=()=>hdOCReview(reviewPlan,reviewMeasure),missing=get();state.corps[0].airCheck={enemyId:'custom',enemyAir:318,lossPercent:100};hdLBSave({'6-4':state});const shortage=get();state.corps[0].airCheck.enemyAir=0;hdLBSave({'6-4':state});return {missing,shortage,met:get()};});
 expect(r.missing.find(x=>x.id==='base-air:0').kind).toBe('data');expect(r.shortage.find(x=>x.id==='base-air:0').kind).toBe('missing');expect(r.shortage.find(x=>x.id==='base-loss:0').reason).toContain('補充 16機');expect(r.shortage.find(x=>x.id==='base-scenario:0').kind).toBe('manual');expect(r.met.find(x=>x.id==='base-air:0').kind).toBe('info');
});

test('base air mobile controls persist enemy goal and loss settings and survive reload',async({page})=>{
 await baseReviewFixture(page);
 await page.evaluate(()=>{selectedMap='6-5';selectedWorld='6';hdLBSave({'6-5':{corps:[{mode:'sortie',targetRadius:5,squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))}]}});renderMapPicker();hdFEOpenCalculator();hdRenderLandBasePlanner();});
 const result=page.locator('#hdLandBasePlanner [data-hd-lb-air-result="0"]');await expect(result).toBeVisible();await result.locator('[data-field="enemyId"]').selectOption('m3');await expect(result).toContainText('基地用敵制空 318');await result.locator('[data-field="goal"]').selectOption('parity');await expect(result).toContainText('目安 213');await result.locator('[data-field="lossPercent"]').fill('50');await result.locator('[data-field="lossPercent"]').blur();await expect(result).toContainText('仮に50%');
 const saved=await page.evaluate(()=>hdLBLoad()['6-5'].corps[0].airCheck);expect(saved).toMatchObject({enemyId:'m3',goal:'parity',lossPercent:'50'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await page.waitForFunction(()=>typeof hdLBLoad==='function');expect(await page.evaluate(()=>hdLBLoad()['6-5'].corps[0].airCheck)).toEqual(saved);
});

test('base air custom enemy and defense controls update their distinct persisted fields',async({page})=>{
 await baseReviewFixture(page);
 await page.evaluate(()=>{selectedMap='6-5';selectedWorld='6';renderMapPicker();hdFEOpenCalculator();hdRenderLandBasePlanner();});
 const planner=page.locator('#hdLandBasePlanner');await planner.locator('[data-hd-lb-air="0"][data-field="enemyId"]').selectOption('custom');const input=planner.locator('[data-hd-lb-air="0"][data-field="enemyAir"]');await input.fill('0');await input.blur();await expect(planner.locator('[data-hd-lb-air-result="0"]')).toContainText('第1中隊');
 await planner.locator('[data-hd-lb-defense="enemyId"]').selectOption('raid3');await expect(planner.locator('[data-hd-lb-defense-result]')).toContainText('敵 313');await expect(planner.locator('[data-hd-lb-defense-result]')).toContainText('470');
 expect(await page.evaluate(()=>hdLBLoad()['6-5'].defenseCheck.enemyId)).toBe('raid3');expect(await page.evaluate(()=>hdLBLoad()['6-5'].corps[0].airCheck.enemyAir)).toBe('0');
});
test('base air preparation readiness requires enemy data air goal and filled aircraft',async({page})=>{
 await baseReviewFixture(page);await page.waitForFunction(()=>typeof hdSPSBaseInfo==='function');
 const r=await page.evaluate(()=>{const c={mode:'sortie',targetRadius:5,squads:Array.from({length:4},()=>({name:'一式陸攻',slot:18,star:0}))},state={corps:[c]};hdLBSave({'6-4':state});const unknown=hdSPSBaseInfo('6-4');c.airCheck={enemyId:'custom',enemyAir:318};hdLBSave({'6-4':state});const shortage=hdSPSBaseInfo('6-4');c.airCheck.enemyAir=0;hdLBSave({'6-4':state});const met=hdSPSBaseInfo('6-4');c.squads[0].slot=0;hdLBSave({'6-4':state});return {unknown:unknown.sortieReady,shortage:shortage.sortieReady,met:met.sortieReady,empty:hdSPSBaseInfo('6-4').sortieReady,html:hdSPSBaseHtml('6-4')};});
 expect(r.unknown).toBe(false);expect(r.shortage).toBe(false);expect(r.met).toBe(true);expect(r.empty).toBe(false);expect(r.html).toContain('補充 18機');expect(r.html).toContain('ボーキ 90');
});

test('all sea air data cover 37 maps 300 battle nodes and typed enemy patterns',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{const maps=Object.entries(HD_MAP_AIR_DATA),nodes=maps.flatMap(([map,d])=>Object.values(d.nodes)),samples=nodes.flatMap(n=>n.patterns);return {maps:maps.length,nodes:nodes.length,patterns:samples.length,valid:samples.every(p=>p.air===null||Number.isInteger(p.air)&&p.air>=0),missing:maps.filter(([map,d])=>!Object.keys(d.nodes).length||!d.source.endsWith('/'+map)).map(([map])=>map)};});
 expect(r).toEqual({maps:37,nodes:300,patterns:1259,valid:true,missing:[]});
});

test('all sea air maximums come from enemy air columns not superiority columns',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>[['1-4','L'],['3-5','H'],['5-6','Z'],['6-5','M'],['7-4','P'],['7-5','A']].map(([map,node])=>Math.max(...HD_MAP_AIR_DATA[map].nodes[node].patterns.map(p=>p.air))));
 expect(r).toEqual([20,254,435,312,157,335]);
});

test('all sea air targets exclude unvisited carrier nodes and separate maps',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{hdMapAirSave('3-5','K',true);const lower=hdMapAirTarget('3-5');hdMapAirSave('3-5','H',true);const upper=hdMapAirTarget('3-5');hdMapAirSave('3-5','H',false);return {lower,upper,restored:hdMapAirTarget('3-5'),other:hdMapAirTarget('7-5')};});
 expect(r.lower).toMatchObject({known:true,enemy:0});expect(r.upper.enemy).toBe(254);expect(r.restored.enemy).toBe(0);expect(r.other.selected).toBe(false);expect(r.other.known).toBe(false);
});

test('all sea air route choices change required air in actual fleet evaluation',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{const air={basePower:40,capacityKnown:1,count:1,rows:[{cap:16,aa:10,meta:{category:'艦上戦闘機'}}]};hdMapAirSave('1-4','L',true);const normal=hdFEAirCheck('1-4',air);hdMapAirSave('1-4',null,false,'supremacy');return {normal,strong:hdFEAirCheck('1-4',air),target:hdMapAirTarget('1-4')};});
 expect(r.normal).toMatchObject({enemy:20,required:30,status:'ready'});expect(r.normal.loss.active).toBe(1);expect(r.strong.required).toBe(60);expect(r.strong.status).not.toBe('ready');expect(r.target.goal).toBe('supremacy');
});

test('all sea air unknown route and unconfirmed enemy data cannot pass readiness',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFEAirCheck==='function');const r=await page.evaluate(()=>{const air={basePower:9999,capacityKnown:1,count:1},unknown=hdFEAirCheck('7-5',air);hdMapAirSave('6-4','H',true);const missing=hdMapAirTarget('6-4'),check=hdFEAirCheck('6-4',air);localStorage.setItem(HD_MAP_AIR_KEY,JSON.stringify({'7-5':{nodeIds:['nonexistent'],goal:'supremacy'}}));return {unknown,missing,check,stale:hdMapAirTarget('7-5')};});
 expect(r.unknown).toMatchObject({status:'manual',reason:'route'});expect(r.missing.known).toBe(false);expect(r.check.status).toBe('manual');expect(r.stale.invalid).toBe(true);expect(r.stale.enemy).toBeNull();
});

test('all sea air selection keeps lower 1-6 optional but checks upper routes',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{hdMapAirSave('1-6','F',true);const lower=hdSEAirOptional('1-6');hdMapAirSave('1-6','K',true);return {lower,upper:hdSEAirOptional('1-6'),other:hdSEAirOptional('1-4')};});expect(r).toEqual({lower:true,upper:false,other:false});
});

test('all sea air strict boundary ratios distinguish loss disadvantage and parity',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>({loss:hdFCAirStatus(100,300).cls,disadvantage:hdFCAirStatus(200,300).cls,parity:hdFCAirStatus(201,300).cls,targets:['disadvantage','parity','superiority','supremacy'].map(g=>hdMapAirThreshold(300,g))}));expect(r).toEqual({loss:'lost',disadvantage:'disadvantage',parity:'parity',targets:[101,201,450,900]});
});

test('all sea air fallback parsing retains both endpoints of enemy ranges',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{HD_NODE_DETAIL_OVERRIDES['99-1']={A:{air:'敵制空値8〜16。優勢12〜24、確保24〜48。'},B:{air:'敵制空 20～30'}};return hdFCMapEnemyAirCandidates('99-1')});expect(r).toEqual([8,16,20,30]);
});

test('all sea air loss ranges use per slot floors and jet denominators without mutation',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{const fighter=[{category:'艦上戦闘機',slot:20}],jet=[{category:'噴式戦闘爆撃機',slot:20}],before=JSON.stringify(fighter);return {secure:hdMapAirLossBounds(fighter,0,r=>r.slot),small:hdMapAirLossBounds([{category:'艦上戦闘機',slot:17}],0,r=>r.slot),jet:hdMapAirLossBounds(jet,0,r=>r.slot),lost:hdMapAirLossBounds(fighter,100,r=>r.slot),unchanged:before===JSON.stringify(fighter),unknown:hdMapAirLossBounds(fighter,null,r=>r.slot)};});
 expect(r.secure).toMatchObject({minLost:0,maxLost:1,lower:19,upper:20});expect(r.small.maxLost).toBe(0);expect(r.jet.maxLost).toBe(0);expect(r.lost).toMatchObject({minLost:5,maxLost:11,lower:9,upper:15});expect(r.unchanged).toBe(true);expect(r.unknown).toBeNull();
});

test('all sea air selection invalidates cached equipment signatures only for the changed map',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0),before=hdOCSignature(c);hdMapAirSave('1-4','L',true);const other=hdOCSignature(c);hdMapAirSave('1-1','C',true);return {otherUnchanged:before===other,changed:before!==hdOCSignature(c)};});expect(r).toEqual({otherUnchanged:true,changed:true});
});

test('all sea air mobile node and goal controls persist through reload without overflow',async({page})=>{
 await prepare(page,[],[]);await page.evaluate(()=>{selectedMap='7-5';selectedWorld='7';renderMapPicker();hdFEOpenCalculator();hdFCRender();});const fc=page.locator('#hdFleetCalculator');await fc.locator('[data-hd-map-air-select="A"]').check();await expect(fc.locator('[data-hd-map-air-select="A"]')).toBeChecked();await fc.locator('[data-hd-map-air-goal]').selectOption('parity');await expect(fc.locator('[data-hd-map-air-panel]')).toContainText('敵 335');await expect(fc.locator('[data-hd-fc-enemy]')).toBeDisabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await page.reload();await page.waitForFunction(()=>typeof hdMapAirTarget==='function');expect(await page.evaluate(()=>hdMapAirTarget('7-5'))).toMatchObject({known:true,enemy:335,goal:'parity',ids:['A']});
});

test('all sea air node details show every recorded enemy pattern and base distinction',async({page})=>{
 await boot(page);const html=await page.evaluate(()=>hdMapAirNodeHtml('7-4','P'));expect(html).toContain('157');expect(html).toContain('優勢236');expect(html).toContain('基地用制空値とは異なります');expect(html).toContain('ヒ船団棲姫');expect(html).toContain('南西海域/7-4');
});
test('route air profiles distinguish night submarine raid and two round aviation nodes',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{hdMapAirSave('6-5','J',true);return {profiles:[['1-6','F'],['6-5','G'],['6-5','J'],['6-5','B']].map(([m,n])=>hdMapAirNodeProfile(m,n)),night:hdMapAirTarget('6-5')};});
 expect(r.profiles.map(p=>p.rounds)).toEqual([2,1,0,0]);expect(r.night).toMatchObject({known:true,enemy:0,hasAir:false});expect(r.profiles[2].kind).toBe('夜戦');
});

test('route air order needs confirmation and selection moves reset it while goals preserve it',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{hdMapAirSave('1-4','L',true);hdMapAirSave('1-4','J',true);const legacy=hdMapAirRouteLoss('1-4',[],()=>0);hdMapAirConfirmOrder('1-4');hdMapAirSave('1-4',null,false,'parity');const goal=hdMapAirSelection('1-4');hdMapAirMove('1-4','J',-1);const moved=hdMapAirSelection('1-4');hdMapAirConfirmOrder('1-4');hdMapAirSave('1-4','J',false);return {legacy,goal,moved,removed:hdMapAirSelection('1-4')};});
 expect(r.legacy.known).toBe(false);expect(r.legacy.reason).toContain('順番が未確認');expect(r.goal.orderConfirmed).toBe(true);expect(r.moved).toMatchObject({nodeIds:['J','L'],orderConfirmed:false,goal:'parity'});expect(r.removed).toMatchObject({nodeIds:['L'],orderConfirmed:false});
});

test('route air cumulative stage one bounds carry actual residual slots without mutation',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{HD_MAP_AIR_DATA['99-1']={source:'fixture',nodes:Object.fromEntries(['A','B','C','D'].map(id=>[id,{label:id+'：通常戦',patterns:[{enemy:'駆逐イ級',air:0}]}]))};for(const id of ['A','B','C','D'])hdMapAirSave('99-1',id,true);hdMapAirConfirmOrder('99-1');const rows=[{category:'艦上戦闘機',slot:20}],before=JSON.stringify(rows),chain=hdMapAirRouteLoss('99-1',rows,r=>r.slot);return {chain,unchanged:before===JSON.stringify(rows)};});
 expect(r.chain.steps.map(s=>s.afterLower)).toEqual([19,18,17,17]);expect(r.chain).toMatchObject({known:true,initial:20,lower:17,upper:20,minLost:0,maxLost:3,maxGap:0});expect(r.unchanged).toBe(true);
});

test('route air flags later deficit in readiness and owned equipment goals despite sufficient starting air',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{HD_MAP_AIR_DATA['99-2']={source:'fixture',nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:id+'：通常戦',patterns:[{enemy:'空母ヲ級',air:40}]}]))};hdMapAirSave('99-2','A',true);hdMapAirSave('99-2','B',true);hdMapAirConfirmOrder('99-2');const air={basePower:63,count:1,capacityKnown:1,rows:[{cap:40,aa:10,meta:{category:'艦上戦闘機'}}]},check=hdFEAirCheck('99-2',air),chain=check.routeLoss;return {check,chain};});
 expect(r.check).toMatchObject({ours:63,required:60,status:'partial'});expect(r.chain).toMatchObject({known:true,lower:48,upper:59,minLost:5,maxLost:16,maxGap:3});expect(r.chain.firstGap).toMatchObject({id:'B',round:1,beforeLower:57,beforeUpper:60,gap:3});expect(r.chain.minimumRatio).toBeCloseTo(57/60);
 const goal=await page.evaluate(()=>{const originalAssigned=hdOCAssigned,originalAir=hdFEAir;hdOCAssigned=()=>[];hdFEAir=()=>({basePower:63,count:1,capacityKnown:1,rows:[{cap:40,aa:10,meta:{category:'艦上戦闘機'}}]});try{return hdOCMeasure({map:'99-2',ships:[],routeInfo:{}},[],[]).goals.find(g=>g.kind==='air-value')}finally{hdOCAssigned=originalAssigned;hdFEAir=originalAir}});
 expect(goal.ok).toBe(false);expect(goal.ratio).toBeCloseTo(57/60);expect(goal.detail).toContain('B・1回目であと3不足');
});

test('route air counts two rounds within aviation node and skips night and submarine stages',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{hdMapAirSave('1-6','F',true);hdMapAirConfirmOrder('1-6');const two=hdMapAirRouteLoss('1-6',[{category:'艦上戦闘機',slot:40}],r=>Math.floor(10*Math.sqrt(r.slot)));hdMapAirSave('6-5','B',true);hdMapAirSave('6-5','J',true);hdMapAirConfirmOrder('6-5');const skip=hdMapAirRouteLoss('6-5',[{category:'艦上戦闘機',slot:40}],r=>r.slot);return {two,skip};});
 expect(r.two.steps.map(s=>s.round)).toEqual([1,2]);expect(r.two).toMatchObject({lower:45,upper:59,minLost:5,maxLost:19});expect(r.skip.steps.map(s=>s.round)).toEqual([0,0]);expect(r.skip).toMatchObject({lower:40,upper:40,minLost:0,maxLost:0,maxGap:0});
});

test('route air rejects unconfirmed enemy malformed slots and duplicate nodes',async({page})=>{
 await boot(page);const r=await page.evaluate(()=>{hdMapAirSave('6-4','H',true);const confirm=hdMapAirConfirmOrder('6-4'),enemy=hdMapAirRouteLoss('6-4',[],()=>0);hdMapAirSave('1-4','L',true);hdMapAirConfirmOrder('1-4');const slots=[-1,100,1.5,NaN].map(slot=>hdMapAirRouteLoss('1-4',[{category:'艦上戦闘機',slot}],r=>r.slot));const power=hdMapAirRouteLoss('1-4',[{category:'艦上戦闘機',slot:20}],()=>NaN);localStorage.setItem(HD_MAP_AIR_KEY,JSON.stringify({'1-4':{nodeIds:['L','L'],goal:'superiority',orderConfirmed:true}}));return {confirm,enemy,slots,power,duplicate:hdMapAirRouteLoss('1-4',[],()=>0)};});
 expect(r.confirm).toBe(false);expect(r.enemy.known).toBe(false);expect(r.slots.every(x=>!x.known)).toBe(true);expect(r.power.known).toBe(false);expect(r.duplicate.known).toBe(false);
});

test('route air mobile order buttons confirmation and settings survive reload',async({page})=>{
 await prepare(page,[],[]);await page.evaluate(()=>{selectedMap='6-5';selectedWorld='6';renderMapPicker();hdFEOpenCalculator();hdFCMutate('6-5','manual',s=>{s.gear=[{name:'零式艦戦53型(岩本隊)',slot:40,star:0,maxProf:false}]})});const fc=page.locator('#hdFleetCalculator');await fc.locator('[data-hd-map-air-select="M"]').check();await fc.locator('[data-hd-map-air-select="J"]').check();await fc.locator('[data-hd-map-air-move="J"][data-direction="-1"]').click();await fc.locator('[data-hd-map-air-confirm]').click();await expect(fc.locator('[data-hd-map-air-order]')).toContainText('確認済み');await expect(fc.locator('[data-hd-map-air-route-loss]')).toContainText('最終制空');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await page.reload();await page.waitForFunction(()=>typeof hdMapAirSelection==='function');expect(await page.evaluate(()=>hdMapAirSelection('6-5'))).toMatchObject({nodeIds:['J','M'],orderConfirmed:true});
});

test('route air reordered settings invalidate cached equipment results and only confirmed chains show review',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{const c=hdOCContext('1-1','oc-test',0);hdMapAirSave('1-1','A',true);hdMapAirSave('1-1','C',true);const before=hdOCSignature(c);hdMapAirConfirmOrder('1-1');const confirmed=hdOCSignature(c);hdMapAirMove('1-1','C',-1);return {confirmed:before!==confirmed,moved:confirmed!==hdOCSignature(c),html:hdMapAirRouteHtml('1-1',hdMapAirRouteLoss('1-1',[],()=>0))};});expect(r.confirmed).toBe(true);expect(r.moved).toBe(true);expect(r.html).toContain('順番が未確認');expect(r.html).not.toContain('このモデル内では目標値以上');
});

test('enemy AA later shortage feeds readiness and owned gear scoring',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{HD_MAP_AIR_DATA['99-8']={nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:'通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:40,formations:['単縦陣']}]}]))};for(const id of ['A','B'])hdMapAirSave('99-8',id,true);hdMapAirConfirmOrder('99-8');const air={basePower:63,count:1,capacityKnown:1,rows:[{name:'test bomber',cap:40,aa:10,meta:{category:'艦上爆撃機'}}]},check=hdFEAirCheck('99-8',air),originalAssigned=hdOCAssigned,originalAir=hdFEAir;hdOCAssigned=()=>[];hdFEAir=()=>air;try{return {check,goal:hdOCMeasure({map:'99-8',ships:[],routeInfo:{}},[],[]).goals.find(g=>g.kind==='air-value')}}finally{hdOCAssigned=originalAssigned;hdFEAir=originalAir}});
 expect(r.check).toMatchObject({ours:63,required:60,status:'partial',routeLoss:{stage2Complete:true}});expect(r.check.routeLoss.firstGap).toMatchObject({id:'B',gap:19,beforeLower:41});expect(r.goal.ok).toBe(false);expect(r.goal.ratio).toBeCloseTo(41/60);expect(r.goal.detail).toContain('B・1回目であと19不足');
});

test('enemy AA missing data are unresolved conditions with calculator action rather than invented gear shortages',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{HD_MAP_AIR_DATA['99-9']={nodes:{A:{label:'通常戦',patterns:[{name:'パターン1',enemy:'未登録敵テスト',air:1,formations:['単縦陣']}]}}};hdMapAirSave('99-9','A',true);hdMapAirConfirmOrder('99-9');const air={basePower:63,count:1,capacityKnown:1,rows:[{name:'test bomber',cap:40,aa:10,meta:{category:'艦上爆撃機'}}]},check=hdFEAirCheck('99-9',air),originalAssigned=hdOCAssigned,originalAir=hdFEAir;hdOCAssigned=()=>[];hdFEAir=()=>air;try{const plan={map:'99-9',ships:[],routeInfo:{}},measure=hdOCMeasure(plan,[],[]);return {check,measure,reviews:hdOCReview(plan,measure),shortages:hdOCSearch({map:'99-9',fleet:{id:'aa-test',ships:[]},preset:null,index:0}).shortages}}finally{hdOCAssigned=originalAssigned;hdFEAir=originalAir}});
 expect(r.check).toMatchObject({status:'manual',reason:'anti-air',routeLoss:{stage2Complete:false}});expect(r.measure.complete).toBe(false);expect(r.measure.goals.find(g=>g.kind==='air-value')).toMatchObject({ok:false,unresolved:true});expect(r.reviews.find(x=>x.id==='air-route-data')).toMatchObject({kind:'data',action:'calculator'});expect(r.reviews.find(x=>x.id==='air')).toMatchObject({action:'calculator'});expect(r.reviews.find(x=>x.id==='air-route-data').reason).toContain('未登録敵テスト');expect(r.shortages).toEqual([]);
});
test('aircraft evasion improves later route readiness and owned gear score without changing initial air',async({page})=>{
 await prepare(page,[],[]);const r=await page.evaluate(()=>{HD_MAP_AIR_DATA['99-12']={nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:'通常戦',patterns:[{name:'パターン1',enemy:'軽巡ツ級elite',air:40,formations:['単縦陣']}]}]))};for(const id of ['A','B'])hdMapAirSave('99-12',id,true);hdMapAirConfirmOrder('99-12');const air=name=>({basePower:63,count:1,capacityKnown:1,rows:[{name,cap:40,aa:10,meta:{name,category:'艦上爆撃機'}}]}),plain=hdFEAirCheck('99-12',air('彗星')),named=hdFEAirCheck('99-12',air('彗星(江草隊)')),assigned=hdOCAssigned,originalAir=hdFEAir;hdOCAssigned=()=>[];hdFEAir=()=>air('彗星(江草隊)');try{return {plain,named,goal:hdOCMeasure({map:'99-12',ships:[],routeInfo:{}},[],[]).goals.find(g=>g.kind==='air-value')}}finally{hdOCAssigned=assigned;hdFEAir=originalAir}});
 expect(r.plain.ours).toBe(r.named.ours);expect(r.plain.routeLoss.firstGap.gap).toBe(19);expect(r.named.routeLoss.firstGap).toMatchObject({id:'B',gap:12,beforeLower:48});expect(r.goal.ratio).toBeCloseTo(48/60);expect(r.named.routeLoss.slotResults[0].evasion).toMatchObject({registered:true,weightedPercent:60,fleetPercent:70});
});
test('aircraft evasion mobile calculator shows coefficients and retains aircraft after reload',async({page})=>{
 await prepare(page,[],[]);await page.evaluate(()=>{selectedMap='3-5';selectedWorld='3';renderMapPicker();hdFEOpenCalculator();hdFCMutate('3-5','manual',s=>{s.gear=[{name:'瑞雲改二(六三四空)',slot:18,star:0,maxProf:false}]})});const fc=page.locator('#hdFleetCalculator');await fc.locator('[data-hd-map-air-select="K"]').check();await fc.locator('[data-hd-map-air-confirm]').click();await expect(fc.locator('[data-hd-map-air-residual-slots]')).toContainText('射撃回避：加重×0.5・防空×0.7');await expect(fc.locator('[data-hd-map-air-route-loss]')).not.toContainText('射撃回避補正なし');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await page.reload();await page.waitForFunction(()=>document.body.dataset.hdReady==='1');expect(await page.evaluate(()=>hdFCState('3-5','manual').gear[0].name)).toBe('瑞雲改二(六三四空)');await page.evaluate(()=>{selectedMap='3-5';selectedWorld='3';renderMapPicker();hdFEOpenCalculator();hdFCRender()});await expect(page.locator('[data-hd-map-air-residual-slots]')).toContainText('射撃回避：加重×0.5・防空×0.7');
});

test('enemy AA mobile residual slots show zero-machine model and survive reload',async({page})=>{
 await prepare(page,[],[]);await page.evaluate(()=>{selectedMap='3-5';selectedWorld='3';renderMapPicker();hdFEOpenCalculator();const item=hdFCCatalog().find(x=>x.category==='水上爆撃機');hdFCMutate('3-5','manual',s=>{s.gear=[{name:item.name,slot:4,star:0,maxProf:false}]})});const fc=page.locator('#hdFleetCalculator');await fc.locator('[data-hd-map-air-select="K"]').check();await fc.locator('[data-hd-map-air-confirm]').click();await expect(fc.locator('[data-hd-map-air-route-loss]')).toContainText('制空戦＋対空砲火');await expect(fc.locator('[data-hd-map-air-aa-step]')).toContainText('0〜4機減少');await expect(fc.locator('[data-hd-map-air-residual-slots]')).toContainText('0機になるモデル経路あり');await expect(fc.locator('[data-hd-map-air-route-loss]')).toContainText('登録30機種の射撃回避補正');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await page.reload();await page.waitForFunction(()=>typeof hdMapAirSelection==='function');expect(await page.evaluate(()=>hdMapAirSelection('3-5'))).toMatchObject({nodeIds:['K'],orderConfirmed:true});
});
