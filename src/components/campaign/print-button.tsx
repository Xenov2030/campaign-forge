"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
    >
      <Printer className="h-3.5 w-3.5" />
      Exportar PDF
    </button>
  );
}
