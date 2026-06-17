# CampaignForge — Changelog

> Formato: `## [MAJOR.MINOR] — YYYY-MM-DD`
> Tipos: `feat` (nueva funcionalidad), `fix` (corrección), `refactor`, `chore`, `docs`

---

## [2.9] — 2026-06-17

### feat(int) — Sección Objetos completa (catálogo, recompensas de misión, inventario)

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `src/lib/items.ts` | Helper central: enums de rareza, labels, colores por rareza, `MISSION_REWARD_TAG`. |
| `src/app/api/items/route.ts` | `GET` (filtros por campaignId, tag, visibilidad) + `POST` crear objeto (solo máster). |
| `src/app/api/items/[id]/route.ts` | `PATCH` (edición parcial vía helper `getOwnedItem`) + `DELETE` (solo máster). |
| `src/app/api/inventory/route.ts` | `POST` asignar objeto del catálogo al inventario de un personaje (solo máster). |
| `src/app/api/inventory/[id]/route.ts` | `DELETE` quitar ítem del inventario (dueño del personaje o máster). |
| `src/app/(campaign)/[campaignSlug]/items/page.tsx` | Lista del catálogo con filtros de rareza y tipo dinámico. |
| `src/app/(campaign)/[campaignSlug]/items/item-card.tsx` | Card con imagen/ícono, badge de rareza, toggle optimista de visibilidad (máster). |
| `src/app/(campaign)/[campaignSlug]/items/items-list.tsx` | Componente cliente: grid 4 col, filtros multi-rareza con colores. |
| `src/app/(campaign)/[campaignSlug]/items/new/page.tsx` | Página de creación. |
| `src/app/(campaign)/[campaignSlug]/items/[itemId]/page.tsx` | Detalle: badges, descripción, lore, tags, panel de asignación (máster) y danger zone. |
| `src/app/(campaign)/[campaignSlug]/items/[itemId]/edit/page.tsx` | Página de edición (solo máster). |
| `src/components/campaign/item-form.tsx` | Formulario con `ImageCropUpload`, rareza, tipo, descripción/lore, 4 toggles (artefacto, sintonización, visibilidad, recompensa de misión). |
| `src/components/campaign/item-danger-zone.tsx` | Doble confirmación para eliminar objeto. |
| `src/components/campaign/assign-to-inventory.tsx` | Panel en el detalle del objeto: selector de personaje + cantidad + botón "Asignar". |
| `src/components/campaign/inventory-list.tsx` | Lista de inventario en la ficha del personaje: link al objeto, cantidad, quitar optimista. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `prisma/schema.prisma` | `Item.isKnownToParty Boolean @default(false)` + `@@index([campaignId])`. |
| `src/components/layout/campaign-sidebar.tsx` | Entrada "Objetos" habilitada (eliminado `disabled: true`). |
| `src/components/campaign/quest-form.tsx` | `useEffect` que fetcha ítems con tag `"Objeto de misión"` y rellena el selector de recompensa. |
| `src/app/(campaign)/[campaignSlug]/quests/[questId]/edit/page.tsx` | Pasa `campaignId` al `QuestForm` para que cargue los objetos de recompensa. |
| `src/app/(campaign)/[campaignSlug]/quests/[questId]/page.tsx` | Resuelve el ítem de recompensa desde DB y lo muestra como chip clickeable (Package icon). |
| `src/app/(campaign)/[campaignSlug]/characters/[characterId]/page.tsx` | Incluye `inventory` en la query; sección "Inventario" con `InventoryList`. |

**Reglas clave:**
- **Rareza** con 6 niveles (COMMON → ARTIFACT) con colores por nivel.
- **Recompensa de misión**: se implementa como tag sentinel `"Objeto de misión"` en el array `tags`, sin campo extra en el schema. El formulario lo gestiona transparentemente como checkbox.
- **Visibilidad**: filtro en la query `where` (no en JS) — nunca viajan datos ocultos al cliente jugador.
- **Inventario denormalizado**: `InventoryItem.name` copia el nombre del ítem al asignarlo — si el objeto se borra del catálogo, el inventario conserva el nombre histórico.
- **Roles**: asignar a inventario → solo máster; quitar del inventario → dueño del personaje o máster.

