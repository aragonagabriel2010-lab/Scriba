export const REGION_SIZE = 5
export const CELL_PX = 18
export const MAX_LAND_CELLS = 14000
export const MAX_RIVERS = 40
export const MAX_RIVER_POINTS = 500

export const REGION_TYPES = [
  { key: 'pianura', label: 'Pianura', color: '#d4b84a' },
  { key: 'collina', label: 'Collina', color: '#a3c47a' },
  { key: 'montagne', label: 'Montagne', color: '#8a8680' },
  { key: 'palude', label: 'Palude', color: '#5f7a5a' },
  { key: 'foresta', label: 'Foresta', color: '#2d5a3a' },
]

export const MARKER_TYPES = [
  { key: 'piccolo_villaggio', label: 'Piccolo villaggio', size: 1, color: '#d4a574', glyph: '·' },
  { key: 'villaggio', label: 'Villaggio', size: 1, color: '#c48a4a', glyph: 'v' },
  { key: 'grotta', label: 'Grotta', size: 1, color: '#6b635a', glyph: 'o' },
  { key: 'citta', label: 'Città', size: 2, color: '#c45c3a', glyph: 'C' },
  { key: 'regno', label: 'Regno', size: 4, color: '#8b3a3a', glyph: 'R' },
]

export const TOOLS = [
  { key: 'hand', label: 'Muovi mappa' },
  { key: 'terrain', label: 'Disegna terreno' },
  { key: 'erase', label: 'Mare (cancella)' },
  { key: 'river', label: 'Disegna fiumi' },
  { key: 'region', label: 'Regione' },
  { key: 'marker', label: 'Luogo' },
  { key: 'move', label: 'Sposta pedine' },
]

export function cellKey(x, y) {
  return `${x},${y}`
}

export function parseCell(key) {
  const [x, y] = String(key).split(',').map(Number)
  return { x, y }
}

export function emptyMap() {
  return {
    version: 2,
    land: [],
    rivers: [],
    regions: {},
    markers: [],
    positions: {},
    party: null,
  }
}

function normalizeRivers(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(0, MAX_RIVERS)
    .map((item) => {
      if (item && typeof item === 'object' && Array.isArray(item.points)) {
        return { points: item.points.map(String).filter(Boolean).slice(0, MAX_RIVER_POINTS) }
      }
      if (Array.isArray(item)) {
        return { points: item.map(String).filter(Boolean).slice(0, MAX_RIVER_POINTS) }
      }
      return { points: [] }
    })
    .filter((r) => r.points.length > 0)
}

export function normalizeMap(raw) {
  const base = emptyMap()
  if (!raw || typeof raw !== 'object') return base
  const clampCoord = (n) => Math.max(-4000, Math.min(4000, Math.round(Number(n) || 0)))
  return {
    version: 2,
    land: Array.isArray(raw.land) ? raw.land.map(String).filter(Boolean).slice(0, MAX_LAND_CELLS) : [],
    rivers: normalizeRivers(raw.rivers),
    regions: raw.regions && typeof raw.regions === 'object' ? { ...raw.regions } : {},
    markers: Array.isArray(raw.markers)
      ? raw.markers.slice(0, 80).map((m) => ({
        id: String(m.id || `m-${Math.random().toString(36).slice(2, 8)}`),
        type: MARKER_TYPES.some((t) => t.key === m.type) ? m.type : 'villaggio',
        x: clampCoord(m.x),
        y: clampCoord(m.y),
      }))
      : [],
    positions: raw.positions && typeof raw.positions === 'object' ? { ...raw.positions } : {},
    party: raw.party && typeof raw.party.x === 'number'
      ? { x: clampCoord(raw.party.x), y: clampCoord(raw.party.y) }
      : null,
  }
}

export function landSet(map) {
  return new Set(map.land || [])
}

export function regionKey(x, y) {
  return `${Math.floor(x / REGION_SIZE)},${Math.floor(y / REGION_SIZE)}`
}

