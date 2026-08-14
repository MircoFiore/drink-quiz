/* =========================================================================
   COSTANTI — penalità, messaggi, testi del verdetto
   =========================================================================
   Tutte le costanti "di contenuto" e i magic number del progetto vivono
   qui, così il resto del codice li referenzia per nome.
   ========================================================================= */


/* ---------- penalità scoring ---------- */

const PENALTY_DEFAULT       = 25;
const PENALTY_MATCHING      = 15;
const PENALTY_ZOOM_STEPS    = [10, 20, 30];
const PENALTY_ZOOM_FALLBACK = 40;


/* ---------- messaggi di errore (drink guess) ---------- */

const WRONG_DRINK_MESSAGES = [
  'Non è questo il drink, riprova!',
  'Non ci sei andato nemmeno vicino.',
  'Ma sei astemio o solo stupido?',
  'Da sobrio non ce la fai proprio, prova a bere un goccio!',
  'Noup, vuoi provare a chiedere una mano alla mamma?',
  'Oggigiorno le lauree le regalano con le patatine.',
  'Ti serve un ripasso? Prova qui: https://it.wikipedia.org/wiki/Molecola',
  'Acqua, acqua, fuochino…',
  'Questa volta hai solo miss-clickato, vero?',
  '🦕 Ah ah ah! You didn\'t say the magic word! 🦖',
  'Prova con "latte materno"!',
  'Sei ancora in tempo per ritirarti',
  'Se vuoi uscire da questa brutta situazione puoi sempre fingere un malore'
];


/* ---------- messaggi di errore (quiz a risposta multipla) ---------- */

const WRONG_QUIZ_MESSAGES = [
  'Sbagliato, se lo sapessero i tuoi insegnanti non staremmo festeggiando oggi!',
  'No! Non capisco se hai bevuto troppo o troppo poco.',
  'Forse dovresti darti alla Biologia Marina.',
  'Questa non la sai, ma scommetto che conosci tutti i champion di LOL.',
  'Forse non hai capito le regole del gioco, devi premere quella esatta!',
  'Se tu sei quello sveglio della famiglia, ho paura di sapere come sono messi gli altri',
  'Ti darei 104 motivi per cui hai sbagliato, ma sarà per la prossima volta',
  'Oltre a essere ignorante sei anche sfortunato, 1/4 non è così difficile da indovinare'
];


/* ---------- testi del diploma / verdetto finale ---------- */

const VERDICT_TEXT_LODE = `
  <p class="diploma-body">
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
  </p>`;

const VERDICT_TEXT_PASS = `
  <p class="diploma-body">
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
  </p>`;

const VERDICT_TEXT_FAIL = `
  <p class="diploma-body">
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
