import { useEffect, useState, useCallback } from 'react'
import { getSession } from '@/lib/session'
import { deleteEnemy, saveEnemy, updateCharacter, updateTable, watchEnemies, watchTable } from '@/lib/db'

export default function useTable(code) {
  const [table, setTable] = useState(undefined)
  const [characters, setCharacters] = useState([])
  const [requests, setRequests] = useState([])
  const [enemies, setEnemies] = useState([])

  useEffect(() => {
    if (!code) return
    const session = getSession()
    if (!session?.token) return
    return watchTable(code, session.token, (snap) => {
      setTable(snap.table || null)
      setCharacters(snap.characters || [])
      setRequests(snap.requests || [])
    })
  }, [code])

  useEffect(() => {
    if (!code) return
    const session = getSession()
    if (!session?.token || session.role !== 'master') {
      setEnemies([])
      return
    }
    return watchEnemies(code, session.token, setEnemies)
  }, [code])

  const patchCharacter = useCallback((id, data) => {
    setCharacters((list) => list.map((item) => (item.id === id ? { ...item, ...data, _intent: undefined } : item)))
    return updateCharacter(id, data)
  }, [])

  const patchTable = useCallback((id, data) => {
    setTable((current) => (current && current.id === id ? { ...current, ...data } : current))
    return updateTable(id, data)
  }, [])

  const patchEnemy = useCallback((data, id) => {
    return saveEnemy(data, id).then((result) => {
      if (!id && result?.id) {
        setEnemies((list) => [...list, { ...sanitizeLocal(data), id: result.id, created_date: Date.now() }])
      } else if (id) {
        setEnemies((list) => list.map((item) => (item.id === id ? { ...item, ...sanitizeLocal(data) } : item)))
      }
      return result
    })
  }, [])

  const removeEnemy = useCallback((id) => {
    setEnemies((list) => list.filter((item) => item.id !== id))
    return deleteEnemy(id)
  }, [])

  return { table, characters, requests, enemies, patchCharacter, patchTable, patchEnemy, removeEnemy }
}

function sanitizeLocal(data = {}) {
  const hpMax = Math.max(1, Math.min(9999, Number(data.hpMax) || 1))
  return {
    name: String(data.name || '').trim().slice(0, 40),
    hp: Math.max(0, Math.min(hpMax, Number(data.hp ?? hpMax) || 0)),
    hpMax,
    ac: Math.max(0, Math.min(40, Number(data.ac) || 10)),
    init: Math.max(-20, Math.min(40, Number(data.init) || 0)),
    notes: String(data.notes || '').trim().slice(0, 800),
  }
}
