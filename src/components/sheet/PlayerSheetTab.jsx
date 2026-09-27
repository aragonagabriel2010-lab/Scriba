import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ModePicker from './ModePicker';
import SheetView from './SheetView';
import SheetEditor from './editor/SheetEditor';
import { submitProposal } from '@/lib/actions';

export default function PlayerSheetTab({ character, requests, patch }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = requests.find((r) => r.character_id === character.id && r.status === 'pending');
  const rejected = requests.find((r) => r.character_id === character.id && r.status === 'rejected');

  const setMode = (mode) => patch(character.id, { mode, _intent: 'mode' });

  const submit = async (def) => {
    setBusy(true);
    setError('');
    try {
      await submitProposal(character, def, requests);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!character.mode) return <ModePicker onPick={setMode} />;

  if (!character.definition) {
    return (
      <>
        {!editing ? (
          <div className="space-y-6">
            <div>
              <p className="eyebrow">{character.mode === 'regole' ? 'Segui le regole' : 'Personaggio libero'}</p>
              <h1 className="font-display text-3xl mt-2">Crea la tua scheda</h1>
            </div>
            {pending && <p className="text-sm text-amber-200/90">Il master deve ancora confermare la scheda.</p>}
            {rejected && <p className="text-sm text-rose-300/80">L'ultima proposta è stata rifiutata. Rivedi la scheda e riprova.</p>}
            <button onClick={() => setEditing(true)} className="btn-primary">Inizia</button>
            {!pending && (
              <button onClick={() => patch(character.id, { mode: '', _intent: 'mode' })} className="block text-sm text-muted-foreground hover:text-foreground mt-2">Cambia modo</button>
            )}
          </div>
        ) : (
          <SheetEditor
            character={character}
            initial={null}
            role={character.mode}
            onSubmit={submit}
            onClose={() => { setEditing(false); setError(''); }}
            busy={busy}
            error={error}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SheetView character={character} isMaster={false} pending={pending} requests={requests} patch={patch} />
      <AnimatePresence>
        {editing && (
          <SheetEditor
            character={character}
            initial={pending?.proposal || character.definition}
            role={character.mode}
            onSubmit={submit}
            onClose={() => { setEditing(false); setError(''); }}
            busy={busy}
            error={error}
          />
        )}
      </AnimatePresence>
    </>
  );
}