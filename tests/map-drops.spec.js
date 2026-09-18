const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('[data-world="1"]')).toBeAttached();
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await expect(page.locator('[data-world="1"]')).toBeVisible();
}

async function selectMap(page, world, map) {
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator(`[data-world="${world}"]`).click();
  await page.locator(`[data-map="${map}"]`).click();
  await expect(page.locator(`[data-map="${map}"]`)).toHaveClass(/active/);
  await page.locator('[data-map-tab="drop"]').click();
  await expect(page.locator('[data-map-pane="drop"]')).toHaveClass(/active/);
}

test('every selectable normal map has map drop data including 5-6', async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(() => {
    const maps = Object.values(MAPS).flat();
    return {
      maps,
      missing: maps.filter(m => !HD_MAP_DROP_DATA[m]),
      has56: MAPS['5'].includes('5-6'),
      checked: HD_MAP_DROP_CHECKED
    };
  });
  expect(result.maps).toHaveLength(37);
  expect(result.missing).toEqual([]);
  expect(result.has56).toBeTruthy();
  expect(result.checked).toBe('2026-09-18');
});

test('1-5 drop tab shows boss submarines coastal defense ships and Akashi', async ({ page }) => {
  await boot(page);
  await selectMap(page, '1', '1-5');

  const pane = page.locator('[data-map-pane="drop"]');
  await expect(pane).toContainText('J ボス');
  await expect(pane).toContainText('第四号海防艦');
  await expect(pane).toContainText('第二十二号海防艦');
  await expect(pane).toContainText('伊201');
  await expect(pane).toContainText('伊203');
  await expect(pane).toContainText('明石');
  await expect(pane.locator('a.guide-link')).toContainText('Wiki全表');
});

test('5-6 drop tab supports all three boss stages', async ({ page }) => {
  await boot(page);
  await selectMap(page, '5', '5-6');

  const pane = page.locator('[data-map-pane="drop"]');
  await expect(pane).toContainText('G 第1ボス');
  await expect(pane).toContainText('N 第2ボス');
  await expect(pane).toContainText('Z 第3ボス');
  await expect(pane).toContainText('Northampton');
  await expect(pane).toContainText('Fletcher');
  await expect(pane).toContainText('Saratoga');
  await expect(pane).toContainText('Hornet');
  await expect(pane).toContainText('宗谷');
});

test('drop chips show roster ownership and add a ship to hunting targets', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'kami',name:'神威',level:'80',remodel:'',gear:'',memo:'',tags:[]}
    ]));
    localStorage.removeItem('harbordesk-drop-hunts-v1');
  });
  await selectMap(page, '7', '7-4');

  const pane = page.locator('[data-map-pane="drop"]');
  const kamoi = pane.locator('[data-hd-map-drop-ship="神威"]').first();
  await expect(kamoi).toHaveClass(/owned/);
  await expect(kamoi).toContainText('所持');
  await kamoi.click();

  const hunts = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]'));
  expect(hunts.some(x => x.ship === '神威' && x.map === '7-4')).toBeTruthy();

  const activeChip = page.locator('[data-map-pane="drop"] [data-hd-map-drop-ship="神威"]').first();
  await expect(activeChip).toHaveClass(/hunting/);
  await expect(activeChip).toContainText('掘り中');
});


test('map drop collection stats count duplicate ships only once', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'kami',name:'神威',level:'80',remodel:'',gear:'',memo:'',tags:[]}
    ]));
  });

  const stats = await page.evaluate(() => hdMapDropStats('7-4'));
  expect(stats.total).toBe(14);
  expect(stats.owned).toBe(1);
  expect(stats.missing).toBe(13);
  expect(stats.featured).toBe(9);
  expect(stats.rate).toBe(7);
});

