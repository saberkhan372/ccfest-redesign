# Poster maker improvement plan

Planning date: October 1, 2026. Updated October 5: the six existing portrait designs are now selectable in the editor, with compatible content/size choices, undo/redo, poster-only title edits, scoped layouts for new designs, and visible omission notes. Exact-artwork saving, additional design formats, batch exports, and production MP4/GIF remain planned. See [the usage guide](docs/POSTER-MAKER.md) for current behavior; the baseline and task descriptions below retain the original planning context.

## Goal and scope

Turn the existing poster maker into a practical campaign tool for Virtual CC Fest: choose a polished design, customize its content and artwork, recover the exact result later, and export coordinated still or animated assets.

Keep Francisca José Rodrigues's typography and visual identity and Shristi Singh's ten homepage animations central. Improve composition, readability, editing, and production reliability within the existing Jekyll/static JavaScript site. Do not introduce a framework, backend, or package manifest.

This document consolidates the October 1 discussion, including GIF and MP4 export. It is the forward-looking task plan. [The usage guide](docs/POSTER-MAKER.md) describes the existing tool; [the earlier plan](docs/POSTER-MAKER-PLAN.md) is historical and includes original p5 artwork proposals that were subsequently replaced. Follow the later ownership and artwork decisions in [DECISIONS.md](DECISIONS.md).

Publication, commits, pushes, and external messages require Saber's explicit request. Implementation and designer review are separate from publication.

## Current baseline

The existing maker has five content templates, six output sizes, ten homepage animation modes, a twelve-frame moment selector, paper/white backgrounds, editable supporting copy and bios, movable/resizable blocks, browser drafts, JSON presets, captions, alt text, registration QR, PNG export, and a browser print/PDF view.

Observed or documented limitations:

- Portrait layouts largely share a wordmark/artwork/information stack; changing content does not create a substantially different design.
- Saved presets preserve settings and a moment number, not the exact captured artwork. Random animation behavior can change a reopened poster.
- Tight layouts can shrink text or truncate optional descriptions. Fitting the page is not sufficient evidence of readability.
- Bitmap artwork is captured from a 1100px-wide stage and can soften in print, even when the final PNG is larger.
- Capture depends on foreground-tab timing. Reduced motion can leave the Change capture empty.
- Selections and text edits use numeric list positions; reordering event data can associate an old draft with different content.
- The existing browser checks are valuable, but do not establish current Safari/Firefox, physical print, or animated-export support.

## Content and design rules

The public registration page reviewed October 1 lists October 17, 2026; free, online, all levels; 9:00 am–12:30 pm Pacific / noon–3:30 pm Eastern; and keynotes Lauren Lee McCarthy and Daniel Shiffman. Recheck current public data before generating final campaign assets. Keep the registration page as the QR destination: https://ccfest.rocks/register/.

- Read event facts from the existing public `_data` sources. Do not copy tentative scheduling from private planning tools or invent session times.
- Preserve the typography sync pipeline; do not hand-edit generated lettering or `data-figma-run` spans.
- Keep designer credits in the editor and appropriate export credits. Have designers review derived artwork treatments.
- Use brand colors deliberately: paper, ink, blue, orange, and lime. Verify contrast for each actual pairing.
- Keep artwork unchanged when possible. Color bands and paper-colored artwork panels can provide variety without recoloring Shristi's shapes.
- Keep names, dates, CTA, QR, and credits still in animated posters. Never animate information that people need time to read.
- Only public event information belongs in this unlisted tool. Preserve its noindex status and absence from navigation.

## Delivery order

| Phase | Tasks | Reviewable outcome |
|---|---|---|
| 1: Design and technical proofs | 1, 2, 9 | Six visual directions, three format adaptations, and a real animated-export feasibility report |
| 2: First useful release | 3–6, essential checks from 12 | Three polished design families, readable defaults, undo/redo, exact artwork saving |
| 3: Campaign production | 7, 8 | Reviewed multi-format campaign downloads and stronger print output |
| 4: Animated production | 10, 11 after task 9 | Verified MP4/GIF export for supported modes and devices |
| 5: Release preparation | Complete 12 | Documented checks, designer review, remaining limits, explicit publication decision |

