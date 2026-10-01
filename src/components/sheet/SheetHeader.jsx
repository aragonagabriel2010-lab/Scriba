import React, { useState } from 'react'
import { Pencil, ArrowLeft, TrendingUp, FileDown, Image } from 'lucide-react'
import InlineText from '@/components/scriba/InlineText'

export default function SheetHeader({
  def,
  character,
  isMaster,
  onEdit: _onEdit,
  onAppearance,
  onOpen,
  onLevelUp,
  onExportPdf,
  onExportPng,
  showBack = true,
}) {
  const state = character.state || {}
  const canLevel = isMaster && def.level < 20
  const [exporting, setExporting] = useState('')
  const [showAppearance, setShowAppearance] = useState(!!state.appearance)

  const runExport = async (kind) => {
    setExporting(kind)
    try {
      if (kind === 'pdf') await onExportPdf?.()
      else await onExportPng?.()
    } finally {
      setExporting('')
    }
  }

  return (
    <div className="space-y-4">
      {showBack && (
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Tavolo
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onOpen} className="btn-primary h-11 px-4 text-sm">
          <Pencil className="w-3.5 h-3.5" /> {isMaster ? 'Modifica scheda' : 'Modifica'}
        </button>
        {canLevel && (
          <button type="button" onClick={onLevelUp} className="btn-ghost h-11 px-4 text-sm">
            <TrendingUp className="w-3.5 h-3.5" /> Livello
          </button>
        )}
        <button type="button" disabled={!!exporting} onClick={() => void runExport('png')} className="btn-ghost h-11 px-4 text-sm">
          <Image className="w-3.5 h-3.5" /> {exporting === 'png' ? '…' : 'PNG'}
        </button>
        <button type="button" disabled={!!exporting} onClick={() => void runExport('pdf')} className="btn-ghost h-11 px-4 text-sm">
          <FileDown className="w-3.5 h-3.5" /> {exporting === 'pdf' ? '…' : 'PDF'}
        </button>
        <button
          type="button"
          onClick={() => setShowAppearance((v) => !v)}
          className="btn-ghost h-11 px-4 text-sm"
        >
          Aspetto
        </button>
      </div>

      {showAppearance && (
        <div>
          <p className="eyebrow mb-2">Aspetto</p>
          <InlineText
            value={state.appearance}
            onSave={onAppearance}
            multiline
            rows={2}
            placeholder="Età, occhi, tratti distintivi…"
            className="w-full rounded-2xl bg-muted/30 border border-border/70 p-3 text-sm focus:outline-none focus:border-primary/60"
          />
        </div>
      )}
    </div>
  )
}
