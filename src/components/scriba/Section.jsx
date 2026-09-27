import React from 'react';

export default function Section({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-border bg-card/60 p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="eyebrow">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}