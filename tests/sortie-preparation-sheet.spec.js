const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-preparation-sheet.js'] || '')).toBe('ok');
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./land-base-planner.js'] || '')).toBe('ok');
}

async function selectMap(page, world, map) {
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator(`[data-world="${world}"]`).click();
  await page.locator(`[data-map="${map}"]`).click();
  await expect(page.locator('[data-hd-sps-open]')).toBeVisible();
}

test('sortie preparation sheet combines saved fleet, roster and equipment readiness', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'s1', name:'矢矧改二乙', level:'99', remodel:'改二乙', gear:'主砲 / 電探', memo:'', tags:['主力'] },
      { id:'s2', name:'雪風改二', level:'98', remodel:'改二', gear:'主砲 / 電探', memo:'', tags:['主力'] }
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '3-2': [{
        id:'f32', name:'3-2 テスト艦隊',
        ships:[
          { ship:'矢矧改二乙', gear:'主砲 / 33号水上電探' },
          { ship:'雪風改二', gear:'主砲 / 33号水上電探' },
          { ship:'', gear:'' },{ ship:'', gear:'' },{ ship:'', gear:'' },{ ship:'', gear:'' }
        ],
        memo:'高速ルート確認', createdAt:Date.now(), updatedAt:Date.now()
      }]
    }));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });

  await selectMap(page, '3', '3-2');
  await page.locator('[data-hd-sps-open]').click();

  await expect(page.locator('[data-hd-ws-group="guide"]')).toHaveClass(/active/);
  await expect(page.locator('#hdSortiePreparation')).toBeVisible();
  await expect(page.locator('#hdSortiePreparationMap')).toContainText('3-2');
  await expect(page.locator('#hdSortiePreparationBody')).toContainText('3-2 テスト艦隊');
  await expect(page.locator('#hdSortiePreparationBody')).toContainText('矢矧改二乙');
  await expect(page.locator('#hdSortiePreparationBody')).toContainText('Lv.99');
  await expect(page.locator('#hdSortiePreparationBody')).toContainText('高速化セット');
  await expect(page.locator('#hdSortiePreparationBody')).toContainText('電探');
});

test('6-5 preparation sheet includes land-base readiness', async ({ page }) => {
  await boot(page);
  await selectMap(page, '6', '6-5');
  await page.locator('[data-hd-sps-open]').click();

  const body = page.locator('#hdSortiePreparationBody');
  await expect(body).toContainText('基地航空隊');
  await expect(body).toContainText('出撃可能 2部隊');
  await expect(body).toContainText('第1航空隊');
  await expect(body).toContainText('第2航空隊');
  await expect(body).toContainText('4中隊');
});

test('preparation sheet quick action returns to the selected map gear tab', async ({ page }) => {
  await boot(page);
  await selectMap(page, '3', '3-2');
  await page.locator('[data-hd-sps-open]').click();

  await page.locator('#hdSortiePreparation [data-hd-sps-tab="gear"]').first().click();
  await expect(page.locator('#guide')).toBeVisible();
  await expect(page.locator('[data-map-tab="gear"]')).toHaveClass(/active/);
  await expect(page.locator('[data-map-pane="gear"]')).toHaveClass(/active/);
});
