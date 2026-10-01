import React, { useState } from 'react';
import SheetView from './SheetView';
import LevelUpPanel from './LevelUpPanel';

export default function MasterSheet({ character, pending, patch, onBack, onRoll }) {
  const [levelUp, setLevelUp] = useState(false);
  return (
    <div>
      <SheetView character={character} isMaster pending={pending} patch={patch} onLevelUp={() => setLevelUp(true)} onRoll={onRoll} />
      <LevelUpPanel character={character} open={levelUp} onClose={() => setLevelUp(false)} patch={patch} />
    </div>
  );
}