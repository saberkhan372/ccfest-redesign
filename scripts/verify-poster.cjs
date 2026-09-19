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
      await page.waitForFunction(() => /^(Ready|Change the settings|Fix the layout)/.test(document.getElementById('maker-status').textContent), null, { timeout: 30000 });
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

    // Every template and size, including every keynote, session and panel, with and without bios.
    // Tight combinations may report a layout problem (export off, with a message); nothing may throw.
    const crowded = [];
    for (const format of ['portrait', 'square', 'story', 'landscape', 'letter', 'a4']) {
      for (const template of ['announcement', 'community', 'keynote', 'session', 'panel']) {
        await set({ format, template, times: true });
        const features = await page.locator('#maker-feature option').evaluateAll(options => options.map(o => o.value));
        for (const feature of template === 'announcement' || template === 'community' ? [null] : features) {
          for (const bios of feature === null ? [true] : [true, false]) {
            await set(feature === null ? { bios } : { feature, bios });
            const message = await error();
            if (message) crowded.push(`${format}/${template}${feature ?? ''}/${bios ? 'bios' : 'no bios'}`);
            if (feature === null) assert.equal(message, '', `${format}/${template}`);
            assert(!message || /crowd|run into|runs off/.test(message), `${format}/${template}${feature}: ${message}`);
          }
        }
      }
    }
    console.log('Crowded (export off until a block is resized):', crowded.join(', ') || 'none');

    // The Moment slider scrubs recorded frames: the preview changes at once, and the first frame exports.
    await set({ format: 'portrait', template: 'announcement', mode: 'curiosity' });
    const pixels = () => page.evaluate(() => document.querySelector('#maker-canvas canvas').toDataURL());
    const settled = await pixels();
    await page.fill('#maker-moment', '0'); await page.waitForTimeout(150);
    assert.notEqual(await pixels(), settled, 'Scrubbing to the first moment should change the artwork');
    assert.equal(await page.textContent('#maker-moment-value'), '1 / 12');
    await page.fill('#maker-moment', '11'); await page.waitForTimeout(150);
    assert.equal(await pixels(), settled, 'Scrubbing back should restore the settled frame');
    await page.fill('#maker-moment', '0'); await settle();
    assert.equal(await error(), '');

    // Internal tool: not indexed, not in the navigation.
    assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex, nofollow');
    assert.equal(await page.locator('nav a[href*="poster-maker"]').count(), 0);

    // Move, resize and keyboard edits, kept per size.
    await page.click('#maker-reset'); await settle();
    const layout = () => page.evaluate(() => JSON.parse(localStorage.getItem('ccfest-poster-v3')).layout);
    await page.locator('.maker-stage').scrollIntoViewIfNeeded();
    const art = await page.locator('.maker-block[data-block="art"]').boundingBox();
    await page.mouse.move(art.x + art.width / 2, art.y + art.height / 2); await page.mouse.down();
    await page.mouse.move(art.x + art.width / 2 + 60, art.y + art.height / 2 + 40, { steps: 8 }); await page.mouse.up(); await settle();
    assert((await layout()).portrait.art.x > 50);
    await page.locator('.maker-block[data-block="logo"]').click();
    const logo = await page.locator('.maker-block[data-block="logo"]').boundingBox();
    const handle = await page.locator('.maker-block[data-block="logo"] .maker-block-handle').boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down();
    await page.mouse.move(logo.x + logo.width * 0.6, logo.y + logo.height * 0.6, { steps: 8 }); await page.mouse.up(); await settle();
    assert((await layout()).portrait.logo.s < 0.75);
    await page.locator('.maker-block[data-block="qr"]').focus();
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('-'); await settle();
    assert.equal((await layout()).portrait.qr.x, -4);
    await set({ format: 'square' });
    assert.equal((await layout()).square, undefined);
    await set({ format: 'portrait' });
    await page.click('#maker-layout-reset'); await settle();
    assert.equal((await layout()).portrait, undefined);

    // Poster-only text edits persist and reset.
    await set({ template: 'session' });
    await page.fill('#maker-text-description', 'A test description.'); await settle();
    await page.reload(); await page.locator('#maker-workspace').waitFor(); await settle();
    assert.equal(await page.inputValue('#maker-text-description'), 'A test description.');
    await page.click('#maker-text-reset'); await settle();
    assert.notEqual(await page.inputValue('#maker-text-description'), 'A test description.');

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
    await set({ feature: '1' });
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
    console.log('PASS: 10 homepage animations, all templates/sizes/speakers/sessions/panels, moment scrubbing, noindex, move/resize/keyboard, text edits, responsive editor, PNG sizes, presets, print view, no-JS fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
