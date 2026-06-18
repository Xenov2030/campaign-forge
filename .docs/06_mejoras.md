# CampaignForge — Documento de Mejoras Pendientes

**Versión:** 3.1 | **Última actualización:** 2026-06-18

> Las mejoras están ordenadas por prioridad. Al implementar una, marcarla con `[x]` y moverla al changelog.

---

## Prioridad ALTA — Funcionalidad faltante crítica

### [ ] Upload real de imágenes (Cloudinary integrado en toda la app)
**Estado:** El flujo ya quedó operativo en personajes (`/api/upload` + recorte de retrato/banner). Siguen faltando la galería y una pasada final de unificación en el resto de módulos visuales.
**Impacto:** La experiencia de imágenes está resuelta en personajes, pero todavía no es homogénea en toda la plataforma.
**Approach:** Reutilizar `ImageCropUpload` y `/api/upload` en galería y formularios restantes.
**Versión estimada:** v2.5

### [ ] Reset de contraseña
**Estado:** No existe flujo de recuperación. Si un usuario olvida su contraseña hay que editar `passwordHash` a mano (Prisma Studio).
**Approach:** Endpoint de solicitud + token temporal por email (o pregunta de seguridad). Útil sobre todo para la cuenta ADMIN.
**Versión estimada:** v2.x

### [ ] Manual del sistema desde Google Drive → Wiki
**Estado:** Documentado en `docs/plans/2026-06-08-...`. Al seleccionar un sistema (no CUSTOM) en el wizard, traer su manual desde una cuenta de Google Drive y vincularlo a la Wiki. La cuenta Drive aún no existe.
**Approach:** Mapeo `system → fileId/carpeta`, fetch del manual y volcado a `LoreEntry`.
**Versión estimada:** v3.0

---

## Prioridad MEDIA — Mejoras UX significativas

### [ ] Export PDF de fichas de personaje
**Estado:** No implementado.
**Approach:** `@react-pdf/renderer` para generar PDF desde la ficha de personaje.
**Versión estimada:** v3.0

### [ ] Generación de imágenes con IA (Gemini / Imagen 3)
**Estado:** No implementado.
**Approach:** Agregar tab "Imagen" en IA Forge usando Google Imagen 3 o similar.
**Versión estimada:** v3.0

### [ ] Timeline interactiva de la campaña
**Estado:** Modelo `TimelineEvent` existe en DB. UI no implementada.
**Approach:** Componente de línea de tiempo horizontal con eventos marcados por sesión.
**Versión estimada:** v3.0

### [ ] Mapas interactivos con fog of war
**Estado:** Modelo `GameMap` existe en DB. UI no implementada.
**Approach:** Leaflet.js o similar para mapas con marcadores. Fog of war por capas CSS.
**Versión estimada:** v3.0

---

## Prioridad MEDIA — Mejoras de código y calidad

### [ ] `aria-invalid` y `aria-describedby` en inputs
Actualizar `src/components/ui/input.tsx` para aceptar y propagar `error` como `aria-invalid` + mensaje vinculado.

### [ ] `alt` text descriptivo en imágenes de NPCs y personajes
Archivos afectados: `npcs/page.tsx`, `characters/[characterId]/page.tsx`.

---

## Deuda técnica identificada (auditoría v3.1)

> Hallazgos de la auditoría de código que NO se aplicaron en v2.8 (refactores de mayor alcance o que requieren decisión). Ordenados por valor.

### [ ] Helpers de auth/permisos centralizados
El bloque `getUser()` → 401 → `campaign.findUnique` → `masterId !== user.id` → 403 se repite en ~10 rutas API. `npcs/[id]` ya extrajo `getOwnedNpc()` como ejemplo.
**Approach:** `requireUser()`, `requireMaster(campaignId, userId)`, `requireMember(...)` en `lib/auth.ts`. Reduce superficie de error de seguridad.

### [ ] Manejo de errores API unificado
Conviven tres convenciones (`"Error interno"` con `error.message` filtrado, `"Error interno"` fijo, `"Server error"`). Algunas rutas exponen `error.message` crudo de Prisma.
**Approach:** helper `apiError(error)` central; nunca exponer `error.message` al cliente. (En v2.8 ya se centralizó el de IA en `lib/ai/errors.ts` y se agregó try/catch a `profile`.)

