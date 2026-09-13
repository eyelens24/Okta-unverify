// Global "solve" cheat code for puzzle screens: type the word "solve"
// anywhere on the page — even while a puzzle input has focus — to instantly
// pass whatever's on screen. Pure hackathon fun, same spirit as the "67"
// cheat on the integral stage. Not real security; see README.

(function () {
  const CODE = 'solve';

  window.CheatCode = {
    // Calls onSolve() the moment the last keys typed spell out "solve".
    arm(onSolve) {
      let buffer = '';
      document.addEventListener('keydown', (e) => {
        if (e.key.length !== 1) return; // ignore Enter, Backspace, arrows, Shift, etc.
        buffer = (buffer + e.key.toLowerCase()).slice(-CODE.length);
        if (buffer === CODE) {
          buffer = '';
          onSolve();
        }
      });
    },
  };
})();
