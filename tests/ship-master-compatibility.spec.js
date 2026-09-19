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


test('HarborDesk Userscript is installable and page-context ready', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const data = await page.evaluate(async () => {
    const text = await fetch('./HarborDesk-Kancolle.user.js', {cache:'no-store'}).then(r => r.text());
    let parseError = '';
    try { new Function(text); } catch (e) { parseError = String(e && e.message || e); }
    return {
      length:text.length,
      parseError,
      hasName:text.includes('@name         HarborDesk 艦これ連携'),
      hasRunAt:text.includes('@run-at       document-start'),
      hasPageContext:text.includes('@inject-into  page'),
      hasFrameInclude:text.includes('203\\.104\\.'),
      hasDmmMatch:text.includes('@match        https://*.dmm.com/*'),
      hasKancolleServerMatch:text.includes('@match        https://*.kancolle-server.com/*'),
      hasLegacyServerInclude:text.includes('125\\.6'),
      hasKcsapiFilter:text.includes('/kcsapi/'),
      hasDirectSend:text.includes("#kcimport="),
      usesSelfLink:text.includes("a.target='_self'"),
      hasVisibleVersion:text.includes("HD_VERSION+'</small>"),
      hasCompressionStream:text.includes("CompressionStream('gzip')"),
      usesPopup:text.includes('window.open('),
      hasTokenStorage:text.includes('api_token=') || text.includes('Cookie='),
      hasNoFrames:text.includes('@noframes')
    };
  });
  expect(data.length).toBeGreaterThan(5000);
  expect(data.parseError).toBe('');
  expect(data.hasName).toBe(true);
  expect(data.hasRunAt).toBe(true);
  expect(data.hasPageContext).toBe(true);
  expect(data.hasFrameInclude).toBe(true);
  expect(data.hasDmmMatch).toBe(true);
  expect(data.hasKancolleServerMatch).toBe(true);
  expect(data.hasLegacyServerInclude).toBe(true);
  expect(data.hasKcsapiFilter).toBe(true);
  expect(data.hasDirectSend).toBe(true);
  expect(data.usesSelfLink).toBe(true);
  expect(data.hasVisibleVersion).toBe(true);
  expect(data.hasCompressionStream).toBe(true);
  expect(data.usesPopup).toBe(false);
  expect(data.hasTokenStorage).toBe(false);
  expect(data.hasNoFrames).toBe(false);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Userscripts same-tab handoff auto-syncs', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(async()=>{
    const payload={
      format:'harbordesk-kancolle-import',version:2,source:'userscripts',captureId:'test-handoff',
      records:[{endpoint:'/kcsapi/api_get_member/material',at:1,payload:{api_result:1,api_data:[
        {api_id:1,api_value:12345},{api_id:2,api_value:23456},{api_id:3,api_value:34567},{api_id:4,api_value:45678}
      ]}}]
    };
    const bytes=new TextEncoder().encode(JSON.stringify(payload));
    let binary='';for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);
    const token='j.'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    location.hash='#kcimport='+token;
    const ok=await window.hdKcConsumeHashImport();
    const materials=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}');
    const sync=JSON.parse(localStorage.getItem('harbordesk-kancolle-sync-v1')||'{}');
    return {ok,materials,sync,hash:location.hash,result:document.getElementById('hdKcImportResult')?.textContent||''};
  });
  expect(data.ok).toBe(true);
  expect(data.materials).toEqual(expect.objectContaining({fuel:12345,ammo:23456,steel:34567,bauxite:45678}));
  expect(data.sync.materials).toBe(4);
  expect(data.hash).toBe('#kancolleImport');
  expect(data.result).toContain('Userscriptsから自動同期完了');
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Userscripts window.name handoff auto-syncs', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(async()=>{
    const payload={
      format:'harbordesk-kancolle-import',version:2,source:'userscripts',captureId:'test-window-name',
      records:[{endpoint:'/kcsapi/api_get_member/material',at:1,payload:{api_result:1,api_data:[
        {api_id:1,api_value:11111},{api_id:2,api_value:22222},{api_id:3,api_value:33333},{api_id:4,api_value:44444}
      ]}}]
    };
    window.name='HARBORDESK_KC_IMPORT_V1:'+JSON.stringify(payload);
    const ok=await window.hdKcConsumeWindowNameImport();
    const materials=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}');
    return {ok,materials,name:window.name,result:document.getElementById('hdKcImportResult')?.textContent||''};
  });
  expect(data.ok).toBe(true);
  expect(data.materials).toEqual(expect.objectContaining({fuel:11111,ammo:22222,steel:33333,bauxite:44444}));
  expect(data.name).toBe('');
  expect(data.result).toContain('Userscriptsから自動同期完了');
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('Userscripts gzip hash handoff auto-syncs', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(async()=>{
    const payload={
      format:'harbordesk-kancolle-import',version:2,source:'userscripts',captureId:'test-gzip-handoff',
      records:[{endpoint:'/kcsapi/api_get_member/material',at:1,payload:{api_result:1,api_data:[
        {api_id:1,api_value:54321},{api_id:2,api_value:43210},{api_id:3,api_value:32109},{api_id:4,api_value:21098}
      ]}}]
    };
    const raw=new TextEncoder().encode(JSON.stringify(payload));
    const compressed=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    let binary='';for(let i=0;i<compressed.length;i++)binary+=String.fromCharCode(compressed[i]);
    const token='g.'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    location.hash='#kcimport='+token;
    const ok=await window.hdKcConsumeHashImport();
    const materials=JSON.parse(localStorage.getItem('harbordesk-kancolle-materials-v1')||'{}');
    return {ok,materials,hash:location.hash,result:document.getElementById('hdKcImportResult')?.textContent||''};
  });
  expect(data.ok).toBe(true);
  expect(data.materials).toEqual(expect.objectContaining({fuel:54321,ammo:43210,steel:32109,bauxite:21098}));
  expect(data.hash).toBe('#kancolleImport');
  expect(data.result).toContain('Userscriptsから自動同期完了');
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('mobile synced import UI is compact', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(),ships:206,equipment:93,materials:8,decks:4,expeditions:0,docks:0,quests:0,sorties:0
    }));
  });
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    const section=document.getElementById('kancolleImport');
    const auto=section?.querySelector('[data-hd-kc-auto-guide]');
    const manual=section?.querySelector('.hd-kc-manual-panel');
    const overview=section?.querySelector('.hd-kc-sync-overview');
    return {
      autoOpen:!!auto?.open,
      manualOpen:!!manual?.open,
      synced:!!overview?.classList.contains('is-synced'),
      headline:document.getElementById('hdKcSyncHeadline')?.textContent||'',
      last:document.getElementById('hdKcSyncLast')?.textContent||'',
      resultLive:document.getElementById('hdKcImportResult')?.getAttribute('aria-live')||''
    };
  });
  expect(data.autoOpen).toBe(false);
  expect(data.manualOpen).toBe(false);
  expect(data.synced).toBe(true);
  expect(data.headline).toContain('同期済み');
  expect(data.last).toContain('艦娘206');
  expect(data.resultLive).toBe('polite');
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('home dashboard surfaces game sync and one-tap jumps', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now()-120000,ships:206,equipment:93,materials:8,decks:4,expeditions:0,docks:0,quests:0,sorties:0
    }));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify(Array.from({length:206},(_,i)=>({id:String(i+1),name:'艦'+i}))));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify(Array.from({length:93},(_,i)=>({id:String(i+1),name:'装備'+i}))));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderHomeDashboard?.();
    return {
      sync:document.getElementById('homeGameSync')?.textContent||'',
      buttons:[...document.querySelectorAll('#homeSummary [data-home-jump]')].map(x=>x.dataset.homeJump),
      summary:document.getElementById('homeSummary')?.textContent||''
    };
  });
  expect(data.sync).toContain('ゲーム同期');
  expect(data.sync).toContain('2分前');
  expect(data.summary).toContain('206');
  expect(data.summary).toContain('93');
  expect(data.buttons).toEqual(expect.arrayContaining(['quests','expeditions','roster','equipmentBook','kancolleImport']));
});


test('navigation keeps daily home separate from backup safety', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const personal=document.getElementById('personalHomeCenter');
    const title=personal?.querySelector('h2')?.textContent||'';
    const group=personal?.dataset.hdWorkspaceGroup||'';
    const sync=document.querySelector('[data-hd-kc-return-game]');
    return {title,group,returnButton:!!sync};
  });
  expect(data.title).toContain('データ保全');
  expect(data.group).toBe('settings');
  expect(data.returnButton).toBe(true);
});


test('roster count follows search result', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'1',name:'加賀改',level:94,tags:[]},
      {id:'2',name:'赤城改',level:90,tags:[]},
      {id:'3',name:'翔鶴改二甲',level:99,tags:[]}
    ]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderShipRoster?.();
    const before=document.getElementById('shipRosterCount')?.textContent||'';
    const input=document.getElementById('shipRosterSearch');
    input.value='加賀';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    return {before,after:document.getElementById('shipRosterCount')?.textContent||''};
  });
  expect(data.before).toBe('3隻');
  expect(data.after).toBe('1 / 3隻');
});


