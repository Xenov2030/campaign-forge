"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirmStore } from "@/store/confirm-store";

interface Props {
  slug: string;
  itemId: string;
  itemName: string;
}

export function ItemDangerZone({ slug, itemId, itemName }: Props) {
  const router = useRouter();
  const confirm = useConfirmStore((s) => s.confirm);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const first = await confirm({
      title: "Eliminar objeto",
      description: `Se eliminará "${itemName}" de forma permanente.`,
      confirmLabel: "Continuar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!first) return;

    const second = await confirm({
      title: "¿Estás absolutamente seguro?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!second) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo eliminar el objeto");
      }
      toast.success("Objeto eliminado");
      router.push(`/${slug}/items`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
      <h2 className="text-sm font-semibold text-[var(--accent-crimson)] uppercase tracking-wider mb-3">Zona de peligro</h2>
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--accent-crimson)]/30 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/15 transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Eliminar objeto
      </button>
    </div>
  );
}
