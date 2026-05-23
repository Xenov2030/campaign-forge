import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, LogOut, Settings, User, Plus } from "lucide-react";

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
      <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/40 flex items-center justify-center">
            <Crown className="h-4 w-4 text-[var(--accent-gold)]" />
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-wider">
            CampaignForge
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--text-primary)]">{user.displayName}</span>
            <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
          </div>
          <div className="h-4 w-px bg-[var(--border-subtle)] mx-1" />
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded hover:bg-[var(--bg-elevated)]"
          >
            <User className="h-3.5 w-3.5" />
            Mi perfil
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded hover:bg-[var(--bg-elevated)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
