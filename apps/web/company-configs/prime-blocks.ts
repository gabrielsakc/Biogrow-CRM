import type { CompanyConfig } from "@biogrow/shared-types";

export const PRIME_BLOCKS: CompanyConfig = {
  slug: "prime-blocks",
  name: "Prime Tech Blocks",
  type: "COMPANY",
  description: "Manufacturing of blocks and construction materials",
  branding: {
    primaryColor: "#0284c7",
  },
  settings: {
    timezone: "America/New_York",
    currency: "USD",
  },
  modules: ["crm", "erp", "inventory", "manufacturing", "projects"],
};
