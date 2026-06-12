"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ItemRarity } from "@prisma/client";
import { ITEM_RARITY_LABELS, ITEM_RARITY_COLOR } from "@/lib/items";

export interface ItemCardData {
  id: string;
  name: string;
  type: string | null;
  rarity: ItemRarity;
  description: string | null;
  imageUrl: string | null;
  isArtifact: boolean;
  isKnownToParty: boolean;
}

export function ItemCard({
  item,
  campaignSlug,
  isMaster,
}: {
  item: ItemCardData;
  campaignSlug: string;
  isMaster: boolean;
}) {
  const router = useRouter();
  const [known, setKnown] = useState(item.isKnownToParty);
  const [busy, setBusy] = useState(false);

  const toggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !known;
    setKnown(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isKnownToParty: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Objeto visible para el grupo" : "Objeto oculto a los jugadores");
      router.refresh();
    } catch {
      setKnown(!next);
      toast.error("No se pudo cambiar la visibilidad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`relative flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden campaign-card ${isMaster && !known ? "opacity-70" : ""}`}>
      <Link href={`/${campaignSlug}/items/${item.id}`} className="group flex flex-col">
        {/* Imagen / ícono */}
        <div className="h-32 relative flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-overlay)] overflow-hidden">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="h-10 w-10 text-[var(--text-muted)] opacity-50" />
          )}
          <span className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full border ${ITEM_RARITY_COLOR[item.rarity]}`}>
            {ITEM_RARITY_LABELS[item.rarity]}
          </span>
          {item.isArtifact && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
              <Sparkles className="h-2.5 w-2.5" /> Artefacto
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
            {item.name}
          </h3>
          {item.type && <p className="text-xs text-[var(--text-muted)] mb-1">{item.type}</p>}
          {item.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{item.description}</p>
          )}
        </div>
      </Link>

      {isMaster && (
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={busy}
          aria-label={known ? "Ocultar a los jugadores" : "Mostrar al grupo"}
          title={known ? "Visible — clic para ocultar" : "Oculto — clic para mostrar"}
          className={`absolute top-2 right-2 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors disabled:opacity-50 ${
            known
              ? "bg-green-900/40 border-green-700/50 text-green-300 hover:bg-green-900/60"
              : "bg-black/50 border-white/15 text-gray-300 hover:bg-black/70"
          }`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : known ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
