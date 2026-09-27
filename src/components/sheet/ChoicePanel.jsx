import React, { useState } from 'react'
import { ABILITIES, SKILLS, CLASSES } from '@/lib/dnd/data'
import { finalScores } from '@/lib/dnd/rules'
import { applyChoice } from '@/lib/actions'

export default function ChoicePanel({ character, onDone }) {
  const def = character.definition
  const choice = character.choice
  const [asi, setAsi] = useState({ mode: 'plus2', picks: [] })
  const [exp, setExp] = useState([])
  const [error, setError] = useState('')
  const finalS = finalScores(def)
  const cls = CLASSES[def.classKey]
  const expAllowed = choice.expertise || 0

  const togglePick = (key) => {
    if (asi.mode === 'plus2') setAsi({ ...asi, picks: [key] })
    else setAsi({ ...asi, picks: asi.picks.includes(key) ? asi.picks.filter((item) => item !== key) : asi.picks.length < 2 ? [...asi.picks, key] : [key] })
  }
  const toggleExp = (name) => {
    if (!def.skills?.includes(name)) return
    setExp(exp.includes(name) ? exp.filter((item) => item !== name) : exp.length < expAllowed ? [...exp, name] : exp)
  }

  const ready = (!choice.asi || (asi.mode === 'plus2' ? asi.picks.length === 1 : asi.picks.length === 2)) && exp.length === expAllowed

  const save = async () => {
    const nextAsi = { ...(def.asi || {}) }
    if (choice.asi && asi.mode === 'plus2' && asi.picks[0]) nextAsi[asi.picks[0]] = (nextAsi[asi.picks[0]] || 0) + 2
    else if (choice.asi && asi.mode === 'split') asi.picks.forEach((key) => { nextAsi[key] = (nextAsi[key] || 0) + 1 })
    try {
      await applyChoice(character, { ...def, asi: nextAsi, expertise: [...(def.expertise || []), ...exp] })
      onDone?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const classSkills = SKILLS.filter((skill) => cls.skills.includes(skill.name) || def.skills?.includes(skill.name))

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <div>
        <p className="eyebrow">Livello {choice.level}</p>
        <h2 className="font-display text-2xl mt-1">Scegli dove mettere i punti</h2>
        <p className="text-sm text-muted-foreground mt-1">Il master ti ha fatto salire. I punti li decidi tu, e restano subito sulla scheda.</p>
      </div>
      {choice.asi && (
        <div>
          <div className="flex gap-2 mb-3">
            {[['plus2', '+2 a una'], ['split', '+1 e +1']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => setAsi({ mode: key, picks: [] })} className={`px-3 py-1 rounded-full text-xs border ${asi.mode === key ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ABILITIES.map((ability) => {
              const count = asi.picks.filter((item) => item === ability.key).length
              const capped = finalS[ability.key] + count >= 20
              return (
                <button key={ability.key} type="button" disabled={capped && count === 0} onClick={() => togglePick(ability.key)}
                  className={`px-2 py-1.5 rounded-lg border text-xs ${count > 0 ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground'} disabled:opacity-30`}>
                  {ability.short} {count > 0 && <span className="text-primary">+{count}</span>}
                </button>
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
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!ready} onClick={() => void save()} className="btn-primary">Metti i punti</button>
        {onDone && <button type="button" onClick={onDone} className="btn-ghost">Chiudi</button>}
      </div>
    </div>
  )
}
