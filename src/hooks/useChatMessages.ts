"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "@/lib/pusher/client";

export interface ChatMessageWithUser {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  editedAt: string | null;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<Channel | null>(null);

  const fetchHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${id}/messages?limit=50`);
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data: ChatMessageWithUser[] = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roomId) {
      // Reset intencional al salir de una sala: sincroniza el estado con el cambio
      // de la dependencia externa (roomId). No es derivable — messages es estado de fetch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      return;
    }

    fetchHistory(roomId);

    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured — no realtime

    const channel = pusher.subscribe(`chat-${roomId}`);
    channelRef.current = channel;

    const handler = (msg: ChatMessageWithUser) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onEdited = (msg: ChatMessageWithUser) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onDeleted = (data: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    };

    channel.bind("new-message", handler);
    channel.bind("message-edited", onEdited);
    channel.bind("message-deleted", onDeleted);

    return () => {
      channel.unbind("new-message", handler);
      channel.unbind("message-edited", onEdited);
      channel.unbind("message-deleted", onDeleted);
      pusher.unsubscribe(`chat-${roomId}`);
      channelRef.current = null;
    };
  }, [roomId, fetchHistory]);

  const addMessageLocal = useCallback((msg: ChatMessageWithUser) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    opts?: { type?: string; metadata?: Record<string, unknown> }
  ): Promise<ChatMessageWithUser | null> => {
    if (!roomId || !content.trim()) return null;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          type: opts?.type,
          metadata: opts?.metadata,
        }),
      });
      if (!res.ok) throw new Error("Error enviando mensaje");
      const newMsg: ChatMessageWithUser = await res.json();
      // Always add immediately — Pusher broadcast deduplicates via id check
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      return newMsg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando mensaje");
      return null;
    } finally {
      setSending(false);
    }
  }, [roomId]);

  const editMessage = useCallback(
    async (id: string, content: string): Promise<boolean> => {
      if (!roomId || !content.trim()) return false;
      try {
        const res = await fetch(`/api/chat/${roomId}/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        });
        if (!res.ok) throw new Error("Error editando mensaje");
        const updated: ChatMessageWithUser = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error editando mensaje");
        return false;
      }
    },
    [roomId]
  );

  const deleteMessage = useCallback(
    async (id: string): Promise<void> => {
      if (!roomId) return;
      // Optimista: lo quitamos ya; el broadcast confirma a los demás.
      setMessages((prev) => prev.filter((m) => m.id !== id));
      try {
        await fetch(`/api/chat/${roomId}/messages/${id}`, { method: "DELETE" });
      } catch {
        // si falla, el próximo fetchHistory lo restaura
      }
    },
    [roomId]
  );

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    addMessageLocal,
    editMessage,
    deleteMessage,
  };
}
