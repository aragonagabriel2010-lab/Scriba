import React from 'react';
import { ABILITIES, RACES } from '@/lib/dnd/data';
import { mod, signed, COST, pointBuySpent } from '@/lib/dnd/rules';
import Stepper from '@/components/scriba/Stepper';

const BUDGET = 27;

export default function ScoresStep({ def, setDef, role }) {
  // Master può forzare qualsiasi valore; regole e personaggio libero usano l’acquisto a punti.
  const budgetMode = role !== 'master';
  const min = budgetMode ? 8 : 3;
  const max = budgetMode ? 15 : 20;
  const race = RACES[def.race];
  const spent = pointBuySpent(def.scores);
  const remaining = budgetMode ? Math.max(0, BUDGET - spent) : null;

  const set = (k, v) => {
    let next = Math.max(min, Math.min(max, v));
    if (budgetMode) {
      const trial = { ...def.scores, [k]: next };
      while (next > (def.scores[k] ?? min) && pointBuySpent(trial) > BUDGET) {
        next -= 1;
        trial[k] = next;
      }
    }
    setDef({ ...def, scores: { ...def.scores, [k]: next } });
  };

  return (
    <div className="space-y-5">
      {budgetMode && (
        <div className={`rounded-xl border p-4 ${remaining === 0 ? 'border-primary/40 bg-primary/5' : remaining <= 3 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-muted/30'}`}>
          <p className="eyebrow">Acquisto a punti</p>
          <p className="mt-2 font-display text-3xl tabular-nums">
            {remaining} <span className="text-lg text-muted-foreground">/ {BUDGET}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Punti rimasti. Ogni punteggio base va da 8 a 15; non puoi scendere sotto zero.
          </p>
        </div>
      )}
      {ABILITIES.map((ab) => {
        const base = def.scores[ab.key];
        const bonus = (race?.bonus?.[ab.key] || 0) + (def.lineage?.high === ab.key ? 2 : 0) + (def.lineage?.low === ab.key && def.lineage?.low !== def.lineage?.high ? 1 : 0);
        const final = base + bonus + (def.asi?.[ab.key] || 0);
        const nextCost = budgetMode && base < max && COST[base + 1] != null ? COST[base + 1] - (COST[base] || 0) : 0;
        const canInc = !budgetMode || (base < max && nextCost <= remaining);
        return (
          <div key={ab.key} className="flex items-center gap-4 py-2 border-b border-border/50">
            <div className="w-32">
              <p className="text-sm">{ab.label}</p>
              <p className="text-[10px] uppercase text-muted-foreground">{ab.short}</p>
            </div>
            <Stepper value={base} min={min} max={max} canInc={canInc} onChange={(v) => set(ab.key, v)} />
            {budgetMode && base < max && (
              <span className={`text-xs tabular-nums ${canInc ? 'text-muted-foreground' : 'text-destructive/80'}`}>
                +{nextCost} pt
              </span>
            )}
            {bonus > 0 && <span className="text-xs text-emerald-400">+{bonus} razza</span>}
            <div className="flex-1 text-right">
              <span className="font-display text-2xl tabular-nums">{signed(mod(final))}</span>
              <span className="ml-2 text-sm text-muted-foreground tabular-nums">{final}</span>
            </div>
          </div>
        );
      })}
      {role === 'master' && <p className="text-xs text-muted-foreground/70">Come master puoi impostare i punteggi senza limite di punti.</p>}
    </div>
  );
}
