"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!form.fullName.trim()) {
      setError("El nombre real es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          displayName: form.displayName,
          password: form.password,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("El servidor no está disponible. Verificá que la base de datos esté configurada y ejecutá 'npx prisma generate'.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear la cuenta");

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full bg-[var(--accent-arcane)]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-[var(--accent-gold)]/4 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-arcane)]/10 border border-[var(--accent-arcane)]/30 mb-4">
            <Sparkles className="h-7 w-7 text-[var(--accent-arcane)]" />
          </div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)] tracking-wider mb-2">
            Crear cuenta
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Únete y comienza a forjar tu primera campaña
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-xl)]">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Nombre real"
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              placeholder="Nombre y Apellido"
              required
            />

            <Input
              label="Nombre visible (alias opcional)"
              type="text"
              value={form.displayName}
              onChange={handleChange("displayName")}
              placeholder="El Gran Máster, NicoR… (si se deja vacío se usa el nombre real)"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 px-3 pr-10 rounded-[var(--radius-md)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Input
              label="Confirmar contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Repite tu contraseña"
              required
            />

            {error && (
              <div className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              variant="arcane"
              className="w-full"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              Crear cuenta
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-[var(--accent-gold)] hover:brightness-110 transition-colors font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-4 text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
