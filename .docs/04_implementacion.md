# CampaignForge — Guía de Implementación

**Versión:** 1.1 | **Última actualización:** 2026-06-04

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Git | 2.x |
| Cuenta Supabase | — |
| Cuenta OpenAI | — |

---

## Setup inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/Xenov2030/campaign-forge.git
cd campaign-forge
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

```env
# Base de datos (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Auth
JWT_SECRET="tu-secreto-minimo-32-caracteres-aqui"

# IA
OPENAI_API_KEY="sk-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Upload (opcional para desarrollo)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Generar Prisma Client y sincronizar DB

```bash
npx prisma generate
npx prisma db push
```

Para ambientes con migraciones formales:
```bash
npx prisma migrate dev --name init
```

### 5. (Opcional) Poblar con datos de prueba

```bash
npx prisma db seed
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## Configuración de Supabase

### Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New project
2. Obtener `URL` y `anon key` desde Settings → API
3. Obtener `service_role key` desde la misma sección

### Habilitar autenticación por email
Settings → Authentication → Email → Enable email confirmations: **OFF** (para desarrollo, ON en producción)

### Obtener DATABASE_URL
Settings → Database → Connection string → Direct connection (no pooling para Prisma)

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npx prisma studio` | UI visual para explorar la DB |
| `npx prisma db push` | Sincronizar schema sin migraciones |
| `npx prisma migrate dev` | Crear y aplicar migración |
| `npx prisma generate` | Regenerar el Prisma Client |

---

## Deploy en Vercel (recomendado)

### 1. Conectar repositorio
1. Ir a [vercel.com](https://vercel.com) → Add new project
2. Importar el repositorio de GitHub

### 2. Configurar variables de entorno
En el panel de Vercel → Settings → Environment Variables, agregar todas las variables del `.env`.

### 3. Configurar `NEXT_PUBLIC_APP_URL`
Setear con la URL de producción: `https://tu-dominio.vercel.app`

### 4. Deploy automático
Cada push a `main/master` hace deploy automático.

---

## Flujo de desarrollo — agregar una funcionalidad nueva

### Paso 1: Leer documentación de contexto
```bash
# Leer siempre primero
cat .docs/CONTEXT.md
```

### Paso 2: Crear rama

```bash
git checkout -b feat/nombre-funcionalidad
# o para fixes:
git checkout -b fix/nombre-fix
```

### Paso 3: Modificar schema si aplica

```prisma
// prisma/schema.prisma
model NuevaEntidad {
  id         String   @id @default(cuid())
  campaignId String
  campaign   Campaign @relation(...)
  // ...campos
  createdAt  DateTime @default(now())
}
```

```bash
npx prisma db push      # desarrollo sin migraciones
npx prisma generate     # regenerar client
```

### Paso 4: Crear la API route si aplica

```ts
// src/app/api/[recurso]/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // ... lógica
}
```

### Paso 5: Crear la página

```
src/app/(campaign)/[campaignSlug]/[nueva-seccion]/
├── page.tsx       → Componente principal (Server Component preferido)
└── loading.tsx    → Skeleton de carga (siempre agregar)
```

```tsx
// page.tsx — patrón básico
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function NuevaPagina({ params }: { params: Promise<{ campaignSlug: string }> }) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  // fetch de datos con prisma
  // return JSX
}
```

### Paso 6: Agregar al sidebar (si es sección de campaña)

Editar `src/components/layout/campaign-sidebar.tsx`:

```tsx
const navItems: SidebarItem[] = [
  // ... items existentes
  {
    label: "Nueva Sección",
    href: `${base}/nueva-seccion`,
    icon: <IconoRelevante className="h-4 w-4" />,
    isMasterOnly: false, // o true si es solo para máster
  },
];
```

### Paso 7: Actualizar documentación

Obligatorio — ver lineamientos en `CONTEXT.md`.

---

## Convenciones de código

### Nomenclatura de archivos
- Páginas: `page.tsx` (sin nombre)
- Layouts: `layout.tsx`
- Loading: `loading.tsx`
- Error: `error.tsx`
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

### Clases CSS
```tsx
// Usar CSS variables del design system
// Mobile-first con breakpoints Tailwind
// cn() para clases condicionales
className={cn(
  "base-classes",
  condition && "conditional-classes",
  "responsive:breakpoint-classes"
)}
```

### Server vs Client Components
- **Server Component** (default): páginas que solo fetchen datos y rendericen HTML
- **Client Component** (`"use client"`): formularios, interactividad, hooks de React, Zustand

---

## Convenciones de git

### Branches
```
feat/nombre-funcionalidad    → nueva funcionalidad
fix/nombre-fix               → corrección de bug
fix/visuales                 → fixes de UI/UX
refactor/nombre              → refactoring
chore/nombre                 → tareas de mantenimiento
```

### Commit messages
Formato: `type(module): descripción en español`

```bash
feat(ui): agregar módulo de mapas interactivos
fix(ui): corregir overflow en mobile del sidebar
refactor(auth): migrar cookies a httpOnly
chore(deps): actualizar prisma a v7.x
```

---

## Troubleshooting frecuente

### Error: "Module '@prisma/client' has no exported member 'PrismaClient'"
```bash
npx prisma generate
```

### Error en seed: tipos no encontrados
```bash
npx prisma generate && npx prisma db seed
```

### Cookie de sesión no setea en desarrollo
Verificar que `JWT_SECRET` esté configurado en `.env`.

### OpenAI "You exceeded your current quota"
Verificar balance y límites en el dashboard de OpenAI.

### Framer Motion + SSR warnings
Normal en Next.js App Router. Los componentes `"use client"` con Framer Motion se hidratan correctamente.
