const { test, expect } = require('@playwright/test');

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  serviceWorkers: 'block'
});

async function boot(page, errors = []) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource/i.test(text)) return;
    errors.push(`console: ${text}`);
  });

  await page.context().route('**/*', async route => {
    const req = route.request();
    let url;
    try { url = new URL(req.url()); } catch { return route.continue(); }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'blob:' || url.protocol === 'data:') {
      return route.continue();
    }
    if (req.resourceType() === 'image') {
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
    }
    return route.fulfill({ status: 204, body: '' });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hdWorkspaceNav')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#shipDatabase')).toHaveCount(1, { timeout: 30000 });
  await page.waitForFunction(() =>
    typeof window.hdWSApply === 'function' &&
    typeof window.hdPHRender === 'function' &&
    typeof window.hdQNCategoryRows === 'function' &&
    typeof window.hdKcCurrentFleets === 'function',
    null,
    { timeout: 30000 }
  );
}

test('release smoke: app boots with core modules and master data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => ({
    detailed: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.ships || {}).length,
    allShips: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.allShips || {}).length,
    equipment: Object.keys(window.HD_KANCOLLE_MASTER_SNAPSHOT?.equipment || {}).length,
    workspace: typeof window.hdWSApply,
    quickNav: typeof window.hdQNCategoryRows,
    personalHome: typeof window.hdPHRender,
    importer: typeof window.hdKcCurrentFleets
  }));

  expect(data.detailed).toBeGreaterThanOrEqual(100);
  expect(data.allShips).toBeGreaterThanOrEqual(800);
  expect(data.equipment).toBeGreaterThanOrEqual(500);
  expect(data.workspace).toBe('function');
  expect(data.quickNav).toBe('function');
  expect(data.personalHome).toBe('function');
  expect(data.importer).toBe('function');
  expect(errors).toEqual([]);
});

test('release smoke: workspace navigation changes location and returns home', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.hdWSApply?.('fleet', 'roster', { ignorePin: true });
    const fleet = window.hdWSCurrentLocation?.();
    window.hdWSApply?.('home', 'home', { ignorePin: true });
    const home = window.hdWSCurrentLocation?.();
    return { fleet, home };
  });

  expect(data.fleet).toMatchObject({ group: 'fleet', section: 'roster' });
  expect(data.home?.group).toBe('home');
  expect(errors).toEqual([]);
});

test('release smoke: personalized home renders operational cards', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.evaluate(async () => {
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
  });

  await expect(page.locator('#hdPersonalHome')).toHaveCount(1);
  for (const selector of [
    '.hd-ph-coverage-block',
    '.hd-ph-attention-block',
    '.hd-ph-next-block',
    '.hd-ph-resource-block',
    '.hd-ph-fleet-block',
    '.hd-ph-condition-block'
  ]) {
    await expect(page.locator(selector)).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('release smoke: complete game sync reports six core areas', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt: Date.now(),
      ships: 120,
      equipment: 300,
      materials: 8,
      decks: 4,
      quests: 0,
      docks: 0,
      sorties: 0,
      coverage: {
        ships: true,
        equipment: true,
        resources: true,
        fleets: true,
        quests: true,
        docks: true,
        sorties: false
      }
    }));
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const coverage = window.hdPHSyncCoverage?.();
    return {
      coreDone: coverage?.coreDone,
      coreTotal: coverage?.coreTotal,
      complete: coverage?.complete,
      text: document.querySelector('.hd-ph-coverage-block')?.textContent || ''
    };
  });

  expect(data.coreDone).toBe(6);
  expect(data.coreTotal).toBe(6);
  expect(data.complete).toBe(true);
  expect(data.text).toContain('主要 6/6');
  expect(errors).toEqual([]);
});

test('release smoke: synced fleet summary exposes flagship and mission state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-kancolle-fleets-v1', JSON.stringify([
      {
        deckId: 1,
        name: '第一艦隊',
        mission: [0, 0, 0, 0],
        ships: [
          { gameShipId: 1, name: '赤城', level: 99, nowHp: 80, maxHp: 80, cond: 49 },
          { gameShipId: 2, name: '加賀', level: 98, nowHp: 80, maxHp: 80, cond: 49 }
        ],
        syncedAt: Date.now()
      }
    ]));
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const fleets = window.hdPHFleetSummary?.() || [];
    return fleets[0] || null;
  });

  expect(data).toMatchObject({
    deckId: 1,
    flagship: '赤城',
    flagshipLevel: 99,
    shipCount: 2,
    status: '待機'
  });
  expect(errors).toEqual([]);
});

