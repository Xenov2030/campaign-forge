"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Users, Wifi, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SessionMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface SessionFormValues {
  title: string;
  date: string;
  time: string;
  duration: string;
  summary: string;
  notes: string;
  status: string;
  isPresential: boolean;
  attendeeIds: string[];
}

interface SessionFormProps {
  campaignSlug: string;
  campaignId: string;
  mode: "create" | "edit";
  sessionId?: string;
  members: SessionMember[];
  initial?: Partial<SessionFormValues>;
}

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planificada" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function SessionForm({
  campaignSlug,
  campaignId,
  mode,
  sessionId,
  members,
  initial,
}: SessionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<SessionFormValues>({
    title: initial?.title ?? "",
    date: initial?.date ?? "",
    time: initial?.time ?? "",
    duration: initial?.duration ?? "",
    summary: initial?.summary ?? "",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "PLANNED",
    isPresential: initial?.isPresential ?? true,
    // Al crear: todos seleccionados. Al editar: los guardados.
    attendeeIds: initial?.attendeeIds ?? members.map((m) => m.userId),
  });

  const set = (key: keyof SessionFormValues, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAttendee = (userId: string) => {
    setForm((f) => ({
      ...f,
      attendeeIds: f.attendeeIds.includes(userId)
        ? f.attendeeIds.filter((id) => id !== userId)
        : [...f.attendeeIds, userId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        campaignId,
        title: form.title,
        date: form.date,
        time: form.time,
        duration: form.duration ? parseInt(form.duration) : undefined,
        summary: form.summary,
        notes: form.notes,
        status: form.status,
        isPresential: form.isPresential,
        attendeeIds: form.attendeeIds,
      };

      const url = mode === "edit" ? `/api/sessions/${sessionId}` : "/api/sessions";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");

      toast.success(mode === "edit" ? "Sesión actualizada" : "Sesión creada");
      router.push(`/${campaignSlug}/sessions`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Error al eliminar");
      }
      toast.success("Sesión eliminada");
      router.push(`/${campaignSlug}/sessions`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título + estado */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Título (opcional)"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="La noche del pacto…"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Estado</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="h-10 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fecha + hora + duración */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="h-10 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 focus:outline-none focus:border-[var(--accent-gold)] transition-colors [color-scheme:dark]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Hora</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            className="h-10 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 focus:outline-none focus:border-[var(--accent-gold)] transition-colors [color-scheme:dark]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Duración (min)</label>
          <input
            type="number"
            min={0}
            max={999}
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="180"
            className="h-10 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
        </div>
      </div>

      {/* Presencial / Online */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-3">
        <div className="flex items-center gap-3">
          {form.isPresential ? (
            <Home className="h-4 w-4 text-[#34d399]" />
          ) : (
            <Wifi className="h-4 w-4 text-[#60a5fa]" />
          )}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {form.isPresential ? "Presencial" : "Online"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {form.isPresential ? "La sesión es en persona" : "La sesión es por videollamada"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isPresential}
          onClick={() => set("isPresential", !form.isPresential)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none",
            form.isPresential ? "bg-[#34d399]" : "bg-[#60a5fa]",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
              form.isPresential ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      {/* Asistentes */}
      {members.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Asistentes ({form.attendeeIds.length}/{members.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = form.attendeeIds.includes(m.userId);
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleAttendee(m.userId)}
                  className={cn(
                    "flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border text-sm font-medium transition-all",
                    selected
                      ? "bg-[var(--accent-gold)]/15 border-[var(--accent-gold)]/40 text-[var(--accent-gold)]"
                      : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <span className="h-6 w-6 rounded-full bg-[var(--bg-overlay)] overflow-hidden flex items-center justify-center shrink-0">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">
                        {m.displayName[0]?.toUpperCase()}
                      </span>
                    )}
                  </span>
                  {m.displayName}
                </button>
              );
            })}
          </div>
          {form.attendeeIds.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Sin asistentes seleccionados — no se enviarán notificaciones.
            </p>
          )}
        </div>
      )}

      {/* Resumen + notas */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Resumen (opcional)</label>
          <textarea
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={3}
            placeholder="Qué sucedió en esta sesión…"
            className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Notas privadas del máster</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Notas que solo verás vos…"
            className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm px-3 py-2 resize-none focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {mode === "edit" ? (
          <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "edit" ? "Guardar cambios" : "Crear sesión"}
        </Button>
      </div>
    </form>
  );
}
