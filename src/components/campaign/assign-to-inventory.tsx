"use client";

import { useState } from "react";
import { Plus, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

interface Character { id: string; name: string }

interface Props {
  itemId: string;
  itemName: string;
  characters: Character[];
}

export function AssignToInventory({ itemId, itemName, characters }: Props) {
  const [characterId, setCharacterId] = useState(characters[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (characters.length === 0) return null;

  const assign = async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, itemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${itemName} asignado al inventario`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar el objeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserRound className="h-4 w-4 text-[var(--accent-gold)]" />
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">Asignar a personaje</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Personaje</label>
          <select
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            className="h-11 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors"
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:w-32">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Cantidad</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            onWheel={(e) => e.currentTarget.blur()}
            className="h-11 w-full rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors"
          />
        </div>
        <button
          onClick={assign}
          disabled={loading || !characterId}
          className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/25 disabled:opacity-50 transition-colors shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Asignar
        </button>
      </div>
    </div>
  );
}
