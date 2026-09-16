# Updating the site

Step-by-step for the updates that actually come up: new design work from Francisca, Shristi's interactive, and confirmed event details.

Related: [CMS.md](CMS.md) (editing content without code) · [MAILING-LIST.md](MAILING-LIST.md) (sign-ups and sending) · [TEMPLATE.md](TEMPLATE.md) (how the site is built) · [TYPOGRAPHY.md](TYPOGRAPHY.md) (the lettering pipeline) · [../AGENTS.md](../AGENTS.md) (rules for AI agents).

**Before any update**

The pages are built by Jekyll now, so serve the build, not the source:

```bash
jekyll build --destination /tmp/ccfest-site && npx http-server /tmp/ccfest-site -p 8881 -c-1
```

Then open http://127.0.0.1:8881/. Nothing is published until someone pushes `main`, so work freely and check it locally. (`python3 -m http.server` drops requests under a headless browser and will show you an unstyled page — use `http-server`.)

**Most content updates need none of this.** Dates, speakers, sessions, past events, camps and the footer details are form fields now; see [CMS.md](CMS.md).

---

## 1. Francisca sends a new or updated Figma frame

She usually emails a prototype link. What matters is the **file key** and the **node id** from the URL: `figma.com/design/<fileKey>/…?node-id=<node-id>`. Today's file key is `jMiMzds3qYD2mO5w2Dsg4P`; frames are Homepage `218:104` and Register `251:732`.

1. **Look at what changed.** Open her frame beside the local page. Note new sections, colours, spacing, and any text whose letters look individually adjusted.
2. **Update the lettering data** if headings or logos changed: follow [TYPOGRAPHY.md](TYPOGRAPHY.md) to read the text runs from Figma into `design/figma-typography.json`, then:

   ```bash
   node scripts/sync-typography.cjs
   ```

   It only rewrites the `<span data-figma-run>` markup and is safe to re-run.
3. **Update the markup** in the page's HTML to match her structure, reusing the patterns in [TEMPLATE.md](TEMPLATE.md).
4. **Update the styles** in the matching section of `redesign.css` (each page has its own section). Keep colours on the tokens at the top.
5. **Export shapes** she added as SVG into `assets/design/` and reference them with `alt=""` and `aria-hidden="true"` when decorative.
6. **Keep unconfirmed content honest.** Her frames contain placeholders like `[Keynote name]` and `[Session title]`. Never publish those. Keep her layout and write "to be announced" copy until details are real.
7. **Check it** at 1440, 768, and 375px: no sideways scrolling, headings unbroken, nothing overlapping. Run `node scripts/verify.cjs http://127.0.0.1:8876/` if Playwright is installed.
8. **Reply to her** with what you changed, anything you simplified, and anything you could not reproduce. She has said plainly: "If anything is to be changed or simplified just let me know."

**Known limits, worth repeating to her**
- Figma's generated code reports letter-spacing against a 16px base, so percentages are the reliable source.
- Per-letter *width* values aren't exposed by Figma's API. Read them from the Type panel, or check the result by measuring (see TYPOGRAPHY.md).
- Leftover fonts (Syne, DM Sans, JetBrains Mono) still appear on some layers. The site uses Anybody and Overpass Mono. She is choosing a replacement mono after Shristi's feedback.

---

## 2. Shristi's interactive (her pull request)

Her files are `animations.css`, `animations.js`, and the drawing half of `change-sketch.js`. She works on the `10-years-origin` branch and asked that it not be merged until she opens a pull request. Three of the ten monogram modes were still unfinished at last word.

1. **Fetch her branch**, don't merge yet:

   ```bash
   git fetch origin 10-years-origin
   git diff main origin/10-years-origin -- animations.css animations.js change-sketch.js
   ```
2. **Compare with the preserved copy** in `Shristi-ccfest-redesign-10-years-origin/`, which is her earlier snapshot. Never edit that folder.
3. **Take her versions of her files whole.** Don't hand-patch her keyframes or canvas code.
4. **Re-apply host-side needs** if her update drops them. These live outside her files on purpose:
   - `redesign.css` section 7 (stage sizing, mode buttons, pause button, no-JS and paused states)
   - `interaction.js` (pause button, `prefers-reduced-motion`)
   - `change-sketch.js` lifecycle: the canvas must stop when paused, offscreen, hidden, or in another mode
5. **Check the whole interactive**: all ten modes, arrow-key navigation, the pause button, reduced motion, scrolling it out of view, and the page with JavaScript disabled. `scripts/verify.cjs` covers all of this.
6. **Keep her credit** in the footer (`.design-credits`).

---

## 3. Confirmed event details

Only put in what's actually confirmed. Everything below starts as "to be announced".

| What | Where |
|---|---|
| Event date | `_data/event.yml` → `date`. Fills the facts strip, the homepage band and the Events card at once. |
| Keynote speakers | `_data/keynotes.yml` |
| Session schedule | `_data/sessions.yml` |
| Registration link | `_data/event.yml` → `registration_url` |
| A past event | `_data/past_events.yml` → `events`, newest first |

All five are also forms in the CMS, so this is usually a job for the admin UI rather than the editor.

**The date in the title is the one thing a form cannot fix.** The hero title carries Francisca's blank date as underscores (`________,`), drawn from the Figma data. Filling in `date` updates the facts, the cards and the spoken name — but not the lettering. When the date is confirmed, edit that run's text in `design/figma-typography.json` and re-run the sync script.

---

## 4. The Figma export of the live site

There is a second Figma file, **[CC Fest — Live site export](https://www.figma.com/design/Y3V7lndexqkUZhtppXXE3a)** (key `Y3V7lndexqkUZhtppXXE3a`), holding all six pages as 1440px frames for designers who want to sketch changes against what's actually shipped.

- It is a **copy for editing, not a source of truth.** The site is the original; nothing flows back automatically. Treat changes there as a design proposal, then apply them to the code by workflow 1 above.
- Colours are bound to the "CC Fest tokens" variable collection; the header and footer are components.
- Known gaps, also written on the file's READ ME frame: per-letter `wdth` values can't be set through Figma's API (nearest named styles are used; per-letter spacing survives), the homepage monogram is a live interactive and appears as a dashed slot, and text re-wraps slightly differently from the browser.
- To refresh it after the site changes, rebuild the affected frame with the Figma MCP `use_figma` tool against that file key. Keep Francisca's `CCFest_21MAR2026` read-only.

## 5. Adding a page

Copy the closest existing page (usually `events/index.html`), then follow the recipe in [TEMPLATE.md](TEMPLATE.md#recipe-add-a-new-page). Remember to add the path to `PAGES` in `scripts/verify.cjs`, and to the nav on every page.

---

## 6. Before publishing

- [ ] Checked at 1440, 768, and 375px
- [ ] `jekyll build` succeeds, and the built pages differ from the previous build only where you meant them to
- [ ] `node scripts/sync-typography.cjs` run, and re-running changes nothing
- [ ] `node scripts/verify.cjs http://127.0.0.1:8881/` passes (or say plainly that Playwright isn't installed)
- [ ] No placeholder or invented content
- [ ] Designer credits still in every footer
- [ ] Saber has approved publishing

Publishing is a push to `main`; GitHub Pages deploys from the repository root.
