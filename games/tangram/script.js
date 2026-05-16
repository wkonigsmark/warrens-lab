const SVG_NS = "http://www.w3.org/2000/svg";
const UNIT = 60; // px per "small triangle leg"
const SQRT2 = Math.SQRT2;
const BOARD_W = 600;
const BOARD_H = 760;

const PIECE_DEFS = [
  {
    id: "lt1",
    name: "Large triangle 1",
    color: "#d95043",
    pts: [[0, 0], [2 * UNIT, 0], [0, 2 * UNIT]],
    flippable: false,
  },
  {
    id: "lt2",
    name: "Large triangle 2",
    color: "#e3b44d",
    pts: [[0, 0], [2 * UNIT, 0], [0, 2 * UNIT]],
    flippable: false,
  },
  {
    id: "mt",
    name: "Medium triangle",
    color: "#2f80a8",
    pts: [[0, 0], [SQRT2 * UNIT, 0], [0, SQRT2 * UNIT]],
    flippable: false,
  },
  {
    id: "st1",
    name: "Small triangle 1",
    color: "#5b9367",
    pts: [[0, 0], [UNIT, 0], [0, UNIT]],
    flippable: false,
  },
  {
    id: "st2",
    name: "Small triangle 2",
    color: "#7c5da9",
    pts: [[0, 0], [UNIT, 0], [0, UNIT]],
    flippable: false,
  },
  {
    id: "sq",
    name: "Square",
    color: "#c97b3f",
    pts: [
      [0, 0],
      [UNIT, 0],
      [UNIT, UNIT],
      [0, UNIT],
    ],
    flippable: false,
  },
  {
    id: "pg",
    name: "Parallelogram",
    color: "#5fa5a0",
    pts: [
      [0, 0],
      [SQRT2 * UNIT, 0],
      [SQRT2 * UNIT + UNIT / SQRT2, UNIT / SQRT2],
      [UNIT / SQRT2, UNIT / SQRT2],
    ],
    flippable: true,
  },
];

const INITIAL_STATE = {
  lt1: { x: 95, y: 510, rotation: 0, flipX: 1 },
  lt2: { x: 235, y: 510, rotation: 180, flipX: 1 },
  mt: { x: 370, y: 510, rotation: 0, flipX: 1 },
  sq: { x: 490, y: 510, rotation: 0, flipX: 1 },
  st1: { x: 130, y: 680, rotation: 0, flipX: 1 },
  st2: { x: 230, y: 680, rotation: 180, flipX: 1 },
  pg: { x: 420, y: 680, rotation: 0, flipX: 1 },
};

function centroid(pts) {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of pts) {
    sx += x;
    sy += y;
  }
  return [sx / pts.length, sy / pts.length];
}

function centerOnCentroid(pts) {
  const [cx, cy] = centroid(pts);
  return pts.map(([x, y]) => [x - cx, y - cy]);
}

function silhouetteSquare(cx, cy) {
  const s = 2 * SQRT2 * UNIT;
  return [
    [cx - s / 2, cy - s / 2],
    [cx + s / 2, cy - s / 2],
    [cx + s / 2, cy + s / 2],
    [cx - s / 2, cy + s / 2],
  ];
}

function silhouetteTriangle(cx, cy) {
  const L = 4 * UNIT;
  const raw = [
    [0, L],
    [L, L],
    [0, 0],
  ];
  const [gx, gy] = centroid(raw);
  return raw.map(([x, y]) => [x - gx + cx, y - gy + cy]);
}

function silhouetteRectangle(cx, cy) {
  const w = 4 * UNIT;
  const h = 2 * UNIT;
  return [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ];
}

const SILHOUETTES = [
  { name: "Square", build: silhouetteSquare },
  { name: "Big Triangle", build: silhouetteTriangle },
  { name: "Rectangle", build: silhouetteRectangle },
];

