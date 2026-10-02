# Baseline checks

Run on 2026-10-01 **before any poster-maker change**, so a later failure can be told apart from one that was already there.

## Before: a clean build of `main`

Source: `git archive HEAD` of `main` at `f2d96b3` (tracked files only, so none of the untracked recordings, designer folders or other sessions' work), built with Jekyll in `--safe` mode like GitHub Pages, served over HTTP.

| Check | Result | Time |
|---|---|---|
| `scripts/verify.cjs`: eight pages (including `poster-maker/`) at 320 / 390 / 768 / 1440, ten modes, keyboard, reduced motion, offscreen suspension, event reminder, schedule time zones, Luma dialog, no-JavaScript fallback, console and network errors | **pass**, exit 0 (ten PASS lines) | 84 s |
| `scripts/verify-poster.cjs`: ten animations, every template / size / keynote / session / panel with and without bios, moment scrubbing, noindex, move / resize / keyboard, text edits, editor at four widths, PNG sizes, presets, print view, no-JavaScript fallback | **pass**, exit 0; "Crowded: none" | 109 s |

**Existing failures: none.** The one known problem from earlier notes, ten lazy-loaded posters reported broken on Past Events at 768 px, is fixed on `main` (`05e1c50`, `settleImages` in `verify.cjs`) and did not appear.

## After: this branch

The same two suites, run again on a Jekyll build of the finished working tree, plus the checks added for this work:

| Check | Result | Time |
|---|---|---|
| `scripts/verify.cjs` | pass, exit 0 | 84 s |
| `scripts/verify-poster.cjs` | pass, exit 0; "Crowded: none" | 109 s |
| `scripts/compare-poster-renderer.cjs` (the original layout against `main`'s renderer: 768 renders, pixels, block boxes and layout problems) | pass, identical; fails when the reference is nudged by one number | 15 s |
| `scripts/poster-proofs.cjs --all-modes` (six directions and four variants for each of the ten animations; no layout problem; every colour pair at least 4.5:1; measured limits well past the real data; every design refuses sizes it has no layout for) | pass | 49 s |
| `scripts/poster-clip-proof.cjs` (two clips) | both recorded, decoded and played back | 18 s, 19 s |
| `scripts/measure-poster-art.cjs` at 1× and 2× | both ran | 39 s each |
| `git diff --check`, tracked changes and new files | clean | |

The two original suites were **not changed** and pass unmodified, as they should: the editor's behaviour is unchanged (its only edit is the `?proofs` hook). They will need to change in the commits that change the editor; see [SCHEMA.md](SCHEMA.md) section 8.

## How it was run

```sh
# a clean copy of main, built like GitHub Pages
git archive HEAD | tar -x -C "$SRC"
PATH=/opt/homebrew/opt/ruby@3.4/bin:$PATH LC_ALL=en_US.UTF-8 \
  /opt/homebrew/lib/ruby/gems/3.4.0/bin/jekyll build --safe --source "$SRC" --destination "$OUT"
npx http-server "$OUT" -p 8931 -a 127.0.0.1 -c-1
NODE_PATH=/opt/homebrew/lib/node_modules node scripts/verify.cjs        http://127.0.0.1:8931/
NODE_PATH=/opt/homebrew/lib/node_modules node scripts/verify-poster.cjs http://127.0.0.1:8931/
```

Environment: macOS (Darwin 25.6), Node 26.5.1, Playwright 1.63.0 with Google Chrome 154.0.8037.92 (headless), Jekyll 3.10.0 on Homebrew Ruby 3.4. Not the project's own CI; there is none.

## What these checks do not establish

- Whether a poster **looks good**: the suites check that something is drawn, not how. That is what the proofs and the designers are for.
- Safari, Firefox, real phones, touch; a physical print; scanning a printed QR code.
- Animated export in any browser but Chrome 154, and any recording in a hidden tab.
- The live site, and a real Pages CMS save.

## Environment notes from this run

Reading files in this folder is slow (iCloud-synced Documents), so whole-tree copies hang; build from `git archive` or copy only what Jekyll needs. macOS has no `timeout`, and zsh does not split unquoted variables. Both are in [../../GOTCHAS.md](../../GOTCHAS.md).
