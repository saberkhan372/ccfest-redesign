/* ─── CC Fest · "Creativity" mode — scribble doodle draw-in ────────────
 * Owner: Shristi
 * Each C gets a hand-drawn scribble (assets/animation/scribble-1.svg
 * and scribble-2.svg) that "draws itself in" like a pen tracing it,
 * instead of popping in instantly.
 *
 * The scribble SVGs are fetched at runtime rather than inlined in
 * index.html (their path data alone is 600KB+) and split into two
 * pieces in <defs>:
 *  - the untouched compound path, used as the real, correctly-shaped
 *    fill (it's a single filled shape made of ~178 subpaths — a
 *    vectorized outline of many overlapping hand-drawn strokes).
 *  - just its single longest subpath, which turns out to be one true
 *    continuous line carrying almost all of the visible ink (the
 *    "coil" the doodle is built from). Arc length only corresponds to
 *    visual coverage for that one continuous piece, not the compound
 *    whole, so it's what drives the mask's stroke-dashoffset reveal —
 *    the classic "draw a line in" technique, scoped to the one piece
 *    of geometry it actually works on.
 * The offset is driven from a rAF loop with a plain attribute write
 * rather than a CSS transition/style write, which is what reliably
 * repaints the masked fill each frame.
 *
 * Once a side finishes drawing in, its fill gets the cc-scribble-alive
 * class, which applies the #scribbleWiggle SVG filter (feTurbulence +
 * feDisplacementMap, animated via SMIL in index.html) so the ink keeps
 * subtly trembling in place instead of going static — the filter jitters
 * the rendered pixels directly, so it stays cheap regardless of how
 * complex the underlying path is (unlike change-sketch.js's per-vertex
 * jitter, which works because it rebuilds simple procedural geometry
 * every frame — not practical for this multi-hundred-KB hand-drawn
 * path). */

(function () {
  const DRAW_DURATION = 4; // seconds for the doodle to fully draw in
  const REVEAL_STROKE_WIDTH = 20; // tuned so the fully-revealed mask matches the source art with no gaps

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ALIVE_CLASS = 'cc-scribble-alive';
  const SOURCES = {
    left: { url: 'assets/animation/scribble-4.svg', pathId: 'scribbleLeftPath', mainId: 'scribbleLeftMainPath', revealClass: 'cc-scribble-reveal-left', fillClass: 'cc-scribble-left' },
    right: { url: 'assets/animation/scribble-3.svg', pathId: 'scribbleRightPath', mainId: 'scribbleRightMainPath', revealClass: 'cc-scribble-reveal-right', fillClass: 'cc-scribble-right' },
  };

  // cubic-bezier(0.45, 0, 0.4, 1), solved per-frame via Newton-Raphson.
  function makeCubicBezier(x1, y1, x2, y2) {
    function a(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
    function b(a1, a2) { return 3 * a2 - 6 * a1; }
    function c(a1) { return 3 * a1; }
    function calcBezier(t, a1, a2) { return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t; }
    function getSlope(t, a1, a2) { return 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1); }
    function getTForX(x) {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const currentSlope = getSlope(t, x1, x2);
        if (Math.abs(currentSlope) < 1e-6) break;
        t -= (calcBezier(t, x1, x2) - x) / currentSlope;
      }
      return t;
    }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return calcBezier(getTForX(x), y1, y2);
    };
  }
  const drawEase = makeCubicBezier(0.45, 0, 0.4, 1);

  let monogramWrap;
  const sides = [];

  function isCreativity() {
    return !!monogramWrap && monogramWrap.dataset.mode === 'creativity';
  }

  async function fetchPathD(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch ' + url + ': ' + res.status);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const path = doc.querySelector('path');
    return path.getAttribute('d');
  }

  function longestSubpath(d) {
    const subpaths = d.split(/(?=M)/g);
    return subpaths.reduce((longest, sp) => (sp.length > longest.length ? sp : longest), '');
  }

  function injectPaths(defs, source, d) {
    const fullPath = document.createElementNS(SVG_NS, 'path');
    fullPath.setAttribute('id', source.pathId);
    fullPath.setAttribute('d', d);
    defs.appendChild(fullPath);

    const mainPath = document.createElementNS(SVG_NS, 'path');
    mainPath.setAttribute('id', source.mainId);
    mainPath.setAttribute('d', longestSubpath(d));
    defs.appendChild(mainPath);
  }

  function setupSide(source) {
    const path = document.getElementById(source.mainId);
    const reveal = document.querySelector('.' + source.revealClass);
    const fill = document.querySelector('.' + source.fillClass);
    if (!path || !reveal || !fill) return null;

    reveal.setAttribute('stroke-width', String(REVEAL_STROKE_WIDTH));
    const length = path.getTotalLength();
    reveal.setAttribute('stroke-dasharray', String(length));
    reveal.setAttribute('stroke-dashoffset', String(length));
    return { reveal, fill, length, rafId: null };
  }

  function resetSide(side) {
    if (!side) return;
    if (side.rafId != null) {
      cancelAnimationFrame(side.rafId);
      side.rafId = null;
    }
    side.fill.classList.remove(ALIVE_CLASS);
    side.reveal.setAttribute('stroke-dashoffset', String(side.length));
  }

  function animateSide(side, startTime) {
    function tick(now) {
      if (!isCreativity()) { side.rafId = null; return; }
      const t = Math.min((now - startTime) / 1000 / DRAW_DURATION, 1);
      const eased = drawEase(t);
      side.reveal.setAttribute('stroke-dashoffset', String(side.length * (1 - eased)));
      if (t < 1) {
        side.rafId = requestAnimationFrame(tick);
      } else {
        side.fill.classList.add(ALIVE_CLASS);
        side.rafId = null;
      }
    }
    side.rafId = requestAnimationFrame(tick);
  }

  function playDrawIn() {
    const startTime = performance.now();
    sides.forEach(function (side) {
      resetSide(side);
      if (side) animateSide(side, startTime);
    });
  }

  function watchMode() {
    let wasCreativity = isCreativity();
    const observer = new MutationObserver(() => {
      const nowCreativity = isCreativity();
      if (nowCreativity && !wasCreativity) {
        playDrawIn();
      }
      wasCreativity = nowCreativity;
    });
    observer.observe(monogramWrap, { attributes: true, attributeFilter: ['data-mode'] });
  }

  async function setup() {
    monogramWrap = document.getElementById('monogramWrap');
    const defs = document.getElementById('ccDefs');
    if (!monogramWrap || !defs) return;

    const entries = Object.values(SOURCES);
    const dList = await Promise.all(entries.map((source) => fetchPathD(source.url)));
    entries.forEach((source, i) => injectPaths(defs, source, dList[i]));

    sides.push(setupSide(SOURCES.left));
    sides.push(setupSide(SOURCES.right));

    watchMode();
    if (isCreativity()) playDrawIn();
  }

  setup();
})();
