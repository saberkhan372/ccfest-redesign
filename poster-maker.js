/* Host-owned editor for the CC Fest poster maker (an internal tool, not linked from the site).
 * Artwork comes from Shristi's homepage interactive via poster-stage.js; layout is poster-art.js. */
(async function () {
  'use strict';
  const A = window.CCPosterArt;
  const Stage = window.CCStageCapture;
  const $ = id => document.getElementById(id);
  const status = $('maker-status');
  status.hidden = false;
  const form = $('maker-controls');
  const storageKey = 'ccfest-poster-v3';
  const preview = $('maker-canvas').querySelector('canvas');
  const overlay = $('maker-overlay');
  const buttons = [$('maker-download'), $('maker-download-pin'), $('maker-print')];
  const FORM_KEYS = Object.keys(A.DEFAULTS).filter(key => !['version', 'texts', 'layout'].includes(key));
  const art = new Map(); // `${mode}|${hover}` → recording: { frames: [12 stills] }
  const pending = new Set();
  let recordings = 0;
  let state, content, assets, busy = false, capturing = 0, timer, seed = 1, problems = [], selected = null;
  let edits = { texts: {}, layout: {} };
  const history = window.CCPosterHistory();
  let historyGroup = null, restoring = false;
  let galleryKey = '', storageAvailable = true;
  const setStatus = message => { status.textContent = message; };
  // Over the preview while artwork is being recorded, so the wait is visible where you are looking.
  const showLoading = (text, done = 0, total = 12) => { $('maker-loading').hidden = false; $('maker-loading-text').textContent = text; $('maker-loading-bar').value = total ? Math.round(100 * done / total) : 0; };
  const hideLoading = () => { $('maker-loading').hidden = true; };
  // File names carry the person or session, not its position in the list.
  const slug = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '');
  const artKey = value => `${value.mode}|${value.hover}`;
  // The still the Moment slider points at.
  const frameOf = value => { const frames = art.get(artKey(value)).frames; return frames[Math.min(value.moment, frames.length - 1)]; };
  const canExport = () => !busy && !capturing && $('maker-error').hidden && !problems.length && state && art.has(artKey(state));
  const syncButtons = () => {
    buttons.forEach(button => { button.disabled = !canExport(); });
    $('maker-recapture').disabled = busy || capturing > 0;
    $('maker-undo').disabled = busy || !history.canUndo;
    $('maker-redo').disabled = busy || !history.canRedo;
  };

  // One undo step per drag or continuous text/slider edit. Captures are not history entries.
  function remember(value) {
    if (!restoring) history.push(value, historyGroup);
  }
  function travel(direction) {
    if (busy) return;
    clearTimeout(timer); update();
    const next = history.move(direction);
    if (!next) return;
    historyGroup = null;
    restoring = true;
    try { fillForm(next); selected = null; update(); }
    finally { restoring = false; syncButtons(); }
  }

  function showError(message) {
    $('maker-error').textContent = message;
    $('maker-error').hidden = !message;
    syncButtons();
  }
  function readForm() {
    const value = { version: A.VERSION, texts: edits.texts, layout: edits.layout };
    for (const key of FORM_KEYS) {
      const input = form.elements.namedItem(key);
      value[key] = input.type === 'checkbox' ? input.checked : key === 'feature' || key === 'moment' ? Number(input.value) : input.value;
    }
    return A.validate(value);
  }
  function fillForm(value) {
    for (const key of FORM_KEYS) {
      const input = form.elements.namedItem(key);
      if (input.type === 'checkbox') input.checked = value[key]; else input.value = value[key];
    }
    edits = { texts: structuredClone(value.texts || {}), layout: structuredClone(value.layout || {}) };
    $('maker-texts').dataset.key = '';
    form.elements.feature.dataset.template = '';
    syncFeatureField(value.template, value.feature);
  }

  function syncDesignField(value) {
    const select = form.elements.design;
    for (const option of select.options) {
      const design = A.designs[option.value];
      option.disabled = !!design && (!design.templates.includes(value.template) || !design.formats.includes(value.format));
    }
    const unavailable = select.selectedOptions[0]?.disabled;
    if (unavailable) select.value = 'classic';
    const design = A.designs[select.value];
    $('maker-design-help').textContent = (unavailable ? 'Switched to Classic for this content and size. ' : '') + (design ? `${design.summary} ${design.limits}` : 'Classic supports every content type and size. Choose social portrait to explore more designs.');
  }

  function drawDesignGallery(value) {
    const recording = art.get(artKey(value));
    if (!recording) return;
    const keys = ['classic', ...Object.keys(A.designs).filter(key => A.designs[key].templates.includes(value.template) && A.designs[key].formats.includes(value.format))];
    const key = JSON.stringify([recording.id, value.mode, value.hover, value.moment, value.template, value.feature, value.format, value.background, value.copy, value.bios, value.times, value.qr, value.labels, value.texts]);
    if (key !== galleryKey) {
      galleryKey = key;
      $('maker-design-gallery').replaceChildren(...keys.map(design => {
        const button = document.createElement('button');
        button.type = 'button'; button.dataset.design = design;
        const name = A.designs[design]?.label || 'Classic';
        button.setAttribute('aria-label', `Use ${name} design`);
        const canvas = document.createElement('canvas'); canvas.width = 180; canvas.height = Math.round(180 * A.FORMATS[value.format].height / A.FORMATS[value.format].width);
        canvas.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span'); label.textContent = name;
        try { A.render(canvas.getContext('2d'), { ...value, design, layout: {} }, frameOf(value), { ...content, feature: featured(value) }, assets, canvas.width, canvas.height); }
        catch (_) { label.textContent = `${name} · adjust copy`; }
        button.append(canvas, label);
        return button;
      }));
    }
    $('maker-design-gallery').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.design === value.design)));
  }
  function image(url, optional = false) {
    return new Promise((resolve, reject) => {
      const item = new Image();
      item.onload = () => resolve(item);
      item.onerror = () => (optional ? resolve(null) : reject(new Error('A required image could not load. Reload the page to try again.')));
      item.src = url;
    });
  }
  // Markdown links and emphasis become plain text.
  const plain = text => String(text || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  // The opening sentence(s) of a longer text, in the person's own words. A sentence ends at
  // . ! or ? after two lowercase letters or digits, so "Amy B. Woodman" is not split.
  function opening(text, target) {
    const sentences = plain(text).split(/(?<=[a-z0-9)”"]{2}[.!?])\s+(?=[A-Z“"(])/);
    let result = '';
    for (const sentence of sentences) {
      if (result && (result + sentence).length > target) break;
      result = result ? `${result} ${sentence}` : sentence;
    }
    return result;
  }
  const isPanel = session => session.tags.some(tag => tag.toLowerCase() === 'panel');

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
    // Short bio: the site's short_bio if there is one, otherwise the opening of the full bio.
    const person = async p => ({ name: plain(p.name), pronouns: plain(p.pronouns), bio: plain(p.short_bio) || opening(p.bio, 170), image: await photo(p.photo) });
    const dateText = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    return {
      home: home.href, name: event.name, date: dateText, year: String(date.getUTCFullYear()), cost: event.cost || '',
      edition: String(event.eyebrow || '').split('·')[0].trim().toUpperCase(),
      facts: [event.cost, event.format === 'Virtual' ? 'Online' : event.format, event.level].filter(Boolean).join(' · '),
      rounds: Object.fromEntries(items.filter(item => item.kind === 'workshops').map(item => [item.id, plain(item.title)])),
      times, site: 'ccfest.rocks/register/', url: 'https://ccfest.rocks/register/',
      credits: credits.map(c => `${c.role}: ${c.name}`).join(' · '),
      keynotes: await Promise.all(keynotes.filter(k => k.name).map(async k => ({ ...(await person(k)), label: plain(k.label), slot: { opening: 'opening keynote', closing: 'closing keynote' }[plain(k.schedule_id)] || '' }))),
      sessions: await Promise.all(sessions.filter(s => s.title).map(async s => ({
        title: plain(s.title), tags: (s.tags || []).map(plain), round: plain(s.schedule_id),
        description: plain(s.short_description) || opening(s.description, 230),
        presenters: await Promise.all((s.presenters || []).filter(p => p.name).map(person))
      }))),
      stamp: JSON.stringify([event, schedule, keynotes.map(k => k.name), sessions.map(s => s.title)])
    };
  }

  // Francisca's lettering (written by scripts/sync-typography.cjs). Canvas can't set the width
  // axis, so each width she uses gets its own font face pinned to it (the browser clamps the
  // width to the face's single-value range). Without it posters fall back to plain Anybody.
  async function loadLettering(home) {
    try {
      const response = await fetch(new URL('assets/poster-maker/lettering.json', home));
      if (!response.ok) return null;
      const lettering = await response.json();
      const runs = Object.values(lettering).filter(Array.isArray).flat();
      const faces = new Map(runs.map(run => [`CCF Anybody ${run.wdth}${run.italic ? ' Italic' : ''}`, run]));
      await Promise.all([...faces].map(async ([family, run]) => {
        const file = run.italic ? 'Anybody-Italic[wdth,wght].ttf' : 'Anybody[wdth,wght].ttf';
        const face = new FontFace(family, `url("${new URL(`assets/fonts/${file}`, home).href}")`, { stretch: `${run.wdth}%`, weight: '100 900', style: run.italic ? 'italic' : 'normal' });
        document.fonts.add(await face.load());
      }));
      return lettering;
    } catch (_) { return null; }
  }

  // Which keynotes or sessions each spotlight template can feature, as indexes into the data.
  // Each entry is [index, text, group]; sessions are grouped by the round they are in.
  function choices(template) {
    if (template === 'keynote') return content.keynotes.map((k, i) => [i, k.slot ? `${k.name} (${k.slot})` : k.name, '']);
    const all = content.sessions.map((s, i) => [i, s.title, s]);
    const wanted = all.filter(([, , s]) => (template === 'panel') === isPanel(s));
    const list = wanted.length ? wanted : all;
    if (template === 'panel') return list.map(([i, title]) => [i, title, '']);
    const order = Object.keys(content.rounds);
    const rank = s => (order.includes(s.round) ? order.indexOf(s.round) : order.length);
    const label = s => content.rounds[s.round] || 'Round to be announced';
    return [...list].sort((a, b) => rank(a[2]) - rank(b[2]) || a[0] - b[0])
      .map(([i, title, s]) => [i, s.presenters.length === 1 ? `${title} — ${s.presenters[0].name}` : title, label(s)]);
  }
  const textKey = value => `${value.template}:${value.feature}`;

  // The featured keynote or session with any poster-only text edits applied.
  function featured(value) {
    if (!['keynote', 'session', 'panel'].includes(value.template)) return null;
    const edit = edits.texts[textKey(value)] || {};
    const bio = (person, i) => ({ ...person, bio: edit.bios && typeof edit.bios[i] === 'string' ? edit.bios[i] : person.bio });
    if (value.template === 'keynote') {
      const speaker = content.keynotes[value.feature];
      if (!speaker) throw new Error('Choose a keynote speaker.');
      return { kind: 'keynote', kicker: (speaker.label || 'Keynote').toUpperCase(), title: '', description: '', people: [bio(speaker, 0)] };
    }
    const session = content.sessions[value.feature];
    if (!session) throw new Error('Choose a session.');
    return {
      kind: value.template, kicker: session.tags.join(' · ').toUpperCase(), title: typeof edit.title === 'string' ? edit.title : session.title,
      description: typeof edit.description === 'string' ? edit.description : session.description,
      people: session.presenters.map(bio)
    };
  }

  // Template → featured list, plus the description and bio boxes for what's featured.
  function syncFeatureField(template, feature) {
    const spotlight = ['keynote', 'session', 'panel'].includes(template);
    $('maker-feature-field').hidden = !spotlight;
    if (!spotlight) return;
    const list = choices(template);
    $('maker-feature-label').textContent = template === 'keynote' ? 'Keynote speaker' : template === 'panel' ? 'Panel' : 'Session';
    const select = form.elements.feature;
    const wanted = String(select.dataset.template === template ? select.value : feature ?? '');
    const groups = new Map();
    for (const [i, text, group] of list) {
      if (!groups.has(group)) groups.set(group, group ? Object.assign(document.createElement('optgroup'), { label: group }) : document.createDocumentFragment());
      groups.get(group).append(new Option(text, String(i)));
    }
    select.replaceChildren(...groups.values());
    select.dataset.template = template;
    select.value = list.some(([i]) => String(i) === wanted) ? wanted : String(list[0]?.[0] ?? 0);
    syncTextFields({ template, feature: Number(select.value) });
  }
  function syncTextFields(value) {
    const key = `${value.template}:${value.feature}`;
    const fields = $('maker-texts');
    if (fields.dataset.key === key) return;
    fields.dataset.key = key;
    const feature = featured(value);
    const blocks = [];
    if (value.template !== 'keynote') {
      blocks.push(textArea('maker-text-title', 'Title on the poster', feature.title, 3, 200, 'title'));
      blocks.push(textArea('maker-text-description', 'Description on the poster', feature.description, 5, 600, 'description'));
    }
    feature.people.forEach((person, i) => blocks.push(textArea(`maker-text-bio-${i}`, `Short bio: ${person.name}`, person.bio, 3, 400, `bio-${i}`)));
    fields.replaceChildren(...blocks.flat());
  }
  function textArea(id, labelText, text, rows, max, role) {
    const label = document.createElement('label'); label.htmlFor = id; label.textContent = labelText;
    const area = document.createElement('textarea'); area.id = id; area.rows = rows; area.maxLength = max; area.value = text; area.dataset.text = role;
    return [label, area];
  }
  // Saves the text boxes as edits to the featured item, keeping only what differs from the
  // site's text. An emptied description hides it on the poster.
  function readTexts() {
    const fields = $('maker-texts');
    const key = fields.dataset.key;
    if (!key) return;
    const [template, feature] = key.split(':');
    delete edits.texts[key];
    let original;
    try { original = featured({ template, feature: Number(feature) }); } catch (_) { return; }
    const tidy = text => text.replace(/\s+/g, ' ').trim();
    const entry = {};
    const title = fields.querySelector('[data-text="title"]');
    if (title && tidy(title.value) !== original.title) entry.title = tidy(title.value);
    const description = fields.querySelector('[data-text="description"]');
    if (description && tidy(description.value) !== original.description) entry.description = tidy(description.value);
    const bios = original.people.map((person, i) => { const area = fields.querySelector(`[data-text="bio-${i}"]`); return area && tidy(area.value) !== person.bio ? tidy(area.value) : null; });
    if (bios.some(bio => bio !== null)) entry.bios = bios;
    if (Object.keys(entry).length) edits.texts[key] = entry;
  }

  function updateSharing(feature) {
    const people = feature ? feature.people : [];
    const lead = feature ? (feature.kind === 'keynote' ? `Keynote: ${people[0].name}` : `${feature.kind === 'panel' ? 'Panel' : 'Session'}: ${feature.title}`) : '';
    const caption = [content.name, lead, feature && feature.kind !== 'keynote' && people.length ? `With ${people.map(p => p.name).join(', ')}` : '', `${content.date}, ${content.year}`, content.facts, ...(state.times ? content.times : []), state.copy, `Register: ${content.url}`].filter(Boolean).join('\n');
    $('maker-caption').value = caption;
    $('maker-alt').value = `CC Fest poster with the ${A.MODES[state.mode]} animation from the CC Fest homepage${people.length ? ` and photos of ${people.map(p => p.name).join(', ')}` : ''}. ${caption.replaceAll('\n', ' ')}`;
    $('maker-canvas').setAttribute('aria-label', $('maker-alt').value);
  }

  async function ensureArt(value, fresh = false) {
    const key = artKey(value);
    if ((art.has(key) && !fresh) || pending.has(key)) return;
    pending.add(key); capturing++; syncButtons();
    const name = A.MODES[value.mode];
    setStatus(`Recording the ${name} animation from the homepage…`);
    showLoading(`Recording the ${name} animation from the homepage…`);
    try {
      recordings++;
      art.set(key, { id: recordings, ...await Stage.capture({ url: content.home, mode: value.mode, hover: value.hover, seed: seed++, onProgress: (done, total) => { setStatus(`Recording the ${name} animation from the homepage… ${done} of ${total}`); showLoading(`Recording the ${name} animation… ${done} of ${total}`, done, total); } }) });
    } finally { pending.delete(key); capturing--; if (!capturing) hideLoading(); }
    update();
  }

  // Draws the preview and refreshes the move/resize handles. Returns the render result.
  function drawPreview(value) {
    const frame = frameOf(value);
    const format = A.FORMATS[value.format];
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(760 * scale), height = Math.round(width * format.height / format.width);
    if (preview.width !== width || preview.height !== height) { preview.width = width; preview.height = height; }
    const result = A.render(preview.getContext('2d'), value, frame, { ...content, feature: featured(value) }, assets, width, height);
    drawHandles(result);
    return result;
  }

  function update() {
    if (busy) return;
    try {
      let next = readForm();
      syncFeatureField(next.template, next.feature);
      syncDesignField(next);
      next = readForm();
      state = next;
      remember(next);
      const format = A.FORMATS[next.format];
      $('maker-dimensions').textContent = `${format.width} × ${format.height} px`;
      $('maker-workspace').style.setProperty('--poster-ratio', (format.width / format.height).toFixed(4));
      $('maker-moment-value').value = `${next.moment + 1} / 12`;
      drawFilmstrip(next);
      $('maker-export-note').textContent = format.paper ? '300 ppi PNG. Print at actual size with browser headers and footers off. PDF contains raster artwork.' : 'Full-resolution PNG. Choose Letter or A4 for print / PDF.';
      $('maker-print').textContent = format.paper ? 'Print / save PDF ↗' : 'Print / PDF: switch to Letter ↗';
      if (!art.get(artKey(next))) { ensureArt(next).catch(error => { showError(error.message); setStatus('The homepage animation could not be drawn.'); }); return; }
      const result = drawPreview(next);
      drawDesignGallery(next);
      problems = result.problems;
      const notes = [...result.notes];
      if (['bold-date', 'art-led', 'speaker-led', 'program-led'].includes(next.design) && next.copy) notes.push('This design omits the supporting line; it is included in your caption.');
      if (next.design === 'art-led' && next.times) notes.push('Art-led omits festival times; they are included in your caption.');
      if (next.design === 'program-led' && featured(next)?.people.length > 2) notes.push('The panel layout omits the description and artwork to give presenters more space.');
      if (next.design === 'classic' && ['square', 'landscape'].includes(next.format) && ['session', 'panel'].includes(next.template)) notes.push('This size omits the session description. Choose portrait or story to include it.');
      $('maker-notes').replaceChildren(...[...new Set(notes)].map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
      $('maker-notes').hidden = !notes.length;
      updateSharing(featured(next));
      showError(problems.join(' '));
      if (capturing) return;
      try { localStorage.setItem(storageKey, JSON.stringify({ ...state, source: content.stamp })); storageAvailable = true; } catch (_) { storageAvailable = false; }
      setStatus(problems.length ? 'Fix the layout before exporting.' : storageAvailable ? 'Ready. Draft saved in this browser.' : 'Ready. Browser storage is unavailable. Save a preset to keep your settings.');
    } catch (error) { problems = []; showError(error.message); setStatus('Change the settings above before exporting.'); }
  }

  // Twelve small frames under the Moment slider; clicking one picks that moment. The slider
  // stays the accessible control, so the strip is hidden from assistive technology.
  let stripKey = '';
  function drawFilmstrip(value) {
    const strip = $('maker-filmstrip');
    const recording = art.get(artKey(value));
    if (!recording) { strip.replaceChildren(); stripKey = ''; return; }
    const key = `${recording.id}|${value.background}`;
    if (stripKey !== key) {
      stripKey = key;
      strip.replaceChildren(...recording.frames.map((frame, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 120; canvas.height = 80;
        A.thumbnail(canvas.getContext('2d'), value, frame, 120, 80);
        canvas.dataset.moment = String(i);
        return canvas;
      }));
    }
    strip.querySelectorAll('canvas').forEach(canvas => canvas.classList.toggle('is-current', Number(canvas.dataset.moment) === value.moment));
  }

  /* ── Move and resize ─────────────────────────────────────────────── */
  function blockTransform(id) {
    const layout = edits.layout[A.layoutKey(state)] || {};
    return { ...(layout[id] || { x: 0, y: 0, s: 1 }) };
  }
  function setTransform(id, t) {
    const key = A.layoutKey(state);
    const layout = edits.layout[key] || (edits.layout[key] = {});
    const round = n => Math.round(n * 10) / 10;
    const s = Math.min(4, Math.max(0.25, Math.round(t.s * 1000) / 1000));
    if (Math.abs(t.x) < 0.5 && Math.abs(t.y) < 0.5 && Math.abs(s - 1) < 0.005) delete layout[id];
    else layout[id] = { x: round(t.x), y: round(t.y), s };
    if (!Object.keys(layout).length) delete edits.layout[key];
  }
  // Redraws only the preview while dragging; the full update runs when the gesture ends.
  let frameRequest = 0;
  function livePreview() {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(() => { try { state = { ...state, layout: edits.layout }; drawPreview(state); } catch (_) { /* the full update reports it */ } });
  }
  function drawHandles(result) {
    const keep = document.activeElement && overlay.contains(document.activeElement) ? document.activeElement.dataset.block : null;
    overlay.replaceChildren(...result.boxes.map(box => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'maker-block';
      button.dataset.block = box.id;
      button.setAttribute('aria-label', `${box.label}. Drag to move; drag the corner to resize. Arrow keys move it, plus and minus resize it, 0 puts it back.`);
      button.setAttribute('aria-pressed', String(selected === box.id));
      Object.assign(button.style, { left: `${box.x / 10}%`, top: `${box.y / result.H * 100}%`, width: `${box.w / 10}%`, height: `${box.h / result.H * 100}%` });
      const handle = document.createElement('span');
      handle.className = 'maker-block-handle';
      handle.setAttribute('aria-hidden', 'true');
      button.appendChild(handle);
      return button;
    }));
    if (keep) overlay.querySelector(`[data-block="${keep}"]`)?.focus({ preventScroll: true });
  }
  function select(id) {
    selected = id;
    overlay.querySelectorAll('.maker-block').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.block === id)));
  }
  overlay.addEventListener('pointerdown', event => {
    const block = event.target.closest('.maker-block');
    if (!block || !state || busy) return;
    event.preventDefault();
    const id = block.dataset.block;
    select(id);
    block.focus({ preventScroll: true });
    const start = blockTransform(id);
    const unit = 1000 / overlay.clientWidth; // logical units per CSS pixel
    const resizing = event.target.classList.contains('maker-block-handle');
    const rect = block.getBoundingClientRect();
    const anchor = { x: rect.left, y: rect.top };
    const startDistance = Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) || 1;
    const origin = { x: event.clientX, y: event.clientY };
    let moved = false;
    overlay.setPointerCapture(event.pointerId);
    const move = e => {
      moved = true;
      if (resizing) setTransform(id, { ...start, s: start.s * Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) / startDistance });
      else setTransform(id, { ...start, x: start.x + (e.clientX - origin.x) * unit, y: start.y + (e.clientY - origin.y) * unit });
      livePreview();
    };
    const end = () => {
      overlay.removeEventListener('pointermove', move);
      overlay.removeEventListener('pointerup', end);
      overlay.removeEventListener('pointercancel', end);
      if (moved) update();
    };
    overlay.addEventListener('pointermove', move);
    overlay.addEventListener('pointerup', end);
    overlay.addEventListener('pointercancel', end);
  });
  overlay.addEventListener('focusin', event => { const block = event.target.closest('.maker-block'); if (block) select(block.dataset.block); });
  overlay.addEventListener('keydown', event => {
    const block = event.target.closest('.maker-block');
    if (!block || !state) return;
    const id = block.dataset.block;
    const t = blockTransform(id);
    const step = event.shiftKey ? 20 : 4;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[event.key]) { t.x += moves[event.key][0]; t.y += moves[event.key][1]; }
    else if (event.key === '+' || event.key === '=') t.s *= 1.05;
    else if (event.key === '-' || event.key === '_') t.s /= 1.05;
    else if (event.key === '0') { t.x = 0; t.y = 0; t.s = 1; }
    else return;
    event.preventDefault();
    setTransform(id, t);
    update();
  });

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
    A.render(canvas.getContext('2d'), state, frameOf(state), { ...content, feature: featured(state) }, assets, format.width, format.height);
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
      const person = ['keynote', 'session', 'panel'].includes(state.template) ? featured(state) : null;
      const who = person ? `-${state.template}-${slug(person.kind === 'keynote' ? person.people[0].name : person.title) || state.feature + 1}` : '';
      const filename = `ccfest-${content.year}-${state.format}-${state.design}-${state.mode}${who}`;
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
    content.lettering = await loadLettering(content.home);
    const [logo, qr] = await Promise.all(['wordmark.svg', 'register-qr.svg'].map(file => image(new URL(`assets/poster-maker/${file}`, content.home).href)));
    assets = { logo, qr, logoRatio: logo.naturalHeight / logo.naturalWidth };
    const logoResponse = await fetch(new URL('assets/poster-maker/wordmark.svg', content.home));
    if (!logoResponse.ok) throw new Error('The wordmark could not load. Reload before exporting.');
    assets.logoWhite = await image(`data:image/svg+xml;charset=utf-8,${encodeURIComponent((await logoResponse.text()).replace(/fill="#18181A"/gi, 'fill="#ffffff"'))}`);
    for (const [key, design] of Object.entries(A.designs)) form.elements.design.add(new Option(design.label, key));
    // Internal: /poster-maker/?proofs lays the design directions side by side instead of opening
    // the editor. poster-proofs.js is loaded only then, and gets the event content and images.
    if (new URLSearchParams(location.search).has('proofs')) {
      window.CCPosterContext = { content, assets };
      status.hidden = true;
      document.body.appendChild(Object.assign(document.createElement('script'), { src: new URL('poster-proofs.js', content.home).href }));
      return;
    }
    let restored = { ...A.DEFAULTS };
    let restoreMessage = '';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved) { restored = A.validate(saved); if (saved.source !== content.stamp) restoreMessage = 'Event information has changed; your draft now uses the current details.'; }
    } catch (_) { restoreMessage = 'The previous draft could not be restored. Started with defaults.'; }
    fillForm(restored);
    $('maker-workspace').hidden = false;
    status.className = 'maker-status'; $('maker-status-slot').appendChild(status);
    update();
    if (restoreMessage) setStatus(restoreMessage);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', event => {
      historyGroup = event.target.matches('textarea,input[type=range]') ? event.target.id : null;
      if (event.target.dataset.text) readTexts();
      // Scrubbing redraws straight away; the frames are already recorded.
      if (event.target.name === 'moment') { clearTimeout(timer); update(); return; }
      buttons.forEach(button => { button.disabled = true; });
      clearTimeout(timer); timer = setTimeout(update, 120);
    });
    form.addEventListener('focusout', () => { clearTimeout(timer); update(); historyGroup = null; history.endGroup(); });
    $('maker-design-gallery').addEventListener('click', event => {
      const button = event.target.closest('button[data-design]');
      if (!button) return;
      historyGroup = null; history.endGroup();
      form.elements.design.value = button.dataset.design; selected = null; update();
    });
    $('maker-undo').onclick = () => travel(-1);
    $('maker-redo').onclick = () => travel(1);
    $('maker-workspace').addEventListener('keydown', event => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.target.matches('input,textarea,select')) return;
      const key = event.key.toLowerCase();
      if (key === 'z' || key === 'y') { event.preventDefault(); travel(key === 'y' || event.shiftKey ? 1 : -1); }
    });
    $('maker-filmstrip').addEventListener('click', event => {
      const moment = event.target.dataset && event.target.dataset.moment;
      if (moment === undefined) return;
      form.elements.moment.value = moment;
      update();
    });
    $('maker-recapture').onclick = () => { if (state) ensureArt(state, true).catch(error => showError(error.message)); };
    $('maker-text-reset').onclick = () => { if (!state) return; delete edits.texts[textKey(state)]; $('maker-texts').dataset.key = ''; syncTextFields(state); update(); };
    $('maker-layout-reset').onclick = () => { if (!state) return; delete edits.layout[A.layoutKey(state)]; selected = null; update(); };
    $('maker-reset').onclick = () => { fillForm(A.DEFAULTS); update(); };
    $('maker-save').onclick = () => {
      try { const value = readForm(); saveBlob(new Blob([JSON.stringify({ ...value, source: content.stamp }, null, 2)], { type: 'application/json' }), `ccfest-preset-${value.template}-${value.mode}.json`); }
      catch (error) { showError(error.message); }
    };
    $('maker-import').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        if (file.size > 40000) throw new Error('That preset is too large. Choose a CC Fest preset under 40 KB.');
        let value;
        try { value = JSON.parse(await file.text()); } catch (_) { throw new Error('That file is not a CC Fest preset.'); }
        fillForm(A.validate(value)); update();
        setStatus(value.source !== content.stamp ? 'Preset opened with the current event details. Review before exporting.' : 'Preset opened.');
      } catch (error) { showError(`Could not open preset: ${error.message}`); setStatus('The preset was not opened.'); }
      finally { event.target.value = ''; }
    };
    $('maker-download').onclick = $('maker-download-pin').onclick = () => exportPoster(false);
    document.querySelector('.maker-sharing').addEventListener('click', async event => {
      const button = event.target.closest('button[data-copy]'); if (!button) return;
      const field = $(button.dataset.copy);
      try { await navigator.clipboard.writeText(field.value); }
      catch (_) { field.focus(); field.select(); if (!document.execCommand('copy')) { setStatus('Select the text and copy it with Ctrl or ⌘ C.'); return; } }
      const label = button.textContent; button.textContent = 'Copied ✓'; setStatus(`Copied the ${button.dataset.copy === 'maker-alt' ? 'image description' : 'caption'}.`);
      setTimeout(() => { button.textContent = label; }, 1800);
    });
    $('maker-print').onclick = () => exportPoster(true);
  } catch (error) { setStatus(error.message); status.setAttribute('role', 'alert'); }
})();
