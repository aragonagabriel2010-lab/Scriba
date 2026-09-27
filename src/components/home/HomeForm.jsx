import React, { useState } from 'react';
import { createTable, joinTable } from '@/lib/actions';

export default function HomeForm({ onDone, initialCode = '' }) {
  const [mode, setMode] = useState(initialCode ? 'join' : 'join');
  const [code, setCode] = useState(String(initialCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4));
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'create') await createTable(name);
      else await joinTable(code, name);
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  const ready = name.trim() && (mode === 'create' || code.trim().length === 4);

  return (
    <form onSubmit={submit} className="mt-10 space-y-5">
      <div className="grid grid-cols-2 p-1 rounded-full bg-muted text-sm">
        {[['join', 'Entra'], ['create', 'Crea un tavolo']].map(([k, l]) => (
          <button type="button" key={k} onClick={() => { setMode(k); setError(''); }}
            className={`py-2 rounded-full transition ${mode === k ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}>
            {l}
          </button>
        ))}
      </div>
      {mode === 'join' && (
        <label className="block">
          <span className="eyebrow">Codice del tavolo</span>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
            placeholder="····" className="scriba-input mt-2 h-14 font-mono text-2xl text-center tracking-[0.5em]" />
        </label>
      )}
      <label className="block">
        <span className="eyebrow">{mode === 'create' ? 'Il tuo nome, master' : 'Il tuo nome'}</span>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 30))} placeholder="Come ti chiamano al tavolo" className="scriba-input mt-2" />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button disabled={!ready || busy} className="btn-primary w-full h-12">
        {busy ? 'Un attimo…' : mode === 'create' ? 'Crea il tavolo' : 'Entra al tavolo'}
      </button>
    </form>
  );
}
