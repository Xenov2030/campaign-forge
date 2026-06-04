"use client";

import { useRouter } from "next/navigation";
import { Compass, ChevronLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-gold)]/4 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-arcane)]/6 blur-[100px]" />
      </div>

      <div className="relative text-center max-w-lg mx-auto animate-fade-in-up">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 mb-6 animate-float">
          <Compass className="h-10 w-10 text-[var(--accent-gold)]" aria-hidden="true" />
        </div>

        <p className="text-[var(--accent-gold)] text-sm font-display uppercase tracking-[0.3em] mb-3">
          Error 404
        </p>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-[0.9] mb-4">
          Tierra<br />
          <span className="gold-text">Inexplorada</span>
        </h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 font-body leading-relaxed max-w-sm mx-auto">
          Tu aventurero se ha perdido en el mapa. Esta página no existe en nuestros registros del mundo conocido.
        </p>

        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/dashboard");
            }
          }}
          className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-lg)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] font-display tracking-wide cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>
      </div>
    </div>
  );
}
