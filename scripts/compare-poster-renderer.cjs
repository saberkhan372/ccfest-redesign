/* Compares the poster renderer with an earlier version of itself, so a refactor can prove it
 * changed nothing for posters that already exist.
 *
 * Loads poster-art.js from a git ref next to the working copy, in one page of a Jekyll build, and
 * draws the same real event content and the same captured homepage artwork with both: every
 * format, template, keynote, session and panel, on paper and white, with and without bios,
 * times, QR code and artwork labels. Passes only if every pixel, every block box and every layout
 * problem match. Design families are not compared; a state with no `design` is the original layout.
 *
 *   NODE_PATH=$(npm root -g) node scripts/compare-poster-renderer.cjs <base URL> [git ref, default HEAD]
 */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:8876/';
const ref = process.argv[3] || 'HEAD';
const reference = execFileSync('git', ['show', `${ref}:poster-art.js`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('poster-maker/?proofs', base).href);
    await page.waitForFunction(() => document.documentElement.dataset.proofs === 'ready', null, { timeout: 120000 });

    const result = await page.evaluate(async source => {
      const holder = {};
      new Function('window', source)(holder); // the old file assigns window.CCPosterArt
      const Old = holder.CCPosterArt, New = window.CCPosterArt;
      const { content, assets } = window.CCPosterContext;
      const art = window.CCPosterProofs.art();
      const panel = s => s.tags.some(tag => tag.toLowerCase() === 'panel');
      const contents = [
        ['announcement', null], ['community', null],
        ...content.keynotes.map(k => ['keynote', { kind: 'keynote', kicker: (k.label || 'Keynote').toUpperCase(), title: '', description: '', people: [k] }]),
        ...content.sessions.map(s => [panel(s) ? 'panel' : 'session', { kind: panel(s) ? 'panel' : 'session', kicker: s.tags.join(' · ').toUpperCase(), title: s.title, description: s.description, people: s.presenters }])
      ];
      const width = 540;
      const out = { compared: 0, errors: 0, different: [] };
      for (const format of Object.keys(New.FORMATS)) {
        const f = New.FORMATS[format];
        const height = Math.round(width * f.height / f.width);
        for (const [template, feature] of contents) {
          for (const background of ['paper', 'white']) {
            for (const on of [true, false]) {
              for (const labels of [true, false]) {
                const state = { ...New.DEFAULTS, template, format, background, bios: on, times: on, qr: on, labels, mode: 'creativity' };
                const draw = Renderer => {
                  const canvas = document.createElement('canvas');
                  canvas.width = width; canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  let result = null, error = '';
                  try { result = Renderer.render(ctx, state, art, { ...content, feature }, assets, width, height); } catch (e) { error = e.message; }
                  return { pixels: ctx.getImageData(0, 0, width, height).data, boxes: JSON.stringify(result && result.boxes), problems: JSON.stringify(result && result.problems), error };
                };
                const a = draw(Old), b = draw(New);
                out.compared++;
                if (a.error) out.errors++;
                let same = a.error === b.error && a.boxes === b.boxes && a.problems === b.problems;
                for (let i = 0; same && i < a.pixels.length; i++) if (a.pixels[i] !== b.pixels[i]) same = false;
                if (!same) out.different.push(`${format}/${template}/${feature ? feature.title || feature.people[0].name : '-'}/${background}/${on ? 'on' : 'off'}/${labels ? 'labels' : 'no labels'}`);
              }
            }
          }
        }
      }
      return out;
    }, reference);

    assert.deepEqual(errors, []);
    assert.deepEqual(result.different, [], `${result.different.length} of ${result.compared} renders differ from ${ref}`);
    console.log(`PASS ${result.compared} renders (${result.errors} of them an error both versions raise identically) are identical to ${ref}: pixels, block boxes and layout problems`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