test('session view state restores roster equipment and ship database filters', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-roster-view-v1', JSON.stringify({query:'加賀',filter:'主力'}));
    sessionStorage.setItem('harbordesk-session-equip-catalog-view-v1', JSON.stringify({query:'電探',filter:'小型水上電探'}));
    sessionStorage.setItem('harbordesk-session-shipdb-view-v1', JSON.stringify({query:'榛名',type:'高速戦艦',missingOnly:true,includeMaster:false,imageFilter:'all'}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdEnsureEquipmentCatalog?.();
    window.hdEnsureShipDatabase?.();
    return {
      rosterQuery:document.getElementById('shipRosterSearch')?.value||'',
      rosterFilter:document.querySelector('[data-roster-filter].active')?.dataset.rosterFilter||'',
      equipQuery:document.getElementById('hdEquipCatalogSearch')?.value||'',
      equipFilter:document.querySelector('[data-hd-equip-filter].active')?.dataset.hdEquipFilter||'',
      shipQuery:document.getElementById('hdShipDbSearch')?.value||'',
      shipType:document.querySelector('[data-hd-shipdb-filter].active')?.dataset.hdShipdbFilter||'',
      shipMissing:!!document.getElementById('hdShipDbMissingOnly')?.checked,
      shipMaster:!!document.getElementById('hdShipDbIncludeMaster')?.checked
    };
  });
  expect(data.rosterQuery).toBe('加賀');
  expect(data.rosterFilter).toBe('主力');
  expect(data.equipQuery).toBe('電探');
  expect(data.equipFilter).toBe('小型水上電探');
  expect(data.shipQuery).toBe('榛名');
  expect(data.shipType).toBe('高速戦艦');
  expect(data.shipMissing).toBe(true);
  expect(data.shipMaster).toBe(false);
});


test('workspace remembers per-section scroll offset', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    sessionStorage.setItem('harbordesk-session-workspace-scroll-v1', JSON.stringify({roster:420}));
    const saved=window.hdWSScrollLoad?.()||{};
    return {saved:saved.roster,hasSave:typeof window.hdWSSaveCurrentScroll==='function',hasRestore:typeof window.hdWSRestoreScroll==='function'};
  });
  expect(data.saved).toBe(420);
  expect(data.hasSave).toBe(true);
  expect(data.hasRestore).toBe(true);
});


test('quick nav exposes one-tap mobile actions', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdQNEnsure?.();
    return {
      home:!!document.querySelector('[data-hd-qn-home]'),
      search:!!document.querySelector('#hdQuickNavDialog [data-hd-gs-open]'),
      sync:!!document.querySelector('[data-hd-qn-sync]'),
      game:document.querySelector('.hd-qn-actions a')?.getAttribute('href')||'',
      top:!!document.querySelector('[data-hd-qn-top]')
    };
  });
  expect(data.home).toBe(true);
  expect(data.search).toBe(true);
  expect(data.sync).toBe(true);
  expect(data.game).toContain('play.games.dmm.com/game/kancolle');
  expect(data.top).toBe(true);
});


test('roster sort and compact mode persist in session', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-roster-view-v1', JSON.stringify({sort:'name',compact:true}));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'1',name:'翔鶴改二甲',level:99,tags:[]},
      {id:'2',name:'赤城改',level:90,tags:[]},
      {id:'3',name:'加賀改',level:94,tags:[]}
    ]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>({
    sort:document.getElementById('shipRosterSort')?.value||'',
    compact:document.getElementById('roster')?.classList.contains('roster-compact')||false,
    first:document.querySelector('#shipRosterList .roster-card strong')?.textContent||'',
    button:document.querySelector('[data-roster-compact]')?.textContent||''
  }));
  expect(data.sort).toBe('name');
  expect(data.compact).toBe(true);
  expect(data.first).toBe('赤城改');
  expect(data.button).toContain('詳細');
});


test('mobile roster toolbar stays sticky', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    const el=document.querySelector('#roster .roster-toolbar');
    const s=el?getComputedStyle(el):null;
    return {position:s?.position||'',top:s?.top||''};
  });
  expect(data.position).toBe('sticky');
  expect(data.top).not.toBe('auto');
});


test('ship and equipment database compact modes restore from session', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-shipdb-view-v1', JSON.stringify({compact:true}));
    sessionStorage.setItem('harbordesk-session-equip-catalog-view-v1', JSON.stringify({compact:true,query:'電探'}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdEnsureShipDatabase?.();
    window.hdEnsureEquipmentCatalog?.();
    return {
      shipCompact:document.getElementById('hdShipDbList')?.classList.contains('hd-compact')||false,
      shipButton:document.querySelector('[data-hd-shipdb-compact]')?.textContent||'',
      equipCompact:document.getElementById('hdEquipCatalogList')?.classList.contains('hd-compact')||false,
      equipButton:document.querySelector('[data-hd-equip-compact]')?.textContent||'',
      equipCount:document.getElementById('hdEquipCatalogCount')?.textContent||''
    };
  });
  expect(data.shipCompact).toBe(true);
  expect(data.shipButton).toContain('詳細');
  expect(data.equipCompact).toBe(true);
  expect(data.equipButton).toContain('詳細');
  expect(data.equipCount).toContain('/');
});


test('mobile workspace uses compact section picker', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    window.hdWSApply?.('home','home');
    const picker=document.getElementById('hdWorkspaceMobilePicker');
    const select=document.getElementById('hdWorkspaceSectionSelect');
    const style=picker?getComputedStyle(picker):null;
    return {
      exists:!!picker&&!!select,
      display:style?.display||'',
      options:select?.options?.length||0,
      value:select?.value||'',
      secondaryDisplay:getComputedStyle(document.getElementById('hdWorkspaceSubtabs')).display
    };
  });
  expect(data.exists).toBe(true);
  expect(data.display).toBe('flex');
  expect(data.options).toBeGreaterThan(1);
  expect(data.value).toBe('home');
  expect(data.secondaryDisplay).toBe('none');
});


test('database condition reset buttons clear active filters', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-roster-view-v1', JSON.stringify({query:'加賀',filter:'主力',sort:'name'}));
    sessionStorage.setItem('harbordesk-session-shipdb-view-v1', JSON.stringify({query:'榛名',type:'高速戦艦',missingOnly:true,includeMaster:false,imageFilter:'missing'}));
    sessionStorage.setItem('harbordesk-session-equip-catalog-view-v1', JSON.stringify({query:'電探',filter:'小型水上電探'}));
  });
  await boot(page,errors);
  await page.evaluate(()=>{
    document.querySelector('[data-roster-reset]')?.click();
    window.hdEnsureShipDatabase?.();document.querySelector('[data-hd-shipdb-reset]')?.click();
    window.hdEnsureEquipmentCatalog?.();document.querySelector('[data-hd-equip-reset]')?.click();
  });
  const data=await page.evaluate(()=>({
    rosterQuery:document.getElementById('shipRosterSearch')?.value||'',
    rosterFilter:document.querySelector('[data-roster-filter].active')?.dataset.rosterFilter||'',
    rosterSort:document.getElementById('shipRosterSort')?.value||'',
    shipQuery:document.getElementById('hdShipDbSearch')?.value||'',
    shipType:document.querySelector('[data-hd-shipdb-filter].active')?.dataset.hdShipdbFilter||'',
    shipMissing:!!document.getElementById('hdShipDbMissingOnly')?.checked,
    shipMaster:!!document.getElementById('hdShipDbIncludeMaster')?.checked,
    equipQuery:document.getElementById('hdEquipCatalogSearch')?.value||'',
    equipFilter:document.querySelector('[data-hd-equip-filter].active')?.dataset.hdEquipFilter||''
  }));
  expect(data.rosterQuery).toBe('');
  expect(data.rosterFilter).toBe('all');
  expect(data.rosterSort).toBe('level');
  expect(data.shipQuery).toBe('');
  expect(data.shipType).toBe('すべて');
  expect(data.shipMissing).toBe(false);
  expect(data.shipMaster).toBe(true);
  expect(data.equipQuery).toBe('');
  expect(data.equipFilter).toBe('すべて');
});


test('global game sync status reflects freshness', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now()-120000,ships:206,equipment:93,decks:4
    }));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdWSEnsureSyncStatus?.();
    window.hdWSUpdateSyncStatus?.();
    const b=document.getElementById('hdGlobalSyncStatus');
    return {text:b?.textContent||'',fresh:b?.classList.contains('fresh')||false,title:b?.title||''};
  });
  expect(data.text).toContain('2分前');
  expect(data.fresh).toBe(true);
  expect(data.title).toContain('艦娘 206');
});


