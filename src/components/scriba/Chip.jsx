import React from 'react';

export default function Chip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active ? 'bg-primary/15 border-primary/50 text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}