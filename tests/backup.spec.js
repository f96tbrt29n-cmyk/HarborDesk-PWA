const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });

test('external backup restore replaces only HarborDesk localStorage keys', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(2500);

  const result = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ci-stale', JSON.stringify({ stale: true }));
    localStorage.setItem('harbordesk-ci-keep', JSON.stringify({ value: 'old' }));
    localStorage.setItem('unrelated-ci-key', 'keep-me');

    const restored = hdApplyBackupLocalStorage({
      'harbordesk-ci-keep': JSON.stringify({ value: 'new' }),
      'harbordesk-ci-new': JSON.stringify({ ok: true })
    });

    return {
      restored,
      stale: localStorage.getItem('harbordesk-ci-stale'),
      keep: localStorage.getItem('harbordesk-ci-keep'),
      fresh: localStorage.getItem('harbordesk-ci-new'),
      unrelated: localStorage.getItem('unrelated-ci-key')
    };
  });

  expect(result.restored).toBe(2);
  expect(result.stale).toBeNull();
  expect(JSON.parse(result.keep).value).toBe('new');
  expect(JSON.parse(result.fresh).ok).toBeTruthy();
  expect(result.unrelated).toBe('keep-me');
  expect(errors).toEqual([]);
});
