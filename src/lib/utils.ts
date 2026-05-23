import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return formatDate(date);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getThemeColors(theme: string) {
  const themes: Record<string, { primary: string; glow: string; bg: string }> = {
    FANTASY:        { primary: "#c9a84c", glow: "rgba(201,168,76,0.3)",  bg: "#0a0a0f" },
    HORROR:         { primary: "#8b0000", glow: "rgba(139,0,0,0.4)",     bg: "#060308" },
    SCIFI:          { primary: "#00d4ff", glow: "rgba(0,212,255,0.3)",   bg: "#030812" },
    GRIMDARK:       { primary: "#8b7355", glow: "rgba(139,115,85,0.3)",  bg: "#080705" },
    STEAMPUNK:      { primary: "#cd7f32", glow: "rgba(205,127,50,0.3)",  bg: "#0a0805" },
    POSTAPOCALYPTIC:{ primary: "#6b7c45", glow: "rgba(107,124,69,0.3)",  bg: "#070808" },
    MODERN:         { primary: "#94a3b8", glow: "rgba(148,163,184,0.3)", bg: "#08090f" },
    CUSTOM:         { primary: "#7c3aed", glow: "rgba(124,58,237,0.3)",  bg: "#0a080f" },
  };
  return themes[theme] ?? themes.FANTASY;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    COMMON:    "#9ca3af",
    UNCOMMON:  "#22c55e",
    RARE:      "#3b82f6",
    VERY_RARE: "#a855f7",
    LEGENDARY: "#f97316",
    ARTIFACT:  "#eab308",
  };
  return colors[rarity] ?? colors.COMMON;
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(score: number): string {
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceNotation(notation: string): {
  count: number;
  sides: number;
  modifier: number;
} {
  const match = notation.toLowerCase().match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  if (!match) return { count: 1, sides: 20, modifier: 0 };

  return {
    count: parseInt(match[1] ?? "1"),
    sides: parseInt(match[2]),
    modifier: parseInt(match[3] ?? "0"),
  };
}

export function rollDice(notation: string): {
  rolls: number[];
  total: number;
  modifier: number;
  notation: string;
} {
  const { count, sides, modifier } = parseDiceNotation(notation);
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;

  return { rolls, total, modifier, notation };
}
