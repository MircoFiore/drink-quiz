/* =========================================================================
   Genera l'icona "boccetta da laboratorio" con il liquido colorato in base
   alla molecola. Non serve un file SVG per ogni boccetta: basta passare
   il colore. Se vuoi cambiare la FORMA della boccetta per tutto il sito,
   modifica solo questa funzione.
   ========================================================================= */

function flaskSVG(colorHex) {
  return `
    <svg viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg" class="flask-icon">
      <path class="flask-glass" d="M36,6 L36,34 L14,88 Q12,98 24,100 L66,100 Q78,98 76,88 L54,34 L54,6 Z"/>
      <path class="flask-liquid" d="M20,72 L14,88 Q12,98 24,100 L66,100 Q78,98 76,88 L70,72 Z" fill="${colorHex}"/>
      <path class="flask-glass-top" d="M32,6 L58,6"/>
      <circle class="flask-bubble" cx="40" cy="80" r="2.4" fill="${colorHex}"/>
      <circle class="flask-bubble" cx="52" cy="88" r="1.8" fill="${colorHex}"/>
    </svg>
  `;
}
