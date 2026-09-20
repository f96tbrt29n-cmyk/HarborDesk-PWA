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
    await window.hdPHRender?.();
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

test('release smoke: personal home order storage stays isolated', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const legacy = ['quick', 'resources', 'recent', 'procurement'];
    localStorage.setItem('harbordesk-home-order-v1', JSON.stringify(legacy));
    localStorage.removeItem('harbordesk-personal-home-order-v1');

    const initial = window.hdPHOrderLoad?.() || [];
    window.hdPHOrderSave?.(['resources', 'coverage', 'attention', 'next', 'fleets', 'condition']);

    return {
      legacy: JSON.parse(localStorage.getItem('harbordesk-home-order-v1') || '[]'),
      personal: JSON.parse(localStorage.getItem('harbordesk-personal-home-order-v1') || '[]'),
      initial
    };
  });

  expect(data.legacy).toEqual(['quick', 'resources', 'recent', 'procurement']);
  expect(data.initial).toEqual(['coverage', 'attention', 'next', 'resources', 'fleets', 'condition']);
  expect(data.personal).toEqual(['resources', 'coverage', 'attention', 'next', 'fleets', 'condition']);
  expect(errors).toEqual([]);
});

test('release smoke: backup can be shared as a JSON file on supported devices', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.setItem('harbordesk-share-smoke-v1', JSON.stringify({ ok: true }));
    window.__hdSharePayload = null;
    try {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: payload => !!payload?.files?.length });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => {
        const file = payload?.files?.[0];
        window.__hdSharePayload = file ? {
          title: payload.title || '',
          name: file.name || '',
          type: file.type || '',
          text: await file.text()
        } : null;
      }});
    } catch {}

    const result = await window.shareBackup?.();
    window.hdPHEnsure?.();
    await window.hdPHRender?.();

    let parsed = null;
    try { parsed = JSON.parse(window.__hdSharePayload?.text || 'null'); } catch {}
    return {
      result,
      share: window.__hdSharePayload,
      parsedValue: parsed?.localStorage?.['harbordesk-share-smoke-v1'] || '',
      advancedButton: !!document.getElementById('shareBackup'),
      homeButton: !!document.querySelector('[data-ph-share-backup]')
    };
  });

  expect(data.result).toBe(true);
  expect(data.share?.title || '').toContain('HarborDesk');
  expect(data.share?.name || '').toMatch(/^HarborDesk-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(data.share?.type).toBe('application/json');
  expect(data.parsedValue).toBe(JSON.stringify({ ok: true }));
  expect(data.advancedButton).toBe(true);
  expect(data.homeButton).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: backup falls back to JSON export when sharing is unavailable', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    window.__hdFallbackExports = 0;
    try {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
    } catch {}
    window.exportBackup = () => { window.__hdFallbackExports += 1; return true; };

    const result = await window.shareBackup?.();
    return {
      result,
      exports: window.__hdFallbackExports,
      marked: Number(localStorage.getItem('harbordesk-last-external-backup-v1') || 0)
    };
  });

  expect(data.result).toBe(true);
  expect(data.exports).toBe(1);
  expect(data.marked).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('release smoke: cancelling share sheet does not trigger fallback download', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    window.__hdFallbackExports = 0;
    try {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {
        throw new DOMException('cancelled', 'AbortError');
      }});
    } catch {}
    window.exportBackup = () => { window.__hdFallbackExports += 1; return true; };

    const result = await window.shareBackup?.();
    return {
      result,
      exports: window.__hdFallbackExports,
      marked: localStorage.getItem('harbordesk-last-external-backup-v1')
    };
  });

  expect(data.result).toBe(false);
  expect(data.exports).toBe(0);
  expect(data.marked).toBeNull();
  expect(errors).toEqual([]);
});

test('release smoke: backup warning follows latest game sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(async () => {
    const now = Date.now();
    localStorage.setItem('harbordesk-last-external-backup-v1', String(now - 5 * 60 * 1000));
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({
      syncedAt: now,
      coverage: { ships:true, equipment:true, resources:true, fleets:true, quests:true, docks:true }
    }));
    await window.hdPHRender?.();
    const stale = window.hdPHExternalText?.();
    const staleText = document.querySelector('.hd-ph-backup-alert')?.textContent || '';

    localStorage.setItem('harbordesk-last-external-backup-v1', String(now + 1000));
    await window.hdPHRender?.();
    const fresh = window.hdPHExternalText?.();
    const freshAlert = document.querySelector('.hd-ph-backup-alert');

    return {
      stale: {
        due: !!stale?.due,
        afterSync: !!stale?.afterSync,
        label: stale?.label || '',
        title: stale?.title || '',
        text: staleText
      },
      fresh: {
        due: !!fresh?.due,
        afterSync: !!fresh?.afterSync,
        label: fresh?.label || '',
        alertPresent: !!freshAlert
      }
    };
  });

  expect(data.stale.due).toBe(true);
  expect(data.stale.afterSync).toBe(true);
  expect(data.stale.label).toBe('同期後未保存');
  expect(data.stale.title).toContain('同期後');
  expect(data.stale.text).toContain('同期後');
  expect(data.fresh.due).toBe(false);
  expect(data.fresh.afterSync).toBe(false);
  expect(data.fresh.label).toBe('今日');
  expect(data.fresh.alertPresent).toBe(false);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('release smoke: ship image backup exposes share action and records backup time', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    window.alert = () => {};
    localStorage.removeItem('harbordesk-last-ship-image-backup-v1');
    const dialog = window.hdShipImageEnsureDialog?.();
    const name = window.hdShipImageBackupName?.() || '';
    const at = window.hdShipImageMarkBackup?.() || 0;
    return {
      shareFn: typeof window.hdShipImageShareBackup,
      shareButton: !!dialog?.querySelector('[data-hd-ship-image-share]'),
      filename: name,
      markedAt: at,
      storedAt: Number(localStorage.getItem('harbordesk-last-ship-image-backup-v1') || 0)
    };
  });

  expect(data.shareFn).toBe('function');
  expect(data.shareButton).toBe(true);
  expect(data.filename).toContain('HarborDesk-ship-images-');
  expect(data.filename).toMatch(/\.hdshipimg$/);
  expect(data.markedAt).toBeGreaterThan(0);
  expect(data.storedAt).toBe(data.markedAt);
  expect(errors, `runtime errors: ${errors.join('\\n')}`).toEqual([]);
});

test('release smoke: backup restore preview can cancel without changing data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.importBackup === 'function' &&
    typeof window.hdAnalyzeBackupLocalStorage === 'function'
  );

  await page.evaluate(() => {
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i);
      if(key?.startsWith('harbordesk'))localStorage.removeItem(key);
    }
    localStorage.setItem('harbordesk-preview-keep', JSON.stringify({ value: 'old' }));
    localStorage.setItem('harbordesk-preview-remove', JSON.stringify({ remove: true }));
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      localStorage: {
        'harbordesk-preview-keep': JSON.stringify({ value: 'new' }),
        'harbordesk-preview-new': JSON.stringify({ added: true })
      }
    };
    window.__hdPreviewExpected = window.hdAnalyzeBackupLocalStorage(backup.localStorage);
    const file = new File([JSON.stringify(backup)], 'HarborDesk-preview.json', { type: 'application/json' });
    window.__hdPreviewImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-meta]')).toContainText('HarborDesk-preview.json');
  const expected = await page.evaluate(() => window.__hdPreviewExpected);
  await expect(dialog.locator('.hd-backup-preview-grid .add')).toContainText(`${expected.added}件`);
  await expect(dialog.locator('.hd-backup-preview-grid .update')).toContainText(`${expected.updated}件`);
  await expect(dialog.locator('.hd-backup-preview-grid .remove')).toContainText(`${expected.removed}件`);
  expect(expected.added).toBe(1);
  expect(expected.updated).toBe(1);
  expect(expected.removed).toBeGreaterThanOrEqual(1);

  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => {
    const imported = await window.__hdPreviewImportPromise;
    return {
      imported,
      keep: localStorage.getItem('harbordesk-preview-keep'),
      removedCandidate: localStorage.getItem('harbordesk-preview-remove'),
      addedCandidate: localStorage.getItem('harbordesk-preview-new')
    };
  });

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.keep).value).toBe('old');
  expect(JSON.parse(result.removedCandidate).remove).toBe(true);
  expect(result.addedCandidate).toBeNull();
  expect(errors).toEqual([]);
});


test('release smoke: backup compatibility blocks newer formats', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdAnalyzeBackupCompatibility === 'function' &&
    typeof window.importBackup === 'function'
  );

  const metadata = await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    const current = window.hdAnalyzeBackupCompatibility(built.data);
    const future = window.hdAnalyzeBackupCompatibility({
      ...built.data,
      version: 2
    });
    return {
      name: built.data.app?.name || '',
      version: built.data.app?.version || '',
      build: built.data.app?.build,
      currentBlocked: !!current.blocked,
      futureBlocked: !!future.blocked,
      futureReason: future.reason || ''
    };
  });

  expect(metadata.name).toBe('HarborDesk');
  expect(metadata.version).toMatch(/^1\.0\.\d+$/);
  expect(Number(metadata.build)).toBeGreaterThan(0);
  expect(metadata.currentBlocked).toBe(false);
  expect(metadata.futureBlocked).toBe(true);
  expect(metadata.futureReason).toContain('新しい形式');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-compat-keep', JSON.stringify({ value: 'safe' }));
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      app: { name: 'HarborDesk', version: '9.9.9', build: 9999 },
      localStorage: {
        'harbordesk-compat-keep': JSON.stringify({ value: 'unsafe' })
      }
    };
    const file = new File([JSON.stringify(backup)], 'HarborDesk-future.json', { type: 'application/json' });
    window.__hdCompatImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('復元できないバックアップ');
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('新しい形式');
  await expect(dialog.locator('button[value="restore"]')).toBeDisabled();
  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdCompatImportPromise,
    keep: localStorage.getItem('harbordesk-compat-keep')
  }));
  expect(result.imported).toBe(false);
  expect(JSON.parse(result.keep).value).toBe('safe');
  expect(errors).toEqual([]);
});


test('release smoke: backup integrity blocks tampered files', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdAnalyzeBackupIntegrity === 'function' &&
    typeof window.importBackup === 'function'
  );

  const generated = await page.evaluate(() => {
    localStorage.setItem('harbordesk-integrity-target', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    const check = window.hdAnalyzeBackupIntegrity(built.data);
    return {
      algorithm: built.data.integrity?.algorithm || '',
      hash: built.data.integrity?.hash || '',
      state: check.state,
      blocked: !!check.blocked
    };
  });

  expect(generated.algorithm).toBe('fnv1a32');
  expect(generated.hash).toMatch(/^[0-9a-f]{8}$/);
  expect(generated.state).toBe('ok');
  expect(generated.blocked).toBe(false);

  await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-integrity-target'] = JSON.stringify({ value: 'tampered' });
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-tampered.json', { type: 'application/json' });
    window.__hdIntegrityImportPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('復元できないバックアップ');
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('チェックサム');
  await expect(dialog.locator('button[value="restore"]')).toBeDisabled();
  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdIntegrityImportPromise,
    current: localStorage.getItem('harbordesk-integrity-target')
  }));
  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(errors).toEqual([]);
});


