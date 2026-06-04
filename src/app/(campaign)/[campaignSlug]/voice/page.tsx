"use client";

import { Volume2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VoicePage() {
  const params = useParams<{ campaignSlug: string }>();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-sm mx-auto px-6 py-12">
        <div className="h-16 w-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
          <Volume2 className="h-7 w-7 text-[var(--accent-gold)]/60" />
        </div>
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
          Canales de voz
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          Los canales de voz están integrados en la barra lateral. Hacé click en un canal para unirte directamente.
        </p>
        <Link
          href={`/${params.campaignSlug}/chat`}
          className="inline-flex items-center gap-2 text-sm text-[var(--accent-gold)] hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="h-4 w-4" />
          Ir al chat
        </Link>
      </div>
    </div>
  );
}
