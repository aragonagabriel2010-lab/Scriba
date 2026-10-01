import { ABILITIES, ABILITY_KEYS, RACES, CLASSES, SKILLS, EXPERTISE, ASI_LEVELS, SUBCLASSES, PATHS } from './data';
import { SPELLS } from './spells';

export const mod = (s) => Math.floor((s - 10) / 2);
export const signed = (n) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);
export const profBonus = (l) => 2 + Math.floor((l - 1) / 4);
export const rollDie = (n) => 1 + Math.floor(Math.random() * n);
export const formatMeters = (m) => `${String(m).replace('.', ',')} m`;

export const blankDefinition = (mode, name) => ({
  name: name || '', race: null, classKey: null, subclass: null, path: null, lineage: { high: null, low: null }, level: 1,
  scores: Object.fromEntries(ABILITY_KEYS.map((k) => [k, mode === 'regole' ? 8 : 10])),
  asi: {}, skills: [], expertise: [], cantrips: [], spells: [], prepared: [], extraSpells: [], features: [], customFeatures: [], hpMax: 0,
});

export const defaultState = () => ({
  hp: null, tempHp: 0, ac: null, conditions: [], inspiration: false, concentration: '', exhaustion: 0,
  hitDiceSpent: 0, resourcesUsed: {}, slotsUsed: {}, weapons: [], equipment: '',
  coins: { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 }, notes: '', appearance: '',
});

export function finalScores(def) {
  const race = RACES[def.race];
  const flex = {};
  if (race?.bonusMode === 'flex' && def.lineage?.high && def.lineage.low && def.lineage.high !== def.lineage.low) {
    flex[def.lineage.high] = 2;
    flex[def.lineage.low] = 1;
  }
  return Object.fromEntries(ABILITY_KEYS.map((k) => [k, (def.scores?.[k] ?? 10) + (race?.bonus?.[k] || 0) + (flex[k] || 0) + (def.asi?.[k] || 0)]));
}

export function hpBonus(def) {
  return mod(finalScores(def).cos) + (def.race === 'nano_colline' ? 1 : 0) + (def.classKey === 'stregone' ? 1 : 0);
}

export function computeHpMax(def, rolls) {
  const list = (rolls?.[def.classKey] || []).slice(0, def.level);
  const b = hpBonus(def);
  return list.reduce((s, r) => s + Math.max(1, r + b), 0);
}

export function ensureRolls(rolls, classKey, level) {
  const cur = [...(rolls?.[classKey] || [])];
  if (cur.length >= level) return rolls;
  while (cur.length < level) cur.push(rollDie(CLASSES[classKey].hd));
  return { ...(rolls || {}), [classKey]: cur };
}

const FULL = [[2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]];

export function spellSlots(classKey, level) {
  const c = CLASSES[classKey]?.caster;
  if (!c) return {};
  if (c.kind === 'pact') {
    const count = level >= 17 ? 4 : level >= 11 ? 3 : level >= 2 ? 2 : 1;
    return { [Math.min(5, Math.ceil(level / 2))]: count };
  }
  const row = c.half ? (level < 2 ? [] : FULL[Math.ceil(level / 2) - 1]) : FULL[level - 1];
  return Object.fromEntries(row.map((n, i) => [i + 1, n]));
}

export function maxSpellLevel(classKey, level) {
  const k = Object.keys(spellSlots(classKey, level)).map(Number);
  return k.length ? Math.min(3, Math.max(...k)) : 0;
}

export function spellInfo(def) {
  const c = CLASSES[def.classKey]?.caster;
  const lvl = def.level || 1;
  const elf = def.race === 'elfo_alto' ? 1 : 0;
  const tier = lvl >= 10 ? 2 : lvl >= 4 ? 1 : 0;
  const info = { kind: c?.kind || 'none', ability: c?.ability || (elf ? 'int' : null), active: !!c && !(c.half && lvl < 2), cantrips: elf + (c?.cantrips ? c.cantrips[tier] : 0), known: 0, prepared: 0, book: 0, maxLevel: 0 };
  if (!info.active) return info;
  const m = mod(finalScores(def)[c.ability]);
  info.maxLevel = maxSpellLevel(def.classKey, lvl);
  if (c.known) info.known = c.known[lvl - 1];
  if (c.kind === 'prepared') info.prepared = Math.max(1, m + (c.half ? Math.floor(lvl / 2) : lvl));
  if (c.kind === 'book') { info.book = 6 + 2 * (lvl - 1); info.prepared = Math.max(1, m + lvl); }
  return info;
}