test('release smoke: compact home mode restores previous manual collapse state', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-home-collapse-v1');
    localStorage.removeItem('harbordesk-home-compact-v1');
    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    window.hdPHSetCollapsed?.('resources', true);
    window.hdPHSetCompact?.(true);
    const compact = !!window.hdPHCompactLoad?.().enabled;
    window.hdPHSetCompact?.(false);

    return {
      compact,
      restored: document.querySelector('.hd-ph-resource-block')?.classList.contains('hd-ph-collapsed') || false,
      meta: window.hdPHCompactLoad?.()
    };
  });

  expect(data.compact).toBe(true);
  expect(data.restored).toBe(true);
  expect(data.meta?.enabled).toBe(false);
  expect(errors).toEqual([]);
});

test('release smoke: mobile dock exposes primary navigation controls', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.hdQNUpdateMobileDock?.();
    const dock = document.getElementById('hdMobileDock');
    return {
      dock: !!dock,
      home: !!dock?.querySelector('[data-hd-mobile-home]'),
      search: !!dock?.querySelector('[data-hd-mobile-search]'),
      sync: !!dock?.querySelector('[data-hd-mobile-sync]'),
      menu: !!dock?.querySelector('[data-hd-mobile-menu]')
    };
  });

  expect(data).toEqual({ dock: true, home: true, search: true, sync: true, menu: true });
  expect(errors).toEqual([]);
});

test('release smoke: quick navigation returns valid categories', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const rows = await page.evaluate(() => (window.hdQNCategoryRows?.() || []).map(x => x.group));
  expect(rows).toContain('home');
  expect(rows).toContain('fleet');
  expect(rows).toContain('guide');
  expect(errors).toEqual([]);
});

test('release smoke: resource minimums flag low stock in home and attention', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const now = Date.now();
    window.hdGetAppState = () => ({
      expeditions: [],
      docks: [],
      quests: [],
      resources: {
        fuel: 5000,
        ammo: 20000,
        steel: 30000,
        bauxite: 40000,
        savedAt: now
      }
    });
    localStorage.setItem('harbordesk-kancolle-materials-v1', JSON.stringify({ bucket: 40, syncedAt: now }));
    localStorage.setItem('harbordesk-resource-thresholds-v1', JSON.stringify({
      fuel: 10000,
      ammo: 10000,
      steel: 10000,
      bauxite: 10000,
      bucket: 100
    }));

    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    const summary = window.hdPHResourceSummary?.();
    const resourceAttention = (window.hdQNMobileAttentionItems?.() || []).find(x => x.id === 'resources');
    return {
      alerts: (summary?.alerts || []).map(x => x.key),
      lowCards: [...document.querySelectorAll('.hd-ph-resource-grid > button.low')].map(x => x.querySelector('small')?.textContent || ''),
      header: document.querySelector('.hd-ph-resource-block .hd-ph-sub')?.textContent || '',
      attention: resourceAttention ? {
        title: resourceAttention.title,
        detail: resourceAttention.detail,
        reason: resourceAttention.reason
      } : null
    };
  });

  expect(data.alerts).toEqual(['fuel', 'bucket']);
  expect(data.lowCards).toContain('燃料');
  expect(data.lowCards).toContain('バケツ');
  expect(data.header).toContain('不足 2件');
  expect(data.attention?.reason).toBe('資源最低ライン');
  expect(data.attention?.title).toContain('2件');
  expect(data.attention?.detail).toContain('燃料');
  expect(data.attention?.detail).toContain('バケツ');
  expect(errors).toEqual([]);
});

test('release smoke: home shows return-to-game action only for sync handoff', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    sessionStorage.removeItem('harbordesk-kc-return-game-v1');
    window.hdPHEnsure?.();
    await window.hdPHRender?.();
    const hiddenBefore = !document.querySelector('[data-ph-return-game]');

    sessionStorage.setItem('harbordesk-kc-return-game-v1', '1');
    window.dispatchEvent(new CustomEvent('hd:kancolle-return-ready'));
    await new Promise(r => setTimeout(r, 20));
    const button = document.querySelector('[data-ph-return-game]');
    const shown = !!button;
    const text = button?.textContent || '';
    const helper = typeof window.hdPHReturnGame;

    sessionStorage.removeItem('harbordesk-kc-return-game-v1');
    await window.hdPHRender?.();
    const hiddenAfter = !document.querySelector('[data-ph-return-game]');

    return { hiddenBefore, shown, text, helper, hiddenAfter };
  });

  expect(data.hiddenBefore).toBe(true);
  expect(data.shown).toBe(true);
  expect(data.text).toContain('艦これへ戻る');
  expect(data.helper).toBe('function');
  expect(data.hiddenAfter).toBe(true);
  expect(errors).toEqual([]);
});
