# CC Fest poster maker — proposed plan

Prepared September 19, 2026; revised the same day at Saber's request to use p5.js and ideas from p5js.org. Planning only; no maker, finished posters, or deployment is included in this phase.

**Implementation update — September 19:** Saber requested the build, then asked for the homepage's ten animations by Shristi Singh to be the artwork, with keynote and session spotlights. The p5 artwork modes proposed below were not kept. See [POSTER-MAKER.md](POSTER-MAKER.md) for what exists. The sections below remain the original proposal. Nothing has been published.

## Goal

Give Saber a small browser-based tool for producing a coordinated set of posters and fliers for Virtual CC Fest on October 17, 2026. A successful first version lets him choose a template, choose a format, adjust bounded content, preview the actual export, and download it without editing code.

Build within the existing CC Fest Jekyll/static-site project using plain JavaScript and p5.js as the poster artwork and canvas rendering engine. The central creative interaction is generating and refining a p5 composition inside a reliable event template. No framework, package.json, account system, backend, or new hosting service is needed. Proposed route: `/poster-maker/`. Keep it local until Saber explicitly requests publication.

## Research and sources

- [Current homepage](https://ccfest.rocks/): the current identity, community framing, ten anniversary themes, and designer credits.
- [Current event page](https://ccfest.rocks/register/): confirmed event details, keynotes, schedule, sessions, and registration. Read September 19, 2026.
- [Historical Squarespace site](https://saber-khan-hp7r.squarespace.com/): an archive containing virtual-event graphics and city-specific posters, including versions with and without keynotes. Its older “RSVP to come” announcement is superseded by the current site.
- Image-search descriptions of archive posters indicate geometric motifs in the July 21 virtual graphic and a repeating flower/tree pattern with speaker portraits in the NYC Spring 2019 graphic. These are preliminary leads, not a completed visual audit: direct image fetches failed, and the browser inspection tool could not start. Inspect representative originals before finalizing archive-inspired artwork.
- Local implementation: `redesign.css`, `assets/design/`, `assets/fonts/`, `design/figma-typography.json`, `_data/event.yml`, `_data/schedule.yml`, and `_data/keynotes.yml`.
- [Official p5.js examples](https://p5js.org/examples/): the starting point for generative techniques, with specific sources mapped to proposed poster modes below. Reviewed September 19, 2026. These are proposed CC Fest adaptations, not designs already provided by p5.js.

The useful continuity is a family of event announcements and speaker variants. The proposed 2026 treatment uses the current site identity; historical layouts supply ideas about content hierarchy and reusable variants. Do not transplant historical dates, venues, or speaker information.

## Event copy for the first set

Use the following verified details as defaults:

> VIRTUAL CC FEST 2026
>
> 10th anniversary edition
>
> Saturday, October 17, 2026
>
> 9:00 am–12:30 pm Pacific / 12:00–3:30 pm Eastern
>
> Free · Online · All levels
>
> Workshops, talks, and community for creative coders
>
> Keynotes: Lauren Lee McCarthy and Daniel Shiffman
>
> Register at ccfest.rocks/register/

Use `https://ccfest.rocks/register/` as the QR destination: it explains the event and leads to the configured Luma registration. Do not put a private meeting link on promotional material. Speaker-specific time slots are not assigned by the public page; do not infer who opens or closes. Keep donations out of the main poster hierarchy; participation is free.

## Visual direction

Make the campaign immediately recognizable as the current CC Fest site:

| Element | Treatment |
|---|---|
| Display type | Anybody variable, including the existing expressive italic CC FEST lettering |
| Supporting type | Anybody for short copy; Overpass Mono for dates, labels, and compact facts |
| Base | Paper `#edede9`, surface `#f4f4f1`, ink `#18181a` |
| Accents | Blue `#2d5bff`, orange `#ff4d2e`, lime `#c8ff32` |
| Geometry | Existing Figma-exported shapes, generous empty space, thin rules, broad color bands |
| Artwork | Seeded p5.js compositions: organic marks, connecting paths, and geometric patterns; optional approved stills from Shristi’s modes |
| Hierarchy | CC Fest → date and online format → artwork/keynotes → time and free registration |

The lime above is the actual `redesign.css` value; `docs/TEMPLATE.md` still lists a different value. Use the implementation as the source, without changing unrelated documentation in this phase.

Preserve Francisca’s tuned lettering through the existing typography data/sync process. A fixed, faithfully exported outlined logo is also suitable for downloaded artwork if obtained through a read-only export. Dynamic date and speaker text should use readable typesetting rather than pretend to reproduce hand-tuned lettering for arbitrary words.

Use ink for small text on orange and lime. Avoid the site's known white-on-orange contrast problem. Keep geometric decoration away from the date, URL, and QR code. Give text generous margins and judge each output at its intended viewing size.

## p5.js artwork modes

Artwork modes are independent of the three content templates: one mode can serve an announcement, keynote spotlight, or workshop flier. Keep each composition inside a designated artwork area or approved CC mask, with protected text and QR areas.

| Proposed mode | Official inspiration | CC Fest adaptation | Controls |
|---|---|---|---|
| **Creative currents — first prototype** | [Noise](https://p5js.org/examples/Repetition-Noise/) and [Bezier](https://p5js.org/examples/Repetition-Bezier/) | Organic dot fields and curved strands moving through or around the CC shape; the flow treatment is our adaptation of the examples' techniques | Density, curve strength, stroke weight, seed |
| **Connections** | [Connected Particles](https://p5js.org/examples/Classes-And-Objects-Connected-Particles/) | Seeded groups of dots linked by paths, suggesting people making and learning together | Number of groups, spacing, line weight, seed |
| **Celebration** | [Shape Primitives](https://p5js.org/examples/Shapes-And-Color-Shape-Primitives/) | Arcs, circles, triangles, and half-circles arranged in a playful grid or scatter using the site palette | Shape mix, order/scatter, scale, seed |
| **Shared patterns — later** | [Kaleidoscope](https://p5js.org/examples/Repetition-Kaleidoscope/) | Mirrored marks forming a compact festival emblem; optionally ten-fold symmetry for the anniversary | Symmetry, rotation, mark size, seed |

Use restrained preset ranges so every result is suitable for a poster. Start with Creative currents; add Connections and Celebration after the export proof. Shared patterns is a later extension. Avoid a default rainbow palette: retain the current site's paper, ink, orange, blue, and lime. Keep the CC FEST wordmark intact rather than distorting its letters with noise.

Each mode includes an “Inspired by” link to the relevant p5.js example and a short explanation of its technique. Implement original CC Fest compositions. If adapting example code directly, preserve the source, author credits, changes, and the license shown on that example page; the reviewed examples display CC BY-NC-SA 4.0. Record this separately from the bundled p5.js library's license and from Francisca's and Shristi's credits.

## Three template families

1. **Main announcement — first priority.** Large CC FEST, anniversary label, prominent October 17 date, one geometric/artwork area, and a concise registration band. Offer paper, orange, and dark-background compositions with predefined accessible text colors.
2. **Keynote spotlight.** Shared festival header plus two balanced speaker areas; optionally switch to a single-speaker variant. Names are essential; portraits are optional, with a strong type-only fallback. Use supplied portraits only after checking promotional reuse and any photographer credit requirements. Do not label one speaker as the opening keynote without confirmation.
3. **Workshop/community flier.** A little more room for what attendees will do, the intended audience, and selected confirmed sessions. Keep the full program on the website. Use this for educator newsletters and community noticeboards.

Retain Francisca José Rodrigues’s design credit and Shristi Singh’s interactive/artwork credit in the maker footer. Carry an appropriate compact credit line into exports that use their work. Confirm the preferred wording and placement during design review.

## Formats and deliverables

These are proposed output presets, not claims about platform upload limits.

| Preset | Dimensions | Primary output |
|---|---|---|
| Portrait social | 1080 × 1350 px | PNG |
| Square social | 1080 × 1080 px | PNG |
| Story | 1080 × 1920 px | PNG with generous top/bottom safe areas |
| Landscape/share | 1200 × 630 px | PNG |
| US Letter flier | 8.5 × 11 in | Print/save-to-PDF; optional 2550 × 3300 PNG |
| A4 flier | 210 × 297 mm | Print/save-to-PDF; optional 2480 × 3508 PNG |
| Large poster, later | 11 × 17 in / A3 | PDF after print/export validation |

Each format gets its own composition and line breaks. Never squeeze or crop the portrait design to make a landscape version. First review set: the main announcement in portrait social, Letter, and landscape sizes. Expand to the other templates after that establishes the visual system.

Office-print PDFs are the initial print target. Provide a low-ink variant with a white background and safe margins. Commercial bleed, crop marks, CMYK conversion, and PDF/X are a separate extension requiring a printer's specification; a browser PDF must not be described as press-ready by default.

## Maker workflow

Choose template → choose size → choose p5 artwork mode → adjust variation → inspect preview → download.

- Desktop: controls on the left, large preview on the right. Mobile: controls and preview stacked, with a clear download action.
- Controls: template, format, approved colorway, selected speaker/session, optional time line, optional QR, and short supporting copy.
- Fixed identity: brand lettering, credits, fact labels, and safe spacing. Provide Reset to defaults.
- Event facts come from site data. A draft override must be visibly marked and must not update the live event data. Standard exports use confirmed defaults.
- Artwork controls: mode, its bounded sliders, seed, and “New variation.” Save the current seed so a good composition can be recovered. A new variation changes only artwork, never layout or event facts. An optional curated-still mode can reuse approved designer artwork.
- Default to still compositions rendered on demand. If animated exploration is added later, expose a saved phase/frame control and export that exact state; do not let elapsed time or pointer position silently change the download.
- Show overflow or missing-content errors beside the responsible field; block downloads with clipped required information. Do not silently shrink copy until it becomes unreadable.
- Save the draft locally, and allow explicit download/import of a small versioned JSON preset. Validate imported values; render copy as text, not HTML.
- Supply a copyable caption and descriptive alt text alongside each image. Images alone should not be the only way people receive event details.

No freeform canvas editor, arbitrary fonts, cloud collaboration, or AI image generation is needed for the first version. Those would add work before solving the immediate campaign need.

## Implementation approach

Use the existing Jekyll layout for the maker interface and emit a small JSON payload from the relevant `_data` files using safe JSON serialization. Use event data for the date/registration, schedule data for the event time range, and keynote/session data for selectable content. Include a source date/version in saved presets to flag stale drafts when site data changes.

Proposed bounded file changes at implementation time:

- `poster-maker/index.html`: accessible controls, preview, and no-JavaScript explanation.
- `poster-maker.js`: draft state, validation, format layouts, and download orchestration; a new host-owned file.
- `poster-art.js`: new host-owned p5 instance, seeded artwork modes, and shared poster renderer.
- `_layouts/base.html`: load the existing local p5 asset and maker scripts only on the maker route, keeping homepage script loading unchanged.
- `redesign.css`: a clearly numbered maker section, scoped to this page; preserve existing page appearance.
- `assets/poster-maker/`: only approved derived stills or export assets, with source/credit notes.
- `scripts/verify.cjs`: add the new route and meaningful editor/export checks.
- Shared navigation and page metadata: follow the existing new-page checklist when the route is ready to integrate.

Do not change Shristi’s scripts, either designer’s source folders, or the Figma source file. If still extraction needs new functionality, build a host-side adapter or obtain static assets; do not patch her animation code. Defer animated downloads.

**Export proof first:** prototype Creative currents with the real typography and a QR code before building all controls. This revision replaces the earlier SVG-first proposal with a p5 P2D canvas renderer. SVG remains useful for approved fixed lettering/shapes, but editable/vector SVG export is outside the first version.

Use the following rendering design:

1. **Isolated sketch.** Follow p5's [Multiple Canvases / Instance Mode](https://p5js.org/examples/Advanced-Canvas-Rendering-Multiple-Canvases/) approach so maker code does not define global `setup` or `draw` functions. The repo's `assets/p5.min.js` identifies itself as **1.9.4**; reuse it for the first P2D prototype and verify APIs against that version. Current p5js.org examples may target newer releases. Do not upgrade the shared library as a side effect of this work; avoid newer-only APIs and WebGL/shader features in the MVP.
2. **Repeatable composition.** Reset [randomSeed](https://p5js.org/reference/p5/randomSeed/) and [noiseSeed](https://p5js.org/reference/p5/noiseSeed/) before generating geometry. Store mode, seed, parameters, format, renderer version, and any explicit phase in the preset. Generate geometry in logical poster coordinates, independent of preview size, screen density, or export resolution. Keep iteration order stable. Reproducibility means matching geometry/content for a pinned renderer; do not promise pixel-identical font antialiasing across browsers.
3. **One layout and render path.** Use a `renderPoster(graphics, layout, geometry, content, assets)` function to compose background, generated artwork, lettering, text, and QR. Preview the finished composition scaled to fit. Reuse the same geometry and layout when drawing the final-size buffer, rather than stretching a preview screenshot or generating fresh random marks.
4. **Explicit export dimensions.** Draw final output to [createGraphics](https://p5js.org/reference/p5/createGraphics/) at the requested pixel width/height, setting the buffer's [pixelDensity](https://p5js.org/reference/p5/pixelDensity/) to 1. For Letter at 300 pixels per inch this is 2550 × 3300. Use [saveCanvas](https://p5js.org/reference/p5/saveCanvas/) with the buffer's HTML canvas for PNG, verifying the overload in bundled 1.9.4. Include mode and seed in the filename. Dispose of temporary buffers after download and export formats sequentially to limit memory use.
5. **Render only when needed.** Use [noLoop](https://p5js.org/reference/p5/noLoop/) and [redraw](https://p5js.org/reference/p5/redraw/) for changed controls; debounce sliders. Do not assume the current documentation's Promise behavior exists in 1.9.4. Complete asset loading and rendering before enabling export. Cancel obsolete render requests and handle export failures with a useful retry message.

Typography is the main proof requirement: DOM `data-figma-run` spans and CSS variable-font settings do not automatically transfer to p5 text rendering. Use a faithful outlined SVG of the fixed CC FEST wordmark, rasterized at output resolution into the composition, or prove an equivalent per-run renderer using the existing typography data. Load local fonts for supporting text; if canvas cannot honor required axes, use licensed static font instances at chosen weights/widths, validated against the site. Keep the existing site typography pipeline unchanged. Reject fallback-font exports and verify italic overhangs and line breaks in actual downloaded files.

Generate QR codes locally for the fixed public registration URL, with a clean quiet zone and a readable URL printed next to them. Use same-origin assets to avoid cross-origin export failures. A small vendored font/export or QR helper is acceptable after license and compatibility checks, without a bundler or package manifest.

For the first PDF workflow, place the final high-resolution poster image in a print-only document with explicit physical page dimensions and safe margins, then use browser print/save-to-PDF. Verify scale, page count, and margins. This PDF contains raster poster artwork; do not label it vector or press-ready. A dedicated PDF library, vector-text overlay, and one-click PDF download are later extensions. p5's `saveCanvas` is the image export path, not a PDF exporter.

Keep form controls and event copy in accessible HTML alongside the canvas. Give the canvas an updated accessible description of the composition and preserve copyable caption/alt text. Still rendering is the default; any later motion must stop offscreen, when hidden, and under reduced-motion preferences.

## Bounded delivery phases

1. **p5 design and export proof.** Visually inspect historical originals, review the linked p5 examples, and implement Creative currents with three saved seeds in the announcement template. Produce portrait-social PNGs and a Letter PDF proof of the selected variation. Prove font fidelity, PNG dimensions, PDF page size, QR readability, and identical geometry across preview/export resolutions. Success: usable sample exports with accurate facts and recoverable variations.
2. **Usable maker.** Add the controls, live preview, confirmed data defaults, format switching, reset, and local preset saving. Success: Saber can produce both formats without code changes.
3. **Campaign set.** Add Connections and Celebration artwork modes, then landscape, square, story, A4, keynote and workshop variants. Deliver coordinated files plus captions/alt text. Success: layouts remain legible across every supported template/format/mode combination. Shared patterns and animated exploration remain optional later additions.
4. **Review and publication preparation.** Review lettering/layout with Francisca and artwork treatment with Shristi; record remaining differences. Finish browser and regression checks. Publish only if Saber explicitly requests it.

## Acceptance checks

- All required facts agree with current event data; no historical dates or fabricated session assignments.
- Each supported export has its stated pixel dimensions or physical PDF page size, loaded fonts, intact shapes, and complete text.
- Preview and downloaded PNG agree visually; repeat exports preserve layout and seeded artwork.
- Reopening a saved preset restores geometry and content; a new seed changes artwork only. Different display densities and export resolutions do not change the selected composition.
- Verify against bundled p5.js 1.9.4, with no global sketch collisions, idle draw loop, stale asynchronous exports, or accumulation of graphics buffers after repeated downloads. Test high-resolution export on a memory-constrained phone; report unsupported sizes instead of silently reducing quality.
- QR codes scan from screen and an actual printed flier, and land on the event page. Physical scan/print validation requires a person with a printer/phone.
- Long names and the longest supported copy do not clip; missing photos and empty optional data have deliberate layouts.
- Controls work with keyboard and screen-reader labels; meaningful focus states, readable contrast, and no forced motion.
- No interface overflow at 320, 390, 768, and 1440px. Test mobile download behavior and current Chrome, Safari, and Firefox.
- No-JavaScript visitors see an explanation and a link to the event; once approved exports exist, offer a static sample download.
- Existing site checks pass after a Jekyll build, plus `git diff --check`; compare unaffected page output and preserve all pre-existing user changes.

## Planning verification and next step

Verified: current public event copy against local event/schedule/keynote data; actual local font and color declarations; existing ownership and typography rules. Historical gallery structure and indexed poster descriptions were available, but original poster pixels were not inspected. No prototype, browser export, print output, or designer approval has been tested.

Local Git commands failed because the system Git requires unavailable developer tools, so worktree status and `git diff --check` could not run in this session. Browser automation also failed at startup. These are environment limitations, not reasons to change the architecture.

p5 revision verified: official example descriptions and rendering/seed/export references were read; the local p5 asset header confirms 1.9.4. No example sketches or export paths were executed. Runtime compatibility, variable typography, high-resolution memory use, and print quality still need the prototype checks above.

Next step: implement Phase 1 with p5 Creative currents, three reproducible seeds, a 1080 × 1350 announcement PNG, and a Letter PDF proof before building the complete editor.
