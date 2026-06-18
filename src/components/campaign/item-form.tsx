"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Eye, EyeOff, Sparkles, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { ItemRarity } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropUpload } from "@/components/ui/image-crop-upload";
import { ITEM_RARITIES, ITEM_RARITY_LABELS, MISSION_REWARD_TAG } from "@/lib/items";
import { z } from "zod";

const ItemSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
});

export interface ItemFormValues {
  name: string;
  type: string;
  rarity: ItemRarity;
  description: string;
  lore: string;
  isArtifact: boolean;
  requiresAttunement: boolean;
  isKnownToParty: boolean;
  missionReward: boolean;
  imageUrl: string;
  tags: string[];
}

export const EMPTY_ITEM: ItemFormValues = {
  name: "", type: "", rarity: "COMMON",
  description: "", lore: "",
  isArtifact: false, requiresAttunement: false, isKnownToParty: false, missionReward: false,
  imageUrl: "", tags: [],
};

import { selectClass } from "@/lib/form-styles";

interface Props {
  slug: string;
  mode: "create" | "edit";
  campaignId?: string;
  itemId?: string;
  initial?: ItemFormValues;
}

export function ItemForm({ slug, mode, campaignId, itemId, initial }: Props) {
  const router = useRouter();
  const base = initial ?? EMPTY_ITEM;
  const [form, setForm] = useState<ItemFormValues>(base);
  const [tagsInput, setTagsInput] = useState(base.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (field: "isArtifact" | "requiresAttunement" | "isKnownToParty" | "missionReward") =>
    setForm((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = ItemSchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      // Los tags libres del usuario + el tag de control de "recompensa de misión".
      const userTags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t && t !== MISSION_REWARD_TAG);
      const tags = form.missionReward ? [...userTags, MISSION_REWARD_TAG] : userTags;
      const payload = { ...form, tags, ...(mode === "create" ? { campaignId } : {}) };
      const res = await fetch(mode === "create" ? "/api/items" : `/api/items/${itemId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = mode === "create" ? data.item.id : itemId;
      toast.success(mode === "create" ? "Objeto creado" : "Objeto actualizado");
      router.push(`/${slug}/items/${id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el objeto");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Básico */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Información básica</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <ImageCropUpload
            value={form.imageUrl}
            onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
            folder="items"
            label="Imagen del objeto"
            aspect="square"
            className="w-32 shrink-0"
          />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }} placeholder="Espada de las Brasas" required maxLength={100} error={errors.name} className="sm:col-span-2" />
            <Input label="Tipo" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} placeholder="Arma, Armadura, Poción..." maxLength={100} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Rareza</label>
              <select className={selectClass} value={form.rarity} onChange={(e) => setForm((p) => ({ ...p, rarity: e.target.value as ItemRarity }))}>
                {ITEM_RARITIES.map((r) => (
                  <option key={r} value={r}>{ITEM_RARITY_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <Input label="Tags (separados por coma)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="mágico, maldito, único" maxLength={200} className="sm:col-span-2" />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <Textarea label="Descripción" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} maxLength={4000} placeholder="Qué hace el objeto, propiedades, daño..." />
        <Textarea label="Historia / Lore" value={form.lore} onChange={(e) => setForm((p) => ({ ...p, lore: e.target.value }))} rows={3} maxLength={4000} placeholder="Origen e historia del objeto..." />
      </div>

      {/* Propiedades y estado */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">Propiedades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToggleRow active={form.isArtifact} onClick={() => toggle("isArtifact")} icon={<Sparkles className="h-4 w-4" />} label="Es un artefacto" />
          <ToggleRow active={form.requiresAttunement} onClick={() => toggle("requiresAttunement")} icon={<Link2 className="h-4 w-4" />} label="Requiere sintonización" />
          <ToggleRow
            active={form.isKnownToParty}
            onClick={() => toggle("isKnownToParty")}
            icon={form.isKnownToParty ? <Eye className="h-4 w-4 text-green-400" /> : <EyeOff className="h-4 w-4" />}
            label={form.isKnownToParty ? "Visible para el grupo" : "Oculto a los jugadores"}
          />
          <ToggleRow active={form.missionReward} onClick={() => toggle("missionReward")} icon={<Sparkles className="h-4 w-4" />} label="Disponible como recompensa de misión" />
        </div>
      </div>

      <div className="flex gap-3 justify-end pb-8">
        <Link href={mode === "edit" && itemId ? `/${slug}/items/${itemId}` : `/${slug}/items`}>
          <Button variant="ghost" type="button">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={saving || (mode === "create" && !campaignId)}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Crear objeto" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 p-3 rounded-[var(--radius-md)] border transition-colors text-left text-sm ${
        active
          ? "border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 text-[var(--text-primary)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-default)]"
      }`}
    >
      <span className={active ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"}>{icon}</span>
      {label}
    </button>
  );
}
