// Seedable PRNG so a given seed always produces the same maze.
// mulberry32 is small, fast, and good enough for puzzles.
(function (global) {
  function hashSeed(str) {
    // Turn an arbitrary string into a 32-bit integer.
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class RNG {
    constructor(seed) {
      this.seed = String(seed ?? Math.floor(Math.random() * 1e9));
      this._next = mulberry32(hashSeed(this.seed));
    }
    next() { return this._next(); }
    int(maxExclusive) { return Math.floor(this.next() * maxExclusive); }
    pick(arr) { return arr[this.int(arr.length)]; }
    shuffle(arr) {
      // Fisher–Yates, in place
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.int(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    chance(p) { return this.next() < p; }
  }

  global.RNG = RNG;
})(window);
