/* =========================================================================
   RENDERING DELLE MANCHE
   =========================================================================
   Ogni funzione render*(round) costruisce l'HTML della manche dentro
   #stage e collega gli eventi. Per creare un NUOVO tipo di manche:
     1) scegli un nome per round.type (es. 'true-false')
     2) scrivi una funzione renderTrueFalse(round)
     3) aggiungila a RENDERERS
   Dipende da: constants.js, engine.js, ui.js, molecule-art.js, data.js.
   ========================================================================= */


/* ---------- dispatcher ---------- */

const RENDERERS = {
  'molecule-guess': renderMoleculeGuess,
  'multiple-choice': renderMultipleChoice,
  'matching':        renderMatching,
  'image-zoom':      renderImageZoom
};

function renderRound(round) {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';

  const gameDef = getGameDef(Game.gameId);
  document.getElementById('round-counter').textContent =
    `${gameDef ? gameDef.label + ' · ' : ''}Manche ${Game.roundIndex + 1} di ${Game.rounds.length}`;

  const renderer = RENDERERS[round.type];
  if (renderer) {
    renderer(round, stage);
  } else {
    stage.innerHTML = `<p>Tipo di manche sconosciuto: ${round.type}</p>`;
  }
}


/* ---------- messaggi di errore ---------- */

function randomWrongDrinkMessage() {
  return WRONG_DRINK_MESSAGES[Math.floor(Math.random() * WRONG_DRINK_MESSAGES.length)];
}

let wrongQuizPool = [];

function randomWrongQuizMessage() {
  if (wrongQuizPool.length === 0) {
    wrongQuizPool = [...WRONG_QUIZ_MESSAGES];
    shuffleArray(wrongQuizPool);
  }
  return wrongQuizPool.pop();
}


/* ---------- helper navigazione ---------- */

function nextButtonHTML() {
  const label = isLastRound() ? 'Vedi risultato prova →' : 'Prossima manche →';
  return `<button id="next-btn" class="btn btn-primary hidden">${label}</button>`;
}

function wireNextButton() {
  document.getElementById('next-btn').addEventListener('click', goToNextRoundOrFinishGame);
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
  const molecules = drink.molecules.map(key => ({ key, ...MOLECULES[key] }));

  stage.innerHTML = buildMoleculeGuessHTML(drink, molecules);

  initMoleculeGuessHints(drink, molecules, stage);
  initMoleculeGuessCards(stage);
  initMoleculeGuessForm(drink, molecules, stage);
}

function buildMoleculeGuessHTML(drink, molecules) {
  const moleculeCards = molecules.map((mol, i) => `
    <div class="mol-card" role="button" tabindex="0" style="--flask-color:${mol.color.hex}" data-structure="${mol.structure}" data-formula="${mol.formula}" data-molname="${mol.name}">
      <div class="mol-left">
        ${flaskSVG(mol.color.hex)}
        <div class="mol-name hidden" data-mol="${i}">${mol.name}</div>
      </div>
      <div class="mol-right">
        <div class="mol-formula">${mol.formula}</div>
        <img class="mol-structure" src="${mol.structure}" alt="struttura di ${mol.name}">
      </div>
    </div>
  `).join('');

  return `
    <div class="round-card question-card">
      <div class="eyebrow">${document.getElementById('round-counter').textContent}</div>
      <div class="heading-row">
        <h2 class="round-heading">Che drink è?</h2>
        ${tooltipIcon('Acqua ed etanolo sono presenti in ogni drink alcolico: per questo non vengono mai mostrati tra le molecole indizio.')}
      </div>

      <div class="guess-row">
        <div class="hints-col">
          <div class="hints-row">
            <button id="hint1-btn" class="btn btn-hint" data-tooltip="Mostra 4 possibili risposte tra cui scegliere">
              🍹 Aiuto 1 — Mostra 4 opzioni <span class="drink-tag">(bevi!)</span>
            </button>
            <button id="hint2-btn" class="btn btn-hint" disabled data-tooltip="Rivela il nome scientifico di ogni molecola indizio. Sblocca prima l'Aiuto 1.">
              🔒 Aiuto 2 — Rivela i nomi <span class="drink-tag">(bevi!)</span>
            </button>
          </div>
        </div>

        <div class="mol-col">
          <div class="mol-row">${moleculeCards}</div>
          <div id="mg-options" class="options-row hidden"></div>
        </div>
      </div>

      <form id="mg-form" class="answer-form">
        <input id="mg-input" type="text" placeholder="Scrivi il nome del drink..." autocomplete="off">
        <button type="submit" class="btn btn-primary">Rispondi</button>
      </form>

      <div id="mg-feedback" class="feedback"></div>
    </div>
  `;
}

