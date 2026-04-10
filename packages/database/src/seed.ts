/**
 * Biogrow Platform — Database Seed
 * Seeds the 8 companies of the Biogrow Group and system roles/permissions.
 *
 * Run: pnpm db:seed (from packages/database)
 */

import { db } from "./client";
import type { Prisma } from "@prisma/client";

// ─── Companies ────────────────────────────────────────────────────────────────

const COMPANIES: Prisma.CompanyCreateInput[] = [
  {
    slug: "holding",
    name: "Biogrow Group (Holding)",
    type: "HOLDING",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#059669",
    modulesEnabled: ["crm", "erp", "analytics", "holding"],
  },
  {
    slug: "biogrow-fodder",
    name: "Biogrow Fodder",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#059669",
    modulesEnabled: ["crm", "erp", "inventory", "purchasing", "production"],
  },
  {
    slug: "biogrow-feed",
    name: "BiogrowFeed",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#0891b2",
    modulesEnabled: ["crm", "erp", "inventory", "purchasing", "production"],
  },
  {
    slug: "biogrow-greens",
    name: "BiogrowGreens",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#16a34a",
    modulesEnabled: ["crm", "erp", "inventory", "purchasing"],
  },
  {
    slug: "bg-data-builders",
    name: "BG Data Builders",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#7c3aed",
    modulesEnabled: ["crm", "erp", "projects", "analytics"],
  },
  {
    slug: "biogrow-robotics",
    name: "Biogrow Robotics",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#dc2626",
    modulesEnabled: ["crm", "erp", "projects", "assets", "manufacturing"],
  },
  {
    slug: "modular-loft",
    name: "Modular Loft USA",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#ea580c",
    modulesEnabled: ["crm", "erp", "inventory", "manufacturing", "projects"],
  },
  {
    slug: "prime-blocks",
    name: "Prime Tech Blocks",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#0284c7",
    modulesEnabled: ["crm", "erp", "inventory", "manufacturing", "projects"],
  },
  {
    slug: "cattle-grow",
    name: "CattleGrow",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#92400e",
    modulesEnabled: ["crm", "erp", "inventory", "purchasing", "production"],
  },
  {
    slug: "road-master-tech",
    name: "Road Master Tech",
    type: "COMPANY",
    timezone: "America/New_York",
    currency: "USD",
    primaryColor: "#374151",
    modulesEnabled: ["crm", "erp", "projects", "assets", "manufacturing"],
  },
];

// ─── System Roles ─────────────────────────────────────────────────────────────

const SYSTEM_ROLES = [
  { name: "company:admin", description: "Company administrator — full access to the company", isSystem: true },
  { name: "company:sales_manager", description: "Sales manager — manages sales team", isSystem: true },
  { name: "company:sales_rep", description: "Sales representative — manages own pipeline", isSystem: true },
  { name: "company:finance", description: "Finance — access to financial modules and ERP", isSystem: true },
  { name: "company:operations", description: "Operations — access to operational ERP", isSystem: true },
  { name: "company:viewer", description: "Viewer — read-only access to all modules", isSystem: true },
];

// ─── Permissions ──────────────────────────────────────────────────────────────

