// Content-generic checks used by deployment. The full verify.cjs remains the
// current-event interaction/motion regression suite; this has no fixed date/IDs/counts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8876/';
const paths = ['', 'register/', 'events/', 'events/visible-java/', 'past-events/', 'mailing-list/', 'code-of-conduct/', 'poster-maker/'];
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
      }
      await page.close();
      console.log(`PASS publication pages at ${width}px`);
    }
    const page = await browser.newPage({ acceptDownloads: true });
    await page.goto(new URL('poster-maker/', base).href);
    const expected = await page.locator('#maker-data').evaluate(n => JSON.parse(n.dataset.sessions).filter(s => s.title && s.title.trim()));
    const event = await page.locator('#maker-data').evaluate(n => JSON.parse(n.dataset.event));
    await page.goto(new URL('register/', base).href);
    assert.equal(await page.locator('.session-card').count(), expected.length);
    const scheduled = expected.filter(s => s.format === 'Workshop' && s.schedule_id && s.schedule_id.trim());
    if (await page.locator('.schedule').count()) {
      await page.waitForSelector('.schedule[data-ready]');
      for (const session of scheduled) {
        assert.equal(await page.locator(`.session-card[data-id="${session.id}"] .session-pref button`).count(), 3);
      }
      const pending = expected.filter(s => s.format === 'Workshop' && !String(s.schedule_id || '').trim());
      for (const session of pending) assert.equal(await page.locator(`.session-card[data-id="${session.id}"] .session-pref button`).count(), 0);
      if (scheduled.length && event.date) {
        const session = scheduled[0];
        const pref = page.locator(`.session-card[data-id="${session.id}"] .session-pref button[data-pref="first"]`);
        await pref.click();
        await page.reload();
        await page.waitForSelector('.schedule[data-ready]');
        assert.equal(await pref.getAttribute('aria-pressed'), 'true');
        const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.schedule-ics').click()]);
        const calendar = fs.readFileSync(await download.path(), 'utf8').replace(/\r\n /g, '');
        assert.ok(calendar.includes(`UID:${session.id}@ccfest.rocks`));
        assert.ok(calendar.includes('BEGIN:VCALENDAR') && calendar.includes('DTSTART:'));
      }
    }
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(new URL('register/', base).href);
    assert.equal(await noJS.locator('.session-card:visible').count(), expected.length);
    assert.equal(await noJS.locator('.session-pref button:visible').count(), 0);
    await noJS.close();
    await page.close();
    assert.deepEqual(errors, []);
    console.log(`PASS publication: ${expected.length} sessions, saved choices/calendar where available, no-JavaScript content.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
