'use strict';
const assert = require('node:assert/strict');
// Same six schemas/public save APIs as strategy-import-preservation and the
// online PWA storage regression. Only this isolated case seeds these values.
const KEYS = require('./pwa-storage-audit.cjs').KEYS;
function seedPreparedStorage() {
  window.__hdStorageAuditSnapshot?.('fixture-start');
  const ship = '時雨改二', masterId = hdShipDbMasterRowFor({name:ship}).id;
  localStorage.setItem(SHIP_ROSTER_KEY, JSON.stringify([{id:'prepared-ship',name:ship,masterId,gameShipId:777,level:99,type:'駆逐艦',memo:'オフライン保持メモ',tags:['任務用'],gameSlotEx:0,gameGearSlots:['三式水中探信儀','','三式爆雷投射機'],gameGearExpansion:'',gameAswGearKnown:true}]));
  localStorage.setItem(HD_FL_KEY, JSON.stringify([{id:'prepared-sonar',name:'三式水中探信儀',count:2,star:4,memo:'オフライン装備メモ'},{id:'prepared-depth',name:'三式爆雷投射機',count:1,star:0}]));
  localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({admiralLevel:88,resources:{fuel:4321,ammo:8765,steel:1234,bauxite:9876}}));
  localStorage.setItem(KEY, JSON.stringify({...blankState(),resources:{fuel:'4321',ammo:'8765',steel:'1234',bauxite:'9876',savedAt:1700000000000}}));
  saveCustomFleets({'1-2':[{id:'prepared-fleet',name:'オフライン保持編成',createdAt:1700000000000,ships:[{ship,masterId,rosterId:'prepared-ship',gameShipId:777,gear:'三式水中探信儀 /  / 三式爆雷投射機'}]}]});
  hdFCSaveState('1-2','prepared-fleet',{...hdFCDefaultState('1-2','prepared-fleet'),hqLevel:88,branchCoef:1,extraMemo:'オフライン計算保持',ships:[{name:ship,los:45}],gear:[{name:'三式水中探信儀',slot:0,star:4,maxProf:false}]});
  hdFCSetSelection('1-2','prepared-fleet');
  window.__hdStorageAuditSnapshot?.('fixture-end');
}
async function readPreparedStorage(page) {
  return page.evaluate(keys => ({
    document:{timeOrigin:performance.timeOrigin,url:location.origin+location.pathname},
    at:performance.now(),readyState:document.readyState,
    values:keys.map(key=>localStorage.getItem(key))
  }), KEYS);
}
function comparePreparedStorage(reference, actual, expectedDocument) {
  assert.equal(actual.readyState,'complete','storage comparison requires load/complete');
  assert.deepEqual(actual.document,expectedDocument,'must compare the same final reload document');
  assert.equal(reference.values.length,KEYS.length);
  assert.equal(actual.values.length,KEYS.length);
  const keys=KEYS.map((key,i)=>({key,present:actual.values[i]!==null,length:actual.values[i]?.length??0,exactMatch:actual.values[i]===reference.values[i]}));
  assert.ok(reference.values.every(value=>typeof value==='string'),'all six baseline keys must be non-null strings');
  assert.ok(actual.values.every(value=>typeof value==='string'),'all six restored keys must be non-null strings');
  assert.ok(keys.every(row=>row.exactMatch),'all six stored strings must match exactly');
  return {document:actual.document,at:actual.at,readyState:actual.readyState,keys};
}
async function verifyPreparedStorageUI(page, expect) {
  // Existing product navigation/rendering, never synthetic expected UI or API
  // replacements. These operations only navigate; no forms are saved.
  await expect(page.locator('#fuel')).toHaveValue('4321');
  await expect(page.locator('#ammo')).toHaveValue('8765');
  await page.locator('#hdWorkspaceNav [data-hd-ws-group="fleet"]').click();
  await page.locator('#hdWorkspaceSectionSelect').selectOption('roster');
  await expect(page.locator('#shipRosterList')).toBeVisible();
  await expect(page.locator('#shipRosterList')).toContainText('時雨改二');
  await expect(page.locator('#shipRosterList')).toContainText('Lv.99');
  await expect(page.locator('#shipRosterList')).toContainText('オフライン保持メモ');
  await page.locator('#hdWorkspaceNav [data-hd-ws-group="arsenal"]').click();
  await page.locator('#hdWorkspaceSectionSelect').selectOption('equipmentBook');
  await expect(page.locator('#equipmentList')).toBeVisible();
  await expect(page.locator('#equipmentList')).toContainText('三式水中探信儀');
  await expect(page.locator('#equipmentList')).toContainText('オフライン装備メモ');
  // Reuse the real map selection path used by loadout/planner regressions.
  await page.evaluate(()=>{hdWSShowElement('guide',false);selectedWorld='1';selectedMap='1-2';renderMapPicker();});
  await page.locator('[data-map-tab="mine"]').click();
  await expect(page.locator('#customFleetPanel')).toBeVisible();
  await expect(page.locator('#customFleetPanel')).toContainText('オフライン保持編成');
  await expect(page.locator('#customFleetPanel')).toContainText('時雨改二');
  await page.locator('[data-map-tab="gear"]').click();
  const fc=page.locator('[data-map-pane="gear"] #hdFleetCalculator');
  await expect(fc).toBeVisible();
  await expect(fc.locator('#hdFCFleetSelect')).toHaveValue('prepared-fleet');
  await expect(fc.locator('[data-hd-fc-hq]')).toHaveValue('88');
  await expect(fc.locator('[data-hd-fc-ship-los="0"]')).toHaveValue('45');
  await expect(fc.locator('[data-hd-fc-star="0"]')).toHaveValue('4');
}
module.exports={KEYS,seedPreparedStorage,readPreparedStorage,comparePreparedStorage,verifyPreparedStorageUI};