**Rama:** `develop`

---

## [2.8] — 2026-06-10

### feat(quests) — Módulo de Misiones completo + borrado de campaña

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `src/lib/quests.ts` | Helper central: enums/labels, opciones de tipo (sin BOUNTY), colores por tipo, `sanitizeObjectives`/`sanitizeRewards` y `autoStatusFromObjectives`. |
| `src/app/api/quests/route.ts` | `POST` crear misión (solo máster). |
| `src/app/api/quests/[id]/route.ts` | `PATCH` (máster edita todo; jugador solo tilda objetivos de misiones visibles) + `DELETE` (máster). Auto-completado server-side. |
| `src/app/(campaign)/[campaignSlug]/quests/{page,quests-list,quest-card}.tsx` | Lista a ancho completo con filtros por estado y por tipo, card con progreso y estado editable. |
| `src/app/(campaign)/[campaignSlug]/quests/{new,[questId],[questId]/edit}/page.tsx` | Crear, detalle (objetivos tildables, recompensas, notas del máster) y editar. |
| `src/app/(campaign)/[campaignSlug]/home-quests.tsx` | Misiones del inicio: clickeables, con tipo en color, progreso y filtro por tipo. |
| `src/components/campaign/{quest-form,quest-objectives,quest-status-select,quest-danger-zone}.tsx` | Form reutilizable con editor de objetivos, checklist colaborativa, selector de estado y zona de peligro. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `src/app/api/campaigns/by-slug/[slug]/route.ts` | `DELETE` de campaña (solo máster, borrado en cascada; el baúl de NPCs se conserva). |
| `src/app/(campaign)/[campaignSlug]/settings/settings-form.tsx` | Zona de peligro activada con doble confirmación. |
| `src/components/layout/campaign-sidebar.tsx` | Entrada "Quests" habilitada. |

**Reglas clave:**
- **Auto-completado**: al tildar todos los objetivos, la misión pasa a `COMPLETED`; si se destilda alguno vuelve a `ACTIVE`. El estado explícito del máster gana sobre el derivado.
- **Objetivos colaborativos**: el jugador miembro puede tildar objetivos de misiones visibles (no editar nada más).
- **Tipos con color** (Principal/Secundaria/Personal/Facción); BOUNTY queda fuera de formularios y filtros.
- Borrar campaña preserva el baúl de NPCs (cuelga de `userId`, no de la campaña).

**Rama:** `develop`

---

## [2.7] — 2026-06-10

### feat(npcs) — Sección NPCs completa + baúl de NPCs reutilizables

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `src/app/api/npcs/[id]/route.ts` | `PATCH` (edición parcial: form completo o toggle de un campo) + `DELETE`. |
| `src/app/api/npc-vault/route.ts` + `[id]/route.ts` | Baúl: `GET` listar, `POST` guardar copia (snapshot), `DELETE` quitar entrada. |
| `src/app/api/npcs/import/route.ts` | Importa entradas del baúl como NPCs nuevos en la campaña. |
| `src/components/campaign/{npc-form,npc-danger-zone,npc-hp-control}.tsx` | Form reutilizable (crear/editar), zona de peligro con guardado al baúl, control de vida del máster. |
| `src/app/(campaign)/[campaignSlug]/npcs/{npcs-list,npc-card,vault-picker}.tsx` + `[npcId]/edit/page.tsx` | Lista con filtro de visibilidad, card estilo personajes, modal multiselect del baúl, edición. |

