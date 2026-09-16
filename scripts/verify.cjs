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
 *   visible. Then, on the homepage only: the ten monogram modes, keyboard
 *   selection, the canvas pausing and resuming, reduced motion, offscreen
 *   suspension, and that content still shows with JavaScript switched off.
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

        await page.evaluate(() => scrollTo(0, 0));
        if (width === 390 || width === 1440) {
          await page.screenshot({ path: `/tmp/ccfest-${path ? path.replace(/\/$/, '') : 'home'}-${width}.png`, fullPage: true });
        }
      }
      console.log(`PASS pages, fonts, images, anchors, reveal visibility, overflow at ${width}px`);
      await page.close();
    }

    /* Homepage interactive: Shristi's monogram modes and the motion controls. */
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);

    // Every mode button selects exactly one mode and drives the monogram.
    for (const button of await page.locator('.mode-btn').all()) {
      await button.click();
      assert.equal(await page.locator('.mode-btn[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('#monogramWrap').getAttribute('data-mode'), await button.getAttribute('data-mode'));
    }

    // Arrow keys move selection along the button group.
    await page.locator('.mode-btn').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#monogramWrap').getAttribute('data-mode'), 'change');

    // The p5 canvas ("Change" mode) runs only when it should.
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => isLooping()), true);
    await page.locator('.motion-toggle').click();
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => isLooping()), false, 'pause button should stop the canvas');
    await page.locator('.motion-toggle').click();
    assert.equal(await page.evaluate(() => isLooping()), true, 'resume should restart the canvas');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => isLooping()), false, 'reduced motion should stop the canvas');
    assert.equal(await page.locator('.motion-toggle').getAttribute('aria-pressed'), 'true');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Scrolling the canvas out of view suspends it.
    await page.locator('.mode-btn[data-mode="change"]').click();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => isLooping()), false, 'offscreen canvas should suspend');
    console.log('PASS ten mode selections, keyboard selection, canvas pause/resume, reduced motion, offscreen suspension');

    /* Without JavaScript the controls hide, but the content still shows. */
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(base);
    assert.equal(await noJS.locator('.motion-toggle').isVisible(), false);
    assert.equal(await noJS.locator('.modes-list').isVisible(), false);
    assert.equal(await noJS.locator('.upcoming-copy').evaluate(e => getComputedStyle(e).opacity), '1');
    console.log('PASS no-JavaScript content fallback');

    assert.deepEqual(errors, []);
    console.log('PASS no browser errors or failing HTTP responses');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
