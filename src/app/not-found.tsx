import Link from "next/link";
import { Compass, Crown, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-gold)]/4 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-arcane)]/6 blur-[100px]" />
      </div>

      <div className="relative text-center max-w-lg mx-auto animate-fade-in-up">
        {/* Icon */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 mb-6 animate-float">
          <Compass className="h-10 w-10 text-[var(--accent-gold)]" aria-hidden="true" />
        </div>

        {/* Label */}
        <p className="text-[var(--accent-gold)] text-sm font-display uppercase tracking-[0.3em] mb-3">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-[0.9] mb-4">
          Tierra<br />
          <span className="gold-text">Inexplorada</span>
        </h1>

        {/* Description */}
        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 font-body leading-relaxed max-w-sm mx-auto">
          Tu aventurero se ha perdido en el mapa. Esta página no existe en nuestros registros del mundo conocido.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-lg)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] font-display tracking-wide"
          >
            <Crown className="h-4 w-4" aria-hidden="true" />
            Ir al dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-lg)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
