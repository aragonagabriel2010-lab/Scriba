export const MAP_SIZE = 32
export const REGION_SIZE = 8
export const CELL_PX = 18

export const REGION_TYPES = [
  { key: 'pianura', label: 'Pianura', color: '#8fbc6b' },
  { key: 'collina', label: 'Collina', color: '#a3c47a' },
  { key: 'montagne', label: 'Montagne', color: '#8a8680' },
  { key: 'palude', label: 'Palude', color: '#5f7a5a' },
]

export const MARKER_TYPES = [
  { key: 'piccolo_villaggio', label: 'Piccolo villaggio', size: 1, color: '#d4a574', glyph: '·' },
  { key: 'villaggio', label: 'Villaggio', size: 1, color: '#c48a4a', glyph: 'v' },
  { key: 'grotta', label: 'Grotta', size: 1, color: '#6b635a', glyph: 'o' },
  { key: 'citta', label: 'Città', size: 2, color: '#c45c3a', glyph: 'C' },
  { key: 'regno', label: 'Regno', size: 4, color: '#8b3a3a', glyph: 'R' },
]

export const TOOLS = [
  { key: 'terrain', label: 'Disegna terreno' },
  { key: 'erase', label: 'Mare (cancella)' },
  { key: 'river', label: 'Disegna fiumi' },
  { key: 'region', label: 'Regione' },
  { key: 'marker', label: 'Luogo' },
  { key: 'move', label: 'Sposta' },
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
    width: MAP_SIZE,
    height: MAP_SIZE,
    land: [],
    rivers: [],
    regions: {},
    markers: [],
    positions: {},
    party: null,
  }
}

export function normalizeMap(raw) {
  const base = emptyMap()
  if (!raw || typeof raw !== 'object') return base
  return {
    width: MAP_SIZE,
    height: MAP_SIZE,
    land: Array.isArray(raw.land) ? raw.land.map(String).filter(Boolean).slice(0, MAP_SIZE * MAP_SIZE) : [],
    rivers: Array.isArray(raw.rivers)
      ? raw.rivers
        .filter((r) => Array.isArray(r))
        .map((r) => r.map(String).slice(0, 400))
        .slice(0, 40)
      : [],
    regions: raw.regions && typeof raw.regions === 'object' ? { ...raw.regions } : {},
    markers: Array.isArray(raw.markers)
      ? raw.markers.slice(0, 80).map((m) => ({
        id: String(m.id || `m-${Math.random().toString(36).slice(2, 8)}`),
        type: MARKER_TYPES.some((t) => t.key === m.type) ? m.type : 'villaggio',
        x: Math.max(0, Math.min(MAP_SIZE - 1, Number(m.x) || 0)),
        y: Math.max(0, Math.min(MAP_SIZE - 1, Number(m.y) || 0)),
      }))
      : [],
    positions: raw.positions && typeof raw.positions === 'object' ? { ...raw.positions } : {},
    party: raw.party && typeof raw.party.x === 'number'
      ? {
        x: Math.max(0, Math.min(MAP_SIZE - 1, raw.party.x)),
        y: Math.max(0, Math.min(MAP_SIZE - 1, raw.party.y)),
      }
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
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return map
  const key = cellKey(x, y)
  const set = landSet(map)
  if (on) set.add(key)
  else set.delete(key)
  return { ...map, land: [...set] }
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
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return map
  const key = cellKey(x, y)
  const rivers = (map.rivers || []).map((r) => [...r])
  while (rivers.length <= riverIndex) rivers.push([])
  const line = rivers[riverIndex]
  if (line[line.length - 1] !== key) line.push(key)
  rivers[riverIndex] = line
  return { ...map, rivers }
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
  const max = MAP_SIZE - info.size
  const px = Math.max(0, Math.min(max, x))
  const py = Math.max(0, Math.min(max, y))
  const markers = [...(map.markers || [])]
  // replace overlapping same-origin markers
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
  const px = Math.max(0, Math.min(MAP_SIZE - 1, x))
  const py = Math.max(0, Math.min(MAP_SIZE - 1, y))
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

export function riverCells(map) {
  const set = new Set()
  for (const river of map.rivers || []) {
    for (const key of river) set.add(key)
  }
  return set
}
