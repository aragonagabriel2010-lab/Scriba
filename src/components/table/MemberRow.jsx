import React from 'react';
import { ChevronRight } from 'lucide-react';
import { RACES, CLASSES } from '@/lib/dnd/data';
import ConditionChips from './ConditionChips';

export default function MemberRow({ character, pending, onClick }) {
  const d = character.definition;
  const hp = d ? character.state?.hp ?? d.hpMax : 0;
  const pct = d?.hpMax ? Math.max(0, Math.min(1, hp / d.hpMax)) : 0;
  const Tag = onClick ? 'button' : 'div';
  return (
    <li>
      <Tag onClick={onClick} className={`w-full text-left py-4 flex items-center gap-4 ${onClick ? 'group hover:bg-muted/40 -mx-3 px-3 rounded-xl transition' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-base truncate">{d?.name || character.player_name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {d ? `${RACES[d.race]?.name} · ${CLASSES[d.classKey]?.name} · liv. ${d.level}` : pending ? 'Scheda in attesa del master' : 'Sta creando la scheda'}
            {d && <span className="text-muted-foreground/60"> · {character.player_name}</span>}
          </p>
        </div>
        {d && (
          <div className="flex flex-col items-end gap-1.5">
            <div className="w-24 text-right">
              <p className="tabular-nums"><span className="text-lg">{hp}</span><span className="text-muted-foreground"> / {d.hpMax}</span></p>
              <div className="mt-1.5 h-0.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${pct > 0.5 ? 'bg-emerald-400/80' : pct > 0.25 ? 'bg-amber-400/80' : 'bg-rose-400/80'}`} style={{ width: `${pct * 100}%` }} />
              </div>
            </div>
            <ConditionChips conditions={character.state?.conditions} />
          </div>
        )}
        {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />}
      </Tag>
    </li>
  );
}