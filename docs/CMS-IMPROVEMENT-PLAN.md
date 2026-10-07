# Pages CMS improvement plan

- Date: October 7, 2026
- Site: [ccfest.rocks](https://ccfest.rocks/)
- Repository: `saberkhan372/ccfest-redesign`
- Baseline: `413b33e` — session metadata recovery
- Status: Proposed implementation plan. The recovery is published; the improvements below have not been implemented.

## 1. Outcome

Keep Pages CMS as the editing interface and GitHub Pages as the host. Make routine content edits reliable, expose the remaining editorial content through clear forms, and make shared event information consistent across the website and poster tools.

The intended everyday workflow is:

1. Open a current CMS form and edit the content.
2. Save once.
3. Automated checks validate the content and build the site.
4. A passing build publishes automatically. A failing build leaves the last successful site live and explains what needs fixing.

Separate drafts and human review are optional later improvements. Routine edits should not acquire a mandatory approval step.

## 2. Findings that this plan addresses

The current configuration contains seven forms covering all seven `_data/*.yml` files. A recursive comparison found no existing data keys missing from the current form definitions.

| Area | Current state |
|---|---|
| Upcoming event | Name, date, summary, facts, registration link and Luma ID are editable. |
| Keynotes | Names, bios, photos, links and schedule assignments are editable. |
| Sessions | Titles, IDs, format, round, level, language, descriptions, resources and presenters are editable. |
| Schedule | Running order, block IDs, kinds, times and UTC offsets are editable. |
| Past events | Archive entries, posters, credits, classes and homepage location badges are editable. |
| Camps | Listing descriptions and fact rows are editable; most Visible Java detail content is in HTML. |
| Site details | Contact information, footer, credits, announcement bar, social image and mailing-list integration settings are editable. |
| Other page copy | About text, joining instructions, FAQs, policy text and much introductory copy are in HTML. |
| Page metadata | Browser titles and descriptions are in page front matter. |
| Event display headings | The large event name/date/year is embedded in generated typography markup. |
| Publishing | CMS saves to `main` trigger GitHub Pages. The repository has verification scripts but no custom deployment workflow that requires those checks to pass. |

The October 6 incident was a destructive data save, rather than a missing field in the current configuration. Commit `771f63e` removed 84 metadata values from 17 sessions. The removed fields match an older CMS form, which is consistent with a stale form being used; the editor's browser session was not inspected, so that cause is not proven.

Recovery commit `413b33e` restored the previous metadata, preserved the new descriptions, and made session ID and Format required. The deployed page was checked: eight workshops in each round and one panel, including working preferences and calendar export.

Two other concrete consistency issues need attention:

- Changing the event date in the CMS updates the facts, but the large registration heading still contains `October 17, 2026` in generated markup.
- The schedule classifies a panel using `format`, while `poster-maker.js` classifies it using `tags`.

## 3. Scope and constraints

### Included

- Content validation, rendered-output checks and a deployment workflow that requires them.
- Shared event/session information used consistently across pages, calendars and posters.
- CMS forms for the remaining editorial copy on existing public pages.
- Better field labels, defaults, identifiers, links and media organization.
- Documentation, recovery instructions and actual CMS save tests on a test branch.

### Boundaries

- Keep Jekyll 3.10 compatibility and the current public routes.
- Keep the static site architecture. Do not add a frontend framework, bundler or `package.json`.
- Preserve published session IDs, existing content, image URLs and attribution during migration.
- Keep design rules, layout and animation code under their existing ownership. Do not edit the designers' source folders or Figma file.
- Changes to lettered headings must go through the typography data/generation pipeline; do not hand-edit `data-figma-run` spans.
- Luma registration configuration, EmailOctopus campaigns/subscribers and Google Form responses remain in those services. CMS work covers their public links and embeds.
- New arbitrary pages, a new CMS, a presenter database, translation management and a new event-archive architecture are outside the first implementation.

Implementation should be prepared and verified on a branch. Committing, pushing and changing GitHub Pages publishing settings require the repository's explicit publishing authorization. The earlier approval covered the session recovery; this document proposes the next implementation.

## 4. Delivery order

| Phase | Deliverable | Depends on | Completion condition |
|---|---|---|---|
| 0 | Baseline and reproducible checks | — | Existing site builds and the relevant checks run from a clean checkout. |
| 1 | Content and rendering validation | 0 | The October 6 failure is rejected; valid pending workshops still pass. |
| 2 | Checked deployment | 1 | A failed validation cannot replace the live site. |
| 3 | Consistent shared content | 1–2 | Event facts and session classification agree across all consumers. |
| 4 | Remaining page content in CMS | 2–3 | Each listed editorial area has a working form and preserves its layout. |
| 5 | Form usability and media improvements | 2; alongside 3–4 | Forms retain values through real saves and make common edits straightforward. |
| 6 | Optional draft previews | Core phases complete | Adopt only if routine editing would benefit from the extra workflow. |

Phases 1 and 2 are the first release. They should ship before the larger content migration.

## 5. Phase 0 — Establish the baseline

### Work

- Confirm the current remote head and preserve any concurrent user changes before implementation.
- Record the current content and rendered output. For this event the baseline is 17 sessions: 16 workshops and one panel. This is a migration check, not a permanent minimum for every future event.
- Inventory the content each template reads, including poster-maker data and generated schedule posters.
- Make the Jekyll build reproducible. Add a pinned Ruby dependency definition/lockfile if needed; use Jekyll 3.10 and the required Markdown parser. Keep dependencies and verification artifacts out of the published site.
- Use temporary tooling locations for browser dependencies, preserving the repository's no-`package.json` rule.
- Capture the affected pages at 320, 390, 768 and 1440 pixels, including the current event lettering.
- Record which checks are generic and which encode this particular festival's sessions, date and counts.

### Files and tools

Existing: `_config.yml`, `scripts/verify.cjs`, `scripts/verify-schedule-fallback.rb`, `scripts/verify-poster.cjs`, `scripts/verify-poster-state.cjs`, `docs/UPDATING.md`.

Proposed where needed: `Gemfile`, `Gemfile.lock`, a documented verification command usable both locally and in CI.

### Acceptance

- A clean checkout builds without ignored local files.
- Baseline failures are recorded and resolved or isolated before they become deployment requirements.
- Browser verification uses a served Jekyll build, not raw Liquid templates.

## 6. Phase 1 — Validate the content and rendered pages

### A. Validate source data

Add a small validator, preferably Ruby so it shares the Jekyll/YAML environment. A proposed entry point is `scripts/validate-content.rb`.

| Check | Required behavior |
|---|---|
| YAML structure | Reject malformed files, unexpected root structures and wrong field types. |
| CMS coverage | Compare every editable data key with `.pages.yml`, recursively through lists and objects. Reject undeclared keys that a CMS save could discard. Explicitly document any generated data outside CMS ownership. |
| Session identity | Require nonempty, unique IDs for publishable sessions. Preserve existing IDs; never derive replacements from an edited title or generate new UUIDs for existing sessions. |
| Session content | Require a title and a recognized format for populated entries. Handle intentionally empty placeholder rows explicitly. Do not invent content to satisfy validation. |
| Workshop assignments | An empty round is valid and means pending. A nonempty assignment must exactly match a workshop block. |
| Panels and keynotes | Require valid assignments to the appropriate block kind when publishing them in the schedule. Prevent a panel from being silently omitted. |
| Schedule | Require unique block IDs, recognized kinds and valid 24-hour times (`00:00`–`23:59`). Check positive durations and sensible ordering for the current single-day schedule. |
| Optional values | Treat missing, empty and whitespace-only optional fields consistently. Preserve the site's intended announcement states. |
| Images | Check that referenced local assets exist and their paths resolve from every consuming page. |
| Links | Validate allowed schemes and intended relative paths. Report bare domains and fields containing multiple URLs for correction. |
| CMS round options | Detect drift between selectable round values and the actual schedule blocks. |

Audit existing links before making all URL checks blocking. Several presenter links are bare domains, and one field contains multiple URLs. Normalize only unambiguous, verified destinations; resolve ambiguous values deliberately. Unrelated legacy link cleanup should not delay the initial session-metadata protection.

Compare stable IDs with a known successful content baseline to detect unintended identity changes. Prefer the last successfully deployed commit; the immediately preceding commit could itself contain a failed CMS save. Define a documented way to record intentional removals or replacements without a blanket bypass. Do not permanently require exactly 17 sessions or freeze normal additions.

### B. Reconcile content with rendered output

Add a check, such as `scripts/verify-rendered-content.rb`, that inspects the generated HTML:

- Every publishable session appears exactly once.
- Assigned workshops appear in the matching round; unassigned workshops appear under “Round to be announced.”
- Pending workshops have no client-side round assignment or preference controls.
- Panels appear in panel blocks, and keynote references resolve.
- Titles, IDs and classifications agree with the source data.
- Required images, links and page metadata are present where expected.
- The empty-programme state is deliberate and readable when creating a future event.

Expected counts should come from validated source data, rather than a hard-coded minimum. Keep the template's defensive pending-state behavior even when the validator rejects invalid nonempty assignments.

### C. Prove the failure is caught

Use temporary fixtures to demonstrate that:

1. The recovered data passes.
2. The `771f63e` data fails with a clear missing-ID/format explanation.
3. Removing one ID or introducing a duplicate fails.
4. A valid workshop with no round passes and renders as pending.
5. A workshop assigned to a nonexistent or panel block fails validation.
6. An intentional addition is supported without rewriting count assertions.
7. A CMS configuration missing a data field fails the coverage check.

Keep fixture tests focused on these failure modes. The existing browser suite contains date/session-specific assertions; separate those regression fixtures from the generic checks used for every CMS deployment so a legitimate future programme can change.

### Acceptance

- Validation errors identify the file, record and field in language an editor can act on.
- The missing-metadata regression fails before publication.
- Every valid, titled session is accounted for in the generated page.

## 7. Phase 2 — Require checks in the deployment workflow

### Work

- Add a GitHub Actions workflow, for example `.github/workflows/pages.yml`, with this sequence:

  `checkout → install pinned tooling → validate content → build Jekyll → verify rendered output → browser smoke check → upload artifact → deploy`

- Run validation and build checks on pull requests. Deploy only approved changes arriving on `main` and any explicitly supported manual rerun.
- Make the deploy job depend on successful verification of the exact artifact being uploaded. A separate CI job that fails while the current automatic Pages build still deploys is insufficient.
- Switch the repository's GitHub Pages publishing source to GitHub Actions during the rollout. Verify the old branch-based publishing path no longer deploys independently.
- Keep build jobs read-only; grant Pages deployment and identity-token permissions only where required.
- Configure deployment concurrency so an older build cannot finish after a newer release and replace it.
- Produce a concise workflow summary with the commit, session totals, validation failures and deployment link. Use GitHub's existing failure reporting; no new email or messaging integration is required.
- Retain enough successful-build information to identify the previous deployment and recover from a bad source commit.

### Acceptance

- A deliberately invalid fixture fails the deployment dependency chain.
- The previous live revision remains available when validation fails.
- A valid update deploys once, from the verified artifact, and the live revision matches the intended commit.
- Ordinary content edits continue to publish automatically after passing checks.

### Rollout

1. Prepare and exercise the workflow on a branch without production deployment.
2. Review the complete implementation and verification results.
3. With publishing authorization, configure Pages to use Actions and publish the workflow.
4. Verify the first successful deployment, canonical URLs, assets, session display and calendar behavior.
5. Record the deployment configuration and recovery procedure in `docs/UPDATING.md`.

## 8. Phase 3 — Make shared information consistent

### Event name, date and year

- Establish `_data/event.yml` as the source for event facts, browser/social titles, relevant descriptions, calendar output and poster information.
- Derive the displayed year from a confirmed date. Retain an explicit fallback year only for an event whose date is genuinely unconfirmed.
- Inventory hard-coded date/year/name occurrences, including the homepage upcoming heading, registration heading, metadata, community-day copy and joining instructions.
- Extend the typography generator to accept the changing event text while preserving the designed runs. Run generation before Jekyll in the checked workflow, or implement an equivalent deterministic generation step supported by the existing pipeline.
- Use the existing typography data for styling. Do not flatten the heading into an image or hand-edit generated spans.
- Test changed-length dates and names. If a display arrangement needs a design adjustment, surface that limitation clearly; do not silently leave the old date visible.
- Review fixed UTC offsets when the event date changes. Do not infer time zones from arbitrary labels; document the supported event time zone and validate any daylight-saving assumptions used by calendars.

### Session classification and labels

- Make `format`, `level` and `language` authoritative wherever sessions are consumed.
- Update `poster-maker.js` normalization and panel detection to use those fields.
- Derive standard poster labels from the same values used by session cards.
- Preserve genuinely additional tags; avoid maintaining “Panel,” level and language as competing facts in two fields.
- Keep published IDs and the existing session ordering during this migration, including compatibility with saved choices and poster presets.
- Derive references to the number of workshop rounds from schedule data when appropriate.

### Primary files

`_data/event.yml`, `_data/sessions.yml`, `_data/schedule.yml`, `.pages.yml`, `_layouts/base.html`, `index.html`, `register/index.html`, `_includes/session-card.html`, `poster-maker.js`, `scripts/build-schedule-posters.cjs`, `design/figma-typography.json`, `scripts/sync-typography.cjs`.

### Acceptance

- A test event-date change updates every intended occurrence, including the large heading and metadata.
- The generator is deterministic; a second run produces no further changes.
- Workshop/panel identity agrees on the registration page and in poster output.
- Existing choices, calendar UIDs and supported poster presets remain usable.
- Typography and responsive checks pass at all four widths.

## 9. Phase 4 — Expose remaining editorial content

Use a separate data file and CMS form per page where practical. Keep existing shared event, session, archive and camp data in their current files. The names below are proposed; confirm them against the final content inventory before creating files.

| Proposed file | Editorial content to expose | Template |
|---|---|---|
| `_data/home.yml` | Introductory copy, About paragraphs, welcome list, section introductions and editorial link labels | `index.html` |
| `_data/register.yml` | Joining introduction/steps, help text, event-specific supporting copy and appropriate announcement copy | `register/index.html` |
| `_data/events_page.yml` | Events-page introduction, archive invitation and editorial call-to-action copy | `events/index.html` |
| `_data/visible_java.yml` | Audience, curriculum, outcomes, logistics, FAQs, interest-form URL and supporting copy | `events/visible-java/index.html` |
| `_data/past_events_page.yml` | Archive introductions, history/context and organizer invitation | `past-events/index.html` |
| `_data/mailing_list_page.yml` | What subscribers receive, signup explanation and fallback instructions | `mailing-list/index.html` |
| `_data/code_of_conduct.yml` | Policy section copy and lists, with stable section anchors | `code-of-conduct/index.html` |

Add `meta.title` and `meta.description` to page content where these are independent editorial text. Derive event-page defaults from the event data so routine date/name changes cannot leave stale metadata. Keep routes, layout selection and structural page IDs controlled by templates.

### Migration method

1. Start with one small, ordinary section, such as homepage About copy.
2. Extract the exact existing text into the data file and declare every field in `.pages.yml` in the same change.
3. Replace the literal text with template references while preserving semantic HTML and styling hooks.
4. Build and compare output, accepting only intended whitespace differences or documented changes.
5. Make a small edit through the real CMS on a test branch; compare the saved YAML before and after to confirm unrelated fields survive.
6. Repeat page by page. Migrate the long Code of Conduct after the smaller forms establish the pattern.

Use plain text for short strings, structured lists for steps/FAQs, and controlled Markdown for prose requiring links or emphasis. Preserve the existing escaping/sanitization boundary. Do not expose whole HTML templates as editable text.

Keep Code of Conduct anchors stable even if section labels change. Keep camps listing facts and Visible Java details connected through a stable identifier rather than relying only on a changeable URL. Declare any new identifier in the CMS at the same time it is introduced.

Programmatic status messages, accessibility controls and poster-editor UI labels can remain in code. “Editorial coverage complete” means an editor can change the public page content listed above without editing HTML; it does not require every application string to become a form field.

### Acceptance for each page

- Existing copy, links, headings, credits and meaningful image descriptions are preserved.
- Empty optional fields have intentional results.
- A real CMS save preserves other values in the file.
- The page passes responsive, heading/anchor, image and no-JavaScript checks.
- The CMS guide describes where the page's content is edited.

## 10. Phase 5 — Improve forms and media handling

### Forms

- Group fields around editor tasks: session details, scheduling, presenters and poster text.
- Make session titles, necessary presenter names, IDs and formats required where the record is publishable.
- Use readable round labels that include their times, and validate that labels/options still match the schedule.
- Provide a real English default for new sessions without overwriting existing language choices.
- Keep permanent IDs out of routine editing where supported. Verify the hosted CMS's preservation behavior before relying on hidden or read-only fields; validation must enforce identity independently.
- Tighten time patterns to valid hours and provide examples for links and optional fields.
- Explain that blank workshop rounds are allowed and will display as pending.
- Give destructive removals clear context through the supported CMS interface and the validation report. Avoid a new approval step for every description edit.

### Media

- Put new editorial uploads in a dedicated location such as `assets/uploads/`.
- Keep existing image paths valid. Do not move all photos as part of the first migration.
- Confirm the CMS media configuration supports selecting existing images while directing new uploads to the new folder.
- Keep fonts, runtime files and design assets outside the routine upload area.
- Document photo sizing and supported formats. Validate asset existence and useful alt text/credits where images carry content.

### Real-save verification

On a test branch, exercise editing a description, changing a round, clearing an optional field, adding a session and replacing an image. Compare all saved values, including nested presenter data, before and after.

Also test a form-schema update with an already-open CMS tab. Record the observed hosted-CMS behavior. If the stale form still strips data, verify that the deployment checks reject that save and that reloading the form plus restoring the missing metadata recovers it. Required fields alone must not be presented as a complete fix.

## 11. Phase 6 — Optional draft previews

Consider this after the core work is stable, especially if multiple people start editing larger sections.

- Evaluate the current hosted Pages CMS branch-selection behavior before designing the workflow.
- A proposed flow is CMS edits on a content branch, a preview build, then a reviewed merge to `main`.
- Confirm where previews will be hosted and how their links reach editors. GitHub Pages does not automatically provide a separate website for every branch.
- Keep previews out of search indexing and avoid using production registration changes as test data.
- Preserve direct, automatically checked publication for routine edits if that remains the preferred workflow.

This phase is optional and introduces no preview service or additional account as part of the initial release.

## 12. Verification matrix

| Change | Verification |
|---|---|
| Schema/data validator | Missing-field incident, duplicate/changed IDs, wrong block kind, valid pending state, legitimate additions and undeclared-field fixtures |
| Deployment | Failed checks prevent deploy; successful artifact revision matches the live page; old workflow cannot publish independently |
| Shared event facts | Alternate confirmed date/name plus unconfirmed-date case across headings, metadata, cards, calendars and posters |
| Session model | Schedule/poster classification agrees; original IDs and saved choices survive |
| Page-copy migration | Content comparison, real CMS save, links/anchors, screenshots at 320/390/768/1440 |
| Media | New upload, existing image selection, missing-file failure, preserved legacy URLs |
| Browser behavior | Relevant portions of `scripts/verify.cjs`; no-JS, reduced motion and keyboard behavior remain intact |
| Poster changes | `scripts/verify-poster-state.cjs`, relevant `scripts/verify-poster.cjs` checks and schedule-poster output review |
| Typography changes | Generator rerun is clean; lettering checks and visual comparison under `docs/TYPOGRAPHY.md` |

Run the appropriate checks after the final implementation changes. Documentation-only changes need link/content review and `git diff --check`; they do not require the full browser suite.

## 13. Recovery and publishing behavior

When a CMS save fails validation, the source commit still exists in Git even though the live site stays on its last successful deployment. Show the failed fields and the last successful revision in the build summary.

For a recurrence of missing metadata:

1. Identify the last successful deployment and the destructive source change.
2. Restore only the missing or invalid values, preserving the editor's legitimate new copy.
3. Reload the CMS and verify the current fields are present.
4. Validate, build and publish the corrected data.
5. Check the live revision and affected content.

For an implementation regression, restore the affected code or redeploy a known successful artifact through the checked workflow. Do not recover by disabling content validation or re-enabling an unchecked publishing path. Document intentional content removals so recovery does not recreate sessions the organizer meant to remove.

## 14. Documentation and final handoff

Update these documents as implementation lands:

- `docs/CMS.md`: current forms, defaults, required fields, reload behavior, upload guidance and failed-save recovery.
- `docs/UPDATING.md`: reproducible commands, the checked deployment path and how to find the live revision.
- `docs/TEMPLATE.md`: current Jekyll/data structure and rules for adding content fields or a new page.
- `docs/TYPOGRAPHY.md`: dynamic event text and the generation step, if changed.
- `GOTCHAS.md`: observed CMS behavior and remaining limitations.
- `DECISIONS.md`: accepted architectural choices after implementation decisions are made.
- `CURRENT.md`: completed phases, evidence, remaining work and the next concrete task.

Some existing documentation still describes the earlier static/no-build setup. Correct those instructions as the new workflow becomes authoritative.

## 15. Definition of done

- [ ] CMS edits cannot publish missing session identities or silently omit valid sessions.
- [ ] A failed check leaves the previous site live and provides an actionable report.
- [ ] Current CMS-owned data fields are covered by the schema, including nested objects.
- [ ] Event name/date and session classification agree across pages, calendars and posters.
- [ ] Existing public session IDs, routes, media links, content and credits survive migration.
- [ ] All editorial areas listed in Phase 4 are editable through tested forms.
- [ ] Normal content edits still require only editing and saving, followed by automatic checks.
- [ ] Real CMS save tests, including a schema-change scenario, are recorded.
- [ ] Mobile/desktop, no-JavaScript and relevant interaction checks pass.
- [ ] Deployment and recovery instructions match the actual configuration.
- [ ] Optional previews remain a separate decision unless explicitly adopted.

## References

- [Current CMS configuration](../.pages.yml)
- [CMS editing guide](CMS.md)
- [Updating the site](UPDATING.md)
- [Template guide](TEMPLATE.md)
- [Typography guide](TYPOGRAPHY.md)
- [Agent working rules](../AGENTS.md)
- [Known pitfalls](../GOTCHAS.md)
- [Original CMS introduction plan](PAGES-CMS-PLAN.md) — historical context; this document plans the next improvements.
- [Session recovery commit](https://github.com/saberkhan372/ccfest-redesign/commit/413b33ea49ce6a774c9a6e61cd90490e3d1357d0)

## Implementation status — October 7, 2026

Phases 0–5 are implemented locally on `cms-improvements`: a locked Jekyll build, recursive validation and regression fixtures, deployed-ID protection, a checked Pages workflow, shared event/time-zone/typography data, field-based poster classification, all seven page-copy forms, structured lists/FAQ/curriculum, metadata, image defaults and updated documentation. Public wording, session identities, routes, assets and credits are preserved.

Local build, schema projection, missing-metadata regression, source-to-render reconciliation, schedule fallback, four-width Chromium, no-JavaScript, registration/calendar and poster checks pass. The implementation is now published on main, Pages Source is GitHub Actions, and [production run 37575337520](https://github.com/saberkhan372/ccfest-redesign/actions/runs/37575337520) passed both build and deploy. Live sessions, all eight pages, calendar and poster data were verified. A real hosted-CMS save, image upload and stale-tab test remain unverified. See [CMS-ROLLOUT.md](CMS-ROLLOUT.md) for those remaining checks and recovery. Optional previews were not introduced.
