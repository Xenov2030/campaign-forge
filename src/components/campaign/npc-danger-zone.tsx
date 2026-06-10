"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Archive, ArchiveX } from "lucide-react";
import { toast } from "sonner";
import { useConfirmStore } from "@/store/confirm-store";

interface Props {
  slug: string;
  npcId: string;
  npcName: string;
  vaultNpcId: string | null;
}

export function NpcDangerZone({ slug, npcId, npcName, vaultNpcId }: Props) {
  const router = useRouter();
  const confirm = useConfirmStore((s) => s.confirm);
  const [busy, setBusy] = useState(false);
  const [vaultId, setVaultId] = useState<string | null>(vaultNpcId);
  const [vaultBusy, setVaultBusy] = useState(false);

  const toggleVault = async () => {
    if (vaultBusy) return;
    setVaultBusy(true);
    try {
      if (vaultId) {
        const res = await fetch(`/api/npc-vault/${vaultId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "No se pudo quitar del baúl");
        }
        setVaultId(null);
        toast.success("NPC quitado del baúl");
      } else {
        const res = await fetch("/api/npc-vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ npcId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo guardar en el baúl");
        setVaultId(data.vaultNpc.id);
        toast.success("NPC guardado en el baúl");
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setVaultBusy(false);
    }
  };

  const run = async () => {
    const first = await confirm({
      title: "Eliminar NPC",
      description: `Se eliminará "${npcName}" de forma permanente.${vaultId ? " (Su copia en el baúl se conservará.)" : ""}`,
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
      const res = await fetch(`/api/npcs/${npcId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo eliminar el NPC");
      }
      toast.success("NPC eliminado");
      router.push(`/${slug}/npcs`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
      <h2 className="text-sm font-semibold text-[var(--accent-crimson)] uppercase tracking-wider mb-3">Zona de peligro</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={toggleVault}
          disabled={vaultBusy}
          className={`inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium border transition-colors disabled:opacity-50 ${
            vaultId
              ? "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              : "border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/15"
          }`}
        >
          {vaultBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : vaultId ? <ArchiveX className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          {vaultId ? "Quitar del baúl" : "Guardar en el baúl"}
        </button>

        <button
          onClick={run}
          disabled={busy}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--accent-crimson)]/30 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/15 transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Eliminar NPC
        </button>
      </div>
    </div>
  );
}
