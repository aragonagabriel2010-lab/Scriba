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
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="scriba-card">
          <p className="eyebrow text-primary">D&D 5e · al tavolo</p>
          <h1 className="mt-3 font-display text-6xl sm:text-7xl leading-none tracking-tight">Scriba</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Schede condivise in tempo reale. Dal telefono o dal computer, senza account — solo codice tavolo.
          </p>
          <div className="mt-8">
            <HomeForm initialCode={initialCode} onDone={() => navigate('/tavolo')} />
          </div>
        </div>
      </motion.div>
      <p className="mt-16 text-xs text-muted-foreground/60">Regole dall’SRD 5.1 · CC BY 4.0</p>
    </div>
  );
}
