# CLAUDE.md — Onboarding_Unazul (Claude Code)

> Politica global del proyecto Unazul, proyeccion de la wiki canon. Vive en `Gp.Documentacion/CLAUDE.md` y se copia a la carpeta padre `unazul/CLAUDE.md` con `bootstrap.ps1`. **Las rutas de este archivo se expresan desde la carpeta padre `unazul/` (donde opera tras el bootstrap); por eso la wiki y los artefactos del repo de doc llevan el prefijo `Gp.Documentacion/`.** La autoridad es la wiki (`Gp.Documentacion/.docs/wiki/`); este archivo es una proyeccion. Ante conflicto, gana la wiki. Generado con `ae-crear-politicas` (alias `ps-crear-agentsclaudemd`). Idioma: espanol. Sin emojis.

## Spec Driven Development Contract (Obligatorio)

Este proyecto usa Spec Driven Development. La wiki (`Gp.Documentacion/.docs/wiki/00..11` + la capa AE en `Gp.Documentacion/.docs/wiki/ae/`) es la UNICA fuente de verdad.

Antes de escribir codigo, el agente DEBE:
1. Identificar el `RS-*`, `RF-*`, `FL-*` o `CT-*` que ancla el cambio (ver `Gp.Documentacion/.docs/wiki/00_gobierno_documental.md`).
2. Si no existe ancla, crearla o repararla primero con `ps-asistente-wiki` o la skill `crear-*` correspondiente.
3. Cumplir el TICKET-GATE: identificar o crear el work item de Azure Boards ANTES de implementar.
4. Cargar contexto con `ps-contexto` y navegar codigo con `mi-lsp` (workspace `unazul`).

No conforme: implementar sin citar un ancla `RS/RF/FL/CT`, trabajar sin work item de Azure Boards, subir codigo roto sin waiver, explorar/leer en masa desde el hilo principal pudiendo delegar (ver Subagent-Gate), o cerrar sin trazabilidad, auditoria, integracion limpia y cleanup.

## TICKET-GATE — Azure Boards (Obligatorio)

Toda tarea governada requiere un **work item de Azure Boards** (org `soluciones-desarrollo`, proyecto `Onboarding_Unazul`) ANTES de implementar, cerrar o pushear.

- Crear/sincronizar el work item con `Skill(pj-crear-tarjeta-unazul)`.
- Vincular cada commit al work item con `AB#<id>` en el mensaje.
- Dejar registro tecnico en el work item con `Skill(unazul-dejar-registro)` (descripcion + comentario; sin rutas locales ni secretos).
- Un ticket = un scope = una rama. No pisarse trabajo entre devs.

## Estrategia de ramas (main-first activo)

- **main-first esta activo.** Rama principal `main`; las features se crean desde `main`; al terminar (test + trazabilidad + wiki actualizada en `Gp.Documentacion`) se integra a `origin/main` sanitizando worktrees y branches.
- **Deploy a `development`**: cherry-pick o merge de commits especificos desde `main` -> `development`.
- **Deploy a `production`**: mismo mecanismo, cherry-pick o merge desde `main` -> `production`.
- La huella de cherry-pick son los archivos `Gp.Documentacion/.docs/wiki/changelog/HU{hu-id}-{task-id}.md` creados por `Skill(unazul-commit-changelog)` en cada commit.
- Nunca subir codigo roto salvo waiver explicito.
- **Regla dura (agentes/automatizacion): operar solo en `main` y ramas feature.** Los deploys a `development` y `production` son responsabilidad del equipo via cherry-pick/merge; el agente no toca esas ramas bajo ninguna circunstancia.

## N) mi-lsp — OBLIGATORIO en toda tarea

Workspace: `unazul` (binario Windows x64) | Default: `--format toon`
Wiki queries: agregar `--repo docs`. Patrones multi-palabra: entre comillas.
Fallback: mi-lsp -> rg -> Read. Tras cambios grandes de docs: `mi-lsp index --clean`.

| Comando | Cuando |
|---|---|
| `nav pack <tarea>` | Contexto multi-doc antes de planear |
| `nav ask <pregunta>` | Pregunta libre cruzando codigo + wiki |
| `nav route <tarea>` | Docs relevantes para una tarea |
| `nav search <ID>` | Buscar por ID exacto (RF-*, FL-*, RS-*, TECH-*) |
| `nav find <symbol>` | Localizar simbolo en un repo |
| `nav governance --workspace unazul --format toon` | Estado de gobierno (debe estar valid) |
| `nav wiki validate-harness/validate-source` | Validar artefactos de la wiki |

Validar alias: `mi-lsp workspace list` y `mi-lsp workspace status unazul --format toon`.

## Workflow Catalog

