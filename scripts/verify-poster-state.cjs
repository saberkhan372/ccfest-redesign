/* Pure state checks; browser rendering is covered by verify-poster.cjs. No dependencies. */
const assert = require('node:assert/strict');
const A = require('../poster-art.js');
globalThis.CCPosterArt = A;
require('../poster-designs.js');
const createHistory = require('../poster-history.js');

const legacy = structuredClone(A.DEFAULTS);
delete legacy.design;
legacy.layout.portrait = { art: { x: 12, y: -4, s: 0.8 } };
const migrated = A.validate(legacy);
assert.equal(migrated.design, 'classic');
assert.deepEqual(migrated.layout, legacy.layout);
assert.equal(A.layoutKey(migrated), 'portrait');
assert.throws(() => A.validate({ ...legacy, design: '__proto__' }), /valid design/);

for (const [design, definition] of Object.entries(A.designs)) {
  for (const template of definition.templates) {
    const value = A.validate({ ...A.DEFAULTS, design, template, feature: 1 });
    const key = A.layoutKey(value);
    value.layout[key] = { title: { x: 18, y: -8, s: 1.2 } };
    assert.deepEqual(A.validate(value), value);
    assert.notEqual(key, A.layoutKey({ ...value, feature: 2 }));
    assert.notEqual(key, A.layoutKey({ ...value, format: 'story' }));
  }
}
assert.throws(() => A.validate({ ...A.DEFAULTS, layout: { 'signature:announcement:1:bad': {} } }), /layout/);
const title = { 'session:1': { title: 'A shorter, accurate title' } };
assert.deepEqual(A.validate({ ...A.DEFAULTS, texts: title }).texts, title);
for (const bad of ['', '   ', '<script>', 'a'.repeat(201)]) {
  assert.throws(() => A.validate({ ...A.DEFAULTS, texts: { 'session:1': { title: bad } } }), /title/);
}

const h = createHistory(4);
const state = { text: '', layout: { x: 0 } };
h.push(state);
assert.equal(h.canUndo, false);
state.layout.x = 20;
h.push(state);
assert.equal(h.move(-1).layout.x, 0, 'Snapshots must not share mutable layout references');
assert.equal(h.move(1).layout.x, 20);
h.push({ text: 'a' }, 'description');
h.push({ text: 'ab' }, 'description');
h.push({ text: 'abc' }, 'description');
assert.equal(h.move(-1).layout.x, 20, 'Continuous typing is a single undo operation');
assert.equal(h.move(1).text, 'abc');
h.endGroup();
h.push({ text: 'abcd' }, 'description');
assert.equal(h.move(-1).text, 'abc', 'Editing after blur starts a new undo operation');
h.push({ text: 'new branch' });
assert.equal(h.canRedo, false);
assert.equal(h.move(1), null);
for (let i = 0; i < 20; i++) h.push({ i });
let count = 0;
while (h.move(-1)) count++;
assert.equal(count, 3, 'History must remain bounded');
console.log('PASS: legacy presets, design validation, independent layouts, title validation, undo/redo, typing groups, branching, bounded history.');
