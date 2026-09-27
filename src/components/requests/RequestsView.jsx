import React from 'react';
import RequestCard from './RequestCard';
import ChangeLines from '@/components/scriba/ChangeLines';

export default function RequestsView({ requests, characters, patch, isMaster, characterId }) {
  const mine = requests.filter((r) => r.character_id === characterId);
  const list = isMaster ? requests.filter((r) => r.status === 'pending') : mine;
  const sorted = [...list].sort((a, b) => (b.updated_date || '').localeCompare(a.updated_date || ''));
  const char = (id) => characters.find((c) => c.id === id);
  const resolved = (isMaster ? requests : mine).filter((r) => r.status !== 'pending').slice(0, 10);

  return (
    <div className="space-y-8">
      {sorted.length ? (
        <ul className="space-y-4">
          {sorted.map((r) => <RequestCard key={r.id} req={r} character={char(r.character_id)} patch={patch} />)}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{isMaster ? 'Nessuna richiesta in attesa.' : 'Non hai richieste in attesa.'}</p>
      )}
      {resolved.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Cronologia</p>
          <ul className="space-y-3">
            {resolved.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-card/40 p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm">{char(r.character_id)?.player_name || r.player_name}</span>
                  <span className={`text-xs ${r.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>{r.status === 'accepted' ? 'accettata' : 'rifiutata'}</span>
                </div>
                <div className="opacity-60"><ChangeLines changes={r.changes} /></div>
                {r.note && <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isMaster && (
        <p className="text-xs text-muted-foreground/60">Nella scheda a regole le modifiche si applicano subito. Nel personaggio libero, ogni cambio di definizione passa di qui.</p>
      )}
    </div>
  );
}