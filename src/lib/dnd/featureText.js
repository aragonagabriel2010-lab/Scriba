/** Riassunti originali brevi (non testo di manuale). kind: 'active' | 'passive' */
import { PATHS, SUBCLASSES } from './extra'

const F = (kind, effect) => ({ kind, effect })

export const FEATURE_TEXT = {
  // Razza / tratti comuni
  'Scurovisione (18 m)': F('passive', 'Vedi al buio fino a 18 m: grigio entro 18 m, buio totale oltre.'),
  'Resilienza nanica': F('passive', 'Vantaggio ai TS contro veleno; resistenza ai danni da veleno.'),
  'Esperto di pietre': F('passive', 'Su storia legata a lavori in pietra, tratti come competente e raddoppi il bonus.'),
  'Robustezza nanica: +1 PF per livello': F('passive', '+1 punto ferita massimo per ogni livello.'),
  'Addestramento nelle armature leggere e medie': F('passive', 'Competenza in armature leggere e medie.'),
  'Sensi acuti': F('passive', 'Competenza in Percezione.'),
  'Retaggio fatato': F('passive', 'Vantaggio ai TS contro essere affascinato; immunità al sonno magico.'),
  'Trance': F('passive', 'Invece di dormire, 4 ore di trance bastano come riposo lungo.'),
  'Un trucchetto da mago (Intelligenza)': F('passive', 'Conosci un trucchetto da mago; l’abilità di lancio è Intelligenza.'),
  'Maschera della natura': F('passive', 'Puoi tentare di nasconderti anche con solo un riparo leggero di vegetazione.'),
  'Fortunato: un 1 sul d20 si ritira': F('passive', 'Quando tiri 1 su un d20 di attacco, prova o TS, puoi ritirare e tenere il nuovo risultato.'),
  'Coraggioso': F('passive', 'Vantaggio ai TS contro essere spaventato.'),
  'Agilità halfling': F('passive', 'Puoi muoverti nello spazio di creature più grandi di te.'),
  'Furtività innata': F('passive', 'Puoi tentare di nasconderti anche dietro una creatura di una taglia più grande.'),
  'Resilienza dei robusti': F('passive', 'Vantaggio ai TS contro veleno; resistenza ai danni da veleno.'),
  '+1 a tutte le caratteristiche': F('passive', 'Ogni punteggio di caratteristica aumenta di 1.'),

  // Classi
  Ira: F('active', 'Bonus ai danni da forza, resistenza a fisico; usi limitati, riposo lungo (poi migliorano).'),
  'Difesa senza armatura': F('passive', 'Senza armatura, la CA usa Destrezza e un’altra caratteristica della classe.'),
  'Attacco irruento': F('active', 'Vantaggio agli attacchi di forza nel turno; gli attacchi contro di te hanno vantaggio fino al tuo prossimo turno.'),
  'Percepire il pericolo': F('passive', 'Vantaggio ai TS di Destrezza contro effetti che vedi arrivare, se non sei incapacitato.'),
  'Cammino primordiale': F('passive', 'Scegli il cammino: tratti e poteri specifici da quel momento.'),
  'Attacco extra': F('passive', 'Quando Attacchi, puoi fare un attacco in più con la stessa azione.'),
  'Movimento veloce': F('passive', 'La velocità aumenta se non indossi armatura pesante.'),
  Incantesimi: F('passive', 'Lanci incantesimi della classe secondo la tabella e le regole della classe.'),
  'Ispirazione bardica': F('active', 'Dai un dado bonus a un alleato; lo spende entro pochi minuti su un tiro.'),
  Factotum: F('passive', 'Aggiungi metà del bonus competenza alle prove in cui non sei già competente.'),
  'Canto di riposo': F('passive', 'Durante un riposo breve, chi ascolta recupera dadi vita aggiuntivi.'),
  'Collegio bardico': F('passive', 'Scegli il collegio: tratti e poteri da quel momento.'),
  Maestria: F('passive', 'Raddoppi il bonus competenza in abilità scelte.'),
  'Fonte d’ispirazione': F('passive', 'Recuperi gli usi di ispirazione anche con un riposo breve.'),
  'Dominio divino': F('passive', 'Scegli il dominio: tratti, magie e canali tipici di quel dominio.'),
  'Incanalare divinità': F('active', 'Usi speciali legati al dominio; si recuperano di solito col riposo breve.'),
  'Distruggere non morti': F('passive', 'Quando incanali per scacciare, i non morti deboli possono essere distrutti.'),
  Druidico: F('passive', 'Conosci la lingua segreta dei druidi.'),
  'Forma selvatica': F('active', 'Assumi forma di bestia entro i limiti di grado di sfida e usi del giorno.'),
  'Circolo druidico': F('passive', 'Scegli il circolo: tratti e magie tipiche.'),
  'Stile di combattimento': F('passive', 'Bonus permanente in combattimento (difesa, duello, tiro, ecc.).'),
  'Recuperare energie': F('active', 'Azione bonus: recuperi punti ferita pari a 1d10 + livello guerriero, una volta per riposo breve.'),
  'Azione impetuosa': F('active', 'Nel tuo turno puoi fare un’azione in più (attacco, scatto, disimpegno, nascondersi); poi riposo breve.'),
  'Archetipo marziale': F('passive', 'Scegli l’archetipo: tratti e poteri da quel momento.'),
  'Attacco furtivo': F('active', 'Una volta per turno, danno extra se hai vantaggio (o un alleato vicino) con arma fine/a distanza.'),
  'Gergo ladresco': F('passive', 'Comprendi segni e gergo dei ladri.'),
  'Azione scaltra': F('active', 'Azione bonus: Scatto, Disimpegno o Nascondersi.'),
  'Archetipo ladresco': F('passive', 'Scegli l’archetipo: tratti tipici del mestiere.'),
  'Schivata prodigiosa': F('active', 'Reazione: dimezzi il danno di un attacco che ti colpisce e che vedi.'),
  'Recupero arcano': F('active', 'Una volta al giorno, in riposo breve recuperi slot di basso livello.'),
  'Tradizione arcana': F('passive', 'Scegli la tradizione: tratti e salvatagge tipici.'),
  'Arti marziali': F('passive', 'Armi da monaco e pugni usano dadi speciali; puoi fare un colpo bonus a mani nude.'),
  Ki: F('active', 'Punti da spendere in tecniche (raffiche, difesa, passo, ecc.); riposo breve.'),
  'Movimento senza armatura': F('passive', 'Senza armatura e scudo, velocità e salti migliorano.'),
  'Tradizione monastica': F('passive', 'Scegli la tradizione: tratti tipici.'),
  'Deviare proiettili': F('active', 'Reazione: riduci danno da proiettile; con ki puoi eventualmente rilanciare.'),
  'Caduta lenta': F('passive', 'Reazione: riduci i danni da caduta.'),
  'Colpo stordente': F('active', 'Con ki, un colpo può costringere a un TS o restare stordito per breve.'),
  'Percezione del divino': F('active', 'Senti celestiali, demoni e non morti vicini, e oggetti consacrati/dissacrati.'),
  'Imposizione delle mani': F('active', 'Spendi una riserva di punti ferita per curare (o per effetti contro malattia/veleno).'),
  'Punizione divina': F('active', 'Quando colpisci, spendi uno slot per danno radiante extra.'),
  'Salute divina': F('passive', 'Immunità a malattie.'),
  'Giuramento sacro': F('passive', 'Scegli il giuramento: tratti, canali e magie tipiche.'),
  'Nemico prescelto': F('passive', 'Vantaggi di studio e caccia contro un tipo di nemici scelto.'),
  'Esploratore nato': F('passive', 'Vantaggi di viaggio e sopravvivenza in un terreno favorito.'),
  'Archetipo ranger': F('passive', 'Scegli l’archetipo: tratti tipici.'),
  'Consapevolezza primordiale': F('active', 'Senti tipi di creature entro un certo raggio.'),
  'Origine stregonesca': F('passive', 'Scegli l’origine: tratti e magie tipiche.'),
  'Fonte di magia': F('active', 'Punti stregoneria per convertire slot e potenziare magie.'),
  Metamagia: F('active', 'Modifichi gli incantesimi spendendo punti stregoneria.'),
  'Patrono ultraterreno': F('passive', 'Scegli il patrono: tratti e lista magie tipiche.'),
  'Magia del patto': F('passive', 'Slot di patto che tornano col riposo breve; magie conosciute.'),
  'Suppliche occulte': F('passive', 'Piccoli poteri permanenti legati al patto.'),
  'Dono del patto': F('passive', 'Scegli un dono (lama, catena, tomo, ecc.).'),
  'Infusione magica': F('active', 'Infondi oggetti con effetti magici limitati.'),
  'Oggetto replicato': F('active', 'Crei copie magiche di oggetti semplici dalla tua lista.'),
  Specialità: F('passive', 'Scegli la specialità dell’artefice.'),
  'Maestria negli attrezzi': F('passive', 'Bonus extra quando usi certi attrezzi.'),

  // Extra razze (riassunti corti)
  'Resistenza necrotici e radianti': F('passive', 'Resistenza a necrotici e radianti.'),
  'Luce interiore': F('active', 'Crei luce tenue o intensa da te.'),
  'Rivelazione celestiale': F('active', 'Trasformazione breve con effetti di volo/danno radianti.'),
  'Braccia lunghe': F('passive', 'Portata maggiore nei corpi a corpo.'),
  'Sorpresa silenziosa': F('passive', 'Vantaggio se agisci prima del nemico all’inizio del combattimento.'),
  Potente: F('passive', 'Conti come una taglia più grande per spingere, afferrare, ecc.'),
  Carica: F('active', 'Dopo aver corso, bonus di carica in corpo a corpo.'),
  Zoccoli: F('active', 'Attacco naturale con gli zoccoli.'),
  Equino: F('passive', 'Non puoi salire su una cavalcatura tipica; portata e movimento da quadrupede.'),
  'Cambia forma': F('active', 'Cambi aspetto (non la taglia) finché non lo interrompi.'),
  'Istinto da impostore': F('passive', 'Vantaggio a prove sociali da fingere.'),
  'Urlo di aiuto': F('active', 'Puoi aiutare un alleato come reazione in certe condizioni.'),
  'Mente da gruppo': F('passive', 'Vantaggi quando lavorate vicini ad altri del gruppo.'),
  'Visione nel buio': F('passive', 'Vedi nel buio fino a una certa distanza.'),
  Ingrandirsi: F('active', 'Aumenti di taglia per un breve periodo.'),
  Invisibilità: F('active', 'Diventi invisibile per un breve periodo.'),
  'Resiste all’illusione': F('passive', 'Vantaggio contro illusioni.'),
  'Passo fatato': F('active', 'Teletrasporto breve; a volte con effetto di stagione.'),
  'Stagione che cambia': F('passive', 'Il tuo umore/stagione può cambiare i tuoi poteri minori.'),
  Volo: F('passive', 'Hai una velocità di volo se non indossi armatura pesante.'),
  'Taglia piccola': F('passive', 'Sei Piccolo.'),
  'Magia fatata': F('active', 'Lanci piccoli incantesimi tipici del popolo fatato.'),
  'Passo nascosto': F('active', 'Breve invisibilità.'),
  'Parla con bestie e piante': F('active', 'Comunicazione limitata con bestie e piante.'),
  'Forza potente': F('passive', 'Conti come più grande per forza e carico.'),
  'Conoscenza astrale': F('passive', 'Competenze o magie legate al piano astrale.'),
  'Disciplina psichica': F('active', 'Piccole magie psichiche a volontà o a usi limitati.'),
  'Difesa mentale': F('passive', 'Vantaggio contro effetti mentali.'),
  'Visione nel buio superiore': F('passive', 'Scurovisione più ampia.'),
  'Dono del sottosuolo': F('passive', 'Vantaggi tipici della vita sotto terra.'),
  Furia: F('active', 'Quando colpisci, puoi spaventare o spingere con un urlo.'),
  'Scatto per togliersi': F('active', 'Disimpegno o scatto come bonus dopo certi eventi.'),
  'Resistenza della pietra': F('active', 'Riduci un colpo una volta per riposo.'),
  'Corporatura potente': F('passive', 'Conti come più grande per carico e spinte.'),
  'Competizione naturale': F('passive', 'Vantaggio atletico in gare di forza o resistenza.'),
  'Iniziativa da lepre': F('passive', 'Aggiungi un bonus all’iniziativa.'),
  Balzo: F('active', 'Salto lungo come parte del movimento.'),
  'Orecchie attente': F('passive', 'Vantaggio a Percezione uditiva.'),
  'Dono del fato': F('active', 'Dadi bonus da spendere su tiri tuoi o di alleati.'),
  'Addestramento da compagnia': F('passive', 'Aiuti migliori quando combattono insieme.'),
  'Imita suoni': F('passive', 'Ripeti suoni e voci udite.'),
  'Mente da esperto': F('passive', 'Competenza extra in abilità da artigiano o studio.'),
  Ruggito: F('active', 'Può spaventare i vicini.'),
  Artigli: F('active', 'Attacco naturale con gli artigli.'),
  'Vista acuta': F('passive', 'Vantaggio a Percezione basata sulla vista.'),
  Morso: F('active', 'Attacco naturale da morso.'),
  'Trattiene il fiato': F('passive', 'Resti senza respirare più a lungo.'),
  Nuota: F('passive', 'Velocità di nuoto.'),
  'Coda afferrante': F('active', 'Puoi afferrare con la coda.'),
  Corna: F('active', 'Attacco naturale con le corna.'),
  Martellamento: F('active', 'Dopo una carica, effetto extra con le corna.'),
  'Labirinto interiore': F('passive', 'Vantaggio a non perderti; senso della direzione.'),
  'Scatto aggressivo': F('active', 'Azione bonus: muoviti verso un nemico che vedi.'),
  'Resiste a un colpo mortale': F('passive', 'Una volta al riposo lungo, resisti a scendere a 0 PF.'),
  'Vista silenziosa': F('passive', 'Vantaggio a Percezione e Stealth in certe condizioni.'),
  Ariete: F('active', 'Attacco di testa/carica.'),
  'Resistenza magica': F('passive', 'Vantaggio ai TS contro magia.'),
  'Mirthful leaps': F('passive', 'Salti più lunghi.'),
  'Parla con le creature marine': F('active', 'Comunicazione limitata con creature d’acqua.'),
  'Respiro d’acqua': F('passive', 'Respiri sott’acqua.'),
  'Benedizione della regina corvo': F('active', 'Teletrasporto breve e resistenza temporanea.'),
  'Resistenza necrotici': F('passive', 'Resistenza ai danni necrotici.'),
  Trasformazione: F('active', 'Assumi tratti bestiali per pochi turni.'),
  'Sensi acuti': F('passive', 'Vantaggio a Percezione.'),
  'Scatto felino': F('active', 'Velocità doppia per un turno, poi riposo.'),
  'Curiosità felina': F('passive', 'Competenza in Percezione e Rapidità di mano.'),
  'Guscio come armatura': F('passive', 'CA naturale alta senza armatura.'),
  Anfibio: F('passive', 'Respiri aria e acqua.'),
  'Controlla aria e acqua': F('active', 'Piccole magie di aria/acqua.'),
  'Messaggero degli abissi': F('passive', 'Comunicazione e adattamento acquatici.'),
  'Suggestione del veleno': F('active', 'Incantesimo di suggestione legato al veleno.'),
  'Immunità al veleno': F('passive', 'Immunità a veleno e avvelenato.'),
}

