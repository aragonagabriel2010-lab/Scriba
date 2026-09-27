import React from 'react';

export default function ChoiceGrid({ options, value, onPick, cols = 'grid-cols-2 sm:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-2`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value || '__none'} type="button" onClick={() => onPick(active ? null : o.value)}
            className={`text-left px-3 py-2.5 rounded-xl border transition ${active ? 'border-primary/60 bg-primary/10' : 'border-border hover:border-foreground/20'}`}>
            <p className="text-sm">{o.label}</p>
            {o.sub && <p className="text-xs text-muted-foreground mt-0.5">{o.sub}</p>}
          </button>
        );
      })}
    </div>
  );
}