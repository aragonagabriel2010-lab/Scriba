import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SheetHeader from './SheetHeader';
import VitalsBlock from './VitalsBlock';
import AbilitiesBlock from './AbilitiesBlock';
import MagicBlock from './MagicBlock';
import FeaturesBlock from './FeaturesBlock';
import RestBlock from './RestBlock';
import InventoryBlock from './InventoryBlock';
import NotesBlock from './NotesBlock';
import SheetEditor from './editor/SheetEditor';
import { submitProposal, submitStateChange, spendHitDie } from '@/lib/actions';
import ChoicePanel from './ChoicePanel';

export default function SheetView({ character, isMaster, pending, requests, patch, onLevelUp }) {
  const def = character.definition;
  const state = character.state || {};
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [choiceOpen, setChoiceOpen] = useState(!!character.choice);

  useEffect(() => {
    if (character.choice) setChoiceOpen(true);
  }, [character.choice?.level]);

  const list = requests || (pending ? [pending] : []);
  const update = (patchState) => {
    if (Object.prototype.hasOwnProperty.call(patchState, 'prepared')) {
      const next = { ...def, prepared: patchState.prepared };
      if (isMaster) return patch(character.id, { definition: next });
      return submitProposal(character, next, list).catch((err) => setError(err.message));
    }
    if (isMaster) return patch(character.id, { state: { ...character.state, ...patchState } });
    return submitStateChange(character, patchState, list).catch((err) => setError(err.message));
  };
  const updateDef = (patchDef) => patch(character.id, patchDef);

  const submit = async (newDef, hp) => {
    setBusy(true);
    setError('');
    try {
      if (isMaster) {
        await patch(character.id, { definition: newDef, closed: true, hp_rolls: character.hp_rolls, state: hp != null ? { ...character.state, hp } : character.state });
      } else {
        await submitProposal(character, newDef, list);
      }
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 pb-32 space-y-6">
      <SheetHeader def={def} character={character} isMaster={isMaster} onEdit={updateDef} onAppearance={(appearance) => update({ appearance })} onOpen={() => setEditing(true)} onLevelUp={onLevelUp} />
      {error && !editing && <p className="text-sm text-destructive">{error}</p>}
      {!isMaster && pending && !editing && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="text-amber-200/90">Il master deve ancora confermare le modifiche.</p>
        </div>
      )}
      <VitalsBlock def={def} state={state} isMaster={isMaster} onUpdate={update} />
      <AbilitiesBlock
        def={def}
        state={state}
        choice={!isMaster ? character.choice : null}
        onOpenChoice={() => setChoiceOpen(true)}
      />
      {!isMaster && character.choice && choiceOpen && (
        <ChoicePanel character={character} onDone={() => setChoiceOpen(false)} />
      )}
      <MagicBlock def={def} state={state} onUpdate={update} />
      <FeaturesBlock def={def} />
      <RestBlock def={def} state={state} isMaster={isMaster} onUpdate={update} onSpend={isMaster ? undefined : (next) => spendHitDie(character, next)} />
      <InventoryBlock state={state} onUpdate={update} />
      <NotesBlock state={state} onUpdate={update} />
      <AnimatePresence>
        {editing && (
          <SheetEditor
            character={character}
            initial={pending?.proposal || def}
            role={isMaster ? 'master' : character.mode}
            onSubmit={submit}
            onClose={() => { setEditing(false); setError(''); }}
            busy={busy}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  );
}