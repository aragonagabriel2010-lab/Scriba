import React, { useMemo, useState } from 'react'
import { Dice5, Trash2 } from 'lucide-react'
import { ABILITIES } from '@/lib/dnd/data'
import { rollDie } from '@/lib/dnd/rules'
import {
  applyDamage,
  applyDamageToEnemy,
  attackBonusFor,
  combatantsFrom,
  formatVsAc,
  resolveVsAc,
} from '@/lib/combat'

const ACTIONS = [
  { key: 'attacca', label: 'attacca', kind: 'attack' },
  { key: 'colpisce', label: 'colpisce', kind: 'attack' },
  { key: 'prova', label: 'fa una prova', kind: 'check' },
]

function formatRoll(result) {
  if (!result) return ''
  if (result.mode === 'advantage' || result.mode === 'disadvantage') {
    return `${result.total} (${result.rolls.join(', ')})`
  }
  if (result.rolls.length === 1) return String(result.total)
  return `${result.total} [${result.rolls.join('+')}]`
}

export function buildCombatLine({ attacker, verb, ability, rollText, target, extra = '' }) {
  const withAbility = ability ? ` con ${ability}` : ''
  const withRoll = rollText ? ` con ${rollText}` : ''
  const tail = extra ? ` ${extra}` : ''
  return `${attacker} ${verb}${withAbility}${withRoll} a ${target}${tail}`
}

function optionLabel(c) {
  const tag = c.kind === 'pc' ? 'PG' : 'Nemico'
  return `${c.name} · ${tag} · CA ${c.ac} · ${c.hp}/${c.hpMax} PF`
}

