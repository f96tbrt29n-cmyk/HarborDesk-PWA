const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 45000 });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 45000 });
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-loadout-planner.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-suggester.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
}

test('all captured player equipment has usable performance in allocation and calculators', async ({page}) => {
 await boot(page);
 const r=await page.evaluate(()=>{
  const missing=[],wrong=[];
  for(const [name,meta] of Object.entries(window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment)){
   const item=hdFEFind(name),calc=hdFCFind(name);
   if(!item||!calc){missing.push(name);continue}
   for(const [field,value] of Object.entries(meta.stats))if((Number(item.stats[field])||0)!==value||(Number(calc.stats[field])||0)!==value)wrong.push(name+':'+field);
  }
  const before=HD_EQUIPMENT_CATALOG.length;hdEquipApplyMasterPerformance();
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'零式艦戦21型',count:1,star:0},{name:'12cm単装砲',count:1,star:0}]));
  return {missing,wrong,coverage:window.HD_EQUIPMENT_PERFORMANCE_COVERAGE,stable:before===HD_EQUIPMENT_CATALOG.length,fighter:hdFLInventory().get(hdFLInventoryStackKey('零式艦戦21型',0)).item,air:hdFCAirSlotPower({name:'零式艦戦21型',slot:18,star:0,maxProf:false}),unknown:hdFEFind('存在しない装備テスト'),note:hdFEFind('零式艦戦53型(岩本隊)').obtain};
 });
 expect(r.missing).toEqual([]);expect(r.wrong).toEqual([]);expect(r.coverage.registered).toBe(r.coverage.total);expect(r.coverage.total).toBeGreaterThan(500);expect(r.stable).toBe(true);
 expect(r.fighter).toMatchObject({category:'艦上戦闘機',stats:{対空:5}});expect(r.air).toBe(Math.floor(5*Math.sqrt(18)));expect(r.unknown).toBeNull();expect(r.note).toContain('任務');
 expect(await page.evaluate(()=>{const key=hdFLInventoryStackKey('零式艦戦21型',0),before=hdFLInventory().get(key).count,rows=JSON.parse(localStorage.getItem('harbordesk-equipment-v1'));rows[0].count=2;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(rows));return {before,after:hdFLInventory().get(key).count}})).toEqual({before:1,after:2});
 await page.evaluate(()=>{hdEnsureEquipmentCatalog();hdEquipCatalogFilter='すべて';document.getElementById('hdEquipCatalogSearch').value='';hdRenderEquipmentCatalog()});
 await expect(page.locator('#hdEquipCatalogList .hd-equip-ref-card')).toHaveCount(40);
 expect(await page.evaluate(()=>{const first=document.querySelector('#hdEquipCatalogList .hd-equip-ref-card');hdRenderEquipmentCatalog();hdEnsureEquipmentCatalog();return first===document.querySelector('#hdEquipCatalogList .hd-equip-ref-card')})).toBe(true);
 const first=await page.locator('#hdEquipCatalogList .hd-equip-ref-card').first().textContent();
 await page.evaluate(()=>document.querySelector('[data-hd-equip-page="1"]').click());
 expect(await page.locator('#hdEquipCatalogList .hd-equip-ref-card').first().textContent()).not.toBe(first);
 await page.evaluate(()=>{document.getElementById('hdEquipCatalogSearch').value='零式艦戦21型';hdRenderEquipmentCatalog()});
 await expect(page.locator('#hdEquipCatalogList')).toContainText('対空+5');
});

async function prepare32(page, sparse = false) {
  await page.evaluate(({ sparse }) => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'軽巡装備テスト', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'駆逐装備テスト'+(i+1), type:'駆逐艦', level:String(95-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify(sparse ? [
      { id:'g1', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:1, star:2, targetStar:10, assigned:'', memo:'' }
    ] : [
      { id:'g1', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:10, star:6, targetStar:10, assigned:'', memo:'' },
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'t1', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'b1', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' },
      { id:'f1', name:'61cm五連装(酸素)魚雷', category:'魚雷', count:4, star:3, targetStar:10, assigned:'', memo:'' }
    ]));
  }, { sparse });

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await expect(page.locator('#guide')).toBeVisible({ timeout: 15000 });
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await expect.poll(
    () => page.evaluate(() => typeof selectedMap !== 'undefined' ? selectedMap : ''),
    { timeout: 15000 }
  ).toBe('3-2');
  const open = page.locator('[data-hd-fs-open]');
  await expect(open).toBeVisible({ timeout: 15000 });
  await open.click();
  await expect(page.locator('#hdFleetSuggester')).toHaveCount(1);
  await expect.poll(
    () => page.evaluate(() => {
      const el=document.getElementById('hdFleetSuggester');
      return {
        section:window.hdWSState?.sections?.guide||'',
        visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
      };
    }),
    { timeout: 15000 }
  ).toEqual({ section:'hdFleetSuggester', visible:true });
}

test('automatic loadout never consumes more equipment than owned', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  const plan = await page.evaluate(() => window.hdFLGenerate?.(0));
  expect(plan).toBeTruthy();

  for (const [name, used] of Object.entries(plan.used)) {
    expect(used, `${name} usage exceeds inventory`).toBeLessThanOrEqual(plan.owned[name] || 0);
  }
  expect(Object.keys(plan.used).length).toBeGreaterThan(0);
  expect(plan.ships.filter(x => x.ship)).toHaveLength(6);
});

test('fleet suggester recovers after a late redraw and yields to newer guide navigation', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  // The old recovery window ended at 3.6s. Force a non-user redraw after that
  // point and verify the new 6.5s settle pass restores the fleet suggester.
  await page.waitForTimeout(4200);
  const before = await page.evaluate(() => {
    const epoch = Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH) || 0;
    const userEpoch = Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0;
    window.hdWSMarkDirectNavigation?.();
    window.hdWSApply?.('guide', 'guide', { ignorePin:true });
    const el=document.getElementById('hdFleetSuggester');
    return {
      epoch,
      userEpoch,
      directEpoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,
      section:window.hdWSState?.sections?.guide||'',
      visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
    };
  });

  expect(before.section).toBe('guide');
  expect(before.visible).toBe(false);

  await expect.poll(
    () => page.evaluate(() => {
      const el=document.getElementById('hdFleetSuggester');
      return {
        section:window.hdWSState?.sections?.guide||'',
        visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
      };
    }),
    { timeout: 5000 }
  ).toEqual({ section:'hdFleetSuggester', visible:true });

  // A later explicit move inside the same guide workspace must cancel the
  // remaining 9.5s / 13.5s recovery passes instead of reopening the suggester.
  const explicit = await page.evaluate(() => {
    const recoveredEpoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0;
    const recoveredUserEpoch=Number(window.__HD_WORKSPACE_USER_NAV_EPOCH)||0;
    window.hdWSMarkUserNavigation?.();
    window.hdWSShowElement?.('guide', false);
    return {
      recoveredEpoch,
      recoveredUserEpoch,
      epoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,
      userEpoch:Number(window.__HD_WORKSPACE_USER_NAV_EPOCH)||0,
      section:window.hdWSState?.sections?.guide||''
    };
  });
  expect(explicit.epoch).toBeGreaterThan(explicit.recoveredEpoch);
  expect(explicit.userEpoch).toBeGreaterThan(explicit.recoveredUserEpoch);
  expect(explicit.section).toBe('guide');

  await page.waitForTimeout(3600);
  const after = await page.evaluate(() => {
    const el=document.getElementById('hdFleetSuggester');
    return {
      epoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,
      section:window.hdWSState?.sections?.guide||'',
      visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
    };
  });
  expect(after.epoch).toBe(explicit.epoch);
  expect(after.section).toBe('guide');
  expect(after.visible).toBe(false);
});

test('generated loadout can be saved into the custom fleet gear fields', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await page.waitForTimeout(650);
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await expect(card.locator('.hd-fl-usage')).toContainText('所持');

  await card.locator('[data-hd-fl-save="0"]').click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].name).toContain('自動提案＋装備');
  expect(saved['3-2'][0].ships.filter(x => x.ship && x.gear).length).toBeGreaterThan(0);

  const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1') || '{}'));
  expect(selected['3-2']).toBe(saved['3-2'][0].id);
});

test('sparse inventory is shown as unfilled loadout slots instead of invented gear', async ({ page }) => {
  await boot(page);
  await prepare32(page, true);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  const plan = card.locator('.hd-fl-plan');
  await expect(plan).toBeVisible();
  await expect(plan).toContainText('未配備');

  const data = await page.evaluate(() => window.hdFLGenerate?.(0));
  expect(data.missing.length).toBeGreaterThan(0);
  for (const [name, used] of Object.entries(data.used)) {
    expect(used).toBeLessThanOrEqual(data.owned[name] || 0);
  }
});

test('generated loadout survives fleet rerender after ship images become ready', async ({ page }) => {
  await boot(page);
  await prepare32(page, true);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await expect(card.locator('.hd-fl-plan')).toContainText('未配備');

  await page.evaluate(() => window.dispatchEvent(new Event('hd:ship-images-ready')));

  await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-plan')).toBeVisible();
  await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-plan')).toContainText('未配備');
});

test('automatic expansion allocation requires an unlocked synced slot for the individual ship', async ({ page }) => {
  await boot(page);
  await page.waitForFunction(() => typeof hdOCBuild === 'function' && typeof hdKcMergeRoster === 'function');
  const result = await page.evaluate(() => {
    const rows = [0, null, undefined, '', 'invalid', -1, 123].map((ex, i) => ({
      name: '夕立改二', masterId: 144, gameShipId: 8100 + i, gameSlotEx: ex, gear: '', type: '駆逐艦', level: 99
    }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([{name:'Bofors 40mm四連装機関砲',count:50,star:0}]));
    const suggestion = {needs:[],slots:rows.map(row => ({profile:{row,type:row.type,roles:[]}}))};
    const oldMap=hdFSMap,oldPlans=hdFSPlans;
    hdFSMap=()=> '1-1';hdFSPlans=()=> [suggestion];
    const plan=hdFLGenerate(0);
    const html=hdFLPlanHtml(plan);
    hdFSMap=oldMap;hdFSPlans=oldPlans;
    const build = hdOCBuild({map:'1-1',preset:null,fleet:{ships:rows.map(row => ({ship:row.name,masterId:row.masterId,gameShipId:row.gameShipId,gear:'[増設] Bofors 40mm四連装機関砲'}))}});
    const db=hdFEFindShip('夕立改二');
    const ledgerExpansion=[0,-1].map(gameSlotEx=>{
      localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{...rows[0],gameSlotEx}]));
      return !!hdShipDbResolveOwnedLoadout(db,{gear:[]}).expansion;
    });
    localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));
    const ambiguousExpansion=!!hdOCBuild({map:'1-1',preset:null,fleet:{ships:[{ship:'夕立改二',gear:'[増設] Bofors 40mm四連装機関砲'}]}}).plan.ships[0].expansion;
    localStorage.setItem('harbordesk-equipment-v1','[]');
    hdFSMap=()=> '1-1';hdFSPlans=()=> [suggestion];
    const empty=hdFLGenerate(0);
    hdFSMap=oldMap;hdFSPlans=oldPlans;
    hdKcMergeRoster({ships:new Map([[9999,{api_id:9999,api_ship_id:144,api_lv:99,api_slot:[]}]]),slotItems:new Map()});
    const imported=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));
    // Exercise the actual sync API values, rather than inventing roster flags.
    const apiValues=[0,-1,123];
    hdKcMergeRoster({ships:new Map(apiValues.map((api_slot_ex,i)=>[9900+i,{api_id:9900+i,api_ship_id:144,api_lv:99,api_slot:[],api_slot_ex}])),slotItems:new Map()});
    const synced=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));
    const importedStates=apiValues.map((_,i)=>hdFLHasExpansion(synced.find(s=>s.gameShipId===9900+i)));
    const invalidStates=[-2,0,false,null,undefined,'','invalid',1.5].map(gameSlotEx=>hdFLHasExpansion({gameSlotEx}));
    return {
      expansion:plan.ships.map(s=>!!s.expansion),
      missing:empty.ships.map(s=>!!s.expansionMissing),
      normalCounts:plan.ships.map(s=>s.items.length),
      used:plan.used['Bofors 40mm四連装機関砲'],
      normalUsed:plan.ships.reduce((n,s)=>n+s.items.length,0),
      htmlCandidates:(html.match(/<i>増設候補<\/i>/g)||[]).length,
      searchExpansionSlots:build.slots.filter(s=>s.expansion).map(s=>s.si),
      savedExpansion:build.plan.ships.map(s=>!!s.expansion),
      ledgerExpansion,ambiguousExpansion,importedStates,invalidStates,
      importedUnknown:imported.find(s=>s.gameShipId===9999)?.gameSlotEx
    };
  });
  expect(result.expansion).toEqual([false,false,false,false,false,true,true]);
  expect(result.missing).toEqual([false,false,false,false,false,true,true]);
  expect(result.normalCounts.every(n=>n>0)).toBe(true);
  expect(result.used).toBe(result.normalUsed+2);
  expect(result.htmlCandidates).toBe(2);
  expect(result.searchExpansionSlots).toEqual([5,6]);
  expect(result.savedExpansion).toEqual([false,false,false,false,false,true,true]);
  expect(result.ledgerExpansion).toEqual([false,true]);
  expect(result.ambiguousExpansion).toBe(false);
  expect(result.importedUnknown).toBeNull();
  expect(result.importedStates).toEqual([false,true,true]);
  expect(result.invalidStates).toEqual([false,false,false,false,false,false,false,false]);
});

