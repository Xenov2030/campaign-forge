"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Save, Loader2, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const router = useRouter();
  const [aliasForm, setAliasForm] = useState({ displayName: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [aliasSaving, setAliasSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [aliasMsg, setAliasMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Prefill con el nombre actual.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u?.displayName) setAliasForm({ displayName: u.displayName });
      })
      .catch(() => {});
  }, []);

  const handleAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    setAliasSaving(true);
    setAliasMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "display_name", displayName: aliasForm.displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAliasMsg({ ok: true, text: `Nombre visible actualizado a "${data.displayName}"` });
      setAliasForm({ displayName: data.displayName });
      router.refresh();
    } catch (err) {
      setAliasMsg({ ok: false, text: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setAliasSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMsg({ ok: false, text: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordMsg({ ok: false, text: "La nueva contraseña debe tener al menos 8 caracteres" });
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", currentPassword: passwordForm.current, newPassword: passwordForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordMsg({ ok: true, text: "Contraseña actualizada correctamente" });
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPasswordMsg({ ok: false, text: err instanceof Error ? err.message : "Error al cambiar contraseña" });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <h1 className="font-display text-3xl font-black text-[var(--text-primary)] mb-8">Mi perfil</h1>

      {/* Alias / display name */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[var(--accent-gold)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Nombre visible</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Es el alias que verán el resto de jugadores en la plataforma.
        </p>
        <form onSubmit={handleAlias} className="space-y-4">
          <Input
            label="Nuevo nombre visible"
            value={aliasForm.displayName}
            onChange={(e) => setAliasForm({ displayName: e.target.value })}
            placeholder="El Gran Máster, NicoR, Arquero de Sombras…"
            required
          />
          {aliasMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] text-sm ${
              aliasMsg.ok
                ? "bg-green-900/20 border border-green-800/50 text-green-400"
                : "bg-red-900/20 border border-red-800/50 text-red-400"
            }`}>
              {aliasMsg.ok && <Check className="h-4 w-4 shrink-0" />}
              {aliasMsg.text}
            </div>
          )}
          <Button type="submit" disabled={aliasSaving}>
            {aliasSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar nombre
          </Button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-[var(--accent-arcane)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handlePassword} className="space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
            placeholder="Tu contraseña actual"
            required
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={passwordForm.next}
            onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="Repite la nueva contraseña"
            required
          />
          {passwordMsg && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] text-sm ${
              passwordMsg.ok
                ? "bg-green-900/20 border border-green-800/50 text-green-400"
                : "bg-red-900/20 border border-red-800/50 text-red-400"
            }`}>
              {passwordMsg.ok && <Check className="h-4 w-4 shrink-0" />}
              {passwordMsg.text}
            </div>
          )}
          <Button type="submit" disabled={passwordSaving} variant="arcane">
            {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Cambiar contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}
