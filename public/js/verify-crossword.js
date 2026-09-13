const gridEl = document.getElementById('crossword-grid');
const acrossEl = document.getElementById('across-clues');
const downEl = document.getElementById('down-clues');
const submitBtn = document.getElementById('submit-btn');
const messageEl = document.getElementById('cw-message');

let solutionPuzzle = null; // full puzzle with answers (for local checking)
let shape = null;
let entries = null;
let cellIndex = {};
let currentR = 0;
let currentC = 0;
let currentDir = 'across';

function isWhite(r, c) {
  return shape[r] !== undefined && shape[r][c] !== undefined && shape[r][c] !== null;
}

function getEntryAt(r, c, dir) {
  return cellIndex[`${r},${c}`]?.[dir] || null;
}

function getInputEl(r, c) {
  return gridEl.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
}

function buildCellIndex() {
  cellIndex = {};
  for (const entry of entries) {
    for (const [r, c] of entry.cells) {
      const key = `${r},${c}`;
      if (!cellIndex[key]) cellIndex[key] = { across: null, down: null };
      cellIndex[key][entry.dir] = entry;
    }
  }
}

function renderGrid() {
  const rows = shape.length;
  const cols = shape[0].length;
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 48px)`;
  gridEl.innerHTML = '';

  const startNumbers = {};
  for (const entry of entries) {
    const [r, c] = entry.cells[0];
    startNumbers[`${r},${c}`] = entry.number;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellDiv = document.createElement('div');
      if (shape[r][c] === null) {
        cellDiv.className = 'cw-cell black';
        gridEl.appendChild(cellDiv);
        continue;
      }

      cellDiv.className = 'cw-cell';
      const key = `${r},${c}`;
      if (startNumbers[key] !== undefined) {
        const num = document.createElement('span');
        num.className = 'cw-num';
        num.textContent = startNumbers[key];
        cellDiv.appendChild(num);
      }

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.autocomplete = 'off';
      input.dataset.r = r;
      input.dataset.c = c;

      input.addEventListener('click', () => {
        if (currentR === r && currentC === c) {
          const other = currentDir === 'across' ? 'down' : 'across';
          if (getEntryAt(r, c, other)) selectCell(r, c, other);
        } else {
          selectCell(r, c);
        }
      });

      input.addEventListener('input', () => {
        let v = input.value.toUpperCase().replace(/[^A-Z]/g, '');
        v = v.slice(-1);
        input.value = v;
        if (v) {
          const entry = getEntryAt(currentR, currentC, currentDir);
          const idx = entry.cells.findIndex(([rr, cc]) => rr === currentR && cc === currentC);
          if (idx < entry.cells.length - 1) {
            const [nr, nc] = entry.cells[idx + 1];
            selectCell(nr, nc, currentDir);
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          e.preventDefault();
          if (input.value) {
            input.value = '';
          } else {
            const entry = getEntryAt(currentR, currentC, currentDir);
            const idx = entry.cells.findIndex(([rr, cc]) => rr === currentR && cc === currentC);
            if (idx > 0) {
              const [pr, pc] = entry.cells[idx - 1];
              selectCell(pr, pc, currentDir);
              getInputEl(pr, pc).value = '';
            }
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (isWhite(currentR, currentC + 1)) selectCell(currentR, currentC + 1, 'across');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (isWhite(currentR, currentC - 1)) selectCell(currentR, currentC - 1, 'across');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (isWhite(currentR + 1, currentC)) selectCell(currentR + 1, currentC, 'down');
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (isWhite(currentR - 1, currentC)) selectCell(currentR - 1, currentC, 'down');
        }
      });

      cellDiv.appendChild(input);
      gridEl.appendChild(cellDiv);
    }
  }
}

function renderClues() {
  acrossEl.innerHTML = '';
  downEl.innerHTML = '';
  const sorted = [...entries].sort((a, b) => a.number - b.number);
  for (const entry of sorted) {
    const item = document.createElement('div');
    item.className = 'clue-item';
    item.id = `clue-${entry.number}-${entry.dir}`;
    item.textContent = `${entry.number}. ${entry.clue}`;
    item.addEventListener('click', () => {
      const [r, c] = entry.cells[0];
      selectCell(r, c, entry.dir);
    });
    (entry.dir === 'across' ? acrossEl : downEl).appendChild(item);
  }
}

function selectCell(r, c, dir) {
  if (!isWhite(r, c)) return;
  let d = dir;
  if (!d) {
    d = getEntryAt(r, c, currentDir) ? currentDir : currentDir === 'across' ? 'down' : 'across';
  }
  if (!getEntryAt(r, c, d)) {
    d = getEntryAt(r, c, 'across') ? 'across' : 'down';
  }
  currentR = r;
  currentC = c;
  currentDir = d;

  gridEl.querySelectorAll('input').forEach((el) => el.classList.remove('active', 'in-word'));
  document.querySelectorAll('.clue-item').forEach((el) => el.classList.remove('active'));

  const entry = getEntryAt(r, c, d);
  if (entry) {
    for (const [er, ec] of entry.cells) {
      const el = getInputEl(er, ec);
      if (el) el.classList.add('in-word');
    }
    const clueItem = document.getElementById(`clue-${entry.number}-${entry.dir}`);
    if (clueItem) clueItem.classList.add('active');
  }

  const activeInput = getInputEl(r, c);
  if (activeInput) {
    activeInput.classList.add('active');
    activeInput.focus();
  }
}

function init() {
  const session = AppState.getSession();
  if (!session) {
    navTop('index.html');
    return;
  }
  if (session.crosswordPassed) {
    window.location.href = 'verify-integral.html'; // advance within the phone
    return;
  }

  solutionPuzzle = Crossword.getPuzzleForDate(window.CROSSWORD_PUZZLES);
  const pub = Crossword.publicPuzzle(solutionPuzzle);
  shape = pub.shape;
  entries = pub.entries;

  buildCellIndex();
  renderGrid();
  renderClues();
  renderLives(AppState.getLives());
  selectCell(0, 0);
}

function fail(message) {
  const lives = AppState.failAttempt();
  renderLives(lives);
  if (lives <= 0) {
    messageEl.textContent = message + " You're out of attempts for today — come back tomorrow.";
  } else {
    messageEl.textContent = message + ` Sent back to the start. Lives remaining: ${lives}.`;
  }
  messageEl.className = 'message error';
  submitBtn.disabled = true;
  setTimeout(() => {
    navTop('index.html'); // wrong answer → break out of the phone, back to login
  }, 1800);
}

function passCrossword() {
  AppState.updateSession({ crosswordPassed: true });
  messageEl.textContent = 'Verified!';
  messageEl.className = 'message success';
  window.location.href = 'verify-integral.html'; // advance within the phone
}

submitBtn.addEventListener('click', () => {
  messageEl.textContent = '';
  messageEl.className = 'message';

  const rows = shape.length;
  const cols = shape[0].length;
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(shape[r][c] === null ? null : getInputEl(r, c).value || '');
    }
    grid.push(row);
  }

  if (Crossword.checkGrid(solutionPuzzle, grid)) {
    passCrossword();
    return;
  }

  fail("That grid isn't quite right.");
});

if (window.CheatCode) CheatCode.arm(passCrossword); // type "solve" anywhere to auto-pass

init();
