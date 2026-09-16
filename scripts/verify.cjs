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
const PAGES = ['', 'register/', 'events/', 'past-events/', 'mailing-list/', 'code-of-conduct/'];
const WIDTHS = [320, 390, 768, 1440];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
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
