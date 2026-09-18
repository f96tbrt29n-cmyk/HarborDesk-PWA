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

async function seedLogs(page) {
  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-analytics-mode-v1');
    localStorage.removeItem('harbordesk-sortie-analytics-map-v1');
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {
        id:'s1',sessionId:'ss1',fleetId:'stable1',fleetName:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
        map:'3-2',result:'S',boss:true,retreat:false,buckets:1,fuel:100,ammo:100,steel:100,bauxite:100,durationMs:600000,
        readinessSnapshot:{autoOk:2,autoTotal:2,manualDone:2,manualTotal:2},at:1000
      },
      {
        id:'s2',sessionId:'ss2',fleetId:'stable1',fleetName:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
        map:'3-2',result:'A',boss:true,retreat:false,buckets:0,fuel:100,ammo:100,steel:50,bauxite:50,durationMs:900000,
        readinessSnapshot:{autoOk:2,autoTotal:2,manualDone:2,manualTotal:2},at:2000
      },
      {
        id:'s3',sessionId:'ss3',fleetId:'stable1',fleetName:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
        map:'3-2',result:'撤退',boss:false,retreat:true,buckets:2,fuel:50,ammo:50,steel:50,bauxite:50,durationMs:300000,
        readinessSnapshot:{autoOk:2,autoTotal:2,manualDone:2,manualTotal:2},at:3000
      },
      {
        id:'b1',sessionId:'sb1',fleetId:'boss1',fleetName:'3-2 ボス案',strategy:'boss',strategyLabel:'ボス重視',
        map:'3-2',result:'S',boss:true,retreat:false,buckets:2,fuel:150,ammo:150,steel:100,bauxite:100,durationMs:720000,
        readinessSnapshot:{autoOk:1,autoTotal:2,manualDone:2,manualTotal:2},at:4000
      },
      {
        id:'b2',sessionId:'sb2',fleetId:'boss1',fleetName:'3-2 ボス案',strategy:'boss',strategyLabel:'ボス重視',
        map:'3-2',result:'S',boss:true,retreat:false,buckets:1,fuel:120,ammo:120,steel:80,bauxite:80,durationMs:660000,
        readinessSnapshot:{autoOk:2,autoTotal:2,manualDone:2,manualTotal:2},at:5000
      },
      {
        id:'r1',sessionId:'sr1',fleetId:'route65',fleetName:'6-5 道中案',strategy:'route',strategyLabel:'道中突破重視',
        map:'6-5',result:'B',boss:true,retreat:false,buckets:0,fuel:200,ammo:180,steel:100,bauxite:250,durationMs:1200000,
        readinessSnapshot:{autoOk:3,autoTotal:3,manualDone:2,manualTotal:2},at:6000
      },
      {
        id:'legacy',map:'3-2',result:'S',boss:true,retreat:false,buckets:0,fuel:1,ammo:1,steel:1,bauxite:1,at:7000
      }
    ]));
  });
}

test('strategy analytics calculates rates averages and readiness from session logs', async ({ page }) => {
  await boot(page);
  await seedLogs(page);

  const rows=await page.evaluate(() => hdSPARows().map(x=>({strategy:x.strategy,label:x.label,metrics:x.metrics})));
  const stable=rows.find(x=>x.strategy==='stable');
  const boss=rows.find(x=>x.strategy==='boss');

  expect(stable.metrics.n).toBe(3);
  expect(stable.metrics.bossRate).toBe(67);
  expect(stable.metrics.sRate).toBe(33);
  expect(stable.metrics.winRate).toBe(67);
  expect(stable.metrics.retreatRate).toBe(33);
  expect(stable.metrics.avgResource).toBe(300);
  expect(stable.metrics.avgBuckets).toBe(1);
  expect(stable.metrics.avgDurationMin).toBe(10);
  expect(stable.metrics.avgReadiness).toBe(100);

  expect(boss.metrics.n).toBe(2);
  expect(boss.metrics.bossRate).toBe(100);
  expect(boss.metrics.sRate).toBe(100);
  expect(boss.metrics.retreatRate).toBe(0);
  expect(boss.metrics.avgResource).toBe(450);
  expect(boss.metrics.avgBuckets).toBe(1.5);
  expect(boss.metrics.avgDurationMin).toBe(11.5);
  expect(boss.metrics.avgReadiness).toBe(88);
});

test('analytics excludes legacy non-session logs from strategy comparison', async ({ page }) => {
  await boot(page);
  await seedLogs(page);

  const result=await page.evaluate(() => ({
    eligible: hdSPALogs().length,
    groups: hdSPARows().map(x=>({strategy:x.strategy,n:x.metrics.n}))
  }));

  expect(result.eligible).toBe(6);
  expect(result.groups.reduce((a,x)=>a+x.n,0)).toBe(6);
  expect(result.groups.some(x=>x.strategy==='manual')).toBeFalsy();
});

test('performance UI renders strategy cards badges and sample-size warning', async ({ page }) => {
  await boot(page);
  await seedLogs(page);
  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  const panel=page.locator('.hd-spa');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('実戦データ分析');
  await expect(panel.locator('.hd-spa-card')).toHaveCount(3);
  await expect(panel).toContainText('安定重視');
  await expect(panel).toContainText('ボス重視');
  await expect(panel).toContainText('道中突破重視');
  await expect(panel).toContainText('ボス到達率最大');
  await expect(panel).toContainText('撤退率最小');
  await expect(panel).toContainText('サンプル少なめ');
});

test('fleet mode and map filter regroup the same session history without changing logs', async ({ page }) => {
  await boot(page);
  await seedLogs(page);
  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  const panel=page.locator('.hd-spa');
  await panel.locator('[data-hd-spa-mode]').selectOption('fleet');
  await expect(panel.locator('.hd-spa-card')).toHaveCount(3);
  await expect(panel).toContainText('3-2 安定案');
  await expect(panel).toContainText('3-2 ボス案');
  await expect(panel).toContainText('6-5 道中案');

  await panel.locator('[data-hd-spa-map]').selectOption('3-2');
  await expect(panel.locator('.hd-spa-card')).toHaveCount(2);
  await expect(panel).not.toContainText('6-5 道中案');

  const state=await page.evaluate(() => ({
    mode:localStorage.getItem('harbordesk-sortie-analytics-mode-v1'),
    map:localStorage.getItem('harbordesk-sortie-analytics-map-v1'),
    logCount:JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]').length
  }));
  expect(state.mode).toBe('fleet');
  expect(state.map).toBe('3-2');
  expect(state.logCount).toBe(7);
});
