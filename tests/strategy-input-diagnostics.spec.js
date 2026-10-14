const { test, expect } = require('@playwright/test');
const { installStrategyInputDiagnostics } = require('./strategy-input-diagnostics.cjs');
test.use({ viewport: { width:390, height:844 }, hasTouch:true, isMobile:true, serviceWorkers:'block' });

async function openInputFixture(page, html) {
  // A real origin also works with managed Chromium policies blocking data: URLs.
  await page.route('http://127.0.0.1:4173/__strategy-input-fixture', route =>
    route.fulfill({ status:200, contentType:'text/html', body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' + html }));
  await page.goto('http://127.0.0.1:4173/__strategy-input-fixture');
}

test('strategy diagnostics retain ordered pointer evidence without input or storage values', async ({ page }) => {
  let before, after;
  installStrategyInputDiagnostics({ beforeEach: hook => before = hook, afterEach: hook => after = hook });
  await before({ page }, { title: 'editing keeps failed changes' });
  await openInputFixture(page, '<div id="homeGuideSteps"><button data-home-guide-edit-open="fixture">Edit</button><input value="private-input"></div>');
  await page.locator('button').click();
  await expect.poll(() => page.evaluate(() => window.__hdStrategyInputDiagnostics.some(e=>e.type==='click-result'))).toBe(true);
  const events = await page.evaluate(() => window.__hdStrategyInputDiagnostics);
  const pointer = events.filter(event => ['pointerdown', 'pointerup', 'click'].includes(event.type));
  expect(pointer.map(event => event.type)).toEqual(['pointerdown', 'pointerup', 'click']);
  expect(pointer[0].pointerId).toBe(pointer[1].pointerId);
  expect(pointer[0].target.data.homeGuideEditOpen).toBe('fixture');
  expect(pointer[0].target.rect.width).toBeGreaterThan(0);
  expect(events.some(event => event.type === 'click-result')).toBe(true);
  const attachments = [];
  await after({ page }, { title: 'editing keeps failed changes', status: 'failed', expectedStatus: 'passed', attach: (name, value) => attachments.push({ name, ...value }) });
  expect(attachments).toHaveLength(1);
  expect(attachments[0].name).toBe('strategy-input-events');
  expect(JSON.parse(attachments[0].body.toString())).toEqual(events);
  expect(attachments[0].body.toString()).not.toContain('private-input');
  attachments.length = 0;
  await after({ page }, { title: 'editing keeps failed changes', status: 'passed', expectedStatus: 'passed', attach: (name, value) => attachments.push(value) });
  expect(attachments).toHaveLength(0);
  const box = await page.locator('button').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(300, 150);await page.mouse.up();
  const outside = await page.evaluate(() => window.__hdStrategyInputDiagnostics.filter(event => event.type === 'pointerup').at(-1));
  expect(outside.target.data.homeGuideEditOpen).toBeUndefined();
  expect(outside.x).toBe(300);expect(outside.y).toBe(150);
});

test('strategy diagnostics bound event history and install again after navigation', async ({ page }) => {
  let before;
  installStrategyInputDiagnostics({ beforeEach: hook => before = hook, afterEach: () => {} });
  await before({ page }, { title: 'prerequisite checkbox and cleared map' });
  await openInputFixture(page, '<div id="homeGuideSteps"><button>Check</button></div>');
  await page.evaluate(() => {
    const button = document.querySelector('button');
    for (let i = 0; i < 300; i++) button.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: i }));
  });
  const events = await page.evaluate(() => window.__hdStrategyInputDiagnostics);
  expect(events).toHaveLength(256);
  expect(events.at(-1)).toMatchObject({ type: 'pointercancel', pointerId: 299 });
  await page.reload();
  await page.locator('button').click();
  const fresh = await page.evaluate(() => window.__hdStrategyInputDiagnostics);
  expect(fresh.some(event => event.type === 'pointercancel')).toBe(false);
  expect(fresh.some(event => event.type === 'click')).toBe(true);
});

