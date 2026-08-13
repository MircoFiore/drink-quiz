/* =========================================================================
   DATI DEL GIOCO — "Test di Laurea, il quiz"
   =========================================================================
   Questo è l'UNICO file che devi modificare per aggiungere o cambiare
   contenuti (molecole, drink, domande, e i GIOCHI stessi con le loro
   manche). Non serve toccare il resto del codice.

   Il sito è organizzato in GIOCHI (sezione 4, GAMES): l'utente li sceglie
   dalla schermata principale nell'ordine che preferisce. Ogni gioco è
   composto da una o più manche (stessi 4 tipi di sempre: molecule-guess,
   multiple-choice, matching, image-zoom).

   Guarda il file README.md per la guida passo-passo.
   ========================================================================= */


/* -------------------------------------------------------------------------
   1) MOLECOLE
   -------------------------------------------------------------------------
   Ogni molecola ha:
     id        -> identificativo unico (usato per collegarla ai drink)
     formula   -> formula chimica, puoi usare <sub> per i pedici
     name      -> nome comune/scientifico, mostrato solo dopo l'Aiuto 1
     color     -> colore associato (usato per colorare il liquido nella
                  boccetta): { hex: '#RRGGBB', label: 'nome del colore' }
     structure -> percorso del file SVG con la struttura scheletrica
     common    -> true SOLO per acqua ed etanolo: sono presenti in ogni
                  drink alcolico e quindi vengono sempre nascoste, con un
                  tooltip esplicativo (vedi motore di gioco)

   Per aggiungere una nuova molecola: copia un blocco, cambia id/valori,
   e disegna/aggiungi il suo file SVG in assets/molecules/.
   ------------------------------------------------------------------------- */

