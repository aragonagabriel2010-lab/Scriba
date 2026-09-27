import React, { useState } from 'react';
import SheetView from './SheetView';
import LevelUpPanel from './LevelUpPanel';

export default function MasterSheet({ character, pending, patch, onBack }) {
  const [levelUp, setLevelUp] = useState(false);
  return (
    <div>
      <SheetView character={character} isMaster pending={pending} patch={patch} onLevelUp={() => setLevelUp(true)} />
      <LevelUpPanel character={character} open={levelUp} onClose={() => setLevelUp(false)} patch={patch} />
    </div>
  );
}