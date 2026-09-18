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

function buildLogs() {
  const rows=[];
  for(let i=1;i<=5;i++)rows.push({
    id:'old'+i,sessionId:'oldss'+i,fleetId:'stable1',fleetName:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
    map:'3-2',result:'S',boss:true,retreat:false,buckets:1,fuel:100,ammo:100,steel:100,bauxite:100,durationMs:600000,
    readinessSnapshot:{autoOk:2,autoTotal:2,manualDone:2,manualTotal:2},at:i*1000
  });
  for(let i=6;i<=10;i++)rows.push({
    id:'new'+i,sessionId:'newss'+i,fleetId:'stable1',fleetName:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
    map:'3-2',result:i>=8?'撤退':(i===7?'S':'A'),boss:i<8,retreat:i>=8,buckets:2,fuel:150,ammo:150,steel:150,bauxite:150,durationMs:900000,
    readinessSnapshot:{autoOk:1,autoTotal:2,manualDone:1,manualTotal:2},at:i*1000
  });
  return rows;
}

async function seed(page) {
  await page.evaluate(rows => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify(rows));
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','fleet');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','3-2');
    localStorage.setItem('harbordesk-sortie-analytics-window-v1','5');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'s1',name:'矢矧改二乙',type:'軽巡洋艦',level:'99',remodel:'改二乙',gear:'',memo:'',tags:['主力']},
      {id:'s2',name:'雪風改二',type:'駆逐艦',level:'98',remodel:'改二',gear:'',memo:'',tags:['主力']}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '3-2':[{
        id:'stable1',name:'3-2 安定案',strategy:'stable',strategyLabel:'安定重視',
        ships:[
          {ship:'矢矧改二乙',gear:'主砲 / 電探'},
          {ship:'雪風改二',gear:'主砲 / 電探'},
          {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
        ],
        memo:'見直しテスト',createdAt:1000,updatedAt:2000
      }]
    }));
  }, buildLogs());
}

test('review suggestions map deterioration signals to distinct next actions', async ({ page }) => {
  await boot(page);
  await seed(page);

  const recs=await page.evaluate(() => {
    const row=hdSPARows()[0];
    return hdSPARecommendations(row);
  });

  expect(recs.map(x=>x.mode)).toContain('route');
  expect(recs.map(x=>x.mode)).toContain('boss');
  expect(recs.map(x=>x.mode)).toContain('reserve');
  expect(recs.some(x=>x.action==='prep')).toBeTruthy();

  expect(recs.filter(x=>x.mode==='route')).toHaveLength(1);
  expect(recs.length).toBeLessThanOrEqual(4);
});

test('review UI renders reasons and action buttons for the current trend', async ({ page }) => {
  await boot(page);
  await seed(page);

  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  const panel=page.locator('.hd-spa');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.hd-spa-review')).toBeVisible();
  await expect(panel).toContainText('次の見直し候補');
  await expect(panel).toContainText('道中突破重視を再検討');
  await expect(panel.locator('[data-hd-spa-review]')).toHaveCount(4);
});

test('optimize review action sets the suggested mode and opens fleet suggestions for the same map', async ({ page }) => {
  await boot(page);
  await seed(page);

  await page.evaluate(() => {
    hdSLEnsure?.();
    hdSLRender?.();
    hdSPARender?.();
    hdWSShowElement?.('sortieLog', false);
  });

  const route=page.locator('[data-hd-spa-review="stable1"][data-hd-spa-mode-target="route"]');
  await expect(route).toBeVisible();
  await route.click();

  await expect.poll(() => page.evaluate(() => localStorage.getItem('harbordesk-fleet-optimizer-mode-v1'))).toBe('route');
  await expect(page.locator('#hdFleetSuggester')).toBeVisible({timeout:5000});
  await expect(page.locator('#hdFleetSuggesterMap')).toContainText('3-2');
});

test('prep review action keeps the saved fleet selected and opens sortie preparation', async ({ page }) => {
  await boot(page);
  await seed(page);

  const result=await page.evaluate(() => {
    const row=hdSPARows()[0];
    const prep={...row,trend:{...row.trend,delta:{...row.trend.delta,retreatRate:0,bossRate:0,sRate:0,avgResourcePct:0,avgDurationPct:0,avgReadiness:-50}}};
    return hdSPARecommendations(prep);
  });
  expect(result).toHaveLength(1);
  expect(result[0].action).toBe('prep');

  await page.evaluate(() => {
    const row=hdSPARows()[0];
    row.trend.delta.retreatRate=0;
    row.trend.delta.bossRate=0;
    row.trend.delta.sRate=0;
    row.trend.delta.avgResourcePct=0;
    row.trend.delta.avgDurationPct=0;
    row.trend.delta.avgReadiness=-50;
  });

  const ok=await page.evaluate(() => hdSPAReview('stable1','prep',''));
  expect(ok).toBeTruthy();

  await expect.poll(() => page.evaluate(() => {
    try{return JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}')['3-2']||''}catch{return ''}
  })).toBe('stable1');
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({timeout:5000});
});
