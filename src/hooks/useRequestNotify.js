import { useEffect, useRef } from 'react'
import { getSession } from '@/lib/session'

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.stop(ctx.currentTime + 0.4)
    setTimeout(() => ctx.close(), 500)
  } catch {
    // ignore
  }
}

/** Avvisa il master quando arriva una nuova richiesta. */
export default function useRequestNotify(requests, enabled) {
  const prev = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const session = getSession()
    if (session?.role !== 'master') return
    const pending = (requests || []).filter((r) => r.status === 'pending')
    const ids = pending.map((r) => r.id).sort().join('|')
    if (prev.current == null) {
      prev.current = ids
      return
    }
    if (ids !== prev.current) {
      const grew = pending.length > (prev.current ? prev.current.split('|').filter(Boolean).length : 0)
      prev.current = ids
      if (grew || pending.length) {
        beep()
        try { navigator.vibrate?.([40, 30, 40]) } catch { /* ignore */ }
        if (typeof document !== 'undefined' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Scriba', { body: 'C’è una nuova richiesta al tavolo.', silent: true })
        }
      }
    }
  }, [requests, enabled])
}

export function askNotifyPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return Promise.resolve('denied')
  if (Notification.permission !== 'default') return Promise.resolve(Notification.permission)
  return Notification.requestPermission()
}
