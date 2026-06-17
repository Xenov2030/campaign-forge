"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Archive, X, Check, Loader2, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZE = 12;

export function VaultPicker({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const removeEntry = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/npc-vault/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEntries((prev) => prev.filter((x) => x.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Quitado del baúl");
    } catch {
      toast.error("No se pudo quitar del baúl");
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    setSelected(new Set());
    setPage(0);
    try {
      const res = await fetch("/api/npc-vault");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEntries(data.vault ?? []);
    } catch {
      toast.error("No se pudo cargar el baúl");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const importSelected = async () => {
    if (selected.size === 0 || importing) return;
    setImporting(true);
    try {
      const res = await fetch("/api/npcs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, vaultNpcIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.count} NPC${data.count === 1 ? "" : "s"} traído${data.count === 1 ? "" : "s"} a la campaña`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudieron importar");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
      >
        <Archive className="h-3.5 w-3.5" />
        Usar NPC guardado
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4" onClick={() => !importing && setOpen(false)}>
          <div
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[var(--shadow-xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-[var(--accent-gold)]" />
                <h3 className="font-display font-bold text-[var(--text-primary)]">Baúl de NPCs</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-16">
                  <Archive className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[var(--text-secondary)]">Tu baúl está vacío.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Guardá NPCs desde su ficha (zona de peligro) para reutilizarlos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((e) => {
                    const isSel = selected.has(e.id);
                    return (
                      <div
                        key={e.id}
                        className={`relative rounded-[var(--radius-lg)] overflow-hidden border-2 transition-colors bg-[var(--bg-elevated)] ${
                          isSel ? "border-[var(--accent-gold)]" : "border-transparent hover:border-[var(--border-default)]"
                        }`}
                      >
                        <button type="button" onClick={() => toggle(e.id)} className="w-full flex items-center gap-3 p-3 pr-9 text-left">
                          {e.portraitUrl ? (
                            <Image src={e.portraitUrl} alt={e.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover border-2 border-[#34d399]/30 shrink-0" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-[#34d399]/10 border-2 border-[#34d399]/20 flex items-center justify-center shrink-0 font-display text-base font-bold text-[#34d399]/60">
                              {e.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-[var(--text-primary)] truncate">{e.name}</p>
                            {e.nickname && <p className="text-xs italic text-[var(--text-muted)] truncate">«{e.nickname}»</p>}
                            {(e.race || e.occupation) && (
                              <p className="text-xs text-[var(--text-muted)] truncate">{[e.race, e.occupation].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                        </button>

                        {isSel && (
                          <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[var(--accent-gold)] text-black flex items-center justify-center pointer-events-none">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(ev) => removeEntry(ev, e.id)}
                          disabled={deletingId === e.id}
                          aria-label="Quitar del baúl"
                          title="Quitar del baúl"
                          className="absolute bottom-2 right-2 h-7 w-7 rounded-full flex items-center justify-center bg-black/40 text-[var(--text-muted)] hover:text-red-400 hover:bg-black/60 transition-colors disabled:opacity-50"
                        >
                          {deletingId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 p-4 border-t border-[var(--border-subtle)]">
              {entries.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-[var(--text-muted)]">
                    {page + 1} / {Math.ceil(entries.length / PAGE_SIZE)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(Math.ceil(entries.length / PAGE_SIZE) - 1, p + 1))}
                    disabled={page >= Math.ceil(entries.length / PAGE_SIZE) - 1}
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-muted)]">{selected.size} seleccionado{selected.size === 1 ? "" : "s"}</span>
                <button
                  type="button"
                  onClick={importSelected}
                  disabled={selected.size === 0 || importing}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--accent-gold)] text-[var(--bg-base)] hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Traer a la campaña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