function initMoleculeGuessHints(drink, molecules, stage) {
  document.getElementById('hint1-btn').addEventListener('click', () => {
    if (Game.roundLocked) return;
    clearFeedback('mg-feedback');
    registerHintUsed();

    const options = getManualOptionsForDrink(drink);
    const box = document.getElementById('mg-options');
    box.classList.remove('hidden');
    box.innerHTML = options.map(opt =>
      `<button type="button" class="btn btn-option">${opt}</button>`
    ).join('');

    box.querySelectorAll('.btn-option').forEach(btn => {
      btn.addEventListener('click', () => attemptDrinkAnswer(btn.textContent, drink, molecules, btn));
    });

    document.getElementById('hint1-btn').disabled = true;

    const hint2 = document.getElementById('hint2-btn');
    hint2.disabled = false;
    hint2.innerHTML = '🍹 Aiuto 2 — Rivela i nomi <span class="drink-tag">(bevi!)</span>';
    hint2.setAttribute('data-tooltip', 'Rivela il nome scientifico di ogni molecola indizio');
  });

  document.getElementById('hint2-btn').addEventListener('click', () => {
    if (Game.roundLocked || document.getElementById('hint2-btn').disabled) return;
    clearFeedback('mg-feedback');
    registerHintUsed();
    document.querySelectorAll('.mol-name').forEach(el => el.classList.remove('hidden'));
    document.getElementById('hint2-btn').disabled = true;
  });
}

function initMoleculeGuessCards(stage) {
  stage.querySelectorAll('.mol-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const nameEl = card.querySelector('.mol-name');
      const nameRevealed = nameEl && !nameEl.classList.contains('hidden');
      openLightbox({
        src: card.dataset.structure,
        formula: card.dataset.formula,
        name: nameRevealed ? card.dataset.molname : null
      });
    });
  });
}

function initMoleculeGuessForm(drink, molecules, stage) {
  const mgInput = document.getElementById('mg-input');
  mgInput.addEventListener('input', () => clearFeedback('mg-feedback'));
  mgInput.addEventListener('focus', () => clearFeedback('mg-feedback'));

  let lastSubmittedText = null;

  document.getElementById('mg-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Game.roundLocked) return;
    const current = mgInput.value.trim();
    if (!current || current.toLowerCase() === lastSubmittedText) return;
    lastSubmittedText = current.toLowerCase();
    attemptDrinkAnswer(mgInput.value, drink, molecules);
  });
}

function attemptDrinkAnswer(text, drink, molecules, btnEl) {
  if (Game.roundLocked) return;
  const feedback = document.getElementById('mg-feedback');

  if (isCorrectDrinkAnswer(drink, text)) {
    completeRound();
    feedback.className = 'feedback correct';
    feedback.textContent = `Corretto! Era ${drink.name}.`;
    document.getElementById('mg-form').querySelectorAll('input,button').forEach(el => el.disabled = true);
    document.querySelectorAll('#mg-options .btn-option').forEach(el => el.disabled = true);
    document.querySelectorAll('.mol-name').forEach(el => el.classList.remove('hidden'));
    showSolutionPopup(drink, molecules);
  } else {
    const normalized = text.trim().toLowerCase();
    if (normalized !== (attemptDrinkAnswer._lastWrong || '')) {
      registerWrongAttempt();
      attemptDrinkAnswer._lastWrong = normalized;
    }
    feedback.className = 'feedback wrong';
    feedback.textContent = randomWrongDrinkMessage();
    if (btnEl) {
      btnEl.classList.add('wrong');
      btnEl.disabled = true;
    }
  }
}


/* ---------- feedback helper ---------- */

function clearFeedback(id) {
  const el = document.getElementById(id);
  if (el) { el.textContent = ''; el.className = 'feedback'; }
}


/* =========================================================================
   POP-UP SOLUZIONE (mostrato alla risposta esatta di "molecule-guess")
   ========================================================================= */

