"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, X, Check, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface VaultEntry {
  id: string;
  name: string;
  race: string | null;
  occupation: string | null;
  portraitUrl: string | null;
  personality: string | null;
  tags: string[];
}

export function VaultPicker({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    setSelected(new Set());
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
                  {entries.map((e) => {
                    const isSel = selected.has(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggle(e.id)}
                        className={`relative flex flex-col text-left bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] overflow-hidden border-2 transition-colors ${
                          isSel ? "border-[var(--accent-gold)]" : "border-transparent hover:border-[var(--border-default)]"
                        }`}
                      >
                        {isSel && (
                          <span className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-[var(--accent-gold)] text-black flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                        <div className="flex items-center gap-3 p-3">
                          {e.portraitUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.portraitUrl} alt={e.name} className="h-12 w-12 rounded-full object-cover border-2 border-[#34d399]/30 shrink-0" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-[#34d399]/10 border-2 border-[#34d399]/20 flex items-center justify-center shrink-0 font-display text-base font-bold text-[#34d399]/60">
                              {e.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-[var(--text-primary)] truncate">{e.name}</p>
                            {(e.race || e.occupation) && (
                              <p className="text-xs text-[var(--text-muted)] truncate">{[e.race, e.occupation].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-4 border-t border-[var(--border-subtle)]">
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
      )}
    </>
  );
}
