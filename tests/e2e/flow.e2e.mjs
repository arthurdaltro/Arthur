// E2E: drives /start in Chromium, asserts each lane, saves screenshots to docs/screenshots/.
// Usage: npm start (other terminal) && npm run e2e
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = new URL('../../docs/screenshots/', import.meta.url).pathname;
const browser = await chromium.launch();

async function page(viewport = { width: 1280, height: 900 }, locale = 'en-US') {
  const ctx = await browser.newContext({ viewport, locale, timezoneId: 'America/Los_Angeles', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { throw e; });
  await p.goto(BASE);
  await p.waitForSelector('[data-service]', { state: 'attached' });
  return p;
}
const shot = (p, name) => p.screenshot({ path: `${OUT}${name}.png`, fullPage: true });

async function toContact(p, { service, language, format = 'virtual', age = 'adult' }) {
  await p.click('#safe-no');
  await p.click('[data-step=who] button[data-go=service]');
  await p.click(`[data-service=${service}]`);
  await p.click('#service-next');
  await p.check(`input[name=format][value=${format}]`, { force: true });
  await p.selectOption('#language', language);
  await p.check(`input[name=age_group][value=${age}]`, { force: true });
  await p.click('[data-step=fit] button[data-go=contact]');
}
async function fillContact(p) {
  await p.fill('#first_name', 'Ana');
  await p.fill('#last_name', 'Test');
  await p.fill('#email', 'ana@example.com');
  await p.check('#terms');
}

// 1. Safety gate + crisis
let p = await page();
await shot(p, '01-safety');
await p.click('#safe-yes');
assert.ok(await p.isVisible('[data-step=crisis]'));
await shot(p, '02-crisis');

// 2. Service selection
p = await page();
await p.click('#safe-no');
await p.click('[data-step=who] button[data-go=service]');
await p.click('[data-service=sozo]');
await shot(p, '03-services');
await p.click('#service-next');
await shot(p, '04-fit');

// 3. Validation errors
p = await page();
await toContact(p, { service: 'sozo', language: 'en' });
await p.fill('#email', 'nope');
await p.click('#submit');
await p.waitForSelector('#form-alert:not([hidden])');
assert.ok(await p.isVisible('[data-field="contact.email"].invalid'));
await shot(p, '05-errors');

// 4. Fast track
p = await page();
await toContact(p, { service: 'sozo', language: 'en' });
await fillContact(p);
await p.click('#submit');
await p.waitForSelector('[data-step=result]:not([hidden])');
assert.ok(await p.isVisible('#r-cta'));
await shot(p, '06-result-fast-track');

// 5. Manual match (EMDR)
p = await page();
await toContact(p, { service: 'emdr', language: 'en' });
await fillContact(p);
await p.click('#submit');
await p.waitForSelector('[data-step=result]:not([hidden])');
assert.equal(await p.isVisible('#r-cta'), false);
assert.ok(await p.isVisible('#r-why'));
await shot(p, '07-result-manual');

// 6. Spanish, mobile
p = await page({ width: 390, height: 844 }, 'es-MX');
assert.equal(await p.getAttribute('html', 'lang'), 'es');
await p.click('#safe-no');
await p.click('[data-step=who] button[data-go=service]');
await shot(p, '08-mobile-es-services');

// 7. Dashboard + report
p = await page();
await p.goto(`${BASE}/dashboard.html`);
await p.waitForSelector('#rows tr td');
assert.ok((await p.locator('#rows tr').count()) >= 2);
await shot(p, '09-dashboard');
await p.goto(`${BASE}/report.html`);
await shot(p, '10-report');

await browser.close();
console.log('E2E GREEN: safety, crisis, errors, fast track, manual, ES mobile, dashboard, report');
