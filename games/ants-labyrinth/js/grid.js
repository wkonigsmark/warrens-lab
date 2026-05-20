// Grid + Cell abstractions.
//
// A maze is a graph: each cell knows which neighbors it's "linked" to (passage
// exists). Algorithms only touch links; renderers only read them. The two grid
// kinds we support today are:
//
//   RectGrid  — rectangular array of cells, neighbors named N/S/E/W
//   ThetaGrid — concentric rings around a center, neighbors CW/CCW/IN/OUT
//
// Both expose the same shape-agnostic surface that the generic algorithms use:
//   .allCells()       — every cell, in deterministic order
//   .eachCell(fn)     — convenience iterator
//   .edges()          — every undirected edge once (for Kruskal's)
//   .deadEnds()       — cells with exactly one link
//   .start, .end      — designated entry/exit cells (set by the grid type)
//
// A cell exposes:
//   .links              — Set of linked neighbor cells
//   .link / .unlink     — mutate links
//   .isLinked(other)
//   .allNeighbors()     — every neighbor as a flat array
//   .linkedNeighbors()  — only those passed through
//   .unlinkedNeighbors()
//
// Direction-specific access (cell.neighbors.N, etc.) is only set on cells
// whose grid type supports those directions; algorithms that depend on it
// (Binary Tree, Sidewinder, Eller's) are tagged rect-only.

