// All seven maze generation algorithms.
//
// Each takes (grid, rng) and mutates the grid in place by linking cells.
// They share one assumption: the grid starts with no links at all.
//
// To add a new algorithm: implement fn(grid, rng), then register it in
// Algorithms.list with a label + description.
(function (global) {

  // ---------------------------------------------------------------------------
  // 1. Recursive Backtracker (DFS)
  //    Walk randomly into unvisited neighbors, carving as you go. Back up when
  //    stuck. Produces long winding corridors with few dead-ends-far-from-path.
  // ---------------------------------------------------------------------------
  function recursiveBacktracker(grid, rng) {
    const visited = new Set();
    const stack = [grid.start || grid.allCells()[0]];
    visited.add(stack[0]);

    while (stack.length) {
      const current = stack[stack.length - 1];
      const candidates = current.allNeighbors().filter(n => !visited.has(n));
      if (candidates.length === 0) {
        stack.pop();
        continue;
      }
      const next = rng.pick(candidates);
      current.link(next);
      visited.add(next);
      stack.push(next);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Prim's Algorithm (randomised, simplified)
  //    Maintain a frontier of cells adjacent to the maze. Pop a random frontier
  //    cell, link it to a random already-in-maze neighbor. Many short branches.
  // ---------------------------------------------------------------------------
  function primsAlgorithm(grid, rng) {
    const inMaze = new Set();
    const frontier = new Set();

    const start = rng.pick(grid.allCells());
    inMaze.add(start);
    start.allNeighbors().forEach(n => frontier.add(n));

    while (frontier.size) {
      const frontArr = [...frontier];
      const cell = frontArr[rng.int(frontArr.length)];
      frontier.delete(cell);

      const carvedNeighbors = cell.allNeighbors().filter(n => inMaze.has(n));
      if (carvedNeighbors.length) {
        const target = rng.pick(carvedNeighbors);
        cell.link(target);
      }
      inMaze.add(cell);
      cell.allNeighbors().forEach(n => { if (!inMaze.has(n)) frontier.add(n); });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Kruskal's Algorithm
  //    Build the set of every potential wall (edge). Shuffle. For each edge,
  //    link if its two cells aren't already connected (union-find). Produces a
  //    very uniform, textureless maze — feels random everywhere.
  // ---------------------------------------------------------------------------
  function kruskalsAlgorithm(grid, rng) {
    const parent = new Map();
    grid.eachCell(c => parent.set(c, c));
    const find = (c) => {
      while (parent.get(c) !== c) {
        parent.set(c, parent.get(parent.get(c)));  // path compression
        c = parent.get(c);
      }
      return c;
    };
    const union = (a, b) => { parent.set(find(a), find(b)); };

    const edges = grid.edges();
    rng.shuffle(edges);

    for (const [a, b] of edges) {
      if (find(a) !== find(b)) {
        a.link(b);
        union(a, b);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Wilson's Algorithm (loop-erased random walks)
  //    Pick an arbitrary cell, mark it visited. Then repeatedly: pick an
  //    unvisited cell, walk randomly. If you cross your own path, erase the
  //    loop. When you hit visited, carve the entire walk. Generates a *uniform
  //    spanning tree* — every possible maze is equally likely. Slower start.
  // ---------------------------------------------------------------------------
  function wilsonsAlgorithm(grid, rng) {
    const all = grid.allCells();
    const visited = new Set();
    visited.add(rng.pick(all));

    const unvisited = all.filter(c => !visited.has(c));

    while (unvisited.length) {
      let cell = rng.pick(unvisited);
      const path = [cell];
      const indexInPath = new Map([[cell, 0]]);

      while (!visited.has(cell)) {
        const next = rng.pick(cell.allNeighbors());
        if (indexInPath.has(next)) {
          // Loop detected — erase back to first occurrence.
          const cut = indexInPath.get(next);
          for (let i = cut + 1; i < path.length; i++) indexInPath.delete(path[i]);
          path.length = cut + 1;
        } else {
          indexInPath.set(next, path.length);
          path.push(next);
        }
        cell = next;
      }

      // Carve the walk.
      for (let i = 0; i < path.length - 1; i++) {
        path[i].link(path[i + 1]);
        visited.add(path[i]);
      }
      // Filter out newly visited cells. O(n) per iteration but fine for our sizes.
      for (let i = unvisited.length - 1; i >= 0; i--) {
        if (visited.has(unvisited[i])) unvisited.splice(i, 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Binary Tree
  //    For each cell, link to either N or E (whichever exists). Trivially fast.
  //    Strong diagonal bias toward the NE corner — the entire top row and right
  //    column become straight corridors.
  // ---------------------------------------------------------------------------
  function binaryTree(grid, rng) {
    grid.eachCell(cell => {
      const options = [];
      if (cell.neighbors.N) options.push(cell.neighbors.N);
      if (cell.neighbors.E) options.push(cell.neighbors.E);
      if (options.length) cell.link(rng.pick(options));
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Sidewinder
  //    Walk each row left-to-right building "runs" of east-linked cells. At
  //    each step, randomly close the run; when closed, pick one cell in the
  //    run and link it north. Pronounced horizontal bias; the top row is one
  //    long corridor.
  // ---------------------------------------------------------------------------
  function sidewinder(grid, rng) {
    grid.eachRow(row => {
      let run = [];
      for (const cell of row) {
        run.push(cell);
        const atEastBoundary  = !cell.neighbors.E;
        const atNorthBoundary = !cell.neighbors.N;
        // Close the run at the east edge, or randomly otherwise.
        const closeOut = atEastBoundary || (!atNorthBoundary && rng.int(2) === 0);
        if (closeOut) {
          const member = rng.pick(run);
          if (member.neighbors.N) member.link(member.neighbors.N);
          run = [];
        } else {
          cell.link(cell.neighbors.E);
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Eller's Algorithm
  //    Row by row. Track which set each cell belongs to. Randomly merge
  //    adjacent cells with different sets. For each remaining set on this row,
  //    extend at least one downward connection into the next row. Last row:
  //    merge everything that isn't yet connected. Streaming-friendly.
  // ---------------------------------------------------------------------------
  function ellersAlgorithm(grid, rng) {
    let nextSet = 0;
    let setOf = new Map();   // cell -> set id

    for (let r = 0; r < grid.rows; r++) {
      const row = grid.cells[r];
      // Assign fresh set ids to unassigned cells in this row.
      for (const cell of row) {
        if (!setOf.has(cell)) setOf.set(cell, nextSet++);
      }

      // Merge horizontally. Always merge on the last row to ensure connectivity.
      for (let c = 0; c < grid.cols - 1; c++) {
        const a = row[c], b = row[c + 1];
        const sa = setOf.get(a), sb = setOf.get(b);
        const lastRow = (r === grid.rows - 1);
        const shouldMerge = sa !== sb && (lastRow || rng.int(2) === 0);
        if (shouldMerge) {
          a.link(b);
          // Relabel set sb -> sa across the row.
          for (const cell of row) if (setOf.get(cell) === sb) setOf.set(cell, sa);
        }
      }

      if (r === grid.rows - 1) break;

      // For each set in this row, link at least one cell downward.
      const bySet = new Map();
      for (const cell of row) {
        const s = setOf.get(cell);
        if (!bySet.has(s)) bySet.set(s, []);
        bySet.get(s).push(cell);
      }
      const nextSetOf = new Map();
      for (const [, members] of bySet) {
        // Choose 1+ cells from this set to extend south.
        const picks = new Set();
        picks.add(rng.pick(members));
        for (const m of members) if (rng.int(3) === 0) picks.add(m);
        for (const m of members) {
          if (picks.has(m)) {
            const south = m.neighbors.S;
            if (south) {
              m.link(south);
              nextSetOf.set(south, setOf.get(m));
            }
          }
        }
      }
      setOf = nextSetOf;
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Hunt-and-Kill
  //    Walk randomly carving passages like the backtracker, but when stuck
  //    (no unvisited neighbor), "hunt" — scan the grid for the first
  //    unvisited cell adjacent to a visited cell, link them, and resume.
  //    Produces tight dead-end clusters without long corridors. Visually
  //    denser than DFS; harder to scan because there are no straight runs.
  // ---------------------------------------------------------------------------
  function huntAndKill(grid, rng) {
    const visited = new Set();
    const cells = grid.allCells();
    let current = rng.pick(cells);
    visited.add(current);

    while (true) {
      const unvisitedNeighbors = current.allNeighbors().filter(n => !visited.has(n));
      if (unvisitedNeighbors.length) {
        const next = rng.pick(unvisitedNeighbors);
        current.link(next);
        visited.add(next);
        current = next;
      } else {
        // Hunt: scan in deterministic order for an unvisited cell adjacent to
        // a visited one. Carve a passage between them and resume from there.
        let found = null;
        for (const cell of cells) {
          if (visited.has(cell)) continue;
          const visitedNeighbors = cell.allNeighbors().filter(n => visited.has(n));
          if (visitedNeighbors.length) {
            found = cell;
            cell.link(rng.pick(visitedNeighbors));
            visited.add(cell);
            break;
          }
        }
        if (!found) break;        // every cell visited → done
        current = found;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Recursive Division (rect-only)
  //    Inverse of every other algorithm in this file: starts with the entire
  //    grid open (every neighbor linked) and recursively adds dividing walls
  //    with exactly one passage. Produces very uniform texture without long
  //    natural corridors — visually flat and disorienting.
  // ---------------------------------------------------------------------------
  function recursiveDivision(grid, rng) {
    // 1) Start with every cell linked to every neighbor.
    grid.eachCell(cell => {
      for (const n of cell.allNeighbors()) cell.link(n);
    });
    // 2) Recursively split the working rectangle in two, unlinking across the
    //    chosen wall except for one randomly-placed passage.
    function divide(r0, c0, r1, c1) {
      const h = r1 - r0;
      const w = c1 - c0;
      if (h < 2 && w < 2) return;
      const horizontal = (h === w) ? rng.int(2) === 0 : (h > w);
      if (horizontal) {
        const wallRow = r0 + rng.int(h - 1);            // between wallRow and wallRow+1
        const passCol = c0 + rng.int(w);
        for (let c = c0; c < c1; c++) {
          if (c === passCol) continue;
          const a = grid.cells[wallRow][c];
          const b = grid.cells[wallRow + 1][c];
          a.unlink(b);
        }
        divide(r0, c0, wallRow + 1, c1);
        divide(wallRow + 1, c0, r1, c1);
      } else {
        const wallCol = c0 + rng.int(w - 1);
        const passRow = r0 + rng.int(h);
        for (let r = r0; r < r1; r++) {
          if (r === passRow) continue;
          const a = grid.cells[r][wallCol];
          const b = grid.cells[r][wallCol + 1];
          a.unlink(b);
        }
        divide(r0, c0, r1, wallCol + 1);
        divide(r0, wallCol + 1, r1, c1);
      }
    }
    divide(0, 0, grid.rows, grid.cols);
  }

  // ---------------------------------------------------------------------------
  // 10. Recursive Backtracker WITH WEAVES (rect-only)
  //
  //     A DFS variant that occasionally tunnels *under* a visited cell to
  //     reach an unvisited cell two steps away. The cell we tunnel through
  //     becomes a "weave" cell: it has crossings in both axes (NS and EW)
  //     that do NOT connect to each other in the maze graph.
  //
  //     This single change defeats every common solving heuristic — you can
  //     no longer follow a wall, you can no longer trace a line, because the
  //     paths cross without joining.
  //
  //     Weaves are marked on the cell:
  //       cell.weave === 'NS-over' — existing N-S pass is on top, the new
  //                                  E-W pass goes underneath.
  //       cell.weave === 'EW-over' — existing E-W pass is on top, the new
  //                                  N-S pass goes underneath.
  //     The solver respects this: at a weave cell, you must continue along
  //     the same axis you entered.
  // ---------------------------------------------------------------------------
  function weaveBacktracker(grid, rng) {
    // Helper: given a cell, find which named direction (N/S/E/W) a target
    // neighbor lives in. Returns null if not a direct neighbor.
    function dirTo(cell, target) {
      for (const d of ['N', 'S', 'E', 'W']) {
        if (cell.neighbors[d] === target) return d;
      }
      return null;
    }
    const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };

    const visited = new Set();
    const stack = [grid.cells[0][0]];
    visited.add(stack[0]);

    while (stack.length) {
      const current = stack[stack.length - 1];

      // Collect candidate next steps. A candidate is either:
      //   • a regular adjacent unvisited cell (1-step move), or
      //   • a 2-step move via a weave: jump over a visited cell that has
      //     only a perpendicular passage so far, landing on an unvisited
      //     cell on the other side.
      const candidates = [];
      for (const dir of ['N', 'S', 'E', 'W']) {
        const mid = current.neighbors[dir];
        if (!mid) continue;
        if (!visited.has(mid)) {
          // 1-step move into an unvisited cell.
          candidates.push({ kind: 'direct', next: mid });
          continue;
        }
        // 2-step weave: mid is visited. Need mid to be a *regular* cell with
        // a perpendicular straight pass and no existing weave.
        if (mid.weave) continue;
        const horizontalDir = (dir === 'E' || dir === 'W');
        const perpAxisLinks = horizontalDir
          ? [mid.neighbors.N, mid.neighbors.S]
          : [mid.neighbors.E, mid.neighbors.W];
        const parallelAxisLinks = horizontalDir
          ? [mid.neighbors.E, mid.neighbors.W]
          : [mid.neighbors.N, mid.neighbors.S];
        const perpLinked = perpAxisLinks.every(n => n && mid.isLinked(n));
        const parallelLinked = parallelAxisLinks.some(n => n && mid.isLinked(n));
        if (!perpLinked || parallelLinked) continue;
        // Look 2 cells away in the same direction.
        const far = mid.neighbors[dir];
        if (!far || visited.has(far)) continue;
        candidates.push({ kind: 'weave', mid, next: far, axis: horizontalDir ? 'EW' : 'NS' });
      }

      if (candidates.length === 0) { stack.pop(); continue; }

      const chosen = rng.pick(candidates);
      if (chosen.kind === 'direct') {
        current.link(chosen.next);
        visited.add(chosen.next);
        stack.push(chosen.next);
      } else {
        // Carve the weave: link current↔mid and mid↔next along the new axis.
        // mid already had a perpendicular pass; we add this axis.
        current.link(chosen.mid);
        chosen.mid.link(chosen.next);
        // The pre-existing axis is the one going *over*.
        chosen.mid.weave = chosen.axis === 'EW' ? 'NS-over' : 'EW-over';
        visited.add(chosen.next);
        stack.push(chosen.next);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Braiding pass.
  // Remove `ratio` fraction of dead ends by linking each picked dead end to a
  // random not-yet-linked neighbor. ratio=0 leaves a perfect maze; ratio=1
  // removes every dead end (great for very young kids — no wrong turns).
  // ---------------------------------------------------------------------------
  function braid(grid, rng, ratio) {
    if (ratio <= 0) return;
    const deadEnds = rng.shuffle(grid.deadEnds());
    const count = Math.round(deadEnds.length * ratio);
    for (let i = 0; i < count; i++) {
      const cell = deadEnds[i];
      // Skip if it's no longer a dead end (an earlier braid linked it).
      if (cell.links.size !== 1) continue;
      const candidates = cell.unlinkedNeighbors();
      if (!candidates.length) continue;
      // Prefer linking to another dead end if possible (keeps loops short).
      const preferred = candidates.filter(n => n.links.size === 1);
      cell.link(rng.pick(preferred.length ? preferred : candidates));
    }
  }

  // ---------------------------------------------------------------------------
  // Algorithm registry — drives the dropdown + descriptions.
  // ---------------------------------------------------------------------------
  // `supports` lists the maze types each algorithm can run on. The UI uses
  // this to filter the dropdown; the three rect-specific algorithms reference
  // cell.neighbors.N / .E by name and aren't meaningful on other shapes.
  const list = [
    { id: 'backtracker', label: 'Recursive Backtracker',
      desc: 'Long winding corridors with few branches — feels like a classic maze.',
      fn: recursiveBacktracker, supports: ['rect', 'hex', 'theta'] },
    { id: 'prims', label: "Prim's Algorithm",
      desc: 'Many short dead-ends, bushy and uniform.',
      fn: primsAlgorithm, supports: ['rect', 'hex', 'theta'] },
    { id: 'kruskals', label: "Kruskal's Algorithm",
      desc: 'Very even texture — no detectable bias anywhere.',
      fn: kruskalsAlgorithm, supports: ['rect', 'hex', 'theta'] },
    { id: 'wilsons', label: "Wilson's Algorithm",
      desc: 'Mathematically unbiased — every possible maze equally likely.',
      fn: wilsonsAlgorithm, supports: ['rect', 'hex', 'theta'] },
    { id: 'binarytree', label: 'Binary Tree',
      desc: 'Strong NE diagonal bias — top row and right column are corridors.',
      fn: binaryTree, supports: ['rect'] },
    { id: 'sidewinder', label: 'Sidewinder',
      desc: 'Horizontal bias — long east-west runs, top row is open.',
      fn: sidewinder, supports: ['rect'] },
    { id: 'ellers',  label: "Eller's Algorithm",
      desc: 'Row-by-row streaming generation — diverse texture, mild horizontal feel.',
      fn: ellersAlgorithm, supports: ['rect'] },
    { id: 'huntkill', label: 'Hunt-and-Kill',
      desc: 'Tight dead-end clusters, no long corridors — visually denser than DFS.',
      fn: huntAndKill, supports: ['rect', 'hex', 'theta'] },
    { id: 'recdiv', label: 'Recursive Division',
      desc: 'Very uniform texture without visual landmarks — disorienting.',
      fn: recursiveDivision, supports: ['rect'] },
    { id: 'weave', label: 'Weave Backtracker',
      desc: 'Passages cross over/under each other — defeats every wall-following heuristic.',
      fn: weaveBacktracker, supports: ['rect'] },
  ];

  global.Algorithms = { list, braid };
})(window);
