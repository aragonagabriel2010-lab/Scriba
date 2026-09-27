import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { app, db } from './firebase'
import { getSession, randomCode } from './session'

// I tavoli devono aggiornarsi da soli mentre si gioca: i listener in tempo reale,
// non le pipeline, perché la scheda cambia nel momento in cui il master accetta.
const auth = getAuth(app)

function ensureUser() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop()
      if (user) resolve(user)
      else signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject)
    }, reject)
  })
}

function fail(err) {
  if (err?.italian) throw err
  const code = err?.code || ''
  if (code === 'permission-denied' || code.endsWith('permission-denied')) throw new Error('Il tavolo non ha accettato questa operazione.')
  if (code === 'auth/unauthorized-domain') throw new Error('Questo indirizzo non è ancora abilitato su Firebase.')
  if (code === 'auth/operation-not-allowed') throw new Error('L’accesso senza account non è attivo.')
  if (code === 'unavailable' || code === 'auth/network-request-failed') throw new Error('Connessione assente. Riprova.')
  throw new Error('Qualcosa è andato storto.')
}

function characterIdFor(name) {
  const key = name.toLowerCase().replace(/\//g, '')
  if (!key || key === '.' || key === '..') throw italian('Scrivi il tuo nome.')
  return key
}

function italian(message) {
  const error = new Error(message)
  error.italian = true
  return error
}

function withTimeout(promise, ms = 20000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(italian('Ci sta mettendo troppo. Riprova.')), ms)),
  ])
}

function tableRef(code) {
  return doc(db, 'tables', code)
}

function characterRef(code, id) {
  return doc(db, 'tables', code, 'characters', id)
}

function requestRef(code, id) {
  return doc(db, 'tables', code, 'requests', id)
}

function clean(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export function watchTable(code, token, onState) {
  let stop = () => {}
  let cancelled = false
  ensureUser().then((user) => {
    if (cancelled) return
    if (!code || user.uid !== token) {
      onState({ table: null, characters: [], requests: [] })
      return
    }
    const state = { table: undefined, characters: undefined, requests: undefined }
    const emit = () => {
      if (state.table === undefined || state.characters === undefined || state.requests === undefined) return
      onState({ table: state.table, characters: state.characters, requests: state.requests })
    }
    const session = getSession()
    const requestsQuery = session?.role === 'master'
      ? collection(db, 'tables', code, 'requests')
      : query(collection(db, 'tables', code, 'requests'), where('player_uid', '==', token))
    const unsubs = [
      onSnapshot(tableRef(code), (snap) => {
        state.table = snap.exists() ? { id: snap.id, ...snap.data() } : null
        emit()
      }, () => {
        state.table = null
        state.characters = []
        state.requests = []
        emit()
      }),
      onSnapshot(collection(db, 'tables', code, 'characters'), (snap) => {
        state.characters = snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (a.created_date || 0) - (b.created_date || 0))
        emit()
      }, () => {}),
      onSnapshot(requestsQuery, (snap) => {
        state.requests = snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (a.created_date || 0) - (b.created_date || 0))
        emit()
      }, () => {
        state.requests = []
        emit()
      }),
    ]
    stop = () => unsubs.forEach((unsub) => unsub())
  }).catch(() => {
    if (!cancelled) onState({ table: null, characters: [], requests: [] })
  })
  return () => {
    cancelled = true
    stop()
  }
}

export function createTableRemote(masterName) {
  return withTimeout(createTableNow(masterName))
}

async function createTableNow(masterName) {
  const name = String(masterName || '').trim().slice(0, 40)
  if (!name) throw italian('Scrivi il tuo nome.')
  const user = await ensureUser()
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomCode()
    const ref = tableRef(code)
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        if (snap.exists()) throw italian('occupato')
        tx.set(ref, {
          id: code,
          code,
          master_name: name,
          master_uid: user.uid,
          notes: '',
          player_count: 0,
          last_join_id: '',
          created_date: Date.now(),
        })
      })
      return { code, token: user.uid }
    } catch (err) {
      if (err?.message === 'occupato') continue
      fail(err)
    }
  }
  throw italian('Non riesco a creare il tavolo. Riprova.')
}

export function joinTableRemote(rawCode, rawName) {
  return withTimeout(joinTableNow(rawCode, rawName))
}

