import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { BookOpen, Plus, Tag, Lock, Globe } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

const CATEGORIES = [
  { id: "GENERAL",    label: "General",    emoji: "📜" },
  { id: "HISTORY",    label: "Historia",   emoji: "⏳" },
  { id: "RELIGION",   label: "Religión",   emoji: "⛪" },
  { id: "MAGIC",      label: "Magia",      emoji: "✨" },
  { id: "POLITICS",   label: "Política",   emoji: "⚖️" },
  { id: "GEOGRAPHY",  label: "Geografía",  emoji: "🗺️" },
  { id: "CULTURE",    label: "Cultura",    emoji: "🎭" },
  { id: "BESTIARY",   label: "Bestiario",  emoji: "🐉" },
  { id: "TECHNOLOGY", label: "Tecnología", emoji: "⚙️" },
];

export default async function LorePage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  const entries = await prisma.loreEntry.findMany({
    where: {
      campaignId: campaign.id,
      ...(isMaster ? {} : { isPublic: true }),
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  // Group by category
  type LoreEntryType = (typeof entries)[0];
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    entries: entries.filter((e: LoreEntryType) => e.category === cat.id),
  })).filter((cat) => cat.entries.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-[var(--accent-gold)]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Lore & Wiki</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{entries.length} entradas en la wiki</p>
        </div>
        {isMaster && (
          <Link
            href={`/${campaignSlug}/lore/new`}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva entrada
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 mb-6">
            <BookOpen className="h-10 w-10 text-[var(--accent-gold)]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Wiki vacía</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            {isMaster
              ? "Documenta la historia, religiones, magia y geografía de tu mundo."
              : "El máster aún no ha publicado entradas en la wiki."}
          </p>
          {isMaster && (
            <Link
              href={`/${campaignSlug}/lore/new`}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
            >
              <Plus className="h-4 w-4" />
              Primera entrada
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Categories filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const count = entries.filter((e: (typeof entries)[number]) => e.category === cat.id).length;
              if (count === 0) return null;
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">({count})</span>
                </a>
              );
            })}
          </div>

          {/* Entries by category */}
          {grouped.map((cat) => (
            <div key={cat.id} id={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">{cat.label}</h2>
                <span className="text-xs text-[var(--text-muted)]">({cat.entries.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.entries.map((entry: LoreEntryType) => (
                  <Link
                    key={entry.id}
                    href={`/${campaignSlug}/lore/${entry.id}`}
                    className="group flex flex-col p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] hover:border-[var(--accent-gold)]/30 hover:bg-[var(--bg-elevated)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {entry.isPublic ? (
                          <Globe className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">
                      {entry.content.slice(0, 150)}...
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatRelativeTime(entry.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