export function classSpells(classKey, maxLevel, def) {
  const code = CLASSES[classKey]?.code;
  if (!code) return [];
  return SPELLS.filter((s) => s.level >= 1 && s.level <= maxLevel && (s.codes.includes(code) || (def?.path && s.codes.includes('N'))));
}

export function cantripOptions(def) {
  const cls = CLASSES[def.classKey];
  const own = cls?.caster?.cantrips ? cls.code : null;
  return SPELLS.filter((s) => s.level === 0 && ((own && s.codes.includes(own)) || (def.race === 'elfo_alto' && s.codes.includes('M')) || (def.path && s.codes.includes('N'))));
}

export const raceSkills = (def) => RACES[def.race]?.skills || [];
export const proficientSkills = (def) => [...new Set([...raceSkills(def), ...(def.skills || [])])];
export const languages = (def) => ['Comune', ...(RACES[def.race]?.languages || [])];
export const isAsiLevel = (classKey, level) => (ASI_LEVELS[classKey] || ASI_LEVELS.default).includes(level);

export function expertiseAllowed(classKey, level) {
  return Object.entries(EXPERTISE[classKey] || {}).reduce((s, [l, n]) => s + (level >= +l ? n : 0), 0);
}

export function asiSpent(def) {
  return ABILITY_KEYS.reduce((sum, key) => sum + (Number(def?.asi?.[key]) || 0), 0);
}

export function unspentAsiPoints(def) {
  if (!def?.classKey) return 0;
  return Math.max(0, asiPointsAt(def.classKey, def.level) - asiSpent(def));
}

export function unspentExpertiseSlots(def) {
  if (!def?.classKey) return 0;
  return Math.max(0, expertiseAllowed(def.classKey, def.level) - (def.expertise?.length || 0));
}

/** Scelta punti ancora da fare: dal level-up, oppure ricavata dai punti non spesi. */
export function pendingChoice(character) {
  if (character?.choice) {
    const choice = character.choice;
    const points = choice.asiPoints != null ? choice.asiPoints : (choice.asi ? 2 : 0);
    return { ...choice, asi: points > 0 || !!choice.asi, asiPoints: points, expertise: choice.expertise || 0 };
  }
  const def = character?.definition;
  if (!def) return null;
  const asiPoints = unspentAsiPoints(def);
  const expertise = unspentExpertiseSlots(def);
  if (!asiPoints && !expertise) return null;
  return { level: def.level, asi: asiPoints > 0, asiPoints, expertise };
}

export function skillBonus(def, name) {
  const skill = SKILLS.find((s) => s.name === name);
  const pb = profBonus(def.level);
  const prof = proficientSkills(def).includes(name) ? pb : 0;
  const exp = (def.expertise || []).includes(name) ? pb : 0;
  return mod(finalScores(def)[skill.ab]) + prof + exp;
}

export function classFeaturesAt(classKey, level) {
  return CLASSES[classKey]?.features?.[level] || [];
}

export function pickedFeatures(def) {
  const out = [];
  const sub = (SUBCLASSES[def.classKey] || []).find((item) => item.key === def.subclass);
  if (sub && def.level >= sub.level) out.push(sub.name);
  const path = PATHS.find((item) => item.key === def.path);
  if (path) out.push(path.name);
  return out;
}

export function autoFeatures(def) {
  const out = [...(RACES[def.race]?.traits || [])];
  for (let l = 1; l <= def.level; l++) out.push(...classFeaturesAt(def.classKey, l));
  out.push(...pickedFeatures(def));
  return [...new Set(out)];
}

export function defaultAC(def) {
  const s = finalScores(def);
  let ac = 10 + mod(s.des);
  if (def.classKey === 'barbaro') ac += mod(s.cos);
  if (def.classKey === 'monaco') ac += mod(s.sag);
  return ac;
}

