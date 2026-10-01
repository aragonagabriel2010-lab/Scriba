import React, { useEffect, useState } from 'react'
import { Plus, Swords, X } from 'lucide-react'
import Stepper from '@/components/scriba/Stepper'
import { enemyInitiativeId } from '@/lib/enemies'

const blank = () => ({ name: '', hpMax: 10, hp: 10, ac: 12, init: 10, notes: '' })

export default function EnemiesPanel({ enemies, table, onSave, onDelete, onSaveTable }) {
  const [draft, setDraft] = useState(blank())
  const [editingId, setEditingId] = useState(null)
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const initiative = Array.isArray(table.initiative) ? table.initiative : []
  const turn = table.turn_index || 0

  useEffect(() => {
    if (!editingId) {
      setEdit(null)
      return
    }
    const enemy = enemies.find((item) => item.id === editingId)
    if (!enemy) {
      setEditingId(null)
      setEdit(null)
      return
    }
    setEdit({
      name: enemy.name,
      hpMax: enemy.hpMax,
      ac: enemy.ac,
      init: enemy.init,
      notes: enemy.notes || '',
    })
  }, [editingId, enemies])

  const run = async (key, fn) => {
    setBusy(key)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto.')
    } finally {
      setBusy('')
    }
  }

  const create = () => run('create', async () => {
    await onSave({ ...draft, hp: draft.hpMax })
    setDraft(blank())
  })

  const patchHp = (enemy, hp) => run(enemy.id, () => onSave({ ...enemy, hp }, enemy.id))

  const saveEdit = () => {
    if (!editingId || !edit) return
    const enemy = enemies.find((item) => item.id === editingId)
    if (!enemy) return
    const hpMax = Math.max(1, Number(edit.hpMax) || 1)
    void run(editingId, () => onSave({
      ...enemy,
      name: edit.name,
      hpMax,
      hp: Math.min(enemy.hp, hpMax),
      ac: edit.ac,
      init: edit.init,
      notes: edit.notes,
    }, editingId))
  }

  const addToInitiative = (enemy) => {
    const id = enemyInitiativeId(enemy.id)
    if (initiative.some((entry) => entry.id === id)) return
    onSaveTable?.({
      initiative: [...initiative, { id, name: enemy.name, score: Number(enemy.init) || 0 }],
      turn_index: turn,
    })
  }

  const defeat = (enemy) => run(`kill-${enemy.id}`, async () => {
    const id = enemyInitiativeId(enemy.id)
    const idx = initiative.findIndex((entry) => entry.id === id)
    if (idx >= 0) {
      const next = initiative.filter((entry) => entry.id !== id)
      let nextTurn = turn
      if (idx < turn) nextTurn -= 1
      if (idx === turn) nextTurn = Math.min(turn, Math.max(0, next.length - 1))
      onSaveTable?.({
        initiative: next,
        turn_index: next.length ? ((nextTurn % next.length) + next.length) % next.length : 0,
      })
    }
    await onDelete(enemy.id)
    if (editingId === enemy.id) setEditingId(null)
  })

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Nemici</p>
        <p className="mt-1 text-sm text-muted-foreground">Solo tu li vedi. Crea la scheda, tieni i punti ferita, poi cacciali quando sono sconfitti.</p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="col-span-2 sm:col-span-4">
            <span className="eyebrow">Nome</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 40) }))}
              placeholder="Goblin, troll, guardia…"
              className="scriba-input mt-2 h-11"
            />
          </label>
          <label>
            <span className="eyebrow">PF max</span>
            <input
              type="number"
              value={draft.hpMax}
              onChange={(e) => setDraft((d) => ({ ...d, hpMax: e.target.value }))}
              className="scriba-input mt-2 h-11 text-center"
            />
          </label>
          <label>
            <span className="eyebrow">CA</span>
            <input
              type="number"
              value={draft.ac}
              onChange={(e) => setDraft((d) => ({ ...d, ac: e.target.value }))}
              className="scriba-input mt-2 h-11 text-center"
            />
          </label>
          <label>
            <span className="eyebrow">Iniziativa</span>
            <input
              type="number"
              value={draft.init}
              onChange={(e) => setDraft((d) => ({ ...d, init: e.target.value }))}
              className="scriba-input mt-2 h-11 text-center"
            />
          </label>
        </div>
        <label className="block">
          <span className="eyebrow">Note / attacchi</span>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value.slice(0, 800) }))}
            rows={2}
            placeholder="Scimitarra +4 (1d6+2), furtività…"
            className="scriba-input mt-2 py-3 resize-y min-h-[4.5rem]"
          />
        </label>
        <button type="button" disabled={busy === 'create' || !draft.name.trim()} onClick={() => void create()} className="btn-primary h-11 px-4 text-sm">
          <Plus className="w-4 h-4" /> {busy === 'create' ? 'Attendi…' : 'Crea nemico'}
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!enemies.length ? (
        <p className="text-sm text-muted-foreground">Nessun nemico sul tavolo.</p>
      ) : (
        <ul className="space-y-3">
          {enemies.map((enemy) => {
            const inInit = initiative.some((entry) => entry.id === enemyInitiativeId(enemy.id))
            const pct = enemy.hpMax ? Math.max(0, Math.min(1, enemy.hp / enemy.hpMax)) : 0
            const open = editingId === enemy.id
            return (
              <li key={enemy.id} className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{enemy.name}</p>
                    <p className="text-sm text-muted-foreground">CA {enemy.ac} · init {enemy.init}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums">
                      <span className="text-lg">{enemy.hp}</span>
                      <span className="text-muted-foreground"> / {enemy.hpMax}</span>
                    </p>
                    <div className="mt-1.5 h-0.5 w-24 ml-auto rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${pct > 0.5 ? 'bg-emerald-400/80' : pct > 0.25 ? 'bg-amber-400/80' : 'bg-rose-400/80'}`}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">PF</span>
                    <Stepper
                      value={enemy.hp}
                      min={0}
                      max={enemy.hpMax}
                      onChange={(hp) => void patchHp(enemy, hp)}
                    />
                  </div>
                  {!inInit && (
                    <button type="button" onClick={() => addToInitiative(enemy)} className="btn-ghost h-10 px-3 text-xs">
                      <Swords className="w-3.5 h-3.5" /> In iniziativa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingId(open ? null : enemy.id)}
                    className="btn-ghost h-10 px-3 text-xs"
                  >
                    {open ? 'Chiudi' : 'Modifica'}
                  </button>
                  <button
                    type="button"
                    disabled={busy === `kill-${enemy.id}`}
                    onClick={() => void defeat(enemy)}
                    className="btn-ghost h-10 px-3 text-xs text-rose-300/90 hover:text-rose-200"
                  >
                    <X className="w-3.5 h-3.5" /> {busy === `kill-${enemy.id}` ? '…' : 'Sconfitto'}
                  </button>
                </div>

                {enemy.notes && !open && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{enemy.notes}</p>
                )}

                {open && edit && (
                  <div className="space-y-3 border-t border-border pt-3">
                    <label className="block">
                      <span className="eyebrow">Nome</span>
                      <input
                        value={edit.name}
                        onChange={(e) => setEdit((d) => ({ ...d, name: e.target.value.slice(0, 40) }))}
                        className="scriba-input mt-2 h-11"
                      />
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label>
                        <span className="eyebrow">PF max</span>
                        <input
                          type="number"
                          value={edit.hpMax}
                          onChange={(e) => setEdit((d) => ({ ...d, hpMax: e.target.value }))}
                          className="scriba-input mt-2 h-11 text-center"
                        />
                      </label>
                      <label>
                        <span className="eyebrow">CA</span>
                        <input
                          type="number"
                          value={edit.ac}
                          onChange={(e) => setEdit((d) => ({ ...d, ac: e.target.value }))}
                          className="scriba-input mt-2 h-11 text-center"
                        />
                      </label>
                      <label>
                        <span className="eyebrow">Init</span>
                        <input
                          type="number"
                          value={edit.init}
                          onChange={(e) => setEdit((d) => ({ ...d, init: e.target.value }))}
                          className="scriba-input mt-2 h-11 text-center"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="eyebrow">Note / attacchi</span>
                      <textarea
                        value={edit.notes}
                        onChange={(e) => setEdit((d) => ({ ...d, notes: e.target.value.slice(0, 800) }))}
                        rows={3}
                        className="scriba-input mt-2 py-3 resize-y min-h-[5rem]"
                      />
                    </label>
                    <button type="button" disabled={busy === editingId || !edit.name.trim()} onClick={() => void saveEdit()} className="btn-primary h-10 px-4 text-sm">
                      {busy === editingId ? 'Attendi…' : 'Salva'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
