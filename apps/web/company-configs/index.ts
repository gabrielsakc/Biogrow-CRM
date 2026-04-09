/**
 * Company Configuration Registry
 *
 * Static configurations for each company in the Biogrow Group.
 * Used for branding, module access, and UI customization.
 * The authoritative source for module enablement is still the DB;
 * this config is for static/build-time references.
 */

import type { CompanyConfig } from "@biogrow/shared-types";

import { BIOGROW_FODDER } from "./biogrow-fodder";
import { BIOGROW_FEED } from "./biogrow-feed";
import { BIOGROW_GREENS } from "./biogrow-greens";
import { BG_DATA_BUILDERS } from "./bg-data-builders";
import { BIOGROW_ROBOTICS } from "./biogrow-robotics";
import { MODULAR_LOFT } from "./modular-loft";
import { PRIME_BLOCKS } from "./prime-blocks";
import { CATTLE_GROW } from "./cattle-grow";
import { ROAD_MASTER_TECH } from "./road-master-tech";
import { HOLDING } from "./holding";

export const COMPANY_CONFIGS: Record<string, CompanyConfig> = {
  holding: HOLDING,
  "biogrow-fodder": BIOGROW_FODDER,
  "biogrow-feed": BIOGROW_FEED,
  "biogrow-greens": BIOGROW_GREENS,
  "bg-data-builders": BG_DATA_BUILDERS,
  "biogrow-robotics": BIOGROW_ROBOTICS,
  "modular-loft": MODULAR_LOFT,
  "prime-blocks": PRIME_BLOCKS,
  "cattle-grow": CATTLE_GROW,
  "road-master-tech": ROAD_MASTER_TECH,
};

export function getCompanyConfig(slug: string): CompanyConfig | null {
  return COMPANY_CONFIGS[slug] ?? null;
}

export function getAllCompanySlugs(): string[] {
  return Object.keys(COMPANY_CONFIGS);
}

// Re-export individual configs for direct imports
export {
  HOLDING,
  BIOGROW_FODDER,
  BIOGROW_FEED,
  BIOGROW_GREENS,
  BG_DATA_BUILDERS,
  BIOGROW_ROBOTICS,
  MODULAR_LOFT,
  PRIME_BLOCKS,
  CATTLE_GROW,
  ROAD_MASTER_TECH,
};

export type { CompanyConfig };
