export const ABILITIES = [
  { key: 'for', label: 'Forza', short: 'FOR' },
  { key: 'des', label: 'Destrezza', short: 'DES' },
  { key: 'cos', label: 'Costituzione', short: 'COS' },
  { key: 'int', label: 'Intelligenza', short: 'INT' },
  { key: 'sag', label: 'Saggezza', short: 'SAG' },
  { key: 'car', label: 'Carisma', short: 'CAR' },
];
export const ABILITY_KEYS = ABILITIES.map((a) => a.key);
export const abilityLabel = (k) => ABILITIES.find((a) => a.key === k)?.label;

export const SKILLS = [
  { name: 'Acrobazia', ab: 'des' },
  { name: 'Addestrare animali', ab: 'sag' },
  { name: 'Arcano', ab: 'int' },
  { name: 'Atletica', ab: 'for' },
  { name: 'Furtività', ab: 'des' },
  { name: 'Indagare', ab: 'int' },
  { name: 'Inganno', ab: 'car' },
  { name: 'Intimidire', ab: 'car' },
  { name: 'Intrattenere', ab: 'car' },
  { name: 'Intuizione', ab: 'sag' },
  { name: 'Medicina', ab: 'sag' },
  { name: 'Natura', ab: 'int' },
  { name: 'Percezione', ab: 'sag' },
  { name: 'Persuasione', ab: 'car' },
  { name: 'Rapidità di mano', ab: 'des' },
  { name: 'Religione', ab: 'int' },
  { name: 'Sopravvivenza', ab: 'sag' },
  { name: 'Storia', ab: 'int' },
];
const ALL_SKILLS = SKILLS.map((s) => s.name);

const DWARF = ['Scurovisione (18 m)', 'Resilienza nanica', 'Esperto di pietre'];
const ELF = ['Scurovisione (18 m)', 'Sensi acuti', 'Retaggio fatato', 'Trance'];
const HALFLING = ['Fortunato: un 1 sul d20 si ritira', 'Coraggioso', 'Agilità halfling'];

export const RACES = {
  nano_colline: { name: 'Nano delle colline', speed: 7.5, languages: ['Nanico'], bonus: { cos: 2, sag: 1 }, traits: [...DWARF, 'Robustezza nanica: +1 PF per livello'] },
  nano_montagne: { name: 'Nano delle montagne', speed: 7.5, languages: ['Nanico'], bonus: { cos: 2, for: 2 }, traits: [...DWARF, 'Addestramento nelle armature leggere e medie'] },
  elfo_alto: { name: 'Elfo alto', speed: 9, languages: ['Elfico', 'una a scelta'], bonus: { des: 2, int: 1 }, skills: ['Percezione'], traits: [...ELF, 'Un trucchetto da mago (Intelligenza)'] },
  elfo_boschi: { name: 'Elfo dei boschi', speed: 10.5, languages: ['Elfico'], bonus: { des: 2, sag: 1 }, skills: ['Percezione'], traits: [...ELF, 'Maschera della natura'] },
  halfling_piede: { name: 'Halfling piede leggero', speed: 7.5, languages: ['Halfling'], bonus: { des: 2, car: 1 }, lucky: true, traits: [...HALFLING, 'Furtività innata'] },
  halfling_robusto: { name: 'Halfling robusto', speed: 7.5, languages: ['Halfling'], bonus: { des: 2, cos: 1 }, lucky: true, traits: [...HALFLING, 'Resilienza dei robusti'] },
  umano: { name: 'Umano', speed: 9, languages: ['una a scelta'], bonus: { for: 1, des: 1, cos: 1, int: 1, sag: 1, car: 1 }, traits: ['+1 a tutte le caratteristiche'] },
};

