/* Animated-poster proof (docs/poster-maker-v2/ANIMATION.md): records one homepage animation as a
 * short portrait clip with the poster's text held still, and checks the file that comes out.
 *
 * In the page, poster-stage.js samples the animation once per display frame (CCStageCapture.captureClip),
 * poster-art.js draws the whole poster for every sample, and MediaRecorder encodes the canvas. Nothing is
 * kept in memory between frames. Back in Node, ffprobe reads the result (codec, size, duration, frame
 * count and spacing), and ffmpeg writes the first and last frames and a filmstrip to look at. The same
 * page also plays the recording back, and samples the JS heap, to show nothing piles up between frames.
 *
 *   NODE_PATH=$(npm root -g) node scripts/poster-clip-proof.cjs <base URL> <mode> [--design signature]
 *       [--seconds 5] [--fps 30] [--width 1080] [--height 1350] [--from 250] [--pose-at 1400]
 *       [--mime video/mp4;codecs=avc1.640028] [--mbps 6] [--out docs/poster-maker-v2/clips]
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : fallback; };
const [base, mode] = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
assert(base && mode, 'usage: poster-clip-proof.cjs <base URL> <mode> [options]');
const options = {
  mode, design: flag('design', 'signature'), seconds: Number(flag('seconds', 5)), fps: Number(flag('fps', 30)),
  width: Number(flag('width', 1080)), height: Number(flag('height', 1350)), from: Number(flag('from', 250)),
  poseAt: flag('pose-at') === undefined ? undefined : Number(flag('pose-at')),
  mime: flag('mime', 'video/mp4;codecs=avc1.640028'), bitrate: Number(flag('mbps', 6)) * 1e6
};
const out = path.resolve(flag('out', 'docs/poster-maker-v2/clips'));
const have = name => spawnSync('which', [name]).status === 0;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('poster-maker/?proofs', base).href);
    await page.waitForFunction(() => document.documentElement.dataset.proofs === 'ready', null, { timeout: 120000 });

    const clip = await page.evaluate(async o => {
      const A = window.CCPosterArt, Stage = window.CCStageCapture;
      const { content, assets } = window.CCPosterContext;
      if (!MediaRecorder.isTypeSupported(o.mime)) return { unsupported: `This browser cannot record ${o.mime}.` };
      // One framing for every frame, taken from a normal recording of the mode.
      const recording = await Stage.capture({ url: content.home, mode: o.mode, hover: true, seed: 1 });
      const focus = recording.frames[0].focus;
      const canvas = document.createElement('canvas');
      canvas.width = o.width; canvas.height = o.height;
      const ctx = canvas.getContext('2d');
      const track = canvas.captureStream(0).getVideoTracks()[0];
      const recorder = new MediaRecorder(new MediaStream([track]), { mimeType: o.mime, videoBitsPerSecond: o.bitrate });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise(resolve => { recorder.onstop = resolve; });
      const state = { ...A.DEFAULTS, template: 'announcement', format: 'portrait', mode: o.mode, design: o.design, background: 'paper' };
      const log = [];
      const heap = () => (performance.memory ? performance.memory.usedJSHeapSize : 0);
      const heapStart = heap();
      let heapMax = heapStart;
      recorder.start(500);
      const began = performance.now();
      const result = await Stage.captureClip({
        url: content.home, mode: o.mode, hover: true, seed: 1, duration: o.seconds * 1000, interval: 1000 / o.fps, from: o.from, poseAt: o.poseAt, focus,
        onFrame: async (shot, i) => {
          const a = performance.now();
          A.render(ctx, state, shot, { ...content, feature: null }, assets, o.width, o.height);
          const b = performance.now();
          track.requestFrame();
          heapMax = Math.max(heapMax, heap());
          log.push({ i, t: Math.round((shot.t - o.from) * 10) / 10, snapshotMs: Math.round(shot.cost * 10) / 10, composeMs: Math.round((b - a) * 10) / 10 });
        }
      });
      const wall = performance.now() - began;
      recorder.stop();
      await stopped;
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const heapEnd = heap();
      // Can this browser play back what it just recorded?
      const playback = await new Promise(resolve => {
        const video = document.createElement('video');
        video.muted = true; video.playsInline = true; video.preload = 'auto';
        const url = URL.createObjectURL(blob);
        const timer = setTimeout(() => resolve({ ok: false, error: 'timed out' }), 20000);
        const done = ok => { clearTimeout(timer); URL.revokeObjectURL(url); resolve({ ok, width: video.videoWidth, height: video.videoHeight, duration: Math.round(video.duration * 1000) / 1000, error: video.error ? video.error.message : null }); };
        video.onerror = () => done(false);
        video.oncanplay = async () => { try { await video.play(); setTimeout(() => done(video.currentTime > 0.3), 800); } catch (e) { clearTimeout(timer); resolve({ ok: false, error: e.message }); } };
        video.src = url;
      });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return { base64: btoa(binary), mimeType: recorder.mimeType, bytes: bytes.length, frames: result.frames, wallMs: Math.round(wall), log, playback, heapMB: { start: Math.round(heapStart / 1048576), max: Math.round(heapMax / 1048576), end: Math.round(heapEnd / 1048576) }, userAgent: navigator.userAgent };
    }, options);

    assert.deepEqual(errors, []);
    if (clip.unsupported) { console.log(`BLOCKED ${clip.unsupported}`); process.exitCode = 2; return; }
    fs.mkdirSync(out, { recursive: true });
    const ext = clip.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const stem = `${mode}-${options.design}-${options.width}x${options.height}-${options.fps}fps`;
    const file = path.join(out, `${stem}.${ext}`);
    fs.writeFileSync(file, Buffer.from(clip.base64, 'base64'));

    // What the page measured while recording.
    const median = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
    const gaps = clip.log.slice(1).map((l, i) => l.t - clip.log[i].t);
    const report = {
      file: path.relative(process.cwd(), file), mimeType: clip.mimeType, bytes: clip.bytes, requested: { ...options, mime: undefined },
      recorded: { frames: clip.frames, wallSeconds: clip.wallMs / 1000, sampleGapMs: { median: median(gaps), max: Math.max(...gaps), over50ms: gaps.filter(g => g > 50).length } },
      playback: clip.playback, jsHeapMB: clip.heapMB,
      costMs: { snapshotMedian: median(clip.log.map(l => l.snapshotMs)), composeMedian: median(clip.log.map(l => l.composeMs)), composeMax: Math.max(...clip.log.map(l => l.composeMs)) },
      browser: clip.userAgent.match(/Chrome\/[\d.]+/)[0]
    };

    // What came out, read back by ffprobe.
    if (have('ffprobe')) {
      const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,duration,bit_rate:format=format_name,duration,size', '-of', 'json', file], { encoding: 'utf8' }));
      const stamps = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split('\n').map(Number).filter(Number.isFinite);
      const spacing = stamps.slice(1).map((t, i) => (t - stamps[i]) * 1000);
      report.ffprobe = { stream: probe.streams[0], format: probe.format, frameSpacingMs: { median: Math.round(median(spacing) * 10) / 10, max: Math.round(Math.max(...spacing)), over50ms: spacing.filter(g => g > 50).length, over100ms: spacing.filter(g => g > 100).length } };
      if (have('ffmpeg')) {
        const run = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
        run(['-i', file, '-frames:v', '1', path.join(out, `${stem}-first.png`)]);
        run(['-sseof', '-0.2', '-i', file, '-update', '1', '-frames:v', '1', path.join(out, `${stem}-last.png`)]);
        run(['-i', file, '-vf', `fps=${(10 / options.seconds).toFixed(4)},scale=270:-1,tile=10x1`, '-frames:v', '1', path.join(out, `${stem}-strip.png`)]);
      }
    } else report.ffprobe = 'ffprobe is not installed, so the file was not read back';
    fs.writeFileSync(path.join(out, `${stem}.json`), `${JSON.stringify({ ...report, perFrame: clip.log }, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 1));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