export default function CombatLogPanel({
  characters,
  enemies,
  entries,
  onAdd,
  onClear,
  onDelete,
  onPatchEnemy,
  onPatchCharacter,
}) {
  const combatants = useMemo(() => combatantsFrom(characters, enemies), [characters, enemies])

  const [attackerKey, setAttackerKey] = useState('')
  const [targetKey, setTargetKey] = useState('')
  const [ability, setAbility] = useState('for')
  const [verb, setVerb] = useState('attacca')
  const [enemyBonus, setEnemyBonus] = useState(0)
  const [sides, setSides] = useState(20)
  const [count, setCount] = useState(1)
  const [mode, setMode] = useState('normal')
  const [result, setResult] = useState(null)
  const [manual, setManual] = useState('')
  const [dmgSides, setDmgSides] = useState(8)
  const [dmgCount, setDmgCount] = useState(1)
  const [dmgResult, setDmgResult] = useState(null)
  const [dmgManual, setDmgManual] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const attacker = combatants.find((c) => c.key === attackerKey) || null
  const target = combatants.find((c) => c.key === targetKey) || null
  const action = ACTIONS.find((a) => a.key === verb) || ACTIONS[0]
  const isAttack = action.kind === 'attack'
  const abilityLabel = ABILITIES.find((a) => a.key === ability)?.label || ''
  const verbLabel = action.label
  const bonus = attacker?.kind === 'pc'
    ? attackBonusFor(attacker.definition, ability)
    : (Number(enemyBonus) || 0)

  const d20Face = manual.trim()
    ? Number(manual) || 0
    : (sides === 20 && result ? result.total : null)

  const attackResolve = isAttack && target && d20Face != null && sides === 20
    ? resolveVsAc({ d20: d20Face, bonus, ac: target.ac })
    : null

  const rollText = manual.trim() || formatRoll(result)
  const damageAmount = dmgManual.trim()
    ? Math.max(0, Number(dmgManual) || 0)
    : (dmgResult ? dmgResult.total : 0)

  const canApplyDamage = isAttack && target && attackResolve?.hit && damageAmount > 0
  const hpAfter = canApplyDamage ? applyDamage(target.hp, target.hpMax, damageAmount).hp : null
  const damageDice = attackResolve?.crit ? dmgCount * 2 : dmgCount

  const extraParts = []
  if (attackResolve) extraParts.push(formatVsAc(attackResolve))
  if (canApplyDamage) {
    extraParts.push(
      attackResolve?.crit
        ? `${damageAmount} danni (critico), restano ${hpAfter} PF`
        : `${damageAmount} danni, restano ${hpAfter} PF`,
    )
  }
  const extra = extraParts.length ? `(${extraParts.join(', ')})` : ''

  const preview = attacker && target
    ? buildCombatLine({
      attacker: attacker.name,
      verb: verbLabel,
      ability: abilityLabel,
      rollText: isAttack && sides === 20 && attackResolve
        ? `${attackResolve.roll}${bonus >= 0 ? `+${bonus}` : bonus}=${attackResolve.total}`
        : rollText,
      target: `${target.name} (CA ${target.ac})`,
      extra,
    })
    : ''

  const roll = () => {
    setManual('')
    setDmgResult(null)
    setDmgManual('')
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

  const rollDamage = () => {
    setDmgManual('')
    const rolls = Array.from({ length: damageDice }, () => rollDie(dmgSides))
    setDmgResult({ sides: dmgSides, rolls, total: rolls.reduce((s, n) => s + n, 0), crit: !!attackResolve?.crit })
  }

  const save = async () => {
    if (!attacker || !target) return
    if (attacker.key === target.key) {
      setError('Attaccante e subente devono essere diversi.')
      return
    }
    if (isAttack && sides === 20 && !attackResolve) {
      setError('Lancia o scrivi il tiro sul d20 per confrontarlo con la CA.')
      return
    }
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
        roll_total: attackResolve ? attackResolve.total : (result?.total ?? (Number(manual) || 0)),
        roll_text: rollText,
        rolls: result?.rolls || [],
        sides,
        count,
        hit: attackResolve?.hit ?? null,
        target_ac: target.ac,
        damage: canApplyDamage ? damageAmount : 0,
      })
      if (canApplyDamage) {
        if (target.kind === 'enemy' && onPatchEnemy) {
          await onPatchEnemy(applyDamageToEnemy(target.enemy, damageAmount), target.id)
        } else if (target.kind === 'pc' && onPatchCharacter) {
          const { hp } = applyDamage(target.hp, target.hpMax, damageAmount)
          await onPatchCharacter(target.id, {
            state: { ...target.character.state, hp },
          })
        }
      }
      setResult(null)
      setManual('')
      setDmgResult(null)
      setDmgManual('')
    } catch (err) {
      setError(err.message || 'Qualcosa è andato storto.')
    } finally {
      setBusy(false)
    }
  }

  const canRegister = attacker && target && attacker.key !== target.key && rollText && (!isAttack || sides !== 20 || attackResolve)
  const attackerOptions = combatants.filter((c) => c.key !== targetKey)
  const targetOptions = combatants.filter((c) => c.key !== attackerKey)

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Azioni</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Attaccante e subente possono essere PG o nemici. Sul d20 confrontiamo la CA e, se colpisce, togliamo i PF.
        </p>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label>
            <span className="eyebrow">Attaccante</span>
            <select value={attackerKey} onChange={(e) => setAttackerKey(e.target.value)} className="scriba-input mt-2 h-11">
              <option value="">Scegli…</option>
              {attackerOptions.map((c) => (
                <option key={c.key} value={c.key}>{optionLabel(c)}</option>
              ))}
            </select>
            {attacker?.kind === 'pc' && isAttack && (
              <p className="mt-1 text-xs text-muted-foreground">Bonus attacco: {bonus >= 0 ? `+${bonus}` : bonus}</p>
            )}
            {attacker?.kind === 'enemy' && isAttack && (
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                Bonus attacco
                <input
                  type="number"
                  value={enemyBonus}
                  onChange={(e) => setEnemyBonus(e.target.value)}
                  className="scriba-input h-9 w-16 text-center"
                />
              </label>
            )}
          </label>
          <label>
            <span className="eyebrow">Subente</span>
            <select value={targetKey} onChange={(e) => setTargetKey(e.target.value)} className="scriba-input mt-2 h-11">
              <option value="">Scegli…</option>
              {targetOptions.map((c) => (
                <option key={c.key} value={c.key}>{optionLabel(c)}</option>
              ))}
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
          <p className="eyebrow">{isAttack ? 'Tiro per colpire' : 'Dadi'}</p>
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
          {isAttack && sides !== 20 && (
            <p className="text-xs text-amber-200/80">Per la CA usa il d20.</p>
          )}
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
              o d20
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
          {attackResolve && (
            <p className={`text-sm ${attackResolve.fumble ? 'text-rose-300/90' : attackResolve.crit ? 'text-emerald-300/90' : attackResolve.hit ? 'text-emerald-300/90' : 'text-rose-300/90'}`}>
              {formatVsAc(attackResolve)}
            </p>
          )}
        </div>

        {isAttack && attackResolve?.hit && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="eyebrow">Danno{attackResolve.crit ? ' · critico (2× dadi)' : ''}</p>
            {attackResolve.crit && (
              <p className="text-xs text-emerald-300/80">Critico: si tirano il doppio dei dadi del danno ({damageDice}d{dmgSides}).</p>
            )}
            <div className="flex flex-wrap gap-2">
              {[4, 6, 8, 10, 12].map((die) => (
                <button
                  key={die}
                  type="button"
                  onClick={() => setDmgSides(die)}
                  className={`h-10 min-w-12 px-3 rounded-full border font-mono text-sm transition ${dmgSides === die ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}
                >
                  d{die}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Quanti
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dmgCount}
                  onChange={(e) => setDmgCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className="scriba-input h-10 w-16 text-center"
                />
              </label>
              <button type="button" onClick={rollDamage} className="btn-ghost h-10 px-4 text-sm">
                <Dice5 className="w-4 h-4" /> Lancia danno
              </button>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                o scrivi
                <input
                  value={dmgManual}
                  onChange={(e) => { setDmgManual(e.target.value.slice(0, 20)); setDmgResult(null) }}
                  placeholder="8"
                  className="scriba-input h-10 w-20 text-center font-mono"
                />
              </label>
            </div>
            {dmgResult && !dmgManual && (
              <p className="font-mono text-xl tabular-nums">{formatRoll({ ...dmgResult, mode: 'normal' })}</p>
            )}
            {canApplyDamage && (
              <p className="text-xs text-muted-foreground">
                {target.name}: {target.hp} → {hpAfter} PF
              </p>
            )}
          </div>
        )}

        {preview && (
          <p className="rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm leading-relaxed">{preview}</p>
        )}

        <button
          type="button"
          disabled={busy || !canRegister}
          onClick={() => void save()}
          className="btn-primary h-11 px-4 text-sm"
        >
          {busy ? 'Attendi…' : 'Registra'}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!combatants.length && <p className="text-sm text-muted-foreground">Servono personaggi o nemici sul tavolo.</p>}
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
