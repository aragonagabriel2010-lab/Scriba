import React from 'react';
import Section from '@/components/scriba/Section';
import { ABILITIES, SKILLS, RACES, CLASSES } from '@/lib/dnd/data';
import { finalScores, profBonus, mod, signed, proficientSkills, skillBonus, defaultAC, formatMeters } from '@/lib/dnd/rules';

export default function AbilitiesBlock({ def, state }) {
  const scores = finalScores(def);
  const pb = profBonus(def.level);
  const cls = def.classKey;
  const clsSaves = CLASSES[cls]?.saves || [];
  const ac = state.ac ?? defaultAC(def);
  const init = mod(scores.des);
  const speed = RACES[def.race]?.speed ?? 9;
  const passive = 10 + skillBonus(def, 'Percezione');

  return (
    <Section title="Caratteristiche">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITIES.map((ab) => {
          const sv = clsSaves.includes(ab.key);
          return (
            <div key={ab.key} className={`rounded-xl border p-3 text-center ${sv ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ab.short}</p>
              <p className="font-display text-3xl tabular-nums">{signed(mod(scores[ab.key]))}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{scores[ab.key]}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3 text-center">
        {[['Iniziativa', signed(init)], ['CA', ac], ['Velocità', formatMeters(speed)], ['Bonus comp.', signed(pb)]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
            <p className="text-lg tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-1">
        {SKILLS.map((s) => {
          const prof = proficientSkills(def).includes(s.name);
          const exp = (def.expertise || []).includes(s.name);
          return (
            <div key={s.name} className="flex items-center justify-between py-1 text-sm border-b border-border/50">
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${exp ? 'bg-primary' : prof ? 'bg-foreground/60' : 'border border-muted-foreground/40'}`} />
                {s.name}
                <span className="text-[10px] uppercase text-muted-foreground/60">{s.ab}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{signed(skillBonus(def, s.name))}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Percezione passiva: <span className="text-foreground tabular-nums">{passive}</span></p>
    </Section>
  );
}