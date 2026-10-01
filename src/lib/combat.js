import { finalScores, mod, profBonus } from '@/lib/dnd/rules'

export function attackBonusFor(def, abilityKey) {
  if (!def) return 0
  const scores = finalScores(def)
  const ab = abilityKey && scores[abilityKey] != null ? abilityKey : 'for'
  return mod(scores[ab]) + profBonus(def.level || 1)
}

/** Tiro d20 + bonus vs CA del bersaglio. */
export function resolveVsAc({ d20, bonus, ac }) {
  const targetAc = Number(ac) || 10
  const roll = Number(d20) || 0
  const total = roll + (Number(bonus) || 0)
  const hit = total >= targetAc
  return { roll, bonus, total, ac: targetAc, hit }
}

export function formatVsAc({ roll, bonus, total, ac, hit }) {
  const cmp = `${roll}${bonus >= 0 ? `+${bonus}` : bonus}=${total} vs CA ${ac}`
  return `${cmp} — ${hit ? 'Colpo' : 'Mancato'}`
}

export function applyDamageToEnemy(enemy, damage) {
  const hpMax = Math.max(1, Number(enemy.hpMax) || 1)
  const hp = Math.max(0, Math.min(hpMax, (Number(enemy.hp) || 0) - Math.max(0, Number(damage) || 0)))
  return { ...enemy, hp, hpMax }
}
