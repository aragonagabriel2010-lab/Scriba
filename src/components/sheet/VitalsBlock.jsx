import React from 'react'
import Section from '@/components/scriba/Section'
import Stepper from '@/components/scriba/Stepper'
import { CONDITIONS } from '@/lib/dnd/data'
import { Flame, Eye } from 'lucide-react'

export default function VitalsBlock({ def, state, onUpdate }) {
  return (
    <Section title="Stato" quiet>
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((c) => {
          const active = (state.conditions || []).includes(c)
          return (
            <button
              key={c}
              type="button"
              onClick={() => onUpdate({
                conditions: active
                  ? state.conditions.filter((x) => x !== c)
                  : [...(state.conditions || []), c],
              })}
              className={`min-h-11 px-4 py-2 rounded-full text-sm border transition ${
                active
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
          <Flame className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground flex-1">Esaurimento</span>
          <Stepper
            value={state.exhaustion || 0}
            min={0}
            max={6}
            onChange={(v) => onUpdate({ exhaustion: v })}
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3">
          <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={state.concentration || ''}
            onChange={(e) => onUpdate({ concentration: e.target.value })}
            className="bg-transparent text-sm text-foreground focus:outline-none flex-1 min-w-0"
          >
            <option value="">Nessuna concentrazione</option>
            {(def.spells || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </Section>
  )
}