(function (global) {

  // ---------------------------------------------------------------------------
  // Shared Cell. neighbors can be either:
  //   - an object keyed by direction name with single Cell values (rect)
  //   - an object keyed by direction name where some entries are arrays (theta:
  //     a cell's OUT can split into 2 outer-ring cells)
  // allNeighbors() flattens both forms.
  // ---------------------------------------------------------------------------
  class Cell {
    constructor(id) {
      this.id = id;
      this.links = new Set();
      this.neighbors = {};   // shape-specific; filled in by Grid
    }
    link(other, bidi = true) {
      this.links.add(other);
      if (bidi) other.links.add(this);
    }
    unlink(other, bidi = true) {
      this.links.delete(other);
      if (bidi) other.links.delete(this);
    }
    isLinked(other) { return this.links.has(other); }
    allNeighbors() {
      const out = [];
      for (const v of Object.values(this.neighbors)) {
        if (!v) continue;
        if (Array.isArray(v)) { for (const c of v) if (c) out.push(c); }
        else out.push(v);
      }
      return out;
    }
    linkedNeighbors()   { return this.allNeighbors().filter(n => this.isLinked(n)); }
    unlinkedNeighbors() { return this.allNeighbors().filter(n => !this.isLinked(n)); }
  }

  // ---------------------------------------------------------------------------
  // RectGrid — the original rectangular grid. Cells indexed [row][col].
  // ---------------------------------------------------------------------------
  class RectGrid {
    constructor(rows, cols) {
      this.kind = 'rect';
      this.rows = rows;
      this.cols = cols;
      this.cells = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          const cell = new Cell(`${r},${c}`);
          cell.row = r; cell.col = c;
          row.push(cell);
        }
        this.cells.push(row);
      }
      // Wire up neighbor references with directional names.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = this.cells[r][c];
          cell.neighbors.N = r > 0        ? this.cells[r - 1][c] : null;
          cell.neighbors.S = r < rows - 1 ? this.cells[r + 1][c] : null;
          cell.neighbors.W = c > 0        ? this.cells[r][c - 1] : null;
          cell.neighbors.E = c < cols - 1 ? this.cells[r][c + 1] : null;
        }
      }
      this.start = this.cells[0][0];
      this.end   = this.cells[rows - 1][cols - 1];
    }
    get(r, c) {
      if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return null;
      return this.cells[r][c];
    }
    eachCell(fn) {
      for (let r = 0; r < this.rows; r++)
        for (let c = 0; c < this.cols; c++)
          fn(this.cells[r][c]);
    }
    eachRow(fn) { for (let r = 0; r < this.rows; r++) fn(this.cells[r]); }
    allCells() {
      const out = [];
      this.eachCell(c => out.push(c));
      return out;
    }
    // Every undirected edge once: each cell contributes its E and S links.
    edges() {
      const out = [];
      this.eachCell(cell => {
        if (cell.neighbors.E) out.push([cell, cell.neighbors.E]);
        if (cell.neighbors.S) out.push([cell, cell.neighbors.S]);
      });
      return out;
    }
    deadEnds() { return this.allCells().filter(c => c.links.size === 1); }
  }

  // ---------------------------------------------------------------------------
  // ThetaGrid — concentric rings.
  //
  //   ring 0  = single center cell (or sectors[0] = 1)
  //   ring r  = sectors[r] annular-sector cells
  //
  // Sector count doubles whenever the arc length of a single cell on the
  // current ring would exceed ~1.5× the ring depth (cells get visually
  // square-ish). Each cell's OUT neighbor is one or two outer-ring cells
  // depending on whether sector count doubled at that boundary.
  //
  // Neighbor object shape per cell:
  //   { CW, CCW, IN, OUT }
  // where OUT is always an array (0, 1, or 2 entries) — arrays of neighbors
  // are flattened by Cell.allNeighbors().
  // ---------------------------------------------------------------------------
  class ThetaGrid {
    constructor(rings, baseSectors, options = {}) {
      this.kind = 'theta';
      // Configurable: how big the center cell is, relative to ring depth.
      // Default = 1 ring-depth; the rendering layer interprets this.
      this.rings = rings;
      this.baseSectors = baseSectors;
      this.startEnd = options.startEnd || 'center-out';

      // Decide sector counts per ring. Ring 0 is the center cell (always 1).
      // Ring 1 starts at baseSectors. Doubles upward when arc length > 1.5x.
      const sectors = [1];
      // Pretend ring depth is 1 unit when deciding doubling — only the *ratio*
      // matters since the threshold scales the same way the radius does.
      for (let r = 1; r < rings; r++) {
        const prev = sectors[r - 1] || baseSectors;
        if (r === 1) { sectors.push(baseSectors); continue; }
        // Radius at the middle of this ring (in units of ringDepth).
        const radius = r + 0.5;
        const arc = (2 * Math.PI * radius) / prev;
        if (arc > 1.5) sectors.push(prev * 2);
        else sectors.push(prev);
      }
      this.sectors = sectors;

      // Build cells.
      this.cellsByRing = sectors.map((n, r) => {
        const ring = [];
        for (let s = 0; s < n; s++) {
          const cell = new Cell(`${r},${s}`);
          cell.ring = r;
          cell.sector = s;
          ring.push(cell);
        }
        return ring;
      });

      // Wire neighbors.
      for (let r = 0; r < rings; r++) {
        const n = sectors[r];
        for (let s = 0; s < n; s++) {
          const cell = this.cellsByRing[r][s];
          // CW / CCW on same ring (ring 0 is alone so they stay null).
          cell.neighbors.CW  = n > 1 ? this.cellsByRing[r][(s + 1) % n] : null;
          cell.neighbors.CCW = n > 1 ? this.cellsByRing[r][(s - 1 + n) % n] : null;

          // Inward neighbor.
          if (r === 0) {
            cell.neighbors.IN = null;
          } else if (r === 1) {
            // Inner is the single ring-0 cell.
            cell.neighbors.IN = this.cellsByRing[0][0];
          } else {
            const innerN = sectors[r - 1];
            // If sector count doubled at this boundary, each inner cell
            // covers 2 outer sectors. Map s -> floor(s * innerN / n).
            const innerS = Math.floor((s * innerN) / n);
            cell.neighbors.IN = this.cellsByRing[r - 1][innerS];
          }

          // Outward neighbors (array of 0, 1, or 2 cells).
          if (r === rings - 1) {
            cell.neighbors.OUT = [];
          } else if (r === 0) {
            // Center cell: outward = ALL of ring 1.
            cell.neighbors.OUT = [...this.cellsByRing[1]];
          } else {
            const outerN = sectors[r + 1];
            if (outerN === n) {
              cell.neighbors.OUT = [this.cellsByRing[r + 1][s]];
            } else {
              // outerN === 2n; each cell has two outward children.
              cell.neighbors.OUT = [
                this.cellsByRing[r + 1][2 * s],
                this.cellsByRing[r + 1][2 * s + 1],
              ];
            }
          }
        }
      }

      this._applyStartEnd();
    }
    _applyStartEnd() {
      const outerRing = this.cellsByRing[this.rings - 1];
      if (this.startEnd === 'outer-opposite') {
        this.start = outerRing[0];
        this.end   = outerRing[Math.floor(outerRing.length / 2)];
      } else {
        // center-out
        this.start = this.cellsByRing[0][0];
        this.end   = outerRing[0];
      }
    }
    setStartEnd(mode) { this.startEnd = mode; this._applyStartEnd(); }
    eachCell(fn) { for (const ring of this.cellsByRing) for (const c of ring) fn(c); }
    allCells() { const out = []; this.eachCell(c => out.push(c)); return out; }
    // Every undirected edge once: contribute CW and OUT links (which together
    // cover every pair without duplicates: CW covers same-ring edges; OUT
    // covers radial edges; IN/CCW would repeat).
    edges() {
      const out = [];
      this.eachCell(cell => {
        if (cell.neighbors.CW && cell.neighbors.CW !== cell) {
          // Only push CW once per pair: if there are exactly 2 cells in a ring,
          // CW and CCW point to the same cell. Skip when CW===CCW===prev (a
          // 2-cell ring contributes a single edge).
          if (cell.neighbors.CW !== cell.neighbors.CCW || cell.sector === 0) {
            out.push([cell, cell.neighbors.CW]);
          }
        }
        for (const o of cell.neighbors.OUT) out.push([cell, o]);
      });
      return out;
    }
    deadEnds() { return this.allCells().filter(c => c.links.size === 1); }
  }

  // ---------------------------------------------------------------------------
  // HexGrid — rectangular block of pointy-top hexagons using "even-r" offset
  // coordinates (even rows shifted right by half a hex width). Six neighbor
  // directions per cell: W, E, NW, NE, SW, SE.
  //
  // The diagonal-neighbor offsets depend on whether the row is even (shifted)
  // or odd (not shifted) — that's the asymmetry that makes hex grids harder
  // to reason about than rect grids.
  // ---------------------------------------------------------------------------
  class HexGrid {
    constructor(rows, cols) {
      this.kind = 'hex';
      this.rows = rows;
      this.cols = cols;
      this.cells = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          const cell = new Cell(`${r},${c}`);
          cell.row = r; cell.col = c;
          row.push(cell);
        }
        this.cells.push(row);
      }

      const get = (r, c) => {
        if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
        return this.cells[r][c];
      };

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = this.cells[r][c];
          const evenRow = (r % 2 === 0);
          cell.neighbors.W  = get(r, c - 1);
          cell.neighbors.E  = get(r, c + 1);
          if (evenRow) {
            // Even rows are shifted right; the diagonal neighbors sit at
            // (r±1, c) on the up/down-left and (r±1, c+1) on the up/down-right.
            cell.neighbors.NW = get(r - 1, c);
            cell.neighbors.NE = get(r - 1, c + 1);
            cell.neighbors.SW = get(r + 1, c);
            cell.neighbors.SE = get(r + 1, c + 1);
          } else {
            // Odd rows are not shifted; diagonals fall on (r±1, c-1) up/down-left
            // and (r±1, c) up/down-right.
            cell.neighbors.NW = get(r - 1, c - 1);
            cell.neighbors.NE = get(r - 1, c);
            cell.neighbors.SW = get(r + 1, c - 1);
            cell.neighbors.SE = get(r + 1, c);
          }
        }
      }

      this.start = this.cells[0][0];
      this.end   = this.cells[rows - 1][cols - 1];
    }
    get(r, c) {
      if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return null;
      return this.cells[r][c];
    }
    eachCell(fn) {
      for (let r = 0; r < this.rows; r++)
        for (let c = 0; c < this.cols; c++)
          fn(this.cells[r][c]);
    }
    allCells() {
      const out = [];
      this.eachCell(c => out.push(c));
      return out;
    }
    // Every undirected edge once. Contributing E, SE, SW from each cell covers
    // all 6 directions across the pair (the other side gets W, NW, NE) without
    // duplicates.
    edges() {
      const out = [];
      this.eachCell(cell => {
        if (cell.neighbors.E)  out.push([cell, cell.neighbors.E]);
        if (cell.neighbors.SE) out.push([cell, cell.neighbors.SE]);
        if (cell.neighbors.SW) out.push([cell, cell.neighbors.SW]);
      });
      return out;
    }
    deadEnds() { return this.allCells().filter(c => c.links.size === 1); }
  }

  // Back-compat alias — older code referring to Grid still works.
  global.Grid = RectGrid;
  global.Cell = Cell;
  global.RectGrid = RectGrid;
  global.ThetaGrid = ThetaGrid;
  global.HexGrid = HexGrid;
})(window);