async function prepareQuickRequirements(page,inventory){
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(inventory=>{
  const names=['阿武隈改二','夕立改二','時雨改二','秋月改','雪風改','暁改二'];
  const rows=names.map((name,i)=>({id:'quick-'+i,name,gameShipId:7000+i,gameSlotEx:0,masterId:hdFEFindShip(name).id,type:hdFEFindShip(name).type,level:99,gear:''}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));
  selectedMap='1-6';hdWSShowElement('guide',false);renderMapPicker();hdFSOpen();hdFSRender();
 },inventory);
 await page.evaluate(()=>hdFLRender(0,document.querySelector('.hd-fs-card')));
 await page.waitForFunction(()=>HD_FL_CACHE['1-6:0']&&!HD_FL_CACHE['1-6:0'].searching);
}

test('quick automatic allocation outfits ASW and cutin sets and saves the assessed equipment',async({page})=>{
 await prepareQuickRequirements(page,[{name:'10cm連装高角砲＋高射装置',count:1},{name:'13号対空電探改',count:1},{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1}]);
 const data=await page.evaluate(()=>{const plan=HD_FL_CACHE['1-6:0'];return {optimized:plan.optimized,goals:plan.assessment.measure.goals.map(g=>({kind:g.kind,ok:g.ok})),invalid:hdFEMasterValidation(plan).invalid,usage:plan.used,expanded:plan.ships.some(s=>s.expansion),saved:hdFLSave(0)}});
 expect(data.goals.find(g=>g.kind==='cap-asw').ok).toBe(true);expect(data.goals.find(g=>g.kind==='cap-aa').ok).toBe(true);expect(data.goals.some(g=>g.kind==='air-value')).toBe(false);
 expect(data.invalid).toEqual([]);expect(data.expanded).toBe(false);expect(Object.values(data.usage).every(n=>n<=1)).toBe(true);
 expect(data.saved.ships.some(s=>s.gear.includes('三式水中探信儀')&&s.gear.includes('三式爆雷投射機'))).toBe(true);
 const calculator=await page.evaluate(()=>{const plan=HD_FL_CACHE['1-6:0'],c=hdFLContext(plan),ok=hdFLCalculator(0),state=hdFCState(c.map,`owned:${c.fleet.id}:${c.index}`);return {ok,proposalHtml:hdFCProposalHtml(state),names:state.gear.map(x=>x.name),count:plan.ships.reduce((n,s)=>n+s.items.length+(s.expansion?1:0),0)}});expect(calculator.ok).toBe(true);expect(calculator.proposalHtml).not.toContain('最新の条件で再探索');expect(calculator.names).toContain('三式爆雷投射機');expect(calculator.names.length).toBe(calculator.count);
 await page.evaluate(()=>hdFSOpen());
 await expect(page.locator('.hd-fs-card').first().locator('[data-hd-fl-goal="cap-asw"]')).toContainText('充足');
 await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-checks')).toContainText('制空優勢は必須ではありません');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('quick automatic allocation explains an unavailable ASW component and unconfirmed data',async({page})=>{
 await prepareQuickRequirements(page,[{name:'三式水中探信儀',count:1}]);
 const check=page.locator('.hd-fs-card').first().locator('[data-hd-fl-goal="cap-asw"]');
 await expect(check).toContainText('不足');await expect(check).toContainText('三式爆雷投射機');await expect(check).toContainText('所持 0/1');
 const plan=await page.evaluate(()=>HD_FL_CACHE['1-6:0']);expect(plan.assessment.measure.complete).toBe(false);expect(plan.ships.flatMap(s=>s.items).some(x=>x.name==='三式爆雷投射機')).toBe(false);
});

test('quick numeric remedies calculate real slot improvements without allocating unowned equipment',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'零式艦戦21型',count:1}]));
  const db=hdFEFindShip('赤城改'),profile=hdShipDbSlotProfile(db),plan={map:'2-1',ships:[{ship:'赤城改',masterId:db.id,items:[{name:'零式艦戦21型',slotIndex:0,capacity:profile.slots[0]}],expansion:null}],suggestion:{slots:[]}};
  const count=hdFEAir(hdFEAssigned(plan)).basePower,goal={kind:'air-value',count,minCount:count+100};
  const options=hdFLNumericRemedies(plan,goal),before=JSON.stringify(plan.ships);
  for(const option of options){const trial=structuredClone(plan);trial.ships[0].items=trial.ships[0].items.filter(x=>x.slotIndex!==option.slot-1);trial.ships[0].items.push({name:option.name,star:option.star,slotIndex:option.slot-1,capacity:profile.slots[option.slot-1]});option.actual=hdFEAir(hdFEAssigned(trial)).basePower;}
  return {options,unchanged:before===JSON.stringify(plan.ships),count};
 });
 expect(r.options.length).toBeGreaterThan(0);expect(r.unchanged).toBe(true);for(const x of r.options){expect(x.value).toBe(x.actual);expect(x.value).toBeGreaterThan(r.count);expect(x.gain).toBe(x.value-r.count)}
 expect(r.options.some(x=>x.owned===0&&!x.available)).toBe(true);
});

test('quick allocation discards an in-flight result when synced inventory changes',async({page})=>{
 await prepareQuickRequirements(page,[{name:'三式水中探信儀',count:1}]);
 await page.evaluate(()=>{
  hdFLRender(0,document.querySelector('.hd-fs-card'));
  localStorage.setItem('harbordesk-equipment-v1','[]');window.dispatchEvent(new Event('hd:equipment-changed'));
 });
 await expect.poll(()=>page.evaluate(()=>HD_FL_CACHE['1-6:0']||null)).toBeNull();
 await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-host')).toContainText('再配備して確認');
});

test('quick scouting remedies show computed gains and distinguish missing sync data',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{safe:45,failBelow:10}]}};
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,gameLos:36}]));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'33号水上電探',count:1}]));
  const db=hdFEFindShip('夕立改二'),plan={map:'1-1',index:0,ships:[{ship:'夕立改二',gameShipId:71,masterId:db.id,master:true,type:db.type,items:[],missing:[],expansion:null}],used:{},owned:{},missing:[],suggestion:{slots:[]}};
  hdFLUpdateAssessment(plan,true);const options=plan.numericRemedies['los-value'],html=hdFLAssessmentHtml(plan);
  for(const x of options){const trial=structuredClone(plan);trial.ships[0].items.push({name:x.name,star:x.star,slotIndex:x.slot-1,capacity:0});x.actual=hdFEScouting(trial,hdFEAssigned(trial)).score;}
  localStorage.removeItem('harbordesk-kancolle-sync-v1');hdFLUpdateAssessment(plan,true);
  return {options,html,unknownHtml:hdFLAssessmentHtml(plan),unknownGoals:plan.assessment.measure.goals.map(g=>g.kind)};
 });
 expect(r.options.some(x=>x.name==='33号水上電探'&&x.available)).toBe(true);for(const x of r.options)expect(x.value).toBeCloseTo(x.actual,6);
 expect(r.html).toContain('33式索敵');expect(r.html).toContain('目安まであと');expect(r.unknownGoals).not.toContain('los-value');expect(r.unknownHtml).toContain('司令部Lv');
});

test('quick assessment subtracts synced current equipment LOS and matches the imported calculator',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{safe:45,failBelow:10}]}};
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));
  const radar=hdFEFind('33号水上電探'),base=36;
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,gameLos:base+radar.stats.索敵,gameGearSlots:['33号水上電探']} ]));
  const db=hdFEFindShip('夕立改二'),plan={map:'1-1',index:0,ships:[{ship:'夕立改二',gameShipId:71,masterId:db.id,master:true,type:db.type,items:[{name:radar.name,slotIndex:0,capacity:0}],missing:[],expansion:null}],used:{},owned:{},missing:[],suggestion:{slots:[]}};
  hdFLUpdateAssessment(plan);HD_FL_CACHE['1-1:0']=plan;const c=hdFLContext(plan);
  hdFCImportOwnedPlan(c,{plan,signature:hdOCSignature(c)});const state=hdFCState(c.map,`owned:${c.fleet.id}:${c.index}`),assessment=hdFEScouting(plan,hdFEAssigned(plan));
  const expected=Math.sqrt(base)+radar.stats.索敵*hdFEEquipCoef(radar)*3-Math.ceil(100*.4)+2*5;
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,gameLos:44,gameGearSlots:['未登録の索敵装備']} ]));
  return {score:assessment.score,expected,calculator:hdFCLOS(state).score,unknown:hdFEScouting(plan,hdFEAssigned(plan)).available};
 });
 expect(r.score).toBeCloseTo(r.expected,6);expect(r.score).toBeCloseTo(r.calculator,6);expect(r.unknown).toBe(false);
});

test('numeric remedies retain a weaker owned radar when stronger equipment cannot fit the ship',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{safe:45,failBelow:10}]}};
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,gameLos:36}]));
  const names=['紫雲','零式水上観測機','零式水上偵察機','彩雲','二式艦上偵察機','22号対水上電探'];
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(names.map(name=>({name,count:1}))));
  const db=hdFEFindShip('夕立改二'),plan={map:'1-1',ships:[{ship:'夕立改二',gameShipId:71,masterId:db.id,items:[],expansion:null}],suggestion:{slots:[]}};
  hdFLUpdateAssessment(plan,true);
  const goal=plan.assessment.measure.goals.find(g=>g.kind==='los-value'),options=plan.numericRemedies['los-value'];
  return {options,html:hdFLAssessmentHtml(plan),above:names.slice(0,5).map(n=>hdOCScore('索敵',hdFEFind(n))),radarScore:hdOCScore('索敵',hdFEFind(names[5])),compatible:options.map(x=>hdShipDbEquipCompatible(hdFEFind(x.name),db)),gap:goal.minCount-goal.count};
 });
 expect(r.above.every(x=>x>r.radarScore)).toBe(true);
 expect(r.options.find(x=>x.name==='22号対水上電探')).toMatchObject({available:true,owned:1,free:1});
 expect(r.compatible.every(Boolean)).toBe(true);expect(r.html).toContain('手持ちで補える交換');expect(r.html).toContain('入手して補う候補');expect(r.html).toContain('所持 1個・この配備案で未使用 1個');expect(r.gap).toBeGreaterThan(0);
});

test('numeric remedies preserve the ASW set and distinguish gear already consumed by this plan',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  HD_MAP_ADVANCED_DATA['1-1']={los:{coef:3,checks:[{safe:45,failBelow:10}]}};
  localStorage.setItem('harbordesk-kancolle-sync-v1',JSON.stringify({admiralLevel:100}));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,gameLos:36}]));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1},{name:'22号対水上電探',count:1},{name:'33号水上電探',count:1}]));
  const db=hdFEFindShip('夕立改二'),plan={map:'1-1',ships:[{ship:'夕立改二',gameShipId:71,masterId:db.id,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'三式爆雷投射機',slotIndex:1,capacity:0},{name:'22号対水上電探',slotIndex:2,capacity:0}],expansion:null}],suggestion:{slots:[]}};
  const req=[{kind:'cap-asw',label:'対潜セット',minCount:1}],before=hdOCMeasure(plan,req),goal=before.goals.find(g=>g.kind==='los-value');
  plan.assessment={requirements:req,measure:before};const unchanged=JSON.stringify(plan),options=hdFLNumericRemedies(plan,goal),html=hdFLRemediesHtml(goal,options);
  return {options,html,unchanged:unchanged===JSON.stringify(plan),aswReady:before.goals.find(g=>g.kind==='cap-asw').ok};
 });
 expect(r.aswReady).toBe(true);expect(r.unchanged).toBe(true);
 expect(r.options.find(x=>x.name==='33号水上電探')).toMatchObject({available:true,slot:3,old:'22号対水上電探',tradeoffs:[]});
 expect(r.options.find(x=>x.name==='22号対水上電探')).toMatchObject({available:false,owned:1,free:0});
 expect(r.html).toContain('所持しているがこの配備案で使用中');expect(r.html).toContain('転用元の装備条件も見直して');
});