const MOLECULES = {

  water: {
    id: 'water',
    formula: 'H<sub>2</sub>O',
    name: 'Acqua',
    color: { hex: '#8FC1E3', label: 'azzurro trasparente' },
    structure: 'assets/molecules/water.svg',
    icon: '💧',
    common: true
  },
  ethanol: {
    id: 'ethanol',
    formula: 'C<sub>2</sub>H<sub>6</sub>O',
    name: 'Etanolo',
    color: { hex: '#9FCB7F', label: 'verde chiaro' },
    structure: 'assets/molecules/ethanol.svg',
    icon: '🥃',
    common: true
  },
  citric_acid: {
    id: 'citric_acid',
    formula: 'C<sub>6</sub>H<sub>8</sub>O<sub>7</sub>',
    name: 'Acido citrico',
    color: { hex: '#E8C34A', label: 'giallo dorato' },
    structure: 'assets/molecules/citric-acid.png',
    icon: '🍋'
  },
  limonene: {
    id: 'limonene',
    formula: 'C<sub>10</sub>H<sub>16</sub>',
    name: 'Limonene',
    color: { hex: '#EFA23B', label: 'arancione' },
    structure: 'assets/molecules/limonene.svg',
    icon: '🍊'
  },
  co2: {
    id: 'co2',
    formula: 'CO<sub>2</sub>',
    name: 'Anidride carbonica',
    color: { hex: '#8BB8D0', label: 'azzurro effervescenza' },
    structure: 'assets/molecules/co2.svg',
    icon: '💨'
  },
  menthol: {
    id: 'menthol',
    formula: 'C<sub>10</sub>H<sub>20</sub>O',
    name: 'Mentolo',
    color: { hex: '#5FAE8C', label: 'verde menta' },
    structure: 'assets/molecules/menthol.png',
    icon: '🌿'
  },
  sucrose: {
    id: 'sucrose',
    formula: 'C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>',
    name: 'Saccarosio',
    color: { hex: '#B8885E', label: 'caramello' },
    structure: 'assets/molecules/sucrose.webp',
    icon: '🍬'
  },
  nacl: {
    id: 'nacl',
    formula: 'NaCl',
    name: 'Cloruro di sodio',
    color: { hex: '#A0B8C8', label: 'cristallo salino' },
    structure: 'assets/molecules/nacl.svg',
    icon: '🧂'
  },
  caffeine: {
    id: 'caffeine',
    formula: 'C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub>',
    name: 'Caffeina',
    color: { hex: '#6B4530', label: 'bruno scuro' },
    structure: 'assets/molecules/caffeine.webp',
    icon: '☕'
  },
  phosphoric_acid: {
    id: 'phosphoric_acid',
    formula: 'H<sub>3</sub>PO<sub>4</sub>',
    name: 'Acido fosforico',
    color: { hex: '#7A9BB5', label: 'grigio azzurro' },
    structure: 'assets/molecules/phosphoric-acid.webp',
    icon: '🥤'
  },
  quinine: {
    id: 'quinine',
    formula: 'C<sub>20</sub>H<sub>24</sub>N<sub>2</sub>O<sub>2</sub>',
    name: 'Chinino',
    color: { hex: '#6DBF8B', label: 'verde tonico' },
    structure: 'assets/molecules/quinine.webp',
    icon: '🍸'
  },

  xanthohumol: {
    id: 'xanthohumol',
    formula: 'C<sub>21</sub>H<sub>22</sub>O<sub>5</sub>',
    name: 'Xantumolo',
    color: { hex: '#B98A2E', label: 'ambra' },
    structure: 'assets/molecules/xanthohumol.webp',
    icon: '🍺'
  },

  maltose: {
    id: 'maltose',
    formula: 'C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>',
    name: 'Maltose',
    color: { hex: '#D8B45A', label: 'giallo malto' },
    structure: 'assets/molecules/maltose.webp',
    icon: '🌾'
  },

  lycopene: {
      id: 'lycopene',
      formula: 'C<sub>40</sub>H<sub>56</sub>',
      name: 'Licopene',
      color: { hex: '#d1352a', label: 'giallo malto' },
      structure: 'assets/molecules/lycopene.png',
      icon: '🍅'
    },

  ovalbumin: {
    id: 'ovalbumin',
    formula: 'Proteina',
    name: 'Ovalbumina',
    color: { hex: '#D4B96A', label: 'giallo uovo' },
    structure: 'assets/molecules/ovalbumin.jpg',
    icon: '🥚'
  },

  resveratrol: {
    id: 'resveratrol',
    formula: 'C<sub>14</sub>H<sub>12</sub>O<sub>3</sub>',
    name: 'Resveratrolo',
    color: { hex: '#8B2F4B', label: 'rosso vino' },
    structure: 'assets/molecules/resveratrol.webp',
    icon: '🍇'
  },

  quercetin: {
    id: 'quercetin',
    formula: 'C<sub>15</sub>H<sub>10</sub>O<sub>7</sub>',
    name: 'Quercetina',
    color: { hex: '#C9A227', label: 'giallo oro' },
    structure: 'assets/molecules/quercetin.webp',
    icon: '🍷'
  },

  tartaric_acid: {
    id: 'tartaric_acid',
    formula: 'C<sub>4</sub>H<sub>6</sub>O<sub>6</sub>',
    name: 'Acido tartarico',
    color: { hex: '#C46B8A', label: 'rosa vino' },
    structure: 'assets/molecules/tartaric_acid.webp',
    icon: '🍷'
  },

  ethyl_octanoate: {
    id: 'ethyl_octanoate',
    formula: 'C<sub>10</sub>H<sub>20</sub>O<sub>2</sub>',
    name: 'Ottanoato di etile',
    color: { hex: '#F4D35E', label: 'giallo ananas' },
    structure: 'assets/molecules/ethyl_octanoate.webp',
    icon: '🍍'
  },

  methyl_laurate: {
    id: 'methyl_laurate',
    formula: 'C<sub>13</sub>H<sub>26</sub>O<sub>2</sub>',
    name: 'Laurato di metile',
    color: { hex: '#8FBFA0', label: 'verde cocco' },
    structure: 'assets/molecules/methyl_laurate.webp',
    icon: '🥥'
  },

  linalool: {
    id: 'linalool',
    formula: 'C<sub>10</sub>H<sub>18</sub>O',
    name: 'Linalolo',
    color: { hex: '#e3a9f5', label: 'verde floreale' },
    structure: 'assets/molecules/linalool.png',
    icon: '🌸'
  },

  caryophyllene: {
    id: 'caryophyllene',
    formula: 'C<sub>15</sub>H<sub>24</sub>',
    name: 'β-Cariofillene',
    color: { hex: '#5c5852', label: 'pepper' },
    structure: 'assets/molecules/caryophyllene.webp',
    icon: '🌿'
  }

//quinine, xanthohumol, ovalbumin, resveratrol, quercetin, tartaric_acid, ethyl_octanoate, methyl_laurate, linalool, caryophyllene
  /* Aggiungi qui altre molecole seguendo lo stesso schema... */
};


/* -------------------------------------------------------------------------
   2) DRINK
   -------------------------------------------------------------------------
   Ogni drink ha:
     id            -> identificativo unico
     name          -> nome mostrato come risposta corretta
     aliases       -> nomi alternativi accettati come risposta corretta
                      (es. "gin lemon" e "vodka lemon" per lo stesso drink)
     molecules     -> array di id di MOLECULES (NON includere mai water/ethanol,
                      vengono aggiunte automaticamente e nascoste dal motore)
     moleculeNotes -> breve descrizione di ogni molecola nel contesto di
                      QUESTO drink, mostrata nel pop-up soluzione finale.
                      Chiave = id della molecola, valore = testo breve.
     quizOptions   -> le 4 opzioni mostrate con l'Aiuto 1 "Mostra 4 opzioni".
                      SCRITTE A MANO (non generate a caso): metti il nome
                      corretto del drink + 3 alternative plausibili, in
                      qualsiasi ordine (vengono mescolate a schermo).
     tip           -> frase finale mostrata nel riquadro "💡" del pop-up
                      soluzione (facoltativa)
     image         -> percorso dell'illustrazione SVG (o di una tua foto,
                      vedi README per come sostituirla)
     difficulty    -> 1-5, mostrata come stelline nel pop-up soluzione
   ------------------------------------------------------------------------- */

