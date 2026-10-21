# October 17, 2026 event archive

The permanent home is `/events/october-17-2026/`: one event story, nineteen session recaps, and `program/` for the original schedule. `/events/` separates upcoming camps from past-event recordings. `/register/` is a fragment-aware browser redirect with a canonical URL and a visible no-JavaScript fallback; it is not an HTTP 301. See `redirects.json`. The old `/recaps/` preview was never public and is removed.

## Sources and editing

Notion remains the writing source. `_data/recap_oct17.json` is a deliberate reader-facing snapshot, not an automatic integration. Each page records its source URL and fetched edit time. Refresh the event prose before `## Recordings`; for sessions, take the prose after `## Recap` and stop before `## Editorial evidence`. Preserve takeaways, try-it prompts, and checked resources. Never import editorial evidence, private chats, raw transcripts or production notes. The importer rejects unknown blocks, unsafe HTML and unmapped images; Notion references become local links. Do not hand-edit generated recap HTML.

`_data/recap_program.json` freezes the public program, seventeen workshop/panel records, two keynotes and twenty-two presenter profiles. It was copied from the validated site data during the archive migration, without registration/checkout settings. Future edits to the upcoming-event CMS fields must not rewrite this historical snapshot. `program_id` explicitly maps Melissa/Missy Cooper and Kofi's longer published ID to their recap slugs; all other session IDs are preserved. The program keeps original descriptions/resources and separately labels presenter-shared workshop materials.

At Saber's specific authorization, only session names, material-sharing permissions and resource links were read from the supplied feedback sheet. Four links were confirmed for Tristan, Blair, Sai and Julien; the three GitHub repositories are public, and Sai's public 2026 guide was opened successfully. No response names, reflections, technical feedback or other response columns were read or copied into this repository. The source sheet itself is not published here.

## Person links

`_data/recap_people.json` is the reviewed directory for names and websites/profiles, with evidence and explicit aliases. Prefer a personal site; use an institutional, gallery, or professional profile when needed. Short names that could identify multiple people are enabled only on reviewed pages. Existing links, linked session cards, code, attributes, and disclosure/button labels are left intact.

The checked `scripts/build.rb` pipeline runs `scripts/link-recap-people.rb` after Jekyll, so names in the story, captions, attributions, presenter headings and frozen program bios receive ordinary static links without modifying the Notion snapshot or historical program. It verifies exact text preservation and unchanged existing links. Use this build pipeline, rather than bare `jekyll build`, for a complete archive preview. No browser JavaScript or network lookup is needed to add the links; future people and aliases require a reviewed directory update.

## Images and quotes

`_data/recap_media.json` maps five existing demonstration images to ten local WebP derivatives, totalling about 0.95 MB. `media-manifest.json` preserves original frame hashes, source recording/time and derivative hashes. Original recordings/stills remain unchanged outside this checkout. The website uses Missy's 11:00 demonstration frame; the retained Notion image is from 9:30. Both depict the earlier screen-based work, not the physical painting.

Saber explicitly authorized publication after reviewing the preview, including the existing shared-collage hero with participant names/handles. This records publication authorization, not an independent rights clearance. Selected quotes were cross-checked against Zoom transcripts and independent machine transcriptions of original audio. Human listening and full viewing of every recording are not claimed. Recording offsets have not been aligned to YouTube chapters. The four thematic groupings are editorial interpretation; only the sourced spoken callbacks are described as explicit references.

## Build and verification

Run `bundle exec ruby scripts/build.rb /tmp/ccfest-recap-preview-site`, then `node scripts/serve.cjs /tmp/ccfest-recap-preview-site 8897`. The build imports twenty recap pages and verifies those plus the program: metadata, local links/anchors, nineteen story links, nineteen replays, twenty-two profiles, image hashes and editorial exclusion. `import-manifest.json` records the snapshot hash and all twenty-one routes. The original schedule reconciliation and its omission/duplicate/title regression tests now target the archived program. Browser suites include the archive and old Register redirects at 320/390/768/1440.

On this Mac only, Homebrew Ruby 3.4 needs the already-installed `base64`, `bigdecimal` and `csv` gems added to its bundle. `/tmp/ccfest-recap-preview.Gemfile` evaluates the repository Gemfile and adds these dependencies. The repository Gemfile/lock remain unchanged; CI uses Ruby 3.3.

```sh
env PATH=/opt/homebrew/opt/ruby@3.4/bin:$PATH BUNDLE_GEMFILE=/tmp/ccfest-recap-preview.Gemfile LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 RUBYOPT=-W0 bundle exec ruby scripts/build.rb /tmp/ccfest-recap-preview-site
```

## Publishing and recovery

Saber explicitly approved committing, pushing to main and publishing this archive. Pushes to main run the existing checked GitHub Pages workflow; deployment requires successful content tests, build, reconciliation tests and browser checks. No new host, package manager, DNS change or runtime Notion dependency is involved. Recap/program pages are indexable; the retired Register page remains noindex.

The implementation was isolated in `zoom_exporter/recap-site-preview`, based on `063f8d8`, preserving the main checkout's unrelated changes. If rollback is needed, revert the archive commit and push through the same checked pipeline after authorization. Do not reset the user's working checkout. Cross-browser, screen-reader and complete external-resource verification remain outside the verified boundary.
