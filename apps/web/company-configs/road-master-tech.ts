import type { CompanyConfig } from "@biogrow/shared-types";

export const ROAD_MASTER_TECH: CompanyConfig = {
  slug: "road-master-tech",
  name: "Road Master Tech",
  type: "COMPANY",
  description: "Road infrastructure technology and engineering solutions",
  branding: {
    primaryColor: "#374151",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "projects", "assets", "manufacturing"],
};
