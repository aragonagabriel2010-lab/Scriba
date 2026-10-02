import React from 'react';
import { LogOut } from 'lucide-react';

export default function TopBar({ code, name, isMaster, tabs, tab, setTab, onLeave }) {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/80 shadow-sm shadow-black/10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-tight">Scriba</span>
            <span className="font-mono text-[10px] tracking-[0.35em] text-primary/90 uppercase">{code}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline px-2.5 py-1 rounded-lg bg-muted/50 text-xs">{name} · {isMaster ? 'Master' : 'Giocatore'}</span>
            <button onClick={onLeave} className="inline-flex items-center gap-1.5 hover:text-foreground transition">
              <LogOut className="w-4 h-4" /> Esci
            </button>
          </div>
        </div>
        <nav className="flex gap-1 pb-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2 text-sm whitespace-nowrap rounded-xl transition ${
                tab === t.key ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {t.label}
              {t.badge ? (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-primary-foreground/20">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
