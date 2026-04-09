import type { CompanyConfig } from "@biogrow/shared-types";

export const MODULAR_LOFT: CompanyConfig = {
  slug: "modular-loft",
  name: "Modular Loft USA",
  type: "COMPANY",
  description: "Modular construction and housing projects",
  branding: {
    primaryColor: "#ea580c",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "manufacturing", "projects"],
};
