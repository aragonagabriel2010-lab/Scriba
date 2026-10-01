import { useEffect, useRef } from 'react'
import { getSession } from '@/lib/session'
import { notifyPulse } from '@/lib/notify'

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
        notifyPulse({ body: 'C’è una nuova richiesta al tavolo.', freq: 880 })
      }
    }
  }, [requests, enabled])
}

export function askNotifyPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return Promise.resolve('denied')
  if (Notification.permission !== 'default') return Promise.resolve(Notification.permission)
  return Notification.requestPermission()
}
