// Condiciones de estado (D&D 5e) — fuente única para la card de personaje
// y la lista de aventureros del inicio.

export const CONDITIONS = [
  "Cegado",
  "Hechizado",
  "Ensordecido",
  "Asustado",
  "Agarrado",
  "Incapacitado",
  "Invisible",
  "Paralizado",
  "Petrificado",
  "Envenenado",
  "Derribado",
  "Apresado",
  "Aturdido",
  "Inconsciente",
  "Exhausto",
] as const;

export type Condition = (typeof CONDITIONS)[number];

// Un color distinto por condición, para distinguirlas de un vistazo.
const CONDITION_COLORS: Record<string, string> = {
  Cegado: "#64748b",
  Hechizado: "#ec4899",
  Ensordecido: "#0ea5e9",
  Asustado: "#a855f7",
  Agarrado: "#f97316",
  Incapacitado: "#ef4444",
  Invisible: "#22d3ee",
  Paralizado: "#dc2626",
  Petrificado: "#78716c",
  Envenenado: "#22c55e",
  Derribado: "#eab308",
  Apresado: "#d97706",
  Aturdido: "#fb7185",
  Inconsciente: "#b91c1c",
  Exhausto: "#a16207",
};

/** Color de acento único para cada condición. */
export function conditionColor(condition: string): string {
  return CONDITION_COLORS[condition] ?? "#f59e0b";
}
