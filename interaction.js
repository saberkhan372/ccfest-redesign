/* Host integration only. Shristi's mode logic stays in her files: animations.js,
   change-sketch.js, celebration-confetti.js, creativity-scribble.js, coding-power.js. */
(() => {
  const stage = document.querySelector('.anim-stage');
  if (!stage) return;
  const toggle = stage.querySelector('.motion-toggle');
  const artwork = stage.querySelector('.cc-mono');
  const changeHost = stage.querySelector('#changeCanvas');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let onScreen = true;

  // "Change" mode is a p5 sketch in global mode, so loop() and noLoop() are globals once
  // p5 has started. Draw only while that mode shows, on screen, in a visible tab, unpaused.
  function syncCanvas() {
    if (typeof window.noLoop !== 'function' || !changeHost || !changeHost.querySelector('canvas')) return;
    stage.classList.add('canvas-ready');
    const run = onScreen && !document.hidden && stage.dataset.mode === 'change' && !stage.classList.contains('is-paused');
    if (run) loop(); else noLoop();
  }

  function pause(value) {
    stage.classList.toggle('is-paused', value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.textContent = value ? 'Resume motion' : 'Pause motion';
    // The scribble wobble in "Creativity" is an SVG <animate>, which CSS cannot pause.
    if (artwork && artwork.pauseAnimations) value ? artwork.pauseAnimations() : artwork.unpauseAnimations();
    syncCanvas();
  }

  toggle.addEventListener('click', () => pause(!stage.classList.contains('is-paused')));
  preference.addEventListener('change', () => pause(preference.matches));
  new MutationObserver(syncCanvas).observe(stage, { attributes: true, attributeFilter: ['data-mode'] });
  if (changeHost) new MutationObserver(syncCanvas).observe(changeHost, { childList: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    syncCanvas();
  }).observe(stage);
  document.addEventListener('visibilitychange', syncCanvas);
  window.addEventListener('load', syncCanvas);
  pause(preference.matches);
})();
