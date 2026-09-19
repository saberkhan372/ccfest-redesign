# Typography: Figma lettering to editable CSS

Francisca hand-tunes display lettering in Figma. The site reproduces it as real, selectable text rather than pictures. This is how that works, how to update it, and how to check it.

Related: [UPDATING.md](UPDATING.md) · [TEMPLATE.md](TEMPLATE.md).

## What her tuning actually is

Anybody is a variable font with two axes: width (`wdth`, 50–150) and weight (`wght`, 100–900). In Figma she adjusts individual letters two ways:

- **Width per letter** — "Registration" uses `R` at width 150, `r` at 60, `o` at 140.
- **Spacing per letter** — the footer logo sets `E` to −1% and `S` to −3% while the rest is +6%.

Figma has no pair-kerning control, so these two settings are the whole of the "manual kerning", and both map directly to CSS.

| Figma | CSS |
|---|---|
| Axis `wdth` / `wght` | `font-variation-settings: 'wdth' 150, 'wght' 700` |
| Weight | `font-weight: 700` (kept in step with `wght`) |
| Italic | `font-style: italic` (uses `Anybody-Italic[wdth,wght].ttf`) |
| Letter spacing, percent | `letter-spacing: value/100 em` (−3% → `-0.03em`) |
| Letter spacing, pixels | `letter-spacing: px/fontSize em` |
| Text case UPPER | `text-transform: uppercase` |

Spacing is in `em`, so it scales when headings resize.

## How it flows through the repo

```
Figma  →  design/figma-typography.json  →  scripts/sync-typography.cjs  →  <span data-figma-run> in the HTML
```

- The JSON holds one entry per text node, split into **runs** of consecutive characters that share settings: `text`, `font.family`, `font.style`, `font.variationSettings`, `weight`, `size`, `spacing {unit, value}`, `case`.
- The script injects the spans into elements marked `data-figma-node`.
- **Font size is deliberately not written into the spans.** It comes from `redesign.css` so headings stay responsive.

Nodes currently synced:

| Page | Element | Figma node |
|---|---|---|
| Home | Header logo | 218:106 |
| Home | Hero "CC FEST" | 218:113 |
| Home | "Virtual CC Fest 2026" | 218:127 |
| Home | About / Past Events / Mailing list / Code of Conduct headings | 218:150, 218:170, 218:209, 218:215 |
| All | Footer logo | 218:218 |
| Event | Header logo | 251:734 |
| Event | Event title (includes the blank date rule) | 251:741 |
| Event | Keynotes / Sessions / Registration headings | 251:765, 251:788, 251:843 |
| Events | Header logo only | 218:106 |
| Past Events / Mailing List / Code of Conduct | Page title `h1#page-title` reuses the homepage heading lettering | 218:170 / 218:209 / 218:215 |

Figma file key `jMiMzds3qYD2mO5w2Dsg4P`; frames Homepage `218:104`, Register `251:732`.

## Posters

The poster maker draws on a canvas, so it can't use the spans. `sync-typography.cjs` also writes `assets/poster-maker/lettering.json` with four nodes: the event title 251:741 (its date run and Thin Italic year style the poster's date line), Keynotes 251:765 and Sessions 251:788 (spotlight headings, with the final "s" dropped for "Keynote" / "Session"), and 218:150 "Creative coding for everyone." Canvas can't set the width axis either, so `poster-maker.js` registers one font face per width with a single-value `stretch` descriptor; the browser clamps to it, which pins the axis. Measured against the HTML spans, "Keynotes" at 100px is 589.8px in both (flat Anybody: 505px).

## Reading the data out of Figma

Read-only, through the Figma Plugin API (the Figma MCP `use_figma` tool):

```js
const n = await figma.getNodeByIdAsync("251:843");
return n.getStyledTextSegments(["fontName","fontSize","fontWeight","letterSpacing","textCase"])
  .map(s => ({ t: s.characters, font: s.fontName, w: s.fontWeight, size: s.fontSize, ls: s.letterSpacing, case: s.textCase }));
```

Three traps:

- **Per-letter `wdth` isn't exposed.** The Plugin API omits it and Figma's generated code reports `"wdth" 100` everywhere. The segment boundaries still show *which* letters differ. Read the values from Figma's Type panel, or confirm them by measuring (below).
- **Generated-code spacing is wrong.** It converts percentages against a 16px base: the event title's "u" is −7%, which the generated code calls `-1.12px`. Trust the percentage.
- **Sizes get copied between similar nodes.** 251:734 was once recorded as 13px when Figma said 16px. Check `size` against Figma.

## Updating the lettering

1. Read the node's runs from Figma.
2. Edit that node's entry in `design/figma-typography.json`, keeping the existing shape.
3. For a new heading, add `[tag, unique-attribute, nodeId]` to the page's list in `scripts/sync-typography.cjs`. The attribute must match exactly one element (an `id` is safest).
4. Run it:

   ```bash
   node scripts/sync-typography.cjs
   ```

   Re-running changes nothing — that's the check that it worked.
5. Set the font size in `redesign.css`. Keep Figma's size as the value at 1440px and scale down with `clamp()`.
6. Add an `aria-label` if the visible text differs from what should be read aloud — for example the event title, whose blank date is typed as underscores.
7. Verify (below).

## Checking it against Figma

Compare **ink width**: the width of the dark pixels, not the text box or the character advance.

1. Export the Figma node as a PNG at 1× into `design/reference/<node-id>.png`.
2. Render the browser text at the same size on its own page, in headless Chrome at device scale factor 1.
3. Threshold both and measure the bounding box.

```python
from PIL import Image
def ink_width(png):
    im = Image.open(png).convert('L').point(lambda v: 255 if v < 128 else 0)
    box = im.getbbox()
    return box[2] - box[0] if box else 0
```

```bash
"<chrome>" --headless=new --force-device-scale-factor=1 --hide-scrollbars \
  --virtual-time-budget=3000 --window-size=1400,800 --screenshot=out.png file:///path/sample.html
```

The sample page needs `@font-face` rules pointing at the local fonts by absolute `file://` path, and the element's spans at the Figma font size.

Results on 2026-09-15 (browser vs. Figma ink width):

| Text | Browser | Figma |
|---|---|---|
| Hero "CC FEST" (400px) | 874 | 874 |
| Virtual CC Fest 2026 (64px) | 664 | 664 |
| Past Events (40px) | 264 | 263 |
| Footer logo (12px) | 53 | 53 |
| Keynotes / Sessions / Registration (36px) | 209 / 206 / 263 | 208 / 206 / 262 |

Within 1px is a match. A wrong width on a single letter usually shifts the total by 5–15px.

Two things that will mislead you:

- Comparing a text box or character advance against ink width invents a ~2% gap on large italic text, because italic glyphs overhang their advance.
- Chrome won't let you read pixels back from a canvas drawn via SVG `foreignObject`. Use real screenshots.

For a quick visual check: http://127.0.0.1:8876/design/typography-review.html shows the Figma image above the browser text at matching sizes.

## Known gap

The event page's history band (nodes 251:850–852) has per-letter tweaks that Figma's API won't reveal, so it uses plain CSS case and weight only.

## If lettering can't be reproduced

Export that one element from Figma as outlined SVG, keep an accessible text label (`aria-label` or visually hidden text), and leave the rest of the page as live text. Don't flatten a whole page into images.
