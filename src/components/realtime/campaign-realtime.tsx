"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher/client";
import { useNotificationStore } from "@/store/notification-store";

interface Props {
  campaignId: string;
  isMaster: boolean;
  userId: string;
}

export function CampaignRealtime({ campaignId, isMaster, userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { addUnreadChat, clearUnreadChat } = useNotificationStore();

  const chatRoomIdRef = useRef<string | null>(null);
  const chatHandlerRef = useRef<((msg: { userId: string }) => void) | null>(null);

  // ── Campaign channel: member-joined + character-created → router.refresh() ──
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`campaign-${campaignId}`);

    const onMemberJoined = (data: { userId: string; displayName: string }) => {
      router.refresh();
      if (isMaster) {
        toast.info(`${data.displayName} se unió a la campaña`, {
          description: "Un nuevo jugador se ha unido",
          duration: 5000,
        });
      }
    };

    const onCharacterCreated = () => {
      router.refresh();
    };

    // HP / condiciones cambiaron en otro cliente (combate en vivo).
    const onCharacterUpdated = () => {
      router.refresh();
    };

    // Un jugador fue expulsado o abandonó la campaña.
    const onMemberLeft = () => {
      router.refresh();
    };

    channel.bind("member-joined", onMemberJoined);
    channel.bind("character-created", onCharacterCreated);
    channel.bind("character-updated", onCharacterUpdated);
    channel.bind("member-left", onMemberLeft);

    return () => {
      channel.unbind("member-joined", onMemberJoined);
      channel.unbind("character-created", onCharacterCreated);
      channel.unbind("character-updated", onCharacterUpdated);
      channel.unbind("member-left", onMemberLeft);
      pusher.unsubscribe(`campaign-${campaignId}`);
    };
  }, [campaignId, isMaster, router]);

  // ── Chat unread tracking: only when NOT on chat page ──
  useEffect(() => {
    const isOnChat = pathname.includes("/chat");

    if (isOnChat) {
      // Clear badge when entering chat
      clearUnreadChat();

      // Remove background chat listener if active
      const pusher = getPusherClient();
      if (pusher && chatRoomIdRef.current && chatHandlerRef.current) {
        const ch = pusher.subscribe(`chat-${chatRoomIdRef.current}`);
        ch.unbind("new-message", chatHandlerRef.current);
        chatHandlerRef.current = null;
      }
      return;
    }

    // Not on chat — subscribe to count incoming messages
    const pusher = getPusherClient();
    if (!pusher) return;

    // Fetch text room ID if we don't have it yet
    if (!chatRoomIdRef.current) {
      fetch(`/api/chat/rooms?campaignId=${campaignId}`)
        .then((r) => r.ok ? r.json() : [])
        .then((rooms: Array<{ id: string; channelType: string }>) => {
          const textRoom = rooms.find((r) => r.channelType === "TEXT");
          if (!textRoom) return;

          chatRoomIdRef.current = textRoom.id;

          const handler = (msg: { userId: string }) => {
            if (msg.userId !== userId) {
              addUnreadChat();
            }
          };
          chatHandlerRef.current = handler;

          const ch = pusher.subscribe(`chat-${textRoom.id}`);
          ch.bind("new-message", handler);
        })
        .catch(() => {});
    }
  }, [pathname, campaignId, userId, addUnreadChat, clearUnreadChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const pusher = getPusherClient();
      if (!pusher) return;
      if (chatRoomIdRef.current && chatHandlerRef.current) {
        const ch = pusher.subscribe(`chat-${chatRoomIdRef.current}`);
        ch.unbind("new-message", chatHandlerRef.current);
        pusher.unsubscribe(`chat-${chatRoomIdRef.current}`);
      }
    };
  }, []);

  return null;
}
