import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CELL_PX,
  REGION_SIZE,
  REGION_TYPES,
  landSet,
  mapContentBounds,
  markerType,
  riverLines,
  regionKey,
} from '@/lib/map'

const SEA = '#142830'
const LAND = '#3d5c3a'
const GRID = 'rgba(255,255,255,0.06)'
const RIVER = '#4a9fd4'
const MIN_ZOOM = 0.35
const MAX_ZOOM = 3

export default function MapCanvas({
  map,
  tool,
  editable,
  characters,
  onPaintCell,
  onPointerUp,
}) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const panning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const viewRef = useRef({ panX: 0, panY: 0, zoom: 1 })
  const [viewTick, setViewTick] = useState(0)
  const [size, setSize] = useState({ w: 640, h: 480 })
  const centered = useRef(false)

  const bumpView = useCallback(() => setViewTick((n) => n + 1), [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth || 640, h: el.clientHeight || 480 })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth || 640, h: el.clientHeight || 480 })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (centered.current) return
    const b = mapContentBounds(map)
    const cx = ((b.minX + b.maxX) / 2) * CELL_PX
    const cy = ((b.minY + b.maxY) / 2) * CELL_PX
    viewRef.current.panX = size.w / 2 - cx * viewRef.current.zoom
    viewRef.current.panY = size.h / 2 - cy * viewRef.current.zoom
    centered.current = true
    bumpView()
  }, [map, size.w, size.h, bumpView])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(size.w * dpr)
    canvas.height = Math.floor(size.h * dpr)
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const { panX, panY, zoom } = viewRef.current
    const land = landSet(map)

    ctx.fillStyle = SEA
    ctx.fillRect(0, 0, size.w, size.h)

    const wx0 = Math.floor((-panX) / (CELL_PX * zoom)) - 2
    const wy0 = Math.floor((-panY) / (CELL_PX * zoom)) - 2
    const wx1 = Math.ceil((size.w - panX) / (CELL_PX * zoom)) + 2
    const wy1 = Math.ceil((size.h - panY) / (CELL_PX * zoom)) + 2

    const toScreen = (wx, wy) => ({
      x: wx * CELL_PX * zoom + panX,
      y: wy * CELL_PX * zoom + panY,
    })

    for (const key of land) {
      const [x, y] = key.split(',').map(Number)
      if (x < wx0 || x > wx1 || y < wy0 || y > wy1) continue
      const rk = regionKey(x, y)
      const region = map.regions?.[rk]
      const tint = REGION_TYPES.find((r) => r.key === region)
      const { x: sx, y: sy } = toScreen(x, y)
      const cell = CELL_PX * zoom
      ctx.fillStyle = tint ? tint.color : LAND
      ctx.globalAlpha = tint ? 0.88 : 1
      ctx.fillRect(sx, sy, cell + 0.5, cell + 0.5)
      ctx.globalAlpha = 1
    }

    ctx.strokeStyle = RIVER
    ctx.lineWidth = Math.max(2, CELL_PX * zoom * 0.35)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const river of riverLines(map)) {
      if (river.length < 2) {
        if (river.length === 1) {
          const [sx, sy] = river[0].split(',').map(Number)
          const p = toScreen(sx, sy)
          ctx.beginPath()
          ctx.arc(p.x + (CELL_PX * zoom) / 2, p.y + (CELL_PX * zoom) / 2, CELL_PX * zoom * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = RIVER
          ctx.fill()
        }
        continue
      }
      ctx.beginPath()
      river.forEach((key, i) => {
        const [x, y] = key.split(',').map(Number)
        const p = toScreen(x, y)
        const cx = p.x + (CELL_PX * zoom) / 2
        const cy = p.y + (CELL_PX * zoom) / 2
        if (i === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
    }

    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    for (let x = wx0; x <= wx1; x += 1) {
      const p = toScreen(x, wy0)
      const p2 = toScreen(x, wy1 + 1)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p2.x, p2.y + CELL_PX * zoom)
      ctx.stroke()
    }
    for (let y = wy0; y <= wy1; y += 1) {
      const p = toScreen(wx0, y)
      const p2 = toScreen(wx1 + 1, y)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p2.x + CELL_PX * zoom, p2.y)
      ctx.stroke()
    }

    const regStartX = Math.floor(wx0 / REGION_SIZE) * REGION_SIZE
    const regStartY = Math.floor(wy0 / REGION_SIZE) * REGION_SIZE
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 1.5
    for (let x = regStartX; x <= wx1; x += REGION_SIZE) {
      const p = toScreen(x, wy0)
      const p2 = toScreen(x, wy1 + 1)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p2.x, p2.y + CELL_PX * zoom)
      ctx.stroke()
    }
    for (let y = regStartY; y <= wy1; y += REGION_SIZE) {
      const p = toScreen(wx0, y)
      const p2 = toScreen(wx1 + 1, y)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p2.x + CELL_PX * zoom, p2.y)
      ctx.stroke()
    }

    for (const marker of map.markers || []) {
      const info = markerType(marker.type)
      const { x: sx, y: sy } = toScreen(marker.x, marker.y)
      const s = info.size * CELL_PX * zoom
      ctx.fillStyle = info.color
      ctx.globalAlpha = 0.92
      ctx.fillRect(sx + 1, sy + 1, s - 2, s - 2)
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.strokeRect(sx + 1, sy + 1, s - 2, s - 2)
      ctx.fillStyle = '#fff8e7'
      ctx.font = `${Math.max(10, s * 0.35)}px Georgia, serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(info.glyph, sx + s / 2, sy + s / 2 + 1)
    }

    if (map.party) {
      drawToken(ctx, map.party.x, map.party.y, '#f0a060', 'G', toScreen, zoom)
    }
    for (const ch of characters || []) {
      const pos = map.positions?.[ch.id]
      if (!pos) continue
      const label = (ch.definition?.name || ch.player_name || '?').slice(0, 1).toUpperCase()
      drawToken(ctx, pos.x, pos.y, '#e8d5a3', label, toScreen, zoom)
    }
  }, [map, characters, size, viewTick])

  const cellFromEvent = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const { panX, panY, zoom } = viewRef.current
    const x = Math.floor((e.clientX - rect.left - panX) / (CELL_PX * zoom))
    const y = Math.floor((e.clientY - rect.top - panY) / (CELL_PX * zoom))
    return { x, y }
  }

  const paintTools = new Set(['terrain', 'erase', 'river', 'region', 'marker', 'move'])
  const canPaint = editable && paintTools.has(tool)

  const handleDown = (e) => {
    const isPan = tool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)
    if (isPan || (!canPaint && e.button === 0)) {
      panning.current = true
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: viewRef.current.panX,
        panY: viewRef.current.panY,
      }
      canvasRef.current?.setPointerCapture?.(e.pointerId)
      return
    }
    if (!canPaint) return
    drawing.current = true
    canvasRef.current?.setPointerCapture?.(e.pointerId)
    const { x, y } = cellFromEvent(e)
    onPaintCell?.(x, y, true)
  }

  const handleMove = (e) => {
    if (panning.current) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      viewRef.current.panX = panStart.current.panX + dx
      viewRef.current.panY = panStart.current.panY + dy
      bumpView()
      return
    }
    if (!editable || !drawing.current || !canPaint) return
    const { x, y } = cellFromEvent(e)
    onPaintCell?.(x, y, false)
  }

  const handleUp = (e) => {
    if (panning.current) {
      panning.current = false
      try {
        canvasRef.current?.releasePointerCapture?.(e.pointerId)
      } catch {
        // ignore
      }
      return
    }
    if (!editable) return
    drawing.current = false
    try {
      canvasRef.current?.releasePointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
    onPointerUp?.()
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { panX, panY, zoom } = viewRef.current
    const factor = e.deltaY > 0 ? 0.92 : 1.08
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor))
    const wx = (mx - panX) / zoom
    const wy = (my - panY) / zoom
    viewRef.current.zoom = nextZoom
    viewRef.current.panX = mx - wx * nextZoom
    viewRef.current.panY = my - wy * nextZoom
    bumpView()
  }

  const cursor = tool === 'hand' ? 'grab' : canPaint ? 'crosshair' : 'grab'

  return (
    <div className="scriba-panel overflow-hidden">
      <div
        ref={wrapRef}
        className="relative w-full h-[min(70vh,640px)] min-h-[320px] bg-[#0e1a22]"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none"
          style={{ imageRendering: 'pixelated', cursor: panning.current ? 'grabbing' : cursor }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <p className="px-4 py-2.5 text-xs text-muted-foreground border-t border-border/50">
        {editable
          ? 'Rotella: zoom · Alt+trascina o «Muovi mappa»: sposta · Il mare è tutto ciò che non chiudi con il terreno.'
          : 'Solo il master disegna. Qui vedi isole, luoghi e dove siete.'}
      </p>
    </div>
  )
}

function drawToken(ctx, x, y, color, label, toScreen, zoom) {
  const p = toScreen(x, y)
  const cx = p.x + (CELL_PX * zoom) / 2
  const cy = p.y + (CELL_PX * zoom) / 2
  const r = CELL_PX * zoom * 0.38
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#1a1510'
  ctx.font = `bold ${Math.max(9, CELL_PX * zoom * 0.45)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy + 0.5)
}
