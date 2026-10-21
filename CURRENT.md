# Current state — October 7, 2026

## October 21, 2026 — first scheduled Notion recap sync

VERIFIED locally: the hourly automation fetched all twenty allowlisted Notion sources. Only the event hub changed (native edit time `2026-10-21T15:28:30.753Z`): the opening event count/explanation, introductory wording, collage description in the snapshot and additional thanks to Francisca. The public prose is imported verbatim, including its current grammar and spacing. The nineteen session records, replay/material links, frozen program and media files are unchanged. The shared cover retains its existing generic alt text; the more specific edited description is preserved in the source snapshot. Person linking now generates 274 mentions.

Fresh source validation, complete static build, twenty-one archive route/media/link checks, publication Chromium checks for all twenty-nine pages at 320/390/768/1440, legacy redirects and no-JavaScript content, and git diff --check passed. A second fetch confirmed the hub content and timestamp are stable; origin/main has no concurrent changes. Only the snapshot, generated hub, import manifest and this handoff are included. Publication is authorized by the recurring sync request; deployment and live verification follow the push and are recorded in the local sync receipt. No pipeline, layout or designer-owned changes. Manual session wrap used because session-wrap is unavailable.

Next: continue the hourly source checks; notify only after publication or a new actionable failure. Cross-browser and screen-reader checks remain unverified.


## October 21, 2026 — link people throughout the event archive

VERIFIED locally. At Saber's request, the archive now links 273 person mentions across all twenty-one pages, including the prose, captions, quote attributions, presenter headings and program bios. A reviewed directory covers forty-three people, including all twenty-two presenters and other referenced artists, educators and contributors. Personal sites are preferred; identified institutional, gallery or professional profiles fill the gaps. Ambiguous Dan/Daniel aliases are scoped to reviewed pages.

The standard build adds static links after Jekyll and verifies unchanged text and existing anchors; the frozen program and Notion prose snapshots remain intact. A second linking pass adds zero links. Archive verification now requires person links on every page and the correct URL on all twenty-two profile headings. The publication browser suite checks all twenty-nine pages at 320/390/768/1440, redirects and no-JavaScript content; desktop/mobile session screenshots were inspected. Source validation, full build, archive route/media checks and diff checks pass. No designer-owned files or styling changed.

External destinations were checked against the public program, reviewed resource links and public identity sources; automated HTTP checks were also run. LinkedIn can serve a login/challenge page. Vera Molnár uses ZKM's collection profile because her personal site's HTTPS certificate mismatches its hostname. Cross-browser and screen-reader checks remain unverified. Publication follows the existing explicit commit/push/main authorization; the Pages run and live revision are checked after the push and reported in the conversation/local handoff. Manual session wrap used because the session-wrap skill is unavailable.

Next: maintain names, aliases and evidence in `_data/recap_people.json` as recap content changes; always use `scripts/build.rb` so the static linking step runs.


## October 20, 2026 — October 17 archive publication

VERIFIED locally; publication explicitly authorized by Saber after the plan and preview review. This entry supersedes the local-preview-only boundary below. The permanent event home is `/events/october-17-2026/`, with nineteen individual recaps and an original `program/`. Events, home and History now point to the archive and no longer advertise October 17 registration. Register is a fragment-aware browser redirect with a visible no-JavaScript fallback and archive canonical; archived registration and planning controls are retired. Visible Java remains upcoming.

The public program is frozen in `_data/recap_program.json`, preserving nineteen sessions and twenty-two presenter profiles independently of future CMS event edits. Existing descriptions, portraits, bios, resource links, credits and speaker IDs are retained. Notion's reader-facing snapshot supplies the recap prose; internal evidence is excluded. Only the specifically authorized session/permission/material-link columns of the supplied feedback sheet were read. Four presenter-shared resource destinations were checked and linked from the program; no feedback text was read or imported.

