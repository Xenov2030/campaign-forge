"use client";

export interface MonsterData {
  id: string;
  name: string;
  type: string | null;
  size: string | null;
  alignment: string | null;
  challengeRating: string | null;
  hitPoints: string | null;
  armorClass: number | null;
  speed: unknown;
  stats: unknown;
  skills: unknown;
  senses: unknown;
  languages: string | null;
  abilities: unknown;
  actions: unknown;
  reactions: unknown;
  legendaryActions: unknown;
  lore: string | null;
  imageUrl: string | null;
  tags: string[];
}

interface StatEntry { name: string; description: string }
interface SpeedData { walk?: string; fly?: string; swim?: string; climb?: string; burrow?: string }
interface StatsData { str?: number; dex?: number; con?: number; int?: number; wis?: number; cha?: number }
interface SensesData { darkvision?: string; blindsight?: string; tremorsense?: string; truesight?: string; passivePerception?: number }
interface SkillsData { [key: string]: number }

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function safeArray(val: unknown): StatEntry[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is StatEntry => typeof v === "object" && v !== null && "name" in v);
}

function safeStats(val: unknown): StatsData {
  if (typeof val !== "object" || val === null) return {};
  return val as StatsData;
}

function safeSpeed(val: unknown): SpeedData {
  if (typeof val !== "object" || val === null) return {};
  return val as SpeedData;
}

function safeSenses(val: unknown): SensesData {
  if (typeof val !== "object" || val === null) return {};
  return val as SensesData;
}

function safeSkills(val: unknown): SkillsData {
  if (typeof val !== "object" || val === null) return {};
  return val as SkillsData;
}

const STAT_LABELS: { key: keyof StatsData; label: string }[] = [
  { key: "str", label: "FUE" },
  { key: "dex", label: "DES" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "SAB" },
  { key: "cha", label: "CAR" },
];

function Divider() {
  return <div className="h-px bg-[#c9a84c]/40 my-3" />;
}

function Section({ title, items }: { title: string; items: StatEntry[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="font-display text-sm font-bold text-[var(--accent-gold)] uppercase tracking-wider border-b border-[var(--accent-gold)]/30 pb-1 mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)] italic">{item.name}. </span>
            {item.description}
          </p>
        ))}
      </div>
    </div>
  );
}

export function MonsterStatBlock({ monster }: { monster: MonsterData }) {
  const stats = safeStats(monster.stats);
  const speed = safeSpeed(monster.speed);
  const senses = safeSenses(monster.senses);
  const skills = safeSkills(monster.skills);
  const abilities = safeArray(monster.abilities);
  const actions = safeArray(monster.actions);
  const reactions = safeArray(monster.reactions);
  const legendary = safeArray(monster.legendaryActions);

  const speedParts: string[] = [];
  if (speed.walk) speedParts.push(speed.walk);
  if (speed.fly) speedParts.push(`Volar ${speed.fly}`);
  if (speed.swim) speedParts.push(`Nadar ${speed.swim}`);
  if (speed.climb) speedParts.push(`Trepar ${speed.climb}`);
  if (speed.burrow) speedParts.push(`Excavar ${speed.burrow}`);

  const sensesParts: string[] = [];
  if (senses.darkvision) sensesParts.push(`Visión en la oscuridad ${senses.darkvision}`);
  if (senses.blindsight) sensesParts.push(`Vista ciega ${senses.blindsight}`);
  if (senses.tremorsense) sensesParts.push(`Sentido sísmico ${senses.tremorsense}`);
  if (senses.truesight) sensesParts.push(`Visión verdadera ${senses.truesight}`);
  if (senses.passivePerception) sensesParts.push(`Percepción pasiva ${senses.passivePerception}`);

  const skillEntries = Object.entries(skills).filter(([, v]) => typeof v === "number");

  const typeLine = [monster.size, monster.type, monster.alignment ? `(${monster.alignment})` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a0a0a] to-[#1a1005] px-6 py-5 border-b border-[var(--accent-gold)]/30">
        {monster.imageUrl && (
          <div className="float-right ml-4 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={monster.imageUrl}
              alt={monster.name}
              className="h-24 w-24 rounded-full object-cover border-2 border-[var(--accent-gold)]/40"
            />
          </div>
        )}
        <h1 className="font-display text-2xl font-black text-[var(--accent-gold)]">{monster.name}</h1>
        {typeLine && <p className="text-sm text-[var(--text-secondary)] italic mt-0.5">{typeLine}</p>}
        {monster.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {monster.tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-5">
        {/* CA / HP / Speed */}
        <div className="flex flex-wrap gap-4 text-sm">
          {monster.armorClass != null && (
            <span className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">CA</span> {monster.armorClass}
            </span>
          )}
          {monster.hitPoints && (
            <span className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Puntos de vida</span> {monster.hitPoints}
            </span>
          )}
          {speedParts.length > 0 && (
            <span className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Velocidad</span> {speedParts.join(", ")}
            </span>
          )}
        </div>

        <Divider />

        {/* Stats table */}
        <div className="grid grid-cols-6 gap-1 text-center">
          {STAT_LABELS.map(({ key, label }) => {
            const val = stats[key] ?? 10;
            return (
              <div key={key} className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] py-2 px-1">
                <p className="text-[10px] font-bold text-[var(--accent-gold)] uppercase">{label}</p>
                <p className="text-base font-bold text-[var(--text-primary)]">{val}</p>
                <p className="text-xs text-[var(--text-muted)]">{mod(val)}</p>
              </div>
            );
          })}
        </div>

        <Divider />

        {skillEntries.length > 0 && (
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            <span className="font-semibold text-[var(--text-primary)]">Habilidades</span>{" "}
            {skillEntries.map(([k, v]) => `${k} +${v}`).join(", ")}
          </p>
        )}

        {sensesParts.length > 0 && (
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            <span className="font-semibold text-[var(--text-primary)]">Sentidos</span> {sensesParts.join(", ")}
          </p>
        )}

        {monster.languages && (
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            <span className="font-semibold text-[var(--text-primary)]">Idiomas</span> {monster.languages}
          </p>
        )}

        {monster.challengeRating && (
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Desafío</span> {monster.challengeRating}
          </p>
        )}

        <Section title="Rasgos" items={abilities} />
        <Section title="Acciones" items={actions} />
        <Section title="Reacciones" items={reactions} />
        <Section title="Acciones legendarias" items={legendary} />

        {monster.lore && (
          <>
            <Divider />
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Trasfondo</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{monster.lore}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
