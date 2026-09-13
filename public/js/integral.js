// Random definite-integral challenge (browser build). window.Integral.

(function () {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateTerms() {
    const numTerms = randInt(2, 3);
    const powers = shuffle([0, 1, 2, 3, 4]).slice(0, numTerms).sort((a, b) => b - a);
    return powers.map((power) => {
      let coef = randInt(-6, 6);
      if (coef === 0) coef = 1;
      return { coef, power };
    });
  }

  function generateBounds() {
    const a = randInt(-4, 3);
    const b = randInt(a + 1, 5);
    return { a, b };
  }

  function evaluateAntiderivative(terms, x) {
    return terms.reduce((sum, { coef, power }) => {
      const newPower = power + 1;
      return sum + (coef / newPower) * Math.pow(x, newPower);
    }, 0);
  }

  function computeAnswer(terms, a, b) {
    return evaluateAntiderivative(terms, b) - evaluateAntiderivative(terms, a);
  }

  function formatTerm({ coef, power }, isFirst) {
    const abs = Math.abs(coef);
    const sign = coef < 0 ? '-' : '+';
    let body;
    if (power === 0) {
      body = `${abs}`;
    } else if (power === 1) {
      body = abs === 1 ? 'x' : `${abs}x`;
    } else {
      body = abs === 1 ? `x^${power}` : `${abs}x^${power}`;
    }
    if (isFirst) {
      return coef < 0 ? `-${body}` : body;
    }
    return ` ${sign} ${body}`;
  }

  function formatExpression(terms) {
    return terms.map((t, i) => formatTerm(t, i === 0)).join('');
  }

  function generatePuzzle() {
    const terms = generateTerms();
    const { a, b } = generateBounds();
    return {
      terms,
      a,
      b,
      answer: computeAnswer(terms, a, b),
      expression: formatExpression(terms),
    };
  }

  function checkAnswer(puzzle, submitted) {
    const value = Number(submitted);
    if (Number.isNaN(value)) return false;
    return Math.abs(value - puzzle.answer) < 0.05;
  }

  window.Integral = { generatePuzzle, checkAnswer };
})();
