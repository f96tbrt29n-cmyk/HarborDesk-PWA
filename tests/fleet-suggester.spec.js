const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-suggester.js'] || '')).toBe('ok');
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-readiness.js'] || '')).toBe('ok');
}

async function select32(page) {
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await expect(page.locator('[data-hd-fs-open]')).toBeVisible();
}

test('3-2 suggestion builds light cruiser plus five destroyers from roster', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    const rows = [
      { id:'cl', name:'テスト軽巡', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'主砲 / 電探', memo:'', tags:['主力'] },
      { id:'d1', name:'テスト駆逐A', type:'駆逐艦', level:'99', remodel:'改二', gear:'主砲 / 電探', memo:'', tags:['主力'] },
      { id:'d2', name:'テスト駆逐B', type:'駆逐艦', level:'95', remodel:'改二', gear:'主砲', memo:'', tags:['主力'] },
      { id:'d3', name:'テスト駆逐C', type:'駆逐艦', level:'91', remodel:'改二', gear:'主砲', memo:'', tags:[] },
      { id:'d4', name:'テスト駆逐D', type:'駆逐艦', level:'88', remodel:'改', gear:'主砲', memo:'', tags:[] },
      { id:'d5', name:'テスト駆逐E', type:'駆逐艦', level:'85', remodel:'改', gear:'主砲', memo:'', tags:[] },
      { id:'bb', name:'テスト戦艦', type:'戦艦', level:'120', remodel:'改二', gear:'主砲', memo:'', tags:['主力'] }
    ];
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify(rows));
  });

  await select32(page);
  await page.locator('[data-hd-fs-open]').click();

  await expect(page.locator('#hdFleetSuggester')).toBeVisible();
  const first = page.locator('.hd-fs-card').first();
  await expect(first).toContainText('軽巡1＋駆逐5');
  await expect(first).toContainText('テスト軽巡');
  await expect(first).toContainText('テスト駆逐A');
  await expect(first).toContainText('テスト駆逐E');
  await expect(first).not.toContainText('テスト戦艦');
  await expect(first).toContainText('候補完成');
});

test('suggested fleet can be saved and selected for sortie readiness', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'軽巡テスト', type:'軽巡洋艦', level:'90', remodel:'改二', gear:'主砲 / 電探', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'駆逐テスト'+(i+1), type:'駆逐艦', level:String(90-i), remodel:'改二', gear:'主砲 / 電探', memo:'', tags:[] }))
    ]));
  });

  await select32(page);
  await page.locator('[data-hd-fs-open]').click();
  await page.locator('.hd-fs-card').first().locator('[data-hd-fs-save="0"]').click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].name).toContain('3-2 自動提案');
  expect(saved['3-2'][0].ships.filter(x => x.ship)).toHaveLength(6);

  const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1') || '{}'));
  expect(selected['3-2']).toBe(saved['3-2'][0].id);
});

test('fleet suggester reports missing required ship types', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'軽巡だけ', type:'軽巡洋艦', level:'80', remodel:'改', gear:'', memo:'', tags:[] },
      { id:'d1', name:'駆逐1', type:'駆逐艦', level:'80', remodel:'改', gear:'', memo:'', tags:[] },
      { id:'d2', name:'駆逐2', type:'駆逐艦', level:'79', remodel:'改', gear:'', memo:'', tags:[] }
    ]));
  });

  await select32(page);
  await page.locator('[data-hd-fs-open]').click();

  const first = page.locator('.hd-fs-card').first();
  await expect(first).toContainText('不足あり');
  await expect(first).toContainText('不足艦種');
  await expect(first).toContainText('駆逐 が不足');
});

test('ship roster dialog exposes optional ship type selector', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => window.hdWSShowElement?.('roster', false));
  await page.locator('#addShipRoster').click();
  await expect(page.locator('#shipRosterDialog')).toBeVisible();
  await expect(page.locator('#rosterType')).toBeVisible();
  await page.locator('#rosterType').selectOption('航空巡洋艦');
  await expect(page.locator('#rosterType')).toHaveValue('航空巡洋艦');
});