export function classResources(def) {
  const l = def.level;
  const s = finalScores(def);
  switch (def.classKey) {
    case 'barbaro': return [{ name: 'Ira', max: l >= 17 ? 6 : l >= 12 ? 5 : l >= 6 ? 4 : l >= 3 ? 3 : 2, rest: 'lungo' }];
    case 'bardo': return [{ name: 'Ispirazione bardica', max: Math.max(1, mod(s.car)), rest: l >= 5 ? 'breve' : 'lungo' }];
    case 'chierico': return l >= 2 ? [{ name: 'Incanalare divinità', max: l >= 18 ? 3 : l >= 6 ? 2 : 1, rest: 'breve' }] : [];
    case 'druido': return l >= 2 ? [{ name: 'Forma selvatica', max: 2, rest: 'breve' }] : [];
    case 'guerriero': return [{ name: 'Recuperare energie', max: 1, rest: 'breve' }, ...(l >= 2 ? [{ name: 'Azione impetuosa', max: l >= 17 ? 2 : 1, rest: 'breve' }] : [])];
    case 'monaco': return l >= 2 ? [{ name: 'Punti ki', max: l, rest: 'breve' }] : [];
    case 'paladino': return [{ name: 'Imposizione delle mani (PF)', max: 5 * l, rest: 'lungo' }, ...(l >= 3 ? [{ name: 'Incanalare divinità', max: 1, rest: 'breve' }] : [])];
    case 'stregone': return l >= 2 ? [{ name: 'Punti stregoneria', max: l, rest: 'lungo' }] : [];
    case 'mago': return [{ name: 'Recupero arcano', max: 1, rest: 'lungo' }];
    default: return [];
  }
}

export const COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export function scoreCost(score) {
  const n = Number(score) || 8;
  if (n <= 15) return COST[n] ?? 99;
  return (COST[15] || 9) + (n - 15);
}

export function pointBuySpent(scores = {}) {
  return ABILITY_KEYS.reduce((sum, key) => sum + scoreCost(scores[key] ?? 8), 0);
}

export function asiPointsAt(classKey, level) {
  return (ASI_LEVELS[classKey] || ASI_LEVELS.default).filter((item) => item <= (level || 1)).length * 2;
}

/** Punti disponibili per i punteggi base in creazione/modifica: sempre 27. I punti del livello si assegnano dopo, in Caratteristiche. */
export function scoreBudget(def, role) {
  if (role === 'master') return null;
  return { creation: 27, fromLevel: 0, total: 27 };
}

export function basicErrors(def) {
  const e = [];
  if (!def.name?.trim()) e.push('Dai un nome al personaggio.');
  if (!RACES[def.race]) e.push('Scegli una razza.');
  if (!CLASSES[def.classKey]) e.push('Scegli una classe.');
  if (RACES[def.race]?.bonusMode === 'flex') {
    if (!def.lineage?.high || !def.lineage?.low) e.push('Assegna +2 e +1 a due caratteristiche diverse.');
    else if (def.lineage.high === def.lineage.low) e.push('Il +2 e il +1 vanno su caratteristiche diverse.');
  }
  if (def.subclass && !(SUBCLASSES[def.classKey] || []).some((item) => item.key === def.subclass)) e.push('Questa sottoclasse non appartiene alla classe.');
  if (def.path && !PATHS.some((item) => item.key === def.path)) e.push('Percorso sconosciuto.');
  return e;
}

export function validateRules(def, character) {
  const e = basicErrors(def);
  const cls = CLASSES[def.classKey];
  if (!cls || !RACES[def.race]) return e;
  const locked = character.closed && character.definition;
  if (locked && def.level !== character.definition.level) e.push('Il livello lo cambia solo il master.');
  if (!locked && def.level !== 1) e.push('Con le regole si parte dal 1° livello.');
  if (ABILITY_KEYS.some((k) => def.scores[k] < 8 || def.scores[k] > 15)) e.push('Con l’acquisto a punti ogni punteggio base va da 8 a 15.');
  else if (pointBuySpent(def.scores) > 27) e.push('Hai speso più di 27 punti.');
  const own = def.skills.filter((s) => !raceSkills(def).includes(s));
  if (own.some((s) => !cls.skills.includes(s))) e.push(`Alcune abilità non sono nella lista del ${cls.name.toLowerCase()}.`);
  if (own.length !== cls.skillCount) e.push(`Scegli ${cls.skillCount} abilità della classe (ora ${own.length}).`);
  const exp = expertiseAllowed(def.classKey, def.level);
  if (def.expertise.length !== exp) e.push(exp ? `Scegli ${exp} abilità per la maestria.` : 'La tua classe non ha maestria a questo livello.');
  if (def.expertise.some((s) => !proficientSkills(def).includes(s))) e.push('La maestria vale solo per abilità in cui sei competente.');
  const info = spellInfo(def);
  const cOpts = new Set(cantripOptions(def).map((s) => s.name));
  if (def.cantrips.length > info.cantrips) e.push(`Puoi avere al massimo ${info.cantrips} trucchetti.`);
  if (def.cantrips.some((n) => !cOpts.has(n))) e.push('Alcuni trucchetti non sono nella tua lista.');
  const sOpts = new Set(classSpells(def.classKey, info.maxLevel, def).map((s) => s.name));
  if (def.spells.some((n) => !sOpts.has(n))) e.push('Alcuni incantesimi non sono nella lista o superano il livello che puoi lanciare.');
  const limit = info.kind === 'book' ? info.book : info.kind === 'prepared' ? info.prepared : info.known;
  if (def.spells.length > limit) e.push(`Puoi avere al massimo ${limit} incantesimi.`);
  if (info.kind === 'book') {
    if (def.prepared.some((n) => !def.spells.includes(n))) e.push('Si preparano solo incantesimi del libro.');
    if (def.prepared.length > info.prepared) e.push(`Puoi avere al massimo ${info.prepared} incantesimi pronti oggi.`);
  }
  if (def.extraSpells?.length) e.push('Con le regole non si aggiungono incantesimi fuori lista.');
  return e;
}

