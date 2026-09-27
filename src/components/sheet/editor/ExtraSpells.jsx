import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function ExtraSpells({ def, setDef }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [effect, setEffect] = useState('');

  const add = () => {
    if (!name.trim()) return;
    setDef({
      ...def,
      extraSpells: [
        ...(def.extraSpells || []),
        { name: name.trim(), level, effect: effect.trim() },
      ],
    });
    setName('');
    setEffect('');
    setLevel(1);
    setOpen(false);
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="text-sm text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground transition">
        <Plus className="w-3.5 h-3.5" /> Crea un trucchetto o una magia
      </button>
      {open && (
        <div className="mt-3 space-y-3 p-3 rounded-xl border border-border bg-muted/30">
          <div className="flex flex-wrap items-end gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="scriba-input h-9 text-sm flex-1 min-w-[12rem]" />
            <select value={level} onChange={(e) => setLevel(+e.target.value)} className="h-9 rounded-xl bg-muted border border-border px-3 text-sm focus:outline-none">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => <option key={l} value={l}>{l === 0 ? 'Trucchetto' : `${l}° livello`}</option>)}
            </select>
          </div>
          <textarea
            value={effect}
            onChange={(e) => setEffect(e.target.value.slice(0, 600))}
            rows={3}
            placeholder="Cosa fa: gittata, durata, effetto…"
            className="scriba-input w-full text-sm resize-y min-h-[5rem]"
          />
          <button type="button" onClick={add} className="btn-primary h-9 px-4 text-sm">Aggiungi</button>
        </div>
      )}
      {def.extraSpells?.length > 0 && (
        <ul className="mt-3 space-y-2">
          {def.extraSpells.map((s, i) => (
            <li key={`${s.name}-${i}`} className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">{s.name} <span className="text-muted-foreground">({s.level ? `${s.level}°` : 'trucchetto'})</span></p>
                  {s.effect && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.effect}</p>}
                </div>
                <button type="button" onClick={() => setDef({ ...def, extraSpells: def.extraSpells.filter((_, j) => j !== i) })} className="text-xs text-muted-foreground hover:text-foreground">Rimuovi</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
