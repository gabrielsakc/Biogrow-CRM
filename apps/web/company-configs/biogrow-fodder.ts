import type { CompanyConfig } from "@biogrow/shared-types";

export const BIOGROW_FODDER: CompanyConfig = {
  slug: "biogrow-fodder",
  name: "Biogrow Fodder",
  type: "COMPANY",
  description: "Production and commercialization of fodder",
  branding: {
    primaryColor: "#059669",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "purchasing", "production"],
};
