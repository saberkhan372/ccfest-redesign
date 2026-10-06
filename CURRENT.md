# Current state — October 5, 2026

## Interactive schedule on the register page — 2026-10-05 (Claude, local, uncommitted)
- **Built:** one server-rendered schedule replaces the timetable and the session list (`register/index.html`, new `_includes/session-card.html`). Keynotes now come first (01), then the Sessions schedule (02). Filters, sort and search were tried and dropped as unneeded. The panel card shows its description beside the panelists; names in keynote blocks link to that keynote's own card (`#keynote-opening`, `#keynote-closing`). Day in order: opening keynote (Dan Shiffman), Round 1 (8), panel, Round 2 (8, Caleb Foss added), closing keynote (Lauren Lee McCarthy). Anchors `#schedule` and `#sessions` kept. "How to join on the day" rewritten (Register via Luma; Zoom invite the day before with reminders; join the lobby; two rounds of concurrent sessions); the Zoom-account step is gone. `social-oct1/` copy and carousel still describe the old Zoom-registration steps. Heading stays Francisca's lettered "Sessions" (`251:788`); sections 01-04.
- **Host-side files:** `schedule.js` refactored to fill a "your time" line in every block (no table); new `schedule-explorer.js` (per-workshop preferences (first choice and second choice, one of each per round; maybe, any number; whoever held a place drops to maybe when another workshop takes it), My choices view, `.ics` of first choices only, PDF and PNG of all choices (Letter; built in the browser, no library; the PDF is plain Helvetica text so accents outside WinAnsi lose their mark, e.g. Jovanić prints as Jovanic; PNG has no alt text and the PDF is untagged), Google Calendar link per first choice; preferences in `localStorage`, work if storage is blocked); `redesign.css` §5 schedule rules replaced; `scripts/verify.cjs` updated and extended.
- **Data:** `sessions.yml` gained `id`, `format`, `level`, `language`, `schedule_id`; Melissa Cooper's resource link added; Julien's description lost stray quote marks; `schedule.yml`/`keynotes.yml` gained ids; `keynotes.yml` order is now Dan then Lauren (poster keynote pairs follow it). All fields declared in `.pages.yml`; `docs/UPDATING.md` updated.
- **Verified** (Jekyll build of the working tree, served locally): `verify.cjs` all PASS including new explorer, blocked-storage and 320/390/768/1440 overflow cases; `verify-poster.cjs` PASS; `git diff --check` clean. Looked at the 1440px screenshot.
- **Not verified:** the `.ics` imported into Apple/Outlook/Google (checked as text only); Safari/Firefox; screen readers; the 390px layout by eye; Francisca has not seen the combined section or its "Sessions" heading.
- **Open content:** Kofi's description is still "Coming soon"; Jessica's and Aleksandra's resource links are "In Progress!"/"tba" in the sheet, so none is published. `session-row.html` is now unused. Nothing committed, pushed or deployed.

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