**Reglas clave:**
- **Visibilidad** oculto/conocido con toggle rápido y filtro (Todos/Visibles/Ocultos), solo máster.
- **Vida** (`hitPoints`/`maxHitPoints`) editable solo por el máster (card y detalle); nunca sale al cliente del jugador.
- **Apodo** (`nickname`) en NPC y en el baúl.
- **Baúl** (`VaultNpc`, por usuario): cada "Guardar" crea una **copia independiente** (snapshot); editar un NPC no afecta el baúl. Importar copia a la campaña actual.

**Schema:** `NPC.nickname/hitPoints/maxHitPoints/vaultNpcId`, modelo `VaultNpc` (onDelete SetNull en el vínculo).

**Rama:** `develop`

---

## [2.6] — 2026-06-10

### feat(int) — Comunidad: jugadores, solicitudes de unión, notificaciones y perfil

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `src/app/api/campaigns/[id]/members/[userId]/route.ts` | `DELETE` para expulsar (máster) o abandonar (jugador): borra membresía + personajes. |
| `src/app/api/join-requests/[id]/route.ts` | `POST` aceptar/rechazar solicitud (solo máster) con notificación al jugador. |
| `src/app/api/notifications/route.ts` | `GET` lista + no leídas; `POST` marcar todas como leídas. |
| `src/components/layout/notification-bell.tsx` | Campana con badge, popover y realtime (`user-{id}`), aceptar/rechazar inline. |
| `src/components/campaign/character-danger-zone.tsx` | Eliminar personaje / expulsar jugador con doble confirmación. |
| `src/components/ui/image-crop-upload.tsx` | Recorte + subida de imágenes (retrato/banner/avatar). |

**Archivos modificados (destacados):**

| Archivo | Cambios |
|---------|---------|
| `src/app/api/campaigns/join/route.ts` | Pasa de unión directa a **solicitud** (JoinRequest PENDING + notificación al máster). |
| `src/app/(dashboard)/profile/page.tsx` + `api/profile/route.ts` | Avatar, correo editable (validación de formato y unicidad) sin scroll. |
| `src/app/(campaign)/[campaignSlug]/settings/` | Banner y **tema/ambientación** editables. |
| `src/app/(dashboard)/dashboard/page.tsx` | Banner en las cards, flag de máster, botón "Unirse a campaña" persistente. |
| Auth pages, dashboard, perfil, unirse | Anchos unificados al de las secciones; login/registro/unirse con layout de dos columnas. |

**Schema:** `JoinRequest`, `Notification` + relaciones; `Campaign.bannerImage`, `User.avatarUrl`.

**Rama:** `develop`

---

## [2.5] — 2026-06-09

### feat(characters) — Edición visual de personajes con retrato/banner y layout refinado

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `src/components/ui/image-crop-upload.tsx` | Componente client-side para seleccionar, recortar y subir imágenes a Cloudinary antes de guardarlas en la ficha. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `src/components/campaign/character-form.tsx` | Formulario de personaje reorganizado: stats más compactos, orden narrativo refinado, edición completa y uso de `ImageCropUpload` para retrato y banner. |
| `src/app/(campaign)/[campaignSlug]/characters/[characterId]/edit/page.tsx` | Nueva carga de `portraitUrl` y `bannerUrl` en la edición, manteniendo permisos para dueño y máster. |
| `src/app/(campaign)/[campaignSlug]/characters/[characterId]/page.tsx` | Detalle de personaje más compacto, con banner de cabecera, retrato real y CTA visible de edición. |
| `src/app/api/characters/[id]/route.ts` | Soporte para `PATCH` de ficha completa: clase, trasfondo, ideales, stats, HP máximos, velocidad y URLs de imágenes. |
| `src/app/api/characters/route.ts` | Persistencia de `portraitUrl` y `bannerUrl` al crear personajes. |
| `src/app/api/upload/route.ts` | Upload autenticado a Cloudinary para imágenes JPEG/PNG/WebP/GIF hasta 8 MB. |
| `prisma/schema.prisma` | `Character.bannerUrl` e `ideals` alineados con la base actual y el flujo de edición. |
| `package.json` / `package-lock.json` | Dependencias de `cloudinary` y `react-easy-crop` para soportar el flujo visual de imágenes. |

