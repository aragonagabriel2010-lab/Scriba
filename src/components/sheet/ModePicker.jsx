import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

export default function ModePicker({ onPick }) {
  const modes = [
    { key: 'regole', icon: Shield, title: 'Segui le regole', desc: 'Razza, classe, punteggi e magie restano nei limiti del manuale. La scheda si applica subito.' },
    { key: 'libera', icon: Sparkles, title: 'Personaggio libero', desc: 'Razza e classe dal manuale, il resto si compone. Puoi anche inventare magie. Le modifiche arrivano al master.' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <p className="eyebrow">Crea la scheda</p>
        <h1 className="font-display text-4xl mt-2">Scegli come</h1>
      </div>
      {modes.map((m) => (
        <button key={m.key} onClick={() => onPick(m.key)}
          className="w-full text-left p-5 rounded-2xl border border-border bg-card/60 hover:border-primary/50 transition group">
          <div className="flex items-start gap-4">
            <m.icon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}