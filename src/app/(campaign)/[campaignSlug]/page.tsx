import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Sword, Users, Calendar, Target, BookOpen,
  Crown, Sparkles, Heart, ChevronRight, Skull, Package, Music,
} from "lucide-react";
import { formatRelativeTime, getThemeColors } from "@/lib/utils";
import { InviteCode } from "@/components/campaign/invite-code";

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
      _count: { select: { characters: true, npcs: true, sessions: true } },
    },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const themeColor = getThemeColors(campaign.theme);

  const activeQuests = await prisma.quest.findMany({
    where: {
      campaignId: campaign.id,
      status: "ACTIVE",
      ...(isMaster ? {} : { isKnownToParty: true }),
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const myCharacter = isMaster
    ? null
    : await prisma.character.findFirst({ where: { campaignId: campaign.id, userId: user.id } });

  const latestSession = await prisma.session.findFirst({
    where: { campaignId: campaign.id },
    orderBy: { number: "desc" },
  });

  const npcCount = isMaster
    ? campaign._count.npcs
    : await prisma.nPC.count({ where: { campaignId: campaign.id, isKnownToParty: true } });

  const stats = [
    { label: "Personajes", count: campaign._count.characters, href: `/${campaignSlug}/characters`, icon: <Sword className="h-5 w-5" />, color: "#60a5fa" },
    { label: "NPCs", count: npcCount, href: `/${campaignSlug}/npcs`, icon: <Users className="h-5 w-5" />, color: "#34d399" },
    { label: "Sesiones", count: campaign._count.sessions, href: `/${campaignSlug}/sessions`, icon: <Calendar className="h-5 w-5" />, color: "#a855f7" },
  ];

  const quickActions = [
    { label: "Generar NPC", href: `/${campaignSlug}/ai-forge?type=NPC`, icon: <Users className="h-5 w-5" />, color: "#34d399" },
    { label: "Generar Monstruo", href: `/${campaignSlug}/ai-forge?type=MONSTER`, icon: <Skull className="h-5 w-5" />, color: "#f87171" },
    { label: "Generar Objeto", href: `/${campaignSlug}/ai-forge?type=ITEM`, icon: <Package className="h-5 w-5" />, color: "#f59e0b" },
    { label: "Generar Quest", href: `/${campaignSlug}/ai-forge?type=QUEST`, icon: <Target className="h-5 w-5" />, color: "#a855f7" },
    { label: "Agendar sesión", href: `/${campaignSlug}/sessions/new`, icon: <Calendar className="h-5 w-5" />, color: "#38bdf8" },
    { label: "Lore", href: `/${campaignSlug}/lore/new`, icon: <BookOpen className="h-5 w-5" />, color: "#c9a84c" },
  ];

  const hpPercent =
    myCharacter && myCharacter.maxHitPoints > 0
      ? Math.round((myCharacter.hitPoints / myCharacter.maxHitPoints) * 100)
      : 0;

  // ── Bloques reutilizables ──────────────────────────────────────
  const membersCard = (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-[#34d399]" />
        <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Aventureros</h2>
      </div>
      <div className="space-y-2">
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
  );

  const ambienceCard = (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 opacity-70">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-[var(--accent-arcane)]" />
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Ambientación</h2>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">Pronto</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Música para tus sesiones, conectada a Spotify o YouTube Music.
      </p>
    </div>
  );

  const questsCard = (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-[#f59e0b]" />
        <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
          {isMaster ? "Misiones activas" : "Tus misiones"}
        </h2>
      </div>
      {activeQuests.length > 0 ? (
        <div className="space-y-3">
          {activeQuests.map((quest: (typeof activeQuests)[number]) => {
            const objectives: unknown[] = Array.isArray(quest.objectives) ? quest.objectives : [];
            const done = objectives.filter(
              (o) => o && typeof o === "object" && "completed" in o && (o as { completed?: boolean }).completed,
            ).length;
            return (
              <div key={quest.id} className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{quest.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20 shrink-0">{quest.type}</span>
                </div>
                {quest.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{quest.description}</p>
                )}
                {objectives.length > 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Objetivos: {done}/{objectives.length}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--text-muted)]">
            {isMaster ? "No hay misiones activas" : "El máster aún no reveló misiones"}
          </p>
        </div>
      )}
    </div>
  );

  const lastSessionCard = latestSession ? (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#a855f7]" />
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Última sesión</h2>
        </div>
        <Link href={`/${campaignSlug}/sessions`} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Ver todas →</Link>
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
  ) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Banner — más bajo para dar aire al contenido */}
      <div
        className="relative rounded-[var(--radius-xl)] overflow-hidden mb-5 h-32 flex items-end"
        style={{
          background: campaign.bannerImage
            ? `url(${campaign.bannerImage}) center/cover`
            : `linear-gradient(135deg, ${themeColor.bg} 0%, ${themeColor.primary}25 50%, ${themeColor.bg} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${themeColor.primary}40 1px, transparent 1px), linear-gradient(90deg, ${themeColor.primary}40 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative p-5 flex items-end justify-between w-full">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: `${themeColor.primary}50`, color: themeColor.primary, background: `${themeColor.primary}15` }}
              >
                {campaign.theme}
              </span>
              <div className={`h-2 w-2 rounded-full ${campaign.status === "ACTIVE" ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
              <span className="text-xs text-gray-400">{campaign.status === "ACTIVE" ? "Activa" : "Pausada"}</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-wide truncate">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-sm text-gray-300 mt-1 max-w-2xl line-clamp-1">{campaign.description}</p>
            )}
          </div>
          {isMaster && (
            <Link
              href={`/${campaignSlug}/ai-forge`}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium shrink-0"
              style={{ background: `${themeColor.primary}20`, border: `1px solid ${themeColor.primary}40`, color: themeColor.primary }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              IA Forge
            </Link>
          )}
        </div>
      </div>

      {/* Stats — Personajes, NPCs, Sesiones */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((section) => (
          <Link
            key={section.label}
            href={section.href}
            className="group flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] hover:border-[var(--border-default)] transition-all min-w-0"
          >
            <span style={{ color: section.color }} className="shrink-0">{section.icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-none" style={{ color: section.color }}>{section.count}</p>
              <p className="text-xs text-[var(--text-muted)] truncate mt-1">{section.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {isMaster && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
                <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Acciones rápidas</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex flex-col items-start gap-2 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:-translate-y-0.5 transition-all min-h-[104px]"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] shrink-0"
                      style={{ background: `${a.color}18`, border: `1px solid ${a.color}33`, color: a.color }}
                    >
                      {a.icon}
                    </span>
                    <span className="text-sm font-medium text-[var(--text-secondary)] leading-tight">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {questsCard}

          {/* Jugador: acceso a objetos (pendiente de construir la sección) */}
          {!isMaster && (
            <div
              title="Próximamente"
              className="flex items-center gap-3 p-5 rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] opacity-60 cursor-not-allowed select-none"
            >
              <Package className="h-5 w-5 text-[#94a3b8] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">Tus objetos</p>
                <p className="text-xs text-[var(--text-muted)]">Inventario y equipo de tu personaje</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">Pronto</span>
            </div>
          )}

          {lastSessionCard}
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Jugador: tu personaje (compacto, arriba) */}
          {!isMaster && myCharacter && (
            <Link
              href={`/${campaignSlug}/characters/${myCharacter.id}`}
              className="block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 hover:border-[#60a5fa]/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sword className="h-4 w-4 text-[#60a5fa]" />
                  <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">Tu personaje</h2>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[#60a5fa] transition-colors" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#60a5fa]/10 border-2 border-[#60a5fa]/30 flex items-center justify-center shrink-0 font-display text-sm font-bold text-[#60a5fa]/70">
                  {String(myCharacter.name).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-[var(--text-primary)] truncate">{myCharacter.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {[myCharacter.class, myCharacter.level ? `Nv. ${myCharacter.level}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-[#f87171] shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${hpPercent}%`, background: hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171" }} />
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0">{myCharacter.hitPoints}/{myCharacter.maxHitPoints}</span>
              </div>
            </Link>
          )}

          {membersCard}

          {isMaster && <InviteCode code={campaign.inviteCode} />}

          {isMaster && ambienceCard}
        </div>
      </div>
    </div>
  );
}
