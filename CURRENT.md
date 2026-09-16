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
- Code of conduct contacts are copied from ccfest.rocks (ccfest@processing.org, saber@processing.org, Marie Flanagan). Confirm they're current; the homepage summary uses mrkhanatndv@gmail.com.
- Past events: ccfest.rocks labels its Dec 8 NYC agenda "2022" but the URL and weekday point to 2019; new page says Dec 8, 2019. 2017/2018/2019 SF/2021 rows have no dates or agendas. Agenda links point to ccfest.rocks Squarespace pages, which break if that site is retired.

## Verified vs. untested
- Playwright with local Chrome: both pages at 320/390/768/1440px; no overflow, failed assets, broken anchors, duplicate IDs, hidden revealed copy, or browser errors. Desktop/mobile screenshots inspected.
- Ten mode selections, arrow-key navigation, canvas pause/resume, live reduced-motion changes, offscreen suspension, and no-JavaScript content fallback pass. JS syntax and `git diff --check` pass.
- Supplied Shristi index blob matches remote `10-years-origin` at inspection (tip `9cb772ee7fc9a12531a404a1773880d582f4227f`). No open PR was returned at inspection.
- Untested: Safari/Firefox, real mobile/touch devices, production hosting, checkout (not configured), exact designer approval of manual kerning.

## Open risks / known breakage
- Shristi’s latest email requests waiting for her PR; three modes are unfinished. This is a provisional local integration, not a final branch merge. Celebration has an empty confetti host in the supplied source.
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
Review http://127.0.0.1:8876/ and /register/ with Saber; when Shristi’s PR arrives, compare its animation files and stage markup against the preserved source folder before integrating the remaining modes. Obtain explicit deployment instructions before publishing.

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
