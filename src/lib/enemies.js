export function enemyInitiativeId(enemyId) {
  return `enemy:${enemyId}`
}

export function nextEnemyCopyName(name, enemies) {
  const raw = String(name || '').trim() || 'Nemico'
  const base = raw.replace(/\s+\d+$/, '').trim() || raw
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^${escaped}(?:\\s+(\\d+))?$`, 'i')
  let max = 1
  for (const enemy of enemies || []) {
    const match = String(enemy.name || '').trim().match(re)
    if (!match) continue
    max = Math.max(max, match[1] ? Number(match[1]) : 1)
  }
  return `${base} ${max + 1}`.slice(0, 40)
}
