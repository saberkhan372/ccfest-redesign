# Plan: edit the site without touching code (Jekyll + Pages CMS)

Status: **proposed, not started.** Nothing here is built yet.

Goal: let Saber — and later Francisca, Shristi, or a co-organizer — change event dates, speakers, sessions and past events through a web form, without opening HTML and without the live site breaking.

Related: [UPDATING.md](UPDATING.md) · [TEMPLATE.md](TEMPLATE.md) · [TYPOGRAPHY.md](TYPOGRAPHY.md)

---

## 1. What this is and isn't

**Is:** a form over the content that actually changes. Save a form → it commits to the repo → GitHub Pages rebuilds → live in about a minute.

**Isn't:** visual/drag-and-drop editing. Nobody moves elements around. Layout, colour and lettering stay in code and Figma, where they belong.

**Two pieces:**

| Piece | What it does | Cost |
|---|---|---|
| **Jekyll** | Renders data files into the HTML pages. Built into GitHub Pages — no local install, no npm, no new hosting. | Free |
| **Pages CMS** | The web form over those data files. Hosted at app.pagescms.org, or self-hosted. Editors are invited by email and need no GitHub account. | Free, MIT |

---

## 2. What changes vs. what doesn't

**Stays exactly as it is**
- Every URL: `/`, `/register/`, `/events/`, `/past-events/`, `/mailing-list/`, `/code-of-conduct/`
- Visual output — verified pixel-by-pixel against the baselines from the CSS refactor
- `redesign.css`, `styles.css`, `animations.css`, all JS, all fonts and assets
- The lettering pipeline: `design/figma-typography.json` + `scripts/sync-typography.cjs`
- Shristi's interactive, untouched
- Hosting: GitHub Pages from `main`

**Changes**
- Delete `.nojekyll` so GitHub builds the site
- Shared header/footer/nav move into one layout instead of being repeated in six files
- Content that changes moves from inline HTML into `_data/*.yml`
- New `.pages.yml` describing the editing forms

---

## 3. Content inventory — what becomes a form field

Everything below is currently typed into HTML by hand, in more than one place.

| Data file | Fields | Appears on |
|---|---|---|
| `_data/event.yml` | date (or "to be confirmed"), format, cost, experience level, registration URL, eyebrow text, summary | Register hero + facts strip, Home upcoming band, Events card |
| `_data/keynotes.yml` | per speaker: label, name/title, bio, link, photo | Register keynotes |
| `_data/sessions.yml` | per session: time, presenter, presenter bio, title, description, tags | Register sessions |
| `_data/past_events.yml` | per event: date, place, label, agenda URL | Past Events archive (16 rows), Home chips |
| `_data/camps.yml` | per camp: name, format, length, timing, cost, link, description | Events page (Visible Java) |
| `_data/site.yml` | contact email, tagline, designer credits, mailing-list instructions | Every footer, Mailing List page |

**Announcement states stay honest.** Leaving the date field empty renders "To be confirmed", and an empty keynotes list renders the "to be announced" card — the same rule the site follows today. Nobody has to invent a placeholder to make a page look finished.

---

## 4. Target structure

```
_layouts/
  base.html          shared <head>, header, nav, footer
  page.html          inner-page hero + sections
_includes/
  keynote-card.html
  session-row.html
  past-row.html
  event-card.html
_data/
  event.yml  keynotes.yml  sessions.yml  past_events.yml  camps.yml  site.yml
.pages.yml           the CMS form definitions
index.html           thin template, front matter + loops
register/index.html
events/index.html
past-events/index.html
mailing-list/index.html
code-of-conduct/index.html
```

`code-of-conduct/` is long prose that rarely changes — it keeps its markup and only joins the shared layout.

---

## 5. Steps, each independently verifiable

**Phase 0 — safety net (15 min)**
1. Work on branch `pages-cms`. `main` and the live site are untouched throughout.
2. Capture pixel baselines of all six pages at 1440 and 520 (same method as the CSS refactor).