**Verificación realizada:**
- `npm run build`
- Actualización Prisma directa con el mismo payload que había fallado en `PATCH /api/characters/[id]`, confirmando que la escritura ya funciona con `portraitUrl` y `bannerUrl`.

**Rama:** `develop`

---

## [2.4] — 2026-06-09

### feat(int) — Roles globales de cuenta (PLAYER/MASTER/ADMIN) + panel de administración

**Archivos nuevos:**

| Archivo | Descripción |
|---------|-------------|
| `(dashboard)/admin/layout.tsx` | Guard del panel: solo `role === ADMIN`, redirige al resto. |
| `(dashboard)/admin/page.tsx` | Página del panel: lista usuarios y monta `UsersTable`. |
| `components/admin/users-table.tsx` | Tabla client con switch PLAYER↔MASTER (optimistic + toast Sonner), badge de rol y fecha de registro. |
| `api/admin/users/route.ts` | `GET` lista de usuarios. Solo ADMIN. |
| `api/admin/users/[id]/route.ts` | `PATCH` cambia rol (solo PLAYER/MASTER; no toca admins ni a uno mismo). Solo ADMIN. |
| `(dashboard)/dashboard/new-campaign/layout.tsx` | Guard de ruta: un PLAYER que entre por URL directa es redirigido al dashboard. |
| `components/ui/switch.tsx` | Switch ON/OFF (Radix) reutilizable. |
| `docs/plans/2026-06-08-roles-globales-panel-admin-design.md` | Documento de diseño de la feature. |

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `prisma/schema.prisma` | `enum UserRole {PLAYER,MASTER,ADMIN}` + `User.role @default(PLAYER)`. Aplicado con `db push`. |
| `lib/auth.ts` | `resolveRoleForEmail()` + allowlist `ADMIN_EMAILS`; aplicada en `registerUser` y `loginUser` (promueve a ADMIN, nunca degrada). |
| `api/campaigns/route.ts` | `POST` devuelve `403` si `role === PLAYER`. |
| `(dashboard)/dashboard/page.tsx` | CTAs "Crear/Nueva campaña" ocultos para PLAYER. |
| `(dashboard)/layout.tsx` | Link "Admin" en la top-nav solo para ADMIN. |
| `lib/supabase/middleware.ts` | Usuario logueado que entra a `/` se redirige al dashboard. |
| `api/auth/signout/route.ts` | Logout redirige a la home usando el origen real del request (sin depender de `NEXT_PUBLIC_APP_URL`). |
| `lib/mock/seed.ts` | Usuarios demo con `role` (master→MASTER, player→PLAYER). |
| `components/ui/input.tsx`, `textarea.tsx` | Asterisco rojo de campo requerido (global, vía prop `required`). |

**Reglas clave:**
- Rol global (capacidad de cuenta) **≠** rol por campaña (`CampaignMember.role`). Un MASTER global es máster en sus campañas y jugador en las ajenas.
- Enforcement en 3 capas: API (`403`), UI (CTA oculto), guard de ruta.
- Bootstrap del primer admin por env `ADMIN_EMAILS` (promueve en registro y login).
- Degradar MASTER→PLAYER es **no destructivo**: solo bloquea crear nuevas campañas; las existentes quedan intactas.

**Wizard de campañas (incluido en esta versión):**
- Paso 2: selección múltiple de **temas visuales** + **tonos narrativos** (lista nueva).
- Paso 3: **sistemas de mecánicas combinables** (multi-select).
- Switch ON/OFF para campaña pública; `maxLength` + contador en nombre/descripción; validación por paso (Siguiente deshabilitado si faltan obligatorios); layout sin scroll.
- Persistencia: valor principal en `theme`/`system` (enum) + selección completa en `settings` (Json).
- Pendiente documentado: traer el manual del sistema desde Google Drive a la Wiki al seleccionarlo (ver `docs/plans`).

**Rama:** `develop`

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
