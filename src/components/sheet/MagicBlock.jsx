import React from 'react';
import Section from '@/components/scriba/Section';
import { CLASSES } from '@/lib/dnd/data';
import { spellInfo, spellSlots, mod, signed, finalScores, languages } from '@/lib/dnd/rules';

const levelLabel = (n) => (n === 0 ? 'Trucchetti' : `${n}°`);

export default function MagicBlock({ def, state, onUpdate }) {
  const c = CLASSES[def.classKey];
  const info = spellInfo(def);
  if (!info.active) {
    const msg = c?.caster?.half ? 'Prepara gli incantesimi dal 2° livello.' : `${c?.name || 'Questa classe'} non lancia incantesimi.`;
    return <Section title="Magia"><p className="text-sm text-muted-foreground">{msg}</p></Section>;
  }
  const abilityName = { int: 'Intelligenza', car: 'Carisma', sag: 'Saggezza', des: 'Destrezza', for: 'Forza', cos: 'Costituzione' }[info.ability];
  const m = mod(finalScores(def)[info.ability]);
  const pb = 2 + Math.floor((def.level - 1) / 4);
  const dc = 8 + pb + m;
  const atk = pb + m;
  const slots = spellSlots(def.classKey, def.level);
  const isBook = info.kind === 'book';

  return (
    <Section title="Magia">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {c.name} · {abilityName}. CD incantesimo <span className="text-foreground tabular-nums">{dc}</span>, bonus colpo <span className="text-foreground tabular-nums">{signed(atk)}</span>.
      </p>
      <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed">
        {info.kind === 'book' && 'Dal libro prepari ogni giorno i tuoi incantesimi.'}
        {info.kind === 'prepared' && 'Prepari ogni giorno i tuoi incantesimi della classe.'}
        {info.kind === 'known' && 'Conosci i tuoi incantesimi.'}
        {info.kind === 'pact' && 'Gli slot tornano al riposo breve.'}
      </p>

      {Object.keys(slots).length > 0 && (
        <div className="mt-5 space-y-2">
          {Object.entries(slots).map(([lvl, n]) => {
            const used = state.slotsUsed?.[lvl] || 0;
            return (
              <div key={lvl} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{levelLabel(+lvl)}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: n }).map((_, i) => {
                    const isUsed = i < used;
                    return (
                      <button key={i} onClick={() => onUpdate({ slotsUsed: { ...state.slotsUsed, [lvl]: isUsed ? used - 1 : used + 1 } })}
                        className={`w-5 h-5 rounded-full border transition ${isUsed ? 'border-border bg-transparent' : 'border-primary/60 bg-primary/20'}`} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {def.cantrips?.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Trucchetti</p>
          <div className="flex flex-wrap gap-2">
            {def.cantrips.map((s) => <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-muted">{s}</span>)}
          </div>
        </div>
      )}

      {isBook && def.spells?.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Libro degli incantesimi</p>
          <div className="flex flex-wrap gap-2">
            {def.spells.map((s) => {
              const ready = (def.prepared || []).includes(s);
              return (
                <button key={s} onClick={() => onUpdate({ prepared: ready ? (def.prepared || []).filter((x) => x !== s) : [...(def.prepared || []), s] })}
                  className={`px-2.5 py-1 rounded-full text-xs border transition ${ready ? 'border-primary/50 bg-primary/10' : 'border-border text-muted-foreground'}`}>{s}</button>
              );
            })}
          </div>
        </div>
      )}

      {(info.kind === 'known' || info.kind === 'pact') && def.spells?.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Incantesimi conosciuti</p>
          <div className="flex flex-wrap gap-2">
            {def.spells.map((s) => <span key={s} className="px-2.5 py-1 rounded-full text-xs bg-muted">{s}</span>)}
          </div>
        </div>
      )}

      {info.kind === 'prepared' && def.spells?.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Pronti oggi</p>
          <div className="flex flex-wrap gap-2">
            {def.spells.map((s) => {
              const ready = (def.prepared || []).includes(s);
              return (
                <button key={s} onClick={() => onUpdate({ prepared: ready ? (def.prepared || []).filter((x) => x !== s) : [...(def.prepared || []), s] })}
                  className={`px-2.5 py-1 rounded-full text-xs border transition ${ready ? 'border-primary/50 bg-primary/10' : 'border-border text-muted-foreground'}`}>{s}</button>
              );
            })}
          </div>
        </div>
      )}

      {def.extraSpells?.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-2">Fuori lista</p>
          <div className="flex flex-wrap gap-2">
            {def.extraSpells.map((s) => <span key={s.name} className="px-2.5 py-1 rounded-full text-xs bg-muted/60">{s.name} ({s.level ? `${s.level}°` : 'trucchetto'})</span>)}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground/60">Lingue: {languages(def).join(', ')}.</p>
    </Section>
  );
}