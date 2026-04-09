/**
 * Server-side auth helpers.
 * Only import this file from Server Components, API routes, or tRPC routers.
 */

import { cookies } from "next/headers";
import { db } from "@biogrow/database";
import type { AuthContext, SessionUser, CompanyMembership } from "./types";

const LOCAL_USER: SessionUser = {
  id: "local-admin",
  email: "admin@biogrow.com",
  name: "Administrador",
  avatarUrl: null,
  globalRole: "SUPER_ADMIN",
};

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  return cookieStore.get("biogrow_session")?.value === "authenticated";
}

/**
 * Returns the full AuthContext for the current request.
 */
export async function getAuthContext(
  activeCompanySlug?: string
): Promise<AuthContext | null> {
  if (!isAuthenticated()) return null;

  const memberships: CompanyMembership[] = [];
  let activeCompanyId: string | null = null;
  let resolvedSlug: string | null = null;

  if (activeCompanySlug) {
    try {
      const company = await db.company.findUnique({
        where: { slug: activeCompanySlug },
        select: { id: true, slug: true, name: true },
      });
      if (company) {
        activeCompanyId = company.id;
        resolvedSlug = company.slug;
      }
    } catch {
      // db may not be available in all environments
    }
  }

  return {
    user: LOCAL_USER,
    memberships,
    activeCompanyId,
    activeCompanySlug: resolvedSlug,
  };
}

/**
 * Returns the local session user if authenticated.
 */
export async function syncUser(): Promise<SessionUser | null> {
  if (!isAuthenticated()) return null;
  return LOCAL_USER;
}

/**
 * Returns the active company for a slug.
 */
export async function requireCompanyAccess(
  _userId: string,
  companySlug: string
) {
  if (!isAuthenticated()) return null;

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
      include: { roles: true },
    });

    if (!company) return null;
    return company;
  } catch {
    return null;
  }
}