test('release smoke: restore aborts when safety snapshot fails', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.hdBackupChecksum === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-snapshot-guard', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-snapshot-guard'] = JSON.stringify({ value: 'incoming' });
    built.data.integrity.hash = window.hdBackupChecksum(built.data);
    window.__hdSnapshotGuardAlerts = [];
    window.alert = message => window.__hdSnapshotGuardAlerts.push(String(message || ''));
    window.hdPHCreateSnapshot = async () => false;
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-snapshot-fail.json', { type: 'application/json' });
    window.__hdSnapshotGuardPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-hd-backup-preview-compat]')).toContainText('整合性確認済み');
  await dialog.locator('button[value="restore"]').click();

  const result = await page.evaluate(async () => ({
    imported: await window.__hdSnapshotGuardPromise,
    current: localStorage.getItem('harbordesk-snapshot-guard'),
    alerts: window.__hdSnapshotGuardAlerts || []
  }));

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(result.alerts.join(' ')).toContain('スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: external restore transaction rolls back partial writes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdCaptureHarborLocalStorage === 'function' &&
    typeof window.hdApplyBackupTransaction === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.setItem('harbordesk-rollback-a', JSON.stringify({ value: 'safe-a' }));
    localStorage.setItem('harbordesk-rollback-b', JSON.stringify({ value: 'safe-b' }));
    const before = window.hdCaptureHarborLocalStorage();
    const target = {
      'harbordesk-rollback-a': JSON.stringify({ value: 'incoming' })
    };
    const tx = window.hdApplyBackupTransaction(target, before, () => {
      localStorage.setItem('harbordesk-rollback-a', JSON.stringify({ value: 'partial' }));
      localStorage.removeItem('harbordesk-rollback-b');
    });
    return {
      ok: !!tx.ok,
      rollbackOk: !!tx.rollback?.ok,
      a: localStorage.getItem('harbordesk-rollback-a'),
      b: localStorage.getItem('harbordesk-rollback-b'),
      expectedA: before['harbordesk-rollback-a'],
      expectedB: before['harbordesk-rollback-b']
    };
  });

  expect(result.ok).toBe(false);
  expect(result.rollbackOk).toBe(true);
  expect(result.a).toBe(result.expectedA);
  expect(result.b).toBe(result.expectedB);
  expect(errors).toEqual([]);
});


test('release smoke: snapshot restore transaction rolls back partial writes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHHarborData === 'function' &&
    typeof window.hdPHRestoreTransaction === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.setItem('harbordesk-ph-rollback-a', JSON.stringify({ value: 'safe-a' }));
    localStorage.setItem('harbordesk-ph-rollback-b', JSON.stringify({ value: 'safe-b' }));
    const before = window.hdPHHarborData();
    const target = {
      'harbordesk-ph-rollback-a': JSON.stringify({ value: 'incoming' })
    };
    const tx = window.hdPHRestoreTransaction(target, before, () => {
      localStorage.setItem('harbordesk-ph-rollback-a', JSON.stringify({ value: 'partial' }));
      localStorage.removeItem('harbordesk-ph-rollback-b');
    });
    return {
      ok: !!tx.ok,
      rollbackOk: !!tx.rollback?.ok,
      a: localStorage.getItem('harbordesk-ph-rollback-a'),
      b: localStorage.getItem('harbordesk-ph-rollback-b'),
      expectedA: before['harbordesk-ph-rollback-a'],
      expectedB: before['harbordesk-ph-rollback-b']
    };
  });

  expect(result.ok).toBe(false);
  expect(result.rollbackOk).toBe(true);
  expect(result.a).toBe(result.expectedA);
  expect(result.b).toBe(result.expectedB);
  expect(errors).toEqual([]);
});


test('release smoke: restore refuses to run without safety snapshot layer', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-safety-layer', JSON.stringify({ value: 'safe' }));
    const built = window.hdBuildBackupFile();
    built.data.localStorage['harbordesk-safety-layer'] = JSON.stringify({ value: 'incoming' });
    built.data.integrity.hash = window.hdBackupChecksum(built.data);
    window.__hdSafetyLayerAlerts = [];
    window.alert = message => window.__hdSafetyLayerAlerts.push(String(message || ''));
    window.__hdOriginalSnapshotFn = window.hdPHCreateSnapshot;
    window.hdPHCreateSnapshot = undefined;
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-no-safety-layer.json', { type: 'application/json' });
    window.__hdSafetyLayerPromise = window.importBackup(file);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('button[value="restore"]').click();

  const result = await page.evaluate(async () => {
    const imported = await window.__hdSafetyLayerPromise;
    const current = localStorage.getItem('harbordesk-safety-layer');
    const alerts = window.__hdSafetyLayerAlerts || [];
    window.hdPHCreateSnapshot = window.__hdOriginalSnapshotFn;
    delete window.__hdOriginalSnapshotFn;
    return { imported, current, alerts };
  });

  expect(result.imported).toBe(false);
  expect(JSON.parse(result.current).value).toBe('safe');
  expect(result.alerts.join(' ')).toContain('安全スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: concurrent backup restores are locked', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  await page.evaluate(() => {
    const built = window.hdBuildBackupFile();
    window.__hdConcurrentAlerts = [];
    window.alert = message => window.__hdConcurrentAlerts.push(String(message || ''));
    const file1 = new File([JSON.stringify(built.data)], 'HarborDesk-first.json', { type: 'application/json' });
    const file2 = new File([JSON.stringify(built.data)], 'HarborDesk-second.json', { type: 'application/json' });
    window.__hdFirstRestorePromise = window.importBackup(file1);
    window.__hdSecondRestorePromise = window.importBackup(file2);
  });

  const dialog = page.locator('#hdBackupRestorePreviewDialog');
  await expect(dialog).toBeVisible();

  const second = await page.evaluate(async () => await window.__hdSecondRestorePromise);
  expect(second).toBe(false);

  await dialog.locator('button[value="cancel"]').click();

  const result = await page.evaluate(async () => ({
    first: await window.__hdFirstRestorePromise,
    busy: !!window.__hdBackupRestoreBusy,
    alerts: window.__hdConcurrentAlerts || []
  }));

  expect(result.first).toBe(false);
  expect(result.busy).toBe(false);
  expect(result.alerts.join(' ')).toContain('進行中');
  expect(errors).toEqual([]);
});


test('release smoke: diagnostics verifies restore safety layer readiness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdDXCollect === 'function' &&
    typeof window.hdPHOpenDb === 'function' &&
    typeof window.hdPHCreateSnapshot === 'function'
  );

  const result = await page.evaluate(async () => {
    const healthy = await window.hdDXCollect(false);
    const afterProbe = await window.hdPHGetSnapshots();
    const originalOpenDb = window.hdPHOpenDb;
    window.hdPHOpenDb = async () => { throw new Error('snapshot store unavailable'); };
    const broken = await window.hdDXCollect(false);
    window.hdPHOpenDb = originalOpenDb;
    return {
      healthyReady: !!healthy.restoreSafety?.ready,
      healthyStore: !!healthy.restoreSafety?.storeReady,
      healthyProbe: !!healthy.restoreSafety?.probeOk,
      probeLeaks: afterProbe.filter(x => String(x?.id || '').startsWith('__hd-safety-probe-')).length,
      brokenReady: !!broken.restoreSafety?.ready,
      brokenError: broken.restoreSafety?.error || '',
      brokenIssues: broken.issues || []
    };
  });

  expect(result.healthyReady).toBe(true);
  expect(result.healthyStore).toBe(true);
  expect(result.healthyProbe).toBe(true);
  expect(result.probeLeaks).toBe(0);
  expect(result.brokenReady).toBe(false);
  expect(result.brokenError).toContain('snapshot store unavailable');
  expect(result.brokenIssues.join(' ')).toContain('復元安全スナップショット');
  expect(errors).toEqual([]);
});


test('release smoke: mobile attention tracks external backup freshness', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNBackupAttention === 'function' &&
    typeof window.hdQNMobileAttentionItems === 'function'
  );

  const result = await page.evaluate(() => {
    const now = Date.now();
    const backupKey = 'harbordesk-last-external-backup-v1';
    const syncKey = 'harbordesk-kancolle-sync-v1';

    localStorage.removeItem(backupKey);
    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now }));
    const missing = window.hdQNBackupAttention(now);
    const missingInAttention = window.hdQNMobileAttentionItems().some(x => x?.id === 'backup');

    localStorage.setItem(backupKey, String(now + 1000));
    const fresh = window.hdQNBackupAttention(now);
    const freshInAttention = window.hdQNMobileAttentionItems().some(x => x?.id === 'backup');

    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now - 16 * 86400000 }));
    localStorage.setItem(backupKey, String(now - 15 * 86400000));
    const old = window.hdQNBackupAttention(now);

    localStorage.setItem(syncKey, JSON.stringify({ syncedAt: now }));
    localStorage.setItem(backupKey, String(now - 60 * 1000));
    const afterSync = window.hdQNBackupAttention(now);

    return {
      missingTitle: missing?.title || '',
      missingPriority: Number(missing?.priority) || 0,
      missingInAttention,
      freshIsNull: fresh === null,
      freshInAttention,
      oldTitle: old?.title || '',
      oldDetail: old?.detail || '',
      afterSyncTitle: afterSync?.title || '',
      afterSyncPriority: Number(afterSync?.priority) || 0
    };
  });

  expect(result.missingTitle).toContain('バックアップ');
  expect(result.missingPriority).toBe(60);
  expect(result.missingInAttention).toBe(true);
  expect(result.freshIsNull).toBe(true);
  expect(result.freshInAttention).toBe(false);
  expect(result.oldTitle).toContain('更新');
  expect(result.oldDetail).toContain('15日');
  expect(result.afterSyncTitle).toContain('同期後');
  expect(result.afterSyncPriority).toBe(60);
  expect(errors).toEqual([]);
});


test('release smoke: mobile attention offers one-tap backup action', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNOpenAttention === 'function' &&
    typeof window.hdQNRunAttentionAction === 'function'
  );

  const result = await page.evaluate(async () => {
    const now = Date.now();
    localStorage.removeItem('harbordesk-last-external-backup-v1');
    localStorage.setItem('harbordesk-kancolle-sync-v1', JSON.stringify({ syncedAt: now }));

    window.hdQNOpenAttention();
    const dialog = document.getElementById('hdMobileAttentionDialog');
    const action = document.querySelector('[data-hd-attention-action="backup-now"]');
    const label = action?.textContent || '';

    const originalShare = window.shareBackup;
    let calls = 0;
    window.shareBackup = async () => { calls++; return false; };
    const cancelled = await window.hdQNRunAttentionAction('backup-now', 'backup');
    const openAfterCancel = !!dialog?.open;

    window.shareBackup = async () => { calls++; return true; };
    const saved = await window.hdQNRunAttentionAction('backup-now', 'backup');
    const openAfterSave = !!dialog?.open;

    window.shareBackup = originalShare;
    return {
      hasAction: !!action,
      label,
      cancelled,
      saved,
      openAfterCancel,
      openAfterSave,
      calls
    };
  });

  expect(result.hasAction).toBe(true);
  expect(result.label).toContain('今すぐ保存');
  expect(result.cancelled).toBe(false);
  expect(result.openAfterCancel).toBe(true);
  expect(result.saved).toBe(true);
  expect(result.openAfterSave).toBe(false);
  expect(result.calls).toBe(2);
  expect(errors).toEqual([]);
});


