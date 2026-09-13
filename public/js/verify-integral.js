const puzzleBox = document.getElementById('puzzle-box');
const form = document.getElementById('answer-form');
const answerInput = document.getElementById('answer');
const messageEl = document.getElementById('answer-message');
const submitBtn = document.getElementById('submit-btn');

let puzzle = null;

function renderExpression(expression) {
  return expression.replace(/\^(\d+)/g, '<sup>$1</sup>');
}

function renderPuzzle({ expression, a, b }) {
  puzzleBox.innerHTML =
    `&#8747;<sub>${a}</sub><sup style="margin-left:-6px">${b}</sup>` +
    ` &nbsp;(${renderExpression(expression)})&nbsp; dx`;
}

function init() {
  const session = AppState.getSession();
  if (!session) {
    navTop('index.html');
    return;
  }
  if (!session.crosswordPassed) {
    window.location.href = 'verify-crossword.html'; // step back within the phone
    return;
  }
  if (session.integralPassed) {
    window.location.href = 'verify-dress.html'; // advance within the phone
    return;
  }

  puzzle = session.integralPuzzle;
  if (!puzzle) {
    puzzle = Integral.generatePuzzle();
    AppState.updateSession({ integralPuzzle: puzzle });
  }

  renderLives(AppState.getLives());
  renderPuzzle(puzzle);
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

function passIntegral() {
  AppState.updateSession({ integralPassed: true, integralPuzzle: null });
  messageEl.textContent = 'Verified!';
  messageEl.className = 'message success';
  window.location.href = 'verify-dress.html'; // advance within the phone
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'message';

  const isCheatCode = answerInput.value.trim() === '67'; // sigma cheat code: always solves

  if (isCheatCode || Integral.checkAnswer(puzzle, answerInput.value)) {
    passIntegral();
    return;
  }

  fail('Incorrect answer.');
});

if (window.CheatCode) CheatCode.arm(passIntegral); // type "solve" anywhere to auto-pass

init();
