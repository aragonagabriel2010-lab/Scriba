import React, { useState } from 'react'
import { Copy, Check, Download, Link2, Bell } from 'lucide-react'
import MemberRow from './MemberRow'
import TableNotes from './TableNotes'
import InitiativeTracker from './InitiativeTracker'
import { copyText, downloadTableBackup, tableShareUrl } from '@/lib/export'
import { askNotifyPermission } from '@/hooks/useRequestNotify'

export default function TableView({ table, characters, requests, isMaster, onOpen, onSaveNotes, onSaveTable }) {
  const pendingIds = new Set(requests.filter((r) => r.status === 'pending').map((r) => r.character_id))
  const [copied, setCopied] = useState('')
  const [notifyMsg, setNotifyMsg] = useState('')

  const copy = async (kind) => {
    const value = kind === 'link' ? tableShareUrl(table.code) : table.code
    await copyText(value)
    setCopied(kind)
    setTimeout(() => setCopied(''), 1800)
  }

  const enableNotify = async () => {
    const result = await askNotifyPermission()
    setNotifyMsg(result === 'granted' ? 'Avvisi attivi su questo dispositivo.' : 'Avvisi non concessi. Resta il suono in app.')
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Codice del tavolo</p>
        <p className="mt-2 font-mono text-5xl sm:text-6xl tracking-[0.3em] text-primary">{table.code}</p>
        <p className="mt-3 text-sm text-muted-foreground">Condividilo: si entra con il codice e il proprio nome. {characters.length + 1} / 8 presenti.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => void copy('code')} className="btn-primary h-11 px-4 text-sm">
            {copied === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'code' ? 'Copiato' : 'Copia codice'}
          </button>
          <button type="button" onClick={() => void copy('link')} className="btn-ghost h-11 px-4 text-sm">
            {copied === 'link' ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {copied === 'link' ? 'Link copiato' : 'Copia link'}
          </button>
          {isMaster && (
            <>
              <button type="button" onClick={() => downloadTableBackup(table, characters, requests)} className="btn-ghost h-11 px-4 text-sm">
                <Download className="w-4 h-4" /> Backup JSON
              </button>
              <button type="button" onClick={() => void enableNotify()} className="btn-ghost h-11 px-4 text-sm">
                <Bell className="w-4 h-4" /> Avvisi richieste
              </button>
            </>
          )}
        </div>
        {notifyMsg && <p className="mt-2 text-xs text-muted-foreground">{notifyMsg}</p>}
      </div>

      <InitiativeTracker
        table={table}
        characters={characters}
        isMaster={isMaster}
        onSave={(data) => onSaveTable?.(data)}
      />

      <ul className="divide-y divide-border border-y border-border">
        <li className="py-4 flex items-center justify-between">
          <div>
            <p>{table.master_name}</p>
            <p className="text-sm text-muted-foreground">{isMaster ? 'Master · tiene il tavolo e le richieste' : 'Master'}</p>
          </div>
        </li>
        {characters.map((c) => (
          <MemberRow key={c.id} character={c} pending={isMaster && pendingIds.has(c.id)} onClick={isMaster && c.definition ? () => onOpen(c.id) : undefined} />
        ))}
      </ul>
      {!characters.length && <p className="text-sm text-muted-foreground">Nessun giocatore ancora. Il tavolo aspetta.</p>}
      <TableNotes notes={table.notes} onSave={onSaveNotes} />
    </div>
  )
}
