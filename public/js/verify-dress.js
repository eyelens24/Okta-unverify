// Third puzzle stage: "the dress" — pick every color present. The correct
// answer is blue and black (white/gold left unchecked). Same lives/fail
// pattern as the crossword and integral stages: wrong answer costs a life
// and sends you all the way back to login.

const optionsEl = document.getElementById('color-options');
const submitBtn = document.getElementById('submit-btn');
const messageEl = document.getElementById('dress-message');

const CORRECT = new Set(['blue', 'black']);

function getSelected() {
  const checked = optionsEl.querySelectorAll('input[type="checkbox"]:checked');
  return new Set(Array.from(checked).map((el) => el.value));
}

function setsEqual(a, b) {
  return a.size === b.size && [...a].every((v) => b.has(v));
}

function passDress() {
  AppState.updateSession({ dressPassed: true });
  messageEl.textContent = 'Verified!';
  messageEl.className = 'message success';
  window.location.href = 'verify-final.html'; // advance within the phone
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

submitBtn.addEventListener('click', () => {
  messageEl.textContent = '';
  messageEl.className = 'message';

  if (setsEqual(getSelected(), CORRECT)) {
    passDress();
    return;
  }

  fail("That's not quite it.");
});

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
  if (!session.integralPassed) {
    window.location.href = 'verify-integral.html'; // step back within the phone
    return;
  }
  if (session.dressPassed) {
    window.location.href = 'verify-final.html'; // advance within the phone
    return;
  }
  renderLives(AppState.getLives());
}

if (window.CheatCode) CheatCode.arm(passDress); // type "solve" anywhere to auto-pass

init();
