"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Trash2, Swords, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface InventoryEntry {
  id: string;
  itemId: string | null;
  name: string;
  quantity: number;
  isEquipped: boolean;
}

interface Props {
  campaignSlug: string;
  canManage: boolean;
  items: InventoryEntry[];
}

export function InventoryList({ campaignSlug, canManage, items: initial }: Props) {
  const [items, setItems] = useState(initial);

  const patch = async (id: string, data: { isEquipped?: boolean; quantity?: number }) => {
    const prev = items;
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...data } : i)));
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Error al actualizar el objeto");
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Error al eliminar el objeto");
    }
  };

  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] text-center py-4">El inventario está vacío.</p>;
  }

  return (
    <div className="divide-y divide-[var(--border-subtle)]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2.5">
          {/* Equip toggle */}
          {canManage ? (
            <button
              onClick={() => patch(item.id, { isEquipped: !item.isEquipped })}
              aria-label={item.isEquipped ? "Desequipar objeto" : "Equipar objeto"}
              title={item.isEquipped ? "Equipado — click para desequipar" : "Click para equipar"}
              className={`h-8 w-8 rounded-[var(--radius-md)] border flex items-center justify-center shrink-0 transition-colors ${
                item.isEquipped
                  ? "bg-[var(--accent-gold)]/15 border-[var(--accent-gold)]/40 text-[var(--accent-gold)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {item.isEquipped ? <Swords className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            </button>
          ) : (
            <div className={`h-8 w-8 rounded-[var(--radius-md)] border flex items-center justify-center shrink-0 ${
              item.isEquipped
                ? "bg-[var(--accent-gold)]/15 border-[var(--accent-gold)]/40 text-[var(--accent-gold)]"
                : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]"
            }`}>
              {item.isEquipped ? <Swords className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            </div>
          )}

          {/* Name + equipado label */}
          <div className="flex-1 min-w-0">
            {item.itemId ? (
              <Link
                href={`/${campaignSlug}/items/${item.itemId}`}
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
            )}
            {item.isEquipped && (
              <span className="ml-2 text-[10px] font-semibold text-[var(--accent-gold)] uppercase tracking-wider">Equipado</span>
            )}
          </div>

          {/* Quantity stepper */}
          {canManage ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => patch(item.id, { quantity: item.quantity - 1 })}
                disabled={item.quantity <= 1}
                aria-label="Reducir cantidad"
                className="h-6 w-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-medium text-[var(--text-secondary)] w-5 text-center tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() => patch(item.id, { quantity: item.quantity + 1 })}
                aria-label="Aumentar cantidad"
                className="h-6 w-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            item.quantity > 1 && (
              <span className="text-xs text-[var(--text-muted)] shrink-0">×{item.quantity}</span>
            )
          )}

          {/* Remove */}
          {canManage && (
            <button
              onClick={() => remove(item.id)}
              aria-label="Quitar del inventario"
              className="h-8 w-8 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--accent-crimson)] transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
