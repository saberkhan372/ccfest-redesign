/* Host integration only. Designer mode logic remains in animations.js. */
(() => {
  const stage = document.querySelector('.anim-stage');
  if (!stage) return;
  const toggle = stage.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function pause(value) {
    stage.classList.toggle('is-paused', value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.textContent = value ? 'Resume motion' : 'Pause motion';
    window.dispatchEvent(new Event('ccfest:motion'));
  }
  toggle.addEventListener('click', () => pause(!stage.classList.contains('is-paused')));
  preference.addEventListener('change', () => pause(preference.matches));
  pause(preference.matches);
})();
