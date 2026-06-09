# CampaignForge — Contexto del Proyecto y Lineamientos

> **Leer este documento SIEMPRE antes de implementar cualquier cambio, nueva funcionalidad o corrección.**

---

## Versión actual: `2.5`

Historial de versiones en [`.docs/05_changelog.md`](.docs/05_changelog.md).

---

## ¿Qué es CampaignForge?

Plataforma web para la gestión completa de campañas de rol (D&D, Pathfinder, CoC, etc.). Orientada a **narradores (másters) y jugadores** que quieran gestionar personajes, mundo, sesiones y contenido narrativo con asistencia de IA (Gemini). Uso primario: **desktop**. Soporte adicional: mobile.

---

## Mapa rápido del proyecto

```
src/
├── app/
│   ├── (auth)/              → Login, Registro
│   ├── (dashboard)/         → Dashboard, nueva campaña, perfil, panel /admin (solo ADMIN)
│   ├── (campaign)/[slug]/   → Workspace de campaña
│   │   ├── characters/      → Fichas de personaje
│   │   ├── npcs/            → NPCs (visibilidad máster/jugador)
│   │   ├── monsters/        → Bestiario
│   │   ├── world/           → Locaciones, facciones
│   │   ├── quests/          → Misiones
│   │   ├── items/           → Objetos
│   │   ├── sessions/        → Sesiones + resúmenes IA
│   │   ├── lore/            → Wiki por categorías
│   │   ├── gallery/         → Galería visual
│   │   ├── notes/           → Notas privadas
│   │   ├── chat/            → Chat de texto en tiempo real (Pusher)
│   │   ├── dice/            → Historial de tiradas + roller (mock data)
│   │   ├── voice/           → Canales de voz LiveKit (sidebar integrado)
│   │   └── ai-forge/        → Generador IA (máster only)
│   ├── api/                 → Route handlers (auth, campaigns, characters, chat, livekit, etc.)
│   ├── not-found.tsx        → Página 404
│   ├── error.tsx            → Error boundary global
│   └── layout.tsx           → Root layout
├── components/
│   ├── layout/              → CampaignSidebar, TopNav
│   ├── ai/                  → MasterAssistant
│   ├── dice/                → DiceTray, DiceRoller (compartido)
│   ├── realtime/            → CampaignRealtime (Pusher campaign channel)
│   └── ui/                  → Componentes base (Button, Input, Avatar, UnderConstruction, etc.)
├── hooks/
│   └── useChatMessages.ts   → Hook: suscripción a mensajes de chat en tiempo real
├── lib/
│   ├── ai/                  → Integración Gemini 2.0, generadores
│   ├── pusher/              → server.ts (trigger), client.ts (subscribe)
│   ├── mock/                → Mock layer (seed, store, query, client)
│   ├── auth.ts              → JWT + bcrypt
│   ├── version.ts           → APP_VERSION — fuente única del número de versión
│   ├── prisma.ts            → Switch condicional: mock o Prisma real
│   └── supabase/            → Re-exporta getSessionUser (compatibilidad)
├── store/
│   ├── campaign-store.ts    → Zustand (sidebar, dice, AI assistant, chatSendMessage, masterHidingRolls)
│   └── notification-store.ts→ Zustand (badge de mensajes no leídos)
└── types/
    └── index.ts             → Tipos TypeScript globales
```

