import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function Stepper({ value, onChange, min = -Infinity, max = Infinity, canInc = true }) {
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)} className="step-btn" aria-label="Diminuisci">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-9 text-center tabular-nums">{value}</span>
      <button type="button" disabled={value >= max || !canInc} onClick={() => onChange(value + 1)} className="step-btn" aria-label="Aumenta">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}