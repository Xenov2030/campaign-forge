"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Plus, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { QuestType, QuestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/components/ui/tag-picker";
import {
  QUEST_TYPE_OPTIONS,
  QUEST_STATUSES,
  QUEST_TYPE_LABELS,
  QUEST_STATUS_LABELS,
  newObjectiveId,
  type QuestObjective,
  type QuestRewards,
} from "@/lib/quests";

export interface QuestFormValues {
  name: string;
  type: QuestType;
  status: QuestStatus;
  description: string;
  hook: string;
  notes: string;
  isKnownToParty: boolean;
  deadline: string;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  tags: string[];
}

export const EMPTY_QUEST: QuestFormValues = {
  name: "", type: "MAIN", status: "ACTIVE",
  description: "", hook: "", notes: "",
  isKnownToParty: true,
  deadline: "",
  objectives: [],
  rewards: { experience: null, gold: "", other: "", itemId: null },
  tags: [],
};

const selectClass =
  "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 px-3 rounded-[var(--radius-md)] text-sm hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors";

interface Props {
  slug: string;
  mode: "create" | "edit";
  campaignId?: string;
  questId?: string;
  initial?: QuestFormValues;
}

const QUEST_TAGS = [
  { value: "urgente",    label: "Urgente",    color: "#f87171" },
  { value: "principal",  label: "Principal",  color: "#c9a84c" },
  { value: "secundaria", label: "Secundaria", color: "#60a5fa" },
  { value: "política",   label: "Política",   color: "#a855f7" },
  { value: "mazmorra",   label: "Mazmorra",   color: "#f59e0b" },
  { value: "misterio",   label: "Misterio",   color: "#22d3ee" },
  { value: "rescate",    label: "Rescate",    color: "#34d399" },
  { value: "escolta",    label: "Escolta",    color: "#2dd4bf" },
  { value: "exploración",label: "Exploración",color: "#94a3b8" },
];

export function QuestForm({ slug, mode, campaignId, questId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<QuestFormValues>(initial ?? EMPTY_QUEST);
  const [saving, setSaving] = useState(false);
  const [rewardItems, setRewardItems] = useState<{ id: string; name: string }[]>([]);

  // Objetos marcados como "Objeto de misión" para ofrecer como recompensa.
  useEffect(() => {
    if (!campaignId) return;
    fetch(`/api/items?campaignId=${campaignId}&tag=${encodeURIComponent("Objeto de misión")}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setRewardItems(d.items ?? []))
      .catch(() => {});
  }, [campaignId]);

  const addObjective = () =>
    setForm((p) => ({
      ...p,
      objectives: [...p.objectives, { id: newObjectiveId(), description: "", isOptional: false, completed: false }],
    }));

  const updateObjective = (id: string, patch: Partial<QuestObjective>) =>
    setForm((p) => ({
      ...p,
      objectives: p.objectives.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));

  const removeObjective = (id: string) =>
    setForm((p) => ({ ...p, objectives: p.objectives.filter((o) => o.id !== id) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const objectives = form.objectives.filter((o) => o.description.trim() !== "");
      const payload = { ...form, objectives, deadline: form.deadline || null, ...(mode === "create" ? { campaignId } : {}) };
      const res = await fetch(mode === "create" ? "/api/quests" : `/api/quests/${questId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = mode === "create" ? data.quest.id : questId;
      toast.success(mode === "create" ? "Misión creada" : "Misión actualizada");
      router.push(`/${slug}/quests/${id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar la misión");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Básico */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <Input label="Nombre *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="La reliquia perdida" required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tipo</label>
            <select className={selectClass} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as QuestType }))}>
              {QUEST_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{QUEST_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Estado</label>
            <select className={selectClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as QuestStatus }))}>
              {QUEST_STATUSES.map((s) => (
                <option key={s} value={s}>{QUEST_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Fecha límite (opcional)
          </label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            className={selectClass}
          />
        </div>

        <Textarea label="Descripción" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="De qué trata la misión..." />
        <Textarea label="Gancho (cómo se presenta a los jugadores)" value={form.hook} onChange={(e) => setForm((p) => ({ ...p, hook: e.target.value }))} rows={2} placeholder="Un mensajero llega con un sello real..." />
        <TagPicker
          label="Categorías"
          value={form.tags}
          onChange={(tags) => setForm((p) => ({ ...p, tags }))}
          options={QUEST_TAGS}
        />

        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, isKnownToParty: !p.isKnownToParty }))}
          aria-pressed={form.isKnownToParty}
          className="w-full flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors text-left text-sm"
        >
          {form.isKnownToParty ? <Eye className="h-4 w-4 text-green-400 shrink-0" /> : <EyeOff className="h-4 w-4 text-[var(--text-muted)] shrink-0" />}
          <span className="text-[var(--text-primary)]">{form.isKnownToParty ? "Visible para el grupo" : "Oculta a los jugadores"}</span>
        </button>
      </div>

      {/* Objetivos */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Objetivos</h2>
          <button type="button" onClick={addObjective} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-xs font-medium bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/25 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
        {form.objectives.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin objetivos todavía. Agregá el primero.</p>
        ) : (
          <div className="space-y-2">
            {form.objectives.map((o) => (
              <div key={o.id} className="flex items-center gap-2">
                <Input value={o.description} onChange={(e) => updateObjective(o.id, { description: e.target.value })} placeholder="Describe el objetivo..." className="flex-1" />
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] shrink-0 cursor-pointer select-none px-2">
                  <input type="checkbox" checked={o.isOptional} onChange={(e) => updateObjective(o.id, { isOptional: e.target.checked })} className="h-4 w-4 accent-[var(--accent-gold)]" />
                  Opcional
                </label>
                <button type="button" onClick={() => removeObjective(o.id)} aria-label="Quitar objetivo" className="h-9 w-9 shrink-0 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-crimson)] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recompensas */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">Recompensas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Experiencia" type="number" min={0} value={form.rewards.experience ?? ""} onChange={(e) => setForm((p) => ({ ...p, rewards: { ...p.rewards, experience: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) } }))} placeholder="500" />
          <Input label="Oro / monedas" value={form.rewards.gold} onChange={(e) => setForm((p) => ({ ...p, rewards: { ...p.rewards, gold: e.target.value } }))} placeholder="100 monedas de oro" />
          <Input label="Otras recompensas" value={form.rewards.other} onChange={(e) => setForm((p) => ({ ...p, rewards: { ...p.rewards, other: e.target.value } }))} placeholder="Favor del gremio" />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Objeto de recompensa</label>
          <select
            className={selectClass}
            value={form.rewards.itemId ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, rewards: { ...p.rewards, itemId: e.target.value || null } }))}
          >
            <option value="">Ninguno</option>
            {rewardItems.map((it) => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>
          <p className="text-xs text-[var(--text-muted)]">
            {rewardItems.length === 0
              ? "No hay objetos disponibles. Marcá un objeto como “recompensa de misión” en la sección Objetos."
              : "Objetos marcados como recompensa de misión en la sección Objetos."}
          </p>
        </div>
      </div>

      {/* Notas del máster */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">Notas del máster</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">Esta información solo la verás tú como máster</p>
        <Textarea label="Notas" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Giros, secretos, conexiones con otras tramas..." />
      </div>

      <div className="flex gap-3 justify-end pb-8">
        <Link href={mode === "edit" && questId ? `/${slug}/quests/${questId}` : `/${slug}/quests`}>
          <Button variant="ghost" type="button">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={saving || (mode === "create" && !campaignId)}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Crear misión" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
