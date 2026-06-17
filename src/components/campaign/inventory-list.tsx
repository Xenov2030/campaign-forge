"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Trash2, Swords, Minus, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

type Filter = "all" | "equipped";

interface RowProps {
  item: InventoryEntry;
  canManage: boolean;
  patch: (id: string, data: { isEquipped?: boolean; quantity?: number }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  campaignSlug: string;
}

function InventoryItemRow({ item, canManage, patch, remove, campaignSlug }: RowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
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
  );
}

function SortableItem({ item, canManage, patch, remove, campaignSlug }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center">
      {canManage && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] touch-none"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="flex-1">
        <InventoryItemRow
          item={item}
          canManage={canManage}
          patch={patch}
          remove={remove}
          campaignSlug={campaignSlug}
        />
      </div>
    </div>
  );
}

export function InventoryList({ campaignSlug, canManage, items: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      fetch("/api/inventory/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((i) => i.id) }),
      }).catch(() => {});
      return next;
    });
  };

  const equippedCount = items.filter((i) => i.isEquipped).length;
  const filtered = filter === "equipped" ? items.filter((i) => i.isEquipped) : items;

  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-muted)] text-center py-4">El inventario está vacío.</p>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-3">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            filter === "all"
              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          onClick={() => setFilter("equipped")}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            filter === "equipped"
              ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Equipados ({equippedCount})
        </button>
      </div>

      {/* List */}
      {canManage && filter === "all" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-[var(--border-subtle)] pl-5">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  canManage={canManage}
                  patch={patch}
                  remove={remove}
                  campaignSlug={campaignSlug}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              Ningún objeto equipado.
            </p>
          ) : (
            filtered.map((item) => (
              <InventoryItemRow
                key={item.id}
                item={item}
                canManage={canManage}
                patch={patch}
                remove={remove}
                campaignSlug={campaignSlug}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