test('release smoke: backup reminder detects meaningful local data without sync', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdQNHasMeaningfulBackupData === 'function' &&
    typeof window.hdQNBackupAttention === 'function'
  );

  const result = await page.evaluate(() => {
    const backupKey = 'harbordesk-last-external-backup-v1';
    const syncKey = 'harbordesk-kancolle-sync-v1';
    const contentKeys = window.HD_QN_BACKUP_CONTENT_KEYS || [
      'harbordesk-ship-roster-v1','harbordesk-equipment-v1','harbordesk-sortie-log-v1',
      'harbordesk-drop-hunts-v1','harbordesk-activity-log-v1','harbordesk-quest-progress-v1',
      'harbordesk-event-operations-v1','harbordesk-ship-profiles-v1','harbordesk-equipment-variants-v1',
      'harbordesk-resource-goals-v1','harbordesk-resource-history-v1','harbordesk-custom-fleets-v1',
      'harbordesk-training-plans-v1','harbordesk-exercise-routine-v1','harbordesk-equipment-procurement-v1',
      'harbordesk-equipment-procurement-history-v1','harbordesk-material-stock-v1','harbordesk-material-goals-v1',
      'harbordesk-sortie-selection-v1','harbordesk-sortie-readiness-v1'
    ];

    localStorage.removeItem(backupKey);
    localStorage.removeItem(syncKey);
    for (const key of contentKeys) localStorage.removeItem(key);

    localStorage.setItem('harbordesk-quick-nav-recent-v1', JSON.stringify([{ id: 'home', at: Date.now() }]));
    const blank = window.hdQNHasMeaningfulBackupData();
    const blankAttention = window.hdQNBackupAttention();

    localStorage.setItem('harbordesk-ship-roster-v1', JSON.stringify([{ id: '1', name: 'テスト艦', level: 1 }]));
    const roster = window.hdQNHasMeaningfulBackupData();
    const rosterAttention = window.hdQNBackupAttention();

    localStorage.removeItem('harbordesk-ship-roster-v1');
    const originalState = window.hdGetAppState;
    window.hdGetAppState = undefined;
    localStorage.setItem('harbordesk-pwa-v1', JSON.stringify({
      expeditions: [],
      docks: [],
      quests: [{ id: 'q1', name: '手入力任務', done: false }],
      resources: { fuel: '', ammo: '', steel: '', bauxite: '', savedAt: null }
    }));
    const core = window.hdQNHasMeaningfulBackupData();
    const coreAttention = window.hdQNBackupAttention();
    window.hdGetAppState = originalState;

    return {
      blankHasData: !!blank.hasData,
      blankAttention: blankAttention?.title || '',
      rosterHasData: !!roster.hasData,
      rosterTitle: rosterAttention?.title || '',
      rosterPriority: Number(rosterAttention?.priority) || 0,
      coreHasData: !!core.hasData,
      coreTitle: coreAttention?.title || ''
    };
  });

  expect(result.blankHasData).toBe(false);
  expect(result.blankAttention).toBe('');
  expect(result.rosterHasData).toBe(true);
  expect(result.rosterTitle).toContain('バックアップ未作成');
  expect(result.rosterPriority).toBe(50);
  expect(result.coreHasData).toBe(true);
  expect(result.coreTitle).toContain('バックアップ未作成');
  expect(errors).toEqual([]);
});


test('release smoke: every map shows recommended level guidance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapLevelGuide === 'function' &&
    typeof window.renderMapPicker === 'function'
  );

  const result = await page.evaluate(() => {
    const maps = Object.values(MAPS).flat();
    const guides = maps.map(map => ({ map, ...window.hdMapLevelGuide(map) }));
    const missing = guides.filter(x =>
      !x.recommended || x.recommended === '個別確認' ||
      !x.min || x.min === '目安なし' ||
      !x.note
    );

    selectedWorld = '2';
    selectedMap = '2-4';
    window.renderMapPicker();
    const card = document.getElementById('selectedMapCard')?.textContent || '';

    return {
      mapCount: maps.length,
      missing,
      sample: window.hdMapLevelGuide('2-4'),
      hardSample: window.hdMapLevelGuide('5-6'),
      hasLabel: card.includes('推奨練度'),
      hasRecommended: card.includes('平均Lv40〜50'),
      hasDisclaimer: card.includes('HarborDeskの攻略目安')
    };
  });

  expect(result.mapCount).toBe(37);
  expect(result.missing).toEqual([]);
  expect(result.sample.recommended).toBe('平均Lv40〜50');
  expect(result.sample.min).toBe('Lv30〜35');
  expect(result.hardSample.recommended).toBe('平均Lv90〜110');
  expect(result.hasLabel).toBe(true);
  expect(result.hasRecommended).toBe(true);
  expect(result.hasDisclaimer).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: map攻略 tools survive tab redraws', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdRenderMapEquipmentRecommendations === 'function' &&
    typeof window.hdRenderLandBasePlanner === 'function' &&
    typeof window.hdFCRender === 'function' &&
    typeof window.hdRenderSortieReadiness === 'function' &&
    typeof window.hdSPRender === 'function' &&
    typeof window.hdSPSMapButton === 'function' &&
    typeof window.hdFSMapButton === 'function',
    null,
    { timeout: 30000 }
  );

  const result = await page.evaluate(async () => {
    const tick = ms => new Promise(resolve => setTimeout(resolve, ms));
    const selectMap = async (world, map) => {
      selectedWorld = world;
      selectedMap = map;
      renderMapPicker();
      await tick(120);
    };
    const clickTab = async tab => {
      document.querySelector(`[data-map-tab="${tab}"]`)?.click();
      await tick(120);
    };

    await selectMap('5', '5-6');
    await clickTab('map');
    const tabs = [...document.querySelectorAll('.map-tab-btn')].map(x => x.dataset.mapTab);
    const stageButtons = document.querySelectorAll('[data-hd-map-stage="5-6"]').length;
    const structureNodes = document.querySelectorAll('.hd-map-structure-guide .hd-map-node').length;
    const routeHighlight = !!document.getElementById('hdRouteHighlight');
    const nodeInfo = !!document.getElementById('hdMapNodeInfo');
    const prepButton = !!document.querySelector('[data-hd-sps-open]');
    const fleetSuggestButton = !!document.querySelector('[data-hd-fs-open]');

    await clickTab('drop');
    const dropPanel = !!document.querySelector('.hd-map-drop-panel');

    await clickTab('fleet');
    const fleetCandidates = !!document.querySelector('.hd-map-ship-recommend');

    await selectMap('6', '6-4');
    await clickTab('route');
    const routeRequirements = document.getElementById('hdMapRouteRequirements')?.textContent || '';

    await clickTab('gear');
    const equipRecommend = !!document.querySelector('#hdMapEquipRecommend .hd-map-equip-recommend');
    const landBase = !!document.getElementById('hdLandBasePlanner');
    const fleetCalc = !!document.getElementById('hdFleetCalculator');

    await selectMap('5', '5-5');
    await clickTab('mine');
    const customFleet = !!document.getElementById('customFleetPanel');
    const readiness = !!document.getElementById('hdSortieReadiness');
    const support = !!document.getElementById('hdSupportPlanner');
    const headerActionsAfterRedraw =
      !!document.querySelector('[data-hd-sps-open]') &&
      !!document.querySelector('[data-hd-fs-open]');

    return {
      tabs,
      stageButtons,
      structureNodes,
      routeHighlight,
      nodeInfo,
      prepButton,
      fleetSuggestButton,
      dropPanel,
      fleetCandidates,
      routeRequirements,
      equipRecommend,
      landBase,
      fleetCalc,
      customFleet,
      readiness,
      support,
      headerActionsAfterRedraw
    };
  });

  expect(result.tabs).toEqual(['overview','map','fleet','route','gear','quest','drop','mine']);
  expect(result.stageButtons).toBe(3);
  expect(result.structureNodes).toBeGreaterThan(3);
  expect(result.routeHighlight).toBe(true);
  expect(result.nodeInfo).toBe(true);
  expect(result.prepButton).toBe(true);
  expect(result.fleetSuggestButton).toBe(true);
  expect(result.dropPanel).toBe(true);
  expect(result.fleetCandidates).toBe(true);
  expect(result.routeRequirements).toContain('索敵');
  expect(result.routeRequirements).toContain('基地航空隊');
  expect(result.equipRecommend).toBe(true);
  expect(result.landBase).toBe(true);
  expect(result.fleetCalc).toBe(true);
  expect(result.customFleet).toBe(true);
  expect(result.readiness).toBe(true);
  expect(result.support).toBe(true);
  expect(result.headerActionsAfterRedraw).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: map overview exposes visible攻略 tool launcher', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdMapOpenTool === 'function' &&
    typeof window.hdEnhanceMapPane === 'function' &&
    typeof window.hdFCRender === 'function',
    null,
    { timeout: 30000 }
  );

  await page.evaluate(() => {
    selectedWorld = '5';
    selectedMap = '5-6';
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'5-6':'overview'}));
    renderMapPicker();
  });

  const launcher = page.locator('.hd-map-tools-overview');
  await expect(launcher).toBeVisible();

  for (const tool of ['map','fleet','suggest','prep','gear','drop','mine']) {
    await expect(launcher.locator(`[data-hd-map-tool="${tool}"]`)).toBeVisible();
  }

  await launcher.locator('[data-hd-map-tool="map"]').click();
  await expect(page.locator('[data-map-pane="map"]')).toBeVisible();
  await expect(page.locator('.hd-map-structure-guide > summary')).toBeVisible();

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="gear"]').click();
  await expect(page.locator('[data-map-pane="gear"]')).toBeVisible();
  await expect(page.locator('#hdFleetCalculator')).toBeVisible({ timeout: 5000 });

  await page.locator('[data-map-tab="overview"]').click();
  await expect(launcher).toBeVisible();

  await launcher.locator('[data-hd-map-tool="drop"]').click();
  await expect(page.locator('[data-map-pane="drop"]')).toBeVisible();
  await expect(page.locator('.hd-map-drop-panel')).toBeVisible();

  expect(errors).toEqual([]);
});


test('release smoke: map攻略 critical assets are cache-busted', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  const data = await page.evaluate(() => {
    const scriptSrcs = [...document.scripts].map(x => x.getAttribute('src') || '');
    const styleHrefs = [...document.querySelectorAll('link[rel="stylesheet"]')].map(x => x.getAttribute('href') || '');
    const requiredScripts = [
      'map-details.js?v=340',
      'map-images.js?v=340',
      'map-tabs.js?v=340',
      'map-interactive.js?v=340',
      'map-advanced-data.js?v=340'
    ];
    const requiredStyles = [
      'map-details.css?v=338',
      'map-tabs.css?v=338',
      'map-images.css?v=338',
      'map-interactive.css?v=338'
    ];
    return {
      scripts: requiredScripts.map(x => ({ x, ok: scriptSrcs.some(s => s.endsWith(x)) })),
      styles: requiredStyles.map(x => ({ x, ok: styleHrefs.some(s => s.endsWith(x)) })),
      launcher: !!document.querySelector('.hd-map-tools-overview')
    };
  });

  expect(data.scripts.every(x => x.ok)).toBe(true);
  expect(data.styles.every(x => x.ok)).toBe(true);

  await page.evaluate(() => {
    selectedWorld = '2';
    selectedMap = '2-4';
    localStorage.setItem('harbordesk-map-tab-v1', JSON.stringify({'2-4':'overview'}));
    renderMapPicker();
  });
  await expect(page.locator('.hd-map-tools-overview')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: real iPhone flow opens map攻略 tools', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await expect(page.locator('[data-map="2-4"]')).toBeVisible();
  await page.locator('[data-map="2-4"]').click();

  await expect(page.locator('#selectedMapCard')).toBeVisible();
  await expect(page.locator('#selectedMapCard')).toContainText('2-4');
  await expect(page.locator('#selectedMapCard')).toContainText('推奨練度');
  await expect(page.locator('.hd-map-tools-overview')).toBeVisible();
  await expect(page.locator('.hd-map-tools-overview [data-hd-map-tool="map"]')).toBeVisible();
  await expect(page.locator('.hd-map-tools-overview [data-hd-map-tool="prep"]')).toBeVisible();

  const src = await page.locator('script[src^="app.js"]').getAttribute('src');
  expect(src).toBe('app.js?v=340');
  expect(errors).toEqual([]);
});


test('release smoke: fallback map renderer still exposes攻略 tools when map tabs fail', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const card = page.locator('#selectedMapCard');
  await expect(card).toContainText('2-4');
  await expect(card).toContainText('推奨練度');

  const fallback = card.locator('[data-hd-core-map-tools]');
  await expect(fallback).toBeVisible();
  for (const action of ['map','fleet','suggest','prep','gear','drop','mine']) {
    await expect(fallback.locator(`[data-hd-core-map-action="${action}"]`)).toBeVisible();
  }

  await fallback.locator('[data-hd-core-map-action="prep"]').click();
  await expect(page.locator('#hdSortiePreparation')).toBeVisible({ timeout: 5000 });

  expect(errors).toEqual([]);
});