export function markerType(type) {
  return MARKER_TYPES.find((t) => t.key === type) || MARKER_TYPES[1]
}

export function markerCovers(marker, x, y) {
  const size = markerType(marker.type).size
  return x >= marker.x && x < marker.x + size && y >= marker.y && y < marker.y + size
}

export function paintLand(map, x, y, on = true) {
  const key = cellKey(x, y)
  const set = landSet(map)
  if (on) set.add(key)
  else set.delete(key)
  const land = [...set].slice(0, MAX_LAND_CELLS)
  return { ...map, land }
}

export function paintLandBrush(map, x, y, on = true, radius = 0) {
  let next = map
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      next = paintLand(next, x + dx, y + dy, on)
    }
  }
  return next
}

export function appendRiverPoint(map, riverIndex, x, y) {
  const key = cellKey(x, y)
  const rivers = (map.rivers || []).map((r) => ({ points: [...(r.points || [])] }))
  while (rivers.length <= riverIndex) rivers.push({ points: [] })
  const line = rivers[riverIndex].points
  if (line[line.length - 1] !== key) line.push(key)
  if (line.length > MAX_RIVER_POINTS) line.splice(0, line.length - MAX_RIVER_POINTS)
  rivers[riverIndex] = { points: line }
  return { ...map, rivers: rivers.slice(0, MAX_RIVERS) }
}

export function setRegionAt(map, x, y, type) {
  const key = regionKey(x, y)
  const regions = { ...(map.regions || {}) }
  if (!type) delete regions[key]
  else regions[key] = type
  return { ...map, regions }
}

export function placeMarker(map, type, x, y) {
  const info = markerType(type)
  const px = Math.round(x)
  const py = Math.round(y)
  const markers = [...(map.markers || [])]
  const filtered = markers.filter((m) => !(m.x === px && m.y === py))
  filtered.push({
    id: `m-${Date.now()}`,
    type: info.key,
    x: px,
    y: py,
  })
  return { ...map, markers: filtered }
}

export function removeMarkerAt(map, x, y) {
  return {
    ...map,
    markers: (map.markers || []).filter((m) => !markerCovers(m, x, y)),
  }
}

export function setPosition(map, who, x, y) {
  const px = Math.round(x)
  const py = Math.round(y)
  if (who === 'party') {
    return { ...map, party: { x: px, y: py } }
  }
  return {
    ...map,
    positions: {
      ...(map.positions || {}),
      [who]: { x: px, y: py },
    },
  }
}

export function clearPosition(map, who) {
  if (who === 'party') return { ...map, party: null }
  const positions = { ...(map.positions || {}) }
  delete positions[who]
  return { ...map, positions }
}

export function riverLines(map) {
  return (map.rivers || []).map((r) => (r?.points ? r.points : []))
}

export function riverCells(map) {
  const set = new Set()
  for (const line of riverLines(map)) {
    for (const key of line) set.add(key)
  }
  return set
}

export function mapContentBounds(map) {
  let minX = 0
  let minY = 0
  let maxX = 0
  let maxY = 0
  let any = false
  const touch = (x, y) => {
    if (!any) {
      minX = maxX = x
      minY = maxY = y
      any = true
      return
    }
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  for (const key of map.land || []) {
    const { x, y } = parseCell(key)
    touch(x, y)
  }
  for (const line of riverLines(map)) {
    for (const key of line) {
      const { x, y } = parseCell(key)
      touch(x, y)
    }
  }
  for (const m of map.markers || []) {
    const s = markerType(m.type).size
    touch(m.x, m.y)
    touch(m.x + s - 1, m.y + s - 1)
  }
  if (map.party) touch(map.party.x, map.party.y)
  for (const pos of Object.values(map.positions || {})) {
    if (pos) touch(pos.x, pos.y)
  }
  if (!any) return { minX: -8, minY: -8, maxX: 8, maxY: 8 }
  return { minX: minX - 4, minY: minY - 4, maxX: maxX + 4, maxY: maxY + 4 }
}
