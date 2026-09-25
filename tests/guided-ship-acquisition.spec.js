const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });

async function openApp(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof homeGuideRender === 'function' && typeof hdShipDbAcquisitionRows === 'function' && typeof hdDropAllTargets === 'function' && typeof HD_CONSTRUCTION_RECIPES !== 'undefined', null, { timeout: 30000 });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
}

test('strategy goals: categories, custom goals and completion survive reload', async ({ page }) => {
  await openApp(page);
  const groups=page.locator('#homeGuideSteps details.home-guide-group');
  await expect(groups).toHaveCount(6);
  await expect(groups.nth(0)).toContainText('未攻略海域');
  await expect(groups.nth(1)).toContainText('必要な装備');
  await expect(groups.nth(2)).toContainText('単発任務');
  await expect(groups.nth(3)).toContainText('艦娘を育てる');
  await expect(page.locator('#homeGuideCount')).toContainText('目標 0/');
  await groups.first().locator('[data-home-guide-toggle]').first().click();
  await expect(page.locator('#homeGuideCount')).toContainText('目標 1/');
  await groups.nth(1).locator('summary').click();
  await groups.nth(1).locator('input[name=title]').fill('水戦を2機用意');
  await groups.nth(1).locator('select[name=scope]').selectOption('map');
  await groups.nth(1).locator('button[type=submit]').click();
  await expect(groups.nth(1)).toContainText('水戦を2機用意');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#homeGuideCount')).toContainText('目標 1/');
  await groups.nth(1).locator('summary').click();
  await expect(groups.nth(1)).toContainText('水戦を2機用意');
  await groups.first().locator('[data-home-guide-toggle]').first().click();
  await expect(page.locator('#homeGuideCount')).toContainText('目標 0/');
});

test('strategy goals: per-map progress and cleared maps remain separate', async ({ page }) => {
  await openApp(page);
  await page.locator('#homeGuideMapSelect').selectOption('2-4');
  await page.locator('[data-group=map] [data-home-guide-toggle]').first().click();
  await page.locator('[data-home-guide-clear]').click();
  await expect(page.locator('#homeGuideCount')).toContainText('海域 1/');
  await page.locator('#homeGuideMapSelect').selectOption('2-5');
  await expect(page.locator('[data-group=map] [data-home-guide-toggle]').first()).toHaveAttribute('aria-pressed','false');
  await page.locator('#homeGuideMapSelect').selectOption('2-4');
  await expect(page.locator('[data-group=map] [data-home-guide-toggle]').first()).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-home-guide-clear]')).toHaveAttribute('aria-pressed','true');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#homeGuideMapSelect')).toHaveValue('2-4');
  await expect(page.locator('[data-home-guide-clear]')).toHaveAttribute('aria-pressed','true');
});

test('strategy goals: next uncleared map crosses world boundaries', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {const state=homeGuideState();state.cleared=['1-1','1-2','1-3','1-4','1-5','1-6'];homeGuideSave(state)});
  await expect(page.locator('[data-home-guide-next]')).toContainText('2-1');
  await page.locator('[data-home-guide-next]').click();
  await expect(page.locator('#homeGuideMapSelect')).toHaveValue('2-1');
  await expect(page.locator('#worldPicker .world-chip.active')).toHaveAttribute('data-world','2');
  await expect(page.locator('#mapPicker .map-button.active')).toHaveAttribute('data-map','2-1');
});

test('strategy integration: prerequisite maps and quests are specific to the selected map', async ({ page }) => {
  await openApp(page);
  const prerequisites=await page.evaluate(() => ({
    west:hdStrategyCandidates('4-5').filter(x=>x.source==='unlock').map(x=>x.ref),
    center:hdStrategyCandidates('6-5').filter(x=>x.source==='oneTimeQuest').map(x=>x.ref),
    southwest:hdStrategyCandidates('7-4').filter(x=>x.source==='oneTimeQuest').map(x=>x.ref),
    quests:hdStrategyCandidates('6-5').filter(x=>x.source==='periodicQuest').map(x=>x.ref)
  }));
  expect(prerequisites.west).toEqual(['4-4','5-1']);
  expect(prerequisites.center).toContain('F43');
  expect(prerequisites.southwest).toContain('B175');
  expect(prerequisites.quests).toEqual(expect.arrayContaining(['Bq2','Bq10']));
  await page.locator('#homeGuideMapSelect').selectOption('4-5');
  await expect(page.locator('.hd-strategy-preview')).toContainText('5-1 のクリアを確認');
  await expect(page.locator('.hd-strategy-preview')).not.toContainText('中部海域「基地航空隊」展開！');
});

