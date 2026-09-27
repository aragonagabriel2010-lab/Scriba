import React from 'react';
import Section from '@/components/scriba/Section';
import { MANUAL_BOOKS } from '@/lib/dnd/manual';

export default function ManualView() {
  return (
    <div className="space-y-10">
      {MANUAL_BOOKS.map((book) => (
        <section key={book.title} className="space-y-3">
          <div>
            <h2 className="font-display text-2xl">{book.title}</h2>
            {book.note && <p className="mt-1 text-xs text-muted-foreground/80">{book.note}</p>}
          </div>
          {book.sections.map((section) => (
            <details key={section.title} className="group rounded-2xl border border-border bg-card/60 px-5 py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium">{section.title}</span>
                <span className="text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.body}</p>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}