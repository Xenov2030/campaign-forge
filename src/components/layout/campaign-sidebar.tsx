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
  ImageIcon,
  LayoutDashboard,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/store/campaign-store";
import { useVoiceChannel } from "@/hooks/useVoiceChannel";
import { APP_VERSION } from "@/lib/version";

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
  voiceRooms: VoiceRoom[];
}

export function CampaignSidebar({
  campaignSlug,
  campaignId,
  isMaster,
  campaignName,
  voiceRooms: initialVoiceRooms,
}: CampaignSidebarProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    activeVoiceChannelId,
    voiceMuted,
    voiceDeafened,
  } = useCampaignStore();
  const pathname = usePathname();

  const {
    connected,
    connecting,
    participants,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
  } = useVoiceChannel();

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
    },
    {
      label: "NPCs",
      href: `${base}/npcs`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Monstruos",
      href: `${base}/monsters`,
      icon: <Skull className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Mundo",
      href: `${base}/world`,
      icon: <Map className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Quests",
      href: `${base}/quests`,
      icon: <Target className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Objetos",
      href: `${base}/items`,
      icon: <Package className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Notas",
      href: `${base}/notes`,
      icon: <Scroll className="h-4 w-4" />,
      disabled: true,
    },
    {
      label: "Sesiones",
      href: `${base}/sessions`,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Lore / Wiki",
      href: `${base}/lore`,
      icon: <BookOpen className="h-4 w-4" />,
    },
    // Master only
    {
      label: "Galería",
      href: `${base}/gallery`,
      icon: <ImageIcon className="h-4 w-4" />,
      isMasterOnly: true,
    },
    {
      label: "Mapas",
      href: `${base}/maps`,
      icon: <Map className="h-4 w-4" />,
      isMasterOnly: true,
      disabled: true,
    },
    {
      label: "IA Forge",
      href: `${base}/ai-forge`,
      icon: <Sparkles className="h-4 w-4" />,
      isMasterOnly: true,
    },
    // Communication divider + chat
    { label: "", href: "", icon: null, divider: true },
    {
      label: "Chat",
      href: `${base}/chat`,
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.isMasterOnly || isMaster,
  );

  const textAnim = {
    animate: { opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -8 },
    transition: { duration: 0.12 },
  };

  // Voice channel actions
  const connectedChannelName =
    voiceChannels.find((c) => c.id === activeVoiceChannelId)?.name ?? "";

  const handleVoiceClick = async (channel: VoiceRoom) => {
    if (connecting) return;
    if (activeVoiceChannelId === channel.id) {
      await disconnect();
    } else {
      await connect(channel.id, channel.name);
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

  const remoteParticipants = participants.filter((p) => {
    const local = participants[0];
    return p.identity !== local?.identity;
  });

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
          "relative flex h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shrink-0",
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
          </div>

          {/* Nav */}
          <nav
            className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 hide-scrollbar-mobile"
            aria-label="Secciones de la campaña"
          >
            {visibleItems.map((item, i) => {
              if (item.divider) {
                return (
                  <div
                    key={`divider-${i}`}
                    className="my-1.5 mx-3 border-t border-[var(--border-subtle)]"
                    aria-hidden="true"
                  />
                );
              }

              const isActive =
                !item.disabled &&
                (pathname === item.href ||
                  (item.href !== base && pathname.startsWith(item.href)));

              if (item.disabled) {
                return (
                  <span
                    key={item.href}
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
                  key={item.href}
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
                  <span className="shrink-0">{item.icon}</span>
                  <motion.span {...textAnim} className="truncate font-medium">
                    {item.label}
                  </motion.span>
                  {!sidebarOpen && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* ── Voice channels — continuous with nav, no separator ── */}
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
                {isMaster && sidebarOpen && (
                  <button
                    onClick={() => setAddingChannel(true)}
                    title="Añadir canal"
                    className="h-5 w-5 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 mr-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Channel buttons */}
              {voiceChannels.map((channel) => {
                const isConnected = activeVoiceChannelId === channel.id;
                return (
                  <button
                    key={channel.id}
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
                    {isConnected && sidebarOpen && (
                      <span className="shrink-0">
                        <PhoneOff className="h-3.5 w-3.5 opacity-60" />
                      </span>
                    )}
                    {!sidebarOpen && (
                      <div
                        role="tooltip"
                        className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                      >
                        {channel.name}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Add channel input (master only) */}
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
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--border-subtle)] shrink-0">
            {/* ── Connected voice controls ── */}
            <AnimatePresence>
              {connected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden px-2 pt-2 pb-1 border-b border-[var(--border-subtle)]"
                >
                  {/* Connected channel name */}
                  <motion.div
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-1.5 px-2 mb-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-[11px] text-green-400 font-medium truncate">
                      {connectedChannelName}
                    </span>
                  </motion.div>

                  {/* Mute / Deafen buttons */}
                  <div className="flex gap-1 px-1">
                    <button
                      onClick={toggleMute}
                      title={
                        voiceMuted
                          ? "Activar micrófono (Shift+M)"
                          : "Silenciar micrófono (Shift+M)"
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 text-[11px] px-2 py-1.5 rounded transition-colors",
                        voiceMuted
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {voiceMuted ? (
                        <MicOff className="h-3 w-3 shrink-0" />
                      ) : (
                        <Mic className="h-3 w-3 shrink-0" />
                      )}
                      <motion.span
                        animate={{ opacity: sidebarOpen ? 1 : 0 }}
                        transition={{ duration: 0.1 }}
                        className="truncate"
                      >
                        {voiceMuted ? "Mudo" : "Mic"}
                      </motion.span>
                    </button>

                    <button
                      onClick={toggleDeafen}
                      title={
                        voiceDeafened
                          ? "Dejar de ensordecer"
                          : "Ensordecer (no escuchar)"
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 text-[11px] px-2 py-1.5 rounded transition-colors",
                        voiceDeafened
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {voiceDeafened ? (
                        <VolumeX className="h-3 w-3 shrink-0" />
                      ) : (
                        <Headphones className="h-3 w-3 shrink-0" />
                      )}
                      <motion.span
                        animate={{ opacity: sidebarOpen ? 1 : 0 }}
                        transition={{ duration: 0.1 }}
                        className="truncate"
                      >
                        {voiceDeafened ? "Sordo" : "Escuchar"}
                      </motion.span>
                    </button>
                  </div>

                  {/* Per-user volume sliders (sidebar open + remote participants) */}
                  <AnimatePresence>
                    {sidebarOpen && remoteParticipants.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-1 overflow-hidden px-1"
                      >
                        {remoteParticipants.map((p) => (
                          <div
                            key={p.identity}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                p.isSpeaking
                                  ? "bg-green-500"
                                  : "bg-[var(--text-muted)]",
                              )}
                            />
                            <span className="text-[11px] text-[var(--text-muted)] truncate flex-1 min-w-0">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <Volume2 className="h-2.5 w-2.5 text-[var(--text-muted)]" />
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={Math.round((p.volume ?? 1) * 100)}
                                onChange={(e) =>
                                  setParticipantVolume(
                                    p.identity,
                                    parseInt(e.target.value) / 100,
                                  )
                                }
                                disabled={voiceDeafened}
                                className="w-16 h-1 accent-[var(--accent-gold)] cursor-pointer disabled:opacity-40"
                                aria-label={`Volumen de ${p.name}`}
                              />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Settings + Inicio ── */}
            <div className="px-2 py-2 space-y-0.5">
              {isMaster && (
                <span
                  title="Próximamente"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm min-h-[40px] opacity-40 cursor-not-allowed select-none"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.span
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    transition={{ duration: 0.12 }}
                    className="text-sm text-[var(--text-muted)] flex-1 truncate"
                  >
                    Configuración
                  </motion.span>
                  {sidebarOpen && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0 leading-none">
                      Pronto
                    </span>
                  )}
                </span>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-all duration-150 group relative min-h-[40px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <motion.span {...textAnim} className="truncate font-medium">
                  Volver al inicio
                </motion.span>
                {!sidebarOpen && (
                  <div
                    role="tooltip"
                    className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                  >
                    Volver al inicio
                  </div>
                )}
              </Link>
            </div>
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
