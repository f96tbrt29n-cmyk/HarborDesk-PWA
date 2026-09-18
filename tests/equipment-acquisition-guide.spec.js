const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function open32Gear(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./equipment-acquisition-guide.js'] || '')).toBe('ok');
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-map-tab="gear"]').click();
  await expect(page.locator('.hd-se-panel')).toBeVisible();
}

test('missing high-speed gear opens acquisition routes and development recipe', async ({ page }) => {
  await open32Gear(page);

  const speed = page.locator('.hd-se-check', { hasText: '高速化セット' });
  await expect(speed).toContainText('不足');
  await speed.locator('[data-hd-ag-kind="高速化"]').click();

  const dialog = page.locator('#hdAcquisitionDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('高速化セットの入手ルート');
  await expect(dialog).toContainText('改良型艦本式タービン');
  await expect(dialog).toContainText('強化型艦本式缶');
  await expect(dialog).toContainText('缶・タービン狙い');
  await expect(dialog).toContainText('燃100 / 弾10 / 鋼200 / ボ10');

  const turbine = dialog.locator('.hd-ag-card', { hasText: '改良型艦本式タービン' });
  await expect(turbine).toContainText('開発候補');
  await turbine.locator('[data-hd-ag-development]').click();
  await expect(page.locator('[data-hd-ws-group="arsenal"]')).toHaveClass(/active/);
  await expect(page.locator('#developmentLab')).toBeVisible();
});

test('radar shortage guide exposes catalog acquisition information', async ({ page }) => {
  await open32Gear(page);

  const radar = page.locator('.hd-se-check').filter({ has: page.locator('.hd-se-check-head strong', { hasText: /^電探$/ }) });
  await radar.locator('[data-hd-ag-kind="電探"]').click();

  const dialog = page.locator('#hdAcquisitionDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('33号水上電探');
  const card = dialog.locator('.hd-ag-card', { hasText: '33号水上電探' });
  await expect(card).toContainText('開発候補');
  await expect(card).toContainText('電探 全種狙い');
  await expect(card).toContainText('開発可能');
});
