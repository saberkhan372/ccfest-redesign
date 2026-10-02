/* Host-owned. Design families for the poster maker: each registers a complete portrait
 * composition with poster-art.js (CCPosterArt.registerDesign) and draws it in the renderer's
 * 1000-unit space, so preview and export stay identical. Shristi's artwork is never recoloured:
 * it sits on paper, and the colour comes from bands around it (the way the event page uses them).
 * Ink goes on lime, orange and paper; white goes on blue (white on orange is only 3.3:1). */
(function (root) {
  'use strict';
  const A = root.CCPosterArt;
  if (!A || !A.registerDesign) return;
  const { font, line, wrap, wrapLines, lettered, singular, portrait, artwork, place, COLORS, BACKGROUNDS } = A.kit;
  const M = 50; // side margin on the 1000-unit poster
  const WIDTH = 1000 - 2 * M;

  const mono = (ctx, size, weight = 500) => font(ctx, size, true, weight);
  // Records a text/background pair (palette names) so the proof can report its contrast.
  const pair = (frame, fg, bg) => frame.pairs.add(`${fg}/${bg}`);

  function right(ctx, text, edge, y, size, color, weight = 500) {
    mono(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.fillText(text, edge - ctx.measureText(text).width, y);
  }
  function centered(ctx, text, cx, y, size, color, isMono = true, weight = 500) {
    font(ctx, size, isMono, weight);
    ctx.fillStyle = color;
    ctx.fillText(text, cx - ctx.measureText(text).width / 2, y);
  }
  // The top line: "VIRTUAL / 2026" left, the edition right.
  function meta(ctx, content, frame, color, bg, y = 36, size = 19) {
    mono(ctx, size);
    ctx.fillStyle = COLORS[color];
    ctx.fillText(`VIRTUAL / ${content.year}`, M, y);
    right(ctx, content.edition, 1000 - M, y, size, COLORS[color]);
    pair(frame, color, bg);
  }
  const wordmarkIn = (assets, color) => (color === 'white' && assets.logoWhite) || assets.logo;
  const base = state => (state.background === 'white' ? 'white' : 'paper');

  // Free · Online · All levels, as outlined capsules. Returns the height of the rows used.
  function chips(ctx, items, x, y, maxWidth, size, color, draw) {
    mono(ctx, size, 600);
    const padX = size * 0.85, padY = size * 0.5, gap = size * 0.6;
    const rowHeight = size + padY * 2;
    let cx = x, cy = y;
    for (const item of items) {
      const text = item.toUpperCase();
      const w = ctx.measureText(text).width + padX * 2;
      if (cx > x && cx + w > x + maxWidth) { cx = x; cy += rowHeight + gap; }
      if (draw) {
        ctx.lineWidth = 2; ctx.strokeStyle = color;
        ctx.beginPath(); ctx.roundRect(cx + 1, cy + 1, w - 2, rowHeight - 2, rowHeight / 2); ctx.stroke();
        ctx.fillStyle = color; ctx.fillText(text, cx + padX, cy + padY + size * 0.04);
      }
      cx += w + gap;
    }
    return cy + rowHeight - y;
  }
  const facts = content => content.facts.split(' · ').filter(Boolean);

  // Time lines in mono: "9:00 am–12:30 pm PT". Optional, like the editor's Times switch.
  function timeLines(ctx, state, content, x, y, size, width, color, draw) {
    if (!state.times || !content.times.length) return 0;
    let h = 0;
    for (const text of content.times) h += line(ctx, text, x, y + h, size, width, draw, true, 500, color);
    return h;
  }
  // Both zones on one line, for footers that have the room: "9:00 am–12:30 pm PT  ·  12:00 pm–3:30 pm ET".
  function timeInline(ctx, state, content, x, y, size, width, color, draw) {
    if (!state.times || !content.times.length) return 0;
    return line(ctx, content.times.join('  ·  '), x, y, size, width, draw, true, 500, color);
  }

  // Francisca's date line (Bold date, Thin Italic year), or plain bold Anybody without her data.
  function dateLine(ctx, content, x, y, size, width, draw, color, weekday = true) {
    const text = weekday ? content.date : content.date.split(', ').slice(1).join(', ');
    const letters = content.lettering;
    if (letters) {
      const [dateRun, yearRun] = letters.eventTitle.slice(-2);
      return lettered(ctx, [{ ...dateRun, text: `${text}, ` }, { ...yearRun, text: content.year }], x, y, size, width, draw, color);
    }
    return line(ctx, `${text}, ${content.year}`, x, y, size, width, draw, false, 700, color) * 0.92;
  }

  // Heavy numerals fitted to a width, positioned by their ink so they sit exactly on a band.
  function numerals(ctx, text, x, edge, baseline, content, color, draw) {
    const family = content.lettering ? '"CCF Anybody 100"' : '"Anybody"';
    ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
    ctx.font = `900 200px ${family}`;
    const probe = ctx.measureText(text);
    const size = 200 * (edge - x) / (probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight);
    ctx.font = `900 ${size}px ${family}`;
    const m = ctx.measureText(text);
    if (draw) { ctx.fillStyle = color; ctx.fillText(text, x + m.actualBoundingBoxLeft, baseline); }
    ctx.textBaseline = 'top';
    return { size, top: baseline - m.actualBoundingBoxAscent, bottom: baseline + m.actualBoundingBoxDescent };
  }

  // The largest size that sets `text` in at most `maxLines` lines. Titles are never clipped.
  function fitTitle(ctx, text, width, maxLines, sizes, weight = 700, leading = 1.06, maxHeight = Infinity) {
    for (const size of sizes) {
      font(ctx, size, false, weight);
      let lines;
      try { lines = wrapLines(ctx, text, width); } catch (_) { continue; }
      if (lines.length <= maxLines && lines.length * size * leading <= maxHeight) return { size, lines, leading, weight, height: lines.length * size * leading };
    }
    return null;
  }
  // A name on one line at the largest size that fits; two lines only when none does.
  function fitName(ctx, name, width, sizes, weight = 600, leading = 1.08) {
    for (const size of sizes) {
      font(ctx, size, false, weight);
      if (ctx.measureText(name).width <= width) return { size, lines: [name], leading, weight, height: size * leading };
    }
    const wrapped = fitTitle(ctx, name, width, 2, sizes, weight, leading) || fitTitle(ctx, name, width, 3, sizes.slice(-1), weight, leading);
    if (wrapped) return wrapped;
    // An unbreakable or enormous name: one line at the smallest size, cut with an ellipsis, and flagged.
    const size = sizes[sizes.length - 1];
    font(ctx, size, false, weight);
    let cut = name;
    while (cut.length > 1 && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
    return { size, lines: [`${cut}…`], leading, weight, height: size * leading, overflow: true };
  }
  // fitName for drawing: a name that cannot fit becomes a layout problem the editor reports.
  function nameFit(ctx, frame, name, width, sizes) {
    const fit = fitName(ctx, name, width, sizes);
    if (fit.overflow) frame.problems.push(`The name "${name}" is too long for this design. Shorten it for this poster only.`);
    return fit;
  }
  function drawLines(ctx, fit, x, y, width, color, align = 'left') {
    font(ctx, fit.size, false, fit.weight);
    ctx.fillStyle = color;
    fit.lines.forEach((text, n) => ctx.fillText(text, align === 'center' ? x + (width - ctx.measureText(text).width) / 2 : x, y + n * fit.size * fit.leading));
  }

  // Footer text: the address, optionally "REGISTER FREE", and the credits. `color` and `bg` are
  // palette names; `edge` keeps the text clear of a QR code at the right.
  function footerText(ctx, content, frame, { y, color, bg, edge = 1000 - M, urlSize = 28, label = false, credits = true }) {
    const hex = COLORS[color];
    line(ctx, content.site, M, y, urlSize, edge - M, true, false, 600, hex);
    const register = content.cost ? `REGISTER ${content.cost.toUpperCase()}` : 'REGISTER';
    if (label === 'right') right(ctx, register, 1000 - M, y + urlSize * 0.3, 15, hex);
    else if (label) line(ctx, register, M, y + urlSize * 1.3 + 2, 15, 300, true, true, 500, hex);
    if (credits) line(ctx, content.credits, M, frame.H - 30, 11, edge - M, true, true, 400, hex);
    pair(frame, color, bg);
  }
  const qrBlock = (ctx, assets, frame, box) => place(ctx, frame, 'qr', box, () => ctx.drawImage(assets.qr, ...box));

  // Artwork on a paper-coloured tile, so its shapes keep the colours they were drawn in.
  function artTile(ctx, state, art, box, frame, pad = 0.05) {
    place(ctx, frame, 'art', box, () => { ctx.fillStyle = BACKGROUNDS[state.background]; ctx.fillRect(...box); artwork(ctx, state, art, box, pad); });
  }
  const clipNote = (frame, person) => () => frame.notes.push(`Bio for ${person.name} is clipped.`);

  /* ── 1 · Signature ─────────────────────────────────────────────────── */
  A.registerDesign('signature', {
    label: 'Signature',
    use: 'General announcement',
    formats: ['portrait'],
    summary: 'The wordmark, then the animation at full width, then the date: the site\'s own order, on paper. The artwork gets the most room; everything else stays quiet.',
    limits: 'Date, facts and times come from the event data; one supporting line of up to 100 characters.',
    draw(ctx, state, art, content, assets, frame) {
      const bg = base(state), ink = COLORS.ink;
      meta(ctx, content, frame, 'ink', bg);
      const logoW = 820, logoH = logoW * assets.logoRatio;
      place(ctx, frame, 'logo', [M, 84, logoW, logoH], () => ctx.drawImage(assets.logo, M, 84, logoW, logoH));
      const artTop = 84 + logoH + 8;
      const artBox = [0, artTop, 1000, 870 - artTop];
      place(ctx, frame, 'art', artBox, () => artwork(ctx, state, art, artBox, 0.05));
      const textW = state.qr ? 740 : WIDTH;
      // The supporting line, when there is one, sits between the artwork and the date.
      let y = 886;
      if (state.copy) {
        const copyY = y;
        const copyH = wrap(ctx, state.copy, M, copyY, 25, textW, 2, false, { leading: 1.25, clip: true });
        place(ctx, frame, 'copy', [M, copyY, textW, copyH], () => wrap(ctx, state.copy, M, copyY, 25, textW, 2, true, { leading: 1.25, clip: true, onClip: () => frame.notes.push('Supporting line is clipped.') }));
        y += copyH + 16;
      } else y += 24;
      const dateY = y;
      place(ctx, frame, 'date', [M, dateY, textW, 74], () => dateLine(ctx, content, M, dateY, 64, textW, true, ink));
      y += 80;
      const infoY = y;
      let infoBottom = y;
      place(ctx, frame, 'info', [M, infoY, textW, 100], () => {
        const h = chips(ctx, facts(content), M, infoY, textW, 20, ink, true);
        infoBottom = infoY + h + 12 + timeLines(ctx, state, content, M, infoY + h + 12, 24, textW, ink, true);
      });
      if (infoBottom > 1160) frame.problems.push('The details run into the footer. Turn off the times or shorten the supporting line.');
      pair(frame, 'ink', bg);
      ctx.fillStyle = ink; ctx.fillRect(M, 1166, WIDTH, 1);
      footerText(ctx, content, frame, { y: 1182, color: 'ink', bg, edge: 800, urlSize: 30, label: 'right' });
      if (state.qr) qrBlock(ctx, assets, frame, [820, 1026, 130, 130]);
    }
  });

  /* ── 2 · Bold date ─────────────────────────────────────────────────── */
  A.registerDesign('bold-date', {
    label: 'Bold date',
    use: 'Reminders and countdown posts',
    formats: ['portrait'],
    summary: 'The date is the picture. A lime band carries a giant 17; a small paper tile keeps the animation; a blue band closes with a one-line invitation and the QR code.',
    limits: 'No supporting copy. The date, facts, times and the registration address come from the event data.',
    draw(ctx, state, art, content, assets, frame) {
      const bg = base(state);
      ctx.fillStyle = COLORS.lime; ctx.fillRect(0, 0, 1000, 650);
      ctx.fillStyle = COLORS.blue; ctx.fillRect(0, 960, 1000, frame.H - 960);
      meta(ctx, content, frame, 'ink', 'lime');
      const logoW = 360, logoH = logoW * assets.logoRatio;
      place(ctx, frame, 'logo', [M, 84, logoW, logoH], () => ctx.drawImage(assets.logo, M, 84, logoW, logoH));
      const [weekday, monthDay] = content.date.split(', ');
      const [month, day] = [monthDay.split(' ')[0], monthDay.split(' ').slice(1).join(' ')];
      mono(ctx, 24, 600); ctx.fillStyle = COLORS.ink;
      ctx.fillText(weekday.toUpperCase(), M, 232);
      place(ctx, frame, 'date', [M, 270, WIDTH, 340], () => {
        const numeral = numerals(ctx, day, M, 610, 600, content, COLORS.ink, true);
        // The month and the year, stacked beside the numerals.
        const letters = content.lettering;
        const colX = 650, colW = 1000 - M - colX;
        if (letters) {
          const [dateRun, yearRun] = letters.eventTitle.slice(-2);
          const h = lettered(ctx, [{ ...dateRun, text: month }], colX, numeral.top, 92, colW, true, COLORS.ink);
          lettered(ctx, [{ ...yearRun, text: content.year }], colX, numeral.top + h, 92, colW, true, COLORS.ink);
        } else {
          line(ctx, month, colX, numeral.top, 56, colW, true, false, 700, COLORS.ink);
          line(ctx, content.year, colX, numeral.top + 70, 56, colW, true, false, 300, COLORS.ink);
        }
      });
      pair(frame, 'ink', 'lime');
      // Paper zone: the animation on a tile, the facts and times beside it.
      artTile(ctx, state, art, [0, 650, 520, 310], frame, 0.04);
      const x = 560, w = 1000 - M - x;
      place(ctx, frame, 'info', [x, 700, w, 230], () => {
        let h = chips(ctx, facts(content), x, 700, w, 19, COLORS.ink, true) + 28;
        mono(ctx, 15, 600); ctx.fillStyle = COLORS.ink; ctx.fillText('TIMES', x, 700 + h); h += 30;
        timeLines(ctx, state, content, x, 700 + h, 28, w, COLORS.ink, true);
      });
      pair(frame, 'ink', bg);
      // The invitation.
      place(ctx, frame, 'cta', [M, 992, 700, 100], () => {
        const word = `Register ${(content.cost || '').toLowerCase()}`.trim();
        const letters = content.lettering;
        if (letters) lettered(ctx, [{ ...letters.eventTitle[letters.eventTitle.length - 2], text: word }], M, 992, 84, 680, true, COLORS.white);
        else line(ctx, word, M, 992, 72, 680, true, false, 800, COLORS.white);
      });
      footerText(ctx, content, frame, { y: 1104, color: 'white', bg: 'blue', edge: state.qr ? 760 : 1000 - M, urlSize: 32 });
      if (state.qr) qrBlock(ctx, assets, frame, [780, 1000, 170, 170]);
    }
  });

  /* ── 3 · Art-led ───────────────────────────────────────────────────── */
  A.registerDesign('art-led', {
    label: 'Art-led',
    use: 'Social promotion, where the animation does the talking',
    formats: ['portrait'],
    summary: 'The animation is oversized and the copy is almost nothing: the date on an orange band, three facts, a QR code. Made to be noticed in a feed.',
    limits: 'The date, three facts and the address only. No times, no supporting line.',
    draw(ctx, state, art, content, assets, frame) {
      const bg = base(state);
      meta(ctx, content, frame, 'ink', bg);
      const logoW = 300, logoH = logoW * assets.logoRatio;
      place(ctx, frame, 'logo', [M, 70, logoW, logoH], () => ctx.drawImage(assets.logo, M, 70, logoW, logoH));
      const artTop = 70 + logoH + 6;
      const artBox = [0, artTop, 1000, 880 - artTop];
      place(ctx, frame, 'art', artBox, () => artwork(ctx, state, art, artBox, 0.025));
      ctx.fillStyle = COLORS.orange; ctx.fillRect(0, 880, 1000, frame.H - 880);
      place(ctx, frame, 'date', [M, 916, WIDTH, 120], () => dateLine(ctx, content, M, 916, 104, WIDTH, true, COLORS.ink, false));
      pair(frame, 'ink', 'orange');
      place(ctx, frame, 'info', [M, 1040, 600, 40], () => chips(ctx, facts(content), M, 1040, state.qr ? 700 : WIDTH, 21, COLORS.ink, true));
      footerText(ctx, content, frame, { y: 1128, color: 'ink', bg: 'orange', edge: state.qr ? 770 : 1000 - M, urlSize: 32 });
      if (state.qr) qrBlock(ctx, assets, frame, [790, 1040, 160, 160]);
    }
  });

  /* ── 4 · Speaker-led ───────────────────────────────────────────────── */
  A.registerDesign('speaker-led', {
    label: 'Speaker-led',
    use: 'Keynotes: one speaker, or a pair',
    formats: ['portrait'],
    summary: 'Portraits and names are the poster. A blue band holds them under Francisca\'s "Keynotes"; the animation shrinks to a tile; a lime band carries the address and QR code.',
    limits: 'One or two speakers. Short bios are optional (off in the pair proof) and are clipped, with a note, when they do not fit.',
    draw(ctx, state, art, content, assets, frame) {
      const bg = base(state);
      const feature = content.feature;
      const people = feature ? feature.people.slice(0, 2) : [];
      if (!people.length) throw new Error('Choose a keynote speaker.');
      if (feature.people.length > 2) frame.problems.push('This design shows two speakers. Choose one or two.');
      const pairUp = people.length === 2;
      ctx.fillStyle = COLORS.blue; ctx.fillRect(0, 0, 1000, 800);
      ctx.fillStyle = COLORS.lime; ctx.fillRect(0, 1090, 1000, frame.H - 1090);
      meta(ctx, content, frame, 'white', 'blue');
      const logoW = 300, logoH = logoW * assets.logoRatio;
      place(ctx, frame, 'logo', [M, 76, logoW, logoH], () => ctx.drawImage(wordmarkIn(assets, 'white'), M, 76, logoW, logoH));
      const letters = content.lettering;
      place(ctx, frame, 'title', [M, 196, 600, 100], () => {
        if (letters) lettered(ctx, pairUp ? letters.keynotes : singular(letters.keynotes), M, 196, 92, 900, true, COLORS.white);
        else line(ctx, pairUp ? 'Keynotes' : 'Keynote', M, 196, 80, 900, true, false, 700, COLORS.white);
      });
      pair(frame, 'white', 'blue');
      const white = COLORS.white, py = 330;
      const ring = (cx, cy, d) => { ctx.lineWidth = 4; ctx.strokeStyle = white; ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 2, 0, Math.PI * 2); ctx.stroke(); };
      if (pairUp) {
        // Both names at the size the longer one allows, so the pair reads as equals.
        const colW = 420, d = state.bios ? 270 : 330;
        const nameSize = Math.min(...people.map(person => fitName(ctx, person.name, colW, [48, 44, 40, 36, 32]).size));
        people.forEach((person, i) => {
          const x0 = i === 0 ? M : 1000 - M - colW, cx = x0 + colW / 2;
          place(ctx, frame, 'people', [x0, py, colW, 450], () => {
            portrait(ctx, person.image, person.name, cx - d / 2, py, d);
            ring(cx, py + d / 2, d);
            let y = py + d + 26;
            const name = nameFit(ctx, frame, person.name, colW, [nameSize]);
            drawLines(ctx, name, x0, y, colW, white, 'center'); y += name.height + 8;
            if (person.pronouns) { centered(ctx, person.pronouns, cx, y, 16, white); y += 28; }
            if (state.bios && person.bio) wrap(ctx, person.bio, x0, y + 4, 19, colW, 4, true, { clip: true, leading: 1.3, color: white, align: 'center', onClip: clipNote(frame, person) });
          });
        });
      } else {
        const person = people[0], d = 380, tx = M + d + 44, tw = 1000 - M - tx;
        place(ctx, frame, 'people', [M, py - 10, 900, d], () => {
          portrait(ctx, person.image, person.name, M, py - 10, d);
          ring(M + d / 2, py - 10 + d / 2, d);
          let y = py + 30;
          const name = nameFit(ctx, frame, person.name, tw, [60, 54, 48, 42]);
          drawLines(ctx, name, tx, y, tw, white); y += name.height + 12;
          if (person.pronouns) { mono(ctx, 18); ctx.fillStyle = white; ctx.fillText(person.pronouns, tx, y); y += 34; }
          if (state.bios && person.bio) wrap(ctx, person.bio, tx, y + 8, 26, tw, 7, true, { clip: true, leading: 1.35, color: white, onClip: clipNote(frame, person) });
        });
      }
      // Paper zone: the animation on a tile, the date and the facts beside it.
      artTile(ctx, state, art, [20, 820, 460, 260], frame, 0.04);
      const x = 510, w = 1000 - M - x;
      place(ctx, frame, 'date', [x, 846, w, 70], () => dateLine(ctx, content, x, 846, 52, w, true, COLORS.ink, false));
      place(ctx, frame, 'info', [x, 930, w, 140], () => {
        const h = chips(ctx, facts(content), x, 930, w, 17, COLORS.ink, true);
        timeLines(ctx, state, content, x, 930 + h + 14, 21, w, COLORS.ink, true);
      });
      pair(frame, 'ink', bg);
      footerText(ctx, content, frame, { y: 1118, color: 'ink', bg: 'lime', edge: state.qr ? 780 : 1000 - M, urlSize: 32 });
      if (state.qr) qrBlock(ctx, assets, frame, [810, 1105, 130, 130]);
    }
  });

  /* ── 5 · Program-led ───────────────────────────────────────────────── */
  A.registerDesign('program-led', {
    label: 'Program-led',
    use: 'A session or the panel',
    formats: ['portrait'],
    summary: 'The title is the poster, set as large as it will go on an orange band that grows to fit it. Presenters sit beneath with portraits; a four-person panel becomes a 2 × 2 grid.',
    limits: 'Titles up to about 70 characters (four lines). One presenter with a short bio and the opening of the description, or up to four in a grid.',
    draw(ctx, state, art, content, assets, frame) {
      const bg = base(state), ink = COLORS.ink;
      const feature = content.feature;
      if (!feature || !feature.title) throw new Error('Choose a session.');
      const list = feature.people.slice(0, 4);
      const title = fitTitle(ctx, feature.title, WIDTH, 5, [120, 108, 96, 84, 76, 68, 60, 54, 48, 44], 700, 1.06, list.length > 2 ? 290 : 440);
      if (!title) { frame.problems.push('This session title is too long for the poster. Shorten it for this poster only.'); return; }
      const bandBottom = Math.max(400, 150 + title.height + 56);
      ctx.fillStyle = COLORS.orange; ctx.fillRect(0, 0, 1000, bandBottom);
      meta(ctx, content, frame, 'ink', 'orange');
      // Kicker: the session's tags (Panel, Beginner …), fitted to the width.
      let kicker = feature.kicker || '';
      let size = 22;
      mono(ctx, size, 600);
      while (kicker && ctx.measureText(kicker).width > WIDTH && size > 14) { size -= 1; mono(ctx, size, 600); }
      if (kicker && ctx.measureText(kicker).width > WIDTH) { while (ctx.measureText(`${kicker}…`).width > WIDTH) kicker = kicker.slice(0, -1); kicker = `${kicker}…`; frame.notes.push('Session tags are shortened.'); }
      ctx.fillStyle = ink; ctx.fillText(kicker, M, 98);
      place(ctx, frame, 'title', [M, 150, WIDTH, title.height], () => drawLines(ctx, title, M, 150, WIDTH, ink));
      frame.notes.push(`Title set at ${title.size}px over ${title.lines.length} line${title.lines.length === 1 ? '' : 's'}.`);
      pair(frame, 'ink', 'orange');
      // People, and for one presenter the opening of the description and a tile of artwork.
      const top = bandBottom + 44, floor = 1040;
      if (list.length > 2) {
        const cell = (WIDTH - 40) / 2, d = 128, pitch = Math.min(262, (floor - top + 10) / 2);
        place(ctx, frame, 'people', [M, top, WIDTH, pitch * 2], () => {
          list.forEach((person, i) => {
            const cx = M + (i % 2) * (cell + 40), cy = top + Math.floor(i / 2) * pitch;
            portrait(ctx, person.image, person.name, cx, cy, d);
            const tx = cx + d + 22, tw = cell - d - 22;
            const name = nameFit(ctx, frame, person.name, tw, [34, 31, 28, 25]);
            drawLines(ctx, name, tx, cy + 22, tw, ink);
            if (person.pronouns) { mono(ctx, 15); ctx.fillStyle = ink; ctx.fillText(person.pronouns, tx, cy + 22 + name.height + 6); }
            if (state.bios && person.bio) wrap(ctx, person.bio, cx, cy + d + 14, 20, cell, 4, true, { clip: true, leading: 1.3, onClip: clipNote(frame, person) });
          });
        });
      } else {
        const d = 210, tx = M + d + 34, tw = 370;
        let used = d;
        place(ctx, frame, 'people', [M, top, 620, d], () => {
          list.forEach(person => {
            portrait(ctx, person.image, person.name, M, top, d);
            const name = nameFit(ctx, frame, person.name, tw, [42, 38, 34, 30]);
            drawLines(ctx, name, tx, top + 6, tw, ink);
            let y = top + 6 + name.height + 6;
            if (person.pronouns) { mono(ctx, 16); ctx.fillStyle = ink; ctx.fillText(person.pronouns, tx, y); y += 28; }
            if (state.bios && person.bio) y += wrap(ctx, person.bio, tx, y + 4, 21, tw, 4, true, { clip: true, leading: 1.32, onClip: clipNote(frame, person) });
            used = Math.max(d, y - top);
          });
        });
        artTile(ctx, state, art, [690, top - 8, 280, 250], frame, 0.04);
        // The opening of the description fills what is left, when there is room for at least two lines.
        const dy = top + Math.max(used, 250) + 30;
        const lines = Math.floor((floor - dy) / (24 * 1.35));
        if (feature.description && lines >= 2) {
          place(ctx, frame, 'copy', [M, dy, WIDTH, lines * 24 * 1.35], () => wrap(ctx, feature.description, M, dy, 24, WIDTH, lines, true, { clip: true, leading: 1.35, onClip: () => frame.notes.push('Description is clipped.') }));
        }
      }
      pair(frame, 'ink', bg);
      // Date, address and times, with the QR code at the right.
      ctx.fillStyle = ink; ctx.fillRect(M, 1060, WIDTH, 1);
      const bottomW = state.qr ? 740 : WIDTH;
      place(ctx, frame, 'date', [M, 1074, bottomW, 52], () => dateLine(ctx, content, M, 1074, 44, bottomW, true, ink));
      place(ctx, frame, 'info', [M, 1132, bottomW, 70], () => {
        line(ctx, content.site, M, 1132, 30, bottomW, true, false, 600, ink);
        timeInline(ctx, state, content, M, 1172, 19, bottomW, ink, true);
      });
      line(ctx, content.credits, M, frame.H - 30, 11, bottomW, true, true, 400, ink);
      if (state.qr) qrBlock(ctx, assets, frame, [830, 1082, 120, 120]);
    }
  });

  /* ── 6 · Minimal print ─────────────────────────────────────────────── */
  A.registerDesign('minimal-print', {
    label: 'Minimal print',
    use: 'Noticeboards, schools and offices (best on Letter or A4)',
    formats: ['portrait'],
    summary: 'White, ink only, generous margins. A small piece of the animation for recognition, then the date, the facts and a large QR code that people can scan from across a corridor.',
    limits: 'Prints well on an office printer. Text stays in ink; only the small artwork carries colour.',
    draw(ctx, state, art, content, assets, frame) {
      const m = 70, W = 1000 - 2 * m;
      const bg = base(state), ink = COLORS.ink;
      meta(ctx, content, frame, 'ink', bg, 62, 16);
      ctx.fillStyle = ink; ctx.fillRect(m, 100, W, 1);
      const logoW = 500, logoH = logoW * assets.logoRatio;
      place(ctx, frame, 'logo', [m, 140, logoW, logoH], () => ctx.drawImage(assets.logo, m, 140, logoW, logoH));
      artTile(ctx, state, art, [m + logoW + 30, 140, W - logoW - 30, logoH], frame, 0.06);
      let y = 140 + logoH + 60;
      const letters = content.lettering;
      let copyH = 0;
      place(ctx, frame, 'copy', [m, y, W, 150], () => {
        if (letters && state.template === 'community') {
          const run = letters.community[0];
          for (const part of run.text.split('\n')) copyH += lettered(ctx, [{ ...run, text: part }], m, y + copyH, 64, W, true, ink) / 1.2 * (run.lineHeight || 1.1);
        } else if (state.copy) copyH = wrap(ctx, state.copy, m, y, 40, W, 3, true, { weight: 600, leading: 1.15 });
      });
      y += Math.max(copyH, 100) + 44;
      place(ctx, frame, 'date', [m, y, W, 70], () => dateLine(ctx, content, m, y, 56, W, true, ink));
      y += 82;
      place(ctx, frame, 'info', [m, y, W, 110], () => {
        const h = line(ctx, content.facts.toUpperCase(), m, y, 22, W, true, true, 600, ink);
        timeLines(ctx, state, content, m, y + h + 6, 22, W, ink, true);
      });
      // A large QR code with its address.
      const qr = 270;
      if (state.qr) {
        const qy = frame.H - 70 - qr - 70;
        qrBlock(ctx, assets, frame, [m, qy, qr, qr]);
        const tx = m + qr + 40;
        mono(ctx, 16, 600); ctx.fillStyle = ink; ctx.fillText('SCAN TO REGISTER', tx, qy + 24);
        line(ctx, content.site, tx, qy + 56, 34, 1000 - m - tx, true, false, 600, ink);
      } else {
        line(ctx, content.site, m, frame.H - 170, 40, W, true, false, 600, ink);
      }
      ctx.fillStyle = ink; ctx.fillRect(m, frame.H - 64, W, 1);
      line(ctx, content.credits, m, frame.H - 46, 11, W, true, true, 400, ink);
      pair(frame, 'ink', bg);
    }
  });
})(typeof window === 'object' ? window : globalThis);
