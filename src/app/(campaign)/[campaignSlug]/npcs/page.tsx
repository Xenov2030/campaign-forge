import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Plus, Users, Eye, EyeOff, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `NPCs — ${campaign?.name}` };
}

export default async function NPCsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true, theme: true, system: true },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  const npcs = await prisma.nPC.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
  });

  type NpcType = (typeof npcs)[0];
  const knownNPCs = npcs.filter((n: NpcType) => n.isKnownToParty);
  const unknownNPCs = npcs.filter((n: NpcType) => !n.isKnownToParty);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-[#34d399]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">NPCs</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {npcs.length} personajes no jugadores
          </p>
        </div>
        {isMaster && (
          <div className="flex gap-2">
            <Link
              href={`/${campaignSlug}/ai-forge`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm border border-[var(--accent-arcane)]/30 bg-[var(--accent-arcane)]/10 text-[var(--accent-arcane)] hover:bg-[var(--accent-arcane)]/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generar con IA
            </Link>
            <Link
              href={`/${campaignSlug}/npcs/new`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo NPC
            </Link>
          </div>
        )}
      </div>

      {npcs.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/20 mb-6">
            <Users className="h-10 w-10 text-[#34d399]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            Sin NPCs todavía
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            Crea los personajes que poblarán tu mundo. Usa la IA para generarlos automáticamente.
          </p>
          {isMaster && (
            <div className="flex gap-3 justify-center">
              <Link
                href={`/${campaignSlug}/ai-forge`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] text-sm bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 text-[var(--accent-arcane)]"
              >
                <Sparkles className="h-4 w-4" />
                Generar con IA
              </Link>
              <Link
                href={`/${campaignSlug}/npcs/new`}
                className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
              >
                <Plus className="h-4 w-4" />
                Crear manualmente
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Known NPCs */}
          {(isMaster ? npcs : knownNPCs).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-[var(--text-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {isMaster ? `Todos los NPCs (${npcs.length})` : `Conocidos por el grupo (${knownNPCs.length})`}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isMaster ? npcs : knownNPCs).map((npc: NpcType) => (
                  <NPCCard
                    key={npc.id}
                    npc={npc}
                    campaignSlug={campaignSlug}
                    isMaster={isMaster}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hidden NPCs (master only) */}
          {isMaster && unknownNPCs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="h-4 w-4 text-[var(--text-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Ocultos a los jugadores ({unknownNPCs.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {unknownNPCs.map((npc: NpcType) => (
                  <NPCCard
                    key={npc.id}
                    npc={npc}
                    campaignSlug={campaignSlug}
                    isMaster={isMaster}
                    isHidden
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NPCCard({
  npc,
  campaignSlug,
  isHidden,
}: {
  npc: Awaited<ReturnType<typeof prisma.nPC.findMany>>[0];
  campaignSlug: string;
  isMaster: boolean;
  isHidden?: boolean;
}) {
  return (
    <Link
      href={`/${campaignSlug}/npcs/${npc.id}`}
      className="group block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all campaign-card"
    >
      {/* Portrait */}
      <div className="h-24 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-overlay)] flex items-center justify-center relative overflow-hidden">
        {npc.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-[#34d399]/60">
              {npc.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          {!npc.isAlive && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400">Muerto</span>
          )}
          {isHidden && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-gray-400 flex items-center gap-1">
              <EyeOff className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[#34d399] transition-colors mb-1">
          {npc.name}
        </h3>
        {(npc.race || npc.occupation) && (
          <p className="text-xs text-[var(--text-muted)] mb-2">
            {[npc.race, npc.occupation].filter(Boolean).join(" · ")}
          </p>
        )}
        {npc.personality && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {npc.personality}
          </p>
        )}
        {npc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {npc.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
