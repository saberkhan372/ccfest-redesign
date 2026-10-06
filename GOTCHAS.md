# Project gotchas

- Use the CC Fest preview on port 8876. The in-app browser retained another project at 8765 even after reload; fresh Chrome tests did not expose this. Verify the actual user-facing browser tab before delivering a preview. The precise cache mechanism was not diagnosed.

- **Liquid's `blank` does not work in Jekyll 3.10 here.** `nil == blank` evaluates false and `"" != blank` evaluates true, so `{% if thing != blank %}` is not a usable emptiness test. Every optional value in the templates is normalised with `| default: "" | strip` and compared against `""`; optional lists are tested with `| size`. This matters because Pages CMS saves a cleared field as an empty string, not as a missing key — without the normalisation, clearing the event date renders an empty slot instead of "To be confirmed".

- **Pages CMS strips the comments out of a data file the first time it saves it.** The explanatory comments in `_data/*.yml` are for whoever opens the repo; the guidance an editor actually sees lives in the `description:` lines in `.pages.yml`. Keep it there, and expect the YAML comments to disappear.

- **`styles.css` sets `scroll-behavior: smooth` on `<html>`, which quietly breaks hand-written scroll animations.** Every `scrollTo(0, y)` then starts the browser's own easing, so a per-frame tween has each frame fighting a second animation: the page sits still for most of a second and then lurches. The symptom looks like a slow script, not a CSS conflict. Pass `behavior: 'instant'` on every step of a scroll you are animating yourself — `interaction.js` does this where picking a word glides the stage into view.

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

- **Copying the homepage SVG into an image has four traps** (`poster-stage.js`). Shristi's markup has comments like `<!---Newton's Cradle--->`, which HTML accepts and XML rejects, so strip comments before serializing. Computed `mask`/`filter` values come back as absolute page URLs (`url("http://…/#id")`) that don't resolve inside a `data:` image; rewrite them to `url(#id)`. Don't inline computed styles on `<defs>`/`<symbol>` content: the root's `fill="none"` gets written onto the scribble path and blocks the fill it should inherit from `<use>`. And Collaboration's `translate: -12.006%` on a `fill-box` lands somewhere else once the SVG is an image; convert it to user units with `getBBox()`.

- **`loading="lazy"` images look broken to a checker that only waits a fixed time.** `verify.cjs` scrolled each section into view and then waited a flat 900ms, which was not enough for the ten posters on `past-events/` at 768px — and at that width only. Scrolling past a lazy image starts it; it does not finish it, so `complete` was false and `naturalWidth` 0, and the run reported ten broken images that served 200 the whole time. The script now flips any unfinished image to eager and awaits its `load` or `error` (5s cap each) before it measures. Either event settles the image, so a real 404 or a real zero-width file still fails the check.

- **Pages CMS drops every key it does not declare.** It rebuilds an entry from the fields in `.pages.yml` (read in its source, `lib/schema.ts`, `deepMap`, applied inside list items too), so a key added to `_data/*.yml` and left out of `.pages.yml` disappears on the next CMS save. Any new data key needs its field declared in the same change. A hidden `uuid` field (`type: uuid`, `hidden: true`) is how to keep an identifier out of the editor; a bug that regenerated hidden defaults on every save was closed as fixed in 2.0.0 and has not been checked with a real save here.

- **A stale Pages CMS form can also drop fields already declared in the repository.** Commit `771f63e` removed `id`, `format`, `schedule_id`, `level` and `language` from every session, although `.pages.yml` had declared them in `5ccf6b5`. The remaining keys match the older form, consistent with a CMS tab still using that schema; the browser session itself was not inspected. Reload the CMS and reopen the form after schema changes, and confirm those fields are visible before saving. Restore only missing metadata when recovering, so new descriptions survive. Required ID/Format fields help with current forms but cannot protect a stale form that does not know about them.

- **The repo sits in iCloud-synced Documents, and reading a file there costs about a second.** An `rsync` of the whole working tree took minutes and looked hung. Copy only what Jekyll needs for a build (skip `docs/`, `scripts/`, `design/`, the notes, the designers' folders and the recordings), or build from `git archive`, and run long jobs in the background. Once, `git status` listed the ignored designers' folders as untracked for a moment and then corrected itself; a second `git status` is worth running before believing a surprise.

- **macOS has no `timeout`, and zsh does not word-split an unquoted variable.** `timeout 60 node …` fails with "command not found", and `node x.cjs $args` passes all of `$args` as one argument. Each cost a test run.

- **`git push` over HTTPS fails with HTTP 400 once a push carries a few megabytes.** The default `http.postBuffer` is 1 MiB, so a push holding the 9 MB of poster review media was refused ("RPC failed; HTTP 400 … the remote end hung up unexpectedly") and nothing reached GitHub. `git -c http.postBuffer=524288000 push …` worked, with no change to the repo's config. Keep large binaries in a commit of their own so they can be dropped.

- **Change's canvas only looks clean because a blend mode hides its pale trails, and only over paper.** The sketch clears itself with #f5f5f2 at 15% each frame, so 8-bit rounding leaves old trails stuck at #f2f2ef (3 levels under it, alpha 255, where never-stroked pixels sit at alpha 252). `copyCanvas()` keys out pixels within 10 of the corner colour; these are 12 away. `darken` hides them over paper (#edede9) and shows them over white as a ghost of the Cs. `artwork()` in `poster-art.js` lifts a layer that carries `clear` when the page is lighter than that colour, so anything new that draws the artwork must go through it. Widening `copyCanvas()`'s tolerance is not the fix: it changes paper's stroke edges.

- **A Change recording made right after seconds of heavy canvas drawing in the same page came out static** (a C with a bar, identical for moments 2-12), while the same sequence in a fresh page recorded the chevrons. Seen three times in a comparison script that rendered Letter-size posters between captures; not diagnosed, and the maker's own flows have not shown it. Record in a quiet page, and look at the frames before trusting numbers taken from them.
