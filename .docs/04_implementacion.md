# CampaignForge — Guía de Implementación

**Versión:** 2.3 | **Última actualización:** 2026-06-08

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Git | 2.x |

> **No se necesita cuenta de base de datos para desarrollo.** Ver Opción A abajo.

---

## Setup de desarrollo

### Opción A — Modo Mock (recomendado para desarrollo local)

Sin base de datos. Sin cuentas de servicios externos. Funciona de inmediato.

#### 1. Clonar e instalar

```bash
git clone https://github.com/Xenov2030/campaign-forge.git
cd campaign-forge
npm install
```

#### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Contenido mínimo necesario:

```env
MOCK_MODE=true
JWT_SECRET=campaign-forge-dev-secret-change-in-production
```

#### 3. Ejecutar

```bash
npm run dev
```

La app está en `http://localhost:3000`.

**Usuarios disponibles (cualquier contraseña):**

| Email | Rol |
|-------|-----|
| `master@demo.com` | Máster — campaña "La Maldición de Strahd" precargada |
| `player@demo.com` | Jugador — personaje en la campaña |

> **Nota:** El chat en tiempo real (Pusher) y los canales de voz (LiveKit) requieren las variables de entorno correspondientes. Sin ellas, la app funciona pero esas features quedan sin efecto.

---

### Opción B — Base de datos real (PostgreSQL)

#### 1. Clonar e instalar

```bash
git clone https://github.com/Xenov2030/campaign-forge.git
cd campaign-forge
npm install
```

#### 2. Crear base de datos

**Neon (recomendado, gratuito):** [neon.tech](https://neon.tech) → Sign up → crear proyecto → copiar la connection string.

#### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con los valores reales:

```env
MOCK_MODE=false
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=genera-uno-con-node-e-require-crypto-randomBytes-32-toString-hex

# Realtime (chat)
PUSHER_APP_ID=tu-app-id
PUSHER_SECRET=tu-secret
NEXT_PUBLIC_PUSHER_KEY=tu-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# IA (opcional)
GEMINI_API_KEY=tu-api-key-de-google-ai-studio

# Voz (opcional)
LIVEKIT_API_KEY=APIxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://tu-proyecto.livekit.cloud

# Imágenes (opcional)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

#### 4. Inicializar base de datos

```bash
npm run dev:setup
# equivale a: npx prisma generate && npx prisma db push && npm run seed
```

#### 5. Ejecutar

```bash
npm run dev
```

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción (incluye `prisma generate`) |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npm run seed` | Poblar la DB con datos demo (requiere DB real) |
| `npm run dev:setup` | Setup completo: generate + push + seed |
| `npm run mock:reset` | Resetear `data/mock-db.json` |
| `npx prisma studio` | UI visual para explorar la DB |
| `npx prisma db push` | Sincronizar schema sin migraciones |
| `npx prisma generate` | Regenerar el Prisma Client |

---

## Deploy en producción

### Variables de entorno requeridas

```env
MOCK_MODE=false
DATABASE_URL=postgresql://...
JWT_SECRET=secreto-largo-minimo-32-chars
GEMINI_API_KEY=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=...
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Vercel

1. Ir a [vercel.com](https://vercel.com) → Add new project → importar repo
2. Agregar todas las variables de entorno en Settings → Environment Variables
3. Cada push a `master` hace deploy automático

### Netlify

El proyecto tiene `@netlify/plugin-nextjs` configurado. Conectar el repo y agregar variables de entorno.

---

## Flujo de desarrollo — agregar una funcionalidad

### Paso 1: Leer contexto
```bash
cat .docs/CONTEXT.md
```

### Paso 2: Crear rama
```bash
git checkout -b feat/nombre-funcionalidad
```

### Paso 3: Modificar schema si aplica
```bash
npx prisma generate
npx prisma db push
```

> Si agregás un modelo nuevo, también agregarlo al mock client en `src/lib/mock/client.ts` y al seed en `src/lib/mock/seed.ts`.

### Paso 4: Crear la API route
```ts
// src/app/api/[recurso]/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  // ... lógica
}
```

### Paso 5: Si incluye realtime (Pusher)
```ts
// En la API route, al final de la mutación:
import pusher, { campaignChannel } from "@/lib/pusher/server";
pusher.trigger(campaignChannel(campaignId), "evento-nuevo", payload).catch(() => {});

