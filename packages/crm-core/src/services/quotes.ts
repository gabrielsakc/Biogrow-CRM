import { db } from "@biogrow/database";

export interface QuoteListParams {
  companyId: string;
  ownerId?: string;
  accountId?: string;
  opportunityId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface QuoteLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  sortOrder?: number;
}

export interface CreateQuoteParams {
  companyId: string;
  ownerId: string;
  accountId?: string;
  opportunityId?: string;
  currency?: string;
  discountPct?: number;
  taxPct?: number;
  validUntil?: Date;
  notes?: string;
  terms?: string;
  lineItems: QuoteLineItemInput[];
}

export interface UpdateQuoteParams {
  currency?: string;
  discountPct?: number;
  taxPct?: number;
  validUntil?: Date;
  notes?: string;
  terms?: string;
  accountId?: string;
  opportunityId?: string;
  lineItems?: QuoteLineItemInput[];
}

function computeTotals(
  lineItems: QuoteLineItemInput[],
  discountPct: number,
  taxPct: number
) {
  const subtotal = lineItems.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPct ?? 0) / 100);
    return sum + lineTotal;
  }, 0);
  const afterDiscount = subtotal * (1 - discountPct / 100);
  const total = afterDiscount * (1 + taxPct / 100);
  return { subtotal, total };
}

async function generateQuoteNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.quote.count({
    where: {
      companyId,
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `Q-${year}-${seq}`;
}

const QUOTE_INCLUDE = {
  owner: { select: { id: true, name: true, avatarUrl: true } },
  account: { select: { id: true, name: true } },
  opportunity: { select: { id: true, name: true } },
  lineItems: { orderBy: { sortOrder: "asc" as const } },
} as const;

export const quotesService = {
  async list(params: QuoteListParams) {
    const { companyId, ownerId, accountId, opportunityId, status, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(ownerId && { ownerId }),
      ...(accountId && { accountId }),
      ...(opportunityId && { opportunityId }),
      ...(status && { status }),
    };

    const [total, quotes] = await Promise.all([
      db.quote.count({ where }),
      db.quote.findMany({
        where,
        include: QUOTE_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { quotes, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string) {
    return db.quote.findUnique({ where: { id }, include: QUOTE_INCLUDE });
  },

  async create(params: CreateQuoteParams) {
    const { lineItems, discountPct = 0, taxPct = 0, ...rest } = params;
    const number = await generateQuoteNumber(params.companyId);
    const { subtotal, total } = computeTotals(lineItems, discountPct, taxPct);

    return db.quote.create({
      data: {
        ...rest,
        number,
        discountPct,
        taxPct,
        subtotal,
        total,
        lineItems: {
          create: lineItems.map((item, idx) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPct: item.discountPct ?? 0,
            total: item.quantity * item.unitPrice * (1 - (item.discountPct ?? 0) / 100),
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
      include: QUOTE_INCLUDE,
    });
  },

  async update(id: string, params: UpdateQuoteParams) {
    const existing = await db.quote.findUniqueOrThrow({ where: { id }, include: { lineItems: true } });

    const lineItems = params.lineItems ?? existing.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      discountPct: li.discountPct,
      sortOrder: li.sortOrder,
    }));
    const discountPct = params.discountPct ?? existing.discountPct;
    const taxPct = params.taxPct ?? existing.taxPct;
    const { subtotal, total } = computeTotals(lineItems, discountPct, taxPct);

    return db.$transaction(async (tx) => {
      if (params.lineItems) {
        await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
      }
      return tx.quote.update({
        where: { id },
        data: {
          ...(params.currency !== undefined && { currency: params.currency }),
          ...(params.accountId !== undefined && { accountId: params.accountId }),
          ...(params.opportunityId !== undefined && { opportunityId: params.opportunityId }),
          ...(params.validUntil !== undefined && { validUntil: params.validUntil }),
          ...(params.notes !== undefined && { notes: params.notes }),
          ...(params.terms !== undefined && { terms: params.terms }),
          discountPct,
          taxPct,
          subtotal,
          total,
          ...(params.lineItems && {
            lineItems: {
              create: params.lineItems.map((item, idx) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPct: item.discountPct ?? 0,
                total: item.quantity * item.unitPrice * (1 - (item.discountPct ?? 0) / 100),
                sortOrder: item.sortOrder ?? idx,
              })),
            },
          }),
        },
        include: QUOTE_INCLUDE,
      });
    });
  },

  async send(id: string) {
    return db.quote.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
      include: QUOTE_INCLUDE,
    });
  },

  async markAccepted(id: string) {
    return db.quote.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
      include: QUOTE_INCLUDE,
    });
  },

  async markRejected(id: string) {
    return db.quote.update({
      where: { id },
      data: { status: "REJECTED", rejectedAt: new Date() },
      include: QUOTE_INCLUDE,
    });
  },

  async delete(id: string) {
    return db.quote.delete({ where: { id } });
  },
};