const DRINKS = [
  {
    id: 'vodka-lemon',
    name: 'Vodka Lemon',
    aliases: ['gin lemon', 'vodka lemon', 'gin lemon / vodka lemon'],
    molecules: ['citric_acid', 'limonene', 'co2'],
    moleculeNotes: {
      citric_acid: 'Acido citrico, caratteristico del limone.',
      limonene: 'Limonene, l\'aroma agrumato della scorza di limone.',
      co2: 'Anidride carbonica: dà l\'effervescenza al drink.'
    },
    quizOptions: ['Vodka Lemon', 'Mojito', 'Americano', 'Spritz'],
    tip: 'L\'unione di acqua, alcol e acidità crea un cocktail semplice, fresco e dissetante.',
    image: 'assets/drinks/vodka_lemon.webp',
    difficulty: 1
  },
  {
      id: 'gin-tonic',
      name: 'Gin Tonic',
      aliases: ['gin tonic', 'gintonic', 'vodka tonic', 'vodkatonic'],
      molecules: ['quinine', 'co2', 'limonene'],
      moleculeNotes: {
        quinine: 'Chinino: la molecola simbolo dell\'acqua tonica.',
        co2: 'Anidride carbonica: rende frizzante la tonica.',
        limonene: 'Limonene: aroma della scorza di limone o lime.'
      },
      quizOptions: ['Gin Tonic', 'Vodka Lemon', 'Moscow Mule', 'Negroni'],
      tip: 'Il chinino è praticamente la firma chimica del Gin Tonic.',
      image: 'assets/drinks/gin_tonic.webp',
      difficulty: 1
  },
  {
    id: 'mojito',
    name: 'Mojito',
    aliases: ['mojito'],
    molecules: ['menthol', 'citric_acid', 'sucrose'],
    moleculeNotes: {
      menthol: 'Mentolo: la nota fresca caratteristica della menta.',
      citric_acid: 'Acido citrico, l\'acidità del lime.',
      sucrose: 'Saccarosio: la dolcezza dello zucchero di canna.'
    },
    quizOptions: ['Mojito', 'Vodka Lemon', 'Caipirinha', 'Daiquiri'],
    tip: 'Menta, lime e zucchero di canna si bilanciano in un cocktail fresco e dissetante.',
    image: 'assets/drinks/mojito.webp',
    difficulty: 2
  },
  {
    id: 'tequila-sale-limone',
    name: 'Tequila sale e limone',
    aliases: ['tequila sale e limone', 'tequila'],
    molecules: ['nacl', 'citric_acid', 'limonene'],
    moleculeNotes: {
      nacl: 'Cloruro di sodio: il sale sul bordo del bicchiere.',
      citric_acid: 'Acido citrico, l\'acidità del limone.',
      limonene: 'Limonene, l\'aroma agrumato della scorza.'
    },
    quizOptions: ['Tequila sale e limone', 'Margarita', 'Paloma', 'Vodka Lemon'],
    tip: 'Sale, acido e agrumato: il rituale tequila-sale-limone in tre note.',
    image: 'assets/drinks/tequila_sale_limone.webp',
    difficulty: 1
  },
  {
    id: 'cuba-libre',
    name: 'Cuba Libre',
    aliases: ['cuba libre', 'cuba-libre'],
    molecules: ['caffeine', 'phosphoric_acid', 'co2', 'limonene'],
    moleculeNotes: {
      caffeine: 'Caffeina, presente nella cola.',
      phosphoric_acid: 'Acido fosforico: l\'acidità tipica delle bibite cola.',
      co2: 'Anidride carbonica: l\'effervescenza della cola.',
      limonene: 'Limonene, la nota agrumata della scorza di lime.'
    },
    quizOptions: ['Cuba Libre', 'Whisky Cola', 'Gin Tonic', 'Moscow Mule'],
    tip: 'Rum e cola si incontrano con un tocco agrumato: dolce, scuro, frizzante.',
    image: 'assets/drinks/cuba_libre.webp',
    difficulty: 3
  },
  {
    id: 'beer',
    name: 'Birra',
    aliases: ['birra', 'beer'],
    molecules: ['xanthohumol', 'maltose', 'co2'],
    moleculeNotes: {
      xanthohumol: 'Xantumolo: polifenolo caratteristico del luppolo.',
      maltose: 'Maltosio: zucchero ottenuto dal malto.',
      co2: 'Anidride carbonica: responsabile della naturale effervescenza.'
    },
    quizOptions: ['Birra', 'Vino', 'Whiskey Sour', 'Moscow Mule'],
    tip: 'Luppolo e malto rendono la birra facilmente riconoscibile.',
    image: 'assets/drinks/birra.webp',
    difficulty: 3
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    aliases: ['whiskey sour', 'whisky sour'],
    molecules: ['citric_acid', 'sucrose', 'ovalbumin'],
    moleculeNotes: {
      citric_acid: 'Acido citrico: la nota aspra del limone.',
      sucrose: 'Saccarosio: bilancia l\'acidità.',
      ovalbumin: 'Ovalbumina: crea la tipica schiuma del Whiskey Sour.'
    },
    quizOptions: ['Whiskey Sour', 'Moscow Mule', 'Negroni', 'Cuba Libre'],
    tip: 'La presenza dell\'albume rende questo cocktail unico.',
    image: 'assets/drinks/whiskey_sour.webp',
    difficulty: 3
  },
{
    id: 'bloody-mary',
    name: 'Bloody Mary',
    aliases: ['bloody mary'],
    molecules: ['lycopene', 'nacl', 'citric_acid'],
    moleculeNotes: {
      lycopene: 'Licopene: il pigmento rosso del pomodoro.',
      nacl: 'Cloruro di sodio: uno dei condimenti tipici.',
      citric_acid: 'Acido citrico: apportato dal succo di limone.'
    },
    quizOptions: ['Bloody Mary', 'Cuba Libre', 'Vino', 'Negroni'],
    tip: 'Il licopene rende il Bloody Mary probabilmente il cocktail più facile da riconoscere.',
    image: 'assets/drinks/bloody_mary.webp',
    difficulty: 4
  },
  {
    id: 'wine',
    name: 'Vino',
    aliases: ['vino', 'vino rosso', 'red wine'],
    molecules: ['resveratrol', 'quercetin', 'tartaric_acid'],
    moleculeNotes: {
      resveratrol: 'Resveratrolo: uno dei polifenoli più noti dell\'uva.',
      quercetin: 'Quercetina: flavonoide presente nella buccia dell\'uva.',
      tartaric_acid: 'Acido tartarico: l\'acido organico caratteristico del vino.'
    },
    quizOptions: ['Vino', 'Birra', 'Negroni', 'Bloody Mary'],
    tip: 'Il vino è caratterizzato soprattutto dai polifenoli dell\'uva.',
    image: 'assets/drinks/vino.webp',
    difficulty: 4
  },
  {
    id: 'pina-colada',
    name: 'Piña Colada',
    aliases: ['piña colada', 'pina colada'],
    molecules: ['ethyl_octanoate', 'methyl_laurate', 'sucrose'],
    moleculeNotes: {
      ethyl_octanoate: 'Ottanoato di etile: tipico aroma di ananas.',
      methyl_laurate: 'Laurato di metile: caratteristico della noce di cocco.',
      sucrose: 'Saccarosio: completa la dolcezza del cocktail.'
    },
    quizOptions: ['Piña Colada', 'Mojito', 'Whiskey Sour', 'Vodka Lemon'],
    tip: 'Le molecole di ananas e cocco rendono questo cocktail unico.',
    image: 'assets/drinks/pina_colada.webp',
    difficulty: 5
  },
    {
      id: 'negroni',
      name: 'Negroni',
      aliases: ['negroni'],
      molecules: ['limonene', 'linalool', 'caryophyllene'],
      moleculeNotes: {
        limonene: 'Limonene: aroma agrumato della scorza d\'arancia.',
        linalool: 'Linalolo: nota floreale tipica del gin e del vermouth.',
        caryophyllene: 'β-Cariofillene: composto aromatico presente in molte spezie e botaniche del bitter.'
      },
      quizOptions: ['Negroni', 'Americano', 'Gin Tonic', 'Spritz'],
      tip: 'Nessuna molecola è esclusiva del Negroni, ma l\'insieme delle botaniche lo rende riconoscibile.',
      image: 'assets/drinks/negroni.webp',
      difficulty: 5
    }
  /* Aggiungi qui altri drink seguendo lo stesso schema... */
];


