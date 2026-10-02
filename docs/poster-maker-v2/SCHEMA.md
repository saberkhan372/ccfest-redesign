# Saved-poster schema — proposal

Proposal only. Nothing here is implemented, and no saved poster, data file or CMS setting has been changed. It answers tasks 3, 5 and 6 of [poster-maker.md](../../poster-maker.md) together, because all three change what a saved poster *is*; designing them one at a time would break saved drafts three times.

## What exists today (schema v3)

A draft is one JSON object, `{ version: 3, template, format, mode, hover, moment, labels, background, feature, bios, times, qr, copy, texts, layout }`, validated by [`validate()`](../../poster-art.js:31) and kept in `localStorage['ccfest-poster-v3']` ([poster-maker.js:11](../../poster-maker.js:11)) next to a `source` stamp. **Presets** are the same object downloaded as a file. What it cannot do:

| Gap | Cause in the code |
|---|---|
| A reopened poster can show different content | `feature` is a position in a **filtered** list, one that drops entries with no name or title ([poster-maker.js:111-112](../../poster-maker.js:111)); poster-only text is keyed `session:2` by the same position ([:147](../../poster-maker.js:147)); bios by presenter position |
| A reopened poster can show different artwork | No artwork is saved. Recordings live in an in-memory `Map` ([:16](../../poster-maker.js:16)); `moment` only says which of 12 frames, from a recording the next page load will not have |
| Moving one design's blocks cannot be kept apart from another's | `layout` is keyed by `format` only |
| Stale facts only warn | `source` is compared as a whole string; a change gets one sentence and the draft silently adopts the new data |
| No named posters, duplicates or favourites | One draft slot |

`source` is useful, though: it is `JSON.stringify([event, schedule, keynote names, session titles])` taken **unfiltered** at save time ([:117](../../poster-maker.js:117)). That is what makes an honest migration possible (below).

## 1 · Permanent content IDs

Reference content by an identifier that is created once and never derived from text, so correcting a title or a name cannot orphan a saved poster.

**Proposal:** an opaque `id` on every keynote, every session and every presenter (UUID v4), written once into `_data/keynotes.yml` and `_data/sessions.yml`, hidden from normal CMS editing.

**What I verified in Pages CMS's own source (main, read 2026-10-01):**