test('numeric remedies do not claim route readiness when a replacement only reaches starting air',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  HD_MAP_AIR_DATA['99-2']={source:'fixture',nodes:Object.fromEntries(['A','B'].map(id=>[id,{label:id+'：通常戦',patterns:[{enemy:'空母ヲ級',air:40}]}]))};
  hdMapAirSave('99-2','A',true);hdMapAirSave('99-2','B',true);hdMapAirConfirmOrder('99-2');
  const db=hdFEFindShip('加賀改');
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'加賀改',gameShipId:71,gameOnslot:[0,0,46,0]}]));
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'零式艦戦52型(熟練)',count:1}]));
  const plan={map:'99-2',ships:[{ship:'加賀改',gameShipId:71,masterId:db.id,items:[{name:'零式艦戦21型',slotIndex:2,capacity:46}],expansion:null}],suggestion:{slots:[]}};
  hdFLUpdateAssessment(plan,true);const goal=plan.assessment.measure.goals.find(g=>g.kind==='air-value'),options=plan.numericRemedies['air-value'];
  return {goal,options,html:hdFLRemediesHtml(goal,options),unresolved:hdFLNumericRemedies(plan,{...goal,unresolved:true})};
 });
 const candidate=r.options.find(x=>x.name==='零式艦戦52型(熟練)');
 expect(candidate).toMatchObject({available:true,slot:3,remaining:0,targetReady:false});
 expect(candidate.value).toBeGreaterThanOrEqual(r.goal.minCount);
 expect(r.html).toContain('連戦損耗などの判定は未充足・要確認');expect(r.unresolved).toEqual([]);
});

async function prepareRemedyProcurement(page){
 await boot(page);await page.waitForFunction(()=>typeof hdPLAddRemedyRequirement==='function');
 await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1}]));
  const plan={map:'1-6',index:0,ships:[{ship:'夕立改二',items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'三式爆雷投射機',slotIndex:1,capacity:0}],expansion:null,master:true},{ship:'時雨改二',items:[],expansion:null,master:true}],suggestion:{slots:[]}};
  hdFSMap=()=> '1-6';hdFLRequirements=()=>[{kind:'cap-asw',label:'対潜シナジー',minCount:2}];HD_FL_CACHE['1-6:0']=plan;hdFLUpdateAssessment(plan,true);
  const goal=plan.assessment.measure.goals.find(g=>g.kind==='cap-asw'),option=plan.setRemedies['cap-asw'].find(x=>!x.available);window.hdProcureFixture={key:hdFLGoalKey(goal),identity:hdFLRemedyIdentity(option)};
  const host=document.createElement('section');host.id='remedy-procurement-test';host.innerHTML=hdFLSetRemediesHtml(goal,[option],plan);document.body.appendChild(host);
 });
}
test('set remedy procurement preserves total demand without duplicating clicks and survives reload',async({page})=>{
 await prepareRemedyProcurement(page);
 await page.locator('#remedy-procurement-test [data-hd-fl-procure-set]').click();
 await expect(page.locator('#hdEquipmentProcurement')).toBeVisible();
 const result=await page.evaluate(()=>{const again=hdFLProcureSet('1-6',0,hdProcureFixture.key,hdProcureFixture.identity),items=hdPLLoad().find(x=>x.map==='1-6').gearItems;return {again,items:items.length,demands:hdPLDemandRows(items).map(x=>({target:x.target,needed:x.needed,shortfall:x.shortfall})),inventory:hdPLOwnedCount('三式水中探信儀')}});
 expect(result.again).toBe(true);expect(result.items).toBe(2);expect(result.inventory).toBe(1);expect(result.demands).toEqual(expect.arrayContaining([{target:'三式水中探信儀',needed:2,shortfall:1},{target:'三式爆雷投射機',needed:2,shortfall:1}]));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof hdPLDemandRows==='function');
 expect(await page.evaluate(()=>hdPLLoad().find(x=>x.map==='1-6').gearItems.length)).toBe(2);
 await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:2},{name:'三式爆雷投射機',count:2}]));hdPLRender()});
 expect(await page.evaluate(()=>hdPLDemandRows(hdPLLoad().find(x=>x.map==='1-6').gearItems).every(x=>x.shortfall===0))).toBe(true);
});
test('set remedy procurement rejects stale alternatives when owned stock has changed',async({page})=>{
 await prepareRemedyProcurement(page);
 const result=await page.evaluate(()=>{localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:2},{name:'三式爆雷投射機',count:2}]));return {saved:hdFLProcureSet('1-6',0,hdProcureFixture.key,hdProcureFixture.identity),rows:hdPLLoad()}});
 expect(result).toEqual({saved:false,rows:[]});
});

test('ASW set remedies specify compatible slots while preserving a ready radar condition',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1},{name:'10cm連装高角砲',count:1},{name:'22号対水上電探',count:1}]));
  // This fixture tests ASW equipment synergy and radar preservation, not opening ASW.
  const db=hdFEFindShip('夕立改二'),plan={map:'1-6',openingAswCount:0,ships:[{ship:'夕立改二',masterId:db.id,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'10cm連装高角砲',slotIndex:1,capacity:0},{name:'22号対水上電探',slotIndex:2,capacity:0}],expansion:null}],suggestion:{slots:[]}};
  const requirements=[{kind:'cap-asw',label:'対潜シナジー',minCount:1},{kind:'電探',label:'電探',minCount:1}],measure=hdOCMeasure(plan,requirements),goal=measure.goals.find(g=>g.kind==='cap-asw');
  plan.assessment={requirements,measure};const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,goal),best=options.find(x=>x.available);
  const trial=structuredClone(plan);for(const change of best.changes){trial.ships[0].items=trial.ships[0].items.filter(x=>x.slotIndex!==change.slot-1);trial.ships[0].items.push({name:change.name,star:change.star,slotIndex:change.slot-1,capacity:0})}
  return {options,unchanged:original===JSON.stringify(plan),after:hdOCMeasure(trial,requirements).goals,usage:hdFOAssignedUsage(trial),compatible:best.changes.every(x=>hdShipDbEquipCompatible(hdFEFind(x.name),db)),html:hdFLSetRemediesHtml(goal,options)};
 });
 expect(r.unchanged).toBe(true);expect(r.compatible).toBe(true);expect(r.after.every(g=>g.ok)).toBe(true);
 expect(r.options.find(x=>x.available)).toMatchObject({ship:'夕立改二',changes:[{slot:2,old:'10cm連装高角砲',name:'三式爆雷投射機'}],tradeoffs:[],count:1,targetReady:true});
 expect(Object.values(r.usage).every(n=>n===1)).toBe(true);expect(r.html).toContain('手持ちでセットを完成できる交換');expect(r.html).toContain('第2：10cm連装高角砲 → 三式爆雷投射機');
});

test('set remedies do not reuse an ASW set already assigned to another ship',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1}]));
  const plan={map:'1-6',ships:[{ship:'夕立改二',items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'三式爆雷投射機',slotIndex:1,capacity:0}],expansion:null},{ship:'時雨改二',items:[],expansion:null}],suggestion:{slots:[]}},requirements=[{kind:'cap-asw',label:'対潜シナジー',minCount:2}],measure=hdOCMeasure(plan,requirements),goal=measure.goals[0];
  plan.assessment={requirements,measure};const options=hdFLSetRemedies(plan,goal);
  return {before:goal.count,options,html:hdFLSetRemediesHtml(goal,options)};
 });
 expect(r.before).toBe(1);expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available&&x.ship==='時雨改二')).toBe(true);
 expect(r.options[0].missing).toEqual(expect.arrayContaining([{name:'三式水中探信儀',star:0,need:1,owned:1},{name:'三式爆雷投射機',star:0,need:1,owned:1}]));
 expect(r.html).toContain('不足分の補充が必要なセット');expect(r.html).toContain('追加で1個必要');expect(r.html).not.toContain('手持ちでセットを完成できる交換');expect(r.html).toContain('転用元の条件も確認');
});

test('AA set remedies respect ship restrictions repeated parts and unexpanded normal slots',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'10cm連装高角砲',count:2},{name:'22号対水上電探',count:1}]));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'秋月改',gameSlotEx:0},{name:'夕立改二',gameSlotEx:0}]));
  const plan={map:'1-6',ships:['夕立改二','秋月改'].map(ship=>({ship,items:[],expansion:null})),suggestion:{slots:[]}},requirements=[{kind:'cap-aa',label:'対空カットイン',minCount:1}],measure=hdOCMeasure(plan,requirements),goal=measure.goals[0];plan.assessment={requirements,measure};
  const options=hdFLSetRemedies(plan,goal),available=options.filter(x=>x.available);
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'10cm連装高角砲',count:1},{name:'22号対水上電探',count:1}]));
  const scarce=hdFLSetRemedies(plan,goal);return {available,scarce,expansions:plan.ships.map(x=>x.expansion),html:hdFLSetRemediesHtml(goal,options)};
 });
 expect(r.available.length).toBeGreaterThan(0);expect(r.available.every(x=>x.ship==='秋月改'&&x.targetReady)).toBe(true);
 for(const x of r.available){expect(x.changes.filter(c=>c.name==='10cm連装高角砲')).toHaveLength(2);expect(new Set(x.changes.map(c=>c.slot)).size).toBe(x.changes.length);expect(x.changes.every(c=>c.slot>=1&&c.slot<=3)).toBe(true)}
 expect(r.scarce.every(x=>!x.available)).toBe(true);expect(r.expansions).toEqual([null,null]);
 await page.evaluate(html=>{const host=document.createElement('section');host.style.width='100%';host.innerHTML=html;document.body.replaceChildren(host)},r.html);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('set remedies warn when AA equipment competes with a ready ASW set',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'三式爆雷投射機',count:1},{name:'10cm連装高角砲＋高射装置',count:1},{name:'13号対空電探改',count:1}]));
  const plan={map:'1-6',ships:[{ship:'夕立改二',items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'三式爆雷投射機',slotIndex:1,capacity:0},{name:'10cm連装高角砲＋高射装置',slotIndex:2,capacity:0}],expansion:null}],suggestion:{slots:[]}},requirements=[{kind:'cap-aa',label:'対空カットイン',minCount:1},{kind:'cap-asw',label:'対潜シナジー',minCount:1}],measure=hdOCMeasure(plan,requirements);plan.assessment={requirements,measure};
  const goal=measure.goals.find(g=>g.kind==='cap-aa'),options=hdFLSetRemedies(plan,goal);return {readyAsw:measure.goals.find(g=>g.kind==='cap-asw').ok,options,html:hdFLSetRemediesHtml(goal,options)};
 });
 expect(r.readyAsw).toBe(true);expect(r.options.some(x=>x.available)).toBe(true);expect(r.options.filter(x=>x.available).every(x=>x.tradeoffs.includes('対潜シナジー'))).toBe(true);
 expect(r.html).toContain('ただし 対潜シナジー が不足します。');expect(r.html).not.toContain('現在充足している装備条件を維持する候補です。');
});

test('opening ASW distinguishes threshold boundaries automatic ships and carrier conditions',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFEOpeningAsw==='function');
 const r=await page.evaluate(()=>{
  const check=(name,value,names)=>{const db=hdFEFindShip(name),profile=hdShipDbSlotProfile(db),ship={ship:name,gameShipId:71,masterId:hdShipDbMasterRowFor(db).id,items:names.map((name,slotIndex)=>({name,slotIndex,capacity:profile.slots[slotIndex]})),expansion:null};localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name,gameShipId:71,masterId:ship.masterId,gameAsw:value,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile.count},(_,i)=>names[i]||''),gameGearExpansion:''}]));return hdFEOpeningAsw(ship)};
  return {dd99:check('夕立改二',99,['三式水中探信儀']),dd100:check('夕立改二',100,['三式水中探信儀']),noSonar:check('夕立改二',100,['三式爆雷投射機']),de59:check('占守改',59,['三式水中探信儀']),de60:check('占守改',60,['三式水中探信儀']),de74:check('占守改',74,['九五式爆雷']),de75:check('占守改',75,['九五式爆雷']),deWeak:check('占守改',75,['12cm単装高角砲E型']),auto:check('五十鈴改二',null,[]),beforeRemodel:check('五十鈴改',null,[]),cvl64:check('瑞鳳改二乙',64,['九七式艦攻(九三一空)']),cvl65:check('瑞鳳改二乙',65,['九七式艦攻(九三一空)']),cvlLowPlane:check('瑞鳳改二乙',65,['九七式艦攻']),hyugaBad:check('日向改二',100,['零式水中聴音機']),hyuga:check('日向改二',null,['S-51J']),kagaBad:check('加賀改二護',null,[]),kaga:check('加賀改二護',null,['九七式艦攻'])};
 });
 for(const key of ['dd99','noSonar','de59','de74','deWeak','beforeRemodel','cvl64','cvlLowPlane','hyugaBad','kagaBad'])expect(r[key].status,key).toBe('missing');
 for(const key of ['dd100','de60','de75','auto','cvl65','hyuga','kaga'])expect(r[key].status,key).toBe('ready');
 expect(r.dd99).toMatchObject({value:99,threshold:100,source:'同じ装備での同期値'});expect(r.dd99.reason).toContain('あと1');
});

