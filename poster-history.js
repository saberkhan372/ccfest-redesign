/* Host-owned, settings-only undo history. Recorded artwork remains in the editor cache. */
(function (root) {
  'use strict';
  function createHistory(limit = 60) {
    const entries = [];
    let index = -1, previousGroup = null;
    return {
      get canUndo() { return index > 0; },
      get canRedo() { return index < entries.length - 1; },
      endGroup() { previousGroup = null; },
      push(value, group = null) {
        const snapshot = JSON.stringify(value);
        if (entries[index] === snapshot) return;
        entries.splice(index + 1);
        if (group && group === previousGroup && index > 0) entries[index] = snapshot;
        else { entries.push(snapshot); if (entries.length > limit) entries.shift(); index = entries.length - 1; }
        previousGroup = group;
      },
      move(direction) {
        if (direction !== -1 && direction !== 1) return null;
        const next = index + direction;
        if (next < 0 || next >= entries.length) return null;
        index = next; previousGroup = null;
        return JSON.parse(entries[index]);
      }
    };
  }
  if (typeof module === 'object' && module.exports) module.exports = createHistory;
  else root.CCPosterHistory = createHistory;
})(typeof window === 'object' ? window : globalThis);