Task 9 should begin early so encoding or timing limitations are discovered before the animated interface is built. A useful still-poster release should not depend on every animation mode being exportable.

## Task 1 — Establish six distinct visual directions

**Purpose:** improve the quality and variety of the actual posters before adding controls.

**Suggested work:** create a contact sheet using real public event content and existing assets. Use code-native layouts and captured artwork so the proofs can become working templates.

| Direction | Composition suggestions | Main use |
|---|---|---|
| Signature | Generous CC artwork, clear date, spacious supporting copy | General announcement |
| Bold date | Prominent October 17, strong color band, concise registration CTA | Reminders |
| Art-led | Oversized CC artwork, protected text zone, very little copy | Social promotion |
| Speaker-led | Large portraits and names, small festival artwork; single and paired variants | Keynotes |
| Program-led | Session title dominates; balanced four-person grid for panels | Sessions and panel |
| Minimal print | White background, restrained artwork, strong hierarchy and safe margins | Community and school noticeboards |

**Suggestions:** show all six at the same scale, then inspect at phone size. Compare intentional uses of negative space, type size, and image emphasis. Avoid six versions that only change background color. Include the longest public session title in at least one proof.

**Done when:** six portrait proofs are reviewable side by side, with a short explanation of each direction and suggested content limits. Select the strongest three for the first implementation phase. Record feedback from Francisca and Shristi when review occurs; do not imply approval in advance.

**Dependency:** none beyond current asset/content inspection.

## Task 2 — Design responsive poster compositions

**Purpose:** make each export size look intentionally designed.

**Suggested work:** adapt the strongest three directions to portrait, square, and story first. Add landscape, Letter, and A4 after those layouts are stable. Define margins, type roles, image boxes, QR placement, and content budgets per design/format combination.

**Suggestions:** reserve generous story top/bottom space as an editable safe-area overlay rather than promising compatibility with every platform UI. Use paired keynote portraits on wider layouts and stacked portraits on tall ones. Separate decorative cropping from readable wordmarks. Let landscape omit optional bios explicitly rather than compressing all content.

**Done when:** nine initial compositions (three directions × three formats) are legible at intended viewing size, with date, format, and registration action easy to find. Each has a deliberate no-photo fallback. Unsupported combinations are identified rather than silently improvised.

**Dependency:** task 1 direction selection.

## Task 3 — Separate content, design, and format in the editor

**Purpose:** make polished presets discoverable without requiring manual layout work.

**Suggested work:** expose three independent choices: content type (announcement/keynote/session/panel/community), design family, and format. Show visual design thumbnails and only compatible options. Keep detailed adjustments in a secondary section. Preserve the existing animation selector and moment filmstrip.

**Suggestions:** use a large preview, a persistent export action where practical, and clear selected states. Give each preset a short description such as “large portraits, short copy.” Choose sensible defaults for QR, times, and bios based on format, while allowing overrides. Explain when a format omits a field.

**Done when:** a user can choose content, pick a design, and export a usable poster without dragging blocks. Keyboard selection, focus order, labels, and mobile controls work. Existing presets have a tested migration or a useful incompatibility message.

**Dependency:** tasks 1–2; coordinate state schema changes with task 6.

## Task 4 — Strengthen typography, copy, and portrait handling

**Purpose:** keep information readable and make spotlight posters feel designed for their people.

**Suggested work:** define minimum readable type sizes by output context; replace excessive shrinking with actionable overflow messages. Make truncation/omission visible in the editor. Add portrait crop/focal-point controls with a no-photo layout. Offer concise and fuller copy treatments using existing short-copy fields and poster-only edits.

