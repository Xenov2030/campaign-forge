"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Users, Skull, Package, Target, Map,
  FileText, Loader2, Save, Copy, Check, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const GENERATORS = [
  { id: "NPC",             label: "NPC",             icon: <Users className="h-5 w-5" />,   color: "#34d399", description: "Personaje no jugador completo con historia y secretos" },
  { id: "MONSTER",         label: "Monstruo",        icon: <Skull className="h-5 w-5" />,   color: "#f87171", description: "Criatura con estadísticas, habilidades y trasfondo" },
  { id: "ITEM",            label: "Objeto",          icon: <Package className="h-5 w-5" />, color: "#f59e0b", description: "Objeto mágico o especial con historia y propiedades" },
  { id: "QUEST",           label: "Quest",           icon: <Target className="h-5 w-5" />,  color: "#a855f7", description: "Misión completa con objetivos y recompensas" },
  { id: "LOCATION",        label: "Localización",    icon: <Map className="h-5 w-5" />,     color: "#38bdf8", description: "Lugar detallado con historia y secretos" },
  { id: "SESSION_SUMMARY", label: "Resumen Sesión",  icon: <FileText className="h-5 w-5" />,color: "#c9a84c", description: "Crónica narrativa de una sesión de juego" },
];

function formatResult(type: string, data: Record<string, unknown>): React.ReactNode {
  const renderers: Record<string, (d: Record<string, unknown>) => React.ReactNode> = {
    NPC: (d) => (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-[var(--accent-gold)]">{String(d.name)}</h3>
            <p className="text-[var(--text-muted)] text-sm">{String(d.race)} · {String(d.occupation)} · {String(d.age)}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-[var(--bg-overlay)] text-[var(--text-muted)] shrink-0">{String(d.gender)}</span>
        </div>
        {(
          [
            { label: "Apariencia", value: d.appearance },
            { label: "Personalidad", value: d.personality },
            { label: "Historia", value: d.backstory },
            { label: "Motivaciones", value: d.motivations },
            { label: "Secreto", value: d.secrets, highlight: true },
            { label: "Peculiaridad", value: d.quirks },
            { label: "Voz", value: d.voiceNotes },
          ] as Array<{ label: string; value: unknown; highlight?: boolean }>
        ).map(({ label, value, highlight }) => value ? (
          <div key={label} className={cn("p-3 rounded-[var(--radius-md)]", highlight ? "bg-red-900/20 border border-red-800/30" : "bg-[var(--bg-elevated)]")}>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{String(value)}</p>
          </div>
        ) : null)}
        {Array.isArray(d.tags) && d.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(d.tags as string[]).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    ),

    MONSTER: (d) => (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[#f87171]">{String(d.name)}</h3>
          <p className="text-[var(--text-muted)] text-sm">{String(d.size)} {String(d.type)} · {String(d.alignment)}</p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs px-2 py-1 rounded bg-red-900/20 text-red-400">CR {String(d.challengeRating)}</span>
            <span className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">PV {String(d.hitPoints)}</span>
            <span className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">CA {String(d.armorClass)}</span>
          </div>
        </div>
        {(d.stats && typeof d.stats === "object") ? (
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(d.stats as Record<string, number>).map(([stat, val]) => (
              <div key={stat} className="text-center p-2 rounded bg-[var(--bg-elevated)]">
                <p className="text-xs text-[var(--text-muted)]">{stat}</p>
                <p className="font-bold text-[var(--text-primary)]">{val}</p>
              </div>
            ))}
          </div>
        ) : null}
        {d.lore ? (
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Trasfondo</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{String(d.lore)}</p>
          </div>
        ) : null}
        {Array.isArray(d.actions) && d.actions.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Acciones</p>
            {(d.actions as Array<{name: string; description: string}>).map((action, i) => (
              <div key={i} className="p-3 rounded mb-2 bg-[var(--bg-elevated)] border-l-2 border-[#f87171]/50">
                <p className="text-sm font-medium text-[var(--text-primary)]">{action.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{action.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    ITEM: (d) => (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[#f59e0b]">{String(d.name)}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">{String(d.type)}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{
              background: d.rarity === "LEGENDARY" ? "rgba(249,115,22,0.15)" : "rgba(168,85,247,0.15)",
              color: d.rarity === "LEGENDARY" ? "#f97316" : "#a855f7",
            }}>
              {String(d.rarity)}
            </span>
          </div>
        </div>
        {(
          [
            { label: "Descripción", value: d.description },
            { label: "Historia", value: d.lore },
          ] as Array<{ label: string; value: unknown }>
        ).map(({ label, value }) => value ? (
          <div key={label} className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{String(value)}</p>
          </div>
        ) : null)}
      </div>
    ),

    QUEST: (d) => (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[#a855f7]">{String(d.name)}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">{String(d.type)}</span>
        </div>
        {(
          [
            { label: "Descripción", value: d.description },
            { label: "Gancho narrativo", value: d.hook },
          ] as Array<{ label: string; value: unknown }>
        ).map(({ label, value }) => value ? (
          <div key={label} className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{String(value)}</p>
          </div>
        ) : null)}
        {Array.isArray(d.objectives) && d.objectives.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Objetivos</p>
            {(d.objectives as Array<{description: string; isOptional: boolean}>).map((obj, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded mb-1 bg-[var(--bg-elevated)]">
                <div className={cn("h-4 w-4 rounded-full border mt-0.5 shrink-0", obj.isOptional ? "border-[var(--text-muted)]" : "border-[#a855f7] bg-[#a855f7]/20")} />
                <span className="text-sm text-[var(--text-primary)]">{obj.description}</span>
                {obj.isOptional && <span className="text-xs text-[var(--text-muted)] shrink-0">(opcional)</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    LOCATION: (d) => (
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[#38bdf8]">{String(d.name)}</h3>
          <p className="text-[var(--text-muted)] text-sm">{String(d.type)}</p>
        </div>
        {(
          [
            { label: "Descripción", value: d.description },
            { label: "Historia", value: d.history },
            { label: "Secreto", value: d.secrets, highlight: true },
          ] as Array<{ label: string; value: unknown; highlight?: boolean }>
        ).map(({ label, value, highlight }) => value ? (
          <div key={label} className={cn("p-3 rounded-[var(--radius-md)]", highlight ? "bg-red-900/20 border border-red-800/30" : "bg-[var(--bg-elevated)]")}>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{String(value)}</p>
          </div>
        ) : null)}
      </div>
    ),

    SESSION_SUMMARY: (d) => (
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-[var(--accent-gold)]">Crónica de Sesión</h3>
        <div className="lore-content p-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{String(d.summary)}</p>
        </div>
      </div>
    ),
  };

  return renderers[type]?.(data) ?? <pre className="text-xs text-[var(--text-muted)]">{JSON.stringify(data, null, 2)}</pre>;
}

export default function AIForgePage({ params }: { params: Promise<{ campaignSlug: string }> }) {
  const { campaignSlug } = use(params);
  const [selectedType, setSelectedType] = useState("NPC");
  const [hints, setHints] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [campaignId, setCampaignId] = useState<string>("");

  // Fetch campaignId from slug
  useState(() => {
    fetch(`/api/campaigns/by-slug/${campaignSlug}`)
      .then((r) => r.json())
      .then((d) => d.id && setCampaignId(d.id))
      .catch(() => {});
  });

  const handleGenerate = async () => {
    if (!campaignId && !campaignSlug) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        type: selectedType,
        campaignId,
        hints: hints.trim() || undefined,
      };

      if (selectedType === "SESSION_SUMMARY") {
        body.additionalContext = { notes: sessionNotes };
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedGen = GENERATORS.find((g) => g.id === selectedType)!;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[var(--accent-arcane)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">IA Forge</h1>
            <p className="text-sm text-[var(--text-muted)]">Genera contenido narrativo con GPT-4o</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Generator picker + config */}
        <div className="lg:col-span-2 space-y-5">
          {/* Type selector */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">¿Qué generar?</p>
            <div className="grid grid-cols-2 gap-2">
              {GENERATORS.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => { setSelectedType(gen.id); setResult(null); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-[var(--radius-md)] text-xs font-medium transition-all border",
                    selectedType === gen.id
                      ? "border-current"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
                  )}
                  style={selectedType === gen.id ? {
                    borderColor: `${gen.color}50`,
                    color: gen.color,
                    background: `${gen.color}10`,
                  } : {}}
                >
                  <span style={selectedType === gen.id ? { color: gen.color } : {}}>{gen.icon}</span>
                  {gen.label}
                </button>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 space-y-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Configuración</p>
            <p className="text-sm text-[var(--text-secondary)]">{selectedGen.description}</p>

            {selectedType === "SESSION_SUMMARY" ? (
              <Textarea
                label="Notas de la sesión"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Escribe lo que ocurrió en la sesión: decisiones de los jugadores, combates, revelaciones importantes..."
                rows={6}
              />
            ) : (
              <Textarea
                label="Indicaciones (opcional)"
                value={hints}
                onChange={(e) => setHints(e.target.value)}
                placeholder={`Ejemplo: "un mercader corrupto que esconde un secreto oscuro" o "una criatura de las profundidades marinas"`}
                rows={4}
              />
            )}

            <Button
              onClick={handleGenerate}
              loading={loading}
              className="w-full"
              style={selectedType ? {
                background: selectedGen.color,
                color: "var(--bg-base)",
              } : {}}
            >
              {loading ? "Generando..." : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar {selectedGen.label}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Result */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]"
              >
                <div className="relative mb-4">
                  <div
                    className="h-16 w-16 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${selectedGen.color}40`, borderTopColor: selectedGen.color }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" style={{ color: selectedGen.color }} />
                  </div>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Forjando {selectedGen.label}...</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">GPT-4o está trabajando</p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-80 bg-[var(--bg-surface)] border border-red-800/40 rounded-[var(--radius-xl)] px-6 text-center"
              >
                <p className="text-red-400 font-medium mb-2">Error al generar</p>
                <p className="text-[var(--text-muted)] text-sm">{error}</p>
                <p className="text-xs text-[var(--text-muted)] mt-3">Verifica que tu API key de OpenAI esté configurada</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span style={{ color: selectedGen.color }}>{selectedGen.icon}</span>
                    <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {selectedGen.label} generado
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm" onClick={handleGenerate} title="Regenerar">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copiar JSON">
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                <div className="p-5 overflow-y-auto max-h-[600px]">
                  {formatResult(selectedType, result)}
                </div>
              </motion.div>
            )}

            {!result && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)]"
              >
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center mb-4 border"
                  style={{ borderColor: `${selectedGen.color}30`, background: `${selectedGen.color}08` }}
                >
                  <span style={{ color: `${selectedGen.color}80` }}>{selectedGen.icon}</span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Selecciona un tipo y haz clic en Generar</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">El contenido se adaptará automáticamente a tu campaña</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
