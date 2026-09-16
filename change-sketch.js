/* ─── CC Fest · "Change" mode — p5.js polygon morph ────────────────────
 * Owner: Shristi
 * hides the static .cc-path Cs and reveals #changeCanvas (an .fx-layer*/

const CC_LEFT_X = 0.2882;
const CC_RIGHT_X = 0.7974;
const CC_CENTER_Y = 0.5;
const CC_RADIUS = 0.242522;
const GAP_ANGLE = Math.PI / 2;
const STROKE_WEIGHT_FRACTION = 60 / 600;
const EDGE_SAFE_ZONE = 80;

let stageEl;
let monogramWrap;
let changeHost;


// Monogram's box translated into stage-local (= canvas-local) pixels.
let stageW = 1;
let stageH = 1;
let monoW = 1;
let monoH = 1;
let monoOffsetX = 0;
let monoOffsetY = 0;

function setup() {
  stageEl = document.querySelector('.anim-stage-main');
  monogramWrap = document.getElementById('monogramWrap');
  changeHost = document.getElementById('changeCanvas');
  if (!stageEl || !monogramWrap || !changeHost) return;

  measure();
  const canvas = createCanvas(stageW, stageH);
  canvas.parent(changeHost);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
}

// Reads .anim-stage's own size and #monogramWrap's position/size
// relative to it
// so the canvas's own dimensions and the offset math agree exactly
function measure() {
  const stageBox = stageEl.getBoundingClientRect();
  const monoBox = monogramWrap.getBoundingClientRect();
  stageW = stageBox.width || 1;
  stageH = stageBox.height || 1;
  monoOffsetX = monoBox.left - stageBox.left;
  monoOffsetY = monoBox.top - stageBox.top;
  monoW = monoBox.width || 1;
  monoH = monoBox.height || 1;
}

function windowResized() {
  if (!stageEl) return;
  measure();
  resizeCanvas(stageW, stageH);
}

function draw() {
  if (!monogramWrap || monogramWrap.dataset.mode !== 'change') return;
  background(60, 1 ,96, 15);
  const mx = mouseX;
  const increment = map(mx, EDGE_SAFE_ZONE, width - EDGE_SAFE_ZONE, PI, 0.01, true);
  // stroke() is centered on the path, so it bleeds outward by half its
  // own weight beyond whatever radius we draw at
  const strokeW = monoW * STROKE_WEIGHT_FRACTION;
  const r = monoW * CC_RADIUS - strokeW / 2;
  strokeCap(PROJECT);
  strokeWeight(strokeW);
  stroke(360 - (0.4 * frameCount) % 360, 54, 95);

  const start = 0;
  const end = TWO_PI - GAP_ANGLE;

  const leftCx = monoOffsetX + monoW * CC_LEFT_X;
  const rightCx = monoOffsetX + monoW * CC_RIGHT_X;
  const cy = monoOffsetY + monoH * CC_CENTER_Y;

  beginShape()
    for (let a = start; a < end; a += increment) {
    vertex(leftCx + r * cos(a) + random(-0.5, 0.5), cy + r * sin(a) + random(-0.5, 0.5));
  }
  endShape();
  stroke((0.4 * frameCount) % 360, 54, 95);
  beginShape()
    for (let a = start; a < end; a += increment) {
     vertex(rightCx + r * cos(a) + random(-0.5, 0.5), cy + r * sin(a) + random(-0.5, 0.5));
  }
  endShape();
}

