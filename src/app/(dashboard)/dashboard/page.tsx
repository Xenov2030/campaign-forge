import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import {
  Plus,
  Crown,
  Sword,
  Users,
  Calendar,
  ArrowRight,
  BookOpen,
  UserPlus,
  Archive,
} from "lucide-react";
import { formatRelativeTime, getThemeColors } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

async function getUserCampaigns(userId: string) {
  const [masteredCampaigns, playerCampaigns] = await Promise.all([
    prisma.campaign.findMany({
      where: { masterId: userId },
      include: {
        _count: {
          select: { members: true, characters: true, sessions: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.campaignMember.findMany({
      where: { userId, role: "PLAYER" },
      include: {
        campaign: {
          include: {
            master: { select: { displayName: true, avatarUrl: true } },
            _count: {
              select: { members: true, characters: true, sessions: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  return { masteredCampaigns, playerCampaigns };
}

const systemLabels: Record<string, string> = {
  DND5E: "D&D 5e",
  PATHFINDER2E: "Pathfinder 2e",
  CALL_OF_CTHULHU: "Call of Cthulhu",
  VAMPIRE_MASQUERADE: "Vampiro: La Mascarada",
  SHADOWRUN: "Shadowrun",
  STARFINDER: "Starfinder",
  CUSTOM: "Sistema propio",
};

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Solo MASTER/ADMIN pueden crear campañas (gatea los CTA de "crear").
  const canMaster = user.role !== "PLAYER";

  const { masteredCampaigns, playerCampaigns } = await getUserCampaigns(user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8 md:mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Bienvenido de vuelta
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-black text-[var(--text-primary)] truncate">
            {user.displayName}
          </h1>
        </div>
        <Link
          href="/dashboard/join"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] hover:border-[#60a5fa] hover:text-[#60a5fa] transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Unirse a campaña
        </Link>
      </div>

      {/* My Campaigns */}
      {masteredCampaigns.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[var(--accent-gold)]" />
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                Mis campañas
              </h2>
            </div>
            {canMaster && (
              <Link
                href="/dashboard/new-campaign"
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] text-xs"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Nueva campaña
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {masteredCampaigns.map((campaign: (typeof masteredCampaigns)[number]) => {
              const themeColor = getThemeColors(campaign.theme);
              return (
                <Link
                  key={campaign.id}
                  href={`/${campaign.slug}`}
                  className="group campaign-card block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all"
                >
                  {/* Cover */}
                  <div
                    className="h-36 relative flex items-end p-4"
                    style={{
                      background: (campaign.bannerImage || campaign.coverImage)
                        ? `url(${campaign.bannerImage || campaign.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${themeColor.bg} 0%, ${themeColor.primary}20 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative flex items-center justify-between w-full">
                      <span
                        className="text-xs px-2 py-0.5 rounded border font-medium"
                        style={{
                          borderColor: `${themeColor.primary}40`,
                          color: themeColor.primary,
                          background: `${themeColor.primary}15`,
                        }}
                      >
                        {systemLabels[campaign.system]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/40 font-semibold uppercase tracking-wide">
                          Propia
                        </span>
                        <div
                          className={`h-2 w-2 rounded-full ${campaign.status === "ACTIVE" ? "bg-green-400" : "bg-gray-500"}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                        {campaign.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign._count.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {campaign._count.sessions} sesiones
                        </span>
                      </div>
                      <span>{formatRelativeTime(campaign.updatedAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Player Campaigns */}
      {playerCampaigns.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Sword className="h-4 w-4 text-[#60a5fa]" />
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Campañas donde juegas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playerCampaigns.map(({ campaign }: { campaign: typeof playerCampaigns[0]["campaign"] }) => {
              const themeColor = getThemeColors(campaign.theme);
              return (
                <Link
                  key={campaign.id}
                  href={`/${campaign.slug}`}
                  className="group campaign-card block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all"
                >
                  <div
                    className="h-36 relative flex items-end p-4"
                    style={{
                      background: (campaign.bannerImage || campaign.coverImage)
                        ? `url(${campaign.bannerImage || campaign.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${themeColor.bg} 0%, ${themeColor.primary}20 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-white/90 font-medium">
                        <Crown className="h-3 w-3 text-[var(--accent-gold)]" aria-hidden="true" />
                        {campaign.master.displayName}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[#60a5fa] transition-colors">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign._count.members} jugadores
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign._count.sessions} sesiones
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {masteredCampaigns.length === 0 && playerCampaigns.length === 0 && (
        <div className="text-center py-24 px-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 mb-6">
            <BookOpen className="h-10 w-10 text-[var(--accent-gold)]/60" />
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
            Tu primera aventura espera
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            {canMaster
              ? "Crea tu primera campaña como máster o únete a una existente con un código de invitación."
              : "Únete a una campaña existente con un código de invitación para empezar a jugar."}
          </p>
          <div className="flex gap-4 justify-center">
            {canMaster && (
              <Link
                href="/dashboard/new-campaign"
                className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)]"
              >
                <Plus className="h-4 w-4" />
                Crear campaña
              </Link>
            )}
            <Link
              href="/dashboard/join"
              className="inline-flex items-center gap-2 h-11 px-6 border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] hover:border-[var(--accent-gold)] transition-all"
            >
              <ArrowRight className="h-4 w-4" />
              Unirse con código
            </Link>
          </div>
        </div>
      )}

      {/* Compact stats strip — below campaigns */}
      {(masteredCampaigns.length > 0 || playerCampaigns.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-2 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "campañas como máster", value: masteredCampaigns.length, icon: <Crown className="h-3.5 w-3.5" />, color: "var(--accent-gold)" },
            { label: "como jugador", value: playerCampaigns.length, icon: <Sword className="h-3.5 w-3.5" />, color: "#60a5fa" },
            { label: "sesiones", value: masteredCampaigns.reduce((acc: number, c: (typeof masteredCampaigns)[number]) => acc + c._count.sessions, 0), icon: <Calendar className="h-3.5 w-3.5" />, color: "#34d399" },
            { label: "aventureros", value: masteredCampaigns.reduce((acc: number, c: (typeof masteredCampaigns)[number]) => acc + c._count.members, 0), icon: <Users className="h-3.5 w-3.5" />, color: "#a855f7" },
          ].map((stat, i) => (
            <span key={i} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <span style={{ color: stat.color }} aria-hidden="true">{stat.icon}</span>
              <span className="font-semibold" style={{ color: stat.color }}>{stat.value}</span>
              <span>{stat.label}</span>
            </span>
          ))}
          </div>
          {canMaster && (
            <Link
              href="/vault"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-xs font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors shrink-0"
            >
              <Archive className="h-3.5 w-3.5" />
              Mi baúl
            </Link>
          )}
        </div>
      )}

    </div>
  );
}
