"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getThemeColors } from "@/lib/utils";

const MAX_NAME = 60;
const MAX_DESC = 500;

const STEPS = [
  { n: 1, title: "Información básica", desc: "Nombre y visibilidad" },
  { n: 2, title: "Tema y tono", desc: "Estética y narrativa" },
  { n: 3, title: "Sistema de juego", desc: "Mecánicas combinables" },
];

const THEMES = [
  {
    id: "FANTASY",
    label: "Fantasía Medieval",
    emoji: "⚔️",
    desc: "Espadas, magia y dragones",
  },
  {
    id: "HORROR",
    label: "Horror Lovecraftiano",
    emoji: "🐙",
    desc: "Cósmico, oscuro y perturbador",
  },
  {
    id: "SCIFI",
    label: "Ciencia Ficción",
    emoji: "🚀",
    desc: "Espacio, tecnología y alienígenas",
  },
  {
    id: "GRIMDARK",
    label: "Grimdark",
    emoji: "💀",
    desc: "Mundo brutal y moralmente ambiguo",
  },
  {
    id: "STEAMPUNK",
    label: "Steampunk",
    emoji: "⚙️",
    desc: "Vapor, engranajes y victoriano",
  },
  {
    id: "POSTAPOCALYPTIC",
    label: "Post-Apocalíptico",
    emoji: "☢️",
    desc: "Supervivencia entre las ruinas",
  },
  {
    id: "MODERN",
    label: "Contemporáneo",
    emoji: "🌆",
    desc: "Mundo moderno con elementos sobrenaturales",
  },
  {
    id: "CUSTOM",
    label: "Personalizado",
    emoji: "✨",
    desc: "Crea tu propia ambientación",
  },
];

const TONES = [
  {
    id: "EPIC",
    label: "Épico",
    emoji: "🏆",
    desc: "Grandes gestas y héroes legendarios",
  },
  {
    id: "DARK",
    label: "Oscuro / Grimdark",
    emoji: "🌑",
    desc: "Brutal y moralmente ambiguo",
  },
  {
    id: "HEROIC",
    label: "Heroico",
    emoji: "🛡️",
    desc: "El bien contra el mal, esperanza",
  },
  {
    id: "COMEDIC",
    label: "Cómico",
    emoji: "🎭",
    desc: "Humor, ligereza y absurdo",
  },
  {
    id: "POLITICAL",
    label: "Político / Intriga",
    emoji: "♟️",
    desc: "Alianzas, traiciones y poder",
  },
  {
    id: "MYSTERY",
    label: "Misterio",
    emoji: "🔍",
    desc: "Pistas, secretos e investigación",
  },
  {
    id: "SURVIVAL",
    label: "Supervivencia",
    emoji: "🔥",
    desc: "Recursos escasos, tensión constante",
  },
  {
    id: "ROMANTIC",
    label: "Romántico",
    emoji: "💗",
    desc: "Vínculos, drama y emociones",
  },
];

const SYSTEMS = [
  {
    id: "DND5E",
    label: "D&D 5ª Edición",
    desc: "El estándar del rol de fantasía",
  },
  {
    id: "PATHFINDER2E",
    label: "Pathfinder 2e",
    desc: "Sistema de acciones, alta complejidad",
  },
  {
    id: "CALL_OF_CTHULHU",
    label: "Call of Cthulhu",
    desc: "Horror cósmico, cordura y misterio",
  },
  {
    id: "VAMPIRE_MASQUERADE",
    label: "Vampiro: La Mascarada",
    desc: "Política, clanes y oscuridad urbana",
  },
  { id: "SHADOWRUN", label: "Shadowrun", desc: "Cyberpunk más magia" },
  { id: "STARFINDER", label: "Starfinder", desc: "D&D en el espacio" },
  { id: "CUSTOM", label: "Sistema propio", desc: "Define tus propias reglas" },
];

