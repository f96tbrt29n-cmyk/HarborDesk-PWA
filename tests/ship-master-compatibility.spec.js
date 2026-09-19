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
