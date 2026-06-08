# CampaignForge — Documentación Técnica

**Versión:** 2.3 | **Última actualización:** 2026-06-08

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.x |
| Runtime | React | 19.2.x |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS + PostCSS | v4 |
| ORM | Prisma | v7 |
| Base de datos | PostgreSQL (Neon recomendado) | 15+ |
| Adaptador DB | `@prisma/adapter-pg` | v7 |
| Auth | JWT custom (`jose`) + bcryptjs | — |
| IA | Google Gemini 2.0 Flash (`@google/generative-ai`) | ^0.24.0 |
| Realtime (chat) | Pusher Channels (`pusher` + `pusher-js`) | ^5.3 / ^8.5 |
| Voz | LiveKit (`livekit-server-sdk` + `livekit-client`) | — |
| Notificaciones UI | Sonner | ^2.0 |
| Estado global | Zustand | v5 |
| Animaciones | Framer Motion | v12 |
| Componentes UI | Radix UI + shadcn/ui pattern | — |
| Íconos | Lucide React | — |
| Forms | React Hook Form + Zod | — |
| Imágenes | Cloudinary | — |
| Deploy | Vercel / Netlify (config presente) | — |

---

## Arquitectura del sistema

```mermaid
flowchart TD
    subgraph Client["Cliente (Browser)"]
        NC[Next.js Client Components]
        ZS[Zustand Stores\ncampaign-store / notification-store]
        PJS[pusher-js\nWebSocket]
        LKC[livekit-client\nVoz WebRTC]
        NC <--> ZS
        NC <--> PJS
        NC <--> LKC
    end

    subgraph Server["Servidor (Next.js App Router)"]
        SC[Server Components]
        AR[API Route Handlers]
        PTS[lib/prisma.ts]
        PSS[lib/pusher/server.ts]
        LKS[livekit-server-sdk]
    end

    subgraph DataLayer["Capa de datos"]
        MOCK[Mock Client\ndata/mock-db.json]
        REAL[(PostgreSQL\nNeon)]
    end

    subgraph External["Servicios Externos"]
        GEM[Google Gemini\n2.0 Flash]
        CDN[Cloudinary]
        PSH[Pusher\nChannels]
        LKR[LiveKit\nCloud]
    end

    Client -->|RSC / fetch| Server
    SC --> PTS
    AR --> PTS
    PTS -->|MOCK_MODE=true| MOCK
    PTS -->|MOCK_MODE=false| REAL
    AR -->|Gemini SDK| GEM
    AR -->|Upload| CDN
    AR -->|trigger| PSS
    PSS -->|HTTP API| PSH
    PSH -->|WebSocket event| PJS
    AR -->|generate token| LKS
    LKS -->|JWT token| Client
    LKC -->|WebRTC| LKR
```

### Descripción de capas

| Capa | Responsabilidad |
|------|----------------|
| **Server Components** | Fetch de datos inicial (Prisma directo), validación de sesión con `getUser()`, renderizado HTML en servidor |
| **Client Components** | Interactividad, formularios, animaciones, estado local con `useState`, estado global con Zustand |
| **API Routes** | Mutaciones (POST/PUT/DELETE), llamadas a Gemini, trigger de eventos Pusher, generación de tokens LiveKit |
| **Zustand — campaign-store** | Estado de UI: sidebar open/close, dice tray, AI assistant panel, `chatSendMessage` ref, `masterHidingRolls` |
| **Zustand — notification-store** | `unreadChatCount`: incrementado por `CampaignRealtime` al recibir mensajes ajenos; limpiado al entrar al chat |
| **CampaignRealtime** | Componente null-render montado en el layout. Suscribe al canal Pusher de campaña y al canal de chat. Llama `router.refresh()` ante eventos de datos, muestra toasts al máster |
| **useChatMessages** | Hook: carga inicial via API + suscripción realtime Pusher. Deduplicación de mensajes por ID |
| **Mock Layer** | Reemplaza Prisma cuando `MOCK_MODE=true`; cliente con misma API, respaldado en `data/mock-db.json` |

---

## Autenticación — Flujo

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as Client
    participant API as /api/auth/login
    participant P as lib/prisma.ts
    participant CK as Cookie (httpOnly)

    U->>C: Ingresa email + password
    C->>API: POST { email, password }
    API->>P: user.findUnique({ where: { email } })
    P-->>API: user { id, passwordHash, ... }
    API->>API: bcrypt.compare(password, hash)
    API->>API: jose.SignJWT({ sub: userId }, exp: 7d)
    API-->>CK: Set-Cookie: cf_session (httpOnly, sameSite: lax)
    API-->>C: { ok: true, user }
    C->>C: window.location.href = "/dashboard"
