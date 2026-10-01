import React from 'react';
import Section from '@/components/scriba/Section';
import { ABILITIES, SKILLS, CLASSES } from '@/lib/dnd/data';
import { finalScores, profBonus, mod, signed, proficientSkills, skillBonus } from '@/lib/dnd/rules';
import { attackBonusFor } from '@/lib/combat';

export default function AbilitiesBlock({ def, state: _state, choice, onOpenChoice, onRoll }) {
  const scores = finalScores(def);
  const pb = profBonus(def.level);
  const cls = def.classKey;
  const clsSaves = CLASSES[cls]?.saves || [];
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
        <button type="button" onClick={onOpenChoice} className="mb-4 w-full rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-left">
          <p className="text-sm text-primary font-medium">Hai punti del livello da assegnare</p>
          <p className="text-xs text-muted-foreground mt-1">
            {points ? `${points} ai punteggi` : ''}{points && choice.expertise ? ' · ' : ''}{choice.expertise ? `${choice.expertise} maestria` : ''}
            {' · '}Tocca qui o il tasto sopra.
          </p>
        </button>
      )}
      {onRoll && (
        <p className="mb-4 text-xs text-muted-foreground">Tocca per tirare: prova, TS o attacco (FOR/DES).</p>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {ABILITIES.map((ab) => {
          const sv = clsSaves.includes(ab.key);
          const checkMod = mod(scores[ab.key]);
          const saveMod = checkMod + (sv ? pb : 0);
          const Tag = onRoll ? 'button' : 'div';
          return (
            <div key={ab.key} className={`rounded-2xl border p-3 text-center space-y-2 ${sv ? 'border-primary/35 bg-primary/5' : 'border-border/70'}`}>
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
                <p className="font-display text-3xl tabular-nums leading-none mt-1">{signed(checkMod)}</p>
                <p className="mt-1 text-xs text-muted-foreground/80 tabular-nums">{scores[ab.key]}</p>
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
                    className="h-7 rounded-lg border border-border/70 text-[10px] text-muted-foreground hover:text-foreground"
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
                      className="h-7 rounded-lg border border-border/70 text-[10px] text-muted-foreground hover:text-foreground"
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

      <div className="mt-5 flex items-baseline justify-between gap-3 border-b border-border/50 pb-3">
        <p className="text-sm text-muted-foreground">Bonus competenza</p>
        <p className="font-display text-2xl tabular-nums">{signed(pb)}</p>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-0">
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
              className={`flex items-center justify-between py-2 text-sm border-b border-border/40 w-full text-left ${onRoll ? 'hover:text-foreground hover:border-primary/30 transition' : ''}`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${exp ? 'bg-primary' : prof ? 'bg-foreground/60' : 'border border-muted-foreground/40'}`} />
                <span className="truncate">{s.name}</span>
                <span className="text-[10px] uppercase text-muted-foreground/55">{s.ab}</span>
              </span>
              <span className="tabular-nums text-muted-foreground shrink-0 ml-3">{signed(bonus)}</span>
            </Tag>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Percezione passiva: <span className="text-foreground tabular-nums">{passive}</span></p>
    </Section>
  );
}
