# CC Fest site template

How the site is put together, and how to build a page that matches it.

Related: [UPDATING.md](UPDATING.md) (designer updates and event details) · [TYPOGRAPHY.md](TYPOGRAPHY.md) (the lettering pipeline) · [../AGENTS.md](../AGENTS.md) (rules for AI agents).

## At a glance

- Plain static HTML, CSS, and a little JavaScript. No framework, no build step, no packages to install.
- GitHub Pages publishes from the root of `main`, so pushing `main` publishes.
- Design: Francisca José Rodrigues (Figma). Interactive: Shristi Singh. Integration: Saber.

Preview locally:

```bash
python3 -m http.server 8876 --bind 127.0.0.1
```

Use port 8876 — see [../GOTCHAS.md](../GOTCHAS.md).

## Files

| Path | Role | Owner |
|---|---|---|
| `index.html` | Homepage | Saber |
| `register/index.html` | Event page (Figma frame 251:732) | Saber |
| `events/`, `past-events/`, `mailing-list/`, `code-of-conduct/` | Inner pages (`body.inner-page`). **Best starting point for a new page.** | Saber |
| `styles.css` | Base layout: tokens, header, sections, buttons, footer | Saber |
| `animations.css` | Motion: load and scroll reveals, the ten-mode interactive | **Shristi** |
| `redesign.css` | The current look, layered on the base. Sectioned and commented. | Saber + Francisca |
| `animations.js` | Scroll reveals and the mode switcher | **Shristi** |
| `change-sketch.js`, `celebration-confetti.js`, `creativity-scribble.js`, `coding-power.js` | Change, Celebration, Creativity, and Coding modes | **Shristi** |
| `interaction.js` | Pause button, reduced motion, p5 canvas lifecycle | Saber |
| `assets/fonts/` | Anybody (variable, upright + italic), Overpass Mono, with licences | — |
| `assets/design/` | SVG shapes exported from Figma | — |
| `design/figma-typography.json` | Letter-level type data read from Figma | generated |
| `design/typography-review.html` | Figma image vs. browser text comparison | generated |
| `scripts/sync-typography.cjs` | Writes the lettering into the HTML | — |
| `scripts/verify.cjs` | Browser checks for every page | — |
| `Shristi-ccfest-redesign-10-years-origin/`, `figma-to-html*/` | Designers' original files. Reference only — never edit, never link at runtime. | Shristi / Francisca |

## How the CSS layers

Stylesheets load in this order, and later files win:

1. `styles.css` — structure and default tokens
2. `animations.css` — homepage only, motion states
3. `redesign.css` — the current look

Inner pages and the event page load only `styles.css` and `redesign.css`. Paths are relative, so pages in a subfolder use `../`.

**To change the look, edit `redesign.css`.** It is organised into numbered sections — fonts, tokens, shared, homepage, event page, inner pages, interactive overrides, lettering hooks, responsive, reduced motion — with a map at the top of the file. Leave `styles.css` for structural changes and `animations.css` for Shristi.

### Design tokens

Defined at the top of `redesign.css`. Change one here and it updates everywhere.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#edede9` | Page background |
| `--surface` | `#f4f4f1` | Header, tinted sections |
| `--tint` | `#e5e5e2` | Subtle fills |
| `--ink` | `#18181a` | Text, dark bands |
| `--muted` | `#62625e` | Secondary text |
| `--line` / `--soft-line` | `#c4c4c0` / `#dcdcd8` | Borders |
| `--accent` | `#2d5bff` | Blue: buttons, links, some headings |
| `--orange` | `#ff4d2e` | Upcoming band, event facts |
| `--lime` | `#c5ff32` | Mailing list, registration band |
| `--page-width` | `1440px` | Max content width (the Figma frame width) |
| `--page-pad` | `clamp(1.25rem, 4.45vw, 4rem)` | Side gutter |

Small text on orange or lime needs a darker colour (for example `#8f260f`, `#b12b14`) to stay readable.

### Type roles

| Role | Font | Notes |
|---|---|---|
| Body | Anybody, weight 300 | Set on `body` |
| Display headings, logos | Anybody variable | Letter-level settings from Figma — see [TYPOGRAPHY.md](TYPOGRAPHY.md) |
| Labels, eyebrows, section numbers, tags | Overpass Mono, 10–13px | `.eyebrow`, `.section-heading > p`, `.session-time`, `.tag-row span` |

## Page skeleton

Copy this from an existing page rather than typing it out.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="…">
    <meta name="theme-color" content="#edede9">
    <title>Page name — CC Fest</title>
    <link rel="icon" href="../assets/favicon.png">
    <link rel="stylesheet" href="../styles.css">
    <!-- animations.css + the .js gate script go here, only if the page uses .anim-* hooks -->
    <link rel="stylesheet" href="../redesign.css">
  </head>
  <body class="inner-page">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <a class="logo" href="../" aria-label="CC Fest home">CC FEST</a>
      <nav aria-label="Main navigation">
        <a href="../events/">Events</a>
        <a href="../mailing-list/">Mailing List</a>
        <a href="../past-events/">Past Events</a>
        <a href="../code-of-conduct/">Code of Conduct</a>
      </nav>
    </header>
    <main id="main-content">
      …sections…
    </main>
    <footer class="site-footer page-width">
      …logo, tagline, email…
      <p class="design-credits">Design: … · Interactives: …</p>
    </footer>
  </body>
