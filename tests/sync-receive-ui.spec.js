const {test,expect}=require('@playwright/test');
const {syncVersionFixture}=require('./sync-version-fixture.cjs');
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',trace:{mode:'retain-on-failure',snapshots:false,screenshots:true,sources:true}});
async function boot(page,scenario='normal'){
 await page.addInitScript(()=>Object.defineProperty(navigator,'standalone',{value:true,configurable:true}));
 const retain=await syncVersionFixture(page,scenario);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&typeof hdWSOpenSyncStatus==='function');
 return retain;
}
function bundle(at=100,level=20){return JSON.stringify({format:'harbordesk-kancolle-import',version:2,captureId:'same-session',records:[
 {endpoint:'/kcsapi/api_port/port',at,payload:{api_result:1,api_data:{api_ship:[{api_id:987,api_ship_id:1,api_lv:level,api_nowhp:13,api_maxhp:13,api_cond:49,api_slot:[]}],api_deck_port:[],api_material:[]}}},
 {endpoint:'/kcsapi/api_get_member/slot_item',at:at+1,payload:{api_result:1,api_data:[{api_id:501,api_slotitem_id:1,api_level:0}]}}
]})}
async function clipboard(page,raw){await page.evaluate(raw=>Object.defineProperty(navigator,'clipboard',{value:{readText:async()=>raw},configurable:true}),raw)}
async function receive(page,button){
 const dialog=page.waitForEvent('dialog').then(async d=>{const message=d.message();await d.accept();return message});
 await button.click();const message=await dialog;await expect(button).toBeEnabled();return message;
}
test('receive status stays visible, preserves saved data on failures and recovers on retry',async({page},info)=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));const retain=await boot(page);try{
 await page.locator('#hdGlobalSyncStatus').click();
 const panel=page.locator('#hdSyncStatusDialog'),button=panel.locator('[data-hd-kc-receive]'),result=panel.locator('[data-hd-kc-receive-result]');
 await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('まだ同期データ');
 await clipboard(page,bundle());expect(await receive(page,button)).toContain('同期したよ');
 await expect(result).toHaveAttribute('data-state','success');
 await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('艦娘 1隻・装備 1個');
 await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('最終受信');
 await expect(panel.locator('#hdSyncStatusBody')).not.toContainText('まだゲームデータ');
 const saved=await page.evaluate(()=>localStorage.getItem('harbordesk-kancolle-sync-v1'));
 expect(await receive(page,button)).toContain('受信済み');await expect(result).toHaveAttribute('data-state','duplicate');
 await clipboard(page,bundle(90,10));expect(await receive(page,button)).toContain('古い');await expect(result).toHaveAttribute('data-state','stale');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{readText:async()=>{throw new Error('denied')}},configurable:true}));
 expect(await receive(page,button)).toContain('ペーストを許可');await expect(result).toHaveAttribute('data-state','permission');
 await clipboard(page,'unrelated text');expect(await receive(page,button)).toContain('同期データが見つからない');await expect(result).toHaveAttribute('data-state','invalid');
 expect(await page.evaluate(()=>localStorage.getItem('harbordesk-kancolle-sync-v1'))).toBe(saved);
 await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('艦娘 1隻・装備 1個');
 await clipboard(page,bundle(200,30));expect(await receive(page,button)).toContain('同期したよ');await expect(result).toHaveAttribute('data-state','success');
 await page.reload();await page.waitForFunction(()=>document.body.dataset.hdReady==='1');await page.locator('#hdGlobalSyncStatus').click();
 await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('艦娘 1隻・装備 1個');
 expect(errors).toEqual([]);
 }finally{await retain(info)}
});
for(const scenario of ['normal','external-failure','local-failure','both-failure'])test('version '+scenario+' preserves receive state and six non-null keys',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const retain=await boot(page,scenario);
 try{
  const version=await page.evaluate(async()=>{try{const v=await hdFetchLatestVersion();return{ok:true,publishedReady:v.publishedReady}}catch(e){return{ok:false,message:e.message}}});
  expect(version).toEqual(scenario==='both-failure'?{ok:false,message:'version fetch failed'}:{ok:true,publishedReady:scenario!=='local-failure'});
  await page.evaluate(()=>{localStorage.setItem(CUSTOM_FLEET_KEY,JSON.stringify({}));localStorage.setItem(HD_FC_KEY,JSON.stringify({}));localStorage.setItem('harbordesk-pwa-v1',JSON.stringify(blankState()))});
  await page.locator('#hdGlobalSyncStatus').click();const panel=page.locator('#hdSyncStatusDialog'),button=panel.locator('[data-hd-kc-receive]');
  await clipboard(page,bundle());expect(await receive(page,button)).toContain('同期したよ');
  const saved=await page.evaluate(()=>{const keys=[CUSTOM_FLEET_KEY,HD_FL_KEY,SHIP_ROSTER_KEY,HD_FC_KEY,'harbordesk-kancolle-sync-v1','harbordesk-pwa-v1'];return{keys,values:keys.map(k=>localStorage.getItem(k))}});expect(saved.values.every(v=>v!==null)).toBe(true);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.hdReady==='1');await page.locator('#hdGlobalSyncStatus').click();
  await expect(panel.locator('[data-hd-kc-receive-summary]')).toContainText('艦娘 1隻・装備 1個');
  const after=await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),saved.keys);expect(after.every(v=>v!==null)).toBe(true);expect(after).toEqual(saved.values);expect(errors).toEqual([]);
 }finally{await retain(info)}
});
test('receive controls stay tappable at narrow and landscape widths',async({page},testInfo)=>{
 const retain=await boot(page);try{
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  const header=page.locator('#hdKcHomeSync');await expect(header).toBeVisible();
  const bounds=await header.boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(viewport.width);expect(bounds.height).toBeGreaterThanOrEqual(44);
  expect(await header.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})).toBe(true);
  await page.locator('#hdGlobalSyncStatus').click();
  const panel=page.locator('#hdSyncStatusDialog');await expect(panel).toBeVisible();
  const button=panel.locator('[data-hd-kc-receive]');await expect(button).toBeInViewport();
  await page.screenshot({path:testInfo.outputPath(`sync-${viewport.width}.png`)});
  expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await clipboard(page,'');expect(await receive(page,button)).toContain('同期データが見つからない');
  await panel.locator('[data-hd-sync-close]').click();
 }
 await page.evaluate(()=>hdWSShowElement('kancolleImport',true));
 const button=page.locator('#kancolleImport [data-hd-kc-receive]');await expect(button).toBeVisible();
 await clipboard(page,bundle());expect(await receive(page,button)).toContain('同期したよ');
 await expect(page.locator('#kancolleImport [data-hd-kc-receive-result]')).toHaveAttribute('data-state','success');
 }finally{await retain(testInfo)}
});
