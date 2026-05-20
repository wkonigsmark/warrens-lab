// Start/End placement strategies.
//
// Default placement uses the corners of a rect/hex grid (set by the Grid
// itself). For higher difficulty levels we use:
//
//   placeInterior(grid, rng)            — picks two non-edge cells
//   placeFarthest(grid, fromStart=true) — sets E to the cell farthest from S
//   regenForPathLength(...)             — bundles regen + farthest into one
//
// All work on any grid with a `start`, `end`, and a cell graph (via .links).

(function (global) {

  // BFS distance map from a starting cell. Returns Map<cell, distance>.
  function bfsDistances(start) {
    const dist = new Map([[start, 0]]);
    const queue = [start];
    while (queue.length) {
      const cell = queue.shift();
      const d = dist.get(cell);
      for (const n of cell.links) {
        if (!dist.has(n)) {
          dist.set(n, d + 1);
          queue.push(n);
        }
      }
    }
    return dist;
  }

  // Place S and E at random INTERIOR cells (not on the grid boundary). Rect and
  // hex grids both store cells in this.cells[row][col]; we use that to detect
  // boundary cells. Theta is handled by its own startEnd mode and skipped here.
  function placeInterior(grid, rng) {
    if (grid.kind !== 'rect' && grid.kind !== 'hex') return;
    const interior = [];
    for (let r = 1; r < grid.rows - 1; r++) {
      for (let c = 1; c < grid.cols - 1; c++) {
        interior.push(grid.cells[r][c]);
      }
    }
    if (interior.length < 2) return;   // grid too small; bail
    grid.start = rng.pick(interior);
    // Choose E with some minimum distance from S so they don't end up
    // adjacent. We'll fine-tune this with placeFarthest below.
    grid.end = rng.pick(interior.filter(c => c !== grid.start));
  }

  // Move E to the cell farthest from the current S (in the link graph). This
  // guarantees the longest possible solution path for the current generated
  // maze. Returns the achieved distance.
  function placeFarthest(grid) {
    const dist = bfsDistances(grid.start);
    let best = grid.end;
    let bestD = dist.get(best) || 0;
    for (const [cell, d] of dist) {
      if (d > bestD) { best = cell; bestD = d; }
    }
    grid.end = best;
    return bestD;
  }

  // Generation wrapper that targets a minimum solution path length, given as
  // a fraction of total cells (0..1). Returns { tries, achievedFrac }.
  //
  //   generate(seed) — caller-provided closure that runs the algorithm and
  //     returns a finished grid. We re-seed on each retry.
  //   options:
  //     targetFrac      — minimum (achieved path length / totalCells)
  //     maxTries        — give up after this many regen attempts
  //     interior        — if true, place S/E in the interior first
  //     rngForPick      — RNG used for picking interior cells (re-seeded on retry)
  //
  // The function applies farthest-cell placement on every try when targetFrac
  // is > 0, since that's strictly stronger than corner-to-corner.
  function generateWithPathBias(seed, options, generate) {
    const target = Math.max(0, options.targetFrac || 0);
    const maxTries = options.maxTries ?? 30;
    let bestGrid = null;
    let bestFrac = -1;

    for (let attempt = 0; attempt < maxTries; attempt++) {
      const trySeed = attempt === 0 ? seed : `${seed}:${attempt}`;
      const grid = generate(trySeed);
      const total = grid.allCells().length;
      const rng = new RNG(trySeed + ':place');

      if (options.interior) placeInterior(grid, rng);
      const achieved = target > 0 ? placeFarthest(grid) : (bfsDistances(grid.start).get(grid.end) || 0);
      const frac = achieved / total;

      if (frac >= target) return { grid, tries: attempt + 1, achievedFrac: frac };
      if (frac > bestFrac) { bestGrid = grid; bestFrac = frac; }
    }
    return { grid: bestGrid, tries: maxTries, achievedFrac: bestFrac };
  }

  // Pick N checkpoint cells on the grid. They must be visit-able in order
  // (the maze is one connected component, so any cell works) and reasonably
  // spread out. We pick from "interior" cells when possible to keep them
  // visually distinct from S/E.
  //
  // Strategy: BFS distance from S; sort cells by distance; pick N cells
  // evenly spaced along the distance spectrum so checkpoints land at roughly
  // 1/(N+1), 2/(N+1), ... N/(N+1) of the way from S to E.
  function placeCheckpoints(grid, count, rng) {
    if (count <= 0) { grid.checkpoints = []; return; }
    const dist = bfsDistances(grid.start);
    const cells = grid.allCells()
      .filter(c => c !== grid.start && c !== grid.end && dist.has(c));
    if (cells.length === 0) { grid.checkpoints = []; return; }

    // Sort by distance from start, and target checkpoint distances at evenly
    // spaced positions along the spectrum.
    cells.sort((a, b) => dist.get(a) - dist.get(b));
    const maxDist = dist.get(cells[cells.length - 1]);
    const picks = [];
    for (let i = 1; i <= count; i++) {
      const target = (i / (count + 1)) * maxDist;
      // Among cells within a small window of the target distance, pick a
      // random one (so checkpoint placement isn't perfectly deterministic).
      const window = cells.filter(c => Math.abs(dist.get(c) - target) <= maxDist * 0.05);
      const candidates = window.length ? window : cells;
      let pick;
      do { pick = rng.pick(candidates); } while (picks.includes(pick) && candidates.length > picks.length);
      picks.push(pick);
    }
    grid.checkpoints = picks;
  }

  // Concatenated BFS solver: S → C1 → C2 → ... → Cn → E.
  // Solver.solveBFS handles each leg; we stitch them, deduplicating the
  // shared cell at each junction (the end of one leg = start of the next).
  function solveThroughCheckpoints(grid) {
    const stops = [grid.start, ...(grid.checkpoints || []), grid.end];
    let full = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const leg = Solver.solveBFS(grid, stops[i], stops[i + 1]);
      if (!leg) return null;
      if (i === 0) full = leg;
      else full = full.concat(leg.slice(1));
    }
    return full;
  }

  global.Placement = {
    placeInterior, placeFarthest, generateWithPathBias, bfsDistances,
    placeCheckpoints, solveThroughCheckpoints,
  };
})(window);
