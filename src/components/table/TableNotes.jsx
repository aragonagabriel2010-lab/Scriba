import React, { useState, useEffect, useRef } from 'react';
import Section from '@/components/scriba/Section';
import { NotebookPen, Check } from 'lucide-react';

export default function TableNotes({ notes, onSave }) {
  const [text, setText] = useState(notes || '');
  const [saved, setSaved] = useState(false);
  const dirty = text !== (notes || '');

  useEffect(() => { if (!dirty) setText(notes || ''); }, [notes]);

  const save = () => {
    if (!dirty) return;
    onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Section title="Diario del tavolo" action={saved ? <span className="inline-flex items-center gap-1 text-xs text-emerald-300/80"><Check className="w-3 h-3" /> Salvato</span> : null}>
      <p className="text-sm text-muted-foreground mb-3">Promemoria condivisi su storia e luoghi, visibili a tutto il tavolo.</p>
      <div className="relative">
        <NotebookPen className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          placeholder="Appunti della sessione: luoghi visitati, NPC, colpi di scena…"
          className="w-full min-h-40 rounded-xl bg-muted/60 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors resize-y leading-relaxed"
        />
      </div>
    </Section>
  );
}