test('map drop filters switch between unowned and featured ships', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'kami',name:'神威',level:'80',remodel:'',gear:'',memo:'',tags:[]}
    ]));
    localStorage.removeItem('harbordesk-map-drop-view-v1');
  });
  await selectMap(page, '7', '7-4');

  let pane = page.locator('[data-map-pane="drop"]');
  await expect(pane).toContainText('収録艦 所持率');
  await expect(pane).toContainText('1 / 14隻・7%');
  await expect(pane).toContainText('未所持 13');
  await expect(pane).toContainText('注目艦 9');

  await pane.locator('[data-hd-map-drop-view="missing"]').click();
  pane = page.locator('[data-map-pane="drop"]');
  await expect(pane.locator('[data-hd-map-drop-view="missing"]')).toHaveClass(/active/);
  await expect(pane.locator('[data-hd-map-drop-ship="神威"]')).toHaveCount(0);
  await expect(pane.locator('[data-hd-map-drop-ship="対馬"]').first()).toBeVisible();

  await pane.locator('[data-hd-map-drop-view="featured"]').click();
  pane = page.locator('[data-map-pane="drop"]');
  await expect(pane.locator('[data-hd-map-drop-view="featured"]')).toHaveClass(/active/);
  await expect(pane.locator('[data-hd-map-drop-ship="春日丸"]').first()).toBeVisible();
  await expect(pane.locator('[data-hd-map-drop-ship="瑞鶴"]')).toHaveCount(0);
});

test('map drop view preference is stored independently for each map', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => localStorage.removeItem('harbordesk-map-drop-view-v1'));

  await selectMap(page, '1', '1-5');
  await page.locator('[data-map-pane="drop"] [data-hd-map-drop-view="missing"]').click();

  await page.locator('[data-map="1-4"]').click();
  await page.locator('[data-map-tab="drop"]').click();
  await expect(page.locator('[data-map-pane="drop"] [data-hd-map-drop-view="all"]')).toHaveClass(/active/);

  await page.locator('[data-map="1-5"]').click();
  await expect(page.locator('[data-map-pane="drop"]')).toHaveClass(/active/);
  await expect(page.locator('[data-map-pane="drop"] [data-hd-map-drop-view="missing"]')).toHaveClass(/active/);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-map-drop-view-v1') || '{}'));
  expect(stored['1-5']).toBe('missing');
  expect(stored['1-4']).toBeUndefined();
});


test('full reverse index includes ships from all map drop data', async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(() => {
    const rows = hdMapDropReverseIndex();
    const by = name => rows.find(x => x.ship === name);
    return {
      total: rows.length,
      fletcher: by('Fletcher'),
      saratoga: by('Saratoga'),
      maps: [...new Set(rows.flatMap(x => x.locations.map(l => l.map)))]
    };
  });

  expect(result.total).toBeGreaterThan(100);
  expect(result.maps).toHaveLength(37);
  expect(result.fletcher).toBeTruthy();
  expect(result.fletcher.locations.map(x => x.node)).toEqual(expect.arrayContaining(['N 第2ボス', 'Z 第3ボス']));
  expect(result.saratoga).toBeTruthy();
  expect(result.saratoga.locations.some(x => x.map === '5-6' && x.node === 'Z 第3ボス')).toBeTruthy();
});

test('reverse lookup UI searches ships that were not in the old curated rare list', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    hdEnsureDropDb?.();
    hdWSShowElement?.('dropHuntingDb', false);
  });

  const search = page.locator('#hdDropSearch');
  await expect(search).toBeVisible();
  await search.fill('Fletcher');

  const list = page.locator('#hdDropDbList');
  await expect(list).toContainText('Fletcher');
  await expect(list).toContainText('5-6 N 第2ボス');
  await expect(list).toContainText('5-6 Z 第3ボス');
  await expect(list).toContainText('注目ドロップ');
});

test('reverse lookup can add a full-index ship directly to hunting targets', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-drop-hunts-v1');
    hdEnsureDropDb?.();
    hdWSShowElement?.('dropHuntingDb', false);
  });

  const search = page.locator('#hdDropSearch');
  await search.fill('Saratoga');
  const card = page.locator('#hdDropDbList .hd-drop-card').filter({ hasText: 'Saratoga' });
  await expect(card).toBeVisible();
  await card.locator('[data-hd-drop-target]').first().click();

  const hunts = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]'));
  expect(hunts.some(x => x.ship === 'Saratoga' && x.map === '5-6' && x.node === 'Z 第3ボス')).toBeTruthy();
});
