import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { clearSession, getSession } from '@/lib/session';
import useTable from '@/hooks/useTable';
import TopBar from '@/components/table/TopBar';
import TableView from '@/components/table/TableView';
import RequestsView from '@/components/requests/RequestsView';
import ManualView from '@/components/manual/ManualView';
import PlayerSheetTab from '@/components/sheet/PlayerSheetTab';
import MasterSheet from '@/components/sheet/MasterSheet';
import DiceView from '@/components/sheet/DiceView';

const MASTER_TABS = [
  { key: 'tavolo', label: 'Tavolo' },
  { key: 'richieste', label: 'Richieste' },
  { key: 'dadi', label: 'Dadi' },
  { key: 'manuale', label: 'Manuale' },
];
const PLAYER_TABS = [
  { key: 'scheda', label: 'Scheda' },
  { key: 'tavolo', label: 'Tavolo' },
  { key: 'dadi', label: 'Dadi' },
  { key: 'manuale', label: 'Manuale' },
];

export default function Table() {
  const navigate = useNavigate();
  const session = getSession();
  const code = session?.code;
  const { table, characters, requests, patchCharacter, patchTable } = useTable(code);
  const [tab, setTab] = useState(session?.role === 'master' ? 'tavolo' : 'scheda');
  const [viewId, setViewId] = useState(null);

  useEffect(() => {
    if (table === undefined) return;
    if (table === null) { clearSession(); navigate('/', { replace: true }); return; }
    if (session.role === 'master') {
      if (table.master_uid !== session.token) { clearSession(); navigate('/', { replace: true }); }
    } else {
      const ch = characters.find((c) => c.id === session.characterId && c.player_uid === session.token);
      if (characters.length && !ch) { clearSession(); navigate('/', { replace: true }); }
    }
  }, [table, characters]);

  if (!table) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isMaster = session.role === 'master';
  const myCharacter = characters.find((c) => c.id === session.characterId);
  const tabs = isMaster ? MASTER_TABS : PLAYER_TABS;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const tabsWithBadge = isMaster && pendingCount ? tabs.map((t) => t.key === 'richieste' ? { ...t, badge: pendingCount } : t) : tabs;
  const viewing = viewId ? characters.find((c) => c.id === viewId) : null;
  const viewingPending = viewing ? requests.find((r) => r.character_id === viewing.id && r.status === 'pending') : null;

  const leave = () => { clearSession(); navigate('/', { replace: true }); };
  const setTabSafe = (k) => { setViewId(null); setTab(k); };

  return (
    <div className="min-h-screen pb-24">
      <TopBar code={table.code} name={isMaster ? table.master_name : myCharacter?.player_name} isMaster={isMaster} tabs={tabsWithBadge} tab={viewId ? 'tavolo' : tab} setTab={setTabSafe} onLeave={leave} />
      <main className="max-w-3xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={viewId || tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {viewing && isMaster ? (
              <MasterSheet character={viewing} pending={viewingPending} patch={patchCharacter} onBack={() => setViewId(null)} />
            ) : tab === 'tavolo' ? (
              <TableView table={table} characters={characters} requests={requests} isMaster={isMaster} onOpen={(id) => setViewId(id)} onSaveNotes={(text) => patchTable(table.id, { notes: text })} />
            ) : tab === 'richieste' && isMaster ? (
              <RequestsView requests={requests} characters={characters} patch={patchCharacter} />
            ) : tab === 'dadi' ? (
              <DiceView character={myCharacter} />
            ) : tab === 'manuale' ? (
              <ManualView />
            ) : tab === 'scheda' && myCharacter ? (
              <PlayerSheetTab character={myCharacter} requests={requests} patch={patchCharacter} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}