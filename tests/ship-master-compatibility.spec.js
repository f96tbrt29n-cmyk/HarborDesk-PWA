const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  await page.addInitScript(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('harbordesk-ship-image-config-v1') || '{}');
      localStorage.setItem('harbordesk-ship-image-config-v1', JSON.stringify({ ...raw, autoSource: false }));
    } catch {
      localStorage.setItem('harbordesk-ship-image-config-v1', JSON.stringify({ remoteTemplate: '', autoSource: false }));
    }
  });
  await page.route('**/*', async route => {
    const req = route.request();
    let url;
    try { url = new URL(req.url()); } catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'blob:' || url.protocol === 'data:') return route.continue();
    if (req.resourceType() === 'image') {
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
    }
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#shipDatabase')).toHaveCount(1, { timeout: 20000 });
  await page.waitForTimeout(1200);
}

test('official master drives normal compatibility, reverse lookup and owned filtering', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const audit = await page.evaluate(() => ({
    detailed: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.ships || {}).length,
    allShips: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {}).length,
    equipment: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment || {}).length,
    source: window.HD_KANCOLLE_MASTER_SNAPSHOT?.source?.commit || '',
    picker: window.HD_KANCOLLE_MASTER_SNAPSHOT?.clientRules?.source?.commit || ''
  }));
  expect(audit.detailed).toBeGreaterThanOrEqual(100);
  expect(audit.allShips).toBeGreaterThanOrEqual(800);
  expect(audit.equipment).toBeGreaterThanOrEqual(500);
  expect(audit.source).not.toBe('');
  expect(audit.picker).not.toBe('');

  const direct = await page.evaluate(() => {
    const row = window.hdShipDbMasterRowByName?.('長門改二');
    const ok = window.hdShipDbMasterNormalCheck?.(row, '46cm三連装砲');
    const ng = window.hdShipDbMasterNormalCheck?.(row, '零式艦戦21型');
    return {
      shipId: row?.id || 0,
      slots: row?.slots || [],
      ok: !!ok?.allowed,
      okSlots: ok?.allowedSlots?.map(x => x.index) || [],
      ng: !!ng?.allowed
    };
  });
  expect(direct.shipId).toBeGreaterThan(0);
  expect(direct.slots.length).toBeGreaterThan(0);
  expect(direct.ok).toBeTruthy();
  expect(direct.okSlots.length).toBeGreaterThan(0);
  expect(direct.ng).toBeFalsy();

  await page.evaluate(() => window.hdShipDbOpenEquipChecker?.('長門改二'));
  const dialog = page.locator('#hdShipEquipCheckDialog');
  await expect(dialog).toBeVisible();

  await page.locator('#hdShipEquipCheckEquip').fill('46cm三連装砲');
  await page.locator('#hdShipEquipCheckStar').fill('0');
  await page.locator('[data-hd-equip-check-run]').click();

  const result = page.locator('#hdShipEquipCheckResult');
  await expect(result).toContainText('通常スロット ○');
  await expect(result.locator('.hd-equip-reverse')).toBeVisible();
  await expect(result.locator('.hd-equip-reverse-row').first()).toBeVisible();

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { name: '長門改二', level: 99, remodel: '改装済み' }
    ]));
  });
  await page.locator('#hdShipEquipCheckOwnedOnly').check();
  await expect(result.locator('.hd-equip-reverse-row')).toHaveCount(1);
  await expect(result.locator('.hd-equip-reverse-row').first()).toContainText('長門改二');
  await expect(result.locator('.hd-equip-reverse-row').first()).toContainText('所持Lv.99');

  await page.locator('#hdShipEquipCheckEquip').fill('零式艦戦21型');
  await page.locator('[data-hd-equip-check-run]').click();
  await expect(result).toContainText('通常スロット ×');

  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});

test('master-only ship forms are searchable from the ship database', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.evaluate(() => window.hdWSShowElement?.('shipDatabase', false));
  const search = page.locator('#hdShipDbSearch');
  await search.fill('大和改二重');

  const group = page.locator('.hd-shipdb-master-group');
  await expect(group).toBeVisible();
  await expect(group).toContainText('公式マスター参照');
  await expect(group).toContainText('大和改二重');

  const card = page.locator('.hd-shipdb-master-card').filter({ hasText: '大和改二重' }).first();
  await expect(card).toBeVisible();
  await expect(card).toContainText('MASTER');
  await expect(card).toContainText('汎用おすすめ装備');
  await expect(card.locator('[data-hd-ship-equip-check-id]')).toHaveCount(1);

  await card.locator('[data-hd-ship-equip-check-id]').click();
  await expect(page.locator('#hdShipEquipCheckDialog')).toBeVisible();
  await expect(page.locator('#hdShipEquipCheckShip')).toHaveValue('大和改二重');

  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});


