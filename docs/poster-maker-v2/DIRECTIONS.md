# Six visual directions: portrait proofs

Task 1 of [poster-maker.md](../../poster-maker.md). Every proof is drawn by working code (`poster-designs.js`, registered through the new design registry in `poster-art.js`) from the **real** public event data, the live keynote and session entries, and one frame of a homepage animation, so each can become a template. Nothing here is approved by anyone yet; the feedback table at the end is empty on purpose.

- Side by side, with captions: [proofs/contact-sheet.png](proofs/contact-sheet.png)
- The same posters at phone width (375 px, 2×): [proofs/phone-sheet.png](proofs/phone-sheet.png)
- Each proof at export size (1080 × 1350): [proofs/](proofs/)
- Open it live: the Jekyll build serves `/poster-maker/?proofs` (add `&mode=change` for another animation). It is internal, like the maker, and not linked.

## At a glance

| # | Direction | For | What is different | Colour pairs used (contrast) |
|---|---|---|---|---|
| 1 | **Signature** | General announcement | The site's own order on paper: big wordmark, the animation at full width, a supporting line, then the date | ink on paper 15.1 |
| 2 | **Bold date** | Reminders, countdown posts | The date is the picture: a giant 17 on a lime band, a small animation tile, a blue "Register free" band with the QR code | ink on lime 15.0, ink on paper 15.1, white on blue 5.2 |
| 3 | **Art-led** | Social promotion | The animation at almost full width; copy is the date on an orange band, three facts and a QR code | ink on paper 15.1, ink on orange 5.4 |
| 4 | **Speaker-led** | Keynotes (one or two) | Portraits and names on a blue band under her "Keynotes" lettering; the animation shrinks to a tile | white on blue 5.2, ink on paper 15.1, ink on lime 15.0 |
| 5 | **Program-led** | A session, or the panel | The title is the poster, on an orange band that grows to fit it; presenters beneath, a 2 × 2 grid for four | ink on orange 5.4, ink on paper 15.1 |
| 6 | **Minimal print** | Noticeboards, schools, offices | White, ink only, wide margins, a large QR code, a small piece of animation as the only colour | ink on white 17.7 |

Every pairing is at least 4.5:1 (the lowest is white on blue at 5.18). White is used only on blue, never on orange, because white on orange is 3.3:1. The credits line (Design: Francisca José Rodrigues · Interactives: Shristi Singh) is in every one.

Shown beside them: **Speaker-led with one keynote**, **Program-led with the longest session title** (68 characters, set at 84 px over four lines), **Program-led with the four-person panel**, and **today's layout** for comparison.

## What each one is

**1 · Signature.** Paper background; the wordmark at 820 units wide; the artwork with its margin trimmed from 14% to 5% so the Cs fill about 85% of the width; the supporting line; the date in her lettering (Bold date, Thin Italic year); free / online / all levels as outlined capsules; the times; the QR code and address, with "REGISTER FREE" at the right. Closest to the site and to today's layout, so the least new.

**2 · Bold date.** A lime band (ink text) holds the small wordmark, "SATURDAY", a giant **17** in Anybody Black, and the month and year in her lettering. A paper tile keeps the animation; the capsules and the times sit beside it. A blue band closes with "Register free" in her bold lettering (white), the address and the QR code. The most distinctive of the six, and the one that makes the single most important fact the picture.

**3 · Art-led.** The wordmark small at the top, the animation almost full width (its margin trimmed to 2.5%), then an orange band with the date at 104 units, the capsules, the address and the QR code. The same ingredients as Signature at a different weight.

**4 · Speaker-led.** A blue band with the wordmark in white (the same outline file with its fill swapped), "Keynotes" (or "Keynote") in her lettering, and portraits in white rings. For two speakers both names are set at the size the longer allows, so they read as equals; for one the portrait is larger and the name and bio sit beside it. Bios are optional and off in the pair proof. Below, on paper: the animation tile, the date, the capsules and the times; a lime band carries the address and QR code.

