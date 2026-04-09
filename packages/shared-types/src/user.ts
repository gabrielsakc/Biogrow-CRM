export type GlobalRole = "SUPERADMIN" | "HOLDING_ADMIN" | "HOLDING_EXEC" | "MEMBER";

export interface UserProfile {
  id: string;
  clerkId: string;
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

export interface UserWithMemberships extends UserProfile {
  memberships: CompanyMembership[];
}
