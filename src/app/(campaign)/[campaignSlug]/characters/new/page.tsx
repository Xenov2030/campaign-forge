"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sword } from "lucide-react";
import { CharacterForm } from "@/components/campaign/character-form";

export default function NewCharacterPage() {
  const params = useParams();
  const slug = params.campaignSlug as string;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${slug}/characters`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a personajes
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center">
          <Sword className="h-5 w-5 text-[#60a5fa]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nuevo personaje</h1>
          <p className="text-sm text-[var(--text-muted)]">Crea tu aventurero</p>
        </div>
      </div>

      <CharacterForm slug={slug} mode="create" />
    </div>
  );
}
