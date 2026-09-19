# Using the poster maker

`/poster-maker/` makes posters and fliers for Virtual CC Fest. The artwork is Shristi Singh's homepage interactive: pick one of its ten words and the poster keeps a frame of that animation. It is local work; publishing still needs Saber's go-ahead.

## Make a poster

1. **Template.** Main announcement, Keynote spotlight, Session spotlight, or Community flier. Spotlights add a list to pick the keynote speaker or session, and an **Include bios** box. Photos, names, pronouns, and bios come from `_data/keynotes.yml` and `_data/sessions.yml`; long bios are cut at a word with an ellipsis.
2. **Size.** Portrait, square, story, landscape, US Letter, or A4.
3. **Homepage animation.** Creativity, Change, Connection, Celebration, Collaboration, Creative Commons, Conversations, Community, Curiosity, or Coding. The first time you pick one it plays for a few seconds (about six for Creativity, which draws itself in) before the preview appears.
   - **Show it in play** uses the look the homepage shows when you point at it: question marks for Curiosity, power icons for Coding, confetti for Celebration.
   - **Catch another moment** takes a fresh frame. Swinging, confetti, and the Change sketch differ every time.
   - **Show "10 years of …"** keeps or hides the homepage labels.
4. **Background.** Paper, or White for office printers.
5. **Download PNG**, or choose Letter/A4 and **Print / save PDF** (the print view has its own button; turn headers and footers off, print at actual size).

If a combination has too much text for the size, the preview says what to change and export stays off until it fits. A four-person panel with bios does not fit square or landscape; the rest do.

Drafts stay in the browser. **Save preset** downloads the choices as JSON and **Open preset** restores them. A preset keeps the choices, not the exact frame.

## How the artwork gets onto the poster

`poster-stage.js` (host-owned) loads the homepage in an invisible frame behind the page, presses Shristi's own mode button, and waits. Then it copies what her code has drawn:

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

`verify-poster.cjs` takes a few minutes. It checks all ten animations, every template, size, speaker and session with and without bios, the editor at four widths, PNG sizes, presets, the print view, and the no-JavaScript fallback.

## Known limits

- Captures need the tab to be visible; a capture started in a background tab waits or comes out mid-entrance.
- With "reduce motion" on, the homepage keeps Change's sketch still, so its frame may be empty.
- Tested in Chrome only. Safari and Firefox, a physical print, and a phone scan of a printed QR code are still to do.

## Files

- Host-owned: `poster-stage.js`, `poster-art.js`, `poster-maker.js`, `poster-maker/index.html`, `assets/poster-maker/`, `redesign.css` §11, the poster scripts in `_layouts/base.html`, and the nav links.
- `assets/poster-maker/README.md` explains the wordmark outline and the QR code's destination.
