"use client";

import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Home,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";

interface TopNavProps {
  campaignName: string;
  currentSection?: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  userId: string;
  isMaster?: boolean;
}

export function TopNav({
  campaignName,
  currentSection,
  userDisplayName,
  userAvatarUrl,
  userId,
  isMaster,
}: TopNavProps) {
  const { setAIAssistantOpen, toggleSidebar } = useCampaignStore();

  return (
    <header className="no-print flex items-center justify-between px-4 md:px-6 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm shrink-0">
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
        <Link
          href="/dashboard"
          aria-label="Volver al inicio"
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>

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

        <NotificationBell userId={userId} />

        <div className="h-6 w-px bg-[var(--border-subtle)] mx-0.5 md:mx-1" aria-hidden="true" />

        <UserMenu displayName={userDisplayName} avatarUrl={userAvatarUrl} />
      </div>
    </header>
  );
}