test('picker slot exclusions and star-gated expansion rules are enforced', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const checks = await page.evaluate(() => {
    const ise = window.hdShipDbMasterRowByName?.('伊勢改二');
    const iseGun = window.hdShipDbMasterNormalCheck?.(ise, '46cm三連装砲');

    const bismarck = window.hdShipDbMasterRowByName?.('Bismarck drei');
    const fumoNormal = window.hdShipDbMasterNormalCheck?.(bismarck, 'FuMO25 レーダー');
    const fumo0 = window.hdShipDbMasterExslotCheck?.(bismarck, 'FuMO25 レーダー', 0, fumoNormal);
    const fumo7 = window.hdShipDbMasterExslotCheck?.(bismarck, 'FuMO25 レーダー', 7, fumoNormal);

    return {
      iseAllowed: !!iseGun?.allowed,
      iseAllowedSlots: iseGun?.allowedSlots?.map(x => x.index) || [],
      iseBlockedSlots: iseGun?.slots?.filter(x => x.blocked).map(x => x.index) || [],
      fumoNormal: !!fumoNormal?.allowed,
      fumo0: { allowed: !!fumo0?.allowed, reqStar: Number(fumo0?.reqStar || 0), reason: fumo0?.reason || '' },
      fumo7: { allowed: !!fumo7?.allowed, reqStar: Number(fumo7?.reqStar || 0), mode: fumo7?.mode || '' }
    };
  });

  expect(checks.iseAllowed).toBeTruthy();
  expect(checks.iseAllowedSlots).toEqual([0, 1]);
  expect(checks.iseBlockedSlots).toEqual([2, 3, 4]);

  expect(checks.fumoNormal).toBeTruthy();
  expect(checks.fumo0.allowed).toBeFalsy();
  expect(checks.fumo0.reqStar).toBe(7);
  expect(checks.fumo0.reason).toContain('★7');
  expect(checks.fumo7.allowed).toBeTruthy();
  expect(checks.fumo7.reqStar).toBe(7);
  expect(checks.fumo7.mode).toBe('special');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('master recommendations resolve exact owned equipment variants without inflating stars', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const resolved = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: '41cm連装砲', category: '大口径主砲', count: 1, star: 6 },
      { name: '41cm連装砲', category: '大口径主砲', count: 1, star: 2 },
      { name: '零式水上偵察機11型乙(熟練)', category: '水上偵察機', count: 1, star: 0 },
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 7 }
    ]));
    const row = window.hdShipDbMasterRowByName?.('Bismarck drei');
    const plan = window.hdShipDbMasterSuggestedLoadouts?.(row)?.find(x => x.name === '昼戦・連撃');
    const result = window.hdShipDbMasterResolveOwnedPlan?.(row, plan);
    const html = window.hdShipDbMasterOwnedPlanHtml?.(row, plan) || '';
    return {
      ship: row?.name || '',
      gear: plan?.gear || [],
      filled: result?.filled || 0,
      total: result?.total || 0,
      names: result?.slots?.map(x => x.name) || [],
      stars: result?.slots?.map(x => x.star) || [],
      ownedTotals: result?.slots?.map(x => x.ownedTotal) || [],
      slotIndexes: result?.slots?.filter(x => x.found).map(x => x.slotIndex) || [],
      html
    };
  });

  expect(resolved.ship).toBe('Bismarck drei');
  expect(resolved.gear).toEqual(['大口径主砲', '大口径主砲', '水上偵察機', '大型電探']);
  expect(resolved.filled).toBe(4);
  expect(resolved.total).toBe(4);
  expect(resolved.names).toEqual([
    '41cm連装砲',
    '41cm連装砲',
    '零式水上偵察機11型乙(熟練)',
    'FuMO25 レーダー'
  ]);
  expect(resolved.stars).toEqual([6, 2, 0, 7]);
  expect(resolved.ownedTotals.slice(0, 2)).toEqual([2, 2]);
  expect(new Set(resolved.slotIndexes).size).toBe(4);
  expect(resolved.html).toContain('★6');
  expect(resolved.html).toContain('★2');
  expect(resolved.html).toContain('FuMO25 レーダー');
  expect(resolved.html).toContain('所持2');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('master acquisition candidates are filtered by the selected ship compatibility', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const row = window.hdShipDbMasterRowByName?.('Bismarck drei');
    const rows = window.hdAGMasterCandidates?.(row?.id, '大口径主砲') || [];
    return {
      count: rows.length,
      names: rows.map(x => x.name),
      checks: rows.map(item => {
        const meta = window.hdShipDbMasterEquipmentMeta?.(item.name);
        const normal = window.hdShipDbMasterNormalCheck?.(row, item.name);
        return { name: item.name, typeName: meta?.typeName || '', allowed: !!normal?.allowed };
      })
    };
  });

  expect(data.count).toBeGreaterThan(0);
  expect(data.names).toContain('41cm連装砲');
  expect(data.checks.every(x => x.typeName === '大口径主砲')).toBeTruthy();
  expect(data.checks.every(x => x.allowed)).toBeTruthy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('master procurement counts total required copies, not only missing slots', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-equipment-procurement-v1');
    const row = window.hdShipDbMasterRowByName?.('Bismarck drei');
    const candidate = window.hdAGMasterCandidates?.(row?.id, '大口径主砲')?.[0];
    if (!row || !candidate) return { ok: false };

    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: candidate.name, category: candidate.category || '大口径主砲', count: 1, star: 0 }
    ]));

    const plan = window.hdShipDbMasterSuggestedLoadouts?.(row)?.find(x => x.name === '昼戦・連撃');
    const before = window.hdShipDbMasterResolveOwnedPlan?.(row, plan);
    const added = window.hdPLAddMasterLoadout?.(row.id, plan?.name || '', '艦娘DBテスト');
    const secondAdded = window.hdPLAddMasterLoadout?.(row.id, plan?.name || '', '艦娘DBテスト');
    const list = window.hdPLLoad?.() || [];
    const source = list.find(x => x.map === '艦娘DBテスト');
    const demand = window.hdPLDemandRows?.(source?.gearItems || []) || [];
    const target = demand.find(x => x.target === candidate.name);
    const html = window.hdShipDbMasterOwnedPlanHtml?.(row, plan) || '';

    return {
      ok: true,
      candidate: candidate.name,
      filledBefore: before?.filled || 0,
      totalBefore: before?.total || 0,
      added: !!added,
      secondAdded: !!secondAdded,
      needed: target?.needed || 0,
      owned: target?.owned || 0,
      shortfall: target?.shortfall || 0,
      hasProcureButton: html.includes('data-hd-master-procure')
    };
  });

  expect(data.ok).toBeTruthy();
  expect(data.filledBefore).toBe(1);
  expect(data.totalBefore).toBe(4);
  expect(data.added).toBeTruthy();
  expect(data.secondAdded).toBeTruthy();
  expect(data.needed).toBe(2);
  expect(data.owned).toBe(1);
  expect(data.shortfall).toBe(1);
  expect(data.hasProcureButton).toBeTruthy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('procurement demand sums total copies across multiple ships', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: '41cm連装砲', category: '大口径主砲', count: 1, star: 0 }
    ]));
    const rows = window.hdPLDemandRows?.([
      { map: '艦隊テスト', ship: '長門改二', loadout: '昼戦', wanted: '大口径主砲', target: '41cm連装砲', kind: '主砲', methodKey: 'develop', needed: 1, requiredTotal: 2 },
      { map: '艦隊テスト', ship: '陸奥改二', loadout: '昼戦', wanted: '大口径主砲', target: '41cm連装砲', kind: '主砲', methodKey: 'develop', needed: 1, requiredTotal: 2 }
    ]) || [];
    const target = rows.find(x => x.target === '41cm連装砲');
    return {
      needed: target?.needed || 0,
      owned: target?.owned || 0,
      shortfall: target?.shortfall || 0,
      ships: target?.ships || []
    };
  });

  expect(data.needed).toBe(4);
  expect(data.owned).toBe(1);
  expect(data.shortfall).toBe(3);
  expect(data.ships).toEqual(expect.arrayContaining(['長門改二', '陸奥改二']));

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('procurement priority favors broad reusable and near-complete equipment', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const broad = window.hdPLPriorityMeta?.({
      target: '41cm連装砲',
      methodKey: 'develop',
      methodLabel: '開発候補',
      maps: ['5-5', '6-5'],
      ships: ['長門改二', '陸奥改二', 'Bismarck drei'],
      loadouts: ['昼戦', 'ボス'],
      owned: 1,
      shortfall: 1
    });
    const narrow = window.hdPLPriorityMeta?.({
      target: '限定装備',
      methodKey: 'limited',
      methodLabel: '限定入手',
      maps: ['7-5'],
      ships: ['艦A'],
      loadouts: ['特殊'],
      owned: 0,
      shortfall: 2
    });
    const html = window.hdPLPriorityQueueHtml?.([
      {
        id: 'priority-test',
        map: '優先テスト',
        kinds: [],
        gearItems: [
          { map: '優先テスト', ship: '長門改二', loadout: '昼戦', wanted: '大口径主砲', target: '41cm連装砲', kind: '主砲', methodKey: 'develop', methodLabel: '開発候補', rank: 1, needed: 1, requiredTotal: 2 },
          { map: '優先テスト', ship: '陸奥改二', loadout: '昼戦', wanted: '大口径主砲', target: '41cm連装砲', kind: '主砲', methodKey: 'develop', methodLabel: '開発候補', rank: 1, needed: 1, requiredTotal: 2 }
        ]
      }
    ]) || '';
    return {
      broadScore: broad?.score || 0,
      broadLabel: broad?.label || '',
      narrowScore: narrow?.score || 0,
      reasons: broad?.reasons || [],
      html
    };
  });

  expect(data.broadScore).toBeGreaterThan(data.narrowScore);
  expect(['最優先', '優先']).toContain(data.broadLabel);
  expect(data.reasons).toEqual(expect.arrayContaining(['3隻で使用', '2計画で共用', 'あと1個', '開発候補']));
  expect(data.html).toContain('先に揃える候補');
  expect(data.html).toContain('41cm連装砲');
  expect(data.html).toContain('#1');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('next procurement action routes to the correct workflow', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const originalDev = window.hdPLDevEstimate;
    const originalImprove = window.hdPLImproveEstimate;

    window.hdPLDevEstimate = () => ({
      recipe: { title: '戦艦主砲レシピ' },
      attempts: 5,
      total: { fuel: 50, ammo: 500, steel: 500, bauxite: 0 }
    });
    window.hdPLImproveEstimate = () => ({
      source: { name: '九一式徹甲弾' },
      screw: 18,
      dev: 24
    });

    const dev = window.hdPLNextActionMeta?.({
      target: '41cm連装砲',
      methodKey: 'develop',
      shortfall: 1
    });
    const improve = window.hdPLNextActionMeta?.({
      target: '一式徹甲弾',
      methodKey: 'improve',
      shortfall: 1
    });
    const quest = window.hdPLNextActionMeta?.({
      target: '任務装備',
      methodKey: 'quest',
      shortfall: 1
    });

    window.hdPLDevEstimate = originalDev;
    window.hdPLImproveEstimate = originalImprove;

    return { dev, improve, quest };
  });

  expect(data.dev.kind).toBe('develop');
  expect(data.dev.detail).toContain('戦艦主砲レシピ');
  expect(data.dev.sub).toContain('期待 約5回');
  expect(data.dev.action).toBe('開発レシピへ');

  expect(data.improve.kind).toBe('improve');
  expect(data.improve.sourceName).toBe('九一式徹甲弾');
  expect(data.improve.detail).toContain('九一式徹甲弾 → 一式徹甲弾');
  expect(data.improve.action).toBe('改修工廠へ');

  expect(data.quest.kind).toBe('quest');
  expect(data.quest.action).toBe('入手ルートへ');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('same-tab equipment save immediately advances procurement state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const equipKey = 'harbordesk-equipment-v1';
    const procKey = 'harbordesk-equipment-procurement-v1';

    localStorage.setItem(equipKey, JSON.stringify([
      { id: 'eq-1', name: '41cm連装砲', category: '大口径主砲', count: 1, star: 0, targetStar: 10 }
    ]));
    localStorage.setItem(procKey, JSON.stringify([
      {
        id: 'proc-1',
        map: '自動更新テスト',
        kinds: [],
        gearItems: [
          {
            map: '自動更新テスト',
            ship: '長門改二',
            loadout: '昼戦',
            wanted: '大口径主砲',
            target: '41cm連装砲',
            kind: '主砲',
            methodKey: 'develop',
            methodLabel: '開発候補',
            rank: 1,
            needed: 1,
            requiredTotal: 2,
            sources: ['長門改二']
          }
        ]
      }
    ]));

    window.hdPLRender?.();
    window.renderHomeDashboard?.();
    const before = {
      next: document.querySelector('#hdProcurementNextAction')?.textContent || '',
      homeNext: document.querySelector('#homeProcurement')?.textContent || '',
      demand: window.hdPLDemandRows?.(window.hdPLLoad?.()[0]?.gearItems || [])?.[0] || null
    };

    window.hdSave?.(equipKey, [
      { id: 'eq-1', name: '41cm連装砲', category: '大口径主砲', count: 2, star: 0, targetStar: 10 }
    ]);

    const after = {
      next: document.querySelector('#hdProcurementNextAction')?.textContent || '',
      nextCards: document.querySelectorAll('#hdProcurementNextAction .hd-pl-next-action').length,
      homeNext: document.querySelector('#homeProcurement')?.textContent || '',
      demand: window.hdPLDemandRows?.(window.hdPLLoad?.()[0]?.gearItems || [])?.[0] || null
    };

    return { before, after };
  });

  expect(data.before.next).toContain('41cm連装砲');
  expect(data.before.homeNext).toContain('41cm連装砲');
  expect(data.before.demand.needed).toBe(2);
  expect(data.before.demand.owned).toBe(1);
  expect(data.before.demand.shortfall).toBe(1);

  expect(data.after.nextCards).toBe(0);
  expect(data.after.next).not.toContain('41cm連装砲');
  expect(data.after.homeNext).not.toContain('41cm連装砲');
  expect(data.after.demand.needed).toBe(2);
  expect(data.after.demand.owned).toBe(2);
  expect(data.after.demand.shortfall).toBe(0);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('procurement progress history records completion once and activity log only on completion', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const equipKey = 'harbordesk-equipment-v1';
    const procKey = 'harbordesk-equipment-procurement-v1';
    const histKey = 'harbordesk-equipment-procurement-history-v1';
    const activityKey = 'harbordesk-activity-log-v1';

    localStorage.setItem(histKey, '[]');
    localStorage.setItem(activityKey, '[]');
    localStorage.setItem(equipKey, JSON.stringify([
      { id: 'eq-progress', name: '41cm連装砲', category: '大口径主砲', count: 1, star: 0, targetStar: 10 }
    ]));
    localStorage.setItem(procKey, JSON.stringify([
      {
        id: 'proc-progress',
        map: '進捗テスト',
        kinds: [],
        gearItems: [
          {
            map: '進捗テスト',
            ship: '長門改二',
            loadout: '昼戦',
            wanted: '大口径主砲',
            target: '41cm連装砲',
            kind: '主砲',
            methodKey: 'develop',
            methodLabel: '開発候補',
            rank: 1,
            needed: 1,
            requiredTotal: 3,
            sources: ['長門改二']
          }
        ]
      }
    ]));

    window.hdPLPrimeDemandSnapshot?.();

    window.hdSave?.(equipKey, [
      { id: 'eq-progress', name: '41cm連装砲', category: '大口径主砲', count: 2, star: 0, targetStar: 10 }
    ]);
    const afterProgress = {
      history: window.hdPLHistoryLoad?.() || [],
      activity: JSON.parse(localStorage.getItem(activityKey) || '[]')
    };

    window.hdSave?.(equipKey, [
      { id: 'eq-progress', name: '41cm連装砲', category: '大口径主砲', count: 3, star: 0, targetStar: 10 }
    ]);
    const afterComplete = {
      history: window.hdPLHistoryLoad?.() || [],
      activity: JSON.parse(localStorage.getItem(activityKey) || '[]'),
      html: window.hdPLHistoryHtml?.() || ''
    };

    window.hdSave?.(equipKey, [
      { id: 'eq-progress', name: '41cm連装砲', category: '大口径主砲', count: 3, star: 0, targetStar: 10 }
    ]);
    const afterRepeat = {
      history: window.hdPLHistoryLoad?.() || [],
      activity: JSON.parse(localStorage.getItem(activityKey) || '[]')
    };

    return { afterProgress, afterComplete, afterRepeat };
  });

  expect(data.afterProgress.history).toHaveLength(1);
  expect(data.afterProgress.history[0].complete).toBeFalsy();
  expect(data.afterProgress.history[0].beforeShortfall).toBe(2);
  expect(data.afterProgress.history[0].afterShortfall).toBe(1);
  expect(data.afterProgress.activity.filter(x => x.external)).toHaveLength(0);

  expect(data.afterComplete.history).toHaveLength(2);
  expect(data.afterComplete.history[0].complete).toBeTruthy();
  expect(data.afterComplete.history[0].target).toBe('41cm連装砲');
  expect(data.afterComplete.history[0].beforeShortfall).toBe(1);
  expect(data.afterComplete.history[0].afterShortfall).toBe(0);
  expect(data.afterComplete.html).toContain('調達完了');

  const external = data.afterComplete.activity.filter(x => x.external);
  expect(external).toHaveLength(1);
  expect(external[0].label).toContain('装備調達完了: 41cm連装砲');

  expect(data.afterRepeat.history).toHaveLength(2);
  expect(data.afterRepeat.activity.filter(x => x.external)).toHaveLength(1);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship image library binds exact master IDs and keeps remodel forms separate', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const nagato = window.hdShipImageResolve?.('長門改二');
    const mutsu = window.hdShipImageResolve?.('陸奥改二');
    const nagatoHtml = window.hdShipImageCardHtml?.('長門改二') || '';
    const mutsuHtml = window.hdShipImageCardHtml?.('陸奥改二') || '';

    const fileA = new File([new Uint8Array([1,2,3])], '541.png', { type: 'image/png' });
    const fileB = new File([new Uint8Array([4,5,6])], '陸奥改二.webp', { type: 'image/webp' });

    const imported = await window.hdShipImageImportFiles?.([fileA, fileB]);
    const count = await window.hdShipImageCount?.();
    const a = await window.hdShipImageGet?.(nagato?.id);
    const b = await window.hdShipImageGet?.(mutsu?.id);

    window.hdShipImageSaveConfig?.({ remoteTemplate: 'https://example.invalid/card/{id}.png' });
    const remoteNagato = window.hdShipImageRemoteUrl?.(nagato?.id);
    window.hdShipImageSaveConfig?.({ remoteTemplate: '' });

    await window.hdShipImageDelete?.(nagato?.id);
    await window.hdShipImageDelete?.(mutsu?.id);

    return {
      nagato,
      mutsu,
      nagatoHtml,
      mutsuHtml,
      imported,
      count,
      storedA: { id: a?.id, name: a?.name, type: a?.type },
      storedB: { id: b?.id, name: b?.name, type: b?.type },
      remoteNagato
    };
  });

  expect(data.nagato.id).toBe(541);
  expect(data.nagato.name).toBe('長門改二');
  expect(data.mutsu.id).toBe(573);
  expect(data.mutsu.name).toBe('陸奥改二');
  expect(data.nagatoHtml).toContain('data-hd-ship-image-host="541"');
  expect(data.mutsuHtml).toContain('data-hd-ship-image-host="573"');
  expect(data.imported.ok).toBe(2);
  expect(data.imported.skip).toBe(0);
  expect(data.count).toBeGreaterThanOrEqual(2);
  expect(data.storedA.id).toBe(541);
  expect(data.storedB.id).toBe(573);
  expect(data.storedA.id).not.toBe(data.storedB.id);
  expect(data.remoteNagato).toBe('https://example.invalid/card/541.png');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship image coverage filter finds registered and missing exact forms', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    await window.hdShipImageDelete?.(541);
    const good = new File([new Uint8Array([1,2,3,4])], '541.png', { type: 'image/png' });
    const bad = new File([new Uint8Array([5,6,7])], 'unknown-ship.png', { type: 'image/png' });
    const imported = await window.hdShipImageImportFiles?.([good, bad]);
    const coverage = await window.hdShipImageCoverage?.();
    const hasNagato = window.hdShipImageHasLocalSync?.('長門改二');

    window.hdEnsureShipDatabase?.();
    const search = document.getElementById('hdShipDbSearch');
    if (search) {
      search.value = '長門改二';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }

    document.querySelector('[data-hd-shipdb-image-filter="missing"]')?.click();
    const missingText = document.getElementById('hdShipDbList')?.textContent || '';
    const missingHasNagato = !!document.querySelector('#hdShipDbList [data-hd-ship-image-host="541"]');

    document.querySelector('[data-hd-shipdb-image-filter="registered"]')?.click();
    const registeredText = document.getElementById('hdShipDbList')?.textContent || '';
    const registeredHasNagato = !!document.querySelector('#hdShipDbList [data-hd-ship-image-host="541"]');
    const coverageText = document.getElementById('hdShipDbImageCoverage')?.textContent || '';

    await window.hdShipImageDelete?.(541);

    return {
      imported,
      coverage,
      hasNagato,
      missingText,
      missingHasNagato,
      registeredText,
      registeredHasNagato,
      coverageText
    };
  });

  expect(data.imported.ok).toBe(1);
  expect(data.imported.skip).toBe(1);
  expect(data.imported.skipped[0].file).toBe('unknown-ship.png');
  expect(data.imported.skipped[0].reason).toContain('解決');
  expect(data.coverage.local).toBeGreaterThanOrEqual(1);
  expect(data.coverage.total).toBeGreaterThan(data.coverage.local);
  expect(data.hasNagato).toBeTruthy();
  expect(data.missingHasNagato).toBeFalsy();
  expect(data.registeredHasNagato).toBeTruthy();
  expect(data.registeredText).toContain('長門改二');
  expect(data.coverageText).toContain('画像');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship image binary backup round-trips exact master IDs and config', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);

    const a = new File([new Uint8Array([10,20,30,40])], '541.png', { type: 'image/png' });
    const b = new File([new Uint8Array([50,60,70,80,90])], '573.webp', { type: 'image/webp' });
    await window.hdShipImagePut?.(541, a, '長門改二', true);
    await window.hdShipImagePut?.(573, b, '陸奥改二', true);
    window.hdShipImageSaveConfig?.({ remoteTemplate: 'https://backup.example/card/{id}.png' });

    const built = await window.hdShipImageBuildBackup?.();
    const parsed = await window.hdShipImageReadBackup?.(built.blob);

    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);
    window.hdShipImageSaveConfig?.({ remoteTemplate: '' });

    const beforeRestore = {
      a: await window.hdShipImageGet?.(541),
      b: await window.hdShipImageGet?.(573),
      config: window.hdShipImageConfig?.()
    };

    const restored = await window.hdShipImageImportBackup?.(built.blob);
    const afterA = await window.hdShipImageGet?.(541);
    const afterB = await window.hdShipImageGet?.(573);
    const config = window.hdShipImageConfig?.();

    const bytesA = afterA?.blob ? [...new Uint8Array(await afterA.blob.arrayBuffer())] : [];
    const bytesB = afterB?.blob ? [...new Uint8Array(await afterB.blob.arrayBuffer())] : [];

    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);
    window.hdShipImageSaveConfig?.({ remoteTemplate: '' });

    return {
      manifestFormat: built.manifest?.format,
      manifestVersion: built.manifest?.version,
      parsedIds: parsed.items?.map(x => x.id) || [],
      beforeRestore: {
        a: !!beforeRestore.a,
        b: !!beforeRestore.b,
        remote: beforeRestore.config?.remoteTemplate || ''
      },
      restored: { ok: restored?.ok || 0, total: restored?.total || 0 },
      after: {
        a: { id: afterA?.id, name: afterA?.name, type: afterA?.type, bytes: bytesA },
        b: { id: afterB?.id, name: afterB?.name, type: afterB?.type, bytes: bytesB },
        remote: config?.remoteTemplate || ''
      }
    };
  });

  expect(data.manifestFormat).toBe('harbordesk-ship-images');
  expect(data.manifestVersion).toBe(1);
  expect(data.parsedIds).toEqual(expect.arrayContaining([541, 573]));
  expect(data.beforeRestore.a).toBeFalsy();
  expect(data.beforeRestore.b).toBeFalsy();
  expect(data.beforeRestore.remote).toBe('');
  expect(data.restored.ok).toBeGreaterThanOrEqual(2);
  expect(data.after.a.id).toBe(541);
  expect(data.after.a.name).toBe('長門改二');
  expect(data.after.a.type).toBe('image/png');
  expect(data.after.a.bytes).toEqual([10,20,30,40]);
  expect(data.after.b.id).toBe(573);
  expect(data.after.b.name).toBe('陸奥改二');
  expect(data.after.b.type).toBe('image/webp');
  expect(data.after.b.bytes).toEqual([50,60,70,80,90]);
  expect(data.after.remote).toBe('https://backup.example/card/{id}.png');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship thumbnails reuse one object URL across roster and fleet surfaces', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    await window.hdShipImageDelete?.(541);
    const file = new File([new Uint8Array([1,2,3,4,5,6])], '541.png', { type: 'image/png' });
    await window.hdShipImagePut?.(541, file, '長門改二', true);

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id: 'ship-thumb-test', name: '長門改二', type: '戦艦', level: 99, remodel: '改二', tags: ['主力'], gear: '', memo: '' }
    ]));
    window.renderShipRoster?.();

    const rosterThumb = document.querySelector('#shipRosterList [data-hd-ship-image-host="541"]');
    await window.hdShipImageHydrate?.(document.getElementById('shipRosterList'));

    const slot = {
      profile: {
        row: { id: 'ship-thumb-test', name: '長門改二', level: 99, gear: '' },
        type: '戦艦',
        speed: '低速',
        db: { _masterOnly: true }
      },
      required: '戦艦'
    };
    const fleetHtml = window.hdFSShipHtml?.(slot, 0) || '';

    const fakePlan = {
      index: 0,
      missing: [],
      masterBacked: 1,
      ships: [{
        ship: '長門改二',
        type: '戦艦',
        items: [],
        missing: [],
        master: true,
        expansion: null
      }],
      used: {},
      owned: {}
    };
    const loadoutHtml = window.hdFLPlanHtml?.(fakePlan) || '';

    const wrap = document.createElement('div');
    wrap.innerHTML = fleetHtml + loadoutHtml;
    document.body.appendChild(wrap);
    await window.hdShipImageHydrate?.(wrap);

    // The silent import intentionally suppresses global refresh. Refresh existing
    // database cards too before comparing all surfaces (including remote cards).
    await window.hdShipImageHydrate?.(document);
    const all = [...document.querySelectorAll('[data-hd-ship-image-host="541"] img')];
    const srcs = all.map(x => x.getAttribute('src') || '');
    const unique = [...new Set(srcs.filter(Boolean))];

    const objectA = window.hdShipImageObjectUrl?.(541, file);
    const objectB = window.hdShipImageObjectUrl?.(541, file);

    wrap.remove();
    await window.hdShipImageDelete?.(541);
    localStorage.setItem('harbordesk-ship-roster-v1', '[]');
    window.renderShipRoster?.();

    return {
      rosterExists: !!rosterThumb,
      rosterHtml: document.getElementById('shipRosterList')?.innerHTML || '',
      fleetHtml,
      loadoutHtml,
      imageCount: all.length,
      uniqueSrcCount: unique.length,
      objectSame: objectA === objectB
    };
  });

  expect(data.rosterExists).toBeTruthy();
  expect(data.fleetHtml).toContain('data-hd-ship-image-host="541"');
  expect(data.fleetHtml).toContain('fleet-thumb');
  expect(data.loadoutHtml).toContain('data-hd-ship-image-host="541"');
  expect(data.loadoutHtml).toContain('loadout-thumb');
  expect(data.imageCount).toBeGreaterThanOrEqual(3);
  expect(data.uniqueSrcCount).toBe(1);
  expect(data.objectSame).toBeTruthy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('saved fleets and sortie preparation show the same exact-ID ship image', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    await window.hdShipImageDelete?.(541);
    const file = new File([new Uint8Array([9,8,7,6,5,4])], '541.png', { type: 'image/png' });
    await window.hdShipImagePut?.(541, file, '長門改二', true);

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id: 'ship-541', name: '長門改二', type: '戦艦', level: 99, remodel: '改二', tags: ['主力'], gear: '', memo: '' }
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id: 'fleet-image-test',
        name: '画像テスト艦隊',
        ships: [{ ship: '長門改二', gear: '46cm三連装砲' }],
        memo: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }]
    }));

    window.renderCustomFleets?.('5-5');
    const customHost = document.getElementById('customFleetPanel');
    await window.hdShipImageHydrate?.(customHost);

    const sortieInfo = {
      fleet: { id: 'fleet-image-test', name: '画像テスト艦隊', ships: [{ ship: '長門改二', gear: '46cm三連装砲' }] },
      ships: [{ ship: '長門改二', gear: '46cm三連装砲' }],
      registered: 1,
      gearChecks: [],
      manual: [],
      manualState: {},
      manualDone: 0,
      manualTotal: 0
    };
    const sortieHtml = window.hdSPSFleetHtml?.('5-5', sortieInfo) || '';
    const wrap = document.createElement('div');
    wrap.innerHTML = sortieHtml;
    document.body.appendChild(wrap);
    await window.hdShipImageHydrate?.(wrap);

    const customImg = customHost?.querySelector('[data-hd-ship-image-host="541"] img');
    const sortieImg = wrap.querySelector('[data-hd-ship-image-host="541"] img');
    const result = {
      customHtml: customHost?.innerHTML || '',
      sortieHtml,
      customSrc: customImg?.getAttribute('src') || '',
      sortieSrc: sortieImg?.getAttribute('src') || ''
    };

    wrap.remove();
    await window.hdShipImageDelete?.(541);
    localStorage.setItem('harbordesk-ship-roster-v1', '[]');
    localStorage.setItem('harbordesk-custom-fleets-v1', '{}');
    window.renderCustomFleets?.('5-5');
    return result;
  });

  expect(data.customHtml).toContain('data-hd-ship-image-host="541"');
  expect(data.customHtml).toContain('custom-fleet-thumb');
  expect(data.sortieHtml).toContain('data-hd-ship-image-host="541"');
  expect(data.sortieHtml).toContain('sortie-prep-thumb');
  expect(data.customSrc).not.toBe('');
  expect(data.sortieSrc).not.toBe('');
  expect(data.customSrc).toBe(data.sortieSrc);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('legacy roster and saved fleets migrate to exact master IDs and survive name drift', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id: 'legacy-ship', name: '長門改二', type: '戦艦', level: 99, remodel: '改二', tags: [] }
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id: 'legacy-fleet',
        name: '旧形式',
        ships: [{ ship: '長門改二', gear: '' }],
        memo: ''
      }]
    }));

    const rosterChanged = window.rosterMigrateMasterIds?.();
    const fleetChanged = window.cfMigrateMasterIds?.();
    const roster = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1') || '[]');
    const fleets = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');
    const savedShip = fleets['5-5']?.[0]?.ships?.[0] || {};

    const aliasRow = { ship: '表示名が変わってもOK', masterId: 541, gear: '' };
    const rosterById = window.hdSPSRosterMatchShip?.(aliasRow);
    const dbById = window.hdSPSDbShip?.(aliasRow);
    const thumb = window.hdShipImageThumbHtml?.({ id: 541, name: aliasRow.ship }, 'id-stability-test') || '';

    const fsDb = window.hdFSDbFor?.({ name: aliasRow.ship, masterId: 541 });
    const flDb = window.hdFLShipDbItem?.({
      profile: {
        row: { name: aliasRow.ship, masterId: 541 },
        type: '戦艦',
        roles: [],
        master: null
      }
    });

    localStorage.setItem('harbordesk-ship-roster-v1', '[]');
    localStorage.setItem('harbordesk-custom-fleets-v1', '{}');
    window.renderShipRoster?.();

    return {
      rosterChanged,
      fleetChanged,
      rosterId: roster[0]?.masterId || 0,
      fleetId: savedShip.masterId || 0,
      rosterById: {
        name: rosterById?.name || '',
        masterId: rosterById?.masterId || 0
      },
      dbById: {
        name: dbById?.final || dbById?.name || '',
        masterId: dbById?._masterRow?.id || dbById?.masterId || 0
      },
      fsMasterId: fsDb?._masterRow?.id || fsDb?.masterId || 0,
      flMasterId: flDb?._masterRow?.id || flDb?.masterId || 0,
      thumb
    };
  });

  expect(data.rosterChanged).toBeTruthy();
  expect(data.fleetChanged).toBeTruthy();
  expect(data.rosterId).toBe(541);
  expect(data.fleetId).toBe(541);
  expect(data.rosterById.masterId).toBe(541);
  expect(data.dbById.masterId).toBe(541);
  expect(data.fsMasterId).toBe(541);
  expect(data.flMasterId).toBe(541);
  expect(data.thumb).toContain('data-hd-ship-image-host="541"');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship identity diagnostics detects and repairs master ID drift', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id: 'drift-roster', name: '長門改二（誤記）', masterId: 541, type: '戦艦', level: 99, tags: [] },
      { id: 'missing-id-roster', name: '陸奥改二', type: '戦艦', level: 99, tags: [] }
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '5-5': [{
        id: 'drift-fleet',
        name: '整合性テスト',
        ships: [
          { ship: '長門改二（別表記）', masterId: 541, gear: '' },
          { ship: '陸奥改二', gear: '' }
        ],
        memo: ''
      }]
    }));

    const before = window.hdDXShipIdentityHealth?.();
    const oldConfirm = window.confirm;
    window.confirm = () => true;
    const changed = window.hdDXRepairShipIdentity?.();
    window.confirm = oldConfirm;
    const after = window.hdDXShipIdentityHealth?.();

    const roster = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1') || '[]');
    const fleets = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}');

    const perCard = (() => {
      localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
        { id: 'card-sync', name: '長門改二 typo', masterId: 541, type: '戦艦', level: 99, tags: [] }
      ]));
      const ok = window.rosterSyncCanonical?.('card-sync');
      const row = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1') || '[]')[0] || {};
      return { ok, row };
    })();

    localStorage.setItem('harbordesk-ship-roster-v1', '[]');
    localStorage.setItem('harbordesk-custom-fleets-v1', '{}');
    window.renderShipRoster?.();

    return {
      before,
      changed,
      after,
      roster: roster.map(x => ({ name: x.name, masterId: x.masterId })),
      fleetShips: (fleets['5-5']?.[0]?.ships || []).map(x => ({ ship: x.ship, masterId: x.masterId })),
      perCard
    };
  });

  expect(data.before.mismatch).toBeGreaterThanOrEqual(2);
  expect(data.before['missing-id']).toBeGreaterThanOrEqual(2);
  expect(data.before.issues).toBeGreaterThanOrEqual(4);
  expect(data.changed).toBeGreaterThanOrEqual(4);
  expect(data.after.mismatch).toBe(0);
  expect(data.after['missing-id']).toBe(0);
  expect(data.after['invalid-id']).toBe(0);
  expect(data.after.unresolved).toBe(0);
  expect(data.roster[0]).toEqual(expect.objectContaining({ name: '長門改二', masterId: 541 }));
  expect(data.roster[1]).toEqual(expect.objectContaining({ name: '陸奥改二', masterId: 573 }));
  expect(data.fleetShips[0]).toEqual(expect.objectContaining({ ship: '長門改二', masterId: 541 }));
  expect(data.fleetShips[1]).toEqual(expect.objectContaining({ ship: '陸奥改二', masterId: 573 }));
  expect(data.perCard.ok).toBeTruthy();
  expect(data.perCard.row.name).toBe('長門改二');
  expect(data.perCard.row.masterId).toBe(541);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship image integrity audit fingerprints duplicates and invalid master IDs', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const allShips = window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {};
    const legacyId = Object.keys(allShips).map(Number).find(id => id && id !== 541 && id !== 573) || 1;

    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);
    await window.hdShipImageDelete?.(999999);
    await window.hdShipImageDelete?.(legacyId);

    const sameA = new File([new Uint8Array([11,22,33,44,55])], '541.png', { type: 'image/png' });
    const sameB = new File([new Uint8Array([11,22,33,44,55])], '573.png', { type: 'image/png' });
    const invalid = new File([new Uint8Array([99,88,77])], '999999.png', { type: 'image/png' });

    await window.hdShipImagePut?.(541, sameA, '長門改二', true);
    await window.hdShipImagePut?.(573, sameB, '陸奥改二', true);
    await window.hdShipImagePut?.(999999, invalid, '存在しない艦', true);

    const db = await window.hdShipImageOpenDb?.();
    const legacyBlob = new Blob([new Uint8Array([1,3,5,7,9,11])], { type: 'image/png' });
    await new Promise((resolve, reject) => {
      const tx = db.transaction('images', 'readwrite');
      tx.objectStore('images').put({
        id: legacyId,
        name: allShips[String(legacyId)]?.name || 'legacy',
        blob: legacyBlob,
        type: 'image/png',
        updatedAt: Date.now()
      });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    await window.hdShipImageRefreshLocalIds?.();

    const light = await window.hdShipImageIntegrityAudit?.(false);
    const deep = await window.hdShipImageIntegrityAudit?.(true);
    const legacyAfter = await window.hdShipImageGet?.(legacyId);

    const duplicateIds = (deep.duplicates || []).flatMap(g => g.items.map(x => x.id));

    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);
    await window.hdShipImageDelete?.(999999);
    await window.hdShipImageDelete?.(legacyId);

    return {
      legacyId,
      light: {
        invalid: light.invalidId.map(x => x.id),
        unhashed: light.unhashed.map(x => x.id),
        duplicates: light.duplicates.map(g => g.items.map(x => x.id))
      },
      deep: {
        invalid: deep.invalidId.map(x => x.id),
        unhashed: deep.unhashed.map(x => x.id),
        duplicates: deep.duplicates.map(g => g.items.map(x => x.id))
      },
      legacyHash: legacyAfter?.hash || '',
      duplicateIds
    };
  });

  expect(data.light.invalid).toContain(999999);
  expect(data.light.unhashed).toContain(data.legacyId);
  expect(data.deep.invalid).toContain(999999);
  expect(data.deep.unhashed).not.toContain(data.legacyId);
  expect(data.legacyHash).toMatch(/^[0-9a-f]{64}$/);
  expect(data.duplicateIds).toEqual(expect.arrayContaining([541, 573]));

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('ship image verification manifest marks exact and mismatched fingerprints and survives backup', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-ship-image-verify-v1');
    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);

    const a = new File([new Uint8Array([2,4,6,8,10,12])], '541.png', { type: 'image/png' });
    const b = new File([new Uint8Array([1,3,5,7,9,11])], '573.png', { type: 'image/png' });
    await window.hdShipImagePut?.(541, a, '長門改二', true);
    await window.hdShipImagePut?.(573, b, '陸奥改二', true);

    const rowA = await window.hdShipImageGet?.(541);
    const rowB = await window.hdShipImageGet?.(573);
    const wrong = rowB?.hash === '0'.repeat(64) ? 'f'.repeat(64) : '0'.repeat(64);
    const manifestFile = new File([JSON.stringify({
      format: 'harbordesk-ship-image-hashes',
      version: 1,
      source: 'test-reference',
      hashes: {
        '541': rowA?.hash || '',
        '573': wrong
      }
    })], 'ship-image-hashes.json', { type: 'application/json' });

    const manifest = await window.hdShipImageImportVerifyManifest?.(manifestFile);
    const audit = await window.hdShipImageIntegrityAudit?.(true);

    const wrap = document.createElement('div');
    wrap.innerHTML =
      (window.hdShipImageCardHtml?.({ id: 541, name: '長門改二' }) || '') +
      (window.hdShipImageCardHtml?.({ id: 573, name: '陸奥改二' }) || '');
    document.body.appendChild(wrap);
    await window.hdShipImageHydrate?.(wrap);

    const verifiedHost = wrap.querySelector('[data-hd-ship-image-host="541"]');
    const mismatchHost = wrap.querySelector('[data-hd-ship-image-host="573"]');

    const backup = await window.hdShipImageBuildBackup?.();
    localStorage.removeItem('harbordesk-ship-image-verify-v1');
    const cleared = window.hdShipImageVerifyLoad?.();
    await window.hdShipImageImportBackup?.(backup.blob);
    const restored = window.hdShipImageVerifyLoad?.();

    const result = {
      hashA: rowA?.hash || '',
      hashB: rowB?.hash || '',
      manifestCount: Object.keys(manifest?.hashes || {}).length,
      verifyEntries: audit?.verifyEntries || 0,
      verifiedIds: (audit?.verified || []).map(x => x.id),
      mismatchIds: (audit?.mismatch || []).map(x => x.id),
      verifiedClass: verifiedHost?.classList.contains('verify-verified') || false,
      mismatchClass: mismatchHost?.classList.contains('verify-mismatch') || false,
      backupVerifyCount: Object.keys(backup?.manifest?.verify?.hashes || {}).length,
      clearedCount: Object.keys(cleared?.hashes || {}).length,
      restoredCount: Object.keys(restored?.hashes || {}).length,
      restoredSource: restored?.source || ''
    };

    wrap.remove();
    localStorage.removeItem('harbordesk-ship-image-verify-v1');
    await window.hdShipImageDelete?.(541);
    await window.hdShipImageDelete?.(573);
    return result;
  });

  expect(data.hashA).toMatch(/^[0-9a-f]{64}$/);
  expect(data.hashB).toMatch(/^[0-9a-f]{64}$/);
  expect(data.manifestCount).toBe(2);
  expect(data.verifyEntries).toBe(2);
  expect(data.verifiedIds).toContain(541);
  expect(data.mismatchIds).toContain(573);
  expect(data.verifiedClass).toBeTruthy();
  expect(data.mismatchClass).toBeTruthy();
  expect(data.backupVerifyCount).toBe(2);
  expect(data.clearedCount).toBe(0);
  expect(data.restoredCount).toBe(2);
  expect(data.restoredSource).toBe('test-reference');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('exact-star equipment stacks prevent normal and expansion double use', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: 'FuMO25 レーダー', count: 1, star: 0 },
      { name: 'FuMO25 レーダー', count: 1, star: 7 }
    ]));

    const dbInv = [...(window.hdShipDbOwnedEquipInventory?.().values() || [])]
      .filter(x => x.name === 'FuMO25 レーダー')
      .map(x => ({ key: x.key, count: x.count, star: x.maxStar }));
    const flInv = [...(window.hdFLInventory?.().values() || [])]
      .filter(x => x.name === 'FuMO25 レーダー')
      .map(x => ({ key: x.key, count: x.count, star: x.maxStar }));

    const ship = window.hdShipDbMasterAdapter?.({ name: 'Bismarck drei' });
    const remaining = new Map((window.hdFLInventory?.() || new Map()).entries());
    const counts = new Map([...remaining].map(([key, own]) => [key, own.count]));
    const before = window.hdShipDbExpansionCandidates?.(ship, counts, '電探') || [];

    const star7 = flInv.find(x => x.star === 7);
    if (star7) counts.set(star7.key, 0);
    const after = window.hdShipDbExpansionCandidates?.(ship, counts, '電探') || [];

    const ex0 = window.hdShipDbMasterExslotCheck?.(
      window.hdShipDbMasterRowByName?.('Bismarck drei'),
      'FuMO25 レーダー',
      0
    );
    const ex7 = window.hdShipDbMasterExslotCheck?.(
      window.hdShipDbMasterRowByName?.('Bismarck drei'),
      'FuMO25 レーダー',
      7
    );

    localStorage.setItem('harbordesk-equipment-v1', '[]');

    return {
      dbInv,
      flInv,
      before: before.map(x => ({ key: x.own.key, star: x.own.maxStar, remain: x.remain })),
      after: after.map(x => ({ key: x.own.key, star: x.own.maxStar, remain: x.remain })),
      ex0: { allowed: !!ex0?.allowed, reqStar: ex0?.reqStar || 0 },
      ex7: { allowed: !!ex7?.allowed, reqStar: ex7?.reqStar || 0 }
    };
  });

  expect(data.dbInv).toHaveLength(2);
  expect(data.flInv).toHaveLength(2);
  expect(data.dbInv.map(x => x.star).sort((a,b)=>a-b)).toEqual([0, 7]);
  expect(data.flInv.map(x => x.star).sort((a,b)=>a-b)).toEqual([0, 7]);
  expect(new Set(data.dbInv.map(x => x.key)).size).toBe(2);
  expect(new Set(data.flInv.map(x => x.key)).size).toBe(2);
  expect(data.ex0.allowed).toBeFalsy();
  expect(data.ex7.allowed).toBeTruthy();
  expect(data.ex7.reqStar).toBeGreaterThan(0);
  expect(data.before.some(x => x.star === 7)).toBeTruthy();
  expect(data.after.some(x => x.star === 7)).toBeFalsy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('star-gated expansion rebalances lower-star normal copy before procurement', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 7 },
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 0 }
    ]));

    const inv = window.hdFLInventory?.();
    const key7 = window.hdFLInventoryStackKey?.('FuMO25 レーダー', 7);
    const key0 = window.hdFLInventoryStackKey?.('FuMO25 レーダー', 0);
    const remaining = new Map([...inv].map(([k,v]) => [k, v.count]));
    remaining.set(key7, 0);
    remaining.set(key0, 1);

    const master = window.hdShipDbMasterRowByName?.('Bismarck drei');
    const sourceSlot = {
      profile: {
        row: { name: 'Bismarck drei', masterId: master?.id || 0, gear: '' },
        type: master?.type || '戦艦',
        roles: [],
        master
      }
    };
    const suggestion = { slots: [sourceSlot] };
    const ships = [{
      ship: 'Bismarck drei',
      masterId: master?.id || 0,
      items: [{
        name: 'FuMO25 レーダー',
        star: 7,
        stackKey: key7,
        norm: window.hdFLNorm?.('FuMO25 レーダー'),
        category: '大型電探',
        kind: 'utility',
        slotIndex: 3
      }],
      expansion: null
    }];
    const ship = window.hdFLShipDbItem?.(sourceSlot);
    const moved = window.hdFLRebalanceExpansion?.(inv, remaining, suggestion, ships, 0, ship, '電探');
    const after = window.hdShipDbExpansionCandidates?.(ship, remaining, '電探') || [];

    localStorage.setItem('harbordesk-equipment-v1', '[]');

    return {
      moved: !!moved,
      normalStar: ships[0].items[0].star,
      normalKey: ships[0].items[0].stackKey,
      remaining7: remaining.get(key7) || 0,
      remaining0: remaining.get(key0) || 0,
      expansionName: after[0]?.own?.name || '',
      expansionStar: after[0]?.own?.maxStar || 0,
      reqStar: after[0]?.info?.reqStar || 0
    };
  });

  expect(data.moved).toBeTruthy();
  expect(data.normalStar).toBe(0);
  expect(data.remaining7).toBe(1);
  expect(data.remaining0).toBe(0);
  expect(data.expansionName).toBe('FuMO25 レーダー');
  expect(data.expansionStar).toBe(7);
  expect(data.reqStar).toBe(7);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('expansion procurement tracks total copies and one star-qualified copy separately', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-equipment-procurement-v1');
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: 'FuMO25 レーダー', category: '大型電探', count: 2, star: 0 }
    ]));

    const added = window.hdPLAddExpansionRequirement?.(
      '増設調達テスト',
      'Bismarck drei',
      window.hdShipDbMasterRowByName?.('Bismarck drei')?.id || 0,
      'FuMO25 レーダー',
      7,
      '改修★7以上が必要',
      2
    );
    const source = (window.hdPLLoad?.() || []).find(x => x.map === '増設調達テスト');
    const before = (window.hdPLDemandRows?.(source?.gearItems || []) || [])[0];

    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 7 },
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 0 }
    ]));
    const ready = (window.hdPLDemandRows?.(source?.gearItems || []) || [])[0];

    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { name: 'FuMO25 レーダー', category: '大型電探', count: 1, star: 7 }
    ]));
    const totalShort = (window.hdPLDemandRows?.(source?.gearItems || []) || [])[0];

    localStorage.removeItem('harbordesk-equipment-procurement-v1');
    localStorage.setItem('harbordesk-equipment-v1', '[]');

    return {
      added,
      before: before ? {
        reqStar: before.reqStar,
        needed: before.needed,
        qualifiedNeeded: before.qualifiedNeeded,
        ownedTotal: before.ownedTotal,
        ownedQualified: before.ownedQualified,
        totalShortfall: before.totalShortfall,
        starShortfall: before.starShortfall,
        shortfall: before.shortfall,
        methodKey: before.methodKey
      } : null,
      ready: ready ? {
        ownedTotal: ready.ownedTotal,
        ownedQualified: ready.ownedQualified,
        shortfall: ready.shortfall,
        status: ready.status
      } : null,
      totalShort: totalShort ? {
        ownedTotal: totalShort.ownedTotal,
        ownedQualified: totalShort.ownedQualified,
        totalShortfall: totalShort.totalShortfall,
        starShortfall: totalShort.starShortfall,
        shortfall: totalShort.shortfall
      } : null
    };
  });

  expect(data.added).toBeTruthy();
  expect(data.before.reqStar).toBe(7);
  expect(data.before.needed).toBe(2);
  expect(data.before.qualifiedNeeded).toBe(1);
  expect(data.before.ownedTotal).toBe(2);
  expect(data.before.ownedQualified).toBe(0);
  expect(data.before.totalShortfall).toBe(0);
  expect(data.before.starShortfall).toBe(1);
  expect(data.before.shortfall).toBe(1);
  expect(data.before.methodKey).toBe('improve');

  expect(data.ready.ownedTotal).toBe(2);
  expect(data.ready.ownedQualified).toBe(1);
  expect(data.ready.shortfall).toBe(0);
  expect(data.ready.status).toBe('ready');

  expect(data.totalShort.ownedTotal).toBe(1);
  expect(data.totalShort.ownedQualified).toBe(1);
  expect(data.totalShort.totalShortfall).toBe(1);
  expect(data.totalShort.starShortfall).toBe(0);
  expect(data.totalShort.shortfall).toBe(1);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('KanColle game data import syncs ships equipment resources and fleets without storing auth data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const secret = 'DO_NOT_STORE_TOKEN_12345';

    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'manual-meta', name:'41cm連装砲', category:'大口径主砲', count:99, star:4, targetStar:10, assigned:'長門改二', memo:'手動メモを保持' }
    ]));
    localStorage.setItem('harbordesk-ship-roster-v1', '[]');
    localStorage.removeItem('harbordesk-kancolle-sync-v1');
    localStorage.removeItem('harbordesk-kancolle-fleets-v1');
    localStorage.removeItem('harbordesk-kancolle-materials-v1');
    localStorage.removeItem('harbordesk-kancolle-equipment-detail-v1');

    const bundle = {
      format:'harbordesk-kancolle-import',
      api_token:secret,
      endpoints:{
        '/kcsapi/api_port/port':{
          api_result:1,
          api_result_msg:'成功',
          api_data:{
            api_ship:[{
              api_id:9001,
              api_ship_id:541,
              api_lv:99,
              api_nowhp:91,
              api_maxhp:91,
              api_cond:49,
              api_locked:1,
              api_sally_area:0,
              api_slot:[5001,-1,-1,-1,-1],
              api_slot_ex:-1
            }],
            api_deck_port:[{
              api_id:1,
              api_name:'第一艦隊',
              api_mission:[0,0,0,0],
              api_ship:[9001,-1,-1,-1,-1,-1]
            }],
            api_material:[
              {api_id:1,api_value:12345},
              {api_id:2,api_value:23456},
              {api_id:3,api_value:34567},
              {api_id:4,api_value:45678},
              {api_id:5,api_value:50},
              {api_id:6,api_value:60},
              {api_id:7,api_value:70},
              {api_id:8,api_value:80}
            ]
          }
        },
        '/kcsapi/api_get_member/slot_item':{
          api_result:1,
          api_result_msg:'成功',
          api_data:[
            {api_id:5001,api_slotitem_id:8,api_level:4,api_alv:0},
            {api_id:5002,api_slotitem_id:8,api_level:0,api_alv:0}
          ]
        }
      }
    };

    const preview = window.hdKcPreviewData?.(window.hdKcParseImport?.(JSON.stringify(bundle)));
    const sync = window.hdKcApplyImport?.(preview,{ships:true,equipment:true,resources:true,fleets:true});

    const roster = JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]');
    const equipment = JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');
    const app = JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'{}');
    const materials = JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}');
    const fleets = JSON.parse(localStorage.getItem('harbordesk-kancolle-fleets-v1')||'[]');

    const star4 = equipment.find(x=>x.name==='41cm連装砲'&&Number(x.star)===4);
    const star0 = equipment.find(x=>x.name==='41cm連装砲'&&Number(x.star)===0);

    let secretStored=false;
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      const value=key?localStorage.getItem(key):'';
      if(String(value||'').includes(secret)){secretStored=true;break}
    }

    localStorage.setItem('harbordesk-ship-roster-v1','[]');
    localStorage.setItem('harbordesk-equipment-v1','[]');
    localStorage.removeItem('harbordesk-kancolle-sync-v1');
    localStorage.removeItem('harbordesk-kancolle-fleets-v1');
    localStorage.removeItem('harbordesk-kancolle-materials-v1');
    localStorage.removeItem('harbordesk-kancolle-equipment-detail-v1');

    return {
      preview:{
        ships:preview?.ships,
        slotItems:preview?.slotItems,
        materials:preview?.materials,
        decks:preview?.decks,
        completeShips:preview?.completeShips,
        completeSlotItems:preview?.completeSlotItems
      },
      sync,
      roster:roster.map(x=>({
        name:x.name,
        masterId:x.masterId,
        gameShipId:x.gameShipId,
        level:x.level,
        gear:x.gear,
        hp:x.gameHp,
        maxHp:x.gameMaxHp,
        cond:x.gameCond,
        source:x.source
      })),
      star4:star4?{count:star4.count,memo:star4.memo,assigned:star4.assigned,masterEquipId:star4.masterEquipId,source:star4.source}:null,
      star0:star0?{count:star0.count,masterEquipId:star0.masterEquipId,source:star0.source}:null,
      resources:app.resources||{},
      materials,
      fleets,
      secretStored
    };
  });

  expect(data.preview.ships).toBe(1);
  expect(data.preview.slotItems).toBe(2);
  expect(data.preview.materials).toBe(8);
  expect(data.preview.decks).toBe(1);
  expect(data.preview.completeShips).toBeTruthy();
  expect(data.preview.completeSlotItems).toBeTruthy();

  expect(data.roster[0]).toEqual(expect.objectContaining({
    name:'長門改二',
    masterId:541,
    gameShipId:9001,
    level:99,
    hp:91,
    maxHp:91,
    cond:49,
    source:'kancolle-import'
  }));
  expect(data.roster[0].gear).toContain('41cm連装砲 ★4');

  expect(data.star4).toEqual(expect.objectContaining({
    count:1,
    memo:'手動メモを保持',
    assigned:'長門改二',
    masterEquipId:8,
    source:'kancolle-import'
  }));
  expect(data.star0).toEqual(expect.objectContaining({
    count:1,
    masterEquipId:8,
    source:'kancolle-import'
  }));

  expect(data.resources).toEqual(expect.objectContaining({
    fuel:12345,
    ammo:23456,
    steel:34567,
    bauxite:45678
  }));
  expect(data.materials).toEqual(expect.objectContaining({
    instantBuild:50,
    bucket:60,
    devMaterial:70,
    screw:80
  }));

  expect(data.fleets[0].name).toBe('第一艦隊');
  expect(data.fleets[0].ships[0]).toEqual(expect.objectContaining({
    gameShipId:9001,
    masterId:541,
    name:'長門改二',
    level:99
  }));
  expect(data.secretStored).toBeFalsy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('KanColle importer accepts raw svdata material response', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const raw = 'svdata=' + JSON.stringify({
      api_result:1,
      api_result_msg:'成功',
      api_data:[
        {api_id:1,api_value:111},
        {api_id:2,api_value:222},
        {api_id:3,api_value:333},
        {api_id:4,api_value:444}
      ]
    });
    const parsed = window.hdKcParseImport?.(raw);
    const preview = window.hdKcPreviewData?.(parsed);
    return {
      materials:preview?.materials||0,
      fuel:parsed?.materials?.get?.(1)?.api_value||0,
      ammo:parsed?.materials?.get?.(2)?.api_value||0
    };
  });

  expect(data.materials).toBe(4);
  expect(data.fuel).toBe(111);
  expect(data.ammo).toBe(222);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('partial KanColle equipment sync keeps previously synced untouched stacks', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'kc-equip-8-4', name:'41cm連装砲', category:'大口径主砲', count:1, star:4, masterEquipId:8, source:'kancolle-import' },
      { id:'kc-equip-9-0', name:'46cm三連装砲', category:'大口径主砲', count:2, star:0, masterEquipId:9, source:'kancolle-import' }
    ]));
    localStorage.setItem('harbordesk-kancolle-equipment-detail-v1', JSON.stringify([
      {gameEquipId:5001,masterEquipId:8,star:4,alv:0},
      {gameEquipId:6001,masterEquipId:9,star:0,alv:0},
      {gameEquipId:6002,masterEquipId:9,star:0,alv:0}
    ]));

    const parsed = window.hdKcParseImport?.(JSON.stringify({
      api_result:1,
      api_result_msg:'成功',
      api_data:[
        {api_id:5001,api_slotitem_id:8,api_level:6,api_alv:0}
      ]
    }));
    parsed.completeSlotItems = false;
    const count = window.hdKcMergeEquipment?.(parsed);

    const equipment = JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]');
    const details = JSON.parse(localStorage.getItem('harbordesk-kancolle-equipment-detail-v1')||'[]');

    const result = {
      count,
      stacks:equipment.map(x=>({name:x.name,star:x.star,count:x.count,masterEquipId:x.masterEquipId})).sort((a,b)=>a.masterEquipId-b.masterEquipId||a.star-b.star),
      details:details.sort((a,b)=>a.gameEquipId-b.gameEquipId)
    };

    localStorage.setItem('harbordesk-equipment-v1','[]');
    localStorage.removeItem('harbordesk-kancolle-equipment-detail-v1');
    return result;
  });

  expect(data.stacks).toEqual(expect.arrayContaining([
    expect.objectContaining({name:'41cm連装砲',star:6,count:1,masterEquipId:8}),
    expect.objectContaining({name:'46cm三連装砲',star:0,count:2,masterEquipId:9})
  ]));
  expect(data.stacks.some(x=>x.name==='41cm連装砲'&&Number(x.star)===4)).toBeFalsy();
  expect(data.details).toEqual(expect.arrayContaining([
    expect.objectContaining({gameEquipId:5001,masterEquipId:8,star:6}),
    expect.objectContaining({gameEquipId:6001,masterEquipId:9,star:0}),
    expect.objectContaining({gameEquipId:6002,masterEquipId:9,star:0})
  ]));

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('passive KanColle capture records minimized response without request token', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const realFetch = window.fetch;
    const secret = 'SECRET_API_TOKEN_SHOULD_NOT_APPEAR';
    window.fetch = async () => new Response('svdata=' + JSON.stringify({
      api_result:1,
      api_result_msg:'成功',
      api_data:{
        api_ship:[{api_id:9001,api_ship_id:541,api_lv:99,api_slot:[],api_slot_ex:-1}],
        api_deck_port:[{api_id:1,api_name:'第一艦隊',api_ship:[9001,-1,-1,-1,-1,-1],api_mission:[0,0,0,0]}],
        api_ndock:[{api_id:1,api_state:1,api_ship_id:9001,api_complete_time:Date.now()+60000}],
        api_material:[{api_id:1,api_value:999}],
        api_basic:{api_nickname:'SHOULD_BE_DROPPED'},
        api_extra_secret:'SHOULD_BE_DROPPED'
      }
    }), {status:200,headers:{'content-type':'text/plain'}});

    eval(window.hdKcCaptureSource?.() || '');
    await window.fetch('/kcsapi/api_port/port', {
      method:'POST',
      body:'api_verno=1&api_token=' + encodeURIComponent(secret)
    });
    await new Promise(r=>setTimeout(r,20));

    const bundle = window.__HD_KC_CAPTURE?.exportObject?.();
    const text = JSON.stringify(bundle||{});
    const preview = window.hdKcPreviewData?.(window.hdKcParseImport?.(text));
    const payload = bundle?.records?.[0]?.payload?.api_data || {};

    window.__HD_KC_CAPTURE?.restore?.();
    window.fetch = realFetch;

    return {
      recordCount:bundle?.records?.length||0,
      endpoint:bundle?.records?.[0]?.endpoint||'',
      hasSecret:text.includes(secret),
      hasNickname:text.includes('SHOULD_BE_DROPPED'),
      keys:Object.keys(payload).sort(),
      ships:preview?.ships||0,
      materials:preview?.materials||0,
      decks:preview?.decks||0,
      docks:preview?.docks||0
    };
  });

  expect(data.recordCount).toBe(1);
  expect(data.endpoint).toBe('/kcsapi/api_port/port');
  expect(data.hasSecret).toBeFalsy();
  expect(data.hasNickname).toBeFalsy();
  expect(data.keys).toEqual(['api_deck_port','api_material','api_ndock','api_ship']);
  expect(data.ships).toBe(1);
  expect(data.materials).toBe(1);
  expect(data.decks).toBe(1);
  expect(data.docks).toBe(1);

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('synced in-game fleet keeps gear and copies into selected map custom fleet', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-kancolle-fleets-v1');
    localStorage.removeItem('harbordesk-custom-fleets-v1');

    const parsed = window.hdKcParseImport?.(JSON.stringify({
      format:'harbordesk-kancolle-import',
      endpoints:{
        '/kcsapi/api_port/port':{
          api_result:1,
          api_result_msg:'成功',
          api_data:{
            api_ship:[{
              api_id:9001,
              api_ship_id:541,
              api_lv:99,
              api_slot:[5001,-1,-1,-1,-1],
              api_slot_ex:-1
            }],
            api_deck_port:[{
              api_id:1,
              api_name:'第一艦隊',
              api_mission:[0,0,0,0],
              api_ship:[9001,-1,-1,-1,-1,-1]
            }],
            api_material:[]
          }
        },
        '/kcsapi/api_get_member/slot_item':{
          api_result:1,
          api_result_msg:'成功',
          api_data:[
            {api_id:5001,api_slotitem_id:8,api_level:4,api_alv:0}
          ]
        }
      }
    }));

    const count = window.hdKcApplyDecks?.(parsed);
    const gameFleets = window.hdKcCurrentFleets?.() || [];
    const copied = window.hdKcCopyFleetToCustom?.(1,'5-5');
    const custom = JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}');

    const result = {
      count,
      gameFleet:gameFleets[0]||null,
      copied,
      customFleet:custom['5-5']?.[0]||null
    };

    localStorage.removeItem('harbordesk-kancolle-fleets-v1');
    localStorage.removeItem('harbordesk-custom-fleets-v1');
    return result;
  });

  expect(data.count).toBe(1);
  expect(data.gameFleet.name).toBe('第一艦隊');
  expect(data.gameFleet.ships[0]).toEqual(expect.objectContaining({
    name:'長門改二',
    masterId:541,
    level:99
  }));
  expect(data.gameFleet.ships[0].gear).toContain('41cm連装砲 ★4');

  expect(data.customFleet).toEqual(expect.objectContaining({
    name:'ゲーム同期｜第一艦隊',
    source:'kancolle-import',
    sourceDeckId:1
  }));
  expect(data.customFleet.ships[0]).toEqual(expect.objectContaining({
    ship:'長門改二',
    masterId:541
  }));
  expect(data.customFleet.ships[0].gear).toContain('41cm連装砲 ★4');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('KanColle timer sync imports expeditions and repair docks while preserving manual timers', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions:[{id:'manual-exp',name:'手動遠征',endsAt:now+900000}],
      docks:[{id:'manual-dock',name:'手動入渠',endsAt:now+1200000}],
      quests:[],
      resources:{}
    }));

    const bundle = {
      format:'harbordesk-kancolle-import',
      endpoints:{
        '/kcsapi/api_port/port':{
          api_result:1,
          api_result_msg:'成功',
          api_data:{
            api_ship:[{
              api_id:9001,
              api_ship_id:541,
              api_lv:99,
              api_slot:[],
              api_slot_ex:-1
            }],
            api_deck_port:[
              {api_id:1,api_name:'第一艦隊',api_ship:[9001,-1,-1,-1,-1,-1],api_mission:[0,0,0,0]},
              {api_id:2,api_name:'第二艦隊',api_ship:[-1,-1,-1,-1,-1,-1],api_mission:[1,5,now+1800000,0]}
            ],
            api_ndock:[
              {api_id:1,api_state:1,api_ship_id:9001,api_complete_time:now+600000},
              {api_id:2,api_state:0,api_ship_id:0,api_complete_time:0}
            ],
            api_material:[]
          }
        }
      }
    };

    const parsed = window.hdKcParseImport?.(JSON.stringify(bundle));
    const preview = window.hdKcPreviewData?.(parsed);
    const sync = window.hdKcApplyImport?.(preview,{
      ships:false,
      equipment:false,
      resources:false,
      fleets:false,
      timers:true
    });

    const app = JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'{}');
    const gameExp = (app.expeditions||[]).find(x=>x.source==='kancolle-import');
    const gameDock = (app.docks||[]).find(x=>x.source==='kancolle-import');

    const result = {
      preview:{
        expeditions:preview?.expeditions||0,
        docks:preview?.docks||0
      },
      sync,
      expeditions:(app.expeditions||[]).map(x=>({id:x.id,name:x.name,fleetNo:x.fleetNo,expeditionId:x.expeditionId,source:x.source||'',endsAt:x.endsAt})),
      docks:(app.docks||[]).map(x=>({id:x.id,name:x.name,dockNo:x.dockNo,gameShipId:x.gameShipId,source:x.source||'',endsAt:x.endsAt})),
      gameExp,
      gameDock
    };

    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({expeditions:[],docks:[],quests:[],resources:{}}));
    return result;
  });

  expect(data.preview.expeditions).toBe(1);
  expect(data.preview.docks).toBe(1);
  expect(data.sync.expeditions).toBe(1);
  expect(data.sync.docks).toBe(1);

  expect(data.expeditions).toEqual(expect.arrayContaining([
    expect.objectContaining({id:'manual-exp',name:'手動遠征'}),
    expect.objectContaining({id:'kc-exp-2',fleetNo:2,source:'kancolle-import'})
  ]));
  expect(data.gameExp.name).toContain('海上護衛任務');

  expect(data.docks).toEqual(expect.arrayContaining([
    expect.objectContaining({id:'manual-dock',name:'手動入渠'}),
    expect.objectContaining({id:'kc-dock-1',dockNo:1,gameShipId:9001,source:'kancolle-import'})
  ]));
  expect(data.gameDock.name).toContain('長門改二');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('KanColle quest sync merges active quest pages while preserving manual quests', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions:[],
      docks:[],
      quests:[
        {id:'manual-quest',name:'手動任務',done:false},
        {id:'kc-quest-999',name:'古いゲーム任務',done:false,questNo:999,source:'kancolle-import'}
      ],
      resources:{}
    }));

    const bundle = {
      format:'harbordesk-kancolle-import',
      records:[
        {
          endpoint:'/kcsapi/api_get_member/questlist',
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_count:3,
              api_page_count:2,
              api_disp_page:1,
              api_list:[
                {api_no:214,api_category:2,api_type:2,api_label_type:3,api_state:2,api_title:'あ号作戦',api_detail:'テスト詳細A',api_progress_flag:1,api_invalid_flag:0},
                {api_no:220,api_category:2,api_type:2,api_label_type:3,api_state:1,api_title:'い号作戦',api_detail:'テスト詳細B',api_progress_flag:0,api_invalid_flag:0}
              ]
            }
          }
        },
        {
          endpoint:'/kcsapi/api_get_member/questlist',
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_count:3,
              api_page_count:2,
              api_disp_page:2,
              api_list:[
                {api_no:221,api_category:2,api_type:2,api_label_type:3,api_state:3,api_title:'ろ号作戦',api_detail:'テスト詳細C',api_progress_flag:2,api_invalid_flag:0}
              ]
            }
          }
        }
      ]
    };

    const parsed = window.hdKcParseImport?.(JSON.stringify(bundle));
    const preview = window.hdKcPreviewData?.(parsed);
    const sync = window.hdKcApplyImport?.(preview,{
      ships:false,
      equipment:false,
      resources:false,
      fleets:false,
      timers:false,
      quests:true
    });
    const app = JSON.parse(localStorage.getItem('harbordesk-pwa-v1')||'{}');

    const result = {
      preview:{quests:preview?.quests||0,activeQuests:preview?.activeQuests||0,completeQuests:!!preview?.completeQuests},
      sync,
      quests:(app.quests||[]).map(q=>({id:q.id,name:q.name,done:q.done,questNo:q.questNo,questState:q.questState,progressFlag:q.progressFlag,source:q.source||''}))
    };

    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({expeditions:[],docks:[],quests:[],resources:{}}));
    return result;
  });

  expect(data.preview).toEqual({quests:3,activeQuests:2,completeQuests:true});
  expect(data.sync.quests).toBe(2);
  expect(data.quests).toEqual(expect.arrayContaining([
    expect.objectContaining({id:'manual-quest',name:'手動任務'}),
    expect.objectContaining({id:'kc-quest-214',name:'あ号作戦',done:false,questNo:214,questState:2,progressFlag:1,source:'kancolle-import'}),
    expect.objectContaining({id:'kc-quest-221',name:'ろ号作戦',done:true,questNo:221,questState:3,progressFlag:2,source:'kancolle-import'})
  ]));
  expect(data.quests.some(q=>q.id==='kc-quest-220')).toBeFalsy();
  expect(data.quests.some(q=>q.id==='kc-quest-999')).toBeFalsy();

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('KanColle sortie sync maps node letters, links drop hunt, and avoids duplicate import', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    localStorage.setItem('harbordesk-drop-hunts-v1', JSON.stringify([
      {id:'hunt-ooi-23e',ship:'大井',map:'2-3',node:'E',runs:0,s:0,a:0,obtained:false}
    ]));

    const bundle = {
      format:'harbordesk-kancolle-import',
      version:2,
      captureId:'test-capture-sortie-1',
      createdAt:'2026-09-19T08:40:00.000Z',
      records:[
        {
          endpoint:'/kcsapi/api_req_map/start',
          at:1000,
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_maparea_id:2,
              api_mapinfo_no:3,
              api_no:1,
              api_color_no:4,
              api_event_id:4,
              api_event_kind:1,
              api_bosscell_no:10
            }
          }
        },
        {
          endpoint:'/kcsapi/api_req_sortie/battleresult',
          at:2000,
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_win_rank:'S',
              api_quest_name:'東部オリョール海',
              api_get_ship:null
            }
          }
        },
        {
          endpoint:'/kcsapi/api_req_map/next',
          at:3000,
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_maparea_id:2,
              api_mapinfo_no:3,
              api_no:5,
              api_color_no:4,
              api_event_id:4,
              api_event_kind:1,
              api_bosscell_no:10
            }
          }
        },
        {
          endpoint:'/kcsapi/api_req_sortie/battleresult',
          at:4000,
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_win_rank:'A',
              api_quest_name:'東部オリョール海',
              api_get_ship:{
                api_ship_id:24,
                api_ship_name:'大井'
              }
            }
          }
        },
        {
          endpoint:'/kcsapi/api_port/port',
          at:5000,
          payload:{
            api_result:1,
            api_result_msg:'成功',
            api_data:{
              api_ship:[],
              api_deck_port:[],
              api_ndock:[],
              api_material:[]
            }
          }
        }
      ]
    };

    const parsed = window.hdKcParseImport?.(JSON.stringify(bundle));
    const preview = window.hdKcPreviewData?.(parsed);
    const opts = {ships:false,equipment:false,resources:false,fleets:false,timers:false,quests:false,sorties:true};
    const first = window.hdKcApplyImport?.(preview,opts);
    const second = window.hdKcApplyImport?.(preview,opts);
    const rows = JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]');
    const hunts = JSON.parse(localStorage.getItem('harbordesk-drop-hunts-v1')||'[]');

    const result = {
      labels:{
        map23node5:window.hdKcNodeLabel?.('2-3',5),
        map35node1:window.hdKcNodeLabel?.('3-5',1),
        map61node1:window.hdKcNodeLabel?.('6-1',1)
      },
      preview:{sortieStarts:preview?.sortieStarts||0,battleResults:preview?.battleResults||0},
      firstSorties:first?.sorties||0,
      secondSorties:second?.sorties||0,
      rows:rows.map(x=>({
        map:x.map,
        node:x.node,
        result:x.result,
        boss:x.boss,
        retreat:x.retreat,
        battles:x.battles,
        drop:x.drop,
        huntId:x.huntId,
        huntShip:x.huntShip,
        targetObtained:x.targetObtained,
        source:x.source,
        gameSortieKey:x.gameSortieKey,
        gameNodeNo:x.gameNodeNo,
        gameNodeLabel:x.gameNodeLabel,
        gameBossCellNo:x.gameBossCellNo,
        gameBossCellLabel:x.gameBossCellLabel,
        gameRouteNodes:x.gameRouteNodes,
        gameRouteLabels:x.gameRouteLabels,
        gameBattleResults:x.gameBattleResults
      })),
      hunt:hunts[0]||null
    };

    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    localStorage.setItem('harbordesk-drop-hunts-v1','[]');
    return result;
  });

  expect(data.labels).toEqual({map23node5:'E',map35node1:'B',map61node1:'B'});
  expect(data.preview).toEqual({sortieStarts:1,battleResults:2});
  expect(data.firstSorties).toBe(1);
  expect(data.secondSorties).toBe(0);
  expect(data.rows).toHaveLength(1);
  expect(data.rows[0]).toEqual(expect.objectContaining({
    map:'2-3',
    node:'E',
    result:'A',
    boss:false,
    retreat:true,
    battles:2,
    drop:'大井',
    huntId:'hunt-ooi-23e',
    huntShip:'大井',
    targetObtained:true,
    source:'kancolle-import',
    gameSortieKey:'kc-sortie-at-1000',
    gameNodeNo:5,
    gameNodeLabel:'E',
    gameBossCellNo:10,
    gameBossCellLabel:'J'
  }));
  expect(data.rows[0].gameRouteNodes).toEqual([1,5]);
  expect(data.rows[0].gameRouteLabels).toEqual(['A','E']);
  expect(data.rows[0].gameBattleResults).toEqual([
    expect.objectContaining({nodeNo:1,nodeLabel:'A',rank:'S',drop:''}),
    expect.objectContaining({nodeNo:5,nodeLabel:'E',rank:'A',drop:'大井',dropShipId:24})
  ]);
  expect(data.hunt).toEqual(expect.objectContaining({
    id:'hunt-ooi-23e',
    runs:1,
    s:0,
    a:1,
    obtained:true
  }));

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Sortie analytics includes game sync and manual logs by map', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','map');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','all');
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {
        id:'g1',at:3000,map:'2-3',node:'J ボス',result:'S',boss:true,retreat:false,battles:3,drop:'大井',
        source:'kancolle-import',gameSortieKey:'g1',gameNodeLabel:'J',gameRouteLabels:['A','D','J'],
        fuel:0,ammo:0,steel:0,bauxite:0,buckets:0
      },
      {
        id:'g2',at:2000,map:'2-3',node:'J ボス',result:'A',boss:true,retreat:false,battles:3,drop:'',
        source:'kancolle-import',gameSortieKey:'g2',gameNodeLabel:'J',gameRouteLabels:['B','E','J'],
        fuel:0,ammo:0,steel:0,bauxite:0,buckets:0
      },
      {
        id:'m1',at:1000,map:'2-3',node:'E',result:'撤退',boss:false,retreat:true,battles:2,drop:'',
        fuel:50,ammo:40,steel:0,bauxite:0,buckets:1
      },
      {
        id:'s1',at:4000,map:'3-5',node:'K ボス',result:'S',boss:true,retreat:false,battles:4,drop:'天津風',
        sessionId:'ss1',fleetId:'fleet1',fleetName:'北方周回',strategy:'stable',strategyLabel:'安定重視',
        durationMs:600000,readinessSnapshot:{autoOk:3,autoTotal:3,manualDone:2,manualTotal:2},
        fuel:120,ammo:100,steel:10,bauxite:20,buckets:0
      }
    ]));

    const logs = window.hdSPALogs?.() || [];
    const rows = window.hdSPARows?.() || [];
    const r23 = rows.find(x => x.key === '2-3');
    const r35 = rows.find(x => x.key === '3-5');
    const html = window.hdSPAHtml?.() || '';

    const result = {
      logCount: logs.length,
      rowCount: rows.length,
      r23: r23 ? {
        label:r23.label,
        maps:r23.maps,
        metrics:r23.metrics,
        drops:r23.dropStats
      } : null,
      r35: r35 ? {
        label:r35.label,
        metrics:r35.metrics,
        drops:r35.dropStats
      } : null,
      htmlChecks:{
        hasMapMode:html.includes('海域別'),
        hasDropHistory:html.includes('ドロップ履歴'),
        hasGameSync:html.includes('ゲーム同期'),
        hasOoi:html.includes('大井'),
        hasAmatsukaze:html.includes('天津風')
      }
    };

    localStorage.removeItem('harbordesk-sortie-analytics-mode-v1');
    localStorage.removeItem('harbordesk-sortie-analytics-map-v1');
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    return result;
  });

  expect(data.logCount).toBe(4);
  expect(data.rowCount).toBe(2);
  expect(data.r23.label).toContain('2-3');
  expect(data.r23.maps).toEqual(['2-3']);
  expect(data.r23.metrics).toEqual(expect.objectContaining({
    n:3,
    bossRate:67,
    sRate:33,
    winRate:67,
    retreatRate:33,
    dropRate:33,
    drops:1,
    uniqueDrops:1,
    avgResource:90,
    avgBuckets:1,
    sourceStats:{game:2,session:0,manual:1}
  }));
  expect(data.r23.drops.count).toBe(1);
  expect(data.r23.drops.unique).toBe(1);
  expect(data.r23.drops.top).toEqual([{ship:'大井',count:1}]);
  expect(data.r23.drops.recent[0]).toEqual(expect.objectContaining({ship:'大井',map:'2-3',result:'S',source:'game'}));

  expect(data.r35.metrics).toEqual(expect.objectContaining({
    n:1,
    bossRate:100,
    sRate:100,
    winRate:100,
    retreatRate:0,
    dropRate:100,
    uniqueDrops:1,
    avgResource:250,
    avgBuckets:0,
    avgDurationMin:10,
    avgReadiness:100,
    sourceStats:{game:0,session:1,manual:0}
  }));
  expect(data.r35.drops.top).toEqual([{ship:'天津風',count:1}]);

  expect(data.htmlChecks).toEqual({
    hasMapMode:true,
    hasDropHistory:true,
    hasGameSync:true,
    hasOoi:true,
    hasAmatsukaze:true
  });
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Sortie analytics finds dangerous nodes and route performance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','map');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','2-3');
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {
        id:'route1',at:3000,map:'2-3',node:'J ボス',result:'S',boss:true,retreat:false,drop:'大井',
        source:'kancolle-import',gameRouteLabels:['A','D','J'],
        gameBattleResults:[
          {nodeLabel:'A',rank:'S',drop:''},
          {nodeLabel:'D',rank:'A',drop:''},
          {nodeLabel:'J',rank:'S',drop:'大井',dropShipId:24}
        ]
      },
      {
        id:'route2',at:2000,map:'2-3',node:'E',result:'C',boss:false,retreat:true,drop:'',
        source:'kancolle-import',gameRouteLabels:['A','D','E'],
        gameBattleResults:[
          {nodeLabel:'A',rank:'S',drop:''},
          {nodeLabel:'D',rank:'B',drop:''},
          {nodeLabel:'E',rank:'C',drop:''}
        ]
      },
      {
        id:'route3',at:1000,map:'2-3',node:'J ボス',result:'A',boss:true,retreat:false,drop:'',
        source:'kancolle-import',gameRouteLabels:['B','E','J'],
        gameBattleResults:[
          {nodeLabel:'B',rank:'S',drop:''},
          {nodeLabel:'E',rank:'A',drop:''},
          {nodeLabel:'J',rank:'A',drop:''}
        ]
      }
    ]));

    const rows = window.hdSPARows?.() || [];
    const row = rows[0] || null;
    const html = window.hdSPAHtml?.() || '';

    const result = {
      nodeStats: row?.nodeStats || [],
      routeStats: row?.routeStats || [],
      htmlChecks:{
        hasNodeTitle:html.includes('マス別分析'),
        hasRouteTitle:html.includes('ルート別分析'),
        hasDangerNode:html.includes('撤退 50%'),
        hasRouteText:html.includes('A→D→J')
      }
    };

    localStorage.removeItem('harbordesk-sortie-analytics-mode-v1');
    localStorage.removeItem('harbordesk-sortie-analytics-map-v1');
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    return result;
  });

  const byNode = Object.fromEntries(data.nodeStats.map(x => [x.node, x]));
  expect(byNode.E).toEqual(expect.objectContaining({
    visits:2,
    battles:2,
    retreats:1,
    retreatRate:50,
    sRate:0,
    aRate:50,
    bRate:0
  }));
  expect(byNode.J).toEqual(expect.objectContaining({
    visits:2,
    battles:2,
    retreats:0,
    retreatRate:0,
    sRate:50,
    aRate:50,
    drops:1
  }));
  expect(byNode.D).toEqual(expect.objectContaining({
    visits:2,
    battles:2,
    sRate:0,
    aRate:50,
    bRate:50
  }));

  const byRoute = Object.fromEntries(data.routeStats.map(x => [x.route, x]));
  expect(byRoute['A→D→J']).toEqual(expect.objectContaining({
    n:1,bossRate:100,retreatRate:0,sRate:100,dropRate:100
  }));
  expect(byRoute['A→D→E']).toEqual(expect.objectContaining({
    n:1,bossRate:0,retreatRate:100,sRate:0
  }));
  expect(byRoute['B→E→J']).toEqual(expect.objectContaining({
    n:1,bossRate:100,retreatRate:0,sRate:0,winRate:100
  }));

  expect(data.htmlChecks).toEqual({
    hasNodeTitle:true,
    hasRouteTitle:true,
    hasDangerNode:true,
    hasRouteText:true
  });
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Sortie analytics highlights risk trends and route differences', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','map');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','1-1');
    localStorage.setItem('harbordesk-sortie-analytics-window-v1','3');
    const mk=(id,at,route,result,boss,retreat)=>({
      id,at,map:'1-1',node:(route.at(-1)||'')+(boss?' ボス':''),result,boss,retreat,drop:'',
      source:'kancolle-import',gameRouteLabels:route,
      gameBattleResults:route.map((node,i)=>({nodeLabel:node,rank:i===route.length-1?result:'S',drop:''}))
    });
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      mk('old1',1000,['A','B'],'A',false,false),
      mk('old2',2000,['A','B'],'B',false,false),
      mk('old3',3000,['A','B'],'A',false,false),
      mk('new1',4000,['A','C'],'S',true,false),
      mk('new2',5000,['A','B'],'C',false,true),
      mk('new3',6000,['A','B'],'C',false,true)
    ]));

    const row=(window.hdSPARows?.()||[])[0]||null;
    const html=window.hdSPAHtml?.()||'';
    const result={
      danger:row?.dangerNodes||[],
      nodeTrend:row?.nodeTrend||null,
      routeComparison:row?.routeComparison||null,
      htmlChecks:{
        hasInsights:html.includes('攻略インサイト'),
        hasDanger:html.includes('危険マス'),
        hasWorse:html.includes('+100pt'),
        hasReference:html.includes('構造図最短（参考）'),
        hasActual:html.includes('最多実績'),
        hasDiff:html.includes('構造図最短と異なる')
      }
    };

    localStorage.removeItem('harbordesk-sortie-analytics-mode-v1');
    localStorage.removeItem('harbordesk-sortie-analytics-map-v1');
    localStorage.removeItem('harbordesk-sortie-analytics-window-v1');
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    return result;
  });

  expect(data.danger[0]).toEqual(expect.objectContaining({
    map:'1-1',node:'B',visits:5,retreats:2,retreatRate:40
  }));
  expect(data.nodeTrend.ready).toBe(true);
  const bTrend=data.nodeTrend.items.find(x=>x.node==='B');
  expect(bTrend).toEqual(expect.objectContaining({
    delta:100,recentRate:100,previousRate:0,recentVisits:2,previousVisits:3,
    recentRetreats:2,previousRetreats:0
  }));
  expect(data.routeComparison).toEqual(expect.objectContaining({
    map:'1-1',
    reference:['A','C'],
    referenceRoute:'A→C',
    matches:false
  }));
  expect(data.routeComparison.actual).toEqual(expect.objectContaining({
    route:'A→B',n:5,bossRate:0,retreatRate:40
  }));
  expect(data.routeComparison.referenceStats).toEqual(expect.objectContaining({
    route:'A→C',n:1,bossRate:100,sRate:100
  }));
  expect(data.htmlChecks).toEqual({
    hasInsights:true,
    hasDanger:true,
    hasWorse:true,
    hasReference:true,
    hasActual:true,
    hasDiff:true
  });
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Safari capture helper sends data directly to HarborDesk', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const posted = [];
    const originalOpen = window.open;
    window.open = () => ({
      postMessage(message, origin){
        posted.push({message, origin});
      }
    });

    const shortcut = window.hdKcCaptureShortcutScript?.() || '';
    const bookmarklet = window.hdKcCaptureBookmarklet?.() || '';

    window.hdKcCaptureBootstrap?.();
    const cap = window.__HD_KC_CAPTURE;
    cap?.capture(
      '/kcsapi/api_get_member/material?api_token=SECRET',
      'svdata=' + JSON.stringify({
        api_result:1,
        api_data:[{api_id:1,api_value:7654}]
      })
    );
    const sent = cap?.send?.() || false;
    await new Promise(r => setTimeout(r, 450));

    const panelText = document.getElementById('hd-kc-capture-panel')?.textContent || '';
    const recordCount = cap?.records?.length || 0;
    cap?.restore?.();
    window.open = originalOpen;

    return {
      shortcutStartsWithFunction: shortcut.startsWith('('),
      shortcutHasJavascriptPrefix: shortcut.startsWith('javascript:'),
      shortcutHasCompletion: shortcut.includes("completion('HarborDeskキャプチャを開始したよ')"),
      bookmarkletPrefix: bookmarklet.startsWith('javascript:'),
      sent,
      recordCount,
      panelHasDirectSend: panelText.includes('HarborDeskへ送る'),
      posted: posted.map(x => ({
        origin:x.origin,
        type:x.message?.type,
        format:x.message?.payload?.format,
        endpoint:x.message?.payload?.records?.[0]?.endpoint || '',
        material:x.message?.payload?.records?.[0]?.payload?.api_data?.[0]?.api_value || 0
      })),
      ui:{
        shortcutButton:!!document.querySelector('[data-hd-kc-copy-shortcut]'),
        guideText:document.querySelector('.hd-kc-capture-guide')?.textContent || ''
      }
    };
  });

  expect(data.shortcutStartsWithFunction).toBe(false);
  expect(data.shortcutHasJavascriptPrefix).toBe(false);
  expect(data.shortcutHasCompletion).toBe(true);
  expect(data.bookmarkletPrefix).toBe(true);
  expect(data.sent).toBe(true);
  expect(data.recordCount).toBe(1);
  expect(data.panelHasDirectSend).toBe(true);
  expect(data.posted.length).toBeGreaterThan(0);
  expect(data.posted[0]).toEqual({
    origin:'https://f96tbrt29n-cmyk.github.io',
    type:'harbordesk-kancolle-import',
    format:'harbordesk-kancolle-import',
    endpoint:'/kcsapi/api_get_member/material',
    material:7654
  });
  expect(data.ui.shortcutButton).toBe(true);
  expect(data.ui.guideText).toContain('共有 → HarborDeskキャプチャ');
  expect(data.ui.guideText).toContain('クリップボード貼り付けは不要');

  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Safari capture helper detects outer game iframe', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const frame=document.createElement('iframe');
    frame.id='game_frame';
    frame.src='https://game.example.invalid/kancolle/';
    frame.style.cssText='width:1200px;height:720px';
    document.body.appendChild(frame);

    window.hdKcCaptureBootstrap?.();
    const cap=window.__HD_KC_CAPTURE;
    const panel=document.getElementById('hd-kc-capture-panel');
    const result={
      mode:cap?.mode||'',
      frameCount:cap?.frameCount||0,
      frameUrl:cap?.frameUrl||'',
      panelText:panel?.textContent||'',
      hasOpenButton:!!panel?.querySelector('[data-hd-open-game]')
    };
    cap?.restore?.();
    frame.remove();
    return result;
  });

  expect(data.mode).toBe('outer');
  expect(data.frameCount).toBeGreaterThan(0);
  expect(data.frameUrl).toBe('https://game.example.invalid/kancolle/');
  expect(data.panelText).toContain('DMMの外側ページを検出したよ');
  expect(data.panelText).toContain('ゲーム本体を開く');
  expect(data.hasOpenButton).toBe(true);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});
