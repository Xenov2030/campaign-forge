"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Room, RemoteParticipant, RemoteTrackPublication, RemoteAudioTrack } from "livekit-client";
import { useCampaignStore } from "@/store/campaign-store";

// Señales sonoras del canal de voz, generadas con Web Audio (sin assets).
// Tonos ascendentes = "encendido" (entrar/desmutear); descendentes = "apagado".
type VoiceCue = "join" | "leave" | "mute" | "unmute" | "deafen" | "undeafen";

const CUE_FREQS: Record<VoiceCue, number[]> = {
  join: [523.25, 783.99],
  leave: [783.99, 523.25],
  mute: [392.0],
  unmute: [659.25],
  deafen: [659.25, 392.0],
  undeafen: [392.0, 659.25],
};

function playVoiceCue(kind: VoiceCue) {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    CUE_FREQS[kind].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    });
    setTimeout(() => ctx.close().catch(() => {}), 500);
  } catch {
    // audio no crítico
  }
}

export interface VoiceParticipant {
  sid: string;
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number; // 0-1, current listener volume setting
  isLocal: boolean; // true para el participante local (vos)
}

export function useVoiceChannel() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { voiceMuted, setVoiceMuted, voiceDeafened, setVoiceDeafened, setActiveVoiceChannelId, setVoiceConnected } = useCampaignStore();

  const roomRef = useRef<Room | null>(null);
  const volumesRef = useRef<Map<string, number>>(new Map()); // identity → volume

  const snapshotParticipants = useCallback((room: Room) => {
    const list: VoiceParticipant[] = [];
    const local = room.localParticipant;
    if (local) {
      list.push({
        sid: local.sid,
        identity: local.identity,
        name: local.name ?? local.identity,
        isSpeaking: local.isSpeaking,
        isMuted: !local.isMicrophoneEnabled,
        volume: 1,
        isLocal: true,
      });
    }
    room.remoteParticipants?.forEach((p: RemoteParticipant) => {
      list.push({
        sid: p.sid,
        identity: p.identity,
        name: p.name ?? p.identity,
        isSpeaking: p.isSpeaking,
        isMuted: p.isMicrophoneEnabled === false,
        volume: volumesRef.current.get(p.identity) ?? 1,
        isLocal: false,
      });
    });
    setParticipants(list);
  }, []);

  const connect = useCallback(async (channelId: string) => {
    if (connecting) return;
    // Disconnect from previous room first
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: channelId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error obteniendo token de voz");
      }
      const { token, wsUrl } = await res.json();
      const { Room, RoomEvent } = await import("livekit-client");
      const room = new Room();
      roomRef.current = room;

      const refresh = () => snapshotParticipants(room);
      room.on(RoomEvent.ParticipantConnected, () => {
        playVoiceCue("join");
        refresh();
      });
      room.on(RoomEvent.ParticipantDisconnected, () => {
        playVoiceCue("leave");
        refresh();
      });
      room.on(RoomEvent.TrackMuted, refresh);
      room.on(RoomEvent.TrackUnmuted, refresh);
      room.on(RoomEvent.ActiveSpeakersChanged, refresh);
      room.on(RoomEvent.Disconnected, () => {
        setConnected(false);
        setVoiceConnected(false);
        setActiveVoiceChannelId(null);
        setParticipants([]);
        roomRef.current = null;
      });

      await room.connect(wsUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setConnected(true);
      playVoiceCue("join");
      setVoiceConnected(true);
      setActiveVoiceChannelId(channelId);
      setVoiceMuted(false);
      setVoiceDeafened(false);
      snapshotParticipants(room);
    } catch (err) {
      console.error("[voice] Error al conectar al canal:", err);
      setError(err instanceof Error ? err.message : "Error conectando al canal de voz");
      roomRef.current = null;
    } finally {
      setConnecting(false);
    }
  }, [connecting, snapshotParticipants, setVoiceConnected, setActiveVoiceChannelId, setVoiceMuted, setVoiceDeafened]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnected(false);
    setVoiceConnected(false);
    setActiveVoiceChannelId(null);
    setParticipants([]);
    setVoiceMuted(false);
    setVoiceDeafened(false);
  }, [setVoiceConnected, setActiveVoiceChannelId, setVoiceMuted, setVoiceDeafened]);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current || !connected) return;
    const next = !voiceMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!next);
    setVoiceMuted(next);
    playVoiceCue(next ? "mute" : "unmute");
    snapshotParticipants(roomRef.current);
  }, [connected, voiceMuted, setVoiceMuted, snapshotParticipants]);

  const toggleDeafen = useCallback(async () => {
    if (!roomRef.current || !connected) return;
    const next = !voiceDeafened;
    setVoiceDeafened(next);
    playVoiceCue(next ? "deafen" : "undeafen");
    // Set volume on all remote audio tracks
    roomRef.current.remoteParticipants?.forEach((p: RemoteParticipant) => {
      p.audioTrackPublications?.forEach((pub: RemoteTrackPublication) => {
        const track = pub.track as RemoteAudioTrack | undefined;
        if (track) track.setVolume(next ? 0 : (volumesRef.current.get(p.identity) ?? 1));
      });
    });
    // Also mute mic when deafening
    if (next && !voiceMuted) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      setVoiceMuted(true);
    }
  }, [connected, voiceDeafened, voiceMuted, setVoiceDeafened, setVoiceMuted]);

  const setParticipantVolume = useCallback((identity: string, volume: number) => {
    if (!roomRef.current) return;
    volumesRef.current.set(identity, volume);
    const participant = roomRef.current.remoteParticipants?.get(identity);
    if (participant) {
      participant.audioTrackPublications?.forEach((pub: RemoteTrackPublication) => {
        const track = pub.track as RemoteAudioTrack | undefined;
        if (track) track.setVolume(voiceDeafened ? 0 : volume);
      });
    }
    setParticipants((prev) =>
      prev.map((p) => (p.identity === identity ? { ...p, volume } : p))
    );
  }, [voiceDeafened]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return {
    connected,
    connecting,
    participants,
    error,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
  };
}
