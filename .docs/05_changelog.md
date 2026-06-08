# CampaignForge — Changelog

> Formato: `## [MAJOR.MINOR] — YYYY-MM-DD`
> Tipos: `feat` (nueva funcionalidad), `fix` (corrección), `refactor`, `chore`, `docs`

---

## [2.3] — 2026-06-08

### fix + feat(ui) — Scroll fix, Toaster, landing CTA actualizada, dashboard UI

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `(campaign)/layout.tsx` | `min-h-0` en `<main>` (fix scroll definitivo en flexbox). `<Toaster position="top-right" richColors />` de Sonner agregado. |
| `page.tsx` (landing) | CTA section: "Empezar gratis" → "Crear cuenta" + "Ver demo primero" → "Iniciar sesión". Íconos actualizados (`UserPlus`, `LogIn`). Demo login eliminado. |
| `(auth)/login/page.tsx` | Mensaje de error de servidor simplificado a lenguaje no técnico. Mensaje de demo unavailable también simplificado. |
| `(auth)/register/page.tsx` | Mismo fix de mensaje de error de servidor. |
| `(dashboard)/dashboard/page.tsx` | Stats grid movido al final (debajo de campañas). Reemplazado por fila compacta inline (`flex-wrap gap-x-6`). Campañas aparecen primero. |
| `(campaign)/[slug]/page.tsx` | 4 tarjetas grandes de stats + lista de secciones rápidas reemplazadas por un único grid compacto de 8 chips (todos los módulos con ícono + número + label). Eliminado import de `ArrowRight`. |

**Bugs resueltos:**
- Scroll roto en todas las páginas del workspace: `flex-1` sin `min-h-0` en flexbox tiene `min-height: auto` por defecto CSS, lo que impide que `overflow-y-auto` active. Fix: `min-h-0` en `<main>`.
- Mensajes de error técnicos visibles para el usuario final (Prisma generate, database URL).

**Rama:** `develop`

---

## [2.2] — 2026-06-07

### feat(dice) + fix(nav) — Bandeja de dados global, botón navbar eliminado, switch ocultar tiradas mejorado

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `components/dice/dice-tray.tsx` | Reescrito. Tab vertical persistente en el borde derecho (`fixed right-0 top-1/2`) visible desde **cualquier página** del workspace. Switch de tiradas ocultas rediseñado: toggle pill animado + labels descriptivos + ícono Eye/EyeOff. `handleRollComplete` envía al chat vía `chatSendMessage` del store cuando el usuario está en la página de chat. |
| `components/layout/top-nav.tsx` | Botón de dados (`Dices`) eliminado del navbar tanto para máster como jugador. |
| `store/campaign-store.ts` | Nuevos campos: `chatSendMessage` (función ref del hook de chat), `setChatSendMessage`, `masterHidingRolls`, `setMasterHidingRolls`. |
| `(campaign)/layout.tsx` | `<DiceTray isMaster={isMaster} />` — pasa prop `isMaster`. |
| `(campaign)/[slug]/chat/page.tsx` | Registra `sendMessage` en el store via `setChatSendMessage` en `useEffect`. Elimina el panel de dados inline (ya no necesario, está en la bandeja global). |

**Comportamiento de la integración dados → chat:**
- Bandeja de dados siempre visible (tab en borde derecho).
- Al tirar, si el usuario está en `/chat`: el resultado se envía automáticamente al chat como `DICE_ROLL`.
- Si está en otra página: se registra en el historial local pero no se envía al chat (porque `chatSendMessage` es `null`).

**Rama:** `develop`

---

## [2.1] — 2026-06-07

