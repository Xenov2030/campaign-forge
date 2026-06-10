"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Save, ArrowLeft, Globe, Lock, Trash2, Settings, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageCropUpload } from "@/components/ui/image-crop-upload";
import { getThemeColors } from "@/lib/utils";
import { useConfirmStore } from "@/store/confirm-store";

const THEMES = [
  { id: "FANTASY", label: "Fantasía Medieval", emoji: "⚔️" },
  { id: "HORROR", label: "Horror Lovecraftiano", emoji: "🐙" },
  { id: "SCIFI", label: "Ciencia Ficción", emoji: "🚀" },
  { id: "GRIMDARK", label: "Grimdark", emoji: "💀" },
  { id: "STEAMPUNK", label: "Steampunk", emoji: "⚙️" },
  { id: "WESTERN", label: "Western", emoji: "🤠" },
  { id: "MODERN", label: "Contemporáneo", emoji: "🌆" },
  { id: "POSTAPOCALYPTIC", label: "Post-Apocalíptico", emoji: "☢️" },
  { id: "CUSTOM", label: "Personalizado", emoji: "✨" },
];

interface Props {
  slug: string;
  initial: { name: string; description: string; isPublic: boolean; bannerImage: string; theme: string };
}

export function CampaignSettingsForm({ slug, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  const [bannerImage, setBannerImage] = useState(initial.bannerImage ?? "");
  const [theme, setTheme] = useState(initial.theme);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirmStore((s) => s.confirm);

  const handleDelete = async () => {
    const first = await confirm({
      title: "Eliminar campaña",
      description: "Se borrará la campaña con todos sus personajes, NPCs, misiones y datos. Tus NPCs guardados en el baúl se conservan.",
      confirmLabel: "Continuar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!first) return;

    const second = await confirm({
      title: `¿Eliminar "${name}" definitivamente?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Sí, eliminar",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!second) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/by-slug/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo eliminar la campaña");
      }
      toast.success("Campaña eliminada");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setDeleting(false);
    }
  };

  const dirty =
    name !== initial.name ||
    description !== initial.description ||
    isPublic !== initial.isPublic ||
    bannerImage !== initial.bannerImage ||
    theme !== initial.theme;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/by-slug/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description, isPublic, bannerImage, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      toast.success("Campaña actualizada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la campaña
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30">
          <Settings className="h-5 w-5 text-[var(--accent-gold)]" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">
          Configuración de campaña
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Banner de la campaña
          </label>
          <ImageCropUpload
            value={bannerImage}
            onChange={setBannerImage}
            folder="campaign-banners"
            label="Subir banner"
            aspect="banner"
            className="max-w-md"
          />
        </div>

        <Input
          label="Nombre de la campaña"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="La Maldición de Strahd"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una breve sinopsis de tu campaña…"
            rows={4}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] px-3 py-2 rounded-[var(--radius-md)] text-sm placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors resize-none"
          />
        </div>

        {/* Ambientación / tema */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Ambientación
          </label>
          <div role="radiogroup" aria-label="Ambientación de la campaña" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const tc = getThemeColors(t.id);
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-[var(--radius-md)] text-sm font-medium border transition-all text-left ${
                    selected
                      ? "border-current"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                  }`}
                  style={selected ? { borderColor: `${tc.primary}50`, color: tc.primary, background: `${tc.primary}10` } : {}}
                >
                  <span className="text-lg" aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visibilidad */}
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          aria-pressed={isPublic}
          className="w-full flex items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors text-left"
        >
          <span className="flex items-center gap-3 min-w-0">
            {isPublic ? (
              <Globe className="h-5 w-5 text-[var(--accent-ice)] shrink-0" />
            ) : (
              <Lock className="h-5 w-5 text-[var(--text-muted)] shrink-0" />
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--text-primary)]">
                {isPublic ? "Pública" : "Privada"}
              </span>
              <span className="block text-xs text-[var(--text-muted)]">
                {isPublic
                  ? "Cualquiera con el enlace puede verla"
                  : "Solo los miembros invitados pueden acceder"}
              </span>
            </span>
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
              isPublic ? "bg-[var(--accent-gold)]" : "bg-[var(--bg-overlay)]"
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isPublic ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <Button type="submit" loading={saving} disabled={!dirty}>
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>
      </form>

      {/* Zona de peligro — el borrado llega en la Fase 2 (requiere baúl de NPCs + schema) */}
      <div className="mt-12 pt-6 border-t border-[var(--border-subtle)]">
        <h2 className="text-sm font-semibold text-[var(--accent-crimson)] uppercase tracking-wider mb-3">
          Zona de peligro
        </h2>
        <div className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--accent-crimson)]/20 bg-[var(--accent-crimson)]/5">
          <span className="flex items-center gap-3 min-w-0">
            <Trash2 className="h-5 w-5 text-[var(--accent-crimson)] shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--text-primary)]">
                Eliminar campaña
              </span>
              <span className="block text-xs text-[var(--text-muted)]">
                Se borra todo lo de la campaña. Tus NPCs guardados en el baúl se conservan.
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--accent-crimson)]/30 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/15 transition-colors disabled:opacity-50 shrink-0"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
