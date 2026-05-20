// BFS shortest path through the maze graph.
// Returns an ordered array of cells from start to end (inclusive), or null if
// disconnected (which shouldn't happen for our generators, but check anyway).
(function (global) {
  function solveBFS(grid, start, end) {
    start = start || grid.start;
    end   = end   || grid.end;

    const cameFrom = new Map();
    cameFrom.set(start, null);
    const queue = [start];

    while (queue.length) {
      const cell = queue.shift();
      if (cell === end) break;
      for (const n of cell.links) {
        if (!cameFrom.has(n)) {
          cameFrom.set(n, cell);
          queue.push(n);
        }
      }
    }

    if (!cameFrom.has(end)) return null;

    const path = [];
    for (let c = end; c !== null; c = cameFrom.get(c)) path.push(c);
    return path.reverse();
  }

  global.Solver = { solveBFS };
})(window);
