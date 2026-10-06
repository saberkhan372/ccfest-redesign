/* Host integration: per-round preferences, "My choices" and calendar export for the event page schedule.
   The page is complete without this: every block and session is in the HTML. This only adds controls.
   Preferences are kept in this browser only: per workshop "first choice" and "second choice" (one of each per round) or "maybe" (any number). */
(() => {
  const box = document.querySelector('.schedule[data-date]');
  if (!box) return;
  const $ = (sel, root = box) => root.querySelector(sel);
  const KEY = 'ccfest-schedule-prefs';
  const [y, mo, d] = box.dataset.date.split('-').map(Number);
  const offset = Number(box.dataset.utcOffset);

  const workshops = [...box.querySelectorAll('.session-card[data-format="Workshop"]')];
  const grids = [...box.querySelectorAll('.session-grid')];
  const blocks = [...box.querySelectorAll('.schedule-block[data-start]')];
  const byId = Object.fromEntries(workshops.map(c => [c.dataset.id, c]));

  const mineBtn = $('.schedule-mine-toggle'), status = $('.schedule-status');
  const minePanel = $('.schedule-mine'), mineList = $('.schedule-mine-list'), mineHint = $('.schedule-mine-hint'), icsBtn = $('.schedule-ics'), pdfBtn = $('.schedule-pdf'), pngBtn = $('.schedule-png');

  let mineOnly = false;
  let prefs = {};   // session id -> 'first' | 'second' | 'maybe'
  const pref = c => prefs[c.dataset.id] || '';
  const holder = (blockId, value) => workshops.find(c => c.dataset.block === blockId && pref(c) === value);
  const firstFor = blockId => holder(blockId, 'first');

  function loadPrefs() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { /* blocked or damaged */ }
    prefs = {};
    const seen = new Set();
    for (const [id, value] of Object.entries(raw)) {
      const card = byId[id];
      // Drop sessions that were removed or have no round, and keep at most one first and one second choice per round.
      if (!card || !card.dataset.block || !['first', 'second', 'maybe'].includes(value)) continue;
      if (value !== 'maybe') { const key = `${card.dataset.block}:${value}`; if (seen.has(key)) continue; seen.add(key); }
      prefs[id] = value;
    }
  }
  function savePrefs() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* storage blocked: preferences last for this visit */ } }

  const rounds = blocks.filter(b => b.dataset.kind === 'workshops');
  const blockTitle = id => (document.getElementById(id)?.querySelector('h3')?.textContent || id).trim();

  // ---- "My choices" view and status -------------------------------------------------------------
  function apply() {
    let shown = 0;
    for (const card of workshops) {
      card.hidden = mineOnly && !pref(card);
      if (!card.hidden) shown++;
    }
    for (const grid of grids) {
      const empty = $('.schedule-empty', grid);
      if (!empty) continue;
      empty.hidden = [...grid.querySelectorAll('.session-card')].some(c => !c.hidden);
      empty.textContent = 'Nothing chosen for this round yet.';
    }
    const pending = $('.schedule-pending');
    if (pending) pending.hidden = ![...pending.querySelectorAll('.session-card')].some(c => !c.hidden);
    status.textContent = mineOnly ? `Showing your first choices, second choices and maybes: ${shown} workshops.` : '';
  }

  // ---- preferences ------------------------------------------------------------------------------
  const CHOICES = [['first', 'First choice'], ['second', 'Second choice'], ['maybe', 'Maybe']];
  for (const card of workshops) {
    if (!card.dataset.block) continue;   // no round yet, nothing to rank
    const group = document.createElement('div');
    group.className = 'session-pref';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `Your preference for ${card.dataset.title}`);
    for (const [value, label] of CHOICES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.pref = value;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        const { id, title, block } = card.dataset;
        if (pref(card) === value) delete prefs[id];
        else {
          const old = value !== 'maybe' && holder(block, value);
          if (old) prefs[old.dataset.id] = 'maybe';   // whoever held that place drops to maybe, never lost
          prefs[id] = value;
        }
        savePrefs();
        refreshPrefs();
        const now = pref(card);
        status.textContent = now ? `${title}: ${CHOICES.find(c => c[0] === now)[1].toLowerCase()}.` : `${title}: preference cleared.`;
      });
      group.append(btn);
    }
    card.append(group);
  }

  function refreshPrefs() {
    for (const card of workshops) {
      const v = pref(card);
      card.classList.toggle('is-first', v === 'first');
      card.classList.toggle('is-second', v === 'second');
      card.classList.toggle('is-maybe', v === 'maybe');
      for (const btn of card.querySelectorAll('.session-pref button')) btn.setAttribute('aria-pressed', String(btn.dataset.pref === v));
    }
    const n = workshops.filter(c => pref(c)).length;
    mineBtn.textContent = mineOnly ? 'Show all workshops' : n ? `Show only my choices (${n})` : 'Show only my choices';
    mineBtn.setAttribute('aria-pressed', String(mineOnly));
    const any = Object.keys(prefs).length > 0;
    minePanel.hidden = !any && !mineOnly;
    mineHint.hidden = any;
    icsBtn.disabled = !rounds.some(r => firstFor(r.id));
    pdfBtn.disabled = pngBtn.disabled = !any;
    mineList.replaceChildren(...rounds.map(round => {
      const li = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = `${blockTitle(round.id)}: `;
      li.append(label);
      const first = firstFor(round.id);
      if (first) {
        li.append(`${first.dataset.title} `);
        const a = document.createElement('a');
        a.href = googleUrl(eventFor(round, first));
        a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Add to Google Calendar ↗';
        li.append(a);
      } else li.append('no first choice yet');
      for (const [value, label] of [['second', 'Second choice'], ['maybe', 'Maybe']]) {
        const names = workshops.filter(c => c.dataset.block === round.id && pref(c) === value).map(c => c.dataset.title);
        if (!names.length) continue;
        const sub = document.createElement('span');
        sub.className = 'schedule-mine-maybe';
        sub.textContent = `${label}: ${names.join('; ')}`;
        li.append(sub);
      }
      return li;
    }));
    apply();
  }

  // ---- calendar -------------------------------------------------------------------------------
  const instant = hhmm => { const [h, m] = hhmm.split(':').map(Number); return new Date(Date.UTC(y, mo - 1, d, h - offset, m)); };
  const stamp = date => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const eventName = box.dataset.eventName || 'CC Fest';
  const pageUrl = box.dataset.pageUrl || location.href.split('#')[0];

  function eventFor(block, card) {
    const workshop = Boolean(card);
    return {
      uid: `${workshop ? card.dataset.id : block.id}@ccfest.rocks`,
      start: instant(block.dataset.start), end: instant(block.dataset.end),
      summary: `${eventName}: ${workshop ? card.dataset.title : block.dataset.summary}`,
      description: `${workshop ? `With ${card.dataset.presenters}. ` : ''}Online on Zoom Events. Registration and joining details: ${pageUrl}`,
      location: 'Online (Zoom Events)'
    };
  }
  function googleUrl(ev) {
    const p = new URLSearchParams({ action: 'TEMPLATE', text: ev.summary, dates: `${stamp(ev.start)}/${stamp(ev.end)}`, details: ev.description, location: ev.location });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  const esc = s => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  function fold(line) {   // RFC 5545: at most 75 octets a line, continuation lines start with a space
    const enc = new TextEncoder(); const out = []; let cur = '', len = 0;
    for (const ch of line) {
      const n = enc.encode(ch).length;
      if (len + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; len = 0; }
      cur += ch; len += n;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  function ics() {
    const now = stamp(new Date());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CC Fest//Schedule//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (const block of blocks) {
      const kind = block.dataset.kind;
      const card = kind === 'workshops' ? firstFor(block.id) : null;
      if (kind === 'workshops' && !card) continue;
      const ev = eventFor(block, card);
      lines.push('BEGIN:VEVENT', `UID:${ev.uid}`, `DTSTAMP:${now}`, `DTSTART:${stamp(ev.start)}`, `DTEND:${stamp(ev.end)}`,
        `SUMMARY:${esc(ev.summary)}`, `DESCRIPTION:${esc(ev.description)}`, `LOCATION:${esc(ev.location)}`, `URL:${pageUrl}`, 'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function save(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  icsBtn.addEventListener('click', () => save(new Blob([ics()], { type: 'text/calendar;charset=utf-8' }), 'ccfest-2026-my-schedule.ics'));

  // ---- printable copy: the same layout drawn to a PNG or written as a PDF (Letter, Helvetica text) --------
  const PAGE = { w: 612, h: 792, m: 54 };
  const INK = [0.09, 0.09, 0.1], MUTED = [0.38, 0.38, 0.37], ACCENT = [0.176, 0.357, 1], RULE = [0.77, 0.77, 0.75];
  let measureCtx;
  const fontOf = (size, bold) => `${bold ? 'bold ' : ''}${size}px Arial, Helvetica, sans-serif`;   // Arial and Helvetica share metrics
  const measure = (str, size, bold) => { measureCtx ||= document.createElement('canvas').getContext('2d'); measureCtx.font = fontOf(size, bold); return measureCtx.measureText(str).width; };
  function wrap(str, size, bold, width) {
    const lines = []; let cur = '';
    for (const word of str.split(/\s+/)) {
      const next = cur ? `${cur} ${word}` : word;
      if (cur && measure(next, size, bold) > width) { lines.push(cur); cur = word; } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  const timeOf = block => {
    const el = [block.querySelector('.schedule-local'), block.querySelector('.schedule-times span')].find(e => e && e.textContent.trim());
    return { range: el.firstChild.textContent.trim(), zone: (el.querySelector('small') || {}).textContent || '' };
  };
  function entries() {
    const out = [];
    const add = (text, size, o = {}) => out.push({ text, size, bold: false, color: INK, indent: 0, before: 0, ...o });
    const day = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(Date.UTC(y, mo - 1, d, 12)));
    add('My schedule', 26, { bold: true });
    add(`${eventName} · ${day}`, 12, { before: 4 });
    add(`Times shown in ${timeOf(blocks[0]).zone}`, 10, { color: MUTED, before: 2 });
    for (const block of blocks) {
      const { range } = timeOf(block);
      out.push({ rule: true, before: 14 });
      add(range, 10, { bold: true, color: ACCENT, before: 8 });
      add(block.querySelector('h3').textContent.trim(), 14, { bold: true, before: 2 });
      if (block.dataset.kind === 'workshops') {
        let any = false;
        for (const [value, label] of [['first', 'First choice'], ['second', 'Second choice'], ['maybe', 'Maybe']]) {
          for (const card of workshops.filter(c => c.dataset.block === block.id && pref(c) === value)) {
            any = true;
            add(`${label}: ${card.dataset.title}`, 11, { bold: value === 'first', before: 6 });
            add([card.dataset.presenters, card.dataset.level].filter(Boolean).join(' · '), 9.5, { color: MUTED, indent: 12 });
          }
        }
        if (!any) add('No choice yet.', 11, { color: MUTED, before: 6 });
      } else {
        const people = block.dataset.summary.split(' — ')[1];
        if (people) add(people, 11, { before: 4 });
        const card = block.querySelector('.session-card');
        if (card) add(card.dataset.presenters, 10, { color: MUTED, before: 2 });
      }
    }
    out.push({ rule: true, before: 18 });
    add(`ccfest.rocks/register/ · saved ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. The schedule can change: check the page for updates.`, 9, { color: MUTED, before: 8 });
    return out;
  }
  // Positions every line; pageHeight Infinity gives one tall page (for the PNG).
  function layout(pageHeight) {
    const width = PAGE.w - PAGE.m * 2;
    const pages = [{ ops: [] }]; let top = PAGE.m;
    const room = h => top + h > pageHeight - PAGE.m;
    const fresh = () => { pages.push({ ops: [] }); top = PAGE.m; };
    for (const e of entries()) {
      top += e.before;
      if (e.rule) { if (room(1)) fresh(); pages.at(-1).ops.push({ rule: true, x: PAGE.m, y: top, w: width }); top += 1; continue; }
      const lh = e.size * 1.35;
      for (const line of wrap(e.text, e.size, e.bold, width - e.indent)) {
        if (room(lh)) fresh();
        pages.at(-1).ops.push({ text: line, x: PAGE.m + e.indent, y: top + e.size, size: e.size, bold: e.bold, color: e.color });
        top += lh;
      }
    }
    return { pages, height: top + PAGE.m };
  }
  const rgb = c => `rgb(${c.map(v => Math.round(v * 255)).join(',')})`;
  function png() {
    const { pages, height } = layout(Infinity);
    const scale = 2, canvas = document.createElement('canvas');
    canvas.width = PAGE.w * scale; canvas.height = Math.ceil(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale); ctx.textBaseline = 'alphabetic';
    for (const op of pages[0].ops) {
      if (op.rule) { ctx.fillStyle = rgb(RULE); ctx.fillRect(op.x, op.y, op.w, 1); continue; }
      ctx.font = fontOf(op.size, op.bold); ctx.fillStyle = rgb(op.color); ctx.fillText(op.text, op.x, op.y);
    }
    return new Promise(done => canvas.toBlob(done, 'image/png'));
  }
  const CP1252 = { '–': 0x96, '—': 0x97, '’': 0x92, '‘': 0x91, '“': 0x93, '”': 0x94, '•': 0x95, '…': 0x85 };
  function winAnsi(str) {   // PDF text uses the standard Helvetica font: keep what it has, drop accents it lacks
    let out = '';
    for (const ch of str.normalize('NFC')) {
      const code = ch.codePointAt(0);
      if (CP1252[ch]) out += String.fromCharCode(CP1252[ch]);
      else if (code <= 0x7e || (code >= 0xa0 && code <= 0xff)) out += ch;
      else { const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); out += base.length === 1 && base.charCodeAt(0) <= 0x7e ? base : '?'; }
    }
    return out.replace(/[\\()]/g, m => `\\${m}`);
  }
  function pdf() {
    const { pages } = layout(PAGE.h);
    const n = v => String(Math.round(v * 100) / 100);
    const objs = [];
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach((page, i) => {
      const stream = page.ops.map(op => op.rule
        ? `${RULE.map(n).join(' ')} rg ${n(op.x)} ${n(PAGE.h - op.y - 1)} ${n(op.w)} 1 re f`
        : `BT /F${op.bold ? 2 : 1} ${n(op.size)} Tf ${op.color.map(n).join(' ')} rg ${n(op.x)} ${n(PAGE.h - op.y)} Td (${winAnsi(op.text)}) Tj ET`).join('\n');
      objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.w} ${PAGE.h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`;
      objs[6 + i * 2] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });
    const info = objs.length;
    objs[info] = `<< /Title (${winAnsi(`My schedule - ${eventName}`)}) /Producer (ccfest.rocks) >>`;
    let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
    const offsets = [];
    for (let i = 1; i < objs.length; i++) { offsets[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
    const xref = out.length;
    out += `xref\n0 ${objs.length}\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new Blob([Uint8Array.from(out, ch => ch.charCodeAt(0))], { type: 'application/pdf' });
  }
  pdfBtn.addEventListener('click', () => save(pdf(), 'ccfest-2026-my-schedule.pdf'));
  pngBtn.addEventListener('click', async () => save(await png(), 'ccfest-2026-my-schedule.png'));

  // ---- wiring ---------------------------------------------------------------------------------
  mineBtn.addEventListener('click', () => { mineOnly = !mineOnly; refreshPrefs(); });

  loadPrefs();
  refreshPrefs();
  box.dataset.ready = 'true';
})();
