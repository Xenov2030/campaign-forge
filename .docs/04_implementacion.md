# CampaignForge — Guía de Implementación

**Versión:** 1.4 | **Última actualización:** 2026-06-04

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

Hay dos modos de trabajo. Elegí el que corresponda:

---

### Opción A — Modo Mock (recomendado para desarrollo local)

Sin base de datos. Sin cuentas de servicios externos. Funciona de inmediato.

#### 1. Clonar e instalar

```bash
git clone https://github.com/Xenov2030/campaign-forge.git
cd campaign-forge
npm install
```

#### 2. Variables de entorno

El archivo `.env.local` ya está creado en el repositorio con `MOCK_MODE=true`. Si no existe:

```bash
cp .env.local.example .env.local
```

El contenido mínimo necesario:

```env
MOCK_MODE=true
JWT_SECRET=campaign-forge-dev-secret-change-in-production
```

#### 3. Ejecutar

```bash
npm run dev
```

Listo. La app está en `http://localhost:3000`.

**Usuarios disponibles (cualquier contraseña):**

| Email | Rol |
|-------|-----|
| `master@demo.com` | Máster — tiene la campaña "La Maldición de Strahd" |
| `player@demo.com` | Jugador — tiene un personaje en la campaña |

**Datos precargados:**
- Campaña: "La Maldición de Strahd" (tema HORROR)
- 3 PNJs (Strahd, Ismark, Ireena)
- 3 sesiones (2 completadas, 1 planificada)
- 2 quests (1 principal, 1 secundaria)
- 3 locaciones (Barovia, Castillo Ravenloft, Aldea)
- 2 facciones
- 2 entradas de lore
- 1 personaje jugador con inventario

**Persistencia:** los cambios que hagas (crear campañas, PNJs, personajes, etc.) se guardan en `data/mock-db.json` y sobreviven reinicios del servidor.

**Resetear datos:**
```bash
npm run mock:reset
```

---

### Opción B — Base de datos real (PostgreSQL)

Para trabajo con datos reales o deploy.

#### 1. Clonar e instalar

```bash
git clone https://github.com/Xenov2030/campaign-forge.git
cd campaign-forge
npm install
```

#### 2. Crear base de datos

**Neon (recomendado, gratuito):**
1. Ir a [neon.tech](https://neon.tech) → Sign up (GitHub SSO disponible)
2. Crear proyecto → copiar la connection string

**Alternativas:** Supabase, Railway, Render, o PostgreSQL local.

#### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
MOCK_MODE=false
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=genera-uno-con-node-e-require-crypto-randomBytes-32-toString-hex
OPENAI_API_KEY=sk-...   # opcional
```

#### 4. Inicializar base de datos

```bash
npm run dev:setup
# equivale a: npx prisma generate && npx prisma db push && npm run seed
```

Esto crea las tablas y agrega los usuarios demo:
- `master@demo.com` / `password123`
- `player@demo.com` / `password123`

#### 5. Ejecutar

```bash
npm run dev
```

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npm run seed` | Poblar la DB con datos demo (requiere DB real) |
| `npm run dev:setup` | Setup completo: generate + push + seed (primera vez con DB real) |
| `npm run mock:reset` | Resetear `data/mock-db.json` a los datos iniciales del seed |
| `npx prisma studio` | UI visual para explorar la DB (solo modo real) |
| `npx prisma db push` | Sincronizar schema sin migraciones |
| `npx prisma generate` | Regenerar el Prisma Client |

---

## Deploy en producción

### Variables de entorno requeridas en producción

```env
MOCK_MODE=false
DATABASE_URL=postgresql://...
JWT_SECRET=secreto-largo-y-aleatorio-minimo-32-chars
OPENAI_API_KEY=sk-...         # para IA Forge y Asistente
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Netlify (configuración presente)

El proyecto tiene `@netlify/plugin-nextjs` configurado. Solo conectar el repo en [netlify.com](https://netlify.com) y agregar las variables de entorno.

### Vercel

1. Ir a [vercel.com](https://vercel.com) → Add new project → importar repo
2. Agregar variables de entorno en Settings → Environment Variables
3. Cada push a `master` hace deploy automático

---

## Flujo de desarrollo — agregar una funcionalidad

### Paso 1: Leer contexto

```bash
cat .docs/CONTEXT.md
```

### Paso 2: Crear rama

```bash
git checkout -b feat/nombre-funcionalidad
# o: fix/nombre-fix
```

### Paso 3: Modificar schema si aplica

Editar `prisma/schema.prisma`, luego:

```bash
npx prisma generate   # siempre después de cambiar el schema
npx prisma db push    # sincronizar con la DB (en modo real)
```

> Si agregás un nuevo modelo, también agregarlo al mock client en `src/lib/mock/client.ts` y al seed en `src/lib/mock/seed.ts`.

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

### Paso 5: Crear la página

```
src/app/(campaign)/[campaignSlug]/[nueva-seccion]/
├── page.tsx       → Componente principal
└── loading.tsx    → Skeleton de carga (siempre agregar)
```

### Paso 6: Agregar al sidebar si es sección de campaña

Editar `src/components/layout/campaign-sidebar.tsx` → array `navItems`.

### Paso 7: Actualizar documentación

Obligatorio — ver lineamientos en `CONTEXT.md`.

---

## Convenciones de código

### Nomenclatura

- Páginas: `page.tsx`
- Layouts: `layout.tsx`, Loading: `loading.tsx`, Error: `error.tsx`
- Componentes: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts`

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
- **Client Component** (`"use client"`): formularios, interactividad, hooks de React, Zustand

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
feat(ui): agregar módulo de mapas interactivos
fix(auth): corregir validación de contraseña en registro
refactor(mock): mejorar resolución de relaciones anidadas
chore(deps): actualizar prisma a v7.x
```

---

## Troubleshooting

### "Unexpected token '<', '<!DOCTYPE...' is not valid JSON"

La API devuelve HTML en lugar de JSON. Causas:
1. **Prisma no generado:** `npx prisma generate`
2. **DB no configurada:** verificar `DATABASE_URL` en `.env.local`
3. **Solución rápida:** activar `MOCK_MODE=true` en `.env.local`

### Error al login en modo mock

Verificar que `.env.local` tenga `MOCK_MODE=true`. Cualquier contraseña funciona para los usuarios demo.

### Los datos del mock no persisten entre sesiones

Si borraste `data/mock-db.json` o es la primera vez, se recreará desde el seed automáticamente.

### Cookie de sesión no setea

Verificar que `JWT_SECRET` esté configurado. El default de desarrollo funciona pero no debe usarse en producción.

### OpenAI "You exceeded your current quota"

Verificar balance y límites en el dashboard de OpenAI. La IA Forge no funciona sin créditos.

### Framer Motion + SSR warnings

Normal en Next.js App Router con componentes `"use client"`. Se hidratan correctamente en el cliente.
