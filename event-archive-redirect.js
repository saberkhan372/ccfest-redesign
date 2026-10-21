// Preserve old program deep links while retiring the registration experience.
(() => {
  const root = '/events/october-17-2026/';
  const fragment = location.hash;
  const program = new Set(['#keynotes', '#schedule', '#opening', '#round-1', '#panel', '#round-2', '#closing', '#keynote-opening', '#keynote-closing']);
  location.replace(root + (program.has(fragment) ? 'program/' + fragment : fragment === '#sessions' ? '#sessions' : ''));
})();