Fresh verification after the final implementation: source validation and static build; twenty-one archive routes, local links/anchors, all nineteen story/replay links, twenty-two profiles and ten media hashes; rendered omission/duplicate/title rejection; pending-session rendering fixtures; thirteen CMS tests (58 assertions); publication browser suite across all twenty-nine pages at 320/390/768/1440; legacy Register fragment redirects and no-JavaScript program; additional homepage keyboard/motion/offscreen and schedule time-zone checks through `VERIFY_INTERACTIONS_ONLY=1 scripts/verify.cjs`. Desktop/mobile archive, program, session and Events screenshots inspected; syntax and diff checks passed. The repeated full screenshot suite was stopped after 320/390px; all widths were separately completed by the publication suite. Designer-owned files remain identical.

Implementation work is isolated under `zoom_exporter/recap-site-preview`, based on origin/main `063f8d8`, preserving the original checkout's unrelated changes. Publishing uses the existing checked Pages workflow on main. The deployment run and live revision are verified after pushing and reported in the chat and the original checkout's local handoff. No DNS or hosting changes. Guide, source/media/redirect manifests: `docs/recaps/`.

Limits: selected quotes were checked against transcripts and independent audio transcriptions, not human listening or a full viewing of all recordings. Saber approved publication of the reviewed images; this does not assert independent rights clearance. Cross-browser, screen-reader and complete supporting-resource checks remain unverified. The unavailable session-wrap skill is replaced by this manual handoff.


## October 20, 2026 — linked recaps and branded local preview

VERIFIED for the local preview phase. Saber authorized updating the Notion story and preparing the website presentation. The event recap now connects all nineteen sessions through four thematic questions, with opening and closing keynotes as bookends, while preserving the images, chronological index and editorial-notes child page. The Notion notes distinguish editorial connections from sourced spoken callbacks.

This detached worktree at `zoom_exporter/recap-site-preview` starts from saved origin/main `063f8d8`; the main checkout's existing work remains intact. It adds a clean Notion snapshot, an offline importer, twenty static pages, five images in two derivative sizes, a shared recap layout, scoped host CSS and a Recap navigation link. Existing Jekyll/Pages CMS and designer-owned sources remain unchanged. The ordinary build now regenerates and checks recap pages. See [the import guide](docs/recaps/README.md) and its route/media manifests.

Fresh checks after the final implementation change: complete `scripts/build.rb` with source validation, existing seventeen-session schedule reconciliation, and twenty-page recap checks; `scripts/verify-publish.cjs` across all twenty-eight pages at 320/390/768/1440, plus saved schedule choices/calendar and no-JavaScript content; JavaScript syntax and `git diff --check`. Desktop hub/story/session and mobile hub/story screenshots inspected. The playlist was opened in YouTube and showed the matching event title and nineteen recordings. The broader animation suite `verify.cjs` was stopped after its 320px pass; its full run is not claimed.

Preview: http://127.0.0.1:8897/recaps/october-17-2026/ (loopback server; built files in `/tmp/ccfest-recap-preview-site`). All recap pages are noindex/nofollow. The Mac build used a temporary Ruby 3.4 compatibility Gemfile, documented in the guide; repository dependency files were not changed.

Remaining: human listening to selected quote clips, image reuse/consent review (especially names/handles in the shared-collage image), complete supporting-resource destination checks, cross-browser/accessibility review and final editorial approval. No commit, push, deploy, DNS, live-site changes or hosted CMS saves. Next: review this preview, then reconcile it with current main and explicitly authorize publication when ready. Session-wrap skill was unavailable; this entry and the import guide provide the handoff.

## Latest task — CMS improvements published and activated

