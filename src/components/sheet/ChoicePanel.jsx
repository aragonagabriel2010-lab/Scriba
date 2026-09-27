import React, { useMemo, useState } from 'react'
import { ABILITIES, SKILLS, CLASSES } from '@/lib/dnd/data'
import { finalScores } from '@/lib/dnd/rules'
import { applyChoice } from '@/lib/actions'

export default function ChoicePanel({ character, choice, onDone }) {
  const def = character.definition
  const points = choice.asiPoints || 0
  const expAllowed = choice.expertise || 0
  const [spent, setSpent] = useState(() => Object.fromEntries(ABILITIES.map((a) => [a.key, 0])))
  const [exp, setExp] = useState([])
  const [error, setError] = useState('')
  const finalS = finalScores(def)
  const cls = CLASSES[def.classKey]
  const used = useMemo(() => ABILITIES.reduce((sum, a) => sum + (spent[a.key] || 0), 0), [spent])
  const remaining = Math.max(0, points - used)

  const add = (key) => {
    if (remaining <= 0) return
    if (finalS[key] + (spent[key] || 0) >= 20) return
    setSpent({ ...spent, [key]: (spent[key] || 0) + 1 })
  }
  const remove = (key) => {
    if (!(spent[key] > 0)) return
    setSpent({ ...spent, [key]: spent[key] - 1 })
  }
  const toggleExp = (name) => {
    if (!def.skills?.includes(name)) return
    setExp(exp.includes(name) ? exp.filter((item) => item !== name) : exp.length < expAllowed ? [...exp, name] : exp)
  }

  const ready = remaining === 0 && exp.length === expAllowed

  const save = async () => {
    const nextAsi = { ...(def.asi || {}) }
    ABILITIES.forEach((a) => {
      if (spent[a.key]) nextAsi[a.key] = (nextAsi[a.key] || 0) + spent[a.key]
    })
    try {
      await applyChoice(character, { ...def, asi: nextAsi, expertise: [...(def.expertise || []), ...exp] })
      onDone?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const classSkills = SKILLS.filter((skill) => cls.skills.includes(skill.name) || def.skills?.includes(skill.name))

  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 space-y-4">
      <div>
        <p className="eyebrow">Livello {choice.level}</p>
        <h2 className="font-display text-2xl mt-1">Metti i punti del livello</h2>
        <p className="text-sm text-muted-foreground mt-1">Tocca + sulle caratteristiche qui sotto. I punti restano subito sulla scheda.</p>
      </div>

      {points > 0 && (
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="eyebrow">Punti rimanenti</p>
          <p className="mt-1 font-display text-4xl tabular-nums text-primary">{remaining}<span className="ml-2 text-lg text-muted-foreground">/ {points}</span></p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {ABILITIES.map((ability) => {
              const extra = spent[ability.key] || 0
              const capped = finalS[ability.key] + extra >= 20
              return (
                <div key={ability.key} className={`rounded-xl border p-3 text-center ${extra ? 'border-primary/50 bg-primary/10' : 'border-border'}`}>
                  <p className="text-[10px] uppercase text-muted-foreground">{ability.short}</p>
                  <p className="font-display text-2xl tabular-nums">{finalS[ability.key] + extra}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button type="button" disabled={!extra} onClick={() => remove(ability.key)} className="step-btn">−</button>
                    <button type="button" disabled={remaining <= 0 || capped} onClick={() => add(ability.key)} className="step-btn">+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {expAllowed > 0 && (
        <div>
          <p className="eyebrow mb-2">Maestria ({exp.length}/{expAllowed})</p>
          <div className="flex flex-wrap gap-1.5">
            {classSkills.map((skill) => (
              <button key={skill.name} type="button" onClick={() => toggleExp(skill.name)} disabled={!def.skills?.includes(skill.name)}
                className={`px-2 py-0.5 rounded-full text-xs border ${exp.includes(skill.name) ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'} disabled:opacity-30`}>
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="button" disabled={!ready} onClick={() => void save()} className="btn-primary w-full h-11">
        Conferma i punti
      </button>
    </div>
  )
}
