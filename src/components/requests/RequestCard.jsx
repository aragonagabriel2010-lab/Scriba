import React from 'react';
import Section from '@/components/scriba/Section';
import ChangeLines from '@/components/scriba/ChangeLines';
import { Check, X } from 'lucide-react';
import { acceptRequest, rejectRequest } from '@/lib/actions';

export default function RequestCard({ req, character, patch }) {
  const [busy, setBusy] = React.useState(false);
  const decide = async (fn) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };
  return (
    <li className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">{character?.player_name}{req.first ? ' · prima scheda' : ' · modifica'}</p>
        <span className="text-xs text-muted-foreground">in attesa</span>
      </div>
      <div className="mt-3">
        <ChangeLines changes={req.changes} />
      </div>
      <div className="mt-4 flex gap-2">
        <button disabled={busy} onClick={() => decide(() => acceptRequest(req, character, patch))} className="btn-primary h-9 px-4 text-xs"><Check className="w-3.5 h-3.5" /> Accetta</button>
        <button disabled={busy} onClick={() => decide(() => rejectRequest(req))} className="btn-ghost h-9 px-4 text-xs"><X className="w-3.5 h-3.5" /> Rifiuta</button>
      </div>
    </li>
  );
}