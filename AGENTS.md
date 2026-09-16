# Agent guide: CC Fest site

For AI coding agents (Claude Code, Codex, and friends). Humans: start with [docs/TEMPLATE.md](docs/TEMPLATE.md).

## Read first

1. [CURRENT.md](CURRENT.md) — state and open risks
2. [docs/UPDATING.md](docs/UPDATING.md) — **the workflows**: Francisca's Figma updates, Shristi's pull request, confirmed event details, new pages
3. [docs/TEMPLATE.md](docs/TEMPLATE.md) — file roles, CSS layering, section patterns
4. [docs/TYPOGRAPHY.md](docs/TYPOGRAPHY.md) — before touching any heading or logo carrying `data-figma-node`
5. [GOTCHAS.md](GOTCHAS.md) and [DECISIONS.md](DECISIONS.md)

## Stack

Static HTML/CSS/JS, published by GitHub Pages from `main`. No framework, bundler, or `package.json` — don't add one.

```bash
python3 -m http.server 8876 --bind 127.0.0.1
```

## Hard rules

- **Never push, deploy, or email without Saber's explicit approval.** Pushing `main` publishes the live site.
- **Never edit the designers' source folders:** `Shristi-ccfest-redesign-10-years-origin/`, `figma-to-html/`, `figma-to-html (1)/`, `figma-to-html-registration (2)/`. Reference only.
- **Never edit the Figma file.** Read-only calls.
- **Never call donations tax-deductible.** They go to the organizer, not a registered charity.
- **Don't invent content.** No made-up dates, speakers, times, prices, or registration links, and never ship Figma's bracketed placeholders (`[Keynote name]`). Use the honest "to be announced" copy already in the layouts.
- **Don't hand-edit `data-figma-run` spans.** Change `design/figma-typography.json`, then run `node scripts/sync-typography.cjs`.
- **Shristi's work arrives by pull request.** Merge it on a branch as in [docs/UPDATING.md](docs/UPDATING.md) §2 — never straight onto `main`, and never revert `main` to make a merge easier.
- **Keep the designer credits** (`.design-credits`) in every footer.
- **Respect ownership.** `animations.css`, `animations.js`, `change-sketch.js`, `celebration-confetti.js`, `creativity-scribble.js`, and `coding-power.js` are Shristi's and stay identical to her branch; Figma is Francisca's. Host-side changes go in `redesign.css`, `interaction.js`, `event-banner.js` or `registration.js` — and say so in your summary.

## Where changes go

| Change | File |
|---|---|
| Colours, fonts, sizes, spacing, responsive fixes | The matching numbered section of `redesign.css` |
| Page structure or content | That page's `index.html` |
| Base layout primitives used everywhere | `styles.css` (rare) |
| Reduced motion, p5 canvas lifecycle | `interaction.js` |
| Floating "Upcoming" reminder | `_layouts/base.html`, `event-banner.js` |
| Registration popup (Luma) | `registration.js`; setup in [docs/REGISTRATION.md](docs/REGISTRATION.md) |
| Figma lettering | `design/figma-typography.json` + `scripts/sync-typography.cjs` |

Match the surrounding style: one-line CSS rules grouped under the section comments in `redesign.css`, semantic HTML with `aria-labelledby` sections, relative asset paths.

## Checklists

**New page**
- [ ] Copied from an existing page; relative paths fixed for the folder depth
- [ ] Unique `<title>` and description; one `<h1>`; skip link; `lang="en"`
- [ ] Nav on every page updated, with `aria-current="page"` on the current link
- [ ] Lettered headings registered in the sync script and synced
- [ ] Added to `PAGES` in `scripts/verify.cjs`
- [ ] No horizontal scroll at 320 / 390 / 768 / 1440px

**Design update from Francisca**
- [ ] Node id and file key confirmed from her link
- [ ] Spacing read from Figma's own values, not the generated code (16px-base bug)
- [ ] `node scripts/sync-typography.cjs` run; a second run changes nothing
- [ ] Ink width within ~1px of the Figma export at the design size
- [ ] Placeholders replaced with honest copy
- [ ] Summary written for her, including anything not reproducible

**Interactive / motion change**
- [ ] Works with JavaScript disabled (content visible, controls hidden)
- [ ] Honours `prefers-reduced-motion` (there is no pause button, by decision; see DECISIONS.md)
- [ ] Canvas stops when offscreen, hidden, in another mode, or under reduced motion

## Verify before reporting done

```bash
node scripts/verify.cjs http://127.0.0.1:8876/
```

Needs Playwright and Chrome. If Playwright isn't installed, say so plainly and check the pages in a browser at the four widths instead. Also run `git diff --check`.

Report honestly: what you verified, what you couldn't, and what still needs a designer's eye.

## Handoff

End a session by updating `CURRENT.md` (state, verified vs. untested, next task). Record lasting choices in `DECISIONS.md` and pitfalls in `GOTCHAS.md`.

## Key references

- Figma file `jMiMzds3qYD2mO5w2Dsg4P` — Homepage `218:104`, Register `251:732`
- Shristi's branch: https://github.com/saberkhan372/ccfest-redesign/tree/10-years-origin (PR #1: https://github.com/saberkhan372/ccfest-redesign/pull/1)
- Credits: Design by Francisca José Rodrigues, Interactives by Shristi Singh
