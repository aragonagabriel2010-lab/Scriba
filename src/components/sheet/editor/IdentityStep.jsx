import React from 'react';
import { RACES, CLASSES } from '@/lib/dnd/data';
import { formatMeters, computeHpMax } from '@/lib/dnd/rules';
import ChoiceGrid from './ChoiceGrid';
import Stepper from '@/components/scriba/Stepper';

export default function IdentityStep({ def, setDef, role, rolls }) {
  const editableLevel = role === 'master' || role === 'libera';
  const race = RACES[def.race];
  const cls = CLASSES[def.classKey];
  const races = Object.entries(RACES).map(([k, r]) => ({ value: k, label: r.name, sub: `Vel. ${formatMeters(r.speed)}` }));
  const classes = Object.entries(CLASSES).map(([k, c]) => ({ value: k, label: c.name, sub: `Dado vita d${c.hd}` }));
  const hpMax = cls ? computeHpMax(def, rolls) : 0;

  return (
    <div className="space-y-8">
      <div>
        <label className="eyebrow">Nome del personaggio</label>
        <input value={def.name} onChange={(e) => setDef({ ...def, name: e.target.value.slice(0, 40) })} placeholder="Come si chiama?" className="scriba-input mt-2" />
      </div>
      <div>
        <p className="eyebrow mb-3">Razza</p>
        <ChoiceGrid options={races} value={def.race} onPick={(v) => setDef({ ...def, race: v })} />
        {race && <p className="mt-3 text-sm text-muted-foreground">{race.traits.join(' · ')}</p>}
      </div>
      <div>
        <p className="eyebrow mb-3">Classe</p>
        <ChoiceGrid options={classes} value={def.classKey} onPick={(v) => setDef({ ...def, classKey: v })} />
      </div>
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="eyebrow mb-2">Livello</p>
          {editableLevel ? (
            <Stepper value={def.level} min={1} max={20} onChange={(v) => setDef({ ...def, level: v })} />
          ) : (
            <p className="text-foreground">{def.level} <span className="text-xs text-muted-foreground">(lo cambia il master)</span></p>
          )}
        </div>
        {cls && (
          <div className="text-sm text-muted-foreground">
            Dado vita d{cls.hd}
            {rolls?.[def.classKey]?.length > 0 && <> · tiri: {rolls[def.classKey].slice(0, def.level).join(', ')}</>}
            <br />PF massimi: <span className="text-foreground tabular-nums">{hpMax}</span>
          </div>
        )}
      </div>
    </div>
  );
}