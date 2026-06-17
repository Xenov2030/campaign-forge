"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  Users,
  Map,
  BookOpen,
  Scroll,
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
  Volume2,
  Mic,
  MicOff,
  VolumeX,
  Headphones,
  Plus,
  Check,
  X as XIcon,
  PhoneOff,
  Loader2,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useConfirmStore } from "@/store/confirm-store";
import { useCampaignStore } from "@/store/campaign-store";
import { useNotificationStore } from "@/store/notification-store";
import { useVoiceChannel, type VoiceParticipant } from "@/hooks/useVoiceChannel";

interface VoiceRoom {
  id: string;
  name: string;
  type: "PUBLIC" | "PRIVATE" | "MASTER_ONLY";
  channelType: "VOICE";
}

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
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    activeVoiceChannelId,
    voiceMuted,
    voiceDeafened,
  } = useCampaignStore();
  const { unreadChatCount } = useNotificationStore();
  const pathname = usePathname();

  const {
    connected,
    connecting,
    participants,
    error: voiceError,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
  } = useVoiceChannel();

  // Mostrar el error de voz al usuario (antes quedaba silencioso → "no pasa nada")
  useEffect(() => {
    if (voiceError) toast.error(voiceError, { description: "Canal de voz" });
  }, [voiceError]);

  const [voiceChannels, setVoiceChannels] =
    useState<VoiceRoom[]>(initialVoiceRooms);
  const [addingChannel, setAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [addingLoading, setAddingLoading] = useState(false);
  const newChannelInputRef = useRef<HTMLInputElement>(null);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Shift+M global shortcut for mute toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "M" && connected) {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [connected, toggleMute]);

  // Focus new channel input when it appears
  useEffect(() => {
    if (addingChannel) newChannelInputRef.current?.focus();
  }, [addingChannel]);

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
    },
    {
      label: "Notas",
      href: `${base}/notes`,
      icon: <Scroll className="h-4 w-4" />,
      disabled: true,
    },
    // Master only
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
      iconColor: "#a855f7",
      isMasterOnly: true,
    },
    // Sesiones al final
    {
      label: "Sesiones",
      href: `${base}/sessions`,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  // Chat vive en la zona fija de comunicación (no scrollea con las secciones).
  const chatItem: SidebarItem = {
    label: "Chat",
    href: `${base}/chat`,
    icon: <MessageSquare className="h-4 w-4" />,
    badge: unreadChatCount > 0 ? unreadChatCount : undefined,
  };

  const visibleItems = navItems.filter(
    (item) => !item.isMasterOnly || isMaster,
  );

  const textAnim = {
    animate: { opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -8 },
    transition: { duration: 0.12 },
  };

  // Creación de canales de voz deshabilitada por ahora (el input se cortaba).
  const CAN_ADD_VOICE_CHANNEL = false;

  // Render de un ítem de navegación — reutilizado en las secciones y en el Chat.
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

  // Voice channel actions
  const connectedChannelName =
    voiceChannels.find((c) => c.id === activeVoiceChannelId)?.name ?? "";

  const handleVoiceClick = async (channel: VoiceRoom) => {
    if (connecting) return;
    if (activeVoiceChannelId === channel.id) {
      await disconnect();
    } else {
      await connect(channel.id);
    }
  };

  const handleAddChannel = async () => {
    const name = newChannelName.trim();
    if (!name) {
      setAddingChannel(false);
      return;
    }
    setAddingLoading(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, name, channelType: "VOICE" }),
      });
      if (res.ok) {
        const room = await res.json();
        setVoiceChannels((prev) => [...prev, room]);
      }
    } finally {
      setAddingLoading(false);
      setNewChannelName("");
      setAddingChannel(false);
    }
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
              <Crown
                className="h-4 w-4 text-[var(--accent-gold)]"
                aria-hidden="true"
              />
            </div>
            <motion.div
              animate={{
                opacity: sidebarOpen ? 1 : 0,
                x: sidebarOpen ? 0 : -10,
              }}
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

          {/* ── Comunicación (Chat + Voz) — fijo abajo, no scrollea ── */}
          <div className="shrink-0 border-t border-[var(--border-subtle)] px-2 pt-2 pb-2 space-y-0.5">
            {renderNavItem(chatItem, chatItem.href)}

            {/* Canales de voz */}
            <div className="pt-1">
              {/* Header row — same style as a nav item */}
              <div className="flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
                  <Volume2 className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
                  <motion.span
                    {...textAnim}
                    className="truncate text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Canales de voz
                  </motion.span>
                </div>
                {CAN_ADD_VOICE_CHANNEL && isMaster && sidebarOpen && (
                  <button
                    onClick={() => setAddingChannel(true)}
                    title="Añadir canal"
                    className="h-5 w-5 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 mr-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Channel buttons + participantes inline (estilo Discord) */}
              {voiceChannels.map((channel) => {
                const isConnected = activeVoiceChannelId === channel.id;
                return (
                  <div key={channel.id}>
                    <button
                      onClick={() => handleVoiceClick(channel)}
                      disabled={
                        !!connecting && activeVoiceChannelId !== channel.id
                      }
                      title={sidebarOpen ? undefined : channel.name}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-[var(--radius-md)] text-sm transition-colors group relative min-h-[36px]",
                        sidebarOpen ? "pl-8 pr-3 py-1.5" : "px-3 py-1.5",
                        isConnected
                          ? "text-green-400 bg-green-500/10"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
                        connecting &&
                          activeVoiceChannelId !== channel.id &&
                          "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span className="shrink-0 relative">
                        <Volume2 className="h-4 w-4" />
                        {isConnected && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-[var(--bg-surface)]" />
                        )}
                      </span>
                      <motion.span
                        {...textAnim}
                        className="truncate text-sm font-medium flex-1 text-left"
                      >
                        {channel.name}
                      </motion.span>
                      {!sidebarOpen && (
                        <div
                          role="tooltip"
                          className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                        >
                          {channel.name}
                        </div>
                      )}
                    </button>

                    {/* Conectados al canal (incluido vos) — estilo Discord */}
                    {isConnected && sidebarOpen && participants.length > 0 && (
                      <div className="pl-8 pr-1 pb-1 space-y-0.5">
                        {participants.map((p) => (
                          <VoiceParticipantRow
                            key={p.identity}
                            p={p}
                            voiceDeafened={voiceDeafened}
                            onVolume={setParticipantVolume}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add channel input (master only) — deshabilitado por ahora */}
              {CAN_ADD_VOICE_CHANNEL && (
              <AnimatePresence>
                {addingChannel && sidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1 pl-8 pr-2 pt-1">
                      <input
                        ref={newChannelInputRef}
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddChannel();
                          if (e.key === "Escape") {
                            setAddingChannel(false);
                            setNewChannelName("");
                          }
                        }}
                        placeholder="Nombre del canal..."
                        className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-2 py-1 outline-none focus:border-[var(--accent-gold)]/50 min-w-0"
                      />
                      <button
                        onClick={handleAddChannel}
                        disabled={addingLoading || !newChannelName.trim()}
                        className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-green-400 hover:bg-green-500/10 disabled:opacity-40 transition-colors"
                      >
                        {addingLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setAddingChannel(false);
                          setNewChannelName("");
                        }}
                        className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0">
            {/* ── Barra de voz conectado (fija, altura constante, sin scroll) ── */}
            <AnimatePresence>
              {connected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-[var(--border-subtle)]"
                >
                  <div
                    className={cn(
                      "px-2 py-2 flex items-center gap-1.5",
                      !sidebarOpen && "flex-col",
                    )}
                  >
                    {sidebarOpen ? (
                      <span className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        <span className="text-[11px] text-green-400 font-medium truncate">
                          {connectedChannelName}
                        </span>
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    )}

                    <div className={cn("flex gap-1 shrink-0", !sidebarOpen && "flex-col")}>
                      <button
                        onClick={toggleMute}
                        title={voiceMuted ? "Activar micrófono (Shift+M)" : "Silenciar micrófono (Shift+M)"}
                        aria-label={voiceMuted ? "Activar micrófono" : "Silenciar micrófono"}
                        className={cn(
                          "h-7 w-7 rounded flex items-center justify-center transition-colors",
                          voiceMuted
                            ? "bg-red-500/15 text-red-400"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {voiceMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={toggleDeafen}
                        title={voiceDeafened ? "Dejar de ensordecer" : "Ensordecer (no escuchar)"}
                        aria-label={voiceDeafened ? "Dejar de ensordecer" : "Ensordecer"}
                        className={cn(
                          "h-7 w-7 rounded flex items-center justify-center transition-colors",
                          voiceDeafened
                            ? "bg-red-500/15 text-red-400"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {voiceDeafened ? <VolumeX className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={disconnect}
                        title="Desconectar del canal"
                        aria-label="Desconectar del canal de voz"
                        className="h-7 w-7 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-red-400 hover:bg-red-500/15 transition-colors"
                      >
                        <PhoneOff className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          aria-label={
            sidebarOpen ? "Colapsar barra lateral" : "Expandir barra lateral"
          }
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

// ── Fila de participante de voz (estilo Discord) ──
// Local: solo muestra nombre + estado. Remoto: click abre popover con el volumen.
function VoiceParticipantRow({
  p,
  voiceDeafened,
  onVolume,
}: {
  p: VoiceParticipant;
  voiceDeafened: boolean;
  onVolume: (identity: string, volume: number) => void;
}) {
  const dot = (
    <span
      className={cn(
        "h-2 w-2 rounded-full shrink-0 transition-colors",
        p.isSpeaking ? "bg-green-500" : "bg-[var(--text-muted)]/50",
      )}
    />
  );
  const micIcon = p.isMuted ? (
    <MicOff className="h-3.5 w-3.5 text-red-400 shrink-0" />
  ) : (
    <Mic className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
  );
  const label = (
    <span className="text-sm truncate flex-1 min-w-0 text-left">
      {p.name}
      {p.isLocal && <span className="text-[var(--text-muted)]"> (vos)</span>}
    </span>
  );

  // El participante local no tiene control de volumen (no te regulás a vos mismo).
  if (p.isLocal) {
    return (
      <div className="flex items-center gap-2 px-1 py-0.5 text-[var(--text-secondary)]">
        {dot}
        {label}
        {micIcon}
      </div>
    );
  }

  const pct = Math.round((p.volume ?? 1) * 100);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          title={`Ajustar volumen de ${p.name}`}
          className="w-full flex items-center gap-2 px-1 py-0.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
        >
          {dot}
          {label}
          {micIcon}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="center"
          sideOffset={8}
          className="z-50 w-44 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-3 shadow-[var(--shadow-lg)]"
        >
          <p className="text-xs font-medium text-[var(--text-primary)] mb-2 truncate">
            {p.name}
          </p>
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={pct}
              onChange={(e) => onVolume(p.identity, parseInt(e.target.value) / 100)}
              disabled={voiceDeafened}
              className="flex-1 h-1 accent-[var(--accent-gold)] cursor-pointer disabled:opacity-40"
              aria-label={`Volumen de ${p.name}`}
            />
            <span className="text-[10px] text-[var(--text-muted)] w-7 text-right tabular-nums">
              {pct}
            </span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