### [ ] Validación de entrada con zod
Los bodies se desestructuran y castean a mano (`type as never` en `ai/route.ts`). Solo `profile` valida formato.
**Approach:** esquemas zod por ruta, al menos en los POST de creación.

### [ ] Deduplicar patrones de UI repetidos
- `toggleVisibility` optimista duplicado en `npc-card`/`quest-card`. Extraer `useOptimisticToggle`.
- `changeHp` duplicado en `npc-card`/`npc-hp-control`. Extraer helper.
- `selectClass` CSS duplicada en `monster-form`, `item-form`, `quest-form`.
- `NumberField` custom en `CharacterForm` sin extraerse a componente reutilizable.

### [ ] `$transaction` en aceptar solicitud de unión
`join-requests/[id]` (accept) hace 3 writes secuenciales sin transacción; si falla a mitad queda estado inconsistente.
**Approach:** `prisma.$transaction([...])`.

### [ ] Renombrar `lib/supabase/` (legado)
La auth es JWT propia; el módulo `lib/supabase/server.ts` solo re-exporta `getSessionUser`. El nombre confunde. Renombrar a `lib/session.ts`.

### [ ] `generateUniqueUsername` puede hacer N queries
`lib/auth.ts`: bucle con un `findUnique` por iteración. Resolver con una sola query `startsWith` + sufijo en memoria.

### [ ] Forms sin Zod + React Hook Form
`CharacterForm`, `MonsterForm`, `NpcForm`, `QuestForm`, `ItemForm` validan manualmente. Introducir Zod + React Hook Form eliminaría ~40% de boilerplate y unificaría el manejo de errores. Los esquemas Zod también sirven para validar los bodies en las API routes correspondientes.

### [ ] `campaign-store` demasiado ancho
Un solo store mezcla estado de chat, voz, UI (sidebar, sección activa), AI assistant y dice tray. Separar en stores por dominio: `ui-store`, `voice-store`, `chat-store`.

### [ ] `ChatMessageWithUser` duplicado
Definido en `src/types/index.ts:195` Y en `src/hooks/useChatMessages.ts:7-21`. Eliminar la definición local y exportar desde types.

### [ ] Tags inconsistentes entre forms
`ItemForm` guarda tags como string comma-separated; `QuestForm`/`MonsterForm` como array. Unificar a array en todos los formularios.

---

## Prioridad BAJA — Mejoras futuras

### [ ] Modo presentación (DM Screen)
Vista donde el máster puede mostrar imágenes, mapas o texto a todos los jugadores en tiempo real.

### [ ] Estilos de impresión
`@media print` para generar fichas de personaje imprimibles desde el navegador.

### [ ] Integración con Roll20 / Foundry VTT
Import/export de fichas en formatos compatibles con plataformas VTT populares.

### [ ] App mobile nativa
React Native + Expo para experiencia nativa en iOS/Android.

### [ ] i18n / internacionalización
La app está en español. Soporte para inglés y portugués.

---

## Mejoras completadas

