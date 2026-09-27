export const MANUAL_BOOKS = [
  {
    title: 'Manuale base',
    note: 'SRD 5.1 · CC BY 4.0',
    sections: [],
  },
  {
    title: 'Nymphology · Magia blu',
    note: 'Encyclopaedia Arcane, Mongoose. È un supplemento d20 della 3ª edizione, non entra nella creazione 5e.',
    sections: [
      {
        title: 'Cos’è',
        body: `È un manuale umoristico sulla «magia blu»: l’uso erotico della magia arcana. Non fa parte dell’SRD e non cambia le classi della scheda. Si consulta a parte, se il tavolo vuole usarlo.`,
      },
      {
        title: 'Classi di prestigio',
        body: `Mago dell’agonia — influenza sociale e consiglio sulla vita intima altrui.
Ruffiano mistico — procura, con l’evocazione, il compagno che un cliente chiede.
Seduttore — fascino e magia per conquistare chi è in grado di rispondere.
Scrutatore — divinazione per osservare a distanza persone adulte.

Sono percorsi da personaggi già incantatori, non classi di 1° livello della 5ª edizione.`,
      },
      {
        title: 'Magie che aggiunge',
        body: `Aggiunge incantesimi nuovi e riletture di incantesimi comuni, tutti sul tema della magia blu: protezioni, ammaliamenti, divinazioni e evocazioni di compagni. I testi restano nel volume dell’editore: qui non sono copiati, e non entrano nella lista incantesimi della scheda.`,
      },
    ],
  },
  {
    title: 'Guida del giocatore di Xanathar',
    note: 'Riassunto originale. I testi del libro restano della Wizards of the Coast.',
    sections: [
      {
        title: 'Regole opzionali',
        body: `Strumenti: se sei competente e lo strumento c’entra con la prova, il master può darti vantaggio.
Tempo libero, tra un’avventura e l’altra: lavorare, fare ricerche, creare un oggetto, recuperare, o condurre un’attività losca. Ogni attività chiede giorni e, spesso, oro.
Trappole: il master descrive gli indizi; trovare e disinnescare sono prove, non un’unica abilità che vede tutto.`,
      },
      {
        title: 'Sottoclassi',
        body: `Barbaro — Zelota.
Bardo — Spade, Sussurri.
Chierico — Forgia, Tomba.
Druido — Sogni, Pastore.
Guerriero — Cavaliere, Arciere arcano, Samurai.
Ladro — Inquisitore, Scout, Spadaccino.
Mago — Guerra, Invenzione.
Monaco — Kensei, Anima del sole.
Paladino — Conquista, Redenzione.
Ranger — Viandante dell’orizzonte, Ammazzamostri, Predatore dell’ombra.
Stregone — Anima divina, Ombra.
Warlock — Celestiale, Lama maledetta.`,
      },
    ],
  },
  {
    title: 'Calderone tuttofare di Tasha',
    note: 'Riassunto originale. I testi del libro restano della Wizards of the Coast.',
    sections: [
      {
        title: 'Personalizzare',
        body: `L’aumento di caratteristica di una razza si può spostare su altre caratteristiche, con l’accordo del master.
Molte classi ricevono privilegi opzionali che sostituiscono quelli del manuale base, e stili di combattimento in più.
L’artefice è una classe nuova: d8, Intelligenza, infonde magia negli oggetti. Gli incantesimi li prepara.`,
      },
      {
        title: 'Sottoclassi',
        body: `Barbaro — Bestia, Magia selvaggia.
Bardo — Creazione, Eloquenza.
Chierico — Ordine, Pace, Crepuscolo.
Druido — Stelle, Fuoco selvaggio.
Guerriero — Cavaliere runico, Guerriero psi.
Ladro — Fantasma, Lama dell’anima.
Mago — Canto delle lame, Ordine degli scribi.
Monaco — Sé astrale, Misericordia.
Paladino — Gloria, Sentinelle.
Ranger — Viandante fatato, Custode dello sciame.
Stregone — Mente aberrante, Anima meccanica.
Warlock — Abissale, Genio.
Artefice — Alchimista, Artigliere, Battaglia, Armaiolo.`,
      },
      {
        title: 'Al tavolo',
        body: `Compari: personaggi semplici (esperto, incantatore, guerriero) che seguono il gruppo e salgono di livello con lui.
Patron del gruppo, puzzle magici e regole per il viaggio sono strumenti del master, non voci della scheda.`,
      },
    ],
  },
  {
    title: 'Mostri del multiverso',
    note: 'Riassunto originale. Schede e tratti restano della Wizards of the Coast.',
    sections: [
      {
        title: 'Cosa contiene',
        body: `Aggiorna mostri e razze già pubblicati. Per i personaggi, le razze sono lignaggi: l’aumento di caratteristica si assegna, non è fisso, e molti tratti di 1° livello sono stati riscritti in forma più corta.`,
      },
      {
        title: 'Razze giocanti',
        body: `Aasimar, bugbear, centauro, changeling, coboldo, duergar, eladrin, fatato, firbolg, gith, gnomo delle profondità, goblin, goliath, harengon, hobgoblin, kenku, lucertoloide, minotauro, orco, owlin, satiro, sea elf, shadar-kai, shifter, tabaxi, tortle, tritone, yuan-ti.

Nella creazione di Scriba restano le razze del manuale base. Queste si usano se il master le ammette, copiando i tratti dal libro.`,
      },
    ],
  },
]

