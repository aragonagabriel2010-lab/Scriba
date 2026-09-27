import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSession } from '@/lib/session';
import HomeForm from '@/components/home/HomeForm';

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialCode = params.get('codice') || '';
  useEffect(() => { if (getSession()) navigate('/tavolo', { replace: true }); }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm">
        <p className="eyebrow text-primary">D&D 5e · al tavolo</p>
        <h1 className="mt-3 font-display text-7xl sm:text-8xl leading-none tracking-tight">Scriba</h1>
        <p className="mt-5 text-muted-foreground leading-relaxed">
          Le schede dei personaggi, condivise in tempo reale. Dal telefono o dal computer, senza account.
        </p>
        <HomeForm initialCode={initialCode} onDone={() => navigate('/tavolo')} />
      </motion.div>
      <p className="mt-20 text-xs text-muted-foreground/60">Regole dall’SRD 5.1 · CC BY 4.0</p>
    </div>
  );
}