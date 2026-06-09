# Diseño — Roles globales y panel de administración

**Fecha:** 2026-06-08
**Estado:** Diseño validado (pendiente de implementación)
**Autor:** Cristian Fernandez

## 1. Objetivo

Permitir que algunos usuarios puedan **crear y mastear** sus propias campañas, mientras que por defecto las cuentas nuevas solo pueden **unirse y jugar** campañas ajenas. Un usuario administrador otorga/quita el permiso de mastear desde un panel de control.

### No-objetivos (fuera de alcance)
- Transferir el master de una campaña a otro usuario.
- Archivar/bloquear campañas al degradar un master.
- Crear nuevos ADMIN desde la UI (solo por allowlist de entorno).
- Renombrar `lib/supabase` → `lib/session` (anotado como deuda técnica, ver §9).

## 2. Concepto central: dos niveles de rol

Existen **dos preguntas independientes** que no hay que confundir:

| Pregunta | Vive en | Valores |
|---|---|---|
| ¿Qué puede hacer la **cuenta** a nivel global? | `User.role` (nuevo) | PLAYER / MASTER / ADMIN |
| ¿Qué es el usuario **dentro de una campaña**? | `CampaignMember.role` (ya existe) | MASTER / PLAYER / SPECTATOR |

El rol global es un **techo de capacidad** ("¿podés crear campañas?"). El rol por-campaña decide qué herramientas ve **dentro** de cada campaña. Un `MASTER` global es `CampaignMember.MASTER` en sus campañas y `CampaignMember.PLAYER` en las ajenas. Las herramientas de master siempre se gatean por el rol **por-campaña**, nunca por el global.

## 3. Decisiones tomadas

| Decisión | Resuelto |
|---|---|
| Modelo de rol global | `enum UserRole { PLAYER, MASTER, ADMIN }` en `User.role` |
| Default de cuenta nueva | `PLAYER` (cerrado; el admin promueve) |
| Bootstrap del 1er admin | Allowlist por env `ADMIN_EMAILS` |
| Panel admin | Togglea solo PLAYER↔MASTER; ADMIN solo por env |
| Degradar MASTER→PLAYER | No destructivo: solo bloquea crear nuevas; lo existente queda intacto |
| Rol por-campaña | `CampaignMember.role` sin cambios |
| Ubicación del panel | Ruta `/admin` separada, guardada para ADMIN |
| Datos por usuario en el panel | Identidad (avatar, displayName, username, email) + badge de rol + `createdAt` |

## 4. Modelo de datos (Prisma)

```prisma
enum UserRole {
  PLAYER
  MASTER
  ADMIN
}

model User {
  // ...campos existentes...
  role UserRole @default(PLAYER)
}
```

Migración: `prisma migrate dev --name add_user_role`. Las cuentas existentes adoptan el default `PLAYER`; el/los email(s) en `ADMIN_EMAILS` se promueven a ADMIN en su próximo login (ver §5).

## 5. Bootstrap y resolución de rol (allowlist por env)

**Arquitectura real (no usa Supabase Auth):** auth casero JWT+bcrypt. El `User` se crea en `registerUser()` (`src/lib/auth.ts`) y `getSessionUser()` devuelve el `User` completo de Prisma. Por eso `user.role` queda disponible en toda la app sin tocar el transporte de sesión.

Variable de entorno:
```
ADMIN_EMAILS=francisco.quarnolo@sandinas.com.ar
```

Helper puro:
```ts
// src/lib/auth.ts (o src/lib/roles.ts)
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export function resolveRoleForEmail(email: string, current?: UserRole): UserRole {
  if (adminEmails.includes(email.toLowerCase())) return "ADMIN";
  return current ?? "PLAYER";
}
```

Puntos de aplicación (idempotente):
1. **En `registerUser()`**: al crear, `role: resolveRoleForEmail(email)`.
2. **En login (`loginUser`/`getSessionUser`)**: si `email ∈ allowlist` y `user.role !== "ADMIN"`, hacer un `update` que lo suba a ADMIN. Esto promueve cuentas pre-existentes y sobrevive reseeds.

> Nota: la allowlist solo **promueve** a ADMIN; nunca degrada. Si quitás un email de la lista, el usuario conserva ADMIN hasta que se lo cambie manualmente (decisión conservadora para no perder acceso por error de config).

## 6. Puntos de enforcement

El permiso se valida en **tres capas** (defensa en profundidad — nunca confiar solo en ocultar la UI):

1. **UI (server components)**:
   - Botón/CTA "Nueva campaña" en el dashboard: visible solo si `role !== "PLAYER"`.
   - Link a `/admin` en la top-nav: visible solo si `role === "ADMIN"`.
2. **API**:
   - `POST /api/campaigns`: si `user.role === "PLAYER"` → `403 Forbidden`.
   - `/api/admin/*`: si `user.role !== "ADMIN"` → `403`.
