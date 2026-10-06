# Animated posters — feasibility proof

Task 9 of [poster-maker.md](../../poster-maker.md): before promising MP4 or GIF, find out what a browser can really produce. **Result: in Chrome 154 an MP4 of a homepage animation, with the poster's text held still, can be recorded in the page with no encoder library.** Two proof clips exist ([clips/](clips/)); everything below is what they and the probes showed. Nothing is wired into the editor.

## What was tried

1. **Sampling.** `CCStageCapture.captureClip` ([poster-stage.js:355](../../poster-stage.js:355)), a new prototype in the existing capture adapter, samples the homepage animation once per display frame instead of keeping 12 stills. It hands each sample to the caller as it is taken, so nothing accumulates. Shristi's files are untouched.
2. **Composing.** Every sample goes through the real `CCPosterArt.render` (the Signature design), so the date, facts, QR and footer are drawn by the same code that draws a still, on every frame.
3. **Encoding.** `canvas.captureStream(0)` plus `requestFrame()` per sample, recorded by `MediaRecorder` as `video/mp4;codecs=avc1.640028`.
4. **Checking.** In the same page the file is played back; in Node, `ffprobe` decodes every frame and reads the timing, and `ffmpeg` extracts frames to look at ([scripts/poster-clip-proof.cjs](../../scripts/poster-clip-proof.cjs)).

## What this browser can encode

Probed in Chrome 154 (headless, macOS), 2026-10-01:

| Route | Result |
|---|---|
| `MediaRecorder` MP4 | `video/mp4;codecs=avc1.*` and `av01` supported; `codecs=h264` and `hvc1` not |
| `MediaRecorder` WebM | vp8, vp9, av01 and h264 supported |
| WebCodecs `VideoEncoder` | avc1 High 4.0, VP8, VP9, AV1 and HEVC supported at 1080 × 1350; avc1 Baseline 3.1 is not (the level is too low for that size) |

So an MP4 container comes straight out of `MediaRecorder`; no muxer is needed. WebCodecs would add exact per-frame timestamps, and it needs a muxer (WebCodecs does not make a container). It is not needed at this cadence. Safari and Firefox were **not tested**; check `MediaRecorder.isTypeSupported` and the current MDN tables when this is built.

## What the two clips show

Both are the Signature design, 1080 × 1350, requested at 30 fps, 5 s.

| | Collaboration (continuous swing) | Celebration (confetti burst; canvas path) |
|---|---|---|
| Timeline | 0.25 s to 5.25 s after the word is picked | from 1.1 s (the pointer arrives at 1.4 s) for 5 s |
| Frames sampled / found in the file | 150 / 150 | 150 / 149 |
| Spacing between samples | median 33.3 ms, max 48.3 ms, none over 50 ms | median 33.3 ms, max 50.2 ms, five over 50 ms |
| Spacing between frames in the file | median 33.3 ms, max 55 ms, one over 50 ms | median 33.3 ms, max 69 ms, 23 over 50 ms |
| Over 100 ms between frames | none | none |
| Duration in the file | 4.997 s | 4.961 s |
| File | 825 KB (about 1.35 Mbps) | 1,339 KB (about 2.2 Mbps) |
| Codec | H.264 High, `yuvj420p` | same |
| Plays back in Chrome | yes, 1080 × 1350 | yes, 1080 × 1350 |
| JS heap, start / peak / end | 20 / 96 / 77 MB | 41 / 61 / 51 MB |
| Median cost of one sample | 9.7 ms | 12.9 ms |

The cadence is **not guaranteed**. Across three runs of each clip the file had 1–3 gaps over 50 ms for Collaboration and 2–23 for Celebration (the table shows the last run, the roughest); the worst gap ever seen was 69 ms and none reached 100 ms. The cause of Celebration's run-to-run difference was not diagnosed. A 30 fps clip from this pipeline is therefore close to even, not exact.

Looking at the frames (first, last and a ten-frame strip for each, in [clips/](clips/)):

- The text, chips, QR and footer are identical and sharp in every frame. The swinging Cs and the confetti are the only things that move.
- Confetti keeps its transparency: no pale rectangle where the p5 canvas would be, and the Cs turn after the burst exactly as on the homepage.
- Confetti is clipped at the edge of the artwork band, which shows as a hard line near the date. Whether it should overlap the text or be allowed to fall past the band is a design decision for the animated templates.