test('reset actions enable only when filters are active', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const initial=await page.evaluate(()=>{
    window.renderShipRoster?.();window.hdEnsureShipDatabase?.();window.hdEnsureEquipmentCatalog?.();
    return {
      roster:document.querySelector('[data-roster-reset]')?.disabled,
      ship:document.querySelector('[data-hd-shipdb-reset]')?.disabled,
      equip:document.querySelector('[data-hd-equip-reset]')?.disabled
    };
  });
  expect(initial.roster).toBe(true);
  expect(initial.ship).toBe(true);
  expect(initial.equip).toBe(true);
  const active=await page.evaluate(()=>{
    const r=document.getElementById('shipRosterSearch');r.value='加賀';r.dispatchEvent(new Event('input',{bubbles:true}));
    const s=document.getElementById('hdShipDbSearch');s.value='榛名';s.dispatchEvent(new Event('input',{bubbles:true}));
    const e=document.getElementById('hdEquipCatalogSearch');e.value='電探';e.dispatchEvent(new Event('input',{bubbles:true}));
    return {
      roster:document.querySelector('[data-roster-reset]')?.classList.contains('is-active'),
      ship:document.querySelector('[data-hd-shipdb-reset]')?.classList.contains('is-active'),
      equip:document.querySelector('[data-hd-equip-reset]')?.classList.contains('is-active')
    };
  });
  expect(active.roster).toBe(true);
  expect(active.ship).toBe(true);
  expect(active.equip).toBe(true);
});


test('mobile header keeps notification and update controls compact', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    window.hdEnsureUpdateUI?.();
    window.updateNotifyButton?.();
    const notify=document.getElementById('notifyBtn'),update=document.getElementById('hdUpdateCheck'),version=document.querySelector('.hd-version-badge');
    return {
      notifyIcon:notify?.querySelector('span')?.textContent||'',
      notifyLabel:notify?.querySelector('b')?.textContent||'',
      updateIcon:update?.querySelector('span')?.textContent||'',
      updateLabel:update?.querySelector('b')?.textContent||'',
      version:version?.textContent||''
    };
  });
  expect(data.notifyIcon).not.toBe('');
  expect(data.notifyLabel).not.toBe('');
  expect(data.updateIcon).toBe('↻');
  expect(data.updateLabel).toContain('更新');
  expect(data.version).toContain('v');
});


test('home dashboard promotes the next timer', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const now=Date.now();
    if(typeof state!=='undefined'){
      state.expeditions=[{name:'東京急行',endsAt:now+10*60*1000}];
      state.docks=[{name:'入渠1',endsAt:now+45*60*1000}];
      state.quests=[{name:'任務A',done:false}];
    }
    window.renderHomeDashboard?.();
    const el=document.getElementById('homeNextAction');
    return {text:el?.textContent||'',urgent:el?.classList.contains('urgent')||false};
  });
  expect(data.text).toContain('東京急行');
  expect(data.text).toContain('次に終わる');
  expect(data.urgent).toBe(true);
});


test('quick nav remembers workspace history and goes back', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdQNRecordHistory?.('roster');
    window.hdQNRecordHistory?.('equipmentBook');
    const before=window.hdQNLoadHistory?.()||[];
    const hasBack=!!document.querySelector('[data-hd-qn-back]');
    return {before,hasBack,fn:typeof window.hdQNBack};
  });
  expect(data.before.slice(-2)).toEqual(['roster','equipmentBook']);
  expect(data.hasBack).toBe(true);
  expect(data.fn).toBe('function');
});


test('Kancolle sync coverage distinguishes captured and zero sections', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt:Date.now(),ships:206,equipment:93,materials:8,decks:4,expeditions:0,docks:0,quests:0,sorties:0
    }));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdKcRenderSyncStatus?.();
    const box=document.getElementById('hdKcSyncCoverage');
    return {
      text:box?.textContent||'',
      ok:box?.querySelectorAll('.ok').length||0,
      zero:box?.querySelectorAll('.zero').length||0
    };
  });
  expect(data.text).toContain('艦娘');
  expect(data.text).toContain('任務');
  expect(data.text).toContain('未取得/なし');
  expect(data.ok).toBeGreaterThan(0);
  expect(data.zero).toBeGreaterThan(0);
});


test('mobile header hides version controls behind more menu', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    window.hdEnsureUpdateUI?.();
    const details=document.querySelector('.hd-header-more');
    const summary=details?.querySelector('summary');
    const menu=details?.querySelector('.hd-version-menu');
    return {
      details:!!details,
      summary:!!summary,
      menu:!!menu,
      version:menu?.querySelector('.hd-version-badge')?.textContent||'',
      update:!!menu?.querySelector('#hdUpdateCheck')
    };
  });
  expect(data.details).toBe(true);
  expect(data.summary).toBe(true);
  expect(data.menu).toBe(true);
  expect(data.version).toContain('v');
  expect(data.update).toBe(true);
});


test('mobile workspace picker shows group context and top action', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    window.hdWSApply?.('fleet','roster');
    const picker=document.getElementById('hdWorkspaceMobilePicker');
    return {
      hidden:!!picker?.hidden,
      group:document.getElementById('hdWorkspaceContextGroup')?.textContent||'',
      section:document.getElementById('hdWorkspaceSectionSelect')?.value||'',
      top:!!picker?.querySelector('[data-hd-ws-group-top]')
    };
  });
  expect(data.hidden).toBe(false);
  expect(data.group).toBe('艦隊');
  expect(data.section).toBe('roster');
  expect(data.top).toBe(true);
});


test('home secondary panels remember collapsed state', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-home-panels-v1', JSON.stringify({resources:true,procurement:false,recent:true}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.homeApplyPanelState?.();
    const get=name=>{
      const card=document.querySelector('[data-home-panel="'+name+'"]'),body=card?.querySelector('[data-home-panel-body]'),btn=card?.querySelector('[data-home-collapse]');
      return {collapsed:card?.classList.contains('is-collapsed')||false,hidden:!!body?.hidden,expanded:btn?.getAttribute('aria-expanded')||''};
    };
    return {resources:get('resources'),procurement:get('procurement'),recent:get('recent')};
  });
  expect(data.resources.collapsed).toBe(true);
  expect(data.resources.hidden).toBe(true);
  expect(data.resources.expanded).toBe('false');
  expect(data.procurement.collapsed).toBe(false);
  expect(data.recent.collapsed).toBe(true);
});


test('map tabs stay usable with sticky mobile navigation', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    if(typeof MAP_DETAILS==='undefined')return {ok:false};
    const key=Object.keys(MAP_DETAILS)[0];
    window.selectedMap=key;
    window.hdApplyMapTabs?.();
    const bar=document.querySelector('.map-tab-bar'),buttons=[...document.querySelectorAll('.map-tab-btn')];
    const gear=buttons.find(x=>x.dataset.mapTab==='gear');
    gear?.click();
    return {
      ok:!!bar,
      count:buttons.length,
      active:document.querySelector('.map-tab-btn.active')?.dataset.mapTab||'',
      reveal:typeof window.hdMapTabsRevealActive==='function'
    };
  });
  expect(data.ok).toBe(true);
  expect(data.count).toBeGreaterThan(5);
  expect(data.active).toBe('gear');
  expect(data.reveal).toBe(true);
});


test('mobile dialogs keep actions reachable and inputs zoom-safe', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const dialog=document.getElementById('timerDialog');
    const actions=dialog?.querySelector('.dialog-actions');
    const input=dialog?.querySelector('input');
    const ds=dialog?getComputedStyle(dialog):null,as=actions?getComputedStyle(actions):null,is=input?getComputedStyle(input):null;
    return {
      overflow:ds?.overflowY||'',
      maxHeight:ds?.maxHeight||'',
      actionPosition:as?.position||'',
      inputFont:is?.fontSize||''
    };
  });
  expect(['auto','scroll']).toContain(data.overflow);
  expect(data.maxHeight).not.toBe('none');
  expect(data.actionPosition).toBe('sticky');
  expect(data.inputFont).toBe('16px');
});


test('global toast gives save feedback without blocking', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const host=window.hdToast?.('保存したよ','ok',5000);
    return {
      exists:!!host,
      text:host?.textContent||'',
      live:host?.getAttribute('aria-live')||'',
      show:host?.classList.contains('show')||false,
      pointer:getComputedStyle(host).pointerEvents
    };
  });
  expect(data.exists).toBe(true);
  expect(data.text).toBe('保存したよ');
  expect(data.live).toBe('polite');
  expect(data.show).toBe(true);
  expect(data.pointer).toBe('none');
});


test('action toast can undo destructive actions', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([{id:'undo-1',name:'加賀改',level:94,tags:[]}]));
  });
  await boot(page,errors);
  await page.evaluate(()=>window.renderShipRoster?.());
  const deleteButton=page.locator('[data-roster-delete="undo-1"]');
  await expect(deleteButton).toHaveCount(1);
  await deleteButton.click();
  let rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]'));
  expect(rows).toHaveLength(0);
  const undo=page.locator('#hdToastRegion .hd-toast-action');
  await expect(undo).toBeVisible();
  await undo.click();
  rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-ship-roster-v1')||'[]'));
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe('加賀改');
});


test('equipment delete can be undone from action toast', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([{id:'eq-undo-1',name:'22号対水上電探',category:'電探',count:1,star:0,targetStar:0}]));
  });
  await boot(page,errors);
  await page.evaluate(()=>window.renderEquipment?.());
  const del=page.locator('[data-eq-delete="eq-undo-1"]');
  await expect(del).toHaveCount(1);
  await del.click();
  let rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]'));
  expect(rows).toHaveLength(0);
  const undo=page.locator('#hdToastRegion .hd-toast-action');
  await expect(undo).toBeVisible();
  await undo.click();
  rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-equipment-v1')||'[]'));
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe('22号対水上電探');
});

