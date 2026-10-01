import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Section from '@/components/scriba/Section'
import { autoFeatures, languages } from '@/lib/dnd/rules'
import { kindLabel, resolveFeature } from '@/lib/dnd/featureText'

function FeatureCard({ feature, onDelete }) {
  return (
    <li className="rounded-2xl border border-border/70 bg-background/30 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{feature.name}</p>
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                feature.kind === 'active'
                  ? 'border-primary/40 text-primary bg-primary/10'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {kindLabel(feature.kind)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.effect}</p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Rimuovi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </li>
  )
}

export default function FeaturesBlock({ def, isMaster, onUpdate }) {
  const base = (def.features?.length ? def.features : autoFeatures(def)).map((f) => resolveFeature(f))
  const custom = (def.customFeatures || []).map((f) => resolveFeature(f))
  const [draft, setDraft] = useState({ name: '', effect: '', kind: 'passive' })
  const [busy, setBusy] = useState(false)

  const add = async () => {
    const name = draft.name.trim().slice(0, 60)
    if (!name || !onUpdate) return
    setBusy(true)
    try {
      const next = [
        ...(def.customFeatures || []),
        {
          id: `cf-${Date.now()}`,
          name,
          effect: draft.effect.trim().slice(0, 400),
          kind: draft.kind === 'active' ? 'active' : 'passive',
        },
      ]
      await onUpdate({ definition: { ...def, customFeatures: next } })
      setDraft({ name: '', effect: '', kind: 'passive' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!onUpdate) return
    const next = (def.customFeatures || []).filter((f) => f.id !== id)
    await onUpdate({ definition: { ...def, customFeatures: next } })
  }

  return (
    <Section title="Privilegi e tratti">
      <ul className="space-y-3">
        {base.map((f) => (
          <FeatureCard key={`base-${f.id}`} feature={f} />
        ))}
        {custom.map((f) => (
          <FeatureCard
            key={`custom-${f.id}`}
            feature={f}
            onDelete={isMaster ? () => void remove(f.id) : undefined}
          />
        ))}
      </ul>

      {!base.length && !custom.length && (
        <p className="text-sm text-muted-foreground">Nessun privilegio ancora.</p>
      )}

      {isMaster && (
        <div className="mt-5 rounded-2xl border border-dashed border-border/80 p-4 space-y-3">
          <p className="eyebrow">Aggiungi (solo master)</p>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 60) }))}
            placeholder="Nome del privilegio"
            className="scriba-input h-11"
          />
          <div className="flex flex-wrap gap-2">
            {[['passive', 'Passiva'], ['active', 'Attiva']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, kind: key }))}
                className={`h-10 px-3 rounded-full border text-sm transition ${
                  draft.kind === key ? 'border-primary bg-primary/15' : 'border-border text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={draft.effect}
            onChange={(e) => setDraft((d) => ({ ...d, effect: e.target.value.slice(0, 400) }))}
            rows={3}
            placeholder="Effetto in breve…"
            className="scriba-input py-3 resize-y min-h-[5rem]"
          />
          <button
            type="button"
            disabled={busy || !draft.name.trim()}
            onClick={() => void add()}
            className="btn-primary h-11 px-4 text-sm"
          >
            <Plus className="w-4 h-4" /> {busy ? 'Attendi…' : 'Aggiungi privilegio'}
          </button>
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">Lingue: {languages(def).join(', ')}.</p>
    </Section>
  )
}
