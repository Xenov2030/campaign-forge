"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Package, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface CampaignItem {
  id: string;
  name: string;
}

interface Props {
  characterId: string;
  campaignItems: CampaignItem[];
}

export function AddItemToInventory({ characterId, campaignItems }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(campaignItems[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (campaignItems.length === 0) return null;

  const assign = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, itemId: selectedId, quantity }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      toast.success("Objeto añadido al inventario");
      setOpen(false);
      setQuantity(1);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al añadir el objeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-xs font-medium border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir objeto
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 p-4 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] border border-[var(--border-default)] space-y-3">
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Seleccionar objeto de la campaña</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-40">
              <label className="text-xs text-[var(--text-muted)]">Objeto</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] h-9 pl-8 pr-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                >
                  {campaignItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 w-20">
              <label className="text-xs text-[var(--text-muted)]">Cantidad</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] h-9 px-3 rounded-[var(--radius-md)] text-sm text-center focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>
            <button
              onClick={assign}
              disabled={loading || !selectedId}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--accent-gold)] text-[var(--bg-base)] hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Añadir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
