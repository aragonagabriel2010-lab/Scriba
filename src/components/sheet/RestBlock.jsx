import React, { useState } from 'react';
import Section from '@/components/scriba/Section';
import { CLASSES } from '@/lib/dnd/data';
import { classResources, rollDie, mod, finalScores } from '@/lib/dnd/rules';

export default function RestBlock({ def, state, onUpdate, onSpend, isMaster }) {
  const [result, setResult] = useState(null);
  const cls = CLASSES[def.classKey];
  const remaining = def.level - (state.hitDiceSpent || 0);

  const spend = () => {
    if (remaining <= 0) return;
    const roll = rollDie(cls.hd);
    const heal = Math.max(1, roll + mod(finalScores(def).cos));
    const next = {
      ...state,
      hitDiceSpent: (state.hitDiceSpent || 0) + 1,
      hp: Math.min(def.hpMax, (state.hp ?? def.hpMax) + heal),
    };
    (onSpend || onUpdate)(next);
    setResult({ roll, heal });
  };

  const shortRest = () => {
    const upd = { slotsUsed: {} };
    classResources(def).filter((r) => r.rest === 'breve').forEach((r) => { upd.resourcesUsed = { ...upd.resourcesUsed, [r.name]: 0 }; });
    if (cls.caster?.kind === 'pact') upd.slotsUsed = {};
    onUpdate(upd);
  };

  const longRest = () => {
    const half = Math.max(1, Math.floor(def.level / 2));
    const resources = {};
    classResources(def).forEach((r) => { resources[r.name] = 0; });
    onUpdate({
      ...(isMaster ? { hp: def.hpMax } : {}),
      tempHp: 0,
      slotsUsed: {},
      resourcesUsed: resources,
      hitDiceSpent: Math.min(def.level - half, state.hitDiceSpent || 0),
      exhaustion: Math.max(0, (state.exhaustion || 0) - 1),
    });
  };

  return (
    <Section title="Riposo">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={spend} disabled={remaining <= 0} className="btn-ghost h-9 px-4 text-sm">Spendi d{cls.hd}</button>
        <span className="text-sm text-muted-foreground">Dadi vita: <span className="text-foreground tabular-nums">{remaining}</span> / {def.level}</span>
        {result && <span className="text-sm text-primary">d{cls.hd}: {result.roll} → +{result.heal} PF</span>}
        <div className="flex-1" />
        <button onClick={shortRest} className="btn-ghost h-9 px-4 text-xs">Fine riposo breve</button>
        <button onClick={longRest} className="btn-primary h-9 px-4 text-xs">Riposo lungo</button>
      </div>
      <div className="mt-5">
        <p className="eyebrow mb-3">Risorse</p>
        {classResources(def).length ? (
          <div className="space-y-3">
            {classResources(def).map((r) => {
              const used = state.resourcesUsed?.[r.name] || 0;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-sm flex-1">{r.name}</span>
                  {r.max <= 10 ? (
                    <div className="flex gap-1">
                      {Array.from({ length: r.max }).map((_, i) => (
                        <button key={i} onClick={() => onUpdate({ resourcesUsed: { ...state.resourcesUsed, [r.name]: i < used ? i : i + 1 === used ? i + 1 : i } })}
                          className={`w-4 h-4 rounded-full border transition ${i < used ? 'bg-transparent border-border' : 'border-primary/60 bg-primary/30'}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdate({ resourcesUsed: { ...state.resourcesUsed, [r.name]: Math.max(0, used - 1) } })} className="step-btn h-7 w-7">−</button>
                      <span className="text-sm tabular-nums w-12 text-center">{r.max - used} / {r.max}</span>
                      <button onClick={() => onUpdate({ resourcesUsed: { ...state.resourcesUsed, [r.name]: Math.min(r.max, used + 1) } })} className="step-btn h-7 w-7">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Nessuna risorsa speciale al 1° livello.</p>}
      </div>
    </Section>
  );
}