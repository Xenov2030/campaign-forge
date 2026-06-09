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

const PAGE_SIZE = 50;

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; displayName: string }[]>([]);
  const channelRef = useRef<Channel | null>(null);
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingSent = useRef(0);

  const fetchHistory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${id}/messages?limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data: ChatMessageWithUser[] = await res.json();
      setMessages(data);
      setHasMore(data.length >= PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga la página anterior usando el cursor `before` (el mensaje más viejo).
  // Devuelve cuántos mensajes nuevos se prependieron (para preservar el scroll).
  const loadMore = useCallback(async (): Promise<number> => {
    if (!roomId) return 0;
    const oldest = messages[0];
    if (!oldest) return 0;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/chat/${roomId}/messages?limit=${PAGE_SIZE}&before=${encodeURIComponent(oldest.createdAt)}`
      );
      if (!res.ok) return 0;
      const older: ChatMessageWithUser[] = await res.json();
      setHasMore(older.length >= PAGE_SIZE);
      if (older.length === 0) return 0;
      let added = 0;
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const fresh = older.filter((m) => !existing.has(m.id));
        added = fresh.length;
        return [...fresh, ...prev];
      });
      return added;
    } catch {
      return 0;
    } finally {
      setLoadingMore(false);
    }
  }, [roomId, messages]);

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

    const onTyping = (data: { userId: string; displayName: string }) => {
      setTypingUsers((prev) =>
        prev.some((u) => u.userId === data.userId) ? prev : [...prev, data]
      );
      const timeouts = typingTimeouts.current;
      const existing = timeouts.get(data.userId);
      if (existing) clearTimeout(existing);
      timeouts.set(
        data.userId,
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
          timeouts.delete(data.userId);
        }, 3500)
      );
    };

    channel.bind("new-message", handler);
    channel.bind("message-edited", onEdited);
    channel.bind("message-deleted", onDeleted);
    channel.bind("user-typing", onTyping);

    const timeouts = typingTimeouts.current;
    return () => {
      channel.unbind("new-message", handler);
      channel.unbind("message-edited", onEdited);
      channel.unbind("message-deleted", onDeleted);
      channel.unbind("user-typing", onTyping);
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
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

  // Avisa que estás escribiendo (throttle de 2.5s para no spamear el endpoint).
  const notifyTyping = useCallback(() => {
    if (!roomId) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 2500) return;
    lastTypingSent.current = now;
    fetch(`/api/chat/${roomId}/typing`, { method: "POST" }).catch(() => {});
  }, [roomId]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sending,
    error,
    typingUsers,
    notifyTyping,
    sendMessage,
    addMessageLocal,
    editMessage,
    deleteMessage,
  };
}
