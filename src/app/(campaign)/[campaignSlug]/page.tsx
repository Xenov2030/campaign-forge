import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Sword, Users, Calendar, Target, BookOpen,
  Map, Skull, Package, Crown, Sparkles,
} from "lucide-react";
import { formatRelativeTime, getThemeColors } from "@/lib/utils";

interface CampaignPageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: CampaignPageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: campaign?.name ?? "Campaña" };
}

export default async function CampaignOverviewPage({ params }: CampaignPageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    include: {
      master: true,
      members: { include: { user: true } },
      _count: {
        select: {
          characters: true,
          npcs: true,
          quests: true,
          sessions: true,
          locations: true,
          loreEntries: true,
          items: true,
          monsters: true,
        },
      },
    },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const themeColor = getThemeColors(campaign.theme);

  const latestSession = await prisma.session.findFirst({
    where: { campaignId: campaign.id },
    orderBy: { number: "desc" },
  });

  const activeQuests = await prisma.quest.findMany({
    where: { campaignId: campaign.id, status: "ACTIVE" },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const sections = [
    { label: "Personajes",  count: campaign._count.characters,  href: `/${campaignSlug}/characters`,  icon: <Sword className="h-5 w-5" />,   color: "#60a5fa" },
    { label: "NPCs",        count: campaign._count.npcs,         href: `/${campaignSlug}/npcs`,         icon: <Users className="h-5 w-5" />,   color: "#34d399" },
    { label: "Monstruos",   count: campaign._count.monsters,     href: `/${campaignSlug}/monsters`,     icon: <Skull className="h-5 w-5" />,   color: "#f87171" },
    { label: "Quests",      count: campaign._count.quests,       href: `/${campaignSlug}/quests`,       icon: <Target className="h-5 w-5" />,  color: "#f59e0b" },
    { label: "Sesiones",    count: campaign._count.sessions,     href: `/${campaignSlug}/sessions`,     icon: <Calendar className="h-5 w-5" />,color: "#a855f7" },
    { label: "Lore / Wiki", count: campaign._count.loreEntries,  href: `/${campaignSlug}/lore`,         icon: <BookOpen className="h-5 w-5" />,color: "#c9a84c" },
    { label: "Localizaciones",count: campaign._count.locations,  href: `/${campaignSlug}/world`,        icon: <Map className="h-5 w-5" />,     color: "#38bdf8" },
    { label: "Objetos",     count: campaign._count.items,        href: `/${campaignSlug}/items`,        icon: <Package className="h-5 w-5" />, color: "#94a3b8" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Campaign banner */}
      <div
        className="relative rounded-[var(--radius-xl)] overflow-hidden mb-8 h-48 flex items-end"
        style={{
          background: campaign.bannerImage
            ? `url(${campaign.bannerImage}) center/cover`
            : `linear-gradient(135deg, ${themeColor.bg} 0%, ${themeColor.primary}25 50%, ${themeColor.bg} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${themeColor.primary}40 1px, transparent 1px), linear-gradient(90deg, ${themeColor.primary}40 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative p-6 flex items-end justify-between w-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{
                  borderColor: `${themeColor.primary}50`,
                  color: themeColor.primary,
                  background: `${themeColor.primary}15`,
                }}
              >
                {campaign.theme}
              </span>
              <div className={`h-2 w-2 rounded-full ${campaign.status === "ACTIVE" ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-400">{campaign.status === "ACTIVE" ? "Activa" : "Pausada"}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-wide">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-sm text-gray-300 mt-1 max-w-lg line-clamp-2">{campaign.description}</p>
            )}
          </div>

          {isMaster && (
            <div className="flex items-center gap-2">
              <Link
                href={`/${campaignSlug}/ai-forge`}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium"
                style={{
                  background: `${themeColor.primary}20`,
                  border: `1px solid ${themeColor.primary}40`,
                  color: themeColor.primary,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                IA Forge
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Compact stats row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
        {sections.map((section) => (
          <Link
            key={section.label}
            href={section.href}
            className="group flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] hover:border-[var(--border-default)] transition-all min-w-0"
          >
            <span style={{ color: section.color }} className="[&>svg]:h-3.5 [&>svg]:w-3.5 shrink-0">{section.icon}</span>
            <div className="min-w-0 hidden sm:block">
              <p className="font-bold text-sm leading-none" style={{ color: section.color }}>{section.count}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{section.label}</p>
            </div>
            <p className="font-bold text-sm sm:hidden" style={{ color: section.color }}>{section.count}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active quests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#f59e0b]" />
                <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Quests activas</h2>
              </div>
              <Link
                href={`/${campaignSlug}/quests`}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {activeQuests.length > 0 ? (
              <div className="space-y-3">
                {activeQuests.map((quest: (typeof activeQuests)[number]) => (
                  <div key={quest.id} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{quest.name}</p>
                      {quest.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{quest.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20 shrink-0 ml-2">
                      {quest.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No hay quests activas</p>
                {isMaster && (
                  <Link href={`/${campaignSlug}/quests`} className="text-xs text-[var(--accent-gold)] mt-1 inline-block">
                    Crear quest →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Last session */}
          {latestSession && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#a855f7]" />
                  <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Última sesión</h2>
                </div>
                <Link href={`/${campaignSlug}/sessions`} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">
                  Ver todas →
                </Link>
              </div>
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Sesión #{latestSession.number}{latestSession.title ? ` — ${latestSession.title}` : ""}
                  </p>
                  <span className="text-xs text-[var(--text-muted)]">
                    {latestSession.date ? formatRelativeTime(latestSession.date) : "Sin fecha"}
                  </span>
                </div>
                {(latestSession.aiSummary ?? latestSession.summary) && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {latestSession.aiSummary ?? latestSession.summary}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Members & quick actions */}
        <div className="space-y-5">
          {/* Members */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-[#34d399]" />
              <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Aventureros</h2>
            </div>
            <div className="space-y-2">
              {/* Master */}
              <div className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
                <div className="h-8 w-8 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 flex items-center justify-center">
                  <Crown className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{campaign.master.displayName}</p>
                  <p className="text-xs text-[var(--accent-gold)]">Máster</p>
                </div>
              </div>
              {campaign.members
                .filter((m: { role: string }) => m.role !== "MASTER")
                .map((member: { id: string; user: { displayName: string } }) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)]">
                    <div className="h-8 w-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                      {member.user.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{member.user.displayName}</p>
                      <p className="text-xs text-[var(--text-muted)]">Jugador</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Invite */}
          {isMaster && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Código de invitación</p>
              <p className="font-mono text-lg font-bold text-[var(--accent-gold)] tracking-widest">
                {campaign.inviteCode.slice(0, 6).toUpperCase()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Comparte este código con tus jugadores</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
