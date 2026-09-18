const { test, expect } = require('@playwright/test');

test('equipment analyzer loads and compares catalog equipment', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForSelector('#hdEquipAnalyzer',{state:'attached'});
  await page.evaluate(() => window.hdWSShowElement?.('hdEquipAnalyzer', false));
  await expect(page.locator('#hdEquipAnalyzer')).toBeVisible();
  await expect(page.locator('#hdEquipCoverageGrid .hd-ea-card')).toHaveCount(8);

  const a=page.locator('#hdEquipCompareA');
  const b=page.locator('#hdEquipCompareB');
  await a.selectOption({ label: '10cm連装高角砲＋高射装置' });
  await b.selectOption({ label: '33号水上電探' });
  await expect(page.locator('#hdEquipCompareResult')).toContainText('10cm連装高角砲＋高射装置');
  await expect(page.locator('#hdEquipCompareResult')).toContainText('33号水上電探');
});

test('equipment analyzer reflects owned ledger after reload', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(() => localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
    { id:'t1', name:'33号水上電探', category:'小型水上電探', count:2, star:6, targetStar:10, assigned:'', memo:'' }
  ])));
  await page.reload();
  await page.waitForSelector('#hdEquipAnalyzer',{state:'attached'});
  await page.evaluate(() => window.hdWSShowElement?.('hdEquipAnalyzer', false));
  await expect(page.locator('#hdEquipAnalyzer')).toBeVisible();
  await expect(page.locator('[data-hd-ea-pick="33号水上電探"]').first()).toContainText('所持 2');
  await expect(page.locator('[data-hd-ea-pick="33号水上電探"]').first()).toContainText('★6');
});