**5 · Program-led.** Kicker (the session's tags), then the title on an orange band whose height follows the title: 120 px for short titles down to 44 px at 180 characters. Beneath: one presenter (portrait, name, pronouns, short bio) with the opening of the description and a small animation tile, or four presenters in a 2 × 2 grid with a bio under each. A ruled strip carries the date, address, times and QR code.

**6 · Minimal print.** White background (the office-printer option), seventy-unit margins, the wordmark at 500 units with a small animation tile beside it, her community lettering ("Creative coding for everyone."), the date, the facts and times as plain mono text, and a QR code at 270 units with "SCAN TO REGISTER" and the address. Drawn here at portrait proportions; it belongs on Letter and A4, which needs task 2.

## Measured limits

From the probes in `poster-proofs.js` (`limits.json`), with realistic multi-word text, portrait only. The real data is far inside all of them: the longest title is 68 characters and the longest name 22.

| Content | Takes | Real maximum today |
|---|---|---|
| Program-led session title | about 180 characters (the type shrinks as it grows: 120 px at 31 characters, 96 px at 48, 84 px at 68, 76 px at 90, 60 px at 120, 44 px at 180) | 68 |
| Program-led panel title | the same, with a 290-unit cap on the title so the grid keeps its room | 25 |
| Presenter name, Program-led | about 54 characters | 22 |
| Keynote name, pair / single | about 56 / 52 characters | 19 |
| Supporting line (Signature) | 100 characters, on two lines at most | 52 (the default) |
| No photo | draws, with an initial in the circle | one real case (Jessica Valarezo) |
| No times, no QR, white background | every design draws | n/a |
| A size other than portrait | refused with a message and the original layout as the preview, not improvised | n/a |

Clipped text is reported, not hidden: a bio or description that does not fit is cut with an ellipsis and listed under the proof ("Bio for Naoto Hieda is clipped."). Today only the review sheet shows that note; showing it beside the editor's field is task 4.

## At phone size

Looking at the 375 px sheet: the date lines, names, session titles and "Register free" read comfortably; the capsules and time lines are readable but small; the address and credits are not meant to be read at that size (the QR code is for print). This is my inspection, not a test with readers, and minimum sizes per output are task 4's job. Sizes were raised once already from the first renders (capsules from 15–18 to 17–21 units, times from 17–24 to 19–28).

## Known gaps

- **New lockups, not from her Figma.** The giant numerals, the white wordmark, colour bands behind portraits and titles, capsules for the facts, "Register free" as a headline, and the small labels "TIMES" and "SCAN TO REGISTER". They follow her palette and type (and the event page's orange and lime bands) but have not been seen by her.
- **The supporting line** is used by Signature and (outside the community template) Minimal print. The other designs leave it out on purpose; the editor must say so beside the field.
- **Session text is as submitted**, including emoji, which draw in the system emoji font and do not match the type. Strip them, or accept them, per poster.
- **Bios and descriptions are cut at fixed lengths** with the ellipsis rule above.
- **Portrait only.** The other five sizes are task 2.
- Layout is by hand-set coordinates inside each design, with the existing move-and-resize blocks; undo/redo, snapping and locks are task 5.

## Which three

This is a recommendation, and the choice is Saber's with Francisca's and Shristi's input.

**Bold date, Speaker-led and Program-led.** Each carries a content type the current layout handles worst: the date (the fact a campaign two weeks out most needs), the keynotes, and the sessions and panel. Together they cover an announcement or reminder, the two keynotes, every session and the panel. They are also the three that look least like today's stacked layout.

- **Signature** stays the calm fallback and is close to what exists; the original layout is not removed in any case. If Francisca prefers a brand-first main poster to the giant date, Signature should take Bold date's place.
- **Art-led** is Signature with its text moved into a band; as a fourth family it adds little. It is better as a weight option.
- **Minimal print** is mostly a *background and ink* choice (white, no bands) rather than a layout, so it belongs with print output (task 8) on Letter and A4.

## Feedback

| Who | Status |
|---|---|
| Saber (pick three) | not yet asked |
| Francisca (lettering, bands, new lockups) | not yet shown |
| Shristi (artwork treatment: tiles, scale, clipping) | not yet shown |

## Regenerate

```sh
NODE_PATH=$(npm root -g) node scripts/poster-proofs.cjs http://127.0.0.1:8876/ docs/poster-maker-v2/proofs --all-modes
```

It fails if any design cannot draw, reports a layout problem, uses a pair under 4.5:1, or stops fitting content well beyond the real data, for all ten animations.
