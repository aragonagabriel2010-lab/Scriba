import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function exportSheetImage(node, filename = 'scheda-scriba.png') {
  if (!node) throw new Error('Scheda non trovata.')
  const canvas = await html2canvas(node, {
    backgroundColor: '#14110f',
    scale: 2,
    useCORS: true,
    logging: false,
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportSheetPdf(node, filename = 'scheda-scriba.pdf') {
  if (!node) throw new Error('Scheda non trovata.')
  const canvas = await html2canvas(node, {
    backgroundColor: '#14110f',
    scale: 2,
    useCORS: true,
    logging: false,
  })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  pdf.addImage(img, 'PNG', (pageW - w) / 2, 16, w, h)
  pdf.save(filename)
}

export function downloadTableBackup(table, characters, requests, enemies = [], combatLog = []) {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'scriba',
    table,
    characters,
    requests,
    enemies,
    combatLog,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = `scriba-${table.code || 'tavolo'}.json`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}

export function tableShareUrl(code) {
  const base = window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return `${base}?codice=${encodeURIComponent(code)}`
}
