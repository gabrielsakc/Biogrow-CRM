import { db } from "@biogrow/database";

const OWNER_SELECT = { select: { id: true, name: true, avatarUrl: true } };
const ACCOUNT_SELECT = { select: { id: true, name: true } };

async function generateInvoiceNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count({ where: { companyId } });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const financeService = {
  // ─── Invoices ─────────────────────────────────────────────────────────────

  async listInvoices(params: {
    companyId: string; status?: string; accountId?: string;
    from?: Date; to?: Date; page?: number; pageSize?: number;
  }) {
    const { companyId, status, accountId, from, to, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status: status as any }),
      ...(accountId && { accountId }),
      ...(from || to
        ? { issuedAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    };

    const [total, invoices] = await Promise.all([
      db.invoice.count({ where }),
      db.invoice.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          account: ACCOUNT_SELECT,
          salesOrder: { select: { id: true, number: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { invoices, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getInvoiceById(id: string, companyId: string) {
    return db.invoice.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        account: ACCOUNT_SELECT,
        salesOrder: { select: { id: true, number: true } },
        lineItems: {
          include: { product: { select: { id: true, name: true, sku: true } } },
          orderBy: { sortOrder: "asc" },
        },
        arLedger: true,
      },
    });
  },

  async createInvoice(params: {
    companyId: string;
    ownerId: string;
    salesOrderId?: string;
    accountId?: string;
    currency?: string;
    taxPct?: number;
    dueDate?: Date;
    notes?: string;
    lineItems: { description: string; quantity: number; unitPrice: number; productId?: string; sortOrder?: number }[];
  }) {
    const number = await generateInvoiceNumber(params.companyId);
    const subtotal = params.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
    const taxAmount = subtotal * ((params.taxPct ?? 0) / 100);
    const total = subtotal + taxAmount;

    const invoice = await db.invoice.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        salesOrderId: params.salesOrderId,
        accountId: params.accountId,
        number,
        currency: params.currency ?? "USD",
        subtotal,
        taxPct: params.taxPct ?? 0,
        taxAmount,
        total,
        dueDate: params.dueDate,
        notes: params.notes,
        lineItems: {
          create: params.lineItems.map((li, i) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            total: li.quantity * li.unitPrice,
            productId: li.productId,
            sortOrder: li.sortOrder ?? i,
          })),
        },
      },
      include: { lineItems: true },
    });

    // Create AR ledger entry
    await db.aRLedger.create({
      data: {
        companyId: params.companyId,
        invoiceId: invoice.id,
        accountId: params.accountId,
        amount: total,
        type: "CHARGE",
        reference: number,
      },
    });

    return invoice;
  },

  async issueInvoice(id: string, companyId: string) {
    const inv = await db.invoice.findFirst({ where: { id, companyId, status: "DRAFT" } });
    if (!inv) throw new Error("Invoice not found or not in DRAFT");
    return db.invoice.update({ where: { id }, data: { status: "ISSUED", issuedAt: new Date() } });
  },

  async recordPayment(id: string, companyId: string, amount: number, reference?: string) {
    const inv = await db.invoice.findFirst({ where: { id, companyId } });
    if (!inv) throw new Error("Invoice not found");

    const newPaid = inv.paidAmount + amount;
    const newStatus = newPaid >= inv.total ? "PAID" : "PARTIALLY_PAID";

    await db.$transaction([
      db.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaid,
          status: newStatus as any,
          ...(newStatus === "PAID" && { paidAt: new Date() }),
        },
      }),
      db.aRLedger.create({
        data: {
          companyId,
          invoiceId: id,
          accountId: inv.accountId,
          amount,
          type: "PAYMENT",
          reference,
        },
      }),
    ]);

    return db.invoice.findFirst({ where: { id } });
  },

  async voidInvoice(id: string, companyId: string) {
    const inv = await db.invoice.findFirst({ where: { id, companyId } });
    if (!inv) throw new Error("Invoice not found");
    if (inv.paidAmount > 0) throw new Error("Cannot void an invoice with payments");
    return db.invoice.update({ where: { id }, data: { status: "VOID", voidedAt: new Date() } });
  },

  // ─── AR Summary ───────────────────────────────────────────────────────────

  async getARSummary(companyId: string) {
    const now = new Date();
    const [current, overdue30, overdue60, overdue90plus] = await Promise.all([
      db.invoice.aggregate({
        where: {
          companyId,
          status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID"] },
          dueDate: { gte: now },
        },
        _sum: { total: true, paidAmount: true },
        _count: true,
      }),
      db.invoice.aggregate({
        where: {
          companyId,
          status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] },
          dueDate: { lt: now, gte: new Date(now.getTime() - 30 * 86400000) },
        },
        _sum: { total: true, paidAmount: true },
        _count: true,
      }),
      db.invoice.aggregate({
        where: {
          companyId,
          status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] },
          dueDate: { lt: new Date(now.getTime() - 30 * 86400000), gte: new Date(now.getTime() - 60 * 86400000) },
        },
        _sum: { total: true, paidAmount: true },
        _count: true,
      }),
      db.invoice.aggregate({
        where: {
          companyId,
          status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] },
          dueDate: { lt: new Date(now.getTime() - 60 * 86400000) },
        },
        _sum: { total: true, paidAmount: true },
        _count: true,
      }),
    ]);

    const balance = (agg: typeof current) =>
      (agg._sum.total ?? 0) - (agg._sum.paidAmount ?? 0);

    return {
      current: { balance: balance(current), count: current._count },
      overdue30: { balance: balance(overdue30), count: overdue30._count },
      overdue60: { balance: balance(overdue60), count: overdue60._count },
      overdue90plus: { balance: balance(overdue90plus), count: overdue90plus._count },
    };
  },

  // ─── AP Summary ───────────────────────────────────────────────────────────

  async getAPSummary(companyId: string) {
    // Approved POs not yet fully paid
    const pending = await db.purchaseOrder.aggregate({
      where: { companyId, status: { in: ["APPROVED", "PARTIALLY_RECEIVED", "RECEIVED"] } },
      _sum: { total: true },
      _count: true,
    });
    return {
      pendingAmount: pending._sum.total ?? 0,
      pendingCount: pending._count,
    };
  },

  // ─── Cash Flow ────────────────────────────────────────────────────────────

  async listCashFlow(params: {
    companyId: string; from?: Date; to?: Date; type?: "INFLOW" | "OUTFLOW";
  }) {
    return db.cashFlowEntry.findMany({
      where: {
        companyId: params.companyId,
        ...(params.type && { type: params.type }),
        ...(params.from || params.to
          ? { entryDate: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
          : {}),
      },
      orderBy: { entryDate: "desc" },
    });
  },

  async createCashFlowEntry(params: {
    companyId: string;
    type: "INFLOW" | "OUTFLOW";
    category: string;
    description: string;
    amount: number;
    currency?: string;
    entryDate: Date;
    reference?: string;
  }) {
    return db.cashFlowEntry.create({
      data: {
        companyId: params.companyId,
        type: params.type,
        category: params.category,
        description: params.description,
        amount: Math.abs(params.amount) * (params.type === "OUTFLOW" ? -1 : 1),
        currency: params.currency ?? "USD",
        entryDate: params.entryDate,
        reference: params.reference,
      },
    });
  },

  async getCashFlowSummary(companyId: string, months = 6) {
    const result = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`;

      const [inflow, outflow] = await Promise.all([
        db.cashFlowEntry.aggregate({
          where: { companyId, type: "INFLOW", entryDate: { gte: from, lte: to } },
          _sum: { amount: true },
        }),
        db.cashFlowEntry.aggregate({
          where: { companyId, type: "OUTFLOW", entryDate: { gte: from, lte: to } },
          _sum: { amount: true },
        }),
      ]);

      result.push({
        month: monthKey,
        inflow: inflow._sum.amount ?? 0,
        outflow: Math.abs(outflow._sum.amount ?? 0),
        net: (inflow._sum.amount ?? 0) + (outflow._sum.amount ?? 0),
      });
    }

    return result;
  },
};
