import React, { useMemo, useState } from 'react'
import { Dice5, Trash2 } from 'lucide-react'
import { ABILITIES } from '@/lib/dnd/data'
import { rollDie } from '@/lib/dnd/rules'

const ACTIONS = [
  { key: 'attacca', label: 'attacca' },
  { key: 'colpisce', label: 'colpisce' },
  { key: 'prova', label: 'fa una prova' },
]

function formatRoll(result) {
  if (!result) return ''
  if (result.mode === 'advantage' || result.mode === 'disadvantage') {
    return `${result.total} (${result.rolls.join(', ')})`
  }
  if (result.rolls.length === 1) return String(result.total)
  return `${result.total} [${result.rolls.join('+')}]`
}

export function buildCombatLine({ attacker, verb, ability, rollText, target }) {
  const withAbility = ability ? ` con ${ability}` : ''
  const withRoll = rollText ? ` con ${rollText}` : ''
  return `${attacker} ${verb}${withAbility}${withRoll} a ${target}`
}

export default function CombatLogPanel({ characters, enemies, entries, onAdd, onClear, onDelete }) {
  const players = useMemo(
    () => characters.filter((c) => c.definition).map((c) => ({ id: c.id, name: c.definition.name || c.player_name })),
    [characters],
  )

  const [attackerId, setAttackerId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [ability, setAbility] = useState('for')
  const [verb, setVerb] = useState('attacca')
  const [sides, setSides] = useState(20)
  const [count, setCount] = useState(1)
  const [mode, setMode] = useState('normal')
  const [result, setResult] = useState(null)
  const [manual, setManual] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const attacker = players.find((p) => p.id === attackerId)
  const target = enemies.find((e) => e.id === targetId)
  const abilityLabel = ABILITIES.find((a) => a.key === ability)?.label || ''
  const verbLabel = ACTIONS.find((a) => a.key === verb)?.label || 'attacca'
  const rollText = manual.trim() || formatRoll(result)
  const preview = attacker && target
    ? buildCombatLine({
      attacker: attacker.name,
      verb: verbLabel,
      ability: abilityLabel,
      rollText,
      target: target.name,
    })
    : ''

  const roll = () => {
    setManual('')
    if (sides === 20 && count === 1 && mode !== 'normal') {
      const a = rollDie(20)
      const b = rollDie(20)
      const kept = mode === 'advantage' ? Math.max(a, b) : Math.min(a, b)
      const dropped = mode === 'advantage' ? Math.min(a, b) : Math.max(a, b)
      setResult({ sides: 20, mode, rolls: [a, b], kept, dropped, total: kept })
      return
    }
    const rolls = Array.from({ length: count }, () => rollDie(sides))
    setResult({ sides, mode: 'normal', rolls, total: rolls.reduce((s, n) => s + n, 0) })
  }

  const save = async () => {
    if (!attacker || !target) return
    setBusy(true)
    setError('')
    try {
      await onAdd({
        text: preview,
        attacker_id: attacker.id,
        attacker_name: attacker.name,
        target_id: target.id,
        target_name: target.name,
        ability: abilityLabel,
        verb: verbLabel,
        roll_total: result?.total ?? (manual.trim() ? Number(manual) || 0 : 0),
        roll_text: rollText,
        rolls: result?.rolls || [],
        sides,
        count,
      })
      setResult(null)
      setManual('')
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Azioni</p>
        <p className="mt-1 text-sm text-muted-foreground">Solo tu le vedi. Scegli giocatore e nemico, tira i dadi e registra la frase.</p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label>
            <span className="eyebrow">Giocatore</span>
            <select value={attackerId} onChange={(e) => setAttackerId(e.target.value)} className="scriba-input mt-2 h-11">
              <option value="">Scegli…</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>
            <span className="eyebrow">Nemico</span>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="scriba-input mt-2 h-11">
              <option value="">Scegli…</option>
              {enemies.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
        </div>

        <div>
          <p className="eyebrow mb-2">Azione</p>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setVerb(item.key)}
                className={`h-10 px-3 rounded-xl border text-sm transition ${verb === item.key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Caratteristica</p>
          <div className="flex flex-wrap gap-2">
            {ABILITIES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setAbility(item.key)}
                className={`h-10 px-3 rounded-xl border text-sm transition ${ability === item.key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="eyebrow">Dadi</p>
          <div className="flex flex-wrap gap-2">
            {[4, 6, 8, 10, 12, 20].map((die) => (
              <button
                key={die}
                type="button"
                onClick={() => { setSides(die); if (die !== 20) setMode('normal') }}
                className={`h-10 min-w-12 px-3 rounded-full border font-mono text-sm transition ${sides === die ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}
              >
                d{die}
              </button>
            ))}
          </div>
          {sides === 20 && (
            <div className="grid grid-cols-3 gap-2">
              {[['normal', 'Normale'], ['advantage', 'Vantaggio'], ['disadvantage', 'Svantaggio']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setMode(key); if (key !== 'normal') setCount(1) }}
                  className={`h-10 rounded-xl border text-xs transition ${mode === key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Quanti
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                disabled={mode !== 'normal'}
                onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="scriba-input h-10 w-16 text-center"
              />
            </label>
            <button type="button" onClick={roll} className="btn-ghost h-10 px-4 text-sm">
              <Dice5 className="w-4 h-4" /> Lancia
            </button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              o scrivi
              <input
                value={manual}
                onChange={(e) => { setManual(e.target.value.slice(0, 20)); setResult(null) }}
                placeholder="17"
                className="scriba-input h-10 w-20 text-center font-mono"
              />
            </label>
          </div>
          {result && !manual && (
            <p className="font-mono text-2xl tabular-nums">{formatRoll(result)}</p>
          )}
        </div>

        {preview && (
          <p className="rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm leading-relaxed">{preview}</p>
        )}

        <button
          type="button"
          disabled={busy || !attacker || !target || !rollText}
          onClick={() => void save()}
          className="btn-primary h-11 px-4 text-sm"
        >
          {busy ? 'Attendi…' : 'Registra'}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!players.length && <p className="text-sm text-muted-foreground">Serve almeno un personaggio chiuso.</p>}
        {!enemies.length && <p className="text-sm text-muted-foreground">Crea prima un nemico.</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Registro</p>
        {!!entries.length && (
          <button type="button" onClick={() => void onClear?.()} className="btn-ghost h-9 px-3 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Svuota
          </button>
        )}
      </div>

      {!entries.length ? (
        <p className="text-sm text-muted-foreground">Ancora nessuna azione.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed">{entry.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.created_date ? new Date(entry.created_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onDelete?.(entry.id)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Elimina"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
