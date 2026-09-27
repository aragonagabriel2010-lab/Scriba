import { createTableRemote, joinTableRemote, saveRequest, resolveRequest, updateCharacter } from './db'
import { setSession } from './session'
import { autoFeatures, diffDefinitions, diffState, validateRules } from './dnd/rules'

export async function createTable(masterName) {
  const created = await createTableRemote(masterName)
  setSession({ code: created.code, role: 'master', token: created.token })
}

export async function joinTable(rawCode, rawName) {
  const joined = await joinTableRemote(rawCode, rawName)
  setSession({ code: joined.code, role: joined.role, token: joined.token, characterId: joined.characterId })
}

const pendingOf = (character, requests) => requests.find((request) => request.character_id === character.id && request.status === 'pending')

export async function submitProposal(character, def, requests) {
  if (character.mode === 'regole') {
    const errors = validateRules(def, character)
    if (errors.length) throw new Error(errors[0])
  }
  if (character.closed && character.definition && def.level !== character.definition.level) {
    throw new Error('Il livello lo cambia solo il master.')
  }
  const pending = pendingOf(character, requests)
  const next = { ...def, features: character.mode === 'regole' ? autoFeatures(def) : (def.features?.length ? def.features : autoFeatures(def)) }
  const preview = pending?.state_patch ? { ...character.state, ...pending.state_patch } : character.state
  const changes = [...diffDefinitions(character.definition, next), ...diffState(character.state, preview)]
  if (!changes.length) throw new Error('Nessuna modifica da inviare.')
  const data = {
    character_id: character.id,
    player_name: character.player_name,
    first: !character.closed,
    changes,
    proposal: next,
    hp_rolls: character.hp_rolls || {},
    state_patch: pending?.state_patch || null,
    note: '',
  }
  return saveRequest(data, pending?.id)
}

export async function submitStateChange(character, patchState, requests) {
  const { hp: _hp, prepared, ...rest } = patchState
  if (prepared) return submitProposal(character, { ...character.definition, prepared }, requests)
  if (!Object.keys(rest).length) return
  const pending = pendingOf(character, requests)
  const state_patch = { ...(pending?.state_patch || {}), ...rest }
  delete state_patch.hp
  const preview = { ...character.state, ...state_patch }
  const definitionChanges = pending?.proposal ? diffDefinitions(character.definition, pending.proposal) : []
  const changes = [...definitionChanges, ...diffState(character.state, preview)]
  if (!changes.length) throw new Error('Nessuna modifica da inviare.')
  const data = {
    character_id: character.id,
    player_name: character.player_name,
    first: false,
    changes,
    proposal: pending?.proposal || null,
    hp_rolls: pending?.hp_rolls || null,
    state_patch,
    note: '',
  }
  return saveRequest(data, pending?.id)
}

export async function acceptRequest(req, character) {
  return resolveRequest(req.id, true)
}

export async function rejectRequest(req) {
  return resolveRequest(req.id, false)
}

export function spendHitDie(character, state) {
  return updateCharacter(character.id, { state, _intent: 'spend' })
}

export function applyChoice(character, definition) {
  return updateCharacter(character.id, { definition, choice: null, _intent: 'choice' })
}
