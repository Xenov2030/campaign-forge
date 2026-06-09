"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "@prisma/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";

export interface AdminUserRow {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date | string;
}

const roleBadge: Record<UserRole, { label: string; className: string }> = {
  ADMIN:  { label: "Admin",  className: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/40" },
  MASTER: { label: "Máster", className: "bg-[var(--accent-arcane)]/15 text-[var(--accent-arcane)] border-[var(--accent-arcane)]/40" },
  PLAYER: { label: "Jugador", className: "bg-[var(--bg-overlay)] text-[var(--text-muted)] border-[var(--border-default)]" },
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState(users);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const setRole = async (id: string, nextRole: UserRole) => {
    const prev = rows;
    // Optimistic: reflejamos el cambio antes de la confirmación del servidor.
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, role: nextRole } : r)));
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar el rol");
      toast.success(
        nextRole === "MASTER" ? "Usuario habilitado como máster" : "Permiso de máster revocado"
      );
    } catch (err) {
      setRows(prev); // rollback
      toast.error(err instanceof Error ? err.message : "Error al actualizar el rol");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
        <span>Usuario</span>
        <span className="w-20 text-center">Rol</span>
        <span className="w-28 text-right">Registro</span>
        <span className="w-24 text-right">Máster</span>
      </div>

      <ul className="divide-y divide-[var(--border-subtle)]">
        {rows.map((u) => {
          const isSelf = u.id === currentUserId;
          const isAdmin = u.role === "ADMIN";
          const locked = isAdmin || isSelf; // no se puede tocar a admins ni a uno mismo
          const badge = roleBadge[u.role];
          return (
            <li
              key={u.id}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center"
            >
              {/* Identidad */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.avatarUrl ?? undefined} alt={`Avatar de ${u.displayName}`} />
                  <AvatarFallback className="text-xs">
                    {u.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {u.displayName}
                    {isSelf && <span className="ml-2 text-[10px] text-[var(--text-muted)]">(vos)</span>}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="w-20 flex justify-center">
                <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              {/* Registro */}
              <span className="hidden sm:block w-28 text-right text-xs text-[var(--text-muted)]">
                {formatDate(u.createdAt)}
              </span>

              {/* Switch máster */}
              <div className="w-24 flex justify-end">
                {locked ? (
                  <span
                    className="text-[11px] text-[var(--text-muted)]"
                    title={isAdmin ? "El rol admin se gestiona por configuración" : "No podés cambiar tu propio rol"}
                  >
                    —
                  </span>
                ) : (
                  <Switch
                    checked={u.role === "MASTER"}
                    disabled={pendingId === u.id}
                    onCheckedChange={(checked) => setRole(u.id, checked ? "MASTER" : "PLAYER")}
                    aria-label={`Permiso de máster para ${u.displayName}`}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No hay usuarios.</p>
      )}
    </div>
  );
}
