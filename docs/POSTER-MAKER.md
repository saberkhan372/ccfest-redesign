# Using the poster maker

`/poster-maker/` makes posters and fliers for Virtual CC Fest. It is an **internal tool**: no site navigation links to it and it asks search engines not to index it (`noindex: true` in its front matter), so only people with the address find it. Everything it shows is already public on the site. To keep it off the published site entirely, add `poster-maker/` to `exclude` in `_config.yml` and run it from a local build.

The artwork is Shristi Singh's homepage interactive: pick one of its ten words and the poster keeps a frame of that animation.

The date line (Bold date, Thin Italic year), the Keynote / Session headings, and the community flier's "Creative coding for everyone." use Francisca's per-letter lettering from Figma, the same data as the site's headings (see [TYPOGRAPHY.md](TYPOGRAPHY.md#posters)). Other poster text (names, titles, bios) has no Figma lettering and is set in plain Anybody.

## Make a poster

1. **Content.** Main announcement, Keynote spotlight, Session spotlight, Panel spotlight, or Community flier.
   - Spotlights add a list of keynotes, sessions, or panels (sessions tagged `Panel`). Panels show their people as a 2 × 2 grid of cards.
   - Photos, names, pronouns, short bios, and session descriptions come from `_data/keynotes.yml` and `_data/sessions.yml`. Posters use the optional `short_bio` and `short_description` fields (in Pages CMS as "Short bio (posters)" and "Short description (posters)") when they are filled in, and otherwise the opening sentence of the full text.
   - The boxes under the list edit the session title, description and bios **for this poster only**; the site is unchanged. Emptying the description hides it. **Use the site's text** undoes the edits. Titles must contain 1–200 plain-text characters.
   - **Include bios** turns bios on or off. Descriptions show on portrait, story, Letter, and A4; square and landscape leave them out because they would be too small to read.
