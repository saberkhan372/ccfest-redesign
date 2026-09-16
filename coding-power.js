/* ─── CC Fest · "Coding" mode — power icon on/off signals ──────────────
 * Owner: Shristi
 * animations.css already rotates each power ring into place and reveals
 * its line on #monogramWrap:hover (coding mode only). The alternating
 * var(--cc-orange) / var(--cc-power-green) color swap only runs while
 * that hover is active — hovering starts it (icons begin on opposite
 * colors, so together they read as one "on" and one "off" signal
 * swapping back and forth), and leaving stops it. Clicking an icon
 * presses it in and flips its own color immediately, independent of
 * the other icon's schedule. */

(function () {
  const FLIP_INTERVAL = 1600; // ms between automatic color flips
  const ORANGE = 'var(--cc-orange)';
  const GREEN = 'var(--cc-power-green)';
  const PRESS_CLASS = 'is-pressed';

  let monogramWrap;
  let hovering = false;
  const icons = [];

  function isCoding() {
    return !!monogramWrap && monogramWrap.dataset.mode === 'coding';
  }

  function createIcon(el, initialColor) {
    let color = initialColor;
    let timer = null;

    function apply() {
      el.style.setProperty('--cc-power-color', color);
    }

    function scheduleNext() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        flip();
        scheduleNext();
      }, FLIP_INTERVAL);
    }

    function flip() {
      color = color === ORANGE ? GREEN : ORANGE;
      apply();
    }

    function stop() {
      clearTimeout(timer);
      timer = null;
    }

    function press() { el.classList.add(PRESS_CLASS); }
    function release() { el.classList.remove(PRESS_CLASS); }

    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('click', function () {
      if (!isCoding()) return;
      flip();
      scheduleNext();
    });

    return { apply, scheduleNext, stop };
  }

  function startAll() {
    icons.forEach(function (icon) {
      icon.apply();
      icon.scheduleNext();
    });
  }

  function stopAll() {
    icons.forEach(function (icon) { icon.stop(); });
  }

  function watchMode() {
    let wasCoding = isCoding();
    const observer = new MutationObserver(function () {
      const nowCoding = isCoding();
      if (!nowCoding && wasCoding) stopAll();
      else if (nowCoding && !wasCoding && hovering) startAll();
      wasCoding = nowCoding;
    });
    observer.observe(monogramWrap, { attributes: true, attributeFilter: ['data-mode'] });
  }

  function watchHover() {
    monogramWrap.addEventListener('mouseenter', function () {
      hovering = true;
      if (isCoding()) startAll();
    });
    monogramWrap.addEventListener('mouseleave', function () {
      hovering = false;
      stopAll();
    });
  }

  function setup() {
    monogramWrap = document.getElementById('monogramWrap');
    const left = document.querySelector('.cc-power-left');
    const right = document.querySelector('.cc-power-right');
    if (!monogramWrap || !left || !right) return;

    icons.push(createIcon(left, ORANGE));
    icons.push(createIcon(right, GREEN));

    watchMode();
    watchHover();
  }

  setup();
})();
