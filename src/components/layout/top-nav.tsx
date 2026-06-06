"use client";

import Link from "next/link";
import {
  Sparkles,
  Bell,
  ChevronRight,
  Home,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavProps {
  campaignName: string;
  currentSection?: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  isMaster?: boolean;
}

export function TopNav({
  campaignName,
  currentSection,
  userDisplayName,
  userAvatarUrl,
  isMaster,
}: TopNavProps) {
  const { setAIAssistantOpen, toggleSidebar } = useCampaignStore();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm shrink-0">
      {/* Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Abrir menú de navegación"
          className="md:hidden h-9 w-9 shrink-0"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-sm min-w-0">
          <Link
            href="/dashboard"
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors shrink-0"
            aria-label="Ir al dashboard"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
          <ChevronRight className="h-3 w-3 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
          <span
            className="text-[var(--text-secondary)] truncate max-w-[100px] sm:max-w-[180px] md:max-w-none"
            title={campaignName}
          >
            {campaignName}
          </span>
          {currentSection && (
            <>
              <ChevronRight className="h-3 w-3 text-[var(--text-muted)] shrink-0 hidden sm:block" aria-hidden="true" />
              <span className="text-[var(--text-primary)] font-medium truncate hidden sm:block">
                {currentSection}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {isMaster && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setAIAssistantOpen(true)}
            aria-label="Asistente IA"
            className="h-9 w-9"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notificaciones"
          className="h-9 w-9"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="h-6 w-px bg-[var(--border-subtle)] mx-0.5 md:mx-1" aria-hidden="true" />

        <Link
          href="/profile"
          aria-label={`Editar perfil de ${userDisplayName}`}
          className="rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent-gold)] focus-visible:outline-offset-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-[var(--accent-gold)] transition-all">
            <AvatarImage src={userAvatarUrl} alt={`Avatar de ${userDisplayName}`} />
            <AvatarFallback className="text-xs">
              {userDisplayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
