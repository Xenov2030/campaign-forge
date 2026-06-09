"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { id: "GENERAL",    label: "General",    emoji: "📜" },
  { id: "HISTORY",    label: "Historia",   emoji: "⏳" },
  { id: "RELIGION",   label: "Religión",   emoji: "⛪" },
  { id: "MAGIC",      label: "Magia",      emoji: "✨" },
  { id: "POLITICS",   label: "Política",   emoji: "⚖️" },
  { id: "GEOGRAPHY",  label: "Geografía",  emoji: "🗺️" },
  { id: "CULTURE",    label: "Cultura",    emoji: "🎭" },
  { id: "BESTIARY",   label: "Bestiario",  emoji: "🐉" },
  { id: "TECHNOLOGY", label: "Tecnología", emoji: "⚙️" },
];

export default function NewLorePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.campaignSlug as string;

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", content: "", category: "GENERAL", isPublic: false, tags: "",
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
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, campaignId, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/${slug}/lore`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear entrada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${slug}/lore`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al lore
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nueva entrada de lore</h1>
          <p className="text-sm text-[var(--text-muted)]">Añade conocimiento al universo de tu campaña</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 space-y-4">
          <Input label="Título *" value={form.title} onChange={set("title")} placeholder="Los Dioses del Panteón Arcano..." required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-sm transition-all ${
                    form.category === cat.id
                      ? "border-[var(--accent-gold)]/50 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Textarea label="Contenido *" value={form.content} onChange={set("content")} rows={10} placeholder="Escribe el contenido del artículo del lore aquí..." required />

          <Input label="Tags (separados por comas)" value={form.tags} onChange={set("tags")} placeholder="magia, panteón, antiguo..." />

          <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
              className="h-4 w-4 accent-[var(--accent-gold)]"
            />
            <div>
              <label htmlFor="isPublic" className="text-sm text-[var(--text-primary)] cursor-pointer font-medium">
                Visible para los jugadores
              </label>
              <p className="text-xs text-[var(--text-muted)]">Si no se marca, solo el máster puede verlo</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/${slug}/lore`}>
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving || !campaignId}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear entrada
          </Button>
        </div>
      </form>
    </div>
  );
}
