# CampaignForge — Changelog

> Formato: `## [MAJOR.MINOR] — YYYY-MM-DD`
> Tipos: `feat` (nueva funcionalidad), `fix` (corrección), `refactor`, `chore`, `docs`

---

## [1.3] — 2026-06-04

### fix(auth) — Login robusto, demo login funcional, hero sin CTAs duplicados

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `src/app/page.tsx` | Eliminados botones "Crear cuenta gratis" y "Probar demo" del hero. El usuario es forzado a scrollear al CTA section donde ya están. Elimina redundancia y mejora el flujo. |
| `src/app/api/auth/demo-login/route.ts` | Reescrito para aceptar `NextRequest` y usar `request.nextUrl.origin` en lugar de `process.env.NEXT_PUBLIC_APP_URL` para garantizar redirects correctos en cualquier entorno. |
| `src/app/(auth)/login/page.tsx` | Reescrito con: `LoginForm` + `LoginPage` wrapper con `<Suspense>` (requerido por `useSearchParams` en App Router). `useEffect` detecta `?demo=unavailable` y muestra error informativo. Check de `Content-Type` antes de `res.json()` para manejar respuestas HTML de errores del servidor (Prisma no generado). `role="alert"` en div de error. |
| `src/app/(auth)/register/page.tsx` | Mismo check de `Content-Type` antes de `res.json()` para consistencia. |

**Errores corregidos:**

- `"Unexpected token '<', '<!DOCTYPE ...' is not valid JSON"` al iniciar sesión: ocurría cuando `@prisma/client` no estaba generado, Next.js devolvía HTML 500 en lugar de JSON. Fix: verificar `content-type` antes de parsear.
- Demo login sin feedback: la redirección a `/login?demo=unavailable` no mostraba nada al usuario. Fix: `useEffect` en login que detecta el param y muestra mensaje descriptivo con instrucciones.
- `useSearchParams()` sin Suspense: error de Next.js App Router en build. Fix: wrapped en `<Suspense>`.

**Rama:** `fix/visuales`

---

## [1.2] — 2026-06-04

### fix(ui) — Demo login, CTAs coherentes, cursor-pointer y hover effects

**Archivos nuevos:**
- `src/app/api/auth/demo-login/route.ts` — GET endpoint que autentica al usuario demo (`master@demo.com`) y redirige al dashboard. Permite probar la app sin crear cuenta.

**Lógica de negocio corregida:**
- Landing page: "Ver demo" / "Empezar aventura" apuntaban todos a `/register` o `/login` siendo redundantes e inconsistentes.
- Nueva estructura de CTAs:
  - **Nav**: "Iniciar sesión" (→ `/login`) + "Crear cuenta" (→ `/register`)
  - **Hero**: "Crear cuenta gratis" (primary, → `/register`) + "Probar demo" (secondary, → `/api/auth/demo-login`)
  - **CTA section**: "Empezar gratis" (→ `/register`) + "Ver demo primero" (→ `/api/auth/demo-login`)
- El botón "Probar demo" ahora genuinamente diferente: auto-login como máster con campaña de ejemplo precargada.

**Cursor-pointer y hover effects:**
| Elemento | Cambio |
|---------|--------|
| `globals.css` | Regla global `button:not(:disabled)`, `[role="button"]`, `label[for]`, `input[type="checkbox/radio"]` → `cursor: pointer`. `.dice` → `cursor: pointer`. |
| `select.tsx` SelectTrigger | Añadido `cursor-pointer` + `hover:border-[var(--border-strong)]` |
| `input.tsx` Input | Añadido `hover:border-[var(--border-strong)]` antes de focus |
| `textarea.tsx` Textarea | Añadido `hover:border-[var(--border-strong)]` antes de focus |
| `new-campaign/page.tsx` | Theme buttons y system buttons: `cursor-pointer` explícito + `hover:bg-[var(--bg-elevated)]` |
| Dashboard stat cards | Añadido `hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all` |

**Rama:** `fix/visuales`

---

> Formato: `## [MAJOR.MINOR] — YYYY-MM-DD`
> Tipos: `feat` (nueva funcionalidad), `fix` (corrección), `refactor`, `chore`, `docs`

---

## [1.1] — 2026-06-04

### fix(ui) — Mejoras de UX visual, accesibilidad y responsividad móvil

**Archivos nuevos:**
- `src/app/not-found.tsx` — Página 404 temática "Tierra Inexplorada" con animaciones del design system
- `src/app/error.tsx` — Error boundary global con opción de reintentar
- `src/app/(dashboard)/dashboard/loading.tsx` — Skeleton de carga del dashboard
- `src/app/(campaign)/[campaignSlug]/loading.tsx` — Skeleton de carga del workspace

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `globals.css` | `--text-muted` #5a5550 → #7a7470 (contraste WCAG AA 4.5:1), `@media prefers-reduced-motion`, `.campaign-card:focus-visible`, `.hide-scrollbar-mobile` |
| `top-nav.tsx` | Hamburger button en mobile, `aria-label` en todos los botones, breadcrumb truncado con max-w responsive, touch targets 36px mínimo |
| `campaign-sidebar.tsx` | Mobile overlay (fixed z-50 cuando abierto, `!hidden` cuando cerrado), backdrop con click-to-close, se cierra automáticamente al navegar en mobile, `aria-label` + `aria-expanded` en toggle, `aria-current="page"` en nav activo |
| `layout.tsx` (root) | `maximumScale: 5` en viewport para accesibilidad de zoom |
| `(dashboard)/layout.tsx` | Email/nombre usuario oculto en `< md`, labels colapsados en `< sm`, padding responsivo |
| `dashboard/page.tsx` | Padding responsivo, heading truncado, botón "Nueva" colapsado en mobile |
| `page.tsx` (landing) | Hero `text-5xl sm:text-6xl md:text-8xl`, padding mobile reducido, secciones `py-20 md:py-32` |

**Rama:** `fix/visuales`
**Commit:** `d8cac38`

---

## [1.0] — 2026-06-04

### feat — Sistema completo de gestión de campañas listo para producción

**Módulos implementados:**
- Auth completo (registro, login, logout, cambio de contraseña)
- Dashboard multi-campaña con stats
- Wizard de creación de campaña (3 pasos: nombre/tema/sistema)
- Sistema de invitación por código único
- Workspace de campaña con sidebar colapsable
- Fichas de personaje (stats, HP, inventario, hechizos, relaciones)
- PNJs con visibilidad máster/jugador
- Monstruos con CR y habilidades
- Locaciones, facciones, items, quests
- Sesiones con resúmenes IA
- Wiki / Lore con categorías
- Galería de imágenes
- Notas privadas
- Chat por salas
- Tiradas de dados (d4-d100)
- IA Forge: NPC, Monstruo, Quest, Localización, Objeto, Resumen
- Asistente del Máster (GPT-4o contextual)
- Temas dinámicos por campaña (Fantasy, Horror, SciFi, Grimdark, etc.)
- Design system CSS con variables (dark fantasy immersive)
- Animaciones con Framer Motion
- Layout responsive desktop-first

**Rama:** `master`
**Commit:** `c70e01e`
