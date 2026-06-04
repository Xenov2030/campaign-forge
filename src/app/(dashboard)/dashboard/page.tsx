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
  Sparkles,
  BookOpen,
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

const themeLabels: Record<string, string> = {
  FANTASY: "Fantasía Medieval",
  HORROR: "Horror Lovecraftiano",
  SCIFI: "Ciencia Ficción",
  GRIMDARK: "Grimdark",
  STEAMPUNK: "Steampunk",
  WESTERN: "Western",
  MODERN: "Contemporáneo",
  POSTAPOCALYPTIC: "Post-Apocalíptico",
  CUSTOM: "Personalizado",
};

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

  const { masteredCampaigns, playerCampaigns } = await getUserCampaigns(user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 md:mb-10 gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Bienvenido de vuelta
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-black text-[var(--text-primary)] truncate">
            {user.displayName}
          </h1>
        </div>
        <Link
          href="/dashboard/new-campaign"
          className="inline-flex items-center gap-2 h-10 md:h-11 px-4 md:px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] text-sm shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Nueva campaña</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {[
          { label: "Campañas como máster", value: masteredCampaigns.length, icon: <Crown className="h-5 w-5" />, color: "var(--accent-gold)" },
          { label: "Campañas como jugador", value: playerCampaigns.length, icon: <Sword className="h-5 w-5" />, color: "#60a5fa" },
          { label: "Total sesiones", value: masteredCampaigns.reduce((acc: number, c) => acc + c._count.sessions, 0), icon: <Calendar className="h-5 w-5" />, color: "#34d399" },
          { label: "Compañeros de aventura", value: masteredCampaigns.reduce((acc: number, c) => acc + c._count.members, 0), icon: <Users className="h-5 w-5" />, color: "#a855f7" },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 md:p-5 hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-200">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span style={{ color: stat.color }} aria-hidden="true">{stat.icon}</span>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider leading-tight">{stat.label}</span>
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* My Campaigns */}
      {masteredCampaigns.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Crown className="h-4 w-4 text-[var(--accent-gold)]" />
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              Mis campañas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {masteredCampaigns.map((campaign) => {
              const themeColor = getThemeColors(campaign.theme);
              return (
                <Link
                  key={campaign.id}
                  href={`/${campaign.slug}`}
                  className="group campaign-card block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] transition-all"
                >
                  {/* Cover */}
                  <div
                    className="h-28 relative flex items-end p-4"
                    style={{
                      background: campaign.coverImage
                        ? `url(${campaign.coverImage}) center/cover`
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
                      <div
                        className={`h-2 w-2 rounded-full ${campaign.status === "ACTIVE" ? "bg-green-400" : "bg-gray-500"}`}
                      />
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
                    className="h-28 relative flex items-end p-4"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor.bg} 0%, ${themeColor.primary}20 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative">
                      <span className="text-xs text-[var(--text-muted)]">Máster: {campaign.master.displayName}</span>
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
            Crea tu primera campaña como máster o únete a una existente con un código de invitación.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/new-campaign"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)]"
            >
              <Plus className="h-4 w-4" />
              Crear campaña
            </Link>
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

      {/* Quick actions */}
      <section className="mt-4 pt-8 border-t border-[var(--border-subtle)]">
        <h3 className="font-display text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
          Acciones rápidas
        </h3>
        <div className="flex gap-3">
          <Link
            href="/dashboard/new-campaign"
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </Link>
          <Link
            href="/dashboard/join"
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Unirse a campaña
          </Link>
        </div>
      </section>
    </div>
  );
}
