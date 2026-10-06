# Current state — CC Fest redesign

## Promo fixes re-verified — 2026-10-02 (Codex, review only; supersedes review findings below)
- Current verdict: ready for actual platform draft previews. Updated the top of `social-oct1/REVIEW.md` with resolved findings and remaining limits; earlier review text is historical. No campaign copy, media, site code, configuration, or Figma edited by this follow-up. Nothing posted, uploaded, sent, committed, pushed, or deployed.
- Verified revised 9-page/5-page PDFs: real text on every page, structure trees and `en`; rendered all nine full-PDF pages. Larger names/times, split beginner list, readable Spanish label, credits, and Luma-email joining step are present. Inspected all nine Figma screenshots read-only and their footer crops; content agrees, with minor heading-wrap and Spanish-label differences from the PDF. Checked four countdowns and registration QR destinations in PDFs/countdowns/new teaser cover. Latest copy fixes confirmed; Spanish is 254 graphemes; `git diff --check` passes.
- Remaining: screen-reader usability, platform drafts/re-encoding, real registration, Sandra's copy review, and small type in the unchanged square posters. Documentation still overstates screen-reader verification/exact Figma matching and retains old Lauren/Pillow/no-Figma-edit statements. Local transcript omits the donation paragraph and is excluded from the public site; use the existing event page for a public text alternative.
- Next: inspect the final launch image/video in platform drafts, then complete actual registration and screen-reader checks. Optional new promotion ideas should not hold up the existing launch kit. Prior Jekyll/media checks were not rerun; no site implementation changed. Applied the already-loaded `session-wrap` workflow while preserving other agents' notes.

## Promo reviews complete — 2026-10-01 (Codex, review only)
- Reviewed strategy, then visual assets/carousels and copy/launch readiness. Detailed findings and a suggested Bluesky launch are in `social-oct1/REVIEW.md`. Concurrent Claude changes to the plan, copy, and workshops-first PDF were preserved and incorporated into the review; the earlier keynote-order and daily-thread findings are fixed in that copy.
- Verified: rendered all eight PDF pages and all eight Figma frames (read-only); workshop PDF equals original slides 5–8; inspected 17 square posters and four countdowns; all 11 MP4s fully decode, sampled frames move, and their QR destinations are correct. Both PDFs have zero extracted text and no structure tree. Checked current post lengths (Spanish 296 graphemes) and public event facts/registration instructions. Jekyll 3.10 safe-mode build passed; `posters-oct1/`, `social-oct1/`, and `media-strat.md` are absent from output. `git diff --check` passed.
- Remaining: PDF Spanish label has approximately 1:1 contrast; presenter names/times are very small at phone width; Figma differs materially from the PDF and adds an unverified one-minute joining promise; credits are missing from several independently shareable slides. Copy still contains a PCD production note, incorrect PNG alt-text-preservation advice, and incomplete image descriptions. Day-of copy lacks a URL. See review for exact corrections.
- Stale docs: media-strat.md still describes the removed Lauren sentence, understates Figma differences, and records frame counts that do not match final MP4s. COPY.md incorrectly suggests LinkedIn lacks a post limit. Do not treat earlier review limitations below as current verification results.
- Unverified: actual platform uploads/re-encoding, continuous playback, end-to-end sign-up, screen-reader behavior, full Figma layer/font/variable audit, every poster size, print, and speaker image/tag permissions. Site browser regression suite not run; no application changes were made.
- Next bounded task: fix carousel contrast/readability and joining wording, synchronize the chosen Figma/PDF layout and credits, prepare explicit image descriptions/text equivalent, clean the remaining copy issues in REVIEW.md, then check platform draft previews. This review changed only REVIEW.md and this handoff; nothing posted, sent, committed, pushed, or deployed.
- Applied `session-wrap` from `/Users/saberkhan/.claude/skills.pre-shared-2026-08-02/session-wrap/SKILL.md`, replacing my obsolete review entry while preserving other existing project notes and uncommitted changes. No new durable project decision was made.

