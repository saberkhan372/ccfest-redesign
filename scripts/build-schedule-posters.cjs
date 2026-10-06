/* Builds the schedule posters (a short one for the day at a glance, a longer one with every workshop)
 * from _data/event.yml, schedule.yml, keynotes.yml and sessions.yml, as HTML, PNG and tagged PDF.
 *
 *   NODE_PATH=$(npm root -g) node scripts/build-schedule-posters.cjs [outdir]     (default: schedule-posters/)
 *
 * Needs Playwright with Chrome and python3 with PyYAML (to read the YAML). Re-run it whenever the schedule,
 * keynotes or sessions change; nothing is typed in by hand. Host-owned: the designers' files are not touched.
 *   short  1080 x 1350 px (4:5, social)     PNG + PDF
 *   long   US Letter, 8.5 x 11 in           PNG at 300 ppi (2550 x 3300) + PDF
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'schedule-posters'));
fs.mkdirSync(out, { recursive: true });
const rel = file => path.relative(out, path.join(root, file)).split(path.sep).join('/');

const yaml = file => JSON.parse(execFileSync('python3', ['-c', 'import sys,json,yaml;print(json.dumps(yaml.safe_load(open(sys.argv[1])),default=str))', path.join(root, '_data', file)], { encoding: 'utf8' }));
const event = yaml('event.yml'), schedule = yaml('schedule.yml'), keynotes = yaml('keynotes.yml').keynotes, sessions = yaml('sessions.yml').sessions.filter(s => s.title);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- times: "9:30–10:30 am PT · 12:30–1:30 pm ET" (the first zone's clock, shifted for the others) ----
const zones = schedule.zones.slice(0, 2).map(z => ({ shift: (z.utc_offset - schedule.zones[0].utc_offset) * 60, name: (z.label.match(/\(([^)]+)\)/) || [, z.label])[1] }));
const mins = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const clock = total => { const t = ((total % 1440) + 1440) % 1440, h = Math.floor(t / 60), m = t % 60; return { h12: h % 12 || 12, m: String(m).padStart(2, '0'), ap: h < 12 ? 'am' : 'pm' }; };
const range = (start, end, shift) => { const a = clock(mins(start) + shift), b = clock(mins(end) + shift); return `${a.h12}:${a.m}${a.ap !== b.ap ? ` ${a.ap}` : ''}–${b.h12}:${b.m} ${b.ap}`; };
const when = item => zones.map(z => `${range(item.start, item.end, z.shift)} ${z.name}`).join(' · ');
const dateText = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${String(event.date).slice(0, 10)}T12:00:00Z`));
const year = String(event.date).slice(0, 4);

// ---- content ----
const people = s => (s.presenters || []).map(p => p.name).filter(Boolean);
const inBlock = id => sessions.filter(s => s.schedule_id === id);
const workshopsIn = id => inBlock(id).filter(s => s.format !== 'Panel');
const blocks = schedule.items.map(item => ({
  ...item,
  names: item.kind === 'keynote' ? keynotes.filter(k => k.schedule_id === item.id).map(k => k.name) : [],
  panel: item.kind === 'panel' ? inBlock(item.id) : [],
  workshops: item.kind === 'workshops' ? workshopsIn(item.id) : []
}));
const unscheduled = sessions.filter(s => s.format === 'Workshop' && !s.schedule_id);
const totalWorkshops = blocks.reduce((n, b) => n + b.workshops.length, 0) + unscheduled.length;
const roundCount = blocks.filter(b => b.kind === 'workshops').length;
const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'];
const pill = level => `<span class="tag ${{ Beginner: '', Intermediate: 'blue', Advanced: 'orange' }[level] ?? ''}">${esc(level)}</span>`;
const spanish = s => (s.language === 'Spanish' ? ' <span class="tag lime es" lang="es">En español</span>' : '');
const credits = 'Design: Francisca José Rodrigues · Interactives: Shristi Singh';

const css = () => `
@font-face { font-family: Anybody; src: url('${rel('assets/fonts/Anybody[wdth,wght].ttf')}'); font-weight: 100 900; font-stretch: 50% 150%; }
@font-face { font-family: Anybody; src: url('${rel('assets/fonts/Anybody-Italic[wdth,wght].ttf')}'); font-style: italic; font-weight: 100 900; font-stretch: 50% 150%; }
@font-face { font-family: 'Overpass Mono'; src: url('${rel('assets/fonts/OverpassMono[wght].ttf')}'); font-weight: 300 700; }
:root { --paper: #edede9; --ink: #1a1a1c; --orange: #ff4d2e; --blue: #2d5bff; --lime: #c8ff32; }
* { box-sizing: border-box; margin: 0; }
body { background: #888; font-family: Anybody, sans-serif; color: var(--ink); }
.page { background: var(--paper); position: relative; overflow: hidden; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; font-family: 'Overpass Mono', monospace; text-transform: uppercase; letter-spacing: .06em; }
.mono { font-family: 'Overpass Mono', monospace; }
h1 { font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: -.02em; }
.foot { margin-top: auto; border-top: 2px solid var(--ink); display: flex; justify-content: space-between; align-items: flex-end; }
.foot b { font-weight: 700; letter-spacing: -.01em; }
.foot .c, .foot .m { font-family: 'Overpass Mono', monospace; letter-spacing: .02em; }
.qr { display: block; background: #fff; flex: none; }
.tag { display: inline-block; font-family: 'Overpass Mono', monospace; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; border-radius: 99px; background: var(--ink); color: var(--paper); white-space: nowrap; }
.tag.blue { background: var(--blue); color: #fff; } .tag.orange { background: var(--orange); color: var(--ink); } .tag.lime { background: var(--lime); color: var(--ink); }
`;

// ---------------------------------------------------------------- short: 1080 x 1350
function shortPage() {
  const rows = blocks.map(b => {
    const second = b.kind === 'keynote' ? esc(b.names.join(' and '))
      : b.kind === 'panel' ? esc(b.panel.map(s => s.title).join(', '))
      : `${b.workshops.length} workshops at once`;
    return `<div class="row"><div class="w">${esc(when(b))}</div><div class="t">${esc(b.title)}</div><div class="s">${second}</div></div>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(event.name)}: the day at a glance</title>
<style>${css()}
@page { size: 1080px 1350px; margin: 0; }
.page { width: 1080px; height: 1350px; padding: 54px; }
.top { font-size: 17px; }
h1 { font-size: 90px; line-height: .98; margin: 32px 0 10px; }
.sub { font: 400 28px/1.3 Anybody; margin-bottom: 22px; max-width: 900px; }
.rows { border-top: 2px solid var(--ink); }
.row { padding: 17px 0 19px; border-bottom: 1.5px solid var(--ink); }
.row .w { font: 500 24px/1.3 'Overpass Mono', monospace; }
.row .t { font: 700 45px/1.1 Anybody; letter-spacing: -.01em; margin-top: 6px; }
.row .s { font: 400 27px/1.3 Anybody; margin-top: 4px; }
.row:last-child { border-bottom: 0; }
.foot { padding-top: 16px; }
.foot b { font-size: 36px; } .foot .m { font-size: 17px; margin-top: 6px; display: block; } .foot .c { font-size: 14px; margin-top: 10px; }
</style></head><body>
<main class="page" aria-label="The day at a glance">
  <div class="top"><span>Virtual / ${esc(year)}</span><span>${totalWorkshops} workshops · ${roundCount} rounds</span></div>
  <h1>The day</h1>
  <p class="sub">${esc(dateText)}. ${words[roundCount] || roundCount} rounds of workshops, a panel and two keynotes. Drop in and out as you like.</p>
  <div class="rows">
${rows}
  </div>
  <div class="foot"><div><b>ccfest.rocks/register/</b><span class="m">Free · Online · All levels · Times in Pacific, then Eastern</span><div class="c">${esc(credits)}</div></div><img class="qr" src="${rel('assets/poster-maker/register-qr.svg')}" width="128" height="128" alt="QR code: ccfest.rocks/register"></div>
</main></body></html>`;
}

// ---------------------------------------------------------------- long: US Letter (816 x 1056 CSS px)
function longPage() {
  const workshop = s => `<li><b>${esc(s.title)}${spanish(s)}</b><span>${esc(people(s).join(', '))} ${pill(s.level)}</span></li>`;
  const body = blocks.map(b => {
    const head = `<div class="bh"><h2>${esc(b.title)}</h2><span class="mono">${esc(when(b))}</span></div>`;
    if (b.kind === 'keynote') return `<section class="blk">${head}<p class="who">${esc(b.names.join(' and '))}</p></section>`;
    if (b.kind === 'panel') return `<section class="blk">${head}${b.panel.map(s => `<p class="who">${esc(s.title)}</p><p class="with">${esc(people(s).join(', '))}</p>`).join('')}</section>`;
    return `<section class="blk">${head}<ul class="ws">${b.workshops.map(workshop).join('')}</ul></section>`;
  }).join('\n');
  const pending = unscheduled.length ? `<section class="blk"><div class="bh"><h2>Round to be announced</h2></div><ul class="ws">${unscheduled.map(workshop).join('')}</ul></section>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(event.name)}: the full schedule</title>
<style>${css()}
@page { size: 8.5in 11in; margin: 0; }
.page { width: 816px; height: 1056px; padding: 34px 44px 28px; }
.top { font-size: 11px; }
h1 { font-size: 54px; line-height: 1; margin: 12px 0 6px; }
.sub { font: 400 15px/1.35 Anybody; }
.tools { font: 400 10.5px/1.4 'Overpass Mono', monospace; margin: 3px 0 8px; }
.blk { border-top: 1.5px solid var(--ink); padding: 10px 0 11px; }
.bh { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.bh h2 { font: 800 19px/1.15 Anybody; letter-spacing: -.01em; }
.bh .mono { font-size: 11.5px; }
.who { font: 600 15px/1.3 Anybody; margin-top: 3px; }
.with { font: 400 12px/1.35 'Overpass Mono', monospace; margin-top: 2px; }
.ws { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 28px; margin-top: 8px; }
.ws li b { display: block; font: 700 14px/1.18 Anybody; letter-spacing: -.005em; }
.ws li > span { display: block; font: 400 11px/1.6 'Overpass Mono', monospace; margin-top: 2px; }
.tag { font-size: 8.5px; padding: 1px 8px; margin-left: 5px; vertical-align: 1px; letter-spacing: .05em; } .tag.es { font-size: 8.5px; margin-left: 6px; }
.foot { padding-top: 10px; }
.foot b { font-size: 26px; } .foot .m { font-size: 10.5px; display: block; margin-top: 3px; } .foot .c { font-size: 9.5px; margin-top: 6px; }
</style></head><body>
<main class="page" aria-label="The full schedule">
  <div class="top"><span>Virtual / ${esc(year)}</span><span>${esc(dateText)}</span></div>
  <h1>The schedule</h1>
  <p class="sub">${totalWorkshops} workshops in ${roundCount} rounds, a panel and two keynotes. Pick one workshop in each round, or drop in and out as you like.</p>
  <p class="tools">Free · Online · All levels · Times in Pacific, then Eastern</p>
${body}
${pending}
  <div class="foot"><div><b>ccfest.rocks/register/</b><span class="m">Register free. Your Zoom invitation arrives the day before.</span><div class="c">${esc(credits)}</div></div><img class="qr" src="${rel('assets/poster-maker/register-qr.svg')}" width="66" height="66" alt="QR code: ccfest.rocks/register"></div>
</main></body></html>`;
}

(async () => {
  const outputs = [
    { name: 'short', html: shortPage(), width: 1080, height: 1350, scale: 1, pdf: { width: '1080px', height: '1350px' } },
    { name: 'long', html: longPage(), width: 816, height: 1056, scale: 3.125, pdf: { width: '8.5in', height: '11in' } }
  ];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const o of outputs) {
      const base = `ccfest-${year}-schedule-${o.name}`;
      fs.writeFileSync(path.join(out, `${base}.html`), o.html);
      const page = await browser.newPage({ viewport: { width: o.width, height: o.height }, deviceScaleFactor: o.scale });
      await page.goto(`file://${path.join(out, `${base}.html`)}`);
      await page.evaluate(() => document.fonts.ready);
      const fits = await page.evaluate(() => { const p = document.querySelector('.page'); const last = p.lastElementChild.getBoundingClientRect(); return { overflow: p.scrollHeight > p.clientHeight + 1, bottom: Math.round(last.bottom), height: p.clientHeight }; });
      if (fits.overflow) throw new Error(`${o.name}: the content is taller than the page (${JSON.stringify(fits)}). Shorten it or lower the type sizes.`);
      await page.screenshot({ path: path.join(out, `${base}.png`) });
      await page.pdf({ path: path.join(out, `${base}.pdf`), ...o.pdf, printBackground: true, tagged: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      console.log(`${base}: ${o.name} page built (${fits.bottom} of ${fits.height} px used)`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
