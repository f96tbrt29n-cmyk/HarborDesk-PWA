const { test, expect } = require('@playwright/test');

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

async function openGuideWorkspace(page) {
  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible({ timeout: 5000 });
}

test('release smoke: expedition time presets and custom hours remain editable on mobile', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#hdOptExpHours')).toHaveCount(1, { timeout: 30000 });
  await page.evaluate(() => window.hdWSShowElement('expeditionOptimizer', true));

  await page.locator('[data-opt-exp-minutes="120"]').click();
  await expect(page.locator('#hdOptExpDuration')).toHaveText('2時間以内の遠征');
  await expect(page.locator('[data-opt-exp-minutes="120"]')).toHaveAttribute('aria-pressed', 'true');

  const hours = page.locator('#hdOptExpHours');
  await hours.fill('');
  await hours.press('1');
  await hours.press('2');
  await expect(hours).toBeFocused();
  await expect(hours).toHaveValue('12');
  await page.locator('#hdOptExpMinutes').fill('30');
  await page.locator('#hdOptExpMinutes').press('Tab');
  await expect(page.locator('#hdOptExpDuration')).toHaveText('12時間30分以内の遠征');
  await expect(page.locator('#hdOptExpHours')).toHaveValue('12');
  await expect(page.locator('#hdOptExpMinutes')).toHaveValue('30');
});

test('release smoke: expedition recommendations show success levels and composition', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#hdOptExpRows')).toHaveCount(1, { timeout: 30000 });
  await page.evaluate(() => window.hdWSShowElement('expeditionOptimizer', true));
  await page.locator('#hdOptExpResource').selectOption('ammo');
  await page.locator('[data-opt-exp-minutes="240"]').click();

  const tokyo = page.locator('#hdOptExpRows article').filter({ hasText: '37 東京急行' });
  await expect(tokyo).toBeVisible();
  await expect(tokyo.locator('.hd-opt-exp-conditions')).toContainText('旗艦Lv50以上・艦隊合計Lv200以上');
  await expect(tokyo.locator('.hd-opt-exp-conditions')).toContainText('6隻以上・軽1＋駆5');
  await expect(tokyo.locator('.hd-opt-exp-conditions')).toContainText('搭載3隻以上・合計4個以上');

  const longDistance = page.locator('#hdOptExpRows article').filter({ hasText: '02 長距離練習航海' });
  await expect(longDistance.locator('.hd-opt-exp-conditions')).toContainText('旗艦Lv2以上');
  await expect(longDistance.locator('.hd-opt-exp-conditions')).toContainText('4隻以上・指定なし');
});

test('release smoke: app boots with core modules and master data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => ({
    detailed: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.ships || {}).length,
    allShips: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {}).length,
    equipment: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment || {}).length,
    workspace: typeof window.hdWSApply,
    workspaceShow: typeof window.hdWSShowElement,
    workspaceReveal: typeof window.hdWSRevealElement,
    quickNav: typeof window.hdQNCategoryRows,
    personalHome: typeof window.hdPHRender,
    importer: typeof window.hdKcCurrentFleets
  }));

  expect(data.detailed).toBeGreaterThanOrEqual(100);
  expect(data.allShips).toBeGreaterThanOrEqual(800);
  expect(data.equipment).toBeGreaterThanOrEqual(500);
  expect(data.workspace).toBe('function');
  expect(data.workspaceShow).toBe('function');
  expect(data.workspaceReveal).toBe('function');
  expect(data.quickNav).toBe('function');
  expect(data.personalHome).toBe('function');
  expect(data.importer).toBe('function');
  expect(errors).toEqual([]);
});

test('release smoke: 5-6 stays registered when extended map details fail to load', async ({ page }) => {
  const errors = [];
  await page.route('**/map-details-57.js*', route => route.abort());
  await boot(page, errors);

  await openGuideWorkspace(page);
  await page.locator('[data-world="5"]').click();

  await expect(page.locator('[data-map="5-6"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('release smoke: workspace navigation changes location and returns home', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.hdWSApply?.('fleet', 'roster', { ignorePin: true });
    const fleet = window.hdWSCurrentLocation?.();
    window.hdWSApply?.('home', 'home', { ignorePin: true });
    const home = window.hdWSCurrentLocation?.();
    return { fleet, home };
  });

  expect(data.fleet).toMatchObject({ group: 'fleet', section: 'roster' });
  expect(data.home?.group).toBe('home');
  expect(errors).toEqual([]);
});

test('release smoke: explicit workspace navigation wins over deferred startup restore', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const result = await page.evaluate(() => {
    sessionStorage.setItem('harbordesk-update-return-v1', JSON.stringify({
      group: 'guide',
      section: 'guide',
      at: Date.now()
    }));
    const opened = window.hdWSRevealElement?.('equipmentBook', false, { history: false });
    const before = window.hdWSCurrentLocation?.();
    const restored = window.hdWSRestoreStartupContext?.();
    const after = window.hdWSCurrentLocation?.();
    return { opened, before, restored, after };
  });

  expect(result.opened).toBe(true);
  expect(result.before).toMatchObject({ group: 'arsenal', section: 'equipmentBook' });
  expect(result.restored).toBe(false);
  expect(result.after).toMatchObject({ group: 'arsenal', section: 'equipmentBook' });
  await expect(page.locator('#equipmentBook')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: workspace target staged before tabs load is restored after late startup', async ({ page }) => {
  const errors = [];
  let releaseWorkspace = false;

  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  await page.route('**/workspace-tabs.js*', async route => {
    while (!releaseWorkspace) await new Promise(resolve => setTimeout(resolve, 25));
    await route.continue();
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    typeof window.hdRevealWorkspaceTarget === 'function' &&
    !!document.getElementById('equipmentBook') &&
    typeof window.hdWSApply !== 'function',
    null,
    { timeout: 30000 }
  );

  const staged = await page.evaluate(() => {
    const opened = window.hdRevealWorkspaceTarget('equipmentBook', false);
    return {
      opened,
      pending: window.__HD_PENDING_WORKSPACE_TARGET,
      saved: JSON.parse(localStorage.getItem('harbordesk-workspace-tabs-v1') || '{}')
    };
  });

  expect(staged.opened).toBe(true);
  expect(staged.pending).toMatchObject({ group: 'arsenal', section: 'equipmentBook' });
  expect(staged.saved).toMatchObject({ group: 'arsenal' });
  expect(staged.saved.sections?.arsenal).toBe('equipmentBook');

  releaseWorkspace = true;
  await page.waitForFunction(() =>
    typeof window.hdWSApply === 'function' &&
    window.hdWSCurrentLocation?.().group === 'arsenal' &&
    window.hdWSCurrentLocation?.().section === 'equipmentBook',
    null,
    { timeout: 30000 }
  );

  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });
  const pending = await page.evaluate(() => window.__HD_PENDING_WORKSPACE_TARGET || null);
  expect(pending).toBeNull();
  expect(errors).toEqual([]);
});


test('release smoke: personalized home renders operational cards', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.evaluate(async () => {
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
  });

  await expect(page.locator('#hdPersonalHome')).toHaveCount(1);
  for (const selector of [
    '.hd-ph-coverage-block',
    '.hd-ph-attention-block',
    '.hd-ph-next-block',
    '.hd-ph-resource-block',
    '.hd-ph-fleet-block',
    '.hd-ph-condition-block'
  ]) {
    await expect(page.locator(selector)).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('release smoke: game sync fills ship and equipment ledgers from latest snapshots', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcParseImport === 'function' &&
    typeof window.hdKcPreviewData === 'function' &&
    typeof window.hdKcApplyImport === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-ship-roster-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    localStorage.removeItem('harbordesk-kancolle-equipment-detail-v1');
    localStorage.removeItem('harbordesk-kancolle-sync-v1');

    const port = ships => ({
      api_result: 1,
      api_result_msg: '成功',
      api_data: {
        api_ship: ships,
        api_deck_port: [{ api_id: 1, api_name: '第一艦隊', api_mission: [0,0,0,0], api_ship: ships.map(x => x.api_id) }],
        api_ndock: [],
        api_material: []
      }
    });
    const ship = (gameId, masterId, level, slots = []) => ({
      api_id: gameId,
      api_ship_id: masterId,
      api_lv: level,
      api_nowhp: 13,
      api_maxhp: 13,
      api_cond: 49,
      api_locked: 1,
      api_sally_area: 0,
      api_slot: slots,
      api_slot_ex: 0
    });
    const slotPayload = rows => ({ api_result: 1, api_result_msg: '成功', api_data: rows });

    const raw = {
      format: 'harbordesk-kancolle-import',
      version: 2,
      source: 'userscripts',
      userscriptVersion: '1.0.10',
      records: [
        { endpoint: '/kcsapi/api_port/port', payload: port([ship(101, 2, 10, [401])]), at: 1 },
        { endpoint: '/kcsapi/api_get_member/slot_item', payload: slotPayload([{ api_id: 401, api_slotitem_id: 2, api_level: 0, api_alv: 0 }]), at: 2 },
        { endpoint: '/kcsapi/api_port/port', payload: port([ship(201, 1, 25, [501]), ship(299, 999999, 7, [])]), at: 3 },
        { endpoint: '/kcsapi/api_get_member/slot_item', payload: slotPayload([{ api_id: 501, api_slotitem_id: 1, api_level: 2, api_alv: 0 }]), at: 4 }
      ]
    };

    const parsed = window.hdKcParseImport(JSON.stringify(raw));
    const preview = window.hdKcPreviewData(parsed);
    const sync = window.hdKcApplyImport(preview, {
      ships: true,
      equipment: true,
      resources: false,
      fleets: false,
      timers: false,
      quests: false,
      sorties: false
    });
    const roster = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1') || '[]');
    const equipment = JSON.parse(localStorage.getItem('harbordesk-equipment-v1') || '[]');
    return {
      parsedShips: parsed.ships.size,
      parsedEquipment: parsed.slotItems.size,
      syncShips: sync.ships,
      syncEquipment: sync.equipment,
      syncEquipmentRows: sync.equipmentRows,
      syncEquipmentItems: sync.equipmentItems,
      syncIntegrity: sync.integrity,
      roster: roster.map(x => ({ gameShipId: x.gameShipId, masterId: x.masterId, name: x.name, level: x.level, gear: x.gear, type: x.type })),
      equipment: equipment.map(x => ({ masterEquipId: x.masterEquipId, name: x.name, count: x.count, star: x.star })),
      rosterCountText: document.getElementById('shipRosterCount')?.textContent || '',
      equipmentCountText: document.getElementById('equipmentLedgerCount')?.textContent || '',
      syncStatusText: document.getElementById('hdKcSyncLast')?.textContent || '',
      catalogAfterLedger: (() => {
        const ledger = document.getElementById('equipmentList');
        const catalog = document.getElementById('hdEquipmentCatalog');
        return !!(ledger && catalog && (ledger.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING));
      })()
    };
  });

  expect(data.parsedShips).toBe(2);
  expect(data.parsedEquipment).toBe(1);
  expect(data.syncShips).toBe(2);
  expect(data.syncEquipment).toBe(1);
  expect(data.syncEquipmentRows).toBe(1);
  expect(data.syncEquipmentItems).toBe(1);
  expect(data.syncIntegrity?.verified).toBe(true);
  expect(data.syncIntegrity?.ok).toBe(true);
  expect(data.syncIntegrity?.ships).toMatchObject({ source: 2, saved: 2, complete: true, ok: true });
  expect(data.syncIntegrity?.equipment).toMatchObject({ source: 1, saved: 1, rows: 1, complete: true, ok: true });
  expect(data.roster).toHaveLength(2);
  expect(data.roster.find(x => x.gameShipId === 201)).toMatchObject({
    masterId: 1,
    name: '睦月',
    level: 25
  });
  expect(data.roster.find(x => x.gameShipId === 201)?.gear).toContain('12cm単装砲 ★2');
  expect(data.roster.find(x => x.gameShipId === 299)).toMatchObject({
    masterId: 999999,
    name: '艦娘ID 999999',
    type: '未解決',
    level: 7
  });
  expect(data.roster.some(x => x.gameShipId === 101)).toBe(false);
  expect(data.equipment).toEqual([{
    masterEquipId: 1,
    name: '12cm単装砲',
    count: 1,
    star: 2
  }]);
  expect(data.rosterCountText).toContain('2');
  expect(data.equipmentCountText).toContain('1種類');
  expect(data.equipmentCountText).toContain('1個');
  expect(data.syncStatusText).toContain('装備台帳1種類・1個');
  expect(data.catalogAfterLedger).toBe(true);
  expect(errors).toEqual([]);
});



test('release smoke: linked game fleets follow the latest sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcParseImport === 'function' &&
    typeof window.hdKcPreviewData === 'function' &&
    typeof window.hdKcApplyImport === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '1-1': [{
        id: 'linked-fleet-1',
        name: 'ゲーム同期｜第一艦隊',
        ships: [{ ship: '古い艦', gameShipId: 999, masterId: 999, level: 1, nowHp: 1, maxHp: 1, cond: 1, gear: '古い装備' }],
        memo: '同期追従テスト',
        source: 'kancolle-import',
        sourceDeckId: 1,
        sourceSyncedAt: 1,
        createdAt: 1,
        updatedAt: 1
      }]
    }));

    const raw = {
      format: 'harbordesk-kancolle-import',
      version: 2,
      source: 'userscripts',
      userscriptVersion: '1.0.14',
      records: [
        {
          endpoint: '/kcsapi/api_port/port',
          at: 10,
          payload: {
            api_result: 1,
            api_result_msg: '成功',
            api_data: {
              api_ship: [{
                api_id: 201,
                api_ship_id: 1,
                api_lv: 37,
                api_nowhp: 9,
                api_maxhp: 13,
                api_cond: 58,
                api_locked: 1,
                api_sally_area: 0,
                api_slot: [501],
                api_slot_ex: 0
              }],
              api_deck_port: [{ api_id: 1, api_name: '第一艦隊', api_mission: [0,0,0,0], api_ship: [201] }],
              api_ndock: [],
              api_material: []
            }
          }
        },
        {
          endpoint: '/kcsapi/api_get_member/slot_item',
          at: 11,
          payload: {
            api_result: 1,
            api_result_msg: '成功',
            api_data: [{ api_id: 501, api_slotitem_id: 1, api_level: 4, api_alv: 0 }]
          }
        }
      ]
    };

    const preview = window.hdKcPreviewData(window.hdKcParseImport(JSON.stringify(raw)));
    const sync = window.hdKcApplyImport(preview, {
      ships: true,
      equipment: true,
      resources: false,
      fleets: true,
      timers: false,
      quests: false,
      sorties: false
    });
    const linked = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}')['1-1']?.[0];
    return { decks: sync.decks, linked };
  });

  expect(data.decks).toBe(1);
  expect(data.linked?.sourceDeckId).toBe(1);
  expect(data.linked?.sourceSyncedAt).toBeGreaterThan(1);
  expect(data.linked?.ships).toHaveLength(6);
  expect(data.linked?.ships?.[0]).toMatchObject({
    ship: '睦月',
    gameShipId: 201,
    masterId: 1,
    level: 37,
    nowHp: 9,
    maxHp: 13,
    cond: 58
  });
  expect(data.linked?.ships?.[0]?.gear).toContain('12cm単装砲 ★4');
  expect(errors).toEqual([]);
});



test('release smoke: saved fleet changes refresh readiness and preparation views', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const sources = await page.evaluate(async () => {
    const [custom, readiness, prep] = await Promise.all([
      fetch('./custom-fleets.js', { cache:'no-store' }).then(r => r.text()),
      fetch('./sortie-readiness.js', { cache:'no-store' }).then(r => r.text()),
      fetch('./sortie-preparation-sheet.js', { cache:'no-store' }).then(r => r.text())
    ]);
    return { custom, readiness, prep };
  });

  expect(sources.custom).toContain("window.dispatchEvent(new CustomEvent('hd:custom-fleets-changed'");
  expect(sources.readiness).toContain("window.addEventListener('hd:custom-fleets-changed',hdRenderSortieReadiness)");
  expect(sources.readiness).toContain("window.addEventListener('hd:kancolle-sync',hdRenderSortieReadiness)");
  expect(sources.prep).toContain("window.addEventListener('hd:custom-fleets-changed',hdSPSRender)");
  expect(errors).toEqual([]);
});



test('release smoke: sortie session follows same-page saved fleet changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () =>
    fetch('./sortie-session.js', { cache:'no-store' }).then(r => r.text())
  );
  expect(source).toContain("'hd:custom-fleets-changed'");
  expect(source).toContain("if(hdSSPostLoad()?.status==='reviewed')hdSSPostRefreshReview()");
  expect(errors).toEqual([]);
});



test('release smoke: editing a synced fleet preserves live metadata unless composition changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.cfMergeEditedShips === 'function');
  const data = await page.evaluate(() => {
    const previous = [{
      ship:'睦月', masterId:1, gear:'12cm単装砲 ★4',
      gameShipId:201, level:37, nowHp:9, maxHp:13, cond:58
    }];
    const same = window.cfMergeEditedShips(previous, [{ ship:'睦月', masterId:1, gear:'12cm単装砲 ★4' }]);
    const changed = window.cfMergeEditedShips(previous, [{ ship:'如月', masterId:2, gear:'12cm単装砲' }]);
    return { same, changed };
  });
  expect(data.same.changed).toBe(false);
  expect(data.same.ships[0]).toMatchObject({ ship:'睦月', gameShipId:201, level:37, nowHp:9, maxHp:13, cond:58 });
  expect(data.changed.changed).toBe(true);
  expect(data.changed.ships[0]).toMatchObject({ ship:'如月', masterId:2, gear:'12cm単装砲' });
  expect(data.changed.ships[0].gameShipId).toBeUndefined();
  expect(errors).toEqual([]);
});



test('release smoke: saved fleet cards show sync linkage state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () =>
    fetch('./custom-fleets.js', { cache:'no-store' }).then(r => r.text())
  );
  expect(source).toContain('ゲーム同期・第');
  expect(source).toContain('自動追従');
  expect(source).toContain('ゲーム同期から切り離し');
  expect(errors).toEqual([]);
});



test('release smoke: detached synced fleet can relink to latest game deck', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.cfRelinkFleet === 'function');
  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([{
      deckId:1, name:'第一艦隊', syncedAt:777,
      ships:[{ gameShipId:201, masterId:1, name:'睦月', level:40, nowHp:13, maxHp:13, cond:55, gear:'12cm単装砲 ★5' }]
    }]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '1-1':[{
        id:'detached-1', name:'ゲーム同期｜第一艦隊',
        source:'manual', detachedFromSource:'kancolle-import', detachedSourceDeckId:1,
        ships:[{ ship:'如月', masterId:2, gear:'手動装備' }], memo:'keep me'
      }]
    }));
    const result=window.cfRelinkFleet('1-1','detached-1');
    const row=JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1'))['1-1'][0];
    return { result, row };
  });
  expect(data.result.ok).toBe(true);
  expect(data.row).toMatchObject({ source:'kancolle-import', sourceDeckId:1, sourceSyncedAt:777, memo:'keep me' });
  expect(data.row.detachedFromSource).toBeUndefined();
  expect(data.row.ships[0]).toMatchObject({ ship:'睦月', gameShipId:201, level:40, nowHp:13, cond:55, gear:'12cm単装砲 ★5' });
  expect(errors).toEqual([]);
});



test('release smoke: complete equipment sync preserves user plans at zero owned count', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcParseImport === 'function' &&
    typeof window.hdKcPreviewData === 'function' &&
    typeof window.hdKcApplyImport === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'manual-plan', name:'61cm三連装魚雷', category:'魚雷', count:2, star:3, targetStar:10, assigned:'睦月', memo:'改修予定' },
      { id:'stale-sync', name:'12cm単装砲', category:'小口径主砲', count:1, star:0, targetStar:0, source:'kancolle-import' }
    ]));
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1', JSON.stringify([
      { gameEquipId:900, masterEquipId:1, star:0, alv:0 }
    ]));

    const raw = {
      format:'harbordesk-kancolle-import',
      version:2,
      records:[{
        endpoint:'/kcsapi/api_get_member/slot_item',
        at:1,
        payload:{
          api_result:1,
          api_result_msg:'成功',
          api_data:[{ api_id:501, api_slotitem_id:2, api_level:0, api_alv:0 }]
        }
      }]
    };
    const preview=window.hdKcPreviewData(window.hdKcParseImport(JSON.stringify(raw)));
    const sync=window.hdKcApplyImport(preview,{
      ships:false,equipment:true,resources:false,fleets:false,timers:false,quests:false,sorties:false
    });
    const rows=JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');
    const manual=rows.find(x=>x.id==='manual-plan');
    return {
      syncItems:sync.equipmentItems,
      rows,
      manual,
      stalePresent:rows.some(x=>x.id==='stale-sync')
    };
  });

  expect(data.syncItems).toBe(1);
  expect(data.manual).toMatchObject({
    name:'61cm三連装魚雷',
    count:0,
    star:3,
    targetStar:10,
    assigned:'睦月',
    memo:'改修予定',
    source:'equipment-plan',
    syncMissing:true,
    lastOwnedCount:2
  });
  expect(data.stalePresent).toBe(false);
  expect(data.rows.some(x=>x.source==='kancolle-import'&&x.count===1)).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: zero-count equipment plans do not inflate owned improvement', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name:'12cm単装砲', count:1, star:0, targetStar:0, source:'kancolle-import' },
      { name:'12cm単装砲', count:0, star:10, targetStar:10, source:'equipment-plan' }
    ]));
    return {
      owned:window.hdOwnedEquipSummary?.('12cm単装砲')||null,
      analyzer:window.hdEAownedMap?.().get('12cm単装砲')||null
    };
  });
  expect(data.owned).toMatchObject({ owned:true, count:1, maxStar:0, targetStar:10 });
  expect(data.analyzer).toMatchObject({ count:1, maxStar:0, targetStar:10 });
  expect(errors).toEqual([]);
});



test('release smoke: equipment plan returns to normal synced row when reacquired', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdKcMergeEquipment === 'function');

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {
        id:'planned-reacquire',
        name:'12cm単装砲',
        category:'小口径主砲',
        count:0,
        star:0,
        targetStar:6,
        memo:'再入手後に改修',
        source:'equipment-plan',
        syncMissing:true,
        lastOwnedCount:2
      }
    ]));
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1', '[]');
    const parsed={
      slotItems:new Map([[501,{api_id:501,api_slotitem_id:1,api_level:0,api_alv:0}]]),
      completeSlotItems:true
    };
    window.hdKcMergeEquipment(parsed);
    return JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]')[0];
  });

  expect(data).toMatchObject({
    id:'planned-reacquire',
    name:'12cm単装砲',
    count:1,
    star:0,
    targetStar:6,
    memo:'再入手後に改修',
    source:'kancolle-import'
  });
  expect(data.syncMissing).toBeUndefined();
  expect(data.lastOwnedCount).toBeUndefined();
  expect(errors).toEqual([]);
});



test('release smoke: equipment plan counts stay separate from owned inventory', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'owned', name:'12cm単装砲', category:'小口径主砲', count:2, star:0, targetStar:0, source:'kancolle-import' },
      { id:'plan', name:'61cm三連装魚雷', category:'魚雷', count:0, star:0, targetStar:10, source:'equipment-plan', memo:'改修予定' }
    ]));
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(), ships:1, equipmentRows:2, equipmentOwnedRows:1, equipmentPlanRows:1, equipmentItems:2,
      materials:0,decks:1,expeditions:0,docks:0,quests:0,sorties:0,
      coverage:{ships:true,equipment:true,resources:true,fleets:true,quests:true,docks:true,sorties:false},
      snapshot:{equipment:2,equipmentRows:2,equipmentOwnedRows:1,equipmentPlanRows:1}
    }));
    window.renderDashboard?.();
    window.renderEquipment?.();
    window.renderHomeDashboard?.();
    window.hdKcRenderSyncStatus?.();
    return {
      dashboard:document.getElementById('dashboardCards')?.textContent||'',
      ledgerCount:document.getElementById('equipmentLedgerCount')?.textContent||'',
      homeSummary:document.querySelector('[data-home-jump="equipmentBook"]')?.textContent||'',
      syncStatus:document.getElementById('hdKcSyncLast')?.textContent||''
    };
  });
  expect(data.dashboard).toContain('装備種類1');
  expect(data.dashboard).toContain('計画 1');
  expect(data.ledgerCount).toContain('1種類 / 2個');
  expect(data.ledgerCount).toContain('計画1件');
  expect(data.homeSummary).toContain('装備1');
  expect(data.homeSummary).toContain('計画1件');
  expect(data.syncStatus).toContain('装備台帳1種類・2個＋計画1');
  expect(errors).toEqual([]);
});



test('release smoke: ship roster distinguishes synced and manual entries', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'sync-ship', name:'睦月', masterId:1, type:'駆逐艦', level:80, source:'kancolle-import', gameShipId:101, syncedAt:Date.now() },
      { id:'manual-ship', name:'如月', masterId:2, type:'駆逐艦', level:50 }
    ]));
    window.initShipRoster?.();
    window.renderShipRoster?.();
    window.hdWSApply?.('fleet','roster',{ignorePin:true});
  });

  await expect(page.locator('[data-roster-source="sync"]')).toBeVisible();
  await expect(page.locator('.roster-source-badge.sync')).toHaveCount(1);
  await expect(page.locator('.roster-source-badge.manual')).toHaveCount(1);

  await page.locator('[data-roster-source="sync"]').click();
  await expect(page.locator('#shipRosterList .roster-card')).toHaveCount(1);
  await expect(page.locator('#shipRosterList')).toContainText('睦月');
  await expect(page.locator('#shipRosterList')).not.toContainText('如月');

  await page.locator('[data-roster-source="manual"]').click();
  await expect(page.locator('#shipRosterList .roster-card')).toHaveCount(1);
  await expect(page.locator('#shipRosterList')).toContainText('如月');
  await expect(errors).toEqual([]);
});



test('release smoke: live sync audit detects ledger drift after complete sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdKcLiveLedgerAudit === 'function');

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(),
      integrity:{
        verified:true,ok:true,
        ships:{source:2,saved:2,complete:true,ok:true},
        equipment:{source:3,saved:3,complete:true,ok:true}
      },
      coverage:{ships:true,equipment:true}
    }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'a',source:'kancolle-import',gameShipId:101,name:'睦月'},
      {id:'b',source:'kancolle-import',gameShipId:102,name:'如月'},
      {id:'m',source:'manual',name:'手動艦'}
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {id:'e1',source:'kancolle-import',name:'12cm単装砲',count:2},
      {id:'e2',source:'kancolle-import',name:'61cm三連装魚雷',count:1},
      {id:'p1',source:'equipment-plan',name:'電探計画',count:0,targetStar:10}
    ]));
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1', JSON.stringify([
      {gameEquipId:1},{gameEquipId:2},{gameEquipId:3}
    ]));
    const ok=window.hdKcLiveLedgerAudit();
    const roster=JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1'));roster.pop();roster.shift();
    localStorage.setItem('harbordesk-ship-roster-v1',JSON.stringify(roster));
    const equip=JSON.parse(localStorage.getItem('harbordesk-equipment-v1'));equip[0].count=1;
    localStorage.setItem('harbordesk-equipment-v1',JSON.stringify(equip));
    const drift=window.hdKcLiveLedgerAudit();
    window.hdKcRenderSyncStatus?.();
    return {
      ok,drift,
      headline:document.getElementById('hdKcSyncHeadline')?.textContent||'',
      coverage:document.getElementById('hdKcSyncCoverage')?.textContent||'',
      recommendation:document.getElementById('hdKcSyncRecommendation')?.textContent||''
    };
  });

  expect(data.ok.ok).toBe(true);
  expect(data.ok.ships).toMatchObject({current:2,source:2,ok:true});
  expect(data.ok.equipment).toMatchObject({current:3,source:3,detail:3,ok:true});
  expect(data.drift.ok).toBe(false);
  expect(data.drift.ships.current).toBe(1);
  expect(data.drift.equipment.current).toBe(2);
  expect(data.headline).toContain('差異あり');
  expect(data.coverage).toContain('現在の台帳に差異あり');
  expect(data.recommendation).toContain('再同期');
  expect(errors).toEqual([]);
});



test('release smoke: equipment ledger filters synced manual and plan rows', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {id:'sync',name:'12cm単装砲',category:'主砲',count:3,star:0,targetStar:0,source:'kancolle-import'},
      {id:'manual',name:'手動電探',category:'電探',count:1,star:0,targetStar:0},
      {id:'plan',name:'改修計画魚雷',category:'魚雷',count:0,star:2,targetStar:10,source:'equipment-plan'}
    ]));
    sessionStorage.removeItem('harbordesk-session-equipment-ledger-view-v1');
    window.renderEquipment?.();
    window.hdWSApply?.('arsenal','equipmentBook',{ignorePin:true});
  });

  await expect(page.locator('[data-eq-source="sync"]')).toContainText('同期済み 1');
  await expect(page.locator('[data-eq-source="manual"]')).toContainText('手動 1');
  await expect(page.locator('[data-eq-source="plan"]')).toContainText('計画 1');
  await expect(page.locator('.equipment-source-badge.sync')).toHaveCount(1);
  await expect(page.locator('.equipment-source-badge.manual')).toHaveCount(1);
  await expect(page.locator('.equipment-source-badge.plan')).toHaveCount(1);

  await page.locator('[data-eq-source="sync"]').click();
  await expect(page.locator('#equipmentList .advanced-card')).toHaveCount(1);
  await expect(page.locator('#equipmentList')).toContainText('12cm単装砲');
  await expect(page.locator('#equipmentList')).not.toContainText('手動電探');

  await page.locator('[data-eq-source="plan"]').click();
  await expect(page.locator('#equipmentList .advanced-card')).toHaveCount(1);
  await expect(page.locator('#equipmentList')).toContainText('改修計画魚雷');
  await expect(page.locator('#equipmentList')).not.toContainText('12cm単装砲');

  await page.locator('[data-eq-source="manual"]').click();
  await expect(page.locator('#equipmentList')).toContainText('手動電探');
  expect(errors).toEqual([]);
});



test('release smoke: ship roster saves immediately refresh sync audit', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.rosterSave === 'function' &&
    typeof window.hdKcRenderSyncStatus === 'function'
  );

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(),
      integrity:{
        verified:true,ok:true,
        ships:{source:1,saved:1,complete:true,ok:true},
        equipment:{source:0,saved:0,complete:true,ok:true}
      },
      coverage:{ships:true,equipment:true}
    }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'sync-ship',source:'kancolle-import',gameShipId:101,name:'睦月'}
    ]));
    localStorage.setItem('harbordesk-equipment-v1','[]');
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1','[]');
    window.hdKcRenderSyncStatus();
    const before=document.getElementById('hdKcSyncHeadline')?.textContent||'';
    window.rosterSave([]);
    await new Promise(resolve=>setTimeout(resolve,0));
    const after=document.getElementById('hdKcSyncHeadline')?.textContent||'';
    return {before,after};
  });

  expect(data.before).toContain('同期済み');
  expect(data.after).toContain('差異あり');
  expect(errors).toEqual([]);
});



test('release smoke: home surfaces live ledger drift and resync action', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcLiveLedgerAudit === 'function' &&
    typeof window.renderHomeDashboard === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(),
      ships:2,equipmentOwnedRows:1,equipmentItems:3,decks:1,
      coverage:{ships:true,equipment:true,resources:true,fleets:true,quests:true,docks:true},
      integrity:{
        verified:true,ok:true,
        ships:{source:2,saved:2,complete:true,ok:true},
        equipment:{source:3,saved:3,complete:true,ok:true}
      }
    }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'a',source:'kancolle-import',gameShipId:101,name:'睦月'}
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {id:'e1',source:'kancolle-import',name:'12cm単装砲',count:2}
    ]));
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1', JSON.stringify([
      {gameEquipId:1},{gameEquipId:2}
    ]));
    window.renderHomeDashboard();
  });

  await expect(page.locator('#homeGameSync')).toHaveClass(/drift/);
  await expect(page.locator('#homeGameSync')).toContainText('台帳差異');
  await expect(page.locator('#homeGameSync')).toContainText('艦娘 1/2隻');
  await expect(page.locator('#homeGameSync')).toContainText('装備 2/3個');
  await expect(page.locator('#homeNextAction')).toContainText('台帳を再同期する');
  await expect(page.locator('#homeNextAction')).toContainText('艦娘 1/2隻');
  expect(errors).toEqual([]);
});



test('release smoke: home rerenders when ship roster changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () =>
    fetch('./home-dashboard.js', { cache:'no-store' }).then(r => r.text())
  );
  expect(source).toContain("window.addEventListener('hd:ship-identity-changed',renderHomeDashboard)");
  expect(source).toContain("window.addEventListener('hd:equipment-changed',renderHomeDashboard)");
  expect(errors).toEqual([]);
});



test('release smoke: userscript bridge imports without URL payload limits', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcHandleBridgeImport === 'function' &&
    typeof window.hdKcBridgeOriginAllowed === 'function'
  );

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-ship-roster-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    const raw=JSON.stringify({
      format:'harbordesk-kancolle-import',
      version:2,
      userscriptVersion:'1.0.14',
      records:[
        {endpoint:'/kcsapi/api_port/port',at:1,payload:{api_result:1,api_data:{
          api_ship:[{api_id:101,api_ship_id:1,api_lv:20,api_nowhp:13,api_maxhp:13,api_cond:49,api_slot:[501,-1,-1],api_slot_ex:0}],
          api_deck_port:[{api_id:1,api_name:'第一艦隊',api_ship:[101,-1,-1,-1,-1,-1],api_mission:[0,0,0,0]}],
          api_material:[]
        }}},
        {endpoint:'/kcsapi/api_get_member/slot_item',at:2,payload:{api_result:1,api_data:[
          {api_id:501,api_slotitem_id:1,api_level:0,api_alv:0}
        ]}}
      ]
    });
    const sync=await window.hdKcHandleBridgeImport(raw);
    return {
      sync,
      roster:JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]'),
      equipment:JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]'),
      allowed:window.hdKcBridgeOriginAllowed('https://play.games.dmm.com'),
      denied:window.hdKcBridgeOriginAllowed('https://evil.example')
    };
  });

  expect(data.allowed).toBe(true);
  expect(data.denied).toBe(false);
  expect(data.sync.userscriptVersion).toBe('1.0.14');
  expect(data.roster).toHaveLength(1);
  expect(data.roster[0]).toMatchObject({gameShipId:101,source:'kancolle-import'});
  expect(data.equipment.reduce((n,x)=>n+(Number(x.count)||0),0)).toBe(1);
  expect(errors).toEqual([]);
});

test('release smoke: userscript bridge deduplicates repeated capture ids', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdKcBridgeImportOnce === 'function');

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-ship-roster-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    localStorage.removeItem('harbordesk-kancolle-bridge-status-v1');
    let syncEvents=0;
    const onSync=()=>{syncEvents++};
    window.addEventListener('hd:kancolle-sync',onSync);
    const raw=JSON.stringify({
      format:'harbordesk-kancolle-import',
      version:2,
      userscriptVersion:'1.0.14',
      captureId:'bridge-dedupe-test',
      records:[
        {endpoint:'/kcsapi/api_port/port',at:1,payload:{api_result:1,api_data:{
          api_ship:[{api_id:101,api_ship_id:1,api_lv:20,api_nowhp:13,api_maxhp:13,api_cond:49,api_slot:[501,-1,-1],api_slot_ex:0}],
          api_deck_port:[{api_id:1,api_name:'第一艦隊',api_ship:[101,-1,-1,-1,-1,-1],api_mission:[0,0,0,0]}],
          api_material:[]
        }}},
        {endpoint:'/kcsapi/api_get_member/slot_item',at:2,payload:{api_result:1,api_data:[
          {api_id:501,api_slotitem_id:1,api_level:0,api_alv:0}
        ]}}
      ]
    });
    const [first,second]=await Promise.all([
      window.hdKcBridgeImportOnce('bridge-dedupe-test',raw),
      window.hdKcBridgeImportOnce('bridge-dedupe-test',raw)
    ]);
    const appliedStatus=JSON.parse(localStorage.getItem('harbordesk-kancolle-bridge-status-v1')||'null');
    const appliedText=document.getElementById('hdKcBridgeStatus')?.textContent||'';
    let mismatch='';
    try{
      const changed=raw.replace('"userscriptVersion":"1.0.14"','"userscriptVersion":"9.9.9"');
      await window.hdKcBridgeImportOnce('bridge-dedupe-test',changed);
    }catch(err){mismatch=String(err?.message||err)}
    const errorStatus=JSON.parse(localStorage.getItem('harbordesk-kancolle-bridge-status-v1')||'null');
    const errorText=document.getElementById('hdKcBridgeStatus')?.textContent||'';
    window.removeEventListener('hd:kancolle-sync',onSync);
    return {
      syncEvents,
      sameSyncedAt:first.syncedAt===second.syncedAt,
      mismatch,
      appliedStatus,
      appliedText,
      errorStatus,
      errorText,
      roster:JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]'),
      equipment:JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]')
    };
  });

  expect(data.syncEvents).toBe(1);
  expect(data.sameSyncedAt).toBe(true);
  expect(data.appliedStatus).toMatchObject({captureId:'bridge-dedupe-test',route:'postMessage',state:'applied',attempts:2});
  expect(data.appliedText).toContain('台帳反映完了');
  expect(data.appliedText).toContain('再送 1回');
  expect(data.mismatch).toContain('captureId');
  expect(data.errorStatus).toMatchObject({captureId:'bridge-dedupe-test',route:'postMessage',state:'error',attempts:3});
  expect(data.errorText).toContain('同期エラー');
  expect(data.roster).toHaveLength(1);
  expect(data.equipment.reduce((n,x)=>n+(Number(x.count)||0),0)).toBe(1);
  expect(errors).toEqual([]);
});

test('release smoke: duplicate bridge retries apply one sync and reject mismatched payloads', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdKcBridgeImportOnce === 'function');

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-ship-roster-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    let syncEvents=0;
    window.addEventListener('hd:kancolle-sync',()=>syncEvents++);
    const raw=JSON.stringify({
      format:'harbordesk-kancolle-import',version:2,userscriptVersion:'1.0.14',records:[
        {endpoint:'/kcsapi/api_port/port',at:1,payload:{api_result:1,api_data:{
          api_ship:[{api_id:201,api_ship_id:1,api_lv:30,api_nowhp:13,api_maxhp:13,api_cond:49,api_slot:[601,-1,-1],api_slot_ex:0}],
          api_deck_port:[{api_id:1,api_name:'第一艦隊',api_ship:[201,-1,-1,-1,-1,-1],api_mission:[0,0,0,0]}],api_material:[]
        }}},
        {endpoint:'/kcsapi/api_get_member/slot_item',at:2,payload:{api_result:1,api_data:[{api_id:601,api_slotitem_id:1,api_level:0,api_alv:0}]}}
      ]
    });
    const [a,b]=await Promise.all([
      window.hdKcBridgeImportOnce('retry-same-1',raw),
      window.hdKcBridgeImportOnce('retry-same-1',raw)
    ]);
    let mismatch='';
    try{await window.hdKcBridgeImportOnce('retry-same-1',raw+' ')}catch(err){mismatch=String(err?.message||err)}
    return {
      same:a.syncedAt===b.syncedAt,
      syncEvents,
      roster:JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]'),
      equipment:JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]'),
      mismatch
    };
  });

  expect(data.same).toBe(true);
  expect(data.syncEvents).toBe(1);
  expect(data.roster).toHaveLength(1);
  expect(data.equipment.reduce((n,x)=>n+(Number(x.count)||0),0)).toBe(1);
  expect(data.mismatch).toContain('同じcaptureIdで異なる同期データ');
  expect(errors).toEqual([]);
});

test('release smoke: userscript uses same-tab hash handoff while importer keeps legacy bridge compatibility', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source=await page.evaluate(async()=>fetch('./HarborDesk-Kancolle.user.js',{cache:'no-store'}).then(r=>r.text()));
  const importer=await page.evaluate(async()=>fetch('./kancolle-import.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).not.toContain("window.open(HARBOR_URL+'#kancolleImport','HarborDeskSync')");
  expect(source).not.toContain("type:BRIDGE_IMPORT_MESSAGE");
  expect(source).toContain("a.href=HARBOR_URL+'#kcimport='+token");
  expect(source).toContain("a.target='_self'");
  expect(importer).toContain("HD_KC_BRIDGE_READY_MESSAGE='harbordesk-kancolle-import-ready-v1'");
  expect(importer).toContain("async function hdKcConsumeHashImport()");
  expect(importer).toContain("window.opener.postMessage({type:HD_KC_BRIDGE_READY_MESSAGE");
  expect(errors).toEqual([]);
});


test('release smoke: synced fleet and equipment data refresh downstream planners', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const [fleet, loadout, prep, analyzer] = await Promise.all([
      fetch('./fleet-suggester.js', { cache: 'no-store' }).then(r => r.text()),
      fetch('./fleet-loadout-planner.js', { cache: 'no-store' }).then(r => r.text()),
      fetch('./sortie-preparation-sheet.js', { cache: 'no-store' }).then(r => r.text()),
      fetch('./equipment-analyzer.js', { cache: 'no-store' }).then(r => r.text())
    ]);
    return { fleet, loadout, prep, analyzer };
  });

  expect(data.fleet).toContain("window.addEventListener('hd:kancolle-sync',hdFSRender)");
  expect(data.fleet).toContain("window.addEventListener('hd:ship-identity-changed',hdFSRender)");
  expect(data.fleet).toContain("艦これ同期 ");
  expect(data.loadout).toContain("window.addEventListener('hd:kancolle-sync',hdFLInvalidate)");
  expect(data.loadout).toContain("window.addEventListener('hd:ship-identity-changed',hdFLInvalidate)");
  expect(data.loadout).toContain('data-hd-fl-prepare=');
  expect(data.loadout).toContain('function hdFLSaveAndPrepare(index)');
  expect(data.prep).toContain("window.addEventListener('hd:kancolle-sync',hdSPSRender)");
  expect(data.analyzer).toContain("window.addEventListener('hd:kancolle-sync',()=>hdEArenderCoverage())");
  expect(errors).toEqual([]);
});

test('release smoke: expansion shortage procurement action adds demand and opens list', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFLGenerate === 'function' &&
    typeof window.hdFLPlanHtml === 'function' &&
    typeof window.hdPLAddExpansionRequirement === 'function' &&
    typeof window.hdPLOpenList === 'function'
  );

  const setup = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', '[]');
    localStorage.removeItem('harbordesk-equipment-procurement-v1');

    window.hdFSMap = () => '2-4';
    window.hdFSPlans = () => [{
      index: 0,
      preset: { name: '増設調達テスト', use: '回帰テスト' },
      needs: [],
      slots: [{
        profile: {
          row: { name: 'テスト駆逐', masterId: 999999, gear: '' },
          type: '駆逐艦',
          roles: [],
          master: { id: 999999 }
        }
      }]
    }];
    window.hdShipDbResolveShip = () => ({ id: 999999, final: 'テスト駆逐', type: '駆逐艦' });
    window.hdShipDbSlotProfile = () => ({ count: 1, slots: [0] });
    window.hdShipDbMasterCompatible = () => true;
    window.hdShipDbSlotRejects = () => false;
    window.hdShipDbExpansionCandidates = () => [];
    window.hdShipDbExpansionInfo = (item, ship, star = 0) => {
      if (item?.name !== '12cm単装砲') return { allowed: false, reqStar: 0, reason: '', mode: '' };
      return Number(star) >= 2
        ? { allowed: true, reqStar: 2, reason: '★2以上で増設可', mode: 'special' }
        : { allowed: false, reqStar: 2, reason: '★2以上で増設可', mode: 'special' };
    };
    window.hdShipDbEquipPower = () => 10;
    window.HD_EQUIPMENT_CATALOG = [{
      name: '12cm単装砲',
      category: '小口径主砲',
      stats: { 火力: 1 },
      tags: []
    }];

    const plan = window.hdFLGenerate(0);
    document.getElementById('hdExpansionProcureTestHost')?.remove();
    const host = document.createElement('div');
    host.id = 'hdExpansionProcureTestHost';
    host.innerHTML = window.hdFLPlanHtml(plan);
    document.body.appendChild(host);

    return {
      missing: plan?.ships?.[0]?.expansionMissing?.name || '',
      reqStar: Number(plan?.ships?.[0]?.expansionMissing?.reqStar) || 0,
      hasButton: !!host.querySelector('[data-hd-fl-procure-expansion="0"]')
    };
  });

  expect(setup).toEqual({ missing: '12cm単装砲', reqStar: 2, hasButton: true });

  await page.locator('#hdExpansionProcureTestHost [data-hd-fl-procure-expansion="0"]').click();

  await page.waitForFunction(() => {
    const rows = JSON.parse(localStorage.getItem('harbordesk-equipment-procurement-v1') || '[]');
    return rows.some(row => (row.gearItems || []).some(item =>
      item.loadout === '補強増設' &&
      item.target === '12cm単装砲' &&
      Number(item.reqStar) === 2
    ));
  });

  const result = await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('harbordesk-equipment-procurement-v1') || '[]');
    const item = rows.flatMap(row => row.gearItems || []).find(x => x.loadout === '補強増設');
    const panel = document.getElementById('hdEquipmentProcurement');
    return {
      map: rows[0]?.map || '',
      ship: item?.ship || '',
      target: item?.target || '',
      reqStar: Number(item?.reqStar) || 0,
      requiredTotal: Number(item?.requiredTotal) || 0,
      visible: !!panel && getComputedStyle(panel).display !== 'none' && !panel.hidden
    };
  });

  expect(result).toMatchObject({
    map: '2-4',
    ship: 'テスト駆逐',
    target: '12cm単装砲',
    reqStar: 2,
    requiredTotal: 1,
    visible: true
  });
  expect(errors).toEqual([]);
});

test('release smoke: optimizer keeps improvement-level equipment stacks separate', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFLInventory === 'function' &&
    typeof window.hdFLInventoryStackKey === 'function' &&
    typeof window.hdFOCanUse === 'function' &&
    typeof window.hdFORefreshUsage === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'a', name:'12cm単装砲', category:'小口径主砲', count:1, star:0 },
      { id:'b', name:'12cm単装砲', category:'小口径主砲', count:1, star:2 }
    ]));
    const inv = window.hdFLInventory();
    const k0 = window.hdFLInventoryStackKey('12cm単装砲', 0);
    const k2 = window.hdFLInventoryStackKey('12cm単装砲', 2);
    const zero = inv.get(k0);
    const two = inv.get(k2);
    const plan = {
      ships: [
        { items:[{ name:'12cm単装砲', star:0, stackKey:k0 }], expansion:null },
        { items:[{ name:'別装備', star:0, stackKey:'別装備@@0' }], expansion:null }
      ]
    };
    const zeroAvailableForSecond = window.hdFOCanUse(plan, zero, 1, 0);
    const twoAvailableForSecond = window.hdFOCanUse(plan, two, 1, 0);
    window.hdFORefreshUsage(plan);
    return {
      zeroAvailableForSecond,
      twoAvailableForSecond,
      ownedTotal: plan.owned?.['12cm単装砲'],
      owned0: plan.ownedStacks?.[k0],
      owned2: plan.ownedStacks?.[k2],
      usage0: plan.usedStacks?.[k0],
      usageTotal: plan.used?.['12cm単装砲']
    };
  });

  expect(data.zeroAvailableForSecond).toBe(false);
  expect(data.twoAvailableForSecond).toBe(true);
  expect(data.ownedTotal).toBe(2);
  expect(data.owned0).toBe(1);
  expect(data.owned2).toBe(1);
  expect(data.usage0).toBe(1);
  expect(data.usageTotal).toBe(1);
  expect(errors).toEqual([]);
});


test('release smoke: fleet suggestions exclude ships unavailable for sortie', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFSLiveState === 'function' &&
    typeof window.hdFSOperational === 'function' &&
    typeof window.hdFSProfile === 'function' &&
    typeof window.hdFSPickBest === 'function' &&
    typeof window.hdFSOperationalSummary === 'function'
  );

  const data = await page.evaluate(() => {
    const future = Date.now() + 60 * 60 * 1000;
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      { deckId:2, mission:[1,5,future,0], ships:[{ gameShipId:1001 }] }
    ]));
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions:[],
      docks:[{ id:'kc-dock-1', gameShipId:1002, endsAt:future, source:'kancolle-import' }]
    }));
    const rows = [
      { id:'exp', name:'睦月', type:'駆逐艦', level:99, gameShipId:1001, gameHp:13, gameMaxHp:13, gameCond:49 },
      { id:'dock', name:'如月', type:'駆逐艦', level:98, gameShipId:1002, gameHp:13, gameMaxHp:13, gameCond:49 },
      { id:'heavy', name:'吹雪', type:'駆逐艦', level:97, gameShipId:1003, gameHp:5, gameMaxHp:20, gameCond:49 },
      { id:'fatigue', name:'白雪', type:'駆逐艦', level:90, gameShipId:1004, gameHp:20, gameMaxHp:20, gameCond:15 },
      { id:'ready', name:'初雪', type:'駆逐艦', level:80, gameShipId:1005, gameHp:20, gameMaxHp:20, gameCond:49, gameSallyArea:3 },
      { id:'sparkle', name:'深雪', type:'駆逐艦', level:70, gameShipId:1006, gameHp:20, gameMaxHp:20, gameCond:55 }
    ];
    const state = window.hdFSLiveState();
    const profiles = rows.map(x => window.hdFSProfile(x, state));
    const ops = Object.fromEntries(profiles.map(x => [x.row.id, x.operational]));
    const best = window.hdFSPickBest(profiles, new Set(), null, { preferred:[], speedPreferred:false }, []);
    const summary = window.hdFSOperationalSummary(profiles);
    return {
      ops,
      best: best?.row?.id || '',
      summary
    };
  });

  expect(data.ops.exp.available).toBe(false);
  expect(data.ops.exp.reasons).toContain('遠征中');
  expect(data.ops.dock.available).toBe(false);
  expect(data.ops.dock.reasons).toContain('入渠中');
  expect(data.ops.heavy.available).toBe(false);
  expect(data.ops.heavy.reasons).toContain('大破');
  expect(data.ops.fatigue.available).toBe(true);
  expect(data.ops.fatigue.labels).toContain('赤疲労');
  expect(data.ops.sparkle.labels).toContain('キラ');
  expect(data.ops.ready.labels).toContain('札3');
  expect(data.best).toBe('ready');
  expect(data.summary).toMatchObject({
    total: 6,
    available: 3,
    blocked: 3,
    counts: { '遠征中':1, '入渠中':1, '大破':1 }
  });
  expect(errors).toEqual([]);
});


test('release smoke: userscript captures scouting and admiral level for readiness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./HarborDesk-Kancolle.user.js', { cache:'no-store' }).then(r => r.text()));
  const importer = await page.evaluate(async () => fetch('./kancolle-import.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain("// @version      1.0.15");
  expect(source).toContain("api_sakuteki:Array.isArray(x.api_sakuteki)");
  expect(source).toContain("api_onslot:Array.isArray(x.api_onslot)");
  expect(source).toContain("api_basic:data?.api_basic");
  expect(importer).toContain("HD_KC_USERSCRIPT_VERSION='1.0.15'");
  expect(importer).toContain("gameLos:Array.isArray(ship.api_sakuteki)");
  expect(importer).toContain("admiralLevel:Number(parsed.admiralLevel)");
  expect(errors).toEqual([]);
});

test('release smoke: integrated readiness evaluates route air scouting and live ship state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEScouting === 'function' &&
    typeof window.hdFEAirCheck === 'function' &&
    typeof window.hdFERoute === 'function' &&
    typeof window.hdFELiveFleet === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({ admiralLevel:120 }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'1', name:'睦月', masterId:1, type:'駆逐艦', gameShipId:101, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 },
      { id:'2', name:'如月', masterId:2, type:'駆逐艦', gameShipId:102, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 },
      { id:'3', name:'吹雪', masterId:9, type:'駆逐艦', gameShipId:103, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 },
      { id:'4', name:'白雪', masterId:10, type:'駆逐艦', gameShipId:104, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 },
      { id:'5', name:'初雪', masterId:32, type:'駆逐艦', gameShipId:105, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 },
      { id:'6', name:'深雪', masterId:11, type:'駆逐艦', gameShipId:106, gameHp:13, gameMaxHp:13, gameCond:49, gameLos:100 }
    ]));
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([]));
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({ expeditions:[], docks:[] }));
    const plan = {
      map:'2-5',
      routeInfo:{ requirements:[{ token:'駆逐', count:2 }], speedRequired:false },
      ships:[
        {ship:'睦月',masterId:1,type:'駆逐艦'},
        {ship:'如月',masterId:2,type:'駆逐艦'},
        {ship:'吹雪',masterId:9,type:'駆逐艦'},
        {ship:'白雪',masterId:10,type:'駆逐艦'},
        {ship:'初雪',masterId:32,type:'駆逐艦'},
        {ship:'深雪',masterId:11,type:'駆逐艦'}
      ]
    };
    const items = Array.from({length:4}, (_,i) => ({ name:'偵察'+i, star:0, meta:{ category:'水上偵察機', stats:{索敵:10}, tags:[] } }));
    const scouting = window.hdFEScouting(plan, items);
    const route = window.hdFERoute(plan);
    const live = window.hdFELiveFleet(plan);
    const air = window.hdFEAirCheck('7-4', { basePower:300, capacityKnown:4, count:4 });
    return { scouting, route, live, air };
  });

  expect(data.scouting.available).toBe(true);
  expect(data.scouting.status).toBe('ready');
  expect(data.scouting.score).toBeGreaterThanOrEqual(33);
  expect(data.route.status).toBe('ready');
  expect(data.live.status).toBe('ready');
  expect(data.air.status).toBe('ready');
  expect(data.air.enemy).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});


test('release smoke: live aircraft slots and supply feed sortie readiness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEAssigned === 'function' &&
    typeof window.hdFEAir === 'function' &&
    typeof window.hdFESupply === 'function' &&
    typeof window.hdFERosterForShip === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {
        id:'kc-ship-777', name:'睦月', masterId:1, gameShipId:777,
        gameHp:13, gameMaxHp:13, gameCond:49,
        gameOnslot:[5,0], gameFuel:10, gameAmmo:15
      },
      {
        id:'duplicate', name:'睦月', masterId:1, gameShipId:778,
        gameHp:13, gameMaxHp:13, gameCond:49,
        gameOnslot:[0,0], gameFuel:15, gameAmmo:15
      }
    ]));
    const plan = {
      map:'1-4',
      ships:[{
        ship:'睦月', gameShipId:777, masterId:1,
        items:[{name:'テスト艦戦',category:'艦上戦闘機',slotIndex:0,capacity:18,star:0}],
        expansion:null
      }]
    };
    const assigned = window.hdFEAssigned(plan);
    assigned[0].meta = { category:'艦上戦闘機', stats:{対空:10}, tags:[] };
    const air = window.hdFEAir(assigned);
    const supply = window.hdFESupply(plan);
    const resolved = window.hdFERosterForShip(plan.ships[0]);

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {
        id:'kc-ship-777', name:'睦月', masterId:1, gameShipId:777,
        gameHp:13, gameMaxHp:13, gameCond:49,
        gameOnslot:[5,0], gameFuel:null, gameAmmo:null
      }
    ]));
    const unknownSupply = window.hdFESupply(plan);
    return {
      capacity: assigned[0].capacity,
      masterCapacity: assigned[0].masterCapacity,
      capacitySource: assigned[0].capacitySource,
      airPower: air.basePower,
      liveCapacityKnown: air.liveCapacityKnown,
      depleted: air.depletedSlots,
      supply,
      unknownSupply,
      resolvedGameShipId: resolved?.gameShipId || 0
    };
  });

  expect(data.capacity).toBe(5);
  expect(data.masterCapacity).toBe(18);
  expect(data.capacitySource).toBe('live');
  expect(data.airPower).toBe(22);
  expect(data.liveCapacityKnown).toBe(1);
  expect(data.depleted).toHaveLength(1);
  expect(data.depleted[0]).toMatchObject({ live:5, max:18 });
  expect(data.supply.status).toBe('partial');
  expect(data.supply.low).toBe(1);
  expect(data.unknownSupply.status).toBe('manual');
  expect(data.resolvedGameShipId).toBe(777);
  expect(errors).toEqual([]);
});

test('release smoke: generated fleets persist the exact game ship id', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./fleet-loadout-planner.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain("gameShipId:Number(r?.gameShipId)||0");
  expect(errors).toEqual([]);
});


test('release smoke: synced current fleet opens sortie preparation in one action', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcCopyFleetToCustom === 'function' &&
    typeof window.hdKcPrepareCurrentFleet === 'function' &&
    typeof window.hdSPSRosterMatchShip === 'function'
  );

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      {
        deckId:1, name:'第一艦隊', mission:[0,0,0,0], syncedAt:Date.now(),
        ships:[
          { gameShipId:777, masterId:1, name:'睦月', level:80, nowHp:13, maxHp:13, cond:49, gear:'12cm単装砲' },
          { gameShipId:778, masterId:2, name:'如月', level:70, nowHp:13, maxHp:13, cond:49, gear:'12cm単装砲' }
        ]
      }
    ]));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'a', gameShipId:999, masterId:1, name:'睦月', level:10 },
      { id:'b', gameShipId:777, masterId:1, name:'睦月', level:80 },
      { id:'c', gameShipId:778, masterId:2, name:'如月', level:70 }
    ]));
    localStorage.removeItem('harbordesk-custom-fleets-v1');
    localStorage.removeItem('harbordesk-sortie-selection-v1');

    const copied = window.hdKcCopyFleetToCustom(1, '2-5');
    const matched = window.hdSPSRosterMatchShip(copied.ships[0]);
    window.__hdPrepOpened = false;
    const originalOpen = window.hdSPSOpen;
    window.hdSPSOpen = () => { window.__hdPrepOpened = true; };
    const prepared = window.hdKcPrepareCurrentFleet(1, '2-5');
    await new Promise(resolve => setTimeout(resolve, 80));
    window.hdSPSOpen = originalOpen;

    const custom = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');
    const selected = JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1') || '{}');
    return {
      copiedGameId: copied.ships[0].gameShipId,
      copiedMasterId: copied.ships[0].masterId,
      preparedId: prepared.id,
      selectedId: selected['2-5'],
      storedGameId: custom['2-5']?.[0]?.ships?.[0]?.gameShipId || 0,
      matchedGameId: matched?.gameShipId || 0,
      opened: window.__hdPrepOpened
    };
  });

  expect(data.copiedGameId).toBe(777);
  expect(data.copiedMasterId).toBe(1);
  expect(data.storedGameId).toBe(777);
  expect(data.matchedGameId).toBe(777);
  expect(data.selectedId).toBe(data.preparedId);
  expect(data.opened).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: current fleet panel exposes direct sortie preparation action', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./kancolle-import.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain('data-hd-kc-prepare-deck=');
  expect(source).toContain('この艦隊で出撃準備');
  expect(source).toContain('function hdKcPrepareCurrentFleet(deckId,map=');
  expect(errors).toEqual([]);
});


test('release smoke: current fleet route inference only accepts strong unique preset matches', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEInferRoute === 'function' &&
    typeof window.hdFERoute === 'function' &&
    typeof window.hdFSPresetInfo === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'cl',gameShipId:1,name:'軽巡A',type:'軽巡洋艦'},
      {id:'dd1',gameShipId:2,name:'駆逐A',type:'駆逐艦'},
      {id:'dd2',gameShipId:3,name:'駆逐B',type:'駆逐艦'},
      {id:'dd3',gameShipId:4,name:'駆逐C',type:'駆逐艦'},
      {id:'dd4',gameShipId:5,name:'駆逐D',type:'駆逐艦'},
      {id:'dd5',gameShipId:6,name:'駆逐E',type:'駆逐艦'},
      {id:'ca1',gameShipId:7,name:'航巡A',type:'航空巡洋艦'},
      {id:'ca2',gameShipId:8,name:'航巡B',type:'航空巡洋艦'}
    ]));

    const plan32 = {
      map:'3-2',
      ships:[
        {ship:'軽巡A',gameShipId:1},
        {ship:'駆逐A',gameShipId:2},
        {ship:'駆逐B',gameShipId:3},
        {ship:'駆逐C',gameShipId:4},
        {ship:'駆逐D',gameShipId:5},
        {ship:'駆逐E',gameShipId:6}
      ]
    };
    const plan25 = {
      map:'2-5',
      ships:[
        {ship:'航巡A',gameShipId:7},
        {ship:'航巡B',gameShipId:8},
        {ship:'駆逐A',gameShipId:2},
        {ship:'駆逐B',gameShipId:3},
        {ship:'駆逐C',gameShipId:4},
        {ship:'駆逐D',gameShipId:5}
      ]
    };

    const infer32 = window.hdFEInferRoute(plan32);
    const route32 = window.hdFERoute(plan32);
    const infer25 = window.hdFEInferRoute(plan25);
    const route25 = window.hdFERoute(plan25);
    return {
      infer32Status: infer32.status,
      infer32Name: infer32.match?.preset?.name || '',
      route32Status: route32.status,
      route32Detail: route32.detail,
      infer25Status: infer25.status,
      route25Status: route25.status,
      route25Detail: route25.detail
    };
  });

  expect(data.infer32Status).toBe('matched');
  expect(data.infer32Name).toBe('軽巡1＋駆逐5');
  expect(data.route32Status).toBe('ready');
  expect(data.route32Detail).toContain('自動照合');
  expect(data.route32Detail).toContain('軽巡1＋駆逐5');
  expect(data.infer25Status).toBe('none');
  expect(data.route25Status).toBe('manual');
  expect(data.route25Detail).not.toContain('自動照合:');
  expect(errors).toEqual([]);
});


test('release smoke: planned fleet is compared with synced game fleet and gear', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdFEGameMatch === 'function');

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'a', name:'睦月', masterId:1, gameShipId:101, gameGearSlots:['12cm単装砲','61cm三連装魚雷'], gameGearExpansion:'' },
      { id:'b', name:'如月', masterId:2, gameShipId:102, gameGearSlots:[], gameGearExpansion:'' }
    ]));
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      { deckId:1, name:'第一艦隊', ships:[{gameShipId:101},{gameShipId:102}] }
    ]));
    const matching = {
      map:'1-1',
      ships:[
        { ship:'睦月', gameShipId:101, masterId:1, items:[{name:'12cm単装砲',star:0,slotIndex:0},{name:'61cm三連装魚雷',star:0,slotIndex:1}], expansion:null },
        { ship:'如月', gameShipId:102, masterId:2, items:[], expansion:null }
      ]
    };
    const ready = window.hdFEGameMatch(matching);
    const gearDiffPlan = JSON.parse(JSON.stringify(matching));
    gearDiffPlan.ships[0].items[1].name = '別装備';
    const gearDiff = window.hdFEGameMatch(gearDiffPlan);
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      { deckId:1, name:'第一艦隊', ships:[{gameShipId:102},{gameShipId:101}] }
    ]));
    const orderDiff = window.hdFEGameMatch(matching);
    return { ready, gearDiff, orderDiff };
  });

  expect(data.ready.status).toBe('ready');
  expect(data.ready.fleetMatch).toBe(true);
  expect(data.ready.gearMismatch).toBe(0);
  expect(data.gearDiff.status).toBe('partial');
  expect(data.gearDiff.gearMismatch).toBe(1);
  expect(data.orderDiff.status).toBe('partial');
  expect(data.orderDiff.deckOrderMismatch).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: game sync persists exact gear slots for comparison', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./kancolle-import.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain('gameGearSlots:parsed.slotItems.size?gameGearSlots');
  expect(source).toContain('gameGearExpansion:parsed.slotItems.size?gameGearExpansion');
  expect(source).toContain('gearSlots,gearExpansion');
  expect(errors).toEqual([]);
});


test('release smoke: readiness reports sync freshness and exact game differences', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFESyncFreshness === 'function' &&
    typeof window.hdFEGameMatch === 'function' &&
    typeof window.hdFEGameMatchHtml === 'function'
  );

  const data = await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({ syncedAt: now - 2 * 60 * 1000 }));
    const fresh = window.hdFESyncFreshness();
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({ syncedAt: now - 22 * 60 * 1000 }));
    const stale = window.hdFESyncFreshness();

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'a', name:'睦月', masterId:1, gameShipId:101, gameGearSlots:['12cm単装砲','61cm三連装魚雷'], gameGearExpansion:'' }
    ]));
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      { deckId:1, name:'第一艦隊', ships:[{gameShipId:101}] }
    ]));
    const plan = {
      map:'1-1',
      ships:[{
        ship:'睦月', gameShipId:101, masterId:1,
        items:[
          {name:'12cm単装砲',star:0,slotIndex:0},
          {name:'別装備',star:0,slotIndex:1}
        ],
        expansion:null
      }]
    };
    const match = window.hdFEGameMatch(plan);
    const html = window.hdFEGameMatchHtml(match);
    return { fresh, stale, match, html };
  });

  expect(data.fresh.status).toBe('ready');
  expect(data.fresh.ageMinutes).toBeLessThanOrEqual(2);
  expect(data.stale.status).toBe('partial');
  expect(data.stale.detail).toContain('再同期推奨');
  expect(data.match.gearMismatch).toBe(1);
  expect(data.html).toContain('ゲームとの差分');
  expect(data.html).toContain('睦月');
  expect(data.html).toContain('第2スロ');
  expect(data.html).toContain('予定: 別装備');
  expect(data.html).toContain('ゲーム: 61cm三連装魚雷');
  expect(errors).toEqual([]);
});

test('release smoke: sortie preparation exposes detailed game differences', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./sortie-preparation-sheet.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain('function hdSPSGameDiffHtml(match)');
  expect(source).toContain('ゲームとの差分');
  expect(source).toContain('同期鮮度');
  expect(source).toContain('差分:');
  expect(errors).toEqual([]);
});


test('release smoke: sortie gate prioritizes blockers and next actions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEGoNoGo === 'function' &&
    typeof window.hdFEGateHtml === 'function'
  );

  const data = await page.evaluate(() => {
    const stop = window.hdFEGoNoGo({checks:[
      {id:'freshness',label:'同期鮮度',status:'partial',detail:'同期から12分'},
      {id:'health',label:'艦状態',status:'missing',detail:'大破 1隻'},
      {id:'supply',label:'補給',status:'partial',detail:'未補給 1隻'},
      {id:'gameMatch',label:'ゲーム反映',status:'partial',detail:'装備差 2件'}
    ]});
    const hold = window.hdFEGoNoGo({checks:[
      {id:'freshness',label:'同期鮮度',status:'partial',detail:'同期から12分'},
      {id:'health',label:'艦状態',status:'ready',detail:'艦状態OK'}
    ]});
    const go = window.hdFEGoNoGo({checks:[
      {id:'freshness',label:'同期鮮度',status:'ready',detail:'たった今同期'},
      {id:'health',label:'艦状態',status:'ready',detail:'艦状態OK'}
    ]});
    return {stop,hold,go,html:window.hdFEGateHtml({checks:[
      {id:'health',label:'艦状態',status:'missing',detail:'大破 1隻'},
      {id:'gameMatch',label:'ゲーム反映',status:'partial',detail:'装備差 2件'}
    ]})};
  });

  expect(data.stop.state).toBe('stop');
  expect(data.stop.label).toBe('修正必要');
  expect(data.stop.actions[0].id).toBe('health');
  expect(data.stop.actions[0].action).toContain('大破');
  expect(data.stop.actions.some(x => x.id === 'gameMatch')).toBe(true);
  expect(data.hold.state).toBe('hold');
  expect(data.hold.label).toBe('要確認');
  expect(data.go.state).toBe('go');
  expect(data.go.label).toBe('出撃準備OK');
  expect(data.go.actions).toHaveLength(0);
  expect(data.html).toContain('修正必要');
  expect(data.html).toContain('ゲーム側の艦隊順・装備');
  expect(errors).toEqual([]);
});

test('release smoke: sortie summary includes go-no-go and prioritized actions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./sortie-preparation-sheet.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain("typeof hdFEGateHtml==='function'?hdFEGateHtml(auto):''");
  expect(source).toContain("typeof hdFEGoNoGo==='function'?hdFEGoNoGo(eq.assigned.auto):null");
  expect(source).toContain('出撃判定:');
  expect(source).toContain('次:');
  expect(errors).toEqual([]);
});


test('release smoke: sortie session honors integrated go/no-go gate', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSSGate === 'function');

  const data = await page.evaluate(() => {
    const originalPlan=window.hdFEPlanFromSavedFleet,originalEval=window.hdFEEvaluate,originalGate=window.hdFEGoNoGo;
    window.hdFEPlanFromSavedFleet=()=>({map:'1-1',ships:[]});
    window.hdFEEvaluate=()=>({auto:{}});
    window.hdFEGoNoGo=()=>({
      state:'stop',label:'修正必要',detail:'修正が必要な項目 1件',
      blockers:[{id:'health',label:'艦状態',status:'missing',detail:'大破 1隻'}],
      cautions:[],
      actions:[{id:'health',label:'艦状態',status:'missing',action:'大破艦を編成から外す',detail:'大破 1隻'}]
    });
    const hard=window.hdSSGate('1-1',{id:'f',ships:[]},{manualDone:0,manualTotal:0});
    window.hdFEGoNoGo=()=>({
      state:'stop',label:'修正必要',detail:'修正が必要な項目 1件',
      blockers:[{id:'route',label:'編成条件',status:'missing',detail:'艦種不足'}],
      cautions:[],
      actions:[{id:'route',label:'編成条件',status:'missing',action:'編成条件を直す',detail:'艦種不足'}]
    });
    const overrideable=window.hdSSGate('1-1',{id:'f',ships:[]},{manualDone:0,manualTotal:0});
    window.hdFEGoNoGo=()=>({state:'go',label:'出撃準備OK',detail:'未解決なし',blockers:[],cautions:[],actions:[]});
    const manual=window.hdSSGate('1-1',{id:'f',ships:[]},{manualDone:1,manualTotal:2});
    window.hdFEPlanFromSavedFleet=originalPlan;window.hdFEEvaluate=originalEval;window.hdFEGoNoGo=originalGate;
    return {hard,overrideable,manual};
  });

  expect(data.hard.hardBlock).toBe(true);
  expect(data.hard.state).toBe('stop');
  expect(data.overrideable.hardBlock).toBe(false);
  expect(data.overrideable.state).toBe('stop');
  expect(data.manual.state).toBe('hold');
  expect(data.manual.actions.some(x => x.id === 'manual')).toBe(true);

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain("if(gate.hardBlock)return null");
  expect(source).toContain("if(gate.state==='stop'&&!force)return null");
  expect(source).toContain("data-hd-ss-start-override");
  expect(source).toContain("disabled>安全確認が必要");
  expect(errors).toEqual([]);
});


test('release smoke: readiness gate actions navigate to the right tools', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdFEFixActionInfo === 'function' && typeof window.hdFEOpenFix === 'function');

  const data = await page.evaluate(() => ({
    health: window.hdFEFixActionInfo('health'),
    supply: window.hdFEFixActionInfo('supply'),
    freshness: window.hdFEFixActionInfo('freshness'),
    gameMatch: window.hdFEFixActionInfo('gameMatch'),
    route: window.hdFEFixActionInfo('route'),
    equipment: window.hdFEFixActionInfo('equipment'),
    air: window.hdFEFixActionInfo('air'),
    scouting: window.hdFEFixActionInfo('scouting')
  }));

  expect(data.health.target).toBe('kancolleImport');
  expect(data.supply.target).toBe('kancolleImport');
  expect(data.freshness.target).toBe('kancolleImport');
  expect(data.gameMatch.target).toBe('kancolleImport');
  expect(data.route.target).toBe('guide');
  expect(data.equipment.target).toBe('equipmentBook');
  expect(data.air.target).toBe('calculator');
  expect(data.scouting.target).toBe('calculator');

  const source = await page.evaluate(async () => fetch('./fleet-readiness-evaluator.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain('data-hd-fe-fix=');
  expect(source).toContain("const fix=e.target.closest?.('[data-hd-fe-fix]')");
  expect(source).toContain("document.getElementById('hdKcCurrentFleets')");
  expect(source).toContain("document.getElementById('hdFleetCalculator')");
  expect(errors).toEqual([]);
});


test('release smoke: readiness calculator and prep buttons survive missing map tabs', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEOpenCalculator === 'function' &&
    typeof window.hdFEOpenPreparation === 'function' &&
    typeof window.hdFCOpenFallback === 'function' &&
    typeof window.hdSPSOpen === 'function',
    null,
    { timeout: 30000 }
  );

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="6"]').click();
  await page.locator('[data-map="6-5"]').click();

  await page.evaluate(() => {
    const host=document.createElement('div');
    host.id='hdReadinessActionHarness';
    host.innerHTML='<button type="button" data-hd-fe-calculator>計算機</button><button type="button" data-hd-fe-prep>準備表</button>';
    document.body.appendChild(host);
  });

  await page.locator('#hdReadinessActionHarness [data-hd-fe-calculator]').click();
  await expect(page.locator('#hdFallbackGearTools #hdFleetCalculator')).toBeVisible({ timeout: 10000 });

  await page.locator('#hdReadinessActionHarness [data-hd-fe-prep]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 10000 });

  expect(errors).toEqual([]);
});


test('release smoke: readiness fix navigation survives missing map tabs and workspace helper failure', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEOpenFix === 'function' &&
    typeof window.hdCoreMapAction === 'function' &&
    typeof window.hdFCOpenFallback === 'function',
    null,
    { timeout: 30000 }
  );

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="6"]').click();
  await page.locator('[data-map="6-5"]').click();

  await page.evaluate(() => window.hdFEOpenFix('air', {
    checks:[{id:'air',label:'制空',status:'missing',detail:'制空不足'}]
  }));
  await expect(page.locator('#hdFallbackGearTools #hdFleetCalculator')).toBeVisible({ timeout: 10000 });

  await page.evaluate(() => {
    const book=document.getElementById('equipmentBook');
    book?.classList.add('hd-ws-hidden');
    window.__hdSavedFEWSShowElement=window.hdWSShowElement;
    window.hdWSShowElement=()=>false;
    window.hdFEOpenFix('equipment', {
      checks:[{id:'equipment',label:'装備',status:'missing',detail:'装備不足'}]
    });
  });
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSShowElement=window.__hdSavedFEWSShowElement;
    delete window.__hdSavedFEWSShowElement;
  });
  expect(errors).toEqual([]);
});


test('release smoke: post-sortie state requires a fresh game sync before next clean go', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSPostSave === 'function' &&
    typeof window.hdSSPostLoad === 'function' &&
    typeof window.hdSSPostTryReview === 'function' &&
    typeof window.hdSSGate === 'function'
  );

  const data = await page.evaluate(() => {
    const originalPlan=window.hdFEPlanFromSavedFleet,originalEval=window.hdFEEvaluate,originalGo=window.hdFEGoNoGo;
    window.hdFEPlanFromSavedFleet=()=>({map:'1-1',ships:[]});
    window.hdFEEvaluate=()=>({auto:{
      live:{status:'ready',blocked:0,caution:0,details:[]},
      supply:{status:'ready',low:0,empty:0,rows:[]},
      air:{status:'ready',ours:100,enemy:50,depletedSlots:0}
    }});
    window.hdFEGoNoGo=()=>({state:'go',label:'出撃準備OK',detail:'問題なし',blockers:[],cautions:[],actions:[]});

    window.hdSSPostSave({
      version:1,status:'awaiting-sync',sessionId:'s1',map:'1-1',
      fleetId:'fleet-1',fleetName:'第一艦隊',finishedAt:100,
      fleetSnapshot:{id:'fleet-1',ships:[]}
    });

    const gateBefore=window.hdSSGate('1-1',{id:'fleet-1',ships:[]},{manualTotal:0,manualDone:0});
    const stale=window.hdSSPostTryReview({syncedAt:100});
    const fresh=window.hdSSPostTryReview({syncedAt:200});
    const stored=window.hdSSPostLoad();

    window.hdFEPlanFromSavedFleet=originalPlan;window.hdFEEvaluate=originalEval;window.hdFEGoNoGo=originalGo;
    return {gateBefore,stale,fresh,stored};
  });

  expect(data.gateBefore.state).toBe('hold');
  expect(data.gateBefore.postAwaiting).toBe(true);
  expect(data.gateBefore.actions[0]?.id).toBe('postSync');
  expect(data.stale.status).toBe('awaiting-sync');
  expect(data.fresh.status).toBe('reviewed');
  expect(data.fresh.review.gate.state).toBe('go');
  expect(data.stored.status).toBe('reviewed');

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain("const HD_SS_POST_KEY='harbordesk-post-sortie-review-v1'");
  expect(source).toContain("status:'awaiting-sync'");
  expect(source).toContain("window.addEventListener('hd:kancolle-sync'");
  expect(source).toContain('帰還後の再同期待ち');
  expect(errors).toEqual([]);
});


test('release smoke: readiness fix workflow remembers target and confirms resolution', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEStartFixFlow === 'function' &&
    typeof window.hdFEFixFlowState === 'function' &&
    typeof window.hdFEFixFlowSave === 'function'
  );

  const data = await page.evaluate(() => {
    sessionStorage.removeItem('harbordesk-sortie-fix-flow-v1');
    const before = {
      checks:[{id:'supply',label:'補給',status:'missing',detail:'未補給 1隻'}]
    };
    window.hdFEStartFixFlow('supply', before);
    const pending = window.hdFEFixFlowState(before);
    const after = {
      checks:[{id:'supply',label:'補給',status:'ready',detail:'全艦補給済み'}]
    };
    const resolved = window.hdFEFixFlowState(after);
    const html = window.hdFEGateHtml?.(after) || '';
    const stored = JSON.parse(sessionStorage.getItem('harbordesk-sortie-fix-flow-v1') || 'null');
    window.hdFEFixFlowSave(null);
    return { pending, resolved, html, stored, cleared: sessionStorage.getItem('harbordesk-sortie-fix-flow-v1') };
  });

  expect(data.pending.resolved).toBe(false);
  expect(data.pending.currentStatus).toBe('missing');
  expect(data.resolved.resolved).toBe(true);
  expect(data.resolved.changed).toBe(true);
  expect(data.html).toContain('修正反映済み');
  expect(data.html).toContain('次を再判定');
  expect(data.stored.id).toBe('supply');
  expect(data.cleared).toBeNull();
  expect(errors).toEqual([]);
});

test('release smoke: pending fix workflow refreshes after sync and equipment changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./fleet-readiness-evaluator.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain("const HD_FE_FIX_FLOW_KEY='harbordesk-sortie-fix-flow-v1'");
  expect(source).toContain("['hd:kancolle-sync','hd:equipment-changed','hd:ship-identity-changed']");
  expect(source).toContain("data-hd-fe-recheck");
  expect(source).toContain("data-hd-fe-fix-dismiss");
  expect(errors).toEqual([]);
});


test('release smoke: post-sortie review summarizes telemetry deltas and links into fix workflow', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSSPostDelta === 'function');

  const delta = await page.evaluate(() => window.hdSSPostDelta(
    {
      live:{blocked:0,caution:0,details:[
        {name:'赤城',status:'ready',hp:80,maxHp:80,labels:[]},
        {name:'加賀',status:'ready',hp:79,maxHp:79,labels:[]}
      ]},
      supply:{empty:0,low:0,rows:[
        {name:'赤城',known:true,currentFuel:82,currentAmmo:82},
        {name:'加賀',known:true,currentFuel:80,currentAmmo:80}
      ]},
      air:{ours:320,depletedSlots:0}
    },
    {
      live:{blocked:0,caution:1,details:[
        {name:'赤城',status:'caution',hp:46,maxHp:80,labels:['中破']},
        {name:'加賀',status:'ready',hp:79,maxHp:79,labels:[]}
      ]},
      supply:{empty:0,low:2,rows:[
        {name:'赤城',known:true,currentFuel:62,currentAmmo:60},
        {name:'加賀',known:true,currentFuel:61,currentAmmo:59}
      ]},
      air:{ours:270,depletedSlots:2}
    }
  ));

  expect(delta.changed).toBe(true);
  expect(delta.ships).toHaveLength(1);
  expect(delta.ships[0]).toMatchObject({name:'赤城',hpBefore:80,hpAfter:46,hpLoss:34,statusAfter:'caution'});
  expect(delta.fuelUsed).toBe(39);
  expect(delta.ammoUsed).toBe(43);
  expect(delta.airLoss).toBe(50);
  expect(delta.depletedAdded).toBe(2);
  expect(delta.newCaution).toBe(1);
  expect(delta.newSupply).toBe(2);

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain('今回の出撃で変わったところ');
  expect(source).toContain('data-hd-ss-post-fix=');
  expect(source).toContain("typeof hdFEOpenFix==='function'");
  expect(source).toContain("hdFEOpenFix(postFix.dataset.hdSsPostFix)");
  expect(errors).toEqual([]);
});


test('release smoke: post-sortie review is persisted into its sortie log entry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSSAttachReviewToLog === 'function');

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      { id:'entry-1', sessionId:'session-1', at:100, map:'2-5', result:'S', fleetId:'fleet-a', strategy:'stable' }
    ]));
    const ok = window.hdSSAttachReviewToLog({
      entryId:'entry-1', sessionId:'session-1', reviewedAt:250, syncAt:240,
      review:{
        gate:{state:'hold',label:'要確認',detail:'補給して再判定'},
        delta:{
          changed:true,
          ships:[{name:'赤城',hpBefore:80,hpAfter:52,hpLoss:28,statusBefore:'ready',statusAfter:'caution'}],
          fuelUsed:20,ammoUsed:22,supplyKnown:6,airBefore:300,airAfter:255,airLoss:45,
          depletedBefore:0,depletedAfter:2,depletedAdded:2,newBlocked:0,newCaution:1,newSupply:2
        },
        live:{status:'partial',blocked:0,caution:1},
        supply:{status:'partial',empty:0,low:2},
        air:{status:'partial',ours:255,enemy:180,depletedSlots:2}
      }
    });
    const row = JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')[0];
    return {ok,row};
  });

  expect(data.ok).toBe(true);
  expect(data.row.postSortieReview.reviewedAt).toBe(250);
  expect(data.row.postSortieReview.gate.state).toBe('hold');
  expect(data.row.postSortieReview.delta.fuelUsed).toBe(20);
  expect(data.row.postSortieReview.delta.airLoss).toBe(45);
  expect(data.row.postSortieReview.delta.ships[0]).toMatchObject({name:'赤城',hpLoss:28,statusAfter:'caution'});
  expect(errors).toEqual([]);
});

test('release smoke: performance analytics learns from post-sortie telemetry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPAPostTelemetry === 'function' &&
    typeof window.hdSPARecommendations === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      { postSortieReview:{ gate:{state:'hold'}, delta:{ships:[{hpLoss:20}],fuelUsed:18,ammoUsed:20,supplyKnown:6,airBefore:300,airAfter:260,airLoss:40,depletedAdded:2} } },
      { postSortieReview:{ gate:{state:'go'}, delta:{ships:[],fuelUsed:12,ammoUsed:14,supplyKnown:6,airBefore:300,airAfter:295,airLoss:5,depletedAdded:0} } }
    ];
    const post = window.hdSPAPostTelemetry(rows);
    const recs = window.hdSPARecommendations({
      metrics:{postTelemetry:post},
      trend:{ready:false},
      retreatReasonStats:{items:[]}
    });
    return {post,recs};
  });

  expect(data.post.reviewed).toBe(2);
  expect(data.post.coverageRate).toBe(100);
  expect(data.post.damageRate).toBe(50);
  expect(data.post.avgHpLoss).toBe(10);
  expect(data.post.avgFuelUsed).toBe(15);
  expect(data.post.avgAmmoUsed).toBe(17);
  expect(data.post.avgAirLoss).toBe(22.5);
  expect(data.post.avgDepletedAdded).toBe(1);
  expect(data.post.needsFixRate).toBe(50);
  expect(data.recs.map(x=>x.id)).toContain('post-damage');
  expect(data.recs.map(x=>x.id)).toContain('post-fix');
  expect(data.recs.map(x=>x.id)).toContain('post-aircraft');
  expect(errors).toEqual([]);
});


test('release smoke: synced game result auto-finishes an active sortie session without a duplicate log', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSSave === 'function' &&
    typeof window.hdSSLoad === 'function' &&
    typeof window.hdSSIngestGameSortie === 'function' &&
    typeof window.hdSLLoad === 'function'
  );

  const data = await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    window.hdSSPostSave?.(null);
    window.hdSSSave({
      id:'session-auto-1',map:'2-5',startedAt:now-60000,
      fleetId:'fleet-a',fleetName:'自動編成',strategy:'stable',strategyLabel:'安定重視',
      fleetSnapshot:{id:'fleet-a',name:'自動編成',ships:[]},readinessSnapshot:{},
      telemetrySnapshot:null,shipCount:6,status:'active'
    });
    const entry = window.hdSSIngestGameSortie({
      map:'2-5',startedAt:now-30000,node:'O ボス',result:'S',boss:true,retreat:false,battles:4,drop:'浦波',
      gameSortieKey:'kc-auto-1',gameNodeNo:15,gameNodeLabel:'O',gameBossCellNo:15,gameBossCellLabel:'O',
      gameRouteNodes:[1,3,6,15],gameRouteLabels:['A','C','F','O'],
      gameBattleResults:[{nodeNo:15,nodeLabel:'O',rank:'S',drop:'浦波'}]
    });
    const logs=window.hdSLLoad(),post=window.hdSSPostLoad?.();
    return {entry,logs,active:window.hdSSLoad(),post};
  });

  expect(data.active).toBeNull();
  expect(data.logs).toHaveLength(1);
  expect(data.entry.id).toBe(data.logs[0].id);
  expect(data.logs[0]).toMatchObject({
    sessionId:'session-auto-1',source:'session-game',result:'S',boss:true,retreat:false,
    battles:4,drop:'浦波',gameSortieKey:'kc-auto-1'
  });
  expect(data.logs[0].gameRouteLabels).toEqual(['A','C','F','O']);
  expect(data.post.status).toBe('awaiting-sync');
  expect(data.post.gameMatched).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: game sync merges into a just-finished session log instead of creating another entry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSIngestGameSortie === 'function' &&
    typeof window.hdSSPostSave === 'function' &&
    typeof window.hdSLLoad === 'function'
  );

  const data = await page.evaluate(() => {
    const now=Date.now();
    localStorage.setItem('harbordesk-sortie-log-v1',JSON.stringify([{
      id:'entry-manual-1',sessionId:'session-manual-1',map:'2-5',startedAt:now-90000,
      at:now-10000,result:'A',boss:false,retreat:false,battles:3,drop:'',
      fleetId:'fleet-a',fleetName:'自動編成',strategy:'stable',source:'session'
    }]));
    window.hdSSSave?.(null);
    window.hdSSPostSave({
      version:1,status:'awaiting-sync',sessionId:'session-manual-1',map:'2-5',
      fleetId:'fleet-a',fleetName:'自動編成',finishedAt:now-10000,entryId:'entry-manual-1',
      fleetSnapshot:{ships:[]},startTelemetry:null
    });
    const merged=window.hdSSIngestGameSortie({
      map:'2-5',startedAt:now-80000,node:'O ボス',result:'S',boss:true,retreat:false,battles:4,drop:'浦波',
      gameSortieKey:'kc-merge-1',gameNodeNo:15,gameNodeLabel:'O',gameBossCellNo:15,gameBossCellLabel:'O',
      gameRouteNodes:[1,3,6,15],gameRouteLabels:['A','C','F','O'],
      gameBattleResults:[{nodeNo:15,nodeLabel:'O',rank:'S',drop:'浦波'}]
    });
    return {merged,logs:window.hdSLLoad(),post:window.hdSSPostLoad()};
  });

  expect(data.logs).toHaveLength(1);
  expect(data.merged.id).toBe('entry-manual-1');
  expect(data.logs[0]).toMatchObject({
    id:'entry-manual-1',sessionId:'session-manual-1',source:'session-game',
    result:'S',boss:true,battles:4,drop:'浦波',gameSortieKey:'kc-merge-1'
  });
  expect(data.post.gameMatched).toBe(true);
  expect(data.post.gameSortieKey).toBe('kc-merge-1');
  expect(errors).toEqual([]);
});

test('release smoke: Kancolle sortie importer prefers session reconciliation before standalone logging', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./kancolle-import.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain("typeof hdSSIngestGameSortie==='function'?hdSSIngestGameSortie(payload):null");
  expect(source).toContain("const entry=matched||hdSLRecordEntry(payload)");
  expect(source).toContain("result:active.lastResult||(retreat?'撤退':'不明')");
  expect(errors).toEqual([]);
});


test('release smoke: post-sortie reprepare queue advances with reconciled game results intact', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSPostQueueBuild === 'function' &&
    typeof window.hdSSPostQueueSummary === 'function' &&
    typeof window.hdSSPostStartReprepare === 'function' &&
    typeof window.hdSSIngestGameSortie === 'function'
  );

  const data = await page.evaluate(() => {
    const first = window.hdSSPostQueueBuild({
      actions:[
        {id:'supply',action:'補給する',detail:'未補給 2隻'},
        {id:'air',action:'制空を調整',detail:'優勢未達'}
      ]
    },[]);
    const second = window.hdSSPostQueueBuild({
      actions:[{id:'air',action:'制空を調整',detail:'まだ不足'}]
    },first);
    const third = window.hdSSPostQueueBuild({actions:[]},second);
    return {
      first, second, third,
      firstSummary:window.hdSSPostQueueSummary(first),
      secondSummary:window.hdSSPostQueueSummary(second),
      thirdSummary:window.hdSSPostQueueSummary(third)
    };
  });

  expect(data.firstSummary).toMatchObject({total:2,resolved:0,pending:2});
  expect(data.secondSummary).toMatchObject({total:2,resolved:1,pending:1});
  expect(data.second.find(x=>x.id==='supply')?.status).toBe('resolved');
  expect(data.second.find(x=>x.id==='air')?.status).toBe('pending');
  expect(data.thirdSummary).toMatchObject({total:2,resolved:2,pending:0});

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain('再出撃の再準備');
  expect(source).toContain('data-hd-ss-reprep');
  expect(source).toContain('function hdSSPostRefreshReview(sync)');
  expect(source).toContain('function hdSSIngestGameSortie(payload)');
  expect(source).toContain('hdSSAttachReviewToLog(next)');
  expect(source).toContain("['hd:equipment-changed','hd:ship-identity-changed','hd:custom-fleets-changed']");
  expect(errors).toEqual([]);
});


test('release smoke: resolved reprepare queue starts a fresh next-round preflight', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSPostPrepareNextRound === 'function' &&
    typeof window.hdSSPostPreflightState === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '1-1': [{
        id:'fleet-a', name:'周回艦隊', ships:[{ship:'睦月',gear:''}], memo:''
      }]
    }));
    localStorage.setItem('harbordesk-sortie-readiness-v1', JSON.stringify({
      '1-1:fleet-a': { supply:true, damage:true, morale:true, mission:true, updatedAt:Date.now(), _fingerprint:'old' }
    }));
    window.hdSSPostSave({
      version:1,status:'reviewed',sessionId:'session-1',entryId:'entry-1',
      seriesId:'series-1',cycleIndex:1,map:'1-1',fleetId:'fleet-a',fleetName:'周回艦隊',
      review:{gate:{state:'go',label:'出撃準備OK',detail:'問題なし',actions:[]},queue:[]}
    });
    const ok = window.hdSSPostPrepareNextRound();
    const selection = JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}');
    const readiness = JSON.parse(localStorage.getItem('harbordesk-sortie-readiness-v1')||'{}');
    const post = window.hdSSPostLoad();
    return { ok, selection, readiness, post };
  });

  expect(data.ok).toBe(true);
  expect(data.selection['1-1']).toBe('fleet-a');
  expect(data.readiness['1-1:fleet-a']).toBeUndefined();
  expect(data.post.reprepare.preflightAt).toBeGreaterThan(0);
  expect(data.post.reprepare.currentId).toBeNull();
  expect(errors).toEqual([]);
});

test('release smoke: repeat sortie metadata survives finish and feeds the next cycle', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSFinish === 'function' &&
    typeof window.hdSSPostStartNextRound === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-log-v1');
    window.hdSSSave({
      id:'session-2', map:'1-1', startedAt:Date.now()-1000,
      fleetId:'fleet-a', fleetName:'周回艦隊', strategy:'stable', strategyLabel:'安定重視',
      fleetSnapshot:{id:'fleet-a',name:'周回艦隊',ships:[{ship:'睦月'}],memo:''},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:4,manualTotal:4,unresolved:[],gate:{state:'go',label:'出撃準備OK',detail:'OK',hardBlock:false,actions:[]}},
      telemetrySnapshot:null, shipCount:1, status:'active',
      seriesId:'series-1', cycleIndex:2, previousSessionId:'session-1', previousEntryId:'entry-1'
    });
    const entry = window.hdSSFinish({result:'S',boss:true,battles:1});
    const post = window.hdSSPostLoad();
    return { entry, post };
  });

  expect(data.entry).toBeTruthy();
  expect(data.post).toMatchObject({
    status:'awaiting-sync',
    sessionId:'session-2',
    seriesId:'series-1',
    cycleIndex:2,
    previousSessionId:'session-1',
    previousEntryId:'entry-1'
  });

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain('function hdSSPostStartNextRound()');
  expect(source).toContain('data-hd-ss-next-preflight');
  expect(source).toContain('data-hd-ss-next-start');
  expect(source).toContain("cycleIndex:Math.max(1,Number(post.cycleIndex)||1)+1");
  expect(errors).toEqual([]);
});


test('release smoke: repeat-sortie series analytics groups linked cycles', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPASeriesMeta === 'function' &&
    typeof window.hdSPARows === 'function' &&
    typeof window.hdSPASetMode === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {
        id:'e1',at:61000,startedAt:1000,durationMs:60000,map:'1-1',
        fleetId:'fleet-a',fleetName:'周回艦隊',strategy:'stable',result:'S',boss:true,
        fuel:10,ammo:20,steel:0,bauxite:0,buckets:0,
        seriesId:'series-a',cycleIndex:1,
        postSortieReview:{gate:{state:'go'}}
      },
      {
        id:'e2',at:151000,startedAt:91000,durationMs:60000,map:'1-1',
        fleetId:'fleet-a',fleetName:'周回艦隊',strategy:'stable',result:'A',boss:true,
        fuel:12,ammo:22,steel:0,bauxite:5,buckets:1,
        seriesId:'series-a',cycleIndex:2,
        postSortieReview:{gate:{state:'hold'}}
      },
      {
        id:'single',at:200000,startedAt:180000,durationMs:20000,map:'1-1',
        fleetId:'fleet-b',fleetName:'単発',strategy:'stable',result:'S',boss:true,
        seriesId:'series-b',cycleIndex:1
      }
    ];
    const meta = window.hdSPASeriesMeta(rows.slice(0,2));
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    window.hdSPASetMode('series');
    window.hdSPASetMap('all');
    const groups = window.hdSPARows();
    const html = window.hdSPAHtml();
    return { meta, groups, html };
  });

  expect(data.meta).toMatchObject({
    seriesId:'series-a',
    cycles:2,
    minCycle:1,
    maxCycle:2,
    missingCycles:0,
    resourceTotal:69,
    buckets:1,
    reviewed:2,
    needsFix:1,
    stop:0
  });
  expect(data.meta.activeMin).toBe(2);
  expect(data.meta.avgCycleMin).toBe(1);
  expect(data.groups).toHaveLength(1);
  expect(data.groups[0].seriesId).toBe('series-a');
  expect(data.groups[0].seriesMeta.cycles).toBe(2);
  expect(data.html).toContain('連続周回別');
  expect(data.html).toContain('連続周回サマリー');
  expect(errors).toEqual([]);
});


test('release smoke: repeat-sortie stop goals halt the next cycle at configured limits', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSSeriesGoalSave === 'function' &&
    typeof window.hdSSSeriesDecision === 'function' &&
    typeof window.hdSSSeriesGoalHtml === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'e1',seriesId:'series-goal',cycleIndex:1,startedAt:1000,at:61000,fuel:100,ammo:100,steel:0,bauxite:0,buckets:0,drop:''},
      {id:'e2',seriesId:'series-goal',cycleIndex:2,startedAt:91000,at:151000,fuel:110,ammo:100,steel:0,bauxite:0,buckets:1,drop:''},
      {id:'e3',seriesId:'series-goal',cycleIndex:3,startedAt:181000,at:241000,fuel:120,ammo:100,steel:0,bauxite:0,buckets:1,drop:'明石'}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    window.hdSSSeriesGoalSave('series-goal', {
      maxCycles:3,
      maxResources:1000,
      maxBuckets:5,
      maxElapsedMin:10,
      target:'明石'
    });
    const decision = window.hdSSSeriesDecision('series-goal');
    const html = window.hdSSSeriesGoalHtml({seriesId:'series-goal',sessionId:'session-x'}, decision);
    window.hdSSSeriesGoalSave('series-goal', {});
    const cleared = window.hdSSSeriesDecision('series-goal');
    return { decision, html, cleared };
  });

  expect(data.decision.stop).toBe(true);
  expect(data.decision.progress.cycles).toBe(3);
  expect(data.decision.progress.resourceTotal).toBe(630);
  expect(data.decision.progress.buckets).toBe(2);
  expect(data.decision.targetHit).toBe(true);
  expect(data.decision.reasons.join(' / ')).toContain('周回上限 3/3');
  expect(data.decision.reasons.join(' / ')).toContain('目標ドロップ 明石 獲得');
  expect(data.html).toContain('周回終了条件');
  expect(data.html).toContain('STOP');
  expect(data.cleared.stop).toBe(false);

  const source = await page.evaluate(async () => fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text()));
  expect(source).toContain("if(hdSSSeriesDecision(String(post.seriesId||post.sessionId||'')).stop)return false");
  expect(source).toContain("if(hdSSSeriesDecision(String(post.seriesId||post.sessionId||'')).stop)return null");
  expect(errors).toEqual([]);
});

test('release smoke: series analytics shows configured stop-goal status', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPASeriesMeta === 'function' &&
    typeof window.hdSPASeriesGoalStatus === 'function' &&
    typeof window.hdSSSeriesGoalSave === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'a1',seriesId:'series-a',cycleIndex:1,map:'1-1',startedAt:1000,at:61000,fuel:10,ammo:20,buckets:0},
      {id:'a2',seriesId:'series-a',cycleIndex:2,map:'1-1',startedAt:91000,at:151000,fuel:12,ammo:22,buckets:1}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    window.hdSSSeriesGoalSave('series-a',{maxCycles:2});
    const row={seriesMeta:window.hdSPASeriesMeta(rows)};
    return {
      status: window.hdSPASeriesGoalStatus(row),
      series: window.hdSPASeriesHtml(row)
    };
  });

  expect(data.status).toContain('最大2周');
  expect(data.status).toContain('到達・停止');
  expect(data.series).toContain('連続周回サマリー');
  expect(data.series).toContain('終了条件');
  expect(errors).toEqual([]);
});


test('release smoke: stopped repeat-sortie series can be summarized and completed safely', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSSeriesGoalSave === 'function' &&
    typeof window.hdSSSeriesSummaryText === 'function' &&
    typeof window.hdSSSeriesClose === 'function' &&
    typeof window.hdSSSeriesArchive === 'function' &&
    typeof window.hdSPASeriesGoalStatus === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'c1',seriesId:'series-close',cycleIndex:1,map:'2-4',fleetId:'f1',fleetName:'周回艦隊',strategyLabel:'安定重視',startedAt:1000,at:61000,result:'S',boss:true,fuel:100,ammo:80,steel:0,bauxite:10,buckets:0,drop:'扶桑'},
      {id:'c2',seriesId:'series-close',cycleIndex:2,map:'2-4',fleetId:'f1',fleetName:'周回艦隊',strategyLabel:'安定重視',startedAt:91000,at:151000,result:'A',boss:true,fuel:110,ammo:90,steel:0,bauxite:10,buckets:1,drop:'山城'}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-post-sortie-review-v1', JSON.stringify({status:'reviewed',seriesId:'series-close',sessionId:'s2',map:'2-4'}));
    window.hdSSSeriesGoalSave('series-close',{maxCycles:2});
    const before = window.hdSSSeriesDecision('series-close');
    const text = window.hdSSSeriesSummaryText('series-close');
    const archive = window.hdSSSeriesClose('series-close');
    const saved = window.hdSSSeriesArchive('series-close');
    const post = window.hdSSPostLoad();
    const goal = window.hdSSSeriesGoal('series-close');
    const logs = JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]');
    const status = window.hdSPASeriesGoalStatus({seriesMeta:window.hdSPASeriesMeta(rows)});
    return {before,text,archive,saved,post,goal,logs,status};
  });

  expect(data.before.stop).toBe(true);
  expect(data.text).toContain('HarborDesk 連続周回サマリー');
  expect(data.text).toContain('周回 2');
  expect(data.text).toContain('総資源 400');
  expect(data.archive).toMatchObject({seriesId:'series-close',cycles:2,resourceTotal:400,buckets:1});
  expect(data.saved.closeReason).toContain('周回上限 2/2');
  expect(data.post).toBeNull();
  expect(data.goal.maxCycles).toBe(0);
  expect(data.logs).toHaveLength(2);
  expect(data.status).toContain('完了済み');
  expect(errors).toEqual([]);
});


test('release smoke: completed series restart never bypasses preflight safety', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSSSeriesRestart === 'function' &&
    typeof window.hdSSSeriesArchive === 'function'
  );

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-sortie-series-archive-v1', JSON.stringify({
      oldSeries:{
        seriesId:'oldSeries',map:'2-4',fleetId:'missing-fleet',fleetName:'周回艦隊',
        goal:{maxCycles:10,maxResources:5000,maxBuckets:5,maxElapsedMin:60,target:'大鯨'},
        cycles:10,resourceTotal:1200,buckets:2,closedAt:Date.now()
      }
    }));
    localStorage.removeItem('harbordesk-active-sortie-session-v1');
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({'2-4':[]}));
    const result = window.hdSSSeriesRestart('oldSeries');
    const active = window.hdSSLoad();
    const sessionSource = await fetch('./sortie-session.js',{cache:'no-store'}).then(r=>r.text());
    const analyticsSource = await fetch('./sortie-performance-analytics.js',{cache:'no-store'}).then(r=>r.text());
    return {result,active,sessionSource,analyticsSource};
  });

  expect(data.result.started).toBe(false);
  expect(data.result.reason).toBe('fleet-missing');
  expect(data.active).toBeNull();
  expect(data.sessionSource).toContain("gate.hardBlock||gate.state!=='go'||manualLeft");
  expect(data.sessionSource).toContain("hdSSSeriesGoalSave(session.seriesId,goal)");
  expect(data.analyticsSource).toContain('data-hd-spa-series-restart=');
  expect(data.analyticsSource).toContain('同条件で新しい周回');
  expect(errors).toEqual([]);
});


test('release smoke: completed repeat-sortie series can be compared side by side', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPASeriesComparison === 'function' &&
    typeof window.hdSPASeriesComparisonHtml === 'function' &&
    typeof window.hdSPASeriesComparisonText === 'function' &&
    typeof window.hdSSSeriesClose === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'a1',seriesId:'s-a',cycleIndex:1,map:'2-4',fleetId:'f-a',fleetName:'安定艦隊',startedAt:1000,at:61000,durationMs:60000,result:'S',boss:true,fuel:100,ammo:80,steel:0,bauxite:20,buckets:0},
      {id:'a2',seriesId:'s-a',cycleIndex:2,map:'2-4',fleetId:'f-a',fleetName:'安定艦隊',startedAt:91000,at:151000,durationMs:60000,result:'S',boss:true,fuel:100,ammo:80,steel:0,bauxite:20,buckets:0},
      {id:'b1',seriesId:'s-b',cycleIndex:1,map:'2-4',fleetId:'f-b',fleetName:'節約艦隊',startedAt:201000,at:291000,durationMs:90000,result:'A',boss:true,fuel:60,ammo:50,steel:0,bauxite:10,buckets:0},
      {id:'b2',seriesId:'s-b',cycleIndex:2,map:'2-4',fleetId:'f-b',fleetName:'節約艦隊',startedAt:321000,at:411000,durationMs:90000,result:'撤退',boss:false,retreat:true,fuel:60,ammo:50,steel:0,bauxite:10,buckets:1}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','series');
    window.hdSSSeriesClose('s-a');
    const grouped = window.hdSPARows();
    const compare = window.hdSPASeriesComparison(grouped);
    const html = window.hdSPASeriesComparisonHtml(grouped);
    const text = window.hdSPASeriesComparisonText(grouped);
    return {compare,html,text};
  });

  expect(data.compare).toHaveLength(2);
  const a = data.compare.find(x=>x.seriesId==='s-a');
  const b = data.compare.find(x=>x.seriesId==='s-b');
  expect(a.completed).toBe(true);
  expect(a.resourcePerCycle).toBe(200);
  expect(a.avgCycleMin).toBe(1);
  expect(a.bossRate).toBe(100);
  expect(b.resourcePerCycle).toBe(120);
  expect(b.retreatRate).toBe(50);
  expect(b.badges).toContain('資源/周 最小');
  expect(a.badges).toContain('平均時間 最短');
  expect(data.html).toContain('周回シリーズ比較');
  expect(data.html).toContain('完了');
  expect(data.html).toContain('進行中');
  expect(data.text).toContain('HarborDesk 周回シリーズ比較');
  expect(data.text).toContain('資源/周 120');
  expect(errors).toEqual([]);
});


test('release smoke: series comparison treats missing resource telemetry as unknown', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPASeriesComparison === 'function' &&
    typeof window.hdSPASeriesComparisonHtml === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'known-1',seriesId:'known',cycleIndex:1,map:'2-4',source:'session',at:1000,result:'S',boss:true,fuel:100,ammo:50,buckets:1},
      {id:'known-2',seriesId:'known',cycleIndex:2,map:'2-4',source:'session',at:2000,result:'S',boss:true,fuel:100,ammo:50,buckets:0},
      {id:'unknown-1',seriesId:'unknown',cycleIndex:1,map:'2-4',source:'kancolle-import',at:3000,result:'A',boss:true,fuel:0,ammo:0,steel:0,bauxite:0,buckets:0},
      {id:'unknown-2',seriesId:'unknown',cycleIndex:2,map:'2-4',source:'kancolle-import',at:4000,result:'A',boss:true,fuel:0,ammo:0,steel:0,bauxite:0,buckets:0}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','series');
    const grouped=window.hdSPARows();
    const compare=window.hdSPASeriesComparison(grouped);
    return {compare,html:window.hdSPASeriesComparisonHtml(grouped)};
  });

  const known=data.compare.find(x=>x.seriesId==='known');
  const unknown=data.compare.find(x=>x.seriesId==='unknown');
  expect(known.resourcePerCycle).toBe(150);
  expect(known.bucketsPerCycle).toBe(0.5);
  expect(unknown.resourcePerCycle).toBeNull();
  expect(unknown.bucketsPerCycle).toBeNull();
  expect(unknown.badges).not.toContain('資源/周 最小');
  expect(unknown.badges).not.toContain('バケツ/周 最小');
  expect(data.html).toContain('資源/周 <b>—</b>');
  expect(errors).toEqual([]);
});


test('release smoke: series comparison only awards best badges within the same map', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPASeriesComparison === 'function' &&
    typeof window.hdSPASeriesComparisonHtml === 'function'
  );

  const data = await page.evaluate(() => {
    const rows = [
      {id:'a1',seriesId:'map-a',cycleIndex:1,map:'2-4',source:'session',at:1000,result:'S',boss:true,fuel:120,ammo:80,buckets:1,durationMs:60000},
      {id:'a2',seriesId:'map-a',cycleIndex:2,map:'2-4',source:'session',at:2000,result:'S',boss:true,fuel:120,ammo:80,buckets:1,durationMs:60000},
      {id:'b1',seriesId:'map-b',cycleIndex:1,map:'3-2',source:'session',at:3000,result:'S',boss:true,fuel:20,ammo:20,buckets:0,durationMs:30000},
      {id:'b2',seriesId:'map-b',cycleIndex:2,map:'3-2',source:'session',at:4000,result:'S',boss:true,fuel:20,ammo:20,buckets:0,durationMs:30000}
    ];
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','series');
    const grouped=window.hdSPARows();
    const compare=window.hdSPASeriesComparison(grouped);
    return {compare,html:window.hdSPASeriesComparisonHtml(grouped),text:window.hdSPASeriesComparisonText(grouped)};
  });

  expect(data.compare).toHaveLength(2);
  expect(data.compare.every(x=>x.badges.length===0)).toBe(true);
  expect(data.html).toContain('2-4｜2周');
  expect(data.html).toContain('3-2｜2周');
  expect(data.text).toContain('[2-4]');
  expect(data.text).toContain('[3-2]');
  expect(errors).toEqual([]);
});


test('release smoke: updater uses GitHub main as release truth and exposes publish lag', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const source = await page.evaluate(async () => {
    const res = await fetch('./update-manager.js', { cache: 'no-store' });
    return res.text();
  });

  expect(source).toContain("const HD_APP_VERSION='1.0.480'");
  expect(source).toContain("const HD_APP_BUILD=480");
  expect(source).toContain("const HD_RELEASE_META_RAW='https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/app-version.json'");
  expect(source).toContain("publishedBuild:Number(published?.build??0)||0");
  expect(source).toContain("公開反映待ち");
  expect(source).toContain("publishedBuild<=HD_APP_BUILD");
  expect(errors).toEqual([]);
});


test('release smoke: build version cache-busts core and runtime assets', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const [index, updater, sw] = await Promise.all([
      fetch('./index.html', { cache: 'no-store' }).then(r => r.text()),
      fetch('./update-manager.js', { cache: 'no-store' }).then(r => r.text()),
      fetch('./sw.js', { cache: 'no-store' }).then(r => r.text())
    ]);
    return { index, updater, sw };
  });

  for (const asset of ['advanced-tools.js', 'kancolle-import.js', 'equipment-catalog.js', 'home-dashboard.js', 'update-manager.js']) {
    expect(data.index).toContain(`${asset}?v=480`);
  }
  expect(data.updater).toContain("const HD_APP_BUILD=480");
  expect(data.updater).toContain("function hdBuildAssetUrl(src)");
  expect(data.updater).toContain("script.src=hdScriptAssetUrl(src,attempt)");
  expect(data.updater).toContain("function hdScriptAssetUrl(src,attempt=0)");
  expect(data.updater).toContain("link.href=hdBuildAssetUrl(href)");
  expect(data.updater).toContain("navigator.serviceWorker.register(`./sw.js?v=${HD_APP_BUILD}`");
  expect(data.sw).toContain("harbordesk-pwa-v480");
  expect(data.sw).toContain("caches.match(req,{ignoreSearch:true})");
  expect(data.sw).toContain("'./refresh.html'");
  expect(errors).toEqual([]);
});

test('release smoke: recovery page preserves local data while clearing app caches', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./refresh.html', { cache: 'no-store' }).then(r => r.text()));
  expect(source).toContain('艦隊台帳・装備台帳などの端末内データは消しません');
  expect(source).toContain("navigator.serviceWorker.getRegistrations()");
  expect(source).toContain("k.startsWith('harbordesk-pwa-')");
  expect(source).toContain('const BUILD=480');
  expect(source).toContain("url.searchParams.set('hd_rescue',String(BUILD))");
  expect(source).not.toContain('localStorage.clear');
  expect(source).not.toContain('sessionStorage.clear');
  expect(errors).toEqual([]);
});

test('release smoke: userscript blocks handoff until ship and equipment ledger data are captured', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const source = await page.evaluate(async () => {
    const res = await fetch('./HarborDesk-Kancolle.user.js', { cache: 'no-store' });
    return res.text();
  });

  expect(source).toContain('// @version      1.0.15');
  expect(source).toContain("const HD_VERSION='1.0.15'");
  expect(source).toContain('// @downloadURL  https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/HarborDesk-Kancolle.user.js');
  expect(source).toContain('// @updateURL    https://raw.githubusercontent.com/f96tbrt29n-cmyk/HarborDesk-PWA/main/HarborDesk-Kancolle.meta.js');
  expect(source).toContain('function ledgerReady(c=captureCoverage())');
  expect(source).toContain('return !!(c.port&&c.equipment)');
  expect(source).toContain("port:has(/api_port\\/port|api_get_member\\/ship2/)");
  expect(source).toContain("sendEl.disabled=!ledger");
  expect(source).toContain("if(!ledgerReady(c))");
  expect(source).toContain('艦隊台帳・装備台帳を埋めるため');
  expect(errors).toEqual([]);
});


test('release smoke: complete game sync reports six core areas', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt: Date.now(),
      ships: 120,
      equipment: 300,
      materials: 8,
      decks: 4,
      quests: 0,
      docks: 0,
      sorties: 0,
      coverage: {
        ships: true,
        equipment: true,
        resources: true,
        fleets: true,
        quests: true,
        docks: true,
        sorties: false
      }
    }));
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const coverage = window.hdPHSyncCoverage?.();
    return {
      coreDone: coverage?.coreDone,
      coreTotal: coverage?.coreTotal,
      complete: coverage?.complete,
      text: document.querySelector('.hd-ph-coverage-block')?.textContent || ''
    };
  });

  expect(data.coreDone).toBe(6);
  expect(data.coreTotal).toBe(6);
  expect(data.complete).toBe(true);
  expect(data.text).toContain('主要 6/6');
  expect(errors).toEqual([]);
});

test('release smoke: synced fleet summary exposes flagship and mission state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      {
        deckId: 1,
        name: '第一艦隊',
        mission: [0, 0, 0, 0],
        ships: [
          { gameShipId: 1, name: '赤城', level: 99, nowHp: 80, maxHp: 80, cond: 49 },
          { gameShipId: 2, name: '加賀', level: 98, nowHp: 80, maxHp: 80, cond: 49 }
        ],
        syncedAt: Date.now()
      }
    ]));
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const fleets = window.hdPHFleetSummary?.() || [];
    return fleets[0] || null;
  });

  expect(data).toMatchObject({
    deckId: 1,
    flagship: '赤城',
    flagshipLevel: 99,
    shipCount: 2,
    status: '待機'
  });
  expect(errors).toEqual([]);
});

test('release smoke: compact home mode restores previous manual collapse state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-home-collapse-v1');
    localStorage.removeItem('harbordesk-home-compact-v1');
    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    window.hdPHSetCollapsed?.('resources', true);
    window.hdPHSetCompact?.(true);
    const compact = !!window.hdPHCompactLoad?.().enabled;
    window.hdPHSetCompact?.(false);

    return {
      compact,
      restored: document.querySelector('.hd-ph-resource-block')?.classList.contains('hd-ph-collapsed') || false,
      meta: window.hdPHCompactLoad?.()
    };
  });

  expect(data.compact).toBe(true);
  expect(data.restored).toBe(true);
  expect(data.meta?.enabled).toBe(false);
  expect(errors).toEqual([]);
});

test('release smoke: mobile dock exposes primary navigation controls', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.hdQNUpdateMobileDock?.();
    const dock = document.getElementById('hdMobileDock');
    return {
      dock: !!dock,
      home: !!dock?.querySelector('[data-hd-mobile-home]'),
      search: !!dock?.querySelector('[data-hd-mobile-search]'),
      sync: !!dock?.querySelector('[data-hd-mobile-sync]'),
      menu: !!dock?.querySelector('[data-hd-mobile-menu]')
    };
  });

  expect(data).toEqual({ dock: true, home: true, search: true, sync: true, menu: true });
  expect(errors).toEqual([]);
});

test('release smoke: quick navigation returns valid categories', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const rows = await page.evaluate(() => (window.hdQNCategoryRows?.() || []).map(x => x.group));
  expect(rows).toContain('home');
  expect(rows).toContain('fleet');
  expect(rows).toContain('guide');
  expect(errors).toEqual([]);
});

test('release smoke: resource minimums flag low stock in home and attention', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const now = Date.now();
    window.hdGetAppState = () => ({
      expeditions: [],
      docks: [],
      quests: [],
      resources: {
        fuel: 5000,
        ammo: 20000,
        steel: 30000,
        bauxite: 40000,
        savedAt: now
      }
    });
    localStorage.setItem('harbordesk-kancolle-materials-v1', JSON.stringify({ bucket: 40, syncedAt: now }));
    localStorage.setItem('harbordesk-resource-thresholds-v1', JSON.stringify({
      fuel: 10000,
      ammo: 10000,
      steel: 10000,
      bauxite: 10000,
      bucket: 100
    }));

    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    const summary = window.hdPHResourceSummary?.();
    const resourceAttention = (window.hdQNMobileAttentionItems?.() || []).find(x => x.id === 'resources');
    return {
      alerts: (summary?.alerts || []).map(x => x.key),
      lowCards: [...document.querySelectorAll('.hd-ph-resource-grid > button.low')].map(x => x.querySelector('small')?.textContent || ''),
      header: document.querySelector('.hd-ph-resource-block .hd-ph-sub')?.textContent || '',
      attention: resourceAttention ? {
        title: resourceAttention.title,
        detail: resourceAttention.detail,
        reason: resourceAttention.reason
      } : null
    };
  });

  expect(data.alerts).toEqual(['fuel', 'bucket']);
  expect(data.lowCards).toContain('燃料');
  expect(data.lowCards).toContain('バケツ');
  expect(data.header).toContain('不足 2件');
  expect(data.attention?.reason).toBe('資源最低ライン');
  expect(data.attention?.title).toContain('2件');
  expect(data.attention?.detail).toContain('燃料');
  expect(data.attention?.detail).toContain('バケツ');
  expect(errors).toEqual([]);
});

test('release smoke: home shows return-to-game action only for sync handoff', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    sessionStorage.removeItem('harbordesk-kc-return-game-v1');
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const hiddenBefore = !document.querySelector('[data-ph-return-game]');

    sessionStorage.setItem('harbordesk-kc-return-game-v1', '1');
    window.dispatchEvent(new CustomEvent('hd:kancolle-return-ready'));
    await window.hdPHRender?.();
    const button = document.querySelector('[data-ph-return-game]');
    const shown = !!button;
    const text = button?.textContent || '';
    const helper = typeof window.hdPHReturnGame;

    sessionStorage.removeItem('harbordesk-kc-return-game-v1');
    await window.hdPHRender?.();
    const hiddenAfter = !document.querySelector('[data-ph-return-game]');

    return { hiddenBefore, shown, text, helper, hiddenAfter };
  });

  expect(data.hiddenBefore).toBe(true);
  expect(data.shown).toBe(true);
  expect(data.text).toContain('艦これへ戻る');
  expect(data.helper).toBe('function');
  expect(data.hiddenAfter).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: personal home order storage stays isolated', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const legacy = ['quick', 'resources', 'recent', 'procurement'];
    localStorage.setItem('harbordesk-home-order-v1', JSON.stringify(legacy));
    localStorage.removeItem('harbordesk-personal-home-order-v1');

    const initial = window.hdPHOrderLoad?.() || [];
    window.hdPHOrderSave?.(['resources', 'coverage', 'attention', 'next', 'fleets', 'condition']);

    return {
      legacy: JSON.parse(localStorage.getItem('harbordesk-home-order-v1') || '[]'),
      personal: JSON.parse(localStorage.getItem('harbordesk-personal-home-order-v1') || '[]'),
      initial
    };
  });

  expect(data.legacy).toEqual(['quick', 'resources', 'recent', 'procurement']);
  expect(data.initial).toEqual(['coverage', 'attention', 'next', 'resources', 'fleets', 'condition']);
  expect(data.personal).toEqual(['resources', 'coverage', 'attention', 'next', 'fleets', 'condition']);
  expect(errors).toEqual([]);
});

test('release smoke: backup can be shared as a JSON file on supported devices', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-share-smoke-v1', JSON.stringify({ ok: true }));
    window.__hdSharePayload = null;
    try {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: payload => !!payload?.files?.length });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => {
        const file = payload?.files?.[0];
        window.__hdSharePayload = file ? {
          title: payload.title || '',
          name: file.name || '',
          type: file.type || '',
          text: await file.text()
        } : null;
      }});
    } catch {}

    const result = await window.shareBackup?.();
    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    let parsed = null;
    try { parsed = JSON.parse(window.__hdSharePayload?.text || 'null'); } catch {}
    return {
      result,
      share: window.__hdSharePayload,
      parsedValue: parsed?.localStorage?.['harbordesk-share-smoke-v1'] || '',
      advancedButton: !!document.getElementById('shareBackup'),
      homeButton: !!document.querySelector('[data-ph-share-backup]')
    };
  });

  expect(data.result).toBe(true);
  expect(data.share?.title || '').toContain('HarborDesk');
  expect(data.share?.name || '').toMatch(/^HarborDesk-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(data.share?.type).toBe('application/json');
  expect(data.parsedValue).toBe(JSON.stringify({ ok: true }));
  expect(data.advancedButton).toBe(true);
  expect(data.homeButton).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: backup falls back to JSON export when sharing is unavailable', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    window.__hdFallbackExports = 0;
    try {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
    } catch {}
    window.exportBackup = () => { window.__hdFallbackExports += 1; return true; };

    const result = await window.shareBackup?.();
    return {
      result,
      exports: window.__hdFallbackExports,
      marked: Number(localStorage.getItem('harbordesk-last-external-backup-v1') || 0)
    };
  });

  expect(data.result).toBe(true);
  expect(data.exports).toBe(1);
  expect(data.marked).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('release smoke: cancelling share sheet does not trigger fallback download', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    window.__hdFallbackExports = 0;
    try {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {
        throw new DOMException('cancelled', 'AbortError');
      }});
    } catch {}
    window.exportBackup = () => { window.__hdFallbackExports += 1; return true; };

    const result = await window.shareBackup?.();
    return {
      result,
      exports: window.__hdFallbackExports,
      marked: localStorage.getItem('harbordesk-last-external-backup-v1')
    };
  });

  expect(data.result).toBe(false);
  expect(data.exports).toBe(0);
  expect(data.marked).toBeNull();
  expect(errors).toEqual([]);
});

test('release smoke: backup warning follows latest game sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const now = Date.now();
    localStorage.setItem('harbordesk-last-external-backup-v1', String(now - 5 * 60 * 1000));
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt: now,
      coverage: { ships:true, equipment:true, resources:true, fleets:true, quests:true, docks:true }
    }));
    await window.hdPHRender?.();
    const stale = window.hdPHExternalText?.();
    const staleText = document.querySelector('.hd-ph-backup-alert')?.textContent || '';

    localStorage.setItem('harbordesk-last-external-backup-v1', String(now + 1000));
    await window.hdPHRender?.();
    const fresh = window.hdPHExternalText?.();
    const freshAlert = document.querySelector('.hd-ph-backup-alert');

    return {
      stale: {
        due: !!stale?.due,
        afterSync: !!stale?.afterSync,
        label: stale?.label || '',
        title: stale?.title || '',
        text: staleText
      },
      fresh: {
        due: !!fresh?.due,
        afterSync: !!fresh?.afterSync,
        label: fresh?.label || '',
        alertPresent: !!freshAlert
      }
    };
  });

  expect(data.stale.due).toBe(true);
  expect(data.stale.afterSync).toBe(true);
  expect(data.stale.label).toBe('同期後未保存');
  expect(data.stale.title).toContain('同期後');
  expect(data.stale.text).toContain('同期後');
  expect(data.fresh.due).toBe(false);
  expect(data.fresh.afterSync).toBe(false);
  expect(data.fresh.label).toBe('今日');
  expect(data.fresh.alertPresent).toBe(false);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('release smoke: ship image backup exposes share action and records backup time', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.alert = () => {};
    localStorage.removeItem('harbordesk-last-ship-image-backup-v1');
    const dialog = window.hdShipImageEnsureDialog?.();
    const name = window.hdShipImageBackupName?.() || '';
    const at = window.hdShipImageMarkBackup?.() || 0;
    return {
      shareFn: typeof window.hdShipImageShareBackup,
      shareButton: !!dialog?.querySelector('[data-hd-ship-image-share]'),
      filename: name,
      markedAt: at,
      storedAt: Number(localStorage.getItem('harbordesk-last-ship-image-backup-v1') || 0)
    };
  });

  expect(data.shareFn).toBe('function');
  expect(data.shareButton).toBe(true);
  expect(data.filename).toContain('HarborDesk-ship-images-');
  expect(data.filename).toMatch(/\.hdshipimg$/);
  expect(data.markedAt).toBeGreaterThan(0);
  expect(data.storedAt).toBe(data.markedAt);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('release smoke: backup restore preview can cancel without changing data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.importBackup === 'function' &&
    typeof window.hdAnalyzeBackupLocalStorage === 'function'
  );

  await page.evaluate(() => {
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i);
      if(key?.startsWith('harbordesk'))localStorage.removeItem(key);
    }
    localStorage.setItem('harbordesk-preview-keep', JSON.stringify({ value: 'old' }));
    localStorage.setItem('harbordesk-preview-remove', JSON.stringify({ remove: true }));
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      localStorage: {
        'harbordesk-preview-keep': JSON.stringify({ value: 'new' }),
        'harbordesk-preview-new': JSON.stringify({ added: true })
      }
    };
    window.__hdPreviewExpected = window.hdAnalyzeBackupLocalStorage(backup.localStorage);
    const file = new File([JSON.stringify(backup)], 'HarborDesk-preview.json', { type: 'application/json' });
    window.__hdPreviewImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-meta]')).toContainText('HarborDesk-preview.json');
  const expected = await page.evaluate(() => window.__hdPreviewExpected);
  await expect(dialog.locator('.hd-backup-preview-grid .add')).toContainText(`${expected.added}件`);
  await expect(dialog.locator('.hd-backup-preview-grid .update')).toContainText(`${expected.updated}件`);
  const removedText=await dialog.locator('.hd-backup-preview-grid .remove').textContent()||'';
  const removedCount=Number(removedText.match(/(\d+)件/)?.[1]||0);
  expect(expected.added).toBe(1);
  expect(expected.updated).toBe(1);
  expect(expected.removed).toBeGreaterThanOrEqual(1);
  expect(removedCount).toBeGreaterThanOrEqual(1);

  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => {
    const imported = await window.__hdPreviewImportPromise;
    return {
      imported,
      keep: localStorage.getItem('harbordesk-preview-keep'),
      removedCandidate: localStorage.getItem('harbordesk-preview-remove'),
      addedCandidate: localStorage.getItem('harbordesk-preview-new')
    };
  });

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.keep).value).toBe('old');
  expect(JSON.parse(result.removedCandidate).remove).toBe(true);
  expect(result.addedCandidate).toBeNull();
  expect(errors).toEqual([]);
});


test('release smoke: backup compatibility blocks newer formats', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdAnalyzeBackupCompatibility === 'function' &&
    typeof window.importBackup === 'function'
  );

  const metadata = await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    const current = window.hdAnalyzeBackupCompatibility(built.data);
    const future = window.hdAnalyzeBackupCompatibility({
      ...built.data,
      version: 2
    });
    return {
      name: built.data.app?.name || '',
      version: built.data.app?.version || '',
      build: built.data.app?.build,
      currentBlocked: !!current.blocked,
      futureBlocked: !!future.blocked,
      futureReason: future.reason || ''
    };
  });

  expect(metadata.name).toBe('HarborDesk');
  expect(metadata.version).toMatch(/^1\.0\.\d+$/);
  expect(Number(metadata.build)).toBeGreaterThan(0);
  expect(metadata.currentBlocked).toBe(false);
  expect(metadata.futureBlocked).toBe(true);
  expect(metadata.futureReason).toContain('新しい形式');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-compat-keep', JSON.stringify({ value: 'safe' }));
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      app: { name: 'HarborDesk', version: '9.9.9', build: 9999 },
      localStorage: {
        'harbordesk-compat-keep': JSON.stringify({ value: 'unsafe' })
      }
    };
    const file = new File([JSON.stringify(backup)], 'HarborDesk-future.json', { type: 'application/json' });
    window.__hdCompatImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('復元できないバックアップ');
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('新しい形式');
  await expect(dialog.locator('button[value="restore"]')).toBeDisabled();
  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdCompatImportPromise,
    keep: localStorage.getItem('harbordesk-compat-keep')
  }));
  expect(result.imported).toBe(false);
  expect(JSON.parse(result.keep).value).toBe('safe');
  expect(errors).toEqual([]);
});


test('release smoke: backup integrity blocks tampered files', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdAnalyzeBackupIntegrity === 'function' &&
    typeof window.importBackup === 'function'
  );

  const generated = await page.evaluate(() => {
    localStorage.setItem('harbordesk-integrity-target', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    const check = window.hdAnalyzeBackupIntegrity(built.data);
    return {
      algorithm: built.data.integrity?.algorithm || '',
      hash: built.data.integrity?.hash || '',
      state: check.state,
      blocked: !!check.blocked
    };
  });

  expect(generated.algorithm).toBe('fnv1a32');
  expect(generated.hash).toMatch(/^[0-9a-f]{8}$/);
  expect(generated.state).toBe('ok');
  expect(generated.blocked).toBe(false);

  await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-integrity-target'] = JSON.stringify({ value: 'tampered' });
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-tampered.json', { type: 'application/json' });
    window.__hdIntegrityImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('復元できないバックアップ');
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('チェックサム');
  await expect(dialog.locator('button[value="restore"]')).toBeDisabled();
  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdIntegrityImportPromise,
    current: localStorage.getItem('harbordesk-integrity-target')
  }));
  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(errors).toEqual([]);
});


test('release smoke: restore aborts when safety snapshot fails', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdBackupChecksum === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-snapshot-guard', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-snapshot-guard'] = JSON.stringify({ value: 'incoming' });
    built.data.integrity.hash = window.hdBackupChecksum(built.data);
    window.__hdSnapshotGuardAlerts = [];
    window.alert = message => window.__hdSnapshotGuardAlerts.push(String(message || ''));
    window.hdPHCreateSnapshot = async () => false;
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-snapshot-fail.json', { type: 'application/json' });
    window.__hdSnapshotGuardPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('整合性確認済み');
  await dialog.locator('button[value="restore"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdSnapshotGuardPromise,
    current: localStorage.getItem('harbordesk-snapshot-guard'),
    alerts: window.__hdSnapshotGuardAlerts || []
  }));

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(result.alerts.join(' ')).toContain('スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: external restore transaction rolls back partial writes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdCaptureHarborLocalStorage === 'function' &&
    typeof window.hdApplyBackupTransaction === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.setItem('harbordesk-rollback-a', JSON.stringify({ value: 'safe-a' }));
    localStorage.setItem('harbordesk-rollback-b', JSON.stringify({ value: 'safe-b' }));
    const before = window.hdCaptureHarborLocalStorage();
    const target = {
      'harbordesk-rollback-a': JSON.stringify({ value: 'incoming' })
    };
    const tx = window.hdApplyBackupTransaction(target, before, () => {
      localStorage.setItem('harbordesk-rollback-a', JSON.stringify({ value: 'partial' }));
      localStorage.removeItem('harbordesk-rollback-b');
    });
    return {
      ok: !!tx.ok,
      rollbackOk: !!tx.rollback?.ok,
      a: localStorage.getItem('harbordesk-rollback-a'),
      b: localStorage.getItem('harbordesk-rollback-b'),
      expectedA: before['harbordesk-rollback-a'],
      expectedB: before['harbordesk-rollback-b']
    };
  });

  expect(result.ok).toBe(false);
  expect(result.rollbackOk).toBe(true);
  expect(result.a).toBe(result.expectedA);
  expect(result.b).toBe(result.expectedB);
  expect(errors).toEqual([]);
});


test('release smoke: snapshot restore transaction rolls back partial writes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHHarborData === 'function' &&
    typeof window.hdPHRestoreTransaction === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ph-rollback-a', JSON.stringify({ value: 'safe-a' }));
    localStorage.setItem('harbordesk-ph-rollback-b', JSON.stringify({ value: 'safe-b' }));
    const before = window.hdPHHarborData();
    const target = {
      'harbordesk-ph-rollback-a': JSON.stringify({ value: 'incoming' })
    };
    const tx = window.hdPHRestoreTransaction(target, before, () => {
      localStorage.setItem('harbordesk-ph-rollback-a', JSON.stringify({ value: 'partial' }));
      localStorage.removeItem('harbordesk-ph-rollback-b');
    });
    return {
      ok: !!tx.ok,
      rollbackOk: !!tx.rollback?.ok,
      a: localStorage.getItem('harbordesk-ph-rollback-a'),
      b: localStorage.getItem('harbordesk-ph-rollback-b'),
      expectedA: before['harbordesk-ph-rollback-a'],
      expectedB: before['harbordesk-ph-rollback-b']
    };
  });

  expect(result.ok).toBe(false);
  expect(result.rollbackOk).toBe(true);
  expect(result.a).toBe(result.expectedA);
  expect(result.b).toBe(result.expectedB);
  expect(errors).toEqual([]);
});


test('release smoke: restore refuses to run without safety snapshot layer', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-safety-layer', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-safety-layer'] = JSON.stringify({ value: 'incoming' });
    built.data.integrity.hash = window.hdBackupChecksum(built.data);
    window.__hdSafetyLayerAlerts = [];
    window.alert = message => window.__hdSafetyLayerAlerts.push(String(message || ''));
    window.__hdOriginalSnapshotFn = window.hdPHCreateSnapshot;
    window.hdPHCreateSnapshot = undefined;
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-no-safety-layer.json', { type: 'application/json' });
    window.__hdSafetyLayerPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('button[value="restore"]').click();

  const result = await page.evaluate(async () => {
    const imported = await window.__hdSafetyLayerPromise;
    const current = localStorage.getItem('harbordesk-safety-layer');
    const alerts = window.__hdSafetyLayerAlerts || [];
    window.hdPHCreateSnapshot = window.__hdOriginalSnapshotFn;
    delete window.__hdOriginalSnapshotFn;
    return { imported, current, alerts };
  });

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(result.alerts.join(' ')).toContain('安全スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: scheduled snapshot tolerates unavailable snapshot creator', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHAutoSnapshot === 'function' &&
    typeof window.hdPHGetSnapshots === 'function' &&
    typeof window.hdPHCreateSnapshot === 'function'
  );

  const result = await page.evaluate(async () => {
    const originalGet = window.hdPHGetSnapshots;
    const originalCreate = window.hdPHCreateSnapshot;
    window.hdPHGetSnapshots = async () => [];
    window.hdPHCreateSnapshot = undefined;
    try {
      return await window.hdPHAutoSnapshot();
    } finally {
      window.hdPHGetSnapshots = originalGet;
      window.hdPHCreateSnapshot = originalCreate;
    }
  });

  expect(result).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: concurrent backup restores are locked', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    window.__hdConcurrentAlerts = [];
    window.alert = message => window.__hdConcurrentAlerts.push(String(message || ''));
    const file1 = new File([JSON.stringify(built.data)], 'HarborDesk-first.json', { type: 'application/json' });
    const file2 = new File([JSON.stringify(built.data)], 'HarborDesk-second.json', { type: 'application/json' });
    window.__hdFirstRestorePromise = window.importBackup(file1);
    window.__hdSecondRestorePromise = window.importBackup(file2);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();

  const second = await page.evaluate(async () => await window.__hdSecondRestorePromise);
  expect(second).toBe(false);

  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    first: await window.__hdFirstRestorePromise,
    busy: !!window.__hdBackupRestoreBusy,
    alerts: window.__hdConcurrentAlerts || []
  }));

  expect(result.first).toBe(false);
  expect(result.busy).toBe(false);
  expect(result.alerts.join(' ')).toContain('進行中');
  expect(errors).toEqual([]);
});


test('release smoke: diagnostics verifies restore safety layer readiness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdDXCollect === 'function' &&
    typeof window.hdPHOpenDb === 'function' &&
    typeof window.hdPHCreateSnapshot === 'function'
  );

  const result = await page.evaluate(async () => {
    const healthy = await window.hdDXCollect(false);
    const afterProbe = await window.hdPHGetSnapshots();
    const originalOpenDb = window.hdPHOpenDb;
    window.hdPHOpenDb = async () => { throw new Error('snapshot store unavailable'); };
    const broken = await window.hdDXCollect(false);
    window.hdPHOpenDb = originalOpenDb;
    return {
      healthyReady: !!healthy.restoreSafety?.ready,
      healthyStore: !!healthy.restoreSafety?.storeReady,
      healthyProbe: !!healthy.restoreSafety?.probeOk,
      probeLeaks: afterProbe.filter(x => String(x?.id || '').startsWith('__hd-safety-probe-')).length,
      brokenReady: !!broken.restoreSafety?.ready,
      brokenError: broken.restoreSafety?.error || '',
      brokenIssues: broken.issues || []
    };
  });

  expect(result.healthyReady).toBe(true);
  expect(result.healthyStore).toBe(true);
  expect(result.healthyProbe).toBe(true);
  expect(result.probeLeaks).toBe(0);
  expect(result.brokenReady).toBe(false);
  expect(result.brokenError).toContain('snapshot store unavailable');
  expect(result.brokenIssues.join(' ')).toContain('復元安全スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: mobile attention tracks external backup freshness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNBackupAttention === 'function' &&
    typeof window.hdQNMobileAttentionItems === 'function'
  );

  const result = await page.evaluate(() => {
    const now = Date.now();
    const backupKey = 'harbordesk-last-external-backup-v1';
    const syncKey = 'harbordesk-kancolle-sync-v1';

    localStorage.removeItem(backupKey);
    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now }));
    const missing = window.hdQNBackupAttention(now);
    const missingInAttention = window.hdQNMobileAttentionItems().some(x => x?.id === 'backup');

    localStorage.setItem(backupKey, String(now + 1000));
    const fresh = window.hdQNBackupAttention(now);
    const freshInAttention = window.hdQNMobileAttentionItems().some(x => x?.id === 'backup');

    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now - 16 * 86400000 }));
    localStorage.setItem(backupKey, String(now - 15 * 86400000));
    const old = window.hdQNBackupAttention(now);

    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now }));
    localStorage.setItem(backupKey, String(now - 60 * 1000));
    const afterSync = window.hdQNBackupAttention(now);

    return {
      missingTitle: missing?.title || '',
      missingPriority: Number(missing?.priority) || 0,
      missingInAttention,
      freshIsNull: fresh === null,
      freshInAttention,
      oldTitle: old?.title || '',
      oldDetail: old?.detail || '',
      afterSyncTitle: afterSync?.title || '',
      afterSyncPriority: Number(afterSync?.priority) || 0
    };
  });

  expect(result.missingTitle).toContain('バックアップ');
  expect(result.missingPriority).toBe(60);
  expect(result.missingInAttention).toBe(true);
  expect(result.freshIsNull).toBe(true);
  expect(result.freshInAttention).toBe(false);
  expect(result.oldTitle).toContain('更新');
  expect(result.oldDetail).toContain('15日');
  expect(result.afterSyncTitle).toContain('同期後');
  expect(result.afterSyncPriority).toBe(60);
  expect(errors).toEqual([]);
});


test('release smoke: mobile attention offers one-tap backup action', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNOpenAttention === 'function' &&
    typeof window.hdQNRunAttentionAction === 'function'
  );

  const result = await page.evaluate(async () => {
    const now = Date.now();
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({ syncedAt: now }));

    window.hdQNOpenAttention();
    const dialog = document.getElementById('hdMobileAttentionDialog');
    const action = document.querySelector('[data-hd-attention-action="backup-now"]');
    const label = action?.textContent || '';

    const originalShare = window.shareBackup;
    let calls = 0;
    window.shareBackup = async () => { calls++; return false; };
    const cancelled = await window.hdQNRunAttentionAction('backup-now', 'backup');
    const openAfterCancel = !!dialog?.open;

    window.shareBackup = async () => { calls++; return true; };
    const saved = await window.hdQNRunAttentionAction('backup-now', 'backup');
    const openAfterSave = !!dialog?.open;

    window.shareBackup = originalShare;
    return {
      hasAction: !!action,
      label,
      cancelled,
      saved,
      openAfterCancel,
      openAfterSave,
      calls
    };
  });

  expect(result.hasAction).toBe(true);
  expect(result.label).toContain('今すぐ保存');
  expect(result.cancelled).toBe(false);
  expect(result.openAfterCancel).toBe(true);
  expect(result.saved).toBe(true);
  expect(result.openAfterSave).toBe(false);
  expect(result.calls).toBe(2);
  expect(errors).toEqual([]);
});


test('release smoke: backup reminder detects meaningful local data without sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNHasMeaningfulBackupData === 'function' &&
    typeof window.hdQNBackupAttention === 'function'
  );

  const result = await page.evaluate(() => {
    const backupKey = 'harbordesk-last-external-backup-v1';
    const syncKey = 'harbordesk-kancolle-sync-v1';
    const contentKeys = window.HD_QN_BACKUP_CONTENT_KEYS || [
      'harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-sortie-log-v1',
      'harbordesk-drop-hunts-v1','harbordesk-activity-log-v1','harbordesk-quest-progress-v1',
      'harbordesk-event-operations-v1','harbordesk-ship-profiles-v1','harbordesk-equipment-variants-v1',
      'harbordesk-resource-goals-v1','harbordesk-resource-history-v1','harbordesk-custom-fleets-v1',
      'harbordesk-training-plans-v1','harbordesk-exercise-routine-v1','harbordesk-equipment-procurement-v1',
      'harbordesk-equipment-procurement-history-v1','harbordesk-material-stock-v1','harbordesk-material-goals-v1',
      'harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1'
    ];

    localStorage.removeItem(backupKey);
    localStorage.removeItem(syncKey);
    for (const key of contentKeys) localStorage.removeItem(key);

    localStorage.setItem('harbordesk-quick-nav-recent-v1', JSON.stringify([{ id: 'home', at: Date.now() }]));
    const blank = window.hdQNHasMeaningfulBackupData();
    const blankAttention = window.hdQNBackupAttention();

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([{ id: '1', name: 'テスト艦', level: 1 }]));
    const roster = window.hdQNHasMeaningfulBackupData();
    const rosterAttention = window.hdQNBackupAttention();

    localStorage.removeItem('harbordesk-ship-roster-v1');
    const originalState = window.hdGetAppState;
    window.hdGetAppState = undefined;
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions: [],
      docks: [],
      quests: [{ id: 'q1', name: '手入力任務', done: false }],
      resources: { fuel: '', ammo: '', steel: '', bauxite: '', savedAt: null }
    }));
    const core = window.hdQNHasMeaningfulBackupData();
    const coreAttention = window.hdQNBackupAttention();
    window.hdGetAppState = originalState;

    return {
      blankHasData: !!blank.hasData,
      blankAttention: blankAttention?.title || '',
      rosterHasData: !!roster.hasData,
      rosterTitle: rosterAttention?.title || '',
      rosterPriority: Number(rosterAttention?.priority) || 0,
      coreHasData: !!core.hasData,
      coreTitle: coreAttention?.title || ''
    };
  });

  expect(result.blankHasData).toBe(false);
  expect(result.blankAttention).toBe('');
  expect(result.rosterHasData).toBe(true);
  expect(result.rosterTitle).toContain('バックアップ未作成');
  expect(result.rosterPriority).toBe(50);
  expect(result.coreHasData).toBe(true);
  expect(result.coreTitle).toContain('バックアップ未作成');
  expect(errors).toEqual([]);
});


test('release smoke: every selectable map has real攻略 and drop data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof MAPS !== 'undefined' &&
    typeof MAP_DETAILS !== 'undefined' &&
    typeof HD_MAP_DROP_DATA !== 'undefined'
  );

  const result = await page.evaluate(() => {
    const maps = Object.values(MAPS).flat();
    const required = {
      name: ['name'],
      overview: ['overview'],
      formation: ['fleet','formation'],
      route: ['route'],
      air: ['air'],
      caution: ['note','caution']
    };
    const missingDetails = [];
    const missingDrops = [];

    for (const map of maps) {
      const detail = MAP_DETAILS[map];
      if (!detail) {
        missingDetails.push({ map, reason: 'missing detail row' });
      } else {
        const empty = Object.entries(required)
          .filter(([,aliases]) => !aliases.some(key => String(detail[key] || '').trim()))
          .map(([label]) => label);
        if (empty.length) missingDetails.push({ map, reason: 'empty fields', fields: empty });
      }

      const drop = HD_MAP_DROP_DATA[map];
      if (!drop || !Array.isArray(drop.nodes) || !drop.nodes.length) {
        missingDrops.push({ map, reason: 'missing drop nodes' });
      } else if (drop.nodes.some(node => !String(node?.node || '').trim() || !String(node?.ships || '').trim())) {
        missingDrops.push({ map, reason: 'empty drop node data' });
      }
    }

    return { count: maps.length, missingDetails, missingDrops };
  });

  expect(result.count).toBe(37);
  expect(result.missingDetails).toEqual([]);
  expect(result.missingDrops).toEqual([]);
  expect(errors).toEqual([]);
});


test('release smoke: every map shows recommended level guidance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapLevelGuide === 'function' &&
    typeof window.renderMapPicker === 'function'
  );

  const result = await page.evaluate(() => {
    const maps = Object.values(MAPS).flat();
    const guides = maps.map(map => ({ map, ...window.hdMapLevelGuide(map) }));
    const missing = guides.filter(x =>
      !x.recommended || x.recommended === '個別確認' ||
      !x.min || x.min === '目安なし' ||
      !x.note
    );

    selectedWorld = '2';
    selectedMap = '2-4';
    window.renderMapPicker();
    const card = document.getElementById('selectedMapCard')?.textContent || '';

    return {
      mapCount: maps.length,
      missing,
      sample: window.hdMapLevelGuide('2-4'),
      hardSample: window.hdMapLevelGuide('5-6'),
      hasLabel: card.includes('推奨練度'),
      hasRecommended: card.includes('平均Lv40〜50'),
      hasDisclaimer: card.includes('HarborDeskの攻略目安')
    };
  });

  expect(result.mapCount).toBe(37);
  expect(result.missing).toEqual([]);
  expect(result.sample.recommended).toBe('平均Lv40〜50');
  expect(result.sample.min).toBe('Lv30〜35');
  expect(result.hardSample.recommended).toBe('平均Lv90〜110');
  expect(result.hasLabel).toBe(true);
  expect(result.hasRecommended).toBe(true);
  expect(result.hasDisclaimer).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: every map opens every攻略 tab with usable content', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapActivateTab === 'function' &&
    typeof window.renderMapPicker === 'function',
    null,
    { timeout: 30000 }
  );

  const result = await page.evaluate(() => {
    const maps = Object.values(MAPS).flat();
    const tabs = ['overview','map','fleet','route','gear','quest','drop','mine'];
    const failures = [];

    for (const map of maps) {
      selectedWorld = String(map).split('-')[0];
      selectedMap = map;
      window.renderMapPicker();

      for (const tab of tabs) {
        const btn = document.querySelector(`[data-map-tab="${tab}"]`);
        const pane = document.querySelector(`[data-map-pane="${tab}"]`);
        if (!btn || !pane) {
          failures.push({ map, tab, reason: !btn ? 'missing button' : 'missing pane' });
          continue;
        }
        const opened = window.hdMapActivateTab(tab, btn);
        const text = String(pane.textContent || '').replace(/\\s+/g, ' ').trim();
        if (!opened || !pane.classList.contains('active')) {
          failures.push({ map, tab, reason: 'did not activate' });
        } else if (!text) {
          failures.push({ map, tab, reason: 'empty pane' });
        }
      }
    }

    selectedWorld = '2';
    selectedMap = '2-4';
    window.renderMapPicker();
    return { mapCount: maps.length, failures };
  });

  expect(result.mapCount).toBe(37);
  expect(result.failures).toEqual([]);
  expect(errors).toEqual([]);
});


test('release smoke: map攻略 tools survive tab redraws', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdRenderMapEquipmentRecommendations === 'function' &&
    typeof window.hdRenderLandBasePlanner === 'function' &&
    typeof window.hdFCRender === 'function' &&
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function' &&
    typeof window.hdSPSMapButton === 'function' &&
    typeof window.hdFSMapButton === 'function',
    null,
    { timeout: 30000 }
  );

  const result = await page.evaluate(async () => {
    const tick = ms => new Promise(resolve => setTimeout(resolve, ms));
    const selectMap = async (world, map) => {
      selectedWorld = world;
      selectedMap = map;
      renderMapPicker();
      await tick(120);
    };
    const clickTab = async tab => {
      document.querySelector(`[data-map-tab="${tab}"]`)?.click();
      await tick(120);
    };

    await selectMap('5', '5-6');
    await clickTab('map');
    const tabs = [...document.querySelectorAll('.map-tab-btn')].map(x => x.dataset.mapTab);
    const stageButtons = document.querySelectorAll('[data-hd-map-stage="5-6"]').length;
    const structureNodes = document.querySelectorAll('.hd-map-structure-guide .hd-map-node').length;
    const routeHighlight = !!document.getElementById('hdRouteHighlight');
    const nodeInfo = !!document.getElementById('hdMapNodeInfo');
    const prepButton = !!document.querySelector('[data-hd-sps-open]');
    const fleetSuggestButton = !!document.querySelector('[data-hd-fs-open]');

    await clickTab('drop');
    const dropPanel = !!document.querySelector('.hd-map-drop-panel');

    await clickTab('fleet');
    const fleetCandidates = !!document.querySelector('.hd-map-ship-recommend');

    await selectMap('6', '6-4');
    await clickTab('route');
    const routeRequirements = document.getElementById('hdMapRouteRequirements')?.textContent || '';

    await clickTab('gear');
    const equipRecommend = !!document.querySelector('#hdMapEquipRecommend .hd-map-equip-recommend');
    const landBase = !!document.getElementById('hdLandBasePlanner');
    const fleetCalc = !!document.getElementById('hdFleetCalculator');

    await selectMap('5', '5-5');
    await clickTab('mine');
    const customFleet = !!document.getElementById('customFleetPanel');
    const readiness = !!document.getElementById('hdSortieReadiness');
    const support = !!document.getElementById('hdSupportPlanner');
    const headerActionsAfterRedraw =
      !!document.querySelector('[data-hd-sps-open]') &&
      !!document.querySelector('[data-hd-fs-open]');

    return {
      tabs,
      stageButtons,
      structureNodes,
      routeHighlight,
      nodeInfo,
      prepButton,
      fleetSuggestButton,
      dropPanel,
      fleetCandidates,
      routeRequirements,
      equipRecommend,
      landBase,
      fleetCalc,
      customFleet,
      readiness,
      support,
      headerActionsAfterRedraw
    };
  });

  expect(result.tabs).toEqual(['overview','map','fleet','route','gear','quest','drop','mine']);
  expect(result.stageButtons).toBe(3);
  expect(result.structureNodes).toBeGreaterThan(3);
  expect(result.routeHighlight).toBe(true);
  expect(result.nodeInfo).toBe(true);
  expect(result.prepButton).toBe(true);
  expect(result.fleetSuggestButton).toBe(true);
  expect(result.dropPanel).toBe(true);
  expect(result.fleetCandidates).toBe(true);
  expect(result.routeRequirements).toContain('索敵');
  expect(result.routeRequirements).toContain('基地航空隊');
  expect(result.equipRecommend).toBe(true);
  expect(result.landBase).toBe(true);
  expect(result.fleetCalc).toBe(true);
  expect(result.customFleet).toBe(true);
  expect(result.readiness).toBe(true);
  expect(result.support).toBe(true);
  expect(result.headerActionsAfterRedraw).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: every selectable map renders every攻略 tab', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapTabsCoreApply === 'function' &&
    typeof window.hdEnhanceMapPane === 'function',
    null,
    { timeout: 30000 }
  );

  const result = await page.evaluate(async () => {
    const tick = ms => new Promise(resolve => setTimeout(resolve, ms));
    const failures = [];
    const tabIds = ['overview','map','fleet','route','gear','quest','drop','mine'];
    let checkedMaps = 0;
    let checkedTabs = 0;

    for (const [world, maps] of Object.entries(MAPS)) {
      for (const map of maps) {
        selectedWorld = world;
        selectedMap = map;
        renderMapPicker();
        await tick(20);
        checkedMaps++;

        if (!document.querySelector('#selectedMapCard .map-tabs-shell')) {
          failures.push({ map, tab:'shell', reason:'missing map tabs shell' });
          continue;
        }

        for (const tab of tabIds) {
          const button = document.querySelector(`#selectedMapCard [data-map-tab="${tab}"]`);
          if (!button) {
            failures.push({ map, tab, reason:'missing tab button' });
            continue;
          }
          button.click();
          await tick(20);
          checkedTabs++;

          const pane = document.querySelector(`#selectedMapCard [data-map-pane="${tab}"]`);
          if (!pane || !pane.classList.contains('active')) {
            failures.push({ map, tab, reason:'pane did not activate' });
            continue;
          }
          if (!String(pane.textContent || '').trim() && !pane.querySelector('svg,img,canvas')) {
            failures.push({ map, tab, reason:'active pane is empty' });
          }
        }
      }
    }

    const selectableMaps = Object.values(MAPS).reduce((sum, rows) => sum + rows.length, 0);
    return { failures, checkedMaps, checkedTabs, selectableMaps };
  });

  expect(result.checkedMaps).toBe(result.selectableMaps);
  expect(result.checkedTabs).toBe(result.selectableMaps * 8);
  expect(result.failures).toEqual([]);
  expect(errors).toEqual([]);
});


test('release smoke: map mine readiness and support planner persist real changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-readiness-v1');
    localStorage.removeItem('harbordesk-support-fleets-v1');
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id:'mine-e2e-fleet',
        name:'5-5 実操作確認',
        ships:[
          {ship:'雪風改二',masterId:0,gear:'主砲 電探'},
          {ship:'時雨改三',masterId:0,gear:'主砲 電探'},
          {ship:'大和改二重',masterId:0,gear:'主砲 主砲'},
          {ship:'武蔵改二',masterId:0,gear:'主砲 主砲'},
          {ship:'赤城改二',masterId:0,gear:'艦戦 艦攻'},
          {ship:'加賀改二',masterId:0,gear:'艦戦 艦攻'}
        ],
        memo:'回帰テスト',
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
    selectedWorld='5';
    selectedMap='5-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="mine"]').click();
  await expect(page.locator('#hdSortieReadiness')).toBeVisible();
  await expect(page.locator('#hdSupportPlanner')).toBeVisible();

  const manual = page.locator('#hdSortieReadiness [data-hd-sortie-check]').first();
  await expect(manual).toBeVisible();
  const checkId = await manual.getAttribute('data-hd-sortie-check');
  await manual.check();

  const ready = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('harbordesk-sortie-readiness-v1') || '{}')
  );
  const readyRow = ready['5-5:mine-e2e-fleet'] || {};
  expect(readyRow[checkId]).toBe(true);
  expect(Number(readyRow.updatedAt)).toBeGreaterThan(0);

  const first = page.locator('[data-hd-sp-name="vanguard"][data-i="0"]');
  await first.fill('雪風改二');
  await first.dispatchEvent('change');
  const second = page.locator('[data-hd-sp-name="vanguard"][data-i="1"]');
  await second.fill('時雨改三');
  await second.dispatchEvent('change');

  const support = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('harbordesk-support-fleets-v1') || '{}')
  );
  expect(support['5-5']?.vanguard?.ships?.[0]?.name).toBe('雪風改二');
  expect(support['5-5']?.vanguard?.ships?.[1]?.name).toBe('時雨改三');

  const start = page.locator('[data-hd-sp-start="vanguard"]');
  await expect(start).toBeEnabled();
  await start.click();

  const timer = await page.evaluate(() =>
    (state?.expeditions || []).find(x => x.support && x.supportKind === 'vanguard' && x.map === '5-5') || null
  );
  expect(timer).not.toBeNull();
  expect(timer.expeditionId).toBe('33');
  expect(Number(timer.endsAt)).toBeGreaterThan(Date.now());

  expect(errors).toEqual([]);
});


test('release smoke: map fleet procurement action recovers failed lazy module', async ({ page }) => {
  const errors = [];
  let blockProcurement = true;
  await page.route('**/equipment-procurement-list.js*', route => blockProcurement ? route.abort() : route.continue());
  await boot(page, errors);
  await openGuideWorkspace(page);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./equipment-procurement-list.js'] === 'error',
    null,
    { timeout: 30000 }
  );
  blockProcurement = false;

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="fleet"]').click();

  const procure = page.locator('.hd-map-ship-candidate [data-hd-ship-procure]').first();
  await expect(procure).toBeVisible();
  await procure.click();

  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    fn: typeof window.hdPLAddShipLoadout,
    status: window.HD_MODULE_STATUS?.['./equipment-procurement-list.js'] || ''
  }));
  expect(state).toEqual({ fn:'function', status:'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: master ship procurement recovers failed lazy module', async ({ page }) => {
  const errors = [];
  let blockProcurement = true;
  await page.route('**/equipment-procurement-list.js*', route => blockProcurement ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./equipment-procurement-list.js'] === 'error',
    null,
    { timeout: 30000 }
  );

  const row = await page.evaluate(() => {
    const detailed = new Set(HD_SHIP_DATABASE.map(x => x.final));
    const candidate = Object.values(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {}).find(x =>
      !detailed.has(x.name) &&
      Array.isArray(x.slots) &&
      x.slots.length > 0 &&
      typeof hdShipDbMasterSuggestedLoadouts === 'function' &&
      hdShipDbMasterSuggestedLoadouts(x).length > 0
    );
    if (!candidate) return null;
    hdEnsureShipDatabase();
    const input = document.getElementById('hdShipDbSearch');
    if (input) input.value = candidate.name;
    hdRenderShipDatabase();
    const list=document.getElementById('hdShipDbList');
    list?.classList.remove('hd-compact');
    const compactBtn=document.querySelector('[data-hd-shipdb-compact]');
    if(compactBtn)compactBtn.textContent='コンパクト';
    try{
      const view=JSON.parse(sessionStorage.getItem('harbordesk-session-shipdb-view-v1')||'{}');
      sessionStorage.setItem('harbordesk-session-shipdb-view-v1',JSON.stringify({...view,compact:false,query:candidate.name,includeMaster:true}));
    }catch{}
    const section=document.getElementById('shipDatabase');
    if (typeof window.hdWSShowElement === 'function') window.hdWSShowElement(section || 'shipDatabase', false);
    for(let node=section;node&&node!==document.body;node=node.parentElement){
      node.hidden=false;
      node.classList?.remove('hd-ws-hidden','hd-ws-wrapper-hidden');
      if(node.getAttribute?.('aria-hidden')==='true')node.setAttribute('aria-hidden','false');
    }
    return { id: candidate.id, name: candidate.name };
  });
  expect(row).toBeTruthy();

  const masterCard = page.locator('.hd-shipdb-master-card').filter({has: page.locator(`[data-hd-master-procure="${row.id}"]`)}).first();
  await expect(masterCard).toBeVisible({ timeout: 5000 });
  const suggested = masterCard.locator('.hd-shipdb-master-suggest > summary');
  await expect(suggested).toBeVisible({ timeout: 5000 });
  await suggested.click();
  await expect.poll(() => suggested.evaluate(el => !!el.parentElement?.open)).toBe(true);
  await page.evaluate(() => hdRenderShipDatabase());
  await expect.poll(() => suggested.evaluate(el => !!el.parentElement?.open)).toBe(true);
  const master = masterCard.locator(`[data-hd-master-procure="${row.id}"]`).first();
  await expect(master).toBeVisible({ timeout: 5000 });

  blockProcurement = false;
  await master.click();

  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    fn: typeof window.hdPLAddMasterLoadout,
    status: window.HD_MODULE_STATUS?.['./equipment-procurement-list.js'] || ''
  }));
  expect(state).toEqual({ fn:'function', status:'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: master ship acquisition recovers failed lazy module', async ({ page }) => {
  const errors = [];
  let blockGuide = true;
  await page.route('**/equipment-acquisition-guide.js*', route => blockGuide ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] === 'error',
    null,
    { timeout: 30000 }
  );

  const row = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'master-acquire-seed', name:'12cm単装砲', count:1, star:0, targetStar:0 }
    ]));
    const detailed = new Set(HD_SHIP_DATABASE.map(x => x.final));
    const candidate = Object.values(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {}).find(x =>
      !detailed.has(x.name) &&
      Array.isArray(x.slots) &&
      x.slots.length > 0 &&
      typeof hdShipDbMasterSuggestedLoadouts === 'function' &&
      hdShipDbMasterSuggestedLoadouts(x).length > 0
    );
    if (!candidate) return null;
    hdEnsureShipDatabase();
    const input = document.getElementById('hdShipDbSearch');
    if (input) input.value = candidate.name;
    hdRenderShipDatabase();
    const list=document.getElementById('hdShipDbList');
    list?.classList.remove('hd-compact');
    const compactBtn=document.querySelector('[data-hd-shipdb-compact]');
    if(compactBtn)compactBtn.textContent='コンパクト';
    try{
      const view=JSON.parse(sessionStorage.getItem('harbordesk-session-shipdb-view-v1')||'{}');
      sessionStorage.setItem('harbordesk-session-shipdb-view-v1',JSON.stringify({...view,compact:false,query:candidate.name,includeMaster:true}));
    }catch{}
    const section=document.getElementById('shipDatabase');
    if (typeof window.hdWSShowElement === 'function') window.hdWSShowElement(section || 'shipDatabase', false);
    for(let node=section;node&&node!==document.body;node=node.parentElement){
      node.hidden=false;
      node.classList?.remove('hd-ws-hidden','hd-ws-wrapper-hidden');
      if(node.getAttribute?.('aria-hidden')==='true')node.setAttribute('aria-hidden','false');
    }
    return { id: candidate.id, name: candidate.name };
  });
  expect(row).toBeTruthy();

  const details = page.locator('.hd-shipdb-master-card .hd-shipdb-master-suggest').first();
  await expect(details).toBeVisible({ timeout: 5000 });
  await details.locator('summary').click();
  const acquire = page.locator(`.hd-shipdb-master-card [data-hd-master-acquire="${row.id}"]`).first();
  await expect(acquire).toBeVisible({ timeout: 5000 });

  blockGuide = false;
  await acquire.click();

  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    fn: typeof window.hdAGOpenMaster,
    status: window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] || ''
  }));
  expect(state).toEqual({ fn:'function', status:'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: map fleet procurement opens even when workspace routing refuses target', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdPLOpenList === 'function' &&
    typeof window.hdPLEnsure === 'function' &&
    typeof window.hdShipDbMapRecommendHtml === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="fleet"]').click();

  await page.evaluate(() => {
    window.hdPLEnsure();
    const target=document.getElementById('hdEquipmentProcurement');
    target?.classList.add('hd-ws-hidden');
    window.__hdSavedProcReveal=window.hdRevealWorkspaceTarget;
    window.__hdSavedProcWS=window.hdWSShowElement;
    window.__hdSavedProcQN=window.hdQNJump;
    window.hdRevealWorkspaceTarget=()=>false;
    window.hdWSShowElement=()=>false;
    window.hdQNJump=()=>false;
  });

  const procure = page.locator('.hd-map-ship-candidate [data-hd-ship-procure]').first();
  await expect(procure).toBeVisible();
  await procure.click();
  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdRevealWorkspaceTarget=window.__hdSavedProcReveal;
    window.hdWSShowElement=window.__hdSavedProcWS;
    window.hdQNJump=window.__hdSavedProcQN;
    delete window.__hdSavedProcReveal;
    delete window.__hdSavedProcWS;
    delete window.__hdSavedProcQN;
  });
  expect(errors).toEqual([]);
});


test('release smoke: map fleet acquisition catalog falls back when workspace routing fails', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdAGOpenCatalog === 'function' &&
    typeof window.hdShipDbMapRecommendHtml === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-equipment-v1');
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="fleet"]').click();

  const acquire = page.locator('.hd-map-ship-candidate [data-hd-ship-acquire]').first();
  await expect(acquire).toBeVisible();
  await acquire.click();
  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible({ timeout: 5000 });

  const catalog = page.locator('#hdAcquisitionDialog [data-hd-ag-catalog]').first();
  await expect(catalog).toBeVisible();
  const equipName = await catalog.getAttribute('data-hd-ag-catalog');

  await page.evaluate(() => {
    const book=document.getElementById('equipmentBook');
    book?.classList.add('hd-ws-hidden');
    window.__hdSavedAgOpenDb=window.hdOpenEquipmentDb;
    window.__hdSavedAgReveal=window.hdRevealWorkspaceTarget;
    window.__hdSavedAgWS=window.hdWSShowElement;
    window.__hdSavedAgQN=window.hdQNJump;
    window.hdOpenEquipmentDb=()=>false;
    window.hdRevealWorkspaceTarget=()=>false;
    window.hdWSShowElement=()=>false;
    window.hdQNJump=()=>false;
  });

  await catalog.click();
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });
  const search = page.locator('#hdEquipCatalogSearch');
  if (await search.count()) await expect(search).toHaveValue(equipName || '');

  await page.evaluate(() => {
    window.hdOpenEquipmentDb=window.__hdSavedAgOpenDb;
    window.hdRevealWorkspaceTarget=window.__hdSavedAgReveal;
    window.hdWSShowElement=window.__hdSavedAgWS;
    window.hdQNJump=window.__hdSavedAgQN;
    delete window.__hdSavedAgOpenDb;
    delete window.__hdSavedAgReveal;
    delete window.__hdSavedAgWS;
    delete window.__hdSavedAgQN;
  });
  expect(errors).toEqual([]);
});


test('release smoke: map fleet candidate opens the visible ship database', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdShipDbJumpTo === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="fleet"]').click();
  const jump = page.locator('.hd-map-ship-candidate [data-hd-shipdb-jump]').first();
  await expect(jump).toBeVisible();
  const ship = await jump.getAttribute('data-hd-shipdb-jump');
  await jump.click();

  await expect(page.locator('#shipDatabase')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdShipDbSearch')).toHaveValue(ship || '');
  expect(errors).toEqual([]);
});


test('release smoke: map fleet candidate opens equipment compatibility checker end to end', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdShipDbJumpTo === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="fleet"]').click();
  const jump = page.locator('.hd-map-ship-candidate [data-hd-shipdb-jump]').first();
  await expect(jump).toBeVisible();
  const ship = await jump.getAttribute('data-hd-shipdb-jump');
  expect(ship).toBeTruthy();
  await jump.click();

  await expect(page.locator('#shipDatabase')).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => {
    const list=document.getElementById('hdShipDbList');
    list?.classList.remove('hd-compact');
  });

  const checker = page.locator(`[data-hd-ship-equip-check-name="${ship}"]`).first();
  await expect(checker).toBeVisible({ timeout: 5000 });
  await checker.click();

  const dialog = page.locator('#hdShipEquipCheckDialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdShipEquipCheckShip')).toHaveValue(ship || '');

  const equipment = await page.locator('#hdShipEquipCheckEquipList option').first().getAttribute('value');
  expect(equipment).toBeTruthy();
  await page.locator('#hdShipEquipCheckEquip').fill(equipment || '');
  await page.locator('[data-hd-equip-check-run]').click();

  const result = page.locator('#hdShipEquipCheckResult');
  await expect(result).toContainText(ship || '');
  await expect(result).toContainText(equipment || '');

  await page.locator('[data-hd-equip-check-close]').click();
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: map fleet owned-loadout opens ledger and refreshes from equipment changes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdShipDbMapRecommendHtml === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-equipment-v1');
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="fleet"]').click();
  const candidate = page.locator('.hd-map-ship-candidate').first();
  await expect(candidate).toBeVisible();

  const ledger = candidate.locator('[data-hd-ship-equip-ledger]');
  await expect(ledger).toBeVisible();
  const wanted = await candidate.locator('[data-hd-ship-acquire]').first().getAttribute('data-hd-ship-acquire');
  expect(wanted).toBeTruthy();

  await ledger.click();
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });

  await page.evaluate((name) => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'map-owned-refresh-test', name, count:1, star:0, targetStar:0 }
    ]));
    window.dispatchEvent(new CustomEvent('hd:equipment-changed'));
    window.hdWSShowElement?.('guide', false);
  }, wanted);

  await expect(page.locator('[data-map-pane="fleet"]')).toBeVisible({ timeout: 5000 });
  const refreshed = page.locator('.hd-map-ship-candidate').first();
  await expect(refreshed.locator('.hd-map-owned-fit')).toBeVisible();
  await expect(refreshed.locator('.hd-map-owned-fit')).not.toHaveClass(/empty-fit/);
  const refresh = refreshed.locator('[data-hd-ship-owned-refresh]');
  await expect(refresh).toBeVisible();
  await refresh.click();
  await expect(refreshed.locator('.hd-map-owned-fit')).not.toHaveClass(/empty-fit/);

  expect(errors).toEqual([]);
});


test('release smoke: map tab selection persists independently per map', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdMapActivateTab === 'function' &&
    typeof window.renderMapPicker === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-map-tab-v1');
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="drop"]').click();
  await expect(page.locator('[data-map-pane="drop"]')).toBeVisible();

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });
  await expect(page.locator('[data-map-tab="overview"]')).toHaveClass(/active/);
  await page.locator('[data-map-tab="mine"]').click();
  await expect(page.locator('[data-map-pane="mine"]')).toBeVisible();

  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await expect(page.locator('[data-map-tab="drop"]')).toHaveClass(/active/);
  await expect(page.locator('[data-map-pane="drop"]')).toBeVisible();

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });
  await expect(page.locator('[data-map-tab="mine"]')).toHaveClass(/active/);
  await expect(page.locator('[data-map-pane="mine"]')).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-map-tab-v1') || '{}'));
  expect(stored['2-4']).toBe('drop');
  expect(stored['5-5']).toBe('mine');
  expect(errors).toEqual([]);
});


test('release smoke: stale saved map攻略 tab falls back to overview', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'5-6':'legacy-tab-that-no-longer-exists'}));
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });
  await expect(page.locator('[data-map-tab="overview"]')).toHaveClass(/active/);
  await expect(page.locator('[data-map-pane="overview"]')).toBeVisible();
  await expect(page.locator('#selectedMapCard')).toContainText('推奨練度');
  expect(errors).toEqual([]);
});


test('release smoke: map攻略 inner controls work end to end', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdRenderMapEquipmentRecommendations === 'function' &&
    typeof window.openCustomFleetDialog === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-custom-fleets-v1');
    localStorage.removeItem('harbordesk-drop-hunts-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="map"]').click();
  const stageButtons = page.locator('[data-hd-map-stage="5-6"]');
  await expect(stageButtons).toHaveCount(3);
  const beforeStage = await page.locator('.hd-map-stage-card').textContent();
  await stageButtons.nth(1).click();
  const afterStage = await page.locator('.hd-map-stage-card').textContent();
  expect(afterStage).not.toBe(beforeStage);
  const savedStage = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-map-stage-v1') || '{}')['5-6']);
  expect(savedStage).toBeTruthy();

  await page.locator('[data-hd-map-open="5-6"]').click();
  await expect(page.locator('#hdMapImageDialog')).toBeVisible();
  await page.locator('#hdMapDialogClose').click();
  await expect(page.locator('#hdMapImageDialog')).not.toBeVisible();

  await page.locator('.hd-map-structure-guide > summary').click();
  const node = page.locator('[data-map-pane="map"] .hd-map-node').first();
  await expect(node).toBeVisible();
  await node.click();
  await expect(page.locator('#hdMapNodeInfo')).toBeVisible();
  await expect(page.locator('#hdMapNodeInfo')).toContainText('MAP NODE DETAIL');
  await page.locator('#hdMapNodeInfo [data-open-route-tab]').click();
  await expect(page.locator('[data-map-pane="route"]')).toBeVisible();
  await expect(page.locator('#hdMapRouteRequirements')).toBeVisible();

  await page.locator('[data-map-tab="gear"]').click();
  const gearPanel = page.locator('#hdMapEquipRecommend .hd-map-equip-recommend');
  await expect(gearPanel).toBeVisible();
  const ownedOnly = gearPanel.locator('[data-hd-owned-only]');
  await expect(ownedOnly).toBeVisible();
  await ownedOnly.click();
  await expect(gearPanel).toHaveClass(/hd-owned-only/);
  await expect(ownedOnly).toHaveText('全候補を表示');
  await ownedOnly.click();
  await expect(gearPanel).not.toHaveClass(/hd-owned-only/);

  const addEquip = gearPanel.locator('[data-hd-equip-add]').first();
  await expect(addEquip).toBeVisible();
  const addedEquipName = await addEquip.getAttribute('data-hd-equip-add');
  await addEquip.click();
  await expect(page.locator('#equipmentDialog')).toBeVisible();
  await expect(page.locator('#equipmentName')).toHaveValue(addedEquipName || '');
  await page.locator('#equipmentDialog button[value="default"]').click();
  await expect.poll(async () => page.evaluate(name => {
    const rows = JSON.parse(localStorage.getItem('harbordesk-equipment-v1') || '[]');
    return rows.some(x => x.name === name && Number(x.count) > 0);
  }, addedEquipName)).toBe(true);
  await expect(gearPanel.locator('.hd-owned-card').filter({ hasText: addedEquipName || '' }).first()).toBeVisible();

  const viewButton = gearPanel.locator('[data-hd-map-equip-view]').first();
  const equipName = await viewButton.getAttribute('data-hd-map-equip-view');
  await viewButton.click();
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdEquipCatalogSearch')).toHaveValue(equipName || '');

  await page.evaluate(() => {
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '6';
    selectedMap = '6-3';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="drop"]').click();
  const dropChip = page.locator('[data-hd-map-drop-ship]').first();
  await expect(dropChip).toBeVisible();
  const dropMeta = {
    ship: await dropChip.getAttribute('data-hd-map-drop-ship'),
    map: await dropChip.getAttribute('data-hd-map-drop-map'),
    node: await dropChip.getAttribute('data-hd-map-drop-node')
  };
  expect(dropMeta.ship).toBeTruthy();
  expect(dropMeta.map).toBe('6-3');
  expect(dropMeta.node).toBeTruthy();
  await dropChip.click();
  const hunts = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]'));
  expect(hunts.length).toBeGreaterThan(0);
  expect(hunts[0]).toMatchObject(dropMeta);
  await expect(page.locator('[data-hd-map-drop-ship].hunting').first()).toBeVisible();

  await page.evaluate(() => window.hdWSShowElement?.('dropHuntingDb', true));
  const huntCard = page.locator('#hdDropHuntList .hd-hunt-card').first();
  await expect(huntCard).toBeVisible();
  await huntCard.locator('[data-hd-hunt-add][data-field="runs"]').click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]')[0]?.runs || 0)).toBe(1);
  await huntCard.locator('[data-hd-hunt-add][data-field="s"]').click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]')[0]?.runs || 0)).toBe(2);
  await huntCard.locator('[data-hd-hunt-add][data-field="a"]').click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]')[0]?.runs || 0)).toBe(3);
  let huntState = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]')[0]);
  expect(huntState.s).toBe(1);
  expect(huntState.a).toBe(1);
  await huntCard.locator('[data-hd-hunt-obtained]').click();
  await expect.poll(async () => page.evaluate(() => !!JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]')[0]?.obtained)).toBe(true);
  await expect(page.locator('#hdDropHuntList .hd-hunt-card').first()).toHaveClass(/done/);
  await page.locator('#hdDropHuntList .hd-hunt-card').first().locator('[data-hd-hunt-delete]').click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]').length)).toBe(0);

  await page.evaluate(() => {
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="mine"]').click();
  await page.locator('#addCustomFleet').click();
  await expect(page.locator('#customFleetDialog')).toBeVisible();
  await page.locator('#customFleetName').fill('回帰テスト編成');
  await page.locator('#cfShip0').fill('赤城');
  await page.locator('#cfGear0').fill('艦戦');
  await page.locator('#customFleetDialog button[value="default"]').click();
  await expect(page.locator('#customFleetPanel')).toContainText('回帰テスト編成');
  let fleets = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}')['5-5'] || []);
  expect(fleets.some(x => x.name === '回帰テスト編成')).toBe(true);

  const createdFleet = page.locator('#customFleetPanel .custom-fleet-card').filter({ hasText: '回帰テスト編成' }).first();
  await createdFleet.locator('[data-cf-edit]').click();
  await expect(page.locator('#customFleetDialog')).toBeVisible();
  await page.locator('#customFleetName').fill('回帰テスト編成・編集済み');
  await page.locator('#customFleetDialog button[value="default"]').click();
  await expect(page.locator('#customFleetPanel')).toContainText('回帰テスト編成・編集済み');
  fleets = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}')['5-5'] || []);
  expect(fleets.some(x => x.name === '回帰テスト編成・編集済み')).toBe(true);

  const editedFleet = page.locator('#customFleetPanel .custom-fleet-card').filter({ hasText: '回帰テスト編成・編集済み' }).first();
  await editedFleet.locator('[data-cf-delete]').click();
  await expect(page.locator('#customFleetPanel')).not.toContainText('回帰テスト編成・編集済み');
  fleets = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}')['5-5'] || []);
  expect(fleets.some(x => x.name === '回帰テスト編成・編集済み')).toBe(false);

  expect(errors).toEqual([]);
});


test('release smoke: core攻略 navigation activates map tabs without synthetic click', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdCoreMapAction === 'function' &&
    typeof window.hdMapActivateTab === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    renderMapPicker();
    const routeTab=document.querySelector('.map-tabs-shell [data-map-tab="route"]');
    if(routeTab){
      window.__hdRouteTabNativeClick=routeTab.click;
      window.__hdRouteTabSyntheticClickUsed=false;
      routeTab.click=()=>{window.__hdRouteTabSyntheticClickUsed=true;throw new Error('synthetic core map-tab click should not be required')};
    }
  });

  const opened = await page.evaluate(() => window.hdCoreMapAction('route'));
  expect(opened).toBe(true);
  await expect(page.locator('[data-map-pane="route"]')).toBeVisible();
  await expect(page.locator('#hdMapRouteRequirements')).toBeVisible();
  expect(await page.evaluate(() => window.__hdRouteTabSyntheticClickUsed)).toBe(false);

  await page.evaluate(() => {
    const routeTab=document.querySelector('.map-tabs-shell [data-map-tab="route"]');
    if(routeTab&&window.__hdRouteTabNativeClick)routeTab.click=window.__hdRouteTabNativeClick;
    delete window.__hdRouteTabNativeClick;
    delete window.__hdRouteTabSyntheticClickUsed;
  });
  expect(errors).toEqual([]);
});


test('release smoke: secondary map gear and readiness controls work', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdRenderMapEquipmentRecommendations === 'function' &&
    typeof window.hdFCRender === 'function' &&
    typeof window.hdRenderLandBasePlanner === 'function' &&
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.openEquipment === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-equipment-v1');
    localStorage.removeItem('harbordesk-fleet-calculator-v1');
    localStorage.removeItem('harbordesk-fleet-calculator-selection-v1');
    localStorage.removeItem('harbordesk-land-base-v1');
    localStorage.removeItem('harbordesk-sortie-readiness-v1');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '6-5': [{
        id:'secondary-controls-fleet',
        name:'副操作確認艦隊',
        ships:[
          {ship:'赤城',gear:''},
          {ship:'加賀',gear:''},
          {ship:'大和',gear:''},
          {ship:'武蔵',gear:''},
          {ship:'雪風',gear:''},
          {ship:'時雨',gear:''}
        ],
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
    selectedWorld = '6';
    selectedMap = '6-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="gear"]').click();
  const recommend = page.locator('[data-map-pane="gear"] #hdMapEquipRecommend .hd-map-equip-recommend');
  await expect(recommend).toBeVisible();

  const add = recommend.locator('[data-hd-equip-add]').first();
  await expect(add).toBeVisible();
  const equipName = await add.getAttribute('data-hd-equip-add');
  await page.evaluate(() => {
    window.__hdDelayedOpenEquipment = window.openEquipment;
    window.openEquipment = undefined;
    setTimeout(() => {
      window.openEquipment = window.__hdDelayedOpenEquipment;
      delete window.__hdDelayedOpenEquipment;
    }, 160);
  });
  await add.click();
  await expect(page.locator('#equipmentDialog')).toBeVisible({ timeout: 5000 });
  await page.locator('#equipmentDialog button[value="default"]').click();

  await expect(recommend.locator('[data-hd-owned-open]').filter({ hasText:'台帳で確認' }).first()).toBeVisible();
  await page.evaluate(() => {
    const book=document.getElementById('equipmentBook');
    book?.classList.add('hd-ws-hidden');
    window.__hdSavedOwnedWSShowElement=window.hdWSShowElement;
    window.hdWSShowElement=()=>false;
  });
  await recommend.locator('[data-hd-owned-open]').filter({ hasText:'台帳で確認' }).first().click();
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#equipmentSearch')).toHaveValue(equipName || '');
  await page.evaluate(() => {
    window.hdWSShowElement=window.__hdSavedOwnedWSShowElement;
    delete window.__hdSavedOwnedWSShowElement;
  });

  await page.evaluate(() => {
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '6';
    selectedMap = '6-5';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="gear"]').click();
  const recommendAgain = page.locator('[data-map-pane="gear"] #hdMapEquipRecommend .hd-map-equip-recommend');
  await recommendAgain.locator('[data-hd-owned-refresh]').click();
  await expect(recommendAgain).toBeVisible();

  const fc = page.locator('[data-map-pane="gear"] #hdFleetCalculator');
  await expect(fc).toBeVisible();
  await expect(fc.locator('#hdFCFleetSelect')).toHaveValue('secondary-controls-fleet');
  await fc.locator('[data-hd-fc-ship-los="0"]').fill('44');
  await fc.locator('[data-hd-fc-ship-los="0"]').dispatchEvent('change');

  await page.evaluate(() => {
    const all = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');
    all['6-5'][0].ships[0].ship = '翔鶴';
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify(all));
  });
  await fc.locator('[data-hd-fc-sync]').click();
  await expect(fc.locator('.hd-fc-ships label').first()).toContainText('翔鶴');
  let calc = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:secondary-controls-fleet']);
  expect(calc.ships[0].name).toBe('翔鶴');
  expect(calc.ships[0].los).toBe(44);

  const enemyChip = fc.locator('[data-hd-fc-enemy-chip]').first();
  if (await enemyChip.count()) {
    const value = Number(await enemyChip.getAttribute('data-hd-fc-enemy-chip'));
    await enemyChip.click();
    calc = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:secondary-controls-fleet']);
    expect(calc.enemyAir).toBe(value);
  }

  const lb = page.locator('[data-map-pane="gear"] #hdLandBasePlanner');
  await expect(lb).toBeVisible();
  const plane = lb.locator('[data-hd-lb-plane="0"][data-squad="0"]');
  const planeName = await plane.locator('option').evaluateAll(opts => opts.map(o => o.value).find(Boolean) || '');
  expect(planeName).not.toBe('');
  await plane.selectOption(planeName);
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5']?.corps?.[0]?.squads?.[0]?.name || '')).toBe(planeName);

  await page.locator('[data-map-tab="mine"]').click();
  const ready = page.locator('[data-map-pane="mine"] #hdSortieReadiness');
  await expect(ready).toBeVisible();
  const rosterAction = ready.locator('[data-hd-sortie-action="roster"]').first();
  await expect(rosterAction).toBeVisible();
  await rosterAction.click();
  await expect(page.locator('#roster')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '6';
    selectedMap = '6-5';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="mine"]').click();
  const readyAgain = page.locator('[data-map-pane="mine"] #hdSortieReadiness');
  await page.evaluate(() => {
    const gearTab=document.querySelector('.map-tabs-shell [data-map-tab="gear"]');
    if(gearTab){
      window.__hdGearTabNativeClick=gearTab.click;
      window.__hdGearTabSyntheticClickUsed=false;
      gearTab.click=()=>{window.__hdGearTabSyntheticClickUsed=true;throw new Error('synthetic map-tab click should not be required')};
    }
  });
  await readyAgain.locator('[data-hd-sortie-gear]').click();
  await expect(page.locator('[data-map-pane="gear"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="gear"] #hdFleetCalculator')).toBeVisible();
  expect(await page.evaluate(() => window.__hdGearTabSyntheticClickUsed)).toBe(false);
  await page.evaluate(() => {
    const gearTab=document.querySelector('.map-tabs-shell [data-map-tab="gear"]');
    if(gearTab&&window.__hdGearTabNativeClick)gearTab.click=window.__hdGearTabNativeClick;
    delete window.__hdGearTabNativeClick;
    delete window.__hdGearTabSyntheticClickUsed;
  });

  expect(errors).toEqual([]);
});


test('release smoke: secondary drop and synced custom fleet controls work', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.cfRelinkFleet === 'function' &&
    typeof window.hdDropOpenMapPanel === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-drop-hunts-v1');
    localStorage.removeItem('harbordesk-map-drop-view-v1');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([]));
    selectedWorld = '6';
    selectedMap = '6-3';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="drop"]').click();
  const drop = page.locator('[data-map-pane="drop"] .hd-map-drop-panel');
  await expect(drop).toBeVisible();
  const featured = drop.locator('[data-hd-map-drop-view="featured"]');
  await featured.click();
  await expect(featured).toHaveClass(/active/);
  let view = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-map-drop-view-v1') || '{}')['6-3']);
  expect(view).toBe('featured');

  await drop.locator('[data-hd-map-drop-view="all"]').click();
  view = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-map-drop-view-v1') || '{}')['6-3']);
  expect(view).toBe('all');

  await page.evaluate(() => window.hdWSShowElement?.('dropHuntingDb', true));
  const filter = page.locator('#dropHuntingDb [data-hd-drop-mapfilter="6-3"]');
  await expect(filter).toBeVisible();
  await filter.click();
  await expect(filter).toHaveClass(/active/);

  const target = page.locator('#dropHuntingDb [data-hd-drop-target]').first();
  await expect(target).toBeVisible();
  const targetShip = await target.getAttribute('data-hd-drop-target');
  await target.click();
  const hunt = page.locator('#hdDropHuntList .hd-hunt-card').first();
  await expect(hunt).toContainText(targetShip || '');
  await hunt.locator('[data-hd-hunt-obtained]').click();
  await expect(hunt.locator('[data-hd-hunt-roster]')).toBeVisible();
  await hunt.locator('[data-hd-hunt-roster]').click();
  await expect(page.locator('#shipRosterDialog')).toBeVisible();
  await expect(page.locator('#rosterName')).toHaveValue(targetShip || '');
  await page.locator('#shipRosterDialog button[value="cancel"]').click();

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([{
      deckId:2,
      syncedAt:Date.now(),
      ships:[
        {name:'雪風',gameShipId:101,masterId:20,level:90,nowHp:35,maxHp:35,cond:49,gear:'主砲 電探'},
        {name:'時雨',gameShipId:102,masterId:145,level:88,nowHp:31,maxHp:31,cond:49,gear:'主砲 電探'}
      ]
    }]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5':[{
        id:'detached-sync-fleet',
        name:'同期へ戻す確認',
        source:'manual',
        detachedFromSource:'kancolle-import',
        detachedSourceDeckId:2,
        detachedAt:Date.now(),
        ships:[{ship:'赤城',gear:'艦戦'}],
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="mine"]').click();
  const relink = page.locator('#customFleetPanel [data-cf-relink="detached-sync-fleet"]');
  await expect(relink).toBeVisible();
  await relink.click();

  const fleet = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}')['5-5']?.find(x => x.id === 'detached-sync-fleet'));
  expect(fleet.source).toBe('kancolle-import');
  expect(fleet.sourceDeckId).toBe(2);
  expect(fleet.detachedFromSource).toBeUndefined();
  expect(fleet.ships[0].ship).toBe('雪風');
  expect(fleet.ships[1].ship).toBe('時雨');
  await expect(page.locator('#customFleetPanel')).toContainText('ゲーム同期・第2艦隊・自動追従');

  expect(errors).toEqual([]);
});


test('release smoke:攻略 secondary navigation survives workspace helper outage', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFSOpen === 'function' &&
    typeof window.hdSPSOpen === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'fallback-akagi',name:'赤城',type:'正規空母',level:90,gear:''}
    ]));
    selectedWorld='6';
    selectedMap='6-5';
    renderMapPicker();

    window.__hdFallbackScrollTargets = [];
    HTMLElement.prototype.scrollIntoView = function(){
      window.__hdFallbackScrollTargets.push(this.id || '');
    };
    window.__hdSavedWSShowElement = window.hdWSShowElement;
    window.hdWSShowElement = undefined;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async text => { window.__hdCopiedPrep = text; } }
    });
  });

  await page.evaluate(() => window.hdFSOpen());
  const suggester = page.locator('#hdFleetSuggester');
  await expect(suggester).toBeVisible();
  await suggester.locator('[data-hd-fs-roster]').first().click();
  await expect.poll(() => page.evaluate(() => window.__hdFallbackScrollTargets)).toContain('roster');

  await page.evaluate(() => window.hdSPSOpen());
  const prep = page.locator('#hdSortiePreparation');
  await expect(prep).toBeVisible();
  await expect(page.locator('#hdSortiePreparationMap')).toContainText('6-5', { timeout: 15000 });

  await prep.locator('[data-hd-sps-copy]').click();
  await expect.poll(() => page.evaluate(() => window.__hdCopiedPrep || '')).toContain('6-5');

  await prep.locator('[data-hd-sps-workspace="roster"]').click();
  await expect(page.locator('#roster')).toBeVisible({ timeout: 12000 });

  await page.evaluate(() => window.hdSPSOpen());
  await expect(prep).toBeVisible();
  await prep.locator('[data-hd-sps-workspace="hdEquipmentProcurement"]').click();
  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible({ timeout: 12000 });

  await page.evaluate(() => window.hdSPSOpen());
  await expect(prep).toBeVisible();
  await prep.locator('[data-hd-sps-guide]').click();
  await expect(page.locator('#guide')).toBeVisible({ timeout: 12000 });

  await page.evaluate(() => {
    window.hdWSShowElement = window.__hdSavedWSShowElement;
    delete window.__hdSavedWSShowElement;
  });
  expect(errors).toEqual([]);
});


test('release smoke:攻略 navigation falls back when workspace helper returns false', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFSOpen === 'function' &&
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdQNJump === 'function' &&
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdRevealWorkspaceTarget === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld='6';
    selectedMap='6-5';
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '6-5': [{
        id:'false-helper-fleet',
        name:'補助失敗テスト',
        ships:[{ship:'未登録テスト艦',gear:''}],
        memo:'',
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
    renderMapPicker();
    window.__hdSavedWSFalseTest = window.hdWSShowElement;
    window.hdWSShowElement = () => false;
  });

  await page.evaluate(() => window.hdFSOpen());
  await expect(page.locator('#hdFleetSuggester')).toBeVisible();

  await page.evaluate(() => window.hdSPSOpen());
  await expect(page.locator('#hdSortiePreparation')).toBeVisible();

  await page.evaluate(() => {
    const book=document.getElementById('equipmentBook');
    book?.classList.add('hd-ws-hidden');
    window.hdQNJump('equipmentBook');
  });
  await expect(page.locator('#equipmentBook')).toBeVisible();

  await page.evaluate(() => {
    window.hdRevealWorkspaceTarget('guide', false);
    document.querySelector('[data-map-tab="mine"]')?.click();
    window.hdRenderSortieReadiness();
  });
  const rosterAction=page.locator('#hdSortieReadiness [data-hd-sortie-action="roster"]').first();
  await expect(rosterAction).toBeVisible();
  await page.evaluate(() => document.getElementById('roster')?.classList.add('hd-ws-hidden'));
  await rosterAction.click();
  await expect(page.locator('#roster')).toBeVisible();

  await page.evaluate(() => {
    window.hdWSShowElement = window.__hdSavedWSFalseTest;
    delete window.__hdSavedWSFalseTest;
  });
  expect(errors).toEqual([]);
});


test('release smoke: sortie preparation base adjustment opens land-base planner even without map tabs', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdSortieOpenTab === 'function' &&
    typeof window.hdFCOpenFallback === 'function' &&
    typeof window.hdLBHtml === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    window.__hdBaseFocusScrollTargets = [];
    const original = Element.prototype.scrollIntoView;
    window.__hdOriginalScrollIntoViewForBaseFocus = original;
    Element.prototype.scrollIntoView = function(...args){
      window.__hdBaseFocusScrollTargets.push(this.id || '');
      return original?.apply(this,args);
    };
    selectedWorld='6';
    selectedMap='6-5';
    renderMapPicker();
  });

  await page.evaluate(() => window.hdSPSOpen());
  const prep = page.locator('#hdSortiePreparation');
  await expect(prep).toBeVisible();
  const adjust = prep.locator('[data-hd-sps-focus-base]');
  await expect(adjust).toBeVisible();
  await adjust.click();

  const fallback = page.locator('#hdFallbackGearTools');
  await expect(fallback).toBeVisible({ timeout: 10000 });
  await expect(fallback.locator('#hdLandBasePlanner')).toBeVisible({ timeout: 10000 });
  await expect.poll(() => page.evaluate(() => window.__hdBaseFocusScrollTargets || [])).toContain('hdLandBasePlanner');

  await page.evaluate(() => {
    if(window.__hdOriginalScrollIntoViewForBaseFocus)Element.prototype.scrollIntoView=window.__hdOriginalScrollIntoViewForBaseFocus;
    delete window.__hdOriginalScrollIntoViewForBaseFocus;
  });
  expect(errors).toEqual([]);
});


test('release smoke: quest database type filter works after map quest navigation', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQuestOpenFromMap === 'function' &&
    !!document.getElementById('questDatabase'),
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => window.hdQuestOpenFromMap('Bq1'));
  await expect(page.locator('#questDatabase')).toBeVisible({ timeout: 5000 });

  const quarterly = page.locator('#questDatabase [data-hd-quest-cycle="quarterly"]');
  await expect(quarterly).toBeVisible();
  await quarterly.click();

  const allType = page.locator('#questDatabase [data-hd-quest-type="すべて"]');
  const sortieType = page.locator('#questDatabase [data-hd-quest-type="出撃"]');
  await expect(sortieType).toBeVisible();
  const before = await page.locator('#hdQuestDbList .hd-quest-db-card').count();

  await sortieType.click();
  await expect(sortieType).toHaveClass(/active/);
  const filtered = page.locator('#hdQuestDbList .hd-quest-db-card');
  await expect(filtered.first()).toBeVisible();
  const filteredCount = await filtered.count();
  expect(filteredCount).toBeGreaterThan(0);
  expect(filteredCount).toBeLessThanOrEqual(before);
  const labels = await filtered.locator('.hd-quest-db-head span').allTextContents();
  expect(labels.every(x => x.includes('出撃'))).toBe(true);

  await allType.click();
  await expect(allType).toHaveClass(/active/);
  expect(await page.locator('#hdQuestDbList .hd-quest-db-card').count()).toBeGreaterThanOrEqual(filteredCount);

  expect(errors).toEqual([]);
});


test('release smoke: remaining map攻略 action controls open and persist', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFSOpen === 'function' &&
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdAGOpen === 'function' &&
    typeof window.hdSPRender === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([]));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'audit-akagi',name:'赤城',type:'正規空母',level:95,gear:''},
      {id:'audit-kaga',name:'加賀',type:'正規空母',level:94,gear:''},
      {id:'audit-yamato',name:'大和',type:'戦艦',level:96,gear:''},
      {id:'audit-musashi',name:'武蔵',type:'戦艦',level:95,gear:''},
      {id:'audit-yukikaze',name:'雪風',type:'駆逐艦',level:90,gear:''},
      {id:'audit-shigure',name:'時雨',type:'駆逐艦',level:89,gear:''}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '6-5': [{
        id:'audit-fleet',
        name:'未検証操作確認艦隊',
        ships:[
          {ship:'赤城',gear:''},{ship:'加賀',gear:''},{ship:'大和',gear:''},
          {ship:'武蔵',gear:''},{ship:'雪風',gear:''},{ship:'時雨',gear:''}
        ],
        createdAt:Date.now(),updatedAt:Date.now()
      }]
    }));
    selectedWorld='6';
    selectedMap='6-5';
    renderMapPicker();
  });

  await page.evaluate(() => window.hdFSOpen());
  const suggester=page.locator('#hdFleetSuggester');
  await expect(suggester).toBeVisible();
  const fsAcquire=suggester.locator('[data-hd-fs-acquire]').first();
  await expect(fsAcquire).toBeVisible();
  await fsAcquire.click();
  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible();
  await expect(page.locator('#hdAcquisitionTitle')).toContainText('6-5｜');
  await page.locator('#hdAcquisitionDialog [data-hd-ag-close]').click();

  await page.evaluate(() => window.hdSPSOpen());
  const prep=page.locator('#hdSortiePreparation');
  await expect(prep).toBeVisible();
  const prepAcquire=prep.locator('[data-hd-sps-acquire]').first();
  await expect(prepAcquire).toBeVisible();
  await prepAcquire.click();
  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible();
  await expect(page.locator('#hdAcquisitionTitle')).toContainText('6-5｜');
  await page.locator('#hdAcquisitionDialog [data-hd-ag-close]').click();

  await prep.locator('[data-hd-sps-workspace="roster"]').click();
  await expect(page.locator('#roster')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => window.hdSPSOpen());
  await expect(prep).toBeVisible();
  await prep.locator('[data-hd-sps-workspace="hdEquipmentProcurement"]').click();
  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdWSShowElement?.('guide', false);
    selectedWorld='5';
    selectedMap='5-5';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="mine"]').click();
  const support=page.locator('[data-map-pane="mine"] #hdSupportPlanner');
  await expect(support).toBeVisible();
  const type=support.locator('[data-hd-sp-type="vanguard"][data-i="0"]');
  await type.selectOption({label:'戦艦'});
  const supportState=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-support-fleets-v1') || '{}')['5-5']);
  expect(supportState.vanguard.ships[0].type).toBe('戦艦');

  await page.evaluate(() => window.hdWSShowElement?.('questDatabase', true));
  const quarterly=page.locator('#questDatabase [data-hd-quest-cycle="quarterly"]');
  await expect(quarterly).toBeVisible();
  await quarterly.click();
  await expect(quarterly).toHaveClass(/active/);
  const qcard=page.locator('#questDatabase [data-hd-quest-id="Bq1"]');
  await expect(qcard).toBeVisible();
  const add=qcard.locator('[data-hd-quest-add="Bq1"]');
  await expect(add).toBeVisible();
  await add.click();
  const checklist=await page.evaluate(() => (window.hdGetAppState?.().quests || []).filter(x => x.sourceId === 'Bq1' && !x.done));
  expect(checklist).toHaveLength(1);

  expect(errors).toEqual([]);
});


test('release smoke: fleet suggestion acquisition recovers failed lazy guide', async ({ page }) => {
  const errors = [];
  let blockGuide = true;
  await page.route('**/equipment-acquisition-guide.js*', route => blockGuide ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] === 'error',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([]));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'fsr1',name:'赤城',type:'正規空母',level:95,gear:''},
      {id:'fsr2',name:'加賀',type:'正規空母',level:94,gear:''},
      {id:'fsr3',name:'大和',type:'戦艦',level:96,gear:''},
      {id:'fsr4',name:'武蔵',type:'戦艦',level:95,gear:''},
      {id:'fsr5',name:'雪風',type:'駆逐艦',level:90,gear:''},
      {id:'fsr6',name:'時雨',type:'駆逐艦',level:89,gear:''}
    ]));
    selectedWorld='6';
    selectedMap='6-5';
    renderMapPicker();
    window.hdFSOpen();
    window.hdWSShowElement?.('hdFleetSuggester', false);
  });

  const acquire = page.locator('#hdFleetSuggester [data-hd-fs-acquire]').first();
  await expect(acquire).toBeVisible({ timeout: 5000 });

  blockGuide = false;
  await acquire.click();

  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    fn: typeof window.hdAGOpen,
    status: window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] || ''
  }));
  expect(state).toEqual({ fn:'function', status:'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: sortie preparation acquisition recovers failed lazy guide', async ({ page }) => {
  const errors = [];
  let blockGuide = true;
  await page.route('**/equipment-acquisition-guide.js*', route => blockGuide ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] === 'error',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([]));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'spsr1',name:'赤城',type:'正規空母',level:95,gear:''},
      {id:'spsr2',name:'加賀',type:'正規空母',level:94,gear:''},
      {id:'spsr3',name:'大和',type:'戦艦',level:96,gear:''},
      {id:'spsr4',name:'武蔵',type:'戦艦',level:95,gear:''},
      {id:'spsr5',name:'雪風',type:'駆逐艦',level:90,gear:''},
      {id:'spsr6',name:'時雨',type:'駆逐艦',level:89,gear:''}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '6-5': [{
        id:'sps-recovery-fleet',
        name:'入手ガイド復旧確認艦隊',
        ships:[
          {ship:'赤城',gear:''},{ship:'加賀',gear:''},{ship:'大和',gear:''},
          {ship:'武蔵',gear:''},{ship:'雪風',gear:''},{ship:'時雨',gear:''}
        ],
        createdAt:Date.now(),updatedAt:Date.now()
      }]
    }));
    selectedWorld='6';
    selectedMap='6-5';
    renderMapPicker();
    window.hdSPSOpen();
    window.hdWSShowElement?.('hdSortiePreparation', false);
  });

  const acquire = page.locator('#hdSortiePreparation [data-hd-sps-acquire]').first();
  await expect(acquire).toBeVisible({ timeout: 5000 });

  blockGuide = false;
  await acquire.click();

  await expect(page.locator('#hdAcquisitionDialog')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    fn: typeof window.hdAGOpen,
    status: window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] || ''
  }));
  expect(state).toEqual({ fn:'function', status:'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: empty sortie preparation can open roster', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-custom-fleets-v1');
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await page.evaluate(() => window.hdSPSOpen());

  const prep = page.locator('#hdSortiePreparation');
  await expect(prep).toBeVisible({ timeout: 5000 });
  await expect(prep).toContainText('自分用編成が未登録');

  const roster = prep.locator('[data-hd-sps-workspace="roster"]');
  await expect(roster).toBeVisible();
  await roster.click();
  await expect(page.locator('#roster')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: map quest actions add, open, count and reset progress', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdQuestOpenFromMap === 'function' &&
    typeof window.hdQuestAddFromMap === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-quest-progress-v1');
    if (typeof state !== 'undefined' && state) {
      state.quests = [];
      if (typeof save === 'function') save();
      if (typeof renderQuests === 'function') renderQuests();
    }
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="quest"]').click();
  const card = page.locator('[data-map-pane="quest"] [data-hd-map-quest-id="Bq1"]');
  await expect(card).toBeVisible();

  const add = card.locator('[data-hd-map-quest-add="Bq1"]');
  await expect(add).toHaveText('チェックに追加');
  await add.click();

  const checklist = await page.evaluate(() => (window.hdGetAppState?.().quests || []).filter(x => x.sourceId === 'Bq1' && !x.done));
  expect(checklist).toHaveLength(1);

  await page.evaluate(() => {
    window.hdWSShowElement?.('guide', false);
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="quest"]').click();
  const cardAfter = page.locator('[data-map-pane="quest"] [data-hd-map-quest-id="Bq1"]');
  await expect(cardAfter.locator('[data-hd-map-quest-add="Bq1"]')).toHaveText('追加済み');

  await page.evaluate(() => {
    const db=document.getElementById('questDatabase');
    db?.classList.add('hd-ws-hidden');
    window.__hdSavedQuestWSShowElement=window.hdWSShowElement;
    window.hdWSShowElement=()=>false;
  });
  await cardAfter.locator('[data-hd-map-quest-open="Bq1"]').click();
  await expect(page.locator('#questDatabase')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdQuestDbSearch')).toHaveValue(/沖ノ島海域迎撃戦/);
  await page.evaluate(() => {
    window.hdWSShowElement=window.__hdSavedQuestWSShowElement;
    delete window.__hdSavedQuestWSShowElement;
  });

  const dbCard = page.locator('#questDatabase [data-hd-quest-id="Bq1"]');
  await expect(dbCard).toBeVisible();
  const plus = dbCard.locator('[data-hd-qp-plus="Bq1"]');
  const minus = dbCard.locator('[data-hd-qp-minus="Bq1"]');
  const reset = dbCard.locator('[data-hd-qp-reset="Bq1"]');

  // The quest list can redraw during WebKit pointer gestures; dispatch the button event directly.
  await plus.dispatchEvent('click');
  let progress = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bq1?.values?.[0]);
  expect(progress).toBe(1);
  await minus.dispatchEvent('click');
  progress = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bq1?.values?.[0]);
  expect(progress).toBe(0);

  await plus.dispatchEvent('click');
  await plus.dispatchEvent('click');
  await expect(dbCard.locator('.hd-qp-box')).toHaveClass(/done/);
  progress = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bq1?.values?.[0]);
  expect(progress).toBe(2);

  await reset.dispatchEvent('click');
  progress = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-quest-progress-v1') || '{}').Bq1?.values?.[0]);
  expect(progress).toBe(0);
  await expect(dbCard.locator('.hd-qp-box')).not.toHaveClass(/done/);

  expect(errors).toEqual([]);
});


test('release smoke: map gear calculators persist detailed controls', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdFCRender === 'function' &&
    typeof window.hdRenderLandBasePlanner === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-fleet-calculator-v1');
    localStorage.removeItem('harbordesk-fleet-calculator-selection-v1');
    localStorage.removeItem('harbordesk-land-base-v1');
    selectedWorld = '6';
    selectedMap = '6-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="gear"]').click();
  const fc = page.locator('[data-map-pane="gear"] #hdFleetCalculator');
  const lb = page.locator('[data-map-pane="gear"] #hdLandBasePlanner');
  await expect(fc).toBeVisible();
  await expect(lb).toBeVisible();

  await fc.locator('[data-hd-fc-hq]').fill('99');
  await fc.locator('[data-hd-fc-hq]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-coef]').fill('2');
  await fc.locator('[data-hd-fc-coef]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-count]').fill('4');
  await fc.locator('[data-hd-fc-count]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-ship-los="0"]').fill('50');
  await fc.locator('[data-hd-fc-ship-los="0"]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-enemy]').fill('100');
  await fc.locator('[data-hd-fc-enemy]').dispatchEvent('change');

  const firstGear = fc.locator('[data-hd-fc-gear="0"]');
  const gearName = await firstGear.locator('option').evaluateAll(opts => opts.map(o => o.value).find(Boolean) || '');
  expect(gearName).not.toBe('');
  await firstGear.selectOption(gearName);
  await fc.locator('[data-hd-fc-slot="0"]').fill('18');
  await fc.locator('[data-hd-fc-slot="0"]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-star="0"]').fill('6');
  await fc.locator('[data-hd-fc-star="0"]').dispatchEvent('change');
  await fc.locator('[data-hd-fc-prof="0"]').check();

  await fc.locator('[data-hd-fc-add]').click();
  await expect(fc.locator('[data-hd-fc-gear]')).toHaveCount(2);

  let calc = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:manual']);
  expect(calc.hqLevel).toBe(99);
  expect(calc.branchCoef).toBe(2);
  expect(calc.shipCount).toBe(4);
  expect(calc.ships[0].los).toBe(50);
  expect(calc.enemyAir).toBe(100);
  expect(calc.gear[0].name).toBe(gearName);
  expect(calc.gear[0].slot).toBe(18);
  expect(calc.gear[0].star).toBe(6);
  expect(calc.gear[0].maxProf).toBe(true);
  expect(calc.gear).toHaveLength(2);

  await fc.locator('[data-hd-fc-remove="1"]').click();
  calc = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:manual']);
  expect(calc.gear).toHaveLength(1);

  const firstCorps = lb.locator('.hd-lb-corps').first();
  await firstCorps.locator('[data-hd-lb-auto="0"]').click();
  let base = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5']);
  expect(base.corps[0].squads.some(x => x.name)).toBe(true);

  await firstCorps.locator('[data-hd-lb-mode="0"]').selectOption('standby');
  await firstCorps.locator('[data-hd-lb-target="0"]').fill('8');
  await firstCorps.locator('[data-hd-lb-target="0"]').dispatchEvent('change');
  await firstCorps.locator('[data-hd-lb-slot="0"][data-squad="0"]').fill('12');
  await firstCorps.locator('[data-hd-lb-slot="0"][data-squad="0"]').dispatchEvent('change');
  await firstCorps.locator('[data-hd-lb-star="0"][data-squad="0"]').fill('4');
  await firstCorps.locator('[data-hd-lb-star="0"][data-squad="0"]').dispatchEvent('change');
  await firstCorps.locator('[data-hd-lb-prof="0"][data-squad="0"]').check();

  base = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5']);
  expect(base.corps[0].mode).toBe('standby');
  expect(base.corps[0].targetRadius).toBe(8);
  expect(base.corps[0].squads[0].slot).toBe(12);
  expect(base.corps[0].squads[0].star).toBe(4);
  expect(base.corps[0].squads[0].maxProf).toBe(true);

  await lb.locator('.hd-lb-corps').first().locator('[data-hd-lb-clear="0"]').click();
  base = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5']);
  expect(base.corps[0].squads.every(x => !x.name)).toBe(true);

  page.once('dialog', dialog => dialog.accept());
  await fc.locator('[data-hd-fc-reset]').click();
  calc = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:manual']);
  expect(calc.hqLevel).toBe(120);
  expect(calc.enemyAir).toBe(0);
  expect(calc.gear).toHaveLength(1);

  expect(errors).toEqual([]);
});


test('release smoke: land base owned-only filter and manual aircraft selection work', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() => typeof window.hdRenderLandBasePlanner === 'function', null, { timeout: 30000 });

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-land-base-v1');
    localStorage.removeItem('harbordesk-equipment-v1');
    selectedWorld = '6';
    selectedMap = '6-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="gear"]').click();
  const planner = page.locator('[data-map-pane="gear"] #hdLandBasePlanner');
  await expect(planner).toBeVisible();

  const firstPlane = planner.locator('[data-hd-lb-plane="0"][data-squad="0"]');
  const aircraft = await firstPlane.locator('option').evaluateAll(opts =>
    opts.map(o => o.value).filter(Boolean)
  );
  expect(aircraft.length).toBeGreaterThan(2);
  const ownedName = aircraft[0];

  await page.evaluate(name => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'lb-owned-test', name, count:2, star:3 }
    ]));
  }, ownedName);

  await planner.locator('#hdLBOnlyOwned').check();
  await expect(planner.locator('#hdLBOnlyOwned')).toBeChecked();

  const filtered = await planner.locator('[data-hd-lb-plane="0"][data-squad="0"] option').evaluateAll(opts =>
    opts.map(o => o.value).filter(Boolean)
  );
  expect(filtered).toEqual([ownedName]);

  await planner.locator('[data-hd-lb-plane="0"][data-squad="0"]').selectOption(ownedName);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5']);
  expect(state.corps[0].squads[0].name).toBe(ownedName);
  expect(state.corps[0].squads[0].star).toBe(3);
  expect(Number(state.corps[0].squads[0].slot)).toBeGreaterThan(0);

  await planner.locator('#hdLBOnlyOwned').uncheck();
  await expect(page.locator('#hdLandBasePlanner #hdLBOnlyOwned')).not.toBeChecked();
  await expect.poll(
    () => page.locator('#hdLandBasePlanner [data-hd-lb-plane="0"][data-squad="0"] option').count()
  ).toBeGreaterThan(2);
  const restored = await page.locator('#hdLandBasePlanner [data-hd-lb-plane="0"][data-squad="0"] option').evaluateAll(opts =>
    opts.map(o => o.value).filter(Boolean)
  );
  expect(restored.length).toBeGreaterThan(2);
  expect(restored).toContain(ownedName);

  expect(errors).toEqual([]);
});


test('release smoke: map drop filters and reverse lookup controls work', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdMapDropHtml === 'function' &&
    typeof window.hdWSShowElement === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-drop-hunts-v1');
    localStorage.removeItem('harbordesk-ship-roster-v1');
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="drop"]').click();
  let panel = page.locator('[data-map-pane="drop"] .hd-map-drop-panel');
  await expect(panel).toBeVisible();

  const firstChip = panel.locator('[data-hd-map-drop-ship]').first();
  const ownedName = await firstChip.getAttribute('data-hd-map-drop-ship');
  expect(ownedName).toBeTruthy();

  await page.evaluate(name => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'drop-owned-test', name, level:1, gear:'' }
    ]));
    renderMapPicker();
  }, ownedName);

  await page.locator('[data-map-tab="drop"]').click();
  panel = page.locator('[data-map-pane="drop"] .hd-map-drop-panel');
  await expect(panel.locator('[data-hd-map-drop-owned="1"]')).toHaveCount(1);

  await panel.locator('[data-hd-map-drop-view="missing"]').click();
  await expect(panel.locator('[data-hd-map-drop-view="missing"]')).toHaveClass(/active/);
  expect(await panel.locator('[data-hd-map-drop-owned="1"]').count()).toBe(0);

  await panel.locator('[data-hd-map-drop-view="featured"]').click();
  await expect(panel.locator('[data-hd-map-drop-view="featured"]')).toHaveClass(/active/);
  const featuredFlags = await panel.locator('[data-hd-map-drop-ship]').evaluateAll(nodes =>
    nodes.map(n => n.getAttribute('data-hd-map-drop-featured'))
  );
  expect(featuredFlags.length).toBeGreaterThan(0);
  expect(featuredFlags.every(v => v === '1')).toBe(true);

  await panel.locator('[data-hd-map-drop-view="all"]').click();
  await page.evaluate(() => window.hdWSShowElement?.('dropHuntingDb', true));
  const db = page.locator('#dropHuntingDb');
  await expect(db).toBeVisible({ timeout: 5000 });

  await db.locator('#hdDropSearch').fill(ownedName || '');
  await expect(db.locator('#hdDropDbList .hd-drop-card')).toHaveCount(1);
  await expect(db.locator('#hdDropDbList')).toContainText(ownedName || '');

  await db.locator('#hdDropSearch').fill('');
  await db.locator('[data-hd-drop-mapfilter="2-4"]').click();
  await expect(db.locator('[data-hd-drop-mapfilter="2-4"]')).toHaveClass(/active/);
  const locationMaps = await db.locator('#hdDropDbList .hd-drop-location strong').allTextContents();
  expect(locationMaps.length).toBeGreaterThan(0);
  expect(locationMaps.every(x => x.startsWith('2-4 '))).toBe(true);

  await db.locator('#hdDropSearch').fill(ownedName || '');
  await db.locator('#hdDropMissingOnly').check();
  await expect(db.locator('#hdDropDbList')).toContainText('条件に合うドロップ候補がないよ');
  await db.locator('#hdDropMissingOnly').uncheck();
  await expect(db.locator('#hdDropDbList')).toContainText(ownedName || '');

  expect(errors).toEqual([]);
});


test('release smoke: map mine readiness and support controls persist and run', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function' &&
    typeof window.hdGetAppState === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-readiness-v1');
    localStorage.removeItem('harbordesk-sortie-selection-v1');
    localStorage.removeItem('harbordesk-support-fleets-v1');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'mine-roster-yukikaze',name:'雪風',level:88,gear:'主砲 電探'},
      {id:'mine-roster-shigure',name:'時雨',level:77,gear:'主砲 電探'}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id:'mine-controls-fleet',
        name:'自分用操作確認艦隊',
        ships:[
          {ship:'雪風',gear:'主砲 電探'},
          {ship:'時雨',gear:'主砲 電探'},
          {ship:'大和',gear:'主砲 主砲'},
          {ship:'武蔵',gear:'主砲 主砲'},
          {ship:'赤城',gear:'艦戦 艦攻'},
          {ship:'加賀',gear:'艦戦 艦攻'}
        ],
        memo:'mine controls regression',
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="mine"]').click();
  const ready = page.locator('[data-map-pane="mine"] #hdSortieReadiness');
  const support = page.locator('[data-map-pane="mine"] #hdSupportPlanner');
  await expect(ready).toBeVisible();
  await expect(support).toBeVisible();

  const manual = ready.locator('[data-hd-sortie-check]').first();
  const checkId = await manual.getAttribute('data-hd-sortie-check');
  expect(checkId).toBeTruthy();
  await manual.check();
  let readyState = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-readiness-v1') || '{}'));
  expect(readyState['5-5:mine-controls-fleet']?.[checkId]).toBe(true);

  await ready.locator('[data-hd-sortie-refresh]').click();
  await expect(ready.locator('[data-hd-sortie-check="' + checkId + '"]')).toBeChecked();
  await ready.locator('[data-hd-sortie-reset]').click();
  readyState = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-readiness-v1') || '{}'));
  expect(readyState['5-5:mine-controls-fleet']).toBeUndefined();
  await expect(ready.locator('[data-hd-sortie-check="' + checkId + '"]')).not.toBeChecked();

  const vanguard = support.locator('.hd-sp-card').filter({ hasText:'前衛支援（道中）' });
  await expect(vanguard).toBeVisible();

  await vanguard.locator('[data-hd-sp-fleet="vanguard"]').selectOption('2');

  const firstName = vanguard.locator('[data-hd-sp-name="vanguard"][data-i="0"]');
  await firstName.fill('雪風');
  await firstName.dispatchEvent('change');
  const secondName = vanguard.locator('[data-hd-sp-name="vanguard"][data-i="1"]');
  await secondName.fill('時雨');
  await secondName.dispatchEvent('change');

  await vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="0"]').fill('1');
  await vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="0"]').dispatchEvent('change');
  await vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="1"]').fill('1');
  await vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="1"]').dispatchEvent('change');
  await vanguard.locator('[data-hd-sp-copy="vanguard"]').click();

  await expect(vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="0"]')).toHaveValue('88');
  await expect(vanguard.locator('[data-hd-sp-lv="vanguard"][data-i="1"]')).toHaveValue('77');

  await vanguard.locator('[data-hd-sp-fp="vanguard"][data-i="0"]').fill('90');
  await vanguard.locator('[data-hd-sp-fp="vanguard"][data-i="0"]').dispatchEvent('change');
  await vanguard.locator('[data-hd-sp-acc="vanguard"][data-i="0"]').fill('12');
  await vanguard.locator('[data-hd-sp-acc="vanguard"][data-i="0"]').dispatchEvent('change');
  await vanguard.locator('[data-hd-sp-kira="vanguard"][data-i="0"]').check();
  await vanguard.locator('[data-hd-sp-asw="vanguard"]').check();

  let supportState = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-support-fleets-v1') || '{}')['5-5']?.vanguard);
  expect(supportState.fleetNo).toBe(2);
  expect(supportState.ships[0].name).toBe('雪風');
  expect(supportState.ships[1].name).toBe('時雨');
  expect(supportState.ships[0].level).toBe(88);
  expect(supportState.ships[1].level).toBe(77);
  expect(supportState.ships[0].firepower).toBe(90);
  expect(supportState.ships[0].accuracy).toBe(12);
  expect(supportState.ships[0].kira).toBe(true);
  expect(supportState.aswConfirmed).toBe(true);

  const start = vanguard.locator('[data-hd-sp-start="vanguard"]');
  await expect(start).toBeEnabled();
  await start.click();

  const appState = await page.evaluate(() => window.hdGetAppState());
  const timer = appState.expeditions.find(x => x.support && x.supportKind === 'vanguard' && x.map === '5-5');
  expect(timer).toBeTruthy();
  expect(timer.expeditionId).toBe('33');
  expect(timer.fleetNo).toBe(2);
  await expect(support.locator('.hd-sp-active')).toContainText('第2艦隊は遠征中');

  expect(errors).toEqual([]);
});


test('release smoke: fleet suggestion saves and flows into sortie preparation', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdFSOpen === 'function' &&
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdSortieSelection === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-custom-fleets-v1');
    localStorage.removeItem('harbordesk-sortie-selection-v1');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'fs1',name:'雪風',type:'駆逐艦',level:90,gear:'主砲 電探'},
      {id:'fs2',name:'時雨',type:'駆逐艦',level:85,gear:'主砲 電探'},
      {id:'fs3',name:'矢矧',type:'軽巡洋艦',level:95,gear:'主砲 水偵'},
      {id:'fs4',name:'最上',type:'重巡洋艦',level:90,gear:'主砲 水偵'},
      {id:'fs5',name:'赤城',type:'正規空母',level:98,gear:'艦戦 艦攻'},
      {id:'fs6',name:'加賀',type:'正規空母',level:97,gear:'艦戦 艦攻'},
      {id:'fs7',name:'大和',type:'戦艦',level:99,gear:'主砲 主砲'},
      {id:'fs8',name:'武蔵',type:'戦艦',level:99,gear:'主砲 主砲'}
    ]));
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });

  await page.locator('.hd-map-tools-overview [data-hd-map-tool="suggest"]').click();
  const suggester = page.locator('#hdFleetSuggester');
  await expect(suggester).toBeVisible({ timeout: 5000 });
  await expect(suggester.locator('.hd-fs-card').first()).toBeVisible();

  await suggester.locator('[data-hd-fs-refresh]').click();
  const save = suggester.locator('[data-hd-fs-save="0"]');
  await expect(save).toBeVisible();
  await save.click();
  await expect(save).toHaveText('保存したよ');

  const saved = await page.evaluate(() => {
    const all = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');
    const selection = JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1') || '{}');
    const fleet = (all['2-4'] || [])[0] || null;
    return {
      fleet,
      selection: selection['2-4'] || '',
      selectedByApi: window.hdSortieSelection('2-4')
    };
  });
  expect(saved.fleet).toBeTruthy();
  expect(saved.fleet.name).toContain('2-4 自動提案');
  expect(saved.selection).toBe(saved.fleet.id);
  expect(saved.selectedByApi).toBe(saved.fleet.id);

  await page.evaluate(() => window.hdSPSOpen());
  const prep = page.locator('#hdSortiePreparation');
  await expect(prep).toBeVisible({ timeout: 5000 });
  await expect(prep.locator('#hdSortiePreparationBody')).toContainText(saved.fleet.name);

  await prep.locator('[data-hd-sps-refresh]').click();
  await expect(prep.locator('#hdSortiePreparationBody')).toContainText(saved.fleet.name);

  await prep.locator('[data-hd-sps-tab="mine"]').first().click();
  await expect(page.locator('[data-map-pane="mine"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="mine"] #customFleetPanel')).toContainText(saved.fleet.name);

  expect(errors).toEqual([]);
});


test('release smoke: map quest tab links live quest data and checklist', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdQuestRelatedToMap === 'function' &&
    typeof window.hdQuestOpenFromMap === 'function' &&
    typeof window.hdQuestAddFromMap === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="quest"]').click();
  const bq1 = page.locator('[data-map-pane="quest"] [data-hd-map-quest-id="Bq1"]');
  await expect(bq1).toBeVisible();
  await expect(bq1).toContainText('沖ノ島海域迎撃戦');
  await expect(bq1.locator('[data-hd-map-quest-open="Bq1"]')).toBeVisible();
  await expect(bq1.locator('[data-hd-map-quest-add="Bq1"]')).toBeVisible();

  await bq1.locator('[data-hd-map-quest-open="Bq1"]').click();
  await expect(page.locator('#questDatabase')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdQuestDbSearch')).toHaveValue('沖ノ島海域迎撃戦');
  await expect(page.locator('#questDatabase [data-hd-quest-id="Bq1"]')).toBeVisible();

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="quest"]').click();

  const add = page.locator('[data-map-pane="quest"] [data-hd-map-quest-add="Bq1"]');
  await add.click();
  await expect(page.locator('#quests')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#quests')).toContainText('沖ノ島海域迎撃戦');

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
  });
  await page.locator('[data-map-tab="quest"]').click();
  await expect(page.locator('[data-map-pane="quest"] [data-hd-map-quest-add="Bq1"]')).toHaveText('追加済み');

  expect(errors).toEqual([]);
});


test('release smoke: 5-5 keeps start and boss S separate in map and sortie routes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdSMNextNodeRows === 'function' &&
    typeof window.hdSMNodeRows === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-5';
    renderMapPicker();
  });

  await page.locator('[data-map-tab="map"]').click();
  await page.locator('.hd-map-structure-guide > summary').click();
  await expect(page.locator('#hdRouteHighlight')).toBeVisible();
  await page.locator('#hdRouteHighlight').click();
  await expect(page.locator('[data-map-pane="map"] .hd-map-route.highlight').first()).toBeVisible();
  await expect(page.locator('#hdMapNodeInfo')).toContainText('構造上の最短経路');
  await expect(page.locator('#hdMapNodeInfo')).toContainText('出撃');

  const boss = page.locator('[data-map-pane="map"] .hd-map-node[data-hd-node-id="S"]');
  await expect(boss).toBeVisible();
  await boss.click();
  await expect(page.locator('#hdMapNodeInfo')).toContainText('ボスマス');

  const routeState = await page.evaluate(() => ({
    next: window.hdSMNextNodeRows('5-5', {node:'',routeNodes:[]}).map(x => x.label).sort(),
    boss: window.hdSMNodeRows('5-5').find(x => x.label === 'S')
  }));
  expect(routeState.next).toEqual(['A','B']);
  expect(routeState.boss?.kind).toBe('boss');

  expect(errors).toEqual([]);
});


test('release smoke: 1-3 1-4 and 2-4 route graphs keep current starts and node roles', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapStartLabels === 'function' &&
    typeof window.hdSMNextNodeRows === 'function' &&
    typeof window.hdSMNodeRows === 'function',
    null,
    { timeout: 30000 }
  );

  const state = await page.evaluate(() => {
    const graphState = map => {
      const graph = HD_MAP_GRAPHS[map];
      return {
        starts: window.hdMapStartLabels(graph),
        boss: graph.boss || '',
        items: [...(graph.items || [])].sort(),
        vortex: [...(graph.vortex || [])].sort(),
        safe: [...(graph.safe || [])].sort(),
        next: window.hdSMNextNodeRows(map, {node:'', routeNodes:[]}).map(x => x.label).sort(),
        rows: Object.fromEntries(window.hdSMNodeRows(map).map(x => [x.label, x.kind]))
      };
    };
    return {
      m13: graphState('1-3'),
      m14: graphState('1-4'),
      m24: graphState('2-4')
    };
  });

  expect(state.m13.starts).toEqual(['S']);
  expect(state.m13.next).toEqual(['A','C']);
  expect(state.m13.boss).toBe('J');
  expect(state.m13.items).toEqual(['D','G']);
  expect(state.m13.vortex).toEqual(['H']);
  expect(state.m13.safe).toEqual(['A','B','I']);
  expect(state.m13.rows.J).toBe('boss');
  expect(state.m13.rows.H).toBe('vortex');

  expect(state.m14.starts).toEqual(['S']);
  expect(state.m14.next).toEqual(['A','B']);
  expect(state.m14.boss).toBe('L');
  expect(state.m14.items).toEqual(['C','E','G']);
  expect(state.m14.safe).toEqual(['A','F','K']);
  expect(state.m14.rows.L).toBe('boss');
  expect(state.m14.rows.F).toBe('safe');

  expect(state.m24.starts).toEqual(['S']);
  expect(state.m24.next).toEqual(['B']);
  expect(state.m24.boss).toBe('P');
  expect(state.m24.items).toEqual(['A','D','G','N']);
  expect(state.m24.vortex).toEqual(['C']);
  expect(state.m24.safe).toEqual(['H','J','K','O']);
  expect(state.m24.rows.P).toBe('boss');
  expect(state.m24.rows.C).toBe('vortex');
  expect(state.m24.rows.O).toBe('safe');

  expect(errors).toEqual([]);
});


test('release smoke: map overview exposes visible攻略 tool launcher', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdMapOpenTool === 'function' &&
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdFCRender === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'5-6':'overview'}));
    renderMapPicker();
  });

  const launcher = page.locator('.hd-map-tools-overview');
  await expect(launcher).toBeVisible();

  for (const tool of ['map','fleet','route','suggest','prep','gear','quest','drop','mine']) {
    await expect(launcher.locator(`[data-hd-map-tool="${tool}"]`)).toBeVisible();
  }

  await launcher.locator('[data-hd-map-tool="fleet"]').click();
  await expect(page.locator('[data-map-pane="fleet"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="fleet"] .map-tab-card').first()).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="route"]').click();
  await expect(page.locator('[data-map-pane="route"]')).toBeVisible();
  await expect(page.locator('#hdMapRouteRequirements')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="quest"]').click();
  await expect(page.locator('[data-map-pane="quest"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="quest"]')).not.toBeEmpty();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="mine"]').click();
  await expect(page.locator('[data-map-pane="mine"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="mine"] #customFleetPanel')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="suggest"]').click();
  await expect(page.locator('#hdFleetSuggester')).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdWSShowElement?.('guide', false);
  });
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="prep"]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdWSShowElement?.('guide', false);
  });
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="map"]').click();
  await expect(page.locator('[data-map-pane="map"]')).toBeVisible();
  await expect(page.locator('.hd-map-structure-guide > summary')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="gear"]').click();
  await expect(page.locator('[data-map-pane="gear"]')).toBeVisible();
  await expect(page.locator('#hdFleetCalculator')).toBeVisible({ timeout: 5000 });

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="drop"]').click();
  await expect(page.locator('[data-map-pane="drop"]')).toBeVisible();
  await expect(page.locator('.hd-map-drop-panel')).toBeVisible();

  expect(errors).toEqual([]);
});


test('release smoke: map攻略 critical assets are cache-busted', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);

  const data = await page.evaluate(() => {
    const scriptSrcs = [...document.scripts].map(x => x.getAttribute('src') || '');
    const styleHrefs = [...document.querySelectorAll('link[rel="stylesheet"]')].map(x => x.getAttribute('href') || '');
    const requiredScripts = [
      'map-details.js?v=480',
      'map-images.js?v=480',
      'map-tabs.js?v=480',
      'map-interactive.js?v=480',
      'map-advanced-data.js?v=480'
    ];
    const requiredStyles = [
      'map-details.css?v=480',
      'map-tabs.css?v=480',
      'map-images.css?v=480',
      'map-interactive.css?v=480'
    ];
    return {
      scripts: requiredScripts.map(x => ({ x, ok: scriptSrcs.some(s => s.endsWith(x)) })),
      styles: requiredStyles.map(x => ({ x, ok: styleHrefs.some(s => s.endsWith(x)) })),
      launcher: !!document.querySelector('.hd-map-tools-overview')
    };
  });

  expect(data.scripts.every(x => x.ok)).toBe(true);
  expect(data.styles.every(x => x.ok)).toBe(true);

  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'2-4':'overview'}));
    renderMapPicker();
  });
  await expect(page.locator('.hd-map-tools-overview')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: real iPhone flow opens map攻略 tools', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await expect(page.locator('[data-map="2-4"]')).toBeVisible();
  await page.locator('[data-map="2-4"]').click();

  await expect(page.locator('#selectedMapCard')).toBeVisible();
  await expect(page.locator('#selectedMapCard')).toContainText('2-4');
  await expect(page.locator('#selectedMapCard')).toContainText('推奨練度');
  const launcher = page.locator('.hd-map-tools-overview');
  await expect(launcher).toBeVisible();
  for (const tool of ['map','fleet','route','suggest','prep','gear','quest','drop','mine']) {
    await expect(launcher.locator(`[data-hd-map-tool="${tool}"]`)).toBeVisible();
  }

  await launcher.locator('[data-hd-map-tool="fleet"]').click();
  await expect(page.locator('[data-map-pane="fleet"]')).toBeVisible();
  await expect(page.locator('[data-map-pane="fleet"]')).toContainText('編成例');

  await page.locator('[data-map-tab="overview"]').click();
  await launcher.locator('[data-hd-map-tool="route"]').click();
  await expect(page.locator('[data-map-pane="route"]')).toBeVisible();
  await expect(page.locator('#hdMapRouteRequirements')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await launcher.locator('[data-hd-map-tool="quest"]').click();
  await expect(page.locator('[data-map-pane="quest"]')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await launcher.locator('[data-hd-map-tool="mine"]').click();
  await expect(page.locator('[data-map-pane="mine"] #customFleetPanel')).toBeVisible();

  const src = await page.locator('script[src^="app.js"]').getAttribute('src');
  expect(src).toBe('app.js?v=480');
  expect(errors).toEqual([]);
});


test('release smoke: standalone map fallback keeps all攻略 tool entries', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.waitForFunction(() =>
    typeof window.hdMapRenderFallback === 'function' &&
    typeof window.hdCoreMapAction === 'function'
  );

  const result = await page.evaluate(() => {
    const original = window.hdCoreMapToolsHtml;
    window.hdCoreMapToolsHtml = undefined;
    selectedWorld = '2';
    selectedMap = '2-4';
    window.hdMapRenderFallback();
    const actions = [...document.querySelectorAll('#selectedMapCard [data-hd-core-map-action]')]
      .map(x => x.dataset.hdCoreMapAction);
    window.hdCoreMapToolsHtml = original;
    return actions;
  });

  expect(result).toEqual(['map','fleet','route','suggest','prep','gear','quest','drop','mine']);
  expect(errors).toEqual([]);
});


test('release smoke: fallback攻略 state resets when switching maps', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="route"]').click();
  await expect(page.locator('#hdFallbackRouteTools')).toBeVisible();

  await page.locator('[data-map="2-5"]').click();
  await expect(page.locator('#selectedMapCard')).toContainText('2-5');
  await page.waitForTimeout(150);

  await expect(page.locator('#hdFallbackRouteTools')).toHaveCount(0);
  await expect(page.locator('#selectedMapCard [data-hd-core-fallback-pane]')).toHaveCount(0);
  await expect(page.locator('#selectedMapCard [data-hd-core-map-tools]')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: fallback攻略 state clears when map selection is reset', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="route"]').click();
  await expect(page.locator('#hdFallbackRouteTools')).toBeVisible();

  await page.evaluate(() => {
    selectedMap = '';
    renderMapPicker();
  });

  await expect(page.locator('#selectedMapCard')).toContainText('海域を選ぶと');
  await expect(page.locator('#selectedMapCard [data-hd-core-fallback-pane]')).toHaveCount(0);

  const state = await page.evaluate(() => ({
    active: window.hdCoreActiveFallbackPane?.() || null,
    render: window.__HD_MAP_RENDER_STATE || null
  }));
  expect(state.active).toBeNull();
  expect(state.render?.mode).toBe('empty');
  expect(state.render?.map).toBe('');
  expect(errors).toEqual([]);
});


test('release smoke: map-specific readiness fix flow pauses while no area is selected', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFEFixFlowSave === 'function' &&
    typeof window.hdFEFixFlowLoad === 'function',
    null,
    { timeout: 30000 }
  );

  const state = await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
    window.hdFEFixFlowSave({ id:'air', map:'2-4', startedAt:Date.now() });
    const selected = window.hdFEFixFlowLoad();

    selectedMap = '';
    renderMapPicker();
    const empty = window.hdFEFixFlowLoad();

    selectedWorld = '2';
    selectedMap = '2-4';
    renderMapPicker();
    const restored = window.hdFEFixFlowLoad();
    window.hdFEFixFlowSave(null);

    return {
      selected: selected?.map || '',
      empty: empty === null,
      restored: restored?.map || ''
    };
  });

  expect(state).toEqual({ selected:'2-4', empty:true, restored:'2-4' });
  expect(errors).toEqual([]);
});


test('release smoke: map deselection emits empty render state to dependent攻略 tools', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.evaluate(() => {
    window.__HD_EMPTY_RENDER_EVENTS = [];
    window.addEventListener('hd:map-rendered', event => {
      const detail = event?.detail || {};
      if (detail.mode === 'empty') window.__HD_EMPTY_RENDER_EVENTS.push(detail);
    });
  });

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  await page.waitForFunction(() => window.__HD_MAP_RENDER_STATE?.mode === 'fallback' && window.__HD_MAP_RENDER_STATE?.map === '2-4');

  await page.locator('[data-world="3"]').click();
  await expect(page.locator('#selectedMapCard')).toContainText('海域を選ぶと');

  const empty = await page.evaluate(() => ({
    state: window.__HD_MAP_RENDER_STATE || null,
    events: window.__HD_EMPTY_RENDER_EVENTS || []
  }));
  expect(empty.state?.mode).toBe('empty');
  expect(empty.state?.map).toBe('');
  expect(empty.events.length).toBeGreaterThan(0);
  expect(empty.events.at(-1)?.map).toBe('');
  expect(empty.events.at(-1)?.reason).toBe('no-map');
  expect(errors).toEqual([]);
});


test('release smoke: fallback攻略 state clears through world deselection', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="route"]').click();
  await expect(page.locator('#hdFallbackRouteTools')).toBeVisible();

  await page.locator('[data-world="3"]').click();
  await expect(page.locator('#selectedMapCard')).toContainText('海域を選ぶと');
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();
  await page.waitForTimeout(150);

  await expect(page.locator('#hdFallbackRouteTools')).toHaveCount(0);
  await expect(page.locator('#selectedMapCard [data-hd-core-fallback-pane]')).toHaveCount(0);
  await expect(page.locator('#selectedMapCard [data-hd-core-map-tools]')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: fallback map renderer still exposes攻略 tools when map tabs fail', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const card = page.locator('#selectedMapCard');
  await expect(card).toContainText('2-4');
  await expect(card).toContainText('推奨練度');

  const fallback = card.locator('[data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  for (const action of ['map','fleet','route','suggest','prep','gear','quest','drop','mine']) {
    await expect(fallback.locator(`[data-hd-core-map-action="${action}"]`)).toBeVisible();
  }

  await fallback.locator('[data-hd-core-map-action="map"]').click();
  const fallbackMap = page.locator('#hdFallbackMapTools');
  await expect(fallbackMap).toBeVisible();
  await expect(fallbackMap.locator('.hd-map-image-section')).toBeVisible();
  await fallbackMap.locator('.hd-map-structure-guide > summary').click();
  const fallbackNode = fallbackMap.locator('.hd-map-node').first();
  await expect(fallbackNode).toBeVisible();
  await fallbackNode.click();
  await expect(fallbackMap.locator('#hdMapNodeInfo')).toBeVisible();
  await fallbackMap.locator('#hdMapNodeInfo [data-open-route-tab]').click();
  const fallbackRoute = page.locator('#hdFallbackRouteTools');
  await expect(fallbackRoute).toBeVisible();
  await expect(fallbackRoute.locator('#hdMapRouteRequirements')).toBeVisible();

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="fleet"]').click();
  const fallbackFleet = page.locator('#hdFallbackFleetTools');
  await expect(fallbackFleet).toBeVisible();
  await expect(fallbackFleet).toContainText('編成例');
  await expect(fallbackFleet).toContainText('基本方針');
  const expectedFleetPolicy = await page.evaluate(() => MAP_DETAILS['2-4'].fleet || MAP_DETAILS['2-4'].formation || '');
  expect(expectedFleetPolicy).not.toBe('');
  await expect(fallbackFleet).toContainText(expectedFleetPolicy);
  await expect(fallbackMap).toBeHidden();

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="route"]').click();
  await expect(fallbackRoute).toBeVisible();
  await expect(fallbackRoute.locator('#hdMapRouteRequirements')).toBeVisible();
  await expect(fallbackFleet).toBeHidden();

  await page.waitForFunction(() =>
    typeof window.hdQuestRelatedToMap === 'function' &&
    typeof window.hdQuestAddFromMap === 'function' &&
    typeof window.hdQuestOpenFromMap === 'function',
    null,
    { timeout: 30000 }
  );
  const duplicateQuestId = await page.evaluate(() => {
    const linked = (window.hdQuestRelatedToMap?.('2-4') || []).find(q => q?.id && q?.name);
    if (!linked) return '';
    MAP_PLANS['2-4'] = MAP_PLANS['2-4'] || { presets: [], quests: [] };
    MAP_PLANS['2-4'].quests = [
      ...(MAP_PLANS['2-4'].quests || []),
      {
        id: 'hd-plan-only-test',
        name: '計画データだけの任務',
        kind: 'テスト',
        condition: '任務DB未登録'
      },
      {
        id: linked.id,
        name: linked.name,
        kind: '計画重複',
        condition: 'DBと同じ任務を計画側にも登録'
      }
    ];
    return String(linked.id);
  });
  expect(duplicateQuestId).not.toBe('');
  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="quest"]').click();
  const fallbackQuest = page.locator('#hdFallbackQuestTools');
  await expect(fallbackQuest).toBeVisible();
  await expect(fallbackQuest).toContainText('2-4 関連任務');
  const plannedOnly = fallbackQuest.locator('[data-hd-core-quest-id="hd-plan-only-test"]');
  await expect(plannedOnly).toBeVisible();
  await expect(plannedOnly.locator('.quest-tab-actions')).toHaveCount(0);
  const questCard = fallbackQuest.locator('[data-hd-core-quest-id="' + duplicateQuestId + '"]');
  await expect(questCard).toBeVisible();
  await expect(questCard.locator('.quest-tab-actions')).toBeVisible();
  const questId = await questCard.getAttribute('data-hd-core-quest-id');
  const questName = await questCard.locator('b').innerText();
  await questCard.locator('[data-hd-core-quest-add="' + questId + '"]').click();
  await expect.poll(async () => page.evaluate(id => state.quests.some(x => x.sourceId === id), questId)).toBe(true);

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="quest"]').click();
  await expect(fallbackQuest.locator('[data-hd-core-quest-add="' + questId + '"]')).toContainText('追加済み');
  await fallbackQuest.locator('[data-hd-core-quest-open="' + questId + '"]').click();
  await expect(page.locator('#questDatabase')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdQuestDbSearch')).toHaveValue(questName);

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="suggest"]').click();
  await expect(page.locator('#hdFleetSuggester')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="prep"]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="gear"]').click();
  await expect(page.locator('#hdFleetCalculator')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="drop"]').click();
  const fallbackDrop = page.locator('#hdFallbackDropTools');
  await expect(fallbackDrop).toBeVisible({ timeout: 5000 });
  await expect(fallbackDrop.locator('.hd-map-drop-panel')).toContainText('2-4 ドロップ艦娘');
  const featured = fallbackDrop.locator('[data-hd-map-drop-view="featured"]');
  await featured.click();
  await expect(fallbackDrop.locator('[data-hd-map-drop-view="featured"]')).toHaveClass(/active/);
  const dropShip = fallbackDrop.locator('[data-hd-map-drop-ship]').first();
  await expect(dropShip).toBeVisible();
  await dropShip.click();
  const hunts = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1') || '[]'));
  expect(hunts.some(x => x.map === '2-4')).toBe(true);
  await expect(fallbackDrop.locator('[data-hd-map-drop-ship].hunting').first()).toBeVisible();

  await page.evaluate(() => {
    window.hdWSMarkUserNavigation?.();
    window.hdRevealWorkspaceTarget?.('guide', false);
  });
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="mine"]').click();
  await expect(page.locator('#customFleetPanel')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: saved gear tab hydrates calculators without an extra tap', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'6-5':'gear'}));
  });

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="6"]').click();
  await page.locator('[data-map="6-5"]').click();

  const gear = page.locator('[data-map-pane="gear"].active');
  await expect(gear).toBeVisible();
  await expect(gear.locator('#hdMapEquipRecommend .hd-map-equip-recommend')).toBeVisible({ timeout: 5000 });
  await expect(gear.locator('#hdFleetCalculator')).toBeVisible({ timeout: 5000 });
  await expect(gear.locator('#hdLandBasePlanner')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: fallback gear workspace keeps recommendations calculators and land base interactive', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFCOpenFallback === 'function' &&
    typeof window.hdRenderMapEquipmentRecommendations === 'function' &&
    typeof window.hdRenderLandBasePlanner === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-fleet-calculator-v1');
    localStorage.removeItem('harbordesk-fleet-calculator-selection-v1');
    localStorage.removeItem('harbordesk-land-base-v1');
  });

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="6"]').click();
  await page.locator('[data-map="6-5"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="gear"]').click();

  const gear = page.locator('#hdFallbackGearTools');
  await expect(gear).toBeVisible();
  await expect(gear.locator('#hdMapEquipRecommend .hd-map-equip-recommend')).toBeVisible();
  await expect(gear.locator('#hdFleetCalculator')).toBeVisible();
  await expect(gear.locator('#hdLandBasePlanner')).toBeVisible();

  const hq = gear.locator('[data-hd-fc-hq]');
  await hq.fill('99');
  await hq.dispatchEvent('change');
  await expect(gear.locator('[data-hd-fc-hq]')).toHaveValue('99');

  const target = gear.locator('[data-hd-lb-target="0"]');
  await target.fill('9');
  await target.dispatchEvent('change');
  await expect(gear.locator('[data-hd-lb-target="0"]')).toHaveValue('9');

  const mode = gear.locator('[data-hd-lb-mode="0"]');
  await mode.selectOption('defense');
  await expect(gear.locator('[data-hd-lb-mode="0"]')).toHaveValue('defense');

  const saved = await page.evaluate(() => ({
    calc: JSON.parse(localStorage.getItem('harbordesk-fleet-calculator-v1') || '{}')['6-5:manual'] || null,
    base: JSON.parse(localStorage.getItem('harbordesk-land-base-v1') || '{}')['6-5'] || null
  }));
  expect(saved.calc?.hqLevel).toBe(99);
  expect(saved.base?.corps?.[0]?.targetRadius).toBe(9);
  expect(saved.base?.corps?.[0]?.mode).toBe('defense');

  await gear.locator('[data-hd-open-equip-db]').click();
  await expect(page.locator('#equipmentBook')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await expect(page.locator('#guide')).toBeVisible({ timeout: 5000 });
  await expect(gear).toBeVisible({ timeout: 5000 });
  await expect(gear.locator('[data-hd-fc-hq]')).toHaveValue('99');
  await expect(gear.locator('[data-hd-lb-target="0"]')).toHaveValue('9');
  await expect(gear.locator('[data-hd-lb-mode="0"]')).toHaveValue('defense');

  expect(errors).toEqual([]);
});


test('release smoke: saved mine tab hydrates readiness and support tools without an extra tap', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'5-5':'mine'}));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id:'saved-mine-fleet',
        name:'保存タブ復元確認艦隊',
        ships:[
          {ship:'雪風改二',masterId:0,gear:'主砲 電探'},
          {ship:'時雨改三',masterId:0,gear:'主砲 電探'},
          {ship:'大和改二重',masterId:0,gear:'主砲 主砲'},
          {ship:'武蔵改二',masterId:0,gear:'主砲 主砲'},
          {ship:'赤城改二',masterId:0,gear:'艦戦 艦攻'},
          {ship:'加賀改二',masterId:0,gear:'艦戦 艦攻'}
        ],
        memo:'saved mine tab regression',
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
  });

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="5"]').click();
  await page.locator('[data-map="5-5"]').click();

  const mine = page.locator('[data-map-pane="mine"].active');
  await expect(mine).toBeVisible();
  await expect(mine.locator('#customFleetPanel')).toContainText('保存タブ復元確認艦隊');
  await expect(mine.locator('#hdSortieReadiness')).toBeVisible({ timeout: 5000 });
  await expect(mine.locator('#hdSupportPlanner')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: fallback mine workspace keeps saved fleet readiness and support tools interactive', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.cfOpenMapPanel === 'function' &&
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-readiness-v1');
    localStorage.removeItem('harbordesk-support-fleets-v1');
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id:'fallback-mine-fleet',
        name:'フォールバック確認艦隊',
        ships:[
          {ship:'雪風改二',masterId:0,gear:'主砲 電探'},
          {ship:'時雨改三',masterId:0,gear:'主砲 電探'},
          {ship:'大和改二重',masterId:0,gear:'主砲 主砲'},
          {ship:'武蔵改二',masterId:0,gear:'主砲 主砲'},
          {ship:'赤城改二',masterId:0,gear:'艦戦 艦攻'},
          {ship:'加賀改二',masterId:0,gear:'艦戦 艦攻'}
        ],
        memo:'fallback regression',
        createdAt:Date.now(),
        updatedAt:Date.now()
      }]
    }));
  });

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="5"]').click();
  await page.locator('[data-map="5-5"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="mine"]').click();

  const mine = page.locator('#hdFallbackMineTools');
  await expect(mine).toBeVisible();
  await expect(mine.locator('#customFleetPanel')).toContainText('フォールバック確認艦隊');
  await expect(mine.locator('#hdSortieReadiness')).toBeVisible();
  await expect(mine.locator('#hdSupportPlanner')).toBeVisible();

  const manual = mine.locator('#hdSortieReadiness [data-hd-sortie-check]').first();
  await expect(manual).toBeVisible();
  const checkId = await manual.getAttribute('data-hd-sortie-check');
  await manual.locator('..').click();

  const ready = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('harbordesk-sortie-readiness-v1') || '{}')
  );
  expect(ready['5-5:fallback-mine-fleet']?.[checkId]).toBe(true);

  const support = mine.locator('#hdSupportPlanner');
  await support.locator('[data-hd-sp-name="vanguard"][data-i="0"]').fill('雪風改二');
  await support.locator('[data-hd-sp-name="vanguard"][data-i="0"]').dispatchEvent('change');
  await expect(support.locator('[data-hd-sp-name="vanguard"][data-i="0"]')).toHaveValue('雪風改二');

  await support.locator('[data-hd-sp-name="vanguard"][data-i="1"]').fill('時雨改三');
  await support.locator('[data-hd-sp-name="vanguard"][data-i="1"]').dispatchEvent('change');
  await expect(support.locator('[data-hd-sp-name="vanguard"][data-i="1"]')).toHaveValue('時雨改三');

  await support.locator('[data-hd-sp-kira="vanguard"][data-i="0"]').check();
  await support.locator('[data-hd-sp-fp="vanguard"][data-i="0"]').fill('88');
  await support.locator('[data-hd-sp-fp="vanguard"][data-i="0"]').dispatchEvent('change');

  const supportSaved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('harbordesk-support-fleets-v1') || '{}')
  );
  expect(supportSaved['5-5']?.vanguard?.ships?.[0]?.name).toBe('雪風改二');
  expect(supportSaved['5-5']?.vanguard?.ships?.[1]?.name).toBe('時雨改三');
  expect(supportSaved['5-5']?.vanguard?.ships?.[0]?.kira).toBe(true);
  expect(supportSaved['5-5']?.vanguard?.ships?.[0]?.firepower).toBe(88);

  const supportStart = support.locator('[data-hd-sp-start="vanguard"]');
  await expect(supportStart).toBeEnabled();
  await supportStart.click();
  const supportTimer = await page.evaluate(() =>
    (JSON.parse(localStorage.getItem('harbordesk-pwa-v1') || '{}').expeditions || [])
      .find(x => x.support && x.supportKind === 'vanguard' && x.map === '5-5')
  );
  expect(supportTimer?.expeditionId).toBe('33');
  expect(Number(supportTimer?.fleetNo)).toBe(3);

  await mine.locator('[data-hd-sortie-gear]').click();
  await expect(page.locator('#hdFallbackGearTools #hdFleetCalculator')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: fallback prep action recovers a failed lazy攻略 module', async ({ page }) => {
  const errors = [];
  let blockPrep = true;
  await page.route('**/map-tabs.js*', route => route.abort());
  await page.route('**/sortie-preparation-sheet.js*', route => blockPrep ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./sortie-preparation-sheet.js'] === 'error',
    null,
    { timeout: 30000 }
  );
  blockPrep = false;

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="prep"]').click();

  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    prep: typeof window.hdSPSOpen,
    status: window.HD_MODULE_STATUS?.['./sortie-preparation-sheet.js'] || ''
  }));
  expect(state).toEqual({ prep: 'function', status: 'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: sortie preparation opens fallback gear without readiness tab helper', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSPSOpen === 'function' &&
    typeof window.hdFCOpenFallback === 'function' &&
    typeof window.hdCoreMapAction === 'function',
    null,
    { timeout: 30000 }
  );

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="6"]').click();
  await page.locator('[data-map="6-5"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="prep"]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 5000 });

  await page.evaluate(() => { window.hdSortieOpenTab = undefined; });
  const gearAction = page.locator('#hdSortiePreparation [data-hd-sps-tab="gear"]').first();
  await expect(gearAction).toBeVisible();
  await gearAction.click();

  await expect(page.locator('#hdFallbackGearTools')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#hdFallbackGearTools #hdFleetCalculator')).toBeVisible({ timeout: 5000 });
  expect(errors).toEqual([]);
});


test('release smoke: fallback suggestion action recovers a failed lazy攻略 module', async ({ page }) => {
  const errors = [];
  let blockSuggest = true;
  await page.route('**/map-tabs.js*', route => route.abort());
  await page.route('**/fleet-suggester.js*', route => blockSuggest ? route.abort() : route.continue());
  await boot(page, errors);

  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./fleet-suggester.js'] === 'error',
    null,
    { timeout: 30000 }
  );
  blockSuggest = false;

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const fallback = page.locator('#selectedMapCard [data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  await fallback.locator('[data-hd-core-map-action="suggest"]').click();

  await expect(page.locator('#hdFleetSuggester')).toBeVisible({ timeout: 30000 });
  const state = await page.evaluate(() => ({
    suggest: typeof window.hdFSOpen,
    status: window.HD_MODULE_STATUS?.['./fleet-suggester.js'] || ''
  }));
  expect(state).toEqual({ suggest: 'function', status: 'ok' });
  expect(errors).toEqual([]);
});


test('release smoke: map攻略 fits iPhone width without horizontal swiping', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();
  await expect(page.locator('#selectedMapCard')).toContainText('推奨練度');

  const first = await page.evaluate(() => {
    const doc = document.documentElement;
    const world = document.getElementById('worldPicker');
    const card = document.getElementById('selectedMapCard');
    const tabBar = document.querySelector('.map-tab-bar');
    return {
      viewport: window.innerWidth,
      docWidth: doc.scrollWidth,
      worldWidth: world?.scrollWidth || 0,
      worldClient: world?.clientWidth || 0,
      cardRight: Math.ceil(card?.getBoundingClientRect().right || 0),
      tabWidth: tabBar?.scrollWidth || 0,
      tabClient: tabBar?.clientWidth || 0
    };
  });

  expect(first.docWidth).toBeLessThanOrEqual(first.viewport + 1);
  expect(first.worldWidth).toBeLessThanOrEqual(first.worldClient + 1);
  expect(first.cardRight).toBeLessThanOrEqual(first.viewport + 1);
  expect(first.tabWidth).toBeLessThanOrEqual(first.tabClient + 1);

  await page.locator('[data-world="5"]').click();
  await page.locator('[data-map="5-6"]').click();
  await page.locator('[data-map-tab="map"]').click();
  await expect(page.locator('[data-map-pane="map"]')).toBeVisible();

  const second = await page.evaluate(() => {
    const doc = document.documentElement;
    const stages = document.querySelector('.hd-map-stage-tabs');
    const image = document.querySelector('.hd-map-reference-image');
    return {
      viewport: window.innerWidth,
      docWidth: doc.scrollWidth,
      stageWidth: stages?.scrollWidth || 0,
      stageClient: stages?.clientWidth || 0,
      imageWidth: Math.ceil(image?.getBoundingClientRect().width || 0),
      imageRight: Math.ceil(image?.getBoundingClientRect().right || 0)
    };
  });

  expect(second.docWidth).toBeLessThanOrEqual(second.viewport + 1);
  expect(second.stageWidth).toBeLessThanOrEqual(second.stageClient + 1);
  expect(second.imageWidth).toBeLessThanOrEqual(second.viewport);
  expect(second.imageRight).toBeLessThanOrEqual(second.viewport + 1);
  expect(errors).toEqual([]);
});

test('release smoke:攻略 tabs stay readable, selected and keyboard operable on a narrow phone', async ({ page }) => {
  const errors = [];
  await page.setViewportSize({ width:320, height:740 });
  await boot(page, errors);
  await openGuideWorkspace(page);
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const tabs = page.locator('#selectedMapCard [role="tab"]');
  await expect(tabs).toHaveCount(8);
  const layout = await page.evaluate(() => {
    const bar = document.querySelector('#selectedMapCard [role="tablist"]');
    return { scroll:bar.scrollWidth-bar.clientWidth, font:parseFloat(getComputedStyle(bar.querySelector('[role="tab"]')).fontSize) };
  });
  expect(layout.scroll).toBeLessThanOrEqual(1);
  expect(layout.font).toBeGreaterThanOrEqual(14);

  await expect(page.locator('[data-map-tab="overview"]')).toHaveAttribute('aria-selected','true');
  await page.locator('[data-map-tab="overview"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-map-tab="map"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('[data-map-pane="map"]')).toBeVisible();
  await expect(page.locator('[data-map-tab="map"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('[data-map-tab="mine"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('[data-map-pane="mine"]')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: mobile update menu occupies its own row without covering攻略', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  const more = page.locator('.hd-header-more');
  await more.locator(':scope > summary').click();
  await expect(more).toHaveAttribute('open', '');
  const row = page.locator('#hdMobileHeaderMenuRow');
  await expect(row).toBeVisible();
  await expect(row.locator('.hd-version-menu')).toBeVisible();

  const layout = await page.evaluate(() => {
    const top=document.querySelector('.topbar')?.getBoundingClientRect();
    const row=document.getElementById('hdMobileHeaderMenuRow')?.getBoundingClientRect();
    const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
    const menu=document.querySelector('#hdMobileHeaderMenuRow .hd-version-menu')?.getBoundingClientRect();
    return {
      topBottom:Math.round(top?.bottom||0),
      rowTop:Math.round(row?.top||0),
      rowBottom:Math.round(row?.bottom||0),
      navTop:Math.round(nav?.top||0),
      menuWidth:Math.round(menu?.width||0),
      viewport:window.innerWidth
    };
  });

  expect(Math.abs(layout.rowTop-layout.topBottom)).toBeLessThanOrEqual(2);
  expect(layout.rowBottom).toBeLessThanOrEqual(layout.navTop+2);
  expect(layout.menuWidth).toBeLessThanOrEqual(layout.viewport);
  
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    window.scrollBy(0, 160);
    window.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(350);
  await expect(more).not.toHaveAttribute('open', '');
  await expect(row).toBeHidden();
  expect(errors).toEqual([]);
});


test('release smoke: one canonical map renderer owns primary and fallback paths', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const primary = await page.evaluate(() => ({
    info: window.hdMapRendererInfo?.(),
    mode: window.__HD_MAP_RENDER_STATE?.mode,
    wrappers: {
      base: typeof window.hdMapBaseRenderPicker === 'function',
      tabs: typeof window.hdMapTabsCoreApply === 'function',
      fallback: typeof window.hdMapRenderFallback === 'function',
      plans: typeof window.hdRenderMapPlans === 'function'
    }
  }));
  expect(primary.info?.installed).toBe(true);
  expect(primary.mode).toBe('tabs');
  expect(primary.wrappers).toEqual({base:true,tabs:true,fallback:true,plans:true});
  await expect(page.locator('.map-tabs-shell')).toBeVisible();
  expect(errors).toEqual([]);
});

test('release smoke: canonical map renderer falls back without override chains', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const info = await page.evaluate(() => window.hdMapRendererInfo?.());
  expect(info?.installed).toBe(true);
  expect(info?.mode).toBe('fallback');
  expect(info?.hasFallback).toBe(true);
  await expect(page.locator('[data-hd-core-map-tools]')).toBeVisible();
  await expect(page.locator('#mapExtraPanel')).toContainText('編成例');
  expect(errors).toEqual([]);
});


test('release smoke: shared mobile layout prevents chrome overlap across iPhone sizes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const sizes = [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 844, height: 390 }
  ];

  await page.waitForFunction(() => typeof window.hdInitUpdateManagerUI === 'function', null, { timeout: 30000 });
  await page.evaluate(() => window.hdInitUpdateManagerUI());
  await page.waitForFunction(() =>
    !!document.querySelector('.hd-header-more') &&
    !!document.getElementById('hdMobileHeaderMenuRow'),
    null,
    { timeout: 30000 }
  );

  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.waitForTimeout(180);
    await page.locator('[data-hd-ws-group="guide"]').click();
    await page.waitForTimeout(120);

    const before = await page.evaluate(() => {
      const top=document.querySelector('.topbar')?.getBoundingClientRect();
      const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
      const dock=document.getElementById('hdMobileDock')?.getBoundingClientRect();
      const main=document.querySelector('main')?.getBoundingClientRect();
      const css=getComputedStyle(document.documentElement);
      return {
        vw:window.innerWidth,
        docWidth:document.documentElement.scrollWidth,
        topBottom:Math.round(top?.bottom||0),
        navTop:Math.round(nav?.top||0),
        dockWidth:Math.round(dock?.width||0),
        dockBottom:Math.round(dock?.bottom||0),
        mainWidth:Math.round(main?.width||0),
        clearance:css.getPropertyValue('--hd-mobile-bottom-clearance').trim()
      };
    });

    expect(before.docWidth).toBeLessThanOrEqual(before.vw + 1);
    expect(before.topBottom).toBeLessThanOrEqual(before.navTop + 2);
    expect(before.dockWidth).toBeLessThanOrEqual(before.vw);
    expect(before.mainWidth).toBeLessThanOrEqual(before.vw);
    expect(before.clearance).not.toBe('');

    if (size.width <= 560) {
      await page.waitForTimeout(350);
      await page.evaluate(() => {
        const more=document.querySelector('.hd-header-more');
        if(more)more.open=true;
        window.hdSyncMobileHeaderMenu?.();
      });
      await expect(page.locator('#hdMobileHeaderMenuRow')).toBeVisible();
      const open = await page.evaluate(() => {
        const row=document.getElementById('hdMobileHeaderMenuRow')?.getBoundingClientRect();
        const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
        return {rowBottom:Math.round(row?.bottom||0),navTop:Math.round(nav?.top||0)};
      });
      expect(open.rowBottom).toBeLessThanOrEqual(open.navTop + 2);
      await page.evaluate(() => {
        const more=document.querySelector('.hd-header-more');
        if(more)more.open=false;
        window.hdSyncMobileHeaderMenu?.();
      });
      await page.waitForTimeout(50);
    }
  }

  expect(errors).toEqual([]);
});


test('release smoke: diagnostic snapshot rows never enter user snapshot lists', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHOpenDb === 'function' &&
    typeof window.hdPHGetSnapshots === 'function' &&
    typeof window.hdPHIsDiagnosticSnapshot === 'function'
  );

  const result = await page.evaluate(async () => {
    const db=await window.hdPHOpenDb();
    const probe={id:'__hd-safety-probe-stale-test',at:Date.now()+1000,reason:'診断プローブ',payload:{},bytes:0,probe:true};
    const real={id:'hd-real-snapshot-test',at:Date.now(),reason:'手動',payload:{'harbordesk-test':'{}'},bytes:2};
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');
      store.put(probe);store.put(real);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    db.close();
    const rows=await window.hdPHGetSnapshots();
    const db2=await window.hdPHOpenDb();
    await new Promise((resolve,reject)=>{
      const tx=db2.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');
      store.delete(probe.id);store.delete(real.id);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    db2.close();
    return {
      ids:rows.map(x=>x.id),
      probeRecognized:window.hdPHIsDiagnosticSnapshot(probe),
      realRecognized:window.hdPHIsDiagnosticSnapshot(real)
    };
  });

  expect(result.probeRecognized).toBe(true);
  expect(result.realRecognized).toBe(false);
  expect(result.ids).toContain('hd-real-snapshot-test');
  expect(result.ids).not.toContain('__hd-safety-probe-stale-test');
  expect(errors).toEqual([]);
});

test('release smoke: internal snapshot restore shares the global restore lock', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHCreateSnapshot === 'function' &&
    typeof window.hdPHRestoreSnapshot === 'function' &&
    typeof window.hdPHGetSnapshots === 'function' &&
    typeof window.hdPHWithRestoreLock === 'function' &&
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  const result = await page.evaluate(async () => {
    window.__hdInternalRestoreAlerts = [];
    window.alert = message => window.__hdInternalRestoreAlerts.push(String(message || ''));
    localStorage.setItem('harbordesk-internal-lock-test', JSON.stringify({ value: 'safe' }));
    await window.hdPHCreateSnapshot('lock-test');
    const rows = await window.hdPHGetSnapshots();
    const id = rows.find(x => x.reason === 'lock-test')?.id;

    let ownedAtConfirm = false;
    window.confirm = () => {
      ownedAtConfirm = window.__hdBackupRestoreBusy === true;
      return false;
    };
    const cancelled = await window.hdPHRestoreSnapshot(id);
    const clearedAfterCancel = window.__hdBackupRestoreBusy === false;

    let releaseHold;
    const held = window.hdPHWithRestoreLock(() => new Promise(resolve => { releaseHold = resolve; }));
    await new Promise(resolve => setTimeout(resolve, 0));
    const helperOwnsLock = window.__hdBackupRestoreBusy === true;

    const built = window.hdBuildBackupFile();
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-shared-lock.json', { type: 'application/json' });
    const externalBlocked = await window.importBackup(file);
    const internalBlocked = await window.hdPHRestoreSnapshot(id);

    releaseHold(false);
    const heldResult = await held;
    const clearedAfterHold = window.__hdBackupRestoreBusy === false;

    return {
      cancelled,
      ownedAtConfirm,
      clearedAfterCancel,
      helperOwnsLock,
      externalBlocked,
      internalBlocked,
      heldResult,
      clearedAfterHold,
      alerts: window.__hdInternalRestoreAlerts || []
    };
  });

  expect(result.cancelled).toBe(false);
  expect(result.ownedAtConfirm).toBe(true);
  expect(result.clearedAfterCancel).toBe(true);
  expect(result.helperOwnsLock).toBe(true);
  expect(result.externalBlocked).toBe(false);
  expect(result.internalBlocked).toBe(false);
  expect(result.heldResult).toBe(false);
  expect(result.clearedAfterHold).toBe(true);
  expect(result.alerts.join(' ')).toContain('進行中');
  expect(errors).toEqual([]);
});

test('release smoke: update menu bootstrap is available before async modules finish', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(String(err?.message || err)));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });

  await page.waitForFunction(() => typeof window.hdInitUpdateManagerUI === 'function', null, { timeout: 12000 });
  const result = await page.evaluate(() => {
    const ok=window.hdInitUpdateManagerUI();
    const row=document.getElementById('hdMobileHeaderMenuRow');
    const more=document.querySelector('.hd-header-more');
    return {
      ok,
      rowExists:!!row,
      rowHidden:!!row?.hidden,
      menuExists:!!more,
      bound:more?.dataset?.hdInlineBound||''
    };
  });

  expect(result.ok).toBe(true);
  expect(result.rowExists).toBe(true);
  expect(result.rowHidden).toBe(true);
  expect(result.menuExists).toBe(true);
  expect(result.bound).toBe('1');
  expect(errors).toEqual([]);
});


test('release smoke: dedicated sortie mode summarizes active session', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMOpen === 'function' &&
    typeof window.hdQNMobileAttentionItems === 'function'
  );

  const startedAt = Date.now() - 5 * 60 * 1000;
  await page.evaluate(startedAt => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-test-session',
      map:'2-4',
      startedAt,
      fleetId:'sm-test-fleet',
      fleetName:'テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-test-fleet',name:'テスト艦隊',ships:[
        {ship:'吹雪',gear:'12.7cm連装砲 / 電探'},
        {ship:'赤城',gear:'艦戦 / 艦攻'}
      ]},
      readinessSnapshot:{autoOk:2,autoTotal:3,manualDone:1,manualTotal:2,unresolved:[{label:'補給',state:'warn',detail:''}]},
      shipCount:2,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  }, startedAt);

  await expect(page.locator('#hdSortieMode')).toBeVisible();
  await expect(page.locator('#hdSortieModeBody')).toContainText('2-4');
  await expect(page.locator('#hdSortieModeBody')).toContainText('テスト艦隊');
  await expect(page.locator('#hdSortieModeBody')).toContainText('補給');
  await expect(page.locator('[data-hd-sm-elapsed]')).not.toHaveText('');
  await expect(page.locator('.hd-sm-shortcuts button')).toHaveCount(5);

  const attention = await page.evaluate(() => window.hdQNMobileAttentionItems().find(x => x?.id === 'hdSortieMode'));
  expect(attention?.title || '').toContain('2-4');
  expect(attention?.reason || '').toContain('出撃');
  expect(Number(attention?.priority) || 0).toBe(90);
  expect(errors).toEqual([]);
});

test('release smoke: sortie mode return recording clears active session', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSSFinish === 'function' &&
    typeof window.hdSLRecordEntry === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-finish-session',
      map:'3-2',
      startedAt:Date.now()-120000,
      fleetId:'sm-finish-fleet',
      fleetName:'帰還テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-finish-fleet',name:'帰還テスト艦隊',ships:[{ship:'夕立',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('#hdSortieMode')).toBeVisible();
  await page.locator('#hdSMResult').selectOption('撤退');
  await page.locator('#hdSMNode').fill('K');
  await page.locator('#hdSMBattles').fill('3');
  await page.locator('#hdSMMemo').fill('出撃モード記録テスト');
  await page.locator('[data-hd-sm-finish]').click();

  await page.waitForFunction(() => !localStorage.getItem('harbordesk-active-sortie-session-v1'));
  const result = await page.evaluate(() => {
    let rows=[];try{rows=JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')||[]}catch{}
    const hit=rows.find(x=>x.sessionId==='sm-finish-session');
    return {active:localStorage.getItem('harbordesk-active-sortie-session-v1'),hit};
  });
  expect(result.active).toBeNull();
  expect(result.hit?.map).toBe('3-2');
  expect(result.hit?.result).toBe('撤退');
  expect(result.hit?.node).toBe('K');
  expect(result.hit?.battles).toBe(3);
  expect(result.hit?.memo || '').toContain('出撃モード記録テスト');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode autosaves and restores in-progress draft', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSaveDraft === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-draft-session',
      map:'4-5',
      startedAt:Date.now()-180000,
      fleetId:'sm-draft-fleet',
      fleetName:'下書きテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-draft-fleet',name:'下書きテスト艦隊',ships:[{ship:'最上',gear:'三式弾'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('#hdSMResult').selectOption('A');
  await page.locator('#hdSMNode').fill('K');
  await page.locator('#hdSMBattles').fill('4');
  await page.locator('#hdSMDrop').fill('テスト艦');
  await page.locator('#hdSMBuckets').fill('2');
  await page.locator('#hdSMMemo').fill('途中入力を保持');
  await page.locator('#hdSMBoss').check();

  // Repeated delayed bootstrap must not redraw an active form and erase unsaved controls.
  await page.evaluate(() => window.hdSMInstall());
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await expect(page.locator('#hdSMBoss')).toBeChecked();

  await page.evaluate(() => window.hdSMSaveDraft());

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null')?.draft || null);
  expect(stored?.result).toBe('A');
  expect(stored?.node).toBe('K');
  expect(stored?.battles).toBe(4);
  expect(stored?.boss).toBe(true);
  expect(stored?.drop).toBe('テスト艦');
  expect(stored?.buckets).toBe(2);
  expect(stored?.memo).toBe('途中入力を保持');
  expect(Number(stored?.updatedAt)||0).toBeGreaterThan(0);

  await page.evaluate(() => window.hdSMRender());
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await expect(page.locator('#hdSMNode')).toHaveValue('K');
  await expect(page.locator('#hdSMBattles')).toHaveValue('4');
  await expect(page.locator('#hdSMDrop')).toHaveValue('テスト艦');
  await expect(page.locator('#hdSMBuckets')).toHaveValue('2');
  await expect(page.locator('#hdSMMemo')).toHaveValue('途中入力を保持');
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await expect(page.locator('[data-hd-sm-draft-status]')).toContainText('保存');

  const attention = await page.evaluate(() => window.hdQNMobileAttentionItems().find(x => x?.id === 'hdSortieMode'));
  expect(attention?.detail || '').toContain('K到達');
  expect(errors).toEqual([]);
});



test('release smoke: sortie mode node picker records and rewinds route trail', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetNode === 'function' &&
    typeof window.hdSMUndoNode === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-node-session',
      map:'2-4',
      startedAt:Date.now()-120000,
      fleetId:'sm-node-fleet',
      fleetName:'マス追跡テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-node-fleet',name:'マス追跡テスト艦隊',ships:[{ship:'島風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-node]')).toHaveCount(16);
  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('B');
  await expect(page.locator('.hd-sm-route-trail')).toContainText('B');

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('G');
  await page.locator('[data-hd-sm-next-node="H"]').click();
  await page.locator('[data-hd-sm-next-node="L"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="P"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('P');
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await expect(page.locator('.hd-sm-route-trail')).toContainText('B → G → H → L → P');

  await page.locator('[data-hd-sm-route-undo]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('L');
  await expect(page.locator('#hdSMBoss')).not.toBeChecked();
  await page.locator('[data-hd-sm-route-undo]').click();
  await page.locator('[data-hd-sm-route-undo]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('G');
  await expect(page.locator('.hd-sm-route-trail')).toContainText('B → G');

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null')?.draft || null);
  expect(stored?.node).toBe('G');
  expect(stored?.routeNodes).toEqual(['B','G']);
  expect(stored?.boss).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode prioritizes graph-connected next nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMNextNodeRows === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-next-node-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-next-node-fleet',
      fleetName:'次マステスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-next-node-fleet',name:'次マステスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(1);
  await expect(page.locator('[data-hd-sm-next-node="B"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-node]')).toHaveCount(16);

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('B');
  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(2);
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeDisabled();

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="C"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('C');
  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(2);
  await expect(page.locator('[data-hd-sm-next-node="F"]')).toBeEnabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeEnabled();
  await expect(page.locator('.hd-sm-route-trail')).toContainText('B → C');

  const nextRows = await page.evaluate(() => window.hdSMNextNodeRows('2-4',{node:'C'}).map(x=>x.label).sort());
  expect(nextRows).toEqual(['F','G']);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode shows current node branch guidance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBranchHint === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-branch-hint-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-branch-hint-fleet',
      fleetName:'分岐ヒントテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-branch-hint-fleet',name:'分岐ヒントテスト艦隊',ships:[{ship:'時雨',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();
  await page.locator('[data-hd-sm-next-node="H"]').click();

  await expect(page.locator('.hd-sm-branch-hint')).toContainText('Hマスの分岐条件');
  await expect(page.locator('.hd-sm-branch-hint')).toContainText('L');
  await expect(page.locator('.hd-sm-branch-hint')).toContainText('I');
  const hint = await page.evaluate(() => window.hdSMBranchHint('2-4',{node:'H'}));
  expect(hint.text).toContain('L');
  expect(hint.text).toContain('I');
  expect(hint.source).toContain('攻略Wiki');
  expect(errors).toEqual([]);
});

test('release smoke: sortie mode previews next-node battle intelligence', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMNodeIntel === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-node-intel-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-node-intel-fleet',
      fleetName:'次マス注意テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-node-intel-fleet',name:'次マス注意テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const b = page.locator('[data-hd-sm-next-node="B"]');
  await expect(b).toBeVisible();
  await expect(b.locator('.hd-sm-next-risk')).toContainText('戦闘');
  await expect(b.locator('em')).toContainText('重巡リ級elite');

  const intel = await page.evaluate(() => window.hdSMNodeIntel('2-4',{label:'B',kind:'normal'}));
  expect(intel.hasDetail).toBe(true);
  expect(intel.enemy).toContain('重巡リ級elite');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode recommends formations and current-node cautions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMFormationAdvice === 'function' &&
    typeof window.hdSMNodeIntel === 'function'
  );

  const advice = await page.evaluate(() => ({
    normal: window.hdSMFormationAdvice('normal',{}),
    sub: window.hdSMFormationAdvice('sub',{}),
    air: window.hdSMFormationAdvice('air',{})
  }));
  expect(advice.normal.formation).toBe('単縦陣');
  expect(advice.sub.formation).toBe('単横陣');
  expect(advice.air.formation).toBe('輪形陣');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-formation-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-formation-fleet',
      fleetName:'陣形ガイドテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-formation-fleet',name:'陣形ガイドテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const b = page.locator('[data-hd-sm-next-node="B"]');
  await expect(b.locator('.hd-sm-next-formation')).toContainText('単縦陣');
  await expect(b.locator('.hd-sm-next-caution')).toContainText('砲雷撃戦');
  await b.click();

  await expect(page.locator('.hd-sm-current-tactic')).toBeVisible();
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('Bマス');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('単縦陣');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('警戒ポイント');
  expect(errors).toEqual([]);
});



test('release smoke: sortie mode gates advancement behind damage confirmation', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMAdvanceGuard === 'function' &&
    typeof window.hdSMSetAdvanceGuard === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-guard-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-guard-fleet',
      fleetName:'大破チェックテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{
        id:'sm-damage-guard-fleet',
        name:'大破チェックテスト艦隊',
        ships:[
          {ship:'雪風',nowHp:32,maxHp:32,gear:'主砲'},
          {ship:'時雨',nowHp:31,maxHp:31,gear:'主砲'}
        ]
      },
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:2,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('.hd-sm-advance-guard')).toContainText('進撃前に大破確認');
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeDisabled();

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeEnabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeEnabled();

  await page.locator('[data-hd-sm-next-node="G"]').click();
  await expect(page.locator('[data-hd-sm-next-node="H"]')).toBeEnabled();
  await page.locator('[data-hd-sm-next-node="H"]').click();
  await page.locator('[data-hd-sm-next-node="I"]').click();
  await expect(page.locator('[data-hd-sm-next-node="E"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="K"]')).toBeDisabled();
  const guard = await page.evaluate(() => window.hdSMAdvanceGuard(JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')), JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft));
  expect(guard.current).toBe('I');
  expect(guard.confirmed).toBe(false);
  expect(errors).toEqual([]);
});

test('release smoke: damage retreat marks sortie draft as retreat', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetAdvanceGuard === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-retreat-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-retreat-fleet',
      fleetName:'大破撤退テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-damage-retreat-fleet',name:'大破撤退テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-damage-retreat]').click();
  await expect(page.locator('.hd-sm-advance-guard')).toContainText('大破あり・撤退');
  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMMemo')).toHaveValue(/大破撤退/);
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeDisabled();

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.result).toBe('撤退');
  expect(draft.advanceGuard.safe).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: sortie damage guard blocks alternate node selection paths', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetNode === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-hard-lock-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-hard-lock-fleet',
      fleetName:'進撃ロックテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-damage-hard-lock-fleet',name:'進撃ロックテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-node="D"]')).toBeDisabled();
  const blocked = await page.evaluate(() => window.hdSMSetNode('D'));
  expect(blocked).toBe(false);
  let draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('B');
  expect(draft.routeNodes).toEqual(['B']);

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('[data-hd-sm-node="D"]')).toBeEnabled();
  const moved = await page.evaluate(() => window.hdSMSetNode('D'));
  expect(moved).toBe(true);
  draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('D');
  expect(draft.routeNodes).toEqual(['B','D']);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode keeps current battle status visible in sticky hud', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMHudHtml === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-fleet',
      fleetName:'出撃HUDテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-fleet',name:'出撃HUDテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('B');
  await expect(hud).toContainText('単縦陣');
  await expect(hud).toContainText('大破未確認');
  expect(await hud.evaluate(el => getComputedStyle(el).position)).toBe('sticky');

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('大破確認済');
  await expect(page.locator('.hd-sm-hud')).toHaveClass(/ready/);
  await expect(page.locator('[data-hd-sm-hud-jump="next"]')).toBeVisible();
  expect(errors).toEqual([]);
});



test('release smoke: sortie mode auto-counts battles and supports quick return entry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBattleCount === 'function' &&
    typeof window.hdSMQuickResult === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-quick-return-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-quick-return-fleet',
      fleetName:'帰還クイック入力テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-quick-return-fleet',name:'帰還クイック入力テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('#hdSMBattles')).toHaveValue('1');
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();
  await expect(page.locator('#hdSMBattles')).toHaveValue('1');

  await page.locator('[data-hd-sm-quick-result="A"]').click();
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await page.locator('[data-hd-sm-quick-boss]').click();
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await page.locator('[data-hd-sm-quick-drop-none]').click();
  await expect(page.locator('#hdSMDrop')).toHaveValue('なし');
  await page.locator('[data-hd-sm-quick-bucket]').click();
  await expect(page.locator('#hdSMBuckets')).toHaveValue('1');

  const data = await page.evaluate(() => ({
    count: window.hdSMBattleCount('2-4',['B','G']),
    draft: JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft
  }));
  expect(data.count).toBe(1);
  expect(data.draft.result).toBe('A');
  expect(data.draft.boss).toBe(true);
  expect(data.draft.drop).toBe('なし');
  expect(data.draft.buckets).toBe(1);
  expect(errors).toEqual([]);
});

test('release smoke: sortie mode records structured retreat reason', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMQuickRetreatReason === 'function' &&
    typeof window.hdSSFinish === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-retreat-reason-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-retreat-reason-fleet',
      fleetName:'撤退理由テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-retreat-reason-fleet',name:'撤退理由テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'A',routeNodes:['A'],result:'S',memo:'',battles:1}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-quick-result="撤退"]').click();
  await expect(page.locator('.hd-sm-retreat-reasons')).toBeVisible();
  await page.locator('[data-hd-sm-retreat-reason="索敵不足"]').click();
  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMRetreatReason')).toHaveValue('索敵不足');
  await expect(page.locator('.hd-sm-retreat-reasons')).toContainText('選択中: 索敵不足');

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.retreatReason).toBe('索敵不足');

  await page.locator('[data-hd-sm-finish]').click();
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')[0]);
  expect(log.result).toBe('撤退');
  expect(log.retreat).toBe(true);
  expect(log.retreatReason).toBe('索敵不足');
  expect(errors).toEqual([]);
});


test('release smoke: sortie analytics summarizes structured retreat reasons', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'r1',at:Date.now(),map:'2-4',node:'D',result:'撤退',retreat:true,retreatReason:'大破',battles:2},
      {id:'r2',at:Date.now()-1000,map:'2-4',node:'G',result:'撤退',retreat:true,retreatReason:'大破',battles:3},
      {id:'r3',at:Date.now()-2000,map:'2-4',node:'H',result:'撤退',retreat:true,retreatReason:'索敵不足',battles:3},
      {id:'r4',at:Date.now()-3000,map:'2-4',node:'O',result:'S',retreat:false,battles:5,boss:true}
    ]));
    window.hdSLRender?.();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.waitForTimeout(150);
  const card = page.locator('#sortieLog .hd-spa-card').first();
  await expect(card).toBeVisible();
  const reasons = card.locator('.hd-spa-retreat-reasons');
  await expect(reasons).toBeVisible();
  await expect(reasons).toContainText('撤退理由');
  await expect(reasons).toContainText('大破');
  await expect(reasons).toContainText('2回 / 67%');
  await expect(reasons).toContainText('索敵不足');
  await expect(reasons).toContainText('1回 / 33%');
  await expect(card.locator('.hd-spa-review')).toContainText('道中の安定性を見直す');
  await expect(card.locator('.hd-spa-review')).toContainText('大破撤退 2回');
  expect(errors).toEqual([]);
});



test('release smoke: sticky sortie HUD exposes confirmed next-node actions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetNode === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-next-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-next-fleet',
      fleetName:'HUD次マステスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-next-fleet',name:'HUD次マステスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:'',advanceGuard:{node:'B',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toContainText('大破確認済');
  await expect(hud.locator('[data-hd-sm-hud-node="C"]')).toBeVisible();
  await expect(hud.locator('[data-hd-sm-hud-node="G"]')).toBeVisible();

  await hud.locator('[data-hd-sm-hud-node="G"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('G');
  await expect(page.locator('.hd-sm-hud')).toContainText('非戦闘');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="H"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="H"]')).toBeEnabled();

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('G');
  expect(draft.advanceGuard).toBe(null);
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows current route condition', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMBranchHint === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-route-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-route-fleet',
      fleetName:'HUD分岐テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-route-fleet',name:'HUD分岐テスト艦隊',ships:[{ship:'時雨',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'H',routeNodes:['B','G','H'],result:'S',memo:'',advanceGuard:null}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const route = page.locator('.hd-sm-hud-branch');
  await expect(route).toBeVisible();
  await expect(route).toContainText('Hマスの分岐条件');
  await expect(route).toContainText('L');
  await expect(route).toContainText('I');
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows battle progress and boss distance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossDistance === 'function'
  );

  const distance = await page.evaluate(() => window.hdSMBossDistance('2-4','L'));
  expect(distance).toBe(1);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-progress-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-progress-fleet',
      fleetName:'HUD進捗テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-progress-fleet',name:'HUD進捗テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'L',routeNodes:['B','G','H','L'],result:'S',memo:'',advanceGuard:{node:'L',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toContainText('戦闘 2');
  await expect(progress).toContainText('構造図最短 ボスまで');
  await expect(progress).toContainText('1マス');
  expect(errors).toEqual([]);
});


test('release smoke: sortie skips damage confirmation on verified non-battle nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMRequiresAdvanceCheck === 'function'
  );

  const checks = await page.evaluate(() => ({
    itemG: window.hdSMRequiresAdvanceCheck('2-4','G'),
    battleB: window.hdSMRequiresAdvanceCheck('2-4','B')
  }));
  expect(checks.itemG).toBe(false);
  expect(checks.battleB).toBe(true);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-nonbattle-guard-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-nonbattle-guard-fleet',
      fleetName:'非戦闘確認テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-nonbattle-guard-fleet',name:'非戦闘確認テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('.hd-sm-advance-guard')).toBeVisible();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('非戦闘');
  await expect(page.locator('.hd-sm-advance-guard')).toHaveCount(0);
  await expect(page.locator('[data-hd-sm-next-node="H"]')).toBeEnabled();

  await page.locator('[data-hd-sm-next-node="H"]').click();
  await expect(page.locator('[data-hd-sm-next-node="L"]')).toBeEnabled();
  await page.locator('[data-hd-sm-next-node="L"]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('大破未確認');
  await expect(page.locator('.hd-sm-advance-guard')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="M"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="P"]')).toBeDisabled();
  expect(errors).toEqual([]);
});


test('release smoke: sortie derives effective node kinds from verified data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEffectiveNodeKind === 'function' &&
    typeof window.hdSMNodeIntel === 'function' &&
    typeof window.hdSMRender === 'function'
  );

  const kinds = await page.evaluate(() => ({
    g: window.hdSMEffectiveNodeKind('2-4','G','normal'),
    b: window.hdSMEffectiveNodeKind('2-4','B','normal'),
    gIntel: window.hdSMNodeIntel('2-4',{label:'G',kind:'normal'}),
    bIntel: window.hdSMNodeIntel('2-4',{label:'B',kind:'normal'})
  }));

  expect(kinds.g).toBe('item');
  expect(kinds.b).toBe('normal');
  expect(kinds.gIntel.kind).toBe('item');
  expect(kinds.gIntel.formation).toBe('選択なし');
  expect(kinds.gIntel.badge).toBe('非戦闘');
  expect(kinds.bIntel.kind).toBe('normal');
  expect(kinds.bIntel.formation).toBe('単縦陣');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-effective-kind-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-effective-kind-fleet',
      fleetName:'マス分類テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-effective-kind-fleet',name:'マス分類テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  const g = page.locator('[data-hd-sm-next-node="G"]');
  await expect(g).toContainText('資源');
  await expect(g).toContainText('基本陣形 選択なし');
  await g.click();
  await expect(page.locator('.hd-sm-hud')).toContainText('資源');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('選択なし');
  expect(errors).toEqual([]);
});


test('release smoke: sortie uses effective non-battle kind in HUD and node intelligence', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEffectiveNodeKind === 'function' &&
    typeof window.hdSMNodeIntel === 'function' &&
    typeof window.hdSMRender === 'function'
  );

  const intel = await page.evaluate(() => ({
    kind: window.hdSMEffectiveNodeKind('2-4','G','normal'),
    node: window.hdSMNodeIntel('2-4',{label:'G',kind:'normal'})
  }));
  expect(intel.kind).toBe('item');
  expect(intel.node.kind).toBe('item');
  expect(intel.node.badge).toBe('非戦闘');
  expect(intel.node.formation).toBe('選択なし');
  expect(intel.node.caution).toBe('戦闘なし');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-effective-kind-hud-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-effective-kind-hud-fleet',
      fleetName:'実質マス種別テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-effective-kind-hud-fleet',name:'実質マス種別テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'G',routeNodes:['B','G'],result:'S',memo:'',advanceGuard:null}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toContainText('資源');
  await expect(hud).toContainText('基本陣形 選択なし');
  await expect(hud).toContainText('非戦闘');
  await expect(hud.locator('[data-hd-sm-hud-node="H"]')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows minimum remaining battles', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossBattleDistance === 'function'
  );

  const remaining = await page.evaluate(() => ({
    g: window.hdSMBossBattleDistance('2-4','G'),
    l: window.hdSMBossBattleDistance('2-4','L'),
    boss: window.hdSMBossBattleDistance('2-4','P')
  }));
  expect(remaining.g).toBe(2);
  expect(remaining.l).toBe(1);
  expect(remaining.boss).toBe(0);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-battle-distance-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-battle-distance-fleet',
      fleetName:'HUD残戦闘テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-battle-distance-fleet',name:'HUD残戦闘テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'G',routeNodes:['B','G'],result:'S',memo:'',advanceGuard:null}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toContainText('戦闘 1');
  await expect(progress).toContainText('構造図最短 ボスまで');
  await expect(progress).toContainText('最少戦闘あと 2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie switches guide labels for non-battle nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetNode === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-guide-label-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-guide-label-fleet',
      fleetName:'ガイド見出しテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-guide-label-fleet',name:'ガイド見出しテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="B"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();
  const nonBattle = page.locator('.hd-sm-current-tactic');
  await expect(nonBattle).toContainText('NODE GUIDE');
  await expect(nonBattle).toContainText('確認ポイント');
  await expect(nonBattle).toContainText('選択なし');

  await page.locator('[data-hd-sm-next-node="H"]').click();
  await page.locator('[data-hd-sm-next-node="L"]').click();
  const battle = page.locator('.hd-sm-current-tactic');
  await expect(battle).toContainText('BATTLE GUIDE');
  await expect(battle).toContainText('警戒ポイント');
  await expect(battle).toContainText('単縦陣');
  expect(errors).toEqual([]);
});


test('release smoke: sortie marks boss-connected versus off-route next nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMCanReachBoss === 'function'
  );

  const reach = await page.evaluate(() => ({
    l: window.hdSMCanReachBoss('2-4','L'),
    m: window.hdSMCanReachBoss('2-4','M'),
    o: window.hdSMCanReachBoss('2-4','O'),
    sevenTwoGoalRoute: window.hdSMCanReachBoss('7-2','C'),
    sevenTwoTarget: window.hdSMRouteTargetName('7-2')
  }));
  expect(reach.l).toBe(true);
  expect(reach.m).toBe(true);
  expect(reach.o).toBe(false);
  expect(reach.sevenTwoGoalRoute).toBe(true);
  expect(reach.sevenTwoTarget).toBe('攻略目標');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-route-reachability-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-route-reachability-fleet',
      fleetName:'ボス接続テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-route-reachability-fleet',name:'ボス接続テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'K',routeNodes:['B','G','H','I','K'],result:'S',memo:'',advanceGuard:null}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const l = page.locator('[data-hd-sm-next-node="L"]');
  const o = page.locator('[data-hd-sm-next-node="O"]');
  await expect(l).toContainText('構造図上 ボス接続');
  await expect(o).toContainText('構造図上 逸れ候補');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="L"]')).toContainText('ボス接続');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="O"]')).toContainText('逸れ候補');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="O"]')).toHaveClass(/route-off/);
  expect(errors).toEqual([]);
});

test('release smoke: sortie progress uses nearest valid objective on multi-target maps', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossDistance === 'function' &&
    typeof window.hdSMBossBattleDistance === 'function' &&
    typeof window.hdSMRouteTargetName === 'function'
  );

  const metrics = await page.evaluate(() => ({
    distance: window.hdSMBossDistance('7-2','C'),
    battles: window.hdSMBossBattleDistance('7-2','C'),
    target: window.hdSMRouteTargetName('7-2')
  }));
  expect(metrics.distance).toBe(1);
  expect(metrics.battles).toBe(0);
  expect(metrics.target).toBe('攻略目標');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-distance-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-distance-fleet',
      fleetName:'攻略目標距離テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-distance-fleet',name:'攻略目標距離テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toContainText('構造図最短 攻略目標まで 1マス');
  await expect(progress).toContainText('最少戦闘あと 0');
  expect(errors).toEqual([]);
});


test('release smoke: sortie objective selector changes route guidance on multi-target maps', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetObjectiveTarget === 'function' &&
    typeof window.hdSMCanReachBoss === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-selector-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-selector-fleet',
      fleetName:'攻略目標選択テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-selector-fleet',name:'攻略目標選択テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{objectiveTarget:'G2',routeNodes:[],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const picker = page.locator('.hd-sm-objective-picker');
  await expect(picker).toBeVisible();
  await expect(picker.locator('[data-hd-sm-objective="G2"]')).toHaveClass(/active/);
  await expect(page.locator('[data-hd-sm-next-node="A"]')).toContainText('構造図上 逸れ候補');
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toContainText('構造図上 G2ボス接続');

  await picker.locator('[data-hd-sm-objective="G1"]').click();
  await expect(picker.locator('[data-hd-sm-objective="G1"]')).toHaveClass(/active/);
  await expect(page.locator('[data-hd-sm-next-node="A"]')).toContainText('構造図上 G1到達地点接続');
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toContainText('構造図上 逸れ候補');

  let draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('G1');

  await picker.locator('[data-hd-sm-objective=""]').click();
  await expect(picker.locator('[data-hd-sm-objective=""]')).toHaveClass(/active/);
  draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('');
  expect(errors).toEqual([]);
});


test('release smoke: sortie log preserves selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSSFinish === 'function' &&
    typeof window.hdSMFormData === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-log-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-log-fleet',
      fleetName:'攻略目標ログテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-log-fleet',name:'攻略目標ログテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'G2',routeNodes:['D','E','F','I','G2'],result:'S',memo:'',objectiveTarget:'G2',battles:4,boss:true}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('.hd-sm-objective-picker [data-hd-sm-objective="G2"]')).toHaveClass(/active/);

  await page.evaluate(() => {
    const data=window.hdSMFormData();
    data.node='G2';data.result='S';data.boss=true;
    window.hdSSFinish(data);
  });

  const entry = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')[0]);
  expect(entry.map).toBe('7-2');
  expect(entry.objectiveTarget).toBe('G2');
  expect(entry.boss).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: sortie log displays selected objective badge', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSLRender === 'function' &&
    typeof window.hdSLRecordEntry === 'function'
  );
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    window.hdSLRecordEntry({
      id:'obj-badge-1',at:Date.now(),map:'7-2',node:'G2',result:'S',
      boss:true,battles:4,objectiveTarget:'G2'
    });
    window.hdWSShowElement?.('sortieLog', false);
  });
  const row = page.locator('#sortieLog .hd-sl-row').first();
  await expect(row).toBeVisible();
  await expect(row.locator('.hd-sl-badge.objective')).toContainText('目標 G2');
  expect(errors).toEqual([]);
});

test('release smoke: sortie analytics separates multi-target objectives', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','map');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','7-2');
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'g1-1',at:Date.now(),map:'7-2',node:'G1',result:'S',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'g1-2',at:Date.now()-1000,map:'7-2',node:'G1',result:'A',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'g2-1',at:Date.now()-2000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'g2-2',at:Date.now()-3000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'old-1',at:Date.now()-4000,map:'7-2',node:'G1',result:'撤退',boss:false,retreat:true,battles:1}
    ]));
    window.hdSLRender();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.waitForTimeout(150);
  const cards = page.locator('#sortieLog .hd-spa-card');
  await expect(cards).toHaveCount(3);

  const g1 = cards.filter({hasText:'目標 G1'});
  const g2 = cards.filter({hasText:'目標 G2'});
  const old = cards.filter({hasText:'目標 未記録'});
  await expect(g1).toHaveCount(1);
  await expect(g2).toHaveCount(1);
  await expect(old).toHaveCount(1);
  await expect(g1).toContainText('目標到達 100%');
  await expect(g2).toContainText('目標到達 100%');
  await expect(old).toContainText('ボス到達 0%');
  await expect(old).toContainText('撤退 100%');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','strategy');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','all');
    window.hdSLRender();
  });
  await page.waitForTimeout(150);
  const strategyCards = page.locator('#sortieLog .hd-spa-card');
  await expect(strategyCards).toHaveCount(1);
  await expect(strategyCards.first()).not.toContainText('目標 G1');
  await expect(strategyCards.first()).not.toContainText('目標 G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie log filters by selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'obj-filter-g1',at:Date.now(),map:'7-2',node:'G1',result:'S',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'obj-filter-g2',at:Date.now()-1000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'obj-filter-other',at:Date.now()-2000,map:'2-4',node:'O',result:'S',boss:true,battles:4}
    ]));
    window.hdSLRender();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.locator('#sortieLog [data-hd-sl-filter="all"]').click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(3);

  const g1Filter=page.locator('#sortieLog [data-hd-sl-filter="objective:7-2:G1"]');
  const g2Filter=page.locator('#sortieLog [data-hd-sl-filter="objective:7-2:G2"]');
  await expect(g1Filter).toBeVisible();
  await expect(g2Filter).toBeVisible();

  await g1Filter.click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(1);
  await expect(page.locator('#sortieLog .hd-sl-row')).toContainText('目標 G1');

  await g2Filter.click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(1);
  await expect(page.locator('#sortieLog .hd-sl-row')).toContainText('目標 G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie remembers selected objective per map', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMSetObjectiveTarget === 'function' &&
    typeof window.hdSSObjectivePref === 'function' &&
    typeof window.hdSSApplyObjectivePref === 'function'
  );

  const selected = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-memory-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-memory-fleet',
      fleetName:'攻略目標記憶テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-memory-fleet',name:'攻略目標記憶テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{routeNodes:[],result:'S',memo:''}
    }));
    window.hdSMSetObjectiveTarget('G2');
    const restored=window.hdSSApplyObjectivePref({map:'7-2',shipCount:1,status:'active'},'7-2');
    return {
      pref:window.hdSSObjectivePref('7-2'),
      draft:JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft,
      restored
    };
  });
  expect(selected.pref).toBe('G2');
  expect(selected.draft.objectiveTarget).toBe('G2');
  expect(selected.restored.draft.objectiveTarget).toBe('G2');

  const cleared = await page.evaluate(() => {
    window.hdSMSetObjectiveTarget('');
    const restored=window.hdSSApplyObjectivePref({map:'7-2',shipCount:1,status:'active'},'7-2');
    return {
      pref:window.hdSSObjectivePref('7-2'),
      draft:JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft,
      restored
    };
  });
  expect(cleared.pref).toBe('');
  expect(cleared.draft.objectiveTarget).toBe('');
  expect(cleared.restored.draft).toBeUndefined();
  expect(errors).toEqual([]);
});



test('release smoke: pre-start objective selector persists map preference', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectivePrestartHtml === 'function' &&
    typeof window.hdSMObjectivePreference === 'function'
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');
    const host=document.createElement('div');
    host.id='hdPreObjectiveTest';
    host.innerHTML=window.hdSMObjectivePrestartHtml('7-2');
    document.body.appendChild(host);
  });

  const host=page.locator('#hdPreObjectiveTest');
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toHaveClass(/active/);
  await expect(host.locator('[data-hd-sm-pre-objective="G1"]')).toBeVisible();
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toBeVisible();

  await host.locator('[data-hd-sm-pre-objective="G2"]').click();
  let pref=await page.evaluate(() => window.hdSMObjectivePreference('7-2'));
  expect(pref).toBe('G2');

  await page.evaluate(() => {
    document.getElementById('hdPreObjectiveTest').innerHTML=window.hdSMObjectivePrestartHtml('7-2');
  });
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toHaveClass(/active/);

  await host.locator('[data-hd-sm-pre-objective=""]').click();
  pref=await page.evaluate(() => window.hdSMObjectivePreference('7-2'));
  expect(pref).toBe('');

  await page.evaluate(() => {
    document.getElementById('hdPreObjectiveTest').innerHTML=window.hdSMObjectivePrestartHtml('7-2');
  });
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test('release smoke: pre-start route preview follows selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMPrestartRoutePreviewHtml === 'function' &&
    typeof window.hdSMSaveObjectivePreference === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');

    window.hdSMSaveObjectivePreference('7-2','G2');
    const g2 = window.hdSMPrestartRoutePreviewHtml('7-2');

    window.hdSMSaveObjectivePreference('7-2','G1');
    const g1 = window.hdSMPrestartRoutePreviewHtml('7-2');

    window.hdSMSaveObjectivePreference('7-2','');
    const auto = window.hdSMPrestartRoutePreviewHtml('7-2');

    return {g2,g1,auto};
  });

  expect(result.g2).toContain('G2ボス');
  expect(result.g2).toContain('<b>A</b>');
  expect(result.g2).toContain('<b>D</b>');
  expect(result.g2).toMatch(/A[\s\S]*逸れ候補/);
  expect(result.g2).toMatch(/D[\s\S]*接続/);

  expect(result.g1).toContain('G1到達地点');
  expect(result.g1).toMatch(/A[\s\S]*接続/);
  expect(result.g1).toMatch(/D[\s\S]*逸れ候補/);

  expect(result.auto).toContain('自動（攻略目標）');
  expect(errors).toEqual([]);
});


test('release smoke: pre-start objective selector shows route stats', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectivePrestartHtml === 'function' &&
    typeof window.hdSMObjectiveStartStats === 'function'
  );

  const stats = await page.evaluate(() => ({
    auto: window.hdSMObjectiveStartStats('7-2',''),
    g1: window.hdSMObjectiveStartStats('7-2','G1'),
    g2: window.hdSMObjectiveStartStats('7-2','G2')
  }));
  expect(stats.auto).toEqual({steps:4,battles:3});
  expect(stats.g1).toEqual({steps:4,battles:3});
  expect(stats.g2).toEqual({steps:5,battles:5});

  await page.evaluate(() => {
    const host=document.createElement('div');
    host.id='hdPreObjectiveStatsTest';
    host.innerHTML=window.hdSMObjectivePrestartHtml('7-2');
    document.body.appendChild(host);
  });

  const host=page.locator('#hdPreObjectiveStatsTest');
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toContainText('最短4マス・最少3戦');
  await expect(host.locator('[data-hd-sm-pre-objective="G1"]')).toContainText('最短4マス・最少3戦');
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toContainText('最短5マス・最少5戦');
  expect(errors).toEqual([]);
});


test('release smoke: pre-start route preview shows shortest structural path', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectiveShortestPath === 'function' &&
    typeof window.hdSMPrestartRoutePreviewHtml === 'function'
  );

  const paths = await page.evaluate(() => ({
    auto: window.hdSMObjectiveShortestPath('7-2',''),
    g1: window.hdSMObjectiveShortestPath('7-2','G1'),
    g2: window.hdSMObjectiveShortestPath('7-2','G2')
  }));
  expect(paths.auto).toEqual(['A','B','C','G1']);
  expect(paths.g1).toEqual(['A','B','C','G1']);
  expect(paths.g2).toEqual(['D','E','F','I','G2']);

  const html = await page.evaluate(() => {
    window.hdSMSaveObjectivePreference('7-2','G2');
    return window.hdSMPrestartRoutePreviewHtml('7-2');
  });
  expect(html).toContain('構造図最短');
  expect(html).toContain('D → E → F → I → G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie warns when selected objective is unreachable from current node', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMObjectiveRouteState === 'function' &&
    typeof window.hdSMSetObjectiveTarget === 'function'
  );

  const state = await page.evaluate(() => window.hdSMObjectiveRouteState('7-2',{
    node:'C',routeNodes:['A','B','C'],objectiveTarget:'G2'
  }));
  expect(state.active).toBe(true);
  expect(state.target).toBe('G2');
  expect(state.alternatives.map(x=>x.label)).toContain('G1');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-route-alert',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-route-alert-fleet',
      fleetName:'目標ルート警告テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-route-alert-fleet',name:'目標ルート警告テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',objectiveTarget:'G2',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const warning = page.locator('.hd-sm-objective-warning');
  await expect(warning).toBeVisible();
  await expect(warning).toContainText('CからG2ボスへ構造図上接続なし');
  await expect(page.locator('.hd-sm-hud-objective-alert')).toContainText('G2ボスへ接続なし');
  await expect(warning.locator('[data-hd-sm-objective="G1"]')).toContainText('G1 到達地点へ切替');

  await warning.locator('[data-hd-sm-objective="G1"]').click();
  await expect(page.locator('.hd-sm-objective-warning')).toHaveCount(0);
  await expect(page.locator('.hd-sm-hud-objective-alert')).toHaveCount(0);
  await expect(page.locator('.hd-sm-objective-picker [data-hd-sm-objective="G1"]')).toHaveClass(/active/);

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('G1');
  expect(draft.node).toBe('C');
  expect(draft.routeNodes).toEqual(['A','B','C']);
  expect(draft.advanceGuard.node).toBe('C');
  expect(draft.advanceGuard.safe).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: route alert can mark route-deviation retreat', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMQuickRetreatReason === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-route-alert-retreat',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-route-alert-retreat-fleet',
      fleetName:'ルート逸れ撤退テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-route-alert-retreat-fleet',name:'ルート逸れ撤退テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',objectiveTarget:'G2',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const warning = page.locator('.hd-sm-objective-warning');
  await expect(warning).toBeVisible();
  await warning.locator('[data-hd-sm-retreat-reason="ルート逸れ"]').click();

  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMRetreatReason')).toHaveValue('ルート逸れ');
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.result).toBe('撤退');
  expect(draft.retreatReason).toBe('ルート逸れ');
  expect(draft.objectiveTarget).toBe('G2');
  expect(draft.node).toBe('C');
  expect(errors).toEqual([]);
});



test('release smoke: sortie highlights minimum-battle next route', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMNextRouteRank === 'function'
  );

  const rank = await page.evaluate(() =>
    window.hdSMNextRouteRank('2-4',{node:'C',routeNodes:['B','C'],objectiveTarget:'P'},[
      {label:'F',kind:'normal'},{label:'G',kind:'item'}
    ])
  );
  expect(rank.labels).toEqual(['G']);
  expect(rank.score).toEqual({battles:2,steps:4});

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-best-next-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-best-next-fleet',
      fleetName:'最少戦闘候補テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-best-next-fleet',name:'最少戦闘候補テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['B','C'],result:'S',memo:'',objectiveTarget:'P',advanceGuard:null}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const f = page.locator('[data-hd-sm-next-node="F"]');
  const g = page.locator('[data-hd-sm-next-node="G"]');
  await expect(g).toHaveClass(/best-route/);
  await expect(g).toContainText('最少戦闘候補');
  await expect(g).toContainText('残り 2戦 / 4マス');
  await expect(g).toContainText('比較基準');
  await expect(f).toContainText('残り 3戦 / 4マス');
  await expect(f).toContainText('最少候補比 +1戦 / ±0マス');
  await expect(f).not.toHaveClass(/best-route/);
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="G"]')).toHaveClass(/best-route/);
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="G"]')).toContainText('最少');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="F"]')).toContainText('差 +1戦/±0マス');
  expect(errors).toEqual([]);
});

test('release smoke: failed dynamic module can recover on retry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const result = await page.evaluate(async () => {
    const attr = 'data-hd-module-retry-fixture';
    const src = './tests/fixtures/module-loader-retry.js';
    document.querySelector(`script[${attr}]`)?.remove();
    const stale = document.createElement('script');
    stale.setAttribute(attr, '1');
    stale.dataset.hdError = '1';
    document.body.appendChild(stale);
    window.HD_MODULE_STATUS[src] = 'error';
    delete window.__HD_MODULE_RETRY_FIXTURE;

    const race = await Promise.race([
      window.hdLoadScript(attr, src),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 1500))
    ]);
    const node = document.querySelector(`script[${attr}]`);
    return {
      race,
      status: window.HD_MODULE_STATUS[src],
      count: window.__HD_MODULE_RETRY_FIXTURE || 0,
      loaded: node?.dataset.hdLoaded || ''
    };
  });

  expect(result).toEqual({ race: true, status: 'ok', count: 1, loaded: '1' });
  expect(errors).toEqual([]);
});


test('release smoke: sortie sync preserves battle rank separately from later retreat', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdKcParseImport === 'function' &&
    typeof window.hdKcPreviewData === 'function' &&
    typeof window.hdKcApplyImport === 'function'
  );

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    const bundle = {
      format:'harbordesk-kancolle-import',
      version:2,
      captureId:'smoke-sortie-retreat-rank',
      createdAt:new Date().toISOString(),
      records:[
        {
          endpoint:'/kcsapi/api_req_map/start',
          at:1000,
          payload:{api_result:1,api_data:{api_maparea_id:2,api_mapinfo_no:3,api_no:1,api_event_id:4,api_event_kind:1,api_bosscell_no:10}}
        },
        {
          endpoint:'/kcsapi/api_req_sortie/battleresult',
          at:2000,
          payload:{api_result:1,api_data:{api_win_rank:'A',api_quest_name:'東部オリョール海',api_get_ship:null}}
        },
        {
          endpoint:'/kcsapi/api_port/port',
          at:3000,
          payload:{api_result:1,api_data:{api_ship:[],api_deck_port:[],api_ndock:[],api_material:[]}}
        }
      ]
    };
    const parsed=window.hdKcParseImport(JSON.stringify(bundle));
    const preview=window.hdKcPreviewData(parsed);
    window.hdKcApplyImport(preview,{ships:false,equipment:false,resources:false,fleets:false,timers:false,quests:false,sorties:true});
    const row=(JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')||[])[0]||null;
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    return row&&{result:row.result,retreat:row.retreat,battles:row.battles};
  });

  expect(data).toEqual({result:'A',retreat:true,battles:1});
  expect(errors).toEqual([]);
});


test('release smoke: Quick Nav sees current workspace state and back history', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdWSShowElement === 'function' &&
    typeof window.hdWSGoBack === 'function' &&
    typeof window.hdQNEnsure === 'function' &&
    typeof window.hdQNRenderContext === 'function'
  );

  const result = await page.evaluate(() => {
    window.hdWSShowElement('roster', false);
    window.hdWSShowElement('equipmentBook', false);
    const before = {
      group: window.hdWSState?.group || '',
      section: window.hdWSState?.sections?.[window.hdWSState?.group] || '',
      history: window.hdWSHistoryLoad?.().length || 0
    };
    const back = window.hdWSGoBack();
    window.hdQNEnsure();
    window.hdQNRenderContext();
    const group = window.hdWSState?.group || '';
    return {
      exposed: !!window.hdWSState,
      before,
      back,
      after: window.hdWSState?.sections?.[group] || '',
      activeContext: document.querySelector('[data-hd-qn-context].active')?.dataset.hdQnContext || ''
    };
  });

  expect(result.exposed).toBe(true);
  expect(result.before.section).toBe('equipmentBook');
  expect(result.before.history).toBeGreaterThan(0);
  expect(result.back).toBe(true);
  expect(result.after).toBe('roster');
  expect(result.activeContext).toBe('roster');
  expect(errors).toEqual([]);
});


test('release smoke: Quick Nav group jump marks explicit workspace navigation', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdWSShowElement === 'function' &&
    typeof window.hdQNJumpGroup === 'function' &&
    typeof window.hdWSApply === 'function'
  );

  const result = await page.evaluate(() => {
    window.hdWSShowElement('roster', false);
    const beforeEpoch = Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH) || 0;
    const beforeUserEpoch = Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0;
    const ok = window.hdQNJumpGroup('guide');
    const afterEpoch = Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH) || 0;
    const afterUserEpoch = Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0;
    return {
      ok,
      beforeEpoch,
      afterEpoch,
      beforeUserEpoch,
      afterUserEpoch,
      group:window.hdWSState?.group || ''
    };
  });

  expect(result.ok).toBe(true);
  expect(result.afterEpoch).toBeGreaterThan(result.beforeEpoch);
  expect(result.afterUserEpoch).toBeGreaterThan(result.beforeUserEpoch);
  expect(result.group).toBe('guide');
  expect(errors).toEqual([]);
});


test('release smoke: hash navigation cancels stale fleet-suggester recovery', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdFSOpen === 'function' &&
    typeof window.hdWSOpenAnchorId === 'function' &&
    typeof window.hdWSMarkUserNavigation === 'function'
  );

  const before = await page.evaluate(() => {
    window.hdFSOpen();
    return {
      section: window.hdWSState?.sections?.guide || '',
      userEpoch: Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0
    };
  });
  expect(before.section).toBe('hdFleetSuggester');

  await page.evaluate(() => { location.hash = '#guide'; });
  await expect.poll(
    () => page.evaluate(() => ({
      section: window.hdWSState?.sections?.guide || '',
      userEpoch: Number(window.__HD_WORKSPACE_USER_NAV_EPOCH) || 0
    })),
    { timeout: 3000 }
  ).toEqual({section:'guide',userEpoch:before.userEpoch+1});

  await page.waitForTimeout(700);
  const after = await page.evaluate(() => {
    const fleet=document.getElementById('hdFleetSuggester');
    return {
      section: window.hdWSState?.sections?.guide || '',
      fleetVisible: !!fleet && !fleet.hidden && !fleet.classList.contains('hd-ws-hidden')
    };
  });
  expect(after.section).toBe('guide');
  expect(after.fleetVisible).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: mobile dialog actions stay on the visible bottom edge', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(() => {
    const dialog=document.getElementById('timerDialog');
    if(dialog&&!dialog.open)dialog.showModal();
    const actions=dialog?.querySelector('.dialog-actions');
    const style=actions?getComputedStyle(actions):null;
    return {position:style?.position||'',bottom:style?.bottom||''};
  });
  expect(data.position).toBe('sticky');
  expect(data.bottom).toBe('0px');
  expect(errors).toEqual([]);
});


test('release smoke: compact header avoids duplicate global search launcher', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.setViewportSize({width:390,height:844});
  const data = await page.evaluate(() => {
    window.hdEnsureUpdateUI?.();
    window.hdGSEnsure?.();
    window.hdWSEnsureSyncStatus?.();
    window.hdGSAttachLaunchers?.();
    const top=document.querySelector('.topbar');
    return {
      children:top?[...top.children].map(x=>x.id||x.className||x.tagName):[],
      menuSearch:!!top?.querySelector('.hd-header-more [data-hd-gs-open]'),
      headerSearch:!!document.getElementById('hdGlobalSearchHeader')
    };
  });
  expect(data.menuSearch).toBe(true);
  expect(data.headerSearch).toBe(false);
  expect(data.children.length).toBeLessThanOrEqual(3);
  expect(errors).toEqual([]);
});


test('release smoke: mobile menu reparenting does not resurrect duplicate global search', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(() =>
    typeof window.hdEnsureUpdateUI === 'function' &&
    typeof window.hdGSEnsure === 'function' &&
    typeof window.hdSyncMobileHeaderMenu === 'function'
  );

  const data = await page.evaluate(() => {
    window.hdEnsureUpdateUI();
    window.hdGSEnsure();

    const details=document.querySelector('.hd-header-more');
    const menu=document.querySelector('.hd-version-menu');
    const before={
      direct:document.querySelectorAll('.topbar > #hdGlobalSearchHeader').length,
      menu:document.querySelectorAll('.hd-version-menu [data-hd-gs-open]').length
    };

    if(details)details.open=true;
    window.hdSyncMobileHeaderMenu();
    window.hdGSEnsure();

    const during={
      menuParent:menu?.parentElement?.id||'',
      direct:document.querySelectorAll('.topbar > #hdGlobalSearchHeader').length,
      menu:document.querySelectorAll('.hd-version-menu [data-hd-gs-open]').length
    };

    if(details)details.open=false;
    window.hdSyncMobileHeaderMenu();
    window.hdGSEnsure();

    const after={
      direct:document.querySelectorAll('.topbar > #hdGlobalSearchHeader').length,
      menu:document.querySelectorAll('.hd-version-menu [data-hd-gs-open]').length
    };
    return {before,during,after};
  });

  expect(data.before).toEqual({direct:0,menu:1});
  expect(data.during.menuParent).toBe('hdMobileHeaderMenuRow');
  expect(data.during.direct).toBe(0);
  expect(data.during.menu).toBe(1);
  expect(data.after).toEqual({direct:0,menu:1});
  expect(errors).toEqual([]);
});


test('release smoke: ship image IndexedDB round-trip works in browser', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdShipImagePut === 'function' &&
    typeof window.hdShipImageGet === 'function' &&
    typeof window.hdShipImageDelete === 'function'
  );

  const data = await page.evaluate(async () => {
    await window.hdShipImageDelete(541);
    let result;
    try {
      const file=new File([new Uint8Array([1,2,3,4,5])],'541.png',{type:'image/png'});
      const ok=await window.hdShipImagePut(541,file,'長門改二',true);
      const row=await window.hdShipImageGet(541);
      result={
        ok:!!ok,
        id:Number(row?.id)||0,
        name:String(row?.name||''),
        size:Number(row?.blob?.size)||0,
        type:String(row?.type||row?.blob?.type||''),
        error:''
      };
    } catch (err) {
      result={ok:false,id:0,name:'',size:0,type:'',error:String(err?.message||err||'unknown')};
    } finally {
      await window.hdShipImageDelete(541);
    }
    return result;
  });

  expect(data.error).toBe('');
  expect(data.ok).toBe(true);
  expect(data.id).toBe(541);
  expect(data.name).toBe('長門改二');
  expect(data.size).toBe(5);
  expect(data.type).toBe('image/png');
  expect(errors).toEqual([]);
});


test('release smoke: enhanced equipment catalog preserves reset and compact peek state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(() => {
    window.hdEnsureEquipmentCatalog?.();
    window.hdRenderEquipmentCatalog?.();
    const reset=document.querySelector('.hd-equip-search [data-hd-equip-reset]');
    reset?.click();
    window.hdRenderEquipmentCatalog?.();
    const cleanReset=document.querySelector('.hd-equip-search [data-hd-equip-reset]');
    const initialResetDisabled=!!cleanReset?.disabled;
    const list=document.getElementById('hdEquipCatalogList');
    list?.classList.add('hd-compact');
    let card=list?.querySelector('.hd-equip-ref-card');
    card?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    const key=card?.dataset.hdEquipPeekKey||'';
    const openBefore=!!card?.classList.contains('hd-peek');
    window.hdRenderEquipmentCatalog?.();
    card=[...document.querySelectorAll('#hdEquipCatalogList .hd-equip-ref-card')].find(x=>x.dataset.hdEquipPeekKey===key);
    const search=document.getElementById('hdEquipCatalogSearch');
    if(search)search.value='電探';
    window.hdRenderEquipmentCatalog?.();
    return {
      initialResetDisabled,
      key,
      openBefore,
      openAfter:!!card?.classList.contains('hd-peek'),
      activeReset:document.querySelector('.hd-equip-search [data-hd-equip-reset]')?.classList.contains('is-active')||false,
      activeResetDisabled:!!document.querySelector('.hd-equip-search [data-hd-equip-reset]')?.disabled
    };
  });
  expect(data.initialResetDisabled).toBe(true);
  expect(data.key).not.toBe('');
  expect(data.openBefore).toBe(true);
  expect(data.openAfter).toBe(true);
  expect(data.activeReset).toBe(true);
  expect(data.activeResetDisabled).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: equipment catalog ensure reapplies persisted view state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(() => {
    window.hdEnsureEquipmentCatalog?.();
    sessionStorage.setItem('harbordesk-session-equip-catalog-view-v1', JSON.stringify({
      query:'電探',
      filter:'小型水上電探',
      compact:true,
      peekKey:''
    }));
    const search=document.getElementById('hdEquipCatalogSearch');
    if(search)search.value='';
    document.querySelectorAll('[data-hd-equip-filter]').forEach(b=>b.classList.toggle('active',b.dataset.hdEquipFilter==='すべて'));
    document.getElementById('hdEquipCatalogList')?.classList.remove('hd-compact');
    window.hdEnsureEquipmentCatalog?.();
    return {
      query:document.getElementById('hdEquipCatalogSearch')?.value||'',
      filter:document.querySelector('[data-hd-equip-filter].active')?.dataset.hdEquipFilter||'',
      compact:document.getElementById('hdEquipCatalogList')?.classList.contains('hd-compact')||false,
      resetActive:document.querySelector('.hd-equip-search [data-hd-equip-reset]')?.classList.contains('is-active')||false
    };
  });
  expect(data.query).toBe('電探');
  expect(data.filter).toBe('小型水上電探');
  expect(data.compact).toBe(true);
  expect(data.resetActive).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: Home counts legacy equipment ledger rows without count', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const count = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {id:'legacy-1',name:'旧形式装備'},
      {id:'modern-1',name:'現行装備',count:2},
      {id:'zero-1',name:'在庫なし',count:0}
    ]));
    window.renderHomeDashboard?.();
    return document.querySelector('#homeSummary [data-home-jump="equipmentBook"] strong')?.textContent||'';
  });
  expect(count).toBe('2');
  expect(errors).toEqual([]);
});


test('release smoke: diagnostics center is loaded and registered', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./diagnostics-center.js'] === 'ok' &&
    typeof window.hdDXEnsure === 'function'
  );

  const data = await page.evaluate(() => {
    window.hdDXEnsure();
    const section=document.getElementById('diagnosticsCenter');
    const body=document.getElementById('hdDiagnosticsCenter');
    return {
      module:window.HD_MODULE_STATUS?.['./diagnostics-center.js']||'',
      section:!!section,
      body:!!body,
      text:body?.textContent||'',
      group:section?.dataset.hdWorkspaceGroup||'',
      settings:!!document.querySelector('[data-hd-ws-group="settings"]')
    };
  });

  expect(data.module).toBe('ok');
  expect(data.section).toBe(true);
  expect(data.body).toBe(true);
  expect(data.settings).toBe(true);
  expect(data.group).toBe('settings');
  expect(data.text.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});


test('release smoke: diagnostics center runtime stylesheet is loaded', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    window.HD_MODULE_STATUS?.['./diagnostics-center.js'] === 'ok' &&
    !!document.querySelector('link[data-hd-diagnostics-center]')
  );

  await page.evaluate(async () => {
    window.hdDXEnsure?.();
    await window.hdDXRender?.();
  });
  await page.waitForSelector('#diagnosticsCenter .hd-dx-note', { state: 'attached' });
  const data = await page.evaluate(() => {
    const link=document.querySelector('link[data-hd-diagnostics-center]');
    const note=document.querySelector('#diagnosticsCenter .hd-dx-note');
    const style=note?getComputedStyle(note):null;
    return {
      href:link?.getAttribute('href')||'',
      loaded:link?.dataset.hdLoaded||'',
      noteFont:style?.fontSize||'',
      noteLine:style?.lineHeight||''
    };
  });

  expect(data.href).toContain('diagnostics-center.css?v=480');
  expect(data.loaded).toBe('1');
  expect(data.noteFont).not.toBe('');
  expect(data.noteLine).not.toBe('');
  expect(errors).toEqual([]);
});


test('release smoke: diagnostics loader is shared and idempotent', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(async () => {
    await window.hdQNLoadDiagnostics?.();
    await window.hdQNLoadDiagnostics?.();
    await window.hdEnsureCurrentAssets?.();
    await new Promise(r => setTimeout(r, 80));
    return {
      scripts:[...document.querySelectorAll('script[src*="diagnostics-center.js"]')].length,
      ready:typeof window.hdDXEnsure === 'function',
      status:window.HD_MODULE_STATUS?.['./diagnostics-center.js'] || ''
    };
  });
  expect(data.scripts).toBe(1);
  expect(data.ready).toBe(true);
  expect(data.status).toBe('ok');
  expect(errors).toEqual([]);
});

test('release smoke: ship images persist bytes and read back as blobs', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(async () => {
    const id=541;
    await window.hdShipImageDelete?.(id);
    const file=new File([new Uint8Array([9,8,7,6])],'541.png',{type:'image/png'});
    const ok=await window.hdShipImagePut?.(id,file,'長門改二',true);
    const row=await window.hdShipImageGet?.(id);
    const bytes=row?.blob?[...new Uint8Array(await row.blob.arrayBuffer())]:[];
    const db=await window.hdShipImageOpenDb?.();
    const raw=await new Promise((resolve,reject)=>{
      const tx=db.transaction('images','readonly'),req=tx.objectStore('images').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
    });
    await window.hdShipImageDelete?.(id);
    return {
      ok:!!ok,
      type:row?.blob?.type||'',
      bytes,
      rawHasBlob:typeof Blob!=='undefined'&&raw?.blob instanceof Blob,
      rawHasBytes:raw?.bytes instanceof ArrayBuffer || ArrayBuffer.isView(raw?.bytes)
    };
  });
  expect(data.ok).toBe(true);
  expect(data.type).toBe('image/png');
  expect(data.bytes).toEqual([9,8,7,6]);
  expect(data.rawHasBlob).toBe(false);
  expect(data.rawHasBytes).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: userscript uses same-tab handoff without popup', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const source = await page.evaluate(async () => fetch('./HarborDesk-Kancolle.user.js', { cache:'no-store' }).then(r => r.text()));
  expect(source).toContain('// @version      1.0.15');
  expect(source).toContain("const HD_VERSION='1.0.15'");
  expect(source).toContain("#kcimport=");
  expect(source).toContain("a.target='_self'");
  expect(source).not.toContain('window.open(');
  expect(errors).toEqual([]);
});

test('release smoke: inline mobile header version spans the menu grid', async ({ page }) => {
  const errors = [];
  await page.setViewportSize({ width:390, height:844 });
  await boot(page, errors);
  const data = await page.evaluate(async () => {
    window.hdEnsureUpdateUI?.();
    const details=document.querySelector('.hd-header-more');
    if(details)details.open=true;
    window.hdSyncMobileHeaderMenu?.();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const menu=document.querySelector('#hdMobileHeaderMenuRow .hd-version-menu');
    const badge=menu?.querySelector('.hd-version-badge');
    return {
      menuWidth:menu?.getBoundingClientRect().width||0,
      badgeWidth:badge?.getBoundingClientRect().width||0,
      gridColumn:badge?getComputedStyle(badge).gridColumn:''
    };
  });
  expect(data.menuWidth).toBeGreaterThan(0);
  expect(data.badgeWidth).toBeGreaterThan(data.menuWidth*0.8);
  expect(data.gridColumn).not.toBe('auto');
  expect(errors).toEqual([]);
});


test('release smoke: empty required dialog can cancel and global search is labelled', async ({ page }) => {
  const errors = [];
  await page.setViewportSize({ width:390, height:844 });
  await boot(page, errors);

  const label = await page.evaluate(() => {
    window.hdEnsureUpdateUI?.();
    return document.querySelector('.hd-version-menu [data-hd-gs-open]')?.getAttribute('aria-label') || '';
  });
  expect(label).toBe('全体検索');

  await page.evaluate(() => window.openQuestDialog?.());
  await expect(page.locator('#questDialog')).toBeVisible();
  await expect(page.locator('#questName')).toHaveValue('');
  await page.locator('#questDialog [value="cancel"]').click();
  await expect(page.locator('#questDialog')).not.toBeVisible();

  const formNoValidate = await page.evaluate(() => ({
    quest:document.querySelector('#questDialog [value="cancel"]')?.formNoValidate || false,
    timer:document.querySelector('#timerDialog [value="cancel"]')?.formNoValidate || false
  }));
  expect(formNoValidate).toEqual({ quest:true, timer:true });
  expect(errors).toEqual([]);
});

test('release smoke: leveling maps and fleet examples are available without a roster', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await expect(page.locator('#trainingPlanner')).toHaveCount(1, { timeout: 30000 });
  await page.evaluate(() => window.hdWSShowElement('trainingPlanner', true));
  const cards = page.locator('.hd-training-map-card');
  await expect(cards).toHaveCount(6);
  await expect(cards.nth(0)).toContainText('育成艦1＋対潜随伴3');
  await expect(cards.nth(1)).toContainText('駆逐/海防');
  await expect(cards.nth(3)).toContainText('夜戦装備');
  await expect(cards.nth(4)).toContainText('軽巡1＋駆逐4');
  await expect(page.locator('#hdTrainingList')).toContainText('艦隊台帳');
  await cards.nth(0).getByRole('button', { name: '海域情報を見る' }).click();
  await expect(page.locator('#guide')).toBeVisible();
  expect(errors).toEqual([]);
});

test('release smoke: map strategy navigator connects route examples and saved fleet checks', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.evaluate(() => window.hdWSShowElement('mapStrategyNavigator', true));
  await expect(page.locator('#mapStrategyNavigator')).toBeVisible();
  await page.locator('#hdMapStrategyMap').selectOption('3-2');
  await expect(page.locator('.hd-msn-route')).toContainText('軽巡1＋駆逐5');
  await expect(page.locator('.hd-msn-empty')).toContainText('保存編成を選ぶと差分を判定');

  await page.evaluate(() => {
    const rows = loadCustomFleets();
    rows['3-2'] = [{ id:'ci-route-fleet', name:'CI 3-2 駆逐のみ', ships:[
      {ship:'吹雪',gear:''},{ship:'綾波',gear:''},{ship:'夕立',gear:''},
      {ship:'島風',gear:''},{ship:'雪風',gear:''},{ship:'時雨',gear:''}
    ] }];
    saveCustomFleets(rows);
  });
  await expect(page.locator('#hdMapStrategyFleet')).toHaveValue('ci-route-fleet');
  await expect(page.locator('.hd-msn-check').filter({ hasText:'編成条件' })).toContainText('軽巡');
  await expect(page.locator('.hd-msn-check').filter({ hasText:'編成条件' })).toContainText('不足/不可');
  await expect(page.locator('.hd-msn-actions')).toBeVisible();
  await page.locator('[data-hd-msn-action="route"]').click();
  await expect(page.locator('#guide')).toBeVisible();
  await expect(page.locator('[data-map-tab="route"]')).toHaveClass(/active/);
  await page.locator('[data-hd-msn-open]').click();
  await expect(page.locator('#mapStrategyNavigator')).toBeVisible();
  await expect(page.locator('#hdMapStrategyMap')).toHaveValue('3-2');
  expect(errors).toEqual([]);
});