test('release smoke: map攻略 fits iPhone width without horizontal swiping', async ({ page }) => {
  const errors = [];
  await boot(page, errors);

  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();
  await expect(page.locator('#selectedMapCard')).toContainText('推奨練度');

  const first = await page.evaluate(() => {
    const doc = document.documentElement;
    const world = document.getElementById('worldPicker');
    const card = document.getElementById('selectedMapCard');
    const tabBar = document.querySelector('.map-tab-bar');
    return {
      viewport: window.innerWidth,
      docWidth: doc.scrollWidth,
      worldWidth: world?.scrollWidth || 0,
      worldClient: world?.clientWidth || 0,
      cardRight: Math.ceil(card?.getBoundingClientRect().right || 0),
      tabWidth: tabBar?.scrollWidth || 0,
      tabClient: tabBar?.clientWidth || 0
    };
  });

  expect(first.docWidth).toBeLessThanOrEqual(first.viewport + 1);
  expect(first.worldWidth).toBeLessThanOrEqual(first.worldClient + 1);
  expect(first.cardRight).toBeLessThanOrEqual(first.viewport + 1);
  expect(first.tabWidth).toBeLessThanOrEqual(first.tabClient + 1);

  await page.locator('[data-world="5"]').click();
  await page.locator('[data-map="5-6"]').click();
  await page.locator('[data-map-tab="map"]').click();
  await expect(page.locator('[data-map-pane="map"]')).toBeVisible();

  const second = await page.evaluate(() => {
    const doc = document.documentElement;
    const stages = document.querySelector('.hd-map-stage-tabs');
    const image = document.querySelector('.hd-map-reference-image');
    return {
      viewport: window.innerWidth,
      docWidth: doc.scrollWidth,
      stageWidth: stages?.scrollWidth || 0,
      stageClient: stages?.clientWidth || 0,
      imageWidth: Math.ceil(image?.getBoundingClientRect().width || 0),
      imageRight: Math.ceil(image?.getBoundingClientRect().right || 0)
    };
  });

  expect(second.docWidth).toBeLessThanOrEqual(second.viewport + 1);
  expect(second.stageWidth).toBeLessThanOrEqual(second.stageClient + 1);
  expect(second.imageWidth).toBeLessThanOrEqual(second.viewport);
  expect(second.imageRight).toBeLessThanOrEqual(second.viewport + 1);
  expect(errors).toEqual([]);
});


test('release smoke: mobile update menu occupies its own row without covering攻略', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await expect(page.locator('#guide')).toBeVisible();

  const more = page.locator('.hd-header-more');
  await more.locator(':scope > summary').click();
  await expect(more).toHaveAttribute('open', '');
  const row = page.locator('#hdMobileHeaderMenuRow');
  await expect(row).toBeVisible();
  await expect(row.locator('.hd-version-menu')).toBeVisible();

  const layout = await page.evaluate(() => {
    const top=document.querySelector('.topbar')?.getBoundingClientRect();
    const row=document.getElementById('hdMobileHeaderMenuRow')?.getBoundingClientRect();
    const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
    const menu=document.querySelector('#hdMobileHeaderMenuRow .hd-version-menu')?.getBoundingClientRect();
    return {
      topBottom:Math.round(top?.bottom||0),
      rowTop:Math.round(row?.top||0),
      rowBottom:Math.round(row?.bottom||0),
      navTop:Math.round(nav?.top||0),
      menuWidth:Math.round(menu?.width||0),
      viewport:window.innerWidth
    };
  });

  expect(Math.abs(layout.rowTop-layout.topBottom)).toBeLessThanOrEqual(2);
  expect(layout.rowBottom).toBeLessThanOrEqual(layout.navTop+2);
  expect(layout.menuWidth).toBeLessThanOrEqual(layout.viewport);
  
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    window.scrollBy(0, 160);
    window.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(350);
  await expect(more).not.toHaveAttribute('open', '');
  await expect(row).toBeHidden();
  expect(errors).toEqual([]);
});


test('release smoke: one canonical map renderer owns primary and fallback paths', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const primary = await page.evaluate(() => ({
    info: window.hdMapRendererInfo?.(),
    mode: window.__HD_MAP_RENDER_STATE?.mode,
    wrappers: {
      base: typeof window.hdMapBaseRenderPicker === 'function',
      tabs: typeof window.hdMapTabsCoreApply === 'function',
      fallback: typeof window.hdMapRenderFallback === 'function',
      plans: typeof window.hdRenderMapPlans === 'function'
    }
  }));
  expect(primary.info?.installed).toBe(true);
  expect(primary.mode).toBe('tabs');
  expect(primary.wrappers).toEqual({base:true,tabs:true,fallback:true,plans:true});
  await expect(page.locator('.map-tabs-shell')).toBeVisible();
  expect(errors).toEqual([]);
});

test('release smoke: canonical map renderer falls back without override chains', async ({ page }) => {
  const errors = [];
  await page.route('**/map-tabs.js*', route => route.abort());
  await boot(page, errors);
  await page.locator('[data-hd-ws-group="guide"]').click();
  await page.locator('[data-world="2"]').click();
  await page.locator('[data-map="2-4"]').click();

  const info = await page.evaluate(() => window.hdMapRendererInfo?.());
  expect(info?.installed).toBe(true);
  expect(info?.mode).toBe('fallback');
  expect(info?.hasFallback).toBe(true);
  await expect(page.locator('[data-hd-core-map-tools]')).toBeVisible();
  await expect(page.locator('#mapExtraPanel')).toContainText('編成例');
  expect(errors).toEqual([]);
});


test('release smoke: shared mobile layout prevents chrome overlap across iPhone sizes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  const sizes = [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 844, height: 390 }
  ];

  await page.waitForFunction(() => typeof window.hdInitUpdateManagerUI === 'function', null, { timeout: 30000 });
  await page.evaluate(() => window.hdInitUpdateManagerUI());
  await page.waitForFunction(() =>
    !!document.querySelector('.hd-header-more') &&
    !!document.getElementById('hdMobileHeaderMenuRow'),
    null,
    { timeout: 30000 }
  );

  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.waitForTimeout(180);
    await page.locator('[data-hd-ws-group="guide"]').click();
    await page.waitForTimeout(120);

    const before = await page.evaluate(() => {
      const top=document.querySelector('.topbar')?.getBoundingClientRect();
      const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
      const dock=document.getElementById('hdMobileDock')?.getBoundingClientRect();
      const main=document.querySelector('main')?.getBoundingClientRect();
      const css=getComputedStyle(document.documentElement);
      return {
        vw:window.innerWidth,
        docWidth:document.documentElement.scrollWidth,
        topBottom:Math.round(top?.bottom||0),
        navTop:Math.round(nav?.top||0),
        dockWidth:Math.round(dock?.width||0),
        dockBottom:Math.round(dock?.bottom||0),
        mainWidth:Math.round(main?.width||0),
        clearance:css.getPropertyValue('--hd-mobile-bottom-clearance').trim()
      };
    });

    expect(before.docWidth).toBeLessThanOrEqual(before.vw + 1);
    expect(before.topBottom).toBeLessThanOrEqual(before.navTop + 2);
    expect(before.dockWidth).toBeLessThanOrEqual(before.vw);
    expect(before.mainWidth).toBeLessThanOrEqual(before.vw);
    expect(before.clearance).not.toBe('');

    if (size.width <= 560) {
      await page.waitForTimeout(350);
      await page.evaluate(() => {
        const more=document.querySelector('.hd-header-more');
        if(more)more.open=true;
        window.hdSyncMobileHeaderMenu?.();
      });
      await expect(page.locator('#hdMobileHeaderMenuRow')).toBeVisible();
      const open = await page.evaluate(() => {
        const row=document.getElementById('hdMobileHeaderMenuRow')?.getBoundingClientRect();
        const nav=document.getElementById('hdWorkspaceNav')?.getBoundingClientRect();
        return {rowBottom:Math.round(row?.bottom||0),navTop:Math.round(nav?.top||0)};
      });
      expect(open.rowBottom).toBeLessThanOrEqual(open.navTop + 2);
      await page.evaluate(() => {
        const more=document.querySelector('.hd-header-more');
        if(more)more.open=false;
        window.hdSyncMobileHeaderMenu?.();
      });
      await page.waitForTimeout(50);
    }
  }

  expect(errors).toEqual([]);
});


test('release smoke: diagnostic snapshot rows never enter user snapshot lists', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHOpenDb === 'function' &&
    typeof window.hdPHGetSnapshots === 'function' &&
    typeof window.hdPHIsDiagnosticSnapshot === 'function'
  );

  const result = await page.evaluate(async () => {
    const db=await window.hdPHOpenDb();
    const probe={id:'__hd-safety-probe-stale-test',at:Date.now()+1000,reason:'診断プローブ',payload:{},bytes:0,probe:true};
    const real={id:'hd-real-snapshot-test',at:Date.now(),reason:'手動',payload:{'harbordesk-test':'{}'},bytes:2};
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');
      store.put(probe);store.put(real);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    db.close();
    const rows=await window.hdPHGetSnapshots();
    const db2=await window.hdPHOpenDb();
    await new Promise((resolve,reject)=>{
      const tx=db2.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');
      store.delete(probe.id);store.delete(real.id);
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    db2.close();
    return {
      ids:rows.map(x=>x.id),
      probeRecognized:window.hdPHIsDiagnosticSnapshot(probe),
      realRecognized:window.hdPHIsDiagnosticSnapshot(real)
    };
  });

  expect(result.probeRecognized).toBe(true);
  expect(result.realRecognized).toBe(false);
  expect(result.ids).toContain('hd-real-snapshot-test');
  expect(result.ids).not.toContain('__hd-safety-probe-stale-test');
  expect(errors).toEqual([]);
});

test('release smoke: internal snapshot restore shares the global restore lock', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdPHCreateSnapshot === 'function' &&
    typeof window.hdPHRestoreSnapshot === 'function' &&
    typeof window.hdPHGetSnapshots === 'function' &&
    typeof window.hdPHWithRestoreLock === 'function' &&
    typeof window.hdBuildBackupFile === 'function' &&
    typeof window.importBackup === 'function'
  );

  const result = await page.evaluate(async () => {
    window.__hdInternalRestoreAlerts = [];
    window.alert = message => window.__hdInternalRestoreAlerts.push(String(message || ''));
    localStorage.setItem('harbordesk-internal-lock-test', JSON.stringify({ value: 'safe' }));
    await window.hdPHCreateSnapshot('lock-test');
    const rows = await window.hdPHGetSnapshots();
    const id = rows.find(x => x.reason === 'lock-test')?.id;

    let ownedAtConfirm = false;
    window.confirm = () => {
      ownedAtConfirm = window.__hdBackupRestoreBusy === true;
      return false;
    };
    const cancelled = await window.hdPHRestoreSnapshot(id);
    const clearedAfterCancel = window.__hdBackupRestoreBusy === false;

    let releaseHold;
    const held = window.hdPHWithRestoreLock(() => new Promise(resolve => { releaseHold = resolve; }));
    await new Promise(resolve => setTimeout(resolve, 0));
    const helperOwnsLock = window.__hdBackupRestoreBusy === true;

    const built = window.hdBuildBackupFile();
    const file = new File([JSON.stringify(built.data)], 'HarborDesk-shared-lock.json', { type: 'application/json' });
    const externalBlocked = await window.importBackup(file);
    const internalBlocked = await window.hdPHRestoreSnapshot(id);

    releaseHold(false);
    const heldResult = await held;
    const clearedAfterHold = window.__hdBackupRestoreBusy === false;

    return {
      cancelled,
      ownedAtConfirm,
      clearedAfterCancel,
      helperOwnsLock,
      externalBlocked,
      internalBlocked,
      heldResult,
      clearedAfterHold,
      alerts: window.__hdInternalRestoreAlerts || []
    };
  });

  expect(result.cancelled).toBe(false);
  expect(result.ownedAtConfirm).toBe(true);
  expect(result.clearedAfterCancel).toBe(true);
  expect(result.helperOwnsLock).toBe(true);
  expect(result.externalBlocked).toBe(false);
  expect(result.internalBlocked).toBe(false);
  expect(result.heldResult).toBe(false);
  expect(result.clearedAfterHold).toBe(true);
  expect(result.alerts.join(' ')).toContain('進行中');
  expect(errors).toEqual([]);
});

