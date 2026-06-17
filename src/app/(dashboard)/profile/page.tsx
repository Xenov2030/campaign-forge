import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ChevronLeft, Crown, Sword, Users, Calendar, BookOpen, Shield } from "lucide-react";
import { ProfileEditForm } from "./profile-edit-form";

export const metadata = { title: "Mi perfil" };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MASTER: "Máster",
  PLAYER: "Jugador",
};

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [masteredCount, playerCount, characterCount, sessionCount] = await Promise.all([
    prisma.campaign.count({ where: { masterId: user.id } }),
    prisma.campaignMember.count({ where: { userId: user.id, role: "PLAYER" } }),
    prisma.character.count({ where: { userId: user.id } }),
    prisma.session.count({
      where: {
        campaign: {
          OR: [
            { masterId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    }),
  ]);

  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const stats = [
    { label: "campañas maestreadas", value: masteredCount, icon: Crown, color: "var(--accent-gold)" },
    { label: "campañas como jugador", value: playerCount, icon: Sword, color: "#60a5fa" },
    { label: "personajes creados", value: characterCount, icon: Users, color: "#34d399" },
    { label: "sesiones jugadas", value: sessionCount, icon: Calendar, color: "#a855f7" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      {/* Header card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-[var(--accent-gold)]/20 via-[var(--accent-arcane)]/15 to-[#06b6d4]/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--accent-gold)/10_0%,_transparent_60%)]" />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-5 -mt-10 flex items-end gap-4">
          <div className="h-20 w-20 rounded-full border-4 border-[var(--bg-surface)] overflow-hidden bg-[var(--bg-elevated)] shrink-0 flex items-center justify-center">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl font-black text-[var(--accent-gold)]">
                {initials}
              </span>
            )}
          </div>
          <div className="mb-1 min-w-0">
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)] truncate">
              {user.displayName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm text-[var(--text-muted)]">{user.email}</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
                <Shield className="h-2.5 w-2.5" />
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] px-4 py-3 text-center"
            >
              <div className="flex items-center justify-center mb-1.5">
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="font-display text-2xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state for new users */}
      {masteredCount === 0 && playerCount === 0 && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-muted)]">
          <BookOpen className="h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
          <span>Tu aventura está por comenzar. Crea o únete a una campaña desde el dashboard.</span>
        </div>
      )}

      {/* Edit forms */}
      <ProfileEditForm
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