2. **Size and design.** Portrait, square, story, landscape, US Letter, or A4. Classic supports all six sizes. Portrait also offers Signature, Bold date, Art-led, and Minimal print for announcements/community fliers; Speaker-led for keynotes; and Program-led for sessions/panels. Use the thumbnails or the Design selector. Changing to an incompatible content type or size returns to Classic. Minimal print is currently a portrait composition; choose Classic for Letter/A4. Program-led supports one presenter or a three/four-person grid; choose Classic for two presenters.
3. **Homepage animation.** Creativity, Change, Connection, Celebration, Collaboration, Creative Commons, Conversations, Community, Curiosity, or Coding. The first time you pick one it plays for a few seconds (about six for Creativity, which draws itself in) before the preview appears.
   - **Show it in play** uses the look the homepage shows when you point at it: question marks for Curiosity, power icons for Coding, confetti for Celebration.
   - **Moment** scrubs through the animation. Picking a word records 12 frames, from the moment the word is picked, through its entrance, to the finished "in play" look; the slider moves between them instantly. It starts on the last, settled frame. Twelve thumbnails under the slider show each moment; click one to pick it. Frames are framed the same way, so the artwork doesn't jump. The copy keeps the homepage's blend modes (Change's canvas uses `darken`, which hides its pale trails on paper; see "Change on White" below) and Creative Commons' column-by-column reveal.
   - **Record it again** records a fresh take. Swinging, confetti, and the Change sketch differ every time.
   - **Show "10 years of …"** keeps or hides the homepage labels. On posters they are set in ink on a small backing so they read over any shape, and they are left out when the artwork is too small to carry them.
4. **Background.** Paper, or White for office printers. Change's pale trails are tuned to the paper, so on White the maker draws them see-through and only the pink and yellow shapes print ([below](#change-on-white)).
5. **Move and resize.** Drag any block on the preview (wordmark, artwork, event details, people, supporting text, QR code) to move it; select it and drag the blue corner to resize. With the keyboard: Tab to a block, arrow keys move it (Shift for bigger steps), + and − resize, 0 puts it back. Changes are kept per size; **Reset layout for this size** clears them. The footer (registration address and credits) stays fixed.
6. **Download PNG**, or choose Letter/A4 and **Print / save PDF** (the print view has its own button; turn headers and footers off, print at actual size).

Tight spotlights first get a smaller wordmark, then smaller portraits, then slightly smaller text. If a layout still does not fit, or a block is dragged off the poster, the preview says what to change and export stays off until it is fixed. On square, a panel with bios fits, but the bios are small; turning bios off reads better.

**Undo / Redo** restores settings, poster-only text and layout changes (up to 60 states). A drag or continuous text/slider edit counts as one step. Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z work outside text inputs; text fields retain their native undo behavior. Recording fresh artwork is not an undoable operation. New designs keep layout adjustments separately for each design, featured item and size; Classic retains the older per-size layout behavior.

Notes under the preview disclose shortened or omitted copy. A design may intentionally leave out the supporting line or festival times; those remain in the suggested caption. Review both before sharing. PNGs do not embed alt text.

Drafts stay in the browser. When browser storage is unavailable, the editor says so. **Save preset** downloads the choices, design, text edits, and layout as JSON and **Open preset** restores them. A preset keeps the choices and the moment number, not the exact frame. Existing v3 presets without a design open as Classic.

The editor links to the editable Figma campaign. See [FIGMA-POSTERS.md](FIGMA-POSTERS.md) for direct frame links and editability limits.

## How the artwork gets onto the poster

`poster-stage.js` (host-owned) loads the homepage in an invisible frame behind the page, presses Shristi's own mode button, and copies what her code has drawn at 12 points in time:

- SVG: cloned with each element's computed style written inline, so the animation's current state survives outside her stylesheet. `<defs>` and `<symbol>` content stays as written, so `<use>` still passes on its fill.
- Canvases (Change's p5 sketch, Celebration's confetti): copied as pixels. A flat background colour is made transparent, and kept on the layer as `clear`.
- Hover looks: her `:hover` rules for the stage are copied onto a `.poster-hover` class inside the frame only.
- Creative Commons' tiled wallpaper and Curiosity's dots (plain HTML) are redrawn from their computed styles.

`poster-art.js` lays out the frame, scaled evenly and centred on the Cs, with the wordmark, event details, people, QR code, and credits. The layout is measured in a 1000-unit-wide space, so preview and export match.

Her files are not edited or copied. If she changes a mode on the homepage, posters follow.

### Change on White

Change's sketch repaints itself with `#f5f5f2` at 15% every frame, and 8-bit rounding leaves each old trail stuck a few levels under that (`#f2f2ef`). The homepage blends the canvas with `darken`, which hides all of it while the page is darker than `#f5f5f2`, as the paper (`#edede9`) is. White is lighter, so `darken` would keep it and the Cs the sketch has passed through would print as a faint grey ghost behind the pink and yellow shapes.

So when the page is lighter than a layer's `clear` colour, `poster-art.js` draws that layer as plain pixels instead (`keyedForLight`), see-through exactly where the paper version shows nothing, with a 24-level ramp so a fading trail ends softly. White therefore shows ink only where paper does. Paper never takes this path: given the same recorded frames, the old and new code export byte-identical paper PNGs at all six sizes. A second, see-through copy of each frame is built the first time White is drawn, and it stays while the recording does: about 16 MB per frame on a 2× display (4 MB at 1×), and 20–40 ms per frame at 2× (headless Chrome 154 on macOS), so switching to White pauses for roughly a quarter of a second while the twelve thumbnails are made.

`copyCanvas()`'s own tolerance was left alone on purpose: widening it (tried at 16 and 24) also makes the stuck trails transparent on paper, and that changed the stroke edges there by up to 6 levels in every frame.

Other animations carry no `clear`, so they draw as before on both backgrounds.

## Sizes

- Social portrait 1080 × 1350, square 1080 × 1080, story 1080 × 1920, landscape 1200 × 630
- US Letter 2550 × 3300 (300 ppi), A4 2480 × 3508 (about 300 ppi)

SVG artwork is redrawn at export size, so it stays sharp in print. Canvas artwork (Change, confetti) is a bitmap at the capture frame's size (1100 px wide stage), so it is softer on Letter/A4.

## Checks

Build Jekyll into a temporary folder (see [UPDATING.md](UPDATING.md)), serve it, then:

```sh
NODE_PATH=$(npm root -g) node scripts/verify-poster.cjs http://127.0.0.1:8876/
node scripts/verify-poster-state.cjs
NODE_PATH=$(npm root -g) node scripts/verify-poster-white.cjs http://127.0.0.1:8876/
NODE_PATH=$(npm root -g) node scripts/verify.cjs http://127.0.0.1:8876/
git diff --check
```

`verify-poster-white.cjs` takes about fifteen seconds: it records Change and checks that on White ink appears only where paper has it, that none is dropped, and that paper is untouched (with a control that must see the ghost when the fix is bypassed).

`verify-poster.cjs` takes a few minutes. It checks all ten animations; every template, size, keynote, session, and panel with and without bios; noindex and no nav link; scrubbing the moment; dragging, corner-resizing, and keyboard moves; text edits surviving a reload; the editor at four widths; PNG sizes; presets; the print view; and the no-JavaScript fallback.

## Known limits

- Captures need the tab to be visible; a capture started in a background tab waits or comes out mid-entrance.
- With "reduce motion" on, the homepage keeps Change's sketch still, so its frame may be empty.
- Tested in Chrome only. Safari and Firefox, a physical print, and a phone scan of a printed QR code are still to do.

## Files

- Host-owned: `poster-stage.js`, `poster-art.js`, `poster-designs.js`, `poster-proofs.js`, `poster-history.js`, `poster-maker.js`, `poster-maker/index.html`, `assets/poster-maker/`, `redesign.css` §11, and in `_layouts/base.html` the poster scripts plus the `noindex` and `hide_event_banner` page flags.
- The optional `short_bio` / `short_description` fields are declared in `.pages.yml`.
- `assets/poster-maker/README.md` explains the wordmark outline and the QR code's destination.

## Design proofs

The six portrait compositions in `poster-designs.js` are now selectable in the editor. `/poster-maker/?proofs` remains the side-by-side review sheet with real event content and variants. Other formats, exact-artwork project saving, batch exports and MP4/GIF exports remain future work. See [poster-maker-v2/](poster-maker-v2/README.md) and [poster-maker.md](../poster-maker.md).
