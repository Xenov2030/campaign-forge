"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/components/ui/tag-picker";
import { ImageCropUpload } from "@/components/ui/image-crop-upload";

interface StatEntry { name: string; description: string }

export interface MonsterFormValues {
  name: string;
  type: string;
  size: string;
  alignment: string;
  challengeRating: string;
  hitPoints: string;
  armorClass: string;
  speed: { walk: string; fly: string; swim: string; climb: string; burrow: string };
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  skills: Record<string, number>;
  senses: { darkvision: string; blindsight: string; tremorsense: string; truesight: string; passivePerception: string };
  languages: string;
  abilities: StatEntry[];
  actions: StatEntry[];
  reactions: StatEntry[];
  legendaryActions: StatEntry[];
  lore: string;
  imageUrl: string;
  tags: string[];
}

export const MONSTER_TAGS = [
  // Disposición
  { value: "amigable",      label: "Amigable",      color: "#34d399" },
  { value: "neutral",       label: "Neutral",        color: "#94a3b8" },
  { value: "hostil",        label: "Hostil",         color: "#f59e0b" },
  { value: "legendario",    label: "Legendario",     color: "#c9a84c" },
  { value: "jefe",          label: "Jefe",           color: "#c9a84c" },
  // Tipo
  { value: "dragón",        label: "Dragón",         color: "#f87171" },
  { value: "bestia",        label: "Bestia",         color: "#a3e635" },
  { value: "humanoide",     label: "Humanoide",      color: "#60a5fa" },
  { value: "no-muerto",     label: "No-muerto",      color: "#a855f7" },
  { value: "feérico",       label: "Feérico",        color: "#ec4899" },
  { value: "céleste",       label: "Céleste",        color: "#fde68a" },
  { value: "demonio",       label: "Demonio",        color: "#ef4444" },
  { value: "elemental",     label: "Elemental",      color: "#22d3ee" },
  { value: "constructo",    label: "Constructo",     color: "#a8a29e" },
  { value: "planta",        label: "Planta",         color: "#4ade80" },
  { value: "aberración",    label: "Aberración",     color: "#6366f1" },
  { value: "monstruosidad", label: "Monstruosidad",  color: "#fb923c" },
];

const EMPTY: MonsterFormValues = {
  name: "", type: "", size: "Mediano", alignment: "",
  challengeRating: "", hitPoints: "", armorClass: "",
  speed: { walk: "30 pies", fly: "", swim: "", climb: "", burrow: "" },
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  skills: {},
  senses: { darkvision: "", blindsight: "", tremorsense: "", truesight: "", passivePerception: "" },
  languages: "",
  abilities: [], actions: [], reactions: [], legendaryActions: [],
  lore: "", imageUrl: "", tags: [],
};

const SIZES = ["Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gigantesco", "Colosal"];
const TYPES = ["Bestia", "Humanoide", "No-muerto", "Monstruosidad", "Dragón", "Céleste", "Feérico", "Demonio", "Diablo", "Gigante", "Elemental", "Constructo", "Planta", "Aberración"];
const ALIGNMENTS = ["Legal bueno", "Neutral bueno", "Caótico bueno", "Legal neutral", "Neutral", "Caótico neutral", "Legal malvado", "Neutral malvado", "Caótico malvado", "Sin alineamiento"];

const DND_SKILLS = [
  "Acrobacias", "Atletismo", "Engaño", "Furtividad", "Historia", "Intimidación",
  "Intuición", "Investigación", "Medicina", "Naturaleza", "Percepción", "Persuasión",
  "Prestidigitación", "Religión", "Supervivencia", "Trato con animales",
];

const STAT_KEYS: (keyof MonsterFormValues["stats"])[] = ["str", "dex", "con", "int", "wis", "cha"];
const STAT_LABELS: Record<string, string> = { str: "FUE", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR" };

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const selectClass = "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 px-3 rounded-[var(--radius-md)] text-sm hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors";
const numInputClass = "w-full text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors";

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors">
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">{title}</h2>
        {open ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-[var(--border-subtle)]">{children}</div>}
    </div>
  );
}

