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
 await page.evaluate(()=>{hdEnsureEquipmentCatalog();document.getElementById('hdEquipCatalogSearch').value='零式艦戦21型';hdRenderEquipmentCatalog()});
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
