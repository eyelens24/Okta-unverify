// Chaos layer: annoying ads + quick-time events, plus a jumpscare when the
// player misses the tiny X on an ad. Purely for annoyance — none of this
// touches lives or the main puzzles. Call Chaos.start() to begin.

(function () {
  const JUMPSCARE_SRC = 'img/jumpscare.png';

  const AD_LINES = [
    ['YOU ARE THE 1,000,000th VISITOR', 'Claim your prize now!'],
    ['HOT SINGLE INTEGRALS', 'in your area right now'],
    ['CONGRATULATIONS!', 'Your device may be eligible'],
    ['⚠ SYSTEM ALERT ⚠', 'Definitely not a virus'],
    ['FREE iPHONE 47', 'Just tap to continue'],
    ['MELBOURNE MUM DISCOVERS', 'one weird trick for MFA'],
    ['CLICK NOW', 'before it is too late'],
    ['LOW TAPER FADE', 'is still massive'],
  ];

  const QTE_KEYS = [
    { key: 'e', label: 'E' },
    { key: ' ', label: 'SPACE' },
    { key: 'f', label: 'F' },
  ];

  const MAX_QTE = 5; // the mash popup appears at most this many times
  const MAX_ADS = 2; // at most this many ads on screen at once

  let running = false;
  let adTimer = null;
  let qteTimer = null;
  let qteActive = false;
  let qteShown = 0;
  const ads = new Set();
  let adBackdrop = null; // blocks clicks on everything else while an ad is up

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }
  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  // ---- Jumpscare ----
  function jumpscare() {
    const img = document.createElement('img');
    img.className = 'chaos-scare';
    img.src = JUMPSCARE_SRC;

    // If the real image isn't there yet, fall back to a big emoji.
    img.onerror = () => {
      img.remove();
      const emoji = document.createElement('div');
      emoji.className = 'chaos-scare-emoji';
      emoji.textContent = '🐀';
      placeInViewport(emoji, 30 * window.innerWidth / 100, 30 * window.innerWidth / 100);
      document.body.appendChild(emoji);
      setTimeout(() => emoji.remove(), 300);
    };

    // Place once we know its size.
    img.onload = () => {
      placeInViewport(img, img.width, img.height);
    };

    document.body.appendChild(img);
    setTimeout(() => img.remove(), 320);
  }

  function placeInViewport(el, w, h) {
    const maxLeft = Math.max(0, window.innerWidth - w);
    const maxTop = Math.max(0, window.innerHeight - h);
    el.style.left = rand(0, maxLeft) + 'px';
    el.style.top = rand(0, maxTop) + 'px';
  }

  // ---- "HAHA BOZO" taunt ----
  // A quick floating taunt near wherever an ad just teleported to.
  function showBozo(x, y) {
    const el = document.createElement('div');
    el.className = 'chaos-bozo';
    el.textContent = 'HAHA BOZO';
    const w = 200;
    const left = Math.min(Math.max(4, x - w / 2), window.innerWidth - w - 4);
    const top = Math.min(Math.max(4, y), window.innerHeight - 40);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 650);
  }

  // ---- Ads ----
  // While any ad is on screen, a full-viewport backdrop (just under the ads'
  // z-index) swallows clicks aimed at the puzzle behind it — you have to
  // deal with the ad(s) first. Removed once the last ad is gone.
  function syncAdBackdrop() {
    if (ads.size > 0 && !adBackdrop) {
      adBackdrop = document.createElement('div');
      adBackdrop.className = 'chaos-ad-backdrop';
      document.body.appendChild(adBackdrop);
    } else if (ads.size === 0 && adBackdrop) {
      adBackdrop.remove();
      adBackdrop = null;
    }
  }

  // Moves an ad to a fresh random spot and fires a "HAHA BOZO" taunt next to it.
  function teleportAd(ad) {
    const w = ad.offsetWidth || 240;
    const h = ad.offsetHeight || 120;
    const left = rand(8, Math.max(8, window.innerWidth - w - 8));
    const top = rand(8, Math.max(8, window.innerHeight - h - 8));
    ad.style.left = left + 'px';
    ad.style.top = top + 'px';
    showBozo(left + w / 2, Math.max(4, top - 26));
  }

  function spawnAd() {
    if (!running) return;
    if (ads.size < MAX_ADS) {
      const ad = document.createElement('div');
      ad.className = 'chaos-ad';

      const [headline, sub] = pick(AD_LINES);
      ad.innerHTML =
        '<div class="chaos-ad-tag">Advertisement</div>' +
        `<div class="chaos-ad-headline">${headline}</div>` +
        `<div class="chaos-ad-sub">${sub}</div>` +
        '<div class="chaos-ad-close" title="Close">✕</div>';

      // Random position within the viewport (240x~110 box).
      const w = 240;
      const h = 120;
      ad.style.left = rand(8, Math.max(8, window.innerWidth - w - 8)) + 'px';
      ad.style.top = rand(8, Math.max(8, window.innerHeight - h - 8)) + 'px';

      const closeBtn = ad.querySelector('.chaos-ad-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // clean hit on the X → no scare
        removeAd(ad);
      });

      // Any click on the ad that ISN'T the X = a miss → jumpscare.
      ad.addEventListener('click', () => {
        jumpscare();
        removeAd(ad);
      });

      document.body.appendChild(ad);
      ads.add(ad);
      syncAdBackdrop();

      // Keep teleporting around the screen (with a taunt) until closed.
      ad._moveTimer = setInterval(() => teleportAd(ad), randInt(3500, 6000));
    }

    adTimer = setTimeout(spawnAd, randInt(10000, 18000));
  }

  function removeAd(ad) {
    clearInterval(ad._moveTimer);
    ads.delete(ad);
    ad.remove();
    syncAdBackdrop();
  }

  // ---- Quick-time events ----
  function spawnQTE() {
    if (qteShown >= MAX_QTE) return; // hit the cap — stop popping up entirely
    if (!running || qteActive) {
      qteTimer = setTimeout(spawnQTE, randInt(10000, 20000));
      return;
    }
    qteActive = true;
    qteShown++;

    const target = randInt(12, 20);
    const keyDef = pick(QTE_KEYS);
    let count = 0;
    let timeLeft = 6.0;

    const backdrop = document.createElement('div');
    backdrop.className = 'chaos-qte-backdrop';
    backdrop.innerHTML =
      '<div class="chaos-qte" tabindex="-1">' +
      '<div class="chaos-qte-title">QUICK! ⚡</div>' +
      `<div class="chaos-qte-instr">Mash <b>${keyDef.label}</b> (or the button) <b>${target}</b> times!</div>` +
      '<div class="chaos-qte-bar"><div class="chaos-qte-fill"></div></div>' +
      `<div class="chaos-qte-count"><span class="cnt">0</span> / ${target} &nbsp;·&nbsp; <span class="chaos-qte-timer">6.0s</span></div>` +
      `<button class="chaos-qte-btn" type="button">MASH ${keyDef.label}</button>` +
      '</div>';

    document.body.appendChild(backdrop);
    const box = backdrop.querySelector('.chaos-qte');
    const fill = backdrop.querySelector('.chaos-qte-fill');
    const cntEl = backdrop.querySelector('.cnt');
    const timerEl = backdrop.querySelector('.chaos-qte-timer');
    const btn = backdrop.querySelector('.chaos-qte-btn');

    box.focus();

    function bump() {
      count++;
      cntEl.textContent = count;
      fill.style.width = Math.min(100, (count / target) * 100) + '%';
      if (count >= target) finish();
    }

    function onKey(e) {
      const k = e.key.toLowerCase();
      if (k === keyDef.key) {
        e.preventDefault();
        bump();
      }
    }

    const tick = setInterval(() => {
      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        // Ran out of time: reset (annoying, but no life lost).
        count = 0;
        timeLeft = 6.0;
        cntEl.textContent = '0';
        fill.style.width = '0%';
        box.classList.add('shake');
        setTimeout(() => box.classList.remove('shake'), 350);
      }
      timerEl.textContent = Math.max(0, timeLeft).toFixed(1) + 's';
    }, 100);

    function finish() {
      clearInterval(tick);
      document.removeEventListener('keydown', onKey, true);
      backdrop.remove();
      qteActive = false;
      qteTimer = setTimeout(spawnQTE, randInt(10000, 20000));
    }

    btn.addEventListener('click', bump);
    document.addEventListener('keydown', onKey, true);
  }

  window.Chaos = {
    start() {
      if (running) return;
      running = true;
      adTimer = setTimeout(spawnAd, randInt(6000, 11000));
      qteTimer = setTimeout(spawnQTE, randInt(8000, 16000));
    },
    stop() {
      running = false;
      clearTimeout(adTimer);
      clearTimeout(qteTimer);
      ads.forEach((ad) => {
        clearInterval(ad._moveTimer);
        ad.remove();
      });
      ads.clear();
      syncAdBackdrop();
    },
    jumpscare, // exposed for testing
  };
})();
