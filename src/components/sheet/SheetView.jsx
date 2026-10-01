import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SheetHero from './SheetHero';
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
import { pendingChoice, unspentAsiPoints, unspentExpertiseSlots } from '@/lib/dnd/rules';
import { exportSheetImage, exportSheetPdf } from '@/lib/export';

export default function SheetView({ character, isMaster, pending, requests, patch, onLevelUp, onRoll }) {
  const def = character.definition;
  const state = character.state || {};
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const choice = pendingChoice(character);
  const [choiceOpen, setChoiceOpen] = useState(!!choice);

  useEffect(() => {
    if (choice) setChoiceOpen(true);
  }, [choice?.level, choice?.asiPoints, choice?.expertise]);

  useEffect(() => {
    if (!isMaster || !choice || character.choice) return;
    patch(character.id, {
      choice: {
        level: choice.level,
        asi: choice.asi,
        asiPoints: choice.asiPoints,
        expertise: choice.expertise,
      },
    });
  }, [isMaster, character.id, character.choice, choice?.level, choice?.asiPoints, choice?.expertise]);

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
        const prev = character.definition?.level || 1;
        const payload = {
          definition: newDef,
          closed: true,
          hp_rolls: character.hp_rolls,
          state: hp != null ? { ...character.state, hp } : character.state,
        };
        if (newDef.level > prev) {
          const asiPoints = unspentAsiPoints(newDef);
          const expertise = unspentExpertiseSlots(newDef);
          if (asiPoints || expertise) {
            payload.choice = { level: newDef.level, asi: asiPoints > 0, asiPoints, expertise };
          }
        }
        await patch(character.id, payload);
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

  const sheetRef = useRef(null);
  const fileName = (def.name || 'scheda').replace(/[^\w\-]+/g, '_');

  return (
    <div ref={sheetRef} className="sheet-page max-w-3xl mx-auto px-5 py-6 pb-32 space-y-8 bg-background">
      <SheetHero
        def={def}
        state={state}
        isMaster={isMaster}
        onEdit={updateDef}
        onUpdate={update}
        onRoll={onRoll}
      />

      <SheetHeader
        def={def}
        character={character}
        isMaster={isMaster}
        onEdit={updateDef}
        onAppearance={(appearance) => update({ appearance })}
        onOpen={() => setEditing(true)}
        onLevelUp={onLevelUp}
        onExportPng={() => exportSheetImage(sheetRef.current, `${fileName}.png`)}
        onExportPdf={() => exportSheetPdf(sheetRef.current, `${fileName}.pdf`)}
        showBack={isMaster}
      />

      {error && !editing && <p className="text-sm text-destructive">{error}</p>}
      {!isMaster && pending && !editing && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <p className="text-amber-200/90">Il master deve ancora confermare le modifiche.</p>
        </div>
      )}
      {isMaster && choice && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
          Il giocatore ha ancora punti del livello da assegnare
          {choice.asiPoints ? ` (${choice.asiPoints} ai punteggi)` : ''}
          {choice.expertise ? ` e ${choice.expertise} maestria` : ''}.
        </div>
      )}

      <VitalsBlock def={def} state={state} onUpdate={update} />
      <AbilitiesBlock
        def={def}
        state={state}
        choice={!isMaster ? choice : null}
        onOpenChoice={() => setChoiceOpen(true)}
        onRoll={onRoll}
      />
      {!isMaster && choice && choiceOpen && character.choice && (
        <ChoicePanel character={character} choice={choice} onDone={() => setChoiceOpen(false)} />
      )}
      {!isMaster && choice && !character.choice && (
        <div className="rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">
          Hai punti da assegnare: chiedi al master di aprire un attimo la tua scheda, poi ricarica.
        </div>
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
