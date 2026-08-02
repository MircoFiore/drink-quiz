/* =========================================================================
   RENDERING DELLE MANCHE
   =========================================================================
   Ogni funzione render*(round) costruisce l'HTML della manche dentro
   #stage e collega gli eventi. Per creare un NUOVO tipo di manche:
     1) scegli un nome per round.type (es. 'true-false')
     2) scrivi una funzione renderTrueFalse(round)
     3) aggiungila allo switch in renderRound()
   ========================================================================= */

function renderRound(round) {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  const gameDef = getGameDef(Game.gameId);
  document.getElementById('round-counter').textContent =
    `${gameDef ? gameDef.label + ' · ' : ''}Manche ${Game.roundIndex + 1} di ${Game.rounds.length}`;

  if (round.type === 'molecule-guess') renderMoleculeGuess(round, stage);
  else if (round.type === 'multiple-choice') renderMultipleChoice(round, stage);
  else if (round.type === 'matching') renderMatching(round, stage);
  else if (round.type === 'image-zoom') renderImageZoom(round, stage);
  else stage.innerHTML = `<p>Tipo di manche sconosciuto: ${round.type}</p>`;
}

/* ---------- helper condivisi ---------- */

function tooltipIcon(text) {
  return `<span class="info-icon" tabindex="0" data-tooltip="${text}">i</span>`;
}

function nextButtonHTML() {
  const label = isLastRound() ? 'Vedi risultato prova →' : 'Prossima manche →';
  return `<button id="next-btn" class="btn btn-primary hidden">${label}</button>`;
}

function wireNextButton() {
  const btn = document.getElementById('next-btn');
  btn.addEventListener('click', goToNextRoundOrFinishGame);
}

function revealNext() {
  const btn = document.getElementById('next-btn');
  if (btn) btn.classList.remove('hidden');
}


/* =========================================================================
   TIPO 1 — MOLECULE GUESS ("Che drink è?")
   ========================================================================= */

