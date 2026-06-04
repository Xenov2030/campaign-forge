# CampaignForge — Documento de Mejoras Pendientes

**Versión:** 1.3 | **Última actualización:** 2026-06-04

> Las mejoras están ordenadas por prioridad. Al implementar una, marcarla con `[x]` y moverla al changelog.

---

## Prioridad ALTA — Funcionalidad faltante crítica

### [ ] Tiempo real en chat (Supabase Realtime)
**Estado:** No implementado. El chat existe como modelo en DB pero no tiene polling ni WebSocket.
**Impacto:** Sin esto, el chat no es usable en sesiones activas.
**Approach sugerido:** Usar `supabase.channel()` con Postgres Changes en el componente de chat. Suscribir a `INSERT` en `ChatMessage` filtrado por `chatRoomId`.
**Versión estimada:** v2.0

### [ ] Upload real de imágenes (UploadThing / Cloudinary)
**Estado:** Las dependencias están instaladas pero el flujo de upload no está integrado en UI.
**Impacto:** Los PNJs, personajes y galería no pueden subir imágenes reales.
**Approach sugerido:** Implementar UploadThing para avatares (PNJs, personajes) y galería. Cloudinary para procesamiento.
**Versión estimada:** v2.0

### [ ] Mapas interactivos con fog of war
**Estado:** Modelo `GameMap` existe en DB. UI no implementada.
**Impacto:** Feature prometida en landing page que no existe.
**Approach sugerido:** Usar Leaflet.js o similar para mapas con marcadores. Fog of war por capas CSS.
**Versión estimada:** v2.0

---

## Prioridad MEDIA — Mejoras UX significativas

### [ ] Skeletons en páginas faltantes
**Estado:** Se agregaron en dashboard y campaña overview. Faltan en characters, npcs, sessions, lore, etc.
**Impacto:** Flash de contenido vacío al cargar páginas secundarias.
**Approach:** Agregar `loading.tsx` en cada subcarpeta de campaña con skeleton apropiado.
**Versión estimada:** v1.2

### [ ] Export PDF de fichas de personaje
**Estado:** No implementado.
**Impacto:** Muy pedido por usuarios de TTRPG para llevar fichas fuera de la plataforma.
**Approach sugerido:** `@react-pdf/renderer` para generar PDF desde la ficha de personaje.
**Versión estimada:** v2.0

### [ ] Generación de imágenes con DALL-E 3
**Estado:** No implementado. API key de OpenAI ya disponible.
**Impacto:** Enriquece enormemente IA Forge con imágenes para PNJs, locaciones, objetos.
**Approach sugerido:** Agregar tab "Imagen" en IA Forge. Usar `openai.images.generate()`.
**Versión estimada:** v2.0

### [ ] Timeline interactiva de la campaña
**Estado:** Modelo `TimelineEvent` existe en DB. UI no implementada.
**Impacto:** Dificulta el seguimiento cronológico de la historia.
**Approach sugerido:** Componente de línea de tiempo horizontal con eventos marcados por sesión.
**Versión estimada:** v2.0

### [ ] Sistema de notificaciones
**Estado:** Botón de campana en TopNav existe pero no hace nada.
**Impacto:** Usuarios no saben cuándo otros miembros realizan acciones (nueva sesión, nuevo personaje, etc.).
**Approach sugerido:** Tabla `Notification` en DB, llenada por triggers de API. Dropdown en el botón de campana.
**Versión estimada:** v1.3

---

## Prioridad MEDIA — Mejoras de código y calidad

### [ ] Skeletons en subcarpetas de campaña
**Archivos a crear:**
- `src/app/(campaign)/[campaignSlug]/characters/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/npcs/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/sessions/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/lore/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/quests/loading.tsx`
- `src/app/(campaign)/[campaignSlug]/items/loading.tsx`

### [ ] Indicadores de campo requerido en formularios
**Estado:** Algunos formularios no marcan visualmente qué campos son obligatorios.
**Approach:** Agregar asterisco rojo o badge "requerido" en labels de campos con `required`.

### [ ] Contador de caracteres en textareas
**Estado:** Los textareas de descripción/lore no muestran el límite de caracteres.
**Approach:** Agregar `maxLength` + contador visual en los textareas principales.

### [ ] `aria-invalid` y `aria-describedby` en inputs
**Estado:** El componente `Input` y `Textarea` no tienen estos atributos de accesibilidad.
**Approach:** Actualizar `src/components/ui/input.tsx` para aceptar y propagar `error` como `aria-invalid` + mensaje vinculado.

### [ ] `alt` text en imágenes de PNJs y personajes
**Estado:** Algunas `<img>` de avatares no tienen `alt` descriptivo.
**Archivos afectados:** `npcs/page.tsx`, `characters/[characterId]/page.tsx`

---

## Prioridad BAJA — Mejoras futuras

### [ ] Modo presentación (pantalla compartida)
Vista de "DM Screen" donde el máster puede mostrar imágenes, mapas o texto a todos los jugadores en tiempo real.

### [ ] Estilos de impresión
`@media print` para generar fichas de personaje imprimibles desde el navegador.

### [ ] Optimización de paisaje en mobile
El layout `h-screen` puede tener problemas con la altura del viewport en landscape mobile (dispositivos con barra de URL del browser).

### [ ] Integración con Roll20 / Foundry VTT
Import/export de fichas de personaje en formatos compatibles con plataformas de VTT populares.

### [ ] App mobile nativa
React Native + Expo para una experiencia nativa en iOS/Android.

### [ ] i18n / internacionalización
La app está en español. Soporte para inglés y portugués como segundo paso.

---

## Mejoras completadas (v1.2)

| Versión | Mejora |
|---------|--------|
| v1.1 | Página 404 temática |
| v1.1 | Error boundary global |
| v1.1 | Skeletons de carga en dashboard y campaña overview |
| v1.1 | Sidebar mobile como overlay con backdrop |
| v1.1 | `prefers-reduced-motion` support |
| v1.2 | Demo login sin necesidad de crear cuenta (`/api/auth/demo-login`) |
| v1.2 | CTAs de landing page coherentes (sin redundancia) |
| v1.2 | Cursor-pointer global en todos los elementos interactivos |
| v1.2 | Hover en inputs, textareas, select, stat cards, botones del wizard |
| v1.1 | Contraste de `--text-muted` corregido (WCAG AA) |
| v1.1 | `aria-label` en todos los botones de ícono |
| v1.1 | Breadcrumb responsivo con truncado en mobile |
| v1.1 | Touch targets mínimos en botones de navegación |
| v1.1 | Dashboard nav colapsado en mobile |
