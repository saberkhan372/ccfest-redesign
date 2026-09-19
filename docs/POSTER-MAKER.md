# Using the poster maker

`/poster-maker/` makes posters and fliers for Virtual CC Fest. It is an **internal tool**: no site navigation links to it and it asks search engines not to index it (`noindex: true` in its front matter), so only people with the address find it. Everything it shows is already public on the site. To keep it off the published site entirely, add `poster-maker/` to `exclude` in `_config.yml` and run it from a local build.

The artwork is Shristi Singh's homepage interactive: pick one of its ten words and the poster keeps a frame of that animation.

The date line (Bold date, Thin Italic year), the Keynote / Session headings, and the community flier's "Creative coding for everyone." use Francisca's per-letter lettering from Figma, the same data as the site's headings (see [TYPOGRAPHY.md](TYPOGRAPHY.md#posters)). Other poster text (names, titles, bios) has no Figma lettering and is set in plain Anybody.

## Make a poster

1. **Template.** Main announcement, Keynote spotlight, Session spotlight, Panel spotlight, or Community flier.
   - Spotlights add a list of keynotes, sessions, or panels (sessions tagged `Panel`). Panels show their people as a 2 × 2 grid of cards.
   - Photos, names, pronouns, short bios, and session descriptions come from `_data/keynotes.yml` and `_data/sessions.yml`. Posters use the optional `short_bio` and `short_description` fields (in Pages CMS as "Short bio (posters)" and "Short description (posters)") when they are filled in, and otherwise the opening sentence of the full text.
   - The boxes under the list edit the description and bios **for this poster only**; the site is unchanged. Emptying the description hides it. **Use the site's text** undoes the edits.
   - **Include bios** turns bios on or off. Descriptions show on portrait, story, Letter, and A4; square and landscape leave them out because they would be too small to read.
2. **Size.** Portrait, square, story, landscape, US Letter, or A4.
3. **Homepage animation.** Creativity, Change, Connection, Celebration, Collaboration, Creative Commons, Conversations, Community, Curiosity, or Coding. The first time you pick one it plays for a few seconds (about six for Creativity, which draws itself in) before the preview appears.
   - **Show it in play** uses the look the homepage shows when you point at it: question marks for Curiosity, power icons for Coding, confetti for Celebration.
   - **Moment** scrubs through the animation. Picking a word records 12 frames, from the moment the word is picked, through its entrance, to the finished "in play" look; the slider moves between them instantly. It starts on the last, settled frame. Twelve thumbnails under the slider show each moment; click one to pick it. Frames are framed the same way, so the artwork doesn't jump. The copy keeps the homepage's blend modes (Change's canvas uses `darken`, which hides its pale trails) and Creative Commons' column-by-column reveal.
   - **Record it again** records a fresh take. Swinging, confetti, and the Change sketch differ every time.
   - **Show "10 years of …"** keeps or hides the homepage labels. On posters they are set in ink on a small backing so they read over any shape, and they are left out when the artwork is too small to carry them.
4. **Background.** Paper, or White for office printers.
5. **Move and resize.** Drag any block on the preview (wordmark, artwork, event details, people, supporting text, QR code) to move it; select it and drag the blue corner to resize. With the keyboard: Tab to a block, arrow keys move it (Shift for bigger steps), + and − resize, 0 puts it back. Changes are kept per size; **Reset layout for this size** clears them. The footer (registration address and credits) stays fixed.
6. **Download PNG**, or choose Letter/A4 and **Print / save PDF** (the print view has its own button; turn headers and footers off, print at actual size).

Tight spotlights first get a smaller wordmark, then smaller portraits, then slightly smaller text. If a layout still does not fit, or a block is dragged off the poster, the preview says what to change and export stays off until it is fixed. On square, a panel with bios fits, but the bios are small; turning bios off reads better.

Drafts stay in the browser. **Save preset** downloads the choices, text edits, and layout as JSON and **Open preset** restores them. A preset keeps the choices and the moment number, not the exact frame.

## How the artwork gets onto the poster

`poster-stage.js` (host-owned) loads the homepage in an invisible frame behind the page, presses Shristi's own mode button, and copies what her code has drawn at 12 points in time:

- SVG: cloned with each element's computed style written inline, so the animation's current state survives outside her stylesheet. `<defs>` and `<symbol>` content stays as written, so `<use>` still passes on its fill.
- Canvases (Change's p5 sketch, Celebration's confetti): copied as pixels. A flat background colour is made transparent.
- Hover looks: her `:hover` rules for the stage are copied onto a `.poster-hover` class inside the frame only.
- Creative Commons' tiled wallpaper and Curiosity's dots (plain HTML) are redrawn from their computed styles.

`poster-art.js` lays out the frame, scaled evenly and centred on the Cs, with the wordmark, event details, people, QR code, and credits. The layout is measured in a 1000-unit-wide space, so preview and export match.

Her files are not edited or copied. If she changes a mode on the homepage, posters follow.

## Sizes

- Social portrait 1080 × 1350, square 1080 × 1080, story 1080 × 1920, landscape 1200 × 630
- US Letter 2550 × 3300 (300 ppi), A4 2480 × 3508 (about 300 ppi)

SVG artwork is redrawn at export size, so it stays sharp in print. Canvas artwork (Change, confetti) is a bitmap at the capture frame's size (1100 px wide stage), so it is softer on Letter/A4.

## Checks

Build Jekyll into a temporary folder (see [UPDATING.md](UPDATING.md)), serve it, then:

```sh
NODE_PATH=$(npm root -g) node scripts/verify-poster.cjs http://127.0.0.1:8876/
NODE_PATH=$(npm root -g) node scripts/verify.cjs http://127.0.0.1:8876/
git diff --check
```

`verify-poster.cjs` takes a few minutes. It checks all ten animations; every template, size, keynote, session, and panel with and without bios; noindex and no nav link; scrubbing the moment; dragging, corner-resizing, and keyboard moves; text edits surviving a reload; the editor at four widths; PNG sizes; presets; the print view; and the no-JavaScript fallback.

## Known limits

- Captures need the tab to be visible; a capture started in a background tab waits or comes out mid-entrance.
- With "reduce motion" on, the homepage keeps Change's sketch still, so its frame may be empty.
- Tested in Chrome only. Safari and Firefox, a physical print, and a phone scan of a printed QR code are still to do.

## Files

- Host-owned: `poster-stage.js`, `poster-art.js`, `poster-maker.js`, `poster-maker/index.html`, `assets/poster-maker/`, `redesign.css` §11, and in `_layouts/base.html` the poster scripts plus the `noindex` and `hide_event_banner` page flags.
- The optional `short_bio` / `short_description` fields are declared in `.pages.yml`.
- `assets/poster-maker/README.md` explains the wordmark outline and the QR code's destination.