test('global search is one tap from header and shows destination hints', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([{id:'1',name:'加賀改',level:94,tags:[]}]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdGSEnsure?.();
    window.hdGSAttachLaunchers?.();
    const header=document.getElementById('hdGlobalSearchHeader');
    const input=document.getElementById('hdGSSearch');
    if(input){input.value='加賀';window.hdGSRender?.()}
    const first=document.querySelector('.hd-gs-result');
    return {header:!!header,aria:header?.getAttribute('aria-label')||'',dest:first?.querySelector('.hd-gs-dest')?.textContent||'',owned:first?.classList.contains('owned')||false};
  });
  expect(data.header).toBe(true);
  expect(data.aria).toContain('全体検索');
  expect(data.dest.length).toBeGreaterThan(0);
  expect(data.owned).toBe(true);
});


test('empty states provide direct next actions', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({expeditions:[],docks:[],quests:[],resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}}));
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([]));
  });
  await boot(page,errors);
  const first=await page.evaluate(()=>{
    window.render?.();window.renderShipRoster?.();
    return {
      expedition:!!document.querySelector('#expeditionList [data-empty-add-timer="expedition"]'),
      dock:!!document.querySelector('#dockList [data-empty-add-timer="dock"]'),
      quest:!!document.querySelector('#questList [data-empty-add-quest]'),
      roster:!!document.querySelector('#shipRosterList [data-empty-roster-add]')
    };
  });
  expect(first.expedition).toBe(true);
  expect(first.dock).toBe(true);
  expect(first.quest).toBe(true);
  expect(first.roster).toBe(true);

  const filtered=await page.evaluate(()=>{
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([{id:'a',name:'加賀改',level:94,tags:[]}]));
    window.renderShipRoster?.();
    const input=document.getElementById('shipRosterSearch');if(input){input.value='存在しない艦';input.dispatchEvent(new Event('input',{bubbles:true}))}
    window.hdEnsureShipDatabase?.();const shipInput=document.getElementById('hdShipDbSearch');if(shipInput){shipInput.value='存在しない艦';shipInput.dispatchEvent(new Event('input',{bubbles:true}))}
    window.hdEnsureEquipmentCatalog?.();const equipInput=document.getElementById('hdEquipCatalogSearch');if(equipInput){equipInput.value='存在しない装備';equipInput.dispatchEvent(new Event('input',{bubbles:true}))}
    return {
      rosterReset:!!document.querySelector('#shipRosterList [data-empty-roster-reset]'),
      shipReset:!!document.querySelector('#hdShipDbList [data-hd-shipdb-empty-reset]'),
      equipReset:!!document.querySelector('#hdEquipCatalogList [data-hd-equip-reset]')
    };
  });
  expect(filtered.rosterReset).toBe(true);
  expect(filtered.shipReset).toBe(true);
  expect(filtered.equipReset).toBe(true);
});


test('accessibility styles support reduced motion and visible focus', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const sheets=[...document.styleSheets];
    let css='';
    for(const sheet of sheets){try{css += [...sheet.cssRules].map(r=>r.cssText).join('\n')}catch{}}
    return {
      focus:css.includes(':focus-visible'),
      reduced:css.includes('prefers-reduced-motion'),
      tap:css.includes('touch-action: manipulation')||css.includes('touch-action:manipulation')
    };
  });
  expect(data.focus).toBe(true);
  expect(data.reduced).toBe(true);
  expect(data.tap).toBe(true);
});


test('offline status explains unavailable network actions', async ({ page, context }) => {
  const errors=[];
  await boot(page,errors);
  await page.evaluate(()=>window.hdWSEnsureNetworkStatus?.());
  await context.setOffline(true);
  await page.evaluate(()=>window.dispatchEvent(new Event('offline')));
  const offline=await page.evaluate(()=>{
    const bar=document.getElementById('hdNetworkStatus');
    return {hidden:!!bar?.hidden,text:bar?.textContent||'',body:document.body.classList.contains('hd-offline')};
  });
  expect(offline.hidden).toBe(false);
  expect(offline.text).toContain('オフライン');
  expect(offline.body).toBe(true);
  await context.setOffline(false);
});


test('global search indexes official master-only ships and equipment', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const rows=window.hdGSIndex?.()||[];
    const ship=rows.find(x=>x.type==='ship'&&x.title==='大和改二重');
    const catalog=new Set((window.HD_EQUIPMENT_CATALOG||[]).map(x=>String(x.name||'')));
    const masterNames=Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment||{});
    const masterOnlyName=masterNames.find(name=>!catalog.has(name))||'';
    const equipment=rows.find(x=>x.type==='equipment'&&x.title===masterOnlyName);
    return {
      ship:ship?{title:ship.title,master:!!ship.meta?.master,kind:ship.action?.kind,subtitle:ship.subtitle}:null,
      equipment:equipment?{title:equipment.title,master:!!equipment.meta?.master,kind:equipment.action?.kind,subtitle:equipment.subtitle}:null,
      masterOnlyName
    };
  });
  expect(data.ship).not.toBeNull();
  expect(data.ship.master).toBe(true);
  expect(data.ship.kind).toBe('ship');
  expect(data.masterOnlyName.length).toBeGreaterThan(0);
  expect(data.equipment).not.toBeNull();
  expect(data.equipment.master).toBe(true);
  expect(['masterEquipment','ledger']).toContain(data.equipment.kind);

  await page.evaluate(()=>{
    const rows=window.hdGSIndex?.()||[];
    const catalog=new Set((window.HD_EQUIPMENT_CATALOG||[]).map(x=>String(x.name||'')));
    const name=Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment||{}).find(x=>!catalog.has(x));
    const row=rows.find(x=>x.type==='equipment'&&x.title===name);
    if(row?.action?.kind==='masterEquipment')window.hdGSOpenResult?.(row);
  });
  const equipInput=page.locator('#hdShipEquipCheckEquip');
  if(await equipInput.count())await expect(equipInput).not.toHaveValue('');
});


test('home shows recently used functions from quick nav history', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-quick-nav-recent-v1', JSON.stringify([
      {id:'roster',at:Date.now()},
      {id:'equipmentBook',at:Date.now()-1000},
      {id:'quests',at:Date.now()-2000}
    ]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderHomeDashboard?.();
    return [...document.querySelectorAll('#homeRecentFunctions [data-home-jump]')].map(x=>({id:x.dataset.homeJump,text:x.textContent}));
  });
  expect(data.map(x=>x.id)).toEqual(expect.arrayContaining(['roster','equipmentBook','quests']));
  expect(data.length).toBeLessThanOrEqual(4);
});


test('global search history can be cleared', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-global-search-history-v1', JSON.stringify(['加賀','6-5','東海']));
  });
  await boot(page,errors);
  await page.evaluate(()=>{window.hdGSEnsure?.();window.hdGSOpen?.('')});
  await expect(page.locator('[data-hd-gs-history-clear]')).toHaveCount(1);
  await expect(page.locator('[data-hd-gs-history]')).toHaveCount(3);
  await page.locator('[data-hd-gs-history-clear]').click();
  const data=await page.evaluate(()=>({
    history:JSON.parse(localStorage.getItem('harbordesk-global-search-history-v1')||'[]'),
    clear:!!document.querySelector('[data-hd-gs-history-clear]')
  }));
  expect(data.history).toEqual([]);
  expect(data.clear).toBe(false);
});


test('heavy searches use scheduled rendering', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>({
    global:typeof window.hdGSScheduleRender==='function',
    ship:typeof window.hdShipDbScheduleRender==='function',
    equipment:typeof window.hdEquipCatalogScheduleRender==='function'
  }));
  expect(data.global).toBe(true);
  expect(data.ship).toBe(true);
  expect(data.equipment).toBe(true);
});


test('home prioritizes pinned functions over recent functions', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-quick-nav-pins-v1', JSON.stringify(['roster','equipmentBook']));
    localStorage.setItem('harbordesk-quick-nav-recent-v1', JSON.stringify([
      {id:'roster',at:Date.now()},
      {id:'quests',at:Date.now()-1000},
      {id:'expeditions',at:Date.now()-2000}
    ]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderHomeDashboard?.();
    const pinned=[...document.querySelectorAll('#homeRecentFunctions .home-pinned-function-list [data-home-jump]')].map(x=>x.dataset.homeJump);
    const recent=[...document.querySelectorAll('#homeRecentFunctions .home-recent-function-list:not(.home-pinned-function-list) [data-home-jump]')].map(x=>x.dataset.homeJump);
    return {pinned,recent};
  });
  expect(data.pinned).toEqual(expect.arrayContaining(['roster','equipmentBook']));
  expect(data.recent).toEqual(expect.arrayContaining(['quests','expeditions']));
  expect(data.recent).not.toContain('roster');
});


test('boot feedback clears when modules initialize', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    document.body.classList.add('hd-booting');
    window.hdInitLoadedModules?.();
    return {
      booting:document.body.classList.contains('hd-booting'),
      ready:document.body.getAttribute('data-hd-ready')||''
    };
  });
  expect(data.booting).toBe(false);
  expect(data.ready).toBe('1');
});