3. **Acceso a rutas**:
   - `/dashboard/new-campaign` (page server component): si PLAYER → redirect a `/dashboard` con aviso.
   - `/admin/*` (layout server component): si no ADMIN → redirect a `/dashboard` (o 404).

> El middleware `src/proxy.ts` se deja **solo para auth** (verificar sesión). El chequeo de rol se hace en los server components/endpoints, donde ya hay acceso a Prisma y al `User` completo. Meter rol en el middleware obligaría a un lookup de DB en el edge — innecesario.

## 7. Panel de administración (`/admin`)

### Rutas
- `src/app/(admin)/admin/layout.tsx` — guard: `getUser()` → si `role !== ADMIN` redirect.
- `src/app/(admin)/admin/page.tsx` — tabla de usuarios.

### Endpoints
- `GET /api/admin/users` → lista de usuarios (id, displayName, username, email, avatarUrl, role, createdAt). Solo ADMIN.
- `PATCH /api/admin/users/[id]` → body `{ role: "PLAYER" | "MASTER" }`. Solo ADMIN.

### Reglas del PATCH
- Solo acepta `PLAYER` o `MASTER` (nunca `ADMIN` desde la UI → `400`).
- No se puede cambiar el rol de un usuario `ADMIN` (su switch aparece bloqueado/oculto).
- Un admin no puede auto-degradarse (defensa contra quedarse sin admins).

### UI (tabla)
Columnas: Avatar + displayName/username · Email · Badge de rol · Fecha de registro (`createdAt`) · Switch MASTER on/off.
- El switch refleja `role === "MASTER"`. ON → PATCH a MASTER; OFF → PATCH a PLAYER.
- Filas de ADMIN: badge ADMIN, switch deshabilitado con tooltip ("se gestiona por configuración").
- Optimistic update + toast (ya hay Sonner en el proyecto) y rollback si el PATCH falla.

## 8. Casos borde

| Caso | Comportamiento |
|---|---|
| Degradar MASTER→PLAYER con campañas propias | Campañas intactas; sigue siendo `CampaignMember.MASTER` de ellas. Solo pierde "Nueva campaña". |
| PLAYER intenta `POST /api/campaigns` directo (sin UI) | `403`. |
| Email en allowlist que se registra por primera vez | Nace ADMIN (vía `resolveRoleForEmail` en `registerUser`). |
| Email en allowlist registrado antes del feature | Se promueve a ADMIN en su próximo login. |
| Admin intenta degradarse a sí mismo | `400` / bloqueado en UI. |
| Quitar email de `ADMIN_EMAILS` | El usuario conserva ADMIN (la allowlist no degrada). |

## 9. Deuda técnica anotada (fuera de alcance)

**Supabase es código muerto, no solo un naming legacy.** Verificado:
- Auth → JWT+bcrypt propio sobre Neon (no Supabase Auth).
- Realtime de chat y eventos → **Pusher** (`src/lib/pusher/client.ts`).
- Voz → **LiveKit** (`/api/livekit/token`).
- El cliente Supabase realtime (`getRealtimeClient` en `src/lib/supabase/client.ts`) **no lo importa nadie**.
- `src/lib/supabase/server.ts` solo re-exporta el alias `getUser` (que es el auth casero).

Limpieza opcional futura (NO en esta feature, para mantener el diff enfocado):
1. Eliminar dependencias `@supabase/ssr` y `@supabase/supabase-js` del `package.json`.
2. Borrar `src/lib/supabase/client.ts` (muerto).
3. Renombrar `src/lib/supabase/server.ts` → `src/lib/session.ts` y actualizar imports del alias `getUser`.

## 10. Plan de implementación

1. **Schema**: agregar `UserRole` + `User.role`; migrar.
2. **Allowlist**: `resolveRoleForEmail` + aplicarlo en `registerUser` y login.
3. **Enforcement API**: guard en `POST /api/campaigns`.
4. **Enforcement UI**: ocultar "Nueva campaña" para PLAYER; guard en `/dashboard/new-campaign`.
5. **Panel**: rutas `/admin` + endpoints `GET/PATCH /api/admin/users` + tabla con switch.
6. **Top-nav**: link a `/admin` solo para ADMIN.
7. **QA**: probar las tres capas con un PLAYER, un MASTER y un ADMIN.

## 11. Testing manual mínimo
- PLAYER: no ve "Nueva campaña", `/dashboard/new-campaign` redirige, `POST /api/campaigns` da 403, `/admin` redirige.
- MASTER: crea campañas, se une a ajenas como PLAYER, no ve `/admin`.
- ADMIN: ve `/admin`, promueve/degrada, no puede auto-degradarse ni setear ADMIN por UI.
