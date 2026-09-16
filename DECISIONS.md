# Decisions — CC Fest redesign

## 2026-09-15 — Provisional integration in the existing static site
**Why:** Combine Francisca’s layout and Shristi’s supplied interactive without changing the no-build stack or modifying either designer’s source folder. Shristi’s final PR is still pending.
**Rejected:** Blind branch merge, framework migration, or publishing the unfinished branch.

## 2026-09-15 — Editable variable typography
**Why:** Figma context exposes Anybody width-axis values, weight, italic style, and some run-level tracking. Self-host fonts and retain text with span-level CSS; Overpass Mono follows the updated Figma labels.
**Rejected:** Flattening all type into raster images; assuming generic exported HTML preserved Figma’s variable axes or all hand kerning.

## 2026-09-15 — Honest event announcement states
**Why:** Event mockup contains sample speakers, times, and a missing Eventbrite ID. Keep section structure and styling while showing that announcements/registration are pending.
**Rejected:** Publishing invented event details or a working-looking checkout placeholder.

## 2026-09-15 — Integration styling and motion controls
**Why:** Keep redesign.css separate from the original layout and Shristi’s animation CSS for easier comparison when her PR arrives. Supply pause/reduced-motion handling and stop unused canvas rendering.
**Rejected:** Rewriting the designer’s SVG geometry or completing her unfinished modes without her final work.

## 2026-09-15 — Jekyll and Pages CMS for the content that changes (branch `pages-cms`)
**Why:** Dates, speakers, sessions and past events were typed into HTML in several places at once, so every small update needed a developer. Jekyll is already part of GitHub Pages and Pages CMS is a free form over plain YAML in the same repository, so this adds an editing path without adding hosting, a build step, or a lock-in. The bar for every phase was that the built HTML stayed **byte-identical** to what shipped before.
**Rejected:** A visual page builder (would put layout and Francisca's lettering within reach of a form); moving to Netlify or another host (a separate question, and not needed for this); leaving the content in HTML and answering update requests by hand.

## 2026-09-15 — Announcement states are structural, not copy
**Why:** An empty date, keynote list, session list or registration link renders the honest "to be announced" layouts by itself. An editor cannot produce a half-finished page by clearing a field, and never needs a placeholder to make one look complete.
**Rejected:** Free-text date and status fields, which would let a typo or an optimistic guess reach the live site.
