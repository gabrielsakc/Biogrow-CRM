import { db } from "@biogrow/database";

export const inventoryService = {
  // ─── Warehouses ────────────────────────────────────────────────────────────

  async listWarehouses(companyId: string) {
    return db.warehouse.findMany({
      where: { companyId },
      include: { _count: { select: { stockItems: true } } },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  },

  async createWarehouse(params: {
    companyId: string; name: string; code?: string; address?: string; isDefault?: boolean;
  }) {
    if (params.isDefault) {
      await db.warehouse.updateMany({
        where: { companyId: params.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return db.warehouse.create({ data: { ...params } });
  },

  async updateWarehouse(id: string, companyId: string, data: Partial<{
    name: string; code: string; address: string; isDefault: boolean; isActive: boolean;
  }>) {
    if (data.isDefault) {
      await db.warehouse.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return db.warehouse.update({ where: { id }, data });
  },

  // ─── Stock ────────────────────────────────────────────────────────────────

  async getStockByWarehouse(warehouseId: string) {
    return db.stockItem.findMany({
      where: { warehouseId },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true, type: true } },
      },
      orderBy: { product: { name: "asc" } },
    });
  },

  async getStockByProduct(productId: string, companyId: string) {
    return db.stockItem.findMany({
      where: {
        productId,
        warehouse: { companyId },
      },
      include: { warehouse: { select: { id: true, name: true } } },
    });
  },

  async getStockSummary(companyId: string) {
    // Total stock value by product across all warehouses
    const warehouses = await db.warehouse.findMany({
      where: { companyId },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w) => w.id);

    const stockItems = await db.stockItem.findMany({
      where: { warehouseId: { in: warehouseIds } },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true, basePrice: true, type: true } },
        warehouse: { select: { id: true, name: true } },
      },
    });

    // Low stock alerts
    const lowStock = stockItems.filter(
      (s) => s.minStock != null && s.quantity <= s.minStock
    );

    return { stockItems, lowStock };
  },

  // ─── Movements ───────────────────────────────────────────────────────────

  async listMovements(params: {
    companyId: string;
    warehouseId?: string;
    productId?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }) {
    const { companyId, warehouseId, productId, from, to, limit = 50 } = params;
    return db.inventoryMovement.findMany({
      where: {
        companyId,
        ...(warehouseId && { warehouseId }),
        ...(productId && { productId }),
        ...(from || to
          ? { occurredAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
          : {}),
      },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        warehouse: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: limit,
    });
  },

  async recordMovement(params: {
    companyId: string;
    warehouseId: string;
    productId: string;
    userId: string;
    type: string;
    quantity: number;
    unitCost?: number;
    reference?: string;
    notes?: string;
  }) {
    const { type, quantity, ...rest } = params;

    // Update stock level
    const delta = ["PURCHASE_RECEIPT", "ADJUSTMENT_IN", "TRANSFER_IN", "RETURN_IN"].includes(type)
      ? Math.abs(quantity)
      : -Math.abs(quantity);

    const [movement] = await db.$transaction([
      db.inventoryMovement.create({
        data: {
          ...rest,
          type: type as any,
          quantity: delta,
        },
      }),
      db.stockItem.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: params.warehouseId,
            productId: params.productId,
          },
        },
        create: {
          warehouseId: params.warehouseId,
          productId: params.productId,
          quantity: Math.max(0, delta),
        },
        update: {
          quantity: { increment: delta },
        },
      }),
    ]);

    return movement;
  },
};
