# Current state — October 6, 2026

## Completed this session

Fixed the three findings from the [October 6 review](docs/REVIEW-2026-10-06.md). The schedule keeps titled workshops visible when their round is missing, empty or whitespace-only; their client-side round ID is empty, so they receive no preference controls. Copy buttons keep their original labels and restart one feedback timer per button. Sticky-preview browser checks now scroll instantly before measuring. Added regression coverage for actual Jekyll rendering, pending-card detection and repeated Copy clicks; documented the fixture command in docs/UPDATING.md.

Host-side changes only: register/index.html, _includes/session-card.html, poster-maker.js and verification scripts. No event facts, designer-owned files or Figma changed. Saber authorized committing and pushing these fixes on October 6. Deployment verification follows the push; no messages were sent. Existing changes to DECISIONS.md, _config.yml and campaign files were preserved. Prior handoffs are archived verbatim in [CURRENT before these fixes](docs/history/CURRENT-before-2026-10-06-fixes.md).

## Verified

- Fresh Jekyll 3.10 safe-mode build of current tracked site inputs, served locally.
- Full scripts/verify.cjs: all pages at 320/390/768/1440, schedule choices/time zones/calendar, blocked storage, registration dialog, no-JS and motion checks; no browser errors or failed requests.
- Full scripts/verify-poster.cjs: animations, content/sizes, editing/history, rapid Copy clicks and label reset, sticky preview, downloads, presets, print and no-JS checks.
- scripts/verify-poster-state.cjs; scripts/verify-schedule-fallback.rb (missing/empty/whitespace round and title fixtures). The fallback test also rejects the original template.
- JavaScript syntax and git diff --check. Fresh Chrome schedule/editor screenshots inspected.

## Open work and limits

Safari/Firefox, screen-reader behavior, actual calendar-app import, touch dragging, phone keyboard/short landscape layout, physical printing and live registration remain unverified. The earlier small-screen preview-collapse suggestion is a separate design improvement. The old review's environment blockers no longer apply to this session.

Other ongoing work is preserved: Claude's schedule posters (PNG/tagged PDF/HTML) and Caleb's s17 spotlight are local campaign artifacts. Caleb's Figma import, multi-size flier refresh and older social joining instructions still need follow-up; consult the archived handoff for their verification limits. No new architectural decision was needed for these bug fixes.

## Next task

Verify the GitHub Pages deployment for the authorized fixes commit, then check the live register page and poster maker. Preview serves /private/tmp/ccfest-fixes-oct6/site; check logs and screenshots are in /private/tmp/ccfest-fixes-oct6/. Session-wrap applied while preserving the previous notes in the archive.
