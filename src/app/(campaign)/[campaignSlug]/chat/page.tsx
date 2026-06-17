"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import * as Popover from "@radix-ui/react-popover";
import { Send, Loader2, MessageSquare, Sword, Dices, Smile, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatMessages, type ChatMessageWithUser } from "@/hooks/useChatMessages";
import { useCampaignStore } from "@/store/campaign-store";
import { useConfirmStore } from "@/store/confirm-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

const EMOJIS = [
  "😀", "😂", "😅", "😊", "😍", "😎", "🤔", "😏",
  "😢", "😭", "😡", "😱", "😴", "🤣", "😈", "🥳",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👋", "👀",
  "❤️", "🔥", "✨", "⭐", "💀", "☠️", "👹", "👻",
  "🎲", "⚔️", "🛡️", "🏹", "🗡️", "🪄", "🧙", "🐉",
  "🍺", "🗺️", "🏰", "💰", "💎", "📜", "🔮", "⚡",
  "✅", "❌", "❓", "❗", "💬", "🎉", "🌙", "🤝",
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Ayer ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm", { locale: es });
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return format(d, "d 'de' MMMM, yyyy", { locale: es });
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-2 select-none" aria-hidden="true">
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
        {formatDateLabel(date)}
      </span>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    </div>
  );
}

function formatDiceRoll(msg: ChatMessageWithUser) {
  const m = msg.metadata;
  const rolls = m?.rolls as number[] | undefined;
  if (rolls?.length) {
    return {
      rolls,
      total: (m.total as number) ?? 0,
      notation: (m.notation as string) ?? "",
      modifier: (m.modifier as number) ?? 0,
    };
  }
  return null;
}

interface CurrentUser { id: string; displayName: string; avatarUrl: string | null; }