const PUZZLE_TIPS = {
  Square:
    "Two large triangles together cover exactly half the square. Try placing them first along one of the diagonals, then puzzle the other five pieces into the remaining half.",
  "Big Triangle":
    "Drop one large triangle into the right-angle (bottom-left) corner with its short edges running along the bottom and left. The remaining slanted strip is where the other pieces live.",
  Rectangle:
    "Stand the two large triangles point-to-point in the middle so their long edges become the top and bottom of the rectangle. The triangular gaps at each end are where the smaller pieces fit.",
};

const HANDLE_RADIUS = 22;
const HANDLE_GAP = 10;
const HANDLE_SPACING = 56;
const SNAP_RADIUS = 16;
const SOLVE_TOLERANCE = 0.06;
const DEFAULT_STATUS =
  "Tap a piece to select it, then use the small buttons that appear above it. Drag pieces into the dashed shape.";
const SOLVED_STATUS = "✨ Solved! Tap Next Puzzle to try another shape.";

const board = document.getElementById("board");
const piecesLayer = document.getElementById("pieces");
const handlesLayer = document.getElementById("handles");
const silhouetteLayer = document.getElementById("silhouette");
const statusStrip = document.getElementById("statusStrip");
const resetBtn = document.getElementById("resetBtn");
const nextBtn = document.getElementById("nextBtn");
const puzzleLabel = document.getElementById("puzzleLabel");
const puzzleTip = document.getElementById("puzzleTip");
const puzzleTipLabel = document.getElementById("puzzleTipLabel");

const checkCanvas = document.createElement("canvas");
checkCanvas.width = BOARD_W;
checkCanvas.height = BOARD_H;
const checkCtx = checkCanvas.getContext("2d", { willReadFrequently: true });

const state = {};
let selectedId = null;
let silhouetteIdx = 0;
let dragInfo = null;
let isSolved = false;

// ---- geometry helpers ----

