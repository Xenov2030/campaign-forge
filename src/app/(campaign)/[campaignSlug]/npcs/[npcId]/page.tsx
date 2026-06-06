import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, User, MapPin, Users, Eye, EyeOff, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ campaignSlug: string; npcId: string }>;
}

export default async function NPCDetailPage({ params }: PageProps) {
  const { campaignSlug, npcId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const npc = await prisma.nPC.findUnique({
    where: { id: npcId },
    include: { campaign: { select: { masterId: true, slug: true, name: true } } },
  });

  if (!npc || npc.campaign.slug !== campaignSlug) notFound();

  const isMaster = npc.campaign.masterId === user.id;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href={`/${campaignSlug}/npcs`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a NPCs
      </Link>

      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
        <div className="h-20 bg-gradient-to-r from-[#34d399]/20 to-[#60a5fa]/15" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-10 mb-4">
            <div className="h-20 w-20 rounded-[var(--radius-xl)] border-4 border-[var(--bg-surface)] overflow-hidden bg-[var(--bg-elevated)] shrink-0">
              {npc.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-8 w-8 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">{npc.name}</h1>
                {npc.isKnownToParty ? (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-900/20 text-green-400 border border-green-800/30">
                    <Eye className="h-3 w-3" /> Conocido
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-800/40 text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    <EyeOff className="h-3 w-3" /> Desconocido
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded border ${npc.isAlive ? "bg-green-900/20 text-green-400 border-green-800/30" : "bg-red-900/20 text-red-400 border-red-800/30"}`}>
                  {npc.isAlive ? "Vivo" : "Muerto"}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                {[npc.race, npc.occupation].filter(Boolean).join(" · ")}
                {npc.age ? ` · ${npc.age}` : ""}
              </p>
            </div>
          </div>

          {(npc.location || npc.faction) && (
            <div className="flex gap-3 flex-wrap">
              {npc.location && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-3 py-1.5 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <MapPin className="h-3.5 w-3.5" />
                  {npc.location}
                </span>
              )}
              {npc.faction && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-3 py-1.5 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <Users className="h-3.5 w-3.5" />
                  {npc.faction}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {npc.appearance && (
            <Section title="Apariencia">{npc.appearance}</Section>
          )}
          {npc.personality && (
            <Section title="Personalidad">{npc.personality}</Section>
          )}
          {npc.backstory && (
            <Section title="Historia">{npc.backstory}</Section>
          )}

          {/* Master-only info */}
          {isMaster && (npc.motivations || npc.secrets || npc.quirks || npc.voiceNotes) && (
            <div className="bg-[var(--bg-surface)] border border-amber-700/30 rounded-[var(--radius-xl)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-amber-400" />
                <h2 className="font-display text-base font-bold text-amber-400">Notas del máster</h2>
              </div>
              {npc.motivations && <InfoLine label="Motivaciones" value={npc.motivations} />}
              {npc.secrets && <InfoLine label="Secretos" value={npc.secrets} />}
              {npc.quirks && <InfoLine label="Peculiaridades" value={npc.quirks} />}
              {npc.voiceNotes && <InfoLine label="Voz / Acento" value={npc.voiceNotes} />}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {npc.tags.length > 0 && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {npc.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
      <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-3">{title}</h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{value}</p>
    </div>
  );
}
