import { useEffect, useState, useCallback } from 'react'
import { getSession } from '@/lib/session'
import {
  clearCombatLog,
  deleteCombatLog,
  deleteEnemy,
  saveCombatLog,
  saveEnemy,
  updateCharacter,
  updateTable,
  watchCombatLog,
  watchEnemies,
  watchTable,
} from '@/lib/db'

export default function useTable(code) {
  const [table, setTable] = useState(undefined)
  const [characters, setCharacters] = useState([])
  const [requests, setRequests] = useState([])
  const [enemies, setEnemies] = useState([])
  const [combatLog, setCombatLog] = useState([])

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
      setCombatLog([])
      return
    }
    const stopEnemies = watchEnemies(code, session.token, setEnemies)
    const stopLog = watchCombatLog(code, session.token, setCombatLog)
    return () => {
      stopEnemies()
      stopLog()
    }
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
      const nextId = id || result?.id
      if (!nextId) return result
      const local = sanitizeLocal(data)
      setEnemies((list) => {
        const exists = list.some((item) => item.id === nextId)
        if (exists) {
          return list.map((item) => (item.id === nextId ? { ...item, ...local } : item))
        }
        return [...list, { ...local, id: nextId, created_date: Date.now() }]
      })
      return result
    })
  }, [])

  const removeEnemy = useCallback((id) => {
    setEnemies((list) => list.filter((item) => item.id !== id))
    return deleteEnemy(id)
  }, [])

  const addCombatLog = useCallback((data) => {
    return saveCombatLog(data).then((result) => {
      if (!result?.id) return result
      setCombatLog((list) => {
        if (list.some((item) => item.id === result.id)) return list
        return [{ ...data, id: result.id, created_date: Date.now() }, ...list].slice(0, 40)
      })
      return result
    })
  }, [])

  const removeCombatLog = useCallback((id) => {
    setCombatLog((list) => list.filter((item) => item.id !== id))
    return deleteCombatLog(id)
  }, [])

  const wipeCombatLog = useCallback(() => {
    setCombatLog([])
    return clearCombatLog()
  }, [])

  return {
    table,
    characters,
    requests,
    enemies,
    combatLog,
    patchCharacter,
    patchTable,
    patchEnemy,
    removeEnemy,
    addCombatLog,
    removeCombatLog,
    wipeCombatLog,
  }
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
