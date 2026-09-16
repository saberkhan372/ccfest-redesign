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