function getLocalRotatedVertices(def, s) {
  const local = centerOnCentroid(def.pts);
  const rad = (s.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return local.map(([x0, y0]) => {
    const x1 = x0 * s.flipX;
    return [x1 * cos - y0 * sin, x1 * sin + y0 * cos];
  });
}

function getWorldVertices(def, s) {
  return getLocalRotatedVertices(def, s).map(([x, y]) => [x + s.x, y + s.y]);
}

function getRotatedAABB(def, s) {
  const verts = getLocalRotatedVertices(def, s);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of verts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

// ---- rendering ----

function renderPieces() {
  piecesLayer.innerHTML = "";
  for (const def of PIECE_DEFS) {
    const poly = document.createElementNS(SVG_NS, "polygon");
    const centered = centerOnCentroid(def.pts);
    poly.setAttribute(
      "points",
      centered.map((p) => `${p[0]},${p[1]}`).join(" ")
    );
    poly.setAttribute("fill", def.color);
    poly.dataset.id = def.id;
    piecesLayer.appendChild(poly);
    updatePieceTransform(def.id);
  }
}

function updatePieceTransform(id) {
  const poly = piecesLayer.querySelector(`polygon[data-id="${id}"]`);
  if (!poly) return;
  const s = state[id];
  poly.setAttribute(
    "transform",
    `translate(${s.x},${s.y}) rotate(${s.rotation}) scale(${s.flipX},1)`
  );
  if (id === selectedId) positionHandles();
}

function renderSilhouette() {
  const def = SILHOUETTES[silhouetteIdx];
  const pts = def.build(300, 220);
  silhouetteLayer.innerHTML = "";
  const poly = document.createElementNS(SVG_NS, "polygon");
  poly.setAttribute("points", pts.map((p) => `${p[0]},${p[1]}`).join(" "));
  silhouetteLayer.appendChild(poly);
  puzzleLabel.textContent = def.name;
  updateMentorTip();
  refreshSolvedState();
}

function updateMentorTip() {
  const name = SILHOUETTES[silhouetteIdx].name;
  puzzleTipLabel.textContent = name;
  puzzleTip.textContent = PUZZLE_TIPS[name] || "";
}

// ---- handles ----

function buildHandles() {
  handlesLayer.innerHTML = "";
  if (!selectedId) return;
  const def = PIECE_DEFS.find((p) => p.id === selectedId);
  const actions = [
    { action: "rotateLeft", symbol: "↺" },
    { action: "rotateRight", symbol: "↻" },
  ];
  if (def.flippable) {
    actions.push({ action: "flip", symbol: "⇆" });
  }
  for (const a of actions) {
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("handle");
    g.dataset.action = a.action;
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("r", HANDLE_RADIUS);
    g.appendChild(circle);
    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = a.symbol;
    g.appendChild(text);
    handlesLayer.appendChild(g);
  }
}

function positionHandles() {
  if (!selectedId) return;
  const handles = handlesLayer.querySelectorAll(".handle");
  if (handles.length === 0) return;
  const s = state[selectedId];
  const def = PIECE_DEFS.find((p) => p.id === selectedId);
  const aabb = getRotatedAABB(def, s);
  const topY = s.y + aabb.minY - HANDLE_GAP - HANDLE_RADIUS;
  const count = handles.length;
  handles.forEach((h, i) => {
    const offset = (i - (count - 1) / 2) * HANDLE_SPACING;
    h.setAttribute("transform", `translate(${s.x + offset}, ${topY})`);
  });
}

// ---- selection / actions ----

function select(id) {
  selectedId = id;
  for (const p of piecesLayer.querySelectorAll("polygon")) {
    p.classList.toggle("selected", p.dataset.id === id);
  }
  if (id) {
    const target = piecesLayer.querySelector(`polygon[data-id="${id}"]`);
    if (target) piecesLayer.appendChild(target);
  }
  buildHandles();
  positionHandles();
}

function deselect() {
  select(null);
}

function rotateSelected(delta) {
  if (!selectedId) return;
  const cur = state[selectedId].rotation;
  state[selectedId].rotation = (((cur + delta) % 360) + 360) % 360;
  updatePieceTransform(selectedId);
  refreshSolvedState();
}

function flipSelected() {
  if (!selectedId) return;
  const def = PIECE_DEFS.find((p) => p.id === selectedId);
  if (!def || !def.flippable) return;
  state[selectedId].flipX = -state[selectedId].flipX;
  updatePieceTransform(selectedId);
  refreshSolvedState();
}

function resetPositions() {
  for (const def of PIECE_DEFS) {
    state[def.id] = { ...INITIAL_STATE[def.id] };
    updatePieceTransform(def.id);
  }
  deselect();
  refreshSolvedState();
}

// ---- snap-on-drop ----

function trySnap(id) {
  const def = PIECE_DEFS.find((p) => p.id === id);
  const myVerts = getWorldVertices(def, state[id]);
  const targets = [];
  for (const other of PIECE_DEFS) {
    if (other.id === id) continue;
    targets.push(...getWorldVertices(other, state[other.id]));
  }
  const silPts = SILHOUETTES[silhouetteIdx].build(300, 220);
  targets.push(...silPts);

  let bestDist = SNAP_RADIUS;
  let bestOffset = null;
  for (const mv of myVerts) {
    for (const tv of targets) {
      const dx = tv[0] - mv[0];
      const dy = tv[1] - mv[1];
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        bestOffset = [dx, dy];
      }
    }
  }
  if (bestOffset) {
    state[id].x += bestOffset[0];
    state[id].y += bestOffset[1];
    updatePieceTransform(id);
  }
}

// ---- solve detection ----

function tracePolygonOn(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

function checkSolved() {
  const ctx = checkCtx;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, BOARD_W, BOARD_H);
  ctx.fillStyle = "#ff0000";
  tracePolygonOn(ctx, SILHOUETTES[silhouetteIdx].build(300, 220));
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#00ff00";
  for (const def of PIECE_DEFS) {
    tracePolygonOn(ctx, getWorldVertices(def, state[def.id]));
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  const data = ctx.getImageData(0, 0, BOARD_W, BOARD_H).data;
  let silOnly = 0;
  let pieceOnly = 0;
  let intersect = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] > 64;
    const g = data[i + 1] > 64;
    if (r && g) intersect++;
    else if (r) silOnly++;
    else if (g) pieceOnly++;
  }
  const silTotal = silOnly + intersect;
  if (silTotal === 0) return false;
  return (silOnly + pieceOnly) / silTotal < SOLVE_TOLERANCE;
}

