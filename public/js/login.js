// The login screen is just set dressing — the puzzles are the main attraction —
// so any non-empty username/password is accepted and sends you straight in.
const stepUsername = document.getElementById('step-username');
const stepPassword = document.getElementById('step-password');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameEcho = document.getElementById('username-echo');
const messageEl = document.getElementById('login-message');

function showMessage(text, kind) {
  messageEl.textContent = text;
  messageEl.className = 'message' + (kind ? ' ' + kind : '');
}

function checkLockout() {
  if (AppState.isLockedOut()) {
    stepUsername.hidden = true;
    stepPassword.hidden = true;
    showMessage("You're out of attempts for today. Come back tomorrow.", 'error');
    return true;
  }
  return false;
}

stepUsername.addEventListener('submit', (e) => {
  e.preventDefault();
  if (checkLockout()) return;
  const username = usernameInput.value.trim();
  if (!username) {
    showMessage('Please enter a username.', 'error');
    return;
  }
  showMessage('', '');
  usernameEcho.textContent = username;
  stepUsername.hidden = true;
  stepPassword.hidden = false;
  passwordInput.focus();
});

stepPassword.addEventListener('submit', (e) => {
  e.preventDefault();
  if (checkLockout()) return;

  const username = usernameInput.value.trim();
  AppState.startSession(username || 'guest');
  window.location.href = 'app-check.html';
});

checkLockout();