test('strategy operations and page reopening preserve six core storage keys byte for byte', async ({ page }) => {
  test.setTimeout(90000);
  const context = page.context();
  await context.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)
    ? route.continue() : route.fulfill({status:204,body:''}));
  await page.goto('http://127.0.0.1:4173/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.body.dataset.hdReady === '1', null, {timeout:30000});
  const keys = ['harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-kancolle-sync-v1',
    'harbordesk-pwa-v1','harbordesk-custom-fleets-v1','harbordesk-fleet-calculator-v1'];
  const before = await page.evaluate(keys => {
    const ship = {id:'diagnostic-ship',name:'占守改',masterId:376,gameShipId:901,level:80,gameAsw:60,gameLos:36};
    localStorage.setItem(keys[0], JSON.stringify([ship]));
    localStorage.setItem(keys[1], JSON.stringify([{name:'三式水中探信儀',count:1,star:0}]));
    localStorage.setItem(keys[2], JSON.stringify({admiralLevel:75,ships:1,equipment:1}));
    localStorage.setItem(keys[3], JSON.stringify(state));
    saveCustomFleets({'1-5':[{id:'diagnostic-fleet',name:'保持検証',openingAswCount:1,
      ships:[{ship:ship.name,masterId:376,gameShipId:901,rosterId:ship.id,gear:'三式水中探信儀'}]}]});
    localStorage.setItem(keys[5], JSON.stringify({'1-5:diagnostic-fleet':{hqLevel:75,gear:[{shipIndex:0,slotIndex:0,name:'三式水中探信儀',star:0}]}}));
    hdSelectGuideMap('1-5');hdWSShowElement('home',false);
    return Object.fromEntries(keys.map(key => [key,localStorage.getItem(key)]));
  }, keys);
  const filter = page.locator('[data-home-guide-completed]');
  await filter.click();await expect(filter).toHaveAttribute('aria-pressed','true');
  await filter.click();await expect(filter).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(key => [key,localStorage.getItem(key)])), keys)).toEqual(before);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('http://127.0.0.1:4173/', {waitUntil:'domcontentloaded'});
  await reopened.waitForFunction(() => document.body.dataset.hdReady === '1', null, {timeout:30000});
  expect(await reopened.evaluate(keys => Object.fromEntries(keys.map(key => [key,localStorage.getItem(key)])), keys)).toEqual(before);
  await reopened.close();
});

test('strategy diagnostics distinguish replaced controls from controls moved during a press', async ({ page }) => {
  let before;
  installStrategyInputDiagnostics({beforeEach: hook => before = hook, afterEach: () => {}});
  await before({page}, {title:'strategy goal editing excludes imported goals'});
  await openInputFixture(page, '<div id="homeGuideSteps" style="height:300px"><button data-home-guide-edit-open="fixture" style="width:100px;height:40px">Edit</button></div>');
  const button = page.locator('button');
  const box = await button.boundingBox();
  await page.mouse.move(box.x+20, box.y+10);await page.mouse.down();
  await button.evaluate(el => el.replaceWith(el.cloneNode(true)));
  await page.mouse.up();
  const replaced = await page.evaluate(() => window.__hdStrategyInputDiagnostics.filter(e=>e.type==='pointerup').at(-1));
  expect(replaced.pressedTarget.connected).toBe(false);
  expect(replaced.target.data.homeGuideEditOpen).toBe('fixture');
  expect(replaced.target.nodeId).not.toBe(replaced.pressedTarget.nodeId);
  expect(replaced.hitTarget.nodeId).toBe(replaced.target.nodeId);
  await page.mouse.down();
  await button.evaluate(el => el.style.transform='translateY(60px)');
  await page.mouse.up();
  const moved = await page.evaluate(() => window.__hdStrategyInputDiagnostics.filter(e=>e.type==='pointerup').at(-1));
  expect(moved.pressedTarget.connected).toBe(true);
  expect(moved.pressedTarget.nodeId).toBe(replaced.target.nodeId);
  expect(moved.pressedTarget.rect.y).toBe(replaced.target.rect.y+60);
  expect(moved.hitTarget.id).toBe('homeGuideSteps');
});