export function resolveFeature(entry) {
  if (entry && typeof entry === 'object') {
    const name = String(entry.name || '').trim() || 'Privilegio'
    const kind = entry.kind === 'active' ? 'active' : 'passive'
    const effect = String(entry.effect || '').trim()
    return {
      id: entry.id || name,
      name,
      kind,
      effect: effect || fallbackEffect(name, kind),
      custom: true,
    }
  }
  const name = String(entry || '').trim()
  const found = FEATURE_TEXT[name] || fuzzyFind(name)
  return {
    id: name,
    name,
    kind: found?.kind || 'passive',
    effect: found?.effect || fallbackEffect(name, found?.kind || 'passive'),
    custom: false,
  }
}

function fuzzyFind(name) {
  if (!name) return null
  if (FEATURE_TEXT[name]) return FEATURE_TEXT[name]
  const lower = name.toLowerCase()
  const key = Object.keys(FEATURE_TEXT).find((k) => lower.startsWith(k.toLowerCase()) || k.toLowerCase().startsWith(lower))
  if (key) return FEATURE_TEXT[key]
  const path = (PATHS || []).find((p) => p.name === name)
  if (path?.line) return { kind: 'passive', effect: path.line }
  for (const list of Object.values(SUBCLASSES || {})) {
    const sub = (list || []).find((s) => s.name === name)
    if (sub) return { kind: 'passive', effect: sub.line || `Sottoclasse: tratti tipici di ${sub.name}.` }
  }
  return null
}

function fallbackEffect(name, kind) {
  if (kind === 'active') return 'Potere da attivare: chiedi al master i dettagli al tavolo.'
  return 'Tratto sempre attivo: chiedi al master i dettagli al tavolo.'
}

export function kindLabel(kind) {
  return kind === 'active' ? 'Attiva' : 'Passiva'
}
