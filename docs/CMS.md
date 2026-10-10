# Editing the site with Pages CMS

Pages CMS edits public YAML content in this repository. Saving creates a Git commit. Once the checked publication workflow is activated, a save publishes only after source validation, Jekyll rendering and browser checks pass. A failed check leaves the previous successful site live. See [the rollout instructions](CMS-ROLLOUT.md) for activation status and recovery.

## What the CMS covers

| Form | Content file | What you edit |
|---|---|---|
| Upcoming event | `_data/event.yml` | Name, confirmed date, fallback year, summary, facts, registration and donation settings |
| Keynote speakers | `_data/keynotes.yml` | Speakers, schedule assignment, bios, photos and websites |
| Sessions | `_data/sessions.yml` | Permanent IDs, title, format, round, level, language, descriptions, presenters and resources |
| Schedule | `_data/schedule.yml` | Ordered blocks, times and named time zones |
| Past events | `_data/past_events.yml` | Archive rows, posters, credits, classes and homepage location badges |
| Camps and programmes | `_data/camps.yml` | Programme identity, summary, link and facts |
| Site details | `_data/site.yml` | Contact, footer, organizer, designer credits, share image, announcement and mailing provider |
| Homepage copy | `_data/home.yml` | Introductions, About, welcome list, history, mailing and community copy, metadata |
| Registration page copy | `_data/register.yml` | Announcement states, joining steps, registration and calendar explanations, metadata |
| Events page copy | `_data/events_page.yml` | Headings, descriptions, calls to action and metadata |
| Visible Java page | `_data/visible_java.yml` | Interest-form URL, curriculum, outcomes, audience, logistics, FAQ, classroom sketch and metadata |
| Past events archive | `_data/past_events.yml` | Homepage location chips and CMS entries only. The History page (`history/`) is a static copy and does not read this file, so past events shown there must also be updated in its source |
| Mailing list page copy | `_data/mailing_list_page.yml` | Sign-up introductions, email fallback, topics, privacy copy and metadata |
| Code of conduct | `_data/code_of_conduct.yml` | Existing policy sections, examples, report steps, attribution and metadata |

Layout, CSS, scripts, navigation routes, accessibility controls, fixed designer lettering and animation choices remain developer-owned. The event lettering is the exception: its words, date and year follow event data while retaining the original Figma styles. Existing designer credits and policy attribution must stay intact. Private attendee, donation and provider records are outside this CMS.

## Editing sessions safely

A saved session needs a title, permanent ID and Workshop/Panel format. Never change an ID after publication: saved choices and calendar entries use it. Reordering sessions preserves identity. Adding a confirmed session is supported; no check assumes there must always be 17 sessions.

Choose a workshop round from **When**, or leave it empty for “Round to be announced.” Pending workshops remain visible but have no preference buttons and do not enter calendar exports. Panels need a panel block; keynotes need keynote blocks. Nonempty invalid assignments block publication even though the template defensively keeps misplaced workshops visible in previews.

Use **Level**, **Language** and **Format** for classification. New forms default language to English; rendering also defaults an omitted language to English. Posters use these fields too. Tags are optional extra topics and do not determine whether a session is a panel.

A removed or renamed published ID blocks publication against the last successful deployment. For an intentional removal, a developer lists that ID and the exact baseline commit in `scripts/content-removals.yml`. This is a targeted exception, not a switch disabling checks.

## Event dates and schedule

A confirmed date supplies the year across event headings, accessible names, cards, banner, metadata, calendar and posters. A trailing year in the event name follows that date. The Year field is the fallback while the date is unknown. Custom names retain the site's display font; fixed brand lettering stays designer-owned.

Times use 24-hour `HH:MM`, from `00:00` to `23:59`, in the first zone. Blocks must be ordered, with end after start and no overlap. The shipped Pacific and Eastern columns use `America/Los_Angeles` and `America/New_York`; their offsets follow the event date, including daylight saving. Other IANA names are supported for whole-hour offsets. A blank IANA name uses a manually checked fixed offset. Half-hour offsets require a separate schedule enhancement.

When adding or removing a round, update both Schedule and the Sessions “When” options in `.pages.yml`. The validator rejects a mismatch. Keep existing block IDs stable.

## Empty fields

