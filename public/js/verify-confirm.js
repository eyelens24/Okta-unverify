// First screen shown inside the phone mockup: a fake push notification you
// must tap "Verify" on before the puzzle gauntlet (crossword, then integral)
// is allowed to start — mirrors real Okta Verify requiring you to approve
// the request on your device before MFA proceeds.

const confirmUser = document.getElementById('confirm-user');
const verifyBtn = document.getElementById('verify-btn');
const denyBtn = document.getElementById('deny-btn');
const messageEl = document.getElementById('confirm-message');

function init() {
  const session = AppState.getSession();
  if (!session) {
    navTop('index.html');
    return;
  }
  if (session.finalVerified) {
    navTop('home.html');
    return;
  }
  if (session.crosswordPassed && session.integralPassed && session.dressPassed) {
    window.location.href = 'verify-final.html'; // advance within the phone
    return;
  }
  confirmUser.textContent = session.username;
}

verifyBtn.addEventListener('click', () => {
  window.location.href = 'verify-crossword.html'; // enter the puzzle gauntlet
});

denyBtn.addEventListener('click', () => {
  messageEl.textContent = "Request denied. Sign in again to retry.";
  messageEl.className = 'message error';
  verifyBtn.disabled = true;
  denyBtn.disabled = true;
  AppState.endSession();
  setTimeout(() => {
    navTop('index.html'); // no life lost — you just declined, didn't fail a puzzle
  }, 1200);
});

init();
