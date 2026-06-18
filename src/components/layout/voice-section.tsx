"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/store/campaign-store";
import { useVoiceChannel, type VoiceParticipant } from "@/hooks/useVoiceChannel";
import { toast } from "sonner";

export interface VoiceRoom {
  id: string;
  name: string;
  type: "PUBLIC" | "PRIVATE" | "MASTER_ONLY";
  channelType: "VOICE";
}

// ── Sección de canales de voz ──────────────────────────────────────────────

interface VoiceChannelSectionProps {
  voiceChannels: VoiceRoom[];
  onVoiceChannelsChange: (rooms: VoiceRoom[]) => void;
  isMaster: boolean;
  campaignId: string;
  sidebarOpen: boolean;
}

export function VoiceChannelSection({
  voiceChannels,
  onVoiceChannelsChange,
  isMaster,
  campaignId,
  sidebarOpen,
}: VoiceChannelSectionProps) {
  const { activeVoiceChannelId, voiceDeafened } = useCampaignStore();
  const {
    connecting,
    participants,
    error: voiceError,
    connect,
    disconnect,
    setParticipantVolume,
  } = useVoiceChannel();

  const [addingChannel, setAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [addingLoading, setAddingLoading] = useState(false);
  const newChannelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (voiceError) toast.error(voiceError, { description: "Canal de voz" });
  }, [voiceError]);

  useEffect(() => {
    if (addingChannel) newChannelInputRef.current?.focus();
  }, [addingChannel]);

  const textAnim = {
    animate: { opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -8 },
    transition: { duration: 0.12 },
  };

  // Creación de canales deshabilitada (el input se cortaba)
  const CAN_ADD_VOICE_CHANNEL = false;

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
    if (!name) { setAddingChannel(false); return; }
    setAddingLoading(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, name, channelType: "VOICE" }),
      });
      if (res.ok) {
        const room = await res.json();
        onVoiceChannelsChange([...voiceChannels, room]);
      }
    } finally {
      setAddingLoading(false);
      setNewChannelName("");
      setAddingChannel(false);
    }
  };

  return (
    <div className="pt-1">
      {/* Header */}
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

      {/* Canal buttons + participantes */}
      {voiceChannels.map((channel) => {
        const isConnected = activeVoiceChannelId === channel.id;
        return (
          <div key={channel.id}>
            <button
              onClick={() => handleVoiceClick(channel)}
              disabled={!!connecting && activeVoiceChannelId !== channel.id}
              title={sidebarOpen ? undefined : channel.name}
              className={cn(
                "w-full flex items-center gap-2 rounded-[var(--radius-md)] text-sm transition-colors group relative min-h-[36px]",
                sidebarOpen ? "pl-8 pr-3 py-1.5" : "px-3 py-1.5",
                isConnected
                  ? "text-green-400 bg-green-500/10"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
                connecting && activeVoiceChannelId !== channel.id && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="shrink-0 relative">
                <Volume2 className="h-4 w-4" />
                {isConnected && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 ring-1 ring-[var(--bg-surface)]" />
                )}
              </span>
              <motion.span {...textAnim} className="truncate text-sm font-medium flex-1 text-left">
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

      {/* Add channel input */}
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
                    if (e.key === "Escape") { setAddingChannel(false); setNewChannelName(""); }
                  }}
                  placeholder="Nombre del canal..."
                  className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-2 py-1 outline-none focus:border-[var(--accent-gold)]/50 min-w-0"
                />
                <button
                  onClick={handleAddChannel}
                  disabled={addingLoading || !newChannelName.trim()}
                  className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-green-400 hover:bg-green-500/10 disabled:opacity-40 transition-colors"
                >
                  {addingLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => { setAddingChannel(false); setNewChannelName(""); }}
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
  );
}

// ── Barra de voz conectado ──────────────────────────────────────────────────

interface ConnectedVoiceBarProps {
  sidebarOpen: boolean;
  voiceChannels: VoiceRoom[];
}

export function ConnectedVoiceBar({ sidebarOpen, voiceChannels }: ConnectedVoiceBarProps) {
  const { activeVoiceChannelId, voiceMuted, voiceDeafened } = useCampaignStore();
  const { connected, toggleMute, toggleDeafen, disconnect } = useVoiceChannel();

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

  const connectedChannelName =
    voiceChannels.find((c) => c.id === activeVoiceChannelId)?.name ?? "";

  return (
    <AnimatePresence>
      {connected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-b border-[var(--border-subtle)]"
        >
          <div className={cn("px-2 py-2 flex items-center gap-1.5", !sidebarOpen && "flex-col")}>
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
                  voiceMuted ? "bg-red-500/15 text-red-400" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
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
                  voiceDeafened ? "bg-red-500/15 text-red-400" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
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
  );
}

// ── Fila de participante de voz (estilo Discord) ────────────────────────────

export function VoiceParticipantRow({
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

  if (p.isLocal) {
    return (
      <div className="flex items-center gap-2 px-1 py-0.5 text-[var(--text-secondary)]">
        {dot}{label}{micIcon}
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
          {dot}{label}{micIcon}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="center"
          sideOffset={8}
          className="z-50 w-44 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-3 shadow-[var(--shadow-lg)]"
        >
          <p className="text-xs font-medium text-[var(--text-primary)] mb-2 truncate">{p.name}</p>
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
            <span className="text-[10px] text-[var(--text-muted)] w-7 text-right tabular-nums">{pct}</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
