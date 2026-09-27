import { createServer } from 'node:http'
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT) || 3001
const root = dirname(fileURLToPath(import.meta.url))
const file = join(root, 'data', 'tables.json')

const db = load()

function load() {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return { tables: [], characters: [], requests: [] }
  }
}

function persist() {
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(db))
  renameSync(tmp, file)
}

function uid() {
  return crypto.randomUUID()
}

function reply(ack, payload) {
  if (typeof ack === 'function') ack(payload)
}

function tableByCode(code) {
  return db.tables.find((table) => table.code === code)
}

function actor(token) {
  if (!token) return null
  const table = db.tables.find((item) => item.master_token === token)
  if (table) return { role: 'master', table, token }
  const character = db.characters.find((item) => item.token === token)
  if (!character) return null
  const owned = tableByCode(character.table_code)
  if (!owned) return null
  return { role: 'player', table: owned, character, token }
}

function snapshot(found) {
  const code = found.table.code
  const characters = db.characters
    .filter((item) => item.table_code === code)
    .map((item) => (found.role === 'player' && item.id !== found.character.id ? { ...item, token: undefined } : item))
  const requests = db.requests.filter((item) => item.table_code === code)
  const table = found.role === 'master' ? found.table : { ...found.table, master_token: undefined }
  return { table, characters, requests }
}

function emitTable(code) {
  for (const socket of io.sockets.sockets.values()) {
    if (socket.data.code !== code) continue
    const found = actor(socket.data.token)
    if (found) socket.emit('state', snapshot(found))
  }
}

const app = express()
app.get('/api/health', (_req, res) => res.json({ ok: true }))
const http = createServer(app)
const io = new Server(http, { cors: { origin: true } })

