const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('resource snapshot refreshes history and budget consumers immediately', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-resource-history-v1', '[]');
    state.resources = { fuel: 10000, ammo: 11000, steel: 12000, bauxite: 13000, savedAt: Date.now() };
    save();
    renderResources();
    snapshotResources();
  });

  const first = await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('harbordesk-resource-history-v1') || '[]');
    return {
      count: rows.length,
      fuel: rows[0]?.fuel,
      recent: document.querySelector('#hdResourceBudget')?.textContent || '',
      dashboard: document.querySelector('#home')?.textContent || ''
    };
  });

  expect(first.count).toBe(1);
  expect(first.fuel).toBe(10000);
  expect(first.recent).toContain('10,000');

  await page.evaluate(() => {
    state.resources = { fuel: 12000, ammo: 12500, steel: 13000, bauxite: 14000, savedAt: Date.now() };
    save();
    renderResources();
    snapshotResources();
  });

  const second = await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('harbordesk-resource-history-v1') || '[]');
    return {
      count: rows.length,
      topFuel: rows[0]?.fuel,
      budgetText: document.querySelector('#hdResourceBudget')?.textContent || ''
    };
  });

  expect(second.count).toBe(2);
  expect(second.topFuel).toBe(12000);
  expect(second.budgetText).toContain('12,000');
  expect(errors).toEqual([]);
});
