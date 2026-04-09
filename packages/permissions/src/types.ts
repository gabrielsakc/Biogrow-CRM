import type { GlobalRole } from "@biogrow/database";

/** A permission key in the format module.entity.action */
export type PermissionKey = string;

export interface ResolvedUser {
  id: string;
  globalRole: GlobalRole;
  /** Map of companyId → array of permission keys */
  companyPermissions: Record<string, PermissionKey[]>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export { GlobalRole };
