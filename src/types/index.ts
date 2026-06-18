import type {
  Campaign,
  CampaignMember,
  Character,
  NPC,
  Monster,
  Quest,
  Session,
  Location,
  Faction,
  Item,
  LoreEntry,
  GameMap,
  Note,
  ChatMessage,
  ChatRoom,
  DiceRoll,
  User,
  CampaignTheme,
  GameSystem,
  MemberRole,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Campaign,
  CampaignMember,
  Character,
  NPC,
  Monster,
  Quest,
  Session,
  Location,
  Faction,
  Item,
  LoreEntry,
  GameMap,
  Note,
  ChatMessage,
  ChatRoom,
  DiceRoll,
  User,
  CampaignTheme,
  GameSystem,
  MemberRole,
};

// Extended types with relations
export type CampaignWithMeta = Campaign & {
  master: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  members: (CampaignMember & {
    user: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  })[];
  _count?: {
    characters: number;
    npcs: number;
    sessions: number;
    quests: number;
  };
};

export type CharacterWithInventory = Character & {
  inventory: Item[];
  user: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
};

export type SessionWithDetails = Session & {
  master: Pick<User, "id" | "username" | "displayName">;
};

// Form types
export type CreateCampaignInput = {
  name: string;
  description?: string;
  // Selección múltiple. El primero de themes/systems se persiste como valor
  // PRINCIPAL en las columnas enum; la selección completa se guarda en settings.
  themes: CampaignTheme[];
  tones: string[];
  systems: GameSystem[];
  isPublic: boolean;
};

// Estructura guardada en Campaign.settings (Json) para la selección múltiple.
export type CampaignSettings = {
  themes?: CampaignTheme[];
  tones?: string[];
  systems?: GameSystem[];
};

export type CreateCharacterInput = {
  name: string;
  race?: string;
  class?: string;
  level?: number;
  background?: string;
  backstory?: string;
};

export type CreateNPCInput = {
  name: string;
  race?: string;
  occupation?: string;
  appearance?: string;
  personality?: string;
  backstory?: string;
};

// Dice types
export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

export interface DiceRollResult {
  notation: string;
  rolls: number[];
  total: number;
  modifier: number;
  timestamp: Date;
}

// UI types
export type ThemeVariant =
  | "fantasy"
  | "horror"
  | "scifi"
  | "grimdark"
  | "steampunk"
  | "modern";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  isMasterOnly?: boolean;
  badge?: number;
}

// AI types
export interface AIGenerationRequest {
  type: "npc" | "monster" | "item" | "quest" | "location" | "session_summary";
  campaignId: string;
  hints?: string;
  additionalContext?: Record<string, unknown>;
}

export interface AIGenerationResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  tokens?: number;
}

// Stats types (D&D 5e)
export interface DnD5eStats {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface DnD5eSkills {
  acrobatics: number;
  animalHandling: number;
  arcana: number;
  athletics: number;
  deception: number;
  history: number;
  insight: number;
  intimidation: number;
  investigation: number;
  medicine: number;
  nature: number;
  perception: number;
  performance: number;
  persuasion: number;
  religion: number;
  sleightOfHand: number;
  stealth: number;
  survival: number;
}

// Map types
export interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "location" | "event" | "character" | "custom";
  color?: string;
  description?: string;
  linkedEntityId?: string;
}

// ChatMessageWithUser — definición canónica en @/hooks/useChatMessages
export type { ChatMessageWithUser } from "@/hooks/useChatMessages";
