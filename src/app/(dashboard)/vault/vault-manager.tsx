"use client";

import { useState } from "react";
import Image from "next/image";
import { Archive, Search, Trash2, Loader2, X, Skull, Package, Users } from "lucide-react";
import { toast } from "sonner";
import { MONSTER_TAGS } from "@/components/campaign/monster-form";

// ----- Types -----
interface VaultNpcEntry {
  id: string;
  name: string;
  nickname: string | null;
  race: string | null;
  occupation: string | null;
  portraitUrl: string | null;
  tags: string[];
}

interface VaultMonsterEntry {
  id: string;
  name: string;
  type: string | null;
  size: string | null;
  challengeRating: string | null;
  armorClass: number | null;
  hitPoints: string | null;
  imageUrl: string | null;
  tags: string[];
}

interface VaultItemEntry {
  id: string;
  name: string;
  type: string | null;
  rarity: string;
  imageUrl: string | null;
  tags: string[];
}

interface Props {
  initialNpcs: VaultNpcEntry[];
  initialMonsters: VaultMonsterEntry[];
  initialItems: VaultItemEntry[];
}

interface ConfirmState { id: string; name: string; endpoint: string }

type Tab = "npcs" | "monsters" | "items";

// ----- Helpers -----
const DISPOSITION_ORDER = ["legendario", "jefe", "hostil", "neutral", "amigable"];
function getMonsterColor(tags: string[]): string {
  for (const d of DISPOSITION_ORDER) {
    if (tags.includes(d)) return MONSTER_TAGS.find((t) => t.value === d)?.color ?? "#94a3b8";
  }
  for (const tag of tags) {
    const found = MONSTER_TAGS.find((t) => t.value === tag);
    if (found) return found.color;
  }
  return "#94a3b8";
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#94a3b8",
  UNCOMMON: "#34d399",
  RARE: "#60a5fa",
  VERY_RARE: "#a855f7",
  LEGENDARY: "#c9a84c",
  ARTIFACT: "#f87171",
};

// ----- Main component -----
export function VaultManager({ initialNpcs, initialMonsters, initialItems }: Props) {
  const [tab, setTab] = useState<Tab>("npcs");
  const [search, setSearch] = useState("");
  const [npcs, setNpcs] = useState(initialNpcs);
  const [monsters, setMonsters] = useState(initialMonsters);
  const [items, setItems] = useState(initialItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "npcs", label: "NPCs", icon: <Users className="h-4 w-4" />, count: npcs.length },
    { key: "monsters", label: "Criaturas", icon: <Skull className="h-4 w-4" />, count: monsters.length },
    { key: "items", label: "Objetos", icon: <Package className="h-4 w-4" />, count: items.length },
  ];

  const handleDelete = async (id: string, endpoint: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (endpoint.includes("npc")) setNpcs((p) => p.filter((e) => e.id !== id));
      else if (endpoint.includes("monster")) setMonsters((p) => p.filter((e) => e.id !== id));
      else setItems((p) => p.filter((e) => e.id !== id));
      toast.success("Eliminado del baúl");
    } catch {
      toast.error("No se pudo eliminar del baúl");
    } finally {
      setDeletingId(null);
      setConfirm(null);
    }
  };

  const q = search.toLowerCase();

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-elevated)] rounded-[var(--radius-xl)] p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setSearch(""); }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium transition-all"
            style={tab === t.key ? {
              backgroundColor: "var(--bg-surface)",
              color: "var(--accent-gold)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            } : { color: "var(--text-muted)" }}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-[10px] font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search — solo si hay 10+ entradas en la pestaña activa */}
      {((tab === "npcs" && npcs.length >= 10) || (tab === "monsters" && monsters.length >= 10) || (tab === "items" && items.length >= 10)) && (
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
        </div>
      )}

      {/* Content */}
      {tab === "npcs" && (
        <NpcGrid
          entries={npcs.filter((e) => e.name.toLowerCase().includes(q))}
          total={npcs.length}
          onDelete={(id, name) => setConfirm({ id, name, endpoint: "/api/npc-vault" })}
          deletingId={deletingId}
        />
      )}
      {tab === "monsters" && (
        <MonsterGrid
          entries={monsters.filter((e) => e.name.toLowerCase().includes(q))}
          total={monsters.length}
          onDelete={(id, name) => setConfirm({ id, name, endpoint: "/api/monster-vault" })}
          deletingId={deletingId}
        />
      )}
      {tab === "items" && (
        <ItemGrid
          entries={items.filter((e) => e.name.toLowerCase().includes(q))}
          total={items.length}
          onDelete={(id, name) => setConfirm({ id, name, endpoint: "/api/item-vault" })}
          deletingId={deletingId}
        />
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] w-full max-w-sm p-6 shadow-[var(--shadow-xl)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)]">Eliminar del baúl</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  ¿Querés eliminar <span className="text-[var(--text-primary)] font-medium">{confirm.name}</span> del baúl? Esta acción no se puede deshacer.
                </p>
              </div>
              <button type="button" onClick={() => setConfirm(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirm(null)} className="flex-1 h-9 rounded-[var(--radius-md)] text-sm border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirm.id, confirm.endpoint)}
                disabled={deletingId === confirm.id}
                className="flex-1 h-9 rounded-[var(--radius-md)] text-sm font-medium bg-red-600/80 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === confirm.id ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----- Sub-grids -----
function DeleteBtn({ id, name, onDelete, deletingId }: { id: string; name: string; onDelete: (id: string, name: string) => void; deletingId: string | null }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(id, name)}
      disabled={deletingId === id}
      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-md)] text-xs font-medium text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-50 transition-colors"
    >
      {deletingId === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Eliminar del baúl
    </button>
  );
}

