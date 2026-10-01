import React from 'react'
import { motion } from 'framer-motion'
import Stepper from '@/components/scriba/Stepper'
import InlineText from '@/components/scriba/InlineText'
import { RACES, CLASSES, SUBCLASSES, PATHS } from '@/lib/dnd/data'
import { defaultAC, finalScores, formatMeters, mod, signed } from '@/lib/dnd/rules'
import { Sparkles } from 'lucide-react'

function subtitle(def) {
  const race = RACES[def.race]
  const cls = CLASSES[def.classKey]
  const sub = def.subclass
    ? (SUBCLASSES[def.classKey] || []).find((item) => item.key === def.subclass)?.name
    : null
  const path = def.path ? PATHS.find((item) => item.key === def.path)?.name : null
  return [race?.name, cls?.name, sub, path, `liv. ${def.level}`].filter(Boolean).join(' · ')
}

export default function SheetHero({
  def,
  state,
  isMaster,
  onEdit,
  onUpdate,
  onRoll,
}) {
  const hp = state.hp ?? def.hpMax
  const temp = state.tempHp || 0
  const scores = finalScores(def)
  const init = mod(scores.des)
  const ac = state.ac ?? defaultAC(def)
  const speed = RACES[def.race]?.speed ?? 9
  const pct = def.hpMax ? Math.max(0, Math.min(1, hp / def.hpMax)) : 0
  const bar = pct > 0.5 ? 'bg-emerald-400/80' : pct > 0.25 ? 'bg-amber-400/80' : 'bg-rose-400/80'

  const setHp = (v) => onUpdate({ hp: Math.max(0, Math.min(def.hpMax, v)) })
  const dmg = (n) => {
    let t = temp
    let h = hp
    let left = n
    if (t > 0) {
      const a = Math.min(t, left)
      t -= a
      left -= a
    }
    onUpdate({ tempHp: t, hp: Math.max(0, h - left) })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sheet-hero relative overflow-hidden rounded-none border-y border-border/80 -mx-5 px-5 py-8 sm:mx-0 sm:rounded-3xl sm:border sm:px-7 sm:py-9"
    >
      <div className="pointer-events-none absolute inset-0 sheet-hero-glow" aria-hidden />
      <div className="relative space-y-7">
        <div>
          {isMaster ? (
            <InlineText
              value={def.name}
              onSave={(v) => onEdit({ definition: { ...def, name: v } })}
              placeholder="Nome"
              className="font-display text-5xl sm:text-6xl leading-none tracking-tight bg-transparent border-0 p-0 focus:outline-none w-full"
            />
          ) : (
            <h1 className="font-display text-5xl sm:text-6xl leading-none tracking-tight">{def.name}</h1>
          )}
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{subtitle(def)}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary/90">Punti ferita</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-6xl sm:text-7xl tabular-nums leading-none">{hp}</span>
              <span className="text-xl text-muted-foreground tabular-nums">/ {def.hpMax}</span>
            </div>
            {temp > 0 && (
              <p className="mt-2 text-xs text-cyan-300/85 tabular-nums">+{temp} temporanei</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ inspiration: !state.inspiration })}
            className={`h-12 w-12 rounded-2xl border grid place-items-center transition ${
              state.inspiration
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Ispirazione"
            title="Ispirazione"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <div className="h-2 rounded-full bg-muted/80 overflow-hidden">
          <div className={`h-full transition-all duration-500 ${bar}`} style={{ width: `${pct * 100}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'CA',
              value: ac,
              control: (
                <Stepper value={ac} min={0} max={30} onChange={(v) => onUpdate({ ac: v })} />
              ),
            },
            {
              label: 'Iniziativa',
              value: signed(init),
              onClick: onRoll
                ? () => onRoll({ label: 'Iniziativa', modifier: init, kind: 'init', sides: 20, count: 1, mode: 'normal' })
                : undefined,
            },
            {
              label: 'Velocità',
              value: formatMeters(speed),
            },
          ].map((item) => {
            const Tag = item.onClick ? 'button' : 'div'
            return (
              <Tag
                key={item.label}
                type={item.onClick ? 'button' : undefined}
                onClick={item.onClick}
                className={`rounded-2xl border border-border/70 bg-background/40 px-3 py-3 text-center ${
                  item.onClick ? 'hover:border-primary/40 hover:bg-primary/5 transition' : ''
                }`}
              >
                <p className="eyebrow">{item.label}</p>
                <p className="mt-1 font-display text-3xl tabular-nums leading-none">{item.value}</p>
                {item.control && <div className="mt-3 flex justify-center">{item.control}</div>}
              </Tag>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 border-t border-border/60">
          {isMaster ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => dmg(1)} className="btn-ghost h-10 px-3 text-xs">−1</button>
              <button type="button" onClick={() => setHp(hp + 1)} className="btn-ghost h-10 px-3 text-xs">+1</button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">I PF salgono spendendo un dado vita.</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted-foreground">PF temp</span>
            <Stepper value={temp} min={0} max={99} onChange={(v) => onUpdate({ tempHp: v })} />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