### feat(int) — Realtime sync campaña, notificaciones, migración Gemini, renombrado NPCs

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `components/realtime/campaign-realtime.tsx` | Componente client-side montado en el layout. Suscribe al canal Pusher `campaign-{id}`. En `member-joined`: llama `router.refresh()` + toast de bienvenida al máster. En `character-created`: llama `router.refresh()`. También suscribe al canal de chat para contar mensajes no leídos cuando el usuario NO está en la página de chat. |
| `store/notification-store.ts` | Zustand store para `unreadChatCount`. Incrementado por `CampaignRealtime` al recibir mensajes ajenos; limpiado al navegar al chat. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `lib/ai/openai.ts` | Reescrito con `GoogleGenerativeAI` de `@google/generative-ai`. Mantiene el mismo nombre de archivo para no romper imports. `AI_ENABLED` ahora verifica `GEMINI_API_KEY`. Función `getGenAI()` retorna cliente Gemini. |
| `lib/ai/generators.ts` | Reescrito con Gemini. Helper `generateJSON<T>()` usa `responseMimeType: "application/json"`. Asistente usa `model.startChat()` mapeando historial (`assistant` → `model`). Modelo: `gemini-2.0-flash`. |
| `package.json` | `"openai": "^6.39.0"` → `"@google/generative-ai": "^0.24.0"`. |
| `api/campaigns/join/route.ts` | Trigger Pusher `member-joined` en canal `campaign-{id}` después de crear membership. |
| `api/characters/route.ts` | Trigger Pusher `character-created` en canal `campaign-{id}` después de crear personaje. |
| `lib/pusher/server.ts` | Helper `campaignChannel(id)` para nombre canónico de canal de campaña. |
| `components/layout/campaign-sidebar.tsx` | Badge rojo con contador de no leídos en ítem Chat. |
| Múltiples archivos | Renombrado "PNJ" / "PNJs" → "NPC" / "NPCs" en toda la UI (labels, títulos, sidebar). |

**Rama:** `develop`

---

## [2.0] — 2026-06-07

### feat(chat) — Chat de texto en tiempo real (Pusher) + LiveKit voz sidebar + rediseño dice/sidebar

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `app/(campaign)/[slug]/chat/page.tsx` | Chat completo reescrito: mensajes de texto en tiempo real, renders diferenciados para mensajes de texto y tiradas de dados (`DiceRollMessage`), auto-scroll, input con Shift+Enter, fondo animado con imagen de galería como overlay. |
| `hooks/useChatMessages.ts` | Hook que combina carga inicial (API) + realtime (Pusher canal `chat-{roomId}`). Deduplicación por ID. Unbind limpio con handler ref. Agrega el mensaje del emisor localmente al instante (no espera roundtrip Pusher). |
| `lib/pusher/client.ts` | Singleton del cliente Pusher para el browser. `getPusherClient()` retorna `null` si faltan las env vars (degradación graceful). |
| `lib/pusher/server.ts` | Cliente Pusher server-side + helper `campaignChannel()`. |
| `app/api/chat/rooms/route.ts` | `GET /api/chat/rooms?campaignId=` — lista salas de texto/voz. |
| `app/api/chat/[roomId]/route.ts` | `GET` lista mensajes con paginación. `POST` crea mensaje y dispara evento Pusher `new-message` en canal `chat-{roomId}`. |
| `components/dice/dice-roller.tsx` | Componente de roller extraído — reutilizable en bandeja y en página `/dice`. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `components/layout/campaign-sidebar.tsx` | Sección de canales de voz integrada en la nav (LiveKit rooms pasados como prop desde el layout). Canales aparecen como sub-items colapsables. Badge de versión en footer. |
| `app/(campaign)/layout.tsx` | Auto-inicialización de salas de chat (TEXT + dos VOICE) en la primera visita. Serialización de `voiceRooms` para pasarlas al sidebar. `<CampaignRealtime>` montado aquí. |
| `app/(campaign)/[slug]/voice/page.tsx` | Reemplazado placeholder por página informativa que explica que los canales de voz están en el sidebar. |

**Integración Pusher — flujo de mensaje:**
```
Usuario escribe → POST /api/chat/[roomId] → DB insert → pusher.trigger("new-message")
→ Todos los clientes suscritos reciben el evento
→ setMessages() con dedup por ID (el emisor ya lo agregó localmente)
```

**Rama:** `feat/chat-texto-y-voz` → merge a `develop`

---

## [1.6] — 2026-06-04

### feat(dice) + fix(nav) + fix(sidebar) — Página de dados, nav refinado, versión en UI

**Archivos nuevos:**
- `src/components/dice/dice-roller.tsx` — Componente de tirada extraído de `DiceTray`. Reutilizable en la bandeja y en la página `/dice`.
- `src/app/(campaign)/[campaignSlug]/dice/page.tsx` — Página de dados con historial mock (izquierda) y roller inline (derecha). Disclaimer de datos simulados. Badges automáticos `¡CRÍTICO!` / `PIFIA`.
- `src/lib/version.ts` — Constante `APP_VERSION` como fuente única de verdad para el número de versión.

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `dice-tray.tsx` | Reescrito con `AnimatePresence` correcto: backdrop y panel son hijos condicionales separados dentro de su propio `<AnimatePresence>`. Fix definitivo del bug "bandeja no abre". |
| `top-nav.tsx` | Nueva prop `isMaster?: boolean`. Botón Sparkles (IA) solo se renderiza si `isMaster`. Avatar convertido a `<Link href="/profile">`. |
| `campaign-sidebar.tsx` | Dados habilitado. Badge de versión `v{APP_VERSION}` en footer. |
| `(campaign)/layout.tsx` | Pasa `isMaster` a `TopNav`. |
| `(dashboard)/layout.tsx` | Email removido del nav. Avatar como `<Link href="/profile">`. Footer con `CampaignForge v{APP_VERSION}`. |