### A) Flujo estandar de tarea
1. `Skill(ps-contexto)` — cargar contexto.
2. Gate de gobierno: `mi-lsp nav governance --workspace unazul` (debe estar valid).
3. `Skill(brainstorming)` — cerrar decisiones de diseno (tareas no triviales).
4. TICKET-GATE: `Skill(pj-crear-tarjeta-unazul)` para crear/identificar el work item Azure.
5. Trabajar en rama feature desde `main` (un ticket = un scope = una rama); en cada commit: `Skill(unazul-commit-changelog)` para crear/actualizar `changelog/HU{hu-id}-{task-id}.md` y luego commit con `AB#<id>`.
6. `Skill(unazul-dejar-registro)` — registro en el work item.
7. `Skill(ps-trazabilidad)` — cierre y sync de la wiki.
8. `Skill(ps-auditar-trazabilidad)` — auditoria de cierre (sin Critical).
9. Pre-push: `Gp.Documentacion/infra/git/Invoke-PrePushGuard.ps1 -IssueKey AB-<id>` (debe dar Approved).
10. Integrar a `origin/main` y sanear worktrees/branches.

### B) Flujo grande / riesgoso / multi-modulo
Igual que A, mas: `session-contract.yaml` en `Gp.Documentacion/.docs/auditoria/<fecha>-<slug>/`, `using-git-worktrees` para aislar, `writing-plans` para el plan, y olas de subagentes donde haya ejes independientes.

### C) Cambio de politicas (AGENTS.md / CLAUDE.md)
`Skill(ae-crear-politicas)` (alias `ps-crear-agentsclaudemd`); actualizar AMBOS archivos con paridad; verificar sincronizacion antes de cerrar.

### D) Tarea trivial
Contexto exacto -> edicion directa -> verificacion acotada -> cierre con trazabilidad o no-op explicito.

## Capa AE (ciclo de desarrollo)

El ciclo estricto de Unazul vive en `Gp.Documentacion/.docs/wiki/ae/README.md` (fases Discovery -> Lock -> Execute -> Close) y sus modulos `AE-*`. `ae-programa` es el gateway por tarea. Leer la capa AE al inicio de cualquier trabajo agentico.

Ante dudas del equipo sobre como trabajar (flujo, ramas main-first, ticket-gate, ciclo, bootstrap), la explicacion completa esta en `Gp.Documentacion/propuesta-trabajo/PROPUESTA-TRABAJO-UNAZUL.md` (resumen en `Gp.Documentacion/propuesta-trabajo/PRESENTACION-PROPUESTA.md`). Usar ese documento para responder preguntas de proceso.

## Session Contract

Para tareas mutantes o no triviales, crear `Gp.Documentacion/.docs/auditoria/<YYYY-MM-DD>-<task-slug>/session-contract.yaml` con: `issue` (work item Azure `AB#<id>`, obligatorio, o waiver), `base_sha`, `branch`, `allowed_paths`/`forbidden_paths` (scope del ticket), `anchors` (RS/FL/RF tocados), `required_evidence`. `ps-trazabilidad`, `ps-auditar-trazabilidad` y el pre-push comparan el diff real contra este contrato. Ver `Gp.Documentacion/.docs/wiki/ae/AE-SESSION-CONTRACT.md`.

## Skill Invocation Semantics

| Skill | Cuando | Obligatoria |
|---|---|---|
| `ps-contexto` | Onboarding / contexto no trivial | Si (budget-gated) |
| `mi-lsp` | Exploracion de codigo y validacion de wiki | Si (preferida; fallback rg) |
| `brainstorming` | Despues de contexto, antes de implementar | Si (no trivial) |
| `pj-crear-tarjeta-unazul` | Crear/sincronizar work item Azure (TICKET-GATE) | Si |
| `unazul-dejar-registro` | Dejar registro en el work item | Si (trabajo governado) |
| `unazul-commit-changelog` | Antes de cada commit: crear/actualizar `changelog/HU{id}-{task}.md` | Si (por commit governado) |
| `using-git-worktrees` | Base sucia, tareas grandes/riesgosas | Budget-gated |
| `writing-plans` | Tareas grandes/riesgosas | Si (grandes) |
| `ps-trazabilidad` | Antes de cerrar cualquier tarea | Si |
| `ps-auditar-trazabilidad` | Antes de cerrar, despues de ps-trazabilidad | Si |
| pre-push (`Invoke-PrePushGuard.ps1`) | Antes de cualquier push a la rama destino | Si (gate final) |

## Subagent-Gate (duro — paralelizar por defecto)

Regla: **el hilo principal orquesta, NO explora ni lee en masa**. Delegar es el default; trabajar inline es la excepcion.

- **Obligatorio delegar** cuando la tarea tiene >=2 ejes independientes (archivos, repos o dimensiones distintas): abrir N subagentes en UN solo mensaje (multiples tool calls), nunca secuencial.
- **Unica excepcion (inline permitido sin subagente)**: turno conversacional, o edicion trivial de 1 archivo ya localizado. Todo lo demas => subagente.
- **Presupuesto de tokens (obligatorio)**: cada subagente devuelve un RESUMEN (<=200 palabras) con evidencia `file:line`, NUNCA dumps de archivos. Prompt atomico, scope 3-5 archivos, formato de respuesta fijado en el prompt.
- Lecturas/busquedas amplias => `Explore`/`ps-explorer`. Prohibido leer multiples repos desde el hilo principal.
- Si se trabaja inline pudiendo delegar (>=2 ejes), registrar `why_no_worker` en la persistencia de la tarea (sin independencia real, sin adapter, sin autorizacion, o todo en el critical path inmediato). Sin esa justificacion, es no conforme.
- El hilo principal cruza resumenes, verifica que los paths citados existen y decide; no delega el entendimiento.