function EmptyVault({ message }: { message: string }) {
  return (
    <div className="text-center py-24 px-6">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-6">
        <Archive className="h-10 w-10 text-[var(--text-muted)] opacity-40" />
      </div>
      <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Sección vacía</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">{message}</p>
    </div>
  );
}

function NpcGrid({ entries, total, onDelete, deletingId }: { entries: VaultNpcEntry[]; total: number; onDelete: (id: string, name: string) => void; deletingId: string | null }) {
  if (total === 0) return <EmptyVault message="Guardá NPCs desde su ficha para reutilizarlos en futuras campañas." />;
  if (entries.length === 0) return <div className="text-center py-16"><p className="text-sm text-[var(--text-muted)]">Sin resultados.</p></div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((e) => (
        <div key={e.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all">
          <div className="flex items-center gap-3 p-4">
            {e.portraitUrl ? (
              <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                <Image src={e.portraitUrl} alt={e.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#34d399]/10 border-2 border-[#34d399]/20 flex items-center justify-center shrink-0 font-display text-xl font-bold text-[#34d399]/60">
                {e.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-[var(--text-primary)] truncate">{e.name}</p>
              {e.nickname && <p className="text-xs italic text-[var(--text-muted)] truncate">«{e.nickname}»</p>}
              {(e.race || e.occupation) && (
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{[e.race, e.occupation].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
          {e.tags.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1">
              {e.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">{tag}</span>
              ))}
            </div>
          )}
          <div className="px-4 pb-4">
            <DeleteBtn id={e.id} name={e.name} onDelete={onDelete} deletingId={deletingId} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonsterGrid({ entries, total, onDelete, deletingId }: { entries: VaultMonsterEntry[]; total: number; onDelete: (id: string, name: string) => void; deletingId: string | null }) {
  if (total === 0) return <EmptyVault message="Guardá criaturas desde su ficha para reutilizarlas en futuras campañas." />;
  if (entries.length === 0) return <div className="text-center py-16"><p className="text-sm text-[var(--text-muted)]">Sin resultados.</p></div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((e) => {
        const accent = getMonsterColor(e.tags);
        return (
          <div key={e.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all">
            <div className="h-1 w-full" style={{ backgroundColor: accent }} />
            <div className="flex items-center gap-3 p-4">
              {e.imageUrl ? (
                <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                  <Image src={e.imageUrl} alt={e.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <Skull className="h-6 w-6" style={{ color: `${accent}90` }} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-[var(--text-primary)] truncate">{e.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{[e.size, e.type].filter(Boolean).join(" ")}</p>
                {e.challengeRating && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block" style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}15` }}>
                    CR {e.challengeRating}
                  </span>
                )}
              </div>
            </div>
            <div className="px-4 pb-4">
              <DeleteBtn id={e.id} name={e.name} onDelete={onDelete} deletingId={deletingId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemGrid({ entries, total, onDelete, deletingId }: { entries: VaultItemEntry[]; total: number; onDelete: (id: string, name: string) => void; deletingId: string | null }) {
  if (total === 0) return <EmptyVault message="Próximamente podrás guardar objetos y artefactos mágicos en el baúl." />;
  if (entries.length === 0) return <div className="text-center py-16"><p className="text-sm text-[var(--text-muted)]">Sin resultados.</p></div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((e) => {
        const rarityColor = RARITY_COLORS[e.rarity] ?? "#94a3b8";
        return (
          <div key={e.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all">
            <div className="h-1 w-full" style={{ backgroundColor: rarityColor }} />
            <div className="flex items-center gap-3 p-4">
              {e.imageUrl ? (
                <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                  <Image src={e.imageUrl} alt={e.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                  <Package className="h-6 w-6" style={{ color: `${rarityColor}80` }} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-[var(--text-primary)] truncate">{e.name}</p>
                {e.type && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{e.type}</p>}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block" style={{ color: rarityColor, borderColor: `${rarityColor}40`, backgroundColor: `${rarityColor}15` }}>
                  {e.rarity.charAt(0) + e.rarity.slice(1).toLowerCase().replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <DeleteBtn id={e.id} name={e.name} onDelete={onDelete} deletingId={deletingId} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