test('release smoke: update menu bootstrap is available before async modules finish', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(String(err?.message || err)));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });

  await page.waitForFunction(() => typeof window.hdInitUpdateManagerUI === 'function', null, { timeout: 12000 });
  const result = await page.evaluate(() => {
    const ok=window.hdInitUpdateManagerUI();
    const row=document.getElementById('hdMobileHeaderMenuRow');
    const more=document.querySelector('.hd-header-more');
    return {
      ok,
      rowExists:!!row,
      rowHidden:!!row?.hidden,
      menuExists:!!more,
      bound:more?.dataset?.hdInlineBound||''
    };
  });

  expect(result.ok).toBe(true);
  expect(result.rowExists).toBe(true);
  expect(result.rowHidden).toBe(true);
  expect(result.menuExists).toBe(true);
  expect(result.bound).toBe('1');
  expect(errors).toEqual([]);
});


test('release smoke: dedicated sortie mode summarizes active session', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMOpen === 'function' &&
    typeof window.hdQNMobileAttentionItems === 'function'
  );

  const startedAt = Date.now() - 5 * 60 * 1000;
  await page.evaluate(startedAt => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-test-session',
      map:'2-4',
      startedAt,
      fleetId:'sm-test-fleet',
      fleetName:'テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-test-fleet',name:'テスト艦隊',ships:[
        {ship:'吹雪',gear:'12.7cm連装砲 / 電探'},
        {ship:'赤城',gear:'艦戦 / 艦攻'}
      ]},
      readinessSnapshot:{autoOk:2,autoTotal:3,manualDone:1,manualTotal:2,unresolved:[{label:'補給',state:'warn',detail:''}]},
      shipCount:2,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  }, startedAt);

  await expect(page.locator('#hdSortieMode')).toBeVisible();
  await expect(page.locator('#hdSortieModeBody')).toContainText('2-4');
  await expect(page.locator('#hdSortieModeBody')).toContainText('テスト艦隊');
  await expect(page.locator('#hdSortieModeBody')).toContainText('補給');
  await expect(page.locator('[data-hd-sm-elapsed]')).not.toHaveText('');
  await expect(page.locator('.hd-sm-shortcuts button')).toHaveCount(5);

  const attention = await page.evaluate(() => window.hdQNMobileAttentionItems().find(x => x?.id === 'hdSortieMode'));
  expect(attention?.title || '').toContain('2-4');
  expect(attention?.reason || '').toContain('出撃');
  expect(Number(attention?.priority) || 0).toBe(90);
  expect(errors).toEqual([]);
});

test('release smoke: sortie mode return recording clears active session', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSSFinish === 'function' &&
    typeof window.hdSLRecordEntry === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-finish-session',
      map:'3-2',
      startedAt:Date.now()-120000,
      fleetId:'sm-finish-fleet',
      fleetName:'帰還テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-finish-fleet',name:'帰還テスト艦隊',ships:[{ship:'夕立',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('#hdSortieMode')).toBeVisible();
  await page.locator('#hdSMResult').selectOption('撤退');
  await page.locator('#hdSMNode').fill('K');
  await page.locator('#hdSMBattles').fill('3');
  await page.locator('#hdSMMemo').fill('出撃モード記録テスト');
  await page.locator('[data-hd-sm-finish]').click();

  await page.waitForFunction(() => !localStorage.getItem('harbordesk-active-sortie-session-v1'));
  const result = await page.evaluate(() => {
    let rows=[];try{rows=JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')||[]}catch{}
    const hit=rows.find(x=>x.sessionId==='sm-finish-session');
    return {active:localStorage.getItem('harbordesk-active-sortie-session-v1'),hit};
  });
  expect(result.active).toBeNull();
  expect(result.hit?.map).toBe('3-2');
  expect(result.hit?.result).toBe('撤退');
  expect(result.hit?.node).toBe('K');
  expect(result.hit?.battles).toBe(3);
  expect(result.hit?.memo || '').toContain('出撃モード記録テスト');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode autosaves and restores in-progress draft', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSaveDraft === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-draft-session',
      map:'4-5',
      startedAt:Date.now()-180000,
      fleetId:'sm-draft-fleet',
      fleetName:'下書きテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-draft-fleet',name:'下書きテスト艦隊',ships:[{ship:'最上',gear:'三式弾'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('#hdSMResult').selectOption('A');
  await page.locator('#hdSMNode').fill('K');
  await page.locator('#hdSMBattles').fill('4');
  await page.locator('#hdSMDrop').fill('テスト艦');
  await page.locator('#hdSMBuckets').fill('2');
  await page.locator('#hdSMMemo').fill('途中入力を保持');
  await page.locator('#hdSMBoss').check();

  // Repeated delayed bootstrap must not redraw an active form and erase unsaved controls.
  await page.evaluate(() => window.hdSMInstall());
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await expect(page.locator('#hdSMBoss')).toBeChecked();

  await page.evaluate(() => window.hdSMSaveDraft());

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null')?.draft || null);
  expect(stored?.result).toBe('A');
  expect(stored?.node).toBe('K');
  expect(stored?.battles).toBe(4);
  expect(stored?.boss).toBe(true);
  expect(stored?.drop).toBe('テスト艦');
  expect(stored?.buckets).toBe(2);
  expect(stored?.memo).toBe('途中入力を保持');
  expect(Number(stored?.updatedAt)||0).toBeGreaterThan(0);

  await page.evaluate(() => window.hdSMRender());
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await expect(page.locator('#hdSMNode')).toHaveValue('K');
  await expect(page.locator('#hdSMBattles')).toHaveValue('4');
  await expect(page.locator('#hdSMDrop')).toHaveValue('テスト艦');
  await expect(page.locator('#hdSMBuckets')).toHaveValue('2');
  await expect(page.locator('#hdSMMemo')).toHaveValue('途中入力を保持');
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await expect(page.locator('[data-hd-sm-draft-status]')).toContainText('保存');

  const attention = await page.evaluate(() => window.hdQNMobileAttentionItems().find(x => x?.id === 'hdSortieMode'));
  expect(attention?.detail || '').toContain('K到達');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode node picker records and rewinds route trail', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetNode === 'function' &&
    typeof window.hdSMUndoNode === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-node-session',
      map:'2-4',
      startedAt:Date.now()-120000,
      fleetId:'sm-node-fleet',
      fleetName:'マス追跡テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-node-fleet',name:'マス追跡テスト艦隊',ships:[{ship:'島風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-node]')).toHaveCount(15);
  await page.locator('[data-hd-sm-next-node="A"]').click();
  await page.locator('[data-hd-sm-next-node="D"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('D');
  await expect(page.locator('.hd-sm-route-trail')).toContainText('A → D');

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="H"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="J"]').click();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="O"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('O');
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await expect(page.locator('.hd-sm-route-trail')).toContainText('A → D → H → J → O');

  await page.locator('[data-hd-sm-route-undo]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('J');
  await expect(page.locator('#hdSMBoss')).not.toBeChecked();
  await page.locator('[data-hd-sm-route-undo]').click();
  await page.locator('[data-hd-sm-route-undo]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('D');
  await expect(page.locator('.hd-sm-route-trail')).toContainText('A → D');

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')||'null')?.draft || null);
  expect(stored?.node).toBe('D');
  expect(stored?.routeNodes).toEqual(['A','D']);
  expect(stored?.boss).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode prioritizes graph-connected next nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMNextNodeRows === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-next-node-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-next-node-fleet',
      fleetName:'次マステスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-next-node-fleet',name:'次マステスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(2);
  await expect(page.locator('[data-hd-sm-next-node="A"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="B"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-node]')).toHaveCount(15);

  await page.locator('[data-hd-sm-next-node="A"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('A');
  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(2);
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeEnabled();
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toBeEnabled();

  await page.locator('[data-hd-sm-next-node="D"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('D');
  await expect(page.locator('[data-hd-sm-next-node]')).toHaveCount(1);
  await expect(page.locator('[data-hd-sm-next-node="H"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="H"]')).toBeDisabled();
  await expect(page.locator('.hd-sm-route-trail')).toContainText('A → D');

  const nextRows = await page.evaluate(() => window.hdSMNextNodeRows('2-4',{node:'D'}).map(x=>x.label));
  expect(nextRows).toEqual(['H']);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode shows current node branch guidance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBranchHint === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-branch-hint-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-branch-hint-fleet',
      fleetName:'分岐ヒントテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-branch-hint-fleet',name:'分岐ヒントテスト艦隊',ships:[{ship:'時雨',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('.hd-sm-branch-hint')).toBeVisible();
  await page.locator('[data-hd-sm-next-node="B"]').click();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeDisabled();
  await page.locator('[data-hd-sm-safe-confirm]').click();
  await page.locator('[data-hd-sm-next-node="G"]').click();

  await expect(page.locator('.hd-sm-branch-hint')).toContainText('Gマスの分岐条件');
  await expect(page.locator('.hd-sm-branch-hint')).toContainText('I/K');
  const hint = await page.evaluate(() => window.hdSMBranchHint('2-4',{node:'G'}));
  expect(hint.text).toContain('I/K');
  expect(hint.source).toContain('攻略Wiki');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode previews next-node battle intelligence', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMNodeIntel === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-node-intel-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-node-intel-fleet',
      fleetName:'次マス注意テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-node-intel-fleet',name:'次マス注意テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const b = page.locator('[data-hd-sm-next-node="B"]');
  await expect(b).toBeVisible();
  await expect(b.locator('.hd-sm-next-risk')).toContainText('戦闘');
  await expect(b.locator('em')).toContainText('重巡リ級elite');

  const intel = await page.evaluate(() => window.hdSMNodeIntel('2-4',{label:'B',kind:'normal'}));
  expect(intel.hasDetail).toBe(true);
  expect(intel.enemy).toContain('重巡リ級elite');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode recommends formations and current-node cautions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMFormationAdvice === 'function' &&
    typeof window.hdSMNodeIntel === 'function'
  );

  const advice = await page.evaluate(() => ({
    normal: window.hdSMFormationAdvice('normal',{}),
    sub: window.hdSMFormationAdvice('sub',{}),
    air: window.hdSMFormationAdvice('air',{})
  }));
  expect(advice.normal.formation).toBe('単縦陣');
  expect(advice.sub.formation).toBe('単横陣');
  expect(advice.air.formation).toBe('輪形陣');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-formation-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-formation-fleet',
      fleetName:'陣形ガイドテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-formation-fleet',name:'陣形ガイドテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const b = page.locator('[data-hd-sm-next-node="B"]');
  await expect(b.locator('.hd-sm-next-formation')).toContainText('単縦陣');
  await expect(b.locator('.hd-sm-next-caution')).toContainText('砲雷撃戦');
  await b.click();

  await expect(page.locator('.hd-sm-current-tactic')).toBeVisible();
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('Bマス');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('単縦陣');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('警戒ポイント');
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode gates advancement behind damage confirmation', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEnsure === 'function' &&
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMAdvanceGuard === 'function' &&
    typeof window.hdSMSetAdvanceGuard === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-guard-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-guard-fleet',
      fleetName:'大破チェックテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{
        id:'sm-damage-guard-fleet',
        name:'大破チェックテスト艦隊',
        ships:[
          {ship:'雪風',nowHp:32,maxHp:32,gear:'主砲'},
          {ship:'時雨',nowHp:31,maxHp:31,gear:'主砲'}
        ]
      },
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:2,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-next-node="B"]')).toBeEnabled();
  await page.locator('[data-hd-sm-next-node="B"]').click();

  await expect(page.locator('.hd-sm-advance-guard')).toBeVisible();
  await expect(page.locator('.hd-sm-advance-guard')).toContainText('進撃前に大破確認');
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeDisabled();

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('.hd-sm-advance-guard')).toContainText('大破なし確認済み');
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeEnabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeEnabled();

  await page.locator('[data-hd-sm-next-node="G"]').click();
  await expect(page.locator('[data-hd-sm-next-node="I"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="K"]')).toBeDisabled();
  const guard = await page.evaluate(() => window.hdSMAdvanceGuard(JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')), JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft));
  expect(guard.current).toBe('G');
  expect(guard.confirmed).toBe(false);
  expect(errors).toEqual([]);
});

test('release smoke: damage retreat marks sortie draft as retreat', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetAdvanceGuard === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-retreat-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-retreat-fleet',
      fleetName:'大破撤退テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-damage-retreat-fleet',name:'大破撤退テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-damage-retreat]').click();
  await expect(page.locator('.hd-sm-advance-guard')).toContainText('大破あり・撤退');
  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMMemo')).toHaveValue(/大破撤退/);
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeDisabled();

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.result).toBe('撤退');
  expect(draft.advanceGuard.safe).toBe(false);
  expect(errors).toEqual([]);
});


test('release smoke: sortie damage guard blocks alternate node selection paths', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetNode === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-damage-hard-lock-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-damage-hard-lock-fleet',
      fleetName:'進撃ロックテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-damage-hard-lock-fleet',name:'進撃ロックテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('[data-hd-sm-node="D"]')).toBeDisabled();
  const blocked = await page.evaluate(() => window.hdSMSetNode('D'));
  expect(blocked).toBe(false);
  let draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('B');
  expect(draft.routeNodes).toEqual(['B']);

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('[data-hd-sm-node="D"]')).toBeEnabled();
  const moved = await page.evaluate(() => window.hdSMSetNode('D'));
  expect(moved).toBe(true);
  draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('D');
  expect(draft.routeNodes).toEqual(['B','D']);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode keeps current battle status visible in sticky hud', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMHudHtml === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-fleet',
      fleetName:'出撃HUDテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-fleet',name:'出撃HUDテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('B');
  await expect(hud).toContainText('単縦陣');
  await expect(hud).toContainText('大破未確認');
  expect(await hud.evaluate(el => getComputedStyle(el).position)).toBe('sticky');

  await page.locator('[data-hd-sm-safe-confirm]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('大破確認済');
  await expect(page.locator('.hd-sm-hud')).toHaveClass(/ready/);
  await expect(page.locator('[data-hd-sm-hud-jump="next"]')).toBeVisible();
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode auto-counts battles and supports quick return entry', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBattleCount === 'function' &&
    typeof window.hdSMQuickResult === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-quick-return-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-quick-return-fleet',
      fleetName:'帰還クイック入力テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-quick-return-fleet',name:'帰還クイック入力テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="A"]').click();
  await expect(page.locator('#hdSMBattles')).toHaveValue('0');
  let afterA = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(Number(afterA.battles)).toBe(0);
  await page.evaluate(() => window.hdSMSaveDraft());
  afterA = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(Number(afterA.battles)).toBe(0);
  await expect(page.locator('#hdSMBattles')).toHaveValue('0');
  await page.locator('[data-hd-sm-next-node="D"]').click();
  await expect(page.locator('#hdSMBattles')).toHaveValue('1');

  await page.locator('[data-hd-sm-quick-result="A"]').click();
  await expect(page.locator('#hdSMResult')).toHaveValue('A');
  await page.locator('[data-hd-sm-quick-boss]').click();
  await expect(page.locator('#hdSMBoss')).toBeChecked();
  await page.locator('[data-hd-sm-quick-drop-none]').click();
  await expect(page.locator('#hdSMDrop')).toHaveValue('なし');
  await page.locator('[data-hd-sm-quick-bucket]').click();
  await expect(page.locator('#hdSMBuckets')).toHaveValue('1');

  const data = await page.evaluate(() => ({
    count: window.hdSMBattleCount('2-4',['A','D']),
    draft: JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft
  }));
  expect(data.count).toBe(1);
  expect(data.draft.result).toBe('A');
  expect(data.draft.boss).toBe(true);
  expect(data.draft.drop).toBe('なし');
  expect(data.draft.buckets).toBe(1);
  expect(errors).toEqual([]);
});


test('release smoke: sortie mode records structured retreat reason', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMQuickRetreatReason === 'function' &&
    typeof window.hdSSFinish === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-retreat-reason-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-retreat-reason-fleet',
      fleetName:'撤退理由テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-retreat-reason-fleet',name:'撤退理由テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'A',routeNodes:['A'],result:'S',memo:'',battles:1}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-quick-result="撤退"]').click();
  await expect(page.locator('.hd-sm-retreat-reasons')).toBeVisible();
  await page.locator('[data-hd-sm-retreat-reason="索敵不足"]').click();
  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMRetreatReason')).toHaveValue('索敵不足');
  await expect(page.locator('.hd-sm-retreat-reasons')).toContainText('選択中: 索敵不足');

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.retreatReason).toBe('索敵不足');

  await page.locator('[data-hd-sm-finish]').click();
  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')[0]);
  expect(log.result).toBe('撤退');
  expect(log.retreat).toBe(true);
  expect(log.retreatReason).toBe('索敵不足');
  expect(errors).toEqual([]);
});