function EntryList({ label, items, onChange }: { label: string; items: StatEntry[]; onChange: (items: StatEntry[]) => void }) {
  const add = () => onChange([...items, { name: "", description: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof StatEntry, val: string) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 hover:bg-[var(--accent-gold)]/20 transition-colors">
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center py-3">Sin {label.toLowerCase()} todavía.</p>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input value={item.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Nombre" maxLength={100} className="flex-1" />
              <button type="button" onClick={() => remove(i)} className="h-9 w-9 shrink-0 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea value={item.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Descripción..." rows={2} maxLength={2000} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  slug: string;
  mode: "create" | "edit";
  campaignId?: string;
  monsterId?: string;
  initial?: Partial<MonsterFormValues>;
}

export function MonsterForm({ slug, mode, campaignId, monsterId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<MonsterFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState({ basic: true, stats: true, speed: false, skills: false, senses: false, traits: true, lore: false });

  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] as boolean }));
  const setField = <K extends keyof MonsterFormValues>(k: K, v: MonsterFormValues[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const noScroll = (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        ...form,
        ...(mode === "create" ? { campaignId } : {}),
        armorClass: form.armorClass ? parseInt(form.armorClass) : null,
        senses: {
          ...form.senses,
          passivePerception: form.senses.passivePerception ? parseInt(form.senses.passivePerception) : undefined,
        },
      };
      const res = await fetch(
        mode === "create" ? "/api/monsters" : `/api/monsters/${monsterId}`,
        { method: mode === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await res.json() as { monster?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      const id = mode === "create" ? data.monster!.id : monsterId;
      toast.success(mode === "create" ? "Monstruo creado" : "Monstruo actualizado");
      router.push(`/${slug}/monsters/${id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Básico + imagen */}
      <Section title="Información básica" open={open.basic} onToggle={() => toggle("basic")}>
        <div className="pt-5 flex flex-col sm:flex-row gap-6">
          {/* Imagen lateral */}
          <ImageCropUpload
            value={form.imageUrl}
            onChange={(url) => setField("imageUrl", url)}
            folder="monsters"
            label="Imagen"
            aspect="portrait"
            className="w-36 shrink-0"
          />
          {/* Campos */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.name} onChange={(e) => { setField("name", e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }} placeholder="Dragón rojo anciano" required maxLength={100} error={errors.name} className="sm:col-span-2" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tipo</label>
              <select className={selectClass} value={form.type} onChange={(e) => setField("type", e.target.value)}>
                <option value="">— Seleccionar —</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tamaño</label>
              <select className={selectClass} value={form.size} onChange={(e) => setField("size", e.target.value)}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Alineamiento</label>
              <select className={selectClass} value={form.alignment} onChange={(e) => setField("alignment", e.target.value)}>
                <option value="">— Seleccionar —</option>
                {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <Input label="Desafío (CR)" value={form.challengeRating} onChange={(e) => setField("challengeRating", e.target.value)} placeholder="5, 1/2, 1/4..." maxLength={20} />
            <Input label="Puntos de vida" value={form.hitPoints} onChange={(e) => setField("hitPoints", e.target.value)} placeholder="52 (8d10+8)" maxLength={50} />
            <Input
              label="Clase de armadura"
              type="number" min={0} max={30}
              value={form.armorClass}
              onChange={(e) => setField("armorClass", e.target.value)}
              onWheel={noScroll}
              placeholder="17"
            />
            <Input label="Idiomas" value={form.languages} onChange={(e) => setField("languages", e.target.value)} placeholder="Común, Dracónico" maxLength={200} className="sm:col-span-2" />
            <TagPicker
              label="Categorías"
              value={form.tags}
              onChange={(tags) => setField("tags", tags)}
              options={MONSTER_TAGS}
              className="sm:col-span-2"
            />
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section title="Puntuaciones de característica" open={open.stats} onToggle={() => toggle("stats")}>
        <div className="pt-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STAT_KEYS.map((key) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <label className="text-xs font-bold text-[var(--accent-gold)] uppercase">{STAT_LABELS[key]}</label>
              <input
                type="number" min={1} max={30}
                value={form.stats[key]}
                onChange={(e) => setField("stats", { ...form.stats, [key]: Math.min(30, Math.max(1, parseInt(e.target.value) || 10)) })}
                onWheel={noScroll}
                className={numInputClass}
              />
              <span className="text-xs text-[var(--text-muted)]">{mod(form.stats[key])}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Velocidad */}
      <Section title="Velocidad" open={open.speed} onToggle={() => toggle("speed")}>
        <div className="pt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(["walk", "fly", "swim", "climb", "burrow"] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                {k === "walk" ? "Caminando" : k === "fly" ? "Volando" : k === "swim" ? "Nadando" : k === "climb" ? "Trepando" : "Excavando"}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number" min={0} max={99}
                  value={form.speed[k] ? parseInt(form.speed[k]) || "" : ""}
                  onChange={(e) => {
                    const n = Math.min(99, Math.max(0, parseInt(e.target.value) || 0));
                    setField("speed", { ...form.speed, [k]: e.target.value === "" ? "" : `${n} pies` });
                  }}
                  onWheel={noScroll}
                  placeholder="30"
                  className="w-20 text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 rounded-l-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
                <span className="h-10 flex items-center px-2 bg-[var(--bg-elevated)] border border-l-0 border-[var(--border-default)] rounded-r-[var(--radius-md)] text-xs text-[var(--text-muted)]">pies</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title="Habilidades con competencia" open={open.skills} onToggle={() => toggle("skills")}>
        <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DND_SKILLS.map((skill) => {
            const val = form.skills[skill];
            return (
              <div key={skill} className="flex items-center gap-2">
                <label className="text-xs text-[var(--text-secondary)] flex-1 min-w-0 truncate">{skill}</label>
                <input
                  type="number" min={-9} max={99}
                  value={val ?? ""}
                  onChange={(e) => {
                    const n = parseInt(e.target.value);
                    const next = { ...form.skills };
                    if (isNaN(n) || e.target.value === "") { delete next[skill]; }
                    else next[skill] = Math.min(99, Math.max(-9, n));
                    setField("skills", next);
                  }}
                  onWheel={noScroll}
                  placeholder="—"
                  className="w-14 text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-8 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Sentidos */}
      <Section title="Sentidos" open={open.senses} onToggle={() => toggle("senses")}>
        <div className="pt-5 grid grid-cols-2 gap-4">
          <Input label="Visión en la oscuridad" value={form.senses.darkvision} onChange={(e) => setField("senses", { ...form.senses, darkvision: e.target.value })} placeholder="60 pies" maxLength={50} />
          <Input label="Vista ciega" value={form.senses.blindsight} onChange={(e) => setField("senses", { ...form.senses, blindsight: e.target.value })} placeholder="30 pies" maxLength={50} />
          <Input label="Sentido sísmico" value={form.senses.tremorsense} onChange={(e) => setField("senses", { ...form.senses, tremorsense: e.target.value })} placeholder="60 pies" maxLength={50} />
          <Input label="Visión verdadera" value={form.senses.truesight} onChange={(e) => setField("senses", { ...form.senses, truesight: e.target.value })} placeholder="120 pies" maxLength={50} />
          <Input
            label="Percepción pasiva"
            type="number" min={0} max={99}
            value={form.senses.passivePerception}
            onChange={(e) => setField("senses", { ...form.senses, passivePerception: e.target.value })}
            onWheel={noScroll}
            placeholder="12"
          />
        </div>
      </Section>

      {/* Rasgos y acciones */}
      <Section title="Rasgos, acciones y reacciones" open={open.traits} onToggle={() => toggle("traits")}>
        <EntryList label="Rasgos" items={form.abilities} onChange={(v) => setField("abilities", v)} />
        <EntryList label="Acciones" items={form.actions} onChange={(v) => setField("actions", v)} />
        <EntryList label="Reacciones" items={form.reactions} onChange={(v) => setField("reactions", v)} />
        <EntryList label="Acciones legendarias" items={form.legendaryActions} onChange={(v) => setField("legendaryActions", v)} />
      </Section>

      {/* Lore */}
      <Section title="Trasfondo y lore" open={open.lore} onToggle={() => toggle("lore")}>
        <div className="pt-5">
          <Textarea label="Trasfondo" value={form.lore} onChange={(e) => setField("lore", e.target.value)} rows={5} maxLength={4000} placeholder="Historia, origen, motivaciones del monstruo..." />
        </div>
      </Section>

      <div className="flex justify-end gap-3 pb-8">
        <button type="button" onClick={() => router.back()} className="h-10 px-5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
          Cancelar
        </button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Crear monstruo" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
