"use client";

import { useState } from "react";
import { Archive, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function MonsterVaultButton({ monsterId }: { monsterId: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (saved) return;
    setLoading(true);
    try {
      const res = await fetch("/api/monster-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monsterId }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Error");
      }
      setSaved(true);
      toast.success("Criatura guardada en el baúl");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading || saved}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] border text-xs font-medium transition-colors disabled:opacity-70"
      style={saved ? {
        borderColor: "rgba(52,211,153,0.4)",
        color: "#34d399",
        backgroundColor: "rgba(52,211,153,0.1)",
      } : {
        borderColor: "var(--border-default)",
        color: "var(--text-secondary)",
      }}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : saved ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Archive className="h-3.5 w-3.5" />
      )}
      {saved ? "Guardado en baúl" : "Guardar en baúl"}
    </button>
  );
}
