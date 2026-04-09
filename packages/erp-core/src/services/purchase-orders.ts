import { db } from "@biogrow/database";

const OWNER_SELECT = { select: { id: true, name: true, avatarUrl: true } };
const VENDOR_SELECT = { select: { id: true, name: true, currency: true } };

async function generatePONumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.purchaseOrder.count({ where: { companyId } });
  return `PO-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const purchaseOrdersService = {
  async list(params: {
    companyId: string; status?: string; vendorId?: string;
    search?: string; page?: number; pageSize?: number;
  }) {
    const { companyId, status, vendorId, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status: status as any }),
      ...(vendorId && { vendorId }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" as const } },
          { vendor: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      db.purchaseOrder.count({ where }),
      db.purchaseOrder.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          vendor: VENDOR_SELECT,
          _count: { select: { lineItems: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        vendor: true,
        lineItems: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  async create(params: {
    companyId: string;
    ownerId: string;
    vendorId: string;
    currency?: string;
    taxPct?: number;
    expectedDate?: Date;
    notes?: string;
    lineItems: { description: string; quantity: number; unitCost: number; productId?: string; sortOrder?: number }[];
  }) {
    const number = await generatePONumber(params.companyId);
    const subtotal = params.lineItems.reduce((s, li) => s + li.quantity * li.unitCost, 0);
    const total = subtotal * (1 + (params.taxPct ?? 0) / 100);

    return db.purchaseOrder.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        vendorId: params.vendorId,
        number,
        currency: params.currency ?? "USD",
        subtotal,
        taxPct: params.taxPct ?? 0,
        total,
        expectedDate: params.expectedDate,
        notes: params.notes,
        lineItems: {
          create: params.lineItems.map((li, i) => ({
            description: li.description,
            quantity: li.quantity,
            unitCost: li.unitCost,
            total: li.quantity * li.unitCost,
            productId: li.productId,
            sortOrder: li.sortOrder ?? i,
          })),
        },
      },
      include: { lineItems: true, owner: OWNER_SELECT, vendor: VENDOR_SELECT },
    });
  },

  async submit(id: string, companyId: string) {
    const po = await db.purchaseOrder.findFirst({ where: { id, companyId, status: "DRAFT" } });
    if (!po) throw new Error("Purchase order not found or not in DRAFT status");
    return db.purchaseOrder.update({ where: { id }, data: { status: "SUBMITTED" } });
  },

  async approve(id: string, companyId: string, approvedById: string) {
    const po = await db.purchaseOrder.findFirst({ where: { id, companyId, status: "SUBMITTED" } });
    if (!po) throw new Error("Purchase order not found or not in SUBMITTED status");
    return db.purchaseOrder.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date(), approvedById },
    });
  },

  async receive(id: string, companyId: string, userId: string, lineReceived: { lineItemId: string; receivedQty: number }[]) {
    const po = await db.purchaseOrder.findFirst({
      where: { id, companyId, status: { in: ["APPROVED", "PARTIALLY_RECEIVED"] } },
      include: { lineItems: true },
    });
    if (!po) throw new Error("Purchase order not found or not approved");

    // Update received quantities
    await Promise.all(
      lineReceived.map((lr) =>
        db.purchaseOrderLineItem.update({
          where: { id: lr.lineItemId },
          data: { receivedQty: { increment: lr.receivedQty } },
        })
      )
    );

    // Check if fully received
    const updatedLines = await db.purchaseOrderLineItem.findMany({ where: { purchaseOrderId: id } });
    const fullyReceived = updatedLines.every((l) => l.receivedQty >= l.quantity);
    const anyReceived = updatedLines.some((l) => l.receivedQty > 0);

    const newStatus = fullyReceived ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : "APPROVED";
    return db.purchaseOrder.update({
      where: { id },
      data: {
        status: newStatus as any,
        ...(fullyReceived && { receivedAt: new Date() }),
      },
    });
  },

  async getStats(companyId: string) {
    const statuses = ["DRAFT", "SUBMITTED", "APPROVED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as const;
    const counts = await db.purchaseOrder.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
      _sum: { total: true },
    });
    return statuses.map((s) => {
      const row = counts.find((c) => c.status === s);
      return { status: s, count: row?._count ?? 0, totalAmount: row?._sum.total ?? 0 };
    });
  },
};
