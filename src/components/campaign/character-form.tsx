"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

const CLASSES = ["Bárbaro","Bardo","Clérigo","Druida","Explorador","Guerrero","Hechicero","Mago","Monje","Nigromante","Paladín","Pícaro","Warlock","Personalizado"];
const ALIGNMENTS = ["Legal Bueno","Neutral Bueno","Caótico Bueno","Legal Neutral","Neutral Verdadero","Caótico Neutral","Legal Malvado","Neutral Malvado","Caótico Malvado"];

export interface CharacterFormState {
  name: string;
  race: string;
  className: string;
  subclass: string;
  level: number;
  background: string;
  alignment: string;
  appearance: string;
  backstory: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  hitPoints: number;
  armorClass: number;
  speed: number;
}

const DEFAULT_FORM: CharacterFormState = {
  name: "", race: "", className: "", subclass: "", level: 1,
  background: "", alignment: "", appearance: "", backstory: "",
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  hitPoints: 10, armorClass: 10, speed: 30,
};

interface StatInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function StatInput({ label, value, onChange }: StatInputProps) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-3 border border-[var(--border-subtle)]">
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
      <input
        type="number"
        min={1}
        max={30}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 10)))}
        className="w-14 text-center font-display text-2xl font-black text-[var(--text-primary)] bg-transparent border-b-2 border-[var(--accent-gold)]/40 focus:border-[var(--accent-gold)] focus:outline-none transition-colors"
      />
      <p className={`text-sm font-bold ${mod >= 0 ? "text-green-400" : "text-red-400"}`}>
        {mod >= 0 ? "+" : ""}{mod}
      </p>
    </div>
  );
}

interface CharacterFormProps {
  slug: string;
  mode: "create" | "edit";
  campaignId?: string;
  characterId?: string;
  initial?: Partial<CharacterFormState> & { portraitUrl?: string };
}

export function CharacterForm({ slug, mode, campaignId: campaignIdProp, characterId, initial }: CharacterFormProps) {
  const router = useRouter();

  const [campaignId, setCampaignId] = useState<string | null>(campaignIdProp ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState(initial?.portraitUrl ?? "");

  const [form, setForm] = useState<CharacterFormState>(() => {
    if (mode === "edit" && initial) {
      const { portraitUrl, ...rest } = initial;
      void portraitUrl;
      return { ...DEFAULT_FORM, ...rest };
    }
    return { ...DEFAULT_FORM };
  });

  const set = (field: keyof CharacterFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const setNum = (field: keyof CharacterFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: parseInt(e.target.value) || 0 }));

  useEffect(() => {
    if (mode !== "create" || campaignIdProp) return;
    fetch(`/api/campaigns/by-slug/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setCampaignId(d.id); });
  }, [slug, mode, campaignIdProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "edit") {
        if (!characterId) return;
        const { hitPoints, ...restForm } = form;
        const res = await fetch(`/api/characters/${characterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...restForm, maxHitPoints: hitPoints, portraitUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push(`/${slug}/characters/${characterId}`);
        router.refresh();
      } else {
        if (!campaignId) return;
        const res = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, campaignId, portraitUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push(`/${slug}/characters/${data.character.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar personaje");
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving || (mode === "create" && !campaignId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Portrait + básico */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Información básica</h2>
        <div className="flex gap-6">
          <ImageUpload
            value={portraitUrl}
            onChange={setPortraitUrl}
            folder="portraits"
            label="Retrato del personaje"
            aspectRatio="portrait"
            className="w-36 shrink-0"
          />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.name} onChange={set("name")} placeholder="Thorin Escudoderoble" required className="col-span-2" />
            <Input label="Raza" value={form.race} onChange={set("race")} placeholder="Enano, Élfo, Humano..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Clase</label>
              <select
                value={form.className}
                onChange={set("className")}
                className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              >
                <option value="">Selecciona clase</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Subclase" value={form.subclass} onChange={set("subclass")} placeholder="Camino del Berserker..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Nivel</label>
              <input
                type="number" min={1} max={20} value={form.level}
                onChange={setNum("level")}
                className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>
            <Input label="Trasfondo" value={form.background} onChange={set("background")} placeholder="Soldado, Noble, Forajido..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Alineamiento</label>
              <select
                value={form.alignment}
                onChange={set("alignment")}
                className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              >
                <option value="">Seleccionar...</option>
                {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Atributos */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2">Estadísticas</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">Puntuaciones de habilidad — el modificador se calcula automáticamente</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {(["str", "dex", "con", "int", "wis", "cha"] as const).map((stat) => (
            <StatInput
              key={stat}
              label={stat.toUpperCase()}
              value={form[stat]}
              onChange={(v) => setForm((p) => ({ ...p, [stat]: v }))}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Puntos de golpe</label>
            <input type="number" min={1} value={form.hitPoints} onChange={setNum("hitPoints")}
              className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Clase de armadura</label>
            <input type="number" min={1} value={form.armorClass} onChange={setNum("armorClass")}
              className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Velocidad (pies)</label>
            <input type="number" min={0} step={5} value={form.speed} onChange={setNum("speed")}
              className="h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors" />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-5">Descripción e historia</h2>
        <div className="space-y-4">
          <Textarea label="Apariencia física" value={form.appearance} onChange={set("appearance")} rows={3} placeholder="Describe el aspecto de tu personaje..." />
          <Textarea label="Historia / Trasfondo" value={form.backstory} onChange={set("backstory")} rows={5} placeholder="¿De dónde viene? ¿Qué le llevó a la aventura? ¿Qué motivaciones tiene?..." />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pb-8">
        <Link href={mode === "edit" && characterId ? `/${slug}/characters/${characterId}` : `/${slug}/characters`}>
          <Button variant="ghost" type="button">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={disabled}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "edit" ? "Guardar cambios" : "Crear personaje"}
        </Button>
      </div>
    </form>
  );
}
