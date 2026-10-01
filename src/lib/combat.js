import { defaultAC, finalScores, mod, profBonus } from '@/lib/dnd/rules'

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

export function applyDamage(hp, hpMax, damage) {
  const max = Math.max(1, Number(hpMax) || 1)
  const next = Math.max(0, Math.min(max, (Number(hp) || 0) - Math.max(0, Number(damage) || 0)))
  return { hp: next, hpMax: max }
}

export function applyDamageToEnemy(enemy, damage) {
  const { hp, hpMax } = applyDamage(enemy.hp, enemy.hpMax, damage)
  return { ...enemy, hp, hpMax }
}

export function combatantsFrom(characters, enemies) {
  const players = (characters || [])
    .filter((c) => c.definition)
    .map((c) => {
      const def = c.definition
      const hpMax = def.hpMax || 1
      const hp = c.state?.hp ?? hpMax
      const ac = c.state?.ac != null ? c.state.ac : defaultAC(def)
      return {
        key: `pc:${c.id}`,
        kind: 'pc',
        id: c.id,
        name: def.name || c.player_name,
        hp,
        hpMax,
        ac,
        definition: def,
        character: c,
      }
    })
  const foes = (enemies || []).map((e) => ({
    key: `enemy:${e.id}`,
    kind: 'enemy',
    id: e.id,
    name: e.name,
    hp: e.hp,
    hpMax: e.hpMax,
    ac: e.ac,
    enemy: e,
  }))
  return [...players, ...foes]
}