**Rama:** `fix/visuales`

---

## [1.5] — 2026-06-04

### fix(ui) — Sidebar reordenado, texto persistente, Chat/Voz en construcción

**Archivos nuevos:**
- `src/components/ui/under-construction.tsx` — Componente reutilizable "en construcción".
- `src/app/(campaign)/[campaignSlug]/chat/page.tsx` — Página en construcción (reemplazada en v2.0).
- `src/app/(campaign)/[campaignSlug]/voice/page.tsx` — Página en construcción (reemplazada en v2.0).

**Bugs resueltos:**
- Texto del sidebar desaparecía al navegar desde una 404: `AnimatePresence` con early-return causaba opacity 0 atascado. Fix: `motion.span` siempre en DOM.
- Botón toggle del sidebar recortado: `overflow-hidden` en `motion.aside` cortaba el botón `absolute -right-3`.

**Rama:** `fix/visuales`

---

## [1.4] — 2026-06-04

### feat(mock): modo de desarrollo sin base de datos

**Archivos nuevos:**
- `src/lib/mock/seed.ts` — Datos iniciales: campaña "La Maldición de Strahd" precargada.
- `src/lib/mock/store.ts` — Store global en memoria + persistencia en `data/mock-db.json`.
- `src/lib/mock/query.ts` — Motor de queries compatible con Prisma (where, include, _count, etc.).
- `src/lib/mock/client.ts` — Clon del cliente Prisma con todos los modelos.

**Para activar:** `MOCK_MODE=true` en `.env.local`. Login: `master@demo.com` / `player@demo.com` con cualquier contraseña.

**Rama:** `fix/visuales`

---

## [1.3] — 2026-06-04

### fix(auth) — Login robusto, demo login funcional, hero sin CTAs duplicados

**Bugs resueltos:**
- `"Unexpected token '<'"` al login: API devolvía HTML 500 cuando Prisma no generado. Fix: verificar `content-type` antes de parsear.
- Demo login sin feedback al usuario.
- `useSearchParams()` sin `<Suspense>` en App Router.

**Rama:** `fix/visuales`

---

## [1.2] — 2026-06-04

### fix(ui) — Demo login, CTAs coherentes, cursor-pointer y hover effects

**Archivos nuevos:**
- `src/app/api/auth/demo-login/route.ts` — Auto-login como `master@demo.com`.

**Mejoras:** CTAs de landing reorganizados. `cursor-pointer` global en elementos interactivos. Hover effects en inputs, textareas, select, stat cards.

**Rama:** `fix/visuales`

---

## [1.1] — 2026-06-04

### fix(ui) — Mejoras de UX visual, accesibilidad y responsividad móvil

**Archivos nuevos:**
- `src/app/not-found.tsx` — Página 404 temática "Tierra Inexplorada".
- `src/app/error.tsx` — Error boundary global.
- `src/app/(dashboard)/dashboard/loading.tsx` — Skeleton de carga.
- `src/app/(campaign)/[campaignSlug]/loading.tsx` — Skeleton de carga.

**Mejoras:** Contraste WCAG AA en `--text-muted`, `prefers-reduced-motion`, sidebar mobile como overlay, `aria-label` en todos los botones, breadcrumb truncado responsive.

**Rama:** `fix/visuales`

---

## [1.0] — 2026-06-04

### feat — Sistema completo de gestión de campañas listo para producción

**Módulos implementados:** Auth, Dashboard multi-campaña, Wizard de campaña, invitación por código, workspace con sidebar, fichas de personaje, NPCs, monstruos, locaciones, facciones, items, quests, sesiones con resúmenes IA, Wiki/Lore, galería, notas, chat, dados (d4-d100), IA Forge (6 generadores), asistente del máster, temas dinámicos por campaña, design system CSS, animaciones Framer Motion, layout responsive desktop-first.

**Rama:** `master` — Commit: `c70e01e`