test('release smoke: sortie analytics summarizes structured retreat reasons', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'r1',at:Date.now(),map:'2-4',node:'D',result:'撤退',retreat:true,retreatReason:'大破',battles:2},
      {id:'r2',at:Date.now()-1000,map:'2-4',node:'G',result:'撤退',retreat:true,retreatReason:'大破',battles:3},
      {id:'r3',at:Date.now()-2000,map:'2-4',node:'H',result:'撤退',retreat:true,retreatReason:'索敵不足',battles:3},
      {id:'r4',at:Date.now()-3000,map:'2-4',node:'O',result:'S',retreat:false,battles:5,boss:true}
    ]));
    window.hdSLRender?.();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.waitForTimeout(150);
  const card = page.locator('#sortieLog .hd-spa-card').first();
  await expect(card).toBeVisible();
  const reasons = card.locator('.hd-spa-retreat-reasons');
  await expect(reasons).toBeVisible();
  await expect(reasons).toContainText('撤退理由');
  await expect(reasons).toContainText('大破');
  await expect(reasons).toContainText('2回 / 67%');
  await expect(reasons).toContainText('索敵不足');
  await expect(reasons).toContainText('1回 / 33%');
  await expect(card.locator('.hd-spa-review')).toContainText('道中の安定性を見直す');
  await expect(card.locator('.hd-spa-review')).toContainText('大破撤退 2回');
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD exposes confirmed next-node actions', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMSetNode === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-next-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-next-fleet',
      fleetName:'HUD次マステスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-next-fleet',name:'HUD次マステスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'B',routeNodes:['B'],result:'S',memo:'',advanceGuard:{node:'B',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toContainText('大破確認済');
  await expect(hud.locator('[data-hd-sm-hud-node="C"]')).toBeVisible();
  await expect(hud.locator('[data-hd-sm-hud-node="G"]')).toBeVisible();

  await hud.locator('[data-hd-sm-hud-node="G"]').click();
  await expect(page.locator('#hdSMNode')).toHaveValue('G');
  await expect(page.locator('.hd-sm-hud')).toContainText('大破未確認');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node]')).toHaveCount(0);
  await expect(page.locator('[data-hd-sm-next-node="I"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="K"]')).toBeDisabled();

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.node).toBe('G');
  expect(draft.advanceGuard).toBe(null);
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows current route condition', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSMRender === 'function' && typeof window.hdSMBranchHint === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-route-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-route-fleet',
      fleetName:'HUD分岐テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-route-fleet',name:'HUD分岐テスト艦隊',ships:[{ship:'時雨',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'G',routeNodes:['B','G'],result:'S',memo:'',advanceGuard:{node:'G',safe:false,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const route = page.locator('.hd-sm-hud-branch');
  await expect(route).toBeVisible();
  await expect(route).toContainText('Gマスの分岐条件');
  await expect(route).toContainText('I/K');
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows battle progress and boss distance', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossDistance === 'function'
  );

  const distance = await page.evaluate(() => window.hdSMBossDistance('2-4','D'));
  expect(distance).toBeGreaterThan(0);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-progress-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-progress-fleet',
      fleetName:'HUD進捗テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-progress-fleet',name:'HUD進捗テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'D',routeNodes:['A','D'],result:'S',memo:'',advanceGuard:{node:'D',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toContainText('戦闘 1');
  await expect(progress).toContainText('構造図最短 ボスまで');
  expect(errors).toEqual([]);
});


test('release smoke: sortie skips damage confirmation on verified non-battle nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMRequiresAdvanceCheck === 'function'
  );

  const checks = await page.evaluate(() => ({
    itemA: window.hdSMRequiresAdvanceCheck('2-4','A'),
    battleB: window.hdSMRequiresAdvanceCheck('2-4','B')
  }));
  expect(checks.itemA).toBe(false);
  expect(checks.battleB).toBe(true);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-nonbattle-guard-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-nonbattle-guard-fleet',
      fleetName:'非戦闘確認テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-nonbattle-guard-fleet',name:'非戦闘確認テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="A"]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('非戦闘');
  await expect(page.locator('.hd-sm-advance-guard')).toHaveCount(0);
  await expect(page.locator('[data-hd-sm-next-node="C"]')).toBeEnabled();
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toBeEnabled();

  await page.locator('[data-hd-sm-next-node="C"]').click();
  await expect(page.locator('.hd-sm-hud')).toContainText('大破未確認');
  await expect(page.locator('.hd-sm-advance-guard')).toBeVisible();
  await expect(page.locator('[data-hd-sm-next-node="F"]')).toBeDisabled();
  await expect(page.locator('[data-hd-sm-next-node="G"]')).toBeDisabled();
  expect(errors).toEqual([]);
});


test('release smoke: sortie derives effective node kinds from verified data', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEffectiveNodeKind === 'function' &&
    typeof window.hdSMNodeIntel === 'function' &&
    typeof window.hdSMRender === 'function'
  );

  const kinds = await page.evaluate(() => ({
    a: window.hdSMEffectiveNodeKind('2-4','A','normal'),
    b: window.hdSMEffectiveNodeKind('2-4','B','normal'),
    aIntel: window.hdSMNodeIntel('2-4',{label:'A',kind:'normal'}),
    bIntel: window.hdSMNodeIntel('2-4',{label:'B',kind:'normal'})
  }));

  expect(kinds.a).toBe('item');
  expect(kinds.b).toBe('normal');
  expect(kinds.aIntel.kind).toBe('item');
  expect(kinds.aIntel.formation).toBe('選択なし');
  expect(kinds.aIntel.badge).toBe('非戦闘');
  expect(kinds.bIntel.kind).toBe('normal');
  expect(kinds.bIntel.formation).toBe('単縦陣');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-effective-kind-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-effective-kind-fleet',
      fleetName:'マス分類テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-effective-kind-fleet',name:'マス分類テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const a = page.locator('[data-hd-sm-next-node="A"]');
  await expect(a).toContainText('資源');
  await expect(a).toContainText('基本陣形 選択なし');
  await a.click();
  await expect(page.locator('.hd-sm-hud')).toContainText('資源');
  await expect(page.locator('.hd-sm-current-tactic')).toContainText('選択なし');
  expect(errors).toEqual([]);
});