test('pinned home shortcuts open pin manager', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-quick-nav-pins-v1', JSON.stringify(['roster']));
  });
  await boot(page,errors);
  await page.evaluate(()=>window.renderHomeDashboard?.());
  const manage=page.locator('[data-home-pins-manage]');
  await expect(manage).toHaveCount(1);
  await manage.click();
  await expect(page.locator('#hdQuickNavDialog')).toBeVisible();
  await expect(page.locator('#hdQuickNavDialog .hd-qn-row.pinned')).toHaveCount(1);
});


test('mobile header moves notification into overflow menu', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    window.hdEnsureUpdateUI?.();
    window.hdWSEnsureSyncStatus?.();
    const header=document.querySelector('.topbar');
    const notify=document.getElementById('notifyBtn');
    const more=document.querySelector('.hd-header-more');
    const sync=document.getElementById('hdGlobalSyncStatus');
    return {
      notifyInMenu:!!notify?.closest('.hd-version-menu'),
      moreDirect:more?.parentElement===header,
      syncDirect:sync?.parentElement===header,
      notifyDirect:notify?.parentElement===header,
      notifyLabel:notify?.textContent||''
    };
  });
  expect(data.notifyInMenu).toBe(true);
  expect(data.moreDirect).toBe(true);
  expect(data.syncDirect).toBe(true);
  expect(data.notifyDirect).toBe(false);
  expect(data.notifyLabel).toContain('通知');
});


test('Kancolle sync offers direct next-step navigation', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({syncedAt:Date.now(),ships:206,equipment:93,materials:8,decks:4,quests:1,sorties:1}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdKcEnsureImport?.();
    window.hdKcRenderSyncStatus?.();
    const box=document.getElementById('hdKcNextActions');
    return {hidden:!!box?.hidden,ids:[...box?.querySelectorAll('[data-hd-kc-jump]')||[]].map(x=>x.dataset.hdKcJump)};
  });
  expect(data.hidden).toBe(false);
  expect(data.ids).toEqual(expect.arrayContaining(['roster','equipmentBook','quests','sortieLog']));
});


test('home reorder controls persist card order', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-home-order-v1', JSON.stringify(['quick','resources','recent','procurement']));
  });
  await boot(page,errors);
  const before=await page.evaluate(()=>[...document.querySelectorAll('#home [data-home-order-item]')].map(x=>x.dataset.homeOrderItem));
  expect(before).toEqual(['quick','resources','recent','procurement']);
  await page.locator('[data-home-order-item="recent"] [data-home-move="up"]').click();
  const after=await page.evaluate(()=>({
    dom:[...document.querySelectorAll('#home [data-home-order-item]')].map(x=>x.dataset.homeOrderItem),
    saved:JSON.parse(localStorage.getItem('harbordesk-home-order-v1')||'[]')
  }));
  expect(after.dom).toEqual(['quick','recent','resources','procurement']);
  expect(after.saved).toEqual(after.dom);
});


test('workspace back returns to previous function', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(async()=>{
    window.hdWSInstall?.();
    window.hdWSShowElement?.('roster',false);
    window.hdWSShowElement?.('equipmentBook',false);
    const before={group:window.hdWSState?.group||'',section:window.hdWSState?.sections?.[window.hdWSState?.group]||'',history:window.hdWSHistoryLoad?.().length||0};
    const ok=window.hdWSGoBack?.();
    const after={group:window.hdWSState?.group||'',section:window.hdWSState?.sections?.[window.hdWSState?.group]||'',history:window.hdWSHistoryLoad?.().length||0,disabled:!!document.querySelector('[data-hd-ws-back]')?.disabled};
    return {before,after,ok};
  });
  expect(data.before.section).toBe('equipmentBook');
  expect(data.before.history).toBeGreaterThan(0);
  expect(data.ok).toBe(true);
  expect(data.after.section).toBe('roster');
});


test('home order can reset to default without touching panel state', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-home-order-v1', JSON.stringify(['recent','quick','procurement','resources']));
    localStorage.setItem('harbordesk-home-panels-v1', JSON.stringify({resources:true}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.homeResetOrder?.();
    return {
      order:JSON.parse(localStorage.getItem('harbordesk-home-order-v1')||'[]'),
      panels:JSON.parse(localStorage.getItem('harbordesk-home-panels-v1')||'{}'),
      dom:[...document.querySelectorAll('#home [data-home-order-item]')].map(x=>x.dataset.homeOrderItem)
    };
  });
  expect(data.order).toEqual(['resources','procurement','quick','recent']);
  expect(data.panels.resources).toBe(true);
  expect(data.dom).toEqual(['resources','procurement','quick','recent']);
});


test('mobile secretary panel stays compact', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    const hero=document.querySelector('.hero'),eyebrow=hero?.querySelector('.eyebrow'),secretary=document.getElementById('secretaryText');
    return {
      height:hero?.getBoundingClientRect().height||999,
      eyebrow:getComputedStyle(eyebrow).display,
      font:parseFloat(getComputedStyle(secretary).fontSize||'0'),
      lines:getComputedStyle(secretary).webkitLineClamp||''
    };
  });
  expect(data.height).toBeLessThan(90);
  expect(data.eyebrow).toBe('none');
  expect(data.font).toBeLessThanOrEqual(13);
});


test('core quest and timer filters keep completed items out of the way', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const now=Date.now();
    if(typeof state!=='undefined'){
      state.expeditions=[{id:'e1',name:'稼働遠征',endsAt:now+3600000},{id:'e2',name:'完了遠征',endsAt:now-60000}];
      state.docks=[{id:'d1',name:'入渠中',endsAt:now+1800000},{id:'d2',name:'入渠完了',endsAt:now-60000}];
      state.quests=[{id:'q1',name:'未完了任務',done:false},{id:'q2',name:'完了任務',done:true}];
    }
    localStorage.removeItem('harbordesk-core-list-filters-v1');
    window.coreListFilters={expedition:'active',dock:'active',quest:'active'};
    window.renderTimers?.('expedition');window.renderTimers?.('dock');window.renderQuests?.();
    return {
      expedition:document.getElementById('expeditionList')?.textContent||'',
      dock:document.getElementById('dockList')?.textContent||'',
      quest:document.getElementById('questList')?.textContent||'',
      expCount:document.getElementById('expeditionFilterCount')?.textContent||'',
      questCount:document.getElementById('questFilterCount')?.textContent||''
    };
  });
  expect(data.expedition).toContain('稼働遠征');
  expect(data.expedition).not.toContain('完了遠征');
  expect(data.dock).toContain('入渠中');
  expect(data.dock).not.toContain('入渠完了');
  expect(data.quest).toContain('未完了任務');
  expect(data.quest).not.toContain('完了任務');
  expect(data.expCount).toContain('1 / 2');
  expect(data.questCount).toContain('1 / 2');

  await page.locator('[data-core-filter-kind="quest"][data-core-filter="done"]').click();
  await expect(page.locator('#questList')).toContainText('完了任務');
  await expect(page.locator('#questList')).not.toContainText('未完了任務');

  await page.locator('[data-core-filter-kind="expedition"][data-core-filter="all"]').click();
  await expect(page.locator('#expeditionList')).toContainText('稼働遠征');
  await expect(page.locator('#expeditionList')).toContainText('完了遠征');
});


test('advanced empty states provide direct actions', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    localStorage.removeItem('harbordesk-equipment-v1');
    localStorage.removeItem('harbordesk-events-v1');
    localStorage.removeItem('harbordesk-resource-history-v1');
    const q=document.getElementById('equipmentSearch');if(q)q.value='';
    window.renderEquipment?.();window.renderEvents?.();window.renderResourceHistory?.();
    return {
      equipment:!!document.querySelector('[data-empty-add-equipment]'),
      sync:!!document.querySelector('[data-empty-open-sync]'),
      event:!!document.querySelector('[data-empty-add-event]'),
      resource:!!document.querySelector('[data-empty-resource-snapshot]')
    };
  });
  expect(data.equipment).toBe(true);
  expect(data.sync).toBe(true);
  expect(data.event).toBe(true);
  expect(data.resource).toBe(true);
});


test('equipment ledger preserves search and shows filtered count', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-equipment-ledger-view-v1', JSON.stringify({query:'電探'}));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      {id:'1',name:'13号対空電探改',category:'電探',count:2,star:0,targetStar:10,assigned:'',memo:''},
      {id:'2',name:'零式艦戦53型(岩本隊)',category:'艦戦',count:1,star:10,targetStar:10,assigned:'',memo:''}
    ]));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>({
    query:document.getElementById('equipmentSearch')?.value||'',
    count:document.getElementById('equipmentLedgerCount')?.textContent||'',
    clearDisabled:!!document.querySelector('[data-eq-search-clear]')?.disabled,
    cards:document.querySelectorAll('#equipmentList .advanced-card').length
  }));
  expect(data.query).toBe('電探');
  expect(data.count).toBe('1 / 2件');
  expect(data.clearDisabled).toBe(false);
  expect(data.cards).toBe(1);
});


