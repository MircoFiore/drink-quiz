/* =========================================================================
   COSTRUTTORI DI MANCHE
   =========================================================================
   Funzioni che trasformano dati grezzi (domande, drink) in oggetti
   "round" pronti da inserire nell'array rounds di un gioco.
   Dipende da: DRINKS, QUESTION_THEMES (data.js), shuffleArray (engine.js).
   ========================================================================= */


/* Trasforma UNA domanda del banco in una manche 'multiple-choice' */
function makeMultipleChoiceRound(title, question) {
  return {
    type: 'multiple-choice',
    title,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex
  };
}


/* Sceglie "count" domande a caso da UN SOLO tema */
function pickRandomQuestions(themeId, count, titlePrefix) {
  const theme = QUESTION_THEMES[themeId];
  if (!theme) return [];
  const pool = [...theme.questions];
  shuffleArray(pool);
  return pool.slice(0, count).map((q, i) =>
    makeMultipleChoiceRound(titlePrefix ? `${titlePrefix} ${i + 1}` : theme.label, q)
  );
}


/* Sceglie "count" domande a caso mescolando PIÙ temi */
function pickRandomQuestionsFromThemes(themeIds, count, titlePrefix) {
  const ids = (themeIds && themeIds.length) ? themeIds : Object.keys(QUESTION_THEMES);
  const pool = [];
  ids.forEach(id => {
    const theme = QUESTION_THEMES[id];
    if (theme) theme.questions.forEach(q => pool.push({ q, label: theme.label }));
  });
  shuffleArray(pool);
  return pool.slice(0, count).map((item, i) =>
    makeMultipleChoiceRound(titlePrefix ? `${titlePrefix} ${i + 1}` : item.label, item.q)
  );
}


/* Trasforma UN drink in una manche 'molecule-guess' */
function makeMoleculeGuessRound(title, drink) {
  return {
    type: 'molecule-guess',
    title,
    drinkId: drink.id
  };
}


/* Sceglie "count" drink a caso, ordinati per difficoltà crescente */
function pickRandomDrinkRounds(count, titlePrefix) {
  const pool = [...DRINKS];
  shuffleArray(pool);
  const selected = pool.slice(0, count)
    .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));

  return selected.map((drink, i) =>
    makeMoleculeGuessRound(
      titlePrefix ? `${titlePrefix} ${i + 1}` : `Manche — ${drink.name}`,
      drink
    )
  );
}
