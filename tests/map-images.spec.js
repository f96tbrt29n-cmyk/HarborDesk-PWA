const { test, expect } = require('@playwright/test');

test('all 37 map images decode locally and preserve their source aspect ratio', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await expect.poll(() => page.evaluate(() => typeof hdMapReferenceImage)).toBe('function');
  const failures = await page.evaluate(async () => {
    const manifest = await (await fetch('./assets/maps/sources.json')).json();
    const maps = Object.values(MAPS).flat();
    if (maps.length !== 37) return ['unexpected map count'];
    return (await Promise.all(maps.map(async map => {
      const img = new Image();
      img.src = `./assets/maps/${map}.png`;
      try { await img.decode(); } catch { return `${map}: decode failed`; }
      const row = manifest.assets[map];
      return img.naturalWidth === row.width && img.naturalHeight === row.height ? null : `${map}: dimensions differ`;
    }))).filter(Boolean);
  });
  expect(failures).toEqual([]);
});

test('map pane and enlarged view use the same source image without unverified overlays', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => hdWSShowElement('guide', false));
  await page.locator('[data-world="1"]').click();
  await page.locator('[data-map="1-1"]').click();
  await page.locator('[data-map-tab="map"]').click();
  const pane = page.locator('[data-map-pane="map"]');
  await expect(pane.locator('.hd-map-reference-image')).toBeVisible();
  await expect(pane.locator('svg, #hdRouteHighlight')).toHaveCount(0);
  const src = await pane.locator('img').getAttribute('src');
  await pane.locator('[data-hd-map-open]').click();
  await expect(page.locator('#hdMapImageDialog')).toBeVisible();
  await expect(page.locator('#hdMapImageDialog img')).toHaveAttribute('src', src);
});
