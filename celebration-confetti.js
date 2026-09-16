/* ─── CC Fest · "Celebration" mode — confetti cannons ──────────────────
 * Owner: Shristi
 * The two Cs rotate to aim their open counter-space at the mouse, like
 * a cannon tracking its target. Holding mousedown fires a continuous
 * stream of confetti from that open section toward the pointer, using
 * a lightweight vanilla re-implementation of the reference's
 * angle/spread/gravity/friction confetti physics (no GSAP/physics2D
 * plugin, no lodash — just requestAnimationFrame). */

(function () {
  const SPREAD = 60; // degrees of random scatter around the aim angle
  const GRAVITY = 1200; // px/s^2
  const LIFETIME = 3; // seconds a particle survives before it's removed
  const PARTICLES_PER_TICK = 6; // spawned per cannon per frame while held
  const DEMO_BURST_AMOUNT = 20; // one-off hint burst when the mode is selected
  const MIN_VELOCITY = 400; // px/s
  const MAX_VELOCITY = 800; // px/s
  // Scales both r (ribbon length) and d0 (stroke thickness) together so
  // confetti gets bigger without distorting its own proportions.
  const SIZE_SCALE = 1.4;
  // Fraction of the C's own half-width used as the counter-space
  // (gap) radius — where confetti actually emerges from.
  const GAP_RADIUS_FRACTION = 0.2;
  const palette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"];

  let stageEl, monogramWrap, canvasHost, canvas, ctx;
  let pathLeft, pathRight;
  let dpr = window.devicePixelRatio || 1;
  let particles = [];
  let lastTime = null;
  let shooting = false;

  const aim = {
    left: { angle: 180, cx: 0, cy: 0, gapRadius: 0 },
    right: { angle: 0, cx: 0, cy: 0, gapRadius: 0 },
  };

  function getDegAngle(x0, y0, x1, y1) {
    return Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isCelebration() {
    return !!monogramWrap && monogramWrap.dataset.mode === 'celebration';
  }

  function measure() {
    const rect = stageEl.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 1) * dpr;
    canvas.height = (rect.height || 1) * dpr;
  }

  function updateAimFor(key, el, mouseX, mouseY) {
    if (!el) return;
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const angle = getDegAngle(cx, cy, mouseX, mouseY);
    el.style.transform = `rotate(${angle}deg)`;
    aim[key] = { angle, cx, cy, gapRadius: (box.width / 2) * GAP_RADIUS_FRACTION };
  }

  function clearAim() {
    if (pathLeft) pathLeft.style.transform = '';
    if (pathRight) pathRight.style.transform = '';
  }

  function handleMove(e) {
    if (!isCelebration()) return;
    const point = e.touches ? e.touches[0] : e;
    updateAimFor('left', pathLeft, point.clientX, point.clientY);
    updateAimFor('right', pathRight, point.clientX, point.clientY);
  }

  function handleDown(e) {
    if (!isCelebration()) return;
    shooting = true;
    const point = e.touches ? e.touches[0] : e;
    updateAimFor('left', pathLeft, point.clientX, point.clientY);
    updateAimFor('right', pathRight, point.clientX, point.clientY);
  }

  function handleUp() {
    shooting = false;
  }

  function addBurst(x, y, angle, amount) {
    for (let i = 0; i < amount; i++) {
      const r = random(4, 6) * SIZE_SCALE * dpr;
      const d0 = random(15, 25) * SIZE_SCALE * dpr;
      const color = palette[Math.floor(random(0, palette.length))];
      const partAngle = angle + random(-SPREAD / 2, SPREAD / 2);
      const velocity = random(MIN_VELOCITY, MAX_VELOCITY) * dpr;
      const rad = (partAngle * Math.PI) / 180;

      particles.push({
        x,
        y,
        vx: Math.cos(rad) * velocity,
        vy: Math.sin(rad) * velocity,
        friction: random(0.04, 0.18), // per-second drag factor
        r,
        d0,
        color,
        tilt: random(-10, 10),
        tiltAngle: random(0, Math.PI * 2),
        tiltAngleIncremental: random(0.05, 0.07),
        flutter: random(0, Math.PI * 2),
        age: 0,
      });
    }
  }

  function fireFromGap(key, amount) {
    const a = aim[key];
    if (!a) return;
    const rad = (a.angle * Math.PI) / 180;
    const originX = a.cx + Math.cos(rad) * a.gapRadius;
    const originY = a.cy + Math.sin(rad) * a.gapRadius;

    const stageBox = stageEl.getBoundingClientRect();
    const cvx = (originX - stageBox.left) * dpr;
    const cvy = (originY - stageBox.top) * dpr;
    addBurst(cvx, cvy, a.angle, amount);
  }

  // Fired once whenever the mode is switched to Celebration, so the
  // interaction reveals itself before anyone touches the mouse. The Cs
  // are left at their resting orientation (no rotation applied) — like
  // change-sketch.js, tracking only starts on the first real mousemove
  // that happens after the mode is selected, not before.
  function demoFire() {
    [['left', pathLeft], ['right', pathRight]].forEach(([key, el]) => {
      if (!el) return;
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      aim[key] = { angle: 0, cx, cy, gapRadius: (box.width / 2) * GAP_RADIUS_FRACTION };
      fireFromGap(key, DEMO_BURST_AMOUNT);
    });
  }

  function updateParticle(p, dt) {
    p.age += dt;

    // gravity + drag on the ballistic velocity
    p.vy += GRAVITY * dt;
    const drag = Math.pow(1 - p.friction, dt);
    p.vx *= drag;
    p.vy *= drag;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // a little extra flutter layered on top, like a tumbling ribbon
    p.flutter += dt * 6;
    p.tiltAngle += p.tiltAngleIncremental;
    p.tilt = Math.sin(p.tiltAngle) * p.r * 2;
    p.x += Math.cos(p.flutter) * 0.6 * dpr;
    p.y += Math.sin(p.flutter) * 0.3 * dpr;
  }

  function drawParticle(p) {
    const t = p.age / LIFETIME;
    const d = p.d0 * (1 - Math.pow(t, 4)); // Power4.easeIn shrink to 0
    if (d <= 0) return;

    ctx.beginPath();
    ctx.lineWidth = d / 2;
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = Math.max(0, 1 - Math.pow(t, 6));
    ctx.moveTo(p.x + p.tilt + p.r, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function render(now) {
    requestAnimationFrame(render);
    if (!isCelebration()) {
      lastTime = null;
      return;
    }

    const dt = lastTime == null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shooting) {
      fireFromGap('left', PARTICLES_PER_TICK);
      fireFromGap('right', PARTICLES_PER_TICK);
    }

    if (dt === 0) return;

    particles = particles.filter(p => p.age < LIFETIME);
    for (const p of particles) {
      updateParticle(p, dt);
      drawParticle(p);
    }
  }

  function watchMode() {
    let wasCelebration = isCelebration();
    const observer = new MutationObserver(() => {
      const nowCelebration = isCelebration();
      if (!nowCelebration) {
        shooting = false;
        clearAim();
      } else if (!wasCelebration) {
        demoFire();
      }
      wasCelebration = nowCelebration;
    });
    observer.observe(monogramWrap, { attributes: true, attributeFilter: ['data-mode'] });
  }

  function setup() {
    stageEl = document.querySelector('.anim-stage');
    monogramWrap = document.getElementById('monogramWrap');
    canvasHost = document.getElementById('confettiLayer');
    canvas = document.getElementById('confettiCanvas');
    pathLeft = document.querySelector('.cc-path-left');
    pathRight = document.querySelector('.cc-path-right');
    if (!stageEl || !monogramWrap || !canvasHost || !canvas) return;
    ctx = canvas.getContext('2d');

    measure();
    window.addEventListener('resize', measure);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('touchstart', handleDown, { passive: true });
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);

    watchMode();
    requestAnimationFrame(render);
  }

  setup();
})();
