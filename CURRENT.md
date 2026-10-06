# Current state — October 6, 2026

## CMS session recovery — 2026-10-06

The live session disappearance comes from CMS commit `771f63e`: it removed all 84 scheduling metadata values (`id`, `format`, `schedule_id`, `level`, `language`) from the 17 sessions. `.pages.yml` already declared these fields; the deleted keys match an older form, consistent with a stale CMS schema, although the editor's browser was not inspected.

Local branch `fix/cms-session-metadata` restores only those missing values from the previous commit. Every content value from the CMS save is preserved, including Kofi's new description. The result is eight workshops in Round 1, one panel and eight workshops in Round 2, using the original published IDs. ID and Format are now explicitly required in the current CMS form; When remains optional. `docs/CMS.md`, `GOTCHAS.md` and `DECISIONS.md` explain the schema reload and recovery behavior.

Verified after the final data/schema changes: Jekyll 3.10 safe-mode build; `scripts/verify-schedule-fallback.rb`; full `scripts/verify.cjs` in Chromium at 320/390/768/1440 (pages, images/fonts/links, schedule choices/time zones/calendar/PDF/PNG, blocked storage, registration dialog, motion and no-JS fallback); all 17 rendered cards and Kofi's text; desktop/mobile screenshots inspected; semantic comparison confirms only the restored metadata differs from the CMS save. `git diff --check` passes. No designer-owned files, Figma or private records were accessed or changed.

Saber explicitly approved committing and pushing this recovery to `main`, which publishes it. Next task: verify the resulting GitHub Pages deployment and live page. Before the next content edit, reload Pages CMS and confirm that ID, Format, When, Level and Language are visible. A real CMS save with the refreshed form and the live recovery are pending verification at this commit.

## Completed this session

Fixed the three findings from the [October 6 review](docs/REVIEW-2026-10-06.md). The schedule keeps titled workshops visible when their round is missing, empty or whitespace-only; their client-side round ID is empty, so they receive no preference controls. Copy buttons keep their original labels and restart one feedback timer per button. Sticky-preview browser checks now scroll instantly before measuring. Added regression coverage for actual Jekyll rendering, pending-card detection and repeated Copy clicks; documented the fixture command in docs/UPDATING.md.

Host-side changes only: register/index.html, _includes/session-card.html, poster-maker.js and verification scripts. No event facts, designer-owned files or Figma changed. Saber authorized committing and pushing these fixes on October 6. Deployment verification follows the push; no messages were sent. Existing changes to DECISIONS.md, _config.yml and campaign files were preserved. Prior handoffs are archived verbatim in [CURRENT before these fixes](docs/history/CURRENT-before-2026-10-06-fixes.md).

## Verified

- Fresh Jekyll 3.10 safe-mode build of current tracked site inputs, served locally.
- Full scripts/verify.cjs: all pages at 320/390/768/1440, schedule choices/time zones/calendar, blocked storage, registration dialog, no-JS and motion checks; no browser errors or failed requests.
- Full scripts/verify-poster.cjs: animations, content/sizes, editing/history, rapid Copy clicks and label reset, sticky preview, downloads, presets, print and no-JS checks.
- scripts/verify-poster-state.cjs; scripts/verify-schedule-fallback.rb (missing/empty/whitespace round and title fixtures). The fallback test also rejects the original template.
- JavaScript syntax and git diff --check. Fresh Chrome schedule/editor screenshots inspected.

## Follow-up fix — 2026-10-06 (Claude)

Review of the commit above found one remaining hole: a workshop whose `schedule_id` matched no workshop round (mistyped, padded, removed, or `panel`) rendered nowhere. A workshop now counts as scheduled only if its `schedule_id` is exactly the id of a workshop block in `_data/schedule.yml`; everything else goes under "Round to be announced" with no preference controls, and the panel block shows only panels. `scripts/verify-schedule-fallback.rb` gained those cases (it fails on the previous template and passes now). If a third round is added, its id must also be added to the `schedule_id` options in `.pages.yml`.

## Open work and limits

Safari/Firefox, screen-reader behavior, actual calendar-app import, touch dragging, phone keyboard/short landscape layout, physical printing and live registration remain unverified. The earlier small-screen preview-collapse suggestion is a separate design improvement. The old review's environment blockers no longer apply to this session.

Other ongoing work is preserved: Claude's schedule posters (PNG/tagged PDF/HTML) and Caleb's s17 spotlight are local campaign artifacts. Caleb's Figma import, multi-size flier refresh and older social joining instructions still need follow-up; consult the archived handoff for their verification limits. No new architectural decision was needed for these bug fixes.

## Next task

Verify the GitHub Pages deployment for the authorized fixes commit, then check the live register page and poster maker. Preview serves /private/tmp/ccfest-fixes-oct6/site; check logs and screenshots are in /private/tmp/ccfest-fixes-oct6/. Session-wrap applied while preserving the previous notes in the archive.