test('opening ASW manual game values expire after gear or sync changes and never borrow a duplicate ship stat',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const db=hdFEFindShip('夕立改二'),profile=hdShipDbSlotProfile(db),ship={ship:'夕立改二',gameShipId:71,masterId:hdShipDbMasterRowFor(db).id,type:'駆逐艦',master:true,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0},{name:'三式爆雷投射機',slotIndex:1,capacity:0}],missing:[],expansion:null};
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,gameShipId:71,masterId:ship.masterId,level:90,syncedAt:1,gameAsw:100,gameAswGearKnown:true,gameGearSlots:Array.from({length:profile.count},(_,i)=>i===0?'三式水中探信儀':''),gameGearExpansion:''}]));
  const plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]},missing:[],used:{},owned:{}};hdFLUpdateAssessment(plan);HD_FL_CACHE['1-1:0']=plan;
  const host=document.createElement('section');host.id='oasw-test';host.innerHTML=hdFLPlanHtml(plan);document.body.appendChild(host);
 });
 const check=page.locator('#oasw-test .hd-fl-oasw');await expect(check).toContainText('先制対潜：未判定');
 const input=check.locator('input');await input.fill('99');await input.press('Tab');await expect(check).toContainText('先制対潜：不可');await expect(check).toContainText('あと1');
 await check.locator('input').fill('100');await check.locator('input').press('Tab');await expect(check).toContainText('先制対潜：可能');
 await page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];p.ships[0].items.push({name:'10cm連装高角砲',slotIndex:2,capacity:0});document.getElementById('oasw-test').innerHTML=hdFLPlanHtml(p)});
 await expect(check).toContainText('先制対潜：未判定');
 const r=await page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'],s=p.ships[0],key=hdFEAswKey(s,'scope'),confirmed=hdFEAswConfirmed();confirmed[key]=100;localStorage.setItem(HD_FE_OASW_CONFIRM_KEY,JSON.stringify(confirmed));const before=hdFEOpeningAsw(s,'scope');const rows=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));rows[0].syncedAt=2;localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(rows));const after=hdFEOpeningAsw(s,'scope');localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([rows[0],{...rows[0],gameShipId:72}]));const ambiguous=hdFEOpeningAsw({...s,gameShipId:0},'another');window.dispatchEvent(new Event('hd:kancolle-sync'));return {before:before.status,after:after.status,ambiguous:ambiguous.status}});
 expect(r).toEqual({before:'ready',after:'manual',ambiguous:'manual'});await expect(check).toContainText('再配備して確認');await expect(check.locator('input')).toHaveCount(0);
});

test('opening ASW sync captures exact displayed stats and rejects incomplete gear information',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdKcMergeRoster==='function');
 const r=await page.evaluate(()=>{
  const parsed=hdKcImportEmpty(),db=hdFEFindShip('夕立改二'),id=hdShipDbMasterRowFor(db).id,equipId=[...hdKcMasterEquipMap()].find(([id,x])=>x.name==='三式水中探信儀')[0];
  parsed.ships.set(71,{api_id:71,api_ship_id:id,api_lv:90,api_slot:[10,-1,-1],api_slot_ex:0,api_taisen:[100,130]});parsed.slotItems.set(10,{api_id:10,api_slotitem_id:equipId});
  hdKcMergeRoster(parsed);const complete=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'))[0];parsed.slotItems.clear();hdKcMergeRoster(parsed);const partial=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'))[0];parsed.ships.get(71).api_taisen=null;hdKcMergeRoster(parsed);const absent=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'))[0];
  const ship=parsed.ships.get(71);ship.api_slot=[-1,-1,-1];ship.api_taisen=[100,130];hdKcMergeRoster(parsed);const empty=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'))[0];
  return {complete:{value:complete.gameAsw,known:complete.gameAswGearKnown},partial:{value:partial.gameAsw,known:partial.gameAswGearKnown},absent:absent.gameAsw,empty:{slots:empty.gameGearSlots,known:empty.gameAswGearKnown},invalid:hdKcStatValue(['',100]),zero:hdKcStatValue([0,100])};
 });
 expect(r).toEqual({complete:{value:100,known:true},partial:{value:100,known:false},absent:null,empty:{slots:['','',''],known:true},invalid:null,zero:0});
});
test('opening ASW remedies show unused stock without guessing the changed display value',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'三式水中探信儀',count:1},{name:'四式水中聴音機',count:1,star:3}]));
  const db=hdFEFindShip('夕立改二'),ship={ship:'夕立改二',gameShipId:71,masterId:hdShipDbMasterRowFor(db).id,items:[{name:'三式水中探信儀',slotIndex:0,capacity:0}],expansion:null};
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,gameShipId:71,masterId:ship.masterId,syncedAt:1,gameAsw:99,gameAswGearKnown:true,gameGearSlots:['三式水中探信儀','',''],gameGearExpansion:'',gameSlotEx:0}]));
  const plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}},original=JSON.stringify(plan),options=hdFLOaswRemedies(plan,0),candidate=options.find(x=>x.available);
  return {candidate,unchanged:original===JSON.stringify(plan),html:hdFLOaswHtml(plan,0)};
 });
 expect(r.unchanged).toBe(true);expect(r.candidate).toMatchObject({available:true,state:{status:'manual',needsValue:true,threshold:100},changes:[{name:'四式水中聴音機',star:3,owned:1,free:1}]});
 expect(r.html).toContain('先制対潜を補う装備候補');expect(r.html).toContain('ゲームの表示対潜値ではありません');expect(r.html).toContain('再同期・入力');
 expect(r.candidate.changes.every(x=>x.slot>=1&&x.slot<=3)).toBe(true);
});

test('opening ASW remedies count allocated stock and refresh when the inventory changes',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const name='四式水中聴音機',inventory=n=>localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name,count:n}]));inventory(1);
  const plan={map:'1-1',index:0,ships:[{ship:'夕立改二',items:[],expansion:null},{ship:'時雨改二',items:[{name,slotIndex:0,capacity:0}],expansion:null}],suggestion:{slots:[]}};
  const scarce=hdFLOaswRemedies(plan,0),html=hdFLOaswRemediesHtml(plan,0);inventory(2);const enough=hdFLOaswRemedies(plan,0);
  return {scarce:scarce.find(x=>x.changes.some(c=>c.name===name)),enough:enough.find(x=>x.available),html,automatic:hdFLOaswRemedies({...plan,ships:[{ship:'五十鈴改二',items:[],expansion:null}]},0),expansions:plan.ships.map(x=>x.expansion)};
 });
 expect(r.scarce).toMatchObject({available:false,missing:[{name:'四式水中聴音機',star:0,need:1,owned:1}],changes:[{free:0}]});
 expect(r.enough).toMatchObject({available:true,changes:[{name:'四式水中聴音機',owned:2,free:1}]});expect(r.automatic).toEqual([]);expect(r.expansions).toEqual([null,null]);expect(r.html).toContain('転用が必要');
});

test('opening ASW remedies combine two different owned rotors in distinct normal slots',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'カ号観測機',count:1},{name:'オ号観測機改',count:1}]));
  const plan={map:'1-1',index:0,ships:[{ship:'日向改二',items:[],expansion:null}],suggestion:{slots:[]}},start=performance.now(),options=hdFLOaswRemedies(plan,0),elapsed=performance.now()-start;
  return {options,elapsed,html:hdFLOaswRemediesHtml(plan,0)};
 });
 const candidate=r.options.find(x=>x.available);expect(candidate).toBeTruthy();expect(candidate.state.status).toBe('ready');expect(candidate.changes).toHaveLength(2);
 expect(new Set(candidate.changes.map(x=>x.slot)).size).toBe(2);expect(new Set(candidate.changes.map(x=>x.name)).size).toBe(2);expect(r.elapsed).toBeLessThan(5000);expect(r.html).toContain('通常スロットだけ');
});

test('opening ASW remedy UI warns about competing requirements and disappears after confirmation',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'四式水中聴音機',count:1},{name:'22号対水上電探',count:3}]));
  const ship={ship:'夕立改二',items:[0,1,2].map(slotIndex=>({name:'22号対水上電探',slotIndex,capacity:0})),missing:[],expansion:null},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]},missing:[],used:{},owned:{}};
  const requirements=[{kind:'電探',label:'電探3枠',minCount:3}];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const options=hdFLOaswRemedies(plan,0),html=hdFLOaswHtml(plan,0);
  ship.items=[{name:'三式水中探信儀',slotIndex:0,capacity:0}];hdFLUpdateAssessment(plan);HD_FL_CACHE['1-1:0']=plan;
  const host=document.createElement('section');host.id='oasw-remedy-test';host.innerHTML=hdFLPlanHtml(plan);document.body.appendChild(host);
  return {options,html};
 });
 expect(r.options.filter(x=>x.available).every(x=>x.tradeoffs.includes('電探3枠'))).toBe(true);expect(r.html).toContain('電探3枠 が不足');
 const check=page.locator('#oasw-remedy-test .hd-fl-oasw');await expect(check.locator('details')).toHaveCount(1);await check.locator('summary').click();await expect(check).toContainText('手持ちで交換可能');
 await check.locator('input').fill('100');await check.locator('input').press('Tab');await expect(check).toContainText('先制対潜：可能');await expect(check.locator('details')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('opening ASW remedies retain a known insufficient sync value for the exact proposed gear',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const db=hdFEFindShip('夕立改二'),masterId=hdShipDbMasterRowFor(db).id;
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'四式水中聴音機',count:1}]));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,masterId,syncedAt:1,gameAsw:99,gameAswGearKnown:true,gameGearSlots:['四式水中聴音機','',''],gameGearExpansion:'',gameSlotEx:0}]));
  const plan={map:'1-1',index:0,ships:[{ship:'夕立改二',gameShipId:71,masterId,items:[],expansion:null}],suggestion:{slots:[]}};
  return {candidate:hdFLOaswRemedies(plan,0).find(x=>x.available),html:hdFLOaswRemediesHtml(plan,0)};
 });
 expect(r.candidate.state).toMatchObject({status:'missing',value:99,threshold:100,source:'同じ装備での同期値'});expect(r.html).toContain('この同期値では発動不可');
});
test('non-ASW remedies locate compatible normal slots for radar night smoke and transport',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>[['電探','22号対水上電探'],['夜戦','照明弾'],['煙幕','発煙装置(煙幕)'],['輸送','大発動艇']].map(([kind,name])=>{
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name,count:1}]));
  const plan={map:'1-1',index:0,ships:[{ship:'霞改二',items:[],expansion:null}],suggestion:{slots:[]}},requirements=[{kind,label:kind+'の準備',minCount:1}];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const original=JSON.stringify(plan),goal=plan.assessment.measure.goals.find(x=>x.kind===kind),options=hdFLCountRemedies(plan,goal);plan.goalRemedies={[hdFLGoalKey(goal)]:options};
  return {kind,name,options,html:hdFLGoalRemediesHtml(plan,goal),unchanged:original===JSON.stringify({...plan,goalRemedies:undefined})};
 }));
 for(const r of rows){expect(r.unchanged).toBe(true);const available=r.options.find(x=>x.available);expect(available).toMatchObject({ship:'霞改二',targetReady:true,count:1,changes:[{name:r.name,owned:1,free:1}]});expect(available.changes[0].slot).toBeLessThanOrEqual(3);expect(r.html).toContain('通常スロット');}
 expect(rows.find(x=>x.kind==='夜戦').html).toContain('発動率の判定ではありません');expect(rows.find(x=>x.kind==='煙幕').html).toContain('展開率');
});

