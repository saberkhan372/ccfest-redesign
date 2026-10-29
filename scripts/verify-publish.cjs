// Content-generic checks used by deployment. The full verify.cjs remains the
// current-event interaction/motion regression suite; this has no fixed date/IDs/counts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8876/';
const paths = ['', 'register/', 'events/', 'events/visible-java/', 'events/office-hours/', 'history/', 'mailing-list/', 'code-of-conduct/', 'poster-maker/'].concat(require('../docs/recaps/import-manifest.json').routes.map(route => route.replace(/^\//, '')));
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const errors = [];
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      for (const route of paths) {
        const response = await page.goto(new URL(route, base).href);
        assert.equal(response.status(), 200, `${route}: HTTP status`);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map(img => {
            img.loading = 'eager';
            return img.complete ? undefined : new Promise(resolve => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 5000);
            });
          }));
        });
        const issues = await page.evaluate(() => {
          const issues = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('horizontal overflow');
          const ids = [...document.querySelectorAll('[id]')].map(n => n.id);
          if (ids.length !== new Set(ids).size) issues.push('duplicate element IDs');
          if (document.querySelectorAll('h1').length !== 1) issues.push('requires one H1');
          if (![...document.fonts].some(font => font.family.includes('Anybody') && font.status === 'loaded')) issues.push('display font not loaded');
          for (const img of document.images) if (!img.complete || !img.naturalWidth) issues.push(`image: ${img.src}`);
          for (const anchor of document.querySelectorAll('a[href^="#"]')) {
            const id = decodeURIComponent(anchor.getAttribute('href').slice(1));
            if (id && !document.getElementById(id)) issues.push(`anchor: ${id}`);
          }
          return issues;
        });
        assert.deepEqual(issues, [], `${route || '/'} at ${width}`);
        if ([390, 1440].includes(width) && ['events/', 'events/october-17-2026/', 'events/october-17-2026/program/', 'events/october-17-2026/missy-cooper/'].includes(route)) {
          await page.screenshot({path: `/tmp/ccfest-published-${route.replaceAll('/', '-')}${width}.png`, fullPage: false});
        }
      }
      await page.close();
      console.log(`PASS publication pages at ${width}px`);
    }
    const page = await browser.newPage({ acceptDownloads: true });
    const expected = require('../_data/recap_program.json').sessions;
    await page.goto(new URL('events/october-17-2026/program/', base).href);
    assert.equal(await page.locator('.session-card').count(), expected.length);
    assert.equal(await page.locator('.session-pref, .schedule-mine, [data-luma-event]').count(), 0, 'archive has no planning or checkout controls');
    assert.equal(await page.locator('a[href^="/events/october-17-2026/"]').count() >= 19, true);
    for (const [hash, target] of [['', ''], ['#registration', ''], ['#schedule', 'program/#schedule'], ['#sessions', '#sessions'], ['#keynotes', 'program/#keynotes']]) {
      await page.goto(new URL('register/' + hash, base).href);
      await page.waitForURL(new URL('events/october-17-2026/' + target, base).href);
    }
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(new URL('events/october-17-2026/program/', base).href);
    assert.equal(await noJS.locator('.session-card:visible').count(), expected.length);
    assert.equal(await noJS.locator('.session-pref button:visible').count(), 0);
    await noJS.close();
    await page.close();
    assert.deepEqual(errors, []);
    console.log(`PASS publication: ${expected.length} sessions, archived program and legacy redirects, no-JavaScript content.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
