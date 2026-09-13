// Client-side state for the fully-static build (no backend). Lives + daily
// lockout persist in localStorage keyed by calendar date; "session" progress
// (who's logged in, which stages passed, the active puzzles) lives in
// sessionStorage so it clears when the tab closes, roughly like a real session.
//
// Note: because everything runs in the browser, puzzle answers live in the
// page source and this can all be bypassed via devtools. That's fine for a
// hackathon demo — it's a UX/flow prototype, not real authentication.

(function () {
  const STARTING_LIVES = 3;
  const LIVES_KEY = 'scuffathon_lives';
  const SESSION_KEY = 'scuffathon_session';

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadLives() {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem(LIVES_KEY));
    } catch (e) {
      s = null;
    }
    if (!s || s.date !== todayStr()) {
      s = { date: todayStr(), lives: STARTING_LIVES };
      saveLives(s);
    }
    return s;
  }

  function saveLives(s) {
    try {
      localStorage.setItem(LIVES_KEY, JSON.stringify(s));
    } catch (e) {
      /* storage unavailable — lives just won't persist */
    }
  }

  function loadSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(sess) {
    try {
      if (sess === null) sessionStorage.removeItem(SESSION_KEY);
      else sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    } catch (e) {
      /* ignore */
    }
  }

  window.AppState = {
    STARTING_LIVES,

    getLives() {
      return loadLives().lives;
    },

    isLockedOut() {
      return loadLives().lives <= 0;
    },

    // Costs a life and tears down the current session (sends the user back to
    // the very start). Returns remaining lives.
    failAttempt() {
      const s = loadLives();
      s.lives = Math.max(0, s.lives - 1);
      saveLives(s);
      saveSession(null);
      return s.lives;
    },

    getSession() {
      return loadSession();
    },

    startSession(username) {
      const sess = {
        username,
        integralPassed: false,
        crosswordPassed: false,
        integralPuzzle: null,
        crosswordDay: null,
      };
      saveSession(sess);
      return sess;
    },

    updateSession(patch) {
      const sess = loadSession();
      if (!sess) return null;
      Object.assign(sess, patch);
      saveSession(sess);
      return sess;
    },

    endSession() {
      saveSession(null);
    },
  };

  // Navigate the TOP window. When a puzzle page runs inside the phone iframe,
  // this breaks out of the phone (e.g. a wrong answer resetting to login, or
  // final success going to the home screen). Run standalone, top === self.
  window.navTop = function (url) {
    try {
      (window.top || window).location.href = url;
    } catch (e) {
      window.location.href = url;
    }
  };
})();