| Versión | Mejora |
|---------|--------|
| v1.1 | Página 404 temática |
| v1.1 | Error boundary global |
| v1.1 | Skeletons en dashboard y campaña overview |
| v1.1 | Sidebar mobile como overlay con backdrop |
| v1.1 | `prefers-reduced-motion` support |
| v1.1 | Contraste `--text-muted` WCAG AA |
| v1.1 | `aria-label` en botones de ícono |
| v1.1 | Breadcrumb responsivo |
| v1.2 | Cursor-pointer global en elementos interactivos |
| v1.2 | Hover en inputs, textareas, select, stat cards |
| v1.3 | Login robusto con check de Content-Type |
| v1.4 | Mock mode (desarrollo sin DB) |
| v1.5 | Texto del sidebar siempre visible (fix AnimatePresence) |
| v1.6 | Página de dados con historial |
| v1.6 | Badge de versión en UI |
| v2.0 | **Chat de texto en tiempo real (Pusher)** |
| v2.0 | **Canales de voz en sidebar (LiveKit)** |
| v2.1 | **Migración de OpenAI a Gemini 2.0 Flash** |
| v2.1 | Notificaciones realtime en campaña (member-joined, character-created) |
| v2.1 | Badge de no leídos en Chat del sidebar |
| v2.1 | Renombrado PNJs → NPCs en toda la UI |
| v2.2 | Bandeja de dados visible desde cualquier sección |
| v2.2 | Switch "ocultar tiradas" rediseñado (máster) |
| v2.2 | Botón de dados eliminado del TopNav |
| v2.3 | Scroll fix en todas las páginas del workspace |
| v2.5 | Edición completa de personajes con retrato/banner recortables |
| v2.3 | Toaster (Sonner) para notificaciones de campaña |
| v2.3 | Landing CTA: "Crear cuenta" + "Iniciar sesión" |
| v2.3 | Mensajes de error amigables para usuario final |
| v2.3 | Dashboard: campañas primero, stats compactos |
| v2.3 | Detalle campaña: contadores compactos en chips |
| v2.4 | **Roles globales de cuenta (PLAYER/MASTER/ADMIN)** |
| v2.4 | **Panel de administración `/admin` (tabla + switch de máster)** |
| v2.4 | Gate de creación de campañas (API 403 + UI + ruta) |
| v2.4 | Bootstrap de admin por allowlist `ADMIN_EMAILS` |
| v2.4 | Wizard de campañas: temas/tonos múltiples + sistemas combinables |
| v2.4 | Switch público ON/OFF, validación por paso, layout sin scroll |
| v2.4 | Asterisco de requerido + contador de caracteres |
| v2.4 | Fix navegación: logout → home, `/` logueado → dashboard |
| v2.6 | **Solicitudes de unión con aprobación del máster** |
| v2.6 | **Notificaciones realtime (campana TopNav)** |
| v2.6 | Expulsar / abandonar campaña |
| v2.6 | Perfil: avatar y correo editable; banner y tema de campaña editables |
| v2.7 | **Sección NPCs completa (CRUD, visibilidad, vida, apodo)** |
| v2.7 | **Baúl de NPCs reutilizables entre campañas** |
| v2.8 | **Sección Misiones completa (objetivos colaborativos, auto-completado, tipos con color, filtros)** |
| v2.8 | Borrado de campaña en cascada (baúl preservado) |
| v2.8 | Auditoría: filtro de visibilidad en query (cierre de fuga + perf) |
| v2.8 | Auditoría: queries de la home en paralelo (`Promise.all`) |
| v2.8 | Auditoría: índices `@@index([campaignId])` en tablas activas |
| v2.8 | Auditoría: errores de IA centralizados + `try/catch` en `profile` |
| v2.8 | README reconciliado con el estado real (Gemini, Neon, JWT) |
| v2.9 | **Sección Objetos completa — catálogo CRUD con rareza/tipo/artefacto/sintonización/visibilidad** |
| v2.9 | **Recompensa de misión**: objeto vinculado a quest (selector + chip clickeable en detalle) |
| v2.9 | **Inventario de personaje**: asignar desde el detalle del objeto, listado en ficha con quitar optimista |
| v3.0 | **Inventario**: equip/unequip toggle con ícono animado, stepper de cantidad, rollback optimista |
| v3.0 | **Dados reales**: `DiceRoll` conectado a DB, historial filtrado por `isSecret` |
| v3.0 | **Quest deadline**: campo de fecha en form y chip en detalle |
| v3.0 | **Loading skeletons** en characters, npcs, quests, items, sessions, lore |
| v3.0 | **next/image** migrado en 11 componentes, `remotePatterns` configurados |
| v3.1 | **Sesiones completas**: form con hora, online/presencial, asistentes, detalle, edición, filtros |
| v3.1 | **Baúl en campaña**: vault picker en workspace, búsqueda sin gate, "Mi baúl" en dashboard |
| v3.1 | **Colores por sección**: cyan, rojo, violeta; sidebar con íconos coloreados |
| v3.1 | **HP monstruo persistido en DB** |
| v3.1 | **Zonas de peligro unificadas** en los 5 módulos |
| v3.1 | **Columnas sin uso eliminadas del schema** (37 líneas) |
