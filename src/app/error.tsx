"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-crimson)]/5 blur-[120px]" />
      </div>

      <div className="relative text-center max-w-lg mx-auto animate-fade-in-up">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-900/20 border border-red-800/30 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden="true" />
        </div>

        <p className="text-red-400 text-sm font-display uppercase tracking-[0.3em] mb-3">
          Algo salió mal
        </p>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
          Error del Servidor
        </h1>

        <p className="text-[var(--text-secondary)] text-base mb-10 font-body leading-relaxed max-w-sm mx-auto">
          Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-lg)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] font-display tracking-wide"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Intentar de nuevo
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-lg)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