</html>
```

Keep: `lang`, the skip link, one `<h1>`, `aria-labelledby` on each section, `aria-current="page"` on the current nav link, and the designer credits.

## Section patterns

`.page-width` centres content and adds the side gutters. Full-bleed coloured sections put `.page-width` on an inner `div`; plain sections put it on the `section` itself.

**Numbered heading** — used on the event page and inner pages:

```html
<div class="section-heading">
  <p>01</p>
  <div>
    <h2 id="keynotes-title">Keynotes</h2>
    <p>One-line intro.</p>
  </div>
</div>
```

**Page hero** (inner pages): `<section class="hero page-hero page-width">` with `.eyebrow`, `<h1 id="page-title">`, `.hero-summary`, and optional `.hero-actions` buttons.

**Buttons:** `.button` (outline) and `.button-solid` (blue).

| Pattern | Page | Markup |
|---|---|---|
| Facts strip | event | `.event-facts` > `.page-width.facts-grid` > `div` with `span` + `strong` |
| Keynotes | event | `.keynote-layout`: shape `img` then one `.keynote-card` per speaker |
| Sessions | event | one `.session-row` per session: `.session-time`, `.session-presenter`, `.session-details` with `.tag-row` |
| Registration | event | `.registration-band` (lime) with `.embed-notice` |
| Event cards | events/ | `ul.event-list` > `li.event-card` (`.event-card-orange` features one); copy in a `div`, facts in a `dl` |
| Archive rows | past-events/ | `ol.past-list` > `li.past-row` with `time`, `.past-place`, link or `.past-title` |
| Signup panel | mailing-list/ | `.signup-panel`, `.signup-list`, `.signup-note` |
| Long-form text | code-of-conduct/ | `.coc-layout` with sticky `nav.coc-toc` and `.prose`; `.do-dont`; `.contact-card` |

**Unconfirmed content.** Keep the layout, write honest copy ("to be announced"). Never ship Figma's bracketed placeholders, and never invent speakers, times, dates, or checkout links.

## The homepage interactive

`<section class="anim-stage" data-mode="creativity">` holds Shristi's ten-mode monogram.

- Tabs `.mode-btn[role="tab"][data-mode]`: creativity, change, connection, celebration, collaboration, creative-commons, conversations, community, curiosity, coding.
- `animations.js` copies the chosen mode onto `#monogramWrap`, `.anim-stage-main`, and `.anim-stage`; CSS styles each mode via `[data-mode="…"]`.
- "Change" draws on a p5.js canvas (`change-sketch.js`); `interaction.js` runs it only while visible, selected, and not paused.
- Celebration, Creativity, and Coding have their own scripts; Creativity fetches its scribbles from `assets/animation/` at runtime.
- `.motion-toggle` pauses everything; `prefers-reduced-motion` pauses automatically.
- Updating it from her pull requests: [UPDATING.md](UPDATING.md#2-shristis-interactive-her-pull-requests).

## Animation hooks

Add these classes to markup; `animations.css` supplies the motion. Hidden states apply only under `html.js`, so content stays visible without JavaScript.

| Class | Effect |
|---|---|
| `.anim-nav` | Header slides in on load |
| `.anim-hero-title`, `.anim-hero-rule`, `.anim-hero-sub` | Hero entrance on load |
| `.anim-scroll` | Fade up when scrolled into view |
| `.anim-chip` | Staggered fade up (inside `.location-chips` or `.chips`) |
| `.anim-upcoming-copy`, `.anim-upcoming-meta` | Slide in from left / right |

A page using these needs, in `<head>`: `animations.css`, then `<script>document.documentElement.classList.add('js')</script>`, then `redesign.css`; and before `</body>`: `<script src="../animations.js" defer></script>`.

## Recipe: add a new page

1. Copy the closest existing page (usually `events/index.html`). Fix the relative paths for the folder depth.
2. Update `<title>`, the meta description, the nav (including which link carries `aria-current="page"`), and section ids.
3. Build sections from the patterns above. Add any new styles to the inner-pages section of `redesign.css`.
4. For headings that need Francisca's lettering, register them in `scripts/sync-typography.cjs` and follow [TYPOGRAPHY.md](TYPOGRAPHY.md).
5. Link the page from the nav on every other page.
6. Add the path to `PAGES` in `scripts/verify.cjs`.
7. Check at 320, 390, 768, and 1440px.

## Recipe: change a heading that uses Figma lettering

Don't edit the `<span data-figma-run>` markup — the sync script overwrites it. Edit the runs in `design/figma-typography.json`, then:

```bash
node scripts/sync-typography.cjs
```

## Deploy

Pushing `main` publishes to GitHub Pages. Confirm with Saber first.