Saber approved “Push and activate” and completed the owner-only Pages Source change. The API confirms `build_type: workflow`, custom domain `ccfest.rocks`, HTTPS enforced and status built. The implementation is published on `main` as `95e7910`; [Checked Pages publication run 37575337520](https://github.com/saberkhan372/ccfest-redesign/actions/runs/37575337520) passed both build and deploy. The temporary activation workflow is removed. The old branch-based publisher no longer bypasses the checks.

The site has 14 explicit CMS forms: seven existing data forms and seven page-copy/metadata forms. Curriculum, outcomes, FAQ, logistics and policy lists are structured. Existing public wording, Kofi's update, all 17 permanent session IDs, routes, media paths and credits survive. A locked Jekyll build validates the recursive schema and deployed IDs, prepares shared event/year/time-zone data, syncs typography, reconciles rendered cards and checks pages in a real browser before the dependent deployment. Posters use session format/level/language. New image browsing starts in `assets/uploads` and retains legacy assets. Designer-owned files stay byte-identical.

Verified locally: 13 content regression tests / 59 assertions, schema projection of all 14 forms, original metadata-loss fixture, protected IDs/reordering/intentional removals, valid pending/additional workshops, invalid assignments/times/images/links, future date/year/daylight saving; omission/duplicate/mistitled-card rejection; Jekyll schedule fallback; full four-width browser and poster suites; exact public-copy comparison; idempotent typography and syntax/diff checks. Verified in GitHub: deployed-baseline resolution, all source/render regressions, build, mandatory browser checks, artifact upload and production deployment.

Verified live after deployment: revision `95e7910` in asset URLs; 8 workshops in Round 1, 1 panel, 8 workshops in Round 2; preserved Kofi description; saved choices and five-event calendar export; all 17 cards visible with no JS; all eight pages at 320/390/768/1440 without overflow or missing images/fonts/anchors/browser errors; poster maker ready with the shared event name/date and format-based panel/workshop choices.

The integration's direct Pages update and a one-time activation job initially returned 403; the owner resolved it in Settings → Pages. A later runner's browser CDN download returned a location-based 403; CI uses the runner's preinstalled Chrome with pinned Playwright, keeping browser checks mandatory. No preview service or private attendee/provider access was introduced.

Remaining verification: a real authenticated Pages CMS save, upload and stale-tab roundtrip. Local schema projection does not establish hosted-CMS behavior. Reload Pages CMS and reopen the form before the next edit. [CMS-ROLLOUT.md](docs/CMS-ROLLOUT.md) records activation, the real-save checklist and recovery.

## CMS session recovery — 2026-10-06

The live session disappearance comes from CMS commit `771f63e`: it removed all 84 scheduling metadata values (`id`, `format`, `schedule_id`, `level`, `language`) from the 17 sessions. `.pages.yml` already declared these fields; the deleted keys match an older form, consistent with a stale CMS schema, although the editor's browser was not inspected.

Local branch `fix/cms-session-metadata` restores only those missing values from the previous commit. Every content value from the CMS save is preserved, including Kofi's new description. The result is eight workshops in Round 1, one panel and eight workshops in Round 2, using the original published IDs. ID and Format are now explicitly required in the current CMS form; When remains optional. `docs/CMS.md`, `GOTCHAS.md` and `DECISIONS.md` explain the schema reload and recovery behavior.

Verified after the final data/schema changes: Jekyll 3.10 safe-mode build; `scripts/verify-schedule-fallback.rb`; full `scripts/verify.cjs` in Chromium at 320/390/768/1440 (pages, images/fonts/links, schedule choices/time zones/calendar/PDF/PNG, blocked storage, registration dialog, motion and no-JS fallback); all 17 rendered cards and Kofi's text; desktop/mobile screenshots inspected; semantic comparison confirms only the restored metadata differs from the CMS save. `git diff --check` passes. No designer-owned files, Figma or private records were accessed or changed.

Saber explicitly approved committing and pushing this recovery to `main`. It is published as `413b33e`; [GitHub Pages build and deployment](https://github.com/saberkhan372/ccfest-redesign/actions/runs/37548533512) completed successfully. The live revision and all 17 sessions were verified, including the preserved Kofi description, session choices/calendar export, no horizontal overflow at 320/390/768/1440 and the no-JavaScript fallback. Before the next content edit, reload Pages CMS and confirm that ID, Format, When, Level and Language are visible. A real CMS save with the refreshed form remains unverified.

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

Reload Pages CMS on main and complete the hosted-CMS checklist on a test branch, recording the actual save, image-upload and stale-tab behavior. Publishing is active through the checked Actions workflow; ordinary valid CMS saves now pass the automatic checks before deploying. Existing cross-browser, assistive-technology, calendar-app and physical-printing limits remain documented above.
