import React, { useEffect, useRef } from 'react'
import {
  CELL_PX,
  MAP_SIZE,
  REGION_SIZE,
  REGION_TYPES,
  landSet,
  markerType,
  riverCells,
  regionKey,
} from '@/lib/map'

const SEA = '#1a3a4a'
const LAND = '#3d5c3a'
const GRID = 'rgba(255,255,255,0.08)'
const RIVER = '#4a9fd4'

export default function MapCanvas({
  map,
  tool,
  editable,
  characters,
  onPaintCell,
  onPointerUp,
}) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  const width = MAP_SIZE * CELL_PX
  const height = MAP_SIZE * CELL_PX

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const land = landSet(map)
    const rivers = riverCells(map)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = SEA
    ctx.fillRect(0, 0, width, height)

    // regions tint on land
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const key = `${x},${y}`
        if (!land.has(key)) continue
        const rk = regionKey(x, y)
        const region = map.regions?.[rk]
        const tint = REGION_TYPES.find((r) => r.key === region)
        ctx.fillStyle = tint ? tint.color : LAND
        ctx.globalAlpha = tint ? 0.85 : 1
        ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX)
        ctx.globalAlpha = 1
      }
    }

    // rivers
    ctx.strokeStyle = RIVER
    ctx.lineWidth = Math.max(2, CELL_PX * 0.35)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const river of map.rivers || []) {
      if (river.length < 2) {
        if (river.length === 1) {
          const [sx, sy] = river[0].split(',').map(Number)
          ctx.beginPath()
          ctx.arc(sx * CELL_PX + CELL_PX / 2, sy * CELL_PX + CELL_PX / 2, CELL_PX * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = RIVER
          ctx.fill()
        }
        continue
      }
      ctx.beginPath()
      river.forEach((key, i) => {
        const [x, y] = key.split(',').map(Number)
        const cx = x * CELL_PX + CELL_PX / 2
        const cy = y * CELL_PX + CELL_PX / 2
        if (i === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
    }

    // grid
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    for (let i = 0; i <= MAP_SIZE; i += 1) {
      const p = i * CELL_PX
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, p)
      ctx.lineTo(width, p)
      ctx.stroke()
    }

    // region borders every 8
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1.5
    for (let i = 0; i <= MAP_SIZE; i += REGION_SIZE) {
      const p = i * CELL_PX
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, p)
      ctx.lineTo(width, p)
      ctx.stroke()
    }

    // markers
    for (const marker of map.markers || []) {
      const info = markerType(marker.type)
      const px = marker.x * CELL_PX
      const py = marker.y * CELL_PX
      const s = info.size * CELL_PX
      ctx.fillStyle = info.color
      ctx.globalAlpha = 0.9
      ctx.fillRect(px + 1, py + 1, s - 2, s - 2)
      ctx.globalAlpha = 1
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.strokeRect(px + 1, py + 1, s - 2, s - 2)
      ctx.fillStyle = '#fff8e7'
      ctx.font = `${Math.max(10, s * 0.35)}px Georgia, serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(info.glyph, px + s / 2, py + s / 2 + 1)
    }

    // party
    if (map.party) {
      drawToken(ctx, map.party.x, map.party.y, '#f0a060', 'G')
    }

    // players
    for (const ch of characters || []) {
      const pos = map.positions?.[ch.id]
      if (!pos) continue
      const label = (ch.definition?.name || ch.player_name || '?').slice(0, 1).toUpperCase()
      drawToken(ctx, pos.x, pos.y, '#e8d5a3', label)
    }
  }, [map, characters, width, height])

  const cellFromEvent = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_PX)
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_PX)
    return {
      x: Math.max(0, Math.min(MAP_SIZE - 1, x)),
      y: Math.max(0, Math.min(MAP_SIZE - 1, y)),
    }
  }

  const handleDown = (e) => {
    if (!editable) return
    drawing.current = true
    canvasRef.current?.setPointerCapture?.(e.pointerId)
    const { x, y } = cellFromEvent(e)
    onPaintCell?.(x, y, true)
  }

  const handleMove = (e) => {
    if (!editable || !drawing.current) return
    const { x, y } = cellFromEvent(e)
    onPaintCell?.(x, y, false)
  }

  const handleUp = (e) => {
    if (!editable) return
    drawing.current = false
    try {
      canvasRef.current?.releasePointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
    onPointerUp?.()
  }

  return (
    <div className="w-fit max-w-full overflow-auto rounded-2xl border border-border/80 bg-[#0e1a22]">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`block max-w-full h-auto touch-none ${editable ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ imageRendering: 'pixelated' }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      {!editable && (
        <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border/50">
          Solo il master disegna. Qui vedi isole, luoghi e dove siete.
        </p>
      )}
    </div>
  )
}

function drawToken(ctx, x, y, color, label) {
  const cx = x * CELL_PX + CELL_PX / 2
  const cy = y * CELL_PX + CELL_PX / 2
  const r = CELL_PX * 0.38
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#1a1510'
  ctx.font = `bold ${Math.max(9, CELL_PX * 0.45)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy + 0.5)
}
