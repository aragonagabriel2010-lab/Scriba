import React, { useState } from 'react';
import { Pencil, ArrowLeft, TrendingUp, FileDown, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import InlineText from '@/components/scriba/InlineText';
import { RACES, CLASSES, SUBCLASSES, PATHS } from '@/lib/dnd/data';

export default function SheetHeader({ def, character, isMaster, onEdit, onAppearance, onOpen, onLevelUp, onExportPdf, onExportPng }) {
  const state = character.state || {};
  const race = RACES[def.race];
  const cls = CLASSES[def.classKey];
  const canLevel = isMaster && def.level < 20;
  const [exporting, setExporting] = useState('');

  const runExport = async (kind) => {
    setExporting(kind);
    try {
      if (kind === 'pdf') await onExportPdf?.();
      else await onExportPng?.();
    } finally {
      setExporting('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <button onClick={() => history.back()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Tavolo
      </button>
      <div>
        {isMaster ? (
          <InlineText value={def.name} onSave={(v) => onEdit({ definition: { ...def, name: v } })} placeholder="Nome"
            className="font-display text-4xl sm:text-5xl bg-transparent border-0 p-0 focus:outline-none" />
        ) : (
          <h1 className="font-display text-4xl sm:text-5xl">{def.name}</h1>
        )}
        <p className="text-muted-foreground mt-1">{race.name} · {cls.name}{def.subclass ? ` · ${(SUBCLASSES[def.classKey] || []).find((item) => item.key === def.subclass)?.name}` : ''}{def.path ? ` · ${PATHS.find((item) => item.key === def.path)?.name}` : ''} · livello {def.level}</p>
        <div className="mt-4">
          <p className="eyebrow mb-1">Aspetto</p>
          <InlineText value={state.appearance} onSave={onAppearance} multiline rows={2}
            placeholder="Età, occhi, tratti distintivi…"
            className="w-full rounded-xl bg-muted/40 border border-border p-3 text-sm focus:outline-none focus:border-primary/60" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onOpen} className="btn-primary h-11 px-4 text-sm">
          <Pencil className="w-3.5 h-3.5" /> {isMaster ? 'Modifica tutta la scheda' : 'Modifica la scheda'}
        </button>
        {canLevel && (
          <button onClick={onLevelUp} className="btn-ghost h-11 px-4 text-sm">
            <TrendingUp className="w-3.5 h-3.5" /> Fallo salire di livello
          </button>
        )}
        <button type="button" disabled={!!exporting} onClick={() => void runExport('png')} className="btn-ghost h-11 px-4 text-sm">
          <Image className="w-3.5 h-3.5" /> {exporting === 'png' ? 'Attendi…' : 'Esporta PNG'}
        </button>
        <button type="button" disabled={!!exporting} onClick={() => void runExport('pdf')} className="btn-ghost h-11 px-4 text-sm">
          <FileDown className="w-3.5 h-3.5" /> {exporting === 'pdf' ? 'Attendi…' : 'Esporta PDF'}
        </button>
      </div>
    </motion.div>
  );
}
