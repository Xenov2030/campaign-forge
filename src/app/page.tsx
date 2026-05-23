import Link from "next/link";
import {
  Sword,
  Sparkles,
  Users,
  Map,
  BookOpen,
  Dices,
  Crown,
  ChevronRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: <Crown className="h-6 w-6" />,
    title: "Gestión de Campañas",
    description: "Crea y administra múltiples campañas. Dashboard completo para el máster con control total.",
    color: "var(--accent-gold)",
  },
  {
    icon: <Sword className="h-6 w-6" />,
    title: "Fichas de Personaje",
    description: "Fichas adaptables a cualquier sistema de juego. D&D 5e, CoC, Pathfinder y más.",
    color: "#60a5fa",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "IA Generativa",
    description: "Genera PNJs, monstruos, objetos, quests, ciudades y resúmenes de sesión con GPT-4o.",
    color: "#a855f7",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Multijugador",
    description: "Invita jugadores, gestiona roles y mantén campañas completamente aisladas.",
    color: "#34d399",
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: "Mapas Interactivos",
    description: "Sube mapas, añade marcadores, fog of war y posiciones de personajes en tiempo real.",
    color: "#f59e0b",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Wiki & Lore",
    description: "Wiki interna con timeline, facciones, relaciones y toda la lore de tu mundo.",
    color: "#f87171",
  },
];

const systems = [
  "D&D 5e", "Pathfinder 2e", "Call of Cthulhu",
  "Vampire: La Mascarada", "Shadowrun", "Starfinder", "Personalizado"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/40 flex items-center justify-center">
            <Crown className="h-4 w-4 text-[var(--accent-gold)]" />
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-wider">
            CampaignForge
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)]"
          >
            Comenzar gratis
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-gold)]/5 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-arcane)]/8 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[600px] bg-gradient-to-b from-transparent via-[var(--accent-gold)]/20 to-transparent" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative text-center px-6 max-w-5xl mx-auto stagger-children">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5 text-xs text-[var(--accent-gold)] mb-8">
            <Sparkles className="h-3 w-3" />
            Generación de contenido con GPT-4o
            <Star className="h-3 w-3" />
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-black text-[var(--text-primary)] tracking-tight leading-[0.9] mb-6">
            Forja Tu{" "}
            <span className="gold-text">Leyenda</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            La plataforma definitiva para campañas de rol. Gestiona personajes, mundos y narrativas
            con el poder de la inteligencia artificial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-14 px-8 bg-[var(--accent-gold)] text-[var(--bg-base)] text-base font-bold rounded-[var(--radius-lg)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] font-display tracking-wide"
            >
              <Crown className="h-5 w-5" />
              Crear campaña gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-14 px-8 border border-[var(--border-default)] text-[var(--text-primary)] text-base font-medium rounded-[var(--radius-lg)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all"
            >
              Ver demo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Systems */}
          <div className="mt-16 pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Compatible con
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {systems.map((system) => (
                <span
                  key={system}
                  className="px-3 py-1 rounded-full border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)]/50"
                >
                  {system}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Una plataforma completa diseñada específicamente para narradores y jugadores de rol
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group campaign-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--border-default)] transition-all"
            >
              <div
                className="h-12 w-12 rounded-[var(--radius-md)] flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{
                  backgroundColor: `${feature.color}15`,
                  border: `1px solid ${feature.color}30`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[var(--accent-gold)]/5 blur-[80px]" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">
            Tu próxima campaña épica
            <br />
            <span className="gold-text">comienza aquí</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-10">
            Únete a miles de narradores que ya usan CampaignForge para crear aventuras inolvidables.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-14 px-10 bg-[var(--accent-gold)] text-[var(--bg-base)] text-lg font-bold rounded-[var(--radius-lg)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] font-display"
          >
            <Dices className="h-5 w-5" />
            Empezar aventura
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          © 2025 CampaignForge — Forjando leyendas con IA
        </p>
      </footer>
    </div>
  );
}
