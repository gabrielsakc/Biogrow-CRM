/**
 * RBAC Permission Engine
 *
 * Resolves whether a user can perform an action.
 * Two-tier model:
 *   1. Global roles (SUPERADMIN, HOLDING_ADMIN) bypass all company checks.
 *   2. Company-scoped roles are checked against the user's membership
 *      in the specified company.
 */

import { db } from "@biogrow/database";
import type { PermissionKey, ResolvedUser, PermissionCheckResult } from "./types";

/**
 * Resolves all permissions for a user across all their companies.
 * The result is cached per-request by the caller.
 */
export async function resolveUserPermissions(userId: string): Promise<ResolvedUser> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          company: { select: { id: true } },
          role: {
            include: {
              permissions: {
                include: { permission: { select: { key: true } } },
              },
            },
          },
        },
      },
    },
  });

  const companyPermissions: Record<string, PermissionKey[]> = {};

  for (const membership of user.memberships) {
    const keys = membership.role.permissions.map(
      (rp) => rp.permission.key as PermissionKey
    );
    companyPermissions[membership.company.id] = keys;
  }

  return {
    id: user.id,
    globalRole: user.globalRole,
    companyPermissions,
  };
}

/**
 * Core permission check.
 *
 * @param user     - The resolved user (call resolveUserPermissions first)
 * @param permission - The permission key to check (e.g. "crm.leads.create")
 * @param companyId  - The company context. Required unless checking a holding permission.
 */
export function can(
  user: ResolvedUser,
  permission: PermissionKey,
  companyId?: string
): PermissionCheckResult {
  // SUPERADMIN bypasses everything
  if (user.globalRole === "SUPERADMIN") {
    return { allowed: true, reason: "superadmin" };
  }

  // HOLDING_ADMIN has full access including holding-level permissions
  if (user.globalRole === "HOLDING_ADMIN") {
    return { allowed: true, reason: "holding_admin" };
  }

  // HOLDING_EXEC can only view holding-level data
  if (user.globalRole === "HOLDING_EXEC") {
    const isHoldingRead =
      permission.startsWith("holding.") && permission.endsWith(".view");
    if (isHoldingRead) return { allowed: true, reason: "holding_exec_view" };
    return { allowed: false, reason: "holding_exec_restricted" };
  }

  // For company-scoped permissions, companyId is required
  if (!companyId) {
    return { allowed: false, reason: "no_company_context" };
  }

  const userPerms = user.companyPermissions[companyId];
  if (!userPerms) {
    return { allowed: false, reason: "no_membership" };
  }

  const allowed = userPerms.includes(permission);
  return {
    allowed,
    reason: allowed ? "role_permission" : "permission_denied",
  };
}

/**
 * Convenience: check multiple permissions (AND — all must pass).
 */
export function canAll(
  user: ResolvedUser,
  permissions: PermissionKey[],
  companyId?: string
): boolean {
  return permissions.every((p) => can(user, p, companyId).allowed);
}

/**
 * Convenience: check multiple permissions (OR — at least one must pass).
 */
export function canAny(
  user: ResolvedUser,
  permissions: PermissionKey[],
  companyId?: string
): boolean {
  return permissions.some((p) => can(user, p, companyId).allowed);
}