const MANUAL_SECTIONS = [
  {
    title: 'Prove e tiri salvezza',
    body: `Si tira un d20 e si somma il modificatore della caratteristica. Se si è competenti, si somma anche il bonus di competenza (+2 al 1° livello, cresce ogni quattro livelli: 4, 8, 12, 16, 19).

Il modificatore di caratteristica è (punteggio − 10) diviso 2, arrotondato per difetto.

Difficoltà tipiche: 5 molto facile, 10 media, 15 difficile, 20 molto difficile.

I tiri salvezza sono prove sulla caratteristica: quelli di competenza della classe includono il bonus di competenza.`,
  },
  {
    title: 'Vantaggio e svantaggio',
    body: `Con vantaggio si tirano due d20 e si tiene il più alto. Con svantaggio, il più basso.

Si accumulano se più fattori concorrono nello stesso verso. Non si sommano mai: se hai sia vantaggio sia svantaggio, si annullano a vicenda.`,
  },
  {
    title: 'Il combattimento',
    body: `L'iniziativa è una prova di Destrezza. Nel tuo turno: un'azione, un'azione bonus se un potere la concede, e ti muovi di tanti metri quanto la tua velocità. Hai una reazione per turno.

Attacco: d20 + modificatore + (competenza se esperto) contro Classe Armatura. Il 20 naturale è critico: raddoppia i dadi del danno. L'1 naturale è sempre un fallimento.

Le armi da mischia usano la Forza, quelle a distanza la Destrezza.`,
  },
  {
    title: 'Punti ferita e la morte',
    body: `A 0 punti ferita sei privo di sensi e inizi i tiri salvidinamorte. Tira un d20: 10+ è un successo, tre successi ti stabilizzano; sotto 10 è un fallimento, tre fallimenti ti uccidono. Il 20 naturale ripristina 1 punto ferita, l'1 ne conta due di fallimento.

Un danno superiore ai punti ferita massimi residui non fa sopramma: la differenza va a 0.

I punti ferita temporanei non si sommano tra loro e si consumano per primi.`,
  },
  {
    title: 'I riposi',
    body: `Riposo breve — almeno un'ora. Puoi spendere uno o più dadi vita: per ogni dado, tiri il dado della tua classe e ti curi del risultato + modificatore di Costituzione. Hai un dado vita per livello. Altre risorse che si ricaricano al riposo breve tornano piene.

Riposo lungo — otto ore, di cui almeno due di sonno. Ripristina tutti i punti ferita, la metà dei dadi vita (arrotondata per difetto), tutti gli slot incantesimo e le risorse a riposo lungo. Una volta ogni 24 ore.`,
  },
  {
    title: 'Le condizioni',
    body: `Accecato — fallisce ogni prova che richiede la vista; gli attacchi contro di te hanno vantaggio.
Affascinato — non può attaccare chi incanta; quell'attaccante ha vantaggio sociale.
Afferrato — velocità 0; non ci si può allontanare.
Assordato — fallisce le prove di udito.
Avvelenato — svantaggio agli attacchi e alle prove.
Incapacitato — niente azioni o reazioni.
Invisibile — attacchi con vantaggio, contro di te con svantaggio.
Paralizzato — incapace di muoversi e agire; gli attacchi corpo a corpo contro di te entro 1,5 m sono critici.
Pietrificato — trasformato in pietra, peso ×10.
Privo di sensi — cade; inizia i tiri salvidinamorte.
Prono — l'unica movenza è strisciare; attacchi con svantaggio, contro di te con vantaggio corpo a corpo.
Spaventato — svantaggio finché la fonte è visibile; non può avvicinarsi alla fonte.
Stordito — niente azioni, non si muove; fallisce tiri salvezza su DES.
Trattenuto — velocità 0; attacchi e tiri salvezza su DES falliscono.`,
  },
  {
    title: 'Gli incantesimi',
    body: `Trucchetti: si lanciano a piacere, senza slot.

Slot: ogni slot ha un livello. Un incantesimo di 1° livello consuma uno slot di 1° o più; lanciarlo a un livello superiore può aumentarne l'effetto. Gli slot si ricaricano al riposo lungo (il warlock al riposo breve).

CD incantesimo = 8 + bonus competenza + modificatore dell'incaratteristica.
Bonus colpo incantesimo = bonus competenza + modificatore dell'incaratteristica.

Concentrazione: si mantiene un solo incantesimo di concentrazione alla volta. Subendo danno si tira Costituzione contro CD 10 o metà del danno subito, il maggiore; in caso di fallimento la concentrazione si spezza.`,
  },
  {
    title: 'Esaurimento',
    body: `Sei livelli. 1°: svantaggio alle prove di caratteristica. 2°: velocità dimezzata. 3°: svantaggio agli attacchi e ai tiri salvezza. 4°: punti ferita massimi dimezzati. 5°: velocità 0. 6°: morte. Un riposo lungo rimuove un livello.`,
  },
  {
    title: 'Ispirazione',
    body: `Il master la concede per interpretazione fedele al personaggio. Si spende per avere vantaggio a un tiro, una per turno. Non si accumula.`,
  },
  {
    title: 'Razze',
    body: `Nano delle colline — velocità 7,5 m; +2 COS +1 SAG; +1 PF per livello.
Nano delle montagne — 7,5 m; +2 COS +2 FOR.
Elfo alto — 9 m; +2 DES +1 INT; un trucchetto da mago.
Elfo dei boschi — 10,5 m; +2 DES +1 SAG.
Halfling piede leggero — 7,5 m; +2 DES +1 CAR; fortunato (un 1 sul d20 si ritira).
Halfling robusto — 7,5 m; +2 DES +1 COS; fortunato.
Umano — 9 m; +1 a tutte le caratteristiche.`,
  },
  {
    title: 'Le dodici classi',
    body: `Barbaro — d12; saldi FOR/COS.
Bardo — d8; incantatore di Carisma; ispirazione bardica.
Chierico — d8; prepara incantesimi di Saggezza.
Druido — d8; forma selvatica dal 2°; prepara di Saggezza.
Guerriero — d10; recupera energie, azione impetuosa.
Ladro — d8; maestria e attacco furtivo.
Mago — d6; libro degli incantesimi, preparazione giornaliera.
Monaco — d8; ki dal 2°; arti marziali.
Paladino — d10; imposizione delle mani, incantesimi dal 2°.
Ranger — d10; incantesimi dal 2°.
Stregone — d6; incantesimi conosciuti, +1 PF per livello.
Warlock — d8; magia del patto, slot al riposo breve.`,
  },
];

MANUAL_BOOKS[0].sections = MANUAL_SECTIONS;