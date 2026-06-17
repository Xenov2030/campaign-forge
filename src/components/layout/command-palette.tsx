"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Loader2, User, Users, Package, Target, BookOpen, X } from "lucide-react";

interface SearchResult {
  characters: { id: string; name: string; portraitUrl: string | null; class: string | null; level: number }[];
  npcs: { id: string; name: string; portraitUrl: string | null; race: string | null }[];
  items: { id: string; name: string; imageUrl: string | null; rarity: string }[];
  quests: { id: string; name: string; type: string; status: string }[];
  lore: { id: string; title: string; category: string }[];
}

interface CommandPaletteProps {
  campaignSlug: string;
  isMaster: boolean;
  campaignId: string;
}

export function CommandPalette({ campaignSlug, campaignId }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&campaignId=${campaignId}`
          );
          if (res.ok) setResults(await res.json());
        } catch {
          // silently fail
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [campaignId]
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  if (!open) return null;

  const hasResults =
    results &&
    (results.characters.length > 0 ||
      results.npcs.length > 0 ||
      results.items.length > 0 ||
      results.quests.length > 0 ||
      results.lore.length > 0);

  const RARITY_LABEL: Record<string, string> = {
    COMMON: "Común",
    UNCOMMON: "Infrecuente",
    RARE: "Raro",
    VERY_RARE: "Muy raro",
    LEGENDARY: "Legendario",
    ARTIFACT: "Artefacto",
  };
  const STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Activa",
    COMPLETED: "Completada",
    FAILED: "Fallida",
    INACTIVE: "Inactiva",
  };
  const LORE_LABEL: Record<string, string> = {
    GENERAL: "General",
    HISTORY: "Historia",
    GEOGRAPHY: "Geografía",
    FACTION: "Facción",
    RELIGION: "Religión",
    MAGIC: "Magia",
    BESTIARY: "Bestiario",
    OTHER: "Otro",
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} loop>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 text-[var(--accent-gold)] animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            )}
            <Command.Input
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                search(v);
              }}
              placeholder="Buscar en la campaña..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[var(--border-subtle)] px-1.5 text-[10px] text-[var(--text-muted)]">
                Esc
              </kbd>
              <button
                onClick={close}
                className="h-7 w-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            {query.length < 2 && (
              <div className="py-10 text-center text-sm text-[var(--text-muted)]">
                Escribe para buscar en la campaña...
                <p className="text-xs mt-1 text-[var(--text-muted)]/60">
                  Personajes · NPCs · Objetos · Misiones · Lore
                </p>
              </div>
            )}

            {query.length >= 2 && !loading && !hasResults && (
              <div className="py-10 text-center text-sm text-[var(--text-muted)]">
                No se encontró nada para{" "}
                <span className="text-[var(--text-primary)]">&ldquo;{query}&rdquo;</span>
              </div>
            )}

            {results && results.characters.length > 0 && (
              <Command.Group
                heading="Personajes"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
              >
                {results.characters.map((c) => (
                  <Command.Item
                    key={c.id}
                    value={`character-${c.id}`}
                    onSelect={() => handleSelect(`/${campaignSlug}/characters/${c.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] data-[selected=true]:bg-[var(--bg-elevated)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                  >
                    <User className="h-4 w-4 shrink-0 text-[#60a5fa]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      {(c.class || c.level > 0) && (
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {[c.class, c.level > 0 ? `Nv. ${c.level}` : null].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.npcs.length > 0 && (
              <Command.Group
                heading="NPCs"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
              >
                {results.npcs.map((n) => (
                  <Command.Item
                    key={n.id}
                    value={`npc-${n.id}`}
                    onSelect={() => handleSelect(`/${campaignSlug}/npcs/${n.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] data-[selected=true]:bg-[var(--bg-elevated)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                  >
                    <Users className="h-4 w-4 shrink-0 text-[#34d399]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{n.name}</p>
                      {n.race && (
                        <p className="text-xs text-[var(--text-muted)] truncate">{n.race}</p>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.items.length > 0 && (
              <Command.Group
                heading="Objetos"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
              >
                {results.items.map((i) => (
                  <Command.Item
                    key={i.id}
                    value={`item-${i.id}`}
                    onSelect={() => handleSelect(`/${campaignSlug}/items/${i.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] data-[selected=true]:bg-[var(--bg-elevated)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                  >
                    <Package className="h-4 w-4 shrink-0 text-[#f59e0b]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {RARITY_LABEL[i.rarity] ?? i.rarity}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.quests.length > 0 && (
              <Command.Group
                heading="Misiones"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
              >
                {results.quests.map((q) => (
                  <Command.Item
                    key={q.id}
                    value={`quest-${q.id}`}
                    onSelect={() => handleSelect(`/${campaignSlug}/quests/${q.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] data-[selected=true]:bg-[var(--bg-elevated)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                  >
                    <Target className="h-4 w-4 shrink-0 text-[#a855f7]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{q.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {STATUS_LABEL[q.status] ?? q.status}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results && results.lore.length > 0 && (
              <Command.Group
                heading="Lore"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-muted)]"
              >
                {results.lore.map((l) => (
                  <Command.Item
                    key={l.id}
                    value={`lore-${l.id}`}
                    onSelect={() => handleSelect(`/${campaignSlug}/lore/${l.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] data-[selected=true]:bg-[var(--bg-elevated)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-[#c9a84c]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{l.title}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {LORE_LABEL[l.category] ?? l.category}
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
