import type {
  Product, ProductCategory, PriceList, PriceListItem, Vendor,
  ProductType, VendorStatus,
} from "@biogrow/database";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  Product, ProductCategory, PriceList, PriceListItem, Vendor,
  ProductType, VendorStatus,
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ─── Product params ───────────────────────────────────────────────────────────
export interface ProductListParams extends PaginationParams {
  companyId: string;
  categoryId?: string;
  type?: ProductType;
  isActive?: boolean;
  search?: string;
}

export interface CreateProductParams {
  companyId: string;
  categoryId?: string;
  sku?: string;
  name: string;
  description?: string;
  type?: ProductType;
  unit?: string;
  basePrice?: number;
  currency?: string;
  taxPct?: number;
  imageUrl?: string;
}

export interface UpdateProductParams extends Partial<Omit<CreateProductParams, "companyId">> {
  id: string;
  companyId: string;
  isActive?: boolean;
}

// ─── Product Category params ──────────────────────────────────────────────────
export interface CreateProductCategoryParams {
  companyId: string;
  name: string;
  description?: string;
  parentId?: string;
}

// ─── Price List params ────────────────────────────────────────────────────────
export interface PriceListListParams {
  companyId: string;
  isActive?: boolean;
}

export interface CreatePriceListParams {
  companyId: string;
  name: string;
  description?: string;
  currency?: string;
  isDefault?: boolean;
  validFrom?: Date;
  validTo?: Date;
  items?: { productId: string; price: number; minQuantity?: number }[];
}

// ─── Vendor params ────────────────────────────────────────────────────────────
export interface VendorListParams extends PaginationParams {
  companyId: string;
  status?: VendorStatus;
  search?: string;
}

export interface CreateVendorParams {
  companyId: string;
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  paymentTermsDays?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateVendorParams extends Partial<Omit<CreateVendorParams, "companyId">> {
  id: string;
  companyId: string;
  status?: VendorStatus;
}
