import React, { useMemo } from 'react'
import { SkipForward } from 'lucide-react'

export default function TurnBanner({ table, characters, isMaster, onAdvance }) {
  const { current, next, turn, total } = useMemo(() => {
    const entries = Array.isArray(table?.initiative) ? table.initiative : []
    if (!entries.length) return { current: null, next: null, turn: 0, total: 0 }
    const turnIndex = Math.min(table.turn_index || 0, entries.length - 1)
    return {
      current: entries[turnIndex],
      next: entries[(turnIndex + 1) % entries.length],
      turn: turnIndex,
      total: entries.length,
    }
  }, [table?.initiative, table?.turn_index])

  if (!current) return null

  const isMine = characters?.some((c) => c.id === current.id && c.definition)

  return (
    <div className={`border-b px-5 py-3 ${isMine ? 'border-primary/40 bg-primary/10' : 'border-border bg-card/70'}`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Turno {turn + 1}/{total}</p>
          <p className="mt-0.5 text-sm truncate">
            Tocca a <span className="text-foreground font-medium">{current.name}</span>
            {next && next.id !== current.id && (
              <span className="text-muted-foreground"> · poi {next.name}</span>
            )}
          </p>
        </div>
        {isMaster && onAdvance && (
          <button type="button" onClick={onAdvance} className="btn-ghost h-10 px-3 text-xs shrink-0">
            <SkipForward className="w-4 h-4" /> Avanti
          </button>
        )}
      </div>
    </div>
  )
}
