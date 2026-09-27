import React from 'react';
import { CLASSES } from '@/lib/dnd/data';
import { spellInfo, spellSlots, cantripOptions, classSpells } from '@/lib/dnd/rules';
import SpellPicker from './SpellPicker';
import ExtraSpells from './ExtraSpells';
import Section from '@/components/scriba/Section';

const levelLabel = (n) => (n === 0 ? 'Trucchetti' : `${n}°`);

export default function MagicStep({ def, setDef, role }) {
  const cls = CLASSES[def.classKey];
  if (!cls) return <p className="text-sm text-muted-foreground">Scegli prima la classe.</p>;
  const info = spellInfo(def);
  const rulesMode = role === 'regole';
  const maxLvl = rulesMode ? info.maxLevel : 3;

  if (info.kind === 'none' || (cls.caster?.half && !info.active)) {
    return <p className="text-sm text-muted-foreground">{cls.caster?.half ? 'Prepara gli incantesimi dal 2° livello.' : `${cls.name} non lancia incantesimi.`}</p>;
  }

  const cOpts = cantripOptions(def);
  const sOpts = classSpells(def.classKey, maxLvl);
  const slots = spellSlots(def.classKey, def.level);
  const toggle = (key, list, max) => (name) => {
    const cur = def[key] || [];
    const has = cur.includes(name);
    if (has) setDef({ ...def, [key]: cur.filter((s) => s !== name) });
    else if (!max || cur.length < max) setDef({ ...def, [key]: [...cur, name] });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        <span className="text-foreground">{cls.name}</span> · incantatore di {info.ability === 'int' ? 'Intelligenza' : info.ability === 'car' ? 'Carisma' : 'Saggezza'}.
        {' '}
        {info.kind === 'book' && 'Dal tuo libro prepari ogni giorno gli incantesimi che vuoi avere pronti.'}
        {info.kind === 'prepared' && 'Prepari ogni giorno i tuoi incantesimi della lista di classe.'}
        {info.kind === 'known' && 'Conosci un numero fisso di incantesimi, cambiabili quando sali di livello.'}
        {info.kind === 'pact' && 'I tuoi slot sono di livello più alto e tornano al riposo breve.'}
        {' '}
        I trucchetti non usano slot.
      </p>

      {Object.keys(slots).length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <p className="eyebrow mb-2">Slot incantesimo</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(slots).map(([lvl, n]) => (
              <div key={lvl} className="text-center">
                <p className="text-[10px] uppercase text-muted-foreground">{levelLabel(+lvl)}</p>
                <p className="text-lg tabular-nums">{n}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SpellPicker label="Trucchetti" options={cOpts} selected={def.cantrips || []} onToggle={toggle('cantrips', info.cantrips)} max={info.cantrips} />

      {info.kind === 'book' && (
        <>
          <SpellPicker label="Libro degli incantesimi" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', info.book)} max={info.book} />
          <SpellPicker label="Pronti oggi" options={sOpts.filter((s) => (def.spells || []).includes(s.name))} selected={def.prepared || []} onToggle={toggle('prepared', info.prepared)} max={info.prepared} />
        </>
      )}
      {info.kind === 'prepared' && (
        <SpellPicker label="Pronti oggi" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', info.prepared)} max={info.prepared} />
      )}
      {(info.kind === 'known' || info.kind === 'pact') && (
        <SpellPicker label="Incantesimi conosciuti" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', info.known)} max={info.known} />
      )}

      {!rulesMode && <ExtraSpells def={def} setDef={setDef} />}
    </div>
  );
}