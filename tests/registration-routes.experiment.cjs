// Original A/B/C experiment; default routes and assertions remain unchanged.
const { test } = require('@playwright/test');
const { runRegistrationRoute } = require('./registration-route-runner.cjs');
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
for (const route of ['A','B','C']) test('registration route '+route, ({ page, browser }, info) => runRegistrationRoute({ page, browser }, info, route));
