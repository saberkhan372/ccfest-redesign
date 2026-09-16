# Project gotchas

- Use the CC Fest preview on port 8876. The in-app browser retained another project at 8765 even after reload; fresh Chrome tests did not expose this. Verify the actual user-facing browser tab before delivering a preview. The precise cache mechanism was not diagnosed.

- **Liquid's `blank` does not work in Jekyll 3.10 here.** `nil == blank` evaluates false and `"" != blank` evaluates true, so `{% if thing != blank %}` is not a usable emptiness test. Every optional value in the templates is normalised with `| default: "" | strip` and compared against `""`; optional lists are tested with `| size`. This matters because Pages CMS saves a cleared field as an empty string, not as a missing key — without the normalisation, clearing the event date renders an empty slot instead of "To be confirmed".

- **Pages CMS strips the comments out of a data file the first time it saves it.** The explanatory comments in `_data/*.yml` are for whoever opens the repo; the guidance an editor actually sees lives in the `description:` lines in `.pages.yml`. Keep it there, and expect the YAML comments to disappear.

- **`python3 -m http.server` is not reliable enough to test against.** It is single-threaded and drops parallel requests from a headless browser, which shows up as a page that renders unstyled and a screenshot comparison that "fails" for no reason. It cost one false result during the CMS work. Use `npx http-server <dir> -p 8881 -c-1` instead.

- **Native Ruby gems will not compile on this Mac as shipped.** The Command Line Tools are clang 15, which predates `<stdckdint.h>`, but Homebrew's Ruby headers include it, so every gem with a C extension fails. The workaround used here: install `ruby@3.4` and drop a three-macro `stdckdint.h` shim (built on `__builtin_*_overflow`) into `/opt/homebrew/Cellar/ruby@3.4/*/include/ruby-3.4.0/`. Updating the Command Line Tools is the real fix.

- **GitHub Pages adds a theme unless you say no.** With no `theme` key in `_config.yml`, the Pages build falls back to `jekyll-theme-primer` and deploys ~130KB of CSS that no page links to. `_config.yml` now carries an empty `theme:` line to stop that. Verified by building with the `github-pages` gem (v232, which pins Jekyll 3.10.0) in `--safe` mode.

- **Build Jekyll with a UTF-8 locale.** Without `LANG`/`LC_ALL` set, Ruby reads files as US-ASCII and the build dies on the first em dash ("Invalid US-ASCII character \xE2"). GitHub's builders set UTF-8; a local shell may not.
