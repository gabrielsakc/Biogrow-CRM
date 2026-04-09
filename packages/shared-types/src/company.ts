export type CompanyType = "HOLDING" | "COMPANY";

export type CompanyModule =
  | "crm"
  | "erp"
  | "analytics"
  | "holding"
  | "inventory"
  | "purchasing"
  | "production"
  | "projects"
  | "analytics"
  | "assets"
  | "manufacturing"
  | "logistics";

export interface CompanyBranding {
  primaryColor: string;
  logoUrl?: string;
}

export interface CompanySettings {
  timezone: string;
  currency: string;
}

/**
 * Static configuration for each company.
 * Stored in code (not DB) for fast access without a round-trip.
 * Dynamic settings (modules_enabled, branding) are authoritative in the DB.
 */
export interface CompanyConfig {
  slug: string;
  name: string;
  type: CompanyType;
  branding: CompanyBranding;
  settings: CompanySettings;
  modules: CompanyModule[];
  description?: string;
}

/** Lightweight company reference used in UI lists and selectors */
export interface CompanySummary {
  id: string;
  slug: string;
  name: string;
  type: CompanyType;
  logoUrl: string | null;
  primaryColor: string | null;
  isPrimary?: boolean;
}
