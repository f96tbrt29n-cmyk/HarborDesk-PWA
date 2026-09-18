const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./fleet-readiness-evaluator.js'] || '')).toBe('ok');
}

async function prepare32(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      { id:'cl', name:'評価軽巡', type:'軽巡洋艦', level:'96', remodel:'改二', gear:'', memo:'', tags:['主力'] },
      ...Array.from({length:5},(_,i)=>({ id:'d'+i, name:'評価駆逐'+(i+1), type:'駆逐艦', level:String(95-i), remodel:'改二', gear:'', memo:'', tags:[] }))
    ]));
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'g1', name:'10cm連装高角砲＋高射装置', category:'小口径主砲', count:10, star:6, targetStar:10, assigned:'', memo:'' },
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:4, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'t1', name:'改良型艦本式タービン', category:'機関部強化', count:2, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'b1', name:'新型高温高圧缶', category:'機関部強化', count:2, star:0, targetStar:10, assigned:'', memo:'' },
      { id:'f1', name:'61cm五連装(酸素)魚雷', category:'魚雷', count:4, star:3, targetStar:10, assigned:'', memo:'' }
    ]));
  });

  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-hd-fs-open]').click();
  await expect(page.locator('#hdFleetSuggester')).toBeVisible();
}

test('readiness scorecard evaluates only equipment actually assigned to the plan', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-equipment-v1', JSON.stringify([
      { id:'r1', name:'33号水上電探', category:'小型水上電探', count:9, star:4, targetStar:10, assigned:'', memo:'' },
      { id:'t1', name:'改良型艦本式タービン', category:'機関部強化', count:9, star:0, targetStar:0, assigned:'', memo:'' },
      { id:'b1', name:'新型高温高圧缶', category:'機関部強化', count:9, star:0, targetStar:10, assigned:'', memo:'' }
    ]));
  });
  await page.evaluate(() => {
    window.__manualReadiness = hdFEEvaluate({
      map:'3-2',
      ships:[{ship:'評価艦',items:[{name:'33号水上電探',star:4,category:'小型水上電探',kind:'utility'}]}]
    });
  });

  const result = await page.evaluate(() => window.__manualReadiness);
  const radar = result.requirements.find(x => x.kind === '電探');
  const speed = result.requirements.find(x => x.kind === '高速化');
  expect(radar.count).toBe(1);
  expect(radar.status).toBe('ready');
  expect(speed.count).toBe(0);
  expect(speed.status).toBe('missing');
  expect(result.radar).toBe(1);
});

test('generated loadout displays numeric readiness scorecard', async ({ page }) => {
  await boot(page);
  await prepare32(page);

  const card = page.locator('.hd-fs-card').first();
  await card.locator('[data-hd-fl-generate="0"]').click();

  const panel = card.locator('.hd-fe-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('編成・装備の数値評価');
  await expect(panel).toContainText('装備 火力+雷装');
  await expect(panel).toContainText('装備 対潜');
  await expect(panel).toContainText('索敵 装備項');
  await expect(panel).toContainText('海域要求との照合');
  await expect(panel).toContainText('電探');
  await expect(panel).toContainText('高速化セット');
  await expect(panel).toContainText('制空値そのものは未計算');
});

test('equipment-only scouting contribution is calculated without pretending to be final 33式', async ({ page }) => {
  await boot(page);

  const result = await page.evaluate(() => hdFEEvaluate({
    map:'2-5',
    ships:[{
      ship:'索敵テスト艦',
      items:[
        {name:'33号水上電探',star:4,category:'小型水上電探',kind:'utility'},
        {name:'紫雲',star:0,category:'水上偵察機',kind:'recon'}
      ]
    }]
  }));

  expect(result.los.raw).toBeGreaterThan(0);
  expect(result.los.coef).toBe(1);
  expect(result.los.weighted).toBeGreaterThan(0);
  expect(result.los.summary).toContain('索敵');
});

test('3-2 does not falsely require air-power gear from the phrase 航空戦力は基本不要', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();

  const needs = await page.evaluate(() => hdMapEquipNeeds('3-2').needs.map(x => x.id));
  expect(needs).not.toContain('制空');
  expect(needs).not.toContain('防空');
  expect(needs).not.toContain('対潜');
  expect(needs).toContain('高速化');
  expect(needs).toContain('電探');
});
