export { db, PrismaClient } from "./client";

// Re-export Prisma types for convenience
export type {
  Company,
  User,
  UserCompanyMembership,
  Role,
  Permission,
  RolePermission,
  AuditLog,
  CompanyType,
  GlobalRole,
} from "@prisma/client";
