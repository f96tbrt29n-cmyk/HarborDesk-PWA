const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  serviceWorkers: 'block',
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-loadout-optimizer.js'] || '')).toBe('ok');
  await page.waitForFunction(() => document.body?.dataset?.hdReady === '1', null, { timeout: 30000 });
}

async function seedOptimizerInventory(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:9, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:1, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });
}

test('optimizer improves 3-2 speed and radar requirements without exceeding inventory', async ({ page }) => {
  await boot(page);
  await seedOptimizerInventory(page);

  const result = await page.evaluate(() => {
    const slot = name => ({ profile:{ row:{ id:name, name, gear:'', tags:[] }, type:'駆逐艦', roles:[], tags:[], level:90, speed:'高速' }, required:'駆逐' });
    const plan = {
      map:'3-2',
      index:0,
      suggestion:{ slots:[slot('駆逐A'),slot('駆逐B'),slot('駆逐C')], needs:[] },
      ships:[
        { ship:'駆逐A', type:'駆逐艦', items:[
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'utility'}
        ], missing:[] },
        { ship:'駆逐B', type:'駆逐艦', items:[
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'utility'}
        ], missing:[] },
        { ship:'駆逐C', type:'駆逐艦', items:[
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'smallGun'},
          {name:'10cm連装高角砲＋高射装置',star:4,category:'小口径主砲',kind:'utility'}
        ], missing:[] }
      ],
      missing:[], used:{}, owned:{}
    };
    const before = hdFEEvaluate(plan);
    const optimized = hdFOOptimize(plan);
    const after = hdFEEvaluate(optimized);
    return {before,after,optimized};
  });

  const beforeSpeed = result.before.requirements.find(x => x.kind === '高速化');
  const beforeRadar = result.before.requirements.find(x => x.kind === '電探');
  const afterSpeed = result.after.requirements.find(x => x.kind === '高速化');
  const afterRadar = result.after.requirements.find(x => x.kind === '電探');

  expect(beforeSpeed.status).toBe('missing');
  expect(beforeRadar.status).toBe('missing');
  expect(afterSpeed.status).toBe('ready');
  expect(afterRadar.status).toBe('ready');
  expect(result.optimized.optimization.changes.length).toBeGreaterThanOrEqual(3);

  for (const [name, used] of Object.entries(result.optimized.used)) {
    expect(used, `${name} usage exceeds inventory`).toBeLessThanOrEqual(result.optimized.owned[name] || 0);
  }
  for (const [stack, used] of Object.entries(result.optimized.usedStacks)) {
    expect(used, `${stack} stack usage exceeds inventory`).toBeLessThanOrEqual(result.optimized.ownedStacks[stack] || 0);
  }
});

test('optimizer leaves unresolved requirements visible when inventory cannot satisfy them', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:3, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });

  const result = await page.evaluate(() => {
    const slot={ profile:{ row:{ id:'d', name:'駆逐A', gear:'', tags:[] }, type:'駆逐艦', roles:[], tags:[], level:90, speed:'高速' }, required:'駆逐' };
    const plan={map:'3-2',index:0,suggestion:{slots:[slot],needs:[]},ships:[{ship:'駆逐A',type:'駆逐艦',items:[
      {name:'10cm連装高角砲＋高射装置',star:0,category:'小口径主砲',kind:'smallGun'},
      {name:'10cm連装高角砲＋高射装置',star:0,category:'小口径主砲',kind:'smallGun'},
      {name:'10cm連装高角砲＋高射装置',star:0,category:'小口径主砲',kind:'utility'}
    ],missing:[]}],missing:[],used:{},owned:{}};
    return hdFOOptimize(plan);
  });

  expect(result.optimization.changes).toHaveLength(0);
  expect(result.optimization.unresolved.some(x => x.kind === '高速化')).toBeTruthy();
  expect(result.optimization.unresolved.some(x => x.kind === '電探')).toBeTruthy();
});

async function prepareUi(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'最適化軽巡', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'最適化駆逐'+(i+1), type:'駆逐艦', level:String(95-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'gun', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:12, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'radar', name:'33号水上電探', category:'小型水上電探', count:1, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'turbine', name:'改良型艦本式タービン', category:'機関部強化', count:1, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'boiler', name:'新型高温高圧缶', category:'機関部強化', count:1, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-hd-fs-open]').click();
  await page.locator('.hd-fs-card').first().locator('[data-hd-fl-generate="0"]').click();
}

test('optimizer UI shows swaps and optimized loadout can be saved', async ({ page }) => {
  await boot(page);
  await prepareUi(page);

  const card=page.locator('.hd-fs-card').first();
  const optimize=card.locator('[data-hd-fo-optimize="0"]');
  await expect(optimize).toBeVisible();
  await optimize.click();

  await expect(card.locator('.hd-fo-result')).toBeVisible();
  await expect(card.locator('.hd-fo-result')).toContainText('安定重視で自動最適化');
  await expect(card.locator('[data-hd-fo-reset="0"]')).toBeVisible();
  await expect(card.locator('.hd-fl-usage')).not.toContainText('所持0');
  await expect(card.locator('.hd-fl-usage')).not.toContainText('@@');
  await page.evaluate(() => {
    window.dispatchEvent(new Event('hd:ship-images-ready'));
    window.dispatchEvent(new Event('hd:map-rendered'));
  });
  await expect(card.locator('.hd-fo-result')).toBeVisible();
  await expect(card.locator('.hd-fl-usage')).not.toContainText('所持0');

  await card.locator('[data-hd-fl-save="0"]').click();
  const saved=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-custom-fleets-v1')||'{}'));
  expect(saved['3-2']).toHaveLength(1);
  expect(saved['3-2'][0].name).toContain('自動提案＋装備');
  const gear=saved['3-2'][0].ships.map(x=>x.gear).join(' / ');
  expect(gear).toMatch(/33号水上電探|改良型艦本式タービン|新型高温高圧缶/);
});