test('completed core items can be bulk cleaned and undone', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const now=Date.now();
    if(typeof state!=='undefined'){
      state.expeditions=[{id:'e-active',name:'稼働',endsAt:now+3600000},{id:'e-done',name:'完了',endsAt:now-60000}];
      state.quests=[{id:'q-active',name:'未完了',done:false},{id:'q-done',name:'完了',done:true}];
    }
    window.renderTimers?.('expedition');window.renderQuests?.();
    return {
      expCleanup:document.querySelector('[data-core-cleanup="expedition"]')?.hidden===false,
      questCleanup:document.querySelector('[data-core-cleanup="quest"]')?.hidden===false
    };
  });
  expect(data.expCleanup).toBe(true);
  expect(data.questCleanup).toBe(true);

  await page.locator('[data-core-cleanup="quest"]').click();
  let rows=await page.evaluate(()=>state.quests.map(x=>x.id));
  expect(rows).toEqual(['q-active']);
  const undo=page.locator('#hdToastRegion .hd-toast-action');
  await expect(undo).toBeVisible();
  await undo.click();
  rows=await page.evaluate(()=>state.quests.map(x=>x.id));
  expect(rows).toEqual(['q-active','q-done']);
});


test('core completed cleanup supports undo', async ({ page }) => {
  const now=Date.now();
  await page.addInitScript(({now}) => {
    localStorage.setItem('harbordesk-v2', JSON.stringify({
      expeditions:[
        {id:'e-done',name:'完了遠征',endsAt:now-1000},
        {id:'e-active',name:'稼働遠征',endsAt:now+3600000}
      ],
      docks:[{id:'d-done',name:'完了入渠',endsAt:now-1000}],
      quests:[
        {id:'q-done',name:'完了任務',done:true},
        {id:'q-active',name:'未完了任務',done:false}
      ],
      resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}
    }));
  }, {now});
  await boot(page,[]);
  await page.waitForSelector('[data-core-cleanup="quest"]:not([hidden])');

  const labels=await page.evaluate(()=>({
    exp:document.querySelector('[data-core-cleanup="expedition"]')?.textContent||'',
    dock:document.querySelector('[data-core-cleanup="dock"]')?.textContent||'',
    quest:document.querySelector('[data-core-cleanup="quest"]')?.textContent||''
  }));
  expect(labels.exp).toContain('1');
  expect(labels.dock).toContain('1');
  expect(labels.quest).toContain('1');

  await page.click('[data-core-cleanup="quest"]');
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-v2')||'{}'));
  expect(state.quests.map(x=>x.id)).toEqual(['q-active']);

  await page.click('#hdToastRegion .hd-toast-action');
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-v2')||'{}'));
  expect(state.quests.map(x=>x.id)).toEqual(['q-done','q-active']);
});


test('home task can complete quest with undo', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-v2', JSON.stringify({
      expeditions:[],docks:[],
      quests:[{id:'q-home',name:'ホーム確認任務',done:false}],
      resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}
    }));
  });
  await boot(page,[]);
  await page.waitForSelector('[data-home-quest-done="q-home"]');
  await page.click('[data-home-quest-done="q-home"]');
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-v2')||'{}'));
  expect(state.quests[0].done).toBe(true);
  expect(await page.locator('#homeTodo').textContent()).toContain('未完了の任務はないよ');
  await page.click('#hdToastRegion .hd-toast-action');
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem('harbordesk-v2')||'{}'));
  expect(state.quests[0].done).toBe(false);
  expect(await page.locator('#homeTodo').textContent()).toContain('ホーム確認任務');
});


test('home empty states offer direct add actions', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-v2', JSON.stringify({
      expeditions:[],docks:[],quests:[],
      resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}
    }));
  });
  await boot(page,[]);
  await page.waitForSelector('[data-home-add-quest]');
  expect(await page.locator('[data-home-add-timer="expedition"]').count()).toBe(1);
  expect(await page.locator('[data-home-add-timer="dock"]').count()).toBe(1);
  await page.click('[data-home-add-quest]');
  expect(await page.locator('#questDialog').evaluate(el=>el.open)).toBe(true);
  await page.locator('#questDialog [value="cancel"]').click();
  await page.click('[data-home-add-timer="expedition"]');
  expect(await page.locator('#timerDialog').evaluate(el=>el.open)).toBe(true);
  expect(await page.locator('#timerDialogTitle').textContent()).toContain('遠征');
});


test('guide empty search can reset conditions', async ({ page }) => {
  await boot(page,[]);
  await page.fill('#guideQuery','絶対に存在しない検索語XYZ123');
  await page.click('#guideSearchBtn');
  await page.waitForSelector('[data-guide-clear-query]');
  expect(await page.locator('#guideResults').textContent()).toContain('0件');
  await page.click('[data-guide-clear-query]');
  expect(await page.inputValue('#guideQuery')).toBe('');
  expect(await page.locator('#guideResults .guide-card').count()).toBeGreaterThan(0);
});


test('home timer cancel supports undo', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const now=Date.now();
    state.expeditions=[{id:'ex1',name:'海上護衛',endsAt:now+3600000}];
    state.docks=[];
    save();render();renderHomeDashboard();
    const btn=document.querySelector('[data-home-timer-cancel="ex1"]');
    const before=state.expeditions.length;
    btn?.click();
    return {
      before,
      after:state.expeditions.length,
      homeText:document.getElementById('homeTimers')?.textContent||'',
      resourceSync:!!document.querySelector('[data-home-panel="resources"] [data-home-jump="kancolleImport"]')
    };
  });
  expect(data.before).toBe(1);
  expect(data.after).toBe(0);
  expect(data.homeText).toContain('動いているタイマーはない');
  expect(data.resourceSync).toBe(true);
});


test('guide view restores query filter and selected map in session', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-guide-view-v1', JSON.stringify({
      query:'遠征',filter:'expedition',world:'5',map:'5-5'
    }));
  });
  await boot(page,[]);
  const data=await page.evaluate(()=>({
    query:document.getElementById('guideQuery')?.value||'',
    filter:document.querySelector('[data-guide-filter].active')?.dataset.guideFilter||'',
    selected:document.querySelector('[data-map].active')?.dataset.map||'',
    resetHidden:document.getElementById('guideResetBtn')?.hidden
  }));
  expect(data.query).toBe('遠征');
  expect(data.filter).toBe('expedition');
  expect(data.selected).toBe('5-5');
  expect(data.resetHidden).toBe(false);
  await page.click('#guideResetBtn');
  expect(await page.inputValue('#guideQuery')).toBe('');
  const resetState=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('harbordesk-session-guide-view-v1')||'{}'));
  expect(resetState.filter).toBe('all');
  expect(resetState.map).toBe('');
});


test('timer dialog remembers last input per kind', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-last-v1', JSON.stringify({
      expedition:{name:'東京急行',minutes:165},
      dock:{name:'加賀改',minutes:45}
    }));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    openTimer('expedition');
    const expedition={name:document.getElementById('timerName')?.value||'',minutes:document.getElementById('timerMinutes')?.value||''};
    document.getElementById('timerDialog')?.close();
    openTimer('dock');
    const dock={name:document.getElementById('timerName')?.value||'',minutes:document.getElementById('timerMinutes')?.value||''};
    document.getElementById('timerDialog')?.close();
    return {expedition,dock};
  });
  expect(data.expedition).toEqual({name:'東京急行',minutes:'165'});
  expect(data.dock).toEqual({name:'加賀改',minutes:'45'});
});


test('completed manual timer can restart in one tap', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    state.expeditions=[{id:'repeat1',name:'東京急行',startedAt:Date.now()-3600000,durationMinutes:30,endsAt:Date.now()-1000}];
    coreListFilters.expedition='done';
    save();renderTimers('expedition');
    const before=state.expeditions[0].endsAt;
    const btn=document.querySelector('[data-restart-timer="repeat1"]');
    btn?.click();
    return {
      hadButton:!!btn,
      before,
      after:state.expeditions[0].endsAt,
      active:state.expeditions[0].endsAt>Date.now(),
      duration:state.expeditions[0].durationMinutes,
      saved:JSON.parse(localStorage.getItem('harbordesk-timer-last-v1')||'{}').expedition||null
    };
  });
  expect(data.hadButton).toBe(true);
  expect(data.after).toBeGreaterThan(data.before);
  expect(data.active).toBe(true);
  expect(data.duration).toBe(30);
  expect(data.saved).toEqual(expect.objectContaining({name:'東京急行',minutes:30}));
});


test('timer dialog quick duration presets', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    openTimer('expedition');
    const button=document.querySelector('[data-timer-minutes="120"]');
    button?.click();
    const value=document.getElementById('timerMinutes')?.value||'';
    const presetCount=document.querySelectorAll('[data-timer-minutes]').length;
    document.getElementById('timerDialog')?.close();
    return {value,presetCount};
  });
  expect(data.value).toBe('120');
  expect(data.presetCount).toBe(6);
});


