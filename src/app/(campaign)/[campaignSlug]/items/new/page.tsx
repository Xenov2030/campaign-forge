"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Loader2 } from "lucide-react";
import { ItemForm } from "@/components/campaign/item-form";

export default function NewItemPage() {
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
      <Link href={`/${slug}/items`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a Objetos
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center">
          <Package className="h-5 w-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nuevo objeto</h1>
          <p className="text-sm text-[var(--text-muted)]">Un objeto para el catálogo de la campaña</p>
        </div>
      </div>

      {campaignId ? (
        <ItemForm slug={slug} mode="create" campaignId={campaignId} />
      ) : (
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
