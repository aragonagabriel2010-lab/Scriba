import React from 'react';
import { RACES, CLASSES, SUBCLASSES, PATHS, ABILITIES } from '@/lib/dnd/data';
import { formatMeters, computeHpMax } from '@/lib/dnd/rules';
import ChoiceGrid from './ChoiceGrid';
import Stepper from '@/components/scriba/Stepper';

const groupsOf = (entries, bookOf) => {
  const groups = [];
  entries.forEach(([key, item]) => {
    const book = bookOf(item) || 'Manuale base';
    let group = groups.find((entry) => entry.book === book);
    if (!group) {
      group = { book, options: [] };
      groups.push(group);
    }
    group.options.push(key);
  });
  return groups;
};

export default function IdentityStep({ def, setDef, role, rolls }) {
  const editableLevel = role === 'master' || role === 'libera';
  const race = RACES[def.race];
  const cls = CLASSES[def.classKey];
  const subclasses = SUBCLASSES[def.classKey] || [];
  const raceGroups = groupsOf(Object.entries(RACES), (item) => item.book);
  const classGroups = groupsOf(Object.entries(CLASSES), (item) => item.book);
  const hpMax = cls ? computeHpMax(def, rolls) : 0;
  const setLineage = (slot, value) => setDef({ ...def, lineage: { ...(def.lineage || {}), [slot]: value } });

  return (
    <div className="space-y-8">
      <div>
        <label className="eyebrow">Nome del personaggio</label>
        <input value={def.name} onChange={(e) => setDef({ ...def, name: e.target.value.slice(0, 40) })} placeholder="Come si chiama?" className="scriba-input mt-2" />
      </div>
      <div>
        <p className="eyebrow mb-3">Razza</p>
        {raceGroups.map((group) => (
          <div key={group.book} className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">{group.book}</p>
            <ChoiceGrid options={group.options.map((key) => ({ value: key, label: RACES[key].name, sub: `Vel. ${formatMeters(RACES[key].speed)}` }))} value={def.race} onPick={(v) => setDef({ ...def, race: v })} />
          </div>
        ))}
        {race && <p className="mt-3 text-sm text-muted-foreground">{race.traits.join(' · ')}</p>}
        {race?.bonusMode === 'flex' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[['high', '+2'], ['low', '+1']].map(([slot, label]) => (
              <label key={slot} className="block">
                <span className="eyebrow">{label}</span>
                <select value={def.lineage?.[slot] || ''} onChange={(e) => setLineage(slot, e.target.value)} className="scriba-input mt-2">
                  <option value="">Caratteristica</option>
                  {ABILITIES.map((ab) => <option key={ab.key} value={ab.key}>{ab.label}</option>)}
                </select>
              </label>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="eyebrow mb-3">Classe</p>
        {classGroups.map((group) => (
          <div key={group.book} className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">{group.book}</p>
            <ChoiceGrid options={group.options.map((key) => ({ value: key, label: CLASSES[key].name, sub: `Dado vita d${CLASSES[key].hd}` }))} value={def.classKey} onPick={(v) => setDef({ ...def, classKey: v, subclass: null })} />
          </div>
        ))}
      </div>
      {subclasses.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Sottoclasse</p>
          <ChoiceGrid options={subclasses.map((item) => ({ value: item.key, label: item.name, sub: item.book }))} value={def.subclass} onPick={(v) => setDef({ ...def, subclass: v })} />
          <p className="mt-3 text-xs text-muted-foreground">Il privilegio entra in scheda dal 3° livello.</p>
        </div>
      )}
      <div>
        <p className="eyebrow mb-3">Percorso, Nymphology</p>
        <p className="text-sm text-muted-foreground mb-3">Opzionale, per adulti consenzienti. Non sostituisce la classe. Aggiunge qualche magia blu, senza i testi del volume.</p>
        <ChoiceGrid options={[{ value: '', label: 'Nessuno', sub: 'Solo classe e sottoclasse' }, ...PATHS.map((item) => ({ value: item.key, label: item.name, sub: item.line }))]} value={def.path || ''} onPick={(v) => setDef({ ...def, path: v || null })} />
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