function renderMoleculeGuess(round, stage) {
  const drink = DRINKS.find(d => d.id === round.drinkId);
  const molecules = drink.molecules.map(id => MOLECULES[id]);

  const moleculeCards = molecules.map((mol, i) => `
    <div class="mol-card">
      ${flaskSVG(mol.color.hex)}
      <div class="mol-formula">${mol.formula}</div>
      <img class="mol-structure" src="${mol.structure}" alt="struttura di ${mol.name}">
      <div class="mol-name hidden" data-mol="${i}">${mol.name}</div>
    </div>
  `).join('');

  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${round.title}</div>
      <h2 class="round-heading">Che drink è?
        ${tooltipIcon('Acqua ed etanolo sono presenti in ogni drink alcolico: per questo non vengono mai mostrati tra le molecole indizio.')}
      </h2>

      <div class="hints-row">
        <button id="hint1-btn" class="btn btn-hint" data-tooltip="Mostra 4 possibili risposte tra cui scegliere">
          🍹 Aiuto 1 — Mostra 4 opzioni <span class="drink-tag">(bevi!)</span>
        </button>
        <button id="hint2-btn" class="btn btn-hint" disabled data-tooltip="Rivela il nome scientifico di ogni molecola indizio. Sblocca prima l'Aiuto 1.">
          🔒 Aiuto 2 — Rivela i nomi <span class="drink-tag">(bevi!)</span>
        </button>
      </div>

      <div id="mg-options" class="options-row hidden"></div>

      <div class="mol-row">${moleculeCards}</div>

      <form id="mg-form" class="answer-form">
        <input id="mg-input" type="text" placeholder="Scrivi il nome del drink..." autocomplete="off">
        <button type="submit" class="btn btn-primary">Rispondi</button>
      </form>

      <div id="mg-feedback" class="feedback"></div>
    </div>
  `;

  const feedback = document.getElementById('mg-feedback');
  const clearFeedback = () => {
    feedback.textContent = '';
    feedback.className = 'feedback';
  };

  document.getElementById('hint1-btn').addEventListener('click', () => {
    if (Game.roundLocked) return;
    clearFeedback();
    registerHintUsed();
    const options = getManualOptionsForDrink(drink);
    const box = document.getElementById('mg-options');
    box.classList.remove('hidden');
    box.innerHTML = options.map(opt => `<button type="button" class="btn btn-option">${opt}</button>`).join('');
    box.querySelectorAll('.btn-option').forEach(btn => {
      btn.addEventListener('click', () => attemptAnswer(btn.textContent, drink, btn));
    });
    document.getElementById('hint1-btn').disabled = true;

    const hint2 = document.getElementById('hint2-btn');
    hint2.disabled = false;
    hint2.innerHTML = '🍹 Aiuto 2 — Rivela i nomi <span class="drink-tag">(bevi!)</span>';
    hint2.setAttribute('data-tooltip', 'Rivela il nome scientifico di ogni molecola indizio');
  });

  document.getElementById('hint2-btn').addEventListener('click', () => {
    if (Game.roundLocked || document.getElementById('hint2-btn').disabled) return;
    clearFeedback();
    registerHintUsed();
    document.querySelectorAll('.mol-name').forEach(el => el.classList.remove('hidden'));
    document.getElementById('hint2-btn').disabled = true;
  });

  const mgInput = document.getElementById('mg-input');
  mgInput.addEventListener('input', clearFeedback);
  mgInput.addEventListener('focus', clearFeedback);

  document.getElementById('mg-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Game.roundLocked) return;
    attemptAnswer(mgInput.value, drink);
  });

  function attemptAnswer(text, drink, btnEl) {
    if (Game.roundLocked) return;
    if (isCorrectDrinkAnswer(drink, text)) {
      completeRound();
      feedback.className = 'feedback correct';
      feedback.textContent = `Esatto! Era ${drink.name}. 🎉`;
      document.getElementById('mg-form').querySelectorAll('input,button').forEach(el => el.disabled = true);
      document.querySelectorAll('#mg-options .btn-option').forEach(el => el.disabled = true);
      document.querySelectorAll('.mol-name').forEach(el => el.classList.remove('hidden'));
      showSolutionPopup(drink, molecules);
    } else {
      registerWrongAttempt();
      feedback.className = 'feedback wrong';
      feedback.textContent = 'Non è questo il drink, riprova!';
      if (btnEl) {
        btnEl.classList.add('wrong');
        btnEl.disabled = true;
      }
    }
  }
}


/* =========================================================================
   POP-UP SOLUZIONE (mostrato alla risposta esatta di una manche
   "molecule-guess"), in stile "carta soluzione".
   ========================================================================= */

function starsHTML(n) {
  const filled = '★'.repeat(n);
  const empty = '☆'.repeat(Math.max(5 - n, 0));
  return `<span class="stars-filled">${filled}</span><span class="stars-empty">${empty}</span>`;
}

function showSolutionPopup(drink, molecules) {
  closeSolutionPopup();

  const rows = molecules.map(mol => `
    <div class="solution-mol-row">
      <div class="solution-icon" style="background:${mol.color.hex}55;border-color:${mol.color.hex}">${mol.icon || '⚗️'}</div>
      <div class="solution-mol-text">
        <div class="solution-formula">${mol.formula}</div>
        <div class="solution-name">${mol.name}</div>
        <div class="solution-desc">${(drink.moleculeNotes && drink.moleculeNotes[mol.id]) || ''}</div>
      </div>
    </div>
  `).join('');

  const nextLabel = isLastRound() ? 'Vedi risultato prova →' : 'Prossima manche →';

  const overlay = document.createElement('div');
  overlay.id = 'solution-overlay';
  overlay.className = 'solution-overlay';
  overlay.innerHTML = `
    <div class="solution-card">
      <div class="solution-ribbon">Soluzione</div>
      <h2 class="solution-title">${drink.name}</h2>
      <img class="solution-image" src="${drink.image}" alt="${drink.name}">
      <div class="solution-molecules">${rows}</div>
      ${drink.tip ? `<div class="solution-tip">💡 ${drink.tip}</div>` : ''}
      <div class="solution-difficulty">DIFFICOLTÀ: ${starsHTML(drink.difficulty || 1)}</div>
      <button id="solution-next-btn" class="btn btn-primary btn-large solution-next">${nextLabel}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#solution-next-btn').addEventListener('click', () => {
    closeSolutionPopup();
    goToNextRoundOrFinishGame();
  });
}

function closeSolutionPopup() {
  const el = document.getElementById('solution-overlay');
  if (el) el.remove();
}


/* =========================================================================
   TIPO 2 — MULTIPLE CHOICE (domanda generica a risposta multipla)
   ========================================================================= */

function renderMultipleChoice(round, stage) {
  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${round.title}</div>
      <h2 class="round-heading">${round.question}</h2>
      <div class="options-row mc-options">
        ${round.options.map((opt, i) => `<button type="button" class="btn btn-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <div id="mc-feedback" class="feedback"></div>
      ${nextButtonHTML()}
    </div>
  `;

  stage.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (Game.roundLocked) return;
      const idx = Number(btn.dataset.index);
      const feedback = document.getElementById('mc-feedback');
      if (idx === round.correctIndex) {
        completeRound();
        btn.classList.add('correct');
        feedback.className = 'feedback correct';
        feedback.textContent = 'Esatto! 🎉';
        stage.querySelectorAll('.btn-option').forEach(b => b.disabled = true);
        revealNext();
      } else {
        registerWrongAttempt();
        btn.classList.add('wrong');
        btn.disabled = true;
        feedback.className = 'feedback wrong';
        feedback.textContent = 'Risposta sbagliata, prova con un\'altra opzione.';
      }
    });
  });

  wireNextButton();
}


/* =========================================================================
   TIPO 3 — MATCHING (associazione nome <-> immagine)
   ========================================================================= */

