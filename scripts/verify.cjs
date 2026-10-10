/*
 * verify.cjs — check every page in a real browser before publishing.
 *
 * RUN IT
 *   1. Serve the site:  python3 -m http.server 8876 --bind 127.0.0.1
 *   2. node scripts/verify.cjs http://127.0.0.1:8876/
 *
 * REQUIREMENTS
 *   Playwright and Chrome. If `require('playwright')` fails, Playwright isn't
 *   installed here — say so rather than claiming the checks passed, and check the
 *   pages by hand at the widths below.
 *
 * WHAT IT CHECKS
 *   Every page at four widths: no sideways scrolling, no failed images, no broken
 *   in-page links, no duplicate ids, fonts actually loaded, scroll-reveal content
 *   visible, and the floating event reminder never covering the footer credits.
 *   Then, on the homepage only: the ten monogram modes, keyboard selection,
 *   reduced motion, offscreen suspension, and that content still shows with
 *   JavaScript switched off.
 *   Once registration is configured with a Luma event id, also the registration
 *   dialog: it opens, loads Luma, closes on Escape, and returns focus.
 *
 * WHEN YOU ADD A PAGE
 *   Add its path to PAGES below.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:8876/';

/* Paths are relative to `base`. '' is the homepage. */
const PAGES = ['', 'register/', 'events/', 'events/visible-java/', 'history/', 'mailing-list/', 'code-of-conduct/', 'poster-maker/'];
const WIDTHS = [320, 390, 768, 1440];

/*
 * Wait for every image to finish, however it finishes. The posters are `loading="lazy"`, so
 * scrolling past a section only starts them; at some widths they are still in flight when the
 * checks run and look broken. Switching them to eager makes the browser commit to loading them
 * now, and then we wait for each one's load or error. Either outcome settles the image: a real
 * 404 or a real zero-width image still ends up `naturalWidth === 0` and still fails below. The
 * per-image cap keeps a hung request from stalling the whole run.
 */
