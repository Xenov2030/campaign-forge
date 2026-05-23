# CampaignForge

Plataforma web completa para campañas de rol multijugador con IA integrada.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (tema oscuro inmersivo)
- Supabase (Auth + PostgreSQL + Realtime)
- Prisma v7 + `@prisma/adapter-pg`
- OpenAI GPT-4o (generación narrativa)
- Framer Motion + Zustand

## Setup Rápido

### 1. Variables de entorno

```bash
cp .env.example .env
```

Completa `.env` con:
- `DATABASE_URL` — PostgreSQL de Supabase
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` — Para GPT-4o

### 2. Sincronizar DB

```bash
npx prisma generate
npx prisma db push
```

### 3. Ejecutar

```bash
npm run dev
```

## Estructura

```
src/app/
  (auth)/         → Login, Registro
  (dashboard)/    → Dashboard, nueva campaña
  (campaign)/     → Todo dentro de una campaña
    [slug]/
      page.tsx        overview
      characters/     fichas de personaje
      npcs/           PNJs con visibilidad
      sessions/       registro de sesiones
      lore/           wiki por categorías
      ai-forge/       generador IA (NPC/Monstruo/Quest...)
  api/
    auth/           create-profile, signout
    ai/             generate, assistant
    campaigns/      CRUD, join, by-slug
```

## Funcionalidades

### Implementadas
- Auth completo (Supabase email/password)
- Dashboard multi-campaña
- Creación de campañas (wizard 3 pasos con tema/sistema)
- Unirse por código de invitación
- Layout con sidebar colapsable y tema dinámico
- Fichas de personaje con HP bar, stats, inventario
- PNJs con visibilidad máster/jugador
- Sesiones con historial y resúmenes IA
- Wiki/Lore con categorías
- IA Forge: NPC, Monstruo, Objeto, Quest, Localización, Resumen
- Asistente del Máster (chat GPT-4o contextual)
- Bandeja de dados (d4-d100, historial)
- Animaciones inmersivas

### Próximas Fases
- Mapas interactivos con fog of war
- Chat en tiempo real (Supabase Realtime)
- Generador de imágenes (DALL-E 3)
- Timeline interactiva
- Upload de imágenes con UploadThing
- Export PDF de fichas
