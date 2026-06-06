"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, Loader2, MessageSquare, Sword, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatMessages, type ChatMessageWithUser } from "@/hooks/useChatMessages";
import { useCampaignStore } from "@/store/campaign-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Ayer ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm", { locale: es });
}

function formatDiceRoll(msg: ChatMessageWithUser) {
  const m = msg.metadata as any;
  if (m?.rolls?.length) {
    const rolls = m.rolls as number[];
    const total = m.total as number;
    const notation = m.notation as string;
    const modifier = m.modifier as number;
    return { rolls, total, notation, modifier };
  }
  return null;
}

interface CurrentUser { id: string; displayName: string; avatarUrl: string | null; }
interface CampaignInfo { id: string; masterId: string; }

export default function ChatPage() {
  const params = useParams<{ campaignSlug: string }>();
  const [textRoomId, setTextRoomId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null);
  const [input, setInput] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { setActiveTextRoomId, setChatSendMessage } = useCampaignStore();
  const { messages, loading: loadingMsgs, sending, sendMessage } = useChatMessages(textRoomId);

  useEffect(() => {
    async function load() {
      setLoadingRoom(true);
      try {
        const [campaignRes, userRes] = await Promise.all([
          fetch(`/api/campaigns/by-slug/${params.campaignSlug}`),
          fetch("/api/auth/me"),
        ]);
        if (!campaignRes.ok || !userRes.ok) return;
        const campaign = await campaignRes.json();
        const user = await userRes.json();
        setCampaignInfo({ id: campaign.id, masterId: campaign.masterId });
        setCurrentUser(user);

        fetch(`/api/gallery?campaignId=${campaign.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            const aids = data?.aids ?? [];
            const publicImg = aids.find((a: any) => a.isPublic && a.imageUrl);
            if (publicImg) setBgImage(publicImg.imageUrl);
          })
          .catch(() => {});

        const roomsRes = await fetch(`/api/chat/rooms?campaignId=${campaign.id}`);
        if (!roomsRes.ok) return;
        const rooms = await roomsRes.json();
        const textRoom = rooms.find((r: any) => r.channelType === "TEXT");
        if (textRoom) {
          setTextRoomId(textRoom.id);
          setActiveTextRoomId(textRoom.id);
        }
      } finally {
        setLoadingRoom(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.campaignSlug]);

  // Register sendMessage in store so DiceTray can send dice rolls to chat
  useEffect(() => {
    setChatSendMessage(sendMessage);
    return () => setChatSendMessage(null);
  }, [sendMessage, setChatSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isMaster = currentUser && campaignInfo && currentUser.id === campaignInfo.masterId;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput("");
    const result = await sendMessage(trimmed);
    if (result !== null) inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const isContinuation =
      !!prev &&
      prev.user.id === msg.user.id &&
      prev.type === msg.type &&
      msg.type !== "DICE_ROLL" &&
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
    return { msg, isContinuation };
  });

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Animated base — always visible */}
      <div className="absolute inset-0 chat-bg-animated pointer-events-none" />
      {/* Gallery image overlay (if set) */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${bgImage})`, opacity: 0.08, filter: "blur(2px)" }}
        />
      )}
      {/* Semi-transparent dark wash so text stays readable */}
      <div className="absolute inset-0 bg-[var(--bg-base)]/50 pointer-events-none" />

      {/* Chat column — full width */}
      <div className="relative flex flex-col flex-1 min-w-0">

          {/* Header */}
          <div className="shrink-0 h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 backdrop-blur-sm flex items-center px-4 gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Chat de campaña</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
            {loadingRoom || loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
                <div className="h-16 w-16 rounded-full bg-[var(--bg-elevated)]/80 border border-[var(--border-subtle)] flex items-center justify-center">
                  <Sword className="h-7 w-7 opacity-30" />
                </div>
                <p className="text-sm font-medium">El chat está vacío</p>
                <p className="text-xs opacity-60">¡Aventureros, la historia comienza aquí!</p>
              </div>
            ) : (
              grouped.map(({ msg, isContinuation }) => {
                if (msg.type === "DICE_ROLL") {
                  return <DiceRollMessage key={msg.id} msg={msg} currentUserId={currentUser?.id} />;
                }
                return (
                  <TextMessage
                    key={msg.id}
                    msg={msg}
                    isContinuation={isContinuation}
                    currentUserId={currentUser?.id}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 px-4 pb-4 pt-2 bg-[var(--bg-surface)]/50 backdrop-blur-sm border-t border-[var(--border-subtle)]">
            <div className="flex items-end gap-2 bg-[var(--bg-elevated)]/90 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 backdrop-blur-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                disabled={!textRoomId}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none max-h-32 leading-relaxed disabled:opacity-40"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || !textRoomId}
                aria-label="Enviar mensaje"
                className={cn(
                  "shrink-0 h-7 w-7 rounded flex items-center justify-center transition-colors",
                  input.trim() && !sending
                    ? "bg-[var(--accent-gold)] text-black hover:opacity-90"
                    : "text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]/50 mt-1 select-none">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function TextMessage({ msg, isContinuation, currentUserId }: {
  msg: ChatMessageWithUser;
  isContinuation: boolean;
  currentUserId?: string;
}) {
  return (
    <div className={cn("flex gap-3 group", isContinuation ? "mt-0.5" : "mt-4")}>
      <div className="w-8 shrink-0">
        {!isContinuation && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={msg.user.avatarUrl ?? undefined} alt={msg.user.displayName} />
            <AvatarFallback className="text-[10px]">
              {msg.user.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {!isContinuation && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={cn(
              "text-sm font-semibold",
              msg.user.id === currentUserId ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"
            )}>
              {msg.user.displayName}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{formatTime(msg.createdAt)}</span>
          </div>
        )}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

function DiceRollMessage({ msg, currentUserId }: {
  msg: ChatMessageWithUser;
  currentUserId?: string;
}) {
  const diceData = formatDiceRoll(msg);
  const isOwn = msg.user.id === currentUserId;

  return (
    <div className={cn("flex gap-3 mt-3 group", isOwn ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={msg.user.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[10px]">{msg.user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className={cn("max-w-[280px]", isOwn && "items-end flex flex-col")}>
        <div className="flex items-center gap-1.5 mb-0.5">
          {!isOwn && <span className="text-xs font-medium text-[var(--text-muted)]">{msg.user.displayName}</span>}
          <Dices className="h-3 w-3 text-[var(--accent-gold)]/60" />
          <span className="text-[10px] text-[var(--text-muted)]">{formatTime(msg.createdAt)}</span>
        </div>

        <div className="bg-[var(--bg-elevated)]/80 border border-[var(--accent-gold)]/20 rounded-[var(--radius-md)] px-3 py-2 backdrop-blur-sm">
          {diceData ? (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] text-[var(--text-muted)]">{diceData.notation}</span>
                <div className="flex flex-wrap gap-1">
                  {diceData.rolls.map((r, i) => (
                    <span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-[var(--bg-overlay)] text-[var(--text-secondary)]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-[var(--accent-gold)]">{diceData.total}</span>
                {diceData.modifier !== 0 && (
                  <span className="text-xs text-[var(--text-muted)]">
                    ({diceData.modifier > 0 ? `+${diceData.modifier}` : diceData.modifier} mod)
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">{msg.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
