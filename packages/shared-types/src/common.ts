/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DateRangeFilter {
  from?: Date | string;
  to?: Date | string;
}

/** Generic select option for dropdowns */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Entity reference — minimal info to link to an entity */
export interface EntityRef {
  id: string;
  name: string;
  type: string;
}

/** Delta value with direction for KPI cards */
export interface KPIDelta {
  value: number;
  percent: number;
  direction: "up" | "down" | "flat";
  period: string;
}

export type SortDirection = "asc" | "desc";

export type Status = "active" | "inactive" | "archived";