type ArrayKey = "themes" | "tones" | "systems";

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    themes: ["FANTASY"] as string[],
    tones: [] as string[],
    systems: ["DND5E"] as string[],
    isPublic: false,
  });

  // Alterna un id dentro de una de las listas de selección múltiple.
  const toggle = (key: ArrayKey, id: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((v) => v !== id)
        : [...prev[key], id],
    }));

  // Decide si los campos OBLIGATORIOS del paso indicado están completos.
  // Gobierna si el botón "Siguiente"/"Crear campaña" se habilita.
  function isStepValid(targetStep: number): boolean {
    switch (targetStep) {
      case 1:
        return (
          form.name.trim().length > 0 && form.name.trim().length <= MAX_NAME
        );
      case 2:
        return form.themes.length > 0; // el tono es opcional
      case 3:
        return form.systems.length > 0;
      default:
        return false;
    }
  }

  const goNext = () => {
    if (!isStepValid(step)) return;
    setError(null);
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleCreate = async () => {
    if (!isStepValid(1)) {
      setStep(1);
      setError("El nombre de la campaña es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear campaña");

      router.push(`/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-6rem)] max-w-4xl mx-auto px-6 py-4 flex flex-col overflow-hidden">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3 shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-0.5">
          Nueva campaña
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Configura tu próxima aventura épica
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-start mb-5 max-w-2xl mx-auto w-full shrink-0">
        {STEPS.map((s, i) => {
          const isDone = s.n < step;
          const isCurrent = s.n === step;
          return (
            <div key={s.n} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCurrent
                      ? "bg-[var(--accent-gold)] text-[var(--bg-base)] shadow-[var(--glow-gold)] scale-110"
                      : isDone
                        ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/40"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5" /> : s.n}
                </div>
                <div className="text-center w-24">
                  <p
                    className={`text-xs font-semibold transition-colors ${isCurrent ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] hidden sm:block mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mt-5 mx-1 rounded-full transition-colors duration-300 ${s.n < step ? "bg-[var(--accent-gold)]/40" : "bg-[var(--border-subtle)]"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-[var(--shadow-lg)]">
        {/* Step header */}
        <div className="mb-4 shrink-0">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
            {STEPS[step - 1].title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {STEPS[step - 1].desc}
          </p>
        </div>

        {/* Step content (scrollable safety net) */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <Input
                  label="Nombre de la campaña"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="La Maldición de Strahd, Era del Cataclismo..."
                  maxLength={MAX_NAME}
                  required
                  autoFocus
                />
                <p className="text-[11px] text-[var(--text-muted)] text-right mt-1">
                  {form.name.length}/{MAX_NAME}
                </p>
              </div>

              <div>
                <Textarea
                  label="Descripción (opcional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Una breve descripción de la premisa de tu campaña..."
                  rows={4}
                  maxLength={MAX_DESC}
                />
                <p className="text-[11px] text-[var(--text-muted)] text-right mt-1">
                  {form.description.length}/{MAX_DESC}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Campaña pública
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Permite que otras personas encuentren tu campaña
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold ${form.isPublic ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"}`}
                  >
                    {form.isPublic ? "SI" : "NO"}
                  </span>
                  <Switch
                    checked={form.isPublic}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, isPublic: checked })
                    }
                    aria-label="Campaña pública"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Theme + tone (multi-select) */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Temas visuales <span className="ml-1 text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {form.themes.length} seleccionado(s)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {THEMES.map((theme) => {
                    const tc = getThemeColors(theme.id);
                    const isSelected = form.themes.includes(theme.id);
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => toggle("themes", theme.id)}
                        aria-pressed={isSelected}
                        className={`relative text-left p-3 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                          isSelected
                            ? "border-current"
                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: `${tc.primary}50`,
                                background: `${tc.primary}08`,
                              }
                            : {}
                        }
                      >
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 h-4 w-4 rounded-full flex items-center justify-center"
                            style={{ background: tc.primary }}
                          >
                            <Check className="h-2.5 w-2.5 text-[var(--bg-base)]" />
                          </div>
                        )}
                        <div className="text-xl mb-1.5">{theme.emoji}</div>
                        <p
                          className={`text-sm font-semibold mb-0.5 leading-tight ${isSelected ? "" : "text-[var(--text-primary)]"}`}
                          style={isSelected ? { color: tc.primary } : {}}
                        >
                          {theme.label}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                          {theme.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Tonos narrativos{" "}
                    <span className="text-[var(--text-muted)] normal-case tracking-normal">
                      (opcional)
                    </span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {form.tones.length} seleccionado(s)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TONES.map((tone) => {
                    const isSelected = form.tones.includes(tone.id);
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => toggle("tones", tone.id)}
                        aria-pressed={isSelected}
                        className={`relative text-left p-3 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--accent-gold)]/50 bg-[var(--accent-gold)]/[0.08]"
                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[var(--accent-gold)] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-[var(--bg-base)]" />
                          </div>
                        )}
                        <div className="text-xl mb-1.5">{tone.emoji}</div>
                        <p
                          className={`text-sm font-semibold mb-0.5 leading-tight ${isSelected ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"}`}
                        >
                          {tone.label}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                          {tone.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: System (multi-select / combinable) */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  Podés combinar más de un sistema. Define las mecánicas y
                  fichas disponibles.
                </p>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 ml-3">
                  {form.systems.length} seleccionado(s)
                </span>
              </div>

              {/* TODO(drive): cuando exista la cuenta de Google Drive con los manuales,
                al seleccionar un sistema (distinto de CUSTOM) buscar su manual y
                vincularlo a la Wiki de la campaña. Ver memoria "manuales-drive-wiki". */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SYSTEMS.map((system) => {
                  const isSelected = form.systems.includes(system.id);
                  return (
                    <button
                      key={system.id}
                      type="button"
                      onClick={() => toggle("systems", system.id)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/[0.08] text-[var(--accent-gold)]"
                          : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{system.label}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {system.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-[var(--accent-gold)] flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-[var(--bg-base)]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-[var(--text-muted)]">
                Próximamente: al elegir un sistema con manual oficial, se
                vinculará automáticamente a tu Wiki.
              </p>
            </div>
          )}
        </div>
        {/* End step content */}

        {error && (
          <div className="mt-4 px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm shrink-0">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-subtle)] shrink-0">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length ? (
            <Button onClick={goNext} disabled={!isStepValid(step)}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              loading={loading}
              disabled={!isStepValid(3)}
            >
              <Crown className="h-4 w-4" />
              Crear campaña
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
