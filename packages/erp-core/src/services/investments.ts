import { db } from "@biogrow/database";
import type { Investment, InvestmentStatus, InvestmentType, InvestmentRisk } from "@prisma/client";

const OWNER_SELECT = { select: { id: true, name: true, avatarUrl: true } };

export type InvestmentWithOwner = Investment & {
  owner: { id: string; name: string; avatarUrl: string | null };
  transactions?: { id: string; type: string; amount: number; transactionDate: Date; description: string | null }[];
};

export type InvestmentSummary = {
  totalInvested: number;
  activeCount: number;
  plannedCount: number;
  completedCount: number;
  totalExpectedReturn: number;
  totalActualReturn: number;
  byType: { type: string; count: number; amount: number }[];
  byRisk: { risk: string; count: number; amount: number }[];
};

export type CreateInvestmentInput = {
  companyId: string;
  ownerId: string;
  name: string;
  type: InvestmentType;
  description?: string;
  amount: number;
  currency?: string;
  investedAt: Date;
  expectedReturn?: number;
  expectedRoiPct?: number;
  startDate?: Date;
  endDate?: Date;
  maturityDate?: Date;
  status?: InvestmentStatus;
  riskLevel?: InvestmentRisk;
  notes?: string;
};

export type UpdateInvestmentInput = Partial<Omit<CreateInvestmentInput, 'companyId' | 'ownerId'>> & {
  id: string;
  companyId: string;
};

export type CreateTransactionInput = {
  investmentId: string;
  type: "DISBURSEMENT" | "RETURN" | "ADJUSTMENT";
  amount: number;
  currency?: string;
  description?: string;
  transactionDate: Date;
};