What is **not** shown: one frame is missing between the 150 sampled and the 149 in the Celebration file (not diagnosed). `yuvj420p` is full-range video, and some players treat that differently from the usual limited range. I have not looked at either clip in QuickTime, Safari, a phone gallery or a social app. Chroma softening of thin saturated lines in H.264 4:2:0 was not measured.

## Cost per mode

Sampling cost, measured with back-to-back samples for 4 s at the page's own pace. The page only produces a new picture per display frame (60 Hz here), so samples faster than that are duplicates; the useful figure is whether one sample fits a frame budget (33 ms at 30 fps).

| Animation | Median | 90th percentile | Max | What it does over 4 s |
|---|---|---|---|---|
| Creativity | 8.6 ms | 10.1 | 27 | scribbles draw in slowly |
| Change | 15.9 ms | 20.6 | 50 | morph as the pointer arrives, then still |
| Connection | 3.5 ms | 9.3 | 27 | moves when the pointer arrives, then still |
| Celebration | 13.1 ms | 17.7 | 60 | **burst at about 1.5–3 s** |
| Collaboration | 3.4 ms | 9.5 | 26 | **moves throughout** |
| Creative Commons | 3.1 ms | 9.0 | 24 | wallpaper reveal; the motion measure below does not see it |
| Conversations | 3.3 ms | 9.4 | 22 | moves when the pointer arrives, then still |
| Community | 3.2 ms | 9.1 | 22 | moderate, intermittent |
| Curiosity | 3.8 ms | 9.4 | 21 | moves when the pointer arrives, then still |
| Coding | 3.2 ms | 9.4 | 33 | moves when the pointer arrives, then still |

The motion column comes from a coarse measure: how much a 64 × 64 rendering of the layers changed between consecutive samples. It ignores the stage's own background, so Creative Commons' wallpaper reveal is not captured by it. Every median fits a 30 fps budget. At 60 fps (16.7 ms) the two canvas modes would not reliably fit: Change and Celebration have 90th percentiles of 20.6 and 17.7 ms.

**Which modes suit video:** continuous motion (Collaboration, possibly Community); an entrance or burst (Celebration, Creativity); and four modes that only react when the pointer arrives and then hold still (Connection, Conversations, Curiosity, Coding), which make short, mostly static clips and are better as stills. Loops: none of these returns to its first frame by itself, so an exported clip should not be sold as a seamless loop; a still hold at the end is the honest ending.

## Limits and unsupported cases

- **Real time.** A 5 s clip takes 5 s to record, and the tab has to be visible. A hidden tab throttles animation frames to a crawl (the existing capture already notes this); the clip export must watch `visibilitychange` and stop with a recoverable message, not save a damaged file. Not tested here.
- **One take.** None of the sketches is seeded, so a second recording differs. A saved clip is the record ([SCHEMA.md](SCHEMA.md)).
- **Slow devices.** Sampling runs on the page's main thread. On a slower machine the gaps will widen and the clip will look choppier, though its timing stays correct, because the animation does not wait. Untested on a phone.
- **Memory.** Flat by design (each sample is composed and dropped); the JS heap peaked at 61–96 MB across runs and fell back. Canvas and GPU memory are not in that figure.
- **Sizes.** Only 1080 × 1350 was recorded. Story and square follow once those layouts exist.
- **No audio, no GIF.** GIF would reuse the same samples at 10–15 fps and needs an encoder written or vendored; not attempted, nothing measured.
- **Dependencies added:** none. `ffmpeg` and `ffprobe` are used only to check the files.

## What this means for the build

Start from this pipeline. Pace by display frame; list supported types in order (MP4 avc1, then WebM, labelled as WebM if that is what the browser gives; never rename one to the other); stop on a hidden tab; disable a second export while one runs and tear down the recorder, tracks and canvas afterwards; end on a held still frame; keep the PNG export alongside. Quality settings are an open choice: Chrome produced 1.4–2.2 Mbps from a 6 Mbps request, well under it; whether a lower request changes the files was not tried. For a stored recording, keep the clip, not the frames (about 24 MB of markup for 120 frames against about 1 MB for the MP4).

## Reproduce

```sh
NODE_PATH=$(npm root -g) node scripts/poster-clip-proof.cjs http://127.0.0.1:8876/ collaboration --seconds 5
NODE_PATH=$(npm root -g) node scripts/poster-clip-proof.cjs http://127.0.0.1:8876/ celebration --seconds 5 --from 1100 --pose-at 1400
```

Needs Chrome, Playwright and (for the read-back) `ffmpeg`/`ffprobe`. Files and a JSON log with every frame's timing go to `docs/poster-maker-v2/clips/`.