test('strategy integration: navigator imports goals once and preserves them on reload', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { hdMSNOpen('6-5'); });
  await expect(page.locator('[data-hd-msn-to-todo="6-5"]')).toBeVisible();
  await page.locator('[data-hd-msn-to-todo="6-5"]').click();
  await expect(page.locator('#homeGuideMapSelect')).toHaveValue('6-5');
  const first=await page.evaluate(() => homeGuideState().custom.filter(x=>x.map==='6-5').map(x=>x.sourceKey));
  expect(first).toContain('6-5:oneTimeQuest:F43');
  expect(new Set(first).size).toBe(first.length);
  await expect(page.locator('[data-hd-strategy-import-all="6-5"]')).toBeDisabled();
  await page.evaluate(() => hdStrategyImportMap('6-5'));
  const second=await page.evaluate(() => homeGuideState().custom.filter(x=>x.map==='6-5').map(x=>x.sourceKey));
  expect(second).toEqual(first);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
  await expect(page.locator('#homeGuideMapSelect')).toHaveValue('6-5');
  await page.locator('[data-group=quest] summary').click();
  await expect(page.locator('[data-group=quest]')).toContainText('中部海域「基地航空隊」展開！');
});

test('strategy integration: equipment counts and ship levels refresh imported goals', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-procurement-v1',JSON.stringify([{
      map:'3-2',gearItems:[{target:'22号対水上電探',wanted:'22号対水上電探',needed:2,kind:'電探',methodKey:'develop'}],kinds:[]
    }]));
    localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify([{id:'strategy-test-ship',name:'吹雪',level:42,type:'駆逐艦'}]));
    localStorage.setItem('harbordesk-training-plans-v1',JSON.stringify({'strategy-test-ship':{active:true,target:70,priority:3}}));
    hdSelectGuideMap('3-2');homeGuideRender();
  });
  await expect(page.locator('.hd-strategy-preview')).toContainText('あと 28');
  await expect(page.locator('.hd-strategy-preview')).toContainText('22号対水上電探');
  await page.locator('[data-hd-strategy-import-all="3-2"]').click();
  await page.locator('[data-group=level] summary').click();
  await expect(page.locator('[data-group=level]')).toContainText('現在 Lv.42 / 目標 Lv.70');
  await page.evaluate(() => {
    const ships=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));ships[0].level=70;
    localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(ships));homeGuideRender();
  });
  await expect(page.locator('[data-group=level] .home-guide-live-state.ready')).toContainText('Lv目標達成');
  const gear=await page.evaluate(() => hdStrategyGearRows('3-2').find(x=>x.target==='22号対水上電探'));
  expect(gear).toMatchObject({needed:2,shortfall:2});
});

test('strategy integration: verified map prerequisites skip recorded clears', async ({ page }) => {
  await openApp(page);
  expect(await page.evaluate(() => hdStrategyCandidates('3-2').filter(x=>x.source==='unlock').map(x=>x.ref))).toEqual(['3-1','1-5']);
  expect(await page.evaluate(() => hdStrategyCandidates('7-5').filter(x=>x.source==='unlock').map(x=>x.ref))).toEqual(['7-4']);
  await page.evaluate(() => {
    const state=homeGuideState();state.cleared=['1-5'];homeGuideSave(state);hdSelectGuideMap('3-2');
  });
  await expect(page.locator('[data-hd-strategy-import="3-2:unlock:1-5"]')).toBeDisabled();
  await expect(page.locator('[data-hd-strategy-import="3-2:unlock:1-5"]')).toContainText('クリア記録済み');
  await page.locator('[data-hd-strategy-import-all="3-2"]').click();
  const refs=await page.evaluate(() => homeGuideState().custom.filter(x=>x.map==='3-2'&&x.source==='unlock').map(x=>x.ref));
  expect(refs).toEqual(['3-1']);
});