const listDiff = (label, a = [], b = []) => {
  const added = b.filter((x) => !a.includes(x));
  const removed = a.filter((x) => !b.includes(x));
  return added.length || removed.length ? { label, added, removed } : null;
};

export function diffDefinitions(a, b) {
  a = a || {};
  const out = [];
  const val = (label, x, y) => { if ((x ?? '') !== (y ?? '')) out.push({ label, from: x ?? '—', to: y ?? '—' }); };
  val('Nome', a.name, b.name);
  val('Razza', RACES[a.race]?.name, RACES[b.race]?.name);
  val('Classe', CLASSES[a.classKey]?.name, CLASSES[b.classKey]?.name);
  val('Livello', a.level != null ? String(a.level) : undefined, String(b.level));
  const fa = a.scores ? finalScores(a) : {};
  const fb = finalScores(b);
  ABILITIES.forEach((ab) => val(ab.label, fa[ab.key] != null ? String(fa[ab.key]) : undefined, String(fb[ab.key])));
  [['Competenze', 'skills'], ['Maestria', 'expertise'], ['Trucchetti', 'cantrips'], ['Incantesimi', 'spells'], ['Pronti oggi', 'prepared'], ['Privilegi', 'features']]
    .forEach(([l, k]) => { const d = listDiff(l, a[k], b[k]); if (d) out.push(d); });
  const ex = (s) => (s || []).map((x) => `${x.name} (${x.level ? `${x.level}°` : 'trucchetto'})${x.effect ? `: ${x.effect}` : ''}`);
  const d = listDiff('Fuori lista', ex(a.extraSpells), ex(b.extraSpells));
  if (d) out.push(d);
  val('Sottoclasse', a.subclass || undefined, b.subclass || undefined);
  val('Percorso', a.path || undefined, b.path || undefined);
  val('PF massimi', a.hpMax != null ? String(a.hpMax) : undefined, String(b.hpMax));
  return out;
}

export function diffState(before = {}, after = {}) {
  const out = [];
  const val = (label, x, y) => { if (String(x ?? '') !== String(y ?? '')) out.push({ label, from: x == null || x === '' ? '—' : String(x), to: y == null || y === '' ? '—' : String(y) }); };
  val('Aspetto', before.appearance, after.appearance);
  val('Classe armatura', before.ac, after.ac);
  val('PF temporanei', before.tempHp || 0, after.tempHp || 0);
  val('Ispirazione', before.inspiration ? 'sì' : 'no', after.inspiration ? 'sì' : 'no');
  val('Concentrazione', before.concentration, after.concentration);
  val('Esaurimento', before.exhaustion || 0, after.exhaustion || 0);
  val('Dadi vita spesi', before.hitDiceSpent || 0, after.hitDiceSpent || 0);
  val('Zaino', before.equipment, after.equipment);
  val('Note', before.notes, after.notes);
  const coins = (c = {}) => ['mr', 'ma', 'me', 'mo', 'mp'].map((k) => c[k] || 0).join('/');
  val('Monete', coins(before.coins), coins(after.coins));
  const list = (items) => (items || []).map((item) => item.name || item).join(', ');
  val('Armi', list(before.weapons), list(after.weapons));
  val('Condizioni', (before.conditions || []).join(', '), (after.conditions || []).join(', '));
  val('Slot usati', JSON.stringify(before.slotsUsed || {}), JSON.stringify(after.slotsUsed || {}));
  val('Risorse usate', JSON.stringify(before.resourcesUsed || {}), JSON.stringify(after.resourcesUsed || {}));
  return out.filter((row) => row.label !== 'Slot usati' && row.label !== 'Risorse usate' ? true : row.from !== row.to);
}