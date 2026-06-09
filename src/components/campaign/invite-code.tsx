"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

/** Bloque del código de invitación con botón de copiar (lo que se copia = lo que se ve). */
export function InviteCode({ code }: { code: string }) {
  const display = code.slice(0, 6).toUpperCase();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el código");
    }
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Código de invitación</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-lg font-bold text-[var(--accent-gold)] tracking-widest flex-1 min-w-0 truncate">
          {display}
        </p>
        <button
          onClick={copy}
          aria-label="Copiar código de invitación"
          title="Copiar"
          className="shrink-0 h-8 w-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-[var(--accent-nature)]" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-1">Comparte este código con tus jugadores</p>
    </div>
  );
}
