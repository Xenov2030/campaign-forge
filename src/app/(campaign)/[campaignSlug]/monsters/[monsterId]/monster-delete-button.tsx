"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MonsterDeleteButton({ monsterId, campaignSlug }: { monsterId: string; campaignSlug: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/monsters/${monsterId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Error");
      }
      toast.success("Monstruo eliminado");
      router.push(`/${campaignSlug}/monsters`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
      setLoading(false);
    }
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-red-700/50 rounded-[var(--radius-md)] px-2 py-1">
        <span className="text-xs text-[var(--text-muted)]">¿Eliminar?</span>
        <button onClick={handleDelete} disabled={loading} className="text-xs text-red-400 hover:text-red-300 font-medium ml-1 disabled:opacity-50">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sí"}
        </button>
        <span className="text-[var(--border-default)] mx-0.5">/</span>
        <button onClick={() => setConfirm(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">No</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] border border-red-800/40 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" /> Eliminar
    </button>
  );
}
