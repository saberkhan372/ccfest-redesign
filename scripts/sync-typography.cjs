/*
 * sync-typography.cjs — write Francisca's Figma lettering into the HTML.
 *
 * WHAT IT DOES
 *   Francisca hand-tunes individual letters in Figma (per-letter width on the
 *   Anybody variable font, plus per-letter spacing). design/figma-typography.json
 *   holds that data, read from the Figma file. This script turns each "run" of
 *   letters into a <span style="…"> inside the matching element, so the lettering
 *   is real, selectable text instead of an image.
 *
 * RUN IT
 *   node scripts/sync-typography.cjs
 *   Safe to re-run: the same input always produces the same HTML.
 *
 * WHEN TO RUN IT
 *   After editing design/figma-typography.json, or after adding a page or heading
 *   to the `pages` map below. See docs/TYPOGRAPHY.md for the full workflow.
 *
 * IMPORTANT
 *   Never hand-edit the generated <span data-figma-run="…"> markup — this script
 *   overwrites it. Change the JSON (or the CSS font-size) instead.
 *   Font size is deliberately NOT written here; it comes from redesign.css so
 *   headings stay responsive. Spacing is in `em` so it scales with the size.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { nodes } = JSON.parse(fs.readFileSync(path.join(root, 'design/figma-typography.json'), 'utf8'));

/*
 * Which elements get lettering, per file.
 * Each entry is [tag, a unique attribute of that element, Figma node id].
 * The attribute must appear inside the opening tag and match only one element.
 * The header and footer logos live in `_includes/`, because every page now
 * shares one header and footer through `_layouts/base.html`.
 */
const pages = {
  'index.html': [
    ['h1', 'class="home-hero-title anim-hero-title"', '218:113'],
    ['h2', 'id="upcoming-title"', '218:127'],
    ['h2', 'id="about-title"', '218:150'],
    ['h2', 'id="past-title"', '218:170'],
    ['h2', 'id="mailing-title"', '218:209'],
    ['h2', 'id="coc-title"', '218:215'],
  ],
  'register/index.html': [
    ['h1', 'id="event-title"', '251:741'],
    ['h2', 'id="keynotes-title"', '251:765'],
    ['h2', 'id="sessions-title"', '251:788'],
    ['h2', 'id="registration-title"', '251:843'],
  ],
  'past-events/index.html': [['h1', 'id="page-title"', '218:170']],
  'mailing-list/index.html': [['h1', 'id="page-title"', '218:209']],
  'code-of-conduct/index.html': [['h1', 'id="page-title"', '218:215']],

  /* Shared header and footer. The event page has its own header logo node. */
  '_includes/logo-header.html': [['a', 'class="logo"', '218:106']],
  '_includes/logo-header-event.html': [['a', 'class="logo"', '251:734']],
  '_includes/logo-footer.html': [['strong', 'class="logo"', '218:218']],
};

const escapeHtml = s => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

/* Build the <span> for every run of one Figma text node. */
function render(id) {
  const node = nodes.find(n => n.id === id);
  if (!node) throw new Error(`No Figma data for node ${id} in design/figma-typography.json`);

  return node.runs.map((run, i) => {
    // The event title's " ________, " run is Francisca's blank date rule.
    // The h1's aria-label supplies the spoken name, so the underscores are decorative.
    const text = run.text;

    // Variable font axes, e.g. 'wdth' 150, 'wght' 700.
    const axes = Object.entries(run.font.variationSettings || {})
      .map(([axis, value]) => `'${axis}' ${value}`)
      .join(', ');

    // Figma gives spacing as a percentage of the font size, or in pixels at the
    // size it was designed at. Both become `em` so they scale with the rendered size.
    const spacing = run.spacing.unit === 'PERCENT'
      ? `${run.spacing.value / 100}em`
      : `${run.spacing.value / run.size}em`;

    const textTransform = run.case === 'UPPER' ? 'uppercase' : run.case === 'LOWER' ? 'lowercase' : 'none';

    const css = [
      `font-family: '${run.font.family}'`,
      `font-variation-settings: ${axes || 'normal'}`,
      `font-weight: ${run.weight}`,
      `font-style: ${/italic/i.test(run.font.style) ? 'italic' : 'normal'}`,
      `letter-spacing: ${spacing}`,
      `text-transform: ${textTransform}`,
    ].join('; ');

    return `<span data-figma-run="${i}" style="${css}">${escapeHtml(text).replaceAll('\n', '<br>')}</span>`;
  }).join('');
}

for (const [file, elements] of Object.entries(pages)) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');

  for (const [tag, match, id] of elements) {
    // Match the whole element, then replace its contents with the generated spans.
    // [^>]* cannot cross a ">", so this only matches the element's own opening tag.
    const element = new RegExp(`<${tag}([^>]*${match}[^>]*)>[\\s\\S]*?<\\/${tag}>`);
    if (!element.test(html)) throw new Error(`Missing ${file}: no <${tag}> with ${match}`);

    html = html.replace(element, (_, attributes) => {
      const kept = attributes.replace(/ data-figma-node="[^"]*"/g, '');
      return `<${tag}${kept} data-figma-node="${id}">${render(id)}</${tag}>`;
    });
  }

  fs.writeFileSync(path.join(root, file), html);
}
