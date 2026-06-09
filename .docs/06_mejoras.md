# CampaignForge — Documento de Mejoras Pendientes

**Versión:** 2.4 | **Última actualización:** 2026-06-09

> Las mejoras están ordenadas por prioridad. Al implementar una, marcarla con `[x]` y moverla al changelog.

---

## Prioridad ALTA — Funcionalidad faltante crítica

### [ ] Upload real de imágenes (Cloudinary integrado en UI)
**Estado:** Dependencias instaladas (`cloudinary`), env vars documentadas, pero el flujo de upload no está conectado a la UI.
**Impacto:** NPCs, personajes y galería no pueden subir imágenes reales desde la app.
**Approach:** Crear API route `/api/upload` que use el SDK de Cloudinary. Integrar en formularios de NPC, personaje (retrato) y galería.
**Versión estimada:** v2.4

### [ ] Historial de tiradas de dados por campaña/sesión
**Estado:** Modelo `DiceRoll` existe en DB. La página `/dice` muestra datos mock hardcodeados.
**Impacto:** No se persiste el historial real de tiradas.
**Approach:** POST `/api/dice-rolls` al tirar en la bandeja. GET en `/dice/page.tsx` para listar por campaña, filtrable por sesión y jugador.
**Versión estimada:** v2.4

### [ ] Sistema de notificaciones (campana TopNav)
**Estado:** Botón de campana en TopNav existe pero no hace nada.
**Impacto:** Usuarios no saben de nuevas sesiones, cambios de campaña, etc. fuera del workspace.
**Approach:** Tabla `Notification` en DB. Filled por triggers de API. Dropdown al hacer click en la campana. Marcar como leídas.
**Versión estimada:** v2.4

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

### [ ] Skeletons en páginas faltantes
**Estado:** Se agregaron en dashboard y campaña overview. Faltan en characters, npcs, sessions, lore, gallery, etc.
**Archivos a crear:**
- `src/app/(campaign)/[campaignSlug]/characters/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/npcs/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/sessions/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/lore/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/gallery/loading.tsx`

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

### [x] Indicadores de campo requerido en formularios ✅ v2.4
Asterisco rojo global en `Input`/`Textarea` vía prop `required`.

### [x] Contador de caracteres en textareas ✅ v2.4
`maxLength` + contador visual en nombre y descripción del wizard de campañas.

### [ ] `aria-invalid` y `aria-describedby` en inputs
Actualizar `src/components/ui/input.tsx` para aceptar y propagar `error` como `aria-invalid` + mensaje vinculado.

### [ ] `alt` text descriptivo en imágenes de NPCs y personajes
Archivos afectados: `npcs/page.tsx`, `characters/[characterId]/page.tsx`.

### [ ] Reconciliar `README.md` con el estado real
El README quedó desfasado (dice v1.6, OpenAI GPT-4o, Supabase) mientras el stack real es Gemini 2.0, auth JWT propio sobre Neon y Pusher/LiveKit. Actualizarlo a fondo en una pasada de documentación dedicada.

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