**Archivos de configuración clave:**
- `prisma/schema.prisma` — Esquema de base de datos
- `src/app/globals.css` — Design system (CSS variables, tokens, animaciones)
- `.env.local` — Variables de entorno (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAILS`, `GEMINI_API_KEY`, `PUSHER_*`, `LIVEKIT_*`, etc.)
- `.env.local.example` — Plantilla documentada de variables
- `next.config.ts` — Config Next.js

---

## Stack tecnológico (resumen)

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.x (App Router) + React 19 + TypeScript 5 |
| Estilos | Tailwind CSS v4 + CSS Variables (design system propio) |
| Base de datos | PostgreSQL (Neon) vía Prisma v7 + adapter-pg |
| Modo dev | Mock layer JSON (sin DB, activado con `MOCK_MODE=true`) |
| Auth | JWT (jose) + bcrypt + cookie httpOnly `cf_session` |
| IA | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Realtime (chat) | Pusher Channels (`pusher` + `pusher-js`) |
| Voz | LiveKit (`livekit-server-sdk` + `livekit-client`) |
| Estado | Zustand v5 |
| Notificaciones UI | Sonner v2 |
| UI | Radix UI + shadcn/ui pattern + Lucide React + Framer Motion |
| Tipografías | Cinzel (display), Crimson Text (body), Inter (UI) |

---

## Sistema de versionado

### Formato: `MAJOR.MINOR`

| Dígito | Cuándo incrementar |
|--------|-------------------|
| **MAJOR** | Nueva funcionalidad significativa, cambios de arquitectura, nuevos módulos completos |
| **MINOR** | Fixes visuales, mejoras de UX, correcciones, ajustes de performance, refactors pequeños |

### Dónde vive la versión

1. **Este archivo** (`CONTEXT.md`) — línea `## Versión actual: X.Y`
2. **`README.md`** — badge o línea de versión en el encabezado
3. **`src/lib/version.ts`** — constante `APP_VERSION` (usada en la UI)
4. **`.docs/05_changelog.md`** — entrada con fecha, versión y descripción
5. **`public/changelog.html`** — changelog visual para el browser

---

## Lineamientos obligatorios para cada cambio

### Antes de implementar
1. Leer este documento (`CONTEXT.md`) completo.
2. Leer `.docs/06_mejoras.md` para ver si el cambio ya está listado y tiene contexto.
3. Si es una funcionalidad nueva, consultar `.docs/01_alcance.md` para coherencia de scope.

### Durante la implementación
1. Seguir los patrones existentes del codebase (ver sección *Patrones de código*).
2. No romper mobile ni desktop — la app es desktop-first pero debe funcionar en mobile.
3. Usar las CSS variables del design system (`var(--bg-base)`, `var(--accent-gold)`, etc.) — nunca hardcodear colores.
4. Todos los íconos via Lucide React — nunca emojis como íconos de UI.
5. Accesibilidad mínima: `aria-label` en botones de ícono, `aria-current="page"` en nav activo, `alt` en imágenes.

### Después de implementar
Completar TODOS los pasos siguientes sin excepción:

- [ ] **Incrementar versión** en `CONTEXT.md`, `README.md` y `src/lib/version.ts`
- [ ] **Actualizar `README.md`** — agregar/editar la sección de funcionalidades si aplica
- [ ] **Agregar entrada en `05_changelog.md`** — con versión, fecha, tipo y descripción
- [ ] **Actualizar `public/changelog.html`** — agregar la nueva versión al HTML visual
- [ ] **Actualizar `01_alcance.md`** — si se agregó o cambió scope funcional
- [ ] **Actualizar `02_tecnico.md`** — si cambió arquitectura, stack, API o schema
- [ ] **Actualizar `04_implementacion.md`** — si cambió setup, configuración o flujos
- [ ] **Actualizar `06_mejoras.md`** — marcar como completado si era una mejora listada, o agregar nuevas que se descubran

---

## Patrones de código a seguir

### Páginas (Server Components)
```tsx
// Siempre obtener user con getUser() y redirigir si no existe
const user = await getUser();
if (!user) redirect("/login");

// Usar notFound() si el recurso no existe
if (!campaign) notFound();
```

### Componentes client-side
```tsx
"use client";
// Estado con useState/useReducer
// Store global con useCampaignStore() o useNotificationStore()
// Queries de datos con fetch() en handlers
```

### CSS / Estilos
```tsx
// Siempre usar CSS variables del design system
className="bg-[var(--bg-surface)] text-[var(--text-primary)]"

// Responsive: mobile-first con breakpoints sm/md/lg
className="px-4 sm:px-6 md:px-8"

// Nunca hardcodear colores arbitrarios sin razón
// Nunca usar text-gray-500 cuando hay --text-muted disponible
```

### API Routes
```ts
// Siempre validar auth al inicio
const user = await getUser();
if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

// Siempre devolver errores con status codes correctos
// Siempre usar try/catch y manejar errores de Prisma
```

### Realtime (Pusher)
```ts
// Server — trigger de evento:
import pusher, { campaignChannel } from "@/lib/pusher/server";
pusher.trigger(campaignChannel(campaignId), "event-name", payload).catch(() => {});

// Client — suscripción:
import { getPusherClient } from "@/lib/pusher/client";
const pusher = getPusherClient();
const channel = pusher.subscribe(`chat-${roomId}`);
channel.bind("new-message", handler);
// Cleanup: channel.unbind("new-message", handler); pusher.unsubscribe(...)
```

### Nuevas páginas
- Agregar `loading.tsx` como skeleton de carga
- Verificar que tenga `metadata` export si es Server Component
- Asegurar responsive en 375px, 768px, 1280px

---

## Design system — Variables principales

```css
/* Fondos */
--bg-base: #0a0a0f       /* Fondo principal */
--bg-surface: #111118    /* Tarjetas, paneles */
--bg-elevated: #1a1a26   /* Elementos elevados */
--bg-overlay: #22223a    /* Modales, overlays */

/* Texto */
--text-primary: #f0ece6   /* Texto principal (contraste alto) */
--text-secondary: #9a9087 /* Texto secundario */
--text-muted: #7a7470     /* Texto terciario (WCAG AA: 4.5:1) */

/* Acentos */
--accent-gold: #c9a84c    /* Acción primaria, CTA, activo */
--accent-arcane: #7c3aed  /* Magia, IA, arcano */
--accent-crimson: #8b1a1a /* Peligro, horror */
--accent-ice: #38bdf8     /* Información, sci-fi */
--accent-nature: #22c55e  /* Éxito, naturaleza */
```

---

## Notas de arquitectura importantes

1. **Auth**: JWT en cookie httpOnly (`cf_session`), 7 días de expiración. `getUser()` en `lib/supabase/server.ts` re-exporta `getSessionUser()` de `lib/auth.ts`.
2. **Mock mode**: Activar con `MOCK_MODE=true` en `.env.local`. `lib/prisma.ts` devuelve el mock client en lugar de PrismaClient.
3. **Rutas**: Las rutas de campaña usan `[campaignSlug]`. El layout de campaña resuelve el slug y valida membresía.
4. **Sidebar state**: `sidebarOpen` vive en Zustand (`campaign-store.ts`). En mobile se cierra automáticamente al navegar.
5. **IA**: Todas las llamadas a Gemini pasan por `src/lib/ai/`. El cliente se crea lazy en `lib/ai/openai.ts` (mantiene el nombre de archivo por compatibilidad de imports). El modelo usado es `gemini-2.0-flash`.
6. **Temas**: Los temas de campaña modifican las CSS variables via `data-theme` en el layout.
7. **Prisma**: Usar siempre el singleton de `lib/prisma.ts`. No importar `PrismaClient` directamente.
8. **Realtime**: El layout de campaña monta `<CampaignRealtime>` que suscribe al canal `campaign-{id}` (Pusher). Llama `router.refresh()` ante `member-joined` y `character-created`. La bandeja de dados usa `chatSendMessage` del store para enviar tiradas al chat cuando el usuario está en esa página.
9. **Scroll**: El layout de campaña usa `<main className="flex-1 overflow-y-auto min-h-0">` — el `min-h-0` es crítico para que flex items scrolleen correctamente.
10. **Roles globales** (`User.role`: `PLAYER` | `MASTER` | `ADMIN`): es la **capacidad de cuenta**, distinta del rol por campaña (`CampaignMember.role`). Solo `MASTER`/`ADMIN` pueden crear campañas; `ADMIN` accede a `/admin`. Se asigna por defecto `PLAYER` y se promueve a `ADMIN` por la allowlist de entorno `ADMIN_EMAILS` (en `registerUser` y `loginUser`, ver `lib/auth.ts`). Enforcement en 3 capas: API (`403`), UI (CTA oculto) y guard de ruta. La promoción nunca degrada.
