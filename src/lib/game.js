const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = [
  [0,1,2,3,4,5,6,7,8],
  [9,10,11,12,13,14,15,16,17],
  [18,19,20,21,22,23,24,25,26],
  [27,28,29,30,31,32,33,34,35],
  [36,37,38,39,40,41,42,43,44],
  [45,46,47,48,49,50,51,52,53],
  [54,55,56,57,58,59,60,61,62],
  [63,64,65,66,67,68,69,70,71],
  [72,73,74,75,76,77,78,79,80],
];
const rownum = (idx) => Math.floor(idx / 9);

const cols = [
  [0,9,18,27,36,45,54,63,72],
  [1,10,19,28,37,46,55,64,73],
  [2,11,20,29,38,47,56,65,74],
  [3,12,21,30,39,48,57,66,75],
  [4,13,22,31,40,49,58,67,76],
  [5,14,23,32,41,50,59,68,77],
  [6,15,24,33,42,51,60,69,78],
  [7,16,25,34,43,52,61,70,79],
  [8,17,26,35,44,53,62,71,80],
];
const colnum = (idx) => (idx % 9);

const blocks = [
  [0,1,2,9,10,11,18,19,20],
  [3,4,5,12,13,14,21,22,23],
  [6,7,8,15,16,17,24,25,26],
  [27,28,29,36,37,38,45,46,47],
  [30,31,32,39,40,41,48,49,50],
  [33,34,35,42,43,44,51,52,53],
  [54,55,56,63,64,65,72,73,74],
  [57,58,59,66,67,68,75,76,77],
  [60,61,62,69,70,71,78,79,80],
];
const blocknum = (idx) => (Math.floor(rownum(idx) / 3) * 3) + Math.floor(colnum(idx) / 3);

export class Sudoku {
  constructor(init) {
    this.init = init;
    this.data = init.slice(0);
    /*
    this.data = [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    */
    this.possible = new Array(81).fill().map(() => []);
    this.stack = [];
    this.pad = new Array(81).fill().map(() => null);
    this.recalculate();
  }

  generate() {
    const origInit = this.init.slice(0);
    const origData = this.data.slice(0);
    this.init = new Array(81).fill(0);
    this.data = this.init.slice(0);
    this.recalculate();
    let nums = new Array(81).fill(0).map((v, i) => i);
    let filled = 0;
    const used = new Set();
    while (filled < 17 && used.size < 8) {
      console.debug('filling %o', { filled, used: used.size });
      const n = Math.floor(Math.random() * nums.length);
      nums = nums.filter((v) => v !== n);
      const pos = this.possible[n];
      if (pos.length === 0) {
        console.debug('invalid puzzle, retry');
        return this.generate();
        /*
        this.init = origInit;
        this.data = origData;
        this.recalculate();
        return false;
        */
      }
      const m = Math.floor(Math.random() * pos.length);
      this.setIdx(n, pos[m]);
      filled += 1;
      used.add(pos[m]);
    }
    this.init = this.data.slice(0);
    console.debug('checking puzzle for a solution');
    if (this.fullSolve(this.data.slice(0)) === null) {
      console.debug('bad puzzle, retry');
      return this.generate();
    }
    const solution = this.data.slice(0);
    let remove = [];
    nums = new Array(81).fill(0).map((v, i) => i);
    const k = Math.floor(Math.random() * nums.length);
    nums = nums.slice(k).concat(nums).slice(0, 81);
    /*
    const xnums = new Array(81).fill(0);
    for (let j = 0; j < 81; j += 1) {
      const k = Math.floor(Math.random() * nums.length);
      xnums[k] = nums[k];
      nums = nums.filter((x) => x !== nums[k]);
    }
    nums = xnums;
    */
    let skip = 0;
    while (skip < nums.length) {
      this.init = solution.slice(0);
      remove.forEach((r) => this.init[r] = 0);
      this.init[nums[skip]] = 0;
      this.data = this.init.slice(0);
      if (this.numSolutions(this.init.slice(0), 0) > 1) {
        skip += 1;
      } else {
        remove.push(nums[skip]);
        nums = nums.slice(0, skip).concat(nums.slice(skip + 1));
      }
    }
    this.init = solution.slice(0);
    remove.forEach((r) => this.init[r] = 0);
    /*
    console.debug('checking puzzle for multiple solutions');
    while (filled < 81) {
      const s = this.numSolutions(this.init.slice(0), 0);
      if (s === 1) {
        break;
      }
      if (s === 0) {
        console.debug('no solution, try again');
        return this.generate();
      }
      console.debug('multiple solutions, add more %o', filled);
      const solution = this.fullSolve(this.init.slice(0));
      this.data = this.init.slice(0);
      this.recalculate();
      let updated = false;
      const init = this.init.slice(0);
      const possible = this.possible.slice(0);
      for (let j = 2; j <= 9; j += 1) {
        const unfilled = this.init.map((v, i) => [v, i]).filter(([v, i]) => v === 0 && this.possible[i].length === j).map((x) => x[1]);
        updated = unfilled.some((i) => {
          const pos = possible[i];
          let idx = pos.findIndex((v) => v === solution[i]);
          if (idx < 0) {
            return false;
          }
          idx += 1;
          if (idx >= pos.length) {
            return false;
          }
          this.data = init.slice(0);
          this.data[i] = pos[idx];
          this.recalculate();
          if (this.fullSolve(this.data.slice(0)) !== null) {
            this.init[i] = pos[idx];
            return true;
          }
          return false;
        });
        if (updated) {
          filled += 1;
          break;
        }
      }
      if (!updated) {
        console.debug('no update!');
        break;
      }
    }
    */
    console.debug('got a good puzzle');
    this.data = this.init.slice(0);
    this.recalculate();
    this.stack = [];
    return true;
  }

