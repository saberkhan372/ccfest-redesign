# Decisions — CC Fest redesign

## 2026-10-06 — Require session identity and format in the CMS
**Why:** The CMS save in `771f63e` removed the metadata needed to place all 17 sessions in the schedule. Restoring the existing IDs and assignments preserves saved choices and the new descriptions. ID and Format are now explicitly required in `.pages.yml`; When stays optional so unassigned workshops can use the existing "Round to be announced" section.
**Limit:** Required fields protect the current form. Editors must reload Pages CMS after schema changes: a stale form that lacks these fields can still delete them. See `docs/CMS.md` and `GOTCHAS.md`.

## 2026-10-06 — Schedule posters are built from the data, not drawn by hand
**Why:** Workshops and rounds were still changing, and the carousel's "The day" slide had already gone stale. `scripts/build-schedule-posters.cjs` reads `_data/` and writes a short poster (1080 × 1350) and a long one (US Letter) as HTML, PNG and tagged PDF into `schedule-posters/`, so a rerun is enough after any programme change, and it fails if the content no longer fits.
**Boundary:** The output folder is a campaign artifact, like `social-oct1/` and `posters-oct1/`: not committed and excluded from the site build (`_config.yml`). Only the script is in the repository. The look follows the carousel rules; the designers have not reviewed it.

## 2026-09-28 — Local Zoom preparation, with explicit proposed rounds
**Why:** Saber wants an exporter for the October 17 event and explicitly requested a hypothetical schedule. The organizer tool lives under the already-excluded `docs/` folder, uses a dated source snapshot, and exports files locally. Round assignments are labelled draft; Blair's first-round-only constraint is enforced. No public schedule changes follow from editing this tool.
**Contact handling:** The repository snapshot contains no email addresses. A build can embed a supplied private contacts file into a portable editor outside the repository; saved plans exclude contacts. Missing keynote emails are never fabricated. The speakers export omits incomplete contact rows and lists them for follow-up.
**Import boundary:** CSV columns follow Zoom's official field guide, with optional matching against an account's downloaded sample. Real import remains unverified. The guide does not specify a multi-speaker delimiter, so the panel CSV associates Amy and retains all names in its description; the other three panelists must be linked in Zoom. Presenter emails are not alternative-host assignments.

## 2026-09-15 — Provisional integration in the existing static site
**Why:** Combine Francisca’s layout and Shristi’s supplied interactive without changing the no-build stack or modifying either designer’s source folder. Shristi’s final PR is still pending.
**Rejected:** Blind branch merge, framework migration, or publishing the unfinished branch.

## 2026-09-15 — Editable variable typography
**Why:** Figma context exposes Anybody width-axis values, weight, italic style, and some run-level tracking. Self-host fonts and retain text with span-level CSS; Overpass Mono follows the updated Figma labels.
**Rejected:** Flattening all type into raster images; assuming generic exported HTML preserved Figma’s variable axes or all hand kerning.

## 2026-09-15 — Honest event announcement states
**Why:** Event mockup contains sample speakers, times, and a missing Eventbrite ID. Keep section structure and styling while showing that announcements/registration are pending.
**Rejected:** Publishing invented event details or a working-looking checkout placeholder.

## 2026-09-15 — Integration styling and motion controls
**Why:** Keep redesign.css separate from the original layout and Shristi’s animation CSS for easier comparison when her PR arrives. Supply pause/reduced-motion handling and stop unused canvas rendering.
**Rejected:** Rewriting the designer’s SVG geometry or completing her unfinished modes without her final work.

