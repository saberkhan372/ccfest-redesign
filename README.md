# CC Fest Site

Static site for CC Fest — a free and friendly gathering for creative coding.
Live at **saberkhan372.github.io/ccfest-redesign/**

No build step. For a local preview, run a server from this directory:

```
python3 -m http.server 8876 --bind 127.0.0.1
```

## Docs

| Doc | For |
|---|---|
| [docs/UPDATING.md](docs/UPDATING.md) | **Start here for updates:** Francisca's Figma work, Shristi's pull request, confirmed event details |
| [docs/TEMPLATE.md](docs/TEMPLATE.md) | How the site is built; recipes for new pages and sections |
| [docs/TYPOGRAPHY.md](docs/TYPOGRAPHY.md) | Figma lettering to CSS, and how to verify it |
| [AGENTS.md](AGENTS.md) | Rules and checklists for AI coding agents |

---

## Pages

| URL | File |
|---|---|
| `/` | `index.html` — homepage |
| `/register/` | `register/index.html` — event details and registration |
| `/events/` | `events/index.html` — upcoming events (Virtual CC Fest, Visible Java) |
| `/past-events/` | `past-events/index.html` — archive with agenda links |
| `/mailing-list/` | `mailing-list/index.html` — how to join |
| `/code-of-conduct/` | `code-of-conduct/index.html` — full code of conduct |

---

## File ownership

| File | Owner | Do |
|---|---|---|
| `index.html` | Saber | Homepage markup and content |
| `register/index.html` | Saber | Event page markup and content |
| `styles.css` | Saber | All layout, typography, and base styles |
| `animations.css` | **Shristi** | All motion — keyframes, transitions, scroll-reveal states |
| `animations.js` | **Shristi** | Scroll reveals and the monogram mode switcher |
| `change-sketch.js`, `celebration-confetti.js`, `creativity-scribble.js`, `coding-power.js` | **Shristi** | The interactive modes (p5 canvas, confetti, scribble draw-in, power icons) |
| `redesign.css` | Saber + Francisca | Integrated visual design, variable type, responsive adaptations |
| `interaction.js` | Saber | Motion pause, reduced motion, and the p5 canvas lifecycle |
| `assets/` | Saber | Local fonts/licenses, original design SVGs, p5, and images |
| Figma: CC Fest — Redesign | **Francesca** | Visual design, spacing, colour, and component specs |

**Coordination:** discuss cross-file changes with the owner. Shristi's files stay identical to her branch; host-side needs go in `redesign.css` and `interaction.js`. See [docs/UPDATING.md](docs/UPDATING.md) §2 for merging her pull requests.

---

## Animation hook classes (Shristi)

HTML elements carry `.anim-*` hook classes. Shristi's `animations.css` targets these to add motion — the HTML and CSS stay decoupled.

| Class | Where used | What it does |
|---|---|---|
| `.anim-nav` | `<header>` | Slides nav down on page load |
| `.anim-hero-title` | `<h1>` | Fades title up on page load |
| `.anim-hero-rule` | `<hr>` | Expands rule left-to-right on page load |
| `.anim-hero-sub` | hero `<p>` | Fades subtitle up on page load |
| `.anim-scroll` | scroll sections | Generic fade-up on scroll |
| `.anim-chip` | location chips | Staggered fade-up on scroll |
| `.anim-upcoming-copy` | upcoming left col | Slides in from left on scroll |
| `.anim-upcoming-meta` | upcoming right col | Slides in from right on scroll |

**JS gate:** the inline `<script>` in `<head>` adds `.js` to `<html>` before any CSS loads. Scroll-triggered hidden states are prefixed `.js .anim-*` so content is always visible when JavaScript is disabled.

**Reduced motion:** `animations.css` has a `prefers-reduced-motion` block that disables all animations for users who prefer it.

---

## Deployment

Push to `main` — GitHub Pages deploys automatically from the root of the `main` branch.


## September 15 integration draft

Open [homepage](http://127.0.0.1:8876/) or [event page](http://127.0.0.1:8876/register/) after starting the server. See [DESIGN-INTEGRATION.md](DESIGN-INTEGRATION.md) for source references, typography findings, review points, and browser checks. [CURRENT.md](CURRENT.md) records remaining launch work. No event date, speaker roster, schedule, or Eventbrite ID is confirmed in this draft. Nothing has been deployed.
