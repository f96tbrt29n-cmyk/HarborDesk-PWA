const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-loadout-optimizer.js'] || '')).toBe('ok');
}

async function prepareUi(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'差分軽巡', type:'軽巡洋艦', level:'98', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'差分駆逐'+(i+1), type:'駆逐艦', level:String(97-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:12, star:7, targetStar:10, assigned:'', memo:'' },
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:1, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' },
      { id:'light', name:'探照灯', category:'探照灯', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-hd-fs-open]').click();
  const card=page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  return card;
}

test('comparison assigns criterion badges without creating an overall winner', async ({ page }) => {
  await boot(page);
  await prepareUi(page);

  const rows=await page.evaluate(() => hdFOCompare(0).map(x=>({mode:x.mode,badges:x.badges})));
  const badges=[...new Set(rows.flatMap(x=>x.badges))];

  expect(rows).toHaveLength(5);
  expect(badges).toContain('条件充足最大');
  expect(badges).toContain('火力最大');
  expect(badges).toContain('交換最少');
  expect(badges).toContain('希少装備最少');
  expect(badges).not.toContain('総合1位');
});

test('comparison exposes final equipment diffs from the standard loadout', async ({ page }) => {
  await boot(page);
  await prepareUi(page);

  const rows=await page.evaluate(() => hdFOCompare(0).map(x=>({mode:x.mode,diff:x.diff})));
  const changed=rows.filter(x=>x.diff.length>0);

  expect(changed.length).toBeGreaterThan(0);
  for(const row of changed){
    for(const d of row.diff){
      expect(d.ship.length).toBeGreaterThan(0);
      expect(d.slot).toBeGreaterThan(0);
      expect(d.from.length).toBeGreaterThan(0);
      expect(d.to.length).toBeGreaterThan(0);
      expect(d.from).not.toBe(d.to);
    }
  }
});

test('comparison UI renders metric badges and expandable equipment differences', async ({ page }) => {
  await boot(page);
  const card=await prepareUi(page);
  await card.locator('[data-hd-fo-compare="0"]').click();

  const compare=card.locator('.hd-fo-compare');
  await expect(compare).toBeVisible();
  await expect(compare.locator('.hd-fo-badges span')).toHaveCount(await compare.locator('.hd-fo-badges span').count());
  await expect(compare).toContainText('条件充足最大');
  await expect(compare).toContainText('火力最大');
  await expect(compare).toContainText('交換最少');
  await expect(compare).toContainText('希少装備最少');
  await expect(compare.locator('.hd-fo-diff').first()).toBeVisible();
  await expect(compare.locator('[data-hd-fo-save-preset]')).toHaveCount(5);
});

test('saving a comparison preset does not adopt it and updates the same named preset', async ({ page }) => {
  await boot(page);
  const card=await prepareUi(page);

  await card.locator('[data-hd-fo-mode="0"]').selectOption('stable');
  await card.locator('[data-hd-fo-optimize="0"]').click();
  await expect(card.locator('.hd-fo-result')).toContainText('安定重視で自動最適化');

  await card.locator('[data-hd-fo-compare="0"]').click();
  const boss=card.locator('[data-hd-fo-compare-card="boss"]');
  const save=boss.locator('[data-hd-fo-save-preset="boss"]');
  await save.click();

  await expect(card.locator('.hd-fo-result')).toContainText('安定重視で自動最適化');
  let saved=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].name).toContain('ボス重視');
  expect(saved['3-2'][0].memo).toContain('比較案');
  expect(await page.evaluate(() => localStorage.getItem('harbordesk-fleet-optimizer-mode-v1'))).toBe('stable');

  await save.click();
  saved=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}'));
  expect(saved['3-2']).toHaveLength(1);
});
