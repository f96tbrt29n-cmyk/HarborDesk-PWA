const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function boot(page) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.HD_MODULE_STATUS?.['./sortie-preset-manager.js'] || '')).toBe('ok');
}

async function seed(page) {
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([
      {id:'s1',name:'矢矧改二乙',level:'99',remodel:'改二乙',gear:'',memo:'',tags:['主力']},
      {id:'s2',name:'雪風改二',level:'98',remodel:'改二',gear:'',memo:'',tags:['主力']}
    ]));
    localStorage.setItem('harbordesk-custom-fleets-v1', JSON.stringify({
      '3-2':[
        {
          id:'stable1',name:'3-2 安定重視｜高速ルート',source:'optimizer-preset',strategy:'stable',strategyLabel:'安定重視',
          ships:[
            {ship:'矢矧改二乙',gear:'主砲 / 33号水上電探 / 改良型艦本式タービン / 新型高温高圧缶'},
            {ship:'雪風改二',gear:'主砲 / 33号水上電探'},
            {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
          ],
          memo:'HarborDesk 安定重視比較案。',createdAt:1000,updatedAt:2000
        },
        {
          id:'boss1',name:'3-2 ボス重視｜旧保存案',
          ships:[
            {ship:'矢矧改二乙',gear:'主砲 / 探照灯'},
            {ship:'雪風改二',gear:'主砲 / 33号水上電探'},
            {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
          ],
          memo:'HarborDesk ボス重視比較案。',createdAt:2000,updatedAt:3000
        },
        {
          id:'manual1',name:'3-2 手動テスト',
          ships:[
            {ship:'矢矧改二乙',gear:'主砲'},
            {ship:'雪風改二',gear:'主砲'},
            {ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''},{ship:'',gear:''}
          ],
          memo:'手動で保存',createdAt:3000,updatedAt:4000
        }
      ]
    }));
    localStorage.setItem('harbordesk-sortie-selection-v1', JSON.stringify({'3-2':'stable1'}));
    localStorage.setItem('harbordesk-sortie-readiness-v1', JSON.stringify({
      '3-2:stable1':{supply:true,updatedAt:Date.now()},
      '3-2:boss1':{damage:true,updatedAt:Date.now()}
    }));
  });
}

async function openPreparation(page) {
  await page.evaluate(() => window.hdWSShowElement?.('guide', false));
  await page.locator('[data-world="3"]').click();
  await page.locator('[data-map="3-2"]').click();
  await page.locator('[data-hd-sps-open]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible();
  await expect(page.locator('.hd-spm')).toBeVisible();
}

test('preset manager classifies optimizer and manual fleets including legacy names', async ({ page }) => {
  await boot(page);
  await seed(page);
  await page.evaluate(() => window.selectedMap='3-2');

  const rows=await page.evaluate(() => hdSPMRows('3-2').map(x=>({
    id:x.fleet.id,strategy:x.strategy,label:x.strategyLabel,selected:x.selected
  })));

  expect(rows).toHaveLength(3);
  expect(rows[0].id).toBe('stable1');
  expect(rows[0].strategy).toBe('stable');
  expect(rows[0].selected).toBeTruthy();
  expect(rows.find(x=>x.id==='boss1').strategy).toBe('boss');
  expect(rows.find(x=>x.id==='manual1').strategy).toBe('manual');
});

test('preparation sheet shows saved preset comparison metrics and selected state', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);

  const manager=page.locator('.hd-spm');
  await expect(manager.locator('.hd-spm-card')).toHaveCount(3);
  await expect(manager).toContainText('保存プリセット比較');
  await expect(manager).toContainText('安定重視');
  await expect(manager).toContainText('ボス重視');
  await expect(manager).toContainText('手動編成');
  await expect(manager).toContainText('艦数');
  await expect(manager).toContainText('台帳');
  await expect(manager).toContainText('装備メモ');
  await expect(manager.locator('[data-hd-spm-card="stable1"]')).toContainText('出撃選択中');
});

test('selecting another preset updates sortie selection and preparation sheet immediately', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);

  const boss=page.locator('[data-hd-spm-card="boss1"]');
  await boss.locator('[data-hd-spm-select="boss1"]').click();

  await expect(page.locator('[data-hd-spm-card="boss1"]')).toContainText('出撃選択中');
  await expect(page.locator('.hd-sps-fleet')).toContainText('3-2 ボス重視｜旧保存案');

  const selected=await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-selection-v1')||'{}'));
  expect(selected['3-2']).toBe('boss1');
});

test('switching presets preserves per-fleet manual check state', async ({ page }) => {
  await boot(page);
  await seed(page);
  await openPreparation(page);

  let rows=await page.evaluate(() => hdSPMRows('3-2').map(x=>({id:x.fleet.id,done:x.stats.manualDone,total:x.stats.manualTotal})));
  expect(rows.find(x=>x.id==='stable1').done).toBe(1);
  expect(rows.find(x=>x.id==='boss1').done).toBe(1);

  await page.locator('[data-hd-spm-select="boss1"]').click();
  await page.locator('[data-hd-spm-select="stable1"]').click();

  rows=await page.evaluate(() => hdSPMRows('3-2').map(x=>({id:x.fleet.id,done:x.stats.manualDone})));
  expect(rows.find(x=>x.id==='stable1').done).toBe(1);
  expect(rows.find(x=>x.id==='boss1').done).toBe(1);
});
