/* Internal review sheet: /poster-maker/?proofs (optionally &mode=change). Draws every design
 * direction with the real event content and one frame of a homepage animation, side by side,
 * with what each design reports about itself (contrast pairs, clipped text, layout problems).
 * Loaded by poster-maker.js only for that address; the editor is not opened. */
(async function () {
  'use strict';
  const A = window.CCPosterArt;
  const Stage = window.CCStageCapture;
  const { content, assets } = window.CCPosterContext;
  const W = 1080, H = 1350;
  const el = (tag, props = {}, ...kids) => { const node = Object.assign(document.createElement(tag), props); kids.flat().forEach(k => node.append(k)); return node; };
  const asked = new URLSearchParams(location.search).get('mode');
  let mode = asked && A.MODES[asked] ? asked : 'creativity';

  // The white wordmark, for type on blue: the outline is a single fill, so it is the same file recoloured.
  const svg = await (await fetch(new URL('assets/poster-maker/wordmark.svg', content.home))).text();
  assets.logoWhite = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image); image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/fill="#18181A"/gi, 'fill="#ffffff"'))}`;
  });

  // Content for each proof, taken from the data rather than named: a title or a photo changing in
  // the CMS changes the proof, not the code.
  const isPanel = s => s.tags.some(tag => tag.toLowerCase() === 'panel');
  const feature = {
    keynotes: people => ({ kind: 'keynote', kicker: 'KEYNOTES', title: '', description: '', people }),
    session: s => ({ kind: isPanel(s) ? 'panel' : 'session', kicker: s.tags.join(' · ').toUpperCase(), title: s.title, description: s.description, people: s.presenters })
  };
  const talks = content.sessions.filter(s => !isPanel(s) && s.presenters.length);
  const byLength = [...talks].sort((a, b) => a.title.length - b.title.length);
  const typical = byLength.filter(s => s.presenters.some(p => p.image))[Math.floor(byLength.filter(s => s.presenters.some(p => p.image)).length / 2)] || byLength[0];
  const longest = byLength[byLength.length - 1];
  const panel = content.sessions.find(isPanel);

  const COPY = 'Workshops, talks, and community for creative coders.';
  const PRIMARY = [
    { id: 'signature', design: 'signature', template: 'announcement' },
    { id: 'bold-date', design: 'bold-date', template: 'announcement' },
    { id: 'art-led', design: 'art-led', template: 'announcement' },
    { id: 'speaker-led', design: 'speaker-led', template: 'keynote', feature: feature.keynotes(content.keynotes.slice(0, 2)), bios: false, note: 'Both keynotes, bios off' },
    { id: 'program-led', design: 'program-led', template: 'session', feature: typical && feature.session(typical), note: typical && `Session: ${typical.title}` },
    { id: 'minimal-print', design: 'minimal-print', template: 'community', background: 'white', note: 'White background, community copy' }
  ];
  const VARIANTS = [
    { id: 'speaker-single', design: 'speaker-led', template: 'keynote', feature: feature.keynotes(content.keynotes.slice(0, 1)), title: 'Speaker-led · one keynote', note: content.keynotes[0] && content.keynotes[0].name },
    { id: 'program-longest', design: 'program-led', template: 'session', feature: longest && feature.session(longest), title: 'Program-led · longest title', note: longest && `${longest.title.length} characters, ${longest.presenters.some(p => p.image) ? 'with' : 'no'} photo` },
    { id: 'program-panel', design: 'program-led', template: 'panel', feature: panel && feature.session(panel), title: 'Program-led · panel of four', note: panel && `${panel.presenters.length} people` },
    { id: 'current', design: undefined, template: 'announcement', title: 'Current layout (reference)', note: 'What the editor draws today' }
  ];

  const ratio = (a, b) => {
    const lum = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0); };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const heading = document.getElementById('page-title');
  heading.textContent = 'Poster design directions';
  heading.nextElementSibling.textContent = 'Internal review sheet. Real event content and one frame of a homepage animation; nothing here is published.';
  const status = el('p', { className: 'maker-status page-width', role: 'status' });
  const modeSelect = el('select', { id: 'proof-mode' }, Object.entries(A.MODES).map(([key, name]) => el('option', { value: key, textContent: name, selected: key === mode })));
  const phone = el('input', { type: 'checkbox', id: 'proof-phone' });
  const bar = el('div', { className: 'proof-bar page-width' },
    el('label', { htmlFor: 'proof-mode' }, 'Homepage animation '), modeSelect,
    el('label', { className: 'maker-check', htmlFor: 'proof-phone' }, phone, ' Show at phone size (375 px wide)'));
  const grid = el('div', { className: 'proof-grid' });
  const variants = el('div', { className: 'proof-grid proof-variants' });
  const section = el('section', { className: 'proofs page-width', ariaLabel: 'Design proofs' },
    el('h2', {}, 'Six directions'), grid, el('h2', {}, 'Variants and the current layout'), variants);
  const main = document.querySelector('main');
  main.insertBefore(section, document.querySelector('.maker-about'));
  main.insertBefore(bar, section);
  main.insertBefore(status, bar);
  phone.addEventListener('change', () => section.classList.toggle('proofs-phone', phone.checked));

  const results = [];
  let recorded = null;
  function draw(spec, art, number) {
    const label = spec.title || `${number} · ${A.designs[spec.design].label}`;
    const canvas = el('canvas', { width: W, height: H });
    const caption = el('figcaption', {}, el('strong', {}, label));
    const card = el('figure', { className: 'proof' }, canvas, caption);
    const state = { ...A.DEFAULTS, template: spec.template, format: 'portrait', mode, background: spec.background || 'paper', bios: spec.bios !== false, copy: COPY, design: spec.design };
    const result = { id: spec.id, label, design: spec.design || 'classic', problems: [], notes: [], pairs: [], error: '' };
    if (spec.design) {
      const d = A.designs[spec.design];
      caption.append(el('span', { className: 'proof-use' }, d.use), el('p', {}, d.summary), el('p', { className: 'proof-limits' }, `Content: ${d.limits}`));
    } else caption.append(el('p', {}, 'The layout every poster uses today, drawn from the same content, for comparison.'));
    if (spec.note) caption.append(el('p', { className: 'proof-note' }, spec.note));
    try {
      if (spec.template !== 'announcement' && spec.template !== 'community' && !spec.feature) throw new Error('There is no session or keynote in the data for this proof.');
      const out = A.render(canvas.getContext('2d'), state, art, { ...content, feature: spec.feature || null }, assets, W, H);
      result.problems = out.problems; result.notes = out.notes;
      result.pairs = out.pairs.map(p => { const [fg, bg] = p.split('/'); return { pair: p, ratio: Math.round(ratio(A.COLORS[fg], A.COLORS[bg]) * 100) / 100 }; });
    } catch (error) { result.error = error.message; result.stack = String(error.stack || '').split('\n').slice(0, 4).join(' | '); }
    const facts = el('ul', { className: 'proof-report' });
    result.pairs.forEach(p => facts.append(el('li', { className: p.ratio >= 4.5 ? 'ok' : 'low' }, `${p.pair.replace('/', ' on ')} ${p.ratio}:1`)));
    result.notes.forEach(n => facts.append(el('li', {}, n)));
    result.problems.forEach(n => facts.append(el('li', { className: 'low' }, n)));
    if (result.error) facts.append(el('li', { className: 'low' }, `Does not fit: ${result.error}`));
    caption.append(facts);
    results.push(result);
    return card;
  }


  /* ── Measured limits ───────────────────────────────────────────────── */
  // Draws a design with synthetic content and says whether it fit: no error, no layout problem,
  // and nothing the design had to clip. Used to measure the limits quoted in the review notes.
  const scratch = document.createElement('canvas');
  scratch.width = 540; scratch.height = 675;
  function fits(design, template, feature, extra = {}) {
    const state = { ...A.DEFAULTS, template, format: 'portrait', mode, background: 'paper', design, copy: COPY, ...extra };
    try {
      const out = A.render(scratch.getContext('2d'), state, recorded, { ...content, feature }, assets, 540, 675);
      return { ok: !out.problems.length, clipped: out.notes.some(n => /clipped|shortened/i.test(n)), notes: out.notes };
    } catch (error) { return { ok: false, clipped: false, error: error.message }; }
  }
  const words = (longest ? longest.title : 'Machine Learning in Motion Designing Better Technology for Athletes').split(/\s+/);
  const text = n => { let out = ''; for (let i = 0; out.length < n; i++) out += (out ? ' ' : '') + words[i % words.length]; return out.slice(0, n).replace(/\s+\S*$/, '') || out; };
  const person = (name, bio = '') => ({ name, pronouns: 'they/them', bio, image: null });
  // A realistic long name: words of seven letters, as many characters as asked.
  const spaced = n => 'Aaaaaaa Bbbbbbb Ccccccc Ddddddd Eeeeeee Fffffff Ggggggg Hhhhhhh Iiiiiii Jjjjjjj Kkkkkkk Lllllll'.slice(0, n).trim();
  // Longest n (characters) that still fits before the first failure.
  function reach(make, from, to, step = 2) {
    let last = 0;
    for (let n = from; n <= to; n += step) { const result = make(n); if (!result.ok) return { max: last, failsAt: n, error: result.error || '' }; last = n; }
    return { max: last, failsAt: null };
  }
  // The content each design is shown with, for the checks that run every design the same way.
  const sample = design => ({ 'speaker-led': ['keynote', feature.keynotes(content.keynotes.slice(0, 2))], 'program-led': ['session', typical && feature.session(typical)], 'minimal-print': ['community', null] })[design] || ['announcement', null];
  // A design asked for a size it has no layout for must say so, not draw something else.
  function refusesOtherSizes() {
    return Object.keys(A.designs).map(d => {
      const [template, f] = sample(d);
      const state = { ...A.DEFAULTS, template, format: 'square', mode, background: 'paper', design: d, copy: COPY };
      const out = A.render(scratch.getContext('2d'), state, recorded, { ...content, feature: f }, assets, 540, 540);
      return [d, out.problems.some(p => /layout yet/.test(p))];
    });
  }
  function limits() {
    const one = typical && typical.presenters[0] ? typical.presenters[0] : person('Presenter');
    const session = n => feature.session({ ...(typical || { tags: ['Workshop'], description: '', presenters: [one] }), title: text(n) });
    return {
      programTitle: reach(n => fits('program-led', 'session', session(n)), 10, 260),
      programTitlePanel: reach(n => fits('program-led', 'panel', feature.session({ ...(panel || typical), title: text(n) })), 10, 260),
      titleSizes: [24, 31, 48, 68, 90, 120, 150, 180].map(n => { const r = fits('program-led', 'session', session(n)); const m = (r.notes || []).join(' ').match(/Title set at (\d+)px over (\d+)/); return { chars: n, size: m ? Number(m[1]) : null, lines: m ? Number(m[2]) : null, ok: r.ok }; }),
      programName: reach(n => fits('program-led', 'session', feature.session({ ...typical, title: 'A session', presenters: [person(spaced(n))] })), 6, 90),
      speakerNamePair: reach(n => fits('speaker-led', 'keynote', feature.keynotes([person(spaced(n)), person(spaced(n))]), { bios: false }), 6, 90),
      speakerNameSingle: reach(n => fits('speaker-led', 'keynote', feature.keynotes([person(spaced(n))]), { bios: false }), 6, 90),
      supportingLine: ['signature', 'minimal-print'].map(d => [d, fits(d, d === 'minimal-print' ? 'community' : 'announcement', null, { copy: 'W'.repeat(100).replace(/(.{9})/g, '$1 ') .slice(0, 100) }).ok]),
      noPhotosPair: fits('speaker-led', 'keynote', feature.keynotes([person('Ada Lovelace'), person('Grace Hopper')]), { bios: false }).ok,
      refusesOtherSizes: refusesOtherSizes(),
      whiteBackground: Object.keys(A.designs).map(d => { const [template, f] = sample(d); return [d, fits(d, template, f, { background: 'white' }).ok]; }),
      noTimesNoQr: ['signature', 'bold-date', 'art-led', 'minimal-print'].map(d => [d, fits(d, d === 'minimal-print' ? 'community' : 'announcement', null, { times: false, qr: false }).ok])
    };
  }

  async function run() {
    document.documentElement.dataset.proofs = 'busy';
    status.textContent = `Recording the ${A.MODES[mode]} animation from the homepage…`;
    const recording = await Stage.capture({ url: content.home, mode, hover: true, seed: 1, onProgress: (done, total) => { status.textContent = `Recording the ${A.MODES[mode]} animation from the homepage… ${done} of ${total}`; } });
    const art = recording.frames[recording.frames.length - 1];
    recorded = art;
    results.length = 0;
    grid.replaceChildren(...PRIMARY.map((spec, i) => draw(spec, art, i + 1)));
    variants.replaceChildren(...VARIANTS.map(spec => draw(spec, art)));
    window.CCPosterProofs = { mode, results, limits, art: () => recorded };
    status.textContent = `Drawn with the ${A.MODES[mode]} animation, last frame.`;
    document.documentElement.dataset.proofs = 'ready';
  }
  modeSelect.addEventListener('change', () => { mode = modeSelect.value; run().catch(e => { status.textContent = e.message; }); });
  await run();
})().catch(error => { document.documentElement.dataset.proofs = 'error'; const s = document.getElementById('maker-status'); s.hidden = false; s.textContent = `Proofs failed: ${error.message}`; });