**Suggestions:** prioritize event name, date, online/free facts, featured name/title, and registration CTA. Use social layouts with bios off or very short by default. Warn before clipping a long description and identify the affected field. Keep important names complete. Do not automatically write shortened copy back into site data.

**Done when:** long names, long titles, paired keynotes, and the four-person panel remain readable; all optional omissions are disclosed; no essential content is clipped or silently reduced below the chosen minimum. Portrait cropping survives save/reopen.

**Dependency:** task 2 layout rules.

## Task 5 — Add safer, faster layout editing

**Purpose:** support customization without making it easy to lose a good composition.

**Suggested work:** add undo/redo, snapping, alignment guides, block locks, numeric position/scale controls, and separate artwork crop controls. Preserve keyboard moves and resizing. Provide reset for the selected block and the current design/format.

**Suggestions:** record one history operation per drag or slider gesture, not every pointer movement. Keep intentional artwork overlap possible while checking required text and QR clearance. Store layout overrides per content/design/format context so moving one session's people does not unexpectedly damage another design.

**Done when:** undo/redo restores text and layout edits predictably; locked blocks cannot be moved accidentally; keyboard and touch editing work; switching formats preserves their independent adjustments. Export validation still catches unsafe placements.

**Dependency:** task 3 state model.

## Task 6 — Save exact artwork and named projects

**Purpose:** recover the poster the user chose, including its actual animation still.

**Suggested work:** introduce named saved posters, duplicate, favorites, stable content identifiers, a versioned project schema, and stored capture assets. Save the selected artwork layers/frame with layout and copy. Keep lightweight settings presets distinct from portable projects containing artwork.

**Suggestions:** prototype IndexedDB for image/blob storage rather than putting large data URLs into localStorage. Include source-data and renderer versions. When public facts change, show a diff and a deliberate refresh action; flag stale required facts before export. Validate imported projects, asset sizes, and SVG/image contents. Never execute imported markup. Supply storage-full and missing-asset recovery paths.

**Done when:** a named poster reopened after reload recovers its selected artwork and layout. Reordering sessions does not change the featured person. Portable export/import restores the same assets in a fresh browser. Migrations preserve old drafts where feasible and fail clearly otherwise.

**Dependency:** task 3 schema; coordinate captured asset representation with task 9. A saved still does not by itself preserve an entire animated recording.

## Task 7 — Export a coordinated campaign

**Purpose:** produce a family of promotional assets without rebuilding each one.

**Suggested work:** let users select content items and sizes, reuse a design family, review every result in a contact sheet, then export a ZIP of PNGs with a caption/alt-text manifest. Support main announcement, paired/individual keynotes, panel, selected sessions, and a registration reminder.

**Suggestions:** allow per-item copy and crop corrections before export. Use descriptive filenames with content, design, and format. Render sequentially to limit memory. Include progress, cancellation, and a summary of failed or skipped items. Review any small ZIP helper's license and browser compatibility before vendoring it.

**Done when:** each selected output has the right person, facts, format, and caption; failures are explicit; re-running produces no duplicates inside the archive; a coordinated campaign can be generated without adjusting every layout from scratch.

**Dependency:** tasks 2–6. Keep bulk video rendering outside the initial batch-export scope.

## Task 8 — Improve print quality and export confidence

**Purpose:** make large files genuinely useful in print.

**Suggested work:** calculate effective bitmap resolution at its placed size, preserve vector artwork layers until final rendering, verify font readiness, and inspect Letter/A4 output at physical size. Prototype higher-resolution animation capture through the host adapter without changing Shristi's scripts.

**Suggestions:** distinguish “large output dimensions” from “high-resolution source artwork.” Recapturing at higher resolution may create different random artwork; disclose this instead of replacing a saved favorite silently. Prefer a warning and another artwork choice when quality cannot be preserved. Keep browser PDFs described as raster/office-print outputs. Commercial bleed, CMYK, and PDF/X require a separate printer-specific task.

