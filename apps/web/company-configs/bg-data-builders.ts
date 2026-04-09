import type { CompanyConfig } from "@biogrow/shared-types";

export const BG_DATA_BUILDERS: CompanyConfig = {
  slug: "bg-data-builders",
  name: "BG Data Builders",
  type: "COMPANY",
  description: "Data services, analytics and technology",
  branding: {
    primaryColor: "#7c3aed",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "projects", "analytics"],
};