test('non-ASW remedies count used stock and explain loss of ready opening ASW',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const sonar='三式水中探信儀',radar='22号対水上電探',db=hdFEFindShip('夕立改二'),masterId=hdShipDbMasterRowFor(db).id;
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:sonar,count:1},{name:radar,count:3}]));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',gameShipId:71,masterId,gameAsw:100,gameAswGearKnown:true,gameGearSlots:[sonar,radar,radar],gameGearExpansion:'',gameSlotEx:0}]));
  const plan={map:'1-1',index:0,ships:[{ship:'夕立改二',masterId,gameShipId:71,items:[sonar,radar,radar].map((name,slotIndex)=>({name,slotIndex,capacity:0})),expansion:null}],suggestion:{slots:[]}},requirements=[{kind:'電探',label:'電探3枠',minCount:3}];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const goal=plan.assessment.measure.goals[0],ready=hdFEOpeningAsw(plan.ships[0],hdFLOaswScope(plan,0)),options=hdFLCountRemedies(plan,goal);plan.goalRemedies={[hdFLGoalKey(goal)]:options};const html=hdFLGoalRemediesHtml(plan,goal);
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:sonar,count:1},{name:radar,count:2}]));const scarce=hdFLCountRemedies(plan,goal);
  return {ready,options,scarce:scarce.find(x=>x.changes[0].name===radar),html};
 });
 expect(r.ready.status).toBe('ready');expect(r.options.find(x=>x.available)).toMatchObject({changes:[{slot:1}],targetReady:true});expect(r.html).toContain('先制対潜が不可');expect(r.scarce).toMatchObject({available:false,missing:[{name:'22号対水上電探',need:1,owned:2}],changes:[{free:0}]});
});

test('speed remedies target the missing individual ship without borrowing a same-name ships set',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const names=['改良型艦本式タービン','新型高温高圧缶','新型高温高圧缶'];localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:names[0],count:2},{name:names[1],count:4}]));
  const plan={map:'1-1',index:0,ships:[{ship:'夕張改二特',items:names.map((name,slotIndex)=>({name,slotIndex,capacity:0})),expansion:null},{ship:'夕張改二特',items:[],expansion:null}],suggestion:{slots:[]},routeInfo:{text:'高速+',speedRequired:true}},requirements=[];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const goal=plan.assessment.measure.goals.find(x=>x.kind==='speed-ship'&&!x.ok),options=hdFLSetRemedies(plan,goal);plan.goalRemedies={[hdFLGoalKey(goal)]:options};
  const best=options.find(x=>x.available),trial=hdFOClone(plan);for(const c of best.changes)trial.ships[1].items.push({name:c.name,star:c.star,slotIndex:c.slot-1,capacity:0});
  return {goal,options,after:hdOCMeasure(trial,requirements).goals.filter(x=>x.kind==='speed-ship'),html:hdFLGoalRemediesHtml(plan,goal),expansions:plan.ships.map(x=>x.expansion)};
 });
 expect(r.goal).toMatchObject({shipIndex:1,targetRank:15});expect(r.after.every(x=>x.ok)).toBe(true);const best=r.options.find(x=>x.available);expect(best.shipIndex).toBe(1);expect(best.changes).toHaveLength(3);expect(new Set(best.changes.map(x=>x.slot)).size).toBe(3);expect(best.tradeoffs).toEqual([]);expect(r.expansions).toEqual([null,null]);expect(r.html).toContain('高速+');expect(r.html).toContain('第2艦：夕張改二特');
});

test('speed remedies reuse a confirmed existing expansion turbine and require the actual improved boiler',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const name='大和改二重',db=hdFEFindShip(name),masterId=hdShipDbMasterRowFor(db).id,turbine='改良型艦本式タービン',boiler='新型高温高圧缶';
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:turbine,count:1},{name:boiler,count:1,star:7}]));
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name,gameShipId:71,masterId,gameSlotEx:1}]));
  const plan={map:'1-1',index:0,ships:[{ship:name,masterId,gameShipId:71,items:[],expansion:{name:turbine,star:0}}],suggestion:{slots:[]},routeInfo:{text:'高速+',speedRequired:true}},requirements=[];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const goal=plan.assessment.measure.goals.find(x=>x.kind==='speed-ship'),options=hdFLSetRemedies(plan,goal);const best=options.find(x=>x.available);
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:turbine,count:1},{name:boiler,count:1,star:0}]));const scarce=hdFLSetRemedies(plan,goal);
  return {best,scarce,expansion:plan.ships[0].expansion};
 });
 expect(r.best).toMatchObject({available:true,targetReady:true,changes:[{name:'新型高温高圧缶',star:7}]});expect(r.expansion.name).toBe('改良型艦本式タービン');expect(r.scarce.every(x=>!x.available)).toBe(true);expect(r.scarce.some(x=>x.missing.some(m=>m.name==='新型高温高圧缶'&&m.star===7))).toBe(true);
});
test('non-ASW remedy details are included in the quick loadout assessment on mobile',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const original=hdSEChecks;hdSEChecks=map=>({...original(map),rows:[{kind:'煙幕',label:'煙幕装備',minCount:1},{kind:'電探',label:'電探装備',minCount:1}]});
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'発煙装置(煙幕)',count:1},{name:'22号対水上電探',count:1}]));
  const plan={map:'1-1',index:0,ships:[{ship:'霞改二',type:'駆逐艦',master:true,items:[],missing:[],expansion:null}],suggestion:{slots:[]},missing:[],used:{},owned:{}};hdFLUpdateAssessment(plan,true);
  const host=document.createElement('section');host.id='other-remedy-test';host.innerHTML=hdFLPlanHtml(plan);document.body.appendChild(host);
 });
 const host=page.locator('#other-remedy-test');for(const kind of ['煙幕','電探']){const check=host.locator(`[data-hd-fl-goal="${kind}"]`);await expect(check).toContainText('不足');await check.locator('summary').click();await expect(check).toContainText('手持ちで交換可能');await expect(check).toContainText('この項目を充足');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('non-ASW set remedies complete anti-air and land equipment without consuming stock or opening expansion',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>[
  ['cap-aa','秋月改',['10cm連装高角砲','10cm連装高角砲','22号対水上電探']],
  ['cap-land-soft','摩耶改二',['三式弾']],
  ['cap-land-mixed','霞改二',['大発動艇(八九式中戦車＆陸戦隊)','特二式内火艇']]
 ].map(([kind,ship,names])=>{
  const inventory=[...new Set(names)].map(name=>({name,count:names.filter(x=>x===name).length}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));
  const plan={map:'1-1',index:0,ships:[{ship,items:[],expansion:null}],suggestion:{slots:[]}},requirements=[{kind,label:kind,minCount:1}];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]);return {kind,options,unchanged:original===JSON.stringify(plan),inventoryUnchanged:localStorage.getItem('harbordesk-equipment-v1')===JSON.stringify(inventory)};
 }));
 for(const r of rows){expect(r.unchanged&&r.inventoryUnchanged).toBe(true);expect(r.options.some(x=>x.available&&x.targetReady)).toBe(true);for(const x of r.options.filter(x=>x.available))expect(new Set(x.changes.map(c=>c.slot)).size).toBe(x.changes.length);}
});
test('night CI evaluates the actual basic priority and excludes midget submarines and invalid slots',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightCI==='function');
 const r=await page.evaluate(()=>{
  const check=(ship,names)=>hdFENightCI({ship,items:names.map((name,slotIndex)=>({name,slotIndex,capacity:0})),expansion:null}),gun='20.3cm連装砲',torpedo='61cm四連装(酸素)魚雷',secondary='15.5cm三連装副砲';
  const ship={ship:'北上改二',items:[{name:'甲標的 甲型',slotIndex:0,capacity:0},{name:'20.3cm連装砲',slotIndex:1,capacity:0}],expansion:null},before=JSON.stringify(ship),state=hdFENightCI(ship);
  return {main:check('最上改二',[gun,gun,gun,torpedo]),secondary:check('最上改二',[gun,gun,secondary,torpedo]),torpedo:check('最上改二',[gun,torpedo,torpedo,secondary]),mixed:check('最上改二',[gun,torpedo]),double:check('最上改二',[gun,gun]),midget:state,unchanged:before===JSON.stringify(ship),carrier:check('加賀改',[]),sub:check('伊58改',[torpedo,torpedo]),invalid:hdFENightCI({ship:'最上改二',items:[{name:gun,slotIndex:0},{name:gun,slotIndex:0},{name:gun,slotIndex:1}],expansion:null}),html:hdFENightCIHtml({ship:'夕立改二',items:[{name:torpedo,slotIndex:0},{name:torpedo,slotIndex:1}],expansion:null})};
 });
 expect(r.main).toMatchObject({status:'ready',attack:'main'});expect(r.secondary).toMatchObject({status:'ready',attack:'main-secondary'});expect(r.torpedo).toMatchObject({status:'ready',attack:'torpedo'});expect(r.mixed.attack).toBe('mixed');expect(r.double).toMatchObject({status:'missing',attack:'double'});expect(r.midget).toMatchObject({status:'missing',torpedo:0});expect(r.unchanged).toBe(true);for(const k of ['carrier','sub','invalid'])expect(r[k].status).toBe('manual');expect(r.html).toContain('発動確定・発動率');
});

test('night CI search clears a competing main gun and never refills it to break the selected cutin',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const gun='20.3cm連装砲',torpedo='61cm四連装(酸素)魚雷';localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'mixed'}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:gun,count:3},{name:torpedo,count:1}]));
  const c={map:'1-1',index:0,preset:null,fleet:{id:'night-priority',ships:[{ship:'最上改二',gear:[gun,gun,gun,torpedo].join(' / ')}]}},result=hdOCSearch(c),goal=result.measure.goals.find(g=>g.kind==='cap-night-mixed'),usage=hdFOAssignedUsage(result.plan);
  const plan=hdFEPlanFromSavedFleet('1-1',c.fleet);plan.assessment={requirements:[{kind:'cap-night-mixed',label:goal.label,minCount:1}],measure:hdOCMeasure(plan,[{kind:'cap-night-mixed',label:goal.label,minCount:1}])};const options=hdFLSetRemedies(plan,plan.assessment.measure.goals.find(g=>g.kind==='cap-night-mixed'));
  return {goal,state:hdFENightCI(result.plan.ships[0]),items:result.plan.ships[0].items,usage,options,expansion:result.plan.ships[0].expansion};
 });
 expect(r.goal.ok).toBe(true);expect(r.state).toMatchObject({attack:'mixed',main:2,torpedo:1});expect(r.items).toHaveLength(3);expect(r.expansion).toBeNull();expect(Object.keys(r.usage).every(x=>!x.startsWith('@@'))).toBe(true);expect(r.options.some(x=>x.available&&x.changes.some(c=>c.name==='空き枠'))).toBe(true);
});

test('night CI counts a same-ship set and reports missing owned torpedoes without inventing stock',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const torpedo='61cm四連装(酸素)魚雷',ships=['夕立改二','時雨改二'].map(ship=>({ship,items:[{name:torpedo,slotIndex:0,capacity:0}],expansion:null})),split=hdSECapabilityMeasure({ships},'cap-night-torpedo');
  localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'torpedo'}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:torpedo,count:1}]));const plan={map:'1-1',index:0,ships:[{ship:'夕立改二',items:[],expansion:null}],suggestion:{slots:[]}},requirements=[{kind:'cap-night-torpedo',label:'魚雷CI',minCount:1}];plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};
  const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals.find(g=>g.kind==='cap-night-torpedo'));
  const unknown=hdOCMeasure({map:'1-1',ships:[{ship:'加賀改',items:[],expansion:null}]},requirements).goals.find(g=>g.kind==='cap-night-torpedo');return {split,options,unchanged:original===JSON.stringify(plan),unknown};
 });
 expect(r.split.count).toBe(0);expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available)).toBe(true);expect(r.options.some(x=>x.missing.some(m=>m.name==='61cm四連装(酸素)魚雷'&&m.need===1&&m.owned===1))).toBe(true);expect(r.unchanged).toBe(true);expect(r.unknown.unresolved).toBe(true);
});

test('night CI selected recipes automatically assemble all four supported generic cutins from owned gear',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>[['torpedo',['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷']],['main',['20.3cm連装砲','20.3cm連装砲','20.3cm連装砲']],['main-secondary',['20.3cm連装砲','20.3cm連装砲','15.5cm三連装副砲']],['mixed',['20.3cm連装砲','61cm四連装(酸素)魚雷']]].map(([policy,names])=>{
  localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':policy}));const inventory=[...new Set(names)].map(name=>({name,count:names.filter(x=>x===name).length}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));
  const result=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:'night-'+policy,ships:[{ship:'最上改二',gear:''}]}},{}),state=hdFENightCI(result.plan.ships[0]);return {policy,state,goal:result.measure.goals.find(g=>g.kind===hdSENightKind('1-1')),usage:hdFOAssignedUsage(result.plan),inventory,expansion:result.plan.ships[0].expansion};
 }));
 for(const r of rows){expect(r.state).toMatchObject({status:'ready',attack:r.policy});expect(r.goal.ok).toBe(true);expect(r.expansion).toBeNull();for(const x of r.inventory)expect(r.usage[x.name+'@@0']||0).toBeLessThanOrEqual(x.count);}
});

