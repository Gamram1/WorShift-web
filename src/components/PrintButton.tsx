'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-4 py-2 rounded-xl border border-ws-border text-ws-mid text-sm font-bold hover:text-ws-primary hover:border-ws-primary transition-colors"
    >
      인쇄 / PDF
    </button>
  )
}
