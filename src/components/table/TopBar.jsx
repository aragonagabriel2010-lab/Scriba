import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export default function TopBar({ code, name, isMaster, tabs, tab, setTab, onLeave }) {
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl">Scriba</span>
            <span className="font-mono text-xs tracking-[0.3em] text-primary">{code}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{name} · {isMaster ? 'Master' : 'Giocatore'}</span>
            <button onClick={onLeave} className="inline-flex items-center gap-1.5 hover:text-foreground transition">
              <LogOut className="w-4 h-4" /> Esci
            </button>
          </div>
        </div>
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative py-3 text-sm whitespace-nowrap transition ${tab === t.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
              {t.badge ? <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">{t.badge}</span> : null}
              {tab === t.key && <motion.span layoutId="tab-line" className="absolute left-0 right-0 bottom-0 h-px bg-primary" />}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}