# What the capture holds, and how sharp it lands

Measured, not assumed, with [`scripts/measure-poster-art.cjs`](../../scripts/measure-poster-art.cjs) against the Jekyll build in Chrome 154 (headless, macOS). The homepage stage is captured at 1100 × 950 CSS px. This feeds the saved-poster schema ([SCHEMA.md](SCHEMA.md)) and the print task (task 8 in [poster-maker.md](../../poster-maker.md)).

## Seven of the ten animations are pure vector

Each capture is a stack of layers. For seven animations every layer is SVG, which is redrawn at the export size and is exactly as sharp on Letter as on a phone, whatever the capturing screen: Creativity, Connection, Collaboration, Creative Commons, Conversations, Community, Coding.

Three have bitmaps:

| Animation | Bitmap | Why its resolution is what it is |
|---|---|---|
| Change | one full-stage p5 canvas | `createCanvas(stageW, stageH)` with no `pixelDensity` call ([change-sketch.js:40](../../change-sketch.js:40)), so p5 uses the display's pixel ratio |
| Celebration | one full-stage confetti canvas | `dpr = window.devicePixelRatio`, re-read on every resize ([celebration-confetti.js:28](../../celebration-confetti.js:28), [:52](../../celebration-confetti.js:52)) |
| Curiosity | two 280 × 280 dot images | drawn by the host at a fixed 2 × CSS size (`boxImage` in `poster-stage.js`), independent of the display |

## What that means on paper

"Effective ppi" below is the bitmap's pixel width divided by the inches it covers where it lands. It is shown for US Letter in today's layout (the artwork spans the page width) and, for a social post, as bitmap pixels per exported pixel (below 1 means the bitmap is stretched).

Captured on a 1× display (an external monitor without display scaling):

| Animation | Bitmap pixels | ppi on Letter | Bitmap px per social export px | Stored (vector KB, gzip / PNG KB) |
|---|---|---|---|---|
| Change | 1100 × 950 | **120** | 0.81 | 478 (197) / 41 |
| Celebration | 1100 × 950 | **135** | 0.91 | 478 (197) / 31 |
| Curiosity | 280 × 280 ×2 | 335 | 2.26 | 478 (197) / 10 |

Captured on a 2× display (Retina):

| Animation | Bitmap pixels | ppi on Letter | Bitmap px per social export px | Stored (vector KB, gzip / PNG KB) |
|---|---|---|---|---|
| Change | 2200 × 1900 | **241** | 1.63 | 478 (197) / 122 |
| Celebration | 2200 × 1900 | **270** | 1.82 | 478 (197) / 200 |
| Curiosity | 280 × 280 ×2 | 335 | 2.26 | 478 (197) / 10 |

Reading it:

- **"Non-Retina, therefore soft" is too blunt.** At social size a 1× capture is only mildly stretched (0.81–0.91 bitmap pixels per export pixel, a 10–20% upscale). On Letter it is clearly short: 120–135 ppi is soft in print, where 200 or more is the usual comfortable target and about 150 the floor (conventional guidance, not measured here). A 2× capture reaches 241–270 ppi, which is fine.
- It is a property of **two modes**, not of the artwork in general, and it follows the **capturing screen**, so the same poster saved on two machines can print differently. The stored record should therefore keep the bitmap's pixel size and say so ([SCHEMA.md](SCHEMA.md) section 3).
- The ppi depends on how big the layout draws the artwork. These are the original layout's numbers; the script computes any layout.

## Raising it without touching Shristi's files (not tested)

Both bitmap modes size themselves from the display scale, so the capture frame, which the host controls, is where to raise it:

- **Celebration** re-reads `devicePixelRatio` on every `resize`, and scales its sizes and velocities by the same value. Overriding that property in the frame and dispatching `resize` should regenerate a sharper canvas with the same composition.
- **Change** draws in logical coordinates, so calling p5's `pixelDensity(n)` from the host adapter should raise the backing store without changing what it draws.

Neither has been tried. The test for each is the one the review set: the picture must still be the same composition (same positions, same blend, nothing cropped), and the measured ppi must rise. A higher-resolution recapture also produces a *different* random picture, so a saved favourite must not be silently replaced by one.

## Storage per saved still

One still is the vector markup (about 0.48 MB; **only 2.4× smaller gzipped**, 0.2 MB, because the inlined styles are not as repetitive as I expected) plus the PNG of any bitmap (10–200 KB). About 0.2–0.4 MB with compression. The vector size is almost identical for every mode (478–486 KB), which suggests each capture carries the whole monogram SVG with its inlined styles; I did not trace why.

## Reproduce

```sh
NODE_PATH=$(npm root -g) node scripts/measure-poster-art.cjs http://127.0.0.1:8876/ --dpr 1
NODE_PATH=$(npm root -g) node scripts/measure-poster-art.cjs http://127.0.0.1:8876/ --dpr 2
```