| Empty value | Result |
|---|---|
| Event date | Honest unconfirmed-date copy; no Event structured data or poster export |
| Keynote list | The existing two announcement cards |
| Registration URL | Mailing-list invitation; floating Register banner disappears |
| Luma event ID | Ordinary link to Luma instead of the embedded dialog |
| Donation note | Donation line disappears |
| Workshop round | Visible pending workshop without preferences/calendar entry |
| Optional photo | Existing text/initial fallback |

An empty session list or removal of a published row requires documenting those intentional ID removals. Required values cannot be cleared in a publishing change. The template's defensive announcement fallbacks still exist.

## Copy, links and shared values

Body copy supports **bold**, *emphasis*, inline `code` and `[link text](https://example.org/)`. Copy is escaped before Markdown rendering; raw HTML and editor-supplied Liquid never execute. Headings and labels use plain text, unless their field explicitly supports Markdown.

Named tokens keep shared values consistent: `{contact_email}`, `{organizer_name}`, `{event_name}`, `{event_year}` (metadata), `{camp_description}`, `{camp_eyebrow}` and `{round_count}` (joining instructions). Do not rename tokens. Unknown tokens in prose fail validation. Keep URLs complete with `https://`; email links use `mailto:`. Relative links must retain the page's existing folder depth.

Curriculum, outcomes, logistics, FAQ, welcome/topic lists and policy examples are reorderable lists. The sample Java sketch is displayed as escaped text, never executed. Do not add fictional dates, speakers, prices or links, or describe donations as tax-deductible.

## Images

New content images belong in `assets/uploads/`. Image fields start browsing there, use safe upload filenames and can still select legacy images from `assets/`; existing paths have not moved. The media manager has separate **New content images** and **Existing images** entries. Both filter to supported image extensions so scripts and fonts do not appear as upload choices.

Use JPG/PNG/WebP for presenter photos, roughly square at 400px or more. Archive posters should be readable at about 720px width; shared preview images use 1200×630. Keep images reasonably small, describe meaningful archive/share images with the corresponding alt-text field, and retain known poster designer credits. Replacing a photo does not require renaming the old file. Verify the page after saving; broken local asset references block publication.

## After a form-schema change

Reload Pages CMS and reopen the form before editing. A previously open tab may still use an older schema. Every YAML key, including nested presenter keys, must appear in `.pages.yml`; otherwise a form save can remove it. The validator checks this recursively and tests a model of schema serialization.

The earlier incident removed 84 session metadata values. That loss is reproduced by a failing regression fixture. Required fields alone are not the full protection: validation, rendered reconciliation and the deployment dependency are all necessary. A real hosted CMS save and stale-tab test have **not** yet been performed for this change; use the checklist in [CMS-ROLLOUT.md](CMS-ROLLOUT.md). The local schema projection test does not establish hosted-CMS behavior.

## Local build and checks

Use Ruby 3.3, Node 22+ and the checked-in Gemfile/lockfile. No JavaScript package or application bundler is added.

```bash
bundle install
bundle exec ruby scripts/test-content.rb
CONTENT_BASELINE=<last-successful-deployment-sha> bundle exec ruby scripts/build.rb _site
bundle exec ruby scripts/test-rendered.rb _site
bundle exec ruby scripts/verify-schedule-fallback.rb
node scripts/serve.cjs _site 8876
```

In another terminal, with Playwright installed in your development environment:

```bash
node scripts/verify-publish.cjs http://127.0.0.1:8876/
node scripts/verify.cjs http://127.0.0.1:8876/
node scripts/verify-poster.cjs http://127.0.0.1:8876/
node scripts/verify-poster-state.cjs
git diff --check
```

`CHROMIUM_PATH=/path/to/chromium` supports a locally installed Chromium. CI installs a pinned Playwright release outside the repository and uses the Google Chrome already supplied by the GitHub runner, avoiding a separate browser-CDN download. `verify-publish.cjs` is content-generic; `verify.cjs` also retains detailed current-event assertions, including the October 17, 2026 date and current speaker IDs.

Build order is validate → derive event/time-zone data → sync lettering → Jekyll safe build → reconcile source with rendered cards. Generated `_data/generated_*.json` and `_config.build.yml` are build-owned, ignored by Git and not editable CMS content. Always use `scripts/build.rb` for a publishing build.
