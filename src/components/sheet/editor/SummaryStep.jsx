import React from 'react';
import { RACES, CLASSES, SUBCLASSES, PATHS } from '@/lib/dnd/data';
import { autoFeatures, computeHpMax, diffDefinitions } from '@/lib/dnd/rules';
import ChangeLines from '@/components/scriba/ChangeLines';

export default function SummaryStep({ def, character, role, setDef }) {
  const isMaster = role === 'master';
  const oldDef = character.definition;
  const changes = oldDef ? diffDefinitions(oldDef, def) : [];
  const features = def.features?.length ? def.features : autoFeatures(def);
  const hpMax = computeHpMax(def, character.hp_rolls);

  const setHpMax = (v) => setDef({ ...def, hpMax: v });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-4 space-y-1">
        <p className="font-display text-2xl">{def.name || 'Senza nome'}</p>
        <p className="text-sm text-muted-foreground">{def.race && def.classKey ? `${RACES[def.race]?.name} · ${CLASSES[def.classKey]?.name}${def.subclass ? ` · ${(SUBCLASSES[def.classKey] || []).find((item) => item.key === def.subclass)?.name || ''}` : ''}${def.path ? ` · ${PATHS.find((item) => item.key === def.path)?.name || ''}` : ''} · liv. ${def.level}` : 'Completa identità'}</p>
        <p className="text-sm text-muted-foreground">PF massimi: <span className="text-foreground tabular-nums">{hpMax}</span></p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Privilegi e tratti</p>
        </div>
        <ul className="space-y-1 text-sm">
          {features.map((f, i) => <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">·</span>{typeof f === 'string' ? f : f.name}</li>)}
        </ul>
        {(def.customFeatures || []).map((f) => (
          <p key={f.id} className="mt-1 text-sm text-muted-foreground">· {f.name} <span className="text-xs">(aggiunto dal master)</span></p>
        ))}
        {!isMaster && (
          <p className="mt-2 text-xs text-muted-foreground">Solo il master può aggiungere privilegi e tratti dalla scheda.</p>
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