test('strategy integration: monthly 5-6 prerequisite is not satisfied by past clear', async ({ page }) => {
  await openApp(page);
  const result=await page.evaluate(() => {
    const task=hdStrategyCandidates('5-6').find(x=>x.source==='unlock');
    return {ref:task.ref,detail:task.detail,view:hdStrategyTaskView(task,hdStrategyCandidates('5-6'),['5-5'])};
  });
  expect(result.ref).toBe('5-5');
  expect(result.detail).toContain('今月');
  expect(result.view.ready).toBe(false);
  expect(result.view.status).toContain('今月');
});

test('ship database: acquisition shows sourced drops and exact construction recipes', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible();
  await page.locator('[data-hd-ws-group="fleet"]').click();
  await page.evaluate(() => { hdEnsureShipDatabase(); window.hdWSShowElement?.('shipDatabase', true); hdRenderShipDatabase(); });
  await expect(page.locator('#shipDatabase')).toBeVisible();
  await page.locator('[data-hd-shipdb-compact]').click();
  await expect(page.locator('#hdShipDbList')).not.toHaveClass(/hd-compact/);
  const search = page.locator('#hdShipDbSearch');
  await search.fill('明石');
  await page.waitForTimeout(180);
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').first()).toContainText('明石');
  const drops = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await expect(drops).toBeVisible();
  await drops.evaluate(el => { el.open = true; });
  await expect(drops).toHaveJSProperty('open', true);
  await expect(drops).toContainText('1-5');
  await expect(drops).toContainText('ドロップ海域');
  const dropButton=drops.locator('[data-hd-shipdb-acquire-drop]');
  await expect(dropButton).toBeVisible();
  await dropButton.click();
  await expect(page.locator('#hdDropSearch')).toHaveValue('明石');
  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', false));
  await expect(page.locator('#shipDatabase')).toBeVisible();
  await search.fill('大和');
  await page.waitForTimeout(180);
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').first()).toContainText('大和');
  const build = page.locator('#hdShipDbList .hd-shipdb-acquisition').first();
  await expect(build).toBeVisible();
  await build.evaluate(el => { el.open = true; });
  await expect(build).toHaveJSProperty('open', true);
  await expect(build).toContainText('大型・大和型');
  const buildButton=build.locator('[data-hd-shipdb-acquire-build]');
  await expect(buildButton).toBeVisible();
  await buildButton.click();
  await expect(page.locator('#hdConstructionSearch')).toHaveValue('大和');
  await expect(page.locator('[data-hd-build-mode="large"]')).toHaveClass(/active/);
  await expect.poll(() => page.evaluate(() => {
    const v=JSON.parse(sessionStorage.getItem('harbordesk-session-construction-view-v1')||'{}');
    return {query:v.query||'',mode:v.mode||''};
  })).toEqual({query:'大和',mode:'large'});

  await page.evaluate(() => {
    document.getElementById('constructionDb')?.remove();
    window.hdEnsureConstructionSection?.();
  });
  await expect(page.locator('#hdConstructionSearch')).toHaveValue('大和');
  await expect(page.locator('[data-hd-build-mode="large"]')).toHaveClass(/active/);
  const savedConstructionView = await page.evaluate(() => JSON.parse(sessionStorage.getItem('harbordesk-session-construction-view-v1') || '{}'));
  expect(savedConstructionView).toMatchObject({ query:'大和', mode:'large' });

  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', true));
  await search.fill('1-5');
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').filter({ hasText: '明石' }).first()).toContainText('明石');
  await search.fill('大和型・大型戦艦');
  await expect(page.locator('#hdShipDbList .hd-shipdb-head strong').filter({ hasText: '大和' }).first()).toContainText('大和');
  const rows = await page.evaluate(() => ({ known: hdShipDbAcquisitionRows('明石').drop?.ship, unknown: hdShipDbAcquisitionRows('未収録艦名').drop, hasBuild: hdShipDbAcquisitionRows('大和').recipes.length > 0 }));
  expect(rows).toEqual({ known: '明石', unknown: null, hasBuild: true });
});
