import React from 'react';
import Section from '@/components/scriba/Section';
import InlineText from '@/components/scriba/InlineText';
import { WEAPONS } from '@/lib/dnd/data';

export default function InventoryBlock({ state, onUpdate }) {
  const weapons = state.weapons || [];
  const toggle = (w) => {
    const has = weapons.some((x) => x.name === w.name);
    onUpdate({ weapons: has ? weapons.filter((x) => x.name !== w.name) : [...weapons, w] });
  };
  const coins = state.coins || { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 };

  return (
    <Section title="Equipaggiamento">
      <p className="eyebrow mb-2">Armi</p>
      <div className="flex flex-wrap gap-2">
        {WEAPONS.map((w) => {
          const active = weapons.some((x) => x.name === w.name);
          return (
            <button key={w.name} onClick={() => toggle(w)}
              className={`px-2.5 py-1 rounded-full text-xs border transition ${active ? 'border-primary/50 bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {w.name} <span className="opacity-60">{w.damage}</span>
            </button>
          );
        })}
      </div>
      <p className="eyebrow mt-6 mb-2">Zaino</p>
      <InlineText value={state.equipment} onSave={(v) => onUpdate({ equipment: v })} multiline rows={3}
        placeholder="Tieni qui l'inventario del personaggio" className="w-full rounded-xl bg-muted/60 border border-border p-3 text-sm focus:outline-none focus:border-primary/60" />
      <p className="eyebrow mt-6 mb-2">Monete</p>
      <div className="grid grid-cols-5 gap-2">
        {[['mr', 'Rame'], ['ma', 'Argento'], ['me', 'Elettrum'], ['mo', 'Oro'], ['mp', 'Platino']].map(([k, l]) => (
          <label key={k} className="text-center">
            <input type="number" value={coins[k] || 0} onChange={(e) => onUpdate({ coins: { ...coins, [k]: +e.target.value } })}
              className="w-full rounded-lg bg-muted/60 border border-border py-1.5 text-center text-sm tabular-nums focus:outline-none focus:border-primary/60" />
            <span className="text-[10px] text-muted-foreground">{l}</span>
          </label>
        ))}
      </div>
    </Section>
  );
}