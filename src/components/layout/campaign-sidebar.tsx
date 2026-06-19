"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  Users,
  Map,
  BookOpen,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  Package,
  Skull,
  Target,
  Settings,
  Crown,
  Archive,
  ImageIcon,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useConfirmStore } from "@/store/confirm-store";
import { useCampaignStore } from "@/store/campaign-store";
import { useNotificationStore } from "@/store/notification-store";
import {
  VoiceChannelSection,
  ConnectedVoiceBar,
  type VoiceRoom,
} from "@/components/layout/voice-section";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  iconColor?: string;
  isMasterOnly?: boolean;
  badge?: number;
  disabled?: boolean;
  divider?: boolean;
}

interface CampaignSidebarProps {
  campaignSlug: string;
  campaignId: string;
  isMaster: boolean;
  campaignName: string;
  campaignTheme: string;
  userId: string;
  voiceRooms: VoiceRoom[];
}

export function CampaignSidebar({
  campaignSlug,
  campaignId,
  isMaster,
  campaignName,
  userId,
  voiceRooms: initialVoiceRooms,
}: CampaignSidebarProps) {
  const confirmAction = useConfirmStore((s) => s.confirm);
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useCampaignStore();
  const { unreadChatCount } = useNotificationStore();
  const pathname = usePathname();

  const [voiceChannels, setVoiceChannels] = useState<VoiceRoom[]>(initialVoiceRooms);

  const handleLeave = async () => {
    const first = await confirmAction({
      title: "Abandonar campaña",
      description: `Vas a salir de "${campaignName}". Se eliminará tu personaje y dejarás de ver esta campaña.`,
      confirmLabel: "Continuar",
      danger: true,
    });
    if (!first) return;
    const second = await confirmAction({
      title: "¿Estás seguro?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Sí, abandonar",
      danger: true,
    });
    if (!second) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/members/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo abandonar la campaña");
      }
      toast.success("Abandonaste la campaña");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const base = `/${campaignSlug}`;

  const navItems: SidebarItem[] = [
    { label: "Inicio", href: base, icon: <Home className="h-4 w-4" /> },
    {
      label: "Personajes",
      href: `${base}/characters`,
      icon: <Sword className="h-4 w-4" />,
      iconColor: "#60a5fa",
    },
    {
      label: "NPCs",
      href: `${base}/npcs`,
      icon: <Users className="h-4 w-4" />,
      iconColor: "#34d399",
    },
    {
      label: "Quests",
      href: `${base}/quests`,
      icon: <Target className="h-4 w-4" />,
      iconColor: "#f59e0b",
    },
    {
      label: "Objetos",
      href: `${base}/items`,
      icon: <Package className="h-4 w-4" />,
      iconColor: "#06b6d4",
    },
    {
      label: "Monstruos",
      href: `${base}/monsters`,
      icon: <Skull className="h-4 w-4" />,
      iconColor: "#f87171",
    },
    {
      label: "Mundo",
      href: `${base}/world`,
      icon: <Map className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Mapas",
      href: `${base}/maps`,
      icon: <Map className="h-4 w-4" />,
      isMasterOnly: true,
      disabled: true,
    },
    {
      label: "Lore / Wiki",
      href: `${base}/lore`,
      icon: <BookOpen className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Galería",
      href: `${base}/gallery`,
      icon: <ImageIcon className="h-4 w-4" />,
      isMasterOnly: true,
    },
    {
      label: "IA Forge",
      href: `${base}/ai-forge`,
      icon: <Sparkles className="h-4 w-4" />,
      isMasterOnly: true,
    },
    {
      label: "Baúl",
      href: `${base}/vault`,
      icon: <Archive className="h-4 w-4" />,
      iconColor: "#818cf8",
      isMasterOnly: true,
    },
    {
      label: "Sesiones",
      href: `${base}/sessions`,
      icon: <Calendar className="h-4 w-4" />,
      iconColor: "#a855f7",
    },
  ];

  const chatItem: SidebarItem = {
    label: "Chat",
    href: `${base}/chat`,
    icon: <MessageSquare className="h-4 w-4" />,
    badge: unreadChatCount > 0 ? unreadChatCount : undefined,
  };

  const visibleItems = navItems.filter((item) => !item.isMasterOnly || isMaster);

  const textAnim = {
    animate: { opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -8 },
    transition: { duration: 0.12 },
  };

  const renderNavItem = (item: SidebarItem, key: string | number) => {
    const isActive =
      !item.disabled &&
      (pathname === item.href ||
        (item.href !== base && pathname.startsWith(item.href)));

    if (item.disabled) {
      return (
        <span
          key={key}
          title="Próximamente"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm group relative min-h-[40px] opacity-40 cursor-not-allowed select-none"
        >
          <span className="shrink-0">{item.icon}</span>
          <motion.span
            {...textAnim}
            className="truncate font-medium text-[var(--text-muted)] flex-1"
          >
            {item.label}
          </motion.span>
          {sidebarOpen && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0 leading-none">
              Pronto
            </span>
          )}
          {!sidebarOpen && (
            <div
              role="tooltip"
              className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
            >
              {item.label} — Próximamente
            </div>
          )}
        </span>
      );
    }

    return (
      <Link
        key={key}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-all duration-150 group relative min-h-[40px]",
          isActive
            ? "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
        )}
        onClick={() => {
          if (window.innerWidth < 768 && sidebarOpen) toggleSidebar();
        }}
      >
        <span
          className="shrink-0 relative"
          style={!isActive && item.iconColor ? { color: item.iconColor } : undefined}
        >
          {item.icon}
          {item.badge !== undefined && !sidebarOpen && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </span>
        <motion.span {...textAnim} className="truncate font-medium flex-1">
          {item.label}
        </motion.span>
        {item.badge !== undefined && sidebarOpen && (
          <motion.span
            {...textAnim}
            className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
          >
            {item.badge > 99 ? "99+" : item.badge}
          </motion.span>
        )}
        {!sidebarOpen && (
          <div
            role="tooltip"
            className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
          >
            {item.label}
            {item.badge !== undefined && ` (${item.badge})`}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        aria-label="Navegación de campaña"
        className={cn(
          "no-print relative flex h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shrink-0",
          "md:relative",
          "max-md:fixed max-md:z-50 max-md:top-0 max-md:left-0 max-md:h-screen max-md:!w-60",
          !sidebarOpen && "max-md:!hidden",
        )}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] min-h-[64px]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30">
              <Crown className="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
            </div>
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -10 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 flex-1"
            >
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest truncate">
                Campaña
              </p>
              <p className="text-sm font-display font-semibold text-[var(--text-primary)] truncate leading-tight">
                {campaignName}
              </p>
            </motion.div>

            {sidebarOpen && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    aria-label="Opciones de la campaña"
                    className="h-7 w-7 shrink-0 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-[190px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-1 shadow-[var(--shadow-lg)]"
                  >
                    {isMaster ? (
                      <DropdownMenu.Item asChild>
                        <Link
                          href={`${base}/settings`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] outline-none cursor-pointer transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Configurar campaña
                        </Link>
                      </DropdownMenu.Item>
                    ) : (
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault();
                          handleLeave();
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-sm text-red-400 hover:bg-red-500/10 outline-none cursor-pointer transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Abandonar campaña
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>

          {/* Nav */}
          <nav
            className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 hide-scrollbar-mobile"
            aria-label="Secciones de la campaña"
          >
            {visibleItems.map((item) => renderNavItem(item, item.href))}
          </nav>

          {/* Comunicación (Chat + Voz) — fijo abajo, no scrollea */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] px-2 pt-2 pb-2 space-y-0.5">
            {renderNavItem(chatItem, chatItem.href)}
            <VoiceChannelSection
              voiceChannels={voiceChannels}
              onVoiceChannelsChange={setVoiceChannels}
              isMaster={isMaster}
              campaignId={campaignId}
              sidebarOpen={sidebarOpen}
            />
          </div>

          {/* Footer — barra de voz conectado */}
          <div className="shrink-0">
            <ConnectedVoiceBar
              sidebarOpen={sidebarOpen}
              voiceChannels={voiceChannels}
            />
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Colapsar barra lateral" : "Expandir barra lateral"}
          aria-expanded={sidebarOpen}
          className="hidden md:flex absolute -right-3 top-20 h-6 w-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-[var(--shadow-md)] z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      </motion.aside>
    </>
  );
}