const PERMISSIONS: Prisma.PermissionCreateInput[] = [
  // CRM — Leads
  { key: "crm.leads.view", module: "crm", entity: "leads", action: "view", description: "View leads" },
  { key: "crm.leads.create", module: "crm", entity: "leads", action: "create", description: "Create leads" },
  { key: "crm.leads.edit", module: "crm", entity: "leads", action: "edit", description: "Edit leads" },
  { key: "crm.leads.delete", module: "crm", entity: "leads", action: "delete", description: "Delete leads" },
  { key: "crm.leads.assign", module: "crm", entity: "leads", action: "assign", description: "Assign leads" },
  { key: "crm.leads.convert", module: "crm", entity: "leads", action: "convert", description: "Convert leads" },
  // CRM — Accounts
  { key: "crm.accounts.view", module: "crm", entity: "accounts", action: "view", description: "View accounts" },
  { key: "crm.accounts.create", module: "crm", entity: "accounts", action: "create", description: "Create accounts" },
  { key: "crm.accounts.edit", module: "crm", entity: "accounts", action: "edit", description: "Edit accounts" },
  { key: "crm.accounts.delete", module: "crm", entity: "accounts", action: "delete", description: "Delete accounts" },
  // CRM — Contacts
  { key: "crm.contacts.view", module: "crm", entity: "contacts", action: "view", description: "View contacts" },
  { key: "crm.contacts.create", module: "crm", entity: "contacts", action: "create", description: "Create contacts" },
  { key: "crm.contacts.edit", module: "crm", entity: "contacts", action: "edit", description: "Edit contacts" },
  { key: "crm.contacts.delete", module: "crm", entity: "contacts", action: "delete", description: "Delete contacts" },
  // CRM — Opportunities
  { key: "crm.opportunities.view", module: "crm", entity: "opportunities", action: "view", description: "View opportunities" },
  { key: "crm.opportunities.create", module: "crm", entity: "opportunities", action: "create", description: "Create opportunities" },
  { key: "crm.opportunities.edit", module: "crm", entity: "opportunities", action: "edit", description: "Edit opportunities" },
  { key: "crm.opportunities.delete", module: "crm", entity: "opportunities", action: "delete", description: "Delete opportunities" },
  { key: "crm.opportunities.close_won", module: "crm", entity: "opportunities", action: "close_won", description: "Mark opportunity as won" },
  { key: "crm.opportunities.close_lost", module: "crm", entity: "opportunities", action: "close_lost", description: "Mark opportunity as lost" },
  // CRM — Activities
  { key: "crm.activities.view", module: "crm", entity: "activities", action: "view", description: "View activities" },
  { key: "crm.activities.create", module: "crm", entity: "activities", action: "create", description: "Create activities" },
  { key: "crm.activities.edit", module: "crm", entity: "activities", action: "edit", description: "Edit activities" },
  // CRM — Pipeline
  { key: "crm.pipeline.view", module: "crm", entity: "pipeline", action: "view", description: "View pipeline" },
  { key: "crm.pipeline.configure", module: "crm", entity: "pipeline", action: "configure", description: "Configure pipeline stages" },
  // CRM — Forecast
  { key: "crm.forecast.view", module: "crm", entity: "forecast", action: "view", description: "View forecast" },
  { key: "crm.forecast.edit", module: "crm", entity: "forecast", action: "edit", description: "Edit forecast" },
  // CRM — Quotations
  { key: "crm.quotes.view", module: "crm", entity: "quotes", action: "view", description: "View quotes" },
  { key: "crm.quotes.create", module: "crm", entity: "quotes", action: "create", description: "Create quotes" },
  { key: "crm.quotes.edit", module: "crm", entity: "quotes", action: "edit", description: "Edit quotes" },
  { key: "crm.quotes.approve", module: "crm", entity: "quotes", action: "approve", description: "Approve quotes" },
  { key: "crm.quotes.send", module: "crm", entity: "quotes", action: "send", description: "Send quotes" },
  // ERP — Products
  { key: "erp.products.view", module: "erp", entity: "products", action: "view", description: "View products" },
  { key: "erp.products.create", module: "erp", entity: "products", action: "create", description: "Create products" },
  { key: "erp.products.edit", module: "erp", entity: "products", action: "edit", description: "Edit products" },
  { key: "erp.products.delete", module: "erp", entity: "products", action: "delete", description: "Delete products" },
  // ERP — Inventory
  { key: "erp.inventory.view", module: "erp", entity: "inventory", action: "view", description: "View inventory" },
  { key: "erp.inventory.adjust", module: "erp", entity: "inventory", action: "adjust", description: "Adjust inventory" },
  // ERP — Purchase Orders
  { key: "erp.purchase_orders.view", module: "erp", entity: "purchase_orders", action: "view", description: "View purchase orders" },
  { key: "erp.purchase_orders.create", module: "erp", entity: "purchase_orders", action: "create", description: "Create purchase orders" },
  { key: "erp.purchase_orders.approve", module: "erp", entity: "purchase_orders", action: "approve", description: "Approve purchase orders" },
  // ERP — Sales Orders
  { key: "erp.sales_orders.view", module: "erp", entity: "sales_orders", action: "view", description: "View sales orders" },
  { key: "erp.sales_orders.create", module: "erp", entity: "sales_orders", action: "create", description: "Create sales orders" },
  { key: "erp.sales_orders.edit", module: "erp", entity: "sales_orders", action: "edit", description: "Edit sales orders" },
  // ERP — Invoices
  { key: "erp.invoices.view", module: "erp", entity: "invoices", action: "view", description: "View invoices" },
  { key: "erp.invoices.create", module: "erp", entity: "invoices", action: "create", description: "Create invoices" },
  { key: "erp.invoices.approve", module: "erp", entity: "invoices", action: "approve", description: "Approve invoices" },
  { key: "erp.invoices.void", module: "erp", entity: "invoices", action: "void", description: "Void invoices" },
  // ERP — AR/AP
  { key: "erp.receivables.view", module: "erp", entity: "receivables", action: "view", description: "View accounts receivable" },
  { key: "erp.payables.view", module: "erp", entity: "payables", action: "view", description: "View accounts payable" },
  { key: "erp.treasury.view", module: "erp", entity: "treasury", action: "view", description: "View treasury" },
  // Holding
  { key: "holding.dashboard.view", module: "holding", entity: "dashboard", action: "view", description: "View consolidated group dashboard" },
  { key: "holding.reports.view", module: "holding", entity: "reports", action: "view", description: "View cross-company reports" },
  { key: "holding.financials.view", module: "holding", entity: "financials", action: "view", description: "View consolidated financials" },
  // Admin
  { key: "admin.users.view", module: "admin", entity: "users", action: "view", description: "View users" },
  { key: "admin.users.manage", module: "admin", entity: "users", action: "manage", description: "Manage users" },
  { key: "admin.roles.manage", module: "admin", entity: "roles", action: "manage", description: "Manage roles" },
  { key: "admin.company.configure", module: "admin", entity: "company", action: "configure", description: "Configure company" },
  { key: "admin.audit.view", module: "admin", entity: "audit", action: "view", description: "View audit log" },
];

