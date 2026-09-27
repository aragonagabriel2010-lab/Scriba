import React from 'react';

export default function ConditionChips({ conditions }) {
  const list = (conditions || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-end">
      {list.map((c) => (
        <span key={c} className="px-1.5 py-0.5 rounded-full text-[10px] leading-tight border border-rose-400/40 bg-rose-500/10 text-rose-200">
          {c}
        </span>
      ))}
    </div>
  );
}