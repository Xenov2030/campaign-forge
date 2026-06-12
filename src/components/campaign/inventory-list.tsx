"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Trash2, Swords } from "lucide-react";
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

  const remove = async (id: string) => {
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Error al eliminar el objeto");
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-4">El inventario está vacío.</p>
    );
  }

  return (
    <div className="divide-y divide-[var(--border-subtle)]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2.5">
          <div className="h-8 w-8 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
            {item.isEquipped
              ? <Swords className="h-4 w-4 text-[var(--accent-gold)]" />
              : <Package className="h-4 w-4 text-[var(--text-muted)]" />}
          </div>
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
            {item.quantity > 1 && (
              <span className="ml-2 text-xs text-[var(--text-muted)]">×{item.quantity}</span>
            )}
          </div>
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
