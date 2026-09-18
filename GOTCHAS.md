# Project gotchas

- Use the CC Fest preview on port 8876. The in-app browser retained another project at 8765 even after reload; fresh Chrome tests did not expose this. Verify the actual user-facing browser tab before delivering a preview. The precise cache mechanism was not diagnosed.

- **Liquid's `blank` does not work in Jekyll 3.10 here.** `nil == blank` evaluates false and `"" != blank` evaluates true, so `{% if thing != blank %}` is not a usable emptiness test. Every optional value in the templates is normalised with `| default: "" | strip` and compared against `""`; optional lists are tested with `| size`. This matters because Pages CMS saves a cleared field as an empty string, not as a missing key — without the normalisation, clearing the event date renders an empty slot instead of "To be confirmed".

- **Pages CMS strips the comments out of a data file the first time it saves it.** The explanatory comments in `_data/*.yml` are for whoever opens the repo; the guidance an editor actually sees lives in the `description:` lines in `.pages.yml`. Keep it there, and expect the YAML comments to disappear.

- **`python3 -m http.server` is not reliable enough to test against.** It is single-threaded and drops parallel requests from a headless browser, which shows up as a page that renders unstyled and a screenshot comparison that "fails" for no reason. It cost one false result during the CMS work. Use `npx http-server <dir> -p 8881 -c-1` instead.

- **Native Ruby gems will not compile on this Mac as shipped.** The Command Line Tools are clang 15, which predates `<stdckdint.h>`, but Homebrew's Ruby headers include it, so every gem with a C extension fails. The workaround used here: install `ruby@3.4` and drop a three-macro `stdckdint.h` shim (built on `__builtin_*_overflow`) into `/opt/homebrew/Cellar/ruby@3.4/*/include/ruby-3.4.0/`. Updating the Command Line Tools is the real fix.

- **GitHub Pages adds a theme unless you say no.** With no `theme` key in `_config.yml`, the Pages build falls back to `jekyll-theme-primer` and deploys ~130KB of CSS that no page links to. `_config.yml` now carries an empty `theme:` line to stop that. Verified by building with the `github-pages` gem (v232, which pins Jekyll 3.10.0) in `--safe` mode.

- **Build Jekyll with a UTF-8 locale.** Without `LANG`/`LC_ALL` set, Ruby reads files as US-ASCII and the build dies on the first em dash ("Invalid US-ASCII character \xE2"). GitHub's builders set UTF-8; a local shell may not.

- **Liquid does not escape `{{ }}`, so every editor-supplied value carries `| escape`.** Without it, an ampersand or an angle bracket typed into a CMS field lands raw in the HTML — a name like "Ada & Grace" produces invalid markup, and a `<script>` tag would be live. Because the values are escaped on the way out, they are stored unescaped in `_data`: `camps.yml` holds `Details & interest list`, not `&amp;`. Do not re-add entity escapes to the data files.

- **A half-filled CMS row used to hide the honest fallback.** A keynote with a label but no name, or a session with a time but no title, counted towards the list and so replaced the "to be announced" layout with a blank card. Entries now only count once they carry the field the card is built around (`name` for a keynote, `title` for a session), and incomplete rows are skipped when rendering.

- **An absolutely positioned `<svg>` with only `height` set takes its width from the viewBox ratio, not from `left`/`right`.** Shristi's Connection layer at `height: 100%` came out 1585px wide on a 1440px stage and shifted right. Set `width` and `height` both, and let `preserveAspectRatio` centre the art.

- **The in-app browser reports `document.hidden === true` while its pane is hidden,** so the p5 canvas correctly refuses to loop there and the Change mode looks broken. Test motion with Playwright (headless Chrome is "visible") or with the pane open.

- **Playwright is installed globally, not in the repo.** Run scripts with `NODE_PATH=/opt/homebrew/lib/node_modules node scripts/verify.cjs <url>`.

- **Old `http-server` processes linger on ports 8880–8888** from earlier sessions. Pick a free port (8895 was used on 2026-09-16) rather than assuming 8881 serves the current build.

- **Jekyll copies every untracked file in the repo root into the build,** including the ~500MB screen recordings. Build from a copy that excludes `*.mov`, or move the recordings out.

- **Luma event pages refuse to be framed; only the embed URL works.** `luma.com/<slug>` and `luma.com/event/evt-…` send `X-Frame-Options: SAMEORIGIN`, while `luma.com/embed/event/evt-…/simple` has no such header. The dialog needs the `evt-…` id, not the public URL. (If anyone does switch to Luma's `checkout-button.js`, the script tag needs `id="luma-checkout"`: the script finds its own stylesheet through that id, and without it requests `/checkout-button.css` from our own site.)

- **Escape doesn't close the registration dialog while focus is inside Luma's form.** Key presses inside a cross-origin iframe never reach the page. Close and the backdrop still work.

- **After a deploy, a browser can show the new page with the previous deploy's CSS.** GitHub Pages serves every file with `cache-control: max-age=600`, so for up to ten minutes a visitor can get new HTML with a cached stylesheet. That is how the registration dialog first appeared unstyled, at the browser's default 300×150 iframe size. `_layouts/base.html` now adds `?v=<commit>` (`site.github.build_revision`) to local CSS and JS URLs. The value only exists on GitHub's builders, so local builds print plain URLs and stay byte-identical. Any new local stylesheet or script needs the same `{{ v }}`.

- **A component with its own `display` ignores the `hidden` attribute.** The browser's `[hidden] { display: none }` has the lowest specificity, so `.event-banner { display: flex }` kept the reminder on screen after Hide was pressed. Every such component needs its own `[hidden] { display: none }`.

- **Scroll with `behavior: 'instant'` in browser checks.** The site scrolls smoothly, so a check that calls `scrollTo()` and then measures reads positions mid-scroll. It made the footer-overlap check fail at random.

- **`.signup-embed` is capped at 420px in section 6, so a later, narrower class of equal weight loses.** The homepage's smaller copy of the form first came out full-width because `.signup-embed-compact` sat earlier in `redesign.css` than `.signup-embed`. The compact rules are prefixed `.mailing-section` instead, which is also what outweighs EmailOctopus's own injected stylesheet.
