/* =========================================================================
   MOTORE DI GIOCO
   =========================================================================
   Gestisce lo stato della PROVA in corso (Game) e della SESSIONE completa
   (Session: quali giochi sono stati completati e con che punteggio, usati
   per calcolare il VERDETTO finale). Non contiene HTML: il "disegno" delle
   manche è in renderers.js, le schermate (hub, verdetto...) sono in
   main.js. Se vuoi cambiare le regole di punteggio, vedi scoreForRound;
   per il calcolo del voto finale, vedi computeVerdict.
   ========================================================================= */

/* Stato della PROVA IN CORSO (un singolo gioco, es. "Che drink è?").
   Viene reimpostato ogni volta che l'utente avvia un nuovo gioco. */
const Game = {
  gameId: null,
  rounds: [],
  roundIndex: 0,
  score: 0,
  stats: [],           // riepilogo per manche, mostrato a fine prova
  hintsUsedThisRound: 0,
  wrongAttemptsThisRound: 0,
  roundLocked: false   // true quando la manche è già stata risolta
};

/* Stato dell'INTERA sessione ("Test di Laurea"): quali giochi sono stati
   completati e con quale risultato. Si azzera solo con "Ricomincia da capo". */
const Session = {
  playedGameIds: [],
  gameResults: {}       // gameId -> { label, totalScore, maxScore, percentage, stats }
};

function resetSession() {
  Session.playedGameIds = [];
  Session.gameResults = {};
}

function getGameDef(gameId) {
  return GAMES.find(g => g.id === gameId);
}

function initGame(gameDef) {
  Game.gameId = gameDef.id;
  Game.rounds = gameDef.rounds;
  Game.roundIndex = 0;
  Game.score = 0;
  Game.stats = [];
  startRoundTimer();
}

function startRoundTimer() {
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

function registerHintUsed() {
  Game.hintsUsedThisRound++;
}

function registerWrongAttempt() {
  Game.wrongAttemptsThisRound++;
}

/* Regola di punteggio:
   - punteggio base 100 per manche completata
   - penalità per errori: dipende dal tipo di gioco
   - gli aiuti NON riducono il punteggio: sono solo scenici (si beve!) */
function scoreForRound() {
  const round = getCurrentRound();
  let penalty;
  if (round.type === 'image-zoom') {
    const steps = [10, 20, 30];
    penalty = 0;
    for (let i = 0; i < Game.wrongAttemptsThisRound; i++) {
      penalty += i < steps.length ? steps[i] : 40;
    }
  } else if (round.type === 'matching') {
    penalty = Game.wrongAttemptsThisRound * 15;
  } else {
    penalty = Game.wrongAttemptsThisRound * 25;
  }
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

function advanceRound() {
  Game.roundIndex++;
  startRoundTimer();
}

/* Chiude la prova in corso: calcola il risultato del gioco appena finito
   e lo salva in Session, così il VERDETTO finale potrà usarlo. */
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

/* Calcola il VERDETTO finale: media dei risultati di ogni gioco, pesata
   secondo il campo "weight" di ciascuno (GAMES in data.js), scalata su un
   punteggio da 0 a 110 (come una laurea). Promozione a partire da 66. */
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

/* Normalizza una stringa per il confronto risposta utente / risposta corretta:
   minuscolo, spazi puliti, senza accenti. */
function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCorrectDrinkAnswer(drink, userInput) {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) return false;
  const candidates = [drink.name, ...(drink.aliases || [])].map(normalizeAnswer);
  return candidates.includes(normalizedInput);
}

/* Versione generica dello stesso controllo, usata dalle manche che non sono
   legate a un drink (es. "image-zoom"): confronta round.answer + round.aliases */
function isCorrectSimpleAnswer(round, userInput) {
  const normalizedInput = normalizeAnswer(userInput);
  if (!normalizedInput) return false;
  const candidates = [round.answer, ...(round.aliases || [])].map(normalizeAnswer);
  return candidates.includes(normalizedInput);
}

/* Restituisce le 4 opzioni per l'Aiuto 1, definite a mano in data.js
   (drink.quizOptions), mescolate solo nell'ORDINE di visualizzazione. */
function getManualOptionsForDrink(drink) {
  const options = [...(drink.quizOptions || [drink.name])];
  shuffleArray(options);
  return options;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/* =========================================================================
   BANCA DOMANDE A RISPOSTA MULTIPLA — selezione
   =========================================================================
   Le domande (costanti) vivono in data.js dentro QUESTION_THEMES, divise
   per tema. Qui ci sono le funzioni per trasformarle in manche pronte da
   mettere nell'array "rounds" di un gioco (dentro GAMES, in data.js): una
   precisa scelta a mano, oppure a caso da un tema o da più temi insieme.
   Esempi d'uso nei commenti di data.js.
   ========================================================================= */

/* Trasforma UNA domanda del bancone in una manche 'multiple-choice' pronta */
function makeMultipleChoiceRound(title, question) {
  return {
    type: 'multiple-choice',
    title,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex
  };
}

/* Sceglie "count" domande A CASO da UN SOLO tema (es. 'chimica_laboratorio') */
function pickRandomQuestions(themeId, count, titlePrefix) {
  const theme = QUESTION_THEMES[themeId];
  if (!theme) return [];
  const pool = [...theme.questions];
  shuffleArray(pool);
  return pool.slice(0, count).map((q, i) =>
    makeMultipleChoiceRound(titlePrefix ? `${titlePrefix} ${i + 1}` : theme.label, q)
  );
}

/* Sceglie "count" domande A CASO mescolando PIÙ temi insieme.
   Passa un array di id tema (es. ['chimica_laboratorio','biologia_marina'])
   oppure null/[] per pescare da TUTTI i temi disponibili. */
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


/* Trasforma UN drink in una manche 'molecule-guess' pronta */
function makeMoleculeGuessRound(title, drink) {
  return {
    type: 'molecule-guess',
    title,
    drinkId: drink.id
  };
}

/* Sceglie "count" drink A CASO da DRINKS (data.js) e li trasforma in
   manche 'molecule-guess' pronte da mettere nell'array "rounds" di un gioco */
function pickRandomDrinkRounds(count, titlePrefix) {
  const pool = [...DRINKS];
  shuffleArray(pool);
  const selected = pool.slice(0, count)
    .sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));   // <-- aggiunta

  return selected.map((drink, i) =>
    makeMoleculeGuessRound(titlePrefix ? `${titlePrefix} ${i + 1}` : `Manche — ${drink.name}`, drink)
  );
}
