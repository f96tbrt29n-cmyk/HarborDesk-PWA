const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
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

    document.querySelector('[data-hd-shipdb-image-filter="registered"]')?.click();
    const registeredText = document.getElementById('hdShipDbList')?.textContent || '';
    const coverageText = document.getElementById('hdShipDbImageCoverage')?.textContent || '';

    await window.hdShipImageDelete?.(541);

    return {
      imported,
      coverage,
      hasNagato,
      missingText,
      registeredText,
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
  expect(data.missingText).not.toContain('長門改二');
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
