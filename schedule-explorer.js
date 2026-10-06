/* Host integration: filters, sorting, "My schedule" and calendar export for the event page schedule.
   The page is complete without this: every block and session is in the HTML. This only adds controls.
   Sorting and filtering work inside a round, so the day stays in order. Preferences are kept in this browser
   only: per workshop "first choice" and "second choice" (one of each per round) or "maybe" (any number). */
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

  const levelSel = $('.schedule-level'), langSel = $('.schedule-language'), sortSel = $('.schedule-sort');
  const clearBtn = $('.schedule-clear'), mineBtn = $('.schedule-mine-toggle'), status = $('.schedule-status');
  const minePanel = $('.schedule-mine'), mineList = $('.schedule-mine-list'), mineHint = $('.schedule-mine-hint'), icsBtn = $('.schedule-ics');

  let mineOnly = false;
  let prefs = {};   // session id -> 'first' | 'second' | 'maybe'
  const pref = c => prefs[c.dataset.id] || '';
  const holder = (blockId, value) => workshops.find(c => c.dataset.block === blockId && pref(c) === value);
  const firstFor = blockId => holder(blockId, 'first');

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  const levelRank = c => { const i = LEVELS.indexOf(c.dataset.level); return i < 0 ? LEVELS.length : i; };
  const lastName = c => (c.dataset.presenters.split(',')[0] || '').trim().split(/\s+/).pop().toLowerCase();
  const text = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
  const sorters = {
    order: (a, b) => a.dataset.order - b.dataset.order,
    title: (a, b) => text(a.dataset.title, b.dataset.title) || a.dataset.order - b.dataset.order,
    presenter: (a, b) => text(lastName(a), lastName(b)) || a.dataset.order - b.dataset.order,
    level: (a, b) => levelRank(a) - levelRank(b) || text(a.dataset.title, b.dataset.title)
  };

  // Level and language choices come from what is on the page, so new workshops need no code change.
  const fill = (select, values) => { for (const v of values) select.add(new Option(v, v)); };
  fill(levelSel, LEVELS.filter(l => workshops.some(c => c.dataset.level === l)));
  fill(langSel, [...new Set(workshops.map(c => c.dataset.language).filter(Boolean))].sort(text));

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

  // ---- filtering, sorting, status -------------------------------------------------------------
  function apply() {
    const level = levelSel.value, lang = langSel.value;
    let shown = 0;
    for (const card of workshops) {
      const liked = Boolean(pref(card));
      const ok = (!level || card.dataset.level === level) && (!lang || card.dataset.language === lang) && (!mineOnly || liked);
      card.hidden = !ok;
      if (ok) shown++;
    }
    for (const grid of grids) {
      const empty = $('.schedule-empty', grid);
      if (!empty) continue;
      const any = [...grid.querySelectorAll('.session-card')].some(c => !c.hidden);
      empty.hidden = any;
      empty.textContent = mineOnly ? 'Nothing chosen for this round yet.' : 'No workshops match. Try clearing a filter.';
    }
    const pending = $('.schedule-pending');
    if (pending) pending.hidden = ![...pending.querySelectorAll('.session-card')].some(c => !c.hidden);
    const filtered = level || lang;
    status.textContent = mineOnly ? `Showing your first choices, second choices and maybes: ${shown} workshops.` : filtered ? `${shown} of ${workshops.length} workshops shown.` : '';
    clearBtn.hidden = !filtered;
    box.classList.toggle('is-filtering', Boolean(filtered));
  }

  function sort() {
    const cmp = sorters[sortSel.value] || sorters.order;
    for (const grid of grids) {
      const empty = $('.schedule-empty', grid);
      for (const card of [...grid.querySelectorAll('.session-card')].sort(cmp)) grid.insertBefore(card, empty);
    }
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
    sort();
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
  icsBtn.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([ics()], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'ccfest-2026-my-schedule.ics';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---- wiring ---------------------------------------------------------------------------------
  levelSel.addEventListener('change', apply);
  langSel.addEventListener('change', apply);
  sortSel.addEventListener('change', sort);
  clearBtn.addEventListener('click', () => { levelSel.value = ''; langSel.value = ''; apply(); levelSel.focus(); });
  mineBtn.addEventListener('click', () => { mineOnly = !mineOnly; refreshPrefs(); });

  loadPrefs();
  refreshPrefs();
  box.dataset.ready = 'true';
})();
