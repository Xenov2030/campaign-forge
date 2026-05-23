import { getOpenAI } from "./openai";
import { CampaignTheme, GameSystem } from "@prisma/client";

interface CampaignContext {
  name: string;
  theme: CampaignTheme;
  system: GameSystem;
  description?: string;
}

function getThemePromptContext(theme: CampaignTheme, system: GameSystem): string {
  const themeDescriptions: Record<CampaignTheme, string> = {
    FANTASY:         "medieval high fantasy con magia, dragones y espadas",
    HORROR:          "horror lovecraftiano oscuro, cósmico y perturbador",
    SCIFI:           "ciencia ficción espacial futurista y tecnológica",
    GRIMDARK:        "fantasía oscura brutal y moralmente ambigua",
    STEAMPUNK:       "steampunk victoriano con máquinas de vapor y engranajes",
    WESTERN:         "oeste salvaje con pistoleros y tierras áridas",
    MODERN:          "contemporáneo moderno con elementos sobrenaturales",
    POSTAPOCALYPTIC: "mundo post-apocalíptico de supervivencia y ruinas",
    CUSTOM:          "ambientación personalizada única",
  };

  const systemDescriptions: Record<GameSystem, string> = {
    DND5E:             "D&D 5e (clases, razas, magia de Faerûn)",
    PATHFINDER2E:      "Pathfinder 2e (sistema de acciones, Golarion)",
    CALL_OF_CTHULHU:   "Call of Cthulhu (horror cósmico, cordura, 1920s)",
    VAMPIRE_MASQUERADE:"Vampiro: La Mascarada (política, clanes, oscuridad)",
    SHADOWRUN:         "Shadowrun (cyberpunk + magia, megacorporaciones)",
    STARFINDER:        "Starfinder (D&D en el espacio, naves, razas alienígenas)",
    CUSTOM:            "sistema personalizado",
  };

  return `Ambientación: ${themeDescriptions[theme]}. Sistema: ${systemDescriptions[system]}.`;
}

// ============================================================
// NPC GENERATOR
// ============================================================

export interface GeneratedNPC {
  name: string;
  race: string;
  occupation: string;
  age: string;
  gender: string;
  appearance: string;
  personality: string;
  backstory: string;
  motivations: string;
  secrets: string;
  quirks: string;
  voiceNotes: string;
  relationships: Array<{ name: string; type: string; description: string }>;
  tags: string[];
}

export async function generateNPC(
  context: CampaignContext,
  hints?: string
): Promise<GeneratedNPC> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const prompt = `Eres un maestro narrador de rol. Genera un PNJ (personaje no jugador) detallado y memorable para esta campaña.

CONTEXTO DE CAMPAÑA:
- Nombre: ${context.name}
- ${themeCtx}
${context.description ? `- Descripción: ${context.description}` : ""}
${hints ? `- Indicaciones del máster: ${hints}` : ""}

Genera un PNJ con personalidad profunda, historia interesante y secretos que enriquezcan la narrativa. Debe adaptarse perfectamente al tono de la campaña.

Responde ÚNICAMENTE con JSON válido con esta estructura exacta:
{
  "name": "nombre completo",
  "race": "raza/especie",
  "occupation": "ocupación o rol",
  "age": "edad o descripción de edad",
  "gender": "género",
  "appearance": "descripción física detallada (100-150 palabras)",
  "personality": "personalidad, carácter y forma de hablar (100-150 palabras)",
  "backstory": "historia de fondo interesante (150-200 palabras)",
  "motivations": "qué quiere y por qué (50-80 palabras)",
  "secrets": "secreto oscuro o información oculta (50-80 palabras)",
  "quirks": "manerismo, tic o peculiaridad memorable",
  "voiceNotes": "cómo habla, acento, forma de expresarse",
  "relationships": [
    {"name": "nombre", "type": "tipo de relación", "description": "descripción breve"}
  ],
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No se generó contenido");

  return JSON.parse(content) as GeneratedNPC;
}

// ============================================================
// MONSTER GENERATOR
// ============================================================

export interface GeneratedMonster {
  name: string;
  type: string;
  size: string;
  alignment: string;
  challengeRating: string;
  hitPoints: string;
  armorClass: number;
  speed: Record<string, string>;
  stats: Record<string, number>;
  skills: Record<string, number>;
  senses: Record<string, string>;
  languages: string;
  abilities: Array<{ name: string; description: string }>;
  actions: Array<{ name: string; description: string }>;
  reactions: Array<{ name: string; description: string }>;
  legendaryActions: Array<{ name: string; description: string }>;
  lore: string;
  tags: string[];
}

export async function generateMonster(
  context: CampaignContext,
  hints?: string
): Promise<GeneratedMonster> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const prompt = `Eres un diseñador de monstruos para juegos de rol. Crea una criatura única y temática.

