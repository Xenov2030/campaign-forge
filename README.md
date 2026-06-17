# CampaignForge `v2.9`

Plataforma web completa para campañas de rol multijugador con IA integrada.

> **Documentación completa en [`.docs/`](.docs/)** — leer [`CONTEXT.md`](.docs/CONTEXT.md) antes de cualquier cambio.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 — design system dark fantasy propio |
| Base de datos | PostgreSQL (Neon) + Prisma v7 ORM |
| Auth | JWT (jose) + bcryptjs + cookies httpOnly |
| IA | Google Gemini 2.0 Flash |
| Estado | Zustand |
| UI | Radix UI + shadcn/ui + Lucide React + Framer Motion |

---

## Setup rápido

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con:
- `DATABASE_URL` — PostgreSQL (Neon)
- `JWT_SECRET` — mínimo 32 caracteres
- `GEMINI_API_KEY` — generadores y asistente IA (opcional; la IA se desactiva si falta)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — subida de imágenes (retratos, banners, avatares)
- `PUSHER_*` y `NEXT_PUBLIC_PUSHER_*` — chat y notificaciones en tiempo real
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `NEXT_PUBLIC_LIVEKIT_URL` — canales de voz
- `ADMIN_EMAILS` — allowlist de administradores
- `NEXT_PUBLIC_APP_URL` — URL del app

### 2. Instalar y sincronizar

```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Ejecutar

```bash
npm run dev
```

---

## Estructura

```
src/app/
  (auth)/         → Login, Registro
  (dashboard)/    → Dashboard multi-campaña, nueva campaña, perfil
  (campaign)/
    [slug]/
      page.tsx        → Overview de campaña
      characters/     → Fichas de personaje completas
      npcs/           → PNJs con visibilidad máster/jugador
      monsters/       → Bestiario
      world/          → Locaciones, facciones
      quests/         → Misiones
      items/          → Objetos
      sessions/       → Sesiones + resúmenes IA
      lore/           → Wiki por categorías
      gallery/        → Galería visual
      notes/          → Notas privadas
      chat/           → Salas de chat
      dice/           → Tiradas de dados
      ai-forge/       → Generador IA (solo máster)
      settings/       → Configuración de campaña
  api/            → Route handlers (auth, campaigns, characters, ai, profile)
  not-found.tsx   → Página 404 temática
  error.tsx       → Error boundary global
```

---

## Funcionalidades

### Implementadas (v1.x)
- Auth completo (registro, login, logout, cambio de contraseña)
- Dashboard multi-campaña con estadísticas
- Wizard de creación de campaña (nombre → tema → sistema de juego)
- 9 temas visuales dinámicos (Fantasy, Horror, SciFi, Grimdark, etc.)
- 6 sistemas de juego (D&D 5e, Pathfinder, CoC, Vampiro, Shadowrun, Starfinder)
- Sistema de invitación por código único
- Layout con sidebar colapsable (desktop) / overlay (mobile)
- Fichas de personaje: stats, HP, CA, inventario, hechizos, relaciones
- PNJs con visibilidad configurable por rol
- Monstruos con CR, habilidades y acciones
- Locaciones, facciones, items, quests
- Sesiones con resúmenes automáticos por IA
- Wiki/Lore con categorías y etiquetas
- Galería de imágenes
- Notas privadas por rol
- Chat por salas (pública, privada, solo máster)
- Tiradas de dados d4-d100 con historial
- IA Forge: NPC, Monstruo, Quest, Localización, Objeto, Resumen
- Asistente del Máster (chat Gemini contextual)
- Página 404 temática + error boundary global
- Skeletons de carga en páginas principales
- Soporte `prefers-reduced-motion`
- Accesibilidad: ARIA labels, focus visible, contraste WCAG AA

### Destacado v2.x
- Chat de texto en tiempo real (Pusher) y canales de voz (LiveKit)
- Migración de IA a Google Gemini 2.0 Flash
- **Roles globales de cuenta (PLAYER/MASTER/ADMIN) + panel de administración `/admin`** (v2.4)
- Wizard de campañas con temas/tonos múltiples y sistemas combinables (v2.4)
- **Sección de personajes refinada**: cards más compactas, detalle más denso y edición completa con retrato/banner recortables y subida a Cloudinary (v2.5)
- **Comunidad**: solicitudes de unión con aprobación del máster, notificaciones en tiempo real (campana), expulsar/abandonar campaña, perfil con avatar y correo editable, banner y tema de campaña editables (v2.6)
- **Sección NPCs completa**: CRUD, visibilidad oculto/conocido con filtro, vida solo-máster, apodo, y **baúl de NPCs** reutilizables entre campañas (v2.7)
- **Sección Misiones completa**: objetivos colaborativos con auto-completado, estados, tipos con color, filtros, recompensas, y borrado de campaña en cascada (v2.8)
- **Sección Objetos completa**: catálogo CRUD con rareza/tipo/artefacto/sintonización, visibilidad máster/jugador, recompensa de misión vinculada a quests, inventario asignable por personaje (v2.9)

> El detalle de funcionalidades por versión vive en [`.docs/05_changelog.md`](.docs/05_changelog.md).

### Próximas fases (v3.x)
- Bestiario de **Monstruos**, **Mundo** (locaciones/facciones) y **Mapas** interactivos
- "Guardar como NPC/Misión/Objeto" desde la IA Forge (persistir lo generado)
- Relaciones vinculadas entre NPCs
- Export PDF de fichas de personaje
- Timeline interactiva de campaña

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`CONTEXT.md`](.docs/CONTEXT.md) | Contexto, mapa del proyecto, lineamientos de desarrollo |
| [`01_alcance.md`](.docs/01_alcance.md) | Alcance funcional, módulos, reglas de negocio |
| [`02_tecnico.md`](.docs/02_tecnico.md) | Stack, arquitectura, API, esquema de DB, design system |
| [`03_no_tecnico.md`](.docs/03_no_tecnico.md) | Resumen ejecutivo, casos de uso, glosario |
| [`04_implementacion.md`](.docs/04_implementacion.md) | Setup, comandos, convenciones, deploy |
| [`05_changelog.md`](.docs/05_changelog.md) | Historial de cambios por versión |
| [`06_mejoras.md`](.docs/06_mejoras.md) | Backlog de mejoras pendientes con prioridad |
