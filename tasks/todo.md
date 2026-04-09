# Biogrow Platform — Task Board

**Última actualización:** 2026-03-28
**Metodología:** Fases secuenciales. No empezar Fase N+1 sin completar Fase N.

---

## ✅ FASE 1 — Foundation + Auth (COMPLETADA)

### Monorepo & Config
- [x] Turborepo + pnpm workspaces setup
- [x] Next.js 14 App Router
- [x] TypeScript strict en root + todos los packages
- [x] Tailwind CSS + postcss

### Packages creados
- [x] `@biogrow/database` — Prisma schema, client, seed
- [x] `@biogrow/auth` — Clerk integration, getAuthContext, syncUser
- [x] `@biogrow/permissions` — RBAC engine, constants, can()
- [x] `@biogrow/ui` — Card, Button, Badge, Input, Skeleton, EmptyState, ErrorBoundary
- [x] `@biogrow/shared-types` — Company, User, Common types

### Multi-tenant
- [x] Middleware con validación de slugs
- [x] Company configs estáticas (9 archivos: holding + 8 empresas)
- [x] lib/company.ts — resolveCompany()
- [x] lib/permissions.ts — hasPermission(), requirePermission()

### Base de datos (schema)
- [x] Model: Company (con hierarchy parent/children)
- [x] Model: User (con GlobalRole)
- [x] Model: UserCompanyMembership
- [x] Model: Role + Permission + RolePermission
- [x] Model: AuditLog
- [x] Seed: 8 empresas + holding
- [x] Seed: 60+ permisos CRM + ERP + Holding + Admin
- [x] Seed: 6 roles sistema con permisos asignados

### UI & Páginas
- [x] Layout shell: Sidebar + Header
- [x] Auth pages: sign-in, sign-up, select-company
- [x] Dashboard placeholder por empresa
- [x] Holding dashboard: companies grid + KPI placeholders

### Documentación
- [x] CLAUDE.md — guía completa del proyecto
- [x] docs/BLUEPRINT.md — arquitectura técnica
- [x] docs/PROJECT_STATUS.md — estado del proyecto
- [x] tasks/todo.md — este archivo

---

## 🔜 FASE 2 — CRM Core (PRÓXIMA)

### Pre-requisitos
- [ ] ⚠️ Configurar Clerk (keys en .env)
- [ ] ⚠️ Configurar PostgreSQL (DATABASE_URL en .env)
- [ ] ⚠️ Ejecutar `pnpm db:push` + `pnpm db:seed`

### Schema Prisma — CRM entities
- [ ] Model: PipelineStage (company_id, name, order, probability, is_won, is_lost)
- [ ] Model: Lead (company_id, owner_id, source, status, score, conversion fields)
- [ ] Model: Account (company_id, owner_id, name, industry, type, health_score)
- [ ] Model: Contact (company_id, account_id, owner_id, is_primary)
- [ ] Model: Opportunity (company_id, account_id, stage_id, amount, forecast_category)
- [ ] Model: Activity (company_id, entity polymorphic, type: call/email/meeting/note)
- [ ] Model: Task (company_id, entity polymorphic, due_date, status, priority)
- [ ] Model: Quote + QuoteLineItem
- [ ] Migration: `pnpm db:migrate --name=crm-core`

### Package: @biogrow/crm-core
- [ ] Crear package scaffold (package.json, tsconfig)
- [ ] types/lead.ts
- [ ] types/account.ts
- [ ] types/contact.ts
- [ ] types/opportunity.ts
- [ ] types/activity.ts
- [ ] types/pipeline.ts
- [ ] types/forecast.ts
- [ ] services/lead-service.ts (create, list, convert, assign)
- [ ] services/account-service.ts
- [ ] services/contact-service.ts
- [ ] services/opportunity-service.ts (close_won, close_lost)
- [ ] services/pipeline-service.ts (move stage, reorder)
- [ ] services/forecast-service.ts (best_case, commit, closed, weighted)

### tRPC Setup
- [ ] Instalar tRPC v11 en web app
- [ ] Crear `apps/web/server/trpc.ts` — router base con auth middleware
- [ ] Crear `apps/web/server/routers/` — barrel
- [ ] Router: leads
- [ ] Router: accounts
- [ ] Router: contacts
- [ ] Router: opportunities
- [ ] Router: activities
- [ ] Router: tasks
- [ ] Router: quotes
- [ ] Router: pipeline
- [ ] Router: forecast
- [ ] TanStack Query provider en layout
- [ ] tRPC client config

