"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Crown, Eye, EyeOff, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("demo") === "unavailable"
      ? "El acceso de prueba no está disponible por ahora. Creá una cuenta nueva para empezar."
      : null
  );
  const [remember, setRemember] = useState(false);

  // Prefill del email recordado (sincronización con localStorage, sistema externo).
  useEffect(() => {
    const saved = localStorage.getItem("cf_remember_email");
    if (!saved) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setEmail(saved);
    setRemember(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Hubo un problema al conectarse. Intentá de nuevo en unos segundos.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión");

      // Solo recordamos el email (no la contraseña — eso lo maneja el navegador).
      if (remember) localStorage.setItem("cf_remember_email", email);
      else localStorage.removeItem("cf_remember_email");

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg-base)]">
      {/* Panel de branding — solo en desktop */}
      <aside className="relative hidden lg:flex flex-col justify-center px-12 xl:px-20 border-r border-[var(--border-subtle)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-gold)]/6 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[var(--accent-arcane)]/8 blur-[100px]" />
        </div>
        <div className="relative max-w-md">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 mb-6">
            <Crown className="h-8 w-8 text-[var(--accent-gold)]" aria-hidden="true" />
          </div>
          <h2 className="font-display text-5xl font-black text-[var(--text-primary)] tracking-wider mb-4">
            CampaignForge
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Forja tu próxima gran aventura. Gestiona campañas, personajes y mundos en un solo lugar.
          </p>
        </div>
      </aside>

      {/* Panel del formulario */}
      <div className="relative flex items-center justify-center px-4 py-12">
        {/* Background effects (visibles sobre todo en móvil) */}
        <div className="absolute inset-0 pointer-events-none lg:hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-[var(--accent-gold)]/4 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-[var(--accent-arcane)]/6 blur-[80px]" />
        </div>

        <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 mb-4">
            <Crown className="h-7 w-7 text-[var(--accent-gold)]" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)] tracking-wider mb-2">
            Bienvenido
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Inicia sesión para acceder a tus campañas
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-xl)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] h-10 px-3 pr-10 rounded-[var(--radius-md)] text-sm placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--accent-gold)] cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)]">Recordarme</span>
            </label>

            {error && (
              <div role="alert" className="px-4 py-3 rounded-[var(--radius-md)] bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              <Sword className="h-4 w-4" aria-hidden="true" />
              Entrar a la aventura
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-[var(--accent-gold)] hover:brightness-110 transition-colors font-medium">
                Crea una gratis
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