export default function ChatPage() {
  const params = useParams<{ campaignSlug: string }>();
  const [textRoomId, setTextRoomId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [input, setInput] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const { setActiveTextRoomId, setChatSendMessage } = useCampaignStore();
  const { messages, loading: loadingMsgs, loadingMore, hasMore, loadMore, sending, typingUsers, notifyTyping, sendMessage, editMessage, deleteMessage } = useChatMessages(textRoomId);

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
        setCurrentUser(user);

        fetch(`/api/gallery?campaignId=${campaign.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            const aids: { isPublic?: boolean; imageUrl?: string }[] = data?.aids ?? [];
            const publicImg = aids.find((a) => a.isPublic && a.imageUrl);
            if (publicImg?.imageUrl) setBgImage(publicImg.imageUrl);
          })
          .catch(() => {});

        const roomsRes = await fetch(`/api/chat/rooms?campaignId=${campaign.id}`);
        if (!roomsRes.ok) return;
        const rooms: { id: string; channelType: string }[] = await roomsRes.json();
        const textRoom = rooms.find((r) => r.channelType === "TEXT");
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

  // Autoscroll al fondo solo si el usuario ya estaba abajo (no al cargar historial).
  useEffect(() => {
    if (atBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    // Cerca del tope → cargar la página anterior preservando la posición visual.
    if (el.scrollTop < 80 && hasMore && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      const prevHeight = el.scrollHeight;
      loadMore()
        .then((added) => {
          if (added > 0) {
            requestAnimationFrame(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
              }
            });
          }
        })
        .finally(() => {
          loadingMoreRef.current = false;
        });
    }
  };

  // Auto-grow del textarea según el contenido (hasta max-h-32 = 128px).
  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? input.length;
    const end = el?.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      node.focus();
      const pos = start + emoji.length;
      node.setSelectionRange(pos, pos);
      adjustHeight();
    });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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
    const sameDay =
      !!prev &&
      new Date(prev.createdAt).toDateString() === new Date(msg.createdAt).toDateString();
    const showDateDivider = !sameDay;
    const isContinuation =
      !!prev &&
      sameDay &&
      prev.user.id === msg.user.id &&
      prev.type === msg.type &&
      msg.type !== "DICE_ROLL" &&
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
    return { msg, isContinuation, showDateDivider };
  });

  const typingOthers = typingUsers.filter((u) => u.userId !== currentUser?.id);
  const typingText =
    typingOthers.length === 1
      ? `${typingOthers[0].displayName} está escribiendo…`
      : typingOthers.length === 2
        ? `${typingOthers[0].displayName} y ${typingOthers[1].displayName} están escribiendo…`
        : typingOthers.length > 2
          ? "Varias personas están escribiendo…"
          : null;

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
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
          >
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
              <>
                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
                  </div>
                )}
                {grouped.map(({ msg, isContinuation, showDateDivider }) => (
                <div key={msg.id}>
                  {showDateDivider && <DateDivider date={msg.createdAt} />}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {msg.type === "DICE_ROLL" ? (
                      <DiceRollMessage msg={msg} currentUserId={currentUser?.id} />
                    ) : (
                      <TextMessage
                        msg={msg}
                        isContinuation={isContinuation}
                        currentUserId={currentUser?.id}
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                      />
                    )}
                  </motion.div>
                </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 px-4 pb-4 pt-2 bg-[var(--bg-surface)]/50 backdrop-blur-sm border-t border-[var(--border-subtle)]">
            <div className="h-4 px-1 mb-0.5">
              {typingText && (
                <p className="text-[11px] text-[var(--text-muted)] italic truncate animate-pulse">
                  {typingText}
                </p>
              )}
            </div>
            <div className="flex items-end gap-2 bg-[var(--bg-elevated)]/90 rounded-[var(--radius-md)] border border-[var(--border-default)] focus-within:border-[var(--border-strong)] px-3 py-2 backdrop-blur-sm transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustHeight();
                  notifyTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                disabled={!textRoomId}
                className="flex-1 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none border-0 max-h-32 leading-relaxed disabled:opacity-40"
                style={{ scrollbarWidth: "none", outline: "none", boxShadow: "none" }}
              />

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Insertar emoji"
                    disabled={!textRoomId}
                    className="shrink-0 h-7 w-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors disabled:opacity-40"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="z-50 w-64 max-h-56 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-2 shadow-[var(--shadow-lg)]"
                  >
                    <div className="grid grid-cols-8 gap-0.5">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => insertEmoji(e)}
                          aria-label={`Emoji ${e}`}
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-[var(--bg-elevated)] text-lg leading-none transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

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

function TextMessage({ msg, isContinuation, currentUserId, onEdit, onDelete }: {
  msg: ChatMessageWithUser;
  isContinuation: boolean;
  currentUserId?: string;
  onEdit: (id: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const isOwn = msg.user.id === currentUserId;
  const confirm = useConfirmStore((s) => s.confirm);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(msg.content);

  const startEdit = () => {
    setDraft(msg.content);
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setDraft(msg.content);
  };
  const saveEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === msg.content) {
      cancelEdit();
      return;
    }
    const ok = await onEdit(msg.id, trimmed);
    if (ok) setEditing(false);
  };

  return (
    <div className={cn("flex gap-3 group relative", isContinuation ? "mt-0.5" : "mt-4")}>
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
              isOwn ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"
            )}>
              {msg.user.displayName}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{formatTime(msg.createdAt)}</span>
          </div>
        )}

        {editing ? (
          <div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") cancelEdit();
              }}
              rows={Math.min(Math.max(draft.split("\n").length, 1), 6)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-base text-[var(--text-primary)] px-2 py-1 outline-none focus:border-[var(--accent-gold)]/50 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-3 mt-1 text-xs">
              <button onClick={saveEdit} className="text-[var(--accent-gold)] hover:brightness-110 font-medium">
                Guardar
              </button>
              <button onClick={cancelEdit} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                Cancelar
              </button>
              <span className="text-[10px] text-[var(--text-muted)]/60">Enter para guardar · Esc para cancelar</span>
            </div>
          </div>
        ) : (
          <p className="text-base text-[var(--text-secondary)] leading-relaxed break-words whitespace-pre-wrap">
            {msg.content}
            {msg.editedAt && (
              <span className="text-[10px] text-[var(--text-muted)] ml-1.5 align-baseline">(editado)</span>
            )}
          </p>
        )}
      </div>

      {/* Acciones (solo mensajes propios, al hover) */}
      {isOwn && !editing && (
        <div className="absolute right-0 -top-2 hidden group-hover:flex items-center gap-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-0.5 shadow-[var(--shadow-md)]">
          <button
            onClick={startEdit}
            aria-label="Editar mensaje"
            className="h-6 w-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={async () => {
              const ok = await confirm({
                title: "Borrar mensaje",
                description: "¿Seguro que querés borrar este mensaje? No se puede deshacer.",
                confirmLabel: "Borrar",
                danger: true,
              });
              if (ok) onDelete(msg.id);
            }}
            aria-label="Borrar mensaje"
            className="h-6 w-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
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
    <div className="flex gap-3 mt-3 group flex-row">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={msg.user.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[10px]">{msg.user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="max-w-[280px]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-medium text-[var(--text-muted)]">{msg.user.displayName}</span>
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
