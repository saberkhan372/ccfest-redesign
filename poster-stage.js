/* Host-owned. Captures a still frame of Shristi's homepage interactive for the poster maker.
 * Her files stay untouched: the homepage runs in a hidden same-origin frame, her own mode
 * buttons pick the mode, and this file only reads what her code has drawn. SVG layers are
 * cloned with their computed styles inlined (so animation state survives), canvases are
 * copied as pixels, and the "10 years of ___" labels keep their computed font and colour.
 * Her hover looks are reached by copying her own :hover rules onto a class at runtime. */
(function (root) {
  'use strict';
  const MODES = ['creativity', 'change', 'connection', 'celebration', 'collaboration', 'creative-commons', 'conversations', 'community', 'curiosity', 'coding'];
  const HOVER = 'poster-hover';
  // Properties that the homepage CSS changes on SVG elements.
  const PROPS = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'transform', 'transform-origin', 'transform-box', 'translate', 'rotate', 'scale', 'filter', 'mask', 'clip-path', 'color', 'mix-blend-mode', 'paint-order', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height'];
  const SKIP = new Set(['auto', 'normal', 'none', '']);
  const KEEP_NONE = new Set(['fill', 'stroke', 'display']);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  // Animation frames pause in a background tab; don't let a capture hang on them.
  const frames = (win, n) => Promise.race([wait(250), new Promise(resolve => { const step = () => (n-- > 0 ? win.requestAnimationFrame(step) : resolve()); step(); })]);

  function shown(el, win) {
    const style = win.getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && box.width > 1 && box.height > 1;
  }

  // Clone an <svg> with each element's computed style written inline, then drop classes.
  // Ids stay, so <use>, masks and filters keep resolving inside the copy.
  function inlineSvg(svg, win) {
    const clone = svg.cloneNode(true);
    // Her comments (e.g. <!---Newton's Cradle--->) are valid HTML but not valid XML.
    const comments = document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT);
    const drop = [];
    while (comments.nextNode()) drop.push(comments.currentNode);
    drop.forEach(node => node.remove());
    const source = [svg, ...svg.querySelectorAll('*')];
    const target = [clone, ...clone.querySelectorAll('*')];
    source.forEach((el, i) => {
      const out = target[i];
      // Shapes in <defs>/<symbol> inherit from the <use> that draws them; inlining their
      // own computed style (fill: none from the root) would hide them.
      if (!out || el.tagName.toLowerCase() === 'style' || (el !== svg && el.closest('defs, symbol'))) return;
      const style = win.getComputedStyle(el);
      const inline = PROPS.map(prop => {
        let value = style.getPropertyValue(prop);
        // A percentage translate on a fill-box resolves differently once the SVG is an image,
        // so convert it to user units from the element's own box.
        if (prop === 'translate' && value.includes('%') && el.getBBox) {
          const bbox = el.getBBox();
          const [tx, ty = '0px'] = value.split(' ');
          const unit = (part, size) => (part.endsWith('%') ? parseFloat(part) / 100 * size : parseFloat(part));
          value = `${unit(tx, bbox.width)}px ${unit(ty, bbox.height)}px`;
        }
        // Computed mask/filter/fill references are absolute page URLs; point them back into the copy.
        if (value.includes('url(')) value = value.replace(/url\("?[^")#]*(#[^")]+)"?\)/g, 'url($1)');
        return !SKIP.has(value) || (value === 'none' && KEEP_NONE.has(prop)) ? `${prop}:${value}` : '';
      }).filter(Boolean).join(';');
      out.setAttribute('style', inline);
      out.removeAttribute('class');
    });
    // Her SVG overflows its box (Collaboration's strings), which an image would clip,
    // so grow the copy's viewBox to cover everything drawn.
    let box = svg.getBoundingClientRect();
    const ctm = svg.getScreenCTM && svg.getScreenCTM();
    if (ctm && win.getComputedStyle(svg).overflow === 'visible') {
      let [left, top, right, bottom] = [box.left, box.top, box.right, box.bottom];
      svg.querySelectorAll('path, circle, ellipse, rect, line, polyline, polygon, use').forEach(el => {
        if (el.closest('defs, symbol, mask, clipPath, pattern')) return;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        left = Math.min(left, r.left); top = Math.min(top, r.top); right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
      });
      const inverse = ctm.inverse();
      const toUser = (x, y) => new DOMPoint(x, y).matrixTransform(inverse);
      const a = toUser(left, top);
      const b = toUser(right, bottom);
      clone.setAttribute('viewBox', `${a.x} ${a.y} ${b.x - a.x} ${b.y - a.y}`);
      clone.setAttribute('preserveAspectRatio', 'none');
      box = { left, top, width: right - left, height: bottom - top };
    }
    clone.setAttribute('width', box.width);
    clone.setAttribute('height', box.height);
    clone.style.width = `${box.width}px`;
    clone.style.height = `${box.height}px`;
    return { markup: new XMLSerializer().serializeToString(clone), box };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('The homepage artwork could not be copied into the poster.'));
      img.src = src;
    });
  }
  const svgImage = markup => loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);

  // Canvas pixels. If the sketch paints a flat, possibly translucent background (Change does),
  // that colour is made transparent so the poster shows through instead of a lighter rectangle.
  function copyCanvas(el) {
    const copy = document.createElement('canvas');
    copy.width = el.width; copy.height = el.height;
    const ctx = copy.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(el, 0, 0);
    if (!copy.width || !copy.height) return copy;
    const data = ctx.getImageData(0, 0, copy.width, copy.height);
    const px = data.data;
    const at = (x, y) => (y * copy.width + x) * 4;
    const corners = [at(0, 0), at(copy.width - 1, 0), at(0, copy.height - 1), at(copy.width - 1, copy.height - 1)];
    const [r, g, b, a] = px.slice(corners[0], corners[0] + 4);
    const same = i => Math.abs(px[i] - r) + Math.abs(px[i + 1] - g) + Math.abs(px[i + 2] - b) + Math.abs(px[i + 3] - a) < 10;
    if (a > 0 && corners.every(same)) {
      for (let i = 0; i < px.length; i += 4) if (same(i)) px[i + 3] = 0;
      ctx.putImageData(data, 0, 0);
    }
    return copy;
  }

  // Frames the posters on the shapes actually showing (so a swinging C stays in view),
  // leaving out Collaboration's strings, which run off the top of the stage by design.
  function focusBox(doc, win, origin) {
    const mono = doc.querySelector('.cc-mono');
    let box = null;
    const add = r => { if (!r.width || !r.height) return; box = box ? { l: Math.min(box.l, r.left), t: Math.min(box.t, r.top), r: Math.max(box.r, r.right), b: Math.max(box.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const visible = el => (el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
    mono.querySelectorAll('path, circle, ellipse, rect, polygon, use').forEach(el => {
      if (el.closest('defs, symbol, mask, clipPath, .cc-string') || !visible(el)) return;
      add(el.getBoundingClientRect());
    });
    doc.querySelectorAll('#monogramWrap > div').forEach(el => { if (visible(el) && shown(el, win)) add(el.getBoundingClientRect()); });
    const fallback = mono.getBoundingClientRect();
    const r = box ? { left: box.l, top: box.t, width: box.r - box.l, height: box.b - box.t } : fallback;
    // Never frame tighter than the resting monogram, so every mode keeps the same scale feel.
    const left = Math.min(r.left, fallback.left), top = Math.min(r.top, fallback.top);
    const right = Math.max(r.left + r.width, fallback.right), bottom = Math.max(r.top + r.height, fallback.bottom);
    return { x: left - origin.left, y: top - origin.top, w: right - left, h: bottom - top };
  }

  // Plain HTML shapes in the stage (Curiosity's dots): a filled, possibly round box.
  function boxImage(el, win) {
    const style = win.getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const scale = 2;
    const copy = document.createElement('canvas');
    copy.width = Math.ceil(box.width * scale); copy.height = Math.ceil(box.height * scale);
    const ctx = copy.getContext('2d');
    ctx.fillStyle = style.backgroundColor;
    ctx.beginPath();
    const radius = style.borderTopLeftRadius;
    const round = radius.endsWith('%') ? parseFloat(radius) >= 50 : parseFloat(radius) >= Math.min(el.offsetWidth, el.offsetHeight) / 2;
    if (round) ctx.ellipse(copy.width / 2, copy.height / 2, copy.width / 2, copy.height / 2, 0, 0, Math.PI * 2);
    else ctx.rect(0, 0, copy.width, copy.height);
    ctx.fill();
    return copy;
  }

  // Copies each of her :hover rules for the stage onto .poster-hover, read from her live CSS.
  function addHoverRules(doc) {
    const rules = [];
    const visit = list => {
      for (const rule of list) {
        if (rule.cssRules && !rule.selectorText) { visit(rule.cssRules); continue; }
        if (!rule.selectorText || !rule.selectorText.includes(':hover')) continue;
        if (!/monogramWrap|fx-connection|cc-/.test(rule.selectorText) || rule.selectorText.includes('mode-btn')) continue;
        rules.push(`${rule.selectorText.replace(/:hover/g, `.${HOVER}`)} { ${rule.style.cssText} }`);
      }
    };
    for (const sheet of doc.styleSheets) { try { visit(sheet.cssRules); } catch (_) { /* cross-origin sheet */ } }
    const style = doc.createElement('style');
    style.textContent = rules.join('\n');
    doc.head.appendChild(style);
  }

  // The frame stays inside the viewport (invisible, behind the page) so Shristi's
  // IntersectionObserver keeps her p5 sketch drawing.
  let framePromise;
  function loadFrame(url) {
    if (framePromise) return framePromise;
    framePromise = new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.title = 'Homepage interactive, used to draw poster artwork';
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;left:0;top:0;width:1100px;height:1000px;border:0;opacity:0;pointer-events:none;z-index:-1';
      frame.onload = async () => {
        try {
          const doc = frame.contentDocument;
          if (!doc || !doc.querySelector('.anim-stage')) throw new Error('The homepage interactive is missing.');
          addHoverRules(doc);
          await doc.fonts.ready;
          resolve({ frame, doc, win: frame.contentWindow });
        } catch (error) { framePromise = null; frame.remove(); reject(error); }
      };
      frame.src = url;
      document.body.appendChild(frame);
    });
    return framePromise;
  }

  // How long each mode's entrance takes after its word is picked, and how long the "in play"
  // look takes to finish once the pointer arrives. A recording spans both.
  const SETTLE = { creativity: 5200, 'creative-commons': 1800 };
  const PLAY = { celebration: 1900 };
  const FRAMES = 12;
  const rng = seed => { let s = seed % 2147483646 + 1; return () => (s = s * 16807 % 2147483647) / 2147483647; };

  // Poses the mode the way it looks while someone plays with it on the homepage.
  async function pose(doc, win, mode, seed, hover) {
    const stage = doc.querySelector('.anim-stage-main');
    const wrap = doc.getElementById('monogramWrap');
    const connection = doc.getElementById('connectionCanvas');
    const box = stage.getBoundingClientRect();
    const rand = rng(seed);
    const at = (fx, fy) => ({ clientX: box.left + box.width * fx, clientY: box.top + box.height * fy, bubbles: true, cancelable: true, view: win });
    const target = at(0.15 + rand() * 0.7, 0.05 + rand() * 0.35);
    doc.dispatchEvent(new win.MouseEvent('mousemove', target));
    if (hover) {
      [wrap, connection].forEach(el => el && el.classList.add(HOVER));
      wrap.dispatchEvent(new win.MouseEvent('mouseenter', { ...target, bubbles: false }));
      wrap.dispatchEvent(new win.MouseEvent('mouseover', target));
    }
    if (mode === 'celebration' && hover) {
      const cannon = wrap.querySelector('.cc-path-left') || wrap;
      cannon.dispatchEvent(new win.MouseEvent('mousedown', target));
      await wait(300 + rand() * 400);
      win.dispatchEvent(new win.MouseEvent('mouseup', target));
      doc.dispatchEvent(new win.MouseEvent('mouseup', target));
    }
  }

  function reset(doc, win) {
    doc.querySelectorAll(`.${HOVER}`).forEach(el => el.classList.remove(HOVER));
    const wrap = doc.getElementById('monogramWrap');
    wrap.dispatchEvent(new win.MouseEvent('mouseleave', { bubbles: false, view: win }));
    wrap.dispatchEvent(new win.MouseEvent('mouseout', { bubbles: true, view: win }));
  }

  // Background art on the stage itself (Creative Commons' tiled wallpaper).
  async function stageBackground(stage, win) {
    const style = win.getComputedStyle(stage);
    const match = style.backgroundImage.match(/url\("?(.*?)"?\)/);
    if (!match) return null;
    const image = await loadImage(match[1]);
    const [w, h] = style.backgroundSize.split(' ').map(parseFloat);
    const [px, py] = style.backgroundPosition.split(' ');
    return { image, tileW: w || image.naturalWidth, tileH: h || w || image.naturalHeight, posX: px, posY: py };
  }

  let queue = Promise.resolve();
  function capture(options) {
    const job = queue.then(() => captureNow(options));
    queue = job.catch(() => {});
    return job;
  }

  // One still of whatever her code has drawn right now, in stage pixels.
  const backgrounds = new Map();
  async function snapshot(doc, win) {
    const outer = doc.querySelector('.anim-stage');
    const stage = doc.querySelector('.anim-stage-main');
    const origin = stage.getBoundingClientRect();
    const place = el => { const b = el.getBoundingClientRect(); return { x: b.left - origin.left, y: b.top - origin.top, w: b.width, h: b.height }; };
    const layers = [];
    const pieces = [...outer.querySelectorAll('svg, canvas, #monogramWrap div')]
      .filter(el => !el.closest('.modes-list') && !(el.parentElement && el.parentElement.closest('svg')) && shown(el, win));
    for (const el of pieces) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'div' && win.getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)') continue;
      if (tag === 'svg') {
        const { markup, box } = inlineSvg(el, win);
        layers.push({ image: await svgImage(markup), x: box.left - origin.left, y: box.top - origin.top, w: box.width, h: box.height });
      } else layers.push({ image: tag === 'canvas' ? copyCanvas(el) : boxImage(el, win), ...place(el) });
    }
    const labels = [...outer.querySelectorAll('.cc-text')].filter(el => shown(el, win)).map(el => {
      const style = win.getComputedStyle(el);
      return { text: el.textContent.trim(), ...place(el), color: style.color, weight: style.fontWeight, size: parseFloat(style.fontSize) };
    });
    const key = win.getComputedStyle(stage).backgroundImage;
    if (!backgrounds.has(key)) backgrounds.set(key, await stageBackground(stage, win));
    return { layers, labels, background: backgrounds.get(key), width: origin.width, height: origin.height, focus: focusBox(doc, win, origin) };
  }

  // Records FRAMES stills spread over the mode's timeline: from the moment its word is picked,
  // through the entrance, to the finished "in play" look (or the resting look without hover).
  // Returns { mode, name, frames }; the last frame is the settled one.
  async function captureNow({ url, mode, seed = 1, hover = true, onProgress = () => {} }) {
    if (!MODES.includes(mode)) throw new Error('Choose one of the homepage animations.');
    const { doc, win } = await loadFrame(url);
    const button = doc.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (!button) throw new Error('That homepage animation is missing.');
    reset(doc, win);
    // Re-enter the mode so each recording replays the same entrance.
    const other = doc.querySelector(`.mode-btn:not([data-mode="${mode}"])`);
    if (other) { other.click(); await frames(win, 2); }
    doc.querySelector('.anim-stage').scrollIntoView({ block: 'start' });
    const settle = SETTLE[mode] || 1400;
    const total = settle + (hover ? PLAY[mode] || 1100 : 300);
    const times = Array.from({ length: FRAMES }, (_, i) => 120 + (total - 120) * i / (FRAMES - 1));
    button.click();
    const start = performance.now();
    let posing = null;
    const shots = [];
    for (const t of times) {
      if (!posing && t >= settle) { await wait(start + settle - performance.now()); posing = pose(doc, win, mode, seed, hover); }
      await wait(start + t - performance.now());
      await frames(win, 1);
      shots.push(await snapshot(doc, win));
      onProgress(shots.length, FRAMES);
    }
    await posing;
    reset(doc, win);
    // One framing for the whole recording, so the artwork doesn't jump while scrubbing.
    const l = Math.min(...shots.map(f => f.focus.x)), t = Math.min(...shots.map(f => f.focus.y));
    const r = Math.max(...shots.map(f => f.focus.x + f.focus.w)), b = Math.max(...shots.map(f => f.focus.y + f.focus.h));
    shots.forEach(f => { f.focus = { x: l, y: t, w: r - l, h: b - t }; });
    return { mode, name: button.textContent.trim(), frames: shots };
  }

  root.CCStageCapture = { MODES, capture };
})(window);