function renderMatching(round, stage) {
  const names = round.pairs.map((p, i) => ({ text: p.name, pairIndex: i }));
  const images = round.pairs.map((p, i) => ({ image: p.image, pairIndex: i }));
  shuffleArray(names);
  shuffleArray(images);

  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${round.title}</div>
      <h2 class="round-heading">${round.instructions || 'Associa ogni nome alla sua immagine'}</h2>
      <div class="matching-board">
        <div class="matching-col names-col">
          ${names.map(n => `<button type="button" class="btn btn-name" data-pair="${n.pairIndex}">${n.text}</button>`).join('')}
        </div>
        <div class="matching-col images-col">
          ${images.map(im => `<button type="button" class="btn btn-image" data-pair="${im.pairIndex}"><img src="${im.image}" alt=""></button>`).join('')}
        </div>
      </div>
      <div id="match-feedback" class="feedback"></div>
      ${nextButtonHTML()}
    </div>
  `;

  let selectedName = null;
  let matchedCount = 0;
  const total = round.pairs.length;

  stage.querySelectorAll('.btn-name').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      stage.querySelectorAll('.btn-name').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedName = btn;
    });
  });

  stage.querySelectorAll('.btn-image').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      const feedback = document.getElementById('match-feedback');
      if (!selectedName) {
        feedback.className = 'feedback';
        feedback.textContent = 'Seleziona prima un nome a sinistra.';
        return;
      }
      if (selectedName.dataset.pair === btn.dataset.pair) {
        selectedName.classList.add('matched');
        selectedName.classList.remove('selected');
        selectedName.disabled = true;
        btn.classList.add('matched');
        btn.disabled = true;
        selectedName = null;
        matchedCount++;
        feedback.className = 'feedback correct';
        feedback.textContent = 'Coppia corretta!';
        if (matchedCount === total) {
          completeRound();
          feedback.textContent = 'Hai completato tutte le associazioni! 🎉';
          revealNext();
        }
      } else {
        registerWrongAttempt();
        btn.classList.add('wrong-flash');
        selectedName.classList.add('wrong-flash');
        feedback.className = 'feedback wrong';
        feedback.textContent = 'Associazione sbagliata, riprova.';
        setTimeout(() => {
          btn.classList.remove('wrong-flash');
          if (selectedName) selectedName.classList.remove('wrong-flash', 'selected');
          selectedName = null;
        }, 500);
      }
    });
  });

  wireNextButton();
}


/* =========================================================================
   TIPO 4 — IMAGE ZOOM (indovina dall'immagine super-zoomata, stile "splash")
   ========================================================================= */

function renderImageZoom(round, stage) {
  const focusX = (round.zoomFocus && round.zoomFocus.x) ?? 50;
  const focusY = (round.zoomFocus && round.zoomFocus.y) ?? 50;
  const minZoom = round.minZoom ?? 1;
  const zoomStep = round.zoomStep ?? 1;
  let zoom = round.startZoom ?? 5;

  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${round.title}</div>
      <h2 class="round-heading">Indovina dall'immagine
        ${tooltipIcon('Ogni risposta sbagliata allontana un po\' lo zoom, fino a mostrare l\'immagine intera.')}
      </h2>

      <div class="zoom-frame">
        <img id="zoom-image" class="zoom-image" src="${round.image}" alt="immagine da indovinare"
             style="transform-origin:${focusX}% ${focusY}%; transform: scale(${zoom});">
      </div>

      <form id="zoom-form" class="answer-form">
        <input id="zoom-input" type="text" placeholder="Scrivi la risposta..." autocomplete="off">
        <button type="submit" class="btn btn-primary">Rispondi</button>
      </form>

      <div id="zoom-feedback" class="feedback"></div>
      ${nextButtonHTML()}
    </div>
  `;

  const img = document.getElementById('zoom-image');
  const feedback = document.getElementById('zoom-feedback');
  const input = document.getElementById('zoom-input');
  const clearFeedback = () => { feedback.textContent = ''; feedback.className = 'feedback'; };
  input.addEventListener('input', clearFeedback);
  input.addEventListener('focus', clearFeedback);

  document.getElementById('zoom-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Game.roundLocked) return;

    if (isCorrectSimpleAnswer(round, input.value)) {
      completeRound();
      zoom = minZoom;
      img.style.transform = `scale(${zoom})`;
      feedback.className = 'feedback correct';
      feedback.textContent = `Esatto! Era ${round.answer}. 🎉`;
      document.getElementById('zoom-form').querySelectorAll('input,button').forEach(el => el.disabled = true);
      revealNext();
    } else {
      registerWrongAttempt();
      zoom = Math.max(zoom - zoomStep, minZoom);
      img.style.transform = `scale(${zoom})`;
      feedback.className = 'feedback wrong';
      feedback.textContent = zoom <= minZoom
        ? 'Non è quello... ma ora vedi l\'immagine intera!'
        : 'Non è quello, riprova! L\'immagine si allontana un po\'.';
    }
  });

  wireNextButton();
}
