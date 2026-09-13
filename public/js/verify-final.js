// The final screen after both puzzles are solved: a "Verify" button that
// teleports somewhere far away on the screen the instant the cursor touches
// it. After 5 dodges it gives up and sits still so it can actually be
// clicked — which reveals a joke "wire $10 to a bank" payment gate that
// can't actually be completed for real. No real payment is ever collected;
// the only way through is the "solve" cheat code.

const btn = document.getElementById('final-verify-btn');
const hintEl = document.getElementById('final-hint');
const dodgeZone = document.getElementById('dodge-zone');
const paymentGate = document.getElementById('payment-gate');
const paidBtn = document.getElementById('paid-btn');
const paymentMessageEl = document.getElementById('payment-message');
const messageEl = document.getElementById('final-message');

const STALL_EXCUSES = [
  "Your bank is still processing the wire. Please allow 3–5 business days.",
  "We received a payment, but it wasn't from you. Please try again.",
  "Wire bounced back to sender. Please re-visit your bank and retry.",
  "Our fictional bank is experiencing a fictional outage. Please retry later.",
  "Still waiting. Some banks are slower than others.",
];
let stallIndex = 0;

const MAX_DODGES = 5;
let hoverCount = 0;

function dodge() {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const btnRect = btn.getBoundingClientRect();
  const maxLeft = Math.max(0, vw - btnRect.width);
  const maxTop = Math.max(0, vh - btnRect.height);

  // Wherever the button is right now is (approximately) where the cursor
  // just landed to trigger this hover — so "far from the mouse" means far
  // from the button's current spot. Require at least half the screen's
  // diagonal of distance, anywhere on screen, retrying a few times.
  const fromX = btnRect.left + btnRect.width / 2;
  const fromY = btnRect.top + btnRect.height / 2;
  const minDistance = Math.hypot(vw, vh) * 0.5;

  let left, top, tries = 0;
  do {
    left = Math.random() * maxLeft;
    top = Math.random() * maxTop;
    tries++;
  } while (
    Math.hypot(left + btnRect.width / 2 - fromX, top + btnRect.height / 2 - fromY) < minDistance &&
    tries < 30
  );

  btn.style.transform = 'none';
  btn.style.left = `${left}px`;
  btn.style.top = `${top}px`;
}

btn.addEventListener('mouseenter', () => {
  if (hoverCount >= MAX_DODGES) return; // it's settled now — let the click land
  hoverCount++;
  dodge();
  if (hoverCount >= MAX_DODGES) {
    btn.classList.add('settled');
    hintEl.textContent = 'Alright, alright — hold still. Click it.';
  } else {
    hintEl.textContent = `Nice try. (${hoverCount}/${MAX_DODGES})`;
  }
});

function showPaymentGate() {
  btn.hidden = true;
  dodgeZone.hidden = true;
  hintEl.textContent = 'Almost there.';
  paymentGate.hidden = false;
}

function finish() {
  AppState.updateSession({ finalVerified: true });
  messageEl.textContent = 'Verified!';
  messageEl.className = 'message success';
  navTop('home.html'); // fully verified → take over the whole screen
}

btn.addEventListener('click', () => {
  if (hoverCount < MAX_DODGES) return; // still dodging, shouldn't be reachable — just in case
  showPaymentGate();
});

// Clicking "I've completed my wire transfer" never actually finishes — it's
// a joke gate with no real payment involved. Cycle through stalling excuses.
paidBtn.addEventListener('click', () => {
  paymentMessageEl.textContent = STALL_EXCUSES[stallIndex % STALL_EXCUSES.length];
  paymentMessageEl.className = 'message';
  stallIndex++;
});

function init() {
  const session = AppState.getSession();
  if (!session) {
    navTop('index.html');
    return;
  }
  if (!session.crosswordPassed || !session.integralPassed || !session.dressPassed) {
    window.location.href = 'verify-crossword.html'; // step back — puzzles not done yet
    return;
  }
  if (session.finalVerified) {
    navTop('home.html');
    return;
  }
}

if (window.CheatCode) CheatCode.arm(finish); // type "solve" anywhere to auto-pass

init();