function showSolutionPopup(drink, molecules) {
  closeSolutionPopup();

  const rows = molecules.map(mol => `
    <div class="solution-mol-row">
      <div class="solution-icon" style="background:${mol.color.hex}55;border-color:${mol.color.hex}">${mol.icon || '⚗️'}</div>
      <div class="solution-mol-text">
        <div class="solution-formula">${mol.formula}</div>
        <div class="solution-name">${mol.name}</div>
        <div class="solution-desc">${(drink.moleculeNotes && drink.moleculeNotes[mol.key]) || ''}</div>
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
      <div class="solution-columns">
        <div class="solution-header">
          <h2 class="solution-title">${drink.name}</h2>
          <img class="solution-image" src="${drink.image}" alt="${drink.name}">
          <div class="solution-difficulty">DIFFICOLTÀ: ${starsHTML(drink.difficulty || 1)}</div>
        </div>
        <div class="solution-body">
          <div class="solution-molecules">${rows}</div>
          ${drink.tip ? `<div class="solution-tip">💡 ${drink.tip}</div>` : ''}
        </div>
      </div>
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
   TIPO 2 — MULTIPLE CHOICE (domanda a risposta multipla)
   ========================================================================= */

function renderMultipleChoice(round, stage) {
  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${document.getElementById('round-counter').textContent}</div>
      <h2 class="round-heading">${round.question}</h2>
      <div class="options-row mc-options">
        ${round.options.map((opt, i) => `<button type="button" class="btn btn-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <div id="mc-feedback" class="feedback"></div>
      ${nextButtonHTML()}
    </div>
  `;

  stage.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => handleMultipleChoiceAnswer(btn, round, stage));
  });

  wireNextButton();
}

function handleMultipleChoiceAnswer(btn, round, stage) {
  if (Game.roundLocked) return;
  const idx = Number(btn.dataset.index);
  const feedback = document.getElementById('mc-feedback');

  stage.querySelectorAll('.btn-option').forEach(b => {
    b.disabled = true;
    if (Number(b.dataset.index) === round.correctIndex) b.classList.add('correct');
  });

  if (idx === round.correctIndex) {
    completeRound(100);
    feedback.className = 'feedback correct';
    feedback.textContent = 'Corretto!';
  } else {
    btn.classList.add('wrong');
    completeRound(0);
    feedback.className = 'feedback wrong';
    feedback.textContent = randomWrongQuizMessage();
  }

  revealNext();
}


/* =========================================================================
   TIPO 3 — MATCHING (associazione nome <-> immagine)
   ========================================================================= */

function renderMatching(round, stage) {
  const names = round.pairs.map((p, i) => ({ text: p.name, pairIndex: i }));
  const images = round.pairs.map((p, i) => ({ image: p.image, pairIndex: i }));
  shuffleArray(names);
  shuffleArray(images);

  stage.innerHTML = buildMatchingHTML(round, names, images);

  const state = { selectedName: null, matchedCount: 0 };
  const total = round.pairs.length;

  initMatchingCardDismiss(stage);
  initMatchingNames(stage, state, total);
  initMatchingImages(stage, state, total);

  wireNextButton();
}

function buildMatchingHTML(round, names, images) {
  return `
    <div class="round-card question-card">
      <div class="eyebrow">${document.getElementById('round-counter').textContent}</div>
      <h2 class="round-heading">${round.instructions || 'Associa ogni nome alla sua immagine'}</h2>
      <div class="matching-board">
        <div class="matching-col names-col">
          ${names.map(n => `<button type="button" class="btn btn-name" data-pair="${n.pairIndex}">${n.text}</button>`).join('')}
        </div>
        <div class="matching-col images-col">
          ${images.map(im => `
            <div class="btn btn-image" data-pair="${im.pairIndex}" tabindex="0" role="button">
              <button type="button" class="magnify-btn" data-image="${im.image}" aria-label="Ingrandisci immagine">🔍</button>
              <img src="${im.image}" alt="">
            </div>
          `).join('')}
        </div>
      </div>
      <div id="match-feedback" class="feedback"></div>
      ${nextButtonHTML()}
    </div>
  `;
}

function initMatchingCardDismiss(stage) {
  const card = stage.querySelector('.round-card');
  card.addEventListener('click', () => clearFeedback('match-feedback'));
}

function tryMatch(nameBtn, imageBtn, state, total) {
  const feedback = document.getElementById('match-feedback');

  if (nameBtn.dataset.pair === imageBtn.dataset.pair) {
    nameBtn.classList.add('matched');
    nameBtn.classList.remove('selected');
    nameBtn.disabled = true;
    nameBtn.draggable = false;
    imageBtn.classList.add('matched');
    state.selectedName = null;
    state.matchedCount++;

    feedback.className = 'feedback correct';
    feedback.textContent = 'Coppia corretta!';

    if (state.matchedCount === total) {
      completeRound();
      feedback.textContent = 'Hai completato tutte le associazioni!';
      revealNext();
    }
  } else {
    registerWrongAttempt();
    imageBtn.classList.add('wrong-flash');
    nameBtn.classList.add('wrong-flash');
    feedback.className = 'feedback wrong';
    feedback.textContent = 'Associazione sbagliata, riprova.';
    setTimeout(() => {
      imageBtn.classList.remove('wrong-flash');
      nameBtn.classList.remove('wrong-flash', 'selected');
      if (state.selectedName === nameBtn) state.selectedName = null;
    }, 500);
  }
}

function initMatchingNames(stage, state, total) {
  let touchDragging = null;
  let touchMoved = false;

  stage.querySelectorAll('.btn-name').forEach(btn => {
    btn.draggable = true;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      stage.querySelectorAll('.btn-name').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedName = btn;
    });

    btn.addEventListener('dragstart', (e) => {
      if (btn.classList.contains('matched')) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', btn.dataset.pair);
      e.dataTransfer.effectAllowed = 'move';
      btn.classList.add('dragging');
      stage.querySelectorAll('.btn-name').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedName = btn;
    });

    btn.addEventListener('dragend', () => btn.classList.remove('dragging'));

    btn.addEventListener('touchstart', () => {
      if (btn.classList.contains('matched')) return;
      touchDragging = btn;
      touchMoved = false;
      stage.querySelectorAll('.btn-name').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected', 'dragging');
      state.selectedName = btn;
    }, { passive: true });

    btn.addEventListener('touchmove', (e) => {
      if (!touchDragging || touchDragging !== btn) return;
      touchMoved = true;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      stage.querySelectorAll('.btn-image').forEach(b => b.classList.remove('drag-over'));
      if (target) {
        const imageBtn = target.closest('.btn-image');
        if (imageBtn && !imageBtn.classList.contains('matched')) {
          imageBtn.classList.add('drag-over');
        }
      }
    }, { passive: false });

    btn.addEventListener('touchend', () => {
      if (!touchDragging || touchDragging !== btn) return;
      btn.classList.remove('dragging');
      const overBtn = stage.querySelector('.btn-image.drag-over');
      stage.querySelectorAll('.btn-image').forEach(b => b.classList.remove('drag-over'));
      if (touchMoved && overBtn) {
        tryMatch(btn, overBtn, state, total);
      }
      touchDragging = null;
      touchMoved = false;
    });
  });
}

function initMatchingImages(stage, state, total) {
  stage.querySelectorAll('.magnify-btn').forEach(mBtn => {
    mBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox({ src: mBtn.dataset.image });
    });
  });

  stage.querySelectorAll('.btn-image').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('matched')) return;
      if (!state.selectedName) {
        const feedback = document.getElementById('match-feedback');
        feedback.className = 'feedback';
        feedback.textContent = 'Seleziona prima un nome a sinistra.';
        return;
      }
      tryMatch(state.selectedName, btn, state, total);
    });

    btn.addEventListener('dragover', (e) => {
      if (btn.classList.contains('matched')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      btn.classList.add('drag-over');
    });

    btn.addEventListener('dragleave', () => btn.classList.remove('drag-over'));

    btn.addEventListener('drop', (e) => {
      e.preventDefault();
      btn.classList.remove('drag-over');
      if (btn.classList.contains('matched') || !state.selectedName) return;
      tryMatch(state.selectedName, btn, state, total);
    });
  });
}


/* =========================================================================
   TIPO 4 — IMAGE ZOOM ("Splash", indovina dall'immagine zoomata)
   ========================================================================= */

function renderImageZoom(round, stage) {
  const focusX = (round.zoomFocus && round.zoomFocus.x) ?? 50;
  const focusY = (round.zoomFocus && round.zoomFocus.y) ?? 50;
  const minZoom = round.minZoom ?? 1;
  const zoomStep = round.zoomStep ?? 1;
  let zoom = round.startZoom ?? 5;

  stage.innerHTML = `
    <div class="round-card question-card">
      <div class="eyebrow">${document.getElementById('round-counter').textContent}</div>
      <div class="heading-row">
        <h2 class="round-heading">Indovina dall'immagine</h2>
        ${tooltipIcon('Ogni risposta sbagliata allontana un po\' lo zoom, fino a mostrare l\'immagine intera.')}
      </div>

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
  const input = document.getElementById('zoom-input');
  input.addEventListener('input', () => clearFeedback('zoom-feedback'));
  input.addEventListener('focus', () => clearFeedback('zoom-feedback'));

  let lastSubmittedZoom = null;

  document.getElementById('zoom-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Game.roundLocked) return;
    const current = input.value.trim();
    if (!current || current.toLowerCase() === lastSubmittedZoom) return;
    lastSubmittedZoom = current.toLowerCase();

    const feedback = document.getElementById('zoom-feedback');

    if (isCorrectSimpleAnswer(round, input.value)) {
      completeRound();
      zoom = minZoom;
      img.style.transform = `scale(${zoom})`;
      feedback.className = 'feedback correct';
      feedback.textContent = `Corretto! Era ${round.answer}.`;
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
