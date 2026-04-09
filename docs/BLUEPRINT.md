# Biogrow Platform — Blueprint Técnico

**Versión:** 1.0 — Fase 1 Foundation
**Fecha:** 2026-03-28
**Arquitecto:** Claude (Sonnet 4.6)

---

## Visión del Sistema

Biogrow Platform es una plataforma SaaS B2B multi-tenant que unifica CRM + ERP para el Grupo Biogrow (8 empresas). Opera en dos niveles simultáneos:

- **Holding:** Visibilidad consolidada del grupo, KPIs agregados, reportes cross-company.
- **Empresa:** Operación autónoma con datos aislados, configuración propia y usuarios propios.

**Principio rector:** _"Compartir el motor, personalizar la cabina."_

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────┐
│                  HOLDING LAYER                      │
│   Dashboards · Cross-reports · Global KPIs          │
│   apps/web/app/(dashboard)/holding/                 │
└────────────────────┬────────────────────────────────┘
                     │  (vistas SQL agregadas — Fase 4)
┌────────────────────▼────────────────────────────────┐
│            COMPANY CONTEXT LAYER                    │
│   /[company]/* routes · Tenant isolation            │
│   lib/company.ts → resolveCompany()                 │
└──┬──────────────┬──────────────┬────────────────────┘
   │              │              │
┌──▼──────┐  ┌───▼──────┐  ┌───▼──────────────────┐
│  CRM    │  │  ERP     │  │  Admin / Platform     │
│  Core   │  │  Core    │  │  Core                 │
│ (Fase2) │  │ (Fase3)  │  │  (Fase 1 ✓)           │
└──┬──────┘  └───┬──────┘  └───┬────────────────────┘
   │              │              │
┌──▼──────────────▼──────────────▼──────────────────┐
│                SHARED PACKAGES                     │
│  @biogrow/auth · @biogrow/permissions              │
│  @biogrow/database · @biogrow/ui                   │
│  @biogrow/shared-types                             │
└────────────────────────────────────────────────────┘
```

---

## Modelo de Datos — Fase 1 (Foundation)

### Entidades implementadas

```
companies           → Tenants del grupo (holding + 8 empresas)
users               → Usuarios globales (vinculados a Clerk)
user_company_memberships → Acceso usuario ↔ empresa ↔ rol
roles               → Roles globales (sistema) y por empresa
permissions         → Permisos atómicos: module.entity.action
role_permissions    → Many-to-many rol ↔ permiso
audit_logs          → Registro inmutable de cambios
```

### Relaciones clave

```
User (1) ──── (N) UserCompanyMembership (N) ──── (1) Company
                          │
                          └── (1) Role (N) ──── (N) Permission
```

### Invariantes de datos

- Todo `User` tiene un `clerkId` único — sincronizado desde Clerk.
- Toda tabla operativa (Fase 2+) tendrá `company_id NOT NULL`.
- Los `AuditLog` son inmutables — sin UPDATE, sin DELETE.
- Los roles del sistema (`isSystem: true`) no pueden ser modificados por empresa.

---

## Modelo de Permisos (RBAC)

### Formato de permiso

```
module.entity.action

Ejemplos:
  crm.leads.create
  erp.invoices.approve
  holding.reports.view
  admin.users.manage
```

### Jerarquía de roles globales

```
SUPERADMIN     → Acceso total a todo
HOLDING_ADMIN  → Acceso total a todas las empresas
HOLDING_EXEC   → Solo lectura consolidada del holding
MEMBER         → Acceso solo a empresas asignadas (resuelve por membresía)
```

### Roles de empresa (system roles)

```
company:admin         → Acceso total a la empresa
company:sales_manager → Gestión del equipo comercial
company:sales_rep     → Pipeline y clientes propios
company:finance       → Módulos financieros y facturación
company:operations    → ERP operativo (inventario, compras)
company:viewer        → Solo lectura en todos los módulos
```

### Resolución de permisos

```typescript
// Pseudocódigo del engine (packages/permissions/src/engine.ts)
can(user, permission, companyId):
  1. SUPERADMIN → allow
  2. HOLDING_ADMIN → allow
  3. HOLDING_EXEC → allow solo holding.*.view
  4. Buscar membresía en companyId
  5. Verificar si permission ∈ role.permissions
  6. allow / deny
```

---

## Flujo de Request (Server Component)

```
1. GET /biogrow-fodder/crm/leads
2. middleware.ts → Clerk auth guard → valida slug en COMPANY_CONFIGS
3. app/(dashboard)/layout.tsx → resolveCompany("biogrow-fodder")
   └── verifica membresía activa del userId en esa company
4. app/(dashboard)/[company]/crm/leads/page.tsx
   └── hasPermission(permissions, Permissions.CRM_LEADS_VIEW) → gate
5. tRPC query: leadsRouter.list({ companyId }) → Prisma WHERE company_id = ?
6. Render con datos
```

---

## Estructura de Packages

### @biogrow/database
- Prisma schema (Foundation entities)
- `db` client singleton (safe para hot reload en dev)
- Seed: 8 empresas + sistema de permisos completo

### @biogrow/auth
- `getAuthContext(slug?)` — resuelve user + memberships desde DB
- `syncUser()` — upsert usuario desde Clerk en primer acceso
- `requireCompanyAccess(clerkId, slug)` — valida acceso

### @biogrow/permissions
- `Permissions` const object — todas las permission keys tipadas
- `resolveUserPermissions(userId)` — carga permisos desde DB
- `can(user, permission, companyId)` — check atómico
- `canAll()` / `canAny()` — checks combinados

### @biogrow/ui
- `Card`, `Button`, `Badge`, `Input`, `Separator`, `Skeleton`, `Avatar`
- `EmptyState`, `KPICardSkeleton`, `DashboardSkeleton`, `TableSkeleton`
- `ErrorBoundary`
- `lib/utils`: `cn()`, `formatCurrency()`, `formatDate()`, `getInitials()`

### @biogrow/shared-types
- `CompanyConfig`, `CompanySummary` — tipos de empresa
- `UserProfile`, `CompanyMembership` — tipos de usuario
- `ApiResponse`, `PaginationMeta`, `KPIDelta` — tipos comunes

---

## Company Configs (Static)

Cada empresa tiene un archivo TypeScript en `apps/web/company-configs/`:

```typescript
export const BIOGROW_FODDER: CompanyConfig = {
  slug: "biogrow-fodder",
  name: "Biogrow Fodder",
  type: "COMPANY",
  branding: { primaryColor: "#059669" },
  settings: { timezone: "America/New_York", currency: "USD" },
  modules: ["crm", "erp", "inventory", "purchasing", "production"],
};
```

Usados para:
- Validación de slugs en middleware
- Branding dinámico en UI
- Sidebar navigation (mostrar/ocultar módulos)
- Seed de datos base

---

## Estrategia de Consolidación (Holding)

### Fase 1–3 (actual)
- Vistas SQL con UNION ALL filtradas por empresa.
- KPIs calculados on-demand al cargar el holding dashboard.
- Aceptable para < 10 empresas y volumen bajo.

### Fase 4+
- Jobs nocturnos (BullMQ) populan tablas `holding_*` desnormalizadas.
- El holding dashboard lee de tablas pre-agregadas (near-real-time con timestamp).
- Las vistas on-demand se mantienen para drill-down.

---

## Decisiones Técnicas

| Decisión | Alternativas descartadas | Razón |
|---|---|---|
| Next.js 14 App Router | Pages Router, Remix | RSC para KPIs server-side, streaming |
| Prisma | Drizzle, TypeORM | Madurez, migraciones automáticas, DX |
| tRPC (Fase 2) | REST, GraphQL | Type-safety end-to-end sin codegen |
| ECharts | Recharts, Victory | Gráficos enterprise complejos, performance |
| Custom RBAC | Casbin, Permit.io | Control total, sin dependencias externas |
| App unificada `/[company]` | 9 apps separadas | 1 codebase, deployment simple, mantenible |
| Clerk | NextAuth, Auth.js | MFA, user management UI, webhooks |

---

## Roadmap por Fases

| Fase | Objetivo | Estado |
|---|---|---|
| **Fase 1** | Foundation: monorepo, auth, multi-tenant, packages core | ✅ Completada |
| **Fase 2** | CRM Core: leads, pipeline, forecast, dashboard comercial | 🔜 Siguiente |
| **Fase 3** | ERP Core: productos, inventario, órdenes, facturación, AR/AP | ⏳ Pendiente |
| **Fase 4** | Holding Dashboards + consolidación cross-company | ⏳ Pendiente |
| **Fase 5** | Automatizaciones, integraciones, módulos especializados, hardening | ⏳ Pendiente |

---

## Consideraciones de Seguridad

1. **Auth:** Clerk maneja sesiones, MFA y tokens. No almacenamos contraseñas.
2. **Multi-tenant isolation:** `company_id` en toda tabla operativa. Validado en tRPC middleware.
3. **Permissions:** Doble validación: layout server-side + tRPC router. UI guards son solo UX.
4. **Audit:** Todo cambio se registra en `audit_logs` con snapshot before/after.
5. **OWASP:** Sin interpolación de strings en SQL (Prisma ORM). Headers seguros vía Next.js.
6. **Secretos:** Variables de entorno. Nunca en código fuente.
