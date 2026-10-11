/* Checks for scripts/update-registration-garden.cjs: per-day counts in the event's time zone, donors, approved-only CSV
   rows, and that nothing personal reaches the output. Run before every update (see .github/workflows/registration-garden.yml). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {summarize, parseCSV, fromCSV, fromAPI, dayOf} = require('./update-registration-garden.cjs');

// 06:30 UTC on Oct 9 is still Oct 8 in Pacific time.
assert.equal(dayOf('2026-10-09T06:30:00Z'), '2026-10-08');
const s = summarize([
  {registered_at: '2026-10-09T06:30:00Z', donor: false},
  {registered_at: '2026-10-08T17:00:00Z', donor: true},
  {registered_at: '2026-10-10T20:00:00Z', donor: false},
  {registered_at: null, donor: true},
  {registered_at: 'not a date', donor: false}
]);
assert.deepEqual(s.days, [{date: '2026-10-08', count: 2, donors: 1}, {date: '2026-10-10', count: 1, donors: 0}]);
assert.equal(s.total, 3); assert.equal(s.donors, 1);

assert.deepEqual(parseCSV('a,"b, c","d ""e"""\r\n1,2,3\n'), [['a', 'b, c', 'd "e"'], ['1', '2', '3']]);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'garden-'));
try {
  const file = path.join(tmp, 'guests.csv');
  fs.writeFileSync(file, '﻿guest_id,name,email,created_at,approval_status,amount\n' +
    'gst-1,Ada,ada@example.com,2026-10-08T17:00:00.000Z,approved,$10.00\n' +
    'gst-2,"Hopper, Grace",grace@example.com,2026-10-09T06:30:00.000Z,approved,$0.00\n' +
    'gst-3,Wait,wait@example.com,2026-10-09T18:00:00.000Z,waitlist,$0.00\n');
  const out = summarize(fromCSV(file));
  assert.deepEqual(out.days, [{date: '2026-10-08', count: 2, donors: 1}]);
  assert(!/example\.com|Ada|Grace|gst-|10\.00/.test(JSON.stringify(out)), 'no personal data or amounts in the summary');
} finally { fs.rmSync(tmp, {recursive: true, force: true}); }
// Luma's list endpoint, faked: two pages, the key in the header, approved guests only, donors from ticket amounts.
(async () => {
  const seen = [], realFetch = global.fetch;
  const pages = [
    {entries: [{registered_at: '2026-10-08T17:00:00Z', user_email: 'a@example.com', event_tickets: [{amount: 1000}]}], has_more: true, next_cursor: 'c2'},
    {entries: [{registered_at: '2026-10-09T06:30:00Z', user_email: 'b@example.com', event_tickets: [{amount: 0}]}], has_more: false}
  ];
  global.fetch = async (url, options) => { seen.push({url: String(url), key: options.headers['x-luma-api-key']}); return {ok: true, json: async () => pages[seen.length - 1]}; };
  try {
    const out = summarize(await fromAPI('test-key'));
    assert.equal(seen.length, 2);
    assert(seen.every(r => r.key === 'test-key' && r.url.startsWith('https://public-api.luma.com/v1/events/guests/list?') && r.url.includes('approval_status=approved') && r.url.includes('event_id=evt-')));
    assert(seen[1].url.includes('pagination_cursor=c2'));
    assert.deepEqual(out.days, [{date: '2026-10-08', count: 2, donors: 1}]);
    assert(!JSON.stringify(out).includes('example.com'));
    global.fetch = async () => ({ok: false, status: 401, text: async () => 'unauthorized'});
    await assert.rejects(fromAPI('bad'), /Luma API 401/);
  } finally { global.fetch = realFetch; }
  console.log('PASS registration garden: Pacific days, donors, approved-only export rows, CSV quoting, Luma API paging and errors, no personal data.');
})().catch(error => { console.error(error); process.exitCode = 1; });
