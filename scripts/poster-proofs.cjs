/* Design proofs for the poster maker, checked and written to disk.
 *
 * Opens /poster-maker/?proofs against a Jekyll build, which draws every design direction with the
 * real event content and one frame of a homepage animation, then:
 *   - asserts nothing failed to draw, no layout problem was reported, and every text/background
 *     pair a design uses has at least 4.5:1 contrast;
 *   - measures how much content each design takes (title length, name length) and asserts the
 *     limits stay well beyond what the event data holds;
 *   - writes one PNG per proof (the export size), a contact sheet, and a phone-size sheet.
 * With --all-modes it repeats the first two for all ten homepage animations (a couple of minutes).
 *
 *   NODE_PATH=$(npm root -g) node scripts/poster-proofs.cjs <base URL> [output folder] [--all-modes]
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const base = args[0] || 'http://127.0.0.1:8876/';
const out = path.resolve(args[1] || 'docs/poster-maker-v2/proofs');
const allModes = process.argv.includes('--all-modes');
const MODES = ['creativity', 'change', 'connection', 'celebration', 'collaboration', 'creative-commons', 'conversations', 'community', 'curiosity', 'coding'];

async function open(browser, mode, options = {}) {
  const page = await (await browser.newContext({ viewport: { width: 1800, height: 1200 }, ...options })).newPage();
  const problems = [];
  page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
  await page.goto(new URL(`poster-maker/?proofs&mode=${mode}`, base).href);
  await page.waitForFunction(() => ['ready', 'error'].includes(document.documentElement.dataset.proofs), null, { timeout: 120000 });
  assert.equal(await page.evaluate(() => document.documentElement.dataset.proofs), 'ready', `${mode}: ${await page.evaluate(() => document.getElementById('maker-status').textContent)}`);
  return { page, problems };
}

function check(mode, results) {
  assert.equal(results.length, 10, `${mode}: expected 6 directions and 4 variants`);
  for (const result of results) {
    assert.equal(result.error, '', `${mode}/${result.id}: ${result.error}`);
    assert.deepEqual(result.problems, [], `${mode}/${result.id}: ${result.problems.join(' ')}`);
    for (const { pair, ratio } of result.pairs) assert(ratio >= 4.5, `${mode}/${result.id}: ${pair} is ${ratio}:1`);
  }
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    fs.mkdirSync(out, { recursive: true });

    // The first mode is the one written to disk.
    const { page, problems } = await open(browser, 'creativity');
    const results = await page.evaluate(() => window.CCPosterProofs.results);
    check('creativity', results);
    const images = await page.$$eval('.proof canvas', canvases => canvases.map(canvas => canvas.toDataURL('image/png')));
    assert.equal(images.length, results.length);
    images.forEach((url, i) => fs.writeFileSync(path.join(out, `${String(i + 1).padStart(2, '0')}-${results[i].id}.png`), Buffer.from(url.split(',')[1], 'base64')));
    fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(results.map(({ stack, ...rest }) => rest), null, 2)}\n`);

    // Measured limits. The thresholds are far past the longest real title (68 characters) and name (22).
    const limits = await page.evaluate(() => window.CCPosterProofs.limits());
    fs.writeFileSync(path.join(out, 'limits.json'), `${JSON.stringify(limits, null, 2)}\n`);
    assert(limits.programTitle.max >= 120, `Program-led takes titles of ${limits.programTitle.max} characters`);
    assert(limits.programTitlePanel.max >= 120, `Program-led panel takes titles of ${limits.programTitlePanel.max} characters`);
    for (const key of ['programName', 'speakerNamePair', 'speakerNameSingle']) assert(limits[key].max >= 40, `${key} takes ${limits[key].max} characters`);
    assert(limits.noPhotosPair, 'Speaker-led must draw without photos');
    for (const [design, ok] of [...limits.supportingLine, ...limits.noTimesNoQr, ...limits.whiteBackground]) assert(ok, `${design} failed a limit check`);
    for (const [design, refuses] of limits.refusesOtherSizes) assert(refuses, `${design} must report that it has no layout for other sizes`);

    // Contact sheet: the page itself, captions included. Then the same posters at phone width.
    await page.locator('.proofs').screenshot({ path: path.join(out, 'contact-sheet.png') });
    assert.deepEqual(problems, []);
    await page.context().close();
    const phone = await open(browser, 'creativity', { viewport: { width: 1250, height: 1200 }, deviceScaleFactor: 2 });
    await phone.page.check('#proof-phone');
    await phone.page.locator('.proof-grid').first().screenshot({ path: path.join(out, 'phone-sheet.png') });
    assert.deepEqual(phone.problems, []);
    await phone.page.context().close();
    console.log(`PASS creativity: 6 directions and 4 variants draw without layout problems; contrast ≥ 4.5:1; limits ${limits.programTitle.max} title / ${Math.min(limits.programName.max, limits.speakerNamePair.max, limits.speakerNameSingle.max)} name characters; images in ${path.relative(process.cwd(), out)}`);

    if (allModes) {
      for (const mode of MODES.slice(1)) {
        const next = await open(browser, mode);
        check(mode, await next.page.evaluate(() => window.CCPosterProofs.results));
        assert.deepEqual(next.problems, [], mode);
        await next.page.context().close();
        console.log(`PASS ${mode}`);
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
