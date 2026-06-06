"use client";

import { create } from "zustand";

interface NotificationStore {
  unreadChatCount: number;
  addUnreadChat: () => void;
  clearUnreadChat: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadChatCount: 0,
  addUnreadChat: () => set((s) => ({ unreadChatCount: s.unreadChatCount + 1 })),
  clearUnreadChat: () => set({ unreadChatCount: 0 }),
}));