## Fixes from the asset/copy review (REVIEW.md) — 2026-10-01 (Claude, local, uncommitted)
- **Carousel rebuilt** as HTML (`social-oct1/carousel/slides.html`), printed to tagged PDFs with Chrome: 9 pages and a 5-page workshops-first PDF, real text, structure tree, `lang=en` (verified with pypdf; no screen-reader test). Larger presenter names and times, beginner workshops split over two pages, Spanish label dark on lime, "It takes a minute" removed, Luma-email step added, designer credit on every page, festival-hours line on the panel page. `carousel/TRANSCRIPT.md` is the text equivalent.
- **Figma** (`zcfrnWNC1Tyf81HiMeSC4y`) brought to the same 9-page layout and copy (read-only on Francisca's file; this is the separate editable file).
- **Copy:** production note out of the Processing post; share kit says PNGs do not carry alt text and gives descriptions; Bluesky launch uses the reviewer's wording; teaser video description; 13 workshop image descriptions; day-of posts have the registration link and a registered/not-registered split; Spanish spotlight shortened to 254 characters and labelled as festival hours; LinkedIn limit corrected to 3,000.
- **Assets:** countdown stills re-laid out with larger time and URL; teaser cover frame added (`videos/ccfest-teaser-cover-1080x1350.png`).
- Not done: the square speaker/session posters still favour the wordmark (needs the poster maker's v2 designs); platform draft previews, screen-reader and real registration tests; Sandra Soto's review of the Spanish post; the white-background Change exports. Nothing posted, sent, committed or pushed.

## Promo plan revised from Codex's review — 2026-10-01 (Claude, local, uncommitted)
- Applied the review's recommendations to `social-oct1/COPY.md` and `media-strat.md`: new working calendar; launch post leads with what people can make; Lauren's "She opens the day" removed; Oct 7 "10 days" post and the daily workshop series dropped; Oct 9 workshops post uses a new workshops-first PDF (`carousel/ccfest-2026-workshops-carousel.pdf`, slides 5-8); Spanish-language spotlight drafted (Sandra Soto should read it); joining reminders say the Luma email contains the Zoom Events link; Processing Community Day post carries the foundation's attribution sentence (the second one is adapted from a city-event wording and is Saber's to confirm); speaker/community share kit added (COPY.md §10). LinkedIn Event, starter pack and speaker videos deferred.
- Checked: Processing's promotion guide (tag the foundation, attribution sentences, no Bluesky handle given); every Bluesky post under 300 characters; `git diff --check`. Not done: nothing posted, sent, committed or pushed; the Figma carousel still has the original page order.

## Social media kit — 2026-10-01 (Claude, local, uncommitted)
- New `social-oct1/` (see its README): LinkedIn and Bluesky copy for Saber's voice (`COPY.md`), an 8-page LinkedIn carousel PDF, ten 6 s animation clips plus a 30 s teaser MP4 and GIF, four story countdown stills. Pages 1-4 of the carousel reuse `posters-oct1/`; clips come from `scripts/poster-clip-proof.cjs` against a build of the working tree. No site code or designer file changed.
- Counts: 13 workshops plus the panel (the register page lists 13; an earlier summary said 12 in error).
- Not verified: playback inside LinkedIn or Bluesky, speaker handles/permissions, which keynote opens. Nothing posted, committed, pushed or sent.


## Change on a white poster — 2026-10-01 (Claude, local, uncommitted)
- **Fixed in the poster maker:** Change on the White background no longer exports a pale grey ghost of two large Cs behind the chevrons. Host-side only. `poster-stage.js`: the capture keeps the canvas's clear colour on the layer as `clear`. `poster-art.js`: when the page is lighter than `clear`, `keyedForLight()` draws the layer as plain pixels, see-through exactly where the paper version shows nothing, with a 24-level ramp. `poster-maker.js` and Shristi's files are untouched. Also: new `scripts/verify-poster-white.cjs`; "Change on White" in `docs/POSTER-MAKER.md`; a `clear` note and three stale source-line links in `docs/poster-maker-v2/`; the warning about this quirk removed from the README that `scripts/export-posters.cjs` writes; `DECISIONS.md`, `GOTCHAS.md`.
- **Cause (measured; the reading was right):** the sketch clears with `#f5f5f2` at 15% per frame, and 8-bit rounding leaves old trails stuck at `#f2f2ef` (alpha 255) while never-stroked pixels sit at `#f5f5f2` (alpha 252). That is 12 apart, and `copyCanvas()` only keys out pixels within 10 of the corner colour, so 10.8% of the canvas stayed as pale pixels in the settled frame. `darken` hides them over paper (`#edede9`) and keeps them over white. Widening the tolerance would have changed paper (up to 6 levels at stroke edges in all 12 frames), so it was not done.
- **Baseline first** (Jekyll build of `git archive HEAD`, http-server, headless Chrome 154, macOS): `verify-poster.cjs` passed; `compare-poster-renderer.cjs` passed (864 renders, HEAD against HEAD); `verify.cjs` failed once at `scripts/verify.cjs:132` ("reduced motion should stop the canvas", a 150 ms wait) on a busy machine and passed 2 of 2 re-runs at low load. Cause of the one failure not diagnosed. Two earlier attempts were discarded because runs overlapped.
- **After** (real Jekyll build of the working tree): `verify-poster.cjs`, `verify-poster-white.cjs`, `verify.cjs` pass; `compare-poster-renderer.cjs` against `HEAD` passes (864 of 864 identical), and a negative control (reference with the footer rule one unit wider) fails 864 of 864; `git diff --check` clean. `verify-poster-white.cjs` also fails on the old build and on a half-applied fix (new capture, old renderer), and passes at 1x and 2x.
- **Paper unchanged, shown three ways.** (1) The same recorded frames drawn by the old and new renderer, all ten animations x 12 frames x portrait, Letter and thumbnail, on both backgrounds: nine animations identical on both; Change identical on paper, different on white; no layer outside Change gains a key. (2) The same recorded Change frames exported through the real Download button on the old and new build: paper PNGs byte-identical (sha256) at all six sizes; white differs (Letter 530,581 to 486,448 bytes). (3) The full `export-posters.cjs` run (216 PNGs, 117 s, none skipped): 152 files byte-identical to the Oct 1 export (Creativity, Creative Commons, the community flier, keynotes, sessions, panel); the other 64 are the eight animations that are random per run, and a second export from the unmodified build differs from Oct 1 in the same 64. Independent exports of Change can never match byte for byte, which is why (1) and (2) use recorded frames.
- **White is clean:** over 72 recorded frames (six pointer seeds) the old renderer drew up to 130,784 px of ink on white where paper has none (about 12.5% of the 1100 x 950 artwork, up to 22 levels under white); the new one draws 0 px farther than 2 px from paper's ink (at most 199 px, all stroke-edge rim), drops none of paper's ink, and leaves the interior of solid strokes unchanged. In the real white Letter and A4 exports, faint pixels more than 6 px from any ink went from 628,390 and 593,696 to 0. Looked at the Letter export at 1:1: only the pink and yellow shapes and their labels.
- **Cost:** a second copy of each frame the first time White is drawn, 16 MB per frame on a 2x display (4 MB at 1x; arithmetic, not a measured browser total), 20-40 ms per frame at 2x, so switching to White pauses about a quarter of a second while the twelve thumbnails are made.
- **Not verified:** Safari and Firefox (canvas rounding may stick at other levels; the ramp and dead band leave a margin, untested); a physical print; the one-pixel rim on stroke edges (up to about 10 levels greyer than a perfect cut-out; looked clean at 3x zoom, not measured); memory on a small machine. Not changed and unrelated: the white "10 years of" / "Change" label pills nick the chevron edge, as the paper-coloured ones do on paper.
- **`posters-oct1/` predates the fix:** its Change `-white` files (Letter and A4) still show the ghost. Regenerate with `NODE_PATH=$(npm root -g) node scripts/export-posters.cjs <base URL> posters-<date>` against a build of this tree if they are to be used.
- Nothing committed, pushed or sent. Next: Saber's approval to commit; the open Safari/Firefox check.

## Poster maker improvement plan — 2026-10-01 (Codex, documentation only)
- Added root `poster-maker.md` at Saber's request, consolidating the design/functionality plan and GIF/MP4 export proposal into 12 tasks with implementation suggestions, dependencies, and acceptance checks. Covers six visual directions, format-specific layouts, readable copy, editing, exact artwork/project saving, campaign export, print quality, animation feasibility, MP4, GIF, and verification.
- Added the plan to `_config.yml` exclusions so it remains repository documentation. Existing usage and historical planning guides are preserved. Proposed work is not recorded as an accepted architecture decision or implemented functionality.
- Verification: checked task structure, relative documentation links, exclusion entry, and `git diff --check`. No application implementation changed; export, browser, print, and animation encoding tests were not run for this documentation edit.
- Next: six-design contact sheet with actual public event content and existing designer artwork; run a two-mode animation capture/encoding proof early. No commit, push, deployment, or external message.
- `session-wrap` remains unavailable: its installed symlink is broken and no replacement SKILL.md was found under coding projects or the installed plugin cache. Handoff recorded here directly; existing unrelated changes preserved.

## Zoom Events exporter — 2026-09-28 (Codex, local only)
- Added host-owned `docs/zoom-export/` (offline HTML/CSS/JS editor, source snapshot, instructions), `scripts/build-zoom-export.cjs`, and `scripts/verify-zoom-export.cjs`. Existing `docs/` and `scripts/` Jekyll exclusions keep the tool out of the public site. No public page, designer file, commit, push, deployment, or external message changed.
- Read the supplied planning Doc, proposal Sheet (`Form Responses 1`, current-event rows 143–158), live registration page, local site data, and Zoom's official CSV guide. Includes 12 workshops, opening/closing keynotes, and the panel: 15 sessions / 18 speakers. Uses the updated Jessica title/description and full keynote names; includes Kofi's new proposal with an honest missing-description state. Tentative names outside the document's workshop list are excluded.
- Saber requested hypothetical scheduling by topic/location. Proposed six workshops in each round: round 1 Naoto, Blair, Julien, Kemi, Emily, Tristan; round 2 Matthew, Jessica, Shane, Sai, M DeNardo, Kofi. Blair is locked to round 1 by his form response; Naoto's early preference and Estonia location are documented. Other event-day locations are unconfirmed. Topic separations and remaining audience conflicts are shown in the editor/review file. Session types (Meeting workshops / Webinar plenaries) are editable assumptions.
- Portable editor and draft CSVs: `/Users/saberkhan/.codex/visualizations/2026/09/28/01a0e874-b4e1-7eb0-b540-ba39bbdf8d4c/ccfest-zoom-export/`. The 16 presenter emails are only in these private artifacts and temporary preparation files outside the repository. Keynote emails are missing; those two rows are omitted from the speakers CSV until entered. Saved plans omit contacts. Do not copy the portable editor or speakers CSV into the site.
- Verified: Node regression checks for roster/counts, six-per-round balance, locked availability, date/time conversion (Pacific/Eastern/Tallinn/UTC), CSV quoting/Unicode/formula protection, header matching/rejection, plan import/export/rejection, missing-email exclusion; separate Python CSV parser confirms 15 session rows and 16 valid-contact speaker rows; portable HTML has no external script/style dependencies; JS syntax and `git diff --check` pass. Checks do not assume a successful Zoom upload.
- Unverified: visual/browser workflow at 320/390/768/1440 (Chrome aborts at launch; CUA fails during initialization), actual Zoom account sample/import, capacity, and presenter acceptance of proposed rounds. Full `scripts/verify.cjs` was attempted but failed before browsing. No existing site implementation changed.
- Next: open the portable editor, review the hypothetical rounds, supply Daniel Shiffman/Lauren Lee McCarthy emails and Kofi's description, compare Zoom's downloaded samples, import into a draft event set to America/Los_Angeles, and manually link the three additional panelists. The public CSV guide does not document multi-speaker delimiters, so the panel row links Amy only and retains all four names in its description.
- Requested `session-wrap` skill was not found in accessible installed skill/plugin locations; this entry records the handoff directly.

## Done this session — 2026-09-15
- Codex integrated Francisca José Rodrigues’s Figma homepage (218:104) and event page (251:732) with Shristi Singh’s supplied interactive in the existing static site.
- Added local Anybody variable/italic and Overpass Mono fonts, original Figma SVG assets, designer credits, responsive styling, a motion pause control, and canvas lifecycle handling.
- Original designer folders remain untouched. Working files are uncommitted on `main`; nothing was pushed, deployed, or emailed.

- Preview correction: reused port 8765 showed an old Learning Machines homepage in the in-app browser despite correct HTTP responses. Moved both preview tabs to port 8876 and verified their visible CC Fest content.

## Done later — 2026-09-15 (Claude)
- Verified Codex's Figma typography against the live file: spacing/weight/style match; ink widths match Figma exports within 1px. Fixed event-page header logo size (13px → 16px, node 251:734).
- Added docs: `docs/TEMPLATE.md`, `docs/TYPOGRAPHY.md`, `AGENTS.md`, `CLAUDE.md` (imports AGENTS.md).
- Added inner pages `/events/`, `/past-events/`, `/mailing-list/`, `/code-of-conduct/`. Content sourced from ccfest.rocks, the existing homepage, and Saber's Aug 26, 2026 list email. Homepage nav now links to these pages. Page titles reuse Figma lettering via `scripts/sync-typography.cjs` (idempotent). `scripts/verify.cjs` covers all six pages.
- Checked in the in-app browser at desktop and 375px: one h1, no overflow, no broken in-page anchors, no duplicate IDs. `verify.cjs` not re-run (Playwright module not installed on this machine).

## Registration page rebuilt to updated Figma — 2026-09-15 evening
- Francisca sent the updated Register frame (251:732) by email at 22:35 UTC. `figma-to-html-registration (2)/` only contains the nav; the Figma file was the source.
- `register/index.html` now follows the new frame: date-rule hero ("________," run kept; h1 aria-label gives the spoken name), white fact values, keynote shape + two keynote cards, session row with tags, lime registration band with dashed embed box, blue half-circle (`assets/design/registration-shape.svg`), black history note, 16px footer logo.
- Unconfirmed speakers/sessions/registration use honest copy in those layouts, not Figma's bracketed placeholders. Keynote/speaker text uses Anybody rather than the leftover Syne / DM Sans / JetBrains Mono layers in the frame.
- Verified: lettering sync idempotent, other pages byte-identical; 1440px headless render compared with the Figma screenshot; no overflow, broken anchors, or duplicate IDs at 375px in the in-app browser.

## Docs and code cleanup — 2026-09-15 late
- Added `docs/UPDATING.md`: step-by-step for Francisca's Figma updates, Shristi's PR, confirmed event details, new pages, and the pre-publish checklist. README, AGENTS.md, TEMPLATE.md, and TYPOGRAPHY.md rewritten to point at it.
- `redesign.css` reorganised into ten commented sections with a map at the top. Merged duplicate rules (`.home-hero-title`, `.upcoming-copy h2`, `.hero h1`, event section headings), merged four media blocks into two, deleted dead classes left over from the pre-lettering markup (`.logo-cc`, `.event-cc`, `.event-fest`, `.narrow-e`, `.kern-u`, `.event-year`, `.event-virtual`, `.section-more`).
- `scripts/sync-typography.cjs` and `scripts/verify.cjs` rewritten with explanatory headers and comments; behaviour unchanged (sync output byte-identical; verify logic identical).
- Verified: all six pages pixel-identical before/after the CSS refactor at 1440px and 520px (homepage matches once its entrance animation settles — it is not repeatable mid-animation). Doc links all resolve. `git diff --check` clean.

## Figma export of the live site — 2026-09-15 late
- New Figma file "CC Fest — Live site export": https://www.figma.com/design/Y3V7lndexqkUZhtppXXE3a (file key `Y3V7lndexqkUZhtppXXE3a`, Saber Khan's team). Francisca's CCFest_21MAR2026 was not modified — the agent rule keeping it read-only still holds.
- Contains all six pages as 1440px frames, a "CC Fest tokens" variable collection (10 colours), shared Site header / Site footer components, and a READ ME frame stating the limits.
- Not reproducible in Figma: per-letter `wdth` values (API can't set variable font axes — nearest named styles used instead; per-letter spacing does carry over) and Shristi's ten-mode monogram (live p5.js/CSS; marked with a dashed slot).
- Unconfirmed content stays "to be announced" in the export, same as the site.

## Wide screens and scroll-to-the-animation — 2026-09-19 (Claude)
- Picking a word on the homepage now glides the animation band into view. The mode buttons sit *over* the artwork, so on a phone and on any short window the stage was half below the fold and the change you just asked for happened where you could not see it. Host-side, in `interaction.js` — Shristi's `animations.js` is untouched; the new block only listens for the same clicks.
  - Rests with the band centred, or its top at the top of the window when the band is taller than the window, so the words stay on screen either way. Does nothing when the band is already within 24px of that spot, so repeat clicks never nudge the page.
  - A wheel, swipe or key press cancels the glide at once. Arrow keys inside the tablist deliberately do **not** scroll: moving the page under a roving tablist is disorienting.
  - Under `prefers-reduced-motion` it jumps instead of gliding (verified in Playwright: settled within the first 120ms, versus a ~900ms ease normally).
- The page frame no longer stops dead at 1440. `--page-width` is now `clamp(1440px, 90vw, 2000px)` and `--page-pad` is 4.45% of it, so past the Figma frame the header, hero and every band widen together and stay aligned instead of stranding a 1440 column in the middle of a wide window. **Nothing at or below 1440 changes** — the clamp's minimum is the design width.
  - The hero wordmark and the blue half-circle are now sized from `--page-width` rather than a fixed ceiling (`.2778` and `.198` of it — the Figma ratios), so they keep their proportions as the frame grows: 400px type at 1440, 500px at 2000.
  - Guard: `.about-body > p` is capped at `55rem`. That column is already 876px (124 characters) at 1440, and without the cap the widened frame ran it to 196 characters at 2560. No effect at or below the design width.
- Verified with `scripts/verify.cjs` at 320/390/768/1440 (all ten modes, keyboard selection, reduced motion, offscreen suspension, the registration dialog, the no-JS fallback, no console errors), plus all eight pages at 1441/1680/1920/2560/3440: no horizontal overflow anywhere, and the header logo stays exactly one gutter inside each section's frame edge. `sync-typography.cjs` is a no-op. `git diff --check` clean.
- **Pre-existing, not from this change, and since fixed:** `verify.cjs` reported ten broken images on `past-events/` at 768px only. They are lazy-loaded posters that were merely `complete: false` when the check ran — they serve 200, no 404 reaches the response listener, and the same failure reproduced on unmodified `main`. The runs above used a patched copy that waits for lazy images; `05e1c50` has since fixed the script itself (see the entry at the end of this file).

## Open questions for Saber / Francisca (registration)
- White 20px fact values on orange (#ff4d2e) are about 3.3:1 contrast, below WCAG AA for text that size. Implemented as designed; consider ink text or larger/bolder values.
- History note lettering (251:850–852) has per-letter tweaks, but its variable-width values aren't exposed by Figma's API, so it uses plain CSS case/weight only.

## Open questions for Saber (new pages)
- Virtual CC Fest date: Aug 26 list email says Saturday, Oct 17 (backup Oct 24); pages still say "To be confirmed".
- Mailing list: the ccfest.rocks Squarespace form keeps failing ("Form submission error" emails Jun–Sep 2026). New page uses email signup; choose a real form service if wanted.
- ~~Code of conduct contacts copied from ccfest.rocks.~~ Resolved 2026-09-16: Saber says Marie is no longer involved and reports come to him. The page now uses `site.email` / `organizer.name` and drops the processing.org addresses. Open: no second contact for a report about the organizer himself.
- Past events: ccfest.rocks labels its Dec 8 NYC agenda "2022" but the URL and weekday point to 2019; new page says Dec 8, 2019. 2017/2018/2019 SF/2021 rows have no dates or agendas. Agenda links point to ccfest.rocks Squarespace pages, which break if that site is retired.

## Verified vs. untested
- Playwright with local Chrome: both pages at 320/390/768/1440px; no overflow, failed assets, broken anchors, duplicate IDs, hidden revealed copy, or browser errors. Desktop/mobile screenshots inspected.
- Ten mode selections, arrow-key navigation, canvas pause/resume, live reduced-motion changes, offscreen suspension, and no-JavaScript content fallback pass. JS syntax and `git diff --check` pass.
- Supplied Shristi index blob matches remote `10-years-origin` at inspection (tip `9cb772ee7fc9a12531a404a1773880d582f4227f`). No open PR was returned at inspection.
- Untested: Safari/Firefox, real mobile/touch devices, production hosting, checkout (not configured), exact designer approval of manual kerning.

## Open risks / known breakage
- ~~Shristi’s PR pending; three modes unfinished.~~ Superseded 2026-09-16: PR #1 merged on branch `shristi-pr-1` with all ten modes — see the last section.
- Event date, confirmed speakers/session details, and registration URL/Eventbrite ID are missing. Event page displays honest announcement states.
- Launch target in meeting notes is September 17; an email says October 17 and Shristi asks for clarification. Do not treat either as the event date.
- Installed session-wrap symlinks are stale; used the existing backup skill. No unrelated skill repairs made.

## Stale docs
- README and DESIGN-INTEGRATION.md updated. Parent PROJECTS.md lineage now records Mixed; remote Notion metadata was not changed.

## Jekyll + Pages CMS — 2026-09-15 (branch `pages-cms`, not merged, not pushed)
- Followed `docs/PAGES-CMS-PLAN.md` phases 0–3. Three commits on `pages-cms`; `main` and the live site are untouched.
- Phase 1: `.nojekyll` deleted, minimal plugin-free `_config.yml`, shared `<head>`/header/nav/footer in `_layouts/base.html` and `_includes/`; each page is now front matter plus its own `<main>`. Header and footer logos moved to `_includes/logo-*.html`, and `scripts/sync-typography.cjs` points there.
- Phase 2: event details, keynotes, sessions, the 16-row archive, the homepage badges, the Visible Java camp, and the site email/tagline/credits moved into `_data/*.yml`, rendered through `_includes/`. Announcement states are structural: an empty date, keynote list, session list or registration URL renders the honest layouts by itself.
- Phase 3: `.pages.yml` defines one form per data file. Lettering, layout and colour are not exposed to it.
- New doc `docs/CMS.md`; `docs/UPDATING.md` amended for the Jekyll build and the data files.

## Verified on that branch
- All six built pages **byte-identical** to the pre-change HTML at every phase, including after a simulated Pages CMS save (comments stripped, cleared fields written as `''` and null).
- Twelve screenshots (six pages at 1440 and 520) pixel-identical against a `git archive` of `main`; the capture is deterministic across runs.
- `scripts/verify.cjs` passes in full — four widths, ten monogram modes, canvas pause/resume, reduced motion, offscreen suspension, no-JS fallback, no browser errors.
- `sync-typography.cjs` a no-op on a second run; bracketed font filenames survive the build; `git diff --check` clean.
- Smoke-tested in a throwaway build that a date, a keynote and a registration URL propagate to all three pages and flip the announcement states — then reverted.

## Pushed, and checked against GitHub's own toolchain
- `pages-cms` pushed to origin on Saber's explicit approval. **This publishes nothing:** GitHub Pages is configured to build from `main` (`build_type: legacy`, source `main`), so a branch push triggers no deployment, and `main` is untouched.
- Built with the `github-pages` gem (v232 — the same dependency set GitHub runs, pinning Jekyll 3.10.0) in `--safe` mode: all six pages byte-identical, and the output file list matches the plain build exactly.
- That build exposed the default-theme fallback; `_config.yml` now has an empty `theme:` line. Both that and the UTF-8 locale requirement are in GOTCHAS.md.

## Untested on that branch
- The GitHub Pages deployment itself. It cannot run for this branch — Pages builds `main` only — so the first real deployment happens at merge.
- The admin UI at app.pagescms.org: the repository is not connected yet. That needs Saber's GitHub account.
- A real keynote card and a real session row have never been seen by Francisca — they only appear once those lists are filled.
- The "Registration is open." copy in the registration band is mine; there was no designed open state.

## Next task
Superseded — see “Next task” in the last section. Obtain explicit deployment instructions before publishing.

## Codex review of Pages CMS — 2026-09-15
- Reviewed `pages-cms` against `main`, including the working-tree configuration change. No implementation changes made during review.
- Findings: CMS values are interpolated without HTML escaping; keynote/session entries have no required core fields, so incomplete entries suppress announcement fallbacks; the registration box still hard-codes cost/format/level despite those fields being editable.
- Verified independently: `git diff --check main` passes. Inspected the schemas, data, templates, and lettering-script diff.
- Not independently verified: Jekyll build (Ruby gem access blocked in this session), browser checks (Chrome launch failed), and the connected Pages CMS save/rebuild flow. Claude's earlier pixel/build results remain reported results, not repeated checks.
- Next CMS task: fix these editor-input cases and test real form saves before merging. The requested session-wrap skill was unavailable in the installed skill locations searched; this entry records the handoff directly.
- **All three findings fixed in `fdd55fd`** (Claude, same day). The second one was not hypothetical: Saber's first real CMS edit left a session with a time and no title, which suppressed the announcement row exactly as Codex predicted.

## Pages CMS in real use, and the mailing list — 2026-09-15 (branch `pages-cms`)
- Branch pushed to origin on Saber's approval. **This publishes nothing:** GitHub Pages builds `main` (`build_type: legacy`), so the first real deployment happens at merge.
- Saber connected Pages CMS and made real edits: `date: 2026-10-17`, one keynote, one session. They arrived as three commits and render correctly. The CMS strips YAML comments on save, as expected.
- Hardening pass after that (`fdd55fd`): every editor value is escaped, incomplete keynote/session rows no longer suppress the announcement states, and the registration band follows the cost and level fields.
- Mailing list: EmailOctopus. Account "CC Fest" created by Saber; an inline form "CC Fest website sign-up" set up through the dashboard, with Google reCAPTCHA turned off on his instruction. `_data/site.yml` carries `embed_form_id` / `embed_host` / `signup_url`, and `.pages.yml` exposes all three.
- **Their embed is a script tag, not the HTML form their older docs describe.** A first implementation built a hand-rolled POST form against `eomail5.com/form/<id>`; that was replaced once the real snippet was read, because the endpoint is undocumented and a plain POST lands the visitor on raw JSON. See `docs/MAILING-LIST.md`.

## Verified on the branch
- Built pages byte-identical to the pre-change HTML at every phase, including with every data file rewritten the way Pages CMS writes it, and under the `github-pages` gem (v232, pinning Jekyll 3.10.0) in `--safe` mode.
- Twelve screenshots pixel-identical; `verify.cjs` passes in the unfilled, filled, and mailing-list-configured states; `sync-typography.cjs` a no-op; `git diff --check` clean.
- Escaping tested with hostile input: `Ada & Grace <Lovelace>` renders as text, a quote in a URL does not break out of the href, an injected `<script>` is inert.
- The sign-up form renders in the panel, carries its email field and spam trap, and falls back to the email instructions with JavaScript off.

## Open, all needing Saber
- **A real test sign-up has never been watched arriving.** Not done deliberately: it sends a confirmation email from his account. Until then the mailing list is untested in the way that matters.
- Double opt-in is untouched (a list-level setting, not part of the form). Recommended.
- The Squarespace subscribers are not exported. If ccfest.rocks is retired first, that list is the one unrecoverable thing here.
- `..` placeholders sit in the keynote and session entries on the branch and would go live at merge.
- Whether October 17 is real. If it is, the hero lettering still shows Francisca's `________,` beside it and needs the `design/figma-typography.json` step.
- An empty `.pages.yml` was committed to `main` by Pages CMS (`cd84b0e`) when it was first connected there; it will collide with the real one at merge. Trivial to resolve, but resolve it deliberately.

## Shristi’s PR #1 merged on a branch — 2026-09-16 (Claude)
- Reviewed https://github.com/saberkhan372/ccfest-redesign/pull/1 (12 commits, all ten modes) and her screen recording `Screen Recording 2026-09-16 at 2.01.21 AM.mov` (60s, every mode in turn). The other recording in the folder, from 2026-09-13, is an unrelated Moog synth project.
- Her branch starts before Jekyll/CMS; her PR suggests reverting `main` first. Not done. Instead a real merge on local branch **`shristi-pr-1`** (not pushed), so her commits and authorship are kept and GitHub closes PR #1 when this reaches `main`.
- Her six files (`animations.css`, `animations.js`, `change-sketch.js`, `celebration-confetti.js`, `creativity-scribble.js`, `coding-power.js`) are **byte-identical** to the PR. Every host need moved out of her files, unlike the provisional integration, which had patched `animations.js` and `change-sketch.js`.
- `index.html`: her stage markup, plus host parts (section label and initial mode, `role="tab"` for her `aria-selected` tabs, `aria-hidden` artwork, starting label “Creativity” not her “Curiosity”, pause button). `_layouts/base.html` loads her three new scripts.
- `interaction.js`: now owns the p5 lifecycle her new sketch dropped (stops when paused, offscreen, hidden, or another mode; adds `canvas-ready`) and pauses the SVG `<animate>` wobble.
- `redesign.css` §7: removed the desktop height and monogram-size overrides — her note asks that the 95dvh stage not be clipped. Added: `width:100%` (her `100vw` overflows), `mix-blend-mode: darken` on the Change canvas (her `#f5f5f2` clear colour would show as a pale box on `#edede9`), full-size Connection layer (it sat under the mode buttons on phones), paused confetti hidden, paused scribble shown finished.
- `scripts/verify.cjs`: tabs, scribble load, canvas mount, confetti and SVG-animation pausing.

## Verified
- `verify.cjs` passes in full against the Jekyll build (`--safe`, Jekyll 3.10 via ruby@3.4): six pages at 320/390/768/1440, ten modes, arrow keys, pause/resume, reduced motion, offscreen suspension, no-JS, no browser errors or failed requests.
- The five inner pages build **byte-identical** to `main`.
- Screenshots of every mode before/after its interaction at 1440, 1280, 768, 390 and 320px compared with her recording; Change-mode stage pixels equal `--paper` exactly; no-JS, reduced-motion and reduced-motion Change states inspected.
- Confirmed with a test: in Celebration, pressing anywhere on the page (e.g. the event band below the stage) fires confetti and turns the Cs. Her code, not fixed; reported to her.

## Not verified
- Safari, Firefox, real phones and touch. Hover-only modes (Connection, Community, Curiosity, Coding) have no touch or keyboard trigger.
- The live GitHub Pages deploy: nothing pushed.

## Open, needing Saber / Shristi / Francisca
- **Type and colour of the mode buttons and labels.** Her PR and recording use Libre Caslon pills and a grey mode name; the site keeps the earlier host choice of Anybody, square buttons, blue active, ink label (her grey is ~1.8:1 contrast). Undo by deleting the `.mode-btn` / `.cc-text` rules in `redesign.css` §7.
- **Phone stage height** stays at 540px (§9). Nothing crops at 320/390, but she asked for no clipping; her 95dvh would make it a full phone screen.
- Review notes for Shristi (not posted anywhere): document-wide confetti listeners; `change-sketch.js` never stops its loop; `#ccCopyright` symbol removed but still referenced; debugging outline and `100vw`; hover-only interactions; unhandled rejection if a scribble fetch fails; unused assets (`CC.png`, `cc-copyright.svg`, `scribble-1/2.svg` ≈ 610KB, 10 of 11 Caslon files).

## Published
- Saber reviewed and approved on 2026-09-16 (“looks good. commit and push”), keeping the current button/label typography and the 540px phone stage. `main` fast-forwarded to `shristi-pr-1` and pushed; GitHub Pages deploys `main` to https://saberkhan372.github.io/ccfest-redesign/.

## Next task
Send Shristi the review notes above (confetti listeners first). Check the live homepage on a real phone and in Safari.

## Independent preservation review — 2026-09-16 (Codex)
- Compared merge `9227497` against its first parent `7c3c78d`. Homepage source outside the interactive section is byte-identical. All five inner-page sources, shared includes, Figma typography data, design assets and Anybody/Overpass font files are unchanged. Host CSS changes are confined to the interactive; base CSS removes its old placeholder rules.
- All six Shristi-owned CSS/JS files match PR head `aef1c20` byte-for-byte. GitHub confirms PR #1 merged, and the Pages workflow for current HEAD `e667d30` succeeded.
- Retrieved and inspected Francisca's current homepage and Register Figma screenshots. Existing integration differences remain: desktop interactive uses 95dvh; phones use 540px; mode controls retain the approved host styling; history-band lettering is still an approximation. October 17 is already in both event data and the generated title; older blank-date/placeholder notes above are stale.
- Independently verified typography generation matches all eight target files using intercepted writes (no source changes), homepage preservation, file comparisons, and clean `git diff --check` before this note.
- Not independently verified: rendered visual fidelity, four-width browser checks, motion tests, fresh Jekyll build, or the video. Playwright is available but Chrome aborts on launch in this sandbox; the computer-use runtime also failed to initialize. Earlier Claude browser results remain reported results, not repeated checks. Web retrieval of the deployed pages failed; deployment success is confirmed through GitHub.
- No site code changed, committed, pushed, or published by this review. The session-wrap skill was not found under the installed skill/plugin locations; recorded this handoff directly.
- Next: compare deployed homepage/Register visually with Francisca at desktop and phone sizes, especially the taller interactive and existing history-band typography limitation.

## Luma registration and donations — 2026-09-16 (Claude, branch `luma-registration`, uncommitted)
- Saber wants to stop paying for Eventbrite and still take donations. Compared Luma, a site form (EmailOctopus + Ko-fi) and Humanitix; **Saber chose Luma**. Reasons and prices (checked 2026-09-16) in `docs/REGISTRATION.md` and DECISIONS.md.
- New CMS fields in `_data/event.yml` / `.pages.yml`: `luma_event_id` and `donation_note`. `donation_note` is pre-filled from his Sept 2025 wording (Zoom license, stipends for presenters and keynotes). It shows only once registration is open. **Confirm it still holds.**
- `register/index.html`: when open, the donation note plus a Register link. With a Luma id, the link opens a native `<dialog>` loading `luma.com/embed/event/<id>/simple` (new host file `registration.js`, styles in `redesign.css` §5). Without JavaScript it links to Luma.
- `scripts/verify.cjs` tests the popup when an id is set and prints SKIP otherwise.
- **Luma event created 2026-09-16 on Saber's approval:** "Virtual CC Fest 2026", Sat Oct 17, 9:00am–12:30pm PT, public at https://luma.com/ascrcgll, id `evt-Ex8pvBo4PmxsrzG`. Schedule from Drive doc "Virtual CC Fest - October 17, 2026"; cover is a 1080px screenshot of Shristi's Creativity mode. Both values are now in `_data/event.yml` on this branch.
- Stripe linked by Saber (Luma shows the account "ccfest.rocks", status "Incomplete — pending verification" at 07:37 PT). Ticket "Standard" is now Paid → Flexible Pricing, suggested $10 (Saber's choice), minimum 0. The public embed shows "Suggested Donation $10.00 · Pay what you want". Guest-side $0 checkout not tested, to avoid registering a real guest.
- Still open on Luma: no location. Saber will send the Zoom Events link.

## Verified
- Unconfigured build: all six pages **byte-identical** to the baseline. Only `redesign.css` and the new `registration.js` differ. `verify.cjs` passes (the popup check SKIPs). Sync script is a no-op; `git diff --check` clean.
- Throwaway build pointed at a stranger's public Luma event, with a pasted snippet as the "id": the value is escaped and the id extracted. `verify.cjs` passes in full, including opening, Escape, and focus returning. Luma's form rendered in the popup at desktop and 375px, where the popup fills the screen. Closing returns focus, with no page overflow. Nothing was registered.

## Not verified
- The real event in the popup: loads and `verify.cjs` passes against it. Not yet: donation ticket, Stripe payout, Zoom link, confirmation email.
- Whether Luma accepts a $0 minimum on a flexible ticket (docs don't say; the fallback is two ticket types).
- Safari/Firefox and real phones for the dialog.

## Published
- Saber reports Stripe verified and a location added in Luma (2026-09-16). He asked for registration on the site ("can you add registration to site?"). Committed on `luma-registration`, fast-forwarded `main`, pushed.

- Pushed as `0c0d03b`; GitHub Pages built it ~2 min later. On the live site, /register/ Register opens the dialog with the real event ("Suggested Donation $10.00 · Pay what you want").
- Luma registration now has an optional, unrequired checkbox question: "Add me to the CC Fest mailing list for news about future events (optional; unsubscribe anytime)". Luma doesn't sync to EmailOctopus: export guests from Luma, import only those who ticked it.

- Saber saw the live dialog unstyled and tiny. Cause: a stylesheet cached from before the deploy (the live CSS was correct). Fix: `?v=<build revision>` on local CSS/JS in `_layouts/base.html` and on `registration.js`. Dialog widened to 1000×900 max. `verify.cjs` passes on a build with a simulated revision; local builds are byte-identical except `redesign.css`. Dialog screenshots at 1440 and 1024 checked.

- Code of conduct now credits its author, linked to https://marieflanagan.com/about/. Saber confirmed the name "Marie Claire Flanagan" (her page shows "Marie LeBlanc Flanagan"; Saber chose the former).
- Pushed on Saber's instruction ("commit all and push").

## Shristi's feedback, 2026-09-16 (meeting with Saber; the AI notes call her "Christy")
- **Pause button removed** (index.html, interaction.js, redesign.css §7/§10, verify.cjs). `prefers-reduced-motion` still stops the canvas and SVG wobble and hides confetti/scribble draw-in. See DECISIONS.md.
- **Floating "Upcoming" reminder** on every page while `registration_url` is set: `_layouts/base.html` plus new `event-banner.js`. Links to the registration section, Hide lasts for the visit (sessionStorage), steps aside while #registration is on screen, and removes itself 2 days after the event date. Footer gets bottom padding so it never covers the credits (verify checks this at 4 widths × 6 pages).
- **Responsiveness:** found two jumps, fixed both. (1) At ≤650px the mode labels jumped from inside the Cs to the stage's bottom corners, far from the art; now each sits 8px under its C, centred (measured 320–650 in Creativity and Creative Commons, inside stage, no collision). (2) The hero half-circle snapped from 180px to 65px at 900px and overlapped the tagline at 651–768 when unpinned; now it scales smoothly and stays clear. It also covered "coding" at 320px, pre-existing, fixed with hero bottom padding. Shristi's "custom positioning" in her own branch may supersede (1).
- **p5 performance (measured, Playwright/CDP, 1440×900):** page script ≤14 ms/s at normal CPU (Change mode, the busiest), ≤30 ms/s at 4× CPU throttle. Moving the mouse outside the stage costs no more than inside or idle. Scrolled away, the canvas stops (~2 ms/s). Load: one 136 ms long task at 4× (parsing p5, 249 KB gzipped). 32 rapid page loads: no errors, one canvas, looping correctly after.
- **Mouse scoping:** not changed. No performance case. Doing it means editing Shristi's files (confetti listens on `document`; change-sketch reads p5's window-wide `mouseX`), so it's hers to decide in her new branch.
- Not done by agent: Saber's editorial paragraphs per mode, Shristi's new branch, post-fest redesign.

## Sessions and panel filled in — 2026-09-16
- From the session-proposal sheet rows Saber pasted (the Drive export of that tab was truncated): a Panel discussion (Amy B. Woodman, Daniel Schneider, David DeLiema, Adrienne Gifford) at 10:30–11:00 am PT / 1:30–2:00 pm ET, from the Drive schedule doc, and four sessions with no time yet ("Time TBA"): Shane Curry, Kemi Ukadike, Jessica Valarezo, Naoto Hieda. Kemi's is her 9/11 submission, "Access Is the Interface"; an older sheet row has a different session.
- `_data/sessions.yml` schema changed: `presenters` list (name, pronouns, photo, url, bio) plus `resource_url`; `presenter`/`presenter_bio` are gone. `.pages.yml` form updated to match. Bios fold under the description.
- Photos: `assets/people/*.jpg`, 400px squares with metadata stripped (Daniel's source is only 128px). Jessica sent no photo, so her initial is shown. Descriptions and bios are as submitted, including emoji and markdown-style asterisks.
- Open: which round (9:30 or 11:00) each session is in; a panel title/description; keynotes still empty.

## Schedule, keynote, history note — 2026-09-16 (Saber's answers)
- Kemi's newer session confirmed. Panel description is coming from Saber; no push yet.
- Session times removed (data, template, CMS form). New **01 Schedule** section on /register/ from the Drive doc: Pacific and Eastern columns rendered at build time (`_includes/time-range.html`), plus `schedule.js` adding a "your time" column and time zone picker (defaults to the visitor's zone, remembers the choice, names the date when it isn't Oct 17 there). The plain h2 "Schedule" has no Figma lettering — flag for Francisca. Sections renumbered 01–04.
- Keynote: Lauren McCarthy (https://get-lauren.net/), bio taken word for word from sentences of her official bio at get-lauren.net/Info. A second "to be announced" keynote card stays, since the schedule has opening and closing keynotes.
- History note: "at NYU ITP" → "in New York City" on /register/ and the matching sentence on /past-events/.
- Verified: build; all five rows match the doc (PT and ET); verify.cjs passes including new schedule checks (Tokyo default, zone switch, no-JS); spot checks for Kolkata/Chicago/Auckland/Kyiv; screenshots at 1440 and 390.

## Next task
Add the Zoom Events link in Luma when Saber sends it. Before the event, import mailing-list opt-ins from Luma into EmailOctopus. Register once through the live popup (Saber, with his own details) and confirm the email arrives. Send Shristi the earlier review notes.

## Final nav and content updates — 2026-09-16 (Claude, branch `final-updates`, uncommitted)
- **Register in the main nav**, first item, on every page that uses `nav-main` (the register page keeps its own in-page nav).
- **Visible Java page** at `/events/visible-java/`, adapted from ccfest.rocks/visible-java. The orange facts band, eyebrow and summary come from its entry in `_data/camps.yml`. The rest of the copy is written into the page. The Events card now links to it; `event-card.html` opens full `https://` links in a new tab and treats anything else as a page on this site. Interest list links to the same Google Form ccfest.rocks embeds (a link, not an iframe).
- **Past Events: new "Camps and classes" section** from `classes` in `_data/past_events.yml` (CMS form added): Learning Machines (Summer 2026), Coding Camp (Spring 2026), Teacher Camp (Fall 2025), Spring 2025, Teacher Camp (Fall 2024). Sources: ccfest.rocks/learning-machines and /teacher-camp-fall-2024. Sections renumbered 01–03.
- New styles in `redesign.css` §6 (host-side). `verify.cjs` PAGES includes the new page.
- Verified: `jekyll build --safe`; only the nav, the Events card, Past Events, `redesign.css` and the new page differ from the baseline. In the in-app browser, all 7 pages at 320/390/768/1440 have no overflow, one h1, no duplicate IDs or broken in-page anchors, and no console errors. Screenshots at 1440 and 390 checked.
- Not verified: `verify.cjs` (Playwright not installed here), Safari/Firefox.
- Open: the Spring 2026 class links to a `notion.so` page, which may need a Notion login (the others are public `notion.site` pages). The Spring 2025 camp's name isn't on ccfest.rocks, so it's listed as "CC Fest camp, Spring 2025". The new page has no Figma lettering for Francisca to review.

## Keynote photo — 2026-09-16
- Pushed earlier today: `5d35d86` (Register in the main nav, Visible Java page, Camps and classes) together with the unpushed register commits `60ad477` and `f5a8477`.
- Keynote renamed "Lauren Lee McCarthy" (Saber). The "Shared curiosity" to-be-announced card is gone; her portrait takes that spot. Saber supplied the file `assets/people/lauren-lee-mccarthy.jpg`; it matches the portrait on get-lauren.net/Info (its file name there suggests the photographer is Barak Shrama; no credit shown yet). New optional `photo` field on keynotes (data, `_includes/keynote-card.html`, `.pages.yml`); CSS crops the landscape image to 4:5.
- Verified in the in-app browser: photo loads, no overflow at 320/390/768/1024/1440, screenshots at 800 and 390. Not committed.

## ccfest.rocks cutover — 2026-09-17 (Claude)
- ccfest.rocks now serves this repo: `CNAME` file pushed; Namecheap A records → GitHub Pages (185.199.108–111.153), `www` CNAME → saberkhan372.github.io. MX/SPF email forwarding untouched. `verify.squarespace.com` CNAME left in place (harmless; delete once the domain is removed in Squarespace).
- HTTPS: no certificate after ~1 hour, so the custom domain was cleared and re-saved via the Pages API (GitHub commits "Delete CNAME" / "Create CNAME"). Certificate for ccfest.rocks + www approved within a minute (expires 2026-12-16, auto-renews); "Enforce HTTPS" is on.
- Old Squarespace site stays reachable at https://saber-khan-hp7r.squarespace.com — agenda and photo links in `_data/past_events.yml` and `past-events/index.html` point there. Raw HTML snapshots of those pages: `../ccfest-squarespace-archive/`. Cancelling the Squarespace plan breaks those links.
- Past events: 24 events, each backed by at least two of: Drive "CC_Fest_Complete_History_All_Events", Notion "Complete CC Fest Chronicles" and "CC Fest Events" database, old Pictures page, Processing forum announcements. Links go to forum posts, Medium, ITP news, or Aug 2021 slides where no agenda exists. Left out as unsupported: Notion-only rows LA 2017 (Jan 1), NYC Oct 2017, SF Jun 2018, NYC Oct 2018, LA Mar 2019, NYC Oct 2019. Homepage chips not changed. Open: PCD listing (processing-community-day#214) says Oct 26, site says Oct 17.
- Announcement bar: `_data/site.yml` → `announcement` (CMS form "Site details") prints a lime strip above the header on every page except its own target; now links to Visible Java. Styles in `redesign.css` §3. Checked in a `jekyll build --safe` at desktop and 320px (no overflow).

## Production review — 2026-09-17 (Codex, read-only)
- Reviewed https://ccfest.rocks plus the current workspace. No site code or content was changed, committed, or pushed. The untracked media/config files were left untouched. An `index.html` edit visible at the start of the review was not touched here and was no longer present in the final worktree status.
- Production `scripts/verify.cjs` passes all seven pages at 320/390/768/1440: assets, fonts, anchors, overflow, all ten monogram modes, keyboard selection, reduced motion, offscreen canvas suspension, event reminder behavior, schedule time-zone switching, Luma dialog, no-JS fallback, and browser errors/failed requests.
- All currently linked external HTTP(S) destinations returned successfully or were confirmed in a browser, except `https://adriennegifford.com`: its GitHub Pages origin responds, but HTTPS fails certificate hostname validation. Do not replace it with plain HTTP; remove the link or ask Adrienne for the correct secure URL.
- High-priority polish findings:
  1. `_includes/nav-event.html` links Keynotes, Sessions, and Registration but omits the new `#schedule` section.
  2. Event-page body text hard-coded as `#787873` on `#f4f4f1` is about 4.03:1, below WCAG AA for normal text; the existing white fact values on orange are about 3.31:1. `--muted` (`#62625e`) and ink on orange both pass.
  3. The ten interactive mode controls use ARIA tabs without associated tabpanels. Treat them as pressed buttons/radio choices, or add real tabpanel relationships.
  4. The shared `<head>` has no canonical URL, Open Graph/Twitter preview metadata, or Event JSON-LD. This weakens link previews and event discovery now that the custom domain is live.
  5. Event cards still say “join the mailing list for updates” although registration is open; the copy should follow `registration_url` structurally.
- Secondary polish: at 390px the header links are 33px high and mode buttons 35px high. They clear WCAG 2.2's 24px minimum but fall short of the more comfortable 44px touch-target convention. The desktop header/announcement type is visually quiet relative to the very large hero.
- Still unverified by this review: a real EmailOctopus subscription, a real Luma registration/confirmation email/payment path, Safari/Firefox, and real touch hardware.

## Accessibility and metadata fixes — 2026-09-17 (Claude)
- Host-side (`redesign.css`, `_layouts/base.html`, `_includes/nav-event.html`, data/pages): eight `#787873` text rules now use `--muted` (5.56:1 on the event page); phone header links are 44px tall; event nav gains "Schedule" when the schedule has items; Adrienne Gifford's link removed (her custom domain serves GitHub's `*.github.io` certificate over HTTPS); homepage/Events copy says "registration is open" when `registration_url` is set.
- `_config.yml` now has `url: https://ccfest.rocks`. Every page gets a canonical link, Open Graph and Twitter tags; the Register page gets Event JSON-LD built from `_data/event.yml` + `_data/schedule.yml`. Share image `assets/ccfest-share.png` (1200×630) is a headless-Chrome screenshot of the homepage hero (lettering, rule, tagline, blue half-circle) with header, banners and modes hidden; set in `_data/site.yml` → `share_image` (CMS: Site details). `assets/ccfest-social.png` is the old wireframe and is unused.
- Needs others: Francisca — white event facts on orange are 3.31:1 (ink would be 5.36:1). Shristi — mode buttons are `role="tab"` with no tabpanels (should be `aria-pressed` buttons; `animations.js` sets `aria-selected`), and they are 35px tall on phones. Adrienne — enable HTTPS on her GitHub Pages domain, then restore the link. Francisca — a designed 1200×630 share image to replace the screenshot.

## Homepage mailing-list strip now carries the sign-up form — 2026-09-17 (Claude)
- The lime strip on the homepage used to print the "send an email with the subject line Join mailing list" instructions. It now shows a smaller copy of the `mailing-list/` sign-up: one line of copy, EmailOctopus's email field and Subscribe button capped at 340px, their required "Powered by EmailOctopus" line, and a link through to `mailing-list/` for what the list covers.
- Same three states as the full page (`docs/MAILING-LIST.md`): the embedded form when `embed_form_id` is set, a hosted EmailOctopus link when only `signup_url` is, and the original email instructions when neither is. `<noscript>` falls back to the email instructions.
- Host-side files only: `index.html` and `redesign.css` (§4 for the smaller sizing, §6 where the shared EmailOctopus overrides now name `.mailing-section` as well as `.signup-panel`). Shristi's and Francisca's files untouched; the reveal still uses her `.anim-scroll`.
- Verified in the in-app browser at 320/390/768/1440: no horizontal overflow, field and button fit (the button wraps under the field at 320), no console errors, one form instance, the scroll reveal still fires, and `mailing-list/` renders exactly as before (420px embed, 16px field). `jekyll build` output differs from `main` only in `index.html` and `redesign.css`; `sync-typography.cjs` changes nothing; `git diff --check` clean.
- Not verified: a real subscription from the homepage form — submitting one would add a live subscriber, so that test is Saber's. Playwright is still not installed here, so `scripts/verify.cjs` did not run.

## Interim stage separation — 2026-09-19 (branch `stage-separation`, local only, not committed)
- Answering Shristi's Sept 16 note that the mode buttons read as part of the hero. Host-side only: `redesign.css` §7 gives `.anim-stage` a darker band (`#e2e2dd`, below her Change sketch's `#f5f5f2` so the darken blend shows no box) and adds a backed caption; `index.html` adds `<p class="stage-intro">` ("Ten years of creative coding · pick a word"; phones drop "of creative coding"). Hidden without JS, like the buttons.
- Checked in the browser at 320/390/768/1440: caption one line, no overlap with buttons or monogram, no horizontal scroll; Change, Creative Commons and Coding modes look right. `verify.cjs` not run (Playwright not installed). `git diff --check` clean.
- Needs: Saber's OK on the caption wording; Francisca to pick the band colour; Shristi's own canvas text/background replaces this when it lands.

## Poster-maker planning — 2026-09-19 (Codex)
- Added `docs/POSTER-MAKER-PLAN.md`: proposed template-based maker using the current identity and existing Jekyll/static stack, with announcement, keynote, and workshop variants; print/social presets; export proof, implementation phases, and acceptance checks. Planning only; no posters or application built, no commit/push/deployment.
- Verified the current public event page against local event/schedule/keynote data: October 17, free/online, 9:00 am–12:30 pm Pacific, Lauren Lee McCarthy and Daniel Shiffman. Read actual CSS/font assets and existing ownership/typography guidance.
- Historical Squarespace gallery and indexed image descriptions were available; original poster image fetches failed. Browser inspection could not start. A visual review of archive originals remains part of Phase 1.
- Git status/diff checks could not run: system Git reports missing developer tools. No site implementation files or designer sources were changed. The requested `session-wrap` skill was not found in available skill/plugin locations; this entry provides the handoff directly.
- Next: implement the design/export proof first—1080 × 1350 announcement PNG and Letter PDF—then validate font fidelity, readable registration details, and QR before expanding the editor. All proposed design/architecture choices remain proposals.

## Poster-maker p5.js revision — 2026-09-19 (Codex)
- Saber requested p5.js and ideas from p5js.org. Updated `docs/POSTER-MAKER-PLAN.md` with linked Noise/Bezier, Connected Particles, Shape Primitives, and Kaleidoscope inspirations; proposed Creative currents, Connections, Celebration, and later Shared patterns artwork modes.
- Replaced the SVG-first export proposal with an isolated p5 P2D renderer, logical-coordinate seeded geometry, final-size graphics buffers, PNG download, and a raster-image print/PDF workflow. Added reproducibility, typography, memory, accessibility, source-credit, and version-compatibility checks.
- Verified official documentation and example descriptions, plus the existing local asset header (p5.js 1.9.4). No runtime or export tests: this remains a documentation-only update. Site implementation and designer-owned files remain untouched.
- Next: prototype Creative currents with three saved seeds, a 1080 × 1350 PNG, and a Letter PDF proof. The requested session-wrap skill remains unavailable; handoff recorded here.

## Old-site posters and Zoom Events guide — 2026-09-19 (Claude)
- Past Events: new **02 Posters** grid (Camps 03, Organize 04; tinting swapped to keep alternation). 19 posters/fliers from the old Squarespace Home and Past Events pages, one per event, matched by the text on each poster, resized to 720px WebP in `assets/posters/` (~1MB). Data: `poster`, `poster_alt`, `poster_credit` on `events` rows in `_data/past_events.yml`, editable in Pages CMS. Credits only where the old site gave them (Theo Chan, NYC Jan 2023; Katie Chan, June 2022). Two alternate 2017/2018 NYC versions skipped. The LA 2017 row now reads Sep 23, 2017, from its poster.
- /register/: new **05 How to join on the day** (Zoom Events steps, text only, from the old zoom-events-guide page; help email is `site.data.site.email`, not the old Processing Foundation address). Step 1 says the Luma confirmation email links to Zoom Events, which is true only once the Zoom Events link is set as the Luma location.
- Checked at 320/390/768/1440: no horizontal scroll, all 19 posters load, grid 2 columns on phones. `verify.cjs` not run (no Playwright).
- Follow-up (same day): 3 more posters from Saber's Drive and the Wayback Machine: NYC MAGNET Apr 23, 2017 (row now dated from the poster), SF Oct 19, 2019 (Pages file preview), LA Oct 27, 2019 (archived ccfest.rocks/los-angeles, Oct 2019). Credits added from Gmail: Francisca José Rodrigues (Mar 2026, her "B version"), Keren Megory-Cohen (LA 2019). Saber confirmed LA 2017 = Sep 23, 2017. Still no poster found for Oct 2016 or NYC May 2018. Unconfirmed credits, not added: Joo Park (Mar 2023 graphics), Shristi Singh (2024/2025 posters). Google Photos not searchable from this session.
- Follow-up 2: Mar 25, 2023 poster swapped from the schedule graphic to Joo Park's main poster (Drive "virtual cc fest - march 25 - Event_Graphics", poster_image_vertical.png); credits added for Joo Park (Mar 2023) and Shristi Singh (Jul 2024, Mar 2025; Saber confirmed, and Gmail shows her Mar 2025 keynote poster work). Sep 2025 credit not added: no email or Drive evidence found. NYC Jan 2024 keeps the schedule graphic: Drive has only keynote/workshop promo graphics, and the flier was shared from Saber's Dalton account, which is not connected.
- Follow-up 3: credits for Shristi Singh (Sep 2025, Saber confirmed), Qianqian Ye (Jan 2022; Gmail Jan 13, 2022: Saber chose her design and she made 5 colour versions) and Jolina Kitaji Clement (Jul 2020; Gmail Jul 7, 2020: "Jolina made a flyer and animation"). skhan@dalton.org mail is not in this Gmail, so the NYC Jan 2024 flier is still missing; the May 2018 flier exists only as an attachment to Saber's Apr 19, 2018 email (the connector cannot download attachments). No 2016 poster found. 2017–2019 posters appear to be Saber's own Pages files, so no credit.
- Follow-up 4: May 5, 2018 NYU MAGNET poster added (keynotes Ari Melenciano and Jenn Schiffer), from the PDF Saber saved from his Apr 19, 2018 email to Sofia Garcia; rendered with PDFKit. 23 posters now. NOTE: another agent's uncommitted poster-maker work (nav, base layout, redesign.css, poster-maker/) is in the working tree and is not part of this branch.

## p5 poster maker — 2026-09-19 (Codex, local implementation)
- Built `/poster-maker/`: three original p5 artwork modes (Creative currents, Connections, Celebration), announcement/keynote/community templates, six social/print sizes, four colorways, bounded controls, saved seeds, local draft/preset import/export, registration QR, caption/alt text, PNG download, and a Letter/A4 print/PDF view.
- Host-owned additions: `poster-art.js`, `poster-maker.js`, `poster-maker/index.html`, `assets/poster-maker/`; integration in `redesign.css` §11, conditional scripts in `_layouts/base.html`, shared navigation, and verification scripts. Existing local p5 1.9.4 and all designer-owned code/source files are unchanged. Wordmark outlines were generated from the existing font/runs; ink width 875px vs. the recorded 874px reference. Francisca's review remains open.
- Event facts are serialized from the existing YAML at build time. Preset imports are validated, overflow blocks export, drafts never update site data, and render/export geometry uses identical logical coordinates and seeds. No new runtime packages or project package manifest.
- Added `docs/POSTER-MAKER.md`, updated the plan, and provided `docs/previews/ccfest-poster-maker.html` as a self-contained local review copy with embedded assets and public event-data snapshot. Adjacent PNGs show three saved variations and a nine-design contact sheet. `docs/` remains excluded from Jekyll output.
- Verified: syntax; 216 native Canvas2D renders across templates/sizes/modes/colorways using the actual p5 math functions; seed replay, invalid preset/copy-overflow rejection, all six full-size PNG dimensions; visually inspected portrait/landscape proofs and contact sheet. `git diff --check` passes using bundled Git with global config disabled. Tests are reproducible with `scripts/verify-poster-render.cjs` and bundled `@napi-rs/canvas`.
- Not verified: actual Jekyll build (executable unavailable), real browser flows/responsive screenshots/PNG download/print (Chrome aborts before startup; CUA initialization fails), physical QR scan/print, Safari/Firefox, and designer approval. Both browser suites were attempted but could not start. A local preview server was also denied permission to bind, including after Saber's access-change message; the standalone review file avoids needing a server. Do not treat native rendering as a browser pass.
- Next: open the standalone HTML in a browser for local review; then run the Jekyll build and `scripts/verify.cjs` plus `scripts/verify-poster.cjs` in an environment with working Chrome before publication. No commit, push, deployment, or external messages. Pre-existing untracked media/config and earlier edits were preserved. Session-wrap remains unavailable; handoff recorded here directly.

## Poster maker: Shristi's animations and speaker spotlights — 2026-09-19 (Claude, branch `poster-maker`)
- Restored Codex's poster-maker work from `stash@{0}` onto branch `poster-maker` (the stash is kept). At Saber's request the artwork is now the homepage interactive: all ten modes, captured live by new host-owned `poster-stage.js` from a hidden frame of the homepage, with an "in play" (hover) option and "Catch another moment". Codex's three p5 sketches, colorways, density/seed controls, `verify-poster-render.cjs`, `wordmark-light.svg`, and the stale `docs/previews/` files were removed (all still in the stash).
- New Keynote spotlight and Session spotlight templates: photo, name, pronouns, and bio for each person from `_data/keynotes.yml` / `_data/sessions.yml`; "Include bios" toggle; tight sizes fall back to a smaller wordmark, then smaller portraits.
- Fixes from the review: artwork scales evenly (was stretched on square/story); print export no longer waits on animation frames after opening the print tab; Codex's entry above no longer sits between the old-site-posters notes; friendlier preset errors; preview is sharp on Retina.
- Verified in headless Chrome against a local Jekyll build: `scripts/verify-poster.cjs` passes (10 animations, every template/size/speaker/session with and without bios, 320–1440 editor, PNG sizes, presets, print view, no-JS). `verify.cjs` passes on every page except Past Events at 768px, where lazy-loaded posters haven't loaded when it checks; that is from the earlier poster-grid work on `main`, not this branch. Only square and landscape refuse the four-person panel with bios, with a message. `git diff --check` clean.
- Not verified: Safari/Firefox, printing on paper, scanning a printed QR code. Untracked media (`*.mov`, `assets/Barak-Shrama-highres-day3-53-4K.jpg`, `assets/people/dan-shiffman.jpeg`) and `.claude/` are left out of the commit.
- Next: Francisca and Shristi review posters; decide whether to publish.

## Poster maker: internal, panels, short text, move and resize — 2026-09-19 (Claude, branch `poster-maker`)
- Internal: nav links removed, `noindex, nofollow` (new `noindex` front-matter flag in `_layouts/base.html`), floating reminder hidden on the page (new `hide_event_banner` flag).
- New Panel spotlight (sessions tagged Panel; 2 × 2 cards with photo, name, pronouns, short bio). Session spotlights now show a short description. Short text comes from new optional CMS fields `short_bio` / `short_description` (declared in `.pages.yml`, not filled in), else the opening sentence; editable per poster, never written to the site.
- "10 years of …" labels: ink on a backing chip, readable minimum size, hidden when the artwork band is small.
- Move/resize: every block except the footer can be dragged, corner-resized, or moved with the keyboard; kept per size, saved in drafts and presets (preset version 3; older presets are refused with a message). Layout problems (crowding, a block off the poster) turn export off with a message instead of blocking the preview.
- Verified in headless Chrome on a local Jekyll build: `verify-poster.cjs` passes, including every keynote/session/panel at every size with and without bios (none crowded), drag, resize, keyboard, text edits across reload. `verify.cjs` checks pass on every page except the pre-existing Past Events lazy-image failure at 768px. Also fixed: literal NUL bytes in `poster-art.js`'s copy check (from the earlier `\u0000` escape).
- Needs: Saber to fill in `short_bio` / `short_description` where the opening sentence doesn't work; Francisca and Shristi to review the label chips and the panel layout.

## Poster maker: Francisca's lettering — 2026-09-19 (Claude, branch `poster-lettering`)
- PR #2 merged and live (unlisted) at ccfest.rocks/poster-maker/; checked headlessly on the live site.
- Posters now use her Figma lettering: date line from the event title node 251:741 (Bold date, Thin Italic year), "Keynote"/"Session" headings from 251:765/251:788, "Creative coding / for everyone." from 218:150. `sync-typography.cjs` writes them to `assets/poster-maker/lettering.json`; re-running changes nothing. Per-width font faces reproduce her widths in canvas (589.8px vs 589.8px HTML for "Keynotes").
- Landscape spotlights drop the small tags line to make room; announcement/community may use the smaller wordmark when her two-line heading needs space.
- `verify-poster.cjs` passes, nothing crowded. Names, session titles, and bios have no Figma lettering; they stay plain Anybody.

## Poster maker: moment scrubber and new heading — 2026-09-19 (Claude, branch `poster-scrubber`)
- PR #3 (Francisca's lettering) merged and checked live.
- Heading copy now "Make a CC Fest Poster" / "Adjust, Download, and Share." (Saber's wording).
- Moment slider: `poster-stage.js` records 12 stills per animation (from the word being picked to the settled "in play" look) instead of one; the slider scrubs them instantly; one framing per recording so the art doesn't jump. "Catch another moment" is now "Record it again". `moment` (0–11, default 11) is saved in drafts and presets; older drafts without it still open.
- Verified headlessly: Celebration's confetti burst, Curiosity's curl, Creativity's draw-in and Collaboration's swing all scrub; `verify-poster.cjs` passes with a new scrubbing check.
- Follow-up: Change and Creative Commons fixed after Saber's review. Change's canvas now keeps the homepage's `mix-blend-mode: darken` (its pale trails had shown as white ghost Cs) and the recording aims the pointer where the morph reads as on the homepage (far left collapsed the Cs into bars). Creative Commons now records its column-by-column `clip-path` reveal (all 12 frames had been identical). Recording starts at 250ms so the previous mode has faded. Added a 12-thumbnail filmstrip under the Moment slider. Compared frame by frame against the homepage in headless Chrome; `verify-poster.cjs` passes.

## verify.cjs: the Past Events lazy-image false failure — 2026-09-19 (Claude, worktree `amazing-lehmann-408562`)
- Fixed the pre-existing failure the last two entries called out: `verify.cjs` reported ten broken posters on `past-events/` at 768px, and only at 768px. The posters were fine — they served 200 throughout and no 404 was ever logged. The cause was the check itself: the posters are `loading="lazy"`, the script scrolled each section into view and then waited a flat 900ms, and at that one layout width the images were still in flight when `state` was evaluated, so `complete` was false and `naturalWidth` 0.
- `scripts/verify.cjs` now has a `settleImages(page)` helper, called after the scroll pass: it flips any unfinished image to eager and awaits its `load` or `error`, capped at 5s each. Genuine detection is unchanged — both events settle the image, so a 404 or a zero-width file still leaves `naturalWidth === 0` and still fails.
- Verified against a local Jekyll build served with `npx http-server`: the unpatched script (from `git show HEAD:scripts/verify.cjs`) reproduces the exact ten posters; the patched script passes the whole suite at 320/390/768/1440 in ~80s. Negative-tested on a deliberately broken copy — one poster deleted (404) and one replaced with non-image bytes (200 but undecodable) — and both were still reported broken, exit code 1. `git diff --check` clean.
- Note for anyone rebuilding here: Jekyll is not on the default PATH. The working one is `/opt/homebrew/lib/ruby/gems/3.4.0/bin/jekyll` (3.10.0) with `/opt/homebrew/opt/ruby@3.4/bin` ahead on PATH; `gem install jekyll` under Homebrew's Ruby 4.0 still fails on the `stdckdint.h` gotcha.
- Nothing pushed or deployed. Only `scripts/verify.cjs` and the two notes files changed; no site file was touched.

## Orange CC favicon — 2026-09-24 (Codex)
- Replaced the shared favicon link with `assets/favicon-cc.svg`: two orange Cs derived from the homepage vector monogram on the site's paper background. Solid fills preserve legibility at tab size; the new filename avoids the old PNG cache. Host-side asset and layout only; designer-owned source files unchanged.
- Verified: Jekyll build from tracked files plus the favicon changes; all eight built pages reference the SVG and it serves HTTP 200; Chrome renders at 16/32/64px on light/dark surrounds; full `scripts/verify.cjs` passes at 320/390/768/1440 with interaction, reduced-motion, registration and no-JS checks; `git diff --check` clean.
- Initial sandbox restrictions were resolved after Saber restored access. Fast-forwarded main to current origin/main, preserving recent CMS updates and unrelated untracked files. Saber explicitly requested commit and push.
- Session-wrap skill was not found in available skill/plugin locations; handoff recorded here. Next: confirm Pages deployment after push. Safari/Firefox and designer review remain unverified.

## Minimal PCD link — 2026-09-26 (Codex)
- Added “Part of Processing Community Day 2026.” beneath the event description on the homepage and registration page, linking to https://day.processing.org/. Existing styles; host-owned HTML only. Saber has filed the PCD directory date-correction issue separately.
- Verified: diff contains one added paragraph per page; `git diff --check` passes. Jekyll execution is denied by session permissions; `verify.cjs` was attempted but Chrome aborts at startup. Rendered layout remains unverified.
- Saber approved committing and pushing this change after local review. Next: confirm publication and visually review both pages; rendered layout remains unverified locally. Session-wrap was not found in installed skill/plugin locations; handoff recorded here.

## Poster maker v2: first milestone — 2026-10-01 (Claude, branch `poster-maker-v2`, merged to `main`)
- Worked from `poster-maker.md` (repo root, the forward plan), tightened to: baseline results, six portrait proofs, a saved-poster schema proposal, and two real animation proofs. Everything is in `docs/poster-maker-v2/` (start at its README). Committed, then merged to `main` and pushed on Saber's instruction, so the poster maker and the internal `/poster-maker/?proofs` sheet are live (unlisted, noindex). The editor itself behaves as before.
- **Baseline** on a clean build of `main` (`f2d96b3`): `verify.cjs` and `verify-poster.cjs` both pass (84 s, 109 s), no existing failures. Both pass unmodified on this branch too.
- **Six directions** (Signature, Bold date, Art-led, Speaker-led, Program-led, Minimal print), drawn by code from the real data and a live animation frame, plus variants (one keynote, the longest title at 68 characters, the four-person panel). Registered through a new design registry in `poster-art.js`; families in the new `poster-designs.js`; internal review sheet at `/poster-maker/?proofs` (`poster-proofs.js`). All colour pairs are at least 4.5:1; measured limits are far past the real data. The original layout is `classic()` and draws pixel-identically to `main` (768 renders; negative-tested). **My recommendation of three (Bold date, Speaker-led, Program-led) is in `DIRECTIONS.md`; the choice is open.**
- **Schema proposal** (`SCHEMA.md`): permanent content IDs, a project model, stored artwork, IndexedDB, a v3 migration that only resolves unambiguous matches, safety rules, tests. **Verified in Pages CMS's source:** it drops every key it does not declare, so IDs must be declared as hidden `uuid` fields or the first save deletes them (now in GOTCHAS.md); a hidden-uuid regeneration bug was closed as fixed in 2.0.0 but **a real save has not been tried**.
- **Animation proofs** (`ANIMATION.md`, `clips/`): in Chrome 154, `MediaRecorder` gives H.264 MP4 straight from a canvas; two 5 s clips at 1080 × 1350 and about 30 fps (Collaboration, Celebration) decode, play back, and keep the poster text still and sharp. Sampling costs 3–16 ms per frame; cadence is close to even, not exact (worst gap 69 ms). No encoder library. Prototype: `CCStageCapture.captureClip` in `poster-stage.js`.
- **Print sharpness, measured** (`ARTWORK.md`): only Change and Celebration (and Curiosity's small dots) are bitmaps; the other seven are vector. Change and Celebration land at 120–135 ppi on Letter when captured on a 1× display and 241–270 ppi on a 2× display.
- Bugs found and fixed on the way: unbreakable long names crashed a design (now truncated with a reported problem); Signature claimed a supporting line it did not draw (now draws it).
- **Not verified:** Safari/Firefox/phones for clips; a hidden-tab recording; other animation sizes; a real CMS save; printing and QR scanning; any view from Francisca or Shristi (the new lockups are listed in `DIRECTIONS.md`); GIF. The 8.9 MB of review media in `docs/poster-maker-v2/` (proofs, clips) is in its own commit, "Add poster-maker v2 review media", and is now part of `main`'s history.
- **Next:** Saber picks three directions (with Francisca and Shristi); then, in order, IDs in the data and `.pages.yml` plus one real CMS save, split the content builder out of `poster-maker.js`, the v4 schema with its migration and tests, and only then the editor (content / design / format). The original two suites need to change in step with that work.

## Poster export `posters-oct1` — 2026-10-01 (Claude, local, uncommitted)
- `scripts/export-posters.cjs` drives the local poster maker's own Download button for every poster and size and writes a folder with a manifest and a README that carries the maker's captions and image descriptions. Run on 2026-10-01 against a Jekyll build of `main` (`1504fc8`) into `posters-oct1/`: 216 PNGs, 95 MB, nothing skipped. That is 18 posters (the announcement in all ten animations, the community flier, two keynotes, thirteen sessions, the panel) in six sizes, with Letter and A4 on paper and on white. Run at 2x display scaling so Change and Celebration print at about 240-270 ppi.
- Checked: every file's pixel size asserted, no two files byte-identical, contact sheets of all 27 portrait versions and of the ten white Letter versions inspected, and a long Spanish title, the panel and a landscape keynote looked at full size.
- **Known quirk (fixed later the same day, see "Change on a white poster" above):** Change on a white background showed faint grey trails (its pale trails are tuned to the paper colour, where a blend mode hides them). This folder's Change `-white` files predate the fix and still show it; its README says so.
- The posters use the maker's one existing layout; the six new design directions are not in the maker yet.
- The folder (96 MB) and the script are untracked. Do not `git add -A`: the folder would be committed and Jekyll copies untracked root files into local builds.
- Regenerate: build Jekyll, serve it, then `NODE_PATH=$(npm root -g) node scripts/export-posters.cjs http://127.0.0.1:8876/ posters-<date>`.
