const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function openMapGear(page, world, map) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-equipment-check.js'] || '')).toBe('ok');
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator(`[data-world="${world}"]`).click();
  await page.locator(`[data-map="${map}"]`).click();
  await page.locator('[data-map-tab="gear"]').click();
  await expect(page.locator('.hd-se-panel')).toBeVisible();
}

test('3-2 sortie equipment check detects missing speed and radar gear', async ({ page }) => {
  await openMapGear(page, '3', '3-2');

  const panel = page.locator('.hd-se-panel');
  await expect(panel).toContainText('3-2 出撃装備チェック');
  await expect(panel).toContainText('高速化セット');
  await expect(panel).toContainText('電探');
  await expect(panel).toContainText('不足');

  await page.evaluate(() => localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
    { id:'radar', name:'33号水上電探', category:'小型水上電探', count:2, star:4, targetStar:10, assigned:'', memo:'' },
    { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
    { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' }
  ])));

  await page.locator('[data-hd-se-refresh]').click();
  const speed = panel.locator('.hd-se-check', { hasText: '高速化セット' });
  const radar = panel.locator('.hd-se-check', { hasText: '電探' }).filter({ hasNotText: '高速化セット' }).first();
  await expect(speed).toContainText('準備あり');
  await expect(speed).toContainText('タービン 1 / 缶 1');
  await expect(radar).toContainText('準備あり');
  await expect(panel).toContainText('33号水上電探 ★4 ×2');
});

test('sortie equipment check links to analyzer workspace', async ({ page }) => {
  await openMapGear(page, '3', '3-2');
  await page.locator('[data-hd-se-analyzer]').click();
  await expect(page.locator('[data-hd-ws-group="arsenal"]')).toHaveClass(/active/);
  await expect(page.locator('#hdEquipAnalyzer')).toBeVisible();
});
