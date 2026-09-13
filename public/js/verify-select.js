const verifyUser = document.getElementById('verify-user');
const selectBtn = document.getElementById('select-btn');
const backLink = document.getElementById('back-link');
const methodStage = document.getElementById('method-stage');
const phoneHint = document.getElementById('phone-hint');
const phone = document.getElementById('phone');
const phoneScreen = document.getElementById('phone-screen');

function init() {
  const session = AppState.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  if (session.integralPassed && session.crosswordPassed) {
    window.location.href = 'home.html';
    return;
  }
  verifyUser.textContent = session.username;
}

selectBtn.addEventListener('click', () => {
  // Reveal the phone and run the puzzle gauntlet inside its screen.
  methodStage.hidden = true;
  phoneHint.hidden = false;
  phone.hidden = false;
  phoneScreen.src = 'verify-integral.html';
  if (window.Chaos) Chaos.start(); // ads + QTEs + jumpscares over the whole screen
});

backLink.addEventListener('click', () => {
  AppState.endSession();
  window.location.href = 'index.html';
});

init();
