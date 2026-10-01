import { useEffect, useRef } from 'react'
import { notifyPulse } from '@/lib/notify'

/** Avvisa tutti quando cambia il turno in iniziativa. */
export default function useTurnNotify(table, enabled = true) {
  const prev = useRef(null)

  useEffect(() => {
    if (!enabled || !table) return
    const entries = Array.isArray(table.initiative) ? table.initiative : []
    if (!entries.length) {
      prev.current = null
      return
    }
    const turn = Math.min(table.turn_index || 0, entries.length - 1)
    const current = entries[turn]
    const key = `${turn}:${current?.id || ''}:${current?.name || ''}`
    if (prev.current == null) {
      prev.current = key
      return
    }
    if (key !== prev.current) {
      prev.current = key
      notifyPulse({
        title: 'Scriba',
        body: current?.name ? `Tocca a ${current.name}` : 'Nuovo turno',
        freq: 660,
      })
    }
  }, [table?.initiative, table?.turn_index, enabled])
}