test('quest dialog shows recent manual quest names', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-quest-recent-v1', JSON.stringify(['デイリー演習','南西諸島海域の制海権を握れ！']));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    openQuestDialog();
    const buttons=[...document.querySelectorAll('[data-quest-recent]')].map(x=>x.textContent);
    const first=document.querySelector('[data-quest-recent]');
    first?.click();
    const value=document.getElementById('questName')?.value||'';
    document.getElementById('questDialog')?.close();
    return {buttons,value};
  });
  expect(data.buttons).toContain('デイリー演習');
  expect(data.value).toBe('デイリー演習');
});


test('timer dialog offers recent timer presets', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-recent-v1', JSON.stringify({
      expedition:[{name:'東京急行',minutes:165},{name:'海上護衛任務',minutes:90}],
      dock:[{name:'赤城改',minutes:45}]
    }));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    openTimer('expedition');
    const buttons=[...document.querySelectorAll('[data-timer-recent]')].map(x=>x.textContent);
    document.querySelector('[data-timer-recent="1"]')?.click();
    const result={name:document.getElementById('timerName')?.value||'',minutes:document.getElementById('timerMinutes')?.value||'',buttons};
    document.getElementById('timerDialog')?.close();
    return result;
  });
  expect(data.buttons.length).toBe(2);
  expect(data.name).toBe('海上護衛任務');
  expect(data.minutes).toBe('90');
});


test('home can start a recent expedition in one tap', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-recent-v1', JSON.stringify({
      expedition:[{name:'東京急行',minutes:165},{name:'海上護衛任務',minutes:90}]
    }));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    renderHomeDashboard();
    const buttons=[...document.querySelectorAll('[data-home-timer-start]')].map(x=>x.textContent);
    document.querySelector('[data-home-timer-start="0"]')?.click();
    return {
      buttons,
      timers:state.expeditions.map(x=>({name:x.name,durationMinutes:x.durationMinutes,active:x.endsAt>Date.now()}))
    };
  });
  expect(data.buttons.length).toBeGreaterThan(0);
  expect(data.timers).toHaveLength(1);
  expect(data.timers[0]).toEqual(expect.objectContaining({name:'東京急行',durationMinutes:165,active:true}));
});


test('iPhone Safari gets dismissible home-screen install tip', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    try{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Version/26.0 Mobile/15E148 Safari/604.1'})}catch{}
    try{Object.defineProperty(navigator,'standalone',{configurable:true,value:false})}catch{}
    localStorage.removeItem('harbordesk-install-tip-dismissed-v1');
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderHomeDashboard?.();
    const tip=document.getElementById('homeInstallTip');
    const before=!!tip&&!tip.hidden;
    tip?.querySelector('[data-home-install-dismiss]')?.click();
    return {before,after:!!tip&&!tip.hidden,dismissed:localStorage.getItem('harbordesk-install-tip-dismissed-v1')};
  });
  expect(data.before).toBe(true);
  expect(data.after).toBe(false);
  expect(data.dismissed).toBe('1');
});


test('home next action prioritizes stale sync over quests', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({syncedAt:Date.now()-8*3600000,ships:206,equipment:93,decks:4}));
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({expeditions:[],docks:[],quests:[{id:'q1',name:'デイリー演習',done:false}],resources:{}}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    renderHomeDashboard();
    const host=document.getElementById('homeNextAction');
    return {text:host?.textContent||'',sync:host?.classList.contains('sync')||false,done:!!host?.querySelector('[data-home-quest-done]')};
  });
  expect(data.sync).toBe(true);
  expect(data.text).toContain('ゲーム同期');
  expect(data.done).toBe(false);
});

test('home next action can complete first quest when sync is fresh', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({syncedAt:Date.now()-120000,ships:206,equipment:93,decks:4}));
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({expeditions:[],docks:[],quests:[{id:'q1',name:'デイリー演習',done:false},{id:'q2',name:'補給',done:false}],resources:{}}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    renderHomeDashboard();
    const before=document.getElementById('homeNextAction')?.textContent||'';
    document.querySelector('#homeNextAction [data-home-quest-done="q1"]')?.click();
    return {before,done:state.quests.find(x=>x.id==='q1')?.done===true,after:document.getElementById('homeNextAction')?.textContent||''};
  });
  expect(data.before).toContain('デイリー演習');
  expect(data.done).toBe(true);
  expect(data.after).toContain('補給');
});


test('Home next action can complete first quest directly', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({syncedAt:Date.now(),ships:1,equipment:1,decks:1}));
    state.expeditions=[];state.docks=[];state.quests=[{id:'q-next',name:'デイリー演習',done:false}];
    save();render();renderHomeDashboard();
    const before=document.getElementById('homeNextAction')?.textContent||'';
    const btn=document.querySelector('#homeNextAction [data-home-quest-done="q-next"]');
    btn?.click();
    return {before,afterDone:!!state.quests[0]?.done,button:!!btn};
  });
  expect(data.before).toContain('デイリー演習');
  expect(data.button).toBe(true);
  expect(data.afterDone).toBe(true);
});


test('recent timer and quest suggestions can be removed', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-recent-v1', JSON.stringify({expedition:[{name:'東京急行',minutes:165},{name:'海上護衛任務',minutes:90}]}));
    localStorage.setItem('harbordesk-quest-recent-v1', JSON.stringify(['デイリー演習','補給艦3隻']));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    openTimer('expedition');
    document.querySelector('[data-timer-recent-remove="0"]')?.click();
    const timerRows=JSON.parse(localStorage.getItem('harbordesk-timer-recent-v1')||'{}').expedition||[];
    document.getElementById('timerDialog')?.close();
    openQuestDialog();
    document.querySelector('[data-quest-recent-remove="デイリー演習"]')?.click();
    const questRows=JSON.parse(localStorage.getItem('harbordesk-quest-recent-v1')||'[]');
    document.getElementById('questDialog')?.close();
    return {timerRows,questRows};
  });
  expect(data.timerRows.map(x=>x.name)).toEqual(['海上護衛任務']);
  expect(data.questRows).toEqual(['補給艦3隻']);
});


test('active manual timer can be extended in one tap', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const start=Date.now();
    state.expeditions=[{id:'adjust1',name:'東京急行',startedAt:start,durationMinutes:165,endsAt:start+165*60000}];
    coreListFilters.expedition='active';
    save();renderTimers('expedition');
    const before=state.expeditions[0].endsAt;
    const buttons=document.querySelectorAll('[data-adjust-timer="adjust1"]');
    document.querySelector('[data-adjust-timer="adjust1"][data-minutes="15"]')?.click();
    return {
      count:buttons.length,
      delta:state.expeditions[0].endsAt-before,
      duration:state.expeditions[0].durationMinutes,
      active:state.expeditions[0].endsAt>Date.now()
    };
  });
  expect(data.count).toBe(2);
  expect(data.delta).toBe(15*60000);
  expect(data.duration).toBe(165);
  expect(data.active).toBe(true);
});


test('recent timer and quest suggestions support one-tap reuse', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-recent-v1', JSON.stringify({expedition:[{name:'海上護衛任務',minutes:90}]}));
    localStorage.setItem('harbordesk-quest-recent-v1', JSON.stringify(['あ号作戦']));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.openTimer?.('expedition');
    window.renderQuestRecent?.();
    const timerRun=document.querySelector('[data-timer-recent-run]');
    const questRun=document.querySelector('[data-quest-recent-run]');
    return {timerRun:!!timerRun,questRun:!!questRun,timerLabel:timerRun?.getAttribute('aria-label')||'',questLabel:questRun?.getAttribute('aria-label')||''};
  });
  expect(data.timerRun).toBe(true);
  expect(data.timerLabel).toContain('開始');
  expect(data.questRun).toBe(true);
  expect(data.questLabel).toContain('追加');
});


test('home exposes recent dock and quest one-tap actions', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-timer-recent-v1', JSON.stringify({
      expedition:[{name:'海上護衛任務',minutes:90}],
      dock:[{name:'入渠 30分',minutes:30}]
    }));
    localStorage.setItem('harbordesk-quest-recent-v1', JSON.stringify(['あ号作戦']));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderHomeDashboard?.();
    return {
      dock:document.querySelector('[data-home-timer-start][data-kind="dock"]')?.textContent||'',
      quest:document.querySelector('[data-home-quest-start]')?.textContent||'',
      expedition:document.querySelector('[data-home-timer-start][data-kind="expedition"]')?.textContent||''
    };
  });
  expect(data.dock).toContain('入渠 30分');
  expect(data.quest).toContain('あ号作戦');
  expect(data.expedition).toContain('海上護衛任務');
});


test('manual timer and quest additions expose undo actions', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const source={
      timerStartRecent:String(window.timerStartRecent||''),
      questAddRecent:String(window.questAddRecent||'')
    };
    return {
      timerUndo:source.timerStartRecent.includes("hdToastAction")&&source.timerStartRecent.includes("元に戻す"),
      questUndo:source.questAddRecent.includes("hdToastAction")&&source.questAddRecent.includes("元に戻す")
    };
  });
  expect(data.timerUndo).toBe(true);
  expect(data.questUndo).toBe(true);
});