test('strategy diagnostics retain successful first input across reload for comparison', async ({ page }) => {
  let before, after;
  installStrategyInputDiagnostics({beforeEach: hook => before = hook, afterEach: hook => after = hook}, {recordSuccess:true});
  const title='deferred strategy goals filter persists';
  await before({page}, {title});
  await openInputFixture(page, '<div id="homeGuideSteps"><button data-home-guide-later-only aria-pressed="false">Later</button><input value="unrecorded-text"></div>');
  await page.locator('button').click();
  await page.reload();await page.locator('button').click();
  const attachments=[];
  await after({page}, {title,status:'passed',expectedStatus:'passed',attach:(name,value)=>attachments.push({name,...value})});
  expect(attachments).toHaveLength(1);
  const events=JSON.parse(attachments[0].body.toString());
  const presses=events.filter(e=>e.type==='pointerdown');
  expect(presses).toHaveLength(2);
  expect(presses[0].timeOrigin).not.toBe(presses[1].timeOrigin);
  expect(presses.every(e=>e.target.data.homeGuideLaterOnly==='')).toBe(true);
  expect(attachments[0].body.toString()).not.toContain('unrecorded-text');
});

test('strategy diagnostics observe native click cancellation after downstream handlers', async ({ page }) => {
  let before;
  installStrategyInputDiagnostics({beforeEach: hook => before = hook, afterEach: () => {}});
  await before({page}, {title:'editing keeps failed changes'});
  await openInputFixture(page, '<div id="homeGuideSteps"><button>Edit</button></div>');
  await page.locator('button').evaluate(el => el.addEventListener('click', event => event.preventDefault()));
  await page.locator('button').click();
  await expect.poll(() => page.evaluate(() => window.__hdStrategyInputDiagnostics.filter(e=>e.type==='click-result').length)).toBe(1);
  const events = await page.evaluate(() => window.__hdStrategyInputDiagnostics);
  expect(events.find(e=>e.type==='click').defaultPrevented).toBe(false);
  expect(events.find(e=>e.type==='click-result').defaultPrevented).toBe(true);
});

test('strategy search draft diagnostics attribute script scrolls and retain spatial evidence without private values', async ({ page }) => {
  let before, after;
  const title='release smoke: strategy goal search keeps input composition caret and hidden edit drafts';
  installStrategyInputDiagnostics({beforeEach:hook=>before=hook,afterEach:hook=>after=hook});
  await before({page},{title});
  await openInputFixture(page,'<header class="topbar">Header</header><div id="homeGuideSteps"><button data-home-guide-edit-open="search-edit">Edit</button><input value="private-search-draft"></div>');
  const button=page.locator('button');
  await button.evaluate(el=>{el.scrollIntoView({block:'center'});el.addEventListener('click',e=>e.preventDefault())});
  await button.click();
  await expect.poll(()=>page.evaluate(()=>window.__hdStrategyInputDiagnostics.some(e=>e.type==='click-result'))).toBe(true);
  const events=await page.evaluate(()=>window.__hdStrategyInputDiagnostics);
  const script=events.find(e=>e.type==='script-scroll');
  expect(script.method).toBe('scrollIntoView');expect(script.scrollTarget.data.homeGuideEditOpen).toBe('search-edit');expect(script.stack).toMatch(/eval(?:uate)?/);
  const down=events.find(e=>e.type==='pointerdown');
  expect(down.target.nodeId).toBe(down.spatial.editButton.nodeId);expect(down.hitTarget.nodeId).toBe(down.target.nodeId);
  expect(down.spatial.viewport.width).toBe(390);expect(down.spatial.viewport.height).toBe(844);
  expect(down.spatial.header.tag).toBe('HEADER');expect(down.spatial.transitions).toEqual([]);
  expect(events.find(e=>e.type==='click-result').defaultPrevented).toBe(true);
  const attachments=[];
  await after({page},{title,status:'failed',expectedStatus:'passed',attach:(name,value)=>attachments.push({name,...value})});
  expect(attachments).toHaveLength(1);expect(JSON.parse(attachments[0].body.toString())).toEqual(events);
  expect(attachments[0].body.toString()).not.toContain('private-search-draft');
});