**Done when:** PNG dimensions and PDF page sizes are verified; fonts and QR quiet zones survive export; low-resolution artwork produces a useful warning; a physical print and phone scan are recorded as passed or still outstanding.

**Dependency:** task 6 asset persistence; task 9 capture experiments can inform this work.

## Task 9 — Prototype animation capture and encoding

**Purpose:** establish what can be exported reliably before promising MP4/GIF for all modes.

**Suggested work:** choose one continuously moving mode and one entrance/confetti mode after inspecting their actual behavior. Produce a short portrait clip with fixed text and animated artwork. Reuse the poster renderer for every composed frame. Examine live SVG styles, canvas pixels, clipping, blend modes, and frame timing in the host capture adapter.

**Suggestions:** the current twelve stills support scrubbing, not smooth video. Do not treat them as a finished video sequence. Prototype fixed-rate composition around 24–30 fps for MP4 and lower-rate sampling for GIF. Start with a 4–6 second target, then adjust to the mode's natural timing. These are proposed quality targets, not verified capabilities.

Two capture routes need evaluation: recording the live composition in real time, or collecting timestamped frames for later encoding. Fixed-rate output does not guarantee deterministic source animation; mixed CSS, p5, and random behavior may prevent offline stepping without modifying the source. Prefer an honest recorded take and preserve it when reproducibility is required.

Check current official browser/encoder documentation at implementation time. Probe actual MIME/codec support and encode a test file. Compare native MediaRecorder support with WebCodecs plus a muxer where available; WebCodecs alone does not create an MP4 container. Do not rename a WebM file to MP4. Consider codec initialization failures, memory use, and encoder dependency size/license. A heavyweight browser FFmpeg bundle is not the default solution.

**Done when:** two playable proof clips have documented dimensions, duration, frame cadence, visual fidelity, file size, and tested browser support. Record the chosen approach, dependencies, unsupported cases, and memory/timing limits. If MP4 cannot be delivered in a browser, show an explicitly labeled WebM fallback or a clear unsupported message.

**Dependency:** existing renderer/capture inspection. Run alongside tasks 1–2.

## Task 10 — Build MP4 export and playback controls

**Purpose:** export attractive short animated posters with readable static information.

**Suggested work:** add preview play/pause, duration, start/end selection where supported, loop/one-shot choice, quality settings, progress, and cancellation. Support portrait first, then square and story. Keep MP4 silent initially. Freeze content and layout for the duration of an export.

**Suggestions:** classify each mode as naturally looping, entrance/one-shot, or requiring special treatment. Do not claim seamless loops for an entrance animation. Avoid blanket ping-pong or crossfade effects that change the artwork's intended motion. Offer a still hold at the end where appropriate. Validate first/last frames. If the tab is hidden, pause or abort with a recoverable message rather than exporting a damaged clip. Disable duplicate export requests and clean up encoders, tracks, workers, and buffers.

Honor reduced motion in the editor: show a still by default and let the user explicitly preview motion. Provide an appropriate static capture fallback. Keep high-quality PNG available alongside video. Offer exact-recording persistence separately from lightweight animation settings, with storage estimates.

**Done when:** downloaded MP4 files play in tested browsers and native players with the stated duration and dimensions; static text stays sharp; unsupported encoding is explained; cancellation and background-tab interruption recover cleanly; repeated exports do not accumulate resources. Document mode-specific loop limits.

**Dependency:** task 9 feasibility gate and task 6 project storage design.

## Task 11 — Add GIF export with practical quality controls

**Purpose:** provide a widely usable animation option where GIF is preferred.

**Suggested work:** reuse captured frames, offer smaller dimensions and frame-rate presets, estimate file size, and encode in a worker if the chosen encoder supports it. Prototype around 540px width and 10–15 fps before offering larger settings. Label estimates as estimates and show the actual size afterward.

