/* Browser checks for the poster maker against a Jekyll build. No live form submissions.
 * NODE_PATH=$(npm root -g) node scripts/verify-poster.cjs <base URL>
 * Takes a few minutes: each homepage animation plays for a few seconds before its frame is kept.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8876/';
const MODES = ['creativity', 'change', 'connection', 'celebration', 'collaboration', 'creative-commons', 'conversations', 'community', 'curiosity', 'coding'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('poster-maker/', base).href);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('#maker-workspace').waitFor({ state: 'visible' });
    const settle = async () => {
      await page.waitForTimeout(250);
      await page.waitForFunction(() => /^(Ready|Change the settings)/.test(document.getElementById('maker-status').textContent), null, { timeout: 30000 });
    };
    const error = () => page.evaluate(() => (document.getElementById('maker-error').hidden ? '' : document.getElementById('maker-error').textContent));
    const set = async values => {
      await page.evaluate(values => {
        const form = document.getElementById('maker-controls');
        for (const [key, value] of Object.entries(values)) { const input = form.elements.namedItem(key); if (input.type === 'checkbox') input.checked = value; else input.value = String(value); }
        form.dispatchEvent(new Event('input'));
      }, values);
      await settle();
    };
    await settle();

    // Every homepage animation draws into a poster: something other than the background in the artwork band.
    for (const mode of MODES) {
      await set({ mode });
      assert.equal(await error(), '', mode);
      const inked = await page.evaluate(() => {
        const canvas = document.querySelector('#maker-canvas canvas');
        const ctx = canvas.getContext('2d');
        const y0 = Math.round(canvas.height * 0.35), rows = Math.round(canvas.height * 0.2);
        const data = ctx.getImageData(0, y0, canvas.width, rows).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) if (Math.abs(data[i] - 237) + Math.abs(data[i + 1] - 237) + Math.abs(data[i + 2] - 233) > 60) count++;
        return count / (data.length / 4);
      });
      assert(inked > 0.02, `${mode} artwork is missing (${inked})`);
    }

    // Every template and size, including spotlights for every keynote and session.
    const counts = await page.evaluate(() => ({ keynote: JSON.parse(document.getElementById('maker-data').dataset.keynotes).length, session: JSON.parse(document.getElementById('maker-data').dataset.sessions).length }));
    const tooFull = [];
    for (const format of ['portrait', 'square', 'story', 'landscape', 'letter', 'a4']) {
      for (const template of ['announcement', 'community', 'keynote', 'session']) {
        const features = template in counts ? counts[template] : 1;
        for (let feature = 0; feature < features; feature++) {
          for (const bios of template in counts ? [true, false] : [true]) {
            await set({ format, template, bios, times: true });
            await set({ feature });
            const message = await error();
            if (message) tooFull.push(`${format}/${template}${feature}/${bios ? 'bios' : 'no bios'}`);
            if (!bios || template === 'announcement' || template === 'community') assert(!/too full/.test(message) || format === 'square' || format === 'landscape', `${format}/${template}${feature}: ${message}`);
          }
        }
      }
    }
    console.log('Too full (export blocked with a message):', tooFull.join(', ') || 'none');

    // Responsive editor.
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });

    // Downloads at the declared pixel sizes.
    const downloadImage = async () => {
      const pending = page.waitForEvent('download'); await page.click('#maker-download');
      const data = await fs.readFile(await (await pending).path());
      assert.equal(data.toString('hex', 0, 8), '89504e470d0a1a0a');
      return [data.readUInt32BE(16), data.readUInt32BE(20)];
    };
    await page.click('#maker-reset'); await settle();
    for (const [format, size] of [['portrait', [1080, 1350]], ['square', [1080, 1080]], ['story', [1080, 1920]], ['landscape', [1200, 630]], ['letter', [2550, 3300]], ['a4', [2480, 3508]]]) {
      await set({ format });
      assert.deepEqual(await downloadImage(), size, format);
    }

    // Presets: save, change, reopen; bad files are refused.
    await set({ format: 'portrait', template: 'keynote', mode: 'coding' });
    await set({ feature: 1 });
    const presetPending = page.waitForEvent('download'); await page.click('#maker-save');
    const preset = await fs.readFile(await (await presetPending).path());
    await set({ template: 'announcement', mode: 'curiosity' });
    await page.setInputFiles('#maker-import', { name: 'preset.json', mimeType: 'application/json', buffer: preset }); await settle();
    assert.deepEqual(await page.evaluate(() => { const f = document.getElementById('maker-controls').elements; return [f.template.value, f.feature.value, f.mode.value]; }), ['keynote', '1', 'coding']);
    await page.setInputFiles('#maker-import', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
    await page.locator('#maker-error').waitFor({ state: 'visible' });
    assert(await page.locator('#maker-download').isDisabled());

    // Print view opens from a real click and gets the full-size image.
    await page.click('#maker-reset'); await settle();
    await set({ format: 'letter' });
    const popupPending = page.waitForEvent('popup'); await page.click('#maker-print');
    const popup = await popupPending;
    await popup.waitForFunction(() => document.querySelector('img')?.naturalWidth === 2550, null, { timeout: 15000 });
    await popup.close();
    assert.deepEqual(errors, []);

    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(new URL('poster-maker/', base).href);
    assert(await noJS.locator('#maker-workspace').isHidden());
    console.log('PASS: 10 homepage animations, all templates/sizes/speakers/sessions, responsive editor, PNG sizes, presets, print view, no-JS fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
