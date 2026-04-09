import { db } from "@biogrow/database";

const OWNER_SELECT = { select: { id: true, name: true, avatarUrl: true } };
const ACCOUNT_SELECT = { select: { id: true, name: true } };

async function generateSONumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.salesOrder.count({ where: { companyId } });
  return `SO-${year}-${String(count + 1).padStart(4, "0")}`;
}

function computeTotals(
  lineItems: { quantity: number; unitPrice: number; discountPct: number }[],
  discountPct: number,
  taxPct: number
) {
  const subtotal = lineItems.reduce((s, li) => {
    const lineTotal = li.quantity * li.unitPrice * (1 - li.discountPct / 100);
    return s + lineTotal;
  }, 0);
  const afterDiscount = subtotal * (1 - discountPct / 100);
  const total = afterDiscount * (1 + taxPct / 100);
  return { subtotal: afterDiscount, taxPct, total };
}

export const salesOrdersService = {
  async list(params: {
    companyId: string; status?: string; ownerId?: string; accountId?: string;
    search?: string; page?: number; pageSize?: number;
  }) {
    const { companyId, status, ownerId, accountId, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status: status as any }),
      ...(ownerId && { ownerId }),
      ...(accountId && { accountId }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" as const } },
          { account: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      db.salesOrder.count({ where }),
      db.salesOrder.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          account: ACCOUNT_SELECT,
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
    return db.salesOrder.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        account: ACCOUNT_SELECT,
        lineItems: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
          orderBy: { sortOrder: "asc" },
        },
        invoices: { select: { id: true, number: true, status: true, total: true } },
      },
    });
  },

  async createFromQuote(quoteId: string, companyId: string, ownerId: string) {
    const quote = await db.quote.findFirst({
      where: { id: quoteId, companyId },
      include: { lineItems: true },
    });
    if (!quote) throw new Error("Quote not found");

    const number = await generateSONumber(companyId);

    return db.salesOrder.create({
      data: {
        companyId,
        ownerId,
        quoteId,
        accountId: quote.accountId,
        number,
        status: "CONFIRMED",
        currency: quote.currency,
        subtotal: quote.subtotal,
        discountPct: quote.discountPct,
        taxPct: quote.taxPct,
        total: quote.total,
        lineItems: {
          create: quote.lineItems.map((li, i) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discountPct: li.discountPct,
            total: li.total,
            sortOrder: i,
          })),
        },
      },
      include: { lineItems: true },
    });
  },

  async create(params: {
    companyId: string;
    ownerId: string;
    accountId?: string;
    currency?: string;
    discountPct?: number;
    taxPct?: number;
    shippingAddress?: string;
    requestedDate?: Date;
    notes?: string;
    lineItems: { description: string; quantity: number; unitPrice: number; discountPct?: number; productId?: string; sortOrder?: number }[];
  }) {
    const number = await generateSONumber(params.companyId);
    const { subtotal, taxPct, total } = computeTotals(
      params.lineItems.map((li) => ({ ...li, discountPct: li.discountPct ?? 0 })),
      params.discountPct ?? 0,
      params.taxPct ?? 0
    );

    return db.salesOrder.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        accountId: params.accountId,
        number,
        currency: params.currency ?? "USD",
        subtotal,
        discountPct: params.discountPct ?? 0,
        taxPct,
        total,
        shippingAddress: params.shippingAddress,
        requestedDate: params.requestedDate,
        notes: params.notes,
        lineItems: {
          create: params.lineItems.map((li, i) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discountPct: li.discountPct ?? 0,
            total: li.quantity * li.unitPrice * (1 - (li.discountPct ?? 0) / 100),
            productId: li.productId,
            sortOrder: li.sortOrder ?? i,
          })),
        },
      },
      include: { lineItems: true, owner: OWNER_SELECT, account: ACCOUNT_SELECT },
    });
  },

  async updateStatus(id: string, companyId: string, status: string, extra?: { shippedAt?: Date; deliveredAt?: Date }) {
    const order = await db.salesOrder.findFirst({ where: { id, companyId } });
    if (!order) throw new Error("Sales order not found");
    return db.salesOrder.update({
      where: { id },
      data: { status: status as any, ...extra },
    });
  },

  async getStats(companyId: string) {
    const statuses = ["DRAFT", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
    const counts = await db.salesOrder.groupBy({
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
