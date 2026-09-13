// "Okta Verify Verifier" — a simple 2-step check that runs once, right after
// login and before the real Okta UNVerify method-select screen. The joke:
// nobody verifies that Okta Verify is the actual Okta Verify, so we do that
// first, then hand off to the existing verify-select.html gauntlet.
//
// Deliberately lightweight — wrong picks just show an inline error and let
// you retry. No lives are spent here; that only happens in the real puzzles
// (crossword/integral) inside the phone mockup.

const step1 = document.getElementById('app-step-1');
const step2 = document.getElementById('app-step-2');
const optionsEl = document.getElementById('app-options');
const codeEl = document.getElementById('app-code');
const codeForm = document.getElementById('app-code-form');
const codeInput = document.getElementById('app-code-input');
const messageEl = document.getElementById('app-check-message');

// The real one plus a few lookalike decoys, shuffled each load.
const APPS = [
  { name: 'Okta Verify', real: true },
  { name: '0kta Verify', real: false },
  { name: 'Okta Verify Pro+', real: false },
  { name: 'Verify by Okta', real: false },
];

let code = null;

function showMessage(text, kind) {
  messageEl.textContent = text;
  messageEl.className = 'message' + (kind ? ' ' + kind : '');
}

function shuffledApps() {
  const arr = [...APPS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderStep1() {
  optionsEl.innerHTML = '';
  for (const app of shuffledApps()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'app-option';
    btn.innerHTML =
      `<span class="app-option-icon">&#10003;</span>` +
      `<span class="app-option-name">${app.name}</span>`;
    btn.addEventListener('click', () => {
      if (app.real) {
        showMessage('', '');
        step1.hidden = true;
        step2.hidden = false;
        renderStep2();
      } else {
        showMessage(`"${app.name}" isn't the real Okta Verify. Try again.`, 'error');
      }
    });
    optionsEl.appendChild(btn);
  }
}

const REROLLS_BEFORE_STABLE = 3;
let rerollCount = 0; // how many of this attempt's rerolls have fired so far

function renderStep2() {
  code = String(Math.floor(1000 + Math.random() * 9000));
  codeEl.textContent = code;
  codeInput.value = '';
  rerollCount = 0;
  codeInput.focus();
}

// The code rerolls on each of the first few keystrokes — so whatever you
// saw a moment ago is already stale. It's still solvable: keep typing/
// clearing until the rerolls stop, note the code that finally holds still,
// then clear the box and retype it.
codeInput.addEventListener('input', () => {
  if (rerollCount >= REROLLS_BEFORE_STABLE) return;
  rerollCount++;
  code = String(Math.floor(1000 + Math.random() * 9000));
  codeEl.textContent = code;
});

function passAppCheck() {
  showMessage('', '');
  AppState.updateSession({ appVerified: true });
  window.location.href = 'verify-select.html'; // hand off to the real gauntlet
}

codeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (codeInput.value.trim() === code) {
    passAppCheck();
    return;
  }
  showMessage('That code doesn’t match. Try again.', 'error');
  renderStep2();
});

function init() {
  const session = AppState.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  if (session.appVerified) {
    window.location.href = 'verify-select.html';
    return;
  }
  renderStep1();
}

if (window.CheatCode) CheatCode.arm(passAppCheck); // type "solve" anywhere to auto-pass

init();
