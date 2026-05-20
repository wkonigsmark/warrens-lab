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
  // Stubs for the other maze types — render a placeholder so the tab does
  // something visible. Full implementations TODO.
  // ---------------------------------------------------------------------------
  function renderStub(label) {
    const svg = el('svg', {
      xmlns: SVG_NS,
      viewBox: '0 0 400 300',
      preserveAspectRatio: 'xMidYMid meet',
    });
    svg.appendChild(el('rect', { x: 0, y: 0, width: 400, height: 300, fill: 'var(--maze-bg)' }));
    const t1 = el('text', {
      x: 200, y: 140, 'text-anchor': 'middle',
      'font-family': 'Outfit, sans-serif', 'font-size': 22, 'font-weight': '700',
      fill: 'var(--maze-wall)',
    });
    t1.textContent = label;
    svg.appendChild(t1);
    const t2 = el('text', {
      x: 200, y: 170, 'text-anchor': 'middle',
      'font-family': 'Outfit, sans-serif', 'font-size': 14,
      fill: 'var(--maze-wall)', opacity: 0.55,
    });
    t2.textContent = 'coming soon';
    svg.appendChild(t2);
    return svg;
  }

  global.Renderer = {
    rect:  renderRect,
    hex:   () => renderStub('Hex Maze'),
    theta: () => renderStub('Circular (Theta) Maze'),
  };
})(window);
