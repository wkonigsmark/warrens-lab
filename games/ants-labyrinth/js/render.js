// SVG renderer. Pure function of (grid, options) -> SVG element.
//
// We draw walls (lines for sides that are NOT linked between neighbors),
// start/end markers, and optionally the solution polyline. All colors come
// from CSS variables so themes can be swapped without re-rendering geometry.
//
// To add a new maze type (hex, theta), implement another renderer here that
// takes the same grid + options and emits an SVG. The rest of the app doesn't
// need to know which one was used.
(function (global) {

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }

  // Tiny seeded jitter for hand-drawn theme — applied to wall endpoints only,
  // not to geometry the solver depends on.
  function jitter(rng, amount) {
    return (rng.next() - 0.5) * 2 * amount;
  }

  function renderRect(grid, opts) {
    const cellSize    = opts.cellSize    ?? 28;
    const wallThick   = opts.wallThick   ?? 2;
    const handDrawn   = opts.theme === 'handdrawn';
    const padding     = wallThick * 2;
    const width  = grid.cols * cellSize + padding * 2;
    const height = grid.rows * cellSize + padding * 2;

    const svg = el('svg', {
      xmlns: SVG_NS,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': 'Maze',
    });

    // Background — uses the theme bg so solution colors blend nicely.
    svg.appendChild(el('rect', {
      x: 0, y: 0, width, height,
      fill: 'var(--maze-bg)',
    }));

    // Helper to convert grid coords -> pixel coords (cell top-left).
    const px = (col) => padding + col * cellSize;
    const py = (row) => padding + row * cellSize;

    // Solution path goes BEHIND the walls — draw before walls.
    if (opts.solution && opts.solution.length) {
      const pts = opts.solution.map(c =>
        `${px(c.col) + cellSize / 2},${py(c.row) + cellSize / 2}`
      ).join(' ');
      svg.appendChild(el('polyline', {
        points: pts,
        fill: 'none',
        stroke: 'var(--maze-solution)',
        'stroke-width': Math.max(cellSize * 0.45, 6),
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }));
    }

    // Start + end markers (also behind walls so corners stay crisp).
    const markerR = cellSize * 0.32;
    svg.appendChild(el('circle', {
      cx: px(grid.start.col) + cellSize / 2,
      cy: py(grid.start.row) + cellSize / 2,
      r: markerR,
      fill: 'var(--maze-start)',
    }));
    svg.appendChild(el('circle', {
      cx: px(grid.end.col) + cellSize / 2,
      cy: py(grid.end.row) + cellSize / 2,
      r: markerR,
      fill: 'var(--maze-end)',
    }));
    // Tiny labels
    const labelSize = cellSize * 0.45;
    svg.appendChild(el('text', {
      x: px(grid.start.col) + cellSize / 2,
      y: py(grid.start.row) + cellSize / 2 + labelSize * 0.35,
      'text-anchor': 'middle',
      'font-size': labelSize,
      'font-family': 'Outfit, sans-serif',
      'font-weight': '700',
      fill: 'var(--maze-bg)',
    })).textContent = 'S';
    svg.appendChild(el('text', {
      x: px(grid.end.col) + cellSize / 2,
      y: py(grid.end.row) + cellSize / 2 + labelSize * 0.35,
      'text-anchor': 'middle',
      'font-size': labelSize,
      'font-family': 'Outfit, sans-serif',
      'font-weight': '700',
      fill: 'var(--maze-bg)',
    })).textContent = 'E';

    // Walls. For each cell, draw N + W if absent (covers shared edges once),
    // then draw S + E for cells on the bottom/right boundary.
    const wallGroup = el('g', {
      stroke: 'var(--maze-wall)',
      'stroke-width': wallThick,
      'stroke-linecap': 'round',
    });
    const rng = handDrawn ? new RNG(opts.seed + ':jitter') : null;
    const j = handDrawn ? cellSize * 0.06 : 0;

    function line(x1, y1, x2, y2) {
      const attrs = handDrawn
        ? {
            x1: x1 + jitter(rng, j), y1: y1 + jitter(rng, j),
            x2: x2 + jitter(rng, j), y2: y2 + jitter(rng, j),
          }
        : { x1, y1, x2, y2 };
      wallGroup.appendChild(el('line', attrs));
    }

    grid.eachCell(cell => {
      const x = px(cell.col), y = py(cell.row);
      // North wall
      if (!cell.neighbors.N || !cell.isLinked(cell.neighbors.N)) {
        line(x, y, x + cellSize, y);
      }
      // West wall
      if (!cell.neighbors.W || !cell.isLinked(cell.neighbors.W)) {
        line(x, y, x, y + cellSize);
      }
      // South wall (only for bottom row — interior shared with next row's N)
      if (!cell.neighbors.S) {
        line(x, y + cellSize, x + cellSize, y + cellSize);
      }
      // East wall (only for right column)
      if (!cell.neighbors.E) {
        line(x + cellSize, y, x + cellSize, y + cellSize);
      }
    });

    svg.appendChild(wallGroup);
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Theta (circular) renderer.
  //
  // Each cell is an annular sector (a slice of a ring). For every cell we draw
  // walls on edges whose corresponding neighbor isn't linked:
  //   - the CCW radial line between this cell and its CCW ring-mate
  //   - the inward arc between this cell and its IN cell
  //   - the outward boundary arc for cells on the last ring
  //
  // Drawing CCW + IN (vs CW + OUT) is an arbitrary choice that ensures every
  // shared wall is drawn by exactly one cell; the outer ring and center cell
  // get special handling for their respective open sides.
  // ---------------------------------------------------------------------------
  function renderTheta(grid, opts) {
    const ringDepth   = opts.ringDepth ?? 36;
    const centerR     = opts.centerRadius ?? ringDepth * 0.9;
    const wallThick   = opts.wallThick ?? 2;
    const handDrawn   = opts.theme === 'handdrawn';

    const maxR = centerR + (grid.rings - 1) * ringDepth;
    const size = Math.ceil((maxR + wallThick * 2 + 4) * 2);
    const cx   = size / 2;
    const cy   = size / 2;

    const svg = el('svg', {
      xmlns: SVG_NS,
      viewBox: `0 0 ${size} ${size}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': 'Circular maze',
    });

    // Background
    svg.appendChild(el('rect', {
      x: 0, y: 0, width: size, height: size,
      fill: 'var(--maze-bg)',
    }));

    // Geometry helpers ------------------------------------------------------
    // Ring r occupies the annulus [innerR(r), outerR(r)].
    function innerR(r) { return r === 0 ? 0 : centerR + (r - 1) * ringDepth; }
    function outerR(r) { return r === 0 ? centerR : centerR + r * ringDepth; }
    function pt(radius, angle) {
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    }
    function cellCenter(cell) {
      if (cell.ring === 0) return [cx, cy];
      const n = grid.sectors[cell.ring];
      const a = (cell.sector + 0.5) * 2 * Math.PI / n;
      const r = (innerR(cell.ring) + outerR(cell.ring)) / 2;
      return pt(r, a);
    }
    // Angle bounds for a cell's CCW edge (= start of sector).
    function ccwAngle(cell) {
      const n = grid.sectors[cell.ring];
      return cell.sector * 2 * Math.PI / n;
    }
    function cwAngle(cell) {
      const n = grid.sectors[cell.ring];
      return (cell.sector + 1) * 2 * Math.PI / n;
    }

    // Draw the solution polyline first, behind walls + markers.
    if (opts.solution && opts.solution.length) {
      const pts = opts.solution.map(c => {
        const [x, y] = cellCenter(c);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      svg.appendChild(el('polyline', {
        points: pts,
        fill: 'none',
        stroke: 'var(--maze-solution)',
        'stroke-width': Math.max(ringDepth * 0.45, 6),
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }));
    }

    // Start + end markers
    const markerR = ringDepth * 0.32;
    function drawMarker(cell, fillVar, label) {
      const [x, y] = cellCenter(cell);
      svg.appendChild(el('circle', {
        cx: x, cy: y, r: markerR, fill: fillVar,
      }));
      const txt = el('text', {
        x, y: y + markerR * 0.4,
        'text-anchor': 'middle',
        'font-size': markerR * 1.3,
        'font-family': 'Outfit, sans-serif',
        'font-weight': '700',
        fill: 'var(--maze-bg)',
      });
      txt.textContent = label;
      svg.appendChild(txt);
    }
    drawMarker(grid.start, 'var(--maze-start)', 'S');
    drawMarker(grid.end,   'var(--maze-end)',   'E');

    // Walls -----------------------------------------------------------------
    const rng = handDrawn ? new RNG(opts.seed + ':jitter') : null;
    const jAmt = handDrawn ? ringDepth * 0.04 : 0;
    function jit(v) { return handDrawn ? v + (rng.next() - 0.5) * 2 * jAmt : v; }

    const wallGroup = el('g', {
      stroke: 'var(--maze-wall)',
      'stroke-width': wallThick,
      'stroke-linecap': 'round',
      fill: 'none',
    });

    function lineSeg(x1, y1, x2, y2) {
      wallGroup.appendChild(el('line', {
        x1: jit(x1), y1: jit(y1), x2: jit(x2), y2: jit(y2),
      }));
    }
    function arcSeg(radius, startA, endA) {
      // Always sweep CCW->CW (increasing angle). For short arcs (<π) the
      // large-arc-flag is 0; sweep-flag 1 = positive angle direction.
      const [x1, y1] = pt(radius, startA);
      const [x2, y2] = pt(radius, endA);
      const large = (endA - startA) > Math.PI ? 1 : 0;
      const d = `M ${jit(x1).toFixed(2)} ${jit(y1).toFixed(2)} ` +
                `A ${radius} ${radius} 0 ${large} 1 ${jit(x2).toFixed(2)} ${jit(y2).toFixed(2)}`;
      wallGroup.appendChild(el('path', { d }));
    }

    grid.eachCell(cell => {
      if (cell.ring === 0) return;  // center cell handled below
      const a1 = ccwAngle(cell);
      const a2 = cwAngle(cell);
      const ir = innerR(cell.ring);
      const or = outerR(cell.ring);

      // CCW radial wall — drawn if not linked to CCW neighbor.
      if (!cell.neighbors.CCW || !cell.isLinked(cell.neighbors.CCW)) {
        const [x1, y1] = pt(ir, a1);
        const [x2, y2] = pt(or, a1);
        lineSeg(x1, y1, x2, y2);
      }
      // Inward arc wall — drawn if not linked to IN neighbor.
      if (!cell.neighbors.IN || !cell.isLinked(cell.neighbors.IN)) {
        arcSeg(ir, a1, a2);
      }
      // Outer boundary for the last ring.
      if (cell.ring === grid.rings - 1) {
        arcSeg(or, a1, a2);
      }
    });

    // Center cell: no walls of its own, but if it's NOT linked to a ring-1
    // cell, the corresponding inward-arc wall of that ring-1 cell already
    // covers the boundary. Nothing extra needed here.

    svg.appendChild(wallGroup);
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Hex renderer.
  //
  // Pointy-top hexagons; each cell has 6 edges, one per neighbor direction.
  // To avoid drawing shared walls twice we only emit walls on each cell's
  // "owned" edges (NW, NE, W) and boundary edges where no neighbor exists
  // (E, SE, SW). The other side of a shared edge is then drawn by the
  // neighbor's owned side.
  //
  // Edge → neighbor mapping (going clockwise from top vertex):
  //   corner 0 (top)        → corner 1 (top-right): NE edge
  //   corner 1 (top-right)  → corner 2 (bottom-right): E edge
  //   corner 2 (bottom-right)→ corner 3 (bottom): SE edge
  //   corner 3 (bottom)     → corner 4 (bottom-left): SW edge
  //   corner 4 (bottom-left)→ corner 5 (top-left): W edge
  //   corner 5 (top-left)   → corner 0 (top): NW edge
  // ---------------------------------------------------------------------------
  function renderHex(grid, opts) {
    const size      = opts.size ?? 24;             // "radius" of each hex
    const wallThick = opts.wallThick ?? 2;
    const handDrawn = opts.theme === 'handdrawn';

    const SQRT3 = Math.sqrt(3);
    const hexW = SQRT3 * size;       // pointy-top hex width (flat sides apart)
    const hexH = 2 * size;            // pointy-top hex height (vertex to vertex)
    const rowSpacing = 1.5 * size;    // vertical center-to-center
    const padding = wallThick * 2 + 2;

    // Even rows are shifted right by half a hex width.
    function cellCenter(r, c) {
      const evenRow = (r % 2 === 0);
      const x = padding + c * hexW + (evenRow ? hexW / 2 : 0) + hexW / 2;
      const y = padding + r * rowSpacing + size;
      return [x, y];
    }

    // SVG viewBox sized to contain every hex, including the row offset.
    const width  = padding * 2 + grid.cols * hexW + hexW / 2;
    const height = padding * 2 + (grid.rows - 1) * rowSpacing + hexH;

    const svg = el('svg', {
      xmlns: SVG_NS,
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': 'Hex maze',
    });
    svg.appendChild(el('rect', { x: 0, y: 0, width, height, fill: 'var(--maze-bg)' }));

    // Compute the 6 corner offsets once. Corner i at angle -π/2 + i*π/3
    // (-90° + 60°*i), going clockwise starting from the top vertex.
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 3;
      corners.push([size * Math.cos(angle), size * Math.sin(angle)]);
    }

    // Solution polyline (drawn before walls + markers).
    if (opts.solution && opts.solution.length) {
      const pts = opts.solution.map(c => {
        const [x, y] = cellCenter(c.row, c.col);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      svg.appendChild(el('polyline', {
        points: pts,
        fill: 'none',
        stroke: 'var(--maze-solution)',
        'stroke-width': Math.max(size * 0.6, 6),
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }));
    }

    // Start + end markers.
    const markerR = size * 0.45;
    function drawMarker(cell, fillVar, label) {
      const [x, y] = cellCenter(cell.row, cell.col);
      svg.appendChild(el('circle', { cx: x, cy: y, r: markerR, fill: fillVar }));
      const txt = el('text', {
        x, y: y + markerR * 0.4,
        'text-anchor': 'middle',
        'font-size': markerR * 1.3,
        'font-family': 'Outfit, sans-serif',
        'font-weight': '700',
        fill: 'var(--maze-bg)',
      });
      txt.textContent = label;
      svg.appendChild(txt);
    }
    drawMarker(grid.start, 'var(--maze-start)', 'S');
    drawMarker(grid.end,   'var(--maze-end)',   'E');

    // Walls. We draw each cell's NW, NE, W edges (the "owned" sides), plus
    // boundary edges (E, SE, SW) for cells whose neighbor in that direction
    // doesn't exist. This guarantees each wall is drawn exactly once.
    const rng = handDrawn ? new RNG(opts.seed + ':jitter') : null;
    const jAmt = handDrawn ? size * 0.06 : 0;
    function jit(v) { return handDrawn ? v + (rng.next() - 0.5) * 2 * jAmt : v; }

    const wallGroup = el('g', {
      stroke: 'var(--maze-wall)',
      'stroke-width': wallThick,
      'stroke-linecap': 'round',
      fill: 'none',
    });

    function line(x1, y1, x2, y2) {
      wallGroup.appendChild(el('line', {
        x1: jit(x1), y1: jit(y1), x2: jit(x2), y2: jit(y2),
      }));
    }

    // Edge index (0..5) → corner pair → direction name.
    // edge i goes from corner i to corner (i+1) % 6.
    const edgeDir = ['NE', 'E', 'SE', 'SW', 'W', 'NW'];
    // The 3 edges every cell "owns" (so each shared wall is drawn once):
    const ownedEdges = new Set(['NW', 'NE', 'W']);

    grid.eachCell(cell => {
      const [cx, cy] = cellCenter(cell.row, cell.col);
      for (let i = 0; i < 6; i++) {
        const dir = edgeDir[i];
        const neighbor = cell.neighbors[dir];
        const owns = ownedEdges.has(dir);
        const drawIt = (owns && (!neighbor || !cell.isLinked(neighbor))) ||
                       (!owns && !neighbor);
        if (!drawIt) continue;
        const [dx1, dy1] = corners[i];
        const [dx2, dy2] = corners[(i + 1) % 6];
        line(cx + dx1, cy + dy1, cx + dx2, cy + dy2);
      }
    });

    svg.appendChild(wallGroup);
    return svg;
  }

  global.Renderer = {
    rect:  renderRect,
    hex:   renderHex,
    theta: renderTheta,
  };
})(window);