function setSolved(solved) {
  if (isSolved === solved) return;
  isSolved = solved;
  board.classList.toggle("solved", solved);
  statusStrip.classList.toggle("solved", solved);
  statusStrip.textContent = solved ? SOLVED_STATUS : DEFAULT_STATUS;
  const baseName = SILHOUETTES[silhouetteIdx].name;
  puzzleLabel.textContent = solved ? "✓ " + baseName : baseName;
  if (solved) deselect();
}

function refreshSolvedState() {
  setSolved(checkSolved());
}

// ---- pointer / drag ----

function svgPoint(e) {
  const pt = board.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(board.getScreenCTM().inverse());
}

function onPointerDown(e) {
  const handleEl = e.target.closest(".handle");
  if (handleEl) {
    const action = handleEl.dataset.action;
    if (action === "rotateLeft") rotateSelected(-45);
    else if (action === "rotateRight") rotateSelected(45);
    else if (action === "flip") flipSelected();
    e.preventDefault();
    return;
  }
  const target = e.target;
  const isPiece =
    target.tagName === "polygon" && target.parentElement === piecesLayer;
  if (!isPiece) {
    deselect();
    return;
  }
  const id = target.dataset.id;
  piecesLayer.appendChild(target);
  const pt = svgPoint(e);
  dragInfo = {
    id,
    target,
    pointerId: e.pointerId,
    startX: pt.x,
    startY: pt.y,
    pieceStartX: state[id].x,
    pieceStartY: state[id].y,
    moved: false,
  };
  target.setPointerCapture(e.pointerId);
  target.classList.add("dragging");
  e.preventDefault();
}

function onPointerMove(e) {
  if (!dragInfo || e.pointerId !== dragInfo.pointerId) return;
  const pt = svgPoint(e);
  const dx = pt.x - dragInfo.startX;
  const dy = pt.y - dragInfo.startY;
  if (!dragInfo.moved && Math.hypot(dx, dy) > 4) dragInfo.moved = true;
  state[dragInfo.id].x = dragInfo.pieceStartX + dx;
  state[dragInfo.id].y = dragInfo.pieceStartY + dy;
  updatePieceTransform(dragInfo.id);
}

function onPointerUp(e) {
  if (!dragInfo || e.pointerId !== dragInfo.pointerId) return;
  const { id, target, moved } = dragInfo;
  target.classList.remove("dragging");
  try {
    target.releasePointerCapture(e.pointerId);
  } catch (_) {
    /* no-op */
  }
  dragInfo = null;
  if (!moved) {
    select(id);
  } else {
    trySnap(id);
    refreshSolvedState();
  }
}

board.addEventListener("pointerdown", onPointerDown);
board.addEventListener("pointermove", onPointerMove);
board.addEventListener("pointerup", onPointerUp);
board.addEventListener("pointercancel", onPointerUp);

resetBtn.addEventListener("click", resetPositions);
nextBtn.addEventListener("click", () => {
  silhouetteIdx = (silhouetteIdx + 1) % SILHOUETTES.length;
  renderSilhouette();
});

// ---- init ----

for (const def of PIECE_DEFS) {
  state[def.id] = { ...INITIAL_STATE[def.id] };
}
renderSilhouette();
renderPieces();