  reset(data) {
    if (data) {
      this.init = data.slice(0);
      this.stack = [];
    }
    this.data = this.init.slice(0);
    this.recalculate();
  }

  push() {
    this.stack.push(this.data.slice(0));
  }

  pop() {
    const data = this.stack.pop();
    if (!data) {
      this.data = this.init.slice(0);
    } else {
      data.forEach((v, i) => {
        if (this.init[i] === 0) {
          this.data[i] = v;
        } else {
          this.data[i] = this.init[i];
        }
      });
    }
    this.recalculate();
  }

  row(idx) {
    return rows[rownum(idx)].map((i) => this.data[i]);
  }

  col(idx) {
    return cols[colnum(idx)].map((i) => this.data[i]);
  }

  block(idx) {
    return blocks[blocknum(idx)].map((i) => this.data[i]);
  }

  grid() {
    return rows.map((row) => {
      return row.map((i) => {
        if (this.init[i] !== 0) {
          return { value: this.init[i], type: 'init' };
        }
        if (this.data[i] === 0) {
          if (this.pad[i]) {
            const pos = new Set(this.possible[i]);
            const pad = this.pad[i].filter((v) => pos.has(v));
            return { value: pad, type: 'pad' };
          }
          return { value: this.possible[i], type: 'hint' };
        }
        return { value: this.data[i], type: 'play' };
      });
    });
  }

  setIdx(idx, val) {
    if (this.init[idx] !== 0) {
      return;
    }
    if (val !== 0 && !this.canBe(idx, val)) {
      return false;
    }
    this.data[idx] = val;
    this.recalculate();
    return true;
  }

  setSquare(row, col, val) {
    const n = row * 9 + col;
    return this.setIdx(n, val);
  }

  canBe(idx, val) {
    if (this.row(idx).includes(val)) {
      return false;
    }
    if (this.col(idx).includes(val)) {
      return false;
    }
    if (this.block(idx).includes(val)) {
      return false;
    }
    return true;
  }

  recalculate() {
    for (let i = 0; i < 81; i += 1) {
      if (this.data[i] !== 0) {
        this.possible[i] = [this.data[i]];
      } else {
        this.possible[i] = nums.filter((n) => this.canBe(i, n));
      }
    }
    let again = true;
    while (again) {
      again = rows.some((row) => this.checkPairs(row));
      again = cols.some((col) => this.checkPairs(col)) || again;
      again = blocks.some((block) => this.checkPairs(block)) || again;
    }
  }

