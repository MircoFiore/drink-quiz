/* =========================================================================
   UTILITÀ UI — tooltip, lightbox, keyboard scroll, helper grafici
   =========================================================================
   Funzioni di interfaccia generiche, indipendenti dalla logica di gioco.
   ========================================================================= */


/* ---------- tooltip (posizionamento smart via JS) ---------- */

let _activeBubble = null;

function showTooltip(el) {
  hideTooltip();
  const text = el.getAttribute('data-tooltip');
  if (!text) return;

  const bubble = document.createElement('div');
  bubble.className = 'tooltip-bubble';
  bubble.textContent = text;
  document.body.appendChild(bubble);
  _activeBubble = bubble;

  const rect = el.getBoundingClientRect();
  const bw = bubble.offsetWidth;
  const bh = bubble.offsetHeight;
  const gap = 10;

  let top = rect.bottom + gap;
  let left = rect.left + rect.width / 2 - bw / 2;

  if (top + bh > window.innerHeight) {
    top = rect.top - bh - gap;
  }
  if (left < 8) left = 8;
  if (left + bw > window.innerWidth - 8) left = window.innerWidth - 8 - bw;

  bubble.style.top = top + 'px';
  bubble.style.left = left + 'px';
}

function hideTooltip() {
  if (_activeBubble) { _activeBubble.remove(); _activeBubble = null; }
}

function initTooltipListeners() {
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) showTooltip(el);
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) hideTooltip();
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) { showTooltip(el); e.preventDefault(); }
    else hideTooltip();
  });
  document.addEventListener('scroll', hideTooltip, true);
}


/* ---------- mobile keyboard scroll ---------- */

function initMobileKeyboardScroll() {
  document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
    }
  });
}


/* ---------- lightbox (immagini e molecole) ---------- */

function openLightbox(options) {
  closeLightbox();

  const overlay = document.createElement('div');
  overlay.id = 'image-lightbox';
  overlay.className = 'image-lightbox';

  let innerClass = 'image-lightbox-inner';
  let contentHTML = '';

  if (options.formula) {
    innerClass += ' mol-lightbox-inner';
    contentHTML = `
      <h3 class="mol-lightbox-title">${options.formula}</h3>
      <img src="${options.src}" alt="${options.name || ''}">
      ${options.name ? `<p class="mol-lightbox-name">${options.name}</p>` : ''}
    `;
  } else {
    contentHTML = `<img src="${options.src}" alt="">`;
  }

  overlay.innerHTML = `
    <div class="${innerClass}">
      <button class="image-lightbox-close" aria-label="Chiudi">&times;</button>
      ${contentHTML}
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.image-lightbox-close').addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', _escCloseLightbox);
}

function closeLightbox() {
  const el = document.getElementById('image-lightbox');
  if (el) el.remove();
  document.removeEventListener('keydown', _escCloseLightbox);
}

function _escCloseLightbox(e) {
  if (e.key === 'Escape') closeLightbox();
}


/* ---------- helper grafici ---------- */

function starsHTML(n) {
  const filled = '★'.repeat(n);
  const empty = '☆'.repeat(Math.max(5 - n, 0));
  return `<span class="stars-filled">${filled}</span><span class="stars-empty">${empty}</span>`;
}

function tooltipIcon(text) {
  return `<span class="info-icon" tabindex="0" data-tooltip="${text}">i</span>`;
}
