"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  Users,
  Map,
  BookOpen,
  Scroll,
  Dices,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  Package,
  Skull,
  Target,
  Settings,
  Crown,
  ImageIcon,
  LayoutDashboard,
  Mic2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/store/campaign-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isMasterOnly?: boolean;
  badge?: number;
  disabled?: boolean;
  divider?: boolean;
}

interface CampaignSidebarProps {
  campaignSlug: string;
  isMaster: boolean;
  campaignName: string;
  campaignTheme: string;
  userDisplayName: string;
  userAvatarUrl?: string;
}

export function CampaignSidebar({
  campaignSlug,
  isMaster,
  campaignName,
  campaignTheme,
  userDisplayName,
  userAvatarUrl,
}: CampaignSidebarProps) {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useCampaignStore();
  const pathname = usePathname();

  // Close sidebar by default on mobile
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const base = `/${campaignSlug}`;

  const navItems: SidebarItem[] = [
    // — Contenido de campaña —
    { label: "Inicio",         href: base,                   icon: <Home className="h-4 w-4" /> },
    { label: "Personajes",     href: `${base}/characters`,   icon: <Sword className="h-4 w-4" /> },
    { label: "NPCs",           href: `${base}/npcs`,         icon: <Users className="h-4 w-4" /> },
    { label: "Monstruos",      href: `${base}/monsters`,     icon: <Skull className="h-4 w-4" />,    disabled: true },
    { label: "Mundo",          href: `${base}/world`,        icon: <Map className="h-4 w-4" />,      disabled: true },
    { label: "Quests",         href: `${base}/quests`,       icon: <Target className="h-4 w-4" />,   disabled: true },
    { label: "Objetos",        href: `${base}/items`,        icon: <Package className="h-4 w-4" />,  disabled: true },
    { label: "Notas",          href: `${base}/notes`,        icon: <Scroll className="h-4 w-4" />,   disabled: true },
    { label: "Sesiones",       href: `${base}/sessions`,     icon: <Calendar className="h-4 w-4" /> },
    { label: "Lore / Wiki",    href: `${base}/lore`,         icon: <BookOpen className="h-4 w-4" /> },
    { label: "Dados",          href: `${base}/dice`,         icon: <Dices className="h-4 w-4" /> },
    // — Solo máster —
    { label: "Galería",        href: `${base}/gallery`,      icon: <ImageIcon className="h-4 w-4" />, isMasterOnly: true },
    { label: "Mapas",          href: `${base}/maps`,         icon: <Map className="h-4 w-4" />,       isMasterOnly: true, disabled: true },
    { label: "IA Forge",       href: `${base}/ai-forge`,     icon: <Sparkles className="h-4 w-4" />,  isMasterOnly: true },
    // — Comunicación —
    { label: "", href: "", icon: null, divider: true },
    { label: "Chat",           href: `${base}/chat`,         icon: <MessageSquare className="h-4 w-4" /> },
    { label: "Canales de voz", href: `${base}/voice`,        icon: <Mic2 className="h-4 w-4" /> },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.isMasterOnly || isMaster
  );

  const textAnim = {
    animate: { opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -8 },
    transition: { duration: 0.12 },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        aria-label="Navegación de campaña"
        className={cn(
          "relative flex h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shrink-0",
          "md:relative",
          "max-md:fixed max-md:z-50 max-md:top-0 max-md:left-0 max-md:h-screen max-md:!w-60",
          !sidebarOpen && "max-md:!hidden",
        )}
      >
        {/* Inner wrapper clips overflow; toggle button lives outside */}
        <div className="flex flex-col h-full w-full overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] min-h-[64px]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30">
              <Crown className="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
            </div>
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0, x: sidebarOpen ? 0 : -10 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 flex-1"
            >
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest truncate">Campaña</p>
              <p className="text-sm font-display font-semibold text-[var(--text-primary)] truncate leading-tight">
                {campaignName}
              </p>
            </motion.div>
          </div>

          {/* Nav */}
          <nav
            className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 hide-scrollbar-mobile"
            aria-label="Secciones de la campaña"
          >
            {visibleItems.map((item, i) => {
              if (item.divider) {
                return (
                  <div
                    key={`divider-${i}`}
                    className="my-1.5 mx-3 border-t border-[var(--border-subtle)]"
                    aria-hidden="true"
                  />
                );
              }

              const isActive =
                !item.disabled &&
                (pathname === item.href ||
                  (item.href !== base && pathname.startsWith(item.href)));

              if (item.disabled) {
                return (
                  <span
                    key={item.href}
                    title="Próximamente"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm group relative min-h-[40px] opacity-40 cursor-not-allowed select-none"
                  >
                    <span className="shrink-0" aria-hidden="true">{item.icon}</span>
                    <motion.span
                      {...textAnim}
                      className="truncate font-medium text-[var(--text-muted)] flex-1"
                    >
                      {item.label}
                    </motion.span>
                    {sidebarOpen && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0 leading-none">
                        Pronto
                      </span>
                    )}
                    {!sidebarOpen && (
                      <div
                        role="tooltip"
                        className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                      >
                        {item.label} — Próximamente
                      </div>
                    )}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-all duration-150 group relative min-h-[40px]",
                    isActive
                      ? "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768 && sidebarOpen) toggleSidebar();
                  }}
                >
                  <span className="shrink-0" aria-hidden="true">{item.icon}</span>
                  <motion.span {...textAnim} className="truncate font-medium">
                    {item.label}
                  </motion.span>
                  {!sidebarOpen && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--border-subtle)] p-3 space-y-0.5">
            {isMaster && (
              <span
                title="Próximamente"
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm min-h-[40px] opacity-40 cursor-not-allowed select-none"
              >
                <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
                <motion.span
                  animate={{ opacity: sidebarOpen ? 1 : 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-sm text-[var(--text-muted)] flex-1 truncate"
                >
                  Configuración
                </motion.span>
                {sidebarOpen && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0 leading-none">
                    Pronto
                  </span>
                )}
              </span>
            )}

            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-all duration-150 group relative min-h-[40px]",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              )}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
              <motion.span {...textAnim} className="truncate font-medium">
                Volver al dashboard
              </motion.span>
              {!sidebarOpen && (
                <div
                  role="tooltip"
                  className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[var(--shadow-lg)]"
                >
                  Volver al dashboard
                </div>
              )}
            </Link>

            <div className={cn("flex items-center px-1 py-1", !sidebarOpen && "justify-center")}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={userAvatarUrl} alt={`Avatar de ${userDisplayName}`} />
                <AvatarFallback className="text-xs">
                  {userDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

        </div>{/* end inner overflow wrapper */}

        {/* Toggle button — outside overflow wrapper so it's never clipped */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Colapsar barra lateral" : "Expandir barra lateral"}
          aria-expanded={sidebarOpen}
          className="hidden md:flex absolute -right-3 top-20 h-6 w-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-[var(--shadow-md)] z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          )}
        </button>
      </motion.aside>
    </>
  );
}
