/**
 * Permission check helpers for Server Components.
 * These are lightweight wrappers — the full RBAC engine is in @biogrow/permissions.
 *
 * Use these in layouts and pages to gate access, not just UI visibility.
 */

import { redirect } from "next/navigation";
import type { PermissionKey } from "@biogrow/permissions";

/**
 * Throws/redirects if the user does not have the required permission.
 * Call after resolveCompany() to get the permissions array.
 */
export function requirePermission(
  permissions: string[],
  required: PermissionKey,
  redirectTo = "/select-company"
): void {
  if (!permissions.includes(required)) {
    redirect(redirectTo);
  }
}

/**
 * Returns true if the user has the permission (for conditional rendering).
 */
export function hasPermission(
  permissions: string[],
  required: PermissionKey
): boolean {
  return permissions.includes(required);
}

/**
 * Returns true if the user has ALL of the listed permissions.
 */
export function hasAllPermissions(
  permissions: string[],
  required: PermissionKey[]
): boolean {
  return required.every((p) => permissions.includes(p));
}

/**
 * Returns true if the user has ANY of the listed permissions.
 */
export function hasAnyPermission(
  permissions: string[],
  required: PermissionKey[]
): boolean {
  return required.some((p) => permissions.includes(p));
}
