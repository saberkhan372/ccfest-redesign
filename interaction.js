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
