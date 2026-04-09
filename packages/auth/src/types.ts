import type { GlobalRole } from "@biogrow/database";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
}

export interface CompanyMembership {
  companyId: string;
  companySlug: string;
  companyName: string;
  roleId: string;
  roleName: string;
  isPrimary: boolean;
}

export interface AuthContext {
  user: SessionUser;
  memberships: CompanyMembership[];
  /** The currently active company (resolved from URL slug or header) */
  activeCompanyId: string | null;
  activeCompanySlug: string | null;
}

export type { GlobalRole };
