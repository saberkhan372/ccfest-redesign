/* Host-owned poster renderer. The artwork is a still frame of Shristi's homepage interactive,
 * captured by poster-stage.js; this file only lays it out with the event details.
 * Everything is drawn in a 1000-unit-wide logical space, so preview and export match.
 * The poster is a set of blocks (wordmark, artwork, details, people, text, QR). Each starts in an
 * automatic position; people can then move and resize blocks, stored per size in state.layout. */
(function (root) {
  'use strict';
  const VERSION = 3;
  const FORMATS = {
    portrait: { width: 1080, height: 1350, label: 'Social portrait' },
    square: { width: 1080, height: 1080, label: 'Square' },
    story: { width: 1080, height: 1920, label: 'Story' },
    landscape: { width: 1200, height: 630, label: 'Landscape' },
    letter: { width: 2550, height: 3300, label: 'US Letter', paper: 'letter' },
    a4: { width: 2480, height: 3508, label: 'A4', paper: 'A4' }
  };
  // Shristi's artwork is drawn for the paper background; white is for office printing.
  const BACKGROUNDS = { paper: '#edede9', white: '#ffffff' };
  const INK = '#18181a';
  const MODES = {
    creativity: 'Creativity', change: 'Change', connection: 'Connection', celebration: 'Celebration', collaboration: 'Collaboration',
    'creative-commons': 'Creative Commons', conversations: 'Conversations', community: 'Community', curiosity: 'Curiosity', coding: 'Coding'
  };
  const TEMPLATES = ['announcement', 'keynote', 'session', 'panel', 'community'];
  const BLOCKS = { logo: 'Wordmark', art: 'Artwork', info: 'Event details', people: 'People', copy: 'Supporting text', qr: 'QR code' };
  const DEFAULTS = { version: VERSION, template: 'announcement', format: 'portrait', mode: 'creativity', hover: true, labels: true, background: 'paper', feature: 0, bios: true, times: true, qr: true, copy: 'Workshops, talks, and community for creative coders.', texts: {}, layout: {} };

  const plainText = (value, max) => typeof value === 'string' && value.length <= max && !/[<>]/.test(value) && ![...value].some(c => c.charCodeAt(0) < 32 && c !== '\n');
  function validate(value) {
    if (!value || typeof value !== 'object' || value.version !== VERSION) throw new Error('This preset is from a different version of the poster maker.');
    const result = { version: VERSION };
    for (const [key, choices] of Object.entries({ template: TEMPLATES, format: Object.keys(FORMATS), mode: Object.keys(MODES), background: Object.keys(BACKGROUNDS) })) {
      if (!choices.includes(value[key])) throw new Error(`Choose a valid ${key}.`);
      result[key] = value[key];
    }
    if (!Number.isInteger(value.feature) || value.feature < 0 || value.feature > 99) throw new Error('Choose a speaker or session from the list.');
    result.feature = value.feature;
    for (const key of ['hover', 'labels', 'bios', 'times', 'qr']) {
      if (typeof value[key] !== 'boolean') throw new Error(`Invalid ${key} setting.`);
      result[key] = value[key];
    }
    if (!plainText(value.copy, 100) || value.copy.includes('\n')) throw new Error('Use a plain supporting line of up to 100 characters.');
    result.copy = value.copy.trim();
    // Poster-only edits to descriptions and bios, keyed "session:2".
    result.texts = {};
    for (const [key, text] of Object.entries(value.texts || {})) {
      if (!/^(keynote|session|panel):\d{1,2}$/.test(key) || !text || typeof text !== 'object') throw new Error('A saved text edit is not valid.');
      const entry = {};
      if ('description' in text) { if (!plainText(text.description, 600)) throw new Error('Keep the description under 600 characters of plain text.'); entry.description = text.description; }
      if ('bios' in text) {
        if (!Array.isArray(text.bios) || text.bios.length > 8 || !text.bios.every(bio => bio === null || plainText(bio, 400))) throw new Error('Keep each bio under 400 characters of plain text.');
        entry.bios = text.bios;
      }
      result.texts[key] = entry;
    }
    // Moved and resized blocks, per size.
    result.layout = {};
    for (const [format, blocks] of Object.entries(value.layout || {})) {
      if (!FORMATS[format] || !blocks || typeof blocks !== 'object') throw new Error('A saved layout is not valid.');
      result.layout[format] = {};
      for (const [id, t] of Object.entries(blocks)) {
        const ok = BLOCKS[id] && t && [t.x, t.y, t.s].every(Number.isFinite) && Math.abs(t.x) <= 3000 && Math.abs(t.y) <= 3000 && t.s >= 0.25 && t.s <= 4;
        if (!ok) throw new Error('A saved layout is not valid.');
        result.layout[format][id] = { x: t.x, y: t.y, s: t.s };
      }
    }
    return result;
  }

  function font(ctx, size, mono = false, weight = 400) {
    ctx.font = `${weight} ${size}px "${mono ? 'Overpass Mono' : 'Anybody'}"`;
    ctx.textBaseline = 'top';
    ctx.letterSpacing = '0px';
  }

  // Francisca's lettering: runs of letters, each with its own width axis, weight, italic and
  // spacing, from assets/poster-maker/lettering.json. Canvas can't set the width axis, so
  // poster-maker.js registers one font face per width (LETTER_FAMILY) that pins it.
  const LETTER_FAMILY = run => `CCF Anybody ${run.wdth}${run.italic ? ' Italic' : ''}`;
  function setRun(ctx, run, size) {
    ctx.font = `${run.italic ? 'italic ' : ''}${run.wght} ${size}px "${LETTER_FAMILY(run)}"`;
    ctx.letterSpacing = `${run.spacing * size}px`;
    ctx.textBaseline = 'top';
  }
  // One line of runs. Shrinks to fit maxWidth rather than failing. Returns the height used.
  function lettered(ctx, runs, x, y, size, maxWidth, draw) {
    const text = run => (run.upper ? run.text.toUpperCase() : run.text);
    const measure = at => runs.reduce((width, run) => { setRun(ctx, run, at); return width + ctx.measureText(text(run)).width; }, 0);
    const natural = measure(size);
    const fitted = natural > maxWidth ? size * maxWidth / natural : size;
    if (draw) {
      let cx = x;
      ctx.fillStyle = INK;
      for (const run of runs) { setRun(ctx, run, fitted); ctx.fillText(text(run), cx, y); cx += ctx.measureText(text(run)).width; }
    }
    ctx.letterSpacing = '0px';
    return fitted * 1.2;
  }
  // "Keynotes" → "Keynote": her letters, minus the final run when it is just the s.
  const singular = runs => (runs[runs.length - 1].text === 's' ? runs.slice(0, -1) : runs);
  // Every text helper can measure without drawing (draw = false) so layouts can be sized first.
  function line(ctx, text, x, y, size, maxWidth, draw, mono = false, weight = 400) {
    font(ctx, size, mono, weight);
    if (ctx.measureText(text).width > maxWidth + 0.5) throw new Error('Text does not fit this layout. Try a taller size or a shorter supporting line.');
    if (draw) { ctx.fillStyle = INK; ctx.fillText(text, x, y); }
    return size * 1.3;
  }
  function wrapLines(ctx, text, width) {
    const lines = [];
    let current = '';
    for (const word of text.split(/\s+/).filter(Boolean)) {
      if (ctx.measureText(word).width > width) throw new Error('A word is too long to fit. Shorten the text.');
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width > width && current) { lines.push(current); current = word; } else current = next;
    }
    if (current) lines.push(current);
    return lines;
  }
  // clip: shorten to maxLines with an ellipsis (bios, descriptions); otherwise too many lines is an error.
  function wrap(ctx, text, x, y, size, width, maxLines, draw, { weight = 400, mono = false, clip = false, leading = 1.3 } = {}) {
    font(ctx, size, mono, weight);
    let lines = wrapLines(ctx, text, width);
    if (lines.length > maxLines) {
      if (!clip) throw new Error('Too much text for this size. Shorten the supporting line or choose a taller size.');
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1];
      while (last && ctx.measureText(`${last}…`).width > width) last = last.replace(/\s*\S+$/, '');
      lines[maxLines - 1] = `${last.replace(/[,;:.]$/, '')}…`;
    }
    if (draw) { ctx.fillStyle = INK; lines.forEach((text, i) => ctx.fillText(text, x, y + i * size * leading)); }
    return lines.length * size * leading;
  }

  // Shristi's frame, scaled evenly (never stretched) around the two Cs, clipped to the box.
  function artwork(ctx, state, art, box) {
    const [x, y, w, h] = box;
    if (w < 1 || h < 1) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const focus = art.focus;
    const pad = 0.14;
    const region = { x: focus.x - focus.w * pad, y: focus.y - focus.h * pad, w: focus.w * (1 + 2 * pad), h: focus.h * (1 + 2 * pad) };
    const s = Math.min(w / region.w, h / region.h);
    const ox = x + w / 2 - (region.x + region.w / 2) * s;
    const oy = y + h / 2 - (region.y + region.h / 2) * s;
    if (art.background) {
      const b = art.background;
      const tileW = b.tileW * s, tileH = b.tileH * s;
      const percent = (value, room) => (String(value).endsWith('%') ? parseFloat(value) / 100 * room : parseFloat(value) || 0);
      const startX = ox + percent(b.posX, art.width - b.tileW) * s;
      const startY = oy + percent(b.posY, art.height - b.tileH) * s;
      const firstX = startX - Math.ceil((startX - x) / tileW) * tileW;
      const firstY = startY - Math.ceil((startY - y) / tileH) * tileH;
      for (let ty = firstY; ty < y + h; ty += tileH) for (let tx = firstX; tx < x + w; tx += tileW) ctx.drawImage(b.image, tx, ty, tileW, tileH);
    }
    for (const layer of art.layers) ctx.drawImage(layer.image, ox + layer.x * s, oy + layer.y * s, layer.w * s, layer.h * s);
    // "10 years of …": on the homepage these sit on shapes, confetti and tiles, which is fine at
    // screen size and hard to read on a poster. Keep her placement, but set them in ink on a
    // small backing, at a readable size. In a small artwork band they would cover the Cs, so skip them.
    if (state.labels && h >= 120) {
      for (const label of art.labels) {
        const size = Math.max(label.size * s, Math.min(15, h * 0.055));
        ctx.font = `600 ${size}px "Anybody"`;
        ctx.textBaseline = 'middle';
        const width = ctx.measureText(label.text).width;
        const cx = ox + (label.x + label.w / 2) * s;
        const cy = oy + (label.y + label.h / 2) * s;
        const padX = size * 0.45, padY = size * 0.3;
        ctx.fillStyle = BACKGROUNDS[state.background];
        ctx.beginPath(); ctx.roundRect(cx - width / 2 - padX, cy - size / 2 - padY, width + padX * 2, size + padY * 2, size * 0.25); ctx.fill();
        ctx.fillStyle = INK;
        ctx.fillText(label.text, cx - width / 2, cy + size * 0.04);
      }
    }
    ctx.restore();
  }

  function portrait(ctx, image, name, x, y, d) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2); ctx.clip();
    if (image) {
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      ctx.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 4, side, side, x, y, d, d);
    } else {
      ctx.fillStyle = '#d6d6d0'; ctx.fillRect(x, y, d, d);
      font(ctx, d * 0.34, false, 600); ctx.fillStyle = INK; ctx.textAlign = 'center';
      ctx.fillText(name.split(/\s+/).map(part => part[0]).slice(0, 2).join(''), x + d / 2, y + d * 0.32);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  // One person: photo beside name, pronouns and short bio.
  function card(ctx, person, x, y, width, d, sizes, bios, bioLines, draw) {
    const textX = x + d + Math.max(12, d * 0.18);
    const textW = width - (textX - x);
    if (draw) portrait(ctx, person.image, person.name, x, y, d);
    let h = wrap(ctx, person.name, textX, y, sizes.name, textW, 2, draw, { weight: 600, leading: 1.15 });
    if (person.pronouns) h += line(ctx, person.pronouns, textX, y + h + 2, sizes.small, textW, draw, true) + 4;
    if (bios && person.bio) h += wrap(ctx, person.bio, textX, y + h + 4, sizes.bio, textW, bioLines, draw, { clip: true, leading: 1.35 }) + 4;
    return Math.max(d, h);
  }

  // People for spotlights. Panels are a grid of cards; keynotes and sessions a list.
  function people(ctx, feature, x, y, width, compact, bios, draw) {
    const list = feature.people;
    if (!list.length) return 0;
    if (feature.kind === 'panel' || (!bios && list.length > 1)) {
      const columns = feature.kind === 'panel' && bios ? 2 : Math.min(list.length, 4);
      const gap = compact ? 16 : 28;
      const cell = (width - gap * (columns - 1)) / columns;
      if (bios) {
        const d = compact ? 48 : Math.min(96, cell * 0.28);
        const sizes = compact ? { name: 13, small: 9, bio: 10 } : { name: 20, small: 12, bio: 14 };
        let height = 0;
        for (let row = 0; row < list.length; row += columns) {
          const heights = list.slice(row, row + columns).map((person, i) => card(ctx, person, x + i * (cell + gap), y + height, cell, d, sizes, true, 3, draw));
          height += Math.max(...heights) + gap;
        }
        return height - gap;
      }
      // Portraits in a row with names underneath.
      const d = Math.min(compact ? 64 : 120, cell * 0.8);
      let height = 0;
      list.forEach((person, i) => {
        const cx = x + (i % columns) * (cell + gap);
        if (draw) portrait(ctx, person.image, person.name, cx, y, d);
        let h = d + 10;
        h += wrap(ctx, person.name, cx, y + h, compact ? 13 : 20, cell, 2, draw, { weight: 600, leading: 1.2 });
        if (person.pronouns) h += line(ctx, person.pronouns, cx, y + h + 2, compact ? 9 : 13, cell, draw, true);
        height = Math.max(height, h);
      });
      return height;
    }
    const many = list.length > 1;
    const d = compact ? (many ? 52 : 80) : (many ? 96 : 150);
    const sizes = compact ? { name: 15, small: 10, bio: 11 } : { name: many ? 22 : 30, small: 14, bio: many ? 16 : 19 };
    let height = 0;
    for (const person of list) height += card(ctx, person, x, y + height, width, d, sizes, bios, compact ? 2 : many ? 3 : 4, draw) + (compact ? 10 : 20);
    return height - (compact ? 10 : 20);
  }

  // Date, facts, times, and for spotlights the kicker, title and description. Square and
  // landscape leave the description out: at those sizes it is too small to read.
  function info(ctx, state, content, x, y, width, big, draw) {
    const describe = state.format !== 'square' && state.format !== 'landscape';
    const start = y;
    const feature = content.feature;
    const letters = content.lettering;
    if (letters) {
      // Her event title sets the date in Bold and the year in Thin Italic; the poster uses those two runs.
      const [dateRun, yearRun] = letters.eventTitle.slice(-2);
      y += lettered(ctx, [{ ...dateRun, text: `${content.date}, ` }, { ...yearRun, text: content.year }], x, y, big ? 56 : 30, width, draw) - (big ? 4 : 2);
    } else y += line(ctx, content.date, x, y, big ? 56 : 30, width, draw, false, 600) - (big ? 6 : 2);
    y += line(ctx, content.facts, x, y + 4, big ? 21 : 15, width, draw, true) + 4;
    if (state.times && content.times.length) {
      for (const time of content.times) y += line(ctx, time, x, y, big ? 19 : 14, width, draw, true);
      y += 3;
    }
    if (feature) {
      if (letters) {
        const heading = singular(feature.kind === 'keynote' ? letters.keynotes : letters.sessions);
        y += lettered(ctx, heading, x, y + (big ? 12 : 8), big ? 40 : 17, width, draw) + (big ? 6 : 2);
        // Landscape keeps her heading and drops the tags line for room.
        if (feature.kicker && feature.kind !== 'keynote' && big) y += line(ctx, feature.kicker, x, y + 4, big ? 15 : 11, width, draw, true) + 6;
      } else if (feature.kicker) y += line(ctx, feature.kicker, x, y + 10, big ? 15 : 11, width, draw, true) + 8;
      if (feature.title) y += wrap(ctx, feature.title, x, y + 4, big ? 34 : 19, width, 3, draw, { weight: 600, leading: 1.15 }) + 6;
      if (feature.description && describe) y += wrap(ctx, feature.description, x, y + 6, big ? 19 : 12, width, big ? 4 : 3, draw, { clip: true, leading: 1.35 }) + 8;
    }
    return y - start;
  }

  function copy(ctx, state, content, x, y, width, big, draw) {
    let h = 0;
    if (state.template === 'community') {
      const letters = content.lettering;
      if (letters) {
        // Her two-line "Creative coding / for everyone." at her 110% line height.
        const run = letters.community[0];
        const size = big ? 40 : 18;
        for (const part of run.text.split('\n')) h += lettered(ctx, [{ ...run, text: part }], x, y + h, size, width, draw) / 1.2 * (run.lineHeight || 1.1);
        h += 8;
      } else h += wrap(ctx, 'Creative coding for everyone.', x, y, big ? 26 : 16, width, 2, draw, { weight: 600 }) + 6;
    }
    if (state.copy) h += wrap(ctx, state.copy, x, y + h, big ? 24 : 14, width, 3, draw);
    return h;
  }

  // A block drawn at its automatic place, then moved/resized by the person's layout edits.
  // `fit` is the automatic text scale a tight layout applies before the person's own resizing.
  function place(ctx, frame, id, box, draw, fit = 1) {
    const t = frame.layout[id] || { x: 0, y: 0, s: 1 };
    const s = t.s * fit;
    const [x, y, w, h] = box;
    frame.boxes.push({ id, label: BLOCKS[id], x: x + t.x, y: y + t.y, w: w * s, h: h * s });
    ctx.save();
    ctx.translate(x + t.x, y + t.y); ctx.scale(s, s); ctx.translate(-x, -y);
    draw();
    ctx.restore();
  }
  const scaleOf = (frame, id) => (frame.layout[id] ? frame.layout[id].s : 1);

  // Tall sizes: wordmark on top, artwork filling the middle, text stacked at the bottom.
  function tallLayout(ctx, state, art, content, assets, frame, attempt, draw) {
    const { footer } = frame;
    const feature = content.feature;
    const logoW = attempt.logo, logoH = logoW * assets.logoRatio;
    const logoBottom = 90 + logoH * scaleOf(frame, 'logo');
    const textWidth = state.qr ? 720 : 900;
    const infoH = info(ctx, state, content, 50, 0, textWidth, true, false);
    const peopleH = feature ? people(ctx, feature, 50, 0, textWidth, attempt.compact, state.bios, false) : 0;
    const copyH = copy(ctx, state, content, 50, 0, textWidth, true, false);
    const gap = 14;
    const fit = attempt.text || 1;
    const sInfo = scaleOf(frame, 'info') * fit, sPeople = scaleOf(frame, 'people') * fit, sCopy = scaleOf(frame, 'copy') * fit;
    const stack = infoH * sInfo + (peopleH ? peopleH * sPeople + gap : 0) + (copyH ? copyH * sCopy + gap : 0);
    const top = footer - 24 - stack;
    const artTop = logoBottom + 12;
    const artH = top - 20 - artTop;
    const minArt = feature ? 150 : 220;
    if (!draw) return artH >= minArt ? artH : -1;
    place(ctx, frame, 'logo', [50, 90, logoW, logoH], () => ctx.drawImage(assets.logo, 50, 90, logoW, logoH));
    place(ctx, frame, 'art', [0, artTop, 1000, Math.max(artH, 60)], () => artwork(ctx, state, art, [0, artTop, 1000, Math.max(artH, 60)]));
    let y = top;
    place(ctx, frame, 'info', [50, y, textWidth, infoH], () => info(ctx, state, content, 50, y, textWidth, true, true), fit);
    y += infoH * sInfo + gap;
    if (peopleH) {
      const py = y;
      place(ctx, frame, 'people', [50, py, textWidth, peopleH], () => people(ctx, feature, 50, py, textWidth, attempt.compact, state.bios, true), fit);
      y += peopleH * sPeople + gap;
    }
    if (copyH) { const cy = y; place(ctx, frame, 'copy', [50, cy, textWidth, copyH], () => copy(ctx, state, content, 50, cy, textWidth, true, true), fit); }
    if (artH < minArt) frame.problems.push('The text is crowding out the artwork. Drag a corner of a text block to make it smaller, turn off bios or times, or choose a taller size.');
    return artH;
  }

  // Landscape: wordmark and details on the left; artwork, then any people, on the right.
  function landscapeLayout(ctx, state, art, content, assets, frame) {
    const { footer } = frame;
    const feature = content.feature;
    const logoW = 410, logoH = logoW * assets.logoRatio;
    place(ctx, frame, 'logo', [50, 70, logoW, logoH], () => ctx.drawImage(assets.logo, 50, 70, logoW, logoH));
    let y = 70 + logoH * scaleOf(frame, 'logo') + 22;
    const infoH = info(ctx, state, content, 50, y, 480, false, false);
    const copyH = copy(ctx, state, content, 50, y, 480, false, false);
    // Shrink the left column (down to 70%) before reporting that it runs into the footer.
    const leftH = infoH * scaleOf(frame, 'info') + (copyH ? 8 + copyH * scaleOf(frame, 'copy') : 0);
    const leftFit = Math.min(1, Math.max(0.7, (footer - 12 - y) / leftH));
    const iy = y;
    place(ctx, frame, 'info', [50, iy, 480, infoH], () => info(ctx, state, content, 50, iy, 480, false, true), leftFit);
    y += infoH * scaleOf(frame, 'info') * leftFit + 8;
    if (copyH) { const cy = y; place(ctx, frame, 'copy', [50, cy, 480, copyH], () => copy(ctx, state, content, 50, cy, 480, false, true), leftFit); y += copyH * scaleOf(frame, 'copy') * leftFit; }
    if (y > footer - 12) frame.problems.push('The details run into the footer. Drag a corner of a text block to make it smaller, hide the times, or choose a taller size.');
    const floor = footer - (state.qr ? 110 : 20);
    const peopleH = feature ? people(ctx, feature, 560, 0, 390, true, state.bios, false) : 0;
    // Likewise shrink the people (down to 60%) to leave the artwork at least 110 units.
    const peopleFit = peopleH ? Math.min(1, Math.max(0.6, (floor - 60 - 110 - 16) / (peopleH * scaleOf(frame, 'people')))) : 1;
    const peopleShown = peopleH * scaleOf(frame, 'people') * peopleFit;
    const artH = floor - 60 - (peopleH ? peopleShown + 16 : 0);
    const artBox = [560, 60, feature ? 390 : 410, Math.max(artH, 60)];
    place(ctx, frame, 'art', artBox, () => artwork(ctx, state, art, artBox));
    if (peopleH) { const py = floor - peopleShown; place(ctx, frame, 'people', [560, py, 390, peopleH], () => people(ctx, feature, 560, py, 390, true, state.bios, true), peopleFit); }
    if (artH < 100) frame.problems.push('The people crowd out the artwork. Drag a corner of the people block to make it smaller, or turn off bios.');
  }

  // Draws the poster. Returns the blocks' final boxes (for the editor's handles) and any layout problems.
  function render(ctx, state, art, content, assets, width, height) {
    const format = FORMATS[state.format];
    const H = format.height / format.width * 1000;
    const bottom = format.paper ? 20 : 0; // Keep print credits inside a 1/4-inch safe area.
    const landscape = state.format === 'landscape';
    const margin = 50;
    const frame = { H, footer: H - bottom - 79, layout: (state.layout && state.layout[state.format]) || {}, boxes: [], problems: [] };
    ctx.save();
    try {
      ctx.scale(width / 1000, height / H);
      ctx.fillStyle = BACKGROUNDS[state.background]; ctx.fillRect(0, 0, 1000, H);
      line(ctx, `VIRTUAL / ${content.year}`, margin, 34, 15, 300, true, true);
      line(ctx, content.edition, landscape ? 610 : 660, 34, 14, 300, true, true);
      if (landscape) landscapeLayout(ctx, state, art, content, assets, frame);
      else {
        // Spotlights that don't fit try a smaller wordmark, then smaller portraits; keep the
        // full wordmark unless that leaves the artwork too small to be the centrepiece.
        const attempts = content.feature
          ? [{ logo: 900, compact: false }, { logo: 640, compact: false }, { logo: 640, compact: true }, { logo: 640, compact: true, text: 0.85 }]
          : [{ logo: 900, compact: false }, { logo: 640, compact: false }];
        const sized = attempts.map(attempt => ({ attempt, art: tallLayout(ctx, state, art, content, assets, frame, attempt, false) })).filter(option => option.art > 0);
        const readable = sized.filter(option => !option.attempt.compact);
        const pick = readable.find(option => option.art >= 280) || [...readable].sort((a, b) => b.art - a.art)[0] || sized[0];
        tallLayout(ctx, state, art, content, assets, frame, pick ? pick.attempt : attempts[attempts.length - 1], true);
      }
      ctx.fillStyle = INK; ctx.fillRect(margin, frame.footer, 900, 1);
      line(ctx, content.site, margin, frame.footer + 19, landscape ? 22 : 27, 670, true, false, 600);
      line(ctx, content.cost ? `REGISTER ${content.cost.toUpperCase()}` : 'REGISTER', landscape ? 757 : 760, frame.footer + 24, 15, 190, true, true);
      line(ctx, content.credits, margin, frame.footer + 57, 10, 900, true, true);
      if (state.qr) {
        const size = landscape ? 82 : 145;
        const box = [950 - size, frame.footer - 17 - size, size, size];
        place(ctx, frame, 'qr', box, () => ctx.drawImage(assets.qr, ...box));
      }
      for (const box of frame.boxes) {
        if (box.id === 'art') continue;
        if (box.x < -2 || box.y < -2 || box.x + box.w > 1002 || box.y + box.h > H + 2) frame.problems.push(`The ${box.label.toLowerCase()} runs off the edge of the poster.`);
      }
    } finally { ctx.restore(); }
    return { boxes: frame.boxes, problems: frame.problems, H };
  }

  const API = { VERSION, FORMATS, BACKGROUNDS, MODES, TEMPLATES, BLOCKS, DEFAULTS, validate, render };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.CCPosterArt = API;
})(typeof window === 'object' ? window : globalThis);
