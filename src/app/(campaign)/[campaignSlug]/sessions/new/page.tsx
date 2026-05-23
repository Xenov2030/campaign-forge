"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planificada" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.campaignSlug as string;

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", date: "", status: "PLANNED", summary: "", notes: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  useEffect(() => {
    fetch(`/api/campaigns/by-slug/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setCampaignId(d.id); });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/${slug}/sessions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear sesión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href={`/${slug}/sessions`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a sesiones
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-[#a855f7]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nueva sesión</h1>
          <p className="text-sm text-[var(--text-muted)]">Registra o planifica una sesión de juego</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 space-y-4">
          <Input label="Título de la sesión (opcional)" value={form.title} onChange={set("title")} placeholder="El asalto al castillo de Ravenloft..." />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Estado</label>
              <select
                value={form.status}
                onChange={set("status")}
                className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <Textarea label="Resumen" value={form.summary} onChange={set("summary")} rows={4} placeholder="¿Qué pasó en esta sesión? ¿Cuáles fueron los momentos destacados?..." />
          <Textarea label="Notas del máster" value={form.notes} onChange={set("notes")} rows={3} placeholder="Notas privadas, lo que falta, cosas a recordar para la próxima..." />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/${slug}/sessions`}>
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving || !campaignId}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear sesión
          </Button>
        </div>
      </form>
    </div>
  );
}
