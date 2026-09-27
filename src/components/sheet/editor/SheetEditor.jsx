import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RACES, CLASSES } from '@/lib/dnd/data';
import { SPELLS } from '@/lib/dnd/spells';
import { blankDefinition, validateRules, basicErrors, computeHpMax, ensureRolls, autoFeatures } from '@/lib/dnd/rules';
import IdentityStep from './IdentityStep';
import ScoresStep from './ScoresStep';
import SkillsStep from './SkillsStep';
import MagicStep from './MagicStep';
import SummaryStep from './SummaryStep';

const STEPS = ['Identità', 'Punteggi', 'Competenze', 'Magia', 'Riepilogo'];

export default function SheetEditor({ character, initial, role, onSubmit, onClose, busy, error }) {
  const [def, setDef] = useState(initial ? JSON.parse(JSON.stringify(initial)) : blankDefinition(character.mode || 'regole', character.player_name));
  const [step, setStep] = useState(0);
  const [rolls, setRolls] = useState(character.hp_rolls || {});
  const [localError, setLocalError] = useState('');
  const rolledRef = useRef(false);

  // keep hp_rolls synced on the character so rolls persist across editor open/close
  const persistRolls = (r) => { setRolls(r); character.hp_rolls = r; };

  const recompute = (next, r = rolls) => {
    if (RACES[next.race] && CLASSES[next.classKey]) {
      next.hpMax = computeHpMax(next, r);
    }
    return next;
  };

  // ensure rolls exist for the current class/level
  useEffect(() => {
    if (!def.classKey || rolledRef.current) return;
    rolledRef.current = true;
    const r = ensureRolls(rolls, def.classKey, def.level);
    if (r !== rolls) { persistRolls(r); setDef((d) => recompute({ ...d }, r)); }
  }, [def.classKey]);

  const setClass = (classKey) => {
    if (!classKey) { setDef({ ...def, classKey: null, subclass: null }); return; }
    let r = rolls;
    if (!r[classKey] || r[classKey].length < def.level) {
      r = ensureRolls(r, classKey, def.level);
      persistRolls(r);
    }
    // filter spells to new class
    const allowed = new Set(SPELLS.filter((s) => s.codes.includes(CLASSES[classKey].code) || (def.path && s.codes.includes('N'))).map((s) => s.name));
    const next = { ...def, classKey, subclass: null, spells: (def.spells || []).filter((s) => allowed.has(s)), prepared: (def.prepared || []).filter((s) => allowed.has(s)), cantrips: (def.cantrips || []).filter((s) => allowed.has(s)) };
    setDef(recompute(next, r));
  };

  const setRace = (race) => { setDef(recompute({ ...def, race })); };
  const setLevel = (level) => {
    let r = rolls;
    if (def.classKey && (!r[def.classKey] || r[def.classKey].length < level)) {
      r = ensureRolls(r, def.classKey, level);
      persistRolls(r);
    }
    setDef(recompute({ ...def, level }, r));
  };

  // wrap setDef so identity changes recompute hp
  const update = (next) => {
    if (next.classKey !== def.classKey) return setClass(next.classKey);
    if (next.race !== def.race) return setRace(next.race);
    if (next.level !== def.level) return setLevel(next.level);
    if (next.scores && next.scores !== def.scores) next = recompute(next);
    setDef(next);
  };

  const canNext = def.race && def.classKey && def.name?.trim();
  const submit = () => {
    setLocalError('');
    const rulesMode = role === 'regole';
    if (rulesMode) {
      const errs = validateRules(def, character);
      if (errs.length) { setLocalError(errs[0]); setStep(4); return; }
      onSubmit({ ...def, features: autoFeatures(def), hpMax: computeHpMax(def, rolls) });
    } else if (role === 'master') {
      const { _hp, ...rest } = def;
      onSubmit({ ...rest, features: rest.features?.length ? rest.features : autoFeatures(def), hpMax: rest.hpMax ?? computeHpMax(def, rolls) }, _hp);
    } else {
      if (!def.name?.trim() || !def.race || !def.classKey) { setLocalError('Completa nome, razza e classe.'); setStep(0); return; }
      onSubmit({ ...def, hpMax: computeHpMax(def, rolls) });
    }
  };

  const label = role === 'master' ? 'Applica subito' : 'Invia al master';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between px-5 h-14 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        <p className="text-sm">{role === 'master' ? 'Modifica tutta la scheda' : character.closed ? 'Modifica la scheda' : 'Crea la scheda'}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{step + 1}/{STEPS.length}</p>
      </div>
      <div className="flex gap-1 px-5 pt-3">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-0.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl mb-6">{STEPS[step]}</h2>
          {step === 0 && <IdentityStep def={def} setDef={update} role={role} rolls={rolls} />}
          {step === 1 && <ScoresStep def={def} setDef={update} role={role} />}
          {step === 2 && <SkillsStep def={def} setDef={update} role={role} />}
          {step === 3 && <MagicStep def={def} setDef={update} role={role} />}
          {step === 4 && <SummaryStep def={def} character={character} role={role} setDef={update} />}
        </div>
      </div>
      <div className="border-t border-border px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="btn-ghost h-11 px-4"><ChevronLeft className="w-4 h-4" /> Indietro</button>}
          </div>
          <div className="flex items-center gap-3">
            {(localError || error) && <span className="text-sm text-destructive">{localError || error}</span>}
            {step < STEPS.length - 1 ? (
              <button disabled={!canNext} onClick={() => setStep(step + 1)} className="btn-primary">Avanti <ChevronRight className="w-4 h-4" /></button>
            ) : (
              <button disabled={busy} onClick={submit} className="btn-primary">{busy ? 'Un attimo…' : label}</button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}