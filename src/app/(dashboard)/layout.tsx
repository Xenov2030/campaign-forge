import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, Shield } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { APP_VERSION } from "@/lib/version";

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
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-[var(--accent-gold)] hover:brightness-110 transition-colors px-3 py-2 rounded hover:bg-[var(--accent-gold)]/10 min-h-[36px]"
              aria-label="Panel de administración"
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Display name + flag de rol — hidden on small screens */}
          <span className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[160px]">
              {user.displayName}
            </span>
            {user.role === "MASTER" && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 font-semibold uppercase tracking-wide">
                Master
              </span>
            )}
          </span>

          <NotificationBell userId={user.id} />

          <div className="h-4 w-px bg-[var(--border-subtle)] hidden md:block" aria-hidden="true" />

          <UserMenu displayName={user.displayName} avatarUrl={user.avatarUrl} />
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="h-8 flex items-center justify-end px-6 border-t border-[var(--border-subtle)]/50">
        <span className="text-[11px] text-[var(--text-muted)] opacity-40 select-none">
          CampaignForge v{APP_VERSION}
        </span>
      </footer>
    </div>
  );
}