CONTEXTO:
- Campaña: ${context.name}
- ${themeCtx}
${hints ? `- Indicaciones: ${hints}` : ""}

Crea un monstruo original que encaje perfectamente en la ambientación, con mecánicas interesantes y trasfondo narrativo.

Responde ÚNICAMENTE con JSON válido:
{
  "name": "nombre",
  "type": "tipo de criatura",
  "size": "Diminuto/Pequeño/Mediano/Grande/Enorme/Gargantuesco",
  "alignment": "alineamiento",
  "challengeRating": "CR como string (ej: '1/2', '5', '20')",
  "hitPoints": "XdX+X",
  "armorClass": 15,
  "speed": {"caminando": "30 ft", "volando": "60 ft"},
  "stats": {"FUE": 18, "DES": 14, "CON": 16, "INT": 10, "SAB": 12, "CAR": 8},
  "skills": {"Percepción": 5, "Sigilo": 4},
  "senses": {"visión en la oscuridad": "60 ft", "percepción pasiva": "15"},
  "languages": "idiomas que conoce",
  "abilities": [{"name": "nombre", "description": "descripción"}],
  "actions": [{"name": "nombre", "description": "descripción con daño"}],
  "reactions": [],
  "legendaryActions": [],
  "lore": "trasfondo e historia de la criatura (100-150 palabras)",
  "tags": ["tag1", "tag2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!) as GeneratedMonster;
}

// ============================================================
// ITEM GENERATOR
// ============================================================

export interface GeneratedItem {
  name: string;
  type: string;
  rarity: string;
  description: string;
  lore: string;
  properties: Record<string, unknown>;
  isArtifact: boolean;
  requiresAttunement: boolean;
  tags: string[];
}

export async function generateItem(
  context: CampaignContext,
  hints?: string
): Promise<GeneratedItem> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const prompt = `Eres un creador de objetos mágicos y especiales para juegos de rol.

CONTEXTO:
- Campaña: ${context.name}
- ${themeCtx}
${hints ? `- Indicaciones: ${hints}` : ""}

Crea un objeto memorable con historia interesante y propiedades únicas.

Responde ÚNICAMENTE con JSON válido:
{
  "name": "nombre del objeto",
  "type": "Arma/Armadura/Objeto maravilloso/Poción/etc",
  "rarity": "COMMON/UNCOMMON/RARE/VERY_RARE/LEGENDARY/ARTIFACT",
  "description": "descripción física y funcional (100-150 palabras)",
  "lore": "historia y origen del objeto (100-150 palabras)",
  "properties": {
    "damage": "descripción de daño si aplica",
    "bonus": "+X a algo si aplica",
    "abilities": ["habilidad 1", "habilidad 2"]
  },
  "isArtifact": false,
  "requiresAttunement": false,
  "tags": ["tag1", "tag2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!) as GeneratedItem;
}

// ============================================================
// QUEST GENERATOR
// ============================================================

export interface GeneratedQuest {
  name: string;
  type: string;
  description: string;
  hook: string;
  objectives: Array<{ description: string; isOptional: boolean }>;
  rewards: { experience?: number; gold?: string; items?: string[]; other?: string };
  complications: string[];
  npcsInvolved: string[];
  locations: string[];
  tags: string[];
}

export async function generateQuest(
  context: CampaignContext,
  hints?: string
): Promise<GeneratedQuest> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const prompt = `Eres un diseñador de aventuras para juegos de rol. Crea una misión/quest completa.

CONTEXTO:
- Campaña: ${context.name}
- ${themeCtx}
${hints ? `- Indicaciones del máster: ${hints}` : ""}

Crea una quest engaging con ganchos narrativos, complicaciones y recompensas apropiadas.

Responde ÚNICAMENTE con JSON válido:
{
  "name": "nombre de la quest",
  "type": "MAIN/SIDE/PERSONAL/FACTION/BOUNTY",
  "description": "descripción completa de la misión (150-200 palabras)",
  "hook": "cómo se presenta la misión a los jugadores (50-80 palabras)",
  "objectives": [
    {"description": "objetivo principal", "isOptional": false},
    {"description": "objetivo secundario", "isOptional": true}
  ],
  "rewards": {
    "experience": 500,
    "gold": "100 monedas de oro",
    "items": ["objeto especial"],
    "other": "favor del gremio de magos"
  },
  "complications": ["complicación 1", "complicación 2"],
  "npcsInvolved": ["nombre PNJ 1", "nombre PNJ 2"],
  "locations": ["lugar 1", "lugar 2"],
  "tags": ["tag1", "tag2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!) as GeneratedQuest;
}

// ============================================================
// SESSION SUMMARY GENERATOR
// ============================================================

export async function generateSessionSummary(
  context: CampaignContext,
  sessionNotes: string,
  previousSummary?: string
): Promise<string> {
  const openai = getOpenAI();

  const prompt = `Eres el cronista oficial de la campaña "${context.name}".

NOTAS DE LA SESIÓN:
${sessionNotes}

${previousSummary ? `RESUMEN DE SESIÓN ANTERIOR:\n${previousSummary}\n` : ""}

Escribe un resumen épico y narrativo de la sesión en español. Debe:
- Estar escrito en tercera persona como si fuera una crónica de aventura
- Capturar los momentos clave, decisiones importantes y giros dramáticos
- Tener un tono literario apropiado para ${context.theme}
- Tener entre 200-400 palabras
- Comenzar con una frase impactante

NO incluyas JSON. Solo el texto narrativo del resumen.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 600,
  });

  return response.choices[0].message.content ?? "No se pudo generar el resumen.";
}

// ============================================================
// LOCATION GENERATOR
// ============================================================

export interface GeneratedLocation {
  name: string;
  type: string;
  description: string;
  history: string;
  secrets: string;
  notableFeatures: string[];
  inhabitants: string[];
  tags: string[];
}

export async function generateLocation(
  context: CampaignContext,
  hints?: string
): Promise<GeneratedLocation> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const prompt = `Eres un diseñador de mundos para juegos de rol.

CONTEXTO:
- Campaña: ${context.name}
- ${themeCtx}
${hints ? `- Indicaciones: ${hints}` : ""}

Crea un lugar memorable y atmosférico que encaje perfectamente en la campaña.

Responde ÚNICAMENTE con JSON válido:
{
  "name": "nombre del lugar",
  "type": "Ciudad/Mazmorra/Taberna/Fortaleza/Bosque/etc",
  "description": "descripción atmosférica detallada (150-200 palabras)",
  "history": "historia y origen del lugar (100-150 palabras)",
  "secrets": "secreto oculto o misterio del lugar (50-80 palabras)",
  "notableFeatures": ["característica 1", "característica 2", "característica 3"],
  "inhabitants": ["tipo de habitante 1", "tipo de habitante 2"],
  "tags": ["tag1", "tag2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!) as GeneratedLocation;
}

// ============================================================
// MASTER ASSISTANT
// ============================================================

export async function askMasterAssistant(
  context: CampaignContext,
  question: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const themeCtx = getThemePromptContext(context.theme, context.system);
  const openai = getOpenAI();

  const systemPrompt = `Eres el Asistente del Máster para la campaña "${context.name}".

Contexto: ${themeCtx}
${context.description ? `Descripción: ${context.description}` : ""}

Eres un experto en juegos de rol y en esta campaña específica. Ayudas al máster con:
- Ideas narrativas y plot twists
- Improvisación de escenas
- Balanceo de encuentros
- Consistencia del lore
- Manejo de jugadores difíciles
- Reglas y mecánicas
- Cualquier duda sobre la campaña

Responde en español, de forma concisa y práctica. Cuando sea relevante, da ejemplos específicos para esta campaña.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: question },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0].message.content ?? "No pude procesar tu pregunta.";
}