**Suggestions:** evaluate palette quantization and dithering on brand colors, portraits, fine text, and gradients. Start with an opaque background to avoid transparency artifacts. Reuse a stable palette where beneficial and verify frame disposal behavior to prevent trails. Keep duration and resolution limits practical; suggest MP4 for long or photo-heavy clips. Validate encoder licensing before adding a vendored helper.

**Done when:** GIF files animate at the expected speed, loop as selected, preserve readable static information, and have no stale-frame trails or unacceptable color shifts. Encoding remains cancellable, the interface stays responsive, and memory/file-size limits are visible.

**Dependency:** task 9 frame pipeline; can follow MP4 once that shared pipeline is stable.

## Task 12 — Verify, document, and prepare the release

**Purpose:** verify actual artifacts and user workflows, not only whether controls respond.

**Suggested work:** extend `scripts/verify-poster.cjs` with meaningful new behavior checks and run `scripts/verify.cjs` against a fresh Jekyll build. Run `git diff --check`. Keep a representative visual review sheet and record browser/device results.

Required coverage:

- Supported content/design/format combinations, especially long titles, four-person panels, missing photos, optional text, and QR clearance.
- Preview/export agreement, loaded fonts, PNG dimensions, PDF page size, and saved-project restoration.
- Keyboard editing, focus, undo/redo, imports, migration, storage failure, and stale source-data notices.
- Editor widths of 320, 390, 768, and 1440px; mobile download behavior and memory constraints.
- Chrome, Safari, and Firefox: report support separately rather than extrapolating from one browser.
- All ten animation modes assessed for capture, blend/clipping fidelity, loop suitability, and supported export formats. Unsupported combinations must be disabled with an explanation.
- Actual MP4/GIF decoding and playback, frame count/timing where inspectable, first/last-frame review, progress/cancel, hidden-tab interruption, and repeated-export cleanup.
- Static/no-JavaScript explanation and reduced-motion behavior; no unintended animation work while the editor is idle or hidden.
- Physical print/QR scan and designer review remain explicitly manual checks.

**Done when:** checks are recorded as passed, failed, or untested; critical failures are resolved; usage documentation matches shipped controls; CURRENT.md states the next step. Verify designer-owned files remain unchanged. Request publication only after a concrete local result is ready, and only publish when explicitly instructed.

**Dependency:** applied throughout every phase, with a final pass after the selected release scope is complete.

## Suggested implementation boundaries

| Area | Existing location / suggestion |
|---|---|
| Editor controls and public data payload | `poster-maker/index.html` |
| State, undo history, saved projects, exports | `poster-maker.js`; split into host-owned modules only when complexity warrants it |
| Layout families, typography, shared frame composition | `poster-art.js` |
| Homepage animation capture | `poster-stage.js` |
| Editor styling | Matching poster-maker section of `redesign.css` |
| Encoder workers/helpers | New host-owned files, loaded only when needed; document source and license |
| Approved assets and capture fixtures | `assets/poster-maker/` with provenance/credit notes |
| Public content and short text | Existing `_data` files and CMS fields; no unrelated content changes |
| Regression checks and usage guide | `scripts/verify-poster.cjs`, `scripts/verify.cjs`, `docs/POSTER-MAKER.md` |

Never edit Shristi's animation source files, designer source folders, or the Figma source file. Do not silently upgrade the shared p5 library. Preserve unrelated local changes.

## Recommended first milestone and current verification

First milestone: six visual proofs, three chosen design families, improved hierarchy, undo/redo, and exact still-artwork saving. Run the two-mode animated export experiment early; add production MP4 and GIF when it establishes a reliable route. Batch campaign exports follow stable layouts and project storage.

The October 1 planning review inspected the live default maker preview, current public registration page, project documentation, and relevant source. It did not rerun export/regression tests or establish animated encoding support. No visual proofs, prototype exports, physical prints, or designer approvals are claimed by this plan.

Next action: build the six-design contact sheet from real public content and existing artwork, alongside the bounded two-mode animated-export feasibility prototype.
