import React, { useState } from 'react';

export default function SpellPicker({ label, options, selected, onToggle, max }) {
  const [q, setQ] = useState('');
  const filtered = options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));
  const grouped = filtered.reduce((acc, s) => { (acc[s.level] = acc[s.level] || []).push(s); return acc; }, {});
  const levelLabel = (n) => (n === 0 ? 'Trucchetti' : `${n}° livello`);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="eyebrow">{label}</p>
        <span className="text-xs text-muted-foreground tabular-nums">{selected.length}{max ? ` / ${max}` : ''}</span>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((s) => {
            const opt = options.find((o) => o.name === s) || { name: s, level: 0 };
            return (
              <button key={s} onClick={() => onToggle(s)} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 border border-primary/40 text-foreground">
                {s} {opt.level > 0 && <span className="opacity-60">({opt.level}°)</span>} ✕
              </button>
            );
          })}
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca…" className="scriba-input h-9 text-sm mb-3" />
      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {Object.entries(grouped).sort((a, b) => a[0] - b[0]).map(([lvl, list]) => (
          <div key={lvl}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">{levelLabel(+lvl)}</p>
            <div className="flex flex-wrap gap-1.5">
              {list.map((s) => {
                const active = selected.includes(s.name);
                const full = max && selected.length >= max && !active;
                return (
                  <button key={s.name} disabled={full} onClick={() => onToggle(s.name)}
                    className={`px-2 py-0.5 rounded-full text-xs border transition ${active ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground hover:text-foreground'} disabled:opacity-30`}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}