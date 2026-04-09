import type { CompanyConfig } from "@biogrow/shared-types";

export const CATTLE_GROW: CompanyConfig = {
  slug: "cattle-grow",
  name: "CattleGrow",
  type: "COMPANY",
  description: "Livestock, animal production and agro-industry",
  branding: {
    primaryColor: "#92400e",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "purchasing", "production"],
};