test('release smoke: sortie uses effective non-battle kind in HUD and node intelligence', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMEffectiveNodeKind === 'function' &&
    typeof window.hdSMNodeIntel === 'function' &&
    typeof window.hdSMRender === 'function'
  );

  const intel = await page.evaluate(() => ({
    kind: window.hdSMEffectiveNodeKind('2-4','A','normal'),
    node: window.hdSMNodeIntel('2-4',{label:'A',kind:'normal'})
  }));
  expect(intel.kind).toBe('item');
  expect(intel.node.kind).toBe('item');
  expect(intel.node.badge).toBe('非戦闘');
  expect(intel.node.formation).toBe('選択なし');
  expect(intel.node.caution).toBe('戦闘なし');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-effective-kind-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-effective-kind-fleet',
      fleetName:'実質マス種別テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-effective-kind-fleet',name:'実質マス種別テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const a = page.locator('[data-hd-sm-next-node="A"]');
  await expect(a).toContainText('資源');
  await expect(a).toContainText('非戦闘');
  await expect(a).toContainText('選択なし');
  await a.click();

  const hud = page.locator('.hd-sm-hud');
  await expect(hud).toContainText('資源');
  await expect(hud).toContainText('基本陣形 選択なし');
  await expect(hud).toContainText('非戦闘');
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows minimum remaining battles', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossBattleDistance === 'function'
  );

  const remaining = await page.evaluate(() => ({
    d: window.hdSMBossBattleDistance('2-4','D'),
    a: window.hdSMBossBattleDistance('2-4','A'),
    boss: window.hdSMBossBattleDistance('2-4','O')
  }));
  expect(remaining.d).toBe(3);
  expect(remaining.a).toBe(4);
  expect(remaining.boss).toBe(0);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-battle-distance-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-battle-distance-fleet',
      fleetName:'HUD残戦闘テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-battle-distance-fleet',name:'HUD残戦闘テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'D',routeNodes:['A','D'],result:'S',memo:'',advanceGuard:{node:'D',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toContainText('戦闘 1');
  await expect(progress).toContainText('構造図最短 ボスまで');
  await expect(progress).toContainText('最少戦闘あと 3');
  expect(errors).toEqual([]);
});


test('release smoke: sortie switches guide labels for non-battle nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetNode === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-guide-label-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-guide-label-fleet',
      fleetName:'ガイド見出しテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-guide-label-fleet',name:'ガイド見出しテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active'
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await page.locator('[data-hd-sm-next-node="A"]').click();
  const nonBattle = page.locator('.hd-sm-current-tactic');
  await expect(nonBattle).toContainText('NODE GUIDE');
  await expect(nonBattle).toContainText('確認ポイント');
  await expect(nonBattle).toContainText('選択なし');

  await page.locator('[data-hd-sm-next-node="D"]').click();
  const battle = page.locator('.hd-sm-current-tactic');
  await expect(battle).toContainText('BATTLE GUIDE');
  await expect(battle).toContainText('警戒ポイント');
  await expect(battle).toContainText('単縦陣');
  expect(errors).toEqual([]);
});


test('release smoke: sortie marks boss-connected versus off-route next nodes', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMCanReachBoss === 'function'
  );

  const reach = await page.evaluate(() => ({
    l: window.hdSMCanReachBoss('2-4','L'),
    m: window.hdSMCanReachBoss('2-4','M'),
    o: window.hdSMCanReachBoss('2-4','O'),
    sevenTwoGoalRoute: window.hdSMCanReachBoss('7-2','C'),
    sevenTwoTarget: window.hdSMRouteTargetName('7-2')
  }));
  expect(reach.l).toBe(true);
  expect(reach.m).toBe(false);
  expect(reach.o).toBe(true);
  expect(reach.sevenTwoGoalRoute).toBe(true);
  expect(reach.sevenTwoTarget).toBe('攻略目標');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-route-reachability-session',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-route-reachability-fleet',
      fleetName:'ボス接続テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-route-reachability-fleet',name:'ボス接続テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'I',routeNodes:['B','G','I'],result:'S',memo:'',advanceGuard:{node:'I',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const l = page.locator('[data-hd-sm-next-node="L"]');
  const m = page.locator('[data-hd-sm-next-node="M"]');
  await expect(l).toContainText('構造図上 ボス接続');
  await expect(m).toContainText('構造図上 逸れ候補');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="L"]')).toContainText('ボス接続');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="M"]')).toContainText('逸れ候補');
  await expect(page.locator('.hd-sm-hud [data-hd-sm-hud-node="M"]')).toHaveClass(/route-off/);
  expect(errors).toEqual([]);
});


test('release smoke: sortie progress uses nearest valid objective on multi-target maps', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMBossDistance === 'function' &&
    typeof window.hdSMBossBattleDistance === 'function' &&
    typeof window.hdSMRouteTargetName === 'function'
  );

  const metrics = await page.evaluate(() => ({
    distance: window.hdSMBossDistance('7-2','C'),
    battles: window.hdSMBossBattleDistance('7-2','C'),
    target: window.hdSMRouteTargetName('7-2')
  }));
  expect(metrics.distance).toBe(1);
  expect(metrics.battles).toBe(0);
  expect(metrics.target).toBe('攻略目標');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-distance-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-distance-fleet',
      fleetName:'攻略目標距離テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-distance-fleet',name:'攻略目標距離テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const progress = page.locator('.hd-sm-hud-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toContainText('構造図最短 攻略目標まで 1マス');
  await expect(progress).toContainText('最少戦闘あと 0');
  expect(errors).toEqual([]);
});


test('release smoke: sortie objective selector changes route guidance on multi-target maps', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMSetObjectiveTarget === 'function' &&
    typeof window.hdSMCanReachBoss === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-selector-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-selector-fleet',
      fleetName:'攻略目標選択テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-selector-fleet',name:'攻略目標選択テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{objectiveTarget:'G2',routeNodes:[],result:'S',memo:''}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const picker = page.locator('.hd-sm-objective-picker');
  await expect(picker).toBeVisible();
  await expect(picker.locator('[data-hd-sm-objective="G2"]')).toHaveClass(/active/);
  await expect(page.locator('[data-hd-sm-next-node="A"]')).toContainText('構造図上 逸れ候補');
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toContainText('構造図上 G2ボス接続');

  await picker.locator('[data-hd-sm-objective="G1"]').click();
  await expect(picker.locator('[data-hd-sm-objective="G1"]')).toHaveClass(/active/);
  await expect(page.locator('[data-hd-sm-next-node="A"]')).toContainText('構造図上 G1到達地点接続');
  await expect(page.locator('[data-hd-sm-next-node="D"]')).toContainText('構造図上 逸れ候補');

  let draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('G1');

  await picker.locator('[data-hd-sm-objective=""]').click();
  await expect(picker.locator('[data-hd-sm-objective=""]')).toHaveClass(/active/);
  draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('');
  expect(errors).toEqual([]);
});


test('release smoke: sortie log preserves selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSSFinish === 'function' &&
    typeof window.hdSMFormData === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-log-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-log-fleet',
      fleetName:'攻略目標ログテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-log-fleet',name:'攻略目標ログテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'G2',routeNodes:['D','E','F','I','G2'],result:'S',memo:'',objectiveTarget:'G2',battles:4,boss:true}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  await expect(page.locator('.hd-sm-objective-picker [data-hd-sm-objective="G2"]')).toHaveClass(/active/);

  await page.evaluate(() => {
    const data=window.hdSMFormData();
    data.node='G2';data.result='S';data.boss=true;
    window.hdSSFinish(data);
  });

  const entry = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-sortie-log-v1')||'[]')[0]);
  expect(entry.map).toBe('7-2');
  expect(entry.objectiveTarget).toBe('G2');
  expect(entry.boss).toBe(true);
  expect(errors).toEqual([]);
});


test('release smoke: sortie log displays selected objective badge', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSLRender === 'function' &&
    typeof window.hdSLRecordEntry === 'function'
  );
  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1','[]');
    window.hdSLRecordEntry({
      id:'obj-badge-1',at:Date.now(),map:'7-2',node:'G2',result:'S',
      boss:true,battles:4,objectiveTarget:'G2'
    });
    window.hdWSShowElement?.('sortieLog', false);
  });
  const row = page.locator('#sortieLog .hd-sl-row').first();
  await expect(row).toBeVisible();
  await expect(row.locator('.hd-sl-badge.objective')).toContainText('目標 G2');
  expect(errors).toEqual([]);
});

test('release smoke: sortie analytics separates multi-target objectives', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','map');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','7-2');
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'g1-1',at:Date.now(),map:'7-2',node:'G1',result:'S',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'g1-2',at:Date.now()-1000,map:'7-2',node:'G1',result:'A',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'g2-1',at:Date.now()-2000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'g2-2',at:Date.now()-3000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'old-1',at:Date.now()-4000,map:'7-2',node:'G1',result:'撤退',boss:false,retreat:true,battles:1}
    ]));
    window.hdSLRender();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.waitForTimeout(150);
  const cards = page.locator('#sortieLog .hd-spa-card');
  await expect(cards).toHaveCount(3);

  const g1 = cards.filter({hasText:'目標 G1'});
  const g2 = cards.filter({hasText:'目標 G2'});
  const old = cards.filter({hasText:'目標 未記録'});
  await expect(g1).toHaveCount(1);
  await expect(g2).toHaveCount(1);
  await expect(old).toHaveCount(1);
  await expect(g1).toContainText('目標到達 100%');
  await expect(g2).toContainText('目標到達 100%');
  await expect(old).toContainText('ボス到達 0%');
  await expect(old).toContainText('撤退 100%');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-analytics-mode-v1','strategy');
    localStorage.setItem('harbordesk-sortie-analytics-map-v1','all');
    window.hdSLRender();
  });
  await page.waitForTimeout(150);
  const strategyCards = page.locator('#sortieLog .hd-spa-card');
  await expect(strategyCards).toHaveCount(1);
  await expect(strategyCards.first()).not.toContainText('目標 G1');
  await expect(strategyCards.first()).not.toContainText('目標 G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie log filters by selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() => typeof window.hdSLRender === 'function');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-sortie-log-v1', JSON.stringify([
      {id:'obj-filter-g1',at:Date.now(),map:'7-2',node:'G1',result:'S',boss:false,battles:2,objectiveTarget:'G1'},
      {id:'obj-filter-g2',at:Date.now()-1000,map:'7-2',node:'G2',result:'S',boss:true,battles:4,objectiveTarget:'G2'},
      {id:'obj-filter-other',at:Date.now()-2000,map:'2-4',node:'O',result:'S',boss:true,battles:4}
    ]));
    window.hdSLRender();
    window.hdWSShowElement?.('sortieLog', false);
  });

  await page.locator('#sortieLog [data-hd-sl-filter="all"]').click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(3);

  const g1Filter=page.locator('#sortieLog [data-hd-sl-filter="objective:7-2:G1"]');
  const g2Filter=page.locator('#sortieLog [data-hd-sl-filter="objective:7-2:G2"]');
  await expect(g1Filter).toBeVisible();
  await expect(g2Filter).toBeVisible();

  await g1Filter.click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(1);
  await expect(page.locator('#sortieLog .hd-sl-row')).toContainText('目標 G1');

  await g2Filter.click();
  await expect(page.locator('#sortieLog .hd-sl-row')).toHaveCount(1);
  await expect(page.locator('#sortieLog .hd-sl-row')).toContainText('目標 G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie remembers selected objective per map', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMSetObjectiveTarget === 'function' &&
    typeof window.hdSSObjectivePref === 'function' &&
    typeof window.hdSSApplyObjectivePref === 'function'
  );

  const selected = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-memory-session',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-memory-fleet',
      fleetName:'攻略目標記憶テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-memory-fleet',name:'攻略目標記憶テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{routeNodes:[],result:'S',memo:''}
    }));
    window.hdSMSetObjectiveTarget('G2');
    const restored=window.hdSSApplyObjectivePref({map:'7-2',shipCount:1,status:'active'},'7-2');
    return {
      pref:window.hdSSObjectivePref('7-2'),
      draft:JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft,
      restored
    };
  });
  expect(selected.pref).toBe('G2');
  expect(selected.draft.objectiveTarget).toBe('G2');
  expect(selected.restored.draft.objectiveTarget).toBe('G2');

  const cleared = await page.evaluate(() => {
    window.hdSMSetObjectiveTarget('');
    const restored=window.hdSSApplyObjectivePref({map:'7-2',shipCount:1,status:'active'},'7-2');
    return {
      pref:window.hdSSObjectivePref('7-2'),
      draft:JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft,
      restored
    };
  });
  expect(cleared.pref).toBe('');
  expect(cleared.draft.objectiveTarget).toBe('');
  expect(cleared.restored.draft).toBeUndefined();
  expect(errors).toEqual([]);
});



