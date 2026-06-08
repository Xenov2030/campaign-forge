"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getThemeColors } from "@/lib/utils";

const THEMES = [
  { id: "FANTASY",        label: "Fantasía Medieval",    emoji: "⚔️",  desc: "Espadas, magia y dragones" },
  { id: "HORROR",         label: "Horror Lovecraftiano", emoji: "🐙",  desc: "Cósmico, oscuro y perturbador" },
  { id: "SCIFI",          label: "Ciencia Ficción",      emoji: "🚀",  desc: "Espacio, tecnología y alienígenas" },
  { id: "GRIMDARK",       label: "Grimdark",             emoji: "💀",  desc: "Mundo brutal y moralmente ambiguo" },
  { id: "STEAMPUNK",      label: "Steampunk",            emoji: "⚙️",  desc: "Vapor, engranajes y victoriano" },
  { id: "POSTAPOCALYPTIC",label: "Post-Apocalíptico",    emoji: "☢️",  desc: "Supervivencia entre las ruinas" },
  { id: "MODERN",         label: "Contemporáneo",        emoji: "🌆",  desc: "Mundo moderno con elementos sobrenaturales" },
  { id: "CUSTOM",         label: "Personalizado",        emoji: "✨",  desc: "Crea tu propia ambientación" },
];

const SYSTEMS = [
  { id: "DND5E",             label: "D&D 5ª Edición",       desc: "El estándar del rol de fantasía" },
  { id: "PATHFINDER2E",      label: "Pathfinder 2e",        desc: "Sistema de acciones, alta complejidad" },
  { id: "CALL_OF_CTHULHU",   label: "Call of Cthulhu",      desc: "Horror cósmico, cordura y misterio" },
  { id: "VAMPIRE_MASQUERADE",label: "Vampiro: La Mascarada",desc: "Política, clanes y oscuridad urbana" },
  { id: "SHADOWRUN",         label: "Shadowrun",            desc: "Cyberpunk más magia" },
  { id: "STARFINDER",        label: "Starfinder",           desc: "D&D en el espacio" },
  { id: "CUSTOM",            label: "Sistema propio",       desc: "Define tus propias reglas" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    theme: "FANTASY",
    system: "DND5E",
    isPublic: false,
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
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
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-[var(--text-primary)] mb-2">Nueva campaña</h1>
        <p className="text-[var(--text-secondary)]">Configura tu próxima aventura épica</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step
                  ? "bg-[var(--accent-gold)] text-[var(--bg-base)]"
                  : s < step
                  ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`h-px w-12 transition-colors ${s < step ? "bg-[var(--accent-gold)]/40" : "bg-[var(--border-subtle)]"}`} />
            )}
          </div>
        ))}
        <span className="text-xs text-[var(--text-muted)] ml-2">
          {step === 1 ? "Información básica" : step === 2 ? "Tema y ambientación" : "Sistema de juego"}
        </span>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-lg)]">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <Input
              label="Nombre de la campaña *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="La Maldición de Strahd, Era del Cataclismo..."
              required
            />
            <Textarea
              label="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Una breve descripción de la premisa de tu campaña..."
              rows={4}
            />
            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent-gold)]"
              />
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
                  Campaña pública
                </label>
                <p className="text-xs text-[var(--text-muted)]">
                  Permite que otras personas encuentren tu campaña
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              El tema define la estética visual y el tono narrativo de tu campaña.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((theme) => {
                const tc = getThemeColors(theme.id);
                const isSelected = form.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setForm({ ...form, theme: theme.id })}
                    className={`text-left p-4 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                      isSelected ? "border-current" : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]"
                    }`}
                    style={isSelected ? {
                      borderColor: `${tc.primary}50`,
                      background: `${tc.primary}08`,
                    } : {}}
                  >
                    <div className="text-2xl mb-2">{theme.emoji}</div>
                    <p className={`text-sm font-semibold mb-0.5 ${isSelected ? "" : "text-[var(--text-primary)]"}`}
                       style={isSelected ? { color: tc.primary } : {}}>
                      {theme.label}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{theme.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: System */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              El sistema determina las mecánicas y las fichas de personaje disponibles.
            </p>
            <div className="space-y-2">
              {SYSTEMS.map((system) => (
                <button
                  key={system.id}
                  onClick={() => setForm({ ...form, system: system.id })}
                  className={`w-full text-left p-4 rounded-[var(--radius-md)] border transition-all flex items-center justify-between cursor-pointer ${
                    form.system === system.id
                      ? "border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/08 text-[var(--accent-gold)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{system.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{system.desc}</p>
                  </div>
                  {form.system === system.id && (
                    <div className="h-5 w-5 rounded-full bg-[var(--accent-gold)] flex items-center justify-center shrink-0">
                      <svg className="h-3 w-3 text-[var(--bg-base)]" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => {
                if (step === 1 && !form.name.trim()) {
                  setError("El nombre es obligatorio");
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleCreate} loading={loading}>
              <Crown className="h-4 w-4" />
              Crear campaña
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
