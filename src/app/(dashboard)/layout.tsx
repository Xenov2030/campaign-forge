import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Top navigation */}
      <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 min-w-0"
          aria-label="CampaignForge - Ir al dashboard"
        >
          <div className="h-8 w-8 shrink-0 rounded bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/40 flex items-center justify-center">
            <Crown className="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-wider hidden sm:block">
            CampaignForge
          </span>
        </Link>

        <nav aria-label="Acciones de usuario" className="flex items-center gap-2 md:gap-3">
          {/* Display name — hidden on small screens */}
          <span className="hidden md:block text-sm font-medium text-[var(--text-primary)] truncate max-w-[160px]">
            {user.displayName}
          </span>

          <div className="h-4 w-px bg-[var(--border-subtle)] hidden md:block" aria-hidden="true" />

          <Link
            href="/profile"
            aria-label="Editar perfil"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)] focus-visible:outline-offset-2"
          >
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-[var(--accent-gold)] transition-all">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={`Avatar de ${user.displayName}`} />
              <AvatarFallback className="text-xs">
                {user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-2 rounded hover:bg-[var(--bg-elevated)] min-h-[36px]"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
