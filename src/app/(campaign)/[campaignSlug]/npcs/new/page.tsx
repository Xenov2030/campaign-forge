"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Loader2 } from "lucide-react";
import { NpcForm } from "@/components/campaign/npc-form";

export default function NewNPCPage() {
  const params = useParams();
  const slug = params.campaignSlug as string;
  const [campaignId, setCampaignId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/by-slug/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setCampaignId(d.id); });
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${slug}/npcs`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a NPCs
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center">
          <Users className="h-5 w-5 text-[#34d399]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nuevo NPC</h1>
          <p className="text-sm text-[var(--text-muted)]">Personaje no jugador para la campaña</p>
        </div>
      </div>

      {campaignId ? (
        <NpcForm slug={slug} mode="create" campaignId={campaignId} />
      ) : (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