// En el componente cliente, suscribirse:
import { getPusherClient } from "@/lib/pusher/client";
const pusher = getPusherClient();
if (!pusher) return;
const ch = pusher.subscribe(`campaign-${campaignId}`);
const handler = (data: ...) => { /* ... */ };
ch.bind("evento-nuevo", handler);
return () => { ch.unbind("evento-nuevo", handler); pusher.unsubscribe(...); };
```

### Paso 6: Agregar al sidebar si es sección de campaña
Editar `src/components/layout/campaign-sidebar.tsx` → array `navItems`.

### Paso 7: Actualizar documentación
Obligatorio — ver lineamientos en `CONTEXT.md`.

---

## Convenciones de código

### Nomenclatura
- Páginas: `page.tsx`, Layouts: `layout.tsx`, Loading: `loading.tsx`
- Componentes: `PascalCase.tsx`, Utilities: `camelCase.ts`, API routes: `route.ts`

### Imports
```ts
// Orden: Next.js → React → externos → internos
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
```

### Server vs Client Components
- **Server Component** (default): páginas que solo fetchen datos
- **Client Component** (`"use client"`): formularios, interactividad, hooks de React, Zustand, Pusher

### Clases CSS
```tsx
className={cn(
  "clases-base",
  condicion && "clases-condicionales",
  "responsive:clases-breakpoint"
)}
```

---

## Convenciones de git

### Branches
```
feat/nombre     → nueva funcionalidad
fix/nombre      → corrección de bug
refactor/nombre → refactoring sin cambio funcional
chore/nombre    → mantenimiento, deps, config
```

### Commit messages
Formato: `type(module): descripción en español`
```
feat(chat): agregar mensajes en tiempo real con Pusher
fix(scroll): agregar min-h-0 en main del layout de campaña
refactor(ai): migrar de OpenAI a Gemini 2.0
chore(deps): actualizar @google/generative-ai a ^0.24.0
```

---

## Troubleshooting

### "Cannot find module '.prisma/client/default'"

El Prisma Client no está generado:
```bash
npx prisma generate
```
Luego reiniciar el servidor de desarrollo.

### "Unexpected token '<', '<!DOCTYPE...' is not valid JSON"

La API devuelve HTML en lugar de JSON. Causas:
1. **Prisma no generado:** `npx prisma generate`
2. **DB no configurada:** verificar `DATABASE_URL` en `.env.local`
3. **Solución rápida:** activar `MOCK_MODE=true` en `.env.local`

### Chat no actualiza en tiempo real

Verificar que `PUSHER_*` y `NEXT_PUBLIC_PUSHER_*` estén configurados en `.env.local`.
Si alguna variable falta, `getPusherClient()` retorna `null` y el chat funciona solo con carga inicial.

### Canales de voz no conectan

Verificar `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` y `NEXT_PUBLIC_LIVEKIT_URL`. Los tokens de LiveKit se generan en `/api/livekit/token`.

### IA Forge no genera contenido

Verificar que `GEMINI_API_KEY` esté configurado y tenga cuota disponible en Google AI Studio. Si no está configurado, `AI_ENABLED` es `false` y las rutas de IA retornan error informativo.

### Los datos del mock no persisten

Si borraste `data/mock-db.json` o es la primera vez, se recreará desde el seed automáticamente al primer request.

### Cookie de sesión no setea

Verificar que `JWT_SECRET` esté configurado.
