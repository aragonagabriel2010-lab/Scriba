import React from 'react';
import { CLASSES, SKILLS } from '@/lib/dnd/data';
import { raceSkills, expertiseAllowed } from '@/lib/dnd/rules';

export default function SkillsStep({ def, setDef, role }) {
  const rulesMode = role === 'regole';
  const cls = CLASSES[def.classKey];
  const list = rulesMode && cls ? SKILLS.filter((s) => cls.skills.includes(s.name)) : SKILLS;
  const rSkills = raceSkills(def);
  const chosen = def.skills || [];
  const exp = def.expertise || [];
  const expAllowed = expertiseAllowed(def.classKey, def.level);

  const toggleSkill = (name) => {
    if (rSkills.includes(name)) return;
    if (rulesMode) {
      const has = chosen.includes(name);
      if (has) setDef({ ...def, skills: chosen.filter((s) => s !== name) });
      else if (chosen.length < cls.skillCount) setDef({ ...def, skills: [...chosen, name] });
    } else {
      setDef({ ...def, skills: chosen.includes(name) ? chosen.filter((s) => s !== name) : [...chosen, name] });
    }
  };
  const toggleExp = (name) => {
    if (!chosen.includes(name) && !rSkills.includes(name)) return;
    setDef({ ...def, expertise: exp.includes(name) ? exp.filter((s) => s !== name) : exp.length < expAllowed ? [...exp, name] : exp });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {rulesMode && cls ? `Scegli ${cls.skillCount} abilità del ${cls.name.toLowerCase()}.` : 'Scegli le abilità in cui sei competente.'}
        {rSkills.length > 0 && <> La razza dà: {rSkills.join(', ')}.</>}
        {expAllowed > 0 && <> Maestria: {exp.length}/{expAllowed}.</>}
      </p>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {list.map((s) => {
          const raceHas = rSkills.includes(s.name);
          const prof = raceHas || chosen.includes(s.name);
          const hasExp = exp.includes(s.name);
          const dis = rulesMode && !raceHas && chosen.length >= cls.skillCount && !prof;
          return (
            <div key={s.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg">
              <button onClick={() => toggleSkill(s.name)} disabled={dis} className={`text-sm text-left flex-1 ${prof ? 'text-foreground' : 'text-muted-foreground'}`}>
                {prof && <span className="text-primary mr-1.5">●</span>}{s.name} <span className="text-[10px] uppercase text-muted-foreground/60">{s.ab}</span>
              </button>
              {expAllowed > 0 && prof && (
                <button onClick={() => toggleExp(s.name)} className={`text-[10px] px-2 py-0.5 rounded-full border ${hasExp ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground'}`}>
                  maestria
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}