/* -------------------------------------------------------------------------
   3) BANCA DOMANDE A RISPOSTA MULTIPLA (per temi)
   -------------------------------------------------------------------------
   Costanti pure: qui dentro metti solo le domande, divise per TEMA. Poi,
   nella sezione ROUNDS qui sotto, decidi quali usare — a mano (una precisa)
   o a caso (con pickRandomQuestions / pickRandomQuestionsFromThemes,
   definite in js/engine.js). In futuro l'utente potrà scegliere il tema
   del quiz da qui: aggiungere un nuovo tema è semplice, vedi sotto.

   Ogni tema ha:
     label      -> nome mostrato (es. come titolo delle sue manche)
     questions  -> array di { question, options, correctIndex }
                   correctIndex è l'indice (da 0) della risposta giusta
                   dentro "options" — NON serve scrivere "A. / B. / ecc",
                   solo il testo della risposta.

   Per aggiungere un nuovo tema: copia un blocco, cambia la chiave
   (es. "storia_dell_arte") e riempilo con le tue domande.
   ------------------------------------------------------------------------- */

const QUESTION_THEMES = {

  chimica_laboratorio: {
    label: 'Chimica di laboratorio',
    questions: [
      {
        question: 'Come si diluisce correttamente un acido concentrato?',
        options: [
          "Versando l'acqua nell'acido sotto cappa aspirante",
          "Aggiungendo lentamente l'acido all'acqua",
          'Mescolando entrambi contemporaneamente e lasciando decidere alla termodinamica chi torna a casa',
          'Delegando al tirocinante: la selezione naturale ha bisogno di dati'
        ],
        correctIndex: 1
      },
      {
        question: 'Che cosa contiene una scheda di sicurezza SDS?',
        options: [
          'Le procedure di smaltimento e i limiti di esposizione giornaliera',
          'Le scuse ufficiali del produttore',
          'Una stima di quanti colleghi fingeranno di averla letta',
          'Informazioni su pericoli, manipolazione, conservazione e primo soccorso'
        ],
        correctIndex: 3
      },
      {
        question: 'Se il controllo positivo non produce alcun segnale, significa che:',
        options: [
          'Il campione analizzato non contiene la sostanza cercata',
          "L'ipotesi è talmente innovativa da non esistere",
          'Il metodo, i reagenti o la procedura potrebbero non aver funzionato',
          'La scienza ti ha ufficialmente diseredato e il laboratorio sta già svuotando il tuo armadietto'
        ],
        correctIndex: 2
      },
      {
        question: 'Se il pH passa da 6 a 3, la concentrazione degli ioni H⁺:',
        options: [
          'Aumenta di mille volte',
          'Triplica',
          'Dimezza',
          'Aumenta quanto il desiderio di morte quando il relatore scrive: «Ci sono solo alcune piccole correzioni»'
        ],
        correctIndex: 0
      },
      {
        question: "L'autoclave sterilizza principalmente attraverso:",
        options: [
          'Radiazioni ultraviolette ad alta intensità',
          'Un colloquio motivazionale ad alta temperatura',
          'La speranza che i batteri si dimettano spontaneamente',
          'Vapore saturo ad alta temperatura e pressione'
        ],
        correctIndex: 3
      },
      {
        question: "Che cos'è un precipitato?",
        options: [
          'Il dottorando che corre fuori dal laboratorio dopo aver sentito «strano, prima non lo faceva»',
          "Un solido che si forma all'interno di una soluzione",
          "Un gas che si libera durante una reazione esotermica",
          'Un composto che ha deciso di abbandonare la fase liquida prima che lo facessi tu con la carriera accademica'
        ],
        correctIndex: 1
      },
      {
        question: 'Una soluzione tampone serve a:',
        options: [
          "Neutralizzare completamente gli acidi e le basi aggiunti",
          'Impedire al tecnico di laboratorio di perdere definitivamente la calma',
          'Limitare le variazioni di pH quando vengono aggiunte piccole quantità di acido o base',
          'Mantenere stabile qualcosa, visto che il ricercatore ormai non lo è più'
        ],
        correctIndex: 2
      },
      {
        question: 'La centrifuga viene utilizzata per:',
        options: [
          'Separare componenti in base alle loro proprietà, spesso densità e dimensioni',
          'Omogeneizzare campioni liquidi mediante agitazione rotazionale',
          'Far girare i campioni come il ricercatore gira intorno alla verità nei risultati',
          'Simulare una carriera scientifica: movimento frenetico, rumore assordante e nessun reale avanzamento'
        ],
        correctIndex: 0
      },
      {
        question: 'Qual è la funzione principale della cappa chimica?',
        options: [
          'Mantenere una temperatura costante durante le reazioni esotermiche',
          "Ridurre l'esposizione dell'operatore a vapori, gas e aerosol pericolosi",
          'Offrire un luogo ventilato in cui piangere senza appannare gli occhiali',
          'Aspirare lentamente reagenti, speranze e giovani promesse della ricerca'
        ],
        correctIndex: 1
      },
      {
        question: 'Una soluzione 1 molare contiene:',
        options: [
          'Un grammo di soluto in un litro di solvente',
          'Una mole di soluto per chilogrammo di solvente',
          'Una quantità scelta a caso ma scritta con molte cifre decimali',
          'Una mole di soluto per litro di soluzione'
        ],
        correctIndex: 3
      }
    ]
  },

  biologia_marina: {
    label: 'Biologia marina',
    questions: [
      {
        question: 'Lo sbiancamento dei coralli è spesso dovuto a:',
        options: [
          "Eccesso di radiazione ultravioletta che degrada i pigmenti del corallo",
          "Un tentativo disperato di non essere riconosciuti dall'umanità",
          'Perdita delle alghe simbionti in seguito a stress, soprattutto termico',
          "Il corallo che vede la temperatura dell'oceano e decide di presentarsi già vestito per il proprio funerale"
        ],
        correctIndex: 2
      },
      {
        question: 'Quanti cuori possiede un polpo?',
        options: [
          'Tre',
          'Due, uno per il sangue arterioso e uno per il venoso',
          'Uno, già più del revisore numero 2',
          "Nessuno: dopo aver osservato l'ecosistema universitario ha preferito non svilupparlo"
        ],
        correctIndex: 0
      },
      {
        question: 'Le ampolle di Lorenzini degli squali permettono di rilevare:',
        options: [
          'Variazioni di pressione idrostatica a grandi profondità',
          'Le bugie di chi dice «gli squali non attaccano mai» mentre nuota sanguinando',
          'La quantità di dignità rimasta alla preda',
          'Deboli campi elettrici prodotti dagli organismi viventi'
        ],
        correctIndex: 3
      },
      {
        question: 'Molti ecosistemi delle sorgenti idrotermali profonde si basano sulla:',
        options: [
          'Fotosintesi operata da alghe adattate alle alte temperature',
          'Chemiosintesi',
          'Fermentazione anaerobica di materia organica in sedimentazione',
          'Attività di batteri che lavorano al buio, sotto pressione e senza riconoscimento: praticamente assegnisti di ricerca'
        ],
        correctIndex: 1
      },
      {
        question: 'Un organismo sessile è un organismo che:',
        options: [
          'Si riproduce esclusivamente per via asessuata',
          "Ha smesso di migrare dopo aver visto il prezzo degli affitti",
          'Vive stabilmente fissato a un substrato',
          'Ha scelto una roccia, vi si è incollato e attende la fine con più serenità di un laureando'
        ],
        correctIndex: 2
      },
      {
        question: 'Perché le balene devono tornare periodicamente in superficie?',
        options: [
          'Sono mammiferi e respirano aria attraverso i polmoni',
          "Devono controllare se l'umanità ha finalmente smesso di gettare plastica",
          'Necessitano di luce solare per sintetizzare la vitamina D attraverso la pelle',
          "Persino loro, dopo un certo tempo sott'acqua, preferiscono affrontare l'atmosfera piuttosto che restare nell'ambiente di lavoro"
        ],
        correctIndex: 0
      },
      {
        question: 'Le seppie modificano rapidamente il proprio colore grazie soprattutto a:',
        options: [
          'Pigmenti fluorescenti attivati dalla luce ambientale',
          "Cambiamenti d'umore scientificamente misurabili",
          'Un meccanismo di difesa che consente loro di sparire quando arriva il supervisore',
          'Cromatofori e altre strutture specializzate della pelle'
        ],
        correctIndex: 3
      },
      {
        question: 'Alcuni cetrioli di mare possono difendersi:',
        options: [
          'Rilasciando una nube di inchiostro tossico come i cefalopodi',
          'Espellendo strutture interne o sostanze appiccicose',
          'Fingendosi morti, strategia già ampiamente adottata durante le riunioni di dipartimento',
          'Liberandosi dei propri organi interni, gesto comunque meno estremo che rispondere alla domanda: «Quando consegni la tesi?»'
        ],
        correctIndex: 1
      },
      {
        question: 'I cirripedi, come i denti di cane marini, sono:',
        options: [
          'Molluschi bivalvi coloniali',
          "Coralli con una crisi d'identità",
          'Crostacei',
          "Animali che trascorrono l'età adulta cementati a una superficie, immobili e filtrando ciò che passa: il destino finale di molti professori ordinari"
        ],
        correctIndex: 2
      },
      {
        question: "La zona afotica dell'oceano è:",
        options: [
          'La regione in cui la luce solare è assente o insufficiente per la fotosintesi',
          'La fascia costiera compresa tra alta e bassa marea',
          'La sala riunioni quando il responsabile proietta sessanta diapositive nere con testo grigio',
          'Un luogo oscuro, freddo e sottoposto a pressioni enormi, ma comunque più ospitale del laboratorio il venerdì sera'
        ],
        correctIndex: 0
      }
    ]
  }

  /* Aggiungi qui altri temi seguendo lo stesso schema... */
};


