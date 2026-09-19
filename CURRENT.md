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
