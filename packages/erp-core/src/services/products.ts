import { db } from "@biogrow/database";
import type {
  ProductListParams,
  CreateProductParams,
  UpdateProductParams,
  CreateProductCategoryParams,
  PriceListListParams,
  CreatePriceListParams,
} from "../types";

const CATEGORY_SELECT = { select: { id: true, name: true } };

export const productsService = {
  // ─── Categories ────────────────────────────────────────────────────────────

  async listCategories(companyId: string) {
    return db.productCategory.findMany({
      where: { companyId },
      include: { children: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  },

  async createCategory(params: CreateProductCategoryParams) {
    return db.productCategory.create({
      data: {
        companyId: params.companyId,
        name: params.name,
        description: params.description,
        parentId: params.parentId,
      },
    });
  },

  // ─── Products ──────────────────────────────────────────────────────────────

  async list(params: ProductListParams) {
    const { companyId, categoryId, type, isActive, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: { category: CATEGORY_SELECT },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.product.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        priceListItems: {
          include: { priceList: { select: { id: true, name: true, currency: true } } },
        },
      },
    });
  },

  async create(params: CreateProductParams) {
    return db.product.create({
      data: {
        companyId: params.companyId,
        categoryId: params.categoryId,
        sku: params.sku,
        name: params.name,
        description: params.description,
        type: params.type ?? "SERVICE",
        unit: params.unit ?? "unit",
        basePrice: params.basePrice ?? 0,
        currency: params.currency ?? "USD",
        taxPct: params.taxPct ?? 0,
        imageUrl: params.imageUrl,
      },
      include: { category: CATEGORY_SELECT },
    });
  },

  async update(params: UpdateProductParams) {
    const { id, companyId, ...data } = params;
    return db.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { category: CATEGORY_SELECT },
    });
  },

  async delete(id: string, companyId: string) {
    // Verify ownership before delete
    const product = await db.product.findFirst({ where: { id, companyId } });
    if (!product) throw new Error("Product not found");
    return db.product.delete({ where: { id } });
  },

  // ─── Price Lists ──────────────────────────────────────────────────────────

  async listPriceLists(params: PriceListListParams) {
    return db.priceList.findMany({
      where: {
        companyId: params.companyId,
        ...(params.isActive !== undefined && { isActive: params.isActive }),
      },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  },

  async createPriceList(params: CreatePriceListParams) {
    const { items, ...listData } = params;

    // If isDefault, unset existing default first
    if (listData.isDefault) {
      await db.priceList.updateMany({
        where: { companyId: listData.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return db.priceList.create({
      data: {
        companyId: listData.companyId,
        name: listData.name,
        description: listData.description,
        currency: listData.currency ?? "USD",
        isDefault: listData.isDefault ?? false,
        validFrom: listData.validFrom,
        validTo: listData.validTo,
        items: items
          ? {
              create: items.map((item) => ({
                productId: item.productId,
                price: item.price,
                minQuantity: item.minQuantity ?? 1,
              })),
            }
          : undefined,
      },
      include: { items: { include: { product: { select: { id: true, name: true, sku: true } } } } },
    });
  },
};
