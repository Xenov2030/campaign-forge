"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirmStore } from "@/store/confirm-store";

interface Props {
  slug: string;
  characterId: string;
  campaignId: string;
  targetUserId: string;
  /** "kick": el master expulsa al jugador (borra membresía + personaje). "deleteCharacter": borra solo el personaje. */
  mode: "kick" | "deleteCharacter";
  characterName: string;
}

export function CharacterDangerZone({ slug, characterId, campaignId, targetUserId, mode, characterName }: Props) {
  const router = useRouter();
  const confirm = useConfirmStore((s) => s.confirm);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    // Doble confirmación
    const first = await confirm({
      title: mode === "kick" ? "Expulsar jugador de la partida" : "Eliminar personaje",
      description:
        mode === "kick"
          ? `Se quitará a este jugador de la campaña y se borrará su personaje "${characterName}" con todo lo asociado (objetos, hechizos, relaciones).`
          : `Se eliminará "${characterName}" y todo lo asociado (objetos, hechizos, relaciones).`,
      confirmLabel: "Continuar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!first) return;

    const second = await confirm({
      title: "¿Estás absolutamente seguro?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: mode === "kick" ? "Sí, expulsar" : "Sí, eliminar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!second) return;

    setBusy(true);
    try {
      const url =
        mode === "kick"
          ? `/api/campaigns/${campaignId}/members/${targetUserId}`
          : `/api/characters/${characterId}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo completar la acción");
      }
      toast.success(mode === "kick" ? "Jugador expulsado de la campaña" : "Personaje eliminado");
      router.push(`/${slug}/characters`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
      <h2 className="text-sm font-semibold text-[var(--accent-crimson)] uppercase tracking-wider mb-3">
        Zona de peligro
      </h2>
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--accent-crimson)]/30 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/15 transition-colors disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : mode === "kick" ? (
          <UserMinus className="h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {mode === "kick" ? "Expulsar jugador de la partida" : "Eliminar personaje"}
      </button>
    </div>
  );
}
