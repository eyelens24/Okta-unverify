// Generic mini-crossword engine (browser build). window.Crossword.
// Derives standard numbering/entries from a solution grid and checks a
// submitted grid against it. Content lives in crossword-data.js.

(function () {
  function isBlack(grid, r, c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return true;
    return grid[r][c] === null;
  }

  function computeEntries(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const entries = [];
    let num = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isBlack(grid, r, c)) continue;
        const startsAcross = isBlack(grid, r, c - 1) && !isBlack(grid, r, c + 1);
        const startsDown = isBlack(grid, r - 1, c) && !isBlack(grid, r + 1, c);
        if (!startsAcross && !startsDown) continue;

        if (startsAcross) {
          const cells = [];
          let cc = c;
          while (!isBlack(grid, r, cc)) {
            cells.push([r, cc]);
            cc++;
          }
          entries.push({ number: num, dir: 'across', cells, answer: cells.map(([rr, ccc]) => grid[rr][ccc]).join('') });
        }

        if (startsDown) {
          const cells = [];
          let rr = r;
          while (!isBlack(grid, rr, c)) {
            cells.push([rr, c]);
            rr++;
          }
          entries.push({ number: num, dir: 'down', cells, answer: cells.map(([r2, c2]) => grid[r2][c2]).join('') });
        }

        num++;
      }
    }
    return entries;
  }

  function getPuzzleForDate(puzzles, date) {
    const day = (date || new Date()).getDay();
    const puzzle = puzzles[day % puzzles.length];
    const entries = computeEntries(puzzle.grid).map(({ number, dir, cells, answer }) => ({
      number,
      dir,
      cells,
      length: answer.length,
      clue: puzzle.clues[`${number}${dir}`],
    }));
    return { grid: puzzle.grid, entries };
  }

  function publicPuzzle(puzzle) {
    return {
      shape: puzzle.grid.map((row) => row.map((cell) => (cell === null ? null : ''))),
      entries: puzzle.entries.map(({ number, dir, cells, length, clue }) => ({
        number,
        dir,
        cells,
        length,
        clue,
      })),
    };
  }

  function checkGrid(puzzle, submittedGrid) {
    const { grid } = puzzle;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === null) continue;
        const submitted = ((submittedGrid && submittedGrid[r] && submittedGrid[r][c]) || '')
          .toString()
          .trim()
          .toUpperCase();
        if (submitted !== grid[r][c]) return false;
      }
    }
    return true;
  }

  window.Crossword = { getPuzzleForDate, publicPuzzle, checkGrid };
})();