**Phase 1 — Jekyll, no content changes yet (30 min)**
3. Delete `.nojekyll`; add a minimal `_config.yml`.
4. Move the header/footer into `_layouts/base.html`; pages keep their own content.
5. Verify: build locally if Ruby is available, otherwise push the branch and let GitHub build a preview. Diff screenshots against baselines — **must be identical**.
6. Check the bracketed font filenames (`Anybody[wdth,wght].ttf`) survive the build and still load.

**Phase 2 — content into data files (45 min)**
7. Extract the inventory in §3 into `_data/*.yml`.
8. Convert the six pages to loop over that data via `_includes/`.
9. Verify: screenshots identical again; `scripts/verify.cjs` passes; the lettering spans are byte-identical (`sync-typography.cjs` still a no-op).

**Phase 3 — the CMS (30 min)**
10. Write `.pages.yml`: one form per data file, typed fields, no rich-text where plain text will do.
11. Connect the repo at app.pagescms.org, click through every form, save a test edit, confirm it commits and rebuilds.
12. Revert the test edit.

**Phase 4 — decide (yours)**
13. You try the admin UI on the branch. If it doesn't feel better than asking me, we bin the branch and lose nothing.
14. If it does: merge to `main`, then invite Francisca and Shristi by email if you want them editing.

---

## 6. `.pages.yml` sketch

```yaml
content:
  - name: event
    label: "Upcoming event"
    type: file
    path: _data/event.yml
    fields:
      - { name: date, label: "Date (leave empty for 'to be confirmed')", type: date }
      - { name: format, label: Format, type: string }
      - { name: cost, label: Cost, type: string }
      - { name: level, label: Experience level, type: string }
      - { name: registration_url, label: "Registration link", type: string }

  - name: keynotes
    label: "Keynote speakers"
    type: file
    path: _data/keynotes.yml
    list: true
    fields:
      - { name: name, label: Name, type: string }
      - { name: bio, label: Bio, type: text }
      - { name: link, label: Website, type: string }
      - { name: photo, label: Photo, type: image }
```

Same shape for sessions, past events and camps. Field types available: string, text, rich-text, number, boolean, date, image, file, select, object, block, reference, code, uuid.

---

## 7. Risks and how each is handled

| Risk | Likelihood | Handling |
|---|---|---|
| A CMS edit flattens Francisca's lettering | Low | Lettered headings are **not exposed as fields**. They stay in the layouts, generated by the sync script. |
| A bad data file breaks the build, so the site stops updating | Medium | GitHub emails on build failure; fix is reverting one commit. Every edit is a normal commit. |
| Jekyll changes the rendered output somewhere subtle | Medium | Pixel-diff against baselines at the end of phases 1 and 2. Identical or it doesn't ship. |
| Bracketed font filenames trip the build | Low | Explicitly checked in step 6. Fallback: rename the files and update three `@font-face` lines. |
| Editors paste styled content and break layout | Low | Narrow typed fields; rich-text only where prose genuinely needs it. |
| Extra moving parts to maintain | — | Jekyll and Pages CMS are both free and widely used; neither locks the content in. The content stays plain YAML in your repo. |

**Rollback:** delete the branch, or if already merged, revert the merge and restore `.nojekyll`. The content files remain readable either way.

---

## 8. Effort

About 2 hours of my time, in four checkpoints you can stop at. No cost, no new hosting, no subscription.

---

## 9. Decisions needed from you

1. **Go / no-go** on the branch.
2. **Who edits?** Just you, or invite Francisca and Shristi too? Changes only how carefully the forms need guarding.
3. **The mailing-list form.** This doesn't fix it — a static site can't process form submissions. Separate decision: move hosting to Netlify or Cloudflare Pages for free form handling, or keep email signup.
4. **ccfest.rocks.** Still on Squarespace with drifting content. Worth settling which site is the real one before investing more here.
