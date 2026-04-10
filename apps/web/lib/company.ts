/**
 * Server-side company resolution helpers.
 * Import only in Server Components, layouts, or API routes.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@biogrow/database";
import { getCompanyConfig, COMPANY_CONFIGS } from "@/company-configs";
import type { CompanySummary } from "@biogrow/shared-types";

function requireSession() {
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

    if (!company) {
      console.error(`Company not found: ${slug}`);
      redirect("/select-company");
    }

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
  } catch (error) {
    console.error("Error resolving company:", error);
    // Fallback to config-based company if database fails
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
          logoUrl: null,
          primaryColor: config.branding?.primaryColor ?? null,
        },
        role: null,
        permissions: [],
        config,
      };
    }
    redirect("/select-company");
  }
}

/**
 * Returns all companies available.
 */
export async function getUserCompanies(): Promise<CompanySummary[]> {
  const cookieStore = cookies();
  if (cookieStore.get("biogrow_session")?.value !== "authenticated") return [];

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
    return Object.values(COMPANY_CONFIGS).map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      type: c.type,
      logoUrl: null,
      primaryColor: null,
      isPrimary: false,
    }));
  }
}
