/* ─── CC Fest · Scroll-reveal trigger ─────────────────────────────────
 * Owner: Shristi
 *
 * Watches .anim-scroll, .anim-upcoming-copy, .anim-upcoming-meta,
 * and .anim-chip elements. Adds .is-visible when they enter the
 * viewport, letting animations.css do the actual motion.
 *
 * Stagger delay for chip groups: set via CSS custom property
 * --stagger-delay on each chip so animations.css can read it.
 * ─────────────────────────────────────────────────────────────────── */

(function () {
  const STAGGER_STEP = 50; // ms between each chip

  // Stamp stagger delays on chip groups before observer fires
  document.querySelectorAll('.location-chips, .chips').forEach(function (group) {
    group.querySelectorAll('.anim-chip').forEach(function (chip, i) {
      chip.style.setProperty('--stagger-delay', i * STAGGER_STEP + 'ms');
    });
  });

  // Single observer for all scroll-triggered elements
  const targets = [
    '.anim-scroll',
    '.anim-chip',
    '.anim-upcoming-copy',
    '.anim-upcoming-meta',
  ].join(', ');

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(targets).forEach(function (el) {
    observer.observe(el);
  });
})();


/* ─── CC Fest · Monogram mode switcher ─────────────────────────────────
 * Owner: Shristi
 *
 * Clicking a .mode-btn swaps #monogramWrap's [data-mode] — animations.css
 * keys each mode's look (color, transforms, etc.) off that attribute on
 * the shared monogram markup. Also updates the "10 years of ___" label
 * and keeps each button's selected state (.is-active + aria-selected)
 * in sync.
 * ─────────────────────────────────────────────────────────────────── */

(function () {
  const modesNav = document.querySelector('.modes-list');
  const monogramWrap = document.getElementById('monogramWrap');
  const stageMain = document.querySelector('.anim-stage-main');
  const stage = document.querySelector('.anim-stage');
  const labelRight = document.getElementById('labelRight');

  if (!modesNav || !monogramWrap) return;

  function setMode(mode, label) {
    monogramWrap.dataset.mode = mode;
    // Mirrored onto .anim-stage-main too: its own [data-mode="creative-commons"]
    // rule toggles the tiled copyright-mark background-image directly on the
    // stage itself (not a descendant of #monogramWrap), so it needs the
    // attribute on that element too.
    if (stageMain) stageMain.dataset.mode = mode;
    // And onto .anim-stage: .cc-text lives there now (a sibling of
    // .anim-stage-main, not a descendant of it or #monogramWrap), so its
    // [data-mode="…"] .cc-text-* rules need this ancestor to carry it too.
    if (stage) stage.dataset.mode = mode;
    if (labelRight) labelRight.textContent = label;

    modesNav.querySelectorAll('.mode-btn').forEach(function (btn) {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
  }

  modesNav.querySelectorAll('.mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMode(btn.dataset.mode, btn.textContent.trim());
    });
  });

  // Roving tabindex: arrow keys move focus + selection between tabs
  modesNav.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

    const buttons = Array.from(modesNav.querySelectorAll('.mode-btn'));
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    e.preventDefault();
    const nextIndex = e.key === 'ArrowRight'
      ? (currentIndex + 1) % buttons.length
      : (currentIndex - 1 + buttons.length) % buttons.length;
    const nextBtn = buttons[nextIndex];

    nextBtn.focus();
    setMode(nextBtn.dataset.mode, nextBtn.textContent.trim());
  });

  // Sync initial selection to whichever mode the markup already shows
  const initialBtn = modesNav.querySelector('.mode-btn[data-mode="' + monogramWrap.dataset.mode + '"]')
    || modesNav.querySelector('.mode-btn');
  if (initialBtn) setMode(initialBtn.dataset.mode, initialBtn.textContent.trim());
})();
