# Scuffathon Verify

An Okta-Verify-style login flow where "MFA" is a gauntlet of puzzle screens instead of a push notification. Stage 1: fill in a NYT Mini-style 5x5 crossword. Stage 2: solve a randomly generated definite integral.

**Fully static** — no backend, no build step. It runs from plain HTML/CSS/JS, so VS Code's Live Server (or GitHub Pages) serves it as-is.

## Run it

- **VS Code Live Server:** right-click `public/index.html` → "Open with Live Server". (Or set Live Server's root to `public` and open `/`.)
- **Or just double-click** `public/index.html` to open it in a browser directly.

Demo login: username `demo`, password `password123`.

## The flow

`index.html` (login) → `app-check.html` ("Okta Verify Verifier") → `verify-select.html` (choose "Verify with Okta UNVerify") → the puzzles run **inside a phone mockup** on that same screen → `home.html` (verified).

- **`app-check.html` is the joke premise made literal:** nobody verifies that Okta Verify is the actual Okta Verify, so before you even reach the real gauntlet you have to pass a small 2-step check confirming you're using the genuine app — step 1 picks the real "Okta Verify" out of a lineup of lookalikes (`Okta Verify Pro+`, `0kta Verify`, …), step 2 retypes a 4-digit code shown on screen. It's deliberately lightweight — wrong picks just show an inline error and let you retry, no lives spent — and only runs once per session (`session.appVerified`); `verify-select.html` redirects back here if that flag isn't set yet. **Step 2 has a twist:** typing rerolls the displayed code on each of the first 3 keystrokes, so whatever you memorized is already stale — again, and again. It's still solvable by hand: keep an eye on the code as it rerolls, then once the 3 rerolls are used up it holds still — clear the box and retype whatever's showing. (Or just use the `solve` cheat code below.)
- After you hit **Select**, an iPhone-style mockup appears beside the verify panel. Its screen is an iframe that first loads `verify-confirm.html` — a fake push notification you have to tap **Verify** on (mirroring real Okta Verify's device approval step) — then the three puzzle pages in order (`verify-crossword.html`, `verify-integral.html`, `verify-dress.html`), and finally `verify-final.html`. Tapping **"This wasn't me"** on the confirm screen ends the session and bounces you back to login with no life lost.
- **`verify-dress.html` is the third puzzle** — "the dress" meme (`img/blueblack.jpeg`): check every color you see. The only correct answer is **blue and black** (leaving white/gold unchecked); anything else counts as a wrong answer, same lives/fail behavior as the crossword and integral stages.
- **`verify-final.html` is the last screen**, once all three puzzles are solved: a "Verify" button that teleports to a random spot **anywhere on screen** — at least half the screen's diagonal from wherever the cursor just was — the instant your cursor touches it. The first 5 hovers each trigger a dodge; from the 6th hover on it holds still, so you can actually click it. Clicking it then reveals one last joke gate: instructions to visit a (fictional) bank in person and wire $10.00 to complete verification. It's unwinnable by design — "I've completed my wire transfer" just cycles through stalling excuses forever, no real payment is ever collected or requested, and the only real way through is the `solve` cheat code.
- A **wrong answer breaks out of the phone** and throws you all the way back to the login screen (losing a life). Full success (clicking the settled Verify button) takes over the whole screen with `home.html`. This out-of-iframe navigation is done via `window.navTop()` in `state.js`.
- **Runs best on Live Server** (a real `http://` origin). Opening via `file://` can break the iframe/`sessionStorage` sharing the phone relies on.

## The chaos layer (`js/chaos.js` + `css/chaos.css`)

Pure annoyance that overlays the whole verify screen once the phone appears — none of it touches lives or the real puzzles:

- **Ads** pop up every 10-18s (at most 2 on screen at once) at random positions with a deliberately tiny ✕, and **teleport** to a new random spot every 3.5-6s while they're up — each jump flashes a **"HAHA BOZO"** taunt next to it. Hit the ✕ cleanly and the ad closes. **Miss the ✕** (click anywhere else on the ad) and you get a **jumpscare**. While any ad is up, a click-blocking backdrop covers everything else on screen — you can't interact with the puzzle behind it until every visible ad is dealt with.
- **Quick-time events** interrupt with "Mash E 15 times!" (mash the key *or* click the button; a 6-second timer resets you if you stall, but costs nothing).
- **Jumpscare** flashes an image at a random spot for a fraction of a second.

### Add the jumpscare image

Drop your scary image at **`public/img/jumpscare.png`**. Until you do, the jumpscare falls back to a big 🐀 emoji so everything still works. (To use a different filename/format, change `JUMPSCARE_SRC` at the top of `js/chaos.js`.)

- **Login** is a two-step Okta-style screen (username → Next → password) with an original crest emblem.
- **Crossword stage:** a 5x5 mini that rotates through 7 hand-verified puzzles keyed to the day of the week (`js/crossword-data.js`) — "changes daily," repeats weekly. Click/type/arrow-key to navigate; the whole grid must be correct.
- **Integral stage:** a random definite integral is generated in the browser; enter its value (decimals fine, small tolerance).
- **Dress stage:** "the dress" meme image — check every color you see; only **blue and black** is correct.
- **Three lives, shared across all three stages.** Any wrong answer costs a life and sends you all the way back to the login screen — no retry in place. Lives are tracked in `localStorage` per calendar day, so logging back in doesn't reset them. Hit 0 and login itself is blocked ("come back tomorrow") until the date rolls over, when lives reset to 3.
- **Cheat code:** type **`solve`** anywhere on any puzzle screen (`app-check.html`, `verify-crossword.html`, `verify-integral.html`, `verify-dress.html`, `verify-final.html`) to instantly pass it — works even while a puzzle input has focus. Powered by `js/cheat.js`'s `CheatCode.arm()`, which watches the last few keys typed. Same idea as the integral stage's `67` answer shortcut.

## How the client-side state works

- `js/state.js` — lives + daily lockout in `localStorage`; login progress (who's in, which stages passed, the active puzzles) in `sessionStorage` so it clears when the tab closes.
- `js/integral.js` — `window.Integral`: generates and checks integral puzzles.
- `js/crossword-data.js` / `js/crossword-engine.js` — the 7 puzzles plus `window.Crossword`, which derives crossword numbering/clues from a grid and checks a filled grid.
- `js/lives.js` — the heart-counter renderer.

> **Not real security.** Because everything runs in the browser, the puzzle answers are in the page source and the whole flow can be bypassed with devtools. This is a UX/flow prototype for a hackathon, not authentication. The login page also uses an entirely fictional brand and an original crest — it is deliberately **not** a clone of any real institution's sign-in page.

## Adding another puzzle stage

1. Add `js/<name>.js` exposing a `window.<Name>` with generate/check functions (or reuse the grid engine).
2. Add a `<name>Passed` flag in `state.js`'s `startSession`, and check it in each page's guard.
3. Add a `verify-<name>.html` page + `js/verify-<name>.js` that: guards on `AppState.getSession()` (redirecting to whichever earlier stage isn't done), renders the puzzle, shows lives, and on a wrong answer calls `AppState.failAttempt()` then redirects to `index.html`.
4. Chain it by pointing the previous stage's success redirect at the new page, and update `home.html`'s guard + the progress dots.

## The crossword's word-fill generator

The puzzles in `crossword-data.js` weren't hand-fitted by guessing crossings. They came from a small backtracking solver (not shipped) that searched a curated word list for real-word fills matching the grid's constraints; each fill was then run back through the same entry-extraction logic in `crossword-engine.js` to confirm every clue matches its answer. If you add puzzles by hand, verify them the same way rather than trusting the crossings by eye.
