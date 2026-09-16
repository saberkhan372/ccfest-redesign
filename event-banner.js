/* Host integration: the floating "Upcoming" reminder that _layouts/base.html prints while
   registration is open. Without JavaScript it simply stays put. */
(() => {
  const banner = document.querySelector('.event-banner');
  if (!banner) return;
  const KEY = 'ccfest-event-banner-hidden';
  const hide = () => { banner.hidden = true; };

  // Two days after the event date (UTC), step down even if nobody has cleared the registration link yet.
  const date = banner.dataset.eventDate;
  if (date && Date.now() > Date.parse(date + 'T00:00:00Z') + 2 * 864e5) return hide();

  // "Hide" lasts for this visit only.
  try { if (sessionStorage.getItem(KEY)) return hide(); } catch (e) { /* storage blocked: keep showing */ }
  const close = banner.querySelector('.event-banner-close');
  close.hidden = false;
  close.addEventListener('click', () => {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* storage blocked: hide for this page only */ }
    hide();
  });

  // On the event page, get out of the way while the registration section itself is on screen.
  const band = document.getElementById('registration');
  if (band && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => banner.classList.toggle('is-tucked', entry.isIntersecting)).observe(band);
  }
})();
