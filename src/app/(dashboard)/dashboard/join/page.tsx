"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinCampaignPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      router.push(`/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
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
            Unirse a la aventura
          </Button>
        </form>
      </div>
    </div>
  );
}
