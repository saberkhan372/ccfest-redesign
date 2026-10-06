# Poster maker v2: first milestone

**October 5 update:** the six portrait compositions are now available in the editor, alongside Classic, with undo/redo and editable session titles. The account below describes the original October 1 proof milestone. See [the current usage guide](../POSTER-MAKER.md) for the implemented controls and remaining limits. Designer approval of the compositions is still outstanding.

Merged to `main` on 2026-10-01 from branch `poster-maker-v2`, so the review sheet is live at `/poster-maker/?proofs` (unlisted, `noindex`); this folder itself is excluded from the published site. The review media (`proofs/` and `clips/` images and video, 8.9 MB) is in its own commit. The plan is [poster-maker.md](../../poster-maker.md) at the repo root; this folder is the review material for its first milestone, tightened to: baseline results, six portrait proofs, a saved-poster schema proposal, and two real animation proofs. The next step is choosing three directions, which needs Saber, Francisca and Shristi, before the broader editor is built.

| What | Where | State |
|---|---|---|
| Baseline checks, before any change | [BASELINE.md](BASELINE.md) | Both suites pass on a clean build of `main`; the same suites pass on this branch |
| Six portrait directions, plus variants | [DIRECTIONS.md](DIRECTIONS.md), [proofs/](proofs/) | Built and checked; **choosing three is open** |
| Saved-poster schema proposal | [SCHEMA.md](SCHEMA.md) | Proposal only; nothing implemented. Includes what was verified about Pages CMS and what still needs a real save |
| Animation proofs (MP4) | [ANIMATION.md](ANIMATION.md), [clips/](clips/) | Two 5 s clips recorded and read back in Chrome 154; other browsers untested |
| What the artwork capture holds, and print sharpness | [ARTWORK.md](ARTWORK.md) | Measured |

## What changed in the code

Host-owned files only. Shristi's files, the designers' folders and the Figma file are untouched, and no data file or CMS setting was changed.

| File | Change |
|---|---|
| `poster-art.js` | The original layout moved, unchanged, into `classic()`. New design registry (`registerDesign`), a `kit` of helpers for design files, a palette (`COLORS`), optional colour / `pad` / `align` / `onClip` on existing helpers (defaults unchanged), a refusal for a design asked to draw at a size it has no layout for, and `render()` also returns the notes and colour pairs a design reports |
| `poster-designs.js` (new) | The six design families |
| `poster-proofs.js` (new) | The internal review sheet at `/poster-maker/?proofs`, with the measured-limit probes. Loaded only for that address |
| `poster-maker.js` | One hook: the `?proofs` address hands the content to `poster-proofs.js` instead of opening the editor. The editor is otherwise as it was |
| `poster-stage.js` | `captureClip` (dense sampling for animation) and each SVG layer now keeps its `markup` |
| `_layouts/base.html`, `redesign.css` §11 | Load `poster-designs.js`; styles for the review sheet |
| `scripts/` (new) | `poster-proofs.cjs`, `compare-poster-renderer.cjs`, `poster-clip-proof.cjs`, `measure-poster-art.cjs` |

The editor does not use any of the new designs yet, and the original layout draws **pixel-identically** to `main` (768 renders compared; the comparison fails when the reference is nudged by one number).

## Regenerate and re-check

Build Jekyll into a temporary folder and serve it (see [../UPDATING.md](../UPDATING.md)), then:

```sh
export NODE_PATH=$(npm root -g)
node scripts/verify.cjs http://127.0.0.1:8876/
node scripts/verify-poster.cjs http://127.0.0.1:8876/
node scripts/compare-poster-renderer.cjs http://127.0.0.1:8876/ HEAD      # needs the reference in git
node scripts/poster-proofs.cjs http://127.0.0.1:8876/ docs/poster-maker-v2/proofs --all-modes
node scripts/poster-clip-proof.cjs http://127.0.0.1:8876/ collaboration --seconds 5
node scripts/poster-clip-proof.cjs http://127.0.0.1:8876/ celebration --seconds 5 --from 1100 --pose-at 1400
node scripts/measure-poster-art.cjs http://127.0.0.1:8876/ --dpr 2
git diff --check
```

## Not done, not verified

- Safari, Firefox and phones for the clips; a hidden-tab recording; any size but 1080 × 1350 for animation.
- A real Pages CMS save with the proposed ID fields (needs Saber's login).
- Printing, and scanning a printed QR code; the proofs are screens.
- Any reaction from Francisca or Shristi: the new lockups listed in [DIRECTIONS.md](DIRECTIONS.md) are unseen by them.
- GIF.
