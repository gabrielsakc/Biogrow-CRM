import type { CompanyConfig } from "@biogrow/shared-types";

export const HOLDING: CompanyConfig = {
  slug: "holding",
  name: "Biogrow Group",
  type: "HOLDING",
  description: "Consolidated holding of the Biogrow Group",
  branding: {
    primaryColor: "#059669",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "analytics", "holding"],
};
