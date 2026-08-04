/* =========================================================================
   Genera l'icona "boccetta da laboratorio" con il liquido colorato in base
   alla molecola. Non serve un file SVG per ogni boccetta: basta passare
   il colore. Se vuoi cambiare la FORMA della boccetta per tutto il sito,
   modifica solo questa funzione.
   ========================================================================= */

function flaskSVG2(colorHex) {
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

function flaskSVG(colorHex) {
  const id = "flask_" + Math.random().toString(36).slice(2);

  return `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    class="flask-icon">

  <defs>

    <!-- Forma interna della boccetta -->

    <clipPath id="${id}-clip">
      <path d="
        M50 14
        L50 42
        L28 102
        Q26 110 34 114
        L94 114
        Q102 110 100 102
        L78 42
        L78 14
        Z"/>
    </clipPath>

    <!-- Gradiente liquido -->

    <linearGradient id="${id}-liquid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colorHex}" stop-opacity=".82"/>
      <stop offset="100%" stop-color="${colorHex}" stop-opacity="1"/>
    </linearGradient>

  </defs>

  <!-- Liquido -->

  <g clip-path="url(#${id}-clip)">

    <path
      d="
      M18 74
      Q40 68 64 74
      Q88 80 110 72
      L110 120
      L18 120
      Z"
      fill="url(#${id}-liquid)"/>

  </g>

  <!-- Contorno vetro -->

  <path
      d="
      M50 14
      L50 42
      L28 102
      Q26 110 34 114
      L94 114
      Q102 110 100 102
      L78 42
      L78 14"
      fill="none"
      stroke="#768491"
      stroke-width="3.5"
      stroke-linejoin="round"/>

  <!-- Tappo -->

  <rect
      x="48"
      y="8"
      width="32"
      height="8"
      rx="2"
      fill="#DCE3EA"
      stroke="#9FAAB4"
      stroke-width="2"/>

        <!-- Ombra sul piano -->

        <ellipse
            cx="64"
            cy="120"
            rx="28"
            ry="5"
            fill="#000"
            opacity=".12"/>


<!-- Highlight -->

<path
    d="
    M48 28
    C45 45 40 63 36 83
    C34 95 34 101 36 108"
    fill="none"
    stroke="white"
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity=".38"/>

  <!-- Bolle -->

  <circle cx="48" cy="95" r="3" fill="white" opacity=".45"/>
  <circle cx="72" cy="86" r="2.3" fill="white" opacity=".35"/>
  <circle cx="60" cy="105" r="2" fill="white" opacity=".40"/>

</svg>`;
}