/* -------------------------------------------------------------------------
   4) GIOCHI (GAMES)
   -------------------------------------------------------------------------
   Il sito è diviso in GIOCHI: l'utente li sceglie nell'ordine che vuole
   dalla schermata principale. Ogni gioco ha le sue manche (esattamente
   come prima, stessi 4 tipi: molecule-guess / multiple-choice / matching /
   image-zoom — vedi schema sotto) e un "peso" percentuale che determina
   quanto conta sul VOTO FINALE (il "VERDETTO", da 0 a 110, promozione a 66).
   I pesi di tutti i giochi devono sommare a 100.

   Ogni gioco ha:
     id      -> identificativo unico
     label   -> testo del bottone nella schermata di selezione
     icon    -> emoji mostrata accanto al bottone
     weight  -> quanto pesa in percentuale sul voto finale (somma = 100)
     intro   -> { title, text } mostrati in una schermata prima di iniziare
                (spiegazione/regole del gioco, con bottone "Inizia la prova")
     rounds  -> array di manche, stesso identico formato di prima:

     a) "molecule-guess"  -> { type: 'molecule-guess', title: '...', drinkId: 'id-del-drink' }
     b) "multiple-choice" -> { type:'multiple-choice', title, question, options, correctIndex }
                              (scritta a mano oppure pescata da QUESTION_THEMES,
                              vedi makeMultipleChoiceRound/pickRandomQuestions
                              in js/engine.js)
     c) "matching"        -> { type:'matching', title, instructions, pairs:[{name,image}] }
     d) "image-zoom"      -> { type:'image-zoom', title, image, answer, aliases,
                              zoomFocus:{x,y}, startZoom, zoomStep, minZoom }

   Per aggiungere un NUOVO gioco: copia un blocco qui sotto, dagli un id
   univoco, scrivi le sue manche e ricorda di far tornare la somma dei
   "weight" a 100 (altrimenti il voto finale sarà semplicemente scalato
   in automatico, ma è più pulito tenerli allineati a 100).
   ------------------------------------------------------------------------- */

