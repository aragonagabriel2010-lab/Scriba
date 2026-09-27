import React from 'react';
import { ABILITIES, RACES } from '@/lib/dnd/data';
import { mod, signed, COST, pointBuySpent } from '@/lib/dnd/rules';
import Stepper from '@/components/scriba/Stepper';

export default function ScoresStep({ def, setDef, role }) {
  const rulesMode = role === 'regole';
  const min = rulesMode ? 8 : 3;
  const max = rulesMode ? 15 : 20;
  const race = RACES[def.race];
  const spent = pointBuySpent(def.scores);
  const set = (k, v) => setDef({ ...def, scores: { ...def.scores, [k]: v } });

  return (
    <div className="space-y-5">
      {rulesMode && (
        <p className="text-sm text-muted-foreground">Acquisto a punti: ogni punteggio base da 8 a 15. Punti rimasti: <span className="text-foreground tabular-nums">{27 - spent}</span>.</p>
      )}
      {ABILITIES.map((ab) => {
        const base = def.scores[ab.key];
        const bonus = (race?.bonus?.[ab.key] || 0) + (def.lineage?.high === ab.key ? 2 : 0) + (def.lineage?.low === ab.key && def.lineage?.low !== def.lineage?.high ? 1 : 0);
        const final = base + bonus + (def.asi?.[ab.key] || 0);
        const nextCost = rulesMode && base < max ? COST[base + 1] - COST[base] : 0;
        const canInc = !rulesMode || (base < max && spent + nextCost <= 27);
        return (
          <div key={ab.key} className="flex items-center gap-4 py-2 border-b border-border/50">
            <div className="w-32">
              <p className="text-sm">{ab.label}</p>
              <p className="text-[10px] uppercase text-muted-foreground">{ab.short}</p>
            </div>
            <Stepper value={base} min={min} max={max} canInc={canInc} onChange={(v) => set(ab.key, v)} />
            {bonus > 0 && <span className="text-xs text-emerald-400">+{bonus} razza</span>}
            <div className="flex-1 text-right">
              <span className="font-display text-2xl tabular-nums">{signed(mod(final))}</span>
              <span className="ml-2 text-sm text-muted-foreground tabular-nums">{final}</span>
            </div>
          </div>
        );
      })}
      {!rulesMode && <p className="text-xs text-muted-foreground/70">Nel personaggio libero scegli i punteggi a mano, entro i limiti della razza.</p>}
    </div>
  );
}