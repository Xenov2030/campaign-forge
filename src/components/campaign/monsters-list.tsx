"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Skull, Trash2, Shield, Heart } from "lucide-react";
import { toast } from "sonner";

interface MonsterCard {
  id: string;
  name: string;
  type: string | null;
  size: string | null;
  alignment: string | null;
  challengeRating: string | null;
  hitPoints: string | null;
  armorClass: number | null;
  tags: string[];
  imageUrl: string | null;
}

interface Props {
  monsters: MonsterCard[];
  campaignSlug: string;
  isMaster: boolean;
  campaignId: string;
}

export function MonstersList({ monsters, campaignSlug, isMaster }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [list, setList] = useState(monsters);

  const filtered = list.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/monsters/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Error");
      }
      setList((prev) => prev.filter((m) => m.id !== id));
      toast.success("Monstruo eliminado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Skull className="h-5 w-5 text-[var(--accent-gold)]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Bestiario</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{list.length} monstruo{list.length !== 1 ? "s" : ""}</p>
        </div>
        {isMaster && (
          <Link
            href={`/${campaignSlug}/monsters/new`}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo monstruo
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar monstruo..."
          className="w-full pl-9 pr-4 h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Empty states */}
      {list.length === 0 && (
        <div className="text-center py-20">
          <Skull className="h-12 w-12 text-[var(--text-muted)]/40 mx-auto mb-4" />
          <p className="text-[var(--text-muted)] mb-2">Sin monstruos todavía.</p>
          {isMaster && (
            <Link href={`/${campaignSlug}/monsters/new`} className="text-sm text-[var(--accent-gold)] hover:underline">
              Crear el primero
            </Link>
          )}
        </div>
      )}

      {list.length > 0 && filtered.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-12">Sin resultados para &quot;{query}&quot;</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="group relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all">
            <Link href={`/${campaignSlug}/monsters/${m.id}`} className="block p-4">
              <div className="flex items-start gap-3">
                {m.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt={m.name} className="h-12 w-12 rounded-full object-cover border border-[var(--border-subtle)] shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-red-900/20 border border-red-800/30 flex items-center justify-center shrink-0">
                    <Skull className="h-6 w-6 text-red-400/60" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                    {m.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {[m.size, m.type].filter(Boolean).join(" ")}
                    {m.alignment ? `, ${m.alignment}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--text-muted)]">
                {m.challengeRating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-semibold">
                    CR {m.challengeRating}
                  </span>
                )}
                {m.armorClass != null && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {m.armorClass}
                  </span>
                )}
                {m.hitPoints && (
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" /> {m.hitPoints}
                  </span>
                )}
              </div>

              {m.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {t}
                    </span>
                  ))}
                  {m.tags.length > 3 && (
                    <span className="text-[10px] text-[var(--text-muted)]">+{m.tags.length - 3}</span>
                  )}
                </div>
              )}
            </Link>

            {isMaster && (
              <div className="absolute top-2 right-2">
                {confirmId === m.id ? (
                  <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-red-700/50 rounded-[var(--radius-md)] px-2 py-1 shadow-lg">
                    <span className="text-xs text-[var(--text-muted)] mr-1">¿Eliminar?</span>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                    >
                      Sí
                    </button>
                    <span className="text-[var(--border-default)]">/</span>
                    <button onClick={() => setConfirmId(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirmId(m.id); }}
                    className="h-7 w-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