// ─── Test Users ────────────────────────────────────────────────────────────────

const TEST_USERS: { email: string; name: string; globalRole: "SUPERADMIN" | "HOLDING_ADMIN" | "MEMBER"; companySlug: string; roleName: string }[] = [
  // Prime Tech Blocks
  { email: "carlos.mendez@primeblocks.com", name: "Carlos Mendez", globalRole: "MEMBER", companySlug: "prime-blocks", roleName: "company:admin" },
  { email: "ana.torres@primeblocks.com", name: "Ana Torres", globalRole: "MEMBER", companySlug: "prime-blocks", roleName: "company:sales_manager" },
  { email: "miguel.rodriguez@primeblocks.com", name: "Miguel Rodriguez", globalRole: "MEMBER", companySlug: "prime-blocks", roleName: "company:sales_rep" },
  { email: "lucia.garcia@primeblocks.com", name: "Lucia Garcia", globalRole: "MEMBER", companySlug: "prime-blocks", roleName: "company:sales_rep" },
];

// ─── Accounts for Prime Tech Blocks ─────────────────────────────────────────────

const PRIME_BLOCKS_ACCOUNTS: {
  name: string;
  type: "PROSPECT" | "CUSTOMER" | "PARTNER" | "VENDOR" | "CHURNED";
  industry: string;
  website?: string;
  phone?: string;
  email?: string;
  annualRevenue?: number;
  employeeCount?: number;
  healthScore: number;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}[] = [
  // CUSTOMERS
  {
    name: "Construcciones Metropolitanas S.A.",
    type: "CUSTOMER",
    industry: "Construction",
    website: "https://construccionesmetropolitanas.com",
    phone: "+1 (305) 555-0101",
    email: "compras@construccionesmetropolitanas.com",
    annualRevenue: 50000000,
    employeeCount: 320,
    healthScore: 92,
    description: "Empresa líder en construcción residencial y comercial en el sur de Florida. Cliente desde 2019.",
    street: "1200 Brickell Ave, Suite 500",
    city: "Miami",
    state: "FL",
    country: "USA",
    zip: "33131",
  },
  {
    name: "Edificaciones del Norte Inc.",
    type: "CUSTOMER",
    industry: "Construction",
    website: "https://edificacionesdelnorte.com",
    phone: "+1 (786) 555-0202",
    email: "proyectos@edificacionesdelnorte.com",
    annualRevenue: 28000000,
    employeeCount: 150,
    healthScore: 85,
    description: "Especialistas en edificaciones industriales y comerciales. Compra regular de bloques modulares.",
    street: "4500 NW 36th St",
    city: "Miami Springs",
    state: "FL",
    country: "USA",
    zip: "33166",
  },
  {
    name: "Inmobiliaria Caribe Group",
    type: "CUSTOMER",
    industry: "Real Estate",
    website: "https://inmobiliariacaribe.com",
    phone: "+1 (305) 555-0303",
    email: "desarrollo@inmobiliariacaribe.com",
    annualRevenue: 75000000,
    employeeCount: 200,
    healthScore: 78,
    description: "Desarrollador inmobiliario con proyectos en Miami, Orlando y Tampa. Cliente premium.",
    street: "800 Douglas Rd, Suite 1200",
    city: "Coral Gables",
    state: "FL",
    country: "USA",
    zip: "33134",
  },
  {
    name: "Urbanizadora Panamá S.A.",
    type: "CUSTOMER",
    industry: "Construction",
    website: "https://urbanizadorapanama.com",
    phone: "+507 200-0100",
    email: "ventas@urbanizadorapanama.com",
    annualRevenue: 35000000,
    employeeCount: 180,
    healthScore: 88,
    description: "Empresa panameña de urbanización. Proyectos residenciales de gran escala.",
    street: "Av. Balboa, Torre Global Bank, Piso 20",
    city: "Panamá",
    state: "Panamá",
    country: "Panama",
    zip: "0816",
  },
  // PROSPECTS
  {
    name: "Constructora del Valle LLC",
    type: "PROSPECT",
    industry: "Construction",
    website: "https://constructoradelvalle.com",
    phone: "+1 (407) 555-0404",
    email: "info@constructoradelvalle.com",
    annualRevenue: 15000000,
    employeeCount: 85,
    healthScore: 45,
    description: "Constructora emergente en Orlando. Potencial cliente para expansión en Florida Central.",
    street: "2500 Sand Lake Rd",
    city: "Orlando",
    state: "FL",
    country: "USA",
    zip: "32809",
  },
  {
    name: "Desarrollos Habitacionales MX",
    type: "PROSPECT",
    industry: "Construction",
    website: "https://desarrolloshabitacionales.mx",
    phone: "+52 55 1234-5678",
    email: "comercial@desarrolloshabitacionales.mx",
    annualRevenue: 22000000,
    employeeCount: 120,
    healthScore: 50,
    description: "Interesados en bloques modulares para proyectos de vivienda interestatal en México.",
    street: "Av. Paseo de la Reforma 505, Piso 30",
    city: "Ciudad de México",
    state: "CDMX",
    country: "Mexico",
    zip: "06500",
  },
  {
    name: "Eco Sustainable Homes",
    type: "PROSPECT",
    industry: "Construction",
    website: "https://ecosustainablehomes.com",
    phone: "+1 (512) 555-0505",
    email: "sales@ecosustainablehomes.com",
    annualRevenue: 8000000,
    employeeCount: 45,
    healthScore: 55,
    description: "Empresa enfocada en construcciones sostenibles. Interés en nuestros bloques ecológicos.",
    street: "400 W 15th St",
    city: "Austin",
    state: "TX",
    country: "USA",
    zip: "78701",
  },
  // PARTNERS
  {
    name: "Arcillas Premium Internacional",
    type: "PARTNER",
    industry: "Mining & Materials",
    website: "https://arcillaspremium.com",
    phone: "+34 91 555 0606",
    email: "partners@arcillaspremium.com",
    annualRevenue: 120000000,
    employeeCount: 500,
    healthScore: 95,
    description: "Proveedor estratégico de arcillas de alta calidad. Alianza desde 2018.",
    street: "Calle Serrano 100",
    city: "Madrid",
    state: "Madrid",
    country: "Spain",
    zip: "28006",
  },
  {
    name: "Logística Continental Cargo",
    type: "PARTNER",
    industry: "Logistics",
    website: "https://logisticacontinental.com",
    phone: "+1 (305) 555-0707",
    email: "operations@logisticacontinental.com",
    annualRevenue: 45000000,
    employeeCount: 380,
    healthScore: 90,
    description: "Socio logístico para distribución en toda Latinoamérica y el Caribe.",
    street: "9500 NW 25th St",
    city: "Doral",
    state: "FL",
    country: "USA",
    zip: "33172",
  },
  // VENDORS (proveedores en el CRM)
  {
    name: "Maquinaria Industrial del Centro",
    type: "VENDOR",
    industry: "Manufacturing Equipment",
    website: "https://maquinariaindustrial.com",
    phone: "+52 55 9876-5432",
    email: "ventas@maquinariaindustrial.com",
    annualRevenue: 30000000,
    employeeCount: 200,
    healthScore: 72,
    description: "Proveedor de maquinaria para producción de bloques modulares.",
    street: "Av. Industrial 500",
    city: "Monterrey",
    state: "NL",
    country: "Mexico",
    zip: "64000",
  },
  // CHURNED (clientes perdidos)
  {
    name: "Construcciones Rápidas SA de CV",
    type: "CHURNED",
    industry: "Construction",
    website: "https://construccionesrapidas.mx",
    phone: "+52 81 5555-0808",
    email: "contacto@construccionesrapidas.mx",
    annualRevenue: 5000000,
    employeeCount: 35,
    healthScore: 25,
    description: "Cliente perdido en 2023 por problemas de pago. Posible reactivación futura.",
    street: "Av. Universidad 300",
    city: "Monterrey",
    state: "NL",
    country: "Mexico",
    zip: "64400",
  },
];

