# Editing the site without touching code

On this branch the six pages are built by **Jekyll** from data files, and **Pages CMS** puts a web form over those data files. Saving a form commits to the repository; GitHub Pages rebuilds; the change is live in about a minute.

Related: [UPDATING.md](UPDATING.md) · [TEMPLATE.md](TEMPLATE.md) · [TYPOGRAPHY.md](TYPOGRAPHY.md) · [PAGES-CMS-PLAN.md](PAGES-CMS-PLAN.md) (the original plan)

---

## What moved, and what did not

| Now a form field | Still in code or Figma |
|---|---|
| Event name, date, format, cost, level, registration link | Every layout, colour, and spacing rule |
| Keynote speakers, sessions | Francisca's lettered headings (`data-figma-run` spans) |
| The past-event archive and the homepage location badges | Shristi's interactive and all the motion |
| Camps and programmes on /events/ | The prose on the About, Mailing List, and Code of Conduct pages |
| Contact email, footer tagline, organizer name and LinkedIn, designer credits | |

Nothing in the admin UI can reach the lettering. It is generated from `design/figma-typography.json` by `scripts/sync-typography.cjs`, which the CMS never runs.

## Leaving a field empty is a real answer

The announcement states are structural, not copy:

| Empty field | What the site shows |
|---|---|
| `event.date` | "To be confirmed", and "TBC <year>" where space is tight |
| `keynotes` | The two "to be announced" keynote cards Francisca designed |
| `sessions` | The single "to be announced" session row |
| `event.registration_url` | The mailing-list invitation instead of a registration button |

So nobody ever has to invent a date or a speaker to make a page look finished. Clearing a field in the CMS is exactly as safe as never filling it in.

## The files

```
_config.yml            Jekyll settings. No plugins — GitHub Pages only allows a fixed set.
_layouts/base.html     The <head>, header, nav and footer every page shares.
_includes/             One file per repeated row: past-row, keynote-card, session-row,
                       event-card, the nav, and the three logo lockups.
_data/*.yml            The content that changes. This is what the forms edit.
.pages.yml             The form definitions.
<page>/index.html      Front matter + that page's <main> block, nothing else.
```

Each page's front matter carries its own title, description, body class, and `root` (`""` on the homepage, `"../"` elsewhere) so every asset path stays relative. That matters: the site is served from a project path on github.io, not a domain root.

## Building it locally

Jekyll 3.10 — the version GitHub Pages runs:

```bash
jekyll build --destination /tmp/ccfest-site && npx http-server /tmp/ccfest-site -p 8881 -c-1
```

Then open http://127.0.0.1:8881/. Use `http-server`, not `python3 -m http.server`: the Python one drops requests under a headless browser's parallel loads and will show you an unstyled page.

Installing Jekyll on this Mac needed a workaround; see [../GOTCHAS.md](../GOTCHAS.md).

## Checking a change did no harm

The strongest check, and the one used throughout this branch: the built HTML should be **byte-identical** to what it was before, unless you meant to change it.

```bash
jekyll build --destination /tmp/after
diff -r /tmp/before /tmp/after
node scripts/verify.cjs http://127.0.0.1:8881/
node scripts/sync-typography.cjs   # then confirm git reports no change
```

## Connecting the CMS

1. Sign in at [app.pagescms.org](https://app.pagescms.org) with the GitHub account that owns the repository.
2. Add this repository and choose this branch.
3. The forms come from `.pages.yml`; there is nothing else to configure.
4. Editors without GitHub accounts are invited by email from inside Pages CMS.

A save is a normal commit. If a bad value ever breaks the build, GitHub emails about the failed build and reverting that one commit fixes it.
