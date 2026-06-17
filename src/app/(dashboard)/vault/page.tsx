import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { VaultManager } from "./vault-manager";

export const metadata = { title: "Baúl de NPCs" };

export default async function VaultPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const vault = await prisma.npcVault.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Baúl de NPCs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            NPCs guardados para reutilizar en cualquier campaña
          </p>
        </div>
      </div>

      <VaultManager initialVault={vault} />
    </div>
  );
}
