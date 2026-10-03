import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Map as MapIcon, Pencil, Trash2, Users, X } from 'lucide-react'
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
  const [panelOpen, setPanelOpen] = useState(false)
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
  const activeToolLabel = TOOLS.find((t) => t.key === tool)?.label || ''

  if (!ready && !isMaster) {
    return (
      <div className="space-y-4 p-2">
        <p className="eyebrow">Mappa del mondo</p>
        <h1 className="font-display text-4xl mt-2">Mappa</h1>
        <p className="text-sm text-muted-foreground">Il master non ha ancora creato la mappa.</p>
      </div>
    )
  }

  if (!ready && isMaster) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center gap-4 p-6">
        <p className="eyebrow">Mappa del mondo</p>
        <h1 className="font-display text-4xl">Mappa</h1>
        <button type="button" onClick={createBlank} className="btn-primary h-11 px-4 text-sm">
          <MapIcon className="w-4 h-4" /> Crea mappa
        </button>
      </div>
    )
  }

  const toolBtn = (active) =>
    `h-9 px-3 rounded-full border text-xs sm:text-sm transition ${
      active ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground'
    }`

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div className="absolute inset-0">
        <MapCanvas
          map={map}
          tool={isMaster ? tool : 'hand'}
          editable={isMaster}
          characters={players}
          onPaintCell={onPaintCell}
          onPointerUp={onPointerUp}
          compact
        />
      </div>

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="absolute bottom-4 right-4 z-20 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 grid place-items-center transition hover:brightness-110 active:scale-95"
        aria-label="Apri pannello mappa"
      >
        <Pencil className="w-5 h-5" />
        {dirty && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-background" />
        )}
      </button>

      {isMaster && !panelOpen && (
        <div className="absolute top-3 left-3 z-10 max-w-[70%] rounded-xl border border-border/70 bg-background/80 backdrop-blur-md px-3 py-1.5 text-xs text-muted-foreground pointer-events-none">
          {activeToolLabel}
          {dirty ? ' · non salvata' : ''}
        </div>
      )}

      {!isMaster && !panelOpen && (map.party || myPos) && (
        <div className="absolute top-3 left-3 z-10 max-w-[80%] rounded-xl border border-border/70 bg-background/80 backdrop-blur-md px-3 py-1.5 text-xs text-muted-foreground pointer-events-none">
          {map.party ? `Gruppo (${map.party.x + 1}, ${map.party.y + 1})` : ''}
          {myPos ? `${map.party ? ' · ' : ''}Tu (${myPos.x + 1}, ${myPos.y + 1})` : ''}
        </div>
      )}

      {/* Overlay + panel */}
      {panelOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-30 bg-black/45 backdrop-blur-[1px]"
            aria-label="Chiudi pannello"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 z-40 max-h-[min(72dvh,560px)] sm:inset-y-3 sm:right-3 sm:left-auto sm:bottom-auto sm:w-[min(100%,380px)] sm:max-h-[calc(100%-1.5rem)] rounded-t-3xl sm:rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border/70">
              <div>
                <p className="eyebrow">Mappa</p>
                <p className="font-display text-xl leading-none mt-0.5">
                  {isMaster ? 'Strumenti' : 'Legenda'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="h-10 w-10 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
              {isMaster ? (
                <>
                  <div>
                    <p className="eyebrow mb-2">Strumento</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TOOLS.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTool(item.key)}
                          className={toolBtn(tool === item.key)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tool === 'region' && (
                    <div>
                      <p className="eyebrow mb-2">Tipo regione (5×5)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {REGION_TYPES.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setRegionType(item.key)}
                            className={toolBtn(regionType === item.key)}
                          >
                            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: item.color }} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tool === 'marker' && (
                    <div>
                      <p className="eyebrow mb-2">Luogo preimpostato</p>
                      <div className="flex flex-wrap gap-1.5">
                        {MARKER_TYPES.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => { setMarkerType(item.key); setRemoveMarkerMode(false) }}
                            className={toolBtn(!removeMarkerMode && markerType === item.key)}
                          >
                            {item.label}
                            {item.size > 1 ? ` (${item.size}×${item.size})` : ''}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setRemoveMarkerMode(true)}
                          className={toolBtn(removeMarkerMode)}
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
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setMoveTarget('party')}
                          className={toolBtn(moveTarget === 'party')}
                        >
                          <Users className="w-3.5 h-3.5 inline mr-1" />
                          Tutto il gruppo
                        </button>
                        {players.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setMoveTarget(p.id)}
                            className={toolBtn(moveTarget === p.id)}
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

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={saving || !dirty}
                      onClick={() => void persist(map)}
                      className="btn-primary h-10 px-4 text-sm"
                    >
                      {saving ? 'Salvo…' : dirty ? 'Salva mappa' : 'Salvata'}
                    </button>
                    <button type="button" onClick={clearRivers} className="btn-ghost h-10 px-3 text-xs">
                      <Eraser className="w-3.5 h-3.5" /> Svuota fiumi
                    </button>
                    <button type="button" onClick={clearMarkers} className="btn-ghost h-10 px-3 text-xs">
                      <Trash2 className="w-3.5 h-3.5" /> Svuota luoghi
                    </button>
                    <button type="button" onClick={clearPlayers} className="btn-ghost h-10 px-3 text-xs">
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
                      className="btn-ghost h-10 px-3 text-xs text-rose-300/90"
                    >
                      Azzera mappa
                    </button>
                  </div>
                  {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {map.party
                    ? `Il gruppo è in (${map.party.x + 1}, ${map.party.y + 1}).`
                    : 'Il master non ha ancora piazzato il gruppo.'}
                  {myPos ? ` Tu sei in (${myPos.x + 1}, ${myPos.y + 1}).` : ''}
                </p>
              )}

              <div>
                <p className="eyebrow mb-2">Regioni</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {REGION_TYPES.map((r) => (
                    <div key={r.key} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: r.color }} />
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
