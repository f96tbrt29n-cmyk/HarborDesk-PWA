const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-session.js'] || '')).toBe('ok');
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-log.js'] || '')).toBe('ok');
}

async function seed(page) {
  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-active-sortie-session-v1');
    localStorage.removeItem('harbordesk-sortie-log-v1');
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'s1',name:'矢矧改二乙',level:'99',remodel:'改二乙',gear:'',memo:'',tags:['主力']},
      {id:'s2',name:'雪風改二',level:'98',remodel:'改二',gear:'',memo:'',tags:['主力']}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '3-2':[
        {
          id:'stable1',name:'3-2 安定重視',source:'optimizer-preset',strategy:'stable',strategyLabel:'安定重視',
          ships:[
            {ship:'矢矧改二乙',gear:'主砲 / 33号水上電探 / 改良型艦本式タービン / 新型高温高圧缶'},
            {ship:'雪風改二',gear:'主砲 / 33号水上電探'},
            {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
          ],
          memo:'安定案',createdAt:1000,updatedAt:2000
        },
        {
          id:'boss1',name:'3-2 ボス重視',source:'optimizer-preset',strategy:'boss',strategyLabel:'ボス重視',
          ships:[
            {ship:'矢矧改二乙',gear:'主砲 / 探照灯'},
            {ship:'雪風改二',gear:'主砲 / 33号水上電探'},
            {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
          ],
          memo:'ボス案',createdAt:2000,updatedAt:3000
        }
      ]
    }));
    localStorage.setItem('harbordesk-sortie-selection-v1', JSON.stringify({'3-2':'stable1'}));
    localStorage.setItem('harbordesk-sortie-readiness-v1', JSON.stringify({
      '3-2:stable1':{supply:true,damage:true,updatedAt:Date.now()},
      '3-2:boss1':{morale:true,updatedAt:Date.now()}
    }));
  });
}

async function openPreparation(page) {
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-hd-sps-open]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible();
  await expect(page.locator('.hd-ss')).toBeVisible();
}

test('starting a sortie session snapshots the selected fleet and readiness state', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);

  await expect(page.locator('.hd-ss')).toContainText('3-2 安定重視');
  await page.locator('[data-hd-ss-start-override]').click();
  await page.evaluate(() => window.hdWSShowElement?.('hdSortiePreparation', true));

  await expect(page.locator('.hd-ss.active')).toBeVisible();
  await expect(page.locator('.hd-ss.active')).toContainText('出撃中');

  const session=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null'));
  expect(session.map).toBe('3-2');
  expect(session.fleetId).toBe('stable1');
  expect(session.fleetName).toBe('3-2 安定重視');
  expect(session.strategy).toBe('stable');
  expect(session.strategyLabel).toBe('安定重視');
  expect(session.fleetSnapshot.ships[0].ship).toBe('矢矧改二乙');
  expect(session.readinessSnapshot.manualDone).toBe(0);
  expect(session.readinessSnapshot.gate.overridden).toBe(true);
});

test('switching the selected preset during a sortie does not mutate the session snapshot', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);
  await page.locator('[data-hd-ss-start-override]').click();

  await page.evaluate(() => hdSPMSelect('3-2','boss1'));
  const current=await page.evaluate(() => ({
    selected: hdSortieSelection('3-2'),
    session: JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null')
  }));

  expect(current.selected).toBe('boss1');
  expect(current.session.fleetId).toBe('stable1');
  expect(current.session.fleetName).toBe('3-2 安定重視');
  expect(current.session.strategy).toBe('stable');
  expect(current.session.fleetSnapshot.memo).toBe('安定案');
});

test('return result writes one existing sortie log entry with session metadata then clears the session', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);
  await page.locator('[data-hd-ss-start-override]').click();
  await page.evaluate(() => hdSPMSelect('3-2','boss1'));
  await page.evaluate(() => window.hdWSShowElement?.('hdSortiePreparation', true));

  await page.locator('#hdSSResult').selectOption('A');
  await page.locator('#hdSSNode').fill('ボス');
  await page.locator('#hdSSBattles').fill('3');
  await page.locator('#hdSSBoss').check();
  await page.locator('#hdSSDrop').fill('島風');
  await page.locator('#hdSSBuckets').fill('2');
  await page.locator('#hdSSFuel').fill('120');
  await page.locator('#hdSSAmmo').fill('95');
  await page.locator('#hdSSMemo').fill('帰還テスト');
  await page.locator('[data-hd-ss-finish]').click();

  await expect(page.locator('.hd-ss.active')).toHaveCount(0);
  await expect(page.locator('[data-hd-ss-start-override]')).toBeVisible();

  const data=await page.evaluate(() => ({
    active: localStorage.getItem('harbordesk-active-sortie-session-v1'),
    logs: JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')
  }));
  expect(data.active).toBeNull();
  expect(data.logs).toHaveLength(1);
  const log=data.logs[0];
  expect(log.map).toBe('3-2');
  expect(log.result).toBe('A');
  expect(log.boss).toBeTruthy();
  expect(log.battles).toBe(3);
  expect(log.drop).toBe('島風');
  expect(log.buckets).toBe(2);
  expect(log.fuel).toBe(120);
  expect(log.ammo).toBe(95);
  expect(log.fleetId).toBe('stable1');
  expect(log.fleetName).toBe('3-2 安定重視');
  expect(log.strategy).toBe('stable');
  expect(log.fleetSnapshot.memo).toBe('安定案');
  expect(log.memo).toContain('安定重視');
  expect(log.memo).toContain('帰還テスト');
  expect(Array.isArray(log.activityRefs)).toBeTruthy();
});

test('only one active sortie session can exist at a time', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);
  await page.locator('[data-hd-ss-start-override]').click();

  const result=await page.evaluate(() => {
    const before=JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null');
    const second=hdSSStart('3-2');
    const after=JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null');
    return {beforeId:before&&before.id,second,afterId:after&&after.id};
  });

  expect(result.second).toBeNull();
  expect(result.afterId).toBe(result.beforeId);
});