io.on('connection', (socket) => {
  socket.on('watch', (payload = {}, ack) => {
    const found = actor(payload.token)
    if (!found || found.table.code !== String(payload.code || '').toUpperCase()) {
      reply(ack, { ok: false, error: 'Sessione non valida.' })
      return
    }
    socket.data.token = payload.token
    socket.data.code = found.table.code
    reply(ack, { ok: true, ...snapshot(found) })
  })

  socket.on('createTable', (payload = {}, ack) => {
    const name = String(payload.masterName || '').trim().slice(0, 40)
    if (!name) {
      reply(ack, { ok: false, error: 'Scrivi il tuo nome.' })
      return
    }
    let code
    do {
      code = randomCode()
    } while (tableByCode(code))
    const token = uid()
    db.tables.push({ id: uid(), code, master_name: name, master_token: token, notes: '', created_date: Date.now() })
    persist()
    reply(ack, { ok: true, code, token })
  })

  socket.on('joinTable', (payload = {}, ack) => {
    const code = String(payload.code || '').trim().toUpperCase()
    const name = String(payload.name || '').trim().slice(0, 40)
    const table = tableByCode(code)
    if (!name || !table) {
      reply(ack, { ok: false, error: 'Nessun tavolo con questo codice.' })
      return
    }
    if (table.master_name.toLowerCase() === name.toLowerCase()) {
      reply(ack, { ok: true, role: 'master', token: table.master_token, code })
      return
    }
    const players = db.characters.filter((item) => item.table_code === code)
    const existing = players.find((item) => item.player_name.toLowerCase() === name.toLowerCase())
    if (existing) {
      reply(ack, { ok: true, role: 'player', token: existing.token, code, characterId: existing.id })
      return
    }
    if (players.length >= 7) {
      reply(ack, { ok: false, error: 'Il tavolo è pieno: al massimo 8 persone.' })
      return
    }
    const token = uid()
    const character = {
      id: uid(),
      table_code: code,
      player_name: name,
      token,
      mode: '',
      closed: false,
      state: emptyState(),
      hp_rolls: {},
      definition: null,
      levelup: null,
      choice: null,
      created_date: Date.now(),
    }
    db.characters.push(character)
    persist()
    emitTable(code)
    reply(ack, { ok: true, role: 'player', token, code, characterId: character.id })
  })

  socket.on('updateCharacter', (payload = {}, ack) => {
    const found = actor(socket.data.token)
    const character = db.characters.find((item) => item.id === payload.id)
    if (!found || !character || character.table_code !== found.table.code) {
      reply(ack, { ok: false, error: 'Scheda non trovata.' })
      return
    }
    const data = { ...(payload.data || {}) }
    const intent = data._intent
    delete data._intent
    if (found.role === 'player') {
      if (found.character.id !== character.id || !allowPlayerWrite(character, data, intent)) {
        reply(ack, { ok: false, error: 'Questa modifica passa dal master.' })
        return
      }
    }
    Object.assign(character, data)
    persist()
    reply(ack, { ok: true })
    emitTable(found.table.code)
  })

  socket.on('updateTable', (payload = {}, ack) => {
    const found = actor(socket.data.token)
    if (!found || found.role !== 'master' || found.table.id !== payload.id) {
      reply(ack, { ok: false, error: 'Solo il master aggiorna il tavolo.' })
      return
    }
    Object.assign(found.table, payload.data || {})
    persist()
    reply(ack, { ok: true })
    emitTable(found.table.code)
  })

  socket.on('saveRequest', (payload = {}, ack) => {
    const found = actor(socket.data.token)
    if (!found || found.role !== 'player') {
      reply(ack, { ok: false, error: 'Solo un giocatore invia richieste.' })
      return
    }
    const data = payload.data || {}
    if (data.character_id !== found.character.id) {
      reply(ack, { ok: false, error: 'Richiesta non valida.' })
      return
    }
    if (data.state_patch) delete data.state_patch.hp
    if (found.character.closed && found.character.definition && data.proposal && data.proposal.level !== found.character.definition.level) {
      reply(ack, { ok: false, error: 'Il livello lo cambia solo il master.' })
      return
    }
    let request = payload.id ? db.requests.find((item) => item.id === payload.id) : null
    if (request && (request.character_id !== found.character.id || request.status !== 'pending')) {
      reply(ack, { ok: false, error: 'Questa richiesta non si può più cambiare.' })
      return
    }
    if (!request) {
      request = { id: uid(), created_date: Date.now() }
      db.requests.push(request)
    }
    Object.assign(request, data, { table_code: found.table.code, status: 'pending', updated_date: Date.now() })
    persist()
    reply(ack, { ok: true, id: request.id })
    emitTable(found.table.code)
  })

  socket.on('resolveRequest', (payload = {}, ack) => {
    const found = actor(socket.data.token)
    const request = db.requests.find((item) => item.id === payload.id)
    if (!found || found.role !== 'master' || !request || request.table_code !== found.table.code) {
      reply(ack, { ok: false, error: 'Richiesta non trovata.' })
      return
    }
    const character = db.characters.find((item) => item.id === request.character_id)
    if (payload.accept && character) {
      if (request.proposal && character.closed && character.definition && request.proposal.level !== character.definition.level) {
        request.status = 'rejected'
        request.note = 'Rifiutata: il livello lo cambia solo il master.'
      } else {
        if (request.proposal) {
          character.definition = request.proposal
          character.closed = true
          if (request.hp_rolls) character.hp_rolls = request.hp_rolls
          const max = request.proposal.hpMax || character.state?.hp || 1
          const current = character.state?.hp
          character.state = { ...character.state, hp: current == null ? max : Math.min(current, max) }
        }
        if (request.state_patch) {
          const { hp: _hp, ...rest } = request.state_patch
          character.state = { ...character.state, ...rest }
        }
        request.status = 'accepted'
      }
    } else {
      request.status = 'rejected'
    }
    request.updated_date = Date.now()
    persist()
    reply(ack, { ok: true })
    emitTable(found.table.code)
  })
})

function allowPlayerWrite(character, data, intent) {
  const keys = Object.keys(data)
  if (intent === 'mode') return !character.definition && keys.every((key) => key === 'mode')
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

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

http.listen(PORT, () => {
  console.log(`Scriba in ascolto sulla porta ${PORT}`)
})