export const CLASSES = {
  barbaro: { name: 'Barbaro', hd: 12, saves: ['for', 'cos'], skillCount: 2, skills: ['Addestrare animali', 'Atletica', 'Intimidire', 'Natura', 'Percezione', 'Sopravvivenza'], features: { 1: ['Ira', 'Difesa senza armatura'], 2: ['Attacco irruento', 'Percepire il pericolo'], 3: ['Cammino primordiale'], 5: ['Attacco extra', 'Movimento veloce'] } },
  bardo: { name: 'Bardo', hd: 8, saves: ['des', 'car'], skillCount: 3, skills: ALL_SKILLS, code: 'B', caster: { ability: 'car', kind: 'known', cantrips: [2, 3, 4], known: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22] }, features: { 1: ['Incantesimi', 'Ispirazione bardica'], 2: ['Factotum', 'Canto di riposo'], 3: ['Collegio bardico', 'Maestria'], 5: ['Fonte d’ispirazione'] } },
  chierico: { name: 'Chierico', hd: 8, saves: ['sag', 'car'], skillCount: 2, skills: ['Intuizione', 'Medicina', 'Persuasione', 'Religione', 'Storia'], code: 'C', caster: { ability: 'sag', kind: 'prepared', cantrips: [3, 4, 5] }, features: { 1: ['Incantesimi', 'Dominio divino'], 2: ['Incanalare divinità'], 5: ['Distruggere non morti'] } },
  druido: { name: 'Druido', hd: 8, saves: ['int', 'sag'], skillCount: 2, skills: ['Arcano', 'Addestrare animali', 'Intuizione', 'Medicina', 'Natura', 'Percezione', 'Religione', 'Sopravvivenza'], code: 'D', caster: { ability: 'sag', kind: 'prepared', cantrips: [2, 3, 4] }, features: { 1: ['Druidico', 'Incantesimi'], 2: ['Forma selvatica', 'Circolo druidico'] } },
  guerriero: { name: 'Guerriero', hd: 10, saves: ['for', 'cos'], skillCount: 2, skills: ['Acrobazia', 'Addestrare animali', 'Atletica', 'Intimidire', 'Intuizione', 'Percezione', 'Sopravvivenza', 'Storia'], features: { 1: ['Stile di combattimento', 'Recuperare energie'], 2: ['Azione impetuosa'], 3: ['Archetipo marziale'], 5: ['Attacco extra'] } },
  ladro: { name: 'Ladro', hd: 8, saves: ['des', 'int'], skillCount: 4, skills: ['Acrobazia', 'Atletica', 'Furtività', 'Indagare', 'Inganno', 'Intimidire', 'Intrattenere', 'Intuizione', 'Percezione', 'Persuasione', 'Rapidità di mano'], features: { 1: ['Maestria', 'Attacco furtivo', 'Gergo ladresco'], 2: ['Azione scaltra'], 3: ['Archetipo ladresco'], 5: ['Schivata prodigiosa'] } },
  mago: { name: 'Mago', hd: 6, saves: ['int', 'sag'], skillCount: 2, skills: ['Arcano', 'Indagare', 'Intuizione', 'Medicina', 'Religione', 'Storia'], code: 'M', caster: { ability: 'int', kind: 'book', cantrips: [3, 4, 5] }, features: { 1: ['Incantesimi', 'Recupero arcano'], 2: ['Tradizione arcana'] } },
  monaco: { name: 'Monaco', hd: 8, saves: ['for', 'des'], skillCount: 2, skills: ['Acrobazia', 'Atletica', 'Furtività', 'Intuizione', 'Religione', 'Storia'], features: { 1: ['Difesa senza armatura', 'Arti marziali'], 2: ['Ki', 'Movimento senza armatura'], 3: ['Tradizione monastica', 'Deviare proiettili'], 4: ['Caduta lenta'], 5: ['Attacco extra', 'Colpo stordente'] } },
  paladino: { name: 'Paladino', hd: 10, saves: ['sag', 'car'], skillCount: 2, skills: ['Atletica', 'Intimidire', 'Intuizione', 'Medicina', 'Persuasione', 'Religione'], code: 'P', caster: { ability: 'car', kind: 'prepared', half: true }, features: { 1: ['Percezione del divino', 'Imposizione delle mani'], 2: ['Stile di combattimento', 'Incantesimi', 'Punizione divina'], 3: ['Salute divina', 'Giuramento sacro'], 5: ['Attacco extra'] } },
  ranger: { name: 'Ranger', hd: 10, saves: ['for', 'des'], skillCount: 3, skills: ['Addestrare animali', 'Atletica', 'Furtività', 'Indagare', 'Intuizione', 'Natura', 'Percezione', 'Sopravvivenza'], code: 'R', caster: { ability: 'sag', kind: 'known', half: true, known: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11] }, features: { 1: ['Nemico prescelto', 'Esploratore nato'], 2: ['Stile di combattimento', 'Incantesimi'], 3: ['Archetipo ranger', 'Consapevolezza primordiale'], 5: ['Attacco extra'] } },
  stregone: { name: 'Stregone', hd: 6, saves: ['cos', 'car'], skillCount: 2, skills: ['Arcano', 'Inganno', 'Intimidire', 'Intuizione', 'Persuasione', 'Religione'], code: 'S', caster: { ability: 'car', kind: 'known', cantrips: [4, 5, 6], known: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15] }, features: { 1: ['Incantesimi', 'Origine stregonesca'], 2: ['Fonte di magia'], 3: ['Metamagia'] } },
  warlock: { name: 'Warlock', hd: 8, saves: ['sag', 'car'], skillCount: 2, skills: ['Arcano', 'Inganno', 'Intimidire', 'Indagare', 'Natura', 'Religione', 'Storia'], code: 'W', caster: { ability: 'car', kind: 'pact', cantrips: [2, 3, 4], known: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15] }, features: { 1: ['Patrono ultraterreno', 'Magia del patto'], 2: ['Suppliche occulte'], 3: ['Dono del patto'] } },
};