async function joinTableNow(rawCode, rawName) {
  const code = String(rawCode || '').trim().toUpperCase()
  const name = String(rawName || '').trim().slice(0, 40)
  const user = await ensureUser()
  const ref = tableRef(code)
  let table
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref)
      table = snap.exists() ? snap.data() : null
    })
  } catch (err) {
    fail(err)
  }
  if (!name || !table) throw italian('Nessun tavolo con questo codice.')
  if (table.master_name.toLowerCase() === name.toLowerCase()) {
    if (table.master_uid !== user.uid) {
      try { await updateDoc(ref, { master_uid: user.uid }) } catch (err) { fail(err) }
    }
    return { role: 'master', token: user.uid, code }
  }
  const nameKey = characterIdFor(name)
  const chars = collection(db, 'tables', code, 'characters')
  const characterRef = doc(chars, nameKey)
  try {
    const joined = await runTransaction(db, async (tx) => {
      const tableSnap = await tx.get(ref)
      if (!tableSnap.exists()) throw italian('Nessun tavolo con questo codice.')
      const existing = await tx.get(characterRef)
      if (existing.exists()) {
        if (existing.data().player_uid !== user.uid) tx.update(characterRef, { player_uid: user.uid })
        return { characterId: existing.id }
      }
      const count = tableSnap.data().player_count || 0
      if (count >= 7) throw italian('Il tavolo è pieno: al massimo 8 persone.')
      tx.set(characterRef, {
        id: nameKey,
        table_code: code,
        player_name: name,
        name_key: nameKey,
        player_uid: user.uid,
        mode: '',
        closed: false,
        state: emptyState(),
        hp_rolls: {},
        definition: null,
        levelup: null,
        choice: null,
        created_date: Date.now(),
      })
      tx.update(ref, { player_count: count + 1, last_join_id: nameKey })
      return { characterId: nameKey }
    })
    return { role: 'player', token: user.uid, code, characterId: joined.characterId }
  } catch (err) {
    fail(err)
  }
}

export function updateCharacter(id, data) {
  return withTimeout(updateCharacterNow(id, data))
}

async function updateCharacterNow(id, data) {
  const session = getSession()
  if (!session?.code) throw italian('Sessione non valida.')
  const user = await ensureUser()
  const ref = characterRef(session.code, id)
  const payload = clean({ ...data })
  const intent = payload._intent
  delete payload._intent
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref)
      const tableSnap = await tx.get(tableRef(session.code))
      if (!snap.exists() || !tableSnap.exists() || snap.data().table_code !== session.code) throw italian('Scheda non trovata.')
      const character = snap.data()
      const isMaster = tableSnap.data().master_uid === user.uid
      if (!isMaster && (character.player_uid !== user.uid || !allowPlayerWrite(character, payload, intent))) {
        throw italian('Questa modifica passa dal master.')
      }
      if (!Object.keys(payload).length) return
      tx.update(ref, payload)
    })
  } catch (err) {
    fail(err)
  }
}

export function updateTable(id, data) {
  return withTimeout(updateTableNow(id, data))
}

async function updateTableNow(id, data) {
  const session = getSession()
  if (!session?.code || session.role !== 'master' || id !== session.code) throw italian('Solo il master aggiorna il tavolo.')
  const payload = {}
  if (data.notes != null) payload.notes = String(data.notes)
  if (data.initiative != null) payload.initiative = data.initiative
  if (data.turn_index != null) payload.turn_index = Number(data.turn_index) || 0
  if (!Object.keys(payload).length) return
  try {
    await updateDoc(tableRef(session.code), payload)
  } catch (err) {
    fail(err)
  }
}

export function saveRequest(data, id) {
  return withTimeout(saveRequestNow(data, id))
}