const GAMES = [

  {
    id: 'drink-guess',
    label: 'Che drink è?',
    icon: '🍹',
    weight: 30,
    intro: {
      title: 'Che drink è?',
      text: 'A cosa serve studiare per anni chimica se poi non sai nemmeno riconoscere un drink? Metti caso che poi ti regalo della droga mettendoci dentro qualche pastiglietta, sarebbe scortese non capire di che stupefacente si tratta, o no? Per ora lasciamo da parte le nostre sostanze psicoattive preferite e dedichiamoci all\'alcol in tutte le sue forme e colori.<br><br>In ogni manche ti saranno mostrate delle molecole caratteristiche di un cocktail: formula chimica e struttura scheletrica. Indovina di che bevanda si tratta!<br><br>Ps. Acqua ed etanolo non contano: sono in ogni drink alcolico. <br>Bloccato? Hai 2 aiuti a manche... ma per riceverli devi bere! 🍹'
    },
    rounds: pickRandomDrinkRounds(5, 'Campioni')
    /*rounds: [
      { type: 'molecule-guess', title: 'Manche 1 — Campioni', drinkId: 'vodka-lemon' },
      { type: 'molecule-guess', title: 'Manche 2 — Campioni', drinkId: 'mojito' },
      { type: 'molecule-guess', title: 'Manche 3 — Campioni', drinkId: 'tequila-sale-limone' },
      { type: 'molecule-guess', title: 'Manche 4 — Campioni', drinkId: 'cuba-libre' },
      { type: 'molecule-guess', title: 'Manche 5 — Campioni', drinkId: 'beer' },
      { type: 'molecule-guess', title: 'Manche 6 — Campioni', drinkId: 'bloody-mary' },
      { type: 'molecule-guess', title: 'Manche 7 — Campioni', drinkId: 'negroni' }
    ]*/
  },

  {
    id: 'quiz-chimica',
    label: 'Quante ne sai — Chimica Edition',
    icon: '🧪',
    weight: 20,
    intro: {
      title: 'Quante ne sai — Chimica Edition',
      text: 'Passiamo a qualche domanda più specifica, sono certo che per te sarà una passeggiata.<br><br>Troverai una serie di domande, tra le molteplici risposte solo una è esatta. <br>Ma hai un solo tentativo per azzeccare quale.'
    },
    rounds: pickRandomQuestions('chimica_laboratorio', 5, 'Chimica')
  },

  {
    id: 'quiz-biologia',
    label: 'Quante ne sai — Biologia Edition',
    icon: '🐙',
    weight: 20,
    intro: {
      title: 'Quante ne sai — Biologia Edition',
      text: 'Ecco una serie di domande di biologia marina, pescate a caso dal nostro banco. <br>Per ogni domanda hai un solo tentativo.'
    },
    rounds: pickRandomQuestions('biologia_marina', 5, 'Biologia marina')
  },

  {
    id: 'matching',
    label: "Trova l'associazione",
    icon: '🧩',
    weight: 15,
    intro: {
      title: "Trova l'associazione",
      text: 'Il cervello umano si è evoluto per milioni di anni in modo da trovare con semplicità associazioni tra concetti basilari. <br>Come "Fuoco" → "Calore", "Gattini" → "Video buffi su internet", "Donna" → "Cucina".<br><br>Ma ora è giusto il momento di dimostrare quanto l\'evoluzione non possa nulla contro la tua ignoranza. O forse ci sorprenderai?<br><br>Associa ogni testo alla corrispettiva immagine, puoi sbagliare quante volte vuoi: <b>l\'importante è bere quando lo fai</b>. <br>Ma occhio, gli errori influiranno il voto finale.'
    },
    rounds: [
    {
            type: 'matching',
            title: 'Prova di associazione',
            instructions: 'Associa ogni scritta alla relativa immagine.',
            pairs: [
                { name: '12', image: 'assets/matching-demo/12.webp' },
                { name: '6', image: 'assets/matching-demo/6.png' },
                { name: '42', image: 'assets/matching-demo/42.png' },
                { name: '74', image: 'assets/matching-demo/74.webp' },
                { name: 'Dottore', image: 'assets/matching-demo/dottore.png' },
                { name: 'Paghi 1?', image: 'assets/matching-demo/paghi.png' },
                { name: 'Zago', image: 'assets/matching-demo/troll.png' }
            ]
          },
      {
        type: 'matching',
        title: 'Prova di associazione',
        instructions: 'Associa ogni nome scientifico alla sua immagine.',
        pairs: [
          { name: 'Odontodactylus scyllarus', image: 'assets/matching-demo/Mantis_Shrimp.webp' },
          { name: 'Carcharodon carcharias', image: 'assets/matching-demo/Grande_squalo_bianco.webp' },
          { name: 'Paracanthurus hepatus', image: 'assets/matching-demo/Pesce_chirurgo.webp' },
          { name: 'Melanocetus johnsonii', image: 'assets/matching-demo/melanoceto.webp' },
          { name: 'Pterois volitans', image: 'assets/matching-demo/red_lione_fish.webp' },
          { name: 'Macrocheira kaempferi', image: 'assets/matching-demo/Spider_crab.webp' },
          { name: 'Thunnus albacares', image: 'assets/matching-demo/Tonno_Pinnagialla.webp' }
        ]
      },
      /* Aggiungi qui altri oggetti { type:'matching', ... } per avere più
         di una prova di associazione in questo stesso gioco. */
    ]
  },

  {
    id: 'splash',
    label: 'Splash',
    icon: '🔍',
    weight: 15,
    intro: {
      title: 'Splash',
      text: 'Hai presente LoLdle? Ecco, quello! <br><br>Per chi non fosse un nerd schifoso come il sottoscritto, il giochino consiste nell\'indovinare il soggetto presente in un\'immagine partendo da un piccolo dettaglio.<br><br>Ogni risposta sbagliata allarga un po\' la visuale, finché non sarà visibile per intero. <br>Se sbagli con l\'immagine per intero sei proprio stupido!'
    },
    rounds: [
      {
        type: 'image-zoom',
        title: 'Prova splash',
        image: 'assets/zoom/tuna.jpeg',
        answer: 'Tonno',
        aliases: ['tonno', 'zago'],
        zoomFocus: { x: 100, y: 50 },
        startZoom: 5,
        zoomStep: 1,
        minZoom: 1
      },
      {
        type: 'image-zoom',
        title: 'Prova splash',
        image: 'assets/zoom/ciccio.jpeg',
        answer: 'CiccioGamer89',
        aliases: ['cicciogamer89', 'ciccio', 'cicciogamer', 'zago' ],
        zoomFocus: { x: 100, y: 50 },
        startZoom: 5,
        zoomStep: 1.2,
        minZoom: 1
      },
//      {
//        type: 'image-zoom',
//        title: 'Prova splash',
//        image: 'assets/zoom/duce.jpeg',
//        answer: 'Benito Mussolini',
//        aliases: ['duce', 'dux', 'maiale', 'mussolini', 'benito', 'zago'],
//        zoomFocus: { x: 40, y: 0 },
//        startZoom: 4,
//        zoomStep: 1,
//        minZoom: 1
//      },
      {
        type: 'image-zoom',
        title: 'Prova splash',
        image: 'assets/zoom/fizz.jpeg',
        answer: 'Fizz',
        aliases: ['fizz', 'zago', 'il socio'],
        zoomFocus: { x: 40, y: 60 },
        startZoom: 5,
        zoomStep: 1,
        minZoom: 1
      },
      {
        type: 'image-zoom',
        title: 'Prova splash',
        image: 'assets/zoom/the_rock.jpeg',
        answer: 'Dwayne Johnson',
        aliases: ['Dwayne Johnson', 'the rock', 'Dwayne Douglas Johnson', 'zago'],
        zoomFocus: { x: 52, y: 10 },
        startZoom: 5,
        zoomStep: 1,
        minZoom: 1
      },
      {
        type: 'image-zoom',
        title: 'Prova splash',
        image: 'assets/zoom/pelato.jpeg',
        answer: 'Johnny Sins',
        aliases: ['Sins', 'pelato', 'il pelato', 'il pelato di brazzers','zago'],
        zoomFocus: { x: 50, y: 80 },
        startZoom: 4,
        zoomStep: 1,
        minZoom: 1
      }
//      ,
//      {
//        type: 'image-zoom',
//        title: 'Prova splash',
//        image: 'assets/zoom/aang.jpeg',
//        answer: 'Aang',
//        aliases: ['avatar','zago'],
//        zoomFocus: { x: 90, y: 78 },
//        startZoom: 5,
//        zoomStep: 1,
//        minZoom: 1
//      }

      /* Aggiungi qui altri oggetti { type:'image-zoom', ... } per avere più
         di una prova "splash" in questo stesso gioco. */
    ]
  }
];
