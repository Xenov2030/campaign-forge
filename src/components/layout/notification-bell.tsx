"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher/client";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setItems(d.notifications ?? []);
          setUnread(d.unread ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  // Realtime: canal del usuario
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`user-${userId}`);
    const handler = (n: NotificationItem) => {
      setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
      setUnread((c) => c + 1);
    };
    channel.bind("notification", handler);
    return () => {
      channel.unbind("notification", handler);
      pusher.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o && unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
    }
  };

  const respond = async (n: NotificationItem, action: "accept" | "reject") => {
    const jrId = typeof n.data?.joinRequestId === "string" ? n.data.joinRequestId : null;
    if (!jrId) return;
    setBusyId(n.id);
    try {
      const res = await fetch(`/api/join-requests/${jrId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Error");
      }
      setItems((prev) => prev.filter((x) => x.id !== n.id));
      toast.success(action === "accept" ? "Jugador aceptado en la campaña" : "Solicitud rechazada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          aria-label="Notificaciones"
          className="relative h-9 w-9 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-h-96 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider px-3 py-2 border-b border-[var(--border-subtle)]">
            Notificaciones
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8 px-3">Sin notificaciones</p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {items.map((n) => {
                const isJoinReq = n.type === "JOIN_REQUEST" && typeof n.data?.joinRequestId === "string";
                const content = (
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)] mt-1.5 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                        {n.body && <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{n.body}</p>}
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                    {isJoinReq && (
                      <div className="flex gap-2 mt-2 pl-3.5">
                        <button
                          onClick={() => respond(n, "accept")}
                          disabled={busyId === n.id}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-medium bg-[var(--accent-nature)]/15 text-[var(--accent-nature)] border border-[var(--accent-nature)]/30 hover:bg-[var(--accent-nature)]/25 disabled:opacity-50 transition-colors"
                        >
                          {busyId === n.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Aceptar
                        </button>
                        <button
                          onClick={() => respond(n, "reject")}
                          disabled={busyId === n.id}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                );
                return n.link && !isJoinReq ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block hover:bg-[var(--bg-elevated)] transition-colors">
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })}
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
