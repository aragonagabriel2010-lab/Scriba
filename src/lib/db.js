import { io } from 'socket.io-client'
import { getSession } from './session'

const socket = io({ transports: ['websocket'] })

function ask(event, payload) {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res) => {
      if (!res?.ok) reject(new Error(res?.error || 'Qualcosa è andato storto.'))
      else resolve(res)
    })
  })
}

export function watchTable(code, token, onState) {
  socket.emit('watch', { code, token }, (res) => {
    if (res?.ok) onState(res)
  })
  const handler = (state) => onState(state)
  socket.on('state', handler)
  return () => socket.off('state', handler)
}

export function createTableRemote(masterName) {
  return ask('createTable', { masterName })
}

export function joinTableRemote(code, name) {
  return ask('joinTable', { code, name })
}

export function updateCharacter(id, data) {
  const session = getSession()
  return ask('updateCharacter', { id, data, token: session?.token })
}

export function updateTable(id, data) {
  return ask('updateTable', { id, data })
}

export function saveRequest(data, id) {
  return ask('saveRequest', { data, id })
}

export function resolveRequest(id, accept) {
  return ask('resolveRequest', { id, accept })
}