test('destroyer night CI distinguishes surface radar, lookout types and the level 80 hit condition',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightDD==='function');
 const r=await page.evaluate(()=>{
  const gun='12.7cm連装砲',fish='61cm四連装(酸素)魚雷',radar='22号対水上電探',water='水雷戦隊 熟練見張員',lookout='熟練見張員',drum='ドラム缶(輸送用)',check=(names,level=80,ship='夕立改二')=>hdFENightDD({ship,level,items:names.map((name,slotIndex)=>({name,slotIndex,star:10})),expansion:null});
  const ship={ship:'夕立改二',level:80,items:[fish,fish,water].map((name,slotIndex)=>({name,slotIndex})),expansion:null},before=JSON.stringify(ship),state=hdFENightDD(ship);
  return {main:check([gun,fish,radar]),lookout:check([fish,lookout,radar]),water:state,drum:check([fish,drum,water]),wrongRadar:check([gun,fish,'13号対空電探改']),wrongLookout:check([fish,fish,lookout]),wrongShip:check([fish,fish,water],80,'阿武隈改二'),midget:check(['甲標的 甲型',fish,water],80,'北上改二'),low:check([gun,fish,radar],79),unknown:check([gun,fish,radar],null),unchanged:before===JSON.stringify(ship),html:hdFENightCIHtml({...ship,level:79})};
 });
 for(const [key,attack]of [['main','dd-main-radar'],['lookout','dd-lookout-radar'],['water','dd-water-torpedo'],['drum','dd-water-drum']])expect(r[key]).toMatchObject({status:'ready',candidates:[{attack}],hitStatus:'ready',level:80});
 expect(r.main.dGun).toBe(false);expect(r.wrongRadar.status).toBe('missing');expect(r.wrongLookout.status).toBe('missing');expect(r.wrongShip.status).toBe('manual');expect(r.midget.status).toBe('manual');expect(r.low).toMatchObject({status:'ready',hitStatus:'missing',level:79});expect(r.unknown).toMatchObject({status:'ready',hitStatus:'manual',level:null});expect(r.unchanged).toBe(true);expect(r.html).toContain('2回攻撃型にはLv80以上');expect(r.html).toContain('発動・命中・2回攻撃は確定しません');
});

test('destroyer night CI search assembles all four selected sets within owned stock without an expansion',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>[['dd-main-radar',['12.7cm連装砲','61cm四連装(酸素)魚雷','22号対水上電探']],['dd-lookout-radar',['61cm四連装(酸素)魚雷','熟練見張員','22号対水上電探']],['dd-water-torpedo',['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷','水雷戦隊 熟練見張員']],['dd-water-drum',['61cm四連装(酸素)魚雷','ドラム缶(輸送用)','水雷戦隊 熟練見張員']]].map(([policy,names])=>{
  localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':policy}));const inventory=[...new Set(names)].map(name=>({name,count:names.filter(x=>x===name).length}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',level:79,gameSlotEx:0}]));
  const result=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:policy,ships:[{ship:'夕立改二',gear:''}]}},{});return {policy,goal:result.measure.goals.find(g=>g.kind===hdSENightKind('1-1')),state:hdFENightDD(result.plan.ships[0]),usage:hdFOAssignedUsage(result.plan),inventory,expansion:result.plan.ships[0].expansion};
 }));
 for(const r of rows){expect(r.goal.ok).toBe(true);expect(r.state.candidates.some(c=>c.attack===r.policy)).toBe(true);expect(r.state.hitStatus).toBe('missing');expect(r.expansion).toBeNull();for(const x of r.inventory)expect(r.usage[x.name+'@@0']||0).toBeLessThanOrEqual(x.count);}
});

test('destroyer night CI keeps all independently eligible sets and rejects an unconfirmed expansion or ambiguous level',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightDD==='function');
 const r=await page.evaluate(()=>{
  const db=hdFEFindShip('Ташкент改'),masterId=hdShipDbMasterRowFor(db).id,ship={ship:'Ташкент改',masterId,gameShipId:31,items:['12.7cm連装砲D型改二','61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷','22号対水上電探'].map((name,slotIndex)=>({name,slotIndex})),expansion:{name:'水雷戦隊 熟練見張員'}};
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:31,level:80,gameSlotEx:1}]));const ready=hdFENightDD(ship),counts=['dd-main-radar','dd-lookout-radar','dd-water-torpedo'].map(x=>hdSECapabilityMeasure({ships:[ship]},'cap-night-'+x).count),generic=hdFENightCI(ship);
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:31,level:80,gameSlotEx:0}]));const closed=hdFENightDD(ship);
  const without={...ship,gameShipId:null,expansion:null};localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,level:79},{name:ship.ship,level:80}]));const ambiguous=hdFENightDD(without);return {ready,counts,generic,closed,ambiguous};
 });
 expect(r.ready.candidates.map(c=>c.attack)).toEqual(['dd-main-radar','dd-lookout-radar','dd-water-torpedo']);expect(r.counts).toEqual([1,1,1]);expect(r.ready.dGun).toBe(true);expect(r.generic.attack).toBe('torpedo');expect(r.closed.status).toBe('manual');expect(r.ambiguous.hitStatus).toBe('manual');
});

test('destroyer night CI remedies reuse a confirmed expansion lookout and name a missing dedicated lookout',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightDD==='function');
 const r=await page.evaluate(()=>{
  const gun='12.7cm連装砲',fish='61cm四連装(酸素)魚雷',water='水雷戦隊 熟練見張員',masterId=hdShipDbMasterRowFor(hdFEFindShip('夕立改二')).id,requirements=[{kind:'cap-night-dd-water-torpedo',label:'魚魚水CI',minCount:1}],plan={map:'1-1',index:0,ships:[{ship:'夕立改二',masterId,gameShipId:72,items:[gun,gun,fish].map((name,slotIndex)=>({name,slotIndex})),expansion:{name:water}}],suggestion:{slots:[]}};
  localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:'夕立改二',masterId,gameShipId:72,level:80,gameSlotEx:1}]));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:gun,count:2},{name:fish,count:2},{name:water,count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const original=JSON.stringify(plan),owned=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]),unchanged=original===JSON.stringify(plan);
  plan.ships[0].expansion=null;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:gun,count:2},{name:fish,count:2},{name:'熟練見張員',count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const missing=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]);return {owned,unchanged,missing};
 });
 expect(r.unchanged).toBe(true);expect(r.owned.some(x=>x.available&&x.targetReady)).toBe(true);expect(r.owned.every(x=>x.changes.every(c=>c.slot<=3))).toBe(true);expect(r.missing.length).toBeGreaterThan(0);expect(r.missing.every(x=>!x.available)).toBe(true);expect(r.missing.some(x=>x.missing.some(m=>m.name==='水雷戦隊 熟練見張員'&&m.need===1))).toBe(true);
});

test('submarine night CI uses verified equipment IDs and evaluates the actual priority',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightSub==='function');
 const r=await page.evaluate(()=>{
  const late='後期型艦首魚雷(6門)',radar='潜水艦搭載電探＆逆探(E27)',fish='61cm四連装(酸素)魚雷',check=(ship,names)=>hdFENightSub({ship,items:names.map((name,slotIndex)=>({name,slotIndex})),expansion:null});
  const ship={ship:'伊13改',items:[late,late,radar].map((name,slotIndex)=>({name,slotIndex})),expansion:null},before=JSON.stringify(ship),state=hdFENightSub(ship),parts=[...HD_SE_SUB_LATE_IDS].map(id=>{const [name]=Object.entries(window.HD_KANCOLLE_MASTER_SNAPSHOT.equipment).find(([,v])=>v.id===id);return {id,matched:hdSEPartMatches('nightSubLate',hdFEFind(name))}});
  return {state,parts,alias:hdSEPartMatches('nightSubLate',hdFEFind('熟練聴音員＋後期型艦首魚雷(6門)')),pair:check('伊58改',[late,late]),regular:check('伊58改',[late,fish]),one:check('伊58改',[fish,radar]),waterRadar:check('伊13改',[late,late,'22号対水上電探']),waterRadarIsSubRadar:hdSEPartMatches('nightSubRadar',hdFEFind('22号対水上電探')),waterRadarNormalAllowed:hdShipDbMasterCompatible(hdFEFind('22号対水上電探'),hdFEFindShip('伊13改')),surface:check('夕立改二',[fish,fish]),fake:hdSEPartMatches('nightSubLate',{name:'架空の後期型魚雷',category:'潜水艦魚雷',stats:{雷装:99}}),invalid:hdFENightSub({ship:'伊58改',items:[{name:late,slotIndex:0},{name:late,slotIndex:0}],expansion:null}),unchanged:before===JSON.stringify(ship),lowerGoal:hdSECapabilityMeasure({ships:[ship]},'cap-night-sub-late'),html:hdFENightCIHtml(ship)};
 });
 expect(r.parts).toHaveLength(8);expect(r.parts.every(x=>x.matched)).toBe(true);expect(r.alias).toBe(true);expect(r.fake).toBe(false);expect(r.state).toMatchObject({status:'ready',attack:'sub-radar',late:2,radar:1});expect(r.pair.attack).toBe('sub-late');expect(r.regular.attack).toBe('sub-torpedo');expect(r.one.status).toBe('missing');expect(r.waterRadarNormalAllowed).toBe(false);expect(r.waterRadarIsSubRadar).toBe(false);expect(r.waterRadar).toMatchObject({status:'manual',attack:'unknown',radar:0});expect(r.waterRadar.detail).toContain('装備可否');expect(r.surface.status).toBe('manual');expect(r.invalid.status).toBe('manual');expect(r.lowerGoal.count).toBe(0);expect(r.unchanged).toBe(true);expect(r.html).toContain('潜水艦夜戦CI装備条件：成立');expect(r.html).not.toContain('夜戦汎用CI装備条件');expect(r.html).toContain('発動率・命中・撃破火力は未計算');
});

test('submarine night CI search assembles all selected sets within stock and keeps unopened expansion slots empty',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>[['sub-radar',[['後期型艦首魚雷(6門)',1],['潜水艦搭載電探＆逆探(E27)',1]]],['sub-late',[['後期型艦首魚雷(6門)',2]]],['sub-torpedo',[['後期型艦首魚雷(6門)',2],['61cm四連装(酸素)魚雷',1]]]].map(([policy,stock])=>{
  localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':policy}));const inventory=stock.map(([name,count])=>({name,count})),ship=policy==='sub-torpedo'?'伊13改':'伊58改';localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(inventory));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,level:80,gameSlotEx:0}]));const result=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:policy,ships:[{ship,gear:''}]}},{});return {policy,goal:result.measure.goals.find(g=>g.kind===hdSENightKind('1-1')),state:hdFENightSub(result.plan.ships[0]),expansion:result.plan.ships[0].expansion,inventory,usage:hdFOAssignedUsage(result.plan)};
 }));
 for(const r of rows){expect(r.state).toMatchObject({status:'ready',attack:r.policy});expect(r.goal.ok).toBe(true);expect(r.expansion).toBeNull();for(const x of r.inventory)expect(r.usage[x.name+'@@0']||0).toBeLessThanOrEqual(x.count);}
});

test('submarine night CI can remove a competing confirmed expansion radar and proposes its removal without inventing a slot',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const r=await page.evaluate(()=>{
  const late='後期型艦首魚雷(6門)',radar='潜水艦搭載電探＆逆探(E27)',masterId=hdShipDbMasterRowFor(hdFEFindShip('伊58改')).id,requirements=[{kind:'cap-night-sub-late',label:'後期型魚雷2本CI',minCount:1}],ship={ship:'伊58改',masterId,gameShipId:91,items:[late,late].map((name,slotIndex)=>({name,slotIndex})),expansion:{name:radar}},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}};
  localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:late,count:2},{name:radar,count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:91,level:90,gameSlotEx:1}]));localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'sub-late'}));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]),unchanged=original===JSON.stringify(plan),html=hdFLSetRemediesHtml(plan.assessment.measure.goals[0],options),context={map:'1-1',index:0,preset:null,fleet:{id:'sub-clear-exp',ships:[{ship:ship.ship,gameShipId:91,masterId,gear:[late,late,'[増設] '+radar].join(' / ')}]}},starting=hdFENightSub(hdOCBuild(context).plan.ships[0]),result=hdOCSearch(context,{});
  const initial=hdFENightSub(ship),info=hdShipDbExpansionInfo(hdFEFind(radar),hdFEFindShip(ship.ship));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:91,level:90,gameSlotEx:0}]));const closed=hdFENightSub(ship);return {initial,info,starting,options,unchanged,html,state:hdFENightSub(result.plan.ships[0]),expansion:result.plan.ships[0].expansion,goal:result.measure.goals.find(g=>g.kind==='cap-night-sub-late'),closed};
 });
 expect(r.unchanged).toBe(true);expect(r.info.allowed).toBe(true);expect(r.initial.attack).toBe('sub-radar');expect(r.starting.attack).toBe('sub-radar');expect(r.options.some(x=>x.available&&x.targetReady&&x.changes.some(c=>c.expansion&&c.name==='空き枠'))).toBe(true);expect(r.html).toContain('増設：');expect(r.html).not.toContain('第増設');expect(r.state.attack).toBe('sub-late');expect(r.goal.ok).toBe(true);expect(r.expansion).toBeNull();expect(r.closed.status).toBe('manual');
});

