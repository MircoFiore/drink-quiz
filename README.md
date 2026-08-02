# Test di Laurea — il quiz

Un piccolo sito statico (nessun server necessario) organizzato in **5 giochi**
scelti dall'utente in qualsiasi ordine (Che drink è?, Quante ne sai —
Chimica/Biologia, Trova l'associazione, Splash). Al termine di ognuno c'è
un riepilogo, e quando tutti sono stati giocati compare il bottone
**VERDETTO**: un voto finale da 0 a 110 (promozione a 66), calcolato come
media pesata dei risultati di ogni gioco. Pensato per essere facilmente
modificabile: **il 90% delle modifiche si fa in un solo file**, `js/data.js`.

## Come funziona il flusso di gioco

```
Hub (schermata iniziale / "scegli la prossima sfida")
  └─ scegli un gioco → schermata Intro (regole) → "Inizia la prova"
       └─ manche del gioco (uguali a prima: molecule-guess, multiple-choice,
          matching, image-zoom) → "Continua" dopo l'ultima
            └─ Recap (punteggio di quel gioco) → "Continua" → torna all'Hub
                 └─ quando TUTTI i giochi sono fatti: bottone "🎓 VERDETTO"
                      └─ voto finale 0-110 + "Ricomincia da capo"
```

Ogni gioco è indipendente: ha le sue manche, il suo punteggio, e un "peso"
percentuale che determina quanto conta sul voto finale (vedi sotto).

## Come aprirlo

Basta aprire `index.html` in un browser. Se preferisci vederlo "come un
vero sito" (consigliato, alcuni browser sono restrittivi con i file aperti
da disco), lancia un server locale nella cartella del progetto, ad esempio:

```
python3 -m http.server 8000
```

e poi vai su `http://localhost:8000`.

## Struttura del progetto

```
index.html               punto di ingresso, non serve quasi mai toccarlo
css/style.css             stile grafico (colori, font, layout)
js/data.js                ⭐ MOLECOLE, DRINK, DOMANDE e GIOCHI — modifica qui
js/molecule-art.js         disegna la "boccetta" colorata per ogni molecola
js/engine.js               punteggio, stato di gioco/sessione, voto finale
js/renderers.js            disegna le 4 tipologie di manche a schermo
js/main.js                 schermate: hub, intro, recap, verdetto
assets/drinks/             illustrazioni SVG dei drink
assets/molecules/          strutture chimiche scheletriche (SVG)
assets/matching-demo/       immagini di esempio per la manche "associazione"
```

## 1. Aggiungere o modificare un DRINK

Apri `js/data.js`, cerca l'array `DRINKS` e aggiungi un blocco così:

```js
{
  id: 'negroni',                          // identificativo univoco, minuscolo
  name: 'Negroni',                        // nome mostrato come risposta
  aliases: ['negroni'],                   // altri modi accettati di scriverlo
  molecules: ['limonene', 'quinina'],     // vedi punto 2 per gli id molecola
  moleculeNotes: {                        // descrizione breve per il pop-up
    limonene: 'Note agrumate del twist d\'arancia.',
    quinina: 'Amaro caratteristico del Campari/vermouth.'
  },
  quizOptions: ['Negroni', 'Americano', 'Boulevardier', 'Old Fashioned'], // Aiuto 1
  tip: 'Amaro, dolce e aromatico: il classico equilibrio del Negroni.',   // pop-up
  image: 'assets/drinks/negroni.svg',     // vedi punto 3 per l'immagine
  difficulty: 3                           // 1-5, stelline nel pop-up soluzione
}
```

`quizOptions` sono le 4 risposte mostrate quando il giocatore usa l'**Aiuto 1
— Mostra 4 opzioni**: scrivile tu a mano (il nome corretto + 3 alternative
plausibili), non vengono generate automaticamente. Vengono solo mescolate
nell'ordine con cui appaiono a schermo.

