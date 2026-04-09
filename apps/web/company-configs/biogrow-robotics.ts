import type { CompanyConfig } from "@biogrow/shared-types";

export const BIOGROW_ROBOTICS: CompanyConfig = {
  slug: "biogrow-robotics",
  name: "Biogrow Robotics",
  type: "COMPANY",
  description: "Robotics, automation and technology assets",
  branding: {
    primaryColor: "#dc2626",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "projects", "assets", "manufacturing"],
};
