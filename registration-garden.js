/* Registration garden on the register page: one sprout per registration, planted on the day it came in, with a flower
   when it came with a donation. Counts come from _data/registration_garden.json (scripts/update-registration-garden.cjs).
   Each sprout's shape is seeded by its day and number, so the garden never reshuffles; new registrations only add.
   It grows in once, the first time it scrolls into view, then stops; with reduced motion it is drawn finished.
   Without JavaScript the counts and caption still show and the canvas stays hidden. */
(function () {
  'use strict';
  var figure = document.querySelector('.registration-garden');
  if (!figure || !figure.querySelector('.garden-canvas').getContext) return;
  var canvas = figure.querySelector('.garden-canvas');
  var data;
  try { data = JSON.parse(figure.querySelector('.garden-data').textContent); } catch (e) { return; }
  var zone = data.time_zone || 'America/Los_Angeles';
  var ink = '#18181a', blue = '#2d5bff', orange = '#ff4d2e', muted = '#3f3f3b';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Every day from the first registration to the event, including quiet days.
  var DAY = 864e5, byDate = {};
  data.days.forEach(function (d) { byDate[d.date] = d; });
  var utc = function (s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); };
  var iso = function (t) { return new Date(t).toISOString().slice(0, 10); };
  var first = data.days.length ? utc(data.days[0].date) : utc(data.event_date), last = utc(data.event_date);
  var days = [];
  for (var t = first; t <= last; t += DAY) days.push(byDate[iso(t)] || {date: iso(t), count: 0, donors: 0});
  var today = new Intl.DateTimeFormat('en-CA', {timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  var label = function (s) { return new Date(utc(s)).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}); };

  // Days to go, worked out now rather than at build time.
  var left = Math.round((utc(data.event_date) - utc(today)) / DAY);
  var countdown = figure.querySelector('.garden-countdown');
  if (countdown) countdown.textContent = left > 1 ? ' · ' + left + ' days to go' : left === 1 ? ' · tomorrow' : left === 0 ? ' · today' : '';
  var updated = figure.querySelector('.garden-updated');
  if (updated && updated.dataset.updated) {
    updated.textContent = 'Counts updated ' + new Date(updated.dataset.updated).toLocaleString('en-US', {timeZone: zone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'}) + '.';
  }
  var busiest = data.days.reduce(function (a, d) { return d.count > a.count ? d : a; }, {count: 0});
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', data.total + ' registrations over ' + data.days.length + ' days, ' + data.donors + ' with a donation' + (busiest.count ? '; the busiest day was ' + label(busiest.date) + ' with ' + busiest.count + '.' : '.'));

  // Small seeded random numbers: the same day and sprout always draw the same plant.
  function seeded(seed) {
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var r = Math.imul(seed ^ seed >>> 15, 1 | seed); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; };
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h; }

  var sprouts = [];
  days.forEach(function (d, i) {
    for (var k = 0; k < d.count; k++) {
      var r = seeded(hash(d.date + ':' + k));
      sprouts.push({day: i, jitter: r() - .5, height: .3 + .7 * r(), bend: r() - .5, leaves: 1 + (r() < .5 ? 1 : 0), leafAt: .3 + .35 * r(), leafSide: r() < .5 ? -1 : 1, donor: k < d.donors});
    }
  });

  function draw(progress) {
    var w = canvas.clientWidth, h = canvas.clientHeight, ratio = window.devicePixelRatio || 1;
    if (!w || !h) return;
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    var g = canvas.getContext('2d');
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    g.clearRect(0, 0, w, h);
    var pad = 10, ground = h - 26, top = 14, col = (w - pad * 2) / days.length, tall = ground - top;
    var x = function (i) { return pad + col * (i + .5); };

    // Ground, soil dots for days still to come, and a flag on the festival day.
    g.strokeStyle = ink; g.lineWidth = 1;
    g.beginPath(); g.moveTo(pad, ground + .5); g.lineTo(w - pad, ground + .5); g.stroke();
    g.fillStyle = 'rgba(24,24,26,.35)';
    days.forEach(function (d, i) { if (d.date > today) { g.beginPath(); g.arc(x(i), ground + 5, 1.2, 0, 7); g.fill(); } });
    var fx = x(days.length - 1);
    g.beginPath(); g.moveTo(fx, ground); g.lineTo(fx, ground - 34); g.stroke();
    g.fillStyle = orange; g.beginPath(); g.moveTo(fx, ground - 34); g.lineTo(fx - 14, ground - 29); g.lineTo(fx, ground - 24); g.closePath(); g.fill();  // points back over the garden, so it never leaves the canvas
    var inside = function (v) { return Math.max(pad + 6, Math.min(w - pad - 6, v)); };

    sprouts.forEach(function (s) {
      var grow = Math.max(0, Math.min(1, progress * 1.6 - s.day / days.length * .6));
      if (!grow) return;
      var bx = inside(x(s.day) + s.jitter * col * .9), sh = s.height * tall * grow, tipX = inside(bx + s.bend * sh * .35), tipY = ground - sh;
      var cx = bx + s.bend * sh * .05, cy = ground - sh * .5;
      g.strokeStyle = ink; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(bx, ground); g.quadraticCurveTo(cx, cy, tipX, tipY); g.stroke();
      g.fillStyle = blue;
      for (var l = 0; l < s.leaves; l++) {
        var t = s.leafAt + l * .22, lx = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * tipX, ly = (1 - t) * (1 - t) * ground + 2 * (1 - t) * t * cy + t * t * tipY;
        var side = l ? -s.leafSide : s.leafSide;
        g.beginPath(); g.ellipse(lx + side * 3.5, ly, 4.5 * grow, 1.8 * grow, side * .55, 0, 7); g.fill();
      }
      if (grow < .92) return;
      if (s.donor) {
        g.fillStyle = orange;
        for (var p = 0; p < 5; p++) { var a = p / 5 * 6.283; g.beginPath(); g.arc(tipX + Math.cos(a) * 2.6, tipY + Math.sin(a) * 2.6, 2.1, 0, 7); g.fill(); }
        g.fillStyle = ink; g.beginPath(); g.arc(tipX, tipY, 1.2, 0, 7); g.fill();
      } else {
        g.fillStyle = ink; g.beginPath(); g.arc(tipX, tipY, 1.5, 0, 7); g.fill();
      }
    });

    // Date labels: first day, today, festival day.
    g.fillStyle = muted; g.font = '10px "Overpass Mono", monospace'; g.textBaseline = 'alphabetic';
    g.textAlign = 'left'; g.fillText(label(days[0].date), pad, h - 6);
    g.textAlign = 'right'; g.fillText(label(data.event_date), w - pad, h - 6);
    var ti = days.findIndex(function (d) { return d.date === today; });
    if (ti > 2 && ti < days.length - 3) { g.textAlign = 'center'; g.fillText('today', x(ti), h - 6); }
  }

  var started = false;
  function grow() {
    if (started) return; started = true;
    if (reduce) return draw(1);
    var start = null;
    (function frame(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / 1600);
      draw(p);
      if (p < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  canvas.hidden = false;
  draw(0);
  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    if (!('IntersectionObserver' in window) || reduce) return grow();
    var watch = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { watch.disconnect(); grow(); }
    }, {threshold: .25});
    watch.observe(canvas);
  });
  var resizing;
  window.addEventListener('resize', function () { clearTimeout(resizing); resizing = setTimeout(function () { if (started) draw(1); }, 150); });
})();
