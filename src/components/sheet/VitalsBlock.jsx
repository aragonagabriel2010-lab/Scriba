import React from 'react';
import Section from '@/components/scriba/Section';
import Stepper from '@/components/scriba/Stepper';
import { CONDITIONS } from '@/lib/dnd/data';
import { Heart, Shield, Sparkles, Flame, Eye, Brain } from 'lucide-react';

export default function VitalsBlock({ def, state, isMaster, onUpdate }) {
  const hp = state.hp ?? def.hpMax;
  const setHp = (v) => onUpdate({ hp: Math.max(0, Math.min(def.hpMax, v)) });
  const temp = state.tempHp || 0;
  const dmg = (n) => {
    let t = temp, h = hp;
    if (t > 0) { const a = Math.min(t, n); t -= a; n -= a; }
    onUpdate({ tempHp: t, hp: Math.max(0, h - n) });
  };
  const heal = (n) => setHp(hp + n);

  return (
    <Section title="Punti ferita">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl tabular-nums">{hp}</span>
        <span className="text-muted-foreground">/ {def.hpMax}</span>
        {temp > 0 && <span className="ml-2 text-xs text-cyan-300/80">+{temp} temporanei</span>}
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${hp / def.hpMax > 0.5 ? 'bg-emerald-400/70' : hp / def.hpMax > 0.25 ? 'bg-amber-400/70' : 'bg-rose-400/70'}`} style={{ width: `${Math.max(0, hp / def.hpMax * 100)}%` }} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {isMaster ? (
          <div className="flex gap-2">
            <button onClick={() => dmg(1)} className="btn-ghost h-9 px-3 text-xs">−1 danno</button>
            <button onClick={() => heal(1)} className="btn-ghost h-9 px-3 text-xs">+1 cura</button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">I punti ferita salgono solo spendendo un dado vita.</p>
        )}
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-muted-foreground" />
          <Stepper value={temp} min={0} max={99} onChange={(v) => onUpdate({ tempHp: v })} />
          <span className="text-xs text-muted-foreground">PF temp</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          <Stepper value={state.ac ?? 10} min={0} max={30} onChange={(v) => onUpdate({ ac: v })} />
          <span className="text-xs text-muted-foreground">CA</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => onUpdate({ inspiration: !state.inspiration })} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${state.inspiration ? 'border-primary/50 bg-primary/10 text-foreground' : 'border-border text-muted-foreground'}`}>
          <Sparkles className="w-3.5 h-3.5" /> Ispirazione
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm">
          <Flame className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Esaur.</span>
          <Stepper value={state.exhaustion || 0} min={0} max={6} onChange={(v) => onUpdate({ exhaustion: v })} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={state.concentration || ''} onChange={(e) => onUpdate({ concentration: e.target.value })} className="bg-transparent text-foreground focus:outline-none flex-1 min-w-0">
            <option value="">Nessuna concentrazione</option>
            {(def.spells || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm">
          <Brain className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Incantatore</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {CONDITIONS.map((c) => {
          const active = (state.conditions || []).includes(c);
          return (
            <button key={c} onClick={() => onUpdate({ conditions: active ? state.conditions.filter((x) => x !== c) : [...(state.conditions || []), c] })}
              className={`min-h-11 px-4 py-2 rounded-xl text-sm border transition ${active ? 'border-primary/50 bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {c}
            </button>
          );
        })}
      </div>
    </Section>
  );
}