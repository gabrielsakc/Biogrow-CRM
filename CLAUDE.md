# Biogrow Platform — CRM + ERP Multiempresa

Plataforma empresarial unificada para el Grupo Biogrow.
8 empresas operativas + 1 holding. Multi-tenant real. CRM + ERP + Holding Dashboard.

## Grupo Biogrow — Empresas (tenants)

| Slug | Nombre | Tipo |
|---|---|---|
| `holding` | Biogrow Group | Holding |
| `biogrow-fodder` | Biogrow Fodder | Agroindustria / Forrajes |
| `biogrow-feed` | BiogrowFeed | Alimentación animal |
| `biogrow-greens` | BiogrowGreens | Vegetales / Producción verde |
| `bg-data-builders` | BG Data Builders | Datos / Analytics / Tech |
| `biogrow-robotics` | Biogrow Robotics | Robótica / Automatización |
| `modular-loft` | Modular Loft USA | Construcción modular |
| `prime-blocks` | Prime Tech Blocks | Manufactura / Materiales |
| `cattle-grow` | CattleGrow | Ganadería / Agroindustria |
| `road-master-tech` | Road Master Tech | Infraestructura vial / Tecnología |

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 App Router, TypeScript strict |
| Estilos | Tailwind CSS 3, shadcn/ui primitivos |
| API | tRPC v11 (Fase 2+) |
| ORM | Prisma 5 + PostgreSQL 16 |
| Auth | Clerk |
| Permisos | RBAC custom (`packages/permissions`) |
| Server state | TanStack Query |
| Gráficos | ECharts (echarts-for-react) — Fase 2+ |
| Tablas | TanStack Table v8 — Fase 2+ |
| Forms | React Hook Form + Zod — Fase 2+ |
| Monorepo | Turborepo + pnpm workspaces |

## Packages

| Package | Propósito |
|---|---|
| `@biogrow/database` | Prisma schema, client, seed |
| `@biogrow/auth` | Clerk integration, session helpers, user sync |
| `@biogrow/permissions` | RBAC engine, permission constants, can() |
| `@biogrow/ui` | Componentes enterprise: Card, Badge, Button, Input, EmptyState, Skeleton |
| `@biogrow/shared-types` | Tipos TypeScript compartidos cross-package |

## Arquitectura Multi-Tenant

**Regla absoluta:** Toda tabla operativa tiene `company_id`. Sin excepción.

- El middleware de Next.js valida que el slug en la URL sea un tenant conocido.
- `lib/company.ts` → `resolveCompany(slug)` verifica membresía activa del usuario.
- Las queries Prisma SIEMPRE filtran por `companyId` en el WHERE.
- El Holding accede vía vistas/jobs agregados, NO por queries directas cross-tenant.

### Flujo de request

```
Request → Clerk (auth) → Middleware (slug validation)
  → Layout (resolveCompany → membresía + permisos)
  → Page (company context disponible)
  → tRPC query (company_id obligatorio en todos los routers)
```

## Permisos

Formato: `module.entity.action`

```typescript
import { Permissions } from "@biogrow/permissions";

Permissions.CRM_LEADS_CREATE     // "crm.leads.create"
Permissions.ERP_INVOICES_APPROVE // "erp.invoices.approve"
Permissions.HOLDING_REPORTS_VIEW // "holding.reports.view"
```

**Siempre** validar en el servidor (tRPC middleware / layout). Nunca confiar solo en guards de UI.

## Company Configs

Configuración estática por empresa en `apps/web/company-configs/`.

```typescript
import { getCompanyConfig, COMPANY_CONFIGS } from "@/company-configs";

const config = getCompanyConfig("biogrow-fodder");
// { slug, name, branding, settings, modules }
```

## Comandos

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Dev (todas las apps)
pnpm build                # Build producción
pnpm lint                 # Lint
pnpm db:push              # Aplicar schema Prisma (sin migración)
pnpm db:migrate           # Migración formal
pnpm db:studio            # Prisma Studio
pnpm db:seed              # Seed empresas, roles y permisos
```

## Estructura de archivos clave

```
apps/web/
├── app/
│   ├── (auth)/           ← Login, sign-up, select-company
│   └── (dashboard)/
│       ├── [company]/    ← Contexto por empresa
│       └── holding/      ← Dashboard consolidado del grupo
├── company-configs/      ← Config estática por empresa
├── lib/
│   ├── company.ts        ← resolveCompany(), getUserCompanies()
│   └── permissions.ts    ← hasPermission(), requirePermission()
└── middleware.ts          ← Auth + slug validation

packages/
├── database/             ← Prisma schema + client + seed
├── auth/                 ← Clerk + session + user sync
├── permissions/          ← RBAC engine + constants
├── ui/                   ← Componentes enterprise compartidos
└── shared-types/         ← Tipos TypeScript compartidos
```

## Reglas de desarrollo

- **TypeScript strict.** Sin `any`. Sin `@ts-ignore` sin justificación.
- **Lógica de negocio en packages**, nunca en componentes de página.
- **Componentes de página:** solo composición + hooks. Sin fetching directo en JSX.
- **Cada módulo CRM/ERP:** `types → service → router → ui` (capas separadas).
- **Schema Prisma:** nunca drop columns directamente. Usar migraciones non-destructive.
- **Permisos:** validar siempre en servidor. Guards de UI son solo UX, no seguridad.
- **company_id:** toda query operativa DEBE filtrarlo. Sin excepción.

## Módulos habilitados por empresa

| Empresa | CRM | ERP | Inventory | Purchasing | Production | Projects | Manufacturing | Assets | Analytics |
|---|---|---|---|---|---|---|---|---|---|
| Biogrow Fodder | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| BiogrowFeed | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| BiogrowGreens | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| BG Data Builders | ✓ | ✓ | — | — | — | ✓ | — | — | ✓ |
| Biogrow Robotics | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | — |
| Modular Loft USA | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| Prime Tech Blocks | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| CattleGrow | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Road Master Tech | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ | — |

## Fase actual

**Fase 1: Foundation + Auth — COMPLETADA**
Ver `tasks/todo.md` para el estado detallado del roadmap.
