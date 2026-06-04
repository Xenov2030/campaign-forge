# CampaignForge — Changelog

> Formato: `## [MAJOR.MINOR] — YYYY-MM-DD`
> Tipos: `feat` (nueva funcionalidad), `fix` (corrección), `refactor`, `chore`, `docs`

---

## [1.6] — 2026-06-04

### feat(dice) + fix(nav) + fix(sidebar) — Página de dados, nav refinado, versión en UI

**Archivos nuevos:**
- `src/components/dice/dice-roller.tsx` — Componente de tirada extraído de `DiceTray`. Reutilizable en la bandeja y en la página `/dice`.
- `src/app/(campaign)/[campaignSlug]/dice/page.tsx` — Página de dados con historial mock (izquierda) y roller inline (derecha). Disclaimer de datos simulados. Badges automáticos `¡CRÍTICO!` / `PIFIA`.
- `src/lib/version.ts` — Constante `APP_VERSION` como fuente única de verdad para el número de versión.

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `dice-tray.tsx` | Reescrito con `AnimatePresence` correcto: backdrop y panel son hijos condicionales separados dentro de su propio `<AnimatePresence>`. Fix definitivo del bug "bandeja no abre". Usa `DiceRoller` internamente. |
| `top-nav.tsx` | Nueva prop `isMaster?: boolean`. Botón Sparkles (IA) solo se renderiza si `isMaster`. Avatar convertido a `<Link href="/profile">`. |
| `campaign-sidebar.tsx` | Dados habilitado. Avatar y props `userDisplayName`/`userAvatarUrl` eliminados del footer. Badge de versión `v{APP_VERSION}` en footer, visible solo cuando el sidebar está expandido. |
| `(campaign)/layout.tsx` | Pasa `isMaster` a `TopNav`. Ya no pasa props de usuario al sidebar. |
| `(dashboard)/layout.tsx` | Email removido del nav. Avatar como `<Link href="/profile">`. "Salir" movido a la derecha del avatar. Footer con `CampaignForge v{APP_VERSION}`. |
| `.env.local.example` | Completado con todas las variables: `MOCK_MODE`, `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`. |

**Bugs resueltos:**
- Bandeja de dados no abría al hacer click en el ícono del navbar: `AnimatePresence` con early-return `null` en el componente raíz no detectaba el cambio de estado. Fix: siempre renderizar el componente, condición dentro de `AnimatePresence`.
- Avatar del navbar de campaña no tenía acción: era un `<button>` sin handler. Ahora navega a `/profile`.

**Versión en UI:**
- Sidebar de campaña: `v{APP_VERSION}` en el footer, visible solo cuando está expandido (opacidad reducida).
- Dashboard: footer con `CampaignForge v{APP_VERSION}` alineado a la derecha.

**Rama:** `fix/visuales`

---

## [1.5] — 2026-06-04

### fix(ui) — Sidebar reordenado, texto persistente, Chat/Voz en construcción

**Archivos nuevos:**
- `src/components/ui/under-construction.tsx` — Componente reutilizable "en construcción" con ícono temático, glow y animación float.
- `src/app/(campaign)/[campaignSlug]/chat/page.tsx` — Página en construcción para el chat de campaña.
- `src/app/(campaign)/[campaignSlug]/voice/page.tsx` — Página en construcción para canales de voz (LiveKit pendiente).

**Archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `campaign-sidebar.tsx` | Reordenamiento completo de ítems. Fix crítico: reemplazados todos los `AnimatePresence` alrededor de texto por `motion.span` con `animate` directo — resuelve texto invisible al volver de 404 o navegar entre secciones. Toggle button movido fuera del `overflow-hidden` wrapper para que no se recorte en desktop. "PNJs" → "NPCs". Nombre de usuario removido del footer. Link "Volver al dashboard" agregado en footer. Sesiones y Lore/Wiki re-habilitados. Ítems Chat y Canales de voz agregados con divider separador. |
| `dice-tray.tsx` | Backdrop transparente agregado (z-30) — cierra la bandeja al hacer click fuera del panel. |
| `.docs/06_mejoras.md` | Chat actualizado como "sidebar habilitado, página en construcción". Nuevo ítem Canales de voz (LiveKit) agregado como ALTA prioridad. |

**Orden final del sidebar (jugador):**
Inicio → Personajes → NPCs → Monstruos → Mundo → Quests → Objetos → Notas → Sesiones → Lore/Wiki → Dados → `[divider]` → Chat → Canales de voz

**Solo máster (adicional):** Galería, Mapas, IA Forge

**Bugs resueltos:**
- Texto del sidebar desaparecía al navegar de vuelta desde una 404: `AnimatePresence` inicializaba con `opacity: 0` al remontar el Server Component layout y podía quedar atascado. Fix: `motion.span` siempre en DOM, solo cambia `opacity`/`x`.
- Botón toggle del sidebar recortado en desktop: `overflow-hidden` en `motion.aside` cortaba el botón `absolute -right-3`. Fix: wrapper interno con `overflow-hidden`, botón como hijo directo de `motion.aside`.

**Rama:** `fix/visuales`

---

## [1.4] — 2026-06-04

### feat(mock): modo de desarrollo sin base de datos

**Archivos nuevos:**
- `src/lib/mock/seed.ts` — Datos iniciales: campaña "La Maldición de Strahd" con 2 usuarios, 3 NPCs, personaje, 3 sesiones, 2 quests, locaciones, facciones, lore precargados.
- `src/lib/mock/store.ts` — Store global en memoria + persistencia en `data/mock-db.json`. Sobrevive hot-reload via `globalThis._mockStore`.
- `src/lib/mock/query.ts` — Motor de queries compatible con Prisma: `where` (AND/OR/NOT, operadores `in`/`contains`/`gte`/`lt`, relaciones `some`), `include` con resolución de relaciones anidadas y `_count`, `select`, `orderBy`.
- `src/lib/mock/client.ts` — Clon del cliente Prisma con todos los modelos: `findMany`, `findFirst`, `findUnique`, `create`, `update`, `updateMany`, `delete`, `deleteMany`, `upsert`, `count`, `$transaction`.
- `.env.local.example` — Plantilla documentada de variables de entorno.

**Archivos modificados:**

| Archivo | Cambio |
|---------|--------|
| `src/lib/prisma.ts` | Reescrito: `require()` dinámico para Prisma real, switch condicional `MOCK_MODE=true → createMockClient()`. La app ya no crashea si `@prisma/client` no está generado. |
| `src/lib/auth.ts` | `loginUser()` omite `bcrypt.compare()` cuando `MOCK_MODE=true` (el seed no tiene hashes reales). |
| `package.json` | Nuevos scripts: `mock:reset` (borra `data/mock-db.json`) y `dev:setup` (generate + push + seed para DB real). |
| `.gitignore` | Agrega `data/mock-db.json` y corrige excepción de `.env.local.example`. |

**Para activar:**
1. Asegurar que `.env.local` tenga `MOCK_MODE=true` y `JWT_SECRET`
2. `npm run dev` — sin ningún paso adicional
3. Login: `master@demo.com` o `player@demo.com` con cualquier contraseña

**Rama:** `fix/visuales`

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
