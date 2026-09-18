const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-performance-analytics.js'] || '')).toBe('ok');
}

function logRow(i, recent, overrides={}) {
  const good=!recent;
  return {
    id:'t'+i,sessionId:'ss'+i,fleetId:'stable1',fleetName:'3-2 安定案',
    strategy:'stable',strategyLabel:'安定重視',map:'3-2',
    result:good?'S':(i>=8?'撤退':i===7?'S':'A'),
    boss:good?true:i<8,
    retreat:good?false:i>=8,
    buckets:good?1:2,
    fuel:good?100:150,ammo:good?100:150,steel:good?100:150,bauxite:good?100:150,
    durationMs:good?600000:900000,
    readinessSnapshot:good
      ? {autoOk:2,autoTotal:2,manualDone:2,manualTotal:2}
      : {autoOk:1,autoTotal:2,manualDone:1,manualTotal:2},
    at:i*1000,
    ...overrides
  };
}

async function seedTrendLogs(page) {
  const rows=[];
  for(let i=1;i<=5;i++) rows.push(logRow(i,false));
  for(let i=6;i<=10;i++) rows.push(logRow(i,true));
  await page.evaluate(rows => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','fleet');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','3-2');
    localStorage.setItem('harbordesk-sortie-analytics-window-v1','5');
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '3-2':[{
        id:'stable1',name:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
        ships:[
          {ship:'矢矧改二乙',gear:'主砲 / 電探'},
          {ship:'雪風改二',gear:'主砲 / 電探'},
          {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
        ],
        memo:'トレンドテスト',createdAt:1000,updatedAt:2000
      }]
    }));
  }, rows);
}

test('trend compares recent five runs against the previous five and flags meaningful deterioration', async ({ page }) => {
  await boot(page);
  await seedTrendLogs(page);

  const row=await page.evaluate(() => hdSPARows()[0]);
  expect(row.trend.ready).toBeTruthy();
  expect(row.trend.windowSize).toBe(5);

  const d=row.trend.delta;
  expect(d.bossRate).toBe(-60);
  expect(d.sRate).toBe(-80);
  expect(d.retreatRate).toBe(60);
  expect(d.avgResource).toBe(200);
  expect(d.avgResourcePct).toBe(50);
  expect(d.avgDurationMin).toBe(5);
  expect(d.avgDurationPct).toBe(50);
  expect(d.avgReadiness).toBe(-50);

  expect(row.trend.issues).toContain('ボス到達率が15pt以上低下');
  expect(row.trend.issues).toContain('S率が15pt以上低下');
  expect(row.trend.issues).toContain('撤退率が15pt以上上昇');
  expect(row.trend.issues).toContain('平均資源消費が20%以上増加');
  expect(row.trend.issues).toContain('平均時間が20%以上増加');
  expect(row.trend.issues).toContain('開始時確認率が10pt以上低下');
});

test('trend waits for two complete windows and respects the selected window size', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    const rows=JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]');
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','fleet');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','3-2');
    localStorage.setItem('harbordesk-sortie-analytics-window-v1','5');
  });

  const partial=await page.evaluate(() => hdSPATrend([
    {at:1,map:'3-2',result:'S',boss:true,sessionId:'1',fleetId:'f'},
    {at:2,map:'3-2',result:'S',boss:true,sessionId:'2',fleetId:'f'},
    {at:3,map:'3-2',result:'S',boss:true,sessionId:'3',fleetId:'f'},
    {at:4,map:'3-2',result:'S',boss:true,sessionId:'4',fleetId:'f'},
    {at:5,map:'3-2',result:'S',boss:true,sessionId:'5',fleetId:'f'},
    {at:6,map:'3-2',result:'S',boss:true,sessionId:'6',fleetId:'f'}
  ],5));
  expect(partial.ready).toBeFalsy();
  expect(partial.recentCount).toBe(5);
  expect(partial.previousCount).toBe(1);

  await page.evaluate(() => hdSPASetWindow(3));
  expect(await page.evaluate(() => hdSPAWindow())).toBe(3);
});

test('performance UI renders trend signals and window selector', async ({ page }) => {
  await boot(page);
  await seedTrendLogs(page);
  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  const panel=page.locator('.hd-spa');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-hd-spa-window]')).toHaveValue('5');
  await expect(panel).toContainText('直近5周の変化');
  await expect(panel).toContainText('撤退率が15pt以上上昇');
  await expect(panel).toContainText('平均資源消費が20%以上増加');
  await expect(panel).toContainText('開始時確認率が10pt以上低下');
  await expect(panel.locator('[data-hd-spa-reopen="stable1"]')).toBeVisible();
});

test('reopen shortcut selects the latest saved fleet and opens sortie preparation', async ({ page }) => {
  await boot(page);
  await seedTrendLogs(page);
  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  await page.locator('[data-hd-spa-reopen="stable1"]').click();

  await expect.poll(() => page.evaluate(() => {
    try{return JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}')['3-2']||''}catch{return ''}
  })).toBe('stable1');

  await expect(page.locator('#hdSortiePreparation')).toBeVisible({timeout:5000});
  await expect(page.locator('#hdSortiePreparation')).toContainText('3-2 安定案');
});
