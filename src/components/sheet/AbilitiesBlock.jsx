import React from 'react';
import Section from '@/components/scriba/Section';
import { ABILITIES, SKILLS, RACES, CLASSES } from '@/lib/dnd/data';
import { finalScores, profBonus, mod, signed, proficientSkills, skillBonus, defaultAC, formatMeters } from '@/lib/dnd/rules';
import { attackBonusFor } from '@/lib/combat';

export default function AbilitiesBlock({ def, state, choice, onOpenChoice, onRoll }) {
  const scores = finalScores(def);
  const pb = profBonus(def.level);
  const cls = def.classKey;
  const clsSaves = CLASSES[cls]?.saves || [];
  const ac = state.ac ?? defaultAC(def);
  const init = mod(scores.des);
  const speed = RACES[def.race]?.speed ?? 9;
  const passive = 10 + skillBonus(def, 'Percezione');
  const points = choice?.asiPoints || 0;

  const roll = (preset) => {
    if (!onRoll) return;
    onRoll({ sides: 20, count: 1, mode: 'normal', ...preset });
  };

  return (
    <Section
      title="Caratteristiche"
      action={choice ? (
        <button type="button" onClick={onOpenChoice} className="btn-primary h-9 px-4 text-sm shrink-0">
          Metti i punti{points ? ` (${points})` : ''}
        </button>
      ) : null}
    >
      {choice && (
        <button type="button" onClick={onOpenChoice} className="mb-4 w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left">
          <p className="text-sm text-primary font-medium">Hai punti del livello da assegnare</p>
          <p className="text-xs text-muted-foreground mt-1">
            {points ? `${points} ai punteggi` : ''}{points && choice.expertise ? ' · ' : ''}{choice.expertise ? `${choice.expertise} maestria` : ''}
            {' · '}Tocca qui o il tasto sopra.
          </p>
        </button>
      )}
      {onRoll && (
        <p className="mb-3 text-xs text-muted-foreground">Tocca una caratteristica, un tiro salvezza o un’abilità per aprire i dadi.</p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {ABILITIES.map((ab) => {
          const sv = clsSaves.includes(ab.key);
          const checkMod = mod(scores[ab.key]);
          const saveMod = checkMod + (sv ? pb : 0);
          const Tag = onRoll ? 'button' : 'div';
          return (
            <div key={ab.key} className={`rounded-xl border p-3 text-center space-y-2 ${sv ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
              <Tag
                type={onRoll ? 'button' : undefined}
                onClick={onRoll ? () => roll({
                  label: `Prova di ${ab.label}`,
                  modifier: checkMod,
                  kind: 'check',
                }) : undefined}
                className={`w-full ${onRoll ? 'hover:opacity-90 transition' : ''}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ab.short}</p>
                <p className="font-display text-3xl tabular-nums">{signed(checkMod)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{scores[ab.key]}</p>
              </Tag>
              {onRoll && (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => roll({
                      label: `TS di ${ab.label}`,
                      modifier: saveMod,
                      kind: 'save',
                    })}
                    className="h-7 rounded-lg border border-border text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    TS {signed(saveMod)}
                  </button>
                  {(ab.key === 'for' || ab.key === 'des') && (
                    <button
                      type="button"
                      onClick={() => roll({
                        label: `Attacco (${ab.label})`,
                        modifier: attackBonusFor(def, ab.key),
                        kind: 'attack',
                      })}
                      className="h-7 rounded-lg border border-border text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Att. {signed(attackBonusFor(def, ab.key))}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3 text-center">
        {[
          {
            label: 'Iniziativa',
            value: signed(init),
            roll: onRoll ? () => roll({ label: 'Iniziativa', modifier: init, kind: 'init' }) : null,
          },
          { label: 'CA', value: ac, roll: null },
          { label: 'Velocità', value: formatMeters(speed), roll: null },
          { label: 'Bonus comp.', value: signed(pb), roll: null },
        ].map((item) => {
          const Tag = item.roll ? 'button' : 'div';
          return (
            <Tag
              key={item.label}
              type={item.roll ? 'button' : undefined}
              onClick={item.roll || undefined}
              className={`rounded-lg border border-border py-2 ${item.roll ? 'hover:border-primary/40 hover:bg-primary/5 transition' : ''}`}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="text-lg tabular-nums">{item.value}</p>
            </Tag>
          );
        })}
      </div>
      <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-1">
        {SKILLS.map((s) => {
          const prof = proficientSkills(def).includes(s.name);
          const exp = (def.expertise || []).includes(s.name);
          const bonus = skillBonus(def, s.name);
          const Tag = onRoll ? 'button' : 'div';
          return (
            <Tag
              key={s.name}
              type={onRoll ? 'button' : undefined}
              onClick={onRoll ? () => roll({
                label: s.name,
                modifier: bonus,
                kind: 'skill',
              }) : undefined}
              className={`flex items-center justify-between py-1.5 text-sm border-b border-border/50 w-full text-left ${onRoll ? 'hover:text-foreground hover:border-primary/30 transition' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${exp ? 'bg-primary' : prof ? 'bg-foreground/60' : 'border border-muted-foreground/40'}`} />
                {s.name}
                <span className="text-[10px] uppercase text-muted-foreground/60">{s.ab}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{signed(bonus)}</span>
            </Tag>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Percezione passiva: <span className="text-foreground tabular-nums">{passive}</span></p>
    </Section>
  );
}
