# CampaignForge — Changelog

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
