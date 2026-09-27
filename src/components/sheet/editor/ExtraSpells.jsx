import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function ExtraSpells({ def, setDef }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const add = () => {
    if (!name.trim()) return;
    setDef({ ...def, extraSpells: [...(def.extraSpells || []), { name: name.trim(), level }] });
    setName(''); setOpen(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-sm text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground transition">
        <Plus className="w-3.5 h-3.5" /> Aggiungi un incantesimo fuori lista
      </button>
      {open && (
        <div className="mt-3 flex flex-wrap items-end gap-2 p-3 rounded-xl border border-border bg-muted/30">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome incantesimo" className="scriba-input h-9 text-sm flex-1 min-w-[12rem]" />
          <select value={level} onChange={(e) => setLevel(+e.target.value)} className="h-9 rounded-xl bg-muted border border-border px-3 text-sm focus:outline-none">
            {[0, 1, 2, 3].map((l) => <option key={l} value={l}>{l === 0 ? 'Trucchetto' : `${l}° livello`}</option>)}
          </select>
          <button onClick={add} className="btn-primary h-9 px-4 text-sm">Aggiungi</button>
        </div>
      )}
      {def.extraSpells?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {def.extraSpells.map((s, i) => (
            <button key={i} onClick={() => setDef({ ...def, extraSpells: def.extraSpells.filter((_, j) => j !== i) })}
              className="px-2 py-0.5 rounded-full text-xs bg-muted/60 border border-border">
              {s.name} ({s.level ? `${s.level}°` : 'trucchetto'}) ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}