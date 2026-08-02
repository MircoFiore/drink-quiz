/* =========================================================================
   AVVIO APP E GESTIONE SCHERMATE
   =========================================================================
   Flusso:
     showHubScreen()        -> schermata iniziale / selezione prossimo gioco
       -> showGameIntroScreen(game)  -> regole del gioco scelto
         -> startGame(game)          -> avvia le manche (renderers.js)
           -> ... (giocando le manche) ...
           -> goToNextRoundOrFinishGame() [chiamato dai bottoni "prossima
              manche" e dal pop-up soluzione, in renderers.js]
             -> showGameRecapScreen()  -> punteggio del singolo gioco
               -> torna a showHubScreen()
     Quando tutti i giochi sono stati giocati, showHubScreen() mostra anche
     il bottone "VERDETTO" -> showVerdictScreen().
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  resetSession();
  showHubScreen();
});


/* =========================================================================
   HUB — schermata iniziale / selezione del prossimo gioco
   ========================================================================= */

function showHubScreen() {
  document.getElementById('round-counter').textContent = '';
  const stage = document.getElementById('stage');
  const firstVisit = Session.playedGameIds.length === 0;

  const introHTML = firstVisit ? `
    <h1 class="round-heading big">Test di Laurea — il quiz</h1>
    <p class="intro-text">
      Ci si può fidare del parere di qualche vecchio bavoso nell'università
      di Padova? Il dipartimento di scienze chimiche, della vita e della
      sostenibilità ambientale ha un nome decisamente troppo lungo per
      essere preso sul serio. Ed è per questo motivo che abbiamo deciso di
      sottoporti a una serie di sfide che ci permetteranno di decretare se
      lei è veramente un Dottore.
    </p>
    <p class="intro-text">
      Scegli la sfida, affrontala e passa alla successiva: al termine sarà
      decretato tramite un punteggio imparziale se è degno del titolo che
      ricopre.
    </p>
    <p class="intro-text"><strong>Iniziamo:</strong></p>
  ` : `
    <div class="eyebrow">Prove completate: ${Session.playedGameIds.length} di ${GAMES.length}</div>
    <h1 class="round-heading big">Scegli la prossima sfida</h1>
  `;

  const gameButtonsHTML = GAMES.map(game => {
    const played = Session.playedGameIds.includes(game.id);
    if (played) {
      const result = Session.gameResults[game.id];
      return `
        <div class="game-btn completed">
          <span class="icon">${game.icon}</span>
          <span>${game.label}</span>
          <span class="score-badge">✅ ${result.totalScore}/${result.maxScore} pt</span>
        </div>
      `;
    }
    return `
      <button type="button" class="game-btn" data-game="${game.id}">
        <span class="icon">${game.icon}</span>
        <span>${game.label}</span>
      </button>
    `;
  }).join('');

  const verdictHTML = allGamesPlayed() ? `
    <button id="verdict-btn" class="btn btn-primary btn-large verdict-cta">🎓 VERDETTO</button>
  ` : '';

  const restartHTML = !firstVisit ? `
    <button id="restart-session-btn" class="btn-link">Ricomincia da capo</button>
  ` : '';

  const stageEl = stage;
  stageEl.innerHTML = `
    <div class="round-card hub-card">
      ${introHTML}
      <div class="game-list">${gameButtonsHTML}</div>
      ${verdictHTML}
      ${restartHTML}
    </div>
  `;

  stage.querySelectorAll('.game-btn[data-game]').forEach(btn => {
    btn.addEventListener('click', () => {
      const game = getGameDef(btn.dataset.game);
      showGameIntroScreen(game);
    });
  });

  const verdictBtn = document.getElementById('verdict-btn');
  if (verdictBtn) verdictBtn.addEventListener('click', showVerdictScreen);

  const restartBtn = document.getElementById('restart-session-btn');
  if (restartBtn) restartBtn.addEventListener('click', () => {
    resetSession();
    showHubScreen();
  });
}


