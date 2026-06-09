"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { User, Lock, Save, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageCropUpload } from "@/components/ui/image-crop-upload";

export default function ProfilePage() {
  const router = useRouter();
  const [account, setAccount] = useState({ displayName: "", email: "" });
  const [initial, setInitial] = useState({ displayName: "", email: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [accountSaving, setAccountSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Prefill con los datos actuales.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) return;
        const next = { displayName: u.displayName ?? "", email: u.email ?? "" };
        setAccount(next);
        setInitial(next);
        setAvatarUrl(u.avatarUrl ?? "");
      })
      .catch(() => {});
  }, []);

  const accountDirty =
    account.displayName !== initial.displayName || account.email !== initial.email;

  // El avatar se guarda al instante al recortar/subir.
  const handleAvatar = async (url: string) => {
    setAvatarUrl(url);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "avatar", avatarUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Foto de perfil actualizada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar la foto");
    }
  };

  const handleAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.displayName.trim()) {
      toast.error("El nombre visible no puede estar vacío");
      return;
    }
    setAccountSaving(true);
    try {
      // Email primero: puede fallar por formato o por estar en uso.
      if (account.email.trim().toLowerCase() !== initial.email.toLowerCase()) {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "email", email: account.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      if (account.displayName.trim() !== initial.displayName) {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "display_name", displayName: account.displayName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setInitial({ displayName: account.displayName.trim(), email: account.email.trim().toLowerCase() });
      setAccount((a) => ({ displayName: a.displayName.trim(), email: a.email.trim().toLowerCase() }));
      toast.success("Datos de cuenta actualizados");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setAccountSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordForm.next.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
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
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-5"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <h1 className="font-display text-3xl font-black text-[var(--text-primary)] mb-6">Mi perfil</h1>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
      {/* Cuenta: avatar + nombre + email */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[var(--accent-gold)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Cuenta</h2>
        </div>
        <form onSubmit={handleAccount} className="flex gap-5">
          {/* Avatar */}
          <div className="shrink-0 w-24">
            <ImageCropUpload
              value={avatarUrl}
              onChange={handleAvatar}
              folder="avatars"
              label="Foto"
              aspect="square"
              className="rounded-full overflow-hidden [&>button]:rounded-full"
            />
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-1.5">Toca para cambiar</p>
          </div>

          {/* Nombre + email */}
          <div className="flex-1 min-w-0 space-y-3">
            <Input
              label="Nombre visible"
              value={account.displayName}
              onChange={(e) => setAccount((a) => ({ ...a, displayName: e.target.value }))}
              placeholder="El Gran Máster, NicoR…"
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              placeholder="tu@correo.com"
              required
            />
            <Button type="submit" disabled={accountSaving || !accountDirty}>
              {accountSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>

      {/* Contraseña */}
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
          <Button type="submit" disabled={passwordSaving} variant="arcane">
            {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Cambiar contraseña
          </Button>
        </form>
      </div>
      </div>
    </div>
  );
}
