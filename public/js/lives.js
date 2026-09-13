function renderLives(count, elId = 'lives-display') {
  const el = document.getElementById(elId);
  if (!el) return;
  const total = 3;
  const safeCount = Math.max(0, count ?? 0);
  el.textContent = '❤️'.repeat(safeCount) + '🤍'.repeat(Math.max(0, total - safeCount));
}
