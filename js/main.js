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
  ` : `
    <div class="eyebrow">Prove completate: ${Session.playedGameIds.length} di ${GAMES.length}</div>
    <h1 class="round-heading big">Scegli la prossima sfida</h1>
  `;

  const gameButtonsHTML = GAMES.map(game => {
    const played = Session.playedGameIds.includes(game.id);
    if (played) {
      const result = Session.gameResults[game.id];
      const isQuiz = result.stats.every(s => s.type === 'multiple-choice');
      const scoreText = isQuiz
        ? `${result.stats.filter(s => s.points > 0).length}/${result.stats.length} corrette`
        : `${result.totalScore}/${result.maxScore} pt`;
      return `
        <div class="game-btn completed">
          <div class="game-btn-center">
            <span class="icon">${game.icon}</span>
            <span>${game.label}</span>
          </div>
          <span class="score-badge">${scoreText}</span>
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
  const hasHints = result.stats.some(s => s.type === 'molecule-guess');
  const isQuiz = result.stats.every(s => s.type === 'multiple-choice');
  document.getElementById('round-counter').textContent = 'Prova completata';

  let headingHTML, summaryHTML, theadHTML, rows;

  if (isQuiz) {
    const correct = result.stats.filter(s => s.points > 0).length;
    headingHTML = `Risposte corrette: ${correct} / ${result.stats.length}`;
    summaryHTML = `${Math.round(result.percentage)}% di questa prova superato.`;
    theadHTML = '<tr><th>Domanda</th><th>Esito</th></tr>';
    rows = result.stats.map(s => `
      <tr>
        <td>${s.title}</td>
        <td>${s.points > 0 ? '✅ Corretta' : '❌ Sbagliata'}</td>
      </tr>
    `).join('');
  } else {
    headingHTML = `Punteggio: ${result.totalScore} / ${result.maxScore} pt`;
    summaryHTML = `${Math.round(result.percentage)}% di questa prova superato.`;
    theadHTML = `<tr><th>Manche</th><th>Punti</th>${hasHints ? '<th>Aiuti (drink bevuti)</th>' : ''}</tr>`;
    rows = result.stats.map(s => `
      <tr>
        <td>${s.title}</td>
        <td>${s.points} pt</td>
        ${hasHints ? `<td>${s.hintsUsed}</td>` : ''}
      </tr>
    `).join('');
  }

  const stage = document.getElementById('stage');
  stage.innerHTML = `
    <div class="round-card final-card">
      <div class="eyebrow">${result.label}</div>
      <h1 class="round-heading big">${headingHTML}</h1>
      <p class="intro-text">${summaryHTML}</p>
      <table class="stats-table">
        <thead>${theadHTML}</thead>
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

  const bodyText = verdict.lode
    ? `<p class="diploma-body">
        La Commissione, avendo esaminato con la dovuta attenzione e solennità
        le prove sostenute dal candidato, <strong>dichiara all'unanimità</strong>
        che il medesimo ha dimostrato una conoscenza <em>straordinaria</em>
        delle arti miscelatorie e delle scienze affini, conseguendo il
        punteggio massimo con lode.
      </p>
      <p class="diploma-body">
        Si conferisce pertanto il titolo di <strong>Dottore Emerito in Scienze
        del Beverage</strong>, con tutti gli onori e i privilegi che ne derivano.
        Anche i vecchi bavosi di Padova si inchinano.
      </p>`
    : verdict.passed
      ? `<p class="diploma-body">
          La Commissione, riunita in seduta straordinaria presso il Dipartimento
          di Scienze Chimiche, della Vita e della Sostenibilità Ambientale,
          avendo valutato le prove sostenute dal candidato, <strong>delibera</strong>
          quanto segue:
        </p>
        <p class="diploma-body">
          Il candidato ha dimostrato sufficiente padronanza delle discipline
          oggetto d'esame. Si conferisce pertanto il titolo di
          <strong>Dottore in Scienze del Beverage</strong>,
          con decorrenza immediata e validità a tempo indeterminato
          (salvo revoca per manifesta incompetenza al bancone).
        </p>`
      : `<p class="diploma-body">
          La Commissione, riunita in seduta straordinaria presso il Dipartimento
          di Scienze Chimiche, della Vita e della Sostenibilità Ambientale,
          avendo valutato le prove sostenute dal candidato, <strong>delibera</strong>
          quanto segue:
        </p>
        <p class="diploma-body">
          Il candidato <strong>non ha raggiunto</strong> la soglia minima richiesta
          per il conferimento del titolo. Si invita il candidato a ripresentare
          domanda di laurea presso la Segreteria Studenti, previo ulteriore
          studio e frequentazione assidua dei migliori locali della città.
        </p>
        <p class="diploma-body diploma-note">
          N.B. La Commissione suggerisce un periodo di tirocinio pratico
          non inferiore a 30 aperitivi prima di ripresentarsi all'esame.
        </p>`;

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
          <thead>
            <tr><th>Prova</th><th>Risultato</th><th>Peso</th></tr>
          </thead>
          <tbody>${rows}</tbody>
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
