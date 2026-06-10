"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Eye, EyeOff, Heart, Skull } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropUpload } from "@/components/ui/image-crop-upload";

export interface NpcFormValues {
  name: string;
  nickname: string;
  race: string;
  occupation: string;
  age: string;
  gender: string;
  appearance: string;
  personality: string;
  backstory: string;
  motivations: string;
  secrets: string;
  quirks: string;
  voiceNotes: string;
  location: string;
  faction: string;
  isKnownToParty: boolean;
  isAlive: boolean;
  hitPoints: number | null;
  maxHitPoints: number | null;
  portraitUrl: string;
  tags: string[];
}

export const EMPTY_NPC: NpcFormValues = {
  name: "", nickname: "", race: "", occupation: "", age: "", gender: "",
  appearance: "", personality: "", backstory: "",
  motivations: "", secrets: "", quirks: "", voiceNotes: "",
  location: "", faction: "",
  isKnownToParty: false, isAlive: true,
  hitPoints: null, maxHitPoints: null,
  portraitUrl: "", tags: [],
};

interface Props {
  slug: string;
  mode: "create" | "edit";
  /** Requerido en create. */
  campaignId?: string;
  /** Requerido en edit. */
  npcId?: string;
  initial?: NpcFormValues;
}

export function NpcForm({ slug, mode, campaignId, npcId, initial }: Props) {
  const router = useRouter();
  const base = initial ?? EMPTY_NPC;

  const [form, setForm] = useState<NpcFormValues>(base);
  const [tagsInput, setTagsInput] = useState(base.tags.join(", "));
  const [saving, setSaving] = useState(false);

  const set = (field: keyof NpcFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const setNum = (field: "hitPoints" | "maxHitPoints") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { ...form, tags, ...(mode === "create" ? { campaignId } : {}) };
      const res = await fetch(mode === "create" ? "/api/npcs" : `/api/npcs/${npcId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = mode === "create" ? data.npc.id : npcId;
      toast.success(mode === "create" ? "NPC creado" : "NPC actualizado");
      router.push(`/${slug}/npcs/${id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el NPC");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Portrait + básico */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Información básica</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <ImageCropUpload
            value={form.portraitUrl}
            onChange={(url) => setForm((p) => ({ ...p, portraitUrl: url }))}
            folder="npcs"
            label="Retrato del NPC"
            aspect="portrait"
            className="w-36 shrink-0"
          />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.name} onChange={set("name")} placeholder="Nombre del NPC" required />
            <Input label="Apodo" value={form.nickname} onChange={set("nickname")} placeholder="El Tuerto, La Sombra..." />
            <Input label="Raza" value={form.race} onChange={set("race")} placeholder="Humano, Elfo..." />
            <Input label="Ocupación / Rol" value={form.occupation} onChange={set("occupation")} placeholder="Tabernero, Guardia real..." />
            <Input label="Edad" value={form.age} onChange={set("age")} placeholder="35 años, anciano..." />
            <Input label="Género" value={form.gender} onChange={set("gender")} placeholder="Masculino, Femenino..." />
            <Input label="Localización" value={form.location} onChange={set("location")} placeholder="Ciudad de Puertallamas..." />
            <Input label="Facción" value={form.faction} onChange={set("faction")} placeholder="Gremio de Ladrones..." />
            <Input label="Tags (separados por coma)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="villano, mercader, místico" className="sm:col-span-2" />

            {/* Toggles de estado */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isKnownToParty: !p.isKnownToParty }))}
                aria-pressed={form.isKnownToParty}
                className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors text-left text-sm"
              >
                {form.isKnownToParty
                  ? <Eye className="h-4 w-4 text-green-400 shrink-0" />
                  : <EyeOff className="h-4 w-4 text-[var(--text-muted)] shrink-0" />}
                <span className="text-[var(--text-primary)]">
                  {form.isKnownToParty ? "Conocido por el grupo" : "Oculto a los jugadores"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isAlive: !p.isAlive }))}
                aria-pressed={form.isAlive}
                className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors text-left text-sm"
              >
                {form.isAlive
                  ? <Heart className="h-4 w-4 text-green-400 shrink-0" />
                  : <Skull className="h-4 w-4 text-red-400 shrink-0" />}
                <span className="text-[var(--text-primary)]">{form.isAlive ? "Vivo" : "Muerto"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personalidad */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Personalidad e historia</h2>
        <div className="space-y-4">
          <Textarea label="Historia" value={form.backstory} onChange={set("backstory")} rows={4} placeholder="Trasfondo e historia del personaje..." />
          <Textarea label="Personalidad" value={form.personality} onChange={set("personality")} rows={3} placeholder="Cómo se comporta, qué rasgos lo definen..." />
          <Textarea label="Apariencia física" value={form.appearance} onChange={set("appearance")} rows={2} placeholder="Describe cómo se ve este personaje..." />
        </div>
      </div>

      {/* Secretos (solo máster) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">Notas del máster</h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">Esta información solo la verás tú como máster</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Puntos de vida (actuales)" type="number" min={0} value={form.hitPoints ?? ""} onChange={setNum("hitPoints")} placeholder="Ej: 25" />
            <Input label="Puntos de vida (máximo)" type="number" min={0} value={form.maxHitPoints ?? ""} onChange={setNum("maxHitPoints")} placeholder="Ej: 25" />
          </div>
          <Textarea label="Motivaciones" value={form.motivations} onChange={set("motivations")} rows={2} placeholder="Qué quiere este personaje y por qué..." />
          <Textarea label="Secretos" value={form.secrets} onChange={set("secrets")} rows={2} placeholder="Información oculta que no conocen los jugadores..." />
          <Input label="Peculiaridad / Manierismo" value={form.quirks} onChange={set("quirks")} placeholder="Un tic, costumbre o detalle memorable..." />
          <Input label="Notas de voz / Acento" value={form.voiceNotes} onChange={set("voiceNotes")} placeholder="Cómo habla, tono, expresiones características..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end pb-8">
        <Link href={mode === "edit" && npcId ? `/${slug}/npcs/${npcId}` : `/${slug}/npcs`}>
          <Button variant="ghost" type="button">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={saving || (mode === "create" && !campaignId)}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Crear NPC" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
