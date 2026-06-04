# CampaignForge `v1.4`

Plataforma web completa para campañas de rol multijugador con IA integrada.

> **Documentación completa en [`.docs/`](.docs/)** — leer [`CONTEXT.md`](.docs/CONTEXT.md) antes de cualquier cambio.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 — design system dark fantasy propio |
| Base de datos | PostgreSQL (Supabase) + Prisma v7 ORM |
| Auth | JWT (jose) + bcryptjs + cookies httpOnly |
| IA | OpenAI GPT-4o |
| Estado | Zustand |
| UI | Radix UI + shadcn/ui + Lucide React + Framer Motion |

---

## Setup rápido

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con:
- `DATABASE_URL` — PostgreSQL de Supabase
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` — mínimo 32 caracteres
- `OPENAI_API_KEY` — para GPT-4o
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
- Asistente del Máster (chat GPT-4o contextual)
- Página 404 temática + error boundary global
- Skeletons de carga en páginas principales
- Soporte `prefers-reduced-motion`
- Accesibilidad: ARIA labels, focus visible, contraste WCAG AA

### Próximas fases (v2.x)
- Chat en tiempo real (Supabase Realtime)
- Mapas interactivos con fog of war
- Generación de imágenes con DALL-E 3
- Upload real de imágenes (UploadThing)
- Export PDF de fichas de personaje
- Timeline interactiva de campaña
- Sistema de notificaciones

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
