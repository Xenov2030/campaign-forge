"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const channelRef = useRef<any>(null);

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
      setMessages([]);
      return;
    }

    fetchHistory(roomId);

    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured — no realtime

    const channel = pusher.subscribe(`chat-${roomId}`);
    channelRef.current = channel;

    channel.bind("new-message", (msg: ChatMessageWithUser) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      channel.unbind_all();
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
      // Optimistic add when Pusher is not configured
      if (!getPusherClient()) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      return newMsg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando mensaje");
      return null;
    } finally {
      setSending(false);
    }
  }, [roomId]);

  return { messages, loading, sending, error, sendMessage, addMessageLocal };
}
