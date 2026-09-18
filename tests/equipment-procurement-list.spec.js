const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function open32Gear(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./equipment-procurement-list.js'] || '')).toBe('ok');
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-map-tab="gear"]').click();
  await expect(page.locator('.hd-se-panel')).toBeVisible();
}

test('map shortages can be saved to the procurement list', async ({ page }) => {
  await open32Gear(page);

  await page.locator('[data-hd-pl-add-current="3-2"]').click();
  await expect(page.locator('[data-hd-ws-group="arsenal"]')).toHaveClass(/active/);
  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible();

  const mapCard = page.locator('.hd-pl-map-card', { hasText: '3-2 調達リスト' });
  await expect(mapCard).toBeVisible();
  await expect(mapCard).toContainText('高速化セット');
  await expect(mapCard).toContainText('電探');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-equipment-procurement-v1') || '[]'));
  expect(saved.some(x => x.map === '3-2')).toBeTruthy();
});

test('procurement readiness updates from the equipment ledger', async ({ page }) => {
  await open32Gear(page);
  await page.locator('[data-hd-pl-add-current="3-2"]').click();

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
    window.hdPLRender?.();
  });

  const card = page.locator('.hd-pl-map-card', { hasText: '3-2 調達リスト' });
  const speed = card.locator('.hd-pl-req', { hasText: '高速化セット' });
  const radar = card.locator('.hd-pl-req', { hasText: '電探' }).filter({ hasNotText: '高速化セット' }).first();
  await expect(speed).toContainText('準備完了');
  await expect(radar).toContainText('準備完了');
});

test('procurement list persists across reload', async ({ page }) => {
  await open32Gear(page);
  await page.locator('[data-hd-pl-add-current="3-2"]').click();
  await page.reload();
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => window.hdWSShowElement?.('hdEquipmentProcurement', false));
  await expect(page.locator('#hdEquipmentProcurement')).toBeVisible();
  await expect(page.locator('.hd-pl-map-card')).toContainText('3-2 調達リスト');
});
