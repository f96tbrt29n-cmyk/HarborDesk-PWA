const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 45000 });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 45000 });
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-loadout-planner.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
  await expect.poll(
    () => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-suggester.js'] || ''),
    { timeout: 45000 }
  ).toBe('ok');
}

async function prepare32(page, sparse = false) {
  await page.evaluate(({ sparse }) => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'軽巡装備テスト', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'駆逐装備テスト'+(i+1), type:'駆逐艦', level:String(95-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify(sparse ? [
      { id:'g1', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:1, star:2, targetStar:10, assigned:'', memo:'' }
    ] : [
      { id:'g1', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:10, star:6, targetStar:10, assigned:'', memo:'' },
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:2, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'t1', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'b1', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' },
      { id:'f1', name:'61cm五連装(酸素)魚雷', category:'魚雷', count:4, star:3, targetStar:10, assigned:'', memo:'' }
    ]));
  }, { sparse });

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await expect(page.locator('#guide')).toBeVisible({ timeout: 15000 });
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await expect.poll(
    () => page.evaluate(() => typeof selectedMap !== 'undefined' ? selectedMap : ''),
    { timeout: 15000 }
  ).toBe('3-2');
  const open = page.locator('[data-hd-fs-open]');
  await expect(open).toBeVisible({ timeout: 15000 });
  await open.click();
  await expect(page.locator('#hdFleetSuggester')).toHaveCount(1);
  await expect.poll(
    () => page.evaluate(() => {
      const el=document.getElementById('hdFleetSuggester');
      return {
        section:window.hdWSState?.sections?.guide||'',
        visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
      };
    }),
    { timeout: 15000 }
  ).toEqual({ section:'hdFleetSuggester', visible:true });
}

test('automatic loadout never consumes more equipment than owned', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  const plan = await page.evaluate(() => window.hdFLGenerate?.(0));
  expect(plan).toBeTruthy();

  for (const [name, used] of Object.entries(plan.used)) {
    expect(used, `${name} usage exceeds inventory`).toBeLessThanOrEqual(plan.owned[name] || 0);
  }
  expect(Object.keys(plan.used).length).toBeGreaterThan(0);
  expect(plan.ships.filter(x => x.ship)).toHaveLength(6);
});

test('fleet suggester recovers after a late redraw and yields to newer guide navigation', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  // The old recovery window ended at 3.6s. Force a non-user redraw after that
  // point and verify the new 6.5s settle pass restores the fleet suggester.
  await page.waitForTimeout(4200);
  const before = await page.evaluate(() => {
    const epoch = Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH) || 0;
    window.hdWSApply?.('guide', 'guide', { ignorePin:true });
    const el=document.getElementById('hdFleetSuggester');
    return {
      epoch,
      section:window.hdWSState?.sections?.guide||'',
      visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
    };
  });

  expect(before.section).toBe('guide');
  expect(before.visible).toBe(false);

  await expect.poll(
    () => page.evaluate(() => {
      const el=document.getElementById('hdFleetSuggester');
      return {
        section:window.hdWSState?.sections?.guide||'',
        visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
      };
    }),
    { timeout: 5000 }
  ).toEqual({ section:'hdFleetSuggester', visible:true });

  // A later explicit move inside the same guide workspace must cancel the
  // remaining 9.5s / 13.5s recovery passes instead of reopening the suggester.
  const explicit = await page.evaluate(() => {
    const recoveredEpoch=Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0;
    window.hdWSShowElement?.('guide', false);
    return {
      recoveredEpoch,
      epoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,
      section:window.hdWSState?.sections?.guide||''
    };
  });
  expect(explicit.epoch).toBeGreaterThan(explicit.recoveredEpoch);
  expect(explicit.section).toBe('guide');

  await page.waitForTimeout(3600);
  const after = await page.evaluate(() => {
    const el=document.getElementById('hdFleetSuggester');
    return {
      epoch:Number(window.__HD_WORKSPACE_DIRECT_NAV_EPOCH)||0,
      section:window.hdWSState?.sections?.guide||'',
      visible:!!el&&!el.hidden&&!el.classList.contains('hd-ws-hidden')
    };
  });
  expect(after.epoch).toBe(explicit.epoch);
  expect(after.section).toBe('guide');
  expect(after.visible).toBe(false);
});

test('generated loadout can be saved into the custom fleet gear fields', async ({ page }) => {
  await boot(page);
  await prepare32(page, false);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await page.waitForTimeout(650);
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await expect(card.locator('.hd-fl-usage')).toContainText('所持');

  await card.locator('[data-hd-fl-save="0"]').click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1') || '{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].name).toContain('自動提案＋装備');
  expect(saved['3-2'][0].ships.filter(x => x.ship && x.gear).length).toBeGreaterThan(0);

  const selected = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1') || '{}'));
  expect(selected['3-2']).toBe(saved['3-2'][0].id);
});

test('sparse inventory is shown as unfilled loadout slots instead of invented gear', async ({ page }) => {
  await boot(page);
  await prepare32(page, true);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  const plan = card.locator('.hd-fl-plan');
  await expect(plan).toBeVisible();
  await expect(plan).toContainText('未配備');

  const data = await page.evaluate(() => window.hdFLGenerate?.(0));
  expect(data.missing.length).toBeGreaterThan(0);
  for (const [name, used] of Object.entries(data.used)) {
    expect(used).toBeLessThanOrEqual(data.owned[name] || 0);
  }
});

test('generated loadout survives fleet rerender after ship images become ready', async ({ page }) => {
  await boot(page);
  await prepare32(page, true);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();
  await expect(card.locator('.hd-fl-plan')).toBeVisible();
  await expect(card.locator('.hd-fl-plan')).toContainText('未配備');

  await page.evaluate(() => window.dispatchEvent(new Event('hd:ship-images-ready')));

  await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-plan')).toBeVisible();
  await expect(page.locator('.hd-fs-card').first().locator('.hd-fl-plan')).toContainText('未配備');
});

