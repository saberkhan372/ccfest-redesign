/* What the capture holds for each homepage animation, and how sharp it lands on paper.
 *
 * For every mode it records one still, then lists the layers (vector SVG, or bitmap with its pixel
 * size), the bytes needed to store the still (SVG markup raw and gzipped, bitmap PNGs), and the
 * effective resolution of each bitmap where it lands: on US Letter in the original layout, and in a
 * 1080 px social post (Signature design). Resolution of the bitmaps follows the display scale of
 * the machine that captured them, so run it at the scale you care about:
 *
 *   NODE_PATH=$(npm root -g) node scripts/measure-poster-art.cjs <base URL> [--dpr 2]
 *
 * Prints a table, then the raw JSON. Vector layers are redrawn at export size and stay sharp.
 */
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8876/';
const dprAt = process.argv.indexOf('--dpr');
const dpr = dprAt >= 0 ? Number(process.argv[dprAt + 1]) : 1;
const MODES = ['creativity', 'change', 'connection', 'celebration', 'collaboration', 'creative-commons', 'conversations', 'community', 'curiosity', 'coding'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: dpr })).newPage();
    await page.goto(new URL('poster-maker/?proofs', base).href);
    await page.waitForFunction(() => document.documentElement.dataset.proofs === 'ready', null, { timeout: 120000 });
    const rows = [];
    for (const mode of MODES) {
      const row = await page.evaluate(async mode => {
        const A = window.CCPosterArt, { content, assets } = window.CCPosterContext;
        const recording = await window.CCStageCapture.capture({ url: content.home, mode, hover: true, seed: 1 });
        const art = recording.frames[recording.frames.length - 1];
        const pngBytes = canvas => new Promise(resolve => canvas.toBlob(blob => resolve(blob.size), 'image/png'));
        const gzipBytes = async text => {
          const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
          return (await new Response(stream).arrayBuffer()).byteLength;
        };
        const out = { mode, dpr: window.devicePixelRatio, stage: [Math.round(art.width), Math.round(art.height)], layers: [], svgBytes: 0, svgGzipBytes: 0, bitmapPngBytes: 0 };
        let markup = '';
        for (const layer of art.layers) {
          if (layer.image instanceof HTMLCanvasElement) {
            const bytes = await pngBytes(layer.image);
            out.bitmapPngBytes += bytes;
            out.layers.push({ kind: 'bitmap', px: [layer.image.width, layer.image.height], cssWidth: layer.w, pngBytes: bytes });
          } else { markup += layer.markup || ''; out.layers.push({ kind: 'vector', markupBytes: (layer.markup || '').length }); }
        }
        out.svgBytes = markup.length;
        out.svgGzipBytes = markup ? await gzipBytes(markup) : 0;
        // Where the artwork lands: how many css px of the stage fit per logical unit of the poster.
        const landing = (format, design) => {
          const f = A.FORMATS[format];
          const canvas = document.createElement('canvas');
          canvas.width = 400; canvas.height = Math.round(400 * f.height / f.width);
          const result = A.render(canvas.getContext('2d'), { ...A.DEFAULTS, format, mode, design, template: 'announcement' }, art, { ...content, feature: null }, assets, canvas.width, canvas.height);
          const box = result.boxes.find(b => b.id === 'art');
          const pad = design === 'signature' ? 0.05 : 0.14;
          const scale = Math.min(box.w / (art.focus.w * (1 + 2 * pad)), box.h / (art.focus.h * (1 + 2 * pad)));
          return { unitsPerCssPx: scale, exportPxPerCssPx: scale * f.width / 1000, paperInches: f.paper === 'letter' ? 8.5 : null };
        };
        out.letter = landing('letter', undefined);
        out.social = landing('portrait', 'signature');
        return out;
      }, mode);
      for (const layer of row.layers.filter(l => l.kind === 'bitmap')) {
        layer.ppiOnLetter = Math.round(layer.px[0] / (layer.cssWidth * row.letter.unitsPerCssPx / 1000 * row.letter.paperInches));
        layer.pxPerExportPx = Math.round(layer.px[0] / (layer.cssWidth * row.social.exportPxPerCssPx) * 100) / 100;
      }
      rows.push(row);
    }
    console.log(`Capturing display scale ${dpr}x\n`);
    console.log('mode              vector KB (gzip)   bitmap layers (px)       PNG KB   ppi on Letter   bitmap px per social export px');
    for (const r of rows) {
      const bitmaps = r.layers.filter(l => l.kind === 'bitmap');
      console.log(`${r.mode.padEnd(17)} ${String(Math.round(r.svgBytes / 1024)).padStart(5)} (${String(Math.round(r.svgGzipBytes / 1024)).padStart(3)})      ${(bitmaps.map(l => l.px.join('x')).join(', ') || '-').padEnd(24)} ${String(Math.round(r.bitmapPngBytes / 1024)).padStart(6)}   ${(bitmaps.map(l => l.ppiOnLetter).join(', ') || '-').padEnd(14)}  ${bitmaps.map(l => l.pxPerExportPx).join(', ') || '-'}`);
    }
    console.log(`\n${JSON.stringify(rows)}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
