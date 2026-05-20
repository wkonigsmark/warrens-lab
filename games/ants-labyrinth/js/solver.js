// BFS shortest path through the maze graph.
//
// Standard BFS for ordinary cells; weave-aware at cells where cell.weave is
// set. A weave cell has two perpendicular passages that cross without
// joining — at such a cell the path must continue along the same axis it
// entered on.
//
// To support that we key BFS states with (cell, axis) for weave cells, so
// the same cell can appear in the search twice (once per axis).
//
// Returns an ordered array of cells from start to end (inclusive), or null
// if no path exists.

(function (global) {

  // Which named direction does `target` live in relative to `cell`?
  // Only rect-style grids set named N/S/E/W keys; weave cells exist only on
  // those, so this is safe.
  function dirTo(cell, target) {
    for (const d of ['N', 'S', 'E', 'W']) {
      if (cell.neighbors[d] === target) return d;
    }
    return null;
  }
  function axisFor(dir) { return (dir === 'N' || dir === 'S') ? 'NS' : 'EW'; }

  function solveBFS(grid, start, end) {
    start = start || grid.start;
    end   = end   || grid.end;

    function stateKey(cell, axis) {
      return cell.weave ? `${cell.id}|${axis}` : cell.id;
    }

    const startState = stateKey(start, null);
    const cameFrom = new Map([[startState, null]]);
    const cellByState = new Map([[startState, start]]);
    const queue = [{ cell: start, axis: null }];

    while (queue.length) {
      const { cell, axis } = queue.shift();
      if (cell === end) {
        // Reconstruct path. State chain may include the same cell twice if
        // a weave was traversed by both axes; emit one cell per visit.
        const path = [];
        let s = stateKey(cell, axis);
        while (s !== null) {
          path.push(cellByState.get(s));
          s = cameFrom.get(s);
        }
        return path.reverse();
      }

      for (const n of cell.links) {
        let nextAxis = null;

        // At a weave cell we can only continue along the entry axis. We need
        // to know which direction `n` is from us; only rect cells have weaves
        // and they have named N/S/E/W neighbors.
        if (cell.weave && axis) {
          const dir = dirTo(cell, n);
          if (!dir || axisFor(dir) !== axis) continue;
        }

        // If `n` is a weave, mark which sub-passage we arrive on.
        if (n.weave) {
          const dirFromCell = dirTo(cell, n);
          if (dirFromCell) nextAxis = axisFor(dirFromCell);
        }

        const nKey = stateKey(n, nextAxis);
        if (cameFrom.has(nKey)) continue;
        cameFrom.set(nKey, stateKey(cell, axis));
        cellByState.set(nKey, n);
        queue.push({ cell: n, axis: nextAxis });
      }
    }

    return null;
  }

  global.Solver = { solveBFS };
})(window);