```

**Token:** JWT firmado con `JWT_SECRET`, payload `{ sub: userId }`, cookie `cf_session` httpOnly 7 días.

---

## Chat en tiempo real — Flujo Pusher

```mermaid
sequenceDiagram
    actor E as Emisor
    actor R as Receptor
    participant Hook as useChatMessages
    participant API as /api/chat/[roomId]
    participant DB as Prisma
    participant PSS as pusher server
    participant PSH as Pusher Cloud
    participant PJS as pusher-js (receptor)

    E->>Hook: sendMessage(content)
    Hook->>Hook: Agrega mensaje localmente (optimistic)
    Hook->>API: POST { content, type, metadata }
    API->>DB: chatMessage.create(...)
    API->>PSS: trigger("chat-{roomId}", "new-message", msg)
    PSS->>PSH: HTTP POST (trigger)
    PSH->>PJS: WebSocket push
    PJS->>Hook: handler(msg) — dedup por ID
    Hook->>Hook: setMessages (receptor actualiza UI)
```

---

## Esquema de base de datos

### Entidades principales

```mermaid
classDiagram
    class User {
        +id: String (cuid)
        +email: String (unique)
        +username: String (unique)
        +displayName: String
        +passwordHash: String?
        +avatarUrl: String?
        +createdAt: DateTime
    }

    class Campaign {
        +id: String (cuid)
        +name: String
        +slug: String (unique)
        +theme: CampaignTheme
        +system: GameSystem
        +status: CampaignStatus
        +inviteCode: String (unique)
        +masterId: String (FK)
    }

    class CampaignMember {
        +campaignId: String (FK)
        +userId: String (FK)
        +role: MemberRole
        +joinedAt: DateTime
    }

    class ChatRoom {
        +id: String
        +name: String
        +type: RoomType (PUBLIC/PRIVATE/MASTER_ONLY)
        +channelType: ChannelType (TEXT/VOICE)
        +campaignId: String (FK)
    }

    class ChatMessage {
        +id: String
        +content: String
        +type: MessageType (TEXT/DICE_ROLL/SYSTEM/WHISPER)
        +metadata: Json
        +userId: String (FK)
        +roomId: String (FK)
        +createdAt: DateTime
    }

    class Character {
        +id: String
        +name: String
        +level: Int
        +hitPoints / maxHitPoints: Int
        +stats: Json
        +campaignId: String (FK)
        +userId: String (FK)
    }

    class NPC {
        +id: String
        +name: String
        +isKnownToParty: Boolean
        +campaignId: String (FK)
    }

    class Session {
        +id: String
        +number: Int
        +summary, aiSummary: String?
        +status: SessionStatus
        +campaignId: String (FK)
    }

    User "1" --> "N" Campaign : masters
    User "N" --> "N" Campaign : members via CampaignMember
    Campaign "1" --> "N" ChatRoom
    ChatRoom "1" --> "N" ChatMessage
    ChatMessage --> User
    Campaign "1" --> "N" Character
    Campaign "1" --> "N" NPC
    Campaign "1" --> "N" Session
```

### Entidades secundarias

| Entidad | Descripción |
|---------|-------------|
| `Monster` | Bestiario con stats, CR, habilidades, acciones legendarias |
| `Location` | Locaciones jerárquicas (parent/children recursivo) |
| `Faction` | Facciones con alineamiento, objetivos y secretos |
| `Item` | Objetos con rareza, propiedades JSON, atunement |
| `Quest` | Misiones con objetivos (Json array), estado, recompensa |
| `LoreEntry` | Wiki con categorías y visibilidad por rol |
| `Note` | Notas privadas por usuario/campaña |
| `VisualAid` | Galería de imágenes por campaña |
| `DiceRoll` | Historial de tiradas con notación y resultados JSON |
| `GameMap` | Mapas con marcadores JSON y fog of war |
| `TimelineEvent` | Eventos de la línea de tiempo |
| `GeneratedContent` | Log de contenido generado por IA |

---

## API Routes

### Auth

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login con email/password, setea cookie `cf_session` | No |
| POST | `/api/auth/register` | Registro de nuevo usuario | No |
| POST | `/api/auth/signout` | Borra cookie de sesión | No |
| GET | `/api/auth/me` | Datos del usuario autenticado | Sí |

### Campañas

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/campaigns` | Lista campañas del usuario | Sí |
| POST | `/api/campaigns` | Crear nueva campaña | Sí |
| GET | `/api/campaigns/by-slug/[slug]` | Datos básicos de campaña por slug | Sí |
| POST | `/api/campaigns/join` | Unirse con código + trigger Pusher `member-joined` | Sí |

