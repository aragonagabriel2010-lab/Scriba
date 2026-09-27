import React, { useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CLASSES } from '@/lib/dnd/data'
import { rollDie, finalScores, computeHpMax, isAsiLevel, expertiseAllowed, classFeaturesAt, hpBonus, mod } from '@/lib/dnd/rules'

export default function LevelUpPanel({ character, open, onClose, patch }) {
  const def = character.definition
  const cls = CLASSES[def.classKey]
  const newLevel = def.level + 1
  const rolledRef = useRef(false)

  useEffect(() => {
    if (!open) { rolledRef.current = false; return }
    if (rolledRef.current) return
    rolledRef.current = true
    const pending = character.levelup
    if (pending && pending.level === newLevel && pending.classKey === def.classKey && pending.roll != null) return
    patch(character.id, { levelup: { classKey: def.classKey, level: newLevel, roll: rollDie(cls.hd) } })
  }, [open])

  const roll = character.levelup?.roll ?? 0
  const gain = Math.max(1, roll + hpBonus(def))
  const needsChoice = isAsiLevel(def.classKey, newLevel) || expertiseAllowed(def.classKey, newLevel) > (def.expertise?.length || 0)

  const confirm = () => {
    const prev = [...(character.hp_rolls?.[def.classKey] || [])]
    if (prev.length < newLevel) prev.push(roll)
    const rolls = { ...(character.hp_rolls || {}), [def.classKey]: prev }
    const newDef = {
      ...def,
      level: newLevel,
      features: [...new Set([...(def.features || []), ...classFeaturesAt(def.classKey, newLevel)])],
    }
    newDef.hpMax = (def.hpMax || computeHpMax(def, character.hp_rolls)) + gain
    const current = character.state?.hp ?? def.hpMax
    const expLeft = expertiseAllowed(def.classKey, newLevel) - (def.expertise?.length || 0)
    patch(character.id, {
      definition: newDef,
      hp_rolls: rolls,
      levelup: null,
      choice: needsChoice ? { level: newLevel, asi: isAsiLevel(def.classKey, newLevel), expertise: Math.max(0, expLeft) } : null,
      state: { ...character.state, hp: Math.min(newDef.hpMax, current + gain) },
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Fai salire {def.name} di livello</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="rounded-xl border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Tiro dado vita d{cls.hd}</p>
            <p className="font-display text-5xl tabular-nums text-primary">{roll}</p>
            <p className="text-sm text-muted-foreground mt-1">+{mod(finalScores(def).cos)} COS{def.race === 'nano_colline' ? ' +1 nano' : ''}{def.classKey === 'stregone' ? ' +1 stregone' : ''} → <span className="text-foreground">+{gain} PF</span></p>
            <p className="text-xs text-muted-foreground/60 mt-1">Il tiro resta, non si ritira.</p>
          </div>
          {needsChoice && <p className="text-sm text-muted-foreground">I punti nuovi li sceglie il giocatore, appena confermi.</p>}
          <button onClick={confirm} disabled={!roll} className="btn-primary w-full">Conferma il livello {newLevel}</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
