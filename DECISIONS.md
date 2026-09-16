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

## 2026-09-16 — Merge Shristi's pull request instead of reverting `main`
**Why:** Her PR (#1) branches from before Jekyll and the CMS and suggests reverting `main` to merge cleanly; that would discard the site. A real merge, resolved by taking her files whole and porting her stage markup into the Jekyll homepage, keeps her twelve commits and authorship and closes the PR on GitHub when it reaches `main`.
**Rejected:** Reverting `main`; copying her files in without her history; a squash that drops her authorship.

## 2026-09-16 — Shristi's files stay byte-identical; host needs live outside them
**Why:** The provisional integration patched `animations.js` and `change-sketch.js`, which made every later update a hand merge. Now the p5 lifecycle and SVG animation pausing are in `interaction.js`, and colour blending, sizing and paused states are in `redesign.css`, so her next PR can be taken whole with `git checkout --theirs`.
**Rejected:** Patching her scripts for the pause, offscreen and reduced-motion needs, or fixing her confetti listeners on her behalf.

## 2026-09-16 — Her full-height stage on desktop
**Why:** Her PR asks that the 95dvh stage not be shortened, since each mode draws across all of it; the earlier `clamp(560px,80vh,850px)` override and the smaller monogram size were removed. Phones keep 540px pending her view.
**Rejected:** Keeping the shorter desktop stage for page rhythm.

## 2026-09-16 — Luma for registration and donations, replacing Eventbrite
**Why:** Saber pays for Eventbrite and wanted to stop, while still collecting donations. Luma is free for free registrations, takes a donation at sign-up like the old Eventbrite "donate as you RSVP" setup, and sends each guest a personal Zoom link, reminders and a calendar invite. Its cut is 5% of donations plus Stripe's fees. There is no nonprofit entity, so nonprofit-only tools don't apply and donations aren't tax-deductible. Comparison in `docs/REGISTRATION.md`.
**Rejected:** A site form going to EmailOctopus with Ko-fi donations (no platform cut, but donating becomes a separate step and the Zoom links and reminders are sent by hand); Humanitix (~$1.29 per donation); Givebutter and Zeffy (organizations or nonprofits only).

## 2026-09-16 — Luma's form in our own `<dialog>`, not Luma's button script
**Why:** Luma's `checkout-button.js` has to load on every page view, Escape doesn't close its overlay, and its close button has no label. `registration.js` loads Luma's documented embed URL into a native dialog only when someone clicks Register, so Escape, focus return and a labelled Close come from the browser. The Register link still goes to Luma without JavaScript.
**Rejected:** Luma's script, as above; an always-visible iframe in the dashed box (contacts Luma on every visit, and a fixed-height frame is cramped on phones).