test('release smoke: pre-start objective selector persists map preference', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectivePrestartHtml === 'function' &&
    typeof window.hdSMObjectivePreference === 'function'
  );

  await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');
    const host=document.createElement('div');
    host.id='hdPreObjectiveTest';
    host.innerHTML=window.hdSMObjectivePrestartHtml('7-2');
    document.body.appendChild(host);
  });

  const host=page.locator('#hdPreObjectiveTest');
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toHaveClass(/active/);
  await expect(host.locator('[data-hd-sm-pre-objective="G1"]')).toBeVisible();
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toBeVisible();

  await host.locator('[data-hd-sm-pre-objective="G2"]').click();
  let pref=await page.evaluate(() => window.hdSMObjectivePreference('7-2'));
  expect(pref).toBe('G2');

  await page.evaluate(() => {
    document.getElementById('hdPreObjectiveTest').innerHTML=window.hdSMObjectivePrestartHtml('7-2');
  });
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toHaveClass(/active/);

  await host.locator('[data-hd-sm-pre-objective=""]').click();
  pref=await page.evaluate(() => window.hdSMObjectivePreference('7-2'));
  expect(pref).toBe('');

  await page.evaluate(() => {
    document.getElementById('hdPreObjectiveTest').innerHTML=window.hdSMObjectivePrestartHtml('7-2');
  });
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test('release smoke: pre-start route preview follows selected objective', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMPrestartRoutePreviewHtml === 'function' &&
    typeof window.hdSMSaveObjectivePreference === 'function'
  );

  const result = await page.evaluate(() => {
    localStorage.removeItem('harbordesk-sortie-objective-pref-v1');

    window.hdSMSaveObjectivePreference('7-2','G2');
    const g2 = window.hdSMPrestartRoutePreviewHtml('7-2');

    window.hdSMSaveObjectivePreference('7-2','G1');
    const g1 = window.hdSMPrestartRoutePreviewHtml('7-2');

    window.hdSMSaveObjectivePreference('7-2','');
    const auto = window.hdSMPrestartRoutePreviewHtml('7-2');

    return {g2,g1,auto};
  });

  expect(result.g2).toContain('G2ボス');
  expect(result.g2).toContain('<b>A</b>');
  expect(result.g2).toContain('<b>D</b>');
  expect(result.g2).toMatch(/A[\s\S]*逸れ候補/);
  expect(result.g2).toMatch(/D[\s\S]*接続/);

  expect(result.g1).toContain('G1到達地点');
  expect(result.g1).toMatch(/A[\s\S]*接続/);
  expect(result.g1).toMatch(/D[\s\S]*逸れ候補/);

  expect(result.auto).toContain('自動（攻略目標）');
  expect(errors).toEqual([]);
});


test('release smoke: pre-start objective selector shows route stats', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectivePrestartHtml === 'function' &&
    typeof window.hdSMObjectiveStartStats === 'function'
  );

  const stats = await page.evaluate(() => ({
    auto: window.hdSMObjectiveStartStats('7-2',''),
    g1: window.hdSMObjectiveStartStats('7-2','G1'),
    g2: window.hdSMObjectiveStartStats('7-2','G2')
  }));
  expect(stats.auto).toEqual({steps:4,battles:3});
  expect(stats.g1).toEqual({steps:4,battles:3});
  expect(stats.g2).toEqual({steps:5,battles:5});

  await page.evaluate(() => {
    const host=document.createElement('div');
    host.id='hdPreObjectiveStatsTest';
    host.innerHTML=window.hdSMObjectivePrestartHtml('7-2');
    document.body.appendChild(host);
  });

  const host=page.locator('#hdPreObjectiveStatsTest');
  await expect(host.locator('[data-hd-sm-pre-objective=""]')).toContainText('最短4マス・最少3戦');
  await expect(host.locator('[data-hd-sm-pre-objective="G1"]')).toContainText('最短4マス・最少3戦');
  await expect(host.locator('[data-hd-sm-pre-objective="G2"]')).toContainText('最短5マス・最少5戦');
  expect(errors).toEqual([]);
});


test('release smoke: pre-start route preview shows shortest structural path', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMObjectiveShortestPath === 'function' &&
    typeof window.hdSMPrestartRoutePreviewHtml === 'function'
  );

  const paths = await page.evaluate(() => ({
    auto: window.hdSMObjectiveShortestPath('7-2',''),
    g1: window.hdSMObjectiveShortestPath('7-2','G1'),
    g2: window.hdSMObjectiveShortestPath('7-2','G2')
  }));
  expect(paths.auto).toEqual(['A','B','C','G1']);
  expect(paths.g1).toEqual(['A','B','C','G1']);
  expect(paths.g2).toEqual(['D','E','F','I','G2']);

  const html = await page.evaluate(() => {
    window.hdSMSaveObjectivePreference('7-2','G2');
    return window.hdSMPrestartRoutePreviewHtml('7-2');
  });
  expect(html).toContain('構造図最短');
  expect(html).toContain('D → E → F → I → G2');
  expect(errors).toEqual([]);
});


test('release smoke: sortie warns when selected objective is unreachable from current node', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMObjectiveRouteState === 'function' &&
    typeof window.hdSMSetObjectiveTarget === 'function'
  );

  const state = await page.evaluate(() => window.hdSMObjectiveRouteState('7-2',{
    node:'C',routeNodes:['A','B','C'],objectiveTarget:'G2'
  }));
  expect(state.active).toBe(true);
  expect(state.target).toBe('G2');
  expect(state.alternatives.map(x=>x.label)).toContain('G1');

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-objective-route-alert',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-objective-route-alert-fleet',
      fleetName:'目標ルート警告テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-objective-route-alert-fleet',name:'目標ルート警告テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',objectiveTarget:'G2',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const warning = page.locator('.hd-sm-objective-warning');
  await expect(warning).toBeVisible();
  await expect(warning).toContainText('CからG2ボスへ構造図上接続なし');
  await expect(page.locator('.hd-sm-hud-objective-alert')).toContainText('G2ボスへ接続なし');
  await expect(warning.locator('[data-hd-sm-objective="G1"]')).toContainText('G1 到達地点へ切替');

  await warning.locator('[data-hd-sm-objective="G1"]').click();
  await expect(page.locator('.hd-sm-objective-warning')).toHaveCount(0);
  await expect(page.locator('.hd-sm-hud-objective-alert')).toHaveCount(0);
  await expect(page.locator('.hd-sm-objective-picker [data-hd-sm-objective="G1"]')).toHaveClass(/active/);

  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.objectiveTarget).toBe('G1');
  expect(draft.node).toBe('C');
  expect(draft.routeNodes).toEqual(['A','B','C']);
  expect(draft.advanceGuard.node).toBe('C');
  expect(draft.advanceGuard.safe).toBe(true);
  expect(errors).toEqual([]);
});

test('release smoke: route alert can mark route-deviation retreat', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMQuickRetreatReason === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-route-alert-retreat',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-route-alert-retreat-fleet',
      fleetName:'ルート逸れ撤退テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-route-alert-retreat-fleet',name:'ルート逸れ撤退テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'C',routeNodes:['A','B','C'],result:'S',memo:'',objectiveTarget:'G2',advanceGuard:{node:'C',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const warning = page.locator('.hd-sm-objective-warning');
  await expect(warning).toBeVisible();
  await warning.locator('[data-hd-sm-retreat-reason="ルート逸れ"]').click();

  await expect(page.locator('#hdSMResult')).toHaveValue('撤退');
  await expect(page.locator('#hdSMRetreatReason')).toHaveValue('ルート逸れ');
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('harbordesk-active-sortie-session-v1')).draft);
  expect(draft.result).toBe('撤退');
  expect(draft.retreatReason).toBe('ルート逸れ');
  expect(draft.objectiveTarget).toBe('G2');
  expect(draft.node).toBe('C');
  expect(errors).toEqual([]);
});


test('release smoke: sticky sortie HUD shows remaining structural path', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMObjectiveRemainingPath === 'function'
  );

  const paths = await page.evaluate(() => ({
    dToBoss: window.hdSMObjectiveRemainingPath('2-4','D','O'),
    cToG1: window.hdSMObjectiveRemainingPath('7-2','C','G1'),
    cToG2: window.hdSMObjectiveRemainingPath('7-2','C','G2')
  }));
  expect(paths.dToBoss[0]).toBe('D');
  expect(paths.dToBoss.at(-1)).toBe('O');
  expect(paths.dToBoss.length).toBeGreaterThan(1);
  expect(paths.cToG1).toEqual(['C','G1']);
  expect(paths.cToG2).toEqual([]);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-hud-remaining-path',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-hud-remaining-path-fleet',
      fleetName:'残りルートHUDテスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-hud-remaining-path-fleet',name:'残りルートHUDテスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'D',routeNodes:['A','D'],result:'S',memo:'',objectiveTarget:'O',advanceGuard:{node:'D',safe:true,at:Date.now()}}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const path = page.locator('.hd-sm-hud-path');
  await expect(path).toBeVisible();
  await expect(path).toContainText('構造図最短');
  await expect(path).toContainText('D');
  await expect(path).toContainText('O');
  expect(errors).toEqual([]);
});


test('release smoke: sortie highlights shortest structural next node', async ({ page }) => {
  const errors = [];
  await boot(page, errors);
  await page.waitForFunction(() =>
    typeof window.hdSMRender === 'function' &&
    typeof window.hdSMObjectiveShortestPath === 'function' &&
    typeof window.hdSMObjectiveRemainingPath === 'function'
  );

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-shortest-next-start',
      map:'7-2',
      startedAt:Date.now()-60000,
      fleetId:'sm-shortest-next-fleet',
      fleetName:'最短候補テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-shortest-next-fleet',name:'最短候補テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{routeNodes:[],result:'S',memo:'',objectiveTarget:'G2'}
    }));
    window.hdSMEnsure();
    window.hdSMRender();
    window.hdSMOpen();
  });

  const a = page.locator('[data-hd-sm-next-node="A"]');
  const d = page.locator('[data-hd-sm-next-node="D"]');
  await expect(d).toHaveClass(/shortest/);
  await expect(d).toContainText('最短経路');
  await expect(a).not.toHaveClass(/shortest/);

  await page.evaluate(() => {
    localStorage.setItem('harbordesk-active-sortie-session-v1', JSON.stringify({
      id:'sm-shortest-next-hud',
      map:'2-4',
      startedAt:Date.now()-60000,
      fleetId:'sm-shortest-next-hud-fleet',
      fleetName:'HUD最短候補テスト艦隊',
      strategy:'manual',
      strategyLabel:'手動編成',
      fleetSnapshot:{id:'sm-shortest-next-hud-fleet',name:'HUD最短候補テスト艦隊',ships:[{ship:'雪風',gear:'主砲'}]},
      readinessSnapshot:{autoOk:1,autoTotal:1,manualDone:1,manualTotal:1,unresolved:[]},
      shipCount:1,
      status:'active',
      draft:{node:'D',routeNodes:['A','D'],result:'S',memo:'',objectiveTarget:'O',advanceGuard:{node:'D',safe:true,at:Date.now()}}
    }));
    window.hdSMRender();
    window.hdSMOpen();
  });

  const hudNext = page.locator('.hd-sm-hud [data-hd-sm-hud-node="H"]');
  await expect(hudNext).toHaveClass(/shortest/);
  await expect(hudNext).toContainText('最短');
  expect(errors).toEqual([]);
});
