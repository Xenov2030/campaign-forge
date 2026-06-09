"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UserCog, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  displayName: string;
  avatarUrl?: string | null;
}

export function UserMenu({ displayName, avatarUrl }: UserMenuProps) {
  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Menú de usuario"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)] focus-visible:outline-offset-2"
        >
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-[var(--accent-gold)] transition-all">
            <AvatarImage src={avatarUrl ?? undefined} alt={`Avatar de ${displayName}`} />
            <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[200px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-1 shadow-[var(--shadow-lg)]"
        >
          <div className="px-2.5 py-2 border-b border-[var(--border-subtle)] mb-1">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{displayName}</p>
          </div>
          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none cursor-pointer transition-colors"
            >
              <UserCog className="h-4 w-4" />
              Editar perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={signOut}
            className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm text-red-400 hover:bg-red-500/10 outline-none cursor-pointer transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
