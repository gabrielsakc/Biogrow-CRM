import type { CompanyConfig } from "@biogrow/shared-types";

export const BIOGROW_GREENS: CompanyConfig = {
  slug: "biogrow-greens",
  name: "BiogrowGreens",
  type: "COMPANY",
  description: "Production of vegetables and green products",
  branding: {
    primaryColor: "#16a34a",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "purchasing"],
};
