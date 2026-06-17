"use client";

import { useState } from "react";
import Image from "next/image";
import { Archive, Search, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface VaultEntry {
  id: string;
  name: string;
  nickname: string | null;
  race: string | null;
  occupation: string | null;
  portraitUrl: string | null;
  personality: string | null;
  tags: string[];
}

interface ConfirmState {
  id: string;
  name: string;
}

export function VaultManager({ initialVault }: { initialVault: VaultEntry[] }) {
  const [entries, setEntries] = useState<VaultEntry[]>(initialVault);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const filtered = search.trim()
    ? entries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/npc-vault/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("NPC eliminado del baúl");
    } catch {
      toast.error("No se pudo eliminar del baúl");
    } finally {
      setDeletingId(null);
      setConfirm(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
        </div>
        <span className="text-sm text-[var(--text-muted)] shrink-0">
          {entries.length} NPC{entries.length === 1 ? "" : "s"} guardado{entries.length === 1 ? "" : "s"}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 px-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-6">
            <Archive className="h-10 w-10 text-[var(--text-muted)] opacity-40" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
            Tu baúl está vacío
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            Guarda NPCs desde su ficha (zona de peligro → Guardar en baúl) para reutilizarlos en futuras campañas.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[var(--text-muted)]">Sin resultados para «{search}»</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all"
            >
              <div className="flex items-center gap-3 p-4">
                {entry.portraitUrl ? (
                  <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                    <Image src={entry.portraitUrl} alt={entry.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-[#34d399]/10 border-2 border-[#34d399]/20 flex items-center justify-center shrink-0 font-display text-xl font-bold text-[#34d399]/60">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-[var(--text-primary)] truncate">{entry.name}</p>
                  {entry.nickname && (
                    <p className="text-xs italic text-[var(--text-muted)] truncate">«{entry.nickname}»</p>
                  )}
                  {(entry.race || entry.occupation) && (
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {[entry.race, entry.occupation].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              {entry.tags.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1">
                  {entry.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setConfirm({ id: entry.id, name: entry.name })}
                  disabled={deletingId === entry.id}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-md)] text-xs font-medium text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-50 transition-colors"
                >
                  {deletingId === entry.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Eliminar del baúl
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setConfirm(null)}
        >
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] w-full max-w-sm p-6 shadow-[var(--shadow-xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)]">Eliminar del baúl</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  ¿Querés eliminar a <span className="text-[var(--text-primary)] font-medium">{confirm.name}</span> del baúl? Esta acción no se puede deshacer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="flex-1 h-9 rounded-[var(--radius-md)] text-sm border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirm.id)}
                disabled={deletingId === confirm.id}
                className="flex-1 h-9 rounded-[var(--radius-md)] text-sm font-medium bg-red-600/80 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === confirm.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