## 2026-09-15 — Jekyll and Pages CMS for the content that changes (branch `pages-cms`)
**Why:** Dates, speakers, sessions and past events were typed into HTML in several places at once, so every small update needed a developer. Jekyll is already part of GitHub Pages and Pages CMS is a free form over plain YAML in the same repository, so this adds an editing path without adding hosting, a build step, or a lock-in. The bar for every phase was that the built HTML stayed **byte-identical** to what shipped before.
**Rejected:** A visual page builder (would put layout and Francisca's lettering within reach of a form); moving to Netlify or another host (a separate question, and not needed for this); leaving the content in HTML and answering update requests by hand.

## 2026-09-15 — Announcement states are structural, not copy
**Why:** An empty date, keynote list, session list or registration link renders the honest "to be announced" layouts by itself. An editor cannot produce a half-finished page by clearing a field, and never needs a placeholder to make one look complete.
**Rejected:** Free-text date and status fields, which would let a typo or an optimistic guess reach the live site.

## 2026-09-16 — Merge Shristi's pull request instead of reverting `main`
**Why:** Her PR (#1) branches from before Jekyll and the CMS and suggests reverting `main` to merge cleanly; that would discard the site. A real merge, resolved by taking her files whole and porting her stage markup into the Jekyll homepage, keeps her twelve commits and authorship and closes the PR on GitHub when it reaches `main`.
**Rejected:** Reverting `main`; copying her files in without her history; a squash that drops her authorship.

## 2026-09-16 — Shristi's files stay byte-identical; host needs live outside them
**Why:** The provisional integration patched `animations.js` and `change-sketch.js`, which made every later update a hand merge. Now the p5 lifecycle and SVG animation pausing are in `interaction.js`, and colour blending, sizing and paused states are in `redesign.css`, so her next PR can be taken whole with `git checkout --theirs`.
**Rejected:** Patching her scripts for the pause, offscreen and reduced-motion needs, or fixing her confetti listeners on her behalf.

## 2026-09-16 — Her full-height stage on desktop
**Why:** Her PR asks that the 95dvh stage not be shortened, since each mode draws across all of it; the earlier `clamp(560px,80vh,850px)` override and the smaller monogram size were removed. Phones keep 540px pending her view.
**Rejected:** Keeping the shorter desktop stage for page rhythm.

## 2026-09-16 — Luma for registration and donations, replacing Eventbrite
**Why:** Saber pays for Eventbrite and wanted to stop, while still collecting donations. Luma is free for free registrations, takes a donation at sign-up like the old Eventbrite "donate as you RSVP" setup, and sends each guest a personal Zoom link, reminders and a calendar invite. Its cut is 5% of donations plus Stripe's fees. There is no nonprofit entity, so nonprofit-only tools don't apply and donations aren't tax-deductible. Comparison in `docs/REGISTRATION.md`.
**Rejected:** A site form going to EmailOctopus with Ko-fi donations (no platform cut, but donating becomes a separate step and the Zoom links and reminders are sent by hand); Humanitix (~$1.29 per donation); Givebutter and Zeffy (organizations or nonprofits only).

## 2026-09-16 — Luma's form in our own `<dialog>`, not Luma's button script
**Why:** Luma's `checkout-button.js` has to load on every page view, Escape doesn't close its overlay, and its close button has no label. `registration.js` loads Luma's documented embed URL into a native dialog only when someone clicks Register, so Escape, focus return and a labelled Close come from the browser. The Register link still goes to Luma without JavaScript.
**Rejected:** Luma's script, as above; an always-visible iframe in the dashed box (contacts Luma on every visit, and a fixed-height frame is cramped on phones).

## 2026-09-16 — No pause button; a floating "Upcoming" reminder instead
**Why:** Shristi and Saber, meeting 2026-09-16. By then the button paused only the interactive, and someone who paused and forgot would find every mode dead. All of its motion starts only when someone picks a mode or points at it, and the rest of the page is still after load, so a sitewide pause wasn't needed. The corner it used now holds a floating reminder for the upcoming event, shown on every page while registration is open. The system "reduce motion" setting still stills the canvas, confetti and scribble.
**Rejected:** Resetting pause on every mode change (then it pauses nothing); a sitewide floating pause control (puts a non-problem on every page); dropping reduced-motion support along with the button.

## 2026-09-19 — Poster maker artwork is Shristi's homepage interactive
**Why:** Saber asked for Shristi's ten homepage animations to be the centrepiece of the posters, plus keynote and session spotlights with photos and bios. Codex's first version drew three new p5 sketches instead; those were replaced the same day. `poster-stage.js` loads the homepage in a hidden same-origin frame, picks a mode with her own buttons, lets it play, and keeps one frame: SVG copied with computed styles inlined, canvases copied as pixels. Her `:hover` rules are copied onto a class at runtime so posters can show each mode "in play". Her files stay identical; the homepage is the single source, so a change she makes shows up in posters with no second copy to update.
**Export choice:** Full-resolution PNG; Letter/A4 print views for browser save-to-PDF, with raster artwork. SVG layers are redrawn as vectors at export size; canvas layers (Change, Celebration's confetti) are bitmaps at the capture frame's size. Wordmark outline derived from existing typography data. No backend or new runtime dependency.
**Rejected:** Redrawing her modes in poster code (a second copy that drifts from hers); an HTML-to-image library (a new dependency, and weaker on SVG masks and filters); screenshots through a server (the site has no backend). Frames are not reproducible from a number, because her confetti and sketch use `Math.random`; a preset keeps the choices, not the exact frame.

## 2026-09-19 — The poster maker is internal
**Why:** Saber: the tool is for the team, not the public. It stays on the built site so the team can use it from any browser, but no navigation links to it, it carries `noindex, nofollow`, and it hides the floating event reminder (which covered the preview). It only shows information the site already publishes, so an unlisted page is enough.
**Rejected:** Password protection (GitHub Pages has none, and a script-side password is not real protection); keeping it out of the build entirely (then only someone with a local Jekyll setup could use it). That remains a one-line change: add `poster-maker/` to `exclude` in `_config.yml`.
**Also:** short bios and descriptions on posters come from optional `short_bio` / `short_description` fields, falling back to the opening sentence of the full text, and can be edited per poster. They are never written by the tool.

## 2026-10-01 — Poster designs are registered families; the original layout stays as `classic`
**Why:** The first milestone of `poster-maker.md` needs six visually different layouts, and the single stacked layout (`tallLayout()`) cannot grow six variants without becoming unreadable. `poster-art.js` now has a registry (`registerDesign`); each family lives in `poster-designs.js` and draws the whole poster. A state with no `design`, which is every poster saved so far, still takes the original code, moved unchanged into `classic()`: 768 renders across every size, template, keynote, session and panel were compared pixel for pixel with `main`'s renderer, and the comparison fails when the reference is altered by one number (`scripts/compare-poster-renderer.cjs`).
**Rejected:** Branching inside `tallLayout()` per design; rewriting the original layout (it would change every saved poster).
**Also:** A design asked to draw at a size it has no layout for reports a layout problem (export stays off) and previews with `classic`, rather than improvising.

## 2026-10-01 — The design proofs are an internal address, `/poster-maker/?proofs`
**Why:** The proofs need the real event data and a live artwork capture, which only the built page has. An address on the existing page adds no route to keep out of the navigation and the index, is loaded only when asked for (`poster-proofs.js`), and is the seed of the design picker task 3 needs. `scripts/poster-proofs.cjs` renders it, fails on any layout problem, any colour pair under 4.5:1, or any limit falling short of the real data, and writes the review images.
**Rejected:** A separate page (another unlisted route); a throwaway script outside the site (it could not use the real content or the capture).
**Not decided:** which three families to build (needs Saber, Francisca and Shristi), the content-ID scheme, and the storage design. All are proposals in `docs/poster-maker-v2/`.

## 2026-10-01 — Change on a white poster is drawn from a see-through copy of its canvas
**Why:** The homepage hides Change's pale clear colour (#f5f5f2) and the trails it leaves (#f2f2ef) with `mix-blend-mode: darken`, which only works while the page is darker than they are. Paper (#edede9) is; white is not, so the Cs the sketch had passed through exported as a grey ghost behind the chevrons (in 72 recorded frames, up to 130,784 px of the 1100 × 950 artwork, as much as 22 levels under white). The capture now keeps the clear colour on the layer (`clear`, `poster-stage.js`); on a page lighter than it, `poster-art.js` draws the layer as plain pixels, see-through exactly where the paper version shows nothing, with a 24-level ramp. White now shows ink only where paper does: 0 px farther than 2 px from paper's ink in all 72 frames, none of paper's ink dropped, the interiors of solid strokes identical to before.
**Paper is untouched:** the lifted path needs a background lighter than `clear`, which paper never is. Given the same recorded frames, the old and new code export byte-identical paper PNGs at all six sizes through the real Download button, and the other nine animations render identically on both backgrounds (`scripts/compare-poster-renderer.cjs` against `main`, plus a same-frames comparison; see CURRENT.md).
**Rejected:** Widening `copyCanvas()`'s corner tolerance, the obvious one-line fix (the stuck trails are 12 away from the corner colour, the limit is under 10). Tried at 16 and 24, it also changes paper: stroke edges moved by up to 6 levels in all 12 frames, so paper would no longer be pixel-for-pixel what it was. A hard see-through threshold with no ramp (a one-level difference would flip a pixel between white and a 19-level grey).
**Cost and limit:** A second copy of each frame is built the first time White is drawn: 16 MB per frame on a 2× display (4 MB at 1×), 20-40 ms per frame at 2× in headless Chrome 154. Kept pixels keep their colour, which still carries a little of the clear colour, so a one-pixel rim on stroke edges can be up to about 10 levels greyer than a perfect cut-out; it looked clean at 3× zoom and was not measured against a reference. `scripts/verify-poster-white.cjs` guards the behaviour, with a control that has to see the ghost when the fix is bypassed.

## 2026-10-05 — Expose the six portrait families with explicit compatibility
**Why:** The existing proof designs are now useful in the regular maker. Each declares supported content; selecting another size or incompatible content returns to Classic with an explanation. New layouts are scoped by design, content, featured item and size; Classic keeps its old per-size keys so existing presets retain their meaning. Optional `design` and title fields keep v3 presets compatible. Settings/text/layout undo keeps up to 60 snapshots and leaves artwork captures in their existing cache.
**Rejected:** Stretching portrait compositions into unsupported sizes; changing old preset layout semantics; claiming that settings presets or undo preserve a fresh random capture.

## 2026-10-05 — Campaign editability uses native Figma layers and an explicit inventory
**Why:** Saber authorized the separate campaign file. The missing countdowns and teaser cover reuse its components, variables and artwork on a new page, with native text; existing pages and Francisca’s source file stay intact. `docs/FIGMA-POSTERS.md` maps each of the 30 static assets to its frame and distinguishes editable adaptations from exact matches.
**Rejected:** Flattened poster-image imports labelled editable; claiming the MP4s are editable timelines; silently adding the two extra spotlight workshops to public programme data.

## CMS checks and page copy — October 7, 2026

Keep Pages CMS and static Jekyll. Fourteen explicit forms own public YAML, including seven page-copy/metadata files. Recursive validation rejects undeclared nested keys; source-to-render reconciliation rejects dropped/duplicated session cards. Published IDs are compared with the last successful Pages deployment, with exact-baseline, per-ID removal exceptions. Templates retain defensive pending fallbacks, while publishing rejects nonempty invalid assignments.

The prepared Pages Actions workflow validates and builds before uploading its artifact; deploy depends on the build. Production protection requires switching Pages from branch publishing to Actions and verifying a live run. This has not been activated locally. Named IANA zones derive whole-hour offsets from the event date. Event headings/poster lettering bind to shared data without changing fixed designer artwork or owned scripts. Session format/level/language drive posters; legacy tags are only additional topics.

CMS prose uses escaped Markdown and a fixed named-token substitution list; editor HTML/Liquid never executes. Existing image paths stay put; new images use assets/uploads. No framework, JavaScript package manifest, preview service or private content store was added. Hosted-CMS roundtrips remain a distinct verification step; schema projection fixtures do not substitute for them.