// ─── Pipeline Stages ────────────────────────────────────────────────────────────

const DEFAULT_PIPELINE_STAGES = [
  { name: "Nuevo", order: 1, probability: 10, color: "#94a3b8" },
  { name: "Contactado", order: 2, probability: 20, color: "#60a5fa" },
  { name: "Calificado", order: 3, probability: 40, color: "#38bdf8" },
  { name: "Propuesta", order: 4, probability: 60, color: "#fbbf24" },
  { name: "Negociación", order: 5, probability: 75, color: "#fb923c" },
  { name: "Ganado", order: 6, probability: 100, color: "#22c55e", isWon: true },
  { name: "Perdido", order: 7, probability: 0, color: "#ef4444", isLost: true },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding Biogrow Platform...\n");

  // 1. Upsert companies
  console.log("📦 Creating companies...");
  let holdingId: string | null = null;
  for (const company of COMPANIES) {
    const created = await db.company.upsert({
      where: { slug: company.slug as string },
      update: { name: company.name as string, modulesEnabled: company.modulesEnabled as string[] },
      create: company,
    });
    if (created.slug === "holding") holdingId = created.id;
    console.log(`   ✓ ${created.name} (${created.slug})`);
  }

  // Set parent_id for all non-holding companies
  if (holdingId) {
    await db.company.updateMany({
      where: { type: "COMPANY" },
      data: { parentId: holdingId },
    });
    console.log("   ✓ Parent hierarchy set\n");
  }

  // 2. Upsert permissions
  console.log("🔐 Creating permissions...");
  for (const permission of PERMISSIONS) {
    await db.permission.upsert({
      where: { key: permission.key },
      update: {},
      create: permission,
    });
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions created\n`);

  // 3. Create system roles (global — no companyId)
  console.log("👤 Creating system roles...");
  for (const roleData of SYSTEM_ROLES) {
    const existing = await db.role.findFirst({
      where: { name: roleData.name, companyId: null },
    });
    if (!existing) {
      await db.role.create({
        data: {
          companyId: null,
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
        },
      });
    }
    console.log(`   ✓ ${roleData.name}`);
  }

  // 4. Assign permissions to system roles
  console.log("\n🔗 Assigning permissions to roles...");

  const companyAdminRole = await db.role.findFirst({ where: { name: "company:admin", companyId: null } });
  const salesManagerRole = await db.role.findFirst({ where: { name: "company:sales_manager", companyId: null } });
  const salesRepRole = await db.role.findFirst({ where: { name: "company:sales_rep", companyId: null } });
  const financeRole = await db.role.findFirst({ where: { name: "company:finance", companyId: null } });
  const viewerRole = await db.role.findFirst({ where: { name: "company:viewer", companyId: null } });

  const allPermissions = await db.permission.findMany();
  const permMap = Object.fromEntries(allPermissions.map((p) => [p.key, p.id]));

  const rolePermissionMap: Record<string, string[]> = {
    "company:admin": PERMISSIONS.map((p) => p.key), // All permissions
    "company:sales_manager": [
      "crm.leads.view", "crm.leads.create", "crm.leads.edit", "crm.leads.assign", "crm.leads.convert",
      "crm.accounts.view", "crm.accounts.create", "crm.accounts.edit",
      "crm.contacts.view", "crm.contacts.create", "crm.contacts.edit",
      "crm.opportunities.view", "crm.opportunities.create", "crm.opportunities.edit",
      "crm.opportunities.close_won", "crm.opportunities.close_lost",
      "crm.activities.view", "crm.activities.create", "crm.activities.edit",
      "crm.pipeline.view", "crm.pipeline.configure",
      "crm.forecast.view", "crm.forecast.edit",
      "crm.quotes.view", "crm.quotes.create", "crm.quotes.edit", "crm.quotes.approve", "crm.quotes.send",
      "erp.sales_orders.view", "erp.invoices.view",
      "admin.users.view",
    ],
    "company:sales_rep": [
      "crm.leads.view", "crm.leads.create", "crm.leads.edit",
      "crm.accounts.view", "crm.accounts.create", "crm.accounts.edit",
      "crm.contacts.view", "crm.contacts.create", "crm.contacts.edit",
      "crm.opportunities.view", "crm.opportunities.create", "crm.opportunities.edit",
      "crm.opportunities.close_won", "crm.opportunities.close_lost",
      "crm.activities.view", "crm.activities.create", "crm.activities.edit",
      "crm.pipeline.view",
      "crm.forecast.view",
      "crm.quotes.view", "crm.quotes.create", "crm.quotes.edit", "crm.quotes.send",
    ],
    "company:finance": [
      "crm.forecast.view",
      "crm.quotes.view", "crm.quotes.approve",
      "erp.products.view",
      "erp.inventory.view",
      "erp.purchase_orders.view", "erp.purchase_orders.approve",
      "erp.sales_orders.view",
      "erp.invoices.view", "erp.invoices.create", "erp.invoices.approve", "erp.invoices.void",
      "erp.receivables.view", "erp.payables.view", "erp.treasury.view",
    ],
    "company:viewer": PERMISSIONS.filter((p) => p.action === "view").map((p) => p.key),
  };

  const roleMap: Record<string, typeof companyAdminRole> = {
    "company:admin": companyAdminRole,
    "company:sales_manager": salesManagerRole,
    "company:sales_rep": salesRepRole,
    "company:finance": financeRole,
    "company:viewer": viewerRole,
  };

  for (const [roleName, permKeys] of Object.entries(rolePermissionMap)) {
    const role = roleMap[roleName];
    if (!role) continue;
    // Delete existing and re-create
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    const toCreate = permKeys
      .filter((key) => permMap[key])
      .map((key) => ({ roleId: role.id, permissionId: permMap[key]! }));
    if (toCreate.length > 0) {
      await db.rolePermission.createMany({ data: toCreate });
    }
    console.log(`   ✓ ${roleName}: ${toCreate.length} permissions`);
  }

  // 5. Create test users
  console.log("\n👥 Creating test users...");
  const userMap: Record<string, string> = {}; // email -> userId

  for (const userData of TEST_USERS) {
    const company = await db.company.findUnique({ where: { slug: userData.companySlug } });
    const role = await db.role.findFirst({ where: { name: userData.roleName, companyId: null } });

    if (!company || !role) {
      console.log(`   ⚠️ Skipping ${userData.email} - company or role not found`);
      continue;
    }

    const user = await db.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: {
        clerkId: `clerk_test_${userData.email.split("@")[0]}`,
        email: userData.email,
        name: userData.name,
        globalRole: userData.globalRole,
      },
    });
    userMap[userData.email] = user.id;

    // Create membership
    await db.userCompanyMembership.upsert({
      where: { userId_companyId: { userId: user.id, companyId: company.id } },
      update: { roleId: role.id },
      create: {
        userId: user.id,
        companyId: company.id,
        roleId: role.id,
      },
    });
    console.log(`   ✓ ${userData.name} (${userData.email}) → ${userData.companySlug}`);
  }

  // 6. Create pipeline stages for Prime Tech Blocks
  console.log("\n📊 Creating pipeline stages for Prime Tech Blocks...");
  const primeBlocksCompany = await db.company.findUnique({ where: { slug: "prime-blocks" } });

  if (primeBlocksCompany) {
    for (const stage of DEFAULT_PIPELINE_STAGES) {
      await db.pipelineStage.upsert({
        where: { companyId_name: { companyId: primeBlocksCompany.id, name: stage.name } },
        update: { order: stage.order, probability: stage.probability, color: stage.color },
        create: {
          companyId: primeBlocksCompany.id,
          name: stage.name,
          order: stage.order,
          probability: stage.probability,
          color: stage.color,
          isWon: stage.isWon ?? false,
          isLost: stage.isLost ?? false,
        },
      });
    }
    console.log(`   ✓ ${DEFAULT_PIPELINE_STAGES.length} pipeline stages created`);
  }

  // 7. Create accounts for Prime Tech Blocks
  console.log("\n🏢 Creating accounts for Prime Tech Blocks...");

  if (primeBlocksCompany) {
    // Get a sales rep as default owner
    const defaultOwner = await db.user.findFirst({
      where: { email: "carlos.mendez@primeblocks.com" },
    });

    if (defaultOwner) {
      for (const accountData of PRIME_BLOCKS_ACCOUNTS) {
        // Check if account already exists
        const existing = await db.account.findFirst({
          where: { companyId: primeBlocksCompany.id, name: accountData.name },
        });

        if (existing) {
          console.log(`   ⊘ ${accountData.name} (already exists)`);
          continue;
        }

        await db.account.create({
          data: {
            companyId: primeBlocksCompany.id,
            ownerId: defaultOwner.id,
            name: accountData.name,
            type: accountData.type,
            industry: accountData.industry,
            website: accountData.website,
            phone: accountData.phone,
            email: accountData.email,
            annualRevenue: accountData.annualRevenue,
            employeeCount: accountData.employeeCount,
            healthScore: accountData.healthScore,
            description: accountData.description,
            street: accountData.street,
            city: accountData.city,
            state: accountData.state,
            country: accountData.country,
            zip: accountData.zip,
          },
        });
        console.log(`   ✓ ${accountData.name} (${accountData.type})`);
      }
    } else {
      console.log("   ⚠️ No default owner found, skipping accounts");
    }
  }

  console.log("\n✅ Seed complete!\n");
  console.log("📊 Summary:");
  console.log(`   Companies: ${COMPANIES.length}`);
  console.log(`   Permissions: ${PERMISSIONS.length}`);
  console.log(`   System roles: ${SYSTEM_ROLES.length}`);
  console.log(`   Test users: ${TEST_USERS.length}`);
  console.log(`   Prime Blocks accounts: ${PRIME_BLOCKS_ACCOUNTS.length}`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