export const EXPERTISE = { ladro: { 1: 2, 6: 2 }, bardo: { 3: 2, 10: 2 } };
export const ASI_LEVELS = { default: [4, 8, 12, 16, 19], guerriero: [4, 6, 8, 12, 14, 16, 19], ladro: [4, 8, 10, 12, 16, 19] };

export const CONDITIONS = ['Accecato', 'Affascinato', 'Afferrato', 'Assordato', 'Avvelenato', 'Incapacitato', 'Invisibile', 'Paralizzato', 'Pietrificato', 'Privo di sensi', 'Prono', 'Spaventato', 'Stordito', 'Trattenuto'];

export const WEAPONS = [
  ['Alabarda', '1d10'], ['Arco corto', '1d6'], ['Arco lungo', '1d8'], ['Ascia', '1d6'], ['Ascia bipenne', '1d12'],
  ['Ascia da battaglia', '1d8'], ['Balestra a mano', '1d6'], ['Balestra leggera', '1d8'], ['Balestra pesante', '1d10'],
  ['Bastone ferrato', '1d6'], ['Dardo', '1d4'], ['Falcetto', '1d4'], ['Falcione', '1d10'], ['Fionda', '1d4'],
  ['Frusta', '1d4'], ['Giavellotto', '1d6'], ['Lancia', '1d6'], ['Lancia da cavaliere', '1d12'], ['Maglio', '2d6'],
  ['Martello da guerra', '1d8'], ['Martello leggero', '1d4'], ['Mazza', '1d6'], ['Mazzafrusto', '1d8'],
  ['Morning star', '1d8'], ['Picca', '1d10'], ['Piccone da guerra', '1d8'], ['Pugnale', '1d4'], ['Randello', '1d4'],
  ['Randello pesante', '1d8'], ['Scimitarra', '1d6'], ['Spada corta', '1d6'], ['Spada lunga', '1d8'],
  ['Spadone', '2d6'], ['Stocco', '1d8'], ['Tridente', '1d6'],
].map(([name, damage]) => ({ name, damage }));