### Personajes y NPCs

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/characters` | Crear personaje + trigger Pusher `character-created` | Sí (miembro) |
| POST | `/api/npcs` | Crear NPC | Sí (master) |

### Chat

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/chat/rooms` | Lista salas de texto/voz por campaña | Sí |
| GET | `/api/chat/[roomId]` | Lista mensajes con paginación | Sí |
| POST | `/api/chat/[roomId]` | Enviar mensaje + trigger Pusher `new-message` | Sí |

### Contenido de campaña

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET/POST | `/api/sessions` | Sesiones | Sí |
| GET/POST | `/api/lore` | Entradas de wiki/lore | Sí |
| GET/POST | `/api/gallery` | Galería visual | Sí |

### IA

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/ai` | Generar contenido (NPC, monstruo, quest, etc.) via Gemini | Sí (master) |
| POST | `/api/ai/assistant` | Chat contextual con asistente del máster | Sí (master) |

### Perfil

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| PUT | `/api/profile` | Actualizar displayName o contraseña | Sí |

---

## Flujo de generación IA (Gemini)

```mermaid
sequenceDiagram
    actor M as Máster
    participant UI as IA Forge
    participant API as /api/ai
    participant GEN as lib/ai/generators.ts
    participant GEM as Gemini 2.0 Flash
    participant DB as Prisma

    M->>UI: Selecciona tipo + parámetros
    UI->>API: POST { type, params, campaignId }
    API->>API: Verificar auth + rol máster
    API->>GEN: generateContent(type, params, campaign)
    GEN->>GEN: Construir prompt contextual
    GEN->>GEM: getGenerativeModel + generateContent
    note over GEM: responseMimeType: "application/json"
    GEM-->>GEN: JSON estructurado
    GEN->>DB: generatedContent.create(log)
    GEN-->>API: Contenido generado
    API-->>UI: { content, type }
    UI->>M: Muestra resultado
```

**Asistente del Máster:** usa `model.startChat()` con historial mapeado (`assistant` → `model` para Gemini).

---

## Variables de entorno

| Variable | Descripción | Mock | DB real |
|----------|-------------|------|---------|
| `MOCK_MODE` | `"true"` activa el mock layer | **Requerida** | No |
| `DATABASE_URL` | URL de conexión PostgreSQL | No | **Requerida** |
| `JWT_SECRET` | Secreto JWT (mín. 32 chars en prod) | Opcional | **Requerida** |
| `GEMINI_API_KEY` | API key de Google Gemini | Opcional | Opcional |
| `PUSHER_APP_ID` | ID de la app Pusher | No | Recomendada |
| `PUSHER_SECRET` | Secret de la app Pusher | No | Recomendada |
| `NEXT_PUBLIC_PUSHER_KEY` | Key pública Pusher | No | Recomendada |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Cluster Pusher (`us2`, `eu`, etc.) | No | Recomendada |
| `LIVEKIT_API_KEY` | API key de LiveKit | No | Para voz |
| `LIVEKIT_API_SECRET` | Secret LiveKit | No | Para voz |
| `NEXT_PUBLIC_LIVEKIT_URL` | URL WebSocket LiveKit | No | Para voz |
| `CLOUDINARY_*` | Credenciales Cloudinary | No | Para imágenes |

---

## Design system — CSS Variables

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-base` | `#0a0a0f` | Fondo principal |
| `--bg-surface` | `#111118` | Tarjetas, panels |
| `--bg-elevated` | `#1a1a26` | Elementos elevados |
| `--text-primary` | `#f0ece6` | Texto principal |
| `--text-secondary` | `#9a9087` | Texto secundario |
| `--text-muted` | `#7a7470` | Texto terciario (4.5:1 WCAG AA) |
| `--accent-gold` | `#c9a84c` | Acción primaria, CTAs |
| `--accent-arcane` | `#7c3aed` | IA, magia, arcano |
| `--font-display` | Cinzel | Títulos |
| `--font-body` | Crimson Text | Texto narrativo |
| `--font-ui` | Inter | UI, labels |