/* =========================================================================
   INTRO — regole del gioco scelto, prima di iniziare le manche
   ========================================================================= */

function showGameIntroScreen(game) {
  document.getElementById('round-counter').textContent = game.label;
  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card start-card">
      <div class="eyebrow">${game.icon} ${game.label}</div>
      <h1 class="round-heading big">${game.intro.title}</h1>
      <p class="intro-text">${game.intro.text}</p>
      <button id="game-start-btn" class="btn btn-primary btn-large">Inizia la prova</button>
    </div>
  `;
  document.getElementById('game-start-btn').addEventListener('click', () => startGame(game));
}

function startGame(game) {
  initGame(game);
  renderRound(getCurrentRound());
}


/* =========================================================================
   Avanzamento manche: chiamata dai bottoni "prossima manche" (renderers.js)
   ========================================================================= */

function goToNextRoundOrFinishGame() {
  if (isLastRound()) {
    showGameRecapScreen();
  } else {
    advanceRound();
    renderRound(getCurrentRound());
  }
}


/* =========================================================================
   RECAP — riepilogo del singolo gioco appena concluso
   ========================================================================= */

function showGameRecapScreen() {
  const result = finishCurrentGame();
  const hasHints = result.stats.some(s => s.type === 'molecule-guess');
  document.getElementById('round-counter').textContent = 'Prova completata';


  const rows = result.stats.map(s => `
    <tr>
      <td>${s.title}</td>
      <td>${s.points} pt</td>
      ${hasHints ? `<td>${s.hintsUsed}</td>` : ''}
    </tr>
  `).join('');

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card final-card">
      <div class="eyebrow">${result.label}</div>
      <h1 class="round-heading big">Punteggio: ${result.totalScore} / ${result.maxScore} pt</h1>
      <p class="intro-text">${Math.round(result.percentage)}% di questa prova superato.</p>
      <table class="stats-table">
        <thead>
          <tr><th>Manche</th><th>Punti</th>${hasHints ? '<th>Aiuti (drink bevuti)</th>' : ''}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <button id="recap-continue-btn" class="btn btn-primary btn-large">Continua →</button>
    </div>
  `;
  document.getElementById('recap-continue-btn').addEventListener('click', showHubScreen);
}


/* =========================================================================
   VERDETTO — voto finale su tutti i giochi (0-110, promozione a 66)
   ========================================================================= */

function showVerdictScreen() {
  const verdict = computeVerdict();
  document.getElementById('round-counter').textContent = 'Verdetto finale';

  const rows = GAMES.map(gameDef => {
    const result = Session.gameResults[gameDef.id];
    if (!result) return '';
    return `
      <tr>
        <td>${gameDef.icon} ${gameDef.label}</td>
        <td>${Math.round(result.percentage)}%</td>
        <td>${gameDef.weight}%</td>
      </tr>
    `;
  }).join('');

  const verdictClass = verdict.passed ? 'verdict-pass' : 'verdict-fail';
  const verdictMessage = verdict.lode
    ? '🎉 110 e lode! Anche i vecchi bavosi di Padova si inchinano.'
    : verdict.passed
      ? 'Promosso! Il titolo di Dottore è suo di diritto.'
      : 'Bocciato. Il titolo di Dottore dovrà attendere ancora un po\'.';

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card verdict-card">
      <div class="eyebrow">🎓 Verdetto finale</div>
      <div class="verdict-score ${verdictClass}">${verdict.finalScore} / 110</div>
      <p class="verdict-message ${verdictClass}">${verdictMessage}</p>
      <table class="stats-table">
        <thead>
          <tr><th>Prova</th><th>Risultato</th><th>Peso</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <button id="verdict-restart-btn" class="btn btn-primary btn-large">Ricomincia da capo</button>
    </div>
  `;
  document.getElementById('verdict-restart-btn').addEventListener('click', () => {
    resetSession();
    showHubScreen();
  });
}
