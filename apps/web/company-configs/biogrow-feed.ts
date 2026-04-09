import type { CompanyConfig } from "@biogrow/shared-types";

export const BIOGROW_FEED: CompanyConfig = {
  slug: "biogrow-feed",
  name: "BiogrowFeed",
  type: "COMPANY",
  description: "Animal feed and nutrition",
  branding: {
    primaryColor: "#0891b2",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "purchasing", "production"],
};
