# Design integration notes

## Sources

- [Francisca’s homepage](https://www.figma.com/design/jMiMzds3qYD2mO5w2Dsg4P/CCFest_21MAR2026?node-id=218-104) and [event page](https://www.figma.com/design/jMiMzds3qYD2mO5w2Dsg4P/CCFest_21MAR2026?node-id=251-732), read September 15, 2026.
- `figma-to-html/` and `figma-to-html (1)/`: original absolute-position exports; retained as references, not runtime dependencies.
- `Shristi-ccfest-redesign-10-years-origin/`: original interactive snapshot. Root animation files and required assets are working copies. Source geometry and effects preserved.

## Typography / kerning finding

The simple HTML export loads default Anybody and loses variable-axis styling. Francisca's hand tuning is per-letter width (`wdth`) and per-letter letter-spacing, now stored in `design/figma-typography.json` and written into the HTML as editable spans by `scripts/sync-typography.cjs`. Body copy remains selectable and accessible. Fonts and their OFL licenses are in assets/fonts.

Update (September 15, later): letter-spacing, weight, style, and case were re-read from the Figma Plugin API and match the JSON for all 13 synced nodes. Figma's generated code misreports percent spacing against a 16px base (the event-title U is −7%, not −1.12px). Ink widths of the browser text match Figma exports within 1px for the hero, event title, logos, and section headings. Full pipeline and verification method: [docs/TYPOGRAPHY.md](docs/TYPOGRAPHY.md). Francisca's visual sign-off is still pending.

## Integration boundary

- `redesign.css`: Francisca palette/type/layout plus responsive and accessibility adjustments. Small text on orange/lime uses darker colors for legibility.
- `animations.css`, `animations.js`, `change-sketch.js`, `celebration-confetti.js`, `creativity-scribble.js`, `coding-power.js`: Shristi’s files from PR #1 (September 16), byte-identical to her branch. Host overrides are in redesign.css section 7.
- `interaction.js`: pause/resume, reduced motion, SVG animation pausing, and p5 loop suspension while inactive, paused, offscreen, or document-hidden; adds the readiness class that preserves static Cs if p5 cannot load.
- Root homepage: supplied stage markup, initial Creativity mode, decorative SVG semantics, pause button, variable-font title spans, credits.
- Event page: Figma structure with announcement states instead of fictitious people, schedule, or checkout.

## Designer review

Review the two local pages, color/type pairing, title kerning, interactive scale on phones, and designer credits. Shristi’s ten modes arrived complete in PR #1; mode-selection tests do not certify each intended effect, so compare against her screen recording. No confirmation of event date, schedule, or registration details has been inferred from the launch deadline.

## Verification

Start `python3 -m http.server 8876 --bind 127.0.0.1` from this folder. With Playwright and Chrome available, run `node scripts/verify.cjs http://127.0.0.1:8876/` (or set NODE_PATH to the installed Playwright package directory). The script checks both pages at four widths, assets/fonts/anchors, scroll reveals, mode state, keyboard navigation, motion preferences, offscreen suspension, and no-JS fallback. It writes desktop/mobile screenshots to `/tmp/ccfest-*.png`.

Before staging: review typography with Francisca, obtain confirmed event content, and identify/authorize the staging destination. The existing README says pushing main deploys GitHub Pages, so no push was performed.
