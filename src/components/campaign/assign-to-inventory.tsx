"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Character { id: string; name: string }

interface Props {
  itemId: string;
  itemName: string;
  characters: Character[];
}

const selectClass =
  "flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 px-3 rounded-[var(--radius-md)] text-sm hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors";

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
    <div className="mt-8 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
      <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-4">Asignar a personaje</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-40">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Personaje</label>
          <select className={selectClass} value={characterId} onChange={(e) => setCharacterId(e.target.value)}>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 w-24">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Cantidad</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className={selectClass}
          />
        </div>
        <button
          onClick={assign}
          disabled={loading || !characterId}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/25 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Asignar
        </button>
      </div>
    </div>
  );
}
