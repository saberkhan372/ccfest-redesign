/* Counts Luma registrations per day for the register page's registration garden (_data/registration_garden.json).
   Only counts leave this script: no names, emails or amounts. A guest who paid anything counts as a donor.
   Usage:
     LUMA_API_KEY=… node scripts/update-registration-garden.cjs     (GitHub Actions; needs Luma Plus)
     node scripts/update-registration-garden.cjs --from-csv FILE     (a Luma guest export, for backfill or by hand)
   Writes the file only when a count changed. Without a key, or after the event day, it exits quietly. */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const OUT = path.join(root, '_data', 'registration_garden.json');
const API = 'https://public-api.luma.com/v1/events/guests/list';

const field = (file, key) => ((fs.readFileSync(path.join(root, file), 'utf8').match(new RegExp('^\\s*-?\\s*' + key + ':\\s*(.+)$', 'm')) || [])[1] || '').trim().replace(/^['"]|['"]$/g, '');
const eventId = field('_data/event.yml', 'luma_event_id');
const eventDate = field('_data/event.yml', 'date');
const timeZone = field('_data/schedule.yml', 'timezone') || 'America/Los_Angeles';
const dayOf = when => new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(when));

// Guests are {registered_at, donor}; anything else is dropped here.
function summarize(guests) {
  const days = new Map();
  for (const g of guests) {
    if (!g.registered_at || Number.isNaN(Date.parse(g.registered_at))) continue;
    const day = dayOf(g.registered_at), entry = days.get(day) || {date: day, count: 0, donors: 0};
    entry.count++; if (g.donor) entry.donors++;
    days.set(day, entry);
  }
  const list = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  return {time_zone: timeZone, event_date: eventDate, total: list.reduce((n, d) => n + d.count, 0), donors: list.reduce((n, d) => n + d.donors, 0), days: list};
}

function parseCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim()));
}

function fromCSV(file) {
  const [header, ...rows] = parseCSV(fs.readFileSync(file, 'utf8'));
  const at = name => header.findIndex(h => h.trim().toLowerCase() === name);
  const [created, status, amount] = ['created_at', 'approval_status', 'amount'].map(at);
  if (created < 0 || status < 0) throw new Error('Not a Luma guest export: needs created_at and approval_status columns.');
  return rows.filter(r => r[status].trim() === 'approved').map(r => ({registered_at: r[created], donor: amount >= 0 && parseFloat(r[amount].replace(/[^0-9.]/g, '')) > 0}));
}

async function fromAPI(key) {
  const guests = []; let cursor;
  do {
    const url = new URL(API);
    url.search = new URLSearchParams({event_id: eventId, approval_status: 'approved', pagination_limit: '100', ...(cursor ? {pagination_cursor: cursor} : {})});
    const res = await fetch(url, {headers: {'x-luma-api-key': key, accept: 'application/json'}});
    if (!res.ok) throw new Error('Luma API ' + res.status + ': ' + (await res.text()).slice(0, 200));
    const page = await res.json();
    for (const g of page.entries || []) guests.push({registered_at: g.registered_at, donor: (g.event_tickets || []).some(t => Number(t.amount) > 0)});
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return guests;
}

function write(summary, source) {
  const before = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
  const counts = s => s && JSON.stringify([s.time_zone, s.event_date, s.total, s.donors, s.days]);
  const same = counts(before) === counts(summary);
  console.log(summary.total + ' registrations, ' + summary.donors + ' with a donation, over ' + summary.days.length + ' days (' + source + ').');
  if (same) return console.log('No change; ' + path.relative(root, OUT) + ' left as is.');
  fs.writeFileSync(OUT, JSON.stringify({updated_at: new Date().toISOString(), source, ...summary}, null, 2) + '\n');
  console.log('Wrote ' + path.relative(root, OUT) + '.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--from-csv') { if (!args[1]) throw new Error('Usage: --from-csv FILE'); return write(summarize(fromCSV(args[1])), 'luma-export'); }
  if (dayOf(Date.now()) > eventDate) return console.log('The event day (' + eventDate + ') has passed; nothing to update.');
  const key = process.env.LUMA_API_KEY;
  if (!key) return console.log('LUMA_API_KEY is not set; nothing to update.');
  if (!/^evt-/.test(eventId)) throw new Error('No luma_event_id in _data/event.yml.');
  write(summarize(await fromAPI(key)), 'luma-api');
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = {summarize, parseCSV, fromCSV, fromAPI, dayOf};
