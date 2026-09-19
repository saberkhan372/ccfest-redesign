# Poster assets

- `wordmark.svg`: outlined from the existing local Anybody italic font and the runs in `design/figma-typography.json`, node `218:113` (400px, width 71, weight 400; first run -3% tracking). No designer source was edited. Generated using the bundled @napi-rs/canvas SVG text-to-path renderer. The resulting ink bounds are 875 × 275; the existing reference records 874px width. Needs Francisca's visual review. Anybody's OFL is in `../fonts/anybody-OFL.txt`.
- `register-qr.svg`: QR encoding of `https://ccfest.rocks/register/`, error correction M, 29 × 29 modules plus a four-module white quiet zone. Generated with ReportLab's QR encoder. The event URL is intentionally fixed; regenerate and recheck this asset if the public route changes.

The artwork is not stored here: `poster-stage.js` takes it from Shristi Singh's homepage interactive each time. See `docs/POSTER-MAKER.md`.