const settleImages = page => page.evaluate(cap => Promise.all(
  [...document.images].filter(image => !image.complete).map(image => new Promise(done => {
    image.loading = 'eager';
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
    setTimeout(done, cap);
  })),
), 5000);

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: 'chrome' }) });
  const errors = [];
  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

      for (const path of PAGES) {
        await page.goto(new URL(path, base).href);
        await page.evaluate(() => document.fonts.ready);

        // Visit each section so scroll reveals fire before we check or screenshot.
        for (const section of await page.locator('main > section').all()) {
          await section.scrollIntoViewIfNeeded();
        }
        await page.waitForTimeout(900);
        await settleImages(page);

        const state = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
          brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
          duplicateIds: [...document.querySelectorAll('[id]')].map(e => e.id).filter((id, i, ids) => ids.indexOf(id) !== i),
          hiddenCopy: [...document.querySelectorAll('.anim-scroll, .anim-chip')].filter(e => getComputedStyle(e).opacity === '0').length,
          font: document.fonts.check('400 16px Anybody'),
        }));
        assert.deepEqual(state, { overflow: false, brokenImages: [], brokenAnchors: [], duplicateIds: [], hiddenCopy: 0, font: true }, `${width}px ${path}`);

        // At the very bottom, the floating reminder (when registration is open) must not sit on the credits.
        const covered = await page.evaluate(() => {
          scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });  // the site scrolls smoothly otherwise
          const banner = document.querySelector('.event-banner');
          if (!banner || banner.hidden) return false;
          const a = banner.getBoundingClientRect(), b = document.querySelector('.design-credits').getBoundingClientRect();
          return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        });
        assert.equal(covered, false, `${width}px ${path}: event reminder covers the credits`);

        await page.evaluate(() => scrollTo(0, 0));
        if (width === 390 || width === 1440) {
          await page.screenshot({ path: `/tmp/ccfest-${path ? path.replace(/\/$/, '') : 'home'}-${width}.png`, fullPage: true });
        }
      }
      console.log(`PASS pages, fonts, images, anchors, reveal visibility, overflow, event reminder clear of credits at ${width}px`);
      await page.close();
    }

    /* Homepage interactive: Shristi's monogram modes and the motion controls. */
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);

    // Every mode tab selects exactly one mode and drives the monogram.
    for (const button of await page.locator('.mode-btn').all()) {
      await button.click();
      assert.equal(await page.locator('.mode-btn[role="tab"][aria-selected="true"]').count(), 1);
      assert.equal(await page.locator('#monogramWrap').getAttribute('data-mode'), await button.getAttribute('data-mode'));
    }

    // "Creativity" fetches its scribble artwork, and the p5 canvas has mounted.
    assert.equal(await page.locator('#scribbleLeftPath, #scribbleRightPath').count(), 2, 'scribble paths should load');
    assert.equal(await page.locator('.anim-stage.canvas-ready').count(), 1, 'p5 canvas should mount');

    // There is no pause button any more (decided with Shristi, 2026-09-16).
    assert.equal(await page.locator('.motion-toggle').count(), 0);

    // Arrow keys move selection along the button group.
    await page.locator('.mode-btn').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#monogramWrap').getAttribute('data-mode'), 'change');

    // The p5 canvas ("Change" mode) runs only when it should.
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => isLooping()), true);

    // The system "reduce motion" setting stills the canvas, hides confetti and stops the scribble wobble.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => isLooping()), false, 'reduced motion should stop the canvas');
    assert.equal(await page.evaluate(() => document.querySelector('.cc-mono').animationsPaused()), true);
    await page.locator('.mode-btn[data-mode="celebration"]').click();
    assert.equal(await page.locator('#confettiLayer').isVisible(), false, 'reduced motion should hide confetti');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.querySelector('.cc-mono').animationsPaused()), false);
    assert.equal(await page.locator('#confettiLayer').isVisible(), true);

    // Scrolling the canvas out of view suspends it.
    await page.locator('.mode-btn[data-mode="change"]').click();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => isLooping()), false, 'offscreen canvas should suspend');
    console.log('PASS ten mode selections, keyboard selection, scribble and canvas load, reduced motion, offscreen suspension');

    /* Floating event reminder: Hide lasts for the visit, and it steps aside for the registration section. */
    if (await page.locator('.event-banner').count()) {
      await page.locator('.event-banner-close').click();
      assert.equal(await page.locator('.event-banner').isVisible(), false, 'Hide should hide the reminder');
      await page.goto(new URL('events/', base).href);
      assert.equal(await page.locator('.event-banner').isVisible(), false, 'Hide should last for the visit');
      const fresh = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await fresh.goto(new URL('register/', base).href);
      assert.equal(await fresh.locator('.event-banner').isVisible(), true);
      await fresh.locator('#registration').scrollIntoViewIfNeeded();
      await fresh.waitForTimeout(200);
      assert.equal(await fresh.locator('.event-banner').isVisible(), false, 'reminder should step aside on the registration section');
      await fresh.close();
      console.log('PASS event reminder hides for the visit and steps aside for the registration section');
    } else {
      console.log('SKIP event reminder: no registration link in _data/event.yml');
    }

    /* Schedule time zone helper on the event page. */
    const sched = await browser.newPage({ viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Tokyo' });
    await sched.goto(new URL('register/', base).href);
    if (await sched.locator('#schedule').count()) {
      const firstLocal = sched.locator('#schedule .schedule-block').first().locator('.schedule-local');
      assert.equal(await sched.locator('#schedule-zone-select').inputValue(), 'Asia/Tokyo', 'defaults to the visitor time zone');
      assert.match((await firstLocal.textContent()).trim(), /^Sun, Oct 18, 1:00–1:30 am/, '9:00 am PDT is 1:00 am next day in Tokyo');
      await sched.locator('#schedule-zone-select').selectOption('America/Los_Angeles');
      assert.match((await firstLocal.textContent()).trim(), /^9:00–9:30 am/, 'Los Angeles matches the Pacific time');
      console.log('PASS schedule shows each visitor their own time, and the picker switches zones');
    } else {
      console.log('SKIP schedule: _data/schedule.yml has no items');
    }
    /* Schedule explorer: first/second choice and maybes per round, My choices, calendar file, blocked storage. */
    if (await sched.locator('#schedule').count()) {
      await sched.waitForSelector('.schedule[data-ready]');
      const shown = () => sched.locator('.session-card[data-format="Workshop"]:not([hidden])').count();
      const total = await shown();
      assert.ok(total >= 15, 'workshops are listed');
      const ids = await sched.$$eval('.session-card[data-id]', cards => cards.map(c => c.dataset.id));
      assert.equal(new Set(ids).size, ids.length, 'session ids are unique');
      const pendingCards = await sched.$$eval('.session-card[data-format="Workshop"]', cards => cards.filter(c => !c.dataset.block.trim()).map(c => ({ id: c.dataset.id, pending: Boolean(c.closest('.schedule-pending')), controls: c.querySelectorAll('.session-pref button').length })));
      assert.equal(await sched.locator('.schedule-pending').count(), pendingCards.length ? 1 : 0, 'pending section exists exactly when needed');
      assert.ok(pendingCards.every(c => c.pending && !c.controls), 'unassigned workshops stay visible without preference controls');
      const pref = (id, value) => sched.locator(`.session-card[data-id="${id}"] .session-pref button[data-pref="${value}"]`);
      const pressed = async (id, value) => (await pref(id, value).getAttribute('aria-pressed')) === 'true';
      await pref('naoto-hieda', 'first').click();
      await pref('kemi-ukadike', 'first').click();
      assert.ok(await pressed('kemi-ukadike', 'first'), 'a new first choice takes the round');
      assert.ok(await pressed('naoto-hieda', 'maybe'), 'the earlier first choice becomes a maybe');
      await pref('blair-subbaraman', 'second').click();
      await pref('tristan-bunn', 'second').click();
      assert.ok(await pressed('tristan-bunn', 'second') && await pressed('blair-subbaraman', 'maybe'), 'one second choice per round');
      await pref('emily-thomforde', 'maybe').click();
      assert.ok(await pressed('emily-thomforde', 'maybe') && await pressed('naoto-hieda', 'maybe'), 'any number of maybes in a round');
      await pref('emily-thomforde', 'maybe').click();
      assert.ok(!(await pressed('emily-thomforde', 'maybe')), 'clicking again clears it');
      await pref('caleb-foss', 'first').click();
      await sched.reload();
      await sched.waitForSelector('.schedule[data-ready]');
      assert.ok(await pressed('kemi-ukadike', 'first') && await pressed('tristan-bunn', 'second'), 'preferences survive a reload');
      await sched.click('.schedule-mine-toggle');
      assert.equal(await shown(), 5, 'My choices shows only the workshops with a preference');
      const [download] = await Promise.all([sched.waitForEvent('download'), sched.click('.schedule-ics')]);
      const ics = require('fs').readFileSync(await download.path(), 'utf8').replace(/\r\n /g, '');
      assert.match(ics, /DTSTART:20261017T160000Z/, 'opening keynote at 9:00 PDT in UTC');
      assert.match(ics, /UID:kemi-ukadike@ccfest.rocks/);
      assert.match(ics, /UID:caleb-foss@ccfest.rocks/);
      assert.ok(!/UID:naoto-hieda|UID:tristan-bunn|UID:blair-subbaraman/.test(ics), 'second choices and maybes are not exported');
      assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 5, 'opening, two first choices, panel, closing');
      const [pngDl] = await Promise.all([sched.waitForEvent('download'), sched.click('.schedule-png')]);
      const pngBytes = require('fs').readFileSync(await pngDl.path());
      assert.equal(pngBytes.subarray(1, 4).toString(), 'PNG', 'the PNG download is a PNG');
      assert.equal(pngBytes.readUInt32BE(16), 1224, 'PNG is a Letter page at 2x');
      const [pdfDl] = await Promise.all([sched.waitForEvent('download'), sched.click('.schedule-pdf')]);
      const pdf = require('fs').readFileSync(await pdfDl.path(), 'latin1');
      assert.ok(pdf.startsWith('%PDF-1.4') && pdf.trimEnd().endsWith('%%EOF'), 'the PDF download is a PDF');
      assert.match(pdf, /First choice: Access Is the Interface/, 'PDF lists the first choice as text');
      assert.match(pdf, /Second choice: The Nature of Code, but Python/, 'PDF lists the second choice');
      assert.match(pdf, /Welcome \+ Opening Keynote/, 'PDF keeps the keynotes');
      console.log('PASS schedule explorer: first and second choice and maybes per round, My choices, .ics');
      const blocked = await browser.newPage({ viewport: { width: 390, height: 800 } });
      await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
      await blocked.goto(new URL('register/', base).href);
      await blocked.waitForSelector('.schedule[data-ready]');
      await blocked.locator('.session-card[data-id="sandra-soto"] .session-pref button[data-pref="first"]').click();
      assert.equal(await blocked.locator('.session-card[data-id="sandra-soto"] .session-pref button[data-pref="first"]').getAttribute('aria-pressed'), 'true', 'choosing works when storage is blocked');
      const [accentDl] = await Promise.all([blocked.waitForEvent('download'), blocked.click('.schedule-pdf')]);
      assert.match(require('fs').readFileSync(await accentDl.path(), 'latin1'), /La tecnolog\xeda como lenguaje creativo/, 'PDF keeps accents Helvetica has (WinAnsi)');
      for (const width of [320, 390, 768, 1440]) {
        await blocked.setViewportSize({ width, height: 800 });
        assert.ok(!(await blocked.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `no horizontal scroll at ${width}px`);
      }
      await blocked.close();
      console.log('PASS schedule works with storage blocked, and without horizontal scroll at 320/390/768/1440');
    }
    await sched.close();

    /* Registration dialog. It only exists once _data/event.yml has registration_url and luma_event_id. */
    const register = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await register.goto(new URL('register/', base).href);
    const lumaLink = register.locator('[data-luma-event]');
    if (await lumaLink.count()) {
      const dialog = register.locator('#registration-dialog');
      await lumaLink.click();
      assert.equal(await dialog.evaluate(d => d.open), true, 'Register should open the dialog');
      assert.match(await dialog.locator('iframe').getAttribute('src'), /^https:\/\/luma\.com\/embed\/event\/evt-/);
      await register.keyboard.press('Escape');
      assert.equal(await dialog.evaluate(d => d.open), false, 'Escape should close the dialog');
      assert.equal(await register.evaluate(() => document.activeElement.hasAttribute('data-luma-event')), true, 'focus should return to Register');
      console.log('PASS registration dialog opens, loads Luma, closes on Escape, returns focus');
    } else {
      console.log('SKIP registration dialog: no Luma event id in _data/event.yml yet');
    }
    await register.close();

    /* Without JavaScript the controls hide, but the content still shows. */
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(base);
    assert.equal(await noJS.locator('.modes-list').isVisible(), false);
    assert.equal(await noJS.locator('.upcoming-copy').evaluate(e => getComputedStyle(e).opacity), '1');
    await noJS.goto(new URL('register/', base).href);
    if (await noJS.locator('#schedule').count()) {
      assert.equal(await noJS.locator('.schedule-zone').isVisible(), false, 'no picker without JavaScript');
      assert.match(await noJS.locator('#schedule .schedule-times').first().textContent(), /9:00/, 'Pacific times still show');
      assert.equal(await noJS.locator('#schedule .schedule-tools').isVisible(), false, 'no tools row without JavaScript');
      assert.ok((await noJS.locator('#schedule .session-card:visible').count()) >= 10, 'every session is readable without JavaScript');
    }
    if (await noJS.locator('[data-luma-event]').count()) {
      assert.match(await noJS.locator('[data-luma-event]').getAttribute('href'), /^https:/, 'Register should still link to Luma');
    }
    console.log('PASS no-JavaScript content fallback');

    assert.deepEqual(errors, []);
    console.log('PASS no browser errors or failing HTTP responses');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
