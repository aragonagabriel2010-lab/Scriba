import { useEffect, useState, useCallback } from 'react'
import { getSession } from '@/lib/session'
import { updateCharacter, updateTable, watchTable } from '@/lib/db'

export default function useTable(code) {
  const [table, setTable] = useState(undefined)
  const [characters, setCharacters] = useState([])
  const [requests, setRequests] = useState([])

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

  const patchCharacter = useCallback((id, data) => {
    setCharacters((list) => list.map((item) => (item.id === id ? { ...item, ...data, _intent: undefined } : item)))
    return updateCharacter(id, data)
  }, [])

  const patchTable = useCallback((id, data) => {
    setTable((current) => (current && current.id === id ? { ...current, ...data } : current))
    return updateTable(id, data)
  }, [])

  return { table, characters, requests, patchCharacter, patchTable }
}
