// Grid + Cell abstraction.
//
// A maze is a graph where each cell knows which of its neighbors it is "linked"
// to (i.e. a passage exists between them). Generation algorithms only touch
// links; rendering only reads them. This lets us swap one without the other.
(function (global) {
  class Cell {
    constructor(row, col) {
      this.row = row;
      this.col = col;
      this.links = new Set();   // references to linked neighbor cells
      this.neighbors = {};      // { N, S, E, W } -> Cell | null
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
    linkedNeighbors() {
      return Object.values(this.neighbors).filter(n => n && this.isLinked(n));
    }
    unlinkedNeighbors() {
      return Object.values(this.neighbors).filter(n => n && !this.isLinked(n));
    }
    allNeighbors() {
      return Object.values(this.neighbors).filter(Boolean);
    }
  }

  class Grid {
    constructor(rows, cols) {
      this.rows = rows;
      this.cols = cols;
      this.cells = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) row.push(new Cell(r, c));
        this.cells.push(row);
      }
      // Wire up neighbor references once.
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
    deadEnds() {
      return this.allCells().filter(c => c.links.size === 1);
    }
  }

  global.Grid = Grid;
  global.Cell = Cell;
})(window);
