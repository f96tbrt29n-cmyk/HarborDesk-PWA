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

async function seedStrategyInventory(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:9, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:1, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' },
      { id:'light', name:'探照灯', category:'探照灯', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });
}

async function makeManualPlan(page) {
  return await page.evaluate(() => {
    const slot = name => ({ profile:{ row:{ id:name, name, gear:'', tags:[] }, type:'駆逐艦', roles:[], tags:[], level:90, speed:'高速' }, required:'駆逐' });
    return {
      map:'3-2',
      index:0,
      suggestion:{ slots:[slot('駆逐A'),slot('駆逐B'),slot('駆逐C')], needs:[] },
      ships:Array.from({length:3},(_,si)=>({
        ship:'駆逐'+String.fromCharCode(65+si),
        type:'駆逐艦',
        items:[
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'utility'}
        ],
        missing:[]
      })),
      missing:[],used:{},owned:{}
    };
  });
}

test('route and boss strategies choose different first priorities on the same 3-2 plan', async ({ page }) => {
  await boot(page);
  await seedStrategyInventory(page);
  const plan = await makeManualPlan(page);

  const result = await page.evaluate(({ plan }) => ({
    route: hdFOOptimize(plan, 'route'),
    boss: hdFOOptimize(plan, 'boss')
  }), { plan });

  expect(result.route.optimization.strategy).toBe('route');
  expect(result.boss.optimization.strategy).toBe('boss');
  expect(result.route.optimization.changes.length).toBeGreaterThan(0);
  expect(result.boss.optimization.changes.length).toBeGreaterThan(0);

  expect(result.route.optimization.changes[0].kind).toBe('高速化');
  expect(result.boss.optimization.changes[0].kind).toBe('夜戦');
});

test('reserve strategy caps swaps and records its strategy label', async ({ page }) => {
  await boot(page);
  await seedStrategyInventory(page);
  const plan = await makeManualPlan(page);

  const result = await page.evaluate(({ plan }) => hdFOOptimize(plan, 'reserve'), { plan });
  expect(result.optimization.strategy).toBe('reserve');
  expect(result.optimization.strategyLabel).toBe('装備温存');
  expect(result.optimization.changes.length).toBeLessThanOrEqual(3);

  for (const [name, used] of Object.entries(result.used)) {
    expect(used, `${name} usage exceeds inventory`).toBeLessThanOrEqual(result.owned[name] || 0);
  }
});

async function prepareUi(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'方針軽巡', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'方針駆逐'+(i+1), type:'駆逐艦', level:String(95-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:12, star:4, targetStar:10, assigned:'', memo:'' },
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

test('strategy selector exposes five modes and persists the selected mode', async ({ page }) => {
  await boot(page);
  const card=await prepareUi(page);

  const select=card.locator('[data-hd-fo-mode="0"]');
  await expect(select).toBeVisible();
  await expect(select.locator('option')).toHaveCount(5);

  await select.selectOption('reserve');
  await expect(select).toHaveValue('reserve');
  await expect(card.locator('.hd-fo-mode small')).toContainText('高改修');

  const stored=await page.evaluate(() => localStorage.getItem('harbordesk-fleet-optimizer-mode-v1'));
  expect(stored).toBe('reserve');

  await card.locator('[data-hd-fo-optimize="0"]').click();
  await expect(card.locator('.hd-fo-result')).toContainText('装備温存で自動最適化');
});
