/* Host integration: opens Luma's registration form in a dialog on the event page.
   Loaded only when _data/event.yml has both registration_url and luma_event_id.
   Without JavaScript, or without <dialog>, the Register link simply goes to Luma. */
(() => {
  const link = document.querySelector('[data-luma-event]');
  const dialog = document.getElementById('registration-dialog');
  if (!link || !dialog || typeof dialog.showModal !== 'function') return;

  // Accept a bare id, or anything pasted from Luma that contains one.
  const id = (link.dataset.lumaEvent.match(/evt-[A-Za-z0-9]+/) || [])[0];
  if (!id) return;
  const frame = dialog.querySelector('iframe');

  link.querySelector('.external-mark')?.remove();
  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', event => {
    // A modified click still opens Luma in a tab, as a link should.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Contact Luma only once someone asks to register, then keep the form so closing by mistake loses nothing.
    if (!frame.getAttribute('src')) frame.src = `https://luma.com/embed/event/${id}/simple`;
    dialog.showModal();
  });

  dialog.querySelector('.registration-dialog-close').addEventListener('click', () => dialog.close());
  // A click on the backdrop lands on the dialog itself; clicks inside the form stay in the iframe.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();
