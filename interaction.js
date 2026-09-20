/* Host integration only. Shristi's mode logic stays in her files: animations.js,
   change-sketch.js, celebration-confetti.js, creativity-scribble.js, coding-power.js.
   There is no pause button: every mode moves only after someone picks it or points at it
   (Shristi and Saber, 2026-09-16). The system "reduce motion" setting still stills it. */
(() => {
  const stage = document.querySelector('.anim-stage');
  if (!stage) return;
  const artwork = stage.querySelector('.cc-mono');
  const changeHost = stage.querySelector('#changeCanvas');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let onScreen = true;

  // "Change" mode is a p5 sketch in global mode, so loop() and noLoop() are globals once
  // p5 has started. Draw only while that mode shows, on screen, in a visible tab.
  function syncCanvas() {
    if (typeof window.noLoop !== 'function' || !changeHost || !changeHost.querySelector('canvas')) return;
    stage.classList.add('canvas-ready');
    const run = onScreen && !document.hidden && stage.dataset.mode === 'change' && !reduceMotion.matches;
    if (run) loop(); else noLoop();
  }

  // The scribble wobble in "Creativity" is an SVG <animate>, which CSS cannot pause.
  function syncArtwork() {
    if (!artwork || !artwork.pauseAnimations) return;
    if (reduceMotion.matches) artwork.pauseAnimations(); else artwork.unpauseAnimations();
  }

  reduceMotion.addEventListener('change', () => { syncArtwork(); syncCanvas(); });
  new MutationObserver(syncCanvas).observe(stage, { attributes: true, attributeFilter: ['data-mode'] });
  if (changeHost) new MutationObserver(syncCanvas).observe(changeHost, { childList: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    syncCanvas();
  }).observe(stage);
  document.addEventListener('visibilitychange', syncCanvas);
  window.addEventListener('load', syncCanvas);
  syncArtwork();
})();

/* Host integration only. Picking a word changes the artwork, but on a phone — and on any
   short window — the stage is still half below the fold, so the change happens where you
   cannot see it. Glide the band into view on the first pick. Shristi's mode logic in
   animations.js is untouched; this only listens for the same clicks.
   Arrow keys are deliberately not wired up: moving the page under a roving tablist is
   disorienting. The "reduce motion" setting turns the glide into a jump.
   Every scrollTo here passes behavior:'instant' on purpose: styles.css sets
   scroll-behavior:smooth on <html>, so a plain scrollTo would start a second, browser-run
   easing on top of each frame of this one and the two would fight. */
(() => {
  const stage = document.querySelector('.anim-stage');
  const modes = document.querySelector('.modes-list');
  if (!stage || !modes) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const SLACK = 24;  // already near enough: do not nudge the page for a few pixels
  let frame = 0;

  // Where the stage sits best: centred, or its top at the top of the window when the band
  // is taller than the window (so the words stay on screen either way).
  function restingScroll() {
    const box = stage.getBoundingClientRect();
    const gap = Math.max(0, innerHeight - box.height) / 2;
    const max = document.documentElement.scrollHeight - innerHeight;
    return Math.min(Math.max(scrollY + box.top - gap, 0), max);
  }

  function stop() { if (frame) { cancelAnimationFrame(frame); frame = 0; } }

  function glideTo(target) {
    const from = scrollY;
    const distance = target - from;
    // Slow on purpose, and slower the further it has to go, up to a second and a half.
    const ms = Math.min(1500, 500 + Math.abs(distance) * 1.1);
    const start = performance.now();
    stop();
    (function step(now) {
      const t = Math.min(1, (now - start) / ms);
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;  // ease in-out
      scrollTo({ top: from + distance * eased, behavior: 'instant' });
      frame = t < 1 ? requestAnimationFrame(step) : 0;
    })(start);
  }

  // A scroll, swipe or key of their own always wins: let go of the page at once.
  ['wheel', 'touchstart', 'keydown'].forEach(type =>
    addEventListener(type, stop, { passive: true }));

  modes.addEventListener('click', event => {
    if (!event.target.closest('.mode-btn')) return;
    const target = restingScroll();
    if (Math.abs(target - scrollY) < SLACK) return;
    if (reduceMotion.matches) scrollTo({ top: target, behavior: 'instant' });
    else glideTo(target);
  });
})();
