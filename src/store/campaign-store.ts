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
}));