async function generateInvestmentCode(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.investment.count({ where: { companyId } });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const investmentService = {
  // ─── List Investments ──────────────────────────────────────────────────────

  async list(params: {
    companyId: string;
    status?: InvestmentStatus;
    type?: InvestmentType;
    riskLevel?: InvestmentRisk;
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const { companyId, status, type, riskLevel, from, to, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status }),
      ...(type && { type }),
      ...(riskLevel && { riskLevel }),
      ...(from || to
        ? { investedAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    };

    const [total, investments] = await Promise.all([
      db.investment.count({ where }),
      db.investment.findMany({
        where,
        include: { owner: OWNER_SELECT },
        orderBy: { investedAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { investments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  // ─── Get Investment by ID ───────────────────────────────────────────────────

  async getById(id: string, companyId: string): Promise<InvestmentWithOwner | null> {
    return db.investment.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        transactions: {
          orderBy: { transactionDate: "desc" },
        },
      },
    });
  },

  // ─── Create Investment ──────────────────────────────────────────────────────

  async create(input: CreateInvestmentInput): Promise<Investment> {
    return db.investment.create({
      data: {
        companyId: input.companyId,
        ownerId: input.ownerId,
        name: input.name,
        type: input.type,
        description: input.description,
        amount: input.amount,
        currency: input.currency ?? "USD",
        investedAt: input.investedAt,
        expectedReturn: input.expectedReturn,
        expectedRoiPct: input.expectedRoiPct,
        startDate: input.startDate,
        endDate: input.endDate,
        maturityDate: input.maturityDate,
        status: input.status ?? "PLANNED",
        riskLevel: input.riskLevel ?? "MEDIUM",
        notes: input.notes,
      },
      include: { owner: OWNER_SELECT },
    });
  },

  // ─── Update Investment ──────────────────────────────────────────────────────

  async update(input: UpdateInvestmentInput): Promise<Investment> {
    const { id, companyId, ...data } = input;
    return db.investment.update({
      where: { id },
      data,
      include: { owner: OWNER_SELECT },
    });
  },

  // ─── Delete Investment ──────────────────────────────────────────────────────

  async delete(id: string, companyId: string): Promise<Investment> {
    // First delete all transactions
    await db.investmentTransaction.deleteMany({ where: { investmentId: id } });
    return db.investment.delete({ where: { id } });
  },

  // ─── Change Status ──────────────────────────────────────────────────────────

  async changeStatus(id: string, companyId: string, status: InvestmentStatus): Promise<Investment> {
    return db.investment.update({
      where: { id },
      data: { status },
      include: { owner: OWNER_SELECT },
    });
  },

  // ─── Record Actual Return ───────────────────────────────────────────────────

  async recordActualReturn(
    id: string,
    companyId: string,
    actualReturn: number,
    actualRoiPct: number
  ): Promise<Investment> {
    return db.investment.update({
      where: { id },
      data: {
        actualReturn,
        actualRoiPct,
        status: "COMPLETED",
        endDate: new Date(),
      },
      include: { owner: OWNER_SELECT },
    });
  },

  // ─── Add Transaction ─────────────────────────────────────────────────────────

  async addTransaction(input: CreateTransactionInput): Promise<{ id: string; type: string; amount: number; transactionDate: Date; description: string | null }> {
    return db.investmentTransaction.create({
      data: {
        investmentId: input.investmentId,
        type: input.type as any,
        amount: input.amount,
        currency: input.currency ?? "USD",
        description: input.description,
        transactionDate: input.transactionDate,
      },
    });
  },

  // ─── Get Summary ────────────────────────────────────────────────────────────

  async getSummary(companyId: string): Promise<InvestmentSummary> {
    const [totalInvested, counts, byType, byRisk] = await Promise.all([
      db.investment.aggregate({
        where: { companyId, status: { not: "CANCELLED" } },
        _sum: { amount: true },
      }),
      db.investment.groupBy({
        by: ["status"],
        where: { companyId },
        _count: true,
      }),
      db.investment.groupBy({
        by: ["type"],
        where: { companyId, status: { not: "CANCELLED" } },
        _sum: { amount: true },
        _count: true,
      }),
      db.investment.groupBy({
        by: ["riskLevel"],
        where: { companyId, status: { not: "CANCELLED" } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const statusCounts = counts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const [expectedReturnAgg, actualReturnAgg] = await Promise.all([
      db.investment.aggregate({
        where: { companyId, status: { not: "CANCELLED" } },
        _sum: { expectedReturn: true },
      }),
      db.investment.aggregate({
        where: { companyId, status: "COMPLETED" },
        _sum: { actualReturn: true },
      }),
    ]);

    return {
      totalInvested: totalInvested._sum.amount ?? 0,
      activeCount: statusCounts["ACTIVE"] ?? 0,
      plannedCount: statusCounts["PLANNED"] ?? 0,
      completedCount: statusCounts["COMPLETED"] ?? 0,
      totalExpectedReturn: expectedReturnAgg._sum.expectedReturn ?? 0,
      totalActualReturn: actualReturnAgg._sum.actualReturn ?? 0,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
        amount: item._sum.amount ?? 0,
      })),
      byRisk: byRisk.map((item) => ({
        risk: item.riskLevel,
        count: item._count,
        amount: item._sum.amount ?? 0,
      })),
    };
  },

  // ─── Get Investment Types ───────────────────────────────────────────────────

  getTypes(): { value: string; label: string }[] {
    return [
      { value: "EQUIPMENT", label: "Equipment" },
      { value: "PROPERTY", label: "Property" },
      { value: "TECHNOLOGY", label: "Technology" },
      { value: "RESEARCH", label: "Research & Development" },
      { value: "INVENTORY_EXPANSION", label: "Inventory Expansion" },
      { value: "MARKETING", label: "Marketing" },
      { value: "TRAINING", label: "Training" },
      { value: "OTHER", label: "Other" },
    ];
  },

  // ─── Get Risk Levels ────────────────────────────────────────────────────────

  getRiskLevels(): { value: string; label: string; color: string }[] {
    return [
      { value: "LOW", label: "Low", color: "emerald" },
      { value: "MEDIUM", label: "Medium", color: "amber" },
      { value: "HIGH", label: "High", color: "orange" },
      { value: "VERY_HIGH", label: "Very High", color: "rose" },
    ];
  },

  // ─── Get Statuses ───────────────────────────────────────────────────────────

  getStatuses(): { value: string; label: string; color: string }[] {
    return [
      { value: "PLANNED", label: "Planned", color: "gray" },
      { value: "ACTIVE", label: "Active", color: "blue" },
      { value: "ON_HOLD", label: "On Hold", color: "amber" },
      { value: "COMPLETED", label: "Completed", color: "emerald" },
      { value: "CANCELLED", label: "Cancelled", color: "red" },
      { value: "WRITTEN_OFF", label: "Written Off", color: "rose" },
    ];
  },
};