### UI — CRM Leads
- [ ] `/[company]/crm/leads` — list con filtros (status, owner, source)
- [ ] `/[company]/crm/leads/[id]` — detail + timeline + tasks
- [ ] Lead form (create + edit) con RHF + Zod
- [ ] Lead convert modal (→ Account + Contact + Opportunity)
- [ ] Empty state para leads vacíos

### UI — CRM Accounts
- [ ] `/[company]/crm/accounts` — list con health score
- [ ] `/[company]/crm/accounts/[id]` — detail + contacts + opportunities + timeline
- [ ] Account form

### UI — CRM Contacts
- [ ] `/[company]/crm/contacts` — list
- [ ] `/[company]/crm/contacts/[id]` — detail + linked account + activities

### UI — CRM Pipeline
- [ ] `/[company]/crm/pipeline` — Kanban view por stage
- [ ] Pipeline list view (toggle kanban/list)
- [ ] Pipeline stage configurator (admin only)
- [ ] Drag & drop entre stages (dnd-kit)

### UI — CRM Opportunities
- [ ] `/[company]/crm/opportunities` — list con filtros
- [ ] `/[company]/crm/opportunities/[id]` — detail + activities + quotes
- [ ] Close won / close lost modal

### UI — CRM Activities & Tasks
- [ ] `/[company]/crm/activities` — feed cronológico
- [ ] Activity log form (call, email, meeting, note)
- [ ] `/[company]/crm/tasks` — list con due dates

### UI — CRM Quotes
- [ ] `/[company]/crm/quotes` — list
- [ ] Quote builder con line items
- [ ] Quote status flow: draft → sent → accepted/rejected

### Dashboard CRM
- [ ] KPI cards: new leads, pipeline value, quota attainment, won this month
- [ ] Pipeline funnel chart (ECharts Funnel)
- [ ] Pipeline by stage bar chart (ECharts Bar)
- [ ] Monthly revenue trend (ECharts Line)
- [ ] Rep performance table (TanStack Table)
- [ ] Conversion rate by source
- [ ] Recent activities feed

### Forecast
- [ ] `/[company]/crm/forecast` — best case / commit / closed / weighted
- [ ] Monthly + quarterly views
- [ ] Forecast by rep

---

## ⏳ FASE 3 — ERP Core

_(Definir en detalle al iniciar Fase 3)_

### Schema
- [ ] Product, PriceList, PriceListItem
- [ ] Vendor
- [ ] Warehouse, StockItem, InventoryMovement
- [ ] SalesOrder, SalesOrderLineItem
- [ ] PurchaseOrder, PurchaseOrderLineItem
- [ ] Invoice, InvoiceLineItem
- [ ] ARLedger, APLedger
- [ ] CashFlowEntry

### Módulos UI
- [ ] Catálogo de productos
- [ ] Gestión de proveedores
- [ ] Almacenes + inventario
- [ ] Órdenes de venta (desde cotización CRM)
- [ ] Órdenes de compra + flujo de aprobación
- [ ] Facturación
- [ ] Cuentas por cobrar / AR aging
- [ ] Cuentas por pagar
- [ ] Treasury / cash flow

---

## ⏳ FASE 4 — Holding Dashboards

_(Definir en detalle al iniciar Fase 4)_

- [ ] Tablas `holding_*` para agregación
- [ ] BullMQ jobs para consolidación
- [ ] Dashboard ejecutivo multi-empresa
- [ ] Cross-company revenue / pipeline
- [ ] Comparativo financiero por empresa
- [ ] Exportación PDF / Excel

---

## ⏳ FASE 5 — Automatizaciones & Hardening

_(Definir en detalle al iniciar Fase 5)_

- [ ] Workflows engine
- [ ] Notifications (in-app + email)
- [ ] Document storage
- [ ] External integrations
- [ ] Módulos especializados por empresa
- [ ] Test coverage (Vitest)
- [ ] CI/CD (GitHub Actions)
- [ ] Security audit
