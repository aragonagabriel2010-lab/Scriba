import React, { useState } from 'react';
import { CLASSES } from '@/lib/dnd/data';
import { SPELLS } from '@/lib/dnd/spells';
import { spellInfo, spellSlots, cantripOptions, classSpells } from '@/lib/dnd/rules';
import SpellPicker from './SpellPicker';
import ExtraSpells from './ExtraSpells';

const levelLabel = (n) => (n === 0 ? 'Trucchetti' : `${n}°`);

export default function MagicStep({ def, setDef, role }) {
  const cls = CLASSES[def.classKey];
  if (!cls) return <p className="text-sm text-muted-foreground">Scegli prima la classe.</p>;

  const rulesMode = role === 'regole';
  const freeMode = role === 'libera' || role === 'master';
  const info = spellInfo(def);
  const isCaster = info.kind !== 'none' && !(cls.caster?.half && !info.active);
  const [useMagic, setUseMagic] = useState(() => isCaster || !!(def.cantrips?.length || def.spells?.length || def.extraSpells?.length));

  if (rulesMode && !isCaster) {
    return <p className="text-sm text-muted-foreground">{cls.caster?.half ? 'Prepara gli incantesimi dal 2° livello.' : `${cls.name} non lancia incantesimi.`}</p>;
  }

  if (freeMode && !isCaster && !useMagic) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {cls.name} di solito non lancia. In personaggio libero puoi comunque aggiungere trucchetti, magie o inventarne di tue.
        </p>
        <button type="button" onClick={() => setUseMagic(true)} className="btn-primary">Aggiungi magie o trucchetti</button>
      </div>
    );
  }

  const maxLvl = rulesMode ? info.maxLevel : 9;
  const cOpts = isCaster ? cantripOptions(def) : SPELLS.filter((s) => s.level === 0);
  const sOpts = isCaster ? classSpells(def.classKey, maxLvl, def) : SPELLS.filter((s) => s.level >= 1 && s.level <= Math.min(maxLvl, 3));
  const slots = isCaster ? spellSlots(def.classKey, def.level) : {};
  const cantripMax = rulesMode ? info.cantrips : undefined;
  const spellMax = rulesMode
    ? (info.kind === 'book' ? info.book : info.kind === 'prepared' ? info.prepared : info.known)
    : undefined;

  const toggle = (key, max) => (name) => {
    const cur = def[key] || [];
    const has = cur.includes(name);
    if (has) setDef({ ...def, [key]: cur.filter((s) => s !== name) });
    else if (!max || cur.length < max) setDef({ ...def, [key]: [...cur, name] });
  };

  return (
    <div className="space-y-6">
      {isCaster ? (
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
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Magia opzionale. Puoi scegliere dalla lista o inventare trucchetti e incantesimi, scrivendo cosa fanno.
        </p>
      )}

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

      <SpellPicker label="Trucchetti" options={cOpts} selected={def.cantrips || []} onToggle={toggle('cantrips', cantripMax)} max={cantripMax} />

      {isCaster && info.kind === 'book' && (
        <>
          <SpellPicker label="Libro degli incantesimi" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', spellMax)} max={spellMax} />
          <SpellPicker label="Pronti oggi" options={sOpts.filter((s) => (def.spells || []).includes(s.name))} selected={def.prepared || []} onToggle={toggle('prepared', info.prepared)} max={info.prepared} />
        </>
      )}
      {isCaster && info.kind === 'prepared' && (
        <SpellPicker label="Pronti oggi" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', spellMax)} max={spellMax} />
      )}
      {isCaster && (info.kind === 'known' || info.kind === 'pact') && (
        <SpellPicker label="Incantesimi conosciuti" options={sOpts} selected={def.spells || []} onToggle={toggle('spells', spellMax)} max={spellMax} />
      )}
      {!isCaster && (
        <SpellPicker label="Incantesimi" options={sOpts} selected={def.spells || []} onToggle={toggle('spells')} />
      )}

      {!rulesMode && <ExtraSpells def={def} setDef={setDef} />}
    </div>
  );
}