**Non includere mai acqua o etanolo**: il gioco li considera sempre
presenti e li nasconde con un tooltip esplicativo ("ogni drink alcolico
contiene acqua ed etanolo").

Poi aggiungi la manche corrispondente nell'array `rounds` del gioco che preferisci, dentro `GAMES` (vedi punto 4).

## 1bis. Banco di domande a risposta multipla, divise per tema

In `js/data.js`, dentro `QUESTION_THEMES`, trovi le domande a risposta
multipla organizzate per **tema** (per ora: `chimica_laboratorio` e
`biologia_marina`). Ogni domanda è:

```js
{
  question: 'Testo della domanda?',
  options: ['Risposta A', 'Risposta B', 'Risposta C', 'Risposta D'],
  correctIndex: 1   // indice (da 0) della risposta giusta in "options"
}
```

Per aggiungere un nuovo tema, copia un blocco tipo:

```js
storia_del_cocktail: {
  label: 'Storia del cocktail',
  questions: [
    { question: '...', options: ['...','...','...','...'], correctIndex: 0 },
    // altre domande...
  ]
}
```

Poi, dentro l'array `rounds` di un gioco (in `GAMES`), hai 3 modi per usarle:

```js
// a) una domanda PRECISA, scelta a mano (indice 0 = la prima del tema)
makeMultipleChoiceRound('Titolo manche', QUESTION_THEMES.chimica_laboratorio.questions[0]),

// b) N domande A CASO da un SOLO tema
...pickRandomQuestions('biologia_marina', 3, 'Manche — Biologia marina'),

// c) N domande A CASO mescolando PIÙ temi (o [] per pescare da tutti)
...pickRandomQuestionsFromThemes(['chimica_laboratorio', 'biologia_marina'], 3, 'Manche — Curiosità'),
```

Nota il `...` davanti a `pickRandomQuestions`/`pickRandomQuestionsFromThemes`:
restituiscono un array di manche, e lo `spread` le "srotola" dentro `rounds`
(che è a sua volta un array). `makeMultipleChoiceRound(...)`, invece,
restituisce una singola manche, quindi va scritta senza `...`.

Le funzioni `makeMultipleChoiceRound`, `pickRandomQuestions` e
`pickRandomQuestionsFromThemes` sono definite in `js/engine.js`, in fondo
al file, se vuoi vedere come funzionano o modificarle (es. cambiare come
vengono generati i titoli automatici).

## 2. Aggiungere o modificare una MOLECOLA

Sempre in `js/data.js`, nell'oggetto `MOLECULES`:

```js
quinina: {
  id: 'quinina',
  formula: 'C<sub>20</sub>H<sub>24</sub>N<sub>2</sub>O<sub>2</sub>',
  name: 'Chinina',
  color: { hex: '#D8C24A', label: 'giallo torbido' },
  structure: 'assets/molecules/quinina.svg'
}
```

- `formula`: usa `<sub>numero</sub>` per i pedici.
- `color.hex`: colorerà automaticamente il liquido nella boccetta disegnata
  a schermo (non serve creare un'icona diversa per ogni molecola).
- `structure`: percorso a un file SVG con la struttura scheletrica.

### Come creare il file SVG della struttura chimica

Le opzioni più semplici, in ordine di comodo:

1. **Chiedi a me** (a Claude): incolla la formula o il nome della molecola
   in una nuova richiesta e ti disegno il file SVG nello stesso stile
   degli altri (basta chiedere "creami la struttura scheletrica di X
   nello stile di questo progetto").
2. **PubChem**: cerca la molecola su [pubchem.ncbi.nlm.nih.gov](https://pubchem.ncbi.nlm.nih.gov),
   scarica l'immagine 2D (in genere PNG) e usala al posto dell'SVG,
   cambiando semplicemente l'estensione nel percorso `structure` (funziona
   anche con PNG/JPG, non deve per forza essere SVG).
3. **ChemDraw / MolView / Ketcher** (gratuiti online): disegni la molecola
   ed esporti come SVG o PNG.

Tutti i file SVG attuali seguono lo stesso stile (linee blu notte, sfondo
trasparente): se generi le tue con uno strumento esterno andranno comunque
bene, anche se il tratto sarà leggermente diverso.

## 3. Aggiungere o sostituire l'immagine di un drink

Il campo `image` di ogni drink può puntare a **qualsiasi immagine**: SVG,
PNG o JPG. Per usare una tua foto:

1. Metti il file (es. `negroni.jpg`) dentro `assets/drinks/`.
2. Scrivi il percorso in `image: 'assets/drinks/negroni.jpg'`.

Non serve altro: l'immagine verrà mostrata nella stessa dimensione delle
altre. Se vuoi che generi io una nuova illustrazione in stile "carta"
come quelle già presenti, chiedimelo pure indicando il nome del drink.

## 4. Aggiungere, riordinare o rimuovere GIOCHI e MANCHE

L'array `GAMES` in `js/data.js` contiene i "bottoni" della schermata
iniziale: ognuno è un gioco indipendente con le sue manche. Ogni gioco ha:

```js
{
  id: 'nuovo-gioco',                 // identificativo univoco
  label: 'Nome sul bottone',
  icon: '🎲',
  weight: 10,                        // peso % sul voto finale (vedi sotto)
  intro: { title: '...', text: '...' },  // schermata regole prima di iniziare
  rounds: [ /* manche, stesso formato di sempre */ ]
}
```

Per aggiungere un gioco: copia un blocco in `GAMES`, dagli un `id` univoco,
scrivi le sue `rounds` (vedi i 4 tipi sotto) e assicurati che tutti i
`weight` sommino a 100. Per riordinare i bottoni nella hub, riordina
`GAMES`. Per aggiungere/togliere manche a un gioco già esistente, modifica
il suo array `rounds` — è identico a come funzionava prima.

I 4 tipi di manche supportati dentro `rounds`:

### a) Manche classica "indovina il drink"
```js
{ type: 'molecule-guess', title: 'Manche 7 — Campioni', drinkId: 'negroni' }
```

### b) Domanda a risposta multipla (qualsiasi argomento, non solo chimica)
```js
{
  type: 'multiple-choice',
  title: 'Manche 8 — Curiosità',
  question: 'In quale città è nato il cocktail Negroni?',
  options: ['Roma', 'Firenze', 'Milano', 'Torino'],
  correctIndex: 1
}
```
(oppure pescala dal banco `QUESTION_THEMES`, vedi sezione 1bis qui sopra)

### c) Associazione nome ↔ immagine
```js
{
  type: 'matching',
  title: 'Manche 9 — Associazione',
  instructions: 'Associa ogni pesce al suo nome scientifico.',
  pairs: [
    { name: 'Nome 1', image: 'assets/matching-demo/immagine1.svg' },
    { name: 'Nome 2', image: 'assets/matching-demo/immagine2.svg' },
    { name: 'Nome 3', image: 'assets/matching-demo/immagine3.svg' }
  ]
}
```
Metti le immagini dentro una cartella a tua scelta in `assets/` (puoi
crearne una nuova per ogni tema, es. `assets/pesci/`).

### d) Indovina dall'immagine zoomata (stile "splash")
```js
{
  type: 'image-zoom',
  title: 'Manche 10 — Zoom',
  image: 'assets/drinks/negroni.svg',   // qualsiasi immagine (SVG/PNG/JPG)
  answer: 'Negroni',
  aliases: ['negroni'],
  zoomFocus: { x: 60, y: 25 },  // punto di partenza dello zoom, in % (0-100)
  startZoom: 5,                 // quanto è ingrandita all'inizio (5 = 5x)
  zoomStep: 1,                  // di quanto si riduce lo zoom a ogni errore
  minZoom: 1                    // 1 = immagine mostrata per intero
}
```
Ogni risposta sbagliata allontana un po' lo zoom; con la risposta esatta (o
quando lo zoom minimo viene raggiunto) si vede l'immagine per intero.
`zoomFocus` è il punto (in percentuale, non pixel) su cui è centrato lo
zoom iniziale: prova qualche valore per trovare il dettaglio più
riconoscibile/interessante da mostrare per primo.

## 5. Creare un tipo di manche completamente nuovo

Se un giorno ti serve un formato diverso (es. Vero/Falso, riordina le
parole...):

1. In `js/renderers.js`, scrivi una nuova funzione `renderVeroFalso(round, stage)`
   prendendo come esempio `renderMultipleChoice`.
2. Aggiungila allo `switch` dentro `renderRound()` in cima al file.
3. Usa `completeRound()` e `registerWrongAttempt()` (da `engine.js`) per
   restare compatibile con punteggio e voto finale; chiama
   `goToNextRoundOrFinishGame()` quando la manche è risolta (di solito
   tramite il bottone generato da `nextButtonHTML()`/`wireNextButton()`).

## Il VERDETTO finale (voto 0-110)

Quando tutti i giochi in `GAMES` sono stati completati, nella hub compare
il bottone **"🎓 VERDETTO"**. Il calcolo (in `js/engine.js`, funzione
`computeVerdict`):

1. Per ogni gioco si calcola la **percentuale** ottenuta: punti totali
   fatti diviso punti massimi possibili (100 per ogni manche del gioco).
2. Le percentuali di tutti i giochi vengono mediate **pesandole** secondo
   il campo `weight` di ciascun gioco in `GAMES` (i pesi dovrebbero
   sommare a 100, ma se non lo fanno vengono comunque normalizzati).
3. La percentuale media viene scalata su un voto da **0 a 110**
   (100% = 110/110). Si è "promossi" da **66/110** in su; a 110 esatto
   compare anche la lode.

Per cambiare la soglia di promozione o la scala, modifica `computeVerdict()`
in `js/engine.js`. Per cambiare quanto conta ogni gioco, modifica il suo
`weight` in `GAMES` (in `js/data.js`).

## Come funzionano gli aiuti (manche "Che drink è?")

- **Aiuto 1 — Mostra 4 opzioni**: rivela le 4 `quizOptions` definite a mano
  per quel drink (vedi punto 1). Sempre disponibile.
- **Aiuto 2 — Rivela i nomi**: mostra il nome scientifico di ogni molecola
  indizio. È **bloccato finché non usi prima l'Aiuto 1** (appare con un 🔒
  e non è cliccabile).
- Entrambi sono puramente scenici ("si beve!"): non tolgono punti.

## Pop-up soluzione

Quando il giocatore indovina il drink (scrivendolo o cliccando l'opzione
giusta tra quelle dell'Aiuto 1), si apre un pop-up in stile "carta
soluzione" con: nome del drink, immagine (da `drink.image`), elenco delle
molecole con formula/nome/descrizione (da `drink.moleculeNotes`), un
riquadro "💡" con `drink.tip` e le stelline di difficoltà. Si chiude
**solo** cliccando il suo bottone "Prossima manche" (non c'è una X né si
chiude cliccando fuori): è quel bottone a far avanzare la partita.

## Regole di punteggio (modificabili in `js/engine.js`, funzione `scoreForRound`)

- Ogni manche vale **100 punti** base.
- Ogni **tentativo sbagliato** toglie 15 punti (minimo 40 punti a manche).
- Gli **aiuti non tolgono punti**: sono solo la scusa per bere 🍹. Vengono
  comunque contati e mostrati nel riepilogo finale, per pura curiosità.
- A fine partita vedi: punteggio totale, tempo totale, e per ogni manche
  punti/tempo/aiuti usati.

## Personalizzare lo stile grafico

Tutti i colori sono variabili CSS in cima a `css/style.css`:

```css
--navy: #1B2A4A;   /* blu notte, testo e bordi */
--green: #1F4D3D;  /* verde, risposte corrette */
--cream: #F3ECDD;  /* sfondo delle card */
--gold: #C9A227;   /* accenti, bottoni aiuto */
--red: #B4453A;    /* risposte sbagliate */
```

Cambiare questi valori aggiorna automaticamente tutta la grafica.
