import React from 'react';
import { autoFeatures, computeHpMax, diffDefinitions } from '@/lib/dnd/rules';
import ChangeLines from '@/components/scriba/ChangeLines';
import { Plus, X } from 'lucide-react';

export default function SummaryStep({ def, character, role, setDef }) {
  const rulesMode = role === 'regole';
  const isMaster = role === 'master';
  const oldDef = character.definition;
  const changes = oldDef ? diffDefinitions(oldDef, def) : [];
  const features = def.features?.length ? def.features : autoFeatures(def);
  const hpMax = computeHpMax(def, character.hp_rolls);

  const setHpMax = (v) => setDef({ ...def, hpMax: v });
  const addFeat = () => setDef({ ...def, features: [...(def.features || autoFeatures(def)), 'Nuovo privilegio'] });
  const setFeat = (i, v) => setDef({ ...def, features: def.features.map((f, j) => (j === i ? v : f)) });
  const delFeat = (i) => setDef({ ...def, features: def.features.filter((_, j) => j !== i) });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-4 space-y-1">
        <p className="font-display text-2xl">{def.name || 'Senza nome'}</p>
        <p className="text-sm text-muted-foreground">{def.race && def.classKey ? `${def.race} · ${def.classKey} · liv. ${def.level}` : 'Completa identità'}</p>
        <p className="text-sm text-muted-foreground">PF massimi: <span className="text-foreground tabular-nums">{hpMax}</span></p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Privilegi e tratti</p>
          {!rulesMode && <button onClick={addFeat} className="text-xs text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Aggiungi</button>}
        </div>
        {rulesMode ? (
          <ul className="space-y-1 text-sm">
            {features.map((f, i) => <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">·</span>{f}</li>)}
          </ul>
        ) : (
          <ul className="space-y-1.5">
            {(def.features || features).map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <input value={f} onChange={(e) => setFeat(i, e.target.value)} className="flex-1 rounded-lg bg-muted/40 border border-border px-2 py-1 text-sm focus:outline-none focus:border-primary/60" />
                <button onClick={() => delFeat(i)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isMaster && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow">PF massimi</span>
            <input type="number" value={def.hpMax ?? hpMax} onChange={(e) => setHpMax(+e.target.value)} className="scriba-input mt-1 h-10" />
          </label>
          <label className="block">
            <span className="eyebrow">PF attuali</span>
            <input type="number" value={character.state?.hp ?? hpMax} onChange={(e) => setDef({ ...def, _hp: +e.target.value })} className="scriba-input mt-1 h-10" />
          </label>
        </div>
      )}

      {oldDef && changes.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <p className="eyebrow mb-2">Cosa cambia</p>
          <ChangeLines changes={changes} />
        </div>
      )}
    </div>
  );
}