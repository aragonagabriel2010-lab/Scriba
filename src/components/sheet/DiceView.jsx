import React, { useEffect, useState } from 'react'
import Stepper from '@/components/scriba/Stepper'
import { RACES } from '@/lib/dnd/data'
import { rollDie, signed } from '@/lib/dnd/rules'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceView({ character, preset, onPresetConsumed }) {
  const [sides, setSides] = useState(20)
  const [count, setCount] = useState(1)
  const [mode, setMode] = useState('normal') // normal | advantage | disadvantage
  const [modifier, setModifier] = useState(0)
  const [label, setLabel] = useState('')
  const [result, setResult] = useState(null)
  const lucky = !!RACES[character?.definition?.race]?.lucky
  const d20Special = sides === 20 && count === 1 && mode !== 'normal'

  useEffect(() => {
    if (!preset) return
    setSides(preset.sides || 20)
    setCount(preset.count || 1)
    setMode(preset.mode || 'normal')
    setModifier(Number(preset.modifier) || 0)
    setLabel(preset.label || '')
    setResult(null)
    onPresetConsumed?.()
  }, [preset])

  const roll = () => {
    if (d20Special) {
      const a = rollDie(20)
      const b = rollDie(20)
      const kept = mode === 'advantage' ? Math.max(a, b) : Math.min(a, b)
      const dropped = mode === 'advantage' ? Math.min(a, b) : Math.max(a, b)
      const natural = kept
      setResult({
        sides: 20,
        mode,
        rolls: [a, b],
        kept,
        dropped,
        natural,
        diceTotal: kept,
        total: kept + modifier,
        modifier,
        label,
        crit: natural === 20,
        fumble: natural === 1,
        hint: lucky && kept === 1 ? 'È uscito 1: ritira il d20.' : null,
      })
      return
    }
    const rolls = Array.from({ length: count }, () => rollDie(sides))
    const diceTotal = rolls.reduce((sum, value) => sum + value, 0)
    const natural = sides === 20 && count === 1 ? rolls[0] : null
    setResult({
      sides,
      mode: 'normal',
      rolls,
      natural,
      diceTotal,
      total: diceTotal + modifier,
      modifier,
      label,
      crit: natural === 20,
      fumble: natural === 1,
      hint: lucky && sides === 20 && rolls.includes(1) ? 'È uscito 1: ritira il d20.' : null,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{label ? 'Tiro dalla scheda' : 'Tiro libero'}</p>
        <h1 className="font-display text-4xl mt-2">Dadi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {label
            ? `${label} · modificatore ${signed(modifier)}`
            : 'Scegli il dado e quanti tirarne. Sul d20 puoi usare vantaggio o svantaggio.'}
        </p>
      </div>

      <div>
        <p className="eyebrow mb-3">Quale dado</p>
        <div className="flex flex-wrap gap-2">
          {DICE.map((die) => (
            <button key={die} type="button" onClick={() => { setSides(die); if (die !== 20) setMode('normal'); setResult(null) }}
              className={`h-12 min-w-14 px-3 rounded-full border font-mono text-sm transition ${sides === die ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              d{die}
            </button>
          ))}
        </div>
      </div>

      {sides === 20 && (
        <div>
          <p className="eyebrow mb-3">d20</p>
          <div className="grid grid-cols-3 gap-2">
            {[['normal', 'Normale'], ['advantage', 'Vantaggio'], ['disadvantage', 'Svantaggio']].map(([key, labelMode]) => (
              <button key={key} type="button" onClick={() => { setMode(key); if (key !== 'normal') setCount(1); setResult(null) }}
                className={`h-12 rounded-xl border text-sm transition ${mode === key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'}`}>
                {labelMode}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-5 py-4">
        <div>
          <p className="eyebrow">Quanti</p>
          <p className="mt-1 font-mono text-lg">{d20Special ? `2d20 (${mode === 'advantage' ? 'vantaggio' : 'svantaggio'})` : `${count}d${sides}`}</p>
        </div>
        <Stepper value={count} min={1} max={40} onChange={(v) => { setCount(v); if (v !== 1) setMode('normal'); setResult(null) }} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-5 py-4">
        <div>
          <p className="eyebrow">Modificatore</p>
          <p className="mt-1 font-mono text-lg">{signed(modifier)}</p>
        </div>
        <Stepper value={modifier} min={-20} max={40} onChange={(v) => { setModifier(v); setResult(null) }} />
      </div>

      <button type="button" onClick={roll} className="btn-primary w-full h-12">
        {label ? `Lancia · ${label}` : 'Lancia'}
      </button>

      {result && (
        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
          {result.label && <p className="text-sm text-muted-foreground">{result.label}</p>}
          <p className="eyebrow">
            {result.mode === 'advantage' ? 'Vantaggio' : result.mode === 'disadvantage' ? 'Svantaggio' : `${result.rolls.length}d${result.sides}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.rolls.map((value, index) => (
              <span
                key={index}
                className={`h-14 w-14 rounded-xl border grid place-items-center font-mono text-lg tabular-nums ${
                  result.mode !== 'normal' && value === result.dropped ? 'border-border/50 text-muted-foreground/50 line-through' : 'border-border'
                }`}
              >
                {value}
              </span>
            ))}
          </div>
          {result.mode === 'normal' ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              {result.rolls.join(' + ')}
              {result.modifier ? ` ${result.modifier >= 0 ? '+' : '−'}${Math.abs(result.modifier)}` : ''}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Si tiene {result.kept}, si scarta {result.dropped}
              {result.modifier ? ` · poi ${signed(result.modifier)}` : ''}.
            </p>
          )}
          <p className="font-display text-5xl tabular-nums">{result.total}</p>
          {result.crit && <p className="text-sm text-emerald-300/90">20 naturale — Critico!</p>}
          {result.fumble && !result.hint && <p className="text-sm text-rose-300/90">1 naturale — Fallimento critico.</p>}
          {result.hint && <p className="text-sm text-primary">{result.hint}</p>}
        </div>
      )}
    </div>
  )
}
