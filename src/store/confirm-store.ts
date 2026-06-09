import { create } from "zustand";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Estiliza la acción como destructiva (rojo). */
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolver: ((value: boolean) => void) | null;
  /** Abre el modal y resuelve true/false según la elección del usuario. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  respond: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolver: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolver: resolve });
    }),
  respond: (value) => {
    get().resolver?.(value);
    set({ open: false, resolver: null });
  },
}));
