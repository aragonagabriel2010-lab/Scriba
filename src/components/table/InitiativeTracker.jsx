import React, { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Plus, SkipForward, RotateCcw, X } from 'lucide-react'

export default function InitiativeTracker({ table, characters, isMaster, onSave }) {
  const [npcName, setNpcName] = useState('')
  const [npcScore, setNpcScore] = useState(10)

  const entries = useMemo(() => {
    const saved = Array.isArray(table.initiative) ? table.initiative : []
    if (saved.length) return saved
    return characters
      .filter((c) => c.definition)
      .map((c) => ({
        id: c.id,
        name: c.definition?.name || c.player_name,
        score: 10 + Math.floor((((c.definition?.scores?.des || 10) + (c.definition?.asi?.des || 0)) - 10) / 2),
      }))
      .sort((a, b) => b.score - a.score)
  }, [table.initiative, characters])

  const turn = Math.min(table.turn_index || 0, Math.max(0, entries.length - 1))
  const current = entries[turn]

  const persist = (nextEntries, nextTurn = turn) => {
    if (!isMaster) return
    onSave({
      initiative: nextEntries,
      turn_index: nextEntries.length ? ((nextTurn % nextEntries.length) + nextEntries.length) % nextEntries.length : 0,
    })
  }

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const next = [...entries]
    const [moved] = next.splice(result.source.index, 1)
    next.splice(result.destination.index, 0, moved)
    let nextTurn = turn
    if (result.source.index === turn) nextTurn = result.destination.index
    else if (result.source.index < turn && result.destination.index >= turn) nextTurn -= 1
    else if (result.source.index > turn && result.destination.index <= turn) nextTurn += 1
    persist(next, nextTurn)
  }

  const addNpc = () => {
    const name = npcName.trim()
    if (!name) return
    persist([...entries, { id: `npc-${Date.now()}`, name, score: Number(npcScore) || 0 }], turn)
    setNpcName('')
  }

  const remove = (id) => {
    const idx = entries.findIndex((e) => e.id === id)
    const next = entries.filter((e) => e.id !== id)
    let nextTurn = turn
    if (idx < turn) nextTurn -= 1
    if (idx === turn) nextTurn = Math.min(turn, Math.max(0, next.length - 1))
    persist(next, nextTurn)
  }

  const setScore = (id, score) => {
    persist(entries.map((e) => (e.id === id ? { ...e, score: Number(score) || 0 } : e)), turn)
  }

  const sortByScore = () => {
    persist([...entries].sort((a, b) => b.score - a.score), 0)
  }

  if (!entries.length && !isMaster) {
    return <p className="text-sm text-muted-foreground">Il master non ha ancora aperto l’iniziativa.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Iniziativa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {current ? <>Tocca a <span className="text-foreground">{current.name}</span></> : 'Nessuno in lista.'}
          </p>
        </div>
        {isMaster && entries.length > 0 && (
          <div className="flex gap-2">
            <button type="button" onClick={() => persist(entries, turn + 1)} className="btn-ghost h-10 px-3 text-xs">
              <SkipForward className="w-4 h-4" /> Avanti
            </button>
            <button type="button" onClick={() => persist(entries, 0)} className="btn-ghost h-10 px-3 text-xs">
              <RotateCcw className="w-4 h-4" /> Riparti
            </button>
          </div>
        )}
      </div>

      {isMaster && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={sortByScore} className="btn-ghost h-10 px-3 text-xs">Ordina per tiro</button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="initiative" isDropDisabled={!isMaster}>
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {entries.map((entry, index) => (
                <Draggable key={entry.id} draggableId={entry.id} index={index} isDragDisabled={!isMaster}>
                  {(drag) => (
                    <li
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${index === turn ? 'border-primary bg-primary/10' : 'border-border bg-card/40'}`}
                    >
                      {isMaster && (
                        <button type="button" {...drag.dragHandleProps} className="text-muted-foreground" aria-label="Trascina">
                          <GripVertical className="w-4 h-4" />
                        </button>
                      )}
                      <span className="w-6 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{entry.name}</p>
                      </div>
                      {isMaster ? (
                        <input
                          type="number"
                          value={entry.score}
                          onChange={(e) => setScore(entry.id, e.target.value)}
                          className="w-14 h-10 rounded-lg bg-muted border border-border text-center tabular-nums"
                        />
                      ) : (
                        <span className="tabular-nums text-muted-foreground">{entry.score}</span>
                      )}
                      {isMaster && (
                        <button
                          type="button"
                          onClick={() => remove(entry.id)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
                          aria-label={`Rimuovi ${entry.name}`}
                          title="Rimuovi dall’iniziativa"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {isMaster && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
          <label className="flex-1 min-w-[8rem]">
            <span className="eyebrow">Mostro / PNG</span>
            <input value={npcName} onChange={(e) => setNpcName(e.target.value.slice(0, 30))} placeholder="Nome" className="scriba-input mt-2 h-10" />
          </label>
          <label>
            <span className="eyebrow">Init</span>
            <input type="number" value={npcScore} onChange={(e) => setNpcScore(e.target.value)} className="scriba-input mt-2 h-10 w-20 text-center" />
          </label>
          <button type="button" onClick={addNpc} className="btn-primary h-10 px-4 text-sm">
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        </div>
      )}
    </div>
  )
}
