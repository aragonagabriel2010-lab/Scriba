import React from 'react';
import Section from '@/components/scriba/Section';
import InlineText from '@/components/scriba/InlineText';

export default function NotesBlock({ state, onUpdate }) {
  return (
    <Section title="Note di sessione">
      <InlineText value={state.notes} onSave={(v) => onUpdate({ notes: v })} multiline rows={5}
        placeholder="Appunti, promemoria, accordi presi al tavolo…"
        className="w-full rounded-xl bg-muted/60 border border-border p-3 text-sm focus:outline-none focus:border-primary/60" />
    </Section>
  );
}