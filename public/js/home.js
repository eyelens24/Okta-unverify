const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logout-btn');

function init() {
  const session = AppState.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  if (!session.crosswordPassed) {
    window.location.href = 'verify-crossword.html';
    return;
  }
  if (!session.integralPassed) {
    window.location.href = 'verify-integral.html';
    return;
  }
  if (!session.dressPassed) {
    window.location.href = 'verify-dress.html';
    return;
  }
  welcomeText.textContent = `Welcome, ${session.username}.`;
}

logoutBtn.addEventListener('click', () => {
  AppState.endSession();
  window.location.href = 'index.html';
});

init();
