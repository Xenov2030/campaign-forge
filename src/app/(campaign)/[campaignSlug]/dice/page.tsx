import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { DiceRoller } from "@/components/dice/dice-roller";
import { Dices } from "lucide-react";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

const AVATAR_COLORS = ["#c9a84c", "#60a5fa", "#34d399", "#f87171", "#a855f7", "#f59e0b"];

function colorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(displayName: string): string {
  return displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function ResultBadge({ total, notation }: { total: number; notation: string }) {
  const isD20 = notation.includes("d20");
  if (isD20 && total === 20) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-bold border border-[var(--accent-gold)]/30">¡CRÍTICO!</span>;
  if (isD20 && total === 1) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">PIFIA</span>;
  return null;
}

export default async function DicePage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true },
  });
  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  if (!isMaster) {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: campaign.id, userId: user.id } },
    });
    if (!member) redirect(`/${campaignSlug}`);
  }

  const rawRolls = await prisma.diceRoll.findMany({
    where: {
      campaignId: campaign.id,
      ...(isMaster ? {} : { isSecret: false }),
    },
    include: { user: { select: { id: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  type RollWithUser = (typeof rawRolls)[number];
  const rolls: RollWithUser[] = rawRolls;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left — Roll history */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Historial de tiradas
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {rolls.length > 0 ? `Últimas ${rolls.length} tiradas de la campaña` : "Sin tiradas todavía"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {rolls.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center px-6">
                <div className="h-14 w-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <Dices className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Sin tiradas todavía</p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs">
                  Las tiradas que hagas desde la bandeja de dados quedarán registradas aquí.
                </p>
              </div>
            ) : (
              rolls.map((roll) => {
                const color = colorForUserId(roll.userId);
                const abbr = initials(roll.user.displayName);
                const results = roll.results as number[];
                return (
                  <div key={roll.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors">
                    <div
                      className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-[var(--bg-base)]"
                      style={{ background: color }}
                    >
                      {abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {roll.user.displayName}
                          {roll.isSecret && isMaster && (
                            <span className="ml-1.5 text-[10px] text-amber-400 font-normal">(oculta)</span>
                          )}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                          {formatRelativeTime(roll.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-muted)]">{roll.notation}</span>
                        <span className="text-[var(--border-default)]">→</span>
                        <span className="font-display font-bold text-base leading-none" style={{ color }}>
                          {roll.total}
                        </span>
                        <ResultBadge total={roll.total} notation={roll.notation} />
                      </div>
                      {roll.purpose && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 italic">
                          {roll.purpose}
                        </p>
                      )}
                      {results.length > 1 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {results.map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-[var(--bg-overlay)] text-[var(--text-muted)]"
                            >
                              {r}
                            </span>
                          ))}
                          {roll.modifier !== 0 && (
                            <span className="text-[10px] text-[var(--text-muted)] self-center">
                              {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Dice roller */}
        <div className="md:w-[320px] lg:w-[360px] shrink-0 overflow-y-auto">
          <div className="px-4 py-6">
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Lanzar dados
            </h2>
            <DiceRoller />
          </div>
        </div>
      </div>
    </div>
  );
}
