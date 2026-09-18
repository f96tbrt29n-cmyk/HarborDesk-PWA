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
      { id:'cl', name:'比較軽巡', type:'軽巡洋艦', level:'97', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'比較駆逐'+(i+1), type:'駆逐艦', level:String(96-i), remodel:'改二', gear:'', memo:'', tags:[] }))
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

test('five-mode comparison returns one independent result per strategy', async ({ page }) => {
  await boot(page);
  await prepareUi(page);

  const rows=await page.evaluate(() => hdFOCompare(0).map(x => ({
    mode:x.mode,label:x.label,ready:x.ready,total:x.total,missing:x.missing,
    changes:x.changes,equipAttack:x.equipAttack,rareSlots:x.rareSlots
  })));

  expect(rows).toHaveLength(5);
  expect(rows.map(x=>x.mode)).toEqual(['stable','firepower','route','boss','reserve']);
  for(const row of rows){
    expect(row.label.length).toBeGreaterThan(0);
    expect(row.total).toBeGreaterThan(0);
    expect(row.ready).toBeGreaterThanOrEqual(0);
    expect(row.missing).toBeGreaterThanOrEqual(0);
    expect(row.changes).toBeGreaterThanOrEqual(0);
    expect(row.equipAttack).toBeGreaterThanOrEqual(0);
    expect(row.rareSlots).toBeGreaterThanOrEqual(0);
  }
});

test('comparison UI shows five cards and useful side-by-side metrics', async ({ page }) => {
  await boot(page);
  const card=await prepareUi(page);

  await card.locator('[data-hd-fo-compare="0"]').click();
  const compare=card.locator('.hd-fo-compare');
  await expect(compare).toBeVisible();
  await expect(compare.locator('.hd-fo-compare-card')).toHaveCount(5);
  await expect(compare).toContainText('安定重視');
  await expect(compare).toContainText('火力重視');
  await expect(compare).toContainText('道中突破重視');
  await expect(compare).toContainText('ボス重視');
  await expect(compare).toContainText('装備温存');
  await expect(compare).toContainText('条件充足');
  await expect(compare).toContainText('交換');
  await expect(compare).toContainText('装備 火力+雷装');
  await expect(compare).toContainText('希少・高改修');
});

test('comparison does not change current plan until a mode is adopted', async ({ page }) => {
  await boot(page);
  const card=await prepareUi(page);

  await card.locator('[data-hd-fo-mode="0"]').selectOption('stable');
  await card.locator('[data-hd-fo-optimize="0"]').click();
  await expect(card.locator('.hd-fo-result')).toContainText('安定重視で自動最適化');

  await card.locator('[data-hd-fo-compare="0"]').click();
  await expect(card.locator('.hd-fo-result')).toContainText('安定重視で自動最適化');

  const boss=card.locator('[data-hd-fo-compare-card="boss"]');
  await boss.locator('[data-hd-fo-adopt="boss"]').click();
  await expect(card.locator('.hd-fo-result')).toContainText('ボス重視で自動最適化');

  const stored=await page.evaluate(() => localStorage.getItem('harbordesk-fleet-optimizer-mode-v1'));
  expect(stored).toBe('boss');

  await card.locator('[data-hd-fl-save="0"]').click();
  const saved=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].ships.some(x=>x.gear)).toBeTruthy();
});