- Entries are rebuilt from the schema's **declared fields only** (`deepMap` in `lib/schema.ts`, applied recursively to list items). A key in a data file that `.pages.yml` does not declare is **dropped on the next CMS save**. So adding IDs to the data without declaring them would lose every ID the first time Saber saves a session. The declaration is not optional.
- A `uuid` field type exists and its default value is `crypto.randomUUID()`; `hidden: true` ("Hides the field from the editor") is a documented field option. A row that already has an `id` keeps it when the form loads (`initializeState`). New list rows appear to be initialised from the same defaults (`entry-form.tsx`), so they should get a fresh `uuid`; I read that path but did not exercise it.
- A bug report, [pages-cms#291](https://github.com/pages-cms/pages-cms/issues/291), said hidden fields re-applied their default on every save, which would regenerate a hidden UUID each time. It was closed 2026-03-16 by the maintainer: "Should be fixed in 2.0.0". The latest release is 2.1.8 (2026-06-08).

**What I could not verify:** the behaviour of a real save through app.pagescms.org, which may not run exactly the code I read. That needs Saber's GitHub login and is a required check before anything depends on IDs: add the `id` fields on a branch, save one session and one new keynote through the CMS, and confirm in the commit that every existing `id` is byte-identical and the new row has one.

**Change set (when approved):**

```yaml
# .pages.yml, inside the keynotes item, the sessions item and the presenters item
- { name: id, label: ID, type: uuid, hidden: true }
```

plus a one-off, idempotent script that inserts `id:` lines (adding only where one is missing, editing as text so the file's formatting survives) and a lint in `scripts/` that fails on a missing or duplicate ID. Templates ignore unknown keys, so every built page should stay byte-identical; that is checked by building before and after, as the earlier CMS phases did.

**Rejected:** a slug derived from the title or name. It is readable, but a typo fix changes it, which is exactly the failure to avoid.

## 2 · The project (a saved poster)

Plain JSON, so undo/redo (task 5) can be whole-object snapshots at the end of a gesture, and so a migration is a pure function.

```jsonc
{
  "schema": 4,
  "id": "p_7k3m9x2q",                       // random, local to this browser
  "name": "Keynotes · both",
  "createdAt": "2026-10-02T09:15:00Z", "updatedAt": "2026-10-02T09:40:12Z",
  "content": { "type": "keynote", "ids": ["<keynote uuid>", "<keynote uuid>"] },
  "design": "speaker-led",                  // a registered design; "classic" is today's layout
  "format": "portrait",
  "options": { "background": "paper", "bios": false, "times": true, "qr": true, "labels": true },
  "copy": "Workshops, talks, and community for creative coders.",
  "texts": { "<session uuid>": { "description": "…" }, "<presenter uuid>": { "bio": "…" } },
  "layout": { "speaker-led/portrait": { "logo": { "x": 0, "y": 0, "s": 1 } } },
  "locks":  { "speaker-led/portrait": ["logo"] },
  "artwork": { "ref": "a_5c1d8e", "mode": "celebration", "hover": true },
  "source": {                                 // what the facts were when this was saved
    "stamp": "<hash of the event, schedule and referenced items>",
    "facts": { "date": "2026-10-17", "times": ["9:00 am–12:30 pm PT", "12:00 pm–3:30 pm ET"], "url": "https://ccfest.rocks/register/" },
    "labels": { "<keynote uuid>": "Lauren Lee McCarthy", "<keynote uuid>": "Daniel Shiffman" }
  },
  "renderer": { "poster-art": 4, "designs": { "speaker-led": 1 } }
}
```

What changes, and why:

- **`content` by ID**, with the type alongside. Reordering sessions, adding a keynote, or fixing a typo cannot change which person a poster shows.
- **Design is a field.** The registry already exists ([registerDesign](../../poster-art.js:417)); `classic` stays registered, so every migrated draft keeps its look.
- **Text edits are keyed by the thing they edit** (session or presenter ID), not by `template:position`.
- **Layout is keyed by `design/format`** and locks are separate, so moving blocks on one design never touches another, which is what task 5 asks.
- **`source.labels`** keeps the human-readable name of everything referenced. It is what lets a project say "the session you saved was *X*" even after the data changes.
- **`renderer`** records the layout version so a future change to a design can be recognised rather than silently re-flowing an old poster.

Presets (settings only, no artwork) remain a separate, smaller file: the same shape without `artwork`, `id` and timestamps. A preset opens against whatever artwork the user picks.

## 3 · Saving the artwork exactly

Settings cannot reproduce random artwork; the pixels and shapes have to be kept. What a still actually is ([ARTWORK.md](ARTWORK.md) has the measurements):

```jsonc
// an artwork record, stored separately from projects so several posters can share one capture
{
  "id": "a_5c1d8e", "schema": 1, "mode": "celebration", "hover": true,
  "capturedAt": "2026-10-02T09:12:00Z",
  "viewport": { "stageCss": [1100, 950], "devicePixelRatio": 2 },
  "focus": { "x": 0, "y": 0, "w": 0, "h": 0 },
  "layers": [
    { "kind": "svg",    "x": 0, "y": 0, "w": 0, "h": 0, "blend": "source-over", "markup": "<svg …>" },
    { "kind": "bitmap", "x": 0, "y": 0, "w": 0, "h": 0, "blend": "darken", "pixels": [2200, 1900], "blob": "<key>" }
  ],
  "labels": [ { "text": "10 years of", "x": 0, "y": 0, "w": 0, "h": 0, "size": 15 } ],
  "background": { "asset": "assets/…", "sha256": "…", "tile": [400, 400], "pos": ["0", "0"], "clip": null }
}
```

- **Vector layers keep their markup**, which the capture already produces and used to throw away (it is now kept on each layer: [poster-stage.js:292](../../poster-stage.js:292)). Redrawn from that string they are identical at any size.
- **Bitmap layers** (canvas copies) are stored as PNG with their pixel size, so the effective resolution at print size can be checked and a low one warned about.
- **The Creative Commons wallpaper** is referenced by site path and hash, and embedded only in a portable export.
- Measured cost of one saved still: **about 0.5 MB of markup (0.2 MB gzipped) plus 10–200 KB of PNG**, so roughly 0.2–0.4 MB with compression. `localStorage` (roughly 5 million characters per origin, shared with the draft, every access synchronous) would hold about ten raw stills and stall the page while writing them; **IndexedDB** stores Blobs without that ceiling, which is why task 6 should use it. A recorded 12-frame strip is about 2.4 MB gzipped.
- **Animation is stored as the encoded clip**, not as frames. A 120-frame take would be about 24 MB of gzipped markup before bitmaps, against 0.8–1.4 MB for the MP4 ([ANIMATION.md](ANIMATION.md)). The consequence to state plainly in the interface: a stored clip is a finished render; changing the text means recording a new take.
- **A new take can differ.** None of the homepage sketches is seeded, so "record it again" is a different recording. A project that must stay exact keeps its record; it is never silently replaced.

## 4 · Storage

IndexedDB database `ccfest-poster`: `projects` (JSON, no binaries), `artwork` (records above; bitmap and clip bytes as Blobs), `meta` (schema version, last-opened). Ask `navigator.storage.estimate()` and show "this poster uses 0.4 MB"; on quota failure, say so and offer the portable export instead of failing silently. If IndexedDB is unavailable (private windows), run in memory with a one-line warning; export still works.

**Portable file:** JSON with assets embedded as base64 for stills (a few hundred KB), because it keeps validation simple (every byte is a named field). Clips and multi-frame strips would use a store-only ZIP, which the campaign export (task 7) needs anyway.

## 5 · Migration from v3

Old drafts are migrated only where the match is unambiguous, and the rest is dropped with a message that names what was dropped.

1. Parse the draft's `source` stamp. If it is missing or unreadable, keep the plain settings and drop the content reference.
2. Rebuild the filtered lists the editor used (`names.filter(Boolean)`, `titles.filter(Boolean)`), read `names[feature]` / `titles[feature]`, and look for **exactly one** current entry with that exact name or title. One match: take its ID. None (renamed, removed) or several (duplicates): leave the content unchosen and say so.
3. Poster-only text keyed `session:2` follows the same resolution. Bio edits are positional in v3, so they are kept only if the session's current presenter count equals the saved list's length; otherwise they are dropped, listed by session.
4. `layout[format]` becomes `layout["classic/<format>"]`; the design is `classic`.
5. **Artwork was never stored in v3**, so a migrated poster has `artwork.ref = null` and re-records on open. Say that the new recording may differ.
6. Anything newer than v4: "made by a newer version of the poster maker". Anything older than v3: today's message.

## 6 · Validation and safety

Everything imported is data, never markup. IDs must be UUIDs, project IDs match `^p_[a-z0-9]{8}$`; numbers keep today's bounds; text stays plain (no `<` or `>`) and length-limited. Artwork: at most 64 layers, 2 MB per markup string, 8 MB per bitmap, 40 MB per project. SVG layers are drawn only through an `Image` with a `data:` URL (an image cannot run script or fetch resources), and the markup is still refused if it contains `<script`, `<foreignObject`, an `on…=` attribute, or an `href`/`src` that is not a `#fragment` or a `data:image/`. Unknown top-level keys are ignored with a warning; unknown values for known keys are errors.

## 7 · When the site data changes

On open, compare `source.facts` and `source.labels` with the current data. If the date, times or registration address changed, say so and block export until the person chooses **Refresh from the site** or **Keep this version** (a conscious choice, because a poster with last week's date is the worst outcome). A changed name or title is shown as a diff. Poster-only text edits survive a refresh unless that field is refreshed on purpose.

## 8 · Tests that check outcomes

Fixtures are real v3 drafts saved from today's build (a keynote, a session, a panel, each with a text edit and a moved block).

- Migration: each fixture resolves to the right ID; swap two sessions in the data and the migrated draft still shows the same session; rename a title and the draft opens with an explicit "no longer exists", not a different session; bios dropped when the presenter count differs.
- Round trip: save, reload, and the rendered canvas is **pixel-identical**, including a bitmap mode; export, import in a fresh browser context, identical again.
- Hostile import: a script in an SVG layer, an oversized bitmap, a bad ID and an unknown version are each refused with a message.
- Storage: quota exceeded and IndexedDB unavailable both end in a visible message.
- The renderer comparison already in [`scripts/compare-poster-renderer.cjs`](../../scripts/compare-poster-renderer.cjs) keeps `classic` identical while designs change around it.
- By hand, once: a real Pages CMS save keeps every ID (section 1).

`scripts/verify-poster.cjs` is tied to today's field names, status text and storage key. It should change in the same commits as the behaviour, to assert outcomes (a saved project reopens with the same content and pixels) rather than keep old names alive.

## 9 · Order of work

| Step | Size | Notes |
|---|---|---|
| IDs in the data and `.pages.yml`, lint, byte-identical build check, one real CMS save | S | Needs Saber for the save |
| Move event-content and asset loading out of `poster-maker.js` into `poster-content.js` | M | The editor, the proofs, tests and the campaign export all need it without the editor's closure |
| v4 schema, validators, migrations and `poster-store.js` (IndexedDB), with the tests above | L | Before any new interface, so tasks 3, 5 and 6 share one schema |
| Editor: content / design / format pickers, save and reopen, undo/redo | L | After the three families are chosen |

## 10 · Open decisions for Saber

1. Accept hidden UUIDs in the CMS (needs the real-save check), or a different identifier scheme?
2. Is "a stored clip is a finished render; new text means a new take" acceptable, or should artwork-only frames be stored despite their size?
3. Keep `classic` selectable permanently, or retire it once a family replaces it?
4. Portable file as JSON with embedded assets for now, ZIP only when clips and the campaign export arrive?
