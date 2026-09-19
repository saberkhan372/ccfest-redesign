/* Host-owned editor for the CC Fest poster maker. Artwork comes from Shristi's homepage
 * interactive via poster-stage.js; layout is poster-art.js. */
(async function () {
  'use strict';
  const A = window.CCPosterArt;
  const Stage = window.CCStageCapture;
  const $ = id => document.getElementById(id);
  const status = $('maker-status');
  status.hidden = false;
  const form = $('maker-controls');
  const storageKey = 'ccfest-poster-v2';
  const preview = $('maker-canvas').querySelector('canvas');
  const buttons = [$('maker-download'), $('maker-print')];
  const art = new Map(); // `${mode}|${hover}` → captured frame
  const pending = new Set();
  let state, content, assets, busy = false, capturing = 0, timer, seed = 1;
  const setStatus = message => { status.textContent = message; };
  const artKey = value => `${value.mode}|${value.hover}`;
  const canExport = () => !busy && !capturing && $('maker-error').hidden && art.has(artKey(state || {}));
  const syncButtons = () => {
    buttons.forEach(button => { button.disabled = !canExport(); });
    $('maker-recapture').disabled = busy || capturing > 0;
  };

  function showError(message) {
    $('maker-error').textContent = message;
    $('maker-error').hidden = !message;
    syncButtons();
  }
  function readForm() {
    const value = { version: A.VERSION };
    for (const key of Object.keys(A.DEFAULTS).filter(key => key !== 'version')) {
      const input = form.elements.namedItem(key);
      value[key] = input.type === 'checkbox' ? input.checked : key === 'feature' ? Number(input.value) : input.value;
    }
    return A.validate(value);
  }
  function fillForm(value) {
    for (const key of Object.keys(A.DEFAULTS).filter(key => key !== 'version')) {
      const input = form.elements.namedItem(key);
      if (input.type === 'checkbox') input.checked = value[key]; else input.value = value[key];
    }
    syncFeatureField(value.template, value.feature);
  }
  function image(url, optional = false) {
    return new Promise((resolve, reject) => {
      const item = new Image();
      item.onload = () => resolve(item);
      item.onerror = () => (optional ? resolve(null) : reject(new Error('A required image could not load. Reload the page to try again.')));
      item.src = url;
    });
  }
  // Markdown links and emphasis in bios become plain text.
  const plain = text => String(text || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();

  async function eventContent() {
    const data = $('maker-data').dataset;
    const home = new URL(data.home || '../', location.href);
    const event = JSON.parse(data.event);
    const schedule = JSON.parse(data.schedule) || {};
    const keynotes = JSON.parse(data.keynotes) || [];
    const sessions = JSON.parse(data.sessions) || [];
    const credits = JSON.parse(data.credits) || [];
    const date = new Date(`${String(event.date).slice(0, 10)}T12:00:00Z`);
    if (!Number.isFinite(date.getTime())) throw new Error('The event needs a confirmed date before posters can be exported.');
    const time = minutes => {
      const normalized = ((minutes % 1440) + 1440) % 1440;
      const hour = Math.floor(normalized / 60);
      return `${hour % 12 || 12}:${String(normalized % 60).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
    };
    const toMinutes = str => { const [hour, minute] = str.split(':').map(Number); return hour * 60 + minute; };
    const items = schedule.items || [];
    const zones = schedule.zones || [];
    const times = items.length && zones.length ? zones.slice(0, 2).map(zone => {
      const shift = (Number(zone.utc_offset) - Number(zones[0].utc_offset)) * 60;
      const start = toMinutes(items[0].start) + shift;
      const end = toMinutes(items[items.length - 1].end) + shift;
      const label = zone.label.match(/\(([^)]+)\)/)?.[1] || zone.label;
      return `${time(start)}–${time(end)} ${label}${Math.floor(start / 1440) !== 0 ? ' (date varies)' : ''}`;
    }) : [];
    const photo = path => (path ? image(new URL(String(path).replace(/^\//, ''), home).href, true) : Promise.resolve(null));
    const person = async p => ({ name: plain(p.name), pronouns: plain(p.pronouns), bio: plain(p.bio), image: await photo(p.photo) });
    const dateText = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    return {
      home: home.href, name: event.name, date: dateText, year: String(date.getUTCFullYear()), cost: event.cost || '',
      edition: String(event.eyebrow || '').split('·')[0].trim().toUpperCase(),
      facts: [event.cost, event.format === 'Virtual' ? 'Online' : event.format, event.level].filter(Boolean).join(' · '),
      times, site: 'ccfest.rocks/register/', url: 'https://ccfest.rocks/register/',
      credits: credits.map(c => `${c.role}: ${c.name}`).join(' · '),
      keynotes: await Promise.all(keynotes.filter(k => k.name).map(async k => ({ ...(await person(k)), label: plain(k.label) }))),
      sessions: await Promise.all(sessions.filter(s => s.title).map(async s => ({ title: plain(s.title), tags: (s.tags || []).map(plain), presenters: await Promise.all((s.presenters || []).filter(p => p.name).map(person)) }))),
      stamp: JSON.stringify([event, schedule, keynotes.map(k => k.name), sessions.map(s => s.title)])
    };
  }

  function syncFeatureField(template, feature) {
    const featured = template === 'keynote' || template === 'session';
    $('maker-feature-field').hidden = !featured;
    if (!featured) return;
    const list = template === 'keynote' ? content.keynotes.map(k => k.name) : content.sessions.map(s => s.title);
    $('maker-feature-label').textContent = template === 'keynote' ? 'Keynote speaker' : 'Session';
    const select = form.elements.feature;
    const current = String(select.dataset.template === template ? select.value : feature ?? 0);
    select.replaceChildren(...list.map((text, i) => new Option(text, String(i))));
    select.dataset.template = template;
    select.value = Number(current) < list.length ? current : '0';
  }

  function updateSharing() {
    const people = state.template === 'keynote' ? [content.keynotes[state.feature]] : state.template === 'session' ? content.sessions[state.feature].presenters : [];
    const lead = state.template === 'session' ? `Session: ${content.sessions[state.feature].title}` : state.template === 'keynote' ? `Keynote: ${people[0].name}` : '';
    const caption = [content.name, lead, people.length && state.template === 'session' ? `With ${people.map(p => p.name).join(', ')}` : '', `${content.date}, ${content.year}`, content.facts, ...(state.times ? content.times : []), state.copy, `Register: ${content.url}`].filter(Boolean).join('\n');
    $('maker-caption').value = caption;
    $('maker-alt').value = `CC Fest poster with the ${A.MODES[state.mode]} animation from the CC Fest homepage${people.length ? ` and photos of ${people.map(p => p.name).join(', ')}` : ''}. ${caption.replaceAll('\n', ' ')}`;
    $('maker-canvas').setAttribute('aria-label', $('maker-alt').value);
  }

  async function ensureArt(value, fresh = false) {
    const key = artKey(value);
    if ((art.has(key) && !fresh) || pending.has(key)) return;
    pending.add(key); capturing++; syncButtons();
    setStatus(`Drawing the ${A.MODES[value.mode]} animation from the homepage…`);
    try {
      art.set(key, await Stage.capture({ url: content.home, mode: value.mode, hover: value.hover, seed: seed++ }));
    } finally { pending.delete(key); capturing--; }
    update();
  }

  function update() {
    if (busy) return;
    let next;
    try {
      next = readForm();
      syncFeatureField(next.template, next.feature);
      next = readForm();
      state = next;
      const format = A.FORMATS[next.format];
      $('maker-dimensions').textContent = `${format.width} × ${format.height} px`;
      $('maker-export-note').textContent = format.paper ? '300 ppi PNG. Print at actual size with browser headers and footers off. PDF contains raster artwork.' : 'Full-resolution PNG. Choose Letter or A4 for print / PDF.';
      $('maker-print').textContent = format.paper ? 'Print / save PDF ↗' : 'Choose a print size ↗';
      const frame = art.get(artKey(next));
      if (!frame) { ensureArt(next).catch(error => { showError(error.message); setStatus('The homepage animation could not be drawn.'); }); return; }
      const scale = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.round(760 * scale), height = Math.round(width * format.height / format.width);
      if (preview.width !== width || preview.height !== height) { preview.width = width; preview.height = height; }
      A.render(preview.getContext('2d'), next, frame, content, assets, width, height);
      updateSharing();
      showError('');
      if (capturing) return;
      try { localStorage.setItem(storageKey, JSON.stringify({ ...state, source: content.stamp })); setStatus('Ready. Draft saved in this browser.'); }
      catch (_) { setStatus('Ready. Browser storage is unavailable; save a preset to keep your design.'); }
    } catch (error) { showError(error.message); setStatus('Change the settings above before exporting.'); }
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function drawExport() {
    const format = A.FORMATS[state.format];
    const canvas = document.createElement('canvas');
    canvas.width = format.width; canvas.height = format.height;
    A.render(canvas.getContext('2d'), state, art.get(artKey(state)), content, assets, format.width, format.height);
    return canvas;
  }
  async function exportPoster(print) {
    clearTimeout(timer); update();
    if (!canExport()) return;
    if (print && !A.FORMATS[state.format].paper) {
      form.elements.format.value = 'letter'; update();
      setStatus('Switched to US Letter. Review the layout, then choose Print / save PDF.');
      return;
    }
    // Open synchronously so the click authorizes the pop-up. Everything after this must work
    // while this tab is in the background, so nothing below waits on animation frames.
    const printWindow = print ? window.open('about:blank', '_blank') : null;
    busy = true; syncButtons();
    try {
      if (print && !printWindow) throw new Error('Allow pop-ups for this site to open the print view.');
      setStatus('Drawing full-resolution artwork…');
      const canvas = drawExport();
      const blob = await new Promise((resolve, reject) => canvas.toBlob(value => (value ? resolve(value) : reject(new Error('Image export failed. Try again or choose a smaller size.'))), 'image/png'));
      const who = state.template === 'keynote' || state.template === 'session' ? `-${state.template}${state.feature + 1}` : '';
      const filename = `ccfest-${content.year}-${state.format}-${state.mode}${who}`;
      if (!print) saveBlob(blob, `${filename}.png`);
      else {
        const url = URL.createObjectURL(blob);
        const doc = printWindow.document;
        doc.title = `${content.name} — print`;
        const style = doc.createElement('style');
        const size = state.format === 'a4' ? ['210mm', '297mm'] : ['8.5in', '11in'];
        style.textContent = `@page{size:${size.join(' ')};margin:0}body{margin:0;background:#ddd;font:16px sans-serif}p{padding:16px;max-width:700px}button{padding:12px}img{display:block;width:${size[0]};height:${size[1]};max-width:100%;object-fit:contain}@media print{p{display:none}body{background:white}img{max-width:none;break-inside:avoid}}`;
        doc.head.appendChild(style);
        const instructions = doc.createElement('p');
        instructions.textContent = 'Print at 100% / actual size. Turn browser headers and footers off. Choose Save as PDF for a PDF file. This is raster artwork; use the white background for office printers. ';
        const button = doc.createElement('button'); button.textContent = 'Print / save PDF'; button.onclick = () => printWindow.print(); instructions.appendChild(button);
        const poster = doc.createElement('img'); poster.alt = $('maker-alt').value;
        doc.body.append(instructions, poster);
        poster.onload = () => URL.revokeObjectURL(url);
        poster.src = url;
        printWindow.opener = null;
      }
      setStatus(print ? 'Print view opened. Use its Print / save PDF button.' : `Downloaded ${filename}.png`);
    } catch (error) { if (printWindow) printWindow.close(); showError(error.message); setStatus('Export did not complete.'); }
    finally { busy = false; syncButtons(); }
  }

  try {
    if (!A || !Stage) throw new Error('The drawing tools could not load. Reload the page to try again.');
    await Promise.all([document.fonts.load('400 24px Anybody'), document.fonts.load('600 56px Anybody'), document.fonts.load('400 19px "Overpass Mono"')]);
    if (!document.fonts.check('400 24px Anybody') || !document.fonts.check('400 19px "Overpass Mono"')) throw new Error('The poster fonts did not load. Please reload before exporting.');
    content = await eventContent();
    const [logo, qr] = await Promise.all(['wordmark.svg', 'register-qr.svg'].map(file => image(new URL(`assets/poster-maker/${file}`, content.home).href)));
    assets = { logo, qr, logoRatio: logo.naturalHeight / logo.naturalWidth };
    let restored = { ...A.DEFAULTS };
    let restoreMessage = '';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved) { restored = A.validate(saved); if (saved.source !== content.stamp) restoreMessage = 'Event information has changed; your draft now uses the current details.'; }
    } catch (_) { restoreMessage = 'The previous draft could not be restored. Started with defaults.'; }
    fillForm(restored);
    $('maker-workspace').hidden = false;
    update();
    if (restoreMessage) setStatus(restoreMessage);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', () => { buttons.forEach(button => { button.disabled = true; }); clearTimeout(timer); timer = setTimeout(update, 100); });
    $('maker-recapture').onclick = () => { if (state) ensureArt(state, true).catch(error => showError(error.message)); };
    $('maker-reset').onclick = () => { fillForm(A.DEFAULTS); update(); };
    $('maker-save').onclick = () => {
      try { const value = readForm(); saveBlob(new Blob([JSON.stringify({ ...value, source: content.stamp }, null, 2)], { type: 'application/json' }), `ccfest-preset-${value.template}-${value.mode}.json`); }
      catch (error) { showError(error.message); }
    };
    $('maker-import').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        if (file.size > 20000) throw new Error('That preset is too large. Choose a CC Fest preset under 20 KB.');
        let value;
        try { value = JSON.parse(await file.text()); } catch (_) { throw new Error('That file is not a CC Fest preset.'); }
        fillForm(A.validate(value)); update();
        setStatus(value.source !== content.stamp ? 'Preset opened with the current event details. Review before exporting.' : 'Preset opened.');
      } catch (error) { showError(`Could not open preset: ${error.message}`); setStatus('The preset was not opened.'); }
      finally { event.target.value = ''; }
    };
    $('maker-download').onclick = () => exportPoster(false);
    $('maker-print').onclick = () => exportPoster(true);
  } catch (error) { setStatus(error.message); status.setAttribute('role', 'alert'); }
})();
