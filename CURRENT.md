# Current state — CC Fest redesign

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

## Next task
Add the Zoom Events link in Luma when Saber sends it. Before the event, import mailing-list opt-ins from Luma into EmailOctopus. Register once through the live popup (Saber, with his own details) and confirm the email arrives. Send Shristi the earlier review notes.
