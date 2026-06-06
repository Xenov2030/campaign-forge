"use client";

import { create } from "zustand";
import type { CampaignWithMeta, DiceRollResult } from "@/types";

interface CampaignStore {
  // Active campaign
  activeCampaign: CampaignWithMeta | null;
  setActiveCampaign: (campaign: CampaignWithMeta | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Dice tray
  diceTrayOpen: boolean;
  setDiceTrayOpen: (open: boolean) => void;
  diceHistory: DiceRollResult[];
  addDiceRoll: (roll: DiceRollResult) => void;
  clearDiceHistory: () => void;

  // AI assistant
  aiAssistantOpen: boolean;
  setAIAssistantOpen: (open: boolean) => void;

  // Active tab (per campaign section)
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Theme
  campaignTheme: string;
  setCampaignTheme: (theme: string) => void;

  // Chat
  activeTextRoomId: string | null;
  setActiveTextRoomId: (id: string | null) => void;
  chatSendMessage: ((content: string, opts?: { type?: string; metadata?: Record<string, unknown> }) => Promise<unknown>) | null;
  setChatSendMessage: (fn: ((content: string, opts?: { type?: string; metadata?: Record<string, unknown> }) => Promise<unknown>) | null) => void;

  // Master dice hide
  masterHidingRolls: boolean;
  setMasterHidingRolls: (v: boolean) => void;

  // Voice
  activeVoiceRoomId: string | null;
  setActiveVoiceRoomId: (id: string | null) => void;
  voiceConnected: boolean;
  setVoiceConnected: (connected: boolean) => void;
  voiceMuted: boolean;
  setVoiceMuted: (v: boolean) => void;
  voiceDeafened: boolean;
  setVoiceDeafened: (v: boolean) => void;
  activeVoiceChannelId: string | null;
  setActiveVoiceChannelId: (id: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  activeCampaign: null,
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  diceTrayOpen: false,
  setDiceTrayOpen: (open) => set({ diceTrayOpen: open }),
  diceHistory: [],
  addDiceRoll: (roll) =>
    set((state) => ({
      diceHistory: [roll, ...state.diceHistory].slice(0, 50),
    })),
  clearDiceHistory: () => set({ diceHistory: [] }),

  aiAssistantOpen: false,
  setAIAssistantOpen: (open) => set({ aiAssistantOpen: open }),

  activeSection: "overview",
  setActiveSection: (section) => set({ activeSection: section }),

  campaignTheme: "FANTASY",
  setCampaignTheme: (theme) => set({ campaignTheme: theme }),

  activeTextRoomId: null,
  setActiveTextRoomId: (id) => set({ activeTextRoomId: id }),
  chatSendMessage: null,
  setChatSendMessage: (fn) => set({ chatSendMessage: fn }),
  masterHidingRolls: false,
  setMasterHidingRolls: (v) => set({ masterHidingRolls: v }),

  activeVoiceRoomId: null,
  setActiveVoiceRoomId: (id) => set({ activeVoiceRoomId: id }),
  voiceConnected: false,
  setVoiceConnected: (connected) => set({ voiceConnected: connected }),
  voiceMuted: false,
  setVoiceMuted: (v) => set({ voiceMuted: v }),
  voiceDeafened: false,
  setVoiceDeafened: (v) => set({ voiceDeafened: v }),
  activeVoiceChannelId: null,
  setActiveVoiceChannelId: (id) => set({ activeVoiceChannelId: id }),
}));
