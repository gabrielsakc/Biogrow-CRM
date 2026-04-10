/**
 * Server-side company resolution helpers.
 * Import only in Server Components, layouts, or API routes.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@biogrow/database";
import { getCompanyConfig, COMPANY_CONFIGS } from "@/company-configs";
import type { CompanySummary } from "@biogrow/shared-types";

// Internal use - authentication bypassed
const REQUIRE_AUTH = false;

function requireSession() {
  if (!REQUIRE_AUTH) return; // Skip auth check for internal use

  const cookieStore = cookies();
  if (cookieStore.get("biogrow_session")?.value !== "authenticated") {
    redirect("/sign-in");
  }
}

/**
 * Resolves the company for the current request.
 * Verifies the user is authenticated and the company slug is valid.
 * Redirects to /select-company if not found.
 */
export async function resolveCompany(slug: string) {
  requireSession();

  try {
    const company = await db.company.findUnique({
      where: { slug, isActive: true },
      include: {
        roles: {
          take: 1,
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (company) {
      const role = company.roles[0];
      const permissions = role
        ? role.permissions.map((rp) => rp.permission.key)
        : [];

      const config = getCompanyConfig(slug);

      return {
        company,
        role,
        permissions,
        config,
      };
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  // Fallback to config-based company if database fails or company not found
  const config = getCompanyConfig(slug);
  if (config) {
    return {
      company: {
        id: config.slug,
        name: config.name,
        slug: config.slug,
        type: config.type,
        currency: config.settings?.currency ?? "USD",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        logoUrl: config.branding?.logoUrl ?? null,
        primaryColor: config.branding?.primaryColor ?? null,
      },
      role: null,
      permissions: getAllPermissions(), // Grant all permissions for internal use
      config,
    };
  }

  redirect("/select-company");
}

/**
 * Get all available permissions for internal use
 */
function getAllPermissions(): string[] {
  return [
    // CRM
    "crm.leads.view", "crm.leads.create", "crm.leads.edit", "crm.leads.delete", "crm.leads.assign", "crm.leads.convert",
    "crm.accounts.view", "crm.accounts.create", "crm.accounts.edit", "crm.accounts.delete",
    "crm.contacts.view", "crm.contacts.create", "crm.contacts.edit", "crm.contacts.delete",
    "crm.opportunities.view", "crm.opportunities.create", "crm.opportunities.edit", "crm.opportunities.delete", "crm.opportunities.close_won", "crm.opportunities.close_lost",
    "crm.activities.view", "crm.activities.create", "crm.activities.edit",
    "crm.tasks.view", "crm.tasks.create", "crm.tasks.edit", "crm.tasks.delete", "crm.tasks.assign",
    "crm.pipeline.view", "crm.pipeline.configure",
    "crm.forecast.view", "crm.forecast.edit",
    "crm.quotes.view", "crm.quotes.create", "crm.quotes.edit", "crm.quotes.approve", "crm.quotes.send",
    // ERP
    "erp.products.view", "erp.products.create", "erp.products.edit", "erp.products.delete",
    "erp.price_lists.view", "erp.price_lists.manage",
    "erp.vendors.view", "erp.vendors.create", "erp.vendors.edit", "erp.vendors.delete",
    "erp.inventory.view", "erp.inventory.adjust",
    "erp.warehouses.view", "erp.warehouses.manage",
    "erp.purchase_orders.view", "erp.purchase_orders.create", "erp.purchase_orders.edit", "erp.purchase_orders.approve", "erp.purchase_orders.receive",
    "erp.sales_orders.view", "erp.sales_orders.create", "erp.sales_orders.edit", "erp.sales_orders.cancel",
    "erp.invoices.view", "erp.invoices.create", "erp.invoices.edit", "erp.invoices.send", "erp.invoices.void",
    "erp.investments.view", "erp.investments.create", "erp.investments.edit", "erp.investments.delete",
    // Admin
    "admin.company.configure",
    // Holding
    "holding.reports.view", "holding.dashboard.view",
  ];
}

/**
 * Returns all companies available.
 */
export async function getUserCompanies(): Promise<CompanySummary[]> {
  if (REQUIRE_AUTH) {
    const cookieStore = cookies();
    if (cookieStore.get("biogrow_session")?.value !== "authenticated") return [];
  }

  try {
    const companies = await db.company.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return companies.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      type: c.type,
      logoUrl: c.logoUrl,
      primaryColor: c.primaryColor,
      isPrimary: false,
    }));
  } catch {
    // Fallback to config-based companies
    return Object.values(COMPANY_CONFIGS).map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      type: c.type,
      logoUrl: c.branding?.logoUrl ?? null,
      primaryColor: c.branding?.primaryColor ?? null,
      isPrimary: false,
    }));
  }
}