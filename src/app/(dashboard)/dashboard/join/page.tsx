"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Users, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinCampaignPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [campaignName, setCampaignName] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Código inválido");

      setCampaignName(data.campaignName ?? "");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#60a5fa]/10 border border-[#60a5fa]/20 mb-4">
          <Users className="h-8 w-8 text-[#60a5fa]" />
        </div>
        <h1 className="font-display text-3xl font-black text-[var(--text-primary)] mb-2">
          Unirse a campaña
        </h1>
        <p className="text-[var(--text-secondary)]">
          Introduce el código de invitación que te dio el máster
        </p>
      </div>

      {sent ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-lg)] text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-nature)]/10 border border-[var(--accent-nature)]/30 mb-3">
            <Check className="h-6 w-6 text-[var(--accent-nature)]" />
          </div>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">Solicitud enviada</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Tu solicitud para unirte a {campaignName ? `"${campaignName}"` : "la campaña"} fue enviada al máster.
            Te avisaremos cuando responda.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-5 rounded-[var(--radius-md)] text-sm font-semibold bg-[var(--accent-gold)] text-[var(--bg-base)] hover:brightness-110 transition-all"
          >
            Volver al dashboard
          </Link>
        </div>
      ) : (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-lg)]">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <Input
              label="Código de invitación"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              className="font-mono text-lg tracking-widest text-center uppercase"
              maxLength={20}
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1 text-center">
              El código es case-insensitive
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            <Sparkles className="h-4 w-4" />
            Solicitar unirse
          </Button>
        </form>
      </div>
      )}
    </div>
  );
}
