import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Map as MapIcon, Trash2, Users } from 'lucide-react'
import MapCanvas from './MapCanvas'
import {
  MARKER_TYPES,
  REGION_TYPES,
  TOOLS,
  appendRiverPoint,
  clearPosition,
  emptyMap,
  normalizeMap,
  paintLandBrush,
  placeMarker,
  removeMarkerAt,
  setPosition,
  setRegionAt,
} from '@/lib/map'
import { getSession } from '@/lib/session'

export default function MapView({ table, characters, isMaster, onSaveMap }) {
  const [map, setMap] = useState(() => normalizeMap(table?.map))
  const [tool, setTool] = useState('hand')
  const [regionType, setRegionType] = useState('pianura')
  const [markerType, setMarkerType] = useState('villaggio')
  const [removeMarkerMode, setRemoveMarkerMode] = useState(false)
  const [moveTarget, setMoveTarget] = useState('party')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [ready, setReady] = useState(!!table?.map)
  const riverIndex = useRef(-1)
  const lastPaint = useRef('')

  useEffect(() => {
    if (!dirty) {
      setMap(normalizeMap(table?.map))
      if (table?.map) setReady(true)
    }
  }, [table?.map, dirty])

  useEffect(() => {
    if (!ready) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [ready])

  const persist = useCallback(async (next) => {
    if (!isMaster || !onSaveMap) return
    setSaving(true)
    setMsg('')
    try {
      await onSaveMap(next)
      setDirty(false)
      setReady(true)
      setMsg('Mappa salvata.')
    } catch (err) {
      setMsg(err.message || 'Salvataggio non riuscito.')
    } finally {
      setSaving(false)
    }
  }, [isMaster, onSaveMap])

  const commit = useCallback((updater) => {
    setMap((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      setDirty(true)
      return next
    })
  }, [])

  const onPaintCell = (x, y, isStart) => {
    if (!isMaster) return
    const key = `${x},${y}`
    if (!isStart && lastPaint.current === key && tool !== 'river') return
    lastPaint.current = key

    if (tool === 'terrain') {
      commit((m) => paintLandBrush(m, x, y, true, 0))
      return
    }
    if (tool === 'erase') {
      commit((m) => paintLandBrush(m, x, y, false, 0))
      return
    }
    if (tool === 'river') {
      commit((m) => {
        let idx = riverIndex.current
        if (isStart || idx < 0) {
          idx = m.rivers?.length || 0
          riverIndex.current = idx
        }
        return appendRiverPoint(m, idx, x, y)
      })
      return
    }
    if (tool === 'region') {
      if (!isStart) return
      commit((m) => setRegionAt(m, x, y, regionType))
      return
    }
    if (tool === 'marker') {
      if (!isStart) return
      if (removeMarkerMode) {
        commit((m) => removeMarkerAt(m, x, y))
        return
      }
      commit((m) => placeMarker(m, markerType, x, y))
      return
    }
    if (tool === 'move') {
      if (!isStart) return
      commit((m) => setPosition(m, moveTarget, x, y))
    }
  }

  const onPointerUp = () => {
    lastPaint.current = ''
    if (tool === 'river') riverIndex.current = -1
  }

  const createBlank = () => {
    const next = emptyMap()
    setMap(next)
    setDirty(true)
    setReady(true)
    void persist(next)
  }

  const clearRivers = () => commit((m) => ({ ...m, rivers: [] }))
  const clearMarkers = () => commit((m) => ({ ...m, markers: [] }))
  const clearPlayers = () => commit((m) => ({ ...m, positions: {}, party: null }))

  const players = (characters || []).filter((c) => c.definition)
  const session = getSession()
  const myId = session?.characterId
  const myPos = myId && map.positions?.[myId] ? map.positions[myId] : null

  if (!ready && !isMaster) {
    return (
      <div className="space-y-4">
        <p className="eyebrow">Mappa del mondo</p>
        <h1 className="font-display text-4xl mt-2">Mappa</h1>
        <p className="text-sm text-muted-foreground">Il master non ha ancora creato la mappa.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 overflow-hidden">
      <div className="shrink-0">
        <p className="eyebrow">Mappa del mondo</p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1">Mappa</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
          Zoom con la rotella (solo sulla mappa). Regioni 5×5 · mare = tutto ciò che non chiudi con il terreno.
        </p>
      </div>

      {!ready && isMaster && (
        <button type="button" onClick={createBlank} className="btn-primary h-11 px-4 text-sm">
          <MapIcon className="w-4 h-4" /> Crea mappa
        </button>
      )}

      {ready && (
        <>
          {isMaster && (
            <div className="shrink-0 space-y-3 max-h-[38vh] overflow-y-auto overscroll-contain pr-1">
              <div>
                <p className="eyebrow mb-2">Strumento</p>
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTool(item.key)}
                      className={`h-10 px-3 rounded-full border text-sm transition ${
                        tool === item.key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {tool === 'region' && (
                <div>
                  <p className="eyebrow mb-2">Tipo regione (5×5)</p>
                  <div className="flex flex-wrap gap-2">
                    {REGION_TYPES.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setRegionType(item.key)}
                        className={`h-10 px-3 rounded-full border text-sm transition ${
                          regionType === item.key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                        }`}
                      >
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: item.color }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === 'marker' && (
                <div>
                  <p className="eyebrow mb-2">Luogo preimpostato</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKER_TYPES.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => { setMarkerType(item.key); setRemoveMarkerMode(false) }}
                        className={`h-10 px-3 rounded-full border text-sm transition ${
                          !removeMarkerMode && markerType === item.key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                        }`}
                      >
                        {item.label}
                        {item.size > 1 ? ` (${item.size}×${item.size})` : ''}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRemoveMarkerMode(true)}
                      className={`h-10 px-3 rounded-full border text-sm transition ${
                        removeMarkerMode ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                      }`}
                    >
                      Rimuovi luogo
                    </button>
                  </div>
                  {removeMarkerMode && (
                    <p className="mt-2 text-xs text-muted-foreground">Tocca un luogo per toglierlo.</p>
                  )}
                </div>
              )}

              {tool === 'move' && (
                <div>
                  <p className="eyebrow mb-2">Chi sposti</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setMoveTarget('party')}
                      className={`h-10 px-3 rounded-full border text-sm transition ${
                        moveTarget === 'party' ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 inline mr-1" />
                      Tutto il gruppo
                    </button>
                    {players.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setMoveTarget(p.id)}
                        className={`h-10 px-3 rounded-full border text-sm transition ${
                          moveTarget === p.id ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                        }`}
                      >
                        {p.definition?.name || p.player_name}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Tocca la casella di destinazione sulla mappa.</p>
                  {moveTarget !== 'party' && (
                    <button
                      type="button"
                      onClick={() => commit((m) => clearPosition(m, moveTarget))}
                      className="mt-2 btn-ghost h-9 px-3 text-xs"
                    >
                      Togli questa pedina
                    </button>
                  )}
                  {moveTarget === 'party' && map.party && (
                    <button
                      type="button"
                      onClick={() => commit((m) => clearPosition(m, 'party'))}
                      className="mt-2 btn-ghost h-9 px-3 text-xs"
                    >
                      Togli il gruppo
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={saving || !dirty} onClick={() => void persist(map)} className="btn-primary h-11 px-4 text-sm">
                  {saving ? 'Salvo…' : dirty ? 'Salva mappa' : 'Salvata'}
                </button>
                <button type="button" onClick={clearRivers} className="btn-ghost h-11 px-4 text-sm">
                  <Eraser className="w-3.5 h-3.5" /> Svuota fiumi
                </button>
                <button type="button" onClick={clearMarkers} className="btn-ghost h-11 px-4 text-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Svuota luoghi
                </button>
                <button type="button" onClick={clearPlayers} className="btn-ghost h-11 px-4 text-sm">
                  Svuota pedine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Azzero tutta la mappa?')) {
                      const next = emptyMap()
                      setMap(next)
                      setDirty(true)
                      void persist(next)
                    }
                  }}
                  className="btn-ghost h-11 px-4 text-sm text-rose-300/90"
                >
                  Azzera mappa
                </button>
              </div>
              {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col">
            <MapCanvas
              map={map}
              tool={tool}
              editable={isMaster}
              characters={players}
              onPaintCell={onPaintCell}
              onPointerUp={onPointerUp}
            />
          </div>

          <div className="shrink-0 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted-foreground">
            {REGION_TYPES.map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: r.color }} />
                {r.label}
              </div>
            ))}
          </div>

          {!isMaster && (
            <p className="text-sm text-muted-foreground">
              {map.party
                ? `Il gruppo è in (${map.party.x + 1}, ${map.party.y + 1}).`
                : 'Il master non ha ancora piazzato il gruppo.'}
              {myPos ? ` Tu sei in (${myPos.x + 1}, ${myPos.y + 1}).` : ''}
            </p>
          )}
        </>
      )}
    </div>
  )
}
