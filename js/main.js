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
   Dipende da: constants.js, engine.js, ui.js, renderers.js, data.js.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  resetSession();
  initTooltipListeners();
  initMobileKeyboardScroll();
  showHubScreen();
});


/* =========================================================================
   HUB — schermata iniziale / selezione del prossimo gioco
   ========================================================================= */

function showHubScreen() {
  document.getElementById('round-counter').textContent = '';
  const stage = document.getElementById('stage');
  const firstVisit = Session.playedGameIds.length === 0;

  stage.innerHTML = `
    <div class="round-card hub-card">
      ${firstVisit ? buildHubIntroHTML() : buildHubReturnHTML()}
      <div class="game-list">${buildGameButtonsHTML()}</div>
      ${allGamesPlayed() ? '<button id="verdict-btn" class="btn btn-primary btn-large verdict-cta">🎓 VERDETTO</button>' : ''}
      ${!firstVisit ? '<button id="restart-session-btn" class="btn-link">Ricomincia da capo</button>' : ''}
    </div>
  `;

  stage.querySelectorAll('.game-btn[data-game]').forEach(btn => {
    btn.addEventListener('click', () => showGameIntroScreen(getGameDef(btn.dataset.game)));
  });

  const verdictBtn = document.getElementById('verdict-btn');
  if (verdictBtn) verdictBtn.addEventListener('click', showVerdictScreen);

  const restartBtn = document.getElementById('restart-session-btn');
  if (restartBtn) restartBtn.addEventListener('click', () => { resetSession(); showHubScreen(); });
}

function buildHubIntroHTML() {
  return `
    <h1 class="round-heading big">Test di Laurea - Sei veramente un dottore?</h1>
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
  `;
}

function buildHubReturnHTML() {
  return `
    <div class="eyebrow">Prove completate: ${Session.playedGameIds.length} di ${GAMES.length}</div>
    <h1 class="round-heading big">Scegli la prossima sfida</h1>
  `;
}

function buildGameButtonsHTML() {
  return GAMES.map(game => {
    const played = Session.playedGameIds.includes(game.id);
    if (played) {
      const result = Session.gameResults[game.id];
      return `
        <div class="game-btn completed">
          <div class="game-btn-center">
            <span class="icon">${game.icon}</span>
            <span>${game.label}</span>
          </div>
          <span class="score-badge">${formatScoreText(result)}</span>
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
}


/* =========================================================================
   INTRO — regole del gioco scelto, prima di iniziare le manche
   ========================================================================= */

function showGameIntroScreen(game) {
  document.getElementById('round-counter').textContent = game.label;
  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card start-card">
      <h1 class="round-heading big">${game.icon} ${game.intro.title}</h1>
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
  document.getElementById('round-counter').textContent = 'Prova completata';

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card final-card">
      <div class="eyebrow">${result.label}</div>
      <h1 class="round-heading big">${buildRecapHeading(result)}</h1>
      <p class="intro-text">${Math.round(result.percentage)}% di questa prova superato.</p>
      <table class="stats-table">
        <thead>${buildRecapTableHead(result)}</thead>
        <tbody>${buildRecapTableRows(result)}</tbody>
      </table>
      <button id="recap-continue-btn" class="btn btn-primary btn-large">Continua →</button>
    </div>
  `;
  document.getElementById('recap-continue-btn').addEventListener('click', showHubScreen);
}

function buildRecapHeading(result) {
  if (isQuizResult(result)) {
    const correct = result.stats.filter(s => s.points > 0).length;
    return `Risposte corrette: ${correct} / ${result.stats.length}`;
  }
  return `Punteggio: ${result.totalScore} / ${result.maxScore} pt`;
}

function buildRecapTableHead(result) {
  if (isQuizResult(result)) {
    return '<tr><th>Domanda</th><th>Esito</th></tr>';
  }
  const hasHints = result.stats.some(s => s.type === 'molecule-guess');
  return `<tr><th>Manche</th><th>Punti</th>${hasHints ? '<th>Aiuti (drink bevuti)</th>' : ''}</tr>`;
}

function buildRecapTableRows(result) {
  if (isQuizResult(result)) {
    return result.stats.map(s => `
      <tr>
        <td>${s.title}</td>
        <td>${s.points > 0 ? '✅ Corretta' : '❌ Sbagliata'}</td>
      </tr>
    `).join('');
  }
  const hasHints = result.stats.some(s => s.type === 'molecule-guess');
  return result.stats.map(s => `
    <tr>
      <td>${s.title}</td>
      <td>${s.points} pt</td>
      ${hasHints ? `<td>${s.hintsUsed}</td>` : ''}
    </tr>
  `).join('');
}


/* =========================================================================
   VERDETTO — voto finale su tutti i giochi (0-110, promozione a 66)
   ========================================================================= */

function showVerdictScreen() {
  const verdict = computeVerdict();
  document.getElementById('round-counter').textContent = 'Verdetto finale';

  const verdictClass = verdict.passed ? 'verdict-pass' : 'verdict-fail';
  const bodyText = verdict.lode
    ? VERDICT_TEXT_LODE
    : verdict.passed
      ? VERDICT_TEXT_PASS
      : VERDICT_TEXT_FAIL;

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card verdict-card diploma ${verdictClass}">
      <div class="diploma-header">
        <div class="diploma-crest">🎓</div>
        <h2 class="diploma-university">Università degli Studi del Beverage</h2>
        <p class="diploma-department">Dipartimento di Scienze Chimiche, della Vita e della Sostenibilità Ambientale</p>
      </div>

      <h1 class="diploma-title">${verdict.passed ? 'Diploma di Laurea' : 'Verbale di Esame'}</h1>
      <div class="verdict-score ${verdictClass}">${verdict.finalScore} / 110${verdict.lode ? ' e Lode' : ''}</div>

      ${bodyText}

      <details class="diploma-details">
        <summary>Dettaglio prove sostenute</summary>
        <table class="stats-table">
          <thead><tr><th>Prova</th><th>Risultato</th><th>Peso</th></tr></thead>
          <tbody>${buildVerdictTableRows()}</tbody>
        </table>
      </details>

      <div class="diploma-footer">
        <div class="diploma-signature">
          <div class="diploma-sign-line"></div>
          <span>Il Rettore</span>
        </div>
        <div class="diploma-signature">
          <div class="diploma-sign-line"></div>
          <span>Il Candidato</span>
        </div>
      </div>

      <button id="verdict-restart-btn" class="btn btn-primary btn-large">Ripeti l'esame</button>
    </div>
  `;
  document.getElementById('verdict-restart-btn').addEventListener('click', () => {
    resetSession();
    showHubScreen();
  });
}

function buildVerdictTableRows() {
  return GAMES.map(gameDef => {
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
}