test('submarine night CI missing sets name the equipment and cannot combine gear from different ships',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdFENightSub==='function');
 const r=await page.evaluate(()=>{
  const late='後期型艦首魚雷(6門)',ships=['伊58改','伊19改'].map(ship=>({ship,items:[{name:late,slotIndex:0}],expansion:null})),split=hdSECapabilityMeasure({ships},'cap-night-sub-late'),requirements=[{kind:'cap-night-sub-radar',label:'後期型魚雷＋電探CI',minCount:1}],plan={map:'1-1',index:0,ships:[ships[0]],suggestion:{slots:[]}};localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:late,count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const before=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]);return {split,options,unchanged:before===JSON.stringify(plan)};
 });
 expect(r.split.count).toBe(0);expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available)).toBe(true);expect(r.options.some(x=>x.missing.some(m=>hdLikeSubRadar(m.name)))).toBe(true);expect(r.unchanged).toBe(true);
 function hdLikeSubRadar(name){return /潜水艦|シュノーケル|SJレーダー/.test(name)}
});


test('carrier night CI requires native remodel or crew and counts only surviving night aircraft',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const f='F6F-3N',t='TBM-3D',c='夜間作戦航空要員',build=(ship,names)=>({ship,items:names.map((name,slotIndex)=>({name,slotIndex})),expansion:null});
  const native=build('Saratoga Mk.II',[f,f,t]),ordinary=build('赤城改',[f,f,t]),crew=build('赤城改',[f,f,t,c]),wrong=build('赤城改',['零式艦戦21型','流星',c]),noCrew=hdFENightCarrier(ordinary),full=hdFENightCarrier(crew),self=hdFENightCarrier(native),base=hdFENightCarrier(build('Saratoga改',[f,f,t]));
  const masterId=hdShipDbMasterRowFor(hdFEFindShip(native.ship)).id;native.masterId=masterId;native.gameShipId=881;localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:native.ship,masterId,gameShipId:881,gameOnslot:[0,0,18,0]}]));const zero=hdFENightCarrier(native),html=hdFENightCarrierHtml(native);localStorage.removeItem('harbordesk-ship-roster-v1');
  const split=hdSECapabilityMeasure({ships:[build('Saratoga Mk.II',[f,f]),build('赤城改',[t,c])]},'cap-night-cv-fighter2');
  return {noCrew,full,self,base,zero,html,wrong:hdFENightCarrier(wrong),split,unknown:hdFENightCarrier(build('赤城改',['存在しない夜間戦闘機',t,c])),alias:hdSEPartMatches('nightCarrierTorpedo',hdFEFind('TBM-3W＋3S')),fake:hdSEPartMatches('nightCarrierFighter',{name:'夜間戦闘機テスト',category:'艦上戦闘機'})};
 });
 expect(r.self.status).toBe('ready');expect(r.self.native).toBe(true);expect(r.self.candidates.map(x=>x.attack)).toEqual(['cv-fighter2','cv-fighter1']);expect(r.full.status).toBe('ready');expect(r.noCrew.status).toBe('missing');expect(r.base.status).toBe('missing');expect(r.zero.status).toBe('missing');expect(r.zero.fighter).toBe(0);expect(r.html).toContain('搭載数0');expect(r.wrong.status).toBe('missing');expect(r.unknown.status).toBe('manual');expect(r.fake).toBe(false);expect(r.alias).toBe(true);expect(r.split.count).toBe(0);
});

test('carrier night CI search assembles native and ordinary carrier sets within owned stock',async({page})=>{
 await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>['cv-fighter2','cv-fighter1'].flatMap(policy=>['Saratoga Mk.II','赤城改'].map(ship=>{
  localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':policy}));const stock=[{name:'F6F-3N',count:policy==='cv-fighter2'?2:1},{name:'TBM-3D',count:1},...(ship==='赤城改'?[{name:'夜間作戦航空要員',count:1}]:[])];localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(stock));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,level:90,gameSlotEx:0}]));const result=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:policy+ship,ships:[{ship,gear:''}]}},{});return {policy,ship,stock,goal:result.measure.goals.find(g=>g.kind===hdSENightKind('1-1')),state:hdFENightCarrier(result.plan.ships[0]),expansion:result.plan.ships[0].expansion,usage:hdFOAssignedUsage(result.plan)};
 })));
 for(const r of rows){expect(r.goal.ok,r.ship+r.policy).toBe(true);expect(r.state.candidates.some(c=>c.attack===r.policy)).toBe(true);expect(r.expansion).toBeNull();for(const item of r.stock)expect(r.usage[item.name+'@@0']||0).toBeLessThanOrEqual(item.count);}
});

test('carrier night CI remedies identify missing personnel and do not invent aircraft on incompatible ships',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const f='F6F-3N',t='TBM-3D',ship={ship:'赤城改',items:[f,f,t].map((name,slotIndex)=>({name,slotIndex})),expansion:null},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}},requirements=[{kind:'cap-night-cv-fighter2',label:'空母CI',minCount:1}];localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:f,count:2},{name:t,count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]),stock=hdSECapabilityStock(plan,'cap-night-cv-fighter2');return {options,stock,unchanged:original===JSON.stringify(plan),surface:hdSERecipeAllows(HD_SE_RECIPES['cap-night-cv-fighter2'][1],{ship:'夕立改二'})};
 });
 expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available)).toBe(true);expect(r.options.some(x=>x.missing.some(m=>/夜間作戦航空要員/.test(m.name)))).toBe(true);expect(r.stock.complete).toBe(false);expect(r.unchanged).toBe(true);expect(r.surface).toBe(false);
});


test('carrier bomber CI evaluates all six same-ship combinations and excludes photo-only and ordinary planes',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const f='F6F-3N',t='TBM-3D',b='九九式練爆二二型改(夜間装備実験機)',p='彗星一二型(三一号光電管爆弾搭載機)',c='夜間作戦航空要員',build=(ship,names)=>({ship,items:names.map((name,slotIndex)=>({name,slotIndex})),expansion:null}),sets=[[f,p],[t,p],[f,b],[t,b],[p,b],[b,b]];
  const ready=sets.map(names=>({native:hdFENightCarrier(build('Saratoga Mk.II',names)),ordinary:hdFENightCarrier(build('赤城改',[...names,c])),noCrew:hdFENightCarrier(build('赤城改',names))})),wrong=[[p,p,c],['零式艦戦21型',p,c],['Swordfish',p,c],[b,'熟練艦載機整備員']].map(names=>hdFENightCarrier(build('赤城改',names))),ship=build('Saratoga Mk.II',[f,b]);const masterId=hdShipDbMasterRowFor(hdFEFindShip(ship.ship)).id;ship.masterId=masterId;ship.gameShipId=889;localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:889,gameOnslot:[32,0,0,0]}]));const zero=hdFENightCarrier(ship);localStorage.removeItem('harbordesk-ship-roster-v1');
  return {ready,wrong,zero,split:hdSECapabilityMeasure({ships:[build('Saratoga Mk.II',[f]),build('赤城改',[b,c])]},'cap-night-cv-bomber'),parts:[b,'零式艦戦62型改(夜間爆戦)','零式艦戦62型改(熟練/夜間爆戦)'].map(name=>hdSEPartMatches('nightCarrierBomber',hdFEFind(name))),fake:hdSEPartMatches('nightCarrierBomber',{name:'夜間爆撃機テスト'}),html:hdFENightCarrierHtml(build('赤城改',[p,b,c]))};
 });
 for(const x of r.ready){expect(x.native.candidates.some(c=>c.attack==='cv-bomber')).toBe(true);expect(x.ordinary.candidates.some(c=>c.attack==='cv-bomber')).toBe(true);expect(x.noCrew.status).toBe('missing');}for(const x of r.wrong)expect(x.status).toBe('missing');expect(r.zero.status).toBe('missing');expect(r.zero.depleted).toHaveLength(1);expect(r.split.count).toBe(0);expect(r.parts).toEqual([true,true,true]);expect(r.fake).toBe(false);expect(r.html).toContain('夜間爆撃機 1');expect(r.html).toContain('光電管爆弾 1');
});

for(const ship of ['Saratoga Mk.II','赤城改'])test('carrier bomber CI search builds all six recipes within stock on '+ship,async({page})=>{
 test.setTimeout(120000);await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(ship=>{
  const f='F6F-3N',t='TBM-3D',b='九九式練爆二二型改(夜間装備実験機)',p='彗星一二型(三一号光電管爆弾搭載機)',c='夜間作戦航空要員';localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'cv-bomber'}));return [[f,p],[t,p],[f,b],[t,b],[p,b],[b,b]].map((planes,index)=>{const names=ship==='赤城改'?[...planes,c]:planes,counts=new Map();for(const name of names)counts.set(name,(counts.get(name)||0)+1);const stock=[...counts].map(([name,count])=>({name,count}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(stock));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,level:90,gameSlotEx:0}]));const r=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:'bomb-'+index,ships:[{ship,gear:''}]}},{});return {planes,stock,state:hdFENightCarrier(r.plan.ships[0]),goal:r.measure.goals.find(g=>g.kind==='cap-night-cv-bomber'),expansion:r.plan.ships[0].expansion,usage:hdFOAssignedUsage(r.plan)};});
 },ship);
 for(const r of rows){expect(r.goal.ok,r.planes.join('/')).toBe(true);expect(r.state.candidates.some(c=>c.attack==='cv-bomber')).toBe(true);expect(r.expansion).toBeNull();for(const item of r.stock)expect(r.usage[item.name+'@@0']||0).toBeLessThanOrEqual(item.count);}
});

test('carrier bomber CI missing remedies show night plane and crew shortages without mutation',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const b='九九式練爆二二型改(夜間装備実験機)',ship={ship:'赤城改',items:[{name:b,slotIndex:0}],expansion:null},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}},requirements=[{kind:'cap-night-cv-bomber',label:'空母夜間爆撃CI',minCount:1}];localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:b,count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]);return {options,unchanged:JSON.stringify(plan)===original};
 });
 expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available)).toBe(true);expect(r.options.some(x=>x.missing.some(m=>/夜間作戦航空要員/.test(m.name)))).toBe(true);expect(r.options.some(x=>x.missing.some(m=>!/夜間作戦航空要員/.test(m.name)))).toBe(true);expect(r.unchanged).toBe(true);
});


