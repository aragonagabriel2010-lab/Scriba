import React from 'react';
import Section from '@/components/scriba/Section';
import { autoFeatures, languages } from '@/lib/dnd/rules';

export default function FeaturesBlock({ def }) {
  const features = def.features?.length ? def.features : autoFeatures(def);
  return (
    <Section title="Privilegi e tratti">
      <ul className="space-y-1.5 text-sm">
        {features.map((f, i) => <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">·</span>{f}</li>)}
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">Lingue: {languages(def).join(', ')}.</p>
    </Section>
  );
}