async function saveRequestNow(data, id) {
  const session = getSession()
  if (!session?.code || session.role !== 'player') throw italian('Solo un giocatore invia richieste.')
  const user = await ensureUser()
  const payload = { ...(data || {}) }
  if (payload.state_patch) {
    const { hp: _hp, ...rest } = payload.state_patch
    payload.state_patch = rest
  }
  const charRef = characterRef(session.code, payload.character_id)
  const reqs = collection(db, 'tables', session.code, 'requests')
  const ref = id ? requestRef(session.code, id) : doc(reqs)
  try {
    await runTransaction(db, async (tx) => {
      const characterSnap = await tx.get(charRef)
      if (!characterSnap.exists() || characterSnap.data().player_uid !== user.uid) throw italian('Richiesta non valida.')
      const character = characterSnap.data()
      if (character.closed && character.definition && payload.proposal && payload.proposal.level !== character.definition.level) {
        throw italian('Il livello lo cambia solo il master.')
      }
      const current = id ? await tx.get(ref) : null
      if (current && (!current.exists() || current.data().character_id !== character.id || current.data().status !== 'pending')) {
        throw italian('Questa richiesta non si può più cambiare.')
      }
      const now = Date.now()
      const next = {
        ...payload,
        player_uid: user.uid,
        id: ref.id,
        table_code: session.code,
        status: 'pending',
        updated_date: now,
        proposal: payload.proposal ?? null,
        hp_rolls: payload.hp_rolls ?? null,
        state_patch: payload.state_patch ?? null,
        note: payload.note || '',
      }
      if (current) tx.update(ref, next)
      else tx.set(ref, { ...next, created_date: now })
    })
    return { id: ref.id }
  } catch (err) {
    fail(err)
  }
}

export function resolveRequest(id, accept) {
  return withTimeout(resolveRequestNow(id, accept))
}

async function resolveRequestNow(id, accept) {
  const session = getSession()
  if (!session?.code) throw italian('Sessione non valida.')
  const user = await ensureUser()
  const ref = requestRef(session.code, id)
  try {
    await runTransaction(db, async (tx) => {
      const tableSnap = await tx.get(tableRef(session.code))
      const requestSnap = await tx.get(ref)
      if (!tableSnap.exists() || tableSnap.data().master_uid !== user.uid || !requestSnap.exists()) throw italian('Richiesta non trovata.')
      const request = requestSnap.data()
      const charRef = characterRef(session.code, request.character_id)
      const characterSnap = await tx.get(charRef)
      const character = characterSnap.exists() ? characterSnap.data() : null
      const now = Date.now()
      if (accept && character) {
        if (request.proposal && character.closed && character.definition && request.proposal.level !== character.definition.level) {
          tx.update(ref, { status: 'rejected', note: 'Rifiutata: il livello lo cambia solo il master.', updated_date: now })
          return
        }
        const patch = {}
        if (request.proposal) {
          patch.definition = request.proposal
          patch.closed = true
          if (request.hp_rolls) patch.hp_rolls = request.hp_rolls
          const max = request.proposal.hpMax || character.state?.hp || 1
          const current = character.state?.hp
          patch.state = { ...character.state, hp: current == null ? max : Math.min(current, max) }
        }
        if (request.state_patch) {
          const { hp: _hp, ...rest } = request.state_patch
          patch.state = { ...(patch.state || character.state), ...rest }
        }
        if (Object.keys(patch).length) tx.update(charRef, patch)
        tx.update(ref, { status: 'accepted', updated_date: now })
        return
      }
      tx.update(ref, { status: 'rejected', updated_date: now })
    })
  } catch (err) {
    fail(err)
  }
}

function allowPlayerWrite(character, data, intent) {
  const keys = Object.keys(data)
  if (intent === 'mode' || (keys.length === 1 && keys[0] === 'mode' && !character.definition)) {
    return !character.definition && keys.every((key) => key === 'mode') && ['', 'regole', 'libera'].includes(data.mode)
  }
  if (intent === 'spend') return keys.length === 1 && keys[0] === 'state' && validSpend(character, data.state)
  if (intent === 'choice') return keys.every((key) => key === 'definition' || key === 'choice') && validChoice(character, data)
  return false
}

function validSpend(character, after) {
  if (!character.definition || !after) return false
  const before = character.state || {}
  const spent = (after.hitDiceSpent || 0) - (before.hitDiceSpent || 0)
  const from = before.hp ?? character.definition.hpMax
  const to = after.hp
  if (spent !== 1 || to == null || to < from || to > character.definition.hpMax) return false
  return Object.keys(after).every((key) => key === 'hp' || key === 'hitDiceSpent' || JSON.stringify(after[key]) === JSON.stringify(before[key]))
}

function validChoice(character, data) {
  if (!character.choice || !character.definition) return false
  if (character.choice.level !== character.definition.level) return false
  if (!data.definition || data.definition.level !== character.definition.level) return false
  if (data.choice != null) return false
  return true
}

function emptyState() {
  return {
    hp: null, tempHp: 0, ac: null, conditions: [], inspiration: false, concentration: '', exhaustion: 0,
    hitDiceSpent: 0, resourcesUsed: {}, slotsUsed: {}, weapons: [], equipment: '',
    coins: { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 }, notes: '', appearance: '',
  }
}
