"use client";

import { useState } from "react";
import { Archive, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function NpcVaultButton({ npcId }: { npcId: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (saved) return;
    setLoading(true);
    try {
      const res = await fetch("/api/npc-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npcId }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Error");
      }
      setSaved(true);
      toast.success("NPC guardado en el baúl");
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
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] border text-sm font-medium transition-colors disabled:opacity-70"
      style={saved ? {
        borderColor: "rgba(201,168,76,0.4)",
        color: "var(--accent-gold)",
        backgroundColor: "rgba(201,168,76,0.1)",
      } : {
        borderColor: "var(--border-default)",
        color: "var(--text-secondary)",
      }}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
      {saved ? "Guardado en baúl" : "Guardar en baúl"}
    </button>
  );
}
