import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Shield } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";

export const metadata = { title: "Administración" };

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-[var(--radius-md)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/40 flex items-center justify-center">
          <Shield className="h-5 w-5 text-[var(--accent-gold)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Administración</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Gestioná qué usuarios pueden crear y mastear campañas
          </p>
        </div>
      </div>

      <UsersTable users={users} currentUserId={user.id} />
    </div>
  );
}