  checkPairs(chunk) {
    const pos = chunk.map((i) => ([i, this.possible[i]]));
    let again = false;
    for (let i = 0; i < 9; i += 1) {
      if (pos[i][1].length === 2) {
        for (let j = i + 1; j < 9; j += 1) {
          if (pos[j][1].length === 2) {
            if (pos[i][1][0] === pos[j][1][0] && pos[i][1][1] === pos[j][1][1]) {
              for (let k = 0; k < 9; k += 1) {
                if (k !== i && k !== j) {
                  if (pos[k][1].includes(pos[i][1][0])) {
                    this.possible[pos[k][0]] = pos[k][1].filter(v => v !== pos[i][1][0]);
                    again = true;
                  }
                  if (pos[k][1].includes(pos[i][1][1])) {
                    this.possible[pos[k][0]] = pos[k][1].filter(v => v !== pos[i][1][1]);
                    again = true;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (again) {
      this.checkPairs(chunk);
      return true;
    }
    return false;
  }

  onlySpot(chunk, val) {
    const data = chunk.map((i) => this.data[i]);
    if (data.includes(val)) {
      return false;
    }
    const pos = chunk.map((i) => [i, this.possible[i]]);
    const match = pos.filter((p) => p[1].includes(val));
    if (match.length === 1) {
      return this.setIdx(match[0][0], val);
    }
    return false;
  }

  fullSolve(values) {
    this.data = values.slice(0);
    this.recalculate();
    let again = true;
    while (again) {
      again = this.solve();
    }
    const lens = this.possible.map((vals) => vals.length);
    let min = Math.min(...lens);
    if (min === 0) {
      return null;
    }
    min = Math.min(...lens.filter(l => l > 1));
    const max = Math.max(...lens);
    if (max === 1) {
      return this.data.slice(0);
    }
    const data = this.data.slice(0);
    const idx = this.possible.findIndex((vals) => vals.length === min);
    const vals = this.possible[idx];
    for (let i = 0; i < min; i += 1) {
      data[idx] = vals[i];
      const resp = this.fullSolve(data.slice(0));
      if (resp !== null) {
        return resp;
      }
    }
    return null;
  }

  numSolutions(values, depth) {
    //console.debug('numSolutions(%o)', depth);
    this.data = values.slice(0);
    this.recalculate();
    let again = true;
    while (again) {
      again = this.solve();
    }
    const lens = this.possible.map((vals) => vals.length);
    let min = Math.min(...lens);
    if (min === 0) {
      return 0;
    }
    min = Math.min(...lens.filter(l => l > 1));
    const max = Math.max(...lens);
    if (max === 1) {
      return 1;
    }
    const data = this.data.slice(0);
    const idx = this.possible.findIndex((vals) => vals.length === min);
    const vals = this.possible[idx];
    let solutions = 0;
    for (let i = 0; i < min; i += 1) {
      data[idx] = vals[i];
      solutions += this.numSolutions(data.slice(0), depth + 1);
      if (solutions > 1) {
        return solutions;
      }
    }
    return solutions;
  }

  solve() {
    let again = false;
    this.possible.forEach((vals, i) => {
      if (again) {
        return true;
      }
      if (this.data[i] === 0 && vals.length === 1) {
        again = true;
        this.setIdx(i, vals[0]);
      }
    });
    nums.forEach((val) => {
      if (again) {
        return true;
      }
      again = rows.map((row) => this.onlySpot(row, val))
        .concat([again])
        .filter(res => res).length > 0;
      if (again) {
        return true;
      }
      again = cols.map((col) => this.onlySpot(col, val))
        .concat([again])
        .filter(res => res).length > 0;
      if (again) {
        return true;
      }
      again = blocks.map((block) => this.onlySpot(block, val))
        .concat([again])
        .filter(res => res).length > 0;
      if (again) {
        return true;
      }
    });
    return again;
  }

}

export default Sudoku;
