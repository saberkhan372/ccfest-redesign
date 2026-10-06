# Current state — October 5, 2026

## Done

The campaign Figma file now has editable counterparts for all 30 static assets in `ccfest-session-spotlights/` and `social-oct1/`: 16 spotlights, nine carousel slides, four countdowns and the teaser cover. The 14 existing Bolder alternatives remain. Only the new **Social - Countdown & cover** page was added; existing pages and Francisca’s source file were untouched. [Frame inventory and editability limits](docs/FIGMA-POSTERS.md).

The host-owned poster maker now offers the six existing portrait design families through a thumbnail picker, editable session/panel titles, undo/redo, separate layout adjustments for new designs, compatibility fallback to Classic, copy-fit notes, and accurate preset/storage messages. Classic retains all six sizes and legacy presets. Changes are in the poster files, `redesign.css` §11 and the script includes in `_layouts/base.html`; Shristi’s files are unchanged. [Usage](docs/POSTER-MAKER.md).

Existing local changes were preserved, including the Change-on-white fix. Saber explicitly requested commit and push on October 5. The reviewed poster-maker changes are approved for `main`, which publishes through GitHub Pages. Other local programme/CMS edits and untracked campaign media are outside this commit. No social posts or messages were sent. Prior accumulated handoffs, including the pre-existing uncommitted notes, are preserved verbatim in [the historical archive](docs/history/CURRENT-before-2026-10-05.md).

## Verified and untested

Passed Jekyll 3.10 safe-mode build, `verify-poster-state.cjs`, `verify-poster.cjs`, `verify-poster-white.cjs`, `verify.cjs`, JS syntax and `git diff --check`. Chrome checks cover all ten animations, content/size combinations, PNG sizes, presets, editing/history, print view, no-JS fallback and site regression. Inspected all six new-design renders plus desktop/mobile editor; gallery has no horizontal overflow at 320/390/768/1440px. The last HTML-only addition was the countdown-page link, included in the successful final build and visual checks. Before committing, rebuilt the exact staged tree with the latest remote CMS data and reran `verify-poster-state.cjs`, `verify-poster.cjs` and `verify.cjs`: all passed.

Figma: inventoried all four pages, confirmed native text and no missing fonts, inspected the spotlight overview and five new posters; new text stays inside poster bounds. Countdown/cover frames are editable adaptations, not pixel-identical PNG imports. Photos/artwork remain images and some mastheads are outlines. MP4/GIF timelines are not covered.

Untested: Safari/Firefox, screen-reader usability, physical print/QR scans, platform compression and actual registration. Local preview: `http://127.0.0.1:8876/poster-maker/`, served from `/private/tmp/ccfest-maker-oct5/site`.

## Open risks and stale documentation

- Before push, fetched and fast-forwarded six existing CMS commits from GitHub. Website data now contains **16 workshops**, including Aleksandra Jovanić, Melissa Cooper and Caleb Foss. The 15-workshop spotlight set lacks Caleb; older social summary copy still lists 13. These programme changes came from the existing remote commits.
- The existing Figma Join us slide says “You will be registered for the Zoom Event”; actual joining flow remains unverified.
- Earlier campaign docs and historical handoffs contain obsolete counts/Figma claims; use `docs/FIGMA-POSTERS.md` for current coverage. Sandra’s Spanish-copy review and platform checks remain open.
- `posters-oct1/` white Change exports predate the fix; regenerate before use. Saved presets keep settings, not exact random artwork. Extra designs remain portrait-only; animation/batch export is still planned in `poster-maker.md`.
- The separate Zoom exporter remains a draft; its earlier scheduling/import assumptions have not been revalidated. Keep private contact artifacts outside the repository (see archived handoff).

## Next task

Reconcile the older campaign summaries with the 16-workshop website programme and add Caleb Foss’s “Declare Independence (from LLMs)” to the spotlight set and Figma. Review the Figma adaptations with the designers before sharing campaign assets.
