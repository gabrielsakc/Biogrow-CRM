# Biogrow Platform — Project Status

**Última actualización:** 2026-03-28
**Fase actual:** Fase 1 — Foundation + Auth ✅

---

## Estado General

| Fase | Nombre | Estado | Progreso |
|---|---|---|---|
| 1 | Foundation + Auth | ✅ Completada | 100% |
| 2 | CRM Core | 🔜 Siguiente | 0% |
| 3 | ERP Core | ⏳ Pendiente | 0% |
| 4 | Holding Dashboards | ⏳ Pendiente | 0% |
| 5 | Automatizaciones & Hardening | ⏳ Pendiente | 0% |

---

## Fase 1 — Completada ✅

### Infraestructura
- [x] Monorepo Turborepo + pnpm workspaces
- [x] Next.js 14 App Router configurado
- [x] TypeScript strict en todos los packages
- [x] Tailwind CSS + shadcn/ui base

### Multi-tenant
- [x] Routing dinámico `/[company]/*`
- [x] Middleware de validación de slugs
- [x] Company configs estáticas (8 empresas + holding)
- [x] `lib/company.ts` — resolveCompany() con verificación de membresía

### Auth
- [x] Clerk integrado (sign-in, sign-up, onboarding)
- [x] `@biogrow/auth` — getAuthContext(), syncUser(), requireCompanyAccess()
- [x] Select-company page con redirect inteligente

### Base de datos
- [x] `@biogrow/database` — Prisma schema Foundation
  - [x] `companies` (holding + 8 empresas)
  - [x] `users` (vinculados a Clerk)
  - [x] `user_company_memberships`
  - [x] `roles` (globales + por empresa)
  - [x] `permissions` (module.entity.action)
  - [x] `role_permissions`
  - [x] `audit_logs`
- [x] Seed completo: 8 empresas, 60+ permisos, 6 roles sistema

### Permisos
- [x] `@biogrow/permissions` — RBAC engine
  - [x] `Permissions` constants (60+ permission keys)
  - [x] `can()`, `canAll()`, `canAny()`
  - [x] `resolveUserPermissions()`
- [x] `lib/permissions.ts` — helpers para Server Components

### UI Base
- [x] `@biogrow/ui` — componentes enterprise
  - [x] Card, Button, Badge, Input, Separator, Skeleton, Avatar
  - [x] EmptyState, DashboardSkeleton, TableSkeleton, ErrorBoundary
  - [x] `lib/utils`: cn(), formatCurrency(), formatDate(), getInitials()
- [x] `@biogrow/shared-types` — tipos compartidos

### Páginas base
- [x] Layout shell: Sidebar + Header + main
- [x] Dashboard placeholder por empresa
- [x] Holding dashboard (estructura + companies grid)

### Documentación
- [x] `CLAUDE.md` — guía completa del proyecto
- [x] `docs/BLUEPRINT.md` — arquitectura técnica
- [x] `docs/PROJECT_STATUS.md` — este archivo
- [x] `tasks/todo.md` — roadmap detallado

---

## Fase 2 — CRM Core 🔜

### Schema Prisma (por agregar)
- [ ] Lead, LeadSource, LeadStatus
- [ ] Account, AccountType, Industry
- [ ] Contact, ContactRole
- [ ] Opportunity, PipelineStage
- [ ] Activity (Call, Email, Meeting, Note)
- [ ] Task, TaskStatus
- [ ] Quote, QuoteLineItem

### tRPC Routers (por crear)
- [ ] `packages/crm-core` package scaffold
- [ ] leads router
- [ ] accounts router
- [ ] contacts router
- [ ] opportunities router
- [ ] activities router
- [ ] tasks router
- [ ] quotes router
- [ ] pipeline router
- [ ] forecast router

### UI CRM (por crear)
- [ ] `/[company]/crm/leads` — list + detail + conversion
- [ ] `/[company]/crm/accounts` — list + detail + timeline
- [ ] `/[company]/crm/contacts` — list + detail
- [ ] `/[company]/crm/pipeline` — Kanban + list view
- [ ] `/[company]/crm/opportunities` — detail + activities
- [ ] `/[company]/crm/activities` — feed
- [ ] `/[company]/crm/tasks` — list
- [ ] `/[company]/crm/quotes` — list + quote builder
- [ ] `/[company]/crm/forecast` — best case / commit / closed / weighted

### Dashboard CRM (por crear)
- [ ] KPI cards: leads, pipeline, revenue, conversion rate
- [ ] Pipeline funnel chart (ECharts)
- [ ] Pipeline by stage (bar chart)
- [ ] Revenue trend (line chart)
- [ ] Rep performance table
- [ ] Recent activities feed
- [ ] Forecast view: monthly/quarterly

---

## Fase 3 — ERP Core ⏳

_(Pendiente inicio de Fase 2)_

- [ ] Products / catalog
- [ ] Vendors / suppliers
- [ ] Warehouses + inventory
- [ ] Sales orders (desde cotización)
- [ ] Purchase orders + approval
- [ ] Invoicing
- [ ] AR / AP
- [ ] Treasury / cash flow

---

## Fase 4 — Holding Dashboards ⏳

_(Pendiente inicio de Fase 3)_

- [ ] Holding aggregation jobs (BullMQ)
- [ ] `holding_*` tablas materializadas
- [ ] Dashboard ejecutivo consolidado
- [ ] Cross-company revenue / pipeline charts
- [ ] Comparative by company
- [ ] Cash flow consolidado
- [ ] Exportación PDF / Excel

---

## Fase 5 — Automatizaciones & Hardening ⏳

_(Pendiente inicio de Fase 4)_

- [ ] `packages/workflows` — motor de automatizaciones
- [ ] `packages/notifications` — in-app + email
- [ ] `packages/documents` — file storage
- [ ] `packages/integrations` — webhooks, email sync
- [ ] Módulos especializados por empresa
- [ ] Test coverage
- [ ] CI/CD pipeline
- [ ] Security audit

---

## Decisiones Pendientes

| Decisión | Opciones | Deadline |
|---|---|---|
| ORM Fase 4+ | Mantener Prisma vs migrar a Drizzle | Inicio Fase 4 |
| Object storage | AWS S3 vs Supabase Storage vs Cloudflare R2 | Inicio Fase 5 |
| Email transaccional | Resend vs Postmark vs SendGrid | Inicio Fase 5 |
| Deploy | Vercel + Railway vs full Railway vs self-hosted | Inicio Fase 2 |

---

## Dependencias Externas (sin configurar)

| Servicio | Variables necesarias | Estado |
|---|---|---|
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ⚠️ Requiere cuenta |
| PostgreSQL | `DATABASE_URL` | ⚠️ Requiere instancia |
| Redis | `REDIS_URL` | ⏳ Fase 2+ (BullMQ) |