test('carrier three-plane CI handles the dedicated set exclusion and verified special aircraft',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const f='F6F-3N',t='TBM-3D',b='九九式練爆二二型改(夜間装備実験機)',p='彗星一二型(三一号光電管爆弾搭載機)',s='Swordfish',i='零戦62型(爆戦/岩井隊)',c='夜間作戦航空要員',build=(ship,names)=>({ship,items:names.map((name,slotIndex)=>({name,slotIndex})),expansion:null});
  const sets=[[f,f,f],[f,t,t],[f,p,p],[f,s,s],[f,i,s],[f,b,p],[f,f,t,p]],states=sets.map(names=>hdFENightCarrier(build('Saratoga Mk.II',names))),exact=hdFENightCarrier(build('Saratoga Mk.II',[f,f,t])),ordinary=hdFENightCarrier(build('赤城改',[f,s,s,c])),noCrew=hdFENightCarrier(build('赤城改',[f,s,s])),noFighter=hdFENightCarrier(build('Saratoga Mk.II',[t,t,s])),wrong=hdFENightCarrier(build('Saratoga Mk.II',[f,'零式艦戦21型','流星'])),split=hdSECapabilityMeasure({ships:[build('Saratoga Mk.II',[f,s]),build('赤城改',[s,c])]},'cap-night-cv-three');
  const ship=build('Saratoga Mk.II',[f,s,s]),masterId=hdShipDbMasterRowFor(hdFEFindShip(ship.ship)).id;ship.masterId=masterId;ship.gameShipId=891;localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,masterId,gameShipId:891,gameOnslot:[0,18,18,0]}]));const zero=hdFENightCarrier(ship);localStorage.removeItem('harbordesk-ship-roster-v1');return {states,exact,ordinary,noCrew,noFighter,wrong,split,zero,html:hdFENightCarrierHtml(build('Saratoga Mk.II',[f,f,t])),fake:hdSEPartMatches('nightCarrierOther',{name:'Swordfish夜間型テスト'}),specials:[s,'Swordfish Mk.II(熟練)','Swordfish Mk.III(熟練)',i].map(name=>hdSEPartMatches('nightCarrierOther',hdFEFind(name)))};
 });
 for(const x of r.states)expect(x.candidates.some(c=>c.attack==='cv-three')).toBe(true);expect(r.exact.candidates.some(c=>c.attack==='cv-three')).toBe(false);expect(r.exact.candidates.some(c=>c.attack==='cv-fighter2')).toBe(true);expect(r.ordinary.candidates.some(c=>c.attack==='cv-three')).toBe(true);expect(r.noCrew.status).toBe('missing');expect(r.noFighter.candidates.some(c=>c.attack==='cv-three')).toBe(false);expect(r.wrong.status).toBe('missing');expect(r.split.count).toBe(0);expect(r.zero.status).toBe('missing');expect(r.html).toContain('夜間機3枠CIは対象外');expect(r.fake).toBe(false);expect(r.specials).toEqual([true,true,true,true]);
});

for(const ship of ['Saratoga Mk.II','赤城改'])test('carrier three-plane CI search assembles all recipe families including special aircraft on '+ship,async({page})=>{
 test.setTimeout(120000);await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(ship=>{
  const f='F6F-3N',t='TBM-3D',b='九九式練爆二二型改(夜間装備実験機)',p='彗星一二型(三一号光電管爆弾搭載機)',s='Swordfish',i='零戦62型(爆戦/岩井隊)',c='夜間作戦航空要員';localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'cv-three'}));return [[f,f,f],[f,t,t],[f,s,s],[f,i,s],[f,b,p]].map((planes,index)=>{const names=ship==='赤城改'?[...planes,c]:planes,counts=new Map();for(const name of names)counts.set(name,(counts.get(name)||0)+1);const stock=[...counts].map(([name,count])=>({name,count}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(stock));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,level:90,gameSlotEx:0}]));const r=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:'three-'+index,ships:[{ship,gear:''}]}},{});return {planes,stock,state:hdFENightCarrier(r.plan.ships[0]),goal:r.measure.goals.find(g=>g.kind==='cap-night-cv-three'),expansion:r.plan.ships[0].expansion,usage:hdFOAssignedUsage(r.plan)};});
 },ship);
 for(const r of rows){expect(r.goal.ok,r.planes.join('/')).toBe(true);expect(r.state.candidates.some(c=>c.attack==='cv-three')).toBe(true);expect(r.expansion).toBeNull();for(const item of r.stock)expect(r.usage[item.name+'@@0']||0).toBeLessThanOrEqual(item.count);}
});

test('carrier three-plane CI stock and remedies never call the excluded dedicated set deployable',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const f='F6F-3N',t='TBM-3D',ship={ship:'Saratoga Mk.II',items:[f,f,t].map((name,slotIndex)=>({name,slotIndex})),expansion:null},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}},requirements=[{kind:'cap-night-cv-three',label:'夜間機3枠CI',minCount:1}];localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'cv-three'}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:f,count:2},{name:t,count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship.ship,level:90,gameSlotEx:0}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const original=JSON.stringify(plan),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]),stock=hdSECapabilityStock(plan,'cap-night-cv-three'),search=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:'excluded',ships:[{ship:ship.ship,gear:''}]}},{});return {stock,options,unchanged:JSON.stringify(plan)===original,goal:search.measure.goals.find(g=>g.kind==='cap-night-cv-three')};
 });
 expect(r.stock.complete).toBe(false);expect(r.stock.usable.complete).toBe(false);expect(r.goal.ok).toBe(false);expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available&&x.missing.length>0)).toBe(true);expect(r.unchanged).toBe(true);
});


test('automatic night CI evaluates mixed ship families once per ship and names the matched sets',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const build=(ship,names)=>({ship,items:names.map((name,slotIndex)=>({name,slotIndex})),expansion:null}),plan={map:'1-1',ships:[build('夕立改二',['12.7cm連装砲','61cm四連装(酸素)魚雷','22号対水上電探']),build('最上改二',['61cm四連装(酸素)魚雷','61cm四連装(酸素)魚雷']),build('伊58改',['後期型艦首魚雷(6門)','潜水艦搭載電探＆逆探(E27)']),build('Saratoga Mk.II',['F6F-3N','九九式練爆二二型改(夜間装備実験機)'])]};const m=hdSECapabilityMeasure(plan,'cap-night-auto'),goal=hdOCMeasure(plan,[{kind:'cap-night-auto',label:'自動CI',minCount:1}]).goals[0],unknown=hdSECapabilityMeasure({ships:[build('存在しない艦',[])]},'cap-night-auto'),split=hdSECapabilityMeasure({ships:[build('Saratoga Mk.II',['F6F-3N']),build('赤城改',['TBM-3D','夜間作戦航空要員'])]},'cap-night-auto');
  return {m,goal,unknown,split,kind:hdSENightKind('1-1'),dd:m.matches.find(x=>x.ship==='夕立改二')};
 });
 expect(r.kind).toBe('cap-night-auto');expect(r.m.count).toBe(4);expect(r.m.matches).toHaveLength(4);expect(r.dd.attacks).toContain('主魚電CI');expect(r.dd.attacks).toContain('主魚カットイン');expect(r.goal.detail).toContain('伊58改：後期型魚雷＋潜水艦用電探CI');expect(r.goal.detail).toContain('Saratoga Mk.II：夜間爆撃機・光電管爆弾CI');expect(r.unknown.unresolved).toBe(true);expect(r.split.count).toBe(0);
});

test('automatic night CI searches owned generic destroyer submarine and carrier sets without a selected type',async({page})=>{
 test.setTimeout(120000);await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 const rows=await page.evaluate(()=>{
  const needs=hdMapEquipNeeds;hdMapEquipNeeds=()=>({needs:[{id:'夜戦'}],adv:{}});try{return [
   ['最上改二',[['61cm四連装(酸素)魚雷',2]]],['夕立改二',[['61cm四連装(酸素)魚雷',1],['熟練見張員',1],['22号対水上電探',1]]],['伊58改',[['後期型艦首魚雷(6門)',1],['潜水艦搭載電探＆逆探(E27)',1]]],['Saratoga Mk.II',[['F6F-3N',1],['TBM-3D',1]]],['赤城改',[['F6F-3N',1],['TBM-3D',1],['夜間作戦航空要員',1]]],['赤城改',[['F6F-3N',1],['Swordfish',2],['夜間作戦航空要員',1]]]
  ].map(([ship,items],index)=>{localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'auto'}));const stock=items.map(([name,count])=>({name,count}));localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(stock));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,level:90,gameSlotEx:0}]));const result=hdOCSearch({map:'1-1',index:0,preset:null,fleet:{id:'auto-ci-'+index,ships:[{ship,gear:''}]}},{});return {ship,stock,goal:result.measure.goals.find(g=>g.kind==='cap-night-auto'),m:hdSECapabilityMeasure(result.plan,'cap-night-auto'),expansion:result.plan.ships[0].expansion,usage:hdFOAssignedUsage(result.plan)};});}finally{hdMapEquipNeeds=needs}
 });
 for(const r of rows){expect(r.goal.ok,r.ship).toBe(true);expect(r.m.count).toBe(1);expect(r.expansion).toBeNull();expect(r.goal.detail).toContain(r.ship+'：');for(const item of r.stock)expect(r.usage[item.name+'@@0']||0).toBeLessThanOrEqual(item.count);}
});

test('automatic night CI shows required carrier crew shortages and preserves explicit policy constraints',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{
  const ship={ship:'赤城改',items:[{name:'F6F-3N',slotIndex:0},{name:'TBM-3D',slotIndex:1}],expansion:null},plan={map:'1-1',index:0,ships:[ship],suggestion:{slots:[]}},requirements=[{kind:'cap-night-auto',label:'自動CI',minCount:1}];localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'F6F-3N',count:1},{name:'TBM-3D',count:1}]));plan.assessment={requirements,measure:hdOCMeasure(plan,requirements)};const before=JSON.stringify(plan),stock=hdSECapabilityStock(plan,'cap-night-auto'),options=hdFLSetRemedies(plan,plan.assessment.measure.goals[0]);localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'torpedo'}));return {goal:plan.assessment.measure.goals[0],stock,options,unchanged:JSON.stringify(plan)===before,kind:hdSENightKind('1-1'),explicit:hdSECapabilityMeasure({ships:[{ship:'Saratoga Mk.II',items:[{name:'F6F-3N',slotIndex:0},{name:'TBM-3D',slotIndex:1}],expansion:null}]},'cap-night-torpedo')};
 });
 expect(r.goal.ok).toBe(false);expect(r.stock.complete).toBe(false);expect(r.options.length).toBeGreaterThan(0);expect(r.options.every(x=>!x.available)).toBe(true);expect(r.options.some(x=>x.missing.some(m=>/夜間作戦航空要員/.test(m.name)))).toBe(true);expect(r.unchanged).toBe(true);expect(r.kind).toBe('cap-night-torpedo');expect(r.explicit.count).toBe(0);expect(r.explicit.unresolved).toBe(true);
});

test('automatic night CI follows sea-area needs and does not add a CI goal to non-night or land maps',async({page})=>{
 await boot(page);
 const r=await page.evaluate(()=>{const needs=hdMapEquipNeeds;localStorage.removeItem(HD_SE_NIGHT_POLICY_KEY);try{hdMapEquipNeeds=()=>({needs:[],adv:{}});const none=hdSEProfiles('1-1');hdMapEquipNeeds=()=>({needs:[{id:'夜戦'},{id:'対地'}],adv:{}});const land=hdSEProfiles('1-1');hdMapEquipNeeds=()=>({needs:[{id:'夜戦'}],adv:{}});const night=hdSEProfiles('1-1');return {none,land,night};}finally{hdMapEquipNeeds=needs}});
 expect(r.none.some(x=>x.kind.startsWith('cap-night-'))).toBe(false);expect(r.land.some(x=>x.kind.startsWith('cap-night-'))).toBe(false);expect(r.night.some(x=>x.kind==='cap-night-auto')).toBe(true);
});

test('automatic night CI mobile control returns from an explicit policy to the compatible owned set',async({page})=>{
 test.setTimeout(90000);await boot(page);await page.waitForFunction(()=>typeof hdOCSearchSteps==='function');
 await page.evaluate(()=>{
  const ship='赤城改',masterId=hdShipDbMasterRowFor(hdFEFindShip(ship)).id;localStorage.setItem('harbordesk-equipment-v1',JSON.stringify([{name:'F6F-3N',count:1},{name:'TBM-3D',count:1},{name:'夜間作戦航空要員',count:1}]));localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{name:ship,masterId,gameShipId:895,level:90,gameSlotEx:0}]));localStorage.setItem(HD_SE_NIGHT_POLICY_KEY,JSON.stringify({'1-1':'cv-fighter2'}));hdMapEquipNeeds=()=>({needs:[{id:'夜戦'}],adv:{}});hdFSMap=()=> '1-1';hdFSPlans=()=>[{index:0,preset:{name:'auto fixture'},needs:[],slots:[{profile:{row:{name:ship,masterId,gameShipId:895,level:90},type:'正規空母',roles:[]}}]}];const card=document.createElement('article');card.id='auto-ci-policy-test';card.className='hd-fs-card';card.innerHTML='<button data-hd-fl-generate="0">自動配備</button><div class="hd-fl-host"></div>';document.body.appendChild(card);hdFLRender(0,card);
 });
 const card=page.locator('#auto-ci-policy-test');await card.locator('[data-hd-night-policy]').selectOption('auto');await expect.poll(()=>page.evaluate(()=>{const p=HD_FL_CACHE['1-1:0'];return p&&!p.searching&&p.assessment.measure.goals.find(g=>g.kind==='cap-night-auto')?.ok})).toBe(true);await expect(card).toContainText('夜戦CI（自動・艦種別）');await expect(card).toContainText('赤城改：夜間戦闘機1＋夜間攻撃機1CI');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.evaluate(()=>hdSENightPolicy('1-1'))).toBe('auto');
});
