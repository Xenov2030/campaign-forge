"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NewNPCPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.campaignSlug as string;

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState("");

  const [form, setForm] = useState({
    name: "", race: "", occupation: "", age: "", gender: "",
    appearance: "", personality: "", backstory: "",
    motivations: "", secrets: "", quirks: "", voiceNotes: "",
    location: "", faction: "", isKnownToParty: false,
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
      const res = await fetch("/api/npcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, campaignId, portraitUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/${slug}/npcs/${data.npc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear NPC");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${slug}/npcs`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a NPCs
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center">
          <Users className="h-5 w-5 text-[#34d399]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Nuevo NPC</h1>
          <p className="text-sm text-[var(--text-muted)]">Personaje no jugador para la campaña</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Portrait + básico */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Información básica</h2>
          <div className="flex gap-6">
            <ImageUpload
              value={portraitUrl}
              onChange={setPortraitUrl}
              folder="npcs"
              label="Retrato del NPC"
              aspectRatio="portrait"
              className="w-36 shrink-0"
            />
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input label="Nombre *" value={form.name} onChange={set("name")} placeholder="Nombre del NPC" required className="col-span-2" />
              <Input label="Raza" value={form.race} onChange={set("race")} placeholder="Humano, Elfo..." />
              <Input label="Ocupación / Rol" value={form.occupation} onChange={set("occupation")} placeholder="Tabernero, Guardia real..." />
              <Input label="Edad" value={form.age} onChange={set("age")} placeholder="35 años, anciano..." />
              <Input label="Género" value={form.gender} onChange={set("gender")} placeholder="Masculino, Femenino..." />
              <Input label="Localización" value={form.location} onChange={set("location")} placeholder="Ciudad de Puertallamas..." />
              <Input label="Facción" value={form.faction} onChange={set("faction")} placeholder="Gremio de Ladrones..." />
              <div className="col-span-2 flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]">
                <input
                  type="checkbox"
                  id="isKnown"
                  checked={form.isKnownToParty}
                  onChange={(e) => setForm((p) => ({ ...p, isKnownToParty: e.target.checked }))}
                  className="h-4 w-4 accent-[var(--accent-gold)]"
                />
                <label htmlFor="isKnown" className="text-sm text-[var(--text-primary)] cursor-pointer">
                  Conocido por el grupo de aventureros
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Personalidad */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Personalidad e historia</h2>
          <div className="space-y-4">
            <Textarea label="Apariencia física" value={form.appearance} onChange={set("appearance")} rows={2} placeholder="Describe cómo se ve este personaje..." />
            <Textarea label="Personalidad" value={form.personality} onChange={set("personality")} rows={3} placeholder="Cómo se comporta, qué rasgos lo definen..." />
            <Textarea label="Historia" value={form.backstory} onChange={set("backstory")} rows={4} placeholder="Trasfondo e historia del personaje..." />
          </div>
        </div>

        {/* Secretos (solo máster) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">Notas del máster</h2>
          <p className="text-xs text-[var(--text-muted)] mb-5">Esta información solo la verás tú como máster</p>
          <div className="space-y-4">
            <Textarea label="Motivaciones" value={form.motivations} onChange={set("motivations")} rows={2} placeholder="Qué quiere este personaje y por qué..." />
            <Textarea label="Secretos" value={form.secrets} onChange={set("secrets")} rows={2} placeholder="Información oculta que no conocen los jugadores..." />
            <Input label="Peculiaridad / Manierismo" value={form.quirks} onChange={set("quirks")} placeholder="Un tic, costumbre o detalle memorable..." />
            <Input label="Notas de voz / Acento" value={form.voiceNotes} onChange={set("voiceNotes")} placeholder="Cómo habla, tono, expresiones características..." />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/${slug}/npcs`}>
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={saving || !campaignId}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear NPC
          </Button>
        </div>
      </form>
    </div>
  );
}
