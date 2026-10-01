import React from 'react'

export default function Section({ title, action, children, className = '', quiet = false }) {
  return (
    <section
      className={
        quiet
          ? `py-2 ${className}`
          : `rounded-3xl border border-border/70 bg-card/40 p-5 sm:p-6 ${className}`
      }
    >
      {(title || action) && (
        <div className={`flex items-center justify-between gap-4 ${quiet ? 'mb-4' : 'mb-5'}`}>
          <h3 className="eyebrow">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
