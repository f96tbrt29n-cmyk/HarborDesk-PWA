const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
async function boot(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*'},body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdRHRecord==='function'&&typeof hdRBSetGoal==='function');
}
async function sync(page,values,enabled=true){return page.evaluate(({values,enabled})=>{
 const parsed=hdKcImportEmpty();values.forEach((value,i)=>{if(value!=null)parsed.materials.set(i+1,{api_id:i+1,api_value:value})});parsed.sources.add('/kcsapi/api_get_member/material');
 return hdKcApplyImport(hdKcPreviewData(parsed),{resources:enabled});
},{values,enabled})}
test('resource sync records all eight materials once per changed observation and preserves unknown values',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 await page.evaluate(()=>localStorage.setItem(HD_RESOURCE_HISTORY_KEY,'[]'));
 await sync(page,[10000,11000,12000,13000,100,200,300,40]);
 expect(await page.evaluate(()=>hdRHRows())).toMatchObject([{fuel:10000,ammo:11000,steel:12000,bauxite:13000,instantBuild:100,bucket:200,devMaterial:300,screw:40,source:'sync'}]);
 await sync(page,[10000,11000,12000,13000,100,200,300,40]);expect(await page.evaluate(()=>hdRHRows().length)).toBe(1);
 await sync(page,[12000,10000,12000,13000,90,220,295,41]);expect(await page.evaluate(()=>hdRHRows().length)).toBe(2);
 expect(await page.evaluate(()=>[hdRHDelta(hdRHRows()[0],hdRHRows()[1],'fuel'),hdRHDelta(hdRHRows()[0],hdRHRows()[1],'devMaterial')])).toEqual([2000,-5]);
 await sync(page,[9000,9000,9000,9000],false);expect(await page.evaluate(()=>hdRHRows().length)).toBe(2);
 await page.evaluate(()=>localStorage.setItem(HD_RH_SETTINGS,JSON.stringify({automatic:false})));
 await sync(page,[14000,10000,12000,13000,90,220,295,41]);expect(await page.evaluate(()=>hdRHRows().length)).toBe(2);
 expect(await page.evaluate(()=>Number(state.resources.fuel))).toBe(14000);
 await page.evaluate(()=>localStorage.removeItem(HD_RH_SETTINGS));
 await sync(page,[14001]);expect(await page.evaluate(()=>hdRHRows()[0])).toMatchObject({fuel:14001,ammo:null,bucket:null});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 expect(await page.evaluate(()=>hdRHRows().length)).toBe(3);
 await page.evaluate(()=>{const rows=hdRHRows();rows[0].source='edited';rows[0].memo='記録を編集';hdRHWrite(rows)});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 expect(await page.evaluate(()=>hdRHRows().length)).toBe(3);
 await page.evaluate(()=>hdRHWrite(hdRHRows().slice(1)));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');
 expect(await page.evaluate(()=>hdRHRows().length)).toBe(2);expect(errors).toEqual([]);
});
test('resource history graphs, goals, editing and month filters survive reload without changing current stock',async({page})=>{
 await boot(page);
 await page.evaluate(()=>{
  localStorage.setItem(HD_RESOURCE_HISTORY_KEY,JSON.stringify([{id:'legacy',at:Date.parse('2026-09-10T08:00:00+09:00'),fuel:1000,ammo:2000,steel:3000,bauxite:4000}]));
  hdRHRecord({fuel:1200,ammo:1800,steel:3500,bauxite:4200,devMaterial:200,bucket:50,screw:20,instantBuild:80},{source:'sync',at:Date.parse('2026-10-09T18:00:00+09:00')});
  hdRBSetGoal('fuel',5000);hdRBSetDeadline('2026-12-01');hdRHRender();hdWSShowElement('resourceHistory',true);
 });
 const host=page.locator('#resourceHistory');await expect(host).toBeVisible();
 await expect(host.locator('svg')).toHaveCount(2);await expect(host.locator('svg line[stroke-dasharray]')).toHaveCount(1);
 await host.locator('.hd-rh-targets summary').click();
 const target=host.locator('[data-hd-rh-target="fuel"]');await target.fill('6000');
 await page.evaluate(()=>window.dispatchEvent(new Event('hd:workspace-refresh')));await expect(target).toHaveValue('6000');await target.press('Tab');
 await expect(host.locator('[data-hd-rh-edit="legacy"]')).toBeVisible();
 await host.locator('[data-hd-rh-edit="legacy"]').click();
 const dialog=page.locator('#hdResourceHistoryDialog');await expect(dialog.locator('[name="bucket"]')).toHaveValue('');
 await dialog.locator('[name="fuel"]').fill('1100');await dialog.locator('[name="memo"]').fill('備蓄開始 <script>');
 const stock=await page.evaluate(()=>state.resources.fuel);
 await dialog.getByRole('button',{name:'記録を保存'}).click();await expect(dialog).not.toBeVisible();
 expect(await page.evaluate(()=>hdRHRows().find(x=>x.id==='legacy').fuel)).toBe(1100);
 expect(await page.evaluate(()=>state.resources.fuel)).toBe(stock);
 await expect(host.locator('.hd-rh-record').first()).toContainText('+100');
 await expect(host.locator('.hd-rh-record').last()).toContainText('備蓄開始 <script>');
 await host.locator('[data-hd-rh-month]').fill('2026-10');await expect(host.locator('.hd-rh-record')).toHaveCount(1);
 await host.locator('[data-hd-rh-goals]').uncheck();await expect(host.locator('svg line[stroke-dasharray]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');await page.evaluate(()=>hdWSShowElement('resourceHistory',true));
 await expect(host.locator('[data-hd-rh-month]')).toHaveValue('2026-10');await expect(host.locator('[data-hd-rh-goals]')).not.toBeChecked();
 await host.locator('[data-hd-rh-clear]').click();await expect(host.locator('.hd-rh-record')).toHaveCount(2);
 await host.locator('[data-history-delete="legacy"]').click();await expect(host.locator('[data-history-delete="legacy"]')).toHaveCount(0);expect(await page.evaluate(()=>hdRHRows().length)).toBe(1);
 expect(await page.evaluate(()=>JSON.parse(hdBuildBackupFile().data.localStorage[HD_RESOURCE_HISTORY_KEY]).length)).toBe(1);
});
test('resource history keeps more than the legacy 120 rows and does not record ship-only refreshes',async({page})=>{
 await boot(page);const count=await page.evaluate(()=>{
  localStorage.setItem(HD_RESOURCE_HISTORY_KEY,JSON.stringify(Array.from({length:125},(_,i)=>({id:'old'+i,at:Date.now()-i*86400000,fuel:i,ammo:i,steel:i,bauxite:i}))));
  window.dispatchEvent(new CustomEvent('hd:kancolle-sync',{detail:{ships:5,materials:0}}));const before=hdRHRows().length;state.resources.fuel=500;snapshotResources();return {before,after:hdRHRows().length};
 });expect(count).toEqual({before:125,after:126});
});
test('unchanged values are recorded on a new Japan date and history storage failure preserves sync current values',async({page})=>{
 await boot(page);
 const days=await page.evaluate(()=>{
  localStorage.setItem(HD_RESOURCE_HISTORY_KEY,'[]');const values={fuel:50,ammo:60,steel:70,bauxite:80};
  hdRHRecord(values,{source:'sync',at:Date.now()-86400000});hdRHRecord(values,{source:'sync'});hdRHRecord(values,{source:'sync'});return hdRHRows().length;
 });expect(days).toBe(2);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreResourceStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(key,value){if(key===HD_RESOURCE_HISTORY_KEY)throw new DOMException('Full','QuotaExceededError');return original.call(this,key,value)}});
 const result=await sync(page,[12345,400,500,600,30,40,50,60]);expect(result.materials).toBe(8);
 expect(await page.evaluate(()=>Number(state.resources.fuel))).toBe(12345);
 expect(await page.evaluate(()=>hdRHRows().length)).toBe(2);await page.evaluate(()=>window.restoreResourceStorage());
});
