"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion";
import { BookOpenText, X, Pencil, Trash2, GripHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useConfirmStore } from "@/store/confirm-store";

type NoteEntry = {
  id: string;
  content: string;
  title: string | null;
  sessionId: string | null;
  characterId: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionInfo = {
  id: string;
  number: number;
  title: string | null;
  date: string | null;
  status: string;
};

type CharacterInfo = {
  id: string;
  name: string;
  class: string | null;
};

interface NotesWidgetProps {
  campaignId: string;
}

const MODAL_W = 520;
const MODAL_H = 540;

// Líneas horizontales de cuaderno cada 24px
const NOTEBOOK_LINES: React.CSSProperties = {
  backgroundColor: "#111109",
  backgroundImage:
    "repeating-linear-gradient(transparent, transparent 23px, rgba(255,255,255,0.055) 23px, rgba(255,255,255,0.055) 24px)",
  backgroundSize: "100% 24px",
};

export function NotesWidget({ campaignId }: NotesWidgetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [character, setCharacter] = useState<CharacterInfo | null>(null);

  const [newContent, setNewContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const confirm = useConfirmStore((s) => s.confirm);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomInputRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/notes`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data.notes);
      setSessions(data.sessions);
      setCharacter(data.character);
    } catch {
      toast.error("No se pudieron cargar las notas");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!open) return;
    x.set(Math.max(8, (window.innerWidth - MODAL_W) / 2));
    y.set(Math.max(8, (window.innerHeight - MODAL_H) / 2));
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => bottomInputRef.current?.focus(), 220);
  }, [open]);

  // Agrupado por sesión
  const groupedNotes: Record<string, NoteEntry[]> = {};
  for (const note of notes) {
    const key = note.sessionId ?? "none";
    (groupedNotes[key] ??= []).push(note);
  }

  const sections: Array<{ session: SessionInfo | null; notes: NoteEntry[] }> = [];
  for (const session of sessions) {
    const sNotes = groupedNotes[session.id];
    if (sNotes?.length) sections.push({ session, notes: sNotes });
  }
  const unsessioned = groupedNotes["none"];
  if (unsessioned?.length) sections.push({ session: null, notes: unsessioned });

  function sessionLabel(s: SessionInfo) {
    return s.title ? `Sesión ${s.number} — ${s.title}` : `Sesión ${s.number}`;
  }

  function formatTime(iso: string) {
    return format(parseISO(iso), "HH:mm", { locale: es });
  }

  const characterLabel = character
    ? `${character.name}${character.class ? `, ${character.class}` : ""}`
    : null;

  // ── Acciones ─────────────────────────────────────────────────

  function startEdit(note: NoteEntry) {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditSessionId(note.sessionId);
  }

  function cancelEdit() {
    setEditingNoteId(null);
    setEditContent("");
  }

  async function createNote() {
    if (!newContent.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error();
      const created: NoteEntry = await res.json();
      setNotes((prev) => [created, ...prev]);
      setNewContent("");
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("No se pudo guardar la nota");
    } finally {
      setSaving(false);
    }
  }

  async function updateNote() {
    if (!editContent.trim() || !editingNoteId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/notes/${editingNoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, sessionId: editSessionId }),
      });
      if (!res.ok) throw new Error();
      const updated: NoteEntry = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setEditingNoteId(null);
    } catch {
      toast.error("No se pudo actualizar la nota");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: string) {
    const ok = await confirm({
      title: "Eliminar entrada",
      description: "Esta entrada del diario se eliminará permanentemente.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (editingNoteId === noteId) setEditingNoteId(null);
    } catch {
      toast.error("No se pudo eliminar la entrada");
    }
  }

  function handleNewKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); createNote(); }
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); updateNote(); }
    if (e.key === "Escape") cancelEdit();
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="notes-fab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(true)}
            title="Notas de campaña"
            className="fixed bottom-6 right-14 z-40 flex items-center justify-center h-11 w-11 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/40 hover:bg-[var(--bg-elevated)] shadow-lg transition-all"
          >
            <BookOpenText className="h-7 w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drag container */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {open && (
            <motion.div
              key="notes-modal"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={containerRef}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              style={{ x, y, width: MODAL_W, height: MODAL_H, position: "absolute", top: 0, left: 0 }}
              className="pointer-events-auto flex flex-col rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-xl)] border border-[rgba(201,168,76,0.18)]"
            >
              {/* Header — drag handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center gap-2 px-4 py-2.5 shrink-0 select-none cursor-grab active:cursor-grabbing"
                style={{ background: "#1a1a14", borderBottom: "1px solid rgba(201,168,76,0.15)" }}
              >
                <GripHorizontal className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(201,168,76,0.4)" }} />
                <BookOpenText className="h-4 w-4 shrink-0" style={{ color: "#c9a84c" }} />
                <span
                  className="text-sm font-semibold flex-1 select-none"
                  style={{ color: "#c9a84c", fontFamily: "var(--font-display, serif)", letterSpacing: "0.02em" }}
                >
                  Notas
                </span>
                <span className="text-[10px] mr-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {notes.length} {notes.length === 1 ? "entrada" : "entradas"}
                </span>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => { setOpen(false); setEditingNoteId(null); setNewContent(""); }}
                  className="h-6 w-6 flex items-center justify-center rounded transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Entradas (scroll) — papel de cuaderno con margen izquierdo */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto min-h-0"
                style={{ ...NOTEBOOK_LINES, borderLeft: "28px solid #0f0f0c" }}
              >
                {/* Línea roja de margen */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: 28 + 0, width: 1, background: "rgba(220,60,60,0.18)", position: "sticky" }}
                />

                {loading && (
                  <div className="flex items-center justify-center py-14">
                    <span className="text-xs animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Cargando...
                    </span>
                  </div>
                )}

                {!loading && notes.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
                    <BookOpenText className="h-8 w-8 opacity-15" style={{ color: "#c9a84c" }} />
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                      El cuaderno está vacío.
                    </p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
                      Escribí abajo para agregar la primera entrada.
                    </p>
                  </div>
                )}

                {!loading && sections.map(({ session, notes: sNotes }) => (
                  <div key={session?.id ?? "none"}>
                    {/* Divisor de sesión — sticky, estilo pestaña de cuaderno */}
                    <div
                      className="sticky top-0 z-10 flex items-baseline gap-2 px-3 py-1"
                      style={{
                        background: "rgba(17,17,9,0.96)",
                        borderBottom: "1px solid rgba(201,168,76,0.12)",
                        borderLeft: "2px solid rgba(201,168,76,0.35)",
                      }}
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: "rgba(201,168,76,0.7)" }}
                      >
                        {session ? sessionLabel(session) : "Sin sesión"}
                      </span>
                      {characterLabel && (
                        <span
                          className="text-[10px] normal-case tracking-normal"
                          style={{ color: "rgba(255,255,255,0.28)" }}
                        >
                          {characterLabel}
                        </span>
                      )}
                    </div>

                    {sNotes.map((note) =>
                      editingNoteId === note.id ? (
                        /* Edición inline */
                        <div
                          key={note.id}
                          className="px-3 py-2"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(201,168,76,0.04)" }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                              Editando
                            </span>
                            {/* Selector de sesión — SOLO en edición */}
                            <select
                              value={editSessionId ?? ""}
                              onChange={(e) => setEditSessionId(e.target.value || null)}
                              className="text-[10px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.45)",
                              }}
                            >
                              <option value="">Sin sesión</option>
                              {sessions.map((s) => (
                                <option key={s.id} value={s.id}>{sessionLabel(s)}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                            rows={4}
                            disabled={saving}
                            className="w-full resize-none bg-transparent text-sm leading-6 outline-none focus:outline-none focus:ring-0 disabled:opacity-50"
                            style={{ color: "rgba(255,255,255,0.85)", outline: "none", boxShadow: "none" }}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                              Enter para guardar · Esc para cancelar
                            </span>
                            <button
                              onClick={cancelEdit}
                              className="text-[11px] transition-colors"
                              style={{ color: "rgba(255,255,255,0.3)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Entrada del diario */
                        <div
                          key={note.id}
                          className="group relative px-3 py-2 transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.022)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <p
                            className="text-sm leading-6 whitespace-pre-wrap"
                            style={{ color: "rgba(255,255,255,0.8)" }}
                          >
                            {note.content}
                          </p>
                          {/* Footer: acciones + hora */}
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(note)}
                                className="p-1 rounded transition-colors"
                                style={{ color: "rgba(255,255,255,0.25)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                                title="Editar"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="p-1 rounded transition-colors"
                                style={{ color: "rgba(255,255,255,0.25)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(220,80,80,0.8)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                                title="Eliminar"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <span
                              className="text-[10px] tabular-nums"
                              style={{ color: "rgba(255,255,255,0.2)" }}
                            >
                              {formatTime(note.createdAt)}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Input fijo abajo — misma textura de cuaderno */}
              <div
                className="shrink-0 px-3 pt-2 pb-2"
                style={{
                  ...NOTEBOOK_LINES,
                  borderLeft: "28px solid #0f0f0c",
                  borderTop: "1px solid rgba(201,168,76,0.18)",
                }}
              >
                <textarea
                  ref={bottomInputRef}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onKeyDown={handleNewKeyDown}
                  placeholder="¿Qué pasó hoy?..."
                  rows={3}
                  disabled={saving}
                  className="w-full resize-none bg-transparent text-sm leading-6 outline-none focus:outline-none focus:ring-0 disabled:opacity-50"
                  style={{ color: "rgba(255,255,255,0.82)", outline: "none", boxShadow: "none" }}
                />
                <p className="text-right text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.18)" }}>
                  Enter para guardar · Shift+Enter nueva línea
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
