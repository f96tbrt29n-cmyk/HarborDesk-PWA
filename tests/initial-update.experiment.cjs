const { test } = require('@playwright/test');
const { runRegistrationRoute } = require('./registration-route-runner.cjs');
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
// One file, default (not serial) mode, one worker and fullyParallel:false in
// the isolated config: a failed control must not skip the comparison.
for (const policy of ['call','suppress']) test('B initial explicit update '+policy,
  ({ page, browser }, info) => runRegistrationRoute({ page, browser }, info, 'B', policy));
