const {test,expect}=require('@playwright/test');
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});

async function prepare(page){
 // Resume a real CSS padding transition immediately before the application's
 // native pointerdown handler. This controls overlap, not the production code.
 await page.addInitScript(()=>{
  window.__headerProbe={events:[],transitions:[]};
  document.addEventListener('pointerdown',event=>{
   const button=event.target.closest?.('[data-home-guide-edit-open="existing-transition"]');
   if(!button)return;
   const probe=window.__headerProbe;
   for(const animation of probe.transitions)animation.play();
   const r=button.getBoundingClientRect();
   probe.down={pointerId:event.pointerId,connected:button.isConnected,rect:{x:r.x,y:r.y,width:r.width,height:r.height},
    transitions:probe.transitions.map(a=>({property:a.transitionProperty,state:a.playState}))};
   probe.button=button;
  },true);
  for(const type of ['pointerdown','pointerup','pointercancel','click'])document.addEventListener(type,event=>{
   const probe=window.__headerProbe;if(!probe.down)return;
   probe.events.push({type,pointerId:event.pointerId,targetIsButton:event.target===probe.button,preventedAtCapture:event.defaultPrevented});
  },true);
 });
 await page.route('**/*',r=>['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.fulfill({status:204,body:''}));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.dataset.hdReady==='1'&&window.__HD_WS_SCROLL_COMPACT===true,null,{timeout:30000});
 await page.addStyleTag({content:'html,body{overflow-anchor:none}'});
 await page.evaluate(()=>{hdSelectGuideMap('6-5');hdWSShowElement('home',false);const s=homeGuideState();s.custom.push({id:'existing-transition',title:'既存の遷移中に編集',category:'map',scope:'map',map:'6-5'});homeGuideSave(s)});
 await page.waitForFunction(()=>Date.now()>hdWSNavLockUntil);
 const button=page.locator('[data-home-guide-edit-open="existing-transition"]');
 await button.hover({position:{x:18,y:4}});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{hdWSSetHeaderCompact(true);resolve()}))));
 await page.waitForFunction(()=>document.querySelector('.topbar').getAnimations().every(a=>a.playState!=='running'));
 await button.hover({position:{x:18,y:4}});
 await page.evaluate(()=>{
  hdWSSetHeaderCompact(false);
  const probe=window.__headerProbe;
  probe.transitions=document.querySelector('.topbar').getAnimations().filter(a=>a.transitionProperty?.startsWith('padding'));
  for(const animation of probe.transitions){animation.pause();animation.currentTime=0}
 });
 const box=await button.boundingBox();await page.mouse.move(box.x+18,box.y+4);await page.mouse.down();
 const down=await page.evaluate(()=>window.__headerProbe.down);
 expect(down,'Native press must reach the edit button').toBeTruthy();
 expect(down.connected).toBe(true);
 expect(down.transitions.map(a=>a.property)).toEqual(expect.arrayContaining(['padding-top','padding-bottom']));
 expect(down.transitions.every(a=>a.state==='running')).toBe(true);
 return {button,down};
}

for(const finish of ['click','cancel'])test(`strategy active header transition keeps native edit press and resumes after ${finish}`,async({page},info)=>{
 const {button,down}=await prepare(page);
 await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,200)));
 const held=await button.boundingBox();
 await info.attach('header-transition-evidence',{body:Buffer.from(JSON.stringify({down,held})),contentType:'application/json'});
 expect(held).toEqual(down.rect);
 expect(await button.evaluate(el=>el===window.__headerProbe.button)).toBe(true);
 if(finish==='cancel')await page.evaluate(()=>window.__headerProbe.button.dispatchEvent(new PointerEvent('pointercancel',{
  bubbles:true,pointerId:window.__headerProbe.down.pointerId,button:0,isPrimary:true,pointerType:'mouse'
 })));
 await page.mouse.up();
 await page.waitForFunction(()=>window.__headerProbe.transitions.every(a=>a.playState!=='paused'));
 const form=page.locator('[data-home-guide-edit="existing-transition"] [name="title"]');
 if(finish==='cancel'){
  await expect(form).toHaveCount(0);
  await button.focus();await page.keyboard.press('Enter');
 }else{
  const events=await page.evaluate(()=>window.__headerProbe.events);
  for(const type of ['pointerdown','pointerup','click'])expect(events.find(e=>e.type===type)?.targetIsButton).toBe(true);
 }
 await expect(form).toBeVisible();
});

// Keep first-attempt input evidence without tracing unrelated database DOM.
test.afterEach(async({page},info)=>{
 const evidence=await page.evaluate(()=>{
  const p=window.__headerProbe;if(!p)return null;
  return {down:p.down,events:p.events,connected:p.button?.isConnected,
   transitions:p.transitions.map(a=>({property:a.transitionProperty,state:a.playState})),
   editForms:document.querySelectorAll('[data-home-guide-edit="existing-transition"]').length};
 }).catch(()=>null);
 await info.attach('header-transition-input-events',{body:Buffer.from(JSON.stringify(evidence)),contentType:'application/json'});
});
