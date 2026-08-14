/* =========================================================================
   MOTORE DI GIOCO
   =========================================================================
   Gestisce lo stato della PROVA in corso (Game) e della SESSIONE completa
   (Session). Non contiene HTML né costruzione di manche.
   Dipende da: constants.js (penalità scoring).
   ========================================================================= */


/* ---------- stato della prova in corso ---------- */

const Game = {
  gameId: null,
  rounds: [],
  roundIndex: 0,
  score: 0,
  stats: [],
  hintsUsedThisRound: 0,
  wrongAttemptsThisRound: 0,
  roundLocked: false
};


/* ---------- stato della sessione (tutti i giochi) ---------- */

const Session = {
  playedGameIds: [],
  gameResults: {}
};

function resetSession() {
  Session.playedGameIds = [];
  Session.gameResults = {};
}


/* ---------- ciclo di vita del gioco ---------- */

function getGameDef(gameId) {
  return GAMES.find(g => g.id === gameId);
}

function initGame(gameDef) {
  Game.gameId = gameDef.id;
  Game.rounds = typeof gameDef.buildRounds === 'function'
    ? gameDef.buildRounds()
    : gameDef.rounds;
  Game.roundIndex = 0;
  Game.score = 0;
  Game.stats = [];
  resetRoundState();
}

function resetRoundState() {
  Game.hintsUsedThisRound = 0;
  Game.wrongAttemptsThisRound = 0;
  Game.roundLocked = false;
}

function getCurrentRound() {
  return Game.rounds[Game.roundIndex];
}

function isLastRound() {
  return Game.roundIndex === Game.rounds.length - 1;
}

function advanceRound() {
  Game.roundIndex++;
  resetRoundState();
}


/* ---------- scoring ---------- */

function registerHintUsed() {
  Game.hintsUsedThisRound++;
}

function registerWrongAttempt() {
  Game.wrongAttemptsThisRound++;
}

function computePenalty(roundType, wrongAttempts) {
  if (roundType === 'image-zoom') {
    let penalty = 0;
    for (let i = 0; i < wrongAttempts; i++) {
      penalty += i < PENALTY_ZOOM_STEPS.length
        ? PENALTY_ZOOM_STEPS[i]
        : PENALTY_ZOOM_FALLBACK;
    }
    return penalty;
  }
  if (roundType === 'matching') {
    return wrongAttempts * PENALTY_MATCHING;
  }
  return wrongAttempts * PENALTY_DEFAULT;
}

function scoreForRound() {
  const round = getCurrentRound();
  const penalty = computePenalty(round.type, Game.wrongAttemptsThisRound);
  return Math.max(100 - penalty, 0);
}

function completeRound(customScore) {
  Game.roundLocked = true;
  const round = getCurrentRound();
  const points = customScore !== undefined ? customScore : scoreForRound();

  Game.score += points;
  Game.stats.push({
    title: round.title,
    type: round.type,
    points,
    hintsUsed: Game.hintsUsedThisRound,
    wrongAttempts: Game.wrongAttemptsThisRound
  });
}


/* ---------- chiusura gioco e risultato ---------- */

function finishCurrentGame() {
  const gameDef = getGameDef(Game.gameId);
  const maxScore = Game.rounds.length * 100;
  const percentage = maxScore ? (Game.score / maxScore) * 100 : 0;

  const result = {
    label: gameDef.label,
    totalScore: Game.score,
    maxScore,
    percentage,
    stats: [...Game.stats]
  };

  Session.gameResults[Game.gameId] = result;
  if (!Session.playedGameIds.includes(Game.gameId)) {
    Session.playedGameIds.push(Game.gameId);
  }
  return result;
}

function allGamesPlayed() {
  return Session.playedGameIds.length === GAMES.length;
}


/* ---------- verdetto finale (0-110, promozione a 66) ---------- */

function computeVerdict() {
  let weightedSum = 0;
  let totalWeight = 0;

  GAMES.forEach(gameDef => {
    const result = Session.gameResults[gameDef.id];
    if (!result) return;
    weightedSum += result.percentage * gameDef.weight;
    totalWeight += gameDef.weight;
  });

  const overallPercentage = totalWeight ? weightedSum / totalWeight : 0;
  const rawScore = Math.round((overallPercentage / 100) * 110);
  const finalScore = Math.min(Math.max(rawScore, 0), 110);

  return {
    overallPercentage,
    finalScore,
    passed: finalScore >= 66,
    lode: finalScore >= 110
  };
}


/* ---------- validazione risposte ---------- */

function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCorrectAnswer(candidates, userInput) {
  const normalized = normalizeAnswer(userInput);
  if (!normalized) return false;
  return candidates.map(normalizeAnswer).includes(normalized);
}

function isCorrectDrinkAnswer(drink, userInput) {
  return isCorrectAnswer([drink.name, ...(drink.aliases || [])], userInput);
}

function isCorrectSimpleAnswer(round, userInput) {
  return isCorrectAnswer([round.answer, ...(round.aliases || [])], userInput);
}


/* ---------- opzioni quiz (aiuto 1) ---------- */

function getManualOptionsForDrink(drink) {
  const options = [...(drink.quizOptions || [drink.name])];
  shuffleArray(options);
  return options;
}


/* ---------- utilità ---------- */

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/* ---------- helper formato punteggio ---------- */

function isQuizResult(result) {
  return result.stats.every(s => s.type === 'multiple-choice');
}

function formatScoreText(result) {
  if (isQuizResult(result)) {
    const correct = result.stats.filter(s => s.points > 0).length;
    return `${correct}/${result.stats.length} corrette`;
  }
  return `${result.totalScore}/${result.maxScore} pt`;
}
