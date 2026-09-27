import React from 'react';

export default function ChangeLines({ changes }) {
  return (
    <ul className="divide-y divide-border">
      {changes.map((c, i) => (
        <li key={i} className="py-2.5 grid grid-cols-[7.5rem_1fr] gap-3 text-sm">
          <span className="text-muted-foreground">{c.label}</span>
          <span className="leading-relaxed">
            {c.added ? (
              <>
                {c.added.map((a) => <span key={a} className="mr-2 text-emerald-300">+ {a}</span>)}
                {c.removed.map((r) => <span key={r} className="mr-2 text-rose-300/80 line-through">{r}</span>)}
              </>
            ) : (
              <>
                {c.from !== '—' && <span className="text-muted-foreground line-through mr-2">{c.from}</span>}
                <span>{c.to}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}