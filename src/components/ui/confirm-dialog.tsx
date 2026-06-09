"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { useConfirmStore } from "@/store/confirm-store";
import { cn } from "@/lib/utils";

/**
 * Modal de confirmación global. Se monta una sola vez (en el root layout) y
 * cualquier parte de la app dispara una confirmación con
 * `useConfirmStore((s) => s.confirm)({...})`, que resuelve a true/false.
 */
export function ConfirmDialog() {
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const respond = useConfirmStore((s) => s.respond);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) respond(false); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-xl)] focus:outline-none"
        >
          <div className="flex items-start gap-3">
            {options?.danger && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-crimson)]/15 border border-[var(--accent-crimson)]/30">
                <AlertTriangle className="h-5 w-5 text-[var(--accent-crimson)]" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-display text-lg font-bold text-[var(--text-primary)]">
                {options?.title ?? ""}
              </Dialog.Title>
              {options?.description && (
                <Dialog.Description className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {options.description}
                </Dialog.Description>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => respond(false)}
              className="h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {options?.cancelLabel ?? "Cancelar"}
            </button>
            <button
              onClick={() => respond(true)}
              className={cn(
                "h-9 px-4 rounded-[var(--radius-md)] text-sm font-semibold transition-colors",
                options?.danger
                  ? "bg-[var(--accent-crimson)] text-white hover:brightness-110"
                  : "bg-[var(--accent-gold)] text-black hover:brightness-110",
              )}
            >
              {options?.confirmLabel ?? "Confirmar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
