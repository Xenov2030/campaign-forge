"use client";

import { Hammer } from "lucide-react";

interface UnderConstructionProps {
  title: string;
  description: string;
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] px-4">
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-gold)]/4 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-arcane)]/6 blur-[100px]" />
      </div>

      <div className="relative text-center max-w-md mx-auto animate-fade-in-up">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 mb-6 animate-float">
          <Hammer className="h-10 w-10 text-[var(--accent-gold)]" aria-hidden="true" />
        </div>

        <p className="text-[var(--accent-gold)] text-sm font-display uppercase tracking-[0.3em] mb-3">
          En construcción
        </p>

        <h1 className="font-display text-4xl font-black text-[var(--text-primary)] tracking-tight mb-4">
          {title}
        </h1>

        <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
