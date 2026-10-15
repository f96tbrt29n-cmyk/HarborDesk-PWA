const {test,expect}=require('@playwright/test');

test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});

async function prepare(page){
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&window.__hdDOPatch);
 await page.locator('#homeGuideMapSelect').selectOption('6-5');
 // Reproduce the observed asynchronous arrival of the daily-ops priority row.
 // Only the input data is staged; rendering and pointer handlers are real.
 await page.evaluate(()=>{
  hdCCEnsure();const complete=hdCCPriorityItems;
  window.__completePriorityItems=complete;
  hdCCPriorityItems=()=>complete().filter(x=>x.target!=='dailyOpsCenter');
  hdCCRender();
 });
 const button=page.locator('[data-hd-strategy-import-all="6-5"]');await button.hover();
 const box=await button.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 return button;
}
async function geometry(page){
 return page.evaluate(()=>({
  offset:document.querySelector('[data-hd-strategy-import-all="6-5"]').getBoundingClientRect().top-document.getElementById('homeSummary').getBoundingClientRect().bottom,
  height:document.getElementById('hdCommandCenter').getBoundingClientRect().height,
  count:document.querySelectorAll('#hdCommandCenter .hd-cc-item').length
 }));
}
for(const ending of ['click','cancel'])test(`strategy input: upstream priority update preserves held import until ${ending}`,async({page})=>{
 const button=await prepare(page),before=await geometry(page);
 await page.mouse.down();
 await page.evaluate(()=>{hdCCPriorityItems=window.__completePriorityItems;hdCCRender()});
 const during=await geometry(page);
 expect(during.height).toBe(before.height);
 expect(during.offset).toBe(before.offset);
 if(ending==='cancel'){
  await button.dispatchEvent('pointercancel',{pointerId:await page.evaluate(()=>homeGuidePressedPointer.id),isPrimary:true,pointerType:'mouse'});
  await expect(page.locator('#hdCommandCenter .hd-cc-item')).toHaveCount(before.count+1);
 }
 await page.mouse.up();
 if(ending==='cancel'){
  expect(await page.evaluate(()=>homeGuideState().custom.length)).toBe(0);
  await button.click();
 }
 await expect(page.locator('[data-group="map"]')).toContainText('6-4 のクリアを確認');
 await expect(page.locator('#hdCommandCenter .hd-cc-item')).toHaveCount(before.count+1);
 expect((await geometry(page)).height).toBe(before.height+54);
});

for(const interruption of ['blur','navigation','removed target'])test(`strategy input: repeated upstream updates flush after ${interruption}`,async({page})=>{
 const button=await prepare(page),before=await geometry(page);
 await page.mouse.down();
 await page.evaluate(()=>{
  hdCCPriorityItems=window.__completePriorityItems;hdCCRender();
  const latest=hdCCPriorityItems;
  hdCCPriorityItems=()=>latest().map(x=>({...x,title:'最新: '+x.title}));
  hdCCRender();hdCCRender();
 });
 expect(await geometry(page)).toEqual(before);
 if(interruption==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 else{
  if(interruption==='navigation')await page.evaluate(()=>hdWSShowElement('guide',false));
  else await button.evaluate(el=>el.remove());
  // Release can be retargeted to the page after the original control vanishes.
  await page.mouse.up();
 }
 await expect(page.locator('#hdCommandCenter .hd-cc-item')).toHaveCount(before.count+1);
 await expect(page.locator('#hdCommandCenter .hd-cc-copy b').first()).toContainText('最新:');
 expect(await page.evaluate(()=>({pending:hdCCRenderPending,pressed:homeGuidePressedPointer}))).toEqual({pending:false,pressed:null});
 if(interruption==='blur')await page.mouse.up();
 if(interruption==='navigation'){
  await page.evaluate(()=>hdWSShowElement('home',false));
  await button.click();
  await expect(page.locator('[data-group="map"]')).toContainText('6-4 のクリアを確認');
 }
});