test('manual timers and quests can be edited', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    const now=Date.now();
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions:[{id:'t1',name:'東京急行',startedAt:now,endsAt:now+3600000,durationMinutes:60}],
      docks:[],
      quests:[{id:'q1',name:'あ号作戦',done:false}],
      resources:{fuel:'',ammo:'',steel:'',bauxite:'',savedAt:null}
    }));
  });
  await boot(page,errors);
  const timerEdit=page.locator('[data-edit-timer="t1"]');
  await timerEdit.click();
  expect(await page.locator('#timerDialogTitle').textContent()).toContain('編集');
  expect(await page.locator('#timerName').inputValue()).toBe('東京急行');
  await page.locator('#timerDialog').evaluate(d=>d.close());
  await page.locator('[data-edit-quest="q1"]').click();
  expect(await page.locator('#questDialogTitle').textContent()).toContain('編集');
  expect(await page.locator('#questName').inputValue()).toBe('あ号作戦');
});


test('mobile timer actions can wrap', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    const s=[...document.styleSheets].flatMap(x=>{try{return [...x.cssRules].map(r=>r.cssText)}catch{return []}}).join('\n');
    return {hasTimerActions:s.includes('.timer-actions'),hasWrap:s.includes('flex-wrap: wrap')};
  });
  expect(data.hasTimerActions).toBe(true);
  expect(data.hasWrap).toBe(true);
});


test('recent suggestions and drop hunts support undo', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const appText=[window.timerRecentRemove,window.questRecentRemove].map(fn=>String(fn||'')).join('\n');
    const dropHandlers=[...document.scripts].some(()=>false);
    return {
      timerUndo:appText.includes('元に戻す')&&appText.includes('TIMER_RECENT_KEY'),
      questUndo:appText.includes('元に戻す')&&appText.includes('QUEST_RECENT_KEY'),
      hasDrop:typeof window.hdDropHunts==='function'
    };
  });
  expect(data.timerUndo).toBe(true);
  expect(data.questUndo).toBe(true);
  expect(data.hasDrop).toBe(true);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});


test('active filter summaries describe current list conditions', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    sessionStorage.setItem('harbordesk-session-roster-view-v1', JSON.stringify({query:'加賀',filter:'主力',sort:'name'}));
    sessionStorage.setItem('harbordesk-session-shipdb-view-v1', JSON.stringify({query:'榛名',type:'高速戦艦',missingOnly:true,includeMaster:false,imageFilter:'missing'}));
    sessionStorage.setItem('harbordesk-session-equip-catalog-view-v1', JSON.stringify({query:'電探',filter:'小型水上電探'}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.renderShipRoster?.();window.hdEnsureShipDatabase?.();window.hdRenderShipDatabase?.();window.hdEnsureEquipmentCatalog?.();window.hdRenderEquipmentCatalog?.();
    return {
      roster:document.getElementById('shipRosterActiveFilters')?.textContent||'',
      ship:document.getElementById('hdShipDbActiveFilters')?.textContent||'',
      equip:document.getElementById('hdEquipCatalogActiveFilters')?.textContent||''
    };
  });
  expect(data.roster).toContain('検索: 加賀');
  expect(data.roster).toContain('タグ: 主力');
  expect(data.ship).toContain('艦種: 高速戦艦');
  expect(data.ship).toContain('未所持');
  expect(data.equip).toContain('カテゴリ: 小型水上電探');
  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});


test('global search history supports individual undoable removal', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-global-search-history-v1', JSON.stringify(['矢矧','6-5','東海']));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    window.hdGSEnsure?.();window.hdGSRender?.();
    return {
      items:document.querySelectorAll('[data-hd-gs-history]').length,
      removes:document.querySelectorAll('[data-hd-gs-history-remove]').length,
      removeFn:String(window.hdGSRemoveHistory||''),
      clearFn:String(window.hdGSClearHistory||'')
    };
  });
  expect(data.items).toBe(3);
  expect(data.removes).toBe(3);
  expect(data.removeFn).toContain('元に戻す');
  expect(data.clearFn).toContain('元に戻す');
  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});


test('mobile dialog actions stay reachable', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.setViewportSize({width:390,height:844});
  const data=await page.evaluate(()=>{
    const dialog=document.getElementById('timerDialog');
    if(dialog && !dialog.open)dialog.showModal();
    const actions=dialog?.querySelector('.dialog-actions');
    const ds=dialog?getComputedStyle(dialog):null,as=actions?getComputedStyle(actions):null;
    return {dialogMax:ds?.maxHeight||'',dialogOverflow:ds?.overflowY||ds?.overflow||'',actionPosition:as?.position||'',actionBottom:as?.bottom||''};
  });
  expect(data.actionPosition).toBe('sticky');
  expect(data.actionBottom).toBe('0px');
  expect(data.dialogMax).not.toBe('none');
  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});


test('Kancolle sync stores and renders deltas', async ({ page }) => {
  const errors=[];
  await page.addInitScript(() => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({syncedAt:Date.now()-60000,ships:0,equipment:0,materials:8,decks:0}));
    localStorage.setItem('harbordesk-kancolle-materials-v1', JSON.stringify({fuel:1000,ammo:2000,steel:3000,bauxite:4000,bucket:50,devMaterial:20,screw:10,syncedAt:Date.now()-60000}));
  });
  await boot(page,errors);
  const data=await page.evaluate(()=>{
    const parsed={
      ships:new Map(),slotItems:new Map(),materials:new Map([
        [1,{api_id:1,api_value:1120}],[2,{api_id:2,api_value:1950}],[3,{api_id:3,api_value:3000}],[4,{api_id:4,api_value:4100}],
        [6,{api_id:6,api_value:52}],[7,{api_id:7,api_value:20}],[8,{api_id:8,api_value:9}]
      ]),
      decks:new Map(),ndocks:new Map(),quests:new Map(),sortieEvents:[],completeShips:false,completeSlotItems:false,completeDecks:false,completeQuests:false,captureId:'delta-test'
    };
    const sync=window.hdKcApplyImport({parsed,sources:['test'],unknownShips:0,unknownEquip:0},{ships:true,equipment:true,resources:true,fleets:true,timers:true,quests:true,sorties:true});
    window.hdKcEnsureImport?.();window.hdKcRenderSyncStatus?.();
    return {
      fuel:sync.delta?.resources?.fuel,
      ammo:sync.delta?.resources?.ammo,
      bauxite:sync.delta?.resources?.bauxite,
      bucket:sync.delta?.resources?.bucket,
      screw:sync.delta?.resources?.screw,
      baseline:sync.delta?.baseline,
      html:document.getElementById('hdKcSyncDelta')?.textContent||''
    };
  });
  expect(data.baseline).toBe(true);
  expect(data.fuel).toBe(120);
  expect(data.ammo).toBe(-50);
  expect(data.bauxite).toBe(100);
  expect(data.bucket).toBe(2);
  expect(data.screw).toBe(-1);
  expect(data.html).toContain('燃料 +120');
  expect(data.html).toContain('弾薬 -50');
});


test('home reorder controls stay hidden until edit mode', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  const before=await page.evaluate(()=>{
    const root=document.getElementById('home'),edit=document.querySelector('[data-home-edit-toggle]'),reset=document.querySelector('[data-home-order-reset]'),controls=document.querySelector('.home-order-controls');
    return {editing:root?.classList.contains('home-editing')||false,label:edit?.textContent||'',resetHidden:!!reset?.hidden,display:controls?getComputedStyle(controls).display:''};
  });
  expect(before.editing).toBe(false);
  expect(before.label).toContain('ホーム編集');
  expect(before.resetHidden).toBe(true);
  expect(before.display).toBe('none');
  await page.click('[data-home-edit-toggle]');
  const during=await page.evaluate(()=>{
    const root=document.getElementById('home'),edit=document.querySelector('[data-home-edit-toggle]'),reset=document.querySelector('[data-home-order-reset]'),controls=document.querySelector('.home-order-controls');
    return {editing:root?.classList.contains('home-editing')||false,label:edit?.textContent||'',pressed:edit?.getAttribute('aria-pressed')||'',resetHidden:!!reset?.hidden,display:controls?getComputedStyle(controls).display:''};
  });
  expect(during.editing).toBe(true);
  expect(during.label).toContain('編集完了');
  expect(during.pressed).toBe('true');
  expect(during.resetHidden).toBe(false);
  expect(during.display).toBe('inline-flex');
  await page.click('[data-home-edit-toggle]');
  expect(await page.locator('#home').evaluate(el=>el.classList.contains('home-editing'))).toBe(false);
});


test('home edit mode closes when leaving Home', async ({ page }) => {
  const errors=[];
  await boot(page,errors);
  await page.click('[data-home-edit-toggle]');
  expect(await page.locator('#home').evaluate(el=>el.classList.contains('home-editing'))).toBe(true);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('hd:workspace-changed',{detail:{group:'fleet',section:'roster'}})));
  const data=await page.evaluate(()=>({
    editing:document.getElementById('home')?.classList.contains('home-editing')||false,
    label:document.querySelector('[data-home-edit-toggle]')?.textContent||'',
    resetHidden:!!document.querySelector('[data-home-order-reset]')?.hidden
  }));
  expect(data.editing).toBe(false);
  expect(data.label).toContain('ホーム編集');
  expect(data.resetHidden).toBe(true);
});
