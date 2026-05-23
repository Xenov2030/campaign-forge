"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dices,
  Sparkles,
  Bell,
  Search,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopNavProps {
  campaignName: string;
  currentSection?: string;
  userDisplayName: string;
  userAvatarUrl?: string;
}

export function TopNav({
  campaignName,
  currentSection,
  userDisplayName,
  userAvatarUrl,
}: TopNavProps) {
  const { setDiceTrayOpen, setAIAssistantOpen } = useCampaignStore();

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-sm shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
        <span className="text-[var(--text-secondary)]">{campaignName}</span>
        {currentSection && (
          <>
            <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="text-[var(--text-primary)] font-medium">{currentSection}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDiceTrayOpen(true)}
          title="Lanzar dados"
        >
          <Dices className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setAIAssistantOpen(true)}
          title="Asistente IA"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon-sm" title="Notificaciones">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-[var(--border-subtle)] mx-1" />

        <Avatar className="h-7 w-7 cursor-pointer hover:ring-2 hover:ring-[var(--accent-gold)] transition-all">
          <AvatarImage src={userAvatarUrl} />
          <AvatarFallback className="text-xs">
            {userDisplayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
