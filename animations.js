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
