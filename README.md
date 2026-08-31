# CC Fest Site

Static site for CC Fest — a free and friendly gathering for creative coding.
Live at **saberkhan372.github.io/ccfest-redesign/**

No build step. Open any `.html` file in a browser, or run a local server:

```
npx serve .
```

---

## Pages

| URL | File |
|---|---|
| `/` | `index.html` — homepage |
| `/register/` | `register/index.html` — event details and registration |

---

## File ownership

| File | Owner | Do |
|---|---|---|
| `index.html` | Saber | Homepage markup and content |
| `register/index.html` | Saber | Event page markup and content |
| `styles.css` | Saber | All layout, typography, and base styles |
| `animations.css` | **Shristi** | All motion — keyframes, transitions, scroll-reveal states |
| `animations.js` | **Shristi** | IntersectionObserver that triggers scroll animations |
| `assets/` | Saber | Favicon and any image assets |
| Figma: CC Fest — Redesign | **Francesca** | Visual design, spacing, colour, and component specs |

**Rule:** each person edits only their files. Cross-file changes need a conversation first.

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