## Subagent Routing

Los subagentes se distribuyen en `Gp.Documentacion/shared-agents/` y `bootstrap.ps1` los instala en `unazul/.claude/agents/`. Disponibles: `ps-explorer`, `ps-dotnet10`, `ps-next-vercel`, `ps-python`, `ps-code-reviewer`, `ps-docs`, `ps-worker`, `ps-gap-auditor`, `ps-sdd-sync-gen`, `gap-terminator`, y la familia QA (`ps-qa-business`, `ps-qa-code-review`, `ps-qa-security`, `ps-qa-testing`, `ps-qa-orchestrator`). `Explore` y `Plan` son built-in.

| Tarea | Subagente | Tipo |
|---|---|---|
| Explorar codigo, buscar simbolos | Explore / ps-explorer | read-only |
| Disenar plan de implementacion | Plan | read-only |
| Generar/modificar codigo .NET 10 | ps-dotnet10 | write |
| Generar/modificar codigo Next.js | ps-next-vercel | write |
| Code review, auditar calidad | ps-code-reviewer | read-only |
| Crear/actualizar docs y wiki | ps-docs | write |
| Git, config, shell, ops | ps-worker | write |

### Ejemplos de dispatch
- "Documentar un servicio": Explore ("estructura y endpoints de Sa.Ob.X en develop") + ps-docs ("escribir TECH-X siguiendo la plantilla de Gp.Documentacion/.docs/wiki/08_tech").
- "Implementar endpoint": Explore ("patron existente en el repo") + ps-dotnet10 ("crear Command+Handler") en paralelo.
- "Revisar antes de integrar": ps-code-reviewer ("revisar diff, foco performance/security") + Explore ("verificar tests").

## Canon — Fuente de verdad

| Documento | Ruta | Gobierna |
|---|---|---|
| Gobierno | `Gp.Documentacion/.docs/wiki/00_gobierno_documental.md` | Orden canonico, rama por repo, drift |
| Alcance | `Gp.Documentacion/.docs/wiki/01_alcance_funcional.md` | Objetivo, actores, areas, inventario |
| Resultados/RS | `Gp.Documentacion/.docs/wiki/02_resultados_soluciones_usuario.md` + `Gp.Documentacion/.docs/wiki/02_resultados/RS-*` | Promesas de usuario |
| Arquitectura | `Gp.Documentacion/.docs/wiki/03_arquitectura.md` | Arquitectura real, prioridad de decision |
| Flujos | `Gp.Documentacion/.docs/wiki/04_FL.md` + `Gp.Documentacion/.docs/wiki/04_FL/FL-*` | Flujos funcionales |
| Requerimientos | `Gp.Documentacion/.docs/wiki/05_RF.md` + `Gp.Documentacion/.docs/wiki/05_RF/RF-*` | RF atomicos |
| Datos | `Gp.Documentacion/.docs/wiki/06_modelo_datos.md` | Entidades, estados |
| Pruebas | `Gp.Documentacion/.docs/wiki/07_pruebas/` | Matriz de pruebas |
| Tecnica | `Gp.Documentacion/.docs/wiki/08_baseline_tecnica.md`, `Gp.Documentacion/.docs/wiki/09_modelo_fisico_datos.md`, `Gp.Documentacion/.docs/wiki/10_contratos_tecnicos.md` + `Gp.Documentacion/.docs/wiki/08_tech/`, `Gp.Documentacion/.docs/wiki/09_db/`, `Gp.Documentacion/.docs/wiki/10_contratos/` | Baseline, datos fisicos, contratos |
| Capa AE | `Gp.Documentacion/.docs/wiki/ae/README.md` | Ciclo de desarrollo |
| UX | `Gp.Documentacion/.docs/wiki/11_ux_roadmap_fase2.md` | UX (fase 2) |

## Prioridad de decision del proyecto

Seguridad-y-cumplimiento > Estabilidad > Performance > Mantenibilidad > Costo (dominio regulatorio financiero; ver `Gp.Documentacion/.docs/wiki/03_arquitectura.md`).

## Reglas adicionales

- No hardcodear secretos, API keys ni subscription keys; objetivo Azure Key Vault.
- Documentar contra el codigo en la rama `develop` de cada repo (objetivo main-first tras la migracion).
- Al cerrar una tarea, mantener la wiki (`Gp.Documentacion`) sincronizada con el cambio.
- Editar AGENTS.md o CLAUDE.md exige mantener ambos en paridad (`ae-crear-politicas`).
- No usar emojis en politicas ni en la wiki. Idioma de la wiki y politicas: espanol.
