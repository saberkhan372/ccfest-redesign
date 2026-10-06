/* Browser check for Change on a white poster. No live form submissions.
 *
 * Change's canvas is blended with `darken` on the homepage, which hides its pale fill and the trails its sketch
 * leaves (#f2f2ef) only while the page is darker than they are, as the paper is. On white they showed as a faint
 * grey ghost of the two Cs, so poster-art.js draws the layer see-through on a lighter page (docs/POSTER-MAKER.md).
 *
 * Records Change once through the real capture, then draws the artwork alone on paper and on white for each of
 * its 12 frames and checks that:
 *   - white shows ink only where paper does: nothing farther than 2 px from paper's own ink
 *   - white drops none of it: wherever paper is clearly inked, white is too
 *   - paper is untouched: a frame drawn with its recorded fill ignored (the path every other background takes) is identical
 *   - the check can see the bug: with that fill ignored, the settled frame on white does show a ghost
 *
 *   NODE_PATH=$(npm root -g) node scripts/verify-poster-white.cjs <base URL> [display scale, default 2]
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:8876/';
const scale = Number(process.argv[3] || 2);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: scale })).newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('poster-maker/', base).href);
    await page.locator('#maker-workspace').waitFor({ state: 'visible', timeout: 60000 });
    await page.waitForFunction(() => /^(Ready|Change the settings|Fix the layout)/.test(document.getElementById('maker-status').textContent), null, { timeout: 90000 });

    const result = await page.evaluate(async url => {
      const A = window.CCPosterArt;
      const recording = await window.CCStageCapture.capture({ url, mode: 'change', hover: true, seed: 1 });
      const W = 1100, H = 950, REACH = 2, PAPER = [237, 237, 233];
      const draw = (frame, background) => {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        A.thumbnail(ctx, { ...A.DEFAULTS, background }, frame, W, H);
        return ctx.getImageData(0, 0, W, H).data;
      };
      // The same frame with its recorded fill forgotten: every layer is then drawn the way `darken` always was.
      const ignoringFill = frame => ({ ...frame, layers: frame.layers.map(({ clear, ...layer }) => layer) });
      // Box dilation of a 0/1 mask by REACH pixels (rows, then columns).
      const near = mask => {
        const rows = new Uint8Array(W * H), out = new Uint8Array(W * H);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let k = -REACH; k <= REACH; k++) if (mask[y * W + Math.min(W - 1, Math.max(0, x + k))]) { rows[y * W + x] = 1; break; }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let k = -REACH; k <= REACH; k++) if (rows[Math.min(H - 1, Math.max(0, y + k)) * W + x]) { out[y * W + x] = 1; break; }
        return out;
      };
      // Ink on white that paper does not have (ink = how far under the page colour the darkest channel is).
      const ghost = (paper, white) => {
        const inked = new Uint8Array(W * H);
        for (let p = 0; p < W * H; p++) inked[p] = Math.max(PAPER[0] - paper[p * 4], PAPER[1] - paper[p * 4 + 1], PAPER[2] - paper[p * 4 + 2]) > 0 ? 1 : 0;
        const close = near(inked);
        let count = 0;
        for (let p = 0; p < W * H; p++) if (!close[p] && 255 - Math.min(white[p * 4], white[p * 4 + 1], white[p * 4 + 2]) >= 3) count++;
        return count;
      };
      const out = { filled: true, ghosts: [], lost: [], paperChanged: [], control: 0 };
      recording.frames.forEach((frame, index) => {
        if (!frame.layers.some(layer => layer.clear && layer.blend === 'darken')) out.filled = false;
        const paper = draw(frame, 'paper'), white = draw(frame, 'white');
        const plain = ignoringFill(frame);
        const paperPlain = draw(plain, 'paper');
        out.paperChanged.push(paper.some((value, i) => value !== paperPlain[i]));
        out.ghosts.push(ghost(paper, white));
        let lost = 0;
        for (let p = 0; p < W * H; p++) if (Math.max(PAPER[0] - paper[p * 4], PAPER[1] - paper[p * 4 + 1], PAPER[2] - paper[p * 4 + 2]) >= 40 && 255 - Math.min(white[p * 4], white[p * 4 + 1], white[p * 4 + 2]) < 10) lost++;
        out.lost.push(lost);
        if (index === recording.frames.length - 1) out.control = ghost(paper, draw(plain, 'white'));
      });
      return out;
    }, base);

    assert(result.filled, 'Every Change frame should carry its canvas fill as `clear` (poster-stage.js)');
    assert.deepEqual(result.paperChanged.filter(Boolean), [], 'Paper must not take the lifted path');
    assert.deepEqual(result.ghosts.filter(Boolean), [], `White shows ink where paper has none (pixels per frame: ${result.ghosts.join(', ')})`);
    assert.deepEqual(result.lost.filter(Boolean), [], `White dropped artwork that paper shows (pixels per frame: ${result.lost.join(', ')})`);
    assert(result.control > 1000, `The check could not see the ghost without the fix (${result.control} px); the animation may have changed`);
    assert.deepEqual(errors, []);
    console.log(`PASS Change on white: ink only where paper has it in all 12 frames, none dropped, paper untouched (without the fix the settled frame shows ${result.control} ghost px)`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
