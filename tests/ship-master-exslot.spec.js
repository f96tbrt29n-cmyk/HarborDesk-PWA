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

test('expansion permissions work even without a normal slot or normal category access', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const checks = await page.evaluate(() => {
    const maruyu = window.hdShipDbMasterRowByName?.('まるゆ');
    const maruyuTurboNormal = window.hdShipDbMasterNormalCheck?.(maruyu, '改良型艦本式タービン');
    const maruyuTurboEx = window.hdShipDbMasterExslotCheck?.(maruyu, '改良型艦本式タービン', 0, maruyuTurboNormal);
    const maruyuRepairNormal = window.hdShipDbMasterNormalCheck?.(maruyu, '応急修理要員');
    const maruyuRepairEx = window.hdShipDbMasterExslotCheck?.(maruyu, '応急修理要員', 0, maruyuRepairNormal);

    const shimushu = window.hdShipDbMasterRowByName?.('占守改');
    const shimushuTurboNormal = window.hdShipDbMasterNormalCheck?.(shimushu, '改良型艦本式タービン');
    const shimushuTurboEx = window.hdShipDbMasterExslotCheck?.(shimushu, '改良型艦本式タービン', 0, shimushuTurboNormal);

    return {
      maruyuSlots: maruyu?.slots?.length || 0,
      maruyuTurbo: {
        normal: !!maruyuTurboNormal?.allowed,
        base: !!maruyuTurboNormal?.baseAllowed,
        ex: !!maruyuTurboEx?.allowed,
        mode: maruyuTurboEx?.mode || ''
      },
      maruyuRepair: {
        normal: !!maruyuRepairNormal?.allowed,
        base: !!maruyuRepairNormal?.baseAllowed,
        ex: !!maruyuRepairEx?.allowed,
        mode: maruyuRepairEx?.mode || ''
      },
      shimushuTurbo: {
        normal: !!shimushuTurboNormal?.allowed,
        base: !!shimushuTurboNormal?.baseAllowed,
        ex: !!shimushuTurboEx?.allowed,
        mode: shimushuTurboEx?.mode || ''
      }
    };
  });

  expect(checks.maruyuSlots).toBe(0);
  expect(checks.maruyuTurbo.normal).toBeFalsy();
  expect(checks.maruyuTurbo.base).toBeTruthy();
  expect(checks.maruyuTurbo.ex).toBeTruthy();
  expect(checks.maruyuTurbo.mode).toBe('global');

  expect(checks.maruyuRepair.normal).toBeFalsy();
  expect(checks.maruyuRepair.base).toBeTruthy();
  expect(checks.maruyuRepair.ex).toBeTruthy();
  expect(checks.maruyuRepair.mode).toBe('common');

  expect(checks.shimushuTurbo.normal).toBeFalsy();
  expect(checks.shimushuTurbo.base).toBeFalsy();
  expect(checks.shimushuTurbo.ex).toBeTruthy();
  expect(checks.shimushuTurbo.mode).toBe('global');

  await page.evaluate(() => window.hdShipDbOpenEquipChecker?.('まるゆ'));
  await page.locator('#hdShipEquipCheckEquip').fill('改良型艦本式タービン');
  await page.locator('[data-hd-equip-check-run]').click();

  const result = page.locator('#hdShipEquipCheckResult');
  await expect(result).toContainText('通常スロット ×');
  await expect(result).toContainText('補強増設 ○');
  await expect(result).toContainText('全艦個別許可');

  expect(errors, `runtime errors: ${errors.join('\n')}`).toEqual([]);
});
