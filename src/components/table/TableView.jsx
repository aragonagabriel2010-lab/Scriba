import React from 'react';
import MemberRow from './MemberRow';
import TableNotes from './TableNotes';

export default function TableView({ table, characters, requests, isMaster, onOpen, onSaveNotes }) {
  const pendingIds = new Set(requests.filter((r) => r.status === 'pending').map((r) => r.character_id));
  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Codice del tavolo</p>
        <p className="mt-2 font-mono text-5xl sm:text-6xl tracking-[0.3em] text-primary">{table.code}</p>
        <p className="mt-3 text-sm text-muted-foreground">Condividilo: si entra con il codice e il proprio nome. {characters.length + 1} / 8 presenti.</p>
      </div>
      <ul className="divide-y divide-border border-y border-border">
        <li className="py-4 flex items-center justify-between">
          <div>
            <p>{table.master_name}</p>
            <p className="text-sm text-muted-foreground">Master · tiene il tavolo e le richieste</p>
          </div>
        </li>
        {characters.map((c) => (
          <MemberRow key={c.id} character={c} pending={pendingIds.has(c.id)} onClick={isMaster && c.definition ? () => onOpen(c.id) : undefined} />
        ))}
      </ul>
      {!characters.length && <p className="text-sm text-muted-foreground">Nessun giocatore ancora. Il tavolo aspetta.</p>}
      <TableNotes notes={table.notes} onSave={onSaveNotes} />
    </div>
  );
}