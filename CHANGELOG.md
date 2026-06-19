# Changelog — CampaignForge

## [0.3.0] — 2026-06-19

### Sesiones
- Formulario completo: selector de hora (`TimePicker`), switch presencial/online, selector de asistentes con checkboxes.
- Filtros por estado (Planificada/En curso/Completada/Cancelada) y buscador de sesiones.
- Notificación automática a asistentes seleccionados al programar sesión (`Notification` + Pusher).
- PATCH `/api/sessions/[id]` acepta `recap` (resumen post-sesión).

### Notificaciones (sistema completo)
- `NotificationBell` en navbar: badge con conteo de no leídas, popover con lista de notificaciones.
- Realtime vía Pusher en canal `user-{id}`; marca como leídas al abrir.
- Solicitudes de unión (`JoinRequest`): aceptar/rechazar desde la campana del máster; notifica al jugador del resultado.
- Endpoints: `GET/POST /api/notifications`, `POST /api/join-requests/[id]`.

### Formularios (refactoring completo)
- Validación Zod en los 6 formularios principales (`CharacterSchema`, `NpcSchema`, `ItemSchema`, `QuestSchema`, `MonsterSchema`, `SessionSchema`).
- Componente `DatePicker` (react-day-picker v9 + Radix Popover, locale español, sin CSS import) — usado en session-form y quest-form.
- Componente `TimePicker` (selects HH:MM estilizados) — usado en session-form.

### Infraestructura API
- `requireAuth()` y `requireMember()` extraídas a `src/lib/api-helpers.ts`; aplicadas en ~40 rutas API.
- `parseBody<T>(request, schema)` en `api-helpers.ts`: captura JSON malformado y valida body con Zod antes de procesar.
- `src/lib/api-schemas.ts`: schemas `CreateCharacterBody`, `CreateNpcBody`, `CreateMonsterBody`, `CreateItemBody`, `CreateQuestBody`, `CreateSessionBody` — aplicados en los 6 endpoints POST principales.

### Refactoring y deuda técnica
- `CampaignSidebar` (~830 líneas → 434 líneas): voice section extraída a `voice-section.tsx` (`VoiceChannelSection`, `ConnectedVoiceBar`, `VoiceParticipantRow`).
- `selectClass` extraída a `src/lib/form-styles.ts`; importada en monster-form, item-form, quest-form.
- `ChatMessageWithUser` deduplicado: `types/index.ts` re-exporta desde `useChatMessages`.
- Objetos: eliminado gate de ≥20 para mostrar buscador (ahora siempre visible).

---

## [0.2.0] — 2026-06-17

### Bestiario / Monstruos
- Módulo de monstruos con stat block completo (D&D 5e): puntuaciones de habilidad, tiradas de salvación, velocidades múltiples, sentidos, inmunidades, acciones, reacciones y acciones legendarias.
- Formulario con `TagPicker` multiselect para tipo de criatura/bestia; el color de la card se basa en el tag principal.
- Subida de imagen desde dispositivo con recorte (reemplaza links de URL).
- Cards estilo NPC con barra de HP interactiva persistida en BD (debounce 600ms).
- Filtros por disposición (aliado/neutral/hostil) y barra de búsqueda condicional (≥15 criaturas).
- Baúl de monstruos integrado al baúl multi-tipo.
- Color de sección: rojo `#f87171`.

### Objetos
- Picker "Usar del baúl" en la sección /items para importar objetos guardados.
- Barra de búsqueda condicional (≥20 objetos).
- Botón "Añadir objeto al baúl" en el detalle del objeto (solo máster).
- API `/api/items/import` para importar objetos del baúl a una campaña.
- Color de sección: cian `#06b6d4`.

### Baúl
- Sección "Baúl" en el sidebar (solo máster) dentro del layout de campaña — sidebar visible.
- Modal unificado con tres pestañas: NPCs, Objetos, Criaturas.
- Botón "Mi baúl" en el dashboard (debajo de las stats, solo para máster).
- Ruta `/vault` standalone para acceso desde el dashboard.
- Ruta `/{campaignSlug}/vault` dentro del layout de campaña.
- Color de sección: violeta `#a855f7`.

### Colores de sección
- Sidebar con `iconColor` por sección: Personajes azul, NPCs verde, Quests ámbar, Objetos cian, Monstruos rojo, Baúl violeta.
- Color solo visible cuando la sección está inactiva; activo usa el dorado global.
- Iconos de sección coloreados también dentro de cada página (al lado del título).

### AI Forge
- Pre-selección de tipo al navegar desde cada sección: `?type=MONSTER`, `?type=QUEST`, `?type=ITEM`.

### HP de monstruos
- Campo `currentHp` en el modelo Monster (Prisma schema + `prisma db push`).
- PATCH `/api/monsters/[id]` acepta `currentHp`.
- Card guarda HP con debounce de 600ms; se inicializa desde la BD al cargar.

---

## [0.1.0] — inicial

### Infraestructura
- Next.js 15 App Router, React 19, TypeScript strict.
- Prisma 7.8 + adapter-pg (Neon PostgreSQL).
- Autenticación propia con JWT (Supabase server helper).
- Tailwind CSS 4 con design tokens CSS custom properties.

### Dashboard
- Campañas propias y como jugador con banner/cover.
- Stats compactas (campañas, sesiones, aventureros).
- Flujo de creación de campaña con tema y sistema.
- Unirse a campaña con código de invitación.

### Campaña — layout
- Sidebar colapsable con soporte móvil, canales de voz (LiveKit).
- Notificaciones en tiempo real (campana + unread count).
- Solicitudes de unión con aceptar/rechazar.

### Personajes
- CRUD completo con stat block, habilidades, condiciones y notas.
- Inventario arrastrable con ordenamiento persistido.
- Barra de HP interactiva en tiempo real.
- Crop de imagen de personaje.

### NPCs
- Cards con foto, condiciones y tags.
- Baúl de NPCs para reutilizar entre campañas.

### Quests
- CRUD con estados, recompensas y objetivos.
- Filtros por estado y buscador.

### Chat
- Chat de campaña en tiempo real (Supabase Realtime).
- Canales de texto y de voz (LiveKit WebRTC).
- Edición y borrado de mensajes propios.
- Indicador de escritura y contador de no leídos.

### AI Forge
- Generación de contenido con Gemini (NPCs, quests, objetos, monstruos).
- Historial de generaciones por campaña.

### Perfil
- Avatar con recorte, nombre visible y cambio de email.
- Cambio de contraseña.

### Galería
- Subida y visualización de imágenes (solo máster).

### Sesiones
- Listado básico de sesiones de campaña.
