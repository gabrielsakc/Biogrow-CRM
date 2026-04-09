// Server-side auth utilities (import only in Server Components / API routes)
export { getAuthContext, syncUser, requireCompanyAccess } from "./server";

// Shared types
export type {
  SessionUser,
  CompanyMembership,
  AuthContext,
  GlobalRole,
